# BOB to provenance (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 3, provenance: **T48-14 · provenance** · (N1009, K3065) R1 updates `register.registered` on a re-registration under the same bundle; R48 states which instant `registered` holds (the first, with the last held separately), so capture R77's "first registered" reads true; tested. (N1052) `mk6-bundle-names-no-author.test.mjs` signs in by `{handle}` · text BOB's.
Your requirements: `build/requirements/provenance.md` (read whole), folded by K3203; the ids marked `*(not yet met: T48)*` (R1, R48) are yours to meet.
BOB's notes for this job:
provenance (T48-14): as folded, `registered` is the first registration's instant (this module's clock), never moved by a re-registration under the same bundle, and a new `last_registered` holds the latest; R48 lists both columns. Add the column by the module's own schema migration, existing rows reading `last_registered` = `registered` (BOB's reading; say in your record if another is needed). Readers re-checked at this START (K3203): no module outside provenance reads the `register` table's `registered` column directly; capture R77 reads it through your services, and its "first registered" is what R1 now guarantees. A change to what a provided service returns is a REPORT to BOB first (P5). (N1052) `mk6-bundle-names-no-author.test.mjs` signs in with `{handle}` (founder `admin`), clearing its K3192 red.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 781 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L3: host-governor, provenance, acquisition, capture (each merges as soon as it is complete; none uses an unmerged same-layer change in T48).
