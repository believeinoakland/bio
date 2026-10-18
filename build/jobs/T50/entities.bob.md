# BOB to entities (T50)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 5, entities: **T50-59 · entities**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/entities.md` (read whole), folded by K3630; the ids marked `*(not yet met: T50)*` are yours to meet: R35 (`label` read column, amended), R54 (`forum_kind`), R55 (`aliasesOf`), R56 (`labelsOf`).
BOB's notes for this job:
1. K3630 doubt (6): no forum mismatch refusal and no `forum_kind` correction act in T50; a team-added court is that `entitycreate` (plan entry). `forum_kind` is one of `jurisdictions`' `FORUM_KINDS` (R93, R94, T50-54, L1, merged).
2. K3630 doubts (4) and (10): `aliasesOf` gives retrieval its aliases in one read; `labelsOf` gives explore its labels and kinds in one bounded read. You are the provider for T50-10 and T50-63 (same layer; you merge first).
3. `aliasesOf` and `labelsOf` are in-process reads, not ops; the plan lists no new op for this job.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch (named above), and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements and code are well under 600 KB; its used-public figure is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items): words by key through setup-words' `word(key, vars)` (layer 1; `setup-words` added to your `uses`, K3632), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L5 merge order: `modules.json`'s (entities, events, local-facts, standards, progressions, explore, query-language, retrieval).

## B2 · ANSWER · re J1

Your first reading stands (K3663): aliasesOf takes any kind of ENTITY_KINDS and refuses a missing or unknown kind NO_KIND/UNKNOWN_KIND exactly as R51; R55 is reworded so on tranche/T50. setup-words is now in entities' uses in modules.json. Merge tranche/T50 into your branch before continuing.

## B3 · CHANGE

R55 is worded as meant (K3677): `aliasesOf` answers `{ok: true, aliases: [{entity_id, kind, label, alias}], limit, truncated, next}`; an unrecognised viewer `aliases: []`. Merge `tranche/T50` and make the answer and its test match, if they do not already.
