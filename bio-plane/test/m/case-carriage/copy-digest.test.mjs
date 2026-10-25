/* case-carriage — the digest of a large copy (R15; T51 fix round 10, cause R24 (b2), the filing stall): a queued
   document's bytes are checked against their digest in `#copyOne`; over 1 MiB that work is the platform's native
   SHA-256, never the one-shot pure-JS hash that held the object's thread (K5057). The tests assert WORK, through the
   module's two digest seams (`nativeDigest`, `jsDigest`), never time (K4787). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, supplied } from "./fixture.mjs";
import { NATIVE_DIGEST_MIN_BYTES } from "../../../src/case-carriage/index.mjs";
import { createSha256 } from "../../../src/record-grammar/index.mjs";

/* a counting seam over the real digests: what each is asked, and the digest each answers */
function counting({ nativeFails = false } = {}) {
  const calls = { native: [], js: [] };
  return {
    calls,
    deps: {
      nativeDigest: async (bytes) => {
        calls.native.push(bytes.length);
        if (nativeFails) throw new Error("no native digest");
        return createHash("sha256").update(bytes).digest("hex");
      },
      jsDigest: (bytes) => { calls.js.push(bytes.length); return createSha256().update(bytes).hex(); },
    },
  };
}

const MIB = 1024 * 1024;

test("R15 (T51; R24 b2) a queued 2 MiB document is checked against its digest by the native digest once and the pure-JS hash zero times; the copy is made as before (clean), and the digest is the known SHA-256 of that input", async () => {
  assert.equal(NATIVE_DIGEST_MIN_BYTES, MIB);
  const seam = counting();
  const w = world(seam.deps);
  const bytes = Buffer.alloc(2 * MIB, "a");
  const s = supplied(w, "INFO-2026-0201-big", bytes, { name: "big.txt", type: "text/plain" });
  seam.calls.native.length = 0; seam.calls.js.length = 0;
  const r = await w.cc.copyBatch({});
  assert.deepEqual([r.clean, r.failed, r.remaining], [1, 0, 0]);
  assert.deepEqual(seam.calls.native, [2 * MIB], "the native digest, asked once, of the whole input");
  assert.deepEqual(seam.calls.js, [], "the pure-JS hash is not run over a large input");
  assert.equal(w.cc.documentCopy(s).state, "clean");
  assert.equal(s, createHash("sha256").update(bytes).digest("hex"), "the capture's digest is the known SHA-256 of the input");
  assert.equal(createSha256().update(bytes).hex(), s, "R-OLD: the old hash's output on the same input is the same digest (nothing stored changes)");
});

test("R15 (T51; R24 b2) control: a small document is hashed by the pure-JS hash, as before, and the native digest is not asked; a document of exactly 1 MiB is small, one byte over is large", async () => {
  const small = counting();
  const w = world(small.deps);
  const s = supplied(w, "INFO-2026-0202-small", Buffer.from("street,count\n".padEnd(356, "x")), { name: "n.txt", type: "text/plain" });
  small.calls.native.length = 0; small.calls.js.length = 0;
  assert.equal((await w.cc.copyBatch({})).clean, 1);
  assert.deepEqual(small.calls.native, []);
  assert.deepEqual(small.calls.js, [356]);
  assert.equal(w.cc.documentCopy(s).state, "clean");
  for (const [n, native] of [[MIB, false], [MIB + 1, true]]) {
    const c = counting();
    const x = world(c.deps);
    supplied(x, "INFO-2026-0203-edge", Buffer.alloc(n, "b"), { name: "e.txt", type: "text/plain" });
    c.calls.native.length = 0; c.calls.js.length = 0;
    assert.equal((await x.cc.copyBatch({})).clean, 1);
    assert.equal(c.calls.native.length, native ? 1 : 0, `${n} bytes`);
    assert.equal(c.calls.js.length, native ? 0 : 1, `${n} bytes`);
  }
});

test("R15 (T51; R24 b2) a native digest that fails or answers no digest falls back to the pure-JS hash: the same digest, the copy still made; a stored object whose bytes are not the capture's digest is still not read as that capture (failed, queued)", async () => {
  const c = counting({ nativeFails: true });
  const w = world(c.deps);
  const bytes = Buffer.alloc(2 * MIB, "c");
  const s = supplied(w, "INFO-2026-0204-fall", bytes, { name: "f.txt", type: "text/plain" });
  c.calls.native.length = 0; c.calls.js.length = 0;
  assert.equal((await w.cc.copyBatch({})).clean, 1);
  assert.equal(c.calls.native.length, 1);
  assert.deepEqual(c.calls.js, [2 * MIB]);
  assert.equal(w.cc.documentCopy(s).state, "clean");
  /* a wrong answer from the native digest is no digest: the JS hash decides */
  const bad = counting();
  bad.deps.nativeDigest = async () => "not a digest";
  const x = world(bad.deps);
  const t = supplied(x, "INFO-2026-0205-bad", bytes, { name: "g.txt", type: "text/plain" });
  assert.equal((await x.cc.copyBatch({})).clean, 1);
  assert.equal(x.cc.documentCopy(t).state, "clean");
  /* control: bytes that are not the digest's are never made into a copy, over the bound too */
  const y = world(counting().deps);
  const u = supplied(y, "INFO-2026-0206-other", bytes, { name: "h.txt", type: "text/plain" });
  y.evidence.held.set(u, Buffer.alloc(2 * MIB, "z"));
  const r = await y.cc.copyBatch({});
  assert.deepEqual([r.clean, r.failed, r.remaining], [0, 1, 1]);
});
