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
 * MEMORY. A 12-megapixel colour photo is 36.6 MB of samples, and the decoder's
 * own working set is larger still, inside an isolate of 128 MB. So the frame is
 * bounded from the HEADER, before anything is allocated (`PICTURE_FRAME_MAX`,
 * measured: see the job record of T43-5), the decoder turns the picture as it
 * writes it, and grey, mirror and reduction are one pass into the small output:
 * no second full-size buffer is made beside the decoder's.
 */

import { readJpegHeader, decodeBaselineJpeg, DctRefusal } from "./dctdecode.mjs";
import { decodePng, PngRefusal, PNG_REFUSES } from "./pngdecode.mjs";
import { REFUSALS, DCT_TO_REFUSAL, featureReasons, encodePng8 } from "./pagepixels.mjs";

/** The largest frame decoded here, as `width × height × components` read from
 *  the file's header (R42): 4096 × 3072 × 3, a 12.6-megapixel colour frame, so
 *  the 12-megapixel cameras (4032×3024, 4000×3000, 4080×3072) pass. Measured at
 *  T43-5 (its job record): the JPEG decoder's live working set is 2.0–2.33 bytes
 *  per sample (6–7 per colour pixel: its planes, the upsampled chroma and the
 *  output), so this bound holds it under 88 MB of a 128 MB isolate; nothing
 *  here adds a second full-size buffer. */
export const PICTURE_FRAME_MAX = 4096 * 3072 * 3;

const refuse = (reason, detail = {}) => {
  if (!(reason in REFUSALS)) throw new Error(`undeclared refusal: ${reason}`);
  return { ok: false, reason, why: REFUSALS[reason], ...detail };
};

/* R42: a codec's refusal mapped as R22 and R25 map them, total over PNG_REFUSES
 * (every declared feature is UNSUPPORTED_FILTER unless named here). */
const PNG_FEATURE_REASONS = featureReasons(PNG_REFUSES, { "a frame past the memory bound": "IMAGE_TOO_LARGE" });
const PNG_CODE_REASONS = { TRUNCATED: "TRUNCATED_IMAGE_DATA" };

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

/* Each orientation as a clockwise turn the decoder applies while it writes the
 * samples, then a left–right mirror: 2 mirror; 3 turn 180; 4 turn 180 and
 * mirror (a top–bottom flip); 5 turn 90 and mirror (transpose); 6 turn 90;
 * 7 turn 270 and mirror (transverse); 8 turn 270. */
const TURN = [0, 0, 0, 180, 180, 90, 90, 270, 270];
const MIRROR = [false, false, true, false, true, true, false, true, false];

/* ── R42: grey, mirror and reduction, in ONE pass ─────────────────────────────
 * Pillow's `convert("L")` is (R·19595 + G·38470 + B·7471 + 0x8000) >> 16 per
 * pixel; its `reduce(k)` (`Reduce.c`) sums each k×k box (a partial box on the
 * right or bottom edge over the pixels present) and divides a full box by a
 * shift when k is 2 or 4 (its own 2x2 and 4x4 paths), any other box by its
 * fixed-point multiplier. The three are done together, reading the decoded
 * samples through the mirror, so no full-size grey or mirrored copy is ever
 * made beside the decoder's own: measured, that copy was what lifted the peak. */

/** Pillow's `division_UINT32(n, 8)`: 2^32 / (256·n) in single precision,
 *  truncated. */
const multiplier = (n) => Math.trunc(Math.fround(4294967296 / Math.fround(256 * n)));

/** The smallest integer k with ceil(longEdge / k) ≤ maxEdge. */
export const reductionFor = (width, height, maxEdge) => Math.max(1, Math.ceil(Math.max(width, height) / maxEdge));

function finish(s, w, h, comps, { grey, mirror, k }) {
  const oc = grey && comps === 3 ? 1 : comps;
  const W = Math.ceil(w / k), H = Math.ceil(h / k);
  const out = new Uint8Array(W * H * oc);
  const sums = new Float64Array(oc);
  const shift = k === 2 ? 2 : k === 4 ? 4 : 0;
  for (let Y = 0; Y < H; Y++) {
    const y0 = Y * k, bh = Math.min(k, h - y0);
    for (let X = 0; X < W; X++) {
      const x0 = X * k, bw = Math.min(k, w - x0);
      sums.fill(0);
      for (let y = y0; y < y0 + bh; y++) {
        for (let x = x0; x < x0 + bw; x++) {
          const i = (y * w + (mirror ? w - 1 - x : x)) * comps;
          if (oc !== comps) sums[0] += (s[i] * 19595 + s[i + 1] * 38470 + s[i + 2] * 7471 + 0x8000) >>> 16;
          else for (let c = 0; c < comps; c++) sums[c] += s[i + c];
        }
      }
      const n = bw * bh, amend = n >> 1;
      const mul = bw === k && bh === k && shift ? 0 : multiplier(n);
      const o = (Y * W + X) * oc;
      for (let c = 0; c < oc; c++) {
        out[o + c] = mul ? Math.floor(((sums[c] + amend) * mul) / 16777216) : (sums[c] + amend) >>> shift;
      }
    }
  }
  return { samples: out, width: W, height: H, comps: oc };
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

  let pic;
  if (format === "jpeg") {
    let h;
    try { h = readJpegHeader(b); } catch (e) { return jpegRefusal(e); }
    const source = { format, width: h.frame.width, height: h.frame.height, comps: h.frame.comps.length };
    const tooBig = overBound(source);
    if (tooBig) return tooBig;
    const orientation = exifOrientation(b);
    let out;
    try { out = decodeBaselineJpeg(b, { rotate: TURN[orientation] }); } catch (e) { return jpegRefusal(e); }
    pic = { ...out, source, orientation };
  } else {
    const hd = pngHeader(b);
    const source = { format, width: hd ? hd.width : null, height: hd ? hd.height : null, comps: hd ? hd.comps : null };
    const tooBig = hd && overBound(source);
    if (tooBig) return tooBig;
    let out;
    try { out = await decodePng(b); } catch (e) { return pngRefusal(e); }
    if (!hd) Object.assign(source, { width: out.width, height: out.height, comps: out.comps });
    pic = { ...out, source, orientation: 1 };   // R43: a PNG is never turned
  }

  const k = reductionFor(pic.width, pic.height, maxEdge);
  const r = finish(pic.samples, pic.width, pic.height, pic.comps, { grey, mirror: MIRROR[pic.orientation], k });
  pic.samples = null;
  return {
    ok: true, page: 0, route: "decoded-picture", mediaType: "image/png",
    bytes: await encodePng8(r.samples, r.width, r.height, r.comps),
    width: r.width, height: r.height, upright: true,
    orientation: pic.orientation, reduced_by: k, source: pic.source,
    pixels_sha256: await sha256Hex(r.samples),
  };
}

function overBound({ width, height, comps }) {
  const samples = width * height * comps;
  return samples > PICTURE_FRAME_MAX
    ? refuse("IMAGE_TOO_LARGE", { page: 0, width, height, comps, samples, bound: PICTURE_FRAME_MAX })
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
