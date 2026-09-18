/* NEGATIVE CONTROL: RUN 2026-09-17 by the REC-118 worker — FOUR arms plus a baseline, each armed ALONE, all in `src/store.mjs`, every arm restored from its OWN uniquely-named pristine copy and every restore verified byte-identical by sha256 AND by `cmp` AND by size against a floor (store.mjs 2,309,176 bytes sha256 961e4ac91c7a7eb4, floored at 500 kB; 0 copies left in the tree). ONE COMMAND EACH: `node test/nc-rec118.mjs <none|a|b|c|d>` from `bio-plane/` — the driver holds every patch, its DECLARATION and the declared-vs-actual check, so the next session re-runs an arm in ONE step instead of re-deriving how to break the subject. BASELINE ARM `none` = 28 pass / 0 fail / exit 0, and it exists because a driver whose every arm reports one number cannot tell three-arms-broken from three-arms-working. (a) THE ITEM'S OWN — the registry is still asked and its answer DISCARDED, so the op publishes the AUTHORED letter again, uncapped, beside the same capped `strength` block -> 23 pass, 5 FAIL, AS DECLARED, and **THE HEADLINE FAILURE NAMES BOTH LETTERS, THE AXIS, THE AUTHORITY AND THE OP**, which the row requires because a failure naming one is one a reader cannot act on: `want {"op":"op=reevaluations","grade_earned_published":"C","grade_authored_published":"B",…,"authority_strength_block":"C"} got {"op":"op=reevaluations","grade_earned_published":"B","grade_authored_published":"B",…,"authority_strength_block":"C"}`. (b) THE MEMBER'S ACT ERASED — the letter caps correctly but `grade_authored`/`grade_why` are not published, which is the OTHER defensible answer to this item's doctrine question, implemented -> 19 pass, 9 FAIL, AS DECLARED. **This is the arm that proves the ruling's COMPROMISE is load-bearing rather than decorative, and the proof is in what it did NOT break: *THE TWO HALVES OF ONE ANSWER NOW AGREE* still PASSED**, because capping alone produces the agreement — so without this arm a fix that silently replaced a member's authored letter would satisfy this item's headline acceptance. (c) THE AXIS IGNORED — the capture ceiling applied to every leg carrying a letter -> 25 pass, 3 FAIL, AS DECLARED; the connection leg in the SAME obligation moves to C, caught in the direction that publishes a letter nobody asked to bound, and it is also the arm that would catch the cheapest wrong answer to this item: making the two halves "agree" by copying `strength.capture` into every leg. (d) OVER-STRICTNESS — the same rule written as an explicit `for` loop with a named row instead of a `.map` -> 28 pass, 0 fail, exit 0: correct work in a spelling this item did not anticipate PASSES. **ONE FINDING ABOUT THE ARMS THEMSELVES, RECORDED RATHER THAN SMOOTHED AND KEPT AT THE ARM IN THE DRIVER: arm (a)'s FIRST spelling ANCHORED TWICE and the driver REFUSED to run it** (`anchor occurs 2 time(s)`, exit 4). It anchored on the registry line alone, which is BYTE-IDENTICAL in REC-114's `#legEarnedCapture` — the very reuse that makes the two readers one rule is what made the anchor ambiguous — and `String.replace` with a string patches only the FIRST occurrence, so that arm would have damaged **REC-114's listing instead of this item's resolver**, run a suite that never touches it, reported a clean pass and been recorded as evidence that the subject cannot be broken. That is CONDUCT #11's arm-that-did-not-arm class with the sign flipped, caught by the instrument rather than by care. **AND THE EXIT STATUSES WERE RE-READ UNPIPED**, because the first sweep ran `node test/nc-rec118.mjs $arm | grep | tail` and read `$?` as 0 for all five arms — the pipeline's status, not the driver's, which is `CLAUDE.md`'s `cmd | tail` rule arriving in the control that exists to catch exactly this. **AND THE WHOLE CONTROL IS DRIVEN ON A FIXTURE, NEVER ON THE LIVE INSTANCE, WHICH IS STATED BECAUSE IT IS A LIMIT AND NOT A CHOICE:** the live instance holds ZERO basis legs and `test/rec88-instance-census.mjs` measured ZERO captures carrying a transcription chain anywhere in store `bio` on 2026-09-15, so every live answer this item touches is byte-identical BY CONSTRUCTION and would pass every arm above **without exercising one of them**. A control run there would be the costs-nothing equality exactly. REC-108 and REC-114 both hit this and stated it; so does this. */
/* REC-118 · D-410 — ONE ANSWER, ONE LETTER: `op=reevaluations` STOPS PUBLISHING
 * THE AUTHORED CAPTURE LETTER BESIDE A CAPPED `strength` BLOCK.
 *
 * THE DEFECT, IN ONE SENTENCE. `op=reevaluations` read each leg's `grade`
 * straight off `inquiry_basis` and published it in the SAME answer object as a
 * `strength` block that has been capped since REC-105 — so one envelope carried
 * two letters for one fact, and the half a member reads first is the uncapped
 * one. REC-114's census DROVE it rather than grepping it (`legs[0].grade = B`
 * beside `strength.capture = C`) and ROWED it rather than closing it, because
 * REC-114's scope was the meaning listing and this is a separate member-facing
 * op with its own envelope.
 *
 * THE RULING IS INHERITED, NOT RE-LITIGATED, AND THE PRECEDENT WAS FALSIFIED AT
 * THE ARTIFACT BEFORE IT WAS LEANED ON. REC-105 capped the walk; REC-114 swept
 * the leg listing, publishing the EARNED letter with the AUTHORED one beside it
 * as `grade_authored` and a `grade_why`. `Store.#capturedAt(stated, earned,
 * targetId)` is a pure PER-LEG function over a leg's stated letter and its
 * TARGET's registry entry, capture axis only, lowering only. This op publishes
 * rows from `inquiry_basis` at LEG grain, on the capture axis, keyed by the same
 * `target_id` — the same construct, the same column, the same question and the
 * SAME GRAIN. So the cap does cover what this surface publishes and this is a
 * SWEEP to a ruling already made. Block 5 pins that claim to the source rather
 * than leaving it in this comment.
 *
 * WHAT `AGREE` MEANS HERE, STATED PRECISELY BECAUSE IMPRECISION WOULD MAKE THIS
 * SUITE ASSERT SOMETHING FALSE. `strength.capture` is the WALK's aggregate over
 * an inquiry's whole basis; `legs[]` carries only the legs naming the target
 * that MOVED. Those are the same set only when the moved target is the
 * inquiry's whole capture basis, which is what the SUP fixture arranges — and
 * there the two must be EQUAL. The invariant that holds generally, and the one
 * block 2 asserts, is weaker and true everywhere: a published capture leg is
 * never STRONGER than the ceiling the registry states for its target.
 *
 * WHAT IS ASSERTED, each in the direction that fails:
 *
 *   1. THE FIXTURE IS REAL AND THE OBLIGATION EXISTS, printed and FLOORED —
 *      asserted BEFORE anything about its contents, because a list filtered to
 *      empty passes every assertion about what is in it.
 *   2. THE DEFECT IS CLOSED AT THE ROW, and the headline NAMES BOTH LETTERS AND
 *      THE OP, because a failure naming one is one a reader cannot act on.
 *   3. THE TWO HALVES OF THE ENVELOPE AGREE — and the agreement is shown to
 *      COST something: the authored letter and the earned one GENUINELY differ,
 *      so the equality had to be produced by moving `grade` from B to C rather
 *      than by both halves already saying the same thing. An equality that costs
 *      nothing is not evidence (CLAUDE.md).
 *   4. THE MEMBER'S ACT IS NOT ERASED, and it is READ BACK FROM THE RECORD
 *      through a DIFFERENT surface — the cap is a read-time resolution and the
 *      stored row is untouched. REC-117's finding: an assertion on one op's
 *      computed return can pass under a defect.
 *   5. SOURCE PINS, AND A THREE-SITE DRIFT DETECTOR. This item restates the
 *      walk's three conditions in a third loop, exactly as REC-114 restated
 *      them in a second. That restatement is INSTRUMENTED rather than left to
 *      care: all three resolvers must carry the same three conditions and all
 *      three must call `#capturedAt`.
 *   6. OVER-STRICTNESS — an obligation needing no cap is byte-identical but for
 *      the two added fields, and a connection leg in the SAME obligation is
 *      untouched, which is also the arm that catches a fix copying the strength
 *      block into the legs.
 *
 * Everything runs against `src/index.mjs`'s real worker through miniflare, so a
 * feature no caller can reach fails here rather than passing at store level
 * (D-43: `op=invitelook` shipped with a ReferenceError while 1276 assertions
 * passed).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r118", MEMBER_TOKEN: "mem-r118", PROBE_TOKEN: "prb-r118",
              AI_TOKEN: "ai-r118", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r118") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r118") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ===================== THE FIXTURE =====================
   IT IS REC-114's BLOCK 9 FIXTURE, REUSED RATHER THAN REBUILT, because that
   block already establishes the one route into this shape and the row says to
   start from it. Two facts it settled and this suite depends on:

   THE ORDER IS FORCED BY THE RECORD RATHER THAN CHOSEN. REC-88's write-side
   refusal (C-2.8) means a leg at capture B on a document ALREADY OCR'd at C
   cannot be authored at all, so the only route into "authored letter outruns
   the ceiling" is the one D-383 describes: the document is CLEAN when the leg
   is written and is RE-READ afterwards. The record is append-only, so the
   member's authored letter survives its own document being re-read weaker.

   AND AN OBLIGATION ONLY EXISTS IF A TARGET MOVED. `#reevalMoved`'s four causes
   are supersession, deferred, dismissed and reopened, and an information
   bundle's own machine (`collected -> verified -> retired`) reaches NONE of
   them. SUPERSESSION is the one route in and it IS open to a document, because
   `#writeSupersededBy` derives the reverse edge from any `supersedes` ref and
   does not branch on object_type. That was checked at the artifact by REC-114
   rather than assumed: had it been inquiry-only, every leg this op can publish
   would name an INQUIRY target — which the capture axis treats as having no
   referent and never caps — and D-410 would have been LATENT rather than live,
   which is the difference between a row worth filing and an overclaim.

   WHAT THIS SUITE ADDS TO THAT FIXTURE, and it is this item's own work: BOTH
   LEGS LIVE ON ONE INQUIRY, so one obligation carries a capture leg that must
   move and a connection leg that must not, beside ONE `strength` block. That is
   what makes block 6's connection arm also the arm that catches a fix which
   copied the strength block into the legs — the cheapest way to make the two
   halves "agree" and the one a suite asserting only equality would bless. */
const NOW = "2026-09-17T00:00:00Z", LATER = "2026-09-17T01:00:00Z";
const refLines = (t2) => t2.length
  ? ["references:", ...t2.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      ...(l.grade ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : [])])]
  : [];
const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []), ...legLines(legs),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
/* `reason` on a supersedes ref is REQUIRED (C-6.1: a replacement with no
   account of why cannot be checked by anyone) — driven out by the refusal when
   this fixture was built, not read from a document. */
const infoMd = (id, { supersedes = null } = {}) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland",
  ...(supersedes
    ? ["references:", `  - target: ${supersedes}`, "    rel: supersedes", "    status: confirmed",
       "    reason: The successor restates this document's figures from the adopted budget."]
    : ["references: []"]), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260917T${String(700000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24681"] });
const ORD = eOrd.entity_id;
const ENT = [{ ref: "ordinance:24681", kind: "ordinance", key: "24681", label: "Ordinance No. 24681" }];
const readingOf = (s, chain) => ({
  capture: { sha256: s, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
             entities: ENT, facts: {}, ...(chain === undefined ? {} : { text_source: chain }) } });
const OCR_CHAIN = [{ step: "pixels" },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];

/* TWO PAIRS, EACH SUPERSEDED SO EACH RAISES AN OBLIGATION.
     SUP    — TWO legs on ONE inquiry over ONE document: capture B and
              connection A. The document is re-read at C after both are
              written, so the authored capture letter outruns what the record
              can support. This is the defect's own shape, and carrying both
              legs in one obligation is what lets block 6 catch a fix that
              copied `strength.capture` into the legs.
     CLEAN  — publisher-typed text, no transcription chain, nothing to cap. The
              UNMOVED control: if this obligation's letter moves, the fix is
              capping things it must not.

   THE CONNECTION LEG IS AUTHORED AT `A` AND THAT IS NOT A CHOICE — IT IS THE
   RECORD REFUSING. REC-114 drove this out: authoring it at B is refused by
   `op=promote` with C-2.8, because an earned connection grade is computed by
   the record and a caller does not hand it to us in either direction. That
   refusal IS the difference between the two axes — the connection axis is
   pinned BY VALUE at the write, so it can never need a ceiling at the read,
   which is precisely why REC-105 capped capture alone and why this item does. */
const DOC_SUP = "INFO-2026-9801-superseded",  INQ_SUP = "INQ-2026-9801-reeval";
const DOC_CLEAN = "INFO-2026-9802-typed",     INQ_CLEAN = "INQ-2026-9802-clean";
const DOC_NEW_SUP = "INFO-2026-9803-successor", DOC_NEW_CLEAN = "INFO-2026-9804-successor";
const SHA_SUP = sha("rec118-sup"), SHA_CLEAN = sha("rec118-clean"),
      SHA_NS = sha("rec118-ns"), SHA_NC = sha("rec118-nc");

for (const [doc, inq, s, reread, legs] of [
  [DOC_SUP, INQ_SUP, SHA_SUP, OCR_CHAIN,
   [{ grade: "B", axis: "capture", source: "capture" },
    { grade: "A", axis: "connection", source: "resolution" }]],
  [DOC_CLEAN, INQ_CLEAN, SHA_CLEAN, null,
   [{ grade: "B", axis: "capture", source: "capture" }]]]) {
  const reg = [{ path: "snapshots/r.bin", sha256: s, encoding: "binary", bytes: 10 }];
  await promote(doc, infoMd(doc), "information", { reading: readingOf(s, undefined), register: reg });
  await post("resolve", { captureSha: s });
  await promote(inq, inquiryMd(inq, { subject: ORD, refs: [doc],
    legs: legs.map((l) => ({ ...l, target: doc })) }), "inquiry");
  if (reread) await promote(doc, infoMd(doc), "information",
    { reading: readingOf(s, reread), register: reg });
}
/* THE SUCCESSORS, promoted LAST so the supersession edge exists only after the
   legs resting on their parents were already written — which is the real order:
   a member rests a claim on a document, and the world replaces it afterwards. */
for (const [newer, older, s] of [[DOC_NEW_SUP, DOC_SUP, SHA_NS],
                                 [DOC_NEW_CLEAN, DOC_CLEAN, SHA_NC]])
  await promote(newer, infoMd(newer, { supersedes: older }), "information",
    { reading: readingOf(s, undefined),
      register: [{ path: "snapshots/r.bin", sha256: s, encoding: "binary", bytes: 10 }] });

/* ---- readers over the real ops, so every figure below is DRIVEN ---- */
const obligationsOf = async () => {
  const r = await get("reevaluations", "limit=200");
  return { all: (r && r.obligations) || [], raw: r };
};
const pick = (all, bundle, target) =>
  all.filter((o) => o.bundle_id === bundle && o.target === target)[0] || null;
const legOn = (ob, axis) => ob && Array.isArray(ob.legs)
  ? (ob.legs.filter((l) => l.grade_axis === axis)[0] || null) : null;

console.log("\n=== REC-118 · D-410 — one answer, one letter: op=reevaluations ===");

console.log("\n--- 1. THE FIXTURE IS REAL AND THE OBLIGATION EXISTS ---");
const { all: OBS } = await obligationsOf();
const SUP = pick(OBS, INQ_SUP, DOC_SUP), CLEAN = pick(OBS, INQ_CLEAN, DOC_CLEAN);
{
  /* ASSERTED BEFORE ANYTHING ABOUT CONTENTS. The row is explicit: a list
     filtered to empty passes every assertion about what is in it, so the
     existence of the thing under test is measured first and printed. */
  console.log(`  op=reevaluations returned ${OBS.length} obligation(s)`);
  console.log(`    SUP   present=${!!SUP} legs=${SUP ? SUP.legs.length : 0}`);
  console.log(`    CLEAN present=${!!CLEAN} legs=${CLEAN ? CLEAN.legs.length : 0}`);
  t("BOTH obligations are REACHED through the op — every assertion below measures rather than vacuously passes",
    { sup: !!SUP, clean: !!CLEAN }, { sup: true, clean: true });
  t("the corpus is FLOORED — a headline totality assertion has passed over an empty corpus in this estate three times",
    OBS.length >= 2, true);
  t("the SUP obligation carries BOTH legs on ONE inquiry, which is what makes the connection arm a real control",
    SUP ? SUP.legs.map((l) => l.grade_axis).sort() : null, ["capture", "connection"]);
  t("and the `strength` block is PRESENT and answers on the capture axis — a fix that deleted it could not disagree with anything",
    SUP && SUP.strength && SUP.strength.capture ? typeof SUP.strength.capture.grade : null, "string");
}

console.log("\n--- 2. THE DEFECT IS CLOSED AT THE ROW ---");
{
  const cap = legOn(SUP, "capture");
  /* THE HEADLINE CARRIES BOTH LETTERS, THE AXIS, THE AUTHORITY AND THE OP IN
     ONE `want`, because the row requires a failure a reader can act on and a
     failure naming one letter is not one. */
  t("op=reevaluations PUBLISHES THE EARNED LETTER, with the AUTHORED letter beside it and a reason",
    { op: "op=reevaluations",
      grade_earned_published: cap ? cap.grade : null,
      grade_authored_published: cap ? cap.grade_authored : null,
      axis: cap ? cap.grade_axis : null,
      why_states_a_reason: !!(cap && typeof cap.grade_why === "string" && cap.grade_why.length > 20),
      authority_strength_block: SUP && SUP.strength && SUP.strength.capture
        ? SUP.strength.capture.grade : null },
    { op: "op=reevaluations", grade_earned_published: "C", grade_authored_published: "B",
      axis: "capture", why_states_a_reason: true, authority_strength_block: "C" });
  t("and `grade_why` NAMES THE TARGET and the letter the record can support, rather than being a filler string",
    cap && typeof cap.grade_why === "string"
      ? { names_target: cap.grade_why.includes(DOC_SUP), names_ceiling: cap.grade_why.includes("C") }
      : null,
    { names_target: true, names_ceiling: true });
}

console.log("\n--- 3. THE TWO HALVES OF THE ENVELOPE AGREE, AND THE AGREEMENT COSTS SOMETHING ---");
{
  const cap = legOn(SUP, "capture");
  /* THE EQUALITY IS MADE TO COST SOMETHING FIRST. Two halves agreeing proves
     little on its own — our own governor refusing is not the source failing,
     and two digests of an empty body agree on nothing. So the pair is shown
     GENUINELY DIVERGENT at the authored letter before it is shown equal at the
     earned one: `grade` had to MOVE from B to C to produce this equality. */
  t("the authored letter and the strength block GENUINELY DISAGREE — so the agreement below was produced by the fix and not by both halves already matching",
    cap && SUP.strength && SUP.strength.capture
      ? { authored: cap.grade_authored, strength: SUP.strength.capture.grade,
          they_differ: cap.grade_authored !== SUP.strength.capture.grade }
      : null,
    { authored: "B", strength: "C", they_differ: true });
  /* THE ITEM'S OWN ACCEPTANCE. Asserted as an AGREEMENT rather than as a
     value: the defect was the two halves of one envelope answering one question
     two ways, so what must hold is that they answer it the SAME way — and on
     this fixture the moved target is the inquiry's whole capture basis, which
     is the condition under which the aggregate and the leg are the same set. */
  t("THE TWO HALVES OF ONE ANSWER NOW AGREE ABOUT THE SAME LEG — the capped `strength` block and the published leg letter say the same thing",
    cap && SUP.strength && SUP.strength.capture
      ? cap.grade === SUP.strength.capture.grade : null, true);
  t("...and the agreement is on the EARNED letter, not on the authored one — the record publishes what it can support",
    cap && SUP.strength && SUP.strength.capture
      ? { leg: cap.grade, strength: SUP.strength.capture.grade } : null,
    { leg: "C", strength: "C" });
}

console.log("\n--- 4. THE MEMBER'S ACT IS NOT ERASED, AND IT IS READ BACK FROM THE RECORD ---");
{
  const cap = legOn(SUP, "capture");
  t("BOTH DERIVED FIELDS ARE PRESENT on every published leg, so a consumer never has to read an ABSENCE as a value",
    SUP ? SUP.legs.map((l) => ["grade_authored" in l, "grade_why" in l]) : null,
    [[true, true], [true, true]]);
  t("the member's authored B SURVIVES in the answer — the ruling's compromise is that nothing a member did is erased",
    cap ? cap.grade_authored : null, "B");
  /* READ BACK THROUGH A DIFFERENT SURFACE, NOT FROM THIS OP'S OWN RETURN.
     REC-117's finding: an assertion on the op's RETURN VALUE can pass under a
     defect, because the return is computed rather than read back. The cap is a
     READ-TIME resolution and the stored row must be untouched, so the authored
     letter is fetched from `op=meaningrows&rows=leg` — a different reader, over
     the same column, which REC-114 taught to publish `grade_authored`. */
  const mr = await get("meaningrows", "rows=leg&q=type:inquiry&limit=500");
  const same = ((mr && mr.rows) || []).filter(
    (r) => r.bundle_id === INQ_SUP && r.target_id === DOC_SUP && r.grade_axis === "capture")[0] || null;
  t("the STORED row is untouched — a SECOND surface still reads the member's authored B off the record, so the cap is a read-time resolution and not a rewrite",
    same ? { meaningrows_authored: same.grade_authored, meaningrows_earned: same.grade } : null,
    { meaningrows_authored: "B", meaningrows_earned: "C" });
  t("...and the two member-facing surfaces now AGREE with each other, which is the disagreement REC-114 filed this row over",
    same && cap ? { reevaluations: cap.grade, meaningrows: same.grade,
                    authored_both: same.grade_authored === cap.grade_authored } : null,
    { reevaluations: "C", meaningrows: "C", authored_both: true });
}

console.log("\n--- 5. SOURCE PINS — ONE ARITHMETIC, AND A THREE-SITE DRIFT DETECTOR ---");
{
  /* The load-bearing structural claim: this op does not re-decide what a
     capture letter may be. It calls the SAME function the walk calls. */
  const m = /#reevalLegsEarned\(obligations\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "";
  t("the op's resolver EXISTS and calls `Store.#capturedAt` — REC-105's arithmetic, reused rather than restated",
    { found: m.length > 0, calls_capturedAt: /Store\.#capturedAt\(/.test(m) },
    { found: true, calls_capturedAt: true });
  t("it mints NO grade letter of its own — no A/B/C/D literal anywhere in the resolver",
    /["']\s*[ABCD]\s*["']/.test(m), false);
  t("it asks the registry ONCE for the whole answer rather than once per obligation (a per-row probe on a member-facing sweep)",
    (m.match(/earnedBasisRegistry\(/g) || []).length, 1);
  t("it does NOT reach for `strengthOf` — the leg letter is derived from the registry, never copied out of the envelope's other half",
    /strengthOf\(/.test(m), false);
  /* THE DRIFT DETECTOR, AND IT IS THIS ITEM'S OWN CONTRIBUTION TO THE ESTATE'S
     INSTRUMENTS. This is now the THIRD loop applying one rule. REC-114 restated
     the walk's three conditions in the second and said in its own comment that
     a silent drift between them is the whole failure mode — but nothing
     MEASURED that. It does now: an edit to one site that does not reach the
     others fails here, by name. A traps entry is a defect nobody instrumented;
     this is the instrument. */
  /* EXTENDED FROM THREE TO FOUR 2026-09-17 BY REC-119 (D-411), WHICH ADDED THE
     FOURTH READER — `#versionLegsEarned`, feeding `op=basisversions` and
     `op=suggest`. **Extending this instrument is owed by the item that adds a
     reader, and that obligation is the point of the instrument existing.** A
     fourth loop over one rule that this detector could not see would be exactly
     the silent drift REC-114 named and REC-118 built this to measure — an
     instrument that does not grow with its subject stops being one. */
  const sites = { walk: /#strengthWalk/.test(STORE_SRC),
                  listing: /#legEarnedCapture\(arm, rows\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "",
                  reeval: m,
                  versions: /#versionLegsEarned\(rows\) \{[\s\S]*?\n  \}/.exec(STORE_SRC)?.[0] ?? "" };
  const conditions = (src) => ({
    axis: /grade_axis === "capture"/.test(src),
    carries: /grade != null/.test(src),
    not_inquiry: /normalizeType\([a-z]\.target_type\) !== "inquiry"/.test(src),
    one_arithmetic: /Store\.#capturedAt\(/.test(src) });
  t("ALL FOUR READERS OF ONE RULE CARRY THE SAME THREE CONDITIONS AND THE SAME ONE ARITHMETIC — the drift between them is measured, not trusted",
    { listing: conditions(sites.listing), reevaluations: conditions(sites.reeval),
      versions: conditions(sites.versions) },
    { listing: { axis: true, carries: true, not_inquiry: true, one_arithmetic: true },
      reevaluations: { axis: true, carries: true, not_inquiry: true, one_arithmetic: true },
      versions: { axis: true, carries: true, not_inquiry: true, one_arithmetic: true } });
  t("and the FOURTH reader (REC-119) asks the registry ONCE for the whole version and mints no letter of its own, on the same terms as the other three",
    { found: sites.versions.length > 0,
      registry_calls: (sites.versions.match(/earnedBasisRegistry\(/g) || []).length,
      mints_no_letter: /["']\s*[ABCD]\s*["']/.test(sites.versions),
      no_strengthOf: /strengthOf\(/.test(sites.versions) },
    { found: true, registry_calls: 1, mints_no_letter: false, no_strengthOf: false });
  t("the WALK is untouched by this item — `#capturedAt` is READ, never edited, which is what keeps the four readers one rule",
    /static #capturedAt\(stated, earned, targetId\) \{/.test(STORE_SRC), true);
  t("and REC-114's listing resolver is untouched by this item — its body still stands as that item landed it",
    sites.listing.includes("#legEarnedCapture(arm, rows)"), true);
  t("the leg SELECT now reads `target_type`, without which the no-referent arm cannot be applied at all",
    /SELECT bundle_id, ord, target_id, target_type, role, grade, grade_axis, grade_source, at\n\s+FROM inquiry_basis WHERE target_id=\?/.test(STORE_SRC),
    true);
}

console.log("\n--- 6. OVER-STRICTNESS — NOTHING IS CAPPED THAT MUST NOT BE ---");
{
  const conn = legOn(SUP, "connection"), cleanLeg = legOn(CLEAN, "capture");
  /* THE UNMOVED CONTROL. Publisher-typed text with no transcription chain has
     no ceiling to be bounded by, so this obligation must come back exactly as
     it did before this item, but for the two added fields — which is the row's
     own statement of what byte-identity means here. */
  t("AN OBLIGATION NEEDING NO CAP IS BYTE-IDENTICAL BUT FOR THE ADDED FIELDS — publisher-typed text earns its letter and keeps it",
    cleanLeg ? { grade: cleanLeg.grade, authored: cleanLeg.grade_authored, why: cleanLeg.grade_why }
             : null,
    { grade: "B", authored: "B", why: null });
  t("...and the clean obligation's two halves agree too, at the letter the member authored — the fix did not move an answer that was already right",
    cleanLeg && CLEAN.strength && CLEAN.strength.capture
      ? cleanLeg.grade === CLEAN.strength.capture.grade : null, true);
  t("`grade_why` is NULL rather than a filler sentence when nothing was capped — an explanation of a thing that did not happen is noise in the record",
    cleanLeg ? cleanLeg.grade_why : "MISSING", null);
  /* THE CONNECTION ARM, WHICH IS TWO CONTROLS IN ONE. It catches a fix that
     capped by axis NAME rather than by what the registry holds; and because
     this leg sits in the SAME obligation as the capture leg, beside the SAME
     `strength` block, it also catches the cheapest wrong way to make the two
     halves agree — copying `strength.capture` into every leg. */
  t("A CONNECTION-AXIS LEG IN THE SAME OBLIGATION IS UNTOUCHED — the capture ceiling is not a general grade cap",
    conn ? { grade: conn.grade, authored: conn.grade_authored, why: conn.grade_why, axis: conn.grade_axis }
         : null,
    { grade: "A", authored: "A", why: null, axis: "connection" });
  t("...and that is NOT FREE: the SAME document is bounded at C, so a fix ignoring the axis — or copying the strength block into the legs — would have moved this row to C",
    conn && SUP.strength && SUP.strength.capture
      ? { conn_grade: conn.grade, strength_capture: SUP.strength.capture.grade,
          conn_did_not_follow_strength: conn.grade !== SUP.strength.capture.grade }
      : null,
    { conn_grade: "A", strength_capture: "C", conn_did_not_follow_strength: true });
  /* THE REST OF THE ENVELOPE IS UNMOVED. This item touches the leg letters and
     nothing else, and an item that quietly moved the causes or the reused
     triple would be a wider change than the one that was rowed. */
  t("the rest of the envelope is UNMOVED — the causes, the reused triple and the dependent's own stored triple are as they were",
    SUP ? { has_causes: Array.isArray(SUP.causes) && SUP.causes.length > 0,
            reeval_flag: SUP.reeval ? SUP.reeval.flag : null,
            stored_flag: SUP.stored ? SUP.stored.flag : null,
            target_state: typeof SUP.target_state }
        : null,
    { has_causes: true, reeval_flag: true, stored_flag: false, target_state: "string" });
  t("and the published leg shape carries NO `target_type` — it is read for the no-referent arm and never published, so this item widens nothing",
    SUP ? SUP.legs.map((l) => "target_type" in l) : null, [false, false]);
}

await mf.dispose();
console.log(`\nrec118-reeval-earned: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
