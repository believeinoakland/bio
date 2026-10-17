# BOB to credentials (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 2, credentials: **T50-5 · credentials**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/credentials.md` (read whole), folded by K3617; the ids marked `*(not yet met: T50)*` are yours to meet (R79, and R73's test).
BOB's notes for this job:
1. R79 (N1186): `aiGrantMint` and `aiRunCredentialMint` carry an optional `project`; the viewer they make is `membership.projectViewer(viewer, project)` (membership R149, T50-2, building now). Build against R149's text; when BOB's CHANGE says membership is merged, merge the tranche branch and run against the real service.
2. (N1060) R73's test against ai-accounts R26's new clause (a refused sign-in revokes the member's run credentials; T50-4, building now): the same, after ai-accounts merges.
3. admission (T50-79) and control-plane (T50-35) read an `ai` credential's project in L11; ai-runs (T50-13, L6) passes it.
4. A session may be refused reading this module's own files by name ("Credential Materialization", K1748): if so, post BLOCKED with the exact refusal; BOB tells Bob. Do not work around it.
Reading set: measured under 600 KB without your tests (`reading-sets.py`); read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md` L2), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L2 merge order: membership, project-roster, ai-accounts, credentials, promotion last (the stamp). All five run at once; a job that uses an unmerged one's new service builds against its requirement and merges the tranche branch when BOB's CHANGE says the provider is merged.

## B2 · CHANGE

K3624, K3625. (1) ai-accounts is merged into `tranche/T50`: merge it and run R73's refused-sign-in test against the real clause. (2) Your test "R48 the 17 sweep rows" quotes ai-accounts' old English ("your group's Civicsmith"): read those rows by key (plan rule 6), never English. (3) `modules.json` now gives credentials `setup-words` in `uses`. membership (R149) is not merged yet: I send a CHANGE when it is.
