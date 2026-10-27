/* reading-pipeline R40 (every format, G14), R41 (a sheet in row blocks, G15) and R32 (an unclosed head, G14), at `read`'s
   interface over stored captures read through scripted format entries. A document of any format whose units pass the wire's
   bound is read whole in pieces by the same cursor as a text; nothing is cut. Each test names the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, CAPTURE_TEXT_UNIT_CAP, visibleTextOfHtml } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";
import { synthPdf } from "./bigpdf.mjs";

const BUDGET = 512 * 1024;
const readOf = (b, document, opts = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...opts });

async function allPieces(b, document, extra = {}) {
  const pieces = [];
  let cursor = null;
  for (let g = 0; g < 200; g++) {
    const out = await readOf(b, document, { unitsBudget: BUDGET, cursor, ...extra });
    pieces.push(out);
    if (out.more !== true) break;
    cursor = out.cursor;
  }
  return pieces;
}

const paragraph = (i) => `Paragraph ${i}: ` + "the council received the staff report and public comment on the item. ".repeat(3).trim();
const PARAS = Array.from({ length: 6000 }, (_, i) => ({ para: i, text: paragraph(i) }));
const wordEntry = { format: "t6doc", text: async () => ({ ok: true, document: PARAS.map((p) => p.text).join("\n"), paragraphs: PARAS,
  counts: { chars: 1, undetermined: 0 }, undetermined: [], container: "docx" }) };

test("R40: a 6,000-paragraph document read at the wire's bound is cut with its tail named; read in pieces its tail reaches text_units, every paragraph once, the last piece with more false", async () => {
  const b = bucket();
  const d = await hold(b, "docx bytes");
  const document = doc({ digest: d, bytes: 10, ct: "application/x-t6", format: "t6doc" });
  await withEntry(wordEntry, async () => {
    const cut = await readOf(b, document);
    assert.ok(cut.text_units.length < 6000 && cut.text_units_over_bound > 0, "today: the tail is left out and named");
    const pieces = await allPieces(b, document);
    assert.ok(pieces.length > 3, `${pieces.length} pieces`);
    const units = pieces.flatMap((p) => p.text_units);
    assert.equal(units.length, 6000);
    assert.deepEqual(units.map((u) => u.extent.para), PARAS.map((p) => p.para));
    assert.deepEqual(units.map((u) => u.seq), units.map((_, i) => i));
    assert.equal(units[5999].text, paragraph(5999), "the tail is in the text");
    assert.equal(pieces[0].reading !== undefined, true);
    assert.ok(pieces.slice(1).every((p) => p.reading === undefined), "a later piece is units alone");
    assert.equal(pieces[pieces.length - 1].more, false);
    assert.equal(pieces[pieces.length - 1].cursor, null);
    assert.equal(pieces[pieces.length - 1].read_through, pieces[0].total);
    pieces.forEach((p) => assert.equal(p.text_units_over_bound, undefined));
    /* a cursor for a document that now yields another number of units is refused */
    const first = pieces[0];
    const fewer = { ...wordEntry, text: async () => ({ ok: true, document: "x", paragraphs: PARAS.slice(0, 100), counts: { chars: 1, undetermined: 0 }, undetermined: [], container: "docx" }) };
    await withEntry(fewer, async () => {
      const out = await readOf(b, document, { unitsBudget: BUDGET, cursor: first.cursor });
      assert.equal(out.refused && out.refused.code, "CURSOR_MISMATCH");
      assert.equal(out.reading, undefined);
    });
  });
});

test("R40: a dense PDF of 300 pages is read in pieces as a document is: every page once, in order, the units of the whole read", async () => {
  const b = bucket();
  const bytes = synthPdf({ pages: 300, linesPerPage: 120, targetBytes: 0 });
  const d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
  const whole = await readOf(b, document, { unitsBudget: Infinity });
  assert.equal(whole.text_units.length, 300);
  const pieces = await allPieces(b, document);
  assert.ok(pieces.length > 2);
  assert.deepEqual(pieces.flatMap((p) => p.text_units), whole.text_units);
  assert.equal(pieces[pieces.length - 1].more, false);
});

/* A sheet of 9,000 rows: row 1 the header, rows with no cell are skipped in the text, so a line is not its row. */
const rowOf = (i) => (i === 0 ? 1 : i + 1 + Math.floor(i / 50));   /* a gap row every 50 lines */
const LINES = Array.from({ length: 9000 }, (_, i) => (i === 0 ? "Fund\tAmount\tNote" : `Fund ${i}\t${i * 100}\tnote about line ${i} ${"x".repeat(20)}`));
const sheetEntry = (lineRows) => ({ format: "t6xls", text: async () => ({ ok: true, document: LINES.join("\n"),
  sheets: [{ name: "Budget", rows: null, cols: null, usedRows: rowOf(8999), usedCols: 3,
             range: { kind: "sheet-range", sheet: "Budget", range: `A1:C${rowOf(8999)}` },
             text: LINES.join("\n"), cells: null, undetermined: [], ...(lineRows ? { lineRows: LINES.map((_, i) => rowOf(i)) } : {}) }],
  counts: { chars: 1, undetermined: 0 }, undetermined: [], container: "xlsx" }) });

test("R41: a sheet over the unit cap is carried as blocks of whole rows with its header row at the head of each, the extent naming the rows of the block when the reader gives them, and nothing is cut", async () => {
  const b = bucket();
  const d = await hold(b, "sheet bytes");
  const document = doc({ digest: d, bytes: 11, ct: "application/x-t6xls", format: "t6xls" });
  await withEntry(sheetEntry(true), async () => {
    const pieces = await allPieces(b, document);
    const units = pieces.flatMap((p) => p.text_units);
    assert.ok(units.length >= 4, `${units.length} blocks`);
    assert.ok(units.every((u) => u.text.length <= CAPTURE_TEXT_UNIT_CAP && u.truncated === undefined), "none is cut");
    assert.ok(units.every((u) => u.text.startsWith("Fund\tAmount\tNote")), "the header leads every block");
    const body = units.flatMap((u) => u.text.split("\n").slice(1));
    assert.deepEqual(body, LINES.slice(1), "every row of the sheet, once, in order");
    assert.ok(units[units.length - 1].text.endsWith(LINES[8999]));
    assert.equal(units[0].extent.range, `A1:C${rowOf(units[0].text.split("\n").length - 1)}`);
    assert.equal(units[units.length - 1].extent.range.endsWith(`C${rowOf(8999)}`), true);
    assert.ok(units.every((u) => u.extent.kind === "sheet-range" && u.extent.sheet === "Budget"));
    assert.deepEqual(units.map((u) => u.seq), units.map((_, i) => i));
  });
  await withEntry(sheetEntry(false), async () => {
    const units = (await allPieces(b, document)).flatMap((p) => p.text_units);
    assert.ok(units.length >= 4);
    assert.ok(units.every((u) => u.extent.range === `A1:C${rowOf(8999)}` && u.truncated === undefined), "without row numbers, the whole range, none cut");
  });
});

test("R41 (control): a sheet within the cap is one unit as before, and a text read without a cursor cuts as R15 states", async () => {
  const b = bucket();
  const d = await hold(b, "small sheet");
  const document = doc({ digest: d, bytes: 11, ct: "application/x-t6xls", format: "t6xls" });
  const small = { format: "t6xls", text: async () => ({ ok: true, document: "a\tb\n1\t2",
    sheets: [{ name: "S", rows: null, cols: null, usedRows: 2, usedCols: 2, range: { kind: "sheet-range", sheet: "S", range: "A1:B2" },
              text: "a\tb\n1\t2", cells: null, undetermined: [] }], counts: { chars: 1, undetermined: 0 }, undetermined: [], container: "xlsx" }) };
  await withEntry(small, async () => {
    const out = await readOf(b, document, { unitsBudget: BUDGET, cursor: null });
    assert.deepEqual(out.text_units.map((u) => [u.extent.range, u.text]), [["A1:B2", "a\tb\n1\t2"]]);
    assert.equal(out.more, false);
  });
});

test("R32 (G14): an unclosed head drops only the head: the body's text after it is read; a closed head, a script or style left open, and a page with no head are as before", () => {
  const words = (h) => visibleTextOfHtml(h).split(/\s+/).filter(Boolean).join(" ");
  assert.equal(words("<html><head><title>T</title><meta charset=x><body><p>Hello body</p></body></html>"), "Hello body");
  assert.equal(words("<html><head><title>T</title>\n<p>Hello</p>"), "Hello");
  assert.equal(words("<html><head><title>T</title>bare text<p>x</p>"), "bare text x");
  assert.equal(words("<html><head><title>T</title><script>var a = 1;</script><style>p{}</style><body>after</body>"), "after");
  assert.equal(words("<html><head><title>T</title></head><body><p>ok</p>"), "ok");
  assert.equal(words("<p>no head</p>"), "no head");
  assert.equal(words("<body><p>a</p><script>var late = 1; no end tag <p>never text</p>"), "a", "an unclosed script is raw text to the end (the parsing rules' script data)");
});
