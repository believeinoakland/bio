/* workbooks' lint (requirements: `build/requirements/workbooks.md`, R9): the usual spreadsheet defects, read from the
 * cells the file holds. Lint changes nothing and blocks nothing; it computes no formula. The cross-foot test adds the
 * file's own cached totals with `calc-grammar`'s exact decimal addition. */

import { add } from "../calc-grammar/index.mjs";
import { cellAt, cellName, numbersIn, aggregatesIn, referencesIn, plainDecimal, figureOf, sameDecimal, isFigureText } from "./cells.mjs";
import { word } from "../setup-words/index.mjs";

export const LINT_KINDS = Object.freeze(["short_range", "constant_in_formula", "hidden_input", "number_as_text",
  "error_value", "cross_foot"]);

/** A workbook's held cells and facts, read for lint and the input read (R20: a workbook of up to 250,000 cells is held
 *  whole in the store, and only the cells a formula's text names are interpreted, so no cell is held here that a
 *  formula, a lint finding or an input does not touch). `grid` answers from the store, one cursor or one lookup at a time:
 *  `formulas()` the formula cells, `at(sheet, r, c)` a held cell or null, `extent(sheet)` `{rows, cols}`, `constantsIn(
 *  sheet, r1, c1, r2, c2)` the cells of a rectangle that hold a constant, `errors()` the cells of type error;
 *  `facts`: `{sheets: [{name, hidden}], hidden_rows: {sheet: [r]}, hidden_cols: {sheet: [{min, max}]}, names: {name: ref}}`.
 *  A cell is `{sheet, cell, r, c, type, value, formula, cached}`. */
export function indexWorkbook(grid, facts) {
  const extents = new Map();
  const extent = (sheet) => { if (!extents.has(sheet)) extents.set(sheet, grid.extent(sheet)); return extents.get(sheet); };
  const opts = { names: facts.names || {}, extent };
  const hiddenRows = new Map(Object.entries(facts.hidden_rows || {}).map(([k, v]) => [k, new Set(v)]));
  return { at: (sheet, r, c) => grid.at(sheet, r, c), extent, opts, formulas: () => grid.formulas(), constantsIn: (...a) => grid.constantsIn(...a),
           errors: () => grid.errors(), hiddenRows, facts };
}

/** R5: the input cells: every cell holding a constant (no formula, a value) that some formula's text names. Each
 *  `{sheet, cell, r, c, type, value}`, in sheet, row, column order. */
export function inputCells(ix) {
  const seen = new Set(), out = [];
  const rects = new Map();
  for (const f of ix.formulas())
    for (const r of referencesIn(f.formula, f.sheet, ix.opts).refs) rects.set(`${r.sheet}|${r.r1}|${r.c1}|${r.r2}|${r.c2}`, r);
  for (const r of rects.values()) {
    const e = ix.extent(r.sheet);
    if (!e.rows) continue;
    for (const c of ix.constantsIn(r.sheet, r.r1, r.c1, Math.min(r.r2, e.rows), Math.min(r.c2, e.cols))) {
      const k = `${c.sheet}!${c.cell}`;
      if (seen.has(k)) continue;
      seen.add(k); out.push({ sheet: c.sheet, cell: c.cell, r: c.r, c: c.c, type: c.type, value: c.value });
    }
  }
  const order = new Map((ix.facts.sheets || []).map((s, i) => [s.name, i]));
  return out.sort((a, b) => (order.get(a.sheet) ?? 1e9) - (order.get(b.sheet) ?? 1e9) || a.r - b.r || a.c - b.c);
}

const isNumberCell = (c) => !!c && c.type === "number" && plainDecimal(c.formula ? c.cached : c.value) !== null;
const numberOf = (c) => figureOf(plainDecimal(c.formula ? c.cached : c.value));

/* One cell's hidden place, or null: its sheet, row or column hidden. */
function hiddenPlace(ix, c) {
  const sheet = (ix.facts.sheets || []).find((s) => s.name === c.sheet);
  if (sheet && sheet.hidden) return word("workbooks.sheet_hidden", { sheet: String(c.sheet) });
  if (ix.hiddenRows.get(c.sheet)?.has(c.r)) return word("workbooks.row_hidden", { row: String(c.r) });
  if ((ix.facts.hidden_cols?.[c.sheet] || []).some((x) => c.c >= x.min && c.c <= x.max)) return word("workbooks.column_hidden", { count: String(cellName(1, c.c).replace(/1$/, "")) });
  return null;
}

/** R9: every finding `{kind, cell, detail}`, `cell` the `Sheet!A1` reference, in kind then sheet then cell order. */
export function lintFindings(ix, inputs = inputCells(ix)) {
  const out = [];
  const ref = (c) => `${c.sheet}!${c.cell}`;
  /* short_range: an aggregate over one column or row stops short of, or starts after, the contiguous run of numbers
     around it in that column or row */
  for (const f of ix.formulas()) {
    for (const { fn, ref: r } of aggregatesIn(f.formula, f.sheet, ix.opts)) {
      const vertical = r.c1 === r.c2 && r.r2 > r.r1, horizontal = r.r1 === r.r2 && r.c2 > r.c1;
      if (!vertical && !horizontal) continue;
      const num = (row, col) => !(r.sheet === f.sheet && row === f.r && col === f.c) && isNumberCell(ix.at(r.sheet, row, col));
      let lo = vertical ? r.r1 : r.c1, hi = vertical ? r.r2 : r.c2;
      const has = (k) => (vertical ? num(k, r.c1) : num(r.r1, k));
      let inside = false;
      for (let k = lo; k <= hi; k++) if (has(k)) { inside = true; break; }
      if (!inside) continue;
      let start = lo, end = hi;
      while (start > 1 && has(start - 1)) start--;
      while (has(end + 1)) end++;
      if (start < lo || end > hi) {
        const name = (k) => (vertical ? cellName(k, r.c1) : cellName(r.r1, k));
        out.push({ kind: "short_range", cell: ref(f), detail: `${fn} over ${name(lo)}:${name(hi)}, while the numbers run `
          + `${name(start)}:${name(end)}${start < lo ? `, starting before it` : ""}${end > hi ? `, past its end` : ""}` });
      }
    }
  }
  /* constant_in_formula */
  for (const f of ix.formulas()) {
    const ns = numbersIn(f.formula, f.sheet, ix.opts);
    if (ns.length) out.push({ kind: "constant_in_formula", cell: ref(f), detail: `the formula writes ${ns.join(", ")} in its text` });
  }
  /* hidden_input, number_as_text */
  for (const c of inputs) {
    const h = hiddenPlace(ix, c);
    if (h) out.push({ kind: "hidden_input", cell: ref(c), detail: `an input that ${h}` });
  }
  for (const c of inputs)
    if (c.type === "text" && isFigureText(c.value)) out.push({ kind: "number_as_text", cell: ref(c), detail: `stored as text: "${c.value}"` });
  /* error_value: a cached error value, constant or formula */
  for (const c of ix.errors()) {
    const v = c.formula ? c.cached : c.value;
    out.push({ kind: "error_value", cell: ref(c), detail: `the file holds ${v ?? "an error"}` });
  }
  /* cross_foot */
  out.push(...crossFoot(ix));
  const order = new Map((ix.facts.sheets || []).map((s, i) => [s.name, i]));
  const key = (x) => { const [sh, cl] = splitRef(x.cell); const p = cellAt(cl) || { row: 0, col: 0 }; return [order.get(sh) ?? 1e9, p.row, p.col]; };
  return out.sort((a, b) => {
    const k = LINT_KINDS.indexOf(a.kind) - LINT_KINDS.indexOf(b.kind);
    if (k) return k;
    const x = key(a), y = key(b);
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  });
}

function splitRef(s) { const i = s.lastIndexOf("!"); return [s.slice(0, i), s.slice(i + 1)]; }

/* A SUM over one row or one column: `{dir, sheet, line, from, to, cell}`. */
function sumLine(ix, f) {
  const m = /^\s*=?\s*SUM\s*\(([^()]*)\)\s*$/i.exec(f.formula || "");
  if (!m) return null;
  const { refs } = referencesIn(m[1], f.sheet, ix.opts);
  if (refs.length !== 1 || refs[0].sheet !== f.sheet) return null;
  const r = refs[0];
  if (r.r1 === r.r2 && r.r1 === f.r && r.c2 < f.c) return { dir: "row", line: f.r, from: r.c1, to: r.c2, f };
  if (r.c1 === r.c2 && r.c1 === f.c && r.r2 < f.r) return { dir: "col", line: f.c, from: r.r1, to: r.r2, f };
  return null;
}

/* cross_foot: a block whose row totals (SUMs along rows, in one column) and column totals (SUMs down columns, in one
   row) cover the same block, and whose two sets of cached totals do not add to the same grand total. */
function crossFoot(ix) {
  const out = [];
  const lines = [];
  for (const f of ix.formulas()) { const l = sumLine(ix, f); if (l) lines.push(l); }
  const groups = new Map();
  for (const l of lines) {
    const k = `${l.f.sheet}|${l.dir}|${l.dir === "row" ? l.f.c : l.f.r}|${l.from}|${l.to}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(l);
  }
  const rowsets = [...groups.values()].filter((g) => g[0].dir === "row" && g.length >= 2);
  const colsets = [...groups.values()].filter((g) => g[0].dir === "col" && g.length >= 2);
  for (const R of rowsets) for (const C of colsets) {
    const sheet = R[0].f.sheet;
    if (C[0].f.sheet !== sheet) continue;
    /* the row totals add across columns from..to; the column totals add down rows from..to: the same block */
    const rows = R.map((l) => l.line), cols = C.map((l) => l.line);
    const rFrom = C[0].from, rTo = C[0].to, cFrom = R[0].from, cTo = R[0].to;
    if (!rows.every((x) => x >= rFrom && x <= rTo) || !cols.every((x) => x >= cFrom && x <= cTo)) continue;
    if (rows.length !== rTo - rFrom + 1 || cols.length !== cTo - cFrom + 1) continue;
    const total = (ls) => {
      let acc = { value: "0", sign: "+", precision: "exact" };
      for (const l of ls) { if (!isNumberCell(l.f)) return null; acc = add(acc, numberOf(l.f)); if (!acc || acc.refused) return null; }
      return acc;
    };
    const a = total(R), b = total(C);
    if (!a || !b || sameDecimal(a, b)) continue;
    const corner = cellName(C[0].f.r, R[0].f.c);
    const show = (x) => `${x.sign === "-" ? "-" : ""}${x.value}`;
    out.push({ kind: "cross_foot", cell: `${sheet}!${corner}`, detail: `the row totals in column ${cellName(1, R[0].f.c).replace(/1$/, "")} add to `
      + `${show(a)}, the column totals in row ${C[0].f.r} to ${show(b)}, over ${cellName(rFrom, cFrom)}:${cellName(rTo, cTo)}` });
  }
  return out;
}
