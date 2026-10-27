# pdf-pixels (T53)

**Status** · session_018BhcedB5GgMUpTVDfuXRuA · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# T53 R1 · pdf-pixels · report

## Entries applied
- T53-56 · K5565 · English in tests (conversion entry). Checked against the census and the words check:
  - Literal sites (CENSUS): 0 A, 0 B. Nothing to convert.
  - Regex sites (CENSUS-RX): 0 A, 0 B, 2 C as the classifier reports them. Neither is an English assertion:
    - `pdf-worker/test/pagepixels-corpus.probe.mjs:487` is a source-text regex `/const GT_PAGE2 = .../` over another module's probe file. It is code, not prose.
    - `pdf-worker/test/pagepixels.test.mjs:1122` is a test title that the classifier's regex parser mis-read; the real assertion on that line is the code regex `/d\s*<=?\s*\d+\s*;/`.
  - None of the module's test files appear in `build/tests-english-baseline.json`, so the words check's testenglish ratchet holds nothing for them.
  - No file was changed, so there is nothing to commit.

## Not done
- Nothing from the entry. No edits to the module's code or tests.

## Found in other modules
- None.

## Test run
- `node --test --test-force-exit --test-concurrency=1` on pagepixels, imagecrop, jbig2, jpx: 4 of 4 pass (pagepixels: 568 passed, 0 failed).

**Met** · none

Tests: 4/4. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedB5GgMUpTVDfuXRuA): test runs 1, module lines 1761
