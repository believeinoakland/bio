# capture (R085)

**Status** · session_01FvYpkWVNKobnL3zvXh2oyY · depth 2 · WORKING · handled B0

## Completion

- **Entry applied: R085-3, R92.** `uploadCapture` takes `type` (`bio-plane/src/capture/index.mjs`; `UPLOAD_TYPE_MAX` 255; a non-string or longer type is the required-argument refusal naming `type`, writing nothing). A text type (`acquisition.profilesAsText`: `text/*`, XML, JSON) over bytes that are valid UTF-8 with no NUL is the profile's declared content type, so `profiled_from_text: true`; every given type is recorded on the profile as `source_content_type` with `declared_by: "uploader"`, never as a header or transport. A text type over non-text bytes, or any other type, profiles the bytes as R86 does without it. Without `type`, unchanged (no `declared_by` key).
- **Reading I took (for BOB):** R92's test says "with its format determined". `format-registry` (`bio-plane/src/formats.mjs`) has no plain-text entry, so `profile.format.format` is `undetermined` for `text/plain` just as for a fetched `.txt`; that is not this module's to change. My test asserts what R92 can make true: `profiled_from_text: true`, `source_content_type: "text/plain"`, `declared_by: "uploader"`, and `format` judged from the declared type (its signals name `text/plain`). If Bob wants `format` to read a text format, `format-registry` needs a text entry (a REPORT against its requirements).
- **"Textual per format-registry":** the registry has no textual flag, so I used `acquisition`'s one text rule (`profilesAsText`).
- **Not mine, noted:** the SAFE_VIEW_ONLY refusal on opening a .txt was not examined here (control-plane/screens); `controlplane` `captureupload` must pass `type` (R085-4).
- **Deferred:** none. **Found in another module:** none beyond the above.
- **Tests:** `node --test test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs` (from `bio-plane/`): tests 154, pass 154, fail 0. New: three `R92` tests in `test/m/capture/upload.test.mjs`.
- **Checks:** format 170 modules, 0 failures; architecture 0 failures; coverage 45 of 45 live ids named, 0 failures; ownership 3 files changed by capture, 0 failures.

Size (session_01FvYpkWVNKobnL3zvXh2oyY): test runs 3, module lines 3353
