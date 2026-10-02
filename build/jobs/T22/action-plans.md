# action-plans (T22)

**Status** · session_01XeCVLug8LZzL9zCXgkZTW9 · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

B1's fixture change (c27f37b2ea) imports `provenanceOf` from `bio-plane/src/provenance/index.mjs` and migrates it before `actionsOf`. With it, on a scratch merge of `origin/job/T22/actions` (211dd968f1): `test/m/action-plans/` 43 pass, 0 fail; affordances `backing.test.mjs` 11 pass, 0 fail (:140, :165 green). Without actions merged, the same.

But `node checks/architecture.mjs . action-plans` now fails: "fixture.mjs (action-plans): imports bio-plane/src/provenance/index.mjs of provenance, which action-plans does not declare in uses". `build/modules.json` is not mine to edit.

My best reading: add `provenance` to action-plans' `uses` in `build/modules.json` (provenance is layer 3, earlier, so the edge is legal; every real host builds it, as B1 says; `actions`, which action-plans uses, already declares it). The only import-free alternative is passing `capture: null` to `actionsOf` in the fixture, which opts out of R55's reader and so no longer builds actions as a real host does; I do not recommend it. Which do you want? If the first, I re-run the checks once modules.json is on tranche/T22 and post COMPLETE.

## J2 · REPORT

Another module's red, found while proving B1 (not mine to fix): with `origin/job/T22/actions` (211dd968f1) merged, `action-clocks`' own fixture fails the same way action-plans' did: 25 tests across `test/m/action-clocks/{calendar,clocks,overdue,reminders}.test.mjs` throw `fixture action refused: PROMOTE_FAILED ... no such column: authored`. Its fixture builds `actionsOf` without migrating provenance. Its uses do not declare `provenance` either, so it will meet the same architecture failure. Full `bio-plane/test/m` with actions merged: no other new red apart from scratch-worktree artifacts (extraction convert-tiers and staffdirectory, test-support: the scratch tree lacked `pdf-worker` node_modules; all three green in the real checkout).
