# odf-reader (T9)

**Status** · session_01WS5qsgXgxGzNszdSSHz4o2 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N27 adds output to `odsEntry.text()`, and `build/requirements/odf-reader.md` carries no id for it (nor `a1Corner`/`rangeUnitFor` in Uses). My best reading, which I am building now and will test as **R44** unless you word it otherwise:

- **R44** `odsEntry.text()` also carries `rangeUnits: [{source:"named-range"|"database-range", name, scope, hidden:false, unit}]`, one per `<table:named-range>` (document-scoped, `scope:null`, or inside a `<table:table>`, `scope` that sheet's name) and `<table:database-range>` (`scope` its sheet) whose address names ONE rectangle on ONE sheet of this document, `unit` being its `sheet-range` reference from office-readers' `rangeUnitFor` (grid `null`: OpenDocument fixes none, R42); and `rangeUnitsSkipped: [{source, name, ref, why}]` for every other, and for every `<table:named-expression>` (`source:"named-expression"`, `why:"not_a_range_reference"`: a formula, as xlsx R9 skips a formula-valued defined name). `why` is one of `multi_area`, `broken_reference`, `not_a_range_reference`, `whole_row_or_column`, `external_workbook`, `multi_sheet_reference`, `no_such_sheet`, `empty_reference` (R9's vocabulary; `outside_grid` and the table-part reasons cannot arise). `hidden` is `false` because ODF has no hidden flag on a name. Over the guard, and with no readable `<office:spreadsheet>` body, both are `null`, never `[]`: unlike xlsx, whose names live in the small `workbook.xml`, an `.ods` declares them only in `content.xml`, which was not read (R41).
- Uses gains `office-readers`: `a1Corner`, `rangeUnitFor` (`formats-xlsx.mjs`).

The snapshot's `odsRangeAddressUnit`/`odsRangeUnits` exports would become private (no caller outside the file).

## Completion

**Entries applied**
- **N27** (the `.ods` half of D-415; R44, K278): `odsEntry.text()` carries `rangeUnits` and `rangeUnitsSkipped`. One token walk over the `<office:spreadsheet>` body, in document order, reads every `<table:named-range>` (scope `null` at document level, else its sheet), `<table:named-expression>` (always skipped, `not_a_range_reference`) and `<table:database-range>` (scope its unit's sheet). Addresses are parsed locally (ODF syntax: `$Sheet.$A$1:.$B$2`, quoted names with `''`, the second corner's sheet optional). Each corner goes through `a1Corner`, and each rectangle becomes a unit through `rangeUnitFor` (office-readers; grid `null`). Over the guard, and with no readable body, both lists are `null`.
- Built work on `land/worker/D-415` @ 48245247 was judged against R44 and kept, with these changes:
  - its two helpers are private now (no caller outside the file);
  - one walk in document order replaces its two passes (document names first, then per-sheet names);
  - `<table:named-expression>` is now listed as skipped instead of dropped;
  - a whole column or row (`.$A`, `.$3`) is now `whole_row_or_column` instead of `not_a_range_reference`, to match xlsx.

**Deferred:** nothing.

**Found in other modules**
- **Generated artifacts made stale (manifest §14):** `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs`, because `src/odf.mjs` changed. `fleetbundles` reports these two as STALE BUNDLE; its only other failure is the same `agent-worker` byte-identity arm. On the tranche baseline (stashed) it passes. I have not rebuilt them.
- **office-readers:** `a1Corner` and `rangeUnitFor` are used as R44 names them. office-readers' job (N27, this layer) has not yet named them in its Provides.

**Tests and checks**
- `node --test bio-plane/test/m/odf-reader/`: tests 48, pass 48, fail 0, todo 0. The new `ranges.test.mjs` has three R44 tests: units with their scopes and order; every skip reason; and `[]` versus `null`.
- `node --test bio-plane/test/formats-odf.test.mjs` (legacy suite, read only): pass 1, fail 0.
- `node --test bio-plane/test/fleetbundles.test.mjs`: fail 1, the staleness reported above.
- Layer tests: none named in the manifest.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture odf-reader`: 9 product files, 34 relative imports; 0 failures.
- `coverage odf-reader`: 44 of 44 live requirement ids named by a test; 0 failures.
- `ownership odf-reader tranche/T9`: 3 files changed; 0 failures.

Size (session_01WS5qsgXgxGzNszdSSHz4o2): test runs 7, module lines 2122
