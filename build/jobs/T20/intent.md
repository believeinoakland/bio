# intent (T20)

**Status** · session_01AdQB6kuVBTULWvFkfsGMY2 · depth 2 · COMPLETE · handled B0

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

## J2 · COMPLETE

Job done on `job/T20/intent` (pushed, commit 9dae214390).

**Entry applied** (`build/plan/current.md` T20 L7; B1; K899 (3), N317):
- `bio-plane/src/intent/grammar.mjs`: deleted the `workproduct_state` arm, the `evaluations` arm, the C-9.1 readiness ladder and `WORKPRODUCT_STATES`. Also removed the now-unused `ISO_TS_RE` import and the repairs branch of the finding shape.
- Kept: the `closed_reason` arm, `CLOSED_REASONS`, R1's objective arm, and `PROJECT_GRAMMAR`'s ids `["C-2.9", "C-9.1"]`.
- `src/intent/index.mjs`:50: deleted the `WORKPRODUCT_STATES` re-export. I re-scanned `bio-plane/src`, `agent-worker/` and `civicos-ui/` first. Nothing outside intent's paths imports it; civicos-ui's `app.html` holds its own constant (see REPORT J1).
- Headers in `index.mjs`, `checks.mjs` and `grammar.mjs` re-worded to the new R29.
- `test/m/intent/grammar.test.mjs` re-keyed to the new R29:
  - :75 and :96 became "a project carrying any workproduct_state / any evaluations, well-formed or not, draws no finding from this grammar". They cover every old rung and bad value at every state, every shape the old arm refused, null entries and non-lists, through `checkBundle` and the arm alone. The workproduct test also checks that the module exports no rung list.
  - :141 became "no C-9.1 finding at any rung", over 80 rung-by-pass combinations.
  - :128 is unchanged.
  - :167 became "the closed_reason finding is this grammar's only finding".
  - The audit test (:196, not named in B1, but its C-9.1 tally of 3 depended on the ladder) now expects no C-9.1 tally. It counts the `closed_reason` arm and R1's arm.
  - New test for R29's "neither refused nor corrected": a project carrying the retired fields, ill-formed or not, revises through promotion and is kept byte for byte.
  - Negative control: with the old `src/intent/` restored, the five re-keyed or new grammar tests fail and the other four pass.

**Promotion's stamp:** no row change, but a check's behaviour changed (C-2.9's arms and C-9.1). This is **awaiting stamp (behaviour, no row)** for the next promotion job.

**Deferred:** none.

**Found in other modules:** see REPORT J1. In short:
- the plane bundle is stale;
- no test in `test/m` goes red;
- legacy-tests' `check-firing.test.mjs` :245 and :275 still prove the retired arms, and that suite is already unrunnable;
- record-grammar (C-6.3 at `bundle.mjs`:520, and the slot's C-9.1), reevaluation (`index.mjs`:309), legacy-ui (UI-16 ladder) and queue (a comment) still read the retired fields.

**Tests and checks run:**
- `node --test bio-plane/test/m/intent/`: tests 60, pass 60, fail 0.
- Whole `bio-plane/test/m`: tests 4628, pass 4608, fail 0, skipped 0, todo 20. Baseline at the branch head without my change, run side by side: 4627 tests, fail 1. That failure is "R2 a tree a test left read-only is removed…", which concerns no intent file and passed in my run, so no new red.
- Layer tests: none named in the manifest.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … intent`: 13 product files, 49 relative imports; 0 failures.
- `node checks/coverage.mjs … intent`: 30 of 30 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … intent tranche/T20`: 5 files changed by intent; 0 failures.

Size (session_01AdQB6kuVBTULWvFkfsGMY2): test runs 5, module lines 1926
