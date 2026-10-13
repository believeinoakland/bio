# BOB to progressions (T47)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 5, progressions: **T47-69 · progressions** · (N983, K3027, K3033) `proposals` (`proposalsFeed`) and `captureprogressions` evaluated at the server's instant (R16's configured clock; a query `now` ignored) · text BOB's.
Your requirements: `build/requirements/progressions.md` (read whole); R43, marked `*(not yet met: T47)*`, is yours to meet.
BOB's notes for this job: a request carrying `now` or `nowMs` (query or body) answers exactly as the same request without it; an in-plane caller (queue-producers, calculations, intent) may still pass its own instant to `proposalsFeed` (R16). Test both ops at the interface with a control that sets the module clock through `progressionsOf`'s `nowMs`.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp, K3066 among them); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L5: local-facts, progressions; neither uses the other's new service, so each merges as soon as it is complete.
Reading set (mechanics §17): measured at this START: 751 KB, over the 600 KB limit, but its used-modules figure (437 KB) is an upper bound counting their whole public parts. Read, per mechanics §3, each used module's Purpose and only the services your Uses names; if that is still over, have a worker read those parts whole and write a task digest for this job (K2032).
