# membership (T32)

**Status** · session_01Wfr9yNZxkhG7EgTdUKQsMf · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied.** `build/plan/current.md` (T32) L2, membership: N544 (R83; K1396), per B1.
- `bio-plane/src/membership/index.mjs`: `MODULE_ORDER` gains `wizard-scripts` at the head of layer 11, directly after `scheduler` and before `affordances`, as `build/modules.json` orders it. The file header names T32's R83 order. Nothing else changed (commit 81a06a2f3b).
- Tests: R83's existing test (`bio-plane/test/m/membership/module-order.test.mjs`) holds the list equal to `build/modules.json`'s ids in order. It failed on the job branch before the change (reproduced: the plan's red 5) and passes now. No test changed.
- R83 still carries `*(not yet met: T32)*` in `build/requirements/membership.md`; the marker is BOB's to lift at the merge (I do not write requirements).

**Deferred.** None.

**Found in other modules.** A generated artifact is now stale (mechanics §14): the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`). `fleetbundles.test.mjs` fails only its `bio-plane` member ("STALE BUNDLE — the source src/membership/index.mjs has changed"). Regenerate it at L2's close, as in T29. The case-checker `program.mjs` and the installer bundle do not carry `MODULE_ORDER`, so they are not stale.

**Tests and checks** (on `job/T32/membership` @ 81a06a2f3b, from `tranche/T32` a31ca8ac11):
- `node --test bio-plane/test/m/membership/`: tests 139, pass 139, fail 0, skipped 0.
- `node bio-plane/test/members.test.mjs`: 96 pass, 0 fail.
- Users of the list (a provided value changed): `node --test` over the tests of extraction, capture-requests, bias, content, retrieval, connections, plane, progressions, entities, calibration, ai-runs, provenance and promotion: tests 1100, pass 1097, fail 1, skipped 0, todo 2. The one failure is `test/system/row-census.test.mjs` (promotion's), the plan's accepted red 2: the C-130/C-131 rows await promotion's S7. It is not caused by this change. The 2 todo are already-known K102 deferrals.
- `fleetbundles.test.mjs`: fail 1 (the plane bundle is stale, above).
- `node checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `node checks/architecture.mjs … membership`: 23 product files, 59 relative imports; 0 failures.
- `node checks/coverage.mjs … membership`: 79 of 79 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … membership tranche/T32`: 1 file; 0 failures.

Size (session_01Wfr9yNZxkhG7EgTdUKQsMf): test runs 5, module lines 3347
