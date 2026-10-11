# image-codecs — requirements

## Public

### Purpose

Pure image decoders: an image stream's bytes to samples, pixel-exact against an independent reference decoder, or a declared refusal. It knows nothing of PDF, storage or place; PNG it reads as an input (R10) and writes none.

### Provides

**`decodeBaselineJpeg(d, {rotate, expectComps, colorTransform}) → samples`, `readJpegHeader(d)`, `colourTransformOf(h)`, `DctRefusal`** (`dctdecode.mjs`)
- **R1** Decodes a baseline or extended-sequential Huffman, 8-bit JPEG to 8-bit samples bit-exact with libjpeg (ISLOW IDCT, fancy chroma upsampling, fixed-point YCbCr, libjpeg's colour-transform rule, which `colourTransformOf` states for a header). Anything else throws a `DctRefusal` carrying its own `code` and a `detail` that says why (which process, which sampling, where the data ran out); `pdf-pixels` maps each code to its own reasons. (T38; N782, K2179) `readJpegHeader(d)` answers the frame's header with its Huffman tables: `hts.dc[i]` and `hts.ac[i]` for each table id `i`, each `{maxcode, valptr, mincode, symbols, fast, FAST}` as R1's decoding reads them, the fields' types and lengths stated by a test that pins them; `image-cover` reads them (its R1), so changing that shape is a change to this requirement. (T44; N868; K2702) `decodeBaselineJpeg` converts colour row by row from the subsampled planes, as libjpeg's context rows do, never holding a full-size upsampled chroma plane beside its output; its output is unchanged, bit-exact with libjpeg (R6). Its live set at 4:2:0 is at most about 4.5 bytes per pixel (PDF-PIXELS #4 J2), and the job measures and records it for 4:2:0, 4:2:2, 4:4:4 and grey. *(not yet met: T44)*

**`ccittDecode(data, {K, columns, rows, byteAlign}) → packed 1-bit rows`** (`ccittdecode.mjs`)
- **R2** Decodes CCITT Group 3 one-dimensional (`K = 0`) and Group 4 (`K < 0`) data to packed 1-bit rows, one per decoded row. Mixed mode (`K > 0`) is refused. A stream that cannot be read is refused; a stream ending early returns the rows decoded, so the caller can see fewer rows than it declared.

**`decodeJbig2(data, globals) → samples`, `JBIG2_REFUSES`, `Jbig2Refusal`** (`jbig2decode.mjs`)
- **R3** Decodes JBIG2 embedded streams, with their `JBIG2Globals`: at least generic and generic-refinement regions, symbol-dictionary and text regions, MMR/Huffman and arithmetic coding; pattern and halftone regions where built (K43). What it cannot decode throws a `Jbig2Refusal`: an unsupported feature as code `UNSUPPORTED` whose `detail.feature` is a key of `JBIG2_REFUSES` (the segment type), and damaged or short data under the codec's own codes.

**`decodeJpx(d) → samples`, `JPX_REFUSES`, `JpxRefusal`** (`jpxdecode.mjs`)
- **R4** Decodes a JPEG 2000 codestream or JP2 file. What it cannot decode throws a `JpxRefusal`: an unsupported feature as code `UNSUPPORTED` whose `detail.feature` is a key of `JPX_REFUSES`, and damaged or short data under the codec's own codes. A decode whose working set would pass the memory bound is refused as the feature "an image past the memory bound" before any allocation, with the working set, the bound and the image's size in `detail` (N34).

**`MqDecoder`, `mqContexts(n)`** (`mq.mjs`)
- **R5** The MQ arithmetic decoder (ITU-T T.88 Annex E, T.800 Annex C) shared by R3 and R4: the same bytes and context states decode the same decisions as the standard's reference procedure.

**All codecs**
- **R6** Each decode is checked pixel-exact against a named independent decoder over fixtures that carry the raw stream and the reference's hash (libjpeg-turbo for R1, jbig2dec for R3, OpenJPEG for R4, Pillow over PngSuite for R10 (T43); CCITT against the page fixtures' reference hashes), never against this module's own earlier output.
- **R7** Every `UNSUPPORTED` refusal's feature is a key of that codec's declared set (`PNG_REFUSES` for R10, T43), and every key is reachable; renaming or removing a key, or a refusal code, is a change to this requirement.

- **R10** (T43; N853b; K2611, K2691) `decodePng(bytes) → Promise<samples>`, `PNG_REFUSES`, `PngRefusal` (`pngdecode.mjs`): colour types 0, 2, 3, 4 and 6 at every legal depth, filters 0–4, IDAT inflated by `DecompressionStream("deflate")`, to 8-bit samples (alpha composited over white, 16-bit to its high byte, a palette expanded). An interlaced image, or a frame over the memory bound before allocation, is `UNSUPPORTED` with a `PNG_REFUSES` key; damaged or short data is refused under the codec's own codes. Pixel-exact against Pillow over PngSuite (R6).
- **R11** (T44; N868; K2701, K2702) `decodeBaselineJpegRows(d, {expectComps, colorTransform, onRows})` decodes the same JPEGs as R1, with the same refusals (`DctRefusal`, the same codes and details), one MCU row at a time, top to bottom, never rotating. It hands each strip's finished 8-bit rows to `onRows(rows, y0, count)` in order; joined, they equal R1's output with `rotate: 0`, byte for byte, for every sampling R1 decodes. It holds no full-size plane: its live set is the input, one MCU row of coefficients and samples per component with the context rows, and the strip being handed over; the job states that bound and measures it. *(not yet met: T44)*

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

**Status** · In force: written by BOB #44 applying K70 (a helper module, its requirements BOB's, K20), split from `pdf-worker` (R1–R4 and R6 from its R22, R23, R25, R40; R5, R7–R9 new). Every requirement met (layer 1 closed, K284; R4's working set K281).
