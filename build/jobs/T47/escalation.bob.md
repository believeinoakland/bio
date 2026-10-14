# BOB to escalation (T47)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 9, escalation: **T47-42 · escalation** · (N961) `real.test.mjs` drives `action-records` (test only); (N962, N992) C-116.41 `ESCALATION_BY_ACT_ONLY` and C-116.14 `ALREADY_ATTACHED` read DEC-199's sentences by key; (N983, K3027) the escalation reads evaluated at the server's instant (a query `now` ignored) · split map §5; DEC-199; text BOB's.
Your requirements: `build/requirements/escalation.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: `real.test.mjs` drives action-records once it is merged (CHANGE).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them), and any named in a merge ruling since; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L9 merge order: action-records first (K624), then conformance, consequences, action-grammar, actions (before action-clocks: `actionZone` moves to it, R100), action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work. A job that uses no unmerged L9 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 903 KB, over the 600 KB limit (its used-modules figure is an upper bound of whole public parts). Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.

## B2 · CHANGE

action-records (T47-37) is merged into tranche/T47 (K3125): merge the tranche; real.test.mjs now drives action-records (N961).
