# answer-envelope (T50)

**Status** · session_01JzujgzuDHRDzLuCvJTsAv4 · depth 2 · COMPLETE · handled B3

## J1 · BLOCKED

Cause: needs Bob. T50-25 cannot be built yet, and I am not changing anything I cannot check.

1. Ordering. My entry adds `["src/translations/checks.mjs", TRANSLATIONS]` before `src/setup.mjs` in `families.mjs`. That file does not exist: `tranche/T50` (e61d85a0de) and `job/T50/translations` hold no `bio-plane/src/translations/` at all. T50-22 has not merged, so the import would break the family list. I have not added it.

2. Baseline on my branch (`node --test test/m/answer-envelope/*.test.mjs`: 40 tests, 37 pass, 3 fail). `catalogue-end` R7/R2/R10/R13: about 40 pins drifted. The C-29.x rows of ai-accounts moved with its T50-4 merge, and C-124.17 ADDRESSEE_REFUSED in action-plans changed; `tranche/T50` is 32 files ahead of my START. `catalogue-end` R13 (C-124.30) and an R15/R7/R2 case-inputs order test also fail. Only the first is in my entry's reach; the rest are the rule 5 (6) reds I clear. None is diagnosed yet.

3. Rule 6, second item: no "labelled" in my module's member-facing words (grep of `src/answer-envelope` and its tests). Nothing to change.

4. Rule 6, third item: `test/m/answer-envelope/families.test.mjs` hand-lists other modules' families (the `moved` list near line 94, which names `setup.mjs` INSTANCE_SETUP_CHECKS, and the R2 `files` list near line 109). They should read each owner's declared `_CHECKS` exports instead. Not rewritten yet: its set is the family list that step 1 changes.

5. Pins by key (N1128). The pins are digests of inline English. For rows that already read a `refusal.<CODE>` key from `words.json`, the pin should be that key's sentence, so later re-wording does not turn the catalogue red. Drifted rows still inline in other modules stay red until those modules' own jobs key them. My reading: pin by key where a key exists, digest only for inline rows. Please confirm.

Decision for you: merge `translations` (T50-22) into `tranche/T50`. Then I add its file, do items 4 and 5, and run the tests and checks. If you want items 4 and 5 done now against today's tranche, say so; I will re-run once translations lands.

Waiting on BOB (J1). Nothing for Bob to do until T50-22 merges.

## J2 · REPORT

Items 3–5 of B2 are done and pushed (`job/T50/answer-envelope` @ 128756b02a). The module's tests run 41, pass 41. The checks format, architecture, coverage and ownership pass.

Item 5, pins by key (N1128). The 75 drifted pins were all rows that now read `refusal.<CODE>` from words.json. 73 of them match their key exactly. Two are still inline in action-plans: ADDRESSEE_REFUSED (C-124.17) and MACHINE_CANNOT_JUDGE (C-124.36). I re-pinned all 75 to the owners' rows as they now declare them, and wrote that into `changed.note`. A new test pins each keyed row by its key's sentence.

Item 4, hand-lists (N1073). The moved-rows list in `families.test.mjs` is gone. The test now walks every family in `CHECK_FAMILY_FILES` from its owner's file. The R2 test in `families.test.mjs` still names families by hand. I am not changing that until the translations file is in the list.

Item 3, drift diagnosis. The drift came from ai-accounts' T50-4 (the C-29.x rows), and from action-plans (C-124.17 and C-124.36 inline). The rest was the same kind of move.

Still open: T50-22 (translations) has not merged to `tranche/T50`, so `src/translations/checks.mjs` does not exist. I will add it to `families.mjs` before `src/setup.mjs` when it merges, and then re-run the tests and checks.

Waiting on BOB (J2). Nothing for Bob to do until T50-22 merges.

## J3 · COMPLETE

T50-25 answer-envelope is complete on `job/T50/answer-envelope` @ e292cf63da. The module's tests pass 41 of 41.

Entries applied:
- T50-25 (N1128): the catalogue's pins are by key. The 75 drifted pins were re-pinned to the owners' rows as they now declare them: 73 read `refusal.<CODE>` from words.json, and two (ADDRESSEE_REFUSED, MACHINE_CANNOT_JUDGE, both action-plans) are still inline. A new test in `catalogue-end.test.mjs` pins each keyed row by its key's sentence.
- The composed catalogue lists `src/translations/checks.mjs` (`TRANSLATIONS`) before `src/setup.mjs` (N1084, K3674), as B3 directs. The file-count pins (90 files; 87 without the case-inputs, ai-accounts and translations files) are updated in `catalogue-end` and `t48`.
- Rule 6, third item (N1073): `families.test.mjs` reads every family from its owner's file in `CHECK_FAMILY_FILES`, in place of the hand list of the moved rows and of the R2 family names. The five R2 paths stay listed.
- Rule 6, second item: no "labelled" in the module's member-facing words, so nothing to change.

Deferred: nothing. Found in other modules: the two action-plans rows (C-124.17, C-124.36) are inline until action-plans keys them (its T50-47).

Checks and tests:
- Module tests: `node --test test/m/answer-envelope/*.test.mjs`, 41 tests, 41 pass.
- `checks/format.mjs bio`: 0 failures.
- `checks/architecture.mjs bio answer-envelope`: 0 failures.
- `checks/coverage.mjs bio answer-envelope`: 18 of 18 live ids named, 0 failures.
- `checks/ownership.mjs bio answer-envelope tranche/T50`: 0 failures.
- `checks/run.mjs bio answer-envelope`: architecture 0 failures, format 0 failures, channels 0 failures. Coverage reports 20 failing modules, none of them answer-envelope (affordances, agent-harness, agent-runner, control-plane, installer, instance-setup, interface-shell, journey-check, op-declarations, op-grades, queue, and the screens jobs). These are the other modules' own ids, not mine to change; I'm noting them for BOB.

Size (session_01JzujgzuDHRDzLuCvJTsAv4): test runs 6, module lines 912.
