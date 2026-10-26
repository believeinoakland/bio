/* capture, T51 fix round 7, G79 (R103 amended; the walker's A.md:12, :13, :29): an upload held in parts is answered once its parts are stored.
   At the module's interface (`uploadCapture`, record-core's real evidence store, a bucket charging R2-like latency on a clock the TEST owns,
   R-CLOCK): no part is read back from the store, the whole is put once, and a keep past `MULTIPART_KEEP_MAX` is handed to the plane's ledger at
   once and not awaited. Red before the change: the parts were read back (`get` of every part) and the large keep was awaited. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { MULTIPART_KEEP_MAX } from "../../../src/acquisition/index.mjs";

const MiB = 1024 * 1024;
const STATEMENT = "a file the clerk handed me at the counter";
const AT = "2026-10-23T12:00:00Z";
const varied = (n, seed = 1) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (Math.floor(i / (8 * MiB)) * 37 + seed + (i % 251)) & 255; return b; };
/* the stream a request body is: chunks of 1 MiB */
const streamOf = (bytes, chunk = MiB) => { let at = 0; return new ReadableStream({ pull(c) { if (at >= bytes.length) c.close(); else { c.enqueue(bytes.subarray(at, Math.min(at + chunk, bytes.length))); at += chunk; } } }, { highWaterMark: 0 }); };
/* R2's multipart upload, which record-core's putFromParts uses */
const withMultipart = (b) => {
  b.createMultipartUpload = async (key) => {
    const parts = [];
    return { uploadPart: async (n, bytes) => { parts[n - 1] = new Uint8Array(bytes); return { partNumber: n }; },
             complete: async () => { b.held.set(key, new Uint8Array(Buffer.concat(parts))); }, abort: async () => {} };
  };
  return b;
};
/* a bucket that charges 400 to 800 ms (by size) to a virtual clock for every get and put, so the TEST can state the time the store cost */
const slowBucket = () => {
  const b = withMultipart(bucket());
  const clock = { ms: 0 };
  const cost = (bytes) => 400 + Math.round(400 * Math.min(1, bytes / (8 * MiB)));
  const put = b.put.bind(b), get = b.get.bind(b);
  b.put = async (k, bytes, o) => { clock.ms += cost(bytes.length); return put(k, bytes, o); };
  b.get = async (k, o) => { const r = await get(k, o); if (r) clock.ms += cost(o && o.range ? Math.min(o.range.length, r.size) : r.size); return r; };
  b.clock = clock;
  return b;
};
const setup = (b = slowBucket()) => ({ ...fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } }), b });
const up = (c, bytes, extra = {}) => c.uploadCapture({ bytes: streamOf(bytes), statement: STATEMENT, by: "m1", at: AT, ...extra });
const wholeKey = (big) => `bio/captures/${sha(big)}`;
const count = (b, what) => b.calls.filter((x) => x[0] === what).length;
/* a `get` that asks for the whole object (no range): acquisition's R101 judges an upload's format by ranged reads of its head, which are no read-back of a part */
const wholeGets = (b) => b.calls.filter((x) => x[0] === "get" && !x[2]).length;

test("R103 (G79): a 24 MiB upload in three parts reads no part back: the store is asked for no whole-part `get`, each part is put once and the whole once, and the whole is held under its digest", async () => {
  const { c, b } = setup();
  const big = varied(24 * MiB, 3);
  const r = await up(c, big);
  assert.equal(r.ok, true);
  assert.equal(r.document.parts.length, 3);
  assert.equal(wholeGets(b), 0, "a part was read back from the store");
  assert.equal(b.calls.filter((x) => x[0] === "put").length, 4, "three parts and the whole, each put once");
  assert.equal(sha(b.held.get(wholeKey(big))), sha(big), "and the whole is the bytes uploaded");
  /* the store's cost on the test's own clock */
  /* three parts and the whole, and the one ranged read of the head that acquisition's R101 makes (about 450 ms); the old path added three whole-part gets (2,400 ms) */
  assert.ok(b.clock.ms <= 4 * 800 + 500, `the store cost ${b.clock.ms} ms on the test's clock`);
});

test("R103 (G79): 17 MiB in three parts (2 MiB in the last) and exactly 32 MiB in four parts are kept whole the same way; one part and two parts as before", async () => {
  for (const size of [17 * MiB, MULTIPART_KEEP_MAX, 9 * MiB]) {
    const { c, b } = setup();
    const big = varied(size, 5);
    const r = await up(c, big);
    assert.equal(r.ok, true);
    assert.equal(wholeGets(b), 0, `${size}: no part read back`);
    assert.equal(sha(b.held.get(wholeKey(big))), sha(big), `${size}: the whole is held`);
  }
  const { c, b } = setup();
  const small = varied(3 * MiB, 6);
  const r = await up(c, small);
  assert.equal(r.ok, true);
  assert.equal(b.held.has(wholeKey(small)), true, "one part is its own whole");
});

test("R103 (G79): a 40 MB upload in five parts is answered once its parts are stored when the plane's ledger takes the keep: the upload asks the store for no whole and the ledger is handed the digest and the parts", async () => {
  const { c, b, core } = setup();
  const given = [];
  // fixtures-contract: plane keep-later
  c.keepLater = async (k) => { given.push(k); return { ok: true }; };
  const real = core.evidenceStore();
  let asked = 0;
  core.evidenceStore = () => ({ ...real, putFromParts: async (d, p) => { asked++; return new Promise(() => {}); } });
  const big = varied(39867294, 7);
  const r = await up(c, big, { boundMs: 25000 });
  assert.equal(r.ok, true);
  assert.equal(r.document.parts.length, 5);
  assert.equal(r.keep_pending, true);
  assert.equal(asked, 0, "the upload awaited a keep it had handed over");
  assert.equal(wholeGets(b), 0);
  assert.deepEqual(given, [{ sha: sha(big), parts: r.document.parts.map((p) => p.sha256) }]);
  /* the parts are stored and named by the document: the file is filed in them */
  for (const p of r.document.parts) assert.equal(b.held.has(`bio/captures/${p.sha256}`), true);
});

test("R103 (G79 controls): a mislabelled or refused upload is judged as before: a refusal writes nothing and an upload over the capture limit is cancelled", async () => {
  const { c, b } = setup();
  const r = await c.uploadCapture({ bytes: streamOf(varied(10 * MiB)), statement: "", by: "m1" });
  assert.equal(r.reason, "UPLOAD_NO_STATEMENT");
  assert.equal(b.calls.length, 0, "nothing was stored");
});
