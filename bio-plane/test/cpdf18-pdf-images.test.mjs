/* NEGATIVE CONTROL: FIVE arms and a baseline in `test/nc-cpdf18.mjs`, re-runnable in one step with `node test/nc-cpdf18.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source (`src/pdfstructure.mjs`) ALONE, declares BEFORE it runs what MUST fail AND what MUST NOT, and is restored from a uniquely-named pristine copy verified by sha256 AND content (never `git checkout --`). (a) `baseline` — nothing armed, MUST be green. (b) `droprect` — THE ROW'S DECLARED CONTROL: `pdfImageRef` writes `rect: null`; the row still mints at page grain and cropping it MUST fail by name (RECT_REQUIRED), while the named-refusal arm, the no-image page and Tier 1's text hold. (c) `nocm` — the image walk ignores `cm`: every hand-derived rectangle, synthetic and real, MUST fail while the counts hold. (d) `inlineleak` — the image walk tokenises inline sample bytes as operators: the placement painted after the inline image MUST move. (e) `emptynull` — THE ROW'S OVER-STRICTNESS CLAUSE: a measured empty list reported as null; the measured-zero arm MUST fail and every rect hold. (f) `textpin` — perturb Tier 1's TEXT walk: the pristine text digests MUST fail and every image arm hold. RESULTS: see the CPDF-18 claim's release line in CLAIMS.md. TWO EARLIER FORMS OF `textpin` ARMED AND BIT NOTHING (29/0 each) and are recorded in the harness rather than smoothed; an earlier `droprect` crashed the suite mid-run (a `.length` on the null rect) instead of failing by name, which is why section 0 now reads the rect defensively. */

/* CPDF-18 — EXTRACTION-BREADTH §3.3 item 2 / §3.4 / §7 row 4: PDF IMAGES AS
 * CONTENT, DRIVEN END TO END.
 *
 * WHAT THE ROW SAYS IS DONE WHEN, and what each section measures:
 *
 *   0. THE STRUCTURE OP EMITS `image {page, rect}` — on a PDF assembled
 *      byte-by-byte HERE, whose every placement matrix is written in this file,
 *      so the rectangles asserted are the FIXTURE'S OWN GROUND TRUTH (derived
 *      by hand from the matrices below, not produced by the code under test).
 *      It covers the three ways a page paints an image — an XObject `Do`, a
 *      `Do` inside a Form XObject (its /Matrix composed), and an inline image
 *      whose binary data holds bytes that LOOK like operators — plus a rotated
 *      placement, a page that paints nothing, and a page that DECLARES an image
 *      it never paints.
 *   1. REAL BYTES: the committed Oakland fixtures, where the image counts per
 *      page are pinned and the one rectangle checked was cross-read against
 *      Ghostscript (an independent renderer) — MEASUREMENTS.md, CPDF-18.
 *   2. THE ROW MINTS FROM THE STRUCTURE OP: `op=acquire`, then `op=pdfstructure`
 *      over the capture, then the reference it returned is cited through
 *      `op=promote` and read back through `op=content` — as BYTES, with no
 *      chain and no cap, at the address the structure op named.
 *   3. THE CROP IS A DERIVED RENDITION of that row's extent, labelled derived,
 *      whose bytes ARE the image's (the JPEG this file wrote), and whose
 *      refusals are named: the rect dropped (the row's declared negative
 *      control), a rect nothing is painted at, an inline image.
 *   4. OVER-STRICTNESS: a page with no images yields no rows and SAYS SO — an
 *      empty list is a measured zero, an unwalkable document is NULL with its
 *      reason, and Tier 1's text over the same fixture is byte-identical to the
 *      pristine tree (the tokenizer option is off for the text walk).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { extractPdfStructure, pdfImageRef } from "../src/pdfstructure.mjs";
import { describeExtent, canonicalExtent } from "../checks/bio-checks.mjs";
import { cropImage, CROP_REFUSALS } from "../../pdf-worker/src/imagecrop.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const FIX = (f) => new Uint8Array(readFileSync(fileURLToPath(new URL(`./fixtures/${f}`, import.meta.url))));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* THE AGENDA MASTHEAD'S RECTANGLE, DERIVED BY HAND from page 0's content stream,
   which reads `1 0 0 1 0 792 cm q q 118.8 0 0 117.35 244.8 -307.1 cm /img0 Do Q Q`:
   CTM = [118.8 0 0 117.35 244.8 484.9], so the unit square lands at
   x 244.8..363.6, y 484.9..602.25. Cross-read against a Ghostscript render of the
   same page (MEASUREMENTS.md, CPDF-18). */
const AGENDA_RECT = [244.8, 484.9, 363.6, 602.25];
/* TIER 1's TEXT, digested on the PRISTINE tree (`694f0a7f`, before any CPDF-18
   edit) over the image fixture below and over the Legistar agenda. The image
   walk added a tokenizer option; these pins are what says the text walk did
   not feel it. */
const TEXT_PIN_SYNTH = "11304705928975fe3dfefe4fbbd1d91d8ffb41067a9864407eba87af04a0b821";
/* RE-PINNED AGAIN 2026-09-24 by D-502, on the same terms and for the same
   reason the note below gives: this pair still says the image walk does not
   perturb the text walk, and the text itself moved. D-502 separates two runs
   that a horizontal jump divides on one baseline \u2014 the agenda's own
   `(City of Oakland) Tj 391.1 0 Td (Printed on \u2026) Tj` footer, read as
   `OaklandPrinted` until now \u2014 so 49 separators entered the agenda's text and
   not one decoded character changed (non-whitespace characters 51,060 before
   and after; lines 1,495 before and after). Its digest necessarily moved with
   it. THE OLD VALUE WAS NOT WRONG WHEN IT WAS TAKEN. The SYNTHETIC fixture's
   pin did NOT move again \u2014 it positions no run after a horizontal jump, so
   D-502 cannot touch it \u2014 and the new agenda digest reproduced on two
   consecutive runs. Taken from the figure the suite PRINTED.

   RE-PINNED 2026-09-24 by D-481, and the CLAIM is unchanged: this pair still says
   the image walk does not perturb the text walk. What moved is the text itself.
   D-481 stopped `Td`/`TD`/`Tm` breaking a line when the baseline does NOT move, so
   the agenda now reads 397 lines where it read 421, and its digest necessarily
   moved with it. THE OLD VALUE WAS NOT WRONG WHEN IT WAS TAKEN — it was the
   pristine reading of 2026-09-18 — it is SUPERSEDED, and it is corrected rather
   than exempted. Two facts make the re-pin honest rather than a rubber stamp:
   the SYNTHETIC fixture's pin did NOT move (it positions no glyph on a shared
   baseline, so D-481 cannot touch it), and the new agenda digest reproduced on
   two consecutive runs. Taken from the figure the suite PRINTED, never computed
   by hand. */
const TEXT_PIN_AGENDA = "967ac943c726e38064ee2f153a469a3742d0967d4bacf59234903e39d2865b8a";

/* ---- a tiny PDF assembler (capture-pagecount's) ---- */
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
const stream = (num, dict, buf) => ({ num, head: `<< ${dict} /Length ${buf.length} >>`, stream: buf });

/* ================= THE GROUND TRUTH ======================================= *
 * JPG: bytes written HERE; a DCT image's crop must hand back exactly these.
 * GREY: a 2x2 DeviceGray 8-bit image, unfiltered samples.                    */
const JPG = Buffer.from("\xff\xd8\xff\xe0CPDF-18 fixture: a map of Council District 3\xff\xd9", "latin1");
const GREY = Buffer.from([0x00, 0x40, 0x80, 0xff]);
/* The inline image's 16 sample bytes SPELL OPERATORS — `Q 1 0 0 1 9 9 cm` —
   so a walk that tokenised them would pop the graphics state and move the CTM,
   and the placement painted AFTER it would land in the wrong place. */
const INLINE_DATA = "Q 1 0 0 1 9 9 cm";
const PAGE0 = [
  "q 200 0 0 100 50 600 cm /Im1 Do Q",              // -> [50, 600, 250, 700]
  "q 1 0 0 1 300 100 cm /Fm1 Do Q",                 // Fm1: Matrix [2 0 0 2 10 10], inner cm 30 0 0 40 0 0
                                                    // -> [60 0 0 80 310 110] -> [310, 110, 370, 190]
  `q 10 0 0 20 30 40 cm BI /W 16 /H 1 /CS /G /BPC 8 ID ${INLINE_DATA} EI Q`,  // -> [30, 40, 40, 60]
  "q 0 50 -80 0 400 300 cm /Im1 Do Q",              // rotated -> [320, 300, 400, 350], axis_aligned false
].join("\n");
const WANT_P0 = [
  { rect: [50, 600, 250, 700], name: "Im1", inline: false, mime: "image/jpeg", axis_aligned: true },
  { rect: [310, 110, 370, 190], name: "Im2", inline: false, mime: null, axis_aligned: true },
  { rect: [30, 40, 40, 60], name: null, inline: true, mime: null, axis_aligned: true },
  { rect: [320, 300, 400, 350], name: "Im1", inline: false, mime: "image/jpeg", axis_aligned: false },
];
const FM1 = Buffer.from("q 30 0 0 40 0 0 cm /Im2 Do Q", "latin1");
const p0 = Buffer.from(PAGE0, "latin1");
const p1 = Buffer.from("BT ET", "latin1");                  // paints nothing
const p2 = Buffer.from("q 1 0 0 1 0 0 cm Q", "latin1");     // DECLARES Im1, never paints it
const IMAGES_PDF = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 6 0 R /Fm1 7 0 R >> >> /Contents 8 0 R >>" },
  { num: 4, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 10 0 R >>" },
  { num: 5, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 6 0 R >> >> /Contents 11 0 R >>" },
  stream(6, "/Type /XObject /Subtype /Image /Width 4 /Height 2 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode", JPG),
  stream(7, "/Type /XObject /Subtype /Form /BBox [0 0 100 100] /Matrix [2 0 0 2 10 10] /Resources << /XObject << /Im2 9 0 R >> >>", FM1),
  stream(8, "", p0),
  stream(9, "/Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceGray /BitsPerComponent 8", GREY),
  stream(10, "", p1),
  stream(11, "", p2),
]);
const ENCRYPTED_PDF = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>" },
  stream(4, "", Buffer.from("q 10 0 0 10 0 0 cm /Im1 Do Q", "latin1")),
  { num: 9, body: "<< /Filter /Standard /V 2 /R 3 /O (x) /U (y) /P -4 >>" },
]);

/* ===================== 0. THE PRODUCER ================================== */
console.log("--- 0. the structure op emits `image {page, rect}` for every image a page PAINTS ---");
const st = await extractPdfStructure(IMAGES_PDF);
const pick = (im) => ({ rect: im.rect, name: im.name, inline: im.inline, mime: im.mime, axis_aligned: im.axis_aligned });
t("page 0's four placements come back IN PAINTING ORDER at the rectangles derived BY HAND from the "
  + "matrices this file wrote — a Do, a Do inside a Form (its /Matrix composed), an inline image, a rotation",
  (st.images || []).filter((i) => i.page === 0).map(pick), WANT_P0);
t("the inline image's sample bytes spell `Q ... cm` and did NOT move the graphics state: the placement "
  + "painted after it is where its own matrix puts it",
  (st.images || [])[3]?.rect, [320, 300, 400, 350]);
t("a page that paints nothing yields NO entry, and a page that DECLARES an image and never paints it "
  + "yields none either — what is painted, not what is listed",
  [(st.images || []).filter((i) => i.page === 1).length, (st.images || []).filter((i) => i.page === 2).length],
  [0, 0]);
t("every entry is the IC-1 image reference in its PDF form: kind, a page, a rect, and the human form",
  (st.images || []).map((i) => [i.kind, i.page, Array.isArray(i.rect) ? i.rect.length : null, i.ref]),
  WANT_P0.map(() => ["image", 0, 4, "an image on page 1"]));
t("`mime` is set only where the stream's bytes ARE a file (DCT -> image/jpeg); raw samples say null",
  (st.images || []).map((i) => i.mime), ["image/jpeg", null, null, "image/jpeg"]);
t("PARITY: `pdfImageRef`'s human form IS the checker's derived form for the same address (IC-1)",
  [pdfImageRef(0, [1, 2, 3, 4]).ref === describeExtent({ kind: "image", page: 0, rect: [1, 2, 3, 4] }),
   pdfImageRef(6, [1, 2, 3, 4]).ref === describeExtent({ kind: "image", page: 6 })], [true, true]);
t("the parser object behind a placement never reaches the wire (JSON carries no `_stream`)",
  JSON.stringify(st.images).includes("_stream"), false);
const enc = await extractPdfStructure(ENCRYPTED_PDF);
t("an ENCRYPTED document's images are NULL with the reason — never an empty list, which would read "
  + "as 'no images'", [enc.images, enc.imagesWhy], [null, "encrypted"]);

/* ===================== 1. REAL BYTES ==================================== */
console.log("\n--- 1. the committed Oakland fixtures ---");
const perPage = (s) => { const m = {}; for (const i of s.images || []) m[i.page] = (m[i.page] || 0) + 1; return m; };
const agenda = await extractPdfStructure(FIX("legistar-agenda-1425405.pdf"));
t("the 33-page Legistar agenda paints ONE image, on page 0 (its masthead), and nothing on 32 pages",
  [agenda.pages, perPage(agenda)], [33, { 0: 1 }]);
/* THE ONE RECTANGLE PINNED ON REAL BYTES, read from the page's own content
   stream by hand and cross-read against a Ghostscript render (MEASUREMENTS.md). */
t("    and that image's rectangle is the one its content stream's `cm` places it at",
  agenda.images?.[0]?.rect, AGENDA_RECT);
const m545 = await extractPdfStructure(FIX("cpdf20/legistar-73545.pdf"));
t("legistar-73545: two images on page 0 (the two seals), five on page 6, none on pages 1-5",
  perPage(m545), { 0: 2, 6: 5 });
const m550 = await extractPdfStructure(FIX("cpdf20/legistar-73550.pdf"));
t("legistar-73550 (three pages of text, a signature drawn as vectors) paints NO image: a MEASURED "
  + "EMPTY LIST, not null", [m550.images, m550.imagesWhy ?? null], [[], null]);

/* ===================== 2. THE ROW MINTS FROM THE STRUCTURE OP ============ */
console.log("\n--- 2. op=acquire -> op=pdfstructure -> op=promote -> op=content ---");
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cpdf18", MEMBER_TOKEN: "mem-cpdf18", PROBE_TOKEN: "prb-cpdf18",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/images.pdf") return new Response(IMAGES_PDF, { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-cpdf18") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-cpdf18") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const NOW = "2026-09-18T00:00:00Z", LATER = "2026-09-18T01:00:00Z";
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
    snapKey: `20260918T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files, register: [] });
  if (r.ok !== false) HEAD.set(id, r.bundleSha);
  return r;
};
let legSeq = 0;
const cite = (target, leg) => {
  const id = `INQ-2026-9180-l${++legSeq}`;
  return promote(id, inquiryMd(id, { refs: [target], legs: [{ target, ...leg }] }), "inquiry");
};

const acq = await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-cpdf18",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov/images.pdf", authority: "City of Oakland" }) })).json();
const doc = acq.document;
const capSha = doc?.capture?.sha256;
t("the acquired capture IS the fixture's bytes (its sha256 is the one this file computes)", capSha, sha(IMAGES_PDF));
const viaOp = await get("pdfstructure", `sha256=${capSha}`);
t("op=pdfstructure over the capture returns the same image references the pure module does",
  (viaOp.images || []).map(pick), WANT_P0);
const DOC = "INFO-2026-9180-images";
const pr = await promote(DOC, infoMd(DOC), "information", { reading: doc });
t("the capture is promoted", pr.ok !== false, true);

const ref0 = viaOp.images[0];
const minted = await cite(DOC, { kind: "image", page: ref0.page, rect: ref0.rect });
t("the structure op's reference, cited AS IS, MINTS an `image` content row",
  [minted.ok, minted.content?.[0]?.extent_kind, minted.content?.[0]?.minted], [true, "image", true]);
const row = await get("content", `id=${minted.content?.[0]?.content_id}`);
t("    read back through op=content: the address IS the structure op's {page, rect}, cited as BYTES, "
  + "with NO chain and NO cap — an image cited as itself claims what the capture claims (§3.4)",
  [row.extent, row.cited_as, row.chain, row.derivation_cap, row.ref],
  [{ kind: "image", cited_as: "bytes", page: 0, part: null, rect: [50, 600, 250, 700] },
   "bytes", null, null, "an image on page 1"]);
t("    and its canonical address is the one the structure op's reference canonicalises to",
  canonicalExtent(row.extent) === canonicalExtent({ kind: "image", page: ref0.page, rect: ref0.rect, cited_as: "bytes" }), true);

/* ===================== 3. THE CROP ====================================== */
console.log("\n--- 3. the crop is a DERIVED RENDITION of the row's extent ---");
const crop = await cropImage(IMAGES_PDF, row.extent);
t("cropping the minted row's own extent succeeds and SAYS it is derived, and of what",
  [crop.ok, crop.derived, crop.rendition, crop.of, crop.capture_sha256],
  [true, true, "crop", { kind: "image", page: 0, rect: [50, 600, 250, 700] }, capSha]);
t("    a DCT image's crop IS the JPEG this file wrote, byte for byte — the publisher's bytes, untouched",
  [crop.route, crop.mediaType, crop.file_sha256], ["passthrough-dct", "image/jpeg", sha(JPG)]);
const cropForm = await cropImage(IMAGES_PDF, { kind: "image", page: 0, rect: [310, 110, 370, 190] });
t("the image painted INSIDE the Form XObject is found at its composed rectangle and decoded to pixels, "
  + "with the pixel hash beside the file hash", [cropForm.ok, cropForm.route, cropForm.width, cropForm.height],
  [true, "raw-samples-grey8", 2, 2]);
const cropRot = await cropImage(IMAGES_PDF, { kind: "image", page: 0, rect: [320, 300, 400, 350] });
t("a ROTATED placement crops, and says it does not know the crop is upright rather than claiming it is",
  [cropRot.ok, cropRot.upright], [true, null]);
const noRect = await cropImage(IMAGES_PDF, { kind: "image", page: 0 });
t("NEGATIVE CONTROL (the row's): the rect DROPPED from the reference -> the crop cannot be derived, "
  + "refused BY NAME", [noRect.ok, noRect.reason], [false, "RECT_REQUIRED"]);
const rowNoRect = await cite(DOC, { kind: "image", page: 0 });
t("    while the ROW without a rect still mints — the grammar admits a page-grain image; it is the "
  + "crop that needs the rectangle, and it is the crop that refuses", [rowNoRect.ok, rowNoRect.content?.[0]?.minted], [true, true]);
const wrongRect = await cropImage(IMAGES_PDF, { kind: "image", page: 0, rect: [0, 0, 10, 10] });
t("a rect the page paints no image at is refused BY NAME, listing what IS painted",
  [wrongRect.ok, wrongRect.reason, wrongRect.painted?.length], [false, "NO_IMAGE_AT_RECT", 4]);
const inl = await cropImage(IMAGES_PDF, { kind: "image", page: 0, rect: [30, 40, 40, 60] });
t("an inline image is REPORTED by the structure op and its crop is refused by name, not built",
  [inl.ok, inl.reason], [false, "INLINE_IMAGE"]);
t("every refusal above is one the module declares", [noRect, wrongRect, inl].every((r) => r.reason in CROP_REFUSALS), true);

/* ===================== 4. OVER-STRICTNESS =============================== */
console.log("\n--- 4. a page with no images yields no rows and says so ---");
const cropEmpty = await cropImage(IMAGES_PDF, { kind: "image", page: 1, rect: [50, 600, 250, 700] });
t("a crop asked of a page that paints nothing is refused NO_IMAGE_AT_RECT with an EMPTY painted list — "
  + "the page was walked and holds none", [cropEmpty.reason, cropEmpty.painted], ["NO_IMAGE_AT_RECT", []]);
t("TIER 1's TEXT over the image fixture and over a real agenda is unchanged by the image walk "
  + "(the tokenizer's inline-image option is off for text) — pinned by digest",
  [sha(JSON.stringify(st.text)), sha(JSON.stringify(agenda.text))], [TEXT_PIN_SYNTH, TEXT_PIN_AGENDA]);

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
