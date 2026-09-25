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
 * AND WHO MADE THAT LAYER (D-251). The text shape carries a `producer` field
 * read from the trailer's /Info: a layer whose producer NAMES OCR software is
 * recorded as such WITH THE PRODUCT NAMED, and a layer with no such marker
 * stays `undetermined` — never "authored", because an absent marker is an
 * absent marker. The classification may only ever make the claim WEAKER. See
 * the D-251 block below for the whole argument; it is the reason this is a
 * DETECTOR and not a lookup table of product names.
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

  /** The document information dictionary — the trailer's `/Info` (D-251).
   *
   *  TWO SHAPES, because the corpus has both and reading only one would make a
   *  whole class of document silently metadata-less. A classic PDF carries
   *  `trailer << … /Info N 0 R >>`; a modern xref-STREAM PDF (what Legistar and
   *  OpenGov serve, and the class this item was raised about) has no `trailer`
   *  keyword at all and carries `/Info` on its `/Type /XRef` stream dict.
   *
   *  THE LAST ONE IN THE FILE WINS, which is incremental-update semantics
   *  without parsing an xref — the same reasoning `scanTopLevel` already runs
   *  on, so a document that was re-saved reports the metadata it was re-saved
   *  WITH rather than the metadata it was born with.
   *
   *  Returns the resolved dict map, or null. Cached; call after
   *  `loadObjectStreams` so an /Info living inside an object stream resolves. */
  infoDict() {
    if (this._info !== undefined) return this._info;
    const cands = [];
    const re = /\btrailer\b/g;
    let m;
    while ((m = re.exec(this.s))) {
      const r = parseValueSafe(this.s, m.index + 7);
      const map = r && r.value && r.value.t === "dict" ? r.value.map : null;
      if (map && map.Info && map.Info.t === "ref") cands.push([m.index, map.Info]);
    }
    for (const v of this.objects.values()) {
      if (!v || v.t !== "stream") continue;
      const type = v.dict.Type;
      if (!(type && type.t === "name" && type.v === "XRef")) continue;
      if (v.dict.Info && v.dict.Info.t === "ref") cands.push([v.start, v.dict.Info]);
    }
    cands.sort((a, b) => a[0] - b[0]);
    for (let i = cands.length - 1; i >= 0; i--) {
      const map = this.dictOf(cands[i][1]);
      /* A dangling /Info reference is an ABSENCE, so fall back to the previous
         candidate rather than reporting "no metadata" for a file that has some. */
      if (map) return (this._info = map);
    }
    return (this._info = null);
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
 * D-251 — WHO MADE THIS TEXT LAYER, AND THE ONE DIRECTION THE ANSWER
 * IS ALLOWED TO TRAVEL
 * ------------------------------------------------------------------ *
 *
 * A text layer is somebody else's transcription that we decode faithfully
 * through the FILE'S OWN /ToUnicode map, so a perfect decode of a wrong layer
 * is a perfect decode of a wrong layer (CPDF-10). CPDF-9 MEASURED that this is
 * not hypothetical: 3 of 14 recent Legistar attachments name
 * `Creator: ABBYY FineReader Engine 11`, and those three are exactly the City
 * Clerk's ENACTED CERTIFIED RESOLUTIONS (89484, 89498, 89518 CMS) — 300-dpi
 * JBIG2 scans under a machine OCR overlay whose garbage the record has been
 * reading as authored text (MEASUREMENTS.md 2026-08-03 §5).
 *
 * THE DESIGN IS THE DEFAULT, NOT THE TABLE, and that sentence is the whole
 * item. What follows is a DETECTOR, not a classifier of documents:
 *
 *   - A producer string that names OCR software makes the layer's provenance
 *     `ocr` with the PRODUCT NAMED — and the name comes from THE DOCUMENT'S
 *     OWN BYTES, never from the table below. The table decides only whether a
 *     marker is PRESENT; the record then says what the file said.
 *   - Everything else stays `undetermined`. NEVER "authored". An absent marker
 *     is an absent marker: a file may carry no /Info at all, may have been
 *     re-saved by a tool that overwrote the metadata, or may name a product
 *     nobody here has heard of. None of those is evidence that a human typed
 *     the text.
 *   - So THE CLASSIFICATION MAY ONLY EVER MAKE THE CLAIM WEAKER. There is no
 *     value in `PRODUCER_DETERMINATIONS` that strengthens anything, and the
 *     chain composed in `index.mjs` can only ever APPEND a step to the `layer`
 *     step that was already there. That is `CLAUDE.md`'s *undetermined is
 *     first-class and must be STATED*, on one field — and it is why a lookup
 *     table answering in BOTH directions would be the record claiming more
 *     than it can support one field wide on every document in the store.
 *
 * WHAT THIS CANNOT SEE, stated rather than left to be discovered. XMP
 * (`CreatorTool`) is NOT read here: CPDF-9's wider 19-document sweep found it
 * never disagreed with /Info, so a second reader buys nothing today and would
 * put one fact in two places. A wholly image-only scan may carry no metadata
 * at all and is caught structurally instead — zero fonts plus a drawn image is
 * the `no_text_layer` marker (CPDF-5), which is why detection is TWO cheap
 * reads that compose rather than one that has to be complete. And an OCR tool
 * that overwrites /Info with its own PDF-writer name is invisible to this and
 * stays `undetermined`, which is the honest answer rather than a missed
 * detection dressed up as a clean one.
 */

/** The two values this may ever answer, and there is deliberately no third.
 *  "authored" IS NOT A MEMBER AND MUST NEVER BECOME ONE — a marker's absence
 *  cannot establish authorship, and a vocabulary that could say so is a
 *  vocabulary that can STRENGTHEN a claim. `producer-provenance.test.mjs`
 *  asserts this array by name for exactly that reason. */
export const PRODUCER_DETERMINATIONS = Object.freeze(["ocr", "undetermined"]);

/** The markers. Every row is a product whose named function IS optical
 *  character recognition, so naming it in producer metadata cannot mean
 *  anything else. This list is allowed to be INCOMPLETE and says so: a name it
 *  does not carry leaves the layer `undetermined`, which is exactly the answer
 *  the record gave before this existed. Adding a row can only ever move a
 *  document from `undetermined` to a NAMED engine — never the other way. */
export const OCR_PRODUCER_MARKERS = Object.freeze([
  /* MEASURED IN THE LIVE RECORD — the reason this item exists (CPDF-9). Both
     spellings are carried because the vendor ships the engine under several
     product names and a second row costs nothing. */
  Object.freeze({ marker: "abbyy", re: /\babbyy\b/i }),
  Object.freeze({ marker: "finereader", re: /\bfine\s?reader\b/i }),
  /* Engines that do nothing else. */
  Object.freeze({ marker: "tesseract", re: /\btesseract\b/i }),
  Object.freeze({ marker: "omnipage", re: /\bomnipage\b/i }),
  Object.freeze({ marker: "readiris", re: /\breadiris\b/i }),
  Object.freeze({ marker: "ocrmypdf", re: /\bocrmypdf\b/i }),
  Object.freeze({ marker: "acrobat-capture", re: /\bacrobat\s+capture\b/i }),
  /* A producer that says OCR ABOUT ITSELF. Anchored on non-alphanumerics so an
     unrelated word that merely contains the letters does not fire. */
  Object.freeze({ marker: "ocr", re: /(^|[^0-9a-z])ocr([^0-9a-z]|$)/i }),
]);

/** Classify a document's producer metadata. PURE — no PDF, no I/O — so the rule
 *  can be driven directly and the `/Info` read can fail independently of it.
 *
 *  `unreadable` is a NAMED cause for metadata that exists and cannot be
 *  trusted. Encryption is the live case: /Info's strings are ciphertext under
 *  the Standard Security Handler, and matching a marker against ciphertext is
 *  matching against noise — an outcome that costs nothing to produce is not
 *  evidence (CLAUDE.md). It classifies NOTHING and publishes NOTHING. */
export function classifyProducer({ producer = null, creator = null, unreadable = null } = {}) {
  const clean = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
  if (unreadable)
    return Object.freeze({ producer: null, creator: null, determination: "undetermined",
                           ocr: null, why: String(unreadable) });
  const p = clean(producer), c = clean(creator);
  /* /Producer first, then /Creator. The order decides only which field is NAMED
     when both carry a marker; either one firing is the same finding. */
  for (const [field, value] of [["producer", p], ["creator", c]]) {
    if (!value) continue;
    for (const m of OCR_PRODUCER_MARKERS) {
      if (!m.re.test(value)) continue;
      /* THE PRODUCT IS NAMED FROM THE DOCUMENT, NOT FROM THE TABLE. `marker`
         records which row fired, so a false positive is traceable to the row
         that caused it rather than to "the detector". */
      return Object.freeze({ producer: p, creator: c, determination: "ocr", why: null,
        ocr: Object.freeze({ engine: value, field, marker: m.marker }) });
    }
  }
  return Object.freeze({ producer: p, creator: c, determination: "undetermined", ocr: null,
    why: (p || c) ? "no_ocr_marker_in_producer_metadata" : "no_producer_metadata" });
}

/** Read `/Info` off a parsed document and classify it. NEVER THROWS: a metadata
 *  read that fails is an ABSENCE (`info_unreadable`), never a lost document —
 *  the same leniency every other read in this module has. */
export function readProducer(doc) {
  if (doc.isEncrypted()) return classifyProducer({ unreadable: "encrypted" });
  try {
    const info = doc.infoDict();
    if (!info) return classifyProducer({});
    /* A /Producer that is not a STRING — a number, a name, a dangling
       reference — is ABSENT, not guessed at. */
    const str = (k) => { const v = doc.resolve(info[k]); return v && v.t === "str" ? v.v : null; };
    return classifyProducer({ producer: str("Producer"), creator: str("Creator") });
  } catch {
    return classifyProducer({ unreadable: "info_unreadable" });
  }
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
function tokenizeContent(s, opts = {}) {
  /* CPDF-18: `inlineImages` skips an inline image's binary data (the bytes
     between `ID` and `EI`), which would otherwise be read as operators. It is
     OFF for the Tier-1 text walk, whose output is measured and pinned, and ON
     only for the image walk (`pdfPageImages`), which is where a stray `Q` or
     `cm` inside sample bytes would move the graphics state. */
  const skipInline = opts.inlineImages === true;
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
    if (i > start) {
      const op = s.slice(start, i);
      toks.push({ t: "op", v: op });
      if (skipInline && op === "ID") {
        /* One whitespace byte ends `ID`; the data runs to the first `EI` that
           stands alone after whitespace and before whitespace or a delimiter. */
        const re = /\sEI(?=[\s/[<(]|$)/g;
        re.lastIndex = i + 1;
        const m = re.exec(s);
        i = m ? m.index + 1 : n;
      }
    }
    else i++; // never stall
  }
  return toks;
}

/** D-608: the bytes a token list's text-showing operators (`Tj`, `TJ`, `'`,
 *  `"`) carry — what a form this walk could not enter would have shown. Bytes,
 *  not characters: no font is selected to say how wide a code is. */
function textShowBytes(toks) {
  let n = 0;
  const pending = [];
  for (const tk of toks) {
    if (tk.t !== "op") { if (tk.t === "str") pending.push(tk.bytes.length); continue; }
    if (tk.v === "Tj" || tk.v === "TJ" || tk.v === "'" || tk.v === '"') for (const b of pending) n += b;
    pending.length = 0;
  }
  return n;
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
  const w = fontWidths(doc, map, subtype, isType0);
  return { subtype, isType0, baseFont, toUni, width, widths: w.widths, widthsWhy: w.why };
}

/* D-502 — GLYPH ADVANCE WIDTHS, SO THE PEN HAS A POSITION.
 *
 * D-481 made a line break on a BASELINE move rather than on any positioning
 * operator, and said in the same breath what that cost: two runs on ONE
 * baseline separated only by a horizontal jump — a table row's cells, a
 * footer's left and right halves — were concatenated into one token, because
 * nothing here knew where the pen had got to. Measured on the Legistar agenda
 * as `OaklandPrinted` and `5:26:26PM` (M-133; 0.32% of that document's tokens).
 *
 * A jump can only be judged against where the pen WAS, and the pen only moves
 * by the width of what was shown. So the widths are read from the file:
 *
 *   - a SIMPLE font (Type1, TrueType, Type3) declares /FirstChar and /Widths,
 *     indexed by character code, with /FontDescriptor /MissingWidth for a code
 *     outside the array (ISO 32000-1 §9.6.2.1);
 *   - a COMPOSITE font's descendant CIDFont declares /DW (default 1000) and a
 *     /W array in two alternating shapes — `c [w …]` and `cFirst cLast w`
 *     (§9.7.4.3).
 *
 * EVERY WIDTH RETURNED IS IN TEXT SPACE, never glyph space: a simple font's
 * and a CIDFont's glyph space is 1/1000 of text space, and a Type3 font's is
 * whatever its own /FontMatrix says, so the [0] entry is read rather than the
 * 1/1000 assumed. A Type3 with no readable /FontMatrix yields NO widths.
 *
 * WHEN THE WIDTHS ARE NOT KNOWN THE ANSWER IS `null` AND THE PEN GOES UNKNOWN
 * WITH IT — it is never filled in from a default, an average or the font size.
 * This is the whole safety property of D-502: a document whose widths this
 * reader cannot establish reads EXACTLY as D-481 left it, because a break
 * placed on an invented width is an invented break, and the record would have
 * no way to tell one from a real one. `widthsWhy` names which case it was.
 *
 * THE ONE MAPPING THIS DOES NOT DO, stated rather than left to be found: a
 * composite font's code→CID mapping is taken as the IDENTITY, which is what
 * /Identity-H and /Identity-V mean and what every composite font in this
 * project's PDF corpus uses. Any other /Encoding — a predefined CMap by name,
 * or an embedded CMap stream — yields NO widths (`cid_encoding_not_identity`)
 * rather than widths read at the wrong index. */
function numOf(doc, v) {
  v = doc.resolve(v);
  return typeof v === "number" ? v : null;
}

/** The horizontal glyph-space scale of a font: 1/1000 for everything but a
 *  Type3, whose /FontMatrix states its own. Null when a Type3 does not. */
function glyphScale(doc, map, subtype) {
  if (subtype !== "Type3") return 0.001;
  const fm = doc.resolve(map.FontMatrix);
  if (!fm || fm.t !== "arr" || fm.items.length < 6) return null;
  const a = numOf(doc, fm.items[0]);
  return typeof a === "number" && a !== 0 ? a : null;
}

/** Read a font's advance widths. Returns `{ widths, why }`; `widths` is a
 *  lookup from character code to a TEXT-SPACE advance, or null with `why`. */
function fontWidths(doc, map, subtype, isType0) {
  if (isType0) return cidWidths(doc, map);
  const scale = glyphScale(doc, map, subtype);
  if (scale == null) return { widths: null, why: "type3_no_font_matrix" };
  const first = numOf(doc, map.FirstChar);
  const arr = doc.resolve(map.Widths);
  if (first == null || !arr || arr.t !== "arr" || arr.items.length === 0) {
    return { widths: null, why: "no_widths_array" };
  }
  const vals = arr.items.map((x) => numOf(doc, x));
  const desc = doc.dictOf(map.FontDescriptor);
  const missing = (desc ? numOf(doc, desc.MissingWidth) : null) ?? 0;
  const widths = (code) => {
    const i = code - first;
    const w = i >= 0 && i < vals.length ? vals[i] : null;
    return (w == null ? missing : w) * scale;
  };
  return { widths, why: null };
}

/** A composite font's widths, from its descendant CIDFont's /DW and /W. */
function cidWidths(doc, map) {
  const enc = nameOf(doc, map.Encoding);
  if (enc !== "Identity-H" && enc !== "Identity-V") {
    return { widths: null, why: "cid_encoding_not_identity" };
  }
  const descArr = doc.resolve(map.DescendantFonts);
  const cid = descArr && descArr.t === "arr" && descArr.items.length
    ? doc.dictOf(descArr.items[0])
    : null;
  if (!cid) return { widths: null, why: "no_descendant_font" };
  const dw = numOf(doc, cid.DW) ?? 1000;
  const table = new Map();
  const wArr = doc.resolve(cid.W);
  if (wArr && wArr.t === "arr") {
    const items = wArr.items.map((x) => doc.resolve(x));
    let i = 0;
    while (i < items.length) {
      const c = items[i];
      if (typeof c !== "number") { i++; continue; }
      const next = items[i + 1];
      if (next && typeof next === "object" && next.t === "arr") {
        // `c [w1 w2 …]`: consecutive CIDs starting at c.
        const list = next.items.map((x) => numOf(doc, x));
        for (let k = 0; k < list.length; k++) if (list[k] != null) table.set(c + k, list[k]);
        i += 2;
        continue;
      }
      const last = typeof next === "number" ? next : null;
      const w = typeof items[i + 2] === "number" ? items[i + 2] : null;
      // `cFirst cLast w`: one width for the whole range. The range is bounded
      // because a malformed pair could otherwise ask for millions of entries.
      if (last != null && w != null && last >= c && last - c <= 65535) {
        for (let code = c; code <= last; code++) table.set(code, w);
        i += 3;
        continue;
      }
      i++;
    }
  }
  const widths = (code) => (table.has(code) ? table.get(code) : dw) * 0.001;
  return { widths, why: null };
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

/* D-481 — THE TEXT MATRIX, ENOUGH OF IT TO KNOW WHERE A LINE IS.
 *
 * A PDF matrix is [a b c d e f]:  x' = a·x + c·y + e ;  y' = b·x + d·y + f.
 * `matMul(A, B)` is "apply A, then B", the order every PDF operator composes in
 * (ISO 32000-1 §8.3.3): `cm` premultiplies the CTM, `Td` premultiplies the text
 * LINE matrix. Only the translation row is read back (`baselineOf`), because the
 * only question asked of it is WHERE THE BASELINE IS.
 *
 * WHAT THIS DOES NOT MODEL, stated because a reader would otherwise assume it:
 * glyph ADVANCE. No font here carries /Widths or /W, so the pen's position after
 * a shown string is unknown, and only positions a positioning OPERATOR states are
 * known. See the note in extractPageText on what that costs. */
const IDENTITY_MATRIX = Object.freeze([1, 0, 0, 1, 0, 0]);
function matMul(a, b) {
  return [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4],
    a[4] * b[1] + a[5] * b[3] + b[5],
  ];
}
/** The device-space y of a text line matrix under a CTM — the baseline. */
const baselineOf = (tlm, ctm) => tlm[4] * ctm[1] + tlm[5] * ctm[3] + ctm[5];
/** Float slack only. Any baseline move a document can SEE is orders above this,
 *  so "any y change breaks the line" survives it; identical inputs through
 *  identical multiplies do not drift, and non-identical paths to one baseline do. */
const BASELINE_EPS = 1e-6;

/* D-502 — THE WORD-GAP THRESHOLD, IN EMS, TAKEN FROM A MEASURED DISTRIBUTION
 * AND FROM A MEASURED SWEEP OF ITS OWN VALUE (M-141).
 *
 * The question this number answers: a positioning operator has landed on the
 * baseline already being written — did it CONTINUE the run just shown, or start
 * a new one? The distance from where the pen was left to where the operator
 * puts it is the evidence, in EMS of the text it follows, because 4 pt is a
 * word gap at 8 pt and a kern at 40 pt and one agenda holds both.
 *
 * THE DISTRIBUTION, over 5,960 same-baseline jumps in nine Oakland PDFs (the
 * seven committed PDF fixtures, `Budget-Basics-FY23-25.pdf` and the Legistar
 * agenda D-481 measured; shas and instrument in `measurements/M-141.md`):
 *
 *   |gap| ≤ 0.025 em     5,002   the pen landed where the widths said it would
 *   0.025 … 0.25 em         299   kerning and rounding, inside and between words
 *   0.25 … 0.45 em            9   ← the valley; (0.375, 0.450] holds NOTHING
 *   ≥ 0.45 em               579   word gaps, column jumps, footer halves
 *
 * AND THE SWEEP, which is the more useful half and says the figure is NOT
 * load-bearing: re-reading all seven text-bearing documents at fifteen values
 * of this constant gives 14,041 tokens at 0.03 and 14,039 at 1.0 — TWO tokens
 * of difference across a factor of thirty, because a jump into text the
 * document already spaced adds nothing (`softSpace`). What the sweep DOES find
 * is one cliff, and it is at zero: with the threshold at 0 the same corpus
 * reads 17,292 tokens with 4,578 of them ONE CHARACTER LONG, because float
 * noise in the matrix arithmetic becomes a word gap. So the property that
 * matters is being clear of that floor, not the exact value; 0.25 is the
 * valley's own midpoint and is what a space IS in a text face (0.25–0.33 em),
 * two independent readings meeting rather than one number standing alone.
 *
 * APPLIED TO THE MAGNITUDE, so ONE constant serves both directions. A BACKWARD
 * jump on a live baseline is a new run too — a column drawn out of order — and
 * its valley was measured on the same corpus: of 185 backward jumps, 181 are
 * ≤ 0.21 em (kerning and overprint) and four are ≥ 2.68 em. */
const WORD_GAP_EM = 0.25;

/* D-517 — THE SECOND WORD-GAP RULE, MEASURED (M-145), AND WHY IT KEEPS A
 * CONSTANT OF ITS OWN RATHER THAN BORROWING THE ONE ABOVE.
 *
 * This reader has TWO word-gap rules and they disagreed by 2.5x: the one above
 * judges a jump a POSITIONING OPERATOR makes between two runs, this one judges
 * a displacement the producer wrote INSIDE one shown run, as a number in a TJ
 * array. D-481 picked -100 thousandths by hand; D-502 kept it and said the
 * populations differ; this row MEASURED the second population and the two
 * statements now rest on figures rather than on each other.
 *
 * THE DISTRIBUTION, over 14,067 TJ numeric elements in M-141's own nine Oakland
 * PDFs (8,432 forward, 5,635 backward; shas and instrument in
 * `measurements/M-145.md`). The discriminator the run-gap population did not
 * need is WHAT THE ELEMENT FOLLOWS: a positioning operator's jump is always
 * between runs, while a TJ number sits wherever the producer put it, so a space
 * there either separates two words or doubles a separator already present.
 * Counting only the elements that follow a LETTER OR DIGIT — the ones where a
 * space is a claim about a word boundary —
 *
 *   ≤ 0.020 em          3,818   intra-word kerning: splitting here invents words
 *   0.020 … 0.180 em        0   <- THE VALLEY, and it is EMPTY, not merely thin
 *   ≥ 0.180 em             86   the producer's own word gaps
 *
 * so the valley runs from 0.020 to 0.180 em and 0.100 is its midpoint. D-481's
 * hand-picked figure was RIGHT and is confirmed here rather than replaced; what
 * it lacked was the measurement, which is what this constant now carries.
 *
 * AND THE SWEEP, which says the same thing the other way: tokens, words and
 * glue are FLAT at 14,039 / 13,396 / 17 from 0.02 to 0.18 em — a factor of
 * nine — collapse at 0 to 17,322 tokens with 3,481 of them ONE CHARACTER LONG
 * (float noise become a word gap, the same cliff M-141 found above), and decay
 * ABOVE the valley: at 0.25 em the corpus loses 75 words and gains 9 glue
 * tokens on `legistar-73545` alone.
 *
 * WHICH IS WHY UNIFYING THE TWO CONSTANTS AT 0.25 IS REFUSED BY MEASUREMENT,
 * not by preference: 75 of the 86 real word gaps here sit in (0.180, 0.25],
 * a band the run-gap population has nothing in. Unifying DOWNWARD at 0.1 was
 * measured too and is nearly free (+2 tokens), and is still not taken: it would
 * move 297 jumps M-141 classified as kerning into the word-gap class, against
 * that row's own measured valley, which this row did not re-measure. M-145
 * records both readings.
 *
 * ONE-SIDED, unlike the rule above, and this is measured rather than inherited:
 * of 5,635 BACKWARD elements not one exceeds 0.075 em, so the magnitude form is
 * byte-identical on this corpus — an equality that costs nothing to produce and
 * is therefore no evidence. The reason it stays forward-only is structural: a
 * backward displacement inside ONE shown run is the producer tightening or
 * overprinting, never a new run, while a backward jump BETWEEN runs is a column
 * drawn out of order, which is what the rule above is for. A suite arm pins the
 * asymmetry so it is not tidied away. */
const TJ_WORD_GAP_EM = 0.1;

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

  /* D-608: the font dictionary and resources IN SCOPE. A Form XObject names
     its fonts in its OWN /Resources, so these move when the walk descends into
     one (`paintForm`) and come back when it returns. `scopeTag` keeps a font
     written as a DIRECT dict in a form from sharing a cache slot with a
     same-named direct font on the page; the page's own tag is empty, so every
     key the walk made before D-608 is spelled as it was. */
  let curResources = resources;
  let curFontDict = fontDict;
  let scopeTag = "";
  const getFont = async (name) => {
    if (!curFontDict || !(name in curFontDict)) return null;
    const ref = curFontDict[name];
    const key = ref && ref.t === "ref" ? "r" + ref.n : "n" + scopeTag + name;
    if (fontCache.has(key)) return fontCache.get(key);
    const f = await loadFont(doc, ref);
    fontCache.set(key, f);
    return f;
  };

  const show = (bytes) => {
    if (!bytes || bytes.length === 0) return;
    if (!curFont) {
      penKnown = false; inkValid = false; // D-502: nothing says how far this moved the pen
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
      /* D-502: the text is undecodable, the ADVANCE is not \u2014 a width is
         looked up by CODE and needs no /ToUnicode. So the pen survives a run
         this reader cannot read, and the gap after it is still judged. */
      advanceOver(bytes);
      endRun();
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
      advanceOne(code);
      const u = curFont.toUni.get(code);
      if (u == null) {
        undetermined.push({
          page: pageIdx,
          reason: "unmapped_code",
          font: curFont.baseFont ?? curFontName ?? null,
          codes: code.toString(16).padStart((curFont.width || 1) * 2, "0"),
          count: 1,
        });
      } else {
        /* D-502: withdraw an inserted separator the DOCUMENT then supplies
           itself. `softSpace` cannot see what is coming, so the symmetric half
           of the rule lives here and in `breakLine`: a separator this reader
           added is kept only where it actually separates something. The net
           property, and it is the one worth stating: this reader adds a
           separator ONLY where the document wrote none. (D-502 for a
           positioning operator's jump; SINCE D-517 for a TJ displacement too,
           which until then pushed its space past both halves of this rule.) */
        if (softAt === pieces.length && /^\s/.test(u)) { pieces.pop(); softAt = -1; }
        pieces.push(u);
      }
    }
    endRun();
    if (leftover) {
      penKnown = false; inkValid = false; // D-502: bytes of unknown code width advance by an unknown amount
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
  /** The last `n` numeric operands, in the order they were written, or null. */
  const numArgs = (n) => {
    const out = [];
    for (let i = stack.length - 1; i >= 0 && out.length < n; i--) {
      if (stack[i].t === "num") out.unshift(stack[i].v);
    }
    return out.length === n ? out : null;
  };

  /* D-481 — A LINE BREAKS WHEN THE BASELINE MOVES, NOT WHEN THE PEN MOVES.
   *
   * MEASURED, not assumed. Until this item every `Td`, `TD` and `Tm` pushed a
   * newline, on the reading that a positioning operator starts a line. It does
   * not: `Td tx 0` moves ALONG the current baseline, and a whole class of
   * producers positions EVERY GLYPH that way. Oakland's own
   * `Budget-Basics-FY23-25.pdf` (Skia/PDF m131, 11 pages, fetched 2026-09-24)
   * is written `<0021> Tj  30.6698 0 Td <01E3> Tj  11.47 0 Td <024E> Tj …`, one
   * `Td` per glyph, so Tier 1 read it as 4,496 one-character lines — 47 words in
   * the whole document — while the glyphs, the SPACES INCLUDED, were all there.
   * The record said far less than the document held, and said it confidently.
   *
   * THE RULE, and it is the PDF's own: the text LINE matrix is what a line is.
   *   - `Td`/`TD` with ty = 0 translate along the baseline  -> NO break.
   *   - `Tm` landing on the current line's baseline         -> NO break.
   *   - `T*`, `'`, `"`, and any y change                    -> BREAK.
   * The baseline is read in DEVICE space (the line matrix composed with the
   * CTM), never from the line matrix alone, because this same document gives
   * every one of its real lines the IDENTICAL `1 0 0 -1 .015625 44 Tm` and
   * separates them with `cm` — so a reading that trusted `Tm` alone would fuse
   * all eleven pages into one line and count MORE words for it. That is why
   * `q`, `Q` and `cm` are interpreted here.
   *
   * WHAT IT COSTS, stated rather than left to be discovered: two runs on ONE
   * baseline separated only by a horizontal jump — table columns — are now
   * CONCATENATED where they used to be split by a newline. Closing that needs
   * the pen's position, which needs glyph widths (/Widths, /W), which this
   * module does not read; a gap threshold guessed without them would be an
   * invented figure. Reported as a follow-up rather than guessed here.
   *
   * The inline-image option stays OFF for this walk (see tokenizeContent), so
   * an inline image's sample bytes can still be read as operators — including,
   * now, as `cm`. That is the same exposure the walk already had to a stray
   * `Td`, neither widened nor closed by this item. */
  let ctm = IDENTITY_MATRIX.slice();   // the current transformation matrix
  const ctmStack = [];                 // q / Q
  let tlm = IDENTITY_MATRIX.slice();   // the text LINE matrix; BT resets it
  let leading = 0;                     // TL, the leading T* moves by
  let lineY = null;                    // the baseline of the line being written
  const breakLine = () => {
    /* D-502: a separator this reader inserted and then never separated
       anything is withdrawn rather than left at the end of a line. `softAt`
       is the length `pieces` had immediately after that push, so it still
       matches ONLY if nothing has been shown since — which is exactly the
       case where the jump turned out to end the line. A space the DOCUMENT
       wrote never matches. [CORRECTED BY D-517, 2026-09-24: this said a space
       "the TJ rule read out of a displacement" never matches either, which was
       true when written and is not now — that rule emits through `softSpace`
       too, so its separators are withdrawn on the same terms. Measured at
       M-145: 122 space characters and 12 whitespace-only lines leave the
       corpus, and not one token, word, glue token or non-whitespace character
       moves.] */
    if (softAt === pieces.length && pieces.length) { pieces.pop(); softAt = -1; }
    pieces.push("\n");
    lineY = baselineOf(tlm, ctm);
  };

  /* D-502 \u2014 THE PEN, AND THE ONE THING IT IS ASKED.
   *
   * The TEXT matrix is the line matrix plus everything shown since the line
   * began; D-481 tracked only the line matrix, which is why a horizontal jump
   * BACK ALONG a baseline could not be told from a continuation. Tracked here:
   * the text matrix `tmat`, the font size, character and word spacing, and
   * horizontal scaling \u2014 the four text-state parameters that enter the glyph
   * displacement (ISO 32000-1 \u00a79.4.4). Rise does not; it moves y, and y is the
   * baseline's question, already answered.
   *
   * `penKnown` IS THE HONEST HALF. It goes false the moment something is shown
   * whose advance this reader cannot compute \u2014 no font, no width array, a
   * trailing partial code \u2014 and while it is false NO GAP IS JUDGED. It comes
   * back true at the next positioning operator, which STATES where the pen is.
   * So a document whose widths are unreadable reads exactly as D-481 left it,
   * rather than acquiring breaks derived from a width nobody read. */
  let tmat = IDENTITY_MATRIX.slice(); // the TEXT matrix
  let penKnown = true;                // is tmat where the pen actually is?
  let tfs = 0;                        // Tf size
  let tc = 0;                         // Tc character spacing
  let tw = 0;                         // Tw word spacing
  let th = 1;                         // Tz horizontal scaling, as a factor

  /* WHERE THE INK STOPPED, IN DEVICE SPACE, AND WHY IT IS HELD THAT WAY.
   *
   * `BT` resets the text matrices, and `Q`/`cm` move the CTM, so a position
   * kept in TEXT space is worthless across those \u2014 and a very common producer
   * writes ONE `BT \u2026 ET` PER RUN with its own `cm` (Legistar's own PDFs do:
   * `\u2026 cm BT 46 0 0 46 1053.309 94 Tm /TT4 1 Tf [\u2026] TJ ET Q q \u2026 cm BT 46 0 0
   * 46 1404.691 94 Tm \u2026`). Measured on `legistar-73450`: reading the pen off
   * the text matrix at the second `Tm` reads the ORIGIN, because `BT` had just
   * reset it, and every gap came out ~1,200 ems. So the pen's device x is
   * captured when the ink stops and survives `ET`, `Q` and `BT` untouched.
   *
   * `inkEm` is the em of the text LAST SHOWN, not of the text state at the
   * jump, and that is deliberate: in the same producer's output the `Tf` for
   * the next run comes AFTER its `Tm`, so the only font in hand at the moment
   * a gap is judged is the one the gap follows. That is also the right
   * reference \u2014 the question is whether the jump is wide FOR THE TEXT IT
   * FOLLOWS. */
  let softAt = -1;    // `pieces.length` just after the last separator inserted here
  let inkX = 0;       // device x where the last tracked run of ink ended
  let inkEm = null;   // device length of one em of that run
  let inkValid = false;

  /** Device-space x of a text-space origin under the current CTM. */
  const deviceX = (m) => m[4] * ctm[0] + m[5] * ctm[2] + ctm[4];
  /** The device-space length of ONE EM of the current text state. A gap is
   *  judged in ems and never in points, because 4 pt is a word gap at 8 pt and
   *  a kern at 40 pt, and one document holds both. */
  const emDevice = () => {
    const m = matMul(tmat, ctm);
    return Math.abs(tfs) * th * Math.hypot(m[0], m[1]);
  };
  /** Push a separator unless one is already there. Never opens a line. */
  const softSpace = () => {
    if (!pieces.length) return;
    const last = pieces[pieces.length - 1];
    if (last.endsWith(" ") || last.endsWith("\n")) return;
    pieces.push(" ");
    softAt = pieces.length;
  };
  /** A positioning operator landed on the CURRENT baseline: is the distance it
   *  jumped a WORD GAP, or a continuation of the run just shown? */
  const judgeGap = (toX) => {
    if (!inkValid) return;
    const em = inkEm ?? emDevice();
    if (!(em > 0) || !Number.isFinite(em)) return;
    const gapEm = (toX - inkX) / em;
    if (Math.abs(gapEm) > WORD_GAP_EM) softSpace();
  };
  /** A shown run has ended: the ink is where the pen is, and one em of THAT
   *  run is the yardstick the next jump is measured with. */
  const endRun = () => {
    markInk();
    if (penKnown) inkEm = emDevice();
  };
  /** Advance the pen over one character code. */
  const advanceOne = (code) => {
    if (!penKnown) return;
    const w0 = curFont && curFont.widths ? curFont.widths(code) : null;
    if (w0 == null || !Number.isFinite(w0)) { penKnown = false; return; }
    const spacing = tc + (curFont.width === 1 && code === 32 ? tw : 0);
    tmat = matMul([1, 0, 0, 1, (w0 * tfs + spacing) * th, 0], tmat);
  };
  /** Advance the pen over a shown string whose text was not decoded. */
  const advanceOver = (bytes) => {
    if (!penKnown) return;
    if (!curFont || !curFont.widths) { penKnown = false; return; }
    const { codes, leftover } = bytesToCodes(bytes, curFont.width);
    for (const code of codes) advanceOne(code);
    if (leftover) penKnown = false;
  };
  /** Advance the pen by a TJ displacement, in thousandths of text space. */
  const advanceBy = (adj) => {
    if (!penKnown) return;
    tmat = matMul([1, 0, 0, 1, (-adj / 1000) * tfs * th, 0], tmat);
  };
  /** The pen is where `tmat` says: record it in device space. */
  const markInk = () => {
    if (!penKnown) { inkValid = false; return; }
    inkX = deviceX(tmat);
    inkValid = true;
  };
  /** A positioning operator has set the line matrix: the pen is THERE, and it
   *  is known again whatever went before. */
  const penToLine = () => { tmat = tlm.slice(); penKnown = true; markInk(); };

  const run = async (toks, depth, formChain) => {
  for (const tk of toks) {
    if (tk.t !== "op") { stack.push(tk); continue; }
    switch (tk.v) {
      case "Do": {
        /* D-608: the operator this walk did not interpret until now. A Form
           XObject is a content stream of its own, and the text it shows is on
           the page exactly as the page's own text is (M-166: ACFR FY2023-24
           p38 shows 34 of its 40 text runs inside forms). */
        const nameTok = lastOfType("name");
        stack.length = 0;
        await paintForm(nameTok ? nameTok.v : null, depth, formChain);
        break;
      }
      case "Tf": {
        const nameTok = lastOfType("name");
        curFontName = nameTok ? nameTok.v : null;
        curFont = curFontName ? await getFont(curFontName) : null;
        const sz = numArgs(1); // D-502: `/F1 12 Tf` \u2014 the size is the operand
        if (sz) tfs = sz[0];
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
          else if (it.t === "num") {
            /* D-517 — THE SAME RULE ON A MEASURED CONSTANT AND THE SHARED
               EMITTER. D-502 kept D-481's hand-picked -100 and said the two
               populations answer different questions and need their own
               distribution; M-145 measured it, and the figure is the same 0.1
               em, now stated in the unit the other rule is stated in so the two
               are comparable at the site. `-it.v / 1000` IS the displacement in
               ems — the horizontal-scale factor cancels, since the device
               advance is (-v/1000)·tfs·th·|m| and one em of that same text is
               tfs·th·|m| — and this predicate is the one `it.v < -100` was, on
               every one of the 417 distinct values the corpus holds and on the
               boundary in both directions (M-145). It still moves the pen,
               because the next positioning operator's gap is measured from
               wherever it left it. */
            if (-it.v / 1000 > TJ_WORD_GAP_EM) softSpace();
            advanceBy(it.v);
          }
        }
        break;
      }
      case "'":
      case '"': {
        // ' : next line then show;  " : aw ac (string) — next line then show.
        // Both are T* followed by Tj, so both MOVE the line matrix and BREAK.
        if (tk.v === '"') {
          // `aw ac (string) "` sets word then character spacing (\u00a79.4.3).
          const a = numArgs(2);
          if (a) { tw = a[0]; tc = a[1]; }
        }
        tlm = matMul([1, 0, 0, 1, 0, -leading], tlm);
        breakLine();
        penToLine();
        const st = lastOfType("str");
        if (st) show(st.bytes);
        break;
      }
      case "q":
        ctmStack.push(ctm.slice());
        break;
      case "Q":
        if (ctmStack.length) ctm = ctmStack.pop();
        break;
      case "cm": {
        const m = numArgs(6);
        if (m) ctm = matMul(m, ctm);
        break;
      }
      case "BT":
        tlm = IDENTITY_MATRIX.slice(); // BT resets the text and line matrices
        /* D-502: the matrices reset, the INK DOES NOT. `BT` moves the pen to
           this text object's origin, which is true and useless: the reference a
           jump is measured against is where the last run of ink STOPPED, and a
           producer that writes one `BT … ET` per run would otherwise have every
           gap measured from its own origin. Measured on `legistar-73450`, where
           marking the ink here read every gap as ~1,200 ems. */
        tmat = tlm.slice();
        penKnown = true;
        break;
      case "TL": {
        const a = numArgs(1);
        if (a) leading = a[0];
        break;
      }
      /* D-502: the three text-state parameters that enter a glyph's horizontal
         displacement beside the width itself. They change no character. */
      case "Tc": { const a = numArgs(1); if (a) tc = a[0]; break; }
      case "Tw": { const a = numArgs(1); if (a) tw = a[0]; break; }
      case "Tz": { const a = numArgs(1); if (a) th = a[0] / 100; break; }
      case "Td": case "TD": {
        const a = numArgs(2);
        if (!a) break;
        const [tx, ty] = a;
        if (tk.v === "TD") leading = -ty;
        tlm = matMul([1, 0, 0, 1, tx, ty], tlm);
        if (ty !== 0) breakLine();
        else if (lineY === null) lineY = baselineOf(tlm, ctm);
        /* D-608: `ty = 0` is along the baseline only if the CTM did not move
           it. A form is entered through its `cm` and /Matrix and typically
           starts `BT 0 0 Td`, which read as a continuation of the page's last
           line (`PAGE HEADform label`, the suite's FORM ARM). `Tm` has always
           asked the device baseline; `Td` now asks it too. Measured inert on
           everything else: 0 of 1,840 real pages moved (M-174). */
        else if (Math.abs(baselineOf(tlm, ctm) - lineY) > BASELINE_EPS) breakLine();
        else judgeGap(deviceX(tlm));
        penToLine();
        break;
      }
      case "Tm": {
        const m = numArgs(6);
        if (!m) break;
        tlm = m;
        const y = baselineOf(tlm, ctm);
        if (lineY === null || Math.abs(y - lineY) > BASELINE_EPS) breakLine();
        else judgeGap(deviceX(tlm));
        penToLine();
        break;
      }
      case "T*":
        tlm = matMul([1, 0, 0, 1, 0, -leading], tlm);
        breakLine();
        penToLine();
        break;
      default:
        break;
    }
    stack.length = 0; // operands are consumed by their operator
  }
  };

  /* D-608 — TEXT INSIDE A FORM XOBJECT IS READ, THE WAY CPDF-18's IMAGE WALK
   * ALREADY DESCENDS (`pdfPageImages`).
   *
   * MEASURED, not assumed (M-166). This walk interpreted no `Do`, so a page
   * whose text sits in a Form XObject read as fully decoded with none of that
   * text and NO marker: ACFR FY2023-24 p38 gave tier 1 80 glyphs, its running
   * header, and tier 2 546, the header plus every label of two pie charts. All
   * 9 held pages where tier 2 read 10% or more beyond an unflagged tier 1
   * carried form text. The record claimed a page it had not read.
   *
   * WHAT `Do` DOES HERE, and it is ISO 32000-1 §8.10.1's own sequence: save
   * the graphics state, premultiply the CTM by the form's /Matrix, paint the
   * form's content with its OWN /Resources (the enclosing ones when it has
   * none — the image walk's fallback), restore. The text state (font, size,
   * Tc, Tw, Tz, TL) is part of the graphics state and is restored with it. The
   * text matrices are not, but a `Do` inside `BT` is outside the grammar, so
   * they are restored too rather than letting a form a producer wrongly nested
   * there move the page's line. The BASELINE and the INK are not restored: they
   * are held in device space, so a line the form wrote is compared with the
   * page's next line exactly as two page lines are. `/BBox` clipping is not
   * modelled; neither is clipping of the page's own text.
   *
   * WHAT IT CANNOT READ, IT SAYS, COUNTED. A form nested past
   * FORM_DEPTH_LIMIT, or one that paints itself, is not walked; if it shows
   * text, a `form_text_unread` marker counts the bytes its text-showing
   * operators carry (the unit `no_current_font` already counts in: no font is
   * in hand to say how wide a code is). A form whose stream cannot be decoded
   * is `form_stream_undecodable` with a count of 0: whether it held text is
   * undetermined, and a figure for it would be invented. A `Do` naming nothing
   * this scope resolves, or naming an image, adds nothing: there is no text
   * there that any reader could have. */
  const paintForm = async (name, depth, formChain) => {
    const xobjects = curResources ? doc.dictOf(curResources.XObject) : null;
    const ref = name != null && xobjects ? xobjects[name] : null;
    const st = ref ? doc.resolve(ref) : null;
    if (!st || st.t !== "stream" || nameOf(doc, st.dict.Subtype) !== "Form") return;
    const key = ref.t === "ref" ? ref.n : null;
    const data = await doc.streamDecoded(st);
    if (!data) {
      doc.note("form_stream_undecodable");
      undetermined.push({ page: pageIdx, reason: "form_stream_undecodable", font: null, codes: "", count: 0 });
      return;
    }
    const formToks = tokenizeContent(LATIN1.decode(data));
    if (depth >= FORM_DEPTH_LIMIT || (key != null && formChain.includes(key))) {
      const unread = textShowBytes(formToks);
      if (unread > 0) {
        undetermined.push({ page: pageIdx, reason: "form_text_unread", font: null, codes: "", count: unread });
      }
      return;
    }
    const saved = { ctm, curResources, curFontDict, scopeTag, curFont, curFontName,
                    tfs, tc, tw, th, leading, tlm, tmat, penKnown };
    const m = matrixOf(doc, st.dict.Matrix) || IDENTITY_MATRIX;
    ctm = matMul(m, ctm);
    const formRes = doc.dictOf(st.dict.Resources);
    if (formRes) {
      curResources = formRes;
      curFontDict = doc.dictOf(formRes.Font);
      scopeTag = "f" + (key ?? "?" + depth) + ":";
    }
    try {
      await run(formToks, depth + 1, key != null ? [...formChain, key] : formChain);
    } finally {
      ({ ctm, curResources, curFontDict, scopeTag, curFont, curFontName,
         tfs, tc, tw, th, leading, tlm, tmat, penKnown } = saved);
    }
  };

  await run(toks, 0, []);

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
  /* D-585 — AND "NO FONT DECLARED" WAS TOO NARROW A SPELLING OF "BEARS NO TEXT".
   * A font dictionary is a RESOURCE, and a page can inherit one from its /Pages
   * parent without ever using it: `0201-cafr-2002` is 175 scanned pages, and 161
   * of them inherit a 12-font dictionary and carry an EMPTY `BT … ET` beside the
   * scan image (M-157). No glyph is shown on any of them, and this line read all
   * 161 as zero characters of TEXT — read, and empty — rather than UNREAD, and
   * `needsTier3` never heard of them. What bears text is a text-SHOWING
   * operator, so that is now what is asked, by the one predicate the OCR
   * member's renderer asks too (`pageShowsText`, below). The structural no-font
   * half is KEPT beside it, not replaced: a page with no font resource cannot
   * show a glyph whatever its content says, so it stays sufficient on its own,
   * and every page this line marked before it still marks. What is added is the
   * page that declares fonts and DEFINITELY shows nothing — `false`, never
   * `null`: a content stream or a Form XObject this reader could not read is not
   * evidence that nothing was shown there. */
  if (!text.length && !undetermined.length && pageDrawsImage(doc, resources)
      && (!fontDict || (await pageShowsText(doc, pageMap)) === false)) {
    undetermined.push({
      page: pageIdx, reason: "no_text_layer", font: null, codes: "", count: 0,
    });
  }
  return { text, undetermined };
}

/* D-585 — THE TEXT-SHOWING OPERATORS, and the ONE predicate built on them.
 *
 * ISO 32000-1 §9.4.3 names four operators that show text: `Tj`, `TJ`, `'` and
 * `"`. Every glyph on a page is painted by one of them; `BT`/`ET` only open and
 * close a text object, `Tf` only selects a font, and a font in the resource
 * dictionary is only AVAILABLE. So "does this page bear text" is "does one of
 * these four run", and it is asked in exactly one place, here, by both of its
 * askers: Tier 1's `no_text_layer` marker above, and the OCR member's renderer
 * (`pdf-worker/src/pagepixels.mjs`, `analyzePage`, which imports it). Before
 * D-585 the two asked two different wrong questions — "is a font declared" and
 * "is a text object opened" — and a scan with an inherited font dictionary and
 * an empty `BT … ET` failed both, independently (M-157: 161 of `0201-cafr-2002`'s
 * 175 pages). One predicate is what keeps them from disagreeing again. */
export const TEXT_SHOWING_OPERATORS = Object.freeze(["Tj", "TJ", "'", '"']);
const TEXT_SHOWING = new Set(TEXT_SHOWING_OPERATORS);

/** Does this page SHOW text — run a text-showing operator — anywhere it paints:
 *  its own content streams and every Form XObject it draws, however deep (to
 *  `FORM_DEPTH_LIMIT`)? `true` or `false` is MEASURED; `null` is UNDETERMINED
 *  and says so — a content stream or a drawn form that could not be decoded or
 *  resolved, a form nested past the limit or in a cycle. A caller must not read
 *  `null` as `false`: the part this reader could not see is exactly the part
 *  that might have held the text. The tokenizer skips inline-image data, so a
 *  sample byte run that happens to spell `Tj` is not an operator. */
export async function pageShowsText(doc, pageMap) {
  if (!pageMap) return null;
  const top = await decodeContentStreams(doc, pageMap.Contents);
  if (top.text == null) return null;
  let unread = false;
  const walk = async (content, resources, depth, formChain) => {
    const xobjects = resources ? doc.dictOf(resources.XObject) : null;
    let lastName = null;
    for (const tk of tokenizeContent(content, { inlineImages: true })) {
      if (tk.t === "name") { lastName = tk.v; continue; }
      if (tk.t !== "op") continue;
      if (TEXT_SHOWING.has(tk.v)) return true;
      if (tk.v !== "Do") continue;
      const ref = lastName != null && xobjects ? xobjects[lastName] : null;
      const st = ref ? doc.resolve(ref) : null;
      if (!st || st.t !== "stream") { unread = true; continue; }
      if (nameOf(doc, st.dict.Subtype) !== "Form") continue;
      const key = ref && ref.t === "ref" ? ref.n : null;
      if (depth >= FORM_DEPTH_LIMIT || (key != null && formChain.includes(key))) { unread = true; continue; }
      const data = await doc.streamDecoded(st);
      if (!data) { unread = true; continue; }
      const formRes = doc.dictOf(st.dict.Resources) || resources;
      if (await walk(LATIN1.decode(data), formRes, depth + 1,
                     key != null ? [...formChain, key] : formChain)) return true;
    }
    return false;
  };
  if (await walk(top.text, pageResources(doc, pageMap), 0, [])) return true;
  return unread ? null : false;
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
  /* D-251: WHO MADE THIS LAYER. Read ONCE, from the file's own /Info, and
     carried on the text shape rather than on the document — because the claim
     it bounds is a claim about the TEXT, and a consumer holding the text is the
     one that must not read it as authored. It rides the encrypted early return
     too: that path yields no text and still has something true to say about
     what could not be read. */
  const producer = readProducer(doc);
  // Encrypted: Tier 1 cannot decode ciphertext content streams, so it decodes
  // NOTHING. Say so with ONE document-level marker naming the cause, rather than
  // attempting every page and emitting a swarm of undecodable notes (CPDF-5).
  // The plane escalates on this to the pdf-worker (I6), which decrypts it.
  if (doc.isEncrypted()) {
    doc.note("encrypted");
    const marker = { page: null, reason: "encrypted", font: null, codes: "", count: 0 };
    return { document: "", pages: [], undetermined: [marker],
             counts: { chars: 0, undetermined: 1 }, producer };
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
    producer,
  };
}

/* ------------------------------------------------------------------ *
 * CPDF-18 — IMAGES AS CONTENT (EXTRACTION-BREADTH §3.3 item 2, §7 row 4)
 * ------------------------------------------------------------------ *
 *
 * WHAT THIS EMITS. For every image a page PAINTS, the IC-1 `image` reference in
 * its PDF form, the shape IC-124 designed and IC-125's grammar already admits:
 *
 *   { kind:"image", ref:"an image on page <N+1>", page, rect:[x0,y0,x1,y1],
 *     mime, name, inline, width, height, filters, axis_aligned }
 *
 * `page` is 0-based (I2's own numbering) and `rect` is in the page's DEFAULT
 * USER SPACE, in points, lower-left then upper-right — the SAME space and the
 * SAME order as an annotation's /Rect, which is what `pdf-page`'s rect already
 * carries, so one rectangle means one place whichever arm names it (§3.2: "the
 * same fields as pdf-page").
 *
 * HOW THE RECTANGLE IS KNOWN, AND WHY IT IS NOT A GUESS. An image XObject paints
 * the unit square through the current transformation matrix; that is the PDF's
 * own definition of where an image goes (ISO 32000-1 §8.9.4). So the walk below
 * is a small interpreter of exactly the operators that move the CTM — `q`, `Q`,
 * `cm` — and of `Do` (and an inline image's `EI`), descending into Form XObjects
 * through their /Matrix and their own /Resources. It interprets nothing else,
 * and it is deliberately a SECOND walk rather than a change to the text
 * interpreter above, whose output is measured and pinned and must stay
 * byte-identical (the tokenizer's inline-image option is OFF for the text walk).
 *
 * WHAT THE RECTANGLE IS NOT, stated because a consumer would otherwise assume
 * it: it is the image's PAINTED extent, not what survives clipping, and not a
 * claim that nothing is drawn over it. A placement that rotates or skews the
 * image yields its axis-aligned bounding box and says `axis_aligned:false`
 * rather than pretending the box is the image's outline.
 *
 * THE ABSENCE RULE IS IC-124's, not the three older levels': `images` is NULL
 * with `imagesWhy` from every branch that did not walk (an encrypted document, a
 * content stream this reader cannot decode, a walk that threw), and an EMPTY
 * list is a MEASURED ZERO — every page's content was interpreted and none
 * painted an image. Never a partial list: one page that could not be walked
 * makes the whole list null, because a list missing a page reads downstream as
 * "that page has no images", which is the finding this reader is not entitled to.
 *
 * `mime` IS SET ONLY WHERE THE STREAM'S BYTES ARE A FILE OF THAT TYPE — a
 * DCTDecode stream is a JPEG and a JPXDecode stream is a JPEG 2000 codestream.
 * Every other image is SAMPLES, not a file, and its `mime` is null by meaning;
 * `filters` names what it is instead. An invented `image/png` for raw samples
 * would describe a file nobody made.
 *
 * `name` is the XObject's resource name on the page, for tracing; like an office
 * member's file name it is a producer's filing choice and it is NOT the address.
 * The address is page + rect (the canonical extent `canonicalExtent` takes).
 */

const IMAGE_FILE_MIME = Object.freeze({
  DCTDecode: "image/jpeg", DCT: "image/jpeg", JPXDecode: "image/jp2",
});
const FORM_DEPTH_LIMIT = 8;

/** Round a coordinate to 1/1000 pt so float noise in a composed matrix does
 *  not give one placement two addresses. -0 is written 0. */
const r3 = (v) => { const x = Math.round(v * 1000) / 1000; return x === 0 ? 0 : x; };

/** The IC-1 `image` reference for a PDF page. Its `ref` is EXACTLY the human
 *  form `describeExtent` derives for the same address (IC-1's parity rule —
 *  pinned in `cpdf18-pdf-images.test.mjs`). */
export function pdfImageRef(page, rect, extra = {}) {
  return { kind: "image", ref: `an image on page ${page + 1}`, page, rect, ...extra };
}

/** CTM composition: `cm` sets CTM' = M x CTM (row-vector convention). */
function mulMatrix(m, c) {
  return [
    m[0] * c[0] + m[1] * c[2], m[0] * c[1] + m[1] * c[3],
    m[2] * c[0] + m[3] * c[2], m[2] * c[1] + m[3] * c[3],
    m[4] * c[0] + m[5] * c[2] + c[4], m[4] * c[1] + m[5] * c[3] + c[5],
  ];
}

/** The unit square through `ctm`, as an axis-aligned [x0,y0,x1,y1]. */
function unitSquareRect(ctm) {
  const pts = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) =>
    [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [r3(Math.min(...xs)), r3(Math.min(...ys)), r3(Math.max(...xs)), r3(Math.max(...ys))];
}

function matrixOf(doc, v) {
  const a = doc.resolve(v);
  if (!a || a.t !== "arr" || a.items.length !== 6) return null;
  const n = a.items.map((x) => doc.resolve(x));
  return n.every((x) => typeof x === "number" && Number.isFinite(x)) ? n : null;
}

function imageFilters(doc, dict) {
  const f = doc.resolve(dict.Filter);
  if (!f) return [];
  if (f.t === "name") return [f.v];
  if (f.t === "arr") return f.items.map((x) => nameOf(doc, x)).filter(Boolean);
  return [];
}

/** Decode a list of content streams, or say which one could not be. */
async function decodeContentStreams(doc, contents) {
  const c = doc.resolve(contents);
  if (!c) return { text: "" };
  const streams = c.t === "arr" ? c.items.map((x) => doc.resolve(x)) : [c];
  const parts = [];
  for (const st of streams) {
    if (!st || st.t !== "stream") continue;
    const data = await doc.streamDecoded(st);
    if (!data) return { text: null };
    parts.push(LATIN1.decode(data));
  }
  return { text: parts.join("\n") };
}

/**
 * Every image one page PAINTS, in painting order, with its rectangle.
 * Returns `{ images:[placement…], why:null }` or `{ images:null, why }`.
 * A placement carries `_stream` (the image XObject's stream object, or null for
 * an inline image) and `_ctm` (the matrix it was painted through) as
 * NON-ENUMERABLE properties, so the I2 output never holds a parser object while `pdf-worker`'s crop can still find the bytes it names.
 */
export async function pdfPageImages(doc, pageIdx) {
  const order = doc._pageOrder || [];
  const pageMap = pageIdx >= 0 && pageIdx < order.length ? doc.dictOf({ t: "ref", n: order[pageIdx] }) : null;
  if (!pageMap) return { images: null, why: `page_unreadable:${pageIdx}` };
  const top = await decodeContentStreams(doc, pageMap.Contents);
  if (top.text == null) return { images: null, why: `content_stream_undecodable:page ${pageIdx}` };

  const images = [];
  const walk = async (content, resources, ctm0, depth, formChain) => {
    const xobjects = resources ? doc.dictOf(resources.XObject) : null;
    const toks = tokenizeContent(content, { inlineImages: true });
    let ctm = ctm0;
    const saved = [];
    const operands = [];
    for (const tk of toks) {
      if (tk.t !== "op") { operands.push(tk); continue; }
      switch (tk.v) {
        case "q": saved.push(ctm); break;
        case "Q": if (saved.length) ctm = saved.pop(); break;
        case "cm": {
          const nums = operands.filter((o) => o.t === "num").slice(-6).map((o) => o.v);
          if (nums.length === 6) ctm = mulMatrix(nums, ctm);
          break;
        }
        case "Do": {
          const nameTok = [...operands].reverse().find((o) => o.t === "name");
          const ref = nameTok && xobjects ? xobjects[nameTok.v] : null;
          const st = ref ? doc.resolve(ref) : null;
          /* A `Do` naming nothing this page can resolve may have painted an
             image; reporting the page without it would be the partial list the
             absence rule forbids, so the page is UNWALKABLE, by name. */
          if (!st || st.t !== "stream")
            throw new Error(`xobject_unresolvable:page ${pageIdx}:${nameTok ? nameTok.v : "?"}`);
          const sub = nameOf(doc, st.dict.Subtype);
          if (sub === "Image") {
            const filters = imageFilters(doc, st.dict);
            const last = filters[filters.length - 1] || null;
            const placement = pdfImageRef(pageIdx, unitSquareRect(ctm), {
              mime: IMAGE_FILE_MIME[last] ?? null,
              name: nameTok.v,
              inline: false,
              width: typeof doc.resolve(st.dict.Width) === "number" ? doc.resolve(st.dict.Width) : null,
              height: typeof doc.resolve(st.dict.Height) === "number" ? doc.resolve(st.dict.Height) : null,
              filters,
              axis_aligned: ctm[1] === 0 && ctm[2] === 0,
            });
            Object.defineProperty(placement, "_stream", { value: st, enumerable: false });
            Object.defineProperty(placement, "_ctm", { value: ctm, enumerable: false });
            images.push(placement);
          } else if (sub === "Form") {
            const key = ref && ref.t === "ref" ? ref.n : null;
            if (depth >= FORM_DEPTH_LIMIT || (key != null && formChain.includes(key))) {
              throw new Error(`form_nesting_unwalkable:page ${pageIdx}`);
            }
            const data = await doc.streamDecoded(st);
            if (!data) throw new Error(`form_stream_undecodable:page ${pageIdx}`);
            const m = matrixOf(doc, st.dict.Matrix) || [1, 0, 0, 1, 0, 0];
            const formRes = doc.dictOf(st.dict.Resources) || resources;
            await walk(LATIN1.decode(data), formRes, mulMatrix(m, ctm), depth + 1,
                       key != null ? [...formChain, key] : formChain);
          }
          break;
        }
        case "EI": {
          /* An inline image paints the unit square exactly as an XObject does.
             Its bytes live inside the content stream and nothing downstream
             extracts them yet, so it is REPORTED (it is on the page and a
             reader asking "what images are here" must be told) with no name
             and no file type, and `inline:true` says why. */
          const placement = pdfImageRef(pageIdx, unitSquareRect(ctm), {
            mime: null, name: null, inline: true, width: null, height: null,
            filters: [], axis_aligned: ctm[1] === 0 && ctm[2] === 0,
          });
          Object.defineProperty(placement, "_stream", { value: null, enumerable: false });
          Object.defineProperty(placement, "_ctm", { value: ctm, enumerable: false });
          images.push(placement);
          break;
        }
        default: break;
      }
      operands.length = 0;
    }
  };
  try {
    await walk(top.text, pageResources(doc, pageMap), [1, 0, 0, 1, 0, 0], 0, []);
  } catch (e) {
    return { images: null, why: String(e && e.message || e).slice(0, 120) };
  }
  return { images, why: null };
}

/** Every page's images, or NULL with the reason — never a partial list. */
async function extractImages(doc, pageOrder) {
  if (doc.isEncrypted()) return { images: null, why: "encrypted" };
  const all = [];
  for (let idx = 0; idx < pageOrder.length; idx++) {
    const got = await pdfPageImages(doc, idx);
    if (!got.images) return { images: null, why: got.why };
    for (const im of got.images) all.push(im);
  }
  return { images: all, why: null };
}

/* ------------------------------------------------------------------ *
 * D-627 — A PAGE WHOSE CONTENT IS A PAINTED IMAGE, WHILE ITS TEXT IS A FOLIO
 * ------------------------------------------------------------------ *
 *
 * BOB #35, 2026-09-25 05:50Z: TWO FACTS, TWO MARKERS. D-608 made tier 1 read
 * text inside Form XObjects, so a page that paints an image of a table and
 * draws its three-digit folio through a form now BEARS text, and it rightly
 * carries no `no_text_layer`. A false absence is worse than a missing pass. But
 * that page's CONTENT is still unread: a folio does not read a page an image
 * fills. So this marker says the second fact, and `needsTier3` routes it to OCR
 * exactly as it routes a no-text page. OCR output stays machine-read and never
 * raises a grade (DEC-4).
 *
 * THE TWO FIGURES, both carried on the marker:
 *   - `image_share`: the share of the page's visible area (CropBox inside
 *     MediaBox, inherited) that the page's painted images cover. It is the UNION
 *     of their rectangles (CPDF-18's `images`, which D-420 stores as
 *     `container_extent.images`), each clipped to the page. Overlaps count once,
 *     and so does an image placed partly off the page.
 *   - `glyphs`: the text the page SHOWS. That is its decoded non-whitespace code
 *     points (`glyphCount`'s unit in `textchain.mjs`, counted here so this
 *     module does not import the checks into the pdf-worker's bundle), plus the
 *     `count` of its undetermined markers: characters it shows but tier 1 could
 *     not decode. A folio in an Arial with no /ToUnicode is 3 either way.
 *
 * THE THRESHOLDS ARE MEASURED (M-178), NOT GUESSED. The FY23-25 budget book and
 * M-174's other two documents hold 1,788 pages. Every page there that paints an
 * image and shows at most a folio (1 to 4 glyphs) is an image of content: a
 * table, a certificate, a screenshot, an organisation chart. There are 17 such
 * pages, and their image shares run from 0.1897 to 0.6542. Every other page that
 * paints an image shows at least 22 glyphs. So:
 *   - glyphs <= IMAGE_CONTENT_MAX_GLYPHS (4, the most glyphs on any measured
 *     image-only page), and
 *   - image_share >= IMAGE_CONTENT_MIN_SHARE (0.18, the least share on any
 *     measured image-only page, 0.1897, truncated so the measured page does not
 *     sit on the edge)
 *   reads `image_content_unread`.
 *
 * THE GAPS READ UNDETERMINED, NEVER FORCED EITHER WAY. No measured page falls in
 * two places: glyphs 5 to 21 (IMAGE_CONTENT_TEXT_GLYPHS is 22, the fewest glyphs
 * on any measured page that is not image-only), or a share under 0.18 on a
 * folio-only page. A page in either gap, or one whose page box cannot be read,
 * carries `image_content_undetermined` with its figures. It is NOT routed:
 * routing it would force it to the image side.
 *
 * WHAT THIS CANNOT SEE, stated (M-178): a chart painted as an image under a text
 * TITLE (22 to about 380 glyphs) has the same two figures as a photo page with
 * captions. It reads no marker. The two figures cannot tell those apart, and
 * that is a design gap, not a threshold to tune. With `images` NULL (a walk that
 * did not finish, or an encrypted file) no share can be measured and nothing is
 * said. A page already marked `no_text_layer` is left alone: it is routed.
 * Two consequences downstream were minted, not built here (M-178): when tier 2
 * won a page, its merge replaced the page's markers and this one went with
 * them (D-633, BUILT: `mergeTier2Text` now carries it onto the page); and the
 * tier-3 merge will not fill a routed page whose folio DECODED, because it
 * holds a glyph (D-635). */
export const IMAGE_CONTENT_MAX_GLYPHS = 4;
export const IMAGE_CONTENT_MIN_SHARE = 0.18;
export const IMAGE_CONTENT_TEXT_GLYPHS = 22;

/** A page's visible box, [x0,y0,x1,y1]: CropBox inside MediaBox, each inherited
 *  through /Parent. NULL when there is no readable MediaBox. */
function pageBox(doc, pageMap) {
  const read = (key) => {
    let p = pageMap, d = 0;
    while (p && d++ < 32) {
      const a = doc.resolve(p[key]);
      if (a && a.t === "arr" && a.items.length === 4) {
        const v = a.items.map((x) => doc.resolve(x));
        if (v.every((x) => typeof x === "number" && Number.isFinite(x)))
          return [Math.min(v[0], v[2]), Math.min(v[1], v[3]), Math.max(v[0], v[2]), Math.max(v[1], v[3])];
        return null;
      }
      p = doc.dictOf(p.Parent);
    }
    return null;
  };
  const mb = read("MediaBox");
  if (!mb) return null;
  const cb = read("CropBox");
  return cb ? clipRect(cb, mb) : mb;
}

const clipRect = (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])];
const rectArea = (r) => Math.max(0, r[2] - r[0]) * Math.max(0, r[3] - r[1]);

/** The area the union of axis-aligned rectangles covers, each counted once. */
function unionArea(rects) {
  const rs = rects.filter((r) => rectArea(r) > 0);
  const xs = [...new Set(rs.flatMap((r) => [r[0], r[2]]))].sort((a, b) => a - b);
  let total = 0;
  for (let i = 0; i + 1 < xs.length; i++) {
    const x0 = xs[i], x1 = xs[i + 1];
    const spans = rs.filter((r) => r[0] <= x0 && r[2] >= x1).map((r) => [r[1], r[3]]).sort((a, b) => a[0] - b[0]);
    let covered = 0, lo = null, hi = null;
    for (const [a, b] of spans) {
      if (lo === null || a > hi) { if (lo !== null) covered += hi - lo; lo = a; hi = b; }
      else hi = Math.max(hi, b);
    }
    if (lo !== null) covered += hi - lo;
    total += covered * (x1 - x0);
  }
  return total;
}

/** Add D-627's markers to tier 1's text, in place. `images` is CPDF-18's list. */
function markImageContent(doc, pageOrder, text, images) {
  if (!text || !Array.isArray(text.pages) || !Array.isArray(images)) return;
  let added = 0;
  for (const pg of text.pages) {
    const painted = images.filter((im) => im.page === pg.page);
    if (!painted.length) continue;
    const marks = Array.isArray(pg.undetermined) ? pg.undetermined : [];
    if (marks.some((m) => m && m.reason === "no_text_layer")) continue;
    let decoded = 0;
    for (const ch of typeof pg.text === "string" ? pg.text : "") if (!/\s/u.test(ch)) decoded++;
    const glyphs = decoded + marks.reduce((n, m) => n + (m && Number.isFinite(m.count) ? m.count : 0), 0);
    if (glyphs >= IMAGE_CONTENT_TEXT_GLYPHS) continue;
    const pageMap = doc.dictOf({ t: "ref", n: pageOrder[pg.page] });
    const box = pageMap ? pageBox(doc, pageMap) : null;
    const share = box && rectArea(box) > 0
      ? Math.round(unionArea(painted.map((im) => clipRect(im.rect, box))) / rectArea(box) * 10000) / 10000
      : null;
    const unread = share !== null && share >= IMAGE_CONTENT_MIN_SHARE && glyphs <= IMAGE_CONTENT_MAX_GLYPHS;
    if (share === 0) continue;
    const marker = { page: pg.page, reason: unread ? "image_content_unread" : "image_content_undetermined",
                     font: null, codes: "", count: 0, image_share: share, glyphs };
    pg.undetermined = [...marks, marker];
    added++;
  }
  if (!added) return;
  text.undetermined = [...text.pages.flatMap((p) => p.undetermined || []),
                       ...(text.undetermined || []).filter((m) => m && !Number.isInteger(m.page))];
  text.counts = { ...text.counts, undetermined: text.undetermined.length };
}

/* ------------------------------------------------------------------ *
 * D-665 — EVERY PAINTED IMAGE ABOVE A SIZE FLOOR SAYS ITS CONTENT IS UNREAD
 * ------------------------------------------------------------------ *
 *
 * BOB #35, 2026-09-25 06:25Z: the true statement is per IMAGE, not per page,
 * and it needs no classifier. An image a page paints is content whose text, if
 * it has any, is UNREAD until a pass reads it. That holds for a photo as for a
 * chart, so tier 1 says it for every placement above a size floor without
 * deciding what the image depicts. The marker is `image_unread`, count 0 (it is
 * not an undecoded character), with the placement's `rect` exactly as CPDF-18
 * emits it (so it names the same `image {page, rect}` reference) and its
 * `area_share`: the part of the rect inside the page's visible box, over the
 * box's area, rounded to 4 places. With no readable page box the share is NULL
 * and the image is still marked: that it was painted is known, its size is not.
 *
 * THE FLOOR IS MEASURED (M-182), NOT GUESSED. Over the 1,104 placements the
 * three held documents paint (1,788 pages), 781 are 12x12-pixel bullets about
 * 5.5 points square, with shares of at most 0.0000624. The smallest other
 * placement, a 68x56-point photo, has 0.0079. Every floor between the two gives
 * the same split. 0.001 sits inside that gap, nearer the bullets, so an image
 * smaller than any measured one is stated rather than hidden.
 *
 * WHAT THIS DOES NOT DO: route. OCR is a cost question, and D-665 measured the
 * two signals BOB named (the image's pixels against the page's text area, and
 * glyph density outside the painted rects) over M-178's 49 classified pages.
 * Neither separates a chart painted under a text title from a photo page, so
 * `image_unread` is NOT in the tier-3 reasons and routes nothing. Only D-627's
 * folio pages are routed. The marker says what is true in the meantime. */
export const IMAGE_UNREAD_MIN_SHARE = 0.001;

/** Add D-665's per-image markers to tier 1's text, in place. `images` is CPDF-18's list. */
function markImagesUnread(doc, pageOrder, text, images) {
  if (!text || !Array.isArray(text.pages) || !Array.isArray(images)) return;
  let added = 0;
  for (const pg of text.pages) {
    const painted = images.filter((im) => im.page === pg.page);
    if (!painted.length) continue;
    const pageMap = doc.dictOf({ t: "ref", n: pageOrder[pg.page] });
    const box = pageMap ? pageBox(doc, pageMap) : null;
    const boxArea = box ? rectArea(box) : 0;
    const marks = [];
    for (const im of painted) {
      const raw = boxArea > 0 ? rectArea(clipRect(im.rect, box)) / boxArea : null;
      if (raw !== null && raw < IMAGE_UNREAD_MIN_SHARE) continue;
      marks.push({ page: pg.page, reason: "image_unread", font: null, codes: "", count: 0,
                   rect: im.rect, area_share: raw === null ? null : Math.round(raw * 10000) / 10000 });
    }
    if (!marks.length) continue;
    pg.undetermined = [...(Array.isArray(pg.undetermined) ? pg.undetermined : []), ...marks];
    added += marks.length;
  }
  if (!added) return;
  text.undetermined = [...text.pages.flatMap((p) => p.undetermined || []),
                       ...(text.undetermined || []).filter((m) => m && !Number.isInteger(m.page))];
  text.counts = { ...text.counts, undetermined: text.undetermined.length };
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
 *          undetermined:[…]}], undetermined:[…], counts:{chars,undetermined},
 *          producer:{…} }, where each undetermined marker names the cause (the
 *          font) rather than guessing an undecodable run into text. This is the
 *          producer side of the proposed I2 (structure -> framework).
 *
 *          `text.producer` (D-251, IC-58) is WHO MADE THE TEXT LAYER, read from
 *          the trailer's /Info: `{producer, creator, determination:"ocr"|
 *          "undetermined", ocr:{engine,field,marker}|null, why}`. There is no
 *          "authored" determination and there must never be one — see the D-251
 *          block above.
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

  /* CPDF-18: the images each page PAINTS, as IC-1 `image {page, rect}`
     references. TOP-LEVEL on the structure object rather than on `text`,
     because the pdf-worker (I6) REPLACES `text` with its Tier-2 decode and an
     image list riding there would vanish on exactly the documents Tier 2
     reads. NULL with `imagesWhy` when not walked; an empty list is a zero. */
  const imgs = await extractImages(doc, pageOrder);
  /* D-627: a page an image fills while its text is a folio says so (see above). */
  if (imgs.images) markImageContent(doc, pageOrder, text, imgs.images);
  /* D-665: and every painted image above the floor says its content is unread. */
  if (imgs.images) markImagesUnread(doc, pageOrder, text, imgs.images);

  return {
    ok: true,
    container: "pdf",
    version: sig[1],
    pages: doc.pageCount,
    links,
    counts,
    text,
    images: imgs.images,
    ...(imgs.images ? {} : { imagesWhy: imgs.why }),
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
