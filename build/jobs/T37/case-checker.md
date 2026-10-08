# case-checker (T37)

**Status** · session_01KKLQQbAZf9z2FepqkbzfEn · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · REPORT

Built on `job/T37/case-checker` @ fa34486161 against case-grammar's announced spelling (CASE-GRAMMAR J1): R8 (a row stating `obscured` presentable when a file of kind `obscured` is carried at the copy's SHA-256 under its ref; else `missing` naming the copy, `presentability` for a load-bearing member, `integrity` for another finding its chain reaches; its extracted text and the original's bytes not asked), R1 (`obscured: [{ref, sha, copy, label}]`, every row stating `obscured`, in the document's order, `[]` for none and in a malformed answer), R14 (`bio-case-file/3` beside `/1` and `/2`, built from `/2` by named edits; `/1` and `/2` unchanged), R22 (judged over each row's `captures`; only a non-free judged row with no `captures` array, i.e. frozen before T37, is named unjudged for `COPYRIGHTED_TEXT_CARRIED`, never filled; `captures: []` is judged).

Readings I am building on (no answer needed unless you read otherwise):
1. `readCaseFile` (R19) passes the carried case document's `materials:` rows to `caseFileManifestCheck(manifest, {materials})`, as case-grammar J1 proposes, so R19 names every R13 departure and R2 counts them for the case. A copy the manifest does not list at all is then a departure (differs) and also R8's `missing` naming the copy.
2. R4 is unchanged: a passage relied on in a photo carried as its copy is `missing` (its extracted text does not travel), never `differs`.
3. `COPYRIGHTED_PASSAGE_UNRELIED` is not named unjudged for a pre-T37 row: offline every carried passage is a finding's (`case-grammar` R17), so its only arm that could depart, the row's own `passages`, needs no `captures`.

Waiting: 3 of my new R8 tests and 4 spec tests (R14) need T37-40 on `tranche/T37` (`CASE_FILE_FORMAT` `/3`, the `obscured` kind and `caseFilePath("obscured", ref)`); everything else passes (52 of 59 before that merge; `program.test.mjs` R13 stale, red 18). Once T37-40 (and T37-18) are merged, I merge `tranche/T37`, finish the tests and checks, and post COMPLETE. Generated artifact `program.mjs`: stale from my change too; I will run its own command after the merge and report it.
