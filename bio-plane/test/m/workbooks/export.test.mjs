/* workbooks: a recipe calculation exported to XLSX (R14), opened by office-readers and recomputed by the real
   `sheet-worker` engine, as any spreadsheet program would recompute it. The calculations are created through the
   real `calculations`, which stores what `calc-grammar` evaluates. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V } from "./fixture.mjs";
import { METHOD } from "../../../src/calc-grammar/index.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { COMPUTED_LABEL, FORMULA_LABEL } from "../../../src/workbooks/index.mjs";
import { makeMember, realEngine, recomputeVia } from "../../../../sheet-worker/test/helpers.mjs";

const FIELDS = [["vendor", "string"], ["amount", "number"], ["paid", "boolean"], ["on", "date"], ["dept", "string"]];
const ROWS = [
  ["Acme", "1,200.50", "true", "2025-01-03", "Parks"],
  ["acme", "300", "false", "2025-02-11", "Parks"],
  ["Bolt*", "99.5", "true", "2025-03-30", "Roads"],
  ["Cole", "n/a", "true", "2025-04-02", "Roads"],
  ["Dyer", "45.25", "true", "", "Parks"],
  ["Eton", "-12", "false", "2025-06-01", "Library"],
];
const RECIPE = {
  method: METHOD, inputs: [{ name: "pay", kind: "table" }, { name: "budget", kind: "figure" }],
  steps: [
    { op: "select", as: "paid", from: "pay", where: [{ field: "paid", test: "eq", value: true }] },
    { op: "count", as: "n_paid", from: "paid" },
    { op: "count", as: "n_all", from: "pay" },
    { op: "select", as: "parks", from: "pay", where: [{ field: "dept", test: "eq", value: "Parks" }, { field: "amount", test: "ge", value: "100" }] },
    { op: "sum", as: "parks_total", from: "parks", field: "amount" },
    { op: "select", as: "small", from: "pay", where: [{ field: "amount", test: "between", value: ["0", "100"] }] },
    { op: "sum", as: "small_total", from: "small", field: "amount" },
    { op: "share", as: "paid_share", part: "paid", whole: "pay" },
    { op: "ratio", as: "per_item", numerator: "small_total", denominator: "n_paid", places: 4, mode: "half_up" },
    { op: "difference", as: "left", a: "budget", b: "parks_total" },
    { op: "select", as: "roads", from: "pay", where: [{ field: "dept", test: "in", value: ["Roads", "Library"] }] },
    { op: "count", as: "n_roads", from: "roads" },
    { op: "select", as: "not_parks", from: "pay", where: [{ field: "dept", test: "ne", value: "Parks" }] },
    { op: "count", as: "n_not_parks", from: "not_parks" },
    { op: "select", as: "acme", from: "pay", where: [{ field: "vendor", test: "eq", value: "Acme" }] },
    { op: "count", as: "n_acme", from: "acme" },
    { op: "select", as: "bolt", from: "pay", where: [{ field: "vendor", test: "eq", value: "Bolt*" }] },
    { op: "count", as: "n_bolt", from: "bolt" },
    { op: "select", as: "early", from: "pay", where: [{ field: "on", test: "lt", value: "2025-03-01" }] },
    { op: "count", as: "n_early", from: "early" },
    { op: "group", as: "by_dept", from: "pay", by: ["dept"], measure: { op: "count" } },
    { op: "compare", as: "over", a: "parks_total", b: "budget" },
    { op: "round", as: "rounded", of: "per_item", places: 1, mode: "half_even" },
    { op: "ratio", as: "third", numerator: "n_paid", denominator: "n_all", places: 2, mode: "down" },
  ],
  output: "left",
};

/* A calculation created through calculations over a declared table (`project` files its CSV): its id, its table's sha
   and its stored results, as calculations reads them back. */
async function holdCalc(w, { recipe = RECIPE, rows = ROWS, kind = "difference", project = null } = {}) {
  const t = await w.table(FIELDS, rows, { project });
  const calcId = await w.calc({ inputs: [{ name: "pay", table: t }, { name: "budget", value: "2000" }], recipe, kind });
  const read = await w.calculations.read({ calcId, viewer: V("bob") });
  assert.equal(read.found, true);
  return { calcId, t, results: read.calculation.results, calc: read.calculation };
}

const num = (f) => Number(`${f.sign === "-" ? "-" : ""}${f.value}`);

test("R14 exportRecipe answers a workbook any spreadsheet program opens: one sheet per input table with typed cells, a results sheet and a method sheet; count, sum, difference, ratio and share results are formulas over the input sheets cached at the stored result, any other step a value labelled; recomputing the file gives the stored results", async () => {
  const w = await seeded();
  const { calcId, t, results, calc } = await holdCalc(w);
  const r = await w.wb.exportRecipe({ calcId, viewer: V("bob") });
  assert.equal(r.found, true);
  assert.deepEqual(r.sheets, ["pay", "results", "method"]);
  assert.match(r.content_type, /spreadsheetml\.sheet/);
  /* it opens: office-readers reads it whole */
  const text = await xlsxEntry.text(r.bytes);
  assert.equal(text.ok, true);
  const sheet = (name) => text.sheets.find((s) => s.name === name).cells;
  const at = (name, ref) => sheet(name).find((c) => c.source.cell === ref);
  /* the input sheet: its canonical values as typed cells */
  assert.deepEqual(["A1", "B1", "C1", "D1", "E1"].map((c) => at("pay", c).value), ["vendor", "amount", "paid", "on", "dept"]);
  assert.deepEqual([at("pay", "B2").type, at("pay", "B2").value], ["number", "1200.50"], "1,200.50 read as its figure");
  assert.deepEqual([at("pay", "B5").type, at("pay", "B5").value], ["text", "n/a"], "an amount that is no figure stays text");
  assert.deepEqual([at("pay", "C2").type, at("pay", "C2").value], ["boolean", "1"]);
  assert.deepEqual([at("pay", "D2").type, at("pay", "D2").value], ["text", "2025-01-03"]);
  assert.equal(at("pay", "D6"), undefined, "an empty value is an empty cell");
  /* the method sheet */
  const method = Object.fromEntries(sheet("method").filter((c) => c.source.cell.startsWith("A")).map((c) => [c.value, at("method", `B${c.source.cell.slice(1)}`)?.value]));
  assert.equal(method.question, "What is left of the budget?");
  assert.deepEqual(JSON.parse(method.period), { from: "2024-07-01", to: "2025-06-30" });
  assert.equal(method["method version"], METHOD);
  assert.equal(method["result key"], calc.result_key);
  assert.deepEqual(JSON.parse(method.recipe), RECIPE);
  assert.equal(at("method", `C${sheet("method").find((c) => c.value === "pay" && c.source.cell.startsWith("A")).source.cell.slice(1)}`).value, t, "each input's sha256");
  /* the results sheet: which steps are formulas, which labelled values */
  const res = sheet("results");
  const rowOf = (step) => res.find((c) => c.source.cell.startsWith("A") && c.value === step).source.cell.slice(1);
  const cellOf = (step) => at("results", `C${rowOf(step)}`);
  const how = (step) => at("results", `D${rowOf(step)}`).value;
  const formulas = ["n_paid", "n_all", "parks_total", "small_total", "paid_share", "per_item", "left", "n_roads", "n_not_parks", "n_bolt", "third"];
  const labelled = ["paid", "parks", "small", "roads", "not_parks", "acme", "n_acme", "bolt", "early", "n_early", "by_dept", "over", "rounded"];
  for (const s of formulas) { assert.equal(how(s), FORMULA_LABEL, s); assert.ok(cellOf(s).formula, s); }
  for (const s of labelled) { assert.equal(how(s), COMPUTED_LABEL, s); assert.equal(cellOf(s).formula, null, s); }
  assert.equal(r.formulas, formulas.length);
  /* each formula's cached value is the stored result */
  for (const s of formulas) {
    const stored = results[s].numerator !== undefined ? results[s].value : results[s];
    assert.equal(Number(cellOf(s).cached), num(stored), s);
  }
  /* recomputing the file gives the stored results */
  const rec = (await recomputeVia(makeMember(realEngine()), r.bytes)).body;
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  for (const s of formulas) {
    const e = rec.cells.find((c) => c.source.ref === `results!C${rowOf(s)}`);
    const stored = results[s].numerator !== undefined ? results[s].value : results[s];
    assert.equal(e.type, "number", `${s}: ${JSON.stringify(e)}`);
    const want = num(stored);
    assert.ok(Math.abs(e.value - want) <= 1e-9 * Math.max(1, Math.abs(want)), `${s}: engine ${e.value}, stored ${want}`);
  }
  assert.equal(rec.cells.length, formulas.length, "no other formula in the file");
  /* the stored values the test expects, so a wrong export cannot agree with a wrong evaluation */
  assert.deepEqual(["n_paid", "n_all", "parks_total", "small_total", "n_roads", "n_not_parks", "left"].map((s) => num(results[s])),
                   [4, 6, 1500.5, 144.75, 3, 3, 499.5]);
});

test("R14 a calculation the viewer may not see, or one with an input table out of sight, answers found: false, as an absent one", async () => {
  const w = await seeded();
  const { calcId } = await holdCalc(w);
  assert.deepEqual(await w.wb.exportRecipe({ calcId: "CALC-2026-9999", viewer: V("bob") }), { ok: true, found: false });
  for (const viewer of [undefined, "", null]) assert.deepEqual(await w.wb.exportRecipe({ calcId, viewer }), { ok: true, found: false });
  assert.deepEqual(await w.wb.exportRecipe({ calcId, viewer: V("dave") }), { ok: true, found: false }, "dave may not see its project");
  assert.equal((await w.wb.exportRecipe({ calcId, viewer: V("carol") })).found, true, "carol may");
  /* an input table filed in bob's own project: carol may see the calculation's project, not its input */
  const own = w.project("Bob's own", "bob");
  const hidden = await holdCalc(w, { rows: ROWS.slice(1), project: own });
  assert.deepEqual(await w.wb.exportRecipe({ calcId: hidden.calcId, viewer: V("carol") }), { ok: true, found: false });
  assert.equal((await w.wb.exportRecipe({ calcId: hidden.calcId, viewer: V("bob") })).found, true);
});

test("R14 a ratio rounded half-even at a half-way tie, and a text match a case-blind spreadsheet test would widen, are written as labelled values, never as a formula that could disagree", async () => {
  const w = await seeded();
  const recipe = { method: METHOD, inputs: [{ name: "pay", kind: "table" }, { name: "budget", kind: "figure" }], steps: [
    { op: "count", as: "n", from: "pay" },
    { op: "select", as: "acme", from: "pay", where: [{ field: "vendor", test: "eq", value: "acme" }] },
    { op: "count", as: "k", from: "acme" },
    { op: "select", as: "parks", from: "pay", where: [{ field: "dept", test: "eq", value: "Parks" }] },
    { op: "count", as: "p", from: "parks" },
    { op: "ratio", as: "tie", numerator: "p", denominator: "n", places: 0, mode: "half_even" },
    { op: "ratio", as: "plain", numerator: "p", denominator: "n", places: 3, mode: "half_even" }],
    output: "plain" };
  const rows = [["Acme", "1", "true", "2025-01-01", "Parks"], ["acme", "2", "true", "2025-01-01", "Roads"]];
  const { calcId } = await holdCalc(w, { recipe, rows, kind: "ratio" });
  const r = await w.wb.exportRecipe({ calcId, viewer: V("bob") });
  const res = (await xlsxEntry.text(r.bytes)).sheets.find((s) => s.name === "results").cells;
  const how = (step) => { const row = res.find((c) => c.value === step && c.source.cell.startsWith("A")).source.cell.slice(1); return res.find((c) => c.source.cell === `D${row}`).value; };
  assert.equal(how("k"), COMPUTED_LABEL, "Acme and acme: a case-blind test would count two");
  assert.equal(how("p"), FORMULA_LABEL);
  assert.equal(how("tie"), COMPUTED_LABEL, "1/2 at 0 places half-even is a tie");
  assert.equal(how("plain"), FORMULA_LABEL);
  const rec = (await recomputeVia(makeMember(realEngine()), r.bytes)).body;
  assert.equal(rec.ok, true);
  for (const c of rec.cells) {
    const cached = res.find((x) => x.source.ref === c.source.ref).cached;
    assert.ok(Math.abs(c.value - Number(cached)) < 1e-9, `${c.source.ref} ${c.formula}`);
  }
});
