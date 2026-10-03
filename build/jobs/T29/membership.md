# membership (T29)

**Status** · session_016G62nZSnbukEEdrMHSsV1z · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied.** `build/plan/current.md` (T29) L2, membership: R83 (N529, N532; K1332, K1333, K1336), per B1.
- `bio-plane/src/membership/index.mjs`: `MODULE_ORDER` gains `case-carriage` directly after `corpus-export` (before `publication`) and `case-disclosures` directly after `case-import` (before `case-authoring`), both in layer 8. Nothing else changed.
- Tests: R83's existing test (`bio-plane/test/m/membership/module-order.test.mjs`) holds the list equal to `build/modules.json`'s ids in order; it failed on the tranche base (reproduced) and passes now. No test changed.

**Deferred.** None.

**Found in other modules.** Generated artifact staled (mechanics §14): the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) — `fleetbundles.test.mjs` fails only its `bio-plane` member arm ("source src/membership/index.mjs has changed"), and passes 1/0 on the tranche base without my change. Regenerate at L2's close. The case-checker `program.mjs` and the installer bundle do not carry `MODULE_ORDER` (not stale).

**Tests and checks** (on `job/T29/membership` @ tranche/T29 ac65405d7d):
- `node --test bio-plane/test/m/membership/ bio-plane/test/members.test.mjs`: tests 140, pass 140, fail 0, skipped 0.
- Users of the list (a provided value changed): `node --test` over `test/m/` of extraction, capture-requests, bias, content, retrieval, connections, plane, progressions, entities, calibration, ai-runs, provenance, promotion, control-plane: tests 1228, pass 1226, fail 0, skipped 0, todo 2 (pre-existing K102 deferrals, not mine).
- `fleetbundles.test.mjs`: fail 1 (the plane bundle, stale, above).
- `node checks/format.mjs`: 97 modules, 96 requirements files; 0 failures.
- `node checks/architecture.mjs … membership`: 23 product files, 59 relative imports; 0 failures.
- `node checks/coverage.mjs … membership`: 79 of 79 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … membership tranche/T29`: 1 file; 0 failures.

Size (session_016G62nZSnbukEEdrMHSsV1z): test runs 9, module lines 3347
