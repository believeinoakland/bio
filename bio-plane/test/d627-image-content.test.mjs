/* NEGATIVE CONTROL: three arms and a baseline in `test/nc-d627.mjs`, run with `node test/nc-d627.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source ALONE and declares, before it runs, what MUST fail and what MUST NOT. Each is restored from a uniquely-named pristine copy and verified by sha256 AND content. (a) `baseline`: nothing armed, MUST be green. (b) `nocoverage`: THE ROW'S DECLARED CONTROL. `extractPdfStructure` stops calling `markImageContent`, so INFO-2026-0301's pages 633/634/645-651 read no marker and route nowhere, by name (REAL PAGES, THE ROUTE), while TEXT PAGE, BLANK FOLIO and SCAN hold. (c) `noroute`: `TIER3_REASONS` loses `image_content_unread`, so the pages keep their markers and the OCR member is never asked (THE ROUTE fails, REAL PAGES hold). (d) `forcegap`: a page in a measured gap is forced to `image_content_unread`, so GLYPH GAP, SHARE GAP and the 5-glyph and 21-glyph EDGE assertions fail while UNREAD and TEXT PAGE hold. RESULTS: M-178. */
/* D-627 — A PAGE AN IMAGE FILLS WHILE ITS TEXT IS A FOLIO SAYS SO, AND IS ROUTED TO OCR.
 *
 * BOB #35, 2026-09-25 05:50Z: two facts, two markers. D-608's reading is kept, so a page that BEARS text carries
 * no `no_text_layer`. But a page whose painted images cover at least a measured share of its area, while its text
 * is under a measured glyph floor, carries `image_content_unread` naming both figures. `needsTier3` routes it
 * exactly as it routes a no-text page. The thresholds are M-178's; the gaps between the measured classes read
 * `image_content_undetermined` and are NOT routed.
 *
 * WHAT IS REAL AND WHAT IS BUILT. Section 1 reads a committed structural extract of INFO-2026-0301's nine pages
 * (fixtures/d627/PROVENANCE.md: every object raw, image SAMPLES dropped, tier 1 identical to the full capture on
 * all nine). Section 2's pages are built here at the edges M-178 measured, because no real page sits in a gap.
 * Section 4 drives the real `op=acquire` in the real plane; the two fleet members are stubs, as in
 * `tier3-layer-parts.test.mjs`, because what is under test is whether the plane ASKS, and for which pages.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { extractPdfStructure, IMAGE_CONTENT_MAX_GLYPHS, IMAGE_CONTENT_MIN_SHARE, IMAGE_CONTENT_TEXT_GLYPHS }
  from "../src/pdfstructure.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const FIXTURE = fileURLToPath(new URL("./fixtures/d627/fy2325-budget-p633-651.pdf", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha256 = (v) => createHash("sha256").update(v).digest("hex");
const IMG_REASONS = ["image_content_unread", "image_content_undetermined"];
/* What a page says about its images, as one comparable value: [reason, share, glyphs] or null. */
const imageMark = (s, page) => {
  const p = s && s.text && Array.isArray(s.text.pages) ? s.text.pages.find((x) => x.page === page) : null;
  const m = p && Array.isArray(p.undetermined) ? p.undetermined.find((x) => x && IMG_REASONS.includes(x.reason)) : null;
  return m ? [m.reason, m.image_share, m.glyphs] : null;
};
const reasonsOn = (s, page) => {
  const p = s && s.text && Array.isArray(s.text.pages) ? s.text.pages.find((x) => x.page === page) : null;
  return p ? [...new Set((p.undetermined || []).map((m) => m.reason))].sort() : null;
};

/* ===================================================================== *
 * THE PDF BUILDER — a copy of `tier3-layer-parts.test.mjs`'s, for that file's
 * stated reason: importing a `.test.mjs` would re-run it here.
 * ===================================================================== */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const IDENTITY_CMAP = Buffer.from(`/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`, "latin1");
const IMAGE_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);

/* One page's content: an optional line of text in /F1 (decoded) or /F2 (no ToUnicode), and images painted at
   the given [x, y, w, h] placements, directly or (`viaForm`) through a Form XObject. */
const content = ({ text = "", font = "F1", imgs = [], viaForm = false }) => Buffer.from(
  (text ? `BT /${font} 10 Tf 72 40 Td (${text}) Tj ET ` : "")
  + (viaForm ? "/Fm0 Do" : imgs.map(([x, y, w, h]) => `q ${w} 0 0 ${h} ${x} ${y} cm /Im0 Do Q`).join(" ")), "latin1");

/* A document of pages, each { text, font, imgs, viaForm, noFont, crop }. Objects: 1 catalog, 2 pages, 3/4 the
   decoded font and its CMap, 5 the undecoded font, 6 the image, 7 a form painting the image full-page, then
   two objects per page. */
function doc(pages) {
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${pages.map((_, i) => `${10 + 2 * i} 0 R`).join(" ")}] /Count ${pages.length} >>` },
    { num: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 4 0 R >>" },
    { num: 4, head: `<< /Length ${IDENTITY_CMAP.length} >>`, stream: IDENTITY_CMAP },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Garamond-Custom >>" },
    { num: 6, head: `<< /Type /XObject /Subtype /Image /Width 850 /Height 1100 /Filter /DCTDecode /Length ${IMAGE_BYTES.length} >>`, stream: IMAGE_BYTES },
  ];
  const form = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  objs.push({ num: 7, head: `<< /Type /XObject /Subtype /Form /BBox [0 0 612 792] /Resources << /XObject << /Im0 6 0 R >> >> /Length ${form.length} >>`, stream: form });
  pages.forEach((p, i) => {
    const c = content(p);
    const fonts = p.noFont ? "" : "/Font << /F1 3 0 R /F2 5 0 R >> ";
    const xo = p.viaForm ? "/XObject << /Fm0 7 0 R >>" : (p.imgs && p.imgs.length ? "/XObject << /Im0 6 0 R >>" : "");
    objs.push({ num: 10 + 2 * i, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]${p.crop ? ` /CropBox [${p.crop.join(" ")}]` : ""} /Resources << ${fonts}${xo} >> /Contents ${11 + 2 * i} 0 R >>` });
    objs.push({ num: 11 + 2 * i, head: `<< /Length ${c.length} >>`, stream: c });
  });
  return pdf(objs);
}
const FULL = [0, 0, 612, 792];
const chars = (n) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(2).slice(0, n);

/* The edges, each ONE page. Index = page number. */
const SYN_PAGES = [
  /* 0  UNREAD */          { text: "12", imgs: [FULL] },
  /* 1  TEXT PAGE */       { text: chars(30), imgs: [FULL] },
  /* 2  GLYPH GAP */       { text: chars(8), imgs: [FULL] },
  /* 3  SHARE GAP */       { text: "7", imgs: [[0, 0, 100, 100]] },
  /* 4  BLANK FOLIO */     { text: "9" },
  /* 5  SCAN */            { noFont: true, imgs: [FULL] },
  /* 6  UNION */           { text: "3", imgs: [[0, 0, 612, 500], [0, 300, 612, 492]] },
  /* 7  CROP + OFF-PAGE */ { text: "4", imgs: [[0, -396, 612, 792]], crop: [0, 0, 612, 396] },
  /* 8  UNDECODED TEXT */  { text: chars(30), font: "F2", imgs: [FULL] },
  /* 9  VIA FORM */        { text: "5", viaForm: true },
  /* 10 EDGE 4 */          { text: "1234", imgs: [FULL] },
  /* 11 EDGE 5 */          { text: "12345", imgs: [FULL] },
  /* 12 EDGE 21 */         { text: chars(21), imgs: [FULL] },
  /* 13 EDGE 22 */         { text: chars(22), imgs: [FULL] },
  /* 14 SHARE 0.20 */      { text: "1", imgs: [[0, 0, 612, 158.4]] },
  /* 15 SHARE 0.15 */      { text: "1", imgs: [[0, 0, 612, 118.8]] },
];
const SYN = doc(SYN_PAGES);
const REAL = new Uint8Array(readFileSync(FIXTURE));
const REAL_PAGES = [633, 634, 645, 646, 647, 648, 649, 650, 651];

/* ===================================================================== *
 * 0. THE CORPUS, printed and floored (W34), and the thresholds pinned.
 * ===================================================================== */
console.log("--- 0. the corpus and the thresholds ---");
console.log(`D-627 corpus: the real extract ${REAL.length} B sha256 ${sha256(REAL).slice(0, 16)}…, the synthetic document ${SYN.length} B, ${SYN_PAGES.length} pages`);
t("the committed extract is the one PROVENANCE.md names, by sha256",
  sha256(REAL), "481099369d7ae92dcfdbd965be654cc236a9cb152bb9a560b851eebcc109ad34");
t("the thresholds are M-178's: at most 4 glyphs, at least 0.18 of the page, and 22 glyphs is a text page",
  [IMAGE_CONTENT_MAX_GLYPHS, IMAGE_CONTENT_MIN_SHARE, IMAGE_CONTENT_TEXT_GLYPHS], [4, 0.18, 22]);

/* ===================================================================== *
 * 1. THE ROW. INFO-2026-0301 pages 633, 634 and 645-651, by name.
 * ===================================================================== */
console.log("\n--- 1. REAL PAGES: INFO-2026-0301 pp 633, 634, 645-651 ---");
const real = await extractPdfStructure(REAL);
t("the extract is nine pages and its image walk finished", [real.pages, Array.isArray(real.images)], [9, true]);
/* The figures are M-178's, read from the full capture and equal on the extract (PROVENANCE.md). */
const REAL_WANT = [0.5672, 0.3487, 0.5468, 0.5578, 0.5345, 0.5571, 0.4391, 0.5496, 0.5371];
REAL_PAGES.forEach((p, i) => {
  t(`REAL PAGES: INFO-2026-0301 p${p} carries image_content_unread, share ${REAL_WANT[i]}, 3 glyphs (its folio)`,
    imageMark(real, i), ["image_content_unread", REAL_WANT[i], 3]);
});
t("REAL PAGES: and none of them carries no_text_layer (D-608's reading, KEPT: the page bears a folio)",
  REAL_PAGES.map((_, i) => reasonsOn(real, i).includes("no_text_layer")), REAL_PAGES.map(() => false));
t("REAL PAGES: the folio is still counted undetermined, as M-174 found (no_tounicode, Arial, 3 codes)",
  real.text.pages.map((p) => (p.undetermined.find((m) => m.reason === "no_tounicode") || {}).count), REAL_PAGES.map(() => 3));
t("REAL PAGES: a marker is not an undetermined CHARACTER: every one carries count 0",
  real.text.undetermined.filter((m) => m.reason === "image_content_unread").map((m) => m.count), REAL_PAGES.map(() => 0));
t("REAL PAGES: the document list and its count carry the nine markers",
  [real.text.undetermined.filter((m) => m.reason === "image_content_unread").length,
   real.text.counts.undetermined === real.text.undetermined.length], [9, true]);

/* ===================================================================== *
 * 2. THE EDGES, built.
 * ===================================================================== */
console.log("\n--- 2. the edges M-178 measured ---");
const syn = await extractPdfStructure(SYN);
t("UNREAD: a folio of 2 glyphs on a page one image fills", imageMark(syn, 0), ["image_content_unread", 1, 2]);
t("TEXT PAGE: 30 glyphs over the same image read no marker", imageMark(syn, 1), null);
t("GLYPH GAP: 8 glyphs, a count no measured page has, reads UNDETERMINED, not forced either way",
  imageMark(syn, 2), ["image_content_undetermined", 1, 8]);
t("SHARE GAP: a folio beside an image covering 0.0206 of the page reads UNDETERMINED",
  imageMark(syn, 3), ["image_content_undetermined", 0.0206, 1]);
t("BLANK FOLIO: a folio and no image says nothing", reasonsOn(syn, 4), []);
t("SCAN: a page with no font keeps no_text_layer and gains nothing (it is routed already)",
  reasonsOn(syn, 5), ["no_text_layer"]);
/* OVER-STRICTNESS: correct figures in shapes the simplest reading gets wrong. */
t("UNION: two overlapping images count their overlap once (share 1, where a sum reads 1.2525)",
  imageMark(syn, 6), ["image_content_unread", 1, 1]);
t("CROP + OFF-PAGE: an image half off the page, on a page cropped to its lower half, fills the visible box",
  imageMark(syn, 7), ["image_content_unread", 1, 1]);
t("UNDECODED TEXT: 30 codes in a font with no /ToUnicode are text the page SHOWS, so no marker",
  imageMark(syn, 8), null);
t("VIA FORM: an image painted through a Form XObject counts", imageMark(syn, 9), ["image_content_unread", 1, 1]);
t("EDGE 4: 4 glyphs is the most on any measured image-only page, and reads unread",
  imageMark(syn, 10), ["image_content_unread", 1, 4]);
t("EDGE 5: 5 glyphs reads undetermined", imageMark(syn, 11), ["image_content_undetermined", 1, 5]);
t("EDGE 21: 21 glyphs reads undetermined", imageMark(syn, 12), ["image_content_undetermined", 1, 21]);
t("EDGE 22: 22 glyphs is the fewest on a measured text page, and reads no marker", imageMark(syn, 13), null);
t("SHARE 0.20: over the 0.18 floor reads unread", imageMark(syn, 14), ["image_content_unread", 0.2, 1]);
t("SHARE 0.15: under it reads undetermined", imageMark(syn, 15), ["image_content_undetermined", 0.15, 1]);

/* ===================================================================== *
 * 3. NOTHING ELSE MOVED: a document with no image says nothing new.
 * ===================================================================== */
console.log("\n--- 3. a document with no image ---");
{
  const plain = await extractPdfStructure(doc([{ text: "3" }, { text: chars(10) }]));
  t("no page carries an image-content marker, and the list is exactly tier 1's",
    plain.text.undetermined.filter((m) => IMG_REASONS.includes(m.reason)).length, 0);
}

/* ===================================================================== *
 * 4. THE ROUTE, through the op. The plane asks the OCR member for exactly the
 *    unread pages; the gap pages and the text pages are never asked about.
 * ===================================================================== */
console.log("\n--- 4. THE ROUTE: op=acquire asks the OCR member ---");
const TEXTONLY = doc([{ text: chars(30), imgs: [FULL] }, { text: chars(40) }]);
const GAPONLY = doc([{ text: chars(8), imgs: [FULL] }, { text: "7", imgs: [[0, 0, 100, 100]] }]);
const DOCS = { real: REAL, syn: SYN, textonly: TEXTONLY, gaponly: GAPONLY };
const SHA = Object.fromEntries(Object.entries(DOCS).map(([k, b]) => [k, sha256(b)]));
let PDF_ASKED = [], OCR_ASKED = [];
const OCR_LINES = ["Special Revenue Fund", "Capital Improvement Projects"];
const ocrAnswer = (pages) => ({
  ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
  measured_by: "MEASUREMENTS 2026-08-03 (CPDF-9)", confidence_floor: 0.6,
  pages: (Array.isArray(pages) ? pages : []).map((page) => ({
    page,
    regions: OCR_LINES.map((text, i) => ({
      text, confidence: { value: 0.97, basis: "engine" },
      source: { kind: "pdf-page", ref: `p${page}`, page, rect: [72, 700 - i * 12, 540, 712 - i * 12] },
    })),
  })),
});
const MEM = "mem-d627";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  serviceBindings: {
    async PDF_WORKER(request) {
      const body = await request.json().catch(() => null);
      PDF_ASKED.push(body);
      return new Response("declined", { status: 500 });
    },
    async OCR_WORKER(request) {
      if (new URL(request.url).pathname !== "/transcribe") return new Response("no", { status: 404 });
      const body = await request.json().catch(() => null);
      OCR_ASKED.push(body);
      return Response.json(ocrAnswer(body && body.pages));
    },
  },
  bindings: { ADMIN_TOKEN: "adm-d627", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d627",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const name = new URL(request.url).pathname.replace(/^\//, "").replace(/\.pdf$/, "");
    return Object.prototype.hasOwnProperty.call(DOCS, name)
      ? new Response(DOCS[name], { headers: { "content-type": "application/pdf" } })
      : new Response("unscripted", { status: 500 });
  },
});
const acquire = async (name) => (await (await mf.dispatchFetch(
  `http://x/api/?op=acquire&store=scratch&token=${MEM}`,
  { method: "POST", body: JSON.stringify({ locator: `https://www.oaklandca.gov/${name}.pdf`,
                                           authority: "Finance Department" }) })).json());
const asked = (k) => (OCR_ASKED.find((b) => b && b.capture_sha === SHA[k]) || {}).pages ?? null;
try {
  const r = (await acquire("real")).document;
  t("THE ROUTE: INFO-2026-0301's nine pages are sent to the OCR member, every one of them",
    asked("real"), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  /* The EXTRACT escalates to tier 2 and the FULL document does not (M-174: 150,887 markers under 964,612
     glyphs). Nine undecoded folios outnumber the extract's zero glyphs, and tier 2 can decode an Arial folio,
     so asking it is right. The stub declines, and the OCR route does not depend on its answer. When tier 2
     ANSWERS and wins the pages, the route used to be lost with the markers (D-633, found in M-178). D-633 carries
     them, and `d633-tier2-image-marker.test.mjs` pins that route with an answering stub. */
  t("THE ROUTE: the extract's folios are offered to tier 2 first (it declines here), as its undecoded codes warrant",
    PDF_ASKED.some((b) => b && b.capture_sha === SHA.real), true);
  const chain = r && r.reading && Array.isArray(r.reading.text_source) ? r.reading.text_source : [];
  /* Every page was filled, so the chain covers the whole document and carries no page extent. No layer
     step is left, because no page kept its tier-1 text. */
  t("THE ROUTE: every page came from the engine: the chain is the pixels and the named engine, no layer step left",
    chain.map((s) => [s.step, s.engine ?? null, s.extent ?? null]), [["pixels", null, null], ["ocr", "tesseract", null]]);
  /* DEC-4: machine-read text never raises a grade. The engine's step carries the member's cap, and the layer
     it sits beside keeps the null cap it had. */
  t("DEC-4: the OCR step carries the member's cap C, never a grade the document did not have",
    chain.filter((s) => s.step === "ocr").map((s) => s.cap), ["C"]);
  t("THE ROUTE: the reading is recorded at tier 3", r && r.reading && r.reading.text_tier, 3);

  await acquire("syn");
  t("THE ROUTE: on the edge document exactly the unread pages and the scan are asked about, never a gap or text page",
    asked("syn"), [0, 5, 6, 7, 9, 10, 14]);
  await acquire("textonly");
  t("TEXT PAGE: a text page over an image is never sent to OCR", asked("textonly"), null);
  await acquire("gaponly");
  t("GAP: an undetermined page is never sent to OCR (routing it would force it)", asked("gaponly"), null);
} finally {
  await mf.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
