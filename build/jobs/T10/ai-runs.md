# ai-runs (T10)

**Status** · session_01Lf2oaaWKpeoh6vqGBqaUst · depth 2 · COMPLETE · handled B2

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

## J3 · COMPLETE

**Entries applied** (plan: the ai-runs bullet, layer 6; `job/T10/ai-runs` @ 6038db2952, with `tranche/T10` merged at dd84254dbb):
- **N138** (my share): `airun.mjs`' copy of `searchedSection`, `SEARCHED_LEVEL_OUTCOMES` and the `SEARCHED_SUBJECT_SOURCES` re-export is gone, along with the import only it used. `case-authoring` holds them.
- **N190**: the disposition for `ai_runs.rerun_of` is "published". R19's `session` adds `rerun_of` after `state`. It carries the earlier run's id only when the viewer can see that run, through the same sight check. Otherwise it is null, so a run that re-runs nothing and one whose earlier run is out of view answer alike. `op=airuns` carries it per row, since each row is the read.
- **N191, N276**: `hiddenRuns(viewer)` (R42) is a module-level export. It is the one tail and the one place the subtraction is written. A run's rows are kept only when R19 would answer `found: true`, so it is compiled from `runSight`. `runSight` is now the single spelling of run sight, shared by `read`, `log`, `spawnPayload`, `listInContext`, the tick and close, `runFor` and `hiddenRuns`. A machine credential gets the empty tail; an absent or unrecognised viewer loses every run. The module registers `hiddenRuns` with retrieval (R57) itself, and the instance method `hiddenRunTail` is gone. Per K333 there is also `hiddenRuns(viewer, column)`: the same predicate and args over a plain-identifier column. Any other column gets ` AND 0=1` and is never interpolated.
- **N223** (my share): `onRunOpened(module, fn)` (R43). It is refused through membership's `listenerRefusal`, and listeners are held in `MODULE_ORDER`. After an open's transaction commits, each listener is called once with `{run, contextType, contextId, expires}`. A listener that throws or rejects is isolated; the answer and the run are unchanged, and a refused open notifies nobody.
- **K316, K313**: the module's test world now answers a workerd-shaped cursor and refuses LIKE/GLOB patterns over 50 bytes. Every used module ran green on it. The module itself uses no pattern.

**Deferred:** none.

**Found in other modules:** my J2 REPORT covers them. In brief: two stale bundles; legacy-tests re-anchors in casesearched, observation-log J1/J5b, observation-content J5 and run-conditions W3/W3b; the DEC-49 guard's arm E floor 22/114 → 20/108; stale `not yet met` marks in my requirements; and legacy-store's never-sent-viewer convention.

**Tests and checks:**
- `node --test test/m/ai-runs/`: pass 46, fail 0, todo 0. It was 41/0 at the start. New: `hidden-notices.test.mjs` covers R42 in both forms, each against R19 for every viewer kind × run, plus R43 and R44. R19 gains `rerun_of`. R36 is now tested through retrieval's door.
- Users of ai-runs (`read` and the tail changed): run-productions 33/0, capture-requests 53/0, skills 29/0, intent 35/0, scheduler 46/0 (6 todo), queue 10/0, agent-worker 139 passed and 0 failed.
- Close providers and readers: case-authoring 38/0, retrieval 61/0 (1 todo), observation-log 43/0, bias 48/0 (1 todo).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … ai-runs`: 15 product files, 59 relative imports; 0 failures.
- `node checks/coverage.mjs … ai-runs`: 44 of 44 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … ai-runs tranche/T10`: 7 files changed by ai-runs; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01Lf2oaaWKpeoh6vqGBqaUst): test runs 9, module lines 4117
