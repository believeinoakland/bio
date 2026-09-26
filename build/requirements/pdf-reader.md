# pdf-reader — requirements

**Status** · DRAFT by BOB #37, 2026-09-25 (T6); N9's named services (R18, R19 restated; R30–R32 new) added by BOB #40, 2026-09-26 (K28). Layer 1. Code today: `bio-plane/src/pdfstructure.mjs`.
R25 is not yet met: row D-591. R26 is not yet met: row D-627; its figures are M-178's (K30). D-616, also carried against this
module in the old plan's index, does NOT belong here: its fix (`tier3Extend`/`needsTier3` seeding a
re-read from the already-transcribed page tail) lives in `bio-plane/src/index.mjs`, reads and writes
the stored reading, and cannot be met by a module whose layer-1 contract is "no access to the record"
(`layers.md`) — see Suggestions.

## Public

### Purpose

Reads assembled PDF bytes — no fetch, no store, no font engine — and answers three things from them:
the document's outbound-link graph, in the same four partitions `subresources.mjs` uses for HTML, so
structure is container-agnostic; its Tier-1 text, page by page, decoded through each font's own
`/ToUnicode` map; and every image each page paints, with its rectangle. Every place it cannot resolve,
decode or classify something is named as `undetermined`, never guessed. It also exports the lenient
object/stream reader (`PdfDoc`) other Layer 1 PDF code is built on, so there is exactly one PDF parser
in the codebase.

### Provides

**extractPdfStructure(bytes) → Promise\<object\>**
- **R1** `bytes` not a `Uint8Array` → `{ ok:false, container:"pdf", reason:"NOT_BYTES" }`. No `%PDF-`
  signature in the first 1024 bytes → `{ ok:false, container:"pdf", reason:"NOT_A_PDF" }`.
- **R2** Otherwise returns `{ ok:true, container:"pdf", version, pages, links, counts, text, images,
  imagesWhy?, notes }`: `version` is the `%PDF-` header's version string; `pages` is the page count;
  `links` is the array R3-R6 describe; `counts` is R7; `text` is R11-R15's shape; `images`/`imagesWhy`
  is R16's shape, carried at the top level (not inside `text`); `notes` is a array of internal
  recovery notes (`objstm_undecodable`, `page_order_by_object_number_fallback`, `encrypted`,
  `form_stream_undecodable`, `text_extraction_error`, `content_stream_undecodable`,
  `flate_trailing_bytes:<n>`), present whenever
  the parser had to recover from something, informational only.
- Errors: never throws, on any byte sequence.

**Link partitions** (part of `links`, each `{ partition, wrapper, target, source }`; `source` is
`{ page, rect }` with `rect` the annotation's `/Rect` as `[x0,y0,x1,y1]` or `null` when absent/malformed;
`partition` is one of `anchor`, `intra`, `deferred`, `refused`, `undetermined`):
- **R3** An `/Annots /Subtype /Link` with `/A /S /URI` and a resolvable `/URI` string: `http`/`https`
  scheme, or no scheme at all (a bare relative reference), → `deferred`, `wrapper` = `subresources.mjs`'s
  `linkWrapper.deferred(uri)`, `target:{url:uri}`. Any other scheme (`mailto`, `javascript`, `tel`, `file`,
  …) → `refused`, `wrapper` = `linkWrapper.refused(uri)`. A URI action with no `/URI` string →
  `undetermined`, `target.why:"uri_action_without_uri"`.
- **R4** An `/A /S /GoTo` action, or a bare `/Dest` on the annotation: the destination is resolved (a
  name or string first looked up in `/Root /Dests` or `/Root /Names /Dests`, then an explicit array
  whose first element is a page reference or, for a remote/embedded go-to, a 0-based page integer) to a
  0-based target page. Resolved → `anchor`, `wrapper = linkWrapper.anchor("#page=" + (page+1))`,
  `target:{page, fragment, dest}` (`dest` is the destination's own name/string, or `null` for an
  explicit array). Not resolved → `undetermined`, `target.why` one of `dest_absent`,
  `named_dest_unresolved`, `dest_page_not_in_tree`, `dest_page_out_of_range`, `dest_first_not_page`,
  `dest_shape_unknown` (naming which step failed); `named_dest_unresolved` also carries `target.dest`,
  the unresolved name.
- **R5** A `FileAttachment` annotation, and every entry of `/Root /Names /EmbeddedFiles`: resolved to
  decodable stream bytes → `intra`, `wrapper = linkWrapper.intra(sha256Hex(bytes))`,
  `target:{sha256, name, bytes:byteLength}`. `name` is the annotation's own `/Contents` string, or the
  tree's key, or `null` — a filing label, not the address. Not resolved → `undetermined`, `target.why`
  one of `embedded_filespec_unresolved`, `embedded_stream_absent`, `embedded_stream_undecodable`, each
  carrying `target.name` when known. An annotation-sourced record's `source` is `{page, rect}`; a
  document-level (`/Names /EmbeddedFiles`) record's `source` is `null` — there is no element reference
  for it, stated rather than invented.
- **R6** A `GoToR` or `Launch` action, or a `Link` annotation with neither a recognised action nor a
  `/Dest` → `undetermined`, `target.why` = `` `unsupported_action_<S>` `` (the action's `/S` name) or
  `link_without_action_or_dest` when there is no `/S` at all.
- **R7** `counts` always carries all five keys — `anchor`, `intra`, `deferred`, `refused`,
  `undetermined` — each the number of `links` entries of that partition (0 when none).
- **R8** Object parsing is lenient by construction, never by an xref: every top-level `` `N G obj` ``
  is scanned (a later definition of one object number wins, matching incremental-update semantics);
  every `/ObjStm`'s contained objects are folded in without overwriting an object number already
  defined at top level; the page tree is walked from `/Root /Pages /Kids`, and when that yields no
  pages, every object with `/Type /Page` is used instead, ordered by object number, noting
  `page_order_by_object_number_fallback`.
- Errors: never throws.

**Tier 1 text** (`text`, part of R2's shape): `{ document, pages:[{page, text, undetermined}],
undetermined, counts:{chars, undetermined}, producer }`. `document` is every page's `text` joined by
`"\n"`, non-empty pages only. Each page's `undetermined` and the top `undetermined` are the same
markers, `{page, reason, font, codes, count}` — `codes` a hex dump of the unresolved bytes (capped at
64 bytes, `…` beyond); `count` the number of characters/codes the marker covers.
- **R9** Encrypted document (a `/Filter /Standard` dict with a numeric `/R` anywhere in the file, its
  own dict never itself encrypted): `text` is `{document:"", pages:[], undetermined:[{page:null,
  reason:"encrypted", font:null, codes:"", count:0}], counts:{chars:0, undetermined:1}, producer}`, with
  `producer.determination:"undetermined"`, `producer.why:"encrypted"`. No page is walked; one
  document-level marker replaces per-page ones.
- **R10** `producer` (D-251): `{producer, creator, determination:"ocr"|"undetermined", ocr:{engine,
  field, marker}|null, why}`, read ONCE from the trailer's `/Info` — either a classic `` `trailer <<
  … /Info N 0 R >>` `` or, when there is no `trailer` keyword, an `/Type /XRef` stream's own `/Info` —
  taking the LAST candidate in file order (incremental-update semantics) and falling back to an earlier
  one when the chosen reference is dangling. `/Producer` is checked first, then `/Creator`, each against
  a fixed table of OCR-product name patterns (case-insensitive, word-anchored: ABBYY/FineReader,
  Tesseract, OmniPage, Readiris, ocrmypdf, Acrobat Capture, and the bare word "ocr"). A match →
  `determination:"ocr"`, `ocr:{engine:<the matched field's string>, field:"producer"|"creator",
  marker:<the row's own name>}`, `why:null`. No match, an empty `/Info`, a `/Producer`/`/Creator` that
  is not a string, or an unreadable `/Info` (encrypted, or a read that throws) → `determination:
  "undetermined"`, `ocr:null`, `why` one of `"no_ocr_marker_in_producer_metadata"` (a value was present
  and matched nothing), `"no_producer_metadata"` (neither field held a usable string), `"encrypted"`,
  `"info_unreadable"`. **`determination` is never `"ocr"` without a named product, and is never
  `"authored"`** — an absent or unmatched marker is an absent marker, not evidence of authorship.
- **R11** For an unencrypted document, each page's text-showing operators (`Tj`, `TJ`, `'`, `"`) are
  read from its content stream(s) (concatenated, Flate-decoded per R8's decoder) and every Form
  XObject a `Do` paints, to a nesting depth of 8 and never re-entering a form already on the walk's own
  chain (deeper or cyclic nesting: its shown-text byte count is added to an `undetermined` marker
  `form_text_unread`, page text unaffected; an undecodable form stream adds `form_stream_undecodable`
  with `count:0`). A Form XObject's own `/Resources` and `/Matrix`-composed CTM apply while it is
  painted; the page's text-state graphics parameters are restored when it returns.
- **R12** A shown byte run is decoded through the selected font's `/ToUnicode` CMap (`beginbfchar` and
  `beginbfrange`, both the incrementing and the explicit-array target forms), by the code width the
  CMap's `begincodespacerange` states (default: 2 bytes for a Type0/composite font, 1 otherwise). A run
  shown with no font selected → `undetermined`, `reason` `"no_current_font"` (no `Tf` yet) or
  `"font_not_in_resources"` (the selected name is not in `/Resources /Font`). A run shown by a font
  with no usable `/ToUnicode` → `undetermined`, `reason` `"cid_font_no_tounicode"` (a Type0/CID font)
  or `"no_tounicode"` (a simple font); no character is guessed. A code the CMap does not cover →
  `undetermined`, `reason:"unmapped_code"`, one marker per code. A trailing byte run shorter than the
  font's code width → `undetermined`, `reason:"code_width_misaligned"`. Every marker's `font` names the
  font's `/BaseFont` (or the resource name, or `null`) and `codes` is the undecoded bytes in hex.
- **R13** A line break is emitted only on a change to the text LINE matrix's DEVICE-space baseline
  (`T*`, `'`, `"`, or a `Td`/`TD`/`Tm` that lands away from the line already open — never on every
  positioning operator). A positioning operator that lands ON the open baseline is judged against the
  pen's own tracked position: the pen advances by each shown character's width (a simple font's
  `/Widths`+`/FirstChar`+`/FontDescriptor /MissingWidth`, or a Type0 font's descendant CIDFont
  `/W`+`/DW`, in text space; a Type3 font's own `/FontMatrix` scale; `/Identity-H`/`-V` only for a
  composite font's code→CID map, any other `/Encoding` yielding no widths) plus `Tc`/`Tw`/`Tz`. A
  same-baseline jump beyond `0.25` em of the text it follows (magnitude, either direction) inserts one
  space; inside a `TJ` array, a forward numeric displacement beyond `0.1` em does the same (backward
  `TJ` displacements never do). **When the pen's advance cannot be established** (no font, no widths,
  an undecoded or width-misaligned run) **no gap is judged and no space is inserted** for that jump —
  the reading degrades to no break, never an invented one.
- **R14** A page with no `/Resources /Font` entry, or one whose fonts are never used by a
  text-showing operator anywhere it paints (its own streams and every form, per `pageShowsText`, R15),
  AND that declares an image XObject in its resources, carries exactly one `undetermined` marker
  `{page, reason:"no_text_layer", font:null, codes:"", count:0}` when it otherwise decoded to zero
  characters and zero other markers. A page that shows text, or declares no image, or whose
  text-showing status could not be determined (`pageShowsText` → `null`), never gets this marker on
  that basis alone.
- Errors: a page whose extraction throws internally is caught and recorded as `{page, reason:
  "text_extraction_error", font:null, codes:"", count:0}` for that page alone; the document-level call
  never throws.

**pageShowsText(doc, pageMap) → Promise\<boolean|null\>**
- **R15** `true` the moment any text-showing operator (`Tj`, `TJ`, `'`, `"`) runs anywhere the page
  paints — its own content stream(s) or a Form XObject it draws, to the same depth-8, no-cycle rule as
  R11. `false` only when every content stream and every form on the walk was fully decoded and read and
  none ran one. `null` — UNDETERMINED, and a caller must not read it as `false` — when any part of the
  walk could not be resolved or decoded (an unresolved `/XObject`, a form nested past the limit or in a
  cycle, an undecodable stream) before a `true` was found. `doc` is a `PdfDoc` from `openPdf` (R30);
  `pageMap` is one page's resolved dict (`pageDict`, R31).
- Errors: never throws; `pageMap` falsy → `null`.

**pdfPageImages(doc, pageIdx) → Promise\<{images, why}\>**
- **R16** `{images, why:null}`, `images` every image (an `/XObject /Subtype /Image`, or an inline
  image between `BI`/`ID` and `EI`) the page at `pageIdx` PAINTS, in painting order, each
  `{kind:"image", ref:"an image on page "+(page+1), page, rect:[x0,y0,x1,y1], mime, name, inline,
  width, height, filters, axis_aligned}`. `rect` is the axis-aligned bounding box of the unit square
  under the image's own composed CTM (`q`/`Q`/`cm`, and a Form XObject's `/Matrix`, walked the same
  way as text), rounded to 1/1000 pt, in the page's default user space — the SAME space and
  point order as an annotation's `/Rect` (R3-R6's `source.rect`). `mime` is `"image/jpeg"` for a
  `DCTDecode`-filtered stream, `"image/jp2"` for `JPXDecode`, else `null` (the bytes are samples, not
  a file); `filters` names the stream's filter chain (`[]` for an inline image). `name` is the
  XObject's resource name, or `null` for an inline image — a filing label, not the address (page+rect
  is). `axis_aligned` is `false` when the composed CTM rotates or skews the unit square. A placement
  has exactly these enumerable properties; its stream and CTM are reached only through
  `imagePlacementSource` (R32).
- **R17** `{images:null, why}` — NEVER a partial list — when any part of the page's paint sequence
  could not be walked: the page itself unreadable (`` `page_unreadable:<pageIdx>` ``), its content
  stream(s) undecodable (`` `content_stream_undecodable:page <pageIdx>` ``), a `Do` naming an
  unresolvable XObject (`` `xobject_unresolvable:page <pageIdx>:<name>` ``), a Form XObject nested past
  depth 8 or in a cycle (`` `form_nesting_unwalkable:page <pageIdx>` ``), or an undecodable Form
  XObject stream (`` `form_stream_undecodable:page <pageIdx>` ``); each string truncated to 120 chars.
- Errors: never throws (R17 is the error channel).

**Every page's images, called by `extractPdfStructure`**: `images`/`imagesWhy` on R2's top-level shape
is `null`/`"encrypted"` for an encrypted document (no page walked); otherwise every page's
`pdfPageImages` result concatenated in page order, or the FIRST page's `why` (R17) the moment one page
cannot be walked — the same never-partial rule as R17, for the whole document.

**openPdf(bytes) → Promise\<PdfDoc|null\>**
- **R30** Returns a `PdfDoc` over `bytes` that has run R8's whole lenient read (top-level scan, object
  streams, page index), exactly as `extractPdfStructure` opens its own document, ready for every
  service below. `bytes` not a `Uint8Array`, or no `%PDF-` signature in the first 1024 bytes → `null`.
- Errors: never throws.

**imagePlacementSource(placement) → {stream, ctm} | null**
- **R32** For a placement `pdfPageImages` returned: `stream`, the image XObject's stream value (readable
  with `resolve`, `streamRawBytes`, `streamDecoded`), or `null` for an inline image; `ctm`, a fresh copy
  of the six-number composed CTM `[a,b,c,d,e,f]` its `rect` was computed from (R16). Anything else,
  a copy of a placement included → `null`.
- Errors: never throws.

**PdfDoc** — the shared lenient PDF object/stream reader. `pdf-worker` drives it through `openPdf`. Its
interface is the members below and nothing else; every other field is private.
- **R18** `new PdfDoc(bytes)` holds the bytes; `scanTopLevel()`, `await loadObjectStreams()` and
  `buildPageIndex()` perform R8's three steps in that order (`openPdf` runs all three).
- **R19** `.pageCount` is the number of pages in R8's page order once `buildPageIndex()` has run; `0`
  before it runs or when the document has no pages.
- **R31** `pageDict(pageIdx)` returns the resolved dict (`map`) of the page at 0-based `pageIdx` in page
  order; `null` when `pageIdx` is not an integer in `[0, pageCount)` or the page object is unresolvable.
  Its result is a valid `pageMap` for `pageShowsText` (R15).
- **R20** `resolve(v)` follows an indirect-reference chain (`{t:"ref", n, g}`) up to 64 hops and
  returns the resolved value, or `null` for an unresolvable reference, a reference cycle beyond the cap,
  or a non-reference value passed through unchanged.
- **R21** `dictOf(v)` resolves `v` and returns its `dict`/`stream`'s `map`, or `null` for anything else
  (including an unresolvable reference).
- **R22** `streamRawBytes(streamObj)` returns a stream value's raw (still-filtered) bytes: by its
  resolved `/Length` when that agrees with an `endstream` at or just after the implied end, otherwise by
  scanning forward to the next `endstream` (trailing EOL excluded). Returns `null` for a non-stream
  value or when no `endstream` is found.
  `streamDecoded(streamObj)` returns the stream's raw bytes unchanged when it carries no `/Filter`;
  Flate-decoded (native `DecompressionStream("deflate")`, falling back to `"deflate-raw"` for a raw
  deflate stream with no zlib header) and PNG-un-predicted per `/DecodeParms /Predictor` (≥10; the
  `/Colors`, `/Columns`, `/BitsPerComponent` it names, defaulting 1/1/8) when every filter in the chain
  is `FlateDecode`/`Fl`; `null` for any other filter, an unreadable stream, or a decode failure — the
  caller treats `null` as "cannot resolve," never as empty bytes.
- **R23** `isEncrypted()` reports whether any object in the file carries `/Filter /Standard` with a
  numeric `/R` (the Standard Security Handler dictionary, which the standard requires stay
  unencrypted); cached after the first call.
- Errors: no `PdfDoc` method throws on malformed input; a read that cannot resolve returns `null`,
  `false`, or an empty result, per the method's own rule above.

## Private

### Uses

- `subresources`: `LINK_TYPES` (the four HTML link partitions: `anchor`, `intra`, `deferred`,
  `refused`) and `linkWrapper` (`.anchor`/`.intra`/`.deferred`/`.refused`, each a wrapper constructor)
  — reused, never re-derived, so a PDF link and an HTML link of the same partition carry byte-identical
  wrappers (R3-R5).

### Invariants

- **R24** Pure: no store read or write, no network call, no clock. `extractPdfStructure`,
  `pageShowsText` and `pdfPageImages` answer only from their input bytes/`PdfDoc`, so the same input
  always gives the same output.
- **R25** *(not yet met: D-591)* A Flate-compressed stream with bytes after the compressed data's own
  end still decodes: the decoded bytes are kept, and `notes` gains `flate_trailing_bytes:<n>` once per such
  stream. A page whose content stream cannot be decoded carries the page marker `{page,
  reason:"content_stream_undecodable", font:null, codes:"", count:0}`, and one whose `/Contents`
  resolves to nothing carries `reason:"content_stream_unresolvable"`; neither reads as a blank page.
- **R26** *(not yet met: D-627)* A page's image share is the area its painted images (R16) cover,
  as a share of its visible page box; its glyphs are the characters it shows (R11-R12). A page with
  at most 4 glyphs and an image share of at least 0.18 carries the marker `image_content_unread`. Any
  other page that paints an image and shows fewer than 22 glyphs (a share under 0.18, 5-21 glyphs, or a
  page box that cannot be read) carries `image_content_undetermined`. A page that paints no image, or
  shows 22 or more glyphs, carries neither. Both markers name
  `image_share` and `glyphs`. R26 applies only to a page that shows text: a page carrying `no_text_layer`
  (R14) carries neither R26 marker. The figures are measured
  (M-178: 1,788 pages; the 17 image-only pages show at most 4 glyphs at shares 0.1897-0.6542; every
  other page painting an image shows at least 22 glyphs).
- **R27** Every `undetermined`/`why`/`reason` value in this module's output names WHICH kind of
  unresolved thing it is (a missing font, an unresolved destination, an unwalkable form, an unreadable
  `/Info`, …); none is a bare `false`/empty result standing for every cause at once, and a decode
  failure is never silently read as "nothing there."
- **R28** `producer.determination` (R10) has exactly two members, `"ocr"` and `"undetermined"`; a
  classification can only ever add a named engine to a document that had none, never remove one or
  invent authorship. `text` never carries a producer claim stronger than what the file's own bytes
  state.
- **R29** No place is named in this module's logic: `WORD_GAP_EM` (0.25), `TJ_WORD_GAP_EM` (0.1), the
  Form nesting depth (8), and the OCR product-name table are general PDF-reading parameters, not
  jurisdiction facts, even where a comment cites an Oakland/Legistar document as the measurement that
  set one — the tests use fixtures built by hand, not any one jurisdiction's documents, and the module
  needs no jurisdiction profile (`build/layers.md`, "No jurisdiction in the product").

### Satisfies

- `BIO_Content_Framework_v0_10.md` §16, "How content is extracted today" — the PDF read path: Tier 1
  here, Tier 2/3 escalation this module's `no_text_layer`/`producer` signals drive but do not perform.
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3, "Tables and images as content" (R16-R17, the
  IC-1 `image` reference this module mints) and §6, "The external OCR tier" (R10's producer signal is
  that routing's input).
- `BIO_Interaction_Constructs_v0_1.md` §U, "UNDETERMINED — a display primitive, not an act" — the
  doctrine R27 states as an invariant of this module's whole output.
- `build/layers.md`, "No jurisdiction in the product" (R29).

### Suggestions

- **D-616 does not belong to this module.** Its fix — seeding a re-read (`op=pdfstructure&ocr=1`) with
  the pages a stored reading already transcribed, so a later request advances past the per-request OCR
  budget instead of re-asking the same first pages — reads and mutates the stored reading, which a
  Layer 1 "no access to the record" module cannot do. `tier3Extend`/`needsTier3` are defined in
  `bio-plane/src/index.mjs` today; the row belongs against whichever module ends up owning that
  read-time orchestration (`index.mjs`'s extraction, when it is extracted) or `pdf-worker`, not here.
- The existing hand-built PDF fixtures in `bio-plane/test/pdfstructure.test.mjs` (and the sibling
  `cpdf18-pdf-images.test.mjs`, `d608-form-text.test.mjs`, `producer-provenance.test.mjs`,
  `textshown.test.mjs`) already cover most of R1-R24 byte-for-byte; R25/R26's tests want a fixture with
  a deliberately trailing-junk Flate stream and, once D-627's thresholds are measured, a fixture whose
  image share and glyph count straddle them.
- No entry in `bio-plane/checks/bio-checks.mjs` is owned by this module today (searched for every
  exported name and found none): `pdf-reader` imports no `legacy-checks` service and nothing in the
  catalogue calls its functions directly, so there is no C-number invariant to carry forward here.
