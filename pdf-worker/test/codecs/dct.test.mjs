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

/* R1's header shape (T38; N782, K2179): `readJpegHeader`'s Huffman tables are part
 * of R1, because `image-cover` decodes with them. Every field is checked against
 * tables derived here from the DHT bytes alone, by T.81 Annex C's code assignment
 * (codes of one length consecutive, the next length starting at twice the end of
 * the last) and Annex F.2.2.3's decoder tables, so a change to any field's type,
 * length or content is a change this test sees. */
const SHAPE = ["maxcode", "valptr", "mincode", "symbols", "fast", "FAST"];
const FAST_BITS = 9;

/** Every DHT table before the SOS, in order, as [class, id, counts, symbols]. */
function dhtTables(d) {
  const out = [];
  for (let p = 2; p + 4 <= d.length;) {
    if (d[p] !== 0xff) { p++; continue; }
    const m = d[p + 1];
    if (m === 0xff) { p++; continue; }
    if (m === 0xda) break;
    const len = (d[p + 2] << 8) | d[p + 3];
    if (m === 0xc4) {
      for (let q = p + 4; q < p + 2 + len;) {
        const counts = [...d.subarray(q + 1, q + 17)], total = counts.reduce((a, n) => a + n, 0);
        out.push([d[q] >> 4, d[q] & 15, counts, [...d.subarray(q + 17, q + 17 + total)]]);
        q += 17 + total;
      }
    }
    p += 2 + len;
  }
  return out;
}

/** The table R1's decoding reads, from a DHT table's counts and symbols. */
function expectedTable(counts, symbols) {
  const maxcode = Array(18).fill(-1), valptr = Array(17).fill(0), mincode = Array(17).fill(0);
  const fast = Array(1 << FAST_BITS).fill(-1);
  let code = 0, k = 0;
  for (let l = 1; l <= 16; l++) {
    valptr[l] = k; mincode[l] = code;
    for (let i = 0; i < counts[l - 1]; i++, k++, code++) {
      if (l <= FAST_BITS) for (let j = 0; j < 1 << (FAST_BITS - l); j++) fast[(code << (FAST_BITS - l)) | j] = (l << 8) | symbols[k];
    }
    if (counts[l - 1]) maxcode[l] = code - 1;
    code <<= 1;
  }
  maxcode[17] = 0x7fffffff;
  return { maxcode, valptr, mincode, symbols, fast, FAST: FAST_BITS };
}

/** One table of `readJpegHeader`'s answer, checked whole against the DHT's. */
function assertTable(t, counts, symbols, what) {
  assert.ok(t && typeof t === "object", `${what}: a table`);
  assert.deepEqual(Object.keys(t).sort(), [...SHAPE].sort(), `${what}: exactly R1's six fields`);
  const want = expectedTable(counts, symbols);
  for (const [field, type, length] of [["maxcode", Int32Array, 18], ["valptr", Int32Array, 17], ["mincode", Int32Array, 17],
    ["symbols", Uint8Array, symbols.length], ["fast", Int32Array, 1 << FAST_BITS]]) {
    assert.equal(Object.getPrototypeOf(t[field]), type.prototype, `${what}.${field}: a ${type.name}`);
    assert.equal(t[field].length, length, `${what}.${field}: length ${length}`);
    assert.deepEqual([...t[field]], want[field], `${what}.${field}: its content`);
  }
  assert.equal(t.FAST, FAST_BITS, `${what}.FAST: the fast table's width in bits`);
}

/** `hts` against every DHT of `d`: one table per class and id, the last definition winning, nothing else. */
function assertHuffmanTables(d, what) {
  const { hts } = readJpegHeader(d);
  assert.deepEqual(Object.keys(hts).sort(), ["ac", "dc"], `${what}: hts holds dc and ac`);
  assert.ok(Array.isArray(hts.dc) && Array.isArray(hts.ac), `${what}: each an array indexed by table id`);
  const last = new Map();
  for (const [tc, th, counts, symbols] of dhtTables(d)) last.set(`${tc}:${th}`, [counts, symbols]);
  assert.ok(last.size > 0, `${what}: the file defines Huffman tables`);
  for (const [cls, list] of [[0, hts.dc], [1, hts.ac]]) {
    const ids = Object.keys(list).map(Number);
    assert.deepEqual(ids, [...last.keys()].filter((k) => k.startsWith(`${cls}:`)).map((k) => Number(k.slice(2))).sort((a, b) => a - b),
      `${what}: ${cls ? "ac" : "dc"} holds exactly the ids the file defines`);
    for (const i of ids) assertTable(list[i], ...last.get(`${cls}:${i}`), `${what} ${cls ? "ac" : "dc"}[${i}]`);
  }
  return hts;
}

test("R1 readJpegHeader's Huffman tables: hts.dc[i] and hts.ac[i], each {maxcode, valptr, mincode, symbols, fast, FAST}, typed and sized as stated", () => {
  let tables = 0;
  for (const v of V.filter((x) => !["refuse-progressive", "refuse-arithmetic"].includes(x.name))) {
    const hts = assertHuffmanTables(jpeg(v.name), v.name);
    tables += Object.keys(hts.dc).length + Object.keys(hts.ac).length;
  }
  assert.ok(tables >= 40, `${tables} tables checked`);
  /* Table ids past 0 and 1, held where the file puts them; several tables in one
   * DHT; codes longer than the fast table, which only maxcode, valptr and mincode
   * decode; a table redefined, the later one answered. The header ends at its SOS,
   * so these markers need no scan data. */
  const dht = (...ts) => {
    const body = ts.flatMap(([tc, th, counts, symbols]) => [(tc << 4) | th, ...counts, ...symbols]);
    return [0xff, 0xc4, (body.length + 2) >> 8, (body.length + 2) & 0xff, ...body];
  };
  const long = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2];      // one code of each length 2..15, two of 16
  const longSyms = Array.from({ length: 16 }, (_, i) => 0x10 + i);
  const short = [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const header = Uint8Array.from([
    0xff, 0xd8,
    ...dht([0, 3, short, [7, 8, 9]], [1, 2, long, longSyms]),
    ...dht([0, 3, [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [5]]),
    0xff, 0xdb, 0x00, 0x43, 0x00, ...Array(64).fill(1),
    0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x08, 0x00, 0x08, 0x01, 0x01, 0x11, 0x00,
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x32, 0x00, 0x3f, 0x00,
  ]);
  const hts = assertHuffmanTables(header, "constructed header");
  assert.deepEqual([Object.keys(hts.dc), Object.keys(hts.ac)], [["3"], ["2"]]);
  assert.deepEqual([...hts.dc[3].symbols], [5], "the later DHT's dc[3]");
  assert.equal(hts.ac[2].fast.filter((f) => f >= 0).length, (1 << 7) + (1 << 6) + (1 << 5) + (1 << 4) + (1 << 3) + (1 << 2) + (1 << 1) + 1,
    "codes of 2..9 bits fill the fast table; longer ones are left to maxcode, valptr and mincode");
});
