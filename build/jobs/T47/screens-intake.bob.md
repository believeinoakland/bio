# BOB to screens-intake (T47)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, screens-intake: **T47-59 · screens-intake** · (N987) the writing-help draft filled into the field it drew, a knock's card; (N979) a held row draws its grade and a thumbnail opening `open-file`; (N980) `sourcelink` without typed ids; (N969) the set-aside list, monitor from Add, "Ask for this later"; `archive` (N688's screen part) · text BOB's; adds: (DEC-200 (2)) R16 "Watch this address" (`monitorset`) and "Check it now" (`monitor`) as two acts, amending R14.; adds: (K3114; RATIFICATION #25 J2) `held.test.mjs`'s stand-in control "a release read from the body alone is refused" re-stated for ratification R51 (a release's fields read from the body, else the query)
Your requirements: `build/requirements/screens-intake.md` (read whole). Marked `*(not yet met: T47)*`: R10, R11, R12, R13, R14, R15, R16; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: none beyond your entry.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); yours to clear: `held.test.mjs`' stand-in control re-stated for ratification R51 (K3114).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 282 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · CHANGE

K3148: wizard-scripts (T47-47: the registry at f90b187c7b, 66 screens) and op-grades (T47-48) are merged into `tranche/T47`. Merge it into your branch and run your tests against them before COMPLETE (a job already COMPLETE re-runs and posts COMPLETE again).

## B3 · CHANGE

K3149: setup-words (T47-52, WORD_ROWS at 6f0d88d8d5) and instance-setup (T47-75: flat parts, grouplogoset/grouplanguages(set), the `grouplogo` route, `groupLogoAsset`) are merged into `tranche/T47`, with wizard-scripts and op-grades before them. Merge it and run your tests against them.

## B4 · CHANGE

K3152: merged into `tranche/T47` so far: wizard-scripts, op-grades, setup-words, instance-setup, notice-producers, installer, project-roster (out of layer), affordances, tasks, op-declarations, admission. Merge `tranche/T47` into your branch now and run your tests against them; a job already COMPLETE re-runs and posts COMPLETE again.

## B5 · CHANGE

K3153 (INTERFACE-SHELL #2's harness, as built for R27–R48): the page now sends `bootstrap` once, public and with no header, for the test-instance band (R36): filter it out of request lists you compare. The session record is in localStorage (R32): `p.local` holds `bio-session` (and may hold `bio-session:active`), `p.store` does not. A test that runs the clock past 15 minutes uses `p.clock.tickActive(ms)` (R33 locks an idle own device at 30). `boot({session})`'s record is `{t, e, d, w}` (`d` own or shared). Screen functions stay self-contained. New harness options: `hash`, `tabs`, `idb`, `guide`. The kit contract (R46–R49) is in place on `job/T47/interface-shell`; read its record's Completion for the full list.

## B6 · CHANGE

K3157: merged into tranche/T47: action-producers (T47-50: R24, R25) and op-declarations again (ACT_HELP_ABSENT re-pinned to affordances' ACT_HELP; signrequest served by tasks' map). Merge tranche/T47 into your branch now and re-run your tests; a job already COMPLETE re-runs and posts COMPLETE again.

## B7 · CHANGE

K3165: interface-shell is merged into tranche/T47 (R27–R51, with R33's no-storage-without-a-session, R50's phone hold over weighted acts, R51's data-guide → GUIDE.control). Merge tranche/T47 into your branch now, re-run your tests and checks without any overlay, tighten anything you held for this merge, and post COMPLETE.

## B8 · CHANGE

K3171 (JOURNEY-CHECK #1 J4 (1)): R3: `testify` answers {ok, bundle_id, …} but capture.mjs's doneTestify reads answer.id || answer.bundleId, so 'Recorded as your testimony: {id}' is never drawn. Merge tranche/T47 (control-plane merged), read bundle_id, add a test at the interface naming R3, and post COMPLETE. This re-opens you.
