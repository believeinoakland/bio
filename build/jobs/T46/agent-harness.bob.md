# BOB to agent-harness (T46)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 6, agent-harness: T46-63 · (N919; K2892) R10 new: `MODES.plan` deployed, the harness's copy agreeing with run-rules R14 and agent-worker R53 (K2920: the copy lives in `harness.mjs`, agent-harness's file) · text BOB's · after T46-13.
Your requirements: `build/requirements/agent-harness.md` (read whole). Marked `*(not yet met: T46)*`: R10. The sources the entry names (trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`, words.json on main @ 3f40899950) are read for the sections named.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; a sentence that does not match what the refusal does is not adopted (ask BOB).
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2945; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 148 KB with your tests (K2700), under the 600 KB limit; read it whole.
Merge order in L6: hypotheses, steps, run-rules, ai-runs, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-runner, agent-worker. A job that uses an L6 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L6 job merges as soon as it is complete.

## B2 · ANSWER · re J1

K2947: done as you read it: agent-harness `uses` gains run-rules in build/modules.json on tranche/T46. Merge it now; your R10 test imports DEPLOYED_MODES and RUN_MODES and asserts as you state. Post COMPLETE after my CHANGE announcing run-rules' merge, once R10 is green.
