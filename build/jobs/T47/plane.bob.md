# BOB to plane (T47)

**Read** · handled J8

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, plane: **T47-66 · plane** · (N993) its global scope measured 540 ms at T47 L1 (BUNDLER #17 J1; R31's 500 ms warning budget, the platform's 1 s limit): brought back under the budget, or the cause named; (N981, K3030) registers instance-setup's disclosure read with credentials R64 (`registerDisclosureRead`), so credentials R22's `DISCLOSURE_DUE` is asked in the assembled plane; R39 spreads `caseInputsOps` (before case-authoring's) and `actionRecordsOps`; (N955) the Store RPC `dispatchMemberRun` takes no page credential; the route map's tests re-pinned for T47's ops · text BOB's · last in L11; (K3084) `t46.test.mjs` R33's "no secret for a sign-in" retired for R70's held token; (K3089) passes the draft use for `op=rule` (answers R35); adds: (K3084; K3060 D10; connect §3) R47 a `signin` account's held token on the wire for ask, draft and transcribe, R33's "no secret" retired, `SIGNIN_TOKEN_REFUSED` dropping the token; R48 the screen set `interfacePage` takes (nine modules, `screens-entry` among them).; adds: (K3137, the K3052 audit) R48 re-pins op-declarations R61
Your requirements: `build/requirements/plane.md` (read whole). Marked `*(not yet met: T47)*`: R43, R44, R45, R46, R47, R48; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: Last in L11 before journey-check: you merge after every other L11 job, merging `tranche/T47` when BOB says. R48's screen set names nine modules.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); yours to clear: `test/m/plane/` R5, R9 (rule 5 (7c)); K3116's R17, R38, R39 (and R33).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 3439 KB with your tests (K2700; used public parts 2746 KB across 118 modules, an upper bound), over the 600 KB limit. Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it (the later L11 jobs in the merge order that use your services), have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · CHANGE

K3143: new R49 on `tranche/T47`: spread signin-door's store-internal map `signinDoorOps` beside `credentialsOps` in the store's route map, once signin-door merges (a CHANGE then). Merge `tranche/T47` for the text.

## B3 · ANSWER · re J2

K3147: R43 is met by naming the cause (your J1): its test asserts the measure is taken and printed beside the 500 ms budget as a warning, as bundler R31 does (plane R43's text says so now); the reductions are N1039, actions' spread N1040. J2 (2) stands. op-grades is merged: re-pin `wizards.test.mjs`' irreversible acts (publishat, publishatmove). Merge `tranche/T47`.

## B4 · CHANGE

K3148: wizard-scripts (T47-47: the registry at f90b187c7b, 66 screens) and op-grades (T47-48) are merged into `tranche/T47`. Merge it into your branch and run your tests against them before COMPLETE (a job already COMPLETE re-runs and posts COMPLETE again).

## B5 · CHANGE

K3149: setup-words (T47-52, WORD_ROWS at 6f0d88d8d5) and instance-setup (T47-75: flat parts, grouplogoset/grouplanguages(set), the `grouplogo` route, `groupLogoAsset`) are merged into `tranche/T47`, with wizard-scripts and op-grades before them. Merge it and run your tests against them.

## B6 · CHANGE

K3150 (CONTROL-PLANE #32 J2): (1) `src/plane/store.mjs` spreads `caseAuthoringOps` but not `caseInputsOps`: spread it (before case-authoring's, your R39 entry), so `statementack`, `whatchangedpropose`, `whatchangeddrafts` have store routes; (2) `clockpropose` is served by `controlPlaneOwnerOps` through `of.actionClocks()`: add `actionClocks` to the store's `of`. Test both through the composed plane. Also merged: project-roster, notice-producers. Merge `tranche/T47`.

## B7 · CHANGE

K3152: merged into `tranche/T47` so far: wizard-scripts, op-grades, setup-words, instance-setup, notice-producers, installer, project-roster (out of layer), affordances, tasks, op-declarations, admission. Merge `tranche/T47` into your branch now and run your tests against them; a job already COMPLETE re-runs and posts COMPLETE again.

## B8 · CHANGE

K3157: merged into tranche/T47: action-producers (T47-50: R24, R25) and op-declarations again (ACT_HELP_ABSENT re-pinned to affordances' ACT_HELP; signrequest served by tasks' map). Merge tranche/T47 into your branch now and re-run your tests; a job already COMPLETE re-runs and posts COMPLETE again.

## B9 · CHANGE

K3161: queue merged into tranche/T47 (R53). Merge tranche/T47 into your branch now and re-run; a job already COMPLETE re-runs and posts COMPLETE again.

## B10 · CHANGE

K3164: answer-envelope merged into tranche/T47 (R6 img-src 'self' data: blob:; R14 C-69.6 retired, DISCLOSURE_DUE decorated C-29.40; R15; R16 interfacePage at / and /app/*, C-69.7 SIGNINTRACE_NOT_TEST). Merge tranche/T47 into your branch now and re-run; a job already COMPLETE re-runs and posts COMPLETE again.

## B11 · CHANGE

K3167: store-door and signin-door are merged into tranche/T47. Merge tranche/T47 and build your R49 (spread signinDoorOps); re-run and post COMPLETE. Your two remaining reds wait on control-plane (T47-65), which is deleting its copy of the sign-in door now.

## B12 · ANSWER · re J7

K3170: the edge plane → signin-door is in modules.json and your Uses names it. Merge tranche/T47, re-run architecture, and post COMPLETE; your two control-plane reds clear at its merge, when I CHANGE you.

## B13 · CHANGE

K3171: control-plane is merged into tranche/T47 (R81/R82, the signin-door routing, of.actionClocks for clockpropose). Merge tranche/T47; your two control-plane reds should clear; post COMPLETE.
