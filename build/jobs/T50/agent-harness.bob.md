# BOB to agent-harness (T50)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 6, agent-harness: **T50-66 · agent-harness**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/agent-harness.md` (read whole), folded by K3615 and K3637; the ids marked `*(not yet met: T50)*` are yours to meet: R17 (`remoteBrief`, CONDITIONAL on agent-runner R38), R18 (no absence for an empty level), R19 (a level disagreement named once).
BOB's notes for this job:
1. R17 is built only once T50-64's proof passes (BOB's CHANGE says so); R18 and R19 are unconditional.
2. K3637 doubt (6): a level disagreement is stated and read once, never looped; `JUDGEABLE` gains `disagreements` and the resumable state `disagreed` (R19). N1169: a `level-empty` proposal is refused when its read found no document in scope (R18).
3. Same-layer services: run-rules R35 (`levelEmptyHolds`, T50-70) and agent-model R24 (`disagreements`, T50-67) merge before you; build against their requirements and merge the tranche branch on BOB's CHANGE.
4. The plan lists no new op for this job.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L6 merge order: agent-runner first (N1197, K3611), then `modules.json`'s (inquiry, basis-versions, run-rules, ai-use, ai-runs, capture-requests, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-worker).

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).

## B2 · ANSWER · re J1

Your reading is right. R18 now says the greatest `documents` over a level's reads (any read that found a document in scope makes it 1 or more), on tranche/T50 (K3691). Merge tranche/T50 into your branch for the wording. Your tests need run-rules R35: you will get a CHANGE when run-rules merges; then merge tranche/T50 again, run your tests against the real levelEmptyHolds, and post COMPLETE again.

## B3 · CHANGE

inquiry, basis-versions, run-rules (R35 levelEmptyHolds) and ai-use are merged into tranche/T50 (K3699). Merge tranche/T50 into your branch, re-run your tests against the real modules, and post COMPLETE again (or your next entry).
