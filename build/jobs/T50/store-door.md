# store-door (T50)

**Status** · session_01T1GNSh1aY2c4gjiKCeTLcz · depth 2 · WORKING · handled B0

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
