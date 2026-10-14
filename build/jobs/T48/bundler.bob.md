# BOB to bundler (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 1, bundler: **T48-4 · bundler** · (N1047) `release-assemble.mjs` writes the signed release notice beside the assets: version, date, the manifest's sha256, a security mark, and notes in members' words (for members; for administrators; what an administrator must do), the notes inside what is signed. The workflow's step is `not_product` (BOB's act) · after T48-3.
Your requirements: `build/requirements/bundler.md` (read whole), folded by K3197; the ids marked `*(not yet met: T48)*` are yours to meet.
BOB's notes for this job:
bundler (T48-4): R32 new (amends R22, R23, R30): `release/NOTICE.json` written at assembly from `release/notes/<version>.json`; `manifest` is the SHA-256 of the fleet payload (R22), so the notice is emitted and signed in the same run (BOB's choice, K3197); `date` from the notes file, never the clock. The workflow step that signs and publishes it is `.github/`, not_product: not yours. Uses signatures' R46/R47 (T48-3): merge the tranche branch once SIGNATURES merges (BOB sends a CHANGE).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 580 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L1: record-grammar, jurisdictions, signatures, bundler, court-citations, ooxml, file-scanner; bundler waits on signatures' merge (it uses R46, R47); every other job merges as soon as it is complete.
