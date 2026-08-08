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

/* ============================== D-231 — THE CLOCK ======================== */

/* THE TWO ARMS THIS ITEM EXISTS FOR, AND THEY PULL IN OPPOSITE DIRECTIONS.
   (D-231a) puts the defect back and requires the boundary arm to reproduce the
   flake DETERMINISTICALLY — a hypothesis becomes a diagnosis only when re-arming
   the named cause brings the symptom back. (D-231b) widens the fix by one field
   and requires the OVER-STRICTNESS arm to fail instead. Between them the
   exclusion is pinned as EXACTLY the assertion stamp: not less, not more. */

arm("(D-231a) THE CLOCK, RE-ARMED — restore `substanceOf` to what it was before D-231, so the ground "
  + "rows' assertion stamp is back inside the substance comparison. This is the arm that turns the "
  + "diagnosis into a diagnosis: with the server's second-resolution stamp compared, a candidate stamped "
  + "NOW can never equal a reading stamped earlier, so §6 rule 8's duplicate gate fires ONLY inside a "
  + "one-second bucket. THE SPLIT IS THE POINT — the two CHECK 3 arms submit their duplicate "
  + "milliseconds later and MUST STAY GREEN, because they were green all along; only the arm that "
  + "deliberately crosses a second boundary may fail. That split is exactly what made this suite green "
  + "standalone at ~510ms and red under a loaded battery, and it is why two sessions each saw a green "
  + "re-run and could not name it.",
  [["store", `    const substanceOf = (c) => String(c).split("\\n")
      .filter((ln) => !/^name\\t/.test(ln) && !/^derived_from\\t/.test(ln))
      .map((ln) => (ln.startsWith("ground\\t")`,
             `    const substanceOf = (c) => String(c).split("\\n")
      .filter((ln) => !/^name\\t/.test(ln) && !/^derived_from\\t/.test(ln))
      .map((ln) => (false && ln.startsWith("ground\\t")`]],
  /* BOTH ARMS, AND THE SECOND ONE IS THE RECEIPT. Re-arming the clock does not
     just redden the boundary arm — the duplicate it fails to refuse LANDS, so
     the inquiry holds 7 readings where block 3 asserts 6, and `STRUCTURALLY
     NOTHING MOVED` goes red behind it. **That pair is the exact signature
     CONDUCT measured in the wild (59 pass / 2 fail), reproduced on demand.**
     Declaring it here is what makes this a diagnosis rather than a plausible
     story: the named cause, re-armed, reproduces the observed symptom in both
     of the arms it was observed in. */
  ["D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER",
   "STRUCTURALLY NOTHING MOVED"],
  ["CHECK 3: a reading identical in substance",
   "AND THE COMPARISON IS OVER SUBSTANCE, NOT OVER THE NAME",
   "AND A READING DIFFERING ONLY IN WHAT IT SAYS ITS EVIDENCE SHOWS LANDS",
   "CHECK 1: a leg naming a document", "CHECK 5:", "CHECK 6:"]);

arm("(D-231b) OVER-BLANKED BY ONE FIELD — widen D-231's exclusion so the ground's STATEMENT is "
  + "swallowed along with its stamp. A composed ground row is "
  + "`ground<TAB>label<TAB>asserted_by<TAB>at<TAB>statement`, and WHY the evidence bears is substance "
  + "while WHEN it was recorded is not. With this armed, two readings resting on the same evidence for "
  + "different stated reasons collapse into one and the second is refused as a duplicate — so the "
  + "OVER-STRICTNESS arm must fail while the boundary arm stays GREEN. A fence that refuses correct work "
  + "is a defect in the fence, and a fix one field too wide is exactly that.",
  [["store", `        ? ln.split("\\t").map((f, i) => (i === 3 ? "" : f)).join("\\t")`,
             `        ? ln.split("\\t").map((f, i) => (i >= 3 ? "" : f)).join("\\t")`]],
  ["AND A READING DIFFERING ONLY IN WHAT IT SAYS ITS EVIDENCE SHOWS LANDS"],
  ["D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER",
   "CHECK 3: a reading identical in substance", "CHECK 1: a leg naming a document"]);

/* ============================== D-234 — THE LOSSY TRANSFORMS ============= */

/* REC-75's FOUR ARMS. D-231 above and D-234 here are the SAME GATE failing for
   two independent reasons, and the pair of arm sets is what says so: the two
   D-231 arms are re-run unchanged below this item's change and behave exactly as
   they did before it, while the four here move only the D-234 arms. If the two
   halves were one thing measured twice, an arm from either set would move the
   other's assertions. Neither does. */

arm("(D-234a) THE `#fmSafe` HALF REVERTED — make the one normaliser's value transform the IDENTITY, "
  + "which is precisely 'compose the candidate from raw args' and is the state of the world before "
  + "REC-75. `#fmSafe` rewrites `\"` and `\\` to `'`, folds newlines to spaces and TRIMS on the way into "
  + "the document, so a candidate built from what was SUBMITTED can never equal a reading built from "
  + "what was WRITTEN. EVERY PUNCTUATED DUPLICATE MUST LAND AGAIN — this is the arm proving the "
  + "normalisation is what refuses. THE D-231 BOUNDARY ARM MUST STAY GREEN, which is what says the "
  + "clock half and the punctuation half are two defects and not one.",
  [["store", `    const fs = (s) => Store.#fmSafe(s);`,
             `    const fs = (s) => String(s ?? "");`]],
  /* AND `STRUCTURALLY NOTHING MOVED` FALLS WITH THEM, which is the same second
     receipt (D-231a) carries and for the same reason: a duplicate that is not
     refused LANDS, so block 3's absolute version count is one too high. Declared
     rather than discovered — it was missing from this list on the first run. */
  ["D-234 (1) THE QUOTATION MARK", "D-234 (2) THE BACKSLASH", "D-234 (3) THE NEWLINE",
   "D-234 (4) THE TRAILING AND LEADING SPACE", "D-234 (5) AND IT IS NOT ONLY THE VERSION ROW",
   "STRUCTURALLY NOTHING MOVED"],
  ["D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER",
   "CHECK 3: a reading identical in substance",
   "REC-75 OVER-STRICTNESS", "REC-75 — `composition` PUBLISHES THE RECORD'S BYTES",
   "CHECK 1: a leg naming a document", "CHECK 5:", "CHECK 6:"]);

arm("(D-234b) OVER-NORMALISED, AND IT MUST FAIL THE OTHER WAY — the control this item exists for as "
  + "much as for D-234a. Push the ONE normaliser past what the document does: collapse internal "
  + "whitespace and drop the punctuation `#fmSafe` PRESERVES. BOTH sides are then normalised the same "
  + "way, so the duplicate arms stay green and prove nothing — while two readings that genuinely differ "
  + "only in the punctuation of a QUOTED SOURCE collapse into one and the second is refused. That is "
  + "the opposite defect and the worse one: a gate refusing correct work. THE OVER-STRICTNESS ARM MUST "
  + "FAIL and the duplicate arms MUST NOT.",
  [["store", `    const fs = (s) => Store.#fmSafe(s);`,
             `    const fs = (s) => Store.#fmSafe(s).replace(/\\s+/g, " ").replace(/[;,'\\u201c\\u201d]/g, "");`]],
  /* AND THE PUBLICATION ARM FAILS WITH THEM, DECLARED RATHER THAN DISCOVERED —
     it was NOT in this list on the first run and the harness printed it as an
     undeclared failure, which is the harness working. The reason is right: an
     over-normaliser that strips `'` strips it from what the WRITE persists too,
     so the record no longer holds `'to be named'` and the arm asserting the
     published bytes carry it fails. Declared here rather than smoothed away,
     because an arm whose predicted failures do not match its measured ones is an
     arm nobody can read. */
  ["REC-75 OVER-STRICTNESS", "AND THE CURLY-QUOTE ARM IS THE ONE IN A SPELLING NOBODY ANTICIPATED",
   "REC-75 — `composition` PUBLISHES THE RECORD'S BYTES"],
  ["D-234 (1) THE QUOTATION MARK", "D-234 (2) THE BACKSLASH", "D-234 (3) THE NEWLINE",
   "D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER",
   "CHECK 3: a reading identical in substance"]);

arm("(D-234c) THE PUBLICATION REVERTED, AND IT IS COMPOUND ON PURPOSE. REC-75 decided that "
  + "`composition` publishes THE RECORD'S BYTES rather than the caller's, and after the fix the two are "
  + "equal — so reverting the publication ALONE changes nothing observable, and an arm that edited only "
  + "it would come back green while proving nothing. This arm therefore reverts BOTH halves: the "
  + "candidate goes back to raw args AND the answer goes back to publishing the candidate. That is "
  + "exactly the pre-REC-75 plane, and it is the state in which a caller was handed bytes the record "
  + "does not hold with nothing on the answer to say so.",
  [["store", `    const fs = (s) => Store.#fmSafe(s);`,
             `    const fs = (s) => String(s ?? "");`],
   ["store", `      composition: storedComposition,`,
             `      composition: candidate ? candidate.composition : null,`]],
  ["REC-75 — `composition` PUBLISHES THE RECORD'S BYTES",
   "AND IT IS THE SAME STRING `op=basisversions` PUBLISHES FOR THAT VERSION",
   "D-234 (1) THE QUOTATION MARK", "D-234 (2) THE BACKSLASH", "D-234 (3) THE NEWLINE",
   "D-234 (4) THE TRAILING AND LEADING SPACE", "D-234 (5) AND IT IS NOT ONLY THE VERSION ROW",
   "STRUCTURALLY NOTHING MOVED"],
  ["D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER",
   "REC-75 OVER-STRICTNESS", "CHECK 1: a leg naming a document"]);

arm("(D-234d) THE NAME COMPARISON REVERTED — the same defect one field over, found by REC-75's class "
  + "sweep. `SUGGEST_NAME_TAKEN` compares a CALLER-DERIVED name against STORED names. `VERSION_NAME_RE` "
  + "admits none of the characters `#fmSafe` rewrites, so almost all of the divergence is unreachable — "
  + "but a NEWLINE folds to a SPACE, and the grammar allows spaces. Compare the raw name again and a "
  + "reading named `the ledger<newline>account` walks past this endpoint's own check and is refused by "
  + "`promote` in ANOTHER family's words, over a document this endpoint had already composed.",
  [["store", `    if (existing.some((r) => r && typeof r === "object" && String(r.name ?? "").trim() === nameWritten))`,
             `    if (existing.some((r) => r && typeof r === "object" && String(r.name ?? "").trim() === name))`]],
  ["D-234 / THE CLASS SWEEP: a name that FOLDS"],
  ["D-234 (1) THE QUOTATION MARK", "D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER",
   "REC-75 OVER-STRICTNESS", "CHECK 1: a leg naming a document"]);

/* THE ARM THAT TAUGHT THIS ITEM SOMETHING, AND THE DECLARATION IS THE FINDING.
   It was written expecting the behavioural D-234 arms to fail with the
   structural one. THEY DO NOT, and the reason is worth more than the arm: `q()`
   applies `#fmSafe` itself, and `#fmSafe` is IDEMPOTENT, so `q(args.description)`
   and `q(pv.description)` emit the SAME BYTES. Putting the WRITE back on raw args
   is therefore INVISIBLE to every behavioural arm in the suite.
   That is exactly why the structural pin has to exist. The defect D-234 named
   was never in the write — it was in the CANDIDATE, and the write's source is
   unobservable from outside. A field added to this endpoint tomorrow, composed
   into the document from `args` and into the candidate from `persisted`, would
   diverge the moment the two disagree about a CONDITION rather than a
   character — and nothing behavioural would say so until a member hit it. */
arm("(D-234e) THE STRUCTURAL RATCHET — put ONE field of the write back on raw args, which is the shape "
  + "D-234 arose in and the shape a field added tomorrow would arrive in. THE STRUCTURAL ARM MUST FAIL "
  + "AND EVERY BEHAVIOURAL ARM MUST STAY GREEN, which is not a weakness in the arm but its whole "
  + "justification: `q()` applies `#fmSafe` and `#fmSafe` is idempotent, so this edit emits identical "
  + "bytes and NO behavioural arm can see it. A source the behaviour cannot distinguish is a source only "
  + "a structural pin can hold.",
  [["store", `                  \`    description: \${q(pv.description)}\`,`,
             `                  \`    description: \${q(args.description)}\`,`]],
  ["REC-75: EVERY VALUE THE WRITE QUOTES COMES FROM THE ONE NORMALISER"],
  ["WALK GUARD for that arm",
   "D-234 (1) THE QUOTATION MARK", "D-234 (2) THE BACKSLASH", "D-234 (3) THE NEWLINE",
   "D-234 (4) THE TRAILING AND LEADING SPACE", "D-234 (5) AND IT IS NOT ONLY THE VERSION ROW",
   "REC-75 — `composition` PUBLISHES THE RECORD'S BYTES",
   "REC-75 OVER-STRICTNESS",
   "D-231 — AND IT IS STILL REFUSED A WHOLE SECOND LATER",
   "CHECK 1: a leg naming a document"]);

console.log(`\n=================================================================`);
console.log(`arms run: ${armsRun} · arms that did NOT behave as declared: ${armsWrong}`);
console.log(`every arm restored; every file verified by sha256 AND by content`);
process.exit(armsWrong ? 1 : 0);
