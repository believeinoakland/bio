# csv-reader (T51)

**Status** · session_01SKPjPu69D1xg5Pwz4djD8g · depth 2 · WORKING · handled B0

## Completion

- **Entry applied:** the office-readers split, plan entry 15 of `fix-round-4b-T51.md` (K4507, K4521), option 1, by copy; no behaviour changed. Files made: `bio-plane/src/csv-reader/index.mjs` (865 lines: `csv.mjs` copied with its `formats-xlsx.mjs` import dropped, imports only `../ooxml.mjs` and `../setup-words/index.mjs`, plus the four builders `sheetCellRef`, `sheetRangeRef`, `columnLetters`, `usedSheetRange`); `bio-plane/test/m/csv-reader/` `entry`, `structure`, `text`, `typed-cells`, `large-text`, `builders-invariants` `.test.mjs` and the helpers `fixtures.mjs` (`enc`), `large.mjs` (`bigCsv`, `csvField`, `prng`, `randomText`, `MIB`), `large-worker.mjs`. office-readers' files and tests untouched.
- **For `build/modules.json` (BOB):** `"paths": ["bio-plane/src/csv-reader/"]`, `"tests": ["bio-plane/test/m/csv-reader/"]`.
- **Met ids:** R1–R15 (all 15), each named by at least one test: R1, R2, R3 (`entry`), R4 (`structure`), R5, R6, R7 (`text`), R8 (`typed-cells`), R9 (`large-text`), R10–R15 (`builders-invariants`).
- **Words:** the sentences keep their existing keys (`office-readers.csv.*`, `csv.notes.*`; K3930); none re-keyed. The words check reports no finding for csv-reader (inline 0, plain 0, missingkey 0, unkeyed 0) and the totals are unchanged from before (dev 268, unkeyed 1982).
- **Deferred:** none. **Found in other modules:** none.
- **Observation, not a deferral:** R8 says that over the size guard `cells` is `null`; the copied behaviour, and the office-readers test it came from, give `sheets: []` there (no sheet, so no `cells`). The test asserts that, unchanged; the requirement's wording is BOB's.
- **Ran:** `node --test --test-force-exit bio-plane/test/m/csv-reader/` 39 pass, 0 fail; `node --test --test-force-exit bio-plane/test/m/office-readers/` 126 pass, 0 fail (unchanged). The checks, run on a scratch checkout of this commit with only the two `build/modules.json` fields above entered (the real file still has them empty until BOB enters them): format 0 failures; architecture 0 failures (csv-reader imports ooxml and setup-words only); coverage 15 of 15 ids named, 0 failures; words 0 failures; ownership (`tranche/T51` to this commit) 11 files changed, 0 failures. Run on the real tree before BOB enters the paths, ownership and coverage report csv-reader's files and ids as unowned/unnamed, as expected.
- Size (session_01SKPjPu69D1xg5Pwz4djD8g): test runs 4, module lines 865
