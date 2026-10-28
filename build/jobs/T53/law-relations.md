# law-relations (T53)

**Status** · session_018Bhcef45tY22jRGKXzGfRR · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# T53 R1 · law-relations · report (job depth 2)

**Entry applied:** T53-151 (K5565), English in tests, for law-relations.

**Done**
- Seven English-asserting regex sites in courts, host and reads converted to word keys. `wordRx(key)` and `wordTextRx(key, vars)` now live in the module's fixture (test/m/law-relations/fixture.mjs), so the shared test/word-rx.mjs is untouched. Placeholder values are the ones the product passes to word().
- Keys used: law-relations.why.record_holds_treatment, why.record_state, why.court_citation_volume, says.keyed_citation_lookup, why.first_court_standards (two sites), why.held_capture_see, why.chain_renumberings_recodifications, why.lowest_grade, why.node_connections_hub.
- reads: the test input "the chain is not read" is a named constant (UNREAD), used as input and in the expectation.
- Module tests: node --test over test/m/law-relations/*.test.mjs: 26 pass, 0 fail.
- Words check: 0 failures; testenglish 0.
- Ownership check: 0 failures.

**Not done, for BOB**
- The three law-relations lines in build/tests-english-baseline.json (courts 5, host 1, reads 1) should now be removed. The ownership check refuses a job's edit to that file, so I left them. The ratchet still passes (the file holds fewer sites than it records). BOB: please lower these lines, or tell me to take it again.

**Left as is, not counted by the words check**
- courts.test.mjs:115, a template literal with "reversed it, effective".
- reads.test.mjs:107, "zz…: not held": a short fragment whose text is a product literal in weakestCeiling (src/law-relations/index.mjs), not a word key.
- host.test.mjs outward-text filters (place names and merit words): test filters, not prose assertions.
- I did not classify the census's three C sites one by one; these are the candidates.
- The product literal "not held" has no word key. Giving it one is a source change, outside this test-only job.

**Found in other modules:** none.

**Met** · none

Tests: 26/26. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcef45tY22jRGKXzGfRR): test runs 1, module lines 936
