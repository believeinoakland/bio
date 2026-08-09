/* Structure inside PDFs: the outbound-link graph (D-91, phase 1).
 *
 * CONTENT-PDF CONSUMES bytes (I1) and PRODUCES structure. This module is the
 * cheap, no-font half of that: it reads assembled PDF bytes and characterises
 * a document's outbound links into the SAME partitions HTML uses, so structure
 * is container-agnostic. It is the PDF analog of `subresources.mjs`'s link
 * classification, not a second link system, and it emits BYTE-IDENTICAL
 * wrappers by importing `linkWrapper`/`LINK_TYPES` from that file rather than
 * re-deriving them — the one way drift cannot happen. (`pdfstructure.test.mjs`
 * still asserts the parity, so a future local reimplementation that drifts is
 * caught.)
 *
 * The doctrine that shapes every line: a link we cannot resolve is recorded as
 * `undetermined`, never dropped and never invented. `undetermined` is
 * first-class (CLAUDE.md). A PDF whose structure is ambiguous says so.
 *
 * What phase 1 maps (D-91's measured table):
 *   /Annots /Subtype /Link with /A /S /URI     -> deferred (http/https)
 *                                              -> refused  (mailto:, javascript:, ...)
 *   /A /S /GoTo and /Dest destinations         -> anchor (target page + element ref)
 *   embedded / attached files                  -> intra (content-addressed), else undetermined
 *   element reference                          -> source page index + annotation /Rect
 *
 * The prose/content half is TIERED (D-91). Tier 1 lives HERE, pure JS, no
 * dependency (QUEUE CPDF-4): it walks each page's content stream(s), reads the
 * text-showing operators (Tj, TJ, and the '/" line variants), and decodes the
 * shown bytes to Unicode through each font's /ToUnicode CMap (beginbfchar /
 * bfrange). It reuses the same object/stream parser the link half uses. The
 * SAME first-class-undetermined doctrine governs it: a run shown by a font with
 * no /ToUnicode (a CID font is the canonical case), or a code that maps to
 * nothing, is recorded as `undetermined` NAMING the cause (the font) and its
 * bytes are NEVER guessed into readable text — no mojibake, per region. Tier 2
 * (`unpdf`/pdf.js, for the residue Tier 1 cannot decode) is a separate fleet
 * Worker (I6, CPDF-6) and does not live here.
 *
 * No DOM, no Worker bindings, no bundled dependency. FlateDecode is the native
 * DecompressionStream("deflate"). The parser is LENIENT by design: rather than
 * trust a possibly-broken xref, it brute-force scans every `N G obj` in the
 * file AND every object inside every /ObjStm object stream, so a modern
 * xref-stream PDF (what Legistar/OpenGov serve) is never silently empty.
 */

import { LINK_TYPES, linkWrapper } from "./subresources.mjs";

/* Partition vocabulary, mirrored from subresources.mjs and extended by the one
 * first-class value a byte-level reader needs that a DOM reader does not:
 * `undetermined`. LINK_TYPES stays exactly the HTML set so the four that map
 * are provably the same four; `undetermined` is ours and carries no wrapper. */
export const PDF_LINK_TYPES = [...LINK_TYPES, "undetermined"];

/* ------------------------------------------------------------------ *
 * Byte helpers
 * ------------------------------------------------------------------ */

const LATIN1 = new TextDecoder("latin1");

function isWhitespace(c) {
  return c === 0x00 || c === 0x09 || c === 0x0a || c === 0x0c || c === 0x0d || c === 0x20;
}
function isDelimiter(c) {
  return c === 0x28 || c === 0x29 || c === 0x3c || c === 0x3e || c === 0x5b ||
         c === 0x5d || c === 0x7b || c === 0x7d || c === 0x2f || c === 0x25;
}

/** FlateDecode via the native DecompressionStream — no bundled dependency.
 *  /FlateDecode is zlib-wrapped deflate, which is exactly what the "deflate"
 *  format decodes. Returns null on any decode failure (leniency: an
 *  unreadable stream is an absence, never a throw that loses the whole doc). */
async function inflate(u8) {
  try {
    const ds = new DecompressionStream("deflate");
    const out = new Response(new Blob([u8]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  } catch {
    /* Some producers emit raw deflate with no zlib header. Try that. */
    try {
      const ds = new DecompressionStream("deflate-raw");
      const out = new Response(new Blob([u8]).stream().pipeThrough(ds));
      return new Uint8Array(await out.arrayBuffer());
    } catch {
      return null;
    }
  }
}

/** Undo a PNG predictor (Predictor >= 10) applied before Flate. Xref and some
 *  object streams use it. Colors/BitsPerComponent default to 1/8; only the row
 *  filter byte and the Up/Sub/Average/Paeth cases are needed in practice. */
function unpredict(data, { predictor = 1, colors = 1, columns = 1, bpc = 8 } = {}) {
  if (predictor < 10) return data; /* TIFF predictor 2 is vanishingly rare here */
  const bpp = Math.max(1, Math.ceil((colors * bpc) / 8));
  const rowLen = Math.ceil((colors * bpc * columns) / 8);
  if (rowLen <= 0) return data;
  const rows = Math.floor(data.length / (rowLen + 1));
  const out = new Uint8Array(rows * rowLen);
  let prev = new Uint8Array(rowLen);
  for (let r = 0; r < rows; r++) {
    const filter = data[r * (rowLen + 1)];
    const src = data.subarray(r * (rowLen + 1) + 1, r * (rowLen + 1) + 1 + rowLen);
    const cur = out.subarray(r * rowLen, r * rowLen + rowLen);
    for (let i = 0; i < rowLen; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0;
      const b = prev[i];
      const c = i >= bpp ? prev[i - bpp] : 0;
      let v = src[i];
      switch (filter) {
        case 0: break;
        case 1: v = (v + a) & 0xff; break;
        case 2: v = (v + b) & 0xff; break;
        case 3: v = (v + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
        default: break;
      }
      cur[i] = v;
    }
    prev = cur;
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * A lenient PDF object parser
 *
 * Values are tagged so a name is never confused with a string and a reference
 * is never confused with two numbers:
 *   name   { t:"name", v }
 *   str    { t:"str",  v }            (decoded text; enough for URIs/dest names)
 *   ref    { t:"ref",  n, g }
 *   dict   { t:"dict", map:{name->value} }
 *   arr    { t:"arr",  items:[...] }
 *   stream { t:"stream", dict, start, end }   (byte offsets into the buffer)
 *   number / boolean / null are native
 * ------------------------------------------------------------------ */

function parseValue(buf, s, pos) {
  pos = skipWs(s, pos);
  if (pos >= s.length) return null;
  const c = s.charCodeAt(pos);

  if (c === 0x2f) return parseName(s, pos);                 // /
  if (c === 0x28) return parseLiteralString(s, pos);        // (
  if (c === 0x3c && s.charCodeAt(pos + 1) === 0x3c)         // <<
    return parseDict(buf, s, pos);
  if (c === 0x3c) return parseHexString(s, pos);            // <
  if (c === 0x5b) return parseArray(buf, s, pos);           // [

  // keywords
  if (s.startsWith("true", pos)) return { value: true, pos: pos + 4 };
  if (s.startsWith("false", pos)) return { value: false, pos: pos + 5 };
  if (s.startsWith("null", pos)) return { value: null, pos: pos + 4 };

  // number, or an indirect reference "N G R"
  if (c === 0x2b || c === 0x2d || c === 0x2e || (c >= 0x30 && c <= 0x39)) {
    const ref = tryParseRef(s, pos);
    if (ref) return ref;
    return parseNumber(s, pos);
  }
  return null; // unknown token: caller treats as absent (lenient)
}

function skipWs(s, pos) {
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c === 0x25) { // % comment to end of line
      while (pos < s.length && s.charCodeAt(pos) !== 0x0a && s.charCodeAt(pos) !== 0x0d) pos++;
    } else if (isWhitespace(c)) {
      pos++;
    } else break;
  }
  return pos;
}

function parseName(s, pos) {
  pos++; // skip /
  let out = "";
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (isWhitespace(c) || isDelimiter(c)) break;
    if (c === 0x23 && pos + 2 < s.length) { // #xx hex escape
      const h = parseInt(s.substr(pos + 1, 2), 16);
      if (!Number.isNaN(h)) { out += String.fromCharCode(h); pos += 3; continue; }
    }
    out += s[pos];
    pos++;
  }
  return { value: { t: "name", v: out }, pos };
}

function parseNumber(s, pos) {
  const start = pos;
  if (s.charCodeAt(pos) === 0x2b || s.charCodeAt(pos) === 0x2d) pos++;
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if ((c >= 0x30 && c <= 0x39) || c === 0x2e) pos++;
    else break;
  }
  const n = parseFloat(s.slice(start, pos));
  return { value: Number.isNaN(n) ? 0 : n, pos };
}

/** "N G R" is an indirect reference; "N G obj" is an object header. Only the
 *  former is a value. Everything else beginning with a digit is a number. */
function tryParseRef(s, pos) {
  const m = /^(\d+)\s+(\d+)\s+R(?![a-zA-Z0-9])/.exec(s.slice(pos, pos + 32));
  if (!m) return null;
  return { value: { t: "ref", n: parseInt(m[1], 10), g: parseInt(m[2], 10) }, pos: pos + m[0].length };
}

function parseLiteralString(s, pos) {
  pos++; // skip (
  let out = "", depth = 1;
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c === 0x5c) { // backslash escape
      const n = s[pos + 1];
      const map = { n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" };
      if (n in map) { out += map[n]; pos += 2; continue; }
      if (n >= "0" && n <= "7") { // octal
        let oct = "";
        let p = pos + 1;
        while (p < s.length && oct.length < 3 && s[p] >= "0" && s[p] <= "7") { oct += s[p]; p++; }
        out += String.fromCharCode(parseInt(oct, 8) & 0xff);
        pos = p; continue;
      }
      pos += 2; continue; // line continuation or unknown: drop
    }
    if (c === 0x28) { depth++; out += "("; pos++; continue; }
    if (c === 0x29) { depth--; if (depth === 0) { pos++; break; } out += ")"; pos++; continue; }
    out += s[pos]; pos++;
  }
  return { value: { t: "str", v: decodePdfText(out) }, pos };
}

function parseHexString(s, pos) {
  pos++; // skip <
  let hex = "";
  while (pos < s.length && s.charCodeAt(pos) !== 0x3e) {
    const c = s[pos];
    if (/[0-9a-fA-F]/.test(c)) hex += c;
    pos++;
  }
  pos++; // skip >
  if (hex.length % 2) hex += "0";
  let raw = "";
  for (let i = 0; i < hex.length; i += 2) raw += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return { value: { t: "str", v: decodePdfText(raw) }, pos };
}

/** PDF text strings are either PDFDocEncoding (~Latin1 for our purposes) or
 *  UTF-16BE with a BOM. URIs and destination names are ASCII in practice; this
 *  handles the BOM case so a UTF-16 URI is not read as mojibake. */
function decodePdfText(raw) {
  if (raw.charCodeAt(0) === 0xfe && raw.charCodeAt(1) === 0xff) {
    let out = "";
    for (let i = 2; i + 1 < raw.length; i += 2)
      out += String.fromCharCode((raw.charCodeAt(i) << 8) | raw.charCodeAt(i + 1));
    return out;
  }
  return raw;
}

function parseArray(buf, s, pos) {
  pos++; // skip [
  const items = [];
  while (true) {
    pos = skipWs(s, pos);
    if (pos >= s.length || s.charCodeAt(pos) === 0x5d) { pos++; break; }
    const r = parseValue(buf, s, pos);
    if (!r) { pos++; continue; } // skip an unparseable token, stay lenient
    items.push(r.value);
    pos = r.pos;
  }
  return { value: { t: "arr", items }, pos };
}

function parseDict(buf, s, pos) {
  pos += 2; // skip <<
  const map = Object.create(null);
  while (true) {
    pos = skipWs(s, pos);
    if (pos >= s.length) break;
    if (s.charCodeAt(pos) === 0x3e && s.charCodeAt(pos + 1) === 0x3e) { pos += 2; break; }
    if (s.charCodeAt(pos) !== 0x2f) { pos++; continue; } // expected a key; skip junk
    const key = parseName(s, pos);
    pos = key.pos;
    const val = parseValue(buf, s, pos);
    if (!val) break;
    map[key.value.v] = val.value;
    pos = val.pos;
  }
  // A dict may be the head of a stream.
  const after = skipWs(s, pos);
  if (s.startsWith("stream", after)) {
    let p = after + 6;
    if (s.charCodeAt(p) === 0x0d) p++;
    if (s.charCodeAt(p) === 0x0a) p++;
    return { value: { t: "stream", dict: map, start: p }, pos: p, streamPending: true };
  }
  return { value: { t: "dict", map }, pos };
}

/* ------------------------------------------------------------------ *
 * Document model: objects, streams, pages
 * ------------------------------------------------------------------ */

/* EXPORTED for CPDF-12 (2026-08-08). `pdf-worker/src/pagepixels.mjs` needs the
 * SAME object/stream reader this module already has — xref-free top-level scan,
 * /ObjStm folding, page ordering, raw and Flate-decoded stream bytes. Writing a
 * second one in the fleet member is the D-164 lesson repeated (two mechanisms
 * for one job is how the next one goes stale in silence), so the class is
 * exported rather than copied. This is ADDITIVE and changes no behaviour: not
 * one line of logic here moved, and `extractPdfStructure` is untouched. */
export class PdfDoc {
  constructor(bytes) {
    this.bytes = bytes;
    this.s = LATIN1.decode(bytes);
    this.objects = new Map();      // num -> value
    this.pageIndexByObj = new Map(); // page object num -> 0-based index
    this.pageCount = 0;
    this.root = null;
    this.notes = [];
  }

  note(msg) { this.notes.push(msg); }

  /** Scan every top-level `N G obj` in the file. Later definitions win, which
   *  matches incremental-update semantics without parsing any xref. */
  scanTopLevel() {
    const s = this.s;
    const re = /(\d+)\s+(\d+)\s+obj\b/g;
    let m;
    while ((m = re.exec(s))) {
      const num = parseInt(m[1], 10);
      const bodyStart = m.index + m[0].length;
      const r = parseValueSafe(s, bodyStart);
      if (r) this.objects.set(num, r.value);
    }
  }

  resolve(v, seen = 0) {
    while (v && v.t === "ref" && seen < 64) {
      v = this.objects.get(v.n);
      seen++;
    }
    return v ?? null;
  }

  dictOf(v) {
    v = this.resolve(v);
    if (!v) return null;
    if (v.t === "dict") return v.map;
    if (v.t === "stream") return v.dict;
    return null;
  }

  /** Extract a stream's raw (still-compressed) bytes. /Length is used when it
   *  resolves to an integer; otherwise we scan to the next `endstream`, which
   *  is the lenient recovery path. */
  streamRawBytes(streamObj) {
    if (!streamObj || streamObj.t !== "stream") return null;
    const start = streamObj.start;
    let end;
    const len = this.resolve(streamObj.dict.Length);
    if (typeof len === "number" && len >= 0 && start + len <= this.bytes.length) {
      end = start + len;
      // sanity: endstream should be at/after end
      const tail = this.s.indexOf("endstream", end - 2);
      if (tail === -1 || tail > end + 4) end = this._scanEndstream(start);
    } else {
      end = this._scanEndstream(start);
    }
    if (end == null || end < start) return null;
    return this.bytes.subarray(start, end);
  }

  _scanEndstream(start) {
    const idx = this.s.indexOf("endstream", start);
    if (idx === -1) return null;
    let e = idx;
    // trailing EOL before endstream is not part of the data
    if (this.s.charCodeAt(e - 1) === 0x0a) e--;
    if (this.s.charCodeAt(e - 1) === 0x0d) e--;
    return e;
  }

  /** Decompress a stream's bytes if its filter chain is (Flate). Returns null
   *  for anything else, which the callers treat as "cannot resolve" -> the doc
   *  degrades to undetermined rather than crashing. */
  async streamDecoded(streamObj) {
    const raw = this.streamRawBytes(streamObj);
    if (!raw) return null;
    const filter = this.resolve(streamObj.dict.Filter);
    const names = !filter ? [] :
      filter.t === "name" ? [filter.v] :
      filter.t === "arr" ? filter.items.map((f) => (f && f.t === "name" ? f.v : null)) : [];
    if (names.length === 0) return raw; // unfiltered
    if (!names.every((n) => n === "FlateDecode" || n === "Fl")) return null; // not our phase-1 job
    let data = await inflate(raw);
    if (!data) return null;
    // Optional PNG predictor via /DecodeParms.
    let parms = this.resolve(streamObj.dict.DecodeParms) || this.resolve(streamObj.dict.DP);
    if (parms && parms.t === "arr") parms = this.resolve(parms.items[parms.items.length - 1]);
    if (parms && parms.t === "dict") {
      const num = (x) => (typeof (x = this.resolve(x)) === "number" ? x : undefined);
      const predictor = num(parms.map.Predictor);
      if (predictor && predictor >= 2) {
        data = unpredict(data, {
          predictor,
          colors: num(parms.map.Colors) ?? 1,
          columns: num(parms.map.Columns) ?? 1,
          bpc: num(parms.map.BitsPerComponent) ?? 8,
        });
      }
    }
    return data;
  }

  /** Parse every /ObjStm and fold its contained objects into the map, so an
   *  xref-stream PDF that keeps its page/annot dicts compressed is not empty.
   *  Objects already defined at top level are NOT overwritten (top-level and
   *  compressed definitions of one number should not coexist; if they do, the
   *  uncompressed one is the safer read). */
  async loadObjectStreams() {
    const streams = [];
    for (const v of this.objects.values()) {
      if (v && v.t === "stream") {
        const type = v.dict.Type;
        if (type && type.t === "name" && type.v === "ObjStm") streams.push(v);
      }
    }
    for (const st of streams) {
      const data = await this.streamDecoded(st);
      if (!data) { this.note("objstm_undecodable"); continue; }
      const inner = LATIN1.decode(data);
      const n = numberVal(this.resolve(st.dict.N));
      const first = numberVal(this.resolve(st.dict.First));
      if (n == null || first == null) continue;
      // header: N pairs of "objNum offset"
      const header = inner.slice(0, first).trim().split(/\s+/).map(Number);
      for (let i = 0; i < n; i++) {
        const objNum = header[i * 2];
        const off = header[i * 2 + 1];
        if (!Number.isFinite(objNum) || !Number.isFinite(off)) continue;
        if (this.objects.has(objNum)) continue;
        const r = parseValue(null, inner, first + off);
        if (r) this.objects.set(objNum, r.value);
      }
    }
  }

  /** Locate the catalog and order the pages. Falls back to every /Type /Page in
   *  object-number order if the tree cannot be walked (leniency). */
  buildPageIndex() {
    let root = null;
    for (const v of this.objects.values()) {
      const map = v && v.t === "dict" ? v.map : null;
      if (map && map.Type && map.Type.t === "name" && map.Type.v === "Catalog") { root = map; break; }
    }
    this.root = root;
    const walkRef = (num, seen) => {
      const map = this.dictOf({ t: "ref", n: num });
      if (!map) return;
      const type = map.Type;
      if (type && type.t === "name" && type.v === "Page") { this._registerPage(num); return; }
      const kids = this.resolve(map.Kids);
      if (kids && kids.t === "arr") {
        for (const kid of kids.items) {
          if (kid && kid.t === "ref" && !seen.has(kid.n)) { seen.add(kid.n); walkRef(kid.n, seen); }
        }
      }
    };

    if (root && root.Pages && root.Pages.t === "ref") {
      walkRef(root.Pages.n, new Set([root.Pages.n]));
    }
    if (this.pageIndexByObj.size === 0) {
      // Fallback: every /Type /Page, by object number.
      const pages = [];
      for (const [num, v] of this.objects) {
        const map = v && (v.t === "dict" ? v.map : v.t === "stream" ? v.dict : null);
        if (map && map.Type && map.Type.t === "name" && map.Type.v === "Page") pages.push(num);
      }
      pages.sort((a, b) => a - b);
      pages.forEach((num, i) => this.pageIndexByObj.set(num, i));
      this.pageCount = pages.length;
      this._pageOrder = pages;
      if (pages.length) this.note("page_order_by_object_number_fallback");
    }
  }

  _registerPage(num) {
    if (this.pageIndexByObj.has(num)) return;
    const idx = this.pageIndexByObj.size;
    this.pageIndexByObj.set(num, idx);
    this.pageCount = this.pageIndexByObj.size;
    (this._pageOrder ||= []).push(num);
  }

  /** Is this an encrypted document? Detected from the Standard Security Handler
   *  dictionary (/Filter /Standard with a revision /R) — which is itself NEVER
   *  encrypted, so this is readable "from the trailer without decrypting
   *  anything" (CPDF-5). Tier 1 has no decryption: strings and streams are
   *  ciphertext, so content streams inflate to garbage and text decode yields
   *  nothing. Rather than degrade to a swarm of undifferentiated
   *  `content_stream_undecodable` notes (the CPDF-5 gap: the failure was silent
   *  as to CAUSE though /Encrypt is right there), we NAME it — a single
   *  `reason:"encrypted"` marker — so the record says WHY and the plane can route
   *  straight to the pdf-worker (I6), whose pdf.js decrypts a permission-only
   *  (empty-user-password) PDF transparently. Cached; call after scanTopLevel. */
  isEncrypted() {
    if (this._encrypted !== undefined) return this._encrypted;
    let enc = false;
    for (const v of this.objects.values()) {
      const map = v && (v.t === "dict" ? v.map : v.t === "stream" ? v.dict : null);
      if (!map) continue;
      const filter = map.Filter;
      const isStandard = filter && filter.t === "name" && filter.v === "Standard";
      const hasRevision = map.R != null && typeof this.resolve(map.R) === "number";
      // /V and /R live only on the encryption dict; a page's /Filter is a codec
      // name array, never the bare name "Standard" with a numeric /R beside it.
      if (isStandard && hasRevision) { enc = true; break; }
    }
    return (this._encrypted = enc);
  }
}

function numberVal(v) {
  return typeof v === "number" ? v : null;
}
/** A defensive re-parse entry point kept separate so scanTopLevel stays simple. */
function parseValueSafe(s, pos) {
  try { return parseValue(null, s, pos); } catch { return null; }
}

/* ------------------------------------------------------------------ *
 * Link classification — the PDF analog of subresources.mjs's partitions
 * ------------------------------------------------------------------ */

/** http/https are addresses the record may hold a capture of elsewhere:
 *  deferred, resolved to linked-or-offsite at read time (exactly as HTML).
 *  Everything else a Link action can carry — mailto, javascript, tel, file — is
 *  not an address this system will carry: refused. */
function classifyUri(uri) {
  const m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(uri || "");
  const scheme = m ? m[1].toLowerCase() : null;
  if (scheme === "http" || scheme === "https") return "deferred";
  // A bare relative reference with no scheme is still a web address in intent;
  // treat as deferred so it can be resolved against the record, never invented.
  if (!scheme && uri) return "deferred";
  return "refused";
}

function rectOf(doc, map) {
  const r = doc.resolve(map.Rect);
  if (r && r.t === "arr" && r.items.length === 4) {
    const nums = r.items.map((x) => doc.resolve(x));
    if (nums.every((n) => typeof n === "number")) return nums;
  }
  return null;
}

/** Resolve a destination to a 0-based target page index. A destination is
 *  either an explicit array whose first element is a page (ref or, for remote
 *  go-to, an integer), or a name/string into the /Dests name tree or dict. */
function resolveDestination(doc, dest) {
  dest = doc.resolve(dest);
  if (!dest) return { ok: false, why: "dest_absent" };

  // A named destination: look it up first.
  if (dest.t === "name" || dest.t === "str") {
    const name = dest.v;
    const found = lookupNamedDest(doc, name);
    if (!found) return { ok: false, why: "named_dest_unresolved", dest: name };
    return resolveDestination(doc, found);
  }

  if (dest.t === "arr") {
    const first = dest.items[0];
    if (first && first.t === "ref") {
      if (doc.pageIndexByObj.has(first.n))
        return { ok: true, page: doc.pageIndexByObj.get(first.n) };
      return { ok: false, why: "dest_page_not_in_tree" };
    }
    if (typeof first === "number") {
      // Remote/embedded go-to page number, 0-based already.
      if (first >= 0 && first < doc.pageCount) return { ok: true, page: first };
      return { ok: false, why: "dest_page_out_of_range" };
    }
    return { ok: false, why: "dest_first_not_page" };
  }
  return { ok: false, why: "dest_shape_unknown" };
}

/** Look a name up in /Root /Dests (a plain name->dest dict, PDF 1.1) or
 *  /Root /Names /Dests (a name tree, PDF 1.2+). Returns the dest value or null. */
function lookupNamedDest(doc, name) {
  const root = doc.root;
  if (!root) return null;
  // Old style: /Dests dict on the catalog.
  const dests = doc.dictOf(root.Dests);
  if (dests && name in dests) return unwrapDest(doc, dests[name]);
  // New style: /Names /Dests name tree.
  const names = doc.dictOf(root.Names);
  if (names) {
    const tree = doc.resolve(names.Dests);
    const hit = searchNameTree(doc, tree, name);
    if (hit) return unwrapDest(doc, hit);
  }
  return null;
}

/** A named dest value is often a dict { /D [...] } rather than the array. */
function unwrapDest(doc, v) {
  const d = doc.dictOf(v);
  if (d && d.D) return d.D;
  return v;
}

function searchNameTree(doc, node, name, depth = 0) {
  node = doc.resolve(node);
  const map = node && node.t === "dict" ? node.map : null;
  if (!map || depth > 64) return null;
  const names = doc.resolve(map.Names);
  if (names && names.t === "arr") {
    for (let i = 0; i + 1 < names.items.length; i += 2) {
      const key = doc.resolve(names.items[i]);
      if (key && key.t === "str" && key.v === name) return names.items[i + 1];
    }
  }
  const kids = doc.resolve(map.Kids);
  if (kids && kids.t === "arr") {
    for (const kid of kids.items) {
      // Could honour /Limits to prune; a linear descent is fine at our sizes.
      const hit = searchNameTree(doc, kid, name, depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Embedded / attached files -> intra
 * ------------------------------------------------------------------ */

const HEX = "0123456789abcdef";
function toHex(u8) {
  let out = "";
  for (let i = 0; i < u8.length; i++) out += HEX[u8[i] >> 4] + HEX[u8[i] & 15];
  return out;
}
async function sha256Hex(u8) {
  const d = await crypto.subtle.digest("SHA-256", u8);
  return toHex(new Uint8Array(d));
}

/** An embedded file's bytes are content-addressed exactly as a bundle
 *  companion is, so an embedded file that we can resolve to bytes is `intra`
 *  under the same wrapper. If the stream cannot be decoded this phase, it is
 *  undetermined — recorded, never invented. */
async function embeddedFileRecord(doc, filespec, sourcePage, rect, name) {
  const fs = doc.dictOf(filespec);
  if (!fs) return undeterminedRecord({ page: sourcePage, rect }, "embedded_filespec_unresolved", { name });
  const ef = doc.dictOf(fs.EF);
  const streamRef = ef && (ef.F || ef.UF || ef.DOS || ef.Mac || ef.Unix);
  const stream = doc.resolve(streamRef);
  const label = name || strOf(doc, fs.UF) || strOf(doc, fs.F) || null;
  if (!stream || stream.t !== "stream")
    return undeterminedRecord({ page: sourcePage, rect }, "embedded_stream_absent", { name: label });
  const bytes = await doc.streamDecoded(stream);
  if (!bytes)
    return undeterminedRecord({ page: sourcePage, rect }, "embedded_stream_undecodable", { name: label });
  const sha = await sha256Hex(bytes);
  return {
    partition: "intra",
    wrapper: linkWrapper.intra(sha),
    target: { sha256: sha, name: label, bytes: bytes.length },
    source: sourcePage == null ? null : { page: sourcePage, rect: rect || null },
  };
}

function strOf(doc, v) {
  v = doc.resolve(v);
  return v && v.t === "str" ? v.v : null;
}

/* ------------------------------------------------------------------ *
 * Record builders
 * ------------------------------------------------------------------ */

function deferredOrRefusedRecord(uri, source) {
  const partition = classifyUri(uri);
  return {
    partition,
    wrapper: partition === "deferred" ? linkWrapper.deferred(uri) : linkWrapper.refused(uri),
    target: { url: uri },
    source,
  };
}

function anchorRecord(doc, targetPage, source, destName) {
  const fragment = `#page=${targetPage + 1}`; // 1-based, PDF open-parameter form
  return {
    partition: "anchor",
    wrapper: linkWrapper.anchor(fragment),
    target: { page: targetPage, fragment, dest: destName ?? null },
    source,
  };
}

function undeterminedRecord(source, why, extra = {}) {
  return { partition: "undetermined", wrapper: null, target: { why, ...extra }, source };
}

/* ================================================================== *
 * Tier 1 text extraction (QUEUE CPDF-4)
 *
 * The prose half, pure JS: read the text-showing operators out of each page's
 * content stream(s) and decode the shown bytes through the font's /ToUnicode
 * CMap. Nothing here guesses. A byte a font's /ToUnicode does not cover, or a
 * font that carries no /ToUnicode at all, produces an `undetermined` marker
 * naming the font — never a substituted or best-effort character.
 * ================================================================== */

/* ---- content-stream lexer (a postfix grammar, unlike the object grammar) ---- *
 * Tokens: { t:"str", bytes:[…0-255] } (raw shown bytes — NOT decoded as text,
 * because the bytes ARE the character codes the font maps), { t:"num", v },
 * { t:"name", v }, { t:"op", v }, and the array/dict delimiters. */
function tokenizeContent(s) {
  const toks = [];
  let i = 0;
  const n = s.length;
  while (i < n) {
    const c = s.charCodeAt(i);
    if (isWhitespace(c)) { i++; continue; }
    if (c === 0x25) { // % comment to EOL
      while (i < n && s.charCodeAt(i) !== 0x0a && s.charCodeAt(i) !== 0x0d) i++;
      continue;
    }
    if (c === 0x28) { const r = readLiteralBytes(s, i); toks.push({ t: "str", bytes: r.bytes }); i = r.pos; continue; }
    if (c === 0x3c) {
      if (s.charCodeAt(i + 1) === 0x3c) { toks.push({ t: "dict_open" }); i += 2; continue; }
      const r = readHexBytes(s, i); toks.push({ t: "str", bytes: r.bytes }); i = r.pos; continue;
    }
    if (c === 0x3e && s.charCodeAt(i + 1) === 0x3e) { toks.push({ t: "dict_close" }); i += 2; continue; }
    if (c === 0x5b) { toks.push({ t: "arr_open" }); i++; continue; }
    if (c === 0x5d) { toks.push({ t: "arr_close" }); i++; continue; }
    if (c === 0x2f) { const r = readContentName(s, i); toks.push({ t: "name", v: r.v }); i = r.pos; continue; }
    if (c === 0x2b || c === 0x2d || c === 0x2e || (c >= 0x30 && c <= 0x39)) {
      const r = readContentNumber(s, i); toks.push({ t: "num", v: r.v }); i = r.pos; continue;
    }
    // an operator: a run of regular characters (letters, and ' " * which are ops)
    const start = i;
    while (i < n) {
      const cc = s.charCodeAt(i);
      if (isWhitespace(cc) || isDelimiter(cc)) break;
      i++;
    }
    if (i > start) toks.push({ t: "op", v: s.slice(start, i) });
    else i++; // never stall
  }
  return toks;
}

/** Read a literal ( … ) string as RAW BYTES (0-255), honouring PDF escapes and
 *  nested parens. Unlike parseLiteralString this does not decode to text — the
 *  bytes are the codes the font maps. */
function readLiteralBytes(s, pos) {
  pos++; // (
  const bytes = [];
  let depth = 1;
  const simple = { 110: 0x0a, 114: 0x0d, 116: 0x09, 98: 0x08, 102: 0x0c, 40: 0x28, 41: 0x29, 92: 0x5c };
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c === 0x5c) { // backslash
      const nc = s.charCodeAt(pos + 1);
      if (nc in simple) { bytes.push(simple[nc]); pos += 2; continue; }
      if (nc >= 0x30 && nc <= 0x37) { // octal, up to 3 digits
        let oct = "", p = pos + 1;
        while (p < s.length && oct.length < 3 && s.charCodeAt(p) >= 0x30 && s.charCodeAt(p) <= 0x37) { oct += s[p]; p++; }
        bytes.push(parseInt(oct, 8) & 0xff); pos = p; continue;
      }
      if (nc === 0x0a) { pos += 2; continue; }                       // line continuation
      if (nc === 0x0d) { pos += s.charCodeAt(pos + 2) === 0x0a ? 3 : 2; continue; }
      bytes.push(nc); pos += 2; continue;                            // unknown escape: literal next
    }
    if (c === 0x28) { depth++; bytes.push(0x28); pos++; continue; }
    if (c === 0x29) { depth--; if (depth === 0) { pos++; break; } bytes.push(0x29); pos++; continue; }
    bytes.push(c); pos++;
  }
  return { bytes, pos };
}

/** Read a < … > hex string as raw bytes. */
function readHexBytes(s, pos) {
  pos++; // <
  let hex = "";
  while (pos < s.length && s.charCodeAt(pos) !== 0x3e) {
    const ch = s[pos];
    if (/[0-9a-fA-F]/.test(ch)) hex += ch;
    pos++;
  }
  pos++; // >
  if (hex.length % 2) hex += "0";
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
  return { bytes, pos };
}

function readContentName(s, pos) {
  pos++; // /
  let out = "";
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (isWhitespace(c) || isDelimiter(c)) break;
    if (c === 0x23 && pos + 2 < s.length) {
      const h = parseInt(s.substr(pos + 1, 2), 16);
      if (!Number.isNaN(h)) { out += String.fromCharCode(h); pos += 3; continue; }
    }
    out += s[pos]; pos++;
  }
  return { v: out, pos };
}

function readContentNumber(s, pos) {
  const start = pos;
  if (s.charCodeAt(pos) === 0x2b || s.charCodeAt(pos) === 0x2d) pos++;
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if ((c >= 0x30 && c <= 0x39) || c === 0x2e) pos++;
    else break;
  }
  const v = parseFloat(s.slice(start, pos));
  return { v: Number.isNaN(v) ? 0 : v, pos };
}

/* ---- /ToUnicode CMap parsing ---- *
 * A CMap maps a character CODE (1+ bytes) to a Unicode string. We need only the
 * bfchar/bfrange sections (and the codespacerange, which tells us how many bytes
 * a code is). Everything else in the CMap is PostScript we ignore. */

/** Interpret a hex run as UTF-16BE code units → a JS string. ToUnicode targets
 *  are UTF-16BE; a single-byte target (2 hex) is treated as one code point. */
function hexToUnicode(hex) {
  if (hex.length <= 2) return String.fromCharCode(parseInt(hex || "0", 16));
  let out = "";
  for (let i = 0; i + 4 <= hex.length; i += 4) out += String.fromCharCode(parseInt(hex.substr(i, 4), 16));
  if (hex.length % 4 === 2) out += String.fromCharCode(parseInt(hex.substr(hex.length - 2, 2), 16));
  return out;
}

/** Increment the LAST 16-bit unit of a UTF-16BE hex target by `off` — the
 *  bfrange incrementing form: <lo> <hi> <dst> maps lo→dst, lo+1→dst+1, … */
function unicodeIncr(hex, off) {
  const units = [];
  for (let i = 0; i + 4 <= hex.length; i += 4) units.push(parseInt(hex.substr(i, 4), 16));
  if (units.length === 0) return String.fromCharCode((parseInt(hex || "0", 16) + off) & 0xffff);
  units[units.length - 1] = (units[units.length - 1] + off) & 0xffff;
  return units.map((u) => String.fromCharCode(u)).join("");
}

function parseToUnicodeCMap(text) {
  const map = new Map();
  let width = null;

  const csr = /begincodespacerange([\s\S]*?)endcodespacerange/.exec(text);
  if (csr) {
    const first = /<([0-9a-fA-F]+)>/.exec(csr[1]);
    if (first) width = Math.max(1, Math.round(first[1].length / 2));
  }

  for (const m of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    const toks = m[1].match(/<([0-9a-fA-F]*)>/g) || [];
    for (let i = 0; i + 1 < toks.length; i += 2) {
      const src = toks[i].replace(/[<>]/g, "");
      const dst = toks[i + 1].replace(/[<>]/g, "");
      if (!src) continue;
      map.set(parseInt(src, 16), hexToUnicode(dst));
      if (width == null) width = Math.max(1, Math.round(src.length / 2));
    }
  }

  for (const m of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    parseBfrange(m[1], map, (w) => { if (width == null) width = w; });
  }

  return { map, width: width ?? 1 };
}

/** bfrange has two target forms: an incrementing hex target, and an explicit
 *  [ <..> <..> … ] array (one target per code in the range). Tokenise the block
 *  into hex atoms and arrays, then consume triples. */
function parseBfrange(blk, map, seenWidth) {
  const tokens = [];
  let i = 0;
  while (i < blk.length) {
    const c = blk[i];
    if (c === "<") {
      const j = blk.indexOf(">", i);
      if (j === -1) break;
      tokens.push({ t: "hex", v: blk.slice(i + 1, j).replace(/[^0-9a-fA-F]/g, "") });
      i = j + 1;
    } else if (c === "[") {
      const j = blk.indexOf("]", i);
      if (j === -1) break;
      const arr = (blk.slice(i + 1, j).match(/<([0-9a-fA-F]*)>/g) || []).map((h) => h.replace(/[<>]/g, ""));
      tokens.push({ t: "arr", v: arr });
      i = j + 1;
    } else i++;
  }
  for (let k = 0; k + 2 < tokens.length; k += 3) {
    const lo = tokens[k], hi = tokens[k + 1], dst = tokens[k + 2];
    if (lo.t !== "hex" || hi.t !== "hex") { k -= 2; k += 1; continue; }
    const loN = parseInt(lo.v, 16), hiN = parseInt(hi.v, 16);
    seenWidth(Math.max(1, Math.round(lo.v.length / 2)));
    if (dst.t === "arr") {
      for (let code = loN, idx = 0; code <= hiN && idx < dst.v.length; code++, idx++) map.set(code, hexToUnicode(dst.v[idx]));
    } else {
      for (let code = loN, off = 0; code <= hiN && off <= hiN - loN; code++, off++) map.set(code, unicodeIncr(dst.v, off));
    }
  }
}

/* ---- fonts ---- */

function nameOf(doc, v) {
  v = doc.resolve(v);
  return v && v.t === "name" ? v.v : null;
}

/** Load a font's decoding info: its /ToUnicode map (or null), the code width in
 *  bytes, whether it is a composite (Type0/CID) font, and a name to report when
 *  something cannot be decoded. */
async function loadFont(doc, fontVal) {
  const map = doc.dictOf(fontVal);
  if (!map) return null;
  const subtype = nameOf(doc, map.Subtype);
  const isType0 = subtype === "Type0";
  let baseFont = nameOf(doc, map.BaseFont);
  if (!baseFont && isType0) {
    // A Type0's descendant CIDFont may carry the BaseFont.
    const desc = doc.resolve(map.DescendantFonts);
    if (desc && desc.t === "arr" && desc.items.length) baseFont = nameOf(doc, doc.dictOf(desc.items[0])?.BaseFont);
  }
  let toUni = null, width = null;
  const tu = doc.resolve(map.ToUnicode);
  if (tu && tu.t === "stream") {
    const data = await doc.streamDecoded(tu);
    if (data) {
      const parsed = parseToUnicodeCMap(LATIN1.decode(data));
      if (parsed.map.size) { toUni = parsed.map; width = parsed.width; }
    }
  }
  if (width == null) width = isType0 ? 2 : 1; // composite codes are ≥2 bytes in practice; simple fonts are 1
  return { subtype, isType0, baseFont, toUni, width };
}

/* ---- the per-page text interpreter ---- */

const HEX_CAP = 64; // cap the bytes echoed into an undetermined marker

function bytesToHex(bytes, cap = HEX_CAP) {
  const n = Math.min(bytes.length, cap);
  let out = "";
  for (let i = 0; i < n; i++) out += HEX[bytes[i] >> 4] + HEX[bytes[i] & 15];
  if (bytes.length > cap) out += "…";
  return out;
}

function bytesToCodes(bytes, width) {
  const codes = [];
  const w = Math.max(1, width);
  for (let i = 0; i + w <= bytes.length; i += w) {
    let code = 0;
    for (let k = 0; k < w; k++) code = (code << 8) | bytes[i + k];
    codes.push(code);
  }
  return { codes, leftover: bytes.length % w };
}

/** Walk one page's Resources up the page tree — Resources is an inheritable
 *  attribute, so a page that omits it uses its /Pages parent's. */
function pageResources(doc, pageMap) {
  let map = pageMap, seen = 0;
  while (map && seen < 64) {
    const res = doc.dictOf(map.Resources);
    if (res) return res;
    const parent = doc.resolve(map.Parent);
    map = parent && parent.t === "dict" ? parent.map : null;
    seen++;
  }
  return null;
}

/** Concatenate a page's content stream(s) into one decoded latin1 string. */
async function pageContent(doc, pageMap) {
  const c = doc.resolve(pageMap.Contents);
  if (!c) return "";
  const streams = c.t === "arr" ? c.items.map((x) => doc.resolve(x)) : [c];
  const parts = [];
  for (const st of streams) {
    if (st && st.t === "stream") {
      const data = await doc.streamDecoded(st);
      if (data) parts.push(LATIN1.decode(data));
      else doc.note("content_stream_undecodable");
    }
  }
  return parts.join("\n");
}

/** Extract Tier 1 text from one page. Returns { text, undetermined:[markers] }.
 *  `fontCache` is keyed by font object so a font shared across pages is parsed
 *  once. Every undecodable region is recorded, never rendered. */
async function extractPageText(doc, pageIdx, pageMap, fontCache) {
  const resources = pageResources(doc, pageMap);
  const fontDict = resources ? doc.dictOf(resources.Font) : null;
  const content = await pageContent(doc, pageMap);
  const toks = tokenizeContent(content);

  const pieces = [];
  const undetermined = [];
  let curFont = null;      // font info, or null
  let curFontName = null;  // the resource name last selected by Tf
  const stack = [];

  const getFont = async (name) => {
    if (!fontDict || !(name in fontDict)) return null;
    const ref = fontDict[name];
    const key = ref && ref.t === "ref" ? "r" + ref.n : "n" + name;
    if (fontCache.has(key)) return fontCache.get(key);
    const f = await loadFont(doc, ref);
    fontCache.set(key, f);
    return f;
  };

  const show = (bytes) => {
    if (!bytes || bytes.length === 0) return;
    if (!curFont) {
      undetermined.push({
        page: pageIdx,
        reason: curFontName ? "font_not_in_resources" : "no_current_font",
        font: curFontName ?? null,
        codes: bytesToHex(bytes),
        count: bytes.length,
      });
      return;
    }
    if (!curFont.toUni) {
      undetermined.push({
        page: pageIdx,
        reason: curFont.isType0 ? "cid_font_no_tounicode" : "no_tounicode",
        font: curFont.baseFont ?? curFontName ?? null,
        codes: bytesToHex(bytes),
        count: Math.ceil(bytes.length / (curFont.width || 1)),
      });
      return;
    }
    const { codes, leftover } = bytesToCodes(bytes, curFont.width);
    for (const code of codes) {
      const u = curFont.toUni.get(code);
      if (u == null) {
        undetermined.push({
          page: pageIdx,
          reason: "unmapped_code",
          font: curFont.baseFont ?? curFontName ?? null,
          codes: code.toString(16).padStart((curFont.width || 1) * 2, "0"),
          count: 1,
        });
      } else pieces.push(u);
    }
    if (leftover) {
      undetermined.push({
        page: pageIdx,
        reason: "code_width_misaligned",
        font: curFont.baseFont ?? curFontName ?? null,
        codes: bytesToHex(bytes.slice(bytes.length - leftover)),
        count: leftover,
      });
    }
  };

  const lastOfType = (type) => {
    for (let i = stack.length - 1; i >= 0; i--) if (stack[i].t === type) return stack[i];
    return null;
  };

  for (const tk of toks) {
    if (tk.t !== "op") { stack.push(tk); continue; }
    switch (tk.v) {
      case "Tf": {
        const nameTok = lastOfType("name");
        curFontName = nameTok ? nameTok.v : null;
        curFont = curFontName ? await getFont(curFontName) : null;
        break;
      }
      case "Tj": {
        const st = lastOfType("str");
        if (st) show(st.bytes);
        break;
      }
      case "TJ": {
        let inArr = false;
        for (const it of stack) {
          if (it.t === "arr_open") { inArr = true; continue; }
          if (it.t === "arr_close") { inArr = false; continue; }
          if (!inArr) continue;
          if (it.t === "str") show(it.bytes);
          else if (it.t === "num" && it.v < -100) pieces.push(" "); // a large negative advance is a word gap
        }
        break;
      }
      case "'":
      case '"': {
        // ' : next line then show;  " : aw ac (string) — next line then show
        pieces.push("\n");
        const st = lastOfType("str");
        if (st) show(st.bytes);
        break;
      }
      case "Td": case "TD": case "Tm": case "T*":
        pieces.push("\n"); // a new text line
        break;
      default:
        break;
    }
    stack.length = 0; // operands are consumed by their operator
  }

  let text = pieces.join("").replace(/\n{2,}/g, "\n").replace(/^\n+|\n+$/g, "");

  /* CPDF-10 — TIER 1 NAMES THE IMAGE-ONLY PAGE, and this exists because the
   * escalation that was supposed to name it CANNOT FIRE.
   *
   * MEASURED, not assumed. `needsTier2` escalates when undetermined REGIONS
   * outnumber decoded CHARACTERS. A scanned page decodes to zero characters
   * and produces zero markers — there is no font, so nothing ever reaches the
   * decode path to fail — so the test is `0 > 0`, which is FALSE. **The
   * image-only class, which is the entire reason OCR exists, was the one class
   * that never escalated.** Tier 2's `no_text_layer` marker is real and is what
   * `needsTier3` reads, and before this line nothing could ever produce it for
   * a scan, because pdf.js was never asked.
   *
   * THE SIGNAL IS STRUCTURAL, WHICH IS WHY IT IS TRUSTWORTHY. CPDF-9 verified
   * its scanned exhibit as image-only by the file's own structure — 4 pages, 0
   * fonts — rather than by how little text came out. A page that declares NO
   * font resource cannot bear text: that is a fact about the file, not a
   * threshold on an output, and it does not go stale the way a character count
   * would.
   *
   * AND A BLANK PAGE IS NOT A SCAN. Zero fonts alone would mark every empty
   * page as wanting OCR, which would send an engine over a blank sheet and
   * invite exactly the invention CPDF-9's own negative control exists to catch.
   * So the second half is required: the page must DRAW AN IMAGE. Zero fonts and
   * zero images is a blank page and this says NOTHING about it — an absence
   * with nothing to report is not a finding, and inventing a marker for it
   * would put a swarm of them through every document with a separator sheet.
   *
   * `no_text_layer` is I2's EXISTING vocabulary (the Tier-2 reason), used here
   * by a different tier rather than minted afresh — a second spelling for one
   * finding is D-164's lesson and this item is not going to repeat it. */
  if (!text.length && !undetermined.length && !fontDict && pageDrawsImage(doc, resources)) {
    undetermined.push({
      page: pageIdx, reason: "no_text_layer", font: null, codes: "", count: 0,
    });
  }
  return { text, undetermined };
}

/** Does this page's resource dictionary declare an image XObject? The second
 *  half of the image-only test above. Deliberately asks about DECLARED
 *  resources rather than interpreting the content stream: a page that lists an
 *  image and never paints it is vanishingly rare, while re-walking the content
 *  stream to find a `Do` would be a second interpreter for one boolean. */
function pageDrawsImage(doc, resources) {
  const xo = resources ? doc.dictOf(resources.XObject) : null;
  if (!xo) return false;
  for (const name of Object.keys(xo)) {
    const map = doc.dictOf(xo[name]);
    if (map && nameOf(doc, map.Subtype) === "Image") return true;
  }
  return false;
}

/** Document text (Tier 1). Extends the I2 output; see the module header. */
async function extractText(doc, pageOrder) {
  // Encrypted: Tier 1 cannot decode ciphertext content streams, so it decodes
  // NOTHING. Say so with ONE document-level marker naming the cause, rather than
  // attempting every page and emitting a swarm of undecodable notes (CPDF-5).
  // The plane escalates on this to the pdf-worker (I6), which decrypts it.
  if (doc.isEncrypted()) {
    doc.note("encrypted");
    const marker = { page: null, reason: "encrypted", font: null, codes: "", count: 0 };
    return { document: "", pages: [], undetermined: [marker], counts: { chars: 0, undetermined: 1 } };
  }
  const fontCache = new Map();
  const pages = [];
  const allUndetermined = [];
  for (let idx = 0; idx < pageOrder.length; idx++) {
    const pageMap = doc.dictOf({ t: "ref", n: pageOrder[idx] });
    if (!pageMap) { pages.push({ page: idx, text: "", undetermined: [] }); continue; }
    let res;
    try {
      res = await extractPageText(doc, idx, pageMap, fontCache);
    } catch {
      doc.note("text_extraction_error");
      res = { text: "", undetermined: [{ page: idx, reason: "text_extraction_error", font: null, codes: "", count: 0 }] };
    }
    pages.push({ page: idx, text: res.text, undetermined: res.undetermined });
    for (const u of res.undetermined) allUndetermined.push(u);
  }
  const document = pages.map((p) => p.text).filter((t) => t.length).join("\n");
  return {
    document,
    pages,
    undetermined: allUndetermined,
    counts: { chars: document.length, undetermined: allUndetermined.length },
  };
}

/* ------------------------------------------------------------------ *
 * The public entry point
 * ------------------------------------------------------------------ */

/**
 * Extract the outbound-link structure of a PDF.
 *
 * @param {Uint8Array} bytes  assembled PDF bytes (I1: read via op=capture)
 * @returns {Promise<object>} the container-agnostic structure object; see the
 *          module header and the returned `container`/`links` shape. Carries a
 *          `text` field (Tier 1, CPDF-4): { document, pages:[{page,text,
 *          undetermined:[…]}], undetermined:[…], counts:{chars,undetermined} },
 *          where each undetermined marker names the cause (the font) rather than
 *          guessing an undecodable run into text. This is the producer side of
 *          the proposed I2 (structure -> framework).
 */
export async function extractPdfStructure(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    return { ok: false, container: "pdf", reason: "NOT_BYTES" };
  }
  const header = LATIN1.decode(bytes.subarray(0, 1024));
  const sig = /%PDF-(\d+\.\d+)/.exec(header);
  if (!sig) {
    return { ok: false, container: "pdf", reason: "NOT_A_PDF" };
  }

  const doc = new PdfDoc(bytes);
  doc.scanTopLevel();
  await doc.loadObjectStreams();
  // Tag page dicts with their own object number so tree-walk fallbacks work.
  for (const [num, v] of doc.objects) {
    if (v && v.t === "dict") v.map.__objnum = { t: "ref", n: num };
  }
  doc.buildPageIndex();

  const links = [];
  const pageOrder = doc._pageOrder || [];

  for (let pageIdx = 0; pageIdx < pageOrder.length; pageIdx++) {
    const pageNum = pageOrder[pageIdx];
    const page = doc.dictOf({ t: "ref", n: pageNum });
    if (!page) continue;
    const annots = doc.resolve(page.Annots);
    if (!annots || annots.t !== "arr") continue;

    for (const annotRef of annots.items) {
      const map = doc.dictOf(annotRef);
      if (!map) continue;
      const subtype = map.Subtype;
      const source = { page: pageIdx, rect: rectOf(doc, map) };

      // File attachment annotations are embedded files -> intra (or undetermined).
      if (subtype && subtype.t === "name" && subtype.v === "FileAttachment") {
        links.push(await embeddedFileRecord(doc, map.FS, pageIdx, source.rect, strOf(doc, map.Contents)));
        continue;
      }

      if (!subtype || subtype.t !== "name" || subtype.v !== "Link") continue;

      const action = doc.dictOf(map.A);
      const sName = action && action.S && action.S.t === "name" ? action.S.v : null;

      // /A /S /URI
      if (sName === "URI") {
        const uri = strOf(doc, action.URI);
        if (uri != null) { links.push(deferredOrRefusedRecord(uri, source)); continue; }
        links.push(undeterminedRecord(source, "uri_action_without_uri"));
        continue;
      }

      // /A /S /GoTo, or a bare /Dest on the annotation
      if (sName === "GoTo" || map.Dest) {
        const dest = sName === "GoTo" ? action.D : map.Dest;
        const res = resolveDestination(doc, dest);
        if (res.ok) {
          links.push(anchorRecord(doc, res.page, source, destNameOf(doc, dest)));
        } else {
          links.push(undeterminedRecord(source, res.why, { dest: res.dest }));
        }
        continue;
      }

      // Actions we do not carry this phase (GoToR remote, Launch, etc.) or a
      // Link with no action at all: recorded, never invented.
      if (sName === "GoToR" || sName === "Launch") {
        links.push(undeterminedRecord(source, `unsupported_action_${sName}`));
        continue;
      }
      links.push(undeterminedRecord(source, sName ? `unsupported_action_${sName}` : "link_without_action_or_dest"));
    }
  }

  // Document-level embedded files (/Root /Names /EmbeddedFiles) -> intra. These
  // have no page/rect element reference; that is stated, not invented.
  for (const rec of await documentEmbeddedFiles(doc)) links.push(rec);

  const counts = { anchor: 0, intra: 0, deferred: 0, refused: 0, undetermined: 0 };
  for (const l of links) counts[l.partition]++;

  // Tier 1 text (CPDF-4): extends this same I2 output object; do not fork it.
  const text = await extractText(doc, pageOrder);

  return {
    ok: true,
    container: "pdf",
    version: sig[1],
    pages: doc.pageCount,
    links,
    counts,
    text,
    notes: doc.notes,
  };
}

function destNameOf(doc, dest) {
  dest = doc.resolve(dest);
  return dest && (dest.t === "name" || dest.t === "str") ? dest.v : null;
}

async function documentEmbeddedFiles(doc) {
  const out = [];
  const root = doc.root;
  if (!root) return out;
  const names = doc.dictOf(root.Names);
  if (!names) return out;
  const tree = doc.resolve(names.EmbeddedFiles);
  const pairs = collectNameTreePairs(doc, tree);
  for (const [name, filespec] of pairs) {
    out.push(await embeddedFileRecord(doc, filespec, null, null, name));
  }
  return out;
}

function collectNameTreePairs(doc, node, depth = 0, acc = []) {
  node = doc.resolve(node);
  const map = node && node.t === "dict" ? node.map : null;
  if (!map || depth > 64) return acc;
  const names = doc.resolve(map.Names);
  if (names && names.t === "arr") {
    for (let i = 0; i + 1 < names.items.length; i += 2) {
      const key = doc.resolve(names.items[i]);
      acc.push([key && key.t === "str" ? key.v : null, names.items[i + 1]]);
    }
  }
  const kids = doc.resolve(map.Kids);
  if (kids && kids.t === "arr") for (const kid of kids.items) collectNameTreePairs(doc, kid, depth + 1, acc);
  return acc;
}
