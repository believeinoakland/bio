/* undesignedclaims — D-408's predicate: the corpus's own statements that something is UNDESIGNED.
 *
 * `CLAUDE.md`: **a blocker is a claim, and nothing here audits one.** Every other instrument in
 * this estate is pointed at the record claiming MORE than the evidence supports. A sentence
 * saying *X is undesigned* claims LESS, so it passes all of them — and it costs real work in the
 * direction that leaves no trace, because the work simply never happens.
 *
 * ------------------------------------------------ WHAT THIS SUITE IS DEFENDING AGAINST
 *
 * **A sweep that finds NOTHING and a sweep that finds EVERYTHING are both dead, and both look
 * alive.** The first lets a stale *undesigned* sit for six weeks (Q14 did). The second is a
 * worklist nobody reads. So every quiet arm below asserts a FOUND claim in the same run.
 *
 * **AND THE ARM THAT MATTERS MOST IS THE AUDITED/UNAUDITED SPLIT, because it is the one the
 * instrument got WRONG first.** Correcting a stale claim IN PLACE is right — the sentence is the
 * receipt, and deleting it destroys the evidence of what was believed and for how long — but that
 * leaves the phrase in the file. **Measured: the raw count did not move at all after EIGHT claims
 * were resolved.** A number that cannot go down is not a signal, so the figure is UNAUDITED and
 * a claim counts as audited only when its OWN LINE carries a dated verdict.
 *
 * **LINE-LOCALITY IS LOAD-BEARING, NOT AN IMPLEMENTATION DETAIL.** A verdict three paragraphs
 * from its claim is one the reader of that sentence never sees, which is exactly how *undesigned*
 * propagates. The author's own first annotation sat on a different line and the instrument
 * correctly refused to count it.
 *
 * NEGATIVE CONTROL: (all five RUN 2026-09-17 by BOB #13) `node bio-plane/test/undesignedclaims.control.mjs`
 * from the repo root — five arms, each armed ALONE against a pristine copy in `.d408-harness/`,
 * every restore verified by sha256 AND `cmp` AND a floored byte count.
 *   (A1) the AUDITED test made to ignore the date -> S3 fails: an audited claim reappears and the
 *        count can never go down, which is the defect the split exists to fix.
 *   (A2) the audited test widened to the WHOLE DOCUMENT instead of the line -> S4 fails: a verdict
 *        anywhere silences a claim everywhere, which is how the propagation happens.
 *   (A3) an unreadable document scored as clean -> S5 fails: the unearned-absence rule, inside the
 *        instrument whose whole subject is unearned absence.
 *   (A4) one claim shape dropped from the pattern -> S2 fails: the shapes were derived by reading
 *        the 21 that existed, and losing one loses a class silently.
 *   (A5) THE PRECISION ARM — every line reported as a claim. A sensitivity control does not
 *        notice a sweep that finds everything; only this does.
 */

import "./stdio.mjs";
import "./sandbox.mjs";
import { claimsIn, sweep, sweepMessage, CLAIM_RE, AUDITED_RE } from "../../tools/undesignedclaims.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 6;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

const fixture = (files) => (p) => (p in files ? files[p] : null);
const GOV = new Set(["docs/a.md", "docs/b.md"]);

/* ========================================================================== */
section("1 — THE SHAPES ARE FOUND. A sweep that matches nothing passes every quiet arm below it, "
      + "so the claim shapes are asserted directly.");
{
  const c = claimsIn([
    "the route marker is UNDESIGNED and nobody owns it",
    "a member's LEAD has no home",
    "Q14 is about contradiction, which nothing answers",
    "the external OCR tier is not designed",
    "this line says nothing of the kind",
  ].join("\n"));
  t("five lines, four claims", c.length, 4);
  t("...and the innocent line is not one of them",
    c.some((x) => /nothing of the kind/.test(x.context)), false);
  t("each claim carries its LINE, so a reader can go to it", c.map((x) => x.line), [1, 2, 3, 4]);
  t("each carries the phrase that matched", c.every((x) => x.phrase && x.phrase.length > 3), true);
  t("the patterns are declared once", [CLAIM_RE instanceof RegExp, AUDITED_RE instanceof RegExp],
    [true, true]);
}

/* ========================================================================== */
section("2 — EVERY SHAPE IS LOAD-BEARING. They were derived by reading the 21 claims that existed "
      + "on 2026-09-17, so dropping one loses a whole class silently.");
{
  const each = {
    "is UNDESIGNED": "the surface that shows it is undesigned.",
    "has no home": "the AUTHORED frontier has no home",
    "nothing answers": "Q14 is about CONTRADICTION, which nothing answers.",
    "no governed design": "no governed design covers this construct at all",
    "is not designed": "the external OCR tier is not designed; DEC-74 is answered",
  };
  for (const [name, line] of Object.entries(each))
    t(`the '${name}' shape is matched`, claimsIn(line).length > 0, true);
}

/* ========================================================================== */
section("3 — AUDITED vs UNAUDITED, WHICH IS THE FIGURE THAT MATTERS. Correcting a claim IN PLACE "
      + "keeps the receipt and keeps the phrase — so the RAW COUNT CANNOT GO DOWN and is not a "
      + "signal. Measured: it did not move after eight resolutions.");
{
  const docs = {
    "docs/a.md": "the marker is undesigned\nthe lead has no home **[audited 2026-09-17: STILL TRUE]**\n",
    "docs/b.md": "case-making is undesigned **[framing of 2026-08-01; the design has landed]**\n",
  };
  const s = sweep({ governedSet: GOV, reader: fixture(docs) });
  t("the TOTAL counts every claim, audited or not", s.counts.claims, 3);
  t("...and exactly one is UNAUDITED", s.counts.unaudited, 1);
  t("...and two carry a dated verdict", s.counts.audited, 2);
  t("only the document with an unaudited claim is listed",
    s.byDoc.map((d) => d.path), ["docs/a.md"]);
  /* `?.` throughout: A2 crashed this line by emptying `byDoc`, and a TypeError here ENDS THE
     MODULE with the tally reading clean. The control found it, which is what a control is for. */
  t("...and the audited claim is not listed under it",
    s.byDoc[0]?.claims.filter((c) => !c.audited).length ?? "NO DOCUMENT LISTED", 1);
  t("the message reports UNAUDITED, not the total", /UNAUDITED — 1 statement/.test(sweepMessage(s)), true);
  t("...and says how many are audited, so the quiet is accounted for",
    /2 more are audited/.test(sweepMessage(s)), true);
}

/* ========================================================================== */
section("4 — THE VERDICT MUST BE LINE-LOCAL. A correction three paragraphs from its claim is one "
      + "the reader of that sentence never sees — which is exactly how 'undesigned' propagates, "
      + "and the author's own first annotation failed this way.");
{
  const far = { "docs/a.md":
    "the marker is undesigned\n\nsome prose\n\n**[SUPERSEDED 2026-09-17 — the above is stale]**\n" };
  const near = { "docs/a.md":
    "the marker is undesigned **[SUPERSEDED 2026-09-17]**\n\nsome prose\n" };
  t("a verdict on ANOTHER line does NOT audit the claim",
    sweep({ governedSet: GOV, reader: fixture(far) }).counts.unaudited, 1);
  t("...and a verdict on the SAME line does",
    sweep({ governedSet: GOV, reader: fixture(near) }).counts.unaudited, 0);
  t("...which is a difference, so line-locality is actually being tested",
    sweep({ governedSet: GOV, reader: fixture(far) }).counts.unaudited
      !== sweep({ governedSet: GOV, reader: fixture(near) }).counts.unaudited, true);
}

/* ========================================================================== */
section("5 — AN UNREADABLE DOCUMENT IS NOT A CLEAN ONE. The unearned-absence rule, inside the "
      + "instrument whose entire subject is unearned absence.");
{
  const s = sweep({ governedSet: GOV, reader: fixture({ "docs/a.md": "all fine here\n" }) });
  t("the unreadable document is COUNTED", s.counts.unreadable, 1);
  t("...and NAMED in the walk", s.byDoc.some((d) => d.unreadable && d.path === "docs/b.md"), true);
  /* `?.` because a TypeError here would END THE MODULE with the tally reading clean — this
     suite's own FOOT discipline, and A3 found it by crashing rather than failing. */
  t("...and it is not silently treated as carrying no claims",
    s.byDoc.find((d) => d.path === "docs/b.md")?.claims ?? "ABSENT", []);
}

/* ========================================================================== */
section("6 — THE LIVE CORPUS. An arm that found nothing here would satisfy every fixture arm "
      + "above, so the governed corpus is swept and asserted well-formed.");
{
  const s = sweep();
  t("the governed set is non-trivial", s.counts.governed > 20, true);
  t("nothing in the corpus is unreadable", s.counts.unreadable, 0);
  t("the corpus DOES carry claims of this shape — a zero here would be the dead sweep",
    s.counts.claims > 0, true);
  t("...and every one of them is audited, which is the state D-408's sweep left",
    s.counts.unaudited, 0);
  t("...so the message says the list is clear rather than listing nothing",
    s.counts.audited, s.counts.claims);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`undesignedclaims: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
