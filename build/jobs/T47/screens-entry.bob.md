# BOB to screens-entry (T47)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, screens-entry: **T47-86 · screens-entry** · (N999, N1002, N1005; DEC-201 (1), (2), (5), (6), (12); DEC-202 (1)–(4); DEC-205 (5); K3052, K3053, K3060 D2, D4, D7, K3061 D3) R1–R11: `front`, `tour`, `forgot`, `reset`, `setup`, `join`, in the public and setup frames · registry.json at PR #33's head; text BOB's · after T47-56 and T47-75 (it reads instance-setup's `HOSTING_CONTROL`, a new edge `screens-entry → instance-setup`).
Your requirements: `build/requirements/screens-entry.md` (read whole). Marked `*(not yet met: T47)*`: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: It reads instance-setup's `HOSTING_CONTROL` (a new edge `screens-entry → instance-setup`) and merges after interface-shell and instance-setup.
You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); none is yours unless named in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 170 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · CHANGE

K3143 (screens-wizards R7, its contract with the shell): at `join`'s end, after `login`, call `cs.wizard("WIZ-7db08189cc0e58c3", null, {joined: true})` once; the guide sends the two `wizardprogress` counts and Home offers the welcome at step 3.

## B3 · ANSWER · re J1

K3144: (1)–(7) and (9) are now interface-shell R46 (relayed); (8) `publishedlist` becomes public (op-declarations R63). Build to them.

## B4 · ANSWER · re J2

K3145: your reading stands, written as interface-shell R47 (`cs.save(name, text, {label})`, `cs.copy(text, {label})`, `cs.signout({label})` answer their own control).
