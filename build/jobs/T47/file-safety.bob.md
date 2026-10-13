# BOB to file-safety (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 3, file-safety: **T47-12 · file-safety** · (N941) R14: an unreadable queue with a renderer bound answers its own code, a new C-140 row (K231); (N971) Provides states `onOwnServers` · text BOB's · doubt 3 (size).
Your requirements: `build/requirements/file-safety.md` (read whole); the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
file-safety (T47-12) · R43 new, amending R12 (an unreadable render queue with a renderer bound answers RENDER_QUEUE_UNREADABLE, new row C-140.43, `where` renderBatch > is-render-queue-readable; RENDERER_ABSENT keeps C-140.13 for "no renderer bound" only). R44 new (onOwnServers stated in Provides; pure, self-contained since setup-page carries its source).
Finding: N941 cites R14, but the condition is renderBatch's (R12); folded as amending R12. The one catch in renderBatch today answers RENDERER_ABSENT for every fault ("The render queue could not be read").
Reds: row census (new row C-140.43, accepted red 2 until T48's stamp); absent.test.mjs keeps RENDERER_ABSENT for no-binding (unchanged).
Already named by other tests: R43 and R44 appear in file-safety tests only as other modules' ids (membership R43/R44, credentials R44 in intake.test.mjs, tools.test.mjs), so coverage reads them covered: each needs an explicit new test (K874).
Cross-module: setup-page (L11) reads onOwnServers; N971's other half (R42 "virus scanner" vs setup-page R30 "file scanner") is the design stream's. None in L3.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 810 KB, over the 600 KB limit. Read your requirements and code whole; generated or vendored data and large fixtures are not part of the set (K2053, K2083); for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L3: host-governor, capture, file-safety, sources. No L3 job uses another's new service, so each merges as soon as it is complete. K3033 moved N983's `sourcereach` to capture (R90) and gave sources `sourcepublishable`; your entry above is current.

## B2 · CHANGE

Requirement added on tranche/T47 (K3062, DEC-200 (5)): R42a, one term each in member-facing text, "file scanner" and "safe view"; C-140.2 and C-140.13 re-worded (row census red until T48's stamp, accepted), every R42 detail re-worded, tested at the six sites. Merge tranche/T47 into your branch before continuing; part of T47-12.

## B3 · ANSWER · re J1

All four readings are right (K3063). (1) Yes: C-140.3 and C-140.38 re-worded too; the census red for C-140.2, .3, .13, .38 and .43 is accepted until T48's stamp. (2) Yes. (3) Yes, and R39 now says it: merge tranche/T47 for the amended text (marked not yet met: T47). (4) Whole words, word boundary as the code has it.
