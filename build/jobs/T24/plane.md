# plane (T24)

**Status** · session_01WQbNSKUXRaMjDns2CiDwYU · depth 2 · RUNNING until 2026-10-02T16:47:00Z (whole bio-plane/test/m and migrate-released) · handled B0

## Completion

**Entries applied** (B1; `build/plan/current.md` T24 L11, plane):
- **(1) N506, link-sweep composed (R2, R5):** `src/plane/store.mjs` builds link-sweep with `linkSweepOf(ctx, { monitoring, captureRequests, capture })`.
  - It comes right after monitoring, which is no longer handed capture-requests (it holds no scope check now), and before `schedulerOf`.
  - At creation link-sweep registers its share with monitoring's seam (`registerSweep`, monitoring R66) and its scope check with the composed capture-requests (its R12; K1163).
  - Because it is built before the scheduler, the scheduler's default owner `linkSweepOf(ctx)` reaches this instance (K1210; first call wins).
  - R5's route map spreads `linkSweepOps(linkSweepOf(ctx), url)` (`sweeps`, link-sweep R9) directly after monitoring's map, where monitoring's map held it.
  - Its clock is left as monitoring's sweep had it: no `now` handed, wall-clock fallback, and the scheduler hands the tick's `now`.
- **(N503's share, K1200; red 9):** `notices.test.mjs`'s R2 test now asserts that no mint seed is registered under network-notices' name, because a probe registration is accepted. Negative control: the same probe under `ratification`, which holds a seed, is refused `MINT_SEED_DECLARED`.
- **N502/N508 re-scan** of `src/plane/`, `test/m/plane/`, `migrate-released.test.mjs` and the config files: nothing stale. The hits (`store.mjs`:69, `door.mjs`:2, `stats.test.mjs`:3, :20, `store.test.mjs`:84, `step.test.mjs`:3) are past-tense history.

**Tests** (in `bio-plane/test/m/plane/`):
- The K1163 pair moved from `notices.test.mjs` to the new `sweep.test.mjs`, re-pointed to link-sweep (K1207). The slot is held by `link-sweep` at construction and a sweep-named request is judged by its check. Negative control: link-sweep built first and handed nothing is refused "no scope check is registered".
- New in `sweep.test.mjs`:
  - R2: link-sweep's registration with monitoring is accepted, a second registration is refused, and its tables are made and declared to purge under its name after monitoring's.
  - R2, R4 (K1210): the scheduler holds `gathering-sweep` and its owner is the composed instance.
  - R5: `op=sweeps` sits right after monitoring's ops and answers through the door what link-sweep's own map answers. Monitoring's map no longer holds it. Negative control: `sweepz` is `unknown op`.
- `maps.mjs` lists link-sweep's map after monitoring's (R5's union).
- With `store.mjs` reverted, the R12 scope test and the R5 `sweeps` test fail. The other two pass in the old code too, because the scheduler's start created link-sweep lazily.

**Deferred:** none.

**Found in other modules / for BOB:**
- **Stale bundle:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from my `src/plane/store.mjs`. `fleetbundles.test.mjs` reports `bio-plane: STALE BUNDLE` naming `src/plane/store.mjs`. I regenerated nothing.
- **Reds in the whole `test/m`.** I reproduced each with my change reverted, so none is caused by this merge. The first two are in my own tests; the last four are in other modules' tests:
  - `plane/door.test.mjs`:183 and `plane/compose.test.mjs`:101: `op=queue` throws at queue-producers `index.mjs`:2911 (`sweepConditions` on monitoring). This is red 7 and clears with queue-producers' L11 re-point.
  - `control-plane/families.test.mjs`:47: red 7 (K1207).
  - `control-plane/r45-routes.test.mjs`:68 ("sweeps is a route of its owner's map"): its owner table still names monitoring's map. This is red 7's kind, control-plane's L11 re-point.
  - `affordances/catalogue.test.mjs`:524: red 6 (`optionstartpreview`).
  - `affordances/catalogue.test.mjs`:903 (`mon.includes("sweeps")`): it still reads `sweeps` from monitoring's map. This is red 7's kind, affordances' (or op-declarations') L11 re-point.
- **Awaiting stamp (red 5):** I added or changed no catalogue row.

**Tests and checks run:**
- `node --test test/m/plane/*.test.mjs`: tests 50, pass 48, fail 2 (red 7, above).
- `node --test "test/m/**/*.test.mjs"`: tests 5278, pass 5261, fail 6 (all named above), todo 11.
- `node --test test/system/migrate-released.test.mjs`: tests 1, pass 1, fail 0.
- `checks/format.mjs`: 88 modules, 87 requirements files; 0 failures.
- `checks/architecture.mjs bio plane`: 22 product files, 201 relative imports; 0 failures.
- `checks/coverage.mjs bio plane`: 13 of 13 live ids named by a test; 0 failures.
- `checks/ownership.mjs bio plane tranche/T24`: 5 files changed; 0 failures.

Size (session_01WQbNSKUXRaMjDns2CiDwYU): test runs 9, module lines 494
