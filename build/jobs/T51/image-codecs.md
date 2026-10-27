# image-codecs (T51)

**Status** · session_015qkDnLHcfXrkvLPEKdDKjT · depth 2 · COMPLETE · handled B7

## J1 · COMPLETE

**T51-256 image-codecs: done** (commit a4d45636a5 on job/T51/image-codecs).

**Entries applied.** T51-256 (the 45 `plain` findings in `build/plan/words-pass/image-codecs.md`): each sentence is now `localize("image-codecs.<file stem>.<slug>", en)` with its en text unchanged. Judgement: I read every one as text a member can see, because refusal notes become the error message (`${code}: ${note}`) and the refusal tables' reasons are the feature descriptions. None is listed as unkeyed. Two keys needed care: `"an image past the memory bound"` is both a key of `JPX_REFUSES` and `PNG_REFUSES` and the `feature` passed at its call site. Both keys are computed `[localize(...)]`, and each call site uses the same id, so R7 (feature is a key of the declared set) holds in every locale.

**Deferred.** Nothing in the module.

**Open question for BOB (K874).** Your START asks that every new id get an explicit test naming it. None of the 45 ids is named by a test. The refusal paths are reached through crafted streams, and some sites are deep in the parsers, so a test per id is a real piece of work. No check enforces it, and the other converted modules' tests do not name their ids either. Do you want a test per id (I would write them as a follow-on in this job), or is the words check's zero count enough?

**Found in other modules.** None from my reading.

**Tests run (all pass).**
- `pdf-worker/test/codecs/`: ccitt 7/7, dct 16/16, invariants 12/12, jbig2 6/6, jpx 8/8, mq 6/6, png 10/10.
- `pdf-worker/test/`: structure, pagepixels, imagecrop, jbig2, jpx all exit 0.

**Checks.**
- format: 0 failures (174 modules).
- architecture (image-codecs): 0 failures.
- coverage (image-codecs): 11 of 11 live ids named by a test, 0 failures.
- ownership (tranche/T51 to job/T51/image-codecs): 5 files, 0 failures (my four sources and this record).
- words: 0 `image-codecs` findings. The repo-wide words total is still 4799 failures from other modules, so `checks/run.mjs` exits 1 for that reason and not mine.

Size (session_01YPCgAZ8Ga6MXdTiGufjUD7): test runs 19, module lines 3423.

## J2 · COMPLETE

**T51-256 image-codecs: COMPLETE again after CHANGE B2 (K3962, K3965)** (commit c8fa11a20e on job/T51/image-codecs; tranche/T51 merged; civicos-process at ea6cd83).

**Converted test copies.** Each test that copied a localized `en` now compares with `localize(id, en)` using the decoder's own id, or asserts the key:
- `dct.test.mjs`: the colour-transform reason is compared with `localize("image-codecs.dctdecode.libjpeg_s_default_for_three", …)`.
- `invariants.test.mjs`: the memory-bound feature keys in `JPX_REFUSES` and `PNG_REFUSES` are compared with their localize calls.
- `jpx.test.mjs`: `MEMORY` is a `localize` call.
- `png.test.mjs`: the memory-bound feature is compared with `localize("image-codecs.pngdecode.…")`.
- `jbig2.test.mjs` R3: the localized generic-region and refinement details are matched by prefix against `localize` with the decoder's ids. The regex copies are gone, and the assertion messages hold no sentence text.

**Checks (after the conversions).**
- Codec tests: ccitt 7/7, dct 16/16, invariants 12/12, jbig2 6/6, jpx 8/8, mq 6/6, png 10/10.
- pdf-worker: structure, pagepixels, imagecrop, jbig2, jpx all exit 0.
- format 0 failures; architecture 0 failures; coverage 11 of 11 live ids; ownership 10 files, 0 failures.
- words: 0 `image-codecs` findings.
- `node bio-plane/src/setup-words/build.mjs --check` exits 1, with one warning about `jurisdictions.index.amount_is_amount_and_units` (a formatted argument, R18). It is not in my module, so I have not touched it. Please route it to its owner.

**Still open (unchanged from J1).** K874: no test names the 45 new ids. Please rule whether you want a test per id or whether the words check is enough.

Size (session_01YPCgAZ8Ga6MXdTiGufjUD7): test runs 33, module lines 3423.

## J3 · COMPLETE

**T51-256 image-codecs: COMPLETE after CHANGE B4 (K3971)** (commit a825394b67 on job/T51/image-codecs; tranche/T51 merged first).

**Applied.** `jpxdecode.mjs` and `pngdecode.mjs` each export `MEMORY_FEATURE`, the one unlocalized identifier for the memory refusal. Both refusal tables use it as the key, both throw sites pass it as `feature`, and the reason sentence stays read by `localize`. The three tests compare against the constant (or import it). R7 holds: the feature is a key of the declared set.

**Value, and why it differs from the English.** The constant is `"image-past-memory-bound"`, not `"an image past the memory bound"`. The words check reads the English five-word literal as a sentence and fails the module, so the identifier form was the only way to meet your rule and the words zero-count together. This is a deliberate change of value, and it has a cross-module effect (below).

**Cross-module reds (REPORT, not my files).** The old English value is still the key in PDF-PIXELS' maps and tests, so these break until PDF-PIXELS #6 lands with the constant:
- `pdf-worker/src/pagepixels.mjs:119` and `pdf-worker/src/picturepixels.mjs:60` map `"an image past the memory bound"` → `IMAGE_TOO_LARGE`. With the new key, `featureReasons` falls back to `UNSUPPORTED_FILTER`: the memory refusal still refuses, but its reason changes. No picture is produced in either case.
- `pdf-worker/test/pagepixels.test.mjs:657` and `pdf-worker/test/jpx.test.mjs:183,188` assert the English literal and now fail (`pagepixels.test.mjs` exit 1, `test/jpx.test.mjs` exit 1).
If you would rather keep the English value and accept the words-check failure for the constant, say so and I will revert the value; the rest of the change stands.

**Checks.**
- Codec tests: ccitt 7/7, dct 16/16, invariants 12/12, jbig2 6/6, jpx 8/8, mq 6/6, png 10/10.
- pdf-worker: structure, imagecrop, jbig2 pass; pagepixels and jpx fail as above.
- format 0 failures; architecture 0 failures; coverage 11 of 11 live ids.
- ownership (tranche/T51 to job/T51/image-codecs): 5 files, 0 failures.
- words: 0 `image-codecs` findings.
- `node bio-plane/src/setup-words/build.mjs --check` exits 1: `rows.mjs` is stale for `image-codecs.jpxdecode.marker_0x_m_where_sot` (the generated row list). It is generated; I have not regenerated it, as BOB does that at layer close.

Size (session_01YPCgAZ8Ga6MXdTiGufjUD7): test runs 36, module lines 3423.

## J4 · QUESTION

QUESTION (best reading given; I carry on with it). Fix round 9, image-codecs R4, R10, R12, R13.

My ceilings and the rows I read (no numeric literal of mine, R13):
- `boundOf("image","pixels")` 120,000,000, `"edge"` 65,535, `"row_stride"` 8 MiB, `"chunks"` 65,536: all four exist.
- R4/R10 keep a working-set ("memory") bound, today `61_300_000` in jpxdecode.mjs and pngdecode.mjs (the measured OCR-isolate figure). No `image` row holds it. I read `boundOf("ocr","frame_bytes")` (61,300,000, the same figure and source) so the behaviour is unchanged and no member limit moves. If you want a row of its own, it is `image.working_set` {standard 61300000, alpha 61300000, protective 61300000} for runtime-limits to add; I change one import line.
- R4 says the JPX precinct/tile objects are counted against "the table's retained-objects bound": I read `boundOf("office","retained_objects")` (250,000 proposed, BOB confirming for JPX). I count precinct objects plus code-block objects per band, from the header, closed form. If you want an `image.retained_objects` row instead, same one-line change.

Needed from you: nothing if both readings stand; say so only if you want the two rows added and the import re-pointed.
Also noted for later: I keep exporting `MEMORY_FEATURE` (an identifier, no longer a key of JPX_REFUSES/PNG_REFUSES) so pdf-pixels' imports in pagepixels.mjs and picturepixels.mjs still load; the memory refusal is now code `IMAGE_TOO_LARGE`, which pdf-pixels (job 14) must map (today it falls to DECODE_FAILED).

## J5 · QUESTION

QUESTION (best reading given; I carry on with it). Fix round 9, image-codecs R12 against pdf-pixels' picture route.

R12 judges every JPEG entry point against `image.pixels` (120,000,000). The picture route of pdf-pixels decodes a member's photo with `decodeBaselineJpegRows` (my R11, which holds no full-size plane: its live set is one MCU row) and admits frames up to its own `PICTURE_SOURCE_MAX` = 16384 x 12288 x 3 (a 201-megapixel frame; its R42 tests drive 16320 x 12240). With R12 as written the rows decoder refuses a JPEG over 120 megapixels `IMAGE_TOO_LARGE` from its header, so a 120-200 MP phone photo that reads today would be refused: that changes what a member may do, which is Bob's (R-SILENT, K1881).

My reading, implemented now: follow R12 literally for both entry points (`decodeBaselineJpeg` and `decodeBaselineJpegRows`): the table's figure, no second figure of mine. The hostile case R12 names (a 330-byte JPEG declaring 60,000 x 60,000) needs the rows route judged too, since its cost there is time, not memory.

Choices, for you to rule: (a) keep as implemented: photos over 120 MP are refused, and pdf-pixels' R42 tests that drive 16320 x 12240 change with it (pdf-pixels, job 14); (b) judge the rows route against a row of its own, e.g. `image.rows_pixels` = 201,326,592 (16384 x 12288) alpha, standard and protective, key `limit.image.rows_pixels`, for runtime-limits to add, and I re-point one line; the 120 MP stays for the whole-frame `decodeBaselineJpeg`.
I recommend (b) if the 200 MP phone frames are meant to keep reading; (a) if 120 MP is the intended ceiling of every picture.

## J6 · COMPLETE

COMPLETE · fix round 9 (B5): G125a (ccitt, dct, jbig2), G125b (jpx), G132l (d) (mq, jbig2), G124 quotes (R13). Commits on job/T51/image-codecs up to the one pushed with this entry.

**Entries applied.**
- R12/G125a: ccitt, dct, jbig2, png judge declared size before any allocation, `IMAGE_TOO_LARGE` in the codec's class (`CcittRefusal` new, `DctRefusal`, `Jbig2Refusal`, `PngRefusal`, `JpxRefusal`), detail `{bound_name, size, bound, key, width, height...}`, final, no `transient`. Bounds: image.pixels, image.edge, image.chunks (png); jbig2 also counts symbols/patterns against retained objects; row stride is implied by the edge (65,535 x 8 B << 8 MiB), so it is not judged apart.
- R4/G125b: jpx counts tile, precinct, code-block and packet-order objects in closed form per band before `addPrecincts`; working set and pixels/edge from the table; `MEMORY_FEATURE` still exported (identifier only, no longer a key of JPX_REFUSES/PNG_REFUSES, R7).
- R5/G132l (d): `MqDecoder(data, start, end, {onShort})`; marker feeds past the coder's look-ahead (4; legit streams measured max 2 over 148 coders) count as bytes missing; all six JBIG2 arithmetic sites stop at once with TRUNCATED.
- R13/G124: no ceiling literal in the six sources; a test greps them (negative control run). Guards that are not size ceilings (loop-termination guards `1<<16`, `+1e6`, `4*w+16`, `nl>32`) are kept.
- Ruled rows (K4858, K4862): the code reads `image.working_set`, `image.retained_objects`, `image.rows_pixels` when the table has them, else the row holding the same figure (`ocr.frame_bytes`, `office.retained_objects`, `image.pixels`); verified both ways (tests green with and without the three rows added locally). No edit is needed when runtime-limits' rows land; the guard lines may be deleted at any later CHANGE. NOTE: until `image.rows_pixels` lands, the rows decoder is judged at 120 MP (pdf-pixels' 200 MP R42 tests will not pass until then).

**Red then green (R-FOUR 3).** Reds seen before the code: CCITT 60000x60000 `ok:true` after 3.4 s (red: "R12 CCITT: 8,000 bytes declaring 60,000 x 60,000 ... actual false expected true"); DCT 60000x60000 gave `CORRUPT_DATA` not `IMAGE_TOO_LARGE`; JBIG2 16000x16000 not refused; JPX SIZ 500 2x2 gave `TRUNCATED` not `IMAGE_TOO_LARGE`; R5 `onShort` never called; JBIG2 taller region decoded. 19 reds, all green now: codecs suite 80/80, bounds.test.mjs 5 runs and `taskset -c 0` green.

**Known limit (G132l d).** A region taller than its data is refused when the invented rows cost bits (12 of 16 generic fixtures at +400 rows). The other 4 decode white from the coder's 1-bit feed; that cannot be told from a legitimate blank tail. The test says so.

**Found in other modules (REPORT-equivalent).** pdf-pixels: `pagepixels.mjs` maps codec codes by `e.code`; `IMAGE_TOO_LARGE` (any codec, and CCITT's plain Error is now `CcittRefusal` for it) falls to DECODE_FAILED. Failing today, as expected: `pdf-worker/test/jpx.test.mjs` (4, the R25 memory-bound cases) and `pagepixels.test.mjs` (2, R42 total mapping of PNG_REFUSES and a control). BOB has forwarded the mapping to job 14. Also `ocr-worker` R19 STALE BUNDLE.

**Stale generated artifacts I made.** `ocr-worker/dist/ocr-worker.bundled.mjs` and its manifest, `bio-plane/dist/bio-plane.bundled.mjs`, `agent-worker/dist/*`, `release/*.bundled.mjs`, and setup-words `rows.mjs` (new ids below; retired `image-codecs.jpxdecode.the_decode_would_hold_more`, `image-codecs.pngdecode.the_decode_would_hold_more`, `image-codecs.jbig2decode.bitmap_of_w_x_h`).

**Words owed (later-ux.md, stand-ins keyed through localize):** ccittdecode.the_picture_is_columns_wide(_2); dctdecode.the_picture_is_width_by_height; jbig2decode.the_bitmap_is_w_by_h(_2), the_symbol_dictionary_declares_n, the_pattern_dictionary_declares_n; jpxdecode.the_image_is_w_by_h(_2), the_decode_would_hold_bytes_at, the_codestream_s_precincts_and_code; pngdecode.the_file_holds_more_than_chunks, the_image_is_w_by_h(_2), the_decode_would_hold_bytes_at.

**New files:** `pdf-worker/test/codecs/bounds.test.mjs`, `alloc-spy.mjs` (both under my tests path).

**Tests and checks.** codecs 80/80 (`node --test pdf-worker/test/codecs/`); impact users run: image-cover/doc-clean 57 pass 0 fail, case-carriage 98/98, pdf-pixels files as above. format 0 failures (176 modules); architecture 0; coverage 13 of 13 ids, 0; words 0 (inline 0, plain 0); ownership 14 files, 0.

Size (session_015qkDnLHcfXrkvLPEKdDKjT): test runs 40, module lines 3,170
