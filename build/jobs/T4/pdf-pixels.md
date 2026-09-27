# T4 · pdf-pixels — job record

**Session** PDF-PIXELS #1, `session_012XRqCG31gxW9i9Uyf3x6KX`, on `job/T4/pdf-pixels` (from `tranche/T4` @ `f290c217aa`). Process: civicos-process `roles/JOB.md`, mechanics §6, §13, §16. Entry: T4-0b (`build/plan/current.md`), sequenced by K115.

## Baseline

Before any change, run by file from the repository root: `pagepixels.test.mjs` 173/0, `imagecrop.test.mjs` 54/0, `jbig2.test.mjs` 179/0, `jpx.test.mjs` 197/0. Coverage: 24 of 25 live ids named (R41 not). Architecture, ownership, format: 0 failures.

## Status

**Part 1, the tests (done, commit below).** **Part 2 waits on BOB's CHANGE** that `image-codecs` (with `ccittdecode.mjs` and the JPX memory refusal key) is on `tranche/T4` (K115): then the CCITT block leaves `pagepixels.mjs` for an import of `ccittDecode`, and the new key is mapped.

## Part 1 · tests (T4-0b)

- **R41** new, in `pagepixels.test.mjs`: no refusal text (`REFUSALS`, `CROP_REFUSALS`) and no answer the file drives names a place; no place in the module's three source files with comments removed (layers.md rule 6, the reading pdf-worker's R38 test uses), with a control that the reading does see one.
- **R22** the DCT variant corpus (12 decodable, 4 refused) now goes through `renderPageToPixels` with `decodeDct` and each variant's turn as the page's `/Rotate`, checked against Pillow's hash, instead of calling `image-codecs`' decoder directly (that is `image-codecs`' test now); the unrotated picture of the scan is checked by re-wrapping the pass-through bytes on an unrotated page.
- The CCITT stream the suite re-wraps is read through `pdf-reader`'s services (`openPdf`, `pdfPageImages`, `imagePlacementSource`), not this module's internal `analyzePage`.
- Test headers cite `build/requirements/pdf-pixels.md`.
- `pagepixels-corpus.probe.mjs` read `doc._pageOrder`, a private field of `PdfDoc` (against N9); it reads `pageCount` (pdf-reader R19).

## Questions to BOB

### Q1 · 2026-09-27 · which `REFUSALS` reason the JPX memory key maps to (R25)
R25 lets the module map a codec refusal key to a `REFUSALS` reason other than `UNSUPPORTED_FILTER`. Every key today maps to `UNSUPPORTED_FILTER` (the codec lacks a feature). A decode that would exceed the isolate's memory is not a missing feature. **My reading, on which I carry on:** add one reason to `REFUSALS`, `IMAGE_TOO_LARGE` ("decoding the image would need more memory than a decode may use here"), and map N34's key to it, carrying the codec's feature and measured figures in the detail; every other key stays `UNSUPPORTED_FILTER`. Callers pass reasons through (`ocr-worker` wraps any render refusal as `PAGE_NOT_RENDERABLE` with the reason and its `why`), so nothing downstream branches on it. The alternative is `UNSUPPORTED_FILTER` naming the feature, which adds nothing to the vocabulary.
