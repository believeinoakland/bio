/* capture, R113 (G173; K5001): the digest of an upload's parts so far can be written down and taken up again, so the object taken out of memory between two
   parts continues where it stopped. The resumable stream is driven against WebCrypto over the block and padding boundaries, split at every kind of place, and
   a state that is not one it wrote is refused. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createResumableSha256 } from "../../../src/capture/sha256-resume.mjs";

const bytes = (n, seed = 1) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (seed * 31 + i * 7 + (i >> 5)) & 255; return b; };
const ref = (b) => createHash("sha256").update(b).digest("hex");

test("R113 (G173): the stream agrees with WebCrypto over lengths around the block and padding boundaries", () => {
  for (const n of [0, 1, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129, 1000, 4096, 100000]) {
    const b = bytes(n, n + 1);
    assert.equal(createResumableSha256().update(b).hex(), ref(b), `length ${n}`);
  }
});

test("R113 (G173): a state written at any split and taken up in a new stream continues to the same digest, across several saves", () => {
  const b = bytes(70000, 5);
  for (const cut of [0, 1, 63, 64, 65, 1000, 40000, 69999, 70000]) {
    const first = createResumableSha256().update(b.subarray(0, cut));
    const saved = first.snapshot();
    assert.equal(typeof saved, "string");
    const rest = createResumableSha256(saved);
    assert.ok(rest, `cut ${cut}`);
    assert.equal(rest.length, cut);
    assert.equal(rest.update(b.subarray(cut)).hex(), ref(b), `cut ${cut}`);
    /* saving leaves the first stream usable */
    assert.equal(first.update(b.subarray(cut)).hex(), ref(b));
  }
  /* parts, each taken from the last one's state, as the object does between requests */
  let state = createResumableSha256().snapshot();
  for (let at = 0; at < b.length; at += 16000) { const s = createResumableSha256(state); s.update(b.subarray(at, Math.min(at + 16000, b.length))); state = s.snapshot(); }
  assert.equal(createResumableSha256(state).hex(), ref(b));
});

test("R113 (G173): a state it did not write is no state: the stream is not made", () => {
  const good = JSON.parse(createResumableSha256().update(bytes(100)).snapshot());
  for (const bad of ["", "not json", "null", "[]", "{}", JSON.stringify({ ...good, h: good.h.slice(1) }), JSON.stringify({ ...good, t: -1 }),
                     JSON.stringify({ ...good, b: "zz" }), JSON.stringify({ ...good, b: good.b + "00" }), JSON.stringify({ ...good, t: 99 }),
                     JSON.stringify({ ...good, h: good.h.map(() => 2 ** 32) })])
    assert.equal(createResumableSha256(bad), null, String(bad).slice(0, 40));
});
