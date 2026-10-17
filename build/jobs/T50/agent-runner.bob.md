# BOB to agent-runner (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 6, agent-runner: **T50-64 · agent-runner**. Model: the default model (claude-opus-5-5).
Your requirements: `build/requirements/agent-runner.md` (read whole), folded by K3615; the ids marked `*(not yet met: T50)*` are yours to meet: R35 (the local runner disabled), R36 (the remote conversation, CONDITIONAL on R38), R37 (the tool door, CONDITIONAL), R38 (the bottom-up proof), R39 (the copy's own log), R40 (`GET /remote/version`, CONDITIONAL).
BOB's notes for this job:
1. First in L6, merged at once whatever else lands (N1197, Bob's K3611): R35 makes `AgentRunner.fetch` answer 410 `LOCAL_RUNNER_DISABLED` to every request.
2. R38 is your first step after R35: the bottom-up proof on biosmoke8 by this module's own code, each step logged by the copy (R39). Only once it passes are R36, R37 and R40 built (K3615). If a step fails, post BLOCKED with the step, request and answer, and complete R35 and R39 (plan entry).
3. K3615: the remote class and its door stay in agent-runner (no module cut before the proof). Bundler's second class and door address, signin-door's `check`, op-declarations' check steps and instance-setup's `part_signin` are not yours (a CHANGE to a job not yet merged, else T51); ai-accounts' 30-day lifetime waits for T51.
4. N1155 and N1189 are void while R35 holds (moved to applied). The records a cloud session leaves in the member's Anthropic account (instance-setup R54) are BOB's to tell Bob with the proof's result, not before.
5. agent-worker (T50-65), agent-harness (T50-66) and others build R111, R17 and screens R41 only on BOB's CHANGE that your proof passed.
6. The plan lists no new op for this job. Plan model: the default model, a new provided service of more than three ids (rule 3).
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Plan rule 9 applies: the remote proof on biosmoke8 by the module's own code, each step logged by the copy (R39); no remote cell is run from a Claude session's own tools. If a step fails, post BLOCKED with the step, request and answer, and complete R35 and R39.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L6 merge order: agent-runner first (N1197, K3611), then `modules.json`'s (inquiry, basis-versions, run-rules, ai-use, ai-runs, capture-requests, reading-guides, skills, question-explorer, agent-harness, agent-model, agent-worker).

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, now about 23 KB and read whole (K3679).
