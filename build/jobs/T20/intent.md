# intent (T20)

**Status** · session_01AdQB6kuVBTULWvFkfsGMY2 · depth 2 · RUNNING until 2026-10-01T15:41:48Z (node --test test/m (mine and baseline)) · handled B0

## J1 · REPORT

Found in other modules while applying B1 (K899 (3)). None of these files was edited.

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`). The bundle carries `src/intent/grammar.mjs`, which this job changed. Regenerate it at layer close.
2. **Tests in other modules that expect a C-2.9 or C-9.1 finding over `workproduct_state` or `evaluations`:** I re-scanned `bio-plane/test/m`.
   - record-grammar's `fixtures/expected.json`, `fixtures/bundles.mjs` and `bundle.test.mjs`, and record-core's `record-core.test.mjs`, all claim the slot with stub grammars (`stub-project`, `"C-9.1 arm ran"`), never with intent's arm. They are not affected and stay green.
   - Outside `test/m`: legacy-tests' `bio-plane/test/system/check-firing.test.mjs`. At :245 it proves C-2.9 on `workproduct_state: bogus`, and at :275 it proves C-9.1 on the ladder. That suite already cannot run, because it imports the deleted `checks/bio-checks.mjs`. It is not deleted (K619).
   - The whole of `test/m` shows no new red: 4628 tests, 0 failures.
3. **Other modules still read the retired fields** (Bob K899 (3): `workproduct_state`, `evaluations` and C-9.1 retire, and stage and readiness are computed, `project-stage` R2–R4). These are for their owners' next jobs:
   - record-grammar `src/record-grammar/bundle.mjs`:520–522: the C-6.3 arm still raises "workproduct_state is distributed but distributions/ is empty". Its `EXTENSION_ARMS` slot (:685) still lists C-9.1, which you already planned to drop next tranche.
   - reevaluation `src/reevaluation/index.mjs`:309–311 reads `workproduct_state` `retracted`/`redistributed` on a project target.
   - legacy-ui `civicos-ui/app.html`:1963–1976, :8913–8924 and :9399 draw the readiness ladder from `workproduct_state` and `evaluations` (UI-16). `civicos-ui/check-semantics.mjs`:293–310 pins `WORKPRODUCT_STATES` against the deleted catalogue, and so do legacy-tests' `civicos-ui/test/project-workspace.test.mjs` and `identifier-vocabulary.test.mjs`.
   - queue `src/queuestate.mjs`:87 has a comment about the `workproduct_state` half.
