/* FL-3 / IS-9 — THE RUN HARNESS, PROVED TWO WAYS.
 *
 * The item is a DETERMINISTIC CONTROL FLOW TABLE — code, never skill — so this
 * suite has to answer two different questions, and neither answer implies the
 * other:
 *
 *   PART A · THE TABLE, PURE. `src/harness.mjs` imports in a plain node process
 *     with no miniflare, so every row can be walked EXHAUSTIVELY. That is the
 *     only way "nextStep never leaves a row except by an edge the row declares"
 *     is a measurement rather than a reading of the code. A table exercised only
 *     through the op is a table nobody can exhaust.
 *
 *   PART B · THE TABLE, THROUGH `POST /run`, INSIDE WORKERD, over a real service
 *     binding to a plane mock. Because a pure walk proves nothing about whether
 *     a CALLER can reach the feature — `op=invitelook` shipped with a
 *     ReferenceError while 1276 assertions passed (D-43) — and because three of
 *     the four acceptance clauses are about what the PLANE ends up holding.
 *
 * THE MOCK IS THE INSTRUMENT, NOT A CONVENIENCE, and FL-2's is extended rather
 * than replaced: it records every request (op, token, namespace, body), holds a
 * mutable RECORD that every MUTATING op changes, keeps a real observation LOG
 * that `op=airuntick` appends to, spends the run's BUDGET and terminates the run
 * at its own exit when a bound is exhausted — writing `runtime-ceiling-reached`
 * exactly where PL-5's `#aiRunTerminate` writes it. And it implements F10's
 * plane side the way PL-3 built it: a verbatim resubmit is keyed on the CANONICAL
 * SUBMISSION byte for byte, returns the stored refusal WITHOUT re-running the
 * checks, and climbs a `repeats` counter. **That counter is this suite's teeth.
 * The whole point of the table is that it stays at zero on a well-behaved run,
 * and a mock that could not count it could not tell a retry loop from a run.**
 */
/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/harness.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and neither the battery nor the fleet walk must discover it (FL-2/PL-3/PL-4/PL-11's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, which a concurrent worker overwrote between ARM and RESTORE once already. Every arm is armed ALONE with the other defences held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`), and every arm names what MUST fail AND what MUST NOT.
   (H1) DEDUP-BEFORE-WRITE IS THE TABLE'S SHAPE. Add a `submit` edge to `compose`'s `to` and make `nextStep` take it -> the declared-edge walk AND the no-compose-to-submit arm must both FAIL; every refusal arm, the gate and the budget arms must HOLD.
   (H2) F10 — DENIED MEANS ADJUST. Make `nextStep` return `submit` from `submit` when a refusal is set (a verbatim retry) -> the F10 edge arm and the through-the-op `repeats stays 0` arm must FAIL; the dedup arms must HOLD.
   (H3) F10's PRECONDITION. Make `adjust` return `submit` regardless of `adjusted` -> the dropped-candidate arm and the mock's `repeats` counter must FAIL; nothing else.
   (H4) LOOP TERMINATION IS NOT THE MODEL'S. Remove `maxPasses` from `NOT_JUDGEABLE` -> the overreach arms must FAIL by name; the budget arms must HOLD (this is SK-2's review criterion as code).
   (H5) THE INVESTIGATE-MODE GATE (SK-4). Set `MODES.investigate.deployed = true` -> the gate arm must FAIL; every other arm must HOLD, which is what shows the gate is a ROW and not a side effect of something else.
   (H6) LOG-ALWAYS. Make the driver skip the tick on the terminal step -> the log-always arms must FAIL naming the missing terminal entry.
   (H7) THE FOUR-LEVEL FAN-OUT. Drop `internet` from `LEVELS` -> the plane-vocabulary source pin AND the four-spawns arm must both FAIL.
   (H8) query-never-load: name a second meaning reader -> the pinned-op-set arm must FAIL (floor and ceiling both).
   (H9) THE EMPTY-RUN INSTRUMENT (VF-1's owed control 7). Make `emptyLevelCandidates` return `[]` -> the empty-run arm must FAIL: an empty run and a silent failure become indistinguishable, which is the exact defect §9's kind exists to prevent.
   (H10) OVER-STRICTNESS, nothing broken, and these must PASS.
   ALL TEN ARMS RUN 2026-08-08 IN WORKTREE agent-ad6e5ed43aac4a2ab, baseline 194/0 (this suite) and 98/0 (agent-worker.test.mjs) before each; every one AS DECLARED on the recorded pass. **FOUR CAME BACK WRONG FIRST AND EVERY ONE WAS A FINDING ABOUT THE INSTRUMENT RATHER THAN THE SUBJECT — recorded, not smoothed:** H1 never ARMED (patch matched 0 times), then exited 2 on a restore MISMATCH (two snapshots of one file collided on the copy's name — the `cmp` instrument caught what the sha256 could not), then had its MUST-NOT corrected (`queue` is DEDUP'S output, so F10 cannot hold when dedup is skipped); H2 and H9 both KILLED the suite rather than failing it (`0 pass, -1 FAIL`) on a nested read of an empty collection — the CLASS was swept, not the two sites. MEASURED figures: H1 166/28 · H2 184/10 · H3 191/3 · H4 189/4 · H5 186/8 · H6 193/1 · H7 191/3 · H8 harness 192/2 + member 95/3 · H9 187/7 · H10 194/0, 98/0, coverage --strict exit 0. **ALL TEN RE-RUN 2026-08-09 UNDER FL-5 (which changed this file's subject: `collect` became a judged row and the fan-out composes spawn contracts) — 10 of 10 still AS DECLARED, every figure identical except H8, whose patch SITE moved and now reads harness 193/1 + member 96/2.**
   (F1) FL-7 — THE MISATTRIBUTION ITSELF. Regress `gate-mode` to close on `cancelled` -> the gate arms, A6b's DIRECTION 2 and the through-the-op B7 arms must FAIL and a misattribution arm must NAME it; A6b's DIRECTION 1 and `bio-plane/test/airun.test.mjs` must HOLD.
   (F2) FL-7 — THE CATALOGUE LOSES THE WORD. Remove `mode-not-deployed` from the plane's RUN_ENDINGS -> A6b's DIRECTION 1, airun V6/V6b and the through-the-op G1/G2 must FAIL (C-22.5 refusing a bound the vocabulary no longer holds is what proves the op path is real).
   (F3) FL-7 — ONE DIRECTION ONLY, AND IT IS THE ARM THAT EARNS THE TWO-WAY CLAIM. Change the header's terminates-on word to `cancelled`, a DIFFERENT REAL ending -> DIRECTION 2 must fail ALONE, with DIRECTION 1 GREEN. Measured 208/1: exactly one assertion.
   (F4) FL-7 — OVER-STRICTNESS, ARMED. Rewrite `cancelled`'s own sentence -> airun V6b and skillsequencing D5 must object (a genuine member cancellation is still asserted as a member act); the gate and both directions must HOLD.
   FL-7's FOUR ARMS RUN 2026-08-10 IN WORKTREE agent-a0301fcdabdaf43c6, baseline harness 209/0, airun 114/0, skillsequencing 27/0, battery 164/164 · 10,117. ALL FOUR AS DECLARED — F1 203/6+22/5+114/0 · F2 207/2+108/6 · F3 208/1 · F4 112/2+26/1+209/0. **F2 CAME BACK WRONG FIRST AND IT WAS A FINDING ABOUT THE ARM: `airun 0 pass, -1 FAIL` — the suite DIED, because FL-7's own new G2 read `gl.entries[len-1].bound` and the refused close left no terminal entry. Same class as H2/H9 above and swept the same way, across every nested read FL-7 added. Knowing the class did not prevent it; running the control did.**
   FULL PER-ARM DETAIL IS IN `test/harness.control.mjs`'s own header.
   D-276's five arms are NOT restated here and are NOT counted here: they belong to `test/agent-worker.control.mjs`, which drives THIS suite as well as its own, and they are enumerated once in `test/agent-worker.test.mjs`'s declaration. Naming them again here would inflate the fleet's arm count with a cross-reference — measured, at the moment of writing this sentence. **RE-MEASURED 2026-08-09 BY D-276: this suite's baseline moved 194/0 to 199/0** and the figures above went stale with it; under those arms this suite reads 192/7, 198/1 and 197/2 respectively.
 * ========================================================================= */

/* D-186: owns $TMPDIR for this process and removes it on exit. */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  CONTROL_FLOW, FIRST_STEP, LEVELS, MODES, BUDGET_BOUNDS, SPENT_NOT_WATCHED, NOT_OUR_BOUNDS,
  PLANE_OPS, JUDGEABLE, NOT_JUDGEABLE,
  nextStep, stopBecause, stepLog, applyJudgement, adjustedFrom, canonical, emptyLevelCandidates,
} from "../src/harness.mjs";
/* D-276: the mock's `op=meaningrows` branch, DERIVED from the plane's own arm
   registry and refusal catalog. This suite stages ROWS through `CFG.meaningRows`
   and still can — what it may no longer do is stage a SUCCESS for an arm the
   record does not hold. */
import { MEANING_ARMS, meaningRowsBranch } from "./plane-meaning.mjs";
import { MEANING_ARM } from "../src/harness.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const HARNESS_SRC = readFileSync(fileURLToPath(new URL("../src/harness.mjs", import.meta.url)), "utf8");
const WORKER_SRC_PATH = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const WORKER_SRC = readFileSync(WORKER_SRC_PATH, "utf8");
const PLANE_INDEX = readFileSync(fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url)), "utf8");
const PLANE_AIRUN = readFileSync(fileURLToPath(new URL("../../bio-plane/src/airun.mjs", import.meta.url)), "utf8");

/* The comment stripper FL-2 had to correct, reused rather than re-derived: a
   naive "two slashes to end of line" DELETES a `http://` literal AND the rest of
   its line, and an arm came back green over a source truncated by two thirds.
   Requiring a non-`:` before the `//` keeps every real line comment. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/* EVERY NESTED READ IN THIS FILE IS NULL-TOLERANT, AND THE CLASS WAS SWEPT
 * RATHER THAN THE TWO SITES THAT BIT.
 *
 * MEASURED, NOT ANTICIPATED: control arms H2 and H9 both came back `0 pass, -1
 * FAIL` on their first run — the suite DIED instead of failing, because
 * `out[0].kind` and `submits[1].body` threw when the armed defect made those
 * collections empty. A harness that read a missing tally as `0` would have
 * recorded both as "stayed GREEN"; this one reports `-1` for a suite that
 * printed no tail line, which is the only reason the defect was visible at all.
 * FL-2's A3 met the identical class one file over and its header says the same
 * thing: **the CLASS was swept, not the one site.** An assertion that throws
 * cannot NAME what it broke, and it takes every arm behind it with it. */
const HARNESS_CODE = strip(HARNESS_SRC);
const WORKER_CODE = strip(WORKER_SRC);

/* ================================================================
 * PART A · THE TABLE, PURE AND EXHAUSTIVE
 * ================================================================ */
console.log("\n=== PART A · the control-flow table, walked exhaustively with no network ===");

console.log("\n--- A1 · the table is DATA, and its edges are the enforcement ---");
{
  const steps = Object.keys(CONTROL_FLOW);
  t("every row declares what it does, whether it judges, that it logs, and where it may go",
    steps.filter((s) => {
      const r = CONTROL_FLOW[s];
      return typeof r.does !== "string" || !("judged" in r) || r.logs !== true || !Array.isArray(r.to);
    }), []);
  t("every `to` target is itself a row (no edge points at nothing)",
    steps.flatMap((s) => CONTROL_FLOW[s].to.filter((x) => !CONTROL_FLOW[x])), []);
  t("`close` is the only terminal row", steps.filter((s) => CONTROL_FLOW[s].to.length === 0), ["close"]);
  t("the first step is a row", CONTROL_FLOW[FIRST_STEP] != null, true);
  t("every row is reachable from the first step", (() => {
    const seen = new Set([FIRST_STEP]);
    const stack = [FIRST_STEP];
    while (stack.length) for (const n of CONTROL_FLOW[stack.pop()].to) if (!seen.has(n)) { seen.add(n); stack.push(n); }
    return steps.filter((s) => !seen.has(s));
  })(), []);

  /* DEDUP-BEFORE-WRITE, AS THE SHAPE OF THE TABLE AND NOT AS A RULE A STEP
     REMEMBERS. The absent edge IS the enforcement, so the assertion is about
     the absence. */
  t("there is NO edge from `compose` to `submit` — dedup is not skippable",
    CONTROL_FLOW.compose.to.includes("submit"), false);
  t("`compose` goes to `dedup` and to `close`, and nowhere else",
    [...CONTROL_FLOW.compose.to].sort(), ["close", "dedup"]);
  t("`dedup` is the only row that can reach `submit` other than `submit` and `adjust`",
    Object.keys(CONTROL_FLOW).filter((s) => CONTROL_FLOW[s].to.includes("submit")).sort(),
    ["adjust", "dedup", "submit"]);
}

console.log("\n--- A2 · nextStep NEVER leaves a row except by an edge that row declares ---");
{
  /* THE EXHAUSTIVE WALK. Every row crossed with every combination of the state
     fields any row reads. This is the arm that makes the table load-bearing:
     without it, `to` is a comment. */
  const bools = [false, true];
  const budgets = [
    null,
    { fetches: { allowed: 10, consumed: 0 }, subsessions: { allowed: 10, consumed: 0 }, wallclock: { allowed: 10, consumed: 0 } },
    { fetches: { allowed: 1, consumed: 1 }, subsessions: { allowed: 10, consumed: 0 }, wallclock: { allowed: 10, consumed: 0 } },
    { subsessions: { allowed: 2, consumed: 5 } },
    { wallclock: { allowed: 0, consumed: 0 } },
  ];
  const illegal = [];
  let walked = 0;
  for (const step of Object.keys(CONTROL_FLOW))
    for (const mode of ["check", "investigate", "", "nonsense"])
      for (const budget of budgets)
        for (const passN of [0, 1, 3])
          for (const maxPasses of [0, 1, 3])
            for (const hasRefusal of bools)
              for (const wasAdjusted of bools)
                for (const queueLen of [0, 1, 2]) {
                  walked += 1;
                  const state = { step, mode, budget, pass: passN, maxPasses,
                                  refusal: hasRefusal ? { code: "X" } : null,
                                  adjusted: wasAdjusted,
                                  queue: Array.from({ length: queueLen }, (_, i) => ({ name: `c${i}` })),
                                  reports: [], candidates: [], resumedFrom: 0 };
                  const d = nextStep(state);
                  if (!CONTROL_FLOW[step].to.includes(d.step) && !(step === "close" && d.step === "close"))
                    illegal.push({ step, to: d.step, declared: CONTROL_FLOW[step].to });
                }
  /* GUARDED AGAINST AN EMPTY CORPUS — a walk over nothing reports its verdict
     triumphantly, which is a receipt this project has collected. */
  t("the walk actually walked something", walked > 5000, true);
  t("no transition left a row by an undeclared edge", illegal.slice(0, 5), []);
  t("every step returns a `why` a log entry can carry",
    Object.keys(CONTROL_FLOW).filter((step) =>
      !String(nextStep({ step, mode: "check", pass: 0, maxPasses: 3, queue: [] }).why || "").length), []);
}

console.log("\n--- A3 · F10: a refusal routes to ADJUST, never to a verbatim retry ---");
{
  const refusedAt = { step: "submit", mode: "check", pass: 0, maxPasses: 3,
                      refusal: { code: "SUGGEST_BOILERPLATE" }, queue: [{ name: "a" }, { name: "b" }] };
  t("a refused submit goes to `adjust`", nextStep(refusedAt).step, "adjust");
  t("and it does NOT go back to `submit`", nextStep(refusedAt).step === "submit", false);
  t("the reason names F10's rule rather than the budget", /never to a verbatim retry/.test(nextStep(refusedAt).why), true);
  /* THE BUDGET IS THE BACKSTOP, NOT THE MECHANISM: with the budget WIDE OPEN the
     refusal must still route to adjust. An arm that only fired when the budget
     was tight would be measuring the backstop. */
  t("with the budget wide open it still routes to adjust",
    nextStep({ ...refusedAt, budget: { fetches: { allowed: 1e6, consumed: 0 } } }).step, "adjust");

  const adjusted = { step: "adjust", mode: "check", pass: 0, maxPasses: 3, adjusted: true, queue: [{ name: "a" }] };
  t("an ADJUSTED submission may re-enter `submit`", nextStep(adjusted).step, "submit");
  t("an UNADJUSTED one drops the candidate instead", nextStep({ ...adjusted, adjusted: false }).step, "next-pass");
  t("and says why in the record's terms, naming PL-3's counter",
    /repeats/.test(nextStep({ ...adjusted, adjusted: false }).why), true);

  console.log("\n  -- `adjustedFrom` answers by the BYTES, and key order is not a change --");
  t("identical objects are not an adjustment", adjustedFrom({ a: 1, b: 2 }, { a: 1, b: 2 }), false);
  t("the same object written in a different key order is not an adjustment",
    adjustedFrom({ a: 1, b: 2 }, { b: 2, a: 1 }), false);
  t("a changed value IS an adjustment", adjustedFrom({ a: 1 }, { a: 2 }), true);
  t("a removed field IS an adjustment", adjustedFrom({ a: 1, b: 2 }, { a: 1 }), true);
  t("null against null is not an adjustment", adjustedFrom(null, null), false);
  t("nested arrays compare by content", adjustedFrom({ l: [1, 2] }, { l: [1, 2] }), false);
  t("and a nested change is caught", adjustedFrom({ l: [{ x: 1 }] }, { l: [{ x: 2 }] }), true);
  t("canonical() sorts keys at every depth",
    canonical({ b: { d: 1, c: 2 }, a: 3 }), '{"a":3,"b":{"c":2,"d":1}}');
}

console.log("\n--- A4 · loop termination and the pass count are the TABLE's, never the model's ---");
{
  t("passes done >= maxPasses stops the loop", stopBecause({ pass: 3, maxPasses: 3 }), "completed");
  t("below it, nothing stops it", stopBecause({ pass: 1, maxPasses: 3 }), null);
  t("an exhausted budget stops it and NAMES the bound",
    stopBecause({ pass: 0, maxPasses: 3, budget: { subsessions: { allowed: 4, consumed: 4 } } }), "subsessions");
  /* ABSENT IS NOT ZERO, and this is the arm that matters most in the class: an
     unknown allowance read as exhausted would stop a run and name a bound that
     never bit — a run's own instrument manufacturing a false cause. */
  t("an ABSENT allowance is not an exhausted one", stopBecause({ pass: 0, maxPasses: 3, budget: {} }), null);
  t("a zero allowance is not an exhausted one either",
    stopBecause({ pass: 0, maxPasses: 3, budget: { fetches: { allowed: 0, consumed: 0 } } }), null);
  t("the bound named is deterministic in BUDGET_BOUNDS order",
    stopBecause({ pass: 0, maxPasses: 3,
      budget: { wallclock: { allowed: 1, consumed: 9 }, fetches: { allowed: 1, consumed: 9 } } }), "fetches");
  t("BUDGET_BOUNDS is the design's own three (§14b.6)", BUDGET_BOUNDS, ["fetches", "subsessions", "wallclock"]);
  t("`runtime` is SPENT but not watched by the table — the plane decides it",
    [Object.keys(SPENT_NOT_WATCHED), BUDGET_BOUNDS.includes("runtime")], [["runtime"], false]);
  t("`lease` is nobody's to spend here", Object.keys(NOT_OUR_BOUNDS), ["lease"]);
  t("every bound this harness names is a bound the PLANE declares",
    [...BUDGET_BOUNDS, ...Object.keys(SPENT_NOT_WATCHED), ...Object.keys(NOT_OUR_BOUNDS)]
      .filter((b) => !new RegExp(`^\\s{2}${b}:`, "m").test(PLANE_AIRUN.slice(PLANE_AIRUN.indexOf("export const RUN_BOUNDS")))),
    []);

  console.log("\n  -- SK-2's review criterion, as CODE: a judgement may not touch control flow --");
  for (const field of NOT_JUDGEABLE) {
    const r = applyJudgement({ pass: 0 }, { [field]: 99 });
    t(`a judgement setting \`${field}\` is REFUSED and NAMED`, [r.ok, r.overreach], [false, [field]]);
  }
  t("the refusal cites the measurement rather than a preference",
    /TREC 2011/.test(applyJudgement({}, { maxPasses: 99 }).detail), true);
  t("a judgement setting only judgeable fields is accepted",
    applyJudgement({ pass: 0 }, { candidates: [{ name: "x" }] }).ok, true);
  t("and it changes ONLY what it named",
    applyJudgement({ pass: 7, candidates: [] }, { candidates: [1] }).state, { pass: 7, candidates: [1] });
  t("a mixed judgement is refused whole, never partly applied",
    applyJudgement({ pass: 7 }, { candidates: [1], pass: 0 }).ok, false);
  t("JUDGEABLE and NOT_JUDGEABLE are disjoint", JUDGEABLE.filter((k) => NOT_JUDGEABLE.includes(k)), []);
}

console.log("\n--- A5 · the four-level fan-out, and the levels are the PLANE's vocabulary ---");
{
  /* THE SOURCE PIN. `LEVELS` is a copy (a fleet member ships alone and the plane
     publishes no op that names them), so what closes the drift is reading the
     plane's own file. A fifth level added there fails HERE rather than silently
     going unsearched — which is D-113's purge-list defect, one directory over. */
  const blk = PLANE_AIRUN.match(/export const OBSERVATION_LEVELS = \{([\s\S]*?)\n\};/);
  t("the plane's OBSERVATION_LEVELS block was actually found", blk != null, true);
  const planeLevels = [...blk[1].matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
  t("the plane declares four levels", planeLevels.length, 4);
  t("and LEVELS is exactly the plane's set, in the plane's order", LEVELS, planeLevels);
}

console.log("\n--- A6 · SK-4's gate is a ROW in this table, not a sentence in a skill ---");
{
  t("CHECK is deployed", MODES.check.deployed, true);
  t("investigate-fresh is NOT deployed", MODES.investigate.deployed, false);
  const gate = (mode) => nextStep({ step: "gate-mode", mode, pass: 0, maxPasses: 3 });
  t("a CHECK run passes the gate to `resume`", gate("check").step, "resume");
  t("an investigate run is CLOSED at the gate", gate("investigate").step, "close");
  /* CORRECTED 2026-08-10 BY FL-7 (IC-62), AND THE OLD EXPECTATION WAS `cancelled`.
     IT WAS RIGHT WHEN WRITTEN because it recorded what the gate then DID; it was
     never right about what the gate MEANT. The plane defines `cancelled` as "a
     member stopped it" and no member is present at this branch — the gate refused
     a launch before anything was spent — so the assertion was pinning a
     misattribution rather than a rule. FL-7 added `mode-not-deployed` to the
     plane's RUN_ENDINGS (the word this file's own header had already promised and
     nothing had ever defined) and this arm moved with the fix. */
  t("and the ending NAMES THE MACHINE THAT ACTED — a gate refusal is not a member cancelling a run",
    gate("investigate").bound, "mode-not-deployed");
  t("the refusal cites VF-5/SK-4's sequencing", /VF-5\/SK-4/.test(gate("investigate").why), true);
  t("an unknown mode is closed too, never defaulted to CHECK", gate("wat").step, "close");
  t("an absent mode is closed too", gate(undefined).step, "close");
  /* OVER-STRICTNESS, and it is the arm that keeps the correction honest: the fix
     must not have made `cancelled` unreachable or unmeaning. A member stopping a
     run is still `cancelled`, and the gate must never produce that word. */
  t("the gate NEVER closes on `cancelled` for any mode it refuses — the member's word is not the machine's",
    ["wat", undefined, "investigate", ""].map((m) => gate(m).bound).filter((b) => b === "cancelled"), []);
  /* THE GATE FIRES BEFORE ANY BOUND IS CONSULTED. A mode that is not deployed
     must not be able to report that it ran out of budget — that would be a run
     that never should have started blaming the budget. */
  t("the gate fires even with every budget exhausted",
    nextStep({ step: "gate-mode", mode: "investigate", pass: 9, maxPasses: 1,
               budget: { fetches: { allowed: 1, consumed: 9 } } }).bound, "mode-not-deployed");
}

console.log("\n--- A6b · THE HEADER AND THE PLANE'S CATALOGUE AGREE, ASSERTED IN BOTH DIRECTIONS (FL-7) ---");
{
  /* WHY THIS ARM EXISTS, and it is a receipt rather than a precaution. From FL-3
     until FL-7 this file's header said a refused run "terminates on
     `mode-not-deployed`" while the code closed on `cancelled`, and
     `mode-not-deployed` was defined NOWHERE — it appeared exactly once in the
     whole repository, in that comment. Two failures, and NEITHER was catchable:
     a comment naming a value nothing defines, and a gate producing a value the
     comment contradicts. **One direction of assertion would have caught one of
     them.** Both directions are asserted here, and they fail independently.

     THE EXPECTATION IS THE PLANE'S OWN SOURCE, NEVER A LITERAL RE-TYPED HERE.
     A6's LEVELS pin (just above) is the precedent and the reason is the same:
     an expected set derived from the thing under test moves with it and proves
     nothing — three items shipped exactly that defect on 2026-08-10. So the
     catalogue is PARSED out of `bio-plane/src/airun.mjs`, the header is READ as
     text out of `../src/harness.mjs`, and the two are compared to each other. */
  const blk = PLANE_AIRUN.match(/export const RUN_ENDINGS = \{([\s\S]*?)\n\};/);
  t("the plane's RUN_ENDINGS block was actually found — a silent no-match would pass everything",
    blk != null, true);
  const planeEndings = [...(blk?.[1] ?? "").matchAll(/^\s{2}"?([\w-]+)"?\s*:/gm)].map((m) => m[1]);
  t("REACH: the parse found a non-trivial catalogue (floor 3), so neither direction below is vacuous",
    planeEndings.length >= 3, true);

  /* THE HEADER'S CLAIM IS A SPECIFIC SENTENCE, SO IT IS READ AS ONE. The prose
     says a refused run *"terminates on `X`"*, and that phrase is the whole
     contract between this file's documentation and the record's vocabulary.
     Parsing THAT rather than sweeping every backticked word in the file is what
     keeps the arm from being answered by an unrelated token — and it is why the
     header may still DISCUSS `cancelled` historically (it does, at length)
     without confusing this measurement: only the terminates-on claim is a claim.

     Read from the file's leading prose — everything ahead of its first `export`,
     which is all comment — so no line of CODE can satisfy an assertion that is
     about the DOCUMENTATION. A whole-file grep would have been answered by the
     gate's own string literal and would have passed throughout the entire
     period this arm exists to have caught. */
  const firstExport = HARNESS_SRC.indexOf("\nexport ");
  t("REACH: the file's leading prose was isolated ahead of its first export", firstExport > 0, true);
  const HEADER_PROSE = HARNESS_SRC.slice(0, firstExport > 0 ? firstExport : HARNESS_SRC.length);
  t("REACH: and that prose contains no executable export, so DIRECTION 1 below cannot be answered by code",
    /^\s*export /m.test(HEADER_PROSE), false);
  const claim = /terminates on `([\w-]+)`/.exec(HEADER_PROSE);
  t("the header still makes its terminates-on claim at all — a deleted sentence must not read as agreement",
    claim != null, true);

  /* DIRECTION 1 — HEADER -> CATALOGUE. The word the header promises must EXIST
     in the plane's catalogue. THIS IS THE HALF THAT WAS MISSING FOR THE WHOLE
     PRE-FL-7 PERIOD: the header promised `mode-not-deployed` and nothing
     anywhere defined it, and no arm could contradict a comment. */
  t("DIRECTION 1 (header -> catalogue): the ending this header promises a refused run terminates on is DEFINED "
    + "in the plane's RUN_ENDINGS. Pre-FL-7 it was defined nowhere in the repository and this direction is what "
    + "now refuses that",
    planeEndings.includes(claim?.[1] ?? "(no claim)"), true);

  /* DIRECTION 2 — CODE -> HEADER. The ending the gate ACTUALLY closes on must be
     the word the header promises. THIS HALF WAS ALSO MISSING: the code said
     `cancelled`, the header said otherwise, and nothing compared them. */
  const actual = nextStep({ step: "gate-mode", mode: "investigate", pass: 0, maxPasses: 3 }).bound;
  t("DIRECTION 2 (code -> header): the ending the gate actually produces IS the one the header promises — "
    + "the two halves are compared to each other, so either one drifting fails here",
    actual, claim?.[1] ?? "(no claim)");
  t("and the produced ending is the PLANE's, not one this member minted (DEC-8's drift class)",
    planeEndings.includes(actual), true);
}

console.log("\n--- A7 · §9's empty-level kind is DERIVED BY THE TABLE (VF-1's owed control 7) ---");
{
  const reports = [
    { level: "meaning", state: "LOOKED_ABSENT", observed_at: "log:11" },
    { level: "content", state: "NEVER_LOOKED" },
    { level: "document", state: "LOOKED_INDETERMINATE", observed_at: "log:13" },
    { level: "internet", state: "partial", observed_at: "log:14" },
  ];
  const out = emptyLevelCandidates({ reports }, "INQ-1");
  t("exactly one candidate, for the one level that was LOOKED_ABSENT", out.map((c) => c.level), ["meaning"]);
  t("it is §9's kind", out[0]?.kind ?? null, "level-empty");
  t("it names the inquiry and the observation-log address that establishes it",
    [out[0]?.target ?? null, out[0]?.observed_at ?? null], ["INQ-1", "log:11"]);
  /* D-129's four are DIFFERENT CLAIMS and only one of them is an absence. */
  for (const st of ["NEVER_LOOKED", "LOOKED_INDETERMINATE", "PRESENT", "partial"])
    t(`'${st}' does NOT produce an empty-level claim`,
      emptyLevelCandidates({ reports: [{ level: "meaning", state: st, observed_at: "x" }] }, "I"), []);
  t("all four empty produce four candidates, one per level — absence at one level is not absence at the next",
    emptyLevelCandidates({ reports: LEVELS.map((l) => ({ level: l, state: "LOOKED_ABSENT", observed_at: "x" })) }, "I")
      .map((c) => c.level), LEVELS);
  t("no reports at all produce nothing (an unrun search is not an absence)",
    emptyLevelCandidates({ reports: [] }, "I"), []);
  t("and a malformed state carries nothing", emptyLevelCandidates({}, "I"), []);
}

console.log("\n--- A8 · log-always: every row logs, and the entry is in the PLANE's vocabulary ---");
{
  t("every row declares `logs: true`",
    Object.keys(CONTROL_FLOW).filter((s) => CONTROL_FLOW[s].logs !== true), []);
  const e = stepLog({ step: "fanout", level: "document", observed: "LOOKED_ABSENT" },
                    { step: "collect", why: "four sub-sessions spawned" });
  t("the entry names the transition it records", e.subject, "fanout -> collect");
  t("and carries D-129's state", e.state, "LOOKED_ABSENT");
  t("a control-flow entry that observed nothing is NEVER_LOOKED, not an absence",
    stepLog({ step: "plan" }, { step: "fanout", why: "w" }).state, "NEVER_LOOKED");
  const term = stepLog({ step: "next-pass" }, { step: "close", why: "done", bound: "completed" });
  t("the terminal entry is marked terminal and names the bound", [term.terminal, term.bound], [true, "completed"]);
  t("a non-terminal entry names no bound",
    [e.terminal, e.bound], [false, null]);
  /* D-104's split travels: our governor holding a host is a fact about US. */
  t("a governed observation carries the flag the plane's C-22.2 reads",
    stepLog({ step: "plan", governed: true }, { step: "fanout", why: "w" }).governed, true);
  t("every state this harness can emit is in the plane's D-129 vocabulary",
    ["NEVER_LOOKED", "LOOKED_ABSENT", "LOOKED_INDETERMINATE", "PRESENT", "partial"]
      .filter((s) => !new RegExp(`^\\s{2}${s}:`, "m").test(PLANE_AIRUN)), []);
}

console.log("\n--- A9 · query-never-load: the ops are PINNED, and every one is the plane's ---");
{
  /* THE PLANE'S OWN OPS TABLE, PARSED — not a list retyped here. An op that
     changes its `mutating` flag in the plane fails this arm rather than this
     member quietly calling a write it believed was a read. */
  const planeOps = new Map([...PLANE_INDEX.matchAll(/^  ([a-z][a-z0-9]*):\s*\{[^}\n]*mutating:\s*(true|false)/gm)]
    .map((m) => [m[1], m[2] === "true"]));
  t("the plane's OPS table parsed (guard: an empty parse would pass everything)", planeOps.size > 100, true);
  t("every op this harness names EXISTS in the plane's OPS table",
    Object.keys(PLANE_OPS).filter((op) => !planeOps.has(op)), []);
  t("and this harness's `mutating` flag agrees with the plane's, op for op",
    Object.keys(PLANE_OPS).filter((op) => PLANE_OPS[op].mutating !== planeOps.get(op)), []);

  /* FLOOR AND CEILING BOTH, exactly as FL-2 pinned `{whoami}`. A call this
     member gains is a call somebody decided to give it, and a call it loses is
     visible too. */
  t("the pinned op set is exactly these nine",
    Object.keys(PLANE_OPS).sort(),
    ["airun", "airunclose", "airunlog", "airunspawn", "airuntick",
     "basisversions", "capturerequest", "meaningrows", "suggest", "whoami"].sort());
  t("every op the DRIVER actually names is in the pinned set",
    [...new Set([...WORKER_CODE.matchAll(/call\(\s*"([a-z]+)"/g)].map((m) => m[1]),
      )].filter((op) => !PLANE_OPS[op]), []);
  t("and the round trip's own op is too",
    [...new Set([...WORKER_CODE.matchAll(/askPlane\(\s*env\s*,\s*"([a-z]+)"/g)].map((m) => m[1]))]
      .filter((op) => !PLANE_OPS[op]), []);
  t("every mutating op in the set is one PL-11's credential scope can declare (AI_RUN_ACTIONS)",
    Object.keys(PLANE_OPS).filter((op) => PLANE_OPS[op].mutating)
      .filter((op) => !new RegExp(`const AI_RUN_ACTIONS = \\[[^\\]]*"${op}"`).test(PLANE_INDEX)), []);

  /* QUERY, NEVER LOAD. The meaning-grain read is PL-9's op and this item
     CONSUMES it — there must be exactly one meaning reader named anywhere in
     this member, and no second one built beside it. */
  t("the meaning-grain read is PL-9's op", PLANE_OPS.meaningrows != null, true);
  t("and it is named in exactly one place in the driver",
    [...WORKER_CODE.matchAll(/"meaningrows"/g)].length, 1);
  t("no op in the pinned set serves document BYTES",
    Object.keys(PLANE_OPS).filter((op) => ["capture", "acquire", "image", "archivelookup", "publishedmanifest"].includes(op)), []);

  console.log("\n  -- and the harness holds NO scope, NO class and NO allow-list (D-199 (2)) --");
  t("no token class is named in the harness", /\bclass\s*:\s*["']ai["']/.test(HARNESS_CODE), false);
  t("no credential is compiled in", /["'`]aik-/.test(HARNESS_CODE), false);
  t("the harness performs no I/O at all — it is pure", /\bfetch\s*\(/.test(HARNESS_CODE), false);
  t("and reads no clock", /Date\s*\.\s*now|new\s+Date\b/.test(HARNESS_CODE), false);
  t("and no global state", /globalThis|process\s*\./.test(HARNESS_CODE), false);
}

/* ================================================================
 * PART B · THROUGH `POST /run`, INSIDE WORKERD
 * ================================================================ */
console.log("\n=== PART B · the same table driven through the op, over a real service binding ===");

const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  const resolved = createRequire(planePkg).resolve("miniflare");
  return await import(pathToFileURL(resolved).href);
})();

const sha = (v) => createHash("sha256").update(v).digest("hex");
const AIK = "aik-" + "a".repeat(64);

/* THE PLANE MOCK. FL-2's, extended with the run object, the observation log,
   the budget with a real exhaustion path, and F10's plane side as PL-3 built
   it. `MUTATING` is the set that moves the RECORD. */
const PLANE_MOCK = `
const MUTATING = new Set(["purge","promote","airunopen","airuntick","airunclose","suggest","capturerequest"]);
const canon = (v) => {
  if (v === null || typeof v !== "object") return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
};
export default {
  async fetch(req, env) {
    const CFG = JSON.parse(env.MOCK || "{}");
    if (!globalThis.__S) globalThis.__S = {
      record: { rows: [] }, log: [], runlog: (CFG.priorLog || []).slice(),
      budget: Object.fromEntries((CFG.budget || []).map((b) => [b.bound, { allowed: b.allowed, consumed: b.consumed || 0 }])),
      refusals: new Map(), status: "running", ended: null, suggested: [], spawns: 0, seq: (CFG.priorLog || []).length,
    };
    const S = globalThis.__S;
    const url = new URL(req.url);
    if (url.pathname === "/__mock/state")
      return Response.json({ record: S.record, log: S.log, runlog: S.runlog, budget: S.budget,
                             status: S.status, ended: S.ended, suggested: S.suggested, spawns: S.spawns,
                             repeats: [...S.refusals.values()].map((r) => r.repeats) });
    const op = url.searchParams.get("op") || "";
    const token = url.searchParams.get("token") || "";
    const store = url.searchParams.get("store") || "";
    let body = null;
    if (req.method === "POST") { try { body = await req.json(); } catch { body = null; } }
    S.log.push({ op, token, store, method: req.method, body });
    if (MUTATING.has(op)) S.record = { rows: [...S.record.rows, { op, at: S.log.length }] };

    if (op === "whoami")
      return Response.json({ ok: true, result: { tokenClass: "ai", session: false, member: null }, store, tokenClass: "ai" });

    if (op === "airun")
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true, session: {
        id: url.searchParams.get("run"), mode: CFG.mode || "check", status: S.status,
        context: { type: "inquiry", id: CFG.target || "INQ-1" },
        max_passes: CFG.maxPasses || 1,
        budget: Object.entries(S.budget).map(([bound, b]) => ({ bound, allowed: b.allowed, consumed: b.consumed, unit: null })),
      } }, store });

    if (op === "airunlog")
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true,
        entries: S.runlog, limit: 200, truncated: false } });

    if (op === "airunspawn") {
      S.spawns += 1;
      /* PL-12's fence: the SEARCH half's payload has NO bias key AT ALL — not
         null, absent. Written as an explicit literal here for the same reason
         store.mjs writes it as one: a field acquires a value the first time
         somebody thinks they are being helpful. */
      return Response.json({ ok: true, result: { run: url.searchParams.get("run"), found: true, half: "search",
        payload: { run: url.searchParams.get("run"), context: { type: "inquiry", id: CFG.target || "INQ-1" },
                   mode: CFG.mode || "check", skill: "pack-1.0.0", standard_pair: null, budget: [] } } });
    }

    ${meaningRowsBranch("CFG.meaningRows || []")}

    if (op === "basisversions")
      return Response.json({ ok: true, result: { id: url.searchParams.get("id"),
        versions: (CFG.heldVersions || []).map((n) => ({ name: n })), limit: 50, truncated: false } });

    if (op === "airuntick") {
      if (S.status !== "running")
        return Response.json({ ok: true, result: { ticked: false, status: S.status,
          note: "this run has ended; its log is closed and a later tick does not reopen it" } });
      let appended = 0;
      for (const e of Array.isArray(body && body.log) ? body.log : []) { S.runlog.push({ seq: ++S.seq, ...e }); appended += 1; }
      for (const [k, v] of Object.entries((body && body.consume) || {}))
        if (S.budget[k]) S.budget[k].consumed += Number(v) || 0;
      /* THE EXHAUSTION CHECK, READ BACK RATHER THAN TRUSTED — and it terminates
         through the ONE exit, appending the terminal entry in the same act as
         the status change, exactly as PL-5's #aiRunTerminate does. The
         'runtime' -> 'runtime-ceiling-reached' mapping is the plane's and is
         reproduced here rather than invented. */
      const order = ["fetches","subsessions","wallclock","runtime","lease"];
      const hit = order.find((b) => S.budget[b] && S.budget[b].allowed > 0 && S.budget[b].consumed >= S.budget[b].allowed);
      if (hit) {
        const condition = hit === "runtime" ? "runtime-ceiling-reached" : null;
        S.runlog.push({ seq: ++S.seq, level: "document", state: "LOOKED_INDETERMINATE", terminal: 1,
                        bound: hit, condition, detail: "the run stopped because the '" + hit + "' bound was reached" });
        S.status = "stopped";
        S.ended = { bound: hit, condition };
        return Response.json({ ok: true, result: { ticked: true, appended, status: "stopped",
                                                   ended: { terminated: true, bound: hit, condition } } });
      }
      return Response.json({ ok: true, result: { ticked: true, appended, status: "running" } });
    }

    if (op === "airunclose") {
      const bound = (body && body.bound) || null;
      if (!bound)
        return Response.json({ ok: false, reason: "AI_RUN_BOUND_UNNAMED", code: "AI_RUN_BOUND_UNNAMED",
          check: "C-22.5", translation: "That run stopped without saying what stopped it." }, { status: 400 });
      S.runlog.push({ seq: ++S.seq, level: "document", state: "LOOKED_INDETERMINATE", terminal: 1, bound, condition: null });
      S.status = bound === "completed" || bound === "cancelled" ? "finished" : "stopped";
      S.ended = { bound, condition: null };
      return Response.json({ ok: true, result: { terminated: true, bound, condition: null } });
    }

    if (op === "capturerequest")
      return Response.json({ ok: true, result: { request: "REQ-" + S.log.length, state: "queued" } });

    if (op === "suggest") {
      const sub = canon(body || {});
      const prior = S.refusals.get(sub);
      if (prior) {
        /* F10, THE PLANE'S HALF: the stored refusal comes back WITHOUT the
           checks being re-run, and the counter climbs. Nothing else moves. */
        prior.repeats += 1;
        return Response.json({ ok: true, result: { ...prior.payload, repeated: true, evaluated: false,
                                                   wrote: false, repeats: prior.repeats } });
      }
      /* PL-3's CHECK 5 — NO BOILERPLATE — reproduced as a PREDICATE ON THE FIELD
         rather than on the version's name, and that distinction is load-bearing
         for the F10 arm. The first spelling of this mock refused by NAME, so a
         submission whose description had been properly rewritten was refused
         again for a reason the adjustment could never answer; the arm then
         measured "an adjustment that changed nothing useful" while claiming to
         measure "an adjustment". Refusing on the offending FIELD is what makes
         the adjusted submission genuinely acceptable, which is the case F10
         exists for. */
      const refuseAs = (CFG.boilerplate || []).includes(String((body && body.description) ?? ""))
        ? "SUGGEST_BOILERPLATE"
        : (CFG.refuse || {})[String((body && body.name) || "")];
      if (refuseAs) {
        const payload = { ok: false, code: refuseAs, reason: refuseAs, check: "C-27.13",
          translation: "A machine composes a reading and does not assert its structure.", wrote: false };
        S.refusals.set(sub, { payload, repeats: 0 });
        return Response.json({ ok: true, result: { ...payload, repeated: false, evaluated: true } });
      }
      S.suggested.push({ name: (body && body.name) || null, kind: (body && body.kind) || null, canon: sub });
      return Response.json({ ok: true, result: { wrote: true, version: (body && body.name) || null } });
    }
    return Response.json({ ok: false, error: "unknown op: " + op }, { status: 400 });
  },
};
`;

const newMf = (cfg = {}) => new Miniflare({
  workers: [
    { name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: WORKER_SRC_PATH, script: WORKER_SRC,
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { VERSION: "test" },
      serviceBindings: { PLANE: "plane-mock" } },
    { name: "plane-mock", modules: true, script: PLANE_MOCK,
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      bindings: { MOCK: JSON.stringify(cfg) } },
  ],
});

const runOp = (mf, body) =>
  mf.dispatchFetch("http://agent-worker/run", { method: "POST", body: JSON.stringify(body) });
const mockState = async (mf) =>
  (await (await (await mf.getWorker("plane-mock")).fetch("http://plane/__mock/state")).json());
const base = { run_id: "run-1", store: "scratch", credential: AIK };
const wide = [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
               { bound: "wallclock", allowed: 500000 }, { bound: "runtime", allowed: 5000 }];

console.log("\n--- B1 · a CHECK run walks the table and the plane holds the whole trace ---");
{
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide });
  const res = await runOp(mf, base);
  t("200", res.status, 200);
  const out = await res.json();
  t("ok", out.ok, true);
  t("the stage says the HARNESS ran, not a round trip", out.stage, "harness");
  console.log("\n  -- and it still says WHICH HALF ran: no model turns, FL-6's cascade unresolved --");
  t("zero model turns, stated", out.turns_run, 0);
  t("the judgement source is named rather than implied", out.judgement_source, "supplied");
  t("the mode is the RECORD's", out.mode, "check");
  t("the run ended and named its bound", out.ended?.bound ?? null, "completed");

  const st = await mockState(mf);
  console.log("\n  -- LOG-ALWAYS: one observation entry per step, and the last one is TERMINAL --");
  t("the plane's observation log is not empty", st.runlog.length > 0, true);
  t("every step the trace names produced a log entry", (out.trace || []).length + 1, st.runlog.length);
  t("the last entry is terminal", st.runlog[st.runlog.length - 1]?.terminal ?? null, 1);
  t("and names the bound", st.runlog[st.runlog.length - 1]?.bound ?? null, "completed");

  console.log("\n  -- THE FOUR-LEVEL FAN-OUT: four sub-sessions, one per level, per pass --");
  t("four spawn payloads were taken", st.spawns, LEVELS.length);
  t("the sub-session count was charged to the budget", st.budget.subsessions.consumed, LEVELS.length);

  console.log("\n  -- the table's order is the table's: dedup ALWAYS falls between compose and submit --");
  const edges = (out.trace || []).map((x) => `${x.step}>${x.to}`);
  t("the run started at the gate", out.trace?.[0]?.step ?? null, "gate-mode");
  t("the gate went to `resume` before anything else was done", edges[0] ?? null, "gate-mode>resume");
  t("compose is followed by dedup, every time",
    (out.trace || []).filter((x) => x.step === "compose").every((x) => x.to === "dedup"), true);
  t("no step in the trace went anywhere its row does not declare",
    (out.trace || []).filter((x) => !(CONTROL_FLOW[x.step]?.to || []).includes(x.to) && x.step !== "close"), []);

  console.log("\n  -- ONE credential, the one it was handed, and never echoed --");
  const tokens = [...new Set(st.log.map((l) => l.token))];
  t("exactly one distinct credential reached the plane", tokens.length, 1);
  t("and it is the one handed in", tokens[0], AIK);
  t("the response body does not contain the credential", JSON.stringify(out).includes(AIK), false);

  console.log("\n  -- every op named is in the pinned set, and NO other op was reached --");
  t("the ops actually named are a subset of the pinned set",
    [...new Set(st.log.map((l) => l.op))].filter((op) => !PLANE_OPS[op]), []);

  /* PL-12's FENCE MOVED TO `fanout.test.mjs` AT FL-5, AND THE OLD ARM IS
     CORRECTED HERE RATHER THAN DELETED — it was measured VACUOUS and the
     measurement belongs on the record. It read:

       t("no search-half spawn payload carried a bias field",
         (out.trace || []).filter((x) => x.note && /manifest_field_present/.test(x.note)), []);

     `manifest_field_present` was computed into a local (`spawned`) that never
     reached the wire, and the trace note it grepped is fixed text that never
     contains the phrase — so the arm could only ever fail if somebody wrote those
     nineteen characters into a note. MEASURED at FL-5 rather than reasoned:
     with the plane mock's SEARCH-half payload made to carry a full bias block,
     this suite stayed **194 pass / 0 fail** and this arm PASSED. A mechanism
     believed on the strength of its existence rather than its behaviour is the
     defect this project meets most often, and it had one here.
     FL-5's replacement is a REFUSAL and three arms that can fail: the driver
     refuses a search payload carrying the lens (`SPAWN_PAYLOAD_CARRIES_LENS`),
     the spawn contract is published on the wire so its key set is read rather
     than promised, and a manifest genuinely in force on the composing half must
     appear in ZERO bytes of what any sub-session was handed. */
  console.log("\n  -- the fan-out spawned per level; FL-5's fence arms live in fanout.test.mjs --");
  t("four sub-session contracts were composed, one per level",
    (out.fanout?.contracts || []).map((c) => c.level), LEVELS);
  await mf.dispose();
}

console.log("\n--- B2 · §14b.7 — A RESUMED RUN READS ITS OWN LOG AND CONTINUES ---");
{
  const prior = Array.from({ length: 7 }, (_, i) => ({ seq: i + 1, level: "document", state: "NEVER_LOOKED",
    subject: "earlier segment", terminal: 0, bound: null }));
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide, priorLog: prior });
  const out = await (await runOp(mf, base)).json();
  t("it read its own log and says how much of it there was", out.resumed_from, 7);
  const resume = out.trace.find((x) => x.step === "resume");
  t("the resume step says it is CONTINUING rather than restarting", /continuing rather than restarting/.test(resume?.why ?? ""), true);
  t("and names how many observations it carried", /7 observation/.test(resume?.why ?? ""), true);

  const st = await mockState(mf);
  t("the prior entries are still there — the log is APPENDED, never rewritten",
    st.runlog.slice(0, 7).map((e) => e.subject), prior.map((e) => e.subject));
  t("and this segment's entries came after them", st.runlog.length > 7, true);

  /* THE ARM THAT MAKES IT A RESUMPTION AND NOT A COINCIDENCE: a run with an
     EMPTY log says the opposite thing, so the sentence tracks the log rather
     than being printed either way. */
  const mf2 = newMf({ mode: "check", maxPasses: 1, budget: wide });
  const out2 = await (await runOp(mf2, base)).json();
  t("a run with no prior log says its log is EMPTY, not that it resumed", out2.resumed_from, 0);
  t("and says so in words", /log is empty/.test(out2.trace?.find((x) => x.step === "resume")?.why ?? ""), true);
  await mf2.dispose();
  await mf.dispose();
}

console.log("\n--- B3 · A BUDGET EXHAUSTION WRITES `runtime-ceiling-reached` ---");
{
  /* The `runtime` allowance is small, so the platform ceiling (D-54, D-56) is
     reached partway through. Nothing in this member emits the word: the harness
     SPENDS one unit per plane call and the PLANE writes the condition at its own
     one exit — which is the half §14b.6 said the record had a word for and no
     writer, and IS-9(d) is this item. */
  const mf = newMf({ mode: "check", maxPasses: 9,
    budget: [{ bound: "fetches", allowed: 50 }, { bound: "subsessions", allowed: 50 },
             { bound: "wallclock", allowed: 500000 }, { bound: "runtime", allowed: 6 }] });
  const out = await (await runOp(mf, base)).json();
  t("the run ended on the runtime bound", out.ended?.bound ?? null, "runtime");
  t("and the CONDITION is the record's own word", out.ended?.condition ?? null, "runtime-ceiling-reached");
  t("the ending was the PLANE's, not the table's", out.ended?.by ?? null, "the plane's own exit");

  const st = await mockState(mf);
  const term = st.runlog.filter((e) => e.terminal === 1);
  t("exactly one terminal entry was written", term.length, 1);
  t("it names the bound", term[0]?.bound ?? null, "runtime");
  t("and carries `runtime-ceiling-reached` in the observation log itself", term[0]?.condition ?? null, "runtime-ceiling-reached");
  t("the run is stopped, not finished", st.status, "stopped");

  /* THE WORD IS THE PLANE'S AND THIS MEMBER NEVER EMITS IT. A second producer
     inside a fleet member would be a copy of the plane's rule (DEC-8's drift
     class, and fleet rule 2 besides).
     ASSERTED BEHAVIOURALLY, AND THE FIRST SPELLING OF THIS ARM WAS WRONG —
     RECORDED RATHER THAN QUIETLY WIDENED. It read "the string appears nowhere in
     the source", and it came back RED over a DOC STRING in `SPENT_NOT_WATCHED`
     explaining that the plane writes the word. A member that DOCUMENTS whose
     word it is is doing the opposite of claiming it, so the arm was measuring
     the wrong thing: what must be true is that this member never SENDS it. The
     request bodies the plane received are the evidence, and that is a stronger
     arm than the source scan it replaces — it would also catch the word arriving
     by concatenation, which a literal scan cannot see. */
  t("this member sent the word to the plane exactly ZERO times",
    st.log.filter((l) => /runtime-ceiling-reached/.test(JSON.stringify(l.body ?? null))).length, 0);
  t("and it never assigns it as a condition anywhere in its source",
    /condition\s*:\s*["'`]runtime-ceiling-reached/.test(WORKER_CODE + HARNESS_CODE), false);
  t("the word nevertheless reached the observation log — written by the PLANE",
    st.runlog.some((e) => e.condition === "runtime-ceiling-reached"), true);
  t("a run that ended is not ticked again after its exit",
    st.log.filter((l) => l.op === "airuntick").length <= st.runlog.length, true);
  await mf.dispose();
}

console.log("\n--- B4 · F10 — A REFUSAL IS FOLLOWED BY AN ADJUSTED SUBMISSION IN THE TRACE ---");
{
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide, boilerplate: ["TBD"] });
  const res = await runOp(mf, {
    ...base,
    /* THE JUDGEMENT LIST GAINED A SLOT AT FL-5 AND THE OLD SHAPE WAS WRONG
       RATHER THAN MERELY OLD. Judgements are consumed in order by the rows that
       judge, and FL-5 made `collect` one of them — because a sub-session's return
       must be held to the REPORT contract at the row that COLLECTS it, not at
       `compose`, which is the row that has already interpreted it. Supplying
       `reports` at `compose` was therefore supplying them one row after the
       contract could protect anything. */
    judgements: [
      { targets: [] },                                                   /* plan */
      { reports: [] },                                                   /* collect */
      { candidates: [{ kind: "new-version", name: "v1", description: "TBD" }] }, /* compose */
      {},                                                                /* dedup */
      { submission: { kind: "new-version", name: "v1", description: "what changed, and why, in full" } }, /* adjust */
    ],
  });
  const out = await res.json();
  t("the run completed", out.ok, true);
  const edges = (out.trace || []).map((x) => `${x.step}>${x.to}`);
  t("the refusal routed to ADJUST", edges.includes("submit>adjust"), true);
  t("and the adjust routed BACK to submit", edges.includes("adjust>submit"), true);
  t("there is NO submit>submit edge carrying a refusal — no verbatim retry", out.verbatim_resubmits, 0);
  t("exactly one adjustment was made", out.adjusted, 1);
  t("the refusal is on the wire, in the PLANE's words", out.refusals[0]?.code ?? null, "SUGGEST_BOILERPLATE");
  t("with the plane's C-number unchanged", out.refusals[0]?.plane?.check ?? null, "C-27.13");
  t("and the plane's canned translation unchanged, to the byte",
    out.refusals[0]?.plane?.translation ?? null,
    "A machine composes a reading and does not assert its structure.");

  const st = await mockState(mf);
  const submits = st.log.filter((l) => l.op === "suggest");
  t("the endpoint was called twice: the refused one and the adjusted one", submits.length, 2);
  t("and the SECOND submission differs from the first — byte for byte, canonically",
    canonical(submits[0]?.body ?? null) !== canonical(submits[1]?.body ?? null), true);
  t("PL-3's `repeats` counter stayed at ZERO, which is what a table rather than a budget buys",
    st.repeats, [0]);
  t("the adjusted version LANDED", st.suggested.map((s) => s.name), ["v1"]);
  await mf.dispose();
}

console.log("\n--- B5 · F10's other half: an unanswerable refusal DROPS the candidate, never resends ---");
{
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide, refuse: { v1: "SUGGEST_UNWRITABLE_STATE" } });
  const out = await (await runOp(mf, {
    ...base,
    judgements: [
      { targets: [] },
      { reports: [] },                                                   /* collect — FL-5's row */
      { candidates: [{ kind: "new-version", name: "v1", description: "d" }] },
      {},
      /* THE MODEL HANDS BACK THE SAME SUBMISSION — which is what happens when
         the refusal names an act a machine cannot perform (DEC-65's measured
         case: a machine may not assert a version's structure). */
      { submission: { kind: "new-version", name: "v1", description: "d" } },
    ],
  })).json();
  const edges = (out.trace || []).map((x) => `${x.step}>${x.to}`);
  t("the refusal still routed to ADJUST", edges.includes("submit>adjust"), true);
  t("and the adjust DROPPED the candidate rather than resending it", edges.includes("adjust>next-pass"), true);
  t("nothing was adjusted", out.adjusted, 0);
  t("and nothing was resent", out.verbatim_resubmits, 0);
  const st = await mockState(mf);
  t("the endpoint was called ONCE — the same bytes were never sent twice",
    st.log.filter((l) => l.op === "suggest").length, 1);
  t("so PL-3's `repeats` counter never moved", st.repeats, [0]);
  t("and nothing landed", st.suggested, []);
  await mf.dispose();
}

console.log("\n--- B6 · THE EMPTY RUN (VF-1's owed control 7): proposes NOTHING, emits §9's kind ---");
{
  /* An inquiry the evidence does not support. The model reports that it looked
     at every level and found nothing, and composes NO version. The run must
     still EMIT something, or an honest empty-handed run is indistinguishable
     from a run that failed silently. */
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide, target: "INQ-1" });
  const out = await (await runOp(mf, {
    ...base,
    judgements: [
      { targets: [] },
      /* THE REPORTS ARRIVE AT `collect` SINCE FL-5, where the return contract
         judges them. Each is a legal REPORT: an absence CITES NOTHING and is not
         required to — there would be nothing to cite — but it must say WHERE the
         search that establishes it was written down. */
      { reports: LEVELS.map((l, i) => ({ level: l, state: "LOOKED_ABSENT", observed_at: `log:${i + 1}` })) },
      { candidates: [] },
      {},
    ],
  })).json();
  const st = await mockState(mf);
  t("no legged version was proposed", st.suggested.filter((s) => s.kind !== "level-empty"), []);
  t("but FOUR level-empty suggestions were written — one per level",
    st.suggested.map((s) => s.kind), ["level-empty", "level-empty", "level-empty", "level-empty"]);
  t("each names its level", st.suggested.map((s) => s.name),
    LEVELS.map((l) => `level-empty:${l}`));
  t("and each carries the observation-log address that establishes it",
    st.log.filter((l) => l.op === "suggest").every((l) => typeof l.body.observed_at === "string" && l.body.observed_at), true);
  t("the run is therefore COUNTABLE: an empty run and a silent failure are different objects",
    [st.suggested.length > 0, out.submitted], [true, 4]);

  /* AND THE CONTRAST THAT MAKES IT A MEASUREMENT: a run whose levels were
     NEVER_LOOKED emits nothing, because an unrun search is not an absence. */
  const mf2 = newMf({ mode: "check", maxPasses: 1, budget: wide, target: "INQ-1" });
  const out2 = await (await runOp(mf2, {
    ...base,
    judgements: [{ targets: [] },
                 { reports: LEVELS.map((l) => ({ level: l, state: "NEVER_LOOKED" })) }, /* collect */
                 { candidates: [] },
                 {}],
  })).json();
  const st2 = await mockState(mf2);
  t("a run that never looked emits NO empty-level claim", st2.suggested, []);
  t("and submits nothing", out2.submitted, 0);
  await mf2.dispose();
  await mf.dispose();
}

console.log("\n--- B7 · SK-4's gate through the op: an investigate run stops before it spends ---");
{
  const mf = newMf({ mode: "investigate", maxPasses: 3, budget: wide });
  const out = await (await runOp(mf, base)).json();
  /* CORRECTED 2026-08-10 BY FL-7 (IC-62). THE OLD EXPECTATION WAS `cancelled`
     AND IT WAS RIGHT WHEN WRITTEN — it recorded what the gate then produced
     through the op, which is what this arm is for. It was never right about what
     the record then SAID: the plane defines `cancelled` as "a member stopped it",
     and this run was refused by a deployment gate with no member anywhere near
     it. FL-7 gave the machine's act its own word. This is the THROUGH-THE-OP
     half of the acceptance — the ending is read off what the op actually
     returned, not asserted at a store or off `nextStep`'s return value. */
  t("the run was closed at the gate, carrying an ending that NAMES WHAT HAPPENED — a machine refused the "
    + "launch, and the record no longer says a member stopped it",
    out.ended?.bound ?? null, "mode-not-deployed");
  /* THE MISATTRIBUTION ARM, stated as its own assertion so a regression NAMES
     the defect instead of failing an equality: whatever else changes, the word
     that means "a member did this" must never come out of this gate. */
  t("and it is NOT `cancelled` — the member-attribution assertion, which must fail naming it if the gate "
    + "ever closes a refused run under a member's word again",
    out.ended?.bound === "cancelled" ? "MISATTRIBUTED: a gate refusal recorded as a member cancellation" : "ok",
    "ok");
  t("it took exactly one step", (out.trace || []).length, 1);
  t("which was the gate", out.trace?.[0]?.step ?? null, "gate-mode");
  const st = await mockState(mf);
  t("no sub-session was spawned", st.spawns, 0);
  t("nothing was suggested", st.suggested, []);
  t("no fetch was requested", st.budget.fetches.consumed, 0);
  t("and the refusal IS in the log — a gate that closed silently would be unauditable",
    st.runlog.length > 0, true);
  await mf.dispose();
}

console.log("\n--- B8 · DEDUP-BEFORE-WRITE, observed at the plane ---");
{
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide, heldVersions: ["v1", "v2"] });
  const out = await (await runOp(mf, {
    ...base,
    judgements: [{ targets: [] },
                 { reports: [] },                                        /* collect — FL-5's row */
                 { candidates: [{ kind: "new-version", name: "v1" }, { kind: "new-version", name: "v3" }] },
                 {}],
  })).json();
  const st = await mockState(mf);
  t("the record was READ before anything was written",
    st.log.findIndex((l) => l.op === "basisversions") < st.log.findIndex((l) => l.op === "suggest"), true);
  t("the candidate the record already holds was never submitted",
    st.suggested.map((s) => s.name), ["v3"]);
  t("and exactly one write reached the endpoint", st.log.filter((l) => l.op === "suggest").length, 1);
  t("the trace says what dedup compared", /compared against 2 on the record/.test(
    out.trace?.find((x) => x.step === "dedup")?.note ?? ""), true);
  await mf.dispose();
}

console.log("\n--- B8b · D-276: THE MEANING READ SUCCEEDED, AND THE OBSERVATION ENTRY COUNTS REAL ROWS ---");
/* THE ARM THAT MAKES D-276 IMPOSSIBLE TO REINTRODUCE QUIETLY IN THIS SUITE.
   `compose`'s note used to be computed as `Array.isArray(got.rows) ? got.rows.length : 0`
   off a body nobody had checked, so a REFUSED read wrote `0 meaning-grain
   row(s) queried` into an AI run's observation entries — the record saying it
   looked and found nothing about a call that never happened. The mock now
   REFUSES an arm the plane's registry does not hold (`plane-meaning.mjs`), so
   staging rows here and asserting the note COUNTS them fails the moment the
   member's argument is wrong again. A count of zero would not have been enough:
   zero is exactly what the defect produced. */
{
  const rows = [{ ord: 0, role: "supports", grade: "B" }, { ord: 1, role: "cuts_against", grade: "C" }];
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide, meaningRows: rows });
  const out = await (await runOp(mf, {
    ...base,
    judgements: [{ targets: [] }, { reports: [] }, { candidates: [] }, {}],
  })).json();
  const compose = out.trace?.find((x) => x.step === "compose") ?? null;
  /* PRINTED, because the SENTENCE is the subject here and an arm that could only
     report `want true / got false` would tell a later reader that something
     about the note changed and never WHAT. The negative control reads this line
     to check that the false zero is really back. */
  console.log(`  observation entry: ${JSON.stringify(compose?.note ?? null)}`);
  t("ARMED: the run reached the step that reads the meaning layer", compose != null, true);
  t("the observation entry COUNTS the rows the record answered with, at the arm's own grain",
    new RegExp(`^${rows.length} meaning-grain row\\(s\\) queried at the '${MEANING_ARM}' grain;`)
      .test(compose?.note ?? ""), true);
  t("...and it does not say the meaning layer went UNREAD",
    /NOT READ/.test(compose?.note ?? ""), false);
  t("...and the run published no meaningrows refusal",
    (out.refusals || []).filter((r) => r && r.at === "meaningrows"), []);
  t("the arm this member sends is one the PLANE's registry holds, not a spelling of it",
    MEANING_ARMS.includes(String(MEANING_ARM).trim().toLowerCase()), true);
  await mf.dispose();
}

console.log("\n--- B9 · VERSIONS ARE WRITTEN AS FORMED, NEVER BATCHED ---");
{
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide });
  const out = await (await runOp(mf, {
    ...base,
    judgements: [{ targets: [] },
                 { reports: [] },                                        /* collect — FL-5's row */
                 { candidates: [{ kind: "new-version", name: "a" }, { kind: "new-version", name: "b" },
                                { kind: "new-version", name: "c" }] },
                 {}],
  })).json();
  const st = await mockState(mf);
  t("three candidates produced THREE separate calls, not one batch",
    st.log.filter((l) => l.op === "suggest").length, 3);
  t("each call carried exactly one version", st.log.filter((l) => l.op === "suggest")
    .every((l) => typeof l.body.name === "string" && !Array.isArray(l.body.versions)), true);
  t("and each was followed by its own tick, so a death after any one keeps what it found",
    (() => {
      const ops = st.log.map((l) => l.op);
      return ops.filter((o, i) => o === "suggest" && ops[i + 1] === "airuntick").length;
    })(), 3);
  t("all three landed", st.suggested.map((s) => s.name), ["a", "b", "c"]);
  t("the driver reports the same count", out.submitted, 3);
  await mf.dispose();
}

console.log("\n--- B10 · a judgement that reaches for control flow is REFUSED through the op ---");
{
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide });
  const res = await runOp(mf, { ...base, judgements: [{ targets: [], maxPasses: 9999 }] });
  const out = await res.json();
  t("400 JUDGEMENT_OVERREACH", [res.status, out.reason], [400, "JUDGEMENT_OVERREACH"]);
  t("the field is named", out.fields, ["maxPasses"]);
  t("and the step it was offered at is named", out.step, "plan");
  const st = await mockState(mf);
  t("nothing was suggested", st.suggested, []);
  await mf.dispose();
}

console.log("\n--- B11 · REC-52 one layer out, and the FL-2 fences that did not move ---");
{
  const noPlane = new Miniflare({
    workers: [{ name: "agent-worker", modules: true, modulesRoot: "/", scriptPath: WORKER_SRC_PATH, script: WORKER_SRC,
      modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], bindings: { VERSION: "test" } }],
  });
  const res = await noPlane.dispatchFetch("http://agent-worker/run",
    { method: "POST", body: JSON.stringify(base) });
  const out = await res.json();
  t("no plane binding -> 503 PLANE_NOT_CONFIGURED", [res.status, out.reason], [503, "PLANE_NOT_CONFIGURED"]);
  t("it does NOT convert its own failure into a claim about the run", out.reason === "NO_SUCH_RUN", false);
  await noPlane.dispose();

  /* A RUN THE PLANE DOES NOT HOLD. This member opens no run — a run's identity
     and its conditions are the plane's, and a member that could open one would
     be a machine deciding what it was formed under. */
  const mf = newMf({ mode: "check", maxPasses: 1, budget: wide });
  const st0 = await mockState(mf);
  const bad = await runOp(mf, { ...base, credential: "hunter2" });
  t("a malformed credential is refused before any plane call", (await bad.json()).reason, "BAD_CREDENTIAL_SHAPE");
  const st1 = await mockState(mf);
  t("and that refusal wrote NOTHING — the record is byte-identical",
    sha(JSON.stringify(st1.record)), sha(JSON.stringify(st0.record)));
  await mf.dispose();
}

console.log("\n--- B12 · OVER-STRICTNESS: correct work in a spelling the guard did not anticipate must PASS ---");
{
  const cases = [
    ["no judgements at all", { }],
    ["more judgements than judged steps", { judgements: [{}, {}, {}, {}, {}, {}, {}, {}] }],
    ["an empty judgement object", { judgements: [{}] }],
    ["a judgement naming only judgeable fields", { judgements: [{ targets: [{ level: "meaning", target: "X" }] }] }],
    ["an explicit max_steps well inside the ceiling", { max_steps: 60 }],
    ["a run id carrying punctuation", { run_id: "run:2026-08-08/seg-3" }],
    ["a namespace with capitals and a hyphen", { store: "BioSmoke-fleet" }],
    ["turns exactly at the bound", { turns: 120 }],
  ];
  for (const [label, extra] of cases) {
    const mf = newMf({ mode: "check", maxPasses: 1, budget: wide });
    const res = await runOp(mf, { ...base, ...extra });
    const out = await res.json();
    t(`${label} -> accepted`, [res.status, out.ok], [200, true]);
    await mf.dispose();
  }
  /* AND THE TABLE IS DETERMINISTIC END TO END: the same input twice produces the
     same trace. A control-flow table whose walk varied would not be one. */
  const traces = [];
  for (let i = 0; i < 2; i++) {
    const mf = newMf({ mode: "check", maxPasses: 2, budget: wide });
    traces.push((await (await runOp(mf, base)).json()).trace.map((x) => `${x.step}>${x.to}`));
    await mf.dispose();
  }
  t("two identical runs produce the identical trace", traces[0], traces[1]);
  t("and the trace actually went somewhere", (traces[0] || []).length > 5, true);
}

console.log(`\nharness: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
