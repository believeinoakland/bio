/* following: a portal's dataset as rows, its query key, and the keyed field-level diff of two snapshots (R10, R11;
 * ladders §8.5). Pure: no store, no clock. A difference is what the two answers say, never a finding (R16). */

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
  if (typeof text !== "string") return { why: "the snapshot's bytes could not be read as text" };
  const t = text.replace(/^﻿/, "").trim();
  if (t.startsWith("[") || t.startsWith("{")) {
    let v;
    try { v = JSON.parse(t); } catch { return { why: "the answer is not well-formed JSON" }; }
    if (v && !Array.isArray(v)) {
      if (Array.isArray(v.features)) v = v.features.map((x) => (x && x.properties) || x);
      else v = [v.data, v.rows, v.results].find(Array.isArray) || null;
    }
    if (!Array.isArray(v) || !v.every((r) => r && typeof r === "object" && !Array.isArray(r)))
      return { why: "the JSON answer is not a list of rows" };
    return { rows: v };
  }
  if (t.startsWith("<")) return { why: "the answer is markup, not rows: neither JSON rows nor CSV" };
  const lines = csvRows(t);
  if (lines.length < 1 || lines[0].length < 1) return { why: "the answer is neither JSON rows nor CSV with a header" };
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
    undetermined.push({ key: k, why: `the key ${key} = ${k} is repeated in the ${a.repeated.has(k) && b.repeated.has(k) ? "both snapshots" : a.repeated.has(k) ? "earlier snapshot" : "later snapshot"}, so which row is which is not settled` });
  if (a.missing) undetermined.push({ key: null, side: "from", rows: a.missing, why: `${a.missing} row${a.missing === 1 ? "" : "s"} of the earlier snapshot carry no ${key}, so they are matched to nothing` });
  if (b.missing) undetermined.push({ key: null, side: "to", rows: b.missing, why: `${b.missing} row${b.missing === 1 ? "" : "s"} of the later snapshot carry no ${key}, so they are matched to nothing` });
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
