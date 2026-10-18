# image-cover (T51)

**Status** · session_01CSjPbRFbq35fHhD3md1yuV · depth 2 · WORKING · handled B0

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
