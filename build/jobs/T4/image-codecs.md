# Job record · T4 · image-codecs

Session: `session_01GytnXWpaAYBtTx3b9cEHwE` (IMAGE-CODECS #1). BOB: `session_01PcJjeNeDjQeced6Yphu5r9` (BOB #44), read from `origin/tranche/T4`.

## Status

**IN PROGRESS.** The K115 part is done and pushed for BOB's early merge (see "Early merge" below). The requirement-named tests (T4-0a) continue.

## Early merge (K115)

- `pdf-worker/src/ccittdecode.mjs` is a copy of the CCITT block of `pagepixels.mjs` (its lines 695–931: the code books, `BitReader`, `readRun`, `ccittDecode`, `b1`, `b2`), unchanged except for a header comment. `pagepixels.mjs` is untouched. It exports only `ccittDecode`, with the same signature and results as the copy in `pagepixels.mjs`, so `pdf-pixels` swaps its import with no other change. Checked against libtiff: all 19 fixtures in `test/codecs/fixtures/ccitt-variants.json` (G4, G3 one-dimensional, byte-aligned MH, and the scan page's own G4 stream) decode to libtiff's picture.
- **The JPX memory refusal key (N34):** `JPX_REFUSES["an image past the memory bound"]`. It is thrown as `JpxRefusal` code `UNSUPPORTED` with `feature` = that key and `detail` `{ working_set_bytes, bound_bytes, width, height, components }`, before any plane is allocated. Until `pdf-pixels` maps it, its existing mapping turns it into `UNSUPPORTED_FILTER`. `pdf-pixels`' `jpx.test.mjs` check "every refusal JPX_REFUSES declares was driven" fails until that job drives the new key. That is expected under K115.

## Questions and reports for BOB

- **Q1 · open: what R1, R4 and R7 mean by a refusal's "reason".** My best reading, on which I am building:
  - **R1** lists `UNSUPPORTED_JPEG_PROCESS`, `UNSUPPORTED_SAMPLES`, `TRUNCATED_IMAGE_DATA` and `DECODE_FAILED`. Those are `pdf-pixels`' `REFUSALS` reasons, not this module's. `DctRefusal` carries its own `code`: `NOT_A_JPEG`, `TRUNCATED`, `UNSUPPORTED_PROCESS`, `UNSUPPORTED_PRECISION`, `UNSUPPORTED_FRAME`, `CORRUPT_DATA`, `UNSUPPORTED_COMPONENTS`, `COMPONENT_MISMATCH`, `COLOR_TRANSFORM_CONFLICT`, `UNSUPPORTED_SAMPLING` or `UNSUPPORTED_ROTATION`, and `pdf-pixels`' `DCT_TO_REFUSAL` maps each code to one of the four. I test R1 as: every refusal is a `DctRefusal` whose code is one of these eleven, and the four named reasons are what `pdf-pixels` maps them to. **Recommendation:** reword R1 to name the codec's own codes. I have not added a `DCT_REFUSES` export, because that would change a provided service (R7 speaks of "that codec's declared refusal set", and today the DCT codec declares none).
  - **R4, R7 (JPX and JBIG2):** "a key of `JPX_REFUSES`/`JBIG2_REFUSES`" is the `feature` of an `UNSUPPORTED` refusal. The other codes (`UNSUPPORTED_SAMPLES`, `TRUNCATED`, `CORRUPT`) are classes a decode can fail in, not features, and they carry no key. I test R4 and R7 that way.
  - **R2 (CCITT)** declares no refusal set. It refuses by throwing an `Error` (mixed mode, or a row that cannot end), and `pdf-pixels` maps any throw to `DECODE_FAILED`. I keep that, so the copy stays a drop-in.
- **R1 · report: generated artifact stale.** `ocr-worker/dist/ocr-worker.bundled.mjs` inlines `jpxdecode.mjs`, which this job changed (N34, and the memory work below), so it is stale until BOB regenerates it at the layer close. `pdf-worker`'s own bundle does not include the codecs.
