/* calculations' declared tables (requirements: `build/requirements/calculations.md`, R1–R3). A table is a member's
 * declaration over a captured source: a Table Schema with a declared header, held as canonical RFC 4180 UTF-8 CSV and
 * keyed by the canonical bytes' SHA-256. Pure: nothing here reads the record, a clock or the network. A cell is held
 * exactly as the source states it; one that does not read as its column's declared type is listed `undetermined`,
 * never coerced (calc-grammar reads it the same way at evaluation: its R7). */

import { FIELD_TYPES, parseFigure } from "../calc-grammar/index.mjs";
import { isCalendarDate } from "../civil-time/index.mjs";
import { sha256HexSync } from "../record-grammar/index.mjs";

/** R1: the bounds of a table, in bytes of canonical CSV and in cells. */
export const TABLE_MAX_BYTES = 20 * 1024 * 1024;
export const TABLE_MAX_CELLS = 1_000_000;
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

/** Reads CSV text into rows of strings (RFC 4180: quoted fields, doubled quotes, CRLF or LF line ends, a leading BOM
 *  dropped). `{rows}` or `{error}` naming the first fault. Never throws. */
export function parseCsv(text) {
  if (typeof text !== "string") return { error: "the source is not text" };
  let s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows = [];
  let row = [], field = "", i = 0, quoted = false, started = false;
  const endField = () => { row.push(field); field = ""; started = false; };
  const endRow = () => { endField(); rows.push(row); row = []; };
  while (i < s.length) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++;
        if (i < s.length && s[i] !== "," && s[i] !== "\n" && s[i] !== "\r")
          return { error: `a quoted field on line ${rows.length + 1} is followed by text before its separator` };
        continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') {
      if (started || field.length) return { error: `a quote opens inside an unquoted field on line ${rows.length + 1}` };
      quoted = true; started = true; i++; continue;
    }
    if (c === ",") { endField(); i++; continue; }
    if (c === "\r" || c === "\n") {
      endRow();
      i += c === "\r" && s[i + 1] === "\n" ? 2 : 1;
      continue;
    }
    field += c; started = true; i++;
  }
  if (quoted) return { error: "a quoted field is not closed" };
  if (field.length || started || row.length) endRow();
  return { rows };
}

const needsQuote = (v) => /[",\r\n]/.test(v);
const csvField = (v) => (needsQuote(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** R1: the canonical bytes of a table: the header, then each row, every field quoted only where RFC 4180 needs it,
 *  every line ended CRLF, UTF-8. The same table always gives the same bytes, so the same SHA-256. */
export function canonicalCsv(header, rows) {
  const lines = [header, ...rows].map((r) => r.map((v) => csvField(String(v))).join(","));
  return `${lines.join("\r\n")}\r\n`;
}

export const utf8 = (s) => new TextEncoder().encode(s);
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

/** R1: from the source's rows, the table: the header row dropped when it repeats the declared header; each row
 *  padded with empty cells to the header's width; the cells that do not read as their types listed. `{rows,
 *  undetermined, count}` or `{fault}`. */
export function shapeRows(sourceRows, header, fields) {
  const same = (r) => r.length >= header.length && header.every((h, i) => String(r[i] ?? "").trim() === h)
    && r.slice(header.length).every((x) => String(x ?? "").trim() === "");
  const body = sourceRows.length && same(sourceRows[0]) ? sourceRows.slice(1) : sourceRows.slice();
  while (body.length && body[body.length - 1].every((x) => String(x ?? "").trim() === "")) body.pop();
  const rows = [];
  const undetermined = [];
  let count = 0;
  for (let i = 0; i < body.length; i++) {
    const r = body[i].map((x) => (x === null || x === undefined ? "" : String(x)));
    if (r.length > header.length && r.slice(header.length).some((x) => x.trim() !== ""))
      return { fault: { field: null, why: `data row ${i + 1} has ${r.length} cells, and the header ${header.length}` } };
    const row = header.map((_, k) => r[k] ?? "");
    fields.forEach((f, k) => {
      const why = cellFault(f, row[k]);
      if (why) {
        count++;
        if (undetermined.length < UNDETERMINED_LISTED) undetermined.push({ row: i, column: f.name, why });
      }
    });
    rows.push(row);
  }
  return { rows, undetermined, count };
}

/** A held table's rows as calc-grammar reads a table: `{fields, rows: [{<name>: cell}]}`. */
export function asGrammarTable(fields, rows) {
  return { fields: fields.map((f) => ({ name: f.name, type: f.type, ...(f.unit && { unit: f.unit }),
    ...(f.currency && { currency: f.currency }), ...(f.zone && { zone: f.zone }) })),
    rows: rows.map((r) => Object.fromEntries(fields.map((f, k) => [f.name, r[k]]))) };
}
