/* image-cover: what a photograph says, read as data beside the picture (R13, R14; DEC-460, K5471, K5473, K5521, K5522).
 *
 * `photoFactsOf(bytes)` walks a JPEG's marker segments or a PNG's chunks once and answers `{ok: true, facts, left_out}`:
 * `facts` the kept fields of the closed list (orientation, the time taken and the file's modify time as stated, the place as
 * range-checked numbers, width and height, the camera, lens and software, exposure, ISO, focal length and flash, the serial
 * numbers and owner, the image id, artist and copyright holder, and the text the photographer wrote), each a typed,
 * bounded value; `left_out` what the picture does not carry and is not shown as data, by kind with a count and bytes.
 * It reads EXIF, IPTC and the kept XMP properties, a JPEG's comment, a PNG's text chunks and the colour profile's
 * header; it interprets no profile, no thumbnail, no maker note and no second picture, and it never refuses the photograph
 * for a field it cannot read: the field is omitted and counted `unreadable`. Pure; never throws. The one refusal it makes
 * is for bytes that are neither a JPEG nor a PNG, or over `COVER_MAX_BYTES`.
 *
 * The walk is shared with the redraw (`redraw.mjs`), which needs the orientation and the profile of the same pass. */
import { boundOf } from "../read-bounds.mjs";
import { CoverRefusal, COVER_MAX_BYTES, COVER_MAX_CHUNKS } from "./geometry.mjs";
import { crc32 } from "./png.mjs";
import { readExif } from "./photo-exif.mjs";
import { checkProfile, PHOTO_PROFILE_MAX } from "./photo-icc.mjs";
import { cleanText, decodeStrict, textOf, xmpFacts, iimDatasets, photoshopResources, FIELD_CHARS, TEXT_CHARS, LIST_ITEMS, XMP_BYTES } from "./photo-text.mjs";
import { localize } from "../setup-words/index.mjs";

const EXIF_BYTES = boundOf("image", "photo_exif_bytes");
const INFLATED = boundOf("image", "photo_inflated_bytes");

/** The kinds of `left_out`, in the order they are answered (R13). */
export const LEFT_OUT_KINDS = Object.freeze(["thumbnail", "maker_note", "profile", "extra_picture", "after_end", "xmp", "credentials", "other_metadata", "unreadable"]);

const u16 = (d, p) => (d[p] << 8) | d[p + 1];
const u32 = (d, p) => d[p] * 0x1000000 + ((d[p + 1] << 16) | (d[p + 2] << 8) | d[p + 3]);
const ascii = (d, p, n) => String.fromCharCode(...d.subarray(p, p + n));
const startsWith = (d, s) => d.length >= s.length && ascii(d, 0, s.length) === s;

export const isJpeg = (d) => d.length >= 3 && d[0] === 0xff && d[1] === 0xd8 && d[2] === 0xff;
export const isPng = (d) => d.length >= 8 && d[0] === 0x89 && d[1] === 0x50 && d[2] === 0x4e && d[3] === 0x47 && d[4] === 0x0d && d[5] === 0x0a && d[6] === 0x1a && d[7] === 0x0a;

/** Inflate zlib data, stopping the moment it passes `max` bytes: `{bytes}` or `{over: true}` or `{bad: true}`. */
export async function inflateBounded(data, max) {
  const ds = new DecompressionStream("deflate");
  const w = ds.writable.getWriter();
  const feeding = w.write(data).then(() => w.close()).catch(() => {});
  const r = ds.readable.getReader();
  const parts = [];
  let total = 0, state = "ok";
  try {
    for (;;) {
      const { done, value } = await r.read();
      if (done) break;
      total += value.length;
      if (total > max) { state = "over"; break; }
      parts.push(value);
    }
  } catch { state = "bad"; }
  r.cancel().catch(() => {});
  await feeding;
  if (state === "over") return { over: true };
  if (state === "bad") return { bad: true };
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return { bytes: out };
}

/** The accumulator both walks fill: facts (the first value of a name stands) and what was left out. */
function newScan(d) {
  const facts = {}, drops = new Map(LEFT_OUT_KINDS.map((k) => [k, { count: 0, bytes: 0 }]));
  const S = {
    facts, drops, format: null, width: 0, height: 0, comps: 0, profile: null, orientation: 1,
    later: { iptc: [], xmp: [] },
    set(name, value) { if (!(name in facts)) facts[name] = value; },
    add(kind, bytes) { drops.get(kind).bytes += Math.max(0, Math.min(bytes, d.length)); },
    drop(kind, bytes) { const x = drops.get(kind); x.count++; x.bytes += Math.max(0, Math.min(Number.isFinite(bytes) ? bytes : 0, d.length)); },
  };
  return S;
}

/** Read the profile bytes a walk found against R14's check; set `S.profile`. */
function settleProfile(S, found) {
  if (!found) return;
  if (found.bytes === null) {
    S.drop("profile", found.total);
    S.profile = { present: true, ok: false, reason: found.reason, bytes: null };
    return;
  }
  const c = checkProfile(found.bytes);
  if (c.ok && S.comps !== 3) { c.ok = false; c.reason = "components"; }      // an RGB profile on a grey picture is not carried
  if (c.colour_space) S.set("profile_colour_space", c.colour_space);
  if (c.description) S.set("profile_description", c.description);
  if (!c.ok) S.drop("profile", found.bytes.length);
  S.profile = { present: true, ok: c.ok, reason: c.reason, bytes: c.ok ? found.bytes : null };
}

/** The text-bearing fields of IPTC and XMP and comments that EXIF did not already give, kept in their names. */
function kept(S, from) {
  for (const [name, value] of Object.entries(from)) if (value !== undefined && value !== "") S.set(name, value);
}

function readIptc(S, data) { S.later.iptc.push(() => applyIptc(S, data)); }
function applyIptc(S, data) {
  const ds = iimDatasets(data);
  const text = (key, max) => {
    const v = ds.get(key)?.[0];
    if (!v) return undefined;
    const s = decodeStrict(v);
    if (s === null) { S.drop("unreadable", v.length); return undefined; }
    return cleanText(s, max) || undefined;
  };
  const keywords = (ds.get("2:25") ?? []).slice(0, LIST_ITEMS).map((v) => decodeStrict(v)).filter((s) => s !== null).map((s) => cleanText(s, FIELD_CHARS)).filter(Boolean);
  const place = ["2:92", "2:90", "2:95", "2:101"].map((k) => text(k, FIELD_CHARS)).filter(Boolean);
  kept(S, {
    byline: text("2:80", FIELD_CHARS), credit: text("2:110", FIELD_CHARS), copyright: text("2:116", FIELD_CHARS),
    description: text("2:120", TEXT_CHARS), keywords: keywords.length ? keywords : undefined,
    place_name: place.length ? cleanText(place.join(", "), TEXT_CHARS) : undefined,
  });
}

function readXmp(S, packet) {
  S.drop("xmp", packet.length);
  S.later.xmp.push(() => {
    const x = packet.length <= XMP_BYTES ? xmpFacts(packet) : null;
    if (!x) { S.drop("unreadable", packet.length); return; }
    kept(S, x.values);
  });
}

/** The Multi-Picture Format index (a JPEG's APP2 "MPF"): the pictures after the first, with their sizes. */
function mpfPictures(m) {
  if (m.length < 16) return null;
  const le = m[0] === 0x49 && m[1] === 0x49;
  if (!le && !(m[0] === 0x4d && m[1] === 0x4d)) return null;
  const dv = new DataView(m.buffer, m.byteOffset, m.length);
  const g16 = (p) => dv.getUint16(p, le), g32 = (p) => dv.getUint32(p, le);
  if (g16(2) !== 42) return null;
  const at = g32(4);
  if (at + 2 > m.length) return null;
  const n = g16(at);
  for (let i = 0; i < n && at + 2 + 12 * (i + 1) <= m.length; i++) {
    const e = at + 2 + 12 * i;
    if (g16(e) !== 0xb002) continue;
    const total = g32(e + 4), off = g32(e + 8);
    if (off + total > m.length) return null;
    const sizes = [];
    for (let k = 1; k * 16 + 16 <= total && sizes.length < LIST_ITEMS; k++) sizes.push(g32(off + k * 16 + 4));
    return sizes;
  }
  return null;
}

/* ── JPEG ─────────────────────────────────────────────────────────────────── */

function scanJpeg(d, S) {
  S.format = "jpeg";
  let p = 2, count = 0, end = -1;
  const icc = [];
  let sawExif = false, mpf = null;
  for (;;) {
    if (p + 1 >= d.length) break;
    if (d[p] !== 0xff) { p = d.indexOf(0xff, p); if (p < 0) break; continue; }
    while (p + 1 < d.length && d[p + 1] === 0xff) p++;
    const m = d[p + 1];
    if (++count > COVER_MAX_CHUNKS) { S.drop("unreadable", d.length - p); break; }
    if (m === 0xd9) { end = p + 2; break; }
    if (m === 0x00 || m === 0x01 || (m >= 0xd0 && m <= 0xd8)) { p += 2; continue; }
    if (p + 4 > d.length) break;
    const len = u16(d, p + 2);
    if (len < 2 || p + 2 + len > d.length) break;
    const body = d.subarray(p + 4, p + 2 + len);
    p += 2 + len;
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      if (body.length >= 6 && !S.width) { S.height = u16(body, 1); S.width = u16(body, 3); S.comps = body[5]; }
    } else if (m === 0xe0) {
      if (startsWith(body, "JFIF\0") && body.length >= 14) { const tw = body[12], th = body[13]; if (tw * th > 0) S.drop("thumbnail", 3 * tw * th); }
      else if (startsWith(body, "JFXX\0")) S.drop("thumbnail", body.length);
      else S.drop("other_metadata", body.length);
    } else if (m === 0xe1) {
      if (startsWith(body, "Exif\0\0")) {
        if (sawExif) S.drop("other_metadata", body.length);
        else if (body.length - 6 > EXIF_BYTES) S.drop("unreadable", body.length);
        else { sawExif = true; readExif(body.subarray(6), S); }
      } else if (startsWith(body, "http://ns.adobe.com/xap/1.0/\0")) readXmp(S, body.subarray(29));
      else if (startsWith(body, "http://ns.adobe.com/xmp/extension/\0")) S.drop("xmp", body.length);
      else S.drop("other_metadata", body.length);
    } else if (m === 0xe2) {
      if (startsWith(body, "ICC_PROFILE\0") && body.length >= 14) icc.push({ seq: body[12], count: body[13], data: body.subarray(14) });
      else if (startsWith(body, "MPF\0")) mpf = body.subarray(4);
      else S.drop("other_metadata", body.length);
    } else if (m === 0xeb) {
      if (body.length >= 2 && body[0] === 0x4a && body[1] === 0x50) S.drop("credentials", body.length);
      else S.drop("other_metadata", body.length);
    } else if (m === 0xed) {
      if (startsWith(body, "Photoshop 3.0\0")) {
        for (const r of photoshopResources(body.subarray(14))) {
          if (r.id === 0x0404) readIptc(S, r.data);
          else if (r.id === 0x0409 || r.id === 0x040c) S.drop("thumbnail", r.data.length);
        }
      } else S.drop("other_metadata", body.length);
    } else if (m === 0xee) {
      /* Adobe's APP14 decides how the data decodes; it is written fresh and is not metadata */
      if (!startsWith(body, "Adobe")) S.drop("other_metadata", body.length);
    } else if (m >= 0xe3 && m <= 0xef) S.drop("other_metadata", body.length);
    else if (m === 0xfe) {
      const r = textOf(body, TEXT_CHARS);
      if (r.bad) S.drop("unreadable", body.length);
      else if (r.value && !("comments" in S.facts)) S.set("comments", r.value);
      else if (r.value) S.drop("other_metadata", body.length);
    } else if (m === 0xda) {
      /* the entropy-coded data: on to the next marker that is not a restart or a stuffed byte */
      for (;;) {
        p = d.indexOf(0xff, p);
        if (p < 0 || p + 1 >= d.length) { p = d.length; break; }
        const n = d[p + 1];
        if (n === 0 || (n >= 0xd0 && n <= 0xd7)) { p += 2; continue; }
        if (n === 0xff) { p++; continue; }
        break;
      }
    }
  }
  /* what follows EOI: a second picture the Multi-Picture index names, and any other trailing byte */
  if (end >= 0 && end < d.length) {
    const trailer = d.length - end;
    const sizes = mpf ? mpfPictures(mpf) : null;
    let pictures = 0;
    if (sizes) for (const s of sizes) { if (pictures + s <= trailer) { pictures += s; S.drop("extra_picture", s); } }
    if (trailer - pictures > 0) S.drop("after_end", trailer - pictures);
  } else if (mpf) S.drop("extra_picture", mpf.length);
  /* the colour profile, assembled from its numbered pieces */
  if (icc.length) {
    const count = icc[0].count, total = icc.reduce((n, c) => n + c.data.length, 0);
    const ok = count >= 1 && icc.length === count && icc.every((c) => c.count === count) &&
      new Set(icc.map((c) => c.seq)).size === count && icc.every((c) => c.seq >= 1 && c.seq <= count);
    if (!ok) settleProfile(S, { bytes: null, total, reason: "pieces" });
    else if (total > PHOTO_PROFILE_MAX) settleProfile(S, { bytes: null, total, reason: "over_bound" });
    else {
      const bytes = new Uint8Array(total);
      let o = 0;
      for (const c of [...icc].sort((a, b) => a.seq - b.seq)) { bytes.set(c.data, o); o += c.data.length; }
      settleProfile(S, { bytes, total });
    }
  }
}

/* ── PNG ──────────────────────────────────────────────────────────────────── */

const PNG_STRUCTURE = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS"]);
/* Latin-1 text of the first `max` bytes at most (every byte is a character, none is invalid); the rest is not read */
const latin1 = (b, max = TEXT_CHARS * 4) => {
  let s = "";
  const n = Math.min(b.length, max);
  for (let i = 0; i < n; i += 4096) s += String.fromCharCode(...b.subarray(i, Math.min(n, i + 4096)));
  return s;
};

async function scanPng(d, S) {
  S.format = "png";
  let p = 8, count = 0, trailer = 0;
  const texts = [];
  let found = null;
  for (;;) {
    if (p + 12 > d.length) break;
    if (++count > COVER_MAX_CHUNKS) { S.drop("unreadable", d.length - p); break; }
    const len = u32(d, p), type = ascii(d, p + 4, 4);
    if (p + 12 + len > d.length) break;
    const body = d.subarray(p + 8, p + 8 + len);
    const crcOk = () => crc32(d.subarray(p + 4, p + 8), body) === u32(d, p + 8 + len);
    if (type === "IHDR") { if (len === 13 && crcOk()) { S.width = u32(body, 0); S.height = u32(body, 4); S.comps = body[9] === 0 || body[9] === 4 ? 1 : 3; } }
    else if (type === "IEND") { trailer = d.length - (p + 12); break; }
    else if (type === "iCCP") {
      if (!crcOk()) S.drop("unreadable", len);
      else {
        const z = body.indexOf(0);
        if (z < 1 || z + 2 > body.length || body[z + 1] !== 0) S.drop("unreadable", len);
        else {
          const r = await inflateBounded(body.subarray(z + 2), PHOTO_PROFILE_MAX);
          found = r.bytes ? { bytes: r.bytes, total: r.bytes.length } : { bytes: null, total: len, reason: r.over ? "over_bound" : "inflate" };
        }
      }
    } else if (type === "eXIf") {
      if (len > EXIF_BYTES || !crcOk()) S.drop("unreadable", len);
      else { readExif(body, S); }
    } else if (type === "tEXt" || type === "zTXt" || type === "iTXt") {
      if (!crcOk()) S.drop("unreadable", len); else texts.push({ type, body });
    } else if (type === "acTL") {
      /* the animation's frame count: every frame after the first is a second picture */
      const n = len >= 4 ? Math.min(u32(body, 0), LIST_ITEMS) : 0;
      for (let i = 1; i < n; i++) S.drop("extra_picture", 0);
    } else if (type === "fdAT") S.add("extra_picture", len);
    else if (type === "fcTL") { /* a frame's control block: its frames are counted from acTL */ }
    else if (!PNG_STRUCTURE.has(type)) S.drop("other_metadata", len);
    p += 12 + len;
  }
  if (trailer > 0) S.drop("after_end", trailer);
  const list = [];
  for (const { type, body } of texts) {
    const z = body.indexOf(0);
    if (z < 1 || z > 79) { S.drop("unreadable", body.length); continue; }
    const keyword = cleanText(latin1(body.subarray(0, z)), 79);
    let value;
    if (type === "tEXt") value = cleanText(latin1(body.subarray(z + 1)), TEXT_CHARS);
    else if (type === "zTXt") {
      if (body[z + 1] !== 0) { S.drop("unreadable", body.length); continue; }
      const r = await inflateBounded(body.subarray(z + 2), INFLATED);
      if (!r.bytes) { S.drop("unreadable", body.length); continue; }
      value = cleanText(latin1(r.bytes), TEXT_CHARS);
    } else {
      /* iTXt: keyword NUL, compression flag, method, language NUL, translated keyword NUL, text */
      const flag = body[z + 1], l1 = body.indexOf(0, z + 3), l2 = l1 < 0 ? -1 : body.indexOf(0, l1 + 1);
      if (l2 < 0 || (flag !== 0 && flag !== 1)) { S.drop("unreadable", body.length); continue; }
      let raw = body.subarray(l2 + 1);
      if (flag === 1) { const r = await inflateBounded(raw, INFLATED); if (!r.bytes) { S.drop("unreadable", body.length); continue; } raw = r.bytes; }
      if (keyword === "XML:com.adobe.xmp") { readXmp(S, raw); continue; }
      const s = decodeStrict(raw);
      if (s === null) { S.drop("unreadable", body.length); continue; }
      value = cleanText(s, TEXT_CHARS);
    }
    if (keyword && value) { if (list.length < LIST_ITEMS) list.push({ keyword, text: value }); else S.drop("unreadable", body.length); }
  }
  if (list.length) S.set("png_text", list);
  settleProfile(S, found);
}

/** The walk of a JPEG or PNG: the accumulator with facts, drops, size, orientation and profile; null when neither format. */
export async function scanPhoto(d) {
  const S = newScan(d);
  if (isJpeg(d)) scanJpeg(d, S);
  else if (isPng(d)) await scanPng(d, S);
  else return null;
  /* what the embedded blocks say fills what the EXIF did not: EXIF first, then IPTC, then XMP, whatever their order in the file */
  for (const run of [...S.later.iptc, ...S.later.xmp]) run();
  if (S.width && S.height) { S.facts.width = S.width; S.facts.height = S.height; }
  if (S.facts.orientation) S.orientation = S.facts.orientation;
  return S;
}

const leftOutOf = (S) => LEFT_OUT_KINDS.filter((k) => S.drops.get(k).count).map((kind) => ({ kind, ...S.drops.get(kind) }));
export { leftOutOf };

/** What a photograph says (R13): `{ok: true, facts, left_out}`. Never throws. */
export async function photoFactsOf(bytes) {
  try {
    const d = bytes instanceof Uint8Array ? bytes : bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : null;
    if (!d) throw new CoverRefusal("NOT_A_COVERABLE_FORMAT", localize("image-cover.photo.the_photos_bytes_are_not_a_byte_array", "the photo's bytes are not a byte array"));
    if (d.length > COVER_MAX_BYTES)
      throw new CoverRefusal("PHOTO_TOO_LARGE", localize("image-cover.photo.the_photo_is_length_bytes", "the photo is {length} bytes, over the {COVER_MAX_BYTES} this module reads", { length: String(d.length), COVER_MAX_BYTES: String(COVER_MAX_BYTES) }));
    const S = await scanPhoto(d);
    if (!S) throw new CoverRefusal("NOT_A_COVERABLE_FORMAT", localize("image-cover.photo.the_photo_is_neither_a_jpeg_nor_a_png", "the photo is neither a JPEG nor a PNG"));
    return { ok: true, facts: S.facts, left_out: leftOutOf(S) };
  } catch (e) {
    if (e instanceof CoverRefusal) return { ok: false, code: e.code, detail: e.detail };
    return { ok: true, facts: {}, left_out: [{ kind: "unreadable", count: 1, bytes: 0 }] };
  }
}
