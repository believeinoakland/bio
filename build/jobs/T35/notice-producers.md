# notice-producers (T35)

**Status** · session_01EqDcfJ9L6q52BBKRNNeiu9 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R13's bound. `following.policyChanges` (its R21) pages by a change-id cursor in order of the later capture, oldest first, and takes no time: there is no way to start the read 90 days back. My best reading, which I am building: the 1,000-change bound counts every change read (5 pages of 200, older ones included, so the read's cost is bounded); changes whose later capture is older than 90 days are skipped; `facts.policy_change` states `{bound: 1000, days: 90, truncated}`, `truncated` when a sixth page would follow. The cost of this reading: once a group holds more than 1,000 policy changes in total, the newest ones (the ones that matter) are cut. The fix belongs to `following`: R21 gaining a `since` (an instant) so the read starts at the window; I will use it if it is given (a REPORT carries it). If you read the bound as counting only changes inside the window (older pages read unbounded), say so and I will change one line.

R12's episode start, my reading (no answer needed unless you differ): an hour h "ended High" when credentials R45's rule holds for the 24 hours ending at its end (a `through` in hours h-23..h, or hour h unusual); read from `securityMap` in 48-hour periods (hour steps) backwards from the call, under the administrator's own `by`, bounded by the 90 days kept. The episode starts at the start of the earliest hour of the unbroken run of such hours reaching the call (the current hour counting as High when `securityLevel` answers High); key `FINDING::security-level-high::<that instant>`.

## J2 · REPORT

Three findings in other modules:
1. `queue` (R1 `classOfKind`, `bio-plane/src/queuestate.mjs`): `security-level-high` and `policy-changed-noticed` are not catalogued, and queue's mint refuses an uncatalogued kind (`queue/index.mjs` ~1080), so R12's and R13's items never reach a member until queue R1 gains both as FINDING kinds with their sentences (the requirements' Suggestions say so: "queue R1's classOfKind gains the two kinds"). queue has no T35 job; this needs one, or a share, for T35-67 to work end to end. Suggested sentences: security-level-high "your group's Civicsmith is under heightened attack: the security level is High; it opens the security screen at that period"; policy-changed-noticed "the published copy of a policy your group holds changed and no amendment was announced; noticed, never a finding".
2. `credentials` R45 `securityLevel`: on any internal failure it answers `{level: "Ordinary", levelAt: null}` (its catch; pinned by `t35-tally.test.mjs`:290). notice-producers R12 says a `securityLevel` that throws or does not answer is named in `facts.failed`, "never read as Ordinary"; with credentials masking the failure as Ordinary I cannot tell the two apart, so an attack during a failure is silently not noticed. Suggest credentials answers `{level: null, ...}` or throws on failure; I treat anything but the three levels as failed, so either works without a change here.
3. `following` R21 `policyChanges`: no way to start at an instant (see my QUESTION on R13's bound); a `since` would let the 90-day window be read without the 1,000 lifetime changes cutting the newest.

## J3 · COMPLETE

T35-67 applied (commit "T35-67 notice-producers: R12 …, R13 …; R1 reads both").

**Entries applied.**
- R12 `security-level-high` (N703; K1874 (Q5), K1875; DEC-165 (7); K1943): to each active administrator only (`membership.activeAdmins`), while `credentials.securityLevel()` answers High; episode start read back from `securityMap` in 48-hour hour-step reads under the administrator's own `by`, at most the 90 days kept (`facts.security_level: {days, truncated}`); keyed by the episode's first hour; `screen: {op: "securitymap", from, to}`; detail one sentence, counts only. Anything but Ordinary/Raised/High, a throw, or a refused map is named `credentials` in `facts.failed`, never read as Ordinary (B2).
- R13 `policy-changed-noticed` (DEC-145 (5); K1727, K1740; K1943): `following.policyChanges` paged to at most 1,000 changes read (B2's reading), the 90-day window by the later capture, `amendment_held` false only; to the active declarer (`standards.standardRead`'s `declared_by`), else the administrators, each through their own viewer's read; detail exactly DEC-145 (5)'s sentence, `<date>` the local day of `before.at` in the profile's zone (UTC when none, as following reads it). `facts.policy_change: {bound, days, truncated}`; a `standards` failure is named `standards`.
- R1: `noticeItems` runs both; `NOTICE_KINDS` gains the two FINDING kinds; uses credentials, following, standards (lazy, as the other providers).

**Deferred.** None in this module.

**Found in other modules** (J2; BOB filed them, B2): queue R1 must catalogue the two kinds before the items reach anyone (N742); credentials' `securityLevel` answers Ordinary on failure (N743); following R21 has no `since` (N741). Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (the plane's source; regenerated by BOB at layer close).

**Tests and checks.**
- `node --test bio-plane/test/m/notice-producers/`: tests 61, pass 61, fail 0 (new `security.test.mjs` R12 ×7 over the real credentials and membership; `policy.test.mjs` R13 ×9 over the real following and membership; `read.test.mjs` R1 updated).
- `node --test bio-plane/test/m/queue/` (queue reads `noticeItems`): pass 127, fail 0. No layer tests are named in the manifest.
- `format`: 133 modules, 132 requirements files; 0 failures. `architecture`: 8 product files, 39 relative imports; 0 failures. `coverage`: 13 of 13 live requirement ids named by a test; 0 failures. `ownership` (tranche/T35): 6 files changed; 0 failures.

Size (session_01EqDcfJ9L6q52BBKRNNeiu9): test runs 9, module lines 715
