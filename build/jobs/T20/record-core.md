# record-core (T20)

**Status** · session_01NEdggWzA6wen9mWzAPWE6z · depth 2 · COMPLETE · handled B1

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

## J3 · COMPLETE

**Entries applied** (`build/plan/current.md` T20 L2, B1 START, B2 CHANGE / K877):
- `registerLegacyGrammars(record, grammars)` deleted with its rule-2 comment block (re-scan first: no caller outside its own definition and test). Its import and the test "R67 R18 (rule 2, K785)" deleted, with `imageOf`, the helper only that test used. `EXTENSION_ARMS`' other uses (R67's slots) stay. Header's requirement range now R1–R74.
- **R74** (K861, re-worded K877): `RecordCore.COUNT_KEYS` (`["bundles", "files", "history"]`, frozen) and `rc.ownCounts(hid)`, shaped as R63's `counts(hid)`: each table less rows whose `COALESCE(bundle_id, '') NOT IN hid.sql`, whole for a null `hid`; the SQL is plane's held `n(t, "bundle_id")` unchanged. A table that cannot be read is left out (R63 answers it null). No `refs`. Registers nothing itself. Plane's T20 job registers it as `recordOf(ctx).registerCounts("record-core", [...RecordCore.COUNT_KEYS], (hid) => recordOf(ctx).ownCounts(hid))` and drops its `bundles`, `files`, `history` literals (`held.mjs`:78). **R74 is now met in record-core**; its "not yet met" marker is BOB's to clear (or keep until plane registers it).
- R74's tests: "R74: the exported figure source …" (whole, less a hidden project's rows through a `hiddenBundles`-shaped `hid`, a sight hiding nothing or everything, a row naming no held bundle, writes nothing), "R74 R63: registered through R63 …" (under `record-core`, beside another registration, a null figure for an unreadable table or `hid`), "R74 R64 R72: in purge's proof …" (op=stats through the viewer's sight, the proof whole before and after, `removed` the difference). Each is checked against the figures computed from the rows in JS, not against the module's own SQL.

**Deferred:** none.

**Found in other modules:** J2 (stale `bio-plane/dist/bio-plane.bundled.mjs`; membership R79/R83 red on the base, its own entry; capture-sources' DEC-49 guard broken by a missing `bio-plane/scripts/walkfloor.mjs`).

**Tests and checks:**
- `node --test bio-plane/test/m/record-core/`: tests 92, pass 92, fail 0.
- Tests of the 51 `test/m` directories that import record-core: tests 3605, pass 3583, fail 3, todo 19; the 3 fail identically on `tranche/T20` without my change (J2 items 2, 3).
- `checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `checks/architecture.mjs … record-core`: 5 product files, 9 relative imports; 0 failures.
- `checks/coverage.mjs … record-core`: 74 of 74 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … record-core tranche/T20`: 3 files changed; 0 failures.

Size (session_01NEdggWzA6wen9mWzAPWE6z): test runs 16, module lines 1686
