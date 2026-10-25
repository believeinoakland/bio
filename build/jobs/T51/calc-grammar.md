# calc-grammar (T51)

**Status** · session_01FexeYxPJJZWcYdHzcUMoYo · depth 2 · WORKING · handled B2

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

## CHANGE B2 (K3960)

- Merged `tranche/T51` into the job branch (merge commit, `5d3f2bf361` on the tranche side).
- Reworded `calc-grammar.recipe.field_shape` without braces around anything but its placeholder: "each field states its name and its type, the type one of {types}". The id is kept.
- `node bio-plane/src/setup-words/build.mjs --check` names no calc-grammar item (it names `jurisdictions.index.amount_is_amount_and_units`, not this module).
- Plain findings (K3957): none for calc-grammar in `build/plan/words-pass/calc-grammar.md`; the two findings listed there are the ones fixed above.
- Re-run: `node --test test/m/calc-grammar/` 35 of 35 pass; words check 0 failures; format, architecture and coverage 0 failures.

**Size (session_01B2mwmPfGCqYRdkGsmH36wC), updated: test runs 4, module lines 1348.**

## J2 · COMPLETE

CHANGE B2 is done on job/T51/calc-grammar (commit 3d763245de). I merged tranche/T51. I reworded the field-shape sentence without braces around anything but its placeholder ('each field states its name and its type, the type one of {types}'); the id is kept. build.mjs --check names no calc-grammar item. The words-pass file has no plain findings for calc-grammar beyond the two already fixed. Results: calc-grammar suite 35 of 35 pass; words check 0 failures; format, architecture, coverage 0 failures; ownership 0 failures. Record: build/jobs/T51/calc-grammar.md (CHANGE B2 section).
