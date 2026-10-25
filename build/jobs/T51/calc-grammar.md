# calc-grammar (T51)

**Status** · session_01FexeYxPJJZWcYdHzcUMoYo · depth 2 · COMPLETE · handled B3

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

## J3 · QUESTION

R23 reading (measured on the tip: draw over 1M keys is one 12 s synchronous stretch; interval at frame_size 10,000 takes 57 s, 5,000 takes 7.9 s, growth ~n^3). My reading, which I build unless you say otherwise: (1) draw stays synchronous and unchanged in answer (R16 callers/tests); I add draw's yielding twin 'drawSliced(args, {yieldNow})' exported from the index, async, same {sample, frame_hash, seed, method} byte for byte, every stretch between yields bounded to a fixed slice of keys (hash, top-n heap, chunked merge for frame_hash). (2) interval stays synchronous with the same low/high; its tail sums become an exact BigInt recurrence on the hypergeometric terms (O(n) per tail, log N tails) instead of recomputing binomials per term. (3) New public name drawSliced is the only surface change; no other module calls draw or interval today, so nothing else is touched. Tell me if R23 meant draw itself becomes async.

## Job 110 (CALC-GRAMMAR #4): R23, G183 (S-31's draw and interval)

- Reproduced on the tip first (measured through the index): `draw` over 1,000,000 keys was one synchronous stretch of 12.2 s; `interval` took 0.7 s at frame_size 2,000, 7.9 s at 5,000 and 57 s at 10,000 (growth about n^3), so 100,000 was out of reach.
- Applied: `draw.mjs` computes the draw as one generator that yields at each slice of `DRAW_SLICE` (4,000) keys: the duplicate check, the hashing into a bounded heap of the n lowest ranks, the extraction, and the frame hash (sorted chunks merged, the canonical JSON streamed through `createSha256`). `draw` runs it through; the new `drawSliced(args, {yieldNow})` awaits `yieldNow` between slices; both answer alike, byte for byte. `interval`'s tail sums follow the exact term ratio in whole numbers (one binomial product, then small multiplications) in place of two binomials per term; the same low and high (R17's test over every small frame passes unchanged). Measured now: 100,000 frame, n 400: 27 ms; n 2,000: 141 ms; n 50,000: 11.5 s (worst shape).
- New public names: `drawSliced`, `DRAW_SLICE` (index). Nothing else calls `draw` or `interval`. QUESTION J3 asked whether R23 meant `draw` itself async; no answer had come, so built on the stated reading (draw stays sync).
- Tests (`key-draw.test.mjs`): R23 1,000,000-key draw equals an independent node:crypto ranking and canonical frame hash, yields at least 250 times, longest stretch under 500 ms; R23 interval over 100,000 checks low and high against a direct binomial-sum rule at the bound and one beyond.
- Deferred: none. Found in other modules: none.
- Ran: `node --test bio-plane/test/m/calc-grammar/` 37 of 37 pass; format 0 failures; architecture 0; coverage 23 of 23 ids, 0; words 0; ownership 0.

**Size (session_01FexeYxPJJZWcYdHzcUMoYo): test runs 4, module lines 1441.**

## J4 · COMPLETE

R23 applied on job/T51/calc-grammar: draw yields on 4,000-key slices through new drawSliced (draw stays sync, same answer); interval by exact term ratio (100,000 frame in 27 ms to 11.5 s worst shape; was 57 s at 10,000). Suite 37/37; format, architecture, coverage, words, ownership 0 failures. Details and Size line in the record. Built on my J3 reading (draw stays sync).
