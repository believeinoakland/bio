# leg-earning (T52)

**Status** · session_018BhceeCT96yvS78CHqWUdd · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# LEG-EARNING #1 · T52

Entries applied: T52-105 (R17): `restingOn` and `restsOnLive` read each leg's own status from the citer's `basis[]` entry at the leg's ord (`status: severed`; absent or `confirmed` is live); a leg recording none is read by the document's `references[]` edge as before. Test `reads.test.mjs` R17 (two passages, one severed; both severed; no own status; the 58 module tests pass).

Reading to confirm (asked of BOB, not yet answered): the key is `status` on the basis leg. citation R25 and inquiry-grammar must write that same key; if they choose another, it changes in `#legSevered` alone. The test builds the citer's document by hand in the module's own fixture, since citation's published fixture does not yet write per-passage status.

Not done: none. Found in other modules: none.

**Met** · R17

Tests: 58/58. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeCT96yvS78CHqWUdd): test runs 1, module lines 1409
