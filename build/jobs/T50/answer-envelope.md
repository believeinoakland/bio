# answer-envelope (T50)

**Status** · session_01JzujgzuDHRDzLuCvJTsAv4 · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · BLOCKED

Cause: needs Bob. T50-25 cannot be built yet, and I am not changing anything I cannot check.

1. Ordering. My entry adds `["src/translations/checks.mjs", TRANSLATIONS]` before `src/setup.mjs` in `families.mjs`. That file does not exist: `tranche/T50` (e61d85a0de) and `job/T50/translations` hold no `bio-plane/src/translations/` at all. T50-22 has not merged, so the import would break the family list. I have not added it.

2. Baseline on my branch (`node --test test/m/answer-envelope/*.test.mjs`: 40 tests, 37 pass, 3 fail). `catalogue-end` R7/R2/R10/R13: about 40 pins drifted. The C-29.x rows of ai-accounts moved with its T50-4 merge, and C-124.17 ADDRESSEE_REFUSED in action-plans changed; `tranche/T50` is 32 files ahead of my START. `catalogue-end` R13 (C-124.30) and an R15/R7/R2 case-inputs order test also fail. Only the first is in my entry's reach; the rest are the rule 5 (6) reds I clear. None is diagnosed yet.

3. Rule 6, second item: no "labelled" in my module's member-facing words (grep of `src/answer-envelope` and its tests). Nothing to change.

4. Rule 6, third item: `test/m/answer-envelope/families.test.mjs` hand-lists other modules' families (the `moved` list near line 94, which names `setup.mjs` INSTANCE_SETUP_CHECKS, and the R2 `files` list near line 109). They should read each owner's declared `_CHECKS` exports instead. Not rewritten yet: its set is the family list that step 1 changes.

5. Pins by key (N1128). The pins are digests of inline English. For rows that already read a `refusal.<CODE>` key from `words.json`, the pin should be that key's sentence, so later re-wording does not turn the catalogue red. Drifted rows still inline in other modules stay red until those modules' own jobs key them. My reading: pin by key where a key exists, digest only for inline rows. Please confirm.

Decision for you: merge `translations` (T50-22) into `tranche/T50`. Then I add its file, do items 4 and 5, and run the tests and checks. If you want items 4 and 5 done now against today's tranche, say so; I will re-run once translations lands.

Waiting on BOB (J1). Nothing for Bob to do until T50-22 merges.
