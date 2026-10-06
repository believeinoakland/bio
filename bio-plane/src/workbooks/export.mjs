/* workbooks' export of a recipe calculation to XLSX (requirements: `build/requirements/workbooks.md`, R14). One sheet
 * per input table (its canonical values as typed cells), a results sheet and a method sheet. The result of a `count`,
 * `sum`, `difference`, `ratio` or `share` step is written as a formula over the input sheets whose cached value is the
 * stored result; every other result, and every one of those whose formula a spreadsheet would not compute exactly as
 * `bio-calc/1` did (a condition on a date, a text match a case-blind spreadsheet test would widen, a half-way tie), is
 * written as a value labelled "computed by bio-calc/1". Nothing is computed here: the results are the stored ones, and
 * the per-step values `calc-grammar` gives back for the same recipe and inputs. */

import { parseFigure, evaluate, divide, METHOD } from "../calc-grammar/index.mjs";
import { canonicalJson, sha256HexSync } from "../record-grammar/index.mjs";
import { writeXlsx, sheetRef, colName } from "./xlsxwrite.mjs";
import { plainDecimal } from "./cells.mjs";

export const COMPUTED_LABEL = "computed by bio-calc/1";
export const FORMULA_LABEL = "formula over the input sheets";
const FORMULA_OPS = new Set(["count", "sum", "difference", "ratio", "share"]);
const RATIO_DEFAULT = { places: 12, mode: "half_even" };
const MAX_COMBINATIONS = 16;

const S = (v) => ({ t: "s", v: String(v) });
const isFigure = (v) => v && typeof v === "object" && typeof v.value === "string" && typeof v.sign === "string";
const numText = (f) => `${f.sign === "-" && !/^0*(\.0*)?$/.test(f.value) ? "-" : ""}${f.value}`;
/* a figure written as one number: exact or rounded, never a range or an approximation */
const oneNumber = (f) => isFigure(f) && (f.precision === "exact" || f.precision === "rounded");

/* A result as the number it is, `{t: "n", v}`, or as text. */
function valueCell(v) {
  if (v && v.numerator !== undefined && v.value !== undefined) return valueCell(v.value);
  if (oneNumber(v)) return { t: "n", v: numText(v) };
  if (v && v.undetermined) return S(`undetermined: ${v.why || ""}`.trim());
  if (v && v.relation) return S(`${v.relation} (${v.label || "computed fact"})`);
  if (isFigure(v)) return S(v.precision === "range" ? `${v.low}–${v.high}` : `${v.precision} ${v.value}`);
  if (v && Array.isArray(v.rows)) return S(`a table of ${v.rows.length} row${v.rows.length === 1 ? "" : "s"}`);
  if (v && typeof v.rows === "number") return S(`a table of ${v.rows} row${v.rows === 1 ? "" : "s"}`);
  return S(v === undefined || v === null ? "" : typeof v === "string" ? v : canonicalJson(v));
}

/* A sheet name a spreadsheet accepts, unique among `taken`. */
function sheetName(want, taken) {
  let base = String(want).replace(/[\[\]:*?/\\]/g, "_").replace(/^'+|'+$/g, "").slice(0, 31) || "table";
  let name = base, n = 1;
  while (taken.has(name.toLowerCase())) name = `${base.slice(0, 28)}_${++n}`;
  taken.add(name.toLowerCase());
  return name;
}

/* A table's column as written: each cell typed by its field, and whether the column is one a spreadsheet test reads
   exactly as calc-grammar does (no figure written as text that calc-grammar would read as a number). */
function writeColumn(field, rows) {
  const cells = [];
  let clean = true;
  for (const row of rows) {
    const raw = row[field.name];
    if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) { cells.push(null); continue; }
    if (field.type === "number" || field.type === "integer") {
      const f = typeof raw === "object" ? raw : parseFigure(String(raw));
      if (f && !f.refused && oneNumber(f) && (field.type === "number" || !/\.\d*[1-9]/.test(f.value))) cells.push({ t: "n", v: numText(f) });
      else { if (f && !f.refused) clean = false; cells.push(S(raw)); }
    } else if (field.type === "boolean") {
      cells.push(raw === true || raw === "true" ? { t: "b", v: true } : raw === false || raw === "false" ? { t: "b", v: false } : S(raw));
    } else cells.push(S(typeof raw === "object" ? (raw.value ?? canonicalJson(raw)) : raw));
  }
  return { cells, clean };
}

const escapeCriterion = (s) => s.replace(/[~*?]/g, (m) => `~${m}`);
const quoteFormula = (s) => `"${s.replace(/"/g, '""')}"`;

/* One condition as COUNTIFS/SUMIFS criteria alternatives ([[range, criterion]] each), or null when a spreadsheet test
   would not read it as calc-grammar does. */
function criteria(cond, table, range) {
  const field = table.fields.find((f) => f.name === cond.field);
  const col = table.columns.get(cond.field);
  if (!field || !col) return null;
  const lits = cond.test === "in" || cond.test === "between" ? cond.value : [cond.value];
  if (field.type === "number" || field.type === "integer") {
    if (!col.clean) return null;
    const nums = [];
    for (const l of lits) {
      const f = parseFigure(String(l));
      if (!f || f.refused || !oneNumber(f)) return null;
      nums.push(numText(f));
    }
    const guard = [range, quoteFormula(">=-9.99E+307")];
    switch (cond.test) {
      case "eq": return [[[range, quoteFormula(`=${nums[0]}`)]]];
      case "ne": return [[[range, quoteFormula(`<>${nums[0]}`)], guard]];
      case "lt": return [[[range, quoteFormula(`<${nums[0]}`)]]];
      case "le": return [[[range, quoteFormula(`<=${nums[0]}`)]]];
      case "gt": return [[[range, quoteFormula(`>${nums[0]}`)]]];
      case "ge": return [[[range, quoteFormula(`>=${nums[0]}`)]]];
      case "between": return [[[range, quoteFormula(`>=${nums[0]}`)], [range, quoteFormula(`<=${nums[1]}`)]]];
      default: return [...new Set(nums.map(plainDecimal))].map((n) => [[range, quoteFormula(`=${n}`)]]);
    }
  }
  if (field.type === "boolean") {
    const bools = [];
    for (const l of lits) { if (l === true || l === "true") bools.push(true); else if (l === false || l === "false") bools.push(false); else return null; }
    if (cond.test === "eq") return [[[range, bools[0] ? "TRUE" : "FALSE"]]];
    if (cond.test === "in") return [...new Set(bools)].map((b) => [[range, b ? "TRUE" : "FALSE"]]);
    return null;
  }
  if (field.type !== "string") return null;
  /* a spreadsheet's text test is blind to case and reads a figure as a number: written only where neither can change
     which rows match */
  const values = col.cells.filter(Boolean).map((c) => c.v);
  for (const l of lits) {
    if (typeof l !== "string" || l === "" || /^[=<>]/.test(l) || /^\s*[-+]?[$€£]?\s*[0-9.]/.test(l) || /^(true|false)$/i.test(l)) return null;
    if (values.some((v) => v !== l && v.toLowerCase() === l.toLowerCase())) return null;
  }
  if (cond.test === "eq") return [[[range, quoteFormula(`=${escapeCriterion(lits[0])}`)]]];
  if (cond.test === "ne") return [[[range, quoteFormula(`<>${escapeCriterion(lits[0])}`)], [range, quoteFormula("<>")]]];
  if (cond.test === "in") return [...new Set(lits)].map((l) => [[range, quoteFormula(`=${escapeCriterion(l)}`)]]);
  return null;
}

/* A table step as `{sheet, table, conds}` (its rows those of an input table passing every condition), or null. */
function setOf(name, sets, steps, traceOf) {
  if (sets.has(name)) return sets.get(name);
  const st = steps.get(name);
  let out = null;
  if (st && st.op === "select") {
    const from = setOf(st.from, sets, steps, traceOf);
    if (from) out = { ...from, conds: [...from.conds, ...st.where] };
  } else if (st && st.op === "sort") {
    const from = setOf(st.from, sets, steps, traceOf);
    const t = traceOf(name);
    if (from && t && Array.isArray(t.undetermined) && t.undetermined.length === 0) out = from;
  }
  sets.set(name, out);
  return out;
}

/* COUNTIFS (or ROWS) and SUMIFS (or SUM) over a set, or null. */
function setFormula(set, sumField) {
  const t = set.table;
  if (!t.rows.length) return null;
  const rangeOf = (fieldName) => {
    const i = t.fields.findIndex((f) => f.name === fieldName);
    return i < 0 ? null : `${sheetRef(t.sheet)}!$${colName(i + 1)}$2:$${colName(i + 1)}$${t.rows.length + 1}`;
  };
  let alts = [[]];
  for (const c of set.conds) {
    const r = rangeOf(c.field);
    const cr = r && criteria(c, t, r);
    if (!cr) return null;
    const next = [];
    for (const a of alts) for (const b of cr) next.push([...a, ...b]);
    if (next.length > MAX_COMBINATIONS) return null;
    alts = next;
  }
  let target = null;
  if (sumField) {
    const f = t.fields.find((x) => x.name === sumField);
    if (!f || !(f.type === "number" || f.type === "integer") || !t.columns.get(sumField).clean) return null;
    target = rangeOf(sumField);
  }
  const term = (crit) => {
    const args = crit.flat().join(",");
    if (!crit.length) return sumField ? `SUM(${target})` : `ROWS(${rangeOf(t.fields[0].name)})`;
    return sumField ? `SUMIFS(${target},${args})` : `COUNTIFS(${args})`;
  };
  return alts.map(term).join("+");
}

/* The rounding formula for a ratio, or null at a half-way tie (where spreadsheets and bio-calc/1 may part). */
function rounded(expr, num, den, places, mode) {
  const at = (p, m) => divide(num, den, { places: p, mode: m });
  const exact = (() => { const a = at(places, "down"), b = at(places, "up"); return a && b && a.value === b.value && a.sign === b.sign; })();
  const lo = at(places + 1, "down"), hi = at(places + 1, "up");
  if (!lo || !hi || lo.refused || hi.refused || lo.undetermined) return null;
  const tie = lo.value === hi.value && /5$/.test(lo.value);
  if (tie) return null;
  if (exact || mode === "half_even" || mode === "half_up") return `ROUND(${expr},${places})`;
  return `${mode === "down" ? "ROUNDDOWN" : "ROUNDUP"}(${expr},${places})`;
}

/**
 * The workbook for a calculation: `calc` as `calculations.read` answers it (`{question, period, recipe, method_version,
 * result_key, inputs: [{name, kind, sha?, figure?, content_id?}], results}`), `tables` the input tables by name
 * (`{sha, fields, rows}`, from `calculations.readTable`). Answers `{bytes, sheets, formulas, labelled}`.
 */
export function buildExport(calc, tables) {
  const recipe = calc.recipe;
  const taken = new Set(["results", "method"]);
  const bound = {};
  const tableOf = new Map();
  for (const inp of calc.inputs || []) {
    if (inp.kind === "table") {
      const t = tables[inp.name];
      const columns = new Map(t.fields.map((f) => [f.name, writeColumn(f, t.rows)]));
      tableOf.set(inp.name, { ...t, sheet: sheetName(inp.name, taken), columns });
      bound[inp.name] = { fields: t.fields, rows: t.rows };
    } else bound[inp.name] = inp.figure;
  }
  /* the per-step values for the same recipe and inputs: calc-grammar's own, read beside the stored results */
  const run = evaluate(recipe, bound);
  const trace = new Map((run && run.trace ? run.trace : []).map((t) => [t.step, t]));
  const stored = calc.results && typeof calc.results === "object" ? calc.results : {};
  const resultOf = (name) => (Object.prototype.hasOwnProperty.call(stored, name) ? stored[name]
    : name === recipe.output && calc.result !== undefined ? calc.result : trace.get(name)?.output);

  const sheets = [];
  for (const t of tableOf.values()) {
    const rows = [t.fields.map((f) => S(f.name))];
    t.rows.forEach((_, i) => rows.push(t.fields.map((f) => t.columns.get(f.name).cells[i])));
    sheets.push({ name: t.sheet, rows });
  }

  /* results: the figure inputs first, then one row per step */
  const res = [[S("step"), S("op"), S("result"), S("how"), S("numerator"), S("denominator")]];
  const rowOf = new Map();
  const figures = new Map((calc.inputs || []).filter((i) => i.kind !== "table").map((i) => [i.name, i.figure]));
  for (const inp of calc.inputs || []) {
    if (inp.kind === "table") continue;
    res.push([S(inp.name), S("input"), valueCell(inp.figure), S("a cited figure")]);
    rowOf.set(inp.name, res.length);
  }
  const steps = new Map(recipe.steps.map((s) => [s.as, s]));
  const sets = new Map([...tableOf.entries()].map(([n, t]) => [n, { table: t, conds: [] }]));
  let formulas = 0, labelled = 0;
  const numberAt = (name) => {
    const r = rowOf.get(name);
    if (!r) return null;
    const v = figures.has(name) ? figures.get(name) : resultOf(name);
    const f = v && v.numerator !== undefined ? v.value : v;
    return oneNumber(f) ? { ref: `$C$${r}`, figure: f } : null;
  };
  for (const st of recipe.steps) {
    const v = resultOf(st.as);
    const plainV = v && v.numerator !== undefined ? v.value : v;
    let f = null;
    if (FORMULA_OPS.has(st.op) && oneNumber(plainV)) {
      if (st.op === "count") { const s = setOf(st.from, sets, steps, (n) => trace.get(n)); f = s && setFormula(s, null); }
      else if (st.op === "sum") { const s = setOf(st.from, sets, steps, (n) => trace.get(n)); f = s && setFormula(s, st.field); }
      else if (st.op === "difference") {
        const a = numberAt(st.a), b = numberAt(st.b);
        f = a && b ? `${a.ref}-${b.ref}` : null;
      } else {
        const places = st.places ?? RATIO_DEFAULT.places, mode = st.mode ?? RATIO_DEFAULT.mode;
        if (st.op === "ratio") {
          const a = numberAt(st.numerator), b = numberAt(st.denominator);
          f = a && b ? rounded(`${a.ref}/${b.ref}`, a.figure, b.figure, places, mode) : null;
        } else {
          const part = setOf(st.part, sets, steps, (n) => trace.get(n)), whole = setOf(st.whole, sets, steps, (n) => trace.get(n));
          const num = part && setFormula(part, st.field ?? null), den = whole && setFormula(whole, st.field ?? null);
          f = num && den && v && isFigure(v.numerator) && isFigure(v.denominator)
            ? rounded(`(${num})/(${den})`, v.numerator, v.denominator, places, mode) : null;
        }
      }
    }
    const row = [S(st.as), S(st.op)];
    if (f) { row.push({ f, cached: { t: "n", v: numText(plainV) } }, S(FORMULA_LABEL)); formulas++; }
    else { row.push(valueCell(v), S(COMPUTED_LABEL)); labelled++; }
    if (v && v.numerator !== undefined) row.push(valueCell(v.numerator), valueCell(v.denominator));
    res.push(row);
    rowOf.set(st.as, res.length);
  }
  sheets.push({ name: "results", rows: res });

  const method = [[S("question"), S(calc.question ?? "")], [S("period"), S(typeof calc.period === "string" ? calc.period : canonicalJson(calc.period ?? null))],
    [S("recipe"), S(canonicalJson(recipe))], [S("method version"), S(calc.method_version || METHOD)],
    [S("result key"), S(calc.result_key ?? "")], [S("input"), S("kind"), S("sha256")]];
  for (const inp of calc.inputs || [])
    method.push([S(inp.name), S(inp.kind), S(inp.kind === "table" ? inp.sha : inp.sha || sha256HexSync(canonicalJson(inp.figure ?? null)))]);
  method.push([S("results"), S(`each result of a count, sum, difference, ratio or share step is a formula over the input sheets `
    + `whose cached value is the stored result; any other is a value ${COMPUTED_LABEL}`)]);
  sheets.push({ name: "method", rows: method });
  return { bytes: writeXlsx(sheets), sheets: sheets.map((s) => s.name), formulas, labelled };
}
