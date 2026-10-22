# Draft: split `csv-reader` out of `office-readers` (T51)

For BOB. Rulings applied: K624, K531, K617 (copy, then delete, in one tranche; moved ids retired as "moved to <module> R<n>", never reused), K3268 (the old module keeps delegating; users re-point when next touched). Line counts are `wc -l` (docx.mjs is 1,190 by `wc`; the T51 note's 1,191 is the same file).

## 0. One thing that breaks the plan as stated (decision needed)

`csv.mjs` line 140 imports `sheetCellRef`, `usedSheetRange`, `columnLetters` from `formats-xlsx.mjs`. Mechanics section 12 rule 1 (every import is to the module itself or an EARLIER module in `uses`) forbids `csv-reader`, placed before `office-readers`, importing them, and `office-readers` delegating back to `csv-reader` would close a cycle. Nothing else in `csv.mjs` reaches `office-readers`: `ooxml` gives `MEASURED_OOXML_TEXT_BOUND_BYTES` and `textPlan`, `setup-words` gives `word`/`localize`. No other source file imports `csv.mjs`, and `docx/pptx/formats-xlsx` never import it.

- **Option 1 (this draft; keeps the order and K3268).** `csv-reader` owns the four pure reference builders (`sheetCellRef`, `sheetRangeRef`, `columnLetters`, `usedSheetRange`, `formats-xlsx.mjs` lines 184-225, 42 lines) as its R10/R11 (office-readers R17/R18 retired as moved). `formats-xlsx.mjs` re-exports them from `./csv.mjs`, so `docx.mjs` (`columnLetters`, line 105), `odf.mjs` (`sheetCellRef`, `usedSheetRange`) and the tests that import them change nothing. Cost: a CSV module owns the sheet-reference builders, which is odd to read, and odf-reader's tests keep importing them from `formats-xlsx.mjs`.
- **Option 2.** `csv-reader` goes directly AFTER `office-readers`, `uses: ["ooxml","office-readers","setup-words"]`, builders stay where they are, R17/R18 are not moved. Then `csv.mjs` cannot delegate (upward import), so the users re-point in the same tranche: `formats.mjs:60`, `file-safety/formats.mjs:9`, `budget-doctypes/test/helpers.mjs:10`, `format-registry/test` `dialect.test.mjs:6` and `builtins.test.mjs:12` (five files in three other modules, against K3268). Fewer requirement edits (drop R10/R11 below and the R17/R18 and R27 edits).

Recommendation: Option 1 (it is the plan as ruled, and no other module's file changes). Everything below is Option 1.

## 1. Line counts

| | before | after |
|---|---|---|
| `office-readers` code | docx 1,190 + pptx 1,016 + formats-xlsx 1,140 + csv 816 = **4,162** | docx 1,190 + pptx 1,016 + formats-xlsx ~1,102 (1,140 - 42 + a 4-line import/re-export) + csv.mjs 1 (`export * from "./csv-reader/index.mjs";`) = **~3,309** |
| `office-readers` requirements | 412 | ~395 (R3, R6, R13, R14, R17, R18 become one-liners; csv clauses leave R1, R10, R11, R30-R35, Uses, Satisfies, Suggestions) |
| `csv-reader` code | - | `bio-plane/src/csv-reader/index.mjs` ~862 (816 - 1 import line + 42 builders + ~5 imports/comments) |
| `csv-reader` requirements | - | ~110 |

Both are under the ~4,000 limit with room. (`csv-reader` needs no used-module reads beyond `ooxml`'s `textPlan` and bound.)

## 2. Requirements

### 2a. `build/requirements/csv-reader.md` (new, house format)

```
# csv-reader — requirements

**Status** · In force: split out of `office-readers` in T51 (K624, K531, K617; BOB's, P6); designed by BOB #32 (2026-09-24), moved here unchanged. Behaviour is the module it came from's, id by id; every requirement is met when the tests copied with it pass (it carries the office-readers tests, renamed). DIST-14's csv bound question moved with R6.

## Public

### Purpose

Reads CSV bytes into `format-registry`'s I7 entry contract: detection from the declared content type (never the bytes), the I2 structure shape and the I2 text shape, the dialect (encoding and delimiter, found by signature and recorded), and typed cells. It also builds the `sheet-cell` and `sheet-range` element references (and the A1 column letters) that `office-readers` and `odf-reader` reuse for the same kinds. It holds no record, reads nothing beyond the bytes it is handed, and writes nothing.

### Provides

One registry entry, the shape `format-registry` requires: `format` (a string), `detect(bytes, contentType)`, `parts(bytes)`, `structure(partsOrBytes)`, `text(partsOrBytes)` and `dialect(bytes)`. `structure` and `text` accept either raw bytes or `parts()`'s own output, so a caller that already paid for `parts()` does not pay twice.

- **R1** (office-readers R1, R6 in part) The entry's `format` is `"csv"`.
- **R2** (office-readers R3) `csvEntry.detect(bytes, _)` returns `null` for every `bytes` value, always — a CSV has no magic bytes, and the shape a byte signature would need is a shape prose can wear (measured, not assumed: OFFICE-FORMATS.md "CSV"). `detect(null, contentType)` returns `{format:"csv", confidence:"likely", signals}` when `contentType`, case-folded, is `text/csv` or one of the older synonyms `application/csv` / `text/comma-separated-values`; else `null`.
- **R3** (office-readers R6) `csvEntry.parts`: `{ok:false, why:"empty_body"}` for zero-length bytes; `{ok:false, why:"decoder_unavailable:<encoding>"}` when the bytes declare (by BOM) an encoding the runtime has no `TextDecoder` for. Otherwise `{ok:true, ...}` always, regardless of what the delimiter or encoding signature could determine — an undetermined dialect is carried on the result, never refused.
- **R4** (office-readers structure() intro, R10 csv arm) `structure()` returns `{ok, container:"csv", links, counts:{anchor,intra,deferred,refused,undetermined}, evidentiary, notes[], sheets}`, or `{ok:false, container, reason}` when `parts` failed. `links` is `[]` and every count `0`: the format has no relationships, embeds nothing and carries no metadata part, so the zero is a fact about the format and `notes` says so. `evidentiary` is always `{container:"csv", kinds:[], items:[], undetermined: [] | [guardMarker], counts:{}}`. `active` is `[]`. `dialect` is R7's.
- **R5** (office-readers R11 csv arm) `text()` returns `{ok, container:"csv", document, undetermined, counts, images, sheets}`, or `{ok:false, container, reason}` when `parts` failed. `images` is always `[]` (the format has no media directory to have looked in — a zero of the format, not of a walk). `document` equals the one sheet's `text`. `sheets` is one entry, `{sheet:0, name:CSV_SHEET_NAME, hidden:false, rows:null, cols:null, usedRows, usedCols, range, text, undetermined}` — `rows`/`cols` are `null` (RFC 4180 fixes no maximum, so there is no bound to state, unlike xlsx's fixed grid). Row 1 is always row 1: no record is consumed, skipped or reinterpreted as a header. An empty field is a measured emptiness (no cell, no undetermined entry), distinct from a field the encoding could not read. Under an undetermined encoding, the grid still stands (delimiters, quotes and line breaks are ASCII); only a field actually holding a byte ≥ 0x80 is `undetermined`, named by its own `sheet-cell` reference with a `null` value — never mojibake.
- **R6** (office-readers R13) The size guard compares the BODY's own byte length (after any BOM), not a declared-uncompressed figure — a CSV has no central directory to sum — against `MEASURED_CSV_TEXT_BOUND_BYTES` (the OOXML figure, 20 MiB, until measured on a deployed plane, DIST-14). Over the bound, `structure()` and `text()` both carry the guard marker verbatim in `undetermined`; the dialect (R7) still stands, because it is read from the signature window, which is always within the bound. (R9 reads a body over the bound, up to ooxml's ceiling, in pieces.)
- **R7** (office-readers R14) `csvEntry.dialect(bytes) -> {encoding, encodingConfidence, encodingSignals, delimiter, delimiterConfidence, delimiterSignals, undetermined:[...]} | null`. This is the SAME computation `structure()`/`text()`'s own `dialect` field uses (one builder), so a dialect read at intake and a dialect read from a later full parse of the same bytes cannot disagree. `encoding`: a BOM decides it at `"certain"`; absent a BOM, no byte ≥ 0x80 in the first 1 MiB gives `"us-ascii"` at `"certain"` (not `"utf-8"`: the bytes say something every 8-bit superset decodes identically, which is the narrower true claim); valid UTF-8 in that window gives `"utf-8"` at `"likely"`; otherwise `encoding:null` with `undetermined` including `"encoding_undetermined"`. `delimiter`: exactly one of comma/semicolon/tab/pipe occurring a consistent, non-zero number of times outside quotes across the first 50 complete lines of the signature window gives that delimiter at `"certain"`; two or more equally consistent gives `delimiter:null` with `"delimiter_undetermined_tied"`; none consistent gives `"delimiter_undetermined_none_consistent"`; fewer than 2 complete lines gives `"delimiter_undetermined_too_few_lines"`. Returns `null` when the bytes are empty or their BOM-declared encoding has no runtime decoder.
- **R8** (office-readers R30, R31, R32 csv arms; K1448, K1505 (11), K1888) `csvEntry.text()` gives its sheet a `cells` list, `[{source, value, type, declared, cached, formula}]`, one per field holding a value, in row then column order. `source` is the cell's `sheet-cell` reference (R10). `value` is the field's decoded text, never re-rendered; `type` is `text` for every field (the format declares no type); `declared`, `cached` and `formula` are `null`. A field under an undetermined encoding (R5) keeps its entry with `value: null` and stays in `undetermined`. Over the size guard (R6) `cells` is `null`, never `[]`. `cells` is the contract `odf-reader` R46 gives `.ods` sheets, field for field. `text()`'s `metadata` is always `null` (the format carries none) and `active` is always `[]` (the format can carry none), in `structure()` and `text()` alike.
- **R9** (office-readers R35 csv arm; F7; K4487, K4504, K4489; amends R5, R6, R8) **Large text is read in pieces.** A body over `MEASURED_CSV_TEXT_BOUND_BYTES` up to ooxml's ceiling is read in 1 MiB windows by `text()` and `structure()`. The answer is what a small file's would be, except that no typed `cells` are made (`sheets[].cells` is `null`), at most 10,000 unreadable cells are listed and then `{sheet: 0, cell: null, reason: "more_cells_undetermined", count}`, `text()` carries `piecewise` (ooxml `textPlan`'s) and `structure()` notes `text_read_in_pieces`. Over the ceiling the marker is `textPlan`'s `guard`, `final: true`, with `metric: "body_bytes"`; a UTF-16 body over the 20 MiB bound is stated at that figure with `final: true` and `encoding`, never read in pieces (K4489). Test: `large-text.test.mjs` (30 MB csv, a real body; read in a worker of 128 MB old space).

#### Reference builders (reused by `office-readers` and `odf-reader`)

Moved here so that `office-readers` may use `csv-reader` and not the reverse (the module order). `office-readers` re-exports them from `formats-xlsx.mjs`, so their users are unchanged.

- **R10** (office-readers R17) `sheetCellRef(sheet, cell) -> {kind:"sheet-cell", ref:"<sheet>!<cell>", sheet, cell}`.
- **R11** (office-readers R18) `usedSheetRange(name, usedRows, usedCols) -> {kind:"sheet-range", ref:"<name>!A1:<colLetters(usedCols)><usedRows>", sheet:name, range} | null`. `null` when `usedRows`/`usedCols` are not both positive integers — nothing was measured, or the measured extent is empty; never a range over an unmeasured or empty sheet.

Errors: none of R1–R11 ever throws. A precondition this module cannot verify is answered as a stated `undetermined`/`ok:false`, never an exception and never a guess.

## Private

### Uses

- `ooxml`: `MEASURED_OOXML_TEXT_BOUND_BYTES` (the bound R6 reuses) and `textPlan` (R9's pieces and guard). `csv.mjs` uses nothing else of it: a CSV is not a container.
- `setup-words`: `word`, `localize` (the words rule: a sentence people read is read by key; K3930, K3943, K3949).

### Invariants

- **R12** (office-readers R20) Pure: no store, no network, no clock in any output. The same input bytes always give the same answer.
- **R13** (office-readers R21, R22) Never throws; every failure this module can name is a returned `{ok:false, ...}` or a carried `undetermined` entry. Never invents: a dialect, a character or a cell this module cannot establish is a STATED `undetermined`, never silently dropped and never guessed.
- **R14** (office-readers R24) Asserts nothing about MEANING (that judgment belongs to `content`/`entities`, through I2); a URL in a cell is text, not a link; writes nothing to the record.
- **R15** (office-readers R25) No place is named in this module; it holds no jurisdiction-specific behaviour to take from a profile.

### Satisfies

- `BIO_Content_Framework_v0_10.md`, Part I §4 (the FORMAT axis) and the I7 registry entry shape and IC-1 element-reference union built from it.
- `docs/development/OFFICE-FORMATS.md`, "CSV" (BOB #32's design and its measured page, and the unsettled bound stated at DIST-14).
- `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6, for the `sheet-cell` and `sheet-range` kinds R10 and R11 build.
- Bob's rulings: BOB #32 (2026-09-24, the CSV entry's design); BOB #33 (2026-09-24 21:55Z, REC-218, the dialect persisted as `reading.dialect`, read through this module's `dialect` slot); K624, K531, K617 (this split).

### Suggestions

- `encodingSignature`, `delimiterSignature`, `walkRecords`, `createRecordWalk`, `csvCellRef`, `columnLetters`, `sheetRangeRef`, and the `CSV_CONTENT_TYPE` / `CSV_SHEET_NAME` / `MEASURED_CSV_TEXT_BOUND_BYTES` constants are exported and used only by this module's files and tests (and `columnLetters`/`sheetRangeRef` by `docx.mjs` and `odf.mjs` through the re-export). They are implementation, not Provides; promote one only once another module imports it.
- DIST-14's bound question (R6) is not this module's to resolve: the deciding measurement needs a deployed plane. The bound stays `MEASURED_OOXML_TEXT_BOUND_BYTES` reused; do not change the figure without a new measurement recorded under `measurements/`.
- The builders in R10/R11 sit here only for the module order (see the split draft, section 0). If `office-readers` later moves above or beside `csv-reader`, they should go back (a K3268 move: copy, delegate).
```

### 2b. Exact edits to `build/requirements/office-readers.md`

(Quotes are the current text; "->" is the new text.)

1. **Status**: append "Last changed T51 (csv split: the csv entry, its dialect, typed cells, large-text arm and the sheet-cell/sheet-range builders moved to `csv-reader`; K624, K531, K617, K3268); R11's csv bound note moved with it." Delete "R11's csv bound stays the OOXML figure (20 MiB) until measured on a deployed plane (DIST-14)."
2. **Purpose**: "Reads DOCX, PPTX, XLSX and CSV bytes into" -> "Reads DOCX, PPTX and XLSX bytes into". Add at its end: "CSV is `csv-reader`'s; `csv.mjs` stays here only as a one-line re-export of its entry (K3268)."
3. **Provides** intro: "Four registry entries" -> "Three registry entries"; delete "and — `csv` only — `dialect(bytes)`". Delete "and csv" nowhere else in it.
4. **R1**: "`"docx"`, `"pptx"`, `"xlsx"` or `"csv"`." -> "`"docx"`, `"pptx"` or `"xlsx"` (csv: moved to csv-reader R1)."
5. **R3**: whole text -> "**R3** (retired: moved to csv-reader R2.)"
6. **R6**: whole text -> "**R6** (retired: moved to csv-reader R3.)"
7. **structure() intro**: `container:"docx"|"pptx"|"xlsx"|"csv"` -> `container:"docx"|"pptx"|"xlsx"`; "(`paragraphs` for docx, `slides` for pptx, `sheets` for xlsx and csv)" -> "(`paragraphs` for docx, `slides` for pptx, `sheets` for xlsx)"; add "csv's `structure()` is csv-reader R4."
8. **R10** last bullet (`csv: always {kinds:[]...`): replace with "- `csv`: moved to csv-reader R4." and in R10's opening "across every entry" -> "across the three entries here (csv-reader R4 states csv's)".
9. **R11**: delete "; csv's `images` is always `[]` (the format has no media directory to have looked in — a zero of the format, not of a walk)"; "Every entry's `text()`" -> "Each entry's `text()`" unchanged in meaning; replace the whole `csv` bullet (from "`csv`: `document` equals the one sheet's `text`." to "never mojibake.") with "- `csv`: moved to csv-reader R5."
10. **R13**: whole text -> "**R13** (retired: moved to csv-reader R6.)"
11. **`dialect()` — csv only** heading and **R14**: heading kept as "#### `dialect()` (csv only; moved)" and R14 -> "**R14** (retired: moved to csv-reader R7.)"
12. **Reference builders** intro unchanged. **R17** -> "**R17** (retired: moved to csv-reader R10; `formats-xlsx.mjs` re-exports `sheetCellRef`.)" **R18** -> "**R18** (retired: moved to csv-reader R11; `formats-xlsx.mjs` re-exports `usedSheetRange`.)" **R27**: "(R18's shape and builder)" -> "(csv-reader R11's shape and builder)". R9's "from the one builder" stays.
13. **R30**: "`xlsxEntry.text()` and `csvEntry.text()` give each sheet" -> "`xlsxEntry.text()` gives each sheet"; "(xlsx `<v>`, an inline string's text, or a resolved shared string; a csv field's decoded text)" -> "(xlsx `<v>`, an inline string's text, or a resolved shared string)"; "`type` ... (`time` given by `odf-reader` alone) ... ; every csv field is `text`." -> delete "; every csv field is `text`"; "(`null` for csv)" -> delete; "or a csv field under an undetermined encoding (R11), keeps its entry" -> "keeps its entry"; "Over the size guard (R12, R13)" -> "Over the size guard (R12)"; append "csv's cells: csv-reader R8."
14. **R31**: last sentence "csv's `metadata` is always `null` (the format carries none)." -> "csv's `metadata` is csv-reader R8's."
15. **R32**: "csv's `active` is always `[]` (the format can carry none)." -> "csv's `active` is csv-reader R8's."
16. **R33**: "`null` for a plain file, absent for csv" -> "`null` for a plain file".
17. **R34**: delete ", and csv's `metadata` stays `null`".
18. **R35**: "(csv: the body over `MEASURED_CSV_TEXT_BOUND_BYTES`)" deleted; "csv in 1 MiB windows" deleted; "csv lists at most 10,000 unreadable cells then `{...}`," deleted; "(csv's with `metric: "body_bytes"`; a UTF-16 csv over the 20 MiB bound is stated at that figure with `final: true` and `encoding`, never read in pieces, K4489)" deleted; "amends R11, R12, R13, R30" -> "amends R11, R12, R30"; "(30 MB xlsx, docx, pptx, csv, real packages" -> "(30 MB xlsx, docx, pptx, real packages"; append "csv's arm: csv-reader R9."
19. **Errors**: unchanged ("R1–R34").
20. **Uses** — `ooxml` bullet: delete the sentence "`csv.mjs` uses only the measured bound constant, not the container walk (it is not a container)." Add: "- `csv-reader`: `sheetCellRef`, `usedSheetRange` (its R10, R11), re-exported by `formats-xlsx.mjs`, and `columnLetters`, `sheetRangeRef` (implementation; `docx.mjs` and `odf.mjs` import them through `formats-xlsx.mjs`); `csv.mjs` re-exports its `csvEntry`."
21. **R25**: "confirmed by reading all four files" -> "confirmed by reading all three files".
22. **Satisfies**: in OFFICE-FORMATS.md list delete `, and "CSV" (BOB #32's design and its measured page, and the unsettled bound stated at DIST-14 above)` (keep the rest); in the rulings list delete "BOB #32 (2026-09-24 — the CSV entry's design); BOB #33 (2026-09-24 21:55Z, REC-218 — the dialect persisted as `reading.dialect`, read through this module's optional `dialect` slot);".
23. **Suggestions**: bullet 3 (exports used only within): delete `csvCellRef`, `encodingSignature`, `delimiterSignature`, `walkRecords`, `CSV_SHEET_NAME`, `MEASURED_CSV_TEXT_BOUND_BYTES`, "and the `*_CONTENT_TYPE` / `CSV_SHEET_NAME` / `MEASURED_CSV_TEXT_BOUND_BYTES` constants" -> "and the `*_CONTENT_TYPE` constants"; "its own four files" -> "its own three files"; DIST-14 bullet: "(R11/R13)" -> "(R11; csv's is csv-reader R6)"; last bullet "this module stays near 3,700 lines" -> "this module is about 3,300 lines (csv moved out, T51)".
24. Also touch (next time, K3268): `build/requirements/format-registry.md:70` ("`csvEntry` (`csv.mjs`)" -> "`csvEntry` (`csv-reader`)") and `build/layers.md:7` (add `csv-reader` before `office-readers`); neither is on the critical path.

## 3. `build/modules.json`

New entry, between `ooxml` (line 18) and `office-readers` (line 19); no `from` (it builds by copy, the rule):

```json
{"id": "csv-reader", "layer": 1, "paths": ["bio-plane/src/csv-reader/"], "tests": ["bio-plane/test/m/csv-reader/"], "uses": ["ooxml", "setup-words"]},
```

`office-readers` after its job (CSV-READER merged first): paths unchanged (`csv.mjs` stays as the delegate; K3268), tests unchanged, `uses` gains the new module:

```json
{"id": "office-readers", "layer": 1, "paths": ["bio-plane/src/docx.mjs", "bio-plane/src/pptx.mjs", "bio-plane/src/formats-xlsx.mjs", "bio-plane/src/csv.mjs"], "tests": ["bio-plane/test/m/office-readers/"], "uses": ["subresources", "ooxml", "csv-reader", "setup-words"]},
```

Before the OFFICE-READERS job runs the manifest needs no change to `office-readers`; `odf-reader`, `format-registry`, `budget-doctypes`, `doc-clean`, `file-safety`, `extraction`, `workbooks` keep `uses: office-readers` (their imports of `csv.mjs` go through office-readers' path). Whether `format-registry` (`formats.mjs:60`, `file-safety/formats.mjs:9`) should also list `csv-reader` is for when each next touches it (K3268). Option 2 alternative entry: same `paths`/`tests`, `uses: ["ooxml","office-readers","setup-words"]`, placed after `office-readers`.

## 4. Tests and users

**Tests that move** (all in `bio-plane/test/m/office-readers/`; new home `bio-plane/test/m/csv-reader/`, imports re-pointed to `../../../src/csv-reader/index.mjs`, each test named by its NEW id; `fixtures.mjs` `enc` and `large.mjs` `bigCsv`/`csvField`/`prng`/`randomText`/`MIB` are copied into the new folder, not imported across):

| from | tests (line) | new id |
|---|---|---|
| `detect-parts.test.mjs` | R3 csv x2 (84, 92); R6 csv x3 (183, 190, 204); csv lines in R1 (26, 30) | R2, R3, R1 |
| `text.test.mjs` | R11 csv x4 (148, 166, 175, 190); R13 csv guard (255); R14 dialect x3 (275, 301, 323); csv assertions inside the shared tests at 33 and 55 | R5, R6, R7 |
| `structure.test.mjs` | R10 csv evidentiary (367) | R4 |
| `typed-cells.test.mjs` | R30 csv cells (79); the csv half of 69; csv `metadata` null at 147 and 165 | R8 |
| `active.test.mjs` | the csv half of R32 (168-179); csv lines 249-251 | R8 |
| `builders-invariants.test.mjs` | R17 (35), R18 (41); csv rows in `ENTRIES` (12) and at 72, 94, 187, 205 (R20, R21, R22 for csv) | R10, R11, R12-R14 |
| `large-text.test.mjs` | R35 csv x5 (99, 238, 280, 302, 314); the csv entry of the memory test (130); imports at 10 and 15 | R9 |
| `large-worker.mjs` | the `csv` job | R9 |

The office-readers copies are removed by the OFFICE-READERS job; the shared tests keep their docx/pptx/xlsx arms and keep asserting the builders through `formats-xlsx.mjs`' re-export only where odf-reader needs it. Total moved ~300 of the module's 3,096 test lines. No office-readers test needs a changed expectation for docx/pptx/xlsx.

**Users of `csv.mjs`** (whole repo, excluding generated and archived files):

| file:line | uses |
|---|---|
| `bio-plane/src/formats.mjs:60`, registered at `:261` (`registerFormat(csvEntry)`) | `csvEntry` |
| `bio-plane/src/file-safety/formats.mjs:9`, used at `:110` | `csvEntry` |
| `budget-doctypes/test/helpers.mjs:10`, used at `:52` | `csvEntry` |
| `bio-plane/test/m/format-registry/dialect.test.mjs:6` (call at 50); `builtins.test.mjs:12` (29) | `csvEntry` |
| `bio-plane/test/m/office-readers/` `text`:9, `typed-cells`:8, `structure`:9, `large-text`:10 and :15, `builders-invariants`:9, `detect-parts`:9, `active`:13, `large-worker`:7 | `csvEntry`, `CSV_SHEET_NAME`, `MEASURED_CSV_TEXT_BOUND_BYTES`, `walkRecords`, `createRecordWalk` (all move, above) |

No other source file imports `csv.mjs` (grep of `from ".*csv"` over `*.mjs`). Because `csv.mjs` stays as `export * from "./csv-reader/index.mjs"` (so every named export, `csvEntry` included, passes through) the first four rows need NO change; the format-registry tests assert their own module and are re-pointed only when next touched (K3268). Also affected, not users: generated bundles `bio-plane/dist/bio-plane.bundle.json:1495` (and `.bundled.mjs`), `agent-worker/dist/agent-worker.bundle.json:310`, `release/*.bundled.mjs`, regenerated at the layer close; the words rows keyed `office-readers.csv.*` (`bio-plane/src/setup-words/rows.mjs:23914-23925`, ~12 keys) and `csv.notes.*` (`:15330-15331`), plus `words-unreviewed.json:38381-38437`, re-keyed `csv-reader.csv.*` by the CSV-READER job (the words check reads the key's module from the file's module); `docx.mjs:105` `columnLetters` and `odf.mjs` `sheetCellRef`/`usedSheetRange` keep importing from `formats-xlsx.mjs` and need no change.

## 5. The two job STARTs

**CSV-READER #1** (new module, layer 1, directly after `ooxml`; builds by copy and merges early). Read `build/requirements/csv-reader.md` whole, `bio-plane/src/csv.mjs`, `ooxml`'s `textPlan` and bound, and the tests listed in section 4. Copy `csv.mjs` to `bio-plane/src/csv-reader/index.mjs` and, in the same file, the four builders from `formats-xlsx.mjs` lines 184-225 (`sheetCellRef`, `sheetRangeRef`, `columnLetters`, `usedSheetRange`); drop its `formats-xlsx.mjs` import and import from `ooxml` and `setup-words` only; change no behaviour. Copy the listed tests and helpers into `bio-plane/test/m/csv-reader/`, each test naming its new id (R1-R15), imports re-pointed. Re-key the `office-readers.csv.*` and `csv.notes.*` words to `csv-reader.csv.*` while keeping the old keys resolving until the OFFICE-READERS job. Leave `office-readers`' files and tests untouched (the copy must pass beside them). Done when `node --test bio-plane/test/m/csv-reader/` passes, the architecture check shows only `ooxml` and `setup-words` imported, and the old office-readers tests still pass unchanged.

**OFFICE-READERS** (runs after CSV-READER #1 has merged). Read `build/requirements/office-readers.md` whole with the edits of section 2b, and the three remaining source files. Replace `bio-plane/src/csv.mjs` with the single line `export * from "./csv-reader/index.mjs";`; in `formats-xlsx.mjs` delete the four builders (lines 184-225) and `import`/re-export them from `./csv.mjs` (`export { sheetCellRef, sheetRangeRef, columnLetters, usedSheetRange } from "./csv.mjs";` plus the local import), so `docx.mjs`, `odf.mjs` and the others are unchanged. Apply section 2b to the requirements (R3, R6, R13, R14, R17, R18 retired as "moved to csv-reader R<n>", the other ids amended; no id reused). Delete the moved tests and csv arms of the shared tests (section 4) and the now-unused `bigCsv`/`csvField` helpers; keep every docx/pptx/xlsx assertion as it is. Update `uses` in `build/modules.json` (section 3). Done when `node --test bio-plane/test/m/office-readers/ bio-plane/test/m/odf-reader/ bio-plane/test/m/format-registry/` passes, `wc -l` of the module's four files is near 3,300, and `git grep 'from ".*csv.mjs"'` shows only the importers in section 4 (none of them edited). Users of `csv.mjs` re-point to `csv-reader` only when their own entry next touches them (K3268).
