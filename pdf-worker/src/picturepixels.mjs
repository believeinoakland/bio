/* picturepixels.mjs — a PICTURE FILE (a JPEG or a PNG a member uploaded, a
 * photographed page) as upright grey PNG pixels small enough to send on:
 * pdf-pixels R42 and R43 (T43; N853b; K2611, K2691).
 *
 * WHY IT NEVER HANDS ON THE FILE'S OWN BYTES. A page renderer's DCT pass-through
 * (`pagepixels.mjs`, R22) gives the publisher's JPEG untouched; this does not.
 * agent-worker R63 (Bob's K1888) admits only pixels this system made, so a
 * picture is always decoded, turned, made grey and re-encoded here: a PNG's text
 * chunks, an EXIF block or anything else the file carries never reaches the
 * model. The answer is a PNG this module wrote, or a stated refusal.
 *
 * WHAT "CORRECT" MEANS. Every step is Pillow's own, so an independent reader can
 * reproduce `pixels_sha256`: `ImageOps.exif_transpose` (R43), `convert("L")`
 * (ITU-R 601-2 luma in Pillow's fixed point, `Convert.c`'s `L24`) and
 * `reduce(k)` (`Reduce.c`: a box average whose division is Pillow's fixed-point
 * multiplier, with partial boxes on the right and bottom edges averaged over the
 * pixels present). The JPEG decode is image-codecs' R1, bit-exact with libjpeg;
 * the PNG decode is its R10.
 *
 * MEMORY. A 48-megapixel colour photo is 145 MB of samples, more than the
 * isolate's 128 MB. So a JPEG is decoded WHILE it is reduced (T44; N868): the
 * decoder hands over a strip of finished rows at a time (image-codecs R11) and
 * each row is summed, grey when asked, into the one band of boxes it falls in;
 * only the small picture is kept. The full frame is judged from the HEADER,
 * before anything is allocated, against `PICTURE_SOURCE_MAX`, the reduced one
 * against `PICTURE_FRAME_MAX`. A PNG is still decoded whole (image-codecs R10),
 * so its full frame is judged against `PICTURE_FRAME_MAX` (T43-5's measure).
 */

import { readJpegHeader, decodeBaselineJpegRows, DctRefusal } from "./dctdecode.mjs";
import { decodePng, PngRefusal, PNG_REFUSES } from "./pngdecode.mjs";
import { REFUSALS, DCT_TO_REFUSAL, featureReasons, encodePng8 } from "./pagepixels.mjs";

/** The largest frame held whole here, as `width × height × components`
 *  (R42): a PNG's full frame, read from its header, and a JPEG's REDUCED frame,
 *  `ceil(width/k) × ceil(height/k) × components`. 4096 × 3072 × 3, a
 *  12.6-megapixel colour frame, so the 12-megapixel cameras (4032×3024,
 *  4000×3000, 4080×3072) pass whole. Measured at T43-5 (its job record): a
 *  whole decode's live working set is 2.0–2.33 bytes per sample, so this bound
 *  holds it under 88 MB of a 128 MB isolate. */
export const PICTURE_FRAME_MAX = 4096 * 3072 * 3;

/** The largest JPEG frame decoded here, as `width × height × components` read
 *  from its header (R42, T44): 16384 × 12288 × 3, a 201-megapixel colour
 *  frame, so the 48 MP (8000×6000, 8064×6048) and 200 MP (16320×12240) phone
 *  frames pass either way up. Decoded while reduced, memory no longer grows
 *  with the frame (measured at T44-2, its job record: a peak 13–16 MB over the
 *  process's own, at 48 and at 195 MP, beside the input bytes the caller
 *  holds), so the bound is CPU time: 40–60 ms per megapixel in node, about
 *  12 s for a 200 MP colour reduction, 8 s grey, under a 30 s CPU limit. */
export const PICTURE_SOURCE_MAX = 16384 * 12288 * 3;

const refuse = (reason, detail = {}) => {
  if (!(reason in REFUSALS)) throw new Error(`undeclared refusal: ${reason}`);
  return { ok: false, reason, why: REFUSALS[reason], ...detail };
};

/* R42: a codec's refusal mapped as R22 and R25 map them, total over PNG_REFUSES
 * (every declared feature is UNSUPPORTED_FILTER unless named here). */
const PNG_FEATURE_REASONS = featureReasons(PNG_REFUSES, { "an image past the memory bound": "IMAGE_TOO_LARGE" });
const PNG_CODE_REASONS = { TRUNCATED: "TRUNCATED_IMAGE_DATA" };
/** The `REFUSALS` reason each PNG_REFUSES feature answers, declared so a test
 *  can see the mapping is total. (The memory key is behind `PICTURE_FRAME_MAX`,
 *  which refuses first.) */
export const PNG_REFUSAL_REASONS = PNG_FEATURE_REASONS;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** The picture's format from its first bytes (format-registry R29, R30's
 *  signatures), or null. */
function sniff(b) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && PNG_SIGNATURE.every((v, i) => b[i] === v)) return "png";
  return null;
}

/** A PNG's IHDR: its size and the channels its colour type declares (a palette
 *  counts as the three it expands to). null when the first chunk is not a
 *  well-formed IHDR, which the decoder then refuses in its own words. */
const PNG_CHANNELS = { 0: 1, 2: 3, 3: 3, 4: 2, 6: 4 };
function pngHeader(b) {
  if (b.length < 33) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (dv.getUint32(8) !== 13 || String.fromCharCode(b[12], b[13], b[14], b[15]) !== "IHDR") return null;
  const comps = PNG_CHANNELS[b[25]];
  return comps ? { width: dv.getUint32(16), height: dv.getUint32(20), comps } : null;
}

/* ── R43: EXIF orientation ────────────────────────────────────────────────────
 * Read as Pillow reads it for `exif_transpose`: the FIRST APP1 segment that
 * opens "Exif\0\0", its TIFF header (II or MM, 42), IFD0's tag 0x0112, the
 * entry's first value. Anything that cannot be read so — no segment, a cut
 * block, a type that is not an integer, a value outside 1–8 — is 1. */
const TIFF_INT = { 1: 1, 3: 2, 4: 4, 8: 2, 9: 4 };   // BYTE, SHORT, LONG, SSHORT, SLONG
export function exifOrientation(b) {
  let p = 2;
  while (p + 4 <= b.length && b[p] === 0xff) {
    const m = b[p + 1];
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7) || m === 0x01) { p += 2; continue; }
    if (m === 0xda || m === 0xd9) break;
    const len = (b[p + 2] << 8) | b[p + 3];
    const seg = b.subarray(p + 4, Math.min(b.length, p + 2 + len));
    if (m === 0xe1 && seg.length >= 6 && String.fromCharCode(...seg.subarray(0, 6)) === "Exif\0\0") {
      return orientationIn(seg.subarray(6));
    }
    p += 2 + len;
  }
  return 1;
}
function orientationIn(t) {
  if (t.length < 8) return 1;
  const le = t[0] === 0x49 && t[1] === 0x49;
  if (!le && !(t[0] === 0x4d && t[1] === 0x4d)) return 1;
  const dv = new DataView(t.buffer, t.byteOffset, t.byteLength);
  const u16 = (o) => dv.getUint16(o, le), u32 = (o) => dv.getUint32(o, le);
  if (u16(2) !== 42) return 1;
  const ifd = u32(4);
  if (ifd + 2 > t.length) return 1;
  const n = u16(ifd);
  for (let i = 0; i < n; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > t.length) return 1;
    if (u16(e) !== 0x0112) continue;
    const size = TIFF_INT[u16(e + 2)], count = u32(e + 4);
    if (!size || count < 1) return 1;
    const at = size * count <= 4 ? e + 8 : u32(e + 8);
    if (at + size > t.length) return 1;
    const v = size === 1 ? t[at] : size === 2 ? u16(at) : u32(at);
    return v >= 1 && v <= 8 ? v : 1;
  }
  return 1;
}

/* ── R42 (T44): the boxes, mapped back to the source ─────────────────────────
 * The answer is Pillow's `exif_transpose`, `convert("L")` and `reduce(k)` over
 * the full decode; nothing full-size is made to get it. Each orientation is a
 * map from the source's two axes to the oriented picture's: which oriented axis
 * a source axis becomes, and whether it runs backwards. A source axis of length
 * L, run forwards, falls in boxes floor(i/k) with the partial box at its far
 * end; run backwards, in floor((L-1-i)/k), the partial box at its near end, so
 * a partial box lies on the source edge that becomes the oriented picture's
 * right or bottom edge, where Pillow's lies (draft-T44 N868 doubt 4).
 *   orientation: [x becomes X (not Y)?, x reversed?, y reversed?]
 * 1 as stored; 2 mirror; 3 turn 180; 4 flip; 5 transpose; 6 turn 90 clockwise;
 * 7 transverse; 8 turn 270 clockwise. */
const AXES = [null,
  [true, false, false], [true, true, false], [true, true, true], [true, false, true],
  [false, false, false], [false, false, true], [false, true, true], [false, true, false]];

/** The orientation's picture size: 5–8 swap the sides. */
const orientedSize = (w, h, o) => (AXES[o][0] ? [w, h] : [h, w]);

/** The box each index along a source axis of `len` falls in, for factor k. */
function boxMap(len, k, reversed) {
  const m = new Int32Array(len);
  for (let i = 0; i < len; i++) m[i] = Math.floor((reversed ? len - 1 - i : i) / k);
  return m;
}

/* ── R42: grey and reduction, strip by strip ─────────────────────────────────
 * Pillow's `convert("L")` is (R·19595 + G·38470 + B·7471 + 0x8000) >> 16 per
 * pixel; its `reduce(k)` (`Reduce.c`) sums each k×k box (a partial box on the
 * right or bottom edge over the pixels present) and divides a full box by a
 * shift when k is 2 or 4 (its own 2x2 and 4x4 paths), any other box by its
 * fixed-point multiplier. Source rows arrive top to bottom, a strip at a time
 * (image-codecs R11); a source row falls in one band of boxes, so only that
 * band's sums are held, and the band is written out to the small picture as
 * soon as the rows move on to the next. */

/** Pillow's `division_UINT32(n, 8)`: 2^32 / (256·n) in single precision,
 *  truncated. */
const multiplier = (n) => Math.trunc(Math.fround(4294967296 / Math.fround(256 * n)));

/** The smallest integer k with ceil(longEdge / k) ≤ maxEdge. */
export const reductionFor = (width, height, maxEdge) => Math.max(1, Math.ceil(Math.max(width, height) / maxEdge));

/** A reducer for a source picture of `w × h × comps`, oriented by `orientation`
 *  (R43) and reduced by k: `rows(strip, y0, count)` takes source rows in order,
 *  `done()` answers the reduced picture. */
function reducer(w, h, comps, { grey, orientation, k }) {
  const [xToX, xRev, yRev] = AXES[orientation];
  const oc = grey && comps === 3 ? 1 : comps;
  const xBox = boxMap(w, k, xRev), yBox = boxMap(h, k, yRev);
  const nbx = Math.ceil(w / k), nby = Math.ceil(h / k);
  const W = xToX ? nbx : nby, H = xToX ? nby : nbx;
  const out = new Uint8Array(W * H * oc);
  const sums = new Float64Array(nbx * oc);
  const shift = k === 2 ? 2 : k === 4 ? 4 : 0;
  let band = -1, bandRows = 0, seen = 0;
  const flush = () => {
    const bh = bandRows;
    for (let bx = 0; bx < nbx; bx++) {
      const bw = Math.min(k, w - bx * k), n = bw * bh, amend = n >> 1;
      const mul = bw === k && bh === k && shift ? 0 : multiplier(n);
      const o = (xToX ? band * W + bx : bx * W + band) * oc;
      for (let c = 0; c < oc; c++) {
        const s = sums[bx * oc + c];
        out[o + c] = mul ? Math.floor(((s + amend) * mul) / 16777216) : (s + amend) >>> shift;
      }
    }
    sums.fill(0);
    bandRows = 0;
  };
  const toGrey = oc !== comps;
  return {
    rows(strip, y0, count) {
      if (y0 !== seen) throw new Error(`rows out of order: ${y0} after ${seen}`);
      const stride = w * comps;
      for (let r = 0; r < count; r++) {
        const b = yBox[y0 + r];
        if (b !== band) { if (band >= 0) flush(); band = b; }
        bandRows++;
        let i = r * stride;
        if (toGrey) {
          for (let x = 0; x < w; x++, i += 3) sums[xBox[x]] += (strip[i] * 19595 + strip[i + 1] * 38470 + strip[i + 2] * 7471 + 0x8000) >>> 16;
        } else if (oc === 1) {
          for (let x = 0; x < w; x++) sums[xBox[x]] += strip[i++];
        } else {
          for (let x = 0; x < w; x++) { const s = xBox[x] * oc; for (let c = 0; c < oc; c++) sums[s + c] += strip[i++]; }
        }
      }
      seen += count;
    },
    done() {
      if (seen !== h) throw new Error(`${seen} of ${h} rows`);
      flush();
      return { samples: out, width: W, height: H, comps: oc };
    },
  };
}

async function sha256Hex(u8) {
  const d = await crypto.subtle.digest("SHA-256", u8);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ── the renderer ─────────────────────────────────────────────────────────── */

/**
 * A picture file as upright pixels (R42): `{ok:true, page:0, route:"decoded-picture",
 * mediaType:"image/png", bytes, width, height, upright:true, orientation,
 * reduced_by, source:{format, width, height, comps}, pixels_sha256}`, or a
 * refusal from `REFUSALS`. `maxEdge` (a positive integer) bounds the long edge;
 * `grey` turns the picture grey.
 */
export async function renderPictureToPixels(bytes, pageIndex, { maxEdge, grey = false } = {}) {
  if (!Number.isInteger(maxEdge) || maxEdge < 1) throw new TypeError("renderPictureToPixels: maxEdge must be a positive integer");
  const b = bytes instanceof Uint8Array ? bytes : bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : null;
  const format = b && sniff(b);
  if (!format) return refuse("NOT_A_PICTURE");
  if (pageIndex !== 0) return refuse("NO_SUCH_PAGE", { page: pageIndex, pageCount: 1 });

  if (format === "jpeg") {
    let h;
    try { h = readJpegHeader(b); } catch (e) { return jpegRefusal(e); }
    const source = { format, width: h.frame.width, height: h.frame.height, comps: h.frame.comps.length };
    const orientation = exifOrientation(b);
    const k = reductionFor(...orientedSize(source.width, source.height, orientation), maxEdge);
    const tooBig = overBound(source, PICTURE_SOURCE_MAX, "PICTURE_SOURCE_MAX") ?? overReduced(source, k);
    if (tooBig) return tooBig;
    /* Decoded while reduced (T44): the decoder hands over a strip of finished
     * rows at a time and only the reduced picture is kept. */
    const red = reducer(source.width, source.height, source.comps, { grey, orientation, k });
    try { decodeBaselineJpegRows(b, { onRows: (rows, y0, count) => red.rows(rows, y0, count) }); } catch (e) { return jpegRefusal(e); }
    return answer(red.done(), { source, orientation, k });
  }

  /* A PNG is decoded whole (image-codecs R10) and judged on its full frame
   * against PICTURE_FRAME_MAX; it is never turned (R43). */
  const hd = pngHeader(b);
  const source = { format, width: hd ? hd.width : null, height: hd ? hd.height : null, comps: hd ? hd.comps : null };
  const tooBig = hd && overBound(source, PICTURE_FRAME_MAX, "PICTURE_FRAME_MAX");
  if (tooBig) return tooBig;
  let pic;
  try { pic = await decodePng(b); } catch (e) { return pngRefusal(e); }
  if (!hd) Object.assign(source, { width: pic.width, height: pic.height, comps: pic.comps });
  const k = reductionFor(pic.width, pic.height, maxEdge);
  const red = reducer(pic.width, pic.height, pic.comps, { grey, orientation: 1, k });
  red.rows(pic.samples, 0, pic.height);
  pic.samples = null;
  return answer(red.done(), { source, orientation: 1, k });
}

async function answer(r, { source, orientation, k }) {
  return {
    ok: true, page: 0, route: "decoded-picture", mediaType: "image/png",
    bytes: await encodePng8(r.samples, r.width, r.height, r.comps),
    width: r.width, height: r.height, upright: true,
    orientation, reduced_by: k, source,
    pixels_sha256: await sha256Hex(r.samples),
  };
}

/** The header's frame against a bound, before any decode. */
function overBound({ width, height, comps }, bound, name) {
  const samples = width * height * comps;
  return samples > bound
    ? refuse("IMAGE_TOO_LARGE", { page: 0, width, height, comps, samples, bound, bound_name: name })
    : null;
}

/** A JPEG's reduced frame, `ceil(width/k) × ceil(height/k) × components`,
 *  against PICTURE_FRAME_MAX (T44). */
function overReduced({ width, height, comps }, k) {
  const samples = Math.ceil(width / k) * Math.ceil(height / k) * comps;
  return samples > PICTURE_FRAME_MAX
    ? refuse("IMAGE_TOO_LARGE", { page: 0, width, height, comps, reduced_by: k, samples, bound: PICTURE_FRAME_MAX, bound_name: "PICTURE_FRAME_MAX" })
    : null;
}

function jpegRefusal(e) {
  if (!(e instanceof DctRefusal)) return refuse("DECODE_FAILED", { page: 0, note: String(e && e.message || e) });
  return refuse(DCT_TO_REFUSAL[e.code] || "DECODE_FAILED", { page: 0, jpeg: e.code, ...e.detail });
}

function pngRefusal(e) {
  if (!(e instanceof PngRefusal)) return refuse("DECODE_FAILED", { page: 0, note: String(e && e.message || e) });
  const reason = e.code === "UNSUPPORTED" ? PNG_FEATURE_REASONS[e.detail?.feature] ?? "UNSUPPORTED_FILTER"
    : PNG_CODE_REASONS[e.code] || "DECODE_FAILED";
  return refuse(reason, { page: 0, png: e.code, ...e.detail });
}
