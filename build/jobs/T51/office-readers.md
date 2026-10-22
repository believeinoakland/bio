# office-readers (T51)

**Status** · session_011kR2cnk3N8a4db55MmC9TW · depth 2 · COMPLETE · handled B6

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

## J3 · COMPLETE

OFFICE-READERS COMPLETE (B6, csv split). csv.mjs is now the one line 'export * from "./csv-reader/index.mjs";'; formats-xlsx.mjs lost the four builders (sheetCellRef, sheetRangeRef, columnLetters, usedSheetRange) and imports/re-exports them from ./csv.mjs; docx.mjs, odf.mjs and all other importers unchanged. Module code 4,162 -> 3,310 lines (docx 1190, pptx 1016, formats-xlsx 1103, csv 1). Tests: office-readers + csv-reader 143 pass 0 fail; odf-reader + format-registry 116 pass 0 fail. Moved csv tests and csv arms of shared tests deleted, helpers csvField/bigCsv and the worker csv job removed; every docx/pptx/xlsx assertion kept. IDS TO RETIRE (yours to mark): R3, R6, R13, R14, R17, R18 (coverage names exactly these six unnamed). REQUIREMENT LINES PROPOSED: draft-split-csv-reader section 2b edits 1-23 as written (24 off critical path). Checks: format 0, ownership 0; architecture 1 failure = csv.mjs imports csv-reader, not yet in office-readers uses (your modules.json edit; I did not touch it); coverage 1 failure = the six retired ids until marked. Deferred none; other modules none. Size (session_01HwGAqD9Jozhj6cBJ9WXEo8): test runs 3, module lines 3310.

## T51 fix round 6, G15 (B7, session_011kR2cnk3N8a4db55MmC9TW)

- **Cause (file:line):** `formats-xlsx.mjs` `xlsxText` built each sheet's `text` from `lines` (one per row holding a value; empty rows give no line) and emitted no row numbers, so a consumer could not tell a line's true row (reading-pipeline splits a sheet into row blocks from it, K4579). Missed because no requirement or test said a line's row must reach the consumer.
- **Change:** `formats-xlsx.mjs` (~:993-1040): `lineRows`, one 1-based row per line of `sheet.text`, same length, in the order of the lines (file order, as `text`); a row with no readable `r` follows the row before it (the format's own rule). Present on every walked sheet (`[]` for an empty one), also read in pieces (same callback, R35); an unreadable sheet and the size-guard answer carry none (nothing was walked: absent = unknown).
- **Failing-first** `line-rows.test.mjs` ("R11 lineRows ..."), through `xlsxEntry.text(bytes)`: red before the change (`actual: undefined, expected: [1,5,9,6,7]`), green after. Fixture: empty row, empty-string row, styled empty cell, rows out of order, a row with no `r`. `text.test.mjs` R11 xlsx test now also asserts `lineRows` (shape destructured out, nothing weakened).
- **Ran:** office-readers 105 pass, 0 fail; odf-reader + format-registry + csv-reader 155 pass, 0 fail; users that read xlsx text: reading-pipeline 190, extraction 247, content 142, all 0 fail (`impact.mjs` names 117 modules through the shared table; the callers of this service were run). Checks: format, architecture, coverage (6623/6623), words (no rise; no office-readers finding), ownership: 0 failures.
- **Requirement line proposed (R11, xlsx arm; BOB writes it):** "each sheet also carries `lineRows`: one 1-based row number per line of `text`, the same length, in the order of the lines (a row with no `r` follows the one before it); absent when the sheet could not be read. Test: line-rows.test.mjs." No new id, no census op, no new words, no stored data (read at call time). Platform check: N.
- **Deferred:** none. **Found in other modules:** none (csv-reader and odf-reader emit their own `lineRows`, wave 2).
- Size (session_011kR2cnk3N8a4db55MmC9TW): test runs 6, module lines 3317
