# calibration (T19)

**Status** · session_01SiBLUU5DMdgNvvx69HUkWp · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1 START; `build/plan/current.md` layer 4, calibration):
- **R20** `migrate()` (`src/calibration/index.mjs`) runs the module's own `CALIBRATION_SCHEMA` (the same statements, comment lines stripped and split on `;` as the schema pass did), every one `IF NOT EXISTS`, so it creates `calibrations`, `calibration_subjects`, `calibration_signals` and their three indexes only where absent, adds and changes nothing else, and is idempotent; it answers `{ok, created}` with the tables it made. `schema.mjs` no longer imports or interpolates `CALIBRATION_SCHEMA`; `store.mjs` `#migrate` calls `calibrationOf(this.ctx).migrate()` directly after the schema pass, where those statements ran before (after `recordOf().migrate()`, before `membershipOf().migrate()`). Legacy-store: 1 line added, 3 removed (ownership check lists the one).
- **Rule 1** `BASIS_GRADES` re-pointed to record-grammar (`src/record-grammar/index.mjs`) in `src/calibration.mjs` and `test/m/calibration/rules.test.mjs`. No calibration file imports `bio-checks.mjs` (`calibration/checks.mjs`:8 names it only in a comment).
- Header comments in `calibration/schema.mjs` and `calibration/index.mjs` updated to say `migrate()` owns the DDL.

**Requirements met, with their tests:** R20, `test/m/calibration/migrate.test.mjs` (three tests: creates exactly the tables and indexes the schema text makes and nothing else, statement for statement against the stand-in that ran the text as the legacy pass did; twice, or over held tables with rows, changes nothing; only the absent table is created and a held one's rows stay). `test/m/calibration/storage.mjs` gains `storage({ calibration: false })` for it. Every other R unchanged and still tested (R1–R19).

**Deferred:** none.

**Other modules / generated artifacts:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, owned by `not_product`) is stale by this change's source edits, as by any layer's; BOB regenerates at the close. Old suites `test/system/bounds`, `airuns`, `airun`, `system/hygiene`, `versionchain`, `textchain` fail at load on `tranche/T19` before and after this change alike (catalogue exports already deleted, e.g. `VERSION_CHAIN_CHECKS`); not this module's.

**Tests and checks run:**
- `node --test test/m/calibration/`: tests 65, pass 65, fail 0.
- Users of the module: `test/m/extraction/` pass 145 fail 0; `test/m/scheduler/` pass 51 fail 0; `test/m/content/` pass 104 fail 0; `test/m/legacy-store/` pass 4 fail 0; `test/calibration.test.mjs` pass 1 fail 0. A scratch boot of the real `Store` through legacy-store's fixture (deleted after) registered a subject and listed it via `op=calibrationsubject`/`op=calibrations`: the composition root's call creates the tables.
- No layer tests are named in `build/manifest.md`.
- `format`: 87 modules, 82 requirements files; 0 failures. `architecture`: 8 product files, 21 relative imports; 0 failures. `coverage`: 20 of 20 live requirement ids named by a test; 0 failures. `ownership`: 9 files changed; legacy-checks 0 added 0 removed; legacy-store 1 added 3 removed; 0 failures.

Size (session_01SiBLUU5DMdgNvvx69HUkWp): test runs 20, module lines 1107
