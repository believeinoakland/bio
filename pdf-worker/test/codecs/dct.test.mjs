/* image-codecs R1, R6: `decodeBaselineJpeg`, `readJpegHeader`, `colourTransformOf`
 * and `DctRefusal` at their interface (build/requirements/image-codecs.md).
 *
 * INDEPENDENT EXPECTATIONS (R6). Every expected picture is Pillow 11.3.0's decode
 * (libjpeg-turbo 3.1.1, whose SIMD paths are bit-exact with libjpeg's C) of the
 * same bytes, rotated clockwise by the fixture's `rotate`, written by
 * `../fixtures/make-dct-fixtures.py` into `../fixtures/dct-variants.json`.
 * libjpeg-turbo shares no line with `dctdecode.mjs`. The refusals below that no
 * fixture carries are made by changing one field of a fixture's markers, each
 * named where it is made.
 *
 * R1 (as K117 words it): a DctRefusal carries the codec's own code and a detail
 * saying why; `pdf-pixels` maps each code to its reasons (shown beside each code
 * below for reference, not tested here). */
import "../../../bio-plane/test/sandbox.mjs";

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { decodeBaselineJpeg, readJpegHeader, colourTransformOf, DctRefusal } from "../../src/dctdecode.mjs";

const FIX = JSON.parse(readFileSync(new URL("../fixtures/dct-variants.json", import.meta.url), "utf8"));
const V = FIX.variants;
const jpeg = (name) => new Uint8Array(Buffer.from(V.find((v) => v.name === name).jpeg_b64, "base64"));
const sha = (b) => createHash("sha256").update(b).digest("hex");

/** Every code a DctRefusal carries, and the REFUSALS reason R1 says it answers as. */
const CODES = {
  UNSUPPORTED_PROCESS: "UNSUPPORTED_JPEG_PROCESS", UNSUPPORTED_PRECISION: "UNSUPPORTED_JPEG_PROCESS",
  UNSUPPORTED_COMPONENTS: "UNSUPPORTED_SAMPLES", COMPONENT_MISMATCH: "UNSUPPORTED_SAMPLES", UNSUPPORTED_SAMPLING: "UNSUPPORTED_SAMPLES",
  COLOR_TRANSFORM_CONFLICT: "UNSUPPORTED_SAMPLES", UNSUPPORTED_ROTATION: "UNSUPPORTED_SAMPLES", TRUNCATED: "TRUNCATED_IMAGE_DATA",
  NOT_A_JPEG: "DECODE_FAILED", CORRUPT_DATA: "DECODE_FAILED", UNSUPPORTED_FRAME: "DECODE_FAILED",
};

/** The refusal `fn` throws: always a DctRefusal, its code one of CODES. */
function refusal(fn) {
  try { fn(); } catch (e) {
    assert.ok(e instanceof DctRefusal, `a DctRefusal, not ${e && e.constructor && e.constructor.name}: ${e && e.message}`);
    assert.ok(e.code in CODES, `code ${e.code} is one R1 names`);
    assert.ok(e.detail && typeof e.detail === "object" && Object.keys(e.detail).length > 0, `${e.code}: a detail that says why`);
    return e;
  }
  assert.fail("no refusal");
}

/** The byte offset of the segment for marker `m` (just past its length field). */
function segmentAt(d, m) {
  for (let p = 2; p + 4 <= d.length;) {
    if (d[p] !== 0xff) { p++; continue; }
    if (d[p + 1] === m) return p + 4;
    if (d[p + 1] === 0xda) break;
    p += 2 + ((d[p + 2] << 8) | d[p + 3]);
  }
  throw new Error(`no marker 0x${m.toString(16)}`);
}
const patched = (name, m, off, value) => { const d = jpeg(name); d[segmentAt(d, m) + off] = value; return d; };

test("R1 R6 the fixtures: libjpeg-turbo's decode of baseline and extended-sequential files, grey and colour", () => {
  assert.match(FIX.provenance, /libjpeg-turbo/);
  const ok = V.filter((v) => v.expect === "ok");
  assert.equal(ok.length, 12);
  for (const v of ok) assert.match(v.pillow_sha256, /^[0-9a-f]{64}$/, v.name);
  assert.deepEqual([...new Set(ok.map((v) => v.rotate))].sort((a, b) => a - b), [0, 90, 180, 270]);
});

test("R1 R6 every decodable fixture: libjpeg's samples, to the bit, rotated as asked", () => {
  for (const v of V.filter((x) => x.expect === "ok")) {
    const out = decodeBaselineJpeg(jpeg(v.name), { rotate: v.rotate });
    assert.deepEqual([out.width, out.height, out.comps], [v.width, v.height, v.mode === "L" ? 1 : 3], v.name);
    assert.equal(out.samples.length, v.width * v.height * out.comps, v.name);
    assert.equal(sha(out.samples), v.pillow_sha256, `${v.name}: libjpeg-turbo's samples`);
  }
});

test("R1 each sampling libjpeg upsamples fancily: 4:4:4, 4:2:2, 4:2:0 and h1v2, with restart intervals", () => {
  const seen = new Set();
  for (const v of V.filter((x) => x.expect === "ok" && x.mode === "RGB")) {
    const out = decodeBaselineJpeg(jpeg(v.name), { rotate: v.rotate });
    seen.add(out.source.sampling);
    if (v.name.includes("restart")) assert.ok(out.source.restart > 0, v.name);
  }
  for (const s of ["1x1,1x1,1x1", "2x1,1x1,1x1", "2x2,1x1,1x1", "1x2,1x1,1x1"]) assert.ok(seen.has(s), s);
});

test("R1 readJpegHeader and colourTransformOf: libjpeg's colour-transform rule, in its order", () => {
  const h = readJpegHeader(jpeg("rgb-444"));
  assert.equal(h.frame.comps.length, 3);
  assert.deepEqual(colourTransformOf(h), { ycc: true, why: "JFIF" });
  const adobe = readJpegHeader(jpeg("rgb-adobe-no-transform"));
  assert.deepEqual(colourTransformOf(adobe), { ycc: false, why: "Adobe APP14 transform=0" });
  const comps = (ids) => ({ frame: { comps: ids.map((id) => ({ id })) }, jfif: false, adobe: null });
  assert.deepEqual(colourTransformOf(comps([82, 71, 66])), { ycc: false, why: "component ids R,G,B" });
  assert.deepEqual(colourTransformOf(comps([1, 2, 3])), { ycc: true, why: "libjpeg's default for three components" });
  assert.equal(colourTransformOf({ ...comps([82, 71, 66]), jfif: true }).ycc, true, "JFIF wins over the ids");
  assert.equal(colourTransformOf({ ...comps([1, 2, 3]), adobe: { transform: 1 } }).ycc, true);
  /* The rule is what decoding follows: the Adobe file decodes untransformed, and matches libjpeg. */
  const v = V.find((x) => x.name === "rgb-adobe-no-transform");
  assert.equal(sha(decodeBaselineJpeg(jpeg(v.name)).samples), v.pillow_sha256);
});

test("R1 the fixtures' refusals: progressive, arithmetic-coded, four components, cut short", () => {
  for (const v of V.filter((x) => x.expect !== "ok")) {
    const e = refusal(() => decodeBaselineJpeg(jpeg(v.name), { rotate: v.rotate }));
    assert.equal(e.code, v.expect, v.name);
  }
});

test("R1 every other refusal, each as the bytes require", () => {
  const cases = [
    ["not a JPEG", () => decodeBaselineJpeg(Uint8Array.from([1, 2, 3, 4, 5])), "NOT_A_JPEG"],
    ["not even bytes", () => readJpegHeader("\xff\xd8\xff"), "NOT_A_JPEG"],
    ["12-bit precision (SOF P = 12)", () => decodeBaselineJpeg(patched("grey-baseline", 0xc0, 0, 12)), "UNSUPPORTED_PRECISION"],
    ["lossless (SOF3)", () => { const d = jpeg("grey-baseline"); d[segmentAt(d, 0xc0) - 3] = 0xc3; return decodeBaselineJpeg(d); }, "UNSUPPORTED_PROCESS"],
    ["hierarchical (DHP)", () => { const d = jpeg("grey-baseline"); d[segmentAt(d, 0xdb) - 3] = 0xde; return decodeBaselineJpeg(d); }, "UNSUPPORTED_PROCESS"],
    ["zero width (SOF X = 0)", () => { const d = patched("grey-baseline", 0xc0, 3, 0); d[segmentAt(d, 0xc0) + 4] = 0; return decodeBaselineJpeg(d); }, "UNSUPPORTED_FRAME"],
    ["sampling 3x1", () => decodeBaselineJpeg(patched("rgb-444", 0xc0, 7, 0x31)), "UNSUPPORTED_SAMPLING"],
    ["a missing quantisation table", () => decodeBaselineJpeg(patched("grey-baseline", 0xc0, 8, 3)), "CORRUPT_DATA"],
    ["the PDF expects three components of a grey file", () => decodeBaselineJpeg(jpeg("grey-baseline"), { expectComps: 3 }), "COMPONENT_MISMATCH"],
    ["/ColorTransform 0 against a JFIF file", () => decodeBaselineJpeg(jpeg("rgb-444"), { colorTransform: 0 }), "COLOR_TRANSFORM_CONFLICT"],
    ["a quarter turn that is not one", () => decodeBaselineJpeg(jpeg("grey-baseline"), { rotate: 45 }), "UNSUPPORTED_ROTATION"],
    ["the entropy data cut", () => decodeBaselineJpeg(jpeg("rgb-420-h2v2").subarray(0, 600)), "TRUNCATED"],
    ["no SOS", () => decodeBaselineJpeg(jpeg("grey-baseline").subarray(0, 120)), "TRUNCATED"],
  ];
  const seen = new Set();
  for (const [label, fn, code] of cases) {
    const e = refusal(fn);
    assert.equal(e.code, code, label);
    seen.add(e.code);
  }
  for (const v of V.filter((x) => x.expect !== "ok")) seen.add(v.expect);
  assert.deepEqual([...seen].sort(), Object.keys(CODES).sort(), "every code R1's refusals take is driven");
});

test("R1 the options agree with the file: expectComps and a matching /ColorTransform decode as without them", () => {
  const v = V.find((x) => x.name === "rgb-444");
  assert.equal(sha(decodeBaselineJpeg(jpeg(v.name), { expectComps: 3, colorTransform: 1 }).samples), v.pillow_sha256);
  const g = V.find((x) => x.name === "grey-baseline");
  assert.equal(sha(decodeBaselineJpeg(jpeg(g.name), { expectComps: 1, colorTransform: 0 }).samples), g.pillow_sha256);
});
