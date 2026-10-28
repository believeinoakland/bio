# image-cover (T53)

**Status** · session_018BhcecpR3Z1ErVEX6eAheX · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-28)

# image-cover · T53 · IMAGE-COVER #1 · report

## Entries applied

**T53-57 · A4 (DEC-460) · `redrawPicture`, `photoFactsOf`, strict strings** (R12, R13, R14)

- `redrawPicture(bytes)` (`redraw.mjs`): a JPEG (image-codecs' strip-wise decoder, never rotated) or a PNG (image-codecs' PNG decoder, alpha over white) is decoded to 8-bit grey or RGB and written as a fresh PNG: IHDR, the original's colour profile only when it passes R14, IDAT, IEND. Answers `{ok, bytes, format: "png", width, height, orientation (as read, not applied), profile_kept, left_out}` or a refusal by the module's existing codes (progressive JPEG `UNSUPPORTED_JPEG_PROCESS`, interlaced PNG `PNG_INTERLACED`, truncation, corruption, `PHOTO_TOO_LARGE`; `IMAGE_TOO_LARGE` for a decoded frame over `picture_frame` or an answer over `redraw_bytes`).
- `photoFactsOf(bytes)` (`photo.mjs`, `photo-exif.mjs`, `photo-text.mjs`): `{ok:true, facts, left_out}`, async and never throwing; the closed list of kept fields (names in the test); strings strict UTF-8, control and bidi characters removed, cut to bound; every field range-checked; EXIF, IPTC, the listed XMP properties (EXIF, then IPTC, then XMP, whatever the file's order), a JPEG comment, PNG text (tEXt, zTXt, iTXt). `left_out` is the closed kind set in order: thumbnail, maker_note, profile, extra_picture, after_end, xmp, credentials, other_metadata, unreadable, each with count and bytes; a bare image lists none.
- The strict profile check (`photo-icc.mjs`): size equals bytes and within `PHOTO_PROFILE_MAX`, class `mntr`, space `RGB `, version 2 or 4, tag count within bound, every tag inside the profile and past the table, none partly overlapping; reads only the header and tag table. The check also refuses an RGB profile on a grey picture (a PNG grey image takes no RGB profile).
- New read-bounds rows (all protective, BOB's to move): `image.redraw_bytes` 32 MiB, `photo_profile_max` 1 MiB, `photo_profile_tags` 256, `photo_exif_bytes` 1 MiB, `photo_directory_entries` 1024, `photo_field_chars` 256, `photo_text_chars` 4096, `photo_list_items` 64, `photo_xmp_bytes` 256 KiB, `photo_inflated_bytes` 256 KiB. The file is runtime-limits' (see below).
- Tests: `redraw.test.mjs` (R12, R14, R6), `photo.test.mjs` (R13, R6), `measure-redraw.test.mjs` (R12 in workerd), fixtures made by `fixtures/make-photo-fixtures.py` with Pillow's hashes in `photo-cases.json`. `coverAreas` and `stripMetadata` are unchanged (the existing 23 tests pass; `fromDct` gained the `IMAGE_TOO_LARGE` mapping and `png.mjs` exports `filter`).

**T53-58 · K5565 · English in tests.** The census row for image-cover (0 literal, 0/0/1 regex) is one class-C site: the `PLACE` regex in `cover.test.mjs` and `strip.test.mjs`, a list of place names the answers must not contain; it is test input, kept as data. The words check's baseline holds no image-cover file and reports `testenglish 0`; the tests I added hold no sentence (they read keys, values and counts). Nothing to lower in the baseline.

## Measured (workerd, `measure-redraw.test.mjs`; synthetic 4 bits/pixel photographs)

| photo | redraw | facts |
|---|---|---|
| 12 MP (5.8 MB) | ok, about 3.2 s, peak growth 80.7 MB, answer 26.7 MB | ok, 6 MB |
| 48 MP (23.3 MB) | `IMAGE_TOO_LARGE` from the header (frame 145 MB over `picture_frame` 37.7 MB), 0.5 MB | ok, 24 MB |

## Decisions of mine (BOB's level; none changes a requirement's words)

1. The redrawn picture is always a PNG (lossless: pixels equal the original's decode). A JPEG's answer is therefore large (26.7 MB for the 12 MP test photograph); `redraw_bytes` at 32 MiB leaves a real 12 MP phone photograph room.
2. ICC "none overlapping": tags that name one and the same range are one shared tag's data and pass (Display P3's rTRC, gTRC, bTRC are one range); a partial overlap or a tag inside another's range fails. Refusing identical ranges would refuse Apple's own Display P3.
3. "Neutralised" text: markup such as `<script>` stays as plain characters (the screen draws it escaped); control, bidi and invisible format characters are removed. An EXIF string is cut to its bound when slightly over it and omitted (counted `unreadable`) when far over; a Latin-1 string is not UTF-8 and is dropped.
4. A failed profile still gives `profile_colour_space` and, when its `desc` tag reads inside its own range, `profile_description` (the A4 table says "name and colour space given").
5. exiftool is not installed in the container; the facts fixtures are the values the script wrote, read back through Pillow's EXIF reader where Pillow reads it. Say if exiftool is wanted as a second reference.

## Found in other modules

- **runtime-limits.** `read-bounds.mjs` is its file; BOB had the ten rows merged (K5603), my copy is dropped.
- **image-codecs.** A 48 MP JPEG cannot be redrawn: `decodeBaselineJpegRows` is synchronous, so the rows cannot be deflated as they come and the whole filtered frame (W x H x 3) is held; `picture_frame` (4096 x 3072 x 3) therefore refuses a 48 MP photograph. An async or generator form of the strip decode (or a bit-exact `onRows` that may be awaited) would let the redraw stream; that is the module's change, described against its R11.
- **Generated artifacts.** The plane bundle (`bio-plane/dist` and the other bundles that include image-cover) is stale by this change; `proc merge` regenerates and verifies it.
- **Coverage failures on the tranche** (other modules' ids named by no test: reader-container, register-readers, runtime-limits R37-R47, signatures, test-support R29, text-chain, others) and the three `fixtures-run` contract orphans in store-assembly are inherited, not mine.

**Met** · R12, R13, R14

Tests: 50/50. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcecpR3Z1ErVEX6eAheX): test runs 1, module lines 2319
