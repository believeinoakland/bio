# case-import (T33)

**Status** · session_01Y1URYHRYBVXZLpDjSMzS7r · depth 2 · WAITING ON BOB (J4) · handled B4

## Completion (T33-67)

- **Entries applied:** T33-67 (C:A-14; K1448, DEC-112, D312), on the readings in J1 that BOB accepted (B2, K1633).
  - **R21:** each row of the case document's `calculations:` block (`case-grammar.calculationsOf`) is recreated by `calc-grammar` (`evaluate`, `resultKey`, `METHOD`), never trusted. Each input is found by the SHA-256 its row states, among the case file's files (case-grammar R13's `calculations/<calc>/inputs/<sha256>`) and the documents supplied later, and checked against that hash first. Each calculation is recorded as one of:
    - `recreated`;
    - `differs`: naming each result, with the source's value and the recomputed one. The result is the one stored under the row's result key, as case-checker R20 reads it, plus the result key itself;
    - `not_recreated`: naming each input that is missing or differs from its hash, an unheld method version (a workbook row's `not_recomputed` included, B4), or a recipe the evaluator refuses.

    The source's stated values are held only as its statement. No `CALC-`, money fact or record row is written; a test snapshots every table outside the module's own.
  - **R3:** recorded per calculation at the import and at each completion, in `case_import_calculations` (append-only, declared to the purge with the module's other tables). The checker's `calc_versions` is kept with its other versions.
  - **R4:** `importedCase` answers each calculation with its recreated result, beside the source's value labelled `SOURCE_CALCULATION`, and case-checker's own R20 answer with `agrees_with_this_copy`.
  - **R5:** a calculation's missing input is a missing material, so bytes matching it complete it.
- **CHANGEs applied:** B3 (K1636) and B4 (K1642): case-grammar merged; the module and its tests read the real `calculationsOf` and paths, and the stand-in reader is removed. B5 (K1644): case-checker merged; the real-checker case was added.
- **Deferred:** nothing.
- **Found in another module (REPORT, for BOB):** case-checker's R9 fills only materials from `documents`, and its R20 recomputes only over inputs the case file carries. So after a completion that supplies a calculation's missing input, case-import (R5, R21) records `recreated` while the checker still answers `not_recomputed`; this is recorded as `agrees_with_this_copy: false`. This is within case-checker's requirements as written. If its R9 should fill a calculation's inputs too, that is case-checker's. A test asserts the current behaviour (`real.test.mjs`).
- **Generated artifact:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, owned by `not_product`) carries case-import's source, so this job stales it, for regeneration at the layer close.
- **Final `uses`:** record-grammar, record-core, membership, strength, case-grammar, case-checker, inquiry-grammar, accepted-work, reevaluation, signatures, docket, and **calc-grammar** (added, K1633). `calculations` is not used.
- **Tests:** `node --test bio-plane/test/m/case-import/`: 84 pass, 0 fail. Users' tests (plane watch and accepted, case-disclosures, case-authoring, control-plane r49 and r52, op-declarations t28 and t31, affordances t31): 220 pass, 3 fail, the same three as on `tranche/T33` without this job (case-disclosures R29, case-authoring R29 and R30, all outside this module). No layer tests are named.
- **Checks:**
  - `format`: 126 modules, 0 failures.
  - `coverage`: 21 of 21 live ids, 0 failures.
  - `ownership`: 6 files, 0 failures.
  - `architecture`: 2 failures, both the `calc-grammar` edge (the module and `calculations.test.mjs`), which BOB adds to `uses` at the merge (K1633).
- Size (session_01Y1URYHRYBVXZLpDjSMzS7r): test runs 24, module lines 1852

## J1 · QUESTION

Two readings of R21 (T33-67), both on my best reading; I carry on with them unless you answer otherwise.

(1) **Which evaluator.** R21 says the recipe "is evaluated by `calculations.evaluate`". But `calculations.evaluate` (its R7, as built) binds only inputs held in *this* group's record (a declared table by sha in `calc_tables`, `MNY-` facts, content figures, a `CALC-`) under a stamped viewer. A case file's inputs are carried bytes, not held here, and declaring them as tables would write record rows, which R21 itself forbids. My reading: recreate with the evaluator `calculations.evaluate` runs, `calc-grammar`'s own `checkRecipe`, `evaluate`, `resultKey` and `METHOD`, over the carried input files bound by name. That writes nothing and keeps the same arithmetic. So case-import's final `uses` gain **calc-grammar** (layer 1) and not `calculations`; `modules.json` lists neither today. The other way would be a CHANGE to `calculations` (an `evaluate` over inline inputs), which is another module's job.

(2) **The carried inputs' bytes.** `case-grammar` R13/R18 say each input "travel[s] as the file its input hash names", "the canonical bytes calc-grammar evaluates". My reading: the rows come from the signed case document's `calculations:` block (`case-grammar.calculationsOf`). Each input is found as any file of the case file (or a document supplied later, R5) whose SHA-256 is the hash the row names. Its bytes are the canonical JSON (record-grammar's) of the value calc-grammar binds: a table `{fields, rows}` or a figure. `inputs` may be a list of `{name, sha256}` or a `{name: sha}` map. "Every result agrees" means: `result_key` recomputes equal (`calc-grammar.resultKey(recipe, {name: sha}, {methodVersion})`), and the recomputed `output` and each named step equal what `results` states. A calc's input that is absent is also a material an edition records as missing, so R5 accepts bytes matching it. I record case-checker's own per-calculation answer (its R20) beside mine, with whether the two agree. `case-grammar` (T33-60) and `case-checker` (T33-66) are not merged, so `calculationsOf` is an injected dep coded to R18 until they merge, per K1563 (1).

## J2 · REPORT

T33-67 is built on K1633's readings and pushed (R21, with R3 and R4's calculation parts; 83/83; coverage 21/21; ownership and format 0 failures; architecture 1 failure until you add calc-grammar to uses). Per K1563 (1), I still have to re-point the tests at the real case-grammar (calculationsOf, the calculation kind's path) and case-checker (R20's calculations) after they merge, then COMPLETE. Please send a CHANGE or RESUME when T33-60 and T33-66 are on tranche/T33. Nothing found in another module.

## J3 · REPORT

B3 applied: tranche merged; case-import now reads the real case-grammar (calculationsOf; inputs at calculations/<calc>/inputs/<sha256>); the stand-in reader is removed. 83/83; coverage 21/21; format and ownership 0 failures; architecture 2 failures, both the calc-grammar edge (src and test) you set at the merge (K1633). Still waiting for case-checker (T33-66) to merge, then I'll add the real-checker case and post COMPLETE.

## J4 · REPORT

B4 applied: tranche merged; a workbook row (recompute: not_recomputed) is recorded not_recreated with the source's status held as its statement (tested). 83/83; checks as before (architecture: only the calc-grammar edge, K1633). Still waiting on case-checker (T33-66) for the real-checker case, then COMPLETE.
