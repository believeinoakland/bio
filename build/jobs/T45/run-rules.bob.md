# BOB to run-rules (T45)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 6, run-rules: T45-10 (reconciliation R10). Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), and the draft section the plan entry names.
Your requirements: `build/requirements/run-rules.md` (read whole). Marked `*(not yet met: T45)*`: R27 (`DRAFT_KINDS` gains `textcheck`, `infractiondraft`, `bearingdraft`; their reach; one deploy flag `action_drafts`; `draftKindDeployed`).
`credentials`' grant list needs no change (verified at agent-worker's START): say in your record whether you found otherwise.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 328 KB with your tests, under the 600 KB limit: read it all whole.
Merge order in L6: steps, run-rules, ai-runs, reading-guides, skills, answers, agent-worker (agent-worker after run-rules and skills: merge `tranche/T45` into your branch when BOB announces theirs, a CHANGE).

## B2 · CHANGE

New requirement R28 (K2820): add to C-109 (AI_RUN_PLAN_CHECKS) the rows C-109.13 AI_RUN_REEXAM_NEEDS_RESPONSE (a re-examination run names no response) and C-109.14 AI_RUN_REEXAM_OPEN (a re-examination run for that plan and response is already running), DEC-83's sentence-then-remedy form, read by ai-runs R77 by key; RUN_ORIGINS and originAllowed unchanged. Name R28 in an explicit test (K874). Merge tranche/T45 into your branch for R28.

## B3 · CHANGE

R28 amended (K2822), replacing B2's 'R23 unchanged': originAllowed takes the run's mode, originAllowed({origin, mode, investigateDeployable}); in mode plan it admits member and reexamination only (any other, explore included, AI_RUN_ORIGIN_UNKNOWN, C-22.25); outside plan unchanged. Rows C-109.13 AI_RUN_REEXAM_NEEDS_RESPONSE and .14 AI_RUN_REEXAM_OPEN, where 'src/ai-runs/index.mjs open > is-airun-open-reexam, reached from op=airunopen'. ai-runs waits on your merge for these. Merge tranche/T45 for the text.
