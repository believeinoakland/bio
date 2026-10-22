/* reading-pipeline R35 (fix round 6, G40; K4622): a reading read whole in pieces (R40, R41) counts its words once. The first
   piece's `words_total` is the words of the whole text; the pieces' `piece.words` (which `extraction` adds up as the words
   read) sum to exactly that, never more: the header a sheet's later blocks repeat (R41) and a word a hard cut splits are no
   new words. Tested at `read`, over stored captures, through the registered csv entry and scripted entries. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, CAPTURE_TEXT_UNIT_CAP, wordsIn } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";

const BUDGET = 512 * 1024;
const readOf = (b, document, opts = {}) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...opts });

async function allPieces(b, document, extra = {}) {
  const pieces = [];
  let cursor = null;
  for (let g = 0; g < 400; g++) {
    const out = await readOf(b, document, { unitsBudget: BUDGET, cursor, ...extra });
    pieces.push(out);
    if (out.more !== true) break;
    cursor = out.cursor;
  }
  return pieces;
}

/* What a caller adding the pieces up sees: the first piece's total and the running sum of the pieces' words. */
function counts(pieces) {
  const total = pieces[0].reading.words_total;
  let sum = 0;
  for (const p of pieces) {
    sum += p.piece.words;
    assert.ok(sum <= total, `the words read so far (${sum}) never pass the total (${total})`);
  }
  return { total, sum, firstRead: pieces[0].reading.words_read, firstPiece: pieces[0].piece.words };
}

/* The CSV of the E3 probe (`shape/harness.mjs` csvDoc, about 1 MB): a header of several words, rows of several. */
function csvBytes(target) {
  const rows = ["Fund name,Amount budgeted,Department description,Notes for the record"];
  for (let i = 0; rows.join("\n").length < target; i++)
    rows.push(`Fund ${i},${i * 100},Department of public works ${i % 17},note about line ${i} the council received`);
  rows.push("LASTROWMARK,1,end,done");
  return rows.join("\n") + "\n";
}

test("R35: a 1 MB CSV read whole in pieces answers equal counts: the pieces' words sum to the words of the text, the header its later blocks repeat counted once", async () => {
  const b = bucket();
  const bytes = csvBytes(1_048_576);
  const d = await hold(b, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/csv", format: "csv", fromText: true });
  const pieces = await allPieces(b, document);
  assert.ok(pieces.length > 1, `${pieces.length} pieces`);
  assert.equal(pieces[pieces.length - 1].more, false);
  const units = pieces.flatMap((p) => p.text_units || []);
  assert.ok(units.length > 1 && units.slice(1).every((u) => u.text.startsWith("Fund name")), "a later block repeats the header (R41)");
  const { total, sum } = counts(pieces);
  const head = wordsIn(units[0].text.split("\n")[0]);
  const ownWords = units.reduce((n, u, i) => n + wordsIn(u.text) - (i > 0 ? head : 0), 0);
  assert.equal(total, ownWords, "the total is the words of the sheet's own rows, the header once");
  assert.equal(sum, total, "equal counts when the whole text was read");
});

/* A sheet of 9,000 rows as `pieces-formats.test.mjs` builds it: the header row, then 8,999 rows. */
const rowOf = (i) => (i === 0 ? 1 : i + 1 + Math.floor(i / 50));
const LINES = Array.from({ length: 9000 }, (_, i) => (i === 0 ? "Fund\tAmount\tNote" : `Fund ${i}\t${i * 100}\tnote about line ${i} ${"x".repeat(20)}`));
const SHEET_WORDS = LINES.reduce((n, l) => n + wordsIn(l), 0);
const sheetEntry = (lineRows) => ({ format: "t6xls", text: async () => ({ ok: true, document: LINES.join("\n"),
  sheets: [{ name: "Budget", rows: null, cols: null, usedRows: rowOf(8999), usedCols: 3,
             range: { kind: "sheet-range", sheet: "Budget", range: `A1:C${rowOf(8999)}` },
             text: LINES.join("\n"), cells: null, undetermined: [], ...(lineRows ? { lineRows: LINES.map((_, i) => rowOf(i)) } : {}) }],
  counts: { chars: 1, undetermined: 0 }, undetermined: [], container: "xlsx" }) });

test("R35: a sheet read in blocks, with and without lineRows, answers equal counts: the total is the sheet's own words and the pieces sum to it", async () => {
  const b = bucket();
  const d = await hold(b, "sheet bytes");
  const document = doc({ digest: d, bytes: 11, ct: "application/x-t6xls", format: "t6xls" });
  for (const withRows of [true, false]) {
    await withEntry(sheetEntry(withRows), async () => {
      const pieces = await allPieces(b, document);
      const units = pieces.flatMap((p) => p.text_units || []);
      assert.ok(units.length >= 4, `${units.length} blocks`);
      assert.equal(units.every((u) => u.text.length <= CAPTURE_TEXT_UNIT_CAP), true, "none is cut");
      const { total, sum, firstRead } = counts(pieces);
      assert.equal(total, SHEET_WORDS, "the total is the words of the sheet's text");
      assert.equal(sum, total, `equal counts (lineRows ${withRows})`);
      assert.ok(firstRead <= total);
    });
  }
});

test("R35: a text whose one word is cut by R41's chunking answers equal counts: a word a hard cut splits is one word", async () => {
  const b = bucket();
  const big = ["start of the text", "z".repeat(CAPTURE_TEXT_UNIT_CAP * 2 + 5000), "end of the text"].join("\n");
  const d = await hold(b, big);
  const document = doc({ digest: d, bytes: big.length, ct: "text/plain", format: "text", fromText: true });
  const pieces = await allPieces(b, document);
  const { total, sum } = counts(pieces);
  assert.equal(total, wordsIn(big));
  assert.equal(sum, total);
});

test("R35 (control): a text read whole by one piece answers the first piece's words as the total; a part not read leaves fewer read than total", async () => {
  const b = bucket();
  const small = "alpha beta\ngamma delta epsilon\nzeta";
  const d = await hold(b, small);
  const document = doc({ digest: d, bytes: small.length, ct: "text/plain", format: "text", fromText: true });
  const out = await readOf(b, document, { unitsBudget: BUDGET, cursor: null });
  assert.equal(out.more, false);
  assert.deepEqual([out.reading.words_total, out.reading.words_read, out.piece.words], [6, 6, 6]);
  /* a read at the wire's bound, no cursor: a unit over the cap is cut, so fewer are read than the total */
  const long = "lorem ".repeat(Math.ceil(CAPTURE_TEXT_UNIT_CAP / 6) + 1000).trim();
  const d2 = await hold(b, long);
  const cut = await readOf(b, doc({ digest: d2, bytes: long.length, ct: "text/plain", format: "text", fromText: true }));
  assert.ok(cut.reading.words_read < cut.reading.words_total);
});
