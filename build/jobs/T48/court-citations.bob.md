# BOB to court-citations (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 1, court-citations: **T48-5 · court-citations** · (N1039, K3147) court-data held as data, parsed on first use or carried as an upload part, adding nothing to the plane's global scope; tested.
Your requirements: `build/requirements/court-citations.md` (read whole), folded by K3197; the ids marked `*(not yet met: T48)*` are yours to meet.
BOB's notes for this job:
court-citations (T48-5): R11 new (amends R1–R3, R6, R7): the data held as data, parsed once on first read, no data built at import; every name and value unchanged. If the export names cannot both stay plain bindings and load lazily, say so in a QUESTION at once (id-spaces would then need a re-point, which BOB places); do not change the names. `court-data.mjs` is generated (`node court-citations/build.mjs`, with `--check`): regenerate it with your change and keep the check green.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1805 KB, over the 600 KB limit (most of it your module's data files). Read your requirements and code whole; generated or vendored data and large data fixtures are not part of the set (K2053, K2083); for what remains over the limit, give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L1: record-grammar, jurisdictions, signatures, bundler, court-citations, ooxml, file-scanner; bundler waits on signatures' merge (it uses R46, R47); every other job merges as soon as it is complete.
