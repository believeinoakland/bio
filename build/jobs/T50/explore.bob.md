# BOB to explore (T50)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 5, explore: **T50-63 · explore**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/explore.md` (read whole), folded by K3630; the ids marked `*(not yet met: T50)*` are yours to meet: R25 (hops keep `attached_by`, `at`; node `label`, `entity_kind`).
BOB's notes for this job:
1. K3630 doubt (10): `ENT-` nodes carry `entity_kind`; labels and kinds come from entities R56 (`labelsOf`), one bounded read. `explore` gains `entities` in its `uses` (K3630).
2. entities (T50-59, same layer) provides R56: it merges before you; build against its requirement and merge the tranche branch on BOB's CHANGE.
3. The plan lists no new op for this job (`exploregraph` is existing).
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L5 merge order: `modules.json`'s (entities, events, local-facts, standards, progressions, explore, query-language, retrieval).

## B2 · CHANGE

DEC-308 (U322) is merged into tranche/T50 (K3662): the new key screen.explore.unnamed.why explains an unnamed node. Merge tranche/T50 into your branch and, where R25's node carries no label, read that key by key (never inline English). The design's mockup of the unnamed node is in docs/development/ux-substrate/screens/mock-screens.js.

## B3 · ANSWER · re J2

No change for you (K3665). explore answers data, not sentences: R25 stays as you pushed it (label null on an unnamed ENT- node, its entity_kind), and no setup-words edge is needed. The sentence screen.explore.unnamed.why is the screen's to draw (screens-investigate R35, L11), and only when a provider answers its {n}; no read answers that count in T50, so it is N1207 in next.md for T51. Your J1 COMPLETE stands; I send a CHANGE when entities merges so you re-run against the real labelsOf.

## B4 · CHANGE

entities is merged into tranche/T50 (K3681): `labelsOf({ids, viewer})` answers `{ok, labels: {id: {label, kind} | null}, count}` or `TOO_MANY_IDS`. Merge tranche/T50, replace your stand-in with the real read, run your tests and checks, and post COMPLETE.
