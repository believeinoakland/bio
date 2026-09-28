# ai-runs (T7)

**Status** · session_017wY8RRGdm6dDyCdnDA4n5k · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two entries I cannot apply inside my paths; my best readings, on which I carry on:

1. **N69 (delete my copy of `searchedSection`).** No other module holds a copy yet: `case-authoring` (layer 8) is unextracted, and the one live caller is `store.mjs` 360/7989 (`#searchedForCase`) importing it from `airun.mjs`. Deleting it breaks legacy-store, and I may not add the function there (§12.2: only imports and calls). Reading: K78 (3)'s pattern already fits — the earlier module (ai-runs) keeps the copy and case-authoring re-exports it at its extraction, then the copy leaves. So I keep `searchedSection`, `SEARCHED_LEVEL_OUTCOMES` and the `SEARCHED_SUBJECT_SOURCES` re-export in `airun.mjs`, untouched, and record N69's share as deferred to case-authoring's job (it should carry the delete as its own entry). I will move them into a separate file of my paths only if you say so.

2. **D-375.** Its built work (`land/worker/D-375` @ 9a5df6e6: bdc133ff) changes `contentObservationsFor` (observation-log's since K78 (3); my copy is deleted by N49) and the acquire assembly in `bio-plane/src/index.mjs` (legacy-index/extraction), plus `nc-d375.mjs` and `observation-content.test.mjs` (legacy-tests). None of it is ai-runs' code; my requirements' Status already says "D-375 is observation-log's (K82 (5))". Reading: nothing of D-375 is mine to build; I record it as not applicable here and it needs an entry for observation-log (the producer) and extraction (the reading's character count).
