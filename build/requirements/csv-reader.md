# csv-reader — requirements

**Status** · In force: split out of `office-readers` in T51 (K624, K531, K617, K4507; BOB's, P6); designed by BOB #32 (2026-09-24), moved here unchanged; every id marked not yet met (T51) until CSV-READER #1 merges. Behaviour is the module it came from's, id by id; every requirement is met when the tests copied with it pass (it carries the office-readers tests, renamed). DIST-14's csv bound question moved with R6.

## Public

### Purpose

Reads CSV bytes into `format-registry`'s I7 entry contract: detection from the declared content type (never the bytes), the I2 structure shape and the I2 text shape, the dialect (encoding and delimiter, found by signature and recorded), and typed cells. It also builds the `sheet-cell` and `sheet-range` element references (and the A1 column letters) that `office-readers` and `odf-reader` reuse for the same kinds. It holds no record, reads nothing beyond the bytes it is handed, and writes nothing.

### Provides

One registry entry, the shape `format-registry` requires: `format` (a string), `detect(bytes, contentType)`, `parts(bytes)`, `structure(partsOrBytes)`, `text(partsOrBytes)` and `dialect(bytes)`. `structure` and `text` accept either raw bytes or `parts()`'s own output, so a caller that already paid for `parts()` does not pay twice.

- **R1** (office-readers R1, R6 in part) *(not yet met: T51)* The entry's `format` is `"csv"`.
- **R2** (office-readers R3) *(not yet met: T51)* `csvEntry.detect(bytes, _)` returns `null` for every `bytes` value, always — a CSV has no magic bytes, and the shape a byte signature would need is a shape prose can wear (measured, not assumed: OFFICE-FORMATS.md "CSV"). `detect(null, contentType)` returns `{format:"csv", confidence:"likely", signals}` when `contentType`, case-folded, is `text/csv` or one of the older synonyms `application/csv` / `text/comma-separated-values`; else `null`.
- **R3** (office-readers R6) *(not yet met: T51)* `csvEntry.parts`: `{ok:false, why:"empty_body"}` for zero-length bytes; `{ok:false, why:"decoder_unavailable:<encoding>"}` when the bytes declare (by BOM) an encoding the runtime has no `TextDecoder` for. Otherwise `{ok:true, ...}` always, regardless of what the delimiter or encoding signature could determine — an undetermined dialect is carried on the result, never refused.
- **R4** (office-readers structure() *(not yet met: T51)* intro, R10 csv arm) `structure()` returns `{ok, container:"csv", links, counts:{anchor,intra,deferred,refused,undetermined}, evidentiary, notes[], sheets}`, or `{ok:false, container, reason}` when `parts` failed. `links` is `[]` and every count `0`: the format has no relationships, embeds nothing and carries no metadata part, so the zero is a fact about the format and `notes` says so. `evidentiary` is always `{container:"csv", kinds:[], items:[], undetermined: [] | [guardMarker], counts:{}}`. `active` is `[]`. `dialect` is R7's.
- **R5** (office-readers R11 csv arm) *(not yet met: T51)* `text()` returns `{ok, container:"csv", document, undetermined, counts, images, sheets}`, or `{ok:false, container, reason}` when `parts` failed. `images` is always `[]` (the format has no media directory to have looked in — a zero of the format, not of a walk). `document` equals the one sheet's `text`. `sheets` is one entry, `{sheet:0, name:CSV_SHEET_NAME, hidden:false, rows:null, cols:null, usedRows, usedCols, range, text, undetermined}` — `rows`/`cols` are `null` (RFC 4180 fixes no maximum, so there is no bound to state, unlike xlsx's fixed grid). Row 1 is always row 1: no record is consumed, skipped or reinterpreted as a header. An empty field is a measured emptiness (no cell, no undetermined entry), distinct from a field the encoding could not read. Under an undetermined encoding, the grid still stands (delimiters, quotes and line breaks are ASCII); only a field actually holding a byte ≥ 0x80 is `undetermined`, named by its own `sheet-cell` reference with a `null` value — never mojibake.
- **R6** (office-readers R13) *(not yet met: T51)* The size guard compares the BODY's own byte length (after any BOM), not a declared-uncompressed figure — a CSV has no central directory to sum — against `MEASURED_CSV_TEXT_BOUND_BYTES` (the OOXML figure, 20 MiB, until measured on a deployed plane, DIST-14). Over the bound, `structure()` and `text()` both carry the guard marker verbatim in `undetermined`; the dialect (R7) still stands, because it is read from the signature window, which is always within the bound. (R9 reads a body over the bound, up to ooxml's ceiling, in pieces.)
- **R7** (office-readers R14) *(not yet met: T51)* `csvEntry.dialect(bytes) -> {encoding, encodingConfidence, encodingSignals, delimiter, delimiterConfidence, delimiterSignals, undetermined:[...]} | null`. This is the SAME computation `structure()`/`text()`'s own `dialect` field uses (one builder), so a dialect read at intake and a dialect read from a later full parse of the same bytes cannot disagree. `encoding`: a BOM decides it at `"certain"`; absent a BOM, no byte ≥ 0x80 in the first 1 MiB gives `"us-ascii"` at `"certain"` (not `"utf-8"`: the bytes say something every 8-bit superset decodes identically, which is the narrower true claim); valid UTF-8 in that window gives `"utf-8"` at `"likely"`; otherwise `encoding:null` with `undetermined` including `"encoding_undetermined"`. `delimiter`: exactly one of comma/semicolon/tab/pipe occurring a consistent, non-zero number of times outside quotes across the first 50 complete lines of the signature window gives that delimiter at `"certain"`; two or more equally consistent gives `delimiter:null` with `"delimiter_undetermined_tied"`; none consistent gives `"delimiter_undetermined_none_consistent"`; fewer than 2 complete lines gives `"delimiter_undetermined_too_few_lines"`. Returns `null` when the bytes are empty or their BOM-declared encoding has no runtime decoder.
- **R8** (office-readers R30, R31, R32 csv arms; K1448, K1505 (11) *(not yet met: T51)*, K1888) `csvEntry.text()` gives its sheet a `cells` list, `[{source, value, type, declared, cached, formula}]`, one per field holding a value, in row then column order. `source` is the cell's `sheet-cell` reference (R10). `value` is the field's decoded text, never re-rendered; `type` is `text` for every field (the format declares no type); `declared`, `cached` and `formula` are `null`. A field under an undetermined encoding (R5) keeps its entry with `value: null` and stays in `undetermined`. Over the size guard (R6) `cells` is `null`, never `[]`. `cells` is the contract `odf-reader` R46 gives `.ods` sheets, field for field. `text()`'s `metadata` is always `null` (the format carries none) and `active` is always `[]` (the format can carry none), in `structure()` and `text()` alike.
- **R9** (office-readers R35 csv arm; F7; K4487, K4504, K4489; amends R5, R6, R8) *(not yet met: T51)* **Large text is read in pieces.** A body over `MEASURED_CSV_TEXT_BOUND_BYTES` up to ooxml's ceiling is read in 1 MiB windows by `text()` and `structure()`. The answer is what a small file's would be, except that no typed `cells` are made (`sheets[].cells` is `null`), at most 10,000 unreadable cells are listed and then `{sheet: 0, cell: null, reason: "more_cells_undetermined", count}`, `text()` carries `piecewise` (ooxml `textPlan`'s) and `structure()` notes `text_read_in_pieces`. Over the ceiling the marker is `textPlan`'s `guard`, `final: true`, with `metric: "body_bytes"`; a UTF-16 body over the 20 MiB bound is stated at that figure with `final: true` and `encoding`, never read in pieces (K4489). Test: `large-text.test.mjs` (30 MB csv, a real body; read in a worker of 128 MB old space).

#### Reference builders (reused by `office-readers` and `odf-reader`)

Moved here so that `office-readers` may use `csv-reader` and not the reverse (the module order). `office-readers` re-exports them from `formats-xlsx.mjs`, so their users are unchanged.

- **R10** (office-readers R17) *(not yet met: T51)* `sheetCellRef(sheet, cell) -> {kind:"sheet-cell", ref:"<sheet>!<cell>", sheet, cell}`.
- **R11** (office-readers R18) *(not yet met: T51)* `usedSheetRange(name, usedRows, usedCols) -> {kind:"sheet-range", ref:"<name>!A1:<colLetters(usedCols)><usedRows>", sheet:name, range} | null`. `null` when `usedRows`/`usedCols` are not both positive integers — nothing was measured, or the measured extent is empty; never a range over an unmeasured or empty sheet.

Errors: none of R1–R11 ever throws. A precondition this module cannot verify is answered as a stated `undetermined`/`ok:false`, never an exception and never a guess.

## Private

### Uses

- `ooxml`: `MEASURED_OOXML_TEXT_BOUND_BYTES` (the bound R6 reuses) and `textPlan` (R9's pieces and guard). `csv.mjs` uses nothing else of it: a CSV is not a container.
- `setup-words`: `word`, `localize` (the words rule: a sentence people read is read by key; K3930, K3943, K3949).

### Invariants

- **R12** (office-readers R20) *(not yet met: T51)* Pure: no store, no network, no clock in any output. The same input bytes always give the same answer.
- **R13** (office-readers R21, R22) *(not yet met: T51)* Never throws; every failure this module can name is a returned `{ok:false, ...}` or a carried `undetermined` entry. Never invents: a dialect, a character or a cell this module cannot establish is a STATED `undetermined`, never silently dropped and never guessed.
- **R14** (office-readers R24) *(not yet met: T51)* Asserts nothing about MEANING (that judgment belongs to `content`/`entities`, through I2); a URL in a cell is text, not a link; writes nothing to the record.
- **R15** (office-readers R25) *(not yet met: T51)* No place is named in this module; it holds no jurisdiction-specific behaviour to take from a profile.

### Satisfies

- `BIO_Content_Framework_v0_10.md`, Part I §4 (the FORMAT axis) and the I7 registry entry shape and IC-1 element-reference union built from it.
- `docs/development/OFFICE-FORMATS.md`, "CSV" (BOB #32's design and its measured page, and the unsettled bound stated at DIST-14).
- `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6, for the `sheet-cell` and `sheet-range` kinds R10 and R11 build.
- Bob's rulings: BOB #32 (2026-09-24, the CSV entry's design); BOB #33 (2026-09-24 21:55Z, REC-218, the dialect persisted as `reading.dialect`, read through this module's `dialect` slot); K624, K531, K617 (this split).

### Suggestions

- `encodingSignature`, `delimiterSignature`, `walkRecords`, `createRecordWalk`, `csvCellRef`, `columnLetters`, `sheetRangeRef`, and the `CSV_CONTENT_TYPE` / `CSV_SHEET_NAME` / `MEASURED_CSV_TEXT_BOUND_BYTES` constants are exported and used only by this module's files and tests (and `columnLetters`/`sheetRangeRef` by `docx.mjs` and `odf.mjs` through the re-export). They are implementation, not Provides; promote one only once another module imports it.
- DIST-14's bound question (R6) is not this module's to resolve: the deciding measurement needs a deployed plane. The bound stays `MEASURED_OOXML_TEXT_BOUND_BYTES` reused; do not change the figure without a new measurement recorded under `measurements/`.
- The builders in R10/R11 sit here only for the module order (see the split draft, section 0). If `office-readers` later moves above or beside `csv-reader`, they should go back (a K3268 move: copy, delegate).
