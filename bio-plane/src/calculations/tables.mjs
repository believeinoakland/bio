/* calculations' declared tables (requirements: `build/requirements/calculations.md`, R1–R3). A table is a member's
 * declaration over a captured source: a Table Schema with a declared header, held as canonical RFC 4180 UTF-8 CSV and
 * keyed by the canonical bytes' SHA-256. Pure: nothing here reads the record, a clock or the network. A cell is held
 * exactly as the source states it; one that does not read as its column's declared type is listed `undetermined`,
 * never coerced (calc-grammar reads it the same way at evaluation: its R7). */

import { FIELD_TYPES, parseFigure } from "../calc-grammar/index.mjs";
import { isCalendarDate } from "../civil-time/index.mjs";
import { sha256HexSync, createSha256 } from "../record-grammar/index.mjs";

/** R1: the bounds of a table, in bytes of canonical CSV and in cells. */
export const TABLE_MAX_BYTES = 20 * 1024 * 1024;
export const TABLE_MAX_CELLS = 500_000;
/** R1: how many undetermined cells a declaration lists by place (the count is always whole). */
export const UNDETERMINED_LISTED = 200;

/** R2: the closed lists of column roles. Money roles; person and entity keys (each naming the id space, entity scheme
 *  or captured crosswalk it resolves through); roster roles; and the two ends of a crosswalk (R15). */
export const MONEY_ROLES = Object.freeze(["amount", "payer", "payee", "fund", "account", "period", "kind", "phase",
  "stage", "basis", "currency"]);
export const KEY_ROLES = Object.freeze(["person_key", "entity_key"]);
export const ROSTER_ROLES = Object.freeze(["roster_person", "roster_organisation", "roster_post", "roster_period"]);
export const CROSSWALK_ROLES = Object.freeze(["crosswalk_from", "crosswalk_to"]);
export const ROLES = Object.freeze([...MONEY_ROLES, ...KEY_ROLES, ...ROSTER_ROLES, ...CROSSWALK_ROLES]);
/** The roles whose values name an entity, and so must say how they resolve (R2, R14, R15, R20). */
export const RESOLVED_ROLES = Object.freeze(["payer", "payee", "person_key", "entity_key", "roster_person",
  "roster_organisation"]);

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const FIELD_NAME = /^[^\u0000-\u001f]{1,200}$/;
const SHA = /^[0-9a-f]{64}$/;

// ---- RFC 4180 ----

/** Reads CSV text row by row (RFC 4180: quoted fields, doubled quotes, CRLF or LF line ends, a leading BOM dropped),
 *  handing each row, a list of strings, to `onRow` as it is read, so a large table is never held twice. `{rows}` (the
 *  count) or `{error}` naming the first fault. Never throws, unless `onRow` does. */
export function scanCsv(text, onRow) {
  if (typeof text !== "string") return { error: "the source is not text" };
  const s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const n = s.length;
  let i = 0, count = 0, row = [];
  if (!n) return { rows: 0 };
  for (;;) {
    let field;
    if (s.charCodeAt(i) === 34) {
      const parts = [];
      let j = i + 1;
      for (;;) {
        const q = s.indexOf('"', j);
        if (q < 0) return { error: "a quoted field is not closed" };
        parts.push(s.slice(j, q));
        if (s.charCodeAt(q + 1) === 34) { parts.push('"'); j = q + 2; continue; }
        i = q + 1;
        break;
      }
      field = parts.join("");
      const c = s.charCodeAt(i);
      if (i < n && c !== 44 && c !== 10 && c !== 13)
        return { error: `a quoted field on line ${count + 1} is followed by text before its separator` };
    } else {
      let j = i;
      while (j < n) {
        const c = s.charCodeAt(j);
        if (c === 44 || c === 10 || c === 13) break;
        if (c === 34) return { error: `a quote opens inside an unquoted field on line ${count + 1}` };
        j++;
      }
      field = s.slice(i, j);
      i = j;
    }
    row.push(field);
    if (i >= n) { onRow(row); return { rows: count + 1 }; }
    if (s.charCodeAt(i) === 44) {
      i++;
      if (i >= n) { row.push(""); onRow(row); return { rows: count + 1 }; }
      continue;
    }
    i += s.charCodeAt(i) === 13 && s.charCodeAt(i + 1) === 10 ? 2 : 1;
    onRow(row);
    count++;
    row = [];
    if (i >= n) return { rows: count };
  }
}

/** Reads CSV text into rows of strings (`scanCsv`, every row kept). `{rows}` or `{error}`. Never throws. */
export function parseCsv(text) {
  const rows = [];
  const r = scanCsv(text, (row) => rows.push(row));
  return r.error ? r : { rows };
}

const needsQuote = (v) => /[",\r\n]/.test(v);
const csvField = (v) => (needsQuote(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** R1: the canonical bytes of a table: the header, then each row, every field quoted only where RFC 4180 needs it,
 *  every line ended CRLF, UTF-8. The same table always gives the same bytes, so the same SHA-256. */
export function canonicalCsv(header, rows) {
  const lines = [header, ...rows].map((r) => r.map((v) => csvField(String(v))).join(","));
  return `${lines.join("\r\n")}\r\n`;
}

export const shaOf = (text) => sha256HexSync(text);

// ---- the schema ----

/** R1: `null` when the schema is a Table Schema over the declared header, else `{field, why}` naming the field. */
export function schemaFault(schema, header) {
  if (!plain(schema) || !Array.isArray(schema.fields) || !schema.fields.length)
    return { field: null, why: "a Table Schema is {fields: [{name, type}]} with one field per column" };
  const extra = Object.keys(schema).filter((k) => k !== "fields");
  if (extra.length) return { field: extra[0], why: "not a part of the Table Schema this module holds" };
  if (schema.fields.length !== header.length)
    return { field: null, why: `the schema has ${schema.fields.length} fields and the header ${header.length} columns` };
  for (let i = 0; i < schema.fields.length; i++) {
    const f = schema.fields[i];
    if (!plain(f)) return { field: `fields[${i}]`, why: "a field is {name, type}" };
    const bad = Object.keys(f).filter((k) => !["name", "type", "unit", "currency", "zone", "title"].includes(k));
    if (bad.length) return { field: String(f.name ?? `fields[${i}]`), why: `"${bad[0]}" is not a part of a field` };
    if (f.name !== header[i]) return { field: String(f.name ?? `fields[${i}]`), why: `the header names column ${i + 1} "${header[i]}"` };
    if (!FIELD_TYPES.includes(f.type)) return { field: f.name, why: `its type is one of ${FIELD_TYPES.join(", ")}` };
    for (const k of ["unit", "currency", "zone", "title"])
      if (f[k] !== undefined && (typeof f[k] !== "string" || !f[k].trim())) return { field: f.name, why: `its ${k} is text` };
    if (f.currency !== undefined && !/^[A-Z]{3}$/.test(f.currency)) return { field: f.name, why: "its currency is a three-letter code" };
  }
  return null;
}

/** R1: the declared header, or `null`: a list of distinct, non-empty column names. */
export function readHeader(header) {
  if (!Array.isArray(header) || !header.length) return null;
  if (!header.every((h) => typeof h === "string" && FIELD_NAME.test(h.trim()))) return null;
  const names = header.map((h) => h.trim());
  return new Set(names).size === names.length ? names : null;
}

/** R2: `null` when the roles are well formed over the schema, else `{field, why}`. `roles` maps a column to
 *  `{role, space?, scheme?, crosswalk?}`; a role naming an entity says how it resolves: an id space (`id-spaces`), an
 *  entity scheme (`entities`' scheme identifiers) or a captured crosswalk table `{table, from, to}`. */
export function rolesFault(roles, header) {
  if (roles === undefined || roles === null) return null;
  if (!plain(roles)) return { field: "roles", why: "roles map a column to {role, space?, scheme?, crosswalk?}" };
  const seen = new Map();
  for (const [col, r] of Object.entries(roles)) {
    if (!header.includes(col)) return { field: col, why: "not a column of the declared header" };
    if (!plain(r)) return { field: col, why: "a role is {role, space?, scheme?, crosswalk?}" };
    const bad = Object.keys(r).filter((k) => !["role", "space", "scheme", "crosswalk"].includes(k));
    if (bad.length) return { field: col, why: `"${bad[0]}" is not a part of a role` };
    if (!ROLES.includes(r.role)) return { field: col, why: `its role is one of ${ROLES.join(", ")}` };
    if (seen.has(r.role)) return { field: col, why: `the role ${r.role} is already held by "${seen.get(r.role)}"` };
    seen.set(r.role, col);
    const ways = ["space", "scheme", "crosswalk"].filter((k) => r[k] !== undefined);
    if (RESOLVED_ROLES.includes(r.role)) {
      if (ways.length !== 1) return { field: col, why: `the role ${r.role} names exactly one way it resolves: an id space, an entity scheme or a captured crosswalk` };
    } else if (ways.length) return { field: col, why: `the role ${r.role} names no way of resolving` };
    for (const k of ["space", "scheme"])
      if (r[k] !== undefined && (typeof r[k] !== "string" || !r[k].trim())) return { field: col, why: `its ${k} is a name` };
    if (r.crosswalk !== undefined) {
      const c = r.crosswalk;
      if (!plain(c) || !SHA.test(c.table ?? "") || typeof c.from !== "string" || typeof c.to !== "string")
        return { field: col, why: "a crosswalk is {table: <a declared crosswalk's sha256>, from, to}" };
    }
  }
  if (seen.has("crosswalk_from") !== seen.has("crosswalk_to"))
    return { field: "roles", why: "a crosswalk declares both ends, crosswalk_from and crosswalk_to" };
  return null;
}

/** R3: `null` when the vintage is well formed, else the why. `{key, valid: {from, to, precision?, zone?}, basis?,
 *  supersedes?}`, the validity as `civil-time.validAt` reads it, a null bound meaning "not stated". */
export function vintageFault(vintage) {
  if (vintage === undefined || vintage === null) return null;
  if (!plain(vintage)) return "a vintage is {key, valid: {from, to}, basis?, supersedes?}";
  const bad = Object.keys(vintage).filter((k) => !["key", "valid", "basis", "supersedes"].includes(k));
  if (bad.length) return `"${bad[0]}" is not a part of a vintage`;
  if (typeof vintage.key !== "string" || !vintage.key.trim() || vintage.key.length > 200) return "a vintage names its key";
  if (!plain(vintage.valid)) return "a vintage states its validity, {from, to}";
  for (const side of ["from", "to"]) {
    const b = vintage.valid[side];
    if (b !== null && b !== undefined && !(typeof b === "string" && isCalendarDate(b)))
      return `the validity's ${side} is a date YYYY-MM-DD or null (not stated)`;
  }
  if (vintage.supersedes !== undefined && !SHA.test(vintage.supersedes ?? "")) return "supersedes names a table by its sha256";
  return null;
}

// ---- cells ----

const DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?Z?$/;

/** R1: whether a cell reads as its field's type: `null`, or the why it is undetermined. Never coerces. */
export function cellFault(field, raw) {
  const v = typeof raw === "string" ? raw.trim() : raw;
  if (v === undefined || v === null || v === "") return "empty";
  switch (field.type) {
    case "string": return null;
    case "boolean": return v === "true" || v === "false" ? null : "not true or false";
    case "date": return isCalendarDate(v) ? null : "not a calendar date YYYY-MM-DD";
    case "datetime": return DATETIME.test(v) && isCalendarDate(v.slice(0, 10)) ? null : "not a date and time";
    default: {
      const f = parseFigure(v);
      if (f.refused) return `not a figure: ${f.why}`;
      if (field.type === "integer" && (f.precision === "range" || /\.\d*[1-9]/.test(f.value))) return "not a whole number";
      if (field.currency && f.currency && f.currency !== field.currency) return `names ${f.currency}, and the column ${field.currency}`;
      return null;
    }
  }
}

/** R1: the table built row by row from the source's rows (`push`), then `finish()`: the header row dropped when it
 *  repeats the declared header; each row padded with empty cells to the header's width; trailing empty rows dropped;
 *  the cells that do not read as their types listed; the canonical bytes (`canonicalCsv`'s, line by line) and their
 *  SHA-256, made as the rows arrive so the rows are never held whole. `finish()` answers `{bytes, sha, rows,
 *  undetermined, count}`, or `{fault}` / `{tooLarge}`. */
export function tableBuilder(header, fields, { maxCells = TABLE_MAX_CELLS, maxBytes = TABLE_MAX_BYTES } = {}) {
  const enc = new TextEncoder();
  const hash = createSha256();
  const chunks = [];
  let lines = [], size = 0, rows = 0, cells = 0, count = 0, first = true, fault = null, tooLarge = null, blank = [];
  const undetermined = [];
  const width = header.length;
  const flush = () => {
    if (!lines.length) return;
    const b = enc.encode(lines.join(""));
    lines = [];
    hash.update(b);
    chunks.push(b);
    size += b.byteLength;
    if (size > maxBytes && !tooLarge) tooLarge = { bound: "bytes", max: maxBytes, got: size };
  };
  const line = (r) => { lines.push(`${r.map((v) => csvField(v)).join(",")}\r\n`); if (lines.length >= 4096) flush(); };
  line(header);
  const take = (r) => {
    if (r.length > width && r.slice(width).some((x) => x.trim() !== "")) {
      fault = fault || { field: null, why: `data row ${rows + 1} has ${r.length} cells, and the header ${width}` };
      return;
    }
    const row = new Array(width);
    for (let k = 0; k < width; k++) row[k] = r[k] ?? "";
    for (let k = 0; k < width; k++) {
      const why = cellFault(fields[k], row[k]);
      if (why) { count++; if (undetermined.length < UNDETERMINED_LISTED) undetermined.push({ row: rows, column: fields[k].name, why }); }
    }
    cells += width;
    if (cells > maxCells && !tooLarge) tooLarge = { bound: "cells", max: maxCells, got: cells };
    line(row);
    rows++;
  };
  return {
    push(raw) {
      if (fault || tooLarge) return;
      const r = raw.map((x) => (x === null || x === undefined ? "" : String(x)));
      if (first) {
        first = false;
        const same = r.length >= width && header.every((h, i) => r[i].trim() === h) && r.slice(width).every((x) => x.trim() === "");
        if (same) return;
      }
      if (r.every((x) => x.trim() === "")) { blank.push(r); return; }
      for (const b of blank) take(b);
      blank = [];
      take(r);
    },
    finish() {
      if (fault) return { fault };
      flush();
      if (tooLarge) return { tooLarge };
      const bytes = new Uint8Array(size);
      let at = 0;
      for (const c of chunks) { bytes.set(c, at); at += c.byteLength; }
      chunks.length = 0;
      return { bytes, sha: hash.hex(), rows, undetermined, count };
    },
  };
}

/** A held table's rows as calc-grammar reads a table: `{fields, rows: [{<name>: cell}]}`. */
export function asGrammarTable(fields, rows, from = 0) {
  const names = fields.map((f) => f.name);
  const out = new Array(Math.max(0, rows.length - from));
  for (let i = from; i < rows.length; i++) {
    const r = rows[i], o = {};
    for (let k = 0; k < names.length; k++) o[names[k]] = r[k] ?? "";
    out[i - from] = o;
    rows[i] = null;   /* each source row is let go as its object is made, so the two are never held whole at once */
  }
  return { fields: fields.map((f) => ({ name: f.name, type: f.type, ...(f.unit && { unit: f.unit }),
    ...(f.currency && { currency: f.currency }), ...(f.zone && { zone: f.zone }) })), rows: out };
}
