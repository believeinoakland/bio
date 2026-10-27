/* acquisition R113 (T51 fix round 9, G127d; plan 2c item 3): `readRange(store, sha, offset, length)` answers a capture's bytes by its WHOLE digest,
   held whole or only in parts, the parts hidden. Parts are named by `provenance.partsOf`, the real one of provenance's `heldParts` fixture (registered through the real register path). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { readRange } from "../../../src/acquisition/index.mjs";
import { heldParts, homeOfEmpty } from "../provenance/fixtures.mjs";

const MIB = 1024 * 1024;
const PART = 8 * MIB;
const data = (() => { const b = new Uint8Array(PART + 3 * MIB); for (let i = 0; i < b.length; i++) b[i] = (i * 31 + (i >> 12)) & 255; return b; })();
const wholeSha = sha(data);

/* held in parts only: two parts stored under their own digests, the whole under none */
async function inParts() {
  const w = world();
  const ev = w.core.evidenceStore();
  const a = data.subarray(0, PART), b = data.subarray(PART);
  await ev.put(sha(a), a); await ev.put(sha(b), b);
  w.store.provenance = heldParts(wholeSha, [{ sha256: sha(a), bytes: a.length }, { sha256: sha(b), bytes: b.length }]);
  return w;
}
async function whole() {
  const w = world();
  await w.core.evidenceStore().put(wholeSha, data);
  w.store.provenance = homeOfEmpty();   /* the real provenance, nothing registered: partsOf answers null */
  return w;
}
const eq = (got, from, to) => { assert.ok(got instanceof Uint8Array, JSON.stringify(got)); assert.deepEqual(Buffer.from(got), Buffer.from(data.subarray(from, to))); };

test("R113: a range across the part seam equals the same bytes of the whole, held in parts", async () => {
  const w = await inParts();
  eq(await readRange(w.store, wholeSha, PART - 10, 20), PART - 10, PART + 10);
  eq(await readRange(w.store, wholeSha, 0, 5), 0, 5);
  eq(await readRange(w.store, wholeSha, PART, 100), PART, PART + 100);
  eq(await readRange(w.store, "sha:" + wholeSha.toUpperCase(), PART - 1, 2), PART - 1, PART + 1);
  assert.equal(w.b.calls.filter((c) => c[0] === "get" && c[1] === wholeSha).length, 0, "the whole's object is never asked for when it is not held");
});

test("R113: held whole, the same ranges answer the same bytes; the head and the tail exactly (control)", async () => {
  const w = await whole();
  eq(await readRange(w.store, wholeSha, PART - 10, 20), PART - 10, PART + 10);
  eq(await readRange(w.store, wholeSha, 0, 1024), 0, 1024);
  eq(await readRange(w.store, wholeSha, data.length - 1024, 1024), data.length - 1024, data.length);
});

test("R113: past the end answers the bytes that exist; at or past the end an empty array", async () => {
  for (const w of [await inParts(), await whole()]) {
    eq(await readRange(w.store, wholeSha, data.length - 5, 100), data.length - 5, data.length);
    assert.equal((await readRange(w.store, wholeSha, data.length, 10)).length, 0);
    assert.equal((await readRange(w.store, wholeSha, data.length + 99, 10)).length, 0);
    assert.equal((await readRange(w.store, wholeSha, 5, 0)).length, 0);
  }
});

test("R113: a malformed digest, a bad offset or length, a whole not held, and a failing store each answer {ok:false, reason} and never throw", async () => {
  const w = await inParts();
  for (const [s, o, l] of [["nope", 0, 1], [wholeSha.slice(1), 0, 1], [null, 0, 1]]) { const r = await readRange(w.store, s, o, l); assert.equal(r.ok, false); assert.equal(r.reason, "BAD_SHA"); }
  for (const [o, l] of [[-1, 1], [1.5, 1], [0, -1], [0, "3"], [NaN, 1]]) { const r = await readRange(w.store, wholeSha, o, l); assert.equal(r.ok, false); assert.equal(r.reason, "BAD_RANGE"); }
  const none = await readRange(w.store, "a".repeat(64), 0, 1);
  assert.deepEqual(none, { ok: false, reason: "NOT_HELD" });
  const was = w.b.get; w.b.get = async () => { throw new Error("store down"); };
  const r = await readRange(w.store, wholeSha, 0, 10);
  w.b.get = was;
  assert.equal(r.ok, false); assert.match(r.reason, /store down/);
  const bare = await readRange({}, wholeSha, 0, 1);
  assert.equal(bare.ok, false);
});
