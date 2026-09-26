# ai-runs — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `35ea098` (after promotion's merge) by a drafting worker for BOB #42 (P18); split the same day (N54, K82): `op=suggest` and the EXTRACT proposals are mapped in `build/extraction/run-productions.md`, the bias debt goes to `bias` (K82 (3)). No product source changed between `35ea098` and `1c205209`, so the ranges stand. Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (49,817 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (15,682), `airun.mjs` (2,551), `skillpack.mjs` (519) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/ai-runs.md` (R1–R39); K6, K23, K31, K58, K61, K64, K71, K73 (2), K75 (2), K78 (3), K80, K81, K82 (2)–(5), K83 (4) and N39, N49 apply. The module exports `aiRunsOf(ctx, env)`, reaching its uses through their factories (K61); `legacy-store` delegates to it. `from` reads `["legacy-store", "legacy-checks"]`.

## 1. What moves

| what | where today | lines | moves |
| --- | --- | --- | --- |
| the file header; `RUN_BOUNDS` … `RUN_CONTEXTS`; `checkBound`, `PLANE_*_BOUNDS`, `checkConsume`, `PROJECT_GATE_GROUNDS`, `runConsultsProjects`, `projectGate`, `checkRunContextKind`, `runPrincipalOf`, `runPrincipalGate`, `finishedBound`, `translationOf`, the `AI_RUN_CHECKS` re-export | airun.mjs | 1–105, 1639–1930, 2140–2551 | stays in place (already the module's path); the observation half (106–1404, 1931–2139) is copied into `observation-log` by its job and re-exported here, then deleted (K78 (3), N49); 1405–1638 go to `publication` (K82 (5)) |
| `checkSkillVersion` (and `parseSkillVersion`) | skillpack.mjs | 463–519 | into this module; `skillpack.mjs` re-exports it (K82 (4)) |
| IS-6 header, `AI_RUN_LEASE_MS`; `AI_RUN_LOG_LIMIT_*`, `AI_RUNS_LIMIT_*`, `#aiIso` | store.mjs | 41257–41330, 41363–41387 | yes; `#aiIso` is also used by the capture requests (a copy each) |
| `#aiRunAppend` … `#aiRunGateStated`, `aiRunOpen`, `#aiRunInSight`, `aiRunTick`, `aiRunClose`, the reaper, the wake, D-260's resumer and dispatch, `aiRunRead`, `#standardForRun`, `aiRunsInContext`, `#runContextProjects`, `#runContextQuestions` | store.mjs | 43427–45052 | yes (R9–R24); `#aiRunAppend` becomes a call to `observation-log`'s writer; `#aiRunInSight` with the `ai_runs` row read becomes `runFor` (R28) |
| `#biasForRun` (the lens block) | store.mjs | 45053–45155 | yes (R20) |
| `aiRunSpawnPayload`, `aiRunLog` | store.mjs | 45641–45911 | yes (R23, R24) |
| `#surfacingGate`; the surfacing row and `surfaces` consumption inside `#promoteChecks`/`#promoteProjections` | store.mjs | 17353–17413; 17435–17440, 18731–18744 | yes, as the step registered with `promotion` (R25–R26) |
| `#surfacedIn` | store.mjs | 2163–2197 | yes (R27), registered as retrieval's `surfaced_in` decoration; its migration-replay arm is `inquiry`'s |
| migrations: `ai_runs.lens_at_open`, `rerun_of`; the `ai_run_log` fold | store.mjs | 1316–1320, 1360–1364, 1420–1463 | yes, with their tables |
| dispatch `airunspawn`; `airunopen` … `airunclose`, `airun`; `airunlog`; `airuns` | store.mjs | 49002–49012, 49271–49306, 49311–49314, 49329–49337 | yes (K3) |
| `AI_RUN_CHECKS` header and the run's rows (C-22.5, .7, .8, .11–.16) | bio-checks.mjs | 6114–6571 less observation-log's rows (C-22.1–.4 at 6237–6281, .6 at 6295–6306, .9–.10 at 6369–6464) | yes (R35), the family split by number; C-22.7 comes with `checkSkillVersion` (K82 (4); §5.2) |
| `AI_RUNS_CONTEXT_CHECKS` (C-36.1–.3) | bio-checks.mjs | 6572–6654 | yes |
| `ACT_SHAPE_CHECKS` rows C-33.29–.31, C-33.45–.47 with their comments | bio-checks.mjs | 9860–9953 | yes, split by number |
| `SURFACE_CHECKS` C-66.1–.4 | bio-checks.mjs | 13661–13699 | yes; C-66.5 (13700–13716) to `inquiry`, C-66.6 (13717–13736) to `control-plane` |
| `ai_runs`, `ai_run_bounds`, `inquiry_run_surfacings` | schema.mjs | 2027–2111 | yes (K4) |

The purge entries (store.mjs 875: `inquiry_run_surfacings` by bundle; 894–895: `ai_run_bounds`, `ai_runs` whole-store) move to this module's own `declarePurge` (R38).

**Measured size:** about 3,810 lines, about 1,340 without comment-only and blank lines: `store.mjs` 2,330 (923), `airun.mjs` 810 (181), `bio-checks.mjs` 525 (172) with observation-log's rows left out, `schema.mjs` 85 (39), `skillpack.mjs` 57 (23). Under 4,000.

## 2. What stays, or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `airun.mjs` 106–1404 and 1931–2139 (the observation vocabulary, `contentAxisFor`, `contentObservationsFor`, the meaning level, `checkObservation`, `checkCondition`) | airun.mjs | `observation-log` (K78 (3)) | copied there by its job; this module re-exports and deletes its copy (N49) |
| `airun.mjs` 1405–1638 (`searchedSection`, `SEARCHED_LEVEL_OUTCOMES`, the `SEARCHED_SUBJECT_SOURCES` re-export) | airun.mjs | `publication` (K82 (5)) | the case document's completeness statement; its one caller is `#searchedForCase` |
| `suggestVersion` and its region, `extractPropose`, `extractProposals`, `proposed_readings`, `suggest_refusals`, C-27 (less .15), `SUGGEST_LEVELS`, dispatch `suggest`, `extractpropose`, `extractproposals` | store.mjs 22311–22685, 39022–40075, 48651–48674, 49217–49227; bio-checks.mjs; schema.mjs | `run-productions` (K82 (2)) | its map |
| the bias debt: D-86 sweep (45156–45336), REC-207 settlements, `biasDebtResolve`, `biasDebtRead`, `#biasDebtDischargeByRerun` (45383–45640), the `bias_debts.settled_kind` migration (1365–1372), dispatch `biasdebtresolve`, `biasdebt` (49307–49310), `BIAS_CHECKS` C-26.13–.19 (8198–8264), `bias_debts`, `bias_debt_sweeps`, `bias_debt_settlements` (schema 3660–3691, 3823–3849) | store.mjs, bio-checks.mjs, schema.mjs | `bias` (K82 (3)) | about 580 lines (340 of code); it reads runs through R30's registration, and `aiRunClose` tells it of a close (R13) |
| `#obligationsBiasDebt` (the queue item) | store.mjs 45337–45382 | `queue` | a queue producer (layer 11); it reads the debt through `bias` |
| the three scheduler consumers `ai-run-reap`, `ai-run-wake`, `bias-debt` | store.mjs ~3553–3584, ~3615–3690, ~3752–3772 | `scheduler` | they call R15, R16 and `bias`'s sweep |
| the promote handler's arming on `#biasDebtPending` | store.mjs 49031 | `scheduler`/`control-plane`, on `bias`'s lens-change notice | a later module's effect |
| `#hiddenSets`, `#hiddenRunTail` | store.mjs 30815–30838 | `retrieval` and `op=stats`' owner, with the run predicate registered from here (R36, K80) | they serve the tallies; only the run half reads `ai_runs` |
| `#findingsVersionFromAnotherTeam`'s run arm | store.mjs 28838–28963 | `queue` | reads `ai_runs` by id; takes R19 or R28 |
| `aiCredentialLook`, `AI_CREDENTIAL_CHECKS` (C-29) | store.mjs 40983; bio-checks.mjs 8548–8727 | `membership` (K56) | called by the resumer |
| `AI_RUN_ACTIONS`, `RUN_VERB_ACTIONS`, `RUN_PRODUCTION_ACTIONS`, `BIAS_DEBT_ACTIONS`, the op classes and capabilities, the principal stamps | index.mjs 1495–1613, 1943–2014, 2295–2317, 2734–2778, 12013–12160, 12421–12575, 12871–12878, 13312–13317 | `control-plane` | K3 |

## 3. Callers to rewire

Each calls a moved method or reads a moved table today, and calls the module's factory after.

- `#aiRunInSight`, `runPrincipalGate` and `ai_runs` read directly: `suggestVersion` and `extractPropose` (through R28 and R5, `run-productions`), `contradictionPropose` (15222–15232; through contradiction's R21, filled by R37), `captureRequest` (40168–40193; `capture-requests` calls R28 and R5).
- `ai_run_bounds` written directly: `extractPropose`'s `mints` consumption (22567–22571) and `#mintsBound` (22356) (through R29).
- `aiRunRead`: `#surfacedIn` (moves), `projection`'s `surfaced_in` (2033, through R36's decoration).
- `aiRunLog`: `#frontierDocumentVisible` (42187), `#frontierMeaning` (42884): through observation-log's `run` resolver, which this module fills (N39).
- `ai_runs`/`ai_run_bounds` SQL: `#findingsVersionFromAnotherTeam` (28890), `#hiddenSets` (30820), `#counts` (31026), `#observationBundles` (42110–42117), purge's proof (32527), the bias-debt sweep (`bias`, through R30). Each takes R19, R28, the registered predicate, or a stated read contract; BOB decides which.
- `#aiRunAppend` via the observation log's writer: the wake and dispatch (moving) and the fold migration (1420–1463).
- `promote`: the surfacing refusal and projection become the registered step (R25–R26).
- `aiRunOpen`, `#biasForRun`: `biasManifest` (bias R18).
- `aiRunClose`: `#biasDebtDischargeByRerun` becomes R30's close notice to `bias`.
- The wake: `#captureRequestTickMs`, `#captureRequestConfigured`, `capture_requests` (44376–44536): through the wait source (R16–R17).

## 4. Old-battery tests that anchor on the moved source

Source-patching controls and source-reading suites that re-anchor with the move (`legacy-tests` entries, K53): `airun.test.mjs` (the consumer census, ARM S3b), `run-conditions.test.mjs` (the `ai_runs` reader census and roles; it reads the productions too), `airun-principal.test.mjs`/`.control.mjs`, `airun-contextkind.control.mjs`, `d85-surface-run.control.mjs`, `rec168-capturerequest-principal.control.mjs`, `rec169-consume.test.mjs`/`.control.mjs`, `rec171-surface-token.control.mjs`, `rec172-bounds.control.mjs`, `rec177-allowance.control.mjs`, `nc-pl18.mjs`, `nc-rec93.mjs`, `nc-rec100.mjs`, `nc-rec107.mjs`, `nc-rec113.mjs`, `scheduler.test.mjs`/`.control.mjs`, `derivation-bounds.test.mjs`, `bias.test.mjs`, `project-sight.test.mjs`, `provenance-marker.test.mjs`, `rec93-fold-digest.mjs`, `rec93-migrate-probe.mjs`, `machinefences-dec49.test.mjs`, `d470-catalog-census.test.mjs`, `gate-reads.test.mjs`, and `civicos-ui/test/ai-session-context.test.mjs` (imports `RUN_STATUS`). The bias-debt suites (`d86-bias-debt.test.mjs`/`.control.mjs`, `rec207-bias-debt-settle.test.mjs`/`.control.mjs`) follow `bias`; the production suites follow `run-productions` (its map §4). Suites that drive the behaviour and follow the module: `airuns.test.mjs`, `airun-projectgate.test.mjs`, `airun-contextkind.test.mjs`, `d260-resume.test.mjs`, `d85-surface-run.test.mjs`, `rec171-surface-token.test.mjs`, `rec172-bounds.test.mjs`, `rec177-allowance.test.mjs`, `m0187-`/`m0193-surfacing-fixture.test.mjs`, `surfacing-run.mjs`, and `agent-worker/test/` (`wire-vocabulary`, `harness`, `fanout`), which import `airun.mjs` and drive the ops. The observation-vocabulary importers follow `observation-log` (its map §4).

## 5. Undetermined, conflicts, and code others could claim

1. **Size.** About 3,810 lines after K82's split and with the debt gone to `bias`; under the mark.
2. **C-22.7 and `checkSkillVersion`.** K81 moved C-22.7's row into `skills` (skills R25); K82 (4) holds `checkSkillVersion` here, earlier in the order, with `skills` re-exporting it. This draft takes the row with the function (R8, R35), so skills' R25 becomes a re-export; BOB confirms and amends skills' draft.
3. **What `run-productions` needs from here** is R28 (`runFor`), R5 (`runPrincipalGate`) and R29 (`boundOf`, `consumeBound`); the same R28 serves `capture-requests` (its R1) and contradiction's run gate (R37). Consumption inside a caller's transaction needs `record-core`'s `transact` to span both modules' writes, as the surfacing step (R26) does inside promotion's.
4. **The bias debt's registration (R30).** Its exact shape is `bias`'s to state when its draft takes old R39–R44 (K82 (3)); R30 states only what this module offers. The debt's requirements are not in either file of this split: `bias`'s draft still says the debt goes to `ai-runs` (its Status, R29, Suggestions) and needs amending.
5. **Uses.** The committed `modules.json` gives `legacy-checks`, `record-core`, `membership`, `promotion`, `extraction`, `content`, `connections`, `bias`, `observation-log`, `retrieval`, `inquiry`, `basis-versions`, `strength`, `contradiction`. After the split the run's code calls no `extraction`, `content`, `basis-versions` or `strength` (they were the productions'); drop the four.
6. **Split families.** `SURFACE_CHECKS`: C-66.1–.4 here, C-66.5 to `inquiry`, C-66.6 to `control-plane`. `AI_RUN_CHECKS`: observation-log's rows leave by K78 (3). `ACT_SHAPE_CHECKS`: six rows here. Numbers unchanged.
7. **The wake's source.** The capture-requests map offers the wake to `scheduler` instead (D-583's triage). Proposed: keep it here with the wait source (K71), since it moves a run's lease and writes the run's log.
8. **`inquiry_migration_replays`** (schema.mjs 2113–2127), read by `#surfacedIn`'s migration arm and written in a creation's promotion, is `inquiry`'s; the arm is its decoration.
9. **Other claimants.** `observation-log`: the vocabulary, the log door and `aiRunLog`'s read (N49). `bias`: the debt; the lens block stays here (R20). `capture-requests`: the wake. `scheduler`: the consumers. `queue`: the debt's queue item. `retrieval`: the hidden-run predicate and `surfaced_in`. `publication`: `searchedSection`. `skills`: the pack version grammar. `membership`: the credential look. `contradiction`: `op=contradictionpropose` (its map §5.1). `run-productions`: `op=suggest` and the EXTRACT proposals.
