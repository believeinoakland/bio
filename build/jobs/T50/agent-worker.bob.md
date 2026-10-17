# BOB to agent-worker (T50)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 6, agent-worker: **T50-65 · agent-worker**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/agent-worker.md` (read whole), folded by K3615 and K3637; the ids marked `*(not yet met: T50)*` are yours to meet: R109 (every path dispatches to `REMOTE` only), R110 (503 `ASSISTANT_REMOTE_NOT_READY` until a check passed), R111 (`/signin` relayed, CONDITIONAL on agent-runner R38), R112 (usage carries model and effort), R113 (progress as written, `ASK_CHECK_FAILED`), R114 (a run's reads ticked), R115 (the credential's fence), R116 (level disagreement read once), R117 (a condition outside the vocabulary handed back once).
BOB's notes for this job:
1. After T50-64 (agent-runner, merged first). R109, R110 and R112 are unconditional; R111 only once T50-64's proof passes (BOB's CHANGE says so). K3637: R110's key is named (DEC-301, not owed).
2. K3637 doubts: (1) a run's reads carry structured `read: {record, n, total, outcome}` beside `detail`, served by `airunlog`, so no screen parses English (R114); (2) R113 as drafted, `ASK_CHECK_FAILED` included; (3) buffering past agent-worker is T50-35's and T50-36's: a passing R113 is REPORTed; (4) R115 may need only its test; (6) a level disagreement is stated and read once (R116); (7) R26 unchanged; (8) a run ended by the explorer's own cap closes `completed`, the reason on the step.
3. Same-layer services: agent-harness R19 and agent-model R23, R24 (R116, R117): they merge before you; build against their requirements and merge the tranche branch on BOB's CHANGE. Your N1186 share (a run's reads within its project) uses credentials R79 (T50-5, L2, merged).
4. START re-measures: agent-worker is 4,077 lines today (past ~4,000, P6): it runs in T50 (the remote proof first, K3611); its split by copy is T51's first entry (N1205; P8, one job per module).
5. M-T50-5 (N1186): one run as a plain member on biosmoke8 once T50-64's proof stands, before T50-65 closes. Rule 9 (the remote proof) governs every remote step.
6. `op=airuntick`, `op=airunlog` and `op=meaningrows` are existing ops (routed and declared today); R114 changes `airunlog`'s answer, not its declaration. No new op for this job.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L6 merge order: agent-runner first (N1197, K3611), then `modules.json`'s (inquiry, basis-versions, run-rules, ai-use, ai-runs, capture-requests, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-worker).
DEC-307 (U321, K3659): `refusal.SIGNIN_EXPIRED` now has its word; your R84 reads it by key (`word("refusal.SIGNIN_EXPIRED")`), never inline English.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).

## B2 · ANSWER · re J1

K3693. (1) Keep the check record in agent-worker's own storage, no new agent-runner route: the remote route itself is with Bob (agent-runner's proof blocked at step 0, K3692), so today no pass can exist and every gated call answers 503 ASSISTANT_REMOTE_NOT_READY; R111 stays unbuilt (conditional) and will write that record when it is built. (2) Yes. (3) Yes, signin accounts only; apikey unchanged. (4) Yes. (5) Yes; a CHANGE follows as agent-harness and agent-model merge.

## B3 · CHANGE

agent-runner (R35: AgentRunner.fetch answers 410 LOCAL_RUNNER_DISABLED to everything; R39 remote-log.mjs), agent-model (R23 judgeTools(levels, conditions), R24 judge_compose's disagreements) and reading-guides are merged into tranche/T50 (K3694). Merge tranche/T50 into your branch and build R116/R117 against agent-model's real names. Until your R109/R110 land, any call to RUNNER answers 410 LOCAL_RUNNER_DISABLED. Your bundle is regenerated by BOB at L6's close (R45 red accepted until then).

## B4 · CHANGE

inquiry, basis-versions, run-rules (R35 levelEmptyHolds) and ai-use are merged into tranche/T50 (K3699). Merge tranche/T50 into your branch, re-run your tests against the real modules, and post COMPLETE again (or your next entry).

## B5 · CHANGE

agent-harness is merged (K3700): R18 means emptyLevelCandidates composes nothing without state.scope, and R19's disagreementsToSettle. Merge tranche/T50: 8 of your test files (fanout, harness, r085, r101, r103, r107, requirements, wire-vocabulary) go red until you set scope per level from the plane's four-level statement (retrieval R13's documents, the greatest over a level's reads), state each disagreementsToSettle pair, and give the fixtures a scope. That is your T50-65 work; fix them in your module and report any that need another module.

## B6 · ANSWER · re J2

K3704. (1) Correction: scope.documents is the GREATEST documents any of the level's reads stated, not the least (agent-harness R18 as worded at K3691: a read of 0 and one of 2 keep the candidate). Now your R118; merge tranche/T50, rebuild runSubsessions so, with R118's tests. (2) CHECKS / CheckRecord accepted: R35 says it; the installer binds it. (3) agent-runner R36's class is RemoteSession, as you assumed. (4) The airuntick/airunlog keys question goes to AI-RUNS #25; I forward its answer. (5) Your readings of R113/R114 stand. (6) The unkeyed sentences join N1217 for T51. Post COMPLETE when done.
