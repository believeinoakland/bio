/* image-cover: a solid cover over the marked areas of a photo, in a new image that carries nothing of the original
 * but its pixels (DEC-180 (4), K2108; requirements `build/requirements/image-cover.md`).
 *
 * `coverAreas(bytes, {areas})` answers a Promise of `{ok: true, bytes, format, width, height, covered}` or
 * `{ok: false, code, detail}`. `format` is "jpeg" or "png"; `width` and `height` are the picture as displayed (its
 * EXIF orientation applied), the frame the areas are given in; `covered` counts the 8x8 blocks (every component's)
 * or the pixels the cover replaced. Pure (R6): no clock, no randomness, no I/O, nothing kept between calls. The
 * JPEG path is `jpeg.mjs`, the PNG path `png.mjs`, the areas and the orientation `geometry.mjs`. */
import { CoverRefusal, checkAreas } from "./geometry.mjs";
import { coverJpeg } from "./jpeg.mjs";
import { coverPng } from "./png.mjs";

/** The largest photo covered, in bytes; a larger one is refused before a byte of it is read (R3, R4). */
export const COVER_MAX_BYTES = 32 * 1024 * 1024;

/** The most pixels a photo may declare; more is refused from its header, before anything is decoded (R3): a small
 *  file can declare a huge image, and the cover's time grows with the pixels. 120 MP admits every phone camera's
 *  usual output (12, 48, 50, 108 MP) and refuses a 200 MP sensor's full-resolution file. */
export const COVER_MAX_PIXELS = 120_000_000;

/** Every refusal code, with what it means (R3). */
export const COVER_REFUSALS = Object.freeze({
  NOT_A_COVERABLE_FORMAT: "the photo is neither a JPEG nor an 8-bit PNG this module covers",
  UNSUPPORTED_JPEG_PROCESS: "the JPEG is progressive, arithmetic-coded, lossless, 12-bit, or otherwise not a baseline or extended-sequential Huffman 8-bit JPEG in one scan",
  PNG_INTERLACED: "the PNG is interlaced (Adam7)",
  AREA_MALFORMED: "an area is not four integers [x0, y0, x1, y1] with x0 < x1 and y0 < y1",
  AREA_OUTSIDE: "an area lies wholly outside the picture",
  PHOTO_TOO_LARGE: "the photo is larger, in bytes or in pixels, than the most this module covers",
  TRUNCATED_IMAGE_DATA: "the image data ends before the image does",
  IMAGE_DATA_CORRUPT: "the image data cannot be read: a bad Huffman code or table, a wrong restart marker, a PNG CRC or zlib error",
});

const isJpeg = (d) => d.length >= 3 && d[0] === 0xff && d[1] === 0xd8 && d[2] === 0xff;
const isPng = (d) => d.length >= 8 && d[0] === 0x89 && d[1] === 0x50 && d[2] === 0x4e && d[3] === 0x47 &&
  d[4] === 0x0d && d[5] === 0x0a && d[6] === 0x1a && d[7] === 0x0a;

/** Cover each area of a JPEG or PNG with solid black, in a fresh image (R1–R5). */
export async function coverAreas(bytes, { areas } = {}) {
  try {
    const d = bytes instanceof Uint8Array ? bytes : bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : null;
    if (!d) throw new CoverRefusal("NOT_A_COVERABLE_FORMAT", "the photo's bytes are not a byte array");
    if (d.length > COVER_MAX_BYTES)
      throw new CoverRefusal("PHOTO_TOO_LARGE", `the photo is ${d.length} bytes, over the ${COVER_MAX_BYTES} this module covers`);
    checkAreas(areas);
    let answer;
    if (isJpeg(d)) answer = coverJpeg(d, areas, COVER_MAX_PIXELS);
    else if (isPng(d)) answer = await coverPng(d, areas, COVER_MAX_PIXELS);
    else throw new CoverRefusal("NOT_A_COVERABLE_FORMAT", "the photo is neither a JPEG nor a PNG");
    return { ok: true, ...answer };
  } catch (e) {
    if (e instanceof CoverRefusal) return { ok: false, code: e.code, detail: e.detail };
    throw e;
  }
}
