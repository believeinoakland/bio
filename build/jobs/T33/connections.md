# connections (T33)

**Status** · session_01MhqJwCndhjhNCVnEjDphvL · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four points where R62–R65 meet connection-grammar's merged code (T33-5) and cannot be read literally. I am building on the best reading of each now; none stops me.

(1) R62 vs connection-grammar R9's `at` check. The battery requires one fixture item `in` at the date and one `out`. A co-mention states no dates (R63: `valid` unstated), so `validAt` answers `undetermined` for every item at every date; no item can be `in` or `out`. Best reading: the test runs `ownerConformance` over my fixture and requires `ok` except the two `at` failures that name the fixture's `in` and `out` items, which are inapplicable to an undated kind; it also asserts that every item is returned marked `undetermined` and none is dropped as `out`. Every other check (shape, kinds, sight, paging, derivedId, determinism, hub) must pass.

(2) R65's hub vs connection-grammar R6/R19. The registry refuses as OWNER_NONCONFORMING any `hub` with set_size ≤ 1,000 (BOUNDS.hub), or with items beside it. An entity hub (over 32 documents) is per entity, while the node's other entities still give items. Best reading: the entity hubs stepped around go in their own list, `hubs: [{entity, set_size, why}]`, beside the items. `hub` (singular) keeps connection-grammar's meaning: the node's own set over BOUNDS.hub, with no items. set_size counts only documents (captures) the viewer may see, and the 32-document test is made on that count, so a hidden document neither shows nor flips the answer (R33, connection-grammar R7). The warn band (250–1,000) adds `set_size` and a `says` sentence to the answer.

(3) R63's id. `derivedId` takes only {kind, from, to, as_of, method}, with from/to the two bundle ids. Two connections between the same two documents through different entities, derived at the same instant, would share an id. Best reading: one item per (document pair, entity), the strongest row when several captures of the same bundles qualify (ties: capture digests); from/to in sorted order, so either end gives the same id; `as_of` the row's derivation time `at`; `method` R1's pair rule qualified by the entity, `strongest-graded/first-reference-by-sort through <entity_id>`. `derived.inputs` names the entity and each end's capture and determining reference. A pair of captures of one bundle (from = to) is not a connection between two documents and is not answered.

(4) R64 needs the last derivation's truncation, which no table holds today (only observation-log's statement says it). Best reading: a new table, `connection_derivations` (entity_id PK, documents, document_limit, resolution_rows, truncated, at), written by `derive` in its transaction. It has no bundle column, so it is cleared whole-store only, like `connection_dirty` (R36), and declared under R67 with `sight: group`, `derive: stored`. R36's list and R67's list would each gain it; that is BOB's wording. An item through a truncated entity carries `truncated: true`, and the answer carries `truncated: true` and `bounds: [{entity, documents, document_limit, resolution_rows, why}]`.

Also, for explore (no change asked of me): `neighbours` is per store host, while the registry is per isolate. I register at load into the default registry a read that takes the host from an extra argument `host`, which R19 passes through unchanged, or else from the one instance created in the isolate; with several instances and no `host`, it refuses `OWNER_HOST_AMBIGUOUS`. Each instance also exposes `k.neighbours(args)`. explore's job will need to pass `host`.

## J2 · REPORT

Two things for BOB, both outside my paths:

(1) modules.json: `connections`' `uses` lacks `connection-grammar`. My requirements' Uses has it (T33-29; K1505 (7)), but BOB's opening edit did not add the edge. Architecture check: 3 failures, all this one edge (src/connections/index.mjs, src/connections/mentioned.mjs, test/m/connections/owner.test.mjs import connection-grammar). Please add `connection-grammar` to connections' `uses`. My final uses: record-grammar, subresources, text-chain, record-core, membership, promotion, provenance, capture, extraction, content, entities, connection-grammar. civil-time is not needed.

(2) Generated artifact made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` (owned by not_product) bundles connections' source (CONNECTIONS_TABLES, the declareTable call, the new mentioned.mjs). To be regenerated at the layer close.

Requirement wording, if J1 (4) stands: R36's purge list and R67's group-sight list would each gain `connection_derivations` (whole-store only; sight group).

## J3 · COMPLETE

T33-29 applied, on my best readings in J1 (no answer yet; a CHANGE re-opens the job).

Entries applied:
- R62: `src/connections/mentioned.mjs`. The owner `connections` registers at load into connection-grammar's default registry: kind `mentioned_together`, word "mentioned together", class `derived`. The registered read takes the store from a `host` argument, which R19 passes through, else from the isolate's one instance; otherwise it refuses `OWNER_HOST_AMBIGUOUS` or `OWNER_NOT_READY`. `k.neighbours(args)` is the per-instance read. The battery runs over my own fixture, with only the inapplicable "in at the date" check failing (J1 (1)).
- R63: one item per (document pair, entity), from/to in sorted order, `derivedId` over the pair rule through the entity at the derivation time (J1 (3)). Each item has evidence (the two determining references with positions) and `valid` unstated, always marked undetermined. Sight: a hidden document is neither an item nor counted, and a hidden node answers `{items: []}`. The read never derives and writes nothing.
- R64: new table `connection_derivations`, written by `derive` in its transaction. Items through a capped entity carry `truncated`; the answer carries `truncated` and `bounds` (J1 (4)).
- R65: an entity with more than 32 visible documents goes in `hubs: [{entity, set_size, why}]`. `hub` is used only above BOUNDS.hub, with no items. A set from 250 to 1,000 states `set_size` and `says` (J1 (2)).
- R66: `THEME_ID_RE` and `THEME_REF_RE` are built from `idPattern("THEME")`.
- R67: all 11 tables declared through `declareTable` with their classes; `declarePurge` is no longer used.

Deferred: none.

Other modules (J2): modules.json lacks the edge connections → connection-grammar (BOB's); `bio-plane.bundled.mjs` is stale (layer close). For explore: to reach this owner through the default registry, pass `host`.

Tests and checks:
- `node --test test/m/connections/`: tests 117, pass 117, fail 0 (10 new in owner.test.mjs).
- Wider: record-core, content mint, connection-grammar, sources invariants, observation-log, inquiry-grammar, test/system: 272 tests, 270 pass, 2 fail.
  - row-census: K1542's named red, also red on tranche/T33.
  - fleetbundles: the bio-plane bundle is stale from my source. It is green on tranche/T33 and regenerates at the layer close.
- format: 0 failures. coverage: 67 of 67 ids named, 0 failures. ownership: 6 files, 0 failures.
- architecture: 3 failures, all the missing `uses` edge to connection-grammar (J2).

Final uses: record-grammar, subresources, text-chain, record-core, membership, promotion, provenance, capture, extraction, content, entities, connection-grammar.

Size (session_01MhqJwCndhjhNCVnEjDphvL): test runs 12, module lines 2905
