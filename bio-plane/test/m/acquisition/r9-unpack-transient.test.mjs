/* acquisition R121 (T51 fix round 9, G129e, X20; DOCS A11, A10; amends R38): A TRANSIENT STORE FAILURE NEVER FILES A MEMBER `not_filed`.
   A put that fails for one member leaves that entry with no outcome (counted in `waiting`); the next call cuts it again and files it.
   A member larger than one part is also kept whole under its own digest and read whole by `readRange` (R113). A corrupt member is
   still `not_filed` as MEMBER_CORRUPT (control). The archive is made by the real `acquire` entry path. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { unpack, readRange } from "../../../src/acquisition/index.mjs";

const URL1 = "https://files.example/bundle.zip";
const zipRes = (bytes) => () => new Response(bytes, { headers: { "content-type": "application/zip" } });
const names = Array.from({ length: 6 }, (_, i) => `m${i}.txt`);
const members = names.map((n, i) => ({ name: n, data: `member number ${i} `.repeat(20 + i) }));
const recorded = (w, s) => w.rows("SELECT idx, state, code FROM archive_entries WHERE archive_sha=? AND idx>=0 ORDER BY idx", s);

test("R121 (DOCS A11): a put that fails for entry 3 leaves it with no outcome, counted in waiting; the next call files it, and the others are untouched", async () => {
  const w = world();
  const z = makeZip(members);
  const target = new TextEncoder().encode(members[3].data);
  const real = w.b.put.bind(w.b);
  let refuse = true;
  w.b.put = async (k, bytes, o) => {
    if (refuse && bytes.length === target.length && Buffer.compare(Buffer.from(bytes), Buffer.from(target)) === 0) throw new Error("bucket hiccup");
    return real(k, bytes, o);
  };
  const r = await run(w, { [URL1]: zipRes(z) }, { locator: URL1 }, { settle: false, sessMember: "m1", cls: "member" });
  assert.equal(r.status, 200);
  const first = r.body.unpack;
  assert.equal(first.ok, true);
  assert.equal(first.waiting, 1, "the failed entry is counted in waiting");
  assert.equal(first.complete, false);
  assert.equal(first.not_filed.length, 0, "a store failure files nothing not_filed");
  assert.equal(first.documents.length, 5);
  const archive = first.archive.sha256;
  const state = recorded(w, archive).map((x) => x.state);
  assert.deepEqual(state, ["filed", "filed", "filed", "waiting", "filed", "filed"]);
  refuse = false;
  const again = await unpack(w.store, { archiveSha: archive, by: "m1", cls: "member", member: true });
  assert.equal(again.ok, true);
  assert.equal(again.complete, true);
  assert.equal(again.documents.length, 1);
  assert.equal(again.documents[0].capture.sha256, sha(target));
  assert.deepEqual(recorded(w, archive).map((x) => x.state), Array(6).fill("filed"));
});

test("R121 (DOCS A10): a member over one part is kept whole under its own digest as well as in parts, and readRange reads it whole across the seam", async () => {
  const w = world();
  const uploads = new Map();
  w.b.createMultipartUpload = async (key) => { const parts = []; uploads.set(key, parts);
    return { uploadPart: async (n, bytes) => { parts[n - 1] = new Uint8Array(bytes); return { partNumber: n }; },
             complete: async () => { w.b.held.set(key, new Uint8Array(Buffer.concat(parts))); }, abort: async () => {} }; };
  const big = new Uint8Array(9 * 1024 * 1024).map((_, i) => (i * 2654435761) >>> 24);
  const z = makeZip([{ name: "big.bin", data: big, method: 0 }, { name: "small.txt", data: "s" }]);
  const r = await run(w, { [URL1]: zipRes(z) }, { locator: URL1 });
  const doc = r.body.unpack.documents.find((d) => d.container.path === "big.bin");
  assert.equal(doc.capture.sha256, sha(big));
  assert.ok(doc.parts.length === 2, "the member is stored in two parts");
  assert.equal(w.held(sha(big)), true, "and held whole under its own digest");
  const across = await readRange(w.store, sha(big), 8 * 1024 * 1024 - 10, 20);
  assert.deepEqual(Buffer.from(across), Buffer.from(big.subarray(8 * 1024 * 1024 - 10, 8 * 1024 * 1024 + 10)));
});

test("R121 (control): a corrupt member is still not_filed as MEMBER_CORRUPT, and stays so (a deterministic verdict is not retried)", async () => {
  const w = world();
  const marker = "CORRUPTME-".repeat(10);
  const z = makeZip([{ name: "a.txt", data: "fine" }, { name: "bad.txt", data: marker, method: 0 }]);
  const at = Buffer.from(z).indexOf(marker);
  z[at + 3] ^= 0x55;
  const r = await run(w, { [URL1]: zipRes(z) }, { locator: URL1 });
  const u = r.body.unpack;
  assert.equal(u.not_filed.length, 1);
  assert.equal(u.not_filed[0].code, "MEMBER_CORRUPT");
  assert.equal(u.complete, true);
});
