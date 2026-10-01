# extraction (T20)

**Status** · session_013omNPjSMS2KenNBwKpnvvD · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entry applied:** `build/plan/current.md` (T20) layer 4, extraction: N439's migration (K747), as N26's (R66) and K763's ruling. Commit `d031b3937b` on `job/T20/extraction`.

- `n439MigratedReading` (pure), `n439Marked`, `pptxRenumberingMoves`, `N439_MIGRATION` (`n439-pptx`), `N439_READER_MARK` (`N439`), `N439_BATCH` and `migratePptxReadings()` in `bio-plane/src/extraction/index.mjs`. A pptx reading made before N439 is re-read from its stored bytes through the pptx entry, each `slide-shape` `shape` is moved by `office-readers`' `pptxRenumbering` (R29) to `shapes[old].new`, unplaced (null) when that is null; the slide grain, slide numbers and a slide the map does not list do not move. The moved references are the reading's own (entities' sources and occurrences, facts, wherever they sit), so `reading_refs` positions and occurrences follow through R19; the slide-grain text units are rebuilt by R22 from the re-read text. Each slide's shape count in `container_extent` and the R60 counts follow the N439 walk. The pptx layer step gets `reader: "N439"` only when the renumbering moves something, so content R22 stales and R41 grades and notifies. The write goes through R19's writer and never rewrites `capture_text` in place; the old reading is kept (R23); `migrated.n439` says what moved.
- **Text-chain accepts the mark.** `checkChain` passes a pptx layer step carrying `reader`, and the `reading_text_source` row holds the marked chain (tested), so no QUESTION was needed.
- **One machine for both migrations.** The N26 docx machinery is now general (`#migrationState`, `#migrate`, `#migrateOne` over a `MIGRATIONS` spec), so N26 and N439 share the cursor, the cutoff, the guard against a reading that changed meanwhile, and the asserted-reading path. `migrateDocxReadings` behaves as before; all of N26's tests still pass unchanged, except one line renaming `startDocxMigration` to `startMigrations`. On a Durable Object, `migrate()` creates both cutoff rows synchronously in the boot and then drains docx, then pptx, in one `waitUntil`.
- **Old-walk guard.** The N26 guard checks the paragraph count. The N439 guard checks each slide's stored shape count against the old walk's count, so a reading the new walk made is left alone.
- **R20:** a stored N439-marked reading is not replaced by an unmarked reading with the same `at`. Negative control: removing the hold fails `R20 R68`.

**Requirements met (strike at the merge, K775 (6)):** R68, tested in `test/m/extraction/n439.test.mjs` (every test is titled R68). R20's N439 clause is tested in "R20 R68: a promotion re-submitting the pre-N439 reading…".

**Deferred:** none.

**Found elsewhere / for BOB:**
1. **Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`; its manifest lists `src/extraction/index.mjs`). BOB regenerates at the layer close.
2. **Size (P6):** the module's paths are now 4,002 lines (3,886 at `tranche/T20`, +116, within the plan's ~120 for this entry). That is past the 4,000 mark. Both renumbering migrations retire once they have run (K747), which takes about 230 lines back out.
3. `bio-plane/test/system/fleetbundles.test.mjs` is red identically on this branch's base (agent-worker's input list; the (j) arms still name the deleted `tools/bundles.mjs`). It is not caused by this change; noted for whoever owns that suite.

**Tests and checks:**
- `node --test bio-plane/test/m/extraction/`: tests 171, pass 171, fail 0 (162 before, plus 9 new).
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … extraction`: 30 product files, 107 relative imports; 0 failures.
- `node checks/coverage.mjs … extraction`: 63 of 63 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … extraction tranche/T20`: 5 files changed; 0 failures.

Size (session_013omNPjSMS2KenNBwKpnvvD): test runs 7, module lines 4002
