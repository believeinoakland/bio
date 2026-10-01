# credentials (T19)

**Status** · session_01DykXv9jATJADcFBDEepSZh · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Three readings I am building on; each is detail, so I carry on with them unless you say otherwise.

1. **C-96.8 `BAD_KEY` is mine.** It is minted only in `signerAdd`'s `is-signer-key-shape` region (and relayed by R9). I copy the row into `credentials/checks.mjs` with its id and words, `where` naming `src/credentials/index.mjs signerAdd > is-signer-key-shape`, beside C-96.15–.17 and C-63, C-29. So membership's copy of `CUSTODIAL_CHECKS` (✱, its families) should leave `BAD_KEY` out, or C-96.8 is held twice.
2. **R18 during the copy.** Membership's `migrate` declares `credentials`, `sessions`, `bootstrap`, `signers`, `ai_credentials` exempt today, and record-core refuses a second declaration (`TABLE_DECLARED`). My `declareTables` declares the five exempt; while record-core answers `TABLE_DECLARED` naming `membership` for them, it reads them as held exempt (R18 holds either way) and does not throw; once membership's deletion drops them from `MEMBERSHIP_EXEMPT_TABLES`, my declaration is the one that stands. Membership's deletion must drop them (else purge exemption is still right, but held by the wrong module).
3. **`members` only through membership's services (R8, R11).** `signerList` and `attestingKeys` no longer join `members` in SQL: each key's member standing is `membership.memberFacts` (R68), and `attests` is one JS predicate (key `active` and member `active`) used by both. So `SIGNER_ATTESTS` is no longer a SQL fragment in credentials; `Store.SIGNER_ATTESTS` (store.mjs:1559) stays pointing at membership's constant until membership's deletion removes it (its last reader is the old suite `signer-enrolment.test.mjs`, not run, K619).

## J2 · REPORT

Found in reading, for membership's seam (not mine to change):

- **`enroll` (membership R16) sets the member's password** by `this.setPassword(...)`, a write to `credentials`' table. No seam in membership's or my requirements covers it once the table is mine. Options: (a) credentials registers a password setter with membership at start (as R17's `registerClaimed`), membership R16 calling it inside `enroll`; (b) the control plane's `enroll` relay calls `credentials.setPassword` after membership's answer (not one act). I recommend (a), worded as a new membership R and a credentials R; until then my tests set members' passwords through my own `setPassword` after enrolment, so they hold under either.
- `memberSet` and `adminRemove` also delete sessions and revoke signers directly (R8, R20); my R16 listener now does both on `onRevoked`, so membership's deletion drops those two statements and `#claimed`'s read of `credentials` (R64, R86 through R94).

## J3 · REPORT

The copy is built and pushed (`job/T19/credentials` @ 633280d85f), against membership's seam as worded (R92 `sessionRights`, R94 `registerClaimed`), which is not on `tranche/T19` yet. **Do not merge it before membership's seam:** `credentialsOf` registers with `membership.registerClaimed` at start, and the store's `migrate` now builds credentials, so without the seam the store's boot throws.

- `bio-plane/src/credentials/` (index 590 lines, schema 115, checks 112): R1–R19; reads `members` only through `memberFacts`, `sessionRights`, `activeAdmins`, `isAdministrator`, `notAnAdmin`; `credentialsOps` (the 12 routes); rows C-63, C-29.1–.5/.11, C-96.8, C-96.15–.17 (J1's reading 1).
- `test/m/credentials/` 7 files, 32 tests: every R1–R19 named; converts `signer-enrolment` and `aicredential` (my shares). With membership's seam shimmed locally (not committed) 32/32 pass; I re-run unshimmed once the seam merges.
- Legacy-store (§12.2): import, `credentialsOf(this.ctx).migrate()` after membership's, `...credentialsOps(...)` after `membershipOps` in `routes`, the 12 delegates and `LOGIN_REFUSAL_DETAIL` re-pointed; +16/−18 (blank lines removed). `Store.SIGNER_ATTESTS` left on membership (J1, 3).
- Checks: format 0, architecture 0, coverage 19/19, ownership 0.
- ✱ deletion: `SIGNER_ENROLMENT_CHECKS` can go from the catalogue once membership's deletion drops its imports (`membership/index.mjs`, `t16-own-keys.test.mjs`). `AI_CREDENTIAL_CHECKS` is also imported by the old suite `test/aicredential.test.mjs`:47, so per K635 its deletion waits for the release unless you rule the old suite's import may be cut (it is not run, K619).

Next: on your word that the seam merged, I merge `tranche/T19`, run my tests and legacy-store's unshimmed, and complete.

## Completion (CREDENTIALS #1)

**Entries applied** (B1 START, B2 ANSWER K774, B3 CHANGE K776; `current.md` layer 2, credentials):
- `bio-plane/src/credentials/` new: `index.mjs` (R1–R20), `schema.mjs` (`credentials`, `sessions`, `bootstrap`, `signers`, `ai_credentials`, their additive columns; a `signers(member_id)` index for R16's cascade), `checks.mjs` (✱ `SIGNER_ENROLMENT_CHECKS` C-63, `AI_CREDENTIAL_CHECKS` C-29.1–.5/.11, and `CREDENTIALS_CHECKS` C-96.8, C-96.15–.17, `where`s naming this module; K774 (1)). Copied from `membership/index.mjs` and `schema.mjs` without change of meaning; `members` read only through membership's `memberFacts`, `sessionRights`, `activeAdmins`, `isAdministrator`, `notAnAdmin` (K774 (3): `attests` is one JS predicate over the key's and the member's status, used by `signerList` and `attestingKeys`). `credentialsOf(ctx)` starts once: `onRevoked` (R16), `registerClaimed` (R17), `registerPasswordSetter` when membership offers it (R20). R18 declares each table exempt, tolerating membership's declaration of the same tables until its deletion drops them (K774 (2)). `credentialsOps`: the 12 routes.
- Legacy-store (§12.2): import; `credentialsOf(this.ctx).migrate()` after membership's; `...credentialsOps(...)` after `membershipOps`; the 12 delegates and `LOGIN_REFUSAL_DETAIL` re-pointed; +16/−18.
- Converts: `signer-enrolment` (`converts.test.mjs`), `aicredential` (`ai.test.mjs` R12, R15).

**Requirement marks met, for BOB to strike** (I write no requirements file): R1–R19, and R20 on credentials' side (the setter registered and tested through a membership offering R95; the real-membership arm of its test runs once membership's R95 lands).

**Deferred:** none of my module's. ✱ deletion from the catalogue is not done here: `SIGNER_ENROLMENT_CHECKS` can go once membership's deletion drops its two imports; `AI_CREDENTIAL_CHECKS` is also imported by the old suite `test/aicredential.test.mjs`:47 (K635 holds that deletion unless BOB rules otherwise).

**Found in other modules:**
- control-plane: `test/m/control-plane/families.test.mjs` R22 (CHECK_FAMILIES total) turns red with this module, green on `tranche/T19`: control-plane's `CHECK_FAMILIES` lacks `credentials/checks.mjs`' `AI_CREDENTIAL_CHECKS`, `CREDENTIALS_CHECKS`, `SIGNER_ENROLMENT_CHECKS` (control-plane's change, L11, or accepted red by name).
- membership: its deletion should drop `BAD_KEY` from its copy of `CUSTODIAL_CHECKS`, the five tables from `MEMBERSHIP_EXEMPT_TABLES`, its own session/signer cascade in `memberSet`/`adminRemove`, `#claimed`'s interim read of `credentials`, and `Store.SIGNER_ATTESTS`' reader; R95's setter is asked `{role, password}` and answers a promise of `{ok, role}` (my reading).
- Red on `tranche/T19` too, not mine: membership `module-order` R83 and R79 order (rule 8), promotion `registry.test.mjs` R39/R45/R46 (MODULE_ORDER), query-language five tests.

**Tests and checks run:** `node --test test/m/credentials/` 33 pass, 0 fail; `test/m/legacy-store/` 4 pass, 0 fail; `test/m/membership/` 137 pass, 2 fail (R83, R79: identical without this change); whole `test/m/` 4336 pass, 9 fail, 20 todo (the 9: families R22 above, the 8 listed as red on the tranche). Checks: format 0 failures (87 modules); architecture 0 (11 files, 27 imports); coverage 20 of 20; ownership 0 (legacy-store +16/−18, legacy-checks 0).

Size (session_01DykXv9jATJADcFBDEepSZh): test runs 9, module lines 918

## J4 · COMPLETE

Complete: job/T19/credentials @ 4975c29b15, ready to merge early. R1–R20 built (R20 on my side; its real-membership arm runs once membership's R95 lands); 33/33 module tests; legacy-store 4/4; checks 0 failures (coverage 20/20, ownership legacy-store +16/−18). One red I cause elsewhere: control-plane families.test R22, CHECK_FAMILIES lacks credentials' three families (control-plane's, L11, or accept by name). Marks to strike, membership deletion notes and the ✱ deletion's K635 hold: see my record's Completion.
