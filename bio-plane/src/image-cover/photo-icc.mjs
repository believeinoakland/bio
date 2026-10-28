/* image-cover: the strict structural check of a colour profile (R14; K5546, K5555).
 *
 * The check reads the profile's header and tag table and nothing else: the profile is carried unchanged or not at all, and
 * nothing here interprets its curves or tables or converts a pixel. A profile passes only when its declared size is its
 * length and within `PHOTO_PROFILE_MAX`, its class is display (`mntr`) and its colour space RGB, its version 2 or 4, its
 * tag count is within the bound, and every tag lies inside the profile, past the table, none partly overlapping another.
 * Tags that name one and the same range are one shared tag's data, as the ICC specification allows (Display P3's three
 * curves are one). */
import { boundOf } from "../read-bounds.mjs";
import { cleanText, FIELD_CHARS } from "./photo-text.mjs";

export const PHOTO_PROFILE_MAX = boundOf("image", "photo_profile_max");
const PROFILE_TAGS = boundOf("image", "photo_profile_tags");

const HEADER = 128;
const u32 = (d, p) => d[p] * 0x1000000 + ((d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]);
const ascii = (d, p, n) => String.fromCharCode(...d.subarray(p, p + n));
const printable4 = (s) => /^[\x20-\x7e]{4}$/.test(s);

/** The tags of a profile whose table fits in it: `[{sig, off, len}]`, or null. */
function tagTable(p) {
  if (p.length < HEADER + 4) return null;
  const n = u32(p, HEADER);
  if (n > PROFILE_TAGS || HEADER + 4 + 12 * n > p.length) return null;
  const tags = [];
  for (let i = 0; i < n; i++) {
    const e = HEADER + 4 + 12 * i;
    tags.push({ sig: ascii(p, e, 4), off: u32(p, e + 4), len: u32(p, e + 8) });
  }
  return tags;
}

/** The profile's description as text from its `desc` tag (version 2 text description or version 4 multi-localised), or
 *  undefined; every read is inside the tag's own range. */
function descriptionOf(p, tags) {
  const t = tags?.find((x) => x.sig === "desc");
  if (!t || t.len < 12 || t.off + t.len > p.length) return undefined;
  const d = p.subarray(t.off, t.off + t.len), type = ascii(d, 0, 4);
  if (type === "desc") {
    const n = u32(d, 8);
    if (n < 1 || 12 + n > d.length) return undefined;
    const s = cleanText(ascii(d, 12, n).replace(/\0.*$/s, ""), FIELD_CHARS);
    return s || undefined;
  }
  if (type === "mluc") {
    if (d.length < 28) return undefined;
    const records = u32(d, 8), recSize = u32(d, 12);
    if (records < 1 || recSize < 12) return undefined;
    const len = u32(d, 20), off = u32(d, 24);
    if (len < 2 || off + len > d.length) return undefined;
    try {
      const s = new TextDecoder("utf-16be", { fatal: true }).decode(d.subarray(off, off + len));
      return cleanText(s, FIELD_CHARS) || undefined;
    } catch { return undefined; }
  }
  return undefined;
}

/** Check a profile: `{ok, reason, colour_space, description}`. `reason` names the first test failed (an identifier, never a sentence). */
export function checkProfile(p) {
  if (!(p instanceof Uint8Array) || p.length < HEADER + 4) return { ok: false, reason: "short" };
  const colour_space = printable4(ascii(p, 16, 4)) ? ascii(p, 16, 4).trim() : undefined;
  const tags = p.length <= PHOTO_PROFILE_MAX ? tagTable(p) : null;
  const description = tags ? descriptionOf(p, tags) : undefined;
  const out = (reason) => ({ ok: false, reason, colour_space, description });
  if (p.length > PHOTO_PROFILE_MAX) return out("over_bound");
  if (u32(p, 0) !== p.length) return out("size");
  if (ascii(p, 36, 4) !== "acsp") return out("signature");
  if (p[8] !== 2 && p[8] !== 4) return out("version");
  if (ascii(p, 12, 4) !== "mntr") return out("class");
  if (ascii(p, 16, 4) !== "RGB ") return out("colour_space");
  if (!tags || !tags.length) return out("tags");
  const body = HEADER + 4 + 12 * tags.length;
  for (const t of tags) if (t.len < 1 || t.off < body || t.off + t.len > p.length) return out("tag_range");
  const sorted = [...tags].sort((a, b) => a.off - b.off || a.len - b.len);
  let cur = sorted[0];
  for (const t of sorted.slice(1)) {
    if (t.off === cur.off && t.len === cur.len) continue;
    if (t.off < cur.off + cur.len) return out("tag_overlap");
    cur = t;
  }
  return { ok: true, colour_space, description };
}
