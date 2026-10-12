# instance-setup (T45)

**Status** · session_011YqoovvgNFrHFrgg5CJgkT · depth 2 · RUNNING until 2026-10-12T01:35:23Z (users' tests (op-declarations, answer-envelope, store-door, control-plane, plane, newgroup), mine vs tranche) · handled B3

## Completion (INSTANCE-SETUP #20)

**Entries applied (T45-44).**
- **R76** `profiles()` and `profilesSet` answer `stage_findings`: each stage of a records law of the combined view (`jurisdictions.combine`'s `records_laws`) that `action-grammar.lawStagesFindings` reports, as `{law, check: "LAW_STAGE_UNKNOWN", stage}` (the law by its `name`, the stage taken from the item checked, each stage checked on its own so no finding's text is parsed); `[]` when every stage is known or none carries any; it refuses and writes nothing; a check that throws or answers no list is `stage_findings: null` with `stage_findings_detail`.
- **R77** `declaredStakeSet({stake, by})`, op `declaredstakeset` (`by` from the query, R29): `NOT_AN_ADMIN` through `membership.notAnAdmin` for a non-administrator or a machine, then `STAKE_MALFORMED` (C-64.27, a new row in C-64, awaiting T46's stamp); trimmed text of 1–1,000 characters on one line, or `null` to clear; recorded through `record-core.setSetting("declared_stake", value, by)` (the setting name is public-read's `DECLARED_STAKE_SETTING`, imported and re-exported, one binding), then appended to this module's own `declared_stake_history` (exempt from purge, admin-only export, version chain), as K2880 confirmed (J1).
- **R11** `groupIdentity()` also answers `declared_stake: {stake, set_by, set_at}` (three nulls when never set) and `declared_stake_history` oldest first; the public projection (R10) carries neither.
- **R78** `start` registers once with `public-read.registerGroupIdentity({identity: () => groupIdentityPublic()})` (public-read's one instance on the storage, `publicReadOf(ctx)`, the plane building it first; `deps.publicRead` for tests); the outcome is reported as the start's `identity`, a refusal or throw never thrown.

**Read.** My requirements, `setup.mjs`, `setup-fleet.mjs`, `livefire.mjs`, and the tests I changed or extend (`fixture.mjs`, `group.test.mjs`, `exports.test.mjs`, the R30 test of `translations.test.mjs`) whole, by me. The remaining tests were run, not all read whole. The used modules' Provides I call into (public-read R34 and its code, action-grammar R25 and its code, record-core R25 and `setSetting`/`getSetting`, jurisdictions R7, R76 and `combine`'s `records_laws`) I read myself. The rest of the reading set (wizard-scripts and queue-producers for T45 changes to what I use; the requirements of op-declarations, store-door, control-plane, plane, stewards, answer-envelope and installer where they name my services; `BIO_Action_v0_2.md` §5 and rules 9, 11 and 21) was read in full by one helper in this session, which wrote me a cited digest (K2032, mechanics §17 (3)): no T45 change to anything I use from wizard-scripts or queue-producers.

**Flaws in my own module:** none found on reading it whole.

**Deferred:** none.

**Found in other modules (also in my REPORT):**
1. `declaredstakeset` has no spec yet: op-declarations R49 (T45-45) owes it (an administrator's act, mutating, `by` stamped, `machineClasses: []`, answered by `NOT_AN_ADMIN`; help text under R34), and op-grades R32 owes its grade. Until T45-45 the door answers `UNKNOWN_OP` for it (as rule 4 (12) already accepts for other modules' new ops).
2. plane `door.test.mjs` "R1, R5 (K1690, K1870, K2162, K2249): instance-setup's thirty-three routes…" pins the count at 33 and drives every route; with `declaredstakeset` there are 34, so it is red from my merge until plane (T45-47) re-pins it and adds the drive. It is the only difference between the users' suites on my branch and on `tranche/T45` (base 20 failures, mine 21).
3. For BOB, not this module: v0.2 rule 9 ("a group with a stake in a matter discloses it") reads as a stake per matter; R77 holds one group-wide stake and no requirement holds one per matter. Rule 21's other half (a claim resting on another group's findings shows that group's identity and stake) is for the readers of accepted findings.
No generated artifact was staled by a file I own beyond the plane bundle every merge stales (rule 4 (5)).

**Tests and checks.**
- `node --test bio-plane/test/m/instance-setup/*.test.mjs`: tests 147, pass 147, fail 0 (new `t45.test.mjs`: 12, naming R11, R28, R29, R76, R77, R78; the C-64 and op-list pins updated for C-64.27 and `declaredstakeset`).
- Users (op-declarations, answer-envelope, store-door, control-plane, plane, `migrate-released`, newgroup): mine 628 tests / 607 pass / 21 fail and 54 / 51 / 0; `tranche/T45`: 628 / 608 / 20 and 54 / 51 / 0; the one difference is item 2 above.
- `checks/format.mjs`: 153 modules, 152 requirements files; 0 failures. `checks/architecture.mjs … instance-setup`: 23 product files, 93 relative imports; 0 failures. `checks/coverage.mjs … instance-setup`: 60 of 60 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … instance-setup tranche/T45`: 0 failures.

Size (session_011YqoovvgNFrHFrgg5CJgkT): test runs 9, module lines 3447

## J1 · QUESTION

R77/R11 (declared stake). R11 answers the stake "as R77 holds it, {stake, set_by, set_at}, with its history oldest first", and R77 records it through record-core's setSetting. record-core offers only getSetting (the latest value); it has no read of a setting's who, when or earlier values (R25), and its `settings` table is record-core's own.

My reading, which I am building now: the value is recorded through setSetting("declared_stake", stake|null, by) exactly as R77 says (public-read reads it through getSetting), and beside it, in the same synchronous act and only after setSetting answers ok, this module appends `{stake, set_by, set_at}` to its own append-only table `declared_stake_history` (declared to record-core exempt from purge, admin-only export, version chain, as R28's tables). R11 answers `declared_stake: {stake, set_by, set_at}` (stake from getSetting; who and when from my latest row; all null when never set) and `declared_stake_history` oldest first from my table. No other module's table is read.

The alternative is a record-core read of a setting's history (a record-core change, layer closed), which I am not building.

Also: STAKE_MALFORMED takes C-64.27, the next free C-64 number (your START numbered none). Answer only if either reading is wrong.

## J2 · REPORT

Found outside my module (details in my record's Completion):
1. op-declarations (T45-45, its R49) and op-grades (R32) owe `declaredstakeset` a spec and a grade: an administrator's act, mutating, `by` stamped, `machineClasses: []`, answered by `NOT_AN_ADMIN`, with help text under R34. Until then the door answers `UNKNOWN_OP` for it, as rule 4 (12) accepts for other new ops.
2. plane `door.test.mjs` "R1, R5 (K1690, K1870, K2162, K2249): instance-setup's thirty-three routes…" pins 33 routes and drives each. With `declaredstakeset` there are 34, so it is red from my merge until plane (T45-47) re-pins it and adds the drive. It is the only difference between the users' suites on my branch and on tranche/T45 (607 vs 608 pass of 628; newgroup 51/54 both).
3. Yours to place: v0.2 rule 9 ("a group with a stake in a matter discloses it") reads as a stake per matter, and R77 holds one group-wide stake. Rule 21's half about another group's findings belongs to the readers of accepted findings.
