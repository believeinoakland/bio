/* pdf-reader: requirement-named tests for the PdfDoc reader and the module's
 * invariants (build/requirements/pdf-reader.md R18-R25, R27-R29), at the
 * module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PdfDoc, openPdf, extractPdfStructure, pdfPageImages, pageShowsText, PRODUCER_DETERMINATIONS,
} from "../../../src/pdfstructure.mjs";
import { build, doc, flate, flateRaw, bytesOf } from "./pdf.mjs";

const ref = (n) => ({ t: "ref", n, g: 0 });
const IMG = { dict: "/Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceGray /BitsPerComponent 8", data: "\x80" };

test("R18: new PdfDoc holds the bytes; scanTopLevel, loadObjectStreams and buildPageIndex are R8's three steps", async () => {
  const bytes = doc([{ content: "" }, { content: "" }]);
  const d = new PdfDoc(bytes);
  assert.equal(d.bytes, bytes);
  assert.equal(d.pageCount, 0);
  assert.equal(d.dictOf(ref(100)), null);   // nothing read yet
  d.scanTopLevel();
  assert.equal(d.dictOf(ref(100)).Type.v, "Page");
  await d.loadObjectStreams();
  d.buildPageIndex();
  assert.equal(d.pageCount, 2);
  assert.equal(d.pageDict(1).Type.v, "Page");
});

test("R19: pageCount is 0 before buildPageIndex and for a document with no pages, else the page-order length", async () => {
  const d = new PdfDoc(doc([{ content: "" }, { content: "" }, { content: "" }]));
  d.scanTopLevel(); await d.loadObjectStreams();
  assert.equal(d.pageCount, 0);
  d.buildPageIndex();
  assert.equal(d.pageCount, 3);
  const none = await openPdf(build({ 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [] >>" }));
  assert.equal(none.pageCount, 0);
  assert.equal(none.pageDict(0), null);
});

test("R20: resolve follows a reference chain; unresolvable or cyclic chains are null; non-references pass through", async () => {
  const d = await openPdf(build({ 5: "6 0 R", 6: "7 0 R", 7: "42", 8: "9 0 R", 9: "8 0 R", 10: "/Name" }));
  assert.equal(d.resolve(ref(5)), 42);
  assert.deepEqual(d.resolve(ref(10)), { t: "name", v: "Name" });
  assert.equal(d.resolve(ref(99)), null);
  assert.equal(d.resolve(ref(8)), null);
  assert.equal(d.resolve(3), 3);
  assert.equal(d.resolve(true), true);
  assert.equal(d.resolve(null), null);
  assert.equal(d.resolve(undefined), null);
  const v = { t: "str", v: "x" };
  assert.equal(d.resolve(v), v);
});

test("R21: dictOf gives a dict's or a stream's map, else null", async () => {
  const d = await openPdf(build({ 5: "<< /A 1 >>", 6: { dict: "/B 2", data: "x" }, 7: "12", 8: "[1 2]", 9: "5 0 R" }));
  assert.equal(d.dictOf(ref(5)).A, 1);
  assert.equal(d.dictOf(ref(9)).A, 1);
  assert.equal(d.dictOf(ref(6)).B, 2);
  for (const v of [ref(7), ref(8), ref(99), 3, null, undefined, { t: "name", v: "A" }]) assert.equal(d.dictOf(v), null);
});

test("R22: streamRawBytes reads by an agreeing /Length, else scans to endstream; null for a non-stream or no endstream", async () => {
  const d = await openPdf(build({
    5: { data: "exact bytes" },
    6: { data: "wrong length", length: 3 },
    7: { data: "no length", length: null },
    8: { data: "count is 9 0 R", length: "9 0 R" },
    9: "14",
    10: "<< /Not /AStream >>",
  }));
  const s = (n) => Buffer.from(d.streamRawBytes(d.resolve(ref(n)))).toString("latin1");
  assert.equal(s(5), "exact bytes");
  assert.equal(s(6), "wrong length");
  assert.equal(s(7), "no length");
  assert.equal(s(8), "count is 9 0 R");
  assert.equal(d.streamRawBytes(d.resolve(ref(10))), null);
  assert.equal(d.streamRawBytes(null), null);
  assert.equal(d.streamRawBytes(42), null);
  const open = await openPdf(build({ 5: { data: "never closed", length: null, noEnd: true } }, { trailer: "" }));
  assert.equal(open.streamRawBytes(open.resolve(ref(5))), null);
});

test("R22: streamDecoded: unfiltered raw; Flate (zlib or raw deflate), PNG-un-predicted; null for other filters or failure", async () => {
  const rows = "\x02\x01\x02\x03\x02\x01\x01\x01";          // PNG Up, 3 columns
  const d = await openPdf(build({
    5: { data: "plain" },
    6: { dict: "/Filter /FlateDecode", data: flate("zlib body") },
    7: { dict: "/Filter [/Fl]", data: flateRaw("raw body") },
    8: { dict: "/Filter /FlateDecode /DecodeParms << /Predictor 12 /Columns 3 >>", data: flate(rows) },
    9: { dict: "/Filter /DCTDecode", data: "\xff\xd8" },
    10: { dict: "/Filter [/FlateDecode /ASCIIHexDecode]", data: flate("x") },
    11: { dict: "/Filter /FlateDecode", data: "not deflate at all" },
    12: { dict: "/Filter /FlateDecode /DecodeParms [<< /Predictor 12 /Columns 3 >>]", data: flate(rows) },
  }));
  const dec = async (n) => d.streamDecoded(d.resolve(ref(n)));
  const txt = async (n) => Buffer.from(await dec(n)).toString("latin1");
  assert.equal(await txt(5), "plain");
  assert.equal(await txt(6), "zlib body");
  assert.equal(await txt(7), "raw body");
  assert.deepEqual([...await dec(8)], [1, 2, 3, 2, 3, 4]);
  assert.deepEqual([...await dec(12)], [1, 2, 3, 2, 3, 4]);
  for (const n of [9, 10, 11]) assert.equal(await dec(n), null, String(n));
  assert.equal(await d.streamDecoded(null), null);
});

test("R23: isEncrypted is true exactly when a /Filter /Standard dict carries a numeric /R; cached", async () => {
  const enc = await openPdf(build({ 5: "<< /Filter /Standard /V 1 /R 3 /O (o) /U (u) /P -4 >>" }));
  assert.equal(enc.isEncrypted(), true);
  assert.equal(enc.isEncrypted(), true);
  for (const objs of [{ 5: "<< /Filter /Standard /V 1 >>" }, { 5: "<< /Filter /Standard /R (3) >>" },
                      { 5: "<< /Filter [/FlateDecode] /R 3 >>" }, { 5: "<< /Filter /FlateDecode /R 3 >>" }]) {
    assert.equal((await openPdf(build(objs))).isEncrypted(), false, objs[5]);
  }
});

test("R24: pure — no network, no clock, and the same bytes always give the same output", async () => {
  const bytes = doc([{ content: "BT /F1 10 Tf (Hello) Tj ET q 10 0 0 10 0 0 cm /I Do Q", resources: "/Font << /F1 10 0 R >> /XObject << /I 20 0 R >>", extra: "/Annots [30 0 R]" }],
    { objs: { 20: IMG, 30: "<< /Subtype /Link /Rect [0 0 1 1] /A << /S /URI /URI (https://example.org/) >> >>", 91: "<< /Producer (Tesseract) >>" },
      trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" });
  const saved = { fetch: globalThis.fetch, now: Date.now, perf: performance.now };
  const boom = () => { throw new Error("impure call"); };
  globalThis.fetch = boom; Date.now = boom; performance.now = boom;
  try {
    const a = await extractPdfStructure(bytes);
    const b = await extractPdfStructure(bytes.slice());
    assert.deepEqual(a, b);
    const d = await openPdf(bytes);
    assert.deepEqual(await pdfPageImages(d, 0), await pdfPageImages(await openPdf(bytes), 0));
    assert.equal(await pageShowsText(d, d.pageDict(0)), true);
  } finally {
    globalThis.fetch = saved.fetch; Date.now = saved.now; performance.now = saved.perf;
  }
});

test("R25: a Flate stream with bytes after its end still decodes; the trailing-byte count is noted", async () => {
  const junk = new Uint8Array([...flate("BT /F1 10 Tf (kept) Tj ET"), ...bytesOf("\r\nJUNK")]);
  const r = await extractPdfStructure(doc([{ content: { dict: "/Filter /FlateDecode", data: junk } }]));
  assert.equal(r.text.pages[0].text, "kept");
  assert.deepEqual(r.text.pages[0].undetermined, []);
  assert.deepEqual(r.notes.filter((n) => n.startsWith("flate_trailing_bytes")), ["flate_trailing_bytes:6"]);
  assert.deepEqual(r.images, []);
  const d = await openPdf(doc([{ content: { dict: "/Filter /FlateDecode", data: junk } }]));
  assert.equal(Buffer.from(await d.streamDecoded(d.resolve(ref(101)))).toString("latin1"), "BT /F1 10 Tf (kept) Tj ET");
});

test("R25: a page whose content cannot be read carries a page-level marker, never reads as blank", async () => {
  const whole = flate("BT /F1 10 Tf (lost) Tj ET");
  const truncated = whole.subarray(0, whole.length - 5);
  const r = await extractPdfStructure(doc([
    { content: { dict: "/Filter /FlateDecode", data: truncated } },
    { content: null, contents: "99 0 R" },
    { content: null, contents: "[97 0 R 98 0 R]" },
    { content: { dict: "/Filter /DCTDecode", data: "x" } },
    { content: null, contents: "" },
  ], { objs: { 97: { data: "" } } }));
  const reasons = r.text.pages.map((p) => p.undetermined.map((m) => m.reason));
  assert.deepEqual(reasons, [["content_stream_undecodable"], ["content_stream_unresolvable"],
    ["content_stream_unresolvable"], ["content_stream_undecodable"], []]);
  for (const p of r.text.pages.slice(0, 4)) {
    assert.deepEqual(p.undetermined[0], { page: p.page, reason: p.undetermined[0].reason, font: null, codes: "", count: 0 });
  }
  assert.ok(r.notes.includes("content_stream_undecodable"));
});

test("R27: every undetermined, why and reason names its kind — never a bare false or empty standing for every cause", async () => {
  const objs = { 20: IMG, 21: "<< /Type /Font /Subtype /Type1 >>" };
  const fixtures = [
    doc([{ content: "BT (a) Tj /X 1 Tf (b) Tj /N 1 Tf (c) Tj ET", resources: "/Font << /N 21 0 R >>" }], { objs }),
    doc([{ content: "q 600 0 0 800 0 0 cm /I Do Q", resources: "/XObject << /I 20 0 R >>" }], { objs }),
    doc([{ content: { dict: "/Filter /FlateDecode", data: "bad" } }, { content: "/Gone Do" }], { objs }),
    doc([{ content: "", extra: "/Annots [30 0 R 31 0 R 32 0 R]" }],
      { objs: { 30: "<< /Subtype /Link /Dest /none >>", 31: "<< /Subtype /Link >>", 32: "<< /Subtype /FileAttachment /FS 99 0 R >>" } }),
  ];
  const named = (v) => typeof v === "string" && /^[a-z][a-z0-9_]*[a-z0-9](:.*)?$/i.test(v);
  let seen = 0;
  for (const f of fixtures) {
    const r = await extractPdfStructure(f);
    for (const m of r.text.undetermined) { assert.ok(named(m.reason), JSON.stringify(m)); seen++; }
    for (const l of r.links.filter((x) => x.partition === "undetermined")) { assert.ok(named(l.target.why), JSON.stringify(l)); seen++; }
    if (r.images === null) { assert.ok(named(r.imagesWhy), r.imagesWhy); seen++; }
    assert.ok(named(r.text.producer.why) || r.text.producer.why === null);
    // a page with no text and no marker never showed text this reader could have read
    for (const p of r.text.pages) if (!p.text && !p.undetermined.length) {
      const d = await openPdf(f);
      assert.notEqual(await pageShowsText(d, d.pageDict(p.page)), true);
    }
  }
  assert.equal(seen, 9);
});

test("R28: producer.determination is only ever 'ocr' with a named engine, or 'undetermined' — never 'authored'", async () => {
  assert.deepEqual([...PRODUCER_DETERMINATIONS], ["ocr", "undetermined"]);
  assert.ok(Object.isFrozen(PRODUCER_DETERMINATIONS));
  const infos = ["<< /Producer (Tesseract) >>", "<< /Producer (Word Processor) /Creator (Author Tool) >>", "<< >>",
                 "<< /Creator (ABBYY) >>", "<< /Producer 7 >>"];
  for (const info of infos) {
    const { producer } = (await extractPdfStructure(doc([{ content: "BT /F1 10 Tf (typed by hand) Tj ET" }],
      { objs: { 91: info }, trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" }))).text;
    assert.ok(PRODUCER_DETERMINATIONS.includes(producer.determination), info);
    if (producer.determination === "ocr") {
      assert.ok(producer.ocr.engine && [producer.producer, producer.creator].includes(producer.ocr.engine));
      assert.equal(producer.why, null);
    } else {
      assert.equal(producer.ocr, null);
      assert.ok(producer.why);
    }
  }
});

test("R29: the general parameters (0.25 em, 0.1 em, form depth 8, the OCR table) act on hand-built fixtures, with no jurisdiction supplied", async () => {
  const line = async (c) => (await extractPdfStructure(doc([{ content: c }]))).text.document;
  assert.equal(await line("BT /F1 10 Tf 0 0 Td (ab) Tj 12.5 0 Td (cd) Tj ET"), "abcd");
  assert.equal(await line("BT /F1 10 Tf 0 0 Td (ab) Tj 12.6 0 Td (cd) Tj ET"), "ab cd");
  assert.equal(await line("BT /F1 10 Tf [(ab) -100 (cd)] TJ ET"), "abcd");
  assert.equal(await line("BT /F1 10 Tf [(ab) -101 (cd)] TJ ET"), "ab cd");
  const chain = (n) => {
    const objs = {};
    for (let k = 1; k <= n; k++) objs[19 + k] = { dict: `/Subtype /Form /Resources << /Font << /F1 10 0 R >> ${k < n ? `/XObject << /Fm ${20 + k} 0 R >>` : ""} >>`, data: k < n ? "/Fm Do" : "BT /F1 10 Tf (z) Tj ET" };
    return doc([{ content: "/Fm Do", resources: "/XObject << /Fm 20 0 R >>" }], { objs });
  };
  assert.equal((await extractPdfStructure(chain(8))).text.document, "z");
  assert.equal((await extractPdfStructure(chain(9))).text.undetermined[0].reason, "form_text_unread");
  const p = (await extractPdfStructure(doc([{ content: "" }], { objs: { 91: "<< /Producer (readiris 17) >>" }, trailer: "trailer\n<< /Root 1 0 R /Info 91 0 R >>\n" }))).text.producer;
  assert.equal(p.ocr.marker, "readiris");
});
