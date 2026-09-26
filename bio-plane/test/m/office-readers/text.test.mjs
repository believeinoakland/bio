/* office-readers, R11–R14: text() — the I2 text shape per format, the size
 * guard (OOXML declared bytes, CSV body bytes) and the CSV dialect. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { docxEntry } from "../../../src/docx.mjs";
import { pptxEntry } from "../../../src/pptx.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { csvEntry, CSV_SHEET_NAME } from "../../../src/csv.mjs";
import { sizeGuard, MEASURED_OOXML_TEXT_BOUND_BYTES } from "../../../src/ooxml.mjs";
import * as F from "./fixtures.mjs";

const sha = (s) => createHash("sha256").update(F.enc(s)).digest("hex");
const bytes = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const MiB = 1024 * 1024;
const BOUND = 20 * MiB;

function common(t, container, unitField) {
  assert.equal(t.ok, true);
  assert.equal(t.container, container);
  for (const k of ["document", "undetermined", "counts", "images", unitField]) assert.ok(k in t, `${container}.text has ${k}`);
  assert.ok(Array.isArray(t.undetermined));
}

/* ------------------------------------------------------------------ R11 */

test("R11 every text() carries {ok, container, document, undetermined, counts, images} and a per-unit list; ok:false when parts failed", async () => {
  common(await docxEntry.text(F.docx()), "docx", "paragraphs");
  common(await pptxEntry.text(F.pptx()), "pptx", "slides");
  common(await xlsxEntry.text(F.xlsx()), "xlsx", "sheets");
  common(await csvEntry.text(F.enc("a\n")), "csv", "sheets");
  const junk = F.enc("junk");
  for (const [e, c] of [[docxEntry, "docx"], [pptxEntry, "pptx"], [xlsxEntry, "xlsx"]]) {
    const t = await e.text(junk);
    assert.deepEqual(Object.keys(t).sort(), ["container", "ok", "reason"]);
    assert.equal(t.ok, false);
    assert.equal(t.container, c);
    assert.deepEqual(await e.text(undefined), { ok: false, container: c, reason: "PARTS_ABSENT" });
  }
});

test("R11 images: every image under the format's media directory, content-addressed and exhaustive; null when it could not be walked; csv always []", async () => {
  for (const [e, build, dir] of [[docxEntry, F.docx, "word/media/"], [pptxEntry, F.pptx, "ppt/media/"], [xlsxEntry, F.xlsx, "xl/media/"]]) {
    const t = await e.text(build({ extra: [{ name: `${dir}a.png`, data: "PNG" }, { name: `${dir}b.jpeg`, data: "JPG" }, { name: `${dir}notes.txt`, data: "t" }, { name: "other/c.png", data: "C" }] }));
    assert.deepEqual(t.images, [
      { kind: "image", ref: `image ${sha("PNG").slice(0, 12)}`, part: sha("PNG"), mime: "image/png", name: "a.png" },
      { kind: "image", ref: `image ${sha("JPG").slice(0, 12)}`, part: sha("JPG"), mime: "image/jpeg", name: "b.jpeg" },
    ]);
    assert.deepEqual((await e.text(build())).images, []);
    const bad = await e.text(build({ extra: [{ name: `${dir}a.png`, data: "PNG", cd: F.CORRUPT }] }));
    assert.equal(bad.images, null);
  }
  assert.deepEqual((await csvEntry.text(F.enc("a,b\n"))).images, []);
});

test("R11 docx text: <w:t> joined per paragraph, deleted text never in it, inserted text in it; paragraphs one per <w:p> incl. tables; tables in order, nested included", async () => {
  const cell = (t) => `<w:tc><w:p>${F.wr(t)}</w:p></w:tc>`;
  const nested = `<w:tbl><w:tblGrid><w:gridCol/></w:tblGrid><w:tr>${cell("in")}</w:tr></w:tbl>`;
  const body = F.wp(F.wr("A"), '<w:ins w:author="x">' + F.wr("+ins") + "</w:ins>", '<w:del><w:r><w:delText>gone</w:delText></w:r></w:del>', "<w:r><w:tab/><w:t>b</w:t><w:br/><w:t>c</w:t></w:r>")
    + `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/><w:gridCol/></w:tblGrid><w:tr>${cell("r1c1")}<w:tc>${nested}<w:p/></w:tc></w:tr><w:tr><w:tc><w:tcPr><w:gridSpan w:val="3"/></w:tcPr><w:p>${F.wr("wide")}</w:p></w:tc></w:tr></w:tbl>`
    + F.wp() + F.wp(F.wr("&amp;&lt;&#x263A;"));
  const t = await docxEntry.text(F.docx({ body }));
  assert.deepEqual(t.paragraphs, [
    { para: 0, ref: "¶1", text: "A+ins\tb\nc" }, { para: 1, ref: "¶2", text: "r1c1" }, { para: 2, ref: "¶3", text: "in" },
    { para: 3, ref: "¶4", text: "" }, { para: 4, ref: "¶5", text: "wide" }, { para: 5, ref: "¶6", text: "" }, { para: 6, ref: "¶7", text: "&<☺" },
  ]);
  assert.equal(t.document, "A+ins\tb\nc\nr1c1\nin\nwide\n&<☺");
  assert.ok(!t.document.includes("gone"));
  assert.deepEqual(t.tables, [{ table: 0, ref: "table 1", rows: 2, cols: 3 }, { table: 1, ref: "table 2", rows: 1, cols: 1 }]);
  assert.deepEqual((await docxEntry.text(F.docx({ body: F.wp(F.wr("x")) }))).tables, [], "a body with no tables is an empty list");
  assert.equal((await docxEntry.text(F.docx({ mainCd: F.CORRUPT }))).tables, null, "an unread body is null, never []");
});

test("R11 docx text: a paragraph inside a text box does not end its anchoring paragraph; the outer paragraph keeps its later text", async () => {
  const box = '<w:r><w:drawing><wps:txbx xmlns:wps="urn:wps"><w:txbxContent><w:p>' + F.wr("boxed") + "</w:p></w:txbxContent></wps:txbx></w:drawing></w:r>";
  const t = await docxEntry.text(F.docx({ body: F.wp(F.wr("before "), box, F.wr("after")) + F.wp(F.wr("next")) }));
  assert.deepEqual(t.paragraphs.map((p) => [p.para, p.text]), [[0, "before after"], [1, "boxed"], [2, "next"]]);
  const rels = F.rels([{ id: "rIdH", target: "http://example.org/", external: true }]);
  const s = await docxEntry.structure(F.docx({ rels, body: F.wp(F.wr("x"), box, `<w:hyperlink r:id="rIdH">${F.wr("link")}</w:hyperlink>`) }));
  assert.deepEqual(s.links[0].source, { kind: "doc-para", ref: "¶1", para: 0, run: 2 }, "a link after the box belongs to the outer paragraph, at its own run index");
});

test("R11 pptx text: slide text only, in deck order; speaker notes a distinct list never in document; hidden slides populated; deckLength from declared slots", async () => {
  const b = F.pptx({
    slides: [
      { file: "slide3.xml", texts: ["Third file, first slide", "second shape"], notes: "candid" },
      { file: "slide1.xml", texts: ["hidden one"], show: "0", notes: "hidden notes" },
      { file: "slide2.xml", texts: [] },
    ],
  });
  const t = await pptxEntry.text(b);
  assert.deepEqual(t.slides, [
    { slide: 1, ref: "slide 1", part: "ppt/slides/slide3.xml", hidden: false, shapes: 2, text: "Third file, first slide\nsecond shape" },
    { slide: 2, ref: "slide 2", part: "ppt/slides/slide1.xml", hidden: true, shapes: 1, text: "hidden one" },
    { slide: 3, ref: "slide 3", part: "ppt/slides/slide2.xml", hidden: false, shapes: 0, text: "" },
  ]);
  assert.deepEqual(t.speakerNotes, [
    { slide: 1, ref: "slide 1 (notes)", part: "ppt/notesSlides/notes_slide3.xml", hidden: false, text: "candid" },
    { slide: 2, ref: "slide 2 (notes)", part: "ppt/notesSlides/notes_slide1.xml", hidden: true, text: "hidden notes" },
  ]);
  assert.equal(t.document, "Third file, first slide\nsecond shape\nhidden one");
  assert.ok(!t.document.includes("candid"));
  assert.equal(t.counts.chars, t.document.length);
  assert.equal(t.counts.notesChars, "candid".length + "hidden notes".length);
  assert.equal(t.deckLength, 3);
  // an unresolvable sldId slot still counts toward the deck's length, and a trailing unreadable slide does not shorten it
  const pres = `<?xml version="1.0"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst><p:sldId id="256" r:id="rId10"/><p:sldId id="257" r:id="rIdGone"/><p:sldId id="258" r:id="rId11"/></p:sldIdLst></p:presentation>`;
  const t2 = await pptxEntry.text(F.pptx({ presentation: pres, slides: [{ file: "a.xml", texts: ["a"] }, { file: "b.xml", texts: ["b"], cd: F.CORRUPT }] }));
  assert.equal(t2.deckLength, 3);
  assert.deepEqual(t2.slides.map((s) => s.slide), [1]);
  assert.ok(t2.undetermined.some((u) => u.reason === "slide_unreadable" && u.part === "ppt/slides/b.xml"));
});

test("R11 xlsx text: tab-joined rows, newline-joined across rows and sheets; the fixed grid bound; the used range from cells; shared strings stated when unresolvable", async () => {
  const b = F.xlsx({
    sheets: [
      { name: "One", data: { rows: [
        { r: 1, cells: [{ r: "A1", t: "s", v: "0" }, { r: "B1", v: "3.5" }, { r: "C1", t: "b", v: "1" }] },
        { r: 2, cells: [{ r: "A2", t: "s", v: "7" }, { r: "C2", t: "inlineStr", is: "inline" }, { r: "D2", t: "e", v: "#DIV/0!" }] },
        { r: 3, cells: [{ r: "A3", t: "str", f: "A1&amp;\"!\"", v: "zero!" }] },
        { r: 40, cells: [] },
      ] } },
      { name: "Two", state: "hidden", data: { rows: [{ r: 2, cells: [{ r: "B2", t: "inlineStr", is: "hidden text" }] }] } },
      { name: "Empty", data: {} },
    ],
    sharedStrings: `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><r><t>ze</t></r><r><t>ro</t></r><rPh sb="0" eb="1"><t>PHON</t></rPh></si></sst>`,
  });
  const t = await xlsxEntry.text(b);
  assert.equal(t.document, "zero\t3.5\tTRUE\ninline\t#DIV/0!\nzero!\nhidden text");
  assert.deepEqual(t.sheets.map(({ text, ...s }) => s), [
    { sheet: 0, name: "One", hidden: false, rows: 1048576, cols: 16384, usedRows: 3, usedCols: 4, range: { kind: "sheet-range", ref: "One!A1:D3", sheet: "One", range: "A1:D3" }, undetermined: [{ sheet: 0, cell: "A2", reason: "shared_string_index_out_of_range" }] },
    { sheet: 1, name: "Two", hidden: "hidden", rows: 1048576, cols: 16384, usedRows: 2, usedCols: 2, range: { kind: "sheet-range", ref: "Two!A1:B2", sheet: "Two", range: "A1:B2" }, undetermined: [] },
    { sheet: 2, name: "Empty", hidden: false, rows: 1048576, cols: 16384, usedRows: 0, usedCols: 0, range: null, undetermined: [] },
  ]);
  assert.ok(!t.document.includes("PHON"), "a phonetic reading guide is not the cell's text");
  const noSst = await xlsxEntry.text(F.xlsx({ sheets: [{ name: "S", data: { rows: [{ r: 1, cells: [{ r: "A1", t: "s", v: "0" }] }] } }], sharedStrings: F.sst(["x"]), sharedStringsCd: F.CORRUPT }));
  assert.deepEqual(noSst.undetermined, [{ sheet: 0, cell: "A1", reason: "shared_strings_unreadable" }]);
  const unread = await xlsxEntry.text(F.xlsx({ sheets: [{ name: "S", data: {}, cd: F.CORRUPT }] }));
  assert.deepEqual(unread.sheets[0], { sheet: 0, name: "S", hidden: false, rows: 1048576, cols: 16384, usedRows: null, usedCols: null, range: null, text: "", undetermined: [{ sheet: 0, cell: null, reason: "crc_mismatch" }] });
});

test("R11 csv text: one sheet, null bound, row 1 is row 1, empty fields are measured emptiness, quoted fields per RFC 4180", async () => {
  const t = await csvEntry.text(F.enc('name,note\r\n"Smith, J","said ""hi"""\r\n,x\r\n\r\nlast,row'));
  assert.equal(t.dialect.delimiter, "comma");
  assert.equal(t.document, 'name\tnote\nSmith, J\tsaid "hi"\nx\nlast\trow');
  assert.deepEqual(t.sheets, [{ sheet: 0, name: CSV_SHEET_NAME, hidden: false, rows: null, cols: null, usedRows: 5, usedCols: 2,
    range: { kind: "sheet-range", ref: `${CSV_SHEET_NAME}!A1:B5`, sheet: CSV_SHEET_NAME, range: "A1:B5" }, text: t.document, undetermined: [] }]);
  assert.deepEqual(t.undetermined, []);
  assert.equal(t.counts.cells, 7);
  // a line break inside quotes is literal; it does not end the record (past the signature's 50 lines)
  const m = await csvEntry.text(F.enc("a,b\n".repeat(50) + '"one\ntwo",3\n'));
  assert.equal(m.sheets[0].usedRows, 51);
  assert.ok(m.document.endsWith("\none\ntwo\t3"));
  // no delimiter determined: one column, rows still rows
  const one = await csvEntry.text(F.enc("x\ny\n"));
  assert.equal(one.document, "x\ny");
  assert.equal(one.sheets[0].usedCols, 1);
});

test("R11 csv text: under an undetermined encoding the grid stands; only fields holding a byte >= 0x80 are undetermined, by sheet-cell, never mojibake", async () => {
  const t = await csvEntry.text(bytes("id,dash\n1,a\x96b\n2,plain\n\x93q\x94,3\n"));
  assert.equal(t.dialect.encoding, null);
  assert.equal(t.document, "id\tdash\n1\n2\tplain\n3");
  assert.deepEqual(t.undetermined, [{ sheet: 0, cell: "B2", reason: "encoding_undetermined" }, { sheet: 0, cell: "A4", reason: "encoding_undetermined" }]);
  assert.equal(t.sheets[0].usedRows, 4);
  assert.equal(t.sheets[0].usedCols, 2);
});

test("R11 csv text: bytes past the signature window that the signature's encoding cannot read are stated per cell, never decoded into invented characters", async () => {
  const pad = "a,b\n".repeat((MiB >> 2) + 10); // more than the 1 MiB window, all ASCII
  const ascii = await csvEntry.text(new Uint8Array([...F.enc(pad), ...bytes("x,\x96\n")]));
  assert.equal(ascii.dialect.encoding, "us-ascii");
  const row = (MiB >> 2) + 11;
  assert.deepEqual(ascii.undetermined, [{ sheet: 0, cell: `B${row}`, reason: "not_us_ascii" }]);
  assert.ok(ascii.document.endsWith("\nx"));
  const utf = await csvEntry.text(new Uint8Array([...F.enc("é,1\n"), ...F.enc(pad), ...F.enc("ü,"), 0xc3, 0x28, 0x0a]));
  assert.equal(utf.dialect.encoding, "utf-8");
  assert.deepEqual(utf.undetermined, [{ sheet: 0, cell: `B${row + 1}`, reason: "invalid_utf8" }]);
  assert.ok(utf.document.startsWith("é\t1\n"));
  assert.ok(utf.document.endsWith("\nü"));
  assert.ok(!utf.document.includes("�"));
});

test("R11 csv text: a UTF-16 body (BOM) is decoded whole; a body that is not valid UTF-16 states the cells it spoils", async () => {
  const le = (s) => { const out = [0xff, 0xfe]; for (const c of s) { const n = c.charCodeAt(0); out.push(n & 255, n >> 8); } return new Uint8Array(out); };
  const ok = await csvEntry.text(le("a,é\n1,2\n"));
  assert.equal(ok.document, "a\té\n1\t2");
  const bad = new Uint8Array([...le("a,b\n1,"), 0x00, 0xd8, 0x0a, 0x00]); // a lone high surrogate
  const t = await csvEntry.text(bad);
  assert.deepEqual(t.undetermined, [{ sheet: 0, cell: "B2", reason: "invalid_utf16" }]);
  assert.equal(t.document, "a\tb\n1");
});

/* ------------------------------------------------------------------ R12 */

test("R12 docx guard: word/document.xml + word/comments.xml declared bytes over the bound refuse text with the guard's marker verbatim; rels and core still run", async () => {
  const half = { usize: BOUND / 2 + 1 };
  const rels = F.rels([{ id: "rIdH", target: "http://example.org/", external: true }]);
  const b = F.docx({ mainCd: half, comments: "<w:comments/>", commentsCd: half, rels, core: F.core({ creator: "c" }) });
  const t = await docxEntry.text(b);
  assert.equal(t.document, null);
  assert.deepEqual(t.paragraphs, []);
  assert.equal(t.tables, null);
  assert.deepEqual(t.undetermined, [sizeGuard(BOUND + 2)]);
  const s = await docxEntry.structure(b);
  assert.equal(s.links[0].target.url, "http://example.org/");
  assert.equal(s.evidentiary.items.find((i) => i.kind === "core-properties").creator, "c");
  assert.ok(s.evidentiary.undetermined.some((u) => u.why === "over_size_bound"));
  // exactly at the bound is not over it
  const at = await docxEntry.text(F.docx({ mainCd: { usize: MEASURED_OOXML_TEXT_BOUND_BYTES } }));
  assert.ok(!at.undetermined.some((u) => u.why === "over_size_bound"));
  // parts outside the guarded family do not count toward it
  const other = await docxEntry.text(F.docx({ extra: [{ name: "word/styles.xml", data: "<x/>", cd: { usize: BOUND * 2 } }] }));
  assert.equal(other.document, "Hello");
});

test("R12 pptx guard: every slide + notesSlide part summed; over it text is refused while presentation.xml numbering, deckLength and hidden flags survive", async () => {
  const b = F.pptx({ slides: [
    { file: "slide1.xml", texts: ["a"], cd: { usize: BOUND / 2 }, notes: "n" },
    { file: "slide2.xml", texts: ["b"], sldIdShow: "0", cd: { usize: BOUND / 2 } },
  ] });
  const t = await pptxEntry.text(b);
  assert.equal(t.document, null);
  assert.deepEqual(t.slides, []);
  assert.deepEqual(t.speakerNotes, []);
  assert.equal(t.deckLength, 2);
  assert.equal(t.undetermined[0].why, "over_size_bound");
  assert.equal(t.undetermined[0].boundName, "MEASURED_OOXML_TEXT_BOUND_BYTES");
  const s = await pptxEntry.structure(b);
  assert.equal(s.slides, 2);
  assert.deepEqual(s.evidentiary.items.filter((i) => i.kind === "hidden-slide").map((i) => i.slide), [2]);
});

test("R12 xlsx guard: every worksheet part + sharedStrings summed; over it text is refused while workbook names, order and hidden state survive", async () => {
  const b = F.xlsx({ sheets: [{ name: "A", data: {}, cd: { usize: BOUND } }, { name: "B", state: "hidden", data: {} }], sharedStrings: F.sst(["x"]) });
  const t = await xlsxEntry.text(b);
  assert.equal(t.document, null);
  assert.equal(t.undetermined.length, 1);
  assert.equal(t.undetermined[0].metric, "declared_uncompressed_text_part_bytes");
  const s = await xlsxEntry.structure(b);
  assert.deepEqual(s.sheets.map((x) => [x.name, x.hidden]), [["A", false], ["B", "hidden"]]);
  assert.ok(s.notes.includes("text_parts_over_bound"));
});

/* ------------------------------------------------------------------ R13 */

test("R13 csv guard: the body's own byte length after any BOM against MEASURED_CSV_TEXT_BOUND_BYTES; over it both structure and text carry the marker; the dialect stands", async () => {
  const line = "aaaaaaa,b\n";
  const body = F.enc(line.repeat(Math.ceil((BOUND + 1) / line.length)));
  const t = await csvEntry.text(body);
  assert.equal(t.document, null);
  assert.deepEqual(t.undetermined, [{ ok: false, text: "undetermined", why: "over_size_bound", size: body.length, bound: BOUND, boundName: "MEASURED_CSV_TEXT_BOUND_BYTES", metric: "body_bytes" }]);
  assert.equal(t.dialect.delimiter, "comma");
  const s = await csvEntry.structure(body);
  assert.deepEqual(s.evidentiary.undetermined[0].guard, t.undetermined[0]);
  assert.equal(s.dialect.delimiter, "comma");
  // exactly the bound, with a BOM on top, is not over it: the BOM is not body
  const at = new Uint8Array(BOUND + 3).fill(0x61);
  at.set([0xef, 0xbb, 0xbf]);
  for (let i = 3; i < at.length; i += 10) at[i] = 0x0a;
  const under = await csvEntry.text(at);
  assert.notEqual(under.document, null);
});

/* ------------------------------------------------------------------ R14 */

test("R14 dialect encoding: BOM certain; no high byte us-ascii certain; valid utf-8 likely; otherwise null with encoding_undetermined", () => {
  const cases = [
    [[0xef, 0xbb, 0xbf, ...F.enc("a,b\n1,2\n")], "utf-8", "certain"],
    [[0xff, 0xfe, 0x61, 0, 0x0a, 0], "utf-16le", "certain"],
    [[0xfe, 0xff, 0, 0x61, 0, 0x0a], "utf-16be", "certain"],
    [F.enc("a,b\n1,2\n"), "us-ascii", "certain"],
    [F.enc("é,b\n1,2\n"), "utf-8", "likely"],
    [[0x61, 0x96, 0x0a], null, "none"],
    [[0xff, 0xfe, 0x00, 0x00, 0x61], null, "none"], // UTF-32LE is not read as UTF-16LE
  ];
  for (const [b, encoding, conf] of cases) {
    const d = csvEntry.dialect(new Uint8Array(b));
    assert.equal(d.encoding, encoding, JSON.stringify(b.slice(0, 5)));
    assert.equal(d.encodingConfidence, conf);
    assert.ok(Array.isArray(d.encodingSignals) && d.encodingSignals.length);
    assert.equal(d.undetermined.includes("encoding_undetermined"), encoding == null);
  }
  // only the first 1 MiB is the window, and a character the window's end cuts in two is not invalid
  const a = new Uint8Array(MiB + 10).fill(0x61);
  a[MiB + 5] = 0x96;
  assert.equal(csvEntry.dialect(a).encoding, "us-ascii");
  const u = new Uint8Array(MiB + 10).fill(0x61);
  u[MiB - 1] = 0xc3; u[MiB] = 0xa9;
  assert.equal(csvEntry.dialect(u).encoding, "utf-8");
});

test("R14 dialect delimiter: exactly one consistent candidate certain; tied, none consistent and too few lines each undetermined by name", () => {
  const d = (s) => csvEntry.dialect(F.enc(s));
  for (const [s, name] of [["a,b\n1,2\n", "comma"], ["a;b\n1;2\n", "semicolon"], ["a\tb\n1\t2\n", "tab"], ["a|b\n1|2\n", "pipe"], ['a,"x;y"\n1,"2;3;4"\n', "comma"]]) {
    const r = d(s);
    assert.equal(r.delimiter, name, s);
    assert.equal(r.delimiterConfidence, "certain");
    assert.deepEqual(r.undetermined, []);
  }
  const tied = d("a,b;c\n1,2;3\n");
  assert.equal(tied.delimiter, null);
  assert.deepEqual(tied.undetermined, ["delimiter_undetermined_tied"]);
  assert.deepEqual(d("a,b\n1,2,3\n").undetermined, ["delimiter_undetermined_none_consistent"]);
  assert.deepEqual(d("plain\nwords\n").undetermined, ["delimiter_undetermined_none_consistent"]);
  assert.deepEqual(d("a,b\n").undetermined, ["delimiter_undetermined_too_few_lines"]);
  assert.deepEqual(d("a,b\n1,2").undetermined, ["delimiter_undetermined_too_few_lines"], "the unterminated last line is not complete");
  // the first 50 complete lines decide: an inconsistency on line 51 does not count
  assert.equal(d("a,b\n".repeat(50) + "a,b,c\n").delimiter, "comma");
  assert.equal(d("a,b\n".repeat(49) + "a,b,c\n").delimiter, null);
  // both undetermined at once
  assert.deepEqual(csvEntry.dialect(new Uint8Array([0x96, 0x0a])).undetermined, ["encoding_undetermined", "delimiter_undetermined_too_few_lines"]);
});

test("R14 dialect: null for empty bytes or an undecodable BOM; the same computation structure() and text() report", async () => {
  assert.equal(csvEntry.dialect(new Uint8Array(0)), null);
  for (const s of ["a,b\n1,2\n", "a;b\n", "é|x\n1|2\n", "\x96,1\n2,3\n"]) {
    const b = bytes(s);
    const d = csvEntry.dialect(b);
    assert.deepEqual((await csvEntry.structure(b)).dialect, d);
    assert.deepEqual((await csvEntry.text(b)).dialect, d);
    assert.deepEqual(Object.keys(d).sort(), ["delimiter", "delimiterConfidence", "delimiterSignals", "encoding", "encodingConfidence", "encodingSignals", "undetermined"]);
  }
  const Real = globalThis.TextDecoder;
  globalThis.TextDecoder = class extends Real { constructor(l, o) { if (/utf-16/i.test(String(l))) throw new RangeError("x"); super(l, o); } };
  try { assert.equal(csvEntry.dialect(new Uint8Array([0xff, 0xfe, 0x61, 0])), null); } finally { globalThis.TextDecoder = Real; }
});
