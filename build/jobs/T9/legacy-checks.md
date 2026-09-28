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

## J2 · QUESTION

**N206: the two new rows' `where`s, measured with the guard (`civicos-ui/check-refusal-codes.mjs`).** This adds to J1 and replaces nothing in it.

I added the two rows as the entry words them: `STEP_DECLARED` C-102.8 at `src/promotion/index.mjs stepDeclared`, and `CASE_CATALOGUE_FAILED` C-102.9 at `src/gate.mjs runCaseGate` (whole function, promotion's J2.1 proposal). The guard then makes two new findings:
- **arm C: "could not find function stepDeclared".** `stepDeclared` is an arrow constant, `const stepDeclared = (held, detail) => …`, and the guard's `functionBody` resolves only a declaration or a method header.
- **arm C: "src/gate.mjs:377 (in runCaseGate) returns a CODELESS REFUSAL".** Once `runCaseGate` is a governed site, its ordinary answer `{gateVersion, ok, findings, warnings}` counts as a refusal with no code, because its `ok` is computed.

Both rows are right in substance: each code is minted at exactly one place. What has to change is the shape at promotion's site, in promotion's files (`src/promotion/`, `src/gate.mjs`), which promotion's layer-2 job owns in T9.

**Best reading** (K238 (4)'s pattern: "the `mint.X` helpers become named functions"):
1. Promotion declares `function stepDeclared(held, detail) { … }`, same body. The row stays `src/promotion/index.mjs stepDeclared`.
2. Promotion moves the failed-catalogue finding into a named function in `src/gate.mjs`, `caseCatalogueFailed(e)`, which returns the one finding and which `runCaseGate`'s catch calls. The row's `where` becomes `src/gate.mjs caseCatalogueFailed`. The gate's answer shape (R33) does not change.

I am writing the rows that way now (C-102.9's `where` = `src/gate.mjs caseCatalogueFailed`). Until promotion's job lands the two changes, the guard reports "could not find function" for both. That is the same state as T8's C-102.6/.7 before promotion marked its regions.
If you would rather C-102.9 name a region promotion marks inside `runCaseGate`, say so and I will re-point it.
