# capture (R085)

**Status** · session_01QG6bQ8xzeWQzwTQkGBvb2w · depth 2 · WORKING · handled B1

## Completion

- **Entry applied: R085-3, R92.** `uploadCapture` takes `type` (`bio-plane/src/capture/index.mjs`; `UPLOAD_TYPE_MAX` 255; a non-string or longer type is the required-argument refusal naming `type`, writing nothing). A text type (`acquisition.profilesAsText`: `text/*`, XML, JSON) over bytes that are valid UTF-8 with no NUL is the profile's declared content type, so `profiled_from_text: true`; every given type is recorded on the profile as `source_content_type` with `declared_by: "uploader"`, never as a header or transport. A text type over non-text bytes, or any other type, profiles the bytes as R86 does without it. Without `type`, unchanged (no `declared_by` key).
- **Reading I took (for BOB):** R92's test says "with its format determined". `format-registry` (`bio-plane/src/formats.mjs`) has no plain-text entry, so `profile.format.format` is `undetermined` for `text/plain` just as for a fetched `.txt`; that is not this module's to change. My test asserts what R92 can make true: `profiled_from_text: true`, `source_content_type: "text/plain"`, `declared_by: "uploader"`, and `format` judged from the declared type (its signals name `text/plain`). If Bob wants `format` to read a text format, `format-registry` needs a text entry (a REPORT against its requirements).
- **"Textual per format-registry":** the registry has no textual flag, so I used `acquisition`'s one text rule (`profilesAsText`).
- **Not mine, noted:** the SAFE_VIEW_ONLY refusal on opening a .txt was not examined here (control-plane/screens); `controlplane` `captureupload` must pass `type` (R085-4).
- **Deferred:** none. **Found in another module:** none beyond the above.
- **Tests:** `node --test test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs` (from `bio-plane/`): tests 154, pass 154, fail 0. New: three `R92` tests in `test/m/capture/upload.test.mjs`.
- **Checks:** format 170 modules, 0 failures; architecture 0 failures; coverage 45 of 45 live ids named, 0 failures; ownership 3 files changed by capture, 0 failures.

Size (session_01FvYpkWVNKobnL3zvXh2oyY): test runs 3, module lines 3353

## Completion · fix round 6 (B2, entry R085-31)

- **Entry applied: R085-31, R93.** `uploadCapture` (`bio-plane/src/capture/index.mjs`) reads an upload as text when no `type` is given (absent or empty) and its `name` ends `.txt`, `.md` or `.csv` (case-insensitive), under the same test R92 uses: the bytes are valid UTF-8 holding no NUL, and the type is a text type (`UPLOAD_NAME_TYPES`: `text/plain`, `text/markdown`, `text/csv`). Every other upload is unchanged.
- **Reading I took:** the name is not a declaration, so the profile records no `source_content_type` and no `declared_by` for it (the field is set to null where the name alone supplied the read). A declared `type` still wins over the name: a declared non-text type over a `.md` name profiles as R86 does.
- **Deferred:** none. **Found in another module:** none. Not touched: control-plane's upload door and acquisition's profile (only run, below).
- **Tests:** `node --test test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs` (from `bio-plane/`): 156 pass, 0 fail (two new R93 tests in `test/m/capture/upload.test.mjs`: the positive case, and the controls: `notes.bin`, a NUL in `notes.md`, a declared non-text type). Neighbours: `test/m/control-plane/r100-upload.test.mjs`, `test/m/control-plane/doors.test.mjs`, `test/m/acquisition/profile.test.mjs`: 15 pass, 0 fail.
- **Checks:** format 170 modules, 0 failures; architecture 0 failures; coverage 46 of 46 live ids named, 0 failures; ownership 3 files changed by capture between tranche/R085 and HEAD (the two source files and this record), 0 failures.

Size (session_01QG6bQ8xzeWQzwTQkGBvb2w): test runs 3, module lines 3374

## J1 · COMPLETE

R092 applied (R085-3): uploadCapture takes type; a text type over UTF-8 no-NUL bytes profiles from text (profiled_from_text true), every given type recorded as declared_by uploader. Tests 154 pass 0 fail (3 new R92 tests); format, architecture, coverage, ownership all 0 failures. One reading to confirm: formats.mjs has no plain-text entry, so profile.format stays undetermined for text/plain, as for a fetched .txt; my test asserts profiled_from_text, source_content_type, declared_by, not a determined format. See the record.
