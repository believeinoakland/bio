# ai-use (T51)

**Status** · session_01VeDBEyQuMEPBYRrcEb8xgS · depth 2 · WORKING · handled B2

## J1 · COMPLETE

T51-57 · ai-use: complete. Branch `job/T51/ai-use` pushed at `568d9a8b3e`.

**Entries applied**
- T51-57 (DEC-333, U350): `checks.mjs`:47 `ai.when.month` is now `on {month} 1`, equal to words.json's `en` verbatim. The module's `date.month.*` copies are unchanged.
- Tests that copied the old order now read the key or assert the new order: `reads.test.mjs` (the month's `{when}` expectation, "on November 1"); `t44.test.mjs` (the R13 key-equality test, the `{when}` test's title and its shape assertion, now `endsWith(" 1")`). The old-order negative control (`"on 1 {month}"` must fail) is kept.
- The six red R13 tests (T43 ×2, T44 ×2, K2514, R13 each refusal sentence) are green.

**Deferred:** none.

**Found in other modules (not changed here):** the whole-repo coverage check reports 24 failures, each a live requirement id named by no test, in agent-harness, agent-runner, agent-steps (49 ids), agent-worker, basis-versions, case-grammar, control-plane, instance-setup, interface-assets, interface-shell, journey-check, queue-producers, queue, screens-action, screens-daily, screens-entry, screens-inquiry, screens-intake, screens-investigate, screens-publish, screens-settings, screens-wizards, translations and affordances (R67). None is ai-use's.

**Tests and checks**
- `node --test bio-plane/test/m/ai-use/*.test.mjs`: 83 pass, 0 fail, 0 skipped.
- `checks/format.mjs`: 174 modules, 0 failures.
- `checks/architecture.mjs ai-use`: 0 failures. `checks/run.mjs`: architecture 0 failures across the repo.
- `checks/coverage.mjs ai-use`: 15 of 15 live ids named by a test, 0 failures.
- `checks/ownership.mjs ai-use tranche/T51 job/T51/ai-use`: 0 failures (4 files: the three module files and this record).

**Notes:** no pull request opened, as JOB.md directs. The commit carries the session trailer without a model name, per the system rule on model identifiers.

Size (session_01JUn6Nym4wmGYzEebaoLgqG): test runs 3, module lines 1289

## J2 · COMPLETE

T51-211 · ai-use (the words check after the conversion, K3949, K3962): complete. Branch `job/T51/ai-use` pushed at `ce848adb9b` (the words fixes at `53e57765e0`, then `tranche/T51` merged in, never rebased).

**Entries applied**
- T51-211 (W): all 31 findings in `build/plan/words-pass/ai-use.md` fixed, and the 1 test copy of a code sentence (K3962).
  - `checks.mjs`: every sentence in `AI_USE_WORDS` now reads through `word(key)`, its `en` unchanged. A placeholder row passes its own `{name}`s through (for example `word('ai.refused.limit', { whose: '{whose}', ... })`), since `word()` refuses a missing placeholder and the caller's `fillWords` does the real fill. `date.month.*` stays literal, as the T51-57 ruling says. Reason: a `word()` call with an unfilled placeholder throws WORD_VAR_MISSING, so this pass-through is the only way a raw template can come from the table.
  - `index.mjs`: the seven refusal details ("a limit's owner is 'group', 'project:<id>' or 'member:<id>'." and its six siblings) read through `localize('ai-use.index.<slug>', en)`, `en` unchanged, the ids: `the_use_names_no_paying`, `a_limit_s_owner_is`, `use_is_read_for`, `exploring_is_approved_for`, `an_estimate_is_for`, `limits_are_read_for`, `use_over_time_is_read_for`.
  - Tests: `limits.test.mjs`, `reads.test.mjs` compare the refusal with `word(...)` filled from the table; `t43.test.mjs` and `t44.test.mjs` compare the key with `words.json` (`WORDS`), no sentence held; `explore.test.mjs` drops an assertion message that copied another module's `localize` sentence.
- T51-57 (DEC-333) still holds: `ai.when.month` reads "on {month} 1".

**Deferred:** none.

**Found in other modules (not changed here):** the whole-repo words run (`checks/run.mjs`) reports 3,336 failures across other modules; none is ai-use's. The `setup-words` `--check` reports `rows.mjs` stale, as expected: my seven new `ai-use.index.*` ids are not in it until the layer close. Thirty-one tests in the suites of modules that import `ai-use` (notice-producers, answer-envelope, run-rules, op-declarations and others) fail identically with and without this job's change, mostly on `date.daymonth`/`date.daymonthyear` readings and a few sentence checks; they are not from this job. Words-rule note for BOB: a template row cannot be read by `word()` without its placeholders filled, so every module holding a template in a table must pass its names through (as `checks.mjs` now does). If BOB prefers a raw-template read, that is a setup-words change, not a module one.

**Tests and checks**
- `node --test bio-plane/test/m/ai-use/*.test.mjs`: 83 pass, 0 fail, 0 skipped (after the merge too).
- Dependent suites (notice-producers, ai-runs, run-rules, question-explorer, answers, answer-envelope, op-declarations): 668 pass, 31 fail, the same 31 as on the base before this job.
- `checks/format.mjs /home/user/bio`: 176 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio ai-use`: 0 failures.
- `checks/coverage.mjs /home/user/bio ai-use`: 15 of 15 live ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio ai-use tranche/T51 job/T51/ai-use`: 0 failures.
- `checks/run.mjs /home/user/bio`: no finding names ai-use (words check included); the repo's other failures are in other modules, as above.
- `bio-plane/src/setup-words/build.mjs --check`: only the expected stale-rows note; no refusal naming ai-use.

Size (session_01PuyDahdpv1J5bkAgBw2hpw): test runs 5, module lines 1279
