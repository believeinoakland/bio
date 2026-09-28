# ai-runs (T7)

**Status** · session_01WypBtD6YhawXPvfZkGWd5r · depth 2 · COMPLETE · handled B9

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

## J4 · BLOCKED

Cause: **context**. Past half my window (≈450k of 1M); per JOB.md I stop at a clean step. Branch `job/T7/ai-runs` @ 0639b37349, pushed. Please restart me; my successor continues from this entry.

**Done (committed):**
- **N49**: `airun.mjs` 2,551 → 1,088 lines; 106–1404 and 1931–2139 replaced by a re-export of observation-log's `vocabulary.mjs` (37 names; every importer keeps its names). The workbook sentence J2.1 named left with it (observation-log's own copy: my J2).
- **Extraction core**: `bio-plane/src/ai-runs/` — `index.mjs` (the store's run code, 29540–31589 less `#obligationsBiasDebt`, moved with helpers routed to membership/connections/bias/observation-log factories; public names `open`, `tick`, `close`, `read`, `listInContext`, `spawnPayload`, `log`, `reap`/`reapDue`/`reapWake`, `wake`/`wakeDue`/`wakeWake`, plus `runFor`, `boundOf`, `consumeBound` (R28–R29), `runGate` (R37's offer), `hiddenRunTail` and `surfacedIn` (R36, R27), `workProducts` (R30), `registerWaitSource` (R16–R17), `migrate` (R38, with the `ai_run_log` fold and the two late columns)); `schema.mjs` (the three tables; `schema.mjs` interpolates it, bias's precedent); `skill-version.mjs` (R8's copy of `checkSkillVersion`/`parseSkillVersion`). Factory `aiRunsOf(ctx, env)`; its constructor declares its purge (R38) and registers observation-log's `run` resolver, retrieval's hidden-run tail and `surfaced_in` decoration, and bias's `ai-run` work products.
- **legacy-store**: 2,278 lines removed, 60 added — delegates under the old op names and `#aiRunInSight`; scheduler consumers call `aiRunsOf`; the store's `surfaced_in` keeps only inquiry's migration arm; a `capture_requests` wait source registered until capture-requests (J3 point 2); `#hiddenRunTail` and the store's run resolver and work-products registration gone (the store no longer calls `bias/interim.mjs`).
- Smoke-driven at the interface over node:sqlite (`test/m/ai-runs/world.mjs`): open → tick → close → read → log → runFor → reap all answer as before.

**Checks:** format 0 failures. architecture 1: `ai-runs/index.mjs` imports `bio-plane/src/tokens.mjs` (runtime-limits: `sha256hex`, `instanceAiCredential`, `instanceClaudeToken`, which R18's resume needs) — **please add `runtime-limits` to ai-runs' uses**. ownership 2, for your review: `store.mjs` 768–769 (the decoration keeps only inquiry's migration arm) and 1354–1384 (the interim wait source, the K31 "legacy-store registers until" pattern, K178's precedent).

**Next, for my successor, in order:**
1. Apply BOB's answers to J1 and J3 (N69 / D-375; interim.mjs deletion; wait-source name; contradiction's gate name; R40).
2. The surfacing step (R25–R26): move `#surfacingGate` (store ~14513) and the row + `surfaces` consumption inside `#promoteProjections` (~15685) into a step registered with `promotion.registerStep("ai-runs", …)`; the store's `surfaced_in` on the promote reply comes from it.
3. The checks (R35): move C-22.5, .7, .8, .11–.16, C-33.29–.31, .45–.47, C-36.1–.3, C-66.1–.4 into `ai-runs/checks.mjs` (bias's precedent; `airun.mjs` keeps exporting a merged `AI_RUN_CHECKS`; observation-log's seven C-22 rows stay in the catalogue for its next job), `where`s naming the new sites; report `CATALOG_VERSION` to promotion.
4. R40 (per J3's answer): `ai-runs/deployment.mjs` and the refusal at open after R8.
5. The ops (K3): an `aiRunsOps` table for `airunspawn`, `airunopen`, `airuntick`, `airunclose`, `airun`, `airunlog`, `airuns`, the store's dispatch entries then calling it.
6. Tests under `test/m/ai-runs/` naming every live id R1–R40 (world.mjs is there); run the module's tests, then the four checks (coverage not yet run).
7. Record: legacy-tests reds known so far — `airun.test.mjs` 131/3 (2 red on the base; ARM R4c reads `checkCondition`'s source in `airun.mjs`, now observation-log's). Size line.

## J5 · QUESTION

Four points from B6 and B7 where a Provides line or a row's owner changes. I have built each on the reading below (branch `job/T7/ai-runs` @ 9cbe2e5350); say if you read any other way.

1. **R28 (B7, capture-requests' use).** capture-requests reads `principal_claude` from `runFor` (it records the paying level on the request). Proposed R28 text: "`runFor` answers `{run, status, mode, context_type, context_id, principal_plane, principal_claude}` for a held run the viewer can see, and null for a blank id, an absent run or an invisible one alike; it never throws and writes nothing. Whether the caller holds the run is R5 over `principal_plane`."
2. **R18 (B6 (2)).** Proposed replacement of its last two sentences: "A dispatch waits at most 30 s (configurable) for the answer. One refused, or one whose call did not complete, appends a log entry saying the run is still resumable; one with no answer by the bound is `RUNNING` (the segment answers when it ends), appends nothing and counts as dispatched. The credential's value never enters the record."
3. **R19 (B6 (3)).** Proposed addition to `session`: "`state`, the run's resumable scratch as its last tick wrote it (R12), or null when it cannot be read back; never a transcript (DEC-61)." This lets N153 close.
4. **C-22.7: two requirements claim the row.** My R35 lists C-22.7 "with `checkSkillVersion`, K82 (4)"; skills' R25 says the row moves to skills, and merged skills (`skilldoctrine.mjs` 86–99) reads it from the catalogue's `AI_RUN_CHECKS` at load, so removing it there stops the plane loading (measured: capture-requests' plane suite, the whole plane). Reading: the row stays in the catalogue for now; ai-runs holds the predicate (R8) and names the row there (never a copy); R35 drops C-22.7 and skills' R25 keeps it. Also: `skillpack.mjs` 546 still holds its own `checkSkillVersion` rather than re-exporting ai-runs' (R8: "re-exported by `skills`"); that is skills' to change.

## J6 · COMPLETE

Branch `job/T7/ai-runs` @ 58a32f8b1f, pushed; `tranche/T7` merged in (K194, @ 2acdb91ed4).

**Entries applied** (plan T6-6; J4's list, B2–B8)
- **Extract per map and requirements.** Done by AI-RUNS #1 (J4): the run's mechanism in `src/ai-runs/index.mjs` and `aiRunsOf(ctx, env)`; the tables in `schema.mjs`; `checkSkillVersion` in `skill-version.mjs`. Added in this job:
  - **The surfacing step (R25–R26).** `#surfacingGate` and the surfacing row plus the `surfaces` spend are a step registered with `promotion.registerStep("ai-runs", …)`. Its projection answers `surfaced_in`. The store's gate and its projection block are gone.
  - **The checks (R35).** C-22.5, .8, .11–.16, C-33.29–.31 and .45–.47, C-36.1–.3 and C-66.1–.4 moved from the catalogue into `src/ai-runs/checks.mjs` with their `where`s re-pointed; `airun.mjs` still exports one merged `AI_RUN_CHECKS`. C-22.7 is named from the catalogue (skills' row, K194).
  - **The ops (K3).** `aiRunsOps(runs, url, body)` answers `airunopen`, `airuntick`, `airunclose`, `airun`, `airunlog`, `airuns` and `airunspawn`. The store's seven dispatch entries and its thin delegates are gone.
- **R17, R41 and N39 (ai-runs' share).** capture-requests registers the wait source (`captureRequestsOf(ctx, {aiRuns})`); legacy-store's interim wait source and its `runs.runFor` interim are gone (B7). The wake counts `expired` as its own completion (D-583).
- **R30.** Runs are registered as bias's `ai-run` work products; a close tells bias and carries its answer as `bias_debt`. `bias/interim.mjs` is left to bias (K182, N143).
- **R36.** observation-log's `run` resolver, retrieval's hidden-run tail and the `surfaced_in` decoration are registered from here. The store now reaches ai-runs before it registers its own decoration, so inquiry's migration arm is not overwritten.
- **R37.** `registerRunGate("ai-runs", …)` is filled from R28 and R5; legacy-store's interim registration is removed in the same change (B5).
- **R40.** The one deployment order is in `src/ai-runs/deployment.mjs`. The open refuses a blank or undeployed mode with C-109.1 (`AI_RUN_OPEN_CHECKS`), after R8 and before anything is written. A run opened with no mode opens in `check` and records it.
- **B6.** (2) A dispatch still running at the bound is `RUNNING`: no failure entry, and it counts as dispatched (R18 as folded). (3) `op=airun` publishes `state` (R19 as folded), so N153's ai-runs side is done. (1) is not ai-runs': the open records whatever well-formed skill version the opener hands it (R8), so the opener (`d260-resume`, legacy-tests) must hand `renderPack(...).version`.
- **B8.** R28 `runFor` answers `principal_claude`. run-productions is now handed `aiRuns: aiRunsOf(ctx, env)`, so its interim ai-runs arm is unused.
- **N49** (J4), **N69** (not mine: N138), **D-375** (not mine: N139), **N54** (DONE), EXTRACTION #2 J2.1 (the sentence left with N49).

**Fixed in this module** (each found by this job's tests or checks)
1. The wake's entry rolled up `NEVER_LOOKED` for a run with no look yet, which observation-log refuses (its R3). Such a run was never marked woken and was retried every tick. It now restates `LOOKED_INDETERMINATE` (the dispatch-failure entry too).
2. `consumeBound` let a `null` figure through (an SQL error) and named the wrong bound in its refusal. It now asks R3's rule of its own pair.
3. R19's `condition` now states the ending's or bound's sentence when no queue condition was named, instead of "the run stopped on 'x'".
4. C-22.7 is minted at one literal site (DEC-49 guard arm G).
5. observation-log's seven C-22 rows in the catalogue named `src/airun.mjs checkObservation` and `checkCondition`, which N49 removed; they now name `src/observation-log/vocabulary.mjs` (DEC-49 guard arm C).

**Deferred:** basis-versions' interim `proposed_readings` source (B7 (2), B8). basis-versions is not on `tranche/T7` yet (no `src/basis-versions/`), so I take it over at the CHANGE that brings it.

**Found in other modules** (REPORT, for their jobs)
1. **legacy-tests** (map §4). Ten suites fail only because they read my rows from the catalogue by name: `airun-principal`, `airun-contextkind`, `airun-projectgate`, `d85-surface-run`, `rec171-surface-token`, `rec172-bounds`, `rec177-allowance`, `rec207-bias-debt-settle`, `rec173-migration-replay`, `rec168-capturerequest-principal`. Measured: each passes when the catalogue re-exposes the rows (a scratch shim, not committed). Re-point them to `src/ai-runs/index.mjs` (or `airun.mjs`'s `AI_RUN_CHECKS`). Four more anchor on source that moved into this module and re-anchor there: `rec169-consume` C1/C2 (the bound writers are `consumeBound` and the surfacing projection), `observation-log` A2/B1 (the fold is `migrate`), `observation-meaning` J5 (D-486's tail is `hiddenRunTail`), `bias` F3 (the payload literal is `spawnPayload`). The other old-battery suites I ran read the same here and on the base.
2. **promotion.** `CATALOG_VERSION`/d470's census: C-109.1 is one new check, and 22 rows left the catalogue for this module.
3. **skills.** `skilldoctrine.mjs`'s `DEPLOYMENT_SEQUENCE` copy should re-export `src/ai-runs/deployment.mjs`, where `enforced_by` is now `["C-109.1"]` and `does_not_reach` says the record refuses. `skillsequencing`'s pins on those two fields move with it. `skillpack.mjs`'s `checkSkillVersion` copy is N156.
4. **agent-worker.** Its `MODES` pin and any plane mock that opens runs in a mode other than `check` now meet C-109.1.
5. **legacy-store** (for their owners, per the map): `#findingsVersionFromAnotherTeam`, `#hiddenSets` and `#counts` still read `ai_runs`/`ai_run_bounds` in SQL (queue, retrieval/stats).
6. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (new files under `src/ai-runs/`, and store/catalogue edits).
7. **Size (P6):** the module is 4,289 lines (`airun.mjs` 1,097 and `src/ai-runs/` 3,192), past the ~4,000 mark. Most of that is the comment history moved in with the code.
8. **legacy-ui:** the DEC-49 guard's failure set is identical here and on the base (111 = 111, diffed line by line).

**Ownership lines for review** (legacy files; everything else is removal):
- `store.mjs` 716–717: the decoration keeps only inquiry's migration arm (accepted in B4).
- `store.mjs` 696: `aiRunsOf(ctx, env)` placed before legacy-store's decoration (a use of this module's name, so not flagged).
- `store.mjs` 764: the capture-requests comment, re-worded.
- `store.mjs` 1238–1239: `#surfacedIn`, reduced to the migration arm.
- `bio-checks.mjs` 5578–5745: the seven re-pointed `where`s (fix 5 above).
- the N118 row-end split: `},  /* N118` became `/* N118` on its own line.

**Tests and checks** (on 58a32f8b1f)
- Module: `node --test bio-plane/test/m/ai-runs/`: tests 41, pass 41, fail 0 (R1–R41, the ops table).
- Layer tests: none named in `build/manifest.md`.
- Users of the services I changed, here vs `tranche/T7`: run-productions 33/0 = 33/0; capture-requests 53/0 = 53/0; contradiction 28/0; skills 29/0 = 29/0; inquiry 50/0; citation 49/0; strength 40/0. Every other module's `test/m/`: 35 of 35 identical to the base.
- `node checks/format.mjs /home/user/bio`: format: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio ai-runs`: architecture: 14 product files, 55 relative imports (0 naming no tracked file, not judged); 0 failures.
- `node checks/coverage.mjs /home/user/bio ai-runs`: coverage: 1 modules, 41 of 41 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio ai-runs tranche/T7`: ownership: 18 files changed by ai-runs between tranche/T7 and HEAD; legacy-store: 26 line(s) added, 2435 removed; legacy-checks: 8 line(s) added, 417 removed; 10 failures (the lines listed above).

Size (session_01WypBtD6YhawXPvfZkGWd5r): test runs 38, module lines 4289

## J7 · COMPLETE

B9 done. Branch `job/T7/ai-runs` @ 64e2001b5a, pushed; `tranche/T7` merged in (K195, @ fd703fbf0a). Every module's removals are kept: the store's conflicting hunks were basis-versions' and ai-runs' own removals on each side.

**The candidates source is run-productions', not mine.** `proposed_readings` is run-productions' table (its R14), and my map gives ai-runs no source over it. The tranche's store no longer carries `onCandidates("legacy-store", …)`: run-productions registers its own at construction. I left that registration alone. The store still hands run-productions `aiRuns: aiRunsOf(ctx, env)`, and the store comment above that line now says so (it had called ai-runs not yet extracted).

**Tests** (here vs `tranche/T7`):
- ai-runs: 41/0 (no base suite).
- run-productions: 33/0 = 33/0.
- basis-versions: 42/0 = 42/0.
- capture-requests: 53/0 = 53/0.
- contradiction 28/0, skills 29/0, inquiry 50/0, citation 49/0, strength 40/0.

**Checks:**
- format: 0 failures.
- architecture: 0 failures.
- coverage: 41 of 41 live ids named, 0 failures.
- ownership: legacy-store 29 lines added, 2,438 removed; legacy-checks 8 added, 417 removed; 10 failures. These are the same lines K196 accepted, re-numbered: `store.mjs` 718–719, 759 and 1205–1206, and the catalogue `where`s.

**One new report, legacy-ui.** The DEC-49 guard now reads 124 failures here against 123 on the base. The difference is one FLOOR SLACK line: `regions` measures 247 against a floor of 246. That is the region `is-airun-open-mode` (C-109.1, R40) this job added. `FLOOR.regions` in `civicos-ui/check-refusal-codes.mjs` should move 246 → 247, with its growth named as ai-runs' C-109.1 region; that file is not mine to edit. Every other guard failure line is identical to the base's.

Size (session_01WypBtD6YhawXPvfZkGWd5r): test runs 42, module lines 4289
