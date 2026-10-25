# credentials (T51)

**Status** · session_015BgLFhXk6KZEKYCGLb1LEg · depth 2 · COMPLETE · handled B12

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

## J5 · QUESTION

Three points from reading B5, with my best reading for each. I carry on with everything else.

1. **C80 (R81) cannot be seen failing yet: `member-roster` R76 is not on `tranche/T51`.** B5 says it merged before I started. It has not: `tranche/T51` at abc09b300a has no `member-roster` R76 line, `memberFacts("admin")` still answers null, and `member-roster`'s own job (MEMBER-ROSTER #3) only started after mine. The refusal is `#signerMemberBar` -> `memberFacts`, so the change is `member-roster`'s, not mine, and I will not decide "the founder is active" in this module (it would copy a rule that module owns). Best reading: I write the R81 test now (founder registers a key after the claim; refused before it; a non-founder as before), see it fail for that reason, and finish C80 when `tranche/T51` carries R76. Please tell me when to merge it, or tell me to take another course.

2. **`subscriptionsignin` is not served by this module** (census row: "no ops-map arm found"). `agent-worker/src/signin.mjs` says the plane's door routes it to the member's own runner (`control-plane`; `agent-worker` R66). I declare nothing for it and leave it to its owner. The other 17 ops of entry 3 are declared.

3. **`securitymap` cannot be declared as the rows stand.** It is a read (`op-declarations`: `mutating: false`), but `op-grades` holds a hand row `RUNG_ABSENT.securitymap = {ground: "caller-owned"}` (t48.mjs). A declaration with `weight: "caller-owned"` is refused as a ground on a read (`DECLARED_OP_BAD_WEIGHT`, ground-on-read); `weight: "read"` is refused as disagreeing with the hand row (`DECLARED_OP_DISAGREES`, hand=caller-owned). Best reading: `op-grades` drops that hand row (its `NON_ACTS` row already states the read) and I then declare `securitymap` as `weight: "read"`, `fields: {accepts: ["from","to"], requires: ["from","to"]}`; or you give it its own job. Until then it stays undeclared.

Also decided, to be recorded (no answer needed unless you disagree): `fp` (the bootstrap secret's fingerprint the control plane puts in `claim` and `bootstrap`) is a door stamp like `source` and `country`, so it is not in `accepts`; `login`, `recover` and `reauth` answer a missing field with their one fixed refusal (R4, R47), so their `requires` are the fields without which no call can succeed and the tests count that refusal as naming them. Requirement lines (R81 for C80; R82 for `DECLARED_OPS`, one line for entries 2 and 3) I put in my record for you, because my paths do not include `build/requirements/`.

## J6 · REPORT

Applied B5 and B6 (FR-09) as far as the tranche allows, on `job/T51/credentials`.

- **Entries 2 and 3 (K4168, K4202): done.** `DECLARED_OPS` declares 17 ops (the 16 earlier ones and `securitymap`, now declared `weight: "read"`, `accepts` and `requires` `from`, `to`, per B6 (3)); `subscriptionsignin` is control-plane's and is not declared here. `declared-ops.test.mjs` (18 tests, all pass) holds each declaration true through test-support's `declaredOpHolds`. The `op-grades` `RUNG_ABSENT.securitymap` hand row must go for the registration to agree (BOB's CHANGE to OP-GRADES #16). Hand rows in `op-declarations` and `op-grades` that can now go once the registration agrees: the rows for the 17 ops above.
- **Requirement lines, written in `build/requirements/credentials.md` (B6: either place is fine):** R81 (C80, *not yet met: T51*) and R82 (`DECLARED_OPS`, met: the tests name it).
- **Entry 1 (C80, R81): waiting on `member-roster` R76.** `tranche/T51` still carries no R76 line and `memberFacts("admin")` still answers null. The R81 test (`t51.test.mjs`:39, with its control at :59) is written and fails for that reason alone (`NO_SUCH_MEMBER` for the founder after the claim); the pin at `own-keys.test.mjs`:55 is changed to the unclaimed case only. This module changes no code for R81 unless it still refuses once R76 has merged. I finish it when BOB's CHANGE says R76 is merged.

Wording point: R81's refusal before the claim stays `noSuchMember("admin")`, the founder not yet being a member.

Tests and checks:
- `node --test "test/m/credentials/*.test.mjs"` (bio-plane): tests 183, pass 182, fail 1 (R81, as above).
- `node checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 30 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 58 of 58 live requirement ids named by a test; 0 failures.
- `node checks/words.mjs /home/user/bio credentials`: 0 failures.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 0 failures (before this commit's requirements file, which B6 accepts).

## J7 · REPORT

J6: DECLARED_OPS done (17 ops incl. securitymap as read; op-grades must drop RUNG_ABSENT.securitymap), R82 met, R81/R82 lines written. C80/R81 waits on member-roster R76 (not on tranche/T51): its test is written and fails only for that reason. Send CHANGE when R76 is merged. Details in my record J6.

## J8 · COMPLETE

Applied B7 (CHANGE, K4218): merged `tranche/T51` (member-roster R76 on it). R81's test passes with no change to this module's code, as J6 said.

Entries applied: 1 (C80, R81), 2 and 3 (`DECLARED_OPS`, R82; see J6). R81 and R82 are written in `build/requirements/credentials.md` (not in this record), both marked met; the ownership check lists that one file, which B6 accepts.

R76 made two older pins stale, both of the founder being no member; I moved them to the new behaviour (no assertion weakened, the refusal-writes check kept):
- `keys.test.mjs` (R6): `signerAdd` for `memberId: "admin"` now succeeds after the claim (asserted after the "no refusal writes" check; the final key count is 5).
- `grant.test.mjs` (R32): the founder is no longer in the "not active" list; `aiGrantMintStanding("admin")` is `NO_ACCOUNT` (active, no account of her own).

Deferred: nothing. Another module: `op-grades` hand row `RUNG_ABSENT.securitymap` (t48.mjs) must go for the `securitymap` declaration to agree; and the hand rows of the 17 declared ops in `op-declarations` and `op-grades` can go once registration agrees. The whole-repo words check shows 20 `testcopy` failures in `op-grades` tests (none in credentials), and coverage shows failures in other modules (none in credentials).

Tests and checks:
- `node --test "test/m/credentials/*.test.mjs"` (bio-plane): tests 183, pass 183, fail 0.
- `node checks/format.mjs /home/user/bio`: 175 modules; 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 30 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 58 of 58 live requirement ids named by a test; 0 failures.
- `node checks/words.mjs /home/user/bio credentials`: 0 failures.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 1 failure, `build/requirements/credentials.md` (accepted, B6).
- `node checks/run.mjs /home/user/bio`: format, architecture, channels 0 failures; coverage 5 and words 21 failures, none in credentials.

Size (session_01PVXWdCkqAhUVeYE1E8cxT4): test runs 5, module lines 2750

## J9 · COMPLETE

J8 COMPLETE: R81 met after R76 (two founder pins updated), R82 met, DECLARED_OPS incl. securitymap. Details in my record J8.

## J10 · COMPLETE

Applied B8 (CHANGE, K4237): `DECLARED_OPS.bootstrap` now accepts `members` (not required). Commit a1b0f4344e on `job/T51/credentials`.

- `bio-plane/src/credentials/index.mjs` (`DECLARED_OPS.bootstrap`): `fields: {accepts: ["members"], requires: []}`, with a comment saying where the field is answered.
- `bio-plane/test/m/credentials/declared-ops.test.mjs`: a new R82 test for `bootstrap`: `members` is declared and not required, and `declaredOpHolds` holds the declaration with the undeclared-field control (`undeclared_field_bootstrap` is dropped or refused naming it).
- `build/requirements/credentials.md`, R82: one sentence added recording `bootstrap` accepts `members` (K4237). R82 stays met.

Finding for BOB, not changed here: this module's `bootstrap` arm (`index.mjs` ~2079) reads only the `fp` stamp, not `members`. The `members=1` answer is given at the public door by instance-setup's `bootstrapOp` (`bio-plane/src/setup.mjs`:3344), which reads `url.searchParams.get("members")`. So the `members` declaration is true of the op as the door serves it, but the declared field is read in instance-setup's code, not in this module's arm. Instance-setup declares no `bootstrap` row of its own, so the screen guard checks this declaration. If you want the declaration to name only what this module's arm reads, the two options are: `accepts` stays `[]` and the guard finds `members` answered by instance-setup, or instance-setup takes over the `bootstrap` declaration. I have not chosen; the CHANGE you sent says to add it, and I did.

Requirement line for BOB (also in `build/requirements/credentials.md`, R82, amended):
> **R82** … `bootstrap` accepts `members` (not required; K4237): the screens' ask for each member's own build, answered at the public door by instance-setup's `bootstrapOp`, not by this module's arm. …

Deferred: nothing.

Found in other modules: none new. The whole-repo `checks/run.mjs` run shows coverage failures (4) and words failures (27) in other modules; none names credentials.

Hand rows that can go once the registration agrees: none new (B6 already named the 17 ops; `op-grades` `RUNG_ABSENT.securitymap` is still pending its CHANGE to OP-GRADES #16).

Tests and checks:
- `node --test test/m/credentials/*.test.mjs` (bio-plane): tests 184, pass 184, fail 0.
- `node --test test/m/credentials/declared-ops.test.mjs`: tests 19, pass 19, fail 0.
- `node checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio credentials`: 30 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio credentials`: 58 of 58 live requirement ids named by a test; 0 failures.
- `node checks/words.mjs /home/user/bio credentials`: 0 failures.
- `node checks/run.mjs /home/user/bio`: format, architecture, channels 0 failures; coverage and words failures only in other modules.
- `node checks/ownership.mjs /home/user/bio credentials tranche/T51 job/T51/credentials`: 1 failure, `build/requirements/credentials.md` (outside the paths). B6 accepts this listing of that one file at merge.

Size (session_019uitbe7o6WXsqjVUksVxFY): test runs 3, module lines 2699

## J11 · QUESTION

QUESTION (C51, the 37.6 s registration): the credentials arm is not where the time goes, so the dominant stage sits in a module I do not hold.

Measured at the module's interface, real SQLite and real membership (the credentials test world): `signerRegisterOwn` takes 0.4 to 2 ms and makes 5 store calls (the member's row, the key's row, the insert, membership's list of active administrators, the credentials row for that list). The count is the same with 2 members and 0 keys or 12 members and 60 keys. The administrator "notification" is not a fan-out: the answer's `notified` is membership's list read at the act, and the feed reads the key's row later. No hash or other costly work is in the arm. So 37.6 s is not credentials' own work.

Stages that remain, none mine: (1) the control plane / admission path in front of `signerregister` (the op has weight `credential`; whether an act of that weight triggers a password hash, a re-ask check or a session read before the store door is for admission and control-plane to say); (2) the store door's dispatch around `dispatch.mjs:427`; (3) the browser: the key made in the member's own browser (WebCrypto) and, per the walk, a fresh key made at each signing, which belongs to screens-publish / screens-settings (wave 2). I cannot name which from here without a live run: the arm's `timings` now carries the plane's part, so a walk on biosmoke8 that reads the answer will show the arm at 0 to 2 ms and place the rest on the door or the browser.

Best reading: ask the control-plane job (and screens-publish) to time the door and the browser stages for C51; mine is met and proven. Nothing here blocks me, so I carry on to COMPLETE.

## J12 · COMPLETE

COMPLETE · fix round 3 (B9), CREDENTIALS #25. Commits on `job/T51/credentials`; `tranche/T51` merged at its tip (482aff3dcf) before this entry.

**Cause met: C51 (the plane's part), requirement R9 (signerregister, served as signerregisterown).**
- Measured first, at the module's interface (real SQLite, real membership): `signerRegisterOwn` takes 0.4 to 2 ms and makes 5 store calls (the member's row, the key's row, the insert, membership's active administrators, the credentials row that list reads). No hash, no fan-out: the administrator "notice" is membership's list read at the act, and the feed reads the key's row later. The cost behind the walker's 37.6 s is therefore not this module's; the stage and numbers are in J11 (QUESTION) for the control-plane and screens-publish jobs.
- Built: a successful registration's answer carries `timings: {total_ms, stages}`, whole non-negative milliseconds, stages `standing`, `lookup`, `write` (absent when the key is already the member's) and `notify`; the stages sum to no more than the total. A refusal carries no `timings` (its key set is unchanged, so every refusal test stands). Nothing else in the answer changed; the administrators are still told (`notified`).
- Tests, written first and seen failing (the timings test failed before the change; the store-call test describes the arm as it already was, so it held and is the bound, not a fix): `own-keys.test.mjs` "R9 C51 a registration's store calls are bounded …" (at most 6 calls; the same count with 12 members and 60 keys as with a small team; a key already held and a refusal are no dearer) and "R9 C51 a registration's answer carries timings …" (the keys, the whole numbers, the sum, no `write` stage for a held key, no timings on a refusal; control: `notified` equals membership's `activeAdmins()`). Two existing exact-shape assertions on a success (`own-keys.test.mjs` R9 registration and held key; `t51.test.mjs` R81 founder) now set the new `timings` key aside and stay strict about every other key; nothing was weakened.

**Proposed requirement line for BOB to write (R9, amend):** "A registration that succeeds carries `timings: {total_ms, stages}`: the whole milliseconds the arm took and each stage that ran (`standing`, `lookup`, `write`, `notify`), the stages summing to no more than `total_ms`; a registration makes a bounded number of store calls (at most six) whatever the size of the team or of the roster. Refusals carry no `timings`." Test: the two above.

**Deferred:** nothing. **Found in other modules, not changed:** the stage behind C51's 37.6 s (J11): the door and control-plane path for a `credential`-weight op, or the browser's key making; `build/rulings.md:4346` fails the format check (K4349 states no standing-list decision), on the tranche tip, not mine.
`setup-words --check`: no new words in this change.

**Tests and checks:**
- `node --test --test-force-exit "test/m/credentials/*.test.mjs"` (bio-plane): tests 186, pass 186, fail 0.
- Users of the arm (15 test files naming `signerRegisterOwn`/`signerregister`: screens-inquiry, screens-settings, ratification, op-declarations, interface-shell, screens-publish, op-grades, store-door, control-plane): tests 213, pass 213, fail 0. `build/plan/impact.mjs` names 105 modules by its shared-table rule (`DECLARED_OPS` is unchanged by this change); I ran the ones that read this answer, not all 1,507 files.
- `checks/format.mjs`: 175 modules, 175 requirements files; 1 failure, `build/rulings.md:4346`, not mine.
- `checks/architecture.mjs credentials`: 30 product files; 0 failures. `checks/coverage.mjs credentials`: 58 of 58 live ids named by a test; 0 failures. `checks/words.mjs credentials`: 0 failures. `checks/ownership.mjs credentials tranche/T51 job/T51/credentials`: 4 files changed; 0 failures.

Size (session_019Weuk3yVSt11Vsjp9xvR7M): test runs 5, module lines 2708

## J13 · Fix round 10, wave A batch 1 (B11), CREDENTIALS #26

**Cause done: R24 (a), requirement R65 (fix round 10 amendment).**
- Root cause: `session()` ended every foreground read in `UPDATE sessions SET last_active=?` (`credentials/index.mjs`, the line after `#stateOf`), a write hop on every request. Tests missed it: `r9-bookkeeping` and record-core `r8-bookkeeping` count the write counter of a read, none counts statements; `t47-signin.test.mjs` sets `last_active` by hand.
- Built: `ACTIVITY_GRAIN_MS` (60 s, exported); a not-background read writes `last_active` only when the stored value is older than the grain or none is recorded. Locked sessions and background reads write nothing, as before. Every limit is still judged from the stored value, so an idle ending moves by at most one minute.
- Failing-first, seen red (50 rows changed for 50 reads): `r10-session-write.test.mjs` (R65): fifty reads of a session one second old change at most 1 row; controls: background changes 0, a read past the grain changes 1 and stores now, a session idle past `sharedIdle` still ends. All 187 module tests green after.
- Platform check (for the redeploy, not run: I never contact a live deployment): alternate foreground and `background=1` `whoami` on biosmoke8, 90 each (`diagnosis-R10-d.md` §6): foreground p50 about 66 ms, no hop over 500 ms; measure on a quiet copy.

**Fixtures published** in `bio-plane/test/m/credentials/fixtures.mjs`, each called by `r10-fixtures.test.mjs`:
- `bootstrapVersions({storeVersion, version, memberVersions, claimed, fp})`: the real `bootstrap` arm of `credentialsOps` over a real (claimed by `claim`) world; `storeVersion: null` is a store whose environment names none (the arm answers `null`). `ok`, `version` and `memberVersions` are the public door's (`instance-setup` `bootstrapReport`), passed through as given, not made by this module. **Found, for BOB:** installer R66's lag cases "store version absent" (an older store without the key), SILENT, MISNAMED, UNBOUND and a missing member are not states this module's code can produce: the first is a store on older code, the rest are `instance-setup`'s fleet reports. Those need an `instance-setup` provider fixture (its `bootstrapReport`/`memberVersions`), or K5044's exemption of the fake network.
- `securityMapRefusal()`: `{notAnAdmin, invalidPeriod}`, the real `securityMap` refusals.

**Fixture lines not done (8, FIX-E):** seam.test.mjs:153,156,175 and fixture.mjs:37,48,55,57,58 (providers member-roster, record-core); they arrive as a CHANGE. `fixtures.mjs --list`: 8 failures, all those. **Markers added:** no `fixtures-own` and no `fixtures-generic`.

**Deferred:** nothing. **Found in other modules:** the above only.

**Tests and checks:** module `node --test` 187 + 2 new: pass, fail 0. `format` 0 failures; `architecture credentials` 0; `coverage credentials` 58 of 58; `words credentials` 0; `ownership credentials tranche/T51` 0. `impact.mjs origin/tranche/T51 HEAD` names 105 modules (the shared `index.mjs`); the users that name `last_active` or the session limits (record-core r8-bookkeeping, instance-setup t51, store-door routes) and control-plane and admission were run: tests 785, pass 785, fail 0.

Size (session_015BgLFhXk6KZEKYCGLb1LEg): test runs 6, module lines 2714

## J14 · COMPLETE

COMPLETE · fix round 10, wave A batch 1 (B11). R65 grain (cause 24 (a)) done, failing-first seen red (50 rows for 50 reads) then green; fixtures bootstrapVersions and securityMapRefusal published and tested. Record: build/jobs/T51/credentials.md J13. Module tests 187+2 pass; format, architecture, coverage (58/58), words, ownership 0 failures; users (record-core, instance-setup t51, store-door, control-plane, admission) 785/785. 8 FIX-E fixture lines remain (providers member-roster, record-core). No fixtures-own/-generic markers added. For BOB: bootstrapVersions makes only the store's part (storeVersion); ok/version/memberVersions and installer R66's SILENT/MISNAMED/UNBOUND/missing-member cases are instance-setup's, and 'store version absent' is an older store, so those need an instance-setup provider fixture or K5044's fake-network exemption. Platform check (biosmoke8 alternate foreground/background whoami, 90 each) is for the redeploy.

## J15 · CHANGE B12: record-core lines re-pointed, CREDENTIALS #26

`tranche/T51` merged. `fixture.mjs` `world()` now takes record-core from record-core's published `coreOver(db)` (real `declarePurge`, `declareTable`, `bundleInfo`; `declared` read back from `declaredTables()`), replacing the hand-built `stubCore` and the hand-made `bundles` table (lines :37, :48, :55, :57, :58); bundles are added with `addBundle` (`fixture.mjs` `project`, `t50.test.mjs`). `seam.test.mjs` takes its TABLE_DECLARED and TABLE_CLASS_UNKNOWN refusals from `tableDeclarationRefusals` (:153, :156). Not done: `seam.test.mjs:177` (member-roster's `registerPasswordSetter` refusal; its job, batch 4). `fixtures.mjs /home/user/bio credentials --list`: 1 failure, that line. No `fixtures-own`/`fixtures-generic` markers.
Module tests: 189 pass, 0 fail. format, architecture, coverage (58 of 58), words, ownership: 0 failures.
Size (session_015BgLFhXk6KZEKYCGLb1LEg): test runs 9, module lines 2714

## J16 · COMPLETE

COMPLETE · CHANGE B12 done (record: J15). record-core lines re-pointed to coreOver and tableDeclarationRefusals; fixtures list now 1 failure, seam.test.mjs:177 (member-roster, batch 4). Module tests 189/189; format, architecture, coverage 58/58, words, ownership 0 failures. No fixtures-own/-generic markers.
