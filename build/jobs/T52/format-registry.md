# format-registry (T52)

**Status** · session_018BhcecAZj5QC9cHVQCT81f · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

**Entries applied**
- T52-3 (K5339 red, R31): cause settled on the tranche tip. `detectFormat`'s name pass (R31) is correct: it hands `isDelimitedText(name, contentType, head)` the head and returns its answer. The red was the module's own test (`detect-round9.test.mjs`, R31 case): its `.tab` and `.txt` rows (declared plain text under `text/plain`, or a `.txt` name) used 4-record fixtures. csv-reader's R27 (T51 fix round 10, K5271, later than the test) reads declared plain text as a table only with at least 5 records, so `isDelimitedText` answered false. Fix: those rows now use 5-record fixtures (`CSV5`, `TSV5`). No source change. Module tests: 59 pass, 0 fail.

**Not done:** nothing.

**Found in other modules:** none. The registry source is unchanged; R31's text ("a CSV ... named .csv, .tsv, .tab or .txt is read as a sheet") should now say that declared plain text also needs csv-reader's R27 shape; that is a requirement wording for BOB.

**Met** · R31

Tests: 59/59. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecAZj5QC9cHVQCT81f): test runs 1, module lines 506
