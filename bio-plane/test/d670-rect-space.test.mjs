/* NEGATIVE CONTROL: the arms plus a baseline live in `test/nc-d670.mjs` and are re-run in one step with `node test/nc-d670.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by content with a byte count printed and a minimum guarded (never `git checkout --`). Declared before arming, and every one RUN. (a) `baseline` — nothing armed; MUST be green. (b) `posfields` — THE ROW'S DECLARED CONTROL: in src/store.mjs `#posFields` drops `space`; the pixel rect that fits the page then MINTS as user space and "the OCR pixel rect that FITS the page is refused BY NAME" MUST FAIL, with the off-page pixel rect's code (C-45.1 in place of C-45.13); the user-space arms MUST NOT move. (c) `source` — in src/textchain.mjs `readingSource` stops carrying `space` (the seam the op actually crosses first); the same two arms and the "position carries its space" arm MUST FAIL. (d) `checker` — in checks/bio-checks.mjs the space refusal is removed; both pixel-rect arms and the promote-leg arm MUST FAIL, the user-space arms MUST NOT move. (e) `covers` — in src/textchain.mjs `extentCovers` stops comparing spaces; the cross-space attestation arm MUST FAIL. (f) `overstrict` — THE OVER-STRICTNESS DIRECTION: the checker refuses any STATED space, `user` included; "an explicit space 'user' MINTS" MUST FAIL while the unstated-space arms stay green. */
/* RESULTS, run 2026-09-25 by the D-670 worker, `node test/nc-d670.mjs`, each arm alone, every restore byte-identical by sha256 and content: baseline 26/0 green; posfields 22/4 (2/2 declared); source 19/7 (5/5); checker 20/6 (4/4); covers 24/2 (2/2); overstrict 25/1 (1/1). Every arm AS DECLARED. REPRODUCTION before the fix, this suite on land/worker/D-374 c7703c3d: 11 pass, 14 fail — the pixel rect that fits the page MINTED (content row written, one mint spent) and the off-page one was refused C-45.1. A FIRST control run found a coupling in THIS SUITE, not in the subject: the leg-`user` arm asserted `minted`, and under any arm that let the pixel rect mint that row pre-existed; it now asserts the row it names. */
/* D-670 — A `pdf-page` RECT CARRIES ITS COORDINATE SPACE, AND ONLY USER SPACE IS ADDRESSED.
 *
 * Until D-670 the extent grammar had no coordinate space. An OCR region's
 * anchor is in IMAGE PIXELS of the frame that was OCR'd (`ocr-worker`
 * transcribe: `space: "image-px"`), while a content extent's rect is in PDF
 * DEFAULT USER SPACE (IC-203, D-374's MediaBox bound). `op=extractpropose`
 * normalised the proposal's `source` through `readingSource`, which rebuilt the
 * position field by field and DROPPED `space`; the extent then reached
 * `checkContentExtent` as a user-space rect. A pixel rect that happened to fit
 * inside the MediaBox MINTED — a content row addressing a region the reader
 * never pointed at — and one that did not was refused C-45.1 for the wrong
 * reason.
 *
 * WHAT THIS SUITE MEASURES, through the ops: a REAL acquire of a REAL PDF (so
 * the record holds the page's MediaBox), an EXTRACT run opened by a member, and
 * `op=extractpropose` of OCR-shaped positions. A pixel rect is refused BY NAME
 * (C-45.13), whether it fits the page or not; a user-space rect mints; an
 * explicit `space: "user"` is the SAME address as an unstated one (the
 * canonical bytes do not move); a page-only position is space-free and mints the
 * page. A basis leg naming `extent_space` is read and refused by the same
 * checker through op=promote. `extentCovers` and `readingPositionInExtent`
 * answer false across spaces.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkContentExtent, canonicalExtent, legExtent, extentRelation, CONTENT_EXTENT_CHECKS }
  from "../checks/bio-checks.mjs";
import { extentCovers, readingSource, readingSourceJson, readingPositionInExtent, gradeCeiling }
  from "../src/textchain.mjs";
import { EXTRACT_RUN_MODE } from "../src/extractrun.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* ---- a tiny PDF assembler (d374-page-box's) ---- */
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
const CMAP = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;
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
    const content = "BT /F1 10 Tf 72 700 Td " + lines.map((l, j) =>
      (j ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
    const cbuf = Buffer.from(content, "latin1");
    objs.push({ num: kid(i), body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] `
      + `/Resources << /Font << /F1 3 0 R >> >> /Contents ${kid(i) + 1} 0 R >>` });
    objs.push({ num: kid(i) + 1, head: `<< /Length ${cbuf.length} >>`, stream: cbuf });
  });
  return pdf(objs);
}
/* TWO US LETTER PAGES, 612 x 792 pt each — the fixture's own ground truth. */
const LETTER = textPdf([["City of Oakland", "Sewer Fund Transfer"], ["Appendix A", "Signed, Harriet Vance"]]);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d670", MEMBER_TOKEN: "mem-d670", PROBE_TOKEN: "prb-d670",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/letter.pdf")
      return new Response(LETTER, { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d670") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const NOW = "2026-09-25T00:00:00Z", LATER = "2026-09-25T01:00:00Z";

const session = async (memberId, role, caps = ["contribute", "create_projects"]) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: caps }, "adm-d670");
  const en = await post("enroll", { invite: add.invite, handle: memberId,
                                    password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const RUTH = await session("ruth", "admin", ["contribute", "publish", "create_projects"]);

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
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      "    extent_kind: pdf-page", `    extent_page: ${l.page}`,
      ...(l.rect ? [`    extent_rect: [${l.rect.join(", ")}]`] : []),
      ...(l.space ? [`    extent_space: ${l.space}`] : [])])]
  : [];
const inquiryMd = (id, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`,
      "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

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
    snapKey: `20260925T${String(600000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    /* CORRECTED 2026-09-25 at the c23-batch30 union (D-563, C-86.3, merged beside D-670), never exempted: the item
       was cut over D-374 before D-563, and its label `Bundle ${id}` contradicted the title every document here states
       (`Info …`, `What does … rest on?`), so it is now refused ENVELOPE_TITLE_DISAGREES; the request names no title,
       so the record goes by the document's — D-374's suite was corrected the same way at c22-batch30. */
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register: [] }, RUTH);
  if (r.ok !== false) HEAD.set(id, r.bundleSha);
  return r;
};

/* ===================== 0. THE GROUND ===================================== */

console.log("\n--- 0. a REAL acquired PDF (its MediaBox held), a member's EXTRACT run ---");

const acq = await (await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-d670",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov/letter.pdf",
                                           authority: "City of Oakland" }) })).json();
const letter = acq.document;
t("the reading holds the page's MediaBox — the bound a user-space rect is checked against",
  letter?.reading?.page_boxes?.boxes?.[0]?.media_box, [0, 0, 612, 792]);
const DOC = "INFO-2026-9670-letter", INQ = "INQ-2026-9670-run";
const pDoc = await promote(DOC, infoMd(DOC), "information", { reading: letter });
t("the document is promoted with its reading", pDoc.ok !== false, true);
await promote(INQ, inquiryMd(INQ, { refs: [DOC] }), "inquiry");

const cred = await post("aicredentialmint",
  { tokenId: "extractor", principalKind: "member", principalMember: "ruth", taskScope: "extract",
    writes: ["extractpropose"], note: "the EXTRACT agent: proposes readings" }, RUTH);
const AK = cred.token;
const RUN = "RUN-2026-0925-d670";
const opened = await post("airunopen", {
  run: RUN, contextType: "inquiry", contextId: INQ, label: "OCR regions proposed as readings",
  mode: EXTRACT_RUN_MODE, principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "mints", allowed: 50, unit: "passages" }], leaseMs: 600000, at: NOW }, RUTH);
t("a member opens the EXTRACT run", [cred.ok, opened.started], [true, true]);

/* The OCR worker's own anchor shape (ocr-worker/src/transcribe.mjs): a rect in
   PIXELS of a 1700 x 2200 frame (US Letter at 200 dpi). */
const IMAGE = { width: 1700, height: 2200, route: "pdf-page-pixels", upright: true, rotate_deg: 0 };
const propose = (ref, source) => post("extractpropose",
  { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
    refs: [{ ref, label: ref, source }] }, AK);
const mintOf = (r) => {
  const p = r?.proposed?.[0] || {};
  return { ok: r?.ok, minted: p.content_id != null, refused: p.mint_refused?.check ?? null,
           code: p.mint_refused?.code ?? null };
};

/* ===================== 1. THE ACCEPTS-WHEN =============================== */

console.log("\n--- 1. an OCR pixel rect proposed through op=extractpropose is refused BY NAME ---");

/* [100, 150, 500, 190] px FITS inside 612 x 792 — the case that minted by accident. */
const rFit = await propose("Sewer Fund Transfer", { kind: "pdf-page", ref: "p0", page: 0,
  rect: [100, 150, 500, 190], space: "image-px", image: IMAGE });
t("the OCR pixel rect that FITS the page is refused BY NAME, never minted as user space",
  mintOf(rFit), { ok: true, minted: false, refused: "C-45.13", code: "CONTENT_EXTENT_NOT_USER_SPACE" });
t("    the position the record keeps CARRIES its space — the proposal says where it was read",
  rFit.proposed?.[0]?.position, { kind: "pdf-page", ref: "p0", page: 0, rect: [100, 150, 500, 190],
                                  space: "image-px" });
const rOff = await propose("Harriet Vance", { kind: "pdf-page", ref: "p1", page: 1,
  rect: [150, 1800, 900, 1840], space: "image-px", image: IMAGE });
t("the OCR pixel rect OFF the page is refused for its SPACE (C-45.13), not as off the page (C-45.1)",
  mintOf(rOff), { ok: true, minted: false, refused: "C-45.13", code: "CONTENT_EXTENT_NOT_USER_SPACE" });
t("    and the refusal names the space and says no conversion was made",
  /'image-px'/.test(rOff.proposed?.[0]?.mint_refused?.detail || "")
  && /not converted/.test(rOff.proposed?.[0]?.mint_refused?.detail || ""), true);
t("no mint was spent on either", [rFit.minted, rOff.minted], [0, 0]);

console.log("\n--- 2. over-strictness: user-space work must still mint ---");

const rUser = await propose("Appendix A", { kind: "pdf-page", ref: "p1", page: 1, rect: [72, 72, 540, 720] });
t("a user-space rect with NO stated space MINTS (existing extents read as user space)",
  mintOf(rUser), { ok: true, minted: true, refused: null, code: null });
const rExplicit = await propose("Appendix A, again", { kind: "pdf-page", ref: "p1", page: 1,
  rect: [72, 72, 540, 720], space: "user" });
t("an explicit space 'user' MINTS, and is the SAME content row — the canonical bytes did not move",
  [mintOf(rExplicit).minted, rExplicit.proposed?.[0]?.content_id],
  [true, rUser.proposed?.[0]?.content_id]);
t("    and its stored position is the unstated spelling, byte for byte",
  rExplicit.proposed?.[0]?.position, rUser.proposed?.[0]?.position);
const rPage = await propose("City of Oakland", { kind: "pdf-page", ref: "p0", page: 0, space: "image-px" });
t("a PAGE-ONLY position naming a pixel space mints the page: a page index has no space",
  [mintOf(rPage), rPage.proposed?.[0]?.position],
  [{ ok: true, minted: true, refused: null, code: null }, { kind: "pdf-page", ref: "p0", page: 0, rect: null }]);

/* ===================== 3. A BASIS LEG, THROUGH op=promote ================= */

console.log("\n--- 3. a basis leg naming extent_space is READ, and refused by the same checker ---");

const rLeg = await promote("INQ-2026-9670-leg", inquiryMd("INQ-2026-9670-leg",
  { refs: [DOC], legs: [{ target: DOC, page: 0, rect: [100, 150, 500, 190], space: "image-px" }] }), "inquiry");
/* The leg grammar RELAYS the checker's code under its own C-2.8 (checkLegExtentGrammar,
   REC-84's `dom` precedent): the rule is the leg grammar, the CODE is the extent family's. */
t("a leg with extent_space: image-px is REFUSED BY NAME at promote",
  [rLeg.ok, rLeg.reason, (rLeg.findings || []).map((f) => [f.check, f.code])],
  [false, "BASIS_REFUSED", [["C-2.8", "CONTENT_EXTENT_NOT_USER_SPACE"]]]);
const rLegU = await promote("INQ-2026-9670-legu", inquiryMd("INQ-2026-9670-legu",
  { refs: [DOC], legs: [{ target: DOC, page: 0, rect: [100, 150, 500, 190], space: "user" }] }), "inquiry");
/* ADMITTED, asserted by the row it names rather than by `minted`: under a control arm that lets the
   pixel rect mint, this same rect's row already exists and `minted` reads false — a coupling to §1
   the first control run caught (every arm then also failed here). */
t("the same leg with extent_space: user MINTS",
  [rLegU.ok !== false, /^[0-9a-f]{64}$/.test(rLegU.content?.[0]?.content_id || "")], [true, true]);

/* ===================== 4. THE PURE FUNCTIONS =============================== */

console.log("\n--- 4. the grammar: space read, canonical form pinned, cross-space covers nothing ---");

t("legExtent reads extent_space onto the pdf-page arm",
  legExtent({ extent_kind: "pdf-page", extent_page: 0, extent_rect: [1, 2, 3, 4], extent_space: "image-px" }),
  { kind: "pdf-page", page: 0, rect: [1, 2, 3, 4], space: "image-px" });
t("the canonical bytes of an unstated and a 'user' space are IDENTICAL, and the pre-D-670 bytes",
  [canonicalExtent({ kind: "pdf-page", page: 0, rect: [1, 2, 3, 4] }),
   canonicalExtent({ kind: "pdf-page", page: 0, rect: [1, 2, 3, 4], space: "user" })],
  ['{"kind":"pdf-page","page":0,"rect":[1,2,3,4]}', '{"kind":"pdf-page","page":0,"rect":[1,2,3,4]}']);
t("the checker refuses an image arm's pixel rect too (the same rect, the same space)",
  checkContentExtent({ kind: "image", page: 0, rect: [1, 2, 3, 4], space: "image-px" }, { known: false })?.check,
  "C-45.13");
t("the refusal row is in the family, with a canned translation",
  [CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NOT_USER_SPACE?.check,
   typeof CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NOT_USER_SPACE?.translation], ["C-45.13", "string"]);
t("readingSource keeps a non-user space beside a rect and drops 'user' to the unstated spelling",
  [readingSourceJson({ kind: "pdf-page", ref: "p0", page: 0, rect: [1, 2, 3, 4], space: "image-px" }),
   readingSourceJson({ kind: "pdf-page", ref: "p0", page: 0, rect: [1, 2, 3, 4], space: "user" })],
  ['{"page":0,"rect":[1,2,3,4],"space":"image-px"}', '{"page":0,"rect":[1,2,3,4]}']);

const ocrAnchor = { kind: "pdf-page", ref: "p0", page: 0, rect: [0, 0, 1700, 2200], space: "image-px" };
const att = { member: "member:ruth", at: NOW, extent: { kind: "region", source: ocrAnchor } };
const legTarget = { kind: "pdf-page", page: 0, rect: [100, 150, 500, 190] };
t("an attestation over an OCR PIXEL region does NOT cover a user-space target it numerically contains",
  extentCovers(att.extent, legTarget), false);
t("    and it DOES cover a target in its own space",
  extentCovers(att.extent, { ...legTarget, space: "image-px" }), true);
t("    and a user-space attestation still covers a user-space target (unstated = user)",
  extentCovers({ kind: "region", source: { kind: "pdf-page", page: 0, rect: [0, 0, 612, 792] } }, legTarget), true);
t("so gradeCeiling does not hand the leg the attestation's ceiling across spaces",
  gradeCeiling([{ step: "layer" }], legTarget, [att]).determinant, "derivation");
t("readingPositionInExtent: a pixel reading is not inside a user-space extent, nor a user one inside a pixel extent",
  [readingPositionInExtent({ kind: "pdf-page", ref: "p0", page: 0, rect: [100, 150, 500, 190], space: "image-px" },
     "pdf-page", { page: 0, rect: [0, 0, 612, 792] }),
   readingPositionInExtent({ kind: "pdf-page", ref: "p0", page: 0, rect: [100, 150, 500, 190] },
     "pdf-page", { page: 0, rect: [0, 0, 1700, 2200], space: "image-px" }),
   readingPositionInExtent({ kind: "pdf-page", ref: "p0", page: 0, rect: [100, 150, 500, 190] },
     "pdf-page", { page: 0, rect: [0, 0, 612, 792] })],
  [false, false, true]);
t("extentRelation (op=narrow and its candidate list): a pixel rect is never NARROWER than its page",
  [extentRelation({ kind: "pdf-page", page: 0 }, { kind: "pdf-page", page: 0, rect: [1, 2, 3, 4], space: "image-px" }),
   extentRelation({ kind: "pdf-page", page: 0 }, { kind: "pdf-page", page: 0, rect: [1, 2, 3, 4] })],
  ["unreadable", "narrower"]);
t("readingSource of the unstated spelling is unchanged (no space key)",
  readingSource({ kind: "pdf-page", ref: "p0", page: 0, rect: [1, 2, 3, 4] }),
  { kind: "pdf-page", ref: "p0", page: 0, rect: [1, 2, 3, 4] });

} finally {
  await mf.dispose();
}
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
