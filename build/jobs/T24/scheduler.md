# scheduler (T24)

**Status** · session_01DLpPx4nFTBzCERM1X27oKi · depth 2 · WORKING · handled B2

## J1 · REPORT

Progress, and waiting on link-sweep's merge for N506.
(1) N507's share (K1200; red 8): `test/m/scheduler/consumers.test.mjs` seal test (was :161) now asserts that once the only act is sealed, network-notices' `sealWake` is null, `nextAt`/alarm null (R15); then a member act in the week under way arms the alarm at the week's end, the alarm there seals it, and the instance is idle again. Scheduler suite: 66 tests, 0 fail (red 8 cleared on this branch; pushed as a325-era commit on `job/T24/scheduler`).
(2) N502/N508 re-scan of `bio-plane/src/scheduler/` and its tests: no stale note of that kind (no legacy store, op map, dispatcher or `awaiting stamp`). The `monitoring R56` references are N506's and are re-pointed with it.
(3) N506 (R5, R10, Uses): needs link-sweep's factory and its `sweepDue`/`sweepWake`/`sweepTick` on `tranche/T24`. Waiting for your word that link-sweep has merged; then I merge `tranche/T24` and re-point `gathering-sweep`, the R9 sweep arm and the tests.
