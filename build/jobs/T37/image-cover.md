# image-cover (T37)

**Status** · session_01A8wyDuP1JUCkDvsGN291AL · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three readings of R1–R3 I am building on; each needs only a yes, or the other option.

1. **Damaged data has no code in R3** (a Huffman code past 16 bits, a missing table, a wrong RSTn, a PNG CRC or zlib error). My reading: refused `TRUNCATED_IMAGE_DATA`, its `detail` naming the fault (the data cannot be read through to its end). Alternative: a new code `IMAGE_DATA_CORRUPT` (a change to R3, yours).
2. **Colour data is dropped with the metadata** (R2 strictly: "nothing of the original but its pixels"): an ICC profile (APP2 `ICC_PROFILE`; PNG `iCCP`, `sRGB`, `gAMA`, `cHRM`) is not carried. Kept, freshly written and minimal, only what decides how the pixel data decodes: JFIF's APP0 marker (no thumbnail) or Adobe's APP14 transform flag, the PNG palette and `tRNS`. Effect: a Display P3 phone photo shows slightly less saturated in a colour-managed viewer. Alternative: carry the ICC profile (it names a colour space, not a person).
3. **No pixel cap.** A small file can declare a huge image (a zlib bomb in a PNG). The JPEG path stops at the first MCU row past the data's end, so only PNG is exposed; R3 has no code for it, so my reading is none: the plane's CPU limit ends such a call. Suggestion: `COVER_MAX_PIXELS` under `PHOTO_TOO_LARGE` (a change to R3).

Module-level choices, mine, recorded in my record: `coverAreas` answers a Promise (PNG's deflate in workerd is `CompressionStream`); `COVER_MAX_BYTES` = 32 MiB; `width`/`height` are as displayed (the areas' frame); for a JPEG the cover is snapped outward to whole MCUs, so luma and chroma cover the same pixels, and `covered` counts the 8x8 blocks of every component so covered; the cover colour is black (JPEG luma well inside the saturating range, chroma zero, so every IDCT gives 0); a PNG's covered pixels are opaque black (an added or darkest opaque palette entry for indexed PNGs); 8-bit means bit depth 8 (other PNG bit depths refused `NOT_A_COVERABLE_FORMAT`).
