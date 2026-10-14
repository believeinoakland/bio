# BOB to affordances (T47)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, affordances: **T47-49 · affordances** · (N992) R48 ACT_HELP and R53 re-taken from DEC-198/DEC-199 (with `clockproposals` and `joindoors` help), clearing its two reds; help and offers for T47's new ops; catalogue tests add `case-inputs`' namespace, ops and checks (N908 §5); `t45`, `t45-backing`, `catalogue` drive `action-records` (N961 §5) · after T47-48; adds: (K3062) R56 `ACT_HELP` re-generated from `mock-acts.js` at PR #33's head (`recover` for any member, DEC-205 (4); the `owed_` texts held under `passwordresetlink`, `passwordreset`, `grouplogoset`, `grouplanguagesset`, `signrequest` once declared).; adds: (K3102; CITATION #12 J2 (2)) `plane.test.mjs`'s R14/R9/R18 sever-on-inquiry test re-stated for citation R15 (a question's own legs may be severed and reinstated, the help offering them), clearing the red citation's merge opens; adds: (K3104) help for `peopledirectory`
Your requirements: `build/requirements/affordances.md` (read whole). Marked `*(not yet met: T47)*`: R54, R55, R56; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: You merge after op-grades (T47-48).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); yours to clear: your two DEC-198/199 reds (rule 5 (7a)); K3102's sever-on-inquiry test; K3116's R1, R12, R24, R14/R9/R18, R19 ×2; K3128's three (rule 5 (8)); K3112's R12 with op-grades and op-declarations.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 2486 KB with your tests (K2700; used public parts 1762 KB across 71 modules, an upper bound), over the 600 KB limit. Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it (the later L11 jobs in the merge order that use your services), have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · ANSWER · re J1

K3143: (1)–(4) stand as read. `peopledirectory`'s help goes to the design stream (BOB's HANDOFF). J2: edges `affordances → case-inputs` and `→ action-records` added on `tranche/T47` (f2beb624b4); merge it.

## B3 · CHANGE

K3147: op-grades (T47-48) is merged into `tranche/T47`. Merge it, re-pin R19's terminal/irreversible sets (`publish`, `publishcheck` now `terminal`; IRREVERSIBLE_WEIGHT publishat, publishatmove, personexpunge, standardrelease), drive `projectbarset` (reasoned, PROJECT_BAR_NO_REASON), clear your two waiting reds, and post COMPLETE again. You merge after wizard-scripts too (a CHANGE then if you use its new services).

## B4 · CHANGE

K3152: you are merged. On `tranche/T47` your R19 drive ("every reasoned op … refused with a code in JUSTIFICATION_REFUSALS") is red over op-declarations' merged specs: fix it there, merge `tranche/T47`, post COMPLETE again.

## B5 · CHANGE

K3163 (from CONTROL-PLANE #32 J4): control-plane's totality test (R2/R41, totality.test.mjs:20) is red on tranche/T47: affordances' `unaccounted` names `statementack` and `reviewcomment`, which op-declarations (K3041) gave NEEDS rows. Account for both under your requirements (publish them as acts with their grades, or list them in NON_ACTS where they are not acts), test it, run control-plane's totality test, and post COMPLETE. This re-opens you.
