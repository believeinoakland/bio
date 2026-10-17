# BOB to ai-use (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 6, ai-use: **T50-69 · ai-use**. Model: claude-haiku-5-5.
Your requirements: `build/requirements/ai-use.md` (read whole), folded by K3637; the ids marked `*(not yet met: T50)*` are yours to meet: R15 (each conversation's effort recorded beside its model).
BOB's notes for this job:
1. Haiku: rule 6's second and third items only (stated below).
2. N1168: each usage entry records `effort`. ai-runs R88 (T50-13, same layer) passes `effort` to your `countUsage` unchanged; you merge first.
3. The plan lists no new op for this job.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies to Haiku jobs in its second and third items only: "labeled" and hand-lists read from the owner's declaration (not its words-by-key, D29 or "team" items).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L6 merge order: agent-runner first (N1197, K3611), then `modules.json`'s (inquiry, basis-versions, run-rules, ai-use, ai-runs, capture-requests, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-worker).

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).
