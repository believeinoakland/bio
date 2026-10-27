# PROTO-B spec: bulk text and indexes out of the room

Branch `proto/levels-2-3-b` at 13c83a9ae7. Throwaway, never merged. Read from code under `bio-plane/src`. The study's "textUnits" is the SQLite table `capture_text` (the 127,502 on the study copy; S0 quotes 535,983 on the test copy). Nothing in the repo is named `textUnits` except the count label in `extraction/index.mjs` `counts()` (~2368).

## Conclusion
The seam is NOT small. Estimated change 1,300 to 2,000 lines across about 10 files, 3 to 4 times the 500-line limit. **Stage 2 is not built.** Two things cause it: (1) every reader is synchronous SQL, and R2 is async; (2) search is not a function that could be swapped but SQL composed inside the query compiler, joined to sight and paging.

## Where text is written (one writer)
- `extraction/index.mjs` `#landSteps` (~1782-1910), via `indexUnits` / `indexUnitsYielding` (1768-1776). Does `DELETE FROM capture_text WHERE capture_sha=?` (1793, non-append), then per batch (about 1 MB, `LAND_BATCH_BYTES`) inside `core.transact`, `INSERT INTO capture_text (capture_sha,bundle_id,extent_kind,extent,ref,seq,text,truncated,chain_kind,kind,line_rows,undetermined)` (1844). It also writes `capture_text_skipped` (1881) and `capture_text_state` (1897), and `job_batches` for idempotent batches.
- The FTS: `capture_text_fts` is FTS5 external-content over `capture_text` (rowid-aligned), kept by triggers `capture_text_ai/_ad/_au` (extraction 626-646). So the text is stored twice (row and index) and the index grows with it.
- Schema: `extraction/schema.mjs` 283-296. Purge: declared in `extraction/index.mjs` ~146-147 (`capture_text` per-bundle, `capture_text_fts` whole-store only), executed by record-core inside one transaction.

## Where text is read (synchronous SQL, 12+ sites)
- `extraction`: `unitsOf` (2264-2300, pages by seq and by byte size with `length(CAST(text AS BLOB))`; 21 callers in 8 modules: content, case-carriage, case-disclosures, run-productions, contradiction, store-assembly/pending); `readingFor` count (1964); the paging at 1520; 2092, 2754, 2893 (pdf-page reads for repair); `counts` (2370); `textIndexOk` (2384, FTS integrity check); `EXISTS` subqueries at 2695-2696.
- `retrieval-browse/findin.mjs` 370, 623, 632 (find-in-document, unit by extent); `retrieval/units.mjs` 20-48 (unit addresses, `PRAGMA table_info(capture_text)`); `case-account/index.mjs` 410; `store-assembly/wiring.mjs` 61 (joins units for the whole capture).
- **Search (the hard part):** `query.mjs` arm `passage` (~847-905) and its use at 2141 (`rowid IN (SELECT rowid FROM capture_text_fts WHERE ... MATCH ?)`), 2359, 2500-2520 (first matching unit and `snippet()` per bundle, joined `capture_text ct JOIN capture_text_fts`), 2803-2955 (row projection, snippet column). 68 references to the arm. The member's text becomes an FTS5 expression (`textAtom`, `ftsAtom`: phrases and trailing `*`), and the result is composed in the same statement as sight (`viewerPredicate`), ordering, paging and `total`.
- `bundles_fts`, `bundle_projection`, `bundle_terms` (retrieval, derived and rebuildable) serve the `text:` arm, not passages; S0 lists them with B, but they are small per bundle. Not touched by this prototype.

## What would be called instead
- Content: `CAPTURES.put("proto-b/<store>/units/<capture_sha>/<seq>", text)` (or one object per batch with an offset table), written after the room's batch transaction commits. Room keeps `capture_sha, bundle_id, extent_kind, extent, ref, seq, truncated, chain_kind, kind, line_rows, undetermined`, plus new `len` (bytes) and `obj` pointer; `text` becomes '' (the table has `text NOT NULL`, so no migration is needed).
- Read: `unitsOf` and the other readers must become async (`await CAPTURES.get`), or text must be pre-fetched before entering the room's synchronous code. Every one of the 21 `unitsOf` callers and the readers above changes color. The byte-size paging can use the stored `len`.
- Search: a per-bundle inverted index object `proto-b/<store>/index/<bundle_id>` (term to unit seqs) in R2, written at landing. A `passage:` query becomes a Worker-side two-phase: (1) read the index objects of the bundles in scope (the scope is known only after the room applies sight, so one room call first), (2) intersect terms, (3) a second room call to filter by sight, page, and order. FTS5 phrase, prefix, `snippet()` and `highlight()` would be re-implemented (tokenizer `unicode61`) or dropped; `rowid IN (subquery)` can no longer be a SQL predicate, it becomes a literal id list bound into the statement (size bounded by SQLite's variable limit).

## Stays in the room
Ids, extent keys, offsets, seq, flags, `capture_text_state`, `capture_text_skipped`, `job_batches`, pointers, lengths; `bundles`, `files`, `readings`, `content` (addressed by `capture_sha, extent_kind, extent`, not by text).

## Expected effect (an estimate; no sizes are measured in the sources)
- Room bytes: `capture_text` text plus its FTS5 shadow tables are the growth term (DB about 1.4-1.5 times extracted text). Removing both leaves the keys and pointers, probably under 15% of the old table; on the 416 MB copy the share is UNCLEAR until S1's `dbstat`. Not measured here.
- Thread time: landing inserts (about 1 MB per batch plus the FTS trigger writes) leave the thread; the FTS5 MATCH leaves it. But the search now spends two room calls and R2 gets, so latency of one search likely RISES (R2 first-byte tens of ms per object) while room thread time FALLS. Reads of a document now cost one R2 get per page of units.

## Risks
- Consistency: SQL transactions and R2 puts do not commit together. Write order must be R2 first, then the room batch (an orphan object is harmless; a pointer to a missing object is not). A re-read replaces units (`DELETE` then insert): keys must be versioned by a read generation or the old and new sets mix. `job_batches` idempotency covers the room side only.
- Purge and expunge: record-core purges per bundle or whole store in one transaction over declared tables; R2 objects need a listing-and-delete step that is not atomic with it. Expunge and tombstones must reach R2 too (a privacy rule, not only tidiness).
- Ordering: unit order is `seq`; index objects must be rebuilt per capture on a partial/append read (R90 pieces) or search shows a prefix.
- Sight: an external index returns hits across bundles the viewer may not see; it must always be filtered by the room's sight SQL after the lookup, never before the room is asked.
- Behaviour parity: `integrity-check` (`textIndexOk`), the test store assembly and 616-table declarations assume the FTS table exists.

## Size of the change (lines)
Writer and pointer columns 150; async readers across 8 modules 500-800; query compiler `passage` arm two-phase 400-700; external index writer/reader 200; purge hooks 80; probe op 80; tests 200+. Total 1,300-2,000. Over the limit, so STOP.

## What a smaller study could do instead
A measurement-only variant (no behaviour change): write units and an index to R2 beside the room copy under `proto-b/` from a script, then time (a) N unit gets, (b) a term search over the index, against the room's `capture_text_fts` timing for the same terms. About 250 lines in a standalone script plus one admin read op, with no change to the readers. That answers "how fast is the outside" but not "what the room saves".
