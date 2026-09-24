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
    const ds = new DecompressionStream("deflate");
    const out = new Response(new Blob([u8]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  } catch {
    try {
      const ds = new DecompressionStream("deflate-raw");
      const out = new Response(new Blob([u8]).stream().pipeThrough(ds));
      return new Uint8Array(await out.arrayBuffer());
    } catch {
      return null;
    }
  }
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
    this.pageCount = 0;
    this.root = null;
    this.notes = [];
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
    let data = await inflate(raw);
    if (!data) return null;
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
var IDENTITY_MATRIX = Object.freeze([1, 0, 0, 1, 0, 0]);
var IMAGE_FILE_MIME = Object.freeze({
  DCTDecode: "image/jpeg",
  DCT: "image/jpeg",
  JPXDecode: "image/jp2"
});

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
  DECODE_FAILED: "the decoder could not read the image data"
};
var refuse = (reason, detail = {}) => {
  if (!(reason in REFUSALS)) throw new Error(`undeclared refusal: ${reason}`);
  return { ok: false, reason, why: REFUSALS[reason], ...detail };
};
async function loadPdf(bytes) {
  if (!(bytes instanceof Uint8Array)) return null;
  if (!/%PDF-\d+\.\d+/.test(LATIN12.decode(bytes.subarray(0, 1024)))) return null;
  const doc = new PdfDoc(bytes);
  doc.scanTopLevel();
  await doc.loadObjectStreams();
  for (const [num, v] of doc.objects) {
    if (v && v.t === "dict") v.map.__objnum = { t: "ref", n: num };
  }
  doc.buildPageIndex();
  return doc;
}
var nameOf = (doc, v) => {
  v = doc.resolve(v);
  return v && v.t === "name" ? v.v : null;
};
var numOf = (doc, v) => {
  v = doc.resolve(v);
  return typeof v === "number" ? v : null;
};
function filterNames(doc, dict) {
  const f = doc.resolve(dict.Filter);
  if (!f) return [];
  if (f.t === "name") return [f.v];
  if (f.t === "arr") return f.items.map((x) => nameOf(doc, x)).filter(Boolean);
  return [];
}
function decodeParms(doc, dict, idx) {
  let p = doc.resolve(dict.DecodeParms) ?? doc.resolve(dict.DP);
  if (p && p.t === "arr") p = doc.resolve(p.items[idx] ?? p.items[p.items.length - 1]);
  return p && p.t === "dict" ? p.map : null;
}
function pageResources(doc, pageMap, depth = 0) {
  if (!pageMap || depth > 32) return null;
  const res = doc.dictOf(pageMap.Resources);
  if (res) return res;
  const parent = doc.dictOf(pageMap.Parent);
  return parent ? pageResources(doc, parent, depth + 1) : null;
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
var TEXT_OPS = /(^|[\s\]>)])(Tj|TJ|'|")(?=[\s]|$)/;
var SHOW_TEXT_BLOCK = /(^|\s)BT(\s|$)/;
var VECTOR_OPS = /(^|\s)(f\*?|F|B\*?|b\*?|S|s|sh)(\s|$)/;
async function analyzePage(doc, pageIndex) {
  const order = doc._pageOrder || [];
  if (pageIndex < 0 || pageIndex >= order.length) return null;
  const pageMap = doc.dictOf({ t: "ref", n: order[pageIndex] });
  if (!pageMap) return null;
  const res = pageResources(doc, pageMap);
  const xobjDict = res ? doc.dictOf(res.XObject) : null;
  const images = [];
  if (xobjDict) {
    for (const key of Object.keys(xobjDict)) {
      if (key.startsWith("__")) continue;
      const st = doc.resolve(xobjDict[key]);
      if (!st || st.t !== "stream") continue;
      if (nameOf(doc, st.dict.Subtype) !== "Image") continue;
      images.push({
        name: key,
        obj: st,
        width: numOf(doc, st.dict.Width),
        height: numOf(doc, st.dict.Height),
        bpc: numOf(doc, st.dict.BitsPerComponent),
        colorSpace: nameOf(doc, st.dict.ColorSpace) || (st.dict.ColorSpace ? "\xABindirect\xBB" : null),
        isMask: doc.resolve(st.dict.ImageMask) === true,
        filters: filterNames(doc, st.dict)
      });
    }
  }
  let content = "";
  try {
    content = await pageContentText(doc, pageMap);
  } catch {
    content = "";
  }
  const masked = maskedContent(content);
  const drawn = [...masked.matchAll(/\/([^\s/<>[\]()]+)\s+Do(?=[\s]|$)/g)].map((m) => m[1]);
  const drawnImages = drawn.filter((n) => images.some((im) => im.name === n));
  const mediaBox = (() => {
    let m = doc.resolve(pageMap.MediaBox);
    let p = pageMap, d = 0;
    while (!m && d++ < 32) {
      p = doc.dictOf(p.Parent);
      if (!p) break;
      m = doc.resolve(p.MediaBox);
    }
    if (!m || m.t !== "arr" || m.items.length < 4) return null;
    const v = m.items.map((x) => numOf(doc, x));
    if (v.some((x) => x == null)) return null;
    return { w: Math.abs(v[2] - v[0]), h: Math.abs(v[3] - v[1]) };
  })();
  return {
    page: pageIndex,
    contentBytes: content.length,
    contentReadable: content.length > 0 || !pageMap.Contents,
    hasTextOps: TEXT_OPS.test(masked) || SHOW_TEXT_BLOCK.test(masked),
    hasVectorOps: VECTOR_OPS.test(masked),
    hasInlineImage: masked.includes("INLINEIMAGE"),
    images: images.map(({ obj, ...rest }) => rest),
    _images: images,
    drawnImageNames: drawnImages,
    imageCount: images.length,
    mediaBox,
    rotate: numOf(doc, pageMap.Rotate) ?? 0
  };
}
async function renderPageToPixels(bytes, pageIndex, opts = {}) {
  const doc = await loadPdf(bytes);
  if (!doc) return refuse("NOT_A_PDF");
  if (doc.isEncrypted()) return refuse("ENCRYPTED");
  const a = await analyzePage(doc, pageIndex);
  if (!a) {
    const n = (doc._pageOrder || []).length;
    return pageIndex >= 0 && pageIndex < n ? refuse("PAGE_UNREADABLE", { page: pageIndex }) : refuse("NO_SUCH_PAGE", { page: pageIndex, pageCount: n });
  }
  if (a.hasTextOps && !opts.allowTextPage) {
    return refuse("PAGE_HAS_TEXT_LAYER", { page: pageIndex, imageCount: a.imageCount });
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
  const out = await decodeImage(doc, im, { ...opts, rotate: a.rotate || 0 });
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
    rotate_deg: a.rotate || 0,
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
  if (last === "JBIG2Decode" || last === "JPXDecode") {
    return refuse("UNSUPPORTED_FILTER", { filter: last, filters });
  }
  if (last === "DCTDecode" || last === "DCT") {
    if (filters.length > 1) return refuse("UNSUPPORTED_FILTER", { filters, note: "DCT behind another filter" });
    const raw = doc.streamRawBytes(im.obj);
    if (!raw || raw.length < 4) return refuse("IMAGE_UNREADABLE", { filters });
    if (!(raw[0] === 255 && raw[1] === 216)) {
      return refuse("DECODE_FAILED", { filters, note: "DCT stream does not start with SOI" });
    }
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
    const K = numOf(doc, p.K) ?? 0;
    const columns = numOf(doc, p.Columns) ?? 1728;
    const rows = numOf(doc, p.Rows) ?? im.height;
    const blackIs1 = doc.resolve(p.BlackIs1) === true;
    const byteAlign = doc.resolve(p.EncodedByteAlign) === true;
    let bits;
    try {
      bits = ccittDecode(data, { K, columns, rows, byteAlign });
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
      ccitt: { K, columns, rows, blackIs1, byteAlign, rowsDecoded: bits.rowsDecoded }
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
      const dec = doc.resolve(dict.Decode);
      const decOne = dec && dec.t === "arr" && numOf(doc, dec.items[0]) === 1;
      const invert = im.isMask ? !decOne : decOne;
      const src = data.subarray(0, need);
      const packed0 = invert ? Uint8Array.from(src, (b) => ~b & 255) : Uint8Array.from(src);
      const rot = rotateBilevel(normalisePacked(packed0, im.width, im.height), im.width, im.height, opts.rotate || 0);
      return {
        ok: true,
        route: "raw-samples-1bit",
        mediaType: "image/png",
        width: rot.width,
        height: rot.height,
        upright: true,
        pixelsSha256: await sha256Hex(normalisePacked(rot.packed, rot.width, rot.height)),
        bytes: await encodePng1(rot.packed, rot.width, rot.height)
      };
    }
    if (bpc === 8) {
      return {
        ok: true,
        route: comps === 3 ? "raw-samples-rgb8" : "raw-samples-grey8",
        mediaType: "image/png",
        upright: (opts.rotate || 0) === 0,
        bytes: await encodePng8(data.subarray(0, need), im.width, im.height, comps)
      };
    }
    return refuse("UNSUPPORTED_SAMPLES", { colorSpace: cs, bpc, comps, filters });
  }
  return refuse("UNSUPPORTED_FILTER", { filters });
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
function readRun(br, table) {
  let total = 0;
  for (; ; ) {
    let hit = null;
    const window = br.peek(MAX_CODE_BITS);
    for (let len = 2; len <= MAX_CODE_BITS; len++) {
      const key = `${len}:${window.slice(0, len)}`;
      if (key in table) {
        hit = { len, run: table[key] };
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
function ccittDecode(data, { K = 0, columns = 1728, rows = 0, byteAlign = false }) {
  const br = new BitReader(data);
  const rowBytes = Math.ceil(columns / 8);
  const out = [];
  let ref = [columns, columns];
  const maxRows = rows && rows > 0 ? rows : 1 << 20;
  const eol = () => br.peek(12) === "000000000001";
  if (K > 0) throw new Error("mixed-mode (K>0) CCITT is not decoded here");
  for (let r = 0; r < maxRows; r++) {
    if (byteAlign) br.align();
    while (eol()) {
      br.skip(12);
      if (K > 0) br.skip(1);
    }
    if (br.eof) break;
    const twoD = K < 0;
    const cur = [];
    let a0 = -1;
    let color = 0;
    let guard = 0;
    while (a0 < columns) {
      if (++guard > columns * 4 + 64) throw new Error("row did not terminate");
      if (br.eof) break;
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
            a0 = columns;
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
          a0 = columns;
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
          a0 = columns;
          break;
        }
        const m = Math.min(columns, s + run);
        cur.push(m);
        a0 = m;
        color ^= 1;
      }
    }
    if (cur.length === 0 && br.eof) break;
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
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width);
  dv.setUint32(4, height);
  ihdr[8] = bitDepth;
  ihdr[9] = colorType;
  const idat = await deflateZlib(raw);
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
async function encodePng8(samples, width, height, comps) {
  const rowBytes = width * comps;
  const raw = new Uint8Array((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowBytes + 1)] = 0;
    raw.set(samples.subarray(y * rowBytes, (y + 1) * rowBytes), y * (rowBytes + 1) + 1);
  }
  return buildPng(raw, width, height, 8, comps === 3 ? 2 : 0);
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
var SIG = [137, 80, 78, 71, 13, 10, 26, 10];
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
  if (b.length < 8 || SIG.some((v, i) => b[i] !== v)) return refuse2("NOT_A_PNG");
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
function imageDataFromBitmap(bitmap) {
  let canvas;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  } else if (typeof HTMLCanvasElement !== "undefined") {
    const canvasEl = document.createElement("canvas");
    canvasEl.width = bitmap.width;
    canvasEl.height = bitmap.height;
    canvas = canvasEl;
  } else {
    throw new Error("No canvas implementation available");
  }
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
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
    const boxes = engine.getTextBoxes(REGION_GRAIN) || [];
    const regions = [];
    for (const b of boxes) {
      const text = typeof b.text === "string" ? b.text : "";
      const r = b.rect || {};
      if (![r.left, r.top, r.right, r.bottom].every((n) => typeof n === "number" && Number.isFinite(n)))
        continue;
      const c = typeof b.confidence === "number" && Number.isFinite(b.confidence) ? b.confidence : null;
      regions.push({ text, rect: [r.left, r.top, r.right, r.bottom], confidence: c });
    }
    return { ok: true, regions, grain: REGION_GRAIN, boxCount: boxes.length };
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

// src/contract.mjs
var CAP = "C";
var MEASURED_BY = "MEASUREMENTS.md 2026-09-10 (CPDF-15) \u2014 tesseract-wasm@0.11.0 SIMD + tessdata_fast eng on the deployed Workers runtime: 99.89% characters and 89/90 digits with ZERO minted on the one human-ground-truthed page (Oakland Legistar attachment 15721260 p2, 300 dpi), reproducible over identical bytes (9 images x 3 runs, no image gave more than one distinct text), the invention band EMPTY at every rung of CPDF-11's ladder. REACH, STATED: ONE ground-truthed page, ONE engine version, ONE model. Every other corpus figure in that row is agreement-with-the-local-floor and NOT accuracy \u2014 and D-314/CPDF-16 measured that NEITHER local model passes the noise control, so no agreement figure may be read as accuracy at all.";
var MAX_FRAME_BYTES = 613e5;
var frameBytesOf = (w, h) => w * h * 4;
var REFUSALS2 = {
  R2_NOT_CONFIGURED: "this member holds no CAPTURES binding, so it cannot read the bytes",
  BAD_SHA: "capture_sha must be 64 lowercase hex",
  BAD_STORE: "store must be a namespace token",
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

// src/transcribe.mjs
async function transcribeOnePage(bytes, page, { psm = null, confidenceFloor = null } = {}) {
  const engineWhy = engineCheck();
  if (engineWhy)
    return { ok: false, reason: "ENGINE_ABSENT", detail: REFUSALS2.ENGINE_ABSENT, why: engineWhy };
  const rendered = await renderPageToPixels(bytes, page, {});
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
      why: `the ${rendered.route} route hands back the publisher's own ${rendered.mediaType} bytes, and no decoder for that container is built into this member \u2014 workerd has neither a canvas nor createImageBitmap. This page is not transcribed and is not guessed at; the capability is NAMED so the corpus can decide whether it is worth building rather than being discovered as a silent blank`
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
  const samples = await pngToSamples(rendered.bytes);
  if (!samples.ok)
    return {
      ok: false,
      reason: "PIXELS_UNREADABLE",
      detail: REFUSALS2.PIXELS_UNREADABLE,
      page,
      route: rendered.route,
      png: samples
    };
  const rgba = samplesToRgba(samples);
  const out = await transcribeFrame(rgba, samples.width, samples.height, { psm });
  if (!out.ok)
    return {
      ok: false,
      reason: "ENGINE_FAILED",
      detail: REFUSALS2.ENGINE_FAILED,
      page,
      frame_bytes: frame,
      engine_error: out.error,
      engine_error_name: out.name
    };
  const ref = `p${page}`;
  const regions = [];
  let unanchored = 0, blank = 0, unrated = 0;
  for (const w of out.regions) {
    const text = w.text;
    if (!(typeof text === "string" && text.trim().length)) {
      blank++;
      continue;
    }
    const [l, t0, r, b] = w.rect;
    if (![l, t0, r, b].every((n) => Number.isFinite(n))) {
      unanchored++;
      continue;
    }
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
          width: samples.width,
          height: samples.height,
          route: rendered.route,
          upright: rendered.upright,
          rotate_deg: rendered.rotate_deg,
          pixels_sha256: rendered.pixels_sha256 || null
        }
      },
      confidence: rated ? { value: c, basis: "engine" } : "none"
    });
  }
  if (!regions.length)
    return {
      ok: false,
      reason: "NOTHING_TRANSCRIBED",
      detail: REFUSALS2.NOTHING_TRANSCRIBED,
      page,
      boxes: out.boxCount,
      blank,
      unanchored,
      why: `the engine boxed ${out.boxCount} region(s) and none of them carried both text and a usable rectangle, so there is nothing this record could anchor. An engine that answers nothing on a page is a FINDING and not an error: CPDF-15 measured this engine returning the empty string on noise and at CPDF-11's R3 rung, which is the self-refusal that makes its clean-run figures worth anything.`
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
      width: samples.width,
      height: samples.height,
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
    engine: ENGINE_NAME,
    version: ENGINE_VERSION,
    model: MODEL_NAME,
    cap: CAP,
    measured_by: MEASURED_BY,
    confidence_floor: one.confidence_floor,
    pages: [{ page: one.page, regions: one.regions }],
    /* The GRAIN is on the wire because it is the grain of a LINE in the record's
       text — the plane joins region texts with a newline — and a consumer that
       cannot tell word grain from line grain cannot tell whether a line-anchored
       read of the result means anything. Measured, not guessed: see
       `REGION_GRAIN` in `tessengine.mjs`. */
    grain: one.grain,
    deferred,
    image: one.image,
    notes
  };
}

// src/index.mjs
var SURFACE = {
  transcribe: { method: "POST", mutating: false },
  version: { method: "GET", mutating: false }
};
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
async function handleTranscribe(req, env) {
  if (typeof env.CAPTURES?.get !== "function")
    return json({ ok: false, reason: "R2_NOT_CONFIGURED", detail: REFUSALS2.R2_NOT_CONFIGURED }, 503);
  const body = await req.json().catch(() => null);
  const sha = typeof body?.capture_sha === "string" ? body.capture_sha.toLowerCase() : "";
  const store = typeof body?.store === "string" ? body.store : "";
  if (!/^[0-9a-f]{64}$/.test(sha))
    return json({ ok: false, reason: "BAD_SHA", detail: REFUSALS2.BAD_SHA }, 400);
  if (!store || !/^[a-z0-9_-]+$/i.test(store))
    return json({ ok: false, reason: "BAD_STORE", detail: REFUSALS2.BAD_STORE }, 400);
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
  return json(out);
}
function handleVersion(env) {
  const why = engineCheck();
  return json({
    ok: true,
    name: "ocr-worker",
    version: env.VERSION || "0.0.0",
    engine: ENGINE_NAME,
    engine_version: ENGINE_VERSION,
    model: MODEL_NAME,
    engine_loaded: why == null,
    ...why ? { engine_unavailable: why } : {}
  });
}
var index_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (req.method === "GET" && path === "version") return handleVersion(env);
    if (req.method === "POST" && (path === "transcribe" || path === ""))
      return handleTranscribe(req, env);
    return json({ ok: false, reason: "UNKNOWN", detail: "POST /transcribe or GET /version only" }, 404);
  }
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
