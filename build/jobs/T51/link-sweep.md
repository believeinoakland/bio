# link-sweep (T51)

**Status** · session_01HmAPWZPEejc5eMANEyUgYq · depth 2 · COMPLETE · handled B1

## Completion (T51-242, words)

**Entries applied.** T51-242: the three inline findings and the twelve plain findings of `build/plan/words-pass/link-sweep.md`, each read through `localize('link-sweep.<file stem>.<slug>', en, vars)`; the sentences the rule binds that the check does not count (under five words, punctuated, or held in a refusal's construct or detail) converted too (setup-words R13).

Changes, by file (commit `1af3138760`):
- `checks.mjs`: the grammar's messages (`is missing`, the id, `must be boolean`, `must be an object`, the budget's sentence) through `localize`.
- `sweep-match.mjs`: every refusal's construct and detail through `localize`, since `SWEEP_TERM_REFUSED` shows both to members.
- `sweep.mjs`: the three inline and plain findings; the standing's reasons now carry a code (`not_ratified`, `definition`, `paused`, `daemon_off`, `closed`, `held`) that `plan()` compares, and the sentence is rendered for members beside it (K3971: no code compares a sentence); the run's note, its observation details, the scope check's details and the promotion refusal's default through `localize`.
- `sweep-grammar.test.mjs`, `sweep-run.test.mjs`: the sentences they had copied are read through `localize` and compared by equality.

Choices, for BOB's record: a sentence whose text is a code fragment (`out_of_scope_redirect to {target}`, `format_excluded; {format}`) keeps its wording byte for byte, so the observation log reads as before. No `localize` id is shared between two sentences.

**Deferred.** None.

**Found in another module.** None in this job. The repo-wide runs below show other modules' open findings; none names `link-sweep`.

**Tests and checks** (run after the last change):
- `node --test test/m/link-sweep/*.test.mjs` (bio-plane): tests 29, pass 29, fail 0.
- `node checks/words.mjs /home/user/bio link-sweep`: inline 0, plain 0, testcopy 0, missingkey 0, unkeyed 0; 0 failures (was 15).
- `node checks/words.mjs /home/user/bio monitoring following link-sweep scheduler`: 60 failures, none naming `link-sweep` (other modules' lines).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio link-sweep`: 0 failures.
- `node checks/coverage.mjs /home/user/bio link-sweep`: 12 of 12 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio link-sweep tranche/T51 job/T51/link-sweep`: 6 files changed by link-sweep; 0 failures.
- `node checks/run.mjs /home/user/bio` (saved output, grep for `link-sweep`: none): format 0 failures, architecture 0, channels 0; coverage 24 failures and words 1161 failures, all in other modules; exit 1 from those.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for `link-sweep.checks.is_missing` (expected: `rows.mjs` is regenerated at the layer close; not edited here). No refusal.

**Size (session_01HmAPWZPEejc5eMANEyUgYq):** test runs 1, module lines 1106.

## J1 · COMPLETE

T51-242 (words) done on job/T51/link-sweep at 1af3138760 (code, tests) and the record's completion section. Words check for link-sweep: 0 failures (was 15). Module tests 29/29 pass. Format, architecture, coverage, ownership: 0 failures. setup-words --check: the expected stale-rows note for link-sweep.checks.is_missing only. Other modules' repo-wide findings (run.mjs words 1161, coverage 24; cross-module words 60) name no link-sweep line. Deferred: none. Waiting on BOB (J1).
