# extraction (T7)

**Status** · session_01E5kejJCTLEwWFYSLe7y9uh · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N108: the read contract's Provides text, proposed for folding (the K152 pattern, as capture R57 was, K175). I am building against it now. Columns are the ones later modules join today, measured on `job/T7/extraction` @ 258f4aff: entities (`refTermsSql`, `resolve`, the corpus count), connections (`#resolvePairChoice`, the occurrence reads), retrieval (frontier's reference arm, `contentAxis`'s skipped runs, the probes), query-language and content (`readings.capture_sha`, `bundle_id`).

**R53** (new, Provides, after R36) The tables `readings`, `reading_refs`, `reading_ref_terms` and `capture_text_skipped`, with the columns named here, are a stated read contract: a later module may join them in its own SQL (entities R9–R19 read all three reading tables; connections joins `reading_refs`' positions and occurrences; retrieval's frontier reads `reading_refs` and `readings`, and its content axis `capture_text_skipped`), and this module changes none of those columns' names or meaning without a change to this requirement carried to every such reader (P5). No other column is part of it, and every write to these tables stays this module's.
- `readings`: `capture_sha` (the capture's digest; one row for each capture read, a failed reading included), `bundle_id` (the bundle whose promotion or re-read last wrote it), `content_type` (the reader's content-type key, or null).
- `reading_refs`: `capture_sha`, `bundle_id`; `ref` (the reference as it appears, raw `kind:key`, never resolved, R46); `ref_kind`, `ref_key`, `label` (as the reader emitted them, or null); `pos_kind`, `pos`, `pos_ref` (where it was read, all three or none; none means the reading cannot say where, never the whole document); `occurrence` (`pos_kind:pos`, or empty for the one unplaced row); `seq` (the reading order among one reference's occurrences: 0 is the first read, the row a read about the reference itself reads).
- `reading_ref_terms`: `capture_sha`, `bundle_id`, `ref`; `src` (`ref`, `key` or `label`; `key` only when the key folds to something other than the whole reference); `term` (one of R54's `labelTerms` of that source string). A name is matched within one (`capture_sha`, `ref`, `src`) group, never across sources.
- `capture_text_skipped`: `capture_sha`, `bundle_id`, `first_seq`, `last_seq`, `units`, `first_extent`, `first_ref`, `last_extent`, `last_ref`, `side` (`wire` or `store`): one row per run of consecutive units R16 or R22 skipped, as R22 names them.

**R54** (new, Provides, after R53) The term fold: `normAlias(s)` is `s` trimmed, each whitespace run collapsed to one space, lower-cased and cut to 200 characters, diacritics not folded; `labelTerms(s)` is the distinct non-empty terms of `normAlias(s)` split on every run of characters that are neither a Unicode letter nor a digit, in order, at most 24. `reading_ref_terms.term` is exactly `labelTerms` of its source string, so a module matching a name against it folds with `labelTerms` (entities' alias index keys on `normAlias`) and the two sides cannot drift.

**R16** (amended, first sentence) "Text units: one per page, paragraph, slide or sheet holding a glyph, its extent in the producer's own numbering and `seq` its position; a sheet is a unit only when its reader names its used range, and its extent is that `sheet-range` (`{kind: "sheet-range", sheet, range}`); a sheet with no named range is no unit." (N108's second half: D-672 whole, retrieval R25 met over `sheet-range` units. The xlsx, ods and csv entries all emit `sheets[].range` through `sheetRangeRef`.) The rest of R16 unchanged.

My best reading, which I am building: exactly the above; the whole-sheet unit only (a workbook's defined names and tables, `xlsxRangeUnits`, are not units: retrieval R25 asks for sheet grain). If BOB wants other columns named (e.g. `readings.found`/`at`, which `capturesReadFor` already serves), say which.

## J2 · REPORT

Found in other modules while applying N108 (none changed by me):

1. **observation-log** (layer 5; this blocks D-672 being whole in the record's own words): `CAPTURE_TEXT_UNIT_CONTAINERS` (`src/observation-log/index.mjs` line 52) is `pdf, docx, odt, pptx, odp`, so `onReadingNotice` writes a workbook's `indexed` content-axis row as `LOOKED_INDETERMINATE` "a xlsx has no indexing unit arm … nothing yet writes a workbook's sheet-range units", although extraction now writes them and its own `unitsOf` answers `whole`. It needs `xlsx`, `ods` and `csv` (the containers whose producers return `sheets[]`), and the reason text at line 249 and the vocabulary's sentences (`vocabulary.mjs` 271, 416) corrected. Retrieval R25 ("a workbook indexed so reads as indexed on the content axis, not as a container with no unit arm") reads that row, so until then R25 holds for the units and not for the axis's word. The same stale sentence is in `src/airun.mjs` 330 and 475 (ai-runs, layer 6).
2. **legacy-tests** (layer 11): `bio-plane/test/capture-text-index.test.mjs` goes 1/0 → 0/1 by two arms that pin the retired rule: B3 ("the WORKBOOK emits NO units at all … `sheet-range` waits on EXTRACTION-BREADTH §3.2") and C1 ("the workbook contributes none"). Re-pin both to the workbook's two `sheet-range` units (Summary, Detail) at their used ranges; its `nc-rec91.mjs` arm `armsopen` (which expects the workbook arm to fail) moves with observation-log's item 1. The other ten legacy suites that read text units are unchanged (cite-extent, content-extent-arms, content-extent-leg, d536-reading-provenance, formats-csv, fw19-extent-arms, observation-content, ocr-member-e2e, passage-arm, versiongrade: 1/0 each, mine and base).
3. **connections** (test): m/connections reads 59/1 on this branch and on the base alike: `factory.test.mjs` line 18 against capture R58. Already reported by CAPTURE #3 (its J2 item 1); named here only because it shows in my users' run.
4. **Generated artifact made stale** (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and its manifest carry extraction's source (`pipeline.mjs`); regenerate at the layer close.

## J3 · COMPLETE

**Entry applied: N108**, both halves, against J1's proposed text (not yet answered; a CHANGE re-opens me).
- **The read contract (R53) and the term fold (R54):** proposed in J1 for folding; nothing in the code needed to change to meet them (the columns and folds already behave as stated). Marked at their sites in `src/extraction/index.mjs` (a comment naming the contract's columns above `normAlias`/`labelTerms`). No exported constant added: a public name the Provides do not state.
- **The unit writer names sheets (R16 as amended in J1; D-672 whole):** `textUnitsFor` gains a `sheets[]` arm: one `sheet-range` unit per sheet holding a glyph whose reader names its used range (`{kind: "sheet-range", sheet, range}` from `sheets[].range`, which the xlsx, ods and csv entries emit through `usedSheetRange`), `seq` the sheet's position; a sheet with no named range is no unit, never a guessed rectangle; a workbook's defined names and tables are not units. The index writer (R22) needed no change: it takes the extent, `describeExtent` gives `Sheet!A1:B3`, and the chain kind is the document's. `schema.mjs`'s comments no longer say a workbook has no unit arm.

**Deferred**, with why: none of the entry. One observation, not a flaw today: the wire charges each unit its text plus a flat 128-byte envelope (R16); a `sheet-range` extent carries the sheet's name, so an `.ods` sheet with a very long name costs its envelope more than 128. The budget is half of INLINE_MAX, so the margin holds; changing the charge is a requirement change, not taken.

**Found in other modules:** REPORT J2 (observation-log's unit-container list, which leaves retrieval R25's axis word stale; legacy-tests' capture-text-index B3/C1 re-pin; connections' factory arm, already CAPTURE #3's; the plane bundle stale).

**Tests and checks** (on `job/T7/extraction` @ 3ec54e1fe4, `tranche/T7` @ e15806be, nothing of BOB's to merge):
- `node --test bio-plane/test/m/extraction/`: **65 pass, 0 fail** (new `readcontract.test.mjs`: R53 column set, `readings`, `reading_refs`, `reading_ref_terms` with the within-group rule, `capture_text_skipped`; R54 the folds; `read.test.mjs` gains an R16/R22 sheet arm: a scripted workbook, and the real csv entry read, written and indexed, `unitsOf` whole with a `sheet-range` unit).
- Users' tests: m/content 49/0, m/entities 34/0, m/progressions 40/0, m/observation-log 42/0, m/retrieval 58/0, m/query-language 24/0, m/connections 59/1 (identical on the base; J2 item 3). Layers 6–8 users have no m/ tests yet.
- Legacy suites reading text units: capture-text-index 0/1 (base 1/0; J2 item 2, the pinned retired rule); ten others 1/0 each, as the base.
- `checks/format.mjs`: 69 modules, 64 requirements files, 0 failures. `checks/architecture.mjs bio extraction`: 0 failures. `checks/coverage.mjs bio extraction`: 52 of 52 live ids named, 0 failures (R53 and R54 are named by tests already, for when BOB folds them). `checks/ownership.mjs bio extraction tranche/T7`: 6 files changed; legacy-checks, legacy-store, legacy-index 0 lines added, 0 removed; 0 failures.

Size (session_01E5kejJCTLEwWFYSLe7y9uh): test runs 10, module lines 3419

## J4 · COMPLETE

B2 applied: `tranche/T7` merged; the tests and site comments name **R58** and **R59** (K179), R16 as amended. Nothing else changed; J3 stands otherwise, and J2's REPORT is unchanged.

Re-run on `job/T7/extraction` after the merge: m/extraction **65 pass, 0 fail**. `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio extraction`: 0 failures. `checks/coverage.mjs bio extraction`: **54 of 54** live ids named, 0 failures. `checks/ownership.mjs bio extraction tranche/T7`: legacy-checks, legacy-store, legacy-index 0 lines added, 0 removed; 0 failures.

Size (session_01E5kejJCTLEwWFYSLe7y9uh): test runs 11, module lines 3419
