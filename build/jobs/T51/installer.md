# installer (T51)

**Status** · session_011C8Rkezi3vkSRfm413DJsR · depth 2 · WORKING · handled B1

## J1 · QUESTION

Ordering. My entry (T51-128) deletes the moved ranges after installer-steps merges, and the split map §8 wants the delegation seen green on the old words before any key is read. installer-steps (T51-127) has not merged: its job's J1 says its modules.json row on tranche/T51 is still empty (paths [], tests [], uses []), so its ownership checks cannot run, and there is no newgroup/src/steps/ on the tranche. Best reading: I read the keys now in everything that stays in installer (ui.mjs, index.html, the runs, the panels, the notices, the release choice, held/images halves, words.mjs, the tests) and do R74, R78, SCOPES, the bundle-fresh test exit and the ghcr fixtures; I leave the moved ranges (index.mjs 289-1520 and the lines 2075-2105, cfx/signers/account/images halves) untouched and their sentences to installer-steps' second stage (map §10 option 1), and I do the deletion, imports, re-exports, held.mjs and the fixture re-point only once installer-steps is on tranche/T51. Please answer: (a) set the modules.json row for installer-steps (J1 of that job) so it can finish; (b) confirm I carry on in that order and wait, ended turn, for the merge before the deletion. I carry on with the staying code meanwhile.
