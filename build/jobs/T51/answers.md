# answers (T51)

**Status** · session_01VDycP8MTrbpjvMkmzgTofN · depth 2 · WORKING · handled B3

## J1 · REPORT

Two of the five plain findings are not converted, and I list them for BOB to settle (K3957, K3944). Both are diagnostics that name a wire field of the model's answer, not a sentence a member reads:

- bio-plane/src/answers/check.mjs:59 "the summary names the sentences it rests on, as s<i>"
- bio-plane/src/answers/sentences.mjs:92 "a sentence's support names holdings, rule items or looks as h<i>, r<i>, l<i>"

Why: each is the `detail` of an ANSWER_MALFORMED refusal, raised when the model's output does not take the contract's shape. The member sees only that row's translation ("the assistant's answer was not in the form every answer must take ... nothing is shown"); the detail names a wire token (`s<i>`, `h<i>`, `r<i>`, `l<i>`) that exists for the model and the developer, never for the member. Converting them would give a wire grammar a translation.

Note for BOB: R29 says "every refusal's detail" is member-facing. These two are exceptions to that reading, and R29 may need the word "detail" narrowed to the refusals a member sees, or these two listed as `unkeyed`. I have not changed R29.

## J2 · COMPLETE

T51-212 (words, answers) is applied. Commit 7ea65d9ec0 on job/T51/answers, pushed.

**Entries applied (the 3 findings and the 5 plain findings of build/plan/words-pass/answers.md):**
- scope.test.mjs:23, the hand-list of 27 ops: now assembled from ASK_SCOPE's own declaration (the entries whose ruling is K1450, K1470 or C:B-3); `rule` asserted present; `ASK_SCOPE.length` 27 kept; the K1609 and non-routed negative controls unchanged.
- words.test.mjs:27 and :30, the two testcopies: now compare with `word("refusal.RULE_SERVICE_UNKNOWN")` and `word("refusal.RULE_SERVICES_OFF")`, the rows the translations are read from.
- index.mjs:235, plain: `localize("answers.index.the_rule_services_are_switched", ...)`, the refusal's detail (member-facing under R29).
- rules.mjs:61 and :84, plain: `localize("answers.rules.no_jurisdiction_profile_is_active", ...)` at both call sites (same id, same English; the reason is member-facing under R29).
- words.test.mjs:36 and :43: flagged once the two sentences became localize calls (testcopy [code]); compared with `localize` by equality, the same id and English, as record-core's tests do (the checker exempts a test's localize literals).
- English is unchanged in every conversion; ids follow the first-five-words slug rule.

**Not converted, reported to BOB (J1, REPORT):** check.mjs:59 and sentences.mjs:92. Both are the `detail` of ANSWER_MALFORMED and name a wire token (`s<i>`, `h<i>`); the member sees only the row's translation. BOB to settle (K3944). R29 reads every refusal's detail as member-facing; I have not changed R29.

**Deferred:** none.

**Found in another module:** none in this job. The words check's findings in other modules are theirs; I did not read them.

**For BOB at the layer close:** `rows.mjs` is stale for the two new localize ids (`answers.index.the_rule_services_are_switched`, `answers.rules.no_jurisdiction_profile_is_active`); regenerating it and the words-unreviewed list is yours.

**Tests and checks (summary lines):**
- `node --test bio-plane/test/m/answers/`: tests 64, pass 64, fail 0 (before the edits and after each of the two rounds of fixes).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage for answers 35 of 35 live ids named, 0 failures (the run's 28 coverage failures are other modules'); words for answers: the two findings in J1 only, the rest of the run's words findings are other modules'.
- `node checks/coverage.mjs /home/user/bio answers`: 35 of 35, 0 failures.
- `node checks/architecture.mjs /home/user/bio answers`: 21 files, 0 failures.
- `node checks/format.mjs /home/user/bio`: 176 modules, 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only, naming the two new ids (expected); no refusal naming answers.
- `node checks/ownership.mjs /home/user/bio answers tranche/T51 job/T51/answers`: 5 files changed by answers, 0 failures (the four source and test files, and this record).

Size (session_01S1McqV7qoGLx6V9Y9QpaCn): test runs 3, module lines 1906
