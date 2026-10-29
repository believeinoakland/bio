# people (T53)

**Status** · session_018BhceeUeyPyw2FjATLUTpr · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# T53 R1 · people · report (entry T53-161, K5565: English in tests)

Entries applied:
- T53-161 (K5565) English in tests, people's own sites:
  - Regex assertions converted to word-table reads by key (identity.test.mjs 13 sites, reads.test.mjs 3 sites):
    each assertion now reads the expected text with word(key, vars) and asserts equality, never prose.
  - B site: candidates detail sentence had no key. It is now localize("people.index.candidates_detail", ...) in src/people/index.mjs;
    build.mjs regenerated rows.mjs and words-unreviewed.json (build --check passes). candidates.test.mjs asserts it by key.

Kept, not converted (reasons):
- identity.test.mjs: assert.doesNotMatch(r.why, /\bis the same person\b/) is a negative R2 rule (never "is the same person"). No single word key equals that fragment, so it stays.
- reads.test.mjs: assert.match(r.rosters[0].error, /sheet unreadable/) echoes the test's own thrown input (C, test input data). Kept.
- directory.test.mjs: assert.equal(..., "Director of Public Works") echoes the test's own fixture title; the literal is not in product source under bio-plane/src (census B is not confirmed here). Kept as input data.

Not done: none of the entry's counted sites remain open beyond the three kept reasons above.

Found in other modules: none.

Note: the job's model is sonnet-5-5 per the rows file; this session runs Haiku 5.5 and did the source change (one localize call) itself.

Test run: bio-plane test/m/people/*.test.mjs: 88 pass, 0 fail (baseline 88 pass).

**Met** · none

Tests: 88/88. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhceeUeyPyw2FjATLUTpr): test runs 1, module lines 2321
