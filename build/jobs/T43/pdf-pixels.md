# pdf-pixels (T43)

**Status** · session_019UE5f9dE91LZQFBmRUVev4 · depth 2 · COMPLETE · handled B3

### Work (kept current by the job)

**Reading set** (mechanics §17): read whole — `roles/JOB.md`, `build/manifest.md`, `build/requirements/pdf-pixels.md`, the public parts of `image-codecs` (with R10's text), `pdf-reader` and `test-support`, layer 1's contract in `build/layers.md`, my plan entry and "Rules at the opening", `draft-T43-n853b.md`, K2611, K2691, K1888, and the module's code (`pagepixels.mjs`, `imagecrop.mjs`, `pagepixels-worker.mjs`) and `pagepixels.test.mjs`: about 99 KB, under 300 KB, as BOB measured.

**Files outside the listed paths (plan rule 2, K1043):** `pdf-worker/src/picturepixels.mjs` (paths); `pdf-worker/test/fixtures/picture-variants.json` and `pdf-worker/test/fixtures/make-picture-fixtures.py` (tests). The tests themselves are in the listed `pagepixels.test.mjs`.

**`PICTURE_FRAME_MAX` measured** (node 22, this container, `--expose-gc`, one process per run; peak RSS over the process's own baseline):

| run | file | time | peak over baseline |
| --- | --- | --- | --- |
| `decodeBaselineJpeg` alone, 4032×3024 RGB 4:2:0, turned 90 | smooth fixture, 467 KB | 498 ms | 83.1 MB |
| the same | noisy camera-like, q92, 7.6 MB | 896 ms | 78.0 MB |
| `renderPictureToPixels` whole (grey, 1,568 px), before the one-pass fix | smooth / noisy | 1,059 / 1,219 ms | 96.4 / 90.9 MB |
| the same, after grey, mirror and reduction became one pass | smooth / noisy | 774 / 1,126 ms | 91.8 / 92.2 MB |

The decoder's live working set, counted from its buffers: the component planes, the upsampled chroma and the output, 6.5 bytes per pixel at 4:2:0 (79.2 MB for 12.19 MP), 7 at 4:2:2, 6 at 4:4:4, 2 for grey: **6.5–7 MB per colour megapixel live**, 6.8–7.6 MB per megapixel by peak RSS (which also counts garbage not yet collected). Everything after the decode adds only the reduced output (1.35 MB at 1,008×1,344).
**Bound chosen: 4096 × 3072 × 3 = 37,748,736 samples (12.6 MP colour).** It admits the 12-megapixel cameras (4032×3024, 4000×3000, 4080×3072) and holds the decoder's live set at or under 88 MB (4:2:2's worst ratio), leaving about 40 MB of the plane object's 128 MB for the input bytes and the object's own state. A higher bound would put a 4:2:2 13+ MP decode within reach of the isolate's limit with nothing measured for the object's own share; 24 and 48 MP pictures are refused `IMAGE_TOO_LARGE` until a decode that reduces as it goes (T44, N868, K2701).

### Completion

**Entries applied:** T43-5 (N853b; K2611, K2691, K2701): R42 `renderPictureToPixels` in `pdf-worker/src/picturepixels.mjs` (refusals `NOT_A_PICTURE`, `NO_SUCH_PAGE` with `pageCount: 1`, `IMAGE_TOO_LARGE` from the header against the exported `PICTURE_FRAME_MAX`; JPEG codec refusals mapped as R22 maps them, PNG ones as R25 maps JBIG2's and JPX's, total over `PNG_REFUSES` and exported as `PNG_REFUSAL_REASONS`; decode, orient, grey, Pillow's `reduce(k)`, an 8-bit PNG; never the file's bytes); R43 EXIF orientation 1–8 as Pillow reads it, EXIF only (K2701), a PNG never turned; R39: `NOT_A_PICTURE` added to `REFUSALS`. `pagepixels.mjs` exports `encodePng8`, `DCT_TO_REFUSAL` and `featureReasons` for it. Grey, mirror and reduction are one pass, so nothing full-size is made beside the decoder's output (the measurement above).
**Built against** `job/T43/image-codecs` @ 8f32c7f36d (`pngdecode.mjs`, its J2 COMPLETE), placed in the tree for the runs and not committed here; merge `tranche/T43` once image-codecs is merged.
**Deferred:** none in this module. A larger bound waits on a decode that reduces as it goes (N868, T44; K2701).
**Found in other modules:** image-codecs R1: `decodeBaselineJpeg` holds both upsampled chroma planes beside its output (24.4 MB of 79 MB at 12 MP); converting colour row by row would cut its live set to about 4.5 bytes per pixel (J2). ocr-worker's bundle (and pdf-worker's, if it takes `pagepixels.mjs`) is staled by `pagepixels.mjs` (§14): ocr-worker R19's manifest test is red until L1's close regenerates it.
**Tests:** `pagepixels.test.mjs` 362 passed, 0 failed (R42/R43: 28 Pillow 12.3.0 variants, every orientation, every reduction path, the 4032×3024 Orientation-6 photo → 1008×1344 grey, 155,814 B; each refusal beside its control; three pictures in workerd); `imagecrop` 54/0, `jbig2` 179/0, `jpx` 205/0. Users: content 132/0; plane t42, t33, ask (R36) 47/0; ocr-worker 198/1 (the stale bundle only).
**Checks:** format 0 failures; coverage 27 of 27 live ids, 0 failures; architecture 1 failure and ownership 3, all the three new files not yet in `modules.json` (`pdf-worker/src/picturepixels.mjs` to paths; `pdf-worker/test/fixtures/picture-variants.json`, `pdf-worker/test/fixtures/make-picture-fixtures.py` to tests), cleared when BOB adds them (plan rule 2, K1043).
**After B3 (CHANGE, K2702):** merged `tranche/T43` (image-codecs merged; its `pngdecode.mjs` byte-identical to the one built against). Re-run: pagepixels 362/0, imagecrop 54/0, jbig2 179/0, jpx 205/0; content 132/0, plane R36 files 47/0, ocr-worker 198/1 (the stale bundle, regenerated at L1's close). Checks: format, architecture, coverage (27/27) and ownership each 0 failures. The PNG reference already composites over white with `Image.alpha_composite` before `convert("L")`, as B3 notes.
Size (session_019UE5f9dE91LZQFBmRUVev4): test runs 29, module lines 401

## J1 · QUESTION

Three readings of R42/R43 I am building on; I carry on with them unless you answer otherwise.
1. R42's bound, "width × height × components from the header": for a PNG, components are the channels its IHDR colour type declares (grey 1, grey+alpha 2, RGB 3, palette 3 as expanded, RGBA 4); for a JPEG, the SOF's component count. Conservative for alpha PNGs; it never under-counts what R10 allocates.
2. A `maxEdge` that is not a positive integer is a caller's error and throws a TypeError, not an `ok:false` answer (so R39's set is not widened by a programming mistake). `grey` defaults to false.
3. R43 "unreadable tag counts as 1": read as Pillow's `exif_transpose` reads it — the first APP1 "Exif" segment, IFD0, tag 0x0112 of an integer type (BYTE, SHORT, LONG, SSHORT, SLONG), its first value; a value outside 1–8, a non-integer type or a cut block is 1. Pillow also falls back to an XMP `tiff:Orientation` when EXIF has none; R43 says EXIF only, so that is not read (a known, stated divergence from Pillow on that one input).
Status: the JPEG path is built and pixel-exact against Pillow 12.3.0 on 58 cases (every orientation, every reduction path, the 4032×3024 Orientation-6 photo: 1008×1344 grey, 156 KB). PICTURE_FRAME_MAX measured and set at 4096×3072×3 (record will say why). The PNG path waits on image-codecs R10's `pngdecode.mjs` being published on job/T43/image-codecs (not there yet).

## J2 · REPORT

Progress and findings; nothing here needs an answer except the last line.
- JPEG path done and pushed (abea7bc42f): R42/R43 pixel-exact against Pillow 12.3.0 on every orientation 1–8 (both byte orders, LONG type, cut and out-of-range tags, the XMP-only divergence named in its test per K2701), every reduction path (k = 2, 3, 4, 5, 6+, partial edge boxes), grey and colour, and the 4032×3024 Orientation-6 photo (1008×1344 grey, 156 KB). Every refusal with its control. pagepixels.test: 332 pass; the 20 reds are the PNG cases, waiting on R10.
- Measurement and bound are in my record (§ Work): 6.5–7 MB live per colour megapixel, the bound 4096×3072×3.
- Files outside my paths (plan rule 2): `pdf-worker/src/picturepixels.mjs`; tests-side `pdf-worker/test/fixtures/picture-variants.json`, `pdf-worker/test/fixtures/make-picture-fixtures.py`. Until they are added, architecture (pagepixels.test imports picturepixels.mjs, read as pdf-worker's) and ownership (those three files) each report exactly that.
- Another module's artifact staled (§14): `ocr-worker/dist/ocr-worker.bundled.mjs` (its input `pagepixels.mjs` changed: three exports and the NOT_A_PICTURE key), red in ocr-worker's R19 manifest test (198 pass, 1 fail); pdf-worker's bundle likewise if it includes pagepixels. Regenerated at L1's close per the plan.
- Users' tests otherwise green: content 132/132, plane t42/t33/ask (R36) 47/47.
- An improvement in image-codecs (R1, for N868): `decodeBaselineJpeg` keeps both full-size upsampled chroma planes and the output at once (24.4 MB of its 79 MB at 12 MP). Converting colour row by row from the subsampled planes, as libjpeg's own context rows do, would cut the live set to about 4.5 bytes per pixel and lift a safe bound by about 40% with no change to its output.
Waiting: please ring me when `pngdecode.mjs` is on job/T43/image-codecs (or merged); I have no timer to poll with.

## J3 · COMPLETE

T43-5 done; the record's § Completion has the detail.
- R42, R43 met: JPEG and PNG paths, pixel-exact against Pillow 12.3.0 (28 variants, the 4032×3024 Orientation-6 photo → 1008×1344 grey, 155,814 B), each refusal with its control, three pictures also in workerd. pagepixels.test 362/0; imagecrop 54/0, jbig2 179/0, jpx 205/0.
- PNG built against job/T43/image-codecs @ 8f32c7f36d (`pngdecode.mjs` placed for the runs, not committed). I will merge tranche/T43 and re-run when you tell me image-codecs is merged.
- **New files for `modules.json` (plan rule 2):** paths `pdf-worker/src/picturepixels.mjs`; tests `pdf-worker/test/fixtures/picture-variants.json`, `pdf-worker/test/fixtures/make-picture-fixtures.py`. Until then architecture reports 1 failure and ownership 3, all these files; format 0, coverage 27/27.
- PICTURE_FRAME_MAX = 4096×3072×3, measured (6.5–7 MB live per colour megapixel), per K2701.
- Users: content 132/0, plane R36 files 47/0; ocr-worker 198/1, its bundle staled by pagepixels.mjs (regenerated at L1's close).
