# credentials (T51)

**Status** · session_01EEx7L4P9qQ1VGojBhH5rv5 · depth 2 · WORKING · handled B4

## J1 · COMPLETE

Applied B1 (T51-14, BOB's note 1): the stale comment at `bio-plane/src/credentials/index.mjs` line 296, above `bootstrapState` (R2), restated for the code as it is. It named "the setup page", which no longer exists (K3177), and narrated the retired `roles` answer. It now names the setup screen (`screens-entry` R18) and says the answer names no roster. No code changed. Commit d5cbbac548 on `job/T51/credentials`.

Other stale mentions of the old interface in the module: none found (searched `src/credentials/` and `test/m/credentials/` for setup page / setup screen / setup-page). The `setup-token` in `test/m/credentials/fixture.mjs` is the Claude Code CLI command, not the old interface; left as is.

Deferred: nothing.

Found in other modules (not changed here): the whole-repo run of `checks/run.mjs /home/user/bio` reports coverage failures in agent-harness (R17 named by no test), agent-runner (R36, R37, R38, R40), capture (R96), journey-check (R19), project-roster (R35, R36) and promotion (R58). Not this module's ids; reported for BOB's reading.

Tests and checks:
- `node --test "test/m/credentials/*.test.mjs"` (bio-plane): tests 160, pass 160, fail 0.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures (3535 product files); coverage 170 modules, 5853 of 5863 ids named (the six failures above, none in credentials); channels 0 failures.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 28 product files, 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 55 of 55 live requirement ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 1 file changed, 0 failures.

Size (session_01A5kq8RgUB5bhTnBnJ5oEtC): test runs 1, module lines 2728

## J2 · COMPLETE

Applied B2 (T51-176, the words findings in `build/plan/words-pass/credentials.md`), commit 8d79cbee3c on `job/T51/credentials`. Text unchanged throughout; keys and ids assigned once.

- `checks.mjs`:20 (`refusal.SIGN_IN_PAUSED`, copy of a words row): `word('refusal.SIGN_IN_PAUSED', { time: '{time}' })`, so `{time}` stays for the screen as the comment says.
- `index.mjs`:1258 (plain): `localize('credentials.index.minted_by_your_teams_civicsmith', …)`, the run credential's note.
- `index.mjs`:1291 (plain): `localize('credentials.index.a_run_in_a_project', …)`, the label passed to membership's `projectAuthority`.
- `index.mjs`:1937 (inline, placeholders): `localize('credentials.index.the_keyed_services_are', …, { services, prefix })`.
- `index.mjs`:1966 and :1993 (plain): `localize('credentials.index.setting_the_teams_key', …)` and `localize('credentials.index.switching_the_teams_key', …)`, the act labels for `#adminBar`.
- Test copies of member sentences, converted to `word`/`localize` equality or a key-backed `has`: `t35-misc.test.mjs` (the flagged ones in the words-pass file, plus the two sibling copies met in the same test, K3810); `seam.test.mjs`:182 (the assertion message, reworded so it copies nothing); `keyed.test.mjs` and `t36.test.mjs` (the act labels, now passed as `localize` calls; the check counts them as code copies once `index.mjs` carries them).
- Code copies of other modules' sentences (K3962): `t35-misc.test.mjs` lines for `ai-accounts.index.your_teams_civicsmith_has_no`, `…the_reference_does_not_open`, `…the_teams_key_does_not` and `…the_key_does_not_open`, compared with `localize` of those ids.
- Handlists (K3268): `grant.test.mjs` no longer hand-lists the eight routed names; it asserts `rule` and the two renamed names `linesof` and `structureat` are held, and the sorted, lowercase, unique list stays. `rows-ops.test.mjs` no longer hand-lists the module's routes; it compares the routes with this module's own map and checks the moved routes are answered here.

Deferred: nothing of the findings.

Found in other modules, not changed here:
- Whole-repo `checks/run.mjs /home/user/bio`: the words check reports 4,284 failures across 173 modules (inline 3,103, plain 1,380, testcopy 1,001, handlist 180 tagged `?`, dev and unkeyed counted apart), in modules other than credentials, e.g. `capture-sources` (`credentials.mjs`:226 to :428, plain), `wizard-scripts` (`t47`, `t48`, `writing-help` testcopies), `reevaluation` (`checks.test.mjs`:110, part testcopy). Coverage has 33 failures in other modules. None names credentials. This is the tranche's words pass still open for those modules' jobs, not this one's.
- `setup-words --check` reports `rows.mjs` stale, naming this job's new ids (`credentials.index.a_run_in_a_project` and the others). Expected: BOB regenerates it at the layer close (manifest §14).

For BOB, a question rather than a change: the check does not count some member-read sentences in this module. The `LOGIN_REFUSAL_DETAIL` (`index.mjs` around line 455, R4's refusal detail) and the `detail:` strings inside the DEC-49 regions (for example `passwordChange`'s and `signerRegisterOwn`'s details) are plain English in code, not `localize` calls, and the check is silent on them. `t35-misc.test.mjs` also still asserts fragments of `LOGIN_REFUSAL_DETAIL` and of two `detail`s, which copy them. K3964 (2) says such sentences are still read and need converting. I have not converted them, since they are outside the findings this job was given; I'd like Bob to say whether they go in this job (a second pass over `index.mjs`) or to the design's `unkeyed` list (K3944). Until then they stay as they are.

Tests and checks:
- `node --test "test/m/credentials/*.test.mjs"` (bio-plane): tests 160, pass 160, fail 0.
- `node checks/words.mjs /home/user/bio credentials`: 0 failures (was 15).
- `node checks/format.mjs /home/user/bio`: 175 modules, 174 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 28 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 55 of 55 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0 failures, architecture 0 failures, channels 0 failures; coverage and words failures only in other modules (above).
- `node bio-plane/src/setup-words/build.mjs --check`: stale rows note only (above); no refusal naming this module.

Size (session_01MVQ8cwXNydHkeU6mxmzKQs): test runs 3, module lines 2679

## J3 · COMPLETE

Applied B3 (CHANGE: every member-read sentence by key, K3974), commit b7cb012a79 on `job/T51/credentials`, after merging `tranche/T51` (3416b54f25). Keys are `credentials.index.<slug>`; the DEC-49 region markers are kept; text unchanged.

Converted by `localize`:
- `LOGIN_REFUSAL_DETAIL` (R4's refusal detail, `sign_in_refused`).
- DEC-49 regions: `passwordChange` (two details), `#notSignedIn`, `#paused`, `#signerMemberBar` (NOT_ACTIVE), `signerAdd` (BAD_KEY), `signerRegisterOwn` (machine, held, revoked and the two success details), `aiCredentialMint` (not-a-member, principal-not-the-minter, principal-unstated, identity, expiry, digest), `aiCredentialRevoke` (not-a-member), `aiRunCredentialMint` (shape, the three arms), standing grant, `grantHeld`, `aiGrantAdmit` (op), `securityCount` (kind), the period refusal and its faults, `securityTotals` (counts unreadable), `recoveryCodesIssue`, `recover` (RECOVERY_REFUSED), reset link dead, keyed service off and no key, `reauthDue`, `sessionLockedRefusal`.
- Outside the regions, the same kind: the `accountMemberNotActive` and `notYourAccount` details in `aiRunCredentialMint`, `aiGrantMint` and `aiGrantMintStanding`.

Deferred: nothing of the CHANGE.

Found in other modules, not changed here: `reevaluation` `checks.test.mjs`:110 (testcopy, part, "the record's own machine credentials may say a newer version exists..."). `setup-words --check` reports `rows.mjs` stale, now naming ids in `ai-accounts` as well as this module's (expected until BOB regenerates at the layer close).

Tests and checks:
- `node --test "test/m/credentials/*.test.mjs"` (bio-plane): tests 160, pass 160, fail 0.
- `node checks/words.mjs /home/user/bio credentials`: 0 failures (inline 0, plain 0, testcopy 0, handlist 0, unkeyed 0).
- `node checks/format.mjs /home/user/bio`: 175 modules, 174 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 28 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 55 of 55 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 0 failures.
- `node checks/run.mjs /home/user/bio`: the only finding naming credentials is the `reevaluation` test copy above, not this module's.

Size (session_01MVQ8cwXNydHkeU6mxmzKQs): test runs 6, module lines 2639

## J4 · COMPLETE

Applied B4 (CR-16, R80 `lastActivity()`), commit 79631222c3 on `job/T51/credentials`.

- `bio-plane/src/credentials/index.mjs`: `lastActivity()` beside `claimed()` (R17). It answers the newest `last_active` over `sessions` as an ISO-8601 string, or `null` when no session holds one. It is a read: it touches no row, and it does not go through `session()`, which would count as activity. It never throws; a store that cannot be read answers `null`, the same answer `instance-setup`'s `#lastActivity` gives today (`bio-plane/src/setup.mjs`:2627, for a dropped `sessions` table).
- The output is byte-identical to the instance-setup read it replaces (`new Date(ms).toISOString()` over `MAX(last_active)`), so `bootstrapfacts`' `last_used_at` does not change when CR-12 re-points it.
- Tests: new `bio-plane/test/m/credentials/t51.test.mjs`, three tests each naming R80: the later of two sessions' instants, as ISO-8601, with a control that the read leaves every session row as it was; `null` with no session held and with none recorded; `null`, not a throw, when `sessions` is unreadable.

For BOB, a wording point, not changed here: R80 says "as the ISO-8601 instant it stores", but `sessions.last_active` stores milliseconds (`schema.mjs`:31, 35). The answer is the ISO-8601 string of that instant, as the setup read answers it today. If Bob wants the requirement's wording to say "as the instant it stores, rendered ISO-8601", that is a requirements edit for BOB.

Deferred: nothing.

Found in other modules, not changed here (whole-repo `checks/run.mjs /home/user/bio`):
- Coverage, 7 failures, none in credentials: `agent-harness` R17; `agent-runner` R36, R37, R38, R40; `extraction` R77; `installer-steps` R26, R31; `journey-check` R19; `screens-inquiry` R81, R82; `setup-words` R19.
- Words, 15 inline failures, none in credentials: `instance-setup` `setup-fleet.mjs`:30, 32, 35–38, 42, 44, 55, 64, 66, 67 (CR-12's, already accepted by name in the plan); `promotion` `index.mjs`:194, 1151, 1184.
- Instance-setup's own `#lastActivity` stays in place until CR-12 re-points it to `lastActivity()`, as the plan's CR-12 entry says.

Tests and checks:
- `node --test "test/m/credentials/*.test.mjs"` (bio-plane): tests 163, pass 163, fail 0 (the three R80 tests are among them).
- `node checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 29 product files; 0 failures. Whole run: 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 56 of 56 live requirement ids named by a test; 0 failures.
- `node checks/words.mjs /home/user/bio credentials`: 0 failures.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 2 files changed by credentials, 0 failures.
- `node checks/run.mjs /home/user/bio`: format, architecture, channels 0 failures; coverage and words failures only in the modules named above.

No pull request is opened, per the job's rule; BOB merges at the tranche boundary.

Size (session_01XeEQiwMvWUVaEbgAvHSsgC): test runs 1, module lines 2651
