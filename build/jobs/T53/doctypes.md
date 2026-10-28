# doctypes (T53)

**Status** · session_018Bhcecc4twXKUaZ83a4k6m · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# doctypes · T53 R1 · report

## Entries applied
- T53-48 (K5565, English in tests): partly applied.
  - Literal sites: all 10 converted to `word(key)` (words check's missingkey arm passes after PR #20, K5582).
  - Prose regex sites: `policy` cleared; `no_outline` and `sections.unplaced` converted to word equality.
  - Left for a later pass: 6 regex sites (doctypes.test.mjs overdue/`carries no number` lines; regulation-sections.test.mjs structural regexes). Recorded at the ratchet, not hidden.
  - Not converted: the B site "Residential Rent Adjustment Board" (regulation-sections, `all.includes`), which is a test-corpus term, not yet checked for a key.

## Not done and why
- The 6 residual regex sites: each needs its key's placeholders filled from the test's own values; not yet done.

## Found in other modules
- None.

## Tests
- `node --test --test-force-exit doctypes/test/*.test.mjs`: 80 pass, 0 fail.
- `checks/words.mjs . doctypes`: 0 failures.

**Met** · none

Tests: 80/80. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcecc4twXKUaZ83a4k6m): test runs 1, module lines 27053
