/* pdf-reader: requirement-named tests for the bounds on what a file makes the reader hold (build/requirements/pdf-reader.md
 * R22, R41, R47, R48, fix round 9: G125a, G125e, G124d, G132l (a)), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { extractPdfStructure, extractPdfRange, openPdf } from "../../../src/pdfstructure.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { build, doc, FONT_OBJS, FONTS, flate } from "./pdf.mjs";

const T = (s) => `BT /F1 12 Tf 40 700 Td (${s}) Tj ET`;
const bomb = (mb, fill = 0x20) => new Uint8Array(deflateSync(Buffer.alloc(mb * 1048576, fill), { level: 9 }));
const PAGE_CONTENT = boundOf("pdf", "page_content");

test("R41, R22: a page whose decoded content passes the page bound is stated with its figures and the other pages are read (a 200 KB stream that inflates to 200 MB as page 3 of 10)", async () => {
  const pages = Array.from({ length: 10 }, (_, i) => ({ content: i === 2 ? { dict: "/Filter /FlateDecode", data: bomb(200) } : T(`P${i + 1}`) }));
  const bytes = doc(pages);
  assert.ok(bytes.length < 400 * 1024, "the file is small");
  const rss0 = process.memoryUsage().rss;
  for (const r of [await extractPdfRange(bytes, { from: 0, count: 10 }), (await extractPdfStructure(bytes))]) {
    assert.equal(r.ok, true);
    const texts = r.text.pages.map((p) => p.text);
    assert.deepEqual(texts, ["P1", "P2", "", "P4", "P5", "P6", "P7", "P8", "P9", "P10"]);
    const marks = r.text.undetermined.filter((u) => u.reason === "page_over_bound");
    assert.equal(marks.length, 1);
    assert.equal(marks[0].page, 2);
    assert.equal(marks[0].bound, PAGE_CONTENT);
    assert.ok(marks[0].size > PAGE_CONTENT, "the size found is past the bound");
    assert.deepEqual(Object.keys(marks[0]).sort(), ["bound", "codes", "count", "font", "page", "reason", "size"]);
  }
  assert.ok(process.memoryUsage().rss - rss0 < 400 * 1048576, "the bomb is stopped at the cap, not inflated");
  const r = await extractPdfStructure(bytes);
  assert.ok(r.notes.includes("stream_over_bound:page_content"));
  assert.equal(r.images, null, "a page that cannot be walked makes the image list null, never partial");
});

test("R22: a stream under 128 KiB compressed is held to the same cap as a larger one", async () => {
  const small = bomb(100, 0x20); // about 100 KB compressed, 100 MB decoded
  assert.ok(small.length < 128 * 1024, `${small.length}`);
  const r = await extractPdfRange(doc([{ content: { dict: "/Filter /FlateDecode", data: small } }]), { from: 0, count: 1 });
  assert.equal(r.text.undetermined.filter((u) => u.reason === "page_over_bound").length, 1);
  /* a page just under the cap is read: 3 MB of text operators */
  const unit = T("word") + "\n";
  const data = flate(unit.repeat(Math.floor(3 * 1048576 / unit.length)));
  const ok = await extractPdfRange(doc([{ content: { dict: "/Filter /FlateDecode", data } }]), { from: 0, count: 1 });
  assert.equal(ok.text.undetermined.length, 0);
  assert.ok(ok.text.pages[0].text.length > 400000);
});

test("R22: an object stream, a ToUnicode CMap and an embedded file are each held to the cap of their kind, stated as stream_over_bound:<kind>", async () => {
  const tooBigCmap = bomb(2); // 2 MiB decoded, past the 1 MiB CMap cap
  const o = { 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", ...FONT_OBJS,
    11: { dict: "/Filter /FlateDecode", data: tooBigCmap },
    100: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << ${FONTS} >> /Contents 101 0 R >>`, 101: { data: T("kept") } };
  const r = await extractPdfStructure(build(o));
  assert.ok(r.notes.includes("stream_over_bound:cmap"), JSON.stringify(r.notes));
  assert.ok(r.text.undetermined.some((u) => u.reason === "no_tounicode"), "no character is guessed from a CMap that was not read");
  /* an object stream past its cap: its objects are unread and that is stated both ways */
  const stm = { dict: `/Type /ObjStm /N 1 /First 4 /Filter /FlateDecode`, data: bomb(boundOf("pdf", "object_stream") / 1048576 + 1) };
  const r2 = await extractPdfStructure(build({ ...o, 11: { data: "" }, 900: stm }));
  assert.ok(r2.notes.includes("stream_over_bound:object_stream"));
  assert.ok(r2.notes.includes("objstm_undecodable"));
  assert.equal(r2.ok, true);
  /* an embedded file past its cap is an undetermined record naming why, never a file read in part */
  const big = { dict: "/Type /EmbeddedFile /Filter /FlateDecode", data: bomb(boundOf("pdf", "embedded_file") / 1048576 + 1) };
  const withFile = build({ ...o, 11: { data: "" }, 400: big, 401: "<< /Type /Filespec /F (big.bin) /EF << /F 400 0 R >> >>",
    100: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << ${FONTS} >> /Contents 101 0 R /Annots [402 0 R] >>`,
    402: "<< /Type /Annot /Subtype /FileAttachment /Rect [0 0 1 1] /Contents (big) /FS 401 0 R >>" });
  const r3 = await extractPdfStructure(withFile);
  assert.ok(r3.notes.includes("stream_over_bound:embedded_file"), JSON.stringify(r3.notes));
  assert.ok(r3.links.some((l) => l.partition === "undetermined" && l.target.why === "embedded_stream_undecodable"));
});

test("R22: an image stream's declared size is judged before anything is allocated for it; a breach is null with the note stream_over_bound:image", async () => {
  const px = boundOf("image", "pixels"), stride = boundOf("image", "row_stride");
  const img = (dict) => ({ dict: `/Type /XObject /Subtype /Image /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode ${dict}`, data: bomb(1, 0) });
  const mk = (dict) => build({ 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 100: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 10 10] >>", 200: img(dict) });
  const read = async (dict) => { const d = await openPdf(mk(dict)); return { d, got: await d.streamDecoded(d.resolve({ t: "ref", n: 200 })) }; };
  const wide = await read(`/Width ${Math.ceil(Math.sqrt(px)) + 1} /Height ${Math.ceil(Math.sqrt(px)) + 1}`);
  assert.equal(wide.got, null);
  assert.ok(wide.d.notes.includes("stream_over_bound:image"));
  const stride1 = await read(`/Width ${stride + 1} /Height 1`);
  assert.equal(stride1.got, null);
  assert.ok(stride1.d.notes.includes("stream_over_bound:image"));
  /* controls: a declared size inside both bounds decodes, with no note */
  const fine = await read("/Width 1024 /Height 1024");
  assert.equal(fine.got.length, 1048576);
  assert.ok(!fine.d.notes.includes("stream_over_bound:image"));
});

test("R22: a stream with a TIFF predictor is not passed through as if un-predicted: streamDecoded answers null; PNG predictors still decode", async () => {
  const data = flate(Buffer.alloc(100, 7));
  const mk = (parms) => build({ 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [] /Count 0 >>", 200: { dict: `/Filter /FlateDecode /DecodeParms << ${parms} >>`, data } });
  const d2 = await openPdf(mk("/Predictor 2 /Columns 10 /Colors 1 /BitsPerComponent 8"));
  assert.equal(await d2.streamDecoded(d2.resolve({ t: "ref", n: 200 })), null);
  const d1 = await openPdf(mk("/Predictor 1"));
  assert.equal((await d1.streamDecoded(d1.resolve({ t: "ref", n: 200 }))).length, 100);
  const d12 = await openPdf(mk("/Predictor 12 /Columns 9"));
  assert.equal((await d12.streamDecoded(d12.resolve({ t: "ref", n: 200 }))).length, 90);
});

test("R47: operands past the bound are not held and the page still reads (65,536 operands)", async () => {
  const many = "1 ".repeat(boundOf("pdf", "operands") + 100);
  const r = await extractPdfStructure(doc([{ content: `${many} ${T("after")}` }]));
  assert.equal(r.ok, true);
  assert.equal(r.text.pages[0].text, "after");
  assert.ok(r.notes.some((n) => n.startsWith("over_bound:operands:")), JSON.stringify(r.notes));
});

test("R48: every ceiling this module keeps is read from READ_BOUNDS by name, and none is a number of its own", () => {
  const src = readFileSync(new URL("../../../src/pdfstructure.mjs", import.meta.url), "utf8");
  for (const [kind, name] of [["pdf", "page_content"], ["pdf", "object_stream"], ["pdf", "cmap"], ["pdf", "embedded_file"], ["pdf", "objects"],
    ["pdf", "direct_object"], ["pdf", "operands"], ["pdf", "tree_depth"], ["pdf", "bfrange_codes"], ["pdf", "need_mb"], ["image", "pixels"], ["image", "row_stride"]]) {
    assert.ok(src.includes(`boundOf("${kind}", "${name}")`), `${kind}.${name}`);
  }
  /* the ceilings that were this file's own numbers are gone */
  for (const gone of [/INNER_DECODE_MAX/, /const READ_LIMIT_MB\s*=\s*\d/, /const STREAM_MAX\s*=\s*\d/, /const OBJ_WINDOW_MAX\s*=\s*\d/, /\b128 \* 1024 \* 1024\b/, /\b8 \* 1024 \* 1024\b/]) {
    assert.ok(!gone.test(src), String(gone));
  }
});

test("R47, R51: a page-tree array of 270,000 references whose text passes the direct-object bound is absent, stated with the bound, and named by objects() as unresolved with over and figure", async () => {
  /* the array's text, not its count, passes the bound: 270,000 references written one per line with indentation are past 4 MiB */
  const dmax = boundOf("pdf", "direct_object");
  const N = 270000;
  let kids = "[";
  for (let i = 0; i < N; i++) kids += `\n${" ".repeat(16)}${i + 10} 0 R`;
  kids += "\n]";
  assert.ok(kids.length > dmax, "the array's text is past the bound");
  const objs = { 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: `<< /Type /Pages /Kids 4 0 R /Count ${N} >>`, 4: kids };
  for (let i = 0; i < N; i++) objs[i + 10] = "<< /Type /Page /Parent 2 0 R >>";
  const bytes = build(objs);
  const d = await openPdf(bytes);
  assert.ok(d.notes.includes(`over_bound:direct_object:${dmax + 1}:${dmax}`), JSON.stringify(d.notes.slice(0, 5)));
  assert.equal(d.resolve({ t: "ref", n: 4 }), null, "the array past the bound is absent");
  const got = d.objects();
  /* R51: the reference names the bound that stopped it, with its figure, never only "cannot be read" */
  assert.deepEqual(got.unresolved, [{ num: 4, gen: 0, over: "direct_object", figure: dmax }], "the reference names the bound that stopped it");
  /* a reference to nothing at all keeps the plain form */
  const plain = await openPdf(build({ 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [ 9 0 R ] /Count 1 >>" }));
  assert.deepEqual(plain.objects().unresolved, [{ num: 9, gen: 0 }]);
});

test("R47: a direct object past the bound is absent and stated, and an input of more objects than the bound leaves the process alive and the answer within it", async () => {
  const dmax = boundOf("pdf", "direct_object");
  const huge = `[ ${"1 ".repeat(Math.ceil(dmax / 2) + 10)}]`;
  const r = await extractPdfStructure(build({ 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [] /Count 0 >>", 7: huge, 8: "[ 1 2 3 ]" }));
  assert.equal(r.ok, true);
  assert.ok(r.notes.includes(`over_bound:direct_object:${dmax + 1}:${dmax}`), JSON.stringify(r.notes));
  const d = await openPdf(build({ 1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [] /Count 0 >>", 7: huge, 8: "[ 1 2 3 ]" }));
  assert.equal(d.resolve({ t: "ref", n: 7 }), null, "the object past the bound is absent");
  assert.equal(d.resolve({ t: "ref", n: 8 }).items.length, 3, "its neighbours are read");
  /* objects: a file of 2,000,100 small objects */
  const omax = boundOf("pdf", "objects");
  const head = Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n", "latin1");
  const parts = [head];
  const chunk = [];
  for (let n = 3; n < omax + 100; n++) { chunk.push(`${n} 0 obj\n1\nendobj\n`); if (chunk.length === 100000) { parts.push(Buffer.from(chunk.join(""), "latin1")); chunk.length = 0; } }
  parts.push(Buffer.from(chunk.join("") + "trailer\n<< /Root 1 0 R >>\n%%EOF\n", "latin1"));
  const big = new Uint8Array(Buffer.concat(parts));
  const res = await extractPdfStructure(big);
  assert.equal(res.ok, true);
  const note = res.notes.find((n) => n.startsWith("over_bound:objects:"));
  assert.equal(note, `over_bound:objects:${omax + 1}:${omax}`);
  const od = await openPdf(big);
  assert.ok(od._objs.size <= omax, "no more objects are held than the bound");
});
