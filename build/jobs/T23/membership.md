# membership (T23)

**Status** · session_01UieGEn5zodaDfjfxn2t4E5 · depth 2 · COMPLETE · handled B2

## Work

**Entry applied (T23 L2; K1043, K1058, DEC-111 fold 1b, K1113).** `MODULE_ORDER` (`bio-plane/src/membership/index.mjs`) gains `corpus-export` after `case-grammar` (the file's index 55) and `network-notices` after `project-stage` (index 59), both on the `/* 8 */` line, which now wraps; R83's list equals `build/modules.json` again (87 ids). The header's requirements line names the T23 change. Nothing else in the module changed; no requirement carried a T23 mark and none was added.

**Read whole:** `roles/JOB.md`; `build/requirements/membership.md`; the public parts of record-grammar, signatures, record-core and test-support; `build/layers.md`; `build/plan/current.md`; the module's code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every test under its `tests` paths.

**Deferred:** none. **Found in other modules:** none beyond the stale plane bundle, below.

**Generated artifact staled (reported, not regenerated):** `bio-plane/dist/bio-plane.bundled.mjs` and its manifest carry `MODULE_ORDER`; `node --test bio-plane/test/system/fleetbundles.test.mjs` names the plane bundle STALE (source `src/membership/index.mjs` changed), accepted red 11, until L2's close regenerates it.

## Proof

- `node --test bio-plane/test/m/membership/`: tests 139, pass 139, fail 0 (R83 `module-order.test.mjs` and R79 `t9-notice-sight-bounds.test.mjs` green: accepted red 2's membership share cleared).
- `node --test bio-plane/test/members.test.mjs`: tests 1, pass 1, fail 0.
- `node --test` over every `bio-plane/test/m/**/*.test.mjs` (605 files, the users' suites that import `MODULE_ORDER` among them): tests 5018, pass 5005, fail 1, todo 12. The one red is control-plane `inbox-door.test.mjs`:81 (R36), accepted red 9. Promotion's `registry.test.mjs` (R39, R45, R46) is green; row-census reported no failure in this run.
- `fleetbundles.test.mjs`: the plane bundle STALE, as above (accepted red 11).
- Checks: format `87 modules, 86 requirements files; 0 failures`; architecture `23 product files, 59 relative imports (0 naming no tracked file, not judged); 0 failures`; coverage `1 modules, 79 of 79 live requirement ids named by a test; 0 failures`; ownership `1 files changed by membership between tranche/T23 and HEAD; 0 failures`.

Size (session_01UieGEn5zodaDfjfxn2t4E5): test runs 4, module lines 3

## J1 · REPORT

Reds after my change, as you asked: test/m (605 files) 5005 pass, 1 fail, todo 12; the one red is control-plane inbox-door.test.mjs:81 (R36), accepted red 9. Promotion registry.test.mjs (R39/R45/R46) green. Stale artifact: bio-plane/dist/bio-plane.bundled.mjs carries MODULE_ORDER, so fleetbundles.test.mjs names the plane bundle STALE (src/membership/index.mjs changed), accepted red 11, until L2's close regenerates it; I regenerated nothing.

## J2 · COMPLETE

MODULE_ORDER gains corpus-export (after case-grammar) and network-notices (after project-stage), layer 8; R83 equals modules.json (87). Accepted red 2's membership share cleared: membership 139/139 (R83, R79 green), members.test.mjs green, promotion registry green. test/m one red, accepted red 9. Plane bundle stale (accepted red 11), not regenerated. Four checks 0 failures. Commit f10ee82772; record build/jobs/T23/membership.md. Ready to merge first in L2.
