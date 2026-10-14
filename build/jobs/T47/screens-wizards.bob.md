# BOB to screens-wizards (T47)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, screens-wizards: **T47-57 · screens-wizards** · (N897 (1); N821's runner, screen side; N551 (part); N572) `wizards` with the runner and the dock's wizard guide ("Show me where") · registry.json; text BOB's.; adds: (K3137, the K3052 audit) R7 the welcome continues on Home at step 3 after `join`
Your requirements: `build/requirements/screens-wizards.md` (read whole). Marked `*(not yet met: T47)*`: R1, R2, R3, R4, R5, R6, R7, R8, R9; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: none beyond your entry.
You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); none is yours unless named in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 163 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · ANSWER · re J2

K3143: J2's contract (1–9) stands and is relayed to INTERFACE-SHELL #2 as a CHANGE; screens-entry is told to call `cs.wizard("WIZ-7db08189cc0e58c3", null, {joined: true})` at join's end after `login`. Write the finish key as `bio-wizard-finished:<member>:<script id>` in localStorage; Home draws its welcome offers through your `marks` (screens-daily told).

## B3 · CHANGE

K3148: wizard-scripts (T47-47: the registry at f90b187c7b, 66 screens) and op-grades (T47-48) are merged into `tranche/T47`. Merge it into your branch and run your tests against them before COMPLETE (a job already COMPLETE re-runs and posts COMPLETE again).

## B4 · CHANGE

K3149: setup-words (T47-52, WORD_ROWS at 6f0d88d8d5) and instance-setup (T47-75: flat parts, grouplogoset/grouplanguages(set), the `grouplogo` route, `groupLogoAsset`) are merged into `tranche/T47`, with wizard-scripts and op-grades before them. Merge it and run your tests against them.

## B5 · CHANGE

K3152: merged into `tranche/T47` so far: wizard-scripts, op-grades, setup-words, instance-setup, notice-producers, installer, project-roster (out of layer), affordances, tasks, op-declarations, admission. Merge `tranche/T47` into your branch now and run your tests against them; a job already COMPLETE re-runs and posts COMPLETE again.

## B6 · CHANGE

K3153 (INTERFACE-SHELL #2's harness, as built for R27–R48): the page now sends `bootstrap` once, public and with no header, for the test-instance band (R36): filter it out of request lists you compare. The session record is in localStorage (R32): `p.local` holds `bio-session` (and may hold `bio-session:active`), `p.store` does not. A test that runs the clock past 15 minutes uses `p.clock.tickActive(ms)` (R33 locks an idle own device at 30). `boot({session})`'s record is `{t, e, d, w}` (`d` own or shared). Screen functions stay self-contained. New harness options: `hash`, `tabs`, `idb`, `guide`. The kit contract (R46–R49) is in place on `job/T47/interface-shell`; read its record's Completion for the full list.

## B7 · ANSWER · re J3

K3156: (14) yes. interface-shell R51 now requires exactly your proposal (`data-guide` → `GUIDE.control(cs, view, control, dataset)`, click and Enter/Space, no op); posted to INTERFACE-SHELL #2 as a CHANGE. Add your page test for Next, Back and Stop once it merges (my CHANGE will tell you). The `{template}` draft is deferred as N1046 (an op answering a template by handle); record it as deferred. The `cs-guide:` prefix is fine as is. Set COMPLETE when the rest is done; your R8 red waits on interface-shell's merge.

## B8 · CHANGE

K3157: merged into tranche/T47: action-producers (T47-50: R24, R25) and op-declarations again (ACT_HELP_ABSENT re-pinned to affordances' ACT_HELP; signrequest served by tasks' map). Merge tranche/T47 into your branch now and re-run your tests; a job already COMPLETE re-runs and posts COMPLETE again.

## B9 · CHANGE

K3165: interface-shell is merged into tranche/T47 (R27–R51, with R33's no-storage-without-a-session, R50's phone hold over weighted acts, R51's data-guide → GUIDE.control). Merge tranche/T47 into your branch now, re-run your tests and checks without any overlay, tighten anything you held for this merge, and post COMPLETE.
