# connection-grammar (T53)

**Status** · session_018BhcegRDtn8p6dt8ssxJKJ · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# connection-grammar · T53 report

**Entries applied**
- T53-18 (N1260, DEC-409): `chainStrength`, `strongerChain` (R22); `orderPaths` now orders by `by`, hop count, strength, earliest `valid.from`, ids (R23); `foldParallel` (R24; groups in order of first appearance, `HOPS_INVALID` refusals); `CHAIN_LIMITS` and `chainLimitOf` (R25). `BOUNDS` and `EXHAUSTION_REASONS` unchanged. New tests R22–R25 in `bounds-walk.test.mjs`; the R14 case passes unamended (its fixture paths are equal in strength).
- T53-19 (K5565): the one C site (`neighbours.test.mjs`, a thrown sentence of the test's own owner) is now input data, the token `OWNER_STORE_CLOSED`. The R12 hunch assertion in `bounds-walk.test.mjs` reads its word key instead of a regex.
- Own flaw fixed: `orderPaths`' `PATHS_INVALID` reason was a bare sentence; it is now a `localize` id.

**Not done:** none. New `localize` ids (`connection-grammar.why.paths_list`, `hops_list`, `chain_limit_whole`, `chain_limit_over`) reach the word table when setup-words' build runs at merge; I did not edit its generated rows.

**Found in other modules:** nothing.

**Met** · R22, R23, R24, R25

Tests: 47/47. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegRDtn8p6dt8ssxJKJ): test runs 1, module lines 854
