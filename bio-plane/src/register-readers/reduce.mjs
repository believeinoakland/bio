/* register-readers R3, R4, R9: the columns that must not be kept are dropped before any other code sees a row, a contact
 * typed into a free-text cell is withheld, and the original stream becomes the reduced copy as it passes. */
import { createResumableSha256 } from "../record-grammar/index.mjs";
import { CONTACT_ROLES, columnsOf, createRowParser, keepsContact, keptColumnsOf, pieceOf } from "./rows.mjs";
import { filterFingerprint, indexTerms, judge, validateFilter } from "./terms.mjs";

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

/* ------------------------------------------------------------------ R4 */

/* North American telephone numbers: with an area code (in parentheses, or followed by a dash, dot or space), or seven
   digits with a dash; a country code 1 and an extension may go with either. Not inside a longer run of digits. */
const PHONE = /(?<![\d-])(?:\+?1[\s.-]?)?(?:(?:\(\d{3}\)\s*|\d{3}[\s.-])\d{3}[\s.-]\d{4}|\d{3}-\d{4})(?:\s*(?:x|ext\.?)\s*\d{1,6})?(?![\d-])/iu;
const ESCAPE = /[.*+?^${}()|[\]\\]/g;
const typeRules = new WeakMap();

/* The words of `streetTypes`: strings, or the string values (and lists of strings) of objects. */
function streetWords(streetTypes) {
  const words = new Set();
  const take = (v) => {
    if (typeof v === "string") { const w = v.trim().replace(/\.$/, ""); if (w) words.add(w.toLowerCase()); }
    else if (Array.isArray(v)) v.forEach((x) => typeof x === "string" && take(x));
    else if (isObj(v)) Object.values(v).forEach((x) => (typeof x === "string" || Array.isArray(x)) && take(x));
  };
  if (Array.isArray(streetTypes)) streetTypes.forEach(take);
  else if (isObj(streetTypes)) take(streetTypes);
  return [...words].sort((a, b) => b.length - a.length);
}

/* A street address: a house number, one to four street words and a street type the caller's layers name. */
function addressRule(streetTypes) {
  if (streetTypes === null || typeof streetTypes !== "object") return null;
  if (typeRules.has(streetTypes)) return typeRules.get(streetTypes);
  const words = streetWords(streetTypes);
  const rule = words.length
    ? new RegExp(`(?<![\\p{L}\\p{N}-])\\d{1,6}[\\p{L}]?\\s+(?:[\\p{L}\\p{N}.'-]+\\s+){1,4}?(?:${words.map((w) => w.replace(ESCAPE, "\\$&")).join("|")})\\.?(?![\\p{L}\\p{N}])`, "iu")
    : null;
  typeRules.set(streetTypes, rule);
  return rule;
}

/** R4. Whether free text holds a phone number or a street address: `{found, kinds}`. The street types are data the
 *  caller passes from the active layers; with none, only phone numbers are found. Pure; never throws. */
export function contactShape(text, streetTypes) {
  try {
    if (typeof text !== "string" || !text) return { found: false, kinds: [] };
    const kinds = [];
    if (PHONE.test(text)) kinds.push("phone");
    const rule = addressRule(streetTypes);
    if (rule && rule.test(text)) kinds.push("address");
    return { found: kinds.length > 0, kinds };
  } catch {
    return { found: false, kinds: [] };
  }
}

/** The roles whose kept cells are free text, read by `contactShape` (R4). */
export const FREE_TEXT_ROLES = Object.freeze(["other", "name", "organization", "form"]);
export const WITHHELD = Object.freeze({ withheld: "contact_shape" });

/* ------------------------------------------------------------------ R3 */

/** R3. `reduce(row, definition, opts)`: `{ok: true, kept, withheld}`, `kept` only the columns the definition keeps (never
 *  a contact role, never an unlisted column), in the definition's order, a free-text cell holding a contact shape
 *  replaced by `{withheld: "contact_shape"}`; `withheld` the number replaced. `row` is a row of `readRows` or its cells.
 *  `opts.streetTypes` are R4's. Never throws. */
export function reduce(row, definition, opts = {}) {
  try {
    if (!isObj(definition) || !columnsOf(definition).length) return { ok: false, why: "definition_invalid" };
    if (keepsContact(definition)) return { ok: false, why: "definition_keeps_contact" };
    const cells = isObj(row) && isObj(row.cells) ? row.cells : row;
    if (!isObj(cells)) return { ok: false, why: "row_invalid" };
    const streetTypes = isObj(opts) ? opts.streetTypes : undefined;
    const kept = {};
    let withheld = 0;
    for (const c of keptColumnsOf(definition)) {
      const v = Object.hasOwn(cells, c.name) ? cells[c.name] : "";
      if (FREE_TEXT_ROLES.includes(c.role) && contactShape(v, streetTypes).found) { kept[c.name] = { ...WITHHELD }; withheld++; }
      else kept[c.name] = v;
    }
    return { ok: true, kept, withheld };
  } catch {
    return { ok: false, why: "row_invalid" };
  }
}

/** R3. The header's columns that a reduced row does not hold: `{name, why}`, `why` `contact_role` (a `home_address` or
 *  `phone` column), `unlisted` (not in the definition) or `not_kept` (listed with `keep` false). Names only. */
export function droppedColumns(header, definition) {
  try {
    if (!Array.isArray(header)) return [];
    const byName = new Map(columnsOf(definition).map((c) => [c.name, c]));
    const out = [];
    for (const h of header) {
      if (typeof h !== "string") continue;
      const name = h.trim();
      const c = byName.get(name);
      if (!c) out.push({ name, why: "unlisted" });
      else if (CONTACT_ROLES.includes(c.role)) out.push({ name, why: "contact_role" });
      else if (c.keep !== true) out.push({ name, why: "not_kept" });
    }
    return out;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ R9 */

const utf8 = new TextEncoder();
/* The reduced copy's one form: UTF-8, comma, LF, a field quoted only when it holds a comma, a quote, a CR or a LF. */
const csvField = (v) => {
  const s = typeof v === "string" ? v : isObj(v) ? "" : v == null ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvLine = (fields) => `${fields.map(csvField).join(",")}\n`;
const EMPTY = new Uint8Array(0);

/** R9. `createReducer({definition, piece, filter, header, sha256, streetTypes, covers})`: `write(chunk)` takes the
 *  piece's decompressed bytes and answers the reduced bytes ready to store; `end()` answers `{bytes, ok, original,
 *  reduced, filter_fingerprint}` (`bytes` the rest of the reduced copy). `sha256` is `createResumableSha256` (the
 *  default); `header` a separate header file's bytes; `covers` what the bytes are (`whole_file`, or `member:<name>`,
 *  by default from the piece's `member`). Never throws. */
export function createReducer(options) {
  const o = isObj(options) ? options : {};
  const { definition, filter = {}, header, streetTypes } = o;
  const piece = pieceOf(definition, o.piece);
  const covers = typeof o.covers === "string" ? o.covers : isObj(piece) && typeof piece.member === "string" ? `member:${piece.member}` : "whole_file";
  let failure = null;
  if (!isObj(definition) || !columnsOf(definition).length) failure = { why: "definition_invalid" };
  else if (keepsContact(definition)) failure = { why: "definition_keeps_contact" };
  let checked = null;
  if (!failure) {
    checked = validateFilter(filter, definition);
    if (!checked.ok) failure = { why: checked.code, field: checked.field };
  }
  const make = typeof o.sha256 === "function" ? o.sha256 : createResumableSha256;
  let original, reducedHash;
  try { original = make(); reducedHash = make(); } catch { failure ??= { why: "sha256_invalid" }; }
  const parser = failure ? null : createRowParser(definition, piece, { header });
  const kept = failure ? [] : keptColumnsOf(definition);
  let bytesIn = 0, bytesOut = 0, rowsIn = 0, rowsOut = 0, rowsUndetermined = 0, withheld = 0;
  let headerNames = null, wroteHeader = false, ended = false, closing = null;

  const emit = (text, parts) => {
    const b = utf8.encode(text);
    reducedHash.update(b);
    bytesOut += b.length;
    parts.push(b);
  };
  const headerLine = (parts) => {
    if (wroteHeader) return;
    wroteHeader = true;
    emit(csvLine(["src_row", ...kept.map((c) => c.name)]), parts);
  };
  const take = (items) => {
    const parts = [];
    for (const it of items) {
      if (it.ok === false) { failure ??= { why: it.why, ...(it.column ? { column: it.column } : {}) }; break; }
      if (it.ok === true) { headerNames = it.header; headerLine(parts); continue; }
      if (it.done) { closing = it; continue; }
      rowsIn++;
      if (it.undetermined) { rowsUndetermined++; continue; }
      const r = reduce(it, definition, { streetTypes });
      if (!r.ok) { failure ??= { why: r.why }; break; }
      withheld += r.withheld;
      const j = judge(indexTerms(r.kept, definition), checked.filter, definition);
      if (j.undetermined) rowsUndetermined++;
      if (!j.match) continue;
      rowsOut++;
      emit(csvLine([String(it.row_no), ...kept.map((c) => r.kept[c.name])]), parts);
    }
    if (!parts.length) return EMPTY;
    if (parts.length === 1) return parts[0];
    const n = parts.reduce((s, p) => s + p.length, 0), all = new Uint8Array(n);
    let at = 0;
    for (const p of parts) { all.set(p, at); at += p.length; }
    return all;
  };

  return {
    write(chunk) {
      try {
        if (ended || failure) return EMPTY;
        if (!(chunk instanceof Uint8Array)) { failure = { why: "chunk_not_bytes" }; return EMPTY; }
        original.update(chunk);
        bytesIn += chunk.length;
        return take(parser.push(chunk));
      } catch {
        failure ??= { why: "unreadable" };
        return EMPTY;
      }
    },
    end() {
      if (ended) return { bytes: EMPTY, ok: false, why: "ended" };
      ended = true;
      try {
        const bytes = failure ? EMPTY : take(parser.end());
        if (failure) return { bytes: EMPTY, ok: false, ...failure, original: { bytes: bytesIn, covers } };
        if (!wroteHeader) return { bytes: EMPTY, ok: false, why: "header_missing", original: { bytes: bytesIn, covers } };
        return {
          bytes, ok: true,
          original: { sha256: original.hex(), bytes: bytesIn, covers, encoding: closing?.encoding ?? null, assumed: closing?.assumed ?? true },
          reduced: { sha256: reducedHash.hex(), bytes: bytesOut, rows_in: rowsIn, rows_out: rowsOut, rows_undetermined: rowsUndetermined,
            kept_columns: ["src_row", ...kept.map((c) => c.name)], dropped_columns: droppedColumns(headerNames, definition), withheld_cells: withheld },
          filter_fingerprint: filterFingerprint(checked.filter),
        };
      } catch {
        return { bytes: EMPTY, ok: false, why: "unreadable", original: { bytes: bytesIn, covers } };
      }
    },
  };
}
