# extraction (T38)

**Status** · session_01GXLVBfXBcg51dL2ddA46vX · depth 2 · WORKING · handled B2

### Work (EXTRACTION #17)

**Reading set (mechanics §17).** BOB's measure was 611 KB. On §3's reading (own requirements 37 KB, the module's code about 183 KB, plus each used module's Purpose and named services) it is still over 300 KB, so I followed START (3), trimming nothing.
- **Read whole myself:** `build/requirements/extraction.md`; layer 4's row of `build/layers.md`; office-readers R11; `bio-plane/src/extraction/index.mjs` (all 1,560 lines: the migration, the writer, the history); `n26.test.mjs`; `fixture.mjs`; `r70.test.mjs`; `schema.mjs`'s `reading_history` and `reading_migrations`; and record-core's `declarePurge` and `purge` (the services my change relies on).
- **Read by my worker, whole:** `extractrun.mjs`, `drift.mjs`, `checks.mjs`, `ops.mjs`, `filemembership.mjs`, `schema.mjs`, and the other 17 test files. Its summary is about 11 KB; every statement cites file and line.
  - It cites the schema of the history, migrations and readings tables. It confirms that no path in those files writes a reading, so `writeReading` is the only writer.
  - It maps the existing R23, R66, R68 and R70 tests and their helpers.
  - It flagged three points: a reading with no history row counts as old (:1232); a cutoff on a rowid can be reused after a purge; and r70.test.mjs:143–158 contradicts the amended R66. All three mattered and are dealt with below and in J1.

**Entries.**
- **T38-8 (N786), R66 as K2290.**
  - **BOB's finding is confirmed.** The cutoff is taken at boot, before any write (`index.mjs`:1147–1166). `writeReading` (:653) always leaves the capture's last history row holding the reading it wrote (`#keepReading`, :760–790), and :1232 skips anything after the cutoff. A reading carrying `paras` therefore reaches neither `moveCells` nor `n26MigratedReading`.
  - **One path broke it: a whole-store purge.** The purge deleted the migrations' row, so it was re-created with a cutoff taken over readings written after the purge. I measured an N26 reading carrying `paras` being migrated on that path (J1).
  - **Fixed on my reading in J1, with no renumbering arm.** `reading_migrations` is now declared exempt from the purge (`EXTRACTION_EXEMPT`, `declareTables`). The schema comment is corrected.
- **Tests** (n26.test.mjs, R66 in each title):
  - BOB's case, for a box branch and for a run-only branch: a reading carrying `paras` with its last row after the cutoff is skipped with the exact message "read after N26", and every row of it is unchanged.
  - A store whose migration is done, then a whole-store purge, then a restart: the reading is never migrated, and the migrations' row stands. Its negative control fails without the fix.
  - Every write keeps a last history row holding the reading, through the promotion projection, the writer, and a second bundle writing the same reading.
  - r70.test.mjs:143's synthetic pre-N26 cells drop `paras`.

**Found, not changed: a history row can be lost after it is written.** A later bundle purge, or the `readinghistoryclear` seam, can remove the history row of a reading carrying `paras`. Example: a second bundle writes the same reading, so no row of its own is kept, and the first bundle is then purged. Such a reading counts as old (:1232) only if a migration runs again. With the migrations' row now exempt, that happens only on a store whose migration never finished. Every store's migration finished at T19/T20 boot, so I built nothing for it.

**Stale generated artifacts:** `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs`, which carry `extraction/index.mjs`. They are reported to BOB, not edited.

**B2 (K2296) applied.** BOB accepted my J1 reading: the exemption covers R66 and R68 alike, and there is no narrower `paras` skip.
- The purge path is now tested by name under R68 too (n439.test.mjs, last test). A `.pptx` read by N439 after a whole-store purge is never migrated, and the row stands, done. Its negative control fails without the fix.
- The r70 rework and the schema comment were done as J1 proposed.

**Deferred:** nothing.

**Tests and checks** (final run):
- `node --test bio-plane/test/m/extraction/`: tests 136, pass 136, fail 0.
- record-core and corpus-export (users of the purge declaration): tests 188, pass 188, fail 0.
- Layer tests: none named by the manifest.
- `format`: 137 modules, 136 requirements files; 0 failures.
- `architecture`: 28 product files, 105 relative imports; 0 failures.
- `coverage`: 46 of 46 live requirement ids named by a test; 0 failures.
- `ownership`: 0 failures (line below, after the commit).

Size (session_01GXLVBfXBcg51dL2ddA46vX): test runs 12, module lines 2955

## J1 · QUESTION

BOB's finding holds in the code, with one exception: a whole-store purge.

**What holds.** `#migrationState` (`index.mjs`:1147–1156) takes the cutoff once, when no `reading_migrations` row exists: on every Durable Object at boot (`startMigrations`, :1162–1166), before any request. `writeReading` is the only writer of `readings` (:673). It keeps a history row first (`#keepReading`, :760–790): it inserts one, or the latest kept row already equals this reading. So on every store whose migration row has stood since T19, a reading carrying `paras` (T37-4) has its last row after the cutoff and is skipped at :1232. My worker confirmed that no other path in the module writes a reading.

**What does not hold.** `declareTables` declares `reading_migrations` whole-store-only (`EXTRACTION_WHOLE_ONLY`, :56), so `record-core.purge()` with no bundle deletes it. Its sibling tables go too, and `reading_history`'s rowids then restart at 1. The object keeps running. Readings written after that purge get history rows 1..k. At the next boot (or the next `migrateDocxReadings`), the row is re-created with cutoff k, so those N26 readings count as "made before N26". I measured this with a probe, using the module's own fixture:
1. `migrateDocxReadings` on an empty store: done, cutoff 0.
2. `core.purge()`.
3. `read` and `writeReading` of a `.docx` whose table cell holds a run-level `mc:AlternateContent`. Its cell carries `paras: [1]`.
4. `migrateDocxReadings` again: cutoff 1, and the reading is **migrated** (re-written with the N26 mark and `migrated.n26`, moved 0).

The `oldWalk` paragraph-count guard (:327–331) stops this only when the branch not read holds paragraphs. A run-only branch passes it. Here the `paras` stay unchanged, but the reading is migrated, and its run references, already N26's, would be moved again whenever the run map moves something. That breaks R66's new sentence. R68's `.pptx` migration has the same hole.

**My best reading, and what I am doing now:** no renumbering arm (as you said). I declare `reading_migrations` exempt from the purge: `declarePurge(..., {exempt: ["reading_migrations"]})` instead of whole-only. A migration's row then survives a whole-store purge, so its cutoff is never re-taken over readings written after it. Every live store's migration has been done since T19/T20, and after a purge every reading is the fixed reader's, so keeping `done` is the truth.
- R49 does not list `reading_migrations`, so no requirement text changes.
- The schema comment at `schema.mjs`:406–408 ("only the whole-store purge clears it…") is corrected with it.
- The R66 test (R66 in its title) also covers this purge path.

The alternative is to skip any reading whose cells carry `paras`. It is narrower: it misses the run references of a reading with no table, and the `.pptx` arm. Say if you want that instead, or no change.

**Also:** r70.test.mjs:143–158 stores a pre-N26 reading whose cells carry `paras` and asserts it is migrated. That is a reading the amended R66 says cannot exist. On my reading, that test's synthetic pre-N26 cells drop `paras` (the cell shape as N724/T36 wrote it, before T37's `paras`). The pure test at :122–141 keeps `paras` as stored.
