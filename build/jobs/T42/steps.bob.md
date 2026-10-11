# BOB to steps (T42)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 6, steps: T42-14 (N843). Read also K2566, K2608 and `build/plan/draft-T42-reqs.md` section N843.
Your requirements: `build/requirements/steps.md` (read whole). Marked `*(not yet met: T42)*`: R28: `stepAccept` refuses an absent or unseen proposed step with `NO_SUCH_STEP_PROPOSAL` (C-142.28, number and translation kept), never `NO_SUCH_PROPOSAL`. answer-envelope's pins of the old code are expected red in your users' suites until T42-27 (L11; rule 4 (6)): report them, do not change them. Test each marked id explicitly at your interface, with a negative control (K874: the id's string may already be in your tests). Run your users' suites (P11) and report reds by file and line.
Reading set (mechanics §17): measured at this START: 505 KB by `build/plan/reading-sets.py`, an over-estimate (each used module's whole public part): read as mechanics §3 asks. At most 300 KB: read it whole and state so. Over: read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L6: `modules.json` order; inquiry and basis-versions (the seam owners) before run-productions; agent-model before agent-worker. Jobs this layer: inquiry, hypotheses, steps, citation, basis-versions, ai-use, run-productions, question-explorer, agent-model, agent-worker.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
