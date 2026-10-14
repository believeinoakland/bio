# BOB to screens-daily (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, screens-daily: **T47-60 · screens-daily** · (N972) Home's "What the group is working on" with each project's question count and stage; `startfrom` on Home (through T47-57) · text BOB's; adds: (DEC-201 (8)) R10 `projects`; (DEC-201 (7), DEC-202 (4)) R11 Home's first-visit and new-group states; (DEC-201 (13)) R12 Queue's and Find's empty states; (DEC-212) R13 the unsent-request item's three acts.; adds: (DEC-214 (3); K3127) R10's projects rows draw members, activity and last change once project-roster answers them (N1025)
Your requirements: `build/requirements/screens-daily.md` (read whole). Marked `*(not yet met: T47)*`: R8, R9, R10, R11, R12, R13; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: R10's members, activity and last change are drawn once project-roster answers them (N1025, T48): until then the rows draw what `projectlist` answers, and the rest is a `test.todo` naming N1025.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); none is yours unless named in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 257 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · CHANGE

screens-daily R10 changed on `tranche/T47` (Bob's K3142): each projects row draws members, eight weeks' activity and last change as `projectlist` answers them (project-roster R28, T47-93, running now out of layer); the "until then draw none" clause is gone, so drop the `test.todo` naming N1025 from your START notes. Merge `tranche/T47` into your branch now. Build against R28's shape (`members` [{member, handle}], `activity` eight integers oldest first, `lastChange` instant or null) with a fixture; BOB sends another CHANGE when T47-93 merges, and you merge `tranche/T47` again and run against it before COMPLETE.

## B3 · ANSWER · re J1

K3143: (1) Home draws no welcome offer itself: the guide's `marks` (screens-wizards, drawn by the shell under the path) are Home's R11 offers. (2) your reading stands. (3) the owner is project-roster R27, merged (in `projectlist` already); members, activity, last change are R28 (T47-93, my B2): no `test.todo`. (4)–(6) stand.
