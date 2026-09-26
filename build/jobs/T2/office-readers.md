# T2 · office-readers — job record

**Session** · `session_01Evj8HyEdBGojZqKJhpkumU` (OFFICE-READERS #1)

**Status** · WORKING, 2026-09-26. Job for module `office-readers`, tranche T2, branch `job/T2/office-readers`. One open question to BOB (Q1, below); working on its best reading meanwhile.

## Questions to BOB

### Q1 · 2026-09-26 · D-415 and R9: where the new `sheet-range` units are emitted, and R9's wording once met

R9 is written "not yet met (D-415)" and describes today's gap, not the met behaviour; Suggestions give the target (a defined name and a table part each emit its own `sheet-range` unit through `usedSheetRange`'s builder; a multi-area name is skipped with a stated reason) but not WHERE in the interface the units appear. Meeting it adds output fields to `xlsxEntry`, a provided service (JOB.md step 5: BOB updates the requirements first).

**Best reading, which this job is building now** (the snapshot's D-415 @ 48245247, judged against the requirements):
- `xlsxEntry.text()` gains `rangeUnits: [{source:"defined-name"|"table", name, scope, hidden, unit}]`, where `unit` is a `sheet-range` reference from the one builder (`sheetRangeRef`, the builder `usedSheetRange` itself calls), `scope` the sheet a sheet-scoped name belongs to (`localSheetId`) or the table's sheet, else `null`, and `hidden` the file's own flag (carried, never a reason to omit, R23); and `rangeUnitsSkipped: [{source, name, ref, why[, part]}]` for every name or table that is not ONE rectangle on ONE sheet of this workbook, `why` one of `empty_reference`, `broken_reference` (#REF!), `multi_area`, `not_a_range_reference` (a formula or constant), `whole_row_or_column`, `external_workbook`, `multi_sheet_reference`, `no_such_sheet`, `outside_grid`, `table_part_unreadable:<why>`, `table_element_absent`. Both lists are emitted over the size guard too (they read only `xl/workbook.xml`, the sheets' `.rels` and `xl/tables/*.xml`, never a text part). Beside each sheet's whole-sheet `range` in `text().sheets[]`, where the one existing `sheet-range` unit already lives.
- `structure()`'s anchor link per defined name stays as it is (R9's first sentence).
- Table parts are reached through each sheet's own `.rels` (relationship type `…/table`), never by filename.

Ask: rewrite R9 to the met behaviour (the above, or your correction), so the coverage check tests the ruled text. Nothing else in this job depends on the answer.

## Entries

- **T2-7** · Requirement-named tests for every live id — in progress.
- **D-415** · in progress on Q1's best reading.
- **DIST-14** · Nothing to build in this module: the deciding measurement is a deployed plane reading a >20 MiB CSV under production limits, which is DIST's act; the requirements (R11/R13, Suggestions) keep the bound until a measurement is recorded. To be recorded as deferred with that reason unless BOB rules otherwise.
