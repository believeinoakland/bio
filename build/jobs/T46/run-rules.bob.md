# BOB to run-rules (T46)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T46), layer 6, run-rules: T46-13 · (N897 (2); K2816; trial finding 1) R29 `partAdmittedOn`/`untestedLabel`, R30 `AI_PART_NOT_DEPLOYED` new; R16, R21 amended (`ask`, `draft` flags `true`, gated by R29); (N920) R27: `DRAFT_KINDS` gains `statusreport`, reach `none`, part `draft:statusreport`, under `draft`'s flag; (K2892, N919) R14's own reviewed act: `plan` deployed in `DEPLOYED_MODES` (with agent-worker's `MODES.plan`, T46-19), D14's bar still gating every instance but a test instance; `action_drafts`' flag set in the same reviewed change only if M-T46-5 finds its three kinds served end to end; (N913) `AI_RUN_ORIGIN_UNKNOWN`, `AI_RUN_REEXAM_NEEDS_RESPONSE`, `AI_RUN_REEXAM_OPEN` re-worded · trial §1.2; study §2; words.json; rest BOB's · first in L6's AI jobs.
Your requirements: `build/requirements/run-rules.md` (read whole). Marked `*(not yet met: T46)*`: R14, R16, R21, R27, R29, R30, R31. The sources the entry names (trial = `build/plan/draft-T46-trial.md`, study = `build/plan/study-T46-assistant.md`, words.json on main @ 3f40899950) are read for the sections named.
Measured before your START (M-T46-5, K2946): `textcheck` has no plane op (`ACTION_DRAFT_OPS` holds only `infractiondraft` and `bearingdraft`; N917), so the three kinds are NOT all served end to end: `action_drafts` stays `deployed: false` in your reviewed change; only `plan` is deployed in `DEPLOYED_MODES` (R14). `infractiondraft` and `bearingdraft` are wired plane → agent-worker R76 and gated only by the flags and the bar.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one. N913 re-wordings read words by key from `refusal.<CODE>`, changing no code, number or `where`; a sentence that does not match what the refusal does is not adopted (ask BOB).
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in K2924–K2945; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 361 KB with your tests (K2700), under the 600 KB limit; read it whole.
Merge order in L6: hypotheses, steps, run-rules, ai-runs, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-runner, agent-worker. A job that uses an L6 job's new service merges `tranche/T46` into its branch when BOB announces that merge (a CHANGE); each that uses no unmerged L6 job merges as soon as it is complete.
