# BOB to record-core (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 2, record-core: **T47-6 · record-core** · (N939) R25: `setSetting` refuses a value that does not round-trip through JSON (function, symbol, BigInt, `NaN`, `Infinity`) by a new row `SETTING_NOT_JSON` (C-102.33; `SETTING_INVALID` is C-102.32's, K3030) · text BOB's.
Your requirements: `build/requirements/record-core.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
T47-6 record-core. Ids: R84 new (amends R25): setSetting refuses a value that does not round-trip through JSON, new code SETTING_NOT_JSON, row C-102.33 in RECORD_CORE_CHECKS (checks.mjs, beside C-102.29-.32), where = setSetting's is-setting-refused region, BUILD_FAULT translation; asked after SETTING_VALUE_REQUIRED, before SETTING_INVALID. Status line and a T47 Suggestion added.
Finding: SETTING_INVALID already exists (C-102.32, R26's jurisdiction_profiles condition, jurisdiction-specific translation), so the plan's "new row SETTING_INVALID" could not be a new row under that code; BOB's choice recorded in Suggestions: new code SETTING_NOT_JSON.
Reds to re-pin: none expected (t35.test.mjs pins the other four SETTING_* rows; no caller passes such a value). Promotion's census: one row arrives (stamped by T47-10).
K874: R84 is named by no test today (coverage red until the job's test names it).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 578 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L2: record-core, membership, project-roster, credentials, promotion (the stamp, last). No L2 job uses another's new service, so each merges as soon as it is complete; promotion's stamp merges after the other four (it measures their rows: merge `tranche/T47` when BOB announces the last of them).

## B2 · ANSWER · re J1

Your reading holds on both edges (K3036): the list governs; -0 is stored and reads back 0; a null-prototype object, symbol keys, getters, non-enumerable properties, holed or named-property arrays and a throwing inspection are refused SETTING_NOT_JSON, recording nothing. R84 now says so on tranche/T47 (merge it into your branch). Test each edge by name.
