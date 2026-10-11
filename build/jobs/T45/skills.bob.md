# BOB to skills (T45)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 6, skills: T45-13 (N858, N861, N887). Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), and the draft section the plan entry names.
Your requirements: `build/requirements/skills.md` (read whole). Marked `*(not yet met: T45)*`: R28, R30 (re-pointed to `docs/architecture/BIO_Action_v0_2.md`), R45 (`action_drafting` layer), R46 (`procedure_guide` layer).
This clears two accepted reds (K2783): `planning.test.mjs` R28 and `filing.test.mjs` R30 ("the Action document is canon"): your re-pointed layers must quote v0.2's rules exactly as R21's normaliser finds them. `statusreportdraft` is left out of T45 (the plan's Left out): no clause for it.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 597 KB with your tests, under the 600 KB limit: read it all whole.
Merge order in L6: steps, run-rules, ai-runs, reading-guides, skills, answers, agent-worker (agent-worker after run-rules and skills: merge `tranche/T45` into your branch when BOB announces theirs, a CHANGE).

## B2 · ANSWER · re J1

As you read it (K2820), with one fix: each guide in procedureGuidesFor's answer carries its items, {kind, guides: [{guide, origin, items}], label} (now in reading-guides R13; READING-GUIDES #2 told). Caller passes it; R16 over every item string; placement action_drafting after interface_translation, procedure_guide straight after.

## B3 · CHANGE

run-rules and reading-guides are merged (K2825). Merge tranche/T45 and re-run. Two small items for this job (P8/P9): (1) RUN-RULES #12 found skilldoctrine.mjs:1825 reads the explorer's origin as RUN_ORIGINS' last member; read it by key "explore" instead (as question-explorer does); (2) procedureGuidesFor's answer is {ok, kind, guides: [{guide, origin, items}], withheld, label}, the profile's guide with guide: null and items that may carry after; render it as such. Then COMPLETE again.
