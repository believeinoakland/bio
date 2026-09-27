/* image-codecs R6–R9, across every codec (build/requirements/image-codecs.md):
 * each checked against a named independent decoder (R6), refusal sets as
 * contracts (R7), purity (R8), and no place named (R9). Behaviour at the
 * interface only: what the module exports and answers. */
import "../../../bio-plane/test/sandbox.mjs";

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { decodeBaselineJpeg, DctRefusal } from "../../src/dctdecode.mjs";
import { ccittDecode } from "../../src/ccittdecode.mjs";
import { decodeJbig2, JBIG2_REFUSES, Jbig2Refusal } from "../../src/jbig2decode.mjs";
import { decodeJpx, JPX_REFUSES, JpxRefusal } from "../../src/jpxdecode.mjs";
import { MqDecoder, mqContexts } from "../../src/mq.mjs";

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const DCT = load("../fixtures/dct-variants.json"), JB = load("../fixtures/jbig2-variants.json");
const JPX = load("../fixtures/jpx-variants.json"), CC = load("fixtures/ccitt-variants.json");
const b64 = (s) => (s == null ? null : new Uint8Array(Buffer.from(s, "base64")));
const sha = (b) => createHash("sha256").update(b).digest("hex");

/** Every fixture of every codec as [codec, name, () => answer], answer being the
 *  decode's result or the refusal it threw. */
const CALLS = [
  ...DCT.variants.map((v) => ["dct", v.name, () => decodeBaselineJpeg(b64(v.jpeg_b64), { rotate: v.rotate })]),
  ...CC.variants.map((v) => ["ccitt", v.name, () => ccittDecode(b64(v.data_b64), { K: v.K, columns: v.columns, rows: v.rows, byteAlign: v.byteAlign })]),
  ...JB.variants.map((v) => ["jbig2", v.name, () => decodeJbig2(b64(v.stream_b64), b64(v.globals_b64))]),
  ...JPX.variants.map((v) => ["jpx", v.name, () => decodeJpx(b64(v.data_b64))]),
];
const answer = (fn) => { try { return fn(); } catch (e) { return e; } };
/** An answer as a comparable value: the samples' digest and the rest, or the refusal. */
function summary(a) {
  if (a instanceof Error) return { refused: a.constructor.name, code: a.code, message: a.message, detail: a.detail };
  const { samples, packed, ...rest } = a;
  return { digest: sha(samples ?? packed), ...rest };
}

test("R6 each codec's fixtures name an independent decoder and carry its digest for every picture", () => {
  for (const [fix, decoder, field] of [[DCT, /libjpeg-turbo/, "pillow_sha256"], [JB, /^jbig2dec /, "jbig2dec_sha256"],
    [JPX, /OpenJPEG/, "opj_sha256"], [CC, /^libtiff /, "libtiff_sha256"]]) {
    assert.match(fix.provenance, decoder);
    for (const v of fix.variants.filter((x) => (x.expect ?? "ok") === "ok")) {
      assert.ok(v[field] || v.construction_sha256, `${v.name}: ${field}`);
    }
  }
});

test("R6 no expected picture is this module's own output: every digest is the reference's, and the reference differs where it must", () => {
  /* The two JBIG2 pictures judged by construction are exactly those where jbig2dec
   * does not give the picture encoded, and the fixture says so beside it. */
  for (const v of JB.variants.filter((x) => x.construction_sha256)) {
    assert.ok(v.note, v.name);
    assert.notEqual(v.jbig2dec_sha256, v.construction_sha256, v.name);
  }
});

test("R7 the declared refusal sets, exactly: renaming or removing a key is a change to R7", () => {
  assert.deepEqual(Object.keys(JBIG2_REFUSES), ["colour extension", "12 adaptive-template pixels", "reused bitmap coding contexts",
    "Huffman-coded refinement", "a necessary extension segment", "segment type", "several pages", "no page"]);
  assert.deepEqual(Object.keys(JPX_REFUSES), ["high-throughput coding", "a JP2 palette", "sYCC colour", "an extended capability",
    "packed packet headers", "an image past the memory bound"]);
  for (const set of [JBIG2_REFUSES, JPX_REFUSES]) {
    assert.ok(Object.isFrozen(set));
    for (const [k, why] of Object.entries(set)) assert.ok(typeof why === "string" && why.length > 20, k);
  }
});

test("R7 every refusal any fixture draws is one of its codec's codes, an UNSUPPORTED one naming a declared key", () => {
  const CLASSES = {
    dct: ["NOT_A_JPEG", "TRUNCATED", "UNSUPPORTED_PROCESS", "UNSUPPORTED_PRECISION", "UNSUPPORTED_FRAME", "CORRUPT_DATA",
      "UNSUPPORTED_COMPONENTS", "COMPONENT_MISMATCH", "COLOR_TRANSFORM_CONFLICT", "UNSUPPORTED_SAMPLING", "UNSUPPORTED_ROTATION"],
    jbig2: ["UNSUPPORTED", "TRUNCATED", "CORRUPT"],
    jpx: ["UNSUPPORTED", "UNSUPPORTED_SAMPLES", "TRUNCATED", "CORRUPT"],
  };
  const KIND = { dct: DctRefusal, jbig2: Jbig2Refusal, jpx: JpxRefusal };
  const SET = { jbig2: JBIG2_REFUSES, jpx: JPX_REFUSES };
  let refusals = 0;
  const codes = { dct: new Set(), jbig2: new Set(), jpx: new Set() };
  for (const [codec, name, fn] of CALLS) {
    const a = answer(fn);
    if (!(a instanceof Error)) continue;
    refusals++;
    assert.ok(a instanceof KIND[codec], `${codec} ${name}: a ${KIND[codec] && KIND[codec].name}`);
    assert.ok(CLASSES[codec].includes(a.code), `${codec} ${name}: ${a.code}`);
    if (a.code === "UNSUPPORTED") assert.ok(a.detail.feature in SET[codec], `${codec} ${name}: '${a.detail.feature}'`);
    codes[codec].add(a.code);
  }
  assert.equal(refusals, 4 + 14 + 13);
  /* The codes are part of R7 too: JBIG2's and JPX's are all reached by the corpus
   * (DCT's eleven are all driven in dct.test.mjs). */
  assert.deepEqual([...codes.jbig2].sort(), [...CLASSES.jbig2].sort());
  assert.deepEqual([...codes.jpx].sort(), [...CLASSES.jpx].sort());
});

test("R8 pure: the same bytes and options always answer the same way, in any order", () => {
  const first = CALLS.map(([, , fn]) => summary(answer(fn)));
  const reversed = [...CALLS].reverse().map(([, , fn]) => summary(answer(fn))).reverse();
  assert.deepEqual(reversed, first);
});

test("R8 no clock, no randomness, no I/O: every decode answers the same with them all taken away", () => {
  const want = CALLS.map(([, , fn]) => summary(answer(fn)));
  const saved = { now: Date.now, random: Math.random, perf: globalThis.performance, fetch: globalThis.fetch, crypto: globalThis.crypto };
  const trap = (what) => () => { throw new Error(`the decoder reached for ${what}`); };
  try {
    Date.now = trap("the clock");
    Math.random = trap("randomness");
    Object.defineProperty(globalThis, "performance", { value: { now: trap("the clock") }, configurable: true, writable: true });
    globalThis.fetch = trap("the network");
    Object.defineProperty(globalThis, "crypto", { value: undefined, configurable: true, writable: true });
    const got = CALLS.map(([, , fn]) => answer(fn));
    for (const a of got) if (a instanceof Error) assert.doesNotMatch(a.message, /the decoder reached for/);
    assert.deepEqual(got.map(summary), want);
  } finally {
    Date.now = saved.now; Math.random = saved.random; globalThis.fetch = saved.fetch;
    Object.defineProperty(globalThis, "performance", { value: saved.perf, configurable: true, writable: true });
    Object.defineProperty(globalThis, "crypto", { value: saved.crypto, configurable: true, writable: true });
  }
});

test("R8 no state carried between calls: the input is never changed, and a second decoder is independent of the first", () => {
  for (const [codec, name] of CALLS) {
    const v = { dct: DCT, ccitt: CC, jbig2: JB, jpx: JPX }[codec].variants.find((x) => x.name === name);
    const bytes = b64(v.jpeg_b64 ?? v.data_b64 ?? v.stream_b64), before = sha(bytes);
    const globals = b64(v.globals_b64), gBefore = globals && sha(globals);
    answer(() => codec === "dct" ? decodeBaselineJpeg(bytes, { rotate: v.rotate })
      : codec === "ccitt" ? ccittDecode(bytes, { K: v.K, columns: v.columns, rows: v.rows, byteAlign: v.byteAlign })
      : codec === "jbig2" ? decodeJbig2(bytes, globals) : decodeJpx(bytes));
    assert.equal(sha(bytes), before, `${codec} ${name}: input unchanged`);
    if (globals) assert.equal(sha(globals), gBefore, `${codec} ${name}: globals unchanged`);
  }
  /* Two MQ decoders over the same bytes, interleaved, decode the same decisions. */
  const bytes = Uint8Array.from({ length: 64 }, (_, i) => (i * 73 + 5) & 0xff);
  const a = new MqDecoder(bytes), b = new MqDecoder(bytes), ca = mqContexts(4), cb = mqContexts(4);
  const da = [], db = [];
  for (let i = 0; i < 300; i++) { da.push(a.decode(ca, i % 4)); db.push(b.decode(cb, i % 4)); }
  assert.deepEqual(da, db);
});

test("R9 no place is named in anything the module declares or answers", () => {
  const PLACES = /oakland|alameda|california|berkeley|san francisco|sacramento|los angeles|legistar/i;
  const said = [];
  const collect = (v, depth = 0) => {
    if (typeof v === "string") said.push(v);
    else if (v && typeof v === "object" && !ArrayBuffer.isView(v) && depth < 6) for (const [k, x] of Object.entries(v)) { said.push(k); collect(x, depth + 1); }
  };
  collect(JBIG2_REFUSES); collect(JPX_REFUSES);
  for (const [, , fn] of CALLS) {
    const a = answer(fn);
    if (a instanceof Error) { said.push(a.message, a.code); collect(a.detail); } else collect(a);
  }
  assert.ok(said.length > 500);
  assert.deepEqual(said.filter((s) => PLACES.test(s)), []);
});
