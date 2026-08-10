/* SK-2 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so
 * `scripts/battery.mjs` (which discovers `.endsWith(".test.mjs")` and nothing
 * else) must not collect it. `skillpack.control.mjs` is the file beside it and
 * this is that shape.
 *
 * THE ROW'S OWN CONTROL, AND WHY IT NEEDED A CODE HALF TO BE RUNNABLE AT ALL.
 * SK-2's negative control reads: *"a skill edit that moves loop termination into
 * model judgement → FL-3's deterministic-table review criterion fails the change
 * in review — a gate in a prompt is the defect §14b.4 names."* The plan's own
 * review noticed the problem with that as written: *"SK-2's NC is a review
 * criterion, not a runnable control … a source-scan over the skill text should
 * ship with SK-2."* A control that depends on a reviewer noticing is a control
 * nobody can re-run, and this repository has measured what an unre-runnable
 * assurance is worth. ARM (1) below is that same edit made to the real source
 * and measured — the review criterion, executed.
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
 * Run it:  node test/skilldoctrine.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DOCS = fileURLToPath(new URL("../../docs/", import.meta.url));
const F = {
  doctrine: ROOT + "src/skilldoctrine.mjs",
  pack:     ROOT + "src/skillpack.mjs",
  airun:    ROOT + "src/airun.mjs",
  store:    ROOT + "src/store.mjs",
  design:   DOCS + "development/INVESTIGATIVE-SESSION.md",
  /* THE SUITE ITSELF IS ARMABLE, and arm (7) arms it. An instrument its own
     controls cannot reach is an instrument nobody has shown can go red. */
  test:     ROOT + "test/skilldoctrine.test.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

function runSuite(name = "skilldoctrine.test.mjs") {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 300000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = [...out.matchAll(/(\d+)\s+pass,\s+(\d+)\s+fail/g)].pop();
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 110));
  /* A suite that THREW before its tail line reports no count. That is not zero
     failures and must never read as a green arm — it is reported as UNKNOWN and
     counted as a wrong arm below, because a control whose subject crashed proves
     nothing about the assertion it claims to have broken. */
  return m ? { pass: +m[1], fail: +m[2], named, out, crashed: false }
           : { pass: null, fail: null, named, out, crashed: true };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 60)}…' occurs ${n} times in `
    + `${key}. An unguarded edit would have armed ${n} sites, and a control armed in more places than `
    + `it claims is not the control it reports.`);
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

/** An arm states which assertions MUST fail, by a fragment of their label, and
 *  may state which must be ABSORBED. An arm that fails "somewhere" proves the
 *  suite is sensitive to something; an arm that fails AT ITS OWN ASSERTION
 *  proves that assertion is doing the work. */
function arm(title, edits, mustFail, mustNotFail = [], suite = undefined) {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite(suite);
    console.log(`  MEASURED: ${r.crashed ? "UNKNOWN (the suite did not reach its tail line)" : `${r.pass} pass, ${r.fail} fail`}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    if (r.crashed) { console.log("  ** WRONG: the suite crashed rather than failing an assertion; this arm measured nothing"); wrong = true; }
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must be ABSORBED there`); wrong = true; }
    if (!r.crashed && !r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log("SK-2 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite();
console.log(`  BASELINE: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) { console.log("  ** the tree is not whole; arms below would measure the wrong thing"); process.exit(1); }

/* ------------------------------------------------------------------- (1) */
arm("(1) THE ROW'S OWN — MOVE LOOP TERMINATION INTO MODEL JUDGEMENT. The clause that today decides "
  + "WHAT to search for is rewritten to decide WHEN THE LOOP STOPS as well, and hands back neither "
  + "deterministic row. This is the edit SK-2's negative control names, made to the real source: a "
  + "gate written into a prompt, which is the defect §14b.4 names.",
  [["doctrine",
    `    defers: ["how many search passes, and when the loop stops",
             "the fan-out across the four levels"],`,
    `    defers: [],`],
   ["doctrine",
    `      + "change the reading, and which of the record's own levels is worth asking next. That is "
      + "the judgement this skill exists to exercise, and it is exercised inside a step.",`,
    `      + "change the reading. Decide how many passes this inquiry deserves and when to stop: keep "
      + "searching until you are satisfied the record has been covered, across at most three levels.",`]],
  ["ARM C1", "ARM B2"]);

/* ------------------------------------------------------------------- (2) */
arm("(2) THE SAME MOVE, THE QUIET DIRECTION — TAKE THE GRANT WITHOUT WRITING THE BOUND. The clause "
  + "claims a judgement row the design's table never granted, and its prose stays clean. This is "
  + "the half a text scan alone cannot see, and it is why the table's two columns are BOTH parsed: "
  + "authority arrives by claiming ground as often as by writing a number down.",
  [["doctrine",
    `    judges: ["what to search for"],`,
    `    judges: ["what to search for", "how many search passes, and when the loop stops"],`]],
  ["ARM B1", "ARM B3"],
  ["ARM C1"]);

/* ------------------------------------------------------------------- (3) */
arm("(3) THE TABLE IS THE AUTHORITY, NOT THIS FILE'S MEMORY OF IT. Move a row from the design "
  + "document's deterministic column into its judgement column — the same defect one altitude up, "
  + "where somebody edits the DESIGN rather than the skill. The doctrine is untouched and must "
  + "still fail, because what it defers is now a row the design says it decides.",
  [["design",
    `| how many search passes, and when the loop stops | what to search for |`,
    `| the observation log is appended as the run goes | how many search passes, and when the loop stops |`]],
  ["ARM A2", "ARM A3"]);

/* ------------------------------------------------------------------- (4) */
arm("(4) THE FOUR ABSENCES MADE TO READ ALIKE. Two levels are given the same words for what their "
  + "emptiness means. Nothing throws, nothing is missing, and every level still states something — "
  + "which is exactly why this needs an assertion: 'no document' and 'nothing extracted' collapsing "
  + "into one sentence is a loss of a FACT, not of a field.",
  [["doctrine", `    fact: "nothing extracted",`, `    fact: "no document",`]],
  ["ARM E2"]);

/* ------------------------------------------------------------------- (5) */
arm("(5) THE ESCALATION CHAIN, REORDERED WHERE IT IS ACTUALLY HELD. `ask_next` is derived from "
  + "`OBSERVATION_LEVELS`' key order, so a reorder in airun.mjs silently rewrites which level the "
  + "doctrine says to ask next, and the doctrine file is untouched. **THIS ARM'S EXPECTATION WAS "
  + "WRONG ON ITS FIRST RUN AND THE CORRECTION IS THE FINDING.** It named E1 as well as E3. E1 "
  + "compares the map's keys against `OBSERVATION_LEVELS`' keys — and the map DERIVES them from "
  + "exactly that object, so a reorder moves both sides together and E1 is blind to it BY "
  + "CONSTRUCTION. That is the equality-that-costs-nothing shape, in this suite, found by running "
  + "the control. **ARM E3 — the four facts pinned to the ORDER CLAUDE.md names them in — is the "
  + "only thing standing between a reorder in airun.mjs and a silently rewritten escalation "
  + "chain**, and this arm is the evidence for that sentence.",
  [["airun",
    `  content:  "extracted content within documents (DEC-23: content is the unit)",
  document: "documents the store holds",`,
    `  document: "documents the store holds",
  content:  "extracted content within documents (DEC-23: content is the unit)",`]],
  ["ARM E3"], ["ARM E1"]);

/* ------------------------------------------------------------------- (6) */
arm("(6) THE CITATION THAT POINTS NOWHERE. A clause cites a fence that does not exist. A citation "
  + "reads as a fence whether or not one is there, which makes a broken one worse than none — the "
  + "clause then looks enforced and is instruction.",
  [["doctrine",
    `  cannot_conclude:      MACHINE_FENCE_CHECKS.MACHINE_CANNOT_CONCLUDE.check,`,
    `  cannot_conclude:      "C-99.4",`]],
  ["ARM D2"]);

/* ------------------------------------------------------------------- (7) */
arm("(7) THE INSTRUMENT ITSELF. Neuter the control-flow scan so it matches nothing, and leave the "
  + "doctrine alone. C1 then passes over a scan that reads nothing — the shape of every walk that "
  + "has gone blind while reporting green — and only C2/C3, the arms built to make the scan FIRE, "
  + "notice. This is the arm that says C1's silence means something.",
  [["doctrine",
    `export function controlFlowAuthority(text) {
  const s = typeof text === "string" ? text : "";
  return CONTROL_FLOW_AUTHORITY.filter((p) => p.re.test(s)).map((p) => p.name);
}`,
    `export function controlFlowAuthority(text) {
  return [];
}`]],
  ["ARM C2", "ARM C3"],
  ["ARM C1"]);

/* ------------------------------------------------------------------- (8) */
arm("(8) THE BIAS FENCE, BROKEN WHERE IT ACTUALLY LIVES. Give the SEARCH half the lens. The "
  + "doctrine's bias clause is untouched and still SAYS the right thing — which is the whole point "
  + "of §14b.4: the sentence is worth nothing and the field is worth everything. If this skill held "
  + "the rule, nothing here would go red.",
  [["store",
    `      ...(composing ? { bias: await this.#biasForRun(row, viewer) } : {}),`,
    `      bias: await this.#biasForRun(row, viewer),`]],
  ["ARM H1"],
  ["ARM H2"]);

/* ------------------------------------------------------------------- (9) */
arm("(9) OVER-STRICTNESS, ARMED FROM THE OTHER SIDE. Widen the termination-decision pattern back to "
  + "the shape it was FIRST written in — decide/judge + when|whether|how many, with no requirement "
  + "that the object be control flow. It then flags the doctrine's own granted judgement, which is "
  + "a row of the design's right-hand column. A scan that refuses the grant would push the next "
  + "author to phrase prose around the instrument, and C4 is the arm that stops that.",
  [["doctrine",
    `    re: new RegExp(String.raw\`\\b(?:decide|judge|choose|determine|work out)\\s+(?:for yourself\\s+)?(?:when\\b[^.]{0,32}?\\b(?:stop|end|halt|terminate|finish|enough)|how\\s+many\\b|whether\\s+to\\s+(?:continue|stop|keep))\`, "i") },`,
    `    re: /\\b(?:decide|judge|choose|determine|work out)\\s+(?:when|whether|how many)\\b/i },`]],
  ["ARM C1", "ARM C4"]);

console.log(`\n${armsRun} arm(s) run, ${armsWrong} WRONG.`);
if (armsWrong) process.exitCode = 1;
