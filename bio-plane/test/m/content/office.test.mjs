/* content: what an office capture's reading states about itself (R52 `cellsAt`, R53 `officeMetadataOf`), R46's sheet
   arm (`passageText` over typed cells) and R31's grade of a sheet passage across versions, over REAL readings (B3,
   K1557): a workbook assembled here, read by the real format entry through the real `reading-pipeline.read` (its R28
   carries `cells` and `metadata`), and handed to content as extraction's `readingOf` answers the persisted reading (its
   R19, R30; `./realread.mjs`). A hand-stated reading stands only for what the pipeline no longer writes: a reading
   stored before R28 (no `cells`, no `metadata`) and a sheet over its reader's guard (`cells` null). Reads only: every
   table is byte-identical across each call. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { xlsx, readReal, readingFacts } from "./realread.mjs";

const DOC = "INFO-2026-0001-a", NEW = "INFO-2026-0002-b";
const XLSX = { format: "xlsx", ct: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
const CORE = { creator: "A. Clerk", lastModifiedBy: "B. Editor", created: "2026-01-02T03:04:05Z", modified: "2026-02-03T04:05:06Z" };

/** A budget workbook: a shared-string label column, a stored decimal, a formula whose cached value is the file's own
 *  (999, not the 0.30 a recalculation would give), an empty cell inside the used range, and a second sheet. */
const budget = (b1 = "0.10", { core = CORE } = {}) => xlsx({
  sheets: [
    { name: "Budget", rows: [[{ r: "A1", t: "s", v: 0 }, { r: "B1", v: b1 }],
                             [{ r: "A2", t: "s", v: 1 }, { r: "B2", v: "0.20" }],
                             [{ r: "A3", t: "s", v: 2 }, { r: "B3", f: "B1+B2", v: "999" }],
                             [{ r: "B4", v: "7" }]] },
    { name: "Notes", rows: [[{ r: "A1", t: "s", v: 3 }]] },
  ],
  shared: ["Parks", "Library", "Total", "unaudited"], core,
});

/** A world holding capture `bytes` of DOC, read through the real pipeline; the reading's units indexed as written. */
async function real(bytes, { id = DOC, w = world(), fmt = XLSX } = {}) {
  const out = await readReal(bytes, fmt);
  const cap = { path: `snapshots/${out.digest.slice(0, 8)}.bin`, text: `capture ${out.digest}`, sha: out.digest };
  w.doc(id, [cap]);
  w.ex.readings[cap.sha] = readingFacts(out.reading, fmt.format);
  w.ex.units[cap.sha] = { units: (out.text_units || []).map((u) => ({ extent: u.extent, ref: `unit ${u.seq}`, text: u.text,
                                                                     truncated: !!u.truncated })), state: "whole" };
  const cite = (extent) => {
    const m = w.content.mint({ bundleId: id, captureSha: cap.sha, extent, mintedBy: V("bo") });
    assert.equal(m.ok, true, JSON.stringify(m));
    return m.content_id;
  };
  const quiet = (fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "writes nothing"); return r; };
  return { w, sha: cap.sha, reading: out.reading, cite, quiet };
}

test("R52: cellsAt answers a sheet-cell or sheet-range row's typed cells inside its extent, field for field as the reader states them, in row then column order", async () => {
  const { w, reading, cite, quiet } = await real(budget());
  const all = reading.cells.Budget;
  assert.ok(Array.isArray(all) && all.length === 7, "control: the real reading holds the sheet's typed cells");
  const rid = cite({ kind: "sheet-range", sheet: "Budget", range: "B1:B4" });
  const r = quiet(() => w.content.cellsAt(rid));
  assert.deepEqual(r.cells, all.filter((c) => c.source.cell.startsWith("B")), "field for field, as the reader states them");
  assert.deepEqual(r.cells.map((c) => c.source.cell), ["B1", "B2", "B3", "B4"]);
  assert.equal(r.extent_kind, "sheet-range");
  /* The stored lexical value, never re-rendered through a float; a shared string resolved by the reader. */
  const b1 = w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "Budget", cell: "B1" })).cells;
  assert.deepEqual([b1.length, b1[0].value, b1[0].type], [1, "0.10", "number"]);
  assert.equal(w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "Budget", cell: "A2" })).cells[0].value, "Library");
  /* A range spelled bottom-right first names the same cells, in the same order; a block reads row then column. */
  assert.deepEqual(w.content.cellsAt(cite({ kind: "sheet-range", sheet: "Budget", range: "$B$4:b1" })).cells, r.cells);
  assert.deepEqual(w.content.cellsAt(cite({ kind: "sheet-range", sheet: "Budget", range: "A1:B2" })).cells.map((c) => c.source.cell),
                   ["A1", "B1", "A2", "B2"]);
  /* An empty cell inside a read sheet is a measured empty list, not undetermined; another sheet reads its own cells. */
  assert.deepEqual(w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "Budget", cell: "A4" })).cells, []);
  assert.equal(w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "Notes", cell: "A1" })).cells[0].value, "unaudited");
});

test("R52: a formula's cached value is the file's statement and nothing is recalculated", async () => {
  const { w, cite } = await real(budget());
  const got = w.content.cellsAt(cite({ kind: "sheet-cell", sheet: "Budget", cell: "B3" })).cells;
  assert.deepEqual([got[0].formula, got[0].cached, got[0].value], ["B1+B2", "999", "999"], "the cached 999 stands, never 0.30");
  assert.equal(w.content.passageText(cite({ kind: "sheet-cell", sheet: "Budget", cell: "B3" })), "999");
});

test("R52: null with its reason for a row not held, stale, of another kind, or whose reading holds no typed cells for that sheet — never an empty list", async () => {
  const no = (got, reason) => { assert.equal(got.cells, null); assert.equal(got.reason, reason); assert.equal(typeof got.why, "string"); };
  const { w, sha, reading, cite } = await real(budget());
  no(w.content.cellsAt("f".repeat(64)), "not_held");
  no(w.content.cellsAt(null), "not_held");
  no(w.content.cellsAt(cite({ kind: "document" })), "not_a_sheet_extent");
  /* Stale (R22): the cells held now are the newer reading's. */
  const id = cite({ kind: "sheet-cell", sheet: "Budget", cell: "B2" });
  assert.equal(w.content.cellsAt(id).cells.length, 1, "control: read before the re-read");
  w.content.markStale(sha, [{ step: "layer", tier: 1, container: "xlsx", cap: null, mark: "re-read" }]);
  no(w.content.cellsAt(id), "stale");
  /* A sheet over its reader's guard (cells null), and a reading stored before R28 (no cells at all): not read, never []. */
  for (const stored of [{ ...reading, cells: { ...reading.cells, Budget: null } }, (({ cells, ...rest }) => rest)(reading)]) {
    const v = await real(budget("0.11"), { id: "INFO-2026-0003-c" });
    v.w.ex.readings[v.sha] = readingFacts(stored, "xlsx");
    no(v.w.content.cellsAt(v.cite({ kind: "sheet-range", sheet: "Budget", range: "A1:B2" })), "cells_not_held");
  }
});

test("R46: a sheet-cell row's text is its typed cell's stored value; a sheet-range's the values inside it, one per line; a cell not held is null", async () => {
  const { w, cite, quiet } = await real(budget());
  const b1 = cite({ kind: "sheet-cell", sheet: "Budget", cell: "B1" });
  assert.equal(quiet(() => w.content.passageText(b1)), "0.10");
  assert.equal(w.content.passageText(cite({ kind: "sheet-range", sheet: "Budget", range: "A1:B4" })),
               "Parks\n0.10\nLibrary\n0.20\nTotal\n999\n7");
  /* The whole used range: the cells, one per line, never the index unit's tab-joined rows. */
  assert.equal(w.content.passageText(cite({ kind: "sheet-range", sheet: "Notes", range: "A1:A1" })), "unaudited");
  /* A cell the reading does not hold: null, never "". */
  assert.equal(w.content.passageText(cite({ kind: "sheet-cell", sheet: "Budget", cell: "A4" })), null);
  /* Negative control: a reading stored before R28 holds no cells, and the indexed unit at exactly the extent is the
     text (the units rule, unchanged): the sheet unit's tab-joined rows, and no text for a single cell. */
  const v = await real(budget());
  const { cells, ...before } = v.reading;
  v.w.ex.readings[v.sha] = readingFacts(before, "xlsx");
  assert.equal(v.w.content.passageText(v.cite({ kind: "sheet-range", sheet: "Budget", range: "A1:B4" })),
               "Parks\t0.10\nLibrary\t0.20\nTotal\t999\n7");
  assert.equal(v.w.content.passageText(v.cite({ kind: "sheet-cell", sheet: "Budget", cell: "B1" })), null);
});

test("R46: a held cell whose value its reader left undetermined has no text", async () => {
  /* A shared-string index the table does not hold: the reader keeps the cell with value null (office-readers R30). */
  const bytes = xlsx({ sheets: [{ name: "S", rows: [[{ r: "A1", t: "s", v: 9 }, { r: "B1", v: "1" }]] }], shared: ["only"] });
  const { w, reading, cite } = await real(bytes);
  assert.equal(reading.cells.S.find((c) => c.source.cell === "A1").value, null, "control: the reader left A1's value undetermined");
  assert.equal(w.content.passageText(cite({ kind: "sheet-cell", sheet: "S", cell: "A1" })), null);
  assert.equal(w.content.passageText(cite({ kind: "sheet-range", sheet: "S", range: "A1:B1" })), null);
  assert.equal(w.content.passageText(cite({ kind: "sheet-cell", sheet: "S", cell: "B1" })), "1");
});

test("R53: officeMetadataOf answers the metadata an office capture's reading holds, as the file writes it, or null with the reason", async () => {
  const no = (got, reason) => { assert.equal(got.metadata, null); assert.equal(got.reason, reason); assert.equal(typeof got.why, "string"); };
  {
    const { w, sha, quiet } = await real(budget());
    const got = quiet(() => w.content.officeMetadataOf(sha));
    assert.deepEqual(got, { capture_sha: sha, metadata: { author: "A. Clerk", lastModifiedBy: "B. Editor",
      created: "2026-01-02T03:04:05Z", modified: "2026-02-03T04:05:06Z", source: "docProps/core.xml" } }, "W3CDTF strings unchanged");
    no(w.content.officeMetadataOf("e".repeat(64)), "never_read");
    no(w.content.officeMetadataOf(null), "never_read");
  }
  {
    /* An office file with no core-properties part: its reading holds none. */
    const { w, sha, reading } = await real(budget("0.10", { core: null }));
    assert.equal(reading.metadata, null, "control");
    no(w.content.officeMetadataOf(sha), "none_held");
  }
  {
    /* A CSV walks parts in the format registry (R42's office), and its format carries no metadata: none held. */
    const { w, sha, reading } = await real("name,amount\nAna,0.1\n", { fmt: { format: "csv", ct: "text/csv" } });
    assert.equal(reading.metadata, null, "control");
    no(w.content.officeMetadataOf(sha), "none_held");
  }
  {
    /* A web page is not an office document. */
    const { w, sha, reading } = await real("<html><body><p>The council met.</p></body></html>",
                                           { fmt: { format: "html", ct: "text/html", fromText: true } });
    assert.equal(reading.metadata, null, "control");
    no(w.content.officeMetadataOf(sha), "not_office");
  }
});

test("R31: a sheet passage is graded across versions on its typed cells where both readings hold them, and on the units otherwise", async () => {
  const versions = async (newer, { newCells = true } = {}) => {
    const w = world();
    const a = await real(budget(), { w });
    const b = await real(newer, { w, id: NEW });
    if (!newCells) { const { cells, ...rest } = b.reading; w.ex.readings[b.sha] = readingFacts(rest, "xlsx"); }
    w.prov.recordReceipt({ address: "https://ex.org/b.xlsx", addressNorm: "ex.org/b.xlsx", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
    w.prov.recordReceipt({ address: "https://ex.org/b.xlsx", addressNorm: "ex.org/b.xlsx", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
    return (extent) => w.content.passageNotice({ contentId: a.cite(extent), viewer: V("bo") }).candidates[0];
  };
  const same = await versions(budget("0.10", { core: { ...CORE, modified: "2026-03-01T00:00:00Z" } }));
  assert.deepEqual([same({ kind: "sheet-cell", sheet: "Budget", cell: "B1" }).grade,
                    same({ kind: "sheet-range", sheet: "Budget", range: "A1:B4" }).grade], ["A", "A"], "unchanged cells are unaffected");
  const edited = await versions(budget("0.15"));
  assert.equal(edited({ kind: "sheet-cell", sheet: "Budget", cell: "B1" }).grade, "NOT_FOUND");
  assert.equal(edited({ kind: "sheet-cell", sheet: "Budget", cell: "B2" }).grade, "A", "a cell the edit did not touch");
  assert.equal(edited({ kind: "sheet-range", sheet: "Budget", range: "A1:B4" }).affects, "affected");
  const cleared = await versions(xlsx({ sheets: [{ name: "Budget", rows: [[{ r: "A1", t: "s", v: 0 }], [{ r: "B2", v: "0.20" }]] }],
                                        shared: ["Parks"] }));
  assert.equal(cleared({ kind: "sheet-cell", sheet: "Budget", cell: "B1" }).grade, "NOT_FOUND", "a cleared cell in a held sheet");
  /* Negative control: the newer reading holds no typed cells, so both sides are graded on the units (never cells
     against a unit's tab-joined rows): the whole unchanged sheet is still A. */
  const unitsOnly = await versions(budget("0.10", { core: { ...CORE, modified: "2026-03-01T00:00:00Z" } }), { newCells: false });
  assert.equal(unitsOnly({ kind: "sheet-range", sheet: "Budget", range: "A1:B4" }).grade, "A");
});
