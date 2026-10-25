# money-checks (T51)

**Status** · session_013XfJkU8YrnVAJey2y1U6if · depth 2 · WORKING · handled B1

## J1 · REPORT

Strings in `bio-plane/src/money-checks/index.mjs` I judged no member reads, left unkeyed (BOB's note 1: for BOB to settle with the design stream, K3944):

- `index.mjs:676` `return { none: r.result ? r.result.relation : "undetermined" }`. `r.result.relation` is calc-grammar's comparison value (an identifier, not a sentence). `"undetermined"` is the fallback when no comparison result exists. Both are the reason key of `stats.skipped`, a count per reason that `runDetectors` returns to its caller (the scheduler); no op or screen relays them. If BOB wants them readable, `"undetermined"` becomes `localize("money-checks.why.undetermined", "undetermined")` at that line.

Converted in this job: `index.mjs:680` `"no denominator"` (a sentence, same skip-count path) is now `localize("money-checks.why.no_denominator", "no denominator")`. The finding `run.test.mjs:167` keys the threshold reason through `word("money-checks.why.threshold_stated")`.

## J2 · COMPLETE

T51-199 (money-checks, the words check after the conversion) is applied: the one finding and the one unkeyed sentence it sits beside.

**Entries applied**
- `bio-plane/test/m/money-checks/run.test.mjs:167`: the test copied the sentence "no threshold stated" as a key of `r.skipped`. It now asserts `r.skipped[word("money-checks.why.threshold_stated")]`, the key the source returns (`index.mjs:666`). The test imports `word` from `setup-words`, as its sibling tests do. No sentence in the test file is copied.
- `bio-plane/src/money-checks/index.mjs:680`: the skip reason `"no denominator"`, a sentence on the same count path, is now `localize("money-checks.why.no_denominator", "no denominator")`. No test asserts its text (R7 checks only that a skip exists).
- Note 2 (red tests named by my entry): none; my entry names none.

**Deferred:** nothing.

**Found in another module:** nothing. The words check in the repository run shows 3,800 failures, all in other modules (`wizard-scripts` and others); none names money-checks. Those are not mine to change.

**Tests and checks** (run from this branch after the merge of `tranche/T51`)
- `node --test bio-plane/test/m/money-checks/`: `tests 48, pass 48, fail 0`.
- `node checks/format.mjs /home/user/bio`: `175 modules, 174 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio money-checks`: `12 product files, 40 relative imports; 0 failures`.
- `node checks/coverage.mjs /home/user/bio money-checks`: `17 of 17 live requirement ids named by a test; 0 failures`.
- `node checks/run.mjs /home/user/bio` (run twice; full output in my scratchpad): exit 1 from the repo-wide words and coverage failures in other modules. `grep money-checks` on the output: 0 lines.
- `node bio-plane/src/setup-words/build.mjs --check`: one stale-rows note, naming `money-checks.why.no_denominator` (the new key; expected until the layer close regenerates `rows.mjs`). No refusal names money-checks.
- `node checks/ownership.mjs /home/user/bio money-checks tranche/T51 job/T51/money-checks`: `3 files changed by money-checks; 0 failures`.

**Size (session_012QuJX65WtkVnXz5QCbL2e4): test runs 3, module lines 1026** (the three test runs: the module suite once, and `checks/run.mjs` twice; `1026` is `bio-plane/src/money-checks/*.mjs`).

**Commits on `job/T51/money-checks`:** `425352f925` (the two fixes), `a734dd6a8d` (merge of `origin/tranche/T51`), then this record.

## J3 · COMPLETE

**Fix round 10, Wave A batch 5 (START B2): publish 1 fixture. Done.**

**Entries applied**
- Fixtures published in `bio-plane/test/m/money-checks/fixtures.mjs` (new file), each made by the module's real code when called:
  - `runDetectorsAnswers({budgetMs})`: the real `runDetectors` over an empty world (`world()`), no detector switched on. Users now: scheduler 1 (re-pointed in scheduler's own job).
  - `noticed()`: the real `noticed({project, viewer})` for a project the viewer takes part in, over an empty record. Added per K5077 (queue `noticed.test.mjs:290` uses it; re-pointed in queue's own job).
- Tests in `bio-plane/test/m/money-checks/fixtures.test.mjs` (3 tests) call each fixture and check the real answer: R6 (both `runDetectorsAnswers` tests), R9 and R17 (`noticed`).
- No `fixtures-own` or `fixtures-generic` marker added (no line of mine needed one).

**Lines left in money-checks:** none. The fixtures check (`node /home/user/civicos-process/checks/fixtures.mjs /home/user/bio money-checks --list`) reports 0 failures.

**Deferred:** nothing. **Found in another module:** nothing new. The repo-wide `checks/run.mjs` output has no line naming money-checks.

**Tests and checks**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/money-checks/fixtures.test.mjs`: tests 3, pass 3, fail 0.
- `node ... bio-plane/test/m/money-checks/*.test.mjs`: tests 51, pass 51, fail 0.
- `node /home/user/civicos-process/checks/format.mjs /home/user/bio`: 178 modules, 178 requirements files; 0 failures.
- `node /home/user/civicos-process/checks/architecture.mjs /home/user/bio money-checks`: 12 product files, 40 relative imports; 0 failures.
- `node /home/user/civicos-process/checks/coverage.mjs /home/user/bio money-checks`: 17 of 17 live requirement ids named by a test; 0 failures.
- `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio money-checks tranche/T51 job/T51/money-checks`: 3 files changed by money-checks; 0 failures.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: money-checks 1/9; affected modules 1 of 178; affected test files 1 of 2790 (my own). No user's test is named, so none was run.
- `node bio-plane/src/setup-words/build.mjs --check`: one stale-rows note, in `calculations` (`rows.mjs` is setup-words' generated artifact, not mine); no refusal names money-checks.
- `node /home/user/civicos-process/checks/run.mjs /home/user/bio`: exit 1 from repo-wide fixtures failures in other modules (2,572 failures across the product; the stubs in test-support and the users' lines). The words check: 0 failures. `grep -i money-checks` on the output: 0 lines.

**Commits on `job/T51/money-checks`:** `b754397694` (the fixtures and test), `2552f8d4ff` (merge of `origin/tranche/T51`, which had moved to `52dbcf51d2`), then this record. Pushed.

**Size (session_013XfJkU8YrnVAJey2y1U6if): test runs 2, module lines 1026**
(two test runs: the module suite once, the fixtures test file once; `1026` is `bio-plane/src/money-checks/*.mjs`, unchanged in this job.)
