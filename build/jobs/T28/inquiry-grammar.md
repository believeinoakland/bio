# inquiry-grammar (T28)

**Status** · session_01PnLhSoHMj7KMjQmdKaYkP6 · depth 2 · COMPLETE · handled B2

## Completion (INQUIRY-GRAMMAR #5, T28 L6)

**Entries applied** (`plan/current.md` L6; N522, K1273, K1304):
- **R11** `IMPORTED_FINDING_RE`, `importedFindingRef` (null when the parts would not spell a ref), `parseImportedFindingRef`, and `importedLegFindings(label, leg, findings, checkId = "C-21.3")` (K1304), in `grammar.mjs`, re-exported at `index.mjs`. `checkInquiryBasis` runs the leg arm in place of the target arm for a leg on a ref (lead and theme first; role, note and grounds as before; the grade, axis, source, hunch, testimony, earned, inherited and extent arms silent, J1/B2), and refuses each `references[]` entry naming a ref, before the legs, so it holds for an inquiry with none. The code `IMPORTED_LEG_MALFORMED` is minted at one site, `importedRefusal`, inside DEC-49 region `is-imported-leg-form`.
- **R7** `INQUIRY_GRAMMAR_CHECKS.IMPORTED_LEG_MALFORMED` (C-21.3), last in the table, BOB's translation verbatim, `where` `src/inquiry-grammar/grammar.mjs importedRefusal > is-imported-leg-form`.
- **R8** C-21.3 is raised through the interface and its row held; the R8 test names it.

**Rows, each `awaiting stamp` (T28, for T29's promotion stamp; accepted red 2):**
- arrived: C-21.3 IMPORTED_LEG_MALFORMED

**Deferred:** nothing.

**Found in other modules** (also in my `REPORT`):
- `inquiry`: `test/m/inquiry/grammar.test.mjs:177` (its R38 test) pins `INQUIRY_GRAMMAR_CHECKS` to the six rows it reads and now fails with C-21.3 present. The inquiry job (next in L6) widens it, or reads its five mints and C-54.1 by name.
- `test/system/row-census.test.mjs` (R50): fails "arrived with no record: C-21.3 IMPORTED_LEG_MALFORMED" until the row is declared in its `AWAITING_STAMP` (`{kind: "arrived", check: "C-21.3", code: "IMPORTED_LEG_MALFORMED", after: "1.57.0", record: "build/jobs/T28/inquiry-grammar.md", by: "INQUIRY-GRAMMAR #5"}`) or stamped in T29; accepted red 2. That file is not mine.
- `basis-versions` R3 can consult `importedLegFindings(label, leg, findings, "C-25.14")`; the code travels, the C-number is the caller's.
- No generated artifact reads this module's files (`build/manifest.md`'s table), so none went stale.

**Tests and checks run:**
- `node --test test/m/inquiry-grammar/` (bio-plane): tests 32, pass 32, fail 0 (8 new in `imported.test.mjs`).
- Users' tests (record-core, skills, instance-setup, project-stage, inquiry, affordances, ratification, basis-versions, consequences, control-plane, `d526-refusal-order`, `system/row-census`): tests 1067, pass 1064, fail 2 (the two above; `row-census` counts as one file failure and one test); every other passes.
- `checks/format.mjs`: 95 modules, 94 requirements files; 0 failures.
- `checks/architecture.mjs … inquiry-grammar`: 8 product files, 20 relative imports; 0 failures.
- `checks/coverage.mjs … inquiry-grammar`: 11 of 11 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … inquiry-grammar tranche/T28`: 7 files changed between tranche/T28 and HEAD; 0 failures.

Size (session_01PnLhSoHMj7KMjQmdKaYkP6): test runs 9, module lines 1561

## J1 · QUESTION

Two readings of R11, building on them now; answer only if either is wrong.

1. **The other grade and part arms on a leg on a ref.** R11 names the arms that run unchanged (lead and theme first, role, grounds). Reading: for such a leg the grade-vocabulary, axis/source, hunch, testimony, earned, inherited and extent arms (C-2.8, C-21.2) stay silent, since every field they judge is already one C-21.3 departure (one complaint per broken field, the grammar's own discipline). The note-is-a-string check still runs. "Carries no X" reads `undefined`, `null` and `''` as absent; "extent" is any authored extent field (`content.legHasAuthoredExtent`); `target_edition` must be an integer > 0.
2. **basis-versions R3 needs R11's form check at its door.** It "passes C-25.14 when inquiry-grammar R11 judges its form", but R11's Provides names only the three spelling names. Reading: I also export the leg arm as `importedLegFindings(label, leg, findings, checkId = "C-21.3")` → true when the leg's target is a ref (pushing one finding per departure), false otherwise, so basis-versions consults it as it consults `leadLegFindings`. Proposed wording for Provides: "`importedLegFindings(label, leg, findings)`: R11's leg arm, answering whether the leg's target is a ref." The `references[]` refusal stays inside `checkInquiryBasis` (it is about the document, not a leg).
Also: `importedFindingRef(import, finding)` answers null when the two parts would not spell a ref `IMPORTED_FINDING_RE` matches (so it never spells one the grammar refuses).

## J2 · REPORT

Two other modules' tests go red when my row lands (both expected):
1. `inquiry`: `bio-plane/test/m/inquiry/grammar.test.mjs:177` (its R38 test) pins `INQUIRY_GRAMMAR_CHECKS` to six rows. It now fails because C-21.3 IMPORTED_LEG_MALFORMED is a seventh. The inquiry job widens the pin, or reads its five mints and C-54.1 by name.
2. `bio-plane/test/system/row-census.test.mjs` (R50): "arrived with no record: C-21.3 IMPORTED_LEG_MALFORMED". This is accepted red 2 until the row is declared in `AWAITING_STAMP` (`{kind: "arrived", check: "C-21.3", code: "IMPORTED_LEG_MALFORMED", after: "1.57.0", record: "build/jobs/T28/inquiry-grammar.md", by: "INQUIRY-GRAMMAR #5"}`) or stamped in T29. My record names the row `awaiting stamp`.
