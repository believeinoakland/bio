# T2 · office-readers — job record

**Session** · `session_01Evj8HyEdBGojZqKJhpkumU` (OFFICE-READERS #1)

**Status** · COMPLETE, 2026-09-26, re-recorded after BOB's ANSWER to Q1 (K36): `origin/tranche/T2` @ 2d87d8e5bb merged, R9 reread whole, steps 5–7 repeated. Job for module `office-readers`, tranche T2, branch `job/T2/office-readers`. No open question.

## Questions to BOB

### Q1 · 2026-09-26 · D-415 and R9: where the new `sheet-range` units are emitted, and R9's wording once met — ANSWERED (K36, `tranche/T2` @ bf680b7e: the reading below, as written; R9 now states it)

R9 is written "not yet met (D-415)" and describes today's gap, not the met behaviour; Suggestions give the target (a defined name and a table part each emit its own `sheet-range` unit through `usedSheetRange`'s builder; a multi-area name is skipped with a stated reason) but not WHERE in the interface the units appear. Meeting it adds output fields to `xlsxEntry`, a provided service (JOB.md step 5: BOB updates the requirements first).

**Best reading, built and tested:**
- `xlsxEntry.text()` gains `rangeUnits: [{source:"defined-name"|"table", name, scope, hidden, unit}]`, where `unit` is a `sheet-range` reference from the one builder (`sheetRangeRef`, the builder `usedSheetRange` itself calls), `scope` the sheet a sheet-scoped name belongs to (`localSheetId`) or the table's sheet, else `null`, and `hidden` the file's own flag (carried, never a reason to omit, R23); and `rangeUnitsSkipped: [{source, name, ref, why[, part]}]` for every name or table that is not ONE rectangle on ONE sheet of this workbook, `why` one of `empty_reference`, `broken_reference` (#REF!), `multi_area`, `not_a_range_reference` (a formula or constant), `whole_row_or_column`, `external_workbook`, `multi_sheet_reference`, `no_such_sheet`, `outside_grid`, `table_part_unreadable:<why>`, `table_element_absent`. Both lists are emitted over the size guard too (they read only `xl/workbook.xml`, the sheets' `.rels` and `xl/tables/*.xml`, never a text part), beside each sheet's whole-sheet `range` in `text().sheets[]`, where the one existing `sheet-range` unit already lives.
- `structure()`'s anchor link per defined name stays as it is (R9's first sentence).
- Table parts are reached through each sheet's own `.rels` (relationship type `…/table`), never by filename.

Ask: rewrite R9 to the met behaviour (the above, or your correction), so the coverage check tests the ruled text.

## Entries applied

- **T2-7** · Requirement-named tests for every live id: `bio-plane/test/m/office-readers/` (57 tests in four files, `fixtures.mjs` builds every package byte by byte with `node:zlib`, independent of the module). R1–R25 each named in test titles and checked at the interface over the whole of the requirement, including every format for the shared ids.
- **D-415** · Built on Q1's reading. The snapshot's work (`land/worker/D-415` @ 48245247) was judged against the requirements and kept for `.xlsx` as built, with two changes: its sheet rels are now read once, by the same `walkRels` pass `structure()` uses, instead of a second read; and the helpers stay private except `a1Corner` and `rangeUnitFor`, exported for the `.ods` half (see Found in other modules). The snapshot's `.ods` half (`odf.mjs`) is `odf-reader`'s and was not taken. Tested under R9 (every skip reason, scope, hidden, case-insensitive and quoted sheet names, reversed corners, table parts reached only through rels, over the guard).
- **DIST-14** · Deferred, nothing built: the deciding measurement is a deployed plane reading a >20 MiB CSV in its scratch namespace under production limits, which is DIST's act, not a module job's. R11/R13 and the Suggestions keep `MEASURED_CSV_TEXT_BOUND_BYTES` = the OOXML figure until a measurement is recorded under `measurements/`; the bound is unchanged and tested as stated (R13).

## Flaws fixed in the module (step 4)

- **Character references past U+10FFFF threw** (`&#x110000;` in any docx, pptx or xlsx XML: `String.fromCodePoint` raises RangeError), against R21. Such a reference now stays as written. R21.
- **`parts()` threw on odd arguments** (`parts(-1)`: `new Uint8Array(-1)`), against R21. Each file now coerces as `ooxml` does (typed views and byte arrays read as bytes, anything else as no bytes, a named refusal downstream), and `structure`/`text` accept any typed view as bytes. R21.
- **xlsx dropped links**, against R7/R22: an unreadable sheet or other `.rels` part produced no undetermined link (docx/pptx do); an external relationship no `<hyperlink>` used was dropped; outbound relationships of other parts (a drawing's hyperlinks, an external link's workbook path) were never read. All rels now come from one `walkRels` pass: unused and other-part outbound rels are carried with `source:null`, an unreadable one is an `undetermined` `rels_unreadable` link. R7.
- **xlsx glued phonetic guides onto shared strings** (`<rPh>` runs carry their own `<t>`, which was concatenated into the cell text), inventing text (R22). Removed before the runs are joined. R11.
- **xlsx gave a nameless `<sheet>` a made-up name silently.** The placeholder stays (references need a name) but is now stated in `parts().undetermined` as `sheet_name_absent:<index>`. R22.
- **docx lost text after a text box**: a `<w:p>` inside `<w:txbxContent>` closed the anchoring paragraph, so its later text, runs and hyperlinks were dropped. The walk now returns to the outer paragraph; numbering is unchanged (paragraphs still numbered as they open). R11.
- **pptx ignored hyperlink ids without the `rId` prefix** (an xsd:ID convention, not a rule), so such a link lost its shape. Any non-empty `r:id` on `hlinkClick` is now joined. R7.
- **csv read a valid UTF-8 file as undetermined** when the 1 MiB signature window cut a multi-byte character; the window is now decoded as a stream. R14.
- **csv invented characters past the signature window**: a body whose head is ASCII (us-ascii, certain) or valid UTF-8 but carries a byte later that encoding cannot read was decoded leniently (windows-1252 or U+FFFD). ASCII-grid bodies are now walked over the byte transport and each non-ASCII field decoded on its own; one that cannot be read is an undetermined cell (`not_us_ascii`, `invalid_utf8`); an invalid UTF-16 body states the cells it spoils (`invalid_utf16`). R11, R22.

Each is proven by a test that fails on the unchanged sources (negative control, below).

## Deferred

- **DIST-14**, above.
- **docx `mc:AlternateContent` fallbacks**: a text box written with both a DrawingML choice and a VML fallback is read twice (its paragraphs and text appear twice). Not fixed in this job because skipping the fallback changes the paragraph numbering, and so the `¶n` references, of every stored reading of such a document; that is a change to what readings already recorded mean, which is BOB's to route (and possibly Bob's). Recommend: a `next.md` entry, with the numbering question put first.

## Found in other modules (REPORT)

- **odf-reader**: D-415's `.ods` half (named ranges and database ranges as `sheet-range` units) is on the snapshot (48245247, `odf.mjs`) and not among `odf-reader`'s T2 entries. The one rectangle-to-unit builder it should reuse is now exported here (`rangeUnitFor`, `a1Corner` in `formats-xlsx.mjs`); if it is routed, those two become Provides of this module and R-ids are needed.
- **text-chain**: D-416 (`readingPositionInExtent` and `sheet-range`) reads the units this job now emits; its `order: after D-415` is met on this branch once merged.
- **Generated artifact made stale**: `bio-plane/dist/bio-plane.bundled.mjs` (`.bundle.json`), owner `not_product`: `fleetbundles.test.mjs` reports it stale for `src/csv.mjs`, `docx.mjs`, `formats-xlsx.mjs`, `pptx.mjs`. BOB regenerates at the layer close (manifest §14). The worker bundles are not affected (verified: agent-, ocr-, pdf-worker "no staleness").
- **legacy-tests**: `formats-docx`, `formats-pptx`, `formats-xlsx`, `formats-csv` and the extent suites duplicate much of this module's own suite; they pass unchanged and can be retired with the battery.

## After K36 (Q1 answered)

R9 as rewritten states exactly what was built; no code change was needed, and the R9 tests already check the whole of it. Three leftovers in the requirement's wording, for BOB (no change to meaning): R9's line still carries the label *(not yet met: D-415)*; the Status paragraph still says R9 "is not fully met"; and the Suggestion on D-415's target behaviour now repeats R9. Also: R9 says each *single-area* defined name emits one anchor link, and the code, as before this job, emits one for every defined name, multi-area ones included (the R9 test checks this, every name). If R9 means "only single-area", say so and this job will narrow it; as written, nothing forbids it.

Re-run on the merged branch: `node --test bio-plane/test/m/office-readers/` — `pass 57, fail 0`; format `61 modules, 19 requirements files; 0 failures`; architecture `9 product files, 30 relative imports …; 0 failures`; coverage `25 of 25 live requirement ids named by a test; 0 failures`; ownership `10 files changed by office-readers between tranche/T2 and HEAD; 0 failures`.

## Tests and checks run

- `node --test bio-plane/test/m/office-readers/` — `tests 57, pass 57, fail 0` (8 runs in the job; the failures found on the way were four fixture errors in the tests and one module flaw, `parts(-1)`).
- Negative control: the same suite against the four files as they were on `tranche/T2` — `pass 44, fail 13`, exactly the tests of the fixes and of D-415, each by name; restored and re-run: 57/0.
- Tests of the modules that use this one, and the old battery's suites over these files (all unchanged in count from before the change): `formats-csv 75/0`, `formats-xlsx 88/0`, `formats-docx 82/0`, `formats-pptx 118/0`, `formats-odf 142/0`, `formats 36/0`, `fw19-extent-arms 36/0`, `reading-dialect 20/0`, `content-extent-arms 64/0`, `capture-container-extent 57/0`, `multifinding 84/0`, `publishedcase 129/0` (pass/fail).
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs` — `format: 61 modules, 19 requirements files; 0 failures`
- `node checks/architecture.mjs … office-readers` — `architecture: 9 product files, 30 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … office-readers` — `coverage: 1 modules, 25 of 25 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … office-readers tranche/T2` — `ownership: 10 files changed by office-readers between tranche/T2 and HEAD; 0 failures`

## Metrics

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01Evj8HyEdBGojZqKJhpkumU,job,office-readers,11678199,251103,116,92556,58,8,3320
```
