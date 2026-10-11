# BOB to case-authoring (T45)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 8, case-authoring: T45-21 (N828, N855, N880; D6a, D6c, D13): R70 (open requests at signing), R34, R57, R65 amended, R71 (`carryOutcome`), R72 · `draft-T45-l8.md` §4a. Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/case-authoring.md` (read whole). Marked `*(not yet met: T45)*`: R34, R57, R65, R70, R71, R72.

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1821 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L8: case-grammar, publication, docket, public-read, case-account, case-authoring, case-check. You merge after case-grammar and case-account: merge `tranche/T45` into your branch when BOB announces each of their merges (a CHANGE), as you use both.

## B2 · ANSWER · re J1

(1) Yes: the row goes in publication's existing CASE_SOURCES_CHECKS (C-122), key COUNSEL_MATTER_NOT_PUBLISHED (K2830; PUBLICATION #29 told). (2) As you read it: body only, publishCase answers timeline: {we_did, withheld}; no front-matter field.

## B3 · CHANGE

case-grammar and publication are merged into tranche/T45 (K2833; publication's COUNSEL_MATTER_NOT_PUBLISHED row is C-122.8 in CASE_SOURCES_CHECKS). Merge tranche/T45 into your branch and re-run against them.

## B4 · CHANGE

case-account is merged into tranche/T45 (K2834), with case-grammar and publication (K2833): all your L8 uses are in. Merge tranche/T45, replace your stand-in outcomes reader with case-grammar's outcomesOf/outcomesLines/outcomesSectionLines and case-account R6's outcome judging, and post COMPLETE.
