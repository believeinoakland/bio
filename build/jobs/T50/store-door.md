# store-door (T50)

**Status** · session_01T1GNSh1aY2c4gjiKCeTLcz · depth 2 · COMPLETE · handled B0

## J1 · QUESTION

T50-50 store-door (R15 by the founder's handle, and the word list). Pushed at 25128cabc3.

Done:
- R15: the test claims and signs in with the founder's handle ("founder"), not a role. It was failing with SIGN_IN_REFUSED. routes.test.mjs now passes 11/11, and the whole store-door suite passes 48/48.
- The INTERFACE_WORDS import at routes.test.mjs:220 now reads setup-words' WORD_ROWS (the owner's declaration), not setup.mjs's re-export.
- Format: 0 failures. Coverage: 16 of 16 live ids named. Ownership: 0 failures.

Blocked on your decision: architecture fails with 1 failure. routes.test.mjs imports bio-plane/src/setup-words/index.mjs, and store-door does not declare setup-words in `uses` in build/modules.json. The boundary is yours, so I have not edited modules.json.
Options:
(1) You add "setup-words" to store-door's `uses` in build/modules.json. Layer 1, no cycle. My recommendation. This is a one-token edit.
(2) I keep the import through instance-setup's re-export until T50-23 deletes it. Then the test goes red at T50-23, so I do not recommend it.

Not changed, reported under N1073 (rule 6, item 3):
- routes.test.mjs:42 pins sources' route names as an expected set. The test already reads sourcesOps; the typed list is the pin.
- dispatch.test.mjs:270 names projectholds, actionholdrelease and actionholdpreview. These are the subject of R3, not an incidental hand-list.
Say if you want either derived from the owners' declarations instead.

Labelled: none in store-door's own words or tests, so nothing to re-spell.

## J2 · COMPLETE

T50-50 store-door: complete. Pushed on job/T50/store-door; tranche/T50 merged in (B2 applied: setup-words is in store-door's uses).

Entries applied:
- R15 (N1134): the test claims and signs in with the founder's handle ("founder"), not a role. routes.test.mjs passes 11/11.
- Word list (K3696 (2)): routes.test.mjs reads setup-words' WORD_ROWS, the owner's declaration, not setup.mjs's re-export.
- Rule 6, item 2 ("labeled"): no "labelled" in store-door's own words or tests; nothing to change.
- Rule 6, item 3 (N1073): routes.test.mjs:42 pins sources' route names and dispatch.test.mjs:270 names R3's three ops. Both left as they are, per B2.

Deferred: none.

Found in another module: none. The coverage failures in checks/run.mjs (21, in op-declarations, op-grades, queue, screens-*, translations) are in other modules' ids, not store-door's.

Checks and tests, after the merge:
- node checks/format.mjs: 171 modules, 170 requirements files; 0 failures
- node checks/architecture.mjs store-door: 10 product files, 111 relative imports; 0 failures
- node checks/coverage.mjs store-door: 16 of 16 live requirement ids named by a test; 0 failures
- node checks/ownership.mjs store-door tranche/T50: 0 failures
- node checks/run.mjs: architecture 0 failures for the product; format 0; channels 0; coverage 21 failures, none in store-door
- node --test test/m/store-door/*.test.mjs: 48 pass, 0 fail

Size (session_01T1GNSh1aY2c4gjiKCeTLcz): test runs 4, module lines 651
