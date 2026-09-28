/* image-codecs R4, R6: `decodeJpx`, `JPX_REFUSES` and `JpxRefusal` at their
 * interface (build/requirements/image-codecs.md), with N34's memory refusal and
 * N75's line-based decode.
 *
 * INDEPENDENT EXPECTATIONS (R6). Every expected picture is opj_decompress's
 * (OpenJPEG 2.5.0) decode of the same bytes, interleaved samples, written by
 * `../fixtures/make-jpx-fixtures.py` into `../fixtures/jpx-variants.json`, and
 * confirmed by PyMuPDF before it was kept. OpenJPEG shares no line with
 * `jpxdecode.mjs`.
 *
 * PAGES (N75). `./fixtures/jpx-pages.json` (from `./fixtures/make-jpx-pages.py`,
 * the same OpenJPEG and PyMuPDF check) holds single-tile pages whose whole
 * planes, 4 bytes a sample per component, pass the bound: the decode refused
 * them before it was made line-based, and now reads them.
 *
 * THE MEMORY BOUND (N34, N75). A decode's working set is fixed by its headers:
 * the 8-bit output, and beside it, at 4 bytes a sample, one code-block row of
 * every band and a few rows of every level of the largest tile. The tests below
 * re-declare a fixture's image and tile sizes in its SIZ, or its code-block size
 * in its COD, and check the refusal is made from the header, before any sample:
 * a refused declaration takes no time and no memory. */
import "../../../bio-plane/test/sandbox.mjs";

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { decodeJpx, JPX_REFUSES, JpxRefusal } from "../../src/jpxdecode.mjs";

const FIX = JSON.parse(readFileSync(new URL("../fixtures/jpx-variants.json", import.meta.url), "utf8"));
const V = FIX.variants;
const bytesOf = (v) => new Uint8Array(Buffer.from(v.data_b64, "base64"));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const MEMORY = "an image past the memory bound";

function refusal(fn) {
  try { fn(); } catch (e) {
    assert.ok(e instanceof JpxRefusal, `a JpxRefusal, not ${e && e.constructor && e.constructor.name}: ${e && e.message}`);
    return e;
  }
  return null;
}

/** A bare codestream's SIZ with its geometry re-declared. */
function withSiz(v, { X, Y, XT = X, YT = Y }) {
  const d = bytesOf(v);
  let p = 2;
  while (!(d[p] === 0xff && d[p + 1] === 0x51)) p++;
  const put = (at, n) => { d[at] = n >>> 24; d[at + 1] = (n >>> 16) & 0xff; d[at + 2] = (n >>> 8) & 0xff; d[at + 3] = n & 0xff; };
  put(p + 6, X); put(p + 10, Y); put(p + 14, 0); put(p + 18, 0); put(p + 22, XT); put(p + 26, YT); put(p + 30, 0); put(p + 34, 0);
  return d;
}
const bare = (comps) => V.find((v) => v.expect === "ok" && v.container === "j2k" && v.comps === comps);
const named = (name) => V.find((v) => v.name === name);
/** A bare codestream with its COD's code-block size re-declared (exponents). */
function withBlocks(d, xcb, ycb) {
  let p = 2;
  while (!(d[p] === 0xff && d[p + 1] === 0x52)) p++;
  d[p + 10] = xcb - 2; d[p + 11] = ycb - 2;
  return d;
}
const PAGES = JSON.parse(readFileSync(new URL("./fixtures/jpx-pages.json", import.meta.url), "utf8"));

test("R4 R6 the fixtures: OpenJPEG's decode of 114 images and 13 refusals", () => {
  assert.match(FIX.provenance, /OpenJPEG 2\.5\.0/);
  assert.deepEqual([V.filter((v) => v.expect === "ok").length, V.filter((v) => v.expect !== "ok").length], [114, 13]);
  for (const v of V.filter((x) => x.expect === "ok")) assert.match(v.opj_sha256, /^[0-9a-f]{64}$/, v.name);
  assert.deepEqual([...new Set(V.map((v) => v.container))].sort(), ["j2k", "jp2"]);
});

test("R4 R6 every decodable fixture: OpenJPEG's samples, to the bit", () => {
  for (const v of V.filter((x) => x.expect === "ok")) {
    const out = decodeJpx(bytesOf(v));
    assert.deepEqual([out.width, out.height, out.comps], [v.width, v.height, v.comps], v.name);
    assert.equal(out.samples.length, v.width * v.height * v.comps, v.name);
    assert.equal(sha(out.samples), v.opj_sha256, `${v.name}: OpenJPEG's samples`);
  }
});

test("R4 both wavelets, both colour transforms, every progression, tiles: what the corpus decodes", () => {
  const seen = { transform: new Set(), progression: new Set(), tiled: false, mct: new Set(), container: new Set() };
  for (const v of V.filter((x) => x.expect === "ok")) {
    const { detail } = decodeJpx(bytesOf(v));
    seen.transform.add(detail.transform); seen.progression.add(detail.progression); seen.container.add(detail.container);
    if (detail.tiles > 1) seen.tiled = true;
    if (v.comps === 3) seen.mct.add(`${detail.transform}:${detail.colour_transform}`);
  }
  assert.deepEqual([...seen.transform].sort(), ["5/3", "9/7"]);
  assert.deepEqual([...seen.progression].sort(), ["CPRL", "LRCP", "PCRL", "RLCP", "RPCL"]);
  assert.deepEqual([...seen.container].sort(), ["codestream", "jp2"]);
  assert.ok(seen.tiled);
  for (const k of ["5/3:true", "9/7:true"]) assert.ok(seen.mct.has(k), `${k} (RCT and ICT)`);
});

test("R4 what it cannot decode is a JpxRefusal; an UNSUPPORTED one names its feature, a key of JPX_REFUSES", () => {
  const driven = new Set();
  for (const v of V.filter((x) => x.expect !== "ok")) {
    const e = refusal(() => decodeJpx(bytesOf(v)));
    assert.ok(e, `${v.name}: refused`);
    assert.equal(e.code, v.expect, v.name);
    assert.ok(["UNSUPPORTED", "UNSUPPORTED_SAMPLES", "TRUNCATED", "CORRUPT"].includes(e.code), v.name);
    if (e.code === "UNSUPPORTED") {
      assert.ok(e.detail.feature in JPX_REFUSES, `${v.name}: '${e.detail.feature}' is declared`);
      assert.equal(e.detail.feature, v.name.slice("UNSUPPORTED:".length), v.name);
      driven.add(e.detail.feature);
    }
  }
  driven.add(refusal(() => decodeJpx(withSiz(bare(3), { X: 5000, Y: 5000 }))).detail.feature);
  assert.deepEqual([...driven].sort(), Object.keys(JPX_REFUSES).sort(), "every declared refusal is driven");
});

test("R4 R6 N75 pages past the whole-plane working set decode, to OpenJPEG's bit", () => {
  assert.match(PAGES.provenance, /OpenJPEG 2\.5\.0/);
  assert.equal(PAGES.pages.length, 4);
  for (const pg of PAGES.pages) {
    assert.ok(pg.comps * pg.width * pg.height * 4 > 61_300_000, `${pg.name}: its whole planes pass the bound`);
    const out = decodeJpx(new Uint8Array(Buffer.from(pg.data_b64, "base64")));
    assert.deepEqual([out.width, out.height, out.comps, out.detail.tiles], [pg.width, pg.height, pg.comps, 1], pg.name);
    assert.equal(sha(out.samples), pg.opj_sha256, `${pg.name}: OpenJPEG's samples`);
  }
  assert.deepEqual([...new Set(PAGES.pages.map((pg) => `${pg.comps}:${pg.args.includes("-I") ? "9/7" : "5/3"}`))].sort(), ["1:9/7", "3:5/3", "3:9/7"]);
});

test("R4 N34 a decode past the memory bound is refused by name, from the header, before any sample", () => {
  const e = refusal(() => decodeJpx(withSiz(bare(3), { X: 5000, Y: 5000 })));
  assert.equal(e.code, "UNSUPPORTED");
  assert.equal(e.detail.feature, MEMORY);
  assert.deepEqual([e.detail.width, e.detail.height, e.detail.components], [5000, 5000, 3]);
  assert.ok(e.detail.working_set_bytes > 5000 * 5000 * 3, "the output, and the decode's buffers beside it");
  assert.equal(e.detail.bound_bytes, 61_300_000);
  assert.ok(e.message.includes(MEMORY));
  /* A declaration far past any memory is refused just as fast: nothing is allocated. */
  const t0 = performance.now();
  const huge = refusal(() => decodeJpx(withSiz(bare(1), { X: 60000, Y: 60000 })));
  assert.equal(huge.detail.feature, MEMORY);
  assert.ok(huge.detail.working_set_bytes > 60000 * 60000);
  assert.ok(performance.now() - t0 < 200);
});

test("N34 N75 the working set is what the bound counts: the output, and one code-block row of every band beside it", () => {
  const bound = 61_300_000;
  const memory = (d) => { const e = refusal(() => decodeJpx(d)); return e && e.detail.feature === MEMORY ? e.detail.working_set_bytes : 0; };
  const grey = () => withSiz(named("9-7-levels-5-grey"), { X: 7800, Y: 7850 });
  /* Grey, one tile, 64x64 code-blocks. The output alone decides the far side. */
  assert.ok(memory(withSiz(named("9-7-levels-5-grey"), { X: 7900, Y: 7800 })) > 7900 * 7800, "61.6 MB of output: refused");
  /* 61.2 MB of output, inside the bound; the buffers beside it take it past. */
  assert.ok(7800 * 7850 < bound);
  const ws = memory(grey());
  assert.ok(ws > bound, "the output and the buffers: refused");
  /* The buffers are a strip of rows per band, not a plane: a page's are a few MB. */
  assert.ok(ws - 7800 * 7850 < 7800 * 7850 / 8, `buffers of ${ws - 7800 * 7850} bytes`);
  assert.equal(memory(withSiz(named("9-7-levels-5-grey"), { X: 7000, Y: 7000 })), 0, "49 MB of output and its buffers: not refused for memory");
  /* The strip is the code-block's height: 16x256 blocks hold four times the rows of 64x64 ones. */
  const tall = memory(withBlocks(withSiz(named("9-7-levels-5-grey"), { X: 7800, Y: 7850 }), 4, 8));
  assert.ok(tall > ws, "taller code-blocks, larger strips");
  assert.equal(memory(withBlocks(withSiz(named("9-7-levels-5-grey"), { X: 5000, Y: 5000 }), 2, 10)) > 0, true,
    "4x1024 code-blocks: 25 MB of output, and 1024-row strips of every band, refused");
  assert.equal(memory(withSiz(named("9-7-levels-5-grey"), { X: 5000, Y: 5000 })), 0, "the same page in 64x64 code-blocks is not");
  /* A single-tile colour page the whole-plane decode refused (101 MB of planes) is no longer refused. */
  assert.equal(memory(withSiz(bare(3), { X: 2550, Y: 3300 })), 0, "one tile, 25.2 MB of output");
  /* Tiles do not escape the bound: the output alone can pass it. */
  assert.ok(memory(withSiz(bare(3), { X: 4600, Y: 4600, XT: 256, YT: 256 })) > 4600 * 4600 * 3, "tiled, 63.5 MB of output");
  /* The largest tile is the one counted, wherever the tile grid's edges fall. */
  assert.equal(memory(withSiz(bare(1), { X: 7000, Y: 7000, XT: 9000, YT: 9000 })), 0, "a tile larger than the image is clipped to it");
});

test("R4 the page sizes the bound admits still decode: the corpus is untouched by it", () => {
  for (const v of V.filter((x) => x.expect === "ok")) {
    const e = refusal(() => decodeJpx(bytesOf(v)));
    assert.equal(e, null, v.name);
  }
});
