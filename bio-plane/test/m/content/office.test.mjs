/* content: what an office capture's reading states about itself (R52 `cellsAt`, R53 `officeMetadataOf`), R46's sheet
   arm (`passageText` over typed cells) and R31's grade of a sheet passage across versions. The typed cells are the real
   CSV reader's output (`office-readers` R30, field for field) and, for the formula fields, an xlsx-shaped list stated
   here; they reach this module through extraction's reading (its R30 `readingOf`), the provider the test controls.
   Reads only: every table is byte-identical across each call. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, LAYER } from "./fixture.mjs";
import { csvEntry } from "../../../src/csv.mjs";

const DOC = "INFO-2026-0001-a", NEW = "INFO-2026-0002-b";
const GRID = { container: "csv", levels: ["sheets"], sheets: [{ name: "csv", rows: 1048576, cols: 16384, usedRows: 3, usedCols: 3 },
                                                               { name: "Other", rows: 1048576, cols: 16384, usedRows: 1, usedCols: 1 }] };
const cellOf = (sheet, cell, value, extra = {}) => ({ source: { kind: "sheet-cell", ref: `${sheet}!${cell}`, sheet, cell },
  value, type: "number", declared: "n", cached: null, formula: null, ...extra });

async function csvCells(text) {
  const t = await csvEntry.text(new TextEncoder().encode(text));
  return { cells: { [t.sheets[0].name]: t.sheets[0].cells }, metadata: t.metadata };
}

/** A workbook capture whose reading holds `reading` (its `cells` and `metadata`, as extraction persists them). */
function setup(reading, { captureFormat = "csv", containerExtent = GRID } = {}) {
  const w = world();
  const a = w.cap("a", "a,b,c\n1,0.10,x\n,,z\n");
  w.doc(DOC, [a]);
  w.read(a.sha, { chain: LAYER, captureFormat, containerExtent, reading });
  const cite = (extent) => {
    const m = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent, mintedBy: V("bo") });
    assert.equal(m.ok, true, JSON.stringify(m));
    return m.content_id;
  };
  const quiet = (fn) => { const before = w.snapshot(); const out = fn(); assert.deepEqual(w.snapshot(), before, "writes nothing"); return out; };
  return { w, a, cite, quiet };
}

test("R52: cellsAt answers a sheet-cell or sheet-range row's typed cells inside its extent, field for field as the reader states them, in row then column order", async () => {
  const held = await csvCells("a,b,c\n1,0.10,x\n,,z\n");
  const { w, cite, quiet } = setup(held);
  const all = held.cells.csv;
  /* A range: exactly the held cells inside it, in row then column order, each field as the reader gave it. */
  const rid = cite({ kind: "sheet-range", sheet: "csv", range: "B1:C3" });
  const r = quiet(() => w.content.cellsAt(rid));
  assert.deepEqual(r.cells, all.filter((c) => /^[BC]/.test(c.source.cell)));
  assert.deepEqual(r.cells.map((c) => c.source.cell), ["B1", "C1", "B2", "C2", "C3"]);
  assert.equal(r.extent_kind, "sheet-range");
  /* The stored lexical value, never re-rendered through a float. */
  const one = w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "csv", cell: "B2" }));
  assert.deepEqual(one.cells, [all.find((c) => c.source.cell === "B2")]);
  assert.equal(one.cells[0].value, "0.10");
  /* A range spelled bottom-right first names the same cells, in the same order. */
  assert.deepEqual(w.content.cellsAt(cite({ kind: "sheet-range", sheet: "csv", range: "$C$3:b1" })).cells, r.cells);
  /* An empty cell inside a read sheet is a measured empty list, not undetermined. */
  assert.deepEqual(w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "csv", cell: "A3" })).cells, []);
});

test("R52: a formula's cached value is the file's statement and nothing is recalculated", () => {
  const cells = [cellOf("Budget", "A1", "2"), cellOf("Budget", "A2", "3"),
                 cellOf("Budget", "A3", "999", { formula: "SUM(A1:A2)", cached: "999" })];
  const { w, cite } = setup({ cells: { Budget: cells }, metadata: null }, { captureFormat: "xlsx",
    containerExtent: { container: "xlsx", levels: ["sheets"], sheets: [{ name: "Budget", rows: 1048576, cols: 16384 }] } });
  const got = w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "Budget", cell: "A3" }));
  assert.deepEqual(got.cells, [cells[2]], "the cached 999 stands, never 5");
  assert.equal(w.content.passageText(cite({ kind: "sheet-cell", sheet: "Budget", cell: "A3" })), "999");
});

test("R52: null with its reason for a row not held, stale, of another kind, or whose reading holds no typed cells for that sheet — never an empty list", async () => {
  const held = await csvCells("a,b\n1,2\n");
  const { w, a, cite, quiet } = setup(held);
  const no = (got, reason) => { assert.equal(got.cells, null); assert.equal(got.reason, reason); assert.equal(typeof got.why, "string"); };
  no(quiet(() => w.content.cellsAt("f".repeat(64))), "not_held");
  no(w.content.cellsAt(null), "not_held");
  no(w.content.cellsAt(cite({ kind: "document" })), "not_a_sheet_extent");
  /* A sheet the reading holds no cells for (here: no such map entry) is not read, never []. */
  no(w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "Other", cell: "A1" })), "cells_not_held");
  /* Over the reader's guard the sheet's cells are null: not read. */
  const { w: w2, cite: c2 } = setup({ cells: { csv: null }, metadata: null });
  no(w2.content.cellsAt(c2({ kind: "sheet-range", sheet: "csv", range: "A1:B2" })), "cells_not_held");
  /* A reading that holds no cells at all. */
  const { w: w3, cite: c3 } = setup({});
  no(w3.content.cellsAt(c3({ kind: "sheet-cell", sheet: "csv", cell: "A1" })), "cells_not_held");
  /* Stale (R22): the cells held now are the newer reading's. */
  const id = cite({ kind: "sheet-cell", sheet: "csv", cell: "A2" });
  assert.equal(w.content.cellsAt(id).cells.length, 1, "control: read before the re-read");
  w.content.markStale(a.sha, [{ step: "layer", tier: 1, container: "csv", cap: null }]);
  no(w.content.cellsAt(id), "stale");
});

test("R46: a sheet-cell row's text is its typed cell's stored value; a sheet-range's the values inside it, one per line; a cell not held is null", async () => {
  const held = await csvCells("a,b,c\n1,0.10,x\n,,z\n");
  const { w, a, cite, quiet } = setup(held);
  /* The sheet's indexed unit (tab-joined rows) is the fallback only where no typed cells are held; here they are. */
  w.ex.units[a.sha] = { units: [{ extent: JSON.stringify({ kind: "sheet-range", range: "A1:C3", sheet: "csv" }), ref: "csv!A1:C3",
                                  text: "a\tb\tc\n1\t0.10\tx\nz", truncated: false }], state: "whole" };
  const b2 = cite({ kind: "sheet-cell", sheet: "csv", cell: "B2" });
  assert.equal(quiet(() => w.content.passageText(b2)), "0.10");
  assert.equal(w.content.passageText(cite({ kind: "sheet-range", sheet: "csv", range: "A1:C3" })), "a\nb\nc\n1\n0.10\nx\nz");
  assert.equal(w.content.passageText(cite({ kind: "sheet-range", sheet: "csv", range: "B2:C3" })), "0.10\nx\nz");
  /* A cell the reading does not hold: null, never "". */
  assert.equal(w.content.passageText(cite({ kind: "sheet-cell", sheet: "csv", cell: "A3" })), null);
  /* A held cell whose value its reader left undetermined: null. */
  const { w: w2, cite: c2 } = setup({ cells: { csv: [cellOf("csv", "A1", null, { type: "text" })] } });
  assert.equal(w2.content.passageText(c2({ kind: "sheet-cell", sheet: "csv", cell: "A1" })), null);
  assert.equal(w2.content.passageText(c2({ kind: "sheet-range", sheet: "csv", range: "A1:A1" })), null);
  /* Negative control: without typed cells, the indexed unit at exactly the extent is the text (the units rule). */
  const { w: w3, a: a3, cite: c3 } = setup({});
  w3.ex.units[a3.sha] = w.ex.units[a.sha];
  assert.equal(w3.content.passageText(c3({ kind: "sheet-range", sheet: "csv", range: "A1:C3" })), "a\tb\tc\n1\t0.10\tx\nz");
  assert.equal(w3.content.passageText(c3({ kind: "sheet-cell", sheet: "csv", cell: "B2" })), null);
});

test("R53: officeMetadataOf answers the metadata an office capture's reading holds, as the file writes it, or null with the reason", () => {
  const meta = { author: "A. Clerk", lastModifiedBy: "B. Editor", created: "2026-01-02T03:04:05Z", modified: "2026-02-03T04:05:06Z",
                 source: "docProps/core.xml" };
  const docx = (reading, captureFormat = "docx") => {
    const w = world(); const a = w.cap("d");
    w.doc(DOC, [a]); w.read(a.sha, { chain: LAYER, captureFormat, reading });
    return { w, a };
  };
  {
    const { w, a } = docx({ metadata: meta });
    const before = w.snapshot();
    const got = w.content.officeMetadataOf(a.sha);
    assert.deepEqual(w.snapshot(), before, "writes nothing");
    assert.deepEqual(got, { capture_sha: a.sha, metadata: meta }, "W3CDTF strings unchanged");
  }
  {
    /* A field the file does not write is null, never invented. */
    const { w, a } = docx({ metadata: { author: "A. Clerk", lastModifiedBy: null, created: null, modified: null, source: "docProps/core.xml" } });
    assert.deepEqual(w.content.officeMetadataOf(a.sha).metadata,
      { author: "A. Clerk", lastModifiedBy: null, created: null, modified: null, source: "docProps/core.xml" });
  }
  const no = (got, reason) => { assert.equal(got.metadata, null); assert.equal(got.reason, reason); assert.equal(typeof got.why, "string"); };
  { const { w } = docx({ metadata: meta }); no(w.content.officeMetadataOf("e".repeat(64)), "never_read"); no(w.content.officeMetadataOf(null), "never_read"); }
  { const { w, a } = docx({ metadata: null }); no(w.content.officeMetadataOf(a.sha), "none_held"); }
  { const { w, a } = docx({}); no(w.content.officeMetadataOf(a.sha), "none_held"); }
  { const { w, a } = docx({}, "pdf"); no(w.content.officeMetadataOf(a.sha), "not_office"); }
});

test("R31: a sheet passage is graded across versions on its typed cells where both readings hold them, and on the units otherwise", async () => {
  const run = async (oldText, newText, { newCells = true } = {}) => {
    const w = world();
    const a = w.cap("a", `old ${oldText}`), b = w.cap("b", `new ${newText}`);
    const unit = (text) => [{ extent: JSON.stringify({ kind: "sheet-range", range: "A1:C3", sheet: "csv" }), ref: "csv!A1:C3",
                              text, truncated: false }];
    w.doc(DOC, [a]);
    w.read(a.sha, { chain: LAYER, captureFormat: "csv", containerExtent: GRID, reading: await csvCells(oldText) });
    w.ex.units[a.sha] = { units: unit(oldText.replace(/,/g, "\t").trim()), state: "whole" };
    w.prov.recordReceipt({ address: "https://ex.org/t.csv", addressNorm: "ex.org/t.csv", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
    w.doc(NEW, [b]);
    w.read(b.sha, { chain: LAYER, captureFormat: "csv", containerExtent: GRID, reading: newCells ? await csvCells(newText) : {} });
    w.ex.units[b.sha] = { units: unit(newText.replace(/,/g, "\t").trim()), state: "whole" };
    w.prov.recordReceipt({ address: "https://ex.org/t.csv", addressNorm: "ex.org/t.csv", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
    const id = (e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id;
    return (e) => w.content.passageNotice({ contentId: id(e), viewer: V("bo") }).candidates[0];
  };
  const same = await run("a,b,c\n1,0.10,x\n,,z\n", "a,b,c\n1,0.10,x\n,,z\n");
  assert.deepEqual([same({ kind: "sheet-cell", sheet: "csv", cell: "B2" }).grade,
                    same({ kind: "sheet-range", sheet: "csv", range: "A1:C3" }).grade], ["A", "A"], "unchanged cells are unaffected");
  const edited = await run("a,b,c\n1,0.10,x\n,,z\n", "a,b,c\n1,0.25,x\n,,z\n");
  assert.equal(edited({ kind: "sheet-cell", sheet: "csv", cell: "B2" }).grade, "NOT_FOUND");
  assert.equal(edited({ kind: "sheet-cell", sheet: "csv", cell: "C2" }).grade, "A", "a cell the edit did not touch");
  assert.equal(edited({ kind: "sheet-range", sheet: "csv", range: "A1:C3" }).affects, "affected");
  const cleared = await run("a,b,c\n1,0.10,x\n,,z\n", "a,b,c\n1,,x\n,,z\n");
  assert.equal(cleared({ kind: "sheet-cell", sheet: "csv", cell: "B2" }).grade, "NOT_FOUND", "a cleared cell in a held sheet");
  /* Negative control: the newer reading holds no typed cells, so both sides are graded on the units (never cells
     against a unit's tab-joined rows): the whole unchanged range is still A. */
  const unitsOnly = await run("a,b,c\n1,0.10,x\n,,z\n", "a,b,c\n1,0.10,x\n,,z\n", { newCells: false });
  assert.equal(unitsOnly({ kind: "sheet-range", sheet: "csv", range: "A1:C3" }).grade, "A");
});
