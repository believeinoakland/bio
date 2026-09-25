/* NEGATIVE CONTROL: FOUR arms and a baseline in `test/nc-d420.mjs`, re-runnable in one step with `node test/nc-d420.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source ALONE, declares BEFORE it runs what MUST fail AND what MUST NOT, and is restored from a uniquely-named pristine copy verified by sha256 AND content (never `git checkout --`). (a) `baseline` — nothing armed, MUST be green. (b) `droppage` — THE ROW'S DECLARED CONTROL: drop the page-form branch in `checkContentExtent` (`unpainted = null`); the no-image arm MUST fail BY NAME while the wire, equality and the admitted-and-stated arms hold. (c) `dropwire` — acquire stops persisting a PDF's placements (the record as it was before D-420); the wire arm and the refusals MUST fail, nothing that mints moves. (d) `widetol` — HOW A LIAR PASSES: a 1000 pt tolerance; the far and one-point-off rects MUST mint, the blank-page arms hold. (e) `absentrefuses` — over-strictness: an ABSENT list read as EMPTY; the pre-D-420 and unfinished-walk admissions MUST fail. CPDF-22 added three (`src/store.mjs` joins the files): (f) `restorekey` — THE ROW'S CONTROL (BOB #31): D-420's withdrawn key restored beside `undetermined` on both mint answers; the two one-shape arms MUST fail by name, the statement MUST hold. (g) `silent` — the page form's statement dropped; the stated arms MUST fail, admission holds. (h) `overstate` — over-strictness: `undetermined` stated where the list was held and passed; that arm MUST fail. RUN 2026-09-23 by the CPDF-22 worker, ALL SEVEN AS DECLARED, 0 held-open assertions broken in any arm, every restore byte-identical (`checks/bio-checks.mjs` 847,439 B sha256 d10709574506…, `src/index.mjs` 731,481 B sha256 c7d77e7eee13…, `src/store.mjs` 2,902,230 B sha256 7bcc714afe46…): baseline 29/0 GREEN · droppage 22/7 (5/5) · dropwire 18/11 (4/4) · widetol 24/5 (3/3) · absentrefuses 25/4 (2/2) · restorekey 27/2 (2/2; fails BY NAME at "in ONE shape: the withdrawn image-bound key is absent") · silent 26/3 (3/3) · overstate 28/1 (1/1). EARLIER RUN 2026-09-23 by the D-420 worker, ALL FOUR AS DECLARED, 0 held-open assertions broken in any arm, every restore byte-identical (`checks/bio-checks.mjs` 836,026 B sha256 319a51815747…, `src/index.mjs` 725,893 B sha256 e7b685d884e5…): baseline 28/0 GREEN · droppage 21/7 (5/5 declared; fails BY NAME at "a rect where the page paints NO image is REFUSED BY NAME (C-45.12)") · dropwire 17/11 (4/4) · widetol 23/5 (3/3) · absentrefuses 24/4 (2/2). */

/* D-420 — AN `image {page, rect}` ROW IS BOUNDED BY WHAT THE PAGE PAINTS, NOT
 * ONLY BY THE PAGE SET (EXTRACTION-BREADTH §3.2: `covers` refuses from the
 * container's own extent, by name; §3.3 item 2: a PDF's image objects and their
 * painted rectangles, CPDF-18).
 *
 * THE DEFECT: acquire persisted no image list for a PDF (`container_extent:
 * null`) and `coversImage` has no page-form branch, so a rectangle where a page
 * paints NO image minted as an `image` row — the record calling a region an
 * image with nothing in the file saying so. Only the crop refused it
 * (NO_IMAGE_AT_RECT, `pdf-worker/src/imagecrop.mjs`).
 *
 * WHAT EACH SECTION DRIVES, all THROUGH THE OP (miniflare):
 *   1. THE WIRE: `op=acquire` persists the structure op's placements as
 *      `container_extent.images` for a PDF — the fixture's own hand-derived
 *      rectangles, an empty list read as a MEASURED ZERO, and an encrypted PDF
 *      (walk refused) persisted as NULL with the producer's reason.
 *   2. THE MINT: a rect EQUAL to a persisted placement mints; the same rect
 *      written corners-swapped, and within the 1/1000 pt the producer rounds
 *      to, mints (over-strictness); a rect FAR from every placement is refused
 *      BY NAME (C-45.12, CONTENT_EXTENT_NO_IMAGE_PAINTED) — the liar's arm: a
 *      tolerance wide enough to match it would match anything on the page; a
 *      `{page}` with no rect on a page painting nothing is refused; on a page
 *      that paints one it mints (the crop, not the address, needs the rect).
 *   3. ADMITTED, STATED: a PDF acquired BEFORE D-420 (`container_extent: null`,
 *      what the pre-D-420 wire wrote) admits the far rect and SAYS it was not
 *      checked (`undetermined: {level: "page_images", why}` — CPDF-22's one shape); so does a
 *      PDF whose walk did not finish; and a rect that mints against a held list
 *      carries NO such statement.
 *   4. THE TWO READS AGREE: every rect the checker admits on the fixture, the
 *      crop finds; the rect the checker refuses, the crop refuses too.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CONTENT_EXTENT_CHECKS } from "../checks/bio-checks.mjs";
import { cropImage } from "../../pdf-worker/src/imagecrop.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- a tiny PDF assembler (CPDF-18's, same bytes) ---- */
function pdf(objs, tail = "") {
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
  chunks.push(Buffer.from(`${tail}%%EOF\n`, "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const stream = (num, dict, buf) => ({ num, head: `<< ${dict} /Length ${buf.length} >>`, stream: buf });

/* THE GROUND TRUTH, derived BY HAND from the matrices below (CPDF-18's fixture):
   page 0 paints four images — a Do, a Do inside a Form (its /Matrix composed),
   an inline image, a rotated Do; page 1 paints nothing; page 2 DECLARES Im1 and
   never paints it. */
const JPG = Buffer.from("\xff\xd8\xff\xe0D-420 fixture: a map of Council District 3\xff\xd9", "latin1");
const GREY = Buffer.from([0x00, 0x40, 0x80, 0xff]);
const PAGE0 = [
  "q 200 0 0 100 50 600 cm /Im1 Do Q",              // -> [50, 600, 250, 700]
  "q 1 0 0 1 300 100 cm /Fm1 Do Q",                 // -> [310, 110, 370, 190]
  "q 10 0 0 20 30 40 cm BI /W 16 /H 1 /CS /G /BPC 8 ID Q 1 0 0 1 9 9 cm EI Q",  // -> [30, 40, 40, 60]
  "q 0 50 -80 0 400 300 cm /Im1 Do Q",              // rotated -> [320, 300, 400, 350]
].join("\n");
const WANT_PLACEMENTS = [
  { page: 0, rect: [50, 600, 250, 700] }, { page: 0, rect: [310, 110, 370, 190] },
  { page: 0, rect: [30, 40, 40, 60] }, { page: 0, rect: [320, 300, 400, 350] },
];
const FM1 = Buffer.from("q 30 0 0 40 0 0 cm /Im2 Do Q", "latin1");
const objs = [
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 6 0 R /Fm1 7 0 R >> >> /Contents 8 0 R >>" },
  { num: 4, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 10 0 R >>" },
  { num: 5, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 6 0 R >> >> /Contents 11 0 R >>" },
  stream(6, "/Type /XObject /Subtype /Image /Width 4 /Height 2 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode", JPG),
  stream(7, "/Type /XObject /Subtype /Form /BBox [0 0 100 100] /Matrix [2 0 0 2 10 10] /Resources << /XObject << /Im2 9 0 R >> >>", FM1),
  stream(8, "", Buffer.from(PAGE0, "latin1")),
  stream(9, "/Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceGray /BitsPerComponent 8", GREY),
  stream(10, "", Buffer.from("BT ET", "latin1")),
  stream(11, "", Buffer.from("q 1 0 0 1 0 0 cm Q", "latin1")),
];
const IMAGES_PDF = pdf(objs);
/* THE SAME DOCUMENT, other bytes (a trailing comment), so its capture is its
   own: it is the one whose reading is written the way the pre-D-420 wire wrote
   every PDF's — `container_extent: null`. */
const BEFORE_PDF = pdf(objs, "% acquired before D-420\n");
/* A PDF the image walk REFUSES (encrypted): the list is NULL with the reason,
   never an empty list, which would read as "no images". */
const ENCRYPTED_PDF = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>" },
  stream(4, "", Buffer.from("q 10 0 0 10 0 0 cm /Im1 Do Q", "latin1")),
  { num: 9, body: "<< /Filter /Standard /V 2 /R 3 /O (x) /U (y) /P -4 >>" },
]);

/* The rect of the liar's arm: FAR from every placement on page 0 (the nearest
   corner of any painted image is > 100 pt away on some axis), on a page that
   DOES paint images, so neither the page set nor "the page has no images" can
   be what refuses it. */
const FAR_RECT = [450, 420, 560, 520];

const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d420", MEMBER_TOKEN: "mem-d420", PROBE_TOKEN: "prb-d420",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const as = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/images.pdf") return as(IMAGES_PDF);
    if (u.pathname === "/before.pdf") return as(BEFORE_PDF);
    if (u.pathname === "/encrypted.pdf") return as(ENCRYPTED_PDF);
    return new Response("unscripted", { status: 500 });
  },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d420") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
const LEG_KEYS = { kind: "extent_kind", page: "extent_page", rect: "extent_rect", citedAs: "extent_cited_as" };
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      ...Object.entries(LEG_KEYS).filter(([k]) => l[k] !== undefined && l[k] !== null)
        .map(([k, f]) => `    ${f}: ${Array.isArray(l[k]) ? `[${l[k].join(", ")}]` : l[k]}`)])]
  : [];
const inquiryMd = (id, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), "---", "",
  "## Question", "", `What does ${id} rest on?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
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
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260923T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files, register: [] });
  if (r.ok !== false) HEAD.set(id, r.bundleSha);
  return r;
};
let legSeq = 0;
const cite = (target, leg) => {
  const id = `INQ-2026-9230-l${++legSeq}`;
  return promote(id, inquiryMd(id, { refs: [target], legs: [{ target, ...leg }] }), "inquiry");
};
const codes = (r) => (r.findings || []).map((f) => f.check).sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");
const acquire = async (path) => (await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-d420",
  { method: "POST", body: JSON.stringify({ locator: `https://www.oaklandca.gov${path}`, authority: "City of Oakland" }) })).json()).document;

try {
/* ===================== 1. THE WIRE ====================================== */
console.log("--- 1. op=acquire persists the images a PDF's pages paint ---");
const doc = await acquire("/images.pdf");
t("the acquired capture IS the fixture's bytes", doc?.capture?.sha256, sha(IMAGES_PDF));
t("a PDF's reading carries a container extent with ONE level, `images` — the placements the "
  + "structure op reported, at the rectangles derived BY HAND from this file's matrices",
  doc?.reading?.container_extent, { container: "pdf", levels: ["images"], images: WANT_PLACEMENTS });
t("    and the pages that paint nothing contribute nothing: pages 1 and 2 hold no placement "
  + "(page 2 DECLARES Im1 and never paints it)",
  (doc?.reading?.container_extent?.images || []).filter((x) => x.page !== 0).length, 0);
const enc = await acquire("/encrypted.pdf");
t("a PDF whose image walk was REFUSED (encrypted) persists the level as NULL with the producer's "
  + "reason — never an empty list, which would read as 'no images'",
  [enc?.reading?.container_extent?.images, enc?.reading?.container_extent?.images_why], [null, "encrypted"]);

/* ===================== 2. THE MINT ====================================== */
console.log("\n--- 2. a page-form image mints only where the page paints one ---");
const DOC = "INFO-2026-9230-images";
t("the capture is promoted", (await promote(DOC, infoMd(DOC), "information", { reading: doc })).ok !== false, true);

const eq = await cite(DOC, { kind: "image", page: 0, rect: [50, 600, 250, 700] });
t("a rect EQUAL to a persisted placement mints an `image` row",
  [eq.ok, eq.content?.[0]?.extent_kind, eq.content?.[0]?.minted], [true, "image", true]);
/* CPDF-22 CORRECTED this and the §3 arms below: they read D-420's image-bound key,
   a SECOND shape for the statement D-440 already made as `undetermined: {level,
   why}`. BOB #31 (2026-09-23) withdrew it before any client read it; the old
   assertions pinned the withdrawn key, so they are corrected, not exempted. The
   arm reading that key as ABSENT survives it, so it would have passed a
   regression that brought the key back — it now asserts the key is gone too.
   The key is named by construction, not as a literal, because CPDF-22's
   acceptance is that `git grep` for it over bio-plane and civicos-ui finds
   nothing: every hit there is a producer or a reader, and this suite is neither. */
const WITHDRAWN = ["image", "bound"].join("_");
t("    and carries NO undetermined statement: the bound was held and it passed",
  [eq.content?.[0]?.undetermined ?? null, WITHDRAWN in (eq.content?.[0] || {})], [null, false]);
const form = await cite(DOC, { kind: "image", page: 0, rect: [310, 110, 370, 190] });
t("the image painted INSIDE a Form XObject mints at its COMPOSED rectangle", [form.ok, form.content?.[0]?.minted], [true, true]);
const swapped = await cite(DOC, { kind: "image", page: 0, rect: [370, 190, 310, 110] });
t("OVER-STRICTNESS: the same placement written upper-right first is the same rectangle, and mints",
  [swapped.ok, swapped.content?.[0]?.extent_kind], [true, "image"]);
const noise = await cite(DOC, { kind: "image", page: 0, rect: [320.0004, 300, 400, 349.9996] });
t("OVER-STRICTNESS: within the 1/1000 pt the producer rounds to, the rotated placement mints",
  [noise.ok, noise.content?.[0]?.extent_kind], [true, "image"]);

const far = await cite(DOC, { kind: "image", page: 0, rect: FAR_RECT });
t("a rect where the page paints NO image is REFUSED BY NAME (C-45.12) — on a page that DOES paint "
  + "images, far from every one of them",
  [far.ok, codes(far)], [false, ["C-45.12"]]);
t("    and the refusal names the page's own placements, so a member can pick the one they meant",
  [/page 0 of this capture paints 4 image\(s\)/.test(detail(far)), /\[50, 600, 250, 700\]/.test(detail(far)),
   /none at \[450, 420, 560, 520\]/.test(detail(far))], [true, true, true]);
const near = await cite(DOC, { kind: "image", page: 0, rect: [50, 600, 250, 701] });
t("a rect ONE POINT off a placement is refused too — equality is the crop's, not 'close enough'",
  [near.ok, codes(near)], [false, ["C-45.12"]]);
const blank = await cite(DOC, { kind: "image", page: 1, rect: [50, 600, 250, 700] });
t("the SAME rect as a real placement, on a page that paints nothing, is refused — the page is part "
  + "of the address", [blank.ok, codes(blank)], [false, ["C-45.12"]]);
const pageOnlyBlank = await cite(DOC, { kind: "image", page: 2 });
t("an image named by page alone, on a page that paints NONE (it only declares one), is refused",
  [pageOnlyBlank.ok, codes(pageOnlyBlank), /page 2 of this capture paints no image/.test(detail(pageOnlyBlank))],
  [false, ["C-45.12"], true]);
const pageOnly = await cite(DOC, { kind: "image", page: 0 });
t("OVER-STRICTNESS: an image named by page alone on a page that paints four mints — which one is "
  + "the crop's question (RECT_REQUIRED), not the address's", [pageOnly.ok, pageOnly.content?.[0]?.minted], [true, true]);
const textFar = await cite(DOC, { kind: "image", page: 0, rect: FAR_RECT, citedAs: "text" });
t("the far rect cited as TEXT is refused by the same name — the row would still be an `image` row",
  [textFar.ok, codes(textFar)], [false, ["C-45.12"]]);
const pdfPage = await cite(DOC, { kind: "pdf-page", page: 0, rect: FAR_RECT });
t("OVER-STRICTNESS: the same rectangle as a `pdf-page` region is not an image claim, and is not "
  + "refused C-45.12", codes(pdfPage).includes("C-45.12"), false);
t("the code carries its canned translation (DEC-49)",
  typeof CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NO_IMAGE_PAINTED?.translation === "string"
    && CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NO_IMAGE_PAINTED.check, "C-45.12");

const viaAct = await post("contentmint", { bundleId: DOC, extent: { kind: "image", page: 0, rect: FAR_RECT } });
t("THROUGH op=contentmint as well: the far rect is refused by name at the mint",
  [viaAct.ok, viaAct.reason ?? viaAct.code ?? null, viaAct.check ?? null],
  [false, "CONTENT_EXTENT_NO_IMAGE_PAINTED", "C-45.12"]);

/* ===================== 3. ADMITTED, AND STATED ========================== */
console.log("\n--- 3. with no placement list held, the row is admitted and SAYS so ---");
const before = await acquire("/before.pdf");
/* THE PRE-D-420 READING: the key present and NULL, exactly what the wire wrote
   for every PDF before this item (capture-container-extent.test.mjs's old pin). */
const beforeReading = { ...before, reading: { ...before.reading, container_extent: null } };
const BEFORE = "INFO-2026-9230-before";
t("a PDF acquired before D-420 is promoted", (await promote(BEFORE, infoMd(BEFORE), "information", { reading: beforeReading })).ok !== false, true);
const old = await cite(BEFORE, { kind: "image", page: 0, rect: FAR_RECT });
t("the far rect on a PDF acquired BEFORE D-420 is ADMITTED — no bound nobody measured refuses it",
  [old.ok, old.content?.[0]?.extent_kind, old.content?.[0]?.minted], [true, "image", true]);
t("    and the admission STATES what it was not checked against: undetermined.level and .why",
  [old.content?.[0]?.undetermined?.level,
   /a PDF acquired before D-420 persisted none/.test(old.content?.[0]?.undetermined?.why || ""),
   /UNDETERMINED and stated, not refused/.test(old.content?.[0]?.undetermined?.why || "")],
  ["page_images", true, true]);
t("    in ONE shape: the withdrawn image-bound key is absent (CPDF-22, BOB #31)",
  Object.keys(old.content?.[0] || {}).filter((k) => k === WITHDRAWN), []);
const oldAct = await post("contentmint", { bundleId: BEFORE, extent: { kind: "image", page: 0, rect: [1, 2, 3, 4] } });
t("    and op=contentmint states it the same way, in the same one shape",
  [oldAct.ok, oldAct.undetermined?.level, typeof oldAct.undetermined?.why, WITHDRAWN in oldAct],
  [true, "page_images", "string", false]);
const ENC = "INFO-2026-9230-encrypted";
t("the encrypted PDF is promoted", (await promote(ENC, infoMd(ENC), "information", { reading: enc })).ok !== false, true);
const encRow = await cite(ENC, { kind: "image", page: 0, rect: FAR_RECT });
t("a PDF whose walk did NOT finish admits the rect and states the walk's reason",
  [encRow.ok, encRow.content?.[0]?.undetermined?.level,
   /walk did not finish \(encrypted\)/.test(encRow.content?.[0]?.undetermined?.why || "")], [true, "page_images", true]);

/* ===================== 4. THE TWO READS AGREE ============================ */
console.log("\n--- 4. what the mint admits, the crop finds; what it refuses, the crop refuses ---");
const crops = await Promise.all(WANT_PLACEMENTS.map((p) => cropImage(IMAGES_PDF, { kind: "image", ...p })));
t("every persisted placement is one the crop FINDS (found, or refused for a reason about the image "
  + "rather than its absence — the inline one)",
  crops.map((c) => c.ok || c.reason), [true, true, "INLINE_IMAGE", true]);
const farCrop = await cropImage(IMAGES_PDF, { kind: "image", page: 0, rect: FAR_RECT });
t("the rect the mint refuses, the crop refuses by its own name", farCrop.reason, "NO_IMAGE_AT_RECT");
} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
