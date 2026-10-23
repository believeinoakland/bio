/* record-core R88 (T51, fix round 4, P10 (c); K4447; amends R38): `evidenceStore().get(key, {range: {offset, length}})`
   answers only those bytes of the object, asked of the bucket as a range (R2's `range` option), never the whole;
   `get(key)` with no range answers the whole as before. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { recordOf } from "../../../src/record-core/index.mjs";
import { storage, bucket } from "./storage.mjs";

const MiB = 1024 * 1024;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const KEY = "bio/captures/";
const store = (b) => { const rc = recordOf({ storage: storage() }, { evidence: b, evidencePrefix: KEY }); rc.migrate(); return rc.evidenceStore(); };

/* A bucket that answers `get(key, {range})` as R2 does: only the bytes of the range (a range past the end answers what is
   there), and a `get` with no range the whole; every `get` is recorded with the options it was given and the bytes it
   transferred. */
function rangedBucket() {
  const base = bucket(), transferred = [];
  return Object.assign(base, {
    transferred,
    async get(k, options) {
      base.calls.push(["get", k, options]);
      if (!base.held.has(k)) return null;
      const all = base.held.get(k);
      const r = options && options.range;
      const bytes = r ? all.slice(r.offset, r.offset + r.length) : all;
      transferred.push(bytes.length);
      return { key: k, size: all.length, async arrayBuffer() { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
    },
  });
}

function held(b, size = 4 * MiB) {
  const whole = new Uint8Array(size);
  for (let i = 0; i < whole.length; i++) whole[i] = (i * 31 + (i >> 11)) & 255;
  const digest = sha(whole);
  b.held.set(`${KEY}${digest}`, whole);
  return { whole, digest };
}
const bytesOf = async (o) => new Uint8Array(await o.arrayBuffer());

test("R88: a 4 MB object read with {offset: 0, length: 1024} asks the bucket for that range and answers 1024 bytes", async () => {
  const b = rangedBucket();
  const { whole, digest } = held(b);
  const o = await store(b).get(digest, { range: { offset: 0, length: 1024 } });
  assert.deepEqual(b.calls[0], ["get", `${KEY}${digest}`, { range: { offset: 0, length: 1024 } }], "the bucket is asked for the range");
  assert.deepEqual(b.transferred, [1024], "only 1024 bytes were transferred, never the 4 MB");
  assert.deepEqual(await bytesOf(o), whole.slice(0, 1024));
});

test("R88: a range inside the object answers those bytes, and one past the object's end answers what is there", async () => {
  const b = rangedBucket();
  const { whole, digest } = held(b, 5000);
  const mid = await store(b).get(digest, { range: { offset: 100, length: 50 } });
  assert.deepEqual(await bytesOf(mid), whole.slice(100, 150));
  const tail = await store(b).get(digest, { range: { offset: 4900, length: 1024 } });
  assert.deepEqual(await bytesOf(tail), whole.slice(4900), "the 100 bytes that are there");
});

test("R88: get(key) with no range answers the whole, asking the bucket for no range (control)", async () => {
  const b = rangedBucket();
  const { whole, digest } = held(b);
  const o = await store(b).get(digest);
  assert.equal(b.calls[0][2], undefined, "the bucket is asked as before, with no options");
  assert.deepEqual(b.transferred, [4 * MiB]);
  assert.deepEqual(await bytesOf(o), whole);
  const o2 = await store(b).get(digest, {});
  assert.deepEqual(await bytesOf(o2), whole, "options naming no range read the whole too");
  assert.equal(await store(b).get(sha("not held"), { range: { offset: 0, length: 10 } }), null, "an object not held answers null, ranged or not");
});

test("R88: a range that is not a pair of whole non-negative numbers is a caller's defect, refused before the bucket is asked", async () => {
  const b = rangedBucket();
  const { digest } = held(b, 100);
  const ev = store(b);
  for (const range of [{ offset: -1, length: 10 }, { offset: 0, length: 0 }, { offset: 0.5, length: 10 }, { offset: 0 }, { length: 10 }, "0-10", null])
    assert.throws(() => ev.get(digest, { range }), TypeError, JSON.stringify(range));
  assert.deepEqual(b.calls, [], "the bucket was not asked");
});
