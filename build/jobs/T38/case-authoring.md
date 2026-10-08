# case-authoring (T38)

**Status** · session_01Sp2boRLmm5PQPFmpQBHNT7 · depth 2 · WORKING · handled B2

## Progress (CASE-AUTHORING #22)

**Read (mechanics §17 step (3), K2304; the START's set measured 1,187 KB, over 300).** Read whole myself: `build/requirements/case-authoring.md`; layer 8's row of `build/layers.md`; `plan/current.md` rules 4, 6, 8 and T38-13; K2220, K2248, K2291, K2303; `case-disclosures` R6, R22, R29 (the services R34 uses); `words.json`'s `photo.*` entries; the code R34 runs (`index.mjs` `#publishCase`'s R55 block 630–680 and `publishPreflight`, `#ratifyPreflight`, `#preflightSteps` 1455–1640); `test/m/case-authoring/photos.test.mjs` and `preflight.test.mjs`'s R29 row test. A worker read every other file of the module's code and tests in full and wrote a summary (about 9 KB, each statement citing file and line: `index.mjs`'s step order and helpers, `checks.mjs`, `document.mjs`, `schema.mjs`, `searched.mjs`, `fixture.mjs`'s photo stand-in, each test file's ids). Nothing it left out mattered: it confirms `PHOTO_UNCHECKED` reaches `first` (op=publish answers `materialsJudged`'s first refusal) and `blockers` (the pre-flight pushes all of R6's refusals) with no logic change here.

**Done so far.** `index.mjs`: the two comments that said an unchecked photo blocks nothing now state the gate (R34; DEC-183 (1)). `photos.test.mjs`: R14's test now carries a "nothing to obscure" photo by its copy (N779) instead of an unchecked one travelling whole; R34's steps test has every photo checked and ready; a new R34 test: an unchecked photo is `PHOTO_UNCHECKED`, `first` exactly, naming each such photo (a supporting member's included, K2291's reading), its translation `photo.refused.unchecked` read by key, among `blockers` when the bar refuses earlier, and "nothing to obscure" clears it.

**Next.** Waiting on case-disclosures' merge (T38-12, its R6/R22/R29). Then: merge `tranche/T38`, run the tests, fix to its exact refusal shape and step words, add `PHOTO_UNCHECKED`'s row (and `PHOTO_NOT_COVERABLE`'s new translation, `photo.refused.format`) to `invariants.test.mjs` R29 and `preflight.test.mjs` R29's row lists; then steps 5–7.

## J1 · REPORT

Prepared R34 (T38-13) on my reading; no logic change is needed here: op=publish answers case-disclosures materialsJudged's first refusal and the pre-flight pushes all its refusals into blockers, so PHOTO_UNCHECKED reaches first/blockers once case-disclosures R6 raises it. Comments re-worded; photos.test.mjs drafted (unchecked is first; nothing-to-obscure clears it), red until case-disclosures merges. Waiting on your CHANGE that case-disclosures is merged; then I finish tests (also the C-120 row lists in invariants and preflight tests, which pin case-disclosures' table) and checks.

## J2 · REPORT

B2 done: merged tranche/T38 (case-carriage). Module tests against the real case-carriage: 164 tests, 162 pass, 2 fail — exactly my two drafted photo tests (R14 nothing-to-obscure carried by its copy; R34 PHOTO_UNCHECKED first), which wait on case-disclosures R6/R29 (T38-12), not on case-carriage. Nothing else moved. Still waiting on your CHANGE that case-disclosures is merged, then COMPLETE.

## Completion

**Entries applied.** T38-13 (N788 (1); DEC-183 (1); K2220, K2303): R34, signing refused while any photo the case relies on is unchecked. No logic change was needed: `#publishCase` answers `case-disclosures.materialsJudged`'s first refusal (`index.mjs` R55 block) and `publishPreflight` pushes every one of its refusals into `found`, so R6's `PHOTO_UNCHECKED` (C-120.19) is `first` exactly when op=publish refuses with it and among `blockers` otherwise, beside `PHOTO_NOT_COVERABLE` and `PHOTO_MARKS_UNDETERMINED`. The comments at `publishPreflight` and the Photos step that said an unchecked photo blocks nothing now state the gate.

**Tests.** `photos.test.mjs`: R14 (a "nothing to obscure" photo carried by its copy, label null, N779); R34 steps (every photo checked: ready); new R34 (T38; DEC-183 (1)): an unchecked photo is `PHOTO_UNCHECKED`, naming each with the members reaching it (a supporting member's included, K2291's reading), op=publish's refusal and the pre-flight's `first` exactly, step words `photo.refused.unchecked` read by key from `words.json`; among `blockers` when the bar refuses earlier; "nothing to obscure" clears it; nothing written. `invariants.test.mjs` R29 and `preflight.test.mjs` R29: C-120.19 added; `PHOTO_NOT_COVERABLE`'s and `PHOTO_UNCHECKED`'s translations read by key (`photo.refused.format`, `photo.refused.unchecked`).

**Deferred.** None. **Other modules.** None found.

**Runs** (on `job/T38/case-authoring` with `tranche/T38` merged after B3, case-disclosures in): `node --test bio-plane/test/m/case-authoring/` — tests 164, pass 164, fail 0. No layer tests (`manifest.md`). No provided service changed.
- `format`: 137 modules, 136 requirements files; 0 failures
- `architecture case-authoring`: 28 product files, 152 relative imports; 0 failures
- `coverage case-authoring`: 46 of 46 live requirement ids named by a test; 0 failures
- `ownership case-authoring tranche/T38`: 0 failures

**P6.** 3,465 lines (`src/case-authoring/`), under about 4,000.

Size (session_01Sp2boRLmm5PQPFmpQBHNT7): test runs 5, module lines 3465
