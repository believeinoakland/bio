/* image-cover: the kept fields of an EXIF (TIFF-structured) block, read as typed, bounded, range-checked data (R13).
 *
 * The walk takes IFD0, the Exif and GPS directories it points to, and notes IFD1's thumbnail; each directory once (a
 * directory that points back is unreadable, not followed), each within the entry bound, every value inside the block.
 * A field that is absent is left out silently; one that is present but malformed, out of range, over its bound or not
 * valid text is omitted and counted `unreadable`, never guessed. A maker note, a thumbnail and the binary-valued GPS
 * fields are not read: they are named in `left_out` with their sizes. Pure; the caller's `sink` receives what is read:
 * `sink.set(name, value)` (the first value of a name stands) and `sink.drop(kind, bytes)`. */
import { boundOf } from "../read-bounds.mjs";
import { cleanText, decodeStrict, textOf, FIELD_CHARS, TEXT_CHARS } from "./photo-text.mjs";

const ENTRIES = boundOf("image", "photo_directory_entries");
const TYPE_SIZE = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
const ASCII = 2, SHORT = 3, LONG = 4, RATIONAL = 5, UNDEFINED = 7;

const TAG = {
  orientation: 0x0112, make: 0x010f, model: 0x0110, software: 0x0131, modified: 0x0132, artist: 0x013b, copyright: 0x8298,
  description: 0x010e, exifIfd: 0x8769, gpsIfd: 0x8825,
  exposure: 0x829a, fNumber: 0x829d, iso: 0x8827, taken: 0x9003, flash: 0x9209, focal: 0x920a, makerNote: 0x927c,
  userComment: 0x9286, imageId: 0xa420, owner: 0xa430, bodySerial: 0xa431, lensModel: 0xa434, lensSerial: 0xa435,
  thumbOffset: 0x0201, thumbLength: 0x0202,
};
const GPS = { latRef: 1, lat: 2, lonRef: 3, lon: 4, altRef: 5, alt: 6, time: 7, datum: 0x12, direction: 0x11, date: 0x1d, method: 0x1b, area: 0x1c };

const TIME = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
const DATE = /^(\d{4}):(\d{2}):(\d{2})$/;
const inRange = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
const round = (v, k) => Math.round(v * k) / k;

function dateOk(y, mo, d) { return inRange(y, 1, 9999) && inRange(mo, 1, 12) && inRange(d, 1, 31); }

/** Read the EXIF block `t` (starting at its byte-order mark) into `sink`. Never throws. */
export function readExif(t, sink) {
  try { walk(t, sink); } catch { sink.drop("unreadable", t.length); }
}

function walk(t, sink) {
  if (t.length < 8) return sink.drop("unreadable", t.length);
  const le = t[0] === 0x49 && t[1] === 0x49;
  if (!le && !(t[0] === 0x4d && t[1] === 0x4d)) return sink.drop("unreadable", t.length);
  const dv = new DataView(t.buffer, t.byteOffset, t.length);
  const u16 = (p) => dv.getUint16(p, le), u32 = (p) => dv.getUint32(p, le);
  if (u16(2) !== 42) return sink.drop("unreadable", t.length);
  const seen = new Set();

  /* where an entry's value lies: {type, count, total, at} or null when it lies outside the block */
  const place = (e) => {
    const type = u16(e + 2), count = u32(e + 4), size = TYPE_SIZE[type];
    if (!size) return null;
    const total = size * count, at = total <= 4 ? e + 8 : u32(e + 8);
    if (at + total > t.length) return { bad: true, total: Math.min(total, t.length) };
    return { type, count, total, at };
  };
  const bad = (loc) => sink.drop("unreadable", loc?.total ?? 0);
  const rational = (at) => { const den = u32(at + 4); return den === 0 ? NaN : u32(at) / den; };

  const text = (e, name, max) => {
    const loc = place(e);
    if (!loc || loc.bad || (loc.type !== ASCII && loc.type !== UNDEFINED && loc.type !== 1)) return bad(loc);
    if (loc.total > max * 4) return bad(loc);
    const r = textOf(t.subarray(loc.at, loc.at + loc.total), max);
    if (r.bad) return bad(loc);
    if (r.value) sink.set(name, r.value);
  };
  const short = (e, lo, hi) => {
    const loc = place(e);
    if (!loc || loc.bad || loc.type !== SHORT || loc.count < 1) return bad(loc), undefined;
    const v = u16(loc.at);
    return inRange(v, lo, hi) ? v : (bad(loc), undefined);
  };
  const rat = (e, name, lo, hi) => {
    const loc = place(e);
    if (!loc || loc.bad || loc.type !== RATIONAL || loc.count < 1) return bad(loc), undefined;
    const v = rational(loc.at);
    if (!inRange(v, lo, hi)) return bad(loc), undefined;
    if (name) sink.set(name, round(v, 1e6));
    return v;
  };
  const stamp = (e, name) => {
    const loc = place(e);
    if (!loc || loc.bad || loc.type !== ASCII) return bad(loc);
    const r = textOf(t.subarray(loc.at, loc.at + loc.total), FIELD_CHARS);
    if (r.bad) return bad(loc);
    const s = r.value ?? "";
    if (!s || /^[\s:]*$/.test(s)) return;                       // a camera that wrote no time writes blanks
    const m = TIME.exec(s);
    if (m && dateOk(+m[1], +m[2], +m[3]) && +m[4] < 24 && +m[5] < 60 && +m[6] < 61) sink.set(name, `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`);
    else bad(loc);
  };
  const comment = (e) => {
    const loc = place(e);
    if (!loc || loc.bad || loc.type !== UNDEFINED || loc.total < 8 || loc.total > TEXT_CHARS * 4 + 8) return bad(loc);
    const code = String.fromCharCode(...t.subarray(loc.at, loc.at + 8)), body = t.subarray(loc.at + 8, loc.at + loc.total);
    let s;
    if (code === "ASCII\0\0\0" || code === "\0\0\0\0\0\0\0\0") { const r = textOf(body, TEXT_CHARS); if (r.bad) return bad(loc); s = r.value; }
    else if (code === "UNICODE\0" && body.length % 2 === 0) {
      try { s = cleanText(new TextDecoder(le ? "utf-16le" : "utf-16be", { fatal: true }).decode(body), TEXT_CHARS); } catch { return bad(loc); }
    } else return bad(loc);
    if (s) sink.set("comments", s);
  };
  const dms = (e, refLoc, refs, name, max) => {
    const loc = place(e);
    if (!loc || loc.bad || loc.type !== RATIONAL || loc.count !== 3 || !refLoc) return bad(loc);
    const [d, m, s] = [0, 1, 2].map((i) => rational(loc.at + 8 * i));
    const ref = refLoc.slice(0, 1).toUpperCase();
    if (!(ref in refs) || !inRange(d, 0, max) || !inRange(m, 0, 59.999999) || !inRange(s, 0, 59.999999)) return bad(loc);
    const v = (d + m / 60 + s / 3600) * refs[ref];
    if (!inRange(v, -max, max)) return bad(loc);
    sink.set(name, round(v, 1e7));
  };

  /* one directory: calls `each(tag, entry)` for its entries; answers its next-IFD offset (0 when none) */
  const directory = (off, each) => {
    if (off < 8 || off + 2 > t.length || seen.has(off)) { sink.drop("unreadable", 0); return 0; }
    seen.add(off);
    const n = u16(off);
    if (n > ENTRIES || off + 2 + 12 * n + 4 > t.length) { sink.drop("unreadable", Math.min(n * 12, t.length)); return 0; }
    for (let i = 0; i < n; i++) { const e = off + 2 + 12 * i; each(u16(e), e); }
    return u32(off + 2 + 12 * n);
  };
  const refOf = (e) => {
    const loc = place(e);
    if (!loc || loc.bad || loc.type !== ASCII || loc.total < 1) return null;
    return decodeStrict(t.subarray(loc.at, loc.at + 1));
  };

  let exifAt = 0, gpsAt = 0;
  const ifd0Next = directory(u32(4), (tag, e) => {
    switch (tag) {
      case TAG.orientation: { const v = short(e, 1, 8); if (v !== undefined) sink.set("orientation", v); break; }
      case TAG.make: text(e, "make", FIELD_CHARS); break;
      case TAG.model: text(e, "model", FIELD_CHARS); break;
      case TAG.software: text(e, "software", FIELD_CHARS); break;
      case TAG.artist: text(e, "artist", FIELD_CHARS); break;
      case TAG.copyright: text(e, "copyright", FIELD_CHARS); break;
      case TAG.description: text(e, "description", TEXT_CHARS); break;
      case TAG.modified: stamp(e, "time_modified"); break;
      case TAG.exifIfd: exifAt = u32(e + 8); break;
      case TAG.gpsIfd: gpsAt = u32(e + 8); break;
      case TAG.makerNote: { const loc = place(e); sink.drop("maker_note", loc?.total ?? 0); break; }
      default:
    }
  });
  if (exifAt) directory(exifAt, (tag, e) => {
    switch (tag) {
      case TAG.exposure: rat(e, "exposure_time", 1e-9, 86400); break;
      case TAG.fNumber: rat(e, "f_number", 0.1, 1000); break;
      case TAG.iso: { const v = short(e, 1, 0xfffe); if (v !== undefined) sink.set("iso", v); break; }
      case TAG.taken: stamp(e, "time_taken"); break;
      case TAG.flash: { const v = short(e, 0, 0xfffe); if (v !== undefined) sink.set("flash", v); break; }
      case TAG.focal: rat(e, "focal_length", 0.1, 100000); break;
      case TAG.makerNote: { const loc = place(e); sink.drop("maker_note", loc?.total ?? 0); break; }
      case TAG.userComment: comment(e); break;
      case TAG.imageId: text(e, "image_unique_id", FIELD_CHARS); break;
      case TAG.owner: text(e, "owner_name", FIELD_CHARS); break;
      case TAG.bodySerial: text(e, "body_serial", FIELD_CHARS); break;
      case TAG.lensModel: text(e, "lens", FIELD_CHARS); break;
      case TAG.lensSerial: text(e, "lens_serial", FIELD_CHARS); break;
      default:
    }
  });
  if (gpsAt) {
    const g = {};
    directory(gpsAt, (tag, e) => { g[tag] = e; });
    const NS = { N: 1, S: -1 }, EW = { E: 1, W: -1 };
    if (g[GPS.lat] !== undefined) dms(g[GPS.lat], g[GPS.latRef] !== undefined ? refOf(g[GPS.latRef]) : null, NS, "gps_latitude", 90);
    if (g[GPS.lon] !== undefined) dms(g[GPS.lon], g[GPS.lonRef] !== undefined ? refOf(g[GPS.lonRef]) : null, EW, "gps_longitude", 180);
    if (g[GPS.alt] !== undefined) {
      const v = rat(g[GPS.alt], null, 0, 100000);
      const below = g[GPS.altRef] !== undefined ? t[(place(g[GPS.altRef]) ?? { at: -1 }).at] : 0;
      if (v !== undefined) { if (below === 0 || below === 1) sink.set("gps_altitude", round(below ? -v : v, 1e3)); else sink.drop("unreadable", 0); }
    }
    if (g[GPS.direction] !== undefined) { const v = rat(g[GPS.direction], null, 0, 360); if (v !== undefined) sink.set("gps_direction", round(v, 1e3)); }
    if (g[GPS.datum] !== undefined) text(g[GPS.datum], "gps_datum", FIELD_CHARS);
    if (g[GPS.time] !== undefined) {
      const loc = place(g[GPS.time]);
      if (!loc || loc.bad || loc.type !== RATIONAL || loc.count !== 3) bad(loc);
      else {
        const [h, m, s] = [0, 1, 2].map((i) => rational(loc.at + 8 * i));
        const dloc = g[GPS.date] !== undefined ? place(g[GPS.date]) : null;
        const dm = dloc && !dloc.bad && dloc.type === ASCII ? DATE.exec(textOf(t.subarray(dloc.at, dloc.at + dloc.total), FIELD_CHARS).value ?? "") : null;
        if (!(inRange(h, 0, 23) && inRange(m, 0, 59) && inRange(s, 0, 60.999)) || (dm && !dateOk(+dm[1], +dm[2], +dm[3]))) bad(loc);
        else {
          const two = (v) => String(Math.floor(v)).padStart(2, "0");
          sink.set("gps_time", `${dm ? `${dm[1]}-${dm[2]}-${dm[3]}T` : ""}${two(h)}:${two(m)}:${two(s)}Z`);
        }
      }
    }
    for (const tag of [GPS.method, GPS.area]) if (g[tag] !== undefined) sink.drop("other_metadata", place(g[tag])?.total ?? 0);
  }
  if (ifd0Next && ifd0Next < t.length) {
    /* IFD1: the thumbnail's directory; its picture is named by size and never read */
    let bytes = 0;
    directory(ifd0Next, (tag, e) => {
      if (tag === TAG.thumbLength) { const loc = place(e); if (loc && !loc.bad && loc.count === 1 && (loc.type === SHORT || loc.type === LONG)) bytes = loc.type === SHORT ? u16(loc.at) : u32(loc.at); }
    });
    sink.drop("thumbnail", bytes);
  }
}
