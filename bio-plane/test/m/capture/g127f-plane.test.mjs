/* capture, T51 fix round 9, G127f, platform check L (R113; K4838 (6), K4891): the multipart path under Miniflare, over REAL R2 and REAL Durable Object SQLite, the
   parts at the real part size (16 MiB, over R2's 5 MiB minimum): a file past the request-body ceiling is begun, sent part by part in separate requests, and
   completed into ONE object under the whole's digest; an abandoned upload holds nothing; a part under R2's own minimum is refused by R2 at the completion. What is
   asserted is what the answers say and what the bucket then holds. The route through the door (control-plane's ops) is not here: it is the seam's. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const SRC = fileURLToPath(new URL("./g127f-worker.mjs", import.meta.url));
const MiB = 1024 * 1024;
const STATEMENT = "a file the clerk handed me at the counter";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { PROBE: { className: "Probe", useSQLite: true } }, r2Buckets: ["CAPTURES"],
});
after(() => mf.dispose());
const call = async (cmd, params = {}, body = null) => {
  const q = new URLSearchParams({ cmd, ...params });
  const r = await mf.dispatchFetch(`https://probe.example/?${q}`, body === null ? {} : { method: "POST", body: body instanceof Uint8Array ? body : JSON.stringify(body) });
  return await r.json();
};
/* A part the door answers WITHOUT reading its body (a part already put: `existed`; an upload that is gone: `UPLOAD_UNKNOWN`) is answered at once and the connection closed with the body unread, which is
   workerd's way with an unread request body. A client still writing 8-16 MiB when that close lands gets `write ECONNRESET` instead of the answer, whenever the machine is slow enough to
   be still writing (a harness race, not the door's answer: the answer is given before the body is read, so no byte of it is asked for). The request for such an answer therefore carries one byte,
   which the socket takes whole before any answer can come; what is asserted is the answer. */
const unread = (cmd, params) => call(cmd, params, new Uint8Array(1));
const varied = (n, seed) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (seed + (i % 251) + Math.floor(i / 4999)) & 255; return b; };
const partsOf = (bytes, size) => { const out = []; for (let at = 0; at < bytes.length; at += size) out.push(bytes.subarray(at, Math.min(at + size, bytes.length))); return out; };

test("R113 (L): a 105 MiB file is begun, its seven 16 MiB parts sent in separate requests and completed into one object under the whole's digest, with one receipt and the document naming no parts", { timeout: 600000 }, async () => {
  const file = varied(105 * MiB, 3), whole = sha(file);
  const b = await call("begin", {}, { sha256: whole, bytes: file.length, statement: STATEMENT });
  assert.deepEqual([b.ok, b.part_bytes, b.parts, b.held], [true, 16 * MiB, 7, false], JSON.stringify(b).slice(0, 300));
  const ps = partsOf(file, b.part_bytes);
  for (let i = 0; i < ps.length; i++) {
    const r = await call("part", { upload: b.upload, index: String(i), sha256: sha(ps[i]) }, ps[i]);
    assert.equal(r.ok, true, `part ${i}: ${JSON.stringify(r).slice(0, 300)}`);
    assert.equal(r.next, i + 1);
  }
  /* a part put again is idempotent */
  const again = await unread("part", { upload: b.upload, index: "2", sha256: sha(ps[2]) });
  assert.deepEqual([again.ok, again.existed], [true, true]);
  const before = await call("state", { sha256: whole });
  assert.equal(before.size, null, "nothing is held under the digest until the completion");
  const done = await call("complete", {}, { upload: b.upload, parts: ps.map((p) => sha(p)) });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 400));
  assert.deepEqual([done.capture.sha256, done.capture.bytes, done.document.capture.sha256, "parts" in done.document], [whole, file.length, whole, false]);
  const post = await call("state", { sha256: whole });
  assert.deepEqual([post.size, post.objects, post.receipts, post.rows], [file.length, [`bio/captures/${whole}`], [whole], 0], "one object, one receipt, no session left");
});

test("R113 (L): a part under R2's own minimum, sent as a non-last part, is refused by R2 at the completion: the upload is aborted and holds nothing (the figure R2 holds is 5 MiB; the parts of the real route are 16 MiB)", { timeout: 300000 }, async () => {
  const file = varied(7 * MiB, 5), whole = sha(file);
  /* a scaled part of 1 MiB, which only a test may ask for: R2 refuses seven parts of 1 MiB when it is asked to complete them */
  const b = await call("begin", {}, { sha256: whole, bytes: file.length, statement: STATEMENT, bounds: { request: MiB } });
  assert.deepEqual([b.ok, b.part_bytes, b.parts], [true, MiB, 7]);
  const ps = partsOf(file, b.part_bytes);
  for (let i = 0; i < ps.length; i++) assert.equal((await call("part", { upload: b.upload, index: String(i), sha256: sha(ps[i]) }, ps[i])).ok, true);
  const done = await call("complete", {}, { upload: b.upload, parts: ps.map((p) => sha(p)) });
  assert.deepEqual([done.ok, done.reason, done.status], [false, "UPLOAD_NOT_COMPLETED", 502], JSON.stringify(done).slice(0, 300));
  const st = await call("state", { sha256: whole });
  assert.deepEqual([st.size, st.rows, st.receipts.includes(whole)], [null, 0, false], "nothing held, no session, no receipt for it");
});

test("R113 (L): an upload abandoned part-way is aborted by the member and holds nothing; its parts were never an object", { timeout: 300000 }, async () => {
  const file = varied(40 * MiB, 7), whole = sha(file);
  const b = await call("begin", {}, { sha256: whole, bytes: file.length, statement: STATEMENT });
  const ps = partsOf(file, b.part_bytes);
  assert.equal((await call("part", { upload: b.upload, index: "0", sha256: sha(ps[0]) }, ps[0])).ok, true);
  assert.equal((await call("part", { upload: b.upload, index: "1", sha256: sha(ps[1]) }, ps[1])).ok, true);
  assert.deepEqual(await call("abort", { upload: b.upload }), { ok: true, aborted: true });
  const st = await call("state", { sha256: whole });
  assert.deepEqual([st.size, st.rows], [null, 0]);
  const late = await unread("part", { upload: b.upload, index: "2", sha256: sha(ps[2]) });
  assert.equal(late.reason, "UPLOAD_UNKNOWN");
});
