# conformance (T28)

**Status** · session_01D7FUNzKZyDySkUXiYWbkNJ · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied** (`build/plan/current.md` T28 L9, K1321; B1): the fixture's `caseDoc` (`bio-plane/test/m/conformance/fixture.mjs`) now writes `bio-case-document/6`, with its `method:` block (`grading: "grading/1"`, `checks: "1.0.0"`) and its `materials:` and `material_attestations:` blocks (case-grammar R11, R12), so `publication.commitCaseEdition` no longer refuses it `CASE_FORMAT_SUPERSEDED` (publication R58, C-122.2). No test reads an older edition, so no `signLegacy`-style rows were needed. `determine.test.mjs`'s unsigned preparation (R1 R2 R14) is `/6` too, so it stays a negative control for "unsigned is not published", not for format. Commit `a2299fe575`. Only tests touched; no module code, no requirement.

**One deviation from B1's suggestion:** the blocks are written as the literal lines `materials: []` and `material_attestations: []` (the exact output of `materialsLines([])` and `materialAttestationLines([])`), not by importing case-grammar's builders: the architecture check refuses that import because `case-grammar` is not in conformance's `uses`. No scene here rests on a material, so the empty blocks are all the fixture needs. If a later conformance entry needs non-empty materials, either `case-grammar` joins conformance's uses or the fixture keeps writing literal rows.

**Deferred:** none. **Found in other modules:** nothing.

**Reading:** I read the requirements, the fixture and the affected tests whole. I did not re-read the module's code (1,539 lines) or the public parts of its 12 uses, because the entry changes only test fixtures and nothing about the interface.

**Tests and checks:**
- `node --test test/m/conformance/` (bio-plane): tests 54, pass 54, fail 0 (before: 52 red with `CASE_FORMAT_SUPERSEDED`). No layer tests (manifest: none yet).
- `format`: 95 modules, 94 requirements files; 0 failures
- `architecture conformance`: 9 product files, 43 relative imports; 0 failures
- `coverage conformance`: 24 of 24 live requirement ids named by a test; 0 failures
- `ownership conformance tranche/T28`: 0 failures

Size (session_01D7FUNzKZyDySkUXiYWbkNJ): test runs 4, module lines 1539
