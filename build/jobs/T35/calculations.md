# calculations (T35)

**Status** · session_01R2CzzJxS8M5bLSwSsNm9sy · depth 2 · RUNNING until 2026-10-07T17:20:22Z (users' tests (workbooks … plane)) · handled B2

## J1 · QUESTION

Seven readings I am building on (carrying on meanwhile; none blocks):
1. R33–R36's recipes are instantiated through `create` with `kind` = the recipe's name (`outcome_rate_by`, `reasons_missing`, `reasons_repeated`, `waiver_share`, `consistency`, `before_after`, `target_met`, `policy_against_practice`) and `terms` its parameters; the module composes the calc-grammar recipe from the template over the input table, as `budget_against_actuals` composes its per-period steps today; a `recipe` given that differs from the composed one is refused `RECIPE_NOT_TEMPLATE` (a new code, no catalogue row yet, like T33's).
2. Op names as the Suggestion: `usesfreeze` (R32) and `applicationrecipes` (R33).
3. R32 `relationships`, from the registered owners' `neighbours` of the decider at one hop, items whose other end is the subject: `post` = lines `line:holds:*` (not employee, not contractor), `line:seat_on`, `line:post_in`; `employment` = `line:holds:employee` valid at the act's `when`; `former_employment` = `line:holds:employee` whose validity ended before it; `contract` = `line:contracts_with`, `line:holds:contractor`; `donation` = money's `money_flow` of kind `contribution`, `gift` or `behested`; `declared` = any kind of class `declared`. The cell lists them sorted, `;`-joined; empty is read "none held".
4. R32 `reason_fold`: extraction's fold (`normAlias`'s case and spacing, its split on non-letter, non-digit runs), every term kept in order: `labelTerms`' de-duplication and 24-term cap would fold two different long reasons equal.
5. R35's measure: a figure (a `CALC-` or cited figure) for one period, the calculation's own; or a table with `from`, `to` (dates) and `value` columns, one row per period; `bindsAt` and the version in force are read at each period's `to`.
6. R9's engine: office-readers records no application, so `engine` is "the file's spreadsheet program" and `engine_measured` false for every such input (no agreement of that engine is recorded as measured); marked on a table from a sheet range holding any formula cell, and on a figure citing a formula cell.
7. R32's frozen uses table is withheld whole (R10) from a viewer who may not see every event in it (`events.readEvent`), and keyed to its `project` for purge.
