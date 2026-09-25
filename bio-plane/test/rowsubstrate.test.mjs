/* rowsubstrate — D-404's instrument, and MOST OF THIS SUITE IS REGRESSION ARMS FOR AN ARM THAT
 * WAS WITHDRAWN, which is the point rather than an apology.
 *
 * Bob, 2026-09-17: *"BOB must be responsible for the design being complete and the underlying
 * substrate built before those elements that rely on substrate being built."* `rowdesign.mjs`
 * asks whether a row NAMES a design; this asks whether the named design COVERS the construct.
 *
 * ---------------------------------------------------------- WHAT THIS SUITE IS REALLY FOR
 *
 * The file shipped with TWO signals. The second — *the row cites a section the document does not
 * have* — was advertised as the strong, objective one. **It fired four times, was wrong four
 * times, by four different mechanisms, and never produced a single true positive.** It was
 * withdrawn the hour it was written. Sections 1–4 below are its four mechanisms, kept as arms so
 * that anyone re-introducing the idea meets them immediately instead of rediscovering them one
 * patch at a time:
 *
 *   1. CROSS PRODUCT — every anchor demanded of every document.
 *   2. NAMED ANCHORS — `§"The mechanism…"` is a real citation carrying no number.
 *   3. NUMBERING DEPTH — a document numbering to `## 5.` cannot answer `§5.2`.
 *   4. PROSE SUBJECTS — `the study §5.2` names its document in words, not as a filename.
 *
 * **AND THE DOCTRINE IT PRODUCED, which this estate did not have: A NEGATIVE CONTROL TESTS
 * SENSITIVITY — that an arm CAN fail when its subject breaks. NOTHING TESTED PRECISION — that it
 * does NOT fire when the subject is fine.** The withdrawn arm would have sailed through a
 * negative control: plant a row citing a missing section and it fires correctly. Its POSITIVE
 * findings on a HEALTHY corpus were worthless, and no instrument here was obliged to measure
 * that. So section 6 asserts the arm's precision directly, against rows known to be fine.
 *
 * MEASURED PRECISION, CORRECTED DOWNWARD 2026-09-17 AFTER A SECOND VERIFICATION — and recorded
 * that way because **a precision figure that only ever improves in the telling is worthless.**
 * On its first run over the live queue it produced 4 findings. THREE have now been checked at
 * the artifact and **ONLY ONE IS GENUINE**:
 *   - REC-116 (the shape this arm was built for): GENUINE — no governed design covers the
 *     construct at all, and it survived 39 days.
 *   - REC-115: FALSE — §4.4 is *"The answer names its level and the content-axis state"*,
 *     topically exactly the right authority, and simply does not write the op's name.
 *   - REC-117: FALSE — `NO_FALSIFIER` appears in three code files and zero design documents,
 *     but the RULE is designed under another name: `BIO_Case_Making_v0_1.md` says *"the
 *     falsifier is REQUIRED"* and `falsifier` occurs 7 times there. The row was runnable and
 *     this note would have held it.
 *
 * **THE TWO FALSE ONES SHARE A MECHANISM, WHICH MAKES IT A BIAS RATHER THAN NOISE: the design
 * names the RULE in prose and not the IDENTIFIER in code.** That is the limitation this file's
 * own header predicted, occurring in two cases out of three. It is why the arm is a NOTE and
 * never a WARN, and it is why **a 2e note that disagrees with a row someone has checked at the
 * artifact is the thing that is wrong.** Closing the bias would mean matching a rule's PHRASE
 * rather than its symbol, which is not machine-derivable from the row; named as the frontier
 * rather than attempted.
 *
 * NEGATIVE CONTROL: (all five RUN 2026-09-17 by BOB #13, exit 0, 28 pass / 0 fail, both baselines
 * green) `node bio-plane/test/rowsubstrate.control.mjs` from the repo root — FIVE live arms and
 * ONE WITHDRAWN, each armed ALONE against a pristine copy in `.d404-harness/`,
 * every restore verified by sha256 AND `cmp` AND a floored byte count.
 *   (A1) `symbolsOf` widened back to any backticked identifier -> S5 fails: `ListAgents`, a tool a
 *        row was VERIFIED WITH, returns as a construct the row builds.
 *   (A2) the anchor→document binding reverted to a cross product -> S1 fails.
 *   (A3) WITHDRAWN BEFORE SHIPPING — it would have armed mechanism 2, and NO PATCH CAN MAKE IT
 *        FAIL: once anchors bind by adjacency the quoted alternative is inert, because a named
 *        anchor carries no digits either way. Mechanism 2 is SUBSUMED by mechanism 1's fix.
 *        Section 2 is kept as regression documentation and is NOT controlled; saying so beats
 *        letting a passing arm imply that it is.
 *   (A4) `sectionText` made to return "" instead of null when an anchor is absent -> S3 fails:
 *        absent and empty stop being distinguishable.
 *   (A5) the `covered` test inverted -> S6 fails, which is the PRECISION arm: a healthy row is
 *        reported as a finding.
 *   (A6) rows with no symbols scored as covered rather than UNJUDGED -> S7 fails: an unaskable
 *        question scored clean is the unearned-absence class.
 *   (A7) D-541: the token capture restored to digits and dots only -> S8 fails at "`§6A` reads as
 *        §6A": the review copy's §6A reads as §6 again. RUN 2026-09-24 by WORKER D-541: driver exit 0,
 *        33 pass / 0 fail, both baselines 37 pass / 0 fail, every restore sha256 f85c884f… and `cmp`.
 */

import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";
import "./sandbox.mjs";
import { symbolsOf, anchorPairs, sectionText, substrateAudit, NOISE, SYMBOL_RE }
  from "../../tools/rowsubstrate.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 8;
let reached = 0;
const section = (n) => { reached++; console.log(`\n--- ${n} ---`); };

/* A minimal governed set and queue, injected, so no arm reads or writes the estate. */
const GOV = new Set(["docs/architecture/FAKE_Design.md", "docs/development/FAKE_Other.md"]);

/* ========================================================================== */
section("1 — MECHANISM 1: THE CROSS PRODUCT. Every `§N` in a row demanded of every document in "
      + "it — the bug that reported `CORPUS-STANDARD.md §6` as missing from `SCHEDULER.md`.");
{
  const text = "`docs/development/FAKE_Other.md` §2 and `docs/architecture/FAKE_Design.md` §7";
  const p = anchorPairs(text);
  t("each anchor binds to the document it FOLLOWS", p.get("FAKE_Other.md"), ["2"]);
  t("...and not to the other one", p.get("FAKE_Design.md"), ["7"]);
  t("...so no document inherits a number it was never given",
    (p.get("FAKE_Other.md") || []).includes("7"), false);
}

/* ========================================================================== */
section("2 — MECHANISM 2: NAMED ANCHORS. `§\"The mechanism, and how the next consumer joins\"` is "
      + "a real citation that carries no number, and must not let a neighbour's number bind.");
{
  const text = '`docs/development/FAKE_Other.md` §"The mechanism, and how it joins" and '
             + '`docs/architecture/FAKE_Design.md` §6';
  const p = anchorPairs(text);
  t("a NAMED anchor yields no numeric claim", p.get("FAKE_Other.md"), []);
  t("...while the numbered one still binds correctly", p.get("FAKE_Design.md"), ["6"]);
}

/* ========================================================================== */
section("3 — MECHANISM 3: ABSENT IS NOT EMPTY. `sectionText` returns null when the anchor is not "
      + "there, and null must never be read as a section that exists and says nothing.");
{
  const doc = "# Doc\n\n## 5. Anatomy\n\ntext about FIVE\n\n## 6. Next\n\ntext about SIX\n";
  t("an existing section is returned with its body", /FIVE/.test(sectionText(doc, "5")), true);
  t("...bounded at the next heading of the same depth", /SIX/.test(sectionText(doc, "5")), false);
  t("an ABSENT anchor returns null, distinctly from an empty string",
    sectionText(doc, "5.2"), null);
  t("...and null is not falsy-equal to an empty section",
    sectionText(doc, "5.2") === "", false);
}

/* ========================================================================== */
section("4 — MECHANISM 4: PROSE SUBJECTS. `the study §5.2` names its document in words, so the "
      + "anchor bound to whichever filename appeared last.");
{
  const text = "`docs/architecture/FAKE_Design.md` Part II §14 … and the study §5.2";
  const p = anchorPairs(text);
  /* The trailing prose anchor still attaches to the last-named file — this is the mechanism,
     asserted so the limit is KNOWN rather than believed fixed. It is why the anchor arm was
     withdrawn instead of patched a fifth time. */
  t("a prose-subject anchor still attaches to the last named document — the LIMIT, asserted",
    p.get("FAKE_Design.md"), ["14", "5.2"]);
}

/* ========================================================================== */
section("5 — THE SYMBOL SET IS NARROW ON PURPOSE, and the narrowing cost real recall.");
{
  t("an op name is a symbol", symbolsOf("builds `op=meaningrows` today"), ["op=meaningrows"]);
  t("a SCREAMING_SNAKE marker is a symbol", symbolsOf("the `NO_FALSIFIER` marker"), ["NO_FALSIFIER"]);
  t("a tool a row was VERIFIED WITH is NOT a symbol — DIST-5's false question",
    symbolsOf("verified by BOB #12 at `ListAgents` on 2026-09-17"), []);
  t("...nor is a camelCase function name; this is the KNOWN recall cost (FW-20's `readText`)",
    symbolsOf("the `readText` path"), []);
  t("...nor a bare prose word in backticks", symbolsOf("the pack's `absent` recipe layer"), []);
  t("the noise list is declared once and non-empty", NOISE.size > 5, true);
  t("the symbol pattern is declared once", SYMBOL_RE instanceof RegExp, true);
}

/* ========================================================================== */
section("6 — THE PRECISION ARM, WHICH IS THE ONE THE WITHDRAWN SIGNAL WOULD HAVE FAILED. A "
      + "healthy row — cited section DOES mention the row's symbol — must NOT be reported.");
{
  const queue = [
    "## BOB INBOX",
    "",
    "### GOOD-1 · queued — builds `op=conclude`",
    "milestone: M0",
    "design: `docs/architecture/FAKE_Design.md` §3",
    "scope: teach `op=conclude` the new envelope",
    "",
    "### BAD-1 · queued — builds `op=audit`",
    "milestone: M0",
    "design: `docs/architecture/FAKE_Design.md` §3",
    "scope: teach `op=audit` the new envelope",
    "",
  ].join("\n");
  /* Both rows cite the SAME section. It mentions one op and not the other, so exactly one is a
     finding — a run that named both, or neither, would be useless in opposite ways. */
  const DOC = "# Fake\n\n### 3. The envelope\n\nthis section teaches `op=conclude` its shape\n\n### 4. Next\n";
  const a = substrateAudit({ queue, governedSet: GOV, repo: process.cwd(), docReader: () => DOC });
  const ids = a.findings.map((f) => f.id);
  t("the covered row is NOT reported", ids.includes("GOOD-1"), false);
  t("the uncovered row IS reported", ids.includes("BAD-1"), true);
  t("...and exactly one of the two, so the arm DISCRIMINATES", a.findings.length, 1);
  t("both rows were actually judged, so the quiet is a verdict and not an empty walk",
    a.counts.judged, 2);
}

/* ========================================================================== */
section("7 — AN UNASKABLE QUESTION IS UNJUDGED, NEVER A PASS. Scoring it clean is the "
      + "unearned-absence class this whole family belongs to.");
{
  const queue = [
    "## BOB INBOX",
    "",
    "### NOSYM-1 · queued — improves the wording of a thing",
    "milestone: M0",
    "design: `docs/architecture/FAKE_Design.md` §3",
    "scope: rewrite the paragraph",
    "",
    "### NODESIGN-1 · queued — builds `op=conclude`",
    "milestone: M0",
    "scope: teach `op=conclude` something, citing no governed design",
    "",
    "### CLOSED-1 · done — builds `op=audit`",
    "milestone: M0",
    "design: `docs/architecture/FAKE_Design.md` §3",
    "scope: history is not re-briefed",
    "",
  ].join("\n");
  const a = substrateAudit({ queue, governedSet: GOV, repo: process.cwd(),
                             docReader: () => "# Fake\n\n### 3. The envelope\n\ntext\n" });
  const why = Object.fromEntries(a.unjudged.map((u) => [u.id, u.why]));
  t("a row with no machine-readable symbol is UNJUDGED", why["NOSYM-1"],
    "no machine-readable symbol in scope");
  t("a row citing no governed design is UNJUDGED", why["NODESIGN-1"], "no governed design cited");
  t("neither is counted as a finding", a.findings.length, 0);
  t("...and neither is counted as judged", a.counts.judged, 0);
  t("a CLOSED row is not judged at all — history is not re-briefed",
    a.unjudged.some((u) => u.id === "CLOSED-1"), false);
  t("the unjudged count is REPORTED, so the silence is a shape and not an omission",
    a.counts.unjudged, 2);
}

/* ========================================================================== */
section("8 — A LETTERED SECTION IS A SECTION (D-541). The capture read digits and dots only, so "
      + "`§6A` read as `§6` and three rows were noted against a section none of them cites.");
{
  const text = "`docs/architecture/FAKE_Design.md` §6A with a ruling, and `docs/development/FAKE_Other.md` §6A.4";
  const p = anchorPairs(text);
  t("`§6A` reads as §6A, never as the §6 before it", p.get("FAKE_Design.md"), ["6A"]);
  t("`§6A.4` reads whole — letter, dot and sub-number", p.get("FAKE_Other.md"), ["6A.4"]);
  t("a letter binds only at a word's end: `§6and` still reads §6 (over-strictness arm)",
    anchorPairs("`FAKE_Design.md` §6and more").get("FAKE_Design.md"), ["6"]);
  const doc = "# Doc\n\n## 6. Audiences\n\ntext about SIX\n\n## 6A. The review copy\n\n"
            + "text about `op=reviewcopy`\n\n### 6A.4 Completeness\n\nREUSED\n\n## 7. Next\n\nSEVEN\n";
  t("`sectionText` finds the §6A heading, not §6's", /op=reviewcopy/.test(sectionText(doc, "6A") || ""), true);
  t("...and §6 no longer swallows §6A's text", /op=reviewcopy/.test(sectionText(doc, "6") || ""), false);
  t("...and §6A is bounded at §7", /SEVEN/.test(sectionText(doc, "6A") || ""), false);
  t("a lower-case citation `§6a` finds the `## 6A.` heading (over-strictness arm)",
    /op=reviewcopy/.test(sectionText(doc, "6a") || ""), true);
  t("an absent lettered anchor is still null, not §6", sectionText(doc, "6B"), null);
  /* THROUGH THE AUDIT — the measured failure: a row citing §6A whose §6A DOES name its symbol was
     reported "substrate not evident", because §6 (which does not) was what got read. */
  const queue = ["## BOB INBOX", "", "### LETTER-1 · queued — `op=reviewcopy`'s list", "milestone: M0",
                 "design: `docs/architecture/FAKE_Design.md` §6A", "scope: teach `op=reviewcopy` a count", ""].join("\n");
  const a = substrateAudit({ queue, governedSet: GOV, repo: process.cwd(), docReader: () => doc });
  t("a row citing §6A, whose §6A names its symbol, is NOT noted", a.findings.map((f) => f.id), []);
  t("...and it was judged, against the anchor §6A", a.judged.map((j) => j.anchors), [["6A"]]);
}

console.log(`\nsections reached ${reached}/${SECTIONS}`);
if (reached !== SECTIONS) { console.log("  FAIL  a section did not run — the tally above is not the whole suite"); fail++; }
console.log(`rowsubstrate: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
