# credentials (T37)

**Status** · session_01GuauzcfoPk2o1oN8DhnUGQ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

My readings, applied; answer only to overrule. (1) R3 passwordChange: an absent or empty `by` is refused MACHINE_CANNOT_SET_PASSWORD with machine credentials and the operator's token (no member behind it, as R9 reads an unstamped call). (2) Only CURRENT_PASSWORD_WRONG counts toward R38's window and R44's tally (`signin`), as R44's list names only 'a password change's current password'; MACHINE_CANNOT_SET_PASSWORD, NOT_SIGNED_IN and PASSWORD_TOO_SHORT count nothing (the caller is signed in and no secret is judged). A pause still counts as R44's `rate` (R38). (3) A successful change is not a sign-in or recovery: it is no `through` and drops no waiting places (DEC-166). (4) `ended` counts the other sessions of the role that were live; expired rows of the role are removed with them. If the presenting session ends between judging and writing, nothing is written and NOT_SIGNED_IN is answered. (5) The new rows are in C-96 beside R38's (C-96.45 MACHINE_CANNOT_SET_PASSWORD, C-96.46 CURRENT_PASSWORD_WRONG, both in SIGN_IN_CHECKS) and C-29.33 AI_CREDENTIAL_NO_SECRET in the mint's family. (6) R53's refusal comes after R12's existing refusals (who, principal, identity, expiry), so a caller is told about itself and the record before the digest; the digest must be exactly /^[0-9a-f]{64}$/, with no trimming or lower-casing. (7) aiKeptAway() answers the very object R35, R27, R32 and R24 return (they return it unchanged).

## Completion (T37-6)

**Reading (mechanics §17, N739):** the reading set measured over 300 KB (requirements 46 KB; code 165 KB; tests 266 KB), so option (3). Read whole myself: `build/requirements/credentials.md`; layer 2's row of `build/layers.md`; the plan's T37-6 entry and rules 4 and 6; K2101, K2129, K2130, K2175 (their lines), DEC-182 whole, `plan/draft-T37-L2-L3-reqs.md`'s credentials section and "BOB's review"; membership's Purpose and the services my Uses names (R64, R68, R79, R81, R83, R84, R86, R92, R94, R95), record-core's Purpose, R21, R32, record-grammar's Purpose, R13, R15; every file of `bio-plane/src/credentials/` (index, checks, schema); the tests my entry changes (`fixture.mjs`, `t36`, `ai`, `rows-ops`, `t35-signin`, `t35-tally`). A worker read the other eleven test files whole (account, converts, grant, group-key, keyed, keys, own-keys, seam, signin, status-at, t35-misc) and wrote a summary of about 9 KB, each statement citing file and line: each test's title and ids, and every place asserting `NO_REASON`/C-29.32, minting with or without a digest, calling `setpassword`/`setPassword`, enumerating rows, codes or ops, or depending on window counts. What mattered from it: `t35-misc.test.mjs`:207 pins `SIGN_IN_CHECKS` to six codes (updated for C-96.45, .46), and `seam`:169 needs `setPassword` to stay R20's setter (it does). Nothing it left out mattered.

**Entries applied (T37-6):**
- R51 (N755; K2101, K231): `aiKeepAwaySet`'s refusal is `AI_KEEP_AWAY_NO_REASON`, row C-29.32, number unmoved; the module holds no `NO_REASON` code. answer-envelope's `catalogue-end.test.mjs` R7 (red 5) passes on my branch.
- R35 (N765; K2130, K231): `aiKeptAway()`, public and in-plane (no route): `null` while off, else the one `AI_KEPT_AWAY` refusal with `keep_away`; an unreadable setting answers that refusal saying so, with three nulls; never throws. It replaces `#keptAway`; R35's `accountFor`, R24's `accountReferenceFor`, R27 and R32 return it unchanged. C-29.31's `where` is now `aiKeptAway > is-kept-away`.
- R53 (N761; K2129, K2175): `aicredentialmint` reads `secretSha` from the body only (`who` still the query's stamp); `aiCredentialMint` refuses anything but `/^[0-9a-f]{64}$/` `AI_CREDENTIAL_NO_SECRET` (C-29.33, region `is-ai-credential-digest`), after R12's existing refusals, writing nothing.
- R3, R38, R44 (N776; DEC-182 (4)): `passwordChange({current, password, by, session, source, country})` serves `op=setpassword` (body `{current, password}`; `by`, `session`, `source`, `country` from the query; a body's `role`, `by` or `session` never read). In order: `MACHINE_CANNOT_SET_PASSWORD` (C-96.45; machine, operator token or no `by`); `NOT_SIGNED_IN` (R39's answer); R38's window under the session's role; `PASSWORD_TOO_SHORT`; `CURRENT_PASSWORD_WRONG` (C-96.46; R41's comparison; the only arm counted toward the window and R44's `signin`). Success: in one transaction the password is stored as `setPassword` stores it and every other session of the role ends with its ask grants; it answers `{ok: true, role, ended}`. `setPassword` stays R20's and R47's in-plane setter, routed nowhere.
- My readings (J1) all stand (B2, K2182).

**Rows for promotion's stamp (T37-7):** re-coded C-29.32 `AI_KEEP_AWAY_NO_REASON`; changed `where` of C-29.31 `AI_KEPT_AWAY` (`aiKeptAway`); new C-29.33 `AI_CREDENTIAL_NO_SECRET`, C-96.45 `MACHINE_CANNOT_SET_PASSWORD`, C-96.46 `CURRENT_PASSWORD_WRONG`.

**Rule 4's interim reds (N761), accepted by name:** control-plane (`control-plane/index.mjs`:2807, untouched until T37-33) sends `secretSha` in the query, so every mint through it is now refused `AI_CREDENTIAL_NO_SECRET`. The only test that mints through control-plane expecting success is `capture-requests/plane.test.mjs`:93 (its `world()` setup, shared by its five tests). Those five are already red on `tranche/T37` before my change (`CREDENTIAL_IN_ADDRESS`, C-38.10, earlier in the same setup), so no test changes colour at my merge. Once that inherited red clears, the five fail at :93 until T37-33. `admission/mint`, `control-plane/stamps`, `envelope` and `t34-routes` drive `aicredentialmint` but assert no successful mint, and stay green.

**Found in other modules (REPORT J3):**
- op-grades (L11): `JUSTIFICATION_REFUSALS` (`op-grades/index.mjs`:109) lists `NO_REASON` and not `AI_KEEP_AWAY_NO_REASON`, and `op-grades/t36.mjs`:34's comment names `NO_REASON (credentials R51)`. affordances `t36-backing.test.mjs`:76–80 (R19) pins `aikeepaway` to `NO_REASON` and goes red at my merge, until op-grades lists the new code and the test is re-pinned. No T37 entry covers this.
- Readers of `AI_KEPT_AWAY` (instance-setup, answers, wizard-scripts, store-door) can now call `aiKeptAway()` (rule 4, their entries).
- op-declarations: `setpassword` is still listed as in-process (`t35.test.mjs`:210, `t33.test.mjs`:72) and unserved/owed (`t34.test.mjs`:62, DEC-182 (4) `owed:setpassword`). Its spec (session stamps `by` and `session`, the door's `source` and `country`) is op-declarations' and control-plane's to declare; until then no caller reaches it.
- No generated artifact is touched by source here beyond the plane bundle, which BOB regenerates at L2's close.

**Deferred:** none.

**Tests and checks:**
- `node --test test/m/credentials/*.test.mjs`: 129 pass, 0 fail.
- Every module test, `test/m/**`: 8,768 tests, 8,687 pass, 68 fail. On `tranche/T37` before my change: 8,744 tests, 8,659 pass, 72 fail.
  - New red: one (affordances `t36-backing` R19, above).
  - Cleared: answer-envelope R7 (red 5).
  - Three more passed here that were red there: process-cleanup R2, `convert-tiers` in extraction and reading-pipeline, `staffdirectory`. None touches credentials; I take them as environment or timing differences.
- `format`: 136 modules, 0 failures. `architecture`: 20 product files, 53 imports, 0 failures. `coverage`: 52 of 52 live ids, 0 failures. `ownership` vs `tranche/T37`: 7 files, 0 failures.
- P6: 2,793 lines (2,692 at the opening).

Size (session_01GuauzcfoPk2o1oN8DhnUGQ): test runs 9, module lines 2793

## J2 · REPORT

Other modules. (1) op-grades (L11): JUSTIFICATION_REFUSALS (op-grades/index.mjs:109) lists NO_REASON, not AI_KEEP_AWAY_NO_REASON; op-grades/t36.mjs:34's comment says 'NO_REASON (credentials R51)'. affordances t36-backing.test.mjs:76-80 (R19) pins aikeepaway to NO_REASON and goes red at my merge, until op-grades lists the new code and affordances re-pins the test. No T37 entry covers it. (2) Rule 4 (N761): the only test that mints through control-plane expecting success is capture-requests/plane.test.mjs:93 (setup of its five tests). All five are already red on tranche/T37 (CREDENTIAL_IN_ADDRESS, C-38.10, earlier in the same setup), so none changes colour at my merge. They will fail at :93 (AI_CREDENTIAL_NO_SECRET) until T37-33 once that clears. (3) op-declarations/control-plane: setpassword is now a member's own change, needing session stamps by and session plus the door's source and country; its spec is theirs (DEC-182 (4) owed:setpassword). (4) Readers of AI_KEPT_AWAY can call credentials.aiKeptAway() (rule 4).

## J3 · COMPLETE

T37-6 done: R51 AI_KEEP_AWAY_NO_REASON (C-29.32; answer-envelope R7 red 5 passes on my branch); R35 aiKeptAway() (C-29.31 where moved); R53 aicredentialmint secretSha from the body only, AI_CREDENTIAL_NO_SECRET C-29.33; R3/R38/R44 passwordChange serves op=setpassword (C-96.45 MACHINE_CANNOT_SET_PASSWORD, C-96.46 CURRENT_PASSWORD_WRONG). Rows for T37-7: re-coded C-29.32, where of C-29.31, new C-29.33, C-96.45, C-96.46. Rule 4's grant reds by name: capture-requests/plane.test.mjs:93 (setup of its 5 tests), already red for CREDENTIAL_IN_ADDRESS, no colour change now. New red at merge: affordances t36-backing.test.mjs:76 (R19), see J3. Module tests 129/0; whole test/m 8687 pass, 68 fail, against 72 fail on tranche/T37 before (1 new above; answer-envelope R7 cleared). format, architecture, coverage 52/52, ownership: 0 failures. 2,793 lines. Record: build/jobs/T37/credentials.md on job/T37/credentials.
