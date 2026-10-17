# explore (T50)

**Status** · session_01GeqMMCaEHa6q6oxUuwc2TJ · depth 2 · WORKING · handled B1

## Completion (T50-63 · explore)

- **Applied:** R25. `exploregraph` steps keep `attached_by` and `at` when the hop carries them (a hop without them answers neither key). Every node carries `label` (the entity's canonical label for an `ENT-` id, else `null`; never the id) and `entity_kind` (`null` for a non-`ENT-` node). Names and kinds come from `entities.labelsOf({ids, viewer})` (R56), read in reads of at most 500 ids; sight (R7) is unchanged, since only listed nodes are read. `exploreOf` gains `deps.entities` (default `entitiesOf(host)`, reached on first use). Code: `src/explore/graph.mjs`, `src/explore/index.mjs`. No new words; no inline English added.
- **Tests:** two R25 tests added in `graph-chain.test.mjs` (the person/step_source/unnamed-organisation case with its control; hidden step and 500-id bound); two R21 node-shape assertions updated for the new keys. They use a stand-in `labelsOf`; the real entities job (T50-59) had not merged `labelsOf` at my start, so the real-owner path is guarded by `typeof labelsOf === 'function'` (absent reader: label/kind `null`, never invented). Re-run against the real `labelsOf` once entities merges.
- **Return shape assumed** for `labelsOf` (R56 does not state it): a map id → `{label, kind}` or `null`, or the same under `.labels`. If entities answers another shape, say so in a `CHANGE`.
- **Deferred:** none. **Other modules:** `build/modules.json` explore `uses` lacks `setup-words` (BOB's note 1 says it was added, K3632); I use no keyed words in this job, so nothing needs it yet; it is BOB's file.
- **Ran:** `node --test bio-plane/test/m/explore/` 50 tests, 50 pass; format 0 failures; architecture 0 failures; coverage explore 25 of 25 ids named, 0 failures; ownership 0 failures. `checks/run.mjs` over the product: other modules' coverage reds (retrieval, screens-*, standards …) are inherited, none explore's.
- Size (session_01GeqMMCaEHa6q6oxUuwc2TJ): test runs 4, module lines 650
