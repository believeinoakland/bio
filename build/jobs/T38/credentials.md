# credentials (T38)

**Status** · session_011Sz476u5szTBqKpR6HExC4 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R27 (and R32) for a member served by a sign-in (R35's new `signin` branch), as B1 asks.

My reading: R27 mints for such a member. R27 refuses `NO_ACCOUNT` only for "a member whom no account serves (R35 answers `NO_ACCOUNT`)", and from T38 R35 serves a connected member (R43) with `{kind: "signin", level: "member", member}`; an ask grant is what lets that member's ask read the record, so refusing it would leave the sign-in serving nothing. The notice (R36, `GROUP_KEY_NOTICE_DUE`) is not asked, since the group key does not serve them. The order stays R35's: own `apikey` reference, then the sign-in, then the group key. So R27's text would read, in its NO_ACCOUNT sentence: "(R35 answers `NO_ACCOUNT`: no reference of their own, not connected through their subscription (R43), and the group key not held or off)".

R32, the same reading carried through: a sign-in serves a standing question too (R35 serves "asks, runs and standing questions"), but no `standing` switch governs it: R25's switches belong to the member's reference and are set only while one is held (R25 answers `NO_ACCOUNT` without one), and R37's govern only the group key. So a member served by a sign-in is refused `STANDING_SWITCH_OFF` ("the switch that governs that member's account ... off"), minting nothing, until a requirement gives the sign-in switches of its own. Its `suggestions` likewise reads off (`agent-worker`'s carrying of it is that module's).

Building on this reading now; R27/R32 code changes held until your answer. Migration detail (mine, P17, recorded in my record): the `subscription` rows are deleted from `account_references` and, as R22's removal does, any standing grant minted for those members ends with them.

## J2 · REPORT

Row id collision in membership's new R121 (K2275): it gives `noSuchMember`'s `NO_SUCH_MEMBER` row the id C-96.39, which is already this module's `SIGN_IN_PAUSED` row (credentials R38, `checks.mjs` `SIGN_IN_CHECKS.SIGN_IN_PAUSED`, `check: 'C-96.39'`, since T35; also named in `bio-plane/src/gate.mjs`:748's arrival list). Two rows under one id breaks one-id-per-row (my `t35-misc` and `rows-ops` tests hold the module's own ids unique; the row census would hold the catalogue's). C-96's highest in this module is C-96.46 (T37's R3 rows), so the next free number is C-96.47 unless another module took it. R121's text is yours to correct, and MEMBERSHIP #29 builds the row; nothing here changes.

Status: R22, R35 (sign-in branch), the migration, R43's last sentence, R27 and R32 (per B2) are built and tested (135 of 135 in my tests). The `NO_SUCH_MEMBER` call (N793) waits on the helper merging; my four whole-object assertions on that refusal (keys.test 33, 34, 79; own-keys 53) move to R121's shape when it lands.

## J3 · COMPLETE

T38-5 complete, through B3 (tranche merged at `e911d99189`).

**Entries applied.**
- (N708's remainder; R22) `ACCOUNT_KINDS` is `["apikey"]`; `subscription` is refused `UNKNOWN_ACCOUNT_KIND` after R22's own-act refusals, writing nothing. C-29.17's and C-29.20's (`NO_ACCOUNT`) translations are re-worded to point to signing in through Claude Code, never a token. Both rows await promotion's stamp (T38-6). `#noAccount`'s detail now names the subscription.
- (N785's share; R35, R43) `accountFor` answers, after the member's own reference and before the group key, `{ok: true, kind: "signin", level: "member", member}` for a connected member (`subscription_connections`). That answer carries no secret, asks for no notice, and is preceded by keep-away as before.
- (R35, R23) A reference of a retired kind is never answered: every read of `account_references` goes through `#reference`, which takes only `ACCOUNT_KINDS`. `migrate` removes such references and the standing grants minted for their members (`#retiredReferences`, idempotent, after the tables exist). State then shows none.
- (R27, R32; B2, K2275) R27 grants a sign-in member, with no notice asked. R32 refuses their standing questions `STANDING_SWITCH_OFF`, its detail naming the sign-in's missing switch (`#servingAccount` gains the sign-in at level `member`, both switches off).
- (N793, rule 9; B3) `#signerMemberBar` answers `NO_SUCH_MEMBER` through `membership.noSuchMember` (R121, C-96.47). The four whole-object assertions (keys.test 33, 34, 79; own-keys 53) now hold R121's shape.

**Deferred.** None.

**Requirement text for BOB.** R27's `NO_ACCOUNT` sentence and R32 per B2. My Uses line (`membership`) does not yet name `noSuchMember` (R121). Both are yours to word.

**Found in another module (REPORT).** `ai-runs`: `bio-plane/test/m/ai-runs/scheduler.test.mjs`:171–175 ("R18, R52 …", test at :123) sets a `subscription` reference through `credentials.accountReferenceSet` and expects it carried as `kind: "subscription"`. Since this merge it fails with `UNKNOWN_ACCOUNT_KIND`, as R22 now requires. It is red on my branch and green on `tranche/T38` @ `e911d99189`, and it is the only such test. Its fix is ai-runs' (drop the case, or carry the `signin` account), with agent-model T38-9 and agent-worker T38-10 in L6. It needs naming as an accepted red until then. No generated artifact is staled by this module (no bundle takes credentials' source).

**Reading (mechanics §17).** The set was over 300 KB (requirements 46 KB, code 173 KB, tests 289 KB), so step (3) applied.
- Read whole myself: `build/requirements/credentials.md`; layer 2's row of `build/layers.md`; the Purpose and the named services of membership (R64, R68, R79, R81, R84, R86, R92, R94, R95 and, after B2, R121), record-core (R21, R32) and record-grammar (R13, R15); plan T38-5 and rule 9 (with rules 1–9); K1819, K2134, K2200, K2246 and K231.
- Read whole myself, code: `index.mjs` 1–1659 and 2060–2178, `schema.mjs`, `checks.mjs`.
- Read whole myself, tests: `fixture.mjs`, account, grant, group-key, rows-ops, seam, t35-misc and t36.
- One worker read the rest whole (`index.mjs` 1660–2075; ai, converts, keyed, keys, own-keys, signin, status-at, t35-signin, t35-tally, t37). It wrote a summary of about 7 KB, each statement citing file and line. It flagged the four `NO_SUCH_MEMBER` whole-object assertions and the two hand-built old stores (status-at:153, t35-signin:228) that run `migrate` twice. Both mattered and were handled. Nothing it left out mattered.

**Tests and checks.**
- credentials, `node --test bio-plane/test/m/credentials/*.test.mjs`: `tests 135, pass 135, fail 0` (t38.test.mjs is new: R22, R35, R43, R23's migration, R27/R32).
- Every module using credentials, 432 test files, run on my head and on `tranche/T38` @ `e911d99189`. The base has 74 failing test lines in 20 files (the inherited reds). My head has those same 74 plus the one ai-runs test above, and nothing fails only on the base.
- `node checks/format.mjs`: 0 failures (137 modules).
- `architecture credentials`: 0 failures.
- `coverage credentials`: 52 of 52 live ids named, 0 failures.
- `ownership credentials tranche/T38`: 0 failures.

Size (session_011Sz476u5szTBqKpR6HExC4): test runs 12, module lines 2834
