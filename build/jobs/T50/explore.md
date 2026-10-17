# explore (T50)

**Status** · session_01GeqMMCaEHa6q6oxUuwc2TJ · depth 2 · COMPLETE · handled B4

## Completion (T50-63 · explore)

- **Applied:** R25. `exploregraph` steps keep `attached_by` and `at` when the hop carries them (a hop without them answers neither key). Every node carries `label` (the entity's canonical label for an `ENT-` id, else `null`; never the id) and `entity_kind` (`null` for a non-`ENT-` node). Names and kinds come from `entities.labelsOf({ids, viewer})` (R56), read in reads of at most 500 ids; sight (R7) is unchanged, since only listed nodes are read. `exploreOf` gains `deps.entities` (default `entitiesOf(host)`, reached on first use). Code: `src/explore/graph.mjs`, `src/explore/index.mjs`. No new words; no inline English added.
- **Tests:** two R25 tests added in `graph-chain.test.mjs` (the person/step_source/unnamed-organisation case with its control; hidden step and 500-id bound); two R21 node-shape assertions updated for the new keys. They use a stand-in `labelsOf`; the real entities job (T50-59) had not merged `labelsOf` at my start, so the real-owner path is guarded by `typeof labelsOf === 'function'` (absent reader: label/kind `null`, never invented). Re-run against the real `labelsOf` once entities merges.
- **Return shape assumed** for `labelsOf` (R56 does not state it): a map id → `{label, kind}` or `null`, or the same under `.labels`. If entities answers another shape, say so in a `CHANGE`.
- **Deferred:** none. **Other modules:** `build/modules.json` explore `uses` lacks `setup-words` (BOB's note 1 says it was added, K3632); I use no keyed words in this job, so nothing needs it yet; it is BOB's file.
- **Ran:** `node --test bio-plane/test/m/explore/` 50 tests, 50 pass; format 0 failures; architecture 0 failures; coverage explore 25 of 25 ids named, 0 failures; ownership 0 failures. `checks/run.mjs` over the product: other modules' coverage reds (retrieval, screens-*, standards …) are inherited, none explore's.
- Size (session_01GeqMMCaEHa6q6oxUuwc2TJ): test runs 4, module lines 1043

## J1 · COMPLETE

R25 met: exploregraph steps keep attached_by/at; nodes carry label and entity_kind via entities.labelsOf (R56), read in <=500-id reads. 50/50 explore tests pass; format, architecture, coverage (25/25) and ownership 0 failures. labelsOf was not yet merged from entities at my start: built against R56 with a guarded call and a stand-in in tests; assumed return shape is a map id -> {label, kind}|null (see my record). Please send CHANGE once entities merges so I re-run against the real read. modules.json: explore uses lacks setup-words (your note 1); unused by this job. Details in build/jobs/T50/explore.md.

## J2 · QUESTION · re B2

Merged tranche/T50; key screen.explore.unnamed.why = 'named in {n} documents only by an account number' is in setup-words. Two gaps stop me reading it for an unlabeled node:
1. {n} has no source. R25/entities R56 give only {label, kind}; neither says how many documents name the entity only by an identifier. My best reading: entities (or another owner) would answer that count per unnamed ENT- id, and explore adds to each label-null ENT- node a field (e.g. unnamed_why) = word('screen.explore.unnamed.why', {n}). Without a count I would have to invent n or leave the sentence out. Which owner answers n, with what read, and what does a node show when n is 0 or unknown (I propose: no unnamed_why key)? R25 would also need the field named.
2. build/modules.json explore uses lacks setup-words (needed for word(), architecture would fail); it is your file.
I carry on with nothing else pending; the rest of R25 stands as pushed.

## Re-run on B4 (entities merged)

- Merged `tranche/T50`. The real `entities.labelsOf` answers `{ok, labels: {id: {label, kind}|null}, count}`: the shape the code already read, so no code change. Added a real-owner test (`real-owners.test.mjs`, R25: city and vendor labelled and kinded by the real registry; an unrecognised viewer sees no names).
- Ran: `node --test bio-plane/test/m/explore/` 51 tests, 51 pass; format, architecture, coverage, ownership as below.
- Size (session_01GeqMMCaEHa6q6oxUuwc2TJ): test runs 7, module lines 1043

## J3 · COMPLETE · re B4

Merged tranche/T50 with entities. The real labelsOf answers the shape my code already read, so no code change; added a real-owner R25 test (labels and kinds from the real registry; unrecognised viewer sees none). 51/51 explore tests pass; format, architecture, coverage (25/25), ownership 0 failures. Record updated.
