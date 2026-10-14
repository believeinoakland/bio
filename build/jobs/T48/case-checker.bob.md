# BOB to case-checker (T48)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 8, case-checker: **T48-41 · case-checker** · (N1039) the checker program is carried as an upload part, not inlined in the plane's global scope; `program.mjs` is regenerated before the bundles (K1540).
Your requirements: `build/requirements/case-checker.md` (read whole), folded by K3207; every line marked `*(not yet met: T48)*` is yours to meet.
BOB's notes for this job:
The checker program `bio-plane/src/case-checker/program.mjs` is a generated artifact you own (manifest): regenerate it with `node bio-plane/src/case-checker/build-program.mjs` from the repository root and keep its own byte-identity test green; BOB regenerates the bundles at the layer's close (K1540).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1353 KB with your tests (K2700), over the 600 KB limit. Read your requirements and code whole; for what remains over the limit (your tests and the used modules' public parts), give helpers in your session your entry and what follows it, have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Also (K3261): re-spell any member-facing "labelled" in your module as "labeled" (DEC-221).
Merge order in L8: case-grammar, publication, public-read, case-checker, case-import, case-inputs, review; a job that uses no unmerged same-layer change merges as soon as it is complete.

## B2 · CHANGE

Process fix on civicos-process main @ 3460207 (K3271, Bob's approval): your reading set is now smaller (mechanics §6 step 2, roles/JOB.md step 2): read whole your requirements, your entries, your layer's contract and your own code; of each used module only the services your entries touch; and only the tests that name a requirement your entries change. Your other tests are run, not read. Pull civicos-process main. If you have already read more, carry on; do not start helpers for a digest of the rest (your START's reading-set paragraph is replaced by this).

## B3 · ANSWER · re J1

Confirmed (K3273): build it as you describe. R25 now reads 'the first call of the module's one program accessor (which answers the program text and its two SHA-256s)'; merge tranche/T48 for the text.
