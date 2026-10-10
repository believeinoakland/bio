# ai-runs (T41)

**Status** · session_01GR97XnUR7v9ZQaT1BcPwFh · depth 2 · WORKING · handled B11

## J1 · QUESTION

Four readings; I carry on with each as stated, and only R74/R73's step wiring and R52's ai-use half wait on your CHANGEs.

(1) R76, the run's actual cost. `ai-use` R1's counter is kept per owner, member, local day and use, not per run, and `ai-use` (earlier in the order) cannot read a run. My reading: the run keeps its own sums of the same `usage` entries its ticks pass to `ai-use.countUsage` (R72: tokens by figure, calls with a null as one, `estimated_cost_usd`/`total_cost_usd` where stated), on the run row; at close (R14, every path including the reaper) they are fixed as the run's `actual` (money where the account reported cost, else tokens and calls), answered on the close and in R19's `session.cost` only to a viewer who is an owner of `principal_claude` (member:<id> that member; project:<id> its owners; group an active administrator), absent for anyone else. `ai-use.actualOf({run})` (its R11) then has nothing to read here; if you want ai-use to answer it, it needs the run's sums handed to it (a registration), which I will add if you say so.

(2) R75. Reading: two tables of mine, `ai_test_bar` (Civicsmith's set results: `testBarRecord`, written by an in-plane harness call, no op, refusing a malformed record by `run-rules` R19's `checkVerification`-like shape check with a code of my own family) and `ai_group_tests` (a group's own matters: `groupTestSet` by any active member, storing part, matter, answers, by, at; results of the harness on a group set written by `testBarRecord` with `set: "group"`). `testBarRecords()` answers the well-formed Civicsmith records for `run-rules` R19's `deployable` to read (as `verifications()` today). `groupTestResults({part, viewer})` answers active members the group-set results with `false_alarm_rate`, never a deploy gate input. No transcript is stored (only the grading's figures). Codes: `TEST_BAR_INVALID`, `GROUP_TEST_INVALID`, next free numbers in run-rules' table? I read R35/run-rules R11 as: my acts' rows live in run-rules' table, which is run-rules' job (T41-21) to add; until it merges I mint them by key with a fallback row as `#refuse` does today. Tell me if the rows belong to my own table instead.

(3) R73 at close. Reading of "ends that step as steps R5 allows a machine": a run ending `completed` ends its step `ended` with every outcome `undetermined`; a run stopped by a bound, `cancelled`, `mode-not-deployed` or reaped (`lease`) sets its step `set_aside` with the reason (the bound's or ending's sentence); products tied through `steps.recordProduct` are the run's log rows whose `result_kind`/`result_ref` name a record (capture, content, connection, lead). A look under a step-run is appended with authority kind `step` and authority the step id (observation-log R1, R13), so R24's log and R14's rollup read both the run's own rows and its step rows; `origin` defaults to `member`, `explore` requires `step` (and `step` without `explore` is allowed for a member-started step run). Until steps merges, `steps` reaches me as an injected service built to its requirements (R1, R5, R9, `step`), re-pointed at your CHANGE; the `uses` edge to `steps` is in my record.

(4) R52 and agent-worker. Amended R52 makes `principal_claude` the paying owner (`member:<id>`, `project:<id>`, `group`) and `principal_claude_ref` the member whose act it is (today `principal_claude` is `member:<id>` and `principal_claude_ref` the opener's own label, stored verbatim). I apply it now for the account half (credentials R56 is merged: a project run asks `accountFor` with `act.project`; a project's key or sign-in now serves instead of being read as NO_ACCOUNT, which today it is), the dispatch body's `member` from `principal_claude_ref` and `level` `project` passed through. agent-worker R10 checks `member` against the run's `principal_claude`: it must read `principal_claude_ref` after my merge (a REPORT follows). The ai-use half (useCheck, countUsage with owner) waits on its CHANGE; until then the copy's member counter and ceiling stay.

## J2 · QUESTION

Adds to J1 (replaces none of it). Two more readings, carried on as stated.

(5) R74 `openMany`. The signature names `{steps, mode, owner, actor, viewer}`, but each run needs what `open` (R9) needs: the plane principal (the control plane's stamp), the skill version and bounds. Reading: `openMany({steps, mode, owner, bounds, skillVersion, principalPlane, actor, viewer, at})`, the member's act (actor a member; else `AI_RUN_NOT_A_MEMBER_ACT` via run-rules R18). For each step id, in order, at most 50: the step as `steps.step({step, viewer})` answers it (unseen or absent answered for that step as absent, the others go on); one `ai-use.estimate({owner, use: "run", mode, count: n})` for the batch, answered once at the top; each run then opens through R9 exactly as a single open (its context the step's place: a question-placed step's first referring question as `inquiry`, a project-placed step its `project`; a group-placed step refused for that step `AI_RUN_STEP_NO_CONTEXT`), with `step` and `origin: "member"`, run id minted `RUN-<step>-<n>`, its own `useCheck`; on open, the run's system step is created by `steps.stepCreate({place: <the member's step's place>, work: <its work>, run, by: principalPlane})` (steps R1's machine arm, its holding answered by B2's `registerRunHolder`), and the run is tied to that system step (R73 then governs its looks and close). Answer `{ok, estimate, runs: [{step, run?, system_step?, refusal?}]}`. If instead the run should work the member's own step (no new system step), say so.

(6) R73's refusals. Reading: `origin` outside `RUN_ORIGINS` is `AI_RUN_ORIGIN_UNKNOWN`; `origin: "explore"` without `step` `AI_RUN_EXPLORE_NEEDS_STEP`; `explore` while `investigate` is not deployable (run-rules R19, R23) `AI_RUN_EXPLORE_NOT_DEPLOYABLE`; a `step` the opener's principal may not see `AI_RUN_STEP_UNKNOWN` (absent and unseen alike). Asked after R40 and R46, before R45. Their rows, and R75's `TEST_BAR_INVALID`/`GROUP_TEST_INVALID`, I mint by key with a fallback row until run-rules' table holds them (J1 (2)); tell me the numbers or the table if otherwise.

B2 (registerRunHolder) is applied: `runHolder(by, run)` answers `{enabled_by: <principal_claude, the paying owner>, principal: <principal_plane>}` for a running run whose principal `by` is (run-rules R5), null otherwise (an unknown, ended or another's run), registered at start once steps is reachable.

## J3 · REPORT

agent-worker (against its R10 and R6), from ai-runs R52 as amended (B3 (4) taken). From my merge, a run's `principal_claude` is the paying owner (`member:<id>`, `project:<id>` or `group`) and `principal_claude_ref` the member whose act it is (`member:<id>`); R19's `principal.claude` and `principal.ref` answer them. agent-worker R10 checks the dispatch body's `account.member` against the run's `principal_claude`; it must compare against `principal_claude_ref` (a run the group's or a project's key pays now records `group`/`project:<id>` there, and a check against it refuses every such run). The dispatch body's `account.level` may now be `project` (credentials R56: a project's key, or its sole owner's sign-in, `kind: "signin"` with no secret), beside `member` and `group`; `suggestions` rides for `member` (the reference's or the sign-in's own switch, credentials R55) and `group` (`groupKeySwitches()`), and is `false` for `project` (no in-plane read of a project account's switches; credentials could offer one). Also for agent-worker R26: `usage` entries may carry `estimated_cost_usd` (null or an amount), judged by R72.

## J4 · BLOCKED

Cause: context (past half my window; mechanics §6.1). Restart me; everything is pushed on `job/T41/ai-runs` (tranche merged @ B3's 7b6a8a2cf6). Handled through B4.

**Reading set (§17 (3)).** Read whole myself: `requirements/ai-runs.md`, `ai-use.md`, `steps.md`, `run-rules.md`; layer 6's row and the investigation-engine section of `layers.md`; the plan's rules and T41-23; the K-lines START names; `ai-runs/index.mjs` (3,152 lines) and `schema.mjs`; tests world, converts, hidden-notices, open, producers, reads, scheduler, usage (the parts changed). A worker read whole plan, rows, state, surfacing, tick-close, transact, verify and the 13 used modules' Purpose and named services, and wrote a 41 KB summary citing file:line (scratch, not kept); nothing it left out mattered so far. Its flags for the deletion step: rows.test:18-20, :29, :45-52 and transact.test:53-61 call the R48–R52 methods and codes; world.mjs builds no ai-use; plan.test:71 needs `plan` last in R19's session (kept).

**Done (tests 78/78; format 0, architecture 0, ownership 0; coverage 1: R74).**
- D54: the 10 listed tests re-stated with controls (invited administrator, discoverable project, owner); :201's internal read is a machine viewer (`class:daemon`), tested over a hidden project's run with R1 as control.
- Rule 4 (12) scheduler:123 cleared: `accountUsesSet`; the dispatch's `suggestions` now read for a sign-in (its own switch) and the group key (`groupKeySwitches()`, credentials R37), each tested on and off; project level `false` (reported, J3).
- B2: `runHolder(by, run)`, registered with steps at start (via `deps.steps` until its merge); tested with null controls.
- R73: `open` takes `step`, `origin` (four refusals, rows pending in run-rules C-22.24–.28, fallback rows in `#PENDING_ROWS`); a step-run's entries (looks, wake, terminal) go under authority `step`, tied to the run in `ai_run_looks`, so R24's log and R14's rollup read them; at close `#endStep` ties products (`recordProduct`) and ends the step (`ended` / `set_aside` with the reason).
- R75: `testBarRecord` (judge run-rules' `checkTestBarRecord`, fail closed while absent; `deps.checkTestBarRecord` in the module test), `testBarRecords`, `groupTestSet`, `groupTestResults`; tables `ai_test_bar`, `ai_group_tests`.
- R76: `actual` read from `ai-use.actualOf({act: run})` (via `deps.aiUse`) at every ending, recorded on the run, answered (close, R19 `session.cost`) only to owners of `principal_claude` (`#ownsAccount`).
- R52 account half: `accountFor` with `act.project` for a project run; a project key or sign-in serves; `principal_claude` the owner, `principal_claude_ref` the member (`#memberOfRun`); the dispatch refuses an account other than the recorded owner. R72: `estimated_cost_usd` judged.
- New tables declared (R53 test updated). `t41.test.mjs` holds B2, R73, R75, R76.

**Next (in order).**
1. R74 `openMany` as B4 took it (J2 (5)): per step `steps.step` at the viewer, one `ai-use.estimate`, each run through `open` with `step`, then `steps.stepCreate({place, work, run, by: principalPlane})` for its system step; tests incl. one refused and others open, one limit-ended run setting only its own step aside.
2. At ai-use's CHANGE: re-point to `aiUseOf`; `open`/`tick` ask `useCheck({owner, member, use: "run"})`; `tick` counts through `countUsage({owner, member, use: "run", act: run, ...})`; delete the R48–R52 block (:~2890–3150 now: `#count`, ceilings, `countAskUsage`, `aiUseCheck`, `aiCeilingSet`, `aiCopyCeilingSet`, `aiUsage`, `aiUsageMine`, `providerLimit` and their ops); drop `ai_usage`/`ai_ceilings` from `declareTable` and schema (R53); rework rows, transact, usage tests; list for rule 4 (10) every other module's test (file:line) calling those methods/ops.
3. At steps' CHANGE: `#steps()` → `stepsOf(ctx)`; at run-rules': named imports of `RUN_ORIGINS`, `checkTestBarRecord`, and R19's `deployable` with the test bar; drop `#PENDING_ROWS`.
4. Record completion (uses edge to `steps` and `ai-use` already present; add `steps` to `modules.json` uses at merge).

## J5 · QUESTION

AI-RUNS #16 (restarted; merged tranche @ ac777958ea). Readings for B5, B6, B8 and J4's Next; I carry on with each as stated.

(7) B6's gate. `partDeployable` over `CIVICSMITH_TEST_SET` v1 (no matters, N829) is false for every part, so once R40 reads it no run opens in any mode, `check` included, until the set gains matters. Reading: apply it as B6 and run-rules R19 say; module tests stand a one-matter set in through `deps.testSet` (as `deps.deployedModes` stands in today) with a passing record for the modes they use, and a test proves the empty set refuses `check` (control: the bar held opens it). Tell me if `check` should keep the chain alone until N829 is settled.

(8) A system step's actor. steps reads a member credential as a member (doer = that member) and `viewerPredicate` denies `member:<id>/<token>` as a viewer; R74's runs are a member's act under her credential. Reading: every system step this module makes (R74's and an exploring run's) is created and ended by the run's own system identity `class:daemon/<run>`; `runHolder(by, run)` answers it for a running run only, `{enabled_by: principal_claude, principal: the opener's viewer}` (`member:<id>`, or the machine class for `class:ai/<token>`). B2's build answered `principal_plane` there, which steps' sight refuses for a member credential; fixed with this.

(9) steps R8 refuses a machine's step whose normalised work equals an open step on the same question, which R74's own member step always is. Reading: the system step's work is "AI run on <member step id>: <its work>" (at most 500 characters).

(10) R76. `ai-use.actualOf` answers only the paying account's owners and nothing to a machine viewer, so the run cannot read its figures to keep them. Reading (one store, K2482): the run keeps no figures; close and R19's `session.cost` ask `actualOf({act: run, viewer})` with the reader's own stamp, `final: true` once the run has ended. #14's unmerged `actual` column is removed.

(11) R74, a group-placed member step: that step is refused `AI_RUN_NO_CONTEXT` (C-33.30): a run sits in an inquiry or a project.

(12) B5: `aiusage`, `aiceilingset`, `aicopyceilingset` leave `aiRunsOps`; `aiUseOps` answers `aiusage` and `ailimitset` (no op by the two ceiling names). Re-routing the dispatch is L11's (control-plane, plane); listed in my record.

(13) R52 at a tick: a `useCheck` refusal still counts the calls that tick reports (they were made and paid for), then refuses the rest of the tick, as R50 did. The usage entry's shape is judged by `ai-use.countUsage` alone (no second copy here): a refused entry rolls the whole tick back.

## J6 · REPORT

Other modules' reds from my merge (rule 4 (10)), measured against tranche/T41 over 23 user suites (2035/57 there, 2021/71 here; none cleared):

A. B6's gate (B10 (7)): a run opens only with its mode's test bar held, so a world that opens a run without one is refused C-109.1:
- capture-requests `plane.test.mjs`:106, :138, :163, :184, :196
- scheduler `plane.test.mjs`:199
Each needs its world to hold a passing bar (e.g. ai-runs' `deps.testSet` with a one-matter set and `testBarRecord` for `check`, as my `world.mjs` does), in its own job.

B. K624's delete (L11's re-point, K2488): callers of the removed `aiUseCheck`, `countAskUsage`, `aiCeilingSet`, `aiCopyCeilingSet`, `aiUsage`, `aiUsageMine` and ops `aiusage`, `aiceilingset`, `aicopyceilingset`:
- product: store-door `dispatch.mjs`:276, :377 (`askceiling`), :381 (`askusage`); plane `store.mjs`:219 (`ceilingRefusal`) → `ai-use` `useCheck`/`countAskUsage`
- tests red: store-door `dispatch.test.mjs`:352; `routes.test.mjs`:132, :174, :226, :248 (helper :116 binds `runs.aiUseCheck`); control-plane `t34-routes.test.mjs`:24, :211, :253
- still naming the retired ops (not red today): op-declarations `index.mjs`:313; affordances `act-help.mjs`:33, :66 and `t33.test.mjs`:102; op-grades `t33.mjs`:154–155, :363–364 and `owners.test.mjs`:155; setup-words :213, :253, :467, :500; control-plane `r53-routes.test.mjs`:35.

C. Findings against other modules:
- run-rules: `NOT_YOUR_CEILING`'s `where` (`checks.mjs`:681, pinned by `table.test.mjs`:176) names `ai-runs aiCeilingSet and aiUsageMine`, which no longer exist; ai-use mints it now (its R2). C-22.26 and C-22.28's `where` say "reached from an exploring run"; `AI_RUN_STEP_UNKNOWN` is now also minted for a member's step run and R74's batch.
- op-declarations: R74's `openMany` has no op; nothing reaches it from the door until one is declared (I added none, an undeclared op being a defect).
- ai-use: `AI_LIMIT_REACHED`'s translation reaches a run's open and tick with `{period}` and `{when}` unfilled ("your own {period} limit is reached. It works again {when}."), against its R13.
- agent-worker: the dispatch body's `account.member` is now `principal_claude_ref` (J3, forwarded in B7).

## J7 · COMPLETE

T41-23 done on `job/T41/ai-runs` @ 0e14f0feb1 (tranche merged @ B10's head). J4's Next worked in order with B5–B10.

**Entries applied.**
- K624's delete (B5): R48–R51's copy gone (counter, ceilings, `countAskUsage`, `aiUseCheck`, ceiling acts, `aiUsage`/`aiUsageMine`, `providerLimit`, `AI_CEILING_DEFAULT`, `USAGE_*`, ops `aiusage`/`aiceilingset`/`aicopyceilingset`); `ai_usage`/`ai_ceilings` out of `declareTable` and schema (R53).
- R52: `open` and `tick` judge the paying account by `ai-use.useCheck` (use `run`). Each tick's conversations are counted through `ai-use.countUsage` with the run's owner and member, under `act` = the run id; that is the one judge of R72's shape, and a refused entry rolls the whole tick back. A tick over a limit counts its calls, then refuses (J5 (13)). `principal_claude` is the owner and `principal_claude_ref` the member.
- R76: `cost` comes from `actualOf({act: run, viewer})` with the reader's own stamp, `final` once ended. No figures are kept on the run; #14's `actual` column is removed.
- B6: R40 deploys a mode only by `partDeployable` (chain plus test bar, `deps.testSet` in module tests). `originAllowed` is relayed. `#PENDING_ROWS` dropped; rows read from run-rules. `checkTestBarRecord` named. `checkPagesRead`: no read inside a document is this module's own (the read happens in its producers), so nothing to apply.
- R73, B8: an exploring run names its system step's `place`/`work`. After the open, inside the open's transaction, the step is created by the run's own system identity `class:daemon/<run>` (J5 (8)); a refused step rolls the open back. At close, own steps end `ended`/`set_aside` and products are tied; a member's step the run worked is left to her.
- R74: `openMany` as B4 (5) and J5 (9), (11).
- B2: `runHolder` answers the system identity, and `principal` in viewer form.

**Defects fixed in my module.** `testBarRecords` answered `set_version` as text, so no bar ever counted. `#stepSeen` took steps' `NO_SUCH_STEP` refusal (which names the step) as seen. A step-run that looked at nothing could not close: its NEVER_LOOKED rollup was written under `step` (C-22.17); it now goes under the run.

**Deferred.** None. **Other modules:** J6.

**`uses` edge for BOB to apply at merge:** ai-runs → steps (architecture's two failures are exactly this edge).

**Tests and checks.**
- `node --test test/m/ai-runs/*.test.mjs`: tests 80, pass 80, fail 0. This includes real-`steps` paths for explore and R74.
- The suites of the other modules that use mine: 14 new reds, none cleared, per J6.
- format: 0 failures. coverage: 46 of 46, 0 failures. ownership: 0 failures. architecture: 2 failures, both the steps edge above.

Size (session_01GR97XnUR7v9ZQaT1BcPwFh): test runs 14, module lines 3446

## J8 · COMPLETE

B11 applied on `job/T41/ai-runs` @ cdfae4c335 (tranche merged). `usage.test.mjs`'s `limitReached` asserts the relayed `AI_LIMIT_REACHED` translation holds no `{…}` placeholder; it is used at open and tick for daily limits, and a new test covers a monthly limit at open and tick, with controls: under the limit it lands, and the next month it is free.
Tests: `node --test test/m/ai-runs/*.test.mjs`: tests 81, pass 81, fail 0. Checks: format 0, coverage 46 of 46 with 0 failures, ownership 0, architecture 2 (the ai-runs → steps edge, as J7).
Size (session_01GR97XnUR7v9ZQaT1BcPwFh): test runs 16, module lines 3446
