/* PL-3 / IS-4 — THE NEGATIVE CONTROLS, RUN.
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so the
 * battery must not discover it — `versionstate.control.mjs`'s precedent, which
 * took it from `check-refusal-codes.mjs`.
 *
 * IT LIVES INSIDE THIS WORKTREE and never in a shared scratchpad. On 2026-08-07
 * a worker's harness was OVERWRITTEN MID-TURN by another running worker, and a
 * harness silently replaced between ARM and RESTORE reports a restore it never
 * performed.
 *
 * EVERY RESTORE IS VERIFIED BY CONTENT AS WELL AS BY HASH. A sha256 comparison
 * answers "the bytes are the same" only if the reader that produced both digests
 * was the same reader; a byte comparison of the strings answers it outright, and
 * both are cheap.
 *
 * THIS ITEM'S OWED CONTROL IS VF-1's NUMBER 6, AND IT IS THE SHAPE THAT MATTERS:
 * **REMOVE ANY ONE OF THE SIX PRE-WRITE REFUSALS AND ITS SUITE FAILS — ONE AT A
 * TIME, EACH NAMED.** A control that removed all six together would prove only
 * that the block exists, which is the failure IS-6's C-22.4 arm was absorbed by.
 * So there are six arms, each neutering exactly ONE check with the other five
 * HELD OPEN, and each one's expected failure NAMES ITS OWN C-NUMBER.
 *
 * AND EACH ARM ALSO STATES WHAT MUST **NOT** FAIL. An arm that fails
 * "somewhere" proves the suite is sensitive to something; an arm that fails at
 * its OWN check and leaves its five neighbours green proves the six are six.
 *
 * Run it:  node test/suggest.control.mjs
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

/* The suite's own report, parsed from its `N pass, M fail` line. A suite whose
   count cannot be read is reported as UNKNOWN rather than as zero: an unreadable
   number and no assertions are different claims (D-93's lesson). */
function runSuite(name) {
  let out = "";
  try {
    out = execFileSync(process.execPath, [ROOT + "test/" + name], { encoding: "utf8", timeout: 300000 });
  } catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const named = [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].slice(0, 110));
  return m ? { pass: +m[1], fail: +m[2], named, out } : { pass: null, fail: null, named, out };
}

function edit(key, from, to) {
  const src = readFileSync(F[key], "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: '${from.slice(0, 60)}…' occurs ${n} times in ${key}. `
    + `An unguarded edit would have armed ${n} sites, and a control armed in more places than it claims `
    + `is not the control it reports.`);
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

function arm(title, edits, mustFail, mustNotFail = []) {
  armsRun++;
  console.log(`\n=== ${title}`);
  try {
    for (const [k, from, to] of edits) edit(k, from, to);
    const r = runSuite("suggest.test.mjs");
    console.log(`  MEASURED: ${r.pass} pass, ${r.fail} fail`);
    for (const n of r.named) console.log(`    FAILED: ${n}`);
    const hit = (frag) => r.named.some((n) => n.includes(frag));
    let wrong = false;
    for (const frag of mustFail)
      if (!hit(frag)) { console.log(`  ** WRONG: expected an assertion naming "${frag}" to FAIL and none did`); wrong = true; }
    for (const frag of mustNotFail)
      if (hit(frag)) { console.log(`  ** WRONG: "${frag}" failed, and this arm must leave it GREEN`); wrong = true; }
    if (!r.fail) { console.log("  ** WRONG: the suite stayed GREEN. A control that cannot fail proves nothing."); wrong = true; }
    if (wrong) armsWrong++;
  } finally {
    restoreAll();
    console.log("  restored: every file verified by sha256 AND by content");
  }
}

console.log("PL-3 / IS-4 — negative controls. Whole-tree baseline first, so every arm is a DELTA.");
const base = runSuite("suggest.test.mjs");
console.log(`  BASELINE: ${base.pass} pass, ${base.fail} fail`);
if (base.fail !== 0) { console.log("  ** the tree is not whole; arms below would measure the wrong thing"); process.exit(1); }

/* ============================== OWED CONTROL 6 — ONE AT A TIME ============ */

arm("(1) CHECK 1 — THE REACHABLE LEG (C-27.8), the other five HELD OPEN. "
  + "D-168's trap is the sharp half: with this refusal gone a leg citing RETIRED information LANDS, and "
  + "every later reader sees live support for the answer. A type-only check — which is all `op=cite` has "
  + "— would have passed it too, which is why this check is not a type check.",
  [["store", `    if (unreachable.length)\n      return remember(refusal("SUGGEST_LEG_UNREACHABLE",`,
             `    if (false)\n      return remember(refusal("SUGGEST_LEG_UNREACHABLE",`]],
  ["CHECK 1: a leg naming a document",
   "CHECK 1 / D-168 — THE TRAP",
   "THE DRIVEN SET EQUALS THE REGISTRY"],
  ["CHECK 2:", "CHECK 3:", "CHECK 4 / D-195:", "CHECK 5:", "CHECK 6:"]);

arm("(2) CHECK 2 — THE PAIR COMPUTES OVER THE DECLARED PARTITION (C-27.9), the other five HELD OPEN. "
  + "With this gone, legs sitting in a part of the argument no row declares land, and §12's MAXIMUM is "
  + "then taken over a part nobody signed for — DEC-32's anti-gaming keystone, in reverse.",
  [["store", `    if (pairError || axisBad(pair?.capture) || axisBad(pair?.connection) || partitionDisagrees)`,
             `    if (false)`]],
  ["CHECK 2: legs sitting in a part", "THE DRIVEN SET EQUALS THE REGISTRY"],
  ["CHECK 1: a leg naming a document", "CHECK 5:", "CHECK 6:"]);

arm("(3) CHECK 3 — DIFFERS IN SUBSTANCE (C-27.10), the other five HELD OPEN. "
  + "§6 rule 8 is Bob's own write gate. With it gone the same reading lands twice under two names and "
  + "the review pile grows with nothing in it to review. Note the RENAMED-RESUBMIT arm fails with it, "
  + "because that arm's convergence IS this check.",
  [["store", `    if (twin)\n      return remember(refusal("SUGGEST_NOT_DIFFERENT",`,
             `    if (false)\n      return remember(refusal("SUGGEST_NOT_DIFFERENT",`]],
  ["CHECK 3: a reading identical in substance", "THE DRIVEN SET EQUALS THE REGISTRY"],
  ["CHECK 1: a leg naming a document", "CHECK 4 / D-195:", "CHECK 6:"]);

arm("(4) CHECK 4 — D-195 INDEPENDENCE (C-27.11), the other five HELD OPEN. "
  + "*The Judith Miller error with arithmetic behind it*: with this gone, two parts of a reading that "
  + "the record can trace to ONE upstream address are offered as separate routes, and the MAXIMUM makes "
  + "the finding look better supported for a reason that is not there.",
  [["store", `    if (shared.length)\n      return remember(refusal("SUGGEST_BRANCHES_NOT_INDEPENDENT",`,
             `    if (false)\n      return remember(refusal("SUGGEST_BRANCHES_NOT_INDEPENDENT",`]],
  ["CHECK 4 / D-195:", "THE DRIVEN SET EQUALS THE REGISTRY"],
  ["CHECK 1: a leg naming a document", "CHECK 2:", "CHECK 5:", "CHECK 6:"]);

arm("(5) CHECK 5 — NO BOILERPLATE (C-27.12), the other five HELD OPEN. "
  + "The `counterparty: to be named` defect at machine scale. AND THE OVER-STRICTNESS ARMS MUST STAY "
  + "GREEN: a check that refuses correct work is a defect in the check, so this arm proves the refusal "
  + "is doing work WITHOUT proving it does too much.",
  [["store", `    if (filler.length)\n      return remember(refusal("SUGGEST_BOILERPLATE",`,
             `    if (false)\n      return remember(refusal("SUGGEST_BOILERPLATE",`]],
  ["CHECK 5: a required field filled", "THE DRIVEN SET EQUALS THE REGISTRY"],
  ["a description in Spanish", "A REAL SENTENCE THAT QUOTES A PLACEHOLDER",
   "CHECK 1: a leg naming a document", "CHECK 6:"]);

arm("(6) CHECK 6 — NO UNWRITABLE STATE (C-27.13), the other five HELD OPEN. "
  + "§4: THE AI HOLDS NO OP THAT ACCEPTS. With this gone a submission arrives already ADOPTED and the "
  + "record holds a decision no member made. NOTE the second condition under this code — a machine "
  + "asserting structure — is a SEPARATE branch and stays live, which is why the two are asserted "
  + "separately in the suite and only the first fails here.",
  [["store", `    if (forbidden.length)\n      return remember(refusal("SUGGEST_UNWRITABLE_STATE",`,
             `    if (false)\n      return remember(refusal("SUGGEST_UNWRITABLE_STATE",`]],
  /* CORRECTED AFTER RUNNING, and the correction is a finding rather than a
     tidy-up. This arm first declared that the DEC-49 FLOOR would fail with it,
     as it does for the other five. IT DOES NOT, and the reason is right: the
     floor fails when a code becomes UNDRIVABLE, and C-27.13 has TWO producers —
     the already-decided branch this arm neuters and the machine-asserts-
     structure branch it deliberately leaves live. The floor is measuring the
     code's reachability, not the branch's, and a control that demanded
     otherwise would have been demanding the wrong thing. */
  ["CHECK 6: a submission arriving ALREADY DECIDED"],
  ["AND A MACHINE CREDENTIAL MAY NOT ASSERT STRUCTURE",
   "CHECK 1: a leg naming a document", "CHECK 5:"]);

/* ============================== F10 ====================================== */

arm("(7) F10 — THE IDEMPOTENCE KEY. This is the arm the plan names: neuter the stored-refusal lookup "
  + "and a verbatim resubmit stops being a structural no-op. The second submission is EVALUATED again, "
  + "`repeats` never moves, and a retry loop is then caught only by the budget — which the design says "
  + "is the BACKSTOP and not the mechanism.",
  [["store", `    if (prior) {`, `    if (false && prior) {`]],
  ["the first submission is EVALUATED and refused", "and the RETRY IS COUNTED"],
  ["CHECK 1: a leg naming a document", "CHECK 5:", "CHECK 6:"]);

/* ============================== THE SUPPORTING RULES ===================== */

arm("(8) THE KIND VOCABULARY AT THE DOCUMENT GATE (C-27.15). The endpoint refuses an unknown kind, and "
  + "so does the catalog — two layers, because a hand-authored `bundle.md`, a replayed revision and a "
  + "future writer none of them go through the op. Breaking the CATALOG's half leaves the op's half "
  + "green, which is what proves neither is redundant.",
  [["checks", `        && !Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, String(v.kind).trim())) {`,
              `        && false) {`]],
  ["a DOCUMENT carrying a kind outside"],
  ["kind 'basis-version' is WRITABLE", "CHECK 6:"]);

arm("(9) THE CONDITIONAL KIND LINE IN THE COMPOSITION. PL-1 froze every existing version against a "
  + "composition with NO kind line, so emitting one UNCONDITIONALLY changes the composition of every "
  + "version already in any record and the next promotion of any of them fails the freeze. This arm "
  + "makes the line unconditional and requires the freeze arm to say so.",
  [["store", `        ...(kind === null ? [] : [\`kind\\t\${c(kind)}\`]),`,
             `        \`kind\\t\${c(kind)}\`,`]],
  ["a version carrying NO kind composes with NO kind line"],
  ["CHECK 1: a leg naming a document"]);

arm("(10) THE BOILERPLATE PREDICATE'S ROSTER. A matcher over an EMPTY roster reports every field clean "
  + "and congratulates itself — the shape three instruments took in this repository in one week. Empty "
  + "the roster and BOTH the behavioural arm and the roster's own floor must fail.",
  [["checks", `export const BOILERPLATE_FORMS = [`, `export const BOILERPLATE_FORMS = [].concat([`],
   ["checks", `  'lorem ipsum', 'sample text', 'no description', 'see above', 'as above', 'same', 'ditto',\n];`,
              `  'lorem ipsum', 'sample text', 'no description', 'see above', 'as above', 'same', 'ditto',\n].slice(0, 0));`]],
  ["CHECK 5: a required field filled", "and the roster is NON-TRIVIAL"],
  ["a description in Spanish"]);

console.log(`\n=================================================================`);
console.log(`arms run: ${armsRun} · arms that did NOT behave as declared: ${armsWrong}`);
console.log(`every arm restored; every file verified by sha256 AND by content`);
process.exit(armsWrong ? 1 : 0);
