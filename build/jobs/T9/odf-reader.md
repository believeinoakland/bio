# odf-reader (T9)

**Status** · session_01WS5qsgXgxGzNszdSSHz4o2 · depth 2 · WORKING · handled B1

## J1 · QUESTION

N27 adds output to `odsEntry.text()`, and `build/requirements/odf-reader.md` carries no id for it (nor `a1Corner`/`rangeUnitFor` in Uses). My best reading, which I am building now and will test as **R44** unless you word it otherwise:

- **R44** `odsEntry.text()` also carries `rangeUnits: [{source:"named-range"|"database-range", name, scope, hidden:false, unit}]`, one per `<table:named-range>` (document-scoped, `scope:null`, or inside a `<table:table>`, `scope` that sheet's name) and `<table:database-range>` (`scope` its sheet) whose address names ONE rectangle on ONE sheet of this document, `unit` being its `sheet-range` reference from office-readers' `rangeUnitFor` (grid `null`: OpenDocument fixes none, R42); and `rangeUnitsSkipped: [{source, name, ref, why}]` for every other, and for every `<table:named-expression>` (`source:"named-expression"`, `why:"not_a_range_reference"`: a formula, as xlsx R9 skips a formula-valued defined name). `why` is one of `multi_area`, `broken_reference`, `not_a_range_reference`, `whole_row_or_column`, `external_workbook`, `multi_sheet_reference`, `no_such_sheet`, `empty_reference` (R9's vocabulary; `outside_grid` and the table-part reasons cannot arise). `hidden` is `false` because ODF has no hidden flag on a name. Over the guard, and with no readable `<office:spreadsheet>` body, both are `null`, never `[]`: unlike xlsx, whose names live in the small `workbook.xml`, an `.ods` declares them only in `content.xml`, which was not read (R41).
- Uses gains `office-readers`: `a1Corner`, `rangeUnitFor` (`formats-xlsx.mjs`).

The snapshot's `odsRangeAddressUnit`/`odsRangeUnits` exports would become private (no caller outside the file).
