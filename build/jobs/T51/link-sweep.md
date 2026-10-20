# link-sweep (T51)

**Status** · session_011Wj2qq9nxhTBq6sjHBwEG7 · depth 2 · COMPLETE · handled B5

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

## J2 · REPORT

Entries 1-4 (R13 sweepSet, R14 sweepRatify, R15 DECLARED_OPS for sweeps, sweepset, sweepratify) are built and pushed on job/T51/link-sweep, with tests (sweep-write.test.mjs, declared-ops.test.mjs; seam.test.mjs updated for the new row and ops). Three things are BOB's:

1. monitoring R77's `sweepHost().write` is not on tranche/T51 nor on job/T51/monitoring yet (checked just now). My arms call `host.write({bundle, mutate, author, viewer, log})` as R77 states it (mutate edits the parsed object in place and returns it; log is the Session Log sentence). I ran my 39 tests against a throwaway stand-in of `write` kept outside the repo (all pass); they must be re-run against monitoring's real one. I will merge tranche/T51 after monitoring merges. Please tell me when it has, or say if the `write` shape differs.
2. modules.json: `link-sweep` does not use `test-support`, so `node checks/architecture.mjs` fails on declared-ops.test.mjs ("imports bio-plane/test/declared-ops.mjs of test-support, which link-sweep does not declare in uses"). B2 says no edge to add; money and others have it. Please add `test-support` to link-sweep's uses.
3. plane (not mine): `bio-plane/src/plane/store.mjs:863` calls `linkSweepOps(linkSweepOf(ctx), url)` without the body; `sweepset` and `sweepratify` read the POST body, so that line needs `, body` as every neighbour has. Until plane does so the two ops get an empty body.
Also for the record: the new row MACHINE_CANNOT_SET_SWEEP took C-18.24 (monitoring's two new rows should take C-18.22 and C-18.23; renumber if they differ). Its translation is read by localize('link-sweep.checks.machine_cannot_set_sweep') since refusal.* rows do not exist in rows.mjs yet.

## J3 · COMPLETE

FR-37 (B2) complete on job/T51/link-sweep.

Entries applied: 1 (R13 `sweepSet`, `op=sweepset`), 2 (R14 `sweepRatify`, `op=sweepratify`), 3 (R15 `DECLARED_OPS` extended with `sweepset`, `sweepratify`; the ratify screen's words by key), 4 (the `sweeps` declaration, already present, kept as is). Requirement lines R13–R15 are BOB's own (written K4189, still marked *(not yet met: T51)*; every id is now named by a test, so BOB may lift the mark). No new R line of mine was needed: R15 states all three declared ops.

Against monitoring's real writer: after merging tranche/T51 (monitoring R77 is on it), `sweepHost().write({bundle, mutate, author, viewer, log})` has the shape J2 assumed; my 39 tests, which ran earlier against a stand-in, pass against it unchanged. Row `MACHINE_CANNOT_SET_SWEEP` stands at C-18.24 (B5).

Deferred: none. Found in another module: the plane's `store.mjs:863` missing `body` (already sent to the plane by BOB, B5); otherwise none. Hand rows in `op-declarations`/`op-grades` for `sweepset`, `sweepratify`, `sweeps` can go now that this module declares them.

Tests and checks (run after the last change, process repo pulled):
- `node --test test/m/link-sweep/*.test.mjs` (bio-plane): tests 39, pass 39, fail 0.
- format: 175 modules, 0 failures. architecture link-sweep: 0 failures. coverage link-sweep: 15 of 15 live ids named; 0 failures. ownership: 7 files changed by link-sweep; 0 failures.
- words link-sweep: 0 failures; words monitoring following link-sweep scheduler: 0 failures (dev 3, unkeyed 52 are other modules').
- setup-words `build.mjs --check`: stale-rows note only (names ai-accounts, not this module); no refusal.
- `checks/run.mjs` full run not repeated this restart; the per-check runs above cover format, architecture, coverage, words and ownership for this module.

Size (session_01Th8FDaUxr9PkjaKXvKcKvP): test runs 2, module lines 1230
