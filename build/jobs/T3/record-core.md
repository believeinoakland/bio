# Job record: record-core, T3

**Status** · COMPLETE. RECORD-CORE #1, session `session_0128RDfHecKMSruEijV3kfAe`, branch `job/T3/record-core` (cut from `tranche/T3` @ 5355f81ae1). Entries: T3-1, K57, D-674, N10 (record-core's share).

## How the module is reached (stated early, for membership and promotion)

`bio-plane/src/record-core/index.mjs` exports `recordOf(ctx, opts?)`: the one `RecordCore` instance per Durable Object storage (`ctx.storage`, which carries `sql` and `transactionSync`), created on first call and returned to every later caller, so every module in the object shares one transaction depth, one purge declaration list and one evidence binding. `opts` (read on the first call only): `{ evidence: <R2 bucket> | null, evidencePrefix: "<store>/captures/" }`. The instance's methods are the Provides, by their names: `allocId`, `allocIdOp`, `mintOpaqueId`, `acquireLease`, `readFile`, `readImage`, `auditPass` (async), `declarePurge`, `purge`, `getSetting`, `setSetting`, `transact`, `commit`, `bundleInfo`, `listBundles`, `listByType`, `evidenceStore`; plus `RecordCore.snapPath(path, snapKey)` (R15's fixed derivation), `RecordCore.GATED_ID_PREFIXES`, and `RECORD_SCHEMA` (the DDL of this module's own tables, which the legacy schema interpolates until it is divided). A user imports `recordOf` from `../record-core/index.mjs` and calls `recordOf(this.ctx)`.

## Questions to BOB

**Q1 (sent with the shape above).** Three interface points the requirements leave open; my best readings, on which I am building:
1. `auditPass({after, limit, visible, context})`: the legacy sweep hands the check catalogue two registries per bundle that later modules build (`earnedRegistry`, `publishedRegistry`); without them earned and inherited legs report as offenders. Reading: an optional `context(bundleId) → extra checkBundle options`, supplied by the caller (legacy-store today). `visible` is a JS predicate as R19 says; the legacy wrapper keeps its own `total`, `route` and `membership` additions on top of the page report.
2. `mintOpaqueId`'s boot seed (D-432) reads the live rows of other modules' tables (cases, tasks, review grants …), which R31 forbids record-core to read on its own. Reading: `seedMintLedger(sources)`, sources `[[prefix, table, column], …]` declared by the caller (legacy-store today, each owner after its extraction), exactly as `declarePurge` takes other modules' tables; the counter half (from `seq`) is record-core's own.
3. `declarePurge(module, tables, {exempt})`: a table entry is a name (keyed to a bundle by `bundle_id`, when it has that column) or `{name, keys: [columns], whole: "<WHERE clause>"}` for a table keyed to a bundle by other columns (`connections.a_bundle_id`/`b_bundle_id`, `project_participants.project_id` …) or cleared only in part by the whole-store form (`case_documents WHERE ratified_at IS NULL`). Legacy-store declares its tables in its old order.

**Q1 answered** by BOB (ANSWER and CHANGE, tranche/T3 @ cd72237c49, K61): readings accepted as R40, R45, R46; the shape stated as R39; new R41–R44. Merged and built.

**Q2 (R16 against C-12.1), answered by BOB (K65): the D-700 form adopted, R16 reworded; merged and tested.** R16 says the manifest entries are given back in write order, "never resorted by a caller-chosen key". The catalogue's C-12.1 (`legacy-checks`) requires the manifest document's keys in ascending order and reports `manifest keys out of order` otherwise, so literal write order makes C-12.1 fire on every bundle whose snap keys are not monotonic in write order (measured: `cite.test.mjs` 3 failures). The old plan's integrated fix for exactly this, D-700 (`land/worker/D-700`, not in the tranche), kept the document key-sorted and gave every entry `seq`, its write-order rank, with C-20.1 walking `seq` (`historyWriteOrder` in bio-checks.mjs, which promotion's R30 needs). **Best reading, built:** the D-700 form: entries sorted by key (C-12.1 holds), each carrying `seq` = its rank in the order this module recorded it (rowid). If you rule literal write order instead, C-12.1 must change with it (a legacy-checks entry).

## Entries applied

- **T3-1** Extracted per the map and requirements (K23, K31): `bio-plane/src/record-core/index.mjs` (`recordOf`, `RecordCore`) and `schema.mjs` (`RECORD_SCHEMA`: `bundles`, `files`, `history`, `manifest`, `leases`, `seq`, `minted_ids`, and the new `settings`). Moved out of `legacy-store`: `allocId`, `allocIdOp`, `#nextSeq`, `GATED_ID_PREFIXES`, `UNTAILED_GATED_PREFIXES`, `#mintOpaqueId`, `#seedMintLedger`, `acquireLease`, `readFile`, `Store.snapPath`, `readImage`, the catalogue loop of `auditPass`, the body of `purge`, and the seven tables from `schema.mjs`. New services: `transact`, `commit`, `bundleInfo`, `listBundles`, `listByType`, `head`, `manifestEntry`, `livePaths`, `declarePurge`, `getSetting`/`setSetting`, `evidenceStore`, `migrate` (additive `bundles.project`).
- **Legacy rewiring (mechanics §12.2):** every caller uses `recordOf(this.ctx)`; the constructor binds the evidence bucket and declares legacy-store's purge tables in its old purge's order (R46 form); `purge` and `auditPass` keep their op answers (`#counts` proof, `route`, `total`, `membership`) around record-core's; the one per-bundle `bundles_fts` delete (keyed through `bundles.fts_id`) and the `capture_requests.lead_inquiry` nulling stay in legacy's `purge`, inside the same `transact`. `#mintProjectId` and `#MINT_LEDGER_LIVE` stay in legacy-store (promotion's and the seed sources' owners' respectively). `promote()`/`reopen()` untouched (K62).
- **K57** `listByType` (R36), the `bundles` read contract (R37), `evidenceStore()` (R38; callers still reach the binding directly, K49, theirs to move).
- **D-674** R16 met in the D-700 form (K65): entries key-sorted, each with `seq`, its write-order rank; `manifestEntry` carries `seq` too.
- **N10** R26: `jurisdiction_profiles` is a setting, an ordered list of distinct profile ids, refused otherwise.
- **K61** R39–R46 built as stated.

## Deferred

Nothing in this module.

## Found in other modules (REPORT)

1. **legacy-tests:** ten suites fail on this branch and pass on the base, all source-anchored on code that moved (mechanics §12.3, retire or re-anchor): `hygiene.test.mjs` (purge TABLES list, exemptions, schema is static text, flat `src/` walk), `opaque-ids.test.mjs` and `project-mint.test.mjs` (`Store#mintOpaqueId`, the static gated list), `bias`, `action-loop`, `actionquote`, `capturerequests`, `caselifecycle`, `publishedcase` (purge's TABLES list / DELETE lines). Controls reading the same text (`mint-ledger.*`, `opaque-ids.control`, `project-mint.control`, `clockadvance.control` and siblings) go with them. `nc-rec129.mjs` fails on the base and passes here.
2. **legacy-checks:** D-700's C-20.1 walk over `seq` (`historyWriteOrder`, branch `land/worker/D-700`) is not in the tranche; promotion's R30 needs it.
3. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale against the plane's source; BOB regenerates at the close.
4. **membership:** its tables (`project_participants`, `project_owner_votes`, `project_visibility`, `project_sight`, `project_join_requests`) are declared by legacy-store in its constructor's list; membership's `declarePurge` (its R59) must remove them from that list, or be refused `TABLE_DECLARED`.
5. **legacy-store comment** at `#migrate` still names `#seedMintLedger`; harmless, left for its next job.

## Tests and checks

- Module tests `node --test bio-plane/test/m/record-core/`: tests 33, pass 33, fail 0.
- Legacy suites touching the moved services (154 files, each run on this branch and on `tranche/T3`): identical except the ten source-anchored suites above and `nc-rec129` (improved). `purge.test.mjs` 14/0, `cite.test.mjs` 73/0.
- Layer tests: none named in `build/manifest.md`.
- Checks (civicos-process 2c99230): format: 62 modules, 23 requirements files; 0 failures · architecture: 4 product files, 6 relative imports; 0 failures · coverage: 46 of 46 live requirement ids named by a test; 0 failures · ownership: 7 files changed; legacy-store: 74 line(s) added, 1114 removed; 0 failures.

## ADDED lines in legacy-store (ownership check)

```
bio-plane/src/schema.mjs:1  import { RECORD_SCHEMA } from "./record-core/index.mjs";
bio-plane/src/schema.mjs:6  ${RECORD_SCHEMA}
bio-plane/src/store.mjs:223  import { recordOf } from "./record-core/index.mjs";
bio-plane/src/store.mjs:863  // record-core (R21, R46): the tables legacy-store still owns, declared to purge in the order its purge cleared
bio-plane/src/store.mjs:864  // them. A name is keyed to a bundle by bundle_id; `keys` names the others' (none: only the whole-store purge
bio-plane/src/store.mjs:865  // clears it); `whole` limits what the whole-store purge clears. Each owner declares its own when extracted (K23).
bio-plane/src/store.mjs:866  recordOf(ctx, { evidence: env.CAPTURES ?? null, evidencePrefix: () => `${this.#ownNamespace() || "bio"}/captures/` })
bio-plane/src/store.mjs:867  .declarePurge("legacy-store", [
bio-plane/src/store.mjs:868  "refs", "register", "readings", "reading_refs", "reading_ref_terms", "reading_text_source",
bio-plane/src/store.mjs:869  "text_attestations", "resolutions", "progression_instances", "reading_history", "progression_exceptions", "inquiry_basis",
bio-plane/src/store.mjs:870  "inquiry_exclusions", "inquiry_basis_versions", "inquiry_basis_version_legs", "action_basis", "correspondence", "bias_statements",
bio-plane/src/store.mjs:871  "action_quotes", "action_law_proposals", "provenance_route_marks", "case_revision_flags", "content", "transcriptions",
bio-plane/src/store.mjs:872  "transcription_attestations", "lead_shares", "observation_attributions", "theme_placements", "proposed_readings", "inquiry_run_surfacings",
bio-plane/src/store.mjs:873  "inquiry_migration_replays", "capture_text",
bio-plane/src/store.mjs:874  { name: "bias_adoptions", keys: ["bundle_id", "scope_id"] },
bio-plane/src/store.mjs:875  { name: "bundles_fts", keys: [] },
bio-plane/src/store.mjs:876  { name: "connections", keys: ["a_bundle_id", "b_bundle_id"] },
bio-plane/src/store.mjs:877  { name: "contradiction_candidates", keys: ["a_bundle_id", "b_bundle_id"] },
bio-plane/src/store.mjs:878  { name: "connection_pair_choices", keys: ["a_bundle_id", "b_bundle_id"] },
bio-plane/src/store.mjs:879  { name: "project_participants", keys: ["project_id"] },
bio-plane/src/store.mjs:880  { name: "project_owner_votes", keys: ["project_id"] },
bio-plane/src/store.mjs:881  { name: "project_visibility", keys: ["project_id"] },
bio-plane/src/store.mjs:882  { name: "project_sight", keys: ["project_id"] },
bio-plane/src/store.mjs:883  { name: "project_join_requests", keys: ["project_id"] },
bio-plane/src/store.mjs:884  { name: "queue_state", keys: ["case_id"] },
bio-plane/src/store.mjs:885  { name: "published_edges", keys: ["from_bundle", "to_bundle"] },
bio-plane/src/store.mjs:886  { name: "monitor_fired", keys: ["subject"] },
bio-plane/src/store.mjs:887  { name: "suggest_refusals", keys: ["target"] },
bio-plane/src/store.mjs:888  { name: "capture_requests", keys: ["target"] },
bio-plane/src/store.mjs:889  { name: "case_documents", keys: [], whole: "ratified_at IS NULL" },
bio-plane/src/store.mjs:890  { name: "case_exclusions", keys: [], whole: "NOT EXISTS (SELECT 1 FROM case_documents d WHERE d.case_id = case_exclusions.case_id AND d.edition = case_exclusions.edition)" },
bio-plane/src/store.mjs:891  { name: "capture_text_fts", keys: [] }, { name: "selection_items", keys: [] }, { name: "selections", keys: [] }, { name: "review_comments", keys: [] }, { name: "statement_acknowledgements", keys: [] }, { name: "review_grants", keys: [] },
bio-plane/src/store.mjs:892  { name: "case_drafts", keys: [] }, { name: "tasks", keys: [] }, { name: "task_queue", keys: [] }, { name: "source_reachability", keys: [] }, { name: "monitor_tick_epoch", keys: [] }, { name: "monitor_address_type", keys: [] },
bio-plane/src/store.mjs:893  { name: "link_verdicts", keys: [] }, { name: "links", keys: [] }, { name: "captured_locators", keys: [] }, { name: "site_asset_refs", keys: [] }, { name: "site_assets", keys: [] }, { name: "reuse_verdicts", keys: [] },
bio-plane/src/store.mjs:894  { name: "capture_sessions", keys: [] }, { name: "entity_relations", keys: [] }, { name: "entity_aliases", keys: [] }, { name: "entities", keys: [] }, { name: "progression_stages", keys: [] }, { name: "progression_defs", keys: [] },
bio-plane/src/store.mjs:895  { name: "progression_stage_versions", keys: [] }, { name: "progression_def_versions", keys: [] }, { name: "connection_dirty", keys: [] }, { name: "proposal_dispositions", keys: [] }, { name: "finding_dispositions", keys: [] }, { name: "queue_item_mutes", keys: [] },
bio-plane/src/store.mjs:896  { name: "observation_log", keys: [] }, { name: "leads", keys: [] }, { name: "themes", keys: [] }, { name: "ai_run_bounds", keys: [] }, { name: "bias_debts", keys: [] }, { name: "bias_debt_settlements", keys: [] },
bio-plane/src/store.mjs:897  { name: "bias_debt_sweeps", keys: [] }, { name: "ai_runs", keys: [] },
bio-plane/src/store.mjs:898  ]);
bio-plane/src/store.mjs:1862  recordOf(this.ctx).migrate();
bio-plane/src/store.mjs:1863  recordOf(this.ctx).seedMintLedger(Store.#MINT_LEDGER_LIVE);
bio-plane/src/store.mjs:7141  const lease = recordOf(this.ctx).acquireLease(target, who, Store.CORRESPOND_LEASE_MS);
bio-plane/src/store.mjs:9084  theCase = recordOf(this.ctx).mintOpaqueId("CASE", new Date().toISOString().slice(0, 4), "", (id) =>
bio-plane/src/store.mjs:10863  id = recordOf(this.ctx).mintOpaqueId("DRAFT", when.slice(0, 4), "", (d) =>
bio-plane/src/store.mjs:11000  const id = recordOf(this.ctx).mintOpaqueId("RVG", when.slice(0, 4), "",
bio-plane/src/store.mjs:16244  // record-core R18-R20 runs the catalogue over the page; the viewer's gate, and the route, total and
bio-plane/src/store.mjs:16245  // membership findings the sweep publishes beside the page, stay here.
bio-plane/src/store.mjs:16247  const sighted = new Set(this.#rows(`SELECT b.bundle_id FROM bundles b WHERE (${gate.sql})`, ...gate.args).map((r) => r.bundle_id));
bio-plane/src/store.mjs:16248  const { clean, withErrors, tally, tallyDetail = {}, offenders, limit: cap, page: ids } = await recordOf(this.ctx).auditPass({
bio-plane/src/store.mjs:16249  after, limit, visible: (id) => sighted.has(id),
bio-plane/src/store.mjs:16250  context: (id) => {
bio-plane/src/store.mjs:16251  const targets = this.#rows(`SELECT target_id FROM inquiry_basis WHERE bundle_id=?`, id).map((r) => r.target_id);
bio-plane/src/store.mjs:16252  return { earnedRegistry: targets.length ? this.earnedBasisRegistry(this.#subjectEntityOf(id), targets) : null,
bio-plane/src/store.mjs:16253  publishedRegistry: this.publishedRegistryFor(id, targets) };
bio-plane/src/store.mjs:16254  } });
bio-plane/src/store.mjs:16255  const page = ids.map((id) => this.#one(`SELECT bundle_id, object_type, current_state FROM bundles WHERE bundle_id=?`, id));
bio-plane/src/store.mjs:16502  const img = recordOf(this.ctx).readImage(bundleId) || {};
bio-plane/src/store.mjs:16776  const img = recordOf(this.ctx).readImage(bundleId) || {};
bio-plane/src/store.mjs:17500  yield [r.bundle_id, recordOf(this.ctx).readImage(r.bundle_id)];
bio-plane/src/store.mjs:22310  const id = `${recordOf(this.ctx).allocId("INFO", recorded.slice(0, 4)).id}-observation`;
bio-plane/src/store.mjs:25777  const { id } = recordOf(this.ctx).allocId("ENT", at.slice(0, 4));
bio-plane/src/store.mjs:25855  const { id } = recordOf(this.ctx).allocId("REL", at.slice(0, 4));
bio-plane/src/store.mjs:31921  return recordOf(this.ctx).mintOpaqueId("PROJ", year, `-${slug}`,
bio-plane/src/store.mjs:33664  // record-core R22: every declared table (legacy-store's are declared in the constructor), in one transaction.
bio-plane/src/store.mjs:33665  recordOf(this.ctx).transact(() => {
bio-plane/src/store.mjs:33666  const fts = bundleId ? this.#one(`SELECT fts_id FROM bundles WHERE bundle_id=?`, bundleId) : null;
bio-plane/src/store.mjs:33667  if (fts && fts.fts_id != null) this.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, fts.fts_id);
bio-plane/src/store.mjs:33668  recordOf(this.ctx).purge({ bundleId });
bio-plane/src/store.mjs:33669  if (bundleId) this.sql.exec(`UPDATE capture_requests SET lead_inquiry=NULL WHERE lead_inquiry=?`, bundleId);
bio-plane/src/store.mjs:50254  const taskId = recordOf(this.ctx).mintOpaqueId("TASK", year, `-${slug}`,
bio-plane/src/store.mjs:52237  allocid: () => recordOf(this.ctx).allocIdOp(url.searchParams.get("prefix"), url.searchParams.get("year")),
bio-plane/src/store.mjs:52238  lease: () => recordOf(this.ctx).acquireLease(url.searchParams.get("id"), url.searchParams.get("actor"), 300000),
bio-plane/src/store.mjs:52261  ? recordOf(this.ctx).readImage(url.searchParams.get("id")) : null,
bio-plane/src/store.mjs:52263  ? recordOf(this.ctx).readFile(url.searchParams.get("id"), url.searchParams.get("path")) : null,
```
