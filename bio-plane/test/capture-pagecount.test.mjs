/* NEGATIVE CONTROL: the five arms plus a baseline live in `test/nc-cap9.mjs` and are re-run in one step with `node test/nc-cap9.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by content with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results are in this item's report and in CLAIMS.md's release line. (a) `baseline` — nothing armed; MUST be green, the row that distinguishes five-arms-broken from five-arms-working. (b) `drop` — in src/index.mjs, drop the page count from the persisted reading (`reading.page_count = null`); MUST fail the acquire arm, the persisted arm AND the C-45.1 refusal on a freshly acquired PDF — THE ARM THAT PROVES THE GAP WAS REAL, because before this item that is exactly what the record held. (c) `prefer` — in src/store.mjs, neuter the stored-count branch in `#pageSetForCapture` so the derived union answers instead; MUST fail the refusal on the acquired PDF and the precedence arm, and MUST NOT move the acquire/persist arms — the count is still on the reading and only the READER ignores it, which separates the writer's failure from the reader's. (d) `overstrict` — in src/store.mjs, answer `1` instead of `null` when the record holds no page set; MUST fail the unknown-page-set arm (a page citation on a document whose page set was never recorded still MINTS — D-345's deliberate non-refusal) and MUST NOT move any refusal — a fence tighter than its rule is not a safer fence. (e) `derived` — neuter the scoped-chain union so the pre-CAP-9 mechanism dies; MUST fail the D-252 mixed-document arm alone, proving this suite still exercises the derivation this landing must not remove. */
/* CAP-9 / D-345 — THE PAGE COUNT I2 ALREADY CARRIES, PERSISTED AT ACQUIRE.
 *
 * IC-83's Rules mint a content row against "the page count I2 already carries at
 * acquire — stored on mint". Nothing persisted one. `pdfstructure.mjs` returns
 * `pages: doc.pageCount` on every structure read and `op=acquire` threw it away,
 * so `Store#pageSetForCapture` could answer only from the pages a D-252 SCOPED
 * chain or an attestation happened to name. That is a MIXED document — a
 * text-layer report with scanned exhibits — and nothing else: every wholly
 * text-layer and every wholly scanned PDF, which is to say the common case, had
 * NO page set at all, so the out-of-range refusal C-45.1 could not fire on it
 * and a member could record a citation to page 9,000 of a three-page document.
 * D-345 is that row and this suite is its close.
 *
 * WHAT THIS SUITE MEASURES, and it is the mechanism rather than its existence: a
 * REAL acquire of a REAL PDF through `op=acquire`, promoted through
 * `op=promote`, then a `pdf-page` leg beyond the document's last page driven
 * through `op=promote` again and refused BY NAME. Every figure comes out of an
 * op; nothing here reaches into the store.
 *
 * WHAT IT ALSO PINS, because the safe direction is the one that is easy to lose:
 * NULL IS NOT A REFUSAL AND NOT A ZERO. A document with no pages acquires, and a
 * page citation on a capture whose page set the record never recorded still
 * MINTS with `page_count` NULL, stated — refusing it would be a fence tighter
 * than its rule and would push a member toward citing the whole document, which
 * claims MORE, not less.
 */
import { statedJSON } from "./stated.mjs";
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

/* An N-PAGE PDF whose every page carries decodable text. THE PAGE COUNT IS THE
   FIXTURE'S OWN GROUND TRUTH — it is the number of /Type /Page objects this
   function writes, so the assertion below is not an equality the code under test
   produced for itself. */
function textPdf(pages) {
  const mbuf = Buffer.from(CMAP, "latin1");
  const kid = (i) => 5 + 2 * i;
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${pages.map((_, i) => `${kid(i)} 0 R`).join(" ")}] /Count ${pages.length} >>` },
    { num: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 4 0 R >>" },
    { num: 4, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ];
  pages.forEach((lines, i) => {
    const content = "BT /F1 10 Tf " + lines.map((l, j) =>
      (j ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
    const cbuf = Buffer.from(content, "latin1");
    objs.push({ num: kid(i), body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] `
      + `/Resources << /Font << /F1 3 0 R >> >> /Contents ${kid(i) + 1} 0 R >>` });
    objs.push({ num: kid(i) + 1, head: `<< /Length ${cbuf.length} >>`, stream: cbuf });
  });
  return pdf(objs);
}

/* THREE PAGES, written as three page objects. */
const THREE_PAGES = textPdf([
  ["City of Oakland", "Fiscal Year 2026 Budget", "Page one of three"],
  ["Department allocations", "General Purpose Fund", "Page two of three"],
  ["Appendix A", "Schedule of transfers", "Page three of three"],
]);

/* A PDF WITH A CATALOG AND NO PAGES AT ALL. The FORMAT axis still names it `pdf`
   and the wire still runs, so the producer IS asked and answers no count —
   which is a different fact from never having asked, and this suite asserts
   that the record distinguishes them. */
const NO_PAGES = pdf([{ num: 1, body: "<< /Type /Catalog >>" }]);

const HTML = `<!doctype html><html><head><title>Council Calendar</title></head>`
  + `<body><h1>Meetings</h1><p>There is no such thing as page two of a web page.</p></body></html>`;

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cap9", MEMBER_TOKEN: "mem-cap9", PROBE_TOKEN: "prb-cap9",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/three.pdf") return bin(THREE_PAGES, "application/pdf");
    if (u.pathname === "/nopages.pdf") return bin(NO_PAGES, "application/pdf");
    if (u.pathname === "/calendar.html") return bin(HTML, "text/html; charset=utf-8");
    return new Response("unscripted", { status: 500 });
  },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-cap9") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-cap9") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-cap9",
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
/* A D-252 SCOPED chain — the ONLY shape whose page set the record could see
   before this item. */
const scopedChain = (pages) => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
    extent: { kind: "pages", pages } },
];
/* An UNSCOPED chain — every wholly text-layer and every wholly scanned
   document, which is to say the common case. */
const flatChain = [{ step: "layer" }];

/* ===================== 1. ACQUIRE CARRIES I2's COUNT ==================== */

console.log("\n--- 1. op=acquire: a three-page PDF's reading carries its page count ---");

const three = (await acquire("/three.pdf")).document;
t("the capture was NOT read as text at intake (a PDF, stated by FW-3)",
  three.profile.profiled_from_text, false);
t("the FORMAT axis named it (COFF-1)", three.profile.format.format, "pdf");
t("and the reading carries the page count the fixture was BUILT with",
  three.reading.page_count, 3);
/* THE GAP, MEASURED RATHER THAN ASSERTED. This document's chain names no extent
   and the record holds no attestation for it — so the pre-CAP-9 derivation (the
   union of the pages a SCOPED step or an attestation names) had nothing at all
   to answer from, and the stored count is the only thing that can. */
t("its chain is UNSCOPED — the pre-CAP-9 derivation had nothing to see",
  [three.reading.text_source.map((s) => s.step),
   three.reading.text_source.every((s) => s.extent === undefined)],
  [["layer"], true]);

console.log("\n--- 2. op=promote then op=reading: the count is PERSISTED and readable ---");

const DOC_PDF = "INFO-2026-9100-pdf";
await mustPromote(DOC_PDF, infoMd(DOC_PDF), "information", { reading: three });
const rRead = await get("reading", `sha256=${encodeURIComponent(three.capture.sha256)}`);
t("the persisted reading is found", [rRead.found, rRead.capture_sha], [true, three.capture.sha256]);
t("and it carries the page count THROUGH THE OP", rRead.reading.page_count, 3);

/* ===================== 3. THE REFUSAL NOW REACHES AN ORDINARY PDF ======= */

console.log("\n--- 3. C-45.1 fires on a freshly acquired PDF (the accepts-when) ---");

const INQ_IN = "INQ-2026-9100-inrange";
const rIn = await mustPromote(INQ_IN, inquiryMd(INQ_IN, { refs: [DOC_PDF],
  legs: [{ target: DOC_PDF, kind: "pdf-page", page: 2, rect: [10, 20, 100, 200] }] }), "inquiry");
t("a leg naming the LAST page (0-based 2 of 3) mints",
  [rIn.content?.length, rIn.content?.[0].extent_kind, rIn.content?.[0].minted],
  [1, "pdf-page", true]);
const ROW_IN = rIn.content[0].content_id;
t("and the row records the page count it was minted against",
  (await get("content", `id=${ROW_IN}`)).page_count, 3);

const INQ_OOB = "INQ-2026-9100-oob";
const rOob = await promote(INQ_OOB, inquiryMd(INQ_OOB, { refs: [DOC_PDF],
  legs: [{ target: DOC_PDF, kind: "pdf-page", page: 9 }] }), "inquiry");
t("a leg naming page 10 of a three-page document is REFUSED BY NAME",
  [rOob.ok, rOob.reason, codes(rOob)], [false, "BASIS_REFUSED", ["C-45.1"]]);
t("    and the refusal names the page set it was checked against",
  /3 page\(s\) \(0-2\).*page 9/.test(detail(rOob)), true);

/* ===================== 4. NULL IS NOT A REFUSAL AND NOT A ZERO ========== */

console.log("\n--- 4. a document with no pages: UNDETERMINED, STATED, and two different absences ---");

const html = (await acquire("/calendar.html")).document;
t("an HTML capture still acquires", typeof html.capture.sha256, "string");
t("nothing ever tried to count its pages, so the key is ABSENT — never a zero",
  ["page_count" in html.reading, html.reading.page_count], [false, undefined]);

const nopages = (await acquire("/nopages.pdf")).document;
t("a PDF the wire READ and whose producer reported no count carries the key, NULL",
  ["page_count" in nopages.reading, nopages.reading.page_count], [true, null]);
/* The two are different facts and this record states which — the same rule
   `#writeTextSource` obeys one field over (no row vs `transcribed: 0`). */
t("the two absences are distinguishable, which is the point of carrying the key",
  "page_count" in html.reading === ("page_count" in nopages.reading), false);

const DOC_HTML = "INFO-2026-9100-html";
await mustPromote(DOC_HTML, infoMd(DOC_HTML), "information", { reading: html });
const INQ_HTML = "INQ-2026-9100-html";
const rHtml = await mustPromote(INQ_HTML, inquiryMd(INQ_HTML, { refs: [DOC_HTML],
  legs: [{ target: DOC_HTML }] }), "inquiry");
t("a whole-document leg on the HTML capture mints — an acquire is not a refusal",
  [rHtml.content?.length, rHtml.content?.[0].extent_kind], [1, "document"]);
t("and its page count is stated NULL, never defaulted to a number",
  (await get("content", `id=${rHtml.content[0].content_id}`)).page_count, null);

/* ===================== 5. OVER-STRICTNESS: THE UNKNOWN PAGE SET ========= */

console.log("\n--- 5. over-strictness: a capture whose page set was NEVER recorded still mints ---");

/* Every capture acquired BEFORE this landing is this shape: a flat chain and no
   stored count. No backfill was taken (D-356), so it is the live condition of
   the corpus and not a hypothetical. Refusing a page citation on it would be a
   fence tighter than its rule and would push a member toward citing the whole
   document, which claims MORE. */
const SHA_LEGACY = sha("a capture acquired before CAP-9");
const DOC_LEGACY = "INFO-2026-9100-legacy";
await mustPromote(DOC_LEGACY, infoMd(DOC_LEGACY), "information",
  { reading: syntheticReading(SHA_LEGACY, { chain: flatChain }) });
const INQ_LEGACY = "INQ-2026-9100-legacy";
/* `promote`, not `mustPromote`, DELIBERATELY: this is the arm an over-strict
   fence breaks, and a throw here would end the module while the tally read
   clean — the -1 failure WORKER.md names. The refusal must be MEASURED, not
   thrown. */
const rLegacy = await promote(INQ_LEGACY, inquiryMd(INQ_LEGACY, { refs: [DOC_LEGACY],
  legs: [{ target: DOC_LEGACY, kind: "pdf-page", page: 7 }] }), "inquiry");
t("a page-8 citation on a capture with no recorded page set MINTS, not refused",
  [rLegacy.ok !== false, rLegacy.content?.[0]?.extent_kind, rLegacy.content?.[0]?.minted],
  [true, "pdf-page", true]);
t("and the row says the page set was undetermined when it was minted",
  (await get("content", `id=${rLegacy.content?.[0]?.content_id}`)).page_count, null);

/* ===================== 6. THE PRE-CAP-9 DERIVATION SURVIVES ============= */

console.log("\n--- 6. D-252's mixed document: the derived union still answers where no count is stored ---");

const SHA_MIXED = sha("a mixed document with a scoped chain");
const DOC_MIXED = "INFO-2026-9100-mixed";
await mustPromote(DOC_MIXED, infoMd(DOC_MIXED), "information",
  { reading: syntheticReading(SHA_MIXED, { chain: scopedChain([0, 1, 2]) }) });
const INQ_MIXED = "INQ-2026-9100-mixed";
const rMixed = await promote(INQ_MIXED, inquiryMd(INQ_MIXED, { refs: [DOC_MIXED],
  legs: [{ target: DOC_MIXED, kind: "pdf-page", page: 9 }] }), "inquiry");
t("the scoped chain's own page set still refuses an out-of-range extent",
  [rMixed.ok, codes(rMixed)], [false, ["C-45.1"]]);
t("    naming the union it was derived from", /3 page\(s\) \(0-2\)/.test(detail(rMixed)), true);

/* ===================== 7. A COUNT BEATS A FLOOR ========================= */

console.log("\n--- 7. the stored COUNT wins over the observed FLOOR, and the disagreement stays visible ---");

/* The stored figure is the document's own page tree; the union is only what the
   record has ever seen NAMED. Preferring the larger would let one derivation
   step naming a page the file does not contain widen the document to fit a claim
   ABOUT it — the record believing the claim over the document. */
const SHA_DISAGREE = sha("a capture whose chain names more pages than the file has");
const DOC_DISAGREE = "INFO-2026-9100-disagree";
await mustPromote(DOC_DISAGREE, infoMd(DOC_DISAGREE), "information",
  { reading: syntheticReading(SHA_DISAGREE, { chain: scopedChain([0, 1, 2, 3, 4, 5]), pageCount: 3 }) });
const INQ_DIS = "INQ-2026-9100-disagree";
const rDis = await promote(INQ_DIS, inquiryMd(INQ_DIS, { refs: [DOC_DISAGREE],
  legs: [{ target: DOC_DISAGREE, kind: "pdf-page", page: 4 }] }), "inquiry");
t("page 5 is refused against the STORED count of 3, not the chain's floor of 6",
  [rDis.ok, codes(rDis)], [false, ["C-45.1"]]);
t("    and the refusal names 3 pages, which is what the document HAS",
  /3 page\(s\) \(0-2\).*page 4/.test(detail(rDis)), true);

/* D-186: the sandbox is this process's own and `sandbox.mjs` removes it on exit,
   but the Miniflare instance must still be taken down — `hygiene.test.mjs`
   asserts that every suite disposes every instance it built, and it CAUGHT THIS
   SUITE not doing so on its first full battery run (714 pass, 1 FAIL, naming
   this file). Recorded here rather than silently fixed: a new suite is a new
   leak until the scan says otherwise. */
await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
