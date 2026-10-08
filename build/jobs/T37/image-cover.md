# image-cover (T37)

**Status** · session_01A8wyDuP1JUCkDvsGN291AL · depth 2 · WORKING · handled B2

## Reading set (mechanics §17, N739)

Read whole: `build/requirements/image-cover.md` (as at START, and as amended by K2173), the plan's T37 Rules at the opening and entry T37-39, DEC-180 in `docs/development/DECISIONS.md`, layer 1's contract in `build/layers.md`, `image-codecs`' Public part (Purpose, Provides) and `pdf-worker/src/dctdecode.mjs` whole (its `readJpegHeader`, 560 lines), `pdf-worker/src/pagepixels.mjs`:700–835 (the PNG writer the Suggestions name, read, not imported), and every line of the code and tests I wrote. Under the 300 KB limit.

## Entries applied (T37-39)

New module `image-cover`, every requirement R1–R7 met, with B2's answers (K2173) applied: `IMAGE_DATA_CORRUPT`, `COVER_MAX_PIXELS`, no colour profile carried.
- **Paths:** `bio-plane/src/image-cover/` (`index.mjs` the interface, `jpeg.mjs` the DCT-domain path, `png.mjs` the row-streamed path, `geometry.mjs` the areas, orientation and the one EXIF field kept). **Tests:** `bio-plane/test/m/image-cover/` (`cover.test.mjs` R1 R2 R3 R5 R6 R7, `measure.test.mjs` R4, `answers.mjs` the independent read-back, `fixtures/` with `make-fixtures.py` and `cases.json`). BOB fills the `modules.json` row (B1).
- **JPEG (R1):** entropy-decoded one MCU at a time into coefficients; every block of each MCU an area touches becomes a DC-only black block; every other block is re-coded coefficient for coefficient; two passes (count symbols, then write with optimal Huffman tables, jchuff.c's algorithm), since a phone's optimised tables can lack the symbols a cover's DC differences need. Restart intervals kept and renumbered. Sampling, component and scan limits are image-codecs R1's set.
- **PNG (R1):** inflated, unfiltered, covered, re-filtered with each row's own filter type and deflated, a row at a time (`DecompressionStream`/`CompressionStream`); 8-bit colour types 0, 2, 3, 4, 6.
- **R2:** a fresh container: JPEG SOI, a bare JFIF APP0 or Adobe APP14 flag if the original had one, an EXIF APP1 holding Orientation alone (26-byte TIFF, no next IFD) only when not upright, DQT, SOF, DHT, DRI, SOS, data, EOI, nothing after; PNG IHDR, eXIf (Orientation alone), PLTE, tRNS, IDAT, IEND, nothing after.
- **R3:** all nine codes, `COVER_REFUSALS` exported with a sentence each; order: bytes over `COVER_MAX_BYTES`, then the areas' shape, then the format, the header (process, pixels over `COVER_MAX_PIXELS`), the areas against the picture, the data.
- **R5:** `fixtures/make-fixtures.py` builds real-shaped photos (a phone JPEG held sideways with EXIF make, GPS, sub-IFD and IFD1 thumbnail, XMP, ICC, a comment, an MPF index with a gain-map second image after EOI, trailing bytes; a screenshot PNG with text, XMP, eXIf, iCCP, an APNG second frame and trailing bytes; every EXIF orientation, 4:2:0, 4:2:2, 4:4:4, grey, optimised tables, quality 100, Adobe APP14, palette with and without room, grey-alpha, split IDAT). `cases.json` carries Pillow 12.3.0 / libjpeg-turbo 3.1.4.1 / zlib 1.3's hash of each ORIGINAL's displayed decode with the cover's rectangles (computed there from the geometry) zeroed, the cover rectangles and the covered count. The test decodes each answer (JPEG by image-codecs' libjpeg-exact decoder, PNG by node zlib and the standard's unfiltering) and must reach that hash, and black inside. The generator also checked every answer with Pillow itself once (all agreed); no answer of the module is recorded. Fixtures are byte-stable across re-runs.

## Detail decisions (BOB's to record in `rulings.md`, P17)

- `coverAreas` answers a Promise (R1 amended, K2173). `width`/`height` are as displayed (the areas' frame).
- `COVER_MAX_BYTES` = 32 MiB (photo + answer + working set inside 128 MB); `COVER_MAX_PIXELS` = 120,000,000 (admits 12/48/50/108 MP, refuses a 200 MP full-resolution file).
- The JPEG cover is snapped outward to whole MCUs, so luma and chroma cover the same pixels (no band of original luma under flat chroma); `covered` counts 8x8 blocks of every component.
- Cover colour black: luma DC chosen deep in the saturating range (level about -256, never past the 8-bit DC difference limit; at DC quantiser 1, level -128), chroma DC 0; every IDCT answers (0,0,0). With subsampled chroma, fancy upsampling mixes chroma across a covered MCU's edge over one pixel each side; the coefficients outside are unchanged, the tests' bleed margin is that one pixel.
- PNG cover: opaque black; an indexed PNG uses an opaque black entry, else one appended if the palette has room, else its darkest opaque entry; a colour key equal to black makes the cover grey 1. Other PNG bit depths refused `NOT_A_COVERABLE_FORMAT` (R1 "8-bit").
- A foreign marker inside the scan reads as the data ending there (libjpeg's rule): `TRUNCATED_IMAGE_DATA`; a wrong RSTn, a bad Huffman code, a missing table, a DC or AC value past 8-bit range, a PNG CRC, zlib or filter-type error, `IMAGE_DATA_CORRUPT`. The JPEG path stops at the first MCU row past the data's end.

## R4: measured in workerd

Miniflare (workerd), `measure.test.mjs`: phone JPEGs tiled from the strip fixture (4:2:0, about 4 bits a pixel, denser than a phone's), orientation 6, three faces and a plate covered. Time: the request less the same body's echo. Memory: workerd's peak resident set during the request (`VmHWM` after `clear_refs`) less its resident set before; body, answer, working set and uncollected garbage together. Three runs:

| photo | bytes | answer | time | peak memory growth |
|---|---|---|---|---|
| 12 MP (4032 x 3024) | 5.8 MB | 5.2 MB | 1.0–1.2 s | 10–19 MB |
| 48 MP (8064 x 6048) | 23.3 MB | 21.0 MB | 3.7–4.6 s | 43–48 MB |

The growth is the photo and the answer (a decoded 48 MP frame alone would be 145 MB); the cover's own working set is one block and two pixel rows. The time is CPU in the request; case-carriage's call should expect about 5 s for a 48 MP photo.

## Found in other modules (REPORT J2)

- `image-codecs`: `image-cover` reads the Huffman tables `readJpegHeader` answers (`hts.dc[i]`/`hts.ac[i]`: `maxcode`, `valptr`, `mincode`, `symbols`, `fast`, `FAST`); image-codecs R1 names `readJpegHeader` but not that shape. Suggestion: R1 states it (or `image-cover` parses DHT itself). No generated artifact is stale: nothing imports `image-cover` yet (case-carriage, T37-34, will).

## J1 · QUESTION

Three readings of R1–R3 I am building on; each needs only a yes, or the other option.

1. **Damaged data has no code in R3** (a Huffman code past 16 bits, a missing table, a wrong RSTn, a PNG CRC or zlib error). My reading: refused `TRUNCATED_IMAGE_DATA`, its `detail` naming the fault (the data cannot be read through to its end). Alternative: a new code `IMAGE_DATA_CORRUPT` (a change to R3, yours).
2. **Colour data is dropped with the metadata** (R2 strictly: "nothing of the original but its pixels"): an ICC profile (APP2 `ICC_PROFILE`; PNG `iCCP`, `sRGB`, `gAMA`, `cHRM`) is not carried. Kept, freshly written and minimal, only what decides how the pixel data decodes: JFIF's APP0 marker (no thumbnail) or Adobe's APP14 transform flag, the PNG palette and `tRNS`. Effect: a Display P3 phone photo shows slightly less saturated in a colour-managed viewer. Alternative: carry the ICC profile (it names a colour space, not a person).
3. **No pixel cap.** A small file can declare a huge image (a zlib bomb in a PNG). The JPEG path stops at the first MCU row past the data's end, so only PNG is exposed; R3 has no code for it, so my reading is none: the plane's CPU limit ends such a call. Suggestion: `COVER_MAX_PIXELS` under `PHOTO_TOO_LARGE` (a change to R3).

Module-level choices, mine, recorded in my record: `coverAreas` answers a Promise (PNG's deflate in workerd is `CompressionStream`); `COVER_MAX_BYTES` = 32 MiB; `width`/`height` are as displayed (the areas' frame); for a JPEG the cover is snapped outward to whole MCUs, so luma and chroma cover the same pixels, and `covered` counts the 8x8 blocks of every component so covered; the cover colour is black (JPEG luma well inside the saturating range, chroma zero, so every IDCT gives 0); a PNG's covered pixels are opaque black (an added or darkest opaque palette entry for indexed PNGs); 8-bit means bit depth 8 (other PNG bit depths refused `NOT_A_COVERABLE_FORMAT`).
