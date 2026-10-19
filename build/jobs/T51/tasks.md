# tasks (T51)

**Status** · session_01NmzT4iSWU1VzAxyV5Wj8dm · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**T51-247 · tasks (words, K3949): done.**

Entries applied:
- The one finding in `build/plan/words-pass/tasks.md` (testcopy, `bio-plane/test/m/tasks/sign.test.mjs:99`, "is prepared and ready to sign") is fixed: the test imports `word` from `src/setup-words/index.mjs` and asserts `word("tasks.edition_prepared_ready", { ed: "2", case_id: CASE })`, the same row the module reads (`src/tasks/index.mjs:1085`). No sentence text remains in the test. No requirement, no module code, no tests removed or weakened.

Deferred: nothing.

Found in another module: nothing from my module's checks. The whole-product run (`checks/run.mjs`) shows reds outside tasks (architecture 1 failure, coverage 25, words 1096 in other modules, including testcopy in `wizard-scripts`). Not mine; left for their jobs and BOB.

Checks and tests:
- `node --test test/m/tasks/` (in bio-plane): 115 tests, 115 pass, 0 fail.
- `node checks/words.mjs /home/user/bio tasks`: 0 failures (was 1).
- `node checks/words.mjs` over all 35 L11 modules together: no finding names `tasks`.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio tasks`: 0 failures.
- `node checks/coverage.mjs /home/user/bio tasks`: 19 of 19 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio tasks tranche/T51 job/T51/tasks`: 1 file changed by tasks; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, channels 0; architecture 1 failure, coverage 25 failures, words 1096 failures, all outside `tasks`.
- `node bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match words.json and the source.

Size (session_01NmzT4iSWU1VzAxyV5Wj8dm): test runs 1, module lines 1614
