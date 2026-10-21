/* record-core R87 (T51, fix round 3, C5; K4363; acquisition R96): `evidenceStore().putFromParts(digest, partDigests)` makes
   the whole object under `digest` from parts the store holds, by the store's own multipart upload, one part in memory at a
   time, completing only when the bytes hash to `digest`. R38 is unchanged: `{head, get, put}` beside the new call, and
   none bound is still null. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { recordOf, RECORD_CORE_CHECKS } from "../../../src/record-core/index.mjs";
import { storage, bucket, multipartBucket } from "./storage.mjs";

const MiB = 1024 * 1024;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const fresh = (opts) => { const s = storage(); const rc = recordOf({ storage: s }, opts); rc.migrate(); return { s, rc }; };
const KEY = "bio/captures/";

/* a 40 MiB document in three parts (14, 14 and 12 MiB), each stored in the bucket under its own digest as acquisition
   stores them, and the digest of the whole */
function held(b, sizes = [14 * MiB, 14 * MiB, 12 * MiB]) {
  const whole = new Uint8Array(sizes.reduce((a, c) => a + c, 0));
  for (let i = 0; i < whole.length; i++) whole[i] = (i * 31 + (i >> 11)) & 255;
  const parts = []; let at = 0;
  for (const n of sizes) { const p = whole.slice(at, at + n); at += n; b.held.set(`${KEY}${sha(p)}`, p); parts.push(sha(p)); }
  return { whole, digest: sha(whole), parts };
}
const store = (b) => fresh({ evidence: b, evidencePrefix: KEY }).rc.evidenceStore();

test("R87 R38: three parts of a 40 MiB document make one object whose bytes hash to the digest, no more than one part held at a time", async () => {
  const b = multipartBucket();
  const { whole, digest, parts } = held(b);
  const r = await store(b).putFromParts(digest, parts);
  assert.deepEqual(r, { ok: true, size: 40 * MiB });
  assert.equal(sha(b.held.get(`${KEY}${digest}`)), digest, "the object is the whole, under the digest, at the module's key");
  assert.equal(Buffer.compare(Buffer.from(b.held.get(`${KEY}${digest}`)), Buffer.from(whole)), 0);
  assert.equal(b.state.peak, 1, "never more than one part out of the store and not yet in the upload");
  assert.deepEqual([b.state.begun, b.state.completed, b.state.aborted], [1, 1, 0]);
  assert.deepEqual(b.state.uploaded.map((u) => u.slice(1)), [[1, 14 * MiB], [2, 14 * MiB], [3, 12 * MiB]], "one upload part each, in order");
});

test("R87: a digest that the parts do not hash to aborts the upload and leaves nothing", async () => {
  const b = multipartBucket();
  const { parts } = held(b);
  const wrong = sha("not this document");
  const r = await store(b).putFromParts(wrong, parts);
  assert.equal(r.ok, false);
  assert.equal(r.code, "EVIDENCE_DIGEST_MISMATCH");
  assert.equal(r.check, RECORD_CORE_CHECKS.EVIDENCE_DIGEST_MISMATCH.check);
  assert.equal(typeof r.detail, "string"); assert.ok(r.detail.length > 0);
  assert.deepEqual([b.state.begun, b.state.completed, b.state.aborted], [1, 0, 1]);
  assert.equal(b.held.has(`${KEY}${wrong}`), false, "nothing written under the digest");
  assert.equal(b.state.peak, 1);
});

test("R87: a part the store does not hold is refused naming its place, the upload aborted and nothing written", async () => {
  const b = multipartBucket();
  const { digest, parts } = held(b);
  const gone = [parts[0], sha("a part nobody stored"), parts[2]];
  const r = await store(b).putFromParts(digest, gone);
  assert.equal(r.ok, false);
  assert.equal(r.code, "EVIDENCE_PART_MISSING");
  assert.equal(r.part, 2, "the part's place, counted from one");
  assert.deepEqual([b.state.completed, b.state.aborted], [0, b.state.begun]);
  assert.equal(b.held.has(`${KEY}${digest}`), false);
});

test("R87: the store's own refusal (a part below its minimum, a completion that fails) is refused, aborted, written nowhere", async () => {
  const small = multipartBucket({ minPart: 5 * MiB });
  const { digest, parts } = held(small, [1 * MiB, 1 * MiB, 1 * MiB]);
  const r = await store(small).putFromParts(digest, parts);
  assert.equal(r.ok, false); assert.equal(r.code, "EVIDENCE_STORE_REFUSED");
  assert.match(r.detail, /minimum part size/, "the store's own words are carried");
  assert.equal(small.held.has(`${KEY}${digest}`), false);
  assert.equal(small.state.completed, 0);
  const broke = multipartBucket({ failComplete: "R2 is down" });
  const h = held(broke, [1 * MiB, 1 * MiB]);
  const r2 = await store(broke).putFromParts(h.digest, h.parts);
  assert.equal(r2.code, "EVIDENCE_STORE_REFUSED");
  assert.equal(broke.held.has(`${KEY}${h.digest}`), false);
});

test("R87: a digest already held answers already, begins no upload and reads no part (control)", async () => {
  const b = multipartBucket();
  const { whole, digest, parts } = held(b, [1 * MiB, 1 * MiB]);
  b.held.set(`${KEY}${digest}`, whole);
  const getsBefore = b.calls.filter((c) => c[0] === "get").length;
  const r = await store(b).putFromParts(digest, parts);
  assert.deepEqual(r, { ok: true, already: true });
  assert.equal(b.state.begun, 0);
  assert.equal(b.calls.filter((c) => c[0] === "get").length, getsBefore);
});

test("R87: a call that is not a digest and a list of part digests is refused, nothing begun", async () => {
  const b = multipartBucket();
  const ev = store(b);
  const d = sha("x");
  for (const bad of [[null, [d]], ["ABC", [d]], [d, []], [d, "nope"], [d, [d, "short"]], [d, [d.toUpperCase()]]]) {
    const r = await ev.putFromParts(...bad);
    assert.equal(r.ok, false, JSON.stringify(bad)); assert.equal(r.code, "EVIDENCE_PARTS_MALFORMED");
  }
  assert.equal(b.state.begun, 0);
});

test("R38 R87: head, get and put are unchanged, none bound is still null, and a bucket without multipart upload offers no putFromParts", async () => {
  assert.equal(fresh().rc.evidenceStore(), null);
  const plain = bucket();
  const ev = store(plain);
  assert.deepEqual(Object.keys(ev).sort(), ["get", "head", "put"], "the plain bucket's store keeps R38's three calls");
  const mp = store(multipartBucket());
  assert.deepEqual(Object.keys(mp).sort(), ["get", "head", "put", "putFromParts"]);
});

test("R87: the rows of its refusals are this module's, the next free numbers of C-102, each a member's sentence", () => {
  const codes = ["EVIDENCE_PARTS_MALFORMED", "EVIDENCE_PART_MISSING", "EVIDENCE_DIGEST_MISMATCH", "EVIDENCE_STORE_REFUSED"];
  assert.deepEqual(codes.map((c) => RECORD_CORE_CHECKS[c].check), ["C-102.36", "C-102.37", "C-102.38", "C-102.39"]);
  for (const c of codes) assert.ok(!/instance|plane|server|copy/i.test(RECORD_CORE_CHECKS[c].translation), c);
});
