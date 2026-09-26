# ai-runs — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 6. Code today (measured on `tranche/T3` @ `35ea098`; `build/extraction/ai-runs.md` has the table): `bio-plane/src/airun.mjs` 1–105, 1639–1930, 2140–2551 (the run's vocabulary and pure rules; 106–1404 and 1931–2139 are observation-log's by K78 (3), 1405–1638 are publication's, map §5.3); `bio-plane/src/store.mjs` 41257–41330 and 41363–41387 (the IS-6 header and constants), 43427–45911 (the run: log door, search roll-up, the one exit, context and project gates, `aiRunOpen`, `aiRunTick`, `aiRunClose`, reaper, wake and resume, `aiRunRead`, `aiRunsInContext`, the run's lens block, the bias-debt sweep and its acts, `aiRunSpawnPayload`, `aiRunLog`), 39022–40075 (`op=suggest`), 22311–22685 (the EXTRACT run's productions), 17353–17413 (`#surfacingGate`), 18731–18744 (the surfacing row inside the promotion step), 2163–2197 (`#surfacedIn`), 1316–1372 and 1420–1463 (migrations), and the dispatch entries `extractpropose`, `extractproposals`, `airunspawn`, `suggest`, `airunopen`, `airuntick`, `airunclose`, `airun`, `biasdebtresolve`, `biasdebt`, `airunlog`, `airuns` (48651–48674, 49002–49012, 49217–49227, 49271–49314, 49329–49337); `bio-plane/checks/bio-checks.mjs` 6114–6571 (the run's rows of C-22), 6573–6654 (C-36), 7707–7989 (the suggest kinds and C-27), 8198–8264 (C-26.13–C-26.19), 9860–9953 (C-33.29–.31, .45–.47), 13661–13737 (C-66); `schema.mjs` 2027–2111 (`ai_runs`, `ai_run_bounds`, `inquiry_run_surfacings`), 3262–3332 (`proposed_readings`), 3660–3691 and 3823–3849 (the bias-debt tables). `from`: `legacy-store` and `legacy-checks`; `index.mjs` holds only these ops' routing, classes and principal stamps, which stay with `control-plane` (K3). Not yet met: R17 (N39, K71), R34 (D-595), R38 (DEC-49; no catalogue rows), R50 (K75 (2), K80), R51 (K31). Old-plan rows carried to `ai-runs`: D-595 (R34) and D-375 (map §5.4: its code is observation-log's).

**Size (P6).** About 6,180 lines as the code stands (about 2,510 without comment-only lines): `store.mjs` 4,240, `airun.mjs` 810, `bio-checks.mjs` 920, `schema.mjs` 215. Of the checks, about 250 lines are observation-log's C-22 rows (K78 (3)), leaving about 5,930. **Over the 4,000 mark: BOB reports it.** Proposed split (Open for Bob 1), by the three groups below: **`ai-runs`**, the run object (R1–R27, R45–R53; about 3,610 lines, 1,380 of code); **`run-productions`**, a new module directly after it holding `op=suggest` and the EXTRACT proposals (R28–R38; about 1,750 lines, 790 of code), using `ai-runs`; and **the bias debt** (R39–R44; about 580 lines, 340 of code) to `bias` by registration, which is bias's Open for Bob 3 in either answer (Open for Bob 2). Each part then reads whole with its uses' public parts.

## Public

### Purpose

The AI run: a durable, bounded, attributed object a member opens over a question or a project, under which the assistant finds, pursues, extracts and checks. It records the conditions the work was formed under (the principals, the skill version, the lens in force, the project's bar), holds the budget, keeps a log of where the search went through the observation log, ends through one exit that names what stopped it, and is reaped when it dies. What a run produces enters only as suggestions and labelled machine work; nothing here accepts, attests, concludes or captures.

### Provides

Terms. A **run** is `{run, status, label, mode, context_type, context_id, principal_plane, principal_claude, principal_claude_ref, skill_version, bias_manifest, standard_pair, lens_at_open, rerun_of, created, updated, expires, ticks, state, stopped_bound, stopped_condition, stopped_at}`. Its **context** is an `inquiry` or a `project`. `principal_plane` is `member:<id>/<tokenId>` for a member's credential or `class:<cls>` for a deploy token; `principal_claude` is the Claude-account level that pays. A **bound** is one of `fetches`, `subsessions`, `wallclock`, `runtime`, `mints`, `surfaces`, `lease`; an **ending** is `completed`, `cancelled` or `mode-not-deployed`. The **lease** is 3,600,000 ms, extended by every tick. A run is **visible** to a viewer when its context bundle is (membership's gate); an invisible run answers as an absent one throughout. `viewer`, `actor`, `caller` and `principalPlane` are the control plane's stamps. Every refusal names `code` and carries its catalogue `check` and `translation`, except where R38 says.

#### The run (proposed `ai-runs`)

**The vocabulary and pure rules: RUN_BOUNDS, RUN_ENDINGS, RUN_STATUS, RUN_NEVER_STARTED, runStatusFor, STANDARD_BASIS, RUN_CONTEXTS, checkBound, checkConsume, PLANE_COUNTED_BOUNDS, PLANE_DECIDED_BOUNDS, finishedBound, projectGate, PROJECT_GATE_GROUNDS, runConsultsProjects, checkRunContextKind, runPrincipalOf, runPrincipalGate, checkSkillVersion, translationOf** Pure; never throw.
- **R1** The bounds and endings are exactly those above; `runStatusFor` answers `never-started` for `mode-not-deployed`, `stopped` for a bound, `finished` otherwise.
- **R2** `checkBound`: a name that is neither a bound nor an ending is `AI_RUN_BOUND_UNNAMED` (C-22.5).
- **R3** `checkConsume` (list form at open, map form at tick): a non-list or non-map shape, or an unknown bound, is `AI_RUN_BOUND_UNKNOWN` (C-22.15); any figure for `lease`, or a non-zero figure a caller sends for `mints` or `surfaces`, is `AI_RUN_BOUND_PLANE_COUNTED` (C-22.14); a declared allowance absent or zero is `AI_RUN_BOUND_NO_ALLOWANCE` (C-22.16); a figure that is not a non-negative safe integer is `AI_RUN_CONSUME_INVALID` (C-22.13).
- **R4** `finishedBound`: an offered bound wins; else the first exhausted bound (allowed above 0, consumed at or past it) in R1's order; else `lease` when expired; else `completed`.
- **R5** `runPrincipalGate` compares caller and principal with a member credential's `/<tokenId>` removed; equal and non-empty passes, anything else is `AI_RUN_NOT_PRINCIPAL` (C-22.12) naming the act.
- **R6** `projectGate`: no actor passes unapplied (`NO_MEMBER_BEHIND_CALLER`); an inquiry context passes unapplied (`INQUIRY`); a project context passes when the actor has joined one of its projects (`PARTICIPANT`), else `AI_RUN_NOT_PROJECT_MEMBER` (C-22.8).
- **R7** `checkRunContextKind`: a context type outside `RUN_CONTEXTS`, or a context whose held kind (an unseen one is absent) differs, is `AI_RUN_NO_SUCH_CONTEXT` (C-22.11).
- **R8** `checkSkillVersion`: a blank version, or one not `<pack>@<edition>`, is `AI_RUN_SKILL_VERSION_UNNAMED` (C-22.7); any well-formed version is accepted, current pack or not. *(today in `skillpack.mjs`, later in the order: map §5.2)*

**open({run, contextType, contextId, label, mode, principalPlane, principalClaude, principalClaudeRef, skillVersion, biasManifest, standardPair, bounds, state, leaseMs, at, rerunOf, actor, viewer})** (`op=airunopen`)
- **R9** Refusals in order, nothing written on any: no run id, context type or id, `AI_RUN_NO_CONTEXT` (C-33.30); a known context kind the viewer is positionally outside (a discoverable project), membership's existence refusal (C-70.1); R7; R6; either principal absent, `AI_RUN_CAPABILITY_UNAVAILABLE` (C-33.29); R8; R3 over `bounds`; a run id already held, `AI_RUN_ALREADY_OPEN` (C-33.31); `rerunOf` naming itself, `AI_RUN_RERUN_SELF` (C-33.45); naming an absent or invisible run, `AI_RUN_RERUN_UNKNOWN` (C-33.46); one over another context, `AI_RUN_RERUN_OTHER_CONTEXT` (C-33.47).
- **R10** Success writes, in one transaction, the run (`running`, ticks 1, expires at open plus the lease or `leaseMs`), one bound row per declared bound, the handed manifest and bar verbatim, and the lens in force for the context at the open (a project's lens for a project, the instance's otherwise: in force, `statements_sha`, scope, bundles and revisions, instant). The answer is `{run, started, status, ticks, created, expires, rerun_of?, projectGate: {applied, ground, why, projects}}`, `projects` counting only the context's projects the viewer sees.

**tick({run, state, consume, log, leaseMs, at, actor, viewer, caller})** (`op=airuntick`)
- **R11** In order: absent or invisible, `{found: false}`; R5, nothing appended; R6 over the run's context; not `running`, `{ticked: false, status, bound}`; R3 over `consume`.
- **R12** In one transaction: each log entry is appended through observation-log's one writer as `authority_kind: run`, `actor_class: machine`, actor the run's Claude principal (a refused entry is returned in `refused`, the others appended); each consumed figure is added; the lease is extended; `state` replaces the run's state when given; ticks rise by one. If a bound is then exhausted the run ends through R14 (a `runtime` stop with condition `runtime-ceiling-reached`) and the answer carries `ended`.

**close({run, bound, condition, at, actor, viewer, caller})** (`op=airunclose`)
- **R13** A held run: invisible, `{found: false}`; R5 and R6 refuse with the run untouched. The run ends through R14 with the offered bound as given. After an ending, R44 is asked and its outcome carried as `bias_debt`.

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

#### The productions (proposed `run-productions`)

**suggest({target, kind, run, author, viewer, caller, name, description, claim, relationship, derived_from, level, observed_at, grounds, legs, …})** (`op=suggest`) The investigative session's one write.
- **R28** Shape refusals in order: `SUGGEST_NO_TARGET` (C-27.1); a target absent, invisible or not an inquiry, `SUGGEST_NOT_AN_INQUIRY` (C-27.2); a kind outside the five suggestion kinds, `SUGGEST_UNKNOWN_KIND` (C-27.3); a run absent, invisible or unnamed, `SUGGEST_NO_RUN` (C-27.4); R5; not running, `SUGGEST_RUN_NOT_RUNNING` (C-27.18); a target that is neither the run's context nor, for a project run, a question the project confirmed-cites, `SUGGEST_OUTSIDE_RUN_CONTEXT` (C-27.19); `SUGGEST_NO_DOCUMENT` (C-27.17); `SUGGEST_NAME_TAKEN` (C-27.5); more than 120 legs, `SUGGEST_TOO_MANY_LEGS` (C-27.7); a `level-empty` suggestion without its level (one of meaning, content, documents, internet) and observation address, `SUGGEST_EMPTY_LEVEL_UNSTATED` (C-27.6).
- **R29** The pre-write checks, each a named verdict: `SUGGEST_UNWRITABLE_STATE` (C-27.13), `SUGGEST_BOILERPLATE` (C-27.12), `SUGGEST_LEG_UNREACHABLE` (C-27.8: a leg on a retired or uncitable target), `SUGGEST_PAIR_DOES_NOT_COMPUTE` (C-27.9), `SUGGEST_COMPARISON_INCOMPLETE` (C-27.16: an independence trace past 200 steps is undetermined, never independent), `SUGGEST_BRANCHES_NOT_INDEPENDENT` (C-27.11), `SUGGEST_NOT_DIFFERENT` (C-27.10: the same as a version held, compared as the document would store it), then `SUGGEST_UNWRITABLE_DOCUMENT` (C-27.14).
- **R30** Success writes exactly one basis version of the target, in state `suggested`, carrying its run, kind, author and description, through promotion's one write path; a machine author's grounds are asserted by no one. Nothing is accepted, hidden, rejected or made current; nothing is captured or requested; no notification is sent.
- **R31** `SUGGEST_KINDS` is `basis-version`, `sharpen-question`, `new-inquiry`, `level-empty`, `new-edition`; `SUGGEST_LEVELS` is `meaning`, `content`, `documents`, `internet`.
- **R32** Refusals and verdicts are asked before anything is written; a refused suggestion writes nothing.
- **R33** The target and run are the body's; `author`, `viewer` and `caller` are stamps and a body's are overwritten.
- **R34** Each suggested leg names the capture the run read (`extent_capture`), so a suggestion says which version of a document it rests on. *(not yet met: D-595)*

**extractPropose({run, bundleId, fn, version, cap, refs, at, proposedBy, viewer, caller})** (`op=extractpropose`) The EXTRACT role's productions.
- **R35** Refusals in order: `NO_PROPOSER`; `NO_RUN`; `NO_SUCH_RUN` (absent or invisible); R5; `RUN_NOT_RUNNING`; `NOT_AN_EXTRACT_RUN` (mode not `extract`); `NO_MINTS_BOUND` (none, or allowed 0); `MINTS_BOUND_REACHED`; `NO_PROPOSALS`; `NO_TARGET`; `NO_SUCH_BUNDLE` (absent or invisible); `NOT_A_DOCUMENT`; `NO_BYTES_HELD`; each reference's own check, with `at_index`; `MINTS_BOUND_WOULD_EXCEED` (the batch refused whole, never trimmed).
- **R36** Success writes, in one transaction, one proposed reading per reference carrying the run, the proposer stamp and the chain step `ai(fn, version)`; a reference with a position is minted as a content row by `content` (machine-marked, labelled); a mint content refuses is recorded as `mint_refused`, never dropped; `mints` is consumed by the rows newly minted.
- **R37** `extractProposals({run, bundleId, viewer, limit})` (`op=extractproposals`): neither run nor bundle is `NO_SCOPE`; otherwise the proposals the viewer may see, `limit` 100 by default, with `truncated` and the minted-to-cited ratio.
- **R38** Every refusal of R35 and R37 carries a catalogue check and translation. *(not yet met: DEC-49 — these codes have no rows; a `legacy-checks` entry)*

#### The bias debt (placed here by K78 (2); proposed to `bias`, Open for Bob 2)

- **R39** `biasDebtSweep(now)` for `scheduler`: due only while the lens inputs (the adoptions and their bundles' shas and states) differ from the last complete sweep's fingerprint. Runs are read in batches (50 by default) resuming from a cursor; each through R20 as the administrator viewer: `moved: true` raises a debt (`context`, `moved_basis`, `lens_then`, `lens_now`, `recipients`, `raised`) or restates a changed one; a debt settled by a member's act or a re-run stays settled while its lenses are unchanged; `moved: false` settles an open debt as `lens_returned`; `moved: null` raises and clears nothing.
- **R40** A debt's recipients are the run's member principal and the owners of a project context (at most 50), each active and able to read the run.
- **R41** `resolve({run, reason, actor, viewer, at})` (`op=biasdebtresolve`): no run, `BIAS_DEBT_NO_RUN` (C-26.13); no actor, C-26.14; a machine actor, `BIAS_DEBT_MACHINE_CANNOT_RESOLVE` (C-26.15); no reason, C-26.16; a reason over 4,000 characters, C-26.17; no open or visible debt, `BIAS_DEBT_NO_SUCH_DEBT` (C-26.18); already settled, C-26.19. Success appends a settlement `resolved` with the actor and reason.
- **R42** `read({run, viewer, limit})` (`op=biasdebt`): a debt the viewer may see, with its settled state (`kind_state` undetermined for a settlement recorded without a kind) and its settlements, at most 50.
- **R43** Every settlement is appended, never rewritten; a debt is disclosed and blocks nothing.
- **R44** A re-run's close discharges the debt of the run it re-ran only when the lens it ran under equals the lens now in force; otherwise it answers `no_open_debt`, `lens_undetermined` or `other_lens` and settles nothing.

## Private

### Uses

- `legacy-checks`: the rows of R49 until they move, `isMachineIdentity`, `canonicalJson`.
- `record-core`: `recordOf(ctx)`, `transact`, `declarePurge`, `bundles` by its read contract.
- `membership`: `membershipOf(ctx)`, the bundle gate, `inSight`, `participation`, `existenceAct`, `aiCredentialLook`, project owners and active members (R40).
- `promotion`: `registerStep` for R25–R26; `promote` for R30. *(not declared)*
- `observation-log`: the one writer (R12, R14, R16, R18), the run's rows (R14, R24), the condition check (C-22.4) and the vocabulary (N49). *(not declared)*
- `connections`: `citesInto` (R19's questions, R28's target rule). *(not declared)*
- `bias`: `biasManifest` (R10, R20), `lensFingerprint`/`onLensChange` (R39).
- `content`: `mint` (R36), `captureFor`, `contentContextFor` through `extraction`.
- `extraction`: the EXTRACT vocabulary and `contentContextFor` (R35–R36).
- `inquiry`, `basis-versions`: the target question and its versions (R28–R30).
- `strength`: the strength walk and independence trace (R29). *(not declared)*
- `retrieval`, `contradiction`: registration only (R50, R51).
- `capture`: declared; nothing here calls it (the wake's source is `capture-requests`', K71).

### Invariants

- **R45** The one exit (R14): no run is over while its log is silent; the log is append-only.
- **R46** A run's conditions are recorded at the open and never derived later; the handed manifest is stored verbatim.
- **R47** Every production names a running run whose principal is the caller (R5); a run's work is never re-attributed to another principal (R18).
- **R48** The search half of a run never receives the lens (R23); bias shapes weighing, never searching.
- **R49** Each check moves here as an invariant with its test (K6): C-22.5, C-22.7, C-22.8, C-22.11–C-22.16, C-33.29–C-33.31, C-33.45–C-33.47, C-36.1–C-36.3, C-66.1–C-66.4, C-27.1–C-27.14, C-27.16–C-27.19, C-26.13–C-26.19.
- **R50** Hidden runs: `ai-runs` registers with `retrieval` (and observation-log's `run` resolver) the predicate "runs over projects this viewer cannot see" and the `surfaced_in` decoration (K75 (2), K80). *(not yet met: K80 — `#hiddenRunTail` and `#surfacedIn` sit in the store)*
- **R51** The run gate `contradiction` offers (its R21) is filled here. *(not yet met: K31)*
- **R52** `ai_runs`, `ai_run_bounds`, `inquiry_run_surfacings`, `proposed_readings` and the bias-debt tables are declared to record-core's purge (K23; `inquiry_run_surfacings` and `proposed_readings` by bundle).
- **R53** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/INVESTIGATIVE-SESSION.md` §3 (reads, the stated viewer), §4 (the fence), §9 (what a suggestion is), §10 (one write path), §11 (the run is an object; item 5 rules 1–3), §14 (bias a fence first), §14a, §14b items 3–7 (resumable, bounded, the one exit, partial results).
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §2 (the four roles), §3 rules 1–5, 8 and 10, §6 (the credential cascade, the woken run's caller), §7.3 (EXTRACT's productions and bound).
- `docs/development/OBSERVATION-LOG-DESIGN.md` §4.4 (the run's log is the observation log).
- `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt); `docs/architecture/BIO_Content_Framework_v0_10.md` §13.
- `docs/development/SCHEDULER.md` (interval consumers, self-terminating).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (sight); Bob's DEC-24, DEC-55, DEC-60, DEC-62, DEC-63.
- `build/layers.md`, layer 6's contract.

### Suggestions

- **Factory.** `aiRunsOf(ctx, env)` answers the one instance per Durable Object storage (the resume needs the `AGENT_WORKER` binding, the instance credential's secret and the `STORE` namespace) and reaches its uses through their factories (K61). The op handlers move here (K3); `scheduler` calls R15, R16 and R39.
- **Registrations offered:** the wait source (R16; `capture-requests` fills it, K71). **Filled:** promotion's step (R25–R26), observation-log's `run` resolver, retrieval's hidden-run predicate and `surfaced_in` decoration (R50), contradiction's run gate (R51), bias's lens-change notice (R39).
- **What stays out.** The bias-debt queue item (`#obligationsBiasDebt`) is `queue`'s, reading R42; the migration replay's `surfaced_in` arm and C-66.5 (`surfaced_by` rewritten) are `inquiry`'s; C-66.6 (`REPLAY_UNVERIFIED`) is `control-plane`'s; `aiCredentialLook` and C-29 are `membership`'s; the `searched` section in `airun.mjs` is `publication`'s.
- **For callers.** The control plane stamps `principal` (as `principalPlane` or `caller`), `actor`, `viewer`, `author` and `proposedBy`, deleting a body's, and admits the run productions only to their classes.
- **Tests.** Each refusal gets a negative control; R14 and R15 get the killed-run arm (a lapsed lease is reaped with its terminal entry); R18 the arm that counts calls at the binding; R23 the arm proving the search half has no lens field.

## Open for Bob

1. **Split `ai-runs` in two.** At about 5,930 lines it is past the 4,000 mark. *Recommendation:* a new module `run-productions` directly after `ai-runs`, holding `op=suggest` and the EXTRACT proposals (R28–R38, about 1,750 lines): they are what a run produces, and each already reaches the run only through R5 and its bounds. `ai-runs` keeps the run (about 3,610). Adding a module that carries capability is yours (layers ruling 5, amended); no capability is added or removed.
2. **Where the bias debt lives** (bias's Open for Bob 3). K78 (2) put it here because every debt is keyed by a run. *Recommendation:* move it to `bias` in either answer to that question, reading runs through a registration `ai-runs` fills (the lens at the open, the handed lens, the context, the principals) and told of a re-run's close: it is the lens's consequence, it keeps `ai-runs` under the mark, and if you extend debt to members' work, `inquiry` fills the same registration.
