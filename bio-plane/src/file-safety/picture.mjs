/* file-safety: the safe picture of a photograph (R60–R65, R67; DEC-460, K5471, K5473, K5520–K5523, K5546, K5547, K5555).
 *
 * A baseline JPEG or an 8-bit non-interlaced PNG is redrawn from its decoded pixels by `image-cover` (`redrawPicture`): the picture
 * holds the pixels, and the colour profile only when it passes `image-cover` R14's strict check, and nothing else of the file.
 * What the file says (`photoFactsOf`) is kept as data beside it, in the closed list below, each field `{value, from: "the file",
 * checked: false}`; what was left out is told by kind, count and bytes, in the closed set of `image-cover`'s `LEFT_OUT_KINDS`
 * (R62). This module reads no byte of the photograph itself: both walks are `image-cover`'s. Nothing here runs, fetches or
 * interprets the photograph, a profile or a thumbnail, and nothing here is logged or forwarded (R63).
 *
 * `makePicture(bytes)` → `{ok: true, png, width, height, orientation, content_type, file_says, file_says_held, left_out}` or
 * `{ok: false, reason, detail}` (final: a photograph this maker refuses is not tried again). Never throws. */
import { redrawPicture, photoFactsOf, LEFT_OUT_KINDS, COVER_MAX_BYTES } from "../image-cover/index.mjs";

export { LEFT_OUT_KINDS, COVER_MAX_BYTES };

/* R61: the kept fields of the closed list, in the order they are answered. The three of `HELD_BACK` are read into the record as data
   and are not shown by default (R64, `screens-intake`'s A4-R10): they are answered apart, as `file_says_held`. */
export const FILE_SAYS_FIELDS = Object.freeze([
  "orientation", "time_taken", "time_modified",
  "gps_latitude", "gps_longitude", "gps_altitude", "gps_direction", "gps_time", "gps_datum",
  "width", "height", "make", "model", "lens", "software", "exposure_time", "f_number", "iso", "focal_length", "flash",
  "body_serial", "lens_serial", "owner_name", "image_unique_id", "artist", "copyright",
  "description", "comments", "keywords", "byline", "credit", "place_name", "png_text",
  "profile_colour_space", "profile_description",
]);
export const HELD_BACK = Object.freeze(["image_unique_id", "artist", "copyright"]);
const HELD = new Set(HELD_BACK);

/* A value of the closed list only: a number, a string, a list of strings, or a list of `{keyword, text}` (a PNG's text chunks). */
const plain = (v) => typeof v === "string" || (typeof v === "number" && Number.isFinite(v))
  || (Array.isArray(v) && v.every((x) => typeof x === "string" || (x && typeof x === "object" && typeof x.keyword === "string" && typeof x.text === "string")));

/** R61: the file's facts as "the file says": each kept field `{value, from, checked}`, split into what is shown by default and what is held back. */
export function fileSays(facts) {
  const shown = {}, held = {};
  if (facts && typeof facts === "object") for (const name of FILE_SAYS_FIELDS) {
    if (!Object.hasOwn(facts, name) || !plain(facts[name])) continue;
    (HELD.has(name) ? held : shown)[name] = { value: facts[name], from: "the file", checked: false };
  }
  return { file_says: shown, file_says_held: held };
}

/* R62: only the closed set of kinds is ever answered, in `image-cover`'s order. */
const leftOut = (list) => (Array.isArray(list) ? list : []).filter((e) => e && LEFT_OUT_KINDS.includes(e.kind) && Number.isFinite(e.count) && Number.isFinite(e.bytes))
  .map((e) => ({ kind: e.kind, count: e.count, bytes: e.bytes }));

/** The safe picture of a photograph, or why none is made. The facts are read from the same bytes as the redraw, so the two agree. */
export async function makePicture(bytes) {
  try {
    if (!(bytes instanceof Uint8Array)) return { ok: false, reason: "NOT_A_COVERABLE_FORMAT", detail: null };
    const drawn = await redrawPicture(bytes);
    if (!drawn.ok) return { ok: false, reason: String(drawn.code), detail: drawn.detail == null ? null : String(drawn.detail) };
    const said = await photoFactsOf(bytes);
    const facts = said && said.ok === true ? { ...said.facts } : {};
    /* the orientation is how to turn the picture (the pixels stay as stored); the size is the picture's own */
    if (Number.isInteger(drawn.orientation) && drawn.orientation >= 1 && drawn.orientation <= 8) facts.orientation = drawn.orientation;
    facts.width = drawn.width; facts.height = drawn.height;
    return { ok: true, png: drawn.bytes, width: drawn.width, height: drawn.height, orientation: Number.isInteger(drawn.orientation) ? drawn.orientation : 1,
             content_type: "image/png", ...fileSays(facts), left_out: leftOut(drawn.left_out) };
  } catch (e) {
    return { ok: false, reason: "IMAGE_DATA_CORRUPT", detail: null };
  }
}

/** The SHA-256 of bytes, as lower-case hex (the picture is stored under its own digest, outside `captures/`). */
export async function digestOf(bytes) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(d, (b) => b.toString(16).padStart(2, "0")).join("");
}
