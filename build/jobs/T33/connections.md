# connections (T33)

**Status** · session_01MhqJwCndhjhNCVnEjDphvL · depth 2 · COMPLETE · handled B1

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
