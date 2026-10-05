/* R30 (typed cells) and R31 (office metadata in text()), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import * as F from "./fixtures.mjs";
import { docxEntry } from "../../../src/docx.mjs";
import { pptxEntry } from "../../../src/pptx.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { csvEntry, CSV_SHEET_NAME, MEASURED_CSV_TEXT_BOUND_BYTES } from "../../../src/csv.mjs";

const NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
const ref = (sheet, cell) => ({ kind: "sheet-cell", ref: `${sheet}!${cell}`, sheet, cell });
const cellOf = (sheet, cell, value, type, declared, cached = null, formula = null) =>
  ({ source: ref(sheet, cell), value, type, declared, cached, formula });

test("R30 xlsx cells: every cell holding a value or formula, typed only from `t`, lexical value kept, formula beside its cached value, row then column order", async () => {
  /* Written out of order on purpose (B2 before A2, row 3 before row 1), with
     an empty cell, a styled number (s="1", which may be a date format: never
     inferred), a formula with no cached value, and every declared type. */
  const xml = `<?xml version="1.0"?><worksheet ${NS}><sheetData>`
    + `<row r="3"><c r="A3" t="str"><f>A1&amp;"!"</f><v>zero!</v></c><c r="B3"><f>SUM(B1:B2)</f></c></row>`
    + `<row r="1"><c r="C1" t="b"><v>1</v></c><c r="A1" t="s"><v>0</v></c><c r="B1"><v>0.1</v></c><c r="D1" t="n"><v>1E+21</v></c></row>`
    + `<row r="2"><c r="B2" s="1"><v>45200</v></c><c r="A2" t="d"><v>2026-10-05T00:00:00</v></c><c r="C2" t="inlineStr"><is><t>inline</t></is></c><c r="D2" t="e"><v>#DIV/0!</v></c><c r="E2" s="3"/></row>`
    + `</sheetData></worksheet>`;
  const b = F.xlsx({ sheets: [{ name: "S", xml }], sharedStrings: F.sst(["zero"]) });
  const t = await xlsxEntry.text(b);
  assert.deepEqual(t.sheets[0].cells, [
    cellOf("S", "A1", "zero", "text", "s"),
    cellOf("S", "B1", "0.1", "number", null),
    cellOf("S", "C1", "1", "boolean", "b"),
    cellOf("S", "D1", "1E+21", "number", "n"),
    cellOf("S", "A2", "2026-10-05T00:00:00", "date", "d"),
    cellOf("S", "B2", "45200", "number", null),
    cellOf("S", "C2", "inline", "text", "inlineStr"),
    cellOf("S", "D2", "#DIV/0!", "error", "e"),
    cellOf("S", "A3", "zero!", "text", "str", "zero!", 'A1&"!"'),
    cellOf("S", "B3", null, "number", null, null, "SUM(B1:B2)"),
  ]);
  /* The pair R10 holds is the same pair. */
  const s = await xlsxEntry.structure(b);
  const formulas = s.evidentiary.items.filter((i) => i.kind === "formula");
  for (const f of formulas) {
    const c = t.sheets[0].cells.find((x) => x.source.cell === f.source.cell);
    assert.deepEqual([c.formula, c.cached], [f.formula, f.value]);
  }
  assert.equal(formulas.length, t.sheets[0].cells.filter((c) => c.formula != null).length);
  /* The text stream is untouched by the typed cells: still file order. */
  assert.equal(t.sheets[0].text, "zero!\nTRUE\tzero\t0.1\t1E+21\n45200\t2026-10-05T00:00:00\tinline\t#DIV/0!");
});

test("R30 xlsx cells: an unresolved shared string keeps its entry with value null and stays undetermined; an undeclared type token is named; a cell with no address has source null; an empty sheet has []", async () => {
  const xml = `<?xml version="1.0"?><worksheet ${NS}><sheetData>`
    + `<row r="1"><c r="A1" t="s"><v>9</v></c><c r="B1" t="zz"><v>q</v></c><c t="inlineStr"><is><t>loose</t></is></c></row>`
    + `</sheetData></worksheet>`;
  const t = await xlsxEntry.text(F.xlsx({ sheets: [{ name: "S", xml }, { name: "E", data: {} }], sharedStrings: F.sst(["only"]) }));
  assert.deepEqual(t.sheets[0].cells, [
    cellOf("S", "A1", null, "text", "s"),
    cellOf("S", "B1", "q", null, "zz"),
    { source: null, value: "loose", type: "text", declared: "inlineStr", cached: null, formula: null },
  ]);
  assert.deepEqual(t.sheets[0].undetermined, [
    { sheet: 0, cell: "A1", reason: "shared_string_index_out_of_range" },
    { sheet: 0, cell: "B1", reason: "cell_type_unknown" },
  ]);
  assert.deepEqual(t.sheets[1].cells, []);
  const unread = await xlsxEntry.text(F.xlsx({ sheets: [{ name: "S", data: {}, cd: F.CORRUPT }] }));
  assert.equal(unread.sheets[0].cells, null, "a sheet not walked has null cells, never []");
});

test("R30 over the size guard: no sheet is walked, so no cells are given (sheets [] for xlsx and csv)", async () => {
  const x = await xlsxEntry.text(F.xlsx({ sheets: [{ name: "S", data: { rows: [{ r: 1, cells: [{ r: "A1", v: "1" }] }] }, cd: F.OVER }] }));
  assert.equal(x.document, null);
  assert.deepEqual(x.sheets, []);
  const big = new Uint8Array(MEASURED_CSV_TEXT_BOUND_BYTES + 2).fill(0x61);
  const c = await csvEntry.text(big);
  assert.equal(c.document, null);
  assert.deepEqual(c.sheets, []);
});

test("R30 csv cells: one per non-empty field, every one text with no declared type, the decoded text as value, row then column; an unreadable field keeps its entry with value null", async () => {
  const t = await csvEntry.text(F.enc('a,0.10\r\n,"x, y"\r\nlast,\r\n'));
  assert.deepEqual(t.sheets[0].cells, [
    cellOf(CSV_SHEET_NAME, "A1", "a", "text", null),
    cellOf(CSV_SHEET_NAME, "B1", "0.10", "text", null),
    cellOf(CSV_SHEET_NAME, "B2", "x, y", "text", null),
    cellOf(CSV_SHEET_NAME, "A3", "last", "text", null),
  ]);
  const u = await csvEntry.text(new Uint8Array([0x61, 0x2c, 0x96, 0x0a, 0x62, 0x2c, 0x63, 0x0a]));
  assert.equal(u.dialect.encoding, null);
  assert.deepEqual(u.sheets[0].cells, [
    cellOf(CSV_SHEET_NAME, "A1", "a", "text", null),
    cellOf(CSV_SHEET_NAME, "B1", null, "text", null),
    cellOf(CSV_SHEET_NAME, "A2", "b", "text", null),
    cellOf(CSV_SHEET_NAME, "B2", "c", "text", null),
  ]);
  assert.deepEqual(u.undetermined, [{ sheet: 0, cell: "B1", reason: "encoding_undetermined" }]);
});

const CORE = { creator: "A. Clerk", lastModifiedBy: "B. Editor", revision: "4",
  created: "2026-01-02T03:04:05Z", modified: "2026-02-03T04:05:06.7+08:00", title: "T" };
const build = {
  docx: (o) => F.docx(o),
  pptx: (o) => F.pptx(o),
  xlsx: (o) => F.xlsx(o),
};
const entries = { docx: docxEntry, pptx: pptxEntry, xlsx: xlsxEntry };

test("R31 docx, pptx and xlsx text() carry metadata: the core part's author, lastModifiedBy, created, modified as written, each null when absent", async () => {
  for (const [fmt, entry] of Object.entries(entries)) {
    const t = await entry.text(build[fmt]({ core: F.core(CORE) }));
    assert.deepEqual(t.metadata, { author: "A. Clerk", lastModifiedBy: "B. Editor",
      created: "2026-01-02T03:04:05Z", modified: "2026-02-03T04:05:06.7+08:00", source: "docProps/core.xml" }, fmt);
    /* the same values the core-properties item holds (R10) */
    const item = (await entry.structure(build[fmt]({ core: F.core(CORE) }))).evidentiary.items.find((i) => i.kind === "core-properties");
    assert.deepEqual([t.metadata.author, t.metadata.lastModifiedBy, t.metadata.created, t.metadata.modified],
      [item.creator, item.lastModifiedBy, item.created, item.modified], fmt);
    const sparse = await entry.text(build[fmt]({ core: F.core({ title: "only" }) }));
    assert.deepEqual(sparse.metadata, { author: null, lastModifiedBy: null, created: null, modified: null, source: "docProps/core.xml" }, fmt);
  }
});

test("R31 metadata is null with no readable core part: absent (no marker) or unreadable (its reason in undetermined); given over the size guard too; csv always null", async () => {
  for (const [fmt, entry] of Object.entries(entries)) {
    const none = await entry.text(build[fmt]({}));
    assert.equal(none.metadata, null, fmt);
    assert.ok(!none.undetermined.some((u) => u.part === "docProps/core.xml"), fmt);
    const bad = await entry.text(build[fmt]({ extra: [{ name: "docProps/core.xml", data: F.core(CORE), cd: F.CORRUPT }] }));
    assert.equal(bad.metadata, null, fmt);
    assert.deepEqual(bad.undetermined.filter((u) => u.part === "docProps/core.xml"),
      [{ reason: "metadata_unreadable", part: "docProps/core.xml", why: "crc_mismatch" }], fmt);
    assert.equal(bad.counts.undetermined, bad.undetermined.length, fmt);
    const notCore = await entry.text(build[fmt]({ core: "<x/>" }));
    assert.deepEqual(notCore.undetermined.filter((u) => u.part === "docProps/core.xml"),
      [{ reason: "metadata_unreadable", part: "docProps/core.xml", why: "core_properties_unparseable" }], fmt);
  }
  const over = {
    docx: F.docx({ core: F.core(CORE), mainCd: F.OVER }),
    pptx: F.pptx({ core: F.core(CORE), slides: [{ file: "slide1.xml", texts: ["x"], cd: F.OVER }] }),
    xlsx: F.xlsx({ core: F.core(CORE), sheets: [{ name: "S", data: {}, cd: F.OVER }] }),
  };
  for (const [fmt, entry] of Object.entries(entries)) {
    const t = await entry.text(over[fmt]);
    assert.equal(t.document, null, fmt);
    assert.equal(t.metadata.author, "A. Clerk", fmt);
  }
  assert.equal((await csvEntry.text(F.enc("a,b\n1,2\n"))).metadata, null);
});
