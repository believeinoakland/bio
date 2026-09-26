// ../bio-plane/src/subresources.mjs
var SUBRESOURCE_MAX = 8 * 1024 * 1024;
var SUBRESOURCE_BUDGET = 64 * 1024 * 1024;
var LINK_TYPES = ["anchor", "intra", "deferred", "refused"];

// ../bio-plane/src/pdfstructure.mjs
var PDF_LINK_TYPES = [...LINK_TYPES, "undetermined"];
var LATIN1 = new TextDecoder("latin1");
function isWhitespace(c) {
  return c === 0 || c === 9 || c === 10 || c === 12 || c === 13 || c === 32;
}
function isDelimiter(c) {
  return c === 40 || c === 41 || c === 60 || c === 62 || c === 91 || c === 93 || c === 123 || c === 125 || c === 47 || c === 37;
}
async function inflate(u8) {
  try {
    return { data: await inflateWhole(u8, "deflate"), trailing: 0 };
  } catch {
    const kept = await inflateWithTrailing(u8);
    if (kept) return kept;
    try {
      return { data: await inflateWhole(u8, "deflate-raw"), trailing: 0 };
    } catch {
      return null;
    }
  }
}
async function inflateWhole(u8, format) {
  const out = new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream(format)));
  return new Uint8Array(await out.arrayBuffer());
}
async function inflateWithTrailing(u8) {
  if (u8.length < 6 || (u8[0] & 15) !== 8 || (u8[0] << 8 | u8[1]) % 31 !== 0) return null;
  const chunks = [];
  let total = 0;
  try {
    const reader = new Blob([u8]).stream().pipeThrough(new DecompressionStream("deflate")).getReader();
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) return null;
      chunks.push(value);
      total += value.length;
    }
  } catch {
  }
  const data = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    data.set(c, off);
    off += c.length;
  }
  const sum = adler32(data);
  const want = [sum >>> 24 & 255, sum >>> 16 & 255, sum >>> 8 & 255, sum & 255];
  for (let i = 2; i + 4 < u8.length; i++) {
    if (u8[i] !== want[0] || u8[i + 1] !== want[1] || u8[i + 2] !== want[2] || u8[i + 3] !== want[3]) continue;
    const end = i + 4;
    try {
      const again = await inflateWhole(u8.subarray(0, end), "deflate");
      if (again.length === data.length && again.every((b, k) => b === data[k])) {
        return { data, trailing: u8.length - end };
      }
    } catch {
    }
  }
  return null;
}
function adler32(u8) {
  let a = 1, b = 0;
  for (let i = 0; i < u8.length; i++) {
    a = (a + u8[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16 | a) >>> 0;
}
function unpredict(data, { predictor = 1, colors = 1, columns = 1, bpc = 8 } = {}) {
  if (predictor < 10) return data;
  const bpp = Math.max(1, Math.ceil(colors * bpc / 8));
  const rowLen = Math.ceil(colors * bpc * columns / 8);
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
        case 0:
          break;
        case 1:
          v = v + a & 255;
          break;
        case 2:
          v = v + b & 255;
          break;
        case 3:
          v = v + (a + b >> 1) & 255;
          break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) & 255;
          break;
        }
        default:
          break;
      }
      cur[i] = v;
    }
    prev = cur;
  }
  return out;
}
function parseValue(buf, s, pos) {
  pos = skipWs(s, pos);
  if (pos >= s.length) return null;
  const c = s.charCodeAt(pos);
  if (c === 47) return parseName(s, pos);
  if (c === 40) return parseLiteralString(s, pos);
  if (c === 60 && s.charCodeAt(pos + 1) === 60)
    return parseDict(buf, s, pos);
  if (c === 60) return parseHexString(s, pos);
  if (c === 91) return parseArray(buf, s, pos);
  if (s.startsWith("true", pos)) return { value: true, pos: pos + 4 };
  if (s.startsWith("false", pos)) return { value: false, pos: pos + 5 };
  if (s.startsWith("null", pos)) return { value: null, pos: pos + 4 };
  if (c === 43 || c === 45 || c === 46 || c >= 48 && c <= 57) {
    const ref = tryParseRef(s, pos);
    if (ref) return ref;
    return parseNumber(s, pos);
  }
  return null;
}
function skipWs(s, pos) {
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c === 37) {
      while (pos < s.length && s.charCodeAt(pos) !== 10 && s.charCodeAt(pos) !== 13) pos++;
    } else if (isWhitespace(c)) {
      pos++;
    } else break;
  }
  return pos;
}
function parseName(s, pos) {
  pos++;
  let out = "";
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (isWhitespace(c) || isDelimiter(c)) break;
    if (c === 35 && pos + 2 < s.length) {
      const h = parseInt(s.substr(pos + 1, 2), 16);
      if (!Number.isNaN(h)) {
        out += String.fromCharCode(h);
        pos += 3;
        continue;
      }
    }
    out += s[pos];
    pos++;
  }
  return { value: { t: "name", v: out }, pos };
}
function parseNumber(s, pos) {
  const start = pos;
  if (s.charCodeAt(pos) === 43 || s.charCodeAt(pos) === 45) pos++;
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c >= 48 && c <= 57 || c === 46) pos++;
    else break;
  }
  const n = parseFloat(s.slice(start, pos));
  return { value: Number.isNaN(n) ? 0 : n, pos };
}
function tryParseRef(s, pos) {
  const m = /^(\d+)\s+(\d+)\s+R(?![a-zA-Z0-9])/.exec(s.slice(pos, pos + 32));
  if (!m) return null;
  return { value: { t: "ref", n: parseInt(m[1], 10), g: parseInt(m[2], 10) }, pos: pos + m[0].length };
}
function parseLiteralString(s, pos) {
  pos++;
  let out = "", depth = 1;
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c === 92) {
      const n = s[pos + 1];
      const map = { n: "\n", r: "\r", t: "	", b: "\b", f: "\f", "(": "(", ")": ")", "\\": "\\" };
      if (n in map) {
        out += map[n];
        pos += 2;
        continue;
      }
      if (n >= "0" && n <= "7") {
        let oct = "";
        let p = pos + 1;
        while (p < s.length && oct.length < 3 && s[p] >= "0" && s[p] <= "7") {
          oct += s[p];
          p++;
        }
        out += String.fromCharCode(parseInt(oct, 8) & 255);
        pos = p;
        continue;
      }
      pos += 2;
      continue;
    }
    if (c === 40) {
      depth++;
      out += "(";
      pos++;
      continue;
    }
    if (c === 41) {
      depth--;
      if (depth === 0) {
        pos++;
        break;
      }
      out += ")";
      pos++;
      continue;
    }
    out += s[pos];
    pos++;
  }
  return { value: { t: "str", v: decodePdfText(out) }, pos };
}
function parseHexString(s, pos) {
  pos++;
  let hex = "";
  while (pos < s.length && s.charCodeAt(pos) !== 62) {
    const c = s[pos];
    if (/[0-9a-fA-F]/.test(c)) hex += c;
    pos++;
  }
  pos++;
  if (hex.length % 2) hex += "0";
  let raw = "";
  for (let i = 0; i < hex.length; i += 2) raw += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return { value: { t: "str", v: decodePdfText(raw) }, pos };
}
function decodePdfText(raw) {
  if (raw.charCodeAt(0) === 254 && raw.charCodeAt(1) === 255) {
    let out = "";
    for (let i = 2; i + 1 < raw.length; i += 2)
      out += String.fromCharCode(raw.charCodeAt(i) << 8 | raw.charCodeAt(i + 1));
    return out;
  }
  return raw;
}
function parseArray(buf, s, pos) {
  pos++;
  const items = [];
  while (true) {
    pos = skipWs(s, pos);
    if (pos >= s.length || s.charCodeAt(pos) === 93) {
      pos++;
      break;
    }
    const r = parseValue(buf, s, pos);
    if (!r) {
      pos++;
      continue;
    }
    items.push(r.value);
    pos = r.pos;
  }
  return { value: { t: "arr", items }, pos };
}
function parseDict(buf, s, pos) {
  pos += 2;
  const map = /* @__PURE__ */ Object.create(null);
  while (true) {
    pos = skipWs(s, pos);
    if (pos >= s.length) break;
    if (s.charCodeAt(pos) === 62 && s.charCodeAt(pos + 1) === 62) {
      pos += 2;
      break;
    }
    if (s.charCodeAt(pos) !== 47) {
      pos++;
      continue;
    }
    const key = parseName(s, pos);
    pos = key.pos;
    const val = parseValue(buf, s, pos);
    if (!val) break;
    map[key.value.v] = val.value;
    pos = val.pos;
  }
  const after = skipWs(s, pos);
  if (s.startsWith("stream", after)) {
    let p = after + 6;
    if (s.charCodeAt(p) === 13) p++;
    if (s.charCodeAt(p) === 10) p++;
    return { value: { t: "stream", dict: map, start: p }, pos: p, streamPending: true };
  }
  return { value: { t: "dict", map }, pos };
}
var PdfDoc = class {
  constructor(bytes) {
    this.bytes = bytes;
    this.s = LATIN1.decode(bytes);
    this.objects = /* @__PURE__ */ new Map();
    this.pageIndexByObj = /* @__PURE__ */ new Map();
    this._pageOrder = [];
    this.pageCount = 0;
    this.root = null;
    this.notes = [];
    this._trailingNoted = /* @__PURE__ */ new WeakSet();
  }
  /** The resolved dict of the page at 0-based `pageIdx` in page order, or null
   *  (R31). */
  pageDict(pageIdx) {
    if (!Number.isInteger(pageIdx) || pageIdx < 0 || pageIdx >= this.pageCount) return null;
    return this.dictOf({ t: "ref", n: this._pageOrder[pageIdx] });
  }
  note(msg) {
    this.notes.push(msg);
  }
  /** Scan every top-level `N G obj` in the file. Later definitions win, which
   *  matches incremental-update semantics without parsing any xref. */
  scanTopLevel() {
    const s = this.s;
    const re = /(\d+)\s+(\d+)\s+obj\b/g;
    let m;
    while (m = re.exec(s)) {
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
    if (v && v.t === "ref") return null;
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
    if (this.s.charCodeAt(e - 1) === 10) e--;
    if (this.s.charCodeAt(e - 1) === 13) e--;
    return e;
  }
  /** Decompress a stream's bytes if its filter chain is (Flate). Returns null
   *  for anything else, which the callers treat as "cannot resolve" -> the doc
   *  degrades to undetermined rather than crashing. */
  async streamDecoded(streamObj) {
    const raw = this.streamRawBytes(streamObj);
    if (!raw) return null;
    const filter = this.resolve(streamObj.dict.Filter);
    const names = !filter ? [] : filter.t === "name" ? [filter.v] : filter.t === "arr" ? filter.items.map((f) => f && f.t === "name" ? f.v : null) : [];
    if (names.length === 0) return raw;
    if (!names.every((n) => n === "FlateDecode" || n === "Fl")) return null;
    const inflated = await inflate(raw);
    if (!inflated) return null;
    let data = inflated.data;
    if (inflated.trailing > 0 && !this._trailingNoted.has(streamObj)) {
      this._trailingNoted.add(streamObj);
      this.note(`flate_trailing_bytes:${inflated.trailing}`);
    }
    let parms = this.resolve(streamObj.dict.DecodeParms) || this.resolve(streamObj.dict.DP);
    if (parms && parms.t === "arr") parms = this.resolve(parms.items[parms.items.length - 1]);
    if (parms && parms.t === "dict") {
      const num = (x) => typeof (x = this.resolve(x)) === "number" ? x : void 0;
      const predictor = num(parms.map.Predictor);
      if (predictor && predictor >= 2) {
        data = unpredict(data, {
          predictor,
          colors: num(parms.map.Colors) ?? 1,
          columns: num(parms.map.Columns) ?? 1,
          bpc: num(parms.map.BitsPerComponent) ?? 8
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
      if (!data) {
        this.note("objstm_undecodable");
        continue;
      }
      const inner = LATIN1.decode(data);
      const n = numberVal(this.resolve(st.dict.N));
      const first = numberVal(this.resolve(st.dict.First));
      if (n == null || first == null) continue;
      const header = inner.slice(0, first).trim().split(/\s+/).map(Number);
      for (let i = 0; i < n; i++) {
        const objNum = header[i * 2];
        const off = header[i * 2 + 1];
        if (!Number.isFinite(objNum) || !Number.isFinite(off)) continue;
        if (this.objects.has(objNum)) continue;
        const r = parseValueSafe(inner, first + off);
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
      if (map && map.Type && map.Type.t === "name" && map.Type.v === "Catalog") {
        root = map;
        break;
      }
    }
    this.root = root;
    const walkRef = (num, seen) => {
      const map = this.dictOf({ t: "ref", n: num });
      if (!map) return;
      const type = map.Type;
      if (type && type.t === "name" && type.v === "Page") {
        this._registerPage(num);
        return;
      }
      const kids = this.resolve(map.Kids);
      if (kids && kids.t === "arr") {
        for (const kid of kids.items) {
          if (kid && kid.t === "ref" && !seen.has(kid.n)) {
            seen.add(kid.n);
            walkRef(kid.n, seen);
          }
        }
      }
    };
    if (root && root.Pages && root.Pages.t === "ref") {
      walkRef(root.Pages.n, /* @__PURE__ */ new Set([root.Pages.n]));
    }
    if (this.pageIndexByObj.size === 0) {
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
    if (this._encrypted !== void 0) return this._encrypted;
    let enc = false;
    for (const v of this.objects.values()) {
      const map = v && (v.t === "dict" ? v.map : v.t === "stream" ? v.dict : null);
      if (!map) continue;
      const filter = map.Filter;
      const isStandard = filter && filter.t === "name" && filter.v === "Standard";
      const hasRevision = map.R != null && typeof this.resolve(map.R) === "number";
      if (isStandard && hasRevision) {
        enc = true;
        break;
      }
    }
    return this._encrypted = enc;
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
    if (this._info !== void 0) return this._info;
    const cands = [];
    const re = /\btrailer\b/g;
    let m;
    while (m = re.exec(this.s)) {
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
      if (map) return this._info = map;
    }
    return this._info = null;
  }
};
function numberVal(v) {
  return typeof v === "number" ? v : null;
}
function parseValueSafe(s, pos) {
  try {
    return parseValue(null, s, pos);
  } catch {
    return null;
  }
}
var PRODUCER_DETERMINATIONS = Object.freeze(["ocr", "undetermined"]);
var OCR_PRODUCER_MARKERS = Object.freeze([
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
  Object.freeze({ marker: "ocr", re: /(^|[^0-9a-z])ocr([^0-9a-z]|$)/i })
]);
function tokenizeContent(s, opts = {}) {
  const skipInline = opts.inlineImages === true;
  const toks = [];
  let i = 0;
  const n = s.length;
  while (i < n) {
    const c = s.charCodeAt(i);
    if (isWhitespace(c)) {
      i++;
      continue;
    }
    if (c === 37) {
      while (i < n && s.charCodeAt(i) !== 10 && s.charCodeAt(i) !== 13) i++;
      continue;
    }
    if (c === 40) {
      const r = readLiteralBytes(s, i);
      toks.push({ t: "str", bytes: r.bytes });
      i = r.pos;
      continue;
    }
    if (c === 60) {
      if (s.charCodeAt(i + 1) === 60) {
        toks.push({ t: "dict_open" });
        i += 2;
        continue;
      }
      const r = readHexBytes(s, i);
      toks.push({ t: "str", bytes: r.bytes });
      i = r.pos;
      continue;
    }
    if (c === 62 && s.charCodeAt(i + 1) === 62) {
      toks.push({ t: "dict_close" });
      i += 2;
      continue;
    }
    if (c === 91) {
      toks.push({ t: "arr_open" });
      i++;
      continue;
    }
    if (c === 93) {
      toks.push({ t: "arr_close" });
      i++;
      continue;
    }
    if (c === 47) {
      const r = readContentName(s, i);
      toks.push({ t: "name", v: r.v });
      i = r.pos;
      continue;
    }
    if (c === 43 || c === 45 || c === 46 || c >= 48 && c <= 57) {
      const r = readContentNumber(s, i);
      toks.push({ t: "num", v: r.v });
      i = r.pos;
      continue;
    }
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
        const re = /\sEI(?=[\s/[<(]|$)/g;
        re.lastIndex = i + 1;
        const m = re.exec(s);
        i = m ? m.index + 1 : n;
      }
    } else i++;
  }
  return toks;
}
function readLiteralBytes(s, pos) {
  pos++;
  const bytes = [];
  let depth = 1;
  const simple = { 110: 10, 114: 13, 116: 9, 98: 8, 102: 12, 40: 40, 41: 41, 92: 92 };
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c === 92) {
      const nc = s.charCodeAt(pos + 1);
      if (nc in simple) {
        bytes.push(simple[nc]);
        pos += 2;
        continue;
      }
      if (nc >= 48 && nc <= 55) {
        let oct = "", p = pos + 1;
        while (p < s.length && oct.length < 3 && s.charCodeAt(p) >= 48 && s.charCodeAt(p) <= 55) {
          oct += s[p];
          p++;
        }
        bytes.push(parseInt(oct, 8) & 255);
        pos = p;
        continue;
      }
      if (nc === 10) {
        pos += 2;
        continue;
      }
      if (nc === 13) {
        pos += s.charCodeAt(pos + 2) === 10 ? 3 : 2;
        continue;
      }
      bytes.push(nc);
      pos += 2;
      continue;
    }
    if (c === 40) {
      depth++;
      bytes.push(40);
      pos++;
      continue;
    }
    if (c === 41) {
      depth--;
      if (depth === 0) {
        pos++;
        break;
      }
      bytes.push(41);
      pos++;
      continue;
    }
    bytes.push(c);
    pos++;
  }
  return { bytes, pos };
}
function readHexBytes(s, pos) {
  pos++;
  let hex = "";
  while (pos < s.length && s.charCodeAt(pos) !== 62) {
    const ch = s[pos];
    if (/[0-9a-fA-F]/.test(ch)) hex += ch;
    pos++;
  }
  pos++;
  if (hex.length % 2) hex += "0";
  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.substr(i, 2), 16));
  return { bytes, pos };
}
function readContentName(s, pos) {
  pos++;
  let out = "";
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (isWhitespace(c) || isDelimiter(c)) break;
    if (c === 35 && pos + 2 < s.length) {
      const h = parseInt(s.substr(pos + 1, 2), 16);
      if (!Number.isNaN(h)) {
        out += String.fromCharCode(h);
        pos += 3;
        continue;
      }
    }
    out += s[pos];
    pos++;
  }
  return { v: out, pos };
}
function readContentNumber(s, pos) {
  const start = pos;
  if (s.charCodeAt(pos) === 43 || s.charCodeAt(pos) === 45) pos++;
  while (pos < s.length) {
    const c = s.charCodeAt(pos);
    if (c >= 48 && c <= 57 || c === 46) pos++;
    else break;
  }
  const v = parseFloat(s.slice(start, pos));
  return { v: Number.isNaN(v) ? 0 : v, pos };
}
function nameOf(doc, v) {
  v = doc.resolve(v);
  return v && v.t === "name" ? v.v : null;
}
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
var IDENTITY_MATRIX = Object.freeze([1, 0, 0, 1, 0, 0]);
var TEXT_SHOWING_OPERATORS = Object.freeze(["Tj", "TJ", "'", '"']);
var TEXT_SHOWING = new Set(TEXT_SHOWING_OPERATORS);
async function pageShowsText(doc, pageMap) {
  if (!pageMap) return null;
  const top = await decodeContentStreams(doc, pageMap.Contents);
  if (top.text == null) return null;
  let unread = false;
  const walk = async (content, resources, depth, formChain) => {
    const xobjects = resources ? doc.dictOf(resources.XObject) : null;
    let lastName = null;
    for (const tk of tokenizeContent(content, { inlineImages: true })) {
      if (tk.t === "name") {
        lastName = tk.v;
        continue;
      }
      if (tk.t !== "op") continue;
      if (TEXT_SHOWING.has(tk.v)) return true;
      if (tk.v !== "Do") continue;
      const ref = lastName != null && xobjects ? xobjects[lastName] : null;
      const st = ref ? doc.resolve(ref) : null;
      if (!st || st.t !== "stream") {
        unread = true;
        continue;
      }
      if (nameOf(doc, st.dict.Subtype) !== "Form") continue;
      const key = ref && ref.t === "ref" ? ref.n : null;
      if (depth >= FORM_DEPTH_LIMIT || key != null && formChain.includes(key)) {
        unread = true;
        continue;
      }
      const data = await doc.streamDecoded(st);
      if (!data) {
        unread = true;
        continue;
      }
      const formRes = doc.dictOf(st.dict.Resources) || resources;
      if (await walk(
        LATIN1.decode(data),
        formRes,
        depth + 1,
        key != null ? [...formChain, key] : formChain
      )) return true;
    }
    return false;
  };
  if (await walk(top.text, pageResources(doc, pageMap), 0, [])) return true;
  return unread ? null : false;
}
var IMAGE_FILE_MIME = Object.freeze({
  DCTDecode: "image/jpeg",
  DCT: "image/jpeg",
  JPXDecode: "image/jp2"
});
var FORM_DEPTH_LIMIT = 8;
var r3 = (v) => {
  const x = Math.round(v * 1e3) / 1e3;
  return x === 0 ? 0 : x;
};
function pdfImageRef(page, rect, extra = {}) {
  return { kind: "image", ref: `an image on page ${page + 1}`, page, rect, ...extra };
}
function mulMatrix(m, c) {
  return [
    m[0] * c[0] + m[1] * c[2],
    m[0] * c[1] + m[1] * c[3],
    m[2] * c[0] + m[3] * c[2],
    m[2] * c[1] + m[3] * c[3],
    m[4] * c[0] + m[5] * c[2] + c[4],
    m[4] * c[1] + m[5] * c[3] + c[5]
  ];
}
function unitSquareRect(ctm) {
  const pts = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]]);
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
var PLACEMENT_SOURCE = /* @__PURE__ */ new WeakMap();
function imagePlacementSource(placement) {
  if (!placement || typeof placement !== "object") return null;
  const src = PLACEMENT_SOURCE.get(placement);
  return src ? { stream: src.stream, ctm: src.ctm.slice() } : null;
}
async function pdfPageImages(doc, pageIdx) {
  const pageMap = doc.pageDict(pageIdx);
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
      if (tk.t !== "op") {
        operands.push(tk);
        continue;
      }
      switch (tk.v) {
        case "q":
          saved.push(ctm);
          break;
        case "Q":
          if (saved.length) ctm = saved.pop();
          break;
        case "cm": {
          const nums = operands.filter((o) => o.t === "num").slice(-6).map((o) => o.v);
          if (nums.length === 6) ctm = mulMatrix(nums, ctm);
          break;
        }
        case "Do": {
          const nameTok = [...operands].reverse().find((o) => o.t === "name");
          const ref = nameTok && xobjects ? xobjects[nameTok.v] : null;
          const st = ref ? doc.resolve(ref) : null;
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
              axis_aligned: ctm[1] === 0 && ctm[2] === 0
            });
            PLACEMENT_SOURCE.set(placement, { stream: st, ctm });
            images.push(placement);
          } else if (sub === "Form") {
            const key = ref && ref.t === "ref" ? ref.n : null;
            if (depth >= FORM_DEPTH_LIMIT || key != null && formChain.includes(key)) {
              throw new Error(`form_nesting_unwalkable:page ${pageIdx}`);
            }
            const data = await doc.streamDecoded(st);
            if (!data) throw new Error(`form_stream_undecodable:page ${pageIdx}`);
            const m = matrixOf(doc, st.dict.Matrix) || [1, 0, 0, 1, 0, 0];
            const formRes = doc.dictOf(st.dict.Resources) || resources;
            await walk(
              LATIN1.decode(data),
              formRes,
              mulMatrix(m, ctm),
              depth + 1,
              key != null ? [...formChain, key] : formChain
            );
          }
          break;
        }
        case "EI": {
          const placement = pdfImageRef(pageIdx, unitSquareRect(ctm), {
            mime: null,
            name: null,
            inline: true,
            width: null,
            height: null,
            filters: [],
            axis_aligned: ctm[1] === 0 && ctm[2] === 0
          });
          PLACEMENT_SOURCE.set(placement, { stream: null, ctm });
          images.push(placement);
          break;
        }
        default:
          break;
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
async function loadPdf(bytes) {
  const doc = new PdfDoc(bytes);
  doc.scanTopLevel();
  await doc.loadObjectStreams();
  doc.buildPageIndex();
  return doc;
}
async function openPdf(bytes) {
  if (!(bytes instanceof Uint8Array)) return null;
  if (!/%PDF-\d+\.\d+/.test(LATIN1.decode(bytes.subarray(0, 1024)))) return null;
  return loadPdf(bytes);
}

// ../pdf-worker/src/dctdecode.mjs
var DctRefusal = class extends Error {
  constructor(code, detail = {}) {
    super(`${code}${detail.note ? `: ${detail.note}` : ""}`);
    this.code = code;
    this.detail = detail;
  }
};
var SOF_PROCESS = {
  192: "baseline",
  193: "extended-sequential-huffman",
  194: "progressive-huffman",
  195: "lossless-huffman",
  197: "differential-sequential-huffman",
  198: "differential-progressive-huffman",
  199: "differential-lossless-huffman",
  201: "extended-sequential-arithmetic",
  202: "progressive-arithmetic",
  203: "lossless-arithmetic",
  205: "differential-sequential-arithmetic",
  206: "differential-progressive-arithmetic",
  207: "differential-lossless-arithmetic"
};
var DECODED_SOF = /* @__PURE__ */ new Set([192, 193]);
var ZIGZAG = Int32Array.from([
  0,
  1,
  8,
  16,
  9,
  2,
  3,
  10,
  17,
  24,
  32,
  25,
  18,
  11,
  4,
  5,
  12,
  19,
  26,
  33,
  40,
  48,
  41,
  34,
  27,
  20,
  13,
  6,
  7,
  14,
  21,
  28,
  35,
  42,
  49,
  56,
  57,
  50,
  43,
  36,
  29,
  22,
  15,
  23,
  30,
  37,
  44,
  51,
  58,
  59,
  52,
  45,
  38,
  31,
  39,
  46,
  53,
  60,
  61,
  54,
  47,
  55,
  62,
  63
]);
function readJpegHeader(d) {
  if (!(d instanceof Uint8Array) || d.length < 4 || d[0] !== 255 || d[1] !== 216)
    throw new DctRefusal("NOT_A_JPEG", { note: "no SOI" });
  const qt = [];
  const hts = { dc: [], ac: [] };
  let frame = null, jfif = false, adobe = null, restart = 0;
  let p = 2;
  for (; ; ) {
    while (p < d.length && d[p] !== 255) p++;
    while (p < d.length && d[p] === 255) p++;
    if (p >= d.length) throw new DctRefusal("TRUNCATED", { note: "no SOS before the end of the stream" });
    const m = d[p++];
    if (m === 216 || m >= 208 && m <= 215 || m === 1) continue;
    if (m === 217) throw new DctRefusal("TRUNCATED", { note: "EOI before SOS" });
    if (p + 2 > d.length) throw new DctRefusal("TRUNCATED", { note: "marker length past end" });
    const len = d[p] << 8 | d[p + 1];
    const seg = d.subarray(p + 2, p + len);
    if (p + len > d.length) throw new DctRefusal("TRUNCATED", { note: `marker 0x${m.toString(16)} runs past end` });
    if (m in SOF_PROCESS) {
      if (!DECODED_SOF.has(m))
        throw new DctRefusal("UNSUPPORTED_PROCESS", { process: SOF_PROCESS[m], marker: `0x${m.toString(16)}` });
      const precision = seg[0];
      if (precision !== 8)
        throw new DctRefusal("UNSUPPORTED_PRECISION", { precision });
      const height = seg[1] << 8 | seg[2], width = seg[3] << 8 | seg[4], n = seg[5];
      if (!width || !height) throw new DctRefusal("UNSUPPORTED_FRAME", { note: "zero dimension (DNL) is not read", width, height });
      const comps = [];
      for (let i = 0; i < n; i++) {
        const b = 6 + i * 3;
        comps.push({ id: seg[b], h: seg[b + 1] >> 4, v: seg[b + 1] & 15, tq: seg[b + 2] });
      }
      frame = { process: SOF_PROCESS[m], precision, width, height, comps };
    } else if (m === 219) {
      let q = 0;
      while (q < seg.length) {
        const pq = seg[q] >> 4, tq = seg[q] & 15;
        const t = new Int32Array(64);
        for (let i = 0; i < 64; i++) {
          t[ZIGZAG[i]] = pq ? seg[q + 1 + 2 * i] << 8 | seg[q + 2 + 2 * i] : seg[q + 1 + i];
        }
        qt[tq] = t;
        q += 1 + (pq ? 128 : 64);
      }
    } else if (m === 196) {
      let q = 0;
      while (q < seg.length) {
        const tc = seg[q] >> 4, th = seg[q] & 15;
        const counts = seg.subarray(q + 1, q + 17);
        let total = 0;
        for (let i = 0; i < 16; i++) total += counts[i];
        const symbols = seg.subarray(q + 17, q + 17 + total);
        (tc === 0 ? hts.dc : hts.ac)[th] = buildHuffman(counts, symbols);
        q += 17 + total;
      }
    } else if (m === 204) {
      throw new DctRefusal("UNSUPPORTED_PROCESS", { process: "arithmetic-conditioning (DAC)" });
    } else if (m === 222 || m === 223) {
      throw new DctRefusal("UNSUPPORTED_PROCESS", { process: "hierarchical (DHP/EXP)" });
    } else if (m === 221) {
      restart = seg[0] << 8 | seg[1];
    } else if (m === 224) {
      if (seg.length >= 5 && seg[0] === 74 && seg[1] === 70 && seg[2] === 73 && seg[3] === 70 && seg[4] === 0) jfif = true;
    } else if (m === 238) {
      if (seg.length >= 12 && seg[0] === 65 && seg[1] === 100 && seg[2] === 111 && seg[3] === 98 && seg[4] === 101) adobe = { transform: seg[11] };
    } else if (m === 218) {
      if (!frame) throw new DctRefusal("UNSUPPORTED_FRAME", { note: "SOS before SOF" });
      const ns = seg[0];
      const scomps = [];
      for (let i = 0; i < ns; i++) scomps.push({ id: seg[1 + 2 * i], td: seg[2 + 2 * i] >> 4, ta: seg[2 + 2 * i] & 15 });
      return { frame, qt, hts, jfif, adobe, restart, scan: { comps: scomps, dataAt: p + len } };
    }
    p += len;
  }
}
function buildHuffman(counts, symbols) {
  const maxcode = new Int32Array(18).fill(-1);
  const valptr = new Int32Array(17);
  const mincode = new Int32Array(17);
  let code = 0, k = 0;
  for (let l = 1; l <= 16; l++) {
    valptr[l] = k;
    mincode[l] = code;
    code += counts[l - 1];
    k += counts[l - 1];
    maxcode[l] = counts[l - 1] ? code - 1 : -1;
    code <<= 1;
  }
  maxcode[17] = 2147483647;
  const FAST = 9;
  const fast = new Int32Array(1 << FAST).fill(-1);
  code = 0;
  k = 0;
  for (let l = 1; l <= FAST; l++) {
    for (let i = 0; i < counts[l - 1]; i++, k++) {
      const shift = FAST - l;
      for (let j = 0; j < 1 << shift; j++) fast[code << shift | j] = l << 8 | symbols[k];
      code++;
    }
    code <<= 1;
  }
  return { maxcode, valptr, mincode, symbols: Uint8Array.from(symbols), fast, FAST };
}
var Bits = class {
  constructor(d, at) {
    this.d = d;
    this.p = at;
    this.acc = 0;
    this.n = 0;
    this.marker = null;
    this.fed0 = 0;
  }
  fill() {
    while (this.n <= 24) {
      let b = 0;
      if (this.marker === null && this.p < this.d.length) {
        b = this.d[this.p];
        if (b === 255) {
          let q = this.p + 1;
          while (q < this.d.length && this.d[q] === 255) q++;
          const nx = q < this.d.length ? this.d[q] : 217;
          if (nx === 0) {
            this.p = q + 1;
          } else {
            this.marker = nx;
            this.p = q + 1;
            b = 0;
            this.fed0++;
          }
        } else this.p++;
      } else {
        b = 0;
        this.fed0++;
      }
      this.acc = (this.acc << 8 | b) >>> 0;
      this.n += 8;
    }
  }
  bits(k) {
    if (k === 0) return 0;
    if (this.n < k) this.fill();
    this.n -= k;
    return this.acc >>> this.n & (1 << k) - 1;
  }
  peek(k) {
    if (this.n < k) this.fill();
    return this.acc >>> this.n - k & (1 << k) - 1;
  }
  skip(k) {
    this.n -= k;
  }
  decode(h) {
    if (this.n < 16) this.fill();
    const f = h.fast[this.peek(h.FAST)];
    if (f >= 0) {
      this.skip(f >> 8);
      return f & 255;
    }
    let code = this.bits(h.FAST), l = h.FAST;
    for (; ; ) {
      code = code << 1 | this.bits(1);
      l++;
      if (l > 16) throw new DctRefusal("CORRUPT_DATA", { note: "Huffman code longer than 16 bits" });
      if (h.maxcode[l] >= 0 && code <= h.maxcode[l]) return h.symbols[h.valptr[l] + code - h.mincode[l]];
    }
  }
  receiveExtend(s) {
    if (s === 0) return 0;
    const v = this.bits(s);
    return v < 1 << s - 1 ? v - (1 << s) + 1 : v;
  }
  /** Bits handed out that were NOT in the stream — libjpeg's zero-fill past a
   *  marker. Any at all means the data ran out before the decode did. */
  fabricated() {
    return Math.max(0, this.fed0 * 8 - this.n);
  }
  /** Consume the RSTn a restart interval ends on. */
  restart() {
    this.acc = 0;
    this.n = 0;
    this.fed0 = 0;
    if (this.marker === null) {
      let q = this.p;
      while (q < this.d.length && this.d[q] !== 255) q++;
      while (q < this.d.length && this.d[q] === 255) q++;
      if (q < this.d.length) {
        this.marker = this.d[q];
        this.p = q + 1;
      }
    }
    const m = this.marker;
    if (m !== null && m >= 208 && m <= 215) this.marker = null;
    return m;
  }
};
var CONST_BITS = 13;
var PASS1_BITS = 2;
var F_0_298 = 2446;
var F_0_390 = 3196;
var F_0_541 = 4433;
var F_0_765 = 6270;
var F_0_899 = 7373;
var F_1_175 = 9633;
var F_1_501 = 12299;
var F_1_847 = 15137;
var F_1_961 = 16069;
var F_2_053 = 16819;
var F_2_562 = 20995;
var F_3_072 = 25172;
var D1 = CONST_BITS - PASS1_BITS;
var R1 = 1 << D1 - 1;
var D2 = CONST_BITS + PASS1_BITS + 3;
var R2 = 1 << D2 - 1;
var IDCT_LIMIT = (() => {
  const t = new Uint8Array(1024);
  for (let v = 0; v < 1024; v++) {
    const s = v < 512 ? v : v - 1024;
    t[v] = Math.max(0, Math.min(255, s + 128));
  }
  return t;
})();
var WS = new Int32Array(64);
function idctIslow(coef, q, out, o, stride) {
  const ws = WS;
  for (let c = 0; c < 8; c++) {
    const i1 = coef[8 + c], i2 = coef[16 + c], i3 = coef[24 + c], i4 = coef[32 + c], i5 = coef[40 + c], i6 = coef[48 + c], i7 = coef[56 + c];
    if ((i1 | i2 | i3 | i4 | i5 | i6 | i7) === 0) {
      const dc = coef[c] * q[c] << PASS1_BITS;
      for (let r = 0; r < 8; r++) ws[r * 8 + c] = dc;
      continue;
    }
    let z2 = i2 * q[16 + c], z3 = i6 * q[48 + c];
    let z1 = (z2 + z3) * F_0_541;
    let tmp2 = z1 + z3 * -F_1_847;
    let tmp3 = z1 + z2 * F_0_765;
    z2 = coef[c] * q[c];
    z3 = i4 * q[32 + c];
    let tmp0 = (z2 + z3) * 8192, tmp1 = (z2 - z3) * 8192;
    const t10 = tmp0 + tmp3, t13 = tmp0 - tmp3, t11 = tmp1 + tmp2, t12 = tmp1 - tmp2;
    tmp0 = i7 * q[56 + c];
    tmp1 = i5 * q[40 + c];
    tmp2 = i3 * q[24 + c];
    tmp3 = i1 * q[8 + c];
    z1 = tmp0 + tmp3;
    z2 = tmp1 + tmp2;
    z3 = tmp0 + tmp2;
    let z4 = tmp1 + tmp3;
    const z5 = (z3 + z4) * F_1_175;
    tmp0 *= F_0_298;
    tmp1 *= F_2_053;
    tmp2 *= F_3_072;
    tmp3 *= F_1_501;
    z1 *= -F_0_899;
    z2 *= -F_2_562;
    z3 *= -F_1_961;
    z4 *= -F_0_390;
    z3 += z5;
    z4 += z5;
    tmp0 += z1 + z3;
    tmp1 += z2 + z4;
    tmp2 += z2 + z3;
    tmp3 += z1 + z4;
    ws[c] = t10 + tmp3 + R1 >> D1;
    ws[56 + c] = t10 - tmp3 + R1 >> D1;
    ws[8 + c] = t11 + tmp2 + R1 >> D1;
    ws[48 + c] = t11 - tmp2 + R1 >> D1;
    ws[16 + c] = t12 + tmp1 + R1 >> D1;
    ws[40 + c] = t12 - tmp1 + R1 >> D1;
    ws[24 + c] = t13 + tmp0 + R1 >> D1;
    ws[32 + c] = t13 - tmp0 + R1 >> D1;
  }
  const L2 = IDCT_LIMIT;
  for (let r = 0; r < 8; r++) {
    const w = r * 8, d = o + r * stride;
    let z2 = ws[w + 2], z3 = ws[w + 6];
    let z1 = (z2 + z3) * F_0_541;
    let tmp2 = z1 + z3 * -F_1_847;
    let tmp3 = z1 + z2 * F_0_765;
    let tmp0 = (ws[w] + ws[w + 4]) * 8192, tmp1 = (ws[w] - ws[w + 4]) * 8192;
    const t10 = tmp0 + tmp3, t13 = tmp0 - tmp3, t11 = tmp1 + tmp2, t12 = tmp1 - tmp2;
    tmp0 = ws[w + 7];
    tmp1 = ws[w + 5];
    tmp2 = ws[w + 3];
    tmp3 = ws[w + 1];
    z1 = tmp0 + tmp3;
    z2 = tmp1 + tmp2;
    z3 = tmp0 + tmp2;
    let z4 = tmp1 + tmp3;
    const z5 = (z3 + z4) * F_1_175;
    tmp0 *= F_0_298;
    tmp1 *= F_2_053;
    tmp2 *= F_3_072;
    tmp3 *= F_1_501;
    z1 *= -F_0_899;
    z2 *= -F_2_562;
    z3 *= -F_1_961;
    z4 *= -F_0_390;
    z3 += z5;
    z4 += z5;
    tmp0 += z1 + z3;
    tmp1 += z2 + z4;
    tmp2 += z2 + z3;
    tmp3 += z1 + z4;
    out[d] = L2[t10 + tmp3 + R2 >> D2 & 1023];
    out[d + 7] = L2[t10 - tmp3 + R2 >> D2 & 1023];
    out[d + 1] = L2[t11 + tmp2 + R2 >> D2 & 1023];
    out[d + 6] = L2[t11 - tmp2 + R2 >> D2 & 1023];
    out[d + 2] = L2[t12 + tmp1 + R2 >> D2 & 1023];
    out[d + 5] = L2[t12 - tmp1 + R2 >> D2 & 1023];
    out[d + 3] = L2[t13 + tmp0 + R2 >> D2 & 1023];
    out[d + 4] = L2[t13 - tmp0 + R2 >> D2 & 1023];
  }
}
var FIX16 = (x) => Math.floor(x * 65536 + 0.5);
var CR_R = new Int32Array(256);
var CB_B = new Int32Array(256);
var CR_G = new Float64Array(256);
var CB_G = new Float64Array(256);
for (let i = 0, x = -128; i < 256; i++, x++) {
  CR_R[i] = Math.floor((FIX16(1.402) * x + 32768) / 65536);
  CB_B[i] = Math.floor((FIX16(1.772) * x + 32768) / 65536);
  CR_G[i] = -FIX16(0.71414) * x;
  CB_G[i] = -FIX16(0.34414) * x + 32768;
}
var clamp8 = (v) => v < 0 ? 0 : v > 255 ? 255 : v;
function colourTransformOf(h) {
  const ids = h.frame.comps.map((c) => c.id);
  if (h.jfif) return { ycc: true, why: "JFIF" };
  if (h.adobe) return { ycc: h.adobe.transform !== 0, why: `Adobe APP14 transform=${h.adobe.transform}` };
  if (ids[0] === 82 && ids[1] === 71 && ids[2] === 66) return { ycc: false, why: "component ids R,G,B" };
  return { ycc: true, why: "libjpeg's default for three components" };
}
function decodeBaselineJpeg(d, { rotate = 0, expectComps = null, colorTransform = null } = {}) {
  const h = readJpegHeader(d);
  const { frame, qt, hts, scan } = h;
  const nc = frame.comps.length;
  if (nc !== 1 && nc !== 3)
    throw new DctRefusal("UNSUPPORTED_COMPONENTS", { components: nc });
  if (expectComps != null && expectComps !== nc)
    throw new DctRefusal("COMPONENT_MISMATCH", { declared: expectComps, stream: nc });
  let colour = null;
  if (nc === 3) {
    colour = colourTransformOf(h);
    if (colorTransform != null && colorTransform !== 0 !== colour.ycc)
      throw new DctRefusal("COLOR_TRANSFORM_CONFLICT", { pdf: colorTransform, stream: colour });
  }
  if (scan.comps.length !== nc)
    throw new DctRefusal("UNSUPPORTED_PROCESS", { process: "multi-scan sequential", note: `${scan.comps.length} of ${nc} components in the first scan` });
  const hmax = Math.max(...frame.comps.map((c) => c.h)), vmax = Math.max(...frame.comps.map((c) => c.v));
  const sampling = frame.comps.map((c) => `${c.h}x${c.v}`).join(",");
  for (const c of frame.comps) {
    const hx = hmax / c.h, vx = vmax / c.v;
    const ok = (hx === 1 || hx === 2) && (vx === 1 || vx === 2) && Number.isInteger(hx) && Number.isInteger(vx);
    if (!ok || c.h < 1 || c.v < 1) throw new DctRefusal("UNSUPPORTED_SAMPLING", { sampling });
    if (!qt[c.tq]) throw new DctRefusal("CORRUPT_DATA", { note: `quantisation table ${c.tq} missing` });
  }
  const mcux = Math.ceil(frame.width / (8 * hmax)), mcuy = Math.ceil(frame.height / (8 * vmax));
  const planes = frame.comps.map((c, i) => {
    const sc = scan.comps.find((s) => s.id === c.id);
    if (!sc || !hts.dc[sc.td] || !hts.ac[sc.ta]) throw new DctRefusal("CORRUPT_DATA", { note: `Huffman table missing for component ${c.id}` });
    const bw = mcux * c.h, bh = mcuy * c.v;
    return {
      c,
      i,
      dc: hts.dc[sc.td],
      ac: hts.ac[sc.ta],
      q: qt[c.tq],
      pred: 0,
      stride: bw * 8,
      rows: bh * 8,
      data: new Uint8Array(bw * 8 * bh * 8),
      dw: Math.ceil(frame.width * c.h / hmax),
      dh: Math.ceil(frame.height * c.v / vmax)
    };
  });
  const br = new Bits(d, scan.dataAt);
  const coef = new Int32Array(64);
  const decodeBlock = (pl, bx, by) => {
    coef.fill(0);
    const t = br.decode(pl.dc);
    const diff = br.receiveExtend(t);
    pl.pred += diff;
    coef[0] = pl.pred << 16 >> 16;
    for (let k = 1; k < 64; ) {
      const rs = br.decode(pl.ac);
      const r = rs >> 4, s = rs & 15;
      if (s === 0) {
        if (r === 15) {
          k += 16;
          continue;
        }
        break;
      }
      k += r;
      if (k > 63) break;
      coef[ZIGZAG[k]] = br.receiveExtend(s) << 16 >> 16;
      k++;
    }
    idctIslow(coef, pl.q, pl.data, by * 8 * pl.stride + bx * 8, pl.stride);
  };
  const single = nc === 1;
  const totalUnits = single ? Math.ceil(frame.width / 8) * Math.ceil(frame.height / 8) : mcux * mcuy;
  const unitsPerRow = single ? Math.ceil(frame.width / 8) : mcux;
  let restartsLeft = h.restart, rstExpect = 0;
  for (let u = 0; u < totalUnits; u++) {
    if (h.restart) {
      if (restartsLeft === 0) {
        if (br.fabricated())
          throw new DctRefusal("TRUNCATED", { note: "a restart interval's data ended before its last MCU" });
        const m = br.restart();
        if (m !== 208 + rstExpect)
          throw new DctRefusal("CORRUPT_DATA", { note: `expected RST${rstExpect}, saw ${m === null ? "none" : `0x${m.toString(16)}`}` });
        rstExpect = rstExpect + 1 & 7;
        restartsLeft = h.restart;
        for (const pl of planes) pl.pred = 0;
      }
      restartsLeft--;
    }
    const ux = u % unitsPerRow, uy = (u - ux) / unitsPerRow;
    if (single) decodeBlock(planes[0], ux, uy);
    else for (const pl of planes)
      for (let v = 0; v < pl.c.v; v++) for (let hh = 0; hh < pl.c.h; hh++)
        decodeBlock(pl, ux * pl.c.h + hh, uy * pl.c.v + v);
  }
  if (br.fabricated())
    throw new DctRefusal("TRUNCATED", { note: `entropy-coded data ended before the last MCU (${br.fabricated()} bits zero-filled)` });
  const W2 = frame.width, H = frame.height;
  const full = planes.map((pl) => upsample(pl, W2, H, hmax, vmax));
  const deg = ((rotate | 0) % 360 + 360) % 360;
  if (deg % 90) throw new DctRefusal("UNSUPPORTED_ROTATION", { rotate });
  const [W22, H2] = deg === 90 || deg === 270 ? [H, W2] : [W2, H];
  const out = new Uint8Array(W22 * H2 * nc);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W2; x++) {
      let X, Y;
      if (deg === 0) {
        X = x;
        Y = y;
      } else if (deg === 90) {
        X = H - 1 - y;
        Y = x;
      } else if (deg === 180) {
        X = W2 - 1 - x;
        Y = H - 1 - y;
      } else {
        X = y;
        Y = W2 - 1 - x;
      }
      const o = (Y * W22 + X) * nc;
      if (nc === 1) {
        out[o] = full[0].data[y * full[0].stride + x];
        continue;
      }
      const a = full[0].data[y * full[0].stride + x], b = full[1].data[y * full[1].stride + x], c = full[2].data[y * full[2].stride + x];
      if (colour.ycc) {
        out[o] = clamp8(a + CR_R[c]);
        out[o + 1] = clamp8(a + Math.floor((CB_G[b] + CR_G[c]) / 65536));
        out[o + 2] = clamp8(a + CB_B[b]);
      } else {
        out[o] = a;
        out[o + 1] = b;
        out[o + 2] = c;
      }
    }
  }
  return {
    width: W22,
    height: H2,
    comps: nc,
    samples: out,
    source: {
      width: W2,
      height: H,
      process: frame.process,
      sampling,
      restart: h.restart,
      colour: colour ? colour.why + (colour.ycc ? " -> YCbCr" : " -> no transform") : "grey"
    }
  };
}
function upsample(pl, W2, H, hmax, vmax) {
  const hx = hmax / pl.c.h, vx = vmax / pl.c.v;
  if (hx === 1 && vx === 1) return { data: pl.data, stride: pl.stride };
  const { data: src, stride: ss, dw, dh } = pl;
  const row = (y) => (y < 0 ? 0 : y >= dh ? dh - 1 : y) * ss;
  const outW = dw * hx;
  const dst = new Uint8Array(outW * dh * vx);
  if (vx === 1) {
    for (let y = 0; y < dh; y++) {
      const r = row(y), o = y * outW;
      h2v1Row(src, r, dw, dst, o);
    }
  } else if (hx === 1) {
    for (let y = 0; y < dh; y++) {
      const r0 = row(y);
      for (let v = 0; v < 2; v++) {
        const r1 = row(v === 0 ? y - 1 : y + 1), bias = v === 0 ? 1 : 2, o = (2 * y + v) * outW;
        for (let x = 0; x < dw; x++) dst[o + x] = src[r0 + x] * 3 + src[r1 + x] + bias >> 2;
      }
    }
  } else if (dw <= 2) {
    for (let y = 0; y < dh * 2; y++) {
      const r = row(y >> 1), o = y * outW;
      for (let x = 0; x < dw; x++) dst[o + 2 * x] = dst[o + 2 * x + 1] = src[r + x];
    }
  } else {
    for (let y = 0; y < dh; y++) {
      const r0 = row(y);
      for (let v = 0; v < 2; v++) {
        const r1 = row(v === 0 ? y - 1 : y + 1), o = (2 * y + v) * outW;
        let thiscol = src[r0] * 3 + src[r1], nextcol = src[r0 + 1] * 3 + src[r1 + 1], lastcol;
        dst[o] = thiscol * 4 + 8 >> 4;
        dst[o + 1] = thiscol * 3 + nextcol + 7 >> 4;
        let q = o + 2;
        for (let x = 2; x < dw; x++) {
          lastcol = thiscol;
          thiscol = nextcol;
          nextcol = src[r0 + x] * 3 + src[r1 + x];
          dst[q++] = thiscol * 3 + lastcol + 8 >> 4;
          dst[q++] = thiscol * 3 + nextcol + 7 >> 4;
        }
        lastcol = thiscol;
        thiscol = nextcol;
        dst[q++] = thiscol * 3 + lastcol + 8 >> 4;
        dst[q] = thiscol * 4 + 7 >> 4;
      }
    }
  }
  return { data: dst, stride: outW };
}
function h2v1Row(src, r, dw, dst, o) {
  if (dw <= 2) {
    for (let x = 0; x < dw; x++) dst[o + 2 * x] = dst[o + 2 * x + 1] = src[r + x];
    return;
  }
  let v = src[r];
  dst[o] = v;
  dst[o + 1] = v * 3 + src[r + 1] + 2 >> 2;
  let q = o + 2;
  for (let x = 1; x < dw - 1; x++) {
    v = src[r + x] * 3;
    dst[q++] = v + src[r + x - 1] + 1 >> 2;
    dst[q++] = v + src[r + x + 1] + 2 >> 2;
  }
  v = src[r + dw - 1];
  dst[q++] = v * 3 + src[r + dw - 2] + 1 >> 2;
  dst[q] = v;
}

// ../pdf-worker/src/mq.mjs
var QE = [
  [22017, 1, 1, 1],
  [13313, 2, 6, 0],
  [6145, 3, 9, 0],
  [2753, 4, 12, 0],
  [1313, 5, 29, 0],
  [545, 38, 33, 0],
  [22017, 7, 6, 1],
  [21505, 8, 14, 0],
  [18433, 9, 14, 0],
  [14337, 10, 14, 0],
  [12289, 11, 17, 0],
  [9217, 12, 18, 0],
  [7169, 13, 20, 0],
  [5633, 29, 21, 0],
  [22017, 15, 14, 1],
  [21505, 16, 14, 0],
  [20737, 17, 15, 0],
  [18433, 18, 16, 0],
  [14337, 19, 17, 0],
  [13313, 20, 18, 0],
  [12289, 21, 19, 0],
  [10241, 22, 19, 0],
  [9217, 23, 20, 0],
  [8705, 24, 21, 0],
  [7169, 25, 22, 0],
  [6145, 26, 23, 0],
  [5633, 27, 24, 0],
  [5121, 28, 25, 0],
  [4609, 29, 26, 0],
  [4353, 30, 27, 0],
  [2753, 31, 28, 0],
  [2497, 32, 29, 0],
  [2209, 33, 30, 0],
  [1313, 34, 31, 0],
  [1089, 35, 32, 0],
  [673, 36, 33, 0],
  [545, 37, 34, 0],
  [321, 38, 35, 0],
  [273, 39, 36, 0],
  [133, 40, 37, 0],
  [73, 41, 38, 0],
  [37, 42, 39, 0],
  [21, 43, 40, 0],
  [9, 44, 41, 0],
  [5, 45, 42, 0],
  [1, 45, 43, 0],
  [22017, 46, 46, 0]
];
var Q_E = Int32Array.from(QE, (r) => r[0]);
var Q_NMPS = Uint8Array.from(QE, (r) => r[1]);
var Q_NLPS = Uint8Array.from(QE, (r) => r[2]);
var Q_SWITCH = Uint8Array.from(QE, (r) => r[3]);
var mqContexts = (n) => new Uint8Array(n);
var MqDecoder = class {
  /** Decode `data[start, end)`. */
  constructor(data, start = 0, end = data.length) {
    this.d = data;
    this.bp = start;
    this.end = end;
    this.overrun = 0;
    this.C = (start < end ? data[start] : 255) * 65536;
    this.byteIn();
    this.C = this.C << 7 >>> 0;
    this.ct -= 7;
    this.A = 32768;
  }
  byteIn() {
    const d = this.d, bp = this.bp;
    const b = bp < this.end ? d[bp] : 255;
    if (b === 255) {
      const b12 = bp + 1 < this.end ? d[bp + 1] : 255;
      if (b12 > 143) {
        this.C += 65280;
        this.ct = 8;
        if (bp + 1 >= this.end) this.overrun++;
      } else {
        this.bp = bp + 1;
        this.C += b12 << 9;
        this.ct = 7;
      }
    } else {
      this.bp = bp + 1;
      if (bp + 1 < this.end) this.C += d[bp + 1] << 8;
      else {
        this.C += 65280;
        this.overrun++;
      }
      this.ct = 8;
    }
  }
  /** One binary decision in context `cx` of `ctx` (a `mqContexts` array). */
  decode(ctx, cx) {
    const s = ctx[cx];
    let i = s >> 1, mps = s & 1;
    const qe = Q_E[i];
    let a = this.A - qe;
    let d;
    if (this.C / 65536 < qe) {
      if (a < qe) {
        a = qe;
        d = mps;
        i = Q_NMPS[i];
      } else {
        a = qe;
        d = 1 - mps;
        if (Q_SWITCH[i]) mps = d;
        i = Q_NLPS[i];
      }
    } else {
      this.C -= qe * 65536;
      if (a & 32768) {
        this.A = a;
        return mps;
      }
      if (a < qe) {
        d = 1 - mps;
        if (Q_SWITCH[i]) mps = d;
        i = Q_NLPS[i];
      } else {
        d = mps;
        i = Q_NMPS[i];
      }
    }
    do {
      if (this.ct === 0) this.byteIn();
      a <<= 1;
      this.C = this.C << 1 >>> 0;
      this.ct--;
    } while ((a & 32768) === 0);
    this.A = a;
    ctx[cx] = i << 1 | mps;
    return d;
  }
};

// ../pdf-worker/src/jbig2decode.mjs
var Jbig2Refusal = class extends Error {
  constructor(code, detail = {}) {
    super(`${code}${detail.feature ? `: ${detail.feature}` : detail.note ? `: ${detail.note}` : ""}`);
    this.code = code;
    this.detail = detail;
  }
};
var unsupported = (feature, extra = {}) => new Jbig2Refusal("UNSUPPORTED", { feature, ...extra });
var corrupt = (note, extra = {}) => new Jbig2Refusal("CORRUPT", { note, ...extra });
var truncated = (note, extra = {}) => new Jbig2Refusal("TRUNCATED", { note, ...extra });
var JBIG2_REFUSES = Object.freeze({
  "colour extension": "a region's colour-extension flag (T.88 Amendment 3) is set",
  "12 adaptive-template pixels": "a generic region's extended template (EXTTEMPLATE) is used",
  "reused bitmap coding contexts": "a symbol dictionary reuses a previous dictionary's arithmetic contexts",
  "Huffman-coded refinement": "a Huffman-coded symbol dictionary or text region refines its symbols",
  "a necessary extension segment": "an extension segment the decoder must understand and does not",
  "segment type": "a segment type T.88 does not define",
  "several pages": "the stream holds more than one page",
  "no page": "the stream holds no page information segment"
});
var bitmap = (w, h, fill = 0) => {
  if (!(Number.isInteger(w) && Number.isInteger(h)) || w < 0 || h < 0) throw corrupt(`bitmap size ${w}x${h}`);
  if (w * h > 1 << 28) throw corrupt(`bitmap of ${w}x${h} pixels is beyond any page`);
  const d = new Uint8Array(w * h);
  if (fill) d.fill(1);
  return { w, h, d };
};
function compose(dst, src, x, y, op) {
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  const x1 = Math.min(dst.w, x + src.w), y1 = Math.min(dst.h, y + src.h);
  if (x0 >= x1 || y0 >= y1) return;
  const D = dst.d, S2 = src.d;
  for (let yy = y0; yy < y1; yy++) {
    let di = yy * dst.w + x0, si = (yy - y) * src.w + (x0 - x);
    const de = yy * dst.w + x1;
    switch (op) {
      case 0:
        for (; di < de; di++, si++) D[di] |= S2[si];
        break;
      case 1:
        for (; di < de; di++, si++) D[di] &= S2[si];
        break;
      case 2:
        for (; di < de; di++, si++) D[di] ^= S2[si];
        break;
      case 3:
        for (; di < de; di++, si++) D[di] = 1 - (D[di] ^ S2[si]);
        break;
      case 4:
        for (; di < de; di++, si++) D[di] = S2[si];
        break;
      default:
        throw corrupt(`combination operator ${op}`);
    }
  }
}
var Reader = class {
  constructor(d, p = 0, end = d.length) {
    this.d = d;
    this.p = p;
    this.end = end;
  }
  need(n, what) {
    if (this.p + n > this.end) throw truncated(`${what}: ${n} bytes needed, ${this.end - this.p} left`);
  }
  u8(what = "a byte") {
    this.need(1, what);
    return this.d[this.p++];
  }
  u16(what = "a 16-bit field") {
    this.need(2, what);
    const v = this.d[this.p] << 8 | this.d[this.p + 1];
    this.p += 2;
    return v;
  }
  u32(what = "a 32-bit field") {
    this.need(4, what);
    const d = this.d, p = this.p;
    this.p += 4;
    return (d[p] << 24 | d[p + 1] << 16 | d[p + 2] << 8 | d[p + 3]) >>> 0;
  }
  i32(what) {
    return this.u32(what) | 0;
  }
  i8(what) {
    const v = this.u8(what);
    return v > 127 ? v - 256 : v;
  }
};
var OOB = null;
var iaCtx = () => mqContexts(512);
function iaDecode(mq, ctx) {
  let prev = 1;
  const bit = () => {
    const b = mq.decode(ctx, prev);
    prev = prev < 256 ? prev << 1 | b : (prev << 1 | b) & 511 | 256;
    return b;
  };
  const s = bit();
  let n, off;
  if (!bit()) {
    n = 2;
    off = 0;
  } else if (!bit()) {
    n = 4;
    off = 4;
  } else if (!bit()) {
    n = 6;
    off = 20;
  } else if (!bit()) {
    n = 8;
    off = 84;
  } else if (!bit()) {
    n = 12;
    off = 340;
  } else {
    n = 32;
    off = 4436;
  }
  let v = 0;
  for (let i = 0; i < n; i++) v = v * 2 + bit();
  v = Math.min(v + off, 2147483647);
  if (s && v === 0) return OOB;
  return s ? -v : v;
}
function iaidDecode(mq, ctx, len) {
  let prev = 1;
  for (let i = 0; i < len; i++) prev = prev << 1 | mq.decode(ctx, prev);
  return prev - (1 << len);
}
var intOrThrow = (v, what) => {
  if (v === OOB) throw corrupt(`OOB where ${what} is required`);
  return v;
};
var L = (p, r, low, kind = "") => [p, r, low, kind];
var STANDARD_TABLES = {
  1: [L(1, 4, 0), L(2, 8, 16), L(3, 16, 272), L(3, 32, 65808, "high")],
  2: [L(1, 0, 0), L(2, 0, 1), L(3, 0, 2), L(4, 3, 3), L(5, 6, 11), L(6, 32, 75, "high"), L(6, 0, 0, "oob")],
  3: [
    L(8, 8, -256),
    L(1, 0, 0),
    L(2, 0, 1),
    L(3, 0, 2),
    L(4, 3, 3),
    L(5, 6, 11),
    L(8, 32, -257, "low"),
    L(7, 32, 75, "high"),
    L(6, 0, 0, "oob")
  ],
  4: [L(1, 0, 1), L(2, 0, 2), L(3, 0, 3), L(4, 3, 4), L(5, 6, 12), L(5, 32, 76, "high")],
  5: [
    L(7, 8, -255),
    L(1, 0, 1),
    L(2, 0, 2),
    L(3, 0, 3),
    L(4, 3, 4),
    L(5, 6, 12),
    L(7, 32, -256, "low"),
    L(6, 32, 76, "high")
  ],
  6: [
    L(5, 10, -2048),
    L(4, 9, -1024),
    L(4, 8, -512),
    L(4, 7, -256),
    L(5, 6, -128),
    L(5, 5, -64),
    L(4, 5, -32),
    L(2, 7, 0),
    L(3, 7, 128),
    L(3, 8, 256),
    L(4, 9, 512),
    L(4, 10, 1024),
    L(6, 32, -2049, "low"),
    L(6, 32, 2048, "high")
  ],
  7: [
    L(4, 9, -1024),
    L(3, 8, -512),
    L(4, 7, -256),
    L(5, 6, -128),
    L(5, 5, -64),
    L(4, 5, -32),
    L(4, 5, 0),
    L(5, 5, 32),
    L(5, 6, 64),
    L(4, 7, 128),
    L(3, 8, 256),
    L(3, 9, 512),
    L(3, 10, 1024),
    L(5, 32, -1025, "low"),
    L(5, 32, 2048, "high")
  ],
  8: [
    L(8, 3, -15),
    L(9, 1, -7),
    L(8, 1, -5),
    L(9, 0, -3),
    L(7, 0, -2),
    L(4, 0, -1),
    L(2, 1, 0),
    L(5, 0, 2),
    L(6, 0, 3),
    L(3, 4, 4),
    L(6, 1, 20),
    L(4, 4, 22),
    L(4, 5, 38),
    L(5, 6, 70),
    L(5, 7, 134),
    L(6, 7, 262),
    L(7, 8, 390),
    L(6, 10, 646),
    L(9, 32, -16, "low"),
    L(9, 32, 1670, "high"),
    L(2, 0, 0, "oob")
  ],
  9: [
    L(8, 4, -31),
    L(9, 2, -15),
    L(8, 2, -11),
    L(9, 1, -7),
    L(7, 1, -5),
    L(4, 1, -3),
    L(3, 1, -1),
    L(3, 1, 1),
    L(5, 1, 3),
    L(6, 1, 5),
    L(3, 5, 7),
    L(6, 2, 39),
    L(4, 5, 43),
    L(4, 6, 75),
    L(5, 7, 139),
    L(5, 8, 267),
    L(6, 8, 523),
    L(7, 9, 779),
    L(6, 11, 1291),
    L(9, 32, -32, "low"),
    L(9, 32, 3339, "high"),
    L(2, 0, 0, "oob")
  ],
  10: [
    L(7, 4, -21),
    L(8, 0, -5),
    L(7, 0, -4),
    L(5, 0, -3),
    L(2, 2, -2),
    L(5, 0, 2),
    L(6, 0, 3),
    L(7, 0, 4),
    L(8, 0, 5),
    L(2, 6, 6),
    L(5, 5, 70),
    L(6, 5, 102),
    L(6, 6, 134),
    L(6, 7, 198),
    L(6, 8, 326),
    L(6, 9, 582),
    L(6, 10, 1094),
    L(7, 11, 2118),
    L(8, 32, -22, "low"),
    L(8, 32, 4166, "high"),
    L(2, 0, 0, "oob")
  ],
  11: [
    L(1, 0, 1),
    L(2, 1, 2),
    L(4, 0, 4),
    L(4, 1, 5),
    L(5, 1, 7),
    L(5, 2, 9),
    L(6, 2, 13),
    L(7, 2, 17),
    L(7, 3, 21),
    L(7, 4, 29),
    L(7, 5, 45),
    L(7, 6, 77),
    L(7, 32, 141, "high")
  ],
  12: [
    L(1, 0, 1),
    L(2, 0, 2),
    L(3, 1, 3),
    L(5, 0, 5),
    L(5, 1, 6),
    L(6, 1, 8),
    L(7, 0, 10),
    L(7, 1, 11),
    L(7, 2, 13),
    L(7, 3, 17),
    L(7, 4, 25),
    L(8, 5, 41),
    L(8, 32, 73, "high")
  ],
  13: [
    L(1, 0, 1),
    L(3, 0, 2),
    L(4, 0, 3),
    L(5, 0, 4),
    L(4, 1, 5),
    L(3, 3, 7),
    L(6, 1, 15),
    L(6, 2, 17),
    L(6, 3, 21),
    L(6, 4, 29),
    L(6, 5, 45),
    L(7, 6, 77),
    L(7, 32, 141, "high")
  ],
  14: [L(3, 0, -2), L(3, 0, -1), L(1, 0, 0), L(3, 0, 1), L(3, 0, 2)],
  15: [
    L(7, 4, -24),
    L(6, 2, -8),
    L(5, 1, -4),
    L(4, 0, -2),
    L(3, 0, -1),
    L(1, 0, 0),
    L(3, 0, 1),
    L(4, 0, 2),
    L(5, 1, 3),
    L(6, 2, 5),
    L(7, 4, 9),
    L(7, 32, -25, "low"),
    L(7, 32, 25, "high")
  ]
};
function table(lines) {
  const maxLen = Math.max(0, ...lines.map((l) => l[0]));
  const count = new Array(maxLen + 1).fill(0);
  for (const l of lines) if (l[0]) count[l[0]]++;
  const byLen = /* @__PURE__ */ new Map();
  let first = 0;
  for (let len = 1; len <= maxLen; len++) {
    first = (first + count[len - 1]) * 2;
    let code = first;
    for (const l of lines) if (l[0] === len) byLen.set(len * 4294967296 + code++, l);
  }
  return { maxLen, byLen };
}
var STD = {};
var standardTable = (n) => STD[n] ||= table(STANDARD_TABLES[n]);
var Bits2 = class {
  constructor(d, p, end) {
    this.d = d;
    this.p = p;
    this.end = end;
    this.bit = 0;
  }
  read(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      if (this.p >= this.end) throw truncated("Huffman-coded data ends early");
      v = v * 2 + (this.d[this.p] >> 7 - this.bit & 1);
      if (++this.bit === 8) {
        this.bit = 0;
        this.p++;
      }
    }
    return v;
  }
  align() {
    if (this.bit) {
      this.bit = 0;
      this.p++;
    }
  }
  /** Decode one value with table `t` (B.4). OOB is `null`. */
  huff(t) {
    let code = 0;
    for (let len = 1; len <= t.maxLen; len++) {
      code = code * 2 + this.read(1);
      const l = t.byLen.get(len * 4294967296 + code);
      if (!l) continue;
      const [, rangeLen, low, kind] = l;
      if (kind === "oob") return OOB;
      const off = this.read(rangeLen);
      return kind === "low" ? low - off : low + off;
    }
    throw corrupt("a Huffman code no table line holds");
  }
};
function parseTableSegment(data) {
  const r = new Reader(data);
  const flags = r.u8("table flags");
  const htoob = flags & 1, htps = (flags >> 1 & 7) + 1, htrs = (flags >> 4 & 7) + 1;
  const low = r.i32("HTLOW"), high = r.i32("HTHIGH");
  const b = new Bits2(data, r.p, data.length);
  const lines = [];
  let cur = low;
  while (cur < high) {
    const p = b.read(htps), rl = b.read(htrs);
    lines.push(L(p, rl, cur));
    cur += 2 ** rl;
    if (lines.length > 1 << 16) throw corrupt("a custom Huffman table with no end");
  }
  lines.push(L(b.read(htps), 32, low - 1, "low"));
  lines.push(L(b.read(htps), 32, high, "high"));
  if (htoob) lines.push(L(b.read(htps), 0, 0, "oob"));
  return table(lines);
}
var TPGD_CONTEXT = [39717, 1941, 229, 405];
function decodeGenericArith(mq, ctx, w, h, template, tpgdon, at, skip = null) {
  const bm = bitmap(w, h);
  const D = bm.d;
  const nat = template === 0 ? 4 : 1;
  for (let i = 0; i < nat; i++) {
    const ax = at[2 * i], ay = at[2 * i + 1];
    if (ay > 0 || ay === 0 && ax >= 0) throw corrupt(`adaptive template pixel (${ax},${ay}) is not yet decoded`);
  }
  const px = (x, y) => x < 0 || x >= w || y < 0 ? 0 : D[y * w + x];
  let ltp = 0;
  const sltp = TPGD_CONTEXT[template];
  const [a1x, a1y, a2x, a2y, a3x, a3y, a4x, a4y] = at;
  for (let y = 0; y < h; y++) {
    if (tpgdon) {
      ltp ^= mq.decode(ctx, sltp);
      if (ltp) {
        if (y > 0) D.copyWithin(y * w, (y - 1) * w, y * w);
        continue;
      }
    }
    const r0 = y * w, r1 = r0 - w, r2 = r1 - w;
    const has1 = y >= 1, has2 = y >= 2;
    const p1 = (x) => has1 && x >= 0 && x < w ? D[r1 + x] : 0;
    const p2 = (x) => has2 && x >= 0 && x < w ? D[r2 + x] : 0;
    let c0 = 0, c1, c2;
    if (template === 0) {
      c1 = p1(-2) << 4 | p1(-1) << 3 | p1(0) << 2 | p1(1) << 1 | p1(2);
      c2 = p2(-1) << 2 | p2(0) << 1 | p2(1);
    } else if (template === 1) {
      c1 = p1(-2) << 4 | p1(-1) << 3 | p1(0) << 2 | p1(1) << 1 | p1(2);
      c2 = p2(-1) << 3 | p2(0) << 2 | p2(1) << 1 | p2(2);
    } else if (template === 2) {
      c1 = p1(-2) << 3 | p1(-1) << 2 | p1(0) << 1 | p1(1);
      c2 = p2(-1) << 2 | p2(0) << 1 | p2(1);
    } else {
      c1 = p1(-3) << 4 | p1(-2) << 3 | p1(-1) << 2 | p1(0) << 1 | p1(1);
      c2 = 0;
    }
    for (let x = 0; x < w; x++) {
      let bit = 0;
      if (!(skip && skip.d[y * w + x])) {
        let cx;
        if (template === 0) {
          cx = c0 | px(x + a1x, y + a1y) << 4 | c1 << 5 | px(x + a2x, y + a2y) << 10 | px(x + a3x, y + a3y) << 11 | c2 << 12 | px(x + a4x, y + a4y) << 15;
        } else if (template === 1) {
          cx = c0 & 7 | px(x + a1x, y + a1y) << 3 | c1 << 4 | c2 << 9;
        } else if (template === 2) {
          cx = c0 & 3 | px(x + a1x, y + a1y) << 2 | c1 << 3 | c2 << 7;
        } else {
          cx = c0 | px(x + a1x, y + a1y) << 4 | c1 << 5;
        }
        bit = mq.decode(ctx, cx);
      }
      D[r0 + x] = bit;
      c0 = (c0 << 1 | bit) & 15;
      if (template === 0) {
        c1 = c1 << 1 & 31 | p1(x + 3);
        c2 = c2 << 1 & 7 | p2(x + 2);
      } else if (template === 1) {
        c1 = c1 << 1 & 31 | p1(x + 3);
        c2 = c2 << 1 & 15 | p2(x + 3);
      } else if (template === 2) {
        c1 = c1 << 1 & 15 | p1(x + 2);
        c2 = c2 << 1 & 7 | p2(x + 2);
      } else {
        c1 = c1 << 1 & 31 | p1(x + 2);
      }
    }
  }
  return bm;
}
var MODES = [
  // [bits, code, mode, delta]
  [1, 1, "V", 0],
  [3, 3, "V", 1],
  [3, 2, "V", -1],
  [3, 1, "H", 0],
  [4, 1, "P", 0],
  [6, 3, "V", 2],
  [6, 2, "V", -2],
  [7, 3, "V", 3],
  [7, 2, "V", -3]
];
var WHITE = [
  [8, 53, 0],
  [6, 7, 1],
  [4, 7, 2],
  [4, 8, 3],
  [4, 11, 4],
  [4, 12, 5],
  [4, 14, 6],
  [4, 15, 7],
  [5, 19, 8],
  [5, 20, 9],
  [5, 7, 10],
  [5, 8, 11],
  [6, 8, 12],
  [6, 3, 13],
  [6, 52, 14],
  [6, 53, 15],
  [6, 42, 16],
  [6, 43, 17],
  [7, 39, 18],
  [7, 12, 19],
  [7, 8, 20],
  [7, 23, 21],
  [7, 3, 22],
  [7, 4, 23],
  [7, 40, 24],
  [7, 43, 25],
  [7, 19, 26],
  [7, 36, 27],
  [7, 24, 28],
  [8, 2, 29],
  [8, 3, 30],
  [8, 26, 31],
  [8, 27, 32],
  [8, 18, 33],
  [8, 19, 34],
  [8, 20, 35],
  [8, 21, 36],
  [8, 22, 37],
  [8, 23, 38],
  [8, 40, 39],
  [8, 41, 40],
  [8, 42, 41],
  [8, 43, 42],
  [8, 44, 43],
  [8, 45, 44],
  [8, 4, 45],
  [8, 5, 46],
  [8, 10, 47],
  [8, 11, 48],
  [8, 82, 49],
  [8, 83, 50],
  [8, 84, 51],
  [8, 85, 52],
  [8, 36, 53],
  [8, 37, 54],
  [8, 88, 55],
  [8, 89, 56],
  [8, 90, 57],
  [8, 91, 58],
  [8, 74, 59],
  [8, 75, 60],
  [8, 50, 61],
  [8, 51, 62],
  [8, 52, 63],
  [5, 27, 64],
  [5, 18, 128],
  [6, 23, 192],
  [7, 55, 256],
  [8, 54, 320],
  [8, 55, 384],
  [8, 100, 448],
  [8, 101, 512],
  [8, 104, 576],
  [8, 103, 640],
  [9, 204, 704],
  [9, 205, 768],
  [9, 210, 832],
  [9, 211, 896],
  [9, 212, 960],
  [9, 213, 1024],
  [9, 214, 1088],
  [9, 215, 1152],
  [9, 216, 1216],
  [9, 217, 1280],
  [9, 218, 1344],
  [9, 219, 1408],
  [9, 152, 1472],
  [9, 153, 1536],
  [9, 154, 1600],
  [6, 24, 1664],
  [9, 155, 1728]
];
var BLACK = [
  [10, 55, 0],
  [3, 2, 1],
  [2, 3, 2],
  [2, 2, 3],
  [3, 3, 4],
  [4, 3, 5],
  [4, 2, 6],
  [5, 3, 7],
  [6, 5, 8],
  [6, 4, 9],
  [7, 4, 10],
  [7, 5, 11],
  [7, 7, 12],
  [8, 4, 13],
  [8, 7, 14],
  [9, 24, 15],
  [10, 23, 16],
  [10, 24, 17],
  [10, 8, 18],
  [11, 103, 19],
  [11, 104, 20],
  [11, 108, 21],
  [11, 55, 22],
  [11, 40, 23],
  [11, 23, 24],
  [11, 24, 25],
  [12, 202, 26],
  [12, 203, 27],
  [12, 204, 28],
  [12, 205, 29],
  [12, 104, 30],
  [12, 105, 31],
  [12, 106, 32],
  [12, 107, 33],
  [12, 210, 34],
  [12, 211, 35],
  [12, 212, 36],
  [12, 213, 37],
  [12, 214, 38],
  [12, 215, 39],
  [12, 108, 40],
  [12, 109, 41],
  [12, 218, 42],
  [12, 219, 43],
  [12, 84, 44],
  [12, 85, 45],
  [12, 86, 46],
  [12, 87, 47],
  [12, 100, 48],
  [12, 101, 49],
  [12, 82, 50],
  [12, 83, 51],
  [12, 36, 52],
  [12, 55, 53],
  [12, 56, 54],
  [12, 39, 55],
  [12, 40, 56],
  [12, 88, 57],
  [12, 89, 58],
  [12, 43, 59],
  [12, 44, 60],
  [12, 90, 61],
  [12, 102, 62],
  [12, 103, 63],
  [10, 15, 64],
  [12, 200, 128],
  [12, 201, 192],
  [12, 91, 256],
  [12, 51, 320],
  [12, 52, 384],
  [12, 53, 448],
  [13, 108, 512],
  [13, 109, 576],
  [13, 74, 640],
  [13, 75, 704],
  [13, 76, 768],
  [13, 77, 832],
  [13, 114, 896],
  [13, 115, 960],
  [13, 116, 1024],
  [13, 117, 1088],
  [13, 118, 1152],
  [13, 119, 1216],
  [13, 82, 1280],
  [13, 83, 1344],
  [13, 84, 1408],
  [13, 85, 1472],
  [13, 90, 1536],
  [13, 91, 1600],
  [13, 100, 1664],
  [13, 101, 1728]
];
var EXT = [
  [11, 8, 1792],
  [11, 12, 1856],
  [11, 13, 1920],
  [12, 18, 1984],
  [12, 19, 2048],
  [12, 20, 2112],
  [12, 21, 2176],
  [12, 22, 2240],
  [12, 23, 2304],
  [12, 28, 2368],
  [12, 29, 2432],
  [12, 30, 2496],
  [12, 31, 2560]
];
function runLookup(codes) {
  const t = new Int32Array(1 << 13);
  for (const [n, code, run] of [...codes, ...EXT]) {
    const base = code << 13 - n;
    for (let i = 0; i < 1 << 13 - n; i++) t[base | i] = n << 16 | run + 1;
  }
  return t;
}
var WHITE_LUT = runLookup(WHITE);
var BLACK_LUT = runLookup(BLACK);
var MmrBits = class {
  constructor(d, p, end) {
    this.d = d;
    this.p0 = p;
    this.pos = p * 8;
    this.endBit = end * 8;
  }
  peek(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const b = this.pos + i;
      v = v << 1 | (b < this.endBit ? this.d[b >> 3] >> 7 - (b & 7) & 1 : 0);
    }
    return v;
  }
  skip(n) {
    this.pos += n;
  }
  get left() {
    return this.endBit - this.pos;
  }
};
function mmrRun(br, lut) {
  let total = 0;
  for (; ; ) {
    const e = lut[br.peek(13)];
    if (!e || e >> 16 > br.left) return -1;
    br.skip(e >> 16);
    const run = (e & 65535) - 1;
    total += run;
    if (run < 64) return total;
  }
}
function decodeMmr(d, p, end, w, h) {
  const bm = bitmap(w, h);
  const br = new MmrBits(d, p, end);
  let ref = [w, w];
  for (let y = 0; y < h; y++) {
    if (br.peek(24) === 4097 && br.left >= 24) throw truncated(`MMR data ends (EOFB) after ${y} of ${h} rows`);
    const cur = [];
    let a0 = -1, colour = 0;
    const b12 = () => {
      let i = 0;
      while (i < ref.length && ref[i] <= a0) i++;
      if (a0 < 0) i = 0;
      while (i < ref.length && (i & 1) !== colour) i++;
      return i < ref.length ? ref[i] : w;
    };
    const b1Index = () => {
      let i = 0;
      while (i < ref.length && (a0 >= 0 ? ref[i] <= a0 : false)) i++;
      while (i < ref.length && (i & 1) !== colour) i++;
      return i;
    };
    let guard = 0;
    while (a0 < w) {
      if (++guard > 4 * w + 16) throw corrupt("an MMR row that does not end");
      let hit = null;
      for (const m of MODES) if (br.left >= m[0] && br.peek(m[0]) === m[1]) {
        hit = m;
        break;
      }
      if (!hit) throw truncated(`MMR data ends or breaks in row ${y} of ${h}`);
      br.skip(hit[0]);
      if (hit[2] === "H") {
        const start = a0 < 0 ? 0 : a0;
        const r1 = mmrRun(br, colour ? BLACK_LUT : WHITE_LUT);
        const r2 = r1 < 0 ? -1 : mmrRun(br, colour ? WHITE_LUT : BLACK_LUT);
        if (r1 < 0 || r2 < 0) throw truncated(`MMR data ends or breaks in row ${y} of ${h}`);
        const m1 = Math.min(w, start + r1), m2 = Math.min(w, m1 + r2);
        cur.push(m1, m2);
        a0 = m2;
      } else if (hit[2] === "P") {
        const i = b1Index();
        a0 = i + 1 < ref.length ? ref[i + 1] : w;
      } else {
        const a1 = Math.max(0, Math.min(w, b12() + hit[3]));
        if (a1 < a0) throw corrupt(`MMR row ${y} runs backwards`);
        cur.push(a1);
        a0 = a1;
        colour ^= 1;
      }
    }
    const row = y * w;
    let pos = 0, c = 0;
    for (const t of cur) {
      if (c) bm.d.fill(1, row + pos, row + Math.min(t, w));
      pos = t;
      c ^= 1;
    }
    if (c && pos < w) bm.d.fill(1, row + pos, row + w);
    ref = cur.length ? [...cur, w, w] : [w, w];
  }
  if (br.left >= 24 && br.peek(24) === 4097) br.skip(24);
  return { bm, end: Math.min(end, Math.ceil(br.pos / 8)) };
}
function decodeRefinement(mq, ctx, w, h, template, ref, dx, dy, tpgron, at) {
  const bm = bitmap(w, h);
  const D = bm.d, R3 = ref.d, rw = ref.w, rh = ref.h;
  if (template === 0) {
    if (at[1] > 0 || at[1] === 0 && at[0] >= 0) throw corrupt("refinement adaptive pixel is not yet decoded");
  }
  const g = (x, y) => x < 0 || x >= w || y < 0 || y >= h ? 0 : D[y * w + x];
  const r = (x, y) => x < 0 || x >= rw || y < 0 || y >= rh ? 0 : R3[y * rw + x];
  const ctxOf = template === 0 ? (x, y) => {
    const i = x - dx, j = y - dy;
    return g(x - 1, y) | g(x + 1, y - 1) << 1 | g(x, y - 1) << 2 | g(x + at[0], y + at[1]) << 3 | r(i + 1, j + 1) << 4 | r(i, j + 1) << 5 | r(i - 1, j + 1) << 6 | r(i + 1, j) << 7 | r(i, j) << 8 | r(i - 1, j) << 9 | r(i + 1, j - 1) << 10 | r(i, j - 1) << 11 | r(i + at[2], j + at[3]) << 12;
  } : (x, y) => {
    const i = x - dx, j = y - dy;
    return g(x - 1, y) | g(x + 1, y - 1) << 1 | g(x, y - 1) << 2 | g(x - 1, y - 1) << 3 | r(i + 1, j + 1) << 4 | r(i, j + 1) << 5 | r(i + 1, j) << 6 | r(i, j) << 7 | r(i - 1, j) << 8 | r(i, j - 1) << 9;
  };
  const sltp = template === 0 ? 256 : 64;
  let ltp = 0;
  for (let y = 0; y < h; y++) {
    if (tpgron) ltp ^= mq.decode(ctx, sltp);
    for (let x = 0; x < w; x++) {
      if (ltp) {
        const i = x - dx, j = y - dy, m = r(i, j);
        if (r(i - 1, j - 1) === m && r(i, j - 1) === m && r(i + 1, j - 1) === m && r(i - 1, j) === m && r(i + 1, j) === m && r(i - 1, j + 1) === m && r(i, j + 1) === m && r(i + 1, j + 1) === m) {
          D[y * w + x] = m;
          continue;
        }
      }
      D[y * w + x] = mq.decode(ctx, ctxOf(x, y));
    }
  }
  return bm;
}
var CORNER = { BOTTOMLEFT: 0, TOPLEFT: 1, BOTTOMRIGHT: 2, TOPRIGHT: 3 };
function decodeTextRegion(p, syms, dec) {
  const reg = bitmap(p.w, p.h, p.defPixel);
  const huff = !!dec.bits;
  const num = (name) => {
    if (huff) return dec.bits.huff(dec.tables[name]);
    return iaDecode(dec.mq, dec.ia[name]);
  };
  let stript = -intOrThrow(num("DT"), "the first strip's T") * p.strips;
  let firsts = 0, n = 0;
  while (n < p.numInstances) {
    stript += intOrThrow(num("DT"), "a strip's T") * p.strips;
    let first = true, curs = 0;
    for (; ; ) {
      if (first) {
        firsts += intOrThrow(num("FS"), "a strip's first S");
        curs = firsts;
        first = false;
      } else {
        const ids = num("DS");
        if (ids === OOB) break;
        curs += ids + p.dsOffset;
      }
      let curt = 0;
      if (p.strips !== 1) curt = huff ? dec.bits.read(p.logStrips) : intOrThrow(iaDecode(dec.mq, dec.ia.IT), "a symbol's T");
      const t = stript + curt;
      const id = huff ? intOrThrow(dec.bits.huff(dec.symCodes), "a symbol id") : iaidDecode(dec.mq, dec.ia.ID, dec.idLen);
      if (id < 0 || id >= syms.length || !syms[id]) throw corrupt(`symbol id ${id} of ${syms.length}`);
      let ib = syms[id];
      const ri = p.refine ? huff ? dec.bits.read(1) : intOrThrow(iaDecode(dec.mq, dec.ia.RI), "a refinement flag") : 0;
      if (ri) {
        const rdw = intOrThrow(iaDecode(dec.mq, dec.ia.RDW), "RDW"), rdh = intOrThrow(iaDecode(dec.mq, dec.ia.RDH), "RDH");
        const rdx = intOrThrow(iaDecode(dec.mq, dec.ia.RDX), "RDX"), rdy = intOrThrow(iaDecode(dec.mq, dec.ia.RDY), "RDY");
        if (ib.w + rdw < 0 || ib.h + rdh < 0) throw corrupt("a refined symbol of negative size");
        ib = decodeRefinement(
          dec.mq,
          dec.gr,
          ib.w + rdw,
          ib.h + rdh,
          p.rTemplate,
          ib,
          (rdw >> 1) + rdx,
          (rdh >> 1) + rdy,
          false,
          p.rAt
        );
      }
      if (!p.transposed && p.refCorner > 1) curs += ib.w - 1;
      else if (p.transposed && !(p.refCorner & 1)) curs += ib.h - 1;
      const s = curs;
      let x, y;
      const [u, v] = p.transposed ? [t, s] : [s, t];
      switch (p.refCorner) {
        case CORNER.TOPLEFT:
          x = u;
          y = v;
          break;
        case CORNER.TOPRIGHT:
          x = u - ib.w + 1;
          y = v;
          break;
        case CORNER.BOTTOMLEFT:
          x = u;
          y = v - ib.h + 1;
          break;
        default:
          x = u - ib.w + 1;
          y = v - ib.h + 1;
          break;
      }
      compose(reg, ib, x, y, p.combOp);
      if (!p.transposed && p.refCorner < 2) curs += ib.w - 1;
      else if (p.transposed && p.refCorner & 1) curs += ib.h - 1;
      n++;
      if (n > p.numInstances + 1e6) throw corrupt("a text region with no end");
    }
  }
  return reg;
}
function readSymbolIdTable(bits, numSyms) {
  const runLines = [];
  for (let i = 0; i < 35; i++) runLines.push(L(bits.read(4), 0, i));
  const runTable = table(runLines);
  const lens = [];
  while (lens.length < numSyms) {
    const code = bits.huff(runTable);
    if (code === OOB || code > 34) throw corrupt("a symbol-id length code outside the run table");
    if (code < 32) lens.push(code);
    else {
      const [rep, val] = code === 32 ? [3 + bits.read(2), lens.length ? lens[lens.length - 1] : -1] : code === 33 ? [3 + bits.read(3), 0] : [11 + bits.read(7), 0];
      if (val < 0) throw corrupt("a repeated symbol-id length with nothing before it");
      for (let i = 0; i < rep; i++) lens.push(val);
    }
  }
  if (lens.length > numSyms) throw corrupt("more symbol-id lengths than symbols");
  bits.align();
  return table(lens.map((len, i) => L(len, 0, i)));
}
function regionInfo(r) {
  const w = r.u32("region width"), h = r.u32("region height"), x = r.u32("region x"), y = r.u32("region y");
  const flags = r.u8("region flags");
  if (flags & 8) throw unsupported("colour extension");
  return { w, h, x, y, op: flags & 7 };
}
function readAt(r, n) {
  const at = [];
  for (let i = 0; i < n; i++) at.push(r.i8("an adaptive-template x"), r.i8("an adaptive-template y"));
  return at;
}
function readSegments(d, into, limit = d.length) {
  const r = new Reader(d, 0, limit);
  while (r.p < limit) {
    const number = r.u32("a segment number");
    const flags = r.u8("segment flags");
    const type = flags & 63;
    const pageAssoc4 = flags & 64;
    let count = r.u8("the referred-to count") >> 5;
    if (count === 7) {
      r.p--;
      count = r.u32("a long referred-to count") & 536870911;
      const bytes = Math.ceil((count + 1) / 8);
      r.need(bytes, "retention flags");
      r.p += bytes;
    } else if (count > 4) throw corrupt(`referred-to count ${count}`);
    const refSize = number <= 256 ? 1 : number <= 65536 ? 2 : 4;
    const refs = [];
    for (let i = 0; i < count; i++) refs.push(refSize === 1 ? r.u8("a referred-to segment") : refSize === 2 ? r.u16("a referred-to segment") : r.u32("a referred-to segment"));
    const page = pageAssoc4 ? r.u32("a page association") : r.u8("a page association");
    let length = r.u32("a segment data length");
    const start = r.p;
    if (length === 4294967295) {
      if (type !== 38 && type !== 39) throw corrupt(`segment ${number} of type ${type} has an unknown length`);
      length = unknownLengthGeneric(d, start, limit);
    }
    r.need(length, `segment ${number}'s data`);
    into.push({ number, type, refs, page, data: d.subarray(start, start + length) });
    r.p = start + length;
    if (type === 51) break;
  }
}
function unknownLengthGeneric(d, start, limit) {
  if (start + 18 > limit) throw truncated("a generic region's header");
  const mmr = d[start + 17] & 1;
  const hdr = 18 + (mmr ? 0 : (d[start + 17] >> 1 & 3) === 0 ? 8 : 2);
  for (let i = start + hdr; i + 6 <= limit; i++) {
    if (mmr ? d[i] === 0 && d[i + 1] === 0 : d[i] === 255 && d[i + 1] === 172) return i + 6 - start;
  }
  throw truncated("a generic region of unknown length never ends");
}
function decodeJbig2(data, globals = null) {
  const segs = [];
  if (globals) readSegments(globals, segs);
  const nGlobal = segs.length;
  readSegments(data, segs);
  const results = /* @__PURE__ */ new Map();
  const tables = /* @__PURE__ */ new Map();
  let page = null, pageInfo = null;
  const used = /* @__PURE__ */ new Set();
  for (let si = 0; si < segs.length; si++) {
    const seg = segs[si];
    try {
      page = decodeSegment(seg, page);
    } catch (e) {
      if (e instanceof Jbig2Refusal) e.detail = { segmentType: seg.type, segment: seg.number, ...e.detail };
      throw e;
    }
  }
  function decodeSegment(seg, page2) {
    const r = new Reader(seg.data);
    const t = seg.type;
    switch (t) {
      case 48: {
        if (page2) throw unsupported("several pages");
        const w = r.u32("page width"), h = r.u32("page height");
        r.u32("x resolution");
        r.u32("y resolution");
        const flags = r.u8("page flags");
        const striping = r.u16("page striping");
        const unknownHeight = h === 4294967295;
        if (unknownHeight && !(striping & 32768)) throw corrupt("a page of unknown height that is not striped");
        pageInfo = {
          w,
          h: unknownHeight ? 0 : h,
          unknownHeight,
          defPixel: flags >> 2 & 1,
          op: flags >> 3 & 3,
          maxStripe: striping & 32767
        };
        page2 = bitmap(w, unknownHeight ? 0 : h, pageInfo.defPixel);
        used.add("page information");
        break;
      }
      case 49:
      case 51:
      case 52:
        break;
      // end of page, end of file, profiles
      case 50: {
        const endRow = r.u32("end of stripe row");
        if (pageInfo?.unknownHeight && endRow + 1 > page2.h) page2 = grow(page2, endRow + 1, pageInfo.defPixel);
        break;
      }
      case 53: {
        tables.set(seg.number, parseTableSegment(seg.data));
        used.add("custom Huffman table");
        break;
      }
      case 62: {
        const kind = r.u32("an extension type");
        if (kind & 2147483648) throw unsupported("a necessary extension segment", { extension: kind >>> 0 });
        break;
      }
      case 0: {
        results.set(seg.number, { kind: "symbols", ...decodeSymbolDict(seg, r, results, tables, used) });
        break;
      }
      case 4:
      case 6:
      case 7:
      case 20:
      case 22:
      case 23:
      case 36:
      case 38:
      case 39:
      case 40:
      case 42:
      case 43: {
        if (!page2) throw unsupported("no page");
        const info = regionInfo(r);
        let reg;
        if (t <= 7) reg = decodeTextSegment(seg, r, info, results, tables, used);
        else if (t <= 23) reg = decodeHalftoneSegment(seg, r, info, results, used);
        else if (t <= 39) reg = decodeGenericSegment(seg, r, info, used);
        else reg = decodeRefinementSegment(seg, r, info, results, page2, used);
        if (t === 4 || t === 20 || t === 36 || t === 40) {
          results.set(seg.number, { kind: "region", bm: reg, info });
        } else {
          if (pageInfo.unknownHeight && info.y + info.h > page2.h) page2 = grow(page2, info.y + info.h, pageInfo.defPixel);
          compose(page2, reg, info.x, info.y, info.op);
        }
        break;
      }
      case 16: {
        results.set(seg.number, { kind: "patterns", patterns: decodePatternDict(seg, r, used) });
        break;
      }
      default:
        throw unsupported("segment type");
    }
    return page2;
  }
  if (!page) throw unsupported("no page");
  const rowBytes = Math.ceil(page.w / 8);
  const packed = new Uint8Array(rowBytes * page.h);
  for (let y = 0; y < page.h; y++) {
    const row = y * page.w, o = y * rowBytes;
    for (let x = 0; x < page.w; x++) if (page.d[row + x]) packed[o + (x >> 3)] |= 128 >> (x & 7);
  }
  return { width: page.w, height: page.h, packed, detail: {
    segments: segs.length,
    global_segments: nGlobal,
    decoded: [...used].sort()
  } };
}
function grow(bm, h, fill) {
  const nb = bitmap(bm.w, h, fill);
  nb.d.set(bm.d.subarray(0, Math.min(bm.d.length, nb.d.length)));
  return nb;
}
function referredSymbols(seg, results) {
  const out = [];
  for (const n of seg.refs) {
    const s = results.get(n);
    if (s && s.kind === "symbols") out.push(...s.exported);
  }
  return out;
}
function referredTables(seg, tables) {
  return seg.refs.filter((n) => tables.has(n)).map((n) => tables.get(n));
}
function decodeGenericSegment(seg, r, info, used) {
  const flags = r.u8("generic region flags");
  const mmr = flags & 1, template = flags >> 1 & 3, tpgdon = flags >> 3 & 1;
  if (flags & 16) throw unsupported("12 adaptive-template pixels");
  if (mmr) {
    used.add("generic region, MMR");
    const { bm: bm2 } = decodeMmr(seg.data, r.p, seg.data.length, info.w, info.h);
    return bm2;
  }
  const at = readAt(r, template === 0 ? 4 : 1);
  used.add(`generic region, arithmetic, template ${template}${tpgdon ? ", TPGDON" : ""}`);
  let end = seg.data.length;
  const mq = new MqDecoder(seg.data, r.p, end);
  const bm = decodeGenericArith(mq, mqContexts(1 << 16), info.w, info.h, template, tpgdon, at);
  if (mq.overrun) throw truncated(`the generic region's arithmetic data ran out (${mq.overrun} bytes short)`);
  return bm;
}
function decodeRefinementSegment(seg, r, info, results, page, used) {
  const flags = r.u8("refinement region flags");
  const template = flags & 1, tpgron = flags >> 1 & 1;
  const at = template === 0 ? readAt(r, 2) : [0, 0, 0, 0];
  let ref;
  const inter = seg.refs.map((n) => results.get(n)).find((s) => s && s.kind === "region");
  if (inter) {
    ref = inter.bm;
  } else {
    ref = bitmap(info.w, info.h);
    compose(ref, page, -info.x, -info.y, 4);
  }
  used.add(`generic refinement region, template ${template}${tpgron ? ", TPGRON" : ""}`);
  const mq = new MqDecoder(seg.data, r.p, seg.data.length);
  const bm = decodeRefinement(mq, mqContexts(1 << 13), info.w, info.h, template, ref, 0, 0, tpgron, at);
  if (mq.overrun) throw truncated(`the refinement region's arithmetic data ran out (${mq.overrun} bytes short)`);
  return bm;
}
function decodeSymbolDict(seg, r, results, tables, used) {
  const flags = r.u16("symbol dictionary flags");
  const huff = flags & 1, refagg = flags >> 1 & 1;
  const selDH = flags >> 2 & 3, selDW = flags >> 4 & 3, selBM = flags >> 6 & 1, selAI = flags >> 7 & 1;
  const ctxUsed = flags >> 8 & 1;
  const template = flags >> 10 & 3, rTemplate = flags >> 12 & 1;
  if (ctxUsed) throw unsupported("reused bitmap coding contexts");
  if (huff && refagg) throw unsupported("Huffman-coded refinement");
  const at = huff ? [] : readAt(r, template === 0 ? 4 : 1);
  const rAt = refagg && rTemplate === 0 ? readAt(r, 2) : [0, 0, 0, 0];
  const numEx = r.u32("SDNUMEXSYMS"), numNew = r.u32("SDNUMNEWSYMS");
  const inSyms = referredSymbols(seg, results);
  const custom = referredTables(seg, tables);
  let ci = 0;
  const pick = (sel, std) => {
    if (sel === 3 || std.length === 1 && sel === 1) {
      if (ci >= custom.length) throw corrupt("a custom Huffman table the segment does not refer to");
      return custom[ci++];
    }
    if (sel >= std.length) throw corrupt(`Huffman table selection ${sel}`);
    return standardTable(std[sel]);
  };
  let tDH, tDW, tBM;
  if (huff) {
    tDH = pick(selDH, [4, 5]);
    tDW = pick(selDW, [2, 3]);
    tBM = pick(selBM, [1]);
    pick(selAI, [1]);
  }
  used.add(`symbol dictionary, ${huff ? "Huffman" : "arithmetic"}${refagg ? ", refinement/aggregate" : ""}`);
  const total = inSyms.length + numNew;
  let idLen = 0;
  while (2 ** idLen < total) idLen++;
  const newSyms = [];
  const d = seg.data;
  let mq = null, bits = null;
  const gb = mqContexts(1 << 16), gr = mqContexts(1 << 13);
  const ia = {
    DH: iaCtx(),
    DW: iaCtx(),
    EX: iaCtx(),
    AI: iaCtx(),
    DT: iaCtx(),
    FS: iaCtx(),
    DS: iaCtx(),
    IT: iaCtx(),
    RI: iaCtx(),
    RDW: iaCtx(),
    RDH: iaCtx(),
    RDX: iaCtx(),
    RDY: iaCtx(),
    ID: mqContexts(1 << idLen + 1)
  };
  if (huff) bits = new Bits2(d, r.p, d.length);
  else mq = new MqDecoder(d, r.p, d.length);
  const num = (name, tbl) => huff ? bits.huff(tbl) : iaDecode(mq, ia[name]);
  let hcHeight = 0;
  while (newSyms.length < numNew) {
    hcHeight += intOrThrow(num("DH", tDH), "a height-class delta");
    if (hcHeight < 0) throw corrupt("a negative height class");
    let symWidth = 0, totWidth = 0;
    const widths = [];
    for (; ; ) {
      const dw = num("DW", tDW);
      if (dw === OOB) break;
      if (newSyms.length + widths.length >= numNew && !huff) throw corrupt("more symbols than SDNUMNEWSYMS");
      symWidth += dw;
      if (symWidth < 0) throw corrupt("a negative symbol width");
      totWidth += symWidth;
      if (huff) {
        widths.push(symWidth);
        continue;
      }
      if (!refagg) {
        newSyms.push(decodeGenericArith(mq, gb, symWidth, hcHeight, template, 0, at));
        continue;
      }
      const nInst = intOrThrow(iaDecode(mq, ia.AI), "REFAGGNINST");
      if (nInst <= 0) throw corrupt("a refinement/aggregate symbol of no instances");
      const syms = [...inSyms, ...newSyms];
      if (nInst > 1) {
        newSyms.push(decodeTextRegion({
          w: symWidth,
          h: hcHeight,
          numInstances: nInst,
          strips: 1,
          logStrips: 0,
          refine: 1,
          defPixel: 0,
          combOp: 0,
          transposed: 0,
          refCorner: CORNER.TOPLEFT,
          dsOffset: 0,
          rTemplate,
          rAt
        }, syms, { mq, ia, idLen, gr }));
      } else {
        const id = iaidDecode(mq, ia.ID, idLen);
        const rdx = intOrThrow(iaDecode(mq, ia.RDX), "RDX"), rdy = intOrThrow(iaDecode(mq, ia.RDY), "RDY");
        if (id >= syms.length) throw corrupt(`refinement of symbol ${id} of ${syms.length}`);
        newSyms.push(decodeRefinement(mq, gr, symWidth, hcHeight, rTemplate, syms[id], rdx, rdy, false, rAt));
      }
    }
    if (huff) {
      const bmSize = intOrThrow(bits.huff(tBM), "BMSIZE");
      bits.align();
      let coll;
      if (bmSize === 0) {
        const stride = Math.ceil(totWidth / 8);
        if (bits.p + stride * hcHeight > d.length) throw truncated("an uncompressed collective bitmap");
        coll = bitmap(totWidth, hcHeight);
        for (let y = 0; y < hcHeight; y++) for (let x2 = 0; x2 < totWidth; x2++)
          coll.d[y * totWidth + x2] = d[bits.p + y * stride + (x2 >> 3)] >> 7 - (x2 & 7) & 1;
        bits.p += stride * hcHeight;
      } else {
        if (bits.p + bmSize > d.length) throw truncated("an MMR collective bitmap");
        coll = decodeMmr(d, bits.p, bits.p + bmSize, totWidth, hcHeight).bm;
        bits.p += bmSize;
      }
      let x = 0;
      for (const w of widths) {
        const s = bitmap(w, hcHeight);
        for (let y = 0; y < hcHeight; y++) s.d.set(coll.d.subarray(y * totWidth + x, y * totWidth + x + w), y * w);
        newSyms.push(s);
        x += w;
      }
    }
  }
  const all = [...inSyms, ...newSyms];
  const exported = [];
  let exFlag = 0, i = 0;
  while (i < all.length) {
    const run = intOrThrow(huff ? bits.huff(standardTable(1)) : iaDecode(mq, ia.EX), "an export run");
    if (run < 0 || i + run > all.length) throw corrupt("an export run past the symbols");
    if (exFlag) exported.push(...all.slice(i, i + run));
    i += run;
    exFlag ^= 1;
  }
  if (exported.length !== numEx) throw corrupt(`${exported.length} symbols exported where SDNUMEXSYMS is ${numEx}`);
  if (mq && mq.overrun) throw truncated(`the symbol dictionary's arithmetic data ran out (${mq.overrun} bytes short)`);
  return { exported };
}
function decodeTextSegment(seg, r, info, results, tables, used) {
  const flags = r.u16("text region flags");
  const huff = flags & 1, refine = flags >> 1 & 1, logStrips = flags >> 2 & 3, refCorner = flags >> 4 & 3;
  const transposed = flags >> 6 & 1, combOp = flags >> 7 & 3, defPixel = flags >> 9 & 1;
  let dsOffset = flags >> 10 & 31;
  if (dsOffset > 15) dsOffset -= 32;
  const rTemplate = flags >> 15 & 1;
  if (huff && refine) throw unsupported("Huffman-coded refinement");
  let hflags = 0;
  if (huff) hflags = r.u16("text region Huffman flags");
  const rAt = refine && rTemplate === 0 ? readAt(r, 2) : [0, 0, 0, 0];
  const numInstances = r.u32("SBNUMINSTANCES");
  const syms = referredSymbols(seg, results);
  used.add(`text region, ${huff ? "Huffman" : "arithmetic"}${refine ? ", refinement" : ""}`);
  const p = {
    w: info.w,
    h: info.h,
    numInstances,
    strips: 1 << logStrips,
    logStrips,
    refine,
    defPixel,
    combOp,
    transposed,
    refCorner,
    dsOffset,
    rTemplate,
    rAt
  };
  const d = seg.data;
  if (huff) {
    const custom = referredTables(seg, tables);
    let ci = 0;
    const pick = (sel, std) => {
      if (sel === 3) {
        if (ci >= custom.length) throw corrupt("a custom Huffman table the segment does not refer to");
        return custom[ci++];
      }
      if (sel >= std.length) throw corrupt(`Huffman table selection ${sel}`);
      return standardTable(std[sel]);
    };
    const tbl = {
      FS: pick(hflags & 3, [6, 7]),
      DS: pick(hflags >> 2 & 3, [8, 9, 10]),
      DT: pick(hflags >> 4 & 3, [11, 12, 13])
    };
    for (const [sh, std] of [[6, [14, 15]], [8, [14, 15]], [10, [14, 15]], [12, [14, 15]]]) if ((hflags >> sh & 3) === 3) pick(3, std);
    if (hflags >> 14 & 1) pick(3, [1]);
    const bits = new Bits2(d, r.p, d.length);
    const symCodes = readSymbolIdTable(bits, syms.length);
    return decodeTextRegion(p, syms, { bits, tables: tbl, symCodes });
  }
  let idLen = 0;
  while (2 ** idLen < syms.length) idLen++;
  const mq = new MqDecoder(d, r.p, d.length);
  const ia = {
    DT: iaCtx(),
    FS: iaCtx(),
    DS: iaCtx(),
    IT: iaCtx(),
    RI: iaCtx(),
    RDW: iaCtx(),
    RDH: iaCtx(),
    RDX: iaCtx(),
    RDY: iaCtx(),
    ID: mqContexts(1 << idLen + 1)
  };
  const reg = decodeTextRegion(p, syms, { mq, ia, idLen, gr: mqContexts(1 << 13) });
  if (mq.overrun) throw truncated(`the text region's arithmetic data ran out (${mq.overrun} bytes short)`);
  return reg;
}
function decodePatternDict(seg, r, used) {
  const flags = r.u8("pattern dictionary flags");
  const mmr = flags & 1, template = flags >> 1 & 3;
  const pw = r.u8("HDPW"), ph = r.u8("HDPH"), grayMax = r.u32("GRAYMAX");
  if (!pw || !ph) throw corrupt("a pattern of no size");
  const w = (grayMax + 1) * pw;
  used.add(`pattern dictionary, ${mmr ? "MMR" : `arithmetic, template ${template}`}`);
  let coll;
  if (mmr) coll = decodeMmr(seg.data, r.p, seg.data.length, w, ph).bm;
  else {
    const at = template === 0 ? [-pw, 0, -3, -1, 2, -2, -2, -2] : [-pw, 0];
    const mq = new MqDecoder(seg.data, r.p, seg.data.length);
    coll = decodeGenericArith(mq, mqContexts(1 << 16), w, ph, template, 0, at);
    if (mq.overrun) throw truncated("the pattern dictionary's arithmetic data ran out");
  }
  const pats = [];
  for (let g = 0; g <= grayMax; g++) {
    const p = bitmap(pw, ph);
    for (let y = 0; y < ph; y++) p.d.set(coll.d.subarray(y * w + g * pw, y * w + g * pw + pw), y * pw);
    pats.push(p);
  }
  return pats;
}
function decodeHalftoneSegment(seg, r, info, results, used) {
  const flags = r.u8("halftone region flags");
  const mmr = flags & 1, template = flags >> 1 & 3, enableSkip = flags >> 3 & 1;
  const combOp = flags >> 4 & 7, defPixel = flags >> 7 & 1;
  const gw = r.u32("HGW"), gh = r.u32("HGH"), gx = r.i32("HGX"), gy = r.i32("HGY");
  const rx = r.u16("HRX"), ry = r.u16("HRY");
  const dict = seg.refs.map((n) => results.get(n)).find((s) => s && s.kind === "patterns");
  if (!dict) throw corrupt("a halftone region with no pattern dictionary");
  const pats = dict.patterns;
  const pw = pats[0].w, ph = pats[0].h;
  used.add(`halftone region, ${mmr ? "MMR" : `arithmetic, template ${template}`}`);
  const reg = bitmap(info.w, info.h, defPixel);
  const place = (m, n) => [Math.floor((gx + m * ry + n * rx) / 256), Math.floor((gy + m * rx - n * ry) / 256)];
  let skip = null;
  if (enableSkip) {
    skip = bitmap(gw, gh);
    for (let m = 0; m < gh; m++) for (let n = 0; n < gw; n++) {
      const [x, y] = place(m, n);
      if (x + pw <= 0 || x >= info.w || y + ph <= 0 || y >= info.h) skip.d[m * gw + n] = 1;
    }
  }
  let bpp = 0;
  while (2 ** bpp < pats.length) bpp++;
  const planes = new Array(bpp);
  const at = [template <= 1 ? 3 : 2, -1, -3, -1, 2, -2, -2, -2];
  const d = seg.data;
  let mq = null, gb = null, p = r.p;
  if (!mmr) {
    mq = new MqDecoder(d, p, d.length);
    gb = mqContexts(1 << 16);
  }
  for (let j = bpp - 1; j >= 0; j--) {
    if (mmr) {
      const o = decodeMmr(d, p, d.length, gw, gh);
      planes[j] = o.bm;
      p = o.end;
    } else planes[j] = decodeGenericArith(mq, gb, gw, gh, template, 0, at, skip);
    if (j < bpp - 1) for (let i = 0; i < planes[j].d.length; i++) planes[j].d[i] ^= planes[j + 1].d[i];
  }
  if (mq && mq.overrun) throw truncated("the halftone region's arithmetic data ran out");
  for (let m = 0; m < gh; m++) for (let n = 0; n < gw; n++) {
    let g = 0;
    for (let j = bpp - 1; j >= 0; j--) g = g << 1 | planes[j].d[m * gw + n];
    if (g >= pats.length) g = pats.length - 1;
    const [x, y] = place(m, n);
    compose(reg, pats[g], x, y, combOp);
  }
  return reg;
}

// ../pdf-worker/src/jpxdecode.mjs
var JpxRefusal = class extends Error {
  constructor(code, detail = {}) {
    super(`${code}${detail.feature ? `: ${detail.feature}` : detail.note ? `: ${detail.note}` : ""}`);
    this.code = code;
    this.detail = detail;
  }
};
var unsupported2 = (feature, extra = {}) => new JpxRefusal("UNSUPPORTED", { feature, ...extra });
var samples = (note, extra = {}) => new JpxRefusal("UNSUPPORTED_SAMPLES", { note, ...extra });
var corrupt2 = (note, extra = {}) => new JpxRefusal("CORRUPT", { note, ...extra });
var truncated2 = (note, extra = {}) => new JpxRefusal("TRUNCATED", { note, ...extra });
var JPX_REFUSES = Object.freeze({
  "high-throughput coding": "the codestream uses Part 15 (HTJ2K) block coding",
  "a JP2 palette": "the image's samples index a palette (pclr box)",
  "sYCC colour": "the JP2 colour specification is sYCC, whose conversion is not bit-defined",
  "an extended capability": "a Part 2 extension the decoder must understand (a CAP marker, or Rsiz beyond Part 1)",
  "packed packet headers": "the packet headers are carried apart from the packets (PPM or PPT markers); no encoder at hand writes them, so no decode of them could be checked"
});
var f32 = Math.fround;
function boxes(d, p, end) {
  const out = [];
  while (p + 8 <= end) {
    let len = (d[p] << 24 | d[p + 1] << 16 | d[p + 2] << 8 | d[p + 3]) >>> 0;
    const type = String.fromCharCode(d[p + 4], d[p + 5], d[p + 6], d[p + 7]);
    let hdr = 8;
    if (len === 1) {
      if (p + 16 > end) throw truncated2("a JP2 box's extended length");
      len = ((d[p + 8] << 24 | d[p + 9] << 16 | d[p + 10] << 8 | d[p + 11]) >>> 0) * 2 ** 32 + ((d[p + 12] << 24 | d[p + 13] << 16 | d[p + 14] << 8 | d[p + 15]) >>> 0);
      hdr = 16;
    } else if (len === 0) len = end - p;
    if (len < hdr || p + len > end) throw truncated2(`the JP2 box '${type}' runs past the data`);
    out.push({ type, start: p + hdr, end: p + len });
    p += len;
  }
  return out;
}
function container(d) {
  if (d.length >= 2 && d[0] === 255 && d[1] === 79) return { cs: [0, d.length], colour: null, jp2: false };
  if (d.length < 12 || !(d[4] === 106 && d[5] === 80 && d[6] === 32 && d[7] === 32))
    throw corrupt2("neither a JPEG 2000 codestream (SOC) nor a JP2 file (signature box)");
  let colour = null, cs = null, palette = false;
  for (const b of boxes(d, 0, d.length)) {
    if (b.type === "jp2c") {
      cs = [b.start, b.end];
      break;
    }
    if (b.type === "jp2h") {
      for (const h of boxes(d, b.start, b.end)) {
        if (h.type === "pclr") palette = true;
        if (h.type === "colr" && !colour) {
          const meth = d[h.start];
          colour = meth === 1 ? { method: "enumerated", enumCs: (d[h.start + 3] << 24 | d[h.start + 4] << 16 | d[h.start + 5] << 8 | d[h.start + 6]) >>> 0 } : { method: meth === 2 ? "icc" : `method ${meth}` };
        }
      }
    }
  }
  if (!cs) throw truncated2("the JP2 file holds no codestream (jp2c box)");
  if (palette) throw unsupported2("a JP2 palette");
  if (colour && colour.method === "enumerated" && colour.enumCs === 18) throw unsupported2("sYCC colour");
  return { cs, colour, jp2: true };
}
var R = class {
  constructor(d, p, end) {
    this.d = d;
    this.p = p;
    this.end = end;
  }
  need(n, what) {
    if (this.p + n > this.end) throw truncated2(`${what} runs past the codestream`);
  }
  u8(w = "a field") {
    this.need(1, w);
    return this.d[this.p++];
  }
  u16(w = "a field") {
    this.need(2, w);
    const v = this.d[this.p] << 8 | this.d[this.p + 1];
    this.p += 2;
    return v;
  }
  u32(w = "a field") {
    this.need(4, w);
    const d = this.d, p = this.p;
    this.p += 4;
    return (d[p] << 24 | d[p + 1] << 16 | d[p + 2] << 8 | d[p + 3]) >>> 0;
  }
};
function readSiz(r, len) {
  const end = r.p + len - 2;
  const rsiz = r.u16("Rsiz");
  const s = { rsiz, X: r.u32(), Y: r.u32(), XO: r.u32(), YO: r.u32(), XT: r.u32(), YT: r.u32(), XTO: r.u32(), YTO: r.u32() };
  const n = r.u16("Csiz");
  s.comps = [];
  for (let i = 0; i < n; i++) {
    const ssiz = r.u8("Ssiz");
    s.comps.push({ prec: (ssiz & 127) + 1, sgnd: ssiz >> 7, dx: r.u8("XRsiz"), dy: r.u8("YRsiz") });
  }
  r.p = end;
  if (!s.XT || !s.YT || s.X <= s.XO || s.Y <= s.YO || s.XTO > s.XO || s.YTO > s.YO || s.XTO + s.XT <= s.XO || s.YTO + s.YT <= s.YO)
    throw corrupt2("an image and tile geometry the standard does not allow");
  if (rsiz & 16384) throw unsupported2("high-throughput coding");
  if (rsiz & 32768) throw unsupported2("an extended capability", { rsiz });
  return s;
}
function readSpcod(r, precincts) {
  const c = {
    nl: r.u8("decomposition levels"),
    xcb: (r.u8("code-block width") & 15) + 2,
    ycb: (r.u8("code-block height") & 15) + 2,
    cblksty: r.u8("code-block style"),
    qmfbid: r.u8("the wavelet")
  };
  if (c.nl > 32) throw corrupt2(`${c.nl} decomposition levels`);
  if (c.xcb + c.ycb > 12 || c.xcb > 10 || c.ycb > 10) throw corrupt2("a code-block larger than 4096 samples");
  if (c.cblksty & 64) throw unsupported2("high-throughput coding");
  c.prc = [];
  for (let i = 0; i <= c.nl; i++) {
    if (precincts) {
      const b = r.u8("a precinct size");
      c.prc.push([b & 15, b >> 4]);
    } else c.prc.push([15, 15]);
  }
  return c;
}
function readQcd(r, len) {
  const end = r.p + len;
  const s = r.u8("Sqcd");
  const style = s & 31, guard = s >> 5;
  const steps = [];
  if (style === 0) while (r.p < end) steps.push({ expn: r.u8("an exponent") >> 3, mant: 0 });
  else while (r.p + 1 < end) {
    const v = r.u16("a step size");
    steps.push({ expn: v >> 11, mant: v & 2047 });
  }
  r.p = end;
  if (style > 2 || !steps.length) throw corrupt2(`quantisation style ${style}`);
  return { style, guard, steps };
}
function parseCodestream(d, start, end) {
  const r = new R(d, start, end);
  if (r.u16("SOC") !== 65359) throw corrupt2("no SOC marker");
  const main = { cod: null, coc: [], qcd: null, qcc: [], rgn: [], poc: null };
  let siz = null;
  const tiles = /* @__PURE__ */ new Map();
  const readSeg = (h, m, len) => {
    const segEnd = r.p + len - 2;
    const wide = siz && siz.comps.length > 256;
    const comp = () => wide ? r.u16("a component index") : r.u8("a component index");
    switch (m) {
      case 65362: {
        const scod = r.u8("Scod");
        h.cod = {
          scod,
          prog: r.u8("the progression order"),
          layers: r.u16("the layer count"),
          mct: r.u8("the colour transform"),
          sp: readSpcod(r, scod & 1)
        };
        break;
      }
      case 65363: {
        const c = comp();
        const s = r.u8("Scoc");
        h.coc[c] = readSpcod(r, s & 1);
        break;
      }
      case 65372:
        h.qcd = readQcd(r, len - 2);
        break;
      case 65373: {
        const c = comp();
        h.qcc[c] = readQcd(r, segEnd - r.p);
        break;
      }
      case 65374: {
        const c = comp();
        r.u8("Srgn");
        h.rgn[c] = r.u8("the ROI shift");
        break;
      }
      case 65375: {
        const list = [];
        while (r.p < segEnd) list.push({ rs: r.u8(), cs: comp(), lye: r.u16(), re: r.u8(), ce: wide ? r.u16() : r.u8() || 256, prog: r.u8() });
        h.poc = (h.poc || []).concat(list);
        break;
      }
      case 65376:
      case 65377:
        throw unsupported2("packed packet headers", { marker: m === 65376 ? "PPM" : "PPT" });
      case 65360:
        throw unsupported2("an extended capability", { marker: "CAP" });
      default:
        break;
    }
    r.p = segEnd;
  };
  for (; ; ) {
    const m = r.u16("a main-header marker");
    if (m === 65424) {
      r.p -= 2;
      break;
    }
    if (m === 65497) throw truncated2("the codestream ends before any tile");
    if ((m & 65280) !== 65280) throw corrupt2("a main-header marker expected");
    const len = r.u16("a marker segment length");
    if (len < 2) throw corrupt2("a marker segment length under 2");
    r.need(len - 2, "a marker segment");
    if (m === 65361) {
      siz = readSiz(r, len);
      continue;
    }
    if (!siz) throw corrupt2("a marker before SIZ");
    readSeg(main, m, len);
  }
  if (!siz || !main.cod || !main.qcd) throw corrupt2("the main header lacks SIZ, COD or QCD");
  while (r.p + 2 <= end) {
    const m = r.u16("a tile-part marker");
    if (m === 65497) break;
    if (m !== 65424) throw corrupt2(`marker 0x${m.toString(16)} where SOT was expected`);
    const sotAt = r.p - 2;
    r.u16("Lsot");
    const isot = r.u16("Isot"), psot = r.u32("Psot");
    r.u8("TPsot");
    r.u8("TNsot");
    const tpEnd = psot ? sotAt + psot : end;
    if (tpEnd > end) throw truncated2(`tile-part of tile ${isot} runs past the codestream`);
    let t = tiles.get(isot);
    const first = !t;
    if (!t) {
      t = { index: isot, cod: null, coc: [], qcd: null, qcc: [], rgn: [], poc: null, data: [] };
      tiles.set(isot, t);
    }
    for (; ; ) {
      const mm = r.u16("a tile-part header marker");
      if (mm === 65427) break;
      const len = r.u16("a marker segment length");
      r.need(len - 2, "a marker segment");
      if (!first && mm !== 65377) {
        r.p += len - 2;
        continue;
      }
      readSeg(t, mm, len);
    }
    t.data.push(d.subarray(r.p, Math.min(tpEnd, end)));
    r.p = tpEnd;
  }
  return { siz, main, tiles };
}
var ceilDiv = (a, b) => Math.ceil(a / b);
var floorLog2 = (v) => 31 - Math.clz32(v);
var TagTree = class {
  constructor(w, h) {
    this.levels = [];
    do {
      this.levels.push({ w, h, value: new Int32Array(w * h).fill(2147483647), low: new Int32Array(w * h) });
      if (w === 1 && h === 1) break;
      w = ceilDiv(w, 2);
      h = ceilDiv(h, 2);
    } while (true);
  }
  /** Decode leaf (x, y) against `threshold`: true when its value is below it. */
  decode(bio, x, y, threshold) {
    const path = [];
    for (let l = 0; l < this.levels.length; l++) {
      path.push(y * this.levels[l].w + x);
      x >>= 1;
      y >>= 1;
    }
    let low = 0;
    for (let l = this.levels.length - 1; l >= 0; l--) {
      const lv = this.levels[l], i = path[l];
      if (low > lv.low[i]) lv.low[i] = low;
      else low = lv.low[i];
      while (low < threshold && low < lv.value[i]) {
        if (bio.bit()) lv.value[i] = low;
        else low++;
      }
      lv.low[i] = low;
    }
    return this.levels[0].value[path[0]] < threshold;
  }
  value(x, y) {
    return this.levels[0].value[y * this.levels[0].w + x];
  }
};
var Bio = class {
  constructor(d, p, end) {
    this.d = d;
    this.p = p;
    this.end = end;
    this.buf = 0;
    this.ct = 0;
  }
  byteIn() {
    this.buf = this.buf << 8 & 65535;
    this.ct = this.buf === 65280 ? 7 : 8;
    if (this.p < this.end) this.buf |= this.d[this.p++];
    else {
      this.p++;
      this.over = true;
    }
  }
  bit() {
    if (this.ct === 0) this.byteIn();
    this.ct--;
    return this.buf >> this.ct & 1;
  }
  bits(n) {
    let v = 0;
    for (let i = 0; i < n; i++) v = v << 1 | this.bit();
    return v;
  }
  /** Byte-align after a header: a final 0xFF is followed by a stuffed byte. */
  align() {
    if ((this.buf & 255) === 255) this.byteIn();
    this.ct = 0;
  }
};
var N = 1;
var S = 2;
var W = 4;
var E = 8;
var NW = 16;
var NE = 32;
var SW = 64;
var SE = 128;
var SGN_N = 256;
var SGN_S = 512;
var SGN_W = 1024;
var SGN_E = 2048;
var SIG = 4096;
var NEG = 8192;
var REFINED = 16384;
var VISIT = 32768;
var NBR = 255;
var ZC = [0, 1, 2, 3].map((orient) => Uint8Array.from({ length: 256 }, (_, f) => {
  let h = ((f & W) !== 0) + ((f & E) !== 0), v = ((f & N) !== 0) + ((f & S) !== 0);
  const d = ((f & NW) !== 0) + ((f & NE) !== 0) + ((f & SW) !== 0) + ((f & SE) !== 0);
  if (orient === 1) [h, v] = [v, h];
  if (orient === 3) {
    const hv = h + v;
    if (!d) return hv === 0 ? 0 : hv === 1 ? 1 : 2;
    if (d === 1) return hv === 0 ? 3 : hv === 1 ? 4 : 5;
    if (d === 2) return hv === 0 ? 6 : 7;
    return 8;
  }
  if (!h) return !v ? !d ? 0 : d === 1 ? 1 : 2 : v === 1 ? 3 : 4;
  if (h === 1) return !v ? !d ? 5 : 6 : 7;
  return 8;
}));
var SC = new Uint8Array(256);
var SPB = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  const sig = (b) => i >> b & 1, neg = (b) => i >> 4 + b & 1;
  const pos = (b) => sig(b) && !neg(b), ng = (b) => sig(b) && neg(b);
  const hc = Math.min(pos(2) + pos(3), 1) - Math.min(ng(2) + ng(3), 1);
  const vc0 = Math.min(pos(0) + pos(1), 1) - Math.min(ng(0) + ng(1), 1);
  SPB[i] = !hc && !vc0 ? 0 : !(hc > 0 || !hc && vc0 > 0) ? 1 : 0;
  let h = hc, v = vc0;
  if (h < 0) {
    h = -h;
    v = -v;
  }
  SC[i] = !h ? v ? 1 : 0 : v === -1 ? 2 : v === 0 ? 3 : 4;
}
var CTX_SC = 9;
var CTX_MAG = 14;
var CTX_AGG = 17;
var CTX_UNI = 18;
var RawDecoder = class {
  constructor(d, p, end) {
    this.d = d;
    this.bp = p;
    this.end = end;
    this.c = 0;
    this.ct = 0;
  }
  bit() {
    if (this.ct === 0) {
      const next = this.bp < this.end ? this.d[this.bp] : 255;
      if (this.c === 255) {
        if (next > 143) {
          this.c = 255;
          this.ct = 8;
        } else {
          this.c = next;
          this.bp++;
          this.ct = 7;
        }
      } else {
        this.c = next;
        this.bp++;
        this.ct = 8;
      }
    }
    this.ct--;
    return this.c >> this.ct & 1;
  }
};
function decodeCodeBlock(w, h, orient, numbps, lazyFrom, cblksty, segs, out) {
  const fw = w + 2;
  const flags = new Uint16Array(fw * (h + 2));
  const ctx = mqContexts(19);
  const resetCtx = () => {
    ctx.fill(0);
    ctx[CTX_UNI] = 46 << 1;
    ctx[CTX_AGG] = 3 << 1;
    ctx[0] = 4 << 1;
  };
  resetCtx();
  const zc = ZC[orient];
  const vsc = cblksty & 8, lazy = cblksty & 1, reset = cblksty & 2, segsym = cblksty & 32;
  let bpno = numbps;
  let passtype = 2;
  const at = (x, y) => (y + 1) * fw + x + 1;
  const setSig = (x, y, neg) => {
    const i = at(x, y);
    flags[i] |= SIG | (neg ? NEG : 0);
    flags[i - fw] |= S | (neg ? SGN_S : 0);
    flags[i + fw] |= N | (neg ? SGN_N : 0);
    flags[i - 1] |= E | (neg ? SGN_E : 0);
    flags[i + 1] |= W | (neg ? SGN_W : 0);
    flags[i - fw - 1] |= SE;
    flags[i - fw + 1] |= SW;
    flags[i + fw - 1] |= NE;
    flags[i + fw + 1] |= NW;
  };
  const nbr = (f, y) => vsc && (y & 3) === 3 ? f & ~(S | SW | SE | SGN_S) : f;
  const scIndex = (f) => (f & N ? 1 : 0) | (f & S ? 2 : 0) | (f & W ? 4 : 0) | (f & E ? 8 : 0) | (f & SGN_N ? 16 : 0) | (f & SGN_S ? 32 : 0) | (f & SGN_W ? 64 : 0) | (f & SGN_E ? 128 : 0);
  for (const seg of segs) {
    const raw = lazy && bpno <= lazyFrom - 4 && passtype < 2;
    const mq = raw ? null : new MqDecoder(seg.data, 0, seg.data.length);
    const rd = raw ? new RawDecoder(seg.data, 0, seg.data.length) : null;
    for (let pass = 0; pass < seg.passes && bpno >= 1; pass++) {
      const one = 1 << bpno, half = one >> 1, oneplushalf = one | half;
      if (passtype === 0) {
        for (let y0 = 0; y0 < h; y0 += 4) for (let x = 0; x < w; x++) for (let y = y0; y < y0 + 4 && y < h; y++) {
          const i = at(x, y), f = nbr(flags[i], y);
          if (f & SIG || !(f & NBR)) continue;
          const bit = raw ? rd.bit() : mq.decode(ctx, zc[f & NBR]);
          if (bit) {
            let neg;
            if (raw) neg = rd.bit();
            else {
              const k = scIndex(f);
              neg = mq.decode(ctx, CTX_SC + SC[k]) ^ SPB[k];
            }
            out[y * w + x] = neg ? -oneplushalf : oneplushalf;
            setSig(x, y, neg);
          }
          flags[i] |= VISIT;
        }
      } else if (passtype === 1) {
        for (let y0 = 0; y0 < h; y0 += 4) for (let x = 0; x < w; x++) for (let y = y0; y < y0 + 4 && y < h; y++) {
          const i = at(x, y), f = flags[i];
          if ((f & (SIG | VISIT)) !== SIG) continue;
          const bit = raw ? rd.bit() : mq.decode(ctx, f & REFINED ? CTX_MAG + 2 : nbr(f, y) & NBR ? CTX_MAG + 1 : CTX_MAG);
          const v = out[y * w + x];
          out[y * w + x] = v + (bit ^ (v < 0 ? 1 : 0) ? half : -half);
          flags[i] |= REFINED;
        }
      } else {
        for (let y0 = 0; y0 < h; y0 += 4) for (let x = 0; x < w; x++) {
          let y = y0;
          if (y0 + 4 <= h) {
            let quiet = true;
            for (let k = 0; k < 4 && quiet; k++) {
              const f = nbr(flags[at(x, y0 + k)], y0 + k);
              if (f & (SIG | VISIT | NBR)) quiet = false;
            }
            if (quiet) {
              if (!mq.decode(ctx, CTX_AGG)) continue;
              const k = mq.decode(ctx, CTX_UNI) << 1 | mq.decode(ctx, CTX_UNI);
              y = y0 + k;
              const f = nbr(flags[at(x, y)], y);
              const sk = scIndex(f);
              const neg = mq.decode(ctx, CTX_SC + SC[sk]) ^ SPB[sk];
              out[y * w + x] = neg ? -oneplushalf : oneplushalf;
              setSig(x, y, neg);
              y++;
            }
          }
          for (; y < y0 + 4 && y < h; y++) {
            const i = at(x, y), f = nbr(flags[i], y);
            if (f & (SIG | VISIT)) continue;
            if (mq.decode(ctx, zc[f & NBR])) {
              const sk = scIndex(f);
              const neg = mq.decode(ctx, CTX_SC + SC[sk]) ^ SPB[sk];
              out[y * w + x] = neg ? -oneplushalf : oneplushalf;
              setSig(x, y, neg);
            }
          }
        }
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) flags[at(x, y)] &= ~VISIT;
        if (segsym) for (let k = 0; k < 4; k++) mq.decode(ctx, CTX_UNI);
      }
      if (reset && !raw) resetCtx();
      if (++passtype === 3) {
        passtype = 0;
        bpno--;
      }
    }
  }
}
var K = f32(1.230174105);
var TWO_INVK = f32(1.625732422);
var ALPHA = f32(-1.586134342);
var BETA = f32(-0.052980118);
var GAMMA = f32(0.882911075);
var DELTA = f32(0.443506852);
function idwt53(x, n, cas) {
  if (n === 1) {
    if (cas) x[0] = Math.trunc(x[0] / 2);
    return;
  }
  const at = (i) => x[i < 0 ? -i : i >= n ? 2 * (n - 1) - i : i];
  for (let i = cas ? 1 : 0; i < n; i += 2) x[i] -= Math.floor((at(i - 1) + at(i + 1) + 2) / 4);
  for (let i = cas ? 0 : 1; i < n; i += 2) x[i] += Math.floor((at(i - 1) + at(i + 1)) / 2);
}
function idwt97(x, n, cas) {
  const sn = cas ? n >> 1 : n + 1 >> 1, dn = n - sn;
  if (cas === 0) {
    if (!(dn > 0 || sn > 1)) return;
  } else if (!(sn > 0 || dn > 1)) return;
  const a = cas, b = 1 - cas;
  for (let i = 0; i < sn; i++) x[a + 2 * i] = f32(x[a + 2 * i] * K);
  for (let i = 0; i < dn; i++) x[b + 2 * i] = f32(x[b + 2 * i] * TWO_INVK);
  step97(x, b, a + 1, sn, Math.min(sn, dn - a), f32(-DELTA));
  step97(x, a, b + 1, dn, Math.min(dn, sn - b), f32(-GAMMA));
  step97(x, b, a + 1, sn, Math.min(sn, dn - a), f32(-BETA));
  step97(x, a, b + 1, dn, Math.min(dn, sn - b), f32(-ALPHA));
}
function step97(x, l, w, end, m, c) {
  const imax = Math.min(end, m);
  let fl = l, fw = w;
  for (let i = 0; i < imax; i++) {
    x[fw - 1] = f32(x[fw - 1] + f32(f32(x[fl] + x[fw]) * c));
    fl = fw;
    fw += 2;
  }
  if (m < end) x[fw - 1] = f32(x[fw - 1] + f32(x[fl] * f32(c + c)));
}
function packetOrder(tc, layers, progs, tile, comps) {
  const out = [], seen = /* @__PURE__ */ new Set();
  const push = (l, r, c, p) => {
    const k = `${l}.${r}.${c}.${p}`;
    if (!seen.has(k)) {
      seen.add(k);
      out.push([l, r, c, p]);
    }
  };
  for (const pg of progs) {
    const LYE = Math.min(pg.lye, layers), RE = pg.re, CE = Math.min(pg.ce, comps.length);
    const cs = [], rs = [];
    for (let c = pg.cs; c < CE; c++) cs.push(c);
    for (let r = pg.rs; r < RE; r++) rs.push(r);
    const has = (c, r) => r < tc[c].res.length;
    if (pg.prog === 0 || pg.prog === 1) {
      for (const o1 of pg.prog === 0 ? [...Array(LYE).keys()] : rs)
        for (const o2 of pg.prog === 0 ? rs : [...Array(LYE).keys()])
          for (const c of cs) {
            const [l, r] = pg.prog === 0 ? [o1, o2] : [o2, o1];
            if (!has(c, r)) continue;
            const res = tc[c].res[r];
            for (let p = 0; p < res.npw * res.nph; p++) push(l, r, c, p);
          }
      continue;
    }
    const items = [];
    for (const c of cs) for (const r of rs) {
      if (!has(c, r)) continue;
      const res = tc[c].res[r], n = tc[c].nl - r, cp = comps[c];
      for (let py = 0; py < res.nph; py++) for (let px = 0; px < res.npw; px++) {
        const gx = res.pgx + px << res.ppx, gy = res.pgy + py << res.ppy;
        const X = gx <= res.x0 ? (res.x0 << n) * cp.dx % (cp.dx << res.ppx + n) === 0 ? res.x0 * cp.dx << n : tile.x0 : gx * cp.dx << n;
        const Y = gy <= res.y0 ? (res.y0 << n) * cp.dy % (cp.dy << res.ppy + n) === 0 ? res.y0 * cp.dy << n : tile.y0 : gy * cp.dy << n;
        items.push({ c, r, p: py * res.npw + px, X, Y });
      }
    }
    const key = { 2: (a) => [a.r, a.Y, a.X, a.c], 3: (a) => [a.Y, a.X, a.c, a.r], 4: (a) => [a.c, a.Y, a.X, a.r] }[pg.prog];
    if (!key) throw corrupt2(`progression order ${pg.prog}`);
    items.sort((a, b) => {
      const ka = key(a), kb = key(b);
      for (let i = 0; i < 4; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i];
      return 0;
    });
    for (const it of items) for (let l = 0; l < LYE; l++) push(l, it.r, it.c, it.p);
  }
  return out;
}
function decodeTile(cs, t, tileNo) {
  const { siz, main } = cs;
  const cod = t.cod || main.cod;
  const nTx = ceilDiv(siz.X - siz.XTO, siz.XT);
  const p = tileNo % nTx, q = Math.floor(tileNo / nTx);
  const tile = {
    x0: Math.max(siz.XTO + p * siz.XT, siz.XO),
    y0: Math.max(siz.YTO + q * siz.YT, siz.YO),
    x1: Math.min(siz.XTO + (p + 1) * siz.XT, siz.X),
    y1: Math.min(siz.YTO + (q + 1) * siz.YT, siz.Y)
  };
  const comps = siz.comps;
  const tc = comps.map((cp, c) => {
    const sp = t.coc[c] || (t.cod ? t.cod.sp : null) || main.coc[c] || main.cod.sp;
    const qc = t.qcc[c] || t.qcd || main.qcc[c] || main.qcd;
    const roi = t.rgn[c] ?? main.rgn[c] ?? 0;
    const x0 = ceilDiv(tile.x0, cp.dx), y0 = ceilDiv(tile.y0, cp.dy), x1 = ceilDiv(tile.x1, cp.dx), y1 = ceilDiv(tile.y1, cp.dy);
    const res = [];
    for (let r = 0; r <= sp.nl; r++) {
      const sc = 2 ** (sp.nl - r);
      const R0 = { r, x0: ceilDiv(x0, sc), y0: ceilDiv(y0, sc), x1: ceilDiv(x1, sc), y1: ceilDiv(y1, sc) };
      const [ppx, ppy] = sp.prc[r];
      R0.ppx = ppx;
      R0.ppy = ppy;
      R0.pgx = Math.floor(R0.x0 / 2 ** ppx);
      R0.pgy = Math.floor(R0.y0 / 2 ** ppy);
      R0.npw = R0.x1 > R0.x0 ? ceilDiv(R0.x1, 2 ** ppx) - R0.pgx : 0;
      R0.nph = R0.y1 > R0.y0 ? ceilDiv(R0.y1, 2 ** ppy) - R0.pgy : 0;
      const bandSpecs = r === 0 ? [[0, 0, 0]] : [[1, 1, 0], [2, 0, 1], [3, 1, 1]];
      const nb = r === 0 ? sp.nl : sp.nl - r + 1;
      const xcb = Math.min(sp.xcb, r === 0 ? ppx : ppx - 1), ycb = Math.min(sp.ycb, r === 0 ? ppy : ppy - 1);
      R0.bands = bandSpecs.map(([bandno, xob, yob]) => {
        const s = 2 ** nb, hx = xob ? 2 ** (nb - 1) : 0, hy = yob ? 2 ** (nb - 1) : 0;
        const B = { bandno, x0: ceilDiv(x0 - hx, s), y0: ceilDiv(y0 - hy, s), x1: ceilDiv(x1 - hx, s), y1: ceilDiv(y1 - hy, s) };
        const bi = r === 0 ? 0 : 3 * (r - 1) + bandno;
        const st = qc.style === 1 ? { expn: Math.max(0, qc.steps[0].expn - (r === 0 ? 0 : Math.floor((bi - 1) / 3))), mant: qc.steps[0].mant } : qc.steps[bi];
        if (!st) throw corrupt2(`no quantisation step for band ${bi}`);
        B.numbps = st.expn + qc.guard - 1;
        const rb = cp.prec + (sp.qmfbid === 0 ? 0 : bandno === 0 ? 0 : bandno === 3 ? 2 : 1);
        B.stepsize = f32((1 + st.mant / 2048) * 2 ** (rb - st.expn));
        const bpx = r === 0 ? ppx : ppx - 1, bpy = r === 0 ? ppy : ppy - 1;
        B.prec = [];
        for (let py = 0; py < R0.nph; py++) for (let px = 0; px < R0.npw; px++) {
          const X0 = Math.max(B.x0, (R0.pgx + px) * 2 ** bpx), Y0 = Math.max(B.y0, (R0.pgy + py) * 2 ** bpy);
          const X1 = Math.min(B.x1, (R0.pgx + px + 1) * 2 ** bpx), Y1 = Math.min(B.y1, (R0.pgy + py + 1) * 2 ** bpy);
          const pr = { cblks: [], cw: 0, ch: 0 };
          if (X1 > X0 && Y1 > Y0) {
            const cx0 = Math.floor(X0 / 2 ** xcb), cy0 = Math.floor(Y0 / 2 ** ycb);
            pr.cw = ceilDiv(X1, 2 ** xcb) - cx0;
            pr.ch = ceilDiv(Y1, 2 ** ycb) - cy0;
            for (let j = 0; j < pr.ch; j++) for (let i = 0; i < pr.cw; i++) {
              pr.cblks.push({
                x0: Math.max(X0, (cx0 + i) * 2 ** xcb),
                y0: Math.max(Y0, (cy0 + j) * 2 ** ycb),
                x1: Math.min(X1, (cx0 + i + 1) * 2 ** xcb),
                y1: Math.min(Y1, (cy0 + j + 1) * 2 ** ycb),
                included: false,
                numbps: 0,
                lblock: 3,
                segs: [],
                passes: 0
              });
            }
            pr.incl = new TagTree(pr.cw, pr.ch);
            pr.imsb = new TagTree(pr.cw, pr.ch);
          }
          B.prec.push(pr);
        }
        return B;
      });
      res.push(R0);
    }
    return { x0, y0, x1, y1, nl: sp.nl, sp, qc, roi, res };
  });
  const progs = t.poc || main.poc ? (t.poc || main.poc).map((pg) => ({ ...pg, re: Math.min(pg.re, 33) })) : [{ rs: 0, cs: 0, lye: cod.layers, re: 33, ce: comps.length, prog: cod.prog }];
  const packets = packetOrder(tc, cod.layers, progs, tile, comps);
  const body = concat(t.data);
  let bp = 0;
  const sop = cod.scod & 2, eph = cod.scod & 4;
  for (const [l, r, c, pi] of packets) {
    const res = tc[c].res[r];
    const sp = tc[c].sp;
    if (sop && bp + 6 <= body.length && body[bp] === 255 && body[bp + 1] === 145) bp += 6;
    const bio = new Bio(body, bp, body.length);
    const contrib = [];
    if (bio.p >= body.length) throw truncated2(`the tile's packets run out at packet ${packets.indexOf(packets.find((q2) => q2[0] === l && q2[1] === r && q2[2] === c && q2[3] === pi)) + 1} of ${packets.length}`);
    if (bio.bit()) {
      for (const B of res.bands) {
        const pr = B.prec[pi];
        for (let k = 0; k < pr.cblks.length; k++) {
          const cb = pr.cblks[k], cx = k % pr.cw, cy = Math.floor(k / pr.cw);
          let inc;
          if (!cb.included) inc = pr.incl.decode(bio, cx, cy, l + 1);
          else inc = bio.bit();
          if (!inc) continue;
          if (!cb.included) {
            let i = 0;
            while (!pr.imsb.decode(bio, cx, cy, i)) i++;
            cb.numbps = B.numbps + 1 - i;
            cb.included = true;
          }
          let np;
          if (!bio.bit()) np = 1;
          else if (!bio.bit()) np = 2;
          else {
            const v = bio.bits(2);
            if (v < 3) np = 3 + v;
            else {
              const v2 = bio.bits(5);
              np = v2 < 31 ? 6 + v2 : 37 + bio.bits(7);
            }
          }
          while (bio.bit()) cb.lblock++;
          let left = np;
          while (left > 0) {
            let seg = cb.segs[cb.segs.length - 1];
            if (!seg || seg.claimed >= seg.max) {
              const max = sp.cblksty & 4 ? 1 : sp.cblksty & 1 ? !seg ? 10 : seg.max === 1 || seg.max === 10 ? 2 : 1 : 109;
              seg = { max, passes: 0, claimed: 0, chunks: [] };
              cb.segs.push(seg);
            }
            const n = Math.min(left, seg.max - seg.claimed);
            seg.claimed += n;
            const len = bio.bits(cb.lblock + floorLog2(n));
            contrib.push({ seg, len, n });
            left -= n;
          }
        }
      }
    }
    bio.align();
    bp = bio.p;
    if (eph && bp + 2 <= body.length && body[bp] === 255 && body[bp + 1] === 146) bp += 2;
    for (const k of contrib) {
      if (bp + k.len > body.length) throw truncated2(`a packet's code-block data runs past the tile (${bp + k.len - body.length} bytes)`);
      k.seg.chunks.push(body.subarray(bp, bp + k.len));
      k.seg.passes += k.n;
      bp += k.len;
    }
  }
  const irreversible = tc.map((x) => x.sp.qmfbid === 0);
  const planes = tc.map((x, c) => {
    const w = x.x1 - x.x0, h = x.y1 - x.y0;
    const plane = irreversible[c] ? new Float32Array(w * h) : new Int32Array(w * h);
    const tmp = new Int32Array(4096);
    for (let r = 0; r < x.res.length; r++) {
      const R0 = x.res[r], prev = r ? x.res[r - 1] : null;
      for (const B of R0.bands) {
        const offx = B.bandno & 1 ? prev.x1 - prev.x0 : 0, offy = B.bandno & 2 ? prev.y1 - prev.y0 : 0;
        const half = f32(0.5 * B.stepsize);
        for (const pr of B.prec) for (const cb of pr.cblks) {
          const cw = cb.x1 - cb.x0, ch = cb.y1 - cb.y0;
          const segs = cb.segs.filter((s) => s.passes > 0).map((s) => ({ data: concat(s.chunks), passes: s.passes }));
          if (!segs.length) continue;
          const bpn = x.roi + cb.numbps;
          if (bpn >= 31) throw corrupt2("a code-block of 31 or more bit-planes");
          tmp.fill(0, 0, cw * ch);
          decodeCodeBlock(cw, ch, B.bandno, bpn, cb.numbps, x.sp.cblksty, segs, tmp);
          if (x.roi) {
            const th = 2 ** x.roi;
            for (let i = 0; i < cw * ch; i++) {
              const v = tmp[i], m = Math.abs(v);
              if (m >= th) tmp[i] = v < 0 ? -(m >> x.roi) : m >> x.roi;
            }
          }
          const bx = cb.x0 - B.x0 + offx, by = cb.y0 - B.y0 + offy;
          for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
            const v = tmp[j * cw + i];
            plane[(by + j) * w + bx + i] = irreversible[c] ? f32(f32(v) * half) : Math.trunc(v / 2);
          }
        }
      }
    }
    for (let r = 1; r < x.res.length; r++) {
      const R0 = x.res[r], prev = x.res[r - 1];
      const rw = R0.x1 - R0.x0, rh = R0.y1 - R0.y0, sw = prev.x1 - prev.x0, sh = prev.y1 - prev.y0;
      const casx = R0.x0 & 1, casy = R0.y0 & 1;
      const line = irreversible[c] ? new Float32Array(Math.max(rw, rh)) : new Int32Array(Math.max(rw, rh));
      const oneD = irreversible[c] ? idwt97 : idwt53;
      for (let y = 0; y < rh; y++) {
        const o = y * w;
        for (let i = 0; i < sw; i++) line[casx ? 2 * i + 1 : 2 * i] = plane[o + i];
        for (let i = 0; i < rw - sw; i++) line[casx ? 2 * i : 2 * i + 1] = plane[o + sw + i];
        oneD(line, rw, casx);
        for (let i = 0; i < rw; i++) plane[o + i] = line[i];
      }
      for (let xx = 0; xx < rw; xx++) {
        for (let i = 0; i < sh; i++) line[casy ? 2 * i + 1 : 2 * i] = plane[i * w + xx];
        for (let i = 0; i < rh - sh; i++) line[casy ? 2 * i : 2 * i + 1] = plane[(sh + i) * w + xx];
        oneD(line, rh, casy);
        for (let i = 0; i < rh; i++) plane[i * w + xx] = line[i];
      }
    }
    return plane;
  });
  if (cod.mct && comps.length >= 3) {
    const [a, b, c] = planes;
    if (irreversible[0] !== irreversible[1] || irreversible[1] !== irreversible[2]) throw corrupt2("a colour transform over mixed wavelets");
    if (irreversible[0]) {
      for (let i = 0; i < a.length; i++) {
        const y = a[i], u = b[i], v = c[i];
        a[i] = f32(y + f32(v * f32(1.402)));
        b[i] = f32(f32(y - f32(u * f32(0.34413))) - f32(v * f32(0.71414)));
        c[i] = f32(y + f32(u * f32(1.772)));
      }
    } else {
      for (let i = 0; i < a.length; i++) {
        const y = a[i], u = b[i], v = c[i];
        const g = y - Math.floor((u + v) / 4);
        a[i] = v + g;
        b[i] = g;
        c[i] = u + g;
      }
    }
  }
  return { tile, tc, planes, irreversible };
}
function concat(parts) {
  if (parts.length === 1) return parts[0];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
function rintEven(v) {
  const f = Math.floor(v), d = v - f;
  if (d < 0.5) return f;
  if (d > 0.5) return f + 1;
  return f % 2 === 0 ? f : f + 1;
}
function decodeJpx(d) {
  const box = container(d);
  const cs = parseCodestream(d, box.cs[0], box.cs[1]);
  const { siz } = cs;
  const nc = siz.comps.length;
  if (nc !== 1 && nc !== 3) throw samples(`${nc} components; only 1 (grey) or 3 (colour) are decoded here`, { components: nc });
  for (const cp of siz.comps) {
    if (cp.dx !== 1 || cp.dy !== 1) throw samples("a sub-sampled component", { dx: cp.dx, dy: cp.dy });
    if (cp.sgnd) throw samples("signed samples");
    if (cp.prec !== 8) throw samples(`${cp.prec}-bit samples; only 8-bit are decoded here`, { precision: cp.prec });
  }
  const W2 = siz.X - siz.XO, H = siz.Y - siz.YO;
  const nTiles = ceilDiv(siz.X - siz.XTO, siz.XT) * ceilDiv(siz.Y - siz.YTO, siz.YT);
  let out = nTiles > 1 ? new Uint8Array(W2 * H * nc) : null;
  if (cs.tiles.size < nTiles) throw truncated2(`${cs.tiles.size} of ${nTiles} tiles are present`);
  let transform = null;
  for (const [no, t] of cs.tiles) {
    if (no >= nTiles) throw corrupt2(`tile ${no} of ${nTiles}`);
    const { tile, tc, planes, irreversible } = decodeTile(cs, t, no);
    transform ??= irreversible[0] ? "9/7" : "5/3";
    const shift = 1 << 7;
    if (!out) out = new Uint8Array(planes[0].buffer, 0, W2 * H * nc);
    for (let c = 0; c < nc; c++) {
      const x = tc[c], w = x.x1 - x.x0, pl = planes[c];
      for (let j = 0; j < x.y1 - x.y0; j++) for (let i = 0; i < w; i++) {
        const v = pl[j * w + i];
        let s = irreversible[c] ? v > 2147483647 ? 255 : v < -2147483648 ? 0 : rintEven(v) + shift : v + shift;
        s = s < 0 ? 0 : s > 255 ? 255 : s;
        out[((tile.y0 - siz.YO + j) * W2 + (tile.x0 - siz.XO + i)) * nc + c] = s;
      }
    }
  }
  const cod = cs.main.cod;
  return {
    width: W2,
    height: H,
    comps: nc,
    samples: out,
    detail: {
      container: box.jp2 ? "jp2" : "codestream",
      colour: box.colour,
      tiles: nTiles,
      layers: cod.layers,
      levels: cod.sp.nl,
      transform,
      progression: ["LRCP", "RLCP", "RPCL", "PCRL", "CPRL"][cod.prog] ?? cod.prog,
      colour_transform: !!cod.mct
    }
  };
}

// ../pdf-worker/src/pagepixels.mjs
var LATIN12 = new TextDecoder("latin1");
var REFUSALS = {
  NOT_A_PDF: "the bytes do not carry a %PDF- header",
  ENCRYPTED: "the document is encrypted; streams are ciphertext to this reader",
  NO_SUCH_PAGE: "the page index is outside the document",
  PAGE_UNREADABLE: "the page object could not be read",
  PAGE_HAS_TEXT_LAYER: "the page carries a text layer; it does not need pixels",
  NOT_IMAGE_ONLY: "the page carries marks that are not an embedded image",
  NO_IMAGE_ON_PAGE: "the page references no image XObject",
  MULTIPLE_IMAGES_ON_PAGE: "the page composes several images; compositing is not built",
  IMAGE_UNREADABLE: "the image XObject's stream could not be read",
  UNSUPPORTED_FILTER: "the image's filter chain has no decoder here",
  UNSUPPORTED_SAMPLES: "the image's sample layout has no decoder here",
  TRUNCATED_IMAGE_DATA: "the decoded image is short of its declared height",
  DECODE_FAILED: "the decoder could not read the image data",
  UNSUPPORTED_JPEG_PROCESS: "the JPEG is not baseline (progressive, arithmetic-coded, lossless, hierarchical or not 8-bit); only baseline is decoded here"
};
var refuse = (reason, detail = {}) => {
  if (!(reason in REFUSALS)) throw new Error(`undeclared refusal: ${reason}`);
  return { ok: false, reason, why: REFUSALS[reason], ...detail };
};
async function loadPdf2(bytes) {
  return openPdf(bytes);
}
var nameOf2 = (doc, v) => {
  v = doc.resolve(v);
  return v && v.t === "name" ? v.v : null;
};
var numOf = (doc, v) => {
  v = doc.resolve(v);
  return typeof v === "number" ? v : null;
};
function decodeParms(doc, dict, idx) {
  let p = doc.resolve(dict.DecodeParms) ?? doc.resolve(dict.DP);
  if (p && p.t === "arr") p = doc.resolve(p.items[idx] ?? p.items[p.items.length - 1]);
  return p && p.t === "dict" ? p.map : null;
}
function inheritedAttr(doc, pageMap, key) {
  let p = pageMap;
  for (let d = 0; p && d <= 32; d++) {
    if (p[key] !== void 0) return doc.resolve(p[key]);
    p = doc.dictOf(p.Parent);
  }
  return void 0;
}
function pageRotate(doc, pageMap) {
  const r = inheritedAttr(doc, pageMap, "Rotate");
  if (r === void 0) return 0;
  if (!Number.isInteger(r) || r % 90 !== 0) return null;
  return (r % 360 + 360) % 360;
}
async function pageContentText(doc, pageMap) {
  const c = doc.resolve(pageMap.Contents);
  const parts = [];
  const one = async (v) => {
    const st = doc.resolve(v);
    if (!st || st.t !== "stream") return;
    const data = await doc.streamDecoded(st);
    if (data) parts.push(LATIN12.decode(data));
  };
  if (c && c.t === "arr") {
    for (const it of c.items) await one(it);
  } else await one(pageMap.Contents);
  return parts.join("\n");
}
function maskedContent(s) {
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "(") {
      let depth = 1;
      i++;
      while (i < s.length && depth > 0) {
        if (s[i] === "\\") {
          i += 2;
          continue;
        }
        if (s[i] === "(") depth++;
        else if (s[i] === ")") depth--;
        i++;
      }
      out += " () ";
      continue;
    }
    if (ch === "<" && s[i + 1] !== "<") {
      const e = s.indexOf(">", i);
      i = e === -1 ? s.length : e + 1;
      out += " <> ";
      continue;
    }
    if (ch === "%") {
      const e = s.indexOf("\n", i);
      i = e === -1 ? s.length : e + 1;
      out += " ";
      continue;
    }
    if (ch === "B" && s[i + 1] === "I" && /[\s/]/.test(s[i + 2] || " ")) {
      const id = s.indexOf("ID", i);
      if (id !== -1) {
        const ei = s.indexOf("EI", id);
        i = ei === -1 ? s.length : ei + 2;
        out += " INLINEIMAGE ";
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}
var VECTOR_OPS = /(^|\s)(f\*?|F|B\*?|b\*?|S|s|sh)(\s|$)/;
function imageOf(doc, placement) {
  const src = imagePlacementSource(placement);
  const st = src ? src.stream : null;
  const d = st ? st.dict : {};
  return {
    name: placement.name,
    inline: placement.inline === true,
    obj: st,
    width: placement.width,
    height: placement.height,
    bpc: numOf(doc, d.BitsPerComponent),
    colorSpace: nameOf2(doc, d.ColorSpace) || (d.ColorSpace ? "\xABindirect\xBB" : null),
    isMask: doc.resolve(d.ImageMask) === true,
    filters: placement.filters
  };
}
async function analyzePage(doc, pageIndex) {
  if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= doc.pageCount) return null;
  const pageMap = doc.pageDict(pageIndex);
  if (!pageMap) return null;
  const painted = await pdfPageImages(doc, pageIndex);
  const images = painted.images ? painted.images.map((pl) => imageOf(doc, pl)) : [];
  let content = "";
  try {
    content = await pageContentText(doc, pageMap);
  } catch {
    content = "";
  }
  const masked = maskedContent(content);
  let textShown = null;
  try {
    textShown = await pageShowsText(doc, pageMap);
  } catch {
    textShown = null;
  }
  const mediaBox = (() => {
    const m = inheritedAttr(doc, pageMap, "MediaBox");
    if (!m || m.t !== "arr" || m.items.length < 4) return null;
    const v = m.items.map((x) => numOf(doc, x));
    if (v.some((x) => x == null)) return null;
    return { w: Math.abs(v[2] - v[0]), h: Math.abs(v[3] - v[1]) };
  })();
  return {
    page: pageIndex,
    contentBytes: content.length,
    contentReadable: content.length > 0 || !pageMap.Contents,
    hasTextOps: textShown === true,
    textShown,
    hasVectorOps: VECTOR_OPS.test(masked),
    hasInlineImage: masked.includes("INLINEIMAGE"),
    images: images.map(({ obj, ...rest }) => rest),
    _images: images,
    imagesWhy: painted.why,
    drawnImageNames: images.map((im) => im.name),
    imageCount: images.length,
    mediaBox,
    rotate: pageRotate(doc, pageMap)
  };
}
async function renderPageToPixels(bytes, pageIndex, opts = {}) {
  const doc = await loadPdf2(bytes);
  if (!doc) return refuse("NOT_A_PDF");
  if (doc.isEncrypted()) return refuse("ENCRYPTED");
  const a = await analyzePage(doc, pageIndex);
  if (!a) {
    const n = doc.pageCount;
    return pageIndex >= 0 && pageIndex < n ? refuse("PAGE_UNREADABLE", { page: pageIndex }) : refuse("NO_SUCH_PAGE", { page: pageIndex, pageCount: n });
  }
  if (a.rotate === null) {
    return refuse("PAGE_UNREADABLE", { page: pageIndex, note: "/Rotate is not a multiple of 90" });
  }
  if (a.hasTextOps && !opts.allowTextPage) {
    return refuse("PAGE_HAS_TEXT_LAYER", { page: pageIndex, imageCount: a.imageCount });
  }
  if (a.imagesWhy) {
    return refuse("PAGE_UNREADABLE", { page: pageIndex, note: a.imagesWhy });
  }
  if (a.imageCount === 0) {
    return refuse(a.hasVectorOps ? "NOT_IMAGE_ONLY" : "NO_IMAGE_ON_PAGE", {
      page: pageIndex,
      hasVectorOps: a.hasVectorOps,
      hasInlineImage: a.hasInlineImage
    });
  }
  if (a.imageCount > 1) {
    return refuse("MULTIPLE_IMAGES_ON_PAGE", {
      page: pageIndex,
      imageCount: a.imageCount,
      images: a.images.map((i) => ({ width: i.width, height: i.height, filters: i.filters }))
    });
  }
  const im = a._images[0];
  if (!im.obj) {
    return refuse("IMAGE_UNREADABLE", { page: pageIndex, filters: im.filters, note: "an inline image; reading inline images is not built" });
  }
  const out = await decodeImage(doc, im, { ...opts, rotate: a.rotate });
  if (!out.ok) return { ...out, page: pageIndex };
  return {
    ok: true,
    page: pageIndex,
    route: out.route,
    mediaType: out.mediaType,
    bytes: out.bytes,
    width: out.width ?? im.width,
    height: out.height ?? im.height,
    /* Are these pixels the page as a READER sees it? A route that could not
     * apply the page's own /Rotate says so HERE rather than leaving a consumer
     * to discover it in its output. See the note on rotateBilevel. */
    upright: out.upright,
    rotate_deg: a.rotate,
    source: {
      filters: im.filters,
      colorSpace: im.colorSpace,
      bitsPerComponent: im.bpc,
      imageMask: im.isMask
    },
    page_geometry: {
      mediaBoxPt: a.mediaBox,
      rotate: a.rotate,
      dpi: a.mediaBox && im.width && im.height ? { x: +(im.width / (a.mediaBox.w / 72)).toFixed(1), y: +(im.height / (a.mediaBox.h / 72)).toFixed(1) } : null
    },
    page_marks: { hasTextOps: a.hasTextOps, hasVectorOps: a.hasVectorOps },
    ...out.ccitt ? { ccitt: out.ccitt } : {},
    ...out.dct ? { dct: out.dct } : {},
    ...out.jbig2 ? { jbig2: out.jbig2 } : {},
    ...out.jpx ? { jpx: out.jpx } : {},
    /* THE DIGEST OF THE PICTURE, NOT OF THE FILE — and this field exists because
     * the cross-runtime arm of the probe found the file digest to be RUNTIME-
     * DEPENDENT. `CompressionStream("deflate")` is a platform service, and
     * workerd's and node's produce different (both valid) deflate streams for
     * identical input: the same page rendered by the same code came out
     * 147,251 B on workerd and 152,499 B on node. The PIXELS were identical.
     * A record that hashes the FILE therefore records a value no verifier on a
     * different runtime can reproduce, which is the whole point of a hash here.
     * So a decoded route also carries `pixels_sha256`, taken over the normalised
     * samples before any container is built. A pass-through route does not need
     * one: its bytes are the publisher's own and are byte-stable by definition. */
    ...out.pixelsSha256 ? { pixels_sha256: out.pixelsSha256 } : {}
  };
}
async function decodeImage(doc, im, opts) {
  const dict = im.obj.dict;
  const filters = im.filters;
  const last = filters[filters.length - 1] || null;
  if (last === "DCTDecode" || last === "DCT") {
    if (filters.length > 1) return refuse("UNSUPPORTED_FILTER", { filters, note: "DCT behind another filter" });
    const raw = doc.streamRawBytes(im.obj);
    if (!raw || raw.length < 4) return refuse("IMAGE_UNREADABLE", { filters });
    if (!(raw[0] === 255 && raw[1] === 216)) {
      return refuse("DECODE_FAILED", { filters, note: "DCT stream does not start with SOI" });
    }
    if (opts.decodeDct) return decodeDct(doc, im, raw, opts.rotate || 0);
    return {
      ok: true,
      route: "passthrough-dct",
      mediaType: "image/jpeg",
      bytes: raw,
      upright: (opts.rotate || 0) === 0
    };
  }
  if (!im.width || !im.height) return refuse("IMAGE_UNREADABLE", { filters });
  if (last === "CCITTFaxDecode" || last === "CCF") {
    let data = doc.streamRawBytes(im.obj);
    if (filters.length > 1) {
      if (filters.slice(0, -1).every((f) => f === "FlateDecode" || f === "Fl")) {
        const st = { ...im.obj, dict: { ...dict, Filter: { t: "name", v: "FlateDecode" } } };
        data = await doc.streamDecoded(st);
      } else return refuse("UNSUPPORTED_FILTER", { filters });
    }
    if (!data) return refuse("IMAGE_UNREADABLE", { filters });
    const p = decodeParms(doc, dict, filters.length - 1) || {};
    const K2 = numOf(doc, p.K) ?? 0;
    const columns = numOf(doc, p.Columns) ?? 1728;
    const rows = numOf(doc, p.Rows) ?? im.height;
    if (K2 > 0) return refuse("UNSUPPORTED_FILTER", { filters, note: "mixed-mode (K>0) CCITT is not decoded here" });
    const blackIs1 = doc.resolve(p.BlackIs1) === true;
    const byteAlign = doc.resolve(p.EncodedByteAlign) === true;
    let bits;
    try {
      bits = ccittDecode(data, { K: K2, columns, rows, byteAlign });
    } catch (e) {
      return refuse("DECODE_FAILED", { filters, note: String(e && e.message || e) });
    }
    if (bits.rowsDecoded < im.height) {
      return refuse("TRUNCATED_IMAGE_DATA", {
        filters,
        declaredHeight: im.height,
        rowsDecoded: bits.rowsDecoded,
        columns
      });
    }
    const dec = doc.resolve(dict.Decode);
    const decodeInverts = dec && dec.t === "arr" && numOf(doc, dec.items[0]) === 1;
    let invert = false;
    if (blackIs1) invert = !invert;
    if (decodeInverts) invert = !invert;
    const packed0 = invert ? bits.packed.map((b) => ~b & 255) : bits.packed;
    const rot = rotateBilevel(normalisePacked(packed0, columns, im.height), columns, im.height, opts.rotate || 0);
    const png = await encodePng1(rot.packed, rot.width, rot.height);
    return {
      ok: true,
      route: "decoded-ccitt-g4",
      mediaType: "image/png",
      bytes: png,
      width: rot.width,
      height: rot.height,
      upright: true,
      pixelsSha256: await sha256Hex(normalisePacked(rot.packed, rot.width, rot.height)),
      ccitt: { K: K2, columns, rows, blackIs1, byteAlign, rowsDecoded: bits.rowsDecoded }
    };
  }
  if (last === "JBIG2Decode") {
    let data = doc.streamRawBytes(im.obj);
    if (filters.length > 1) {
      if (!filters.slice(0, -1).every((f) => f === "FlateDecode" || f === "Fl")) return refuse("UNSUPPORTED_FILTER", { filter: last, filters });
      data = await doc.streamDecoded({ ...im.obj, dict: { ...dict, Filter: { t: "name", v: "FlateDecode" }, DecodeParms: null } });
    }
    if (!data) return refuse("IMAGE_UNREADABLE", { filters });
    const p = decodeParms(doc, dict, filters.length - 1);
    let globals = null;
    if (p && p.JBIG2Globals !== void 0) {
      const g = doc.resolve(p.JBIG2Globals);
      globals = g && g.t === "stream" ? await doc.streamDecoded(g) : null;
      if (!globals) return refuse("IMAGE_UNREADABLE", { filters, note: "the /JBIG2Globals stream could not be read" });
    }
    if (!im.isMask && (im.bpc ?? 1) !== 1) return refuse("UNSUPPORTED_SAMPLES", { filters, bpc: im.bpc, note: "a JBIG2 image is 1 bit per sample" });
    let out;
    try {
      out = decodeJbig2(data, globals);
    } catch (e) {
      if (!(e instanceof Jbig2Refusal)) return refuse("DECODE_FAILED", { filters, note: String(e && e.message || e) });
      const reason = { UNSUPPORTED: "UNSUPPORTED_FILTER", TRUNCATED: "TRUNCATED_IMAGE_DATA" }[e.code] || "DECODE_FAILED";
      return refuse(reason, { filter: last, filters, jbig2: e.code, ...e.detail });
    }
    if (out.width !== im.width || out.height > im.height) {
      return refuse("DECODE_FAILED", { filters, note: `the JBIG2 page is ${out.width}x${out.height}; the image declares ${im.width}x${im.height}` });
    }
    if (out.height < im.height) {
      return refuse("TRUNCATED_IMAGE_DATA", { filters, declaredHeight: im.height, rowsDecoded: out.height });
    }
    const samples2 = out.packed.map((b) => ~b & 255);
    const bi = await bilevelPng(doc, dict, samples2, im.width, im.height, opts.rotate || 0);
    return {
      ok: true,
      route: "decoded-jbig2",
      mediaType: "image/png",
      ...bi,
      upright: true,
      jbig2: { ...out.detail, globals_bytes: globals ? globals.length : 0, stream_bytes: data.length }
    };
  }
  if (last === "JPXDecode") {
    let data = doc.streamRawBytes(im.obj);
    if (filters.length > 1) {
      if (!filters.slice(0, -1).every((f) => f === "FlateDecode" || f === "Fl")) return refuse("UNSUPPORTED_FILTER", { filter: last, filters });
      data = await doc.streamDecoded({ ...im.obj, dict: { ...dict, Filter: { t: "name", v: "FlateDecode" }, DecodeParms: null } });
    }
    if (!data) return refuse("IMAGE_UNREADABLE", { filters });
    if (doc.resolve(dict.Decode)) return refuse("UNSUPPORTED_SAMPLES", { filters, note: "a /Decode array on a JPX image is not applied here" });
    if (im.isMask) return refuse("UNSUPPORTED_SAMPLES", { filters, note: "a JPX image mask" });
    const pdfComps = jpxColourComponents(doc, dict.ColorSpace);
    if (pdfComps === false) return refuse("UNSUPPORTED_SAMPLES", { filters, colorSpace: im.colorSpace, note: "a colour space other than DeviceGray, DeviceRGB or a 1- or 3-component ICCBased" });
    let out;
    try {
      out = decodeJpx(data);
    } catch (e) {
      if (!(e instanceof JpxRefusal)) return refuse("DECODE_FAILED", { filters, note: String(e && e.message || e) });
      const reason = { UNSUPPORTED: "UNSUPPORTED_FILTER", UNSUPPORTED_SAMPLES: "UNSUPPORTED_SAMPLES", TRUNCATED: "TRUNCATED_IMAGE_DATA" }[e.code] || "DECODE_FAILED";
      return refuse(reason, { filter: last, filters, jpx: e.code, ...e.detail });
    }
    if (pdfComps !== null && pdfComps !== out.comps) {
      return refuse("UNSUPPORTED_SAMPLES", { filters, note: `the colour space has ${pdfComps} components; the image has ${out.comps}` });
    }
    if (out.width !== im.width || out.height !== im.height) {
      return refuse("DECODE_FAILED", { filters, note: `the JPEG 2000 image is ${out.width}x${out.height}; the PDF declares ${im.width}x${im.height}` });
    }
    const rot = rotate8(out.samples, out.width, out.height, out.comps, opts.rotate || 0);
    out.samples = null;
    return {
      ok: true,
      route: "decoded-jpx",
      mediaType: "image/png",
      upright: true,
      width: rot.width,
      height: rot.height,
      pixelsSha256: await sha256Hex(rot.samples),
      bytes: await encodePng8(rot.samples, rot.width, rot.height, out.comps),
      jpx: { ...out.detail, comps: out.comps, stream_bytes: data.length }
    };
  }
  if (filters.length === 0 || filters.every((f) => f === "FlateDecode" || f === "Fl")) {
    const data = await doc.streamDecoded(im.obj);
    if (!data) return refuse("IMAGE_UNREADABLE", { filters });
    const bpc = im.isMask ? 1 : im.bpc ?? 8;
    const cs = im.colorSpace;
    const comps = im.isMask ? 1 : cs === "DeviceRGB" ? 3 : cs === "DeviceGray" ? 1 : null;
    if (comps == null) return refuse("UNSUPPORTED_SAMPLES", { colorSpace: cs, bpc, filters });
    const rowBytes = Math.ceil(im.width * comps * bpc / 8);
    const need = rowBytes * im.height;
    if (data.length < need) {
      return refuse("TRUNCATED_IMAGE_DATA", {
        filters,
        declaredHeight: im.height,
        haveBytes: data.length,
        needBytes: need
      });
    }
    if (bpc === 1 && comps === 1) {
      const bi = await bilevelPng(doc, dict, data.subarray(0, need), im.width, im.height, opts.rotate || 0);
      return { ok: true, route: "raw-samples-1bit", mediaType: "image/png", upright: true, ...bi };
    }
    if (bpc === 8) {
      const rot = rotate8(data.subarray(0, need), im.width, im.height, comps, opts.rotate || 0);
      return {
        ok: true,
        route: comps === 3 ? "raw-samples-rgb8" : "raw-samples-grey8",
        mediaType: "image/png",
        upright: true,
        width: rot.width,
        height: rot.height,
        pixelsSha256: await sha256Hex(rot.samples),
        bytes: await encodePng8(rot.samples, rot.width, rot.height, comps)
      };
    }
    return refuse("UNSUPPORTED_SAMPLES", { colorSpace: cs, bpc, comps, filters });
  }
  return refuse("UNSUPPORTED_FILTER", { filters });
}
async function bilevelPng(doc, dict, samples2, width, height, rotate) {
  const dec = doc.resolve(dict.Decode);
  const invert = !!(dec && dec.t === "arr" && numOf(doc, dec.items[0]) === 1);
  const packed0 = invert ? Uint8Array.from(samples2, (b) => ~b & 255) : Uint8Array.from(samples2);
  const rot = rotateBilevel(normalisePacked(packed0, width, height), width, height, rotate);
  return {
    width: rot.width,
    height: rot.height,
    pixelsSha256: await sha256Hex(normalisePacked(rot.packed, rot.width, rot.height)),
    bytes: await encodePng1(rot.packed, rot.width, rot.height)
  };
}
function jpxColourComponents(doc, csv) {
  const cs = doc.resolve(csv);
  if (cs == null) return null;
  if (cs.t === "name") return cs.v === "DeviceGray" ? 1 : cs.v === "DeviceRGB" ? 3 : false;
  if (cs.t === "arr" && nameOf2(doc, cs.items[0]) === "ICCBased") {
    const n = numOf(doc, doc.dictOf(cs.items[1])?.N);
    return n === 1 || n === 3 ? n : false;
  }
  return false;
}
var DCT_TO_REFUSAL = {
  UNSUPPORTED_PROCESS: "UNSUPPORTED_JPEG_PROCESS",
  UNSUPPORTED_PRECISION: "UNSUPPORTED_JPEG_PROCESS",
  UNSUPPORTED_COMPONENTS: "UNSUPPORTED_SAMPLES",
  COMPONENT_MISMATCH: "UNSUPPORTED_SAMPLES",
  UNSUPPORTED_SAMPLING: "UNSUPPORTED_SAMPLES",
  COLOR_TRANSFORM_CONFLICT: "UNSUPPORTED_SAMPLES",
  UNSUPPORTED_ROTATION: "UNSUPPORTED_SAMPLES",
  TRUNCATED: "TRUNCATED_IMAGE_DATA",
  NOT_A_JPEG: "DECODE_FAILED",
  CORRUPT_DATA: "DECODE_FAILED",
  UNSUPPORTED_FRAME: "DECODE_FAILED"
};
async function decodeDct(doc, im, raw, rotate) {
  const filters = im.filters;
  const dict = im.obj.dict;
  if (doc.resolve(dict.Decode)) return refuse("UNSUPPORTED_SAMPLES", { filters, note: "a /Decode array on a DCT image is not applied here" });
  const cs = im.colorSpace;
  const expectComps = cs === "DeviceGray" ? 1 : cs === "DeviceRGB" ? 3 : cs === "DeviceCMYK" ? 4 : null;
  const p = decodeParms(doc, dict, filters.length - 1);
  const colorTransform = p ? numOf(doc, p.ColorTransform) : null;
  let out;
  try {
    out = decodeBaselineJpeg(raw, { rotate, expectComps, colorTransform });
  } catch (e) {
    if (!(e instanceof DctRefusal)) return refuse("DECODE_FAILED", { filters, note: String(e && e.message || e) });
    return refuse(DCT_TO_REFUSAL[e.code] || "DECODE_FAILED", { filters, jpeg: e.code, ...e.detail });
  }
  const bytes = await encodePng8(out.samples, out.width, out.height, out.comps);
  return {
    ok: true,
    route: "decoded-dct",
    mediaType: "image/png",
    bytes,
    width: out.width,
    height: out.height,
    upright: true,
    pixelsSha256: await sha256Hex(out.samples),
    dct: { ...out.source, comps: out.comps, stream_bytes: raw.length }
  };
}
var WHITE_CODES = {
  "8:00110101": 0,
  "6:000111": 1,
  "4:0111": 2,
  "4:1000": 3,
  "4:1011": 4,
  "4:1100": 5,
  "4:1110": 6,
  "4:1111": 7,
  "5:10011": 8,
  "5:10100": 9,
  "5:00111": 10,
  "5:01000": 11,
  "6:001000": 12,
  "6:000011": 13,
  "6:110100": 14,
  "6:110101": 15,
  "6:101010": 16,
  "6:101011": 17,
  "7:0100111": 18,
  "7:0001100": 19,
  "7:0001000": 20,
  "7:0010111": 21,
  "7:0000011": 22,
  "7:0000100": 23,
  "7:0101000": 24,
  "7:0101011": 25,
  "7:0010011": 26,
  "7:0100100": 27,
  "7:0011000": 28,
  "8:00000010": 29,
  "8:00000011": 30,
  "8:00011010": 31,
  "8:00011011": 32,
  "8:00010010": 33,
  "8:00010011": 34,
  "8:00010100": 35,
  "8:00010101": 36,
  "8:00010110": 37,
  "8:00010111": 38,
  "8:00101000": 39,
  "8:00101001": 40,
  "8:00101010": 41,
  "8:00101011": 42,
  "8:00101100": 43,
  "8:00101101": 44,
  "8:00000100": 45,
  "8:00000101": 46,
  "8:00001010": 47,
  "8:00001011": 48,
  "8:01010010": 49,
  "8:01010011": 50,
  "8:01010100": 51,
  "8:01010101": 52,
  "8:00100100": 53,
  "8:00100101": 54,
  "8:01011000": 55,
  "8:01011001": 56,
  "8:01011010": 57,
  "8:01011011": 58,
  "8:01001010": 59,
  "8:01001011": 60,
  "8:00110010": 61,
  "8:00110011": 62,
  "8:00110100": 63,
  "5:11011": 64,
  "5:10010": 128,
  "6:010111": 192,
  "7:0110111": 256,
  "8:00110110": 320,
  "8:00110111": 384,
  "8:01100100": 448,
  "8:01100101": 512,
  "8:01101000": 576,
  "8:01100111": 640,
  "9:011001100": 704,
  "9:011001101": 768,
  "9:011010010": 832,
  "9:011010011": 896,
  "9:011010100": 960,
  "9:011010101": 1024,
  "9:011010110": 1088,
  "9:011010111": 1152,
  "9:011011000": 1216,
  "9:011011001": 1280,
  "9:011011010": 1344,
  "9:011011011": 1408,
  "9:010011000": 1472,
  "9:010011001": 1536,
  "9:010011010": 1600,
  "6:011000": 1664,
  "9:010011011": 1728
};
var BLACK_CODES = {
  "10:0000110111": 0,
  "3:010": 1,
  "2:11": 2,
  "2:10": 3,
  "3:011": 4,
  "4:0011": 5,
  "4:0010": 6,
  "5:00011": 7,
  "6:000101": 8,
  "6:000100": 9,
  "7:0000100": 10,
  "7:0000101": 11,
  "7:0000111": 12,
  "8:00000100": 13,
  "8:00000111": 14,
  "9:000011000": 15,
  "10:0000010111": 16,
  "10:0000011000": 17,
  "10:0000001000": 18,
  "11:00001100111": 19,
  "11:00001101000": 20,
  "11:00001101100": 21,
  "11:00000110111": 22,
  "11:00000101000": 23,
  "11:00000010111": 24,
  "11:00000011000": 25,
  "12:000011001010": 26,
  "12:000011001011": 27,
  "12:000011001100": 28,
  "12:000011001101": 29,
  "12:000001101000": 30,
  "12:000001101001": 31,
  "12:000001101010": 32,
  "12:000001101011": 33,
  "12:000011010010": 34,
  "12:000011010011": 35,
  "12:000011010100": 36,
  "12:000011010101": 37,
  "12:000011010110": 38,
  "12:000011010111": 39,
  "12:000001101100": 40,
  "12:000001101101": 41,
  "12:000011011010": 42,
  "12:000011011011": 43,
  "12:000001010100": 44,
  "12:000001010101": 45,
  "12:000001010110": 46,
  "12:000001010111": 47,
  "12:000001100100": 48,
  "12:000001100101": 49,
  "12:000001010010": 50,
  "12:000001010011": 51,
  "12:000000100100": 52,
  "12:000000110111": 53,
  "12:000000111000": 54,
  "12:000000100111": 55,
  "12:000000101000": 56,
  "12:000001011000": 57,
  "12:000001011001": 58,
  "12:000000101011": 59,
  "12:000000101100": 60,
  "12:000001011010": 61,
  "12:000001100110": 62,
  "12:000001100111": 63,
  "10:0000001111": 64,
  "12:000011001000": 128,
  "12:000011001001": 192,
  "12:000001011011": 256,
  "12:000000110011": 320,
  "12:000000110100": 384,
  "12:000000110101": 448,
  "13:0000001101100": 512,
  "13:0000001101101": 576,
  "13:0000001001010": 640,
  "13:0000001001011": 704,
  "13:0000001001100": 768,
  "13:0000001001101": 832,
  "13:0000001110010": 896,
  "13:0000001110011": 960,
  "13:0000001110100": 1024,
  "13:0000001110101": 1088,
  "13:0000001110110": 1152,
  "13:0000001110111": 1216,
  "13:0000001010010": 1280,
  "13:0000001010011": 1344,
  "13:0000001010100": 1408,
  "13:0000001010101": 1472,
  "13:0000001011010": 1536,
  "13:0000001011011": 1600,
  "13:0000001100100": 1664,
  "13:0000001100101": 1728
};
var EXT_CODES = {
  "11:00000001000": 1792,
  "11:00000001100": 1856,
  "11:00000001101": 1920,
  "12:000000010010": 1984,
  "12:000000010011": 2048,
  "12:000000010100": 2112,
  "12:000000010101": 2176,
  "12:000000010110": 2240,
  "12:000000010111": 2304,
  "12:000000011100": 2368,
  "12:000000011101": 2432,
  "12:000000011110": 2496,
  "12:000000011111": 2560
};
var WHITE_ALL = { ...WHITE_CODES, ...EXT_CODES };
var BLACK_ALL = { ...BLACK_CODES, ...EXT_CODES };
var MAX_CODE_BITS = 14;
var BitReader = class {
  constructor(data) {
    this.d = data;
    this.pos = 0;
  }
  get eof() {
    return this.pos >= this.d.length * 8;
  }
  peek(n) {
    let v = "";
    for (let i = 0; i < n; i++) {
      const p = this.pos + i;
      const byte = this.d[p >> 3];
      v += byte === void 0 ? "0" : byte >> 7 - (p & 7) & 1 ? "1" : "0";
    }
    return v;
  }
  skip(n) {
    this.pos += n;
  }
  align() {
    this.pos = this.pos + 7 & ~7;
  }
};
function readRun(br, table2) {
  let total = 0;
  for (; ; ) {
    let hit = null;
    const window = br.peek(MAX_CODE_BITS);
    for (let len = 2; len <= MAX_CODE_BITS; len++) {
      const key = `${len}:${window.slice(0, len)}`;
      if (key in table2) {
        hit = { len, run: table2[key] };
        break;
      }
    }
    if (!hit) return null;
    br.skip(hit.len);
    total += hit.run;
    if (hit.run < 64) return total;
    if (br.eof) return total;
  }
}
function ccittDecode(data, { K: K2 = 0, columns = 1728, rows = 0, byteAlign = false }) {
  const br = new BitReader(data);
  const rowBytes = Math.ceil(columns / 8);
  const out = [];
  let ref = [columns, columns];
  const maxRows = rows && rows > 0 ? rows : 1 << 20;
  const eol = () => br.peek(12) === "000000000001";
  if (K2 > 0) throw new Error("mixed-mode (K>0) CCITT is not decoded here");
  for (let r = 0; r < maxRows; r++) {
    if (byteAlign) br.align();
    while (eol()) {
      br.skip(12);
      if (K2 > 0) br.skip(1);
    }
    if (br.eof) break;
    const twoD = K2 < 0;
    const cur = [];
    let a0 = -1;
    let color = 0;
    let guard = 0;
    let broken = false;
    while (a0 < columns) {
      if (++guard > columns * 4 + 64) throw new Error("row did not terminate");
      if (br.eof) {
        broken = true;
        break;
      }
      if (twoD) {
        const w = br.peek(7);
        let a1;
        if (w[0] === "1") {
          br.skip(1);
          a1 = b1(ref, a0, color);
        } else if (w.startsWith("011")) {
          br.skip(3);
          a1 = b1(ref, a0, color) + 1;
        } else if (w.startsWith("010")) {
          br.skip(3);
          a1 = b1(ref, a0, color) - 1;
        } else if (w.startsWith("001")) {
          br.skip(3);
          const s = a0 < 0 ? 0 : a0;
          const r1 = readRun(br, color === 0 ? WHITE_ALL : BLACK_ALL);
          const r2 = readRun(br, color === 0 ? BLACK_ALL : WHITE_ALL);
          if (r1 == null || r2 == null) {
            broken = true;
            break;
          }
          const m1 = Math.min(columns, s + r1);
          const m2 = Math.min(columns, m1 + r2);
          cur.push(m1, m2);
          a0 = m2;
          continue;
        } else if (w.startsWith("0001")) {
          br.skip(4);
          a0 = b2(ref, a0, color);
          continue;
        } else if (w.startsWith("000011")) {
          br.skip(6);
          a1 = b1(ref, a0, color) + 2;
        } else if (w.startsWith("000010")) {
          br.skip(6);
          a1 = b1(ref, a0, color) - 2;
        } else if (w.startsWith("0000011")) {
          br.skip(7);
          a1 = b1(ref, a0, color) + 3;
        } else if (w.startsWith("0000010")) {
          br.skip(7);
          a1 = b1(ref, a0, color) - 3;
        } else {
          broken = true;
          break;
        }
        a1 = Math.max(0, Math.min(columns, a1));
        cur.push(a1);
        a0 = a1;
        color ^= 1;
      } else {
        const s = a0 < 0 ? 0 : a0;
        const run = readRun(br, color === 0 ? WHITE_ALL : BLACK_ALL);
        if (run == null) {
          broken = true;
          break;
        }
        const m = Math.min(columns, s + run);
        cur.push(m);
        a0 = m;
        color ^= 1;
      }
    }
    if (broken) break;
    const row = new Uint8Array(rowBytes).fill(255);
    let pos = 0, c = 0;
    for (const t of cur) {
      if (c === 1) for (let x = pos; x < t && x < columns; x++) row[x >> 3] &= ~(128 >> (x & 7));
      pos = t;
      c ^= 1;
      if (pos >= columns) break;
    }
    if (c === 1 && pos < columns) {
      for (let x = pos; x < columns; x++) row[x >> 3] &= ~(128 >> (x & 7));
    }
    out.push(row);
    ref = cur.length ? cur.concat([columns, columns]) : [columns, columns];
  }
  const packed = new Uint8Array(out.length * rowBytes);
  out.forEach((row, i) => packed.set(row, i * rowBytes));
  return { packed, rowsDecoded: out.length };
}
function b1(ref, a0, color) {
  let i = 0;
  while (i < ref.length && ref[i] <= a0) i++;
  while (i < ref.length && (i & 1) !== color) i++;
  return i < ref.length ? ref[i] : ref[ref.length - 1];
}
function b2(ref, a0, color) {
  let i = 0;
  while (i < ref.length && ref[i] <= a0) i++;
  while (i < ref.length && (i & 1) !== color) i++;
  return i + 1 < ref.length ? ref[i + 1] : ref[ref.length - 1];
}
function getBit(packed, rowBytes, x, y) {
  return packed[y * rowBytes + (x >> 3)] >> 7 - (x & 7) & 1;
}
function setBit(packed, rowBytes, x, y, v) {
  const i = y * rowBytes + (x >> 3), m = 128 >> (x & 7);
  if (v) packed[i] |= m;
  else packed[i] &= ~m;
}
function rotate8(samples2, width, height, comps, deg) {
  const d = (deg % 360 + 360) % 360;
  if (d === 0) return { samples: samples2, width, height };
  if (d !== 90 && d !== 180 && d !== 270) throw new Error(`unsupported rotation ${deg}`);
  const [w2, h2] = d === 180 ? [width, height] : [height, width];
  const out = new Uint8Array(samples2.length);
  for (let Y = 0; Y < h2; Y++) {
    for (let X = 0; X < w2; X++) {
      let sx, sy;
      if (d === 90) {
        sx = Y;
        sy = height - 1 - X;
      } else if (d === 180) {
        sx = width - 1 - X;
        sy = height - 1 - Y;
      } else {
        sx = width - 1 - Y;
        sy = X;
      }
      const o = (Y * w2 + X) * comps, i = (sy * width + sx) * comps;
      for (let c = 0; c < comps; c++) out[o + c] = samples2[i + c];
    }
  }
  return { samples: out, width: w2, height: h2 };
}
function rotateBilevel(packed, width, height, deg) {
  const d = (deg % 360 + 360) % 360;
  if (d === 0) return { packed, width, height };
  if (d !== 90 && d !== 180 && d !== 270) throw new Error(`unsupported rotation ${deg}`);
  const srcRow = Math.ceil(width / 8);
  const [w2, h2] = d === 180 ? [width, height] : [height, width];
  const dstRow = Math.ceil(w2 / 8);
  const out = new Uint8Array(dstRow * h2);
  for (let Y = 0; Y < h2; Y++) {
    for (let X = 0; X < w2; X++) {
      let sx, sy;
      if (d === 90) {
        sx = Y;
        sy = height - 1 - X;
      } else if (d === 180) {
        sx = width - 1 - X;
        sy = height - 1 - Y;
      } else {
        sx = width - 1 - Y;
        sy = X;
      }
      setBit(out, dstRow, X, Y, getBit(packed, srcRow, sx, sy));
    }
  }
  return { packed: out, width: w2, height: h2 };
}
async function sha256Hex(u8) {
  const d = await crypto.subtle.digest("SHA-256", u8);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
var CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 4294967295;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
async function deflateZlib(bytes) {
  const cs = new CompressionStream("deflate");
  const w = cs.writable.getWriter();
  w.write(bytes);
  w.close();
  const chunks = [];
  const rd = cs.readable.getReader();
  for (; ; ) {
    const { done, value } = await rd.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}
function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}
async function buildPng(raw, width, height, bitDepth, colorType) {
  return buildPngFromIdat(await deflateZlib(raw), width, height, bitDepth, colorType);
}
function buildPngFromIdat(idat, width, height, bitDepth, colorType) {
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  ihdr[8] = bitDepth;
  ihdr[9] = colorType;
  const parts = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", new Uint8Array(0))
  ];
  const total = parts.reduce((n, p) => n + p.length, 0);
  const png = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    png.set(p, o);
    o += p.length;
  }
  return png;
}
async function encodePng1(packed, width, height) {
  const rowBytes = Math.ceil(width / 8);
  const pad = rowBytes * 8 - width;
  const mask = pad ? 255 << pad & 255 : 255;
  const raw = new Uint8Array((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowBytes + 1)] = 0;
    raw.set(packed.subarray(y * rowBytes, (y + 1) * rowBytes), y * (rowBytes + 1) + 1);
    if (pad) raw[(y + 1) * (rowBytes + 1) - 1] &= mask;
  }
  return buildPng(raw, width, height, 1, 0);
}
function normalisePacked(packed, width, height) {
  const rowBytes = Math.ceil(width / 8);
  const pad = rowBytes * 8 - width;
  const out = Uint8Array.from(packed);
  if (!pad) return out;
  const mask = 255 << pad & 255;
  for (let y = 0; y < height; y++) out[(y + 1) * rowBytes - 1] &= mask;
  return out;
}
async function encodePng8(samples2, width, height, comps) {
  const rowBytes = width * comps;
  const band = Math.max(1, Math.floor((1 << 20) / (rowBytes + 1)));
  const cs = new CompressionStream("deflate");
  const w = cs.writable.getWriter();
  const reading = (async () => {
    const chunks2 = [];
    const rd = cs.readable.getReader();
    for (; ; ) {
      const { done, value } = await rd.read();
      if (done) break;
      chunks2.push(value);
    }
    return chunks2;
  })();
  for (let y0 = 0; y0 < height; y0 += band) {
    const n = Math.min(band, height - y0);
    const raw = new Uint8Array((rowBytes + 1) * n);
    for (let k = 0; k < n; k++) {
      raw.set(samples2.subarray((y0 + k) * rowBytes, (y0 + k + 1) * rowBytes), k * (rowBytes + 1) + 1);
    }
    await w.write(raw);
  }
  await w.close();
  const chunks = await reading;
  const idat = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) {
    idat.set(c, o);
    o += c.length;
  }
  return buildPngFromIdat(idat, width, height, 8, comps === 3 ? 2 : 0);
}

// src/pngsamples.mjs
var PNG_REFUSALS = {
  NOT_A_PNG: "the bytes do not carry a PNG signature",
  PNG_TRUNCATED: "a PNG chunk runs past the end of the bytes",
  PNG_NO_IHDR: "the PNG carries no IHDR",
  PNG_NO_IDAT: "the PNG carries no image data",
  PNG_INTERLACED: "the PNG is interlaced; this reader reads only the non-interlaced form it writes",
  PNG_UNSUPPORTED_SHAPE: "the PNG's colour type / bit depth pair is not one this estate writes",
  PNG_FILTER_UNSUPPORTED: "a scanline uses a filter type this reader does not implement",
  PNG_SHORT_RASTER: "the inflated raster is shorter than the header's dimensions require"
};
var refuse2 = (code, detail = {}) => ({ ok: false, reason: code, detail: PNG_REFUSALS[code], ...detail });
var SIG2 = [137, 80, 78, 71, 13, 10, 26, 10];
async function inflateZlib(bytes) {
  const ds = new DecompressionStream("deflate");
  const w = ds.writable.getWriter();
  w.write(bytes);
  w.close();
  const chunks = [];
  const rd = ds.readable.getReader();
  for (; ; ) {
    const { done, value } = await rd.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) {
    out.set(c, o);
    o += c.length;
  }
  return out;
}
async function pngToSamples(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b.length < 8 || SIG2.some((v, i) => b[i] !== v)) return refuse2("NOT_A_PNG");
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let width = 0, height = 0, bitDepth = 0, colorType = -1, interlace = 0, sawIhdr = false;
  const idats = [];
  let p = 8;
  while (p + 8 <= b.length) {
    const len = dv.getUint32(p);
    const type = String.fromCharCode(b[p + 4], b[p + 5], b[p + 6], b[p + 7]);
    const dataAt = p + 8;
    if (dataAt + len + 4 > b.length) return refuse2("PNG_TRUNCATED", { chunk: type, at: p });
    if (type === "IHDR") {
      if (len < 13) return refuse2("PNG_TRUNCATED", { chunk: "IHDR" });
      width = dv.getUint32(dataAt);
      height = dv.getUint32(dataAt + 4);
      bitDepth = b[dataAt + 8];
      colorType = b[dataAt + 9];
      interlace = b[dataAt + 12];
      sawIhdr = true;
    } else if (type === "IDAT") {
      idats.push(b.subarray(dataAt, dataAt + len));
    } else if (type === "IEND") break;
    p = dataAt + len + 4;
  }
  if (!sawIhdr) return refuse2("PNG_NO_IHDR");
  if (!idats.length) return refuse2("PNG_NO_IDAT");
  if (interlace !== 0) return refuse2("PNG_INTERLACED", { interlace });
  const comps = colorType === 0 ? 1 : colorType === 2 ? 3 : null;
  if (comps == null || !(bitDepth === 8 || bitDepth === 1 && comps === 1))
    return refuse2("PNG_UNSUPPORTED_SHAPE", { colorType, bitDepth });
  if (!width || !height) return refuse2("PNG_UNSUPPORTED_SHAPE", { width, height });
  let z;
  if (idats.length === 1) z = idats[0];
  else {
    z = new Uint8Array(idats.reduce((n, c) => n + c.length, 0));
    let o = 0;
    for (const c of idats) {
      z.set(c, o);
      o += c.length;
    }
  }
  const raw = await inflateZlib(z);
  const rowBytes = bitDepth === 1 ? Math.ceil(width / 8) : width * comps;
  if (raw.length < (rowBytes + 1) * height)
    return refuse2("PNG_SHORT_RASTER", { have: raw.length, need: (rowBytes + 1) * height, width, height });
  const packed = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (rowBytes + 1)];
    if (f !== 0) return refuse2("PNG_FILTER_UNSUPPORTED", { row: y, filter: f });
    packed.set(raw.subarray(y * (rowBytes + 1) + 1, (y + 1) * (rowBytes + 1)), y * rowBytes);
  }
  return { ok: true, width, height, bitDepth, comps, packed, rowBytes };
}
function samplesToRgba({ width, height, bitDepth, comps, packed, rowBytes }) {
  const rgba = new Uint8Array(width * height * 4);
  let j = 0;
  if (bitDepth === 1) {
    for (let y = 0; y < height; y++) {
      const row = y * rowBytes;
      for (let x = 0; x < width; x++) {
        const v = packed[row + (x >> 3)] >> 7 - (x & 7) & 1 ? 255 : 0;
        rgba[j] = v;
        rgba[j + 1] = v;
        rgba[j + 2] = v;
        rgba[j + 3] = 255;
        j += 4;
      }
    }
    return rgba;
  }
  for (let y = 0; y < height; y++) {
    const row = y * rowBytes;
    for (let x = 0; x < width; x++) {
      const s = row + x * comps;
      const r = packed[s], g = comps === 3 ? packed[s + 1] : r, bl = comps === 3 ? packed[s + 2] : r;
      rgba[j] = r;
      rgba[j + 1] = g;
      rgba[j + 2] = bl;
      rgba[j + 3] = 255;
      j += 4;
    }
  }
  return rgba;
}

// src/contract.mjs
var CAP = "C";
var MEASURED_BY = "MEASUREMENTS.md 2026-09-10 (CPDF-15) \u2014 tesseract-wasm@0.11.0 SIMD + tessdata_fast eng on the deployed Workers runtime: 99.89% characters and 89/90 digits with ZERO minted on the one human-ground-truthed page (Oakland Legistar attachment 15721260 p2, 300 dpi), reproducible over identical bytes (9 images x 3 runs, no image gave more than one distinct text), the invention band EMPTY at every rung of CPDF-11's ladder. REACH, STATED: ONE ground-truthed page, ONE engine version, ONE model. Every other corpus figure in that row is agreement-with-the-local-floor and NOT accuracy \u2014 and D-314/CPDF-16 measured that NEITHER local model passes the noise control, so no agreement figure may be read as accuracy at all.";
var MAX_FRAME_BYTES = 613e5;
var frameBytesOf = (w, h) => w * h * 4;
var REFUSALS2 = {
  R2_NOT_CONFIGURED: "this member holds no CAPTURES binding, so it cannot read the bytes",
  BAD_SHA: "capture_sha must be 64 lowercase hex",
  BAD_STORE: "store must be named: this member reads a capture from one namespace and guesses none",
  /* D-478. Deliberately says what it is NOT as well as what it is: the answer this replaces was NOT_FOUND, and a
     reader who cannot tell the two apart reads "there is no such capture" where the truth is "there is no such
     namespace" (CLAUDE.md §1 — *not found* is not *absent*). */
  NAMESPACE_UNKNOWN: "no namespace by that name exists on any instance this member can be bound to, so nothing was read; the two that exist are listed beside this message. This is not NOT_FOUND, which says the namespace exists and holds no such capture",
  BAD_PAGES: "pages must be a non-empty array of 0-based page numbers",
  NOT_FOUND: "no capture with that sha in that store",
  ENGINE_ABSENT: "the OCR engine did not load; this member cannot transcribe anything",
  PAGE_NOT_RENDERABLE: "the page could not be turned into pixels, and the renderer says why",
  FRAME_OVER_MEASURED_BOUND: "this page's frame is larger than the largest frame measured to complete",
  PIXELS_UNREADABLE: "the rendered container could not be read back to samples",
  ENGINE_FAILED: "the engine refused or failed on this frame",
  NOTHING_TRANSCRIBED: "the engine returned no anchorable word for this page"
};
function chooseChunk(pages) {
  const clean = [];
  for (const p of Array.isArray(pages) ? pages : [])
    if (Number.isInteger(p) && p >= 0 && !clean.includes(p)) clean.push(p);
  clean.sort((a, b) => a - b);
  return { take: clean.length ? clean[0] : null, deferred: clean.slice(1) };
}

// src/member.mjs
var NAMESPACES = Object.freeze(["bio", "scratch"]);
var json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
});
function floorFrom(env) {
  const raw = env && env.OCR_CONFIDENCE_FLOOR;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : null;
}
function makeMember(engine, { render = renderPageToPixels } = {}) {
  async function transcribeOnePage(bytes, page, { psm = null, confidenceFloor = null } = {}) {
    const engineWhy = engine.check();
    if (engineWhy)
      return { ok: false, reason: "ENGINE_ABSENT", detail: REFUSALS2.ENGINE_ABSENT, why: engineWhy };
    const rendered = await render(bytes, page, { decodeDct: true });
    if (!rendered || !rendered.ok)
      return {
        ok: false,
        reason: "PAGE_NOT_RENDERABLE",
        detail: REFUSALS2.PAGE_NOT_RENDERABLE,
        page,
        render: rendered ? {
          reason: rendered.reason,
          why: REFUSALS[rendered.reason] || null,
          detail: rendered
        } : null
      };
    if (rendered.mediaType !== "image/png")
      return {
        ok: false,
        reason: "PIXELS_UNREADABLE",
        detail: REFUSALS2.PIXELS_UNREADABLE,
        page,
        route: rendered.route,
        mediaType: rendered.mediaType,
        why: `the ${rendered.route} route hands back ${rendered.mediaType} bytes, and no decoder for that container is built into this member \u2014 workerd has neither a canvas nor createImageBitmap. This page is not transcribed and is not guessed at.`
      };
    const frame = frameBytesOf(rendered.width, rendered.height);
    if (frame > MAX_FRAME_BYTES)
      return {
        ok: false,
        reason: "FRAME_OVER_MEASURED_BOUND",
        detail: REFUSALS2.FRAME_OVER_MEASURED_BOUND,
        page,
        width: rendered.width,
        height: rendered.height,
        frame_bytes: frame,
        bound_bytes: MAX_FRAME_BYTES,
        why: `a ${rendered.width}x${rendered.height} page needs a ${frame} B RGBA frame; the largest frame MEASURED to complete on this runtime is ${MAX_FRAME_BYTES} B and a 75,700,000 B frame was KILLED (CPDF-15, reproduced). This is a workload size and NOT a share of any ceiling \u2014 the platform's memory figure is not the isolate's budget (D-312). Refused rather than attempted: being killed returns no answer and no reason.`
      };
    const samples2 = await pngToSamples(rendered.bytes);
    if (!samples2.ok)
      return {
        ok: false,
        reason: "PIXELS_UNREADABLE",
        detail: REFUSALS2.PIXELS_UNREADABLE,
        page,
        route: rendered.route,
        png: samples2
      };
    const rgba = samplesToRgba(samples2);
    samples2.packed = null;
    let out;
    try {
      out = await engine.transcribeFrame(rgba, samples2.width, samples2.height, { psm });
    } catch (e) {
      out = { ok: false, error: String(e && e.message || e), name: e && e.name };
    }
    if (!out || !out.ok)
      return {
        ok: false,
        reason: "ENGINE_FAILED",
        detail: REFUSALS2.ENGINE_FAILED,
        page,
        frame_bytes: frame,
        engine_error: out ? out.error : "the engine answered nothing",
        engine_error_name: out ? out.name : void 0
      };
    const ref = `p${page}`;
    const regions = [];
    let unanchored = 0, blank = 0, unrated = 0;
    for (const w of out.regions || []) {
      const text = w && w.text;
      if (!(typeof text === "string" && text.trim().length)) {
        blank++;
        continue;
      }
      const rect = Array.isArray(w.rect) && w.rect.length === 4 ? w.rect : null;
      if (!rect || !rect.every((n) => typeof n === "number" && Number.isFinite(n))) {
        unanchored++;
        continue;
      }
      const [l, t0, r, b] = rect;
      const c = w.confidence;
      const rated = typeof c === "number" && c >= 0 && c <= 1;
      if (!rated) unrated++;
      regions.push({
        text,
        source: {
          kind: "pdf-page",
          ref,
          page,
          rect: [l, t0, r, b],
          space: "image-px",
          image: {
            width: samples2.width,
            height: samples2.height,
            route: rendered.route,
            upright: rendered.upright,
            rotate_deg: rendered.rotate_deg,
            pixels_sha256: rendered.pixels_sha256 || null
          }
        },
        confidence: rated ? { value: c, basis: "engine" } : "none"
      });
    }
    const boxes2 = Number.isInteger(out.boxCount) ? out.boxCount : (out.regions || []).length;
    if (!regions.length)
      return {
        ok: false,
        reason: "NOTHING_TRANSCRIBED",
        detail: REFUSALS2.NOTHING_TRANSCRIBED,
        page,
        boxes: boxes2,
        blank,
        unanchored,
        why: `the engine boxed ${boxes2} region(s) and none of them carried both text and a usable rectangle, so there is nothing this record could anchor. An engine that answers nothing on a page is a FINDING and not an error: CPDF-15 measured this engine returning the empty string on noise and at CPDF-11's R3 rung, which is the self-refusal that makes its clean-run figures worth anything.`
      };
    return {
      ok: true,
      page,
      regions,
      unanchored,
      blank,
      unrated,
      grain: out.grain,
      image: {
        width: samples2.width,
        height: samples2.height,
        frame_bytes: frame,
        route: rendered.route,
        upright: rendered.upright,
        rotate_deg: rendered.rotate_deg,
        dpi: rendered.page_geometry ? rendered.page_geometry.dpi : null,
        pixels_sha256: rendered.pixels_sha256 || null
      },
      confidence_floor: confidenceFloor
    };
  }
  async function transcribeRequest(bytes, pages, opts = {}) {
    const { take, deferred } = chooseChunk(pages);
    if (take == null)
      return { ok: false, reason: "BAD_PAGES", detail: REFUSALS2.BAD_PAGES };
    const one = await transcribeOnePage(bytes, take, opts);
    const notes = [];
    if (deferred.length)
      notes.push(`this member transcribes ONE PAGE PER INVOCATION and ${deferred.length} further page(s) (${deferred.join(", ")}) were NOT transcribed by this call. The bound is MEMORY and it was measured by refusal: a 61.3 MB RGBA frame completes and a 75.7 MB frame is killed (CPDF-15). Whole-document invocation is UNMEASURED, so it is refused rather than assumed \u2014 call again per page. Those pages keep their markers and stay honestly unread.`);
    if (!one.ok)
      return {
        ok: false,
        reason: one.reason,
        detail: one.detail,
        page: take,
        deferred,
        notes: notes.concat(one.why ? [one.why] : []),
        refusal: one
      };
    if (one.unanchored)
      notes.push(`${one.unanchored} region(s) the engine returned carried no usable rectangle and were dropped rather than recorded \u2014 text nobody can point at a page to verify is exactly what this path refuses to put in the record.`);
    if (one.unrated)
      notes.push(`${one.unrated} region(s) came back with no engine-computed confidence and are stated as 'none' rather than given a number this member would have had to invent.`);
    return {
      ok: true,
      engine: engine.name,
      version: engine.version,
      model: engine.model,
      cap: CAP,
      measured_by: MEASURED_BY,
      confidence_floor: one.confidence_floor,
      pages: [{ page: one.page, regions: one.regions }],
      /* The GRAIN is on the wire because it is the grain of a LINE in the record's text: the plane joins region
         texts with a newline. */
      grain: one.grain,
      deferred,
      image: one.image,
      notes
    };
  }
  async function handleTranscribe(req, env) {
    if (typeof env?.CAPTURES?.get !== "function")
      return json({ ok: false, reason: "R2_NOT_CONFIGURED", detail: REFUSALS2.R2_NOT_CONFIGURED }, 503);
    const body = await req.json().catch(() => null);
    const sha = typeof body?.capture_sha === "string" ? body.capture_sha.toLowerCase() : "";
    if (!/^[0-9a-f]{64}$/.test(sha))
      return json({ ok: false, reason: "BAD_SHA", detail: REFUSALS2.BAD_SHA }, 400);
    if (typeof body?.store !== "string")
      return json({ ok: false, reason: "BAD_STORE", detail: REFUSALS2.BAD_STORE }, 400);
    const store = body.store;
    if (!NAMESPACES.includes(store))
      return json({
        ok: false,
        reason: "NAMESPACE_UNKNOWN",
        detail: REFUSALS2.NAMESPACE_UNKNOWN,
        asked: store.slice(0, 80),
        namespaces: [...NAMESPACES]
      }, 400);
    const pages = Array.isArray(body?.pages) ? body.pages : null;
    if (!pages || !pages.length)
      return json({ ok: false, reason: "BAD_PAGES", detail: REFUSALS2.BAD_PAGES }, 400);
    const obj = await env.CAPTURES.get(`${store}/captures/${sha}`);
    if (!obj) return json({ ok: false, reason: "NOT_FOUND", detail: REFUSALS2.NOT_FOUND, capture_sha: sha, store }, 404);
    const bytes = new Uint8Array(await obj.arrayBuffer());
    const out = await transcribeRequest(bytes, pages, {
      confidenceFloor: floorFrom(env),
      psm: env && env.OCR_PSM ? env.OCR_PSM : null
    });
    if (!out.ok && out.reason === "BAD_PAGES") return json(out, 400);
    return json(out);
  }
  function handleVersion(env) {
    const why = engine.check();
    return json({
      ok: true,
      name: "ocr-worker",
      version: env?.VERSION || "0.0.0",
      engine: engine.name,
      engine_version: engine.version,
      model: engine.model,
      engine_loaded: why == null,
      ...why ? { engine_unavailable: why } : {}
    });
  }
  async function fetch2(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (req.method === "GET" && path === "version") return handleVersion(env);
    if (req.method === "POST" && (path === "transcribe" || path === ""))
      return handleTranscribe(req, env);
    return json({ ok: false, reason: "UNKNOWN", detail: "POST /transcribe or GET /version only" }, 404);
  }
  return { fetch: fetch2, transcribeRequest, transcribeOnePage };
}

// src/tessengine.mjs
import wasmModule from "../assets/tesseract-core.wasm";
import MODEL from "../assets/eng.traineddata";

// src/tesslib.mjs
var proxyMarker = Symbol("Comlink.proxy");
var createEndpoint = Symbol("Comlink.endpoint");
var releaseProxy = Symbol("Comlink.releaseProxy");
var finalizer = Symbol("Comlink.finalizer");
var throwMarker = Symbol("Comlink.thrown");
function isMessagePort(endpoint) {
  return endpoint.constructor.name === "MessagePort";
}
function closeEndPoint(endpoint) {
  if (isMessagePort(endpoint))
    endpoint.close();
}
function releaseEndpoint(ep) {
  return requestResponseMessage(ep, {
    type: "RELEASE"
  }).then(() => {
    closeEndPoint(ep);
  });
}
var proxyCounter = /* @__PURE__ */ new WeakMap();
var proxyFinalizers = "FinalizationRegistry" in globalThis && new FinalizationRegistry((ep) => {
  const newCount = (proxyCounter.get(ep) || 0) - 1;
  proxyCounter.set(ep, newCount);
  if (newCount === 0) {
    releaseEndpoint(ep);
  }
});
function requestResponseMessage(ep, msg, transfers) {
  return new Promise((resolve2) => {
    const id = generateUUID();
    ep.addEventListener("message", function l(ev) {
      if (!ev.data || !ev.data.id || ev.data.id !== id) {
        return;
      }
      ep.removeEventListener("message", l);
      resolve2(ev.data);
    });
    if (ep.start) {
      ep.start();
    }
    ep.postMessage(Object.assign({ id }, msg), transfers);
  });
}
function generateUUID() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
function imageDataFromBitmap(bitmap2) {
  let canvas;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(bitmap2.width, bitmap2.height);
  } else if (typeof HTMLCanvasElement !== "undefined") {
    const canvasEl = document.createElement("canvas");
    canvasEl.width = bitmap2.width;
    canvasEl.height = bitmap2.height;
    canvas = canvasEl;
  } else {
    throw new Error("No canvas implementation available");
  }
  const context = canvas.getContext("2d");
  context.drawImage(bitmap2, 0, 0, bitmap2.width, bitmap2.height);
  return context.getImageData(0, 0, bitmap2.width, bitmap2.height);
}
var Module = (() => {
  var _scriptDir = import.meta.url;
  return (function(Module2 = {}) {
    var Module2 = typeof Module2 != "undefined" ? Module2 : {};
    var readyPromiseResolve, readyPromiseReject;
    Module2["ready"] = new Promise(function(resolve2, reject) {
      readyPromiseResolve = resolve2;
      readyPromiseReject = reject;
    });
    var moduleOverrides = Object.assign({}, Module2);
    var thisProgram = "./this.program";
    var ENVIRONMENT_IS_WEB = true;
    var scriptDirectory = "";
    function locateFile2(path) {
      if (Module2["locateFile"]) {
        return Module2["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var readBinary;
    {
      if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptDir) {
        scriptDirectory = _scriptDir;
      }
      if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      } else {
        scriptDirectory = "";
      }
    }
    var out = Module2["print"] || console.log.bind(console);
    var err = Module2["printErr"] || console.warn.bind(console);
    Object.assign(Module2, moduleOverrides);
    moduleOverrides = null;
    if (Module2["arguments"]) Module2["arguments"];
    if (Module2["thisProgram"]) thisProgram = Module2["thisProgram"];
    if (Module2["quit"]) Module2["quit"];
    var wasmBinary;
    if (Module2["wasmBinary"]) wasmBinary = Module2["wasmBinary"];
    Module2["noExitRuntime"] || true;
    if (typeof WebAssembly != "object") {
      abort("no native wasm support detected");
    }
    var wasmMemory;
    var ABORT = false;
    function assert(condition, text) {
      if (!condition) {
        abort(text);
      }
    }
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : void 0;
    function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode((u0 & 31) << 6 | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
      }
      return str;
    }
    function UTF8ToString(ptr, maxBytesToRead) {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    }
    function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
      if (!(maxBytesToWrite > 0)) return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    }
    function stringToUTF8(str, outPtr, maxBytesToWrite) {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    }
    function lengthBytesUTF8(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    }
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      Module2["HEAP8"] = HEAP8 = new Int8Array(b);
      Module2["HEAP16"] = HEAP16 = new Int16Array(b);
      Module2["HEAP32"] = HEAP32 = new Int32Array(b);
      Module2["HEAPU8"] = HEAPU8 = new Uint8Array(b);
      Module2["HEAPU16"] = HEAPU16 = new Uint16Array(b);
      Module2["HEAPU32"] = HEAPU32 = new Uint32Array(b);
      Module2["HEAPF32"] = HEAPF32 = new Float32Array(b);
      Module2["HEAPF64"] = HEAPF64 = new Float64Array(b);
    }
    var wasmTable;
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATPOSTRUN__ = [];
    function preRun() {
      if (Module2["preRun"]) {
        if (typeof Module2["preRun"] == "function") Module2["preRun"] = [Module2["preRun"]];
        while (Module2["preRun"].length) {
          addOnPreRun(Module2["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      callRuntimeCallbacks(__ATINIT__);
    }
    function postRun() {
      if (Module2["postRun"]) {
        if (typeof Module2["postRun"] == "function") Module2["postRun"] = [Module2["postRun"]];
        while (Module2["postRun"].length) {
          addOnPostRun(Module2["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var dependenciesFulfilled = null;
    function addRunDependency(id) {
      runDependencies++;
      if (Module2["monitorRunDependencies"]) {
        Module2["monitorRunDependencies"](runDependencies);
      }
    }
    function removeRunDependency(id) {
      runDependencies--;
      if (Module2["monitorRunDependencies"]) {
        Module2["monitorRunDependencies"](runDependencies);
      }
      if (runDependencies == 0) {
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      if (Module2["onAbort"]) {
        Module2["onAbort"](what);
      }
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      what += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var dataURIPrefix = "data:application/octet-stream;base64,";
    function isDataURI(filename) {
      return filename.startsWith(dataURIPrefix);
    }
    var wasmBinaryFile;
    if (Module2["locateFile"]) {
      wasmBinaryFile = "tesseract-core.wasm";
      if (!isDataURI(wasmBinaryFile)) {
        wasmBinaryFile = locateFile2(wasmBinaryFile);
      }
    } else {
      wasmBinaryFile = new URL("tesseract-core.wasm", import.meta.url).href;
    }
    function getBinary(file) {
      try {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) ;
        throw "both async and sync fetching of the wasm failed";
      } catch (err2) {
        abort(err2);
      }
    }
    function getBinaryPromise() {
      if (!wasmBinary && ENVIRONMENT_IS_WEB) {
        if (typeof fetch == "function") {
          return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
            if (!response["ok"]) {
              throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
            }
            return response["arrayBuffer"]();
          }).catch(function() {
            return getBinary(wasmBinaryFile);
          });
        }
      }
      return Promise.resolve().then(function() {
        return getBinary(wasmBinaryFile);
      });
    }
    function createWasm() {
      var info = { "a": wasmImports };
      function receiveInstance(instance, module) {
        var exports2 = instance.exports;
        Module2["asm"] = exports2;
        wasmMemory = Module2["asm"]["U"];
        updateMemoryViews();
        wasmTable = Module2["asm"]["X"];
        addOnInit(Module2["asm"]["V"]);
        removeRunDependency();
      }
      addRunDependency();
      function receiveInstantiationResult(result) {
        receiveInstance(result["instance"]);
      }
      function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function(binary) {
          return WebAssembly.instantiate(binary, info);
        }).then(function(instance) {
          return instance;
        }).then(receiver, function(reason) {
          err("failed to asynchronously prepare wasm: " + reason);
          abort(reason);
        });
      }
      function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && typeof fetch == "function") {
          return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function(response) {
            var result = WebAssembly.instantiateStreaming(response, info);
            return result.then(receiveInstantiationResult, function(reason) {
              err("wasm streaming compile failed: " + reason);
              err("falling back to ArrayBuffer instantiation");
              return instantiateArrayBuffer(receiveInstantiationResult);
            });
          });
        } else {
          return instantiateArrayBuffer(receiveInstantiationResult);
        }
      }
      if (Module2["instantiateWasm"]) {
        try {
          var exports = Module2["instantiateWasm"](info, receiveInstance);
          return exports;
        } catch (e) {
          err("Module.instantiateWasm callback failed with error: " + e);
          readyPromiseReject(e);
        }
      }
      instantiateAsync().catch(readyPromiseReject);
      return {};
    }
    function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        callbacks.shift()(Module2);
      }
    }
    function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 24;
      this.set_type = function(type) {
        HEAPU32[this.ptr + 4 >> 2] = type;
      };
      this.get_type = function() {
        return HEAPU32[this.ptr + 4 >> 2];
      };
      this.set_destructor = function(destructor) {
        HEAPU32[this.ptr + 8 >> 2] = destructor;
      };
      this.get_destructor = function() {
        return HEAPU32[this.ptr + 8 >> 2];
      };
      this.set_refcount = function(refcount) {
        HEAP32[this.ptr >> 2] = refcount;
      };
      this.set_caught = function(caught) {
        caught = caught ? 1 : 0;
        HEAP8[this.ptr + 12 >> 0] = caught;
      };
      this.get_caught = function() {
        return HEAP8[this.ptr + 12 >> 0] != 0;
      };
      this.set_rethrown = function(rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[this.ptr + 13 >> 0] = rethrown;
      };
      this.get_rethrown = function() {
        return HEAP8[this.ptr + 13 >> 0] != 0;
      };
      this.init = function(type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      };
      this.add_ref = function() {
        var value = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = value + 1;
      };
      this.release_ref = function() {
        var prev = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = prev - 1;
        return prev === 1;
      };
      this.set_adjusted_ptr = function(adjustedPtr) {
        HEAPU32[this.ptr + 16 >> 2] = adjustedPtr;
      };
      this.get_adjusted_ptr = function() {
        return HEAPU32[this.ptr + 16 >> 2];
      };
      this.get_exception_ptr = function() {
        var isPointer = ___cxa_is_pointer_type(this.get_type());
        if (isPointer) {
          return HEAPU32[this.excPtr >> 2];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) return adjusted;
        return this.excPtr;
      };
    }
    function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      info.init(type, destructor);
      throw ptr;
    }
    function ___syscall_fcntl64(fd, cmd, varargs) {
      return 0;
    }
    function ___syscall_getcwd(buf, size) {
    }
    function ___syscall_ioctl(fd, op, varargs) {
      return 0;
    }
    function ___syscall_openat(dirfd, path, flags, varargs) {
    }
    function ___syscall_rmdir(path) {
    }
    function ___syscall_unlinkat(dirfd, path, flags) {
    }
    var structRegistrations = {};
    function runDestructors(destructors) {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    }
    function simpleReadValueFromPointer(pointer) {
      return this["fromWireType"](HEAP32[pointer >> 2]);
    }
    var awaitingDependencies = {};
    var registeredTypes = {};
    var typeDependencies = {};
    var char_0 = 48;
    var char_9 = 57;
    function makeLegalFunctionName(name) {
      if (void 0 === name) {
        return "_unknown";
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, "$");
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return "_" + name;
      }
      return name;
    }
    function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      return function() {
        return body.apply(this, arguments);
      };
    }
    function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
        var stack = new Error(message).stack;
        if (stack !== void 0) {
          this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
        }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
        if (this.message === void 0) {
          return this.name;
        } else {
          return this.name + ": " + this.message;
        }
      };
      return errorClass;
    }
    var InternalError = void 0;
    function throwInternalError(message) {
      throw new InternalError(message);
    }
    function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
      });
      function onComplete(typeConverters2) {
        var myTypeConverters = getTypeConverters(typeConverters2);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError("Mismatched type converter count");
        }
        for (var i = 0; i < myTypes.length; ++i) {
          registerType(myTypes[i], myTypeConverters[i]);
        }
      }
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach((dt, i) => {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    }
    function __embind_finalize_value_object(structType) {
      var reg = structRegistrations[structType];
      delete structRegistrations[structType];
      var rawConstructor = reg.rawConstructor;
      var rawDestructor = reg.rawDestructor;
      var fieldRecords = reg.fields;
      var fieldTypes = fieldRecords.map((field) => field.getterReturnType).concat(fieldRecords.map((field) => field.setterArgumentType));
      whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes2) => {
        var fields = {};
        fieldRecords.forEach((field, i) => {
          var fieldName = field.fieldName;
          var getterReturnType = fieldTypes2[i];
          var getter = field.getter;
          var getterContext = field.getterContext;
          var setterArgumentType = fieldTypes2[i + fieldRecords.length];
          var setter = field.setter;
          var setterContext = field.setterContext;
          fields[fieldName] = { read: (ptr) => {
            return getterReturnType["fromWireType"](getter(getterContext, ptr));
          }, write: (ptr, o) => {
            var destructors = [];
            setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
            runDestructors(destructors);
          } };
        });
        return [{ name: reg.name, "fromWireType": function(ptr) {
          var rv = {};
          for (var i in fields) {
            rv[i] = fields[i].read(ptr);
          }
          rawDestructor(ptr);
          return rv;
        }, "toWireType": function(destructors, o) {
          for (var fieldName in fields) {
            if (!(fieldName in o)) {
              throw new TypeError('Missing field:  "' + fieldName + '"');
            }
          }
          var ptr = rawConstructor();
          for (fieldName in fields) {
            fields[fieldName].write(ptr, o[fieldName]);
          }
          if (destructors !== null) {
            destructors.push(rawDestructor, ptr);
          }
          return ptr;
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: rawDestructor }];
      });
    }
    function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
    }
    function getShiftFromSize(size) {
      switch (size) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError("Unknown type size: " + size);
      }
    }
    function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }
    var embind_charCodes = void 0;
    function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
    var BindingError = void 0;
    function throwBindingError(message) {
      throw new BindingError(message);
    }
    function registerType(rawType, registeredInstance, options = {}) {
      if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
      }
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError("Cannot register type '" + name + "' twice");
        }
      }
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
    function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": function(wt) {
        return !!wt;
      }, "toWireType": function(destructors, o) {
        return o ? trueValue : falseValue;
      }, "argPackAdvance": 8, "readValueFromPointer": function(pointer) {
        var heap;
        if (size === 1) {
          heap = HEAP8;
        } else if (size === 2) {
          heap = HEAP16;
        } else if (size === 4) {
          heap = HEAP32;
        } else {
          throw new TypeError("Unknown boolean type size: " + name);
        }
        return this["fromWireType"](heap[pointer >> shift]);
      }, destructorFunction: null });
    }
    function ClassHandle_isAliasOf(other) {
      if (!(this instanceof ClassHandle)) {
        return false;
      }
      if (!(other instanceof ClassHandle)) {
        return false;
      }
      var leftClass = this.$$.ptrType.registeredClass;
      var left = this.$$.ptr;
      var rightClass = other.$$.ptrType.registeredClass;
      var right = other.$$.ptr;
      while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
      }
      while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
      }
      return leftClass === rightClass && left === right;
    }
    function shallowCopyInternalPointer(o) {
      return { count: o.count, deleteScheduled: o.deleteScheduled, preservePointerOnDelete: o.preservePointerOnDelete, ptr: o.ptr, ptrType: o.ptrType, smartPtr: o.smartPtr, smartPtrType: o.smartPtrType };
    }
    function throwInstanceAlreadyDeleted(obj) {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + " instance already deleted");
    }
    var finalizationRegistry = false;
    function detachFinalizer(handle) {
    }
    function runDestructor($$) {
      if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    }
    function releaseClassHandle($$) {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
        runDestructor($$);
      }
    }
    function downcastPointer(ptr, ptrClass, desiredClass) {
      if (ptrClass === desiredClass) {
        return ptr;
      }
      if (void 0 === desiredClass.baseClass) {
        return null;
      }
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
        return null;
      }
      return desiredClass.downcast(rv);
    }
    var registeredPointers = {};
    function getInheritedInstanceCount() {
      return Object.keys(registeredInstances).length;
    }
    function getLiveInheritedInstances() {
      var rv = [];
      for (var k in registeredInstances) {
        if (registeredInstances.hasOwnProperty(k)) {
          rv.push(registeredInstances[k]);
        }
      }
      return rv;
    }
    var deletionQueue = [];
    function flushPendingDeletes() {
      while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj["delete"]();
      }
    }
    var delayFunction = void 0;
    function setDelayFunction(fn) {
      delayFunction = fn;
      if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
    }
    function init_embind() {
      Module2["getInheritedInstanceCount"] = getInheritedInstanceCount;
      Module2["getLiveInheritedInstances"] = getLiveInheritedInstances;
      Module2["flushPendingDeletes"] = flushPendingDeletes;
      Module2["setDelayFunction"] = setDelayFunction;
    }
    var registeredInstances = {};
    function getBasestPointer(class_, ptr) {
      if (ptr === void 0) {
        throwBindingError("ptr should not be undefined");
      }
      while (class_.baseClass) {
        ptr = class_.upcast(ptr);
        class_ = class_.baseClass;
      }
      return ptr;
    }
    function getInheritedInstance(class_, ptr) {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    }
    function makeClassHandle(prototype, record) {
      if (!record.ptrType || !record.ptr) {
        throwInternalError("makeClassHandle requires ptr and ptrType");
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError("Both smartPtrType and smartPtr must be specified");
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, { $$: { value: record } }));
    }
    function RegisteredPointer_fromWireType(ptr) {
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
        this.destructor(ptr);
        return null;
      }
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (void 0 !== registeredInstance) {
        if (0 === registeredInstance.$$.count.value) {
          registeredInstance.$$.ptr = rawPointer;
          registeredInstance.$$.smartPtr = ptr;
          return registeredInstance["clone"]();
        } else {
          var rv = registeredInstance["clone"]();
          this.destructor(ptr);
          return rv;
        }
      }
      function makeDefaultHandle() {
        if (this.isSmartPointer) {
          return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this.pointeeType, ptr: rawPointer, smartPtrType: this, smartPtr: ptr });
        } else {
          return makeClassHandle(this.registeredClass.instancePrototype, { ptrType: this, ptr });
        }
      }
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
      }
      var toType;
      if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
      } else {
        toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
      if (dp === null) {
        return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp, smartPtrType: this, smartPtr: ptr });
      } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, { ptrType: toType, ptr: dp });
      }
    }
    function attachFinalizer(handle) {
      if ("undefined" === typeof FinalizationRegistry) {
        attachFinalizer = (handle2) => handle2;
        return handle;
      }
      finalizationRegistry = new FinalizationRegistry((info) => {
        releaseClassHandle(info.$$);
      });
      attachFinalizer = (handle2) => {
        var $$ = handle2.$$;
        var hasSmartPtr = !!$$.smartPtr;
        if (hasSmartPtr) {
          var info = { $$ };
          finalizationRegistry.register(handle2, info, handle2);
        }
        return handle2;
      };
      detachFinalizer = (handle2) => finalizationRegistry.unregister(handle2);
      return attachFinalizer(handle);
    }
    function ClassHandle_clone() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.preservePointerOnDelete) {
        this.$$.count.value += 1;
        return this;
      } else {
        var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), { $$: { value: shallowCopyInternalPointer(this.$$) } }));
        clone.$$.count.value += 1;
        clone.$$.deleteScheduled = false;
        return clone;
      }
    }
    function ClassHandle_delete() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion");
      }
      detachFinalizer(this);
      releaseClassHandle(this.$$);
      if (!this.$$.preservePointerOnDelete) {
        this.$$.smartPtr = void 0;
        this.$$.ptr = void 0;
      }
    }
    function ClassHandle_isDeleted() {
      return !this.$$.ptr;
    }
    function ClassHandle_deleteLater() {
      if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion");
      }
      deletionQueue.push(this);
      if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
      this.$$.deleteScheduled = true;
      return this;
    }
    function init_ClassHandle() {
      ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
      ClassHandle.prototype["clone"] = ClassHandle_clone;
      ClassHandle.prototype["delete"] = ClassHandle_delete;
      ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
      ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater;
    }
    function ClassHandle() {
    }
    function ensureOverloadTable(proto, methodName, humanName) {
      if (void 0 === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = function() {
          if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
            throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
          }
          return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }
    function exposePublicSymbol(name, value, numArguments) {
      if (Module2.hasOwnProperty(name)) {
        if (void 0 === numArguments || void 0 !== Module2[name].overloadTable && void 0 !== Module2[name].overloadTable[numArguments]) {
          throwBindingError("Cannot register public name '" + name + "' twice");
        }
        ensureOverloadTable(Module2, name, name);
        if (Module2.hasOwnProperty(numArguments)) {
          throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        Module2[name].overloadTable[numArguments] = value;
      } else {
        Module2[name] = value;
        if (void 0 !== numArguments) {
          Module2[name].numArguments = numArguments;
        }
      }
    }
    function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
    function upcastPointer(ptr, ptrClass, desiredClass) {
      while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
          throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
      }
      return ptr;
    }
    function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError("null is not a valid " + this.name);
        }
        return 0;
      }
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
    function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
        if (this.isReference) {
          throwBindingError("null is not a valid " + this.name);
        }
        if (this.isSmartPointer) {
          ptr = this.rawConstructor();
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
          return ptr;
        } else {
          return 0;
        }
      }
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      if (this.isSmartPointer) {
        if (void 0 === handle.$$.smartPtr) {
          throwBindingError("Passing raw pointer to smart pointer is illegal");
        }
        switch (this.sharingPolicy) {
          case 0:
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name);
            }
            break;
          case 1:
            ptr = handle.$$.smartPtr;
            break;
          case 2:
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              var clonedHandle = handle["clone"]();
              ptr = this.rawShare(ptr, Emval.toHandle(function() {
                clonedHandle["delete"]();
              }));
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
            }
            break;
          default:
            throwBindingError("Unsupporting sharing policy");
        }
      }
      return ptr;
    }
    function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError("null is not a valid " + this.name);
        }
        return 0;
      }
      if (!handle.$$) {
        throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type " + this.name);
      }
      if (handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
    function RegisteredPointer_getPointee(ptr) {
      if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
      }
      return ptr;
    }
    function RegisteredPointer_destructor(ptr) {
      if (this.rawDestructor) {
        this.rawDestructor(ptr);
      }
    }
    function RegisteredPointer_deleteObject(handle) {
      if (handle !== null) {
        handle["delete"]();
      }
    }
    function init_RegisteredPointer() {
      RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
      RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
      RegisteredPointer.prototype["argPackAdvance"] = 8;
      RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
      RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
      RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType;
    }
    function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
      if (!isSmartPointer && registeredClass.baseClass === void 0) {
        if (isConst) {
          this["toWireType"] = constNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        } else {
          this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        }
      } else {
        this["toWireType"] = genericPointerToWireType;
      }
    }
    function replacePublicSymbol(name, value, numArguments) {
      if (!Module2.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol");
      }
      if (void 0 !== Module2[name].overloadTable && void 0 !== numArguments) {
        Module2[name].overloadTable[numArguments] = value;
      } else {
        Module2[name] = value;
        Module2[name].argCount = numArguments;
      }
    }
    function dynCallLegacy(sig, ptr, args) {
      var f = Module2["dynCall_" + sig];
      return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
    }
    function getWasmTableEntry(funcPtr) {
      return wasmTable.get(funcPtr);
    }
    function dynCall(sig, ptr, args) {
      if (sig.includes("j")) {
        return dynCallLegacy(sig, ptr, args);
      }
      var rtn = getWasmTableEntry(ptr).apply(null, args);
      return rtn;
    }
    function getDynCaller(sig, ptr) {
      var argCache = [];
      return function() {
        argCache.length = 0;
        Object.assign(argCache, arguments);
        return dynCall(sig, ptr, argCache);
      };
    }
    function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
      function makeDynCaller() {
        if (signature.includes("j")) {
          return getDynCaller(signature, rawFunction);
        }
        return getWasmTableEntry(rawFunction);
      }
      var fp = makeDynCaller();
      if (typeof fp != "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
      }
      return fp;
    }
    var UnboundTypeError = void 0;
    function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }
    function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
      throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
    }
    function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
      name = readLatin1String(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      if (upcast) {
        upcast = embind__requireFunction(upcastSignature, upcast);
      }
      if (downcast) {
        downcast = embind__requireFunction(downcastSignature, downcast);
      }
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
      exposePublicSymbol(legalFunctionName, function() {
        throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType]);
      });
      whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function(base) {
        base = base[0];
        var baseClass;
        var basePrototype;
        if (baseClassRawType) {
          baseClass = base.registeredClass;
          basePrototype = baseClass.instancePrototype;
        } else {
          basePrototype = ClassHandle.prototype;
        }
        var constructor = createNamedFunction(legalFunctionName, function() {
          if (Object.getPrototypeOf(this) !== instancePrototype) {
            throw new BindingError("Use 'new' to construct " + name);
          }
          if (void 0 === registeredClass.constructor_body) {
            throw new BindingError(name + " has no accessible constructor");
          }
          var body = registeredClass.constructor_body[arguments.length];
          if (void 0 === body) {
            throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
          }
          return body.apply(this, arguments);
        });
        var instancePrototype = Object.create(basePrototype, { constructor: { value: constructor } });
        constructor.prototype = instancePrototype;
        var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
        var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
        var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
        var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
        registeredPointers[rawType] = { pointerType: pointerConverter, constPointerType: constPointerConverter };
        replacePublicSymbol(legalFunctionName, constructor);
        return [referenceConverter, pointerConverter, constPointerConverter];
      });
    }
    function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i = 0; i < count; i++) {
        array.push(HEAPU32[firstElement + i * 4 >> 2]);
      }
      return array;
    }
    function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
      var argCount = argTypes.length;
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
      var isClassMethodFunc = argTypes[1] !== null && classType !== null;
      var needsDestructorStack = false;
      for (var i = 1; i < argTypes.length; ++i) {
        if (argTypes[i] !== null && argTypes[i].destructorFunction === void 0) {
          needsDestructorStack = true;
          break;
        }
      }
      var returns = argTypes[0].name !== "void";
      var expectedArgCount = argCount - 2;
      var argsWired = new Array(expectedArgCount);
      var invokerFuncArgs = [];
      var destructors = [];
      return function() {
        if (arguments.length !== expectedArgCount) {
          throwBindingError("function " + humanName + " called with " + arguments.length + " arguments, expected " + expectedArgCount + " args!");
        }
        destructors.length = 0;
        var thisWired;
        invokerFuncArgs.length = isClassMethodFunc ? 2 : 1;
        invokerFuncArgs[0] = cppTargetFunc;
        if (isClassMethodFunc) {
          thisWired = argTypes[1]["toWireType"](destructors, this);
          invokerFuncArgs[1] = thisWired;
        }
        for (var i2 = 0; i2 < expectedArgCount; ++i2) {
          argsWired[i2] = argTypes[i2 + 2]["toWireType"](destructors, arguments[i2]);
          invokerFuncArgs.push(argsWired[i2]);
        }
        var rv = cppInvokerFunc.apply(null, invokerFuncArgs);
        function onDone(rv2) {
          if (needsDestructorStack) {
            runDestructors(destructors);
          } else {
            for (var i3 = isClassMethodFunc ? 1 : 2; i3 < argTypes.length; i3++) {
              var param = i3 === 1 ? thisWired : argsWired[i3 - 2];
              if (argTypes[i3].destructorFunction !== null) {
                argTypes[i3].destructorFunction(param);
              }
            }
          }
          if (returns) {
            return argTypes[0]["fromWireType"](rv2);
          }
        }
        return onDone(rv);
      };
    }
    function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
      assert(argCount > 0);
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = "constructor " + classType.name;
        if (void 0 === classType.registeredClass.constructor_body) {
          classType.registeredClass.constructor_body = [];
        }
        if (void 0 !== classType.registeredClass.constructor_body[argCount - 1]) {
          throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        }
        classType.registeredClass.constructor_body[argCount - 1] = () => {
          throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes);
        };
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          argTypes.splice(1, 0, null);
          classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
          return [];
        });
        return [];
      });
    }
    function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + "." + methodName;
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
        if (isPureVirtual) {
          classType.registeredClass.pureVirtualFunctions.push(methodName);
        }
        function unboundTypesHandler() {
          throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes);
        }
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (void 0 === method || void 0 === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
          unboundTypesHandler.argCount = argCount - 2;
          unboundTypesHandler.className = classType.name;
          proto[methodName] = unboundTypesHandler;
        } else {
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
          var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
          if (void 0 === proto[methodName].overloadTable) {
            memberFunction.argCount = argCount - 2;
            proto[methodName] = memberFunction;
          } else {
            proto[methodName].overloadTable[argCount - 2] = memberFunction;
          }
          return [];
        });
        return [];
      });
    }
    var emval_free_list = [];
    var emval_handle_array = [{}, { value: void 0 }, { value: null }, { value: true }, { value: false }];
    function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = void 0;
        emval_free_list.push(handle);
      }
    }
    function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== void 0) {
          ++count;
        }
      }
      return count;
    }
    function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== void 0) {
          return emval_handle_array[i];
        }
      }
      return null;
    }
    function init_emval() {
      Module2["count_emval_handles"] = count_emval_handles;
      Module2["get_first_emval"] = get_first_emval;
    }
    var Emval = { toValue: (handle) => {
      if (!handle) {
        throwBindingError("Cannot use deleted val. handle = " + handle);
      }
      return emval_handle_array[handle].value;
    }, toHandle: (value) => {
      switch (value) {
        case void 0:
          return 1;
        case null:
          return 2;
        case true:
          return 3;
        case false:
          return 4;
        default: {
          var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
          emval_handle_array[handle] = { refcount: 1, value };
          return handle;
        }
      }
    } };
    function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": function(handle) {
        var rv = Emval.toValue(handle);
        __emval_decref(handle);
        return rv;
      }, "toWireType": function(destructors, value) {
        return Emval.toHandle(value);
      }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null });
    }
    function enumReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return function(pointer) {
            var heap = signed ? HEAP8 : HEAPU8;
            return this["fromWireType"](heap[pointer]);
          };
        case 1:
          return function(pointer) {
            var heap = signed ? HEAP16 : HEAPU16;
            return this["fromWireType"](heap[pointer >> 1]);
          };
        case 2:
          return function(pointer) {
            var heap = signed ? HEAP32 : HEAPU32;
            return this["fromWireType"](heap[pointer >> 2]);
          };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_enum(rawType, name, size, isSigned) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      function ctor() {
      }
      ctor.values = {};
      registerType(rawType, { name, constructor: ctor, "fromWireType": function(c) {
        return this.constructor.values[c];
      }, "toWireType": function(destructors, c) {
        return c.value;
      }, "argPackAdvance": 8, "readValueFromPointer": enumReadValueFromPointer(name, shift, isSigned), destructorFunction: null });
      exposePublicSymbol(name, ctor);
    }
    function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (void 0 === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
      }
      return impl;
    }
    function __embind_register_enum_value(rawEnumType, name, enumValue) {
      var enumType = requireRegisteredType(rawEnumType, "enum");
      name = readLatin1String(name);
      var Enum = enumType.constructor;
      var Value = Object.create(enumType.constructor.prototype, { value: { value: enumValue }, constructor: { value: createNamedFunction(enumType.name + "_" + name, function() {
      }) } });
      Enum.values[enumValue] = Value;
      Enum[name] = Value;
    }
    function embindRepr(v) {
      if (v === null) {
        return "null";
      }
      var t = typeof v;
      if (t === "object" || t === "array" || t === "function") {
        return v.toString();
      } else {
        return "" + v;
      }
    }
    function floatReadValueFromPointer(name, shift) {
      switch (shift) {
        case 2:
          return function(pointer) {
            return this["fromWireType"](HEAPF32[pointer >> 2]);
          };
        case 3:
          return function(pointer) {
            return this["fromWireType"](HEAPF64[pointer >> 3]);
          };
        default:
          throw new TypeError("Unknown float type: " + name);
      }
    }
    function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": function(value) {
        return value;
      }, "toWireType": function(destructors, value) {
        return value;
      }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null });
    }
    function integerReadValueFromPointer(name, shift, signed) {
      switch (shift) {
        case 0:
          return signed ? function readS8FromPointer(pointer) {
            return HEAP8[pointer];
          } : function readU8FromPointer(pointer) {
            return HEAPU8[pointer];
          };
        case 1:
          return signed ? function readS16FromPointer(pointer) {
            return HEAP16[pointer >> 1];
          } : function readU16FromPointer(pointer) {
            return HEAPU16[pointer >> 1];
          };
        case 2:
          return signed ? function readS32FromPointer(pointer) {
            return HEAP32[pointer >> 2];
          } : function readU32FromPointer(pointer) {
            return HEAPU32[pointer >> 2];
          };
        default:
          throw new TypeError("Unknown integer type: " + name);
      }
    }
    function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      var shift = getShiftFromSize(size);
      var fromWireType = (value) => value;
      if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = (value) => value << bitshift >>> bitshift;
      }
      var isUnsignedType = name.includes("unsigned");
      var checkAssertions = (value, toTypeName) => {
      };
      var toWireType;
      if (isUnsignedType) {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value >>> 0;
        };
      } else {
        toWireType = function(destructors, value) {
          checkAssertions(value, this.name);
          return value;
        };
      }
      registerType(primitiveType, { name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null });
    }
    function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
      var TA = typeMapping[dataTypeIndex];
      function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(heap.buffer, data, size);
      }
      name = readLatin1String(name);
      registerType(rawType, { name, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView }, { ignoreDuplicateRegistrations: true });
    }
    function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8 = name === "std::string";
      registerType(rawType, { name, "fromWireType": function(value) {
        var length = HEAPU32[value >> 2];
        var payload = value + 4;
        var str;
        if (stdStringIsUTF8) {
          var decodeStartPtr = payload;
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = payload + i;
            if (i == length || HEAPU8[currentBytePtr] == 0) {
              var maxRead = currentBytePtr - decodeStartPtr;
              var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
              if (str === void 0) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + 1;
            }
          }
        } else {
          var a = new Array(length);
          for (var i = 0; i < length; ++i) {
            a[i] = String.fromCharCode(HEAPU8[payload + i]);
          }
          str = a.join("");
        }
        _free(value);
        return str;
      }, "toWireType": function(destructors, value) {
        if (value instanceof ArrayBuffer) {
          value = new Uint8Array(value);
        }
        var length;
        var valueIsOfTypeString = typeof value == "string";
        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
          throwBindingError("Cannot pass non-string to std::string");
        }
        if (stdStringIsUTF8 && valueIsOfTypeString) {
          length = lengthBytesUTF8(value);
        } else {
          length = value.length;
        }
        var base = _malloc(4 + length + 1);
        var ptr = base + 4;
        HEAPU32[base >> 2] = length;
        if (stdStringIsUTF8 && valueIsOfTypeString) {
          stringToUTF8(value, ptr, length + 1);
        } else {
          if (valueIsOfTypeString) {
            for (var i = 0; i < length; ++i) {
              var charCode = value.charCodeAt(i);
              if (charCode > 255) {
                _free(ptr);
                throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
              }
              HEAPU8[ptr + i] = charCode;
            }
          } else {
            for (var i = 0; i < length; ++i) {
              HEAPU8[ptr + i] = value[i];
            }
          }
        }
        if (destructors !== null) {
          destructors.push(_free, base);
        }
        return base;
      }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
        _free(ptr);
      } });
    }
    var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : void 0;
    function UTF16ToString(ptr, maxBytesToRead) {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder) return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      var str = "";
      for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[ptr + i * 2 >> 1];
        if (codeUnit == 0) break;
        str += String.fromCharCode(codeUnit);
      }
      return str;
    }
    function stringToUTF16(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        var codeUnit = str.charCodeAt(i);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF16(str) {
      return str.length * 2;
    }
    function UTF32ToString(ptr, maxBytesToRead) {
      var i = 0;
      var str = "";
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[ptr + i * 4 >> 2];
        if (utf32 == 0) break;
        ++i;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    }
    function stringToUTF32(str, outPtr, maxBytesToWrite) {
      if (maxBytesToWrite === void 0) {
        maxBytesToWrite = 2147483647;
      }
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    }
    function lengthBytesUTF32(str) {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
        len += 4;
      }
      return len;
    }
    function __embind_register_std_wstring(rawType, charSize, name) {
      name = readLatin1String(name);
      var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = () => HEAPU16;
        shift = 1;
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = () => HEAPU32;
        shift = 2;
      }
      registerType(rawType, { name, "fromWireType": function(value) {
        var length = HEAPU32[value >> 2];
        var HEAP = getHeap();
        var str;
        var decodeStartPtr = value + 4;
        for (var i = 0; i <= length; ++i) {
          var currentBytePtr = value + 4 + i * charSize;
          if (i == length || HEAP[currentBytePtr >> shift] == 0) {
            var maxReadBytes = currentBytePtr - decodeStartPtr;
            var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
            if (str === void 0) {
              str = stringSegment;
            } else {
              str += String.fromCharCode(0);
              str += stringSegment;
            }
            decodeStartPtr = currentBytePtr + charSize;
          }
        }
        _free(value);
        return str;
      }, "toWireType": function(destructors, value) {
        if (!(typeof value == "string")) {
          throwBindingError("Cannot pass non-string to C++ string type " + name);
        }
        var length = lengthBytesUTF(value);
        var ptr = _malloc(4 + length + charSize);
        HEAPU32[ptr >> 2] = length >> shift;
        encodeString(value, ptr + 4, length + charSize);
        if (destructors !== null) {
          destructors.push(_free, ptr);
        }
        return ptr;
      }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function(ptr) {
        _free(ptr);
      } });
    }
    function __embind_register_value_object(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
      structRegistrations[rawType] = { name: readLatin1String(name), rawConstructor: embind__requireFunction(constructorSignature, rawConstructor), rawDestructor: embind__requireFunction(destructorSignature, rawDestructor), fields: [] };
    }
    function __embind_register_value_object_field(structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
      structRegistrations[structType].fields.push({ fieldName: readLatin1String(fieldName), getterReturnType, getter: embind__requireFunction(getterSignature, getter), getterContext, setterArgumentType, setter: embind__requireFunction(setterSignature, setter), setterContext });
    }
    function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, { isVoid: true, name, "argPackAdvance": 0, "fromWireType": function() {
        return void 0;
      }, "toWireType": function(destructors, o) {
        return void 0;
      } });
    }
    var nowIsMonotonic = true;
    function __emscripten_get_now_is_monotonic() {
      return nowIsMonotonic;
    }
    function emval_lookupTypes(argCount, argTypes) {
      var a = new Array(argCount);
      for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(HEAPU32[argTypes + i * 4 >> 2], "parameter " + i);
      }
      return a;
    }
    function __emval_call(handle, argCount, argTypes, argv) {
      handle = Emval.toValue(handle);
      var types = emval_lookupTypes(argCount, argTypes);
      var args = new Array(argCount);
      for (var i = 0; i < argCount; ++i) {
        var type = types[i];
        args[i] = type["readValueFromPointer"](argv);
        argv += type["argPackAdvance"];
      }
      var rv = handle.apply(void 0, args);
      return Emval.toHandle(rv);
    }
    function __emval_incref(handle) {
      if (handle > 4) {
        emval_handle_array[handle].refcount += 1;
      }
    }
    function __emval_take_value(type, arg) {
      type = requireRegisteredType(type, "_emval_take_value");
      var v = type["readValueFromPointer"](arg);
      return Emval.toHandle(v);
    }
    function readI53FromI64(ptr) {
      return HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;
    }
    function __gmtime_js(time, tmPtr) {
      var date = new Date(readI53FromI64(time) * 1e3);
      HEAP32[tmPtr >> 2] = date.getUTCSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getUTCMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getUTCHours();
      HEAP32[tmPtr + 12 >> 2] = date.getUTCDate();
      HEAP32[tmPtr + 16 >> 2] = date.getUTCMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getUTCFullYear() - 1900;
      HEAP32[tmPtr + 24 >> 2] = date.getUTCDay();
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
    }
    function __isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var __MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    var __MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    function __yday_from_date(date) {
      var isLeapYear = __isLeapYear(date.getFullYear());
      var monthDaysCumulative = isLeapYear ? __MONTH_DAYS_LEAP_CUMULATIVE : __MONTH_DAYS_REGULAR_CUMULATIVE;
      var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
      return yday;
    }
    function __localtime_js(time, tmPtr) {
      var date = new Date(readI53FromI64(time) * 1e3);
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getHours();
      HEAP32[tmPtr + 12 >> 2] = date.getDate();
      HEAP32[tmPtr + 16 >> 2] = date.getMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
      HEAP32[tmPtr + 24 >> 2] = date.getDay();
      var yday = __yday_from_date(date) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
      HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
      HEAP32[tmPtr + 32 >> 2] = dst;
    }
    function __mktime_js(tmPtr) {
      var date = new Date(HEAP32[tmPtr + 20 >> 2] + 1900, HEAP32[tmPtr + 16 >> 2], HEAP32[tmPtr + 12 >> 2], HEAP32[tmPtr + 8 >> 2], HEAP32[tmPtr + 4 >> 2], HEAP32[tmPtr >> 2], 0);
      var dst = HEAP32[tmPtr + 32 >> 2];
      var guessedOffset = date.getTimezoneOffset();
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dstOffset = Math.min(winterOffset, summerOffset);
      if (dst < 0) {
        HEAP32[tmPtr + 32 >> 2] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
      } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
      }
      HEAP32[tmPtr + 24 >> 2] = date.getDay();
      var yday = __yday_from_date(date) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getHours();
      HEAP32[tmPtr + 12 >> 2] = date.getDate();
      HEAP32[tmPtr + 16 >> 2] = date.getMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getYear();
      return date.getTime() / 1e3 | 0;
    }
    function allocateUTF8(str) {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8Array(str, HEAP8, ret, size);
      return ret;
    }
    function __tzset_js(timezone, daylight, tzname) {
      var currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
      HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
      HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
      function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
      }
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      var winterNamePtr = allocateUTF8(winterName);
      var summerNamePtr = allocateUTF8(summerName);
      if (summerOffset < winterOffset) {
        HEAPU32[tzname >> 2] = winterNamePtr;
        HEAPU32[tzname + 4 >> 2] = summerNamePtr;
      } else {
        HEAPU32[tzname >> 2] = summerNamePtr;
        HEAPU32[tzname + 4 >> 2] = winterNamePtr;
      }
    }
    function _abort() {
      abort("");
    }
    function _emscripten_date_now() {
      return Date.now();
    }
    var _emscripten_get_now;
    _emscripten_get_now = () => performance.now();
    function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }
    function getHeapMax() {
      return 1073741824;
    }
    function emscripten_realloc_buffer(size) {
      var b = wasmMemory.buffer;
      try {
        wasmMemory.grow(size - b.byteLength + 65535 >>> 16);
        updateMemoryViews();
        return 1;
      } catch (e) {
      }
    }
    function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    }
    var ENV = {};
    function getExecutableName() {
      return thisProgram || "./this.program";
    }
    function getEnvStrings() {
      if (!getEnvStrings.strings) {
        var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = { "USER": "web_user", "LOGNAME": "web_user", "PATH": "/", "PWD": "/", "HOME": "/home/web_user", "LANG": lang, "_": getExecutableName() };
        for (var x in ENV) {
          if (ENV[x] === void 0) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + "=" + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }
    function writeAsciiToMemory(str, buffer, dontAddNull) {
      for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
      }
      if (!dontAddNull) HEAP8[buffer >> 0] = 0;
    }
    function _environ_get(__environ, environ_buf) {
      var bufSize = 0;
      getEnvStrings().forEach(function(string, i) {
        var ptr = environ_buf + bufSize;
        HEAPU32[__environ + i * 4 >> 2] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    }
    function _environ_sizes_get(penviron_count, penviron_buf_size) {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach(function(string) {
        bufSize += string.length + 1;
      });
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    }
    function _fd_close(fd) {
      return 52;
    }
    function _fd_read(fd, iov, iovcnt, pnum) {
      return 52;
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      return 70;
    }
    var printCharBuffers = [null, [], []];
    function printChar(stream, curr) {
      var buffer = printCharBuffers[stream];
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    }
    function _fd_write(fd, iov, iovcnt, pnum) {
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr + j]);
        }
        num += len;
      }
      HEAPU32[pnum >> 2] = num;
      return 0;
    }
    function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {
      }
      return sum;
    }
    var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
          days -= daysInCurrentMonth - newDate.getDate() + 1;
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth + 1);
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear() + 1);
          }
        } else {
          newDate.setDate(newDate.getDate() + days);
          return newDate;
        }
      }
      return newDate;
    }
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    }
    function writeArrayToMemory(array, buffer) {
      HEAP8.set(array, buffer);
    }
    function _strftime(s, maxsize, format, tm) {
      var tm_zone = HEAP32[tm + 40 >> 2];
      var date = { tm_sec: HEAP32[tm >> 2], tm_min: HEAP32[tm + 4 >> 2], tm_hour: HEAP32[tm + 8 >> 2], tm_mday: HEAP32[tm + 12 >> 2], tm_mon: HEAP32[tm + 16 >> 2], tm_year: HEAP32[tm + 20 >> 2], tm_wday: HEAP32[tm + 24 >> 2], tm_yday: HEAP32[tm + 28 >> 2], tm_isdst: HEAP32[tm + 32 >> 2], tm_gmtoff: HEAP32[tm + 36 >> 2], tm_zone: tm_zone ? UTF8ToString(tm_zone) : "" };
      var pattern = UTF8ToString(format);
      var EXPANSION_RULES_1 = { "%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y" };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
      }
      var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      function leadingSomething(value, digits, character) {
        var str = typeof value == "number" ? value.toString() : value || "";
        while (str.length < digits) {
          str = character[0] + str;
        }
        return str;
      }
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0");
      }
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : value > 0 ? 1 : 0;
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
            compare = sgn(date1.getDate() - date2.getDate());
          }
        }
        return compare;
      }
      function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
          case 0:
            return new Date(janFourth.getFullYear() - 1, 11, 29);
          case 1:
            return janFourth;
          case 2:
            return new Date(janFourth.getFullYear(), 0, 3);
          case 3:
            return new Date(janFourth.getFullYear(), 0, 2);
          case 4:
            return new Date(janFourth.getFullYear(), 0, 1);
          case 5:
            return new Date(janFourth.getFullYear() - 1, 11, 31);
          case 6:
            return new Date(janFourth.getFullYear() - 1, 11, 30);
        }
      }
      function getWeekBasedYear(date2) {
        var thisDate = __addDays(new Date(date2.tm_year + 1900, 0, 1), date2.tm_yday);
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
          if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
            return thisDate.getFullYear() + 1;
          }
          return thisDate.getFullYear();
        }
        return thisDate.getFullYear() - 1;
      }
      var EXPANSION_RULES_2 = { "%a": function(date2) {
        return WEEKDAYS[date2.tm_wday].substring(0, 3);
      }, "%A": function(date2) {
        return WEEKDAYS[date2.tm_wday];
      }, "%b": function(date2) {
        return MONTHS[date2.tm_mon].substring(0, 3);
      }, "%B": function(date2) {
        return MONTHS[date2.tm_mon];
      }, "%C": function(date2) {
        var year = date2.tm_year + 1900;
        return leadingNulls(year / 100 | 0, 2);
      }, "%d": function(date2) {
        return leadingNulls(date2.tm_mday, 2);
      }, "%e": function(date2) {
        return leadingSomething(date2.tm_mday, 2, " ");
      }, "%g": function(date2) {
        return getWeekBasedYear(date2).toString().substring(2);
      }, "%G": function(date2) {
        return getWeekBasedYear(date2);
      }, "%H": function(date2) {
        return leadingNulls(date2.tm_hour, 2);
      }, "%I": function(date2) {
        var twelveHour = date2.tm_hour;
        if (twelveHour == 0) twelveHour = 12;
        else if (twelveHour > 12) twelveHour -= 12;
        return leadingNulls(twelveHour, 2);
      }, "%j": function(date2) {
        return leadingNulls(date2.tm_mday + __arraySum(__isLeapYear(date2.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date2.tm_mon - 1), 3);
      }, "%m": function(date2) {
        return leadingNulls(date2.tm_mon + 1, 2);
      }, "%M": function(date2) {
        return leadingNulls(date2.tm_min, 2);
      }, "%n": function() {
        return "\n";
      }, "%p": function(date2) {
        if (date2.tm_hour >= 0 && date2.tm_hour < 12) {
          return "AM";
        }
        return "PM";
      }, "%S": function(date2) {
        return leadingNulls(date2.tm_sec, 2);
      }, "%t": function() {
        return "	";
      }, "%u": function(date2) {
        return date2.tm_wday || 7;
      }, "%U": function(date2) {
        var days = date2.tm_yday + 7 - date2.tm_wday;
        return leadingNulls(Math.floor(days / 7), 2);
      }, "%V": function(date2) {
        var val = Math.floor((date2.tm_yday + 7 - (date2.tm_wday + 6) % 7) / 7);
        if ((date2.tm_wday + 371 - date2.tm_yday - 2) % 7 <= 2) {
          val++;
        }
        if (!val) {
          val = 52;
          var dec31 = (date2.tm_wday + 7 - date2.tm_yday - 1) % 7;
          if (dec31 == 4 || dec31 == 5 && __isLeapYear(date2.tm_year % 400 - 1)) {
            val++;
          }
        } else if (val == 53) {
          var jan1 = (date2.tm_wday + 371 - date2.tm_yday) % 7;
          if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date2.tm_year))) val = 1;
        }
        return leadingNulls(val, 2);
      }, "%w": function(date2) {
        return date2.tm_wday;
      }, "%W": function(date2) {
        var days = date2.tm_yday + 7 - (date2.tm_wday + 6) % 7;
        return leadingNulls(Math.floor(days / 7), 2);
      }, "%y": function(date2) {
        return (date2.tm_year + 1900).toString().substring(2);
      }, "%Y": function(date2) {
        return date2.tm_year + 1900;
      }, "%z": function(date2) {
        var off = date2.tm_gmtoff;
        var ahead = off >= 0;
        off = Math.abs(off) / 60;
        off = off / 60 * 100 + off % 60;
        return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
      }, "%Z": function(date2) {
        return date2.tm_zone;
      }, "%%": function() {
        return "%";
      } };
      pattern = pattern.replace(/%%/g, "\0\0");
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
          pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
        }
      }
      pattern = pattern.replace(/\0\0/g, "%");
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
      writeArrayToMemory(bytes, s);
      return bytes.length - 1;
    }
    function _strftime_l(s, maxsize, format, tm, loc) {
      return _strftime(s, maxsize, format, tm);
    }
    InternalError = Module2["InternalError"] = extendError(Error, "InternalError");
    embind_init_charCodes();
    BindingError = Module2["BindingError"] = extendError(Error, "BindingError");
    init_ClassHandle();
    init_embind();
    init_RegisteredPointer();
    UnboundTypeError = Module2["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
    init_emval();
    var wasmImports = { "e": ___cxa_throw, "s": ___syscall_fcntl64, "F": ___syscall_getcwd, "H": ___syscall_ioctl, "t": ___syscall_openat, "B": ___syscall_rmdir, "C": ___syscall_unlinkat, "g": __embind_finalize_value_object, "y": __embind_register_bigint, "Q": __embind_register_bool, "k": __embind_register_class, "j": __embind_register_class_constructor, "a": __embind_register_class_function, "P": __embind_register_emval, "w": __embind_register_enum, "q": __embind_register_enum_value, "v": __embind_register_float, "d": __embind_register_integer, "b": __embind_register_memory_view, "u": __embind_register_std_string, "o": __embind_register_std_wstring, "i": __embind_register_value_object, "c": __embind_register_value_object_field, "R": __embind_register_void, "J": __emscripten_get_now_is_monotonic, "T": __emval_call, "f": __emval_decref, "p": __emval_incref, "m": __emval_take_value, "K": __gmtime_js, "L": __localtime_js, "M": __mktime_js, "N": __tzset_js, "h": _abort, "l": _emscripten_date_now, "I": _emscripten_get_now, "O": _emscripten_memcpy_big, "A": _emscripten_resize_heap, "D": _environ_get, "E": _environ_sizes_get, "n": _fd_close, "G": _fd_read, "x": _fd_seek, "r": _fd_write, "S": _strftime, "z": _strftime_l };
    createWasm();
    var _malloc = function() {
      return (_malloc = Module2["asm"]["W"]).apply(null, arguments);
    };
    var _free = function() {
      return (_free = Module2["asm"]["Y"]).apply(null, arguments);
    };
    var ___getTypeName = Module2["___getTypeName"] = function() {
      return (___getTypeName = Module2["___getTypeName"] = Module2["asm"]["Z"]).apply(null, arguments);
    };
    Module2["__embind_initialize_bindings"] = function() {
      return (Module2["__embind_initialize_bindings"] = Module2["asm"]["_"]).apply(null, arguments);
    };
    var ___cxa_is_pointer_type = function() {
      return (___cxa_is_pointer_type = Module2["asm"]["$"]).apply(null, arguments);
    };
    Module2["dynCall_jiji"] = function() {
      return (Module2["dynCall_jiji"] = Module2["asm"]["aa"]).apply(null, arguments);
    };
    Module2["dynCall_viijii"] = function() {
      return (Module2["dynCall_viijii"] = Module2["asm"]["ba"]).apply(null, arguments);
    };
    Module2["dynCall_iiiiij"] = function() {
      return (Module2["dynCall_iiiiij"] = Module2["asm"]["ca"]).apply(null, arguments);
    };
    Module2["dynCall_iiiiijj"] = function() {
      return (Module2["dynCall_iiiiijj"] = Module2["asm"]["da"]).apply(null, arguments);
    };
    Module2["dynCall_iiiiiijj"] = function() {
      return (Module2["dynCall_iiiiiijj"] = Module2["asm"]["ea"]).apply(null, arguments);
    };
    Module2["dynCall_jijii"] = function() {
      return (Module2["dynCall_jijii"] = Module2["asm"]["fa"]).apply(null, arguments);
    };
    Module2["dynCall_vijii"] = function() {
      return (Module2["dynCall_vijii"] = Module2["asm"]["ga"]).apply(null, arguments);
    };
    Module2["dynCall_jij"] = function() {
      return (Module2["dynCall_jij"] = Module2["asm"]["ha"]).apply(null, arguments);
    };
    Module2["dynCall_iij"] = function() {
      return (Module2["dynCall_iij"] = Module2["asm"]["ia"]).apply(null, arguments);
    };
    Module2["dynCall_viji"] = function() {
      return (Module2["dynCall_viji"] = Module2["asm"]["ja"]).apply(null, arguments);
    };
    Module2["dynCall_jii"] = function() {
      return (Module2["dynCall_jii"] = Module2["asm"]["ka"]).apply(null, arguments);
    };
    var calledRun;
    dependenciesFulfilled = function runCaller() {
      if (!calledRun) run();
      if (!calledRun) dependenciesFulfilled = runCaller;
    };
    function run() {
      if (runDependencies > 0) {
        return;
      }
      preRun();
      if (runDependencies > 0) {
        return;
      }
      function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module2["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        readyPromiseResolve(Module2);
        if (Module2["onRuntimeInitialized"]) Module2["onRuntimeInitialized"]();
        postRun();
      }
      if (Module2["setStatus"]) {
        Module2["setStatus"]("Running...");
        setTimeout(function() {
          setTimeout(function() {
            Module2["setStatus"]("");
          }, 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    if (Module2["preInit"]) {
      if (typeof Module2["preInit"] == "function") Module2["preInit"] = [Module2["preInit"]];
      while (Module2["preInit"].length > 0) {
        Module2["preInit"].pop()();
      }
    }
    run();
    function wasmSIMDSupported2() {
      const simdTest = Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]);
      return WebAssembly.validate(simdTest);
    }
    if (wasmSIMDSupported2()) {
      ENV.DOTPRODUCT = "sse";
    }
    return Module2.ready;
  });
})();
function jsArrayFromStdVector(vec) {
  const size = vec.size();
  const result = [];
  for (let i = 0; i < size; i++) {
    result.push(vec.get(i));
  }
  return result;
}
var OCREngine = class {
  /**
   * Initialize the OCREngine.
   *
   * Use {@link createOCREngine} rather than calling this directly.
   *
   * @param tessLib - Emscripten entry point for the compiled WebAssembly module.
   * @param progressChannel - Channel used to report progress
   *   updates when OCREngine is run on a background thread
   */
  constructor(tessLib, progressChannel) {
    this._tesseractLib = tessLib;
    this._engine = new tessLib.OCREngine();
    this._modelLoaded = false;
    this._imageLoaded = false;
    this._progressChannel = progressChannel;
  }
  /**
   * Shut down the OCR engine and free up resources.
   */
  destroy() {
    this._engine.delete();
    this._engine = null;
  }
  /**
   * Get the value, represented as a string, of a Tesseract configuration variable.
   *
   * See {@link setVariable} for available variables.
   */
  getVariable(name) {
    const result = this._engine.getVariable(name);
    if (!result.success) {
      throw new Error(`Unable to get variable ${name}`);
    }
    return result.value;
  }
  /**
   * Set the value of a Tesseract configuration variable.
   *
   * For a list of configuration variables, see
   * https://github.com/tesseract-ocr/tesseract/blob/677f5822f247ccb12b4e026265e88b959059fb59/src/ccmain/tesseractclass.cpp#L53
   *
   * If you have Tesseract installed locally, executing `tesseract --print-parameters`
   * will also display a list of configuration variables.
   */
  setVariable(name, value) {
    const result = this._engine.setVariable(name, value);
    if (result.error) {
      throw new Error(`Unable to set variable ${name}`);
    }
  }
  /**
   * Load a trained text recognition model.
   */
  loadModel(model) {
    const modelArray = model instanceof ArrayBuffer ? new Uint8Array(model) : model;
    const result = this._engine.loadModel(modelArray);
    if (result.error) {
      throw new Error("Text recognition model failed to load");
    }
    this._modelLoaded = true;
  }
  /**
   * Load a document image for processing by subsequent operations.
   *
   * This is a cheap operation as expensive processing is deferred until
   * bounding boxes or text content is requested.
   */
  loadImage(image) {
    let imageData;
    if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
      imageData = imageDataFromBitmap(image);
    } else {
      imageData = image;
    }
    if (imageData.data.length < imageData.width * imageData.height * 4) {
      throw new Error("Image data length does not match width/height");
    }
    if (imageData.width <= 0 || imageData.height <= 0) {
      throw new Error("Image width or height is zero");
    }
    this._engine.clearImage();
    const engineImage = new this._tesseractLib.Image(imageData.width, imageData.height);
    const engineImageBuf = engineImage.data();
    engineImageBuf.set(new Uint32Array(imageData.data.buffer));
    const result = this._engine.loadImage(engineImage);
    engineImage.delete();
    if (result.error) {
      throw new Error("Failed to load image");
    }
    this._imageLoaded = true;
  }
  /**
   * Clear the current image and text recognition results.
   *
   * This will clear the loaded image data internally, but keep the text
   * recognition model loaded.
   *
   * At present there is no way to shrink WebAssembly memory, so this will not
   * return the memory used by the image to the OS/browser. To release memory,
   * the `OCREngine` instance needs to be destroyed via {@link destroy}.
   */
  clearImage() {
    this._engine.clearImage();
    this._imageLoaded = false;
  }
  /**
   * Perform layout analysis on the current image, if not already done, and
   * return bounding boxes for a given unit of text.
   *
   * This operation is relatively cheap compared to text recognition, so can
   * provide much faster results if only the location of lines/words etc. on
   * the page is required, not the text content. This operation can also be
   * performed before a text recognition model is loaded.
   *
   * This method may return a different number/positions of words on a line
   * compared to {@link getTextBoxes} due to the simpler analysis. After full
   * OCR has been performed by {@link getTextBoxes} or {@link getText}, this
   * method should return the same results.
   */
  getBoundingBoxes(unit) {
    this._checkImageLoaded();
    const textUnit = this._textUnitForUnit(unit);
    return jsArrayFromStdVector(this._engine.getBoundingBoxes(textUnit));
  }
  /**
   * Perform layout analysis and text recognition on the current image, if
   * not already done, and return bounding boxes and text content for a given
   * unit of text.
   *
   * A text recognition model must be loaded with {@link loadModel} before this
   * is called.
   */
  getTextBoxes(unit, onProgress) {
    this._checkImageLoaded();
    this._checkModelLoaded();
    const textUnit = this._textUnitForUnit(unit);
    return jsArrayFromStdVector(this._engine.getTextBoxes(textUnit, (progress) => {
      var _a;
      onProgress === null || onProgress === void 0 ? void 0 : onProgress(progress);
      (_a = this._progressChannel) === null || _a === void 0 ? void 0 : _a.postMessage({ progress });
    }));
  }
  /**
   * Perform layout analysis and text recognition on the current image, if
   * not already done, and return the page text as a string.
   *
   * A text recognition model must be loaded with {@link loadModel} before this
   * is called.
   */
  getText(onProgress) {
    this._checkImageLoaded();
    this._checkModelLoaded();
    return this._engine.getText((progress) => {
      var _a;
      onProgress === null || onProgress === void 0 ? void 0 : onProgress(progress);
      (_a = this._progressChannel) === null || _a === void 0 ? void 0 : _a.postMessage({ progress });
    });
  }
  /**
   * Perform layout analysis and text recognition on the current image, if
   * not already done, and return the page text in hOCR format.
   *
   * A text recognition model must be loaded with {@link loadModel} before this
   * is called.
   */
  getHOCR(onProgress) {
    this._checkImageLoaded();
    this._checkModelLoaded();
    return this._engine.getHOCR((progress) => {
      var _a;
      onProgress === null || onProgress === void 0 ? void 0 : onProgress(progress);
      (_a = this._progressChannel) === null || _a === void 0 ? void 0 : _a.postMessage({ progress });
    });
  }
  /**
   * Attempt to determine the orientation of the document image in degrees.
   *
   * This currently uses a simplistic algorithm [1] which is designed for
   * non-uppercase Latin text. It will likely perform badly for other scripts or
   * if the text is all uppercase.
   *
   * [1] See http://www.leptonica.org/papers/skew-measurement.pdf
   */
  getOrientation() {
    this._checkImageLoaded();
    return this._engine.getOrientation();
  }
  _checkModelLoaded() {
    if (!this._modelLoaded) {
      throw new Error("No text recognition model loaded");
    }
  }
  _checkImageLoaded() {
    if (!this._imageLoaded) {
      throw new Error("No image loaded");
    }
  }
  _textUnitForUnit(unit) {
    const { TextUnit } = this._tesseractLib;
    switch (unit) {
      case "word":
        return TextUnit.Word;
      case "line":
        return TextUnit.Line;
      default:
        throw new Error("Invalid text unit");
    }
  }
};
function wasmSIMDSupported() {
  const simdTest = Uint8Array.from([
    0,
    97,
    115,
    109,
    1,
    0,
    0,
    0,
    1,
    5,
    1,
    96,
    0,
    1,
    123,
    3,
    2,
    1,
    0,
    10,
    10,
    1,
    8,
    0,
    65,
    0,
    253,
    15,
    253,
    98,
    11
  ]);
  return WebAssembly.validate(simdTest);
}
function resolve(path, baseURL) {
  return new URL(path, baseURL).href;
}
function supportsFastBuild() {
  return wasmSIMDSupported();
}
async function createOCREngine({ wasmBinary, progressChannel, instantiateWasm: instantiateWasm2, locateFile: locateFile2 } = {}) {
  if (!wasmBinary && !instantiateWasm2) {
    const wasmPath = supportsFastBuild() ? "./tesseract-core.wasm" : "./tesseract-core-fallback.wasm";
    const wasmURL = resolve(wasmPath, import.meta.url);
    const wasmBinaryResponse = await fetch(wasmURL);
    wasmBinary = await wasmBinaryResponse.arrayBuffer();
  }
  const tessLib = await Module({ wasmBinary, instantiateWasm: instantiateWasm2, locateFile: locateFile2 });
  return new OCREngine(tessLib, progressChannel);
}

// src/tessengine.mjs
var ENGINE_NAME = "tesseract-wasm";
var ENGINE_VERSION = "0.11.0";
var MODEL_NAME = "tessdata_fast/eng";
var MODEL_BYTES = 4113088;
var instantiateWasm = (info, receive) => {
  const instance = new WebAssembly.Instance(wasmModule, info);
  receive(instance, wasmModule);
  return instance.exports;
};
var locateFile = (path) => path;
function engineCheck() {
  if (!(wasmModule instanceof WebAssembly.Module))
    return "the wasm core did not arrive as a compiled module \u2014 a one-part upload cannot carry it, and this member must be installed with its `assets/tesseract-core.wasm` part";
  if (!MODEL || typeof MODEL.byteLength !== "number" || MODEL.byteLength !== MODEL_BYTES)
    return `the language model is ${MODEL && MODEL.byteLength} B, the measured pair is ${MODEL_BYTES} B (tessdata_fast eng) \u2014 a different model is a different measurement and this member's stated fidelity would not be about it`;
  return null;
}
var REGION_GRAIN = "line";
async function transcribeFrame(rgba, width, height, { psm = null } = {}) {
  let engine = null;
  try {
    engine = await createOCREngine({ instantiateWasm, locateFile });
    engine.loadModel(new Uint8Array(MODEL));
    if (psm) engine.setVariable("tessedit_pageseg_mode", String(psm));
    engine.loadImage({ data: rgba, width, height });
    const boxes2 = engine.getTextBoxes(REGION_GRAIN) || [];
    const regions = [];
    for (const b of boxes2) {
      const text = typeof b.text === "string" ? b.text : "";
      const r = b.rect || {};
      if (![r.left, r.top, r.right, r.bottom].every((n) => typeof n === "number" && Number.isFinite(n)))
        continue;
      const c = typeof b.confidence === "number" && Number.isFinite(b.confidence) ? b.confidence : null;
      regions.push({ text, rect: [r.left, r.top, r.right, r.bottom], confidence: c });
    }
    return { ok: true, regions, grain: REGION_GRAIN, boxCount: boxes2.length };
  } catch (e) {
    return {
      ok: false,
      reason: "ENGINE_FAILED",
      error: String(e && e.message || e),
      name: e && e.name,
      frame_bytes: width * height * 4
    };
  } finally {
    try {
      if (engine) engine.destroy();
    } catch {
    }
  }
}
var TESSERACT = Object.freeze({
  name: ENGINE_NAME,
  version: ENGINE_VERSION,
  model: MODEL_NAME,
  check: engineCheck,
  transcribeFrame
});

// src/index.mjs
var SURFACE = {
  transcribe: { method: "POST", mutating: false },
  version: { method: "GET", mutating: false }
};
var member = makeMember(TESSERACT);
var index_default = {
  fetch: (req, env) => member.fetch(req, env)
};
export {
  SURFACE,
  index_default as default
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
