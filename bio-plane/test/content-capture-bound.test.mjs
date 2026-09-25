/* NEGATIVE CONTROL: the five arms live in `test/nc-rec88.mjs` and are re-run in one step with `node test/nc-rec88.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results recorded in this file's own RESULTS line and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes five-arms-working from five-arms-broken. (b) `nobound` — THE ITEM'S OWN: in src/store.mjs `earnedBasisRegistry`'s capture arm, replace `captureBound(chain, EARNED_CAPTURE_CEILING)` with `EARNED_CAPTURE_CEILING`, so the bound is computed and thrown away exactly as it was before this item; section 1's C-vs-B refusal and section 2's undetermined arm MUST FAIL BY NAME, and section 5's PUBLISHER-TYPED digest pin MUST STAY GREEN — held open deliberately, because an arm that also moved the publisher-typed answer would mean the suite is measuring the whole capture arm rather than the bound. (c) `nocheck` — in checks/bio-checks.mjs `checkEarnedLeg`, neuter the ceiling comparison (`if (false)` on the `BASIS_GRADES.indexOf` test); the WRITE-side refusal of a B on a C document MUST FAIL while the READ-side assertions that `op=earnedbasis` reports C MUST STAY GREEN — the two halves are separate defences and this arm proves it, because a suite whose read and write arms fall together cannot tell which one is enforcing. (d) `undetpass` — in src/textchain.mjs `captureBound`, make an undetermined cap pass the byte grade through (`if (cap == null) return byteGrade;`); section 2's UNDETERMINED arms MUST FAIL and section 1's measured-C arms MUST STAY GREEN — this is the direction CPDF-10's own comment warns about ("an unmeasured engine's output riding a direct capture's B") and it is the one an over-eager simplification would take. (e) `raise` — THE OVER-STRICTNESS DIRECTION, INVERTED: in src/store.mjs's capture arm take the WEAKEST over a document's captures instead of the strongest, and additionally let a fidelity STRONGER than the byte ceiling raise the letter (`weaker` -> the stronger of the two); section 4's both-directions arms MUST FAIL (a chain measured at A must still be bounded by the bytes at B) and sections 1-3 MUST STAY GREEN. */
/* RESULTS, run 2026-09-15 by the REC-88 worker, each arm ALONE on the FINAL tree, every restore byte-identical by sha256 AND by cmp (store.mjs 2,100,373 bytes sha256 7c65fb86a28a… twice; bio-checks.mjs 682,013 bytes sha256 b077e691eeb6…; textchain.mjs 63,855 bytes sha256 5eee2702fd16…): baseline 33/0 green · nobound 18/15 · nocheck 28/5 · undetpass 25/8 · raise 21/12 — ALL FIVE AS DECLARED, every declared failure present (10/10, 5/5, 6/6, 7/7) and ZERO held-open assertions also broken, which this harness CHECKS rather than describes after REC-83's own run found an arm that broke its declared held-open half. THREE THINGS CAME BACK DIFFERENT FROM THE DECLARATION AND ALL THREE ARE RECORDED RATHER THAN SMOOTHED. (1) SECTION 6's CENSUS-EQUIVALENCE ARM fails under `nobound`, `undetpass` and `raise` and was NOT in any declaration. That is the arm working: section 6 recomputes DEC-4's bound from `op=textprovenance`'s published columns and compares it to the plane's own answer, so ANY arm that changes what the plane answers breaks the agreement by construction. It is left undeclared-but-explained rather than added to three mustFail lists, because its value is that it is an INDEPENDENT second opinion and listing it as an expected failure of every arm would turn a cross-check into a restatement. (2) THE SUITE COULD NOT SEE ITS OWN REFUSALS ON ITS FIRST RUN — every refusal arm read `[false, []]` — because `op=promote` RESHAPES a finding to `{check, detail, repairs?}` and drops `severity` on the way out, and the helper filtered on `severity === 'error'`. The refusals were happening and the instrument was blind to them; the note is kept at `codes()` below because it is the 'check your suite reached its own foot' failure wearing a different hat. (3) SECTION 7's FIRST RUN MEASURED THE WRONG REFUSAL TWICE — once because a version row needs `relationship: and|or` (C-25.3, VERSION_NO_RELATIONSHIP) and once because `op=versionstrength` counts only ACCEPTED readings and refused the `suggested` one by name (C-30.6). Both were the plane being right and the fixture being wrong, and the second is why that read is now asked as an explicit what-if. */

/* REC-88 / D-349 — DEC-4 ENFORCED ON THE CAPTURE AXIS, DRIVEN THROUGH THE OPS.
 *
 * THE RULE, and it is not this suite's and not this item's: *"fidelity bounds
 * the capture axis as its weakest link, no third scale"* — DEC-4, restated as
 * CPDF-10 and carried by `BIO_Content_Framework_v0_10.md` Part II Appendix A.1
 * and `BIO_System_Design.md`'s capture-grade row. `textchain.mjs`'s
 * `captureBound` has been that rule in code since CPDF-10 and had ZERO CALLERS
 * under `src/` until this item (D-349, measured 2026-09-14 by REC-83). So the
 * record could accept a leg claiming capture grade B on a document whose text
 * this plane OCR'd at C — one letter stronger than its own doctrine allows,
 * which is the OVERCLAIMING direction CLAUDE.md names as worse than a missing
 * feature.
 *
 * WHAT THIS SUITE DRIVES, and every arm goes THROUGH AN OP rather than through
 * a store method — `op=invitelook` shipped with a ReferenceError while 1,276
 * assertions passed:
 *
 *   1. THE WRITE. `op=promote` carrying a basis leg on an OCR'd-at-C document is
 *      REFUSED at capture grade B, by name (C-2.8), and ACCEPTED at C.
 *   2. THE UNDETERMINED CASE. A transcription with no measured fidelity reads
 *      UNDETERMINED on the capture axis with the EMPTY LEVEL NAMED, a leg
 *      claiming any letter is refused for claiming rather than for being
 *      unmeasured, and a leg claiming NOTHING lands.
 *   3. THE READ. `op=earnedbasis` reports the bound, its code and its sentence,
 *      and the WRITE and the READ agree — one function, three consumers.
 *   4. THE WEAKEST LINK, BOTH DIRECTIONS. A fidelity measured STRONGER than the
 *      byte ceiling does not raise it; a fidelity measured weaker lowers it.
 *   5. OVER-STRICTNESS. A publisher-typed document — captured, read, no
 *      derivation step at all — earns EXACTLY what it earned before this item,
 *      pinned by a digest MEASURED ON THE PRISTINE PRE-ITEM TREE.
 *   6. THE EQUIVALENCE THE CENSUS RESTS ON. `op=textprovenance`'s published
 *      `transcribed` / `derivation_cap` pair is the pair `captureBound` branches
 *      on, so the read-only instance census (`test/rec88-instance-census.mjs`)
 *      recomputing the bound from those two columns is measuring the same rule.
 *
 * WHAT THIS SUITE DELIBERATELY DOES NOT DO: it does not name a `convert` step.
 * DEC-75 rules that a Google Drive export's chain carries `convert(producer,
 * format)` with cap UNDETERMINED, that CAP-10 lands the step KIND and CAP-11 its
 * calibration, and that `captureBound` reads it AS ANY OTHER DERIVATION STEP
 * with no code beyond the kind. Section 2's arms are therefore written against
 * the GENERAL shape — any derivation step carrying no measured cap — rather than
 * against a step name this tree does not yet admit. When CAP-10 lands, its step
 * inherits these arms without touching them, and nothing here has to be
 * unwritten first. A suite that hard-coded a step name would have made CAP-10's
 * landing harder, which this item was told not to do. */
import { statedJSON } from "./stated.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r88", MEMBER_TOKEN: "mem-r88", PROBE_TOKEN: "prb-r88",
              AI_TOKEN: "ai-r88", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r88") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r88") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
/* THE CODES A REFUSED PROMOTE CARRIES, so an arm asserts WHICH check refused
   and never merely that something did. A promote that failed for an unrelated
   reason would otherwise read as this rule holding.
   *
   * THE SHAPE IS THE WIRE'S, NOT THE CATALOGUE'S, and this cost a first run:
   * `op=promote` RESHAPES a finding to `{check, detail, repairs?}` and drops
   * `severity` on the way out (store.mjs, BASIS_REFUSED). A helper that filtered
   * on `severity === 'error'` therefore matched nothing and every refusal arm
   * read `[false, []]` — the refusal WAS happening and the instrument could not
   * see it. Recorded rather than quietly fixed: it is the "check your suite
   * reached its own foot" failure wearing a different hat, and the reason these
   * arms assert the CHECK ID and the SENTENCE rather than `ok === false` alone. */
const codes = (r) => [...new Set(((r && r.findings) || []).map((x) => x.check).filter(Boolean))].sort();
const detailsOf = (r) => ((r && r.findings) || []).map((x) => String(x.detail ?? x.message ?? "")).join(" || ");
const repairsOf = (r) => ((r && r.findings) || []).flatMap((x) => x.repairs || []).join(" || ");
const errorsMentioning = (r, re) => ((r && r.findings) || [])
  .filter((x) => re.test(String(x.detail ?? x.message ?? "")));

const NOW = "2026-09-15T00:00:00Z";
const LATER = "2026-09-15T01:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : [])])]
  : [];

const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
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
  ...(subject ? [`subject_entity: ${subject}`] : []),
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
const promote = async (id, text, type, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base: null,
    snapKey: `20260915T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
const mustPromote = async (id, ...a) => {
  const r = await promote(id, ...a);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};

/* THE CHAINS. Each one is a SHAPE and not an engine: this module holds no
   calibration and `cap` arrives as a parameter because it is a MEASUREMENT
   (textchain.mjs's header, and the reason this item adds no second home for a
   measured number). */
const ocrChain = (cap) => [
  { step: "pixels" },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" } },
];
/* A DERIVATION STEP CARRYING NO MEASURED CAP. Written as the general shape on
   purpose — see the header on DEC-75 and CAP-10. */
const unmeasuredChain = () => [
  { step: "pixels" },
  { step: "ocr", engine: "moondream", version: "2b", confidence: { basis: "none" } },
];
const readingOf = (captureSha, chain, entities = []) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: entities.length > 0,
             at: NOW, entities, facts: {},
             ...(chain === undefined ? {} : { text_source: chain }) } });

/* ===================== 0. THE GROUND ==================================== */

console.log("\n--- 0. the ground: one subject, four documents whose TEXT has four different provenances ---");

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] });
const ORD = eOrd.entity_id;
t("a subject entity is registered", /^ENT-/.test(ORD || ""), true);
const ENT = [{ ref: "ordinance:24680", kind: "ordinance", key: "24680", label: "Ordinance No. 24680" }];

/* THE FOUR, and the ids are the PROBE's so the digest in section 5 is a
   cross-checkout measurement rather than a value this suite produced for
   itself. `rec88-baseline-probe.mjs` builds PLAIN and UNMEAS with exactly these
   ids and exactly these chains. */
const DOCS = {
  PLAIN:  { id: "INFO-2026-8800-plain",      seed: "rec88-publisher-typed",   chain: undefined },
  OCR_C:  { id: "INFO-2026-8800-ocr-c",      seed: "rec88-ocr-c",             chain: ocrChain("C") },
  OCR_A:  { id: "INFO-2026-8800-ocr-a",      seed: "rec88-ocr-a",             chain: ocrChain("A") },
  UNMEAS: { id: "INFO-2026-8800-unmeasured", seed: "rec88-unmeasured",        chain: unmeasuredChain() },
};
for (const d of Object.values(DOCS)) {
  d.sha = sha(d.seed);
  await mustPromote(d.id, infoMd(d.id), "information", {
    reading: readingOf(d.sha, d.chain, ENT),
    register: [{ path: `snapshots/${d.id}.bin`, sha256: d.sha, encoding: "binary", bytes: 10 }] });
  await post("resolve", { captureSha: d.sha });
}
/* THE FIXTURE IS NON-EMPTY AND ITS SIZE IS PRINTED — three headline totality
   assertions in this estate have PASSED OVER AN EMPTY CORPUS. */
console.log(`  corpus: ${Object.keys(DOCS).length} documents, ${Object.values(DOCS).map((d) => d.id).join(", ")}`);
t("all four documents promoted and carry a capture the record holds",
  Object.values(DOCS).filter((d) => typeof d.sha === "string" && d.sha.length === 64).length, 4);

/* ===================== 1. THE WRITE ==================================== */

console.log("\n--- 1. op=promote: a leg on a document OCR'd at C is REFUSED at capture grade B and ACCEPTED at C ---");

const legOn = (doc, grade) => ({ target: doc.id, role: "supports",
  ...(grade === undefined ? {} : { grade }), axis: "capture", source: "capture" });

const rB = await promote("INQ-2026-8800-claims-b",
  inquiryMd("INQ-2026-8800-claims-b", { subject: ORD, refs: [DOCS.OCR_C.id],
    legs: [legOn(DOCS.OCR_C, "B")] }), "inquiry");
t("THE ITEM: capture grade B on a document this plane OCR'd at C is REFUSED, by name",
  [rB.ok, codes(rB)], [false, ["C-2.8"]]);
t("and the refusal NAMES BOTH LETTERS and the measured fidelity, so a member can act on it",
  errorsMentioning(rB, /STRONGER than the C/).length > 0
  && errorsMentioning(rB, /derivation is measured at C/).length > 0, true);
t("and it names the DOCTRINE rather than only the number — weakest link, no third scale",
  errorsMentioning(rB, /weakest link of byte provenance and transcription fidelity/).length > 0, true);

const rC = await promote("INQ-2026-8800-claims-c",
  inquiryMd("INQ-2026-8800-claims-c", { subject: ORD, refs: [DOCS.OCR_C.id],
    legs: [legOn(DOCS.OCR_C, "C")] }), "inquiry");
t("and the SAME leg at C lands — the bound is a ceiling, not a refusal of the document",
  rC.ok !== false, true);

/* A WEAKER letter is the member's own account of a poorer route and stays
   theirs: the ceiling rule admits it and always has. Driven because a fence
   that refused it would be tighter than its rule. */
const rD = await promote("INQ-2026-8800-claims-d",
  inquiryMd("INQ-2026-8800-claims-d", { subject: ORD, refs: [DOCS.OCR_C.id],
    legs: [legOn(DOCS.OCR_C, "D")] }), "inquiry");
t("and a WEAKER letter than the bound is still the member's to state",
  rD.ok !== false, true);

/* ===================== 2. THE UNDETERMINED CASE ======================== */

console.log("\n--- 2. an UNMEASURED transcription: undetermined and STATED, never a letter ---");

const ebU = await get("earnedbasis", `id=INQ-2026-8800-claims-c&targets=${DOCS.UNMEAS.id}`);
const capU = ebU.earned.capture[DOCS.UNMEAS.id];
t("the entry is PRESENT with a NULL grade — which is a different fact from an absent entry",
  [Object.prototype.hasOwnProperty.call(ebU.earned.capture, DOCS.UNMEAS.id),
   capU.grade, capU.determined, capU.mode],
  [true, null, false, "ceiling"]);
t("it carries the CODE, so a surface branches on a value rather than parsing prose",
  capU.undetermined_because, "CAPTURE_FIDELITY_UNMEASURED");
t("and it NAMES THE EMPTY LEVEL — which level is empty, not merely that something is",
  /transcription fidelity/.test(capU.empty_level) && /measured fidelity/.test(capU.empty_level), true);
t("and the count of captures is still reported: the record DOES hold the bytes",
  capU.captures, 1);

const rU = await promote("INQ-2026-8800-unmeas-b",
  inquiryMd("INQ-2026-8800-unmeas-b", { subject: ORD, refs: [DOCS.UNMEAS.id],
    legs: [legOn(DOCS.UNMEAS, "B")] }), "inquiry");
t("a leg claiming ANY letter on an unmeasured transcription is REFUSED, by name",
  [rU.ok, codes(rU)], [false, ["C-2.8"]]);
t("and the refusal says UNDETERMINED — never 'the record holds no capture', which would be FALSE here",
  [errorsMentioning(rU, /UNDETERMINED, not B/).length > 0,
   errorsMentioning(rU, /holds no registered capture/).length],
  [true, 0]);
/* THE DIRECTION THAT MATTERS: the leg is refused for CLAIMING, never for being
   unmeasured. A gate that refused the leg outright would pressure a member into
   inventing an attribution, which CLAUDE.md names as a bug in the gate. */
const rUn = await promote("INQ-2026-8800-unmeas-none",
  inquiryMd("INQ-2026-8800-unmeas-none", { subject: ORD, refs: [DOCS.UNMEAS.id],
    legs: [{ target: DOCS.UNMEAS.id, role: "supports" }] }), "inquiry");
t("but the SAME leg stating NO capture grade LANDS — refused for claiming, never for being unmeasured",
  rUn.ok !== false, true);
t("and the refusal offers stating no grade as a way through — the repair travels to the member",
  [/state NO capture grade/.test(repairsOf(rU)),
   /have the transcription measured/.test(repairsOf(rU))], [true, true]);

/* ===================== 3. THE READ AGREES WITH THE WRITE =============== */

console.log("\n--- 3. op=earnedbasis: the read reports exactly what the write enforces ---");

const eb = await get("earnedbasis", "id=INQ-2026-8800-claims-c");
const capC = eb.earned.capture[DOCS.OCR_C.id];
t("the read reports the BOUND letter and its code",
  [capC.mode, capC.grade, capC.bounded_by], ["ceiling", "C", "CAPTURE_BOUNDED_BY_FIDELITY"]);
t("its sentence names the byte grade it WOULD have been and the fidelity that bound it",
  [/would be worth B/.test(capC.why), /measured at C/.test(capC.why)], [true, true]);
t("and it still states that grade A is unreachable at all — the pre-existing ceiling is not lost",
  /Grade A is not reachable/.test(capC.ceiling || ""), true);
/* ONE FUNCTION, THREE CONSUMERS: a grade the READ does not report is a grade
   the WRITE does not accept. Asserted as the PAIR, because the two drifting
   apart is the defect this shape exists to prevent and it is invisible from
   either side alone. */
t("THE PAIR: the letter the read reports is exactly the letter the write accepted",
  [capC.grade, rC.ok !== false, rB.ok], ["C", true, false]);

/* ===================== 4. THE WEAKEST LINK, BOTH DIRECTIONS ============ */

console.log("\n--- 4. the weakest link is a MINIMUM: fidelity never RAISES a capture grade ---");

const ebA = await get("earnedbasis", `id=INQ-2026-8800-claims-c&targets=${DOCS.OCR_A.id}`);
const capA = ebA.earned.capture[DOCS.OCR_A.id];
t("a transcription measured at A does NOT raise the capture axis above the byte ceiling",
  capA.grade, "B");
t("and it gains no bounded_by code, because fidelity did not bind — the bytes did",
  Object.prototype.hasOwnProperty.call(capA, "bounded_by"), false);
const rA = await promote("INQ-2026-8800-ocr-a-claims-a",
  inquiryMd("INQ-2026-8800-ocr-a-claims-a", { subject: ORD, refs: [DOCS.OCR_A.id],
    legs: [legOn(DOCS.OCR_A, "A")] }), "inquiry");
t("so a leg claiming A on it is still refused — a chain-of-custody archive is what A needs",
  [rA.ok, codes(rA)], [false, ["C-2.8"]]);
/* THE OTHER DIRECTION IN THE SAME BREATH, so the pair cannot be read as one
   rule: the weaker of the two is taken whichever side it falls on. */
t("BOTH DIRECTIONS AT ONCE: bytes-weaker gives B, fidelity-weaker gives C, from one rule",
  [capA.grade, capC.grade], ["B", "C"]);

/* ===================== 5. OVER-STRICTNESS ============================== */

console.log("\n--- 5. OVER-STRICTNESS: publisher-typed text earns EXACTLY what it earned before this item ---");

/* THE DIGEST IS A CROSS-CHECKOUT MEASUREMENT AND NOT A HAND COPY.
   `test/rec88-baseline-probe.mjs` builds a document with this id, this seed and
   NO transcription chain, and prints the sha256 of its `earned.capture` entry.
   Run against the PRISTINE pre-item tree — `origin/main` at 6e88e35, a second
   `git worktree add` with its own `npm ci` — it printed the hex below on
   2026-09-15; run against this tree it prints the same hex. A hand copy agrees
   for free, so what makes this evidence is that the two runs were of DIFFERENT
   SOURCE TREES. Re-derive:
       node test/rec88-baseline-probe.mjs <pristine>/bio-plane/src/index.mjs
       node test/rec88-baseline-probe.mjs */
const PRISTINE_PLAIN_CAPTURE_DIGEST = "2aac4721c679dd6dba379a5493843ae42999aa6a29ecbeb197a7d7a927127985";
const ebP = await get("earnedbasis", `id=INQ-2026-8800-claims-c&targets=${DOCS.PLAIN.id}`);
const capP = ebP.earned.capture[DOCS.PLAIN.id];
t("a captured, READ, publisher-typed document still earns the ceiling",
  [capP.mode, capP.grade, capP.captures], ["ceiling", "B", 1]);
t("and its entry is BYTE-IDENTICAL to what the PRISTINE pre-item tree printed — key order included",
  sha(JSON.stringify(capP)), PRISTINE_PLAIN_CAPTURE_DIGEST);
t("STRUCTURAL: it gained not one key — no code, no empty level, nothing",
  Object.keys(capP), ["mode", "grade", "captures", "why", "ceiling"]);
const rP2 = await promote("INQ-2026-8800-plain-b",
  inquiryMd("INQ-2026-8800-plain-b", { subject: ORD, refs: [DOCS.PLAIN.id],
    legs: [legOn(DOCS.PLAIN, "B")] }), "inquiry");
t("and a leg claiming B on it LANDS, exactly as it always has",
  rP2.ok !== false, true);
/* AND THE SPELLING NOBODY ANTICIPATED, which is the over-strictness arm the
   standing brief asks for by name: a document the record holds bytes of and has
   NEVER READ carries no `reading_text_source` row at all. That is not a missing
   fact and must not be bounded to undetermined — it is an UNTRANSCRIBED
   capture, and the LEFT join plus `captureBound(null, …)` is what keeps it
   earning the ceiling. It is most of a real corpus: CAP-9 measured 88 captured
   documents and 0 readings on this project's own instance. */
const NEVER_READ = "INFO-2026-8800-never-read";
const SHA_NR = sha("rec88-never-read");
await mustPromote(NEVER_READ, infoMd(NEVER_READ), "information",
  { register: [{ path: "snapshots/nr.bin", sha256: SHA_NR, encoding: "binary", bytes: 10 }] });
const ebN = await get("earnedbasis", `id=INQ-2026-8800-claims-c&targets=${NEVER_READ}`);
t("a captured document the record has NEVER READ earns the ceiling — no chain is not an unmeasured chain",
  [ebN.earned.capture[NEVER_READ].grade, ebN.earned.capture[NEVER_READ].captures], ["B", 1]);

/* ===================== 6. THE CENSUS'S EQUIVALENCE ===================== */

console.log("\n--- 6. the pair the instance census recomputes from IS the pair the bound branches on ---");

/* `test/rec88-instance-census.mjs` runs against a DEPLOYED build that does not
   carry this change, so it cannot import `captureBound` — it recomputes the
   bound from `op=textprovenance`'s published `transcribed` and `derivation_cap`.
   That is only sound if those two columns are what `captureBound` branches on.
   Asserted here rather than left in a comment. */
const tp = await get("textprovenance", "limit=100");
const byId = Object.fromEntries((tp.documents || []).map((d) => [d.bundle_id, d]));
const CEILING = "B", GR = ["A", "B", "C", "D"];
const censusRule = (row) => !row || !row.transcribed ? CEILING
  : row.derivation_cap == null ? null
  : (GR.indexOf(CEILING) >= GR.indexOf(row.derivation_cap) ? CEILING : row.derivation_cap);
/* THREE ROWS FOR FOUR DOCUMENTS, AND THE MISSING ONE IS THE POINT rather than a
   shortfall: `reading_text_source` is projected from a reading's CHAIN, so the
   publisher-typed document — read, but with no `text_source` at all — has no row
   there, exactly as a never-read capture has none. Both are UNTRANSCRIBED and
   both must earn the ceiling, which is what the comparison below drives. An
   assertion written as ">= 4" here would have been an instrument that did not
   understand its own table. */
t("op=textprovenance publishes a row per TRANSCRIBED capture with the two columns the census reads",
  [(tp.documents || []).length,
   (tp.documents || []).every((d) => typeof d.transcribed === "boolean" && "derivation_cap" in d),
   (tp.documents || []).some((d) => d.bundle_id === DOCS.PLAIN.id)],
  [3, true, false]);
const ebAll = await get("earnedbasis",
  `id=INQ-2026-8800-claims-c&targets=${Object.values(DOCS).map((d) => d.id).join(",")}`);
t("and for EVERY document in this corpus the census rule and the plane's own answer agree",
  Object.values(DOCS).map((d) => [d.id, censusRule(byId[d.id]),
                                  ebAll.earned.capture[d.id] ? ebAll.earned.capture[d.id].grade : "ABSENT"])
    .filter(([, a, b]) => a !== b),
  []);
console.log(`  corpus compared: ${Object.values(DOCS).length} documents, `
  + `${(tp.documents || []).length} textprovenance row(s)`);
/* WHAT THE MATCHER CANNOT SEE, stated plainly: this equivalence is over
   DOCUMENT-grain answers with ONE capture each. A document with SEVERAL captures
   of differing fidelity is collapsed by taking the STRONGEST bound (the same
   collapse `earnedBasisRegistry` makes on the connection axis) and the census
   applies that same collapse in its own code — so the two agree by construction
   there rather than by this assertion, and this suite does not drive a
   multi-capture document. Named because a reader must be able to tell a clean
   result from a walk looking in the wrong place. */

/* ===================== 7. THE VERSION-STRENGTH CONSUMER ================ */

console.log("\n--- 7. op=versionstrength: the OTHER consumer of earned.capture says the RIGHT empty level ---");

/* WHY THIS SECTION EXISTS AT ALL, and it is not tidiness. `#versionLegsAsMembers`
   had ONE sentence for a capture entry with no letter — "the record holds no
   captured bytes for X" — and that was complete while the only way to have no
   letter was to have no bytes. This item made a SECOND way: a transcription with
   no measured fidelity. Without the arm added beside it, this surface would tell
   a member to go capture a document the record already holds. A mechanism
   believed on its EXISTENCE rather than its behaviour is the defect this project
   meets most, so the arm is DRIVEN through its own op rather than read. */
const vScalar = (k, v) => v === undefined ? [] : (typeof v === "boolean" ? [`    ${k}: ${v}`]
  : v === null ? [`    ${k}: null`] : [`    ${k}: "${String(v)}"`]);
const V = "the unmeasured reading";
const vLines = [
  "basis_versions:",
  [`  - name: "${V}"`, ...vScalar("description", "rests on a transcription nobody measured"),
   ...vScalar("relationship", "and"), ...vScalar("state", "suggested"),
   ...vScalar("derived_from", null), ...vScalar("hidden", false),
   ...vScalar("author", "hollis"), ...vScalar("at", NOW)].join("\n"),
  "basis_version_grounds:",
  [`  - version: "${V}"`, ...vScalar("ground", "only-ground"),
   ...vScalar("asserted_by", "hollis"), ...vScalar("at", NOW)].join("\n"),
  "basis_version_legs:",
  [`  - version: "${V}"`, ...vScalar("target", DOCS.UNMEAS.id), ...vScalar("role", "supports"),
   ...vScalar("ground", "only-ground"), ...vScalar("grade_axis", "capture"),
   ...vScalar("grade_source", "capture")].join("\n"),
];
const INQ_V = "INQ-2026-8800-versioned";
const mdV = inquiryMd(INQ_V, { subject: ORD, refs: [DOCS.UNMEAS.id],
  legs: [{ target: DOCS.UNMEAS.id, role: "supports" }] })
  .replace("\n---\n\n## Question", "\n" + vLines.join("\n") + "\n---\n\n## Question");
const rV = await promote(INQ_V, mdV, "inquiry");
t("a version whose leg rests on the unmeasured transcription promotes (it states no letter)",
  rV.ok !== false, true);
/* THE VERSION IS `suggested`, so the read is asked as a WHAT-IF naming that state —
   `op=versionstrength` counts only ACCEPTED readings by default and says so by name
   (C-30.6). Driving it any other way would have measured that refusal instead of
   this arm's subject, which is what the first run of this section did. */
const vs = await get("versionstrength", `id=${INQ_V}&version=${encodeURIComponent(V)}&states=suggested,accepted`);
const inertWhy = JSON.stringify((vs && vs.capture && vs.capture.not_load_bearing) || (vs && vs.ungraded) || vs);
t("its capture leg is NOT load-bearing, which is the honest outcome",
  [vs.ok !== false, /not_load_bearing|ungraded/.test(JSON.stringify(vs))], [true, true]);
t("THE ITEM: the sentence names the UNMEASURED FIDELITY and does NOT say the record holds no bytes",
  [/every transcription of its text is UNMEASURED|UNMEASURED/.test(inertWhy),
   /holds no captured bytes/.test(inertWhy)], [true, false]);

console.log(`\ncontent-capture-bound: ${pass} passed, ${fail} failed`);
await mf.dispose();
process.exit(fail ? 1 : 0);
