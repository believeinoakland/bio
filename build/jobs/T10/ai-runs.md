# ai-runs (T10)

**Status** · session_01Lf2oaaWKpeoh6vqGBqaUst · depth 2 · WORKING · handled B2

## J1 · QUESTION

R42's shape (N191, N276). My reading, which I am building now:

`hiddenRuns(viewer) → {sql, args}` is the WHERE tail over `observation_log` that retrieval R57 takes (it starts ` AND `, keyed on `authority_kind = 'run'` and `authority`): a run's rows are kept only when the run is in R19's sight, compiled from the same gate R19, runFor and the tick/close use (one spelling), so it also drops rows of runs over a context bundle the viewer cannot see or that no longer exists, exactly as R19 does. A machine credential (membership's `member` scope) gets the empty tail; an absent (`undefined`/`null`) or unrecognised viewer drops every run's rows. The instance method `hiddenRunTail` goes; the module registers `hiddenRuns` itself with retrieval.

The open point, for legacy-store (layer 10): its `#hiddenSets` also filters `ai_run_bounds` by `run` (op=stats' `aiRunBounds`), which a tail over `observation_log` cannot express. I propose an optional second argument, `hiddenRuns(viewer, column)`: with a column name it answers ` AND COALESCE(<column>, '') IN (<the runs in sight>)` over that column, the same predicate and args; without one, the `observation_log` form. It is additive (R57's call is unchanged). I have NOT built it; say yes and I add it with its test, or no and legacy-store keeps its own run-key filter. Nothing else waits on this.

## J2 · REPORT

These are things this job made stale or found in other modules and in my requirements file. I changed none of them. Measured on `job/T10/ai-runs` @ 6038db2952 against `origin/tranche/T10` @ its head.

1. **Generated artifacts made stale** (mechanics §14). `fleetbundles.test.mjs` names:
   - `bio-plane/src/airun.mjs` for `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owner `agent-worker`);
   - `bio-plane/src/ai-runs/index.mjs` for `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` (owner `not_product`).
   Both were already stale on the tranche (inquiry's early merge). The fail count is the same, 6 both ways. Regenerate at the layer's close.
2. **legacy-tests: suites that pinned what my entries change.** Each is red here and green (or less red) on the tranche:
   - `test/casesearched.test.mjs` does not load: it imports `searchedSection` and `SEARCHED_LEVEL_OUTCOMES` from `src/airun.mjs`. N138 removed them; they are `case-authoring`'s (`src/case-authoring/index.mjs` exports both). It was 26/0.
   - `test/observation-log.test.mjs` J1: 128/3 (129/2 on the tranche). A DENY caller's frontier tally is no longer the whole log's: R42 drops every run's rows for an absent or unrecognised viewer, where the old tail dropped only project runs. J1's fixture holds inquiry runs, so its precondition (J5: "D-486 subtracts nothing at this fixture") no longer holds for a DENY caller. J5b counts the old registration spelling `(viewer) => this.hiddenRunTail(viewer)`; it is now `retrieval.registerHiddenRunTail("ai-runs", hiddenRuns)`, and the subtraction is written once, in `hiddenRuns` (R42).
   - `test/observation-content.test.mjs`: same count (74/1) both ways. Its J5 census pins the same registration spelling and needs the same re-anchor.
   - `test/run-conditions.test.mjs` W3 and W3b: 54/5 (56/3 on the tranche). The `ai_runs` reader walk no longer finds a method `hiddenRunTail`. It finds the module-level `hiddenRuns` function and names it `if`, because it reads only class methods. The column-disposition matrix (N190) can now take `rerun_of` as published by R19's read, visible only when the viewer sees the earlier run.
   - DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`): 80 failures, against 79 on the tranche. The new one is arm E: 20 vocabularies and 108 terms, against floors of 22 and 114. The two it lost are `SEARCHED_LEVEL_OUTCOMES` (5) and the `SEARCHED_SUBJECT_SOURCES` re-export (1), which N138 moved out of `airun.mjs`. Arm E harvests only two modules, so it no longer sees them in `case-authoring/searched.mjs`. arm C's lines total moved from 7163 to 7170. No code, row or region changed.
3. **Stale marks in `build/requirements/ai-runs.md`** (yours to strike):
   - R19 (N190), R42 (N191, N276, with K333's column form) and R43 (N223) are met now, each tested at the interface.
   - R17, R30, R36, R37 and R40 still carry `not yet met` marks, as does the header's list. The code meets each, and each has a passing test (scheduler R17; producers R30, R36, R37; open R40). The header's "Code today" and "Size" paragraph also predates the extraction.
   - R44 was already met (`DEPLOYMENT_SEQUENCE`, `GATE_ADDRESS`) and is now named by a test.
4. **legacy-store (layer 10), for N191.** `hiddenRuns(viewer)` differs from `#hiddenSets` on the never-sent viewer. R42 fails closed on `undefined`; `#hiddenSets` treats it as a direct internal call and stays whole. When legacy-store reads R42 it keeps that convention on its side, by not asking for an internal call. `hiddenRuns(viewer, "run")` is the form for its `ai_run_bounds` count (K333).
