/* NEGATIVE CONTROL: five arms and a baseline in `test/nc-d665.mjs`, run with `node test/nc-d665.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source ALONE and declares, before it runs, what MUST fail and what MUST NOT; each is restored from a uniquely-named pristine copy and verified by sha256 AND content. (a) `baseline`: nothing armed, MUST be green. (b) `invert`: THE ROW'S DECLARED CONTROL. `TIER3_REASONS` gains `image_unread`, the rule inverted, and the chart under a title is sent to OCR, so CHART ROUTE fails by name (with THE FOLIO ROUTE and PHOTO WALL's OCR row) while the markers and THE OP hold. (c) `nomarker`: `extractPdfStructure` stops calling `markImagesUnread`, so CHART, PHOTOS, FLOOR ABOVE, FOLIO, SCAN, OFF-PAGE, VIA FORM, THE OP and the real pages fail while BULLETS, FLOOR BELOW, PLAIN and both routes hold. (d) `nofloor`: the floor drops to 0, so BULLETS, FLOOR BELOW and the floor pin fail while CHART, FLOOR ABOVE and PHOTOS hold. (e) `nodecode`: `decodeView` hands its input back, so PHOTO WALL fails twice (tier 2 is asked about a page of photos, and its reading fails as undecodable) while the routes hold. (f) `reorder`, the OVER-STRICTNESS arm: the per-image markers are put BEFORE the page's other markers, correct work in an order the suite did not anticipate, and MUST be green. RESULTS: M-182 (every arm as declared). */
/* D-665 — EVERY PAINTED IMAGE ABOVE A SIZE FLOOR SAYS ITS CONTENT IS UNREAD, AND THE CHART UNDER A TITLE IS
 * STILL NOT ROUTED, BECAUSE NO MEASURED SIGNAL SEPARATES IT FROM A PHOTO.
 *
 * BOB #35, 2026-09-25 06:25Z: the true statement is per IMAGE and needs no classifier. Every painted image above a
 * size floor carries `image_unread` with its rect and area share. ROUTING that class to OCR waits on one measured
 * signal. M-182 measured the two BOB named over M-178's 49 classified pages, and neither separates the chart under
 * a title from a photo page, so `image_unread` routes nothing, and this suite pins that it routes nothing.
 *
 * WHAT IS REAL AND WHAT IS BUILT. Section 1 reads D-627's committed extract of INFO-2026-0301 (fixtures/d627,
 * PROVENANCE.md). Section 2's pages are built at the edges M-182 measured. Section 4 drives the real `op=acquire`
 * and `op=pdfstructure` in the real plane, with stub fleet members, as `d627-image-content.test.mjs` does.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { extractPdfStructure, IMAGE_UNREAD_MIN_SHARE } from "../src/pdfstructure.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const FIXTURE = fileURLToPath(new URL("./fixtures/d627/fy2325-budget-p633-651.pdf", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha256 = (v) => createHash("sha256").update(v).digest("hex");
/* A page's per-image markers, as comparable values [rect, area_share], in painting order. */
const unread = (s, page) => {
  const p = s && s.text && Array.isArray(s.text.pages) ? s.text.pages.find((x) => x.page === page) : null;
  return p ? (p.undetermined || []).filter((m) => m && m.reason === "image_unread").map((m) => [m.rect, m.area_share]) : null;
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

/* The edges, each ONE page. Index = page number. A US Letter page is 612 x 792 = 484,704 square points. */
const SYN_PAGES = [
  /* 0  CHART */        { text: chars(30), imgs: [[72, 200, 468, 400]] },
  /* 1  PHOTOS */       { text: chars(40), imgs: [[72, 500, 150, 150], [300, 500, 150, 150]] },
  /* 2  BULLETS */      { text: chars(30), imgs: [[72, 700, 5.5, 5.5], [72, 680, 5.5, 5.5]] },
  /* 3  FLOOR ABOVE */  { text: chars(30), imgs: [[72, 72, 24, 24]] },
  /* 4  FLOOR BELOW */  { text: chars(30), imgs: [[72, 72, 20, 20]] },
  /* 5  FOLIO */        { text: "12", imgs: [FULL] },
  /* 6  SCAN */         { noFont: true, imgs: [FULL] },
  /* 7  OFF-PAGE */     { text: chars(30), imgs: [[0, -396, 612, 792]] },
  /* 8  VIA FORM */     { text: chars(30), viaForm: true },
  /* 9  PLAIN */        { text: chars(30) },
];
const SYN = doc(SYN_PAGES);
const REAL = new Uint8Array(readFileSync(FIXTURE));

/* ===================================================================== *
 * 0. THE CORPUS, printed and floored (W34), and the floor pinned.
 * ===================================================================== */
console.log("--- 0. the corpus and the floor ---");
console.log(`D-665 corpus: the real extract ${REAL.length} B sha256 ${sha256(REAL).slice(0, 16)}…, the synthetic document ${SYN.length} B, ${SYN_PAGES.length} pages`);
t("the committed extract is the one fixtures/d627/PROVENANCE.md names, by sha256",
  sha256(REAL), "481099369d7ae92dcfdbd965be654cc236a9cb152bb9a560b851eebcc109ad34");
t("the floor is M-182's: 0.001 of the page, inside the gap between the bullets (<= 0.0000624) and the smallest image (0.0079)",
  IMAGE_UNREAD_MIN_SHARE, 0.001);

/* ===================================================================== *
 * 1. REAL PAGES. Every image INFO-2026-0301's nine pages paint is stated.
 * ===================================================================== */
console.log("\n--- 1. REAL PAGES: INFO-2026-0301 pp 633, 634, 645-651 ---");
const real = await extractPdfStructure(REAL);
t("the extract is nine pages and its image walk finished", [real.pages, Array.isArray(real.images)], [9, true]);
const placed = (i) => real.images.filter((im) => im.page === i).length;
t("REAL PAGES: every page has as many image_unread markers as images it paints (none is under the floor)",
  real.text.pages.map((p) => (unread(real, p.page) || []).length), real.text.pages.map((p) => placed(p.page)));
t("REAL PAGES: each marker names its placement's rect exactly as CPDF-18's `images` does",
  real.text.undetermined.filter((m) => m.reason === "image_unread").map((m) => JSON.stringify([m.page, m.rect])).sort(),
  real.images.map((im) => JSON.stringify([im.page, im.rect])).sort());
t("REAL PAGES: D-627's page marker is still there beside them (two facts, both stated)",
  real.text.pages.map((p) => reasonsOn(real, p.page).includes("image_content_unread")), real.text.pages.map(() => true));
t("REAL PAGES: a marker is not an undetermined CHARACTER: every one carries count 0",
  [...new Set(real.text.undetermined.filter((m) => m.reason === "image_unread").map((m) => m.count))], [0]);
t("REAL PAGES: the document list and its count carry them",
  real.text.counts.undetermined === real.text.undetermined.length, true);

/* ===================================================================== *
 * 2. THE EDGES, built.
 * ===================================================================== */
console.log("\n--- 2. the edges M-182 measured ---");
const syn = await extractPdfStructure(SYN);
t("CHART: an image under a 30-glyph title says its content is unread, with its rect and share (187,200 / 484,704)",
  unread(syn, 0), [[[72, 200, 540, 600], 0.3862]]);
t("CHART: and it carries no page-level image_content marker (a text page, as D-627 measured)",
  reasonsOn(syn, 0), ["image_unread"]);
t("PHOTOS: a photo page's two images each say so, whatever they depict (22,500 / 484,704 each)",
  unread(syn, 1), [[[72, 500, 222, 650], 0.0464], [[300, 500, 450, 650], 0.0464]]);
t("BULLETS: two 5.5-point bullets, share 0.0000624 like the 781 measured, are under the floor and say nothing",
  unread(syn, 2), []);
t("FLOOR ABOVE: a 24-point image (share 0.0012) is over the floor and is stated",
  unread(syn, 3), [[[72, 72, 96, 96], 0.0012]]);
t("FLOOR BELOW: a 20-point image (share 0.0008) is under it", unread(syn, 4), []);
t("FOLIO: D-627's page marker AND the per-image marker, both", [reasonsOn(syn, 5), unread(syn, 5)],
  [["image_content_unread", "image_unread"], [[[0, 0, 612, 792], 1]]]);
t("SCAN: a page with no font keeps no_text_layer, and its image is stated too",
  [reasonsOn(syn, 6), unread(syn, 6)], [["image_unread", "no_text_layer"], [[[0, 0, 612, 792], 1]]]);
/* OVER-STRICTNESS: correct figures in shapes the simplest reading gets wrong. */
t("OFF-PAGE: an image half below the page keeps its whole rect, and its share counts only the visible half",
  unread(syn, 7), [[[0, -396, 612, 396], 0.5]]);
t("VIA FORM: an image painted through a Form XObject is stated", unread(syn, 8), [[[0, 0, 612, 792], 1]]);
t("PLAIN: a page that paints no image says nothing", reasonsOn(syn, 9), []);

/* ===================================================================== *
 * 3. NOTHING ELSE MOVED: a document with no image says nothing new.
 * ===================================================================== */
console.log("\n--- 3. a document with no image ---");
{
  const plain = await extractPdfStructure(doc([{ text: "3" }, { text: chars(10) }]));
  t("no page carries image_unread", plain.text.undetermined.filter((m) => m.reason === "image_unread").length, 0);
}

/* ===================================================================== *
 * 4. THROUGH THE OP. The marker reaches a caller; the chart is never sent to
 *    OCR; a page of photos is never sent to tier 2 on its picture count.
 * ===================================================================== */
console.log("\n--- 4. through op=acquire and op=pdfstructure ---");
const CHARTDOC = doc([{ text: chars(30), imgs: [[72, 200, 468, 400]] }, { text: chars(40) }]);
const FOLIODOC = doc([{ text: "12", imgs: [FULL] }, { text: chars(30), imgs: [[72, 200, 468, 400]] }]);
/* 25 glyphs (a text page to D-627) and 30 photos of 60 points, each over the floor (share 0.0074): 30 image
   markers outnumber 25 glyphs, which is what tier 2's count would read as an undecoded page. */
const WALL = Array.from({ length: 30 }, (_, i) => [40 + (i % 6) * 90, 100 + Math.floor(i / 6) * 90, 60, 60]);
const PHOTOWALL = doc([{ text: chars(25), imgs: WALL }]);
const DOCS = { chart: CHARTDOC, folio: FOLIODOC, photowall: PHOTOWALL };
const SHA = Object.fromEntries(Object.entries(DOCS).map(([k, b]) => [k, sha256(b)]));
let PDF_ASKED = [], OCR_ASKED = [];
const ocrAnswer = (pages) => ({
  ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
  measured_by: "MEASUREMENTS 2026-08-03 (CPDF-9)", confidence_floor: 0.6,
  pages: (Array.isArray(pages) ? pages : []).map((page) => ({
    page,
    regions: [{ text: "Special Revenue Fund", confidence: { value: 0.97, basis: "engine" },
                source: { kind: "pdf-page", ref: `p${page}`, page, rect: [72, 700, 540, 712] } }],
  })),
});
const MEM = "mem-d665";
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
  bindings: { ADMIN_TOKEN: "adm-d665", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d665",
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
const structureOf = async (name) => (await (await mf.dispatchFetch(
  `http://x/api/?op=pdfstructure&store=scratch&sha256=${SHA[name]}&token=${MEM}`)).json());
const asked = (k) => (OCR_ASKED.find((b) => b && b.capture_sha === SHA[k]) || {}).pages ?? null;
try {
  const a = await acquire("chart");
  t("THE OP: the chart document is acquired", a && a.ok, true);
  const st = await structureOf("chart");
  const pg0 = st && st.text && Array.isArray(st.text.pages) ? st.text.pages.find((p) => p.page === 0) : null;
  t("THE OP: op=pdfstructure hands a caller the chart page's image_unread marker, rect and share",
    pg0 ? pg0.undetermined.filter((m) => m.reason === "image_unread").map((m) => [m.rect, m.area_share]) : null,
    [[[72, 200, 540, 600], 0.3862]]);
  t("CHART ROUTE: the chart under a title is never sent to OCR (no measured signal separates it, M-182)",
    asked("chart"), null);
  await acquire("folio");
  t("THE FOLIO ROUTE: D-627's folio page is still sent, and only it, beside a chart page",
    asked("folio"), [0]);
  const wall = (await acquire("photowall")).document;
  console.log(`  (photo wall reading basis: ${JSON.stringify(wall && wall.reading && wall.reading.basis)})`);
  t("PHOTO WALL: 30 photo markers over 25 glyphs do not send the page to tier 2 (a marker is not an undecoded character)",
    PDF_ASKED.some((b) => b && b.capture_sha === SHA.photowall), false);
  t("PHOTO WALL: nor to OCR", asked("photowall"), null);
  t("PHOTO WALL: its reading is made over the text, never FAILED as undecodable on its picture count",
    [wall && wall.reading && wall.reading.read_from_text,
     /undetermined|could not decode/.test(String(wall && wall.reading && wall.reading.basis))], [true, false]);
} finally {
  await mf.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
