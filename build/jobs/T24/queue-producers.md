# queue-producers (T24)

**Status** · session_01LL57hVTtupUsVm9pj8DaCy · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T24 L11):
- **N506** (R26, Uses): the five `sweep-*` signals are now read through `link-sweep.sweepConditions` (its R11), reached as the new `linkSweep` dep (`linkSweepOf(host)` by default, the host's one instance), and no longer through monitoring. `QueueProducers.SWEEP_CONDITION_KINDS` is link-sweep's own exported `SWEEP_CONDITION_KINDS`. The item's `basis.source` is `link-sweep.sweepConditions`, and its basis sentence cites link-sweep R8 and R11. Tests: the world's fake moved from `monitoring.sweepConditions` to `linkSweep.sweepConditions`. Two new tests in `sweeps.test.mjs`: one reads through link-sweep with a monitoring `sweepConditions` that throws if called (negative control); the other gives no `linkSweep` dep and checks that the host's `linkSweepOf` instance is the one read. This clears the `index.mjs`:2911 throw named in red 7: plane `compose.test.mjs`:101 and `door.test.mjs`:183 pass on this branch.
- **N489** (R28, DEC-114): today no member-facing word of any item says "subject" (as the requirement's "Measured" line expected), so the code did not change. New test `R28 (DEC-114)` in `feeditems.test.mjs`. It covers all 32+ kinds this module produces (the plan's checkpoint item among them) and checks every summary, detail, option label and other member-facing sentence for "subject" or "subjects". It also checks that the item key `subject`, the class codes and the ids are unchanged. Negative control: the matcher catches the forbidden word in each form.
- **N502/N508 re-scan** of `bio-plane/src/queue-producers/` and its tests: no `awaiting stamp` note, and no legacy store, op map, dispatcher or legacy-index named as live. Nothing to re-word.

**Deferred:** none.

**Found in other modules:**
- **queue** (`test/m/queue/world.mjs`:136, `test/m/queue/signals.test.mjs`:26): queue's test world still fakes the sweep signals as `monitoring: { sweepConditions }`. After this re-point, queue-producers reads them from its `linkSweep` dep, so queue must pass that fake as `linkSweep: { sweepConditions }`. Until then, two tests in `signals.test.mjs` are red on this branch: "R1, R5, R11, R12: each sweep-* and notice-* signal is minted…" and "R14, R19, R30: a member mutes a sweep or notice kind…". This is a test-world change in queue's own files (L11, its job); queue's code needs no change.
- **Plane bundle stale:** this change is under `bio-plane/src/`, so `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`) is stale. Nothing regenerated.
- **Composition note:** when the plane composes link-sweep in L11, it should do so before op=queue's first read so that the composed instance is the one `linkSweepOf` returns to queue-producers (K61: one instance per storage, and the first call wins). This is the same note scheduler made.

**Tests and checks:**
- `node --test bio-plane/test/m/queue-producers/`: tests 70, pass 70, fail 0.
- Whole `bio-plane/test/m`: tests 5278, pass 5259, fail 8, skipped 11. Six are the accepted reds that also fail on `tranche/T24` itself (run with my change stashed): affordances `catalogue.test.mjs` ×2 (red 6), control-plane `families.test.mjs` and `r45-routes.test.mjs` (red 7), plane `notices.test.mjs` construction (red 9) and its monitoring sweep scope check (red 7). The other two are queue's `signals.test.mjs` pair above. Two reds are cleared: plane `compose.test.mjs`:101 and `door.test.mjs`:183 (red 7's queue-producers share).
- Checks: format, 88 modules, 87 requirements files, 0 failures. Architecture, 14 product files, 56 relative imports, 0 failures. Coverage, 28 of 28 live requirement ids named by a test, 0 failures. Ownership, 5 files changed, 0 failures.
- Red 5: I added or changed no catalogue row, so there is no `awaiting stamp` row to list.

Size (session_01LL57hVTtupUsVm9pj8DaCy): test runs 4, module lines 3211
