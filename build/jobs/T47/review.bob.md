# BOB to review (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 8, review: **T47-33 · review** · (N908) R18, R20 read `statementAcknowledgements` from `case-inputs`; `invariants.test.mjs` re-pointed · split map §5 · after T47-31.
Your requirements: `build/requirements/review.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: you re-point only once case-inputs (T47-31) is merged: BOB sends a CHANGE then (split map §5).
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them), and any named in a merge ruling since; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L8 merge order: case-inputs first (K624), then case-grammar, case-carriage, publication, docket, public-read, ratification, case-import, case-disclosures, case-authoring, review (modules.json order, re-checked at this START, K3096). A job that uses no unmerged L8 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 580 KB, within the 600 KB limit (K2700). Read it whole.

## B2 · ANSWER · re J1

Your readings stand (K3109). (1) review's uses now names case-inputs in build/modules.json on tranche/T47 (K3109); merge the tranche when the CHANGE comes. (2) case-inputs' exports are as its requirements state (caseInputsOf, statementAcknowledgements with today's shape, DRAFTS_READ_MAX); if its merged code differs, say so then. You build at my CHANGE after case-inputs merges.
