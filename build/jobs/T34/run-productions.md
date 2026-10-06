# run-productions (T34)

**Status** · session_01XYgGBGhRvjEuFN3iKFUv7K · depth 2 · WORKING · handled B0

## Completion (T34-73)

**Entries applied.**
- **N627** (K1708; test-only, no requirement change): the fixture's stub `inquiry_basis` (`test/m/run-productions/fixture.mjs`) now holds every column, and the primary key, of leg-earning's table (its R12; `src/leg-earning/schema.mjs`). Before, it held six columns. When the real strength and citation reach inquiry, leg-earning's own migration runs `CREATE INDEX … ON inquiry_basis(grade_source, bundle_id)`, and that failed with `no such column: grade_source`. This was the inherited red "run-productions R3 fixture" (`R3 through the extracted providers…`). The fixture's header now names leg-earning R12, not inquiry R40, as the table's read contract. The R12 ratio test's hand-written leg row now carries `target_type`, which the table requires.

**Product code.** Unchanged. `bio-plane/src/run-productions/` is untouched, and the behaviour the test checks is the same.

**Deferred.** None.

**Found in other modules.** None. No generated artifact is stale: only test files changed.

**Tests and checks.**
- run-productions: 39 pass, 0 fail (was 38/1, with R3 red).
- Layer tests: none are named in `build/manifest.md`. No service I provide changed, so no user module's tests needed re-running.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture run-productions`: 8 product files, 41 relative imports; 0 failures. `coverage run-productions`: 20 of 20 live requirement ids named by a test; 0 failures. `ownership run-productions tranche/T34`: 3 files changed; 0 failures.

Size (session_01XYgGBGhRvjEuFN3iKFUv7K): test runs 4, module lines 1358
