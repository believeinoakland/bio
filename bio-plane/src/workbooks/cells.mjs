/* workbooks' pure readings of a workbook's cells (requirements: `build/requirements/workbooks.md`, R3–R5, R9, R17).
 * A1 addresses, the references a formula's text names, the numbers written inside it, and the exact comparison of a
 * cell with a source value. Nothing here evaluates a formula: references are read from the formula's text as the file
 * holds it, never computed, and every number is compared by `calc-grammar` as an exact decimal. */

import { parseFigure, subtract } from "../calc-grammar/index.mjs";
import { a1Corner } from "../formats-xlsx.mjs";

export const GRID = Object.freeze({ rows: 1048576, cols: 16384 });

/** "AB" → 28. */
export function colNumber(letters) {
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}
/** 28 → "AB". */
export function colLetters(n) {
  let s = "";
  for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
  return s;
}
/** "B12" → {row: 12, col: 2}, or null. */
export function cellAt(cell) {
  const c = a1Corner(cell);
  return c ? { row: c.row, col: c.col } : null;
}
export const cellName = (row, col) => `${colLetters(col)}${row}`;

/** A sheet-qualified A1 reference written as `Sheet!A1:B2` (the sheet quoted with `'` when it must be) →
 *  `{sheet, a: "A1", b: "B2"}`, or null. A single cell gives `a` and `b` equal. */
export function splitRange(text) {
  if (typeof text !== "string") return null;
  const s = text.trim();
  const bang = s.lastIndexOf("!");
  if (bang <= 0) return null;
  let sheet = s.slice(0, bang);
  if (/^'.*'$/.test(sheet)) sheet = sheet.slice(1, -1).replace(/''/g, "'");
  const parts = s.slice(bang + 1).split(":");
  if (!sheet || parts.length > 2) return null;
  return { sheet, a: parts[0], b: parts[1] ?? parts[0] };
}

/* ---- the text of a formula ---- */

/* The formula with every string literal blanked to spaces of the same length, so a position still names the same
   character and nothing inside a string is read as a reference or a number. */
function blankStrings(f) {
  return f.replace(/"(?:[^"]|"")*"/g, (m) => " ".repeat(m.length));
}

const SHEET = String.raw`(?:'((?:[^']|'')+)'|([A-Za-z_ -￿][A-Za-z0-9_. -￿]*))!`;
const CELL = String.raw`\$?([A-Za-z]{1,3})\$?([0-9]+)`;
const REF_RE = new RegExp(
  String.raw`(?<![A-Za-z0-9_.$'! -￿])(?:${SHEET})?(?:${CELL}(?::${CELL})?|\$?([A-Za-z]{1,3}):\$?([A-Za-z]{1,3})|\$?([0-9]+):\$?([0-9]+))(?![A-Za-z0-9_(! -￿])`,
  "g");

/** The rectangles a formula's text names, each `{sheet, r1, c1, r2, c2}` (1-based, inclusive), read from the text alone:
 *  cell and range references, sheet-qualified or on `ownSheet`, whole columns and rows (bounded by `extent(sheet)`,
 *  `{rows, cols}` the sheet's used extent), and defined names found in `names` (`{name → "Sheet!$A$1:$B$2"}`). A
 *  reference to another workbook (`[1]Sheet!A1`) is not this workbook's and is not answered. Also answers `spans`, the
 *  character positions of every reference read, for `numbersIn`. */
export function referencesIn(formula, ownSheet, { names = {}, extent = () => GRID } = {}) {
  const text = blankStrings(String(formula ?? ""));
  const out = [], spans = [];
  for (const m of text.matchAll(REF_RE)) {
    const start = m.index;
    if (start > 0 && text[start - 1] === "]") continue;
    const sheet = m[1] !== undefined ? m[1].replace(/''/g, "'") : m[2] !== undefined ? m[2] : ownSheet;
    let r1, c1, r2, c2;
    if (m[3] !== undefined) {
      r1 = Number(m[4]); c1 = colNumber(m[3]);
      r2 = m[5] !== undefined ? Number(m[6]) : r1; c2 = m[5] !== undefined ? colNumber(m[5]) : c1;
      if (c1 > GRID.cols || c2 > GRID.cols || r1 < 1 || r2 < 1) continue;
    } else if (m[7] !== undefined) {
      const e = extent(sheet) || GRID;
      c1 = colNumber(m[7]); c2 = colNumber(m[8]); r1 = 1; r2 = Math.max(1, e.rows || 1);
    } else {
      const e = extent(sheet) || GRID;
      r1 = Number(m[9]); r2 = Number(m[10]); c1 = 1; c2 = Math.max(1, e.cols || 1);
    }
    out.push(norm({ sheet, r1, c1, r2, c2 }));
    spans.push([start, start + m[0].length]);
  }
  /* defined names: an identifier not followed by `(` that the workbook defines */
  if (names && Object.keys(names).length) {
    for (const m of text.matchAll(/(?<![A-Za-z0-9_.$'! -￿])([A-Za-z_\\][A-Za-z0-9_.\\]*)(?![A-Za-z0-9_.(! -￿])/g)) {
      const def = names[m[1]] ?? names[m[1].toUpperCase()];
      if (!def) continue;
      const r = splitRange(def);
      const a = r && cellAt(r.a.replace(/\$/g, "")), b = r && cellAt(r.b.replace(/\$/g, ""));
      if (!a || !b) continue;
      out.push(norm({ sheet: r.sheet, r1: a.row, c1: a.col, r2: b.row, c2: b.col }));
      spans.push([m.index, m.index + m[0].length]);
    }
  }
  return { refs: out, spans };
}

function norm({ sheet, r1, c1, r2, c2 }) {
  return { sheet, r1: Math.min(r1, r2), c1: Math.min(c1, c2), r2: Math.max(r1, r2), c2: Math.max(c1, c2) };
}

/** R9 `constant_in_formula`: the numbers written inside a formula's text, outside its strings, its references, and the
 *  names of functions and defined names (`LOG10`, `ATAN2` are names, not numbers). Each as written. */
export function numbersIn(formula, ownSheet, opts) {
  const raw = String(formula ?? "");
  let text = blankStrings(raw);
  const { spans } = referencesIn(raw, ownSheet, opts);
  for (const [a, b] of spans) text = text.slice(0, a) + " ".repeat(b - a) + text.slice(b);
  text = text.replace(/[A-Za-z_\\ -￿][A-Za-z0-9_.\\ -￿]*/g, (m) => " ".repeat(m.length));
  text = text.replace(/#[A-Z0-9/]+[!?]?/g, (m) => " ".repeat(m.length));
  return [...text.matchAll(/(?<![0-9.])(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?(?![0-9.])/g)].map((m) => m[0]);
}

/** The aggregate calls of a formula whose argument is one rectangle, `{fn, ref}` (R9 `short_range`). */
export function aggregatesIn(formula, ownSheet, opts) {
  const text = blankStrings(String(formula ?? ""));
  const out = [];
  for (const m of text.matchAll(/\b(SUM|AVERAGE|COUNT|COUNTA|MIN|MAX|PRODUCT)\s*\(([^()]*)\)/gi)) {
    const arg = m[2].trim();
    if (!arg || arg.includes(",")) continue;
    const { refs } = referencesIn(arg, ownSheet, opts);
    if (refs.length === 1) out.push({ fn: m[1].toUpperCase(), ref: refs[0] });
  }
  return out;
}

/* ---- values ---- */

/** A spreadsheet number as the file writes it (`1.5E-3`, `-0`, `12`) → a plain decimal string, or null. */
export function plainDecimal(s) {
  const m = /^\s*([+-]?)([0-9]*)(?:\.([0-9]*))?(?:[eE]([+-]?[0-9]+))?\s*$/.exec(String(s ?? ""));
  if (!m || (m[2] === "" && (m[3] ?? "") === "")) return null;
  let digits = (m[2] || "") + (m[3] || "");
  let point = (m[2] || "").length + Number(m[4] || 0);
  if (point < 0) { digits = "0".repeat(-point) + digits; point = 0; }
  if (point > digits.length) digits += "0".repeat(point - digits.length);
  let int = digits.slice(0, point).replace(/^0+/, "") || "0";
  const frac = digits.slice(point).replace(/0+$/, "");
  const neg = m[1] === "-" && !(/^0*$/.test(int) && frac === "");
  return `${neg ? "-" : ""}${int}${frac ? `.${frac}` : ""}`;
}

/** A plain decimal string → a calc-grammar figure, exact. */
export function figureOf(dec) {
  const neg = dec.startsWith("-");
  return { value: neg ? dec.slice(1) : dec, sign: neg ? "-" : "+", precision: "exact" };
}

/** R4: two figures equal as exact decimals (calc-grammar's subtraction is exact); a figure that is a range or
 *  approximate is never equal to one number. */
export function sameDecimal(a, b) {
  if (!a || !b || a.precision === "range" || b.precision === "range") return false;
  if (a.precision === "approximate" || b.precision === "approximate") return false;
  const d = subtract({ ...a, unit: undefined, currency: undefined }, { ...b, unit: undefined, currency: undefined });
  return !!d && typeof d.value === "string" && /^0*(\.0*)?$/.test(d.value);
}

/** A source value (a table cell under its field, or a cited figure's text) as `{kind, value, figure?}`. */
export function sourceValue(raw, type) {
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) return { kind: "empty", value: null };
  if (type === "number" || type === "integer") {
    const f = typeof raw === "object" ? raw : parseFigure(String(raw));
    if (f && !f.refused && typeof f.value === "string") return { kind: "number", value: String(raw), figure: f };
    return { kind: "text", value: String(raw) };
  }
  if (type === "boolean") {
    const s = String(raw).trim();
    if (s === "true" || s === "TRUE" || s === "True") return { kind: "boolean", value: true };
    if (s === "false" || s === "FALSE" || s === "False") return { kind: "boolean", value: false };
    return { kind: "text", value: String(raw) };
  }
  return { kind: "text", value: String(raw) };
}

/** A held cell's value as `{kind, value, figure?}` (R30's types: number, text, boolean, date, error). */
export function cellValue(cell) {
  if (!cell || cell.value === null || cell.value === undefined) return { kind: "empty", value: null };
  if (cell.type === "number") {
    const d = plainDecimal(cell.value);
    return d === null ? { kind: "text", value: cell.value } : { kind: "number", value: cell.value, figure: figureOf(d) };
  }
  if (cell.type === "boolean") return { kind: "boolean", value: cell.value === "1" || cell.value === "true" || cell.value === "TRUE" };
  if (cell.type === "error") return { kind: "error", value: cell.value };
  return { kind: "text", value: cell.value };
}

/** R4: a workbook cell against its source cell: numbers by exact decimal value, text and booleans exactly. */
export function sameValue(w, s) {
  if (w.kind === "empty" || s.kind === "empty") return w.kind === s.kind;
  if (w.kind === "number" && s.kind === "number") return sameDecimal(w.figure, s.figure);
  if (w.kind !== s.kind) return false;
  return w.value === s.value;
}

/** R6: an engine's number against a cached number, within a relative 1e-9 (both read as the decimals written). */
export function closeNumbers(a, b) {
  const x = Number(a), y = Number(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x === y) return true;
  return Math.abs(x - y) <= 1e-9 * Math.max(Math.abs(x), Math.abs(y));
}

/** R9 `number_as_text`: whether a text is a figure as printed (calc-grammar reads it). */
export function isFigureText(s) {
  if (typeof s !== "string" || !/[0-9]/.test(s)) return false;
  const f = parseFigure(s.trim());
  return !!f && !f.refused && typeof (f.value ?? f.low) === "string";
}
