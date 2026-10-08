/* doc-clean: one embedded image, judged from its bytes and either stripped, left as it is, or refused (R2, R3).
 *
 * `cleanImage(bytes, where)` answers `{bytes, changed}` or throws a `CleanRefusal`; `where` names the image in a
 * refusal's detail (a part or an object). `imageKind(bytes)` names an image format from its leading bytes, or `null`
 * when the bytes are not an image this module knows. Nothing here reads a name or a declared type. */
import { stripMetadata } from "../image-cover/index.mjs";

export class CleanRefusal extends Error {
  constructor(code, detail) {
    super(`${code}: ${detail}`);
    this.code = code;
    this.detail = detail;
  }
}

const at = (d, o, ...b) => d.length >= o + b.length && b.every((x, i) => d[o + i] === x);
/** The bytes `d[o, o + n)` as a string of one character per byte. */
export function latin1(d, o = 0, n = d.length - o) {
  let s = "";
  for (let i = o, end = Math.min(d.length, o + n); i < end; i += 0x8000) s += String.fromCharCode.apply(null, d.subarray(i, Math.min(end, i + 0x8000)));
  return s;
}
const ascii = latin1;
const u32le = (d, o) => (d[o] | (d[o + 1] << 8) | (d[o + 2] << 16) | (d[o + 3] << 24)) >>> 0;

/** The ISO-BMFF brands of HEIF and AVIF files. */
const HEIF_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1", "avif", "avis", "mif2"]);

/** The image format of `d`, from its leading bytes, or `null`. */
export function imageKind(d) {
  if (at(d, 0, 0xff, 0xd8, 0xff)) return "jpeg";
  if (at(d, 0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (at(d, 0, 0x47, 0x49, 0x46, 0x38) && (d[4] === 0x37 || d[4] === 0x39) && d[5] === 0x61) return "gif";
  if (d.length >= 12 && ascii(d, 0, 4) === "RIFF" && ascii(d, 8, 4) === "WEBP") return "webp";
  if (at(d, 0, 0, 0, 0, 0x0c, 0x6a, 0x50, 0x20, 0x20)) return "jp2";
  if (at(d, 0, 0xff, 0x4f, 0xff, 0x51)) return "j2k";
  if (at(d, 0, 0x49, 0x49, 0x2a, 0) || at(d, 0, 0x4d, 0x4d, 0, 0x2a) || at(d, 0, 0x49, 0x49, 0x2b, 0) || at(d, 0, 0x4d, 0x4d, 0, 0x2b)) return "tiff";
  if (at(d, 0, 0xff, 0x0a) || at(d, 0, 0, 0, 0, 0x0c, 0x4a, 0x58, 0x4c, 0x20)) return "jxl";
  if (d.length >= 12 && ascii(d, 4, 4) === "ftyp") {
    const n = Math.min(d.length, (d[0] << 24 | d[1] << 16 | d[2] << 8 | d[3]) >>> 0);
    for (let o = 8; o + 4 <= n; o += 4) if (o !== 12 && HEIF_BRANDS.has(ascii(d, o, 4))) return "heif";
    return null;
  }
  if (at(d, 0, 0x42, 0x4d) && d.length >= 18 && [12, 40, 52, 56, 64, 108, 124].includes(u32le(d, 14))) return "bmp";
  if (d.length >= 44 && u32le(d, 0) === 1 && ascii(d, 40, 4) === " EMF") return "emf";
  if (at(d, 0, 0xd7, 0xcd, 0xc6, 0x9a) || ((at(d, 0, 1, 0, 9, 0) || at(d, 0, 2, 0, 9, 0)) && (d[4] === 0 && (d[5] === 1 || d[5] === 3)))) return "wmf";
  if (d.length >= 6 && ascii(d, 0, 6) === "VCLMTF") return "svm";
  if (at(d, 0, 0x1f, 0x8b, 0x08)) return "gzip";
  if (rootElement(d) === "svg") return "svg";
  return null;
}

/** The local name of an XML document's first element (after a BOM, the declaration, comments, processing
 *  instructions and a doctype), lower-cased, read from at most its first 4 KB; `null` when it does not start as XML. */
export function rootElement(d) {
  const s = ascii(d, d[0] === 0xef && d[1] === 0xbb && d[2] === 0xbf ? 3 : 0, Math.min(d.length, 4096));
  const m = /^\s*(?:(?:<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>[]*(?:\[[\s\S]*?\])?\s*>)\s*)*<([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)/.exec(s);
  return m ? m[2].toLowerCase() : null;
}

/** Whether `d` holds a whole JPEG or PNG inside it (a metafile's embedded bitmap). */
function holdsRaster(d) {
  for (let i = 0; i + 8 <= d.length; i++) {
    if (d[i] === 0xff && d[i + 1] === 0xd8 && d[i + 2] === 0xff) return "a JPEG";
    if (d[i] === 0x89 && d[i + 1] === 0x50 && d[i + 2] === 0x4e && d[i + 3] === 0x47 && d[i + 4] === 0x0d && d[i + 5] === 0x0a) return "a PNG";
  }
  return null;
}

const NAMES = { tiff: "a TIFF", heif: "a HEIC or AVIF", jxl: "a JPEG XL", emf: "an EMF", wmf: "a WMF", svm: "an SVM" };

/** Gunzip `d` whole, capped at `max` bytes out; `null` when it cannot be read or runs over. */
async function gunzip(d, max) {
  try {
    const reader = new Blob([d]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();
    const parts = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      n += value.length;
      if (n > max) { await reader.cancel(); return null; }
      parts.push(value);
    }
    const out = new Uint8Array(n);
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
  } catch {
    return null;
  }
}

/** A gzip member's header rewritten to carry no name, comment, extra field or time; the deflate data and trailer
 *  unchanged. `null` when the header cannot be walked. */
function bareGzip(d) {
  const flg = d[3];
  let o = 10;
  if (flg & 4) { if (o + 2 > d.length) return null; o += 2 + (d[o] | (d[o + 1] << 8)); }
  for (const bit of [8, 16]) if (flg & bit) { while (o < d.length && d[o] !== 0) o++; o++; }
  if (flg & 2) o += 2;
  if (o > d.length) return null;
  if (o === 10 && (flg & 0x1e) === 0 && d[4] === 0 && d[5] === 0 && d[6] === 0 && d[7] === 0) return d;
  const out = new Uint8Array(10 + d.length - o);
  out.set([0x1f, 0x8b, 0x08, 0, 0, 0, 0, 0, d[8], 0xff]);
  out.set(d.subarray(o), 10);
  return out;
}

/** Strip, keep or refuse one image (R2, R3). `kind` is `imageKind(bytes)`, never `null`. */
export async function cleanImage(bytes, kind, where, maxInflated) {
  switch (kind) {
    case "jpeg": case "png": case "gif": case "webp": case "jp2": case "j2k": {
      const r = stripMetadata(bytes);
      if (!r || !r.ok) throw new CleanRefusal(r?.code ?? "IMAGE_NOT_CLEANABLE", `${where}: ${r?.detail ?? "the image could not be stripped"}`);
      return { bytes: r.bytes, changed: r.changed };
    }
    case "tiff": case "heif": case "jxl":
      throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: ${NAMES[kind]} image, whose metadata this module cannot strip`);
    case "bmp": {
      const header = u32le(bytes, 14), compression = bytes.length >= 34 ? u32le(bytes, 30) : 0;
      if (header >= 40 && (compression === 4 || compression === 5))
        throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: a BMP image holding ${compression === 4 ? "a JPEG" : "a PNG"} image`);
      const cs = header >= 108 && bytes.length >= 14 + 60 ? ascii(bytes, 14 + 56, 4) : "";
      if (cs === "DEBM" || cs === "KNIL")
        throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: a BMP image carrying a colour profile`);
      return { bytes, changed: false };
    }
    case "emf": case "wmf": case "svm": {
      const held = holdsRaster(bytes);
      if (held) throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: ${NAMES[kind]} image holding ${held} image`);
      return { bytes, changed: false };
    }
    case "svg": {
      const s = ascii(bytes, 0, bytes.length);
      const m = /<([\w.-]+:)?(image|metadata)(?=[\s/>])/i.exec(s);
      if (m) throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: an SVG image with an <${m[2].toLowerCase()}> element`);
      return { bytes, changed: false };
    }
    case "gzip": {
      const inner = await gunzip(bytes, maxInflated);
      if (!inner) throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: a compressed image that cannot be read whole`);
      const k = imageKind(inner);
      if (k && k !== "gzip") await cleanImage(inner, k, where, maxInflated);
      const bare = bareGzip(bytes);
      if (!bare) throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: a compressed image whose header cannot be read`);
      return { bytes: bare, changed: bare !== bytes };
    }
  }
  throw new CleanRefusal("IMAGE_NOT_CLEANABLE", `${where}: an image of no format this module knows`);
}
