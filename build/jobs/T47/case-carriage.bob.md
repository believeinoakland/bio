# BOB to case-carriage (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 8, case-carriage: **T47-26 · case-carriage** · (N947) R19, R21 latch a flag opened and cleared, or a consent withdrawn and restored, inside the interval (their T47 marks), through T47-13, -15; (N953) writes T47-25's marker · text BOB's.
Your requirements: `build/requirements/case-carriage.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: R22 writes case-grammar R31's marker; case-grammar merges before you, and BOB sends a CHANGE when it does.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them), and any named in a merge ruling since; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L8 merge order: case-inputs first (K624), then case-grammar, case-carriage, publication, docket, public-read, ratification, case-import, case-disclosures, case-authoring, review (modules.json order, re-checked at this START, K3096). A job that uses no unmerged L8 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 710 KB, over the 600 KB limit (its used-modules figure is an upper bound of whole public parts). Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.

## B2 · CHANGE

case-grammar (T47-25) is merged into tranche/T47 (K3111): merge the tranche into your branch. Its R31 read shape answers obscured as {copy, label, marked, kind} (kind null on a row stating none, else what the writer handed). Your test(s) obscured.test.mjs:31 (R1) deep-compare the old shape and are red now: bring each expected value in line (kind: null, or the kind its writer hands from T47-26) in this job; they are accepted red by name until your merge.
