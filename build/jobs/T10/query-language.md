# query-language (T10)

**Status** · session_018E96qPj3eH3p3P8yKxFQuJ · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R25 (N106), my reading; I build on it now and stop only if you answer otherwise.

1. **Signature.** As R25 writes it: a second argument, `compile({q, viewer, …}, {projection: {table, key}})`. With no second argument (or no `projection`) every statement is byte-identical to today's (the columns read from `bundles`). A `table` or `key` that is not a plain SQL identifier is ignored with a warning (the statements then read `bundles`), never interpolated; nothing throws.
2. **Which columns move.** Exactly retrieval R2's list plus `fts_id`: `schema_id produced_mode capability_tier source_locator source_authority source_retrieved source_status content_hash monitor_enabled monitor_frequency monitor_last_checked annotations_open reeval_flag reeval_since reeval_source fm_json` and the six `action_*` columns. These stay on `bundles`: record-core's (`bundle_id object_type group_id title current_state prior_state created last_updated criticality bundle_sha`) and the ones strength and inquiry write (`inquiry_capture_strength inquiry_connection_strength inquiry_basis_count`), since R61 moves only R2's columns. I mark the moved ones on my own `FIELDS` registry (`proj: true`), so no later module's table is named here.
3. **Shape.** Every statement joins `bundles b` to `<table> bp ON bp.<key> = b.bundle_id` and keys the text index through `bp.fts_id`; the gate stays over `b`.

Retrieval: `projection: {table: "bundle_projection", key: "bundle_id"}` is what it passes. If retrieval moves a different set of columns, tell me the list.

## J2 · REPORT

1. **Stale marks in `build/requirements/query-language.md`** (yours to edit): the Status line says "Not yet met: R9 (N37, K63), R24 (K105)", and R9 and R24 still carry *(not yet met …)*. Both are built and tested at the interface (R9: `statements.test.mjs` "R9 …", `viewerPredicate`/`GATE_MARK` identical to membership's; R24: `grammar.test.mjs` "R24 NEAR …"). R25's mark goes with this job (met, `projection.test.mjs`). Wording only.
2. **Legacy suites red on `tranche/T10` without my change** (legacy-tests'): `bio-plane/test/bounds.test.mjs` and `bio-plane/test/hygiene.test.mjs` fail identically before and after this job's commit; the retrieval module suite and the other legacy suites that import `query.mjs` (search, rec108, rec114, rec121, gate-reads) pass, 63 of 65 either way.

## J3 · COMPLETE

**Entries applied.**
- **N104 (its share):** `MACHINE_READ_KINDS` is text-chain's (its R91), re-exported (`export { MACHINE_READ_KINDS }`); the list held here is gone. Tested under R6 (identity with text-chain's export) and R22.
- **N106 (its share), R25, per K327/K328:** `compile(query, {projection: {table, key}})`. The fields whose columns are retrieval R2's carry `proj: true` on `FIELDS`; with a relation, every statement joins `<table> bp` to `bundles b` on `bp.<key> = b.bundle_id`, keys the text index and every set leaf through `bp.fts_id` (`fm:` reads `fm_json` there), reads projection columns as `bp.<col>` (page, sort, facets, facetScan) and keeps the gate over `b`. `table` and `key` must be plain identifiers, else a warning and `bundles`; never interpolated otherwise, never a throw. With no relation every statement is byte-identical to before: 720 plans (12 queries × 5 row arms × 3 viewers × 4 option sets) compared against the pre-change module, 0 differ.

**Tests.** `projection.test.mjs` "R25 …": one corpus in two worlds (projection on `bundles`; projection in a fixture relation `proj_rel` keyed `bid`, whose `bundles` holds none of R2's columns, so a statement reading one off `bundles` fails), 23 queries × 5 row arms × 6 option sets × 3 viewers, every statement of every shape run in both and compared row for row (>3,000 statements); the relation named only when given, never `bundle_projection`; gate marks equal gate uses (R8); hostile values move only args (R7); six malformed relations warn and read `bundles`. A mutation (projection columns read off `b`) turns it red. `node --test bio-plane/test/m/query-language/`: 25 tests, 25 pass, 0 fail, 0 todo. Users (unchanged service without a relation): `bio-plane/test/m/retrieval/` plus the legacy suites importing `query.mjs`: 63 of 65 pass, identical before and after (J2).

**Checks** (after merging `tranche/T10` @ B2): format: 69 modules, 64 requirements files; 0 failures · architecture: 6 product files, 21 relative imports; 0 failures · coverage: 25 of 25 live requirement ids named by a test; 0 failures · ownership: 5 files changed by query-language between tranche/T10 and HEAD; 0 failures.

**Deferred:** nothing. **Other modules:** J2 (stale marks in my requirements, BOB's to edit; two legacy reds, legacy-tests'). No generated artifact made stale (`query.mjs` is in no bundle's inputs).

Size (session_018E96qPj3eH3p3P8yKxFQuJ): test runs 7, module lines 2680
