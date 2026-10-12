# BOB to capture (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 3, capture: **T47-11 · capture** · (N979) `heldCaptures` (R77) rows carry the capture's grade and digest; (N969) a read listing set-aside documents, so `heldrestore` is reachable beyond one visit (doubt 6); (N971) Provides states `INFORMATION_GRAMMAR`; (N983, K3033) `sourcereach` (capture's route) evaluated at the server's instant, a clock seam added · SCREENS-INTAKE #1 J1, J4 · text BOB's.
Your requirements: `build/requirements/capture.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
capture (T47-11, plus T47-13's N983 half) · R77 amended (each held row's `capture: {sha256, grade}`, grade = provenance.captureGrade whole); R88 new (heldcaptures `state=set_aside`, rows carry `set_aside: {reason, author, at}`; bad state -> REQUIRED_ARGUMENT_MISSING as for `sort`); R89 new (INFORMATION_GRAMMAR in Provides); R90 new (op=sourcereach at the server's instant through a new `captureOf` clock option `now`, adopted/compared as R58; amends R8, R58).
Finding / doubt for BOB: `sourcereach` is capture's op (capture/index.mjs route -> sourceReachability, R8), not sources'; folded here as R90, so plan entry T47-13's N983 half belongs to T47-11. capture has no clock seam today (stampSecond()/Date.now()), hence R90's option.
Reds to re-pin: tests deep-comparing a held row's fields (screens-intake/held.test.mjs reads rows; capture's own held tests); none found pinning the route's `now` for sourcereach. heldCaptures' in-process `now` (age_days) left as is (not in N983).
Already named by other tests: R77 (amended): needs an explicit new test for `capture`; R8/R58 named by existing tests: R90 needs its own test. Coverage lists R88, R89, R90 unnamed.
Cross-module: screens-intake (L11) consumes R77's `capture` and R88; affordances may name `state` in its help. No in-layer dependency.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1013 KB, over the 600 KB limit. Read your requirements and code whole; generated or vendored data and large fixtures are not part of the set (K2053, K2083); for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L3: host-governor, capture, file-safety, sources. No L3 job uses another's new service, so each merges as soon as it is complete. K3033 moved N983's `sourcereach` to capture (R90) and gave sources `sourcepublishable`; your entry above is current.
