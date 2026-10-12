# BOB to project-roster (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 2, project-roster: **T47-8 · project-roster** · (N940) its fixture's record-core stub gains `declareTable`; (N972) a read of the projects a member may see with each one's stage (the question count per doubt 5) · text BOB's.
Your requirements: `build/requirements/project-roster.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
T47-8 project-roster. Ids: R26 new: projectList({viewer, limit}) (op=projectlist), the projects viewer sees at FULL (membership R43/R44, the rule R1/R14 use; complement of R9's directory), answer {ok, projects:[{id, name, stage}], count, limit, truncated}, id order, PROJECT_LIST_LIMIT 200 as R9; stage = the project's recorded bundles.current_state (record-core R37), null when none; no question count (Home reads basis-versions' T47-18 op). Writes nothing, never refuses (empty list for a viewer R43 admits to nothing). N940 recorded as a Suggestion (test-only): fixture's record-core stub gains declareTable.
Reds: none expected. The fixture's bundles table (fixture.mjs:32) lacks current_state; the job adds it for R26's tests.
Findings: project-roster (L2) cannot use project-stage (L8), so "stage" is the recorded current_state, as T46's Home drew it (K3000), not project-stage's derived stage. op-declarations/op-grades/control-plane must declare, grade and route projectlist (T47-53, T47-48, T47-65 lists of "T47's new ops").
K874: R26 named by no test today.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 393 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L2: record-core, membership, project-roster, credentials, promotion (the stamp, last). No L2 job uses another's new service, so each merges as soon as it is complete; promotion's stamp merges after the other four (it measures their rows: merge `tranche/T47` when BOB announces the last of them).
