/* register-readers R1: a delimited piece read as rows under a definition, streaming.
 *
 * One parser serves `readRows` (an async source) and `createReducer` (R9, bytes pushed in as they pass): `createRowParser`
 * takes bytes in any pieces and answers the items they complete. The text is decoded a window at a time and walked by
 * csv-reader's `createRecordWalk` (its R28), which carries a record across window edges; nothing but the bytes of the
 * window being decoded, the text of the window being walked and the row being built is held. */
import { createRecordWalk } from "../csv-reader/index.mjs";
import { decodeText } from "../ooxml.mjs";
import { sha256HexSync } from "../record-grammar/index.mjs";

export const WINDOW_BYTES = 64 * 1024;
export const ROW_KEY_SEPARATOR = "\u001f";
export const DELIMITERS = Object.freeze({ comma: ",", tab: "\t", pipe: "|" });
export const CONTACT_ROLES = Object.freeze(["home_address", "phone"]);

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const isBytes = (x) => x instanceof Uint8Array;

/** The piece a call names: a piece object, or the `key` of one of the definition's pieces. */
export function pieceOf(definition, piece) {
  if (isObj(piece)) return piece;
  const list = isObj(definition) && Array.isArray(definition.pieces) ? definition.pieces : [];
  if (typeof piece === "string") return list.find((p) => isObj(p) && p.key === piece) ?? null;
  return list.length === 1 && isObj(list[0]) ? list[0] : null;
}

/** The definition's columns that are well formed: `{name, role, keep}` objects with a string name. */
export function columnsOf(definition) {
  if (!isObj(definition) || !Array.isArray(definition.columns)) return [];
  return definition.columns.filter((c) => isObj(c) && typeof c.name === "string" && c.name !== "");
}

/** Whether the definition keeps a contact column (R3; refused by `jurisdictions` R128 too). */
export const keepsContact = (definition) => columnsOf(definition).some((c) => CONTACT_ROLES.includes(c.role) && c.keep !== false);

/** The columns a reduced copy holds: `keep` true and not a contact role, in the definition's order. */
export const keptColumnsOf = (definition) => columnsOf(definition).filter((c) => c.keep === true && !CONTACT_ROLES.includes(c.role));

function delimiterOf(definition, piece) {
  const name = (isObj(piece) && piece.delimiter) || (isObj(definition) && definition.delimiter) || "comma";
  return Object.hasOwn(DELIMITERS, name) ? { name, char: DELIMITERS[name] } : null;
}

/* The bytes of an incomplete UTF-8 sequence at the end of a window, so a window cut mid-character is not judged invalid. */
function utf8Tail(b) {
  for (let k = 1; k <= 3 && k <= b.length; k++) {
    const x = b[b.length - k];
    if ((x & 0xc0) === 0x80) continue;
    if (x >= 0xc0) return (x >= 0xf0 ? 4 : x >= 0xe0 ? 3 : 2) > k ? k : 0;
    return 0;
  }
  return 0;
}

/** The encoding of a piece from its first window (R1): a BOM's (UTF-8, UTF-16), else UTF-8 when the bytes are valid
 *  UTF-8, else windows-1252. `assumed` is false only for a BOM. */
export function encodingOf(head, final) {
  const b = head;
  if (b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) return { encoding: "utf-8", assumed: false };
  if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) return { encoding: "utf-16le", assumed: false };
  if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) return { encoding: "utf-16be", assumed: false };
  const seen = decodeText(final ? b : b.subarray(0, b.length - utf8Tail(b)));
  if (seen.ok && (seen.encoding === "utf-16le" || seen.encoding === "utf-16be")) return { encoding: seen.encoding, assumed: true };
  if (seen.ok && (seen.encoding === "utf-8" || seen.encoding === "us-ascii")) return { encoding: "utf-8", assumed: true };
  return { encoding: "windows-1252", assumed: true };
}

/* A decoder of bytes pushed in pieces: the encoding is decided on the first window, then every window is decoded in
   order. `onText(text)` takes each decoded run. An assumed UTF-8 is checked window by window: from the first window that
   is not valid UTF-8, the rest is read as windows-1252 (ASCII reads alike under both) and the piece states that. */
function createDecoder(onText, windowBytes) {
  let head = [], headLen = 0, decoder = null, stated = null, checking = false, carry = new Uint8Array(0);
  const start = (bytes, final) => {
    stated = encodingOf(bytes, final);
    checking = stated.encoding === "utf-8" && stated.assumed;
    decoder = new TextDecoder(stated.encoding, checking ? { fatal: true } : undefined);
  };
  const checked = (part, last) => {
    const b = carry.length ? join([carry, part], carry.length + part.length) : part;
    const keep = last ? 0 : utf8Tail(b);
    const body = keep ? b.subarray(0, b.length - keep) : b;
    carry = keep ? b.slice(b.length - keep) : new Uint8Array(0);
    try {
      return decoder.decode(body);
    } catch {
      stated = { encoding: "windows-1252", assumed: true };
      checking = false;
      decoder = new TextDecoder("windows-1252");
      const text = decoder.decode(b, { stream: !last });
      carry = new Uint8Array(0);
      return text;
    }
  };
  const decode = (bytes, final) => {
    for (let at = 0; at < bytes.length; at += windowBytes) {
      const part = bytes.subarray(at, Math.min(bytes.length, at + windowBytes));
      const last = final && at + windowBytes >= bytes.length;
      onText(checking ? checked(part, last) : decoder.decode(part, { stream: !last }));
    }
    if (final && !bytes.length) onText(checking ? checked(new Uint8Array(0), true) : decoder.decode());
  };
  return {
    get stated() { return stated; },
    push(chunk) {
      if (decoder) return decode(chunk, false);
      head.push(chunk); headLen += chunk.length;
      if (headLen < windowBytes) return;
      const all = join(head, headLen);
      head = []; headLen = 0;
      start(all, false);
      decode(all, false);
    },
    end() {
      if (!decoder) {
        const all = join(head, headLen);
        head = [];
        start(all, true);
        decode(all, true);
        return;
      }
      decode(new Uint8Array(0), true);
    },
  };
}

function join(parts, n) {
  if (parts.length === 1) return parts[0];
  const out = new Uint8Array(n);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

/** The header names of a separate header file's bytes (R1 `header_from`), or null. */
function headerNames(bytes, delimiter) {
  let names = null;
  const walk = createRecordWalk(delimiter, (fields) => { if (names === null) names = fields; });
  const dec = createDecoder((t) => walk.feed(t), WINDOW_BYTES);
  dec.push(bytes);
  dec.end();
  walk.end();
  return names;
}

const blank = (fields) => fields.length === 1 && fields[0] === "";

/** The parser `readRows` and `createReducer` share. `push(bytes)` and `end()` each answer the items completed: first
 *  `{ok: true, header, encoding, assumed, delimiter}` (or `{ok: false, why, ...}`, after which nothing more), then
 *  `{row_no, key, cells}` or `{row_no, undetermined: true, why, ...}`; `end()` closes with
 *  `{done: true, rows, undetermined_rows, encoding, assumed}`, the encoding the piece was read in. Never throws. */
export function createRowParser(definition, piece, opts = {}) {
  const out = [];
  let failed = null;
  const fail = (why, more = {}) => { if (!failed) { failed = { ok: false, why, ...more }; out.push(failed); } };
  const p = pieceOf(definition, piece);
  const cols = columnsOf(definition);
  const delim = delimiterOf(definition, p);
  if (!isObj(definition) || !cols.length) fail("definition_invalid");
  else if (!p) fail("piece_unknown");
  else if (!delim) fail("delimiter_unknown");
  const o = isObj(opts) ? opts : {};
  const windowBytes = Number.isInteger(o.windowBytes) && o.windowBytes >= 16 ? o.windowBytes : WINDOW_BYTES;
  const keyCols = !failed && Array.isArray(definition.row_key) ? definition.row_key : [];
  const byContent = !failed && definition.row_key_basis === "content";
  const kept = keptColumnsOf(definition);
  let index = null;           // definition column name -> header position
  let expected = 0, rowNo = 0, rows = 0, undetermined = 0;
  const seen = new Map();     // content key digest -> occurrences (row_key_basis: content)

  const takeHeader = (fields) => {
    const names = fields.map((f) => f.trim());
    index = new Map();
    for (const c of cols) {
      const at = names.indexOf(c.name);
      if (at < 0) return fail("column_missing", { column: c.name });
      index.set(c.name, at);
    }
    expected = names.length;
    announce = { ok: true, header: names, encoding: null, assumed: true, delimiter: delim.name };
    announced();
  };
  /* The header's item waits for the encoding, which a separate header file's piece learns from its first window. */
  let announce = null;
  const announced = () => {
    if (!announce || !dec.stated) return;
    out.push({ ...announce, encoding: dec.stated.encoding, assumed: dec.stated.assumed });
    announce = null;
  };

  const keyOf = (cells) => {
    if (!byContent) return keyCols.map((k) => cells[k] ?? "").join(ROW_KEY_SEPARATOR);
    const digest = sha256HexSync(JSON.stringify(kept.map((c) => [c.name, cells[c.name]])));
    const n = (seen.get(digest) ?? 0) + 1;
    seen.set(digest, n);
    return `${digest}${ROW_KEY_SEPARATOR}${n}`;
  };

  const onRecord = (fields, info) => {
    if (failed) return;
    if (index === null) {
      if (p.header_from) { fail("header_missing"); return; }
      if (blank(fields) && !info.open) return;
      return takeHeader(fields);
    }
    if (blank(fields) && !info.open) return;
    rowNo++;
    if (info.open) { undetermined++; out.push({ row_no: rowNo, undetermined: true, why: "unterminated_quote" }); return; }
    if (info.cols !== expected) { undetermined++; out.push({ row_no: rowNo, undetermined: true, why: "field_count", fields: info.cols, expected }); return; }
    if (info.over) { undetermined++; out.push({ row_no: rowNo, undetermined: true, why: "cell_too_long", columns: info.over.map(([c]) => c) }); return; }
    const cells = {};
    for (const c of cols) cells[c.name] = fields[index.get(c.name)];
    rows++;
    out.push({ row_no: rowNo, key: keyOf(cells), cells });
  };

  const walk = failed ? null : createRecordWalk(delim.char, onRecord);
  const dec = createDecoder((t) => { announced(); if (!failed) walk.feed(t); }, windowBytes);

  if (!failed && p.header_from) {
    const h = o.header;
    const bytes = isBytes(h) ? h : Array.isArray(h) && h.every(isBytes) ? join(h, h.reduce((n, x) => n + x.length, 0)) : null;
    const names = bytes ? headerNames(bytes, delim.char) : null;
    if (!names) fail("header_missing");
    else takeHeader(names);
  }

  const drain = () => out.splice(0, out.length);
  let ended = false;
  return {
    push(chunk) {
      try {
        if (failed || ended) return drain();
        if (!isBytes(chunk)) { fail("chunk_not_bytes"); return drain(); }
        dec.push(chunk);
      } catch { fail("unreadable"); }
      return drain();
    },
    end() {
      if (ended) return drain();
      ended = true;
      try {
        if (!failed) {
          dec.end();
          announced();
          walk.end();
          if (index === null) fail("header_missing");
        }
      } catch { fail("unreadable"); }
      if (!failed) out.push({ done: true, rows, undetermined_rows: undetermined, encoding: dec.stated?.encoding ?? null, assumed: dec.stated?.assumed ?? true });
      return drain();
    },
    get failed() { return failed; },
    get stated() { return dec.stated; },
  };
}

/** R1. `readRows(source, definition, piece, opts)`: `source` an async (or sync) iterable of `Uint8Array` chunks;
 *  `opts.header` a separate header file's bytes. Yields the parser's items in order. Never throws: a source that fails
 *  is `{ok: false, why: "source_failed"}`; an item of the source that is `{ok: false, why}` (a zip member's CRC, R2)
 *  ends the read with that item. */
export async function* readRows(source, definition, piece, opts = {}) {
  const parser = createRowParser(definition, piece, opts);
  const pending = parser.push(new Uint8Array(0));
  for (const item of pending) yield item;
  if (parser.failed) return;
  if (source === null || (typeof source !== "object" && typeof source !== "function") ||
      (typeof source[Symbol.asyncIterator] !== "function" && typeof source[Symbol.iterator] !== "function")) {
    yield { ok: false, why: "source_invalid" };
    return;
  }
  try {
    for await (const chunk of source) {
      if (!isBytes(chunk)) {
        if (isObj(chunk) && chunk.ok === false) { yield { ok: false, why: String(chunk.why) }; return; }
        continue;
      }
      for (const item of parser.push(chunk)) yield item;
      if (parser.failed) return;
    }
  } catch {
    yield { ok: false, why: "source_failed" };
    return;
  }
  for (const item of parser.end()) yield item;
}
