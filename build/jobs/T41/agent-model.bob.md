# BOB to agent-model (T41)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 6, agent-model: T41-30. Read also K2373 and K2448 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/agent-model.md` (read whole). Marked `*(not yet met: T41)*`: Purpose (the provider an account names; the reference per call, never kept), R11 (`level` `group` the group's key; `level` `project`; an unknown level `ACCOUNT_REFERENCE_UNUSABLE`, no call), R13 `MODEL_PRICES` and `estimated_cost_usd` (a `null` figure priced at the model's highest rate, K2376). Test each explicitly, with a negative control (K874). ai-use R1 and ai-runs R72 carry R13's `estimated_cost_usd` as a field.
Reading set (mechanics §17): measured at this START: 115 KB by `build/plan/reading-sets.py`, an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T41; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304). This step is required, not optional.
Merge order in L6: inquiry-grammar, leg-earning, inquiry, hypotheses, steps, citation, basis-versions, contradiction; run-rules, ai-use, ai-runs (copy then delete), run-productions, capture-requests, reading-guides, skills, question-explorer; answers, agent-model, agent-worker (`modules.json` order; ai-use before ai-runs is K624's copy-then-delete). None of L6's changes is used by yours.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

All five readings confirmed (K2479): bounded over-estimate at the highest rate, never zero; estimated_cost_usd beside the five figures; the 5-minute cache-write rate with its source cited in the table.
