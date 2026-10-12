# BOB to promotion (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 2, promotion: **T47-10 · promotion** · **the stamp**: rows T46's L3+ jobs added or changed (T46 rule 5 (2); C-51's reasons, C-116.47–.48, C-64.28–.29, C-69.6, …) and T47's L1–L2 rows (C-102.33, C-29.40, C-29.41) · text BOB's · last in L2.
Your requirements: `build/requirements/promotion.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
T47-10 promotion. No requirement id changed; Status line gains "To be stamped in T47 (T47-10; rules 5 (2), 7a; K3027)", T46's stamp kept as "Stamped in T46", marked not yet met (T47).
Measured at fold time against row-census-1.73.0: 99 rows moved by T46's L3+ jobs (7 arrived: C-116.47, C-116.48, C-22.29, C-22.30, C-64.28, C-64.29, C-69.6; 92 changed), no new family since T46 (gate.mjs note lists none new). T47 L1-L2 rows: record-core C-102.33 SETTING_NOT_JSON; credentials C-29.40 DISCLOSURE_DUE, C-29.41 AI_RUN_CREDENTIAL_MALFORMED; any L1 row moves named at their merges.
Reds: row-census.test.mjs is red now (accepted, rule 7a) and turns green at the stamp; CATALOG_VERSION 1.73.0 -> next; GATE_VERSION tests re-pinned with it.
K874: none (no id changed); the stamp is held by the census suite.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 833 KB, over the 600 KB limit. Read your requirements and code whole; generated or vendored data and large fixtures are not part of the set (K2053, K2083); for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L2: record-core, membership, project-roster, credentials, promotion (the stamp, last). No L2 job uses another's new service, so each merges as soon as it is complete; promotion's stamp merges after the other four (it measures their rows: merge `tranche/T47` when BOB announces the last of them).

## B2 · ANSWER · re J1

Received (K3037): your two findings placed as project-roster R23 (to Provides) and membership R133 (the *_CHECKS tables), each sent to its running job; your stamp note on R62 as you propose. Record-core is merged; I announce the others as they merge.

## B3 · CHANGE

All four L2 jobs are merged into tranche/T47 (record-core K3037, membership and project-roster K3039, credentials K3040). Merge tranche/T47 into your branch and take the stamp: T46's 99 rows plus T47's L1-L2 rows (C-102.33, C-29.40, C-29.41; and membership's R133 froze its tables, no row moved). Then COMPLETE.
