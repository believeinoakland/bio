# membership (T28)

**Status** · session_014t8ory3KuXTmiZLiSDLmaB · depth 2 · COMPLETE · handled B1

## Entries applied

- **L2, R83** (re-pin, and nothing else; K1292, K1299): `MODULE_ORDER` gains `accepted-work` in layer 6 directly after `inquiry-grammar`, and `case-checker` and `case-import` in layer 8 directly after `ratification`, so the frozen list again equals `build/modules.json`'s ids in its order (`bio-plane/src/membership/index.mjs`). The relative order of every other module is unchanged, so no registered listener anywhere is reordered.
- The file header's requirements line names T28's order; that header's two over-long lines (168 and 148 characters) are rewrapped to the file's 120-column width. No behaviour changed.
- **Catalogue rows**: none added, as B1 expected.
- Read whole for the job: `build/requirements/membership.md`, `bio-plane/src/membership/index.mjs`, `schema.mjs`, `checks.mjs`, `test/m/membership/module-order.test.mjs`. The other test files and the Uses' public parts were run or relied on, not re-read: the entry changes one constant and no service's behaviour. No flaw found in the module.

## Deferred

- None.

## Found in other modules (REPORT J1)

- **Generated artifact staled (§14)**: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`); `src/membership/index.mjs` is one of its inputs. `test/system/fleetbundles.test.mjs` names it STALE BUNDLE (bio-plane arm, 1 fail). Not regenerated: BOB's at the layer close.

## Tests and checks

- `node --test test/m/membership/ test/members.test.mjs` (in `bio-plane/`): tests 140, pass 140, fail 0, skipped 0. R83's test `module-order.test.mjs` was red against the tranche (pass 2, fail 1: three ids in `modules.json` missing from the list) and passes now.
- Every module whose source or tests import `MODULE_ORDER` (extraction, capture-requests, bias, content, retrieval, connections, plane, progressions, entities, calibration, ai-runs, provenance) and `test/m/promotion/`: tests 1075, pass 1073, fail 0, skipped 0, todo 2 (calibration's R26 and R32, deferred by K102, unchanged).
- `fleetbundles.test.mjs`: 1 fail, the plane bundle staled (above).
- `node checks/format.mjs`: 95 modules, 94 requirements files; 0 failures.
- `node checks/architecture.mjs … membership`: 23 product files, 59 relative imports; 0 failures.
- `node checks/coverage.mjs … membership`: 79 of 79 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … membership tranche/T28`: 1 file changed by membership; 0 failures.

Size (session_014t8ory3KuXTmiZLiSDLmaB): test runs 7, module lines 3346

## J1 · REPORT

Generated artifact staled (§14): the plane bundle bio-plane/dist/bio-plane.bundled.mjs (and .bundle.json); src/membership/index.mjs is one of its inputs. test/system/fleetbundles.test.mjs names it STALE BUNDLE (bio-plane arm, 1 fail). Not regenerated: yours at the layer close.
