# monitoring (T18)

**Status** · session_014aGiC7DPqNkCtn6HWkQfta · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (layer 10, monitoring; `build/plan/current.md` bullet, rules (4), (5), (7)). Commit `c74abaec7b`. Merge early: scheduler waits on R50.
- **N-A8, R50.** `deadlineRecheckWake(now)`: the start of the UTC day after the earliest date among `pending` clock entries, read through `action-clocks.pendingClocks` as `MONITOR_VIEWER` with `before: 9999-12-31` (so past and future entries both count), every page by its cursor (at most 100 pages of 500); null when none is pending or the read fails. `deadlineRecheckDue(now)`: that instant when at or before `now`, else null. R34's mark and R35 were already reworded/struck at the fold.
- **K649: `deadlineRecheck` reads `pendingClocks` from action-clocks** (its R1). The `actions` dependency is gone from the code (`actionsOf` no longer imported); `actionClocks` replaces it in `deps`. `actions` stays in Uses only for R44's bound (its R33), which promotion enforces at the write. actions' next job can delete its `pendingClocks` copy (K625).
- **`MONITOR_FREQ` read from capture** (`capture/index.mjs`, C-2.7's move); **`substanceDigests`, `profilesAsText`, `ODF_DIGEST_MAX`, `civicosUserAgent` and `DRIVE_CAPTURE_CHECKS` read from acquisition** (`acquisition/index.mjs`); `tick.test.mjs`' `substanceDigests` too; the tests' `MECHANICAL_FIELD_SETS` from promotion. Nothing in monitoring imports `capture/acquire.mjs` now.
- **C-48.8 and C-48.9 copied into monitoring's own table** (R42 as worded): `DRIVE_TICK_CHECKS` in `monitoring/checks.mjs`, code, number, translation, reasons and comments unchanged, `where` = `src/monitoring/index.mjs monitor > is-drive-tick-export` / `… > is-drive-tick-bytes`. The tick no longer reads them from the catalogue; C-48.2–.4 (the shapes a tick refuses alike) come from acquisition's table. The catalogue's copies stay for T19's layer 1 (K529).
- **N242's share.** The `is-drive-tick` rows are now this module's own rows, naming its regions (no orphan); the bare `REFUSED` was already gone (T11). What remained untranslated was **`GATHERING_REFUSED`** (draft-T14-wordings noted it; queue's C-19.2 `INBOX_REFUSED` is its twin): new row **C-18.10** in `GATHERING_CHECKS`, `where` `src/monitoring/index.mjs gatheringCheck > is-gathering-refused` (DEC-49 region added), and the refusal now carries `code`, `check`, `translation` beside `findings`. C-18.10 is the first free C-18 number on `tranche/T18` (C-18.1, .3–.9 taken); renumber if you prefer. `MONITORING_CHECKS` = both tables, exported.
- **§4.4 plain move (K649 (7)).** `src/index.mjs`: the `monitor` arm's comment line deleted and its call now hands `viaSession, sessViewer, cls`; `monitorOp` composes the stamps itself (a session's member as viewer and actor, class `member`; a credential `class:<cls>`, class `machine`), never from the request. Ownership: legacy-index 1 line added, 2 removed; the added line is the call to `monitorOp`.

**Marks this work meets (rule (5)), for BOB to strike:** R50. R42's T18 wording is now true of the code. R34's remaining mark (members told) stands: needs scheduler's consumer and queue-producers R15.

**Rows `awaiting stamp` (rule (4)), for T19's promotion job:** C-48.8 and C-48.9 (copied, `where` unchanged in text, now in `monitoring/checks.mjs`), new C-18.10 `GATHERING_REFUSED`.

**My readings (BOB's to overrule):**
1. R50's wake counts every `pending` entry, past ones included: a past entry's next day is already past, so `deadlineRecheckDue` answers it at once and the next alarm runs R34. An entry R34 cannot mark (its promotion refused) keeps the wake in the past: every reconcile finds it due. scheduler's consumer should not spin on that (its own grace/delay), worth a look in scheduler's job.
2. A failed `pendingClocks` read holds no wake (null), so a broken read cannot spin the alarm; it is asked again at the next reconcile.
3. `monitorOp`'s interface changed: it takes `viaSession`, `sessViewer`, `cls` instead of `viewer`, `actorClass`, `actor`. The only caller is `src/index.mjs`, edited here.

**Deferred.** None.

**Found in other modules (REPORT):**
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from this change (`src/index.mjs`, `src/monitoring/index.mjs`, `src/monitoring/checks.mjs`); for BOB's layer-close regeneration. Also on `origin/tranche/T18` before my change (checked in a clean worktree): fleetbundles' "agent-worker's 153 inputs are all recorded" fails. Not caused by this job.
- `control-plane` (N414's line): when `dec49Row`'s composed `CHECK_FAMILIES` is built, it should include `monitoring/checks.mjs` `MONITORING_CHECKS`. Until then each refusal carries its row inline, as `driveRow` and `gatheringCheck` do.
- `actions` (its next job): nothing in monitoring reads `actions.pendingClocks` now (K625 clears).
- Old suites (unrun, K653) that read `monitorOp`'s old option names or `DRIVE_CAPTURE_CHECKS` from the catalogue for C-48.8/.9: `test/system/refusal-wire.test.mjs`, `plane-envelope.test.mjs`, `verdict-excluder.control.mjs`, `test/d334-monitor-credential.*`. For the release's one pass.
- `modules.json` (BOB): monitoring's `uses` holds `actions` only for R44's bound; `record-grammar` not needed (the class prefix comes through `legacy-checks`).

**Tests and checks.**
- `node --test bio-plane/test/m/monitoring/`: tests 76, pass 70, fail 0, todo 6 (baseline before the job: 71 / 65 / 0 / 6). New: R50 ×3, R42 (the table), R1 (the stamps), R27's row.
- Users: `test/m/scheduler/` 48 / 46 pass / 0 fail / 2 todo; `test/m/queue-producers/` 28 / 27 / 0 / 1.
- Layer tests: none named in `build/manifest.md`.
- `format`: 82 modules, 77 requirements files; 0 failures. `architecture`: 14 product files, 66 relative imports; 0 failures. `coverage`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership` (vs `tranche/T18`): 11 files; legacy-store 0/0, legacy-index 1 added / 2 removed, legacy-checks 0/0; 0 failures.

Size (session_014aGiC7DPqNkCtn6HWkQfta): test runs 9, module lines 2516
