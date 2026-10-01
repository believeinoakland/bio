# extraction (T19)

**Status** · session_01D1NSnnnUtHGsFbECdwj9Mk · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on (carrying on meanwhile; none blocks the rest of the job):

1. **R66's trigger and its once-ness.** The migration needs the stored bytes (R2, async), so it cannot run inside the synchronous `migrate()`. Reading: `migrateDocxReadings({limit})` is a method of mine; `migrate()` starts it through the host's `waitUntil` when `extractionOf` was handed a Durable Object state (so no `store.mjs` line is added), and a test calls it directly. "Made before N26" is decided by a cutoff the first run records in a one-row bookkeeping table of mine (`reading_migrations`, whole-store, declared to purge): a candidate is a stored docx reading whose last write (`reading_history.kept_at`, or no history) is before the cutoff, whose chain does not already carry the mark, and whose stored `container_extent.paragraphs` (when an integer) equals the OLD walk's count. Progress is a cursor in that row, so a restart resumes and a capture that moves nothing is examined once and never re-read. The write re-checks, inside the transaction, that the stored reading is still the one examined (a promotion that landed meanwhile wins).

2. **R20 must not undo the migration.** An ordinary revision re-submits `data/provenance.json`, which still carries the pre-N26 reading; R19 would write it back (old numbering, unmarked chain), staling content again and moving every ¶ reference back. Reading: R20's existing exception (a stored re-read is not replaced by a reading that is not one with the same `at`) is extended the same way to a stored N26-migrated reading (not replaced by a reading without the mark carrying the same `at`). Please word R20 so at the merge if you agree.

3. **The mark.** text-chain accepts it without change: `checkChain` refuses no extra field on a step, so the docx `layer` step gains `reader: "N26"`; `describeChain`, `derivationCap`, `chainKindFor` ignore it, and content R22 sees `chainAfter` differ from `chainBefore`. So the re-read runs in T19, not T20 (K763's fallback not needed). The migrated reading also carries `migrated: {n26: {at, paragraphs, runs, tables}}` (what moved). The re-read is the plane's act (`author` null, observation-log's `plane` class).
