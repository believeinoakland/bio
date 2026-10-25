/* store-assembly's copy of plane's test. plane R84 G123f (fix round 9; S-36; walk-coverage R35, R36, R83): A RANGE OF CELLS CITED AND READ BACK, then the file declared as a table and added as a workbook, through the real plane in a child under the
   one cap convention (`shape/cap.mjs`) and the platform's value limit. Never walked before: no walker cited a range of cells and read the cited text. Each file is uploaded by the member's path and read to its
   end by the ledger; then, equal to the generator's cells cell for cell (never a sample): `cellsOf` of the last row, of a range crossing a block edge of the reading's own text rows, and of a range over the
   call's bound (`CELLS_RANGE_MAX`) read to its end by `next_row`; the same two ranges CITED (`content` mint, then `cellsAt`: the edge range whole, the over-bound range cut with `cells_truncated` and a
   `next_row` that is the first row not delivered); then `tabledeclare` of the document and `workbookadd` of the file. A CSV is not a workbook and says so; a workbook over the add's bound is refused with its
   count. Counts only (R-CLOCK). Medium: run under the preload, alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { shapeRun, csvDoc, xlsxRowsDoc, capFor } from "./shape/harness.mjs";

const ME = "member:ann";
const F = [{ name: "id", type: "string" }, { name: "name", type: "string" }, { name: "amount", type: "string" }, { name: "note", type: "string" }];
const addOp = { op: "workbookadd", path: "/workbookadd", body: { captureSha: "$SHA", question: "What does it cost?", period: "FY2025", project: "$PROJECT", by: ME } };
const declareOp = { op: "tabledeclare", path: `/tabledeclare?viewer=${ME}`, body: { source: "$DOC", schema: { fields: F }, header: F.map((f) => f.name), by: ME } };
const run = (doc) => shapeRun({ doc, cellRanges: true, project: true, opsAfter: [addOp, declareOp], maxTicks: 60, readingFor: false }, { capMB: capFor(doc.bytes / 1048576) });
const op = (r, name) => r.ops.find((o) => o.op === name);

async function rangesHold(name, doc) {
  const r = await run(doc);
  assert.equal(r.died, false, r.error || r.stderr);
  const g = r.ranges; assert.ok(g, "the ranges were asked");
  for (const label of ["last", "edge", "bound"]) {
    const x = g.ranges[label];
    assert.ok(x, `${name}: the ${label} range was asked`);
    assert.equal(x.error, null, `${name} ${label}`);
    assert.equal(x.wrong, null, `${name} ${label}: a cell differs from the generator's: ${JSON.stringify(x.wrong)}`);
    assert.equal(x.stoppedWithNext, false, `${name} ${label}: read to its end`);
  }
  assert.ok(g.ranges.bound.calls >= 2, "the over-bound range took more than one call, joined by next_row");
  assert.ok(g.blocks >= 2 && g.edge, "the reading has block edges to cross");
  const c = g.cited;
  assert.equal(c.error, undefined, JSON.stringify(c));
  assert.equal(c.edge.wrong, null, JSON.stringify(c.edge.wrong));
  assert.equal(c.edge.truncated, false, "the edge range is cited whole");
  assert.equal(c.edge.lastRowSeen, c.edge.to);
  assert.equal(c.bound.wrong, null, JSON.stringify(c.bound.wrong));
  assert.equal(c.bound.truncated, true, "a range over the call's bound is cut, stated");
  assert.equal(c.bound.next_row, c.bound.lastRowSeen + 1, "next_row is the first row not delivered");
  return r;
}

test("R84 G123f: a 3 MiB CSV: the last row, a block edge and an over-bound range, read and cited, equal the generator's; the table is declared; a CSV is not a workbook, and says so", { timeout: 600_000 }, async () => {
  const r = await rangesHold("csv", csvDoc(3 * 1048576));
  assert.equal(op(r, "tabledeclare").ok, true);
  assert.equal(op(r, "workbookadd").ok, false);
  assert.equal(op(r, "workbookadd").reason, "NOT_A_WORKBOOK");
});

test("R84 G123f: a 16,000-row xlsx: the same ranges equal the generator's, the table is declared and the workbook added", { timeout: 600_000 }, async () => {
  const r = await rangesHold("xlsx", await xlsxRowsDoc(16_000));
  assert.equal(op(r, "tabledeclare").ok, true);
  assert.equal(op(r, "workbookadd").ok, true, JSON.stringify(op(r, "workbookadd")));
});

test("R85 G123f: a 30,000-row xlsx (90,003 cells with its header row) is refused WORKBOOK_TOO_LARGE with its count and the add's bound when the bound is under it, added when the bound is over it (250,000 once workbooks R20 merges), never silently cut; its table is declared either way", { timeout: 600_000 }, async () => {
  const r = await run(await xlsxRowsDoc(30_000));
  assert.equal(r.died, false, r.error || r.stderr);
  const add = op(r, "workbookadd");
  if (add.ok === false) {
    assert.equal(add.reason, "WORKBOOK_TOO_LARGE");
    assert.equal(add.cells, 30_001 * 3, "the header row is cells too");
    assert.ok(Number.isInteger(add.bound_cells) && add.bound_cells < add.cells, "refused only because the count is over the stated bound");
  } else assert.equal(add.ok, true, JSON.stringify(add));
  assert.equal(op(r, "tabledeclare").ok, true);
});
