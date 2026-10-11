# plane (T43)

**Status** · session_01V89kk4XDE4kvMKxapFk858 · depth 2 · WORKING · handled B0

## Work (T43-15)

**How the reading set was read (mechanics §17).** Read whole: `build/requirements/plane.md`; `src/plane/screens.mjs`, `transcribe.mjs`, `door.mjs`, `index.mjs`; `test/m/plane/t42.test.mjs` and `release.test.mjs`; `pdf-worker/src/picturepixels.mjs`; `extraction/ops.mjs`' arms; `build/plan/draft-T43-n853b.md`, `draft-T43-words.md`; rulings K2611, K2684, K2689, K2691, K2692, K2698, K2716. The used modules' public parts were read in full by one helper agent in this session (pdf-pixels, image-codecs, format-registry, extraction, reading-pipeline, agent-worker, op-declarations, control-plane, affordances, ai-use, credentials, run-rules, ai-runs, record-core's evidence store, answers; `next.md` N868–N870; the design stream's Document screen). It wrote a digest that cites a section for every statement (K2032). The sources stay binding.

**Entries applied**
- **R24** (N862; DEC-190 (1)): the `bundle` screen's `acts` end in `reading`, `pagetranscribe`, `transcribe`, each declared in op-declarations' `OPS`. `screenFailures` stays empty.
- **R36** (N853b; K2691, K2716): `TRANSCRIBE_PICTURE_EDGE` = 1568 is exported. In `renderPages`, a page the page renderer answers `NOT_A_PDF` for is rendered by `renderPictureToPixels(bytes, page, {maxEdge: TRANSCRIBE_PICTURE_EDGE, grey: true})`. Its refusals, a throw, a non-PNG result and a PNG over the cap all leave the page unread. No other refusal of the page renderer falls back, and a PDF page renders byte for byte as before.
- **R6** (N866; K2692): the gated hook stamps an `ai` caller's `author` as `class:ai/<tokenId>`. A session's author stays its member; a binding class keeps `token:<cls>` (D-311).

**The gated ops checked for the `token:` form (R6).** Three arms of the hook are handed `author`, and none keeps `token:` for an `ai` caller:
- `affordances`: D-311 says only that the facts are asked "with the stamps exactly as the acts receive them". Its one use of `author` is `actor_is_machine` (`isMachineIdentity`), which is true for both forms, so the published acts are unchanged. Under R17 an `ai` caller's acts receive `class:ai/<tokenId>`.
- `pdfstructure`: the read path ignores `author`. The only write, `ocr=1`, refuses an `ai` caller `REEXTRACT_AGENT_REFUSED` before the author is used.
- `pagetranscribe`: session only (control-plane R74), and extraction refuses `ai` too.
No other arm of the hook takes `author`. The only requirement naming `token:ai` is control-plane R38 (`lease`), which is not an arm of the plane's hook.

**Found, for BOB (not changed: outside my entries' text)**
- The hook's `by` for an `ai` caller is still `class:ai`, while the generic forward stamps `class:ai/<tokenId>`. Amended R6 names only `author`. `affordances` receives `by` (its `#roster(id, by)`). Whether R6 should also align `by` is BOB's call.
- Wording only: plane's Uses line for R36 names `renderPageToPixels` only; it now also uses `renderPictureToPixels` (the plane→pdf-pixels edge already exists).
- `renderPictureToPixels` throws `TypeError` for a bad `maxEdge` rather than refusing. The plane's call is inside its try/catch, so this is not a fault.
- No generated artifact was made stale by my change beyond the plane bundle (`bio-plane/dist`, `not_product`'s row), which BOB regenerates at the layer close.

**Deferred:** none.

**Tests and checks** (on `job/T43/plane` before merging `tranche/T43`; the merge waits for the other L11 jobs, plane last)
- New `test/m/plane/t43.test.mjs`: 6 tests naming R24, R36 and R6, each with a negative control. Its fixtures (`fixtures/t43-photo-o6.jpg`, 3200×2400 colour, EXIF orientation 6; `fixtures/t43-page.png`) were made with Pillow 12.3.0. Against the old code the file fails.
- `node --test "test/m/plane/*.test.mjs" test/system/migrate-released.test.mjs`: tests 191, pass 191, fail 0. This includes the release suite (`release.test.mjs`, R24's registry check and R19).
- format: 147 modules, 0 failures. architecture: 0 failures. coverage: 38 of 38 live ids, 0 failures. ownership: 7 files, 0 failures.
