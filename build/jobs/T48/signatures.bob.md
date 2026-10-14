# BOB to signatures (T48)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T48), layer 1, signatures: **T48-3 · signatures** · (N1047; K3158; `draft-updates.md` §1–2) the release keys in one place, used by the installer (`ARMED_SIGNERS`) and by the plane's modules; a verify of a release notice under its own namespace; tested with a tampered note and an old version · text BOB's · provider for T48-4, T48-62 and T48-79.
Your requirements: `build/requirements/signatures.md` (read whole), folded by K3197; the ids marked `*(not yet met: T48)*` are yours to meet.
BOB's notes for this job:
signatures (T48-3): R45 `RELEASE_KEYS` (exactly the two lines installer's `ARMED_SIGNERS` holds today; the installer re-points in T48-79, not here), R46 `NS_RELEASE_NOTICE`, R47 `releaseNoticeStatement`, R48 `verifyReleaseNotice` (no downgrade or replay: `NOT_NEWER`); R1 amended to six namespaces. Tests: a tampered note, an old version, the running version (replay), another namespace, another key. Provider for bundler (T48-4) in this layer: merge first of the two.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 293 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
Merge order in L1: record-grammar, jurisdictions, signatures, bundler, court-citations, ooxml, file-scanner; bundler waits on signatures' merge (it uses R46, R47); every other job merges as soon as it is complete.
