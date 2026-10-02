# conformance (T23)

**Status** · session_01PKXj9m7YekEtka2YDGidnh · depth 2 · RUNNING until 2026-10-02T09:52:40Z (node --test bio-plane/test/m) · handled B1

## Completion

**Entries applied** (`build/plan/current.md` T23 L9, conformance; B1):
- N483 (K1024, K1099, K1122): `record.test.mjs`'s R17 test exports through corpus-export, not publication: `corpusExportOf(w.host).exportManifest({ note: "test" })` (corpus-export R1), imported from `bio-plane/src/corpus-export/index.mjs` over the `uses` edge BOB added (K1122; present in `modules.json` at my start, so no QUESTION). With no `deps`, `corpusExportOf` answers the host's one instance, the one publication's eager creation made (`publication/index.mjs`:178–:179, :2644), so the export sees what the fixture promoted. The assertion is unchanged in meaning: the determination is in the working corpus with its promotion. This clears red 6's conformance share.
- K1138 (P8), comment re-scan, wording only, no behaviour:
  - `src/conformance/checks.mjs`:17: C-113.24–C-113.28 said `awaiting stamp` for T16; they were stamped in `CATALOG_VERSION` 1.46.0 (`gate.mjs`:362–368), and the comment now says so (N502's kind; PROMOTION #24 listed this line).
  - `src/conformance/index.mjs` `conformanceOps`: "entries of the store's op map" now names the plane's op map (`plane`'s store, `src/plane/store.mjs`:299, spreads them) (N480/N469's kind). The fixture's `op` helper comment says the same.
  - No other stale wording found in the module's code or tests (all read whole).
- N497: not mine. The fixture registers nothing under `"legacy-store"` (B1).

**Deferred:** none.

**Found in other modules:** none. No provided service changed, so no user re-test is owed. No generated artifact went stale: the edits are comments only, and `fleetbundles.test.mjs` passed in the battery below. Nothing was regenerated.

**Tests:**
- `node --test bio-plane/test/m/conformance/`: tests 54, pass 54, fail 0 (before the change: pass 53, fail 1, `record.test.mjs`:165 `w.publication.exportManifest is not a function`).
- whole `bio-plane/test/m`: tests 5140, pass 5123, fail 5, todo 12, cancelled 0. All 5 are accepted reds that B1 names: control-plane `families.test.mjs`:47 (`NETWORK_NOTICE_CHECKS`, K1150); control-plane `inbox-door.test.mjs`:81 (red 9); plane `worker.test.mjs`:39 (red 6's plane share); queue `catalogue.test.mjs` R1 :34 and R5 :116 (red 13). No other red.

**Checks** (process repository, on the pushed commit):
- `format.mjs`: 87 modules, 86 requirements files; 0 failures
- `architecture.mjs conformance`: 9 product files, 43 relative imports; 0 failures
- `coverage.mjs conformance`: 24 of 24 live requirement ids named by a test; 0 failures
- `ownership.mjs conformance tranche/T23`: 0 failures

Size (session_01PKXj9m7YekEtka2YDGidnh): test runs 3, module lines 1539
