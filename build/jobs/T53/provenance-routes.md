# provenance-routes (T53)

**Status** · session_018BhcegtWj2ri2s4WYU5iNP · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# T53 · provenance-routes · report

**Entries applied**
- T53-95 · K5565 · English in tests: the module's test assertions on English now read the word key the product reads (`wordRx` for a whole-value match, `word(key, vars)` where a placeholder is filled, `assert.equal` where the whole text is the key's). Converted: assess.test.mjs (5), chain.test.mjs (5), marked.test.mjs (2), rebuild.test.mjs (4). Every English site already had its key in the word table (`rows.mjs`), so no source change and no key was minted.

**Not done, and why**
- The tests-english baseline (`build/tests-english-baseline.json`) still lists this module's files at their old counts. The job's ownership check refuses a job diff outside its paths, tests and record, so I did not lower those lines. The ratchet only shrinks and the words check passes (`testenglish 0`), so the stale counts hide nothing. **For BOB at the layer close:** lower the provenance-routes lines (assess 5, chain 2, marked 3, rebuild 3 are now 0; audit 1 and table 1 stay, they are SQL literals the check still counts), or allow the baseline in ownership.
- Kept on purpose: `/FROM provenance_route_marks m\b/`, `CREATE TABLE IF NOT EXISTS provenance_route_marks`, `/source\.receipt/`, the ISO-timestamp pattern. These are SQL, identifiers or formats, not English.

**Found in other modules**
- None.

**Checks run**
- `node --test test/m/provenance-routes/` in bio-plane: 49 pass, 0 fail, before and after.
- `node checks/words.mjs .`: `testenglish 0`, `0 failures`.
- `node checks/ownership.mjs` for provenance-routes: `0 failures`.

**Model note**
- The row file names `sonnet-5-5` for this job because B sites need a module source change. Every B site here already had its key, so the work was test-only and ran on claude-haiku-5-5. Flagged for BOB.

**Met** · none

Tests: 49/49. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegtWj2ri2s4WYU5iNP): test runs 1, module lines 1237
