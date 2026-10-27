/* image-cover: a picture redrawn from its pixels (R12, R14; DEC-460, K5520, K5546, K5555).
 *
 * The photograph is decoded to 8-bit samples (a JPEG by `image-codecs`' strip-wise decoder, bit-exact with libjpeg, never
 * rotated; a PNG by its PNG decoder, alpha drawn over white) and written again as a fresh PNG: IHDR, the original's colour
 * profile when it passes the strict structural check (R14) and its bytes unchanged, the image data, IEND. Nothing else of
 * the original's bytes is carried, so no metadata marker, thumbnail, second picture or trailing byte can be (R12). The
 * orientation is answered, not applied: the screen turns the picture. The answer's rows are filtered with the best of the five
 * PNG filters and deflated by the platform; an answer over `redraw_bytes`, or a frame over `picture_frame`, is refused
 * `IMAGE_TOO_LARGE` before the memory is asked for. Pure (R6). */
import { readJpegHeader, decodeBaselineJpegRows, DctRefusal } from "../../../pdf-worker/src/dctdecode.mjs";
import { decodePng, PngRefusal } from "../../../pdf-worker/src/pngdecode.mjs";
import { boundOf } from "../read-bounds.mjs";
import { CoverRefusal, checkPixels, COVER_MAX_BYTES, COVER_MAX_PIXELS } from "./geometry.mjs";
import { fromDct } from "./jpeg.mjs";
import { crc32, filter } from "./png.mjs";
import { scanPhoto, leftOutOf, isJpeg } from "./photo.mjs";
import { localize } from "../setup-words/index.mjs";

export const REDRAW_MAX_BYTES = boundOf("image", "redraw_bytes");
const FRAME_MAX = boundOf("image", "picture_frame");
const SIGNATURE = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const SLICE = 49152;                               // the bytes handed to the deflater at a time (not a ceiling)

const tooLarge = (what, size, bound) => new CoverRefusal("IMAGE_TOO_LARGE", localize("image-cover.redraw.the_what_is_size_over", "the {what} is {size} bytes, over the {bound} this module redraws", { what: String(what), size: String(size), bound: String(bound) }));

/** PNG's own refusals as this module's (R3). */
function fromPng(e) {
  if (!(e instanceof PngRefusal)) throw e;
  const note = e.detail?.note ? `: ${e.detail.note}` : "";
  if (e.code === "NOT_A_PNG") return new CoverRefusal("NOT_A_COVERABLE_FORMAT", localize("image-cover.redraw.not_a_png", "not a PNG{note}", { note }));
  if (e.code === "TRUNCATED") return new CoverRefusal("TRUNCATED_IMAGE_DATA", localize("image-cover.png.the_png_data_ends_before", "the PNG data ends before the image does: {why}", { why: String(e.detail?.note ?? "") }));
  if (e.code === "IMAGE_TOO_LARGE") return new CoverRefusal("IMAGE_TOO_LARGE", localize("image-cover.redraw.the_png_declares_more_than", "the PNG declares more than this module redraws{v1}", { v1: note }));
  if (e.code === "UNSUPPORTED" && e.detail?.feature === "interlaced") return new CoverRefusal("PNG_INTERLACED", localize("image-cover.redraw.an_interlaced_adam7_png_is", "an interlaced (Adam7) PNG is not redrawn"));
  if (e.code === "UNSUPPORTED") return new CoverRefusal("NOT_A_COVERABLE_FORMAT", localize("image-cover.redraw.the_png_uses_a_feature", "the PNG uses a feature that is not redrawn{note}", { note }));
  return new CoverRefusal("IMAGE_DATA_CORRUPT", localize("image-cover.png.the_png_data_cannot_be", "the PNG data cannot be read: {why}", { why: String(e.detail?.note ?? e.code) }));
}

/** The filtered rows of an image, one row at a time: each row takes the filter whose output sums smallest as signed bytes. */
function makeRowFilter(stride, bpp, out) {
  const scratch = [0, 1, 2, 3, 4].map(() => new Uint8Array(stride + 1));
  let prev = new Uint8Array(stride);
  return (row, y) => {
    let best = 0, bestScore = Infinity;
    for (let t = 0; t < 5; t++) {
      filter(t, row, prev, bpp, scratch[t]);
      let s = 0;
      const f = scratch[t];
      for (let i = 1; i <= stride; i++) { const v = f[i]; s += v < 128 ? v : 256 - v; }
      if (s < bestScore) { bestScore = s; best = t; }
    }
    out.set(scratch[best], y * (stride + 1));
    prev.set(row);
  };
}

/** Deflate `data` in slices; `{parts, total}`; stops with IMAGE_TOO_LARGE the moment the output passes the bound. */
async function deflateBounded(holder, max) {
  const data = holder.rows;
  holder.rows = null;
  const cs = new CompressionStream("deflate");
  const parts = [];
  let total = 0, over = false;
  const reading = (async () => {
    const r = cs.readable.getReader();
    for (;;) {
      const { done, value } = await r.read();
      if (done) break;
      total += value.length;
      if (total > max) { over = true; r.cancel().catch(() => {}); break; }
      parts.push(value);
    }
  })();
  reading.catch(() => {});
  const w = cs.writable.getWriter();
  try {
    for (let o = 0; o < data.length && !over; o += SLICE) await w.write(data.subarray(o, Math.min(o + SLICE, data.length)));
    if (!over) await w.close();
  } catch { /* the reader stopped the stream: it is over the bound */ }
  await reading;
  if (over) throw tooLarge(localize("image-cover.redraw.redrawn_picture", "redrawn picture"), total, max);
  return { parts, total };
}

const be32 = (v) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
const chunk = (type, parts, length) => ({ type: Uint8Array.from(type, (c) => c.charCodeAt(0)), parts, length });

/** The signature and the chunks written into one buffer, each part copied once. */
function assemble(chunks) {
  const out = new Uint8Array(SIGNATURE.length + chunks.reduce((n, c) => n + 12 + c.length, 0));
  out.set(SIGNATURE);
  let o = SIGNATURE.length;
  for (const c of chunks) {
    out.set(be32(c.length), o); out.set(c.type, o + 4);
    let at = o + 8;
    for (const p of c.parts) { out.set(p, at); at += p.length; }
    out.set(be32(crc32(c.type, ...c.parts)), at);
    o = at + 4;
  }
  return out;
}

/** The decoded 8-bit samples of the photograph, as filtered PNG rows. */
async function decodeRows(d, S) {
  if (isJpeg(d)) {
    let h;
    try { h = readJpegHeader(d); } catch (e) { throw fromDct(e); }
    const { width: W, height: H } = h.frame, n = h.frame.comps.length;
    if (n !== 1 && n !== 3) throw new CoverRefusal("UNSUPPORTED_JPEG_PROCESS", localize("image-cover.redraw.this_jpegs_coding_is_not", "this JPEG has {n} components; only grey or three are redrawn", { n: String(n) }));
    checkPixels(W, H, COVER_MAX_PIXELS);
    const stride = W * n;
    if (stride * H > FRAME_MAX) throw tooLarge(localize("image-cover.redraw.decoded_frame", "decoded frame"), stride * H, FRAME_MAX);
    const rows = new Uint8Array((stride + 1) * H), put = makeRowFilter(stride, n, rows);
    try {
      decodeBaselineJpegRows(d, { onRows: (strip, y0, count) => { for (let j = 0; j < count; j++) put(strip.subarray(j * stride, (j + 1) * stride), y0 + j); } });
    } catch (e) { throw fromDct(e); }
    return { rows, width: W, height: H, comps: n };
  }
  const ct = d.length > 25 ? d[25] : 2, n = ct === 0 || ct === 4 ? 1 : 3;
  const W = S.width, H = S.height;
  if (!W || !H) throw new CoverRefusal("IMAGE_DATA_CORRUPT", localize("image-cover.redraw.the_png_has_no_header", "the PNG has no readable header"));
  checkPixels(W, H, COVER_MAX_PIXELS);
  if (W * n * H > FRAME_MAX) throw tooLarge(localize("image-cover.redraw.decoded_frame", "decoded frame"), W * n * H, FRAME_MAX);
  let img;
  try { img = await decodePng(d); } catch (e) { throw fromPng(e); }
  const stride = img.width * img.comps, rows = new Uint8Array((stride + 1) * img.height), put = makeRowFilter(stride, img.comps, rows);
  for (let y = 0; y < img.height; y++) put(img.samples.subarray(y * stride, (y + 1) * stride), y);
  return { rows, width: img.width, height: img.height, comps: img.comps };
}

/** Redraw a JPEG or PNG from its pixels (R12): `{ok: true, bytes, format: "png", width, height, orientation, left_out}`
 *  or `{ok: false, code, detail}`. Never throws for a photograph. */
export async function redrawPicture(bytes) {
  try {
    const d = bytes instanceof Uint8Array ? bytes : bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : null;
    if (!d) throw new CoverRefusal("NOT_A_COVERABLE_FORMAT", localize("image-cover.redraw.the_photos_bytes_are_not_a_byte_array", "the photo's bytes are not a byte array"));
    if (d.length > COVER_MAX_BYTES)
      throw new CoverRefusal("PHOTO_TOO_LARGE", localize("image-cover.redraw.the_photo_is_length_bytes", "the photo is {length} bytes, over the {COVER_MAX_BYTES} this module redraws", { length: String(d.length), COVER_MAX_BYTES: String(COVER_MAX_BYTES) }));
    const S = await scanPhoto(d);
    if (!S) throw new CoverRefusal("NOT_A_COVERABLE_FORMAT", localize("image-cover.redraw.the_photo_is_neither_a_jpeg_nor_a_png", "the photo is neither a JPEG nor a PNG"));
    const img = await decodeRows(d, S);
    const { width, height, comps } = img;
    const ihdr = Uint8Array.from([...be32(width), ...be32(height), 8, comps === 1 ? 0 : 2, 0, 0, 0]);
    const profile = S.profile?.ok && comps === 3 ? S.profile.bytes : null;
    const { parts, total } = await deflateBounded(img, REDRAW_MAX_BYTES);       // the filtered rows are let go once deflated
    const chunks = [chunk("IHDR", [ihdr], 13)];
    if (profile) {
      const z = await deflateBounded({ rows: profile }, REDRAW_MAX_BYTES);
      chunks.push(chunk("iCCP", [Uint8Array.from([0x49, 0x43, 0x43, 0, 0]), ...z.parts], 5 + z.total));
    }
    chunks.push(chunk("IDAT", parts, total), chunk("IEND", [], 0));
    const out = assemble(chunks);
    return { ok: true, bytes: out, format: "png", width, height, orientation: S.orientation, profile_kept: !!profile, left_out: leftOutOf(S) };
  } catch (e) {
    if (e instanceof CoverRefusal) return { ok: false, code: e.code, detail: e.detail };
    if (e instanceof DctRefusal) { const r = fromDct(e); return { ok: false, code: r.code, detail: r.detail }; }
    if (e instanceof PngRefusal) { const r = fromPng(e); return { ok: false, code: r.code, detail: r.detail }; }
    return { ok: false, code: "IMAGE_DATA_CORRUPT", detail: localize("image-cover.redraw.the_images_structure_cannot_be", "the image's data cannot be read ({v1})", { v1: String(e?.message || e) }) };
  }
}
