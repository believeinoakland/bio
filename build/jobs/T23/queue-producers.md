# queue-producers (T23)

**Status** · session_01VWLZGzfGaCwu5Hyy2jW2Gc · depth 2 · RUNNING until 2026-10-02T10:57:03Z (node --test bio-plane/test/m/) · handled B1

## J1 · REPORT

Reds in the users' suites and a stale artifact, from this job (06757da646).

1. **queue (`test/m/queue/`): 20 red, 18 of them new and caused by queue's stand-ins, not by queue's code.** R26 makes `feedItems` call `monitoring.sweepConditions` (monitoring R63). Queue's fake `monitoring` (`bio-plane/test/m/queue/world.mjs`:129) has no `sweepConditions`, so every feed read in queue's tests throws `this[#monitoring].sweepConditions is not a function`. The 18 are `feed.test.mjs` R7, R8 (×3), R11, R12/R13 (:184), R14/R31, R16, R32/R33, R39, R40, R30, R6/R8, `peritem` R8, `queue-state` R21/R30/R40, `d125-findingmute` R14/R20, and the two caller's-fakes tests (R8 with R12 for K899 (7); R8 with R15–R21 for K728/K921). The other 2 are accepted red 13 (`catalogue.test.mjs`:34, :116). I checked a scratch copy with `sweepConditions: () => ({ ok: true, conditions: [] })` added to that fake and did not commit it: 90 pass and 3 fail, namely red 13's two and `feed.test.mjs`:206, the `publication: { exportLog }` stand-in you named. **Queue's job needs to:** add `sweepConditions` to its monitoring fake; move `exportLog` to `corpusExport: { exportLog }` (`world.mjs`:124, `feed.test.mjs`:206); and add `"corpusExport"` and `"networkNotices"` to `Queue.PRODUCER_DEPS` (`queue/index.mjs`:102) so a caller's fakes reach the producers. Without `networkNotices` there, queue's tests use the host's real network-notices instance. That worked in the scratch run.
2. **control-plane: 114 of 116.** The 2 reds are `families.test.mjs` R22 (K1150, until control-plane's merge) and `inbox-door.test.mjs` R36 (red 9).
3. **plane: 36 of 36.**
4. **Whole `bio-plane/test/m`: 5191 tests, 5158 pass, 22 fail.** The 22 are the 20 queue reds in (1) and the 2 control-plane reds in (2). No other red.
5. **Generated artifact.** My change under `bio-plane/src/queue-producers/` makes the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) stale. I regenerated nothing.
6. **Requirements (yours to word).** Uses line `build/requirements/queue-producers.md`:103 can drop "reached through publication's `exportlog` delegate until N483". Add `corpus-export`: `exportLog` (its R2), `EXPORT_LOG_LIMIT_DEFAULT`. The R8, R26 and R27 marks `*(not yet met: T23 …)*` can be struck. publication's re-export of `EXPORT_LOG_LIMIT_DEFAULT` is no longer imported by this module (N501).
