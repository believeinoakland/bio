/* NEGATIVE CONTROL: three arms and a baseline in `test/nc-d633.mjs`, run with `node test/nc-d633.mjs [arm]` from `bio-plane/`. Each arm edits `src/textchain.mjs` ALONE and declares, before it runs, what MUST fail and what MUST NOT; each restore is verified by sha256 AND content against a per-arm pristine copy in `controlPen("d633")`. (a) `baseline`: nothing armed, MUST be green. (b) `nocarry`: THE ROW'S DECLARED CONTROL. `mergeTier2Text` stops carrying the base page's `image_content_*` markers, so the TIER-2-WINS arms read no marker and THE ROUTE asks the OCR member for nothing, by name, while TIER 1 KEEPS, NO DUPLICATE and TIER 2'S OWN hold. (c) `carryall`: the carry takes EVERY base marker instead of the image-content ones, so TIER 2'S OWN, AWARD UNMOVED and the whole-list NO DUPLICATE fail (tier 1's `no_tounicode` rides onto a page tier 2 decoded) while the carried marker still routes. (d) `noregrade`: BOB #35's control (2026-09-25 08:05Z), the carry keeps tier 1's grade, so REGRADE 5, 21, 22, 30, the shown-glyph count and REGRADE 30 THROUGH THE OP fail by name while REGRADE 4 and the route hold. RESULTS: D-633's commit message. */
/* D-633 — WHEN TIER 2 WINS A PAGE, THE PAGE KEEPS WHAT TIER 1 SAID ABOUT ITS IMAGES.
 *
 * D-627 (BOB #35, 2026-09-25 05:50Z) gave a page an image fills while its text is a folio the marker
 * `image_content_unread`, and `needsTier3` routes it to OCR. `mergeTier2Text` built a page tier 2 wins from tier
 * 2's text AND tier 2's markers, so the marker went with tier 1's and the page routed nowhere. The markers are facts
 * about the page's IMAGES (CPDF-18's walk, the page box), not about the decode, and tier 2 reads no image: the fix
 * (Content Framework §16, D-627's item (2)) carries the base page's `image_content_*` markers onto the page tier 2
 * wins; tier 2's own markers are otherwise unchanged.
 *
 * WHAT IS REAL AND WHAT IS BUILT. Section 1 drives `mergeTier2Text` directly on built pages. Section 2 drives the
 * real `op=acquire` over D-627's committed extract of INFO-2026-0301 (fixtures/d627/PROVENANCE.md), with a tier-2
 * stub that ANSWERS by decoding each page's folio — the answer D-627's stub declined to give — and an OCR stub.
 * The folio strings are the stub's, not read off the capture: the fixture's folios are in a font with no
 * /ToUnicode, which is why tier 1 counts them undetermined and why tier 2 can win the page at all.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { mergeTier2Text } from "../src/textchain.mjs";
import { extractPdfStructure } from "../src/pdfstructure.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const FIXTURE = fileURLToPath(new URL("./fixtures/d627/fy2325-budget-p633-651.pdf", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha256 = (v) => createHash("sha256").update(v).digest("hex");
const reasons = (page) => (page && Array.isArray(page.undetermined) ? page.undetermined : []).map((m) => m && m.reason);

/* ===================================================================== *
 * 1. THE MERGE, driven directly.
 * ===================================================================== */
console.log("--- 1. mergeTier2Text on built pages ---");
const UNREAD = { page: 0, reason: "image_content_unread", font: null, codes: "", count: 0, image_share: 0.5672, glyphs: 3 };
const UNDET = { page: 1, reason: "image_content_undetermined", font: null, codes: "", count: 0, image_share: 0.15, glyphs: 1 };
const FOLIO0 = { page: 0, reason: "no_tounicode", font: "Arial", codes: "<010203>", count: 3 };
const FOLIO1 = { page: 1, reason: "no_tounicode", font: "Arial", codes: "<04>", count: 1 };
const base = {
  document: "", producer: { name: "Acrobat" },
  pages: [
    { page: 0, text: "", undetermined: [FOLIO0, UNREAD] },                 /* tier 2 wins: decodes the folio */
    { page: 1, text: "", undetermined: [FOLIO1, UNDET] },                  /* tier 2 wins, a gap page */
    { page: 2, text: "", undetermined: [{ ...FOLIO0, page: 2 }, { ...UNREAD, page: 2 }] }, /* tier 1 keeps */
    { page: 3, text: "Body text", undetermined: [{ page: 3, reason: "no_tounicode", font: "X", codes: "<05>", count: 1 }] },
  ],
  undetermined: [], counts: { chars: 9, undetermined: 7 },
};
base.undetermined = base.pages.flatMap((p) => p.undetermined);
const T2_OWN = { page: 3, reason: "no_tounicode", font: "Y", codes: "", count: 0 };
const t2 = {
  document: "633\n9", pages: [
    { page: 0, text: "633", undetermined: [] },
    { page: 1, text: "9", undetermined: [] },
    /* page 2: tier 2 offers the same nothing, so tier 1 keeps it */
    { page: 2, text: "", undetermined: [{ ...FOLIO0, page: 2 }] },
    { page: 3, text: "Body text, more of it", undetermined: [T2_OWN] },
  ],
  undetermined: [], counts: { chars: 0, undetermined: 0 },
};
const m = mergeTier2Text(base, t2);
const pg = (n) => m.text.pages.find((p) => p.page === n);
t("the merge is page-wise and tier 2 wins pages 0, 1 and 3 (the fixture is shaped as intended)",
  [m.ok, m.wholesale, m.replaced, m.kept], [true, false, [0, 1, 3], [2]]);
t("TIER-2-WINS: a page carrying image_content_unread that tier 2 wins keeps the marker, figures intact",
  pg(0).undetermined.filter((x) => x.reason === "image_content_unread"), [UNREAD]);
t("TIER-2-WINS: image_content_undetermined is carried the same way (a fact about the images too)",
  pg(1).undetermined.filter((x) => x.reason === "image_content_undetermined"), [UNDET]);
t("TIER-2-WINS: the page's text and tier are tier 2's", [pg(0).text, pg(0).tier], ["633", 2]);
t("TIER 2'S OWN: tier 1's decode markers do NOT ride along (tier 2 decoded the folio), only the image facts",
  [reasons(pg(0)), reasons(pg(1))], [["image_content_unread"], ["image_content_undetermined"]]);
t("TIER 2'S OWN: a page tier 2 wins with no image marker carries exactly tier 2's markers",
  pg(3).undetermined, [T2_OWN]);
t("TIER 1 KEEPS: a page tier 1 keeps carries its markers once, unchanged",
  pg(2).undetermined, base.pages[2].undetermined);
t("NO DUPLICATE: the document list carries each image marker once, and its count agrees",
  [m.text.undetermined.filter((x) => x.reason === "image_content_unread").length,
   m.text.undetermined.filter((x) => x.reason === "image_content_undetermined").length,
   m.text.counts.undetermined === m.text.undetermined.length], [2, 1, true]);
/* The award is unmoved: a marker counts 0 undetermined characters, so carrying it cannot change which tier wins
   a later comparison, and the merged figures are the ones tier 2's pages give. */
t("AWARD UNMOVED: the carried markers add 0 undetermined characters",
  m.text.undetermined.reduce((n, x) => n + x.count, 0), 3 + 0);
{
  /* OVER-STRICTNESS: tier 2 already stating an image-content marker of its own (no member does today) is not
     doubled. */
  const t2own = { ...t2, pages: t2.pages.map((p) => p.page === 0 ? { ...p, undetermined: [UNREAD] } : p) };
  const m2 = mergeTier2Text(base, t2own);
  t("NO DUPLICATE: a marker tier 2 already states is not carried a second time",
    m2.text.pages.find((p) => p.page === 0).undetermined, [UNREAD]);
}

/* ===================================================================== *
 * 1b. THE RE-GRADE (BOB #35, 2026-09-25 08:05Z). The share carries over; the
 *     glyph count is the WINNING tier's, graded by D-627's thresholds.
 * ===================================================================== */
console.log("\n--- 1b. the carried marker is re-graded against tier 2's text ---");
{
  const chars = (n) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(2).slice(0, n);
  const SIZES = [4, 5, 21, 22, 30];
  const rbase = { document: "", pages: SIZES.map((_, page) => ({ page, text: "",
    undetermined: [{ ...FOLIO0, page }, { ...UNREAD, page }] })) };
  rbase.pages.push({ page: 5, text: "", undetermined: [{ ...FOLIO0, page: 5 }, { ...UNREAD, page: 5 }] });
  rbase.undetermined = rbase.pages.flatMap((p) => p.undetermined);
  const rt2 = { pages: [...SIZES.map((n, page) => ({ page, text: chars(n), undetermined: [] })),
    /* page 5: 3 decoded glyphs and 2 codes tier 2 could not map (fewer than tier 1's 3, so tier 2 wins) — 5 glyphs
       the page SHOWS, D-627's measure */
    { page: 5, text: "123", undetermined: [{ page: 5, reason: "no_tounicode", font: "Z", codes: "<0a0b>", count: 2 }] }] };
  const rm = mergeTier2Text(rbase, rt2);
  const img = (n) => {
    const p = rm.text.pages.find((x) => x.page === n);
    const mk = p.undetermined.find((x) => x.reason && x.reason.startsWith("image_content_"));
    return mk ? [mk.reason, mk.image_share, mk.glyphs] : null;
  };
  t("the re-grade fixture: tier 2 wins all six pages", rm.replaced, [0, 1, 2, 3, 4, 5]);
  t("REGRADE 4: tier 2 decodes 4 glyphs, so the marker stays unread, share carried, glyphs tier 2's",
    img(0), ["image_content_unread", 0.5672, 4]);
  t("REGRADE 5: tier 2 decodes 5 glyphs, so the marker reads undetermined (the page is no longer routed)",
    img(1), ["image_content_undetermined", 0.5672, 5]);
  t("REGRADE 21: 21 glyphs reads undetermined", img(2), ["image_content_undetermined", 0.5672, 21]);
  t("REGRADE 22: 22 glyphs is a text page, so the marker is dropped", img(3), null);
  t("REGRADE 30: tier 2 decodes 30 glyphs on a routed page, so the marker is dropped, never left saying unread",
    img(4), null);
  t("REGRADE COUNTS WHAT THE PAGE SHOWS: 3 decoded glyphs plus 2 unmapped codes is 5, read undetermined",
    img(5), ["image_content_undetermined", 0.5672, 5]);
  t("REGRADE 30: the dropped marker leaves the document list too, and the count agrees",
    [rm.text.undetermined.filter((x) => x.page === 4 && x.reason.startsWith("image_content_")).length,
     rm.text.counts.undetermined === rm.text.undetermined.length], [0, true]);
}

/* ===================================================================== *
 * 2. THE ROUTE, through the op. Tier 2 ANSWERS and wins every page; the OCR
 *    member is still asked about all nine.
 * ===================================================================== */
console.log("\n--- 2. THE ROUTE: op=acquire with an answering tier 2 ---");
const REAL = new Uint8Array(readFileSync(FIXTURE));
t("the committed extract is the one D-627's PROVENANCE.md names, by sha256",
  sha256(REAL), "481099369d7ae92dcfdbd965be654cc236a9cb152bb9a560b851eebcc109ad34");
const tier1 = await extractPdfStructure(REAL);
const FOLIOS = ["633", "634", "645", "646", "647", "648", "649", "650", "651"];
/* What the tier-2 stub decodes per page: the folio on pages 0-7, and on page 8 a 30-glyph line, the re-grade's
   case through the op (BOB #35's control): tier 2 wins that page holding text, not a folio. */
const T2_TEXTS = [...FOLIOS.slice(0, 8), "Special Revenue Fund Summary 65123"];
t("the stub's page-8 line is 30 glyphs, the case BOB #35 named",
  [...T2_TEXTS[8]].filter((c) => !/\s/u.test(c)).length, 30);
t("the extract's nine pages each carry image_content_unread and 3 undecoded folio codes at tier 1 (D-627's reading)",
  tier1.text.pages.map((p) => [reasons(p).includes("image_content_unread"),
                               p.undetermined.filter((x) => x.reason === "no_tounicode").reduce((n, x) => n + x.count, 0)]),
  FOLIOS.map(() => [true, 3]));
const DOCS = { real: REAL };
const SHA = { real: sha256(REAL) };
let PDF_ASKED = [], OCR_ASKED = [];
const tier2Answer = (sha) => {
  if (sha !== SHA.real) return null;
  const pages = T2_TEXTS.map((text, page) => ({ page, text, undetermined: [] }));
  const document = T2_TEXTS.join("\n");
  return { ok: true, tier: 2, notes: [], links: [], structure: {},
           text: { document, pages, undetermined: [], counts: { chars: document.length, undetermined: 0 } } };
};
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
const MEM = "mem-d633";
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
  bindings: { ADMIN_TOKEN: "adm-d633", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d633",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const name = new URL(request.url).pathname.replace(/^\//, "").replace(/\.pdf$/, "");
    return Object.prototype.hasOwnProperty.call(DOCS, name)
      ? new Response(DOCS[name], { headers: { "content-type": "application/pdf" } })
      : new Response("unscripted", { status: 500 });
  },
});
try {
  const res = await (await mf.dispatchFetch(
    `http://x/api/?op=acquire&store=scratch&token=${MEM}`,
    { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov/real.pdf",
                                             authority: "Finance Department" }) })).json();
  t("THE ROUTE: tier 2 was asked and answered for the extract (the arm this row needs)",
    PDF_ASKED.filter((b) => b && b.capture_sha === SHA.real).length, 1);
  const sent = (OCR_ASKED.find((b) => b && b.capture_sha === SHA.real) || {}).pages ?? null;
  t("THE ROUTE: with tier 2 winning every page, the eight whose folio it decoded are still sent to the OCR member",
    sent && sent.filter((p) => p < 8), [0, 1, 2, 3, 4, 5, 6, 7]);
  t("REGRADE 30 THROUGH THE OP: page 8, where tier 2 decodes 30 glyphs, is not sent to OCR as an unread image",
    /* `sent` is null when the member is asked about no page, which also means page 8 was not sent. The first
       spelling (`sent && sent.includes(8)`) read that null as a failure; the nocarry arm showed it (W29). */
    (sent || []).includes(8), false);
  /* What the OCR member's answer then does is D-635's (the tier-3 merge refuses a page whose folio decoded), not
     this row's; it is printed so the report can say what the record holds, and asserted only as far as the
     acquire answering. */
  const r = res && res.document;
  console.log(`  (acquire answered ok=${res && res.ok}; reading tier ${r && r.reading ? r.reading.text_tier : "?"}; `
            + `chain ${JSON.stringify(r && r.reading && Array.isArray(r.reading.text_source)
                ? r.reading.text_source.map((s) => [s.step, s.tier ?? null, s.engine ?? null]) : null)})`);
  t("THE ROUTE: the acquire itself answered", !!(res && res.ok), true);
} finally {
  await mf.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
