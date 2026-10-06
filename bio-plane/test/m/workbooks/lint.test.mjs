/* workbooks: lint (R9). Each kind with a workbook that shows it and a negative control that does not. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, xlsx, V } from "./fixture.mjs";
import { LINT_KINDS } from "../../../src/workbooks/index.mjs";

const tag = () => ({ Z99: { s: `${Math.random()}` } });
async function lintOf(sheets, opts) {
  const w = await seeded({}, xlsx(sheets, opts));
  const r = w.wb.lint({ ...w.at, viewer: V("bob") });
  assert.equal(r.ok, true);
  return { w, findings: r.findings, of: (kind) => r.findings.filter((f) => f.kind === kind).map((f) => f.cell) };
}

test("R9 short_range: an aggregate's range that stops short of, or starts after, the contiguous run of numbers in its column or row; a range covering the run is not a finding", async () => {
  const { of, findings } = await lintOf([{ name: "S", cells: {
    A1: { s: "h" }, A2: { n: "1" }, A3: { n: "2" }, A4: { n: "3" }, A5: { f: "SUM(A2:A3)", v: "3" },            /* stops short */
    B1: { s: "h" }, B2: { n: "1" }, B3: { n: "2" }, B4: { n: "3" }, B5: { f: "SUM(B3:B4)", v: "5" },            /* starts after */
    C1: { s: "h" }, C2: { n: "1" }, C3: { n: "2" }, C4: { n: "3" }, C5: { f: "SUM(C2:C4)", v: "6" },            /* control */
    D1: { s: "h" }, D2: { n: "1" }, D3: { f: "AVERAGE(D2:D2)", v: "1" },                                        /* one cell: no run */
    A7: { n: "4" }, B7: { n: "5" }, C7: { n: "6" }, D7: { f: "SUM(A7:B7)", v: "9" },                            /* a row, short */
    A8: { n: "4" }, B8: { n: "5" }, C8: { f: "MAX(A8:B8)", v: "5" },                                            /* a row: control */
    ...tag() } }]);
  assert.deepEqual(of("short_range"), ["S!A5", "S!B5", "S!D7"]);
  assert.match(findings.find((f) => f.cell === "S!A5").detail, /SUM over A2:A3, while the numbers run A2:A4, past its end/);
  assert.match(findings.find((f) => f.cell === "S!B5").detail, /starting before it/);
});

test("R9 constant_in_formula: a number written inside a formula, never one inside a string, a reference or a function's name", async () => {
  const { of, findings } = await lintOf([{ name: "S", cells: {
    A1: { n: "2" }, A2: { f: "A1*1.07", v: "2.14" }, A3: { f: "ROUND(A1,2)", v: "2" },
    B1: { f: "LOG10(A1)+ATAN2(A1,A1)", v: "1" }, B2: { f: "A1&\"x 12\"", v: "2x 12", t: "str" }, B3: { f: "S!A1+$A$1", v: "4" },
    ...tag() } }]);
  assert.deepEqual(of("constant_in_formula"), ["S!A2", "S!A3"]);
  assert.match(findings.find((f) => f.cell === "S!A2").detail, /1\.07/);
});

test("R9 hidden_input: an input cell in a hidden row, column or sheet; a hidden cell no formula reads, and a visible input, are not findings", async () => {
  const { of } = await lintOf([
    { name: "S", hiddenRows: [3], hiddenCols: [[3, 3]], cells: {
      A2: { n: "1" }, A3: { n: "2" }, C1: { n: "3" }, D1: { n: "9" }, A9: { n: "4" }, A10: { f: "SUM(A2:A3)+C1+H!A1", v: "10" },
      C9: { n: "5" }, ...tag() } },
    { name: "H", hidden: true, cells: { A1: { n: "4" }, A2: { n: "7" } } }]);
  assert.deepEqual(of("hidden_input"), ["S!C1", "S!A3", "H!A1"], "C9 (hidden column, read by none) and A2 (visible) are not");
});

test("R9 number_as_text: an input stored as text whose text is a figure; a figure stored as a number, and text that is no figure, are not findings", async () => {
  const { of } = await lintOf([{ name: "S", cells: {
    A1: { s: "1,200" }, A2: { s: "$4.2 million" }, A3: { n: "5" }, A4: { s: "rent" }, A5: { f: "SUM(A1:A4)", v: "5" },
    B1: { s: "77" }, ...tag() } }]);
  assert.deepEqual(of("number_as_text"), ["S!A1", "S!A2"], "B1 is read by no formula");
});

test("R9 error_value: a cached error value, constant or formula; a value is not a finding", async () => {
  const { of } = await lintOf([{ name: "S", cells: {
    A1: { e: "#DIV/0!" }, A2: { f: "1/0", v: "#DIV/0!", t: "e" }, A3: { f: "A4", v: "3" }, A4: { n: "3" }, ...tag() } }]);
  assert.deepEqual(of("error_value"), ["S!A1", "S!A2"]);
});

test("R9 cross_foot: a block whose row totals and column totals do not sum to the same grand total; a block that foots is not a finding", async () => {
  const block = (sheet, rowTotals, colTotals) => ({ name: sheet, cells: {
    A1: { n: "1" }, B1: { n: "2" }, C1: { f: "SUM(A1:B1)", v: rowTotals[0] },
    A2: { n: "3" }, B2: { n: "4" }, C2: { f: "SUM(A2:B2)", v: rowTotals[1] },
    A3: { f: "SUM(A1:A2)", v: colTotals[0] }, B3: { f: "SUM(B1:B2)", v: colTotals[1] }, ...tag() } });
  const bad = await lintOf([block("S", ["3", "7"], ["4", "7"])]);
  assert.deepEqual(bad.of("cross_foot"), ["S!C3"]);
  assert.match(bad.findings.find((f) => f.kind === "cross_foot").detail, /add to 10, the column totals in row 3 to 11, over A1:B2/);
  const good = await lintOf([block("S", ["3", "7"], ["4", "6"])]);
  assert.deepEqual(good.of("cross_foot"), []);
});

test("R9 lint answers {kind, cell, detail} for the six kinds only, changes nothing and blocks nothing; explainLint holds a member's note against a finding (NO_NOTE when blank), kept and never erased", async () => {
  const w = await seeded();
  const before = w.snapshot();
  const r = w.wb.lint({ ...w.at, viewer: V("bob") });
  assert.deepEqual(w.snapshot(), before, "lint writes nothing");
  for (const f of r.findings) {
    assert.ok(LINT_KINDS.includes(f.kind));
    assert.deepEqual(Object.keys(f).sort(), ["cell", "detail", "kind", "notes"]);
  }
  assert.deepEqual(LINT_KINDS, ["short_range", "constant_in_formula", "hidden_input", "number_as_text", "error_value", "cross_foot"]);
  const finding = { kind: "constant_in_formula", cell: "Model!B6" };
  for (const note of ["", "   ", undefined, null]) assert.equal(w.wb.explainLint({ ...w.at, finding, note, by: V("bob") }).reason, "NO_NOTE");
  assert.equal(w.wb.explainLint({ ...w.at, finding: { kind: "error_value", cell: "Model!B6" }, note: "x", by: V("bob") }).reason, "NO_SUCH_FINDING");
  w.clock.now = "2026-10-06T07:00:00.000Z";
  assert.equal(w.wb.explainLint({ ...w.at, finding, note: "the 10% markup the council adopted", by: V("bob") }).ok, true);
  assert.equal(w.wb.explainLint({ ...w.at, finding, note: "checked against the ordinance", by: V("carol") }).ok, true);
  const notes = w.wb.lint({ ...w.at, viewer: V("carol") }).findings.find((f) => f.cell === "Model!B6").notes;
  assert.deepEqual(notes, [{ note: "the 10% markup the council adopted", by: V("bob"), at: "2026-10-06T07:00:00.000Z" },
                           { note: "checked against the ordinance", by: V("carol"), at: "2026-10-06T07:00:00.000Z" }]);
  /* a recompute and a bind leave the notes as they are */
  await w.wb.recompute({ ...w.at, by: V("bob") });
  assert.equal(w.wb.readWorkbook({ ...w.at, viewer: V("bob") }).lint.find((f) => f.cell === "Model!B6").notes.length, 2);
});
