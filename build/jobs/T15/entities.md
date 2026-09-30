# entities (T15)

**Status** · session_01KSDYyzB5ig2GsNMmtWdu8B · depth 2 · WORKING · handled B3

## J1 · QUESTION

Three readings of R38/R39. I built each one (commit 326b976ab4). An ANSWER that differs is a CHANGE.
1. **R38's "readEntity answers each resolution's reports beside it".** R5 answers no resolutions, so I read this as: the entity carries `defects: [{capture_sha, ref, reason, source, by, at}]`, oldest first, bounded by R39 (`defects_truncated`), with `defect_count`. To apply R32 to `by`, `readEntity` and `entitiesByAlias` now take `viewer` (`op=entity`, `op=entitybyalias` read `q("viewer")`). An absent viewer fails closed: `by` is withheld wherever the document names a bundle.
2. **R38's `source`.** A value that is not `{module, id}` with both non-empty strings is read as `null`, a member's own report. It is not refused, because R38's refusal list is closed.
3. **R39's `resolutions_resting`.** R39 calls it a collection, so it changes from a count to a list, `[{capture_sha, ref, grade}]`, by capture then reference, at most 500, with `resolutions_resting_truncated` and `limit`. R14/R15's per-resolution `defects` are also capped at 500, with `defect_count` whole (an exact COUNT).

## J2 · REPORT

Found in other modules while applying R39 (commit 326b976ab4):
1. **intent: red test.** `test/m/intent/bounds.test.mjs`:77 ("R4 progress measures at most 1,000…") fails: it expects [1000, 1000, …] and gets [501, 501, …]. It passes on `tranche/T15`. Intent's `#measure` (`src/intent/index.mjs`:371) walks the anchor's related entities through `readEntity(...).entity.relations`. R39 now bounds that list at 500 and publishes `relations_truncated`, which intent does not read. So intent's R4 either reads `relations_truncated` into its own `truncated`, or needs a relation-walk service from entities (a requirements change, which is yours to decide). I changed nothing in intent.
2. **control-plane (layer 11):** route `op=resolutiondefect` → `reportResolutionDefect(body)`, stamping `by` (R4). Also stamp `viewer` on `op=entity` and `op=entitybyalias`: they read it now (R38/R32 on `by`). The DO entry `resolutiondefect` is in `entitiesOps`.
3. **Generated artifacts, stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs`, against `src/entities/{index,checks,schema}.mjs`.
4. **legacy-tests:** `test/meaning-bounds.test.mjs` fails as a whole file on `tranche/T15` with or without this change, so I could not measure it. R39 should take `aliaswithdraw` and `entity` off its BARE roster (the two members its 38 → 40 note reported to entities). Its ceiling and floor are legacy-tests' to move.
5. **promotion (N318):** row **C-91.7 `NO_SUCH_RESOLUTION`** was added at layer 5: `awaiting stamp` for T16.

## J3 · COMPLETE

**Entries applied** (layer 5's entities bullet; N345, N351; B1). Commit 326b976ab4: 6 files, +418 −44, with a new test file `test/m/entities/defects.test.mjs`.
- **R38** `reportResolutionDefect({captureSha, ref, entityId, reason, source, by})`, DO op `resolutiondefect` in `entitiesOps`. Refusals in order: `NO_SHA` (extraction's `noSha`), `NO_REF`, `NO_ENTITY` (R37), `NO_REASON`, `NO_SUCH_RESOLUTION` (C-91.7). It appends to the new table `resolution_defects`: reason trimmed, at most 2,000; `source` `{module, id}` or null; `by`; the instant. A repeat by the same `by` from the same `source` answers `already: true` and writes nothing. It moves nothing: the grade, the resolution row and `strongestByCapture` are unchanged, and a test checks this. `resolutionsFor` (R14) and `concerns` (R15) answer `defects: [{reason, source, by, at}]` and `defect_count` beside each resolution. `readEntity` and `entitiesByAlias` answer the entity's `defects` (J1 reading 1). R32 withholds `by` from a viewer who may not see the document.
- **R29** C-91.7 `NO_SUCH_RESOLUTION` added to `ENTITY_CHECKS` with its required translation, inside the DEC-49 region `is-resolution-held`.
- **R30** `resolution_defects` is declared to the purge, keyed to its bundle.
- **R39** Each of `readEntity`'s aliases, relations and defects is at most 500 in its stated order, read one past, with `aliases_truncated`, `relations_truncated`, `defects_truncated` and `limit`. Alias withdrawal's `resolutions_resting` is now a bounded list (J1 reading 3), read through a new indexed column `resolutions.basis_norm`: the fold of a machine resolution's basis. It is outside R35's contract. `migrate` adds it and fills it once for older stores, and a test covers that.
- **Stamps named** (the route is control-plane's, layer 11): `op=resolutiondefect` stamps `by`. `op=entity` and `op=entitybyalias` now read `viewer`.
- **`not yet met` to strike:** R14, R15, R29, R30, R38, R39.

**Rows (N318):** C-91.7 `NO_SUCH_RESOLUTION` added. It is `awaiting stamp` for T16.

**Deferred:** none.

**Found in other modules / artifacts:** see J2. In short: intent's R4 bounds test is red, because it walks relations through `readEntity`, which is now capped at 500. The control-plane route and stamps are owed. Two bundles are stale (`bio-plane`, `agent-worker`). The `meaning-bounds` roster should lose `aliaswithdraw` and `entity`. civicos-ui and affordances have no hit for any added code. The UI reads `op=entity` (`app.html`:16592, :17243), whose new keys are additive.

**Tests and checks** (base `tranche/T15` @ 5baafb97ba's parent f35282cd11):
- `node --test test/m/entities/`: tests 49, pass 49, fail 0, todo 0.
- Users of entities, run because the answer shapes changed: connections 66/0, progressions 42/0 (1 todo), bias 53/0 (1 todo), observation-log 45/0, retrieval 65/0, inquiry 60/0 (1 todo), basis-versions 47/0, contradiction 28/0, scheduler 46/0 (2 todo), affordances 76/0, control-plane 52/0. **intent: 50 pass, 1 fail** (J2 item 1). Without this change it is 51/0.
- `test/meaning-bounds.test.mjs`: the file fails with and without this change, so it measures nothing here.
- `test/fleetbundles.test.mjs`: fails only on the two stale bundles.
- No layer tests are named in `build/manifest.md`.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture entities`: 0 failures. `coverage entities`: 39 of 39 live ids named; 0 failures. `ownership entities tranche/T15`: 7 files; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01KSDYyzB5ig2GsNMmtWdu8B): test runs 22, module lines 1247
