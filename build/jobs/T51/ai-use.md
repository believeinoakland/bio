# ai-use (T51)

**Status** · session_01PuyDahdpv1J5bkAgBw2hpw · depth 2 · WORKING · handled B0

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
