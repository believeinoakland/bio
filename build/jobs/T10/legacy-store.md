# legacy-store (T10)

**Status** · session_01C3P8MSsxkBCWQp6eTA78eb · depth 2 · RUNNING until 2026-09-28T23:06:00Z (the old battery on tranche/T10 and on job/T10/legacy-store) · handled B2

## J1 · QUESTION

**Q1 · N265, which arm.** The testimony path (`#testimonyWithin`, `store.mjs` 2142) indexes the member's words as one `document` unit through extraction's `indexUnits` and writes the `derive` row through observation-log's `observeIndexed`, then mints the content row and writes one content-level `extract` PRESENT row. It writes no `readings` row.
- **My best reading, which I apply: "states why it writes no reading."** Going through `writeReading` would need a reading object, and there is none: no reader ran over the words. Its listeners would then record acts nobody performed. Observation-log's `onReadingNotice` would write a meaning-level reader-run row (R8: `LOOKED_ABSENT`, "found no references"), and `observeExtraction` (R6) would write tier rows judged from a made-up chain, beside the `extract` row this path writes. That is the record claiming more than it can support. So the path keeps its own writes, and its comment now says exactly why (no reader ran, so there is no reading; the index and its `derive` row are the words themselves).
- **What this leaves, for your routing:** `indexUnits` (inside extraction R22) and `observeIndexed` (observation-log R7, "on extraction's index notice") are not named as callable services in either module's Provides. This path calls them directly. The clean end state is a provided service, for example an extraction `indexTestimony(bundleId, captureSha, units)` that indexes and raises an index notice (no reading) that observation-log's R7 listens to. Then legacy-store calls one service, or provenance registers the testimony projection itself (K31). That is an entry for extraction and observation-log (and provenance), not mine.
- **Other reading:** fabricate a minimal reading and call `writeReading`. I reject it for the reasons above.
- This decides nothing else I build, so I carry on with N268, N270, N191 and N186 (already done in T9: `actNoBasis` is gone, and only the header comment at 448 names inquiry's).
