# retrieval (T11)

**Status** · session_019kYAkjqGuHEuapPatRmNFW · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Retrieval T11 is complete on `job/T11/retrieval` @ 72d3e95873 (code and tests), with `tranche/T11` merged in (fast-forward to 8f9934d285 before any change).

**Entries applied**
- **N283 (R61, and R58's first clause; K327, K330).** The projection columns of R2 and `fts_id` now live in `bundle_projection`, this module's own table. They are no longer on `bundles`.
  - `migrate()` creates the table and its indexes. It then moves an older store's columns off `bundles`, once, in one transaction: copy the values (`INSERT OR IGNORE`, so a row already moved is kept), drop the indexes `bundles_<column>` and `bundles_fts_id`, then `ALTER TABLE bundles DROP COLUMN` each column. Once no column is left on `bundles` it does nothing.
  - The table is declared to record-core's purge keyed by `bundle_id`, first in `RETRIEVAL_PURGE`.
  - Every `compile` this module runs now passes `{projection: PROJECTION_RELATION}` (query-language R25). That covers search, the OR widening, meaningRows and the three selection compiles.
  - The module's own reads and writes use the table: the projection writer is an upsert, and the others are `fts_id` allocation, reproject, projectionPlan, projectionClear, projection(), searchIndexCheck (findings, orphans, `keyed`), and R17's and R60's `indexed`.
- **An improvement in my own module.** A new `fts_id` is now MAX+1 over both the projection's keys and `bundles_fts`' rowids. A new bundle can no longer take an orphan's key and overwrite the orphan that R17 reports. This has a test.

**Requirement marks my work meets (for you to strike; ownership does not let a job edit `build/requirements/`)**
- R58: `*(not yet met: T11, N283; K330 …)*`
- R61: `*(not yet met: T11, N283; K327)*`

**The moved contract, for actions (layer 9) and monitoring (layer 10)**
- **Table.** `bundle_projection` has one row per bundle, `bundle_id TEXT PRIMARY KEY`, equal to `bundles.bundle_id`. Its columns are R2's (`schema_id`, `produced_mode`, `capability_tier`, `source_locator`, `source_authority`, `source_retrieved`, `source_status`, `content_hash`, `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `annotations_open`, `reeval_flag`, `reeval_since`, `reeval_source`, `fm_json`, and the six `action_*`) plus `fts_id`. Types are unchanged.
- **Names.** `src/retrieval/index.mjs` exports `PROJECTION_TABLE` (`"bundle_projection"`) and `PROJECTION_RELATION` (`{table: "bundle_projection", key: "bundle_id"}`).
- **Nothing on `bundles`.** After `migrate()`, none of these columns exists on `bundles`. A read of `bundles.<column>` fails with "no such column".
- **Joins.** Read `bundles b JOIN bundle_projection bp ON bp.bundle_id = b.bundle_id` and name `bp.<column>`. Use `LEFT JOIN` where every bundle must appear: a bundle not yet projected has no row, and `reproject` writes it.
- **Writer.** Retrieval is the only writer. It writes inside the promotion's transaction (R1) and in `reproject` (R3). A bundle's purge removes its row.
- **Indexes.** `bundle_projection_<column>` exists for `schema_id`, `produced_mode`, `source_authority`, `source_status`, `monitor_enabled`, `monitor_frequency`, `reeval_flag`, `annotations_open`, `action_kind`, `action_resolution` and `action_clock_overdue`, plus a unique index `bundle_projection_fts_id`. `action_clock_next` is not indexed, as before.
- **The sites N283 names.** Monitoring: `src/monitoring/index.mjs` 1129–1142, 1590–1592 and 1751, reading `monitor_enabled`, `monitor_frequency`, `monitor_last_checked` and `source_locator`. Actions: `src/actions/index.mjs` 1804, reading `b.action_clock_next`. Legacy-store's read already goes through `counts(hid)` (T10). A grep of `src/` finds no other SQL reader.
- **Test fixtures.** Both modules' own tests pass today because their fixtures create the columns on `bundles` themselves. Once they read through the join, their fixtures need retrieval's `migrate()`, or the table.

**Found in other modules**
- **citation** (no T11 entry): `test/m/citation/invariants.test.mjs:60` (R6) pins the tables a cite moves as `bundles, files, history, manifest`. `bundle_projection` now moves too. It is the same projection write inside the promotion that used to land on `bundles`' own columns. That makes 1 fail on my branch, 0 on the tranche. The test needs `bundle_projection` in its expected set, or needs to read it as retrieval's derived table. The test is citation's.
- **legacy-tests, re-anchor needed:**
  - `test/content-chain-kind.test.mjs` compiles without the relation (lines 124, 133, 448), so its EXPLAIN reads `bundles.fts_id`: "no such column: fts_id". It needs `compile(…, {projection: PROJECTION_RELATION})`.
  - `test/meaningquery.test.mjs` pins the index `bundles_fts_id` (its section on the join being "ALREADY indexed"). That index is now `bundle_projection_fts_id`.
- **Monitoring's N283 read, which should go green when monitoring rewires:** `test/monitor-address.test.mjs` (the cadence consumer finds no monitored bundle) and `test/gate-reads.test.mjs` (2 fails, op=monitoring).
- **Generated artifacts, stale and not rebuilt:**
  - `agent-worker/dist/agent-worker.bundled.mjs` (agent-worker R45: 2 fails; its inputs include `src/retrieval/index.mjs` and `schema.mjs`).
  - `bio-plane/dist/bio-plane.bundled.mjs` (`test/fleetbundles.test.mjs`: 1 fail).
- **Red on the tranche before my change, same result after:** `bounds`, `derivation-bounds`, `machine-fences`, `meaning-bounds`.

**Deferred:** nothing.

**Tests and checks**
- Retrieval: 65 pass, 0 fail, 0 todo. R61's todo is replaced by four tests: the table, the one-time move, the missing row, and the orphan key.
- The tests of the modules that use retrieval: inquiry 60/0, ai-runs 46/0, intent 35/0, actions 30/0, monitoring 43/0, scheduler 46/0, all unchanged. citation 48/1 (above). agent-worker 6/1, the stale bundle only.
- Legacy suites that read the projection or retrieval (56 files) were compared against the tranche. Only the five above changed.
- format: 0 failures. architecture: 0 failures. coverage: 61 of 61 live ids named. ownership: 0 failures (legacy-store and legacy-checks 0 added, 0 removed).

Size (session_019kYAkjqGuHEuapPatRmNFW): test runs 14, module lines 2209
