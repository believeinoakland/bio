# standards (T53)

**Status** · session_018BhceeaibBmzLUp9ntjA2V · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# standards · T53 R1 · report

## Entries applied
- T53-152 · K5565 · English in tests (standards): 26 of the 27 checker-counted English-in-test sites in `bio-plane/test/m/standards/` now assert word keys (`wordRx` for whole values, `WORD` where a placeholder applies).
- law-fields.test.mjs:51 (BOB #332's ruling): the refusal sentence is wrapped at its use as `localize("standards.index.instrument_cannot_be_given", "cannot be given: {why}", { why })` in `src/standards/index.mjs`, and the test reads the key.
- `build/tests-english-baseline.json` is reverted to the tranche's version (BOB #332, option 2): BOB lowers the module's lines at the layer close.

## Not done, and why
- `fixture.mjs:103` is a SQL pattern (`CREATE TABLE IF NOT EXISTS reading_refs`), not English; the checker still counts it, so it stays in the baseline at its tranche value.
- `declare.test.mjs:74` asserts a source name the checker does not count; left as data.
- Regex matches in comments (the classifier's C class) are not assertions and are not counted by the words check; not touched.

**Met** · none

## Verification
- `node --import ./test/platform-sqlite.mjs --test test/m/standards/*.test.mjs` (rows regenerated locally, then reverted before commit): 125 pass, 0 fail.
- `node bio-plane/src/setup-words/build.mjs --check`: fresh with the regenerated rows.
- `node /home/user/civicos-process/checks/words.mjs .`: testenglish 0, 0 failures.

Tests: 125/125. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeaibBmzLUp9ntjA2V): test runs 1, module lines 3628
