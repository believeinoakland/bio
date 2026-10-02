# action-plans (T22)

**Status** · session_01XeCVLug8LZzL9zCXgkZTW9 · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

B1's fixture change (c27f37b2ea) imports `provenanceOf` from `bio-plane/src/provenance/index.mjs` and migrates it before `actionsOf`. With it, on a scratch merge of `origin/job/T22/actions` (211dd968f1): `test/m/action-plans/` 43 pass, 0 fail; affordances `backing.test.mjs` 11 pass, 0 fail (:140, :165 green). Without actions merged, the same.

But `node checks/architecture.mjs . action-plans` now fails: "fixture.mjs (action-plans): imports bio-plane/src/provenance/index.mjs of provenance, which action-plans does not declare in uses". `build/modules.json` is not mine to edit.

My best reading: add `provenance` to action-plans' `uses` in `build/modules.json` (provenance is layer 3, earlier, so the edge is legal; every real host builds it, as B1 says; `actions`, which action-plans uses, already declares it). The only import-free alternative is passing `capture: null` to `actionsOf` in the fixture, which opts out of R55's reader and so no longer builds actions as a real host does; I do not recommend it. Which do you want? If the first, I re-run the checks once modules.json is on tranche/T22 and post COMPLETE.

## J2 · REPORT

Another module's red, found while proving B1 (not mine to fix): with `origin/job/T22/actions` (211dd968f1) merged, `action-clocks`' own fixture fails the same way action-plans' did: 25 tests across `test/m/action-clocks/{calendar,clocks,overdue,reminders}.test.mjs` throw `fixture action refused: PROMOTE_FAILED ... no such column: authored`. Its fixture builds `actionsOf` without migrating provenance. Its uses do not declare `provenance` either, so it will meet the same architecture failure. Full `bio-plane/test/m` with actions merged: no other new red apart from scratch-worktree artifacts (extraction convert-tiers and staffdirectory, test-support: the scratch tree lacked `pdf-worker` node_modules; all three green in the real checkout).

## Completion

Entries applied:
- B1 (K1086): `test/m/action-plans/fixture.mjs` builds provenance (`provenanceOf(host, …).migrate()`) before `actionsOf`, as a real host does. Re-scan for N469/N471/N480: one stale note re-worded, `src/action-plans/index.mjs` `actionPlansOps`' doc named `legacy-store`'s dispatch; it now names `plane`'s store (`src/plane/store.mjs`), where the spread line is. No note names `tools/` or the plane `index.mjs`.
- B2 (N497, K1087): `producingGroup` registered under `instance-setup`, not `legacy-store`. No other promotion fact is registered by this fixture.
- B3/B5 (K1088): `provenance` in my uses; tranche/T22 merged (through 0cbec8e1ea and later).
- B4 (K1089): proven against actions' merged R55.
Deferred: none. Behaviour unchanged.
Other modules: J2 (action-clocks' fixture) settled by K1089, per B5.
Tests (on job/T22/action-plans with tranche/T22 merged):
- `node --test bio-plane/test/m/action-plans/`: tests 43, pass 43, fail 0.
- `node --test bio-plane/test/m/affordances/backing.test.mjs`: pass 11, fail 0 (:140, :165 green).
- whole `bio-plane/test/m`: tests 4947, pass 4919, fail 10, no new red. All 10 were red on this branch before my change: control-plane catalogue-end:15, doorbell:310; membership module-order:12 (MODULE_ORDER), t9-notice-sight-bounds:185; promotion registry:58; queue-producers proposals (4); scheduler plane:85. actions t18:299 is now green.
Checks: format 0 failures; architecture (action-plans) 0 failures; coverage 35 of 35 live ids, 0 failures; ownership 3 files, 0 failures.
A test-and-comment change: it makes no bundle stale.
Size (session_01XeCVLug8LZzL9zCXgkZTW9): test runs 14, module lines 2609
