# calibration (T21)

**Status** · session_01AhYpL2J9LWAd7Lz7PeLWAj · depth 2 · WORKING · handled B1

## Completion (CALIBRATION #6)

**Entries applied.**
- **N469** (K931): `bio-plane/src/calibration/schema.mjs`:44, the `replaced_by` column's note, said D-221's version-chain pin "(test/versionchain.test.mjs section 2) sweeps the WHOLE schema" and "The pin is right and was not narrowed", as live. That suite was deleted at T20 and no module test carries its whole-schema sweep (provenance's `convert-versionchain.test.mjs` carries the chain, not the sweep), and the claim is not one of calibration's requirements, so the claim is dropped: the note now says the suite once pinned the rule, was deleted at T20, its sweep not carried, and the spelling `replaced_by` stays for D-221's rule. The provenance (why the column is not `superseded_by`) is kept. Comment text inside `CALIBRATION_SCHEMA` only: every changed line is a `--` line, which `migrate()` (R20) strips, so the DDL run is unchanged (R20's tests compare the tables and indexes statement for statement).
- **Re-scan of my paths** for any other note naming a T20-deleted file as live, or "the battery": none. `calibration.mjs`' "the suite" (header rule list, `CALIBRATION_CADENCE_MS`, `drifted`) names no file; the legacy `test/calibration.test.mjs` and `calibration.control.mjs` it grew from are kept files, and `test/m/calibration/` proves each rule. `checks.mjs`' "Moved here from `bio-checks.mjs`" is provenance.
- **Own flaws fixed (comments only):** `index.mjs` header and `calibrationOps`' note said "the legacy store's dispatcher" spreads the ops in; legacy-store is retired (T19, K858) and the spreader is the plane's route map, `plane/store.mjs`. Both now say so. `schema.mjs`' header said "`schema.mjs` no longer names it (T19)"; that file is deleted, and the header now says `migrate()` runs in place of the legacy `schema.mjs` pass, since deleted.

**Deferred:** none.

**Found in other modules / generated artifacts (REPORT J1):**
- Stale: the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`; its manifest hashes `src/calibration/schema.mjs` and `src/calibration/index.mjs`, and the bundle embeds `CALIBRATION_SCHEMA`'s old comment). Regenerated nothing.
- Pre-existing, not mine to change: `index.mjs`:16 and :349 run 121–123 columns (left; no check bounds line width).

**Tests and checks.**
- `node --test bio-plane/test/m/calibration/`: tests 65, pass 65, fail 0.
- `node --test bio-plane/test/m/extraction/` (its fixture runs `CALIBRATION_SCHEMA`): tests 171, pass 171, fail 0.
- No layer tests (`build/manifest.md`). No service changed.
- format: 86 modules, 84 requirements files; 0 failures. architecture: 9 product files, 23 relative imports; 0 failures. coverage: 20 of 20 live requirement ids named by a test; 0 failures. ownership: 3 files changed by calibration between tranche/T21 and HEAD; 0 failures.

Size (session_01AhYpL2J9LWAd7Lz7PeLWAj): test runs 2, module lines 39 (20 added, 19 removed; comments only)
