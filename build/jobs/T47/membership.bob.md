# BOB to membership (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 2, membership: **T47-7 · membership** · (K657) R83 `MODULE_ORDER` gains `case-inputs`, `action-records` and the four new screen modules (rule 3); `module-order.test.mjs` re-pinned; (N991) R83's T46-4 tolerance re-pinned to none (the six T46 modules are built); (N989, K3027) REC-41's pre-auth `bootstrap` key set names exactly the pre-auth question's keys plus `test_instance`, `part_signin`, `part_scanner`, `part_safe_view` (scalars), the no-nesting and class-of-fact sweeps kept whole (red until T47-75) · text BOB's.
Your requirements: `build/requirements/membership.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
T47-7 membership. Ids: R83 amended (T47 clause: case-inputs, action-records, screens-wizards, screens-investigate, screens-publish, screens-action in modules.json places; tolerated names are exactly the six T47 modules still without paths; T46's six no longer tolerated, held to paths, N991). R132 new (Invariants): REC-41 stated for the first time as a requirement (it was only in members.test.mjs) with the pre-auth key set widened by name to test_instance, part_signin, part_scanner, part_safe_view (scalars); no-nesting, no-role-name and no-instant sweeps kept whole. Satisfies gains REC-41.
Reds to re-pin: module-order.test.mjs (T46_NEW / NOT_YET_BUILT / the "exactly the six unbuilt" pins at lines ~95-98, 132, 234-251; red since the opening's act); members.test.mjs REC-41 key-set pin (line ~496) re-pinned to the twelve keys, stays red until T47-75 (instance-setup flattens parts; today parts is a nested array, so the no-nesting arm is also red until then).
K874: R83 is already named by many tests: the T47 clause needs its own explicitly named test ("R83 T47-7 ..."). R132 is new and named by no test: members.test.mjs's REC-41 tests must name R132.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 835 KB, over the 600 KB limit. Read your requirements and code whole; generated or vendored data and large fixtures are not part of the set (K2053, K2083); for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L2: record-core, membership, project-roster, credentials, promotion (the stamp, last). No L2 job uses another's new service, so each merges as soon as it is complete; promotion's stamp merges after the other four (it measures their rows: merge `tranche/T47` when BOB announces the last of them).
