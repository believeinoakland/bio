# query-language (T52)

**Status** · session_018Bhced7XwxHM61Lrxj2vxC · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-27)

## Report: query-language, T52

**Entry applied: T52-19.** The match marker in a snippet is now one the stored text cannot contain. The requirements file is BOB's, so I did not edit it; the proposed requirement R35, amending R12, R14 and R33, is below for BOB to fold.
- Every snippet (the page's text and passage snippets, and `rows=passage`'s) marks a match with `MARK_OPEN` (U+0001) and `MARK_CLOSE` (U+0002), exported from `query.mjs`. The brackets are gone, so a literal `[placed nowhere]` or `[object Object]` in a record is plain text.
- `textOf` strips both characters from what it indexes. A stored text that still holds one (a unit, or a record indexed earlier) is cut with no mark and the characters removed, so a reader never sees a false mark.
- Tests: three new tests in `snippets.test.mjs` cover the literal brackets, a stray mark character and the `textOf` strip. The existing bracket assertions in `snippets`, `converts` and `statements` now read the marks. All module test files pass.

**Not done:** none.

**Found in other modules (for W28, "adapts the drawer"):** `screens-daily/answers.mjs:129` prints `h.snippet` escaped and so shows the marks as invisible characters. Any consumer that read `[` and `]` as match marks (`retrieval`, `retrieval-browse/findin.mjs`, `screens-daily`) must read U+0001 and U+0002 instead. I did not edit them.

**Proposed R35 (BOB folds):** (T52-19; B-K5 marker; amends R12, R14, R33) A snippet marks a match with two marks the stored text cannot hold. Every snippet this module cuts (the page's text and passage snippets and `rows=passage`'s) opens a match with `MARK_OPEN` (U+0001) and closes it with `MARK_CLOSE` (U+0002), both exported, in place of the brackets; the ellipsis and the clamp (R12) are unchanged. `textOf` removes both characters from what it indexes (R19). A stored text that holds either (a unit, or a record indexed before this rule) is cut with no mark and the characters removed. The tests in `snippets.test.mjs` named T52-19 check it, and the bracket assertions elsewhere read the marks; they name no R35 yet.

**Met** · none

Tests: 62/62. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhced7XwxHM61Lrxj2vxC): test runs 1, module lines 3029
