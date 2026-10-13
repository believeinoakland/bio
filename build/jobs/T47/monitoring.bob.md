# BOB to monitoring (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 10, monitoring: **T47-45 · monitoring** · (N969) a served act setting a bundle's `monitoring.enabled`, so `op=monitor` from Add is not refused `NOT_MONITORED` · text BOB's.
Your requirements: `build/requirements/monitoring.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: none beyond your entry.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them), and any named in a merge ruling since; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L10 merge order: monitoring, following. A job that uses no unmerged L10 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 1389 KB, over the 600 KB limit (its used-modules figure is an upper bound of whole public parts). Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.

## B2 · ANSWER · re J1

Your reading stands (K3135). R74 is re-worded on `tranche/T47` to the order you are building: machine author, no `bundleId`, `ABSENT` (sight, `membership.inSight`), MONITOR_SET_REFUSED, NO_LOCATOR, the `existed` no-op, then the write through `promotion.promote` as the member, with promotion's refusal relayed as given. No new Uses. Merge `tranche/T47` into your branch and test the order as worded, with a control for a relayed promotion refusal.
