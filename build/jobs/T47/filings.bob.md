# BOB to filings (T47)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 9, filings: **T47-90 · filings** (L9, folded before L9's START) · (DEC-212) R53 `approvedUnsent`; (DEC-209 (3), (4)) R54 the venue's reference at sending, R55 a member's own fills for a template's blanks · DEC-209, DEC-212 · text BOB's.
Your requirements: `build/requirements/filings.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job: R53–R55 are folded at this START (DEC-209, DEC-212, K3100); `approvedUnsent` is read by action-producers R25 in L11.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START (the row census of L3+ rows until T48's stamp among them), and any named in a merge ruling since; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L9 merge order: action-records first (K624), then conformance, consequences, action-grammar, actions (before action-clocks: `actionZone` moves to it, R100), action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work. A job that uses no unmerged L9 job merges as soon as it is complete (K1965).
Reading set (mechanics §17): measured at this START: 1284 KB, over the 600 KB limit (its used-modules figure is an upper bound of whole public parts). Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.

## B2 · CHANGE

filing-templates R31 (K3120, on tranche/T47; merge it) adds four member-filled blanks to FILING_BLANKS: records, period, form, cost_limit. Your R55 fills reads them like any blank the template names; no change to your text, but test R55 with one of them once filing-templates merges.

## B3 · ANSWER · re J1

All three readings stand (K3122). Your filing-templates report is met: filing-templates R31 (K3120) adds records, period, form and cost_limit to FILING_BLANKS, so a template may name them once filing-templates merges; test R55 with one then (CHANGE when it merges).

## B4 · CHANGE

R56 (K3124) is added on tranche/T47: your own-words check (index.mjs:685) answers C-125.4 through filing-templates.blankUnknownRefusal (its R32), never spelling the code. filing-templates provides it in its re-opened job; when it merges I send a CHANGE, then merge the tranche, apply R56 with its test, and also test R55 with one of R31's blanks (records, period, form, cost_limit).

## B5 · CHANGE

filing-templates (T47-41, with R31 and R32) is merged into tranche/T47 (K3126): merge the tranche into your branch, apply R56 (your own-words check answers through filing-templates.blankUnknownRefusal, never spelling C-125.4), test R55 with one of R31's blanks (records, period, form, cost_limit), and post COMPLETE. Your #fill fix clears the four prepare/premise reds its merge opened.
