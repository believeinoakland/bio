/* G137e (fix round 9; K4831 (10), K4835 (1)): an analysis workbook is held whole up to the cells bound, and `addWorkbook`
   counts what it drops. Ids: R20 (the bounds are READ_BOUNDS rows; SHEET X20, workbooks of 50,000, 130,000, 250,000 and
   250,001 cells through add, bind and recompute in a child capped as the plane's object leaves it) and R21 (SHEET X12,
   cells with no reference; a repeated reference; a workbook with every reference drops none). R1 and R2 are the
   refusals X20 reads. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { world, V } from "./fixture.mjs";
import * as S from "./g44-shapes.mjs";
import * as F from "../office-readers/fixtures.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { WORKBOOK_FILE_MAX_BYTES, WORKBOOK_CELLS_MAX, WORKBOOK_CELLS_MAX_BYTES } from "../../../src/workbooks/index.mjs";
import { boundOf, statement } from "../../../src/read-bounds.mjs";
import { capFor } from "../../../src/byte-ledger.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const PRELOAD = join(HERE, "../../platform-sqlite.mjs");
const MiB = 1048576;

async function inChild(t, shape, job) {
  const dir = mkdtempSync(join(tmpdir(), "x20-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, "book.xlsx");
  writeFileSync(file, shape.bytes);
  const cap = capFor(shape.bytes.length / MiB);
  let stdout = "";
  try {
    ({ stdout } = await run(process.execPath, ["--import", PRELOAD, "--expose-gc", `--max-old-space-size=${cap}`,
      join(HERE, "g44-child.mjs"), file, job], { maxBuffer: 1 << 28 }));
  } catch (e) { stdout = e.stdout || ""; }
  const out = Object.assign({}, ...stdout.split("\n").filter(Boolean).map((l) => JSON.parse(l)));
  out.alive = "endMB" in out;
  t.diagnostic(`${shape.cells} cells, cap ${cap} MB, end ${out.endMB?.toFixed(1)}, alive ${out.alive}`);
  return out;
}

test("R20 the add's three bounds are READ_BOUNDS rows read through boundOf, the cells row 250,000 (the figure sheet-worker holds as MAX_CELLS), and the module holds those figures", () => {
  assert.equal(WORKBOOK_CELLS_MAX, boundOf("workbook", "cells"));
  assert.equal(WORKBOOK_CELLS_MAX, 250000);
  assert.equal(WORKBOOK_CELLS_MAX, boundOf("sheet_worker", "cells"), "a workbook the add holds is never refused by the engine for its cells");
  assert.equal(WORKBOOK_FILE_MAX_BYTES, boundOf("workbook", "bytes"));
  assert.equal(WORKBOOK_CELLS_MAX_BYTES, boundOf("workbook", "cells_json_bytes"));
  for (const name of ["cells", "bytes", "cells_json_bytes"]) assert.match(statement("workbook", name, 1).key, /^limit\.workbook\./);
});

for (const n of [50000, 130000, 250000]) {
  test(`R20 SHEET X20: a workbook of ${n} cells is accepted, its first three constants bind to a captured table and agree, and every read and the recompute answer at the real-shape cap`, async (t) => {
    const f = S.exact(n);
    assert.equal(f.cells, n);
    const r = await inChild(t, f, "x20");
    assert.equal(r.alive, true, "the child must survive");
    assert.equal(r.add.ok, true);
    assert.equal(r.add.dropped, null, "a workbook whose cells all carry references drops none and states none");
    assert.equal(r.cells, n, "held whole");
    assert.deepEqual(r.bind, { ok: true, reason: null, agrees: true, compared: 3 });
    for (const k of ["read", "lint", "inputs"]) assert.equal(r[k].ok, true, `${k} ${JSON.stringify(r[k])}`);
    assert.equal(r.recompute.ok, true);
    assert.equal(r.recompute.compared, f.formulas, "every formula the file holds is compared with the engine's value");
  });
}

test("R20 R1 SHEET X20: a workbook of 250,001 cells is refused WORKBOOK_TOO_LARGE with its count and the bound, the statement keyed to the cells row, and nothing is written", async (t) => {
  const r = await inChild(t, S.exact(250001), "x20");
  assert.equal(r.alive, true);
  assert.equal(r.add.reason, "WORKBOOK_TOO_LARGE");
  assert.equal(r.add.cells, 250001);
  assert.equal(r.add.bound_cells, 250000);
  assert.deepEqual(r.add.limit, statement("workbook", "cells", 250001));
  assert.equal(r.changed, false);
  assert.equal(r.cells, 0);
  assert.equal(r.bind, undefined, "nothing to bind");
});

test("R20 R1 R2 a workbook whose cells' JSON the reader will not list is refused WORKBOOK_TOO_LARGE for its bytes, stating the JSON row's figures, and writes nothing", async () => {
  const w = world();
  for (const m of ["alice", "bob"]) w.member(m, m === "alice" ? { role: "admin" } : {});
  const P = w.project("Rates", "bob");
  const cap = w.capture(S.exact(30).bytes).capSha;
  const text = xlsxEntry.text;
  let asked = null;
  /* the reader's contract (office-readers R30, G41): over the caller's cap a sheet's cells are not listed and say so */
  xlsxEntry.text = async (b, opts) => { asked = opts; return { ok: true, sheets: [{ name: "Big", hidden: false, cells: null, cells_held: true }], counts: { cells: 77 } }; };
  const before = w.snapshot();
  try {
    const r = await w.wb.addWorkbook({ captureSha: cap, question: "q", period: "p", project: P, by: V("bob") });
    assert.equal(r.reason, "WORKBOOK_TOO_LARGE");
    assert.equal(r.condition, "cell_bytes");
    assert.equal(r.cells, 77);
    assert.equal(asked.inlineCellsMax, boundOf("workbook", "cells_json_bytes"), "the reader is given the JSON row's figure");
    assert.deepEqual(w.snapshot(), before);
  } finally { xlsxEntry.text = text; }
});

const NS = `xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"`;
const sheetXml = (rows) => `<?xml version="1.0"?><worksheet ${NS}><sheetData>${rows}</sheetData></worksheet>`;
const book = (rows) => F.xlsx({ sheets: [{ name: "S", xml: sheetXml(rows) }] });
async function addOf(bytes) {
  const w = world();
  for (const m of ["alice", "bob"]) w.member(m, m === "alice" ? { role: "admin" } : {});
  const P = w.project("Rates", "bob");
  const cap = w.capture(bytes).capSha;
  const at = { captureSha: cap, project: P };
  return { w, at, add: await w.wb.addWorkbook({ ...at, question: "q", period: "p", by: V("bob") }) };
}

test("R21 SHEET X12: rows and cells with no r are not thrown on: the add is accepted, the cells it drops are counted with their cause, and the workbook reads", async () => {
  const noRef = `<row><c><v>1</v></c><c><v>2</v></c></row><row><c><v>3</v></c></row><row r="4"><c r="A4"><v>7</v></c><c><v>8</v></c></row>`;
  const { w, at, add } = await addOf(book(noRef));
  assert.equal(add.ok, true, JSON.stringify(add));
  assert.equal(add.dropped.count, 4);
  assert.equal(add.dropped.no_reference, 4);
  assert.equal(add.dropped.unreadable, 0);
  assert.equal(add.dropped.repeated, 0);
  assert.ok(add.dropped.statement && !/[{}]/.test(add.dropped.statement), "its words hold the figures");
  assert.equal(w.count("workbook_cells"), 1, "the one cell that carries its reference is held");
  const read = await w.wb.readWorkbook({ ...at, viewer: V("bob") });
  assert.equal(read.ok, true);
  assert.equal(read.workbook.counts.cells, 1);
  assert.equal((await w.wb.addWorkbook({ ...at, question: "q", period: "p", by: V("bob") })).already, true, "a repeat answers already");
});

test("R21 a cell whose reference cannot be read, and a repeat of an earlier cell's reference, are each dropped and counted; the first of a repeated reference is kept", async () => {
  const rows = `<row r="1"><c r="A1"><v>1</v></c><c r="A1"><v>2</v></c><c r="??"><v>3</v></c><c r="B1"><v>4</v></c></row>`;
  const { w, add } = await addOf(book(rows));
  assert.equal(add.ok, true);
  assert.equal(add.dropped.count, 2);
  assert.equal(add.dropped.repeated, 1, "one dropped repeat");
  assert.equal(add.dropped.unreadable, 1);
  assert.equal(add.dropped.no_reference, 0);
  const held = w.rows(`SELECT cell, value FROM workbook_cells ORDER BY cell`);
  assert.deepEqual(held, [{ cell: "A1", value: "1" }, { cell: "B1", value: "4" }]);
});

test("R21 control: a workbook whose cells all carry their references drops none and states none", async () => {
  const { add } = await addOf(book(`<row r="1"><c r="A1"><v>1</v></c><c r="B1"><v>2</v></c></row><row r="2"><c r="A2"><v>3</v></c></row>`));
  assert.equal(add.ok, true);
  assert.equal("dropped" in add, false);
});
