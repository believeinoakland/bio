# events (T52)

**Status** · session_018BhcefVAkEW3F8ikST3nS6 · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

**T52-16 applied.**

- R56: every `IN (...)` list in events (`#governingMany`, `#upperBounds`, `#whensRead`, `#datedLane`, `#eventsCiting`, and `owner.mjs`'s `inSlices`) now binds in slices of 50 (`SLICE`, exported from `owner.mjs`), so with the 23 fixed role/link words bound beside a slice no statement reaches 100. The old slice was 400. The split statements (`index.mjs` ~871) interpolate numeric ids, not binds, and are unchanged.
- R57: `#drawn` adds `relations: [{kind, other, withdrawn}]` to each timeline item, in the order recorded, `[]` when none, only for relations whose citation the viewer may see (R40).
- Tests: `bio-plane/test/m/events/binds.test.mjs` runs the timeline over 90, 120 and 200 captures on a store that refuses 100 or more parameters, a control at 20, and R57 (both ends, withdrawn, none). Without the fix, the 120, 200 and R57 tests fail. The events suite passes (106).
- "Settle at the real shape": I did not run `op=timeline&captures=` on the shipped store. This session has no shipped store. The test stand-in refuses at the same 100-parameter limit.
- Other modules: none found.

**Met** · R56, R57

Tests: 106/106. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefVAkEW3F8ikST3nS6): test runs 1, module lines 2837
