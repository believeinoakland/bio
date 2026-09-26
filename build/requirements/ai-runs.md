# ai-runs — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; split by a drafting worker for BOB #42 the same day (N54, K82); for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`, unchanged at `1c205209`; `build/extraction/ai-runs.md` has the table): `bio-plane/src/airun.mjs` 1–105, 1639–1930, 2140–2551 (the run's vocabulary and pure rules; 106–1404 and 1931–2139 are observation-log's by K78 (3), 1405–1638 publication's by K82 (5)); `bio-plane/src/skillpack.mjs` 463–519 (`checkSkillVersion`, held here by K82 (4)); `bio-plane/src/store.mjs` 41257–41330 and 41363–41387 (the IS-6 header and constants), 43427–45155 (the run: log door, search roll-up, the one exit, context and project gates, `aiRunOpen`, `aiRunTick`, `aiRunClose`, reaper, wake and resume, `aiRunRead`, `aiRunsInContext`, the run's lens block), 45641–45911 (`aiRunSpawnPayload`, `aiRunLog`), 17353–17413 (`#surfacingGate`), 17435–17440 and 18731–18744 (the surfacing row inside the promotion step), 2163–2197 (`#surfacedIn`), 1316–1320, 1360–1364 and 1420–1463 (migrations), and the dispatch entries `airunspawn`, `airunopen`, `airuntick`, `airunclose`, `airun`, `airunlog`, `airuns` (49002–49012, 49271–49306, 49311–49314, 49329–49337); `bio-plane/checks/bio-checks.mjs` 6114–6571 less observation-log's rows (the run's rows of C-22), 6572–6654 (C-36), 9860–9953 (C-33.29–.31, .45–.47), 13661–13699 (C-66.1–.4); `schema.mjs` 2027–2111 (`ai_runs`, `ai_run_bounds`, `inquiry_run_surfacings`). `from`: `legacy-store` and `legacy-checks`; `index.mjs` holds only these ops' routing, classes and principal stamps, which stay with `control-plane` (K3). `op=suggest` and the EXTRACT proposals are `run-productions`' (K82 (2)); the bias debt (the sweep, its settlements, `op=biasdebt`, `op=biasdebtresolve`, three tables, C-26.13–C-26.19) is `bias`'s (K82 (3)). Not yet met: R17 (N39, K71), R30 (K82 (3)), R36 (K75 (2), K80), R37 (K31). No old-plan row is carried here: D-595 and D-572 follow `op=suggest` to `run-productions` (K83 (4) placed D-572 with `op=suggest`), D-375 is observation-log's (K82 (5)). Renumbered from the committed draft (old → new): R1–R27 → R1–R27; R28–R38 → `run-productions` R1, R3, R4, R6–R13 (its Status); R39–R44 → `bias` (K82 (3)); new R28, R29, R30; R45 → R31, R46 → R32, R47 → R33 (narrowed to this module's own production; the rest is `run-productions` R15), R48 → R34, R49 → R35, R50 → R36, R51 → R37, R52 → R38, R53 → R39.

**Size (P6).** About 3,810 lines (about 1,340 without comment-only and blank lines): `store.mjs` 2,330, `airun.mjs` 810, `bio-checks.mjs` 525 (observation-log's C-22 rows left out, K78 (3)), `schema.mjs` 85, `skillpack.mjs` 57. Under the 4,000 mark. A job reads it whole with its uses' public parts.

## Public

### Purpose

The AI run: a durable, bounded, attributed object a member opens over a question or a project, under which the assistant finds, pursues, extracts and checks. It records the conditions the work was formed under (the principals, the skill version, the lens in force, the project's bar), holds the budget, keeps a log of where the search went through the observation log, ends through one exit that names what stopped it, and is reaped when it dies. It answers whether a run may carry a production, and spends its bounds, for the modules that produce under it; what a run produces is theirs, and nothing here accepts, attests, concludes or captures.

### Provides

Terms. A **run** is `{run, status, label, mode, context_type, context_id, principal_plane, principal_claude, principal_claude_ref, skill_version, bias_manifest, standard_pair, lens_at_open, rerun_of, created, updated, expires, ticks, state, stopped_bound, stopped_condition, stopped_at}`. Its **context** is an `inquiry` or a `project`. `principal_plane` is `member:<id>/<tokenId>` for a member's credential or `class:<cls>` for a deploy token; `principal_claude` is the Claude-account level that pays. A **bound** is one of `fetches`, `subsessions`, `wallclock`, `runtime`, `mints`, `surfaces`, `lease`; an **ending** is `completed`, `cancelled` or `mode-not-deployed`. The **lease** is 3,600,000 ms, extended by every tick. A run is **visible** to a viewer when its context bundle is (membership's gate); an invisible run answers as an absent one throughout. `viewer`, `actor`, `caller` and `principalPlane` are the control plane's stamps. Every refusal names `code` and carries its catalogue `check` and `translation`.

**The vocabulary and pure rules: RUN_BOUNDS, RUN_ENDINGS, RUN_STATUS, RUN_NEVER_STARTED, runStatusFor, STANDARD_BASIS, RUN_CONTEXTS, checkBound, checkConsume, PLANE_COUNTED_BOUNDS, PLANE_DECIDED_BOUNDS, finishedBound, projectGate, PROJECT_GATE_GROUNDS, runConsultsProjects, checkRunContextKind, runPrincipalOf, runPrincipalGate, checkSkillVersion, translationOf** Pure; never throw.
- **R1** The bounds and endings are exactly those above; `runStatusFor` answers `never-started` for `mode-not-deployed`, `stopped` for a bound, `finished` otherwise.
- **R2** `checkBound`: a name that is neither a bound nor an ending is `AI_RUN_BOUND_UNNAMED` (C-22.5).
- **R3** `checkConsume` (list form at open, map form at tick): a non-list or non-map shape, or an unknown bound, is `AI_RUN_BOUND_UNKNOWN` (C-22.15); any figure for `lease`, or a non-zero figure a caller sends for `mints` or `surfaces`, is `AI_RUN_BOUND_PLANE_COUNTED` (C-22.14); a declared allowance absent or zero is `AI_RUN_BOUND_NO_ALLOWANCE` (C-22.16); a figure that is not a non-negative safe integer is `AI_RUN_CONSUME_INVALID` (C-22.13).
- **R4** `finishedBound`: an offered bound wins; else the first exhausted bound (allowed above 0, consumed at or past it) in R1's order; else `lease` when expired; else `completed`.
- **R5** `runPrincipalGate` compares caller and principal with a member credential's `/<tokenId>` removed; equal and non-empty passes, anything else is `AI_RUN_NOT_PRINCIPAL` (C-22.12) naming the act.
- **R6** `projectGate`: no actor passes unapplied (`NO_MEMBER_BEHIND_CALLER`); an inquiry context passes unapplied (`INQUIRY`); a project context passes when the actor has joined one of its projects (`PARTICIPANT`), else `AI_RUN_NOT_PROJECT_MEMBER` (C-22.8).
- **R7** `checkRunContextKind`: a context type outside `RUN_CONTEXTS`, or a context whose held kind (an unseen one is absent) differs, is `AI_RUN_NO_SUCH_CONTEXT` (C-22.11).
- **R8** `checkSkillVersion`: a blank version, or one not `<pack>@<edition>`, is `AI_RUN_SKILL_VERSION_UNNAMED` (C-22.7); any well-formed version is accepted, current pack or not. Held here and re-exported by `skills` (K82 (4)).

**open({run, contextType, contextId, label, mode, principalPlane, principalClaude, principalClaudeRef, skillVersion, biasManifest, standardPair, bounds, state, leaseMs, at, rerunOf, actor, viewer})** (`op=airunopen`)
- **R9** Refusals in order, nothing written on any: no run id, context type or id, `AI_RUN_NO_CONTEXT` (C-33.30); a known context kind the viewer is positionally outside (a discoverable project), membership's existence refusal (C-70.1); R7; R6; either principal absent, `AI_RUN_CAPABILITY_UNAVAILABLE` (C-33.29); R8; R3 over `bounds`; a run id already held, `AI_RUN_ALREADY_OPEN` (C-33.31); `rerunOf` naming itself, `AI_RUN_RERUN_SELF` (C-33.45); naming an absent or invisible run, `AI_RUN_RERUN_UNKNOWN` (C-33.46); one over another context, `AI_RUN_RERUN_OTHER_CONTEXT` (C-33.47).
- **R10** Success writes, in one transaction, the run (`running`, ticks 1, expires at open plus the lease or `leaseMs`), one bound row per declared bound, the handed manifest and bar verbatim, and the lens in force for the context at the open (a project's lens for a project, the instance's otherwise: in force, `statements_sha`, scope, bundles and revisions, instant). The answer is `{run, started, status, ticks, created, expires, rerun_of?, projectGate: {applied, ground, why, projects}}`, `projects` counting only the context's projects the viewer sees.

**tick({run, state, consume, log, leaseMs, at, actor, viewer, caller})** (`op=airuntick`)
- **R11** In order: absent or invisible, `{found: false}`; R5, nothing appended; R6 over the run's context; not `running`, `{ticked: false, status, bound}`; R3 over `consume`.
- **R12** In one transaction: each log entry is appended through observation-log's one writer as `authority_kind: run`, `actor_class: machine`, actor the run's Claude principal (a refused entry is returned in `refused`, the others appended); each consumed figure is added; the lease is extended; `state` replaces the run's state when given; ticks rise by one. If a bound is then exhausted the run ends through R14 (a `runtime` stop with condition `runtime-ceiling-reached`) and the answer carries `ended`.

**close({run, bound, condition, at, actor, viewer, caller})** (`op=airunclose`)
- **R13** A held run: invisible, `{found: false}`; R5 and R6 refuse with the run untouched. The run ends through R14 with the offered bound as given. After an ending, `bias` is told of the close through R30, and its answer, when it gives one, is carried as `bias_debt`.

**The one exit**
- **R14** Only this moves a run out of `running`. It refuses a bound failing R2 and a condition failing the observation log's condition check (C-22.4). In one transaction it writes the terminal log entry (level of the last entry, subject the context, the rolled-up search state: `PRESENT` over `partial` over `LOOKED_INDETERMINATE` over `LOOKED_ABSENT` over `NEVER_LOOKED`, a bound-stopped `LOOKED_ABSENT` or `NEVER_LOOKED` read as `LOOKED_INDETERMINATE`, `PRESENT` referring to its observation) and the status by R1 with the bound, condition and instant. A run already ended is left as it is, and the answer says so.

**reap(now), reapDue(now), reapWake(now)** For `scheduler`.
- **R15** `reapDue` counts running runs whose lease lapsed; `reapWake` is the earliest lease expiry of a running run, never before now, or null when none runs; `reap` ends each lapsed run with bound `lease` through R14 and answers `{at, lapsed, reaped}`.

**wake(now), wakeDue(now), wakeWake(now)** For `scheduler`.
- **R16** Through the wait source `capture-requests` registers (K71): a running run with an outstanding request has its lease extended; a running run with completed requests not yet woken gets, in one transaction, a log entry at level `internet` stating how many were captured and refused and the resume decision, its lease extended and those completions marked woken. At most 25 runs per tick; due and wake only while such a run exists.
- **R17** With no wait source registered, `wakeDue` is 0 and nothing is held or woken. *(not yet met: N39, K71 — the wake reads `capture_requests` directly)*
- **R18** A woken run is dispatched to `agent-worker` only when its `principal_plane` equals `<principal>/<tokenId>` of the instance's organisation `ai` credential, on record and unrevoked; otherwise the decision is withheld and named (`MEMBER_PRINCIPAL_RUN`, `NOT_THE_INSTANCE_CREDENTIALS_RUN`, `AGENT_WORKER_UNBOUND`, `NAMESPACE_UNDETERMINED`, `INSTANCE_AI_CREDENTIAL_NOT_ON_RECORD`, `…_REVOKED`, `…_NOT_ORGANISATION`, `CREDENTIAL_RECORD_SILENT`). A dispatch waits at most 30 s (configurable); one refused or silent appends a log entry saying the run is still resumable. The credential's value never enters the record.

**read({run, viewer})** (`op=airun`)
- **R19** Absent or invisible: `{found: false, session: null}`. Otherwise `session`: `id`, `label`, `mode`, `status`, `ticks`, `created`, `updated`, `expires`, `context` (a project run adds `questions`: the questions the project confirmed-cites that the viewer sees), `principal: {plane, claude, ref, skill}`, `budget`, `condition` (the stopping bound's or ending's sentence), `bias` (R20), `standard` (R21).
- **R20** The lens block: `in_force` and `manifest` (the handed manifest; "no manifest was in force", or unreadable, stated), `now` (the lens in force now), `at_open` (recorded, unreadable, or "not recorded"), `moved` (at open against now where the open is recorded; else handed against now; null when either is undetermined), `moved_basis`, and `hand` (`in_force` or `stale`: whether the handed lens was the one in force at the open).
- **R21** The bar: `basis` is `recorded`, `none-recorded` (a project run with none), `context-has-no-project`, `names-no-axis` or `unreadable`, with its `STANDARD_BASIS` sentence; `pair: {capture, connection}` only when recorded; never filled in.

**listInContext({contextType, contextId, viewer, limit})** (`op=airuns`)
- **R22** No type is `AI_RUNS_NO_CONTEXT_TYPE` (C-36.1), an unknown one `AI_RUNS_UNKNOWN_CONTEXT_TYPE` (C-36.2), no id `AI_RUNS_NO_CONTEXT_ID` (C-36.3). Otherwise the visible runs over that context, newest first, each as R19, `limit` clamped to [1, 1,000] (200 by default), with `truncated`.

**spawnPayload({run, half, viewer})** (`op=airunspawn`)
- **R23** Absent or invisible: `found: false`. The `search` half carries the run's context, mode, skill, bar and budget and no lens field at all; the `compose` half adds R20. The budget is read under a cap of the number of bounds, with `truncated`.

**log({run, viewer, limit})** (`op=airunlog`)
- **R24** Absent or invisible: `found: false`, no entries. Otherwise the run's log entries in order, numbered from 1, an observation `result_ref` rewritten to that ordinal, each with its coverage; `limit` clamped to [1, 5,000] (200 by default) with `truncated`; `stopped`; and the vocabulary (states, levels, bounds, endings, coverage).

**The surfacing step, registered with `promotion`** (K31)
- **R25** A promotion creating an inquiry under an assistant principal names a run: absent, invisible or unnamed is `SURFACE_NO_RUN` (C-66.1); then R5; not running, `SURFACE_RUN_NOT_RUNNING` (C-66.2); no `surfaces` bound, `SURFACE_NO_BOUND` (C-66.3); the bound reached, `SURFACE_BOUND_REACHED` (C-66.4). Each refuses the whole promotion.
- **R26** Inside the promotion's transaction, a surfacing row `{bundle_id, run, principal, at}` is written and `surfaces` consumed by one; the answer's `surfaced_in` carries the run, instant and bound.
- **R27** `surfacedIn(bundleId, viewer)`: a question with no surfacing row is "not recorded"; one whose run the viewer cannot read says so; otherwise the run, principal, instant, context, status and R20's block.

**For the modules that produce under a run: runFor(run, viewer), boundOf(run, bound), consumeBound(run, bound, n)** For `run-productions`, `capture-requests` and `contradiction`'s run gate (R37).
- **R28** `runFor` answers `{run, status, mode, context_type, context_id, principal_plane}` for a held run the viewer can see, and null for a blank id, an absent run or an invisible one alike; it never throws and writes nothing. Whether the caller holds the run is R5 over `principal_plane`.
- **R29** `boundOf` answers a run's `{allowed, consumed}` for one bound, or null when the run declared none. `consumeBound` adds `n` to that bound's consumption inside the caller's transaction, making the row (allowed 0) when none was declared; `n` of 0 writes nothing; an `n` that is not a non-negative safe integer is `AI_RUN_CONSUME_INVALID` (C-22.13) and nothing is written. It never ends a run: an exhausted bound ends it at the next tick (R12).

**The bias debt's work products, registered with `bias`** (K82 (3), K31)
- **R30** Each run is registered with `bias` as a work product: its context, principals, the lens recorded at the open, the handed manifest and whether a viewer can read it (R19's sight); and R13 tells `bias` of each close with the run's `rerun_of`. A run whose conditions were not recorded is offered as undetermined, never filled in (R32). *(not yet met: K82 (3) — the debt sweep reads `ai_runs` in the store)*

## Private

### Uses

- `legacy-checks`: the rows of R35 until they move, `isMachineIdentity`, `canonicalJson`, `normalizeType`, `OBJECT_TYPES`.
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge`, `bundles` and `refs` by its read contract.
- `membership`: `membershipOf(ctx)`, the bundle gate, `inSight`, `participation`, `existenceAct`, `aiCredentialLook` (R18), `viewerPredicate`.
- `promotion`: `registerStep` for R25–R26.
- `connections`: `citesInto` (R10's projects, R19's questions).
- `bias`: `biasManifest` (R10, R20); the work-product registration (R30).
- `observation-log`: the one writer (R12, R14, R16, R18), the run's rows (R14, R24), the condition check (C-22.4) and the vocabulary (N49).
- `retrieval`: the hidden-run predicate and `surfaced_in` decoration it offers (R36).
- `inquiry`: the migration-replay arm of `surfaced_in` (R27; map §5.8).
- `contradiction`: the run gate it offers (R37).

### Invariants

- **R31** The one exit (R14): no run is over while its log is silent; the log is append-only.
- **R32** A run's conditions are recorded at the open and never derived later; the handed manifest is stored verbatim.
- **R33** The surfacing step names a running run whose principal is the caller (R5, R25); a run's work is never re-attributed to another principal (R18).
- **R34** The search half of a run never receives the lens (R23); bias shapes weighing, never searching.
- **R35** Each check moves here as an invariant with its test (K6): C-22.5, C-22.7 (with `checkSkillVersion`, K82 (4)), C-22.8, C-22.11–C-22.16, C-33.29–C-33.31, C-33.45–C-33.47, C-36.1–C-36.3, C-66.1–C-66.4.
- **R36** Hidden runs: `ai-runs` registers with `retrieval` (and observation-log's `run` resolver) the predicate "runs over projects this viewer cannot see" and the `surfaced_in` decoration (K75 (2), K80). *(not yet met: K80 — `#hiddenRunTail` and `#surfacedIn` sit in the store)*
- **R37** The run gate `contradiction` offers (its R21) is filled here from R28 and R5. *(not yet met: K31)*
- **R38** `ai_runs`, `ai_run_bounds` and `inquiry_run_surfacings` are declared to record-core's purge (K23; `inquiry_run_surfacings` by bundle). Only this module writes them; a production spends a bound through R29.
- **R39** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §3 (reads, the stated viewer), §11 (the run is an object; item 5 rules 1–3), §14 (bias a fence first), §14a (the cascade, running sessions visible in context), §14b items 3, 6 and 7 (resumable, bounded, the one exit, partial results).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §2 (the four roles), §3 rules 1–5, 8 and 10, §6 (the credential cascade, the woken run's caller), §7.3 (the `mints` bound).
- `docs/development/OBSERVATION-LOG-DESIGN.md` §4.4 (the run's log is the observation log).
- `docs/architecture/BIO_Content_Framework_v0_10.md` §13 (the lens a run was formed under).
- `docs/development/SCHEDULER.md` (interval consumers, self-terminating).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (sight); Bob's DEC-24, DEC-55, DEC-60, DEC-62, DEC-63.
- `build/layers.md`, layer 6's contract.

### Suggestions

- **Factory.** `aiRunsOf(ctx, env)` answers the one instance per Durable Object storage (the resume needs the `AGENT_WORKER` binding, the instance credential's secret and the `STORE` namespace) and reaches its uses through their factories (K61). The op handlers move here (K3); `scheduler` calls R15 and R16.
- **Registrations offered:** the wait source (R16; `capture-requests` fills it, K71). **Filled:** promotion's step (R25–R26), observation-log's `run` resolver, retrieval's hidden-run predicate and `surfaced_in` decoration (R36), contradiction's run gate (R37), bias's work products (R30).
- **What stays out.** `op=suggest`, `op=extractpropose`, `op=extractproposals`, `proposed_readings`, `suggest_refusals` and C-27 are `run-productions`'. The bias debt and C-26.13–C-26.19 are `bias`'s (K82 (3)); its queue item (`#obligationsBiasDebt`) is `queue`'s. The migration replay's `surfaced_in` arm and C-66.5 are `inquiry`'s; C-66.6 (`REPLAY_UNVERIFIED`) is `control-plane`'s; `aiCredentialLook` and C-29 are `membership`'s; `searchedSection` is `publication`'s.
- **For callers.** The control plane stamps `principal` (as `principalPlane` or `caller`), `actor` and `viewer`, deleting a body's.
- **Tests.** Each refusal gets a negative control; R14 and R15 get the killed-run arm (a lapsed lease is reaped with its terminal entry); R18 the arm that counts calls at the binding; R23 the arm proving the search half has no lens field; R28 the arm proving an invisible run and an absent one answer alike.

## Open for Bob

1. **Should the record refuse opening a run in a mode that is not deployed?** (agent-worker's Open for Bob 2, placed here by K81.) Today the plane stores any mode string: a caller that never runs `agent-worker` can open an `investigate` or `extract` run, and `run-productions` accepts EXTRACT proposals under an `extract` run although that mode is not deployed. The canon says every "may not" is a refusal in the plane (INVESTIGATIVE-SESSION §14b.4). *Recommendation:* yes: R9 refuses a mode outside the one deployment order's deployed members, by a new catalogue code, so no production can be made under an undeployed mode; `agent-worker`'s gate stays as its first row.
