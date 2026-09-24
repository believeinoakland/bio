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
 *   (5) A5 D-514: THE LAYER FILTER BACK ON RAW `text.length` -> exit 1, naming D-514's
 *       ATTRIBUTION set and straying into no other. THE ROW'S OWN DECLARED CONTROL.
 *   (6) A6 OVER-STRICTNESS for D-514, the same predicate as a `\S` test -> exit 0.
 *   (7) A7 D-514: THE ROUTING BACK ON RAW `counts.chars` -> exit 1, naming the ROUTING
 *       set only. Armed apart from A5 because D-514 has two halves and a landing that
 *       shipped one would pass the other's arm completely.
 * Result 2026-09-24 (D-514): 8 of 8 arms agreed with their declarations, baseline 43
 * assertions, every restore sha256-MATCH and cmp-IDENTICAL. AND THE RUN REPAIRED TWO
 * ARMS THAT HAD NOT BEEN ARMING: A1 — the arm that proves D-372's gap was real — and
 * A3, both anchored at an indentation `src/index.mjs` stopped carrying when CPDF-19's
 * read-time copy of the partition was collapsed into one. Recorded in `nc-rec102.mjs`'s
 * own header, not smoothed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT SECTIONS 5-7 CAN AND CANNOT SEE (D-514), stated because it is load-bearing:
 *   THEY CAN see, through the op, that a whitespace-only page is attributed to no
 *   layer part and records the same chain as an empty one; that the escalation
 *   predicate consults the member for a document sitting one character inside the
 *   band where the glyph rule and the raw rule disagree; and that the real witness
 *   the row names, `legistar-73550` p1, reads 39 characters and ZERO glyphs.
 *   THEY CANNOT drive that real page through the op, and nothing here pretends
 *   otherwise: no page of that document carries a `no_text_layer` marker, so it
 *   never reaches the tier-3 merge, and no committed PDF pairs a whitespace page
 *   with a scan. The two halves are driven APART — the page at the counter, the
 *   wire over a synthesised pair — and neither stands in for the other.
 *   THEY CANNOT see the two BASE judgments D-514 also corrected (the wholesale
 *   refusals in `mergeTier2Text` and `mergeTier3Text`), because no producer in this
 *   plane emits a text shape with no per-page grain — `tier2-wire.test.mjs` section 8
 *   measured that and drives the tier-2 one at the merge directly. Nor the per-page
 *   `empty` test, which a whitespace page never reaches through the op because it
 *   carries no marker to be eligible for OCR at all. Those three are guards, named
 *   as guards at their sites, and this suite claims nothing about them.
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
/* Bound at section 1 from the module's own export and read again at section 5,
   so both sections put their chains through the RECORD's validator rather than
   through two imports that could drift. */
let checkChainD514 = null;

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

/* ---- D-514's PAIR. Two documents identical in every way but ONE: the text page
   holds four SPACES in the first and NOTHING in the second. Tier 1 reads both,
   neither draws a marker (a font is declared, so the page is not a scan), and
   neither holds a single GLYPH. The record must therefore say the SAME thing
   about both — and until D-514 it did not: the whitespace page went into the
   `layer` part of the chain on `p.text.length`, so the record named a tier-1
   derivation for a page from which nothing was derived, while the empty page
   correctly belonged to neither part.

   WHY A PAIR AND NOT ONE DOCUMENT. An assertion that the two agree would pass for
   free if both chains came back null or empty, which is how three headline
   assertions in this estate passed over nothing. So each shape is asserted
   POSITIVELY and in full below, and the agreement is read off those two readings
   rather than asserted as an equality in its own right.

   WHY IT IS SYNTHESISED WHEN A REAL WITNESS EXISTS. The real one is
   `legistar-73550` p1 — 39 characters and ZERO glyphs, measured at M-140 — and it
   is driven at the counter in section 6. It cannot be driven HERE, through the
   op, because it carries no `no_text_layer` marker anywhere in its document, so
   nothing in that file ever reaches the tier-3 merge. The class needs a scan on
   the same document to reach the site at all, and no committed PDF pairs the two.
   Both halves are stated rather than one standing in for the other. ---- */
const WS_LINE = "    ";
const wsOrEmpty = (showLines) => pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R 7 0 R] /Count 2 >>" },
  /* page 0 — a REAL text page: a font with a working `/ToUnicode`, selected and
     shown. Tier 1 decodes it faithfully; what it decodes holds no glyph. */
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
  { num: 4, head: `<< /Length ${showOps(showLines).length} >>`, stream: showOps(showLines) },
  { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
  { num: 6, head: `<< /Length ${Buffer.from(IDENTITY_CMAP, "latin1").length} >>`, stream: Buffer.from(IDENTITY_CMAP, "latin1") },
  /* page 1 — the scan, exactly as the other fixtures build it: the marker that
     carries the document to the tier-3 merge in the first place. */
  { num: 7, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 100 0 R >> >> /Contents 8 0 R >>" },
  { num: 8, head: `<< /Length ${IMAGE_OPS.length} >>`, stream: IMAGE_OPS },
  { num: 100, head: `<< /Type /XObject /Subtype /Image /Width 2550 /Height 3300 /Filter /DCTDecode /Length ${IMAGE_BYTES.length} >>`, stream: IMAGE_BYTES },
]);
const WSLAYER = wsOrEmpty([WS_LINE]);   /* the text page holds four spaces */
const EMPTYLAYER = wsOrEmpty([]);       /* the text page holds nothing at all */

/* ---- D-514's ROUTING WITNESS. `needsTier2` escalates when the marker count
   EXCEEDS the decoded text, and until D-514 "decoded text" was `counts.chars`,
   the raw character count. The two rules differ only in the band between a
   document's glyphs and its characters — exactly the whitespace — so a document
   that lands IN that band is the only thing that can tell them apart. This is
   that document, and the band is one character wide on purpose: EIGHT
   unmappable runs against the good line's 8 characters and 7 glyphs.
     under the RAW rule:    8 markers > 8 characters -> FALSE, never escalates
     under the GLYPH rule:  8 markers > 7 glyphs     -> TRUE,  escalates
   The numbers are ASSERTED below, not arranged and forgotten, because a fixture
   that drifts out of the band stops discriminating and every assertion on it
   goes quiet rather than red. The stub member DECLINES this document (it answers
   only for `both` and `tier2only`), which is deliberate: what is under test is
   the ROUTING DECISION — whether the member is consulted at all — and a
   declining member is a path the plane already handles. ---- */
const MARGIN_RUNS = Array.from({ length: 8 }, (_, i) => `Resolution 26-78${String(i).padStart(2, "0")}`);
const ROUTEMARGIN = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R 10 0 R] /Count 2 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
  { num: 4, head: `<< /Length ${showOps(MARGIN_RUNS).length} >>`, stream: showOps(MARGIN_RUNS) },
  { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Garamond-Custom >>" },
  { num: 10, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 12 0 R >> >> /Contents 11 0 R >>" },
  { num: 11, head: `<< /Length ${showOps([GOOD_LINE]).length} >>`, stream: showOps([GOOD_LINE]) },
  { num: 12, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 13 0 R >>" },
  { num: 13, head: `<< /Length ${Buffer.from(IDENTITY_CMAP, "latin1").length} >>`, stream: Buffer.from(IDENTITY_CMAP, "latin1") },
]);

const DOCS = { both: BOTH, tier3only: TIER3ONLY, tier2only: TIER2ONLY,
               wslayer: WSLAYER, emptylayer: EMPTYLAYER, routemargin: ROUTEMARGIN };
const SHA = Object.fromEntries(Object.entries(DOCS).map(([k, b]) => [k, sha256(b)]));

/* THE CORPUS IS PRINTED AND FLOORED. Three headline totality assertions in this
   estate have passed OVER AN EMPTY CORPUS, and a synthesised corpus can become
   nothing even more quietly than a committed one. */
console.log(`REC-102 corpus: ${Object.keys(DOCS).length} synthesised PDFs, `
  + `${Object.values(DOCS).reduce((n, b) => n + b.length, 0)} bytes total`);
for (const [k, b] of Object.entries(DOCS))
  if (b.length < 400) throw new Error(`REC-102 fixture ${k} is ${b.length} B — the corpus floor is 400 B`);
/* THE COUNT MOVED 3 -> 6 AT D-514 (2026-09-24) and the floor moved WITH it, to
   the figure this file PRINTS. A corpus assertion that stayed at 3 would have
   kept passing over a fixture pair that had silently stopped being built. */
t("the corpus is six documents: both merges, tier 3 alone, tier 2 alone, D-514's whitespace/empty pair and its routing witness",
  Object.keys(DOCS).length, 6);

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
/* THE `.md` IS OFF THESE PROVENANCE LABELS ON PURPOSE (M0-165, 2026-09-24). `measured_by` is a FREE STRING
   (index.mjs' chain contract) naming WHERE a fidelity grade was measured; it is not a path and nothing opens
   it. But `tools/gates.mjs` reads a unit's code with the estate's one lexer, which KEEPS strings on purpose
   (D-301: a path is a string), so its basename probe read `"MEASUREMENTS.md …"` here as a read of the ledger
   and made this suite a MEASUREMENTS reader — selected, and run, for every measurement anyone appends.
   Do not put it back: `bio-plane/test/statepaths.test.mjs` pins the property and names the file that breaks it. */
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
  checkChainD514 = checkChain;          /* D-514's section 5 reads the same validator */
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
  /* CORRECTED AT D-514, 2026-09-24. This read `t1.counts.chars` — the RAW
     character count — and said the predicate clears its margin over 8
     characters. `needsTier2` no longer reads that number: it reads the GLYPHS of
     the text in hand, which for `"Item 3.1"` is 7, because the space is not
     decoded text. The old assertion was not merely superseded, it named an input
     the predicate does not consult, so a change to the predicate could not fail
     here. BOTH figures are pinned now: `counts.chars` stays 8 (the raw counter is
     untouched by D-514 — it is a reported quantity, D-501's interface note) and
     the margin is asserted on the 7 the predicate actually weighs. */
  const glyphsOf = (str) => { let n = 0; for (const ch of str) if (!/\s/u.test(ch)) n++; return n; };
  t("the RAW counter is untouched and still reports 8 characters for the good line",
    t1.counts.chars, GOOD_LINE.length);
  t("and the escalation predicate's own input clears it with margin: 21 markers over 7 GLYPHS",
    [t1.counts.undetermined, glyphsOf(t1.document), t1.counts.undetermined > glyphsOf(t1.document)],
    [21, 7, true]);
}

/* ===================================================================== *
 * 5. D-514 — A PAGE CARRIES TEXT WHEN IT CARRIES A GLYPH, DRIVEN THROUGH THE OP.
 *
 * The layer attribution filtered on `p.text.length`, so a page whose tier-1
 * reading is whitespace and nothing else went into the `layer` part of the
 * chain: the record named a tier-1 derivation for a page from which nothing was
 * derived. The two documents below are identical but for four spaces, and the
 * record must say the same thing about both.
 * ===================================================================== */
console.log("\n--- 5. D-514: a whitespace-only page is attributed to NO layer part ---");
{
  const ws = (await acquire("wslayer")).document;
  const mt = (await acquire("emptylayer")).document;

  /* THE PREMISE FIRST, because every assertion under it is worthless if these
     documents did not reach the tier-3 merge — and a document that never got
     there has an empty layer part for a reason that has nothing to do with
     D-514. Read off the plane's own answer, never assumed. */
  t("the whitespace document reached the TIER-3 merge: the engine was consulted, for the scan only",
    (OCR_ASKED.find((b) => b && b.capture_sha === SHA.wslayer) || {}).pages, [1]);
  t("and it did NOT escalate to tier 2 — its one marker is a scan marker",
    PDF_ASKED.some((b) => b && b.capture_sha === SHA.wslayer), false);
  t("the empty-page document reached it the same way", 
    (OCR_ASKED.find((b) => b && b.capture_sha === SHA.emptylayer) || {}).pages, [1]);

  /* THE ASSERTION THE ITEM EXISTS FOR, stated POSITIVELY and in full rather than
     as an absence: the chain is the engine's two steps and NOTHING ELSE. Restore
     the raw-length filter and this line fails by name, with a `layer` step at
     tier 1 over page 0 appearing in a document that decoded no glyph. */
  t("the whitespace page is in NO layer part: the chain is the engine's two steps, unscoped",
    shapeOf(ws), [["pixels", "(no tier key)", null], ["ocr", "(no tier key)", null]]);
  t("...and no step anywhere in it names page 0",
    chainOf(ws).some((st) => st.extent && st.extent.kind === "pages"
                          && (st.extent.pages || []).includes(0)), false);
  t("the empty page records the very same chain — which is the point: four spaces are not text",
    shapeOf(mt), [["pixels", "(no tier key)", null], ["ocr", "(no tier key)", null]]);
  /* NOT AN EQUALITY ASSERTED FOR ITS OWN SAKE. Two empty readings agree for
     free, so the shape above is pinned positively on BOTH and the engine is
     named on both; the agreement is what those four readings show, not a fifth
     assertion that costs nothing. */
  t("both chains name the engine that produced them",
    [(chainOf(ws).find((st) => st.step === "ocr") || {}).engine,
     (chainOf(mt).find((st) => st.step === "ocr") || {}).engine], ["tesseract", "tesseract"]);
  t("and both are chains the record's own validator accepts",
    [checkChainD514(chainOf(ws)), checkChainD514(chainOf(mt))], [null, null]);
  t("both are recorded at tier 3 overall", [ws.reading.text_tier, mt.reading.text_tier], [3, 3]);
}

/* ===================================================================== *
 * 6. D-514's REAL WITNESS, driven at the COUNTER the filter now reads.
 *
 * `legistar-73550` p1 is the page the row names: a real Oakland PDF page whose
 * tier-1 reading is 39 characters and ZERO glyphs (M-140). It cannot be driven
 * through the op here — nothing in that document carries a `no_text_layer`
 * marker, so it never reaches the tier-3 merge at all — so the two halves are
 * driven apart and neither is claimed to be the other: the REAL page is measured
 * at the counter, and the WIRE is driven over the synthesised pair above.
 * ===================================================================== */
console.log("\n--- 6. D-514: the real witness, measured at the counter ---");
{
  const { extractPdfStructure } = await import("../src/pdfstructure.mjs");
  const { glyphCount } = await import("../src/textchain.mjs");
  const FIXTURE = new URL("./fixtures/cpdf20/legistar-73550.pdf", import.meta.url);
  const real = (await extractPdfStructure(new Uint8Array(readFileSync(FIXTURE)))).text;
  const p1 = (real.pages || []).find((pg) => pg && pg.page === 1);
  t("the fixture is present and tier 1 ordered its pages", !!p1, true);
  /* THE FIGURE FROM M-140, RE-MEASURED HERE RATHER THAN QUOTED. A number copied
     from a measurement agrees with it for free. */
  t("legistar-73550 p1 reads 39 characters", p1 ? p1.text.length : -1, 39);
  t("...and ZERO glyphs — the whole of it is whitespace (M-140, re-measured)",
    p1 ? glyphCount(p1.text) : -1, 0);
  t("so the counter the layer filter now reads excludes it, while raw length would not",
    [glyphCount(p1.text) > 0, p1.text.length > 0], [false, true]);
}

/* ===================================================================== *
 * 7. D-514 — THE ROUTING COUNTS GLYPHS, DRIVEN THROUGH THE OP.
 *
 * `needsTier2` compared markers against `counts.chars`. A document whose marker
 * count falls between its GLYPHS and its CHARACTERS was not sent to the member
 * that could read it, because the whitespace in its own text stood in for
 * decoded text. This is the only band in which the two rules disagree, so this
 * is the only kind of document that can tell them apart.
 * ===================================================================== */
console.log("\n--- 7. D-514: the escalation predicate reads GLYPHS, and the band is asserted ---");
{
  await acquire("routemargin");
  const { extractPdfStructure } = await import("../src/pdfstructure.mjs");
  const { glyphCount } = await import("../src/textchain.mjs");
  const rm = (await extractPdfStructure(ROUTEMARGIN)).text;
  /* THE BAND, ASSERTED. If these three numbers drift the fixture stops being
     able to discriminate and the assertion under them passes over nothing. */
  t("the fixture sits IN the band: 8 markers, 8 raw characters, 7 glyphs",
    [rm.counts.undetermined, rm.counts.chars, glyphCount(rm.document)], [8, 8, 7]);
  t("...so the RAW rule would NOT have escalated it (8 > 8 is false)",
    rm.counts.undetermined > rm.counts.chars, false);
  t("...and the GLYPH rule DOES (8 > 7 is true)",
    rm.counts.undetermined > glyphCount(rm.document), true);
  /* THE WIRE. Not the predicate re-spelled — the plane's own routing, read off
     what the member was actually asked. */
  t("and the plane CONSULTED the tier-2 member for it: the routing decision, through the op",
    PDF_ASKED.some((b) => b && b.capture_sha === SHA.routemargin), true);
}

await mf.dispose();
console.log(`\ntier3-layer-parts: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
