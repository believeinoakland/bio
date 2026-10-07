# law-relations (T35)

**Status** · session_01MvNbDarJEgUrb9jDF7FgTx · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on; I carry on with them unless you answer otherwise.

1. **R9's `edition` and R15's "columns unchanged".** R9 records and reads back the `edition` of an `incorporates` relation; no column of the five tables holds it. My reading: `law_relations` gains one nullable column, `edition`, added at construction where absent (`ALTER TABLE … ADD COLUMN`, never filled for an earlier row), so a store created before the split still needs no caller migration (R16). Every other name and column is unchanged. An `edition` given on a relation that is not `incorporates` is refused `LAW_RELATION_NO_EDITION` (C-112.53; its translation says only an incorporation carries one), rather than silently dropped.
2. **R8.** `COURT_LINKS` becomes `interprets, applies, holds_invalid, requires`, and a link's target kinds `statute, regulation, ordinance, policy`, independently (any link type to any of the four). `CONNECTION_KINDS` gains `court_requires`, word "requires". C-112.29's translation is re-worded to name a policy among the targets (awaiting stamp).
3. **K1961's "`recogniseCitations` the seam's default".** I read it as `standards`' constructor default (it already passes `recognise = recogniseCitations`), so this module drops the unused import and R13 requires `recognise` of the host, as R13 words it. The `id-spaces` edge stays in `modules.json` (the host's `recognise` is its reading).
