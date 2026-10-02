# membership (T27)

**Status** · session_013WoUArmhh78ngbjAEuCSMa · depth 2 · COMPLETE · handled B0

## Entries applied

- **N520, R83** (re-pin, and nothing else): `MODULE_ORDER` gains `docket` in layer 8, directly after `publication`, so the frozen list again equals `build/modules.json`'s ids in its order (`bio-plane/src/membership/index.mjs`; the header's requirements line names T27's order). The relative order of every other module is unchanged, so no listener anywhere is reordered.
- **Catalogue rows**: none added, so none reads `awaiting stamp` (accepted red 2 has no membership row from this job).
- Read whole for the job: `build/requirements/membership.md`, `bio-plane/src/membership/index.mjs`, `test/m/membership/module-order.test.mjs`. Uses' public parts and the other test files were not re-read: the entry changes one constant and no service's behaviour. No flaw found in the module.

## Deferred

- None.

## Found in other modules (REPORT J1)

- **Generated artifact staled (§14)**: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`); `src/membership/index.mjs` is one of its inputs. `test/system/fleetbundles.test.mjs` names it STALE (the bio-plane arm fails). Not regenerated: BOB's at the layer close.

## Tests and checks

- `node --test test/m/membership/ test/members.test.mjs` (in `bio-plane/`): tests 140, pass 140, fail 0, skipped 0. R83's tests (`module-order.test.mjs`, and `t9-notice-sight-bounds.test.mjs`'s order check) were red against the tranche (docket in `modules.json`, not in the list) and pass now.
- Every test file that imports `MODULE_ORDER` outside this module (extraction, bias, content, retrieval, connections, plane, progressions, entities, calibration ×2, ai-runs, provenance ×2) and `test/m/promotion/`, with this module's: tests 412, pass 412, fail 0, skipped 0.
- `fleetbundles.test.mjs`: bio-plane arm fails, the plane bundle staled (above); the worker arms pass.
- `node checks/format.mjs`: 92 modules, 91 requirements files; 0 failures.
- `node checks/architecture.mjs … membership`: 23 product files, 59 relative imports; 0 failures.
- `node checks/coverage.mjs … membership`: 79 of 79 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … membership tranche/T27`: 1 file changed; 0 failures.

Size (session_013WoUArmhh78ngbjAEuCSMa): test runs 4, module lines 3345

## J1 · REPORT

Generated artifact staled (§14): the plane bundle bio-plane/dist/bio-plane.bundled.mjs (and .bundle.json); src/membership/index.mjs is one of its inputs. test/system/fleetbundles.test.mjs names it STALE (bio-plane arm). Not regenerated: yours at the layer close.
