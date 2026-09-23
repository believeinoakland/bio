/* GATE: never-cache (history) — M0-126, BOB #30 (TREE-SHARING §3a condition 1): its verdict reads git show of a historical merge's parent, which no
   result key can name; traced 2026-09-23.
   READS NO LIVE REF — M0-136, 2026-09-23. What it reads: the merge `0ca7640`'s second parent by its FULL commit id
   (`cat-file -e` and `show …^2:docs/development/VERIFICATION.md`), and HEAD's tree and index through
   `../scripts/provenance.mjs` (`ls-tree -r HEAD`, `ls-files`, `rev-parse --short HEAD`). No `origin/*`, `coord`,
   `FETCH_HEAD`, `ls-remote` or fetch. HOW CHECKED: this file and the modules it imports (`./stdio.mjs`,
   `../scripts/control-register.mjs`, `../scripts/provenance.mjs`) grepped for `spawnSync`/`execFileSync`/`git` and those
   ref tokens, and the suite run with a logging `git` first on PATH: 5 calls, those. CORRECTED the same day: the id was
   the ABBREVIATED `0ca7640`, which git resolves against the whole object store — a fetch that brings in a second object
   with that prefix makes it ambiguous and this suite throw, a verdict moving with what was fetched. It is now the full
   id. No clock is read. */
/* NEGATIVE CONTROL: (1) make `countTransitions` in scripts/control-register.mjs
 * return 0 always -> A1 and A3 FAIL with the corpus PRINTED, A2 stays GREEN
 * because an enumerated declaration never depended on arrows. (2) make
 * `countEnumerations` return 0 always -> A2 FAILS (3 -> null, the UNCLASSIFIED
 * path) while A1 stays GREEN. (3) THE DROP ARM, and it is the one this suite
 * exists for: delete the `D-263 PROVENANCE` block from
 * docs/development/VERIFICATION.md, exactly as merge `0ca7640` dropped REC-68's
 * sentence -> B1 and B2 FAIL BY NAME rather than going quiet. (4) change one
 * numeral in the block's history (482 -> 483) -> B3 FAILS against the REC-68
 * branch blob at `0ca7640^2`, because the history is compared to git and never
 * to a hand copy. (5) put REC-68's perishable opening back into the block
 * ("THE CURRENT PRINTED FIGURE IS ...") -> B4 FAILS, which is the whole D-263
 * lesson: a restored sentence that has since gone false is a second defect.
 * (6) OVER-STRICTNESS -> rewrite the block's prose in a spelling this suite did
 * not anticipate, keeping every claim and numeral, and EVERY arm stays GREEN.
 * (7) BASELINE -> nothing armed, all arms GREEN, so a run of six nulls cannot be
 * mistaken for six passes.
 * (8) M0-42, AND IT IS THE ARM THAT ITEM EXISTS FOR, POINTED INWARD: take a suite
 * whose declaration RECORDS its run and remove the record, leaving its arms exactly
 * as they were -> C5c FAILS BY NAME. A control DECLARED and not RUN becomes visible
 * in the register's own output, which before M0-42 it was not: every declaration
 * read identically whether its arms had been run or only imagined. (9) M0-42
 * OVER-STRICTNESS, and it is the arm that decides whether the mechanism is USABLE ->
 * rewrite the same run record in a DIFFERENT spelling the estate also writes, and
 * EVERY arm stays GREEN. A worker who genuinely ran the control must never be told
 * they did not because they reached for another word; a register that makes honest
 * work expensive gets bypassed and then measures nothing. (10) FORGE A TOKEN into a
 * declaration that records no run, inventing the date and the result and running
 * nothing -> C5d and C5e FAIL, because the register grades that suite RUN. **THIS
 * ARM IS DECLARED TO SUCCEED AT FORGING AND ITS RED IS THE FINDING**: nothing
 * detects it and nothing could, so the limit printed beside the figure is DRIVEN
 * rather than merely conceded in prose. (11) DELETE THE LIMIT — remove the sentence
 * in which the register admits it cannot prove a run -> C7b FAILS BY NAME, because
 * an instrument that quietly drops its own caveat keeps printing the figure while
 * the reader stops being told what it is worth.
 * RUN 2026-09-19 by BOB #16 via `node test/register-grammar.control.mjs` after VERIFICATION.md was cut to
 * 24,309 bytes and the driver's VERIF floor lowered to 16,000: eleven of eleven armed and run, eleven as
 * declared, every restore sha256 and content EQUAL, suite 29 pass.
 * RUN 2026-09-16 by M0-42 via `node test/register-grammar.control.mjs`, all eleven
 * arms armed ALONE with the others held open, every restore verified by sha256 AND
 * by content against per-arm pristine copies under a byte floor. RESULTS: 11 of 11
 * ARMED, 11 of 11 as declared — but only after arm (1), which is D-263's and not
 * M0-42's, came back NOT AS DECLARED and was corrected at the driver rather than
 * smoothed: **A5 was declared to FAIL under it and now stays GREEN, because the
 * CORPUS GREW and A5's `readable > 100` floor no longer bites** (measured 2026-09-16:
 * 197 classified, 124 surviving with transitions zeroed against ~146/under-100 when
 * D-263 ran it on 2026-08-09). A5 is deliberately NOT retuned to make the arm fire;
 * the slack floor is named at the driver for whoever owns it. **A declaration nobody
 * re-runs decays toward GREEN and says nothing while it does — M0-42's own subject,
 * found inside M0-42's own harness.**
 * RUN 2026-08-09 by D-263, each arm ALONE with the others held open, via
 * `node test/register-grammar.control.mjs`; restores verified by sha256 AND by
 * content against per-arm uniquely-named pristine copies under a byte floor, and
 * a missing tally reported as -1 rather than 0. RESULTS: 7 of 7 ARMED, 7 of 7 as
 * declared — but only after TWO came back wrong on the first run, and both are
 * recorded here rather than smoothed because each moved real work:
 *   - arm (1) was declared to leave A4 and A5 GREEN and BOTH went RED. The code
 *     was right and MY DECLARATION was wrong: A4's fixture states one ordinal, so
 *     enumerations refuse it and its count comes entirely from the arrow, and A5's
 *     corpus is arrow-marked almost throughout. The declaration was corrected at
 *     the arm with that reason; nothing was exempted.
 *   - arm (4) was declared to fail and STAYED GREEN, and that was a real hole in
 *     B3c. It read the receipts anywhere in the block, and `471 -> 482` appears
 *     twice — once as an ILLUSTRATION of the transition grammar, once in the
 *     history — so falsifying the history left the illustration to satisfy the
 *     arm. B3c is now scoped to the history paragraph. An arm passing for a reason
 *     it was not written for is the class this suite is about, and it was inside
 *     the suite.
 *   - arm (4) also REFUSED TO ARM on its first attempt (`anchor matched 2 times,
 *     need 1`) for the same duplication. The refusal is the guard working, and it
 *     is what led to the hole above being seen at all.
 * THIS PARAGRAPH IS ITSELF THE MECHANISM THE SUITE DOCUMENTS: writing these
 * results back into the declaration RAISED the arms tally, so the REGISTER_FLOOR
 * figure for this suite was read off `--strict` AFTER this edit and not before.
 *
 * WHAT THIS SUITE IS FOR (D-263). Merge `0ca7640` kept main's side of one
 * VERIFICATION.md row and dropped REC-68's rewrite of it. Nothing went red: the
 * battery was green, `--strict` exit 0, and the explanation of how the arms
 * figure moves was simply gone from the tree for a day. M0-20's `mergecarry`
 * now catches the DROP at the merge. This suite catches the other half — the
 * restored text going missing again, or going FALSE — by holding the prose to
 * two things it cannot argue with: the instrument's live behaviour, and the
 * REC-68 branch blob that git still holds.
 *
 * WHAT IT CANNOT SEE, stated here rather than discovered later:
 *   - It does not read the register ROW's figures. Those are perishable, moved
 *     by the integrator from a printed run, and deliberately NOT pinned here —
 *     pinning them would make this suite the ninth item to carry a stale number.
 *   - It cannot tell a faithful rewording from a subtly weakened one. B2 asks
 *     that both halves of the claim are present, not that they are well argued.
 *   - It reads ONE block. A second copy of this explanation elsewhere in the
 *     file would not be noticed, which is PL-18's three-rows defect and is why
 *     B1 asserts the anchor occurs EXACTLY once rather than at least once.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { countArms, countTransitions, countEnumerations, readControl, readRunEvidence }
  from "../scripts/control-register.mjs";
/* GUARDED, NOT NAMED (D-238's class, and hygiene's walk census caught this suite
   on its first full battery before anyone read the diff — the ratchet working).
   A5 walks `test/`, a directory this suite does not control, and PRINTS A CENSUS.
   That is exactly the exposure the guarded walks carry: a phantom suite deposited
   beside it inflates a figure, and this item's whole subject is figures that can
   be trusted. So the corpus is counted over the files that are IN THE COMMIT, and
   anything off-commit is NAMED rather than silently counted. */
import { readGitProvenance, classifyDiscovered, repoPath } from "../scripts/provenance.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "../..");
const VERIF = join(REPO, "docs/development/VERIFICATION.md");

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  if (!ok) console.log(`FAIL: ${name}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
};

/* ==================================================================== PART A
   THE MECHANISM, DRIVEN THROUGH THE REAL MATCHER. The claim under test is the
   one REC-68 recorded and D-263 recovered: writing a control's RESULTS back into
   its own declaration raises the tally, so the figure must be read after the
   LAST edit. Driven rather than read, because a mechanism believed on the
   strength of its existence is this project's most-met defect. */

const ARROW = "NEGATIVE CONTROL: (1) break the tokenizer -> the suite fails. "
  + "(2) leave it intact -> the suite passes.";
const ARROW_WITH_RESULTS = ARROW
  + " RESULTS 2026: arm (1) GREEN -> RED as declared; arm (2) GREEN -> GREEN as declared.";

t("A1 an ARROW-grammar declaration RISES when its results are written back into it",
  [countArms(ARROW), countArms(ARROW_WITH_RESULTS)], [2, 4]);

/* The half REC-68's original sentence did not state, and the reason D-263
   amended it rather than restoring it verbatim. Because the count is
   max(transitions, enumerations), an ENUMERATED declaration absorbs prose
   results for free. */
const ENUM = "NEGATIVE CONTROL: (1) first arm. (2) second arm. (3) third arm.";
const ENUM_PROSE_RESULTS = ENUM + " RESULTS: all three came back as declared.";

t("A2 an ENUMERATED declaration does NOT rise when its results add no arrows",
  [countArms(ENUM), countArms(ENUM_PROSE_RESULTS)], [3, 3]);

/* ...and it rises only once the arrows OUTNUMBER the ordinals, which is the
   boundary the amended text states. */
const ENUM_ARROW_RESULTS = ENUM + " RESULTS: (1) GREEN -> RED. (2) GREEN -> RED. "
  + "(3) GREEN -> RED. and a fourth reading GREEN -> RED.";

t("A3 an ENUMERATED declaration rises only once arrows outnumber ordinals",
  [countArms(ENUM_ARROW_RESULTS),
   countTransitions(ENUM_ARROW_RESULTS), countEnumerations(ENUM_ARROW_RESULTS)],
  [4, 4, 3]);

/* OVER-STRICTNESS. An arrow-looking token in a spelling the grammar does not
   accept must not inflate a tally that carries a floor. */
t("A4 an arrow without whitespace on both sides is NOT an arm",
  countArms("NEGATIVE CONTROL: (1) one arm -> it fails. See a->b in the source."), 1);

/* THE MECHANISM IS NOT VACUOUS, and the corpus is PRINTED. If no suite in the
   estate ever wrote its results into its own declaration, all of Part A would be
   true of nothing — a headline claim over an empty corpus, which has passed in
   this repository three separate times. */
const suiteFiles = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs")).sort();
const prov = readGitProvenance(REPO);
const disc = classifyDiscovered(prov,
  suiteFiles.map((f) => ({ path: repoPath(REPO, join(DIR, f)), what: "suite", counted: true })));
const inCommit = new Set(disc.inCommit);

let readable = 0, statingResults = 0, offCommit = 0;
for (const f of suiteFiles) {
  /* RULE 2's third state is honoured: when git cannot answer, `verified` is
     false and NOTHING is treated as committed — the figure is reported
     UNVERIFIED rather than silently taken from the working tree. */
  if (disc.verified && !inCommit.has(repoPath(REPO, join(DIR, f)))) { offCommit++; continue; }
  const d = readControl(readFileSync(join(DIR, f), "utf8"));
  if (!d || d.arms == null) continue;
  readable++;
  if (/\b(RESULTS?|came back|as declared|ACTUAL)\b/.test(d.text)) statingResults++;
}
console.log(`corpus (A): ${suiteFiles.length} suite file(s) walked · provenance `
  + `${disc.verified ? `VERIFIED at ${disc.headSha}` : "UNVERIFIED (git could not answer)"} · `
  + `${offCommit} NOT in the commit and therefore NOT counted`
  + `${disc.off.length ? ` [${disc.off.map((r) => `${r.path} ${r.state}`).join(", ")}]` : ""} · `
  + `${readable} counted with a countable declaration · ${statingResults} of those state `
  + `their RESULTS in the declaration itself`);
t("A5 the corpus is non-empty and the mechanism is live in it, not merely possible",
  [disc.verified, readable > 100, statingResults > 0], [true, true, true]);

/* ==================================================================== PART B
   THE PROSE, HELD TO THE BRANCH BLOB. This is the drop-detecting half. */

const verif = readFileSync(VERIF, "utf8");

/* EXACTLY once, not at least once: PL-18 found this metric occupying three table
   rows with three different figures, and a second copy of an explanation is the
   same defect one level up. The END marker CONTAINS the anchor as a substring, so
   the opener is counted as the anchor NOT preceded by `END ` — an arm that
   counted raw occurrences would read 2 here and be wrong for a reason that looks
   like a real duplicate. */
const ANCHOR = "D-263 PROVENANCE";
const openers = [...verif.matchAll(/(?<!END )D-263 PROVENANCE/g)].length;
t(`B1 VERIFICATION.md carries the ${ANCHOR} anchor EXACTLY once`, openers, 1);

/* THE SPAN IS MARKED AT BOTH ENDS, which is DEC-49's smallest-span rule applied
   to prose. Every arm below is scoped to it, so a span that ran on would let them
   pass by citing a neighbouring paragraph the drop never touched — the "sweep arm
   that failed by citing itself" receipt arriving here. MEASURED while building
   this: ending the span at the next `## ` heading gave 10,261 bytes and reached
   four paragraphs that are not this item's; ending it at the END marker gives the
   block itself. B6 floors AND ceilings the result, because a span narrowed to
   nothing reports a spotless block and passes. */
const END = "END " + ANCHOR;
const anchorAt = verif.indexOf(ANCHOR);
const endAt = verif.indexOf(END, anchorAt + ANCHOR.length);
const block = anchorAt === -1 || endAt === -1 ? "" : verif.slice(anchorAt, endAt);
t(`B1b the block is CLOSED by its ${END} marker`, endAt > anchorAt, true);

/* BOTH HALVES OF THE CLAIM. The rise, and the boundary that makes the rise
   conditional. Restoring only the first half is what D-263 declined to do. */
t("B2 the block states BOTH the double move AND the max() boundary that limits it",
  /* `\s*` and not ` *`: the phrase wraps across a line in the source and a
     space-only matcher read FALSE over prose that plainly says it. Caught by
     this arm on its first run, and recorded rather than quietly widened. */
  [/after the \*{0,2}LAST\*{0,2}\s*EDIT/i.test(block),
   /moves twice/i.test(block),
   /max/i.test(block) && /outnumber/i.test(block),
   /* The corpus claim must be DATED, never present-tense. A bare numeral here is
      exactly what went false in REC-68's sentence, so this arm pins the TENSE and
      not the number — the number is printed by this suite's own corpus line and
      that is the authority. */
   /measured 2026-\d\d-\d\d/i.test(block)],
  [true, true, true, true]);

/* B3 IS THE ONE THAT MAKES A PARAPHRASE FAIL. The recovered history is compared
   against the REC-68 branch blob that git still holds, never against a copy kept
   here — a hand copy agrees for free, and this project has measured that five
   times including a complete hand copy of 131 op names that passed. */
const reachable = spawnSync("git", ["cat-file", "-e", "0ca7640f6d91d3dea0f8e552b7356e9eee374de2^2"], { cwd: REPO }).status === 0;
t("B3a the REC-68 branch blob is reachable from this worktree", reachable, true);
if (!reachable) throw new Error("0ca7640^2 unreachable — this suite cannot judge the history");

const blob = spawnSync("git", ["show", "0ca7640f6d91d3dea0f8e552b7356e9eee374de2^2:docs/development/VERIFICATION.md"],
  { cwd: REPO, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }).stdout || "";
t("B3b the branch blob was actually read (not an empty string agreeing for free)",
  blob.length > 10_000, true);

/* Every figure the recovered history states must be a figure REC-68's own tree
   printed. Asserted in BOTH directions: present in the block, and present in the
   blob. */
/* SCOPED TO THE HISTORY PARAGRAPH, NOT THE WHOLE BLOCK — and this narrowing is a
   CONTROL FINDING, not a precaution. The first draft read the receipts anywhere in
   the block. Control arm 4 falsified the history (`471 -> 482` -> `471 -> 483`)
   and B3c STAYED GREEN, because the same digits appear a few lines earlier as an
   ILLUSTRATION of the transition grammar and the substring test found those. The
   arm was passing for a reason it was not written for, which is the exact class it
   exists to catch, arriving inside itself. The history paragraph is now the span. */
const HIST_MARK = "THE HISTORY, because it is the receipt";
const histAt = block.indexOf(HIST_MARK);
const histEnd = histAt === -1 ? -1 : block.indexOf("\n\n", histAt);
const history = histAt === -1 ? "" : block.slice(histAt, histEnd === -1 ? block.length : histEnd);
t("B3c0 the history paragraph is present and is a real span", history.length > 250, true);

const RECEIPTS = ["471 -> 482", "478/471", "GREW by 7", "482/478", "GREW by 4"];
t("B3c every receipt in the recovered HISTORY is in that paragraph AND in the branch blob",
  RECEIPTS.map((r) => [r, history.includes(r), blob.includes(r)]),
  RECEIPTS.map((r) => [r, true, true]));

/* B4 — THE D-263 LESSON ITSELF. REC-68's sentence opened by asserting a CURRENT
   figure. That is the half that went false. The recovered block must state the
   history in the PAST tense and must never re-acquire a live-figure claim, or
   the next reader inherits a confident wrong number. */
t("B4 the block does NOT assert a current printed figure",
  /THE CURRENT PRINTED FIGURE IS/i.test(block), false);

/* And the perishable figure still lives where the integrator moves it, so this
   correction did not quietly relocate the row's job into a suite. */
t("B5 the register ROW still carries the current figure, and this block does not",
  [/suites declaring a negative control \|/.test(verif),
   /arms/.test(block)],
  [true, true]);

/* THE SPAN IS FLOORED, because every arm above is scoped to it and a span
   narrowed to nothing reports a spotless block and passes. Floored well under
   the measured size so ordinary editing does not trip it. */
t("B6 the recovered block is a real span, not a narrowed-to-nothing one",
  [block.length > 1200, block.length < 6000], [true, true]);

console.log(`corpus (B): ${block.length} byte(s) of recovered block read from `
  + `docs/development/VERIFICATION.md · ${blob.length} byte(s) of REC-68 branch blob read from git`);

/* ==================================================================== PART C
   M0-42 — RUN vs DECLARED, AND THE LIMIT PINNED BEFORE THE MECHANISM.

   **WHAT PART C DOES NOT ASSERT, SAID FIRST BECAUSE IT IS THE POINT OF THE ITEM.**
   It does not assert that any control ran. Nothing here can, and C7 exists to pin
   that the instrument SAYS SO rather than to hide it. A register that claimed to
   prove execution would be a worse instrument than one that admits it cannot,
   because every downstream reader would then believe a figure exactly as strong as
   the worker's word and no stronger.

   **AND THE PREMISE THE ITEM WAS ROWED ON IS CORRECTED HERE RATHER THAN REPEATED.**
   M0-41's census reported that nothing distinguishes a control that RAN from one
   only DECLARED. That is true of the INSTRUMENTS and false of the RECORD: measured
   2026-09-16, 164 of the plane's 198 declarations already carried a dated run token
   in prose, written by workers nobody asked. The absence was never that the estate
   fails to record its runs — it is that NO INSTRUMENT READ THE RECORD, so the 34
   that carry nothing were invisible beside the 164 that do. C6 is therefore the
   load-bearing arm of this part: the spellings workers ALREADY use must grade RUN,
   because a register that makes honest work expensive gets bypassed and then
   measures nothing. */

const RUN_FIXTURE = "NEGATIVE CONTROL: break the tokenizer -> the suite fails. "
  + "RUN 2026-08-09 by D-263, each arm ALONE, 7 of 7 as declared.";
const UNDET_FIXTURE = "NEGATIVE CONTROL: break the tokenizer -> 17 of 34 assertions fail.";
const BARE_FIXTURE = "NEGATIVE CONTROL: break the tokenizer and the suite must then fail.";

t("C1 a declaration carrying a dated execution token reads RUN, with the date recovered",
  [readRunEvidence(RUN_FIXTURE).state, readRunEvidence(RUN_FIXTURE).date],
  ["RUN", "2026-08-09"]);

/* UNDETERMINED IS FIRST-CLASS AND IS NOT A SOFTER "NO". A figure alone CANNOT
   distinguish a measurement from a prediction, because the register grammar spells
   a forecast and a result the same way: `break this -> that must then fail` is the
   form of both. Collapsing this state into RUN would be the overclaim; collapsing
   it into DECLARED-ONLY would call an honest worker's run a failure. */
t("C2 a measured-LOOKING outcome with no date is UNDETERMINED, never RUN and never DECLARED-ONLY",
  readRunEvidence(UNDET_FIXTURE).state, "UNDETERMINED");

t("C3 a wholly prospective declaration is DECLARED-ONLY",
  readRunEvidence(BARE_FIXTURE).state, "DECLARED-ONLY");

/* C4 — NEGATION, AND THE CLAUSE BOUND THAT COST SIX TRUE TOKENS.
   The first draft of the negation guard read a flat 44 characters back and scored
   158 where the unguarded scan scored 164. All six losses were a negator in the
   PRECEDING SENTENCE with that sentence's own full stop in between — this suite's
   own declaration among them. The second pair below is that regression pinned
   verbatim, so a future tightening of the guard fails here instead of silently
   converting six honest runs into six false NOT-RUNs. */
t("C4a a NEGATED run claim does not read RUN",
  readRunEvidence("NEGATIVE CONTROL: arm (1) -> it fails. This has never been run, 2026-09-16.").state,
  "DECLARED-ONLY");
t("C4b a negator in the PREVIOUS SENTENCE does not suppress a real token (the six-token regression)",
  readRunEvidence("NEGATIVE CONTROL: a run of six nulls cannot be mistaken for six "
    + "passes. RUN 2026-08-09 by D-263, 7 of 7 as declared.").state,
  "RUN");

/* C5 — THE LIVE CORPUS. Every declaration lands in exactly one of three states and
   the three partition the corpus: a state that could be both, or neither, is how a
   count gets quietly reported over a set nobody defined. Two suites are named, and
   they are named because the DRIVER flips each one: stripping `admission-gate`'s
   token must make it visible here, and forging one into `affordances` must be
   visible too — which is the forgery WORKING, not the register catching it. */
const runStates = { RUN: 0, UNDETERMINED: 0, "DECLARED-ONLY": 0 };
let gradedCorpus = 0, admissionState = null, affordancesState = null;
let notRun = 0, notRunButTokenElsewhere = 0, affordancesElsewhere = null;
for (const f of suiteFiles) {
  if (disc.verified && !inCommit.has(repoPath(REPO, join(DIR, f)))) continue;
  const src = readFileSync(join(DIR, f), "utf8");
  const d = readControl(src);
  if (!d) continue;
  gradedCorpus++;
  runStates[d.run.state]++;
  if (d.run.state !== "RUN") {
    notRun++;
    const elsewhere = readRunEvidence(src.replace(/\s+/g, " ")).state === "RUN";
    if (elsewhere) notRunButTokenElsewhere++;
    if (f === "affordances.test.mjs") affordancesElsewhere = elsewhere;
  }
  if (f === "admission-gate.test.mjs") admissionState = d.run.state;
  if (f === "affordances.test.mjs") affordancesState = d.run.state;
}
console.log(`corpus (C): ${gradedCorpus} declaration(s) graded · RUN ${runStates.RUN} · `
  + `UNDETERMINED ${runStates.UNDETERMINED} · DECLARED-ONLY ${runStates["DECLARED-ONLY"]} · `
  + `admission-gate=${admissionState} affordances=${affordancesState} · ${notRunButTokenElsewhere}/${notRun} not-RUN suites carry a token ELSEWHERE`);

t("C5a the three states PARTITION the graded corpus — no declaration is both or neither",
  runStates.RUN + runStates.UNDETERMINED + runStates["DECLARED-ONLY"] === gradedCorpus, true);
t("C5b the corpus is non-empty and the mechanism is live in it, not merely possible",
  [gradedCorpus > 150, runStates.RUN > 150], [true, true]);
t("C5c a suite whose declaration RECORDS its run reads RUN, by name",
  admissionState, "RUN");
t("C5d a suite whose declaration records NO run does not read RUN, by name",
  affordancesState === "RUN", false);

/* C5e — THE ANTI-OVERCLAIM PIN, AND IT IS HERE BECAUSE THIS ITEM'S FIRST DRAFT GOT
   IT WRONG IN THE DIRECTION THIS PROJECT CARES ABOUT. Naming all 34 not-RUN suites
   as resting on the worker's word read as a finding and was FALSE for 18 of them:
   `readControl` records ONE declaration per suite, and the marker grammar does not
   see `NEGATIVE CONTROL (` at all, so a suite can record its runs in a second
   declaration and still be graded on the silent one. `affordances.test.mjs` is the
   receipt — graded DECLARED-ONLY while holding five further declarations reading
   *"all RUN 2026-08-04 … restored BYTE-IDENTICAL"*. **A register that reported that
   suite as uncontrolled would be claiming more than it can support, which is the
   defect this whole item exists to avoid, turned on itself.** */
t("C5e a suite graded not-RUN whose runs are recorded in a declaration the register CANNOT SEE is not reported as a finding",
  [affordancesState, affordancesElsewhere], ["DECLARED-ONLY", true]);
t("C5f the overclaim is bounded and PRINTED: not every not-RUN suite is evidence-free",
  [notRun > 0, notRunButTokenElsewhere > 0, notRunButTokenElsewhere < notRun],
  [true, true, true]);

/* C6 — OVER-STRICTNESS, AND IT IS THE ARM THAT DECIDES WHETHER THIS IS USABLE.
   Every spelling below was COPIED OUT OF THIS ESTATE'S OWN SUITES on 2026-09-16,
   not invented for the test. If any one of them failed to grade RUN, this register
   would be telling a worker who already did the work that they had not, and the
   correct response to that instrument is to bypass it. No worker is asked to add
   ceremony to prove what they already did; the vocabulary was fitted to what they
   had already written. */
const REAL_SPELLINGS = [
  "NEGATIVE CONTROL: arm (1) -> it fails (run 2026-07-31) on the acquire path.",
  "NEGATIVE CONTROL: arm (1) -> it fails. ALL SIX ARMS RUN 2026-08-08 IN WORKTREE agent-a6feaaff.",
  "NEGATIVE CONTROL: arm (1) -> it fails. all four RUN 2026-08-05 by rec24-agent, each broken ALONE.",
  "NEGATIVE CONTROL: arm (1) -> it fails. 27 pass, 0 fail — RE-MEASURED 2026-08-10 BY FL-7.",
  "NEGATIVE CONTROL: arm (1) -> it fails. re-run 2026-08-10 against the merged tree.",
  "NEGATIVE CONTROL: arm (1) -> it fails. every arm below was RUN on 2026-08-07 by is6-agent.",
  "NEGATIVE CONTROL: arm (1) -> it fails. DRIVEN 2026-09-12, restores verified by content.",
];
t("C6 every run-token spelling this estate ALREADY writes grades RUN — no new ceremony is imposed",
  REAL_SPELLINGS.map((s) => readRunEvidence(s).state),
  REAL_SPELLINGS.map(() => "RUN"));

/* C7 — THE LIMIT, PINNED AT THE SITE AND IN THE REGISTER'S OWN WORDS.
   **A FORGED TOKEN IS INDISTINGUISHABLE FROM A REAL ONE.** C7a drives that rather
   than conceding it in prose: a token fabricated out of nothing grades RUN, and
   nothing here refuses it. C7b is the accepts-when — the instrument must SAY this
   where it prints the figure, not only in a queue row nobody reads beside the
   output. An instrument that quietly overstates its own reach is this project's
   own defect turned inward, and it is the one thing this item could get wrong in a
   way that leaves the record worse than it found it. */
t("C7a A FORGED TOKEN GRADES RUN AND NOTHING DETECTS IT — the limit, driven, not conceded",
  readRunEvidence("NEGATIVE CONTROL: arm (1) -> it fails. RUN 2026-09-16, 9 of 9 as "
    + "declared, in a session that never existed.").state,
  "RUN");

const COVERAGE = readFileSync(join(DIR, "../scripts/coverage.mjs"), "utf8");
const LIMIT_AT_SITE = [
  "THIS DOES NOT PROVE THAT ANY CONTROL",
  "FORGED RUN TOKEN IS INDISTINGUISHABLE FROM A REAL ONE",
  "would be a worse instrument than this one",
];
t("C7b the register STATES its limit where it prints the figure, in its own words",
  LIMIT_AT_SITE.map((s) => COVERAGE.includes(s)), LIMIT_AT_SITE.map(() => true));


console.log(`\nregister-grammar: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
