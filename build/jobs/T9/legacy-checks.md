# legacy-checks (T9)

**Status** · session_01362JGtE3gn5X3QqZps3xue · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two readings, each with my best reading. I carry on with both as stated; neither blocks the rest of the job.

1. **N214: `MINT_EXHAUSTED` is minted at four sites in three modules, for one condition.** Each site draws an opaque id from record-core's `mintOpaqueId`, gets `null` (no free id), and refuses with `MINT_EXHAUSTED`:
   - promotion `promote`, the new project's id (`src/promotion/index.mjs` 500);
   - review `#draft` and `#grant` (`src/review/index.mjs` 426, 462);
   - case-authoring `#publishCase`, a new case's id (`src/case-authoring/index.mjs` 573).

   One `where` claims one site, so a row now would fail the guard's arms C and G, as `STEP_DECLARED` did in T8.
   Under K275 the condition is the same, so the earliest module provides the one helper and holds the row. That is record-core, which owns `mintOpaqueId` (R6), or promotion if record-core should not refuse.
   **Best reading:** no `MINT_EXHAUSTED` row in this job. It waits, like the listener rows, until its four sites call one helper (for example record-core's `mintExhausted(kind)`). The row then names that helper, in legacy-checks' next job. I add `CASE_MEMBER_REFUSED` now: one site, `src/ratification/index.mjs check`, a whole-function `where` (the function mints only that code).
2. **N212 and N214: the two emptied families still have readers, so removing them breaks two other modules' suites.**
   - `CASE_DERIVATION_CHECKS`: `test/m/case-authoring/invariants.test.mjs` imports it by name from the catalogue (line 9, R29's arm at line 88). A missing named export fails the whole suite at load. store.mjs no longer reads it.
   - `ATTRIBUTION_CHECKS`: `test/m/ratification/checks.test.mjs` R14 (line 249) indexes `CAT.ATTRIBUTION_CHECKS[code]`. Once the export is gone that throws a TypeError.

   Both arms assert "this code left the catalogue", which holds vacuously once the family is gone. Each needs a one-line change in its own module (layer 8, T10).
   **Best reading:** keep both as empty exports in this job, and rewrite their headers to say they are empty and why they remain. Route the two one-line test changes to case-authoring's and ratification's next jobs. The two removals then follow in legacy-checks' next job.
   The alternative is to remove both now, leaving those two suites red until T10. That is yours to choose.

Also applied, no answer needed: C-32.6's and C-33.14's `where`s name `#publishCase`, not `publishCase`, because both regions sit in the private method. The public `publishCase` only opens the transaction.
