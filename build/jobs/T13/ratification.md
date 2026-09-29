# ratification (T13)

**Status** · session_01FW1o1n2eXe6NEXbNnBRoE6 · depth 2 · WORKING · handled B1

## Completion

**Applied** (on `tranche/T13` at a53c010cb8): **N251**, ratification's share. `bio-plane/test/m/ratification/checks.test.mjs` (R14) no longer reads the catalogue's emptied `ATTRIBUTION_CHECKS`, nor any named catalogue family. A helper, `catalogueHolding(code, check)`, walks every export of `bio-checks.mjs` that is a row family (an object whose entries carry a `check`), and names each one that holds the moved code or its check id. R14's test asserts it names none, for each of the 16 rows that moved here. A negative control asserts it finds `MACHINE_CANNOT_RELEASE` (C-32.1) in `MACHINE_FENCE_CHECKS`, so the walk is known to see families. This is stronger than before: absence is asserted over every catalogue family and by check id as well as code, and it holds once legacy-checks removes the empty export (T14). Test-only; no source file and no requirement changed.

**Please strike:** nothing. My requirements carry no `not yet met` mark for N251. The two remaining marks (record-core's `textAtSha`; promotion's case-gate registration) are outside this entry.

**Check rows:** none added, moved or retired. Nothing for promotion to stamp (N318).

**Deferred:** nothing.

**Found in other modules** (sent to BOB as a REPORT):
1. **legacy-checks (N251, T14):** nothing reads `ATTRIBUTION_CHECKS` from the catalogue now. The only readers of that name are `test/mk7-attribution.test.mjs`, `test/testify.test.mjs` and `test/testimonyaxis.test.mjs` (legacy-tests), and each defines its own local constant. The empty export at `bio-plane/checks/bio-checks.mjs`:9868 can go, and so can its header (9861–9866, "remains only because ratification's R14 suite still reads it"), which is now stale. `src/gate.mjs`:325 and `test/d470-catalog-census.test.mjs`:395 name it only in historical comments.
2. **civicos-ui and affordances' lists:** no code added or retired, so there is nothing to grep for. `civicos-ui/check-refusal-codes.mjs` names `ATTRIBUTION_CHECKS` only in `RATIFY_ATTRIBUTION_CHECKS` / `ATTRIBUTION_ACT_CHECKS` contexts, so it is unaffected by removing the empty export.
3. **Generated artifacts:** none made stale. No bundle takes a test file. (`bio-plane/dist` and `agent-worker/dist` still carry `var ATTRIBUTION_CHECKS = {}`; that goes with legacy-checks' removal and its rebuild.)

**Read, whole:** `build/requirements/ratification.md`, the layer contracts in `build/layers.md` (table and header sections), my plan entry and N251 in `build/plan/next.md`, and `checks.test.mjs`. I read `src/ratification/checks.mjs` from its row families to its end (1000–1175: the rows and `rowOf` the changed test drives). I did not re-read `index.mjs`, `ops.mjs`, the other test files or the Uses' public parts: this test-only entry touches none of them, and the full module suite is green.

**Tests and checks run**
- `node --test bio-plane/test/m/ratification/checks.test.mjs`: tests 14, pass 14, fail 0.
- `node --test bio-plane/test/m/ratification/`: tests 70, pass 70, fail 0, todo 0.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … ratification`: 11 product files, 45 relative imports; 0 failures.
- `node checks/coverage.mjs … ratification`: 16 of 16 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … ratification tranche/T13`: 1 file changed; legacy-store, legacy-checks and legacy-index 0 lines added or removed; 0 failures.

Size (session_01FW1o1n2eXe6NEXbNnBRoE6): test runs 3, module lines 0 (test lines +12 −2)
