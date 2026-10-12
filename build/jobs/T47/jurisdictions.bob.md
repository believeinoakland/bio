# BOB to jurisdictions (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 1, jurisdictions: **T47-2 · jurisdictions** · (N971) Provides states `COUNTERPARTY_LEVELS` (setup-page R5's use), tested by name · text BOB's.
Your requirements: `build/requirements/jurisdictions.md` (read whole), folded by K3028; the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
jurisdictions (T47-2): R88 new (COUNTERPARTY_LEVELS stated in Provides, amending R24 and R28; N971). It is placed beside R31 in the action sections.
- The behaviour is already in code (jurisdictions/index.mjs:51, frozen ["state","county","city","district"]; validate's LEVEL_UNKNOWN at line 818). The job is a test only, plus the requirement.
- The test must name R88 and pin the list, its order, that it is frozen, and that a counterparty level outside it is LEVEL_UNKNOWN. setup-page R5 imports it.
- Coverage check is red on R88 until the test lands.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1031 KB, over the 600 KB limit (most of it your module's data files). Read your requirements and code whole; generated or vendored data and large data fixtures are not part of the set (K2053, K2083); for what remains over the limit, give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L1: record-grammar, jurisdictions, connection-grammar, bundler, odf-reader, file-scanner; no L1 job uses another's new service, so each merges as soon as it is complete.
