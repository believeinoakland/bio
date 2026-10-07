/* office-readers, N724 (T36-3; K1972): a .docx table's `cells`, held as R30
 * holds a sheet's (R11's docx arm), each addressed by its `doc-table`
 * reference with its cell (R16). Driven through docxEntry.text() on packages
 * built by ./fixtures.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { docxEntry, docTableRef } from "../../../src/docx.mjs";
import * as F from "./fixtures.mjs";

const tc = (table, cell, value) => ({ source: docTableRef(table, cell), value, type: "text", declared: null, cached: null, formula: null });
const grid = (n) => `<w:tblGrid>${"<w:gridCol/>".repeat(n)}</w:tblGrid>`;
const cell = (pr, ...paras) => `<w:tc>${pr ? `<w:tcPr>${pr}</w:tcPr>` : ""}${paras.length ? paras.join("") : "<w:p/>"}</w:tc>`;
const txt = (t) => F.wp(F.wr(t));
const row = (...cells) => `<w:tr>${cells.join("")}</w:tr>`;
const tbl = (cols, ...rows) => `<w:tbl>${grid(cols)}${rows.join("")}</w:tbl>`;
const tables = async (body) => (await docxEntry.text(F.docx({ body }))).tables;
const MC = 'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"';

test("R11 R16 docx table cells: one per cell holding text, in row then column order, addressed by doc-table with its A1 cell, every one text with nothing declared, cached or calculated", async () => {
  /* a date and an amount, as a disclosure table carries them: held as written, no type inferred */
  const body = txt("intro") + tbl(3,
    row(cell("", txt("Date")), cell("", txt("Payee")), cell("", txt("Amount"))),
    row(cell("", txt("2026-03-14")), cell("", txt("Acme, Inc.")), cell("", txt("$1,250.00"))),
    row(cell("", "<w:p/>"), cell("", txt("blank date")), cell("", F.wp())),
  );
  assert.deepEqual(await tables(body), [{ table: 0, ref: "table 1", rows: 3, cols: 3, cells: [
    tc(0, "A1", "Date"), tc(0, "B1", "Payee"), tc(0, "C1", "Amount"),
    tc(0, "A2", "2026-03-14"), tc(0, "B2", "Acme, Inc."), tc(0, "C2", "$1,250.00"),
    tc(0, "B3", "blank date"),
  ] }]);
});

test("R11 docx table cells: a cell's value is its text as document carries it — non-empty paragraphs newline-joined, w:ins in, w:delText never, tabs and breaks kept", async () => {
  const body = tbl(1, row(cell("",
    F.wp(F.wr("first "), '<w:ins w:author="a">' + F.wr("added") + "</w:ins>", '<w:del><w:r><w:delText>gone</w:delText></w:r></w:del>'),
    "<w:p/>",
    F.wp("<w:r><w:t>a</w:t><w:tab/><w:t>b</w:t><w:br/><w:t>c</w:t></w:r>"),
    txt("&amp;&lt;"),
  )));
  const t = await docxEntry.text(F.docx({ body }));
  assert.deepEqual(t.tables[0].cells, [tc(0, "A1", "first added\na\tb\nc\n&<")]);
  assert.equal(t.document, t.tables[0].cells[0].value, "the same text, read once");
  assert.ok(!t.tables[0].cells[0].value.includes("gone"));
});

test("R11 docx table cells: a merged cell is one entry at its first grid position — gridSpan moves the next cell, gridBefore starts the row, vMerge and hMerge continuations join the cell they continue", async () => {
  const body = tbl(4,
    row(cell('<w:vMerge w:val="restart"/>', txt("tall")), cell('<w:gridSpan w:val="2"/>', txt("wide")), cell("", txt("D1"))),
    row(cell("<w:vMerge/>", "<w:p/>"), cell("", txt("B2")), cell('<w:hMerge w:val="restart"/>', txt("h")), cell("<w:hMerge/>", txt("h more"))),
    `<w:tr><w:trPr><w:gridBefore w:val="2"/></w:trPr>${cell("", txt("C3"))}${cell("", txt("D3"))}</w:tr>`,
    row(cell('<w:vMerge w:val="continue"/>', txt("tall tail")), cell("", txt("B4"))),
    row(cell("", txt("A5")), cell('<w:vMerge w:val="continue"/>', txt("orphan"))),
  );
  assert.deepEqual((await tables(body))[0].cells, [
    tc(0, "A1", "tall\ntall tail"), tc(0, "B1", "wide"), tc(0, "D1", "D1"),
    tc(0, "B2", "B2"), tc(0, "C2", "h\nh more"),
    tc(0, "C3", "C3"), tc(0, "D3", "D3"),
    tc(0, "B4", "B4"),
    tc(0, "A5", "A5"), tc(0, "B5", "orphan"),
  ], "a continuation with no restart above it stands as its own cell");
});

test("R11 R16 docx table cells: a nested table's cells are its own table's, numbered as it opens; the outer cell keeps only its own paragraphs, before and after the nested table", async () => {
  const inner = tbl(2, row(cell("", txt("i1")), cell("", txt("i2"))));
  const body = tbl(2,
    row(cell("", txt("o1")), cell("", txt("before"), inner, txt("after"))),
    row(cell("", txt("o2"))),
  ) + tbl(1, row(cell("", txt("next"))));
  assert.deepEqual(await tables(body), [
    { table: 0, ref: "table 1", rows: 2, cols: 2, cells: [tc(0, "A1", "o1"), tc(0, "B1", "before\nafter"), tc(0, "A2", "o2")] },
    { table: 1, ref: "table 2", rows: 1, cols: 2, cells: [tc(1, "A1", "i1"), tc(1, "B1", "i2")] },
    { table: 2, ref: "table 3", rows: 1, cols: 1, cells: [tc(2, "A1", "next")] },
  ]);
});

test("R11 docx table cells: a text box in a cell is the cell's text; an mc:AlternateContent branch not read adds nothing to any cell", async () => {
  const ac = (c, f) => `<mc:AlternateContent ${MC}><mc:Choice Requires="wps">${c}</mc:Choice><mc:Fallback>${f}</mc:Fallback></mc:AlternateContent>`;
  const box = (t) => `<w:txbxContent>${txt(t)}</w:txbxContent>`;
  const body = tbl(2, row(
    cell("", F.wp(F.wr("anchor "), `<w:r>${ac(`<w:drawing>${box("boxed")}</w:drawing>`, `<w:pict>${box("vml copy")}</w:pict>`)}</w:r>`)),
    cell("", F.wp(`<w:r>${ac("<w:t>chosen</w:t>", "<w:t>fallback</w:t>")}</w:r>`)),
  ));
  assert.deepEqual((await tables(body))[0].cells, [tc(0, "A1", "anchor \nboxed"), tc(0, "B1", "chosen")]);
});

test("R11 docx table cells: every table paragraph's text is in exactly one cell, and none from outside a table", async () => {
  const body = txt("outside") + tbl(3,
    row(cell('<w:gridSpan w:val="2"/>', txt("x1"), txt("x2")), cell("", tbl(1, row(cell("", txt("deep")))), txt("y"))),
    row(cell("", txt("z")), cell("", "<w:p/>"), cell("<w:vMerge/>", txt("w"))),
  ) + txt("also outside");
  const t = await docxEntry.text(F.docx({ body }));
  const inCells = t.tables.flatMap((x) => x.cells.flatMap((c) => c.value.split("\n")));
  const tableTexts = t.paragraphs.map((p) => p.text).filter((s) => s && !s.includes("outside"));
  assert.deepEqual([...inCells].sort(), [...tableTexts].sort());
  for (const x of t.tables) for (const c of x.cells) {
    assert.deepEqual(Object.keys(c), ["source", "value", "type", "declared", "cached", "formula"]);
    assert.deepEqual(c.source, docTableRef(x.table, c.source.cell));
    assert.match(c.source.cell, /^[A-Z]+[1-9]\d*$/);
  }
});

test("R11 docx table cells: a table with no text has cells []; a body not read (over the guard, unreadable) has tables null, so no cells", async () => {
  assert.deepEqual(await tables(tbl(2, row(cell(""), "<w:tc/>"))), [{ table: 0, ref: "table 1", rows: 1, cols: 2, cells: [] }]);
  assert.equal((await docxEntry.text(F.docx({ body: tbl(1, row(cell("", txt("x")))), mainCd: F.OVER }))).tables, null);
  assert.equal((await docxEntry.text(F.docx({ body: tbl(1, row(cell("", txt("x")))), mainCd: F.CORRUPT }))).tables, null);
  /* a table the body never closed keeps the cells seen */
  const cut = F.wdoc(tbl(1, row(cell("", txt("seen")))).replace("</w:tbl>", "")).replace("</w:body></w:document>", "");
  assert.deepEqual((await docxEntry.text(F.docx({ document: cut }))).tables[0].cells, [tc(0, "A1", "seen")]);
});
