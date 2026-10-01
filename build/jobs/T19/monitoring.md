# monitoring (T19)

**Status** · session_01UF66V7qkJwoChKmSJZuQvN · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (layer 10, monitoring, as amended; B1). Commit `1cb81b2524`. Merge early (rule 4: for legacy-store).
- **R51.** `monitoringOf` registers R46's `counts()` once at start through record-core's `registerCounts` (its R63) as module `monitoring`, keys `MONITORING_COUNT_KEYS` = `monitorFired`, `monitorTickEpoch`, `monitorAddressType` (exported), its function ignoring `hid` (whole-store: the tables name no bundle). A record without `registerCounts` is not asked, as bias and content do. `store.mjs`:657/674 still calls `counts()` by name; its `...recordOf(this.ctx).counts(hid)` spread (:798) now carries the same three figures, so the answer is unchanged until legacy-store's job deletes its call (`build/extraction/legacy-store.md` §4.2 (2)).
- **R50 (N429).** `deadlineRecheck` records, per action, the start of the UTC day after a failed R34 mark (any `failed` entry, `NOTHING_PENDING` and `UNSPLICEABLE_CLOCK` included), and clears it when that action's mark lands. `deadlineRecheckWake(now)` now reads `now`: an entry of a held action counts no earlier than that instant while `now` is before it, so the failing entry is asked again once a day, and an entry that can be marked is never held back by it. `deadlineRecheckDue` unchanged (it passes `now`).
- **Rule 1 re-points.** `checks.mjs`:15 imports `isPublicHttpsLocator` from `record-grammar/locator.mjs` and `ISO_TS_RE` from `record-grammar/ids.mjs`; `index.mjs`:59 imports `parseFrontmatter`, `isPublicHttpsLocator`, `createSha256`, `MACHINE_CLASS_PREFIX` from `record-grammar/index.mjs`; `fixture.mjs`, `invariants.test.mjs`, `tick.test.mjs`, `understanding.test.mjs` import `parseFrontmatter` from `record-grammar/index.mjs`. No monitoring file names `bio-checks.mjs`. Comments at `checks.mjs`:3 and `index.mjs`:12 re-worded (the legacy catalogue, and the grammar now record-grammar's).
- **K789.** The fixture makes the real `credentials` after membership (`credentialsOf(host, {record, membership})`, `migrate()`), as ratification's fixture does; R30's roster claims through `credentials.claim`. The accepted red (`R30 (N314, N324) …`, `m.claim is not a function`) is green. `uses` already names `credentials`.

**Requirements met, with their tests (for BOB to strike the marks, K775 (6)):**
- R51: `ticks.test.mjs` "R51 R46's counts() is registered once at start through record-core's registerCounts …" (registered at start; the same rows as R46 through `record.counts()`; whole-store under a `hid`; a second `monitoringOf` adds nothing and another module's claim of `monitorFired` is `COUNTS_DECLARED` held by monitoring; a dropped table null).
- R50 (N429): `understanding.test.mjs` "R50 (N429) an entry of an action whose last R34 mark failed is left out of the wake's earliest date until the start of the UTC day after the failure …" (held to the next day, nothing due the rest of that day; a markable entry still holds the wake in the past and is marked; asked again at the next day and held a further day on failing again; released when the mark lands; a not-yet-past entry of the same action). The three existing R50 tests still pass.

**My readings (BOB's to overrule):**
1. N429's hold is in memory, for the life of the instance (R41 names three tables and R46 counts them, so a fourth table would change both). A restarted Durable Object re-asks a held entry once at once, then holds it again: one extra re-check per restart, never a loop. If you want it durable, that is a new table and a re-worded R41/R46.
2. "Whose last R34 mark failed" is read per action (R34's `failed` names actions), so every entry of that action is held, a not-yet-past one only where its own wake is earlier than the hold.

**Deferred.** None.

**Found in other modules (REPORT):**
- `modules.json` (BOB): monitoring no longer imports `legacy-checks`; its `uses` edge and the requirements' Uses line for `legacy-checks` (`MONITOR_FREQ`, `MECHANICAL_FIELD_SETS`, `isPublicHttpsLocator`, `parseFrontmatter`, C-48.8/.9) are stale: `record-grammar` provides the grammar, the rest was re-pointed in T18 (K717).
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from this change (`src/monitoring/index.mjs`, `checks.mjs`), for the layer-close regeneration.
- `queue-producers` (users' run): 32 of 46 fail on `tranche/T19` with and without this change, identically (`no such table: signers` in its `world.mjs`: K789's fixture case, its own job's).
- `control-plane` (users' run): 1 of 85 fails with and without this change, identically: "R22 (K585 (1)): CHECK_FAMILIES is total …".

**Tests and checks.**
- `node --test bio-plane/test/m/monitoring/`: tests 78, pass 72, fail 0, todo 6 (on `tranche/T19` before the job: 76 / 69 / 1 (the K789 red) / 6).
- Users of monitoring: `test/m/scheduler/` 52 / 51 pass / 0 fail; `test/m/queue-producers/` 46 / 14 / 32 (baseline identical); `test/m/control-plane/` 85 / 84 / 1 (baseline identical); `plane` has no tests path yet. Legacy `test/stats-disclosure.test.mjs` and `test/purge.test.mjs` (the stats spread): pass, before and after.
- Layer tests: none named in `build/manifest.md`.
- `format`: 87 modules, 82 requirements files; 0 failures. `architecture`: 14 product files, 68 relative imports; 0 failures. `coverage`: 50 of 50 live requirement ids named by a test; 0 failures. `ownership` (vs `tranche/T19`): 8 files; legacy-store 0/0, legacy-index 0/0, legacy-checks 0/0; 0 failures.

Size (session_01UF66V7qkJwoChKmSJZuQvN): test runs 14, module lines 2545
