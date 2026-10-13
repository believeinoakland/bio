# monitoring (T47)

**Status** · session_01EarMHYuoFos6rEeZwyQ2BR · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied.** T47-45 (N969): R74, `monitorSet` (`op=monitorset`), a member's served act writing a bundle's `monitoring.enabled` and, when given, `monitoring.frequency` (`bio-plane/src/monitoring/index.mjs`), with its route in `monitoringOps` (author and viewer the control plane's query stamps, never the body's). Refusals in R74's order as re-worded by B2 (K3135): MACHINE_CANNOT_SET_MONITORING (C-18.20), R1's required-argument refusal, R1's `ABSENT` (sight through `membership.inSight`, absent and unseen identical), MONITOR_SET_REFUSED (C-18.21, naming `field`), R1's NO_LOCATOR (only with `enabled: true`), the `{ok: true, existed: true}` no-op, then one promotion authored and stamped by the member (`actorIdentity`, `actorViewer`, `actorMemberId`; never `writer: mechanical`), changing only `monitoring.enabled`, `monitoring.frequency` when given and `last_updated`, plus one Session Log entry, every other file carried; promotion's refusal relayed as given. A document with no `monitoring` block gains one. C-18.20 and C-18.21 are new rows in `MONITOR_SET_CHECKS` (`checks.mjs`), in `MONITORING_CHECKS`, with BOB's draft translations verbatim, awaiting T48's stamp. No new Uses.

**Reading.** Read whole: `build/requirements/monitoring.md` (before and after B2's re-wording), my module's code (`index.mjs`, `checks.mjs`, `schema.mjs`), the test fixture and `invariants.test.mjs`; promotion's `promote` contract (R1–R20, its "For callers" stamps) and its sight and authority code at the write, the services my change relies on. How the set was read (§17): per B1, my requirements and code whole; of used modules only the services this change calls (promotion's `promote`, membership's `inSight`); the remaining tests (`tick`, `cadence` and others) were not changed and were run, not read, so no helper digest was needed. No flaw found in the code read beyond what this entry touched.

**Deferred.** None.

**Found in other modules.** (1) `plane`'s `test/m/plane/sweep.test.mjs` (R5) requires `addressfrequencyset` to be the last op of monitoring's route map; I placed `monitorset` before it, so nothing outside this module changed. (2) Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) bundles monitoring's source; BOB regenerates it at layer close (§14). (3) R74's op needs `op-declarations`' spec (T47-53) and `control-plane`'s routing and stamps (`author`, `viewer`) to reach this route; this module serves it as `monitorset` in `monitoringOps`.

**Tests and checks.**
- `node --test test/m/monitoring/ test/m/plane/sweep.test.mjs`: tests 150, pass 150, fail 0, skipped 0, todo 0 (R74's eight tests in `monitorset.test.mjs`; R42's row table updated in `invariants.test.mjs`).
- Users of monitoring (following, link-sweep, scheduler, affordances, machinery-producers, queue-producers, answer-envelope, control-plane, plane, `test/system/migrate-released.test.mjs`): before my change 1075 tests, 30 fail (inherited, none monitoring's); with it, 31, the extra being plane's R5 route-order test above, fixed by the route order, now passing; the other 30 are the same failures.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio monitoring`: 20 product files, 0 failures. `checks/coverage.mjs bio monitoring`: 61 of 61 live ids named, 0 failures. `checks/ownership.mjs bio monitoring tranche/T47`: 5 files, 0 failures. `checks/run.mjs bio`: format 0, architecture 0 failures (3124 files), channels 0, coverage 26 failures, all other modules' (screens-*, signin-door, setup-words, tasks, wizard-scripts and others), none monitoring's.

Size (session_01EarMHYuoFos6rEeZwyQ2BR): test runs 9, module lines 3824

## J1 · QUESTION

R74's refusal order puts "an author who may not revise the bundle (promotion's refusal, answered as promotion gives it)" before MONITOR_SET_REFUSED, NO_LOCATOR and the `existed` answer. Promotion's refusal is only known at the write, and promotion offers no dry run; asking membership's `projectAuthority` / `positionalMember` myself would add services outside my Uses and still not cover refusals other modules register on promote.

My best reading, which I am building: R74 asks sight first (`membership.inSight`, R1's `ABSENT`, identically — the same condition as promotion's R20 for a member revision), then validates `enabled`/`frequency` (MONITOR_SET_REFUSED), then NO_LOCATOR, then the `existed` no-op, then promotes as the member (actorIdentity/actorViewer/actorMemberId stamped) and relays promotion's refusal as given. So a malformed or no-op request from an author whose write promotion would refuse for another reason answers MONITOR_SET_REFUSED or `{ok:true, existed:true}` (both write nothing) rather than promotion's refusal. If you want the stated order strictly, say how permission is to be read before the write (which service, from which module) and I will change it.

## J2 · COMPLETE

T47-45 applied: R74 monitorSet (op=monitorset) in the order re-worded by B2 (K3135), with C-18.20 and C-18.21 in this module's table. Module tests 150/150 (with plane's sweep test). Users' tests: the same 30 inherited failures as before my change, none added. Format, architecture, coverage and ownership: 0 failures for monitoring. Stale: bio-plane/dist/bio-plane.bundled.mjs (yours at layer close). R74 needs op-declarations' spec and control-plane's routing to reach the route. Details in my record's Completion.
