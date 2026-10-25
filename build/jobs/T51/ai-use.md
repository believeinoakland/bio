# ai-use (T51)

**Status** · session_012pQPh7QQptB92PrassaGET · depth 2 · COMPLETE · handled B4

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

## J3 · COMPLETE

**Entries applied (START, Wave A batch 3)**
- Published `ceilingRefusal` in `bio-plane/test/m/ai-use/fixtures.mjs` (new file): the real `useCheck` over a spent daily `ask` ceiling, answered `AI_LIMIT_REACHED` (check C-143.1), the sentence filled, no cost. The START names `AI_USE_CEILING_REACHED` (C-22.30); that code is retired (run-rules C-109.8, retired for `AI_LIMIT_REACHED`, and C-22.30 is `MEMBER_RUN_MODE_NOT_ADMITTED`), so the published answer is the real code's. Users re-point to `AI_LIMIT_REACHED` in their own jobs. Decided here as the lower-level reading; flagged for BOB.
- Contract `use-check`: the real `useCheck` for a member's spent `transcribe` limit, compared with the literal (`ok`, `code`, `check`, `translation`, `detail`); `null` before the spend. Both in `bio-plane/test/m/ai-use/fixtures.test.mjs`.
- Markers I added: `// fixtures-run: reading-pipeline use-check` (fixtures.test.mjs:22), `// fixtures-run: extraction use-check` (fixtures.test.mjs:23). No `fixtures-own` or `fixtures-generic` markers.

**Lines left at done (each named)**
- `fixtures-run: reading-pipeline use-check`: its marker is on the tranche now (reading-pipeline `transcribe.test.mjs:175`); no longer orphan.
- `fixtures-run: extraction use-check`: waits for extraction's `// fixtures-contract: ai-use use-check`, which extraction's job places. Until then `checks/fixtures.mjs ai-use --list` shows one `orphan-run`.
- `ceilingRefusal` users (extraction, agent-worker) and the `use-check` user re-points are their jobs' findings; none is ai-use's.

**Deferred:** none.

**Found in other modules:** none. The change is tests only; no other module is affected (impact names none).

**Tests and checks** (from the repository root, `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/ai-use/*.test.mjs`): 87 pass, 0 fail, 0 skipped. `checks/format.mjs`: 178 modules, 0 failures. `checks/architecture.mjs ai-use`: 0 failures. `checks/coverage.mjs ai-use`: 16 of 16 live ids named, 0 failures. `checks/words.mjs ai-use`: 0 failures. `checks/ownership.mjs ai-use tranche/T51`: 0 failures (3 files). `checks/fixtures.mjs ai-use --list`: 1 failure, the `orphan-run` above, waiting on extraction. `build/plan/impact.mjs origin/tranche/T51 HEAD`: ai-use 1 of 11 test files affected (fixtures.test.mjs); no user module named.

**Git:** `tranche/T51` merged into the branch (c05fc01f09), never rebased; the fixture and contract commit is e4207b43e3; pushed to `job/T51/ai-use`.

Size (session_01VeDBEyQuMEPBYRrcEb8xgS): test runs 5, module lines 1288

## J4 · REPORT

Cause found outside my paths (K5192 R17; STORE-REQUEST #5), with file:line. The module now reads the clock it is handed (a `now`, else `env.BIO_NOW_MS`, else the wall clock), and `aiUseOps` takes the store's environment as its fourth argument. But no composition hands either in yet, so the running store still records instants on the wall clock until these lines change (none is in ai-use's paths):

- `bio-plane/src/plane/store.mjs:270` and `bio-plane/src/store-assembly/assemble.mjs:288`: `aiUseOf(ctx);` is the first construction (it fixes the instance, its migration and its ceiling carry). It should pass the store's clock and environment, as `credentialsOf` does at `assemble.mjs:203` (`{ ..., now: () => nowMs(null) }`): e.g. `aiUseOf(ctx, { env, now: () => nowMs(null) })`.
- `bio-plane/src/plane/store.mjs:932` and `bio-plane/src/store-assembly/assemble.mjs:841`: `...aiUseOps(aiUseOf(ctx), url, body),` should pass the environment in scope there (the next line already uses `env`): `...aiUseOps(aiUseOf(ctx), url, body, env),`.

Until these land, R17 is met at the module's interface (the tests in `bio-plane/test/m/ai-use/r17-clock.test.mjs`), not yet in the running store. Bob or the owner of those two files places it.

## J5 · COMPLETE

R17 (fix round 10, plan item 94; K5192, K5132, K5148). Met at the module's interface; the running store needs the composition change in REPORT (plane/store.mjs:270, :932; store-assembly/assemble.mjs:288, :841).

**What changed (file:line, bio-plane/src/ai-use/index.mjs)**
- Constructor (~l.83–88): `this.clock` from `deps.now`, `this.env` from `deps.env`, both read by `#nowMs`.
- New `#nowMs()` (~l.258–272): a handed `now` first; else `env.BIO_NOW_MS`; else the wall clock. The same order as credentials' `#nowMs`. No duration is measured in this module, so nothing stays on the wall clock.
- `#ms(at)` is now an instance method on `#nowMs()` (was static on `Date.now()`); its seven call sites (`#dayOf`, `countUsage`, `aiLimitSet`, `useCheck`, `aiUsageMine`, `exploreAsk`, `exploreApprove`) read it.
- `#carryCeilingsOnce` (l.136) stamps `this.#nowMs()`, not `Date.now()`.
- `aiUseOps(use, url, body, env = null)`: sets `use.env` when given, as `credentialsOps` does.

**Test (new, `bio-plane/test/m/ai-use/r17-clock.test.mjs`, three tests, all name R17)**
1. A limit set through `aiUseOps` under `BIO_NOW_MS` reads that clock (`set_at` and history `at`); control in a fresh world with no environment reads the wall clock.
2. A handed `now` beats `BIO_NOW_MS`: the limit's `set_at`, the counter's day and `first_at` read the handed clock; `useCheck` judges that day (AI_LIMIT_REACHED); control: the wall clock's `useCheck` is null.
3. With only `BIO_NOW_MS` handed: the counter's day and `first_at` read the pinned clock.

Failing-first: with the module at HEAD (stashed), the three tests fail (`set_at` not the pinned instant; the handed clock does not beat the environment; the pinned day not read). With the fix, they pass.

**Lines done and left:** none; no `fixtures-*` marker added or left. Markers: none (`fixtures-own`, `fixtures-generic`: none).

**Met ids:** R17.

**Tests and checks**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/ai-use/*.test.mjs`: 90 pass, 0 fail, 0 skipped (the 87 before, plus three).
- `checks/format.mjs /home/user/bio`: 178 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio ai-use`: 0 failures.
- `checks/coverage.mjs /home/user/bio ai-use`: 17 of 17 live ids named by a test, 0 failures.
- `checks/fixtures.mjs /home/user/bio ai-use --list`: 0 failures.
- `checks/ownership.mjs /home/user/bio ai-use <merge-base> HEAD`: 3 files, 0 failures.
- `checks/run.mjs /home/user/bio`: the failure list is the same as at the base except the R17 coverage line, which is now gone; words 19,239 as before, 16 failures as before (none in ai-use's files).
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 0 of 178 modules affected, 0 of 2,976 test files.

Size (session_012pQPh7QQptB92PrassaGET): test runs 7, module lines 1022

## J6 · REPORT

Ring not delivered: create_trigger refused three times on rate limit (retry after about 50s each). My pushed COMPLETE (J5, job/T51/ai-use at 012837d1e1) is the message; BOB's backstop reads it. I will retry the ring when I am woken.
