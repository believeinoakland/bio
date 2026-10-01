# record-core (T20)

**Status** · session_01NEdggWzA6wen9mWzAPWE6z · depth 2 · WORKING · handled B1

## J1 · QUESTION

Re-scan done (P4): `registerLegacyGrammars` has no caller outside its own definition and its test; I am deleting both.

QUESTION on R74's `refs`. `refs` is `connections`' table (`src/connections/schema.mjs`:11, declared to purge by connections, layer 5). R74 puts its count in my share, but R31 says every service of this module "reads and writes only this module's own tables and the system clock" (purge and the R40 seed excepted), and a layer-2 module counting a layer-5 table reads ahead of the order (P4).

My best reading, which I am building now: R74 is the specific, later clause and wins for this one export: `refs` stays in record-core's figure source exactly as plane's held copy counts it (on `bundle_id` and `target_id`, `COALESCE(k, '')`), answered null (R63's rule) when no `refs` table exists. I add nothing else that reads another module's table.

Alternative, if you prefer: `refs` leaves R74 and `connections` exports its own figure (its table, its R63 registration), and record-core's export is `bundles`, `files`, `history` only. Then R31 needs no exception. Say which, and if the first, whether R31 should be re-worded to name R74's read.

## J2 · REPORT

Found outside record-core (none changed by me):

1. **Stale generated artifact** (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`, `build/manifest.md`) embed `src/record-core/index.mjs`, which this job changed (deleted `registerLegacyGrammars`, added `RecordCore.COUNT_KEYS` and `ownCounts`). Regenerate at the layer close (`bio-plane/`: `npm run build`).
2. **membership** R83 and R79 fail on `tranche/T20` before my change too (`test/m/membership/module-order.test.mjs`, `t9-notice-sight-bounds.test.mjs`): `MODULE_ORDER` is not yet `modules.json`'s ids. This is membership's own T20 entry (legacy ids out of `MODULE_ORDER`), named so you see it is expected red until MEMBERSHIP #14 lands.
3. **capture-sources** "R55, R57, R63: the DEC-49 guard resolves every C-105 region" (`test/m/capture-sources/credentials.test.mjs`) fails on the base too: the guard it runs, `civicos-ui/check-refusal-codes.mjs`, imports `bio-plane/scripts/walkfloor.mjs`, which no longer exists (ERR_MODULE_NOT_FOUND). Not in any T20 job I know of; the owner of `civicos-ui/check-refusal-codes.mjs` (legacy-ui) or of the deleted script needs to re-point it.
4. `bio-plane/test/system/fleetbundles.test.mjs` fails whole in this container (likely members' `node_modules` absent); not judged further.
