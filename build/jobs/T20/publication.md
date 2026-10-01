# publication (T20)

**Status** · session_0161AvGLr1d2yQEQQjgWcAz3 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found while applying B1 (K899 (1)). None of these files was edited.

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`). It carries `src/publication/index.mjs`, whose export `verify` sentence this job changed. Regenerate at layer close. The same old sentence is also copied into `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs` and `newgroup/dist/newgroup.bundled.mjs` (installer's); those follow the next release build.
2. **Member-read "bundle" in public-read's file:** `bio-plane/src/publication/worker.mjs` sits under publication's directory but is listed in public-read's `paths`, so I left it. Its member-read strings with the word: :526–528 (`id=<bundle id>`, `sha256=<the bundle sha of an edition>` in the `publishedcase` 400 answer) and :714 (`own bundle sha`). If public-read's START did not name them, they are its share.

## J2 · COMPLETE

Job done on `job/T20/publication` (commit e66b703b7b, pushed with this entry).

**Entry applied** (`build/plan/current.md` T20 L8, K902 Q1; B1; K899 (1)):
- `bio-plane/src/publication/index.mjs`:1974: the export's `verify` sentence now reads "every file carries its sha256 and every record its history chain and base links". Meaning unchanged. Field names (`bundles`, `counts.bundles`, `bundle_id`) are unchanged.
- **Re-scan of my `paths`** (`deliverer.mjs`, `publication/index.mjs`, `checks.mjs`, `door.mjs`, `schema.mjs`), with comments, SQL and identifiers set aside: this was the only string a member reads that held the word. `checks.mjs` (C-92.1–.9, C-122.1 translations), `door.mjs` and `deliverer.mjs` hold none. No refusal row changed, so nothing awaits a stamp.
- **Test re-keyed:** `test/m/publication/export.test.mjs` R18 now pins the new sentence. It also asserts that neither of the export's member-read sentences (`recorded`, `verify`) says "bundle". No other test pinned the old words.

**Deferred:** none.

**Found in other modules:** REPORT J1. The plane bundle is stale, and public-read's `worker.mjs` has member-read hits at :526–528 and :714.

**Tests and checks:**
- `node --test bio-plane/test/m/publication/*.test.mjs`: tests 96, pass 94, fail 0, todo 2 (the existing R30/R32 todos).
- No layer tests (manifest).
- format: 0 failures. architecture: 0 failures. coverage: 41 of 41 live ids named, 0 failures. ownership: 3 files changed, 0 failures.

Size (session_0161AvGLr1d2yQEQQjgWcAz3): test runs 2, module lines 3686
