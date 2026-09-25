# Spreadsheets, word-processing and presentation documents

**Status** · RESEARCH of 2026-07-31 (session BOB, at Bob's direction) that became the plan of record for the FORMAT axis, and the axis it argues for is now [BUILT] END TO END by COFF-1..7: the registry with HTML and PDF moved onto it (`bio-plane/src/formats.mjs` — the one place a format is known, and the D-70 test that framework §4's cost table is real), the dependency-free OOXML container reader (`ooxml.mjs`), and DOCX, XLSX and PPTX entries carrying I2 structure with per-container element references, text, and the DEC-5 evidentiary envelope. **The document's own preamble said "Nothing here is built" — the single most misleading line in it — and M0-27 CORRECTED IT IN PLACE on 2026-09-14; the preamble now states the axis as built and names the command that counts the registry.** COMPLETE as the argument — every architectural claim it makes was exercised and none was overturned — and SUPERSEDED IN FOUR PLACES by things that happened after it: DEC-5 ruled the risk it raises, IC-1 landed the interface change it predicts in a shape it does not anticipate, and COFF-6's census answered both of its open empirical questions (the size bound, and legacy/ODF prevalence). What the axis still does NOT extract is stated below rather than left derivable. **A NINTH ENTRY landed 2026-09-24 (FW-23): `csv`, the first on this axis that is not a container** — BOB #32's design, written from all 166 `.csv` keys of `s3://cao-94612` measured whole (M-144), with the delimiter and the encoding found by signature and RECORDED on the reading, and byte detection REFUSED because prose wears a CSV's shape. **Since 2026-09-25 (REC-218, BOB #33's ruling) the dialect is PERSISTED as `reading.dialect`, a key of its own** — see the CSV section. as of 2026-09-25.

**Place in the system** · A level-2 design serving construct 5 of `BIO_System_Design.md` §3, *document profile and the extraction substrate*, whose level-1 home is `BIO_Content_Framework_v0_10.md` **Part I**; §3 row 5 lists this document beside `DOCUMENT-PROFILES.md` as the two level-2 designs under it, and Part II §16 places the format entries in the extraction process as built ("delegated to format entries and members"). It is the FORMAT axis — framework §4's third axis, the one D-70 said had never been exercised — so it is also the evidence for a claim the framework makes about itself. Interfaces: it created I7 (the registry entry shape) and it drove IC-1 against I2, the element reference union that legs, connections and citations will share. What depends on it: `formats.mjs`, `ooxml.mjs`, `docx.mjs`, `formats-xlsx.mjs`, `pptx.mjs`, `odf.mjs`, `csv.mjs`, and `CONTENT-EXTENT-DESIGN-SPACE.md`, which treats IC-1's union as D-164's per-container leaf.

**Incomplete sections** ·
- §What to build — now a record rather than an instruction: step 1 is COFF-1, step 2 COFF-2, steps 3–4 COFF-3/4/5, step 5 COFF-6, step 6 the DEC-5 extras carried alongside 3–4 plus COFF-7 (hidden slides, the pptx analogue of hidden sheets). What the section cannot say is what step 5 RETURNED, and the answers now govern steps 2 and 7 — see the next three bullets.
- §Bounds — superseded by the measurement it demanded. "The bound itself must be MEASURED on a real Oakland workbook, not picked" was honoured: COFF-6 censused all 43,282 `oaklandca.gov` assets plus 792 Legistar attachments and downloaded a 93-file stratified sample, and what shipped is `MEASURED_OOXML_TEXT_BOUND_BYTES` — 20 MiB of DECLARED UNCOMPRESSED text-part bytes summed from the central directory, because container size is a bad proxy in both directions — which passes 86 of 88 measured OOXML files. The two it excludes are the 2019/2020 police Stop-Data workbooks, which read `text-undetermined` honestly and are the named test cases for a streaming extractor reaching 64 MiB that is DEFERRED and not built. None of this is in the section.
- §Legacy binary formats are a SEPARATE — the empirical question it poses has been answered and the section does not carry the answer. OLE2 prevalence measured 0.32% of assets (COFF-6), and the deferral STANDS with a trigger — a group actually needing one inspected — rather than as an open guess.
- §The finding that shapes everything — its ODF recommendation was honoured, overtaken, and then RE-WARRANTED FROM A DIFFERENT DIRECTION, and this bullet is CORRECTED on 2026-09-14 rather than left standing, because its last sentence became false the day COFF-9 landed. `ooxml.mjs` parameterises the flavour table (`discriminate(bytes, contentType, flavours)`) so an ODF part-map is a table row rather than a rewrite, exactly as this section asks — and COFF-9 collected on that bet without touching the container tier's shape. COFF-6's census STANDS unrevised (ZERO ODF documents in 43,282 assets, so native ODF in the wild remains DO NOT BUILD); what changed is the SOURCE, not the census: Bob ruled on 2026-09-14 that a Google Drive link keeps the link and extracts from the OpenDocument EXPORT, making ODF the HARVEST format. ODF is therefore [BUILT] END TO END as of 2026-09-14, in the two acts this bullet predicted: the CONTAINER-TIER FLAVOUR (COFF-9 — `ODF_FLAVOURS` in `ooxml.mjs`, `discriminate()` answering `odt`/`ods`/`odp` on a real ODF package, refusing a non-conforming `mimetype` into a stated undetermined), and the three REGISTRY ENTRIES reading `content.xml` into I2 (COFF-10 — `bio-plane/src/odf.mjs`, three `registerFormat` calls in `formats.mjs` and nothing anywhere else, landing in the SAME I2 shape and DEC-5 envelope the OOXML sibling of each kind produces, with IC-1's `doc-para` / `sheet-cell` / `slide-shape` references and NO new union member, so I7 is CONFIRMED by three more entries rather than changed). **What one `content.xml` cannot reach is STATED by the entries rather than left silent, and that is the part of this bullet worth carrying forward**: OpenDocument keeps the core properties in `meta.xml` and embedded objects in `META-INF/manifest.xml`, so no `core-properties` item and no `intra` link is emitted and BOTH absences are named undetermineds — a zero `intra` count means NOT LOOKED, never NONE PRESENT. The extras content.xml DOES carry are all emitted and were verified against real LibreOffice 26.8.0.3 output: tracked changes with author/date/superseded wording, annotations as comments, formulas beside cached values, hidden sheets/rows/columns, speaker notes, hidden slides. Still NOT measured against Google Drive's own export, which is the source the ruling points at — CAP-8 meets it first.
- §The risk that comes with it — superseded, and the supersession INVERTS the framing rather than resolving it in the direction the section leans. DEC-5 (Bob, 2026-08-01) ruled it: these are public documents, there is no reason to redact anything from a public record, and who edited a document and when IS evidence — so this is an evidence source to be extracted, projected, indexed and searched, not a disclosure risk to be managed. What DEC-5 deliberately did NOT settle is restricted material: D-124's second row keeps three classes open on a trigger rather than a date (statutory redactions in a records-request response, member-origin or confidential-source material, and a document published in error then withdrawn).
- §What changes in I2 — superseded on both halves. `INTERFACE-CHANGES.md` exists and IC-1 was its first use, exactly as predicted; but the landed union is `{kind: pdf-page | sheet-cell | slide-shape | doc-para | dom, ref}` with `kind` and `ref` both REQUIRED, not the `{sheet, cell}` / `{slide, shape}` pair sketched here. `doc-para` exists for a case this section does not anticipate — a DOCX has no pages in its bytes, so a page reference would claim something the captured bytes do not say — and the `dom` arm has no producer anywhere in the plane.
- §What these formats carry — what the axis EXTRACTS today is narrower than what it enumerates, and the difference is the honest frontier. Extracted: text, outbound and internal links with element references, and the DEC-5 envelope (formulas beside cached values, tracked changes, comments, speaker notes, hidden rows, columns, sheets and slides, core properties). NOT extracted: TABLES and IMAGES as content, both [GESTURED] corpus-wide with no object, no extraction step and no debt row scoped to them (framework Part II §15) — so a workbook's grid is reachable as cells and as text and never as a table; charts, drawings and other embedded media, which are not read at all; and the CONTENT of embedded files, which are content-addressed into `intra` links by sha256 and never opened.

- §CSV — the SIZE BOUND in it is NOT SETTLED, and the section says so rather than reading as finished. The metric is
  the format's own (body bytes); the FIGURE is COFF-6's 20 MiB reused, and FW-23 measured two instruments
  disagreeing about it — node's walk at the bound costs 254.5 MiB of heap against a documented 128 MiB isolate
  limit (Cloudflare's claim), while local workerd read the whole 73,585,498-byte body without dying and cannot see
  the production cap. **The deciding measurement is a DEPLOYED plane reading a > 20 MiB CSV in its own scratch
  namespace; deploying is DIST's and FW-23 did not take it.** Until it is taken the bound excludes exactly 1 of the
  166 corpus keys, with that body's dialect still stated. Also unmeasured, and stated at the suite: no corpus body
  carried a UTF-16 BOM or a semicolon, tab or pipe delimiter, so those four arms are driven by fixture only.
  AND ITS TEXT AT ACQUIRE IS NOT THE ENTRY'S (REC-218's finding, D-593): a `text/csv` body is read at intake as
  lossy UTF-8 and never through `csv.mjs`'s `text()`, so the dialect is persisted (BOB #33's ruling, folded into
  the section) while the reading's text is not yet decoded in it.

**Contents**
- [The finding that shapes everything: three formats, one container](#the-finding-that-shapes-everything-three-formats-one-container)
- [What each part-map offers, and where it maps onto I2](#what-each-part-map-offers-and-where-it-maps-onto-i2)
- [What these formats carry that HTML and PDF do not](#what-these-formats-carry-that-html-and-pdf-do-not)
- [The risk that comes with it, and it is Bob's](#the-risk-that-comes-with-it-and-it-is-bobs)
- [The architectural answer: a FORMAT axis, not a fifth if-branch](#the-architectural-answer-a-format-axis-not-a-fifth-if-branch)
- [What changes in I2, and it needs the protocol](#what-changes-in-i2-and-it-needs-the-protocol)
- [CSV — BUILT 2026-09-24 by FW-23, from BOB #32's design and a measured page](#csv-built-2026-09-24-by-fw-23-from-bob-32s-design-and-a-measured-page)
- [Legacy binary formats are a SEPARATE and LATER decision](#legacy-binary-formats-are-a-separate-and-later-decision)
- [Bounds and the size guard](#bounds-and-the-size-guard)
- [What to build, in order](#what-to-build-in-order)

---

Research, 2026-07-31 (session BOB), at Bob's direction: BIO must inspect spreadsheet,
Word-format and presentation documents as it inspects HTML and PDF, and the recognition
and per-type processing must be architecturally clean.

**CORRECTED 2026-09-14 (M0-27). This line read "Nothing here is built", which was true
the day it was written and has been false since 2026-08-10.** The FORMAT axis this
document argues for is **[BUILT] END TO END**: COFF-1..7 landed the registry with HTML
and PDF moved onto it (`bio-plane/src/formats.mjs`), the dependency-free OOXML container
reader (`ooxml.mjs`), and the DOCX, XLSX and PPTX entries carrying I2 structure with
per-container element references, text, and the DEC-5 evidentiary envelope; **and since
2026-09-14 the axis also reads OpenDocument** — COFF-9 put `ODF_FLAVOURS` beside
`OOXML_FLAVOURS` in the container tier and COFF-10 added the `.odt` / `.ods` / `.odp`
registry entries (`bio-plane/src/odf.mjs`), in the same I2 shape and DEC-5 envelope and
with no new I2 union member. **COUNT THE REGISTRY RATHER THAN TRUST THIS SENTENCE:**
`grep -cE '^registerFormat\(' bio-plane/src/formats.mjs` — eight entries on 2026-09-14, NINE since
FW-23 added `csv` on 2026-09-24.
What the axis still does NOT extract is stated in §What these formats carry and in this
document's Incomplete list, not here. The one technical fact everything rests on was
MEASURED on 2026-07-31 rather than assumed; every other number below is marked as
unmeasured where it is, and the two empirical questions that were open then were answered
by COFF-6's census.

## The finding that shapes everything: three formats, one container

`.docx`, `.xlsx` and `.pptx` are **OOXML** — a ZIP archive of XML parts. They are not
three problems. They are **one container problem and three part-maps.** `.odt`,
`.ods` and `.odp` (OpenDocument) are the same shape with different part names, so they
come nearly free once the container reader exists and should be designed for now even
if not built now.

**MEASURED 2026-07-31, in workerd via miniflare** (`DecompressionStream` probe): the
runtime supports `deflate`, `deflate-raw` AND `gzip`, and a `deflate-raw` round trip
succeeds (480 raw bytes → 29 compressed → back intact). **ZIP members are stored raw-
deflated, so an OOXML container is readable in the plane with ZERO dependency** — a
central-directory walk plus `DecompressionStream("deflate-raw")`. This is the same
finding that made PDF phase 1 dependency-free (`FlateDecode` via `DecompressionStream`)
and it lands the same way: the container tier belongs in the plane, not in a fleet
member.

## What each part-map offers, and where it maps onto I2

I2 already partitions structure into `anchor` / `intra` / `deferred` / `refused` /
`undetermined` with an element reference. Office formats fit it without stretching:

| | `.docx` | `.xlsx` | `.pptx` |
| --- | --- | --- | --- |
| **outbound links** | `word/_rels/document.xml.rels` | `xl/worksheets/_rels/sheetN.xml.rels` | `ppt/slides/_rels/slideN.xml.rels` |
| **link shape** | `Relationship Type=".../hyperlink" TargetMode="External"` — uniform across all three | | |
| **embedded files → `intra`** | `word/embeddings/` | `xl/embeddings/` | `ppt/embeddings/` |
| **internal refs → `anchor`** | bookmarks | defined names, cross-sheet refs | slide refs |
| **text** | `word/document.xml`, `<w:t>` runs | `xl/sharedStrings.xml` + sheet `<v>` | `ppt/slides/slideN.xml`, `<a:t>` runs |
| **element reference** | paragraph / run index | **sheet + cell (`Sheet1!B14`)** | **slide number + shape id** |

**Outbound links live in one uniform place across all three**, which is the property
that makes this a registry entry rather than three parsers.

**Text is EASIER here than in PDF, not harder**, and this is the opposite of the
intuition. A PDF needs glyph→Unicode through embedded CMaps, which is why it has a
tiering plan and a fleet member. Office text is XML text nodes. **There is no Tier 2
for office text** — no dependency is needed at all.

**Two element references are BETTER than PDF's.** A PDF cites a page and a rectangle.
A spreadsheet cites `Sheet1!B14` and a deck cites slide 7 — stable, human-meaningful,
and exactly the granularity a citation wants. This is the first time the record can
cite something finer than a document without inventing an anchor scheme.

## What these formats carry that HTML and PDF do not

This is the part that makes the work more than parity, and it is where the
accountability value is:

- **A formula is different evidence from its result.** XLSX stores both `<f>` (the
  formula) and `<v>` (the cached value). For accountability work the DERIVATION is
  frequently the finding — how a total was reached, which cells feed a projection,
  what a "budgeted" figure is actually computed from. A PDF or a printed copy of the
  same sheet destroys this permanently. **The record should hold both and say which
  is which.**
- **Tracked changes and comments.** DOCX `w:ins` / `w:del` and `word/comments.xml`
  record who changed what and what a reviewer said. This is evidence a published PDF
  is specifically designed to remove.
- **Speaker notes.** PPTX `notesSlide` parts are routinely more candid than the slide.
- **Hidden rows, columns and sheets.** A hidden XLSX sheet is a first-class finding,
  and it is invisible in every rendered form of the document.
- **Document metadata.** `docProps/core.xml` carries creator, `lastModifiedBy`,
  revision count and created/modified instants — provenance-adjacent facts about a
  document that the publisher's own software recorded.

**None of this is CAPTURE deciding what things MEAN.** The division holds exactly as
it does for PDF: CAPTURE extracts structure and hands FRAMEWORK a parsed tree;
FRAMEWORK decides what is evidentiary. A formula is structure; whether a formula
matters is content.

**DESIGNED 2026-09-23 by BOB #32 — THE ENVELOPE AS CONTENT (D-124, the 2026-07-31 row).** Tracked-change authors and
text, comments, core properties and speaker notes are extracted today, but they are never projected or indexed
(`textUnitsFor` names the gap against CONTENT-SEARCH-DESIGN §4.1). Under DEC-5 (*surface it all*) they become content:
a NINTH extent kind, `envelope`, addressing one item by its part and element reference, with the item's kind
(`tracked-change`, `comment`, `core-property`, `speaker-note`) as a field. It carries the capture's grade, because these
are the publisher's own bytes. Its `cited_as` distinguishes it from the body, and the passage arm indexes its text
LABELLED as envelope, so a search hit never presents a reviewer's comment as the document's text. Adding the kind is a
change to the content extent census and goes through an IC. NOT BUILT (RECORD, rowed).
**The restricted-material deferral (D-124, the 2026-08-01 row) is CLOSED as a STATED LIMITATION.** The deferral stays
stated in this document's front matter. Nothing in the code could detect its trigger, so a row that stays open is a
claim nobody can discharge.

## The risk that comes with it, and it is Bob's

These artefacts include **personal data the publisher left in the file**.
`lastModifiedBy` names a member of staff. A tracked change attributes an edit to a
person by name. A comment may be candid about a named individual. None of it was
knowingly published, and all of it is inside a document the body did knowingly publish.

Capturing it is not in question: the record holds what was served, faithfully, and
stripping bytes would break the hash and the whole premise. **SURFACING it is a
different act**, with effects on people outside this project — the D-77/invariant-7
neighbourhood. Raised as a decision rather than settled here.

## The architectural answer: a FORMAT axis, not a fifth if-branch

Today's dispatch is already TWO mechanisms, and neither scales:

1. **Acquire-time**, `index.mjs`: a hardcoded `HTML_CT = ["text/html",
   "application/xhtml+xml"]` array guarding the subresource branch, with everything
   else refused as `NOT_HTML`.
2. **Read-time**, a separate op: `op=pdfstructure`, reached by capture sha.

Adding three formats to that produces five special cases across two mechanisms. The
clean shape is the one the framework already specifies and has never been exercised:

**`BIO_Content_Framework_v0_10.md` §4 defines a uniform recogniser shape and a
registry per AXIS, and it names FORMAT as a candidate axis outright** (HTML, PDF,
dataset, scanned image). **D-70 records that this uniformity is an ASSERTION rather
than a demonstrated property, because no third axis has ever been added, and that
"the first genuine third axis is the test of whether §9's cost table is real."**

Office formats are that third axis. So the work is not "add three parsers"; it is
**stand up the FORMAT registry and move HTML and PDF onto it**, exactly as CONSTRUCTS
Step 0 rewrites both existing axes onto one recogniser shape rather than leaving them
as special cases beside the new one. If adding `.docx` after that costs a registry
entry, §9's cost table is real. If it costs a rewrite, we have learned something more
valuable than three parsers.

Each registry entry declares, uniformly:

    detect(bytes, contentType)  -> confidence          // magic bytes first, CT second
    parts(container)            -> named parts         // ZIP walk, shared by all OOXML/ODF
    structure(parts)            -> I2 links + element refs
    text(parts)                 -> text + what it could NOT decode

**Detection is by MAGIC BYTES first and content type second**, because a source's
declared `Content-Type` is frequently wrong (and I1 already records that it may be
absent entirely). `PK\x03\x04` plus the `[Content_Types].xml` part and its declared
document type is the reliable discriminator between OOXML flavours — and it is what
distinguishes a `.docx` from an arbitrary ZIP, which matters because a ZIP is also just
a file a body might publish.

## What changes in I2, and it needs the protocol

I2's element reference is `{ page, rect }` for PDF. A spreadsheet's is
`{ sheet, cell }` and a deck's is `{ slide, shape }`. That is a change to a shape
FRAMEWORK builds against, so it goes through `INTERFACE-CHANGES.md` — **which does not
exist yet, deliberately, because no interface change has ever been proposed.** This
would be its first use, which is worth knowing before starting: the protocol gets
written when it is first needed, and this is that moment.

The likely shape is additive — `source` becomes a tagged union whose existing PDF form
is unchanged — so consumers that only read `{page, rect}` keep working. Additive or
not, it is I2's owner's call and FRAMEWORK is dormant, so `ARCH`/CONDUCT answers for it
in writing (protocol step 3).

## CSV — BUILT 2026-09-24 by FW-23, from BOB #32's design and a measured page

**DESIGNED 2026-09-24 by BOB #32** (D-66's worker had just counted 166 `.csv` keys held and never read): a `csv` entry in
the format registry, owned by FRAMEWORK, on this document's format axis. The delimiter and encoding are found by signature
and RECORDED on the reading; when either cannot be determined the reading says so (undetermined) and nothing is guessed.
The file is ONE sheet. Row 1 is row 1 whether or not it looks like a header, because a header is a reading and is never
assumed. Cells are addressed with the existing `sheet-cell` / `sheet-range` extent kinds, 1-based row and column. It
carries the capture's grade, since the bytes are the publisher's.

**[BUILT] 2026-09-24 by FW-23** — `bio-plane/src/csv.mjs`, ONE `registerFormat(csvEntry)` call in `formats.mjs` and
nothing anywhere else (`index.mjs` does not carry the substring `csv` at all, which `formats-csv.test.mjs` greps for), so
I7 is CONFIRMED by a ninth entry rather than changed. No new IC-1 union member: the references are `sheet-cell` and
`sheet-range`, and the sheet carries the same four extent keys `.xlsx` and `.ods` carry — pinned against the xlsx entry's
OWN OUTPUT, not against a key list spelled again. **It is the first entry on this axis that is not a container**: there
is no `parts` walk over a ZIP, and the four-slot entry shape absorbed that without changing.

**EVERY DECISION IN IT WAS TAKEN AGAINST A MEASURED PAGE — all 166 `.csv` keys of `s3://cao-94612`, fetched WHOLE
(90,402,768 B), read through the plane's own registry (M-144).** 166 of 166 declare `text/csv`; 166 of 166 are
comma-delimited; 146 carry a UTF-8 BOM, 18 are ASCII throughout, 1 is UTF-8 by validity and **1 is ENCODING
UNDETERMINED**; 778,830 cells read.

**THE ONE FINDING THAT SHAPES THE ENTRY: A CSV IS NOT BYTE-DETECTABLE, AND THAT IS MEASURED RATHER THAN ASSUMED.** A CSV
has no magic bytes, only a SHAPE, and prose wears that shape: 5 of 8 planted non-CSV text bodies fired the candidate
signature at a two-line minimum — a hard-wrapped paragraph with one comma a line, a minutes roll-call, an ini file, an
apache log, a Markdown table. Over 198 real non-CSV bodies from the same bucket it fired 0 times, and **that result is
not a licence to sniff**: the bucket holds ONE `.txt` in 43,283 keys, so what a signature would false-positive on is
exactly what the corpus is missing. So `detect` returns null for ANY bytes and the format is claimed from the declared
content type alone — which is where the registry's magic-bytes-first doctrine meets a format that has none, and the
honest answer is the xlsx entry's own at its prefix seam, reached from the other side. **WHAT IT COSTS, STATED: a CSV
captured with no declared content type is `undetermined` at the FORMAT axis and this reader never runs on it** (0 of 166
here).

**WHAT AN UNDETERMINED ENCODING DOES, and it is deliberately narrow:** the GRID survives — delimiters, quotes and line
breaks are ASCII — and only the cells that actually hold a high byte are undetermined, each named with its own
`sheet-cell` address and a null text, never mojibake. `data/20230609update2.csv` is the corpus's case: byte `0x96`, no
BOM, which is an en dash in windows-1252 and the letter ñ in Mac Roman, so the byte narrows the encoding and does not
tell it. 138 cells in that one file.

**WHAT IS NOT SETTLED, and it is the size bound.** The metric is this format's own (the body's bytes), but the FIGURE is
COFF-6's 20 MiB reused, and FW-23 measured that it does not transfer cleanly in either direction: node's record walk at
the bound costs 254.5 MiB of heap, against Cloudflare's documented 128 MiB isolate limit (their claim), while local
workerd walked the whole 73,585,498-byte body without dying — and local workerd does not apply the production memory cap,
so it cannot see the limit that matters. **The deciding measurement — a deployed plane reading a > 20 MiB CSV in its own
scratch namespace — has NOT been taken, because deploying is DIST's.** The bound stands meanwhile and excludes exactly 1
of 166 keys, whose dialect is still stated. M-144 §5 carries the figures.

**THE INTERFACE HALF IS `IC-283`** (I2 2.7.0 → 2.8.0 proposed, MINOR ADDITIVE: the `dialect` key on the entry's
`structure()` and `text()`). Its residue — **the dialect was EMITTED AND NOT PERSISTED** — is CLOSED by REC-218
(2026-09-25) under the ruling below.

**RULED 2026-09-24 21:55Z by BOB #33, option (b): THE DIALECT IS A KEY OF ITS OWN ON THE READING.**
`reading.dialect = {delimiter, encoding}`, persisted on the acquire document and read back through `op=reading` —
NOT inside `container_extent`, which says what a container ITEMISES, and not inside D-536's `reading.provenance`,
which says WHO read which text. The dialect is a third fact: the decoding choice made before any text existed. The
ruling suits ANY text format that involves a decoding choice, so the projection (`readingDialect`) lives on the
REGISTRY in `formats.mjs`, not in `csv.mjs`, and the next such entry's dialect reaches the record with no edit
anywhere else. Each half is a name or NULL; a NULL carries the entry's own reason code in `undetermined`
(`encoding_undetermined`, `delimiter_undetermined_tied`, …) beside the signals and confidences. The key is ABSENT on
a reading no decoding-choice entry produced (PDF, office containers, HTML). **A latin-1 body reads its ENCODING
UNDETERMINED, never "latin-1"**: this section's signature has no latin-1 outcome on purpose (the `0x96` finding
above), and REC-218's row, which asked for a latin-1 body to read "both", was narrowed at the code to both KEYS
present with the encoding stated undetermined.

**WHAT REC-218 FOUND BEHIND THE RESIDUE, and it is wider than the residue said.** The residue read "the acquire
wire's projection drops the key", which presumes the entry RAN at acquire. For a `text/csv` body it did not: any
`text/*` body within `PROFILE_TEXT_MAX` (8 MiB) is read AS TEXT at intake by a lossy UTF-8 decode, and one over it
is streamed in 8 MiB parts and read by neither path, so only an `application/csv` body ever reached the entry's
`text()` at acquire. So the dialect is persisted from TWO sources with ONE builder: the wire's own `text()` answer,
and — for the intake read — an OPTIONAL fifth I7 slot, `dialect(bytes)`, signatures only and no record walk
(`reading-dialect.test.mjs` pins the two byte-identical). **What stays open is the TEXT, not the dialect:** a
`text/csv` body's reading is still the intake decode, so an undetermined-encoding byte reaches the content-type
reader as U+FFFD and the sheet's cells are not the units the reader sees. That is **D-593**, rowed.

The 50 legacy `.xls` keys wait on the section below.

## Legacy binary formats are a SEPARATE and LATER decision

`.doc`, `.xls`, `.ppt` are OLE2 Compound File Binary Format — a different container
entirely, binary rather than XML, sharing no code with the OOXML path. Aldus
Persuasion `.pre` is a dead format with no realistic parsing route at all.

**Do not design for them now, and do not guess whether they matter.** The question is
empirical and cheap: how many documents in Oakland's orbit are pre-2007 binary office
formats? That is the same measurement shape as D-63's unmeasured stacks, and the
honest interim is what the record already does everywhere else — capture the bytes,
state that the content could not be inspected, and let the member open it in their own
application. `undetermined` is first-class.

## Bounds and the size guard

A published budget workbook can be tens of megabytes and hundreds of thousands of
cells. The ZIP walk is cheap and streamable; **full text and formula extraction is
not**. The guard is the one CPDF-2 already specifies: bounded by the runtime envelope,
and a document over the bound is recorded `text-undetermined` with the reason, never
silently truncated. The bound itself must be MEASURED on a real Oakland workbook, not
picked.

## What to build, in order

1. **The FORMAT registry, with HTML and PDF moved onto it.** No new capability. This is
   the step that decides whether §9's cost table is real, and doing it after the new
   formats means building them twice.
2. **The OOXML container reader** — central directory, `deflate-raw`, part lookup by
   name. Shared by all three formats and by ODF. Dependency-free (measured).
3. **Structure for all three**, which is one `.rels` walk plus three part-maps, emitting
   I2 with the per-container element reference.
4. **Text for all three**, plus the size guard. No Tier 2 and no fleet member.
5. **MEASURE on real Oakland documents** — link density, size distribution, how many
   carry tracked changes, comments, notes, hidden sheets or formulas. That measurement
   sizes step 6 and answers the legacy-format question at the same time.
6. **The evidentiary extras** — formulas beside values, tracked changes, comments,
   notes, hidden sheets. UNGATED as of DEC-5 (Bob, 2026-08-01: surface it all — who
   edited a document and when IS evidence) and no longer a follow-on: it runs
   alongside steps 3–4, which is how the COFF-3/4/5 items carry it. Scope is PUBLIC
   records; restricted material is D-124's deferred half, with its own trigger.

Steps 1 and 2 are the ones with architectural consequence. Steps 3 and 4 are
mechanical once they exist, which is the whole argument for doing 1 first.
