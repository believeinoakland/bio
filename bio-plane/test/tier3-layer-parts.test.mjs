/* REC-102 / D-372 — THE TIER-3 MERGE KEEPS THE TIER-2 MERGE'S PER-PAGE TIER.
 *
 * THE DEFECT, IN ONE SENTENCE. `op=acquire`'s tier-3 block rebuilt the layer
 * part of the chain from a single `baseTier`, so a document that reached BOTH
 * merges had the per-page tier-2 statement REC-98 had just wired into the plane
 * collapsed back to one document-level tier one merge later — every page the
 * tier-2 merge deliberately KEPT at tier 1 recorded as tier 2.
 *
 * IT IS NOT A REGRESSION AND THIS SUITE DOES NOT CLAIM IT WAS. Before REC-98
 * the escalation assigned tier 2 wholesale, so those pages read tier 2 anyway;
 * what REC-98 made possible, this item makes survive.
 *
 * ------------------------------------------------------------------------
 * THE FIXTURE, AND WHY IT IS SYNTHESISED RATHER THAN CAPTURED
 * ------------------------------------------------------------------------
 * D-372 was raised WITHOUT a fixture and said so: reaching both merges needs a
 * document that (a) escalates at `needsTier2`, (b) is genuinely MIXED after the
 * tier-2 merge, and (c) still answers `needsTier3` — which requires a
 * `no_text_layer` marker to SURVIVE that merge. A page tier 2 wins cannot supply
 * one (a page with no text can never satisfy the shipped rule's second
 * condition), so the marker must come from a page tier 1 KEPT: a text-layer
 * report carrying BOTH an unmappable-font page AND a fontless image page.
 * CPDF-20's 50-document census found exactly one such document and DELIBERATELY
 * DID NOT COMMIT IT, because it is a private individual's resume.
 *
 * **SO THE CLASS IS BUILT RATHER THAN TAKEN, AND THE ITEM IS DRIVEN RATHER THAN
 * ARGUED.** `BOTH` below is three pages in the three shapes the class needs, in
 * the structure `pdfstructure.mjs` actually reads:
 *
 *   page 0  a font resource with NO `/ToUnicode` and twenty show operations —
 *           `loadFont` returns `toUni: null`, so every run becomes a
 *           `no_tounicode` marker and NO character is decoded. This is the page
 *           tier 2 is FOR, and the page it wins.
 *   page 1  no font resource at all, one full-page `DCTDecode` image — tier 1's
 *           own `no_text_layer` marker (CPDF-9's structural signal: zero fonts
 *           AND an image drawn). Tier 2 has nothing to tell it, so the merge
 *           KEEPS it and the marker survives; that marker is what `needsTier3`
 *           then reads.
 *   page 2  an identity-CMap font and one short line — decodes byte-for-byte.
 *           **This is the page the defect was about.** The tier-2 merge keeps it
 *           at tier 1; the tier-3 merge used to relabel it tier 2.
 *
 * The page counts are not decorative: `needsTier2` escalates on MARKERS
 * outnumbering decoded CHARACTERS, so page 2's line is deliberately short and
 * page 0's runs deliberately many, and both facts are ASSERTED below rather than
 * left to arithmetic nobody re-checks.
 *
 * WHAT IS REAL HERE AND WHAT IS A STUB, STATED PLAINLY. The bytes are real PDF
 * bytes and tier 1 is the real `pdfstructure.mjs` reading them through the real
 * `op=acquire` in the real plane. The two FLEET MEMBERS are stubs — the pdf.js
 * member and the tesseract member — for the same reason `tier2-wire.test.mjs`
 * arm 4 stubs one: the relationship this class needs must be controlled on both
 * sides, and neither member can be asked to decode a synthesised page a
 * particular way on demand. Everything between the bytes and the recorded chain
 * is the plane's own.
 *
 * WHAT THIS SUITE CANNOT SEE. It cannot say what a REAL pdf.js decode of page 0
 * would be, so it does not assert that the class is common — only that the class
 * is reachable and that the plane records it honestly when it is reached. The
 * frequency question is CPDF-20's census and is unchanged by this item.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/nc-rec102.mjs` — COMMITTED, so it re-runs
 * in one step. FIVE rows, each armed ALONE with every other defence held open, each
 * restored from a uniquely named per-arm pristine copy verified by sha256 AND by
 * `cmp` with the byte count printed and floored, and each DECLARING before it ran
 * what must fail and what must not:
 *   (0) BASELINE, nothing armed -> exit 0 with a real assertion tally, never a bare 0.
 *   (1) A1 THE FIX REVERTED, the partition emptied so every layer page falls to the
 *       single `baseTier` part — the pre-item code exactly -> exit 1, and it must fail
 *       on the D-372 assertions BY NAME and NOT stray into either over-strictness
 *       section.
 *   (2) A2 THE CARRY DROPPED at the tier-2 site, so the tier-3 site has nothing to
 *       partition by -> exit 1, the same collapse through a DIFFERENT door. Separate
 *       from A1 deliberately: a landing that shipped one half would pass the other's
 *       arm completely.
 *   (3) A3 OVER-STRICTNESS, the same partition spelled the other way round — walking
 *       the layer pages rather than filtering the tier lists -> exit 0. Correct work
 *       in a spelling nobody anticipated must PASS.
 *   (4) A4 THE FIXTURE'S OWN MARGIN BROKEN, page 2's line lengthened past the marker
 *       count so `needsTier2` stops escalating -> exit 1, naming the PREMISE
 *       assertions, which are a different set from A1's and A2's. This is the arm that
 *       catches green-over-nothing.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha256 = (v) => createHash("sha256").update(v).digest("hex");

/* ===================================================================== *
 * THE PDF BUILDER.
 *
 * A DELIBERATE SECOND COPY OF `textchain.test.mjs`'s, and the reason is the
 * runner rather than taste: that file is a `.test.mjs`, so importing it here
 * would RE-RUN the whole D-252 suite inside this process and count its
 * assertions twice. A fixture BUILDER is not a subject under test — there is one
 * home for the code being tested and this is not it — so the copy costs nothing
 * the estate's no-second-spelling rule is protecting. The page shapes are the
 * same ones CPDF-9 measured its real Oakland exhibit to have.
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

const IDENTITY_CMAP = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;

const showOps = (lines) => Buffer.from(
  "BT /F1 10 Tf " + lines.map((l, i) => (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET", "latin1");
const IMAGE_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const IMAGE_OPS = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");

/* The twenty runs tier 1 cannot map: a real font resource, selected and shown,
   with no `/ToUnicode` stream anywhere. `loadFont` returns `toUni: null` and
   every `Tj` becomes one `no_tounicode` marker carrying zero decoded text. */
const UNMAPPABLE_RUNS = Array.from({ length: 20 }, (_, i) => `Resolution 26-77${String(i).padStart(2, "0")}`);
/* The short line tier 1 reads perfectly. SHORT ON PURPOSE: `needsTier2` compares
   markers against decoded characters document-wide, so this page's length is
   what decides whether the class is reachable at all. */
const GOOD_LINE = "Item 3.1";

/* ---- BOTH: the document that reaches BOTH merges. THE ITEM'S SUBJECT. ---- */
const BOTH = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R 7 0 R 10 0 R] /Count 3 >>" },
  /* page 0 — the unmappable text page (font present, ToUnicode absent) */
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
  { num: 4, head: `<< /Length ${showOps(UNMAPPABLE_RUNS).length} >>`, stream: showOps(UNMAPPABLE_RUNS) },
  { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Garamond-Custom >>" },
  /* page 1 — the scan: no font resource, one full-page image */
  { num: 7, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 100 0 R >> >> /Contents 8 0 R >>" },
  { num: 8, head: `<< /Length ${IMAGE_OPS.length} >>`, stream: IMAGE_OPS },
  /* page 2 — the page THE DEFECT WAS ABOUT: tier 1 reads it, tier 2 never touches it */
  { num: 10, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 12 0 R >> >> /Contents 11 0 R >>" },
  { num: 11, head: `<< /Length ${showOps([GOOD_LINE]).length} >>`, stream: showOps([GOOD_LINE]) },
  { num: 12, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 13 0 R >>" },
  { num: 13, head: `<< /Length ${Buffer.from(IDENTITY_CMAP, "latin1").length} >>`, stream: Buffer.from(IDENTITY_CMAP, "latin1") },
  { num: 100, head: `<< /Type /XObject /Subtype /Image /Width 2550 /Height 3300 /Filter /DCTDecode /Length ${IMAGE_BYTES.length} >>`, stream: IMAGE_BYTES },
]);

/* ---- TIER3ONLY: a text page and a scan. Reaches the TIER-3 merge and NOT the
   tier-2 one, because every marker it carries is a scan marker and `needsTier2`
   declines that by name. THE OVER-STRICTNESS ARM. ---- */
const TIER3ONLY = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R 7 0 R] /Count 2 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
  { num: 4, head: `<< /Length ${showOps([GOOD_LINE]).length} >>`, stream: showOps([GOOD_LINE]) },
  { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
  { num: 6, head: `<< /Length ${Buffer.from(IDENTITY_CMAP, "latin1").length} >>`, stream: Buffer.from(IDENTITY_CMAP, "latin1") },
  { num: 7, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 100 0 R >> >> /Contents 8 0 R >>" },
  { num: 8, head: `<< /Length ${IMAGE_OPS.length} >>`, stream: IMAGE_OPS },
  { num: 100, head: `<< /Type /XObject /Subtype /Image /Width 2550 /Height 3300 /Filter /DCTDecode /Length ${IMAGE_BYTES.length} >>`, stream: IMAGE_BYTES },
]);

/* ---- TIER2ONLY: an unmappable page and a good page, no scan. Reaches the
   TIER-2 merge and NOT the tier-3 one. THE SECOND OVER-STRICTNESS ARM — REC-98's
   own answer must be untouched by this item. ---- */
const TIER2ONLY = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R 10 0 R] /Count 2 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
  { num: 4, head: `<< /Length ${showOps(UNMAPPABLE_RUNS).length} >>`, stream: showOps(UNMAPPABLE_RUNS) },
  { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Garamond-Custom >>" },
  { num: 10, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 12 0 R >> >> /Contents 11 0 R >>" },
  { num: 11, head: `<< /Length ${showOps([GOOD_LINE]).length} >>`, stream: showOps([GOOD_LINE]) },
  { num: 12, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 13 0 R >>" },
  { num: 13, head: `<< /Length ${Buffer.from(IDENTITY_CMAP, "latin1").length} >>`, stream: Buffer.from(IDENTITY_CMAP, "latin1") },
]);

const DOCS = { both: BOTH, tier3only: TIER3ONLY, tier2only: TIER2ONLY };
const SHA = Object.fromEntries(Object.entries(DOCS).map(([k, b]) => [k, sha256(b)]));

/* THE CORPUS IS PRINTED AND FLOORED. Three headline totality assertions in this
   estate have passed OVER AN EMPTY CORPUS, and a synthesised corpus can become
   nothing even more quietly than a committed one. */
console.log(`REC-102 corpus: ${Object.keys(DOCS).length} synthesised PDFs, `
  + `${Object.values(DOCS).reduce((n, b) => n + b.length, 0)} bytes total`);
for (const [k, b] of Object.entries(DOCS))
  if (b.length < 400) throw new Error(`REC-102 fixture ${k} is ${b.length} B — the corpus floor is 400 B`);
t("the corpus is three documents: both merges, tier 3 alone, tier 2 alone",
  Object.keys(DOCS).length, 3);

/* ===================================================================== *
 * THE TWO STUB FLEET MEMBERS.
 *
 * The pdf.js member answers ONLY for the two documents that escalate, and ONLY
 * for their unmappable page — it says NOTHING about the scan or the good page,
 * which is what a real pdf.js run would also have no reason to improve. That
 * silence is load-bearing: `mergeTier2Text` keeps a page nobody offered an
 * alternative for, so the good page's tier-1 provenance is decided by the
 * PLANE's rule and not by the stub.
 * ===================================================================== */
const TIER2_TEXT = UNMAPPABLE_RUNS.join("\n");
let PDF_ASKED = [], OCR_ASKED = [];

const tier2Answer = (sha) => {
  if (sha !== SHA.both && sha !== SHA.tier2only) return null;
  const pages = [{ page: 0, text: TIER2_TEXT, undetermined: [] }];
  return { ok: true, tier: 2, notes: [], links: [], structure: {},
           text: { document: TIER2_TEXT, pages, undetermined: [],
                   counts: { chars: TIER2_TEXT.length, undetermined: 0 } } };
};

const OCR_LINES = ["EXHIBIT A", "Certified true copy", "Office of the City Clerk"];
const ocrAnswer = (pages) => ({
  ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
  measured_by: "MEASUREMENTS.md 2026-08-03 (CPDF-9)", confidence_floor: 0.6,
  pages: (Array.isArray(pages) ? pages : []).map((page) => ({
    page,
    regions: OCR_LINES.map((text, i) => ({
      text, confidence: { value: 0.97, basis: "engine" },
      source: { kind: "pdf-page", ref: `p${page}`, page, rect: [72, 700 - i * 12, 540, 712 - i * 12] },
    })),
  })),
});

const MEM = "mem-rec102";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  serviceBindings: {
    async PDF_WORKER(request) {
      if (new URL(request.url).pathname !== "/structure") return new Response("no", { status: 404 });
      const body = await request.json().catch(() => null);
      PDF_ASKED.push(body);
      const answer = tier2Answer(body && body.capture_sha);
      return answer ? Response.json(answer) : new Response("declined", { status: 500 });
    },
    async OCR_WORKER(request) {
      if (new URL(request.url).pathname !== "/transcribe") return new Response("no", { status: 404 });
      const body = await request.json().catch(() => null);
      OCR_ASKED.push(body);
      return Response.json(ocrAnswer(body && body.pages));
    },
  },
  bindings: { ADMIN_TOKEN: "adm-rec102", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-rec102",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const name = new URL(request.url).pathname.replace(/^\//, "").replace(/\.pdf$/, "");
    return Object.prototype.hasOwnProperty.call(DOCS, name)
      ? new Response(DOCS[name], { headers: { "content-type": "application/pdf" } })
      : new Response("unscripted", { status: 500 });
  },
});

const acquire = async (name) => (await (await mf.dispatchFetch(
  `http://x/api/?op=acquire&token=${MEM}`,
  { method: "POST", body: JSON.stringify({ locator: `https://oakland.legistar.com/${name}.pdf`,
                                           authority: "City Clerk" }) })).json());

/* CHAIN READERS THAT ARE NULL-TOLERANT BY CONSTRUCTION. `textchain.test.mjs`
   records this estate's most expensive control defect: an indexed read into a
   shorter-than-expected chain threw a TypeError that ENDED THE MODULE while the
   tally still read clean. Every read here goes through a reader that answers a
   VALUE rather than throwing, so a missing chain fails loudly and says what it
   wanted. */
const chainOf = (doc) => {
  const c = doc && doc.reading && doc.reading.text_source;
  return Array.isArray(c) ? c : [];
};
/* The chain as a CONSUMER sees it: what each step is, which tier it names, and
   which pages it covers. One shape for every assertion below, so "the chain
   changed" and "the chain changed HERE" are the same reading. */
const shapeOf = (doc) => chainOf(doc).map((s) => [
  s.step,
  Object.prototype.hasOwnProperty.call(s, "tier") ? s.tier : "(no tier key)",
  (s.extent && s.extent.kind === "pages") ? s.extent.pages : null,
]);

/* ===================================================================== *
 * 0. THE FIXTURE IS THE CLASS IT CLAIMS TO BE — asserted, never assumed.
 *
 * Every assertion after this one is worthless if the document does not actually
 * reach both merges, and "it reached both merges" is exactly the kind of premise
 * that reads as already-checked. So the routing is read off the plane's own
 * answer before anything about the chain is claimed.
 * ===================================================================== */
console.log("\n--- 0. THE FIXTURE REACHES BOTH MERGES, AND THE PLANE'S OWN ANSWER SAYS SO ---");
const both = (await acquire("both")).document;
{
  t("op=acquire produced a reading for the three-page document",
    !!(both && both.reading), true);
  t("the TIER-2 member was consulted for it — merge one was reached",
    PDF_ASKED.some((b) => b && b.capture_sha === SHA.both), true);
  t("the TIER-3 member was consulted for it, and ONLY for the scanned page — merge two was reached",
    (OCR_ASKED.find((b) => b && b.capture_sha === SHA.both) || {}).pages, [1]);
  t("the document is recorded at tier 3 overall, as it always was: an engine read a page of it",
    both.reading.text_tier, 3);
}

/* ===================================================================== *
 * 1. THE ITEM. The per-page tier-2 statement SURVIVES the tier-3 merge.
 * ===================================================================== */
console.log("\n--- 1. D-372: the layer part is PARTITIONED by tier, not collapsed onto one ---");
{
  /* THE ASSERTION THE ITEM EXISTS FOR. Before this item the layer part was ONE
     part at ONE tier, so page 2 — which the tier-2 merge deliberately KEPT at
     tier 1 — came back stamped `tier: 2`: the record naming a derivation that
     page does not have. Revert the fix and this line fails by name. */
  t("FOUR steps: tier 1 over the page it read, tier 2 over the page it won, "
    + "and the engine's two over the page it transcribed",
    shapeOf(both),
    [["layer", 1, [2]], ["layer", 2, [0]], ["pixels", "(no tier key)", [1]], ["ocr", "(no tier key)", [1]]]);
  t("page 2 is recorded as TIER 1 — the statement REC-98 wired, still standing one merge later",
    (shapeOf(both).find((s) => s[0] === "layer" && Array.isArray(s[2]) && s[2].includes(2)) || [])[1], 1);
  t("...and it is NOT ALSO claimed by the tier-2 step, which would give one page two derivations",
    (shapeOf(both).find((s) => s[0] === "layer" && s[1] === 2) || [])[2], [0]);
  t("every page that produced text is covered exactly once, and the scan is covered by the engine",
    [...chainOf(both).filter((s) => s.step === "layer")
      .flatMap((s) => s.extent.pages), ...chainOf(both).filter((s) => s.step === "ocr")
      .flatMap((s) => s.extent.pages)].sort((a, b) => a - b), [0, 1, 2]);
  /* BOTH LAYER PARTS ARE DERIVATIONS OF THE SAME FILE UNDER THE SAME NULL CAP,
     so nothing is OVERCLAIMED by the partition — what was wrong was the SENTENCE
     the record made, not the fidelity it claimed. */
  t("both layer steps carry the same undetermined cap: the split states a fact, it does not raise a grade",
    [...new Set(chainOf(both).filter((s) => s.step === "layer").map((s) => `${s.step}:${s.cap}`))],
    ["layer:null"]);
  /* THE PARTITION PRODUCES A CHAIN THE RECORD WOULD ACCEPT, checked by the
     record's OWN validator rather than by this suite's reading of it. A fix that
     composed three parts into something `checkChain` refuses would have stored
     NO chain at all — and a null chain reads, from the outside, exactly like a
     document nothing ever transcribed. */
  const { checkChain } = await import("../src/textchain.mjs");
  t("the three-part chain is one the record's own validator accepts",
    checkChain(chainOf(both)), null);
  t("the engine step still NAMES what performed it, which is the fact a chain exists to carry",
    (chainOf(both).find((s) => s.step === "ocr") || {}).engine, "tesseract");
}

/* ===================================================================== *
 * 2. OVER-STRICTNESS I — a document reaching ONLY the tier-3 merge answers
 *    exactly what it answered before this item existed.
 * ===================================================================== */
console.log("\n--- 2. OVER-STRICTNESS: tier 3 alone, and the answer is unchanged ---");
{
  const only3 = (await acquire("tier3only")).document;
  t("it did NOT escalate to tier 2 — every marker it carries is a scan marker, "
    + "and `needsTier2` declines that class by name",
    PDF_ASKED.some((b) => b && b.capture_sha === SHA.tier3only), false);
  t("the TIER-3 member WAS consulted, for the scanned page only",
    (OCR_ASKED.find((b) => b && b.capture_sha === SHA.tier3only) || {}).pages, [1]);
  /* THE PRE-ITEM ANSWER, PINNED. With no tier-2 merge there is no per-page
     partition, so the layer part falls back to the document's own wired tier in
     the same position it always occupied. A fix that changed this shape would be
     an undeclared interface change wearing the costume of caution. */
  t("ONE layer part at tier 1 over the page tier 1 read, then the engine's two — "
    + "byte-for-byte the shape this document recorded before D-372 was closed",
    shapeOf(only3),
    [["layer", 1, [0]], ["pixels", "(no tier key)", [1]], ["ocr", "(no tier key)", [1]]]);
  t("and it is still recorded at tier 3 overall", only3.reading.text_tier, 3);
}

/* ===================================================================== *
 * 3. OVER-STRICTNESS II — REC-98's own answer is untouched.
 * ===================================================================== */
console.log("\n--- 3. OVER-STRICTNESS: tier 2 alone, and REC-98's scoped chain is untouched ---");
{
  const only2 = (await acquire("tier2only")).document;
  t("it escalated to tier 2", PDF_ASKED.some((b) => b && b.capture_sha === SHA.tier2only), true);
  t("and the TIER-3 member was NEVER consulted — no marker survived for it to read",
    OCR_ASKED.some((b) => b && b.capture_sha === SHA.tier2only), false);
  /* This chain is composed at the TIER-2 site, which this item did not touch
     beyond remembering the partition it already computed. It is asserted here so
     that a change to the carry which damaged the tier-2 site would fail HERE
     rather than nowhere. */
  t("REC-98's scoped two-part chain, unchanged: tier 1 over the page it kept, tier 2 over the page it won",
    shapeOf(only2), [["layer", 1, [1]], ["layer", 2, [0]]]);
  t("and it is recorded at tier 2 overall", only2.reading.text_tier, 2);
}

/* ===================================================================== *
 * 4. THE PREMISE OF THE WHOLE FIXTURE, DRIVEN AT THE PREDICATE.
 *
 * `needsTier2` compares MARKERS against decoded CHARACTERS document-wide. If
 * page 2's line were long enough, or page 0's runs few enough, the document
 * would stop escalating and every assertion above would pass over a document
 * that never reached merge one — green, and about nothing. So the margin is
 * asserted rather than arranged and forgotten.
 * ===================================================================== */
console.log("\n--- 4. THE FIXTURE'S OWN MARGIN, asserted so it cannot go quiet ---");
{
  const { extractPdfStructure } = await import("../src/pdfstructure.mjs");
  const t1 = (await extractPdfStructure(BOTH)).text;
  t("tier 1 ordered three pages", t1.pages.length, 3);
  t("page 0 decoded NOTHING and produced one marker per run",
    [t1.pages[0].text.length, t1.pages[0].undetermined.length], [0, 20]);
  t("page 1 is named a scan by tier 1 itself — the marker the tier-3 predicate reads",
    t1.pages[1].undetermined.map((m) => m.reason), ["no_text_layer"]);
  t("page 2 decoded its short line byte-for-byte", t1.pages[2].text.includes(GOOD_LINE), true);
  t("and the escalation predicate's own inputs clear it with margin: 21 markers over 8 characters",
    [t1.counts.undetermined, t1.counts.chars, t1.counts.undetermined > t1.counts.chars],
    [21, GOOD_LINE.length, true]);
}

await mf.dispose();
console.log(`\ntier3-layer-parts: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
