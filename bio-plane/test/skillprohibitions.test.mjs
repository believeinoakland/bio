/* NEGATIVE CONTROL: SEVEN arms, RUN 2026-08-10 by the SK-3 worker (worktree agent-ab590a192167d2ca3) from `test/skillprohibitions.control.mjs`, committed beside this file so the next session re-runs them in one step instead of re-deriving how to break the subject. Every restore verified BY CONTENT as well as by sha256. Seven arms run, 0 WRONG. TO RE-RUN IT IN ONE STEP: `node test/skillprohibitions.control.mjs` from `bio-plane/`.
   (0) BASELINE, clean tree: 30 pass, 0 fail.
   (1) **THE ROW'S OWN, AND THE ITEM'S POINT — NEUTER PL-3's BOILERPLATE PREDICATE.** `isBoilerplate` answers false for everything, in `checks/bio-checks.mjs`, and NOT ONE WORD OF THE SKILL CHANGES -> 28 pass, 2 FAIL: ARM D1 (the placeholder is no longer refused by C-27.12) and ARM D4 (the predicate no longer fires on its own roster). **ELEVEN SKILL-SIDE ARMS WERE NAMED AND ALL ELEVEN STAYED GREEN — A1, A2, A5, B1, C1, C2, C3, C5, D5, E1, E2 — while the fence was gone.** The prohibition is still present, still verbatim, still cites C-27.12, and still refuses nothing, which is what it was always doing. **That asymmetry IS the row's proof: what refuses placeholder text is the C-number and not this text.** The harness asserts the green side rather than observing it (`mustStayGreen`), because an asymmetry nobody stated is an asymmetry nobody measured.
   (2) THE SAME FENCE BROKEN AT THE CALL SITE INSTEAD OF THE PREDICATE. The suggest endpoint in `src/store.mjs` stops asking about `description`; the predicate is untouched -> 29 pass, 1 FAIL: ARM D1 alone, with ARM D4 correctly ABSORBED. Both halves of one fence are armed because a check and its call site fail differently, and only the OP can see this one — a unit test of the predicate would have reported it clean.
   (3) A PROHIBITION DROPPED — the connection-density one, because the prohibition with NO code behind it is the one a careless edit loses most quietly -> 26 pass, 4 FAIL: ARM A1, ARM A4, ARM A5 and ARM C6. **THE DECLARATION SAID THREE AND THE RUN MEASURED FOUR, AND THE EXTRA ONE IS KEPT RATHER THAN SMOOTHED**: A4 counts the survey-sourced prohibitions against the design-sourced one, so a drop moves it too — a second, independent hold on the set's size that the declaration had not noticed. **THIS ARM IS WHY ARM A5 PARSES THE DESIGN DOCUMENT.** A5 was first written as *"every prohibition's `also_named_in` appears in the design"*, which is BLIND TO A DROP BY CONSTRUCTION — the expectation was derived from the very array under test, so removing a prohibition removed its own expectation and both sides moved together. That is the equality-that-costs-nothing shape SK-2's arm (5) found inside its own suite, found here the same way: by running the control.
   (4) A PROHIBITION PARAPHRASED. One word of the fabricated-attribution sentence changed — 'fabricated' to 'invented' — leaving it true, readable and no longer the survey's -> 29 pass, 1 FAIL: ARM A2. **This is the arm that makes "VERBATIM" a measurement**: nothing else in this suite can see a paraphrase, and a reviewer re-reading the sentence would have agreed with it.
   (5) THE ONE PERMISSION WIDENED — the carve-out to prohibition 1 rewritten to permit connective wording between a member's own excerpts -> 29 pass, 1 FAIL: ARM A6. It still reads like a rule and it now re-admits exactly what prohibition 1 forbids. The survey's line is *"never generates new ones"*, and a permission that drifts past it is where a widening is least visible, because a widened permission still reads as a rule.
   (6) A GATE WRITTEN INTO A PROHIBITION. A pass budget and a stopping rule written into the connection-density prohibition's `in_practice` -> 29 pass, 1 FAIL: ARM B1. §14b.4 does not exempt a prohibition from the rule that a skill may never hold a gate. This arm also holds the REUSE: the scanner that catches it is SK-2's export, so a second scanner written here would have been measuring its own opinion.
   (7) THE INSTRUMENT ITSELF. Neuter `controlFlowAuthority` so it matches nothing, prohibitions untouched -> 29 pass, 1 FAIL: ARM B2, while **ARM B1 passes VACUOUSLY over a scan that reads nothing** — the shape of every walk that has gone blind while reporting green, and the reason B1's silence is only worth something with B2 beside it. */
/* SK-3 — THE PRACTICE-SURVEY PROHIBITION SET. THE SUITE.
 *
 * `IS-BUILD-PLAN.md` SK-3; `PRACTICE-SURVEY.md`'s DELIBERATELY VIOLATE list and
 * its §1 collision; `docs/archive/IS-SWEEP-2026-08-07.md` §3;
 * `INVESTIGATIVE-SESSION.md` §14b.4 and §14b.5. The subject is the
 * `PROHIBITIONS` half of `src/skilldoctrine.mjs`, merged into SK-1's pack by
 * `src/skillpack.mjs`.
 *
 * WHAT THIS SUITE IS FOR, IN ONE SENTENCE. The row's accepts-when is *"the five
 * prohibitions present VERBATIM; PL-3's boilerplate check demonstrated as the
 * code half of the fifth"*, and BOTH halves of that are things a session cannot
 * verify by re-reading its own work. So the verbatim half is a LOOKUP in the
 * documents the sentences came from, and the code half is DRIVEN THROUGH THE OP.
 *
 * THE ASYMMETRY IS THE DELIVERABLE, and BLOCK D is built to make it a
 * measurement rather than a claim. The row's negative control reads: *"submit a
 * version whose description is placeholder text through PL-3 → refused by
 * C-number while the skill-only path would have passed it."* Stated that way it
 * is nearly unfalsifiable — of course a text file refuses nothing — so BLOCK D
 * asserts it as a DISCRIMINATION instead:
 *
 *   - the SKILL-ONLY path answers IDENTICALLY for a placeholder description and
 *     for a real one. Its answer costs nothing to produce and is therefore worth
 *     nothing, which is `CLAUDE.md`'s own rule turned on this project's own
 *     doctrine layer.
 *   - the CODE path answers DIFFERENTLY for the same two inputs, by C-number.
 *
 * Both directions run on both inputs through the same two functions. An arm that
 * only showed the placeholder being refused would not have shown that the op
 * discriminates rather than refusing everything, and an arm that only showed the
 * skill staying silent would have proved nothing at all.
 *
 * FOUR RULES KEPT THROUGHOUT, each of which has cost this project real time:
 *
 *   - SETS ARE DRIVEN OR IMPORTED, NEVER TYPED. The C-numbers are read off
 *     catalogue rows by key; the boilerplate roster and its predicate are
 *     IMPORTED from `PL-3`'s catalogue and never re-typed; the prohibition
 *     sentences are looked up in the documents they were copied from.
 *   - THE REAL PATH AND THE MUTATED PATH GO THROUGH ONE FUNCTION.
 *     `controlFlowAuthority` is SK-2's export, reused rather than reimplemented,
 *     and it is run on the real prohibitions AND on a fixture that must trip it.
 *   - THE FIFTH PROHIBITION'S CODE HALF IS CITED, NEVER REBUILT. This suite
 *     imports `isBoilerplate` and drives `op=suggest`; nothing here reimplements
 *     the membership test, because IS-6's C-22.4 control left a suite green at
 *     98 of 98 when one rule had two implementations.
 *   - EVERY WALK PRINTS ITS CORPUS SIZE, and states what it cannot see.
 *
 * DRIVEN THROUGH THE CONTROL PLANE (D-43): `op=suggest` is reached with its
 * literal written out so `scripts/coverage.mjs` credits it.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import "./stdio.mjs";   /* D-282: a suite's own exit must not discard the suite's own output */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import * as CATALOGUE from "../checks/bio-checks.mjs";
import { SUGGEST_CHECKS, MACHINE_FENCE_CHECKS, VERSION_STRENGTH_CHECKS,
         BASIS_VERSION_CHECKS, BOILERPLATE_FORMS, isBoilerplate } from "../checks/bio-checks.mjs";
/* THE ESTATE'S ONE LEXER, IMPORTED AND NOT COPIED. `declared-source.mjs`'s own
   header records why a third reader of this shape would be a defect: *a second
   copy of a rule absorbs the control that was meant to prove the first*. ARM D5
   needs comments blanked — this file's subject is DISCUSSED at length in the
   doctrine module's own comments, so a walk over raw source would read the
   prose about `isBoilerplate` as an implementation of it. */
import { codeOnly } from "../scripts/declared-source.mjs";
import { renderPack, packVersion } from "../src/skillpack.mjs";
import { PROHIBITIONS, PERMITTED_AUTO_COMPOSITION, PROHIBITION_SET_IS_STANDING,
         SURVEY_SOURCE, DESIGN_SOURCE, CLAUSES, controlFlowAuthority, reportsAs,
         judgementLayers } from "../src/skilldoctrine.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const DOCTRINE_SRC = readFileSync(fileURLToPath(new URL("../src/skilldoctrine.mjs", import.meta.url)), "utf8");
const CHECKS_SRC = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");
const DOC = (rel) => readFileSync(fileURLToPath(new URL("../../" + rel, import.meta.url)), "utf8");
const sha = (s) => createHash("sha256").update(s).digest("hex");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sk3", MEMBER_TOKEN: "mem-sk3", PROBE_TOKEN: "prb-sk3",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

/* ---------------------------------------------------------------------------
 *  THE INSTRUMENTS. Each is run on its real subject AND on a fixture that must
 *  trip it — never a parallel implementation that agrees at zero cost.
 * ------------------------------------------------------------------------- */

/** Markdown normalised to one line — SK-1's normaliser, unchanged, so a quoted
 *  prohibition can be looked for in the document it was quoted from. */
function flatten(md) {
  return md.split("\n").map((l) => l.replace(/^[\s>]*[-*]?\s*/, "")).join(" ")
           .replace(/[*_`]/g, "").replace(/\s+/g, " ");
}

/** THE CITATION RESOLVER, SK-2's, one file over: a C-number a prohibition cites
 *  must actually be pushed somewhere in the check catalogue's source. */
function citationResolves(cNumber) {
  if (!/^C-\d+(?:\.\d+)?$/.test(String(cNumber || ""))) return false;
  return CHECKS_SRC.includes(`'${cNumber}'`) || CHECKS_SRC.includes(`"${cNumber}"`);
}

/** THE SKILL-ONLY PATH, AND IT IS A REAL WALK RATHER THAN A STAND-IN FOR ONE.
 *
 *  These are every predicate `src/skilldoctrine.mjs` EXPORTS that takes a piece
 *  of text and returns a verdict about it. If the skill layer refused a
 *  placeholder description anywhere, it would be here — and BLOCK D's ARM D6
 *  holds the other half of that sentence by measuring that the doctrine source
 *  contains no boilerplate predicate and no copy of the roster, so this walk is
 *  not merely looking in the wrong place. */
const SKILL_TEXT_PREDICATES = {
  control_flow_authority: (s) => controlFlowAuthority(s),
  reports_as: (s) => reportsAs(s),
};
function skillOnlyVerdict(description) {
  const out = {};
  for (const [name, fn] of Object.entries(SKILL_TEXT_PREDICATES)) {
    const r = fn(description);
    out[name] = Array.isArray(r) ? r : r;
  }
  /* AND THE RULE ITSELF, which IS present — this is the half that makes the
     asymmetry interesting rather than trivial. The skill says the right thing
     and computes no verdict. */
  const layer = judgementLayers().prohibitions;
  out.the_rule_is_present = layer.body.prohibitions
    .some((p) => p.id === "no-boilerplate-to-clear-a-gate");
  return out;
}

/* A DESCRIPTION THAT IS A PLACEHOLDER, AND ONE THAT IS NOT. Both go through
   BOTH paths. The placeholder is taken FROM `PL-3`'s own imported roster rather
   than typed, so a roster member removed changes this fixture rather than
   leaving it arming a form nothing refuses any more. */
const PLACEHOLDER = BOILERPLATE_FORMS.find((f) => f === "tbd") ?? BOILERPLATE_FORMS[0];
const REAL_DESCRIPTION =
  "Three legs rest on the same transfer schedule and the fourth is ungraded, because the record "
  + "earned nothing for the mirror copy; the reading holds only if the schedule is what the "
  + "minutes authorised.";

const TOK = "mem-sk3";
const NOW = "2026-08-10T09:00:00Z", LATER = "2026-08-10T10:00:00Z";
const LEDGER = "INFO-2026-0810-sk3-ledger";
const INQ = "INQ-2026-0810-sk3-prohibitions";
const RUN = "RUN-2026-0810-sk3";

const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What may this run never write?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Question", "", "What may this run never write?", "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const run = async () => {

/* ------------------------------------------------------------------ fixture */
const add = await POST("op=memberadd&token=adm-sk3",
  { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute", "publish"] });
const en = await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
if (!en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
const lg = await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" });
const RUTH = lg.token;
if (!RUTH) throw new Error(`login: ${JSON.stringify(lg)}`);

const promote = async (id, text, type) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null, snapKey: `${id}-${Math.random().toString(36).slice(2, 8)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
    : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER } });

for (const [id, md, type] of [[LEDGER, infoMd(LEDGER), "information"], [INQ, inquiryMd(INQ), "inquiry"]]) {
  const r = await promote(id, md, type);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 500)}`);
}
const opened = await POST(`op=airunopen&token=${RUTH}`, {
  run: RUN, contextType: "inquiry", contextId: INQ,
  label: "SK-3 fixture — the run every suggestion names", mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
if (opened?.started !== true) throw new Error(`airunopen: ${JSON.stringify(opened)}`);

/* ONE SUBMITTER, so no arm can quietly differ in which parameter it sends. */
const suggest = async (description, name) => POST(`op=suggest&token=${RUTH}`, {
  target: INQ, run: RUN, kind: "basis-version", name, description,
  relationship: "and", grounds: [{ ground: "paper trail" }],
  legs: [{ target: LEDGER, role: "supports", ground: "paper trail" }] });

/* ==========================================================================
   BLOCK A — THE FIVE PROHIBITIONS ARE PRESENT, AND THEY ARE VERBATIM.
   ======================================================================== */
console.log("\nBLOCK A — five prohibitions, looked up in the documents they were copied from");

const survey = DOC(SURVEY_SOURCE), design = DOC(DESIGN_SOURCE);
const surveyFlat = flatten(survey), designFlat = flatten(design);
const pinned = PROHIBITIONS.flatMap((p) => [
  { id: p.id, field: "text", s: p.text, doc: p.source },
  { id: p.id, field: "because", s: p.because, doc: p.source },
  { id: p.id, field: "also_named_in", s: p.also_named_in, doc: DESIGN_SOURCE },
]);
console.log(`  corpus: ${PROHIBITIONS.length} prohibition(s); ${pinned.length} quoted span(s) checked `
          + `against ${SURVEY_SOURCE} (${survey.length} characters) and ${DESIGN_SOURCE} (${design.length})`);
console.log(`  what this instrument CANNOT see: a sentence that is in the document AND wrong for this `
          + `skill, and a prohibition the survey never carried that nobody thought to look for. It `
          + `sees a PARAPHRASE, which is what "verbatim" is exposed to.`);

t("ARM A1: the set is the FIVE the plan names, by id, and no id repeats — a prohibition dropped, "
  + "renamed or duplicated fails here before anything else in this suite means anything",
  [PROHIBITIONS.length, new Set(PROHIBITIONS.map((p) => p.id)).size,
   PROHIBITIONS.map((p) => p.id)],
  [5, 5, ["no-generated-justification", "no-single-confidence-score",
          "no-connection-density-ranking", "machine-proposed-is-never-a-connection",
          "no-boilerplate-to-clear-a-gate"]]);

t("ARM A2 (THE ROW'S ACCEPTS-WHEN — VERBATIM, MEASURED): every quoted span of every prohibition is "
  + "found IN the document it was copied from. A word changed here fails, and a reviewer re-reading "
  + "the sentence could not have told",
  pinned.filter((p) => !(p.doc === SURVEY_SOURCE ? surveyFlat : designFlat).includes(flatten(p.s)))
        .map((p) => `${p.id}.${p.field}`),
  []);

t("ARM A3: THE DOCUMENT SCANNER CAN MISS — the SAME normaliser and search over a sentence that is in "
  + "NEITHER document reports absent, so A2 is a measurement rather than a search that matches "
  + "everything",
  [surveyFlat.includes(flatten("No generated justification except where the member is busy")),
   designFlat.includes(flatten("nothing in it is boilerplate unless the field is optional"))],
  [false, false]);

t("ARM A4: the four survey-sourced prohibitions name PRACTICE-SURVEY as their source and the fifth "
  + "names the DESIGN document — the boilerplate rule is §14b.5's, not the survey's, and pretending "
  + "otherwise would make A2 pass by looking in a file that happens to contain the words",
  [PROHIBITIONS.filter((p) => p.source === SURVEY_SOURCE).map((p) => p.id).length,
   PROHIBITIONS.filter((p) => p.source === DESIGN_SOURCE).map((p) => p.id)],
  [4, ["no-boilerplate-to-clear-a-gate"]]);

/* THE SECOND PIN, AND IT IS A DIFFERENT CLAIM FROM THE FIRST — AND THE FIRST
   WAY IT WAS WRITTEN WAS BLIND, WHICH IS RECORDED HERE RATHER THAN REPAIRED
   QUIETLY.
   A2 says each sentence was copied. This arm has to say the SET is the set the
   design carries. Written as *"every prohibition's `also_named_in` is somewhere
   in the design document"* it could not see a DROP AT ALL: the expected set was
   derived from the very array under test, so removing a prohibition removed its
   own expectation and both sides moved together. That is the
   equality-that-costs-nothing shape SK-2's arm (5) found inside its own suite,
   and it is the shape this project measures most often.
   So the design's own sentence is PARSED — it is semicolon-delimited, which is
   a property of the document and not of this file — and the SEGMENTS are the
   expectation. A prohibition dropped now leaves a parsed segment unclaimed. */
function parseProhibitionSet(flat) {
  const at = flat.indexOf(flatten(PROHIBITION_SET_IS_STANDING));
  if (at < 0) return null;
  const colon = flat.indexOf("): ", at);
  if (colon < 0) return null;
  const end = flat.indexOf(". ", colon);
  if (end < 0) return null;
  const segs = flat.slice(colon + 3, end).split(";").map((s) => s.trim()).filter(Boolean);
  return segs.length ? segs : null;
}
const designSet = parseProhibitionSet(designFlat);
/* The four survey-sourced prohibitions plus the ONE permission — the fifth
   prohibition is §14b.5's bullet and is deliberately not in this sentence, which
   is why A4 holds its source separately. */
const claimants = [...PROHIBITIONS.filter((p) => p.source === SURVEY_SOURCE),
                   PERMITTED_AUTO_COMPOSITION];
const unclaimed = (designSet ?? []).filter((seg) =>
  !claimants.some((c) => seg.includes(flatten(c.also_named_in))));
console.log(`  the design document's own set, PARSED out of its sentence: ${designSet ? designSet.length : 0} `
          + `segment(s) — ${JSON.stringify((designSet ?? []).map((s) => s.slice(0, 46)))}`);

t("ARM A5: the design document's OWN list of this set is PARSED, and every segment of it is claimed "
  + "by a prohibition or by the one permission — so a prohibition dropped from this file leaves a "
  + "segment of the design unclaimed and fails HERE. The expectation is the document's, never this "
  + "array's, because an expectation derived from the subject moves with it and sees nothing",
  [designSet !== null, (designSet ?? []).length, unclaimed,
   claimants.filter((c) => !(designSet ?? []).some((seg) => seg.includes(flatten(c.also_named_in))))
            .map((c) => c.id)],
  [true, 5, [], []]);

t("ARM A5b: THE SENTENCE PARSER CAN SEE A SEGMENT THAT MOVED — the SAME parser over a fixture "
  + "returns its segments, and over a document with no such sentence returns null. Without this, A5 "
  + "would pass over a parser that had gone blind and reported an empty set as fully claimed",
  [parseProhibitionSet(flatten(`${PROHIBITION_SET_IS_STANDING} (SWEEP §3): one thing; and another. Next.`)),
   parseProhibitionSet("no such sentence anywhere in this text")],
  [["one thing", "and another"], null]);

t("ARM A6: THE ONE PERMITTED AUTO-COMPOSITION is present, is exactly one, and every word of it is "
  + "the survey's — the carve-out to prohibition 1 is where a widening would be least visible, "
  + "because a widened permission still reads as a rule",
  [[PERMITTED_AUTO_COMPOSITION.text, PERMITTED_AUTO_COMPOSITION.permitted_because,
    PERMITTED_AUTO_COMPOSITION.the_line, PERMITTED_AUTO_COMPOSITION.and_the_other_side]
     .filter((s) => !surveyFlat.includes(flatten(s))),
   designFlat.includes(flatten(PERMITTED_AUTO_COMPOSITION.also_named_in)),
   Array.isArray(PERMITTED_AUTO_COMPOSITION) ],
  [[], true, false]);

/* ==========================================================================
   BLOCK B — A PROHIBITION IS SKILL TEXT, SO IT HOLDS NO GATE EITHER.
   ======================================================================== */
console.log("\nBLOCK B — no control-flow authority in the prohibition text, MEASURED with SK-2's scanner");

const prohibitionText = PROHIBITIONS
  .flatMap((p) => [p.text, p.because, p.in_practice, p.does_not_reach, p.unenforced_because ?? ""])
  .concat(Object.values(PERMITTED_AUTO_COMPOSITION).filter((v) => typeof v === "string"));
const scannedChars = prohibitionText.join("\n").length;
console.log(`  corpus: ${scannedChars} characters across ${prohibitionText.length} field(s), scanned `
          + `against ${controlFlowAuthority.length >= 0 ? "SK-2's" : ""} exported CONTROL_FLOW_AUTHORITY patterns`);
console.log(`  what this instrument CANNOT see: a bound stated in words no pattern holds. Its limits `
          + `are SK-2's limits exactly, because it IS SK-2's function — reused, not reimplemented.`);

const offenders = PROHIBITIONS
  .map((p) => ({ id: p.id, hits: controlFlowAuthority([p.text, p.because, p.in_practice,
                                                       p.does_not_reach, p.unenforced_because ?? ""].join("\n")) }))
  .filter((x) => x.hits.length);
t("ARM B1 (THE AREA'S GOVERNING CONSTRAINT): no prohibition carries control-flow authority — no "
  + "bound, no termination condition, no decision about either. §14b.4 does not exempt a prohibition "
  + "from the rule that a skill may never hold a gate",
  offenders, []);

const GATE_IN_A_PROHIBITION =
  "Never rank by connectedness. Run at most three passes over the level and stop the search once "
  + "you are satisfied the record has been covered.";
const tripped = controlFlowAuthority(GATE_IN_A_PROHIBITION);
console.log(`  the gate-in-a-prohibition fixture trips: ${JSON.stringify(tripped)}`);
t("ARM B2: THE SCAN CAN FIRE — the SAME exported function over a prohibition with a budget and a "
  + "stopping rule written into it names them, on more than one pattern. Without this arm B1 would "
  + "pass over a scan that had stopped reading",
  [tripped.length >= 3, tripped.includes("self-assessed recall as a stopping rule")], [true, true]);

t("ARM B3: THE SCANNER IS SK-2's OWN EXPORT AND THIS FILE DEFINES NO SECOND ONE — a second scanner "
  + "would be a second implementation of one rule, which is the shape that leaves a control absorbed "
  + "and a suite green",
  [typeof controlFlowAuthority === "function",
   /function\s+controlFlowAuthority/.test(readFileSync(fileURLToPath(import.meta.url), "utf8"))],
  [true, false]);

/* ==========================================================================
   BLOCK C — WHAT EACH PROHIBITION ACTUALLY REFUSES, AND WHAT IT DOES NOT REACH.
   ======================================================================== */
console.log("\nBLOCK C — every prohibition cites code or says it cites none, and every one states its residue");

const citedByProhibitions = [...new Set(PROHIBITIONS.flatMap((p) => p.enforced_by))].sort();
const instructionOnlyP = PROHIBITIONS.filter((p) => p.enforced_by.length === 0);
const instructionOnlyC = CLAUSES.filter((c) => c.enforced_by.length === 0);
const totalItems = CLAUSES.length + PROHIBITIONS.length;
const totalInstructionOnly = instructionOnlyC.length + instructionOnlyP.length;
console.log(`  corpus: ${citedByProhibitions.length} distinct C-number(s) cited by prohibitions: `
          + `${citedByProhibitions.join(", ")}`);
console.log(`  MEASURED — CLAUSES: ${instructionOnlyC.length} of ${CLAUSES.length} are INSTRUCTION ONLY `
          + `(${instructionOnlyC.map((c) => c.id).join(", ")})`);
console.log(`  MEASURED — PROHIBITIONS: ${instructionOnlyP.length} of ${PROHIBITIONS.length} are `
          + `INSTRUCTION ONLY (${instructionOnlyP.map((p) => p.id).join(", ") || "(none)"})`);
console.log(`  MEASURED — THE SKILL AS A WHOLE: ${totalInstructionOnly} of ${totalItems} doctrine items `
          + `carry no code at all. **This is how much of this skill a careless model could ignore, `
          + `published rather than implied** — and it is a FLOOR, because every one of the `
          + `${totalItems - totalInstructionOnly} enforced items states a residue its C-numbers do not `
          + `reach (printed below).`);
for (const p of PROHIBITIONS)
  console.log(`    ${p.id}: enforced by ${p.enforced_by.join(", ") || "NOTHING"} · does not reach: `
            + `${p.does_not_reach.slice(0, 96)}…`);

t("ARM C1: every prohibition either cites code or SAYS it cites none — undetermined is first-class "
  + "and must be STATED, and a prohibition backed by nothing may not read like one backed by a fence",
  PROHIBITIONS.filter((p) => p.enforced_by.length === 0
                          && !(typeof p.unenforced_because === "string" && p.unenforced_because.length > 40))
              .map((p) => p.id),
  []);

t("ARM C2: AND EVERY PROHIBITION STATES WHAT ITS CODE DOES NOT REACH, INCLUDING THE ENFORCED ONES — "
  + "all five of these are enforced partially, and a partial fence read as a whole one is the more "
  + "dangerous error. `isBoilerplate` states its own limit at its own site; a prohibition citing it "
  + "may not inherit its authority without inheriting its limit",
  PROHIBITIONS.filter((p) => !(typeof p.does_not_reach === "string" && p.does_not_reach.length > 40))
              .map((p) => p.id),
  []);

t("ARM C3: every C-number a prohibition cites RESOLVES in the check catalogue — a citation pointing "
  + "at a fence that does not exist is worse than no citation, because it reads as one that does",
  citedByProhibitions.filter((c) => !citationResolves(c)), []);

t("ARM C4: THE CITATION RESOLVER CAN FAIL — the SAME function over a fabricated number and a "
  + "malformed one reports both missing, so C3 is a measurement",
  [citationResolves("C-99.99"), citationResolves("not-a-check"), citationResolves(citedByProhibitions[0])],
  [false, false, true]);

t("ARM C5: the cited numbers are the ones the CATALOGUE holds under those keys — read by key at "
  + "import, so a renumbering fails here rather than leaving a citation that still looks like one",
  [PROHIBITIONS.find((p) => p.id === "no-boilerplate-to-clear-a-gate").enforced_by,
   PROHIBITIONS.find((p) => p.id === "no-single-confidence-score").enforced_by,
   PROHIBITIONS.find((p) => p.id === "machine-proposed-is-never-a-connection").enforced_by.includes(
     SUGGEST_CHECKS.SUGGEST_UNWRITABLE_STATE.check),
   PROHIBITIONS.find((p) => p.id === "no-generated-justification").enforced_by.includes(
     BASIS_VERSION_CHECKS.VERSION_GROUND_UNASSERTED.check),
   PROHIBITIONS.find((p) => p.id === "no-generated-justification").enforced_by.includes(
     MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH.check)],
  [[SUGGEST_CHECKS.SUGGEST_BOILERPLATE.check],
   [VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_COMPOSED.check,
    VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_UNFILTERED.check],
   true, true, true]);

t("ARM C6: exactly ONE prohibition has no code behind it, and it is the connection-density one — "
  + "stated as a fact rather than left for a reader to infer from five citation lists, because "
  + "nothing in this plane computes a degree or a centrality for a fence to sit on",
  instructionOnlyP.map((p) => p.id), ["no-connection-density-ranking"]);

/* ==========================================================================
   BLOCK D — THE ASYMMETRY. PL-3's CHECK IS THE CODE HALF OF THE FIFTH.
   ======================================================================== */
console.log("\nBLOCK D — the same description down two paths: the skill's, and PL-3's");
console.log(`  the placeholder is taken from PL-3's OWN imported roster (${BOILERPLATE_FORMS.length} `
          + `forms), never typed here: ${JSON.stringify(PLACEHOLDER)}`);

const refusedByCode = await suggest(PLACEHOLDER, "filled in to get past the gate");
const landedByCode = await suggest(REAL_DESCRIPTION, "the reading the ledger actually supports");
const skillOnPlaceholder = skillOnlyVerdict(PLACEHOLDER);
const skillOnReal = skillOnlyVerdict(REAL_DESCRIPTION);
console.log(`  CODE PATH   placeholder -> ${JSON.stringify([refusedByCode?.ok, refusedByCode?.code, refusedByCode?.check, refusedByCode?.fields])}`);
console.log(`  CODE PATH   real        -> ${JSON.stringify([landedByCode?.ok, landedByCode?.code ?? null])}`);
console.log(`  SKILL PATH  placeholder -> ${JSON.stringify(skillOnPlaceholder)}`);
console.log(`  SKILL PATH  real        -> ${JSON.stringify(skillOnReal)}`);

t("ARM D1 (THE ROW'S NEGATIVE CONTROL, RUN): a version whose description is placeholder text, "
  + "submitted through PL-3's own endpoint, is REFUSED BY C-NUMBER — `op=suggest` answers not-ok "
  + "with SUGGEST_BOILERPLATE / C-27.12 and names the field. This is the fifth prohibition's code "
  + "half, demonstrated rather than cited",
  [refusedByCode?.ok, refusedByCode?.code, refusedByCode?.check, refusedByCode?.fields],
  [false, "SUGGEST_BOILERPLATE", SUGGEST_CHECKS.SUGGEST_BOILERPLATE.check, ["description"]]);

t("ARM D2: AND THE OP DISCRIMINATES RATHER THAN REFUSING EVERYTHING — the SAME submission with a "
  + "real description LANDS through the same endpoint. Without this, D1 would be satisfied by an "
  + "endpoint that refused all work, which is the outcome-that-costs-nothing shape",
  [landedByCode?.ok, landedByCode?.code ?? null], [true, null]);

t("ARM D3 (THE ASYMMETRY, STATED AS A DISCRIMINATION): the SKILL-ONLY path answers IDENTICALLY for "
  + "the placeholder and for the real description, while the CODE path answers DIFFERENTLY for the "
  + "same two inputs. The skill's answer costs nothing to produce and is therefore worth nothing; "
  + "**the fence is code, and this text is not it**",
  [JSON.stringify(skillOnPlaceholder) === JSON.stringify(skillOnReal),
   JSON.stringify([refusedByCode?.ok, refusedByCode?.code ?? null])
     === JSON.stringify([landedByCode?.ok, landedByCode?.code ?? null]),
   skillOnPlaceholder.the_rule_is_present],
  [true, false, true]);

t("ARM D4: PL-3's PREDICATE IS DRIVEN BOTH WAYS, at the catalogue — every named form is boilerplate, "
  + "and a real sentence is not. A matcher answering yes to everything would satisfy D1 while "
  + "refusing all correct work, and one answering no to everything would leave D1 the only thing "
  + "that noticed",
  [BOILERPLATE_FORMS.every((f) => isBoilerplate(f)),
   BOILERPLATE_FORMS.every((f) => isBoilerplate(f.toUpperCase())),
   isBoilerplate(REAL_DESCRIPTION), isBoilerplate("   "), isBoilerplate("<description here>"),
   BOILERPLATE_FORMS.length >= 15],
  [true, true, false, true, true, true]);

/* READ OVER CODE, NOT OVER PROSE, and the difference is not pedantry: the
   doctrine's own header DISCUSSES `isBoilerplate` and quotes its stated limit,
   which is exactly what a prohibition citing a fence ought to do. A raw-source
   walk read that discussion as an implementation and failed this arm on the
   first run — the false positive PL-1 measured one family over. */
const DOCTRINE_CODE = codeOnly(DOCTRINE_SRC);
t("ARM D5: SK-3 ADDS NO SECOND CHECK AND NO SECOND PREDICATE. In the doctrine's CODE — comments "
  + "blanked by the estate's own lexer — there is no boilerplate roster, no membership test and no "
  + "typed C-number; the row is read by catalogue KEY. One rule with two implementations is what "
  + "left IS-6's C-22.4 control green at 98 of 98",
  [/isBoilerplate/.test(DOCTRINE_CODE), /BOILERPLATE_FORMS/.test(DOCTRINE_CODE),
   DOCTRINE_CODE.includes(`"${SUGGEST_CHECKS.SUGGEST_BOILERPLATE.check}"`),
   DOCTRINE_CODE.includes(`'${SUGGEST_CHECKS.SUGGEST_BOILERPLATE.check}'`),
   /SUGGEST_CHECKS\.SUGGEST_BOILERPLATE\.check/.test(DOCTRINE_CODE)],
  [false, false, false, false, true]);

t("ARM D5b: THE LEXER CAN SEE — the SAME `codeOnly` over a fixture keeps a code mention and blanks a "
  + "comment one, so D5 is a measurement and not a walk that had gone blind. It is also what proves "
  + "D5 did not pass by reading an empty string",
  [/KEPT_IN_CODE/.test(codeOnly(`/* "BLANKED_IN_COMMENT" */ const a = "KEPT_IN_CODE";`)),
   /BLANKED_IN_COMMENT/.test(codeOnly(`/* "BLANKED_IN_COMMENT" */ const a = "KEPT_IN_CODE";`)),
   DOCTRINE_CODE.length > 4000, /isBoilerplate/.test(DOCTRINE_SRC)],
  [true, false, true, true]);

t("ARM D6: AND THE SKILL-ONLY WALK IS NOT MERELY LOOKING IN THE WRONG PLACE — the doctrine module "
  + "exports no predicate that returns a verdict about a description at all, so there is nothing for "
  + "D3's walk to have missed. This is the structural reason the skill path cannot discriminate",
  [Object.keys(SKILL_TEXT_PREDICATES).length,
   BOILERPLATE_FORMS.filter((f) => controlFlowAuthority(f).length).length,
   reportsAs(PLACEHOLDER), reportsAs(REAL_DESCRIPTION)],
  [2, 0, null, null]);

t("ARM D7: the refusal a member would MEET is the catalogue's canned translation, and this doctrine "
  + "holds no copy of it — it names the fence and never speaks for it (SK-1's ARM E8, one file over)",
  [SUGGEST_CHECKS.SUGGEST_BOILERPLATE.translation.length > 40,
   DOCTRINE_SRC.includes(SUGGEST_CHECKS.SUGGEST_BOILERPLATE.translation.slice(0, 40))],
  [true, false]);

/* ==========================================================================
   BLOCK E — THE PACK CARRIES THEM, AND THE VERSION MOVES WHEN THEY MOVE.
   ======================================================================== */
console.log("\nBLOCK E — the prohibitions are in SK-1's pack, under the disclosure standard");

const pack = renderPack(await GET(`op=affordances&token=${RUTH}`), CATALOGUE);
const layers = judgementLayers();
console.log(`  corpus: ${Object.keys(layers).length} judgement layer(s): ${Object.keys(layers).join(", ")}`);

t("ARM E1: the prohibitions layer is IN the rendered pack's disclosed half and names the work that "
  + "loads it — a run that does not know a layer exists cannot ask for it",
  [("prohibitions" in pack.disclosed),
   typeof layers.prohibitions.load_when === "string" && layers.prohibitions.load_when.length > 0,
   layers.prohibitions.sourcing],
  [true, true, "authored"]);

t("ARM E2: every prohibition REACHES the pack by id, and so does the permitted auto-composition — a "
  + "layer that rendered its `load_when` and dropped its body would satisfy E1 and carry no doctrine",
  [PROHIBITIONS.filter((p) => !JSON.stringify(pack.disclosed).includes(p.id)).map((p) => p.id),
   JSON.stringify(pack.disclosed).includes(PERMITTED_AUTO_COMPOSITION.id)],
  [[], true]);

t("ARM E3: the layer PUBLISHES what this text is — that each prohibition names the code that refuses "
  + "AND what that code does not reach, and that one of the five has no code at all. A run reading "
  + "it does not mistake a prohibition for a gate",
  [/INSTRUCTION/.test(layers.prohibitions.body.note),
   /do NOT reach/.test(layers.prohibitions.body.note),
   layers.prohibitions.body.copied_from, layers.prohibitions.body.restated_in],
  [true, true, SURVEY_SOURCE, DESIGN_SOURCE]);

const moved = { ...pack, disclosed: { ...pack.disclosed,
  prohibitions: { ...pack.disclosed.prohibitions,
    body: { ...pack.disclosed.prohibitions.body, standing: PROHIBITION_SET_IS_STANDING + " (moved)" } } } };
t("ARM E4: move one sentence of this prohibition set and the PACK'S VERSION moves — so a run "
  + "composed under one edition and a rerun under the next are distinguishable in their run objects, "
  + "without anyone remembering to bump anything",
  packVersion(moved) !== pack.version, true);

/* ==========================================================================
   BLOCK F — THE RUN THAT LANDED IS A SUGGESTION AND NOTHING MORE.
   ======================================================================== */
console.log("\nBLOCK F — what landed arrived PROPOSED, which is prohibition 4's code half");

const versions = await GET(`op=basisversions&token=${RUTH}&id=${INQ}&limit=1000`);
const rows = versions?.versions ?? [];
console.log(`  corpus: ${rows.length} version row(s) on ${INQ} after two submissions, one refused`);

t("ARM F1: exactly ONE version landed — the refused one wrote nothing. A refusal that still wrote "
  + "would make D1 a report rather than a fence",
  [versions?.total ?? null, rows.length, rows.map((v) => v.name)],
  [1, 1, ["the reading the ledger actually supports"]]);

t("ARM F2 (PROHIBITION 4's CODE HALF, DRIVEN): what landed is in state `suggested` and in no other, "
  + "and it CARRIES ITS RUN — a machine-proposed reading arrives as something PUT FORWARD, and the "
  + "acts that would make it the record's own answer are unreachable from here",
  [[...new Set(rows.map((v) => v.state))], [...new Set(rows.map((v) => v.run))]],
  [["suggested"], [RUN]]);

await mf.dispose();
};

await run();

/* THE TAIL LINE IS THE BATTERY'S CONTRACT, not decoration: `scripts/battery.mjs`
   reads `N pass, M fail` off it, and a suite whose count cannot be read reports
   as UNKNOWN rather than as zero (D-93's `sshsig` 16-vs-18 case). The explicit
   exit is `hygiene.test.mjs`'s rule — a suite ends on its own result rather than
   on whatever the runtime decides to do with a pending handle — and it is read
   from the LAST 400 characters of this file, so both lines live here. */
console.log(`\nskillprohibitions: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
