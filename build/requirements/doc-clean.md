# doc-clean — requirements

**Status** · In force: a new helper module (layer 1, directly after `image-cover`), its requirements BOB's (K20, K70), written at T39's opening from `build/plan/draft-T39-N806.md` §3 (N806; Bob's K2315 and K2334, packaged by BOB's K2333). Every requirement met (DOC-CLEAN #1, K2354).

**Size (P6).** About 1,200–1,800 lines with tests.

## Public

### Purpose

Given a member-supplied document, answers a copy whose embedded images carry nothing but their pixels and which carries none of the document's own metadata, or says the file needs no copy, or refuses by name. Pure; it knows nothing of cases, members, storage or place, and is called only for files a member supplied (the caller decides which).

### Provides

**`cleanDocument(bytes) → Promise of {ok:true, clean:true, format}` or `{ok:true, clean:false, bytes, format, images:{stripped, unchanged}}` or `{ok:false, code, detail}`**
- **R1** (T39; N806; K2315, K2333) The format is judged from the bytes alone, never a name or a declared type: `pdf`; `docx`, `xlsx`, `pptx` and their macro-enabled twins (named by the plain twin); `odt`, `ods`, `odp`; `html`; `zip`; `text` (CSV and plain text). `clean:true` means the original carries nothing R2 or R6 removes and may travel whole. Otherwise the answer is a copy: `bytes` the copy, `images.stripped` and `images.unchanged` the counts of embedded images R2 changed and left as they were. CSV and plain text answer `clean:true`. Never throws.
- **R2** (T39; N806; K2315, K2333) No image in a copy carries more than `image-cover` R2 allows; each is stripped by `image-cover.stripMetadata`, its coded data unchanged. A PDF copy is the latest revision rewritten whole: no object unreachable from its trailer (so no earlier revision), no image `/Metadata`, every `/Thumb` image stripped. An OOXML or ODF copy is the same set of parts in the same order, with only image parts and R6's metadata parts changed, fixed timestamps and no extra fields.
- **R3** (T39; N806; K2333) Refusals by name, nothing answered but the refusal, `detail` naming the object, part or image at fault: `ENCRYPTED`; `EMBEDDED_FILE` (a PDF attachment, an OOXML `embeddings/` part or `vbaProject.bin`, an ODF embedded `Object N/`); `IMAGE_NOT_CLEANABLE` (a TIFF, HEIC, AVIF or JPEG XL image; an EMF or WMF image holding a JPEG or PNG; an SVG image with an `<image>` or `<metadata>` element; a PDF inline image with `DCTDecode`; a BMP with an ICC profile); `HTML_EMBEDS_IMAGE` (a `data:image` URI); `EMBEDDED_MEDIA` (K2351: a video, audio, PDF RichMedia or 3D part, whose own metadata can carry a time and place; refused, never carried); `ARCHIVE` (a `zip` that is not an OOXML or ODF package: a member-supplied archive is never carried, K2333); `NOT_A_CLEANABLE_FORMAT` (a format R1 does not name); `DOCUMENT_TOO_LARGE` (over `CLEAN_MAX_BYTES`, nothing read); `DOCUMENT_UNREADABLE` (the file's structure cannot be read whole); and each refusal of `image-cover.stripMetadata`, relayed under its own code. An image that cannot be stripped refuses the whole document.
- **R4** (T39; N806; K2333) It works within the plane's isolate (128 MB) for any file up to `CLEAN_MAX_BYTES` (16,777,216, 16 MiB, exported); its time and memory on a 16 MiB PDF and a 16 MiB OOXML file are measured in workerd by its own test and stated in the job's record.
- **R5** (T39; N806; K2333) (test) Each copy is checked independently: a PDF copy passes `qpdf --check` and opens in pdf.js; a package copy passes a reference unzip and opens in LibreOffice. The text `pdf-reader`, `office-readers` and `odf-reader` answer for the copy equals what they answer for the original, and no metadata R2 or R6 removes is present in the copy.
- **R6** (T39; N806; K2334) Every copy also carries none of the document's own metadata: a PDF's trailer `/Info` and its catalog's document-level XMP `/Metadata` removed; in OOXML, `docProps/core.xml` and `docProps/app.xml` emptied of the author, last-modified-by, company, manager, template, application and its version, revision, total editing time and every date, each part kept valid; in ODF, `meta.xml`'s corresponding fields (initial creator, creator, generator, template, editing cycles, editing duration and every date) removed, the part kept valid; and the names that mark who commented or edited: OOXML `docProps/custom.xml` removed, the author and initials of every comment and tracked change (Word's `w:author`/`w:initials`, PowerPoint's comment authors, Excel's comment authors) emptied; ODF annotations' and tracked changes' `dc:creator` and `dc:date` emptied; a PDF annotation's `/T` and `/M` removed; a PDF signature dictionary's `/Name`, `/Contents`, `/Location`, `/Reason`, `/ContactInfo` and `/M` removed, the field kept unsigned (the rewrite voids the signature in any case; K2346). Also (K2351): OOXML `xl/printerSettings/` and `customXml/` parts removed with their relationships; an EMF's description string emptied; an SVG's editor-namespace attributes and elements (Inkscape, Sodipodi, Adobe) removed; a JBIG2 stream's comment segments dropped; a legacy Excel comment's leading author run (the bold `Name:` Excel writes) removed from its text. The text, pages, pictures, comments' own text and the tracked changes themselves are unchanged (BOB's details, K2340). A file carrying neither image metadata (R2) nor document metadata answers `clean:true`.

## Private

### Uses

- `image-cover`: `stripMetadata` (R8) and its refusal codes.
- `pdf-reader`: `openPdf` (R30); `PdfDoc`'s `objects` (R37), `resolve`, `dictOf`, `streamRawBytes`, `streamDecoded`, `isEncrypted` (R20–R23).
- `ooxml`: `hasZipMagic` (R1), `readContainer` (R3), `readPart` (R5, R31), `crc32` (R4), `discriminate` with `CONTAINER_FLAVOURS` (R10–R13), `ODF_MIMETYPE_PART` and `ODF_MANIFEST_PART` (R14), `CORE_PROPERTIES_PART` (R18), `IMAGE_MIME_BY_EXT` (R20).
- `office-readers` and `odf-reader`: their entries' `text`, read by R5's test only (K2346).
- `test-support` for tests.

### Invariants

- **R7** (T39; N806; K2333) Pure and deterministic: the same bytes always give the same answer, byte for byte; no clock, no randomness, no I/O, no state between calls.
- **R8** (T39; N806; K2315) Never a partial copy: the answer is a whole copy meeting R2 and R6, `clean:true`, or a refusal.
- **R9** (T39; N806) No place is named in this module's code or in any refusal text.

### Satisfies

- Bob's K2315 (N806): an image embedded in a file a member uploaded leaves a published case without its metadata; a document captured from a public source is carried as captured (the caller's choice). Packaged by BOB's K2333.
- Bob's K2334 (N806 Q1: A): a member-supplied file's own metadata (author, editor, organisation, software, edit times, revision history) is removed from the published copy too (R6).
- The lineage of N779 and Bob's K2248: a published photo travels without its camera metadata, the group keeping the original.

### Suggestions

- PDF: open with `openPdf`, read `objects()`, and write a fresh file from the latest revision alone: only reachable objects, object streams expanded into top-level objects, a classic cross-reference table and trailer, renumbered in a fixed order. An image XObject whose `/Filter` is `DCTDecode` or `JPXDecode` is a whole JPEG or JP2 file: strip it with `stripMetadata` and rewrite its `/Length`. Drop `/Metadata` from image dictionaries and from the catalog, and `/Info` from the trailer.
- OOXML and ODF: write a fresh ZIP with every part in its original order, `mimetype` first and stored for ODF, fixed timestamps (e.g. 1980-01-01 00:00), no extra fields and no comment; parts not changed are re-written from their verified bytes (`readPart`), so the copy's structure owes nothing to the original's local headers.
- R6's emptied `docProps` parts keep their root elements and namespaces, so `ooxml.readCoreProperties` reads `null` for each removed field.
