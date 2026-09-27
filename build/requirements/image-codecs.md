# image-codecs — requirements

## Public

### Purpose

Pure image decoders: an image stream's bytes to samples, pixel-exact against an independent reference decoder, or a declared refusal. It knows nothing of PDF, PNG, storage or place.

### Provides

**`decodeBaselineJpeg(d, {rotate, expectComps, colorTransform}) → samples`, `readJpegHeader(d)`, `colourTransformOf(h)`, `DctRefusal`** (`dctdecode.mjs`)
- **R1** Decodes a baseline or extended-sequential Huffman, 8-bit JPEG to 8-bit samples bit-exact with libjpeg (ISLOW IDCT, fancy chroma upsampling, fixed-point YCbCr, libjpeg's colour-transform rule, which `colourTransformOf` states for a header). Anything else throws a `DctRefusal` whose reason is one of `UNSUPPORTED_JPEG_PROCESS`, `UNSUPPORTED_SAMPLES`, `TRUNCATED_IMAGE_DATA`, `DECODE_FAILED`, as the bytes require.

**`ccittDecode(data, {K, columns, rows, byteAlign}) → packed 1-bit rows`** (`ccittdecode.mjs`)
- **R2** Decodes CCITT Group 3 one-dimensional (`K = 0`) and Group 4 (`K < 0`) data to packed 1-bit rows, one per decoded row. Mixed mode (`K > 0`) is refused. A stream that cannot be read is refused; a stream ending early returns the rows decoded, so the caller can see fewer rows than it declared.

**`decodeJbig2(data, globals) → samples`, `JBIG2_REFUSES`, `Jbig2Refusal`** (`jbig2decode.mjs`)
- **R3** Decodes JBIG2 embedded streams, with their `JBIG2Globals`: at least generic and generic-refinement regions, symbol-dictionary and text regions, MMR/Huffman and arithmetic coding; pattern and halftone regions where built (K43). What it cannot decode throws a `Jbig2Refusal` whose reason is a key of `JBIG2_REFUSES`, naming the feature (the segment type).

**`decodeJpx(d) → samples`, `JPX_REFUSES`, `JpxRefusal`** (`jpxdecode.mjs`)
- **R4** Decodes a JPEG 2000 codestream or JP2 file. What it cannot decode throws a `JpxRefusal` whose reason is a key of `JPX_REFUSES`, naming the feature.

**`MqDecoder`, `mqContexts(n)`** (`mq.mjs`)
- **R5** The MQ arithmetic decoder (ITU-T T.88 Annex E, T.800 Annex C) shared by R3 and R4: the same bytes and context states decode the same decisions as the standard's reference procedure.

**All codecs**
- **R6** Each decode is checked pixel-exact against a named independent decoder over fixtures that carry the raw stream and the reference's hash (libjpeg-turbo for R1, jbig2dec for R3, OpenJPEG for R4; CCITT against the page fixtures' reference hashes), never against this module's own earlier output.
- **R7** A refusal's reason is a key of that codec's declared refusal set; renaming or removing a key is a change to this requirement.

## Private

### Uses

None (`test-support` for tests).

### Invariants

- **R8** Pure: the same bytes and options always answer the same way; no clock, no randomness, no I/O, no state carried between calls.
- **R9** No place is named in this module's code or in any refusal text; it holds no jurisdiction data.

### Satisfies

- `BIO_Content_Framework_v0_10.md` §16, "The non-text path, in three tiers": the pixel decode tier 3 reads through.
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 (D-320, the DCT decoder).

### Suggestions

- The CCITT decoder is today in `pagepixels.mjs` (about lines 696–931: its tables, `BitReader`, `readRun`, `b1`, `b2`, `ccittDecode`); the split job moves it to `ccittdecode.mjs`, leaving `getBit`/`setBit` with rotation in `pdf-pixels`, which imports `ccittDecode` from here.
- The fixtures under `pdf-worker/test/fixtures/` already hold each raw stream and its reference hash (`stream_b64`/`globals_b64` with `jbig2dec_sha256`; `data_b64` with `opj_sha256`; the DCT variants likewise): direct decoder tests in `pdf-worker/test/codecs/` can be written from them.

---

**Status** · Written by BOB #44, 2026-09-27, applying K70 (`build/extraction/pdf-worker-split.md` §3): R1 from pdf-worker R22, R2 from R23, R3 from R25 (K43), R4 from R25, R6 from R40's second sentence; R5, R7–R9 new. Layer 1. Not yet met as a module: the CCITT decoder is not yet moved and no test names these ids (T4, entry T4-0a).
