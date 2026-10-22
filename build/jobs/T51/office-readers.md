# office-readers (T51)

**Status** · session_01HwGAqD9Jozhj6cBJ9WXEo8 · depth 2 · WORKING · handled B6

## Completion

- **Entry applied:** T51-6, R34. `coreMetadata`/`withMetadata` (`docx.mjs`) take a `withTitle` flag; docx and pptx `text()` pass it, so `metadata.title` is the core part's `dc:title` as written, and no key when absent, empty or whitespace-only; no readable core part still gives `metadata: null`. xlsx and csv unchanged (R34 names docx and pptx only).
- **Tests:** `typed-cells.test.mjs`: new R34 test (titled, absent, empty, blank, no core part, xlsx and csv controls); the two R31 tests updated for the docx/pptx `title` key. No test weakened.
- **Deferred:** none. **Found in other modules:** none. The requirements file still marks R34 "not yet met: T51"; that line is BOB's to change.
- **Ran:** `node --test bio-plane/test/m/office-readers/` 108 pass, 0 fail; format 0 failures; architecture 0 failures; coverage 34 of 34 ids named, 0 failures; ownership 0 failures.
- Size (session_01QsLuHE3aQNFW5i1HvNqNBC): test runs 2, module lines 3819

- **T51-249 (words, K3957, B2/B3/B5):** all 7 `plain` findings judged as sentences a member can read (evidence signals of the encoding signature and the csv content-type claim, and two docx structure notes), the same kind this module already keys: each now read through `localize('office-readers.csv.<slug>' | 'office-readers.docx.<slug>', en)`, `en` unchanged. No test held a copy of any of them. Nothing listed as unkeyed. `node bio-plane/src/setup-words/build.mjs --check` names no office-readers finding; `rows.mjs` is stale for the 7 new ids until R1's close (BOB regenerates).
- **Ran (T51-249):** `node --test bio-plane/test/m/office-readers/` 108 pass, 0 fail; `checks/run.mjs`: format 0, architecture 0, no words finding in office-readers; coverage 34 of 34, 0 failures; ownership 0 failures.
- Size (session_011sN5z3ToMiv7YyPQWo8tT7): test runs 2, module lines 3819

- **T51 split (B6, K4507/K4521, depth 2, session_01HwGAqD9Jozhj6cBJ9WXEo8):** `bio-plane/src/csv.mjs` is now the one line `export * from "./csv-reader/index.mjs";`; `formats-xlsx.mjs` lost the four builders (`sheetCellRef`, `sheetRangeRef`, `columnLetters`, `usedSheetRange`) and imports and re-exports them from `./csv.mjs`, so `docx.mjs`, `odf.mjs` and every other importer are unchanged (`git grep 'from ".*csv.mjs"'` shows only the draft's section 4 importers, none edited). Module code 4,162 -> 3,310 lines (docx 1,190, pptx 1,016, formats-xlsx 1,103, csv 1). No behaviour change.
- **Tests removed (moved to csv-reader, section 4):** detect-parts R3 x2, R6 x3 and the csv lines of R1; text R11 csv x4, the csv arms of the shared R11 tests, R13, R14 x3; structure R10 csv; typed-cells R30 csv, the csv half of the guard test, csv `metadata` null in R31 and R34; active R32 csv half, the csv variant lines, `csvEntry` in the R33 loop; builders-invariants R17, R18 and every csv row; large-text R35 csv x5 and the csv memory entry; `large-worker.mjs` csv job; helpers `csvField`, `bigCsv`. Every docx, pptx and xlsx assertion kept.
- **Ids retired (for BOB to mark): R3, R6, R13, R14, R17, R18** (named by no test; coverage shows exactly these six). **Requirement lines proposed:** the draft's section 2b edits 1-23 exactly as written (edit 24 is off the critical path); no id reused.
- **Ran:** `node --test --test-force-exit bio-plane/test/m/office-readers/ bio-plane/test/m/csv-reader/` 143 pass, 0 fail; `odf-reader/` and `format-registry/` together 116 pass, 0 fail. Checks: format 0 failures; ownership 0 failures; architecture 1 failure, `csv.mjs` imports `csv-reader`, which `office-readers` does not yet declare in `uses` (expected until BOB's `build/modules.json` edit, which I did not make); coverage 1 failure, the six retired ids above unnamed (expected until BOB marks them retired). No words finding in office-readers files.
- **Deferred:** none. **Found in other modules:** none.
- Size (session_01HwGAqD9Jozhj6cBJ9WXEo8): test runs 3, module lines 3310

## J1 · COMPLETE

T51-6 applied: R34 met (docx and pptx metadata.title; no key when absent/empty/blank). 108 tests pass; format, architecture, coverage, ownership 0 failures. See record.

## J2 · COMPLETE

T51-249 applied: all 7 plain findings keyed with localize (csv 5, docx 2), en unchanged; none unkeyed. 108 tests pass; format, architecture, coverage (34/34), ownership 0 failures; no office-readers words finding. rows.mjs stale for the 7 new ids until R1's close. Size (session_011sN5z3ToMiv7YyPQWo8tT7): test runs 2, module lines 3819.
