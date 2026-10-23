# cause-founder-T51 (T51)

**Status** · session_01BjjL5Lor7Y79QoWxeSz2Wm · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Coverage failures found in other modules (not this job's; not changed here). The full `checks/run.mjs` run names 4 modules with live requirement ids named by no test:
- agent-harness: R17 (1 of 19)
- agent-runner: R37, R38, R40 (3 of 42)
- installer-steps: R26, R31 (2 of 38)
- journey-check: R19 (1 of 30)
Whole product: coverage 6449 of 6456 live ids named by a test. Each owning module's job needs to add the test, or BOB rules on them.

## J2 · COMPLETE

Entries applied: the K4286 cause, both fixes, as the record's START states. Commit 788ef251dd on job/T51/cause-founder-T51 (tests only; no source or requirement line changed).
- ai-accounts R7 (group-key.test.mjs): `admin` removed from the not-active list (cal and ghost kept). The founder's path is asserted: GROUP_KEY_NOTICE_DUE until her notice is seen, then served the group key (level group).
- capture-sources R55 (credentials.test.mjs): the stale refusal "the founder is not a member row" is removed; a positive case asserts the founder's own member credential is supplied (scope member, supplied_by admin). The other refusals and their controls stand.

Deferred: none.
Found in other modules: 4 modules with live ids named by no test (agent-harness R17; agent-runner R37 R38 R40; installer-steps R26 R31; journey-check R19), sent as a separate REPORT.

Tests and checks run:
- `node --test --test-force-exit test/m/ai-accounts/`: tests 131, pass 131, fail 0.
- `node --test --test-force-exit test/m/capture-sources/`: tests 110, pass 110, fail 0. (Each suite failed once before the fixes, as the START described; 3 runs per suite.)
- `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0; coverage 4 failures, all in the other modules above; channels 0; words 0.
- `checks/format.mjs bio`: 0 failures. `checks/architecture.mjs` for ai-accounts and capture-sources: 0 failures each. `checks/coverage.mjs`: ai-accounts 37 of 37, capture-sources 67 of 67.
- `checks/ownership.mjs` run per module against tranche/T51: it flags the other module's test file and this job's record, as this job holds two modules; each changed file sits inside one module's tests. Each module's own file is in its own paths.

Size (session_01BjjL5Lor7Y79QoWxeSz2Wm): test runs 6, module lines 11
