# pdf-pixels (T44)

**Status** · session_01HryQFWAv5MrBMYBBygXxEJ · depth 2 · WAITING ON BOB (J2) · handled B2

### Work (kept current by the job)

**Reading set** (mechanics §17): read whole — `roles/JOB.md`, `build/manifest.md`, `build/requirements/pdf-pixels.md`, the public parts of `image-codecs` (with R1's and R11's text), `pdf-reader` and `test-support` as named in my Uses, layer 1's contract and the helper-module note in `build/layers.md`, my plan entry and "Rules at the opening", `draft-T44.md` § N868, K2701, K2702, K2719, K1888, my T43 record, and the module's code and tests: `pagepixels.mjs`, `picturepixels.mjs`, `imagecrop.mjs`, `pagepixels-worker.mjs`, `pagepixels.test.mjs`, `imagecrop.test.mjs`, `jbig2.test.mjs`, `jpx.test.mjs`, both probes and `make-picture-fixtures.py` (plus `dctdecode.mjs`, image-codecs', for R11's design). About 240 KB as BOB measured, under 600 KB. I read my own code and tests whole, not only what I changed (P20, plan rule 2).

**Flaws found in my own module by the whole read, fixed here:** `REFUSALS.NO_IMAGE_ON_PAGE`'s text said "the page references no image XObject", which R17 (K27) contradicts: the reason is about what the page PAINTS (an inline image counts, a listed but unpainted XObject does not). Now "the page paints no image" (R39's text is the key's own, so nothing else reads it; only the bundles carry the old words). The T43 `finish()` pass and its full-size decode are gone: the PNG path now runs through the same strip reducer, fed its one decoded frame.

**Built against** R11's interface as K2737 words it, with a LOCAL stand-in `decodeBaselineJpegRows` (R1's full decode handed over in 16-row strips) in my tree only, never committed, until IMAGE-CODECS #5 publishes; the tests then run against the real one.

**Fixture (T44):** `picture-variants.json` gains `photo48`: a Pillow-made seed JPEG, 8064 × 128 (8 MCU rows, a restart marker after each), 97 KB; the 48 MP file is its rows' entropy runs laid out by `make-picture-fixtures.py`'s rule, RSTn renumbered, the height set to 6048 and an Exif orientation inserted. The test assembles the same bytes and checks their SHA-256 (the script's) before any picture; every expected digest is Pillow 12.3.0's over the assembled file (orientations 1, 3, 6, 8; grey at `maxEdge` 1568, k = 6; colour at 2000, k = 5, partial edge boxes of 4 columns and 3 rows).

## J1 · QUESTION

Readings I am building on; I carry on with them unless you answer otherwise. None blocks me.
1. **R11's strip, as I consume it** (image-codecs is not published yet, so I build against the interface R11 states): `onRows(rows, y0, count)` hands a `Uint8Array` of `count` rows, each `width × comps` bytes, interleaved exactly as R1's `samples` (`rotate: 0`), `y0` the first row's index in the unrotated frame; `rows` may be reused by the decoder after `onRows` returns (I copy nothing out of it beyond the row sums). The width, height and comps I read from `readJpegHeader` before the call. If image-codecs publishes a different shape, I adapt to it.
2. **`PICTURE_FRAME_MAX` on the reduced frame** counts `ceil(width/k) × ceil(height/k) × components` with the header's components (3 for a colour JPEG even when `grey`), the literal reading; it can only refuse more, never less, than the output grey frame needs. With the plane's `maxEdge` 1568 it is never reached.
3. **`PICTURE_SOURCE_MAX`'s yardstick.** Decoded strip-wise, memory no longer grows with the frame beyond the input bytes and one MCU row, so the bound is set by CPU time: I measure ms per megapixel for the 48 MP decode and set the bound so the largest admitted frame stays well inside the Workers paid default of 30 s CPU per invocation (no `cpu_ms` is set in `bio-plane/wrangler.jsonc`), with the input bytes and the plane object's own share counted against the 128 MB. The figure and its margin go in my record.
4. **Partial edge boxes under 5–8** (draft doubt 4): each source axis gets its own box map, reversed where the orientation reverses it, so a partial box falls on the source edge that Pillow's oriented right/bottom edge comes from; the 6 and 8 tests pin it, and 2, 4, 5, 7 are pinned by the existing small variants run through the new path.

## J2 · REPORT

Progress; one thing I need: a ring (CHANGE) when image-codecs R11 is published on job/T44/image-codecs or merged.
- B2 applied: tranche/T44 merged into my branch (R11's K2737 wording).
- R42's T44 clause built and pushed: a JPEG is read through `decodeBaselineJpegRows`, each row summed (grey when asked) into the one band of reduced boxes it falls in; the boxes are mapped per source axis, reversed where the orientation reverses it. PNG unchanged in judgement (full frame against PICTURE_FRAME_MAX), now fed through the same reducer.
- Built against a LOCAL stand-in of R11 (R1's decode handed over in 16-row strips), never committed. With it, pagepixels.test is 382/0: the 48 MP JPEG (8064 × 6048, a 97 KB Pillow-made seed assembled in the test and checked against the script's SHA-256) at orientations 1, 3, 6, 8, grey (k = 6) and colour (k = 5, partial edge boxes), pixel-exact against Pillow 12.3.0; the 4032 × 3024 photo 1008 × 1344, 155,814 B, same hash; the source bound and the reduced-frame bound each refused before decode beside a control; PNG over the frame bound refused beside an equal-size JPEG that is not. imagecrop 54/0, jbig2 179/0, jpx 205/0; content 132/0; plane ask, t33, t42, t43 (R36) 13/16/18/6, 0 fail; ocr-worker 198/1 (its stale bundle only, §14).
- Still to do once R11 is published: the peak-RSS measure of the real strip-wise decode, and so PICTURE_SOURCE_MAX's final figure (CPU so far ~70–90 ms per megapixel, 3.3–4.2 s for 48 MP in node).
- Fixed in my own module from the whole read: NO_IMAGE_ON_PAGE's text now says what R17 means ("the page paints no image").
