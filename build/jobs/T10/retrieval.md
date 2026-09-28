# retrieval (T10)

**Status** · session_01CbPDfJwtC7DfaJUPFLHp6F · depth 2 · COMPLETE · handled B5

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

## J4 · QUESTION

A correction first: J3's commit is e972b2da04, not 71cb3b7.

R41 is ambiguous. It says: "The evidence at this level is one-sided (DOCUMENT_EVIDENCE_IS_ONE_SIDED, K306), so a `never_looked` or `missing_unexplained` address names all three causes." observation-log's `causesNotRuledOut` (its R11) answers `["never_looked"]` for the cause `never_looked` and `["pre_log"]` for `pre_log`, whatever the sidedness. Only `purged` and `watermark_band` take all three when the evidence is one-sided. My R40/R41 test pinned that `["never_looked"]` answer.

My best reading, on which I am building now:
- At the document level a `never_looked` address names all three causes. An address can be fetched before the log began and leave no locator, so a link first seen after the log's first row does not rule out an earlier look. observation-log R11 says the same ("where the evidence is one-sided … a missing row leaves all three open").
- A `pre_log` address (held in `captured_locators`) names `pre_log` alone. The artifact shows a look happened, which R11's code and comment rule on.
- So R41 holds only when observation-log's `causesNotRuledOut` honours one-sided evidence for `never_looked`. That is observation-log's code, R11, in this layer (N113). I pass `evidenceOneSided: true` for an address today (an undeclared kind reads as one-sided, the weaker statement), and I read `DOCUMENT_EVIDENCE_IS_ONE_SIDED` by name once observation-log exports it. Until the provider changes, that part of R41 is a `test.todo` naming this, and the rest of R41 is tested.

If you read "all three" as applying to `pre_log` too, or read `never_looked` as licensing the positive statement even at a one-sided level (in which case R41's sentence needs changing), say which and I will follow it.

## J5 · COMPLETE

Retrieval T10 is complete on `job/T10/retrieval`, with `tranche/T10` merged in (observation-log's early merge included).

**Entries applied**
- **N171 (R60):** `counts(hid)` answers `{indexed, selections, selectionItems}`. It is synchronous, writes nothing and never throws; a figure it cannot read is null, not zero. With `hid`, it leaves out the index rows a hidden bundle claims (the same rule as R17), the items naming a hidden bundle, and any selection holding one. That last exclusion is legacy-store's existing rule, under R29. R60 does not say it: if you want the selections count whole, say so.
  - legacy-store's `#counts` now calls it for `indexed`, `selections` and `selectionItems`. Ownership lists 3 lines added and 13 removed in `store.mjs`; the counts are unchanged and legacy `selection.test.mjs` and `gate-reads.test.mjs` pass.
  - R17's `indexed` and R21's bytes share one hidden-set helper with it.
- **N142 (R59):** `answerChanged` now returns a boolean, true exactly for `moved === true` or `drift.digestChanged === true`. It is pure and never throws, even on a hostile getter. Citation's import is unchanged.
- **N202 (R52):** `onSelectionCreated` refuses through membership's `listenerRefusal`. Listeners, and R56's decorations, now run in `MODULE_ORDER` by default (before this, the default was registration order).
- **N106:** withdrawn per B2 and K327. R61 is a `test.todo` citing N283, and R58's first clause is T11's per K330.
- **N113's reader side (R41):** `DOCUMENT_EVIDENCE_IS_ONE_SIDED` is read by name, and the published sidedness and the sidedness the causes are read under are now one value. R41 is tested whole per B4, B5 and K331: a never-looked address names all three causes, a pre_log address pre_log alone.
- **Tests (K313, K316):** the retrieval fixture now answers as workerd does, a cursor with the 50-byte pattern cap. Every existing test passed on it unchanged.

**Deferred:** R61 (N283, T11).

**Found in other modules**
- **legacy-tests:** `test/refuse-gate.test.mjs` pins the old source text `export const answerChanged = (drift, moved) => moved || drift?.digestChanged === true;` (its needle list, near line 510). It goes red on my branch (1 fail) and passes on the tranche. R59 needs the new form, so the needle wants re-anchoring to the new function.
- **legacy-tests:** these suites are red on the tranche with the same failure sets on my branch: observation-log, observation-content, observation-meaning, run-conditions, derivation-bounds, readingname, hygiene, nc-rec107.
- **record-core R37:** retrieval's `projection()` reads `bundles.group_id` and `bundles.prior_state`, and `selectionResolve` reads `bundles.bundle_sha`. `bundle_sha` is in the contract; `group_id` and `prior_state` are not. That is a contract gap: those two columns need adding to R37, or my read changing.
- **connections:** `observationOf`'s missing-row probe for an entity reads `connections.entity_id`, which connections states no read contract for (as my Uses already notes).
- **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from my source changes; not rebuilt.

**Tests and checks**
- Retrieval: 61 pass, 0 fail, 1 todo (R61).
- format: 0 failures. architecture: 0 failures. coverage: 61 of 61 live ids named. ownership: 0 failures (legacy-store 3 added, 13 removed).

Size (session_01CbPDfJwtC7DfaJUPFLHp6F): test runs 34, module lines 2152
