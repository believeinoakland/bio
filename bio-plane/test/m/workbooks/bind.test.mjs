/* workbooks: binding input cells to sources (R3), comparing them cell for cell (R4), the inputs (R5) and grade facts
   (R12). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, xlsx, V } from "./fixture.mjs";
import { ENGINE_STEP } from "../../../src/workbooks/index.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");

/* Model!B2:B4 are inputs; B5 and B6 formulas; C2:C4 text, booleans; D1 a tag; a second sheet */
const book = () => xlsx([
  { name: "Model", cells: {
    A1: { s: "item" }, B1: { s: "amount" },
    A2: { s: "rent" }, B2: { n: "1200.50" }, C2: { s: "yes" }, E2: { b: true },
    A3: { s: "power" }, B3: { n: "300" }, C3: { s: "no" }, E3: { b: false },
    A4: { s: "water" }, B4: { n: "9.95E1" }, C4: { s: "Yes" },
    B5: { f: "SUM(B2:B4)", v: "1600" }, B6: { f: "B5*1.1", v: "1760" },
    F1: { f: "COUNTA(C2:C4)+COUNTA(E2:E3)", v: "5" }, D1: { s: `tag ${Math.random()}` } } },
  { name: "Notes Sheet", cells: { A1: { n: "7" }, B1: { f: "A1*2", v: "14" } } },
]);

test("R3 bind refuses NO_SUCH_WORKBOOK, BAD_RANGE, RANGE_HOLDS_FORMULAS, NO_SUCH_INPUT and SHAPE_MISMATCH, writing nothing; otherwise it holds the binding with who and when; unbind refuses NO_REASON, and an unbound binding stays with who, when and why", async () => {
  const w = await seeded({}, book());
  const t = await w.table([["amount", "number"], ["note", "string"]], [["1200.50", "a"], ["300", "b"], ["99.5", "c"]]);
  const good = { ...w.at, range: "Model!B2:B4", input: { table: t, range: "A1:A3" }, by: V("bob") };
  const before = w.snapshot();
  const cases = [
    [{ ...good, project: "PROJ-none" }, "NO_SUCH_WORKBOOK"],
    [{ ...good, captureSha: "b".repeat(64) }, "NO_SUCH_WORKBOOK"],
    [{ ...good, range: "B2:B4" }, "BAD_RANGE"],                      /* no sheet */
    [{ ...good, range: "Nope!B2:B4" }, "BAD_RANGE"],                 /* not a sheet of the workbook */
    [{ ...good, range: "Model!B2:B4:C5" }, "BAD_RANGE"],             /* not one rectangle */
    [{ ...good, range: "Model!B2,Model!B4" }, "BAD_RANGE"],
    [{ ...good, range: "Model!B:B" }, "BAD_RANGE"],
    [{ ...good, range: "Model!XFE1" }, "BAD_RANGE"],                 /* outside the grid */
    [{ ...good, range: 7 }, "BAD_RANGE"],
    [{ ...good, range: "Model!B2:B5" }, "RANGE_HOLDS_FORMULAS"],
    [{ ...good, range: "Model!B6" }, "RANGE_HOLDS_FORMULAS"],
    [{ ...good, input: { table: "c".repeat(64), range: "A1:A3" } }, "NO_SUCH_INPUT"],   /* a table not held */
    [{ ...good, input: { table: t, range: "A1:A4" } }, "NO_SUCH_INPUT"],               /* outside it */
    [{ ...good, input: { table: t, range: "C1:C3" } }, "NO_SUCH_INPUT"],
    [{ ...good, input: { table: t, range: "nonsense" } }, "NO_SUCH_INPUT"],
    [{ ...good, input: { extent: "d".repeat(64) } }, "NO_SUCH_INPUT"],                 /* an extent not held */
    [{ ...good, input: {} }, "NO_SUCH_INPUT"],
    [{ ...good, input: { table: t, range: "A1:A2" } }, "SHAPE_MISMATCH"],              /* rows differ */
    [{ ...good, input: { table: t, range: "A1:B3" } }, "SHAPE_MISMATCH"],              /* columns differ */
  ];
  for (const [call, code] of cases) {
    const r = await w.wb.bind(call);
    assert.equal(codeOf(r), code, JSON.stringify(call.range) + JSON.stringify(call.input));
    assert.ok(r.detail);
  }
  assert.deepEqual((await w.wb.bind({ ...good, range: "Model!B2:B5" })).cells, ["Model!B5"], "names the formula cells");
  assert.deepEqual(w.snapshot(), before, "a refused bind writes nothing");
  w.clock.now = "2026-10-06T02:00:00.000Z";
  const r = await w.wb.bind({ ...good, range: "model!$B$2:$B$4" });
  assert.equal(r.ok, true, "the sheet without case and $ markers");
  assert.equal(r.binding.range, "Model!B2:B4");
  assert.equal(r.binding.bound_by, V("bob"));
  assert.equal(r.binding.bound_at, "2026-10-06T02:00:00.000Z");
  assert.equal(r.binding.state, "bound");
  /* a quoted sheet name, a single cell */
  assert.equal((await w.wb.bind({ ...w.at, range: "'Notes Sheet'!A1", input: { table: t, range: "A2" }, by: V("carol") })).ok, true);
  /* unbind */
  assert.equal(codeOf(await w.wb.unbind({ bindingId: r.binding.binding_id, reason: "  ", by: V("bob") })), "NO_REASON");
  assert.equal(codeOf(await w.wb.unbind({ bindingId: 999, reason: "x", by: V("bob") })), "NO_SUCH_BINDING");
  assert.equal(codeOf(await w.wb.unbind({ bindingId: r.binding.binding_id, reason: "x", by: V("dave") })), "NO_SUCH_BINDING", "out of sight");
  w.clock.now = "2026-10-06T03:00:00.000Z";
  const u = await w.wb.unbind({ bindingId: r.binding.binding_id, reason: "the wrong year's table", by: V("carol") });
  assert.equal(u.ok, true);
  const shown = (await w.wb.readWorkbook({ ...w.at, viewer: V("bob") })).bindings.find((b) => b.binding_id === r.binding.binding_id);
  assert.equal(shown.state, "unbound", "it stays");
  assert.equal(shown.unbound_by, V("carol"));
  assert.equal(shown.unbound_at, "2026-10-06T03:00:00.000Z");
  assert.equal(shown.unbind_reason, "the wrong year's table");
  assert.equal(shown.bound_by, V("bob"), "with who bound it");
  assert.equal((await w.wb.unbind({ bindingId: r.binding.binding_id, reason: "again", by: V("bob") })).already, true);
  assert.equal(w.count("workbook_bindings"), 2);
});

test("R4 each bound cell is compared with its source cell for cell, numbers by exact decimal value, text and booleans exactly; a binding that differs by one cent is held and shown differing, never corrected or refused", async () => {
  const w = await seeded({}, book());
  const exact = await w.table([["amount", "number"]], [["1,200.5"], ["300.00"], ["99.50"]]);
  const cent = await w.table([["amount", "number"]], [["1200.51"], ["300"], ["99.5"]]);
  const r1 = await w.wb.bind({ ...w.at, range: "Model!B2:B4", input: { table: exact, range: "A1:A3" }, by: V("bob") });
  assert.deepEqual({ agrees: r1.binding.agrees, compared: r1.binding.compared, differing: r1.binding.differing },
                   { agrees: true, compared: 3, differing: [] }, "1200.50 = 1,200.5; 300 = 300.00; 9.95E1 = 99.50");
  const r2 = await w.wb.bind({ ...w.at, range: "Model!B2:B4", input: { table: cent, range: "A1:A3" }, by: V("bob") });
  assert.equal(r2.ok, true, "a differing binding is held");
  assert.equal(r2.binding.agrees, false);
  assert.deepEqual(r2.binding.differing, [{ cell: "Model!B2", workbook_value: "1200.50", source_value: "1200.51" }]);
  /* the cells are unchanged */
  assert.equal(w.rows(`SELECT value FROM workbook_cells WHERE cell='B2' AND sheet='Model'`)[0].value, "1200.50");
  /* text exactly (case counts), booleans exactly */
  const words = await w.table([["said", "string"], ["flag", "boolean"]], [["yes", "true"], ["no", "false"], ["yes", "true"]]);
  const r3 = await w.wb.bind({ ...w.at, range: "Model!C2:C4", input: { table: words, range: "A1:A3" }, by: V("bob") });
  assert.deepEqual(r3.binding.differing, [{ cell: "Model!C4", workbook_value: "Yes", source_value: "yes" }]);
  const r4 = await w.wb.bind({ ...w.at, range: "Model!E2:E3", input: { table: words, range: "B1:B2" }, by: V("bob") });
  assert.equal(r4.binding.agrees, true, "TRUE and FALSE against true and false");
  const r5 = await w.wb.bind({ ...w.at, range: "Model!E2:E3", input: { table: words, range: "B2:B3" }, by: V("bob") });
  assert.equal(r5.binding.differing.length, 2);
  /* a number against text is a difference, never a coercion */
  const r6 = await w.wb.bind({ ...w.at, range: "Model!B3", input: { table: words, range: "A1" }, by: V("bob") });
  assert.deepEqual(r6.binding.differing, [{ cell: "Model!B3", workbook_value: "300", source_value: "yes" }]);
  /* a cited figure: its text read as a figure */
  const fig = w.figure("$1,200.50");
  const r7 = await w.wb.bind({ ...w.at, range: "Model!B2", input: { extent: fig.contentId }, by: V("bob") });
  assert.deepEqual([r7.binding.agrees, r7.binding.compared], [true, 1]);
  const off = w.figure("$1,200.49");
  assert.equal((await w.wb.bind({ ...w.at, range: "Model!B2", input: { extent: off.contentId }, by: V("bob") })).binding.agrees, false);
  const approx = w.figure("about $1,200.50");
  assert.equal((await w.wb.bind({ ...w.at, range: "Model!B2", input: { extent: approx.contentId }, by: V("bob") })).binding.agrees, false,
               "an approximate figure is not one exact number");
  /* every read shows each binding's comparison */
  const read = await w.wb.readWorkbook({ ...w.at, viewer: V("carol") });
  assert.deepEqual(read.bindings.map((b) => b.agrees), [true, false, false, true, false, false, true, false, false]);
  assert.equal(read.bindings[1].differing[0].source_value, "1200.51");
});

test("R5 inputsOf answers every input cell (a constant a formula reads), each bound naming its binding or unbound, graded D as testimony", async () => {
  const w = await seeded({}, book());
  const t = await w.table([["amount", "number"]], [["1200.50"], ["300"]]);
  const b = await w.wb.bind({ ...w.at, range: "Model!B2:B3", input: { table: t, range: "A1:A2" }, by: V("bob") });
  const r = await w.wb.inputsOf({ ...w.at, viewer: V("carol") });
  assert.equal(r.ok, true);
  /* read by formulas: B2:B4 (SUM), C2:C4 and E2:E3 (COUNTA), Notes Sheet!A1; not B1, A2:A4, D1 or the formulas */
  assert.deepEqual(r.inputs.map((x) => x.cell), ["Model!B2", "Model!C2", "Model!E2", "Model!B3", "Model!C3", "Model!E3", "Model!B4",
                                                 "Model!C4", "Notes Sheet!A1"]);
  const byCell = Object.fromEntries(r.inputs.map((x) => [x.cell, x]));
  assert.equal(byCell["Model!B2"].bound, true);
  assert.equal(byCell["Model!B2"].binding_id, b.binding.binding_id);
  assert.equal(byCell["Model!B3"].binding_id, b.binding.binding_id);
  for (const c of ["Model!B4", "Model!C2", "Notes Sheet!A1"]) {
    assert.equal(byCell[c].bound, false, c);
    assert.equal(byCell[c].binding_id, null);
    assert.equal(byCell[c].grade, "D", "testimony");
  }
  assert.deepEqual(r.counts, { inputs: 9, bound: 2, unbound: 7 });
  /* an unbound binding's cells are unbound inputs again */
  await w.wb.unbind({ bindingId: b.binding.binding_id, reason: "wrong", by: V("bob") });
  assert.equal((await w.wb.inputsOf({ ...w.at, viewer: V("bob") })).counts.bound, 0);
  /* a defined name and a whole-column reference read their constants too */
  const w2 = await seeded({}, xlsx([{ name: "S", cells: { A1: { n: "1" }, A2: { n: "2" }, B1: { n: "5" }, B2: { n: "6" }, C1: { f: "SUM(Rates)", v: "3" },
    D1: { f: "SUM(S!B:B)", v: "11" }, E1: { f: "\"A9\"&\"x\"", v: "A9x", t: "str" }, A9: { n: "9" } } }], { names: { Rates: "S!$A$1:$A$2" } }));
  assert.deepEqual((await w2.wb.inputsOf({ ...w2.at, viewer: V("bob") })).inputs.map((x) => x.cell), ["S!A1", "S!B1", "S!A2", "S!B2"],
                   "not A9, named only inside a string");
});

test("R12 readWorkbook answers grade facts on K1447 (ii)'s terms: each bound input at its capture grade capped by its derivation, each unbound input D, each formula result 'third-party engine' at undetermined whatever the recompute found, the method disclosed and not graded", async () => {
  const w = await seeded({ recompute: async () => ({ ok: true, engine: "ironcalc", engine_version: "v", cells: [
    { source: { ref: "Model!B5" }, formula: "=SUM(B2:B4)", value: "1600", type: "number", volatile: false },
    { source: { ref: "Model!B6" }, formula: "=B5*1.1", value: "1760", type: "number", volatile: false },
    { source: { ref: "Model!F1" }, formula: "=COUNTA()", value: "5", type: "number", volatile: false },
    { source: { ref: "Notes Sheet!B1" }, formula: "=A1*2", value: "14", type: "number", volatile: false }] }) }, book());
  const t = await w.table([["amount", "number"]], [["1200.50"], ["300"]], { direct: true, cap: "C" });
  const fig = w.figure("99.5");
  await w.wb.bind({ ...w.at, range: "Model!B2:B3", input: { table: t, range: "A1:A2" }, by: V("bob") });
  await w.wb.bind({ ...w.at, range: "Model!B4", input: { extent: fig.contentId }, by: V("bob") });
  await w.wb.recompute({ ...w.at, by: V("bob") });
  await w.wb.recordMethodNote({ ...w.at, purpose: "cost", sources: ["the ledger"], steps: "sum", limitations: "one year", by: V("bob") });
  const g = (await w.wb.readWorkbook({ ...w.at, viewer: V("bob") })).grade_facts;
  const by = Object.fromEntries(g.inputs.map((x) => [x.cell, x]));
  const facts = (await w.calculations.readTable({ sha: t, viewer: V("bob") })).table.grade_facts;
  assert.deepEqual([facts.capture_grade, facts.derivation], ["B", "C"], "the table's source: fetched directly (B), its reading capped at C");
  assert.deepEqual([by["Model!B2"].capture_grade, by["Model!B2"].derivation, by["Model!B2"].grade], ["B", "C", "C"], "capped by its derivation");
  assert.equal(by["Model!B4"].capture_grade, w.prov.captureGrade(fig.capSha).grade, "an extent's capture grade from provenance");
  assert.ok(by["Model!B4"].source.extent);
  for (const c of ["Model!C2", "Model!E2", "Notes Sheet!A1"]) assert.equal(by[c].grade, "D", `${c} unbound: D`);
  assert.equal(g.inputs.length, 9);
  assert.deepEqual(g.results.map((x) => x.cell).sort(), ["Model!B5", "Model!B6", "Model!F1", "Notes Sheet!B1"]);
  for (const x of g.results) assert.deepEqual([x.derivation_step, x.grade], [ENGINE_STEP.step, "undetermined"], "even though the recompute agreed");
  assert.equal((await w.wb.readWorkbook({ ...w.at, viewer: V("bob") })).recompute.status, "agrees");
  assert.equal(g.method.graded, false);
  assert.equal(g.method.disclosed.purpose, "cost");
});
