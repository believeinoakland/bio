/* office-readers R35 (fix round 4b, F7; K4487): text parts over the 20 MiB bound are read, in bounded pieces,
   through each entry's real text() and structure(). Every package here is a real one built by `large.mjs`, its
   expected text computed by a route that shares no code with the reader. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { docxEntry } from "../../../src/docx.mjs";
import { pptxEntry } from "../../../src/pptx.mjs";
import { csvEntry, MEASURED_CSV_TEXT_BOUND_BYTES } from "../../../src/csv.mjs";
import { MEASURED_OOXML_TEXT_BOUND_BYTES, STREAMED_TEXT_BOUND_BYTES } from "../../../src/ooxml.mjs";
import { xlsx } from "./fixtures.mjs";
import { bigXlsx, bigDocx, bigPptx, bigCsv, structuredXlsx, corruptBigXlsx, oneRowXlsx, angleDocx, hiddenPptx,
  oneBigSlidePptx, csvField, randomText, prng, MIB } from "./large.mjs";
import { csvEntry as csv, walkRecords, createRecordWalk } from "../../../src/csv.mjs";
import { enc } from "./fixtures.mjs";
import { sheetCellRef } from "../../../src/formats-xlsx.mjs";

const BOUND = MEASURED_OOXML_TEXT_BOUND_BYTES;
const same = (got, want, what) => assert.ok(got === want, `${what}: ${got == null ? got : got.length} chars, wanted ${want.length}`);
const noGuard = (list) => assert.ok(!list.some((u) => u.why === "over_size_bound"), "no over_size_bound marker");

test("R35 xlsx: a 25 MB workbook whose declared text is 30 MB yields its text, its extent and its formulas", async () => {
  const f = bigXlsx({ rows: 13500 });
  assert.ok(f.declared > 30 * 1000 * 1000, `fixture declares ${f.declared}`);
  assert.ok(f.declared > BOUND && f.bytes.length > 20 * 1000 * 1000, `fixture is ${f.bytes.length} bytes`);
  const parts = await xlsxEntry.parts(f.bytes);
  assert.equal(parts.ok, true);
  const t = await xlsxEntry.text(parts);
  assert.equal(t.ok, true);
  noGuard(t.undetermined);
  same(t.document, f.expected, "document");
  assert.equal(t.sheets.length, 1);
  const s = t.sheets[0];
  same(s.text, f.expected, "sheet text");
  assert.equal(s.usedRows, f.rows);
  assert.equal(s.usedCols, f.usedCols);
  assert.equal(s.range.ref, `Big!A1:G${f.rows}`);
  assert.equal(s.cells, null, "typed cells are not listed over the bound");
  assert.equal(t.counts.formulas, f.formulas);
  assert.equal(t.piecewise.declared, f.declared);
  assert.equal(t.piecewise.bound, BOUND);
  const st = await xlsxEntry.structure(parts);
  assert.equal(st.ok, true);
  assert.equal(st.evidentiary.items.filter((i) => i.kind === "formula").length, f.formulas);
  assert.ok(!st.evidentiary.undetermined.some((u) => u.why === "over_size_bound"));
  assert.ok(st.notes.includes("text_read_in_pieces"));
});

test("R35 xlsx: the same workbook gives the same text from raw bytes as from parts()", async () => {
  const f = bigXlsx({ rows: 9500, seed: 3 });
  const t = await xlsxEntry.text(f.bytes);
  same(t.document, f.expected, "document");
});

test("R35 docx: a document whose body is over the bound yields its paragraphs, tables and insertions", async () => {
  const f = bigDocx({ paras: 40000 });
  assert.ok(f.declared > BOUND, `fixture declares ${f.declared}`);
  const parts = await docxEntry.parts(f.bytes);
  assert.equal(parts.ok, true);
  const t = await docxEntry.text(parts);
  assert.equal(t.ok, true);
  noGuard(t.undetermined);
  same(t.document, f.expected, "document");
  assert.equal(t.paragraphs.length, f.paragraphs);
  assert.equal(t.paragraphs[41].ref, "¶42");
  assert.equal(t.tables.length, f.tables);
  assert.equal(t.tables[0].rows, 2);
  assert.equal(t.tables[0].cols, 2);
  assert.equal(t.tables[0].cells, null);
  assert.equal(t.piecewise.declared, f.declared);
  const st = await docxEntry.structure(parts);
  assert.equal(st.ok, true);
  assert.equal(st.paragraphs, f.paragraphs);
  assert.equal(st.evidentiary.items.filter((i) => i.kind === "tracked-change" && i.change === "insertion").length, f.insertions);
  assert.ok(!st.evidentiary.undetermined.some((u) => u.why === "over_size_bound"));
});

test("R35 pptx: a deck whose slides together are over the bound yields every slide's text", async () => {
  const f = bigPptx({ slides: 64 });
  assert.ok(f.declared > BOUND, `fixture declares ${f.declared}`);
  const parts = await pptxEntry.parts(f.bytes);
  assert.equal(parts.ok, true);
  const t = await pptxEntry.text(parts);
  assert.equal(t.ok, true);
  noGuard(t.undetermined);
  assert.equal(t.slides.length, 64);
  assert.equal(t.deckLength, 64);
  f.slideTexts.forEach((want, i) => same(t.slides[i].text, want, `slide ${i + 1}`));
  same(t.document, f.expected, "document");
  assert.equal(t.slides[0].shapes, 100);
  assert.equal(t.piecewise.declared, f.declared);
  const st = await pptxEntry.structure(parts);
  assert.equal(st.ok, true);
  assert.equal(st.slides, 64);
  assert.ok(!st.evidentiary.undetermined.some((u) => u.why === "over_size_bound"));
});

test("R35 csv: a 30 MB body yields its records, quoted fields and line breaks included", async () => {
  const f = bigCsv({ rows: 13000 });
  assert.ok(f.declared > MEASURED_CSV_TEXT_BOUND_BYTES, `fixture is ${f.declared} bytes`);
  const parts = await csvEntry.parts(f.bytes);
  assert.equal(parts.ok, true);
  const t = await csvEntry.text(parts);
  assert.equal(t.ok, true);
  noGuard(t.undetermined);
  same(t.document, f.expected, "document");
  assert.equal(t.sheets[0].usedRows, f.rows);
  assert.equal(t.sheets[0].usedCols, 6);
  assert.equal(t.sheets[0].cells, null);
  assert.equal(t.dialect.delimiter, "comma");
  assert.equal(t.piecewise.declared, f.declared);
  const st = await csvEntry.structure(parts);
  assert.equal(st.ok, true);
  assert.ok(!st.evidentiary.undetermined.some((u) => u.why === "over_size_bound"));
});

const WORKER = new URL("./large-worker.mjs", import.meta.url);
const inWorker = (job, bytes, limitMb) => new Promise((resolve, reject) => {
  const w = new Worker(WORKER, { workerData: { job, bytes }, resourceLimits: { maxOldGenerationSizeMb: limitMb } });
  w.once("message", resolve);
  w.once("error", reject);
});

test("R35 memory: each format's largest read — about 30 MiB declared, the ceiling's neighbourhood — completes inside a 128 MB old-space limit", async () => {
  const fixtures = {
    xlsx: bigXlsx({ rows: 13500 }),
    docx: bigDocx({ paras: 46000 }),
    pptx: bigPptx({ slides: 64 }),
    csv: bigCsv({ rows: 15000 }),
  };
  for (const [job, f] of Object.entries(fixtures)) {
    assert.ok(f.declared > BOUND && f.declared <= STREAMED_TEXT_BOUND_BYTES, `${job} declares ${f.declared}`);
    const got = await inWorker(job, f.bytes, 128);
    assert.equal(got.ok, true, job);
    assert.equal(got.undetermined, 0, job);
    assert.equal(got.documentLength, f.expected.length, job);
  }
});

test("R35 xlsx: shared strings, hidden rows and columns and hyperlinks are carried across the pieces of a sheet", async () => {
  const f = structuredXlsx();
  assert.ok(f.declared > BOUND, `fixture declares ${f.declared}`);
  const parts = await xlsxEntry.parts(f.bytes);
  const t = await xlsxEntry.text(parts);
  noGuard(t.undetermined);
  same(t.document, f.expected, "document");
  assert.deepEqual(t.undetermined, []);
  assert.equal(t.sheets[0].usedRows, f.rows);
  const st = await xlsxEntry.structure(parts);
  const items = st.evidentiary.items;
  assert.deepEqual(items.filter((i) => i.kind === "hidden-rows").map((i) => i.rows), [[9]]);
  assert.deepEqual(items.filter((i) => i.kind === "hidden-cols").map((i) => i.cols), [[{ min: 2, max: 2 }]]);
  assert.deepEqual(st.links.filter((l) => l.partition === "deferred").map((l) => [l.target.url, l.source]),
    [["http://example.org/", sheetCellRef("Sheet1", "A1")]]);
  assert.deepEqual(st.links.filter((l) => l.partition === "anchor").map((l) => [l.target.location, l.source]),
    [["Sheet1!A1", sheetCellRef("Sheet1", `A${f.rows}`)]]);
});

test("R35 xlsx: a sheet over the bound whose CRC is wrong gives no text of it, only the reason", async () => {
  const bytes = corruptBigXlsx();
  const t = await xlsxEntry.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.document, "");
  assert.equal(t.sheets[0].text, "");
  assert.equal(t.sheets[0].range, null);
  assert.deepEqual(t.undetermined, [{ sheet: 0, cell: null, reason: "crc_mismatch" }]);
  const st = await xlsxEntry.structure(bytes);
  assert.ok(st.evidentiary.undetermined.some((u) => u.part === "xl/worksheets/sheet1.xml" && u.why === "crc_mismatch"));
});

test("R35 xlsx: a sheet that is one row of 21 MiB has no place to end a piece, and is stated with its size, final", async () => {
  const f = oneRowXlsx();
  const t = await xlsxEntry.text(f.bytes);
  assert.equal(t.ok, true);
  assert.equal(t.sheets[0].text, "");
  assert.deepEqual(t.undetermined, [{ sheet: 0, cell: null, reason: "piece_unbounded", size: f.declared, final: true }]);
  const st = await xlsxEntry.structure(f.bytes);
  assert.ok(st.evidentiary.undetermined.some((u) => u.why === "piece_unbounded" && u.size === f.declared && u.final === true));
});

test("R35 xlsx: over the streamed ceiling the text is refused with the marker, the size and final", async () => {
  const t = await xlsxEntry.text(xlsx({ sheets: [{ name: "S", data: {}, cd: { usize: STREAMED_TEXT_BOUND_BYTES + 5 } }] }));
  assert.equal(t.document, null);
  assert.deepEqual(t.undetermined, [{ ok: false, text: "undetermined", why: "over_size_bound", size: STREAMED_TEXT_BOUND_BYTES + 5,
    bound: STREAMED_TEXT_BOUND_BYTES, boundName: "STREAMED_TEXT_BOUND_BYTES", metric: "declared_uncompressed_text_part_bytes", final: true }]);
});

test("R35 docx: a piece cut at a > inside an attribute value or in text reads as the whole body does; comments are carried", async () => {
  const f = angleDocx();
  assert.ok(f.declared > BOUND, `fixture declares ${f.declared}`);
  const parts = await docxEntry.parts(f.bytes);
  const t = await docxEntry.text(parts);
  noGuard(t.undetermined);
  same(t.document, f.expected, "document");
  assert.equal(t.paragraphs.length, f.paragraphs);
  const st = await docxEntry.structure(parts);
  const comment = st.evidentiary.items.find((i) => i.kind === "comment");
  assert.equal(comment.text, "check this");
  assert.deepEqual(comment.source, { kind: "doc-para", ref: "¶1", para: 0, run: 1 });
});

test("R35 pptx: a hidden slide and speaker notes survive a deck read one part at a time", async () => {
  const f = hiddenPptx();
  const parts = await pptxEntry.parts(f.bytes);
  assert.deepEqual([...parts.hiddenParts], ["ppt/slides/slide3.xml"]);
  const t = await pptxEntry.text(parts);
  assert.deepEqual(t.slides.map((s) => s.hidden).map((h, i) => (h ? i + 1 : 0)).filter(Boolean), [3]);
  assert.equal(t.slides[2].text.length, 100 * 5000 + 99);
  assert.equal(t.speakerNotes.length, 1);
  assert.equal(t.speakerNotes[0].text, "speaker words");
  const st = await pptxEntry.structure(parts);
  assert.deepEqual(st.evidentiary.items.filter((i) => i.kind === "hidden-slide").map((i) => i.slide), [3]);
  assert.equal(st.evidentiary.items.find((i) => i.kind === "speaker-notes").text, "speaker words");
});

test("R35 pptx: a slide that is itself over the bound is stated with its size, final, and the other slides are read", async () => {
  const f = oneBigSlidePptx();
  const t = await pptxEntry.text(f.bytes);
  assert.deepEqual(t.slides.map((s) => s.text), ["after"]);
  assert.deepEqual(t.undetermined, [{ reason: "slide_unreadable", part: "ppt/slides/slide1.xml", why: "over_size_bound", size: f.declared, final: true }]);
  assert.equal(t.deckLength, 2);
});

test("R35 csv: a CRLF or a doubled quote that falls on the edge of a window reads as it does whole", async () => {
  /* Records are laid out so that, at every 1 MiB window edge of the body, the edge falls between the CR and the LF
     of a record's end, or between the two quotes of a `""` in a quoted field. */
  const W = 1 << 20;
  const rows = [];
  const lines = [];
  let at = 0;
  const add = (fields) => {
    const line = fields.map(csvField).join(",") + "\r\n";
    rows.push(line);
    lines.push(fields.filter((x) => x !== "").join("\t"));
    at += line.length;
  };
  const rand = prng(31);
  add(["h1", "h2", "h3"]);
  add(["1", "2", "3"]);
  for (let edge = 1; edge <= 21; edge++) {
    // fill with ordinary records up to just short of the edge
    while (at + 400 < edge * W) add([randomText(rand, 100), randomText(rand, 100), randomText(rand, 100)]);
    const gap = edge * W - at;
    if (edge % 2) {
      // a record whose CR is the last byte before the edge: length gap-1 up to the CR
      const pad = gap - 1 - "x,y,".length;
      add(["x", "y", "z".repeat(pad)].slice(0, 2).concat([randomText(rand, pad - 1)]));
      // the line is now `x,y,<pad-1>` + CRLF, which ends one byte past the edge: shift by one if needed
    } else {
      // a quoted field whose opening quote and first half of a doubled pair end on the edge
      const lead = gap - 1;
      const fill = randomText(rand, Math.max(0, lead - 4));
      add([`${fill}"quoted"more`, "q", "r"]);
    }
  }
  const bytes = enc(rows.join(""));
  assert.ok(bytes.length > MEASURED_CSV_TEXT_BOUND_BYTES);
  const expectedWhole = walkRecords(new TextDecoder("latin1").decode(bytes), ",");
  const t = await csv.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.dialect.delimiter, "comma");
  same(t.document, expectedWhole.map((r) => r.filter((x) => x !== "").join("\t")).filter((x) => x !== "").join("\n"), "document");
  assert.equal(t.sheets[0].usedRows, expectedWhole.length);
});

test("R35 csv: walking a text in pieces cut anywhere gives the records of walking it whole", () => {
  const rand = prng(41);
  const alphabet = ['a', 'b', ',', '"', '"', '\r', '\n', '\r\n', ' ', ';'];
  for (let round = 0; round < 400; round++) {
    let text = "";
    for (let i = 0, n = 1 + (rand() % 60); i < n; i++) text += alphabet[rand() % alphabet.length];
    for (const delimiter of [",", null]) {
      const whole = walkRecords(text, delimiter);
      for (let cuts = 1; cuts <= 4; cuts++) {
        const points = Array.from({ length: cuts }, () => rand() % (text.length + 1)).sort((a, b) => a - b);
        const got = [];
        const w = createRecordWalk(delimiter, (r) => got.push(r));
        let from = 0;
        for (const p of points) { w.feed(text.slice(from, p)); from = p; }
        w.feed(text.slice(from));
        w.end();
        assert.deepEqual(got, whole, JSON.stringify({ text, delimiter, points }));
      }
    }
  }
});

test("R35 csv: a UTF-16 body over the bound is not read in pieces, and is stated with its size, final", async () => {
  const n = BOUND / 2 + 8;
  const bytes = new Uint8Array(2 + n * 2);
  bytes.set([0xff, 0xfe]);
  for (let i = 0; i < n; i++) { bytes[2 + i * 2] = i % 61 === 60 ? 0x0a : 0x61; }
  const t = await csv.text(bytes);
  assert.equal(t.document, null);
  assert.deepEqual(t.undetermined, [{ ok: false, text: "undetermined", why: "over_size_bound", size: bytes.length - 2,
    bound: BOUND, boundName: "MEASURED_CSV_TEXT_BOUND_BYTES", metric: "body_bytes", final: true, encoding: "utf-16le" }]);
  assert.equal(t.dialect.encoding, "utf-16le");
});

test("R35 csv: cells a legacy encoding cannot read are listed up to a limit, then counted", async () => {
  /* Latin-1 text: its high bytes are no valid UTF-8, so the encoding is undetermined and every accented field is an
     undetermined cell, over twenty thousand of them in a body over the bound. */
  const rows = [];
  for (let i = 0; i < 60; i++) rows.push(`${i},plain,text`);
  const filler = "p".repeat(1000);
  const accented = Uint8Array.from([0x63, 0x61, 0x66, 0xe9]);
  const parts = [enc(rows.join("\n") + "\n")];
  const lineCount = Math.ceil((BOUND + 4096) / 1000);
  const chunk = [];
  for (let i = 0; i < lineCount; i++) {
    chunk.push(enc(`${i},${filler},`), accented, enc("\n"));
  }
  const bytes = new Uint8Array([...parts, ...chunk].reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of [...parts, ...chunk]) { bytes.set(p, o); o += p.length; }
  const t = await csv.text(bytes);
  assert.equal(t.ok, true);
  assert.equal(t.sheets[0].cells, null);
  assert.equal(t.undetermined.length, 10001);
  assert.equal(t.undetermined[0].reason, "encoding_undetermined");
  assert.deepEqual(t.undetermined[10000], { sheet: 0, cell: null, reason: "more_cells_undetermined", count: lineCount - 10000 });
});
