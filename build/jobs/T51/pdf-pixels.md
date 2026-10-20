# pdf-pixels (T51)

**Status** · session_01EpDRQfdEuiWiTfK47byiUx · depth 2 · COMPLETE · handled B3

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
