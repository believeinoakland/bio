/* image-codecs R10, R6, R7: `decodePng`, `PNG_REFUSES` and `PngRefusal` at their
 * interface (build/requirements/image-codecs.md; T43, N853b).
 *
 * INDEPENDENT EXPECTATIONS (R6). Every expected picture is Pillow 12.3.0's decode
 * of the same bytes, written by `fixtures/make-png-fixtures.py` into
 * `fixtures/png-variants.json`: every file of PngSuite (2017jul19, copied unchanged
 * into `fixtures/pngsuite/`), and six pictures Pillow writes for what the suite
 * leaves thin (the composite over every sample and alpha, tRNS keys that are not
 * white, several IDAT chunks). Pillow shares no line with `pngdecode.mjs`. If a
 * fixture changes, re-run the script; never copy a failing run's output.
 *
 * The refusals no fixture carries are made below from a suite file, each by the
 * one change named where it is made; chunks are re-written with their CRC from
 * node's own `zlib.crc32`, and image data with node's own `zlib`, so a damaged
 * file is damaged only where the test says. */
import "../../../bio-plane/test/sandbox.mjs";

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { crc32, deflateSync, inflateSync } from "node:zlib";
import { decodePng, PNG_REFUSES, PngRefusal } from "../../src/pngdecode.mjs";

const FIX = JSON.parse(readFileSync(new URL("fixtures/png-variants.json", import.meta.url), "utf8"));
const SUITE = FIX.suite, VARIANTS = FIX.variants;
const file = (name) => new Uint8Array(readFileSync(new URL(`fixtures/pngsuite/${name}`, import.meta.url)));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const CODES = ["NOT_A_PNG", "UNSUPPORTED", "TRUNCATED", "CORRUPT"];
const LEGAL = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };

/** The refusal `decodePng(d)` rejects with: always a PngRefusal, its code one of R10's. */
async function refusal(d) {
  try { await decodePng(d); } catch (e) {
    assert.ok(e instanceof PngRefusal, `a PngRefusal, not ${e && e.constructor && e.constructor.name}: ${e && e.message}`);
    assert.ok(CODES.includes(e.code), `code ${e.code}`);
    assert.ok(e.detail && typeof e.detail === "object" && Object.keys(e.detail).length > 0, `${e.code}: a detail that says why`);
    if (e.code === "UNSUPPORTED") assert.ok(e.detail.feature in PNG_REFUSES, `'${e.detail.feature}' is declared`);
    return e;
  }
  assert.fail("no refusal");
}

/* ── a PNG's chunks, read and re-written by the test itself ───────────────── */
const be32 = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
function chunksOf(d) {
  const out = [];
  for (let p = 8; p + 8 <= d.length;) {
    const len = ((d[p] << 24) | (d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]) >>> 0;
    out.push({ type: String.fromCharCode(...d.subarray(p + 4, p + 8)), data: d.slice(p + 8, p + 8 + len) });
    p += 12 + len;
  }
  return out;
}
function chunk(type, data) {
  const td = Uint8Array.from([...Buffer.from(type, "latin1"), ...data]);
  return [...be32(data.length), ...td, ...be32(crc32(td))];
}
const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const png = (chunks) => Uint8Array.from([...SIG, ...chunks.flatMap((c) => chunk(c.type, c.data))]);
/** A suite file with its chunks passed through `edit` and re-written. */
const edited = (name, edit) => png(edit(chunksOf(file(name))));
/** The file's IDAT data inflated: the filtered rows. */
const rowsOf = (d) => inflateSync(Buffer.concat(chunksOf(d).filter((c) => c.type === "IDAT").map((c) => c.data)));
/** A file's IDATs replaced by one holding `zdata`. */
const withIdat = (cs, zdata) => {
  const i = cs.findIndex((c) => c.type === "IDAT");
  return [...cs.slice(0, i), { type: "IDAT", data: zdata }, ...cs.slice(i).filter((c) => c.type !== "IDAT")];
};
const withIhdr = (cs, patch) => cs.map((c) => {
  if (c.type !== "IHDR") return c;
  const d = Uint8Array.from(c.data);
  for (const [at, bytes] of patch) d.set(bytes, at);
  return { type: "IHDR", data: d };
});

test("R10 R6 the fixtures: Pillow 12.3.0 over every file of PngSuite 2017jul19, and the suite's files as released", () => {
  assert.match(FIX.provenance, /^Pillow 12\.3\.0 .*PngSuite 2017jul19 \(sha256 0294b244c95a8342c01b00010cf34abdcabc7c6a34fd0fe1bd963917537bfdc8\)/);
  const names = readdirSync(new URL("fixtures/pngsuite/", import.meta.url)).filter((n) => n.endsWith(".png")).sort();
  assert.deepEqual(SUITE.map((e) => e.name), names, "one entry for each of the suite's files");
  assert.equal(names.length, 176);
  for (const e of SUITE) assert.equal(sha(file(e.name)), e.file_sha256, `${e.name}: the file as the script copied it`);
  const ok = SUITE.filter((e) => e.expect === "ok");
  assert.equal(ok.length, 127);
  for (const e of [...ok, ...VARIANTS]) assert.match(e.pillow_sha256, /^[0-9a-f]{64}$/, e.name);
});

test("R10 R6 every image of the suite this module decodes: Pillow's samples, to the bit", async () => {
  for (const e of SUITE.filter((x) => x.expect === "ok")) {
    const out = await decodePng(file(e.name));
    assert.deepEqual([out.width, out.height, out.comps], [e.width, e.height, e.comps], e.name);
    assert.equal(out.samples.length, e.width * e.height * e.comps, e.name);
    assert.equal(sha(out.samples), e.pillow_sha256, `${e.name}: Pillow's samples`);
    assert.deepEqual([out.detail.colour_type, out.detail.bit_depth], [e.colour_type, e.bit_depth], e.name);
  }
});

test("R10 colour types 0, 2, 3, 4 and 6 at every legal depth and filters 0–4, each in a picture decoded to Pillow's", async () => {
  const decoded = SUITE.filter((x) => x.expect === "ok");
  const pairs = new Set(decoded.map((e) => `${e.colour_type}:${e.bit_depth}`));
  assert.deepEqual([...pairs].sort(), Object.entries(LEGAL).flatMap(([ct, ds]) => ds.map((d) => `${ct}:${d}`)).sort());
  /* Grey types answer one component, the rest three; a palette is expanded. */
  for (const e of decoded) assert.equal(e.comps, e.colour_type === 0 || e.colour_type === 4 ? 1 : 3, e.name);
  /* Each filter type, read from the decoded files' own rows (inflated here). */
  const filters = new Set();
  for (const e of decoded) {
    const d = file(e.name), rows = rowsOf(d);
    const ihdr = chunksOf(d)[0].data, ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr[9]];
    const rb = Math.ceil((e.width * ch * ihdr[8]) / 8) + 1;
    for (let y = 0; y < e.height; y++) filters.add(rows[y * rb]);
  }
  assert.deepEqual([...filters].sort(), [0, 1, 2, 3, 4]);
  for (const f of ["f00n0g08", "f01n0g08", "f02n0g08", "f03n0g08", "f04n0g08", "f00n2c08", "f01n2c08", "f02n2c08", "f03n2c08", "f04n2c08", "f99n0g04"]) {
    const e = SUITE.find((x) => x.name === `${f}.png`);
    assert.equal(sha((await decodePng(file(e.name))).samples), e.pillow_sha256, `${f}: one filter throughout (f99: all five)`);
  }
});

test("R10 R6 transparency over white: every (sample, alpha) pair, tRNS keys that are not white, a palette's alphas; several IDAT chunks", async () => {
  assert.deepEqual(VARIANTS.map((v) => v.name), ["composite-rgba8-every-pair", "composite-la8-every-pair", "trns-grey8-key-128",
    "trns-rgb8-key-coloured", "trns-palette8-alphas", "gradient-rgb8-several-idat"]);
  const TRANSPARENCY = { "composite-rgba8-every-pair": "alpha channel", "composite-la8-every-pair": "alpha channel",
    "trns-grey8-key-128": "tRNS", "trns-rgb8-key-coloured": "tRNS", "trns-palette8-alphas": "tRNS", "gradient-rgb8-several-idat": null };
  for (const v of VARIANTS) {
    const d = new Uint8Array(Buffer.from(v.data_b64, "base64"));
    const out = await decodePng(d);
    assert.deepEqual([out.width, out.height, out.comps], [v.width, v.height, v.comps], v.name);
    assert.equal(sha(out.samples), v.pillow_sha256, `${v.name}: Pillow's samples`);
    assert.equal(out.detail.transparency, TRANSPARENCY[v.name], v.name);
  }
  /* Over white: alpha 0 is white whatever the sample, alpha 255 the sample itself. */
  const la = await decodePng(new Uint8Array(Buffer.from(VARIANTS[1].data_b64, "base64")));
  for (let x = 0; x < 256; x++) {
    assert.equal(la.samples[x], 255, `grey ${x} at alpha 0`);
    assert.equal(la.samples[255 * 256 + x], x, `grey ${x} at alpha 255`);
  }
  assert.ok(chunksOf(new Uint8Array(Buffer.from(VARIANTS[5].data_b64, "base64"))).filter((c) => c.type === "IDAT").length > 1);
  /* The suite's own: alpha at 8 and 16 bits, tRNS on grey, colour and palettes. */
  for (const n of ["basn4a08", "basn4a16", "basn6a08", "basn6a16", "tbbn0g04", "tbrn2c08", "tbbn2c16", "tbwn0g16", "tbbn3p08", "tm3n3p02"])
    assert.notEqual((await decodePng(file(`${n}.png`))).detail.transparency, null, n);
});

test("R10 an interlaced image is refused UNSUPPORTED 'interlaced' from its header, and its non-interlaced twin decodes (negative control)", async () => {
  const interlaced = SUITE.filter((e) => e.expect === "UNSUPPORTED");
  assert.equal(interlaced.length, 35);
  let twins = 0;
  for (const e of interlaced) {
    assert.equal(e.feature, "interlaced");
    const r = await refusal(file(e.name));
    assert.deepEqual([r.code, r.detail.feature], ["UNSUPPORTED", "interlaced"], e.name);
    const twin = SUITE.find((x) => x.name === e.name.replace(/^(...)i/, "$1n"));
    if (!twin) continue;                               // bgai4a08 and bgai4a16 have none in the suite
    twins++;
    assert.equal(twin.expect, "ok", `${twin.name}: the same picture, stored without interlace`);
    assert.equal(sha((await decodePng(file(twin.name))).samples), twin.pillow_sha256, twin.name);
  }
  assert.equal(twins, 33);
  /* Refused before the image data is read: with its IDAT gone, the same answer. */
  const r = await refusal(edited("basi2c08.png", (cs) => cs.map((c) => (c.type === "IDAT" ? { type: "IDAT", data: new Uint8Array([1, 2, 3]) } : c))));
  assert.equal(r.detail.feature, "interlaced");
});

test("R10 a truncated PNG is refused TRUNCATED wherever it is cut (negative control)", async () => {
  for (const name of ["basn6a08.png", "basn0g01.png", "oi9n2c16.png"]) {
    const d = file(name);
    const ok = SUITE.find((e) => e.name === name);
    assert.equal(sha((await decodePng(d)).samples), ok.pillow_sha256, `${name}: whole, it decodes`);
    for (let cut = 8; cut < d.length; cut += Math.max(1, Math.floor(d.length / 97))) {
      const r = await refusal(d.subarray(0, cut));
      assert.equal(r.code, "TRUNCATED", `${name} cut at ${cut} of ${d.length}: ${r.message}`);
    }
    for (const cut of [d.length - 1, d.length - 4, d.length - 12]) assert.equal((await refusal(d.subarray(0, cut))).code, "TRUNCATED", `${name} cut at ${cut}`);
  }
  /* A whole zlib stream of too few rows, in well-formed chunks: the rows run out. */
  const rows = rowsOf(file("basn2c08.png"));
  const short = edited("basn2c08.png", (cs) => withIdat(cs, deflateSync(rows.subarray(0, rows.length >> 1))));
  const r = await refusal(short);
  assert.equal(r.code, "TRUNCATED");
  assert.deepEqual([r.detail.rows, r.detail.height], [16, 32]);
  /* A zlib stream itself cut, inside well-formed chunks, is damage the inflater
   * names in its own words (which differ between platforms): CORRUPT, with them. */
  const z = deflateSync(rows);
  const cut = await refusal(edited("basn2c08.png", (cs) => withIdat(cs, z.subarray(0, z.length >> 1))));
  assert.equal(cut.code, "CORRUPT", "a zlib stream cut");
  assert.ok(cut.detail.inflater.length > 0 && cut.detail.rows < 32);
  /* Fewer than the signature's eight bytes are not a PNG. */
  for (const cut of [0, 1, 7]) assert.equal((await refusal(file("basn6a08.png").subarray(0, cut))).code, "NOT_A_PNG", `cut at ${cut}`);
});

test("R10 the suite's damaged files are refused under the codec's own codes", async () => {
  const damaged = SUITE.filter((e) => e.name.startsWith("x"));
  assert.equal(damaged.length, 14);
  for (const e of damaged) {
    const r = await refusal(file(e.name));
    assert.equal(r.code, e.expect, `${e.name} (${e.why}): ${r.message}`);
  }
});

test("R10 R7 every other refusal, each as the bytes require; every code and every PNG_REFUSES key driven", async () => {
  const rows = rowsOf(file("basn3p08.png"));
  const highIndex = (() => { const r = Uint8Array.from(rows); r[1] = 255; return r; })();
  const cases = [
    ["not bytes", "\x89PNG\r\n\x1a\n", "NOT_A_PNG"],
    ["an ArrayBuffer, not a Uint8Array", file("basn0g08.png").buffer, "NOT_A_PNG"],
    ["a JPEG", Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1]), "NOT_A_PNG"],
    ["an unknown critical chunk (cHNK) before IDAT", edited("basn0g08.png", (cs) => [cs[0], { type: "CHNK", data: new Uint8Array(4) }, ...cs.slice(1)]), "UNSUPPORTED"],
    ["Apple's CgBI chunk before IHDR", edited("basn6a08.png", (cs) => [{ type: "CgBI", data: new Uint8Array([0x50, 0, 0x20, 2]) }, ...cs]), "UNSUPPORTED"],
    ["a chunk type that is not letters", edited("basn0g08.png", (cs) => [cs[0], { type: "t3Xt", data: new Uint8Array(1) }, ...cs.slice(1)]), "CORRUPT"],
    ["IDAT before IHDR", edited("basn0g08.png", (cs) => [cs[1], cs[0], ...cs.slice(2)]), "CORRUPT"],
    ["two IHDR chunks", edited("basn0g08.png", (cs) => [cs[0], cs[0], ...cs.slice(1)]), "CORRUPT"],
    ["an IHDR of 12 bytes", edited("basn0g08.png", (cs) => [{ type: "IHDR", data: cs[0].data.subarray(0, 12) }, ...cs.slice(1)]), "CORRUPT"],
    ["a width of 0", edited("basn0g08.png", (cs) => withIhdr(cs, [[0, [0, 0, 0, 0]]])), "CORRUPT"],
    ["a height past 2^31 - 1", edited("basn0g08.png", (cs) => withIhdr(cs, [[4, [0x80, 0, 0, 0]]])), "CORRUPT"],
    ["compression method 1", edited("basn0g08.png", (cs) => withIhdr(cs, [[10, [1]]])), "CORRUPT"],
    ["filter method 1", edited("basn0g08.png", (cs) => withIhdr(cs, [[11, [1]]])), "CORRUPT"],
    ["interlace method 2", edited("basn0g08.png", (cs) => withIhdr(cs, [[12, [2]]])), "CORRUPT"],
    ["16-bit palette", edited("basn3p08.png", (cs) => withIhdr(cs, [[8, [16]]])), "CORRUPT"],
    ["a palette image without PLTE", edited("basn3p08.png", (cs) => cs.filter((c) => c.type !== "PLTE")), "CORRUPT"],
    ["PLTE only after the image data", edited("basn3p08.png", (cs) => [...cs.filter((c) => c.type !== "PLTE" && c.type !== "IEND"), cs.find((c) => c.type === "PLTE"), cs.at(-1)]), "CORRUPT"],
    ["a PLTE of 4 bytes", edited("basn3p08.png", (cs) => cs.map((c) => (c.type === "PLTE" ? { type: "PLTE", data: c.data.subarray(0, 4) } : c))), "CORRUPT"],
    ["a palette index past the palette", edited("basn3p08.png", (cs) => withIdat(cs.map((c) => (c.type === "PLTE" ? { type: "PLTE", data: c.data.subarray(0, 30) } : c)), deflateSync(highIndex))), "CORRUPT"],
    ["filter type 5", edited("basn0g08.png", (cs) => { const r = Uint8Array.from(rowsOf(file("basn0g08.png"))); r[33 * 3] = 5; return withIdat(cs, deflateSync(r)); }), "CORRUPT"],
    ["IDAT chunks of no data", edited("basn0g08.png", (cs) => withIdat(cs, new Uint8Array(0))), "CORRUPT"],
    ["deflate data that does not inflate", edited("basn0g08.png", (cs) => { const z = Uint8Array.from(deflateSync(rowsOf(file("basn0g08.png")))); z[2] ^= 0xff; z[3] ^= 0xff; return withIdat(cs, z); }), "CORRUPT"],
    ["a damaged Adler-32", edited("basn0g08.png", (cs) => { const z = Uint8Array.from(deflateSync(rowsOf(file("basn0g08.png")))); z[z.length - 1] ^= 1; return withIdat(cs, z); }), "CORRUPT"],
    ["image data past the frame", edited("basn0g08.png", (cs) => withIdat(cs, deflateSync(Buffer.concat([rowsOf(file("basn0g08.png")), Buffer.alloc(33)])))), "CORRUPT"],
    ["interlaced", file("basi6a08.png"), "UNSUPPORTED"],
    ["a frame past the memory bound", edited("basn0g08.png", (cs) => withIhdr(cs, [[0, be32(9000)], [4, be32(9000)]])), "UNSUPPORTED"],
    ["a damaged PLTE CRC", (() => { const d = file("basn3p08.png"); let p = 8; while (String.fromCharCode(...d.subarray(p + 4, p + 8)) !== "PLTE") p += 12 + ((d[p] << 24 | d[p + 1] << 16 | d[p + 2] << 8 | d[p + 3]) >>> 0); d[p + 8] ^= 1; return d; })(), "CORRUPT"],
  ];
  const seen = new Set(["TRUNCATED"]), features = new Set();
  for (const [label, d, code] of cases) {
    const r = await refusal(d);
    assert.equal(r.code, code, `${label}: ${r.message}`);
    seen.add(r.code);
    if (r.code === "UNSUPPORTED") features.add(r.detail.feature);
  }
  assert.deepEqual([...seen].sort(), [...CODES].sort(), "every code R10's refusals take is driven (TRUNCATED above)");
  assert.deepEqual([...features].sort(), Object.keys(PNG_REFUSES).sort(), "every declared refusal is reachable");
  /* What a decoder may pass over is passed over: an ancillary chunk it does not read
   * (its CRC unchecked), and bytes after IEND. */
  const e = SUITE.find((x) => x.name === "basn0g08.png");
  const text = chunk("tEXt", [...Buffer.from("Comment\0x")]);
  text[text.length - 1] ^= 1;
  const d = file("basn0g08.png");
  const plus = Uint8Array.from([...d.subarray(0, 33), ...text, ...d.subarray(33), 1, 2, 3]);
  assert.equal(sha((await decodePng(plus)).samples), e.pillow_sha256);
});

test("R10 R7 a frame past the memory bound is refused from its header, before any sample, and the bound counts the output", async () => {
  const sized = (name, w, h) => edited(name, (cs) => withIhdr(cs, [[0, be32(w)], [4, be32(h)]]));
  const memory = async (d) => { const r = await refusal(d); return r.detail.feature === "an image past the memory bound" ? r : null; };
  const r = await memory(sized("basn2c08.png", 6000, 6000));
  assert.ok(r, "a 6000x6000 colour frame");
  assert.deepEqual([r.code, r.detail.width, r.detail.height, r.detail.components, r.detail.bound_bytes], ["UNSUPPORTED", 6000, 6000, 3, 61_300_000]);
  assert.equal(r.detail.working_set_bytes, 6000 * 6000 * 3 + 2 * (6000 * 3 + 1), "the output, and two stored rows");
  /* A declaration far past any memory is refused just as fast: nothing is allocated. */
  const t0 = performance.now();
  const huge = await memory(sized("basn6a16.png", 0x7fffffff, 0x7fffffff));
  assert.ok(huge && huge.detail.working_set_bytes > 2 ** 62);
  assert.ok(performance.now() - t0 < 200);
  /* The output is 8-bit, one component for grey and three for the rest, alpha and 16 bits included. */
  assert.equal((await memory(sized("basn6a16.png", 4400, 4643))).detail.components, 3, "RGBA 16-bit: 61.29 MB of output, its two 35 KB rows past the bound");
  assert.equal(await memory(sized("basn6a16.png", 4400, 4500)), null, "59.4 MB of output: not refused for memory (refused for its data)");
  assert.ok(await memory(sized("basn0g08.png", 7900, 7800)), "grey, 61.6 MB of output");
  assert.equal(await memory(sized("basn4a16.png", 7800, 7850)), null, "grey and alpha at 16 bits, 61.2 MB of output and 62 KB of rows: within it");
});

test("R10 decodePng answers a Promise: a picture resolves, every refusal rejects and none is thrown at the call", async () => {
  const good = decodePng(file("basn0g08.png"));
  assert.ok(good instanceof Promise);
  assert.equal((await good).comps, 1);
  for (const d of [null, new Uint8Array(3), file("xc1n0g08.png"), file("basi0g08.png"), file("basn0g08.png").subarray(0, 50)]) {
    let p;
    assert.doesNotThrow(() => { p = decodePng(d); });
    assert.ok(p instanceof Promise);
    await assert.rejects(p, PngRefusal);
  }
});
