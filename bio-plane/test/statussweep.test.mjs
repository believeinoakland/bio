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
 *  (6) THE REMOTE TRIP (M0-61; it was THE CROSS-LINE TRIP until then, and the reason it changed is
 *      the point). The predicate runs UNGATED here, so a trip in prose far above a table drags the
 *      table in. M0-58 flagged that by whether the match spanned a NEWLINE — a CORRELATE: the same
 *      sentence re-wrapped onto one line trips identically, and 2 of the corpus's 3 cross-line
 *      trips are genuine claims. So the arm RE-WRAPS the real receipt (`research/RECONCILED.md`
 *      §2.2) onto one line in memory and demands the same flag, and a genuine list introduced by a
 *      soft-wrapped sentence must land in the REAL population.
 *      NEGATIVE CONTROL: `node bio-plane/test/m061-undesigned-gap.control.mjs` — run 2026-09-18 by
 *      the M0-61 worker, 4/4 arms as declared, every file restored byte-identically by sha256:
 *      (A) `UNDESIGNED`'s gap reverted to `\s+` -> this suite 37/1 and corpuscheck.test 107/1, both
 *      on the paragraph-break arm; (B) the classifier reverted to `/\n/.test(mm[0])` -> this suite
 *      36/2, "re-wrapped onto ONE line: …RECONCILED.md §2.2 … all 10 of its items" wanting
 *      [true,10,10] and getting [false,10,0], and the soft-wrapped list mislabelled [1,1,1];
 *      (C) THE LIAR, the gap narrowed to a literal space -> the receipt VANISHES ([false,0,0], the
 *      cheapest green) and this suite fails on it, while corpuscheck.test fails 105/3 on the
 *      corpus's own genuine soft-wrapped claims; (D) nothing armed -> 108/0 and 38/0.
 *  (7) ON DISK — `tools/statussweep.mjs` is the subject and `tools/corpuscheck.mjs` is the
 *      instrument it imports. The arm asserts the three predicates are IMPORTED and not copied:
 *      a `UNDESIGNED` re-declared in the sweep would be this row's own subject — a second source
 *      of truth — arriving inside the instrument built to find it.
 *  (8) ON DISK — the sweep must NOT be wired into `plancheck` as a gate. A checker that FAILED
 *      here would force the per-case authority judgement onto whoever was next to push, which is
 *      precisely what the row forbids.
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
const { sweep, spans, citedByTheMap, diskRead, introducingBlock } = await import(join(REPO_ROOT, "tools/statussweep.mjs"));
const { governed, UNDESIGNED, firstTable } = await import(join(REPO_ROOT, "tools/corpuscheck.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const SECTIONS = 6;
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

/* ------------------------------------------------------------------ (6) the REMOTE TRIP */
section("THE REMOTE TRIP — a claim not ABOUT the table is flagged, wherever the editor wrapped it (M0-61)");
{
  /* M0-58 flagged this population by whether the match SPANNED A NEWLINE. That is a correlate:
     the same sentence wrapped two words earlier trips on one line. The arm that proves the
     classifier keys on the CAUSE re-wraps the receipt onto ONE line and demands the same flag. */
  const REC = "docs/development/research/RECONCILED.md";
  const recText = diskRead(REC);
  const WRAPPED = "designed wrongly once and not\ndesigned once.";
  t("the receipt is still in the corpus as M0-58 measured it (else this arm drives nothing)",
    typeof recText === "string" && recText.includes(WRAPPED), true);
  const oneLine = recText.replace(WRAPPED, "designed wrongly once and not designed once.");
  t("and the re-wrap TOOK (the arm-that-did-not-arm guard)", oneLine !== recText && !oneLine.includes(WRAPPED), true);
  const expect = (text) => {
    const sect = spans(text).find((s) => /^2\.2 · CORRECTNESS/.test(s.heading));
    return sect ? firstTable(sect.own).rows.filter((r) => /^\d+$/.test(r.cells[0])).length : -1;
  };
  const n = expect(recText);
  t(`${REC} §2.2 still carries its table of items (floor)`, n >= 1, true);
  for (const [label, text] of [["as wrapped in the corpus", recText], ["re-wrapped onto ONE line", oneLine]]) {
    const r = sweep({ set: [REC], read: (p) => (p === REC ? text : null) });
    const under = r.claims.filter((c) => /^2\.2 · CORRECTNESS/.test(c.heading));
    t(`${label}: ${REC} §2.2 is a REMOTE trip and all ${n} of its items are counted apart`,
      [r.remoteTrips.some((x) => x.path === REC && /^2\.2/.test(x.heading)), under.length, under.filter((c) => c.remoteTrip).length],
      [true, n, n]);
  }

  /* OVER-STRICTNESS: a GENUINE list whose introducing sentence happens to wrap mid-phrase is the
     REAL population. The cross-line flag called exactly this "probable false". */
  const soft = `${FRONT("Fixture S", "A list introduced by a soft-wrapped sentence.")}
## 3. Open work

Some context that says nothing about design.

The pieces still to be
designed, named here:

| # | piece |
| --- | --- |
| 1 | **the ledger reconciliation object** — owed |
`;
  const s = sweep({ set: ["docs/fixture-s.md"], read: (p) => (p === "docs/fixture-s.md" ? soft : null) });
  t("a genuine soft-wrapped introduction: its item is in the REAL population, not flagged",
    [s.claims.length, s.claims.filter((c) => c.remoteTrip).length, s.remoteTrips.length], [1, 0, 0]);
  t("the shared predicate is NOT loosened to get there — a paragraph break is never spanned",
    UNDESIGNED.test("not\n\ndesigned"), false);
  t("introducingBlock skips a horizontal rule and returns the paragraph above the table",
    introducingBlock("## H\n\nfar away: undesigned\n\n---\n\nThe canonical list.\n"), "The canonical list.");
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

t("every section reached an assertion (the FOOT sentinel)", reached, SECTIONS);
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
