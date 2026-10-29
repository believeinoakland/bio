# calibration (T53)

**Status** · session_018Bhcec6UfHC9x41Jwa7guR · depth 2 · COMPLETE
**Sessions** · 2

## Completion (2026-10-28)

# T53 · calibration · report

**Entry applied:** T53-123 · K5565 · English in tests (one conversion entry for this module, haiku-5-5, test-only).

**Census for this module:** literal 0 A / 0 B; regex 2 A / 0 B / 0 C in CENSUS-RX. Work done covered every English-in-test site found in this module's test files, including two sites the census did not count (short fragments).

**Converted (bio-plane/test/m/calibration/):**
- store.test.mjs: "holds no alarm at all" → `word("calibration.why.engine_registered_calibration")` (exact `why`); "No module derives obligations" → `word("calibration.why.module_derives_obligations")` (included in `why`); "30 day" → `cadenceSentence()`.
- rules.test.mjs: "every 30 day" → `word("calibration.probe_per_calibratable", { days })`; two literal cadence sentences (7 and 1.50 days) → the same key with their values; "every 7 day(s)" regex → `includes(cadenceSentence(7 * DAY))`.

**Not done:** nothing in the entry.

**Found in other modules:** none.

**Met** · none

**Tests:** `node --test --test-force-exit test/m/calibration/` → 73 pass, 0 fail.

Tests: 73/73. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcec6UfHC9x41Jwa7guR): test runs 1, module lines 1052
