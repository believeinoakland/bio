# T3 · membership — job record

Session: `session_01LSy7nZpkVyvEV81G4a5SYA` (MEMBERSHIP #1)

**Status** · IN PROGRESS, 2026-09-26. Job for module `membership`, tranche T3, branch `job/T3/membership` (from `tranche/T3` @ af11bd11c2). Entries: T3-2, N18, R62, R63, K57, REC-224, REC-226. Waiting on: BOB's answer to Q1 (carrying on on my best reading).

## Questions

### Q1 · how membership reaches record-core, and the parts of the extraction outside my paths

1. **record-core's shape.** record-core's Provides name services (`bundleInfo`, `listByType`, `declarePurge`, `transact`) but no module shape, and its job has pushed nothing yet. **Best reading, on which I build:** `bio-plane/src/membership/index.mjs` exports a class `Membership`, constructed with `{ sql, core }`: `sql` the store's SqlStorage, `core` an object carrying record-core's Provides as methods of those names. The legacy store builds one per Store instance and passes itself as `core` (so record-core's job's delegating methods on `Store`, e.g. `store.bundleInfo`, reach it); membership joins only `bundles.bundle_id`/`object_type` in its own SQL (R37) and reads a title through `core.bundleInfo`. Its tests run against a stub `core` implementing record-core's Provides over the same database. If record-core exposes a different shape, I adapt at the merge.
2. **`viewerPredicate` in `query.mjs` (query-language, layer 5).** I cannot edit `query.mjs`. Membership gets its own `viewerPredicate` and `GATE_MARK` (R43, K57); `query.mjs` keeps its copy until query-language's job makes it a re-export of membership's. legacy-store keeps importing it from `query.mjs` (changing that import line would add a line to an import of a module not mine). For BOB to route: a `query-language` entry.
3. **The old battery** (`bio-plane/test/*.test.mjs`, legacy-tests) keeps reaching this code through legacy-store's methods and ops, which delegate to membership; I change no old test.
