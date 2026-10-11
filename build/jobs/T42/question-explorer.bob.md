# BOB to question-explorer (T42)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 6, question-explorer: T42-19 (N845). Read also K2571 and `build/plan/draft-T42-reqs.md` section N845.
Your requirements: `build/requirements/question-explorer.md` (read whole). Marked `*(not yet met: T42)*`: R15: `questionExplorerOf(host, deps?)` answers one instance per host with its tables created, running its `migrate()` before declaring them to purge (as `publish-schedule`'s factory does). Test each marked id explicitly at your interface, with a negative control (K874: the id's string may already be in your tests). Run your users' suites (P11) and report reds by file and line.
Reading set (mechanics §17): measured at this START: 563 KB by `build/plan/reading-sets.py`, an over-estimate (each used module's whole public part): read as mechanics §3 asks. At most 300 KB: read it whole and state so. Over: read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L6: `modules.json` order; inquiry and basis-versions (the seam owners) before run-productions; agent-model before agent-worker. Jobs this layer: inquiry, hypotheses, steps, citation, basis-versions, ai-use, run-productions, question-explorer, agent-model, agent-worker.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

From RUN-PRODUCTIONS #9 J1 (K2655, P9): once run-productions merges, `runProductionsOf` builds `inquiry` through `inquiryOf` (to register with inquiry R62), which declares inquiry's tables to purge. Your `test/m/question-explorer/module.test.mjs`:28 then fails `no such table: inquiry_findings`, since your world calls `runProductionsOf(host)` (`src/question-explorer/index.mjs`:884) on a store that never creates inquiry's tables. Fix it in your own test fixture now (migrate inquiry in the world, or hand runProductionsOf a stand-in), so the suite stays green on both sides of that merge; post COMPLETE with it.
