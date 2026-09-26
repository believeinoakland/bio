# ai-runs — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `35ea098` (after promotion's merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (49,817 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (15,682), `airun.mjs` (2,551) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/ai-runs.md` (R1–R53); K6, K23, K31, K58, K61, K64, K71, K73 (2), K75 (2), K78 (2)–(3), K80 and N39, N49 apply. The module exports `aiRunsOf(ctx, env)`, reaching its uses through their factories (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]`. The column **part** names the proposed split (requirements, Open for Bob 1–2): **run** (`ai-runs`), **prod** (`run-productions`), **debt** (`bias` by registration, or here).

## 1. What moves

| what | where today | lines | part | moves |
| --- | --- | --- | --- | --- |
| the file header; `RUN_BOUNDS` … `RUN_CONTEXTS`; `checkBound`, `PLANE_*_BOUNDS`, `checkConsume`, `PROJECT_GATE_GROUNDS`, `runConsultsProjects`, `projectGate`, `checkRunContextKind`, `runPrincipalOf`, `runPrincipalGate`, `finishedBound`, `translationOf`, the `AI_RUN_CHECKS` re-export | airun.mjs | 1–105, 1639–1930, 2140–2551 | run | stays in place (already the module's path); the observation half (106–1404, 1931–2139) is copied into `observation-log` by its job and re-exported here, then deleted (K78 (3), N49) |
| `checkSkillVersion` (and `parseSkillVersion`) | skillpack.mjs 463–519 | 57 | run | into this module; `skillpack.mjs` imports it back (§5.2) |
| IS-6 header, `AI_RUN_LEASE_MS`; `AI_RUN_LOG_LIMIT_*`, `AI_RUNS_LIMIT_*`, `#aiIso` | store.mjs | 41257–41330, 41363–41387 | run | yes; `#aiIso` is also used by the capture requests (a copy each) |
| `#aiRunAppend` … `#aiRunGateStated`, `aiRunOpen`, `#aiRunInSight`, `aiRunTick`, `aiRunClose`, the reaper, the wake, D-260's resumer and dispatch, `aiRunRead`, `#standardForRun`, `aiRunsInContext` | store.mjs | 43427–45052 | run | yes (R9–R24); `#aiRunAppend` becomes a call to `observation-log`'s writer |
| `#biasForRun` (the lens block) | store.mjs | 45053–45155 | run | yes (R20) |
| D-86 sweep: its constants, `#biasDebtFingerprint`, `#biasDebtPending`, `#biasDebtRecipients`, `#biasDebtSweep` | store.mjs | 45156–45336 | debt | yes (R39–R40) |
| REC-207 settlements: `#biasDebtSettle` … `biasDebtResolve`, `biasDebtRead`, `#biasDebtDischargeByRerun` | store.mjs | 45383–45640 | debt | yes (R41–R44) |
| `aiRunSpawnPayload`, `aiRunLog` | store.mjs | 45641–45911 | run | yes (R23, R24) |
| `#surfacingGate`; the surfacing row and `surfaces` consumption inside `#promoteChecks`/`#promoteProjections` | store.mjs | 17353–17413; 17435–17440, 18731–18744 | run | yes, as the step registered with `promotion` (R25–R26) |
| `#surfacedIn` | store.mjs | 2163–2197 | run | yes (R27), registered as retrieval's `surfaced_in` decoration; its migration-replay arm is `inquiry`'s |
| SK-8 region: `#mintsBound`, `#posFields`, `extractPropose`, `extractProposals` | store.mjs | 22311–22685 | prod | yes (R35–R38; K73 (2)) |
| PL-3/IS-4 region: `SUGGEST_LEGS_MAX`, `SUGGEST_ORIGIN_MAX`, `suggestVersion`, `#suggestionPersisted`, `#suggestionFrontmatter` | store.mjs | 39022–40075 | prod | yes (R28–R34) |
| migrations: `ai_runs.lens_at_open`, `rerun_of`; `bias_debts.settled_kind`; the `ai_run_log` fold | store.mjs | 1316–1320, 1360–1364, 1365–1372, 1420–1463 | run, debt | yes, with their tables |
| dispatch `extractpropose`, `extractproposals` | store.mjs | 48651–48674 | prod | yes (K3) |
| dispatch `airunspawn`; `airunopen` … `airunlog`; `airuns` | store.mjs | 49002–49012, 49271–49306, 49311–49314, 49329–49337 | run | yes |
| dispatch `suggest`; `biasdebtresolve`, `biasdebt` | store.mjs | 49217–49227; 49307–49310 | prod; debt | yes |
| `AI_RUN_CHECKS` header and the run's rows (C-22.5, .7, .8, .11–.16) | bio-checks.mjs | 6114–6571 less observation-log's rows (C-22.1–.4, .6, .9, .10) | run | yes (R49), the family split by number |
| `AI_RUNS_CONTEXT_CHECKS` (C-36.1–.3) | bio-checks.mjs | 6573–6654 | run | yes |
| `ACT_SHAPE_CHECKS` rows C-33.29–.31, C-33.45–.47 with their comments | bio-checks.mjs | 9860–9953 | run | yes, split by number |
| `SURFACE_CHECKS` C-66.1–.4 | bio-checks.mjs | 13661–13737 | run | yes; C-66.5 to `inquiry`, C-66.6 to `control-plane` (§5.6) |
| `SUGGEST_CHECKS` C-27.1–.14, .16–.19 | bio-checks.mjs | 7777–7989 | prod | yes; `SUGGEST_KINDS`, `SUGGEST_LEVELS` (7707–7736) and C-27.15 stay with `basisVersionFindings` (§5.3) |
| `BIAS_CHECKS` C-26.13–.19 with their header | bio-checks.mjs | 8198–8264 | debt | yes (bias map §2) |
| `ai_runs`, `ai_run_bounds`, `inquiry_run_surfacings` | schema.mjs | 2027–2111 | run | yes (K4) |
| `proposed_readings` | schema.mjs | 3262–3332 | prod | yes |
| `bias_debts`, `bias_debt_sweeps`; `bias_debt_settlements` | schema.mjs | 3660–3691, 3823–3849 | debt | yes |

The purge entries (store.mjs 875: `proposed_readings`, `inquiry_run_surfacings` by bundle; 894–895: `ai_run_bounds`, `bias_debts`, `bias_debt_sweeps`, `ai_runs` whole-store) move to each part's own `declarePurge` (R52).

**Measured size:** run 3,860 lines (1,380 code: store.mjs 2,320, airun.mjs 810, bio-checks.mjs 640 of which about 250 are observation-log's, schema.mjs 85); prod 1,750 (790: store.mjs 1,465, bio-checks.mjs 215, schema.mjs 70); debt 580 (340: store.mjs 450, bio-checks.mjs 65, schema.mjs 60). Together about 6,180 as the code stands, about 5,930 once observation-log takes its rows.

## 2. What stays, or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `airun.mjs` 106–1404 and 1931–2139 (the observation vocabulary, `contentAxisFor`, `contentObservationsFor`, the meaning level, `checkObservation`, `checkCondition`) | airun.mjs | `observation-log` (K78 (3)) | copied there by its job; this module re-exports and deletes its copy (N49) |
| `airun.mjs` 1405–1638 (`searchedSection`, `SEARCHED_LEVEL_OUTCOMES`, the `SEARCHED_SUBJECT_SOURCES` re-export) | airun.mjs | `publication` (§5.3) | the case document's completeness statement; its one caller is `#searchedForCase` |
| `#obligationsBiasDebt` (the queue item) | store.mjs 45337–45382 | `queue` | a queue producer (it calls `#queueAncestors`, `#queueOptions`, layer 11); it reads R42 |
| the three scheduler consumers `ai-run-reap`, `ai-run-wake`, `bias-debt` | store.mjs ~3553–3584, ~3615–3690, ~3752–3772 | `scheduler` | they call R15, R16, R39 |
| the promote handler's arming on `#biasDebtPending` | store.mjs 49031 | `scheduler`/`control-plane`, on R39's lens-change notice | a later module's effect (promotion Suggestions) |
| `#hiddenSets`, `#hiddenRunTail` | store.mjs 30815–30838 | `retrieval` and `op=stats`' owner, with the run predicate registered from here (R50, K80) | they serve the tallies; only the run half reads `ai_runs` |
| `#findingsVersionFromAnotherTeam`'s run arm | store.mjs 28812– (28838–28963) | `queue` | reads `ai_runs` by id; takes R19 or a stated read contract |
| `aiCredentialLook`, `AI_CREDENTIAL_CHECKS` (C-29) | store.mjs 40983; bio-checks.mjs 8548–8727 | `membership` (K56) | called by the resumer |
| `AI_RUN_ACTIONS`, `RUN_VERB_ACTIONS`, `RUN_PRODUCTION_ACTIONS`, `BIAS_DEBT_ACTIONS`, the op classes and capabilities, the principal stamps | index.mjs 1495–1613, 1943–2014, 2295–2317, 2734–2778, 12013–12160, 12421–12575, 12871–12878, 13312–13317 | `control-plane` | K3 |
| `extractrun.mjs` (`EXTRACT_RUN_MODE`, `proposalChain`, `checkProposedRef`) | extractrun.mjs | `extraction` (its R41–R43) | used, not moved |

## 3. Callers to rewire

Each calls a moved method or reads a moved table today, and calls the module's factory after.

- `aiRunRead`: `#surfacedIn` (moves), `projection`'s `surfaced_in` (2033, through R50's decoration).
- `#aiRunInSight` and `runPrincipalGate`, and `ai_runs` read directly: `contradictionPropose` (15222–15232; through contradiction's R21), `captureRequest` (40168–40193; `capture-requests` uses `ai-runs`).
- `aiRunLog`: `#frontierDocumentVisible` (42187), `#frontierMeaning` (42884): through observation-log's `run` resolver, which this module fills (N39).
- `ai_runs`/`ai_run_bounds` SQL: `#findingsVersionFromAnotherTeam` (28890), `#hiddenSets` (30820), `#counts` (31026), `#observationBundles` (42110–42117), purge's proof (32527). Each takes R19, the registered predicate, or a stated read contract; BOB decides which.
- `#aiRunAppend` via the observation log's writer: the wake and dispatch (moving) and the fold migration (1420–1463).
- `promote`: the surfacing refusal and projection become the registered step (R25–R26); `suggestVersion` calls `promotion.promote` (R30).
- `extractPropose` calls `mintContent` and `contentContextFor` (content R12, extraction R30) and `#captureForContent` (content `captureFor`).
- `aiRunOpen`, `#biasForRun`: `biasManifest` (bias R18); the sweep's fingerprint reads `bias_adoptions` (bias's table): through `bias.lensFingerprint`.
- The wake: `#captureRequestTickMs`, `#captureRequestConfigured`, `capture_requests` (44376–44536): through the wait source (R16–R17).

## 4. Old-battery tests that anchor on the moved source

Source-patching controls and source-reading suites that re-anchor with the move (`legacy-tests` entries, K53): `airun.test.mjs` (the consumer census, ARM S3b), `run-conditions.test.mjs` (the `ai_runs` reader census and roles), `airun-principal.test.mjs`/`.control.mjs`, `airun-contextkind.control.mjs`, `d85-surface-run.control.mjs`, `rec165-production-principal.test.mjs`/`.control.mjs`, `rec168-capturerequest-principal.control.mjs`, `rec169-consume.test.mjs`/`.control.mjs`, `rec171-surface-token.control.mjs`, `rec172-bounds.control.mjs`, `rec177-allowance.control.mjs`, `d86-bias-debt.control.mjs`, `rec207-bias-debt-settle.test.mjs`/`.control.mjs`, `dec65-strength-reach.test.mjs`/`.control.mjs`, `d168-retired-cite.test.mjs`, `suggest.test.mjs`/`suggest.control.mjs`, `nc-sk8.mjs`, `nc-pl18.mjs`, `nc-rec93.mjs`, `nc-rec100.mjs`, `nc-rec107.mjs`, `nc-rec113.mjs`, `extractrun.test.mjs`, `scheduler.test.mjs`/`.control.mjs`, `derivation-bounds.test.mjs`, `bias.test.mjs`, `project-sight.test.mjs`, `provenance-marker.test.mjs`, `rec75-sweep.mjs`, `rec93-fold-digest.mjs`, `rec93-migrate-probe.mjs`, `machinefences-dec49.test.mjs`, `identity-claims.test.mjs`, `d470-catalog-census.test.mjs`, `gate-reads.test.mjs`, and `civicos-ui/test/ai-session-context.test.mjs` (imports `RUN_STATUS`). Suites that drive the behaviour and follow the module: `airuns.test.mjs`, `airun-projectgate.test.mjs`, `airun-contextkind.test.mjs`, `d260-resume.test.mjs`, `d85-surface-run.test.mjs`, `rec171-surface-token.test.mjs`, `rec172-bounds.test.mjs`, `rec177-allowance.test.mjs`, `d86-bias-debt.test.mjs`, `m0187-`/`m0193-surfacing-fixture.test.mjs`, `surfacing-run.mjs`, `vf4-suggestprobe.mjs`, and `agent-worker/test/` (`wire-vocabulary`, `harness`, `fanout`, `plane-suggest`, `plane-capturerequest`), which import `airun.mjs` and drive the ops. The observation-vocabulary importers follow `observation-log` (its map §4).

## 5. Undetermined, conflicts, and code others could claim

1. **Size and the split** (Open for Bob 1, 2). With both proposals `ai-runs` is about 3,610 lines; with the debt kept here, about 4,190.
2. **`checkSkillVersion` is in a later module's file.** It is in `skillpack.mjs` (`skills`, after this module: K17 removed the stale use). Proposed: this module takes it (R8, C-22.7's grammar) and `skillpack.mjs` imports it from here.
3. **Earlier modules read what this file holds.** `SUGGEST_KINDS`, `SUGGEST_LEVELS` and C-27.15 are read by `basisVersionFindings` (`basis-versions`, earlier): they stay there (or in `legacy-checks`) and `run-productions` imports them. `searchedSection` (1405–1638) has one caller, publication's `#searchedForCase`; proposed to `publication`, or copied into `observation-log` with the vocabulary (its design §6 computes it from the log). BOB rules which.
4. **D-375** is carried against `ai-runs` because `contentObservationsFor` is in `airun.mjs`; by K78 (3) that code is `observation-log`'s (R6 there), and the missing character count is the reading's (`extraction`). Proposed: re-target D-375 to `observation-log`, with `extraction` supplying the count. Built work: `land/worker/D-375` @ `9a5df6e6`.
5. **Uses.** `modules.json` gives `legacy-checks`, `record-core`, `membership`, `capture`, `extraction`, `content`, `bias`, `retrieval`, `inquiry`, `basis-versions`, `contradiction`. The code also needs `observation-log`, `promotion`, `connections` (`citesInto`) and `strength` (the strength walk and independence trace in `suggestVersion`); nothing calls `capture`. Proposed: add the four, drop `capture`. With the split, `run-productions` uses `ai-runs`, `promotion`, `inquiry`, `basis-versions`, `strength`, `connections`, `content`, `extraction`, `membership`, `record-core`, `legacy-checks`; `capture-requests`, `skills`, `agent-worker`, `intent`, `scheduler` keep their use of `ai-runs`, and `agent-worker` gains `run-productions` (it calls `op=suggest` over HTTP only, so no code edge).
6. **Split families.** `SURFACE_CHECKS`: C-66.1–.4 here, C-66.5 (`surfaced_by` rewritten, a revision's check) to `inquiry`, C-66.6 (`REPLAY_UNVERIFIED`, index.mjs) to `control-plane`. `AI_RUN_CHECKS`: observation-log's rows leave by K78 (3). `ACT_SHAPE_CHECKS`: six rows here. Numbers unchanged.
7. **The wake's source.** The capture-requests map offers the wake to `scheduler` instead (D-583's triage). Proposed: keep it here with the wait source (K71), since it moves a run's lease and writes the run's log.
8. **`inquiry_migration_replays`** (schema.mjs 2113–2127), read by `#surfacedIn`'s migration arm and written in a creation's promotion, is `inquiry`'s; the arm is its decoration.
9. **Other claimants.** `observation-log`: the vocabulary, the log door and `aiRunLog`'s read (N49). `bias`: the lens block and the debt. `capture-requests`: the wake. `scheduler`: the three consumers. `queue`: the debt's queue item. `retrieval`: the hidden-run predicate and `surfaced_in`. `publication`: `searchedSection`. `basis-versions`: the suggest kinds. `skills`: the pack version grammar. `membership`: the credential look. `contradiction`: `op=contradictionpropose` (its map §5.1).
