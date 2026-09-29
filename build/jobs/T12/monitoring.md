# monitoring (T12)

**Status** · session_017yarQQYYTzVwmWC15R4Zjd · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N314's refusal: membership has no public helper that mints `NOT_AN_ADMIN`. The code is minted today only inside membership (`#custodialBar`, `memberCaps`, `adminEndorse`, `adminRemove`, `adminResign`), and its row C-96.1 lives in legacy-checks' `CUSTODIAL_CHECKS`, its `where` naming `#custodialBar`. `isAdministrator` (R64) is public, so the test itself is no problem; the refusal is. Two readings:

(a) membership gains a one-site helper, say `notAnAdmin(by, act)`, answering `{ok:false, reason, code, check, translation, by, detail}` from C-96.1 (as R78 `noSuchProject` does), and monitoring calls it. That is a membership change (layer 2, closed this tranche; the plan says membership is unchanged), so it would be next tranche's.
(b) monitoring's `pause` refuses with `reason: "NOT_AN_ADMIN"`, the string literal at its one site, carrying C-96.1's `check` and `translation` read in place from `CUSTODIAL_CHECKS`, the way it already reads the C-48 rows from `DRIVE_CAPTURE_CHECKS`. The meaning and the sentence are membership's; the site is new.

My best reading, which I am building now: (b), with (a) routed as an N-entry so the site converges on a membership helper. I will name the added site in my record for legacy-tests' DEC-49 census.

Second, smaller point, also on my best reading: the "root of trust" admitted is `class:admin` (the ADMIN_TOKEN bearer, as the Worker stamps it) and the founder `admin` (already an administrator under R64 once the instance is claimed). Any other `class:<cls>` stamp is refused `NOT_AN_ADMIN`; today the Worker's cut admits only the admin class, so that refuses nothing reachable.

## J2 · COMPLETE

**Entries applied.**
- N313 (K372, K231): `openEnvelope` is gone from `monitoring/index.mjs`. `monitorOp` opens the Durable Object's envelope only through the `doAnswer` the control plane hands in (legacy-index already hands it, `index.mjs`:5362). A call that hands none cannot read an answer, so the store is not asked and the answer is named silent; the test pins that nothing is fetched and nothing written.
- N314 (K380, K403 = B2): R30's `pause` asks who is asking first, right after the required `by`, before the request's shape. A stamp that is neither an administrator (membership R64 `isAdministrator`, read at the act) nor the root of trust `class:admin` (new export `MONITOR_ROOT_OF_TRUST`) is refused `NOT_AN_ADMIN`, carrying `code`, C-96.1's `check` and `translation` read in place from `CUSTODIAL_CHECKS`, and `by`. Nothing is written. Other machine classes are refused too. The founder `admin` is admitted once the instance is claimed. The test covers a member (through the service and through the route's stamp, with the body's `by` ignored), an enrolled administrator, the founder, the root's credential, `nobody`, `class:daemon`, `class:member`, a revoked administrator, and an unclaimed instance. A refused resume leaves the pause standing.
- **The new NOT_AN_ADMIN site, for legacy-tests' DEC-49 census:** `bio-plane/src/monitoring/index.mjs` `pause`. It carries no REGION marker because no row's `where` claims it; a marker with no claiming row fails the guard. It converges on membership's helper under N324.
- R30's `not yet met: N314` mark is met. I leave striking it to you (B2), and I reverted my own strike.

**Tests and checks.**
- `node --test test/m/monitoring/*.test.mjs`: tests 58, pass 52, fail 0, todo 6 (R17, R18, R28, R29, R31, R34's telling).
- `civicos-ui/check-refusal-codes.mjs`: 18 failures on this branch, and its FAIL lines are identical to `tranche/T12` without my change, so the change adds none. The existing failures are other modules' (arm G `MINT_EXHAUSTED`, `NOT_A_DISPOSITION`, `NOT_FOUND`; floor slack; the unclaimed `is-listener-registration` marker).
- Legacy suites: `plane-envelope` 1/0; `d270-refusal-truth` 1/0; `monitor-cadence` 66 pass, 5 fail. See the report below.
- Process checks: format 0 failures; architecture 0 failures; coverage 45 of 45 live ids, 0 failures; ownership 0 failures (4 files, no legacy line added).

**Found in other modules (REPORT).**
1. legacy-tests: `test/monitor-cadence.test.mjs`:440–451 pauses and resumes with the stamp `actor=admin:mc`, which is not an administrator, so N314 now refuses it and 5 arms fail ("the pause is taken and stated" and the 4 after it). Re-anchor the stamp to `class:admin` (what the Worker stamps for the ADMIN_TOKEN bearer) or to an enrolled administrator's id.
2. not_product: `bio-plane/dist/bio-plane.bundled.mjs` is stale: it still carries `openEnvelope` (lines ~100857, 100891). It is regenerated at layer close, not by me.
3. civicos-ui and affordances: no hit for `openEnvelope`. `NOT_AN_ADMIN` is already named in `civicos-ui/check-refusal-codes.mjs` and `civicos-ui/test/custodial-acts.test.mjs` for membership's sites, and the same translation holds here. affordances' `monitorpause` rows (`affordances.mjs`:858, 2213) still say "an administrator's setting", which stays true. legacy-index's layer-11 widening (N314) will surface the refusal to member sessions.
4. No check row added or changed: nothing for promotion R34 to stamp (N318).

Deferred: none.

Size (session_017yarQQYYTzVwmWC15R4Zjd): test runs 4, module lines 2332
