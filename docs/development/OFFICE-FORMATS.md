# Spreadsheets, word-processing and presentation documents

Research, 2026-07-31 (session BOB), at Bob's direction: BIO must inspect spreadsheet,
Word-format and presentation documents as it inspects HTML and PDF, and the recognition
and per-type processing must be architecturally clean.

**Nothing here is built.** The one technical fact everything rests on was MEASURED
this turn rather than assumed; every other number below is marked as unmeasured where
it is.

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
   notes, hidden sheets — gated on the Bob decision below, since surfacing them is
   where the disclosure question lives.

Steps 1 and 2 are the ones with architectural consequence. Steps 3 and 4 are
mechanical once they exist, which is the whole argument for doing 1 first.
