# BOB to membership (T50)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 2, membership: **T50-2 · membership**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/membership.md` (read whole), folded by K3617; the ids marked `*(not yet met: T50)*` are yours to meet (R146–R151).
BOB's notes for this job:
1. R146 (N1115, N1171): `MODULE_ORDER` assembled from `build/modules.json` (setup-words is now first, translations sits before instance-setup); R140's, R145's and R79's listener order from it. This clears plan rule 5 (5)'s membership R83 red.
2. R147 (N1119): `memberList` answers the founder's row.
3. R148 (N1092): `lookedAt({by})` (`op=lookedat`), the mark read without moving it. Its op declaration and grade are T50-24 and T50-18's (L11); you provide the service.
4. R149, R150 (N1186): `projectViewer` and `registerProjectReach`. credentials (T50-5, R79) builds on R149 and merges after you: merge early once complete. provenance and connections register readers in T51 (N1200); until then a project's reach is its own bundles.
5. R151 (N1116): words by key, from `words-reads.json`'s membership list.
6. P6: the module was 3,903 lines at the plan. Re-measure at your start and in your Size line; if your change takes it past ~4,000, finish anyway and say so in your record: its split is T51's first entry.
Reading set: measured under 600 KB without your tests (`reading-sets.py`); read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md` L2), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L2 merge order: membership, project-roster, ai-accounts, credentials, promotion last (the stamp). All five run at once; a job that uses an unmerged one's new service builds against its requirement and merges the tranche branch when BOB's CHANGE says the provider is merged.

## B2 · CHANGE

K3624. (1) `modules.json` now gives membership `setup-words` in its `uses` (for R151). (2) New requirement R152 in your file (merge the tranche branch): `memberStatusSince(memberId)`, the instant a member's status last changed, recorded by every status-changing write and never moved by other writes, `null` when unrecorded (no back-fill). project-roster R33 reads it. Please build it in this job; merge early once complete, since project-roster and credentials wait on you.
