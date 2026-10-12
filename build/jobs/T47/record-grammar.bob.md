# BOB to record-grammar (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 1, record-grammar: **T47-1 · record-grammar** · (N956) `PROPOSAL_STATES` gains the `status_report` subject and its sentence; (N958) `checkBundle` admits a `success_record` object (`SUC-<year>-<digits>` id with no slug, its type, a `success_record@1` schema or the row-object exemption) · text BOB's · first in L1.
Your requirements: `build/requirements/record-grammar.md` (read whole), folded by K3028; the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
record-grammar (T47-1): R61 new (PROPOSAL_STATES gains `status_report` after `bearing`; seventeen subjects; N956); R62 new (checkBundle admits a `success_record` document, amending R3, R39, R40, R59; N958).
- R62's admission is BOB's choice of N958's two options: the schema stamp, not the row-object exemption. `success_record@1` joins the default knownSchemas (sixteen), because consequences already writes `schema: success_record@1` (src/consequences/index.mjs ~1536). R1's prefix set, BUNDLE_ID_RE and HEADINGS stay unchanged; the SUC id passes C-1.2 only with object_type success_record and no slug.
- Today a success_record bundle draws C-1.2 (checkIdentity, BUNDLE_ID_RE) and C-2.5 (BUNDLE_TYPES has no SUC); checkHeadings already returns when HEADINGS has no entry for the type.
- These tests will go red and must be re-pinned: bundle.test.mjs "R39 the default knownSchemas are the fifteen stamps"; labels.test.mjs "sixteen subjects" (R38, R42 ... R60, three tests); document.test.mjs line 66 (SUC is in STATES and not in HEADINGS; stays true).
- The new tests must name R61 and R62 explicitly. consequences R24's test.todo (N958) becomes a test in T47-35, not in this job.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 338 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L1: record-grammar, jurisdictions, connection-grammar, bundler, odf-reader, file-scanner; no L1 job uses another's new service, so each merges as soon as it is complete.
