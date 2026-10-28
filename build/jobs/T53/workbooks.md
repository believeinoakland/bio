# workbooks (T53)

**Status** · session_018BhcedNCFBDfPRY1SLbuns · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# workbooks · T53 · R1 · report

## Entries applied
- T53-172 (K5565, English in tests), all sites:
  - `src/workbooks/lint.mjs`: the short_range detail is `localize("workbooks.lint.short_range", ...)` with optional tails `workbooks.lint.starting_before` and `workbooks.lint.past_its_end`; the cross_foot detail is `localize("workbooks.lint.cross_foot", ...)`. Placeholders replace the composed template text.
  - `test/m/workbooks/lint.test.mjs` (lines 25, 26, 67): exact `assert.equal` against `word(...)` of those keys.
  - `test/m/workbooks/add.test.mjs:85` and `test/m/workbooks/recompute.test.mjs:135`: read `workbooks.recomputed` and `workbooks.open_spreadsheet_program` by key (committed earlier, 5a118872).
  - `build/tests-english-baseline.json`: restored to the tranche's version, per BOB (K5759: BOB lowers it at the layer close).
- Test run with setup-words rows regenerated locally: `node --test bio-plane/test/m/workbooks/` -> 50 pass, 0 fail. The generated rows were then restored; `rows.mjs` is not committed.
- Words check for the module: 0 failures, testenglish 0.

## Not done
- `recompute.test.mjs:131` (`\(ironcalc other\)`): an engine name and version as test data; kept as input data.
- The literal "What does it cost?" in `add.test.mjs`: a test question submitted and echoed back; kept as input data.
- `lint.test.mjs:35` (`/1\.07/`): a figure, not English; not converted.

## Found in other modules
- None.

**Met** · none

Tests: 50/50. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Heavy tests: bio-plane/test/m/workbooks/r22-r23.test.mjs 2149 MB
Size (session_018BhcedNCFBDfPRY1SLbuns): test runs 1, module lines 1743
