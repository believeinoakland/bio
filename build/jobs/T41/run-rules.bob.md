# BOB to run-rules (T41)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, run-rules: T41-21. Read also K2373, K2418 and K2448 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/run-rules.md` (read whole). Marked `*(not yet met: T41)*`: R19 (the test bar: `investigate` deployable only with a well-formed `ai-runs` R75 record), R20 (the ceiling codes `AI_USE_CEILING_REACHED`, `AI_USE_COPY_CEILING_REACHED` retired; `AI_NO_ACCOUNT`'s translation; D12), R23 `RUN_ORIGINS` (`member`, `explore`), R24 the mode `enquire`, R25 `DRAFT_KINDS` gains `case_account`, `account_check`, `bearing_note`, R26 `RUN_BOUNDS` gains `pages`. Test each explicitly, with a negative control (K874). R19 names `ai-runs` R75, R24 `answers` R1, `steps` R24 and `investigation` R12, R20 (layer 7, not yet built), R25 `skills` R44 and `run-productions` R23: those services are theirs; yours is the vocabulary.
Rule 4 (10): your merge retires the two ceiling codes, so their users' tests go red until their own jobs; list in your record exactly which tests (file:line) of other modules go red. Test files naming either code today: answers `standing`, `tallies`; agent-worker `ask`, `t35`; ai-runs `rows`, `usage`; notice-producers `standing`; store-door `routes`; control-plane `t34-routes` (and your own `table`). Rule 4 (10) names only L11 users; name any of this layer too.
Reading set (mechanics §17): measured at this START: 208 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). None of L6's changes is used by yours; ai-use, ai-runs, run-productions, skills and question-explorer use yours later in this layer.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All four readings confirmed (K2479). (1) ship CIVICSMITH_TEST_SET v1 with no matters and testBarHeld refusing an empty set; the matters are N829 in next.md, not this job's. (3) retiring C-109.12 too is right. Build on them.

## B3 · CHANGE

From AI-RUNS #14 J1 (K2482): add one row to your table, AI_GROUP_TEST_INVALID (C-22.24, a group's own test matter that is malformed: ai-runs R75's groupTestSet), beside your C-22.22 AI_TEST_BAR_UNFIT, which ai-runs also answers through checkTestBarRecord. Test it explicitly.

## B4 · CHANGE

From AI-RUNS #14 J2 (K2485): add four more rows to your table beside C-22.24 AI_GROUP_TEST_INVALID: C-22.25 AI_RUN_ORIGIN_UNKNOWN, C-22.26 AI_RUN_EXPLORE_NEEDS_STEP, C-22.27 AI_RUN_EXPLORE_NOT_DEPLOYABLE, C-22.28 AI_RUN_STEP_UNKNOWN (ai-runs R73's refusals; ai-runs mints by key and reads your rows). Test each row explicitly.

## B5 · ANSWER · re J2

Merged (K2489); your findings went to ai-runs by CHANGE; your reds are named in rule 4 (10).

## B6 · CHANGE

Re-opened (K2514; P10, layer 6 still open). ai-runs is merged into tranche/T41 @ 9741f67aad: merge the tranche branch. AI-RUNS #16 J6 finds row text that no longer matches the code: `NOT_YOUR_CEILING`'s `where` (`checks.mjs`:681, pinned by `table.test.mjs`:176) names ai-runs `aiCeilingSet` and `aiUsageMine`, which are gone (ai-use mints it, its R2); C-22.26 and C-22.28's `where` say "reached from an exploring run", and `AI_RUN_STEP_UNKNOWN` is now also minted for a member's step run and R74's batch (`openMany`). Correct each row's `where` to its real sites, re-pin, run your suite, record completion, post COMPLETE.
