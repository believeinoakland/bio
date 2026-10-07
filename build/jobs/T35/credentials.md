# credentials (T35)

**Status** · session_018Ck3Fpjqfuff67UQ1EwxJB · depth 2 · WORKING · handled B1

## Completion

**Entries applied (T35-15; K1934).** Code `bio-plane/src/credentials/` 1,733 → 2,504 lines.
- R1, R4, R38 (F3): `claim` (as role `admin`), `login` and `recover` share one sign-in window per source and per role, using two buckets: `prev × (1 − elapsed/W) + cur`, with W = 10 minutes and a bound of 10 for each. It is asked before any password, code or claim is judged, and it answers one `SIGN_IN_PAUSED` (C-96.39) for every case, with `stated` and one PBKDF2 derivation's cost. A refusal counts toward both windows and is the tally's `signin`. A pause counts toward neither window and is the tally's `rate`. A success counts toward neither and empties neither. Sources and roles are keyed by HMAC-SHA-256 under the module's own key (`security_key`), so no window row names an address or a role. A call with no source counts under one shared source. Exported: `SIGN_IN_WINDOW`, `SIGN_IN_STATED`.
- R39 (F14): `signOut` and `signOutEverywhere` end sessions together with the ask grants minted under them, and never touch a standing question's grant. `NOT_SIGNED_IN` (C-96.40) answers an unknown, expired or ended token, ending nothing.
- R40 (F13): sessions are held as `token_sha` only, and ask grants name their session by its digest. A store held as tokens is carried over once at boot: each live row is copied under its token's digest, every grant is re-pointed, and the old table is dropped. Sessions and grants stay live.
- R41 (F12): the derived password hash and recovery codes are compared as SHA-256 digests in constant time.
- R12, R15, R42 (F15): `expiresInDays` takes a whole number from 1 to 365 and defaults to 90; anything else is `AI_CREDENTIAL_BAD_EXPIRY` (C-29.28). Every answer that shows a credential carries `expiresAt` and `expired`. Credentials minted before this were given 90 days from the migration (column `expires_at`).
- R43: `subscriptionConnected` (in-plane only) records the fact and its instant. A call carrying any field but `member` is refused `SUBSCRIPTION_LOGIN_REFUSED` (C-29.29). `subscriptionDisconnect` is the member's own act. `accountReferenceState` answers `subscription: {connected, since}`. In T35, `accountFor` and the ask grant do not read it.
- R44 (N703, DEC-166): `securityCount` (in-plane) holds counts only, by kind, hour and country, and drops counts older than 90 days. This module's own `signin` and `rate` counts are held without a place: they wait in `security_pending` under a keyed role digest and are placed after an hour with no success under that role, or dropped if a success comes first. A success within an hour of a pause under its role counts `through`, which is never placed. An unknown kind is `SECURITY_KIND_UNKNOWN` (C-96.42). A failed write is dropped silently and never changes the refusal's answer.
- R45 (DEC-165): `securityMap` is for administrators. A bad period is refused `SECURITY_PERIOD_INVALID` (C-96.43) with `what` naming the fault. Steps are hour, six-hours or day. The usual for an hour is the median of the same hour over the 28 previous days. The answer carries totals and busiest bucket, countries plus unplaced (an hour-old waiting place is read as placed, writing nothing), the note, and the level at K1934's threshold. `securityLevel()` gives the same level over the last 24 hours.
- R46, R47 (K1888): `recoveryCodesIssue` gives 10 codes of 100 bits each, kept as SHA-256 only, for the issuer's own role; issuing again spends the earlier unspent codes. `recoveryCodesState` reports what the caller holds. `recover` checks, in order: the window, `PASSWORD_TOO_SHORT`, then a single `RECOVERY_REFUSED` (C-96.41) at one cost. The code is checked again inside the one act that sets the password, spends the code, ends the role's sessions and records the recovery.
- R16: revocation also spends the member's unspent recovery codes and clears their connected subscription. R30: seven new tables are declared, all never exported and exempt from purge; `subscription_connections` is owner-sighted. R35: the code is unchanged; the test pins the answer's shape. R37: `groupKeySwitches()`.
- R48 (DEC-149): all 17 sweep rows are applied. Six rows move (C-63.1, .2, C-29.1, .3, .5, .22) and await promotion's stamp, as do the seven new rows (C-29.28, .29, C-96.39–.43).
- New routes in `credentialsOps`: `signout`, `signouteverywhere` (from the `session` stamp), `securitymap`, `recoverycodesissue`, `recoverycodesstate`, `recover`, `subscriptiondisconnect`. `login`, `claim` and `recover` read `source` and `country` from the query, after the body.

**Deferred.** None. One limit in my own module: a waiting place an hour old is dropped at the module's next sign-in, claim, recovery, count or `session` read, not on a timer. The module has no alarm, and `session` runs on every request.

**Found in other modules (also in my REPORT to BOB).**
1. plane `test/m/plane/ask.test.mjs` (6 tests) writes a raw session into `sessions (token, …)`. Under R40 that column no longer exists. The world it builds should sign in through `credentials.login`, or insert `token_sha` = SHA-256 of its token. This is plane's job; the test is green on the base.
2. op-declarations `t33.test.mjs`:180 (R19, R6) says "credentials: signout has no spec". The seven new routes have no specs until T35-70 declares them (`recover` without a credential). This is red from my merge until T35-70.
3. control-plane `catalogue-end.test.mjs` (R43, R22) pins each row's translation digest from before R43. The DEC-149 rewording of C-29.3 (and the other five) trips it. This is the same cause as the row census (accepted red 2): the snapshot moves when rows are stamped (`rows-before-r43.json` is control-plane's).
4. Callers' obligations under T35 (admission T35-71): until admission passes `source`, every sign-in counts under the one shared source, so 10 refused attempts in 10 minutes from anyone pause all sign-ins for a few minutes.
5. Generated artifact: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) embeds credentials and is now stale (§14). It is regenerated at L2's close (plan rule 7).

**Tests and checks.**
- `node --test bio-plane/test/m/credentials/`: 108 pass, 0 fail (42 new across `t35-signin`, `t35-tally` and `t35-misc`; existing tests updated to digests and the new fields).
- Users of credentials (28 modules, 33 test paths), my branch against `origin/tranche/T35`: 30 paths identical. op-declarations has 3 failures, 2 of them inherited red 9. control-plane has 1 failure (item 3 above). plane has 6 failures (item 1).
- `format.mjs`: 0 failures. `architecture.mjs credentials`: 0 failures. `coverage.mjs credentials`: 47 of 47 ids, 0 failures. `ownership.mjs credentials tranche/T35`: 11 files, 0 failures.

Size (session_018Ck3Fpjqfuff67UQ1EwxJB): test runs 12, module lines 2504

## J1 · REPORT

Found in other modules by my merge (record, Completion, items 1–5): (1) plane ask.test.mjs ×6 writes raw tokens into sessions(token); under R40 the column is token_sha. Plane should sign in through login or insert sha256 of its token. (2) op-declarations t33.test.mjs:180: my seven new routes (signout, signouteverywhere, securitymap, recoverycodesissue, recoverycodesstate, recover, subscriptiondisconnect) have no spec until T35-70. (3) control-plane catalogue-end.test.mjs pins row translations; DEC-149's six re-worded rows trip it (row-census cause, red 2). (4) Until admission stamps source (T35-71), all sign-ins share one window source. (5) The plane bundle is stale (rule 7).

## J2 · COMPLETE

T35-15 done on job/T35/credentials: R1, R4, R12, R15, R16, R30, R35, R37, R38–R48 met and tested; 17 DEC-149 rows applied. Module tests 108/108. Format, architecture and ownership: 0 failures. Coverage: 47/47. Users: new reds only plane ask.test ×6, op-declarations t33:180 and control-plane catalogue-end (REPORT). Record: build/jobs/T35/credentials.md, Completion.
