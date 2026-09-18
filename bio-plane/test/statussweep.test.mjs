/* THE SWEEP FOR A SECOND STATEMENT OF DESIGN STATUS — `tools/statussweep.mjs`, driven. (M0-58)
 *
 * Bob, 2026-09-17: *"other areas to confirm that there aren't multiple sources of truth
 * elsewhere in the record."* M0-57 built the arm that REFUSES one shape of that; this row runs
 * it across the governed set and REPORTS, because which of two copies is the authority is a
 * judgement per case and a sweep that silently picked one would be the second-authority defect
 * arriving dressed as a remedy.
 *
 * THIS SUITE EXISTS BECAUSE OF THE LIAR, AND THE LIAR IS NAMED BEFORE ANYTHING ELSE. The cheapest
 * green available to this item is a sweep that reports zero findings and is never driven against a
 * planted duplicate: it passes, it costs nothing, and it certifies the corpus clean on no evidence
 * at all. A sweep that reports nothing is INDISTINGUISHABLE from a sweep that SEES nothing. So the
 * load-bearing arms here are (2) and (3) below — a known duplicate must be FOUND and named with
 * BOTH sites, and the sweep must be PROVEN to have read the document it was planted in.
 *
 * NEGATIVE CONTROL: every arm runs in-process against an INJECTED corpus, so no arm touches a
 * governed document, and the instrument-modifying arms are the two marked ON DISK.
 *  (1) BASELINE, nothing armed -> the live sweep reports 0 candidates over a NON-EMPTY population
 *      (floored: >= 40 governed documents read, >= 1 table item examined). Without the floor this
 *      arm passes over an empty corpus, which this estate has measured three times.
 *  (2) THE PLANTED DUPLICATE -> a synthetic pair in which document A lists "the ledger
 *      reconciliation object" among the pieces still to be designed while document B carries a
 *      HEADING for that same piece is found, reported as exactly ONE candidate, and names BOTH
 *      sites. This is the arm the item's whole hazard rests on.
 *  (3) THE ARM-THAT-DID-NOT-ARM GUARD, and it is explicit here rather than implied: the injected
 *      reader RECORDS every path it was asked for, and the arm asserts document B's path is in
 *      that list. A run that SKIPPED the planted document reports a clean result byte-identical to
 *      success, so "the sweep found it" is only evidence once "the sweep read it" is also
 *      measured. Arm (5) is its twin from the other side — plant the claim, withhold the cover.
 *  (4) OVER-STRICTNESS, and it is the one that keeps this report from being switched off: the SAME
 *      planted pair, with document A's cell POINTING at its design (naming a `.md`), must report
 *      ZERO candidates. A pair that legitimately restates a status with an explicit pointer to the
 *      authority is not a second source of truth, and a report that cried about it would be noise.
 *  (5) THE PAIR THAT ESTABLISHES CAUSE: the planted claim with document B's covering heading
 *      REMOVED -> 0 candidates. Run beside arm (2) this is what shows the CANDIDATE came from the
 *      duplication rather than from anything else in the fixture — one arm asserting a find is not
 *      evidence that the find is the thing it is named after.
 *  (6) THE CROSS-LINE TRIP, armed from the real corpus rather than asserted: `UNDESIGNED` is built
 *      from `\s`, which matches a NEWLINE, so a sentence broken across two lines fires it. The
 *      sweep must FLAG such a trip rather than counting its table into the population silently.
 *  (7) ON DISK — `tools/statussweep.mjs` is the subject and `tools/corpuscheck.mjs` is the
 *      instrument it imports. The arm asserts the three predicates are IMPORTED and not copied:
 *      a `UNDESIGNED` re-declared in the sweep would be this row's own subject — a second source
 *      of truth — arriving inside the instrument built to find it.
 *  (8) ON DISK — the sweep must NOT be wired into `plancheck` as a gate. A checker that FAILED
 *      here would force the per-case authority judgement onto whoever was next to push, which is
 *      precisely what the row forbids.
 *  (9) LIVE — M0-62: `BIO_Content_Framework_v0_10.md` §18 item 5 POINTS at `BIO_System_Design.md`
 *      §3 construct 10 rather than restating the lead's design status, and KEEPS its ruling. The
 *      liar is named first: the cheapest green is to DELETE item 5, so the arm asserts the item
 *      is still there under its key, still one of six, and still carries D-194, D-184 and the
 *      2026-09-14 ruling. TO RE-ARM IN ONE STEP: in a `cp`-aside copy of the framework, replace
 *      item 5's cell with its pre-M0-62 text (`… valid — designed in Program B | the architect,
 *      under the ruling |`) -> the verdict reads `no-covering-heading-elsewhere` and the
 *      authority-pointer arm FAILS, while every other §18 item's verdict is unchanged. Verified
 *      2026-09-18: 38 pass / 3 fail (verdict, authority pointer, restatement). And THE LIAR,
 *      driven: item 5's row DELETED -> 36 pass / 5 fail, both GUARDs among them. Restored by `cp`
 *      from a uniquely-named aside copy, verified by sha256 AND `cmp` -> 41 pass / 0 fail.
 *
 * TO RE-ARM (2) BY HAND IN ONE STEP: in `tools/statussweep.mjs` change signal 4's
 * `h.path !== p` to `h.path === p` (so a covering heading is only ever looked for in the claiming
 * document itself) -> arms (2) and (3) go RED while every other arm stays green. Verified 2026-09-17.
 * The file is restored by `cp` from a uniquely-named pristine copy and verified by sha256 AND
 * `cmp` — NEVER `git checkout --`, which in a tree with uncommitted work is "throw mine away"
 * and exits 0 either way.
 *
 * WHAT THIS SUITE DOES NOT ASSERT, said rather than implied closed: that the corpus is free of
 * second authorities. It asserts the SWEEP behaves. The sweep's own reach is bounded — a claim in
 * prose, and a piece two documents call by different names, are both invisible to it — and those
 * bounds are measured in `docs/development/MEASUREMENTS.md` (M-48) rather than hidden behind a
 * green suite. A clean run of this suite is evidence about the matcher, never about the record.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: the suite's temp fixtures live in a sandbox the battery sweeps */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(DIR, "..", "..");
const { sweep, spans, citedByTheMap } = await import(join(REPO_ROOT, "tools/statussweep.mjs"));
const { governed, UNDESIGNED } = await import(join(REPO_ROOT, "tools/corpuscheck.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 7;
let reached = 0;
const section = (name) => { reached++; console.log(`\n--- ${name} ---`); };

/* ---------------------------------------------------------------- the synthetic corpus

   WHOLLY SYNTHETIC ON PURPOSE. It shares no construct number, document, section, item or
   content word with anything in the real corpus, so an arm that passed because the tool had
   memorised the live receipt would fail here. */
const FRONT = (title, place) => `# ${title}

**Status** · v0.1, a fixture for the statussweep suite, complete at its level for what it fixes, as of 2026-09-17.

**Place in the system** · ${place}

**Incomplete sections** · None — it is a fixture and has no frontier.

**Contents**
- [1. One](#1-one)

---
`;

const CLAIMS_IT_UNDESIGNED = `${FRONT("Fixture A", "A fixture that lists pieces still to be designed.")}
## 1. One

The pieces still to be designed, named here and designed nowhere in this document:

| # | piece | what it is | whose |
| --- | --- | --- | --- |
| 1 | **the ledger reconciliation object** | what squares two ledgers against one another | the architect |
`;

/* The same claim, but the cell NAMES where the design lives — a pointer, not a restatement. */
const POINTS_INSTEAD = CLAIMS_IT_UNDESIGNED.replace(
  "what squares two ledgers against one another",
  "what squares two ledgers against one another. DESIGNED in `docs/development/FIXTURE-B.md`");

const COVERS_IT = `${FRONT("Fixture B", "A fixture that designs the piece Fixture A lists.")}
## 1. One

Prose that does not matter.

### The ledger reconciliation object, designed

Here is the design.
`;

/* Fixture B with the covering heading taken away — arm (5). */
const COVERS_NOTHING = COVERS_IT.replace("### The ledger reconciliation object, designed",
  "### Something else entirely");

const A = "docs/development/FIXTURE-A.md";
const B = "docs/development/FIXTURE-B.md";

/* The injected reader RECORDS what it was asked for. That record is arm (3). */
function recordingReader(map) {
  const asked = [];
  const read = (p) => { asked.push(p); return p in map ? map[p] : null; };
  return { read, asked };
}

/* ------------------------------------------------------------------- (1) the BASELINE */
section("BASELINE — the live governed set, nothing armed");
{
  const live = sweep();
  /* FLOOR THE FIXTURE. A headline totality assertion that passes over an empty corpus has
     been measured three times in this estate; these two floors are what make the 0 below
     mean something. */
  t("the sweep READ a real, non-empty governed set (floored, never assumed)",
    live.read >= 40 && live.read === governed().length, true);
  t("and it examined a non-empty population of table items (floored)", live.claims.length >= 1, true);
  t("over the live corpus it reports 0 candidate pairs", live.candidates.length, 0);
  t("and it EVALUATED rather than merely not-failing — every claim carries a verdict",
    live.claims.every((c) => typeof c.verdict === "string" && c.verdict.length > 0), true);
  t("exactly one claim is visible to corpuscheck --authority, which is M0-57's published reach",
    live.claims.filter((c) => c.visibleToTheArm).length, 1);
  t("and the REST are invisible to it — the bound this row exists to measure",
    live.claims.filter((c) => !c.visibleToTheArm).length >= 1, true);
}

/* -------------------------------------------------- (2) and (3) the PLANTED DUPLICATE */
section("THE PLANTED DUPLICATE — it must be FOUND, named with BOTH sites, and PROVEN read");
{
  const { read, asked } = recordingReader({ [A]: CLAIMS_IT_UNDESIGNED, [B]: COVERS_IT });
  const r = sweep({ set: [A, B], read });

  /* (3) THE ARM-THAT-DID-NOT-ARM GUARD, asserted BEFORE anything is concluded from the
     result. A run that never read Fixture B reports a clean sweep identical to success. */
  t("GUARD: the sweep actually READ the document the duplicate was planted in", asked.includes(B), true);
  t("GUARD: and it read the claiming document too", asked.includes(A), true);
  t("GUARD: both fixtures were readable — nothing fell through as unreadable", r.unreadable, []);
  t("GUARD: the fixture is NON-EMPTY — one table item examined", r.claims.length, 1);

  t("the planted duplicate is FOUND — exactly one candidate", r.candidates.length, 1);
  /* EVERY DEREFERENCE BELOW IS GUARDED, AND THE CONTROL IS WHY. Arming signal 4 emptied
     `candidates`, and `r.candidates[0].path` then threw a TypeError that ended the MODULE —
     so the run printed no tally, the FOOT sentinel never fired, and the arm reported nothing
     at all instead of reporting six honest failures. That is this estate's measured receipt
     (`kickoffs/WORKER.md`: a TypeError goes through no assertion at all) reproduced inside the
     suite built to avoid it. A missing candidate must FAIL LOUDLY, never crash quietly. */
  const c = r.candidates[0] ?? null;
  t("SITE A is named — the document that claims the piece is still to be designed", c && c.path, A);
  t("SITE A's key is named", c && c.key, "the ledger reconciliation object");
  t("SITE B is named — the document that carries a heading for that same piece",
    c && c.covering.map((h) => h.path), [B]);
  t("and SITE B's HEADING is quoted, so a reader can adjudicate without re-deriving the pair",
    c && c.covering[0] && c.covering[0].text, "The ledger reconciliation object, designed");
  t("the candidate is marked INVISIBLE to corpuscheck --authority, because no §3 row cites it",
    c && c.visibleToTheArm, false);
}

/* ------------------------------------------------------------------ (4) OVER-STRICTNESS */
section("OVER-STRICTNESS — a legitimate POINTER must not be reported");
{
  const { read, asked } = recordingReader({ [A]: POINTS_INSTEAD, [B]: COVERS_IT });
  const r = sweep({ set: [A, B], read });
  t("GUARD: the sweep read both documents in this arm too", asked.includes(A) && asked.includes(B), true);
  t("GUARD: and it still examined the item rather than skipping the section", r.claims.length, 1);
  t("a status restated WITH an explicit pointer to its design is NOT reported", r.candidates.length, 0);
  t("and the reason is recorded rather than left as silence",
    r.claims[0] && r.claims[0].verdict, "points-at-its-design");
}

/* ------------------------------------------------- (5) THE PAIR THAT ESTABLISHES CAUSE */
section("CAUSE — withdraw the cover and the candidate must disappear");
{
  const { read } = recordingReader({ [A]: CLAIMS_IT_UNDESIGNED, [B]: COVERS_NOTHING });
  const r = sweep({ set: [A, B], read });
  t("with the covering heading removed the SAME claim yields 0 candidates", r.candidates.length, 0);
  t("and the claim is still examined, with its verdict said",
    r.claims[0] && r.claims[0].verdict, "no-covering-heading-elsewhere");
  /* Run beside arm (2): one arm finds it, the other does not, and the only difference is the
     duplication. That PAIR is the evidence; either arm alone is an assertion. */
}

/* --------------------------------------------------------------- (6) the CROSS-LINE TRIP */
section("THE CROSS-LINE TRIP — the shared predicate matches over a newline, and it is FLAGGED");
{
  t("the predicate really does match across a line break (the defect, driven not asserted)",
    UNDESIGNED.test("designed wrongly once and not\ndesigned once."), true);
  const live = sweep();
  t("the live sweep FLAGS such trips rather than counting their tables in silently",
    live.crossLineTrips.length >= 1, true);
  t("and every flagged trip carries the text it matched, so a reader can judge it",
    live.crossLineTrips.every((x) => /\n/.test(x.matched)), true);
  t("items under a cross-line trip are marked, keeping the REAL population separable",
    live.claims.some((c) => c.crossLineTrip === true) && live.claims.some((c) => c.crossLineTrip === false), true);
}

/* ------------------------------------------------- (7) and (8) the INSTRUMENT ON DISK */
section("ON DISK — the predicates are IMPORTED, and the sweep is NOT a gate");
{
  const src = readFileSync(join(REPO_ROOT, "tools/statussweep.mjs"), "utf8");
  t("UNDESIGNED is IMPORTED from corpuscheck, never re-declared here", /^\s*UNDESIGNED,/m.test(src), true);
  t("and it is NOT copied — a second copy of the predicate would be this row's own subject",
    /const\s+UNDESIGNED\s*=/.test(src), false);
  t("POINTS_AT_A_DESIGN is imported, not copied", /const\s+POINTS_AT_A_DESIGN\s*=/.test(src), false);
  const pc = readFileSync(join(REPO_ROOT, "tools/plancheck.mjs"), "utf8");
  t("the sweep is NOT wired into plancheck as a gate — it REPORTS, it does not fix",
    /statussweep/.test(pc), false);
  /* spans() is the walk the double-count defect lived in; pin it structurally. */
  const two = spans(`${FRONT("X", "y")}\n## 1. One\n\n| # | a |\n| --- | --- |\n| 1 | b |\n\n### 1.1 Child\n\ntext\n`);
  t("a span's `own` stops at its first sub-heading, so a parent cannot re-count a child's table",
    /Child/.test(two[0].own), false);
  t("while its `body` still carries the child, which signal 4's heading index needs",
    /Child/.test(two[0].body), true);
  t("citedByTheMap reads the REAL map and finds the one pair §3 states",
    citedByTheMap(readFileSync(join(REPO_ROOT, "docs/architecture/BIO_System_Design.md"), "utf8")).size >= 1, true);
}

/* ------------------------------------ (9) M0-62 — §18 item 5 POINTS at construct 10, LIVE */
section("M0-62 — §18 item 5 POINTS at the construct map, and keeps its ruling");
{
  const CF = "docs/architecture/BIO_Content_Framework_v0_10.md";
  const live = sweep();
  const s18 = live.claims.filter((c) => c.path === CF && c.sec === "18");
  const five = s18.find((c) => c.item === "5") ?? null;
  /* THE LIAR FIRST: deleting item 5 removes the duplicate AND the piece the corpus still owes. */
  t("GUARD: §18 still lists SIX pieces — nothing was deleted to silence the duplicate",
    s18.map((c) => c.item), ["1", "2", "3", "4", "5", "6"]);
  t("GUARD: item 5 is still there under its own key",
    five && five.key, "homes for the member's lead and firsthand observation");
  /* The sweep's verdict MOVED from `no-covering-heading-elsewhere` — the finding CLOSED, not
     merely absent. NOTE, said rather than implied: `points-at-its-design` is the shared
     predicate's name and it fires on any backticked `.md`. For item 5 there is no design yet;
     what the cell points at is the STATUS AUTHORITY, which the next arm pins specifically. */
  t("the sweep's verdict on item 5 is `points-at-its-design` (it read `no-covering-heading-elsewhere` before M0-62)",
    five && five.verdict, "points-at-its-design");
  const text = readFileSync(join(REPO_ROOT, CF), "utf8");
  const row = text.split("\n").find((l) => l.startsWith("| 5 | **homes for the member's lead")) ?? "";
  t("item 5 names the AUTHORITY — `BIO_System_Design.md` §3 construct 10 — not merely some `.md`",
    /`BIO_System_Design\.md` §3 construct 10 is the single authority/.test(row), true);
  t("and it no longer restates the status itself (the pre-M0-62 `— designed in Program B |` clause)",
    /designed in Program B \|/.test(row), false);
  t("the SUBSTANCE is kept: D-194 and D-184, and the 2026-09-14 ruling it carries",
    ["D-194", "D-184", "grade D on the member's trust", "off-the-record source's anonymity is valid"]
      .every((w) => row.includes(w)), true);
  /* OVER-STRICTNESS: no other §18 item moved. */
  t("every OTHER §18 item still reads `points-at-its-design`",
    s18.filter((c) => c.item !== "5").map((c) => c.verdict),
    ["points-at-its-design", "points-at-its-design", "points-at-its-design", "points-at-its-design", "points-at-its-design"]);
}

t("every section reached an assertion (the FOOT sentinel)", reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
