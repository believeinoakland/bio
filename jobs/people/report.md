# T53 · people · report (PEOPLE #4, reopened after its archive, unmerged)

PEOPLE #1 to #3 committed every entry's work on `job/people` (75ada609, d75e7cb0); PEOPLE #3 was stopped by BOB on Bob's order before completing, and the job was archived, then reopened (issue 101). PEOPLE #4 read the set whole, checked each entry against the code and the tests, and found nothing left to change.

Entries applied:
- T53-623 (R2, R40): identity.test.mjs's grade-C sentence is read by `word("people.index.said_grade_grade_because_because", …)` with `people.claimed_unsure_whether` and `people.records_carry_name`, as the B and D cases are; the grade-A sentence is converted the same way.
- K5811 F1 (R22, R24, R31): `listChecks` is **stated, not retired**: an in-process read, never an op, answering each check version's definition and whether R24's gate is open, never a result; a check made inside a project the viewer may not see is neither answered nor counted (R31); an absent viewer fails closed; it writes nothing. notice-producers' in-process read keeps working unchanged. New test in checks.test.mjs.
- K5811 F2 (R26, R40; connection-grammar R6, R10): `neighbours` judges a hub per kind against `hubBoundOf(kind)`. Claims more than `BOUNDS.hub` in all, but each kind within its own bound, are now paged, not answered as a hub. A kind over its bound is a hub, with that kind's set size and `why_key`. New test in why.test.mjs.
- BOB #338 CHANGE (R16, R40): `statementsOf` asks `events.sequence` as the viewer reading. Test in why.test.mjs.
- K5565 (English in tests): the words check now counts 0 testenglish sites in every people test file. `build/tests-english-baseline.json` still lists candidates 1, checks 1, identity 5 and reads 1; that file is a build record and is BOB's to regenerate, so the baseline can now drop all four.
- K5811 settle items: already in the requirements; nothing to edit.

Found in other modules: none.

**Met** · none

**Evidence**
- `node --import ./test/platform-sqlite.mjs --test test/m/people/*.test.mjs` (bio-plane): tests 91, pass 91, fail 0
- `node /home/user/neoprocess/checks/words.mjs . --baseline`: no bio-plane/test/m/people/ file listed (0 testenglish sites)
- bio-plane/src/people/index.mjs:1830-1839: hub judged per kind by `hubBoundOf(kind)`
- bio-plane/src/people/index.mjs:1772-1781: `listChecks` stated as an in-process read (R22, R24, R31)
- bio-plane/src/people/index.mjs:1179: `events.sequence({a, b, viewer})`

Tests: 91/91. Checks: format, architecture, coverage, fixtures, ownership: no new finding.
Size: test runs 1, module lines 2331. Head 9ac1f76955.