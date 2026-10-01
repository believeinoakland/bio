# extraction (T19)

**Status** · session_01D1NSnnnUtHGsFbECdwj9Mk · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on (carrying on meanwhile; none blocks the rest of the job):

1. **R66's trigger and its once-ness.** The migration needs the stored bytes (R2, async), so it cannot run inside the synchronous `migrate()`. Reading: `migrateDocxReadings({limit})` is a method of mine; `migrate()` starts it through the host's `waitUntil` when `extractionOf` was handed a Durable Object state (so no `store.mjs` line is added), and a test calls it directly. "Made before N26" is decided by a cutoff the first run records in a one-row bookkeeping table of mine (`reading_migrations`, whole-store, declared to purge): a candidate is a stored docx reading whose last write (`reading_history.kept_at`, or no history) is before the cutoff, whose chain does not already carry the mark, and whose stored `container_extent.paragraphs` (when an integer) equals the OLD walk's count. Progress is a cursor in that row, so a restart resumes and a capture that moves nothing is examined once and never re-read. The write re-checks, inside the transaction, that the stored reading is still the one examined (a promotion that landed meanwhile wins).

2. **R20 must not undo the migration.** An ordinary revision re-submits `data/provenance.json`, which still carries the pre-N26 reading; R19 would write it back (old numbering, unmarked chain), staling content again and moving every ¶ reference back. Reading: R20's existing exception (a stored re-read is not replaced by a reading that is not one with the same `at`) is extended the same way to a stored N26-migrated reading (not replaced by a reading without the mark carrying the same `at`). Please word R20 so at the merge if you agree.

3. **The mark.** text-chain accepts it without change: `checkChain` refuses no extra field on a step, so the docx `layer` step gains `reader: "N26"`; `describeChain`, `derivationCap`, `chainKindFor` ignore it, and content R22 sees `chainAfter` differ from `chainBefore`. So the re-read runs in T19, not T20 (K763's fallback not needed). The migrated reading also carries `migrated: {n26: {at, paragraphs, runs, tables}}` (what moved). The re-read is the plane's act (`author` null, observation-log's `plane` class).

## Completion

**Entries applied** (B1; `build/plan/current.md` layer 4, `draft-T19.md` layer 4; K763, K764, K800):
- **Rule 1 re-points.** `src/extractrun.mjs` `BASIS_GRADES` from record-grammar `grades.mjs`; `src/extraction/index.mjs` `sha256HexSync` from record-grammar `sha256.mjs`, `contentMintState` from `labels.mjs`, `canonicalExtent` and `describeExtent` from text-chain `textchain.mjs`; `test/m/extraction/readcontract.test.mjs` and `store.test.mjs` `canonicalExtent` from text-chain. No extraction file imports `bio-checks.mjs`. `extraction/schema.mjs`' comment re-worded to name text-chain's `canonicalExtent`.
- **R65** `joinTestimony(provenance)`: a projection in provenance's `testimonySlot()` running `indexTestimony` (R61) over the path's fields, answering `{indexed}`. `extractionOf` hands it `provenanceOf(ctx)` on a Durable Object's state (the composition root builds provenance first), none on a test's `{storage}` stand-in, so no `store.mjs` line is added; legacy-store's L10 job switches `#testimonyWithin` to the slot (provenance R52), and until then the store's own call stands, so nothing is indexed twice.
- **R66** the N26 migration: `migrateDocxReadings({limit})`, started from `migrate()` through the object's `waitUntil` (batches of 50 until done), and the pure `n26MigratedReading`, `renumberingMoves`, `n26Marked`. "Made before N26" is a cutoff on `reading_history`'s rowid taken at the first run (inside the boot), plus the old walk's paragraph count; once-ness by a cursor in the new whole-store table `reading_migrations` (declared to purge). The bytes are re-read through the docx entry, every `doc-para`/`doc-table` reference and `#para=` anchor in the reading moved by `docxRenumbering`, the paragraph count, tables and text counts follow the N26 walk, the provenance is recomposed, the docx `layer` step gains `reader: "N26"`, and the reading `migrated.n26` (what moved). Written through R19 (history kept, units rebuilt by R22, R24 listeners with differing chains: content R22 stales, R41 grades). A capture that moves nothing gets no mark and no re-read. The write re-checks the stored reading in its transaction. text-chain accepts the mark unchanged, so the re-read runs in T19 (K800).
- **R20** (K800): a stored N26-migrated reading is not replaced by an unmarked one carrying the same `at`.
- **R67** `textUnits` through record-core `registerCounts` (`counts(hid)`, `COUNT_KEYS`), registered by `extractionOf` once per storage; `textIndexOk()` the separate service. In `store.mjs`' `#counts`: the literal `textUnits` key deleted (record-core's spread answers it) and `textIndexOk` reads `extractionOf(this.ctx).textIndexOk()` under today's key, its 27-line comment moved to my method (ownership: 1 line added, 29 removed).
- **Routes**: already `extractionOps` (spread at `store.mjs`:1646); the delegation lines go with legacy-store's L10 job.

**Rs met, and their tests** (for BOB to strike the marks, K775 (6)): R65 `test/m/extraction/testimony-slot.test.mjs` (4 tests); R66 `test/m/extraction/n26.test.mjs` (9 tests, R20's widened exception among them); R67 `test/m/extraction/figures.test.mjs` (4 tests).

**Deferred:** none.

**Found in other modules:**
- `not_product`'s generated `bio-plane/dist/bio-plane.bundled.mjs` is stale by this change (extraction and `store.mjs` source); BOB regenerates at the layer close (mechanics §14).
- `case-authoring`: `test/m/case-authoring/` has 1 failing test ("R34: against the real ratification R18 …", `actual: false, expected: true`) on `tranche/T19` with my change stashed too, so it is not this job's.
- Observation for BOB, no action asked: a docx read after N26 carries no reader mark on its chain, so a migrated capture read again later (a fresh acquire) drops the mark and content R22 stales its rows once more; conservative, not silent.

**Tests and checks:**
- `node --test test/m/extraction/`: pass 162, fail 0. Users of the module and of the changed store lines: content 104/0, observation-log 51/0, calibration 65/0, provenance 113/0, record-core 90/0, legacy-store 4/0, connections 96/0, retrieval 113/0, progressions 44/0, contradiction 101/0, basis-versions 109/0, inquiry 144/0, entities 58/0, office-readers 75/0; case-authoring 78/1 (above, pre-existing).
- `checks/format.mjs`: 87 modules, 82 requirements files; 0 failures. `checks/architecture.mjs bio extraction`: 30 product files, 106 relative imports; 0 failures. `checks/coverage.mjs bio extraction`: 62 of 62 live ids; 0 failures. `checks/ownership.mjs bio extraction tranche/T19`: 12 files; legacy-store 1 added, 29 removed; 0 failures.

Size (session_01D1NSnnnUtHGsFbECdwj9Mk): test runs 14, module lines 3886
