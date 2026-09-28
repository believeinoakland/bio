# retrieval (T10)

**Status** · session_01CbPDfJwtC7DfaJUPFLHp6F · depth 2 · WORKING · handled B0

## J1 · QUESTION

N106 / R61: moving the projection columns and `fts_id` off `bundles` breaks three readers outside retrieval and query-language, none in this tranche's plan:
- `monitoring` (layer 10), `src/monitoring/index.mjs` 1129–1142, 1590–1592, 1751: reads `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator` as columns of `bundles`.
- `actions` (layer 9), `src/actions/index.mjs` 1804: reads `b.action_clock_next` of `bundles b`.
- `legacy-store`, `src/store.mjs` 5461–5465 (queue's counts): reads `bundles.fts_id`. N171's `counts(hid)` is its replacement; the call site is queue's/legacy-store's.

My best reading, on which I am building now: R61 as written. `migrate()` creates `bundle_projection` (`bundle_id` PRIMARY KEY, the R2 columns, `fts_id` UNIQUE, the same indexes), copies any values held on `bundles` into it once, then drops the columns and their indexes from `bundles` (SQLite `DROP COLUMN`, indexes first); declared to record-core's purge keyed by `bundle_id`; this module the only writer. I export the relation as `PROJECTION_RELATION = {table: "bundle_projection", key: "bundle_id"}` and pass it to every `compile` as `compile(input, {projection: PROJECTION_RELATION})` (query-language R25). The three readers above then fail on the plane until their owners read `bundle_projection` joined on `bundle_id` (a one-line JOIN each); I will not touch them (never change another module). If you want them kept working in this tranche, say so and name who rewires them, or rule that I keep the columns on `bundles` until they move (R61 would then stay not met).

Sequencing: until query-language's R25 merges, `compile` ignores the relation and reads `b.<column>`, so my search, meaning-row and selection tests go red in between. I will push the table and the relation first (as you asked), commit it with those tests red only in that interim push, and tell you in a REPORT; after you merge query-language I merge `tranche/T10` and bring them green. If you would rather I push nothing red, say so and I will hold the move until query-language's R25 is on the tranche.
