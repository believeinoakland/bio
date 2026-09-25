/* NEGATIVE CONTROL: the arms plus a baseline live in `test/nc-d374.mjs` and are re-run in one step with `node test/nc-d374.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by content with a byte count printed and a minimum guarded (never `git checkout --`). Declared before arming, and every one RUN. (a) `baseline` — nothing armed; MUST be green. (b) `nobound` — THE ACCEPTS-WHEN ARM: in checks/bio-checks.mjs drop the bound (`rectOffPage` answers null); the oversize rect `[0,0,999999,999999]` then MINTS and "the oversize rect is REFUSED BY NAME" MUST FAIL, with the other off-page arms; the in-page, undetermined and page-set arms MUST NOT move. (c) `drop` — the WRITER: in src/index.mjs persist `page_boxes: null`; the persisted-boxes arm and every refusal MUST FAIL, and the undetermined statement MUST then name the missing boxes. (d) `origin` — bound by `[0, 0, w, h]` instead of the MediaBox's own corners; the offset-origin arm ("a rect at negative coordinates inside an offset MediaBox MINTS") MUST FAIL. (e) `inherit` — read /MediaBox from the page alone, not up the page tree; the offset document's pages then hold NO box and its refusal and its persisted box MUST FAIL. (f) `overstrict` — THE OVER-STRICTNESS DIRECTION: refuse a rect whenever the page's box is not held; the two "admitted and STATED" arms MUST FAIL, because a fence refusing a citation for a bound nobody measured pushes a member toward citing the whole document. */
/* RESULTS, run 2026-09-25 by the D-374 worker, `node test/nc-d374.mjs`, each arm alone, every restore byte-identical by sha256 and content: baseline 23/0 green; nobound 17/6 (5/5 declared, plus the rotation sentence); drop 11/12 (4/4 declared; the in-page mint then also states an undetermined box, correctly, since no box reached the reading); origin 20/3 (2/2); inherit 20/3 (2/2); overstrict 19/4 (2/2). Every arm AS DECLARED. */
/* D-374 — A `pdf-page` EXTENT'S RECT, BOUNDED BY ITS PAGE'S MEDIABOX.
 *
 * Until D-374 `checkContentExtent` asked of a rect only that it be four finite
 * numbers, while the structure reader could already see every page's MediaBox
 * and the plane never received it. So `[0, 0, 999999, 999999]` minted on a US
 * Letter page: a content row addressing a region the page does not have, and
 * reading exactly like one that works.
 *
 * WHAT THIS SUITE MEASURES, through the ops and never against the store: a REAL
 * acquire of REAL PDFs (`op=acquire`), whose reading must carry each page's
 * box; `op=promote` of a basis leg whose rect is off the page, REFUSED BY NAME
 * (C-45.1); a rect on the page, MINTED. And the directions that are easy to
 * lose: a MediaBox whose origin is not 0,0 and that is INHERITED from the page
 * tree (the bound is the box's own corners, not `[0,0,w,h]`); /Rotate carried
 * and not applied (user space is unrotated); a rect flush with the edge and one
 * spelled corners-reversed (both inside); and a page whose box the record does
 * not hold — admitted and STATED, never refused and never given a guessed box.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* ---- a tiny PDF assembler (the pdfstructure.test.mjs / reading-wire pattern) ---- */
function pdf(objs, trailer = "") {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else {
      chunks.push(Buffer.from(o.body + "\n", "latin1"));
    }
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from(trailer + "%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}

const CMAP = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;


/* ---- fixtures: every figure below is the FIXTURE'S OWN ground truth, written
   into the file by this function — not a figure the code under test produced. */
function textPdf(pages, { pagesAttrs = "", pageAttrs = () => "/MediaBox [0 0 612 792]" } = {}) {
  const mbuf = Buffer.from(CMAP, "latin1");
  const kid = (i) => 5 + 2 * i;
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${pages.map((_, i) => `${kid(i)} 0 R`).join(" ")}] /Count ${pages.length} ${pagesAttrs} >>` },
    { num: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 4 0 R >>" },
    { num: 4, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ];
  pages.forEach((lines, i) => {
    const content = "BT /F1 10 Tf 72 700 Td " + lines.map((l, j) =>
      (j ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
    const cbuf = Buffer.from(content, "latin1");
    objs.push({ num: kid(i), body: `<< /Type /Page /Parent 2 0 R ${pageAttrs(i)} `
      + `/Resources << /Font << /F1 3 0 R >> >> /Contents ${kid(i) + 1} 0 R >>` });
    objs.push({ num: kid(i) + 1, head: `<< /Length ${cbuf.length} >>`, stream: cbuf });
  });
  return pdf(objs);
}

/* TWO US LETTER PAGES, each carrying its own /MediaBox [0 0 612 792]. */
const LETTER = textPdf([["City of Oakland", "Fiscal Year 2026 Budget"],
                        ["Appendix A", "Schedule of transfers"]]);
/* ONE PAGE whose MediaBox is NOT ON THE PAGE: it and /Rotate 90 sit on the
   /Pages node and are INHERITED, and the box's origin is at -9,-9 — both legal,
   and both what a bound written as `[0, 0, w, h]` read off the leaf gets wrong. */
const OFFSET = textPdf([["Exhibit 3", "Rotated schedule"]],
  { pagesAttrs: "/MediaBox [-9 -9 621 801] /Rotate 90", pageAttrs: () => "" });
/* TWO PAGES: page 0 states its box; page 1 states NONE, on itself or any
   ancestor. The file does not say how big page 1 is, and nothing may say it for
   the file. */
const NOBOX = textPdf([["Page with a box"], ["Page without one"]],
  { pageAttrs: (i) => (i === 0 ? "/MediaBox [0 0 612 792]" : "") });
const NO_PAGES = pdf([{ num: 1, body: "<< /Type /Catalog >>" }]);
const HTML = `<!doctype html><html><head><title>Council Calendar</title></head>`
  + `<body><h1>Meetings</h1><p>A web page has no MediaBox.</p></body></html>`;

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d374", MEMBER_TOKEN: "mem-d374", PROBE_TOKEN: "prb-d374",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/letter.pdf") return bin(LETTER, "application/pdf");
    if (u.pathname === "/offset.pdf") return bin(OFFSET, "application/pdf");
    if (u.pathname === "/nobox.pdf") return bin(NOBOX, "application/pdf");
    if (u.pathname === "/nopages.pdf") return bin(NO_PAGES, "application/pdf");
    if (u.pathname === "/calendar.html") return bin(HTML, "text/html; charset=utf-8");
    return new Response("unscripted", { status: 500 });
  },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d374") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-d374") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-d374",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                           authority: "City of Oakland" }) })).json());

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";
const codes = (r) => (r.findings || []).map((f) => f.check).sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* The extent arrives as FLAT SCALARS on the leg — REC-84's C-2.8 grammar, the
   restricted frontmatter carrying no nested object inside an array element. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.rect ? [`    extent_rect: [${l.rect.join(", ")}]`] : [])])]
  : [];

const inquiryMd = (id, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260914T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    /* CORRECTED 2026-09-25 at the c22-batch30 union (D-563, C-86.3, which landed beside D-374), never exempted:
       the label `Bundle ${id}` contradicted the title every document here states (`Info …`, `What does … rest on?`)
       and is now refused ENVELOPE_TITLE_DISAGREES; the request names no title, so the record goes by the document's. */
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register: [] });
};
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type, opts);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* A SYNTHETIC reading, for the three capture shapes an acquire cannot produce on
   demand: the capture acquired BEFORE this landing, D-252's mixed document, and
   a stored count disagreeing with an observed floor. */
const syntheticReading = (captureSha, { chain, pageCount } = {}) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], facts: {},
             ...(chain === undefined ? {} : { text_source: chain }),
             ...(pageCount === undefined ? {} : { page_count: pageCount }) } });
const flatChain = [{ step: "layer" }];
const ukey = (r) => (r.content || []).map((c) => c.undetermined ? c.undetermined.level : null);
let inq = 0;
const leg = async (doc, page, rect, { must = false } = {}) => {
  const id = `INQ-2026-9374-${String(++inq).padStart(2, "0")}`;
  const md = inquiryMd(id, { refs: [doc], legs: [{ target: doc, kind: "pdf-page", page, rect }] });
  return must ? mustPromote(id, md, "inquiry") : promote(id, md, "inquiry");
};

/* ===================== 1. ACQUIRE CARRIES EACH PAGE'S BOX ================ */

console.log("\n--- 1. op=acquire: the reading carries each page's MediaBox ---");

const letter = (await acquire("/letter.pdf")).document;
t("the FORMAT axis named it a pdf", letter.profile.format.format, "pdf");
t("the reading carries ONE distinct box, used by both pages — the box the fixture WROTE",
  letter.reading.page_boxes,
  { boxes: [{ media_box: [0, 0, 612, 792], w: 612, h: 792, rotate: 0 }], of_page: [0, 0] });

const offset = (await acquire("/offset.pdf")).document;
t("an INHERITED, offset MediaBox is read up the page tree, origin kept, /Rotate carried",
  offset.reading.page_boxes,
  { boxes: [{ media_box: [-9, -9, 621, 801], w: 630, h: 810, rotate: 90 }], of_page: [0] });

const nobox = (await acquire("/nobox.pdf")).document;
t("a page stating no box anywhere is NULL — never a default page size",
  nobox.reading.page_boxes,
  { boxes: [{ media_box: [0, 0, 612, 792], w: 612, h: 792, rotate: 0 }], of_page: [0, null] });

const html = (await acquire("/calendar.html")).document;
const nopages = (await acquire("/nopages.pdf")).document;
t("two different absences: an HTML page never tried (key ABSENT), a pageless PDF answered none (NULL)",
  ["page_boxes" in html.reading, "page_boxes" in nopages.reading, nopages.reading.page_boxes],
  [false, true, null]);

console.log("\n--- 2. op=promote then op=reading: the boxes are PERSISTED and readable ---");

const DOC_L = "INFO-2026-9374-letter", DOC_O = "INFO-2026-9374-offset", DOC_N = "INFO-2026-9374-nobox";
await mustPromote(DOC_L, infoMd(DOC_L), "information", { reading: letter });
await mustPromote(DOC_O, infoMd(DOC_O), "information", { reading: offset });
await mustPromote(DOC_N, infoMd(DOC_N), "information", { reading: nobox });
const rRead = await get("reading", `sha256=${encodeURIComponent(letter.capture.sha256)}`);
t("the persisted reading carries the boxes THROUGH THE OP",
  rRead.reading && rRead.reading.page_boxes && rRead.reading.page_boxes.boxes[0].media_box, [0, 0, 612, 792]);

/* ===================== 3. THE ACCEPTS-WHEN ============================== */

console.log("\n--- 3. [0,0,999999,999999] is refused BY NAME; a rect inside mints ---");

const rBig = await leg(DOC_L, 0, [0, 0, 999999, 999999]);
t("the oversize rect is REFUSED BY NAME", [rBig.ok, rBig.reason, codes(rBig)], [false, "BASIS_REFUSED", ["C-45.1"]]);
t("    and the refusal names the box it was checked against",
  /612 x 792 pt, its MediaBox \[0, 0, 612, 792\].*\[0, 0, 999999, 999999\]/.test(detail(rBig)), true);
const rIn = await leg(DOC_L, 1, [72, 72, 540, 720]);
t("a rect inside page 1 MINTS, and nothing is stated undetermined — it was bounded",
  [rIn.ok !== false, rIn.content?.[0]?.extent_kind, rIn.content?.[0]?.minted, ukey(rIn)],
  [true, "pdf-page", true, [null]]);
const rStraddle = await leg(DOC_L, 0, [500, 700, 700, 800]);
t("a rect that OVERLAPS the edge is refused too — part of it addresses nothing",
  [rStraddle.ok, codes(rStraddle)], [false, ["C-45.1"]]);

console.log("\n--- 4. over-strictness: correct work in spellings the bound must admit ---");

const rFlush = await leg(DOC_L, 0, [0, 0, 612, 792]);
t("a rect flush with every edge of the page MINTS (the page itself)",
  [rFlush.ok !== false, rFlush.content?.[0]?.minted], [true, true]);
const rRev = await leg(DOC_L, 1, [540, 720, 72, 72]);
t("the same region spelled corners-reversed MINTS, and is the SAME row",
  [rRev.ok !== false, rRev.content?.[0]?.minted, rRev.content?.[0]?.content_id],
  [true, false, rIn.content?.[0]?.content_id]);
const rNeg = await leg(DOC_O, 0, [-5, -5, 100, 100]);
t("a rect at negative coordinates inside an offset MediaBox MINTS",
  [rNeg.ok !== false, rNeg.content?.[0]?.minted], [true, true]);
const rTall = await leg(DOC_O, 0, [0, 0, 600, 800]);
t("a rect using the page's UNROTATED height (800 of 810) MINTS — /Rotate does not turn user space",
  [rTall.ok !== false, rTall.content?.[0]?.minted], [true, true]);
const rOffOff = await leg(DOC_O, 0, [0, 0, 625, 100]);
t("past the offset box's right edge (621) is refused by name",
  [rOffOff.ok, codes(rOffOff)], [false, ["C-45.1"]]);
t("    and the refusal tells the member the page is shown rotated",
  /rotated 90 degrees/.test(detail(rOffOff)), true);
const rNoRect = await leg(DOC_L, 0, undefined);
t("a page citation with NO rect is not bounded by a box and mints as before",
  [rNoRect.ok !== false, rNoRect.content?.[0]?.minted, ukey(rNoRect)], [true, true, [null]]);

/* ===================== 5. UNDETERMINED, STATED, NEVER GUESSED =========== */

console.log("\n--- 5. a box the record does not hold: admitted and STATED ---");

const rNobox = await leg(DOC_N, 1, [0, 0, 999999, 999999]);
t("a rect on the page whose box the FILE does not state is admitted and STATED",
  [rNobox.ok !== false, ukey(rNobox)], [true, ["page_box"]]);
t("    naming WHICH absence — this page's MediaBox, not the reading's",
  /no readable MediaBox for page 1/.test(rNobox.content?.[0]?.undetermined?.why || ""), true);
const rNobox0 = await leg(DOC_N, 0, [0, 0, 999999, 999999]);
t("while the page of the SAME document that states a box is bounded by it",
  [rNobox0.ok, codes(rNobox0)], [false, ["C-45.1"]]);

const SHA_LEGACY = sha("a capture acquired before D-374");
const DOC_LEGACY = "INFO-2026-9374-legacy";
await mustPromote(DOC_LEGACY, infoMd(DOC_LEGACY), "information",
  { reading: syntheticReading(SHA_LEGACY, { chain: flatChain, pageCount: 3 }) });
const rLegacy = await leg(DOC_LEGACY, 2, [0, 0, 999999, 999999]);
t("a capture acquired before D-374 (no boxes on its reading) admits the rect and STATES it",
  [rLegacy.ok !== false, ukey(rLegacy)], [true, ["page_box"]]);
t("    naming WHICH absence — no boxes held for the capture at all",
  /holds no page boxes for this capture/.test(rLegacy.content?.[0]?.undetermined?.why || ""), true);

/* ===================== 6. THE CATALOGUE'S DOCUMENT-ONLY PASS =========== */

console.log("\n--- 6. the checker skips the record arms for a caller that cannot see the record ---");

const { checkContentExtent, CONTENT_EXTENT_DOCUMENT_ONLY } = await import("../checks/bio-checks.mjs");
t("CONTENT_EXTENT_DOCUMENT_ONLY never judges a rect against a box it does not hold",
  checkContentExtent({ kind: "pdf-page", page: 0, rect: [0, 0, 999999, 999999] },
    { ...CONTENT_EXTENT_DOCUMENT_ONLY, pageBoxes: letter.reading.page_boxes }), null);

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
