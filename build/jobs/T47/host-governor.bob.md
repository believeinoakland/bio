# BOB to host-governor (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 3, host-governor: **T47-68 · host-governor** · (N983, K3027) `governorstate` is evaluated at the server's instant (the module's clock; a query `now` ignored), stated in its requirement and tested at the interface · text BOB's.
Your requirements: `build/requirements/host-governor.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
host-governor (T47-68) · R28 new (op=governorstate at the server's instant; a query/body `now` ignored). Status line and a T47 Suggestions note.
Finding: already met by the code (governorOp forwards only `host`; governorState reads only `host`), so the job adds the interface test (a request with `now` answers as one without) and changes no code. governorHolding/isHeld are in-plane (machinery-producers passes its own clock) and untouched.
Reds expected: none. Ids already named by other tests: none (coverage lists R28 unnamed).
Cross-module: none in L3.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 155 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L3: host-governor, capture, file-safety, sources. No L3 job uses another's new service, so each merges as soon as it is complete. K3033 moved N983's `sourcereach` to capture (R90) and gave sources `sourcepublishable`; your entry above is current.
