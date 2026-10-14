# BOB to wizard-scripts (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, wizard-scripts: **T47-47 · wizard-scripts** · (N992) R13 `SCREEN_REGISTRY`, R22 (the library) and R23 (`doors`) re-taken from `registry.json`, `library.json` and `mock-acts.js` on `main` after DEC-198/DEC-199; (N984) `writinghelp`'s answer marked `untested` on a test instance as `run-rules` R29 marks a run's outputs (`ai-runs.testInstance()`, a new earlier edge) · DEC-198, DEC-199; text BOB's; adds: (K3062; DEC-200–DEC-212) R35 the registry re-taken at PR #33's head (63 screens); R36 BOB adopts version 2 of "Set up and claim" (step 14 `hostingaccessset`, DEC-205 (3)) and of "Publication ceremony" (steps 9–11, DEC-207 (10), DEC-208 (2)) · doubts 6, 13.; adds: (K3137, the K3052 audit) R35 counts 66 screens, the three `dash-*` treatments registered, never drawn
Your requirements: `build/requirements/wizard-scripts.md` (read whole). Marked `*(not yet met: T47)*`: R31, R32, R33, R34, R35, R36; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: R35's registry and R36's two scripts are read at PR #33's head as merged at this START; `ai-runs.testInstance()` is a new earlier edge (BOB adds it to `modules.json` from your COMPLETE).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); none is yours unless named in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 763 KB with your tests (K2700; used public parts 265 KB across 6 modules, an upper bound), over the 600 KB limit. Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it (the later L11 jobs in the merge order that use your services), have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · ANSWER · re J1

K3143: both readings stand (R34's `untested` on `writingHelp`'s answer past every refusal, read as you state; R36 carried as version 3 of each, version 2 `updated`).

## B3 · ANSWER · re J2

K3145: A. The edge `wizard-scripts → run-rules` is added on `tranche/T47`; add the Uses line (`run-rules`: `untestedLabel`, its R29) to your record's COMPLETE and BOB writes it into your requirements at the merge. Merge `tranche/T47`.
