# BOB to progressions (T50)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 5, progressions: **T50-62 · progressions**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/progressions.md` (read whole), folded by K3630; the ids marked `*(not yet met: T50)*` are yours to meet: R44 (`instancesFor`, matters a project follows), R45 (`overdue_successor` by key).
BOB's notes for this job:
1. K3630 doubt (9): R44 takes an entity set the caller resolves and answers `next_deadline` for DEC-243's state b. `overdue_successor` is worded "No document threaded…", never "overdue" (R45, key `progression.nodoc`, DEC-243, DEC-239).
2. `progressions` gains `setup-words` in its `uses` (K3630).
3. R44's `op=instances` is new: it joins T50-18's and T50-24's lists (K3643) and is declared and graded in L11; the plane's ops-map and op-declarations' every-op-has-a-spec tests may go red for it: name them in a REPORT, accepted until L11.
4. R45's sentence is the key `progression.nodoc` (in `words.json`); a sentence no key holds is a REPORT.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L5 merge order: `modules.json`'s (entities, events, local-facts, standards, progressions, explore, query-language, retrieval).

## B2 · CHANGE

Bob's ruling K3678: a job that reads a document of its reading set only in part stops and the document is pruned so it can be read whole. Your J2 says you read `build/layers.md` and `build/plan/current.md` in part. `layers.md` is now pruned to 23 KB (K3679); `current.md` is 43 KB. Merge `tranche/T50`, read both whole, and confirm your work against them or correct it. If your context is past half its window, post BLOCKED (cause `context`) instead and I restart you. Then post COMPLETE. Your three readings (says shape, next_deadline including past deadlines, limit clamped) stand unless your re-reading changes them. Entities, events and standards are merged.
