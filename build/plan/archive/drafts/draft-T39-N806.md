# N806 — packaging design (draft for BOB, T39's opening)

**Status** · Drafted by a worker for BOB #143, reviewed by BOB (K2333). BOB's packaging, adopted for T39's opening: §2 and §3 as written. Q2 is moot (K2309: no case has been published). Q1 answered A by Bob (K2334): a member-supplied document's own metadata is removed too (doc-clean R6 below).

Sources: K2315, K2248; `current.md` rule 8; `modules.json`; requirements of image-cover, image-codecs, pdf-reader, pdf-pixels, ooxml, office-readers, odf-reader, format-registry, file-safety, provenance, capture, case-grammar, case-carriage, case-disclosures, publication, public-read, ratification. Code checked: `file-safety/index.mjs`:71, 506–521; `provenance/index.mjs`:960–975; `case-carriage/index.mjs`:196, 430–500; `case-authoring/index.mjs`:651.

## 1. Facts

**File kinds that can hold images.** `format-registry` R23 knows ten formats: `html`, `pdf`, `docx`, `xlsx`, `pptx`, `odt`, `ods`, `odp`, `csv`, `zip`. The macro-enabled twins are read as their plain twins (`office-readers` R33). These can hold images:
- **PDF:** image XObjects (`pdf-reader` R16, R32). A `DCTDecode` stream is a whole JPEG, with any EXIF, XMP, IPTC or COM segments it carries. A `JPXDecode` stream can carry JP2 `xml`/`uuid` boxes. An image dictionary can carry its own `/Metadata` (XMP). Pages can have `/Thumb` images, attached files (R5) and inline images. Earlier revisions survive incremental updates.
- **OOXML:** `word/media`, `ppt/media` and `xl/media`, plus `docProps/thumbnail.*`, `embeddings/` and `vbaProject.bin`. `ooxml` R20 lists the images it can find: png, jpg, gif, bmp, tif, svg, webp, emf, wmf, emz, wmz.
- **ODF:** `Pictures/`, `Thumbnails/thumbnail.png` and embedded `Object N/` (`odf-reader` R30).
- **HTML:** `data:image` URIs.
- **ZIP:** its members.
- **No images:** CSV and plain text carry none.
- **Unknown kinds** (`undetermined`, e.g. .doc, .rtf, .msg): no reader can say whether they hold images.

The doorbell takes any bytes (`capture` R30).

**Member-supplied vs captured from a public source.** No record field says "uploaded". What the record does hold is how each capture arrived: the acquisition receipts in `provenance`'s `captured_locators`, with their `via` (R15, R60 `receiptsOfCapture`, R48).
- **Fetched by this copy:** `direct` (which includes Drive and render), `archive.org` or `capture-request`. This is `file-safety`'s R6 source condition, coded as `FETCHED_VIAS` (`file-safety/index.mjs`:71) and `#sourceOf` (506–521).
- **Cut from an archive** (`unpacked`, `provenance` R59): takes its archive's answer.
- **Everything else:** a pulled knock (`via: "doorbell"`, `provenance` R51) or a capture with no receipt (`route: "unrecorded"`, R26: "a member's upload", the custody arm of `provenance-routes`). These are not fetched.
- The product has no separate upload route yet (`sources` Suggestions: "hand-carried … built with the upload redesign"). `acquisition`'s `profileOf` `origin: "member"` exists only as a profiling hint.

**What image-cover does today.** It handles only baseline or extended-sequential 8-bit Huffman JPEG and 8-bit non-interlaced PNG (R1). It decodes the image and re-encodes it, and with no areas it answers a copy carrying nothing but the pixels and the orientation (R2). It refuses HEIC, progressive and arithmetic JPEG, 12-bit, interlaced PNG, oversize, truncated and corrupt files by name (R3). It never sees inside a PDF or a ZIP.

No module writes a PDF or a ZIP. `pdf-reader`, `ooxml`, `office-readers` and `odf-reader` are pure readers. The only ZIP writer is test-only (`test-support/make-zip.mjs`).

## 2. Proposed packaging (BOB's, P17)

1. **Who counts as a member upload.** A capture counts as member-supplied when `provenance`'s new R62 `fetchedByThisCopy(captureSha)` answers `fetched: false`. R62 is `file-safety`'s source condition lifted into `provenance`, so the rule has one definition, and `file-safety` R6 reads it from there. In practice:
   - a pulled knock is cleaned (fail closed, and more protective of sources);
   - a capture with no receipt is cleaned;
   - a file cut from a member's archive is cleaned;
   - a capture that has any fetch receipt is carried as captured (K2315).
   Photos are unchanged: always a copy (rule 8).
2. **New L1 module `doc-clean`** (pure, plane isolate, order: right after `image-cover`; it uses `image-cover`, `pdf-reader` and `ooxml`). `cleanDocument(bytes)` does one of three things:
   - it answers `clean` when no image in the file carries metadata, and the original then travels whole and verifiable;
   - it answers a rewritten copy whose every image carries nothing but its pixels (`image-cover`'s new strip);
   - it refuses by name.
   For PDF it does a full rewrite of the latest revision: only reachable objects, object streams expanded, a classic xref. That drops old revisions, image `/Metadata` and the metadata in `/Thumb` images. For OOXML and ODF it writes a fresh ZIP with fixed timestamps and no extra fields, with `mimetype` first and stored. The document's own metadata (`/Info`, XMP, `docProps`, `meta.xml`) is left as it is, pending Q1.
3. **`image-cover` gains `stripMetadata`.** It removes metadata at the level of segments, chunks or boxes and never re-encodes the image: JPEG of any process, PNG (interlaced too), GIF, WebP and JP2/J2K. The coded data is copied byte for byte, and the result meets R2.
4. **`case-carriage` orchestrates and carries,** because it already holds the photo copies under `<store>/obscured/<sha>`, which `ratification` R39 copies from unchanged.
   - It queues every receipt that is not a fetch (a `provenance.onReceipt` listener), and also every miss read at preparation.
   - `copyBatch`, on the scheduler's wake, derives the copies and holds them as R11 holds a photo's copy.
   - `documentCopy(sha)` reads the state synchronously, for `case-disclosures` R6. This is needed because preparation and the commit are synchronous transactions (`case-authoring`:651).
5. **The case row.** It reuses `obscured: {copy, label}` (`case-grammar` R12) with `label` set to `COPY_CLEANED_LABEL`. That means no new case-file kind and no `bio-case-file/4`. The document's extracted text is not carried, as for a photo. `public-read` R23 and the case-checker departures read as they do for any copy.
6. **Refusals and fail-closed handling.**
   - `doc-clean` refuses with `ENCRYPTED`, `EMBEDDED_FILE` (PDF attachments, `embeddings/`, `vbaProject.bin`, ODF objects), `IMAGE_NOT_CLEANABLE` (TIFF, HEIC, AVIF, JXL; EMF/WMF holding a JPEG or PNG; SVG with `<image>` or `<metadata>`; inline DCT; BMP with an ICC profile), `HTML_EMBEDS_IMAGE`, `NOT_A_CLEANABLE_FORMAT` (undetermined), `DOCUMENT_TOO_LARGE`, `DOCUMENT_UNREADABLE`, and relays `image-cover`'s strip refusals.
   - **Load-bearing material:** `case-disclosures` refuses with `DOCUMENT_NOT_CLEANABLE`, naming the document and the reason, or with `DOCUMENT_COPY_PENDING` while the copy is being derived.
   - **Supporting-only material:** listed `included: false` with no copy.
   - **At the commit:** `case-carriage` R13 treats as lapsed any member document carried whole that needs a copy, and any copy that is no longer the current one. `publication` refuses with the new C-122.7 `DOCUMENT_COPY_CHANGED_SINCE`.
   - **Archives:** a member-supplied archive is carried for no material.
   - **Text:** CSV and plain text are `clean`.

## 3. Draft requirements *(not yet met: T39)*

**doc-clean (new, L1).**
- R1 `cleanDocument(bytes) → {ok:true, clean:true, format}` | `{ok:true, clean:false, bytes, format, images:{stripped, unchanged}}` | `{ok:false, code, detail}`. The format is judged from its magic bytes: pdf, docx/xlsx/pptx and their twins, odt/ods/odp, html, zip, csv/plain text.
- R2 A copy holds no image carrying more than `image-cover` R2 allows. A PDF copy is the latest revision rewritten whole, with no unreachable object, no image `/Metadata` and every `/Thumb` stripped. A package copy is the same set of parts with only image parts changed, and with fixed timestamps and no extra fields.
- R3 Its refusals are named as in §2.6. An image it cannot strip refuses the whole document; it never answers a partial copy.
- R4 Pure and deterministic: the same bytes give the same answer. It works within the 128 MB isolate up to `CLEAN_MAX_BYTES` (16 MiB, exported), measured in workerd.
- R6 *(K2334, Bob's Q1: A)* A member-supplied document's copy also carries none of the document's own metadata: PDF `/Info` and document-level XMP removed; OOXML `docProps/core.xml` and `docProps/app.xml` emptied of author, last-modified-by, company, manager, template, revision, total time and dates (kept valid); ODF `meta.xml` likewise; text, pages and pictures unchanged. A file with neither image metadata nor document metadata answers `clean`.
- R5 Independent check: `qpdf --check` and pdf.js for PDF output, and a reference unzip and LibreOffice open for packages. The text answered by `pdf-reader` and the office readers is the same for the copy as for the original, and no metadata segment is present.

**image-cover.**
- R8 `stripMetadata(bytes) → {ok:true, bytes, format, changed}` | refusal. JPEG of any process, PNG, GIF, WebP and JP2/J2K. Every segment, chunk or box R2 forbids is removed, and what decides how the pixels decode is kept. The coded data is byte-identical to the original's.
- R9 (test) For each format, a reference decoder's pixels for the output equal those for the input.

**pdf-reader.**
- R37 `PdfDoc.objects()` answers every object reachable from the latest trailer, as `{num, gen, value}`, with the trailer itself. It never throws.

**provenance.**
- R62 `fetchedByThisCopy(captureSha) → {fetched, routes, archive}`. It is the source condition of `file-safety` R6, verbatim, including R59's walk of archives up to three levels deep. `file-safety` R6 is amended to read it.

**case-carriage.**
- R15 A **member document** is a document capture that is not a photo and for which R62 answers `fetched: false`. Its copy is derived by `doc-clean.cleanDocument` from the evidence store, queued from each receipt that is not a fetch and from each miss, by `copyBatch({limit})`, with `copyWake(now)` as `file-safety` R39. It is held as R11 holds a photo's copy: never registered, never a capture.
- R16 `documentCopy(captureSha)` answers synchronously `{state: public | clean | copy | refused | pending, copy, refused}`.
- R1, R8, R13 amended:
  - a member document needing a copy is carried only as its copy (`obscured`, `COPY_CLEANED_LABEL`);
  - a member-supplied archive is carried for no material;
  - R13 answers lapsed `{kind: "document"}` rows.
- New C-141 rows as needed. `scheduler` adds the edge and calls `copyBatch` on `copyWake`.

**case-disclosures.** R6 gets a member-document arm, in this order:
1. unreadable state → `DOCUMENT_COPY_UNDETERMINED`;
2. `pending` → `DOCUMENT_COPY_PENDING` (load-bearing material only);
3. `refused` → `DOCUMENT_NOT_CLEANABLE` (load-bearing material) or `included: false` (supporting material);
4. `copy` → `included: false` with `obscured: {copy, COPY_CLEANED_LABEL}`;
5. `clean` or `public` → as before.

R7 writes the copy row. Each new C-120 row gets a BOB-drafted translation (`document.refused.clean`, `document.refused.pending`) that the UX stream may re-word.

**case-grammar.** R12/R14 wording: `obscured` names "a material carried as its copy: a photo (R11) or a member document's cleaned copy (R15)". No format change.

**publication.** R57: C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` on R13's document rows.

**public-read.** R23 wording: "each material carried as its copy".

**Tests**
- **doc-clean:** a fixture per kind with EXIF and GPS in an image, checked absent and the pixels equal; a PDF with an incremental update (the old image gone); `/Thumb`; JPX `xml` box; inline DCT, attachment, encryption, TIFF, EMF with JPEG and SVG with `<image>` (each refused); a clean PDF answers `clean`; determinism; size measured.
- **image-cover:** per format, a strip test against the reference decoder, and a progressive JPEG.
- **provenance:** each route (direct, archive, doorbell, unrecorded, unpacked from a fetched archive and from a member archive).
- **case-carriage:**
  - a fetched PDF is held whole;
  - a knock PDF with EXIF is carried as its copy only (no original byte, no archive);
  - a refused cover;
  - a pending copy;
  - R13's lapse;
  - queueing from a receipt.
- **case-disclosures:** each arm with a load-bearing chain and with only supporting chains reaching it.
- **publication:** the C-122.7 commit refused, plus a negative control.
- **public-read:** a document copy is served and its original never is.

## 4. Bob's questions

- **Q1. The document's own metadata.** K2315 covers embedded images only. The author, the software and the revision history in `/Info`/XMP, `docProps` and `meta.xml` of a member's own file can name the member. Should a member-supplied document's own metadata also be removed?
  - A: yes, for member-supplied files only (recommended: one more step in `doc-clean`);
  - B: no.
  It changes what members see published, so it is Bob's.
- **Q2. Editions already published.** These carry member documents whole, and published bytes are append-only (`case-carriage` R6). A: leave them (recommended if none exists in production, which this worker cannot check). B: a takedown path. This carries legal exposure, so it is Bob's.

BOB's own decisions, not Bob's (P17): treating a knock as member-supplied, the list of refusals, the reuse of `obscured`, and the case's extracted text not carried for a copy.

## 5. Size (code lines in `modules.json` paths)

- **New:** doc-clean, about 1,200–1,800 lines.
- **image-cover:** 793 lines, about +400.
- **pdf-reader:** 3,108 lines, +about 60. **Near the limit; the PDF writer stays out of it.**
- **ooxml:** 2,017 lines, no change.
- **provenance:** 2,730 lines.
- **file-safety:** 2,258 lines.
- **case-carriage:** 984 lines, about +350.
- **case-disclosures:** 1,972 lines.
- **case-grammar:** 2,329 lines.
- **publication:** 3,799 lines. **Near the limit; small change only.**
- **public-read:** 3,538 lines. **Wording only.**
- **ratification:** 3,540 lines, unchanged.
- **scheduler:** 724 lines.
- **office-readers:** 3,816 lines, untouched.
