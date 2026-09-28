# ai-runs (T7)

**Status** · session_017wY8RRGdm6dDyCdnDA4n5k · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two entries I cannot apply inside my paths; my best readings, on which I carry on:

1. **N69 (delete my copy of `searchedSection`).** No other module holds a copy yet: `case-authoring` (layer 8) is unextracted, and the one live caller is `store.mjs` 360/7989 (`#searchedForCase`) importing it from `airun.mjs`. Deleting it breaks legacy-store, and I may not add the function there (§12.2: only imports and calls). Reading: K78 (3)'s pattern already fits — the earlier module (ai-runs) keeps the copy and case-authoring re-exports it at its extraction, then the copy leaves. So I keep `searchedSection`, `SEARCHED_LEVEL_OUTCOMES` and the `SEARCHED_SUBJECT_SOURCES` re-export in `airun.mjs`, untouched, and record N69's share as deferred to case-authoring's job (it should carry the delete as its own entry). I will move them into a separate file of my paths only if you say so.

2. **D-375.** Its built work (`land/worker/D-375` @ 9a5df6e6: bdc133ff) changes `contentObservationsFor` (observation-log's since K78 (3); my copy is deleted by N49) and the acquire assembly in `bio-plane/src/index.mjs` (legacy-index/extraction), plus `nc-d375.mjs` and `observation-content.test.mjs` (legacy-tests). None of it is ai-runs' code; my requirements' Status already says "D-375 is observation-log's (K82 (5))". Reading: nothing of D-375 is mine to build; I record it as not applicable here and it needs an entry for observation-log (the producer) and extraction (the reading's character count).

## J2 · REPORT

EXTRACTION #2 J2.1 (the workbook sentence): my copy (`airun.mjs` 330, 475) goes with N49's deletion. **observation-log**'s own copy carries the same stale sentence: `bio-plane/src/observation-log/vocabulary.mjs` 416 ("a workbook has no unit arm ... nothing yet writes its units into the index") and the `CONTENT_AXIS_STATES.indexed_none` text ("this container has no unit arm"), stale since D-672 is whole (K179). It is observation-log's to correct (an entry for its next job).

## J3 · QUESTION

Four points where my build touches another module's paths or names a new service. My best reading of each, which I build on now:

1. **`bias/interim.mjs` (K146).** Deleting it also needs `bio-plane/src/bias/index.mjs` line 39 (`export { aiRunWorkProducts } from "./interim.mjs"`) and bias's own test `bio-plane/test/m/bias/debt.test.mjs` (its import at line 5 and the test "R33 (interim)" at 280) changed — both bias's paths. Reading: ai-runs registers its own work products with `bias.registerWorkProducts("ai-run", …)` from its factory (R30), in the shape the adapter answers today (`list`, `read`, `visible`), so the store stops calling `aiRunWorkProducts`; I delete `interim.mjs` only if you allow me the one line in `bias/index.mjs` and that one test (it moves, reworded against my registration, into `test/m/ai-runs/`). Otherwise I leave all three in place, unused, and bias's next job (or a CHANGE) removes them.

2. **R16–R17's wait source (proposed Provides text, for capture-requests).** "**registerWaitSource(module, source)** For `capture-requests` (K71). `source` is `{ tickMs(), holds(iso, limit) → [{run, outstanding}], woken(limit) → [run], completions(run, limit) → [{request, state}], markWoken(requests, iso) }`, all synchronous; `holds` counts requests outstanding and unexpired for running runs, `woken` names running runs with completions not yet woken, `markWoken` stamps them inside the wake's transaction. One registration; a second is refused `WAIT_SOURCE_DECLARED`, a malformed one `WAIT_SOURCE_MALFORMED`." Until capture-requests merges, legacy-store registers it with the four `capture_requests` reads the wake makes today (the K31 pattern), so the wake keeps working on the tranche branch.

3. **R37, contradiction's run gate.** Contradiction's job has not named its registration yet. I will offer from R28 and R5 `runGate(run, viewer, caller) → {found, running, refusal}` (`found` false for blank, absent or invisible alike; `refusal` null or R5's `AI_RUN_NOT_PRINCIPAL` object) and register it under whatever name contradiction's R21 states; please relay the name, or tell contradiction to take it by `aiRunsOf(ctx).runGate` — which I'll export either way.

4. **R40.** (a) The one deployment order: `DEPLOYMENT_SEQUENCE` (with `GATE_ADDRESS`, `SEQUENCING_SOURCE`, `SEQUENCING_ALSO_NAMED_IN` it references) copied whole into `bio-plane/src/ai-runs/deployment.mjs`, plus `DEPLOYED_MODES` = the order's first member while `verification_recorded` is null; skills and agent-worker re-export from there in their jobs (K107, K78 (3)). (b) The code is `AI_RUN_MODE_NOT_DEPLOYED`, a row in my own family `AI_RUN_OPEN_CHECKS` held in the module (K174's precedent), new C-number C-22.17 unless you want a fresh family. (c) An absent or blank `mode` is refused too: "no run exists in a mode not deployed" and a run with no mode is not in a deployed one. This changes every opener that sends no mode (old battery, agent-worker's plane mocks) — say if you read it the other way.
