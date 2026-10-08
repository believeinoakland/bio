# image-cover — requirements

**Status** · In force: written by BOB #138 at T37's opening (N757; DEC-180 (4), K2108), a helper module whose requirements are BOB's (K20, K70). Every requirement not yet met: T37.

## Public

### Purpose

Covers marked areas of a photo with solid colour and answers a new image carrying nothing of the original but its pixels, so a published case can carry a copy with faces and number plates obscured. Pure; it knows nothing of cases, storage or place.

### Provides

**`coverAreas(bytes, {areas}) → Promise of {ok:true, bytes, format, width, height, covered}` or `{ok:false, code, detail}`**
- **R1** For a baseline or extended-sequential Huffman 8-bit JPEG (the set `image-codecs` R1 decodes) or an 8-bit, non-interlaced PNG: each area `[x0, y0, x1, y1]` is in the image's pixels as displayed (its EXIF orientation applied). Every JPEG block, or PNG pixel, an area touches becomes one solid colour; the cover is snapped outward to whole blocks, never inward. Outside every area, a JPEG's blocks keep their coefficients unchanged (no re-compression loss) and a PNG's pixels are unchanged. `covered` counts the blocks or pixels covered. An empty `areas` answers a copy with nothing covered (R2 still holds). *(not yet met: T37)*
- **R2** The answer carries nothing of the original but its pixels: no EXIF, XMP, IPTC, comment or other metadata segment or chunk, no thumbnail, no second image or gain map, nothing after the image's end; only the orientation is kept (as a minimal EXIF holding Orientation alone, or by writing the pixels upright), with what decides how the pixel data decodes (JFIF's APP0 without a thumbnail, Adobe's APP14 transform flag, a PNG's palette and `tRNS`), written fresh; a colour profile is not carried, so a covered face is never visible in any part of the copy. *(not yet met: T37)*
- **R3** Refusals by name, nothing answered but the refusal: `NOT_A_COVERABLE_FORMAT` (neither format, e.g. HEIC); `UNSUPPORTED_JPEG_PROCESS` (progressive, arithmetic-coded, lossless or 12-bit); `PNG_INTERLACED`; `AREA_MALFORMED` (not four integers with `x0 < x1`, `y0 < y1`); `AREA_OUTSIDE` (an area wholly outside the image); `PHOTO_TOO_LARGE` (over `COVER_MAX_BYTES`, nothing read, or declaring more pixels than `COVER_MAX_PIXELS`, nothing decoded; both exported); `TRUNCATED_IMAGE_DATA` (the data ends before the image does); `IMAGE_DATA_CORRUPT` (the data cannot be read: a bad Huffman code or table, a wrong restart marker, a PNG CRC or zlib error), its `detail` naming the fault. Renaming or removing a code is a change to this requirement. *(not yet met: T37)*
- **R4** It works in the plane's isolate (128 MB): it streams, never holding a decoded frame of the whole image; its time and memory on a 12 MP and a 48 MP phone JPEG are measured in workerd by its own test and stated in the job's record. *(not yet met: T37)*
- **R5** Each answer is checked against an independent decoder (libjpeg-turbo or an equivalent reference for JPEG, a reference PNG decoder for PNG) over fixtures that carry the reference's hashes: the blocks or pixels outside every area equal the original's decode, each covered block or pixel is the cover colour, and no metadata of R2 is present; never against this module's own earlier output. *(not yet met: T37)*

## Private

### Uses

- `image-codecs`: `readJpegHeader` (the header and process it reads, and its refusal codes). `test-support` for tests.

### Invariants

- **R6** Pure: the same bytes and areas always answer the same bytes; no clock, no randomness, no I/O, no state between calls. *(not yet met: T37)*
- **R7** No place is named in this module's code or in any refusal text. *(not yet met: T37)*

### Satisfies

- DEC-180 (4) (Bob, K2108): the copy a published case carries shows the marked areas obscured; the design detail answering B97: Civicsmith obscures each marked area itself, with a solid cover, and no AI vision runs over the group's photos.

### Suggestions

- In the DCT domain: entropy-decode one MCU row at a time, set each touched block to a DC-only block (AC zero) of the cover colour, re-encode the Huffman data with the same tables (or optimal ones) and write a fresh container (SOI, the minimal APP1 if kept, DQT, SOF, DHT, SOS, data, EOI). For PNG: inflate and unfilter row by row, cover, filter and deflate (`pdf-worker/src/pagepixels.mjs`:706–831 has a PNG writer to read, not import).
- `bio-plane/src/image-cover/` keeps it inside the plane's bundle, where `case-carriage` calls it.
