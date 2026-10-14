# BOB to admission (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, admission: **T47-77 · admission** · (K3043; credentials R63, CREDENTIALS #13 finding 5) its gate (R10) confines an `ai` credential that carries a `run` to that run: a write naming another run is refused, tested with a control · text BOB's (folded at L11's START); (K3084) relays credentials' `sessionLockedRefusal` and `reauthDue` (R71); adds: (K3043) R23 an `ai` credential carrying a `run` confined to it (the existing item's text); (K3084, credentials R71) R24 a locked session admitted only to `unlock`, `reauth`, `signout`; R25 `REAUTH_ACTS` refused `REAUTH_DUE` outside the window.
Your requirements: `build/requirements/admission.md` (read whole). Marked `*(not yet met: T47)*`: R23, R24, R25; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: none beyond your entry.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); none is yours unless named in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 576 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · ANSWER · re J1

K3143: (1) `reauthdue` is a store-internal route of store-door (its new R15, re-opened by CHANGE), answering `{due}` from `credentials.reauthDue({token})` with the session header the door already hands on; ask it as you ask `session`; a silence is R6's 502. (2) Your `REAUTH_ACTS` shape is now op-declarations R62 (`op → null | {field, values}`, `memberset` `{field: "role", values: null}`); import it. (3) Statuses, order and `readerOf` as you read them. The optional `background` flag stands; control-plane passes it (told). Merge `tranche/T47` for R62's text.
