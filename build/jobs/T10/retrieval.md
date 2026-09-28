# retrieval (T10)

**Status** · session_01CbPDfJwtC7DfaJUPFLHp6F · depth 2 · WORKING · handled B0

## J1 · QUESTION

N106 / R61: moving the projection columns and `fts_id` off `bundles` breaks three readers outside retrieval and query-language, none in this tranche's plan:
- `monitoring` (layer 10), `src/monitoring/index.mjs` 1129–1142, 1590–1592, 1751: reads `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator` as columns of `bundles`.
- `actions` (layer 9), `src/actions/index.mjs` 1804: reads `b.action_clock_next` of `bundles b`.
- `legacy-store`, `src/store.mjs` 5461–5465 (queue's counts): reads `bundles.fts_id`. N171's `counts(hid)` is its replacement; the call site is queue's/legacy-store's.

My best reading, on which I am building now: R61 as written. `migrate()` creates `bundle_projection` (`bundle_id` PRIMARY KEY, the R2 columns, `fts_id` UNIQUE, the same indexes), copies any values held on `bundles` into it once, then drops the columns and their indexes from `bundles` (SQLite `DROP COLUMN`, indexes first); declared to record-core's purge keyed by `bundle_id`; this module the only writer. I export the relation as `PROJECTION_RELATION = {table: "bundle_projection", key: "bundle_id"}` and pass it to every `compile` as `compile(input, {projection: PROJECTION_RELATION})` (query-language R25). The three readers above then fail on the plane until their owners read `bundle_projection` joined on `bundle_id` (a one-line JOIN each); I will not touch them (never change another module). If you want them kept working in this tranche, say so and name who rewires them, or rule that I keep the columns on `bundles` until they move (R61 would then stay not met).

Sequencing: until query-language's R25 merges, `compile` ignores the relation and reads `b.<column>`, so my search, meaning-row and selection tests go red in between. I will push the table and the relation first (as you asked), commit it with those tests red only in that interim push, and tell you in a REPORT; after you merge query-language I merge `tranche/T10` and bring them green. If you would rather I push nothing red, say so and I will hold the move until query-language's R25 is on the tranche.

## J2 · REPORT

N106, the provider side, is pushed on `job/T10/retrieval` @ 3d5dacebe7, ready for your early merge for query-language. I changed my plan from J1 so nothing is pushed red: this is phase A.

- `bundle_projection` (`bundle_id` PRIMARY KEY, R2's columns, `fts_id` with a UNIQUE index, the same filter indexes as `bundle_projection_<col>`) is created by `migrate()`, written by the promotion step and `reproject`, declared to record-core's purge by `bundle_id` (R33's list gains it), and filled once from any projection an older store holds on `bundles` (R58).
- `PROJECTION_RELATION = {table: "bundle_projection", key: "bundle_id"}` is exported from `src/retrieval/index.mjs` (and `schema.mjs`), and every `compile` call here passes `{projection: PROJECTION_RELATION}` as its second argument (query-language R25). Today's compiler ignores it.
- Interim: `bundles` keeps its projection columns as a mirror, copied from `bundle_projection` after every write and never read by retrieval, so the compiler's `b.<column>` reads and the readers in J1 (monitoring, actions, legacy-store) keep working.
- Phase B, after query-language's R25 merges and you answer J1: drop the mirror and the columns (and their indexes) from `bundles`. R61's "not held on bundles" is a `test.todo` until then.

Tests: retrieval 60 pass, 0 fail, 1 todo, now on a workerd-shaped cursor fixture with the 50-byte pattern cap (K313, K316). format, architecture and ownership: 0 failures. Coverage still lists R59 and R60, which I am doing now. The legacy suites that reach retrieval (meaningread, refuse-gate, projection-noproject, meaningquery, observation-meaning, rec114, rec118, ai-runs surfacing and producers) give the same results before and after. `observation-log.test.mjs` and `derivation-bounds.test.mjs` are red on the tranche before my change too.

## J3 · REPORT

J2 is void. Your B2 reached me after I had posted it: do not merge 3d5dacebe7 for query-language. B2 is applied at 71cb3b7 (this push). `bundle_projection` and the mirror are gone, `migrate` and every compile are as on the tranche, and R61 is a `test.todo` citing N283 and K327. `tranche/T10` is merged in. Nothing I compile changes. The branch's remaining diff from the tranche is the cursor-shaped test fixture (K316) and `counts(hid)` (R60, in progress). Retrieval: 58 pass, 0 fail, 1 todo.

A consequence for the requirement text: R58's first clause ("creates this module's projection table (R61), moves any columns held on `bundles` into it once") belongs to N283 as well. My R58 test covers the rest (the text index, the selections, the backfill, the routes). I read R58 as met apart from that clause, which I name in R61's todo. If you want R58 marked too, that is yours.
