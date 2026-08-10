/* SK-3 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so
 * `scripts/battery.mjs` (which discovers `.endsWith(".test.mjs")` and nothing
 * else) must not collect it. `skilldoctrine.control.mjs` is the file beside it
 * and this is that shape, reused rather than re-derived.
 *
 * THE ROW'S OWN CONTROL, AND WHAT IT IS ACTUALLY PROVING. SK-3's negative
 * control reads: *"submit a version whose description is placeholder text
 * through PL-3 → refused by C-number while the skill-only path would have passed
 * it — proving the fence is code, not instruction."* The SUBMISSION runs on
 * every pass of the suite (ARM D1, with ARM D2 showing the op discriminates and
 * ARM D3 showing the skill path does not). What a control has to add is the
 * other direction: that D1 is held by CODE and not by the sentence. **ARM (1)
 * below is that** — the fence is removed and every skill-side arm stays GREEN
 * while the doctrine still says exactly the right thing.
 *
 * TWO HALVES OF ONE FENCE ARE ARMED SEPARATELY (arms 1 and 2), because a
 * predicate and its call site fail differently: neutering the predicate is
 * visible to a unit test of the predicate, and removing the field from the sweep
 * is visible only through the op. A control that armed one would have licensed a
 * claim about both.
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
 * TWO OF THESE ARMS EDIT FILES SK-3 DOES NOT CLAIM (`checks/bio-checks.mjs`,
 * `src/store.mjs`). A transient armed edit inside one worktree, restored and
 * verified before the process exits, is not a claim on the path — SK-2's arm (8)
 * is the precedent and `CLAIMS.md` records it for this item too.
 *
 * Run it:  node test/skillprohibitions.control.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const F = {
  doctrine: ROOT + "src/skilldoctrine.mjs",
  checks:   ROOT + "checks/bio-checks.mjs",
  store:    ROOT + "src/store.mjs",
};
const sha = (s) => createHash("sha256").update(s).digest("hex");
const ORIGINAL = Object.fromEntries(Object.entries(F).map(([k, p]) => [k, readFileSync(p, "utf8")]));
const ORIGINAL_SHA = Object.fromEntries(Object.entries(ORIGINAL).map(([k, v]) => [k, sha(v)]));

let armsRun = 0, armsWrong = 0;

function runSuite(name = "skillprohibitions.test.mjs") {
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
 *  proves that assertion is doing the work. `mustStayGreen` is SK-3's addition
 *  to SK-2's harness and it is the item's whole point: arm (1) has to show not
 *  only that D1 goes red but that the ENTIRE SKILL SIDE does not. */
function arm(title, edits, mustFail, mustNotFail = [], mustStayGreen = []) {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite();
    console.log(`  MEASURED: ${r.crashed ? "UNKNOWN (the suite did not reach its tail line)" : `${r.pass} pass, ${r.fail} fail`}`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    if (r.crashed) { console.log("  ** WRONG: the suite crashed rather than failing an assertion; this arm measured nothing"); wrong = true; }
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must be ABSORBED there`); wrong = true; }
    for (const frag of mustStayGreen)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" went RED, and the whole claim of this arm is that it does not`); wrong = true; }
    if (mustStayGreen.length && !wrong)
      console.log(`  ASYMMETRY HELD: ${mustStayGreen.length} skill-side block(s) stayed GREEN while the fence was gone.`);
    if (!r.crashed && !r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log("SK-3 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite();
console.log(`  BASELINE: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) { console.log("  ** the tree is not whole; arms below would measure the wrong thing"); process.exit(1); }

/* ------------------------------------------------------------------- (1) */
arm("(1) THE ROW'S OWN, AND THE ITEM'S POINT — NEUTER PL-3's BOILERPLATE PREDICATE. `isBoilerplate` "
  + "answers false for everything, and NOT ONE WORD OF THE SKILL CHANGES. The fifth prohibition is "
  + "still present, still verbatim, still cites C-27.12, and still refuses nothing — which is what "
  + "it was always doing. The arms that go red are the two that read the CODE.",
  [["checks",
    `export function isBoilerplate(s) {
  if (typeof s !== 'string') return true;
  const v = s.trim().toLowerCase().replace(/[.!?]+$/, '').trim();
  if (v === '') return true;
  /* Only punctuation, ellipsis, or an unfilled angle-bracket slot. */
  if (/^[\\s.\\-_*#'"\`~<>[\\]()]+$/.test(v)) return true;
  if (/^<[^>]*>$/.test(v)) return true;
  return BOILERPLATE_FORMS.includes(v);
}`,
    `export function isBoilerplate(s) {
  return false;
}`]],
  ["ARM D1", "ARM D4"],
  [],
  /* THE ASYMMETRY, ASSERTED RATHER THAN OBSERVED. */
  ["ARM A1", "ARM A2", "ARM A5", "ARM B1", "ARM C1", "ARM C2", "ARM C3", "ARM C5", "ARM D5", "ARM E1", "ARM E2"]);

/* ------------------------------------------------------------------- (2) */
arm("(2) THE SAME FENCE BROKEN AT THE CALL SITE INSTEAD OF THE PREDICATE. The suggest endpoint stops "
  + "asking about `description`; the predicate is untouched and still correct. A check and its call "
  + "site fail differently, and only the op can see this one.",
  [["store",
    `    if (isBoilerplate(args.description)) filler.push("description");`,
    `    if (false) filler.push("description");`]],
  ["ARM D1"],
  ["ARM D4"],
  ["ARM A1", "ARM A2", "ARM B1", "ARM C1", "ARM D5"]);

/* ------------------------------------------------------------------- (3) */
arm("(3) A PROHIBITION DROPPED — and it is the one with NO code behind it, because that is the one a "
  + "careless edit loses most quietly. Nothing throws, the other four are still verbatim, and the "
  + "set is simply smaller. THIS ARM IS WHY ARM A5 PARSES THE DESIGN DOCUMENT: written against this "
  + "file's own array the expectation would have shrunk with the subject and seen nothing.",
  [["doctrine",
    `];

/** THE ONE PERMITTED AUTO-COMPOSITION.`,
    `].filter((p) => p.id !== "no-connection-density-ranking");

/** THE ONE PERMITTED AUTO-COMPOSITION.`]],
  /* MEASURED FOUR, NOT THE THREE THIS ARM FIRST DECLARED, AND THE FOURTH IS
     RECORDED RATHER THAN SMOOTHED. ARM A4 counts the survey-sourced
     prohibitions against the design-sourced one, so a drop moves it as well —
     a second, independent hold on the set's size the declaration had not
     noticed. Added here because a control's declaration is a claim about the
     subject, and this one was incomplete rather than wrong. */
  ["ARM A1", "ARM A4", "ARM A5", "ARM C6"]);

/* ------------------------------------------------------------------- (4) */
arm("(4) A PROHIBITION PARAPHRASED. One word of the fabricated-attribution sentence changed — "
  + "'fabricated' to 'invented' — leaving it true, readable, and no longer the survey's. **THIS IS "
  + "THE ARM THAT MAKES 'VERBATIM' A MEASUREMENT**: nothing else in this suite can see a paraphrase, "
  + "and a reviewer re-reading the sentence would have agreed with it.",
  [["doctrine",
    `      "A justification is read later as that member's own act; a generated one is a fabricated "`,
    `      "A justification is read later as that member's own act; a generated one is an invented "`]],
  ["ARM A2"]);

/* ------------------------------------------------------------------- (5) */
arm("(5) THE ONE PERMISSION WIDENED. The carve-out to prohibition 1 is rewritten to allow connective "
  + "wording between a member's own excerpts. It still reads like a rule, it still cites Zotero, and "
  + "it now re-admits precisely what prohibition 1 forbids — a generated sentence a member will be "
  + "read as having written. The survey's line is 'never generates new ones' and the widening is "
  + "invisible to every other arm.",
  [["doctrine",
    `  the_line: "it assembles the member's OWN prior words and never generates new ones",`,
    `  the_line: "it assembles the member's OWN prior words and may add connective wording between them",`]],
  ["ARM A6"]);

/* ------------------------------------------------------------------- (6) */
arm("(6) A GATE WRITTEN INTO A PROHIBITION. §14b.4 does not exempt a prohibition from the rule that a "
  + "skill may never hold a gate, so a pass budget and a stopping rule are written into one. This "
  + "arm also holds the REUSE: the scanner that catches it is SK-2's export, and if SK-3 had written "
  + "a second one this would be measuring the second one's opinion.",
  [["doctrine",
    `      "Do not order anything by how many edges touch it, and do not offer how-connected as a reason "`,
    `      "Run at most three passes over the level and stop the search once you are satisfied. Do not "
      + "order anything by how many edges touch it, and do not offer how-connected as a reason "`]],
  ["ARM B1"]);

/* ------------------------------------------------------------------- (7) */
arm("(7) THE INSTRUMENT ITSELF. Neuter `controlFlowAuthority` so it matches nothing, and leave the "
  + "prohibitions alone. B1 then passes over a scan that reads nothing — the shape of every walk "
  + "that has gone blind while reporting green — and only B2, the arm built to make the scan FIRE, "
  + "notices. This is the arm that says B1's silence means something.",
  [["doctrine",
    `export function controlFlowAuthority(text) {
  const s = typeof text === "string" ? text : "";
  return CONTROL_FLOW_AUTHORITY.filter((p) => p.re.test(s)).map((p) => p.name);
}`,
    `export function controlFlowAuthority(text) {
  return [];
}`]],
  ["ARM B2"],
  ["ARM B1"]);

console.log(`\n${armsRun} arm(s) run, ${armsWrong} WRONG.`);
if (armsWrong) process.exitCode = 1;
