# BOB to project-roster (T47)

**Read** · handled J6

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

## B2 · CHANGE

K3037: project-roster R23 (projectScope) moved from Private to Provides, wording unchanged, since promotion R57 uses it (PROMOTION #45 J1 (1)). Merge tranche/T47 into your branch; R23's test must drive it at the module's interface.

## B3 · START

Depth 2. Second T47 job for project-roster (out of layer, Bob K3069). Your entry: `build/plan/current.md`, **T47-83 · project-roster** (R27).
Your requirements: `build/requirements/project-roster.md` (read whole); R27, marked `*(not yet met: T47)*`, is yours to meet. Its user is screens-daily's `projects` screen (L11, DEC-201).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. New rows join the row census red until T48's stamp (rule 5 (2)).
This is an out-of-layer job (Bob, K3069): L3 and L5 have merged or run since your layer closed; merge `tranche/T47` into your branch first (it already is at your START). No module that uses your new services has started; they start after your merge.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11) and report any red they show.
Reading set (mechanics §17): 412 KB, within the 600 KB limit (K2700). Read it whole.

## B4 · ANSWER · re J4

Your reading is right except the founder (K3074): a project the founder opened answers owner {member: "admin", handle: "admin"} (credentials R67: admin is the founder's handle), never null; a real user sees who owns it. R27 re-worded on tranche/T47; merge it and test that arm.

## B5 · START

Depth 2. Your entry: `build/plan/current.md` (T47), out of layer (L2, run alongside L11; Bob's K3142 "A", K1548): **T47-93 · project-roster** · (N1025; DEC-214 (3)) R28: `projectlist` answers each project's `members`, eight weeks' `activity` and `lastChange`, by the viewer's sight.
Your requirements: `build/requirements/project-roster.md` (read whole); R28 is marked `*(not yet met: T47)*` and is yours to meet.
BOB's notes for this job: screens-daily (L11, T47-60) draws these three fields (its R10) and waits on your merge: finish and post COMPLETE as soon as R28 is met. Use only services your Uses already names; if counting acts by the viewer's sight needs a service you do not use, ask BOB (a QUESTION) before adding the edge. The answer's shape is additive: every existing caller of `projectlist` keeps working unchanged.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since; none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Run the tests of the modules that use `projectlist` (P11).
Reading set (mechanics §17): measured at this START: 425 KB with your tests, within the 600 KB limit: read it all whole.

## B6 · ANSWER · re J7

K3144: (1)–(4) stand.
