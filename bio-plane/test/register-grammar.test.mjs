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
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { countArms, countTransitions, countEnumerations, readControl }
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
const reachable = spawnSync("git", ["cat-file", "-e", "0ca7640^2"], { cwd: REPO }).status === 0;
t("B3a the REC-68 branch blob is reachable from this worktree", reachable, true);
if (!reachable) throw new Error("0ca7640^2 unreachable — this suite cannot judge the history");

const blob = spawnSync("git", ["show", "0ca7640^2:docs/development/VERIFICATION.md"],
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

console.log(`\nregister-grammar: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
