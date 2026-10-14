# BOB to acquisition (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 3, acquisition: **T48-15 · acquisition** · (N998, K3044) R2/R27's comparison of two captures made independent of timing: its cause is found, and it is never skipped.
Your requirements: `build/requirements/acquisition.md` (read whole); no id is newly marked for T48: R2 and R27 stand as written, and their tests must pass every run.
BOB's notes for this job:
acquisition (T48-15), test robustness (N998): R2/R27's comparison of two captures failed once in regression run 38247843298's module step (it passed in the package step) and 1 in 51 locally under a concurrent suite. Find the cause (a clock read, an ordering, a shared temp path, a race with another test's state) and remove it, in the test or, if the cause is in the module, in the code; never skip, retry-until-green or loosen what the test proves (P7). Record the cause and how you showed it gone (for example, the test run many times, alone and beside the suite).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1035 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L3: host-governor, provenance, acquisition, capture (each merges as soon as it is complete; none uses an unmerged same-layer change in T48).
