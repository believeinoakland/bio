# case-check (T51)

**Status** · session_016ctg5nhcTUAhdWo4A3CTkV · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

Completion of T51-265 (words, plain findings K3957), commit 2c99dce35d on job/T51/case-check (merged tranche/T51 first; no file of this module changed by the merge).

**Entries applied.** T51-265: both plain findings in `bio-plane/src/case-check/index.mjs` are judged as sentences a member reads (refusal `detail`, shown to the member) and converted through `localize`:
- line 123 → `case-check.index.the_pre_flight_gave_no_answer`
- line 146 → `case-check.index.the_preparation_was_not_found_where_publication_stores_it`
No test copies either sentence (grep of the test tree: none), so no test change was needed. No REPORT is owed: nothing unjudged, nothing left to the design's `unkeyed` list.

**Deferred.** None.

**Found in another module.** None. (`case-authoring` index.mjs:1653 holds a similar sentence; it is listed in that module's own words-pass file, so it belongs to that job.)

**Tests and checks.**
- `node --test test/m/case-check/*.test.mjs` (bio-plane): 34 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio case-check`: 0 failures.
- `checks/coverage.mjs /home/user/bio case-check`: 5 of 5 live ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio case-check tranche/T51 job/T51/case-check`: 0 failures.
- `checks/run.mjs /home/user/bio`: exits 1 on other modules' findings (words 2263 failures across modules; coverage 25 failures, e.g. case-checker R27). None names case-check. Not this job's to fix.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for the new word `case-check.index.the_pre_flight_gave_no_answer` is expected (rows regenerate at the layer close); no refusal names case-check.
- Layer tests: `build/manifest.md` names none for layer 8.

Size (session_01J2t3i3VhkxqkCZisrCcbZ6): test runs 1, module lines 423

## J2 · COMPLETE (fix round 10, Wave A batch 5; B2)

**Causes done.**
- Published `caseCheckOfNoSuchCase` in `bio-plane/test/m/case-check/fixtures.mjs` (new): the real `caseCheckOf({case, viewer})` refusal NO_SUCH_CASE for a viewer without standing (`out`, in no project) over a held case, beside the answer for an absent case; its test `fixtures.test.mjs` (names R2) calls it and checks the real refusal, byte-equality with the absent case, a participant's control read, and that nothing is written. Conformance's `t45.test.mjs:402` is re-pointed by the follow-up after merge.
- hold.test.mjs:8 and :47 (case-authoring/preflightAnswer, FIX-E): the hand-built pre-flight answers are replaced by `preflightAnswer()` from `bio-plane/test/m/case-authoring/fixtures.mjs` (`blocked`, `machine`, `notOwner`). Line 120 (also a hand-built `first: null` answer) was re-pointed the same way. The test assertions now compare against the provider's real `first` and `blockers`.

**Lines done and left.** Both own lines done; `checks/fixtures.mjs . case-check --list`: 0 failures. Left: none. No `fixtures-own` or `fixtures-generic` markers added.

**Found in another module.** None.

**Checks.** case-check tests 35 pass, 0 fail; format 0, architecture 0, coverage 5 of 5 ids named, ownership 0 failures (1 file set by this module); `impact.mjs origin/tranche/T51 HEAD`: 0 affected modules, so no other users' tests to run; `checks/run.mjs` names no finding in case-check.

Size (session_016ctg5nhcTUAhdWo4A3CTkV): test runs 3, module lines 423
