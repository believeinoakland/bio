# credentials (T53)

**Status** · session_018Bhceesg4XYzpL7ZX32uiC · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-28)

# credentials · T53 · R1 · report

**Entries applied**

- T53-85 · K5457 · R27, R32, R48, R63, R66, R73 amended, R72 retired; `aicredential` on `AI_GRANT_OPS`:
  - R72 retired: the 36 delegates, the `credentialsOps` spread of `ai-accounts`' ops and the tests of them are deleted. Tests that used a delegate now call `w.c.accounts.<service>`. The `ACCOUNT_CHECKS` view and the `USE_KINDS` re-export stay (see "Found in other modules").
  - R73: the listener takes `ai-accounts` R26's notice. For `why` in `removed`, `disconnected`, `revoked`, `refused`, `unresolved` (`ACCOUNT_CLEARED_WHY`, exported) it revokes the run credentials carrying the notice's `account_id`, plus every run credential of the owner for a member-owned account. It ends the member's standing grants unless `other_account_serves` is true. It also reads the earlier notice's `reference_held` as the same fact, so it works against `ai-accounts` as it is today.
  - R63: `aiRunCredentialMint` takes `account_id` (the new `ai_credentials.account_id` column, additive, indexed). It is recorded on the row. A non-string or empty value is `AI_RUN_CREDENTIAL_MALFORMED` (`what: "account_id"`). The public projection and the mint's answer are unchanged.
  - R66: the REAUTH_DUE sentence is `credentials.checks.reauth_due`, composed with the word `ai.reauth.connect` ("connecting an AI account"), read by key. It names no provider.
  - R27, R32: code comments and the standing-switch refusal's `{who}` read the account's level (team's, project's, member's own account). The behaviour is `ai-accounts`' R11, R25 and R51 as it answers them.
  - R28: `AI_GRANT_OPS` gains `aicredential` (BOB confirmed). `answers`' ASK_SCOPE must gain it (layer 6, placed by BOB).
  - R48: the control the requirement names, plus the ban on "group" in the strings the module answers. Both tests read the sentences from the word table.
- T53-86 · N1259, K4403, K1449 · CAPABILITIES rows: R84. `KEYED_SERVICES` is `courtlistener`, `ca-officers` (BOB, K5666); no `openfec`. `keyedServices()` keeps its shape and lists the second service.
- T53-87 · K5565 · English in tests: all 16 regex sites in 9 files converted (the "Nothing was written/changed/counted" tails and the t36, t38 and t47 phrases). Each asserts the key the module reads, `word(id, vars)`. The baseline file is outside this module's paths, so BOB removes the module's nine test files from `build/tests-english-baseline.json` at merge (the words check, run with them removed, reports 0 failures). The words check reports 0 failures.
- The word `ai.reauth.connect` and the new keys were added by regenerating `rows.mjs` and `words-unreviewed.json` with `build.mjs` (`--check` passes).

**Not done, and why**

- R27's `RECIPIENT_NOTICE_DUE` path and R63's and R73's `account_id` and `unresolved`/`refused` paths cannot be driven through `ai-accounts`' real code yet (its R26, R51 and R60 are its T53 job). Each has a `test.todo` naming the requirement, and the module's code is written to the notice as R26 states it. They need a CHANGE after `ai-accounts` merges: re-run these tests, then replace the todos.
- Tests that call `ai-accounts` services retired by its job (`subscriptionDisconnect`, `groupKeyNotice`, and others) will need re-pointing in the same CHANGE.

**Found in other modules**

- Users of R72's delegates remain (deleting them turned 17 tests red in `store-assembly/ask.test.mjs`, `store-door/routes.test.mjs` and `control-plane/r53-routes.test.mjs`, so I kept them): fixtures that call `credentialsOf(ctx).aiKeepAwaySet` and the like. Each user should call `aiAccountsOf(ctx)`; the first credentials job after that deletes the delegates. Not run to the end: the full `--users` run (over 30 minutes); I ran these three plus `answers/scope.test.mjs`.
- `store-door/routes.test.mjs` and `control-plane/r53-routes.test.mjs` still read `ACCOUNT_CHECKS` from `credentials` (rows `NO_ACCOUNT`, `REAUTH_DUE`, `GRANT_OP_REFUSED`). I kept the view and `USE_KINDS` so they stay green. Their jobs should read `ai-accounts`' `AI_ACCOUNT_CHECKS` directly; then the view can be deleted in a later credentials job.
- The design rows `refusal.REAUTH_DUE` and `session.reauth` in `docs/development/ux-substrate/screens/words.json` still say "connecting Claude". They belong to the UX design stream; the screen that shows the prompt (interface-shell) should read `ai.reauth.connect`.
- `answers/scope.test.mjs` R1 is red until answers adds `aicredential` to ASK_SCOPE (BOB placed it).

**Met** · R32, R48, R66, R84

Tests: 214/217. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhceesg4XYzpL7ZX32uiC): test runs 1, module lines 2832

## Completion (2026-10-28)

# credentials · T53 · R1 · report

**Entries applied**

- T53-85 · K5457 · R27, R32, R48, R63, R66, R73 amended, R72 retired; `aicredential` on `AI_GRANT_OPS`:
  - R72 retired: the 36 delegates, the `credentialsOps` spread of `ai-accounts`' ops and the tests of them are deleted. Tests that used a delegate now call `w.c.accounts.<service>`. The `ACCOUNT_CHECKS` view and the `USE_KINDS` re-export stay (see "Found in other modules").
  - R73: the listener takes `ai-accounts` R26's notice. For `why` in `removed`, `disconnected`, `revoked`, `refused`, `unresolved` (`ACCOUNT_CLEARED_WHY`, exported) it revokes the run credentials carrying the notice's `account_id`, plus every run credential of the owner for a member-owned account. It ends the member's standing grants unless `other_account_serves` is true. It also reads the earlier notice's `reference_held` as the same fact, so it works against `ai-accounts` as it is today.
  - R63: `aiRunCredentialMint` takes `account_id` (the new `ai_credentials.account_id` column, additive, indexed). It is recorded on the row. A non-string or empty value is `AI_RUN_CREDENTIAL_MALFORMED` (`what: "account_id"`). The public projection and the mint's answer are unchanged.
  - R66: the REAUTH_DUE sentence is `credentials.checks.reauth_due`, composed with the word `ai.reauth.connect` ("connecting an AI account"), read by key. It names no provider.
  - R27, R32: code comments and the standing-switch refusal's `{who}` read the account's level (team's, project's, member's own account). The behaviour is `ai-accounts`' R11, R25 and R51 as it answers them.
  - R28: `AI_GRANT_OPS` gains `aicredential` (BOB confirmed). `answers`' ASK_SCOPE must gain it (layer 6, placed by BOB).
  - R48: the control the requirement names, plus the ban on "group" in the strings the module answers. Both tests read the sentences from the word table.
- T53-86 · N1259, K4403, K1449 · CAPABILITIES rows: R84. `KEYED_SERVICES` is `courtlistener`, `ca-officers` (BOB, K5666); no `openfec`. `keyedServices()` keeps its shape and lists the second service.
- T53-87 · K5565 · English in tests: all 16 regex sites in 9 files converted (the "Nothing was written/changed/counted" tails and the t36, t38 and t47 phrases). Each asserts the key the module reads, `word(id, vars)`. The baseline file is outside this module's paths, so BOB removes the module's nine test files from `build/tests-english-baseline.json` at merge (the words check, run with them removed, reports 0 failures). The words check reports 0 failures.
- The word `ai.reauth.connect` and the new keys were added by regenerating `rows.mjs` and `words-unreviewed.json` with `build.mjs` (`--check` passes).

**Not done, and why**

- Nothing in the entries is left. After the `ai-accounts` CHANGE (K5677): R27's `RECIPIENT_NOTICE_DUE`, R63's and R73's `account_id` paths and all four reasons (`removed`, `disconnected`, `refused`, `unresolved`) are real tests through `ai-accounts`' own acts (no todo remains). `revoked` is the member-revocation path, covered by R16's test; it ends the same run credentials.
- `credentialsOf` takes and hands on `catalogue` (`ai-accounts` R32); the composition root passes `ai-catalogue`'s service when it exists.
- R72's delegates are cut to the 13 services `ai-accounts` still has, and `credentialsOps` no longer spreads its ops (assemble.mjs already served them directly). The `ACCOUNT_CHECKS` view and `USE_KINDS` stay for store-door's and control-plane's tests.
- member-roster's founder rules (K5676): seam R16, t35-misc R16 and own-keys R9 add administrators through a fixture helper `addAdmin` and remove by the others' votes, so they pass on the tranche and on a local merge of origin/job/T53/member-roster (not pushed).

**Found in other modules**

- Users of R72's delegates remain (deleting them turned 17 tests red in `store-assembly/ask.test.mjs`, `store-door/routes.test.mjs` and `control-plane/r53-routes.test.mjs`, so I kept them): fixtures that call `credentialsOf(ctx).aiKeepAwaySet` and the like. Each user should call `aiAccountsOf(ctx)`; the first credentials job after that deletes the delegates. Not run to the end: the full `--users` run (over 30 minutes); I ran these three plus `answers/scope.test.mjs`.
- `store-door/routes.test.mjs` and `control-plane/r53-routes.test.mjs` still read `ACCOUNT_CHECKS` from `credentials` (rows `NO_ACCOUNT`, `REAUTH_DUE`, `GRANT_OP_REFUSED`). I kept the view and `USE_KINDS` so they stay green. Their jobs should read `ai-accounts`' `AI_ACCOUNT_CHECKS` directly; then the view can be deleted in a later credentials job.
- The design rows `refusal.REAUTH_DUE` and `session.reauth` in `docs/development/ux-substrate/screens/words.json` still say "connecting Claude". They belong to the UX design stream; the screen that shows the prompt (interface-shell) should read `ai.reauth.connect`.
- store-assembly, store-door and control-plane tests that call `accountReferenceSet`, `groupKeySet` and the like (17 red in the three I ran) are the users BOB placed at T53-552 to T53-554, red by `ai-accounts`' retirements, not by this module.
- `answers/scope.test.mjs` R1 is red until answers adds `aicredential` to ASK_SCOPE (BOB placed it).

**Met** · R27, R32, R48, R63, R66, R73, R84

Tests: 217/217. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Tested with: member-roster @ 6886e00f74 (it merges with them: proc merge --with)
Size (session_018Bhceesg4XYzpL7ZX32uiC): test runs 2, module lines 2824
