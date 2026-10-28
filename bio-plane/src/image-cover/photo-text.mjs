/* image-cover: the text a photograph holds, read as plain data (R13).
 *
 * A string is decoded strictly (a bad UTF-8 sequence drops the value), has its control, bidi and other invisible format
 * characters removed, and is cut to the bound of its kind; what comes out is text to be drawn escaped, never markup
 * to be run. The XMP packet and the IPTC record are read only for the closed list of properties the photo table keeps;
 * the packet itself is never carried (R12). Pure: bytes in, values out. */
import { boundOf } from "../read-bounds.mjs";

export const FIELD_CHARS = boundOf("image", "photo_field_chars");
export const TEXT_CHARS = boundOf("image", "photo_text_chars");
export const LIST_ITEMS = boundOf("image", "photo_list_items");
export const XMP_BYTES = boundOf("image", "photo_xmp_bytes");

/* the control characters, the bidi controls and the other invisible format characters of Unicode */
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u00AD\u061C\u180E\u200B-\u200F\u2028-\u2029\u202A-\u202E\u2060-\u206F\uFEFF\uFFF9-\uFFFB]/gu;
const SPACES = /[\t\r\n\u2028\u2029]+/g;

/** Decode UTF-8 strictly; null when the bytes are not valid. */
export function decodeStrict(bytes) {
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { return null; }
}

/** `s` as plain text cut to `max` characters (code points); the empty string when nothing is left. */
export function cleanText(s, max) {
  const t = s.replace(SPACES, " ").replace(INVISIBLE, "").trim();
  if (t.length <= max) return t;
  let out = "", n = 0;
  for (const ch of t) { if (n >= max) break; out += ch; n++; }
  return out.trim();
}

/** Text from bytes: cut at the first NUL, decoded strictly, cleaned. `{value}` (maybe empty) or `{bad: true}`. */
export function textOf(bytes, max) {
  let end = bytes.indexOf(0);
  if (end < 0) end = bytes.length;
  const s = decodeStrict(bytes.subarray(0, end));
  if (s === null) return { bad: true };
  return { value: cleanText(s, max) };
}

/* ── XMP ──────────────────────────────────────────────────────────────────── */

const ENTITY = /&(#x[0-9a-fA-F]{1,6}|#[0-9]{1,7}|amp|lt|gt|quot|apos);/g;
function unescapeXml(s) {
  return s.replace(ENTITY, (m, e) => {
    if (e === "amp") return "&";
    if (e === "lt") return "<";
    if (e === "gt") return ">";
    if (e === "quot") return "\"";
    if (e === "apos") return "'";
    const cp = e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff) ? String.fromCodePoint(cp) : "";
  });
}

const isNameEnd = (c) => c === " " || c === ">" || c === "/" || c === "\t" || c === "\n" || c === "\r";

/** The start tag of the first element `name` at or after `from`: `{start, end, selfClosing, tag}` or null. */
function findElement(s, name, from) {
  const open = "<" + name;
  for (let i = s.indexOf(open, from); i >= 0; i = s.indexOf(open, i + 1)) {
    if (!isNameEnd(s[i + open.length] ?? "")) continue;
    const end = s.indexOf(">", i);
    if (end < 0) return null;
    return { start: i, end, selfClosing: s[end - 1] === "/", tag: s.slice(i, end + 1) };
  }
  return null;
}

/** The `li` texts inside `inner`, the x-default one first when the list is language alternatives. */
function listItems(inner) {
  const items = [];
  let def = null;
  for (let i = inner.indexOf("<rdf:li"); i >= 0 && items.length < LIST_ITEMS; i = inner.indexOf("<rdf:li", i + 1)) {
    if (!isNameEnd(inner[i + 7] ?? "")) continue;
    const gt = inner.indexOf(">", i);
    if (gt < 0) break;
    const tag = inner.slice(i, gt + 1);
    if (tag.endsWith("/>")) continue;
    const close = inner.indexOf("</rdf:li>", gt);
    if (close < 0) break;
    const text = inner.slice(gt + 1, close);
    if (text.includes("<")) continue;
    items.push(text);
    if (def === null && tag.includes("x-default")) def = text;
  }
  return def !== null ? [def, ...items.filter((x) => x !== def)] : items;
}

/** The values the property `name` holds, as attribute (`name="v"`) or element content; [] when absent. */
function xmpValues(s, name) {
  const attr = new RegExp(`[\\s]${name}="([^"<]*)"`);
  const am = attr.exec(s);
  if (am) return [unescapeXml(am[1])];
  const el = findElement(s, name, 0);
  if (!el || el.selfClosing) return [];
  const close = s.indexOf("</" + name + ">", el.end);
  if (close < 0) return [];
  const inner = s.slice(el.end + 1, close);
  if (inner.includes("<rdf:li")) return listItems(inner).map(unescapeXml);
  if (inner.includes("<")) return [];
  return [unescapeXml(inner)];
}

/** The kept properties of an XMP packet: `{values}` or null when the packet cannot be read as plain markup. A packet
 *  that declares a DOCTYPE or an entity is not read at all. */
export function xmpFacts(bytes) {
  if (bytes.length > XMP_BYTES) return null;
  const s = decodeStrict(bytes);
  if (s === null || s.includes("<!DOCTYPE") || s.includes("<!ENTITY")) return null;
  const one = (name, max) => {
    const v = xmpValues(s, name)[0];
    const t = v === undefined ? "" : cleanText(v, max);
    return t || undefined;
  };
  const keywords = xmpValues(s, "dc:subject").map((v) => cleanText(v, FIELD_CHARS)).filter(Boolean).slice(0, LIST_ITEMS);
  const place = [one("Iptc4xmpCore:Location", FIELD_CHARS), one("photoshop:City", FIELD_CHARS), one("photoshop:State", FIELD_CHARS), one("photoshop:Country", FIELD_CHARS)].filter(Boolean);
  return {
    values: {
      description: one("dc:description", TEXT_CHARS),
      artist: one("dc:creator", FIELD_CHARS),
      copyright: one("dc:rights", FIELD_CHARS),
      credit: one("photoshop:Credit", FIELD_CHARS),
      keywords: keywords.length ? keywords : undefined,
      place_name: place.length ? cleanText(place.join(", "), TEXT_CHARS) : undefined,
    },
  };
}

/* ── IPTC ─────────────────────────────────────────────────────────────────── */

/** The datasets of an IPTC-IIM record (the Photoshop resource 0x0404): `Map "record:dataset" -> [bytes]`. A dataset with
 *  an extended length ends the walk. */
export function iimDatasets(b) {
  const out = new Map();
  let p = 0, count = 0;
  while (p + 5 <= b.length && b[p] === 0x1c && count++ < LIST_ITEMS * 64) {
    const key = `${b[p + 1]}:${b[p + 2]}`, len = (b[p + 3] << 8) | b[p + 4];
    if (len & 0x8000 || p + 5 + len > b.length) break;
    const v = b.subarray(p + 5, p + 5 + len);
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(v);
    p += 5 + len;
  }
  return out;
}

/** The Photoshop image resources of an APP13 body (after "Photoshop 3.0\0"): `[{id, data}]`, walked while they hold. */
export function photoshopResources(b) {
  const out = [];
  let p = 0;
  while (p + 12 <= b.length && out.length < LIST_ITEMS * 4) {
    if (b[p] !== 0x38 || b[p + 1] !== 0x42 || b[p + 2] !== 0x49 || b[p + 3] !== 0x4d) break;
    const id = (b[p + 4] << 8) | b[p + 5];
    let q = p + 6;
    q += 1 + b[q];
    if (q & 1) q++;
    if (q + 4 > b.length) break;
    const size = b[q] * 0x1000000 + ((b[q + 1] << 16) | (b[q + 2] << 8) | b[q + 3]);
    q += 4;
    if (q + size > b.length) break;
    out.push({ id, data: b.subarray(q, q + size) });
    p = q + size + (size & 1);
  }
  return out;
}
