/* image-codecs R4, R6: `decodeJpx`, `JPX_REFUSES` and `JpxRefusal` at their
 * interface (build/requirements/image-codecs.md), with N34's memory refusal.
 *
 * INDEPENDENT EXPECTATIONS (R6). Every expected picture is opj_decompress's
 * (OpenJPEG 2.5.0) decode of the same bytes, interleaved samples, written by
 * `../fixtures/make-jpx-fixtures.py` into `../fixtures/jpx-variants.json`, and
 * confirmed by PyMuPDF before it was kept. OpenJPEG shares no line with
 * `jpxdecode.mjs`.
 *
 * THE MEMORY BOUND (N34). A decode's working set is fixed by its SIZ marker:
 * 4 bytes a sample for every component of the largest tile, and a tiled image's
 * 8-bit output beside them. The tests below re-declare a fixture's image and tile
 * sizes in its SIZ and check the refusal is made from the header, before any
 * plane: a refused declaration takes no time and no memory. */
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
  driven.add(refusal(() => decodeJpx(withSiz(bare(3), { X: 2550, Y: 3300 }))).detail.feature);
  assert.deepEqual([...driven].sort(), Object.keys(JPX_REFUSES).sort(), "every declared refusal is driven");
});

test("R4 N34 a decode past the memory bound is refused by name, from the header, before any plane", () => {
  const e = refusal(() => decodeJpx(withSiz(bare(3), { X: 2550, Y: 3300 })));
  assert.equal(e.code, "UNSUPPORTED");
  assert.equal(e.detail.feature, MEMORY);
  assert.deepEqual([e.detail.width, e.detail.height, e.detail.components], [2550, 3300, 3]);
  assert.equal(e.detail.working_set_bytes, 2550 * 3300 * 3 * 4, "three 4-byte planes of the one tile");
  assert.equal(e.detail.bound_bytes, 61_300_000);
  assert.ok(e.message.includes(MEMORY));
  /* A declaration far past any memory is refused just as fast: nothing is allocated. */
  const t0 = performance.now();
  const huge = refusal(() => decodeJpx(withSiz(bare(1), { X: 60000, Y: 60000 })));
  assert.equal(huge.detail.feature, MEMORY);
  assert.ok(performance.now() - t0 < 200);
});

test("N34 the working set is what the bound counts: planes of the largest tile, and a tiled image's output", () => {
  const bound = 61_300_000;
  const memoryRefused = (d) => { const e = refusal(() => decodeJpx(d)); return !!e && e.detail.feature === MEMORY; };
  /* Grey, one tile: 4 bytes a sample. 3910x3910 is 61,152,400 bytes; 3920x3910 is 61,308,800. */
  assert.ok(3910 * 3910 * 4 <= bound && 3920 * 3910 * 4 > bound);
  assert.equal(memoryRefused(withSiz(bare(1), { X: 3910, Y: 3910 })), false, "just inside: not refused for memory");
  assert.equal(memoryRefused(withSiz(bare(1), { X: 3920, Y: 3910 })), true, "just past: refused");
  /* The same colour page in 1024x1024 tiles: three tile planes (12.6 MB) and the output (25.2 MB). */
  assert.equal(memoryRefused(withSiz(bare(3), { X: 2550, Y: 3300 })), true, "one tile: 101 MB");
  assert.equal(memoryRefused(withSiz(bare(3), { X: 2550, Y: 3300, XT: 1024, YT: 1024 })), false, "tiled: 37.8 MB");
  /* Tiles do not escape the bound: the output alone can pass it. */
  assert.equal(memoryRefused(withSiz(bare(3), { X: 4600, Y: 4600, XT: 256, YT: 256 })), true, "tiled, 63.5 MB of output");
  /* The largest tile is the one counted, wherever the tile grid's edges fall. */
  assert.equal(memoryRefused(withSiz(bare(1), { X: 3910, Y: 3910, XT: 5000, YT: 5000 })), false, "a tile larger than the image is clipped to it");
});

test("R4 the page sizes the bound admits still decode: the corpus is untouched by it", () => {
  for (const v of V.filter((x) => x.expect === "ok")) {
    const e = refusal(() => decodeJpx(bytesOf(v)));
    assert.equal(e, null, v.name);
  }
});
