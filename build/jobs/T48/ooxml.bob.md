# BOB to ooxml (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 1, ooxml: **T48-6 · ooxml** · (N1039) its frozen tables built lazily on first use; tested.
Your requirements: `build/requirements/ooxml.md` (read whole), folded by K3197; the ids marked `*(not yet met: T48)*` are yours to meet.
BOB's notes for this job:
ooxml (T48-6): R34 new: derived tables (CRC-32's among them) built on first use; every export's value and shape unchanged.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 274 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L1: record-grammar, jurisdictions, signatures, bundler, court-citations, ooxml, file-scanner; bundler waits on signatures' merge (it uses R46, R47); every other job merges as soon as it is complete.
