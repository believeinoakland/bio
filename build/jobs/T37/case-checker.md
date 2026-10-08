# case-checker (T37)

**Status** · session_01KKLQQbAZf9z2FepqkbzfEn · depth 2 · WORKING · handled B2

## Completion

**Reading set (mechanics §17).** I measured the set first. My requirements are 20 KB. The used services my Uses names, with each module's Purpose, are about 50 KB. My code without the generated `program.mjs` is 111 KB, and my tests are about 80 KB without the zip fixture. That is about 260 KB, under 300 KB, so I read all of it whole myself. I also read whole layer 8's row of `build/layers.md`, the plan's rules at the opening and T37-20, DEC-180, K2129, K2140, K2171 and K2206, case-grammar R11–R18 and R22, and publication R72. No worker was used.

**Entries applied (T37-20; N757, N763; DEC-180 (4); K2140, K2206).**
- **R8.** A `materials:` row stating `obscured` is presentable when a file of kind `obscured` is carried at the copy's SHA-256 under its ref. R2 checks that file's bytes. Otherwise it is a `missing` entry naming the copy: `presentability` for a load-bearing member, `integrity` for another finding whose chain reaches it. Its extracted text and the original's bytes are not asked. A copy supplied later fills the gap (R9); the original's bytes fill nothing.
- **R1.** The answer carries `obscured: [{ref, sha, copy, label}]`: every row stating `obscured`, in the document's order, `[]` for none and in a malformed answer.
- **R2, R19 (J1 reading 1, B2).** `readCaseFile` passes the carried case document's `materials:` rows to `caseFileManifestCheck(manifest, {materials})`. So the row-relative departures of case-grammar R13 are named, and count against every finding: an `obscured` file no row names, a copy no file carries, and an original carried beside its copy.
- **R14.** `bio-case-file/3` is specified beside `/1` and `/2`, built from `/2` by named edits. It covers the `obscured` kind, its path and departures, the row's `obscured_copy` and `obscured_label`, the presentability rule, the complete edition's listing, and the criteria rows' `captures`. `/1` and `/2` are unchanged. `casefilespec` answers all three, and the program's first line names all three.
- **R22.** `COPYRIGHTED_TEXT_CARRIED` and `COPYRIGHTED_PASSAGE_UNRELIED` are judged offline over each row's frozen `captures`, exactly as R21 judges them. A non-free row with no `captures` array (frozen before T37) is named in `unjudged` for `COPYRIGHTED_TEXT_CARRIED` with `CAPTURES_NOT_CARRIED_STATEMENT`, and never filled. `captures: []` is judged. `COPYRIGHTED_PASSAGE_UNRELIED` is not named unjudged (J1 reading 3).
- **K874 tests.** I added explicit tests for: a copy that is missing (`missing`); one carried alongside the original (a departure); one carried with other bytes; a copy unlisted or stray; a `/1` and a `/2` case file that still recreate with `obscured: []`; and the `/3` specification.
- **Generated artifact.** `program.mjs` was rebuilt with its own command, `node bio-plane/src/case-checker/build-program.mjs` (625,962 bytes, sha256 `f04c322de9…`, 71 inputs), after merging `tranche/T37` @ case-grammar's merge. It goes stale again if a later L8 merge changes an input; BOB regenerates it at L8's close.

**Deferred.** None.

**Size.** 1,459 module lines without `program.mjs`. That is over the requirement's estimate of about 900–1,300, and well under 4,000 (P6). Most of the growth is the three specification texts.

**Found in other modules.** None. One reading for case-grammar's owner: R4 answers a passage relied on in a photo carried as its copy as `missing`, since its text does not travel (J1 reading 2, B2).

**Tests and checks.**
- `node --test test/m/case-checker/`: 60 pass, 0 fail.
- `node --test test/m/case-import/` (it uses `checkCaseFile` and `readCaseFile`): 88 pass, 0 fail.
- No layer tests are named in `build/manifest.md`.
- `format`: 136 modules, 135 requirements files; 0 failures.
- `architecture`: 15 product files, 64 relative imports; 0 failures.
- `coverage`: 22 of 22 live requirement ids named by a test; 0 failures.
- `ownership`: 8 files changed between tranche/T37 and HEAD; 0 failures.

Size (session_01KKLQQbAZf9z2FepqkbzfEn): test runs 14, module lines 1459

## J1 · REPORT

Built on `job/T37/case-checker` @ fa34486161 against case-grammar's announced spelling (CASE-GRAMMAR J1): R8 (a row stating `obscured` presentable when a file of kind `obscured` is carried at the copy's SHA-256 under its ref; else `missing` naming the copy, `presentability` for a load-bearing member, `integrity` for another finding its chain reaches; its extracted text and the original's bytes not asked), R1 (`obscured: [{ref, sha, copy, label}]`, every row stating `obscured`, in the document's order, `[]` for none and in a malformed answer), R14 (`bio-case-file/3` beside `/1` and `/2`, built from `/2` by named edits; `/1` and `/2` unchanged), R22 (judged over each row's `captures`; only a non-free judged row with no `captures` array, i.e. frozen before T37, is named unjudged for `COPYRIGHTED_TEXT_CARRIED`, never filled; `captures: []` is judged).

Readings I am building on (no answer needed unless you read otherwise):
1. `readCaseFile` (R19) passes the carried case document's `materials:` rows to `caseFileManifestCheck(manifest, {materials})`, as case-grammar J1 proposes, so R19 names every R13 departure and R2 counts them for the case. A copy the manifest does not list at all is then a departure (differs) and also R8's `missing` naming the copy.
2. R4 is unchanged: a passage relied on in a photo carried as its copy is `missing` (its extracted text does not travel), never `differs`.
3. `COPYRIGHTED_PASSAGE_UNRELIED` is not named unjudged for a pre-T37 row: offline every carried passage is a finding's (`case-grammar` R17), so its only arm that could depart, the row's own `passages`, needs no `captures`.

Waiting: 3 of my new R8 tests and 4 spec tests (R14) need T37-40 on `tranche/T37` (`CASE_FILE_FORMAT` `/3`, the `obscured` kind and `caseFilePath("obscured", ref)`); everything else passes (52 of 59 before that merge; `program.test.mjs` R13 stale, red 18). Once T37-40 (and T37-18) are merged, I merge `tranche/T37`, finish the tests and checks, and post COMPLETE. Generated artifact `program.mjs`: stale from my change too; I will run its own command after the merge and report it.
