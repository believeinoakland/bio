# BOB to ai-runs (T41)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, ai-runs: T41-23. Read also K624, K2373, K2437, K2442, K2445, K2448 and K2472 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/ai-runs.md` (read whole). Marked `*(not yet met: T41)*`: R52 amended (a standing question's AI half counted and held by `ai-use` R1, R3), R53 amended (`ai_usage` and ceilings tables no longer declared here: `ai-use` R7), R72 `tick` takes `usage`, R73 a run with `step` and `origin: "explore"`, R74 `openMany`, now the batch act (was `steps` R25, K2472: a member's act over steps she may see, one run per step under one estimate, `ai-use` R10, each a system step), R75 `testBarRecord`, R76 a run's actual cost (R48–R51 already retired to `ai-use`). Test each explicitly, with a negative control (K874).
K624 copy-then-delete: delete your copy (the R48–R52 block of `ai-runs/index.mjs`, :2588–2932) and re-point to `ai-use` only after ai-use is merged into `tranche/T41`; BOB will send you a CHANGE to merge the tranche branch then. Until then work your other entries.
Also D54 (Bob's "D54: B", K2408; built by membership in L2, K2442): an administrator, the founder included, neither invited nor joined to a HIDDEN project sees it only at `EXISTENCE` (its id, name and owners), never its contents; discoverable projects unchanged. Re-state each listed test for D54, with a negative control (a discoverable project, or an invited administrator, still at `FULL`). Your `converts.test.mjs`:35, :140, :227, `hidden-notices.test.mjs`:55, :94, `open.test.mjs`:115, `producers.test.mjs`:85, :114, `reads.test.mjs`:128, :170 (`build/jobs/T41/membership.md`, Completion). And `ai-runs/index.mjs`:201 reads a run as the founder (`viewer: "admin"`), now blind to hidden projects (K2442): an internal read takes no viewer or a machine one; test it with a hidden project's run, with a negative control.
Rule 4 (12) `scheduler.test.mjs`:123 (credentials' removed `accountSwitchSet`/`groupSwitchSet`, K2437, K2445) is yours to clear. Rule 4 (10): with run-rules, your merge retires the ceiling codes' path; list in your record exactly which tests (file:line) of other modules go red at your merge.
Reading set (mechanics §17): measured at this START: 689 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). Same-layer providers you use: ai-use (by the CHANGE above), run-rules (R23), steps (R1, R5, R9, `steps.step`; R73, R74). Each one's services reach you by a CHANGE once it merges; build against its requirements until then. Add the `uses` edge to `steps` (§3.6's edge list) in your record, for BOB to apply at your merge.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); yours: rule 4 (12) `scheduler`:123, above; none other unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

From STEPS #1 (K2480): steps answers 'a run it holds' through a resolver ai-runs registers at start: steps.registerRunHolder(module, fn(by, run) -> {enabled_by, principal} | null). Register it (steps reaches you by CHANGE at its merge; build to that signature until then) and test it with a negative control (an unknown run answers null).

## B3 · ANSWER · re J1

On tranche/T41 @ 7b6a8a2cf6 (K2482) (K2482; merge the tranche branch): (1) one store of the figures: pass act = the run id to ai-use.countUsage on each tick, and R76 answers ai-use.actualOf({act: run}) (R76 re-worded); no sums of your own. (2) a malformed test-bar record is refused by run-rules' checkTestBarRecord, AI_TEST_BAR_UNFIT (C-22.22), not a code of yours (one code, one condition); a malformed group test by AI_GROUP_TEST_INVALID, a row run-rules adds to its table (told by CHANGE); your two tables as you read them. (3), (4) taken; send the agent-worker REPORT.

## B4 · ANSWER · re J2

(5) taken: each run opens its own system step (R74 says so), as you read it. (6) the four codes and AI_GROUP_TEST_INVALID are rows of run-rules' table, C-22.24-.28 (run-rules told); TEST_BAR_INVALID is not minted: a malformed record is run-rules' AI_TEST_BAR_UNFIT (C-22.22) (K2485).

## B5 · CHANGE

ai-use is merged into tranche/T41 @ 0c541ea499 (K2488). K624's second half is yours now: merge the tranche branch; delete your R48-R51 copy (#usageRefusal through aiUsageMine, AI_CEILING_DEFAULT, USAGE_*); remove ai_usage and ai_ceilings from your declareTable and schema (record-core R80 refuses a table declared twice; ai-use owns both); count by ai-use.countUsage({owner, member, use, mode, usage, calls, at, act: <run id>}), owner spelled from accountFor's level (group, project:<id>, member:<id>); judge by useCheck; send aiusage, aiceilingset, aicopyceilingset to aiUseOps. Then R52, R76 as amended. Re-run your tests and users' suites; list every other module's test that goes red (rule 4 (10)).

## B6 · CHANGE

run-rules is merged into tranche/T41 @ 753d8164cd (K2489): merge the tranche branch; re-point your gate (index.mjs:891, :2968) from deployable to run-rules' partDeployable(part, {verifications, testBars}); relay originAllowed in R73's open; use checkPagesRead for reading inside documents where yours; your rows.test.mjs :23, :33 and usage.test.mjs reds (rule 4 (10)) are yours to clear.

## B7 · ANSWER · re J3

Forwarded to agent-worker by CHANGE (K2489).

## B8 · CHANGE

On tranche/T41 @ 119f4f7640 (K2490) (K2490), merge the tranche branch: R73 now says a run that works as a system step of its own (an exploring run, and each of R74's) is opened first, then this module creates its step through steps.stepCreate with run = the open run; question-explorer passes place and work, never a step. Build it for explore as for R74, and test it.

## B9 · CHANGE

steps is merged into tranche/T41 @ 8519074cac (K2491). You are restarted as AI-RUNS #15 (J4, context): read your record's J4 'Next' and every BOB entry past your cursor (B5-B9: ai-use merged, K624's delete; run-rules merged; K2490's system-step order; this). Merge the tranche branch, then work J4's Next in order.

## B10 · ANSWER · re J5

J5's readings (7)-(13) are all confirmed (K2512). (7) Yes: R19 as amended gates every part, `check` included; build it as written, with tests standing a one-matter set in through `deps.testSet` and a test that the empty set refuses `check`. (10) R76 is re-worded on tranche/T41 to match your reading (no copy on the run; close and `session.cost` read `actualOf` with the reader's stamp): merge the tranche branch. (8), (9), (11), (12), (13) as you read them.
