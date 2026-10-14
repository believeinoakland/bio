# BOB to screens-publish (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, screens-publish: **T47-63 · screens-publish** · (N897 (1)) `case-editor`, `review-copy`, `ceremony` (N788's Photos step, N757's marking on screen, N683's "Publish at…"), `published`, `imported`, `docket`, `doorbell`'s page within the shell · registry.json; text BOB's; adds: (K1490, K3041, K3096: case-authoring R76) R5 amended, the Ties step sends `publish` with `tieAttested: true`; (DEC-207, DEC-208, DEC-210; K3079, K3080) R12–R15 the in-ceremony signer, its states, no key, phone, not an owner (`signrequest`); R16 `docketpost` signed with the kit; (K3079 (a)) R11 amended; (DEC-201 (8)) R17 `review-outside`.; adds: (K3114; RATIFICATION #25 J2) R13 reads the sitting's members' answers from `sitting` (each member's `op=ratify` answer), `members` in the case answer being the roster's; adds: (K3137, the K3052 audit) R2 shows the reader's link once
Your requirements: `build/requirements/screens-publish.md` (read whole). Marked `*(not yet met: T47)*`: R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: none beyond your entry.
You are a new module: `modules.json` lists you with empty `paths` and `tests` (K1043). Name every file you add, code and tests, in your COMPLETE; BOB adds them before the ownership check. Build under `bio-plane/src/<module>/` and `bio-plane/test/m/<module>/` unless your requirements say otherwise.
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); none is yours unless named in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 118 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · ANSWER · re J1

K3145: 1 and 3 stand (no stand-ins; R13's re-point no longer needed). 2: your `cs.signer` shape is interface-shell R47 (`sign([{label, bytes, namespace}])` → `{ok, signatures}` or `{ok: false, declined: true}`; `register({keep})` → `{ok, keyB64}`).
