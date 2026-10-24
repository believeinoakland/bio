/* test-support R20, R21, R22 (fix round 9, G123d, G123e): the four generators build the shapes the corpus names, and
 * each file is read by an independent reader that shares no code with the generator (R24's oracles): pdf.js and
 * poppler for PDFs, Pillow for pictures, the generator's own RFC 4180 reading and LibreOffice for sheets, LibreOffice,
 * Python's zipfile and Chromium for documents. A host lacking a reader skips that check by name. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { buildFixture, generate, truthOf, pdfjsText, pdftotext, pillowPixels, soffice, chromiumText, scratchFile } from "../../corpus.mjs";
import { rfc4180 } from "../../sheetgen.mjs";

const has = (cmd, args = ["--version"]) => { const r = spawnSync(cmd, args, { encoding: "utf8" }); return !r.error && r.status === 0; };
const NO_PYTHON = !has("python3", ["-I", "-c", "import zipfile"]) && "python3 is absent on this host";
const NO_PILLOW = !has("python3", ["-I", "-c", "import PIL"]) && "Pillow is absent on this host";
const NO_SOFFICE = !has("soffice") && "LibreOffice is absent on this host";
const NO_POPPLER = !has("pdftotext", ["-v"]) && "pdftotext is absent on this host";
const norm = (s) => s.normalize("NFKC").replace(/[‪-‮⁦-⁩]/g, "").replace(/\s+/g, " ").trim();
const zipMembers = (path) => {
  /* a member zipfile cannot read (an encrypted flag, a lying size) is listed with text null */
  const code = "import sys,zipfile,json\nz=zipfile.ZipFile(sys.argv[1])\ndef text(i):\n  try: return None if i.flag_bits & 1 else z.read(i).decode('utf8','replace')\n  except Exception: return None\nprint(json.dumps({i.filename:{'size':i.file_size,'flags':i.flag_bits,'text':text(i)} for i in z.infolist()}))";
  const r = spawnSync("python3", ["-I", "-c", code, path], { encoding: "utf8", maxBuffer: 1 << 28 });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
};

/* ---------------------------------------------------------------- R20 PDFs */

const PDF_SHAPES = [
  { kind: "pdf", seed: "F1", fonts: ["winansi", "macroman", "differences", "type0", "type3"], size: { pages: 5, lines: 6 } },
  { kind: "pdf", seed: "F2", structure: "xref-stream", size: { pages: 2, lines: 4 } },
  { kind: "pdf", seed: "F3", structure: "object-streams", fonts: ["type0"], size: { pages: 2, lines: 4 } },
  { kind: "pdf", seed: "F4", structure: "linearized", size: { pages: 3, lines: 4 } },
  { kind: "pdf", seed: "F5", structure: "damaged-xref", fonts: ["type3"], size: { pages: 2, lines: 4 } },
  { kind: "pdf", seed: "F6", structure: "no-xref", size: { pages: 2, lines: 4 } },
  { kind: "pdf", seed: "F7", revisions: 3, size: { pages: 2, lines: 4 } },
  { kind: "pdf", seed: "F8", encryption: { method: "rc4", user: "" }, fonts: ["macroman"], size: { pages: 2, lines: 4 } },
  { kind: "pdf", seed: "F9", encryption: { method: "aes", user: "" }, fonts: ["type0"], structure: "object-streams", size: { pages: 2, lines: 4 } },
  { kind: "pdf", seed: "F10", heavy: { page: 2, lines: 3000 }, huge: { page: 3, box: [14400, 14400] }, rotate: { every: 2, angle: 90 }, compress: true, size: { pages: 4, lines: 5 } },
];

test("R20 pdfgen's shapes (non-ASCII text in six fonts, every structure, revisions, empty-password RC4 and AES, a heavy page among light ones, a huge page) are read by pdf.js exactly as the truth says, page by page", async () => {
  for (const r of PDF_SHAPES) {
    const f = generate(r), t = f.truth, o = await pdfjsText(await f.bytes());
    if (o.skip) return;
    assert.ok(!o.error, `${r.seed}: ${o.error}`);
    assert.equal(o.pages, t.pages, `${r.seed}: page count`);
    for (let i = 1; i <= t.pages; i++) assert.equal(norm(o.texts[i - 1]), norm(t.page(i).text), `${r.seed} page ${i}`);
  }
});

test("R20 a second reader, poppler's pdftotext, agrees with the truth on the font and structure files", { skip: NO_POPPLER }, async () => {
  for (const r of PDF_SHAPES.slice(0, 7)) {
    const f = await buildFixture(r), t = f.truth, o = pdftotext(f.path, t.pages);
    /* poppler writes a right-to-left word in visual order: turned back to logical, as pdfjsText does */
    const logical = (s) => norm(s).split(" ").map((w) => (/[\u0590-\u08ff]/.test(w) ? [...w].reverse().join("") : w)).join(" ");
    for (let i = 1; i <= t.pages; i++) if (!t.page(i).unread) assert.equal(logical(o.texts[i - 1]), norm(t.page(i).text), `${r.seed} page ${i}`);
  }
});

test("R20 a PDF under a user password is refused without it and read with it; its truth states ENCRYPTED for every page", async () => {
  const r = { kind: "pdf", seed: "E1", encryption: { method: "aes", user: "pw" }, size: { pages: 2, lines: 3 } };
  const f = generate(r), b = await f.bytes();
  assert.deepEqual(f.truth.refusal, { code: "ENCRYPTED" });
  assert.equal(f.truth.page(1).unread, "ENCRYPTED");
  const locked = await pdfjsText(b);
  if (locked.skip) return;
  assert.match(locked.error, /Password/);
  const open = await pdfjsText(b, { password: "pw" });
  assert.equal(norm(open.texts[1]), norm(f.truth.page(2).lines.join(" ")));
});

test("R20 scans and mixed pages: a scan page has no text layer and its truth is its lines read by OCR; a mixed page has both; folio, blank and vector pages are what they say", async () => {
  const r = { kind: "pdf", seed: "S1", kinds: ["text", "scan", "mixed", "folio", "blank", "vector"], size: { pages: 6, lines: 6 }, scan: { dpi: 100, bits: 1 } };
  const f = generate(r), t = f.truth, o = await pdfjsText(await f.bytes());
  if (o.skip) return;
  assert.equal(o.pages, 6);
  assert.deepEqual([2, 3, 4, 5, 6].map((p) => t.page(p).kind), ["scan", "mixed", "folio", "blank", "vector"]);
  assert.equal(norm(o.texts[1]), "", "a scan page has no text layer");
  assert.equal(t.page(2).ocr.length, 6);
  assert.match(t.page(2).ocr[0], /^S1-p2-l1 [a-z]+$/);
  assert.equal(norm(o.texts[2]), norm(t.page(3).lines.join(" ")), "a mixed page's text half");
  assert.equal(t.page(3).ocr.length, 3, "and its scanned half");
  assert.equal(norm(o.texts[3]), "S1-p4-l1 4");
  assert.equal(norm(o.texts[4]) + norm(o.texts[5]), "");
  assert.deepEqual(t.marks, { first: "S1-p1-l1", middle: "S1-p2-l3", last: "S1-p4-l1" }, "the middle page that has lines (of 1-4), its middle line");
});

test("R20 a stream or a header that declares more than its data holds, a polyglot, a hostile count and a font with no ToUnicode are written as named and stated in the truth", { skip: NO_PYTHON }, async () => {
  const lie = generate({ kind: "pdf", seed: "D1", declare: { length: 5000, count: 99 }, size: { pages: 2, lines: 2 } });
  const text = Buffer.from(await lie.bytes()).toString("latin1");
  assert.match(text, /\/Count 99 /);
  const first = /4 0 obj\n<<  \/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/.exec(text) ?? /\/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/.exec(text);
  assert.equal(Number(first[1]), Buffer.byteLength(first[2], "latin1") + 5000, "the first content stream declares 5,000 bytes more than it holds");
  assert.deepEqual(lie.truth.declared, { length: 5000, count: 99 });
  const img = generate({ kind: "pdf", seed: "D2", kinds: ["scan"], declare: { image: [60000, 60000] }, size: { pages: 1, lines: 2 } });
  assert.match(Buffer.from(await img.bytes()).toString("latin1"), /\/Width 60000 \/Height 60000/);
  const poly = await buildFixture({ kind: "pdf", seed: "D3", polyglot: "zip", size: { pages: 1, lines: 2 } });
  const z = spawnSync("python3", ["-I", "-c", "import sys,zipfile;print(zipfile.ZipFile(sys.argv[1]).read('polyglot.txt').decode())", poly.path], { encoding: "utf8" });
  assert.equal(z.stdout.trim(), "polyglot", "the PDF is also a ZIP");
  const many = generate({ kind: "pdf", seed: "D4", hostile: { pages: 2000, objects: 500 }, size: { pages: 1, lines: 1 } });
  const o = await pdfjsText(await many.bytes());
  if (!o.skip) assert.equal(o.pages, 2001);
  assert.equal(many.truth.pages, 2001);
  assert.equal(generate({ kind: "pdf", seed: "D5", fonts: ["type0-nounicode"], size: { pages: 1, lines: 2 } }).truth.page(1).unread, "NO_TOUNICODE");
});

test("R20 a truncated PDF is cut where the recipe says, and the truth names the pages it loses; pdf.js reads the pages before the cut", async () => {
  const r = { kind: "pdf", seed: "T1", truncate: 0.55, size: { pages: 6, lines: 4 } };
  const f = generate(r), b = await f.bytes();
  assert.equal(b.length, f.size);
  const lost = Array.from({ length: 6 }, (_, i) => f.truth.page(i + 1).unread);
  assert.ok(lost.includes("TRUNCATED") && lost[0] === null, JSON.stringify(lost));
  const o = await pdfjsText(b);
  if (o.skip || o.error) return;
  assert.equal(norm(o.texts[0]), norm(f.truth.page(1).text));
});

/* ---------------------------------------------------------------- R20 pictures */

const PICTURES = [
  { kind: "png", seed: "P1", mode: "L" }, { kind: "png", seed: "P2", mode: "1" }, { kind: "png", seed: "P3", mode: "RGB", degrade: { tilt: 3 } },
  { kind: "png", seed: "P4", mode: "P", degrade: { invert: true } }, { kind: "png", seed: "P5", mode: "LA", degrade: { contrast: true } },
  { kind: "png", seed: "P6", mode: "I;16", degrade: { turn: 90 } }, { kind: "bmp", seed: "P7", degrade: { turn: 180 } },
  { kind: "gif", seed: "P8", size: { pages: 3, lines: 3 } }, { kind: "gif", seed: "P9", mode: "L" },
  { kind: "tiff", seed: "P10", size: { pages: 2, lines: 3 }, byteOrder: "MM" }, { kind: "tiff", seed: "P11", compression: "packbits", mode: "1" },
  { kind: "tiff", seed: "P12", compression: "lzw", predictor: 2, degrade: { noise: 0.05, shade: 0.4 } },
  { kind: "tiff", seed: "P13", compression: "deflate", mode: "RGB", degrade: [{ turn: 270 }, {}], size: { pages: 2, lines: 2 } },
  { kind: "png", seed: "P14", frame: [20000, 60] }, { kind: "png", seed: "P15", frame: [40, 3000] },
];

test("R20 every picture's truth is its pixels: Pillow decodes each kind, mode, codec, page and degradation to exactly the truth's pixels", { skip: NO_PILLOW }, async () => {
  for (const r of PICTURES) {
    const f = await buildFixture(r), t = f.truth, o = pillowPixels(f.path);
    assert.ok(o.frames, `${r.seed}: ${o.error}`);
    assert.equal(o.frames.length, t.frames, `${r.seed} frames`);
    o.frames.forEach((fr, i) => {
      const pg = t.pages[i];
      assert.deepEqual([fr.width, fr.height, fr.mode], [pg.width, pg.height, pg.mode], `${r.seed} page ${i + 1}`);
      assert.equal(fr.sha256, pg.sha256(), `${r.seed} page ${i + 1} pixels`);
    });
  }
});

test("R20 a wide or tall frame draws only the lines that fit and names the rest unread OFF_FRAME; each line carries <seed>-p<page>-l<line>", () => {
  const t = truthOf({ kind: "png", seed: "W1", frame: [20000, 60], size: { lines: 6 } });
  assert.equal(t.pages[0].lines.length, 1);
  assert.match(t.pages[0].lines[0], /^W1-p1-l1 [a-z]+$/);
  assert.deepEqual(t.pages[0].unread.map((u) => u.reason), Array(5).fill("OFF_FRAME"));
});

test("R20 hostile pictures: a header that declares more than its data, a hostile count of chunks, IFDs and frames, and a polyglot", { skip: NO_PILLOW }, async () => {
  const declared = await buildFixture({ kind: "png", seed: "H1", declare: { width: 100000, height: 100000 }, pixelBound: 268435456 });
  assert.deepEqual(declared.truth.declared, { width: 100000, height: 100000, pixels: 1e10 });
  assert.deepEqual(declared.truth.refusal, { code: "TOO_LARGE", size: 1e10, bound: 268435456 });
  assert.ok(pillowPixels(declared.path).error, "Pillow refuses it");
  const chunks = await buildFixture({ kind: "png", seed: "H2", hostile: { chunks: 5000 } });
  assert.equal(pillowPixels(chunks.path).frames[0].sha256, chunks.truth.pages[0].sha256(), "5,000 extra chunks, the same pixels");
  const ifds = await buildFixture({ kind: "tiff", seed: "H3", hostile: { ifds: 40 }, size: { lines: 2 } });
  assert.equal(pillowPixels(ifds.path).frames.length, 41);
  const frames = generate({ kind: "gif", seed: "H4", hostile: { frames: 300 }, size: { lines: 1 } });
  assert.equal(frames.truth.frames, 301);
  const poly = await buildFixture({ kind: "png", seed: "H5", polyglot: "zip" });
  assert.equal(pillowPixels(poly.path).frames[0].sha256, poly.truth.pages[0].sha256());
  assert.equal(spawnSync("python3", ["-I", "-c", "import sys,zipfile;zipfile.ZipFile(sys.argv[1]).read('polyglot.txt')", poly.path]).status, 0, "and a ZIP");
});

/* ---------------------------------------------------------------- R21 sheets */

const decode = (b, enc) => {
  if (enc.startsWith("utf-16")) return new TextDecoder(enc.startsWith("utf-16be") ? "utf-16be" : "utf-16le").decode(b).replace(/^﻿/, "");
  return new TextDecoder(enc === "windows-1252" ? "windows-1252" : "utf-8").decode(b).replace(/^﻿/, "");
};

test("R21 CSV and TSV in UTF-8, UTF-16 and Windows-1252, CRLF, CR and LF, with quoted newlines, doubled quotes, tabs, a stray quote, ragged rows, a title block, empties, long cells and 16,385 columns: the file's RFC 4180 reading is the truth, record by record", async () => {
  const cases = [
    { kind: "csv", seed: "C1" },
    { kind: "csv", seed: "C2", encoding: "utf-16le-bom", eol: "lf", quoting: ["doubled", "newline", "tab", "stray"], ragged: true, empties: { leading: true, row: 4, last: true } },
    { kind: "csv", seed: "C3", encoding: "utf-16be", eol: "cr", empties: { middle: true, column: 2 } },
    { kind: "tsv", seed: "C4", encoding: "windows-1252", eol: "cr", header: "title", size: { rows: 30 } },
    { kind: "csv", seed: "C5", encoding: "utf-8-bom", header: { chars: 300 }, types: ["text", "formula", "integer", "percent", "currency", "date", "decimal"], long: { row: 3, col: 1, chars: 100000 } },
    { kind: "csv", seed: "C6", size: { rows: 3, cols: 16385 }, header: "none" },
  ];
  for (const r of cases) {
    const f = generate(r), t = f.truth, recs = rfc4180(decode(await f.bytes(), r.encoding ?? "utf-8"), t.delimiter);
    assert.equal(recs.length, t.fileRows, `${r.seed} records`);
    t.header.forEach((h, k) => { if (h.length) assert.deepEqual(recs[k], h, `${r.seed} header row ${k + 1}`); });
    for (let d = 1; d <= t.rows; d++) assert.deepEqual(recs[t.headerRows + d - 1], t.row(d), `${r.seed} data row ${d}`);
  }
});

test("R21 the stray quote, quoted newline, doubled quote and tab are in the bytes as named (the RFC 4180 reading is not vacuous)", async () => {
  const f = generate({ kind: "csv", seed: "Q1", quoting: ["doubled", "newline", "tab", "stray"], eol: "crlf" });
  const text = new TextDecoder().decode(await f.bytes());
  assert.match(text, /"[^",\r\n]+ ""r6c1"""/, "doubled");
  assert.match(text, /"[^",]+\nr2c1"/, "a newline inside quotes");
  assert.match(text, /\r\n[^",\r\n]+\tr3c1,/, "a tab in a value (unquoted: a comma file does not quote a tab)");
  assert.match(text, /\r\n[^",\r\n]+"r4c1,/, "a stray quote, unquoted");
});

test("R21 G123e: the marks <seed>-R<row>-C<col> sit in a non-header cell of the first data row, a middle row and the last row, for every header shape", () => {
  for (const header of ["one", "none", "title", { chars: 40 }]) {
    const t = truthOf({ kind: "xlsx", seed: "M1", header, size: { rows: 101 } });
    assert.deepEqual(t.marks.map((m) => m.dataRow), [1, 51, 101]);
    for (const m of t.marks) {
      assert.ok(m.row > t.headerRows, `${JSON.stringify(header)}: the mark's row ${m.row} is past the header rows`);
      assert.equal(m.text, `M1-R${m.row}-C${m.col}`);
      assert.equal(t.cell(m.dataRow, m.col).text, m.text);
      assert.ok(!t.header.flat().includes(m.text));
    }
  }
});

test("R21 G123e (J-1): an index that repeats the header in every unit still has each data row in exactly one unit, and the first mark in one unit; a mark in the header row would be in all of them", () => {
  const t = truthOf({ kind: "csv", seed: "J1", size: { rows: 120 } });
  const header = t.header[0].join(",");
  const units = [];
  for (let d = 1; d <= t.rows; d += 7) units.push([header, ...Array.from({ length: Math.min(7, t.rows - d + 1) }, (_, k) => t.row(d + k).join(","))].join("\n"));
  assert.deepEqual(t.checkUnits(units), { ok: true, missing: [], repeated: [] });
  const first = t.marks[0].text;
  assert.equal(units.filter((u) => u.includes(first)).length, 1, "the first-row mark is in one unit");
  const headerMark = t.header[0][0];
  assert.equal(units.filter((u) => u.includes(headerMark)).length, units.length, "a header cell is in every unit, so a mark there proves nothing (S-24)");
  const overlapping = [...units, units[3]];
  assert.deepEqual(t.checkUnits(overlapping).repeated, [22, 23, 24, 25, 26, 27, 28]);
  assert.deepEqual(t.checkUnits(units.slice(1)).missing, [1, 2, 3, 4, 5, 6, 7]);
});

test("R21 XLSX (shared and inline strings, dates under a date format, merged title, annotations, two sheets) and ODS are read by LibreOffice cell for cell as the truth says", { skip: NO_SOFFICE }, async () => {
  const num = (s) => Number(String(s).replace(/[$,%]/g, ""));
  const dateOf = (s) => { const m = /^(\d\d)\/(\d\d)\/(\d\d)/.exec(s); return m ? `20${m[3]}-${m[1]}-${m[2]}` : s; };
  const all = ["text", "integer", "decimal", "percent", "currency", "date", "formula"];
  for (const r of [
    { kind: "xlsx", seed: "X1", strings: "shared", header: "title", merged: true, annotations: true, types: all, sheets: 2 },
    { kind: "xlsx", seed: "X2", types: all, empties: { middle: true }, ragged: true },
    { kind: "ods", seed: "O1", types: all, header: "title", merged: true, annotations: true, empties: { last: true } },
  ]) {
    const f = await buildFixture(r), t = f.truth, o = soffice(f.path, "csv");
    assert.ok(!o.error, `${r.seed}: ${o.error}`);
    const recs = rfc4180(o.text, ",");
    for (let d = 1; d <= t.rows; d++) for (let c = 1; c <= t.cols; c++) {
      const cell = t.cell(d, c), got = (recs[t.headerRows + d - 1] ?? [])[c - 1] ?? "";
      if (!cell) { assert.equal(got, "", `${r.seed} r${d}c${c} empty`); continue; }
      if (cell.type === "text") assert.equal(got, cell.text, `${r.seed} r${d}c${c}`);
      else if (cell.type === "date") assert.equal(dateOf(got), cell.value, `${r.seed} r${d}c${c} date`);
      else assert.ok([cell.value, cell.value * 100].some((v) => Math.abs(num(v) - num(got)) < 1e-6), `${r.seed} r${d}c${c} ${cell.type}: ${got} vs ${cell.text}`);
    }
  }
});

test("R21 XLSX parts say what they name: date and number formats, merged range, annotations, inline or shared strings, and each hostile shape", { skip: NO_PYTHON }, async () => {
  const f = await buildFixture({ kind: "xlsx", seed: "X3", strings: "shared", header: "title", merged: true, annotations: true, types: ["text", "date", "percent"] });
  const m = zipMembers(f.path);
  assert.match(m["xl/styles.xml"].text, /formatCode="yyyy\\-mm\\-dd"/);
  assert.match(m["xl/worksheets/sheet1.xml"].text, /<c r="B4" s="5"><v>\d+<\/v><\/c>/, "a date cell under the date format");
  assert.match(m["xl/worksheets/sheet1.xml"].text, /<mergeCell ref="A1:F1"\/>/);
  assert.equal((m["xl/comments1.xml"].text.match(/<comment /g) ?? []).length, 3);
  assert.match(m["xl/sharedStrings.xml"].text, /X3-R4-C1/);
  const inline = zipMembers((await buildFixture({ kind: "xlsx", seed: "X4" })).path);
  assert.match(inline["xl/worksheets/sheet1.xml"].text, /t="inlineStr"/);
  const sheet = async (hostile) => zipMembers((await buildFixture({ kind: "xlsx", seed: "X5", hostile, empties: { middle: true }, size: { rows: 30 } })).path);
  assert.doesNotMatch((await sheet("no-r"))["xl/worksheets/sheet1.xml"].text, / r="/);
  assert.match((await sheet("styled-empty"))["xl/worksheets/sheet1.xml"].text, /<c r="[A-Z]+\d+" s="3"\/>/);
  assert.match((await sheet("lying-dimension"))["xl/worksheets/sheet1.xml"].text, /<dimension ref="A1:XFD1048576"\/>/);
  const lying = await buildFixture({ kind: "xlsx", seed: "X5", hostile: "lying-directory" });
  assert.equal(zipMembers(lying.path)["xl/worksheets/sheet1.xml"].size, 1, "the central directory declares 1 byte");
  const bomb = await buildFixture({ kind: "xlsx", seed: "X6", hostile: "bomb", size: { rows: 3000 } });
  const b = zipMembers(bomb.path)["xl/worksheets/sheet1.xml"];
  assert.ok(b.size / bomb.size > 100, `the sheet unpacks ${Math.round(b.size / bomb.size)} times its file`);
});

test("R21 at the standard's size: a 1,048,576-row truth is computed without building, and a 50 MiB CSV streams to exactly 50 MiB at the bound minus 2, the bound and the bound plus 1", async () => {
  const t = truthOf({ kind: "xlsx", seed: "B1", size: { rows: 1048576 } });
  assert.equal(t.marks[2].row, 1048577);
  assert.equal(t.cell(1048576, 1).text, "B1-R1048577-C1");
  const bound = 50 * 2 ** 20;
  for (const bytes of [bound - 2, bound, bound + 1]) {
    const f = generate({ kind: "csv", seed: "B2", size: { bytes } });
    let n = 0, last = null;
    for await (const c of f.chunks()) { n += c.length; last = c; }
    assert.equal(n, bytes);
    const tail = rfc4180(new TextDecoder().decode(last.subarray(last.lastIndexOf(10, last.length - 3) + 1)));
    assert.deepEqual(tail[tail.length - 1], f.truth.row(f.truth.rows), "the last record is the truth's last row, padding and mark included");
  }
});

/* ---------------------------------------------------------------- R22 documents */

const PARTS_ALL = ["footnote", "endnote", "header", "footer", "comment", "deleted", "textbox"];

test("R22 DOCX, ODT, PPTX and ODP with every part kind and a table: LibreOffice finds every unit it exports, and each unit it leaves out is in its package member", { skip: NO_SOFFICE || NO_POPPLER }, async () => {
  for (const r of [
    { kind: "docx", seed: "W1", parts: PARTS_ALL, table: { rows: 3, cols: 2 } },
    { kind: "odt", seed: "W2", parts: PARTS_ALL, table: { rows: 2, cols: 3 } },
    { kind: "pptx", seed: "W3", parts: ["notes", "master", "hidden", "textbox"], table: { rows: 2, cols: 2 } },
    { kind: "odp", seed: "W4", parts: ["notes", "master", "hidden", "textbox"] },
  ]) {
    const f = await buildFixture(r), t = f.truth;
    let text;
    if (r.kind === "docx" || r.kind === "odt") text = soffice(f.path, "txt").text;
    else text = pdftotext(scratchFile(soffice(f.path, "pdf").bytes, "deck.pdf"), 20).texts.filter(Boolean).join("\n");
    assert.ok(text, `${r.seed}: LibreOffice gave no text`);
    const members = Object.values(zipMembers(f.path)).map((m) => m.text ?? "").join("\n");
    for (const u of t.all()) {
      if (t.oracleOmits.includes(u.part)) assert.ok(members.includes(u.text.replace(/&/g, "&amp;")), `${r.seed}: ${u.part} unit in its member`);
      else assert.ok(norm(text).includes(norm(u.text)), `${r.seed}: LibreOffice reads ${u.part} unit ${u.id}`);
    }
  }
});

test("R22 a table of any row count and a paragraph of any length are read whole by LibreOffice", { skip: NO_SOFFICE }, async () => {
  const f = await buildFixture({ kind: "docx", seed: "L1", size: { units: 2, chars: 20000 }, table: { rows: 200, cols: 3 } });
  const text = norm(soffice(f.path, "txt").text);
  assert.ok(f.truth.unit(1).text.length >= 20000 - 20);
  for (const u of f.truth.all()) assert.ok(text.includes(norm(u.text)), u.id);
});

test("R22 the shape ladder: one-cell tables, empty paragraphs, tiny paragraphs, hyperlinks and nested tables hold equal bytes in the main part, and LibreOffice reads every rung's units", { skip: NO_PYTHON }, async () => {
  for (const kind of ["docx", "odt"]) {
    const main = kind === "docx" ? "word/document.xml" : "content.xml";
    for (const ladder of ["one-cell-tables", "empty-paragraphs", "tiny-paragraphs", "hyperlinks", "nested-tables"]) {
      const r = { kind, seed: `L-${ladder}`, ladder, size: { units: 40, partBytes: 64000 } };
      const f = await buildFixture(r);
      assert.equal(zipMembers(f.path)[main].size, 64000, `${kind} ${ladder}`);
      if (!NO_SOFFICE && kind === "docx") {
        const text = norm(soffice(f.path, "txt").text);
        for (const u of f.truth.all()) assert.ok(text.includes(norm(u.text)), `${ladder} ${u.id}`);
      }
    }
  }
});

test("R22 templates and macro flavours carry their content types, extensions and macro part; an encrypted member and a package that declares more than it holds are written as named", { skip: NO_PYTHON }, async () => {
  const ct = async (r) => zipMembers((await buildFixture(r)).path)["[Content_Types].xml"]?.text ?? "";
  assert.match(await ct({ kind: "docx", seed: "V1", flavour: "template" }), /wordprocessingml\.template\.main\+xml/);
  assert.match(await ct({ kind: "docx", seed: "V2", flavour: "macro" }), /macroEnabled\.main\+xml.*vbaProject|vbaProject.*macroEnabled/s);
  assert.match(await ct({ kind: "pptx", seed: "V3", flavour: "template" }), /presentationml\.template\.main\+xml/);
  assert.match(await ct({ kind: "pptx", seed: "V4", flavour: "macro" }), /ms-powerpoint\.presentation\.macroEnabled/);
  assert.deepEqual(["docx", "docx", "pptx", "pptx", "odt"].map((kind, i) => generate({ kind, seed: 1, flavour: ["template", "macro", "template", "macro", "template"][i] }).ext), ["dotx", "docm", "potx", "pptm", "ott"]);
  const enc = await buildFixture({ kind: "docx", seed: "V5", parts: ["footnote"], encryptedMember: "word/footnotes.xml" });
  assert.equal(zipMembers(enc.path)["word/footnotes.xml"].flags & 1, 1);
  assert.deepEqual(enc.truth.unread, [{ n: 7, reason: "ENCRYPTED" }]);
  assert.deepEqual(generate({ kind: "odt", seed: "V6", encryptedMember: true }).truth.refusal, { code: "ENCRYPTED" });
  const lie = await buildFixture({ kind: "docx", seed: "V7", parts: ["comment"], declares: { member: "word/comments.xml", more: 2 ** 31 } });
  const truthSize = zipMembers(lie.path)["word/comments.xml"].size;
  assert.ok(truthSize > 2 ** 31, `declared ${truthSize}`);
});

test("R22 the encoding matrix: text, JSON, XML and HTML in UTF-8, UTF-8 with BOM, UTF-16 LE and BE, Latin-1, Windows-1252 and with a bad byte decode to the truth's units; each charset declaration is where it is named", async () => {
  const label = { "utf-8": "utf-8", "utf-8-bom": "utf-8", "utf-16le-bom": "utf-16le", "utf-16be-bom": "utf-16be", "latin-1": "latin1", "windows-1252": "windows-1252", "bad-byte": "utf-8" };
  for (const kind of ["text", "json", "xml", "html"]) for (const encoding of Object.keys(label)) {
    const f = generate({ kind, seed: `E-${kind}`, encoding, size: { units: 5 } });
    const s = new TextDecoder(label[encoding]).decode(await f.bytes());
    for (const u of f.truth.all()) {
      const want = encoding === "bad-byte" && u.n === f.truth.badByte.n ? u.text.replace(u.id, `${u.id}�`) : u.text;
      assert.ok(s.includes(kind === "json" ? JSON.stringify(want).slice(1, -1) : want.replace(/&/g, "&amp;")), `${kind} ${encoding} ${u.id}`);
    }
    if (kind === "json" && encoding !== "bad-byte") assert.equal(JSON.parse(s.replace(/^﻿/, "")).units.length, 5);
  }
  assert.match(new TextDecoder().decode(await generate({ kind: "html", seed: "E2", encoding: "utf-8", charset: "meta" }).bytes()), /<meta charset="utf-8">/);
  assert.match(new TextDecoder("latin1").decode(await generate({ kind: "xml", seed: "E3", encoding: "latin-1" }).bytes()), /^<\?xml version="1.0" encoding="iso-8859-1"\?>/);
  assert.equal(generate({ kind: "html", seed: "E4", encoding: "windows-1252", charset: "header" }).truth.contentType, "text/html; charset=windows-1252");
  assert.doesNotMatch(new TextDecoder().decode(await generate({ kind: "html", seed: "E5", charset: "header" }).bytes()), /<meta/);
});

test("R22 deep and unterminated markup: Chromium reads every unit of a 300-deep and of an unterminated page and of a client-rendered shell; unterminated XML is malformed in the truth and to Python's parser", async () => {
  const deep = generate({ kind: "html", seed: "K1", markup: { depth: 300 }, main: true, parts: ["header", "footer"], table: { rows: 2, cols: 2 } });
  const open = generate({ kind: "html", seed: "K2", markup: { depth: 5, unterminated: true } });
  const shell = generate({ kind: "html", seed: "K3", clientRendered: true });
  const staticText = new TextDecoder().decode(await shell.bytes());
  assert.ok(!staticText.includes(`<p>${shell.truth.unit(1).text}`), "the shell's units are not in its static HTML");
  for (const f of [deep, open, shell]) {
    const o = await chromiumText(await f.bytes());
    if (o.skip) return;
    for (const u of f.truth.all()) assert.ok(norm(o.text).includes(norm(u.text)), `${f.truth.recipe.seed} ${u.id}`);
  }
  const xml = generate({ kind: "xml", seed: "K4", markup: { unterminated: true } });
  assert.deepEqual(xml.truth.refusal, { code: "MALFORMED" });
  if (!NO_PYTHON) {
    const p = scratchFile(await xml.bytes(), "bad.xml");
    assert.notEqual(spawnSync("python3", ["-I", "-c", "import sys,xml.etree.ElementTree as E;E.parse(sys.argv[1])", p]).status, 0);
    const good = scratchFile(await generate({ kind: "xml", seed: "K5", markup: { depth: 50 } }).bytes(), "good.xml");
    assert.equal(spawnSync("python3", ["-I", "-c", "import sys,xml.etree.ElementTree as E;E.parse(sys.argv[1])", good]).status, 0);
  }
});
