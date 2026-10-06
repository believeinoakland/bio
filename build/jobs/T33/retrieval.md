# retrieval (T33)

**Status** · session_01KwMzevnkFWbEu7foxwDgaj · depth 2 · WAITING ON BOB (J5) · handled B6

## J1 · QUESTION

R68: how a T33 field reaches a bundle. The owners' stated read contracts carry no column linking a row to the bundle or capture it rests on: events R37 (`events`, `when_cache`, `event_participants`), money R19, duties R20 and lines R17 name none; people states no read contract; standards states its reverse index only as a function (R21). Only entities R35 (`resolutions`: `capture_sha`, `bundle_id`, `entity_id`) and extraction's `reading_refs`/`readings` reach a bundle.

My best reading, which I am building now:
1. Each field is named to query-language (its R26, R29) as `{table, key: "bundle_id", col: "value"}` where `table` is a SQL view of this module's own over the owner's read contract, joined to the bundle through provenance's `register` (capture_sha → bundle_id) or entities' `resolutions`. A view stores nothing (R30 holds trivially), needs no promotion write and no `reproject`, and query-language's R26 filter (`key IN (SELECT key FROM table WHERE col = ?)`) reads a field with many values per bundle exactly. R68's "projection table of its own" is then used only where a value is computable from the bundle's own files at promotion; none of the T33 fields is (an event, money fact or duty is recorded against a capture after its promotion), so I hold none, and R71 declares `bundle_projection`, `bundles_fts`, `selections`, `selection_items` only.
2. A view is created only when every table and column it reads exists (checked at `migrate()` and before each compile); otherwise the field is named to no relation, query-language drops it with its warning (R29), and `searchFields` (R16) says `available: false`.
3. Joinable through stated contracts now: `cites` (reading_refs → readings → register), `person` and `post` (resolutions, `established = 1`, the entity id the member types). `holder` (lines R17 `holds` lines and `bound_cache` over the offices a bundle's resolutions name, valid at the bundle's `created`). The kind check (`person` only a person, `post` only an office) needs `entities.kind`, which R35 does not state: without it I match the entity id alone.
4. Not joinable until their owners widen their contract by one column each: `event`/`occurred` (`event_attestations` with `event_id` and `capture_sha`, or `dated_facts.capture_sha`); the money fields (the fact's source `capture_sha`); `obligor`/`owed_to` (the duty's `arising_in` capture or its source standard's bundle); `standard` (the `standards` table with `standard_id` and its instrument key, beside `reading_refs`). I write each view against the column name its owner's code uses; until the contract states it, the view is not created (2.) and the field reads as unavailable. Please either widen those five contracts (events, money, duties, standards, and `entities.kind`) or tell me the field should be projected here instead.

Also: `modules.json` lists none of R68/R69's new uses for retrieval (standards, lines, events, money, duties, people, local-facts, jurisdictions); I import only `local-facts` and `jurisdictions` (R69) and read the others through SQL. My COMPLETE will state the final uses.

## J2 · QUESTION

Replaces J1 (same subject, R68; refined after reading lines R18 and standards R21).

The owners' stated read contracts carry no column linking a row to the bundle or capture it rests on (events R37, money R19, duties R20, lines R17); people states none; standards' reverse index is a function (R21); and lines R18 forbids a second `holderAt`. So R68's three routes, as I am building them:

(a) **A view over a stated read contract** (a relation `{table: retrieval_field_<f>, key: "bundle_id", col: "value"}`, storing nothing; query-language R26's filter `key IN (SELECT key FROM table WHERE col = ?)` reads many values per bundle exactly). Built now: `cites` (extraction's `reading_refs`: `ref`, `ref_key`, with `bundle_id`); `person` and `post` (entities' `resolutions` joined to `entities.kind` = `person` / `office`; `kind` is in entities' code but not in R35's stated contract: please add it to R35).
(b) **A projection table of this module's own**, `bundle_terms (bundle_id, field, value)`, written in the promotion's transaction and by R3's `reproject`, from a provider the composition root hands `retrievalOf` per field (`terms: {standard: fn, holder: fn}`, `fn({bundleId, files, created}) → values`), so the owner's one rule answers (`standards.standardsFor` for `standard`; `lines.holderAt` over the offices the bundle names for `holder`, lines R18). Declared derived-rebuildable (R71). Limitation, stated: a value recorded after the bundle's promotion is not seen until it is re-projected.
(c) **A field neither supplies** is named to no relation; query-language drops it with its warning (R29); `searchFields` says `available: false`.

Needs your ruling: `event`/`occurred`, the money fields, `obligor`/`owed_to` have no bundle link in their owners' contracts. My best reading is (a) once each owner states one column more: events `event_attestations (event_id, capture_sha)` with `event_when_cache (event_id, start)`; money `money_facts.source_capture_sha`; duties `duties.arising_in` (a capture) beside `obligor`, `obligee`. I write each view against those names and create it only when the columns exist, so until then the field reads unavailable. Please confirm the names with those owners (P7: their jobs), or rule that they go through (b) with a provider each.

Also: `modules.json` lists none of R68/R69's new uses for retrieval; I import `jurisdictions` (R69's fallback) and take `local-facts` and the (b) providers from the composition root; COMPLETE will state the final uses.

## J3 · REPORT

Applied K1563 (merged tranche/T33 @ e07becea into job/T33/retrieval). Built and pushed: R68 (views over the widened contracts; `bundle_terms` for `standard`/`holder` by provider), R69 (`zone()`: local-facts' governing time_zone, else the combined profiles', else none), R70 (`runSaved`, `NOT_YOUR_QUERY`), R71 (all five tables through `declareTable`; derived ones rebuild byte for byte through `rebuildAndCompare`). Architecture, format, ownership: 0 failures; coverage 71/71.

Waiting on upstream merges before COMPLETE (K1563 (1)): 7 of my 133 tests are red only because query-language's T33 fields, R27 (local-day dates), R29 (drop with no relation) and R30 (`savedForm`) are not merged yet; against a local stand-in of those fields (not committed) all but the three that need R27/R29's exact behaviour pass. After query-language merges I re-run, and re-point my stand-in owner tables (`event_attestations`, `when_cache`, `money_facts`, `money_withdrawals`, `duties`) at events', money's and duties' own schemas once they merge. Please send a CHANGE (or RESUME) when query-language has merged.

For other modules (not mine to change):
1. plane (composition root): `retrievalOf(ctx, {terms})` must be handed the route-(b) providers, `terms: {standard: ({bundleId, files}) => ids, holder: ({bundleId, files}) => ids}`, from `standards.standardsFor` (the standards a bundle's readings cite, R21) and `lines.holderAt` (over the offices the bundle's resolutions name, on the bundle's date). Without them `standard:` and `holder:` read as unavailable (R68 (c)), never as an empty match. Synchronous: a promise is ignored. `localFacts` needs nothing: retrieval takes the host's own.
2. query-language (its R26): a field read through a relation is filtered exactly when the relation holds many rows per bundle (`key IN (SELECT …)`), but its facet and sort read `fieldValue`, a scalar subquery that takes one arbitrary row. R68's relations hold many values per bundle (a document concerns several people), so a facet on `person:` or a `sort:person` would count or order by an arbitrary one. Either query-language facets such fields over the relation's rows (each value counted once per bundle) and refuses or drops `sort:` on them with a warning, or R28 says they are filter-only.
3. record-core R77: `bundle_projection`'s `action_clock_overdue` is judged at the instant the row is written (R2, R53), so a rebuild at a later instant can differ for an action whose clock has passed in between; `rebuildAndCompare` then reports a difference that is the cache's age, not corruption. Holds byte for byte with a pinned clock (my R71 test). No change asked; noted for whoever reads a `same: false` on that column.

## J4 · REPORT

B4 applied (a4063de42f's parent): every compile and savedForm get query-language J2's second argument ({projection, fields, money} with money injected as retrievalOf's `money` dep until query-language imports it), zone in the query object. Against job/T33/query-language's query.mjs (local copy, not committed): retrieval 134/134 pass, R68's money-word test added. Waiting for the CHANGE at query-language's merge to re-run on tranche/T33 and COMPLETE.

## J5 · REPORT

B5 applied: tranche/T33 merged (K1582); the stand-ins for events' and money's tables are gone, and my tests run on their own schemas (`EVENTS_SCHEMA`, `MONEY_SCHEMA`); duties' table stays a stand-in by R20's columns until duties merges. Retrieval 134/134 pass on the real query-language. Format, coverage (71/71) and ownership: 0 failures.

Found on the real schemas, fixed in my module: events holds the when-cache as `event_when_cache` (its R37 calls it `when_cache`), so `occurred:` would never have gone live; the view now reads `event_when_cache`. Please align events R37's wording with its table name (a requirement edit, no code change).

What remains before COMPLETE:
1. duties' merge: then I point the `obligor`/`owed_to` test at duties' own schema and re-run.
2. `uses` (architecture, 2 failures now): retrieval gains `events` and `money` (my tests load their schemas; the views read their R37/R19 contracts), and `duties` at its merge. Final uses at COMPLETE: today's list plus events, money, duties.

Users of retrieval re-run (inquiry, citation, basis-versions, strength, intent, ratification, monitoring, scheduler, plane, migrate-released, query-language): all green. Red, and identically red on tranche/T33 @ 00b6cc2dd1's parent: ai-runs R18 (K1514), agent-worker `requirements.test.mjs`, actions R36/R48/R51/R52 ×5, action-clocks R10 ×3 (K1519), control-plane R22, R26, R43. None is retrieval's.

## J6 · COMPLETE

T33-40 complete on job/T33/retrieval (tranche/T33 @ K1585 merged in).

**Entries applied** (T33-40; K1450, K1481; answers B2 = K1563, B3 = K1568, B4, B5 = K1582, B6 = K1585):
- R68: each T33 field is named to query-language as `{table, key: "bundle_id", col: "value"}`. Route (a), a view over the owner's stated contract, created only when its tables and columns exist (re-checked when SQLite's schema version moves): `cites` (extraction's `reading_refs`), `person`/`post` (entities' `resolutions` + `entities.kind`), `event`/`occurred` (events' `event_attestations` + `event_when_cache`), `kind`/`phase`/`stage`/`basis`/`period`/`fund`/`party` (money's `money_facts` by `source_capture_sha`, withdrawn facts out), `obligor`/`owed_to` (duties' `duties` by `arising_in`, withdrawn duties out). Route (b): `bundle_terms` for `standard`/`holder`, written in the promotion's transaction and by `reproject` from the composition root's `terms` providers. Route (c): a field neither supplies is named to no relation; `searchFields` says `available`/`route`. money's closed words reach compile and `savedForm` through the `money` dep while query-language takes it injected.
- R69: `zone()` — local-facts' governing `time_zone` for the active profiles, else their combined profile value, else none; passed in every compile's query object.
- R70: `runSaved({form, owner, viewer, limit})` → `{ok, ids, total, truncated, limit, digest, at, warnings}`; `NOT_YOUR_QUERY` for every viewer but the owner and for an absent form, before anything runs; query-language's `savedForm` refusal passed through; writes nothing.
- R71: `bundle_projection`, `bundles_fts`, `bundle_terms` declared derived-rebuildable (sight `bundle`), with `rebuildProjection`/`rebuildText`/`rebuildTerms`; the text index rebuilds under its held keys. `selections`, `selection_items` stored, sight `owner`, cleared only by the whole-store purge.

**Deferred:** none.

**Found in other modules:**
- events R37 names the when-cache `when_cache`; its table is `event_when_cache`. Requirement wording to align (J5).
- `bundle_projection.action_clock_overdue` is judged when the row is written, so a later `rebuildAndCompare` can differ for an action whose clock passed in between (record-core R77); equal with a pinned clock. Noted, no change (K1568 (3)).
- plane must hand `retrievalOf(ctx, {terms: {standard, holder}})` (in plane's START, K1568 (1)), and `money` until query-language imports money itself.

**Final uses:** record-grammar, jurisdictions, record-core, membership, promotion, provenance, provenance-routes, capture, extraction, content, entities, local-facts, connections, observation-log, query-language, **events, money, duties** (the three new: R68's views read their contracts; the tests load their schemas).

**Tests and checks** (on HEAD after the K1585 merge):
- retrieval: `node --test bio-plane/test/m/retrieval/` → tests 134, pass 134, fail 0.
- users of retrieval re-run: inquiry 170/0, citation 55/0, basis-versions 127/0, strength 115/0, intent 65/0, ratification 204/0, monitoring 111/0, scheduler 66/0, plane 85/0, migrate-released 1/0, query-language 45/0. Red and identically red on tranche/T33 (not retrieval's): ai-runs R18 (K1514), agent-worker `requirements.test.mjs`, actions R36/R48/R51/R52 ×5, action-clocks R10 ×3 (K1519), control-plane R22, R26, R43.
- `checks/format.mjs`: 0 failures. `checks/coverage.mjs retrieval`: 71 of 71 live ids named, 0 failures. `checks/ownership.mjs retrieval tranche/T33`: 7 files, 0 failures. `checks/architecture.mjs retrieval`: 3 failures, each the missing `uses` edge events, money, duties named above (K1563 (3): uses set at COMPLETE).

Size (session_01KwMzevnkFWbEu7foxwDgaj): test runs 24, module lines 2681
