# image-codecs (T53)

**Status** · session_018BhcegW9K1yhVCSYsMB8Ve · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-27)

# image-codecs · T53 R1 · report (K5565 English-in-test entry)

**Entries applied**
- T53-55 · K5565 · English in tests: converted the module's English-in-test sites.
  - `pdf-worker/test/codecs/dct.test.mjs` (libjpeg default sentence): the test reads the row's text from the word table (`WORD_ROWS`); it no longer copies the sentence.
  - `pdf-worker/test/codecs/invariants.test.mjs` (`/the decoder reached for/` on the test's own trap): the trap throws a `Reached` error class; the assertion checks the class. The sentence is test input data, kept.
  - Words check: `0 failures` (testcopy 0, missingkey 0, marker 0, testenglish 0 on the arm).
  - Suite: `pdf-worker/test/codecs/*.test.mjs`, 80 tests, all pass.

**Not done**
- `pdf-worker/test/codecs/dct.test.mjs:318` `assert.match(e.detail.note, /Huffman table/)` — the one English regex site (CENSUS-RX B). Its note comes from five source keys (`dctdecode.huffman_table_class_or_id`, `..._counts_run_past`, `..._of_total_symbols` with vars, `bogus_huffman_table_definition_get` with a var, `..._missing_for_component`), chosen per refusal case. Mapping each case to its key needs BOB's call (see question). The baseline keeps dct at 1 (the ratchet allows no increase); the baseline was not lowered.
- Model: the row's work is `sonnet-5-5` (a B site). This session runs on Haiku 5.5; the B-site mapping above is where that matters.

**Found in other modules**: none.

**Question for BOB (WAITING)**: for the Huffman refusal test, may the job map each refused case to its word key (test-only change, with vars computed from the refusal), or should the test assert the refusal's named fields only and drop the wording check?

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegW9K1yhVCSYsMB8Ve): test runs 1, module lines 3590

## Completion (2026-10-27)

# image-codecs · T53 R1 · report 2 (K5583 answer)

**Entries applied**
- T53-55 · K5565 · English in tests: complete. The last regex site (dct.test.mjs, the Huffman refusal note) now asserts the word key for each refused case, with its values. Each case maps to the decoder check that produces it (classOrId, countsRunPast, ofTotal, bogus with its inner codes or DC-symbol reason).
- Words check: 0 failures (testenglish 0, missingkey 0, marker 0).
- Suite: pdf-worker/test/codecs/*.test.mjs, 80 of 80 pass.
- Merged origin/tranche/T53 and pulled civicos-process main (PR #20, #21).

**Not done**
- Baseline left as recorded, per BOB (K5583).

**Found in other modules**: none.

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegW9K1yhVCSYsMB8Ve): test runs 2, module lines 3590
