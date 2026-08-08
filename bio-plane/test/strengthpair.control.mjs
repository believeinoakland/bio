/* PL-14 / IS-7 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — PL-2/PL-3/PL-4's precedent, which took it from
 * `check-refusal-codes.mjs`.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. On 2026-08-07
 * a worker's harness was OVERWRITTEN MID-TURN by another running worker, and a
 * harness silently replaced between ARM and RESTORE reports a restore it never
 * performed.
 *
 * EVERY RESTORE IS VERIFIED BY CONTENT AS WELL AS BY HASH. A sha256 comparison
 * answers "the bytes are the same" only if the reader that produced both digests
 * was the same reader; a byte comparison of the strings answers it outright.
 *
 * OWED CONTROL 3 IS DEC-40'S AND IT RUNS FIRST (design §18, IS-BUILD-PLAN
 * VF-1(3)). Beside it runs the item's own trap — DEC-44's forbidden composition
 * — because PL-14's brief names the pair-is-never-one-number rule as the item
 * rather than as one of its rules.
 *
 * EACH ARM IS ARMED ALONE against a whole tree, and each states what MUST fail
 * AND what MUST NOT. An arm that fails "somewhere" proves the suite is sensitive
 * to something; an arm that fails at its OWN rule while its neighbours stay
 * green proves the rules are separate rules. PL-1's control (2) is the shape:
 * taking ONE of two defences down still left the write refused, so it took BOTH
 * down to name the consequence — arms (7a)/(7b) below do the same for INERT and
 * NAMED, which are two facts and not one.
 *
 * MEASURED 2026-08-08 in worktree agent-a78ca0f9b029b7dfa, whole tree, BASELINE
 * 90 pass / 0 fail. 17 arms run, 0 wrong. Every figure below is what this
 * harness PRINTED, so a later reader can re-run it and compare rather than
 * re-derive how to break the subject:
 *
 *   (1a) 38/52  (1b) 85/5   (1c) 82/8   (1d) 87/3
 *   (2)  37/53  (2b) 38/52  (2c) 89/1
 *   (3)  86/4   (4)  86/4   (5)  84/6
 *   (6)  87/3   (6b) 88/2
 *   (7a) 86/4   (7b) 76/14
 *   (8)  88/2   (9)  82/8   (10) 90/0 — the over-strictness arm, which must PASS
 *
 * THREE ARM DECLARATIONS WERE CORRECTED AFTER THEIR FIRST RUN AND ARE RECORDED
 * AS FINDINGS RATHER THAN SMOOTHED, because each one measured something the
 * item had predicted wrongly:
 *
 *   - (1a)/(2)/(2b) were first declared to leave the arithmetic arms GREEN.
 *     THEY DO NOT, and the guard is the reason: with DEC-40's line stripped or
 *     the pair composed, NOTHING LEAVES AT ALL — the op refuses and there is no
 *     answer to read a letter off. That is the guard being stronger than
 *     predicted, and it is why (1b) exists: PL-1's control (2) shape, both
 *     defences down, is the only way to see the HARM rather than the teeth.
 *   - (7b) first armed a field on the leg objects handed to `#strengthWalk`.
 *     THE WALK BUILDS NEW MEMBERS and copies a fixed set of fields, so the flag
 *     never arrived and the suite STAYED GREEN AT 88/88 — a control that could
 *     not fail, caught by this harness's own must-fail declaration rather than
 *     by reading the code.
 *   - (8) first armed a second implementation named `#axisResultAgain` against a
 *     pin anchored on `static #axisResult(` WITH THE PAREN, which does not match
 *     a differently-named twin — so the pin stayed green over a source carrying
 *     two implementations. THE PIN WAS WRONG AND THE ARM FOUND IT: a second
 *     implementation arrives under a different name by definition, so the pin
 *     now counts without the paren and the suite records why.
 *
 * Run it:  node test/strengthpair.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  store: ROOT + "src/store.mjs",
  checks: ROOT + "checks/bio-checks.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 600000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 130));
  return m ? { pass: +m[1], fail: +m[2], named, out } : { pass: null, fail: null, named, out };
}

/* THE HARNESS REFUSES TO ARM BLIND. A fragment occurring twice would arm two
   sites, and a control armed in more places than it claims is not the control it
   reports — PL-10's harness caught exactly this and it is copied deliberately. */
function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 70)}…' occurs ${n} times in ${key}.`);
  writeFileSync(F[key], src.replace(from, to));
}

function restoreAll() {
  for (const [k, p] of Object.entries(F)) writeFileSync(p, ORIGINAL[k]);
  for (const [k, p] of Object.entries(F)) {
    const now = readFileSync(p, "utf8");
    if (sha(now) !== ORIGINAL_SHA[k]) throw new Error(`RESTORE FAILED BY HASH: ${k}`);
    if (now !== ORIGINAL[k]) throw new Error(`RESTORE FAILED BY CONTENT: ${k}`);
  }
}

function arm(title, edits, mustFail, mustNotFail = [],
             { mustStayGreen = false, mustSee = [], mustNotThrow = true,
               suite = "strengthpair.test.mjs" } = {}) {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite(suite);
    console.log(`  MEASURED (${suite}): ${r.pass} pass, ${r.fail} fail`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    /* WHAT THE PLANE ACTUALLY SAID, not merely which assertion moved. An arm can
       fail "somewhere"; `mustSee` is how an arm proves the REFUSAL IT NAMES is
       the thing that fired, by finding its code in the suite's own output. */
    for (const frag of mustSee)
      if (!r.out.includes(frag)) { console.log(`  ** WRONG: expected "${frag}" in the output and it is absent`); wrong = true; }
    /* A CONTROL MUST NOT KILL THE SUITE. D-93's class, measured seven times in
       this repository: a throw takes every arm behind it and reports one defect
       as none. An arm whose subject makes the reader THROW is an instrument
       defect, not a result, and it is failed here rather than read as a pass. */
    if (mustNotThrow && r.named.some((n) => n.startsWith("suite threw"))) {
      console.log("  ** WRONG: the suite THREW rather than failing an assertion — every arm behind it is hidden.");
      wrong = true;
    }
    if (!mustStayGreen && !r.fail) {
      console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing.");
      wrong = true;
    }
    if (mustStayGreen && r.fail) {
      console.log("  ** WRONG: this arm must PASS — a fence that refuses correct work is a defect in the fence.");
      wrong = true;
    }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}
/* THE TWO DEFENCES, NAMED ONCE so an arm can take one down or both. PL-1's
   control (2) is the shape: taking ONE of two defences down still left the write
   refused, so it took BOTH down to NAME THE CONSEQUENCE. The same is true here —
   with the guard whole, stripping DEC-40's line turns every answer into a
   refusal, which proves the guard has teeth and says nothing about what an
   unfiltered answer would look like. Only with the guard ALSO down does the
   harm become visible: a what-if indistinguishable from the record's own answer.
   Both arms are run, and they answer different questions. */
const GUARD_OFF = ["store", "    return this.#refusePairComposed(out) ?? out;", "    return out;"];
const LINE_OFF = ["store", "      filter,\n", "\n"];
const SET_OFF = ["store", "      state_set: stateSet,\n", "\n"];

console.log("PL-14 / IS-7 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite("strengthpair.test.mjs");
console.log(`  BASELINE strengthpair.test.mjs: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) {
  console.log("  ** the tree is not whole; arms below would measure the wrong thing");
  process.exit(1);
}

/* ============== (1) OWED CONTROL 3 — DEC-40'S, AND IT RUNS FIRST ========= */

arm("(1a) OWED CONTROL 3 (DEC-40's, IS-BUILD-PLAN VF-1(3)), FIRST HALF — STRIP THE FILTER/STATE-SET "
  + "LINE WITH THE GUARD LEFT WHOLE. DEC-40 determination 2: a rendering produced under somebody's own "
  + "filter is *\"A VIEW THAT READER CONSTRUCTED, labelled as such\"* and must state its filter in the "
  + "artifact itself, because *\"a filtered rendering that looks like the case IS that claim, "
  + "manufactured by us and handed over pre-made\"*. §12 transplants it verbatim to the pair. WHAT THIS "
  + "ARM MEASURES is that the rule is CODE: C-29.8 fires and NO ANSWER LEAVES AT ALL — no pair, no "
  + "letters, nothing a surface could render as the record's own. The reach is total by design, so this "
  + "arm deliberately claims nothing about which neighbours stay green; (1b) is where the consequence "
  + "is named.",
  [LINE_OFF],
  ["EVERY answer carries the line",
   "the what-if line says on its face that it is a view the caller constructed"],
  [], { mustSee: ["VERSION_STRENGTH_UNFILTERED"] });

arm("(1b) OWED CONTROL 3, SECOND HALF — **BOTH DEFENCES DOWN**, which is PL-1's control (2) shape and "
  + "the reason it is copied: one defence down proves the defence has teeth and says NOTHING about the "
  + "harm. With the guard also removed the answer LEAVES, carrying a real pair over a reading NOBODY "
  + "HAS ADOPTED and no line saying so — a what-if indistinguishable from the record's own answer, which "
  + "is the misrepresentation vector the ruling exists to close. THE CONSEQUENCE IS NAMED HERE: exactly "
  + "the DEC-40 assertions fail, and the arithmetic stays GREEN.",
  [LINE_OFF, GUARD_OFF],
  ["EVERY answer carries the line",
   "the what-if line says on its face that it is a view the caller constructed",
   "the default line says it is the record's own answer and is NOT filtered"],
  ["MAX OVER BRANCHES: the axis takes the STRONGEST branch",
   "MIN WITHIN A BRANCH: the branch holding an A leg and a C leg is worth C",
   "the pair answers",
   "WIDENING THE SET calculates over it"]);

arm("(1c) THE OTHER HALF OF THE SAME RULE — drop the MACHINE-READABLE set and keep the sentence, with "
  + "the guard down so the answer still leaves. A consumer would then have to parse prose to learn what "
  + "was counted. Both halves are owed and they fail separately, which is why the guard checks both and "
  + "why this is its own arm.",
  [SET_OFF, GUARD_OFF],
  ["the machine-readable set travels beside the sentence",
   "an answer with no states named carries the default set on its face"],
  ["the what-if line says on its face that it is a view the caller constructed",
   "MAX OVER BRANCHES: the axis takes the STRONGEST branch"]);

arm("(1d) AND THE CATALOGUE ROW ITSELF — rename DEC-40's row out of the family, leaving the builder and "
  + "the guard honest. Behaviour is unchanged and every behavioural arm stays green; what fails is the "
  + "assertion that the rule EXISTS AS A REFUSAL with a canned translation. A rule nothing enforces is "
  + "a rule the next edit deletes for free, and this is the arm that can see it.",
  [["checks", "  VERSION_STRENGTH_UNFILTERED: {", "  VERSION_STRENGTH_UNFILTERED_GONE: {"]],
  ["and a missing line is a REFUSAL with a canned translation, not a formatting lapse",
   "the two self-guards carry their OWN `where`"],
  ["EVERY answer carries the line",
   "MAX OVER BRANCHES: the axis takes the STRONGEST branch"]);

/* ============== (2) THE ITEM'S TRAP — DEC-44'S FORBIDDEN COMPOSITION ===== */

arm("(2) COMPOSE THE TWO AXES INTO ONE VALUE. This is R2's forbidden composition and the item itself: "
  + "DEC-44 determination 1 refuses it at case altitude — *\"MUST NOT derive a single case-level "
  + "strength … exactly the 'one letter' the project has refused four times\"* — and the harm is "
  + "identical one altitude down. The answer now carries a single figure standing for both populations. "
  + "THE POINT OF THE ARM IS THAT THE REFUSAL FIRES: the op returns C-29.7 and every arm that expected a "
  + "pair fails, because the answer is a refusal rather than a wrong number.",
  [["store", "      pair: { capture: pair.capture, connection: pair.connection },\n"
    + "      /* INERT AND NAMED",
    "      pair: { capture: pair.capture, connection: pair.connection },\n"
    + "      strength: pair.connection.grade,\n"
    + "      /* INERT AND NAMED"]],
  /* NOT `and no top-level key can read as one figure standing for both` — CORRECTED
     AFTER THE FIRST RUN and recorded rather than smoothed. That assertion STAYS
     GREEN under this arm, and correctly: the guard refuses, so what comes back is
     a refusal object which carries no `strength` key at all. The composition never
     reaches a caller, which is the guard working. The evidence that DEC-44's
     refusal FIRED is the code in the output, which is what `mustSee` reads. */
  ["the pair answers",
   "and it is an answer, not a refusal wearing an answer's shape"],
  [], { mustSee: ["VERSION_STRENGTH_COMPOSED"] });

arm("(2b) THE COMPOSITION UNDER A NAME THE LIST DID NOT PREDICT — a third key INSIDE the pair, called "
  + "something nobody enumerated. The forbidden-key list catches the obvious spellings; TOTALITY is what "
  + "catches the rest, and this arm is the one that proves the totality is doing work rather than the "
  + "list.",
  [["store", "      pair: { capture: pair.capture, connection: pair.connection },\n"
    + "      /* INERT AND NAMED",
    "      pair: { capture: pair.capture, connection: pair.connection,\n"
    + "              headline: pair.connection.grade },\n"
    + "      /* INERT AND NAMED"]],
  ["the pair answers",
   "`pair` holds EXACTLY the two axes and nothing else"],
  [], { mustSee: ["VERSION_STRENGTH_COMPOSED"] });

arm("(2c) AND THE GUARD REMOVED WHILE THE BUILDER STAYS HONEST — the same question arm (1c) asks about "
  + "DEC-40, asked about DEC-44. The behaviour is unchanged, so every behavioural arm stays green and "
  + "only the pin that can SEE a missing guard fails. That is the whole finding: a pin fails where a "
  + "behavioural arm cannot (IS-6's C-22.4 lesson, one item over).",
  [GUARD_OFF],
  ["`#refusePairComposed` is DEFINED once and REACHED on the way out"],
  ["the pair answers", "the two axes report DIFFERENT letters over the same reading",
   "EVERY answer carries the line"]);

/* ============== (3)-(6) THE ARITHMETIC AND THE GRADES, ONE AT A TIME ===== */

arm("(3) TAKE THE MINIMUM OVER THE BRANCHES INSTEAD OF THE MAXIMUM. DEC-32, Bob's ruling: strength is "
  + "*\"the MAXIMUM over OR-related branches\"* — *\"a conclusion established at B on the constitutional "
  + "ground is established at B, full stop; the regulatory ground offered beside it at C weakens "
  + "nothing\"*. Under MIN the mixed fixture reads C where it should read A, and the branch-level "
  + "assertions stay green — which is exactly why the axis and the branches are asserted separately.",
  [["store", "gradedBranches.reduce((a, g) => Store.#GRADE_RANK[g.grade] > Store.#GRADE_RANK[a.grade] ? g : a)",
    "gradedBranches.reduce((a, g) => Store.#GRADE_RANK[g.grade] < Store.#GRADE_RANK[a.grade] ? g : a)"]],
  ["MAX OVER BRANCHES: the axis takes the STRONGEST branch"],
  ["MIN WITHIN A BRANCH: the branch holding an A leg and a C leg is worth C"]);

arm("(4) TAKE THE STRONGEST LEG WITHIN A BRANCH INSTEAD OF THE WEAKEST. The dual of arm (3): a branch is "
  + "an AND of its legs and is *\"no stronger than the weakest of them\"*, because a reader must be able "
  + "to check every link the claim NEEDS. Under MAX the branch reads A where it should read C, and the "
  + "axis-level assertion stays green — the two rules separated by two arms.",
  [["store", "      if (weakest === null || Store.#GRADE_RANK[m.grade] < Store.#GRADE_RANK[weakest.grade]) weakest = m;",
    "      if (weakest === null || Store.#GRADE_RANK[m.grade] > Store.#GRADE_RANK[weakest.grade]) weakest = m;"]],
  ["MIN WITHIN A BRANCH: the branch holding an A leg and a C leg is worth C"],
  []);

arm("(5) COUNT THE HUNCH AS EVIDENCE. §12: *\"A leg marked as a HUNCH is visible as such and does not "
  + "count as evidence.\"* The fixture's hunch sits on a document that EARNS grade A, so counting it "
  + "turns an UNRATED branch into a graded one — which is why the arm cannot pass vacuously and why the "
  + "fixture was built that way.",
  [["checks", "export const VERSION_STRENGTH_INERT_SOURCES = ['hunch'];",
    "export const VERSION_STRENGTH_INERT_SOURCES = [];"]],
  ["the branch resting only on a hunch is UNRATED",
   "the excluded set is read from the CATALOG's roster"],
  ["MAX OVER BRANCHES: the axis takes the STRONGEST branch"]);

arm("(6) READ THE GRADE OFF THE FROZEN ROW INSTEAD OF FROM `earnedBasisRegistry`. §12: *\"A frozen "
  + "version freezes the COMPOSITION and the grade-REFERENCES — not the grades … the effective "
  + "calculation always uses the CURRENT earned grades behind the version's references.\"* §5 is the "
  + "rule for a machine composing legs at volume: *\"'Assign strength values' means composing legs whose "
  + "EARNED grades produce a supported calculation — not minting numbers.\"* Armed, a row claiming A for "
  + "a document the record earns C for is reported at A, and a leg the record earns NOTHING for stops "
  + "being ungraded at all.",
  [["store", "        const e = earnedConn[r.target_id];\n        if (e && e.grade) return carries(e.grade, e.why);",
    "        const e = earnedConn[r.target_id];\n        if (authored) return carries(authored, 'the row said so');\n"
    + "        if (e && e.grade) return carries(e.grade, e.why);"]],
  ["and the READ reports what the record EARNS, not what the row claims",
   "the connection leg says the same way: the row claimed A and the record earns C"],
  ["a member's signed testimony stands at D"]);

arm("(6b) DROP THE CAPTURE CEILING. The registry's capture entry is `mode: 'ceiling'` and NOT a value — "
  + "there is no per-document capture grade anywhere in this schema — so a leg may not claim more than "
  + "the bytes can support. Armed, a leg authored at A on the capture axis is reported at A, and the "
  + "record asserts a strength about bytes it cannot prove that much about.",
  [["store", "      const capped = Store.#GRADE_RANK[authored] > Store.#GRADE_RANK[c.grade] ? c.grade : authored;",
    "      const capped = authored;"]],
  ["the CAPTURE axis is CAPPED at the ceiling, never raised to it"],
  ["and the READ reports what the record EARNS, not what the row claims"]);

/* ====== (7) INERT AND NAMED ARE TWO FACTS — PL-1's CONTROL (2) SHAPE ===== */

arm("(7a) BREAK **NAMED** AND LEAVE **INERT** WHOLE. DEC-18's plural clause is the half a reader is "
  + "owed: *\"more than one leg may have no established grade, in which case every such leg will be "
  + "named.\"* Armed, the arithmetic is still exactly right — the branch still reads C, the axis still "
  + "reads A — and the record has simply stopped saying what it is standing on. THAT IS THE POINT: the "
  + "arithmetic arms all stay GREEN, which is why naming needs its own control.",
  [["store", "      ungraded: resolved.ungraded,", "      ungraded: [],"]],
  ["the answer ALSO publishes the ungraded legs at the top",
   "and WHICH ABSENCE it is travels at the top level"],
  ["MIN WITHIN A BRANCH: the branch holding an A leg and a C leg is worth C",
   "MAX OVER BRANCHES: the axis takes the STRONGEST branch",
   "INERT: the branch carrying an ungraded leg is still graded"]);

arm("(7b) BREAK **INERT** AND LEAVE **NAMED** WHOLE — the other half, and the direction DEC-18 was "
  + "ruled AGAINST: an ungraded leg that unrates the whole reading is the pre-DEC-18 behaviour Bob "
  + "corrected (*\"An ungraded leg doesn't contribute to a conclusion, but if there are other graded "
  + "legs, then it doesn't suspend the conclusion either\"*). Armed, the branch carrying the bare leg "
  + "stops being graded while every leg is still named — so the two halves are shown to be separable in "
  + "BOTH directions rather than only one.",
  [["store", "    if (!loadBearing.length)\n      return { ground, state: \"unrated\", grade: null, weakest: null,",
    "    if (inert.length || !loadBearing.length)\n      return { ground, state: \"unrated\", grade: null, weakest: null,"]],
  ["INERT: the branch carrying an ungraded leg is still graded",
   "MIN WITHIN A BRANCH: the branch holding an A leg and a C leg is worth C"],
  ["the answer ALSO publishes the ungraded legs at the top",
   "NAMED, PLURALLY: both legs that are not load-bearing here are named"]);

/* ============== (8) THE SECOND IMPLEMENTATION ============================ */

arm("(8) RE-IMPLEMENT THE ARITHMETIC RATHER THAN REACHING IT THROUGH `legsOverride`. IS-6's C-22.4 "
  + "control left its suite GREEN at 98 of 98 because the rule it broke had TWO implementations and "
  + "removing either left the other absorbing the control. Armed, a second `#axisResult` exists and "
  + "BEHAVIOUR IS UNCHANGED — every arithmetic arm stays green — and only the implementation-count pin "
  + "can see it. That is what a count pin is for.",
  [["store", "  static #axisResult(axis, members, exhausted) {",
    "  static #axisResultAgain(axis, members, exhausted) { return Store.#axisResult(axis, members, exhausted); }\n"
    + "  static #axisResult(axis, members, exhausted) {"]],
  ["DEC-32's composition is implemented ONCE"],
  ["MAX OVER BRANCHES: the axis takes the STRONGEST branch",
   "the pair answers",
   "MIN WITHIN A BRANCH: the branch holding an A leg and a C leg is worth C"]);

/* ============== (9) THE STATE SET'S SAFE DEFAULT ========================= */

arm("(9) DEFAULT THE STATE SET TO EVERY STATE INSTEAD OF TO `accepted`. §12: *\"defaulting to accepted. "
  + "SAFE BY DEFAULT.\"* Armed, a caller who says nothing is answered over a reading a run PROPOSED and "
  + "nobody stood behind — and, worse, is answered without the what-if line, because the answer believes "
  + "it is the record's own. Two rules break together, which is what makes the default load-bearing "
  + "rather than a convenience.",
  [["checks", "export const VERSION_STRENGTH_DEFAULT_STATES =\n  VERSION_STATES.filter((s) => s === 'accepted');",
    "export const VERSION_STRENGTH_DEFAULT_STATES = [...VERSION_STATES];"]],
  ["the DEFAULT state set is `accepted` alone",
   "a reading nobody has adopted is NOT what the record answers with"],
  []);

/* ============== (10) OVER-STRICTNESS — THIS ONE MUST PASS ================ */

arm("(10) OVER-STRICTNESS. A fence that refuses correct work is a defect in the fence. Nothing is armed "
  + "here: the arm re-runs the whole suite after a NO-OP edit that rewrites a comment, to demonstrate "
  + "that the harness's own edit/restore machinery does not move the subject — a control estate that "
  + "cannot tell its own noise from a defect is the instrument this repository has been bitten by most.",
  [["store", "   * ================================================================== */\n\n  /** How many state words",
    "   * (over-strictness arm: this comment line is rewritten and nothing else)\n"
    + "   * ================================================================== */\n\n  /** How many state words"]],
  [], [], { mustStayGreen: true });

console.log(`\n${armsRun} arms run, ${armsWrong} wrong.`);
restoreAll();
console.log("final restore: every file verified by sha256 AND by content");
process.exit(armsWrong ? 1 : 0);
