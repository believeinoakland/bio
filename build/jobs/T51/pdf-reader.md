# pdf-reader (T51)

**Status** · session_01BSwp2Ci83HFnS5Q5bkRxry · depth 2 · WORKING · handled B1

## Completion (T51-7, R39)

**Entries applied.** T51-7: R39 met. `extractPdfStructure` now returns a top-level `metadata` (beside `images`/`active`): `{title?, source:"/Info"}`, `title` the `/Info` dictionary's `/Title` (the one `infoDict()` chooses for R10) decoded from its raw bytes (R38): UTF-16BE after `FE FF` (mark dropped, language-tag escape skipped), else PDFDocEncoding per ISO 32000-1 Annex D.2. No `title` key when `/Title` is absent, not a string, empty or whitespace-only. An undecodable title (odd-length or unpaired-surrogate UTF-16BE, an unclosed language tag, a byte PDFDocEncoding leaves undefined: 0x00–0x08, 0x0B, 0x0C, 0x0E–0x17, 0x7F, 0x9F, 0xAD) gives no `title` and `notes` gains `title_undecodable`. `metadata` is `null` with no readable `/Info` or an encrypted document. Code: `bio-plane/src/pdfstructure.mjs` (`decodePdfTextStrict`, `extractMetadata`). Tests: new `bio-plane/test/m/pdf-reader/metadata.test.mjs` (8 tests, all R39: exact literal/UTF-16BE/PDFDocEncoding readings, the controls the requirement lists, `/Info` choice by R10, never throws); `structure.test.mjs` R2 key list gains `metadata`.

**Reading note.** Read whole: the requirements, the entry, `pdfstructure.mjs`, `test/m/pdf-reader/pdf.mjs`, and the parts of `structure.test.mjs`/`text.test.mjs` that name R2/R9/R10 (key list, encrypted fixture). I did not read `build/layers.md`'s layer-1 contract whole (it has no pdf-reader-specific text; I grepped for it), and I ran the other pdf-reader tests without reading them.

**Deferred.** None.

**Found in other modules / stale artifacts.**
- `pdf-worker/dist/pdf-worker.bundled.mjs` (+ `.bundle.json`) is now stale (manifest §14): it embeds `pdfstructure.mjs`. `node pdf-worker/test/structure.test.mjs` fails 2 checks (R7 "every other field is extractPdfStructure's own, unchanged"; R10 "the structure fields are kept") only because the bundle's answer lacks `metadata`; with my change stashed the same file passes 83/0. BOB regenerates (`pdf-worker/`: `npm run build`) at the layer close; I did not.
- No pdf-worker test names `metadata`; once the bundle is rebuilt its `structure.test.mjs` wants no edit (it compares against `extractPdfStructure`).

**Tests and checks.**
- `node --test bio-plane/test/m/pdf-reader/ bio-plane/test/pdfstructure.test.mjs`: 86 pass, 0 fail (bio-plane/test/pdfstructure.test.mjs: 172 passed, 0 failed).
- Users of the service: `format-registry`, `doc-clean`, `file-safety`, `reading-pipeline`, `doctypes`, `budget-doctypes` tests: 351 tests, 350 pass, 0 fail, 1 skipped (pre-existing). `pdf-worker/test/`: 69 pass, 1 fail (the stale bundle, above). `pdf-pixels`' tests live in `pdf-worker/test/` and are in that run.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage shows no pdf-reader failure (39 of 39 ids named; the 6 failures listed are other modules' own not-yet-met ids); channels 0 failures.
- `node checks/ownership.mjs /home/user/bio pdf-reader tranche/T51 job/T51/pdf-reader`: 4 files changed; 0 failures.

Size (session_01KswWpSMer2zv2tpsG99AC5): test runs 9, module lines 3247

## J1 · COMPLETE

T51-7 done: R39 met (metadata {title?, source:'/Info'} in extractPdfStructure; title_undecodable note; null with no readable /Info or encrypted). pdf-reader tests 86/0; users' tests green except pdf-worker/test/structure.test.mjs R7+R10 (2 checks), red only because pdf-worker/dist/pdf-worker.bundled.mjs is stale (manifest §14): BOB regenerates at the layer close. checks/run: format, architecture, ownership 0 failures; pdf-reader coverage 39/39. Record: build/jobs/T51/pdf-reader.md.
