# pdf-pixels (T51)

**Status** · session_01EMUJKMcGCYN27SUYGwANcd · depth 2 · COMPLETE · handled B13

## J1 · REPORT

Two of the 27 plain findings are not sentences a member reads; they stay unconverted and BOB decides them (the design's `unkeyed` list, K3944):

- `pdf-worker/src/pagepixels.mjs:119` and `pdf-worker/src/picturepixels.mjs:60`: "an image past the memory bound". It is the mapping key of the JPX and PNG codecs' feature refusals (`featureReasons(…, { "an image past the memory bound": "IMAGE_TOO_LARGE" })`), matched by exact equality with the codec's declared feature names (image-codecs R25, R42). A key is a wire string, not a sentence: a word row for it would change the key the mapping matches, so it must not be read through `localize`. Not shown to a member; the member sees `IMAGE_TOO_LARGE` and its `why`.

## J2 · COMPLETE

**T51-257 applied.** The 27 `plain` findings in `build/plan/words-pass/pdf-pixels.md`:

- 25 converted to `localize("pdf-pixels.<stem>.<slug>", en[, vars])`, the slug the first five words of the sentence: `pagepixels` 13 refusal `why`s in `REFUSALS` and 4 refusal `note`s (the inline-image, JBIG2-globals, JBIG2 bit-depth and colour-space notes); `imagecrop` 8 refusal `why`s in `CROP_REFUSALS`. The import is `../../bio-plane/src/setup-words/index.mjs` (`pagepixels.mjs` already had it).
- 2 left and REPORTed (above): the codec mapping key "an image past the memory bound" at `pagepixels.mjs:119` and `picturepixels.mjs:60`.
- Tests: each new id is named by a test (`WORD_IDS` in `pagepixels.test.mjs` and `imagecrop.test.mjs`, a dotted-id and uniqueness check). A test cannot read a sentence through `localize` without holding its text, which the marker arm then flags, so the tests name the ids and the `R39` checks already compare each `why` with its key's text.
- Commit `b24c52a795` on `job/T51/pdf-pixels`, pushed.

**Deferred:** none. **Found in another module:** none.

**Read for the job:** `build/requirements/pdf-pixels.md` (whole, both parts); the T51-257 entry and rule 11 in `build/plan/current.md`; the findings file (whole); the layer 1 row of `build/layers.md`; the `setup-words` source (`index.mjs`, whole); the module's four source files. I did not read `build/plan/current.md` or `build/layers.md` whole (181 KB and 23 KB, the plan's bulk outside my entry).

**Tests run** (module suites, all 0 failed): `pagepixels.test.mjs` 383 passed; `imagecrop.test.mjs` 55 passed; `jbig2.test.mjs` 179 passed; `jpx.test.mjs` 205 passed. The two corpus probes (`pagepixels-corpus.probe.mjs`, `agenda-scan-census.probe.mjs`) were not run: they need the Oakland corpus, which is not in this container.

**Checks** (scoped to `pdf-pixels`, from `civicos-process` at 27aa50e):
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio pdf-pixels`: 16 product files, 38 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio pdf-pixels`: 27 of 27 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio pdf-pixels tranche/T51 job/T51/pdf-pixels`: 5 files changed by pdf-pixels; 0 failures.
- `checks/words.mjs /home/user/bio pdf-pixels`: 2 `plain` findings remain, both the REPORTed mapping key; `marker` 0, `inline` 2 (the same two), `testcopy` 0.
- `checks/run.mjs /home/user/bio` was run as the step asks: it reports repo-wide failures in other modules (4822 total, mostly `testcopy` in `wizard-scripts`); none is in pdf-pixels beyond the two above.

So the words check is not yet clean for this module: the two REPORTed keys read as `plain` until BOB decides them. Everything else reads zero.

Size (session_01CDmjLZR4AnXcUoKjGVUyEk): test runs 11, module lines 1400

## J3 · COMPLETE

**B2 and B3 applied** (CHANGE K3971, K3972; image-codecs merged, `tranche/T51` merged into the job branch, not rebased).

- `pagepixels.mjs` and `picturepixels.mjs` now key `IMAGE_TOO_LARGE` by the codecs' exported `MEMORY_FEATURE` (`jpxdecode.mjs`, `pngdecode.mjs`), not the English literal. The REPORT on those two keys is resolved by this change.
- `jpx.test.mjs` (the two lines that named the feature) and `pagepixels.test.mjs` (the PNG mapping check) compare with `MEMORY_FEATURE`. The three testcopy findings are gone.
- Commit `298f179e25` on `job/T51/pdf-pixels`, pushed.

**Tests** (all 0 failed): `pagepixels.test.mjs` 383; `imagecrop.test.mjs` 55; `jbig2.test.mjs` 179; `jpx.test.mjs` 205. Corpus probes not run (corpus not in the container).

**Checks** (scoped to `pdf-pixels`):
- `checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio pdf-pixels`: 16 product files, 36 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio pdf-pixels`: 27 of 27 live requirement ids named by a test; 0 failures.
- `checks/words.mjs /home/user/bio pdf-pixels`: 0 failures (`plain` 0, `inline` 0, `testcopy` 0, `marker` 0). This clears the words findings this job carried.
- `checks/ownership.mjs /home/user/bio pdf-pixels tranche/T51 job/T51/pdf-pixels`: 5 files changed by pdf-pixels; 0 failures.

Size (session_01CDmjLZR4AnXcUoKjGVUyEk): test runs 15, module lines 1400

## J4 · COMPLETE

**FR-42 entry 1 (L26, K4194) applied.** R44 is written in `build/requirements/pdf-pixels.md` by me (B5/B6), and its tests name it, so it carries no "not yet met" mark.

**What I built** (`pdf-worker/src/picturepixels.mjs`): `renderPictureToPixels(bytes, 0, {maxEdge, grey, prepare: true})` (prepare implies grey; without it the answer is R42's, Pillow-exact, unchanged). `preparePicture` does, in this order: (1) smooth the grain and level the light (paper per cell from the brighter half of its pixels, divided out, then stretched so the paper reads 255); (2) find the tilt of the text lines over ±10° (row-profile sharpness, 0.25° then 0.05° steps); (3) measure the median text-line height and, if under 40 px, enlarge by the factor that reaches 40 (at most 4×, never past `maxEdge`), turn and enlarge in one bicubic resampling. A picture with no text lines (blank wall, noise) is handed on as R42 made it with `prepared.text_found:false`, so the engine is not given marks made from noise. The answer adds `prepared:{text_found, tilt_deg, scale, line_px}`. Exports: `PREPARE_TILT_MAX` 10, `PREPARE_TILT_FLOOR` 0.1, `PREPARE_LINE_PX` 40, `PREPARE_SCALE_MAX` 4, `preparePicture`.

**Fixtures:** `make-picture-fixtures.py` now also writes `pages` into `picture-variants.json` (the existing variants are byte-identical on re-run): a printed page photographed from formulas (tilt, reduction, uneven light, low contrast, blur, congruential-generator noise): clean, 2.4° tilt, 110 dpi, noise with shade, two combinations (2.4° and -3.1°, 110 dpi, noise, shade, blur), big text, and a blank picture.

**THE FLOOR, PROPOSED FOR BOB TO CONFIRM: 90 percent of a photographed page's words, per page.** How I measured it: the real engine (tesseract-wasm 0.11.0 + the tessdata_fast model, as `ocr-worker` pins them) reads each fixture; the share is the page's own words found, once per occurrence, case and punctuation ignored. Prepared / unprepared: clean 100/100, 2.4° tilt 100/99, 110 dpi 100/100, noise+shade 97/0, combined A 100/26, combined B 100/23, big text 100/100. So on the fixtures the preparation takes the degraded pages from 0, 26 and 23 percent to 97, 100 and 100. **Caveat for BOB:** these are synthetic photographs of clean printed text. They show the preparation is the cause and what it can do; they do not say what real phone photographs will read at. The walk's real pages read at 43 percent unprepared. I would not promise 90 percent on real photographs: confirm the floor, or set a lower one, from the redeploy's measurement (K4194). The tilt, 110 dpi and noise cases separately: unprepared, the engine alone is robust to a 2.4° tilt and to 110 dpi on clean text (99 and 100 percent); what it fails on is uneven light, low contrast and noise, which is where the gain is.

**Tests** (`pagepixels.test.mjs`, 41 new R44 tests, first run failed for want of the code): floor per page through the real engine; control that the three noisy pages unprepared fall under it; tilt found within half a degree and the prepared pixels level within half a degree by the test's own reading, with the unprepared still tilted; contrast (paper ≥ 243, thirds within 12, darkest half percent ≤ 30) with the unprepared failing all three; scale to 40 px, the size following the factor, capped by `maxEdge`, big text unchanged; no-text picture says so and the engine reads no words from it; purity (same bytes, same pixels), the sha is over the prepared samples, no `prepared` without the option, colour JPEG and PNG paths, R42's refusals unchanged.

**Tests run:** `pagepixels.test.mjs` 424 passed, 0 failed (was 383); `imagecrop.test.mjs` 55; `jbig2.test.mjs` 179; `jpx.test.mjs` 205; 0 failed in each. The two corpus probes not run (corpus not in the container).

**Checks:** `format` 175 modules, 0 failures; `architecture pdf-pixels` 16 product files, 36 relative imports, 0 failures; `coverage pdf-pixels` 28 of 28 live ids named, 0 failures; `ownership pdf-pixels tranche/T51 job/T51/pdf-pixels` 0 failures; `words pdf-pixels` inline 0, plain 0, testcopy 0, marker 0, 0 failures. `checks/run.mjs` repo-wide: failures only in other modules (citation, installer-steps, journey-check, link-sweep, monitoring ids named by no test; `testcopy` in op-grades); none in pdf-pixels.

**For BOB, not mine to change:**
1. **ocr-worker must pass `prepare: true`.** `ocr-worker/src/member.mjs:98` calls `renderPicture(bytes, page, { maxEdge: PICTURE_MAX_EDGE, grey: true })`; until it also passes `prepare: true` the walk's photographs are unchanged. Its tests may hold the prepared answer's shape (`prepared`, a larger frame: a 110 dpi picture grows about 2.5×, so `MAX_FRAME_BYTES` is judged on the prepared size, and `preparePicture` already keeps the long edge within `maxEdge`).
2. **Stale generated artifacts** (manifest §14), not touched: `release/ocr-worker.bundled.mjs`, `release/bio-plane.bundled.mjs`, `bio-plane/dist/bio-plane.bundled.mjs` embed `picturepixels.mjs` and must be regenerated.
3. **A test reads another module's files by path:** the R44 floor test resolves the vendor `tesseract-wasm` through `ocr-worker/package.json` and reads `ocr-worker/assets/eng.traineddata`. No `ocr-worker` source is imported (the architecture check refuses that, since `ocr-worker` is later in the order). If `ocr-worker` moves that model or changes the pin, this test needs the new place.
4. CPU: preparing a 6-megapixel picture took about 1.1 s in node, so a 12-megapixel one is about 3 s; not measured in the isolate.

**Deferred:** none. **Found in another module:** none beyond the above.

Size (session_01EpDRQfdEuiWiTfK47byiUx): test runs 9, module lines 1594

## J5 · QUESTION

Three things I need before COMPLETE; I carry on with the rest on my best readings.

1. **A READ_BOUNDS row (REPORT, B8 ruling 1).** `picturepixels.mjs` must read `PICTURE_SOURCE_MAX` as `boundOf("image", "picture_source")` (R42, R49), and `bio-plane/src/read-bounds.mjs` has no such row (`image` has `pixels`, `edge`, `chunks`, `row_stride`, `cover_bytes`, `picture_frame`). Row to add, kind `image`, name `picture_source`: standard 603979776, alpha 603979776, protective 603979776 (16384 x 12288 x 3, today's figure, measured at T44), key `limit.image.picture_source`. Until it is on `tranche/T51`, `picturepixels.mjs` cannot load; tell me when and I merge. Nothing else in my files needs a new row (`pixels` 120000000, `edge` 65535, `picture_frame`, and `pdf.tree_depth` for the /Parent walk are all there).

2. **R47 has no provider, and needs one new file.** `pdf-reader` offers `openPdf(bytes)` only (whole lenient read); no ranged open. My reading: I read through `readRange` the tail (`startxref`), the cross-reference chain (tables and streams, object streams), the page tree down to the page, and that page's objects (contents, resources, images), assemble them into a small PDF in memory (inherited MediaBox/Rotate/Resources written into the page) and run the existing page path on it; the answer equals the whole-bytes one. Any irregularity (no usable xref, encryption in the trailer, a page index out of range) falls back to reading the whole file, so the refusals stay identical. The code is about 250 lines; I propose a new file `pdf-worker/src/pagesource.mjs`. **Please add it to pdf-pixels' `paths` in `build/modules.json`** (K1043) and tell me; if you would rather it live inside `pagepixels.mjs` (47 KB now), say so and I do that instead.

3. **R48 on the DCT pass-through.** The publisher's JPEG bytes cannot be turned without decoding. My reading: with `opts.turn` other than 0 the default DCT route decodes (route `decoded-dct`, as with `decodeDct`), so `upright` is true after the turn as R48 says; with turn 0 or absent nothing changes. The alternative is to refuse it. Tell me if you want the refusal.

## J6 · COMPLETE

**Fix round 9 (B8, B9, B10) applied, with three tests red by name and one row/CHANGE pending, as B9 and B10 allow.**

**Entries applied** (code `pdf-worker/src/pagepixels.mjs`, `picturepixels.mjs`; tests `pagepixels.test.mjs`, `jbig2.test.mjs`, `jpx.test.mjs`):
- G132l (b) R45: new refusal `PIXELS_UNDETERMINED` (stand-in keyed `pdf-pixels.pagepixels.this_reader_cannot_give_the`; row owed to later-ux), `detail` one of `dct_unexamined` (the pass-through's own JPEG frame, any process, must agree with the dictionary's width, height and component count), `ccitt_columns` (`/Columns`, 1728 when absent, not `/Width`), `decode_array` (raw route, any `/Decode` that is not the default for its components), `smask`, `mask`, `tiff_predictor`. The raw route's check runs before the stream is inflated.
- G125a R46: `decodeImage` judges `/Width`, `/Height` and their product first, against `boundOf("image","edge")` and `("image","pixels")`, for every route and the crop: `IMAGE_TOO_LARGE` with `declared` and `bound` in the answer, nothing decoded. R42's pictures also check each side against the edge before decode.
- G132m R48: `opts.turn` (90/180/270, anything else 0) on pages (after `/Rotate`; a turn on the DCT pass-through decodes it, B10 (3)) and pictures (composed with the EXIF orientation, so a PNG turns too and the reduction's partial boxes stay Pillow-exact on the turned picture); `turned_deg` in both answers (R20).
- G124/R49: `PICTURE_FRAME_MAX`, `PICTURE_SOURCE_MAX`, the pixel and edge bounds and the `/Parent` walk depth (`pdf.tree_depth`) are read from `boundOf`; a test finds no literal of those figures in the four files.
- G132k R47: `renderPageToPixels(source, ...)` and `renderPictureToPixels(source, ...)` accept `{size, readRange}`; the page path calls pdf-reader's `pageSource(source, pageIndex)` (B10 (2)) and runs on its `bytes`, the answer's `page` restored; on `fallback`, or while `pageSource` is not exported, it reads the whole file, so every refusal is the whole file's. A picture is read whole.
- G132i: a test renders a scan with a text line (pdfgen `mixed`) with and without `allowTextPage` through the real render.
- B9: the codec code `IMAGE_TOO_LARGE` is mapped to the `IMAGE_TOO_LARGE` refusal for JBIG2, JPX, DCT and PNG.
- R25 (JBIG2 region taller than its data): already mapped to `TRUNCATED_IMAGE_DATA`; the codec half is image-codecs'.

**Red by name (provider unmerged):**
1. `R47 page 20 / page 1 / the last page ... through pdf-reader's pageSource` (three bytes-read tests in `pagepixels.test.mjs`): red line `FAIL  R47 page 20: the bytes read are the page's, under a quarter of the 60432-byte file (read 60432)`; green when pdf-reader exports `pageSource`. The equality tests of R47 (the source answers what the bytes answer, six cases, and a picture) are green through the fallback and stay green.
2. `jpx.test.mjs` `R25 (the codec refuses the 5000x5000 colour ... / 8000x8000 grey image for memory ...)`: expects the codec's `IMAGE_TOO_LARGE` code (B9); red until image-codecs merges. The pdf-pixels answers beside them are green on both sides.
3. Pending BOB: `bio-plane/src/read-bounds.mjs` lacks `image.picture_source` (B10 (1): RUNTIME-LIMITS #8 adds it). Without it `picturepixels.mjs` does not load, so `pagepixels.test.mjs` and the others that import it fail at import on this branch until the CHANGE; I ran every test below with that one row added locally and uncommitted.

**R-FOUR red then green.** The new tests run against the untouched `src` (stashed): `FAIL  R45 8-bit grey with /Decode [1 0]: PIXELS_UNDETERMINED, decode_array, no bytes`, the same for `smask`, `mask`, `tiff_predictor`, `ccitt_columns`, the four `dct_unexamined` cases and `FAIL  R46 an 8 KB CCITT stream declaring 60,000 x 60,000: IMAGE_TOO_LARGE ...` (the run then ended in the old code); with the change, 0 failures in them. Platform check: L (local node); no P check is mine.

**Tests run** (with the local row): `pagepixels.test.mjs` 538 passed, 3 failed (the R47 three); `imagecrop.test.mjs` 55 passed; `jbig2.test.mjs` 179 passed; `jpx.test.mjs` 203 passed, 2 failed (item 2). Users: `ocr-worker/test/ocr-worker.test.mjs` 293 passed, 1 failed (`R19 the committed manifest's input and asset hashes match the tree`: the generated manifest hashes my source files, which I changed, so it is stale: BOB regenerates it, mechanics §14); `bio-plane/test/m/content/crop.test.mjs` 0 fail; `plane` t42, t43, t44 pass. `build/plan/impact.mjs origin/tranche/T51 HEAD` names 106 modules; the ones that import these files are ocr-worker, content (crop), plane (the three tests) and pdf-worker's own. The two corpus probes were not run (the corpus is not in the container).

**Checks** (civicos-process): `format` 176 modules, 0 failures; `architecture pdf-pixels` 16 product files, 42 relative imports, 0 failures; `coverage pdf-pixels` 33 of 33 live ids named, 0 failures; `words pdf-pixels` inline 0, plain 0, testcopy 0, missingkey 0, marker 0, 0 failures; `ownership pdf-pixels tranche/T51 job/T51/pdf-pixels` 6 files changed, 0 failures.

**For BOB, not mine:** (a) strike the "not yet met" marks of R20, R22-R25, R42, R43, R45-R49 when the reds above turn green; (b) regenerate the ocr-worker manifest; (c) the word row for `PIXELS_UNDETERMINED`; (d) `ocr-worker` must now pass `turn`/`allowTextPage` (jobs 18). I deferred nothing; `pagesource.mjs`, which I had drafted before B10, is removed (about 250 lines that read the xref chain, tables, streams and object streams, the page tree and the page's objects, and gave identical answers on classic, xref-stream, object-stream and linearized pdfgen files for all 12 pages each; pdf-reader's job can ask for it in my git history, commit 9cc44f65d6's parent branch tip, if useful: it was not committed, so it is gone).

Size (session_01VnDyAygN6JtYE78XMij9Xr): test runs 22, module lines 1730

## J7 · COMPLETE

B11 applied: `tranche/T51` merged, the local `read-bounds.mjs` copy dropped; `image.picture_source` is the table's row and `picturepixels.mjs` loads. Tests: `pagepixels` 538 passed, 3 failed; `imagecrop` 55; `jbig2` 179; `jpx` 203 passed, 2 failed. The five reds are the ones in J6, unchanged: three R47 bytes-read tests (until pdf-reader exports `pageSource`) and two jpx codec memory tests (until image-codecs' `IMAGE_TOO_LARGE` code merges). Checks: format, architecture, coverage (33 of 33), words and ownership, 0 failures each. I use none of rows 20-22.

Size (session_01VnDyAygN6JtYE78XMij9Xr): test runs 26, module lines 1730

## J8 · COMPLETE

B12 applied: tranche merged; the PNG mapping test now asserts totality over `PNG_REFUSES` plus the codec's `IMAGE_TOO_LARGE` code (exported `PNG_CODE_REASONS`), and the JPX/PNG `MEMORY_FEATURE` entries are dropped from my maps. Tests: `pagepixels` 538 passed, 3 failed (the three R47 bytes-read tests, red by name until PDF-READER #15 merges R49); `imagecrop` 55; `jbig2` 179; `jpx` 205 passed, 0 failed (the two memory tests are green on the merged codec). Checks: format, architecture, coverage, words, ownership: 0 failures.

Size (session_01VnDyAygN6JtYE78XMij9Xr): test runs 30, module lines 1730

## J9 · COMPLETE

B13 applied (fix round 10, Wave A batch 1): cause R6 fixed, three fixtures published. Pushed on `job/T51/pdf-pixels`.

**R6 · root cause.** `levelLight` (`pdf-worker/src/picturepixels.mjs`, the ink level, formerly :349-:353) took the ink level from the darkest 0.5 % of ALL pixels. A page of three lines holds 0.25 % ink, so that level fell among the paper's own greys, `span` sat at its floor of 32 and the whole page went dark; `preparePicture` (:437) then found one run of rows the page's height and answered `text_found:false`, and the member answered `NOTHING_TRANSCRIBED` without the engine. Fix: the ink is the pixels under 200/255 of the paper beneath them (`INK_RATIO`); the level is the darkest twentieth of those, whatever their share of the picture; fewer than 32 of them (`INK_MIN`) is no ink, and the paper alone is stretched. A blank page and noise still reach (d) and answer `text_found:false`. No numeric constant is a ceiling (R49).
**One reading I made (flag for BOB):** `prepared.line_px` is now the median line height of the ANSWERED picture (`median × scale`; equal to the measured height when `scale` is 1). The walker's 4097 x 3000 frame is reduced to 2049 x 1500 (lines about 10 px) and enlarged 1.82 x to 20 px; BOB's test line asks 15 to 30 for all three frames, which the measured-before-enlargement height could not give. R44's text does not define `line_px`; if the other reading is wanted, say so.
**Why the tests missed it:** only dense pages (231 words, 18 lines); the no-text arm used a blank page; `ocr-worker.test.mjs:720` types `text_found` in by hand.
**Failing-first, seen red:** probe over the walker's recipe `generate({kind:"png",seed:"rw9-A-7",size:{pages:1,lines:3}})` (also `frame:[4096,3000]`, `[4097,3000]`) through `renderPictureToPixels(.., 0, {maxEdge:4096, grey:true, prepare:true})` gave `text_found:false, line_px:0` on all three before the change; green after: `text_found:true`, `line_px` 21, 21, 20. Tests: new block "R44 sparse page" in `pdf-worker/test/pagepixels.test.mjs` (the three frames: text found, line_px 15-30, paper at least 243 and ink share under 0.5 %, ink reading at most 30 by the darkest twentieth of the pixels under 128 (the old 0.5th-percentile measure is paper on a sparse page); controls: noise and a blank page stay false, an 18-line page stays true with ink at most 30; the real engine reads words from the prepared three-line page).
**Platform check:** none needed for the cause (a pure function of the bytes, R40, the same in workerd and Node). The recipe check after the redeploy: upload the walker's three recipes (A7 PNG, A14 4096 and 4097 frames) and read the `reading`. `ocr-worker` only receives the flag; its reading of the words is that job's test (REPORT to BOB below).

**Fixtures published** in the new file `pdf-worker/test/pdf-pixels-fixtures.mjs` (**outside my `tests` entries: BOB adds it to pdf-pixels' tests before the ownership check, K1043**; `ownership.mjs` fails on exactly this file, nothing else): `pixelRefusal(reason)` (NOT_A_PDF, PAGE_HAS_TEXT_LAYER, MULTIPLE_IMAGES_ON_PAGE, UNSUPPORTED_FILTER, PIXELS_UNDETERMINED by a `/Decode [1 0]` image, IMAGE_TOO_LARGE with `bound_name` PICTURE_FRAME_MAX from a PNG header over the frame bound), `pageRefusal(reason)` (PAGE_HAS_TEXT_LAYER, UNSUPPORTED_JPEG_PROCESS with `jpeg`, `process`, `page` from the progressive JPEG of `picture-variants.json`, NOT_A_PICTURE), `renderedPage(kind, opts)` ("pdf": a 3 x 2 grey page through `renderPageToPixels`; "picture": a generated PNG through `renderPictureToPixels`, `prepare`/`turn` passed). Each is made by the real code when called, never stored; checked by the block "the published fixtures" in `pagepixels.test.mjs` (each reason: `ok`, `reason`, `why` exactly the reason's own text, the detail fields; `renderedPage` checks route, size, digest over the returned samples, geometry). `fixtures-own` / `fixtures-generic` markers added: none. `node checks/fixtures.mjs . pdf-pixels --list`: 0 failures, none of my lines open (my module uses no other module's answers in a way the check lists). The users re-point in their own jobs (ocr-worker 1: pixelRefusal, renderedPage; plane 2: pageRefusal).

**Tests run:** `pagepixels.test.mjs` 564 passed, 0 failed (the engine floors of R44 included); `imagecrop` 55, `jbig2` 179, `jpx` 205, 0 failed. Impact (`impact.mjs origin/tranche/T51 HEAD`): 71 files; plane's 68 files: 533 of 534 passed, the one failure is `bio-plane/test/m/plane/release.test.mjs` "R24 (DEC-149 ...)" and it is red on `origin/tranche/T51` too (inherited, not mine). ocr-worker: `g128i-l26-photo.test.mjs` 8 of 8 pass; `ocr-worker.test.mjs` 455 passed, 5 failed.
**Stale generated artifact (report):** the 5 `ocr-worker.test.mjs` reds are one cause, `ocr-worker/dist/ocr-worker.bundled.mjs` is stale (it bundles `picturepixels.mjs`): "R19 the committed manifest's input and asset hashes match the tree (STALE BUNDLE ...)" and the R23 jpeg/png digest and anchor tests (the member's bundled answer has the old pixels, the test's direct render the new). They pass (460/0) on the tranche. BOB regenerates the bundle and manifest; I did not touch them.
**Checks:** `format` 178 modules, 0 failures; `architecture pdf-pixels` 0 failures; `coverage pdf-pixels` 33 of 33 live ids named, 0 failures; `run.mjs`: words 0 findings in my module (inline 0, plain 0, testcopy 0, missingkey 0), 0 failures; `fixtures` 0 failures for my lines (the 2,816 run-wide fixtures lines are other modules'); `ownership`: 1 failure, `pdf-worker/test/pdf-pixels-fixtures.mjs` outside my paths and tests (above).
**Deferred:** none. Requirement text for BOB: R44's "not yet met" mark can come off with the redeploy's check; `line_px` meaning as above.

Size (session_01EMUJKMcGCYN27SUYGwANcd): test runs 14, module lines 1744
