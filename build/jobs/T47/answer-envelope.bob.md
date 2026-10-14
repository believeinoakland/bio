# BOB to answer-envelope (T47)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, answer-envelope: **T47-54 · answer-envelope** · (N992) R8 re-taken from DEC-198/DEC-199, clearing its red; `CHECK_FAMILY_FILES` adds `src/case-inputs/checks.mjs` directly before case-authoring's; the order test pins it (N908 §5); adds: (N1002; N1001) R16 R6's page policy names `interfacePage` at `/` (the setup page no longer served); the door's row for `signintrace`'s refusal.
Your requirements: `build/requirements/answer-envelope.md` (read whole). Marked `*(not yet met: T47)*`: R14, R15, R16; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: none beyond your entry.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); yours to clear: R8's family-order pins (rule 5 (7b)) and its DEC red (7a).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 2315 KB with your tests (K2700; used public parts 2130 KB across 87 modules, an upper bound), over the 600 KB limit. Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it (the later L11 jobs in the merge order that use your services), have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · ANSWER · re J1

K3143: (1) and (2) stand. `SIGNINTRACE_NOT_TEST` C-69.7 with `where` `src/signin-door/index.mjs signintrace > is-signintrace-test-instance`; SIGNIN-DOOR #1 is told to match it. Words to the design stream (BOB's HANDOFF). Your R7 re-pins stand.

## B3 · CHANGE

K3148: wizard-scripts (T47-47: the registry at f90b187c7b, 66 screens) and op-grades (T47-48) are merged into `tranche/T47`. Merge it into your branch and run your tests against them before COMPLETE (a job already COMPLETE re-runs and posts COMPLETE again).

## B4 · CHANGE

K3149: setup-words (T47-52, WORD_ROWS at 6f0d88d8d5) and instance-setup (T47-75: flat parts, grouplogoset/grouplanguages(set), the `grouplogo` route, `groupLogoAsset`) are merged into `tranche/T47`, with wizard-scripts and op-grades before them. Merge it and run your tests against them.

## B5 · CHANGE

K3149: `test/m/answer-envelope/page-policy.test.mjs` imports `setupPage`, which instance-setup removes after control-plane merges (R83): re-point it to the page shape you already test (your R16 reading), merge `tranche/T47`, post COMPLETE again.

## B6 · CHANGE

K3152: merged into `tranche/T47` so far: wizard-scripts, op-grades, setup-words, instance-setup, notice-producers, installer, project-roster (out of layer), affordances, tasks, op-declarations, admission. Merge `tranche/T47` into your branch now and run your tests against them; a job already COMPLETE re-runs and posts COMPLETE again.

## B7 · CHANGE

K3156 (T47-94): merge tranche/T47. R6 now says the page policy's `img-src` is `'self' data: blob:` (INTERFACE-SHELL #2 J4: interface-shell R49's `cs.image` draws from a page-made object address, which names no other origin). Add `blob:` to PAGE_POLICY's img-src, test it (and that no other origin appears), and post COMPLETE with your other work.

## B8 · CHANGE

K3157: merged into tranche/T47: action-producers (T47-50: R24, R25) and op-declarations again (ACT_HELP_ABSENT re-pinned to affordances' ACT_HELP; signrequest served by tasks' map). Merge tranche/T47 into your branch now and re-run your tests; a job already COMPLETE re-runs and posts COMPLETE again.
