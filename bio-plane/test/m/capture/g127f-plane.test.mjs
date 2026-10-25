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
  const again = await call("part", { upload: b.upload, index: "2", sha256: sha(ps[2]) }, ps[2]);
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
  const late = await call("part", { upload: b.upload, index: "2", sha256: sha(ps[2]) }, ps[2]);
  assert.equal(late.reason, "UPLOAD_UNKNOWN");
});

test("R113 (L, G173): an upload survives the object being taken out of memory between two parts: begin, part 0, a pause of 12 s (past the platform's window of about 10 s with no event), part 1 accepted by a new object, and the completion's digest is the declared one; a wrong part is still refused", { timeout: 300000 }, async () => {
  const file = varied(20 * MiB, 9), whole = sha(file);
  const b = await call("begin", {}, { sha256: whole, bytes: file.length, statement: STATEMENT });
  assert.deepEqual([b.ok, b.part_bytes, b.parts], [true, 16 * MiB, 2], JSON.stringify(b).slice(0, 300));
  const ps = partsOf(file, b.part_bytes);
  assert.equal((await call("part", { upload: b.upload, index: "0", sha256: sha(ps[0]) }, ps[0])).ok, true);
  const before = (await call("state", { sha256: whole })).inst;
  await new Promise((r) => setTimeout(r, 12000));
  /* the control that the object was taken out of memory: the one that answers now is not the one that took part 0 */
  const after = (await call("state", { sha256: whole })).inst;
  assert.notEqual(after, before, "workerd took the object out of memory during the pause");
  const wrong = await call("part", { upload: b.upload, index: "1", sha256: sha(ps[1]) }, varied(ps[1].length, 77));
  assert.deepEqual([wrong.ok, wrong.reason], [false, "PART_DIGEST_MISMATCH"]);
  const r1 = await call("part", { upload: b.upload, index: "1", sha256: sha(ps[1]) }, ps[1]);
  assert.deepEqual([r1.ok, r1.next], [true, 2], JSON.stringify(r1).slice(0, 300));
  const done = await call("complete", {}, { upload: b.upload, parts: ps.map((p) => sha(p)) });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 400));
  assert.deepEqual([done.capture.sha256, done.capture.bytes], [whole, file.length]);
  const post = await call("state", { sha256: whole });
  assert.deepEqual([post.size, post.rows], [file.length, 0]);
});

/* G176 (K5005): an answer given without keeping the part is given after the part's body is read and discarded, so a client still sending reads the JSON answer
   and never a closed connection (`fetch failed / write ECONNRESET`). Each case sends the FULL 16 MiB part, twenty times. */
const REPEAT = 20;

test("R113 (L, G176): the re-put of a held 16 MiB part, sent whole twenty times, reads its JSON answer `existed` every time", { timeout: 600000 }, async () => {
  const file = varied(20 * MiB, 11), whole = sha(file);
  const b = await call("begin", {}, { sha256: whole, bytes: file.length, statement: STATEMENT });
  const ps = partsOf(file, b.part_bytes);
  assert.equal(ps[0].length, 16 * MiB);
  assert.equal((await call("part", { upload: b.upload, index: "0", sha256: sha(ps[0]) }, ps[0])).ok, true);
  for (let i = 0; i < REPEAT; i++) {
    const again = await call("part", { upload: b.upload, index: "0", sha256: sha(ps[0]) }, ps[0]);
    assert.deepEqual([again.ok, again.existed, again.next], [true, true, 1], `re-put ${i}: ${JSON.stringify(again).slice(0, 200)}`);
  }
  /* control: a part put again with other bytes is still refused, whole body read */
  const other = await call("part", { upload: b.upload, index: "0", sha256: sha(varied(16 * MiB, 99)) }, varied(16 * MiB, 99));
  assert.deepEqual([other.ok, other.reason], [false, "PART_CONFLICT"]);
  assert.deepEqual(await call("abort", { upload: b.upload }), { ok: true, aborted: true });
});

test("R113 (L, G176): a 16 MiB part sent late, after the upload was aborted, sent whole twenty times, reads its JSON answer `UPLOAD_UNKNOWN` every time", { timeout: 600000 }, async () => {
  const file = varied(20 * MiB, 13), whole = sha(file);
  const b = await call("begin", {}, { sha256: whole, bytes: file.length, statement: STATEMENT });
  const ps = partsOf(file, b.part_bytes);
  assert.deepEqual(await call("abort", { upload: b.upload }), { ok: true, aborted: true });
  for (let i = 0; i < REPEAT; i++) {
    const late = await call("part", { upload: b.upload, index: "0", sha256: sha(ps[0]) }, ps[0]);
    assert.deepEqual([late.ok, late.reason], [false, "UPLOAD_UNKNOWN"], `late part ${i}: ${JSON.stringify(late).slice(0, 200)}`);
  }
});

test("R113 (L, G176): a body larger than the part size is still cut at the part size: a 17 MiB body to a 16 MiB part is refused PART_SIZE (413) or its connection closed, nothing stored", { timeout: 300000 }, async () => {
  const file = varied(20 * MiB, 15), whole = sha(file);
  const b = await call("begin", {}, { sha256: whole, bytes: file.length, statement: STATEMENT });
  const big = varied(17 * MiB, 15);
  let r = null;
  try { r = await call("part", { upload: b.upload, index: "0", sha256: sha(big) }, big); } catch { r = null; }
  if (r) assert.deepEqual([r.ok, r.reason, r.status], [false, "PART_SIZE", 413]);
  const st = await call("state", { sha256: whole });
  assert.equal(st.size, null);
  assert.deepEqual(await call("abort", { upload: b.upload }), { ok: true, aborted: true });
});

test("R113 (fix round 10, cause 29; P): the founder's stamp begins a parted upload on R2's own multipart, puts its parts in separate requests and completes it into one object, the receipt naming the founder; another it aborts holds nothing", { timeout: 300000 }, async () => {
  const file = varied(11 * MiB, 29), whole = sha(file), by = "admin";
  const b = await call("begin", { by }, { sha256: whole, bytes: file.length, statement: STATEMENT, bounds: { request: 5 * MiB } });
  assert.deepEqual([b.ok, b.part_bytes, b.parts], [true, 5 * MiB, 3], JSON.stringify(b).slice(0, 300));
  const ps = partsOf(file, b.part_bytes);
  for (let i = 0; i < ps.length; i++) assert.equal((await call("part", { by, upload: b.upload, index: String(i), sha256: sha(ps[i]) }, ps[i])).ok, true);
  const done = await call("complete", { by }, { upload: b.upload, parts: ps.map((p) => sha(p)) });
  assert.equal(done.ok, true, JSON.stringify(done).slice(0, 300));
  assert.equal(done.capture.sha256, whole);
  const post = await call("state", { sha256: whole });
  assert.deepEqual([post.size, post.objects.filter((k) => k === `bio/captures/${whole}`), post.receipts.filter((r) => r === whole), post.rows], [file.length, [`bio/captures/${whole}`], [whole], 0], "one object and one receipt under the whole, no session left (the Worker is shared with the tests above)");
  const other = varied(6 * MiB, 30);
  const o = await call("begin", { by }, { sha256: sha(other), bytes: other.length, statement: STATEMENT, bounds: { request: 5 * MiB } });
  assert.equal(o.ok, true);
  assert.equal((await call("part", { by, upload: o.upload, index: "0", sha256: sha(partsOf(other, 5 * MiB)[0]) }, partsOf(other, 5 * MiB)[0])).ok, true);
  assert.deepEqual(await call("abort", { by, upload: o.upload }), { ok: true, aborted: true });
  const after = await call("state", { sha256: sha(other) });
  assert.deepEqual([after.size, after.rows], [null, 0]);
});
