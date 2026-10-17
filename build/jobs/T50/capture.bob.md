# BOB to capture (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 3, capture: **T50-8 · capture**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/capture.md` (read whole), folded by K3627; the ids marked `*(not yet met: T50)*` are yours to meet: R94 (`recordCapturedFor`), R95 (`captureGradeOf`), R77, R83, R73.
BOB's notes for this job:
1. R94 records acquisition R47's `for` (T50-7, building at once): build against R47's text; when BOB's CHANGE says acquisition is merged, merge the tranche branch and run against the real service.
2. N1079 is found met (R77 already answers `capture.sha256`, K3627): no work, and screens-investigate reads it in L11.
3. R95's op `capturegrade` is declared and graded in L11 (T50-24, T50-18): the plane's ops-map and op-declarations' spec tests may go red for it; name them in a REPORT, accepted until L11.
4. capture-requests R48 (T50-81, L6) reads the asks R83 and R94 record.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L3 merge order: acquisition, capture (after acquisition), doorbell, file-safety. All four run at once; a job that uses an unmerged one's new service builds against its requirement and merges the tranche branch when BOB's CHANGE says the provider is merged.

## B2 · CHANGE

Acquisition (T50-7) is merged into tranche/T50 (K3647): merge the tranche branch into your branch and run R94 against the real recordCapturedFor caller (acquisition R47 calls recordCapturedFor({captureSha, question, by, at}) once on a filed or already-held capture) and liveCaptureSessions (its saved state now carries opened_by, opaque to you). Your other work stands.
