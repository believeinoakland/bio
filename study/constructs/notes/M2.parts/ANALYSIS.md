### from jurisdictions.txt
- [DESIGN] jurisdictions R3, l.17 — `fund` and `parcel` identifier spaces (keys for joining budget and property records)
- [BUILT] jurisdictions R21, l.86 — "the budget data set" is a named system of the first profile
- [DESIGN] jurisdictions R3 `floor`, l.19 — coverage floor: the first enactment number a system's record holds (what a count over that system can and cannot cover)
### from id-spaces.txt
- [DESIGN] id-spaces R20, l.50 — `fund` joins require fund names equal after normalising (case, punctuation, the word "fund") — joins budget datasets across publications
- [DESIGN] id-spaces R18, R22, l.48, l.52 — `VALUES_DIFFER` with `near_miss` for leading-zero differences — "A near miss is never counted."; `counts` true only for `SHARED`
- [DESIGN] id-spaces R25, l.68 — "Every "no" says which kind of no: outside the reach, undetermined, unjoined, a different value, or one system."
### from docprofile.txt
- [EXAMPLE] docprofile R5, l.34–36 — a document satisfying more than one class "(measured: about one in twelve)" states all of them in `also`
- [DESIGN] docprofile Uses, l.163–165 — report-template headings include "fiscal impact" (a staff report's budget section is recognised as a section only)
- [DESIGN] docprofile R18, R24, l.93–95, l.116–117 — refuses a reading when undetermined characters outnumber decoded ones; undetermined counts are "never invented from the text alone"
### from office-readers.txt
- [DESIGN] office-readers Purpose, l.9 — XLSX and CSV are read into the I2 structure and text shapes (spreadsheets enter the record as readings, not as computable tables)
- [DESIGN] office-readers R11 xlsx, l.153–161 — `document` "every sheet's text, tab-joined per row"; `sheets` `[{sheet, name, hidden, rows, cols, usedRows, usedCols, range, text, undetermined}]`; rows/cols the fixed format bound (1,048,576 / 16,384); an unresolvable shared string is a stated `undetermined`, "never an invented string"
- [DESIGN] office-readers R10 xlsx, l.113–116 — `{kind:"formula", source, formula, value}`: the cached value "held BESIDE `formula`, never substituted for it"; no formula is recalculated (pure, R20)
- [DESIGN] office-readers R10, l.115–120; R23, l.268–270 — hidden rows, columns, sheets (`hidden`/`veryHidden`) surfaced as evidence; "Nothing this module marks `hidden` ... is ever omitted from `text()`'s output"
- [BUILT] office-readers R9, l.88–97 (D-415, K36, built T2) — each workbook defined name and table part that is one rectangle on one sheet becomes a `sheet-range` `rangeUnit`; others listed in `rangeUnitsSkipped` with a reason (`multi_area`, `external_workbook`, …)
- [DESIGN] office-readers R11 csv, l.162–170 — "Row 1 is always row 1: no record is consumed, skipped or reinterpreted as a header." Empty field = measured emptiness; an unreadable field is `undetermined` "never mojibake"
- [DESIGN] office-readers R14, l.193–207 — CSV `dialect()`: encoding (BOM certain; us-ascii certain; utf-8 likely; else undetermined) and delimiter (comma/semicolon/tab/pipe over first 50 lines; ties or none → undetermined); persisted as `reading.dialect` (REC-218, l.291–292)
- [DESIGN] office-readers R12–R13, l.174–189 — size guard: over 20 MiB declared uncompressed text bytes, text is refused (`document:null`, marker in `undetermined`), "never a silent truncation"
- [GAP] office-readers status, l.3; Suggestions l.319–322 — "R11's csv bound stays the OOXML figure (20 MiB) until measured on a deployed plane (DIST-14)"
- [DESIGN] office-readers R17, R18, R26, R27, l.222–234 (N27, K279) — cell and range references (`Sheet!B4`, `Sheet!A1:D20`) via one builder; `rangeUnitFor` refuses `outside_grid`, `no_such_sheet`
- [GAP] (observation) office-readers whole — no cell typing (number, date, currency), no column/header semantics, no formula evaluation, no table-as-data service; cells are text and references only
### from odf-reader.txt
- [EXAMPLE] odf-reader Satisfies, l.263–265 — ODF was "deliberately not built" until "CAP-8/COFF-10's 2026-09-14 ruling made a Google Drive export ODF's harvest format" (a published Google Sheet arrives as .ods)
- [DESIGN] odf-reader R15, l.100–104 — `.ods` formula verbatim ("its OpenFormula `of:` prefix kept") beside the displayed value — "The formula is never collapsed into, or substituted for, the cell's displayed text."
- [DESIGN] odf-reader R16, l.105–111 — hidden rows/cols as ranges whose `table:visibility` is `collapse` or `filter` (a publisher's filter is surfaced as evidence); hidden sheets
- [DESIGN] odf-reader R18–R19, l.118–129 — sheets' used extent and range; text tab-joined "by their displayed value (never their formula)"; counts `cells` (non-empty) and `formulas`
- [DESIGN] odf-reader R42, l.249–251 — a `.ods` capacity is always `null`; never borrows XLSX's grid
- [DESIGN] odf-reader R44, l.222–223 (N27, D-415; K278) — named ranges and database ranges that are one rectangle become `sheet-range` `rangeUnits`; named expressions skipped as `not_a_range_reference`
- [DESIGN] odf-reader R45, l.224–225 (N30, K428) — repeats expanded within `ODF_REPEAT_EXPANSION_MAX` (262,144 units) and the 20 MiB text bound; past it the read stops "as over the size guard" with `over_repeat_bound`
- [GAP] (observation) odf-reader whole — as office-readers: no typed values, no column semantics, no recomputation; a spreadsheet is text plus references
### from extraction.txt
- [DESIGN] extraction R22, l.46 — text-index bounds: units capped at 128 KiB, at most 4,096 units and 2 MiB per capture; the answer counts `offered`, `written`, `truncated`, `over_bound`, `unaddressable` (a spreadsheet's text is indexed within these bounds)
- [DESIGN] extraction R48, l.138 — "Every list read is bounded and says when it was cut (`limit`, `truncated`)." R29: default 200, max 5,000
- [DESIGN] extraction R67, l.106–107 — the module's figure `textUnits` for `op=stats` via `record-core.registerCounts`; R43 l.102 `mintRatio` "answers `ratio: null` when nothing was minted"
- [DESIGN] extraction R45, l.135 — "absent, empty and null stay three facts (page count, container extent, units, provenance, dialect)"
### from content.txt
- [DESIGN] content Terms and R1, l.17, l.20 — `sheet-cell` `{sheet, cell}`, `sheet-range` `{sheet, range}`, `doc-table` `{table, cell?}` are citable extents: a member can cite a cell or range of a published spreadsheet; R7 l.26 a cell "past the format's grid capacity (never the used range: an empty cell exists)" is refused
- [DESIGN] content R46, l.92 (N215, K249) — `passageText`: the text at exactly a row's extent; null when stale, `bytes`, or not held whole — "a caller reads `null` as the passage held in a form not read (`consequences` R2: `undetermined`), never as empty text" (the hand-off from cited passage to layer-9 calculation)
- [DESIGN] content R31, l.68 — similarity grade "word-multiset Dice at or above 0.7"
- [DESIGN] content R51, l.112 — figures `content` and `contentStale` for `op=stats`; R20 l.47 standings for at most 200 ids; R41 `STALE_GRADED_MAX` 200
### from entities.txt
- [DESIGN] entities R17, l.45 — `selectivity` = "1 − reach ÷ corpus over the references this viewer can see"; uninformative names reported "with its arithmetic"
- [DESIGN] entities R39, l.76 (N351, K477) — collections bounded (500; relations 1,000, the walk bound intent R4 reads) — "a truncated collection never answers a count as whole"
- [DESIGN] entities R41, l.86 — figures `entities`, `entityAliases`, `entityRelations`, `resolutions` for `op=stats`
- [DESIGN] entities Terms, l.17; R21 — `fund` and `parcel` kinds; idMatch answers a parcel's standing "over the vintages the record holds"
### from connections.txt
- [DESIGN] connections R2, l.22 — pair arithmetic stated: bound 500 (max 5,000) pairs; at most 5,000 resolution rows read; "a trailing partly-read capture dropped rather than graded weaker"
- [DESIGN] connections R13, R52, l.37, l.90 — `portionGrades` (≤200 rows, set-based) and `portionAxes` for the earned-basis registry; undetermined causes `NO_CONNECTION`, `CONNECTION_OUTSIDE_PORTION`, `CONNECTION_PORTION_UNDETERMINED` "never read as none"
- [DESIGN] connections R60–R61, l.105–107 — figures `connections`, `connectionPairChoices`, `connectionDirty`, `themes`, `themePlacements`, `refs` for `op=stats`
### from progressions.txt
- [GAP] progressions R32, l.102 — junction checks are "data over an instance" yielding findings, deferred "until the record holds amounts and funds as values, `EXTRACTION-BREADTH-DESIGN.md` §2 row 5, its stated trigger" — the record holds no amounts as values
- [DESIGN] progressions R18, l.52 — `proposalsFeed`: one walk; proposals aggregated one per (progression, stage) with instance counts, weakest grade (null if any undetermined), `overdue_count`, ordered by instance count
- [DESIGN] progressions R31 interface, l.67 — `cardinality_exceeded` finding (`document_count` vs `cardinality`), "**not aggregated into `proposals[]`**"
- [DESIGN] progressions R24, l.94 — "Grades, findings, deadlines and aggregates are derived on every read and never stored."
### from bias.txt
- [DESIGN] bias R6, l.25 (DEC-17) — "text setting a threshold (a count of sources, a grade floor): a bar, not a lens" is refused (C-26.6); a bar is `required_strength`
- [DESIGN] bias R17, l.42 — `statements_sha` over the whole effective set before paging — "so two computations of one lens give one hash whatever the page" (a reproducibility hash)
- [DESIGN] bias R20, l.47 — `coverage` states how many policy sentences were read, of how many (≤500), and whether the input was cut
