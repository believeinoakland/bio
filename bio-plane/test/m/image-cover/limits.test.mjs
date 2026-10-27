/* image-cover: declared sizes are judged before any buffer (R10), and no ceiling is a literal here (R11). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { coverAreas, stripMetadata, COVER_MAX_BYTES, COVER_MAX_PIXELS, COVER_REFUSALS, STRIP_REFUSALS } from "../../../src/image-cover/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { pngDeclaring, pngOfChunks, jpegOfMarkers, jp2OfBoxes, j2kOfMarkers } from "./hostile.mjs";
import { fixture } from "./answers.mjs";

const STRIDE = boundOf("image", "row_stride"), CHUNKS = boundOf("image", "chunks");
const MB = 1048576;

/* the memory a call asked for and kept: the allocation R10 refuses must not be made */
async function lean(run) {
  const before = process.memoryUsage().arrayBuffers;
  let peak = 0;
  const watch = setInterval(() => { peak = Math.max(peak, process.memoryUsage().arrayBuffers - before); }, 1);
  const r = await run();
  clearInterval(watch);
  peak = Math.max(peak, process.memoryUsage().arrayBuffers - before);
  return { r, peak };
}
const refused = (r, why) => {
  assert.deepEqual(Object.keys(r).sort(), ["code", "detail", "ok"], why);
  assert.equal(r.ok, false, why);
  assert.equal(r.code, "IMAGE_TOO_LARGE", `${why}: ${r.code} ${r.detail}`);
};

test("R10 a 70-byte PNG declaring 30,000,000 x 1 RGBA is refused IMAGE_TOO_LARGE, by cover and by strip, naming the declared row and the bound, without the buffers it asked for", async () => {
  const png = pngDeclaring(30_000_000, 1);
  assert.ok(png.length < 100);
  const { r, peak } = await lean(() => coverAreas(png, { areas: [[0, 0, 5, 1]] }));
  refused(r, "cover");
  assert.ok(peak < 32 * MB, `cover asked for ${peak} bytes`);
  assert.match(r.detail, new RegExp(String(30_000_000 * 4)));
  assert.match(r.detail, new RegExp(String(STRIDE)));
  const s = await lean(() => stripMetadata(png));
  refused(s.r, "strip");
  assert.ok(s.peak < 32 * MB);
  assert.match(s.r.detail, new RegExp(String(30_000_000 * 4)));
  assert.match(s.r.detail, new RegExp(String(STRIDE)));
});

test("R10 a PNG row stride at the bound is judged as before, one byte over is IMAGE_TOO_LARGE (cover and strip), for each colour type", async () => {
  for (const [ct, bpp] of [[0, 1], [2, 3], [3, 1], [4, 2], [6, 4]]) {
    const at = pngDeclaring(Math.floor(STRIDE / bpp), 1, ct), over = pngDeclaring(Math.floor(STRIDE / bpp) + 1, 1, ct);
    const c = await coverAreas(at, { areas: [] });
    assert.notEqual(c.code, "IMAGE_TOO_LARGE", `colour type ${ct} at the bound: ${c.detail}`);
    assert.notEqual(stripMetadata(at).code, "IMAGE_TOO_LARGE", `strip, colour type ${ct} at the bound`);
    refused(await coverAreas(over, { areas: [] }), `cover, colour type ${ct}`);
    refused(stripMetadata(over), `strip, colour type ${ct}`);
  }
  /* a stride over the bound is refused for strip at any bit depth, as the row would be */
  refused(stripMetadata(pngDeclaring(STRIDE, 1, 0, 16)), "strip, 16-bit grey");
});

test("R10 a PNG of 1,000,000 empty IDAT chunks is refused IMAGE_TOO_LARGE by cover and strip; the bound's own count is processed as before", async () => {
  const hostile = pngOfChunks(1_000_000);
  const c = await lean(() => coverAreas(hostile, { areas: [] }));
  refused(c.r, "cover");
  assert.ok(c.peak < 32 * MB, `cover asked for ${c.peak} bytes`);
  assert.match(c.r.detail, new RegExp(String(CHUNKS)));
  const s = await lean(() => stripMetadata(hostile));
  refused(s.r, "strip");
  assert.ok(s.peak < 32 * MB);
  assert.match(s.r.detail, new RegExp(String(CHUNKS)));
  const at = pngOfChunks(CHUNKS), over = pngOfChunks(CHUNKS + 1);
  const ok = stripMetadata(at);
  assert.equal(ok.ok, true, ok.detail);
  assert.equal(ok.changed, false);
  assert.notEqual((await coverAreas(at, { areas: [] })).code, "IMAGE_TOO_LARGE");
  refused(stripMetadata(over), "strip one over");
  refused(await coverAreas(over, { areas: [] }), "cover one over");
});

test("R10 a JPEG of 2,000,000 two-byte markers is refused IMAGE_TOO_LARGE by cover and strip; the bound's own count is judged as before", async () => {
  const hostile = jpegOfMarkers(2_000_000);
  const c = await lean(() => coverAreas(hostile, { areas: [] }));
  refused(c.r, "cover");
  assert.ok(c.peak < 32 * MB, `cover asked for ${c.peak} bytes`);
  const s = await lean(() => stripMetadata(hostile));
  refused(s.r, "strip");
  assert.ok(s.peak < 32 * MB);
  assert.match(s.r.detail, new RegExp(String(CHUNKS)));
  /* the markers of the bound (and the closing EOI, one more) are walked; there is no scan, so the refusal is another */
  assert.notEqual(stripMetadata(jpegOfMarkers(CHUNKS - 1)).code, "IMAGE_TOO_LARGE");
  refused(stripMetadata(jpegOfMarkers(CHUNKS)), "one over");
  /* a photo with its tables, EXIF and scan is far under the bound */
  assert.equal(stripMetadata(fixture("444-o3.jpg")).ok, true);
});

test("R10 a JP2 of more boxes than the bound, and a J2K codestream of more markers, are refused IMAGE_TOO_LARGE by strip", () => {
  refused(stripMetadata(jp2OfBoxes(CHUNKS + 1)), "JP2 boxes");
  refused(stripMetadata(j2kOfMarkers(CHUNKS + 1)), "J2K markers");
  assert.notEqual(stripMetadata(jp2OfBoxes(CHUNKS - 1)).code, "IMAGE_TOO_LARGE", "JP2 within the bound");
  assert.notEqual(stripMetadata(j2kOfMarkers(CHUNKS - 10)).code, "IMAGE_TOO_LARGE", "J2K within the bound");
});

test("R10 the refusal is final: the same bytes answer the same refusal, and the code is declared with the others", async () => {
  const png = pngDeclaring(30_000_000, 1);
  const a = await coverAreas(png, { areas: [] }), b = await coverAreas(png, { areas: [] });
  assert.deepEqual(a, b);
  assert.ok("IMAGE_TOO_LARGE" in COVER_REFUSALS && "IMAGE_TOO_LARGE" in STRIP_REFUSALS);
  assert.equal(typeof COVER_REFUSALS.IMAGE_TOO_LARGE, "string");
  assert.ok(!("transient" in a));
});

test("R11 no numeric literal in the module's code is a ceiling it keeps: each ceiling is the table's figure and no file holds one of its own", () => {
  assert.equal(COVER_MAX_BYTES, boundOf("image", "cover_bytes"));
  assert.equal(COVER_MAX_PIXELS, boundOf("image", "pixels"));
  const dir = new URL("../../../src/image-cover/", import.meta.url);
  const figures = [COVER_MAX_BYTES, COVER_MAX_PIXELS, STRIDE, CHUNKS];
  const spelled = (n) => [String(n), n.toLocaleString("en-US").replace(/,/g, "_"), n.toLocaleString("en-US")];
  const shapes = [/\b1024\s*\*\s*1024\b/, /\b1_?048_?576\b/, /\b0x100000\b/, /\b0x1?0000\b/, /\b2\s*\*\*\s*(16|20|23|25)\b/, /\b(8|32)\s*\*\s*1024\b/, /\b(8|32)\s*<<\s*20\b/];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".mjs")) continue;
    const code = readFileSync(new URL(name, dir), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    for (const n of figures) for (const s of spelled(n)) assert.ok(!code.includes(s), `${name} holds the figure ${s}`);
    for (const re of shapes) assert.doesNotMatch(code, re, `${name} holds a ceiling's shape ${re}`);
  }
});
