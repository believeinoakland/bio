# case-authoring (T38)

**Status** · session_01Sp2boRLmm5PQPFmpQBHNT7 · depth 2 · WAITING ON BOB (J1) · handled B2

## Progress (CASE-AUTHORING #22)

**Read (mechanics §17 step (3), K2304; the START's set measured 1,187 KB, over 300).** Read whole myself: `build/requirements/case-authoring.md`; layer 8's row of `build/layers.md`; `plan/current.md` rules 4, 6, 8 and T38-13; K2220, K2248, K2291, K2303; `case-disclosures` R6, R22, R29 (the services R34 uses); `words.json`'s `photo.*` entries; the code R34 runs (`index.mjs` `#publishCase`'s R55 block 630–680 and `publishPreflight`, `#ratifyPreflight`, `#preflightSteps` 1455–1640); `test/m/case-authoring/photos.test.mjs` and `preflight.test.mjs`'s R29 row test. A worker read every other file of the module's code and tests in full and wrote a summary (about 9 KB, each statement citing file and line: `index.mjs`'s step order and helpers, `checks.mjs`, `document.mjs`, `schema.mjs`, `searched.mjs`, `fixture.mjs`'s photo stand-in, each test file's ids). Nothing it left out mattered: it confirms `PHOTO_UNCHECKED` reaches `first` (op=publish answers `materialsJudged`'s first refusal) and `blockers` (the pre-flight pushes all of R6's refusals) with no logic change here.

**Done so far.** `index.mjs`: the two comments that said an unchecked photo blocks nothing now state the gate (R34; DEC-183 (1)). `photos.test.mjs`: R14's test now carries a "nothing to obscure" photo by its copy (N779) instead of an unchecked one travelling whole; R34's steps test has every photo checked and ready; a new R34 test: an unchecked photo is `PHOTO_UNCHECKED`, `first` exactly, naming each such photo (a supporting member's included, K2291's reading), its translation `photo.refused.unchecked` read by key, among `blockers` when the bar refuses earlier, and "nothing to obscure" clears it.

**Next.** Waiting on case-disclosures' merge (T38-12, its R6/R22/R29). Then: merge `tranche/T38`, run the tests, fix to its exact refusal shape and step words, add `PHOTO_UNCHECKED`'s row (and `PHOTO_NOT_COVERABLE`'s new translation, `photo.refused.format`) to `invariants.test.mjs` R29 and `preflight.test.mjs` R29's row lists; then steps 5–7.

## J1 · REPORT

Prepared R34 (T38-13) on my reading; no logic change is needed here: op=publish answers case-disclosures materialsJudged's first refusal and the pre-flight pushes all its refusals into blockers, so PHOTO_UNCHECKED reaches first/blockers once case-disclosures R6 raises it. Comments re-worded; photos.test.mjs drafted (unchecked is first; nothing-to-obscure clears it), red until case-disclosures merges. Waiting on your CHANGE that case-disclosures is merged; then I finish tests (also the C-120 row lists in invariants and preflight tests, which pin case-disclosures' table) and checks.

## J2 · REPORT

B2 done: merged tranche/T38 (case-carriage). Module tests against the real case-carriage: 164 tests, 162 pass, 2 fail — exactly my two drafted photo tests (R14 nothing-to-obscure carried by its copy; R34 PHOTO_UNCHECKED first), which wait on case-disclosures R6/R29 (T38-12), not on case-carriage. Nothing else moved. Still waiting on your CHANGE that case-disclosures is merged, then COMPLETE.
