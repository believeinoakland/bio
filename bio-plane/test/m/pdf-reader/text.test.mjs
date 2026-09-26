/* pdf-reader: requirement-named tests for Tier 1 text, the producer signal and
 * pageShowsText (build/requirements/pdf-reader.md R9-R15), at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractPdfStructure, pageShowsText, openPdf } from "../../../src/pdfstructure.mjs";
import { build, doc, flate, hex } from "./pdf.mjs";

const text = async (bytes) => (await extractPdfStructure(bytes)).text;
/** R14 speaks of no_text_layer alone; an image page may also carry R26's marker. */
const r14 = (p) => p.undetermined.filter((m) => !m.reason.startsWith("image_content"));
const page1 = async (content, o = {}) => (await text(doc([{ content, ...o }], o))).pages[0];
const ENC = "<< /Filter /Standard /V 1 /R 2 /O (owner) /U (user) /P -4 >>";
const IMG = { dict: "/Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8", data: "\x80" };
const form = (content, res = "", extra = "") => ({ dict: `/Type /XObject /Subtype /Form /BBox [0 0 600 800] ${res ? `/Resources << ${res} >>` : ""} ${extra}`, data: content });

test("R9: an encrypted document yields one document-level marker, no page walked, producer undetermined 'encrypted'", async () => {
  const bytes = doc([{ content: "BT /F1 10 Tf (secret) Tj ET" }, { content: "" }],
    { objs: { 90: ENC, 91: "<< /Producer (Tesseract) >>" }, trailer: "trailer\n<< /Root 1 0 R /Encrypt 90 0 R /Info 91 0 R >>\n" });
  const r = await extractPdfStructure(bytes);
  assert.deepEqual(r.text, {
    document: "", pages: [],
    undetermined: [{ page: null, reason: "encrypted", font: null, codes: "", count: 0 }],
    counts: { chars: 0, undetermined: 1 },
    producer: { producer: null, creator: null, determination: "undetermined", ocr: null, why: "encrypted" },
  });
  assert.equal(r.images, null);
  assert.equal(r.imagesWhy, "encrypted");
});

test("R10: producer read from a classic trailer's /Info; every OCR marker names its product and field", async () => {
  const cases = [
    ["ABBYY FineReader Engine 11", "abbyy"], ["FineReader 15", "finereader"], ["Tesseract 5.3", "tesseract"],
    ["OmniPage CSDK", "omnipage"], ["Readiris Pro", "readiris"], ["ocrmypdf 14.0", "ocrmypdf"],
    ["Adobe Acrobat Capture 3.0", "acrobat-capture"], ["Scan-OCR Suite", "ocr"],
  ];
  for (const [name, marker] of cases) {
    const p = await text(doc([{ content: "" }], { objs: { 91: `<< /Producer (${name}) >>` }, trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" }));
    assert.deepEqual(p.producer, { producer: name, creator: null, determination: "ocr", why: null,
      ocr: { engine: name, field: "producer", marker } }, name);
  }
  const c = await text(doc([{ content: "" }], { objs: { 91: "<< /Producer (Writer 2) /Creator (tesseract) >>" }, trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" }));
  assert.deepEqual(c.producer.ocr, { engine: "tesseract", field: "creator", marker: "tesseract" });
  // word-anchored: letters inside a word do not fire
  const w = await text(doc([{ content: "" }], { objs: { 91: "<< /Producer (Procrustes Writer) >>" }, trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" }));
  assert.equal(w.producer.determination, "undetermined");
});

test("R10: an xref stream's /Info; the last candidate wins; a dangling one falls back; absence reads undetermined", async () => {
  const xref = await text(doc([{ content: "" }], { objs: { 91: "<< /Producer (Tesseract) >>", 95: { dict: "/Type /XRef /Info 91 0 R /Root 1 0 R", data: "" } }, trailer: "" }));
  assert.equal(xref.producer.ocr.marker, "tesseract");
  const two = "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n", later = "trailer\n<< /Root 1 0 R /Info 92 0 R >>\n";
  const last = await text(doc([{ content: "" }], { objs: { 91: "<< /Producer (Tesseract) >>", 92: "<< /Producer (Plain Writer) >>" }, trailer: two + later }));
  assert.deepEqual([last.producer.producer, last.producer.determination, last.producer.why], ["Plain Writer", "undetermined", "no_ocr_marker_in_producer_metadata"]);
  const dangling = await text(doc([{ content: "" }], { objs: { 91: "<< /Producer (OmniPage) >>" }, trailer: two + "trailer\n<< /Root 1 0 R /Info 99 0 R >>\n" }));
  assert.equal(dangling.producer.ocr.marker, "omnipage");
  for (const info of ["<< >>", "<< /Producer 5 /Creator /Name >>", "<< /Producer () >>"]) {
    const p = await text(doc([{ content: "" }], { objs: { 91: info }, trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" }));
    assert.deepEqual(p.producer, { producer: null, creator: null, determination: "undetermined", ocr: null, why: "no_producer_metadata" }, info);
  }
  const none = await text(doc([{ content: "" }]));
  assert.equal(none.producer.why, "no_producer_metadata");
});

test("R11: Tj, TJ, ' and \" are read from every content stream, concatenated", async () => {
  const bytes = doc([{ content: null, contents: "[101 0 R 102 0 R]" }],
    { objs: { 101: { dict: "/Filter /FlateDecode", data: flate("BT /F1 10 Tf 12 TL (one) Tj") },
              102: { data: "[(tw) (o)] TJ (three) ' 1 2 (four) \" ET" } } });
  const t = await text(bytes);
  assert.equal(t.pages[0].text, "onetwo\nthree\nfour");
  assert.deepEqual(t.pages[0].undetermined, []);
});

test("R11: a Form XObject's text is read with its own /Resources; text state is restored after it", async () => {
  const bytes = doc([{ content: "BT /F1 10 Tf (page) Tj ET /Fm1 Do BT 0 -20 Td (after) Tj ET", resources: `${"/Font << /F1 10 0 R >>"} /XObject << /Fm1 20 0 R >>` }],
    { objs: { 20: form("BT /G 10 Tf 0 -10 Td (form) Tj ET", "/Font << /G 10 0 R >>", "/Matrix [1 0 0 1 0 -5]") } });
  const t = await text(bytes);
  assert.equal(t.pages[0].text, "page\nform\nafter");
  assert.deepEqual(t.pages[0].undetermined, []);
});

test("R11: a form nested past depth 8 or in a cycle is counted form_text_unread; an undecodable form is form_stream_undecodable", async () => {
  const chain = (n) => {
    const objs = {};
    for (let k = 1; k <= n; k++) {
      objs[19 + k] = form(k < n ? "/Fm Do" : "BT /F1 10 Tf (deep) Tj ET", `/Font << /F1 10 0 R >> ${k < n ? `/XObject << /Fm ${20 + k} 0 R >>` : ""}`);
    }
    return doc([{ content: "/Fm Do", resources: "/XObject << /Fm 20 0 R >>" }], { objs });
  };
  const eight = await text(chain(8));
  assert.equal(eight.pages[0].text, "deep");
  const nine = await text(chain(9));
  assert.equal(nine.pages[0].text, "");
  assert.deepEqual(nine.pages[0].undetermined, [{ page: 0, reason: "form_text_unread", font: null, codes: "", count: 4 }]);
  const cyc = await text(doc([{ content: "/A Do", resources: "/XObject << /A 20 0 R >>" }],
    { objs: { 20: form("BT /F1 10 Tf (xy) Tj ET /B Do", "/Font << /F1 10 0 R >> /XObject << /B 21 0 R >>"), 21: form("/A Do", "/XObject << /A 20 0 R >>") } }));
  assert.equal(cyc.pages[0].text, "xy");
  assert.deepEqual(cyc.pages[0].undetermined, [{ page: 0, reason: "form_text_unread", font: null, codes: "", count: 2 }]);
  const bad = await extractPdfStructure(doc([{ content: "/A Do", resources: "/XObject << /A 20 0 R >>" }],
    { objs: { 20: { dict: "/Type /XObject /Subtype /Form /Filter /FlateDecode", data: "not flate" } } }));
  assert.deepEqual(bad.text.pages[0].undetermined, [{ page: 0, reason: "form_stream_undecodable", font: null, codes: "", count: 0 }]);
  assert.ok(bad.notes.includes("form_stream_undecodable"));
});

test("R12: /ToUnicode bfchar, incrementing bfrange and array bfrange decode, at the codespace's width", async () => {
  const cmap = "1 begincodespacerange <0000> <FFFF> endcodespacerange "
    + "2 beginbfchar <0001> <0048> <0002> <00690021> endbfchar "
    + "2 beginbfrange <0010> <0012> <0061> <0020> <0021> [<0058> <0059>] endbfrange";
  const objs = {
    20: "<< /Type /Font /Subtype /Type0 /BaseFont /Comp /Encoding /Identity-H /DescendantFonts [21 0 R] /ToUnicode 22 0 R >>",
    21: "<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Comp >>",
    22: { data: cmap },
    23: "<< /Type /Font /Subtype /Type1 /BaseFont /Single /ToUnicode 24 0 R >>",
    24: { data: "1 beginbfchar <41> <263A> endbfchar" },
  };
  const t = await page1(`BT /C 10 Tf <0001000200100011001200200021> Tj /S 10 Tf <41> Tj ET`, { resources: "/Font << /C 20 0 R /S 23 0 R >>", objs });
  assert.equal(t.text, "Hi!abcXY☺");
  assert.deepEqual(t.undetermined, []);
});

test("R12: every undecodable run is a named marker; no character is guessed", async () => {
  const objs = {
    20: "<< /Type /Font /Subtype /Type0 /BaseFont /CidNoMap /Encoding /Identity-H /DescendantFonts [21 0 R] >>",
    21: "<< /Type /Font /Subtype /CIDFontType0 >>",
    23: "<< /Type /Font /Subtype /Type1 /BaseFont /SimpleNoMap >>",
    25: "<< /Type /Font /Subtype /Type0 /BaseFont /Wide /Encoding /Identity-H /DescendantFonts [21 0 R] /ToUnicode 26 0 R >>",
    26: { data: "1 begincodespacerange <0000> <FFFF> endcodespacerange 1 beginbfchar <0041> <0041> endbfchar" },
  };
  const res = "/Font << /F1 10 0 R /C 20 0 R /S 23 0 R /W 25 0 R >>";
  const t = await page1(`BT (a) Tj /Nope 10 Tf (b) Tj /C 10 Tf <00410042> Tj /S 10 Tf (cd) Tj /F1 10 Tf <01> Tj /W 10 Tf <0041004200> Tj ET`, { resources: res, objs });
  assert.equal(t.text, "A");
  assert.deepEqual(t.undetermined, [
    { page: 0, reason: "no_current_font", font: null, codes: "61", count: 1 },
    { page: 0, reason: "font_not_in_resources", font: "Nope", codes: "62", count: 1 },
    { page: 0, reason: "cid_font_no_tounicode", font: "CidNoMap", codes: "00410042", count: 2 },
    { page: 0, reason: "no_tounicode", font: "SimpleNoMap", codes: "6364", count: 2 },
    { page: 0, reason: "unmapped_code", font: "Plain", codes: "01", count: 1 },
    { page: 0, reason: "unmapped_code", font: "Wide", codes: "0042", count: 1 },
    { page: 0, reason: "code_width_misaligned", font: "Wide", codes: "00", count: 1 },
  ]);
  const long = await page1(`BT ${hex("x".repeat(80))} Tj ET`);
  assert.equal(long.undetermined[0].codes, "78".repeat(64) + "…");
});

test("R13: a line breaks only when the device baseline moves", async () => {
  const t = await page1("BT /F1 10 Tf 12 TL 100 700 Td (a) Tj 5 0 Td (b) Tj 0 -12 Td (c) Tj T* (d) Tj 1 0 0 1 111 676 Tm (e) Tj 1 0 0 1 0 600 Tm (f) Tj ET q 1 0 0 1 0 -50 cm BT /F1 10 Tf 0 600 Td (g) Tj ET Q");
  assert.equal(t.text, "ab\nc\nde\nf\ng");
});

test("R13: a same-baseline jump beyond 0.25 em inserts one space, judged from the pen's tracked advance", async () => {
  // (ab) at 10 pt with 0.5 em glyphs leaves the pen at x=10; the gap is (x-10)/10 em.
  const at = async (x, font = "F1") => (await page1(`BT /${font} 10 Tf 0 0 Td (ab) Tj ${x} 0 Td (cd) Tj ET`)).text;
  assert.equal(await at(12.5), "abcd");     // 0.25 em: not beyond
  assert.equal(await at(12.6), "ab cd");    // 0.26 em
  assert.equal(await at(7.4), "ab cd");     // backward 0.26 em: magnitude
  assert.equal(await at(7.5), "abcd");
  assert.equal(await at(10), "abcd");
  assert.equal(await at(300, "F2"), "abcd"); // widths unknown: no gap judged
  assert.equal((await page1("BT /F1 10 Tf 0 0 Td (a b) Tj 20 0 Td (c) Tj ET")).text, "a b c");
  // Tc, Tw and Tz enter the advance: with Tc 1 the pen ends at 12, so 14.4 is 0.24 em
  assert.equal((await page1("BT /F1 10 Tf 1 Tc 0 0 Td (ab) Tj 14.4 0 Td (cd) Tj ET")).text, "abcd");
  assert.equal((await page1("BT /F1 10 Tf 200 Tz 0 0 Td (ab) Tj 22.4 0 Td (cd) Tj ET")).text, "abcd");
});

test("R13: inside TJ, a forward displacement beyond 0.1 em inserts a space; a backward one never does", async () => {
  const tj = async (n) => (await page1(`BT /F1 10 Tf [(ab) ${n} (cd)] TJ ET`)).text;
  assert.equal(await tj(-100), "abcd");
  assert.equal(await tj(-101), "ab cd");
  assert.equal(await tj(-600), "ab cd");
  assert.equal(await tj(900), "abcd");
  assert.equal(await tj(30), "abcd");
});

test("R14: a page that shows no text and declares an image carries exactly one no_text_layer marker", async () => {
  const noFont = await page1("q 600 0 0 800 0 0 cm /Im Do Q", { resources: "/XObject << /Im 20 0 R >>", objs: { 20: IMG } });
  assert.deepEqual(r14(noFont), [{ page: 0, reason: "no_text_layer", font: null, codes: "", count: 0 }]);
  const unusedFonts = await page1("BT ET q 600 0 0 800 0 0 cm /Im Do Q", { resources: `${"/Font << /F1 10 0 R >>"} /XObject << /Im 20 0 R >>`, objs: { 20: IMG } });
  assert.deepEqual(r14(unusedFonts), [{ page: 0, reason: "no_text_layer", font: null, codes: "", count: 0 }]);
});

test("R14: no no_text_layer when the page shows text, declares no image, or its showing is undetermined", async () => {
  const shows = await page1("BT /F1 10 Tf ( ) Tj ET /Im Do", { resources: `/Font << /F1 10 0 R >> /XObject << /Im 20 0 R >>`, objs: { 20: IMG } });
  assert.deepEqual(r14(shows), []);
  const blank = await page1("", { resources: "" });
  assert.deepEqual(blank.undetermined, []);
  const unknown = await page1("/Im Do /Gone Do", { resources: `/Font << /F1 10 0 R >> /XObject << /Im 20 0 R /Gone 99 0 R >>`, objs: { 20: IMG } });
  assert.ok(!unknown.undetermined.some((m) => m.reason === "no_text_layer"));
  const otherMarker = await page1("BT (x) Tj ET /Im Do", { resources: "/XObject << /Im 20 0 R >>", objs: { 20: IMG } });
  assert.deepEqual(r14(otherMarker).map((m) => m.reason), ["no_current_font"]);
});

test("R15: pageShowsText is true, false, or null (undetermined) — never false for what it could not read", async () => {
  const ask = async (content, resources, objs = {}) => {
    const d = await openPdf(doc([{ content, resources }], { objs }));
    return pageShowsText(d, d.pageDict(0));
  };
  assert.equal(await ask("BT ET", ""), false);
  for (const op of ["(x) Tj", "[(x)] TJ", "(x) '", "1 2 (x) \""]) assert.equal(await ask(`BT ${op} ET`, ""), true, op);
  assert.equal(await ask("/Fm Do", "/XObject << /Fm 20 0 R >>", { 20: form("BT (in form) Tj ET") }), true);
  assert.equal(await ask("/Fm Do", "/XObject << /Fm 20 0 R >>", { 20: form("BT ET") }), false);
  assert.equal(await ask("/Gone Do", "/XObject << /Gone 99 0 R >>"), null);
  assert.equal(await ask("/Gone Do (x) Tj", "/XObject << /Gone 99 0 R >>"), true);
  assert.equal(await ask("/Fm Do", "/XObject << /Fm 20 0 R >>", { 20: { dict: "/Subtype /Form /Filter /FlateDecode", data: "junk" } }), null);
  assert.equal(await ask("/A Do", "/XObject << /A 20 0 R >>", { 20: form("/A Do", "/XObject << /A 20 0 R >>") }), null);
  // inline image data that spells an operator is not an operator
  assert.equal(await ask("BI /W 2 /H 1 /BPC 8 /CS /G ID Tj EI", ""), false);
  const undecodable = await openPdf(doc([{ content: { dict: "/Filter /FlateDecode", data: "junk" } }]));
  assert.equal(await pageShowsText(undecodable, undecodable.pageDict(0)), null);
  assert.equal(await pageShowsText(undecodable, null), null);
  assert.equal(await pageShowsText(undecodable, undefined), null);
});
