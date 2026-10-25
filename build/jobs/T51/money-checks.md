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
