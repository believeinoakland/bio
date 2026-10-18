# calc-grammar (T51)

**Status** · session_01B2mwmPfGCqYRdkGsmH36wC · depth 2 · COMPLETE · handled B1

## Completion (T51-165, words pass)

**Entries applied.** T51-165: the two findings of `build/plan/words-pass/calc-grammar.md`, each fixed by the words rule.
- `recipe.mjs:170` (stitched sentence, the table-field shape refusal) → `localize("calc-grammar.recipe.field_shape", "each field is {name, type}, type one of {types}", { types })`. The id is new and assigned once; its row arrives with the layer close's regeneration, and `localize` answers the English until then.
- `recipe.mjs:600` (copy of a words row, the composed-quantity sort refusal) → `word("calc-grammar.composed_quantity")`, the row already in the list (design origin).
- Test: `recipe.test.mjs` gains one test titled with both ids (R20). It asserts the refusal's `why` names every field type, and that a composed sort's `why` contains `word("calc-grammar.composed_quantity")`. No sentence text is held.

**Deferred.** None.

**Found in another module.** None. `checks/run.mjs` reports words failures in other modules (testcopy and inline counts across 173 modules); calc-grammar reads zero. Those belong to their own (W) jobs.

**Checks and tests (from the process repository, product `/home/user/bio`).**
- `node checks/words.mjs /home/user/bio calc-grammar`: `words: 1 modules, 2533 string literals read, 15344 words; inline 0, testcopy 0, missingkey 0, handlist 0 (0 tagged ?), marker 0, dev 0, unkeyed 23; 0 failures`.
- `node checks/format.mjs /home/user/bio`: `format: 174 modules, 173 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio calc-grammar`: `architecture: 17 product files, 31 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio calc-grammar`: `coverage: 1 modules, 22 of 22 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio calc-grammar tranche/T51 job/T51/calc-grammar`: see the line after the commit below.
- Module suite `node --test test/m/calc-grammar/` (run from `bio-plane/`): `tests 35, pass 35, fail 0`, run before and after the edit (the baseline reported the two findings, the words check).

**Size (session_01B2mwmPfGCqYRdkGsmH36wC): test runs 3, module lines 1348.**

## J1 · COMPLETE

T51-165 calc-grammar is complete on job/T51/calc-grammar (commit 4a489dc084). The two words-pass findings are fixed by the words rule: recipe.mjs:170 is localize(calc-grammar.recipe.field_shape, ...) with its types as a variable, and recipe.mjs:600 reads word(calc-grammar.composed_quantity). One test names both ids (R20). The module suite is 35 of 35 green (before and after the edit). words.mjs reads 0 for calc-grammar; format, architecture, coverage and ownership read 0 failures. Record: build/jobs/T51/calc-grammar.md (Completion section). Nothing deferred; no findings in other modules. Note: checks/run.mjs reports words failures in other modules, which are not this job's.
