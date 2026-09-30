/* record-grammar at its interface: the digests (R20–R23), and one implementation behind both names (R25). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSha256, sha256HexSync, b64ToBytes } from "../../../src/record-grammar/index.mjs";

const subtle = async (bytes) => Buffer.from(await crypto.subtle.digest("SHA-256", bytes)).toString("hex");
const utf8 = (s) => new TextEncoder().encode(String(s));
const bytesOf = (n, seed = 1) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = (i * 31 + seed * 17 + (i >> 3)) & 0xff; return b; };
/* The padding boundaries by name, and every length to three blocks and a bit. */
const LENGTHS = [0, 1, 3, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129, ...Array.from({ length: 200 }, (_, i) => i), 1000, 4096, 65537];

test("R22 known vectors: the empty input and abc (FIPS 180-4 examples), and the padding boundaries against crypto.subtle", async () => {
  const EMPTY = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad";
  const TWO_BLOCK = "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1";
  assert.equal(createSha256().hex(), EMPTY);
  assert.equal(sha256HexSync(""), EMPTY);
  assert.equal(createSha256().update(utf8("abc")).hex(), ABC);
  assert.equal(sha256HexSync("abc"), ABC);
  assert.equal(sha256HexSync("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"), TWO_BLOCK);
  for (const n of [0, 55, 56, 63, 64, 65]) {
    const s = "a".repeat(n);
    const want = await subtle(utf8(s));
    assert.equal(sha256HexSync(s), want, `sync ${n}`);
    assert.equal(createSha256().update(utf8(s)).hex(), want, `stream ${n}`);
  }
});

test("R20 R22 createSha256: every byte fed, however chunked, is SHA-256 of the whole, lowercase 64 hex", async () => {
  let seed = 3; const rnd = (k) => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % k);
  for (const n of LENGTHS) {
    const b = bytesOf(n, n);
    const want = await subtle(b);
    assert.match(want, /^[0-9a-f]{64}$/);
    assert.equal(createSha256().update(b).hex(), want, `whole ${n}`);
    /* Random chunkings, a byte at a time, and empty chunks between. */
    for (let t = 0; t < 3; t++) {
      const h = createSha256();
      for (let i = 0; i < n;) { const k = rnd(n < 70 ? 5 : 130); h.update(b.subarray(i, i + k)); i += k; }
      assert.equal(h.hex(), want, `chunked ${n}`);
    }
    if (n <= 130) { const h = createSha256(); for (const x of b) h.update([x]).update([]); assert.equal(h.hex(), want, `bytewise ${n}`); }
  }
});

test("R20 update takes a Uint8Array or a byte array-like, values mod 256, and returns the stream", async () => {
  const b = bytesOf(300, 9);
  const want = await subtle(b);
  const s = createSha256();
  assert.equal(s.update(b.subarray(0, 10)), s);
  assert.equal(s.update(Array.from(b.subarray(10, 100))).update(Int8Array.from(b.subarray(100, 150), (x) => (x << 24) >> 24))
    .update({ length: 50, ...Object.fromEntries(Array.from(b.subarray(150, 200), (x, i) => [i, x + 256 * (i % 3) - 512])) })
    .update(Buffer.from(b.subarray(200, 250))).update(new Uint8ClampedArray(b.subarray(250))).hex(), want);
});

test("R20 update throws a TypeError for a string or any other input that is not bytes", () => {
  for (const bad of ["", "abc", new String("abc"), undefined, null, 1, true, {}, { length: -1 }, { length: 1.5 },
    { length: "3" }, new ArrayBuffer(4), Symbol("s"), () => [1], 10n]) {
    const s = createSha256();
    assert.throws(() => s.update(bad), TypeError, String(typeof bad));
  }
  /* A refused chunk feeds nothing: the stream still hashes what it was given. */
  const s = createSha256().update(utf8("ab"));
  assert.throws(() => s.update("c"), TypeError);
  assert.equal(s.update(utf8("c")).hex(), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("R20 update or hex after hex throws 'sha256 stream already finalized'", () => {
  const s = createSha256().update(utf8("x"));
  s.hex();
  assert.throws(() => s.hex(), { message: "sha256 stream already finalized" });
  assert.throws(() => s.update(new Uint8Array(1)), { message: "sha256 stream already finalized" });
  assert.throws(() => s.update("x"), { message: "sha256 stream already finalized" });
});

test("R21 R25 sha256HexSync: the stream over String(str)'s UTF-8, for every input, synchronously", async () => {
  const inputs = ["", "abc", "é", "日本語", "\u{1F600}", "\ud800", "a\u0000b", "\r\n", 0, -0, 1.5, null, undefined, true,
    { toString: () => "obj" }, ["a", 1], ...LENGTHS.map((n) => "x".repeat(n)), ...LENGTHS.slice(0, 80).map((n) => "é".repeat(n))];
  for (const v of inputs) {
    const got = sha256HexSync(v);
    assert.equal(typeof got, "string");
    assert.match(got, /^[0-9a-f]{64}$/);
    assert.equal(got, createSha256().update(utf8(v)).hex(), String(v));
    assert.equal(got, await subtle(utf8(v)), String(v));
  }
});

test("R23 b64ToBytes: standard base64, whitespace and = ignored, a Uint8Array; outside the alphabet throws with the position", () => {
  for (const n of [0, 1, 2, 3, 4, 5, 64, 255, 256, 1000]) {
    const b = bytesOf(n, 5);
    const enc = Buffer.from(b).toString("base64");
    const got = b64ToBytes(enc);
    assert.ok(got instanceof Uint8Array);
    assert.deepEqual([...got], [...b], `n=${n}`);
    assert.deepEqual([...b64ToBytes(enc.replace(/=/g, ""))], [...b]);
    assert.deepEqual([...b64ToBytes(enc.replace(/(.{7})/g, "$1\n \t\r"))], [...b]);
  }
  assert.deepEqual([...b64ToBytes("+/+/")], [0xfb, 0xff, 0xbf]);
  assert.deepEqual([...b64ToBytes("==A=Q==")], [...Buffer.from("AQ==", "base64")]);
  for (const [s, at] of [["ab-c", 2], ["ab_c", 2], ["a b*", 2], ["é", 0], ["AAAA.", 4], ["AA==AA$", 4]])
    assert.throws(() => b64ToBytes(s), { message: `invalid base64 at position ${at}` }, s);
});
