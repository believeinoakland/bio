/* following: a portal's dataset as rows, its query key, and the keyed field-level diff of two snapshots (R10, R11;
 * ladders §8.5). Pure: no store, no clock. A difference is what the two answers say, never a finding (R16). */

import { word } from "../setup-words/index.mjs";

/** R10: a portal follow's key: the address with its query parameters (and any given apart) sorted and the host
 *  folded to lower case, so one query written two ways is one follow. Answers null for an address that is no URL. */
export function portalKey(address, query = null) {
  let u;
  try { u = new URL(String(address)); } catch { return null; }
  const params = [...u.searchParams.entries()];
  if (query && typeof query === "object")
    for (const [k, v] of Object.entries(query)) params.push([k, v == null ? "" : String(v)]);
  else if (typeof query === "string" && query) for (const [k, v] of new URLSearchParams(query)) params.push([k, v]);
  params.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0));
  const q = params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  return `${u.protocol}//${u.host.toLowerCase()}${u.pathname}${q ? `?${q}` : ""}`;
}

/* One CSV line's fields (RFC 4180 quoting). */
function csvRows(text) {
  const rows = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { f += '"'; i++; }
      else if (c === '"') q = false;
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(f); f = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  return rows;
}

/** R10: the dataset's answer as a list of row objects: a JSON array of objects, a JSON object holding one such array
 *  (`data`, `rows`, `results`, `features`' `properties`), or CSV with a header line. Anything else answers `{why}`. */
export function readDataset(text) {
  if (typeof text !== "string") return { why: word("following.why.snapshot_bytes_read_text") };
  const t = text.replace(/^﻿/, "").trim();
  if (t.startsWith("[") || t.startsWith("{")) {
    let v;
    try { v = JSON.parse(t); } catch { return { why: word("following.why.answer_well_formed") }; }
    if (v && !Array.isArray(v)) {
      if (Array.isArray(v.features)) v = v.features.map((x) => (x && x.properties) || x);
      else v = [v.data, v.rows, v.results].find(Array.isArray) || null;
    }
    if (!Array.isArray(v) || !v.every((r) => r && typeof r === "object" && !Array.isArray(r)))
      return { why: word("following.why.json_answer_list") };
    return { rows: v };
  }
  if (t.startsWith("<")) return { why: word("following.why.answer_markup_rows") };
  const lines = csvRows(t);
  if (lines.length < 1 || lines[0].length < 1) return { why: word("following.why.answer_neither_json") };
  const head = lines[0];
  return { rows: lines.slice(1).map((l) => Object.fromEntries(head.map((h, i) => [h, l[i] ?? null]))) };
}

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const keyOf = (row, key) => {
  const v = row ? row[key] : undefined;
  return v === undefined || v === null || v === "" ? null : String(v);
};

/* The rows of one snapshot by key, and the keys that are missing or repeated there. */
function index(rows, key) {
  const by = new Map(), repeated = new Set();
  let missing = 0;
  for (const r of rows) {
    const k = keyOf(r, key);
    if (k === null) { missing++; continue; }
    if (by.has(k)) repeated.add(k);
    else by.set(k, r);
  }
  return { by, repeated, missing };
}

/** R11: between two snapshots' rows, keyed by `key`: `added` and `removed` rows by key; for a key in both, each
 *  `changed` field `{key, field, before, after}`; a key repeated in either, or a row with no key, is `undetermined`
 *  with its reason, never matched by position. */
export function diffRows(before, after, key) {
  const a = index(before, key), b = index(after, key);
  const added = [], removed = [], changed = [], undetermined = [];
  const doubtful = new Set([...a.repeated, ...b.repeated]);
  for (const k of doubtful)
    undetermined.push({ key: k, why: word("following.why.key_repeated_row", { key, k, snapshot: a.repeated.has(k) && b.repeated.has(k) ? "both snapshots" : a.repeated.has(k) ? "earlier snapshot" : "later snapshot" }) });
  if (a.missing) undetermined.push({ key: null, side: "from", rows: a.missing, why: word("following.why.row_earlier_snapshot", { missing: a.missing, s: a.missing === 1 ? "" : "s", key }) });
  if (b.missing) undetermined.push({ key: null, side: "to", rows: b.missing, why: word("following.why.row_later_snapshot", { missing: b.missing, s: b.missing === 1 ? "" : "s", key }) });
  for (const [k, row] of b.by) {
    if (doubtful.has(k)) continue;
    if (!a.by.has(k)) { added.push({ key: k, row }); continue; }
    const old = a.by.get(k);
    for (const f of [...new Set([...Object.keys(old), ...Object.keys(row)])].sort())
      if (!same(old[f], row[f])) changed.push({ key: k, field: f, before: old[f] ?? null, after: row[f] ?? null });
  }
  for (const [k, row] of a.by) if (!doubtful.has(k) && !b.by.has(k)) removed.push({ key: k, row });
  return { added, removed, changed, undetermined };
}

/** R10 (G46): a portal snapshot's rows JSON up to this many bytes is stored whole in `portal_snapshots.rows`; above it the
 *  text lies in `portal_snapshot_parts` and `rows` holds `{parts, bytes, rows}`. A stored value stays under 1 MiB (K4639). */
export const PORTAL_ROWS_INLINE_MAX = 524288;
/** R10 (G46): characters in one piece (256 Ki; at most 3 bytes each, so a piece is under 1 MiB), never splitting a surrogate pair. */
export const PORTAL_PART_CHARS = 262144;

/** R10 (G46): how a snapshot's rows are stored: `{value, pieces}`. At or below `PORTAL_ROWS_INLINE_MAX` bytes of JSON, `value`
 *  is that JSON byte for byte and `pieces` is empty; above it, `value` is the marker `{"parts","bytes","rows"}` and `pieces`
 *  are the JSON in order, each at most `PORTAL_PART_CHARS` characters and none ending in half a surrogate pair. */
export function storedRows(rows) {
  const text = JSON.stringify(rows);
  const size = new TextEncoder().encode(text).length;
  if (size <= PORTAL_ROWS_INLINE_MAX) return { value: text, pieces: [] };
  const pieces = [];
  for (let i = 0; i < text.length;) {
    let end = Math.min(i + PORTAL_PART_CHARS, text.length);
    const last = text.charCodeAt(end - 1);
    if (end < text.length && last >= 0xD800 && last <= 0xDBFF) end--;
    pieces.push(text.slice(i, end));
    i = end;
  }
  return { value: JSON.stringify({ parts: pieces.length, bytes: size, rows: rows.length }), pieces };
}
