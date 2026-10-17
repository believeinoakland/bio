# BOB to retrieval (T50)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 5, retrieval: **T50-10 · retrieval**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/retrieval.md` (read whole), folded by K3630; the ids marked `*(not yet met: T50)*` are yours to meet: R73 (`findIn`, amended), R80 (titles), R81 (`content_id`), R82 (line breaks kept), R83 (sheet, range, cells), R84 (people by held alias), R85 (`browse`), R86 (`registerBrowseMarks`).
BOB's notes for this job:
1. K3630 doubt (1): N1177's minting is standards' (R60, T50-41); your share is R81 (`content_id`). Standards merges before you in this layer: build against its R60 text, and when BOB's CHANGE says it is merged, merge the tranche branch.
2. K3630 doubt (2): N1183's retrieval share is J-5 only (R82). Doubt (3): a whole-document fact marks no passage, and `t36.test.mjs`:61 changes with it. Doubt (4): the field is `correspondence`; entities R55 (`aliasesOf`, T50-59) gives the aliases in one read for R84.
3. K3630 doubt (5): `watchitem` and `secondlook` stay `following`'s (L10); they reach `browse` only through R86's registration. R86's list answer is `{items, truncated}` (K3635 wording).
4. entities (T50-59, same layer) provides R55 `aliasesOf` and R35's `label` read: it merges before you; build against its requirement and merge the tranche branch on BOB's CHANGE.
5. `browse` is in its own file `browse.mjs`. The new op `browse` (`op=browse`) is declared and graded in L11 (T50-24, T50-18): the plane's ops-map and op-declarations' every-op-has-a-spec tests may go red for it; name them in a REPORT, accepted until L11.
6. START re-measures retrieval (3,513 lines; with these about 4,000, M-T50-1): past ~4,000 it still runs, its split T51's first entry (P6).
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L5 merge order: `modules.json`'s (entities, events, local-facts, standards, progressions, explore, query-language, retrieval).

## B2 · CHANGE

Your new uses edge (setup-words, K3668) is on tranche/T50: merge it before your architecture check.
