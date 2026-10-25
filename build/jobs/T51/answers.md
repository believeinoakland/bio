# answers (T51)

**Status** · session_01X6LaydCKjbEtyPkjE9aDG2 · depth 2 · WORKING · handled B4

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

## Fix round 10, Wave A batch 3 (B3, ANSWERS #13)

**Causes done:**
- Published `bio-plane/test/m/answers/fixtures.mjs` (new): `limitsUnreadable` (real `askAccount` with no `useCheck`: LIMITS_UNREADABLE) and `standingQuestions` (real `standingQuestionEnd` / `standingQuestionEndSet`: NO_SUCH_STANDING_QUESTION, STANDING_ENDED). Each is called by `fixtures.test.mjs`, which checks the real answer (2 tests).
- standing.test.mjs (8 lines, FIX-E): the hand-built `accountFor` answers are now ai-accounts' fixtures (`keptAwayGroup`, `accountsServing`, `noAccount`, `switchedOff`, `keptAwayUnreadable`) from `bio-plane/test/m/ai-accounts/fixtures.mjs`. The standing stand-ins are now helpers that call those fixtures when the step runs. A real account's `standing` use is off by default, so the "serves" answer is the fixture's `ask` answer (the code under test reads only `ok`); the sign-in arm's R32 case uses the same serving answer.
- words.test.mjs:40 (CODE): NO_PROFILES is in no product file; the test now takes the real refusal of `jurisdictions.combine(["nosuch"])` (UNKNOWN_PROFILE, `ok: false`). The brief's `combine([])` answers `{ok: true, view: {profiles: []}}`, which never reaches the "no profile is active" reason (answers' `view()` is null only on a refused combine), so a real refusal was used; BOB to note.

**Markers added:** no `fixtures-own` and no `fixtures-generic` marker.

**Lines left:** none. `checks/fixtures.mjs . answers --list`: 0 failures (stub 0, answer 0).

**Tests and checks:**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/answers/`: tests 69, pass 69, fail 0.
- `node checks/format.mjs .`: 178 modules, 0 failures. `architecture . answers`: 22 files, 0 failures. `coverage . answers`: 36 of 36, 0 failures. `ownership . answers tranche/T51 job/T51/answers`: 0 failures.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 178 (answers); its tests are the run above.
- `setup-words/build.mjs --check`: stale-rows note only, no refusal naming answers. The run's words findings are other modules'.

Size (session_01VDycP8MTrbpjvMkmzgTofN): test runs 9, module lines 1919

## J3 · COMPLETE

Fix round 10 batch 3 applied. Published limitsUnreadable and standingQuestions fixtures (answers/fixtures.mjs, tested by fixtures.test.mjs); 8 standing.test.mjs lines now use ai-accounts' fixtures; words.test.mjs:40 uses the real refusal of jurisdictions.combine(["nosuch"]) (combine([]) answers ok, never reaching the no-profile reason). No fixtures-own or fixtures-generic markers. checks/fixtures answers: 0 failures; module tests 69/69; format, architecture, coverage (36 of 36), ownership 0 failures. Record: build/jobs/T51/answers.md.

## Follow-up 38 (B4, ANSWERS #14, session_01X6LaydCKjbEtyPkjE9aDG2)

Order: the job branch was fast-forwarded to `origin/job/T51/answers` and `mail start` ran before the tranche merge; the merge of `origin/tranche/T51` followed (`deeae59476`, clean). `mail start` changed only the Status line.

**Causes done:**
- Published `standingAnswersHeldBack({ member = "bob", finds = "Budget held" } = {})` in `bio-plane/test/m/answers/fixtures.mjs` (new export, async). It takes the real acts: a standing question set by `member` (query `title:budget`, daily, ends 2026-12-31), a first run (finds nothing), a captured document holding `finds`, the copy's AI switch turned off by an administrator (`standingAiSwitch`), then the run that finds the document. It returns the real `standingAnswersFor({ member })` answer: `{ ok: true, cursor, entries: [...] }`, one entry per find, with `answer: null`, `withheld: []`, `finds: { ids: ["INFO-2026-…"] }`, `held_back: { condition: "switch_off", switch: "copy" }` and the standing label.
- `fixtures.test.mjs`: two tests call it and check the real answer (R19 R20: the entry's shape and hold; R20: the member parameter, with carol).

**For queue (`noticed.test.mjs:292`–`298`), a shape correction:** B4's shape gives `held_back: "ai_off"`. No product value is `"ai_off"` (grep of `bio-plane/src`): a held-back run answers an object. With the copy's switch off the object is `{ condition: "switch_off", switch: "copy" }`; the other held-back conditions are `kept_away`, `no_account`, `limit` and `answerer_failed`, each an object too. Queue's re-point should take the fixture's object, not the string. I have not changed queue's test.

**Markers:** none (`fixtures-own` and `fixtures-generic` added: no).
**Lines left:** none.
**Product code:** unchanged (test files only; no product defect seen in the real answer).

**Tests and checks:**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/answers/fixtures.test.mjs`: tests 4, pass 4, fail 0.
- Same runner over `bio-plane/test/m/answers/`: tests 71, pass 71, fail 0 (69 before, plus the two new).
- `node checks/fixtures.mjs /home/user/bio answers --list` (from the process repository): answer 0 failures for answers; the run's other failures are other modules'.
- `node checks/format.mjs /home/user/bio`: 178 modules, 0 failures.
- `node checks/architecture.mjs /home/user/bio answers`: 24 files, 0 failures.
- `node checks/coverage.mjs /home/user/bio answers`: 36 of 36, 0 failures.
- `node checks/run.mjs /home/user/bio`: words 0 failures; no finding names answers. Its other failures (fixtures, stubs) are other modules'.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for basis-version-grammar only; no refusal naming answers.
- `node checks/ownership.mjs /home/user/bio answers tranche/T51 job/T51/answers`: run after the commit below (result in COMPLETE).

Size (session_01X6LaydCKjbEtyPkjE9aDG2): test runs 2, module lines 1919
