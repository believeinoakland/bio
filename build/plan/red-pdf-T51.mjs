// red.mjs - one reproduction per defect of pdf-envelope-T51.md section 1.3. Run with cwd = bio-plane:
//   cd /home/user/bio/bio-plane && node red.mjs N5        (N3 N4 N5 N6 N7 N8 N9 N10 N11 N15 N17 N21)
// Every recipe prints RED when the defect shows, GREEN when it does not. Reads the repository only; writes nothing.
import { readFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
const B = process.cwd();
const rd = await import(`${B}/src/pdfstructure.mjs`);
const { build, doc, FONT_OBJS, FONTS } = await import(`${B}/test/m/pdf-reader/pdf.mjs`);
const { indexed } = await import(`${B}/test/m/pdf-reader/indexed.mjs`);
const T = (s) => `BT /F1 12 Tf 40 700 Td (${s}) Tj ET`;
const PAGE = (parent, c) => `<< /Type /Page /Parent ${parent} 0 R /MediaBox [0 0 600 800] /Resources << ${FONTS} >> /Contents ${c} 0 R >>`;
const CAT = (p) => `<< /Type /Catalog /Pages ${p} 0 R >>`;
const texts = async (bytes) => (await rd.extractPdfStructure(bytes)).text.pages.map((p) => p.text);
const verdict = (red, line) => console.log(red ? "RED  " : "GREEN", line);
const which = process.argv[2];

// reading-pipeline world (N3, N15): a stored PDF read whole and read as `readHeld` reads it (cursor: null, pieces)
async function pipeline(bytes) {
  const { read } = await import(`${B}/src/reading-pipeline/index.mjs`);
  const { bucket, evidenceStore, hold, doc: pdoc } = await import(`${B}/test/m/reading-pipeline/fixture.mjs`);
  const b = bucket(), d = await hold(b, bytes), document = pdoc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
  const ask = (x) => read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", ...x });
  return { whole: await ask({ unitsBudget: Infinity }), piece: await ask({ unitsBudget: 512 * 1024, cursor: null, maxUnits: 4096 }) };
}

const cases = {
  async N3() { // every stored PDF reading is the first range's: title, boxes, images, glyph counts are lost
    const { whole, piece } = await pipeline(new Uint8Array(readFileSync(`${B}/test/fixtures/legistar-agenda-1425405.pdf`)));
    const lost = ["title", "text_glyphs", "words_total"].filter((k) => whole.reading[k] != null && piece.reading[k] == null);
    verdict(lost.length > 0 || piece.reading.page_boxes == null, `one-piece read (more=${piece.more}) lost ${lost} ; page_boxes ${JSON.stringify(piece.reading.page_boxes)} ; images ${JSON.stringify(piece.reading.container_extent?.images)}`);
  },
  async N4() { // a Flate stream has no decompressed-size cap (needs ~1 GB of RAM)
    const data = new Uint8Array(deflateSync(Buffer.alloc(200 * 1048576, 0x20), { level: 9 }));
    const bytes = doc([{ content: T("ok1") }, { content: { dict: "/Filter /FlateDecode", data } }, { content: T("ok3") }]);
    const rss0 = process.memoryUsage().rss;
    const r = await rd.extractPdfRange(bytes, { from: 0, count: 3 });
    const mb = (process.memoryUsage().rss - rss0) / 1048576;
    verdict(r.ok && mb > 400, `${(bytes.length / 1024).toFixed(0)} KB file inflated 200 MB, ok=${r.ok}, RSS +${mb.toFixed(0)} MB, no marker ${JSON.stringify(r.text.undetermined)}`);
  },
  async N5() { // an incremental update that rewrites a page into a NEW object stream is ignored
    const o1 = { 1: CAT(2), 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 100: PAGE(2, 101), ...FONT_OBJS, 101: { data: T("OLDTEXT") } };
    const r1 = indexed(o1, { xref: "table", packed: [1, 2, 100], objStmNum: 900 });
    const v2 = indexed({ 100: PAGE(2, 102), 102: { data: T("NEWTEXT") } }, { xref: "table", packed: [100], objStmNum: 901, prev: r1 });
    const got = await texts(v2);
    verdict(got[0] !== "NEWTEXT", `revision 2 in a new object stream reads ${JSON.stringify(got)} (want NEWTEXT)`);
  },
  async N6() { // the catalog is the first /Type /Catalog, not the trailer's /Root
    const o = { 1: CAT(2), 3: CAT(4), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 4: "<< /Type /Pages /Kids [102 0 R 104 0 R] /Count 2 >>",
      100: PAGE(2, 101), 101: { data: T("FIRST") }, 102: PAGE(4, 103), 103: { data: T("SECOND-A") }, 104: PAGE(4, 105), 105: { data: T("SECOND-B") } };
    const got = await texts(build(o, { trailer: "trailer\n<< /Root 3 0 R >>\n" }));
    verdict(got.length !== 2, `trailer /Root 3 0 R reads ${JSON.stringify(got)} (want SECOND-A, SECOND-B)`);
  },
  async N7() { // a fake "N G obj" inside a later unfiltered stream overrides the real object
    const o = { 1: CAT(2), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 100: PAGE(2, 101), 101: { data: T("REALTEXT") },
      200: { dict: "/Type /Metadata /Subtype /XML", data: "<x>\n101 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n</x>" } };
    const got = await texts(build(o));
    verdict(got[0] !== "REALTEXT", `real object 101 then a fake 101 inside an XMP stream reads ${JSON.stringify(got)} (want REALTEXT)`);
  },
  async N8() { // a page leaf with no /Type is dropped while its siblings are read
    const leaf = (c) => `<< /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << ${FONTS} >> /Contents ${c} 0 R >>`;
    const o = { 1: CAT(2), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R 102 0 R 104 0 R] /Count 3 >>",
      100: PAGE(2, 101), 101: { data: T("ALPHA") }, 102: leaf(103), 103: { data: T("BRAVO") }, 104: PAGE(2, 105), 105: { data: T("CHARLIE") } };
    const got = await texts(build(o));
    verdict(got.length !== 3, `three kids, the middle one untyped, read ${JSON.stringify(got)}`);
  },
  async N9() { // a DIRECT /Encrypt dictionary in the trailer is not detected (an indirect one is)
    const o = { 1: CAT(2), ...FONT_OBJS, 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 100: PAGE(2, 101), 101: { data: "\x01\x02CIPHERTEXT" } };
    const E = "<< /Filter /Standard /V 1 /R 2 /O (aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa) /U (bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb) /P -4 >>";
    const direct = await rd.extractPdfStructure(build(o, { trailer: `trailer\n<< /Root 1 0 R /Encrypt ${E} >>\n` }));
    const indirect = await rd.extractPdfStructure(build({ ...o, 300: E }, { trailer: "trailer\n<< /Root 1 0 R /Encrypt 300 0 R >>\n" }));
    const mark = (r) => r.text.undetermined.some((u) => u.reason === "encrypted");
    verdict(!mark(direct) && mark(indirect), `encrypted marker: direct /Encrypt ${mark(direct)}, indirect (control) ${mark(indirect)}`);
  },
  async N10() { // bfrange has no cap; mixed codespaces are misread; 4-byte codes at or above 0x80000000 sign-flip
    const font = { 10: "<< /Type /Font /Subtype /Type0 /BaseFont /X /Encoding /Identity-H /DescendantFonts [13 0 R] /ToUnicode 11 0 R >>",
      13: "<< /Type /Font /Subtype /CIDFontType2 /BaseFont /X /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /DW 1000 >>" };
    const run = async (cmap, content) => {
      const o = { 1: CAT(2), 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", ...font, 11: { data: `/CIDInit /ProcSet findresource begin 1 ${cmap} end` },
        100: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 10 0 R >> >> /Contents 101 0 R >>", 101: { data: `BT /F1 12 Tf 40 700 Td ${content} Tj ET` } };
      const t0 = performance.now(), r = await rd.extractPdfStructure(build(o));
      return { ms: Math.round(performance.now() - t0), text: r.text.pages[0].text, u: r.text.undetermined.map((x) => `${x.reason}:${x.codes}`) };
    };
    const big = await run("begincodespacerange <00000000> <FFFFFFFF> endcodespacerange 1 beginbfrange <00000000> <00FFFFFF> <0041> endbfrange", "<00000041>");
    const mixed = await run("1 begincodespacerange <00> <7F> endcodespacerange 1 begincodespacerange <8140> <9FFC> endcodespacerange 2 beginbfchar <41> <0058> <8140> <0059> endbfchar", "<41814041>");
    const hi = await run("1 begincodespacerange <00000000> <FFFFFFFF> endcodespacerange 1 beginbfchar <80000001> <0058> endbfchar", "<80000001>");
    verdict(big.ms > 5000 || mixed.text !== "XYX" || hi.u.some((x) => x.includes("-")),
      `(a) bfrange 00000000-00FFFFFF: ${big.ms} ms ; (b) mixed codespace reads ${JSON.stringify(mixed.text)} ${mixed.u} (want XYX) ; (c) code 0x80000001 -> ${hi.u}`);
  },
  async N11() { // one page's content is held whole: a dense 3 MB decoded page needs more than a 128 MB heap
    const MB = Number(process.argv[3] ?? 3);
    const unit = T("word") + "\n";
    const data = new Uint8Array(deflateSync(Buffer.from(unit.repeat(Math.floor(MB * 1048576 / unit.length)), "latin1")));
    const bytes = doc([{ content: T("light") }, { content: { dict: "/Filter /FlateDecode", data } }, { content: T("light3") }]);
    const t0 = performance.now(), r = await rd.extractPdfRange(bytes, { from: 1, count: 1 });
    verdict(true, `${MB} MB decoded page: ${r.text.pages[0].text.length} chars in ${Math.round(performance.now() - t0)} ms, RSS ${(process.memoryUsage().rss / 1048576).toFixed(0)} MB`);
    console.log("      run it again as `node --max-old-space-size=128 red.mjs N11 3`: V8 aborts with 'heap out of memory' (RED); 1 and 2 MB complete.");
  },
  async N15() { // a page over 128 Ki characters: cut and flagged in a whole read, carried whole in pieces
    const line = (i) => `BT /F1 12 Tf 40 ${700 - (i % 60) * 10} Td (${"alpha beta gamma delta ".repeat(12).slice(0, 299)}${String(i).padStart(4, "0")}) Tj ET\n`;
    let c = ""; for (let i = 0; i < 1000; i++) c += line(i);
    const { whole, piece } = await pipeline(doc([{ content: T("small one") }, { content: c }, { content: T("small three") }]));
    const len = (o) => o.text_units.map((u) => u.text.length);
    verdict(len(whole)[1] !== len(piece)[1], `whole read unit chars ${len(whole)} (truncated=${whole.text_units[1].truncated}) ; one-piece read ${len(piece)} (truncated=${piece.text_units[1].truncated})`);
  },
  async N17() { // simple fonts with /Encoding but no /ToUnicode are undetermined in tier 1
    const o = { 1: CAT(2), 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", 10: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      100: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 10 0 R >> >> /Contents 101 0 R >>", 101: { data: T("Hello World") } };
    const r = await rd.extractPdfStructure(build(o));
    verdict(r.text.pages[0].text === "", `Helvetica /WinAnsiEncoding, no ToUnicode: text ${JSON.stringify(r.text.pages[0].text)} ; ${JSON.stringify(r.text.undetermined.map((u) => `${u.reason}/${u.count}`))}`);
  },
  async N21() { // a file cut at 70 % reads the pages it can find and states nothing about the rest
    const full = doc(Array.from({ length: 30 }, (_, i) => ({ content: T(`PAGE${String(i + 1).padStart(2, "0")}`) })));
    const cut = full.subarray(0, Math.floor(full.length * 0.7));
    const r = await rd.extractPdfStructure(cut);
    const named = r.text.undetermined.map((u) => u.reason);
    verdict(r.ok && r.pages < 30 && !r.notes.length, `ok=${r.ok}, pages=${r.pages} of 30, notes=${JSON.stringify(r.notes)}, markers=${JSON.stringify(named)} (the 10 missing pages are named nowhere)`);
  },
};
if (!cases[which]) { console.log("usage: node red.mjs", Object.keys(cases).join(" ")); process.exit(2); }
await cases[which]();
