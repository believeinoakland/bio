# BOB to bundler (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 1, bundler: **T50-1 · bundler**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/bundler.md` (read whole), folded by K3616; the ids marked `*(not yet met: T50)*` are yours to meet (R33, R34).
BOB's notes for this job:
1. N1107, N1156, N1171 (K3268, K3353, K3568): `bio-plane/test/system/fleetbundles.test.mjs`'s "agent-worker's 28 inputs are all recorded" hand-lists the inputs and lags the bundle (36 now). Assert the recorded inputs against what the committed manifest `agent-worker/dist/agent-worker.bundle.json` and the build reach, never a hand list. This clears the plan's rule 5 (4).
2. R33 (N1170): the container part carries `instance_type` from the member's `wrangler.jsonc` (agent-runner and file-scanner). Check the installer's container create would pass it; if the installer must change, a REPORT to BOB (its job is T50-78, layer 11).
3. R34 (N1153): `bio-plane/scripts/deploy.mjs` (yours) compares the derived bindings before skipping and keeps undeclared `plain_text` bindings.
Reading set: 600 KB with all your tests, about 250 KB without: read whole what rule 2 names.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items; words by key through setup-words' `word(key, vars)`, which is now in layer 1 so you may use it, adding `setup-words` to your `uses` by a REPORT to BOB if you start using it).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

From OCR-WORKER #6 (J1 REPORT; confirmed): ocr-worker's R23 makes its bundle reach two more renderer sources, ../pdf-worker/src/picturepixels.mjs and ../pdf-worker/src/pngdecode.mjs. bio-plane/test/system/fleetbundles.test.mjs (yours) lines ~294-298 pin ocr-worker's cross-tree inputs (want 9, got 11). Per K3268, assert them against what the committed manifest and a fresh build reach (as you did for agent-worker), never a hand list; once job/T50/ocr-worker is merged into tranche/T50 (BOB will CHANGE you), merge the tranche branch and re-run. Then COMPLETE again.
