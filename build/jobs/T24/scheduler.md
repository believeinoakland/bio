# scheduler (T24)

**Status** · session_01DLpPx4nFTBzCERM1X27oKi · depth 2 · WORKING · handled B2

## J1 · REPORT

Progress, and waiting on link-sweep's merge for N506.
(1) N507's share (K1200; red 8): `test/m/scheduler/consumers.test.mjs` seal test (was :161) now asserts that once the only act is sealed, network-notices' `sealWake` is null, `nextAt`/alarm null (R15); then a member act in the week under way arms the alarm at the week's end, the alarm there seals it, and the instance is idle again. Scheduler suite: 66 tests, 0 fail (red 8 cleared on this branch; pushed as a325-era commit on `job/T24/scheduler`).
(2) N502/N508 re-scan of `bio-plane/src/scheduler/` and its tests: no stale note of that kind (no legacy store, op map, dispatcher or `awaiting stamp`). The `monitoring R56` references are N506's and are re-pointed with it.
(3) N506 (R5, R10, Uses): needs link-sweep's factory and its `sweepDue`/`sweepWake`/`sweepTick` on `tranche/T24`. Waiting for your word that link-sweep has merged; then I merge `tranche/T24` and re-point `gathering-sweep`, the R9 sweep arm and the tests.

## Completion

**Entries applied** (B1 START, B2 CHANGE; `build/plan/current.md` T24 L10):
- **N506** (R5, R9, R10, Uses): `gathering-sweep` now calls link-sweep's `sweepDue`, `sweepWake` and `sweepTick(now, rank)` (its R4), reached through `linkSweepOf(ctx)` as the new `linkSweep` owner; it no longer calls monitoring's. The R9 sweep arm (promotion's `onCommitted`) asks link-sweep's `sweepWake`. Comments re-pointed from `monitoring R56` to `link-sweep R4`. Tests re-pointed to the real link-sweep in its own test world (`test/m/link-sweep/fixture.mjs`, including its `sweepDef`; monitoring's fixture is no longer imported): `consumers.test.mjs` (the three reds from monitoring's merge, at :226, :250 and :260 before), `registry.test.mjs`, `fixture.mjs` and the title of `plane.test.mjs`:206 (that red cleared by the composition). New negative control: monitoring alone brings no `gathering-sweep`, link-sweep alone brings only that consumer; the R3 test also checks that the real tick, when it does not throw, is answered as the run.
- **N507's share** (K1200, red 8): the seal test asserts the null wake once the only act is sealed (R15), then the week's-end wake with a member act in the week under way, sealed there, and idle again afterwards.
- **N502/N508 re-scan** of the module and its tests: nothing of that kind.

**Deferred:** none.

**Found in other modules:**
- **Plane bundle stale:** my change is under `bio-plane/src/`, so the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`, owned by `not_product`) is stale. Nothing regenerated.
- **Plane composition not yet done:** the plane does not compose link-sweep yet (L11). `schedulerOf`'s default owner `linkSweepOf(ctx)` creates link-sweep's instance on first use. When the plane composes link-sweep with its deps, it must do so before the scheduler's first registry read so that the composed instance is the one reached (link-sweep's K61 instance is per storage, first call wins).

**Tests and checks:**
- `node --test test/m/scheduler/`: tests 66, pass 66, fail 0.
- Whole `bio-plane/test/m`: tests 5275, pass 5256, fail 8. The same 8 fail on `origin/tranche/T24` (run in a worktree), so this branch adds none. They are within the accepted reds: affordances `catalogue.test.mjs`:524 and :903 (red 6), control-plane `families.test.mjs`:47 and `r45-routes.test.mjs`:68 (`sweeps` route, red 7), plane `compose.test.mjs`:101 and `door.test.mjs`:183 (queue-producers' `sweepConditions` through monitoring, red 7), plane `notices.test.mjs`:33 (red 9) and :140 (monitoring's sweep scope check, red 7). Red 8 is cleared here.
- Checks: format, 88 modules, 87 requirements files, 0 failures. Architecture, 9 product files, 33 relative imports, 0 failures. Coverage, 20 of 20 live requirement ids named by a test, 0 failures. Ownership, 6 files changed, 0 failures.
- Red 5: I added or changed no catalogue row, so there is no `awaiting stamp` row to list.

Size (session_01DLpPx4nFTBzCERM1X27oKi): test runs 9, module lines 429
