# capture-sources (T34)

**Status** · session_01BYYn95VUQL2zNqsPdzMEie · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (T34-13; N577; K1601, K1745).
- `capture_credentials` is declared through record-core's `declareTable` (its R21) with its classes stated: `purge: "clear"` (keyed to `project`, the whole-store form only where `scope='project'`, as R63 requires and as before), `expunge: "none"`, **`export: "never"`**, `sight: "bundle"` (what the keyed default form answered before, unchanged), `derive: "stored"`, `version_chain: false`. Until now it was declared with `declarePurge`, whose default form is `export: "admin-only"`, so corpus-export (its R7) would have carried the table's rows, ciphertext and IVs included, in an admin export: against R61 ("never in a bundle, a file, a manifest entry or a snapshot"). Now corpus-export names the table and carries no row.
- Test: R61's test also asserts the table's one declaration with those classes, read at record-core's interface (`declaredTables()`). It fails on the old code (`export: 'admin-only'`) and passes on the new.

**Improvements made in my module.** None beyond the entry.

**Deferred.** None.

**Found in other modules.** Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` bundles `capture-sources/credentials.mjs`. Nothing else.

**Uses** (unchanged): subresources, record-core, membership, credentials.

**Tests and checks run** (on `job/T34/capture-sources`):
- `node --test bio-plane/test/m/capture-sources/`: tests 82, pass 82, fail 0.
- Not owed (no provided service changed), run because they read the declaration or the table: corpus-export 23 pass, 1 fail (R4, the inherited red of K1754); capture-requests 76 pass, 4 fail (the inherited `plane.test.mjs` ×4 of K1708). Both identical without this change.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture capture-sources`: 20 product files, 22 relative imports; 0 failures. `coverage capture-sources`: 63 of 63 live requirement ids named by a test; 0 failures. `ownership capture-sources tranche/T34`: 3 files changed (the code file, its test and this record); 0 failures.

Size (session_01BYYn95VUQL2zNqsPdzMEie): test runs 6, module lines 2522
