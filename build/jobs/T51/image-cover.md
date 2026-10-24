# image-cover (T51)

**Status** · session_01JwFMfy4ht6vi8HQYUy47Nm · depth 2 · COMPLETE · handled B3

## Completion record (T51-258, K3957)

**Applied:** the 24 `plain` findings of `build/plan/words-pass/image-cover.md`, plus two unflagged diagnostics of the same shape in `index.mjs` and `strip.mjs` (the rule is the same).

- `index.mjs`, the refusal tables: `COVER_REFUSALS` (`AREA_OUTSIDE`, `PHOTO_TOO_LARGE`, `TRUNCATED_IMAGE_DATA`, `IMAGE_DATA_CORRUPT`) and `STRIP_REFUSALS` (`NOT_A_STRIPPABLE_FORMAT`, `PHOTO_TOO_LARGE`, `TRUNCATED_IMAGE_DATA`, `IMAGE_DATA_CORRUPT`, `ANIMATED_IMAGE`) now read `word("refusal.<CODE>")`. Each code has a member row in `words.json` (`refusal.<CODE>`, "refusal by its code"), so the member's words come from the design's row, not the module's English.
- `index.mjs`: 3 `detail` strings localized (`image-cover.index.the_photos_bytes_are_not_a_byte_array`, `..._the_images_bytes_are_not_a_byte_array`, `..._the_photo_is_neither_a_jpeg_nor_a_png`).
- `strip.mjs`: 18 `detail` strings localized (`image-cover.strip.<slug>`, one per string; the PNG chunk message keeps its `{type}` as a placeholder).

**Judgement.** Each refusal `detail` is a diagnostic: a member is shown the code's word by key (DEC-83), and `CleanRefusal` joins the detail into a developer message (`doc-clean/images.mjs`). I localized the details, as this module already does for its other details, so the words check reads zero; BOB may move these 21 to the design's unkeyed list (K3944). The English of the four refusal codes with no `refusal.<CODE>` row (`NOT_A_COVERABLE_FORMAT`, `UNSUPPORTED_JPEG_PROCESS`, `PNG_INTERLACED`, `AREA_MALFORMED`) stays in `COVER_REFUSALS`; it is not a finding (it carries punctuation), and it needs a row from the design if a member is to read it.

**Deferred:** K874 (every new id needs a test naming it). The 21 new ids are not each named by a test. The module's refusal tests reach every code and check each detail is a string (R7 test, strip R6/R7 and R8 tests); I did not add per-id tests because no test can check a localized sentence without holding its text (K3810). BOB rules whether that is enough.

**Other modules:** none found.

**Tests and checks** (process repository at `27aa50e`):
- `node --test bio-plane/test/m/image-cover/`: 15 pass, 0 fail (R4 workerd: 12 MP 848 ms, 48 MP 3840 ms; peak growth 9.2 MB and 24.3 MB).
- `node checks/words.mjs /home/user/bio image-cover`: `inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0, unkeyed 12; 0 failures` (was 24 plain failures).
- `node checks/run.mjs /home/user/bio`: `format` 0 failures; `architecture` 0 failures; `coverage` 33 failures tree-wide, none in image-cover; `words` 4820 failures tree-wide, none in image-cover. `image-cover` appears nowhere in the output.
- `node checks/coverage.mjs /home/user/bio image-cover`: 9 of 9 live requirement ids named by a test, 0 failures.
- `node checks/architecture.mjs /home/user/bio image-cover` and `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/ownership.mjs /home/user/bio image-cover tranche/T51 job/T51/image-cover`: run after the push (see the record's last line).

Size (session_01CSjPbRFbq35fHhD3md1yuV): test runs 1, module lines 1288

## J1 · COMPLETE

T51-258 (image-cover) is done; the 24 plain findings read zero (`checks/words.mjs image-cover`: 0 failures), and the module's 15 tests pass.

Judgement (details in the record, `build/jobs/T51/image-cover.md`, Completion record):
- The refusal tables (`COVER_REFUSALS`, `STRIP_REFUSALS`) read `word("refusal.<CODE>")` for the codes whose member row exists in words.json.
- 21 refusal `detail` strings are localized, as this module already does for its other details. They are diagnostics a member does not read (the member sees the code's word), so you may move them to the design's unkeyed list (K3944).
- Two decisions for you: (1) K874 asks that each new id be named by a test; the 21 new ids are not, because no test can check a localized sentence without holding its text (K3810), and the existing refusal tests cover every code. (2) The English of four codes with no member row (`NOT_A_COVERABLE_FORMAT`, `UNSUPPORTED_JPEG_PROCESS`, `PNG_INTERLACED`, `AREA_MALFORMED`) stays in `COVER_REFUSALS`; they need a row from the design.

Checks: format 0 and architecture 0 (module and tree-wide); coverage 9 of 9 for image-cover; ownership 3 files, 0 failures. Tree-wide `run.mjs` shows 4820 words failures and 33 coverage failures, none in image-cover.

Size (session_01CSjPbRFbq35fHhD3md1yuV): test runs 1, module lines 1288

## CHANGE B2 (K3970, DEC-344): the four member rows

Merged `tranche/T51` (not rebased). `COVER_REFUSALS` now reads `word("refusal.<CODE>")` for `NOT_A_COVERABLE_FORMAT`, `UNSUPPORTED_JPEG_PROCESS`, `PNG_INTERLACED` and `AREA_MALFORMED`, so no member English is left in the module. The new R3 words test in `cover.test.mjs` compares each code's table entry with `word()`, never with a sentence.

Checks after the change: `node --test bio-plane/test/m/image-cover/` 16 pass, 0 fail; `checks/words.mjs image-cover` 0 failures (inline 0, plain 0, unkeyed 12); `bio-plane/src/setup-words/build.mjs --check` matches; coverage 9 of 9; architecture 0; format 0.

Size (session_01CSjPbRFbq35fHhD3md1yuV): test runs 2, module lines 1288

## J2 · COMPLETE

CHANGE B2 (K3970, DEC-344) is done. Merged `tranche/T51` (no rebase). `COVER_REFUSALS` now reads `word("refusal.<CODE>")` for `NOT_A_COVERABLE_FORMAT`, `UNSUPPORTED_JPEG_PROCESS`, `PNG_INTERLACED` and `AREA_MALFORMED`; no member English is left in the module. A new R3 words test compares each code with `word()`, never with a sentence.

Checks: `node --test bio-plane/test/m/image-cover/` 16 pass, 0 fail; `checks/words.mjs image-cover` 0 failures; `bio-plane/src/setup-words/build.mjs --check` matches; coverage 9 of 9; architecture and format 0 failures; ownership 3 files, 0 failures.

Size (session_01CSjPbRFbq35fHhD3md1yuV): test runs 2, module lines 1288

## Round 9 completion record (B3: G125c, G124 quotes)

Merged `tranche/T51` first (no rebase) and read `build/requirements/image-cover.md` whole.

**Applied.**
- **R10 (G125c).** `geometry.mjs` holds `checkStride` and `checkCount`; both answer `IMAGE_TOO_LARGE`, deterministic and final, `detail` naming the declared size and the bound. `png.mjs`: the chunk count is judged as the chunks are walked (before any is kept) and the row stride, `W * bytes per pixel`, straight after the header checks and before the palette check and the five row buffers. `strip.mjs`: PNG chunks and IHDR stride (any bit depth, interlaced or not), JPEG marker segments, JP2 boxes, J2K codestream markers, each counted before anything is kept for them. `jpeg.mjs`: `checkMarkers` walks the marker segments outside the entropy-coded data (no allocation) before `coverJpeg` reads the header and before `stripJpeg` keeps them. A stride or count at the bound is processed as before.
- **R11 (G124).** `COVER_MAX_BYTES`, `COVER_MAX_PIXELS` and the two new ceilings are `boundOf("image", "cover_bytes" | "pixels" | "row_stride" | "chunks")` in `geometry.mjs` (re-exported from `index.mjs`); no numeric literal for a ceiling remains. The rows were already in `READ_BOUNDS` (runtime-limits): no row owed.
- **R3, R8.** `IMAGE_TOO_LARGE` is declared in `COVER_REFUSALS` and `STRIP_REFUSALS`.

**Words (R-WORDS).** Stand-ins keyed through `localize`: `limit.image.row_stride` and `limit.image.chunks` (the keys the table's rows name; the detail sentences), and `image-cover.index.image_too_large` (the refusal's meaning). The held row `refusal.IMAGE_TOO_LARGE` speaks of a page image to transcribe and does not fit a photo, so it is not used. Rows owed to the design: the member sentence of `IMAGE_TOO_LARGE` for a photo or an embedded image, and the two detail sentences (diagnostics a member does not read, K3944).

**Stale generated artifact (BOB regenerates at the round end).** `bio-plane/src/setup-words/rows.mjs` (`build.mjs --check` names `image-cover.index.image_too_large`). Not touched.

**New files:** `bio-plane/test/m/image-cover/hostile.mjs` and `limits.test.mjs`, both inside `tests`; none outside my `paths`.

**Failing first, then green** (G125c / R10, G124 / R11). RED on the unchanged source, `node --test limits.test.mjs`: seven of seven failed, e.g. `cover: TRUNCATED_IMAGE_DATA the PNG data ends before the image does: the image data ends at row 0 of 1` (the 70-byte PNG got past the header into the buffers), `cover: IMAGE_DATA_CORRUPT ... (TypeError)` (1,000,000 chunks), `cover: TRUNCATED_IMAGE_DATA ... EOI before SOS` (2,000,000 markers). GREEN after the change: 7 of 7. The memory-asking cases assert the call's peak `arrayBuffers` growth under 32 MiB. Platform check marked P: none (not GATED).

**Tests and checks.** `node --test --test-force-exit bio-plane/test/m/image-cover/`: 23 pass, 0 fail (`measure.test.mjs` alone: 1 pass). Users: doc-clean 42 tests, 0 fail; case-carriage 98 pass; case-disclosures 115 pass. `impact.mjs origin/tranche/T51 HEAD`: 59 of 176 modules; the three direct users above re-run. `checks/format.mjs` 0 failures; `architecture.mjs image-cover` 0 failures; `coverage.mjs image-cover` 11 of 11 ids named, 0 failures; `ownership.mjs image-cover tranche/T51 job/T51/image-cover` 0 failures; `checks/words.mjs`: no finding in image-cover (the tree-wide run shows others' findings, none here).

**Deferred / found in other modules:** none. The case-carriage and doc-clean consumers need no change: a refusal is `{ok:false, code:"IMAGE_TOO_LARGE"}` for them to carry (doc-clean job 16 and case-carriage read the new code).

Size (session_01JwFMfy4ht6vi8HQYUy47Nm): test runs 8, module lines 1348
