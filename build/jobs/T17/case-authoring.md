# case-authoring (T17)

**Status** · session_01VKG69DPmy1hBNE9XwxeNRp · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries.**
- N383, applied: `CASE_DISCLOSURE_CHECKS`' `where` for C-120.1 (`is-tension-disclosed`) and C-120.2 (`is-disclosure-standing`) now name `#tensionsJudged`, the function whose body holds both regions (`checks.mjs`:114, :122). The DEC-49 guard's 2 region failures are gone (12 failures → 10; none of the 10 is a case-authoring region).
- N384, applied: the grade compared at R35 (`f.grade === EARNED_CAPTURE_CEILING`, `index.mjs`:1062), the C-120.4 detail (:1069) and the document body's sentence (`document.mjs`:60) all read `EARNED_CAPTURE_CEILING`, one definition. Provenance does not export the constant: its one definition is legacy-checks' `bio-checks.mjs`:2582, which provenance R24 and capture R18 themselves read. So this module imports it from there too (legacy-checks is already in its Uses), and the bytes are unchanged. Two comments that said "Grade B" now name the constant.
- Also fixed in this module: the `CASE_DISCLOSURE_CHECKS` header comment said C-120.4–C-120.7 are "awaiting stamp (T17)". They were stamped in `CATALOG_VERSION` 1.47.0 (PROMOTION's T17 record), so the comment now says so.

**Tests added.** `tensions.test.mjs` R29: C-120.1–C-120.3's `where`s exactly, each naming its raising function. `preflight.test.mjs` R29: C-120.4–C-120.7's `where`s exactly. A new R35 test: the refusal names `EARNED_CAPTURE_CEILING` as the grade, and a load-bearing archive-replay capture (`ARCHIVE_CAPTURE_GRADE`, C) that is not co-attested publishes with no acknowledgement. It also checks that the body's sentence names the ceiling.

**Deferred.** None.

**Found in another module** (the DEC-49 guard, `civicos-ui/check-refusal-codes.mjs`, on this branch):
- **Floor re-pins (legacy-tests' layer).** The guard still reports floor slack: rows 864, census 1159, reach 899, governedSites 574, regions 536, regionLines 6011, codesChecked 1004, outcomeReturns 294, refusalsJudged 938. These are the floors the plan's legacy-tests entry re-pins from the guard's print at the end. Part of the regions and regionLines growth is this job's two regions now resolving inside `#tensionsJudged`. The figures will move again as other layers merge, so re-read them on the merged tree.
- **Inherited verdicts (not this module's).** `inheritedVerdicts` is 6 against a ceiling of 4. The six sites are `control-plane/index.mjs`:1680, `strength/index.mjs`:786, `run-productions/index.mjs`:513 and `basis-versions/index.mjs`:675, :801, :828.

**Generated artifacts.** None staled: no bundle's inputs include case-authoring.

**Tests and checks** (on `job/T17/case-authoring` @ 3168d3f64f, after merging `tranche/T17` @ 36cdcead6c):
- `node --test bio-plane/test/m/case-authoring/`: tests 69, pass 69, fail 0, skipped 0
- no layer tests are named in `build/manifest.md`
- `node civicos-ui/check-refusal-codes.mjs`: 10 failures, none of them a case-authoring region (the two above)
- format: 72 modules, 67 requirements files; 0 failures
- architecture: 14 product files, 73 relative imports; 0 failures
- coverage: 37 of 37 live requirement ids named by a test; 0 failures
- ownership: 6 files changed by case-authoring; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures

Size (session_01VKG69DPmy1hBNE9XwxeNRp): test runs 3, module lines 3115
