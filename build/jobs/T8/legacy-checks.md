# legacy-checks (T8)

**Status** · session_013E7FEb6pLnkTkmnNFrnupE · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three readings, each with my best reading. I carry on with all three as stated; none blocks the rest of the job.

1. **N159 leaves two other findings on intent's documents.** I probed `checkBundle` over `aspirationDoc` and `goalDoc` (intent/doc.mjs) as they are written today. Once C-2.5 admits the types, each document still draws:
   - **C-1.2:** `ASP-2026-0001` and `GOAL-2026-0001` carry no slug, and `BUNDLE_ID_RE` requires one.
   - **C-2.2:** five core fields are missing (`produced_by`, `group`, `annotations_open`, `reeval_pending`, `visuals`).
   So the audit and the ratification gate still report these documents, under those two ids instead of C-2.5.
   **Best reading:** I apply N159 as written (`OBJECT_TYPES`, the known schemas, `STATES`). I also add `ASP` and `GOAL` to `BUNDLE_ID_RE` and `ANN_ID_RE`, as `BIAS` was added. The slug and the five core fields are intent's to write, as K171 prescribes "allocId plus a slug" for the layer-9 types; I will REPORT that for intent's layer-7 job.
   The alternative is for the catalogue to admit slugless `ASP-`/`GOAL-` ids and exempt these two types from C-2.2. That changes the id grammar and the core contract, so it is yours to rule, not mine.
2. **N128: `LISTENER_MALFORMED` has the same shape as `LISTENER_DECLARED`.** Both are minted for one condition at about 12 sites in 12 modules: promotion `#listen`, extraction, bias, content, retrieval, connections, inquiry, entities, calibration, basis-versions, provenance, and capture for `_DECLARED`. `#listen` mints both codes, so a whole-function `where` would also conscript `LISTENER_DECLARED`. `build/rulings.md` holds no structural ruling on either code.
   **Best reading:** `LISTENER_MALFORMED` waits for the same ruling as `LISTENER_DECLARED`. I add the other three now as C-102.6–C-102.8, each with a whole-function `where`:
   - `FACT_MALFORMED` (`registerFact`);
   - `STEP_MODULE_UNNAMED` (`registerStep`);
   - `STEP_DECLARED` (`registerStep`). It is also minted by `registerFact` for the same condition, a second registration of a name already held, and its sentence is true at both sites, per T6's two-site precedent.
3. **N155 cannot land from this side yet.** `src/run-productions/checks.mjs` reads `SUGGEST_CHECKS`, `SUGGEST_LEVELS` and `SUGGEST_KINDS` from the catalogue (`pick(CATALOGUE_SUGGEST, …)`). `store.mjs` (126) imports `SUGGEST_CHECKS` from it too, as do run-productions' and basis-versions' module suites. Removing the rows would break run-productions at load, and I cannot write run-productions' file.
   **Best reading:** N155 is deferred until run-productions holds the rows itself; its share is not in T8. Then legacy-checks deletes them. I record it as deferred with this reason.
