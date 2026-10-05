# office-readers — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code: `bio-plane/src/docx.mjs`, `bio-plane/src/pptx.mjs`, `bio-plane/src/formats-xlsx.mjs`, `bio-plane/src/csv.mjs`. R9 (D-415, K36) built in T2. R11's csv bound stays the OOXML figure (20 MiB) until measured on a deployed plane (DIST-14, carried in `build/plan/next.md`). Every id met and tested in T2 (2026-09-26; `build/plan/archive/T2.md`). T33's fold, by a requirements worker for BOB #114 on `tranche/T32`, 2026-10-05, from plan entry T33-10 (entry C:A-3; B §(d) EVENTS 3; K1448, K1505 (11)): R30 (typed cells, the contract `odf-reader` R46 shares) and R31 (office metadata in `text()`) added; not yet met (T33-10). P6: wiring only; if the job would take the module past about 4,000 lines, `formats-xlsx` splits first (BOB's, K617).

## Public

### Purpose

Reads DOCX, PPTX, XLSX and CSV bytes into `format-registry`'s I7 entry contract:
detection, the I2 structure shape (links with IC-1 element references, and the DEC-5
evidentiary envelope) and the I2 text shape. It also exports the per-container
element-reference builders that `odf-reader` reuses so its OpenDocument entries emit
byte-identical reference shapes for the same kinds. It holds no record, reads nothing
beyond the bytes it is handed, and writes nothing.

### Provides

Four registry entries, each the shape `format-registry` requires: `format` (a string),
`detect(bytes, contentType)`, `parts(bytes)`, `structure(partsOrBytes)`, `text(partsOrBytes)`,
and — `csv` only — `dialect(bytes)`. `structure` and `text` accept either raw bytes or
`parts()`'s own output, so a caller that already paid for `parts()` does not pay twice.

#### Detection

- **R1** Each entry's `format` is `"docx"`, `"pptx"`, `"xlsx"` or `"csv"`.
- **R2** `docxEntry`, `pptxEntry`, `xlsxEntry`: `detect(bytes, null)` returns `null` when
  `bytes` has no ZIP local-file-header magic, or has the magic but no readable central
  directory (the acquire-time 1 KiB prefix seam — a bare `PK\x03\x04` sniff never claims
  one of these formats). With a readable central directory that names both
  `[Content_Types].xml` and the format's own main part (`word/document.xml`,
  `ppt/presentation.xml`, `xl/workbook.xml`), it returns
  `{format, confidence:"likely", signals}` — never `"certain"`: the OPC declared content
  type is a deflated part, out of a synchronous detect's reach. `detect(null, contentType)`
  returns `{format, confidence:"likely", signals}` when `contentType` exactly equals the
  format's registered content type (`DOCX_CONTENT_TYPE`, `PPTX_CONTENT_TYPE`,
  `XLSX_CONTENT_TYPE`), else `null`.
- **R3** `csvEntry.detect(bytes, _)` returns `null` for every `bytes` value, always — a CSV
  has no magic bytes, and the shape a byte signature would need is a shape prose can wear
  (measured, not assumed: OFFICE-FORMATS.md "CSV"). `detect(null, contentType)` returns
  `{format:"csv", confidence:"likely", signals}` when `contentType`, case-folded, is
  `text/csv` or one of the older synonyms `application/csv` /
  `text/comma-separated-values`; else `null`.

#### `parts()`

- **R4** `docxEntry.parts`/`pptxEntry.parts`: an unreadable main part (`word/document.xml`,
  `ppt/presentation.xml`) does not fail the read. `parts().ok` stays `true`; the main part's
  text is `null`, and the failure is carried in `parts().undetermined` (docx) or as a note
  plus unnumbered slides (pptx, `order: null`). `parts()` returns `{ok:false, why, signals}`
  only when the bytes are not discriminated as the entry's own format or the ZIP container
  itself cannot be read.
- **R5** `xlsxEntry.parts`: an unreadable `xl/workbook.xml` fails the whole read —
  `{ok:false, why:"workbook_unreadable:<reason>"}` — because sheet names, order and hidden
  state all come from it and nothing downstream can proceed without it. Any other part
  (a sheet, `sharedStrings.xml`, `docProps/core.xml`) failing is carried in `undetermined`
  while `ok` stays `true`.
- **R6** `csvEntry.parts`: `{ok:false, why:"empty_body"}` for zero-length bytes;
  `{ok:false, why:"decoder_unavailable:<encoding>"}` when the bytes declare (by BOM) an
  encoding the runtime has no `TextDecoder` for. Otherwise `{ok:true, ...}` always,
  regardless of what the delimiter or encoding signature could determine — an undetermined
  dialect is carried on the result, never refused.

#### `structure()` — the I2 shape

Every entry's `structure()` returns `{ok, container:"docx"|"pptx"|"xlsx"|"csv", links,
counts:{anchor,intra,deferred,refused,undetermined}, evidentiary, notes[]}` plus one
format-specific unit-count field (`paragraphs` for docx, `slides` for pptx, `sheets` for
xlsx and csv), or `{ok:false, container, reason}` when `parts` failed.

- **R7** Each `links[]` entry is `{partition, wrapper, target, source}`. `partition` is
  `"deferred"` (http/https or a bare relative target) or `"refused"` (every other URI
  scheme) for an outbound relationship — classified and wrapped through
  `subresources.linkWrapper`, never re-derived; `"anchor"` for an internal reference that
  resolves (a DOCX bookmark, an XLSX defined name or cross-sheet reference, a PPTX
  same-deck slide jump); `"intra"` for an embedded part, content-addressed by its sha256;
  `"undetermined"` for a reference this entry could not resolve, carrying why. `source` is
  the element reference (below) of where in the document the link was found, or `null` for
  a document-level fact with no single location (a defined name, an unused rel, an
  embedding no usage was found for). An unreadable `.rels` part yields an `undetermined`
  link stating links MAY be missing — never counted as zero.
- **R8** Element references (IC-1), each produced ONLY by this module (§ Reference
  builders): `docx` sources are `docParaRef`; `pptx` sources are `slideShapeRef`, with
  slide numbers taken from the deck's own declared order
  (`ppt/presentation.xml`'s `sldIdLst`, resolved through its `.rels`) and NEVER from
  `slideN.xml` filenames, which record creation order; when that order cannot be read,
  affected slides and their sources are `null` (never numbered off the filename); `xlsx`
  sources are `sheetCellRef`.
- **R9** `xlsxEntry.structure`: each workbook `definedName` (multi-area ones included) in
  `xl/workbook.xml` emits one `anchor` link with `source:null` and
  `target:{definedName, ref, fragment:"#<ref>"}`. `xlsxEntry.text()` also carries, over the size
  guard too, `rangeUnits: [{source:"defined-name"|"table", name, scope, hidden, unit}]`, one per
  defined name or table part (reached through each sheet's own `.rels`) that is ONE rectangle on
  ONE sheet of this workbook, `unit` being its `sheet-range` reference from the one builder; and
  `rangeUnitsSkipped: [{source, name, ref, why, part?}]` for every other, `why` one of
  `multi_area`, `broken_reference`, `not_a_range_reference`, `whole_row_or_column`,
  `external_workbook`, `multi_sheet_reference`, `no_such_sheet`, `outside_grid`,
  `empty_reference`, `table_part_unreadable:<why>`, `table_element_absent`.
- **R10** The DEC-5 evidentiary envelope, `evidentiary:{container, kinds, items,
  undetermined, counts}`, is the SAME shape across every entry:
  - `docx`: `{kind:"tracked-change", change:"insertion"|"deletion", author, date, text
    (insertion) | superseded (deletion), source}` per `<w:ins>`/`<w:del>`; `{kind:"comment",
    id, author, date, initials, text, source}` per `word/comments.xml` entry;
    `{kind:"core-properties", creator, lastModifiedBy, revision, revisionNumber, created,
    modified, title, source:null}` when `docProps/core.xml` is present and readable.
  - `pptx`: `{kind:"hidden-slide", slide, part, source}` for a slide part whose bytes
    declare `show="0"|"false"` on either the slide's own `<p:sld>` root or its `sldIdLst`
    entry (an absent attribute means shown; nothing is guessed) — the slide's text, notes
    and links are still fully extracted elsewhere, never omitted for being hidden;
    `{kind:"speaker-notes", slide, part, text, source}` per `notesSlide` part, mapped to its
    slide through the slide's OWN `.rels` (never the filename convention); an orphan
    `notesSlide` no slide's rels claims still carries its evidence with `slide:null,
    source:null`; `{kind:"core-properties", ...}` as docx.
  - `xlsx`: `{kind:"formula", source, formula, value}` per cell carrying `<f>` — `value` is
    the cell's cached `<v>` (`null` when the file carries none, never invented), held
    BESIDE `formula`, never substituted for it; `{kind:"hidden-rows", sheet, rows, count,
    source:null}` and `{kind:"hidden-cols", sheet, cols:[{min,max}], count, source:null}`
    per sheet that has any; `{kind:"hidden-sheet", sheet, state, source:null}` per sheet
    whose `state` is `"hidden"` or `"veryHidden"` (read from the small `workbook.xml`, so
    this item is emitted even when the sheet's own part is over the size guard);
    `{kind:"core-properties", ...}` as docx.
  - `csv`: always `{kinds:[], items:[], undetermined: [] | [guardMarker], counts:{}}` — the
    format has no relationships, embeds nothing and carries no metadata part, so the zero
    is a fact about the format and `notes` says so.

#### `text()` — the I2 text shape

- **R11** Every entry's `text()` returns `{ok, container, document, undetermined,
  counts, images}` plus a format-specific per-unit list, or `{ok:false, container, reason}`
  when `parts` failed. `images` (docx/pptx/xlsx) is every image under the format's own
  media directory (`word/media/`, `ppt/media/`, `xl/media/`), content-addressed and
  exhaustive, or `null` when it could not be walked; csv's `images` is always `[]` (the
  format has no media directory to have looked in — a zero of the format, not of a walk).
  - `docx`: `document` is `<w:t>` text joined per paragraph, newline-joined across
    paragraphs; `w:delText` (deleted text) is NEVER in it — it lives only in the
    evidentiary `superseded` field; `w:ins` (inserted text) IS in it. `paragraphs` is
    `[{para, ref, text}]`, one per `<w:p>` read, in document order (including inside tables); in each `mc:AlternateContent` (ECMA-376 Part 3) only the first `mc:Choice` is read, or the `mc:Fallback` when there is no `mc:Choice`, nested ones alike, and a branch not selected is not read (no paragraph, run, text, hyperlink, tracked change, bookmark, comment reference or table of it; N26, K747).
    `tables` is `[{table, ref, rows, cols}]` for every `<w:tbl>` in document order
    (nested included), or `null` when the body was not read (never confused with the empty
    list, which means a body with no tables).
  - `pptx`: `document` is slide text only, newline-joined, in deck order — speaker notes
    are NEVER in it. `slides` is `[{slide, ref, part, hidden, shapes, text}]`, one per deck
    entry; a hidden slide's `text` IS populated and its `hidden` is `true` (DEC-5: the
    record holds what the file holds). `speakerNotes` is a DISTINCT list,
    `[{slide, ref:"slide <n> (notes)", part, hidden, text}]`, never merged into `slides`.
    `deckLength` is the number of `<p:sldId>` slots the bytes declare (an unresolvable slot
    still counts), or `null` when the declared order cannot be read — never counted off the
    slide parts present, which would under-report a deck with unreadable trailing slides.
    In each slide's and each notes slide's `mc:AlternateContent` only the first `mc:Choice` is read, or the
    `mc:Fallback` when there is no `mc:Choice`, nested ones alike; a branch not selected is
    not read, so its text is not in `text` or `document` and its shapes take no `shape` index
    (nor do the `hlinks` and `ridUsage` they would carry). Slide numbers and the slide unit do
    not move (N439, K747, K863).
  - `xlsx`: `document` is every sheet's text, tab-joined per row, newline-joined across
    rows and sheets. `sheets` is `[{sheet, name, hidden, rows, cols, usedRows, usedCols,
    range, text, undetermined}]`. `rows`/`cols` are the FIXED format bound
    (1,048,576 / 16,384) — never the used range, so that an address the format cannot hold
    is refused while an empty-but-addressable cell is not. `usedRows`/`usedCols` are the
    furthest CELL (not styled row) this walk actually saw, and `range` is the
    `usedSheetRange` unit derived from them, or `null` for an empty/unmeasured sheet. A
    `t="s"` cell whose shared-string index cannot be resolved is a stated `undetermined`,
    never an invented string.
  - `csv`: `document` equals the one sheet's `text`. `sheets` is one entry,
    `{sheet:0, name:CSV_SHEET_NAME, hidden:false, rows:null, cols:null, usedRows, usedCols,
    range, text, undetermined}` — `rows`/`cols` are `null` (RFC 4180 fixes no maximum, so
    there is no bound to state, unlike xlsx's fixed grid). Row 1 is always row 1: no record
    is consumed, skipped or reinterpreted as a header. An empty field is a measured
    emptiness (no cell, no undetermined entry), distinct from a field the encoding could
    not read. Under an undetermined encoding, the grid still stands (delimiters, quotes and
    line breaks are ASCII); only a field actually holding a byte ≥ 0x80 is `undetermined`,
    named by its own `sheet-cell` reference with a `null` value — never mojibake.

#### The size guard

- **R12** `docxEntry`/`pptxEntry`/`xlsxEntry`: before reading any text part, the DECLARED
  UNCOMPRESSED bytes of the parts that would be inflated for text (docx:
  `word/document.xml` + `word/comments.xml`; pptx: every `ppt/slides/*.xml` +
  `ppt/notesSlides/*.xml`; xlsx: every worksheet part + `xl/sharedStrings.xml`) are summed
  from the ZIP central directory, BEFORE any inflation. Over `MEASURED_OOXML_TEXT_BOUND_BYTES`
  (20 MiB), text extraction is refused: `text()` returns `document:null` and the guard's own
  marker verbatim in `undetermined`, never a silent truncation, and `structure()` skips only
  the parts that needed inflating — the container walk, rels, and any part read directly
  from the small central-directory-adjacent metadata (docx: none extra; pptx:
  `ppt/presentation.xml`, so slide numbering survives; xlsx: `xl/workbook.xml`, so sheet
  names/order/hidden state survive) still run and are reported.
- **R13** `csvEntry`: the guard compares the BODY's own byte length (after any BOM), not a
  declared-uncompressed figure — a CSV has no central directory to sum — against
  `MEASURED_CSV_TEXT_BOUND_BYTES`. Over the bound, `structure()` and `text()` both carry the
  guard marker verbatim in `undetermined`; the dialect (R14) still stands, because it is
  read from the signature window, which is always within the bound.

#### `dialect()` — csv only

- **R14** `csvEntry.dialect(bytes) -> {encoding, encodingConfidence, encodingSignals,
  delimiter, delimiterConfidence, delimiterSignals, undetermined:[...]} | null`. This is the
  SAME computation `structure()`/`text()`'s own `dialect` field uses (one builder), so a
  dialect read at intake and a dialect read from a later full parse of the same bytes
  cannot disagree. `encoding`: a BOM decides it at `"certain"`; absent a BOM, no byte ≥ 0x80
  in the first 1 MiB gives `"us-ascii"` at `"certain"` (not `"utf-8"`: the bytes say
  something every 8-bit superset decodes identically, which is the narrower true claim);
  valid UTF-8 in that window gives `"utf-8"` at `"likely"`; otherwise `encoding:null` with
  `undetermined` including `"encoding_undetermined"`. `delimiter`: exactly one of
  comma/semicolon/tab/pipe occurring a consistent, non-zero number of times outside quotes
  across the first 50 complete lines of the signature window gives that delimiter at
  `"certain"`; two or more equally consistent gives `delimiter:null` with
  `"delimiter_undetermined_tied"`; none consistent gives `"delimiter_undetermined_none_consistent"`;
  fewer than 2 complete lines gives `"delimiter_undetermined_too_few_lines"`. Returns `null`
  when the bytes are empty or their BOM-declared encoding has no runtime decoder.

### Reference builders (reused by `odf-reader`)

Exported so `odf-reader`'s three OpenDocument entries emit references in the IDENTICAL
shape these entries do for the equivalent OOXML container — one builder per arm, never a
second copy that could drift.

- **R15** `docParaRef(para, run=null) -> {kind:"doc-para", ref:"¶<para+1>", para[, run]}`.
  `para` and `run` are 0-based; `run` is included only when given — a reference genuinely
  targeting a run (a hyperlink, a tracked change), never a default.
- **R16** `docTableRef(table, cell=null) -> {kind:"doc-table", ref:"table <table+1>[, <cell>]",
  table[, cell]}`. `table` is the table's 0-based ordinal in document order (nested tables
  included, counted as they open; a table in an `mc:AlternateContent` branch not read, R11, is not counted); `cell` is A1 notation over the table's own grid,
  included only when given.
- **R17** `sheetCellRef(sheet, cell) -> {kind:"sheet-cell", ref:"<sheet>!<cell>", sheet, cell}`.
- **R18** `usedSheetRange(name, usedRows, usedCols) -> {kind:"sheet-range",
  ref:"<name>!A1:<colLetters(usedCols)><usedRows>", sheet:name, range} | null`. `null` when
  `usedRows`/`usedCols` are not both positive integers — nothing was measured, or the
  measured extent is empty; never a range over an unmeasured or empty sheet.
- **R19** `slideShapeRef(slide, shape=null) -> {kind:"slide-shape", ref:"slide <slide>",
  slide[, shape]}`. `slide` is 1-based and equal to the number in `ref`; `shape` is the
  0-based shape-sequence index, included only when the reference genuinely targets a shape.

**Range units (reused by `odf-reader`; N27, K279)**

- **R26** `a1Corner(s) -> {col, row} | null`. One A1 corner, both 1-based: one to three letters (read without case; bijective base 26, `A`=1, `ZZZ`=18278), then a row 1–9,999,999 with no leading zero; either `$` marker allowed and ignored; surrounding whitespace trimmed. `null` for anything else: a non-string, a whole row or column, a range, a sheet-qualified reference, row 0. Never throws.
- **R27** `rangeUnitFor(sheetName, a, b, sheets, grid = null) -> {unit} | {why}`. `a`, `b`: corners as R26 returns them, in any order; `sheets`: the workbook's sheet names; `grid`: the format's bound `{rows, cols}`, or `null` when the format fixes none. `unit` is the `sheet-range` reference (R18's shape and builder) of the rectangle, top-left corner first. The sheet matches exactly, else without case when exactly one sheet answers; the unit carries the workbook's spelling. `why`: `not_a_range_reference` (a corner is not `{col, row}` of positive integers), `no_such_sheet` (no sheet answers, two answer without case, or `sheetName`/`sheets` is not a string/array), `outside_grid` (either corner past `grid` on either axis). Never throws. R9's units are built through it.

- **R28** `docxRenumbering(documentXml) -> {paragraphs:[{old, new, outer}], runs:[{old, new, outer}], tables:[{old, new}]}`: for a stored docx reading made before N26, every `<w:p>`, `<w:r>` and `<w:tbl>` as the pre-N26 walk numbered it (`old`, 0-based, every branch of `mc:AlternateContent` counted), its index under R11 and R16 (`new`), `null` for one inside a branch not read, with `outer` the new index of the paragraph that holds that `mc:AlternateContent`. Used only by extraction's migration of stored ¶ and table references (N26, layer 4); retired once that migration has run (K747).
- **R29** `pptxRenumbering(parts) -> {slides:[{slide, shapes:[{old, new}]}]} | null`: `parts` is `pptxEntry.parts(bytes)`'s own result, read synchronously as R28; `null` unless it is `ok`. For a stored pptx reading made before N439, one entry per slide part the reading walked, in deck order and numbered as the reading numbers slides (a slide whose part could not be read is not listed), every shape as the pre-N439 walk numbered it (`old`, 0-based, every branch of `mc:AlternateContent` counted) and its index under R11's pptx arm (`new`), `null` for a shape inside a branch not read. Used only by extraction's migration of stored `slide-shape` references (layer 4); retired once that migration has run, as R28 (K795 (6), K863).

#### Typed cells and office metadata (T33-10)

- **R30** (C:A-3; K1448) `xlsxEntry.text()` and `csvEntry.text()` give each sheet a `cells` list, `[{source, value, type, declared, cached, formula}]`, one per cell holding a value or a formula, in row then column order. `source` is the cell's `sheet-cell` reference (R17). `value` is the cell's stored lexical value exactly as the file holds it (xlsx `<v>`, an inline string's text, or a resolved shared string; a csv field's decoded text), never re-rendered through a binary float, so `0.1` stays `"0.1"`. `type` is one of `number`, `text`, `boolean`, `date`, `time`, `error` (`time` given by `odf-reader` alone), read only from what the file declares (xlsx `t`: absent or `n` number, `s`, `str` and `inlineStr` text, `b` boolean, `d` date, `e` error); a date implied only by a cell's style is not inferred; every csv field is `text`. `declared` is the format's own type token as written (`null` for csv). For a cell carrying `<f>`, `formula` is its text and `cached` its cached `<v>` (`null` when the file carries none), the same pair R10's `formula` item holds; otherwise both are `null`. Nothing is recalculated (R10's rule: a cached value is the file's statement, never this module's computation). A cell whose shared string cannot be resolved, or a csv field under an undetermined encoding (R11), keeps its entry with `value: null` and stays in `undetermined`. Over the size guard (R12, R13) `cells` is `null`, never `[]`. `cells` is the contract `odf-reader` R46 gives `.ods` sheets, field for field. *(not yet met: T33-10)*
- **R31** (B §(d) EVENTS 3; K1505 (11)) `docxEntry.text()`, `pptxEntry.text()` and `xlsxEntry.text()` also carry `metadata`: `{author, lastModifiedBy, created, modified, source: "docProps/core.xml"}`, the core-properties item's `creator`, `lastModifiedBy`, `created` and `modified` (R10) exactly as the part writes them (W3CDTF strings unchanged), each `null` when absent; `metadata` is `null` when there is no readable core part, and the reason is in `undetermined`. It is what the file states about itself, the one source `content` hands `events` for an edit act's author and dates; this module asserts no act (R24). csv's `metadata` is always `null` (the format carries none). *(not yet met: T33-10)*

Errors: none of R1–R31 ever throws. A precondition this module cannot verify (bytes that
are not this format, a value `recognise`-style helpers were not asked to check) is answered
as a stated `undetermined`/`ok:false`, never an exception and never a guess.

## Private

### Uses

- `subresources`: `linkWrapper` (`.deferred`, `.refused`, `.anchor`, `.intra`) — the one
  path every outbound/internal link record is classified and wrapped through, so the same
  four partitions apply across HTML, PDF and the office formats without re-derivation.
- `ooxml`: the OOXML/ODF container primitives — `hasZipMagic`, `readContainer`, `readPart`,
  `normalizePartName`, `discriminate` (the full magic + parts + declared-content-type
  discrimination), `walkRels`/`parseRels`/`relsPartFor`, `sizeGuard` and
  `declaredTextBytes` with the measured bound `MEASURED_OOXML_TEXT_BOUND_BYTES`,
  `CORE_PROPERTIES_PART`/`readCoreProperties`, and `withContainerImages`. `csv.mjs` uses
  only the measured bound constant, not the container walk (it is not a container).

### Invariants

- **R20** Pure: no store, no network, no clock in any output. The same input bytes always
  give the same answer (a sha256 over embedded/table bytes is a deterministic function of
  those bytes, not an external fact).
- **R21** Never throws (stated above under Errors); every failure this module can name is a
  returned `{ok:false, ...}` or a carried `undetermined` entry.
- **R22** Never invents structure. A reference, a link target, a slide number or a table's
  extent this module cannot establish is a STATED `undetermined` naming the part and why —
  never silently dropped and never guessed. An unreadable `.rels` part states that links MAY
  be missing; it is never read as zero links.
- **R23** Nothing this module marks `hidden` — a PPTX slide, an XLSX sheet, row or column —
  is ever omitted from `text()`'s output for being hidden. Hiding is a fact about the file
  (DEC-5), surfaced as a flag, never a reason to drop content.
- **R24** This module asserts nothing about MEANING (that judgment belongs to `content`/
  `entities`, through I2) and writes nothing to the record.
- **R25** No place is named in this module; it holds no jurisdiction-specific behaviour to
  take from a profile (confirmed by reading all four files: the one match for "Oakland" is
  a corpus filename cited as measurement evidence in a design comment, not a fact the code
  branches on).

### Satisfies

- `BIO_Content_Framework_v0_10.md`, Part I §4 (the FORMAT axis) and the I7 registry entry
  shape and IC-1 element-reference union built from it.
- `docs/development/OFFICE-FORMATS.md`, the ruled sections: "What each part-map offers",
  "What these formats carry" (the DEC-5 evidentiary extras), "The architectural answer"
  (the I7 entry shape), "Bounds and the size guard", and "CSV" (BOB #32's design and its
  measured page, and the unsettled bound stated at DIST-14 above).
- `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6, the extent grammar this module's
  reference builders instantiate for the `doc-para`, `doc-table`, `sheet-cell`,
  `sheet-range` and `slide-shape` kinds.
- Bob's rulings: DEC-5 (2026-08-01 — surface tracked changes, comments, speaker notes,
  hidden state and document metadata as evidence; never redact); BOB #32 (2026-09-24 — the
  CSV entry's design); BOB #33 (2026-09-24 21:55Z, REC-218 — the dialect persisted as
  `reading.dialect`, read through this module's optional `dialect` slot).

### Suggestions

- `docx.mjs`/`pptx.mjs`'s graceful degradation on an unreadable main part (R4) versus
  `formats-xlsx.mjs`'s hard failure on an unreadable workbook part (R5) is a difference a
  caller need not branch on specially: both surface through `parts().ok` and
  `parts().undetermined`, and `structure()`/`text()` read either outcome honestly.
  Whether to make xlsx degrade the same way as docx/pptx (skip the sheet roster, not the
  whole read) is open; nothing today asks for it.
- The evidentiary envelope's items (tracked changes, comments, formulas, speaker notes,
  hidden state, core properties) are extracted but not yet indexed as searchable content —
  a NINTH extent kind, `envelope`, is DESIGNED but NOT BUILT (`OFFICE-FORMATS.md`, D-124's
  2026-07-31 row). That is `content`'s work, through an interface change, not this
  module's: this module's evidentiary envelope is already the shape that kind would read
  from.
- `columnLetters`, `sheetRangeRef`, `csvCellRef`, `walkDocumentBody`, `walkDocumentTables`,
  `parseComments`, `walkSlide`, `encodingSignature`, `delimiterSignature`, `walkRecords`,
  and the `*_CONTENT_TYPE` / `CSV_SHEET_NAME` / `MEASURED_CSV_TEXT_BOUND_BYTES` constants
  are exported and used only within this module's own four files and their own tests
  today — no other module imports them (checked by grep across `bio-plane/src`,
  `docprofile`, `pdf-worker`, `ocr-worker`). They are implementation, not Provides; a job
  promotes one to Provides only once another module actually imports it.
- D-415's target behaviour (R9: defined names and table parts each emitting their own
  `sheet-range` unit, a multi-area name skipped with a stated reason) is written above as
  the ruled requirement. The job that meets it should reuse `usedSheetRange`'s shape for
  the emitted unit rather than hand-building a `sheet-range` object a second way.
- DIST-14's bound question (R11/R13) is not this module's to resolve: the deciding
  measurement needs a deployed plane, which is DIST's act. Until it lands, the bound stays
  `MEASURED_OOXML_TEXT_BOUND_BYTES` reused, and a job on this module should not change the
  figure without a new measurement recorded under `measurements/`.
