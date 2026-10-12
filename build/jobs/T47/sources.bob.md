# BOB to sources (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 3, sources: **T47-13 · sources** · (N947) answers the instants at which a source's disclosures and consents changed; (N983, K3027, K3033) `sourcepublishable` evaluated at the server's instant (a query `now`/`at` ignored) · text BOB's.
Your requirements: `build/requirements/sources.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
sources (T47-13) · R20 new: sourceChangesSince({source, since, limit?, after?}), in-plane, the instants (disclosure, consent, withdrawal) after `since` up to the read, `{at, act, entry}`, no values; bad `since` -> changes: null, since_invalid: true; unknown source NO_SUCH_SOURCE (C-121.1); N90 bound.
Doubt for BOB: the plan's N983 half (`sourcereach`) is capture's op, folded as capture R90; sources answers no read at a caller's `now` (op=sourcepublishable passes a stated `at`, not named by N983, left as is).
Reds: none expected. Already named by other tests: none (coverage lists R20 unnamed).
Cross-module: case-carriage R21 (L8, T47-26) consumes R20. None in L3.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 411 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L3: host-governor, capture, file-safety, sources. No L3 job uses another's new service, so each merges as soon as it is complete. K3033 moved N983's `sourcereach` to capture (R90) and gave sources `sourcepublishable`; your entry above is current.
