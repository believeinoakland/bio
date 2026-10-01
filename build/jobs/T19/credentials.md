# credentials (T19)

**Status** · session_01DykXv9jATJADcFBDEepSZh · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on; each is detail, so I carry on with them unless you say otherwise.

1. **C-96.8 `BAD_KEY` is mine.** It is minted only in `signerAdd`'s `is-signer-key-shape` region (and relayed by R9). I copy the row into `credentials/checks.mjs` with its id and words, `where` naming `src/credentials/index.mjs signerAdd > is-signer-key-shape`, beside C-96.15–.17 and C-63, C-29. So membership's copy of `CUSTODIAL_CHECKS` (✱, its families) should leave `BAD_KEY` out, or C-96.8 is held twice.
2. **R18 during the copy.** Membership's `migrate` declares `credentials`, `sessions`, `bootstrap`, `signers`, `ai_credentials` exempt today, and record-core refuses a second declaration (`TABLE_DECLARED`). My `declareTables` declares the five exempt; while record-core answers `TABLE_DECLARED` naming `membership` for them, it reads them as held exempt (R18 holds either way) and does not throw; once membership's deletion drops them from `MEMBERSHIP_EXEMPT_TABLES`, my declaration is the one that stands. Membership's deletion must drop them (else purge exemption is still right, but held by the wrong module).
3. **`members` only through membership's services (R8, R11).** `signerList` and `attestingKeys` no longer join `members` in SQL: each key's member standing is `membership.memberFacts` (R68), and `attests` is one JS predicate (key `active` and member `active`) used by both. So `SIGNER_ATTESTS` is no longer a SQL fragment in credentials; `Store.SIGNER_ATTESTS` (store.mjs:1559) stays pointing at membership's constant until membership's deletion removes it (its last reader is the old suite `signer-enrolment.test.mjs`, not run, K619).

## J2 · REPORT

Found in reading, for membership's seam (not mine to change):

- **`enroll` (membership R16) sets the member's password** by `this.setPassword(...)`, a write to `credentials`' table. No seam in membership's or my requirements covers it once the table is mine. Options: (a) credentials registers a password setter with membership at start (as R17's `registerClaimed`), membership R16 calling it inside `enroll`; (b) the control plane's `enroll` relay calls `credentials.setPassword` after membership's answer (not one act). I recommend (a), worded as a new membership R and a credentials R; until then my tests set members' passwords through my own `setPassword` after enrolment, so they hold under either.
- `memberSet` and `adminRemove` also delete sessions and revoke signers directly (R8, R20); my R16 listener now does both on `onRevoked`, so membership's deletion drops those two statements and `#claimed`'s read of `credentials` (R64, R86 through R94).
