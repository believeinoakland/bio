# odf-reader — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6). Layer 1. Code today: `bio-plane/src/odf.mjs`.
R29 is not yet met: row D-346 (`.odt`/`.ods`/`.odp` structure() still emits the unconditional
`meta.xml`/manifest "not read" markers of R28, never the `core-properties` item or the `intra`
links R29 rules). R36 is not yet met: row D-612 (`odfEvidentiaryDigest`'s reference scan still
refuses on a `font-face-uri` href, so a real Google Docs `.odt` export with embedded fonts and no
image reads `determined:false`, never the `determined:true` R36 rules). Both rows are already
coded on the unlanded `batch30` tree (PROCESS-MECHANICS §12.5): D-612 at tip `f2dcbc6c`, D-346 at
tip `96eeb2d5` (stacked on it) — the job should read and keep what meets R29/R36 rather than
re-deriving it. No local fact (a place, a system, a vocabulary) was found in this module; no
plan entry was needed for that.

## Public

### Purpose

Reads an OpenDocument package — `.odt`, `.ods`, `.odp` — over ONE shared container walk
(`mimetype` names the kind; `content.xml` carries the whole document) and projects it into the
same I2/DEC-5 shape the OOXML entry of the matching kind produces (`docx`→`.odt`,
`formats-xlsx`→`.ods`, `pptx`→`.odp`), so `format-registry` can treat an OpenDocument export
exactly like its Office sibling. It also computes the D-351 evidentiary digest of an
OpenDocument package's substance, for a capture (a Google Drive export) whose ZIP envelope is
not stable across fetches even when its substance is. It holds no record, writes nothing, and
makes no network call.

### Provides

**`odtEntry`, `odsEntry`, `odpEntry` → `{format, detect(bytes, contentType), parts(bytes) →
Promise<Parts>, structure(partsOrBytes) → Promise<Structure>, text(partsOrBytes) →
Promise<Text>}`** — the I7 FormatEntry shape `format-registry` registers with `registerFormat`
and calls at both the detect→structure seam and directly (`entry.parts(bytes)`). `format` is
`"odt"`, `"ods"` or `"odp"`.

- **R1** `detect(bytes, null)`: with the ZIP magic, a readable central directory, a first-and-
  STORED `mimetype` member whose CRC-32-verified value is EXACTLY the entry's media type
  (never trimmed), and the flavour's conventional main part present, returns `{format,
  confidence:"certain", signals}`. Any of those failing, or no ZIP magic, or no central
  directory, returns `null`. "likely" is never returned from bytes.
- **R2** `detect(null, contentType)`: returns `{format, confidence:"likely", signals}` when
  `contentType` equals the entry's media type exactly, else `null`.
- **R3** `parts(bytes) → Promise<Parts>`: runs the shared discrimination and the container
  read. Fails as `{ok:false, container:<flavour>, why, signals, part?, flavourDeclared?}`:
  `why` is the discriminator's reason, or `not_<flavour>:<found>` for a package of a different
  declared flavour; `part` is the content part's name when the package's own mimetype names
  this flavour but its main part is missing, else `null`; `flavourDeclared` is the flavour the
  mimetype named when the container declared one. Succeeds as `{ok:true, format, container,
  contentXml, declared, guard, undetermined}`: `contentXml` is `null` under the guard or an
  unreadable part (name pushed to `undetermined` with why); `declared` is `content.xml`'s
  declared-uncompressed byte total (COFF-6's metric, summed from the central directory before
  inflation); `guard` is the size-guard marker or `null` under the bound; `undetermined`
  already carries the two markers of R28 on every successful read.
- **R4** `detect` and `parts` never throw, on any bytes.
- **R5** When `parts` (or bytes passed to `structure()`/`text()` that fail discrimination
  through it) has `ok:false`, `structure()` and `text()` both return `{ok:false,
  container:<flavour>, reason: parts.why, part: parts.part ?? null}` — for every one of the
  three entries, without reading `content.xml`.

**`.odt` — `odtEntry.structure` → `{ok:true, container:"odt", paragraphs, links, counts,
evidentiary, notes}`**
- **R6** `paragraphs` is the count of `<text:p>`/`<text:h>` elements in `<office:text>` body
  order (tables included, headings counted as paragraphs), or `null` when the body could not
  be read (R9).
- **R7** `links` carries every `<text:a xlink:href>` in the body, located to its `doc-para`
  reference (`docParaRef`, from `office-readers`), classified `anchor`/`deferred`/`refused`
  exactly as `linkWrapper` classifies an OOXML hyperlink (a bare `#fragment` is `anchor`; an
  absolute or scheme-less URL is `deferred`; anything else is `refused`); `counts` sums the
  four partitions (`anchor`, `intra`, `deferred`, `refused`).
- **R8** `evidentiary.items` carries, from `<text:tracked-changes>`, one `tracked-change` item
  per changed region: `change` (`"insertion"`/`"deletion"`), `author`, `date` (each `null` when
  the file does not state it), `source` (the `doc-para` the body's mark locates it to, or
  `null` with `why:"change_region_unmarked_in_body"` when the body carries no mark for it),
  and — for a deletion — `superseded` (the deleted paragraphs' text, verbatim), or — for an
  insertion — `text` (read from the body between its `change-start`/`change-end` marks, or
  `null` when unmarked). A deleted region's own paragraphs never appear in `paragraphs`,
  `document`, `tables` or their numbering.
- **R9** `evidentiary.items` carries one `comment` item per `<office:annotation>`, inline in
  the paragraph it annotates: `id`, `author`, `date`, `initials` (each `null` when the file
  omits it), `text`, `source` (the `doc-para`). An annotation's own text is excluded from its
  host paragraph's `paragraphs`/`document`/`evidentiary` text.
- **R10** Over the guard, or with no readable `<office:text>` body, `paragraphs` is `null`,
  `links` is `[]`, `evidentiary.items` is `[]`, and `notes` names which (the guard, or an
  unreadable/absent body).

**`.odt` — `odtEntry.text` → `{ok:true, container:"odt", document, paragraphs, tables,
undetermined, counts:{chars, undetermined}}`; `images` is added (R30).**
- **R11** `paragraphs` is `[{para, ref:"¶"+(para+1), text}]` for every body paragraph in
  document order (0-based `para`); `document` is the non-empty paragraphs' text, newline-joined.
- **R12** `tables` is `[{table, ref, rows, cols}]`, one per `<table:table>` in the body
  (nesting included, numbered in the order each opens, addressed by `docTableRef` from
  `office-readers`), with `table:number-rows-repeated`/`number-columns-repeated` runs
  accumulated into `rows`/`cols`; a figure never established is `null`, never `0`. A deleted
  table (inside `<text:tracked-changes>`) is never counted, and counting stops there so no
  table after it is renumbered. `tables` is `null`, never `[]`, when the body was not read.
- **R13** Over the guard, `document` and `tables` are `null`, `paragraphs` is `[]`, and
  `undetermined` carries the guard marker verbatim (`{text:"undetermined",
  why:"over_size_bound", size, bound, boundName, metric}`). With no readable body and no guard,
  the same shape reports `undetermined:[{reason:"main_part_unreadable", part:"content.xml",
  why}]`.

**`.ods` — `odsEntry.structure` → `{ok:true, container:"ods", sheets, links, counts,
evidentiary, notes}`**
- **R14** `sheets` is `[{sheet, name, sheetId:null, state:"visible"|"hidden",
  hidden:false|"hidden"}]`, one per `<table:table>`, in document order. `sheetId` is always
  `null` — ODF names a table, never numbers it. A sheet is hidden when its own element's
  `table:display` says so, else when its style's `table:display` (in
  `<office:automatic-styles>`) says so, the element winning when both are given; absence means
  shown.
- **R15** `evidentiary.items` carries one `formula` item per cell carrying `table:formula`:
  `source` (the `sheet-cell` reference, `sheetCellRef` from `office-readers`), `formula`
  (verbatim, its OpenFormula `of:` prefix kept), `value` (the cell's displayed text, or, when
  there is none, its raw value attribute). The formula is never collapsed into, or substituted
  for, the cell's displayed text.
- **R16** `evidentiary.items` carries one `hidden-rows` and one `hidden-cols` item per sheet
  that has any (row/column numbers from `table:visibility="collapse"|"filter"`, repeats
  expanded), and one `hidden-sheet` item per hidden sheet.
- **R17** `links` carries every `<text:a>`/`<draw:a>` href found inside a cell, located to that
  cell's `sheet-cell` reference; a repeated cell's links are attached at each of its addresses.

**`.ods` — `odsEntry.text` → `{ok:true, container:"ods", document, sheets, undetermined,
counts:{chars, cells, formulas, undetermined}}`; `images` is added (R30).**
- **R18** `sheets` is `[{sheet, name, hidden, rows:null, cols:null, usedRows, usedCols, range,
  text, undetermined:[]}]`. `rows`/`cols` (the sheet's capacity) are always `null` —
  OpenDocument fixes no maximum table size, and this is never inferred from XLSX's grid or from
  the used range. `usedRows`/`usedCols` are the furthest 1-based row/column carrying a cell
  (accumulated over the cells, so a padding run of empty repeats never counts); `range` is
  `usedSheetRange(name, usedRows, usedCols)` (from `office-readers`), or `null` when nothing
  was used.
- **R19** A sheet's `text` is its non-empty rows, each row's cells tab-joined by their
  displayed value (never their formula), rows newline-joined; a hidden sheet's text IS
  extracted, flagged only by `hidden`. `document` is the non-empty sheets' text, newline-
  joined. `cells` counts every cell with a non-empty value; `formulas` counts every cell
  carrying a formula; both are summed across all sheets.
- **R20** Over the guard, `document` is `null`, `sheets` is `[]`, and `undetermined` carries the
  guard marker verbatim. With no readable `<office:spreadsheet>` body and no guard, the same
  shape reports one `undetermined` marker naming the reason, with `sheet` and `cell` both
  `null`.

**`.odp` — `odpEntry.structure` → `{ok:true, container:"odp", slides, links, counts,
evidentiary, notes}`**
- **R21** `slides` is the count of `<draw:page>` elements in the body, or `null` when the body
  was not read.
- **R22** `evidentiary.items` carries one `speaker-notes` item per page whose
  `<presentation:notes>` holds non-empty text (`slide`, `part:"content.xml"`, `text`,
  `source`), and one `hidden-slide` item per page whose own, or its drawing-page style's,
  `presentation:visibility="hidden"` says so (element wins over style; absence means shown).
  Speaker-notes text is never merged into a slide's own text, and never into `links`.
- **R23** `links` carries every `<text:a>`/`<draw:a>` href inside a page's own shapes
  (excluding its notes), located to `slideShapeRef(slide, shape)` (from `office-readers`):
  `slide` is 1-based, `shape` is 0-based and numbers every shape-tag open in document order
  (nesting included), so a shape's reference and the count that bounds it come from one walk.

**`.odp` — `odpEntry.text` → `{ok:true, container:"odp", document, slides, speakerNotes,
deckLength, undetermined, counts:{chars, notesChars, undetermined}}`; `images` is added (R30).**
- **R24** `slides` is `[{slide, ref:"slide "+slide, part:"content.xml", hidden, shapes, text}]`,
  one per `<draw:page>` in the order the bytes declare it (OpenDocument's page order IS
  presentation order, needing no separate slide-order index the way PPTX does). `shapes` is
  the same shape count R23 numbers against. `text` is the page's own shapes' text, joined; a
  group shape's text is its child shapes' own (never double-counted at the group level).
- **R25** `speakerNotes` is `[{slide, ref:"slide "+slide+" (notes)", part:"content.xml", hidden,
  text}]`, only for pages with non-empty notes text. `document` (the deck as presented) never
  includes notes text; a hidden slide's text IS in `document`, flagged by `hidden`. `notesChars`
  counts speaker-notes text apart from `chars`.
- **R26** `deckLength` is the number of pages once the body is read (equal to `slides.length`,
  emitted as its own key so a caller reads one field regardless of which entry answered), and
  `null` on both branches that did not read the body.
- **R27** Over the guard, or with no readable `<office:presentation>` body, `document` is
  `null`, `slides` and `speakerNotes` are `[]`, `deckLength` is `null`, and `undetermined`
  carries the guard marker verbatim, or (with no guard) a single `{reason:"main_part_unreadable",
  part:"content.xml", why}` marker — the same shape R13 states for `.odt`.

**Shared envelope facts, across all three `structure()`s and `text()`s:**
- **R28** Every successful `structure()` call states, in `evidentiary.undetermined`, that
  `meta.xml`'s core properties (creator, title, created/modified, revision) were not read and
  that `META-INF/manifest.xml`'s embedded-object members were not content-addressed into an
  `intra` link — each `{part, why:"outside_content_xml_not_read", detail}` — unconditionally,
  because this module reads `content.xml` only. `notes` always adds the sentence that no
  `intra` link is emitted because embedded members live outside `content.xml`.
- **R29** *(not yet met: D-346)* narrows R28: when `meta.xml` is present,
  `structure()` reads it and emits one `core-properties` item (creator, title, created/
  modified, revision — each `null` when the file omits it) instead of the `meta.xml` marker; a
  package without `meta.xml` still states the absence. When the manifest is present,
  `structure()` walks it and content-addresses each embedded member it lists into a `sha256`-
  keyed `intra` link instead of the manifest marker; a package with no manifest, or none of
  whose listed members embed anything, still states why `intra` is empty.
- **R30** `text()`'s output always carries `images`: the package's `Pictures/` directory,
  content-addressed exhaustively (`images`), or `images:null` with `imagesWhy` when it could
  not be — read off the central directory alone, so this is independent of the manifest and
  R28's manifest marker stays true and stays stated regardless of R30's outcome.
- **R31** `ODT_CONTENT_TYPE`, `ODS_CONTENT_TYPE`, `ODP_CONTENT_TYPE` are the three exact
  OpenDocument media types, read off the same `partMap:"odf"` rows `detect`/`parts` use, never
  a separate literal. `ODF_FORMATS` is `["odt","ods","odp"]`, the three flavour strings, read
  off the same rows and frozen.

**`odfEvidentiaryDigest(bytes, sha256Hex) → Promise<{determined:true, flavour, over:"content.xml",
evidentiary, basis} | {determined:false, flavour, evidentiary:null, basis}>`**
- **R32** Detects with R1's CERTAIN branch only (a content-type-only "likely" match never
  qualifies); with no flavour detected certainly, returns `{determined:false, flavour:null,
  basis}` naming why.
- **R33** A flavour with no entry in the measured-stable table — today `.odp` only, since no
  census target has been measured for it, while `.odt` and `.ods` are both measured — returns
  `{determined:false, flavour, basis}` naming that, without reading the container further.
- **R34** Refuses (`determined:false`, `flavour` set, `basis` naming the specific reason) when
  the central directory cannot be read, when `content.xml`'s declared uncompressed size is
  over COFF-6's bound (not inflated), or when `content.xml` cannot be read whole (length and
  CRC-32 verified against the central directory).
- **R35** Refuses (`determined:false`) when `content.xml` references, by any `href`-bearing
  attribute in any namespace, a package member whose bytes are not `content.xml` (naming up to
  3 of them, with the total count) — a digest of `content.xml` alone cannot speak for a member
  it does not hold, so none is claimed.
- **R36** *(not yet met: D-612)* narrows R35: an `href` on an element whose local
  name is `font-face-uri` does not count as a referenced member. A `Pictures/`- or
  `Object N/`-referencing `href` still refuses under R35 unchanged.
- **R37** The digested bytes are, for `.odt`, `content.xml` with every `<text:list
  xml:id="...">` relabelled `L1`, `L2`, … in document order and every `text:continue-list`
  naming a relabelled id rewritten to match (`odtNormalisedContentXml`, exported so a
  measurement instrument digests exactly what this digests); for `.ods`, `content.xml`
  unchanged. Refuses (`determined:false`) when `content.xml` is not valid UTF-8 (never decoded
  lossily). `evidentiary` is `sha256Hex` of the (possibly normalised) bytes; `basis` names the
  part, the normalisation applied or that none was, `ODF_EVIDENTIARY_VERSION`, the discounted
  members (ZIP envelope, `meta.xml`, `settings.xml`, `styles.xml`, thumbnails) and the
  measurement the claim rests on.
- **R38** Every service above never throws on malformed, truncated or hostile bytes; every
  failure — `detect`, `parts`, `structure`, `text`, `odfEvidentiaryDigest` alike — is a stated
  result naming why, never an exception the caller must catch.

## Private

### Uses

- `ooxml`: `hasZipMagic`, `readContainer`, `readPart`, `normalizePartName`, `crc32`,
  `discriminate`, `sizeGuard` (and its `MEASURED_OOXML_TEXT_BOUND_BYTES` default),
  `declaredTextBytes`, `CONTAINER_FLAVOURS` (filtered to `partMap:"odf"` rows),
  `ODF_MIMETYPE_PART`, `ODF_MANIFEST_PART`, `ODF_MIMETYPE_MAX_BYTES`, `withContainerImages`.
- `subresources`: `linkWrapper`, for the `anchor`/`deferred`/`refused` link partition.
- `office-readers`: `docParaRef`, `docTableRef` (`docx.mjs`); `sheetCellRef`, `usedSheetRange`
  (`formats-xlsx.mjs`); `slideShapeRef` (`pptx.mjs`) — the one reference builder per IC-1 arm,
  never re-derived here.

### Invariants

- **R39** Pure: no store, no network, no clock. The same bytes always give the same answer.
- **R40** No place, system, form or vocabulary is named in this module; it carries no
  jurisdiction-specific fact of any kind.
- **R41** Every "not read" is stated with which part and why; absence is never emitted as a
  zero, an empty list or a silent omission a caller could read as "none present" (R9's
  `null` guard branches, R28's markers, R33–R35's named refusals).
- **R42** A `.ods` cell's capacity (`rows`/`cols` in R18) is always `null`: OpenDocument fixes
  no maximum table size, so this module never borrows XLSX's grid and never infers a bound
  from the used range.
- **R43** This module owns no entry in `bio-plane/checks/bio-checks.mjs` (grepped: no function
  or refusal code in that file names `odf.mjs` or belongs to it). The IC-1 reference builders
  it calls are owned by `office-readers`; the C-45.x checks that validate a citation against
  them are owned by `content`.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §16, "How content is extracted today" — the shared
  container-reader/entry pattern and, by DEC-5 (quoted there: "Bob ruled these public
  documents' revision history IS evidence"), the evidentiary envelope: formulas beside cached
  values, tracked changes with author and date, comments, speaker notes, hidden rows, columns,
  sheets and slides, and the file's core properties. §16 itself records that ODF was
  "deliberately not built" until CAP-8/COFF-10's 2026-09-14 ruling made a Google Drive export
  ODF's harvest format (this module's own header comment carries that ruling in full).
- `BIO_Content_Framework_v0_10.md` §5, "A document's anatomy: regions and digests" — the
  evidentiary digest (`odfEvidentiaryDigest`) sits BESIDE the capture identity digest, never
  replacing it.
- `docs/development/OFFICE-FORMATS.md`, "What each part-map offers, and where it maps onto I2"
  and "Bounds and the size guard" — the shared part-map table and the COFF-6 text-bound metric
  this module reads through `ooxml`, never restates.
- `docs/development/DOCUMENT-PROFILES.md`, "Three digests, not one" and "The failure asymmetry,
  which governs every default" — why `odfEvidentiaryDigest` exists and why it refuses on a
  member reference it cannot speak for (R35).
- `build/layers.md`, "No jurisdiction in the product".

### Suggestions

- The caller of `structure()`/`text()`/`odfEvidentiaryDigest` should pass only bytes it has
  itself fetched and can already trust the identity of; this module verifies the ZIP structure
  and the parts it reads, never a claimed capture identity — `odfEvidentiaryDigest`'s own
  caller (`index.mjs`'s `substanceDigests`, D-351) still re-hashes the container bytes against
  the capture's own `sha` before trusting `determined:true`, and that check belongs to the
  caller, not here.
- R29 and R36 (D-346, D-612) are already coded on the unlanded `snapshot/pre-refactor-2026-09-25`
  tree at tips `96eeb2d5` and `f2dcbc6c`; read that code first and keep what meets the
  requirement rather than re-deriving it (PROCESS-MECHANICS §12.5).
- `ODT_ROW`/`ODS_ROW`/`ODP_ROW` and `odfRow()` are exported but have no caller outside this
  file today (grepped); they are implementation surface, not a requirement, and may be
  un-exported without notice to any user.
