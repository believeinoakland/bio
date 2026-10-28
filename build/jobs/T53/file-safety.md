# file-safety (T53)

**Status** · session_018Bhcef6MZXe2rVPpsmTu8D · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# file-safety · T53 · report

**Entries applied**
- T53-110 (A4; R60–R65, R67): a baseline JPEG or 8-bit PNG has a safe picture, made in this module by image-cover (`picture.mjs`, `#renderPicture`), queued and made by `renderBatch` (one render a tick), stored once under its own digest, never registered. `safeView` answers `{ok, kind:"picture", derived, of, sha256, content_type, width, height, file_says, file_says_held, left_out, original}`; `safeview?picture=1` serves the PNG (`x-file-safety` a short description). Serials and owner are in `file_says`; image id, artist, copyright holder are answered apart in `file_says_held` (BOB's low-level choice, for screens-intake). Tests: `picture.test.mjs` (pixels against Pillow's reference, byte search for markers/strings/coordinates, closed lists, hostile corpus, profile cases, visibility, lifecycle, no value in log/note/count/forward/scanner request).
- T53-111 (DEC-454): the partial-scan reason is in words beside its code (`reason_key`, `reason_words` on the `unscannable` reason), a key per limit, one for an unopenable kind, one general.
- T53-112 (R68): bytes `format-registry` calls `unlisted`/`refused` are graded `format_unchecked` (never read as an archive), answer `registry:{format,named}`; scanned, noted, held as any file.
- T53-113 (R69, R70): "Open the original" saves under the recorded name (provenance document's file name, stated name, archive path, else the archive listing), else digest + extension. A text file is drawn as `text`; as cells only when its recorded type or name is CSV.
- R71 (BOB's addition at the merge): `safeViewOfBytes({bytes, sha256, viewer, sheet, fromRow})`, a service for modules: digest check (`BYTES_CHANGED`, a new row C-140.46 with a stand-in sentence until the design's `refusal.BYTES_CHANGED`), same format check and route; a page view plants the bytes as a derived-area object for the render only and removes it after; no row, note, count written (`bytes-view.test.mjs`). A text file is a table there when its bytes are one (no record exists to ask).
- T53-114: already in place (`modules.json` 55/56, doorbell uses file-safety, nothing here imports doorbell). Nothing changed. Note: doorbell R31 wants a knock's bytes run "through file-safety's scan" and drawn as a document's safe view; this module has no service that takes bytes that are not yet a capture. Send a CHANGE if you want one.
- T53-115: the five English sites converted (absent, rows, view tests); the census now reads 0 for the module. **BOB deletes** the three lines of `build/tests-english-baseline.json` for `bio-plane/test/m/file-safety/{absent,rows,view}.test.mjs` (the ownership check refuses a job editing it).
- T53-510: tests read GRADE_READ_MAX / ODS bound from the table (`boundOf`), sized from it; opt-in `r57-standard-measure.test.mjs` (FILE_SAFETY_MEASURE_STANDARD=1) prints the measurements below.

**Not done**
- R66 (the container's other picture kinds): `test.todo`. The container client is not among this module's uses, and image-cover offers no redraw from decoded pixels. Needs BOB: an edge and a redraw-from-pixels entry.

**T53-510 measurement: a figure the module cannot hold.** `file_safety.grade_read` is 100 MiB active (standard). Whole reads at it, in a child process (test world; its store stub adds a copy, so production is lower but not by two thirds): a PDF of 100 MiB less a byte graded: 315 MiB above idle; a 96 MiB-pad DOCX graded: 290 MiB; platform headroom 206 MiB (isolate 256, idle 50). Do not hold. Drawn at their guards: a 1,000,000-row CSV view 184 MiB (holds, close), a 19 MiB-declared xlsx 58 MiB. I kept the behaviour; the fix is BOB's call: lower the row's standard (roughly 64 MiB or less), or a CHANGE to grade containers by directory ranges above a smaller figure (PDFs have no range reader).

**Found in other modules**
- screens-intake `open-file.test.mjs` (F-B15) pins a PNG photo as having no safe view; R60 changes that (job must update). screens-intake must read the `picture` kind and `picture=1`.
- `refusal.NO_SAFE_VIEW` words (design's table) should name photographs; my code detail says it but the table wins.
- record-core `purge` removes rows only; derived objects (safe views, copies, now pictures) stay in the store unreferenced.
- store-assembly's `safe_view` job is not registered for .png/.jpg names (R1's name rule); the scheduled `renderBatch` makes pictures regardless.
- mail-door's paths do not exist yet (the format check and my rows test, now tolerant).
- Tests of dependents red at this head (answer-envelope order/pins, store-assembly, op-declarations, affordances, scheduler, notice-producers) are not touched by this change except the screens-intake one above.

**Met** · R60, R61, R62, R63, R64, R65, R67, R68, R69, R70, R71

Tests: 161/163. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcef6MZXe2rVPpsmTu8D): test runs 1, module lines 3722

## Completion (2026-10-28)

# file-safety · T53 · report

**Entries applied**
- T53-110 (A4; R60–R65, R67): a baseline JPEG or 8-bit PNG has a safe picture, made in this module by image-cover (`picture.mjs`, `#renderPicture`), queued and made by `renderBatch` (one render a tick), stored once under its own digest, never registered. `safeView` answers `{ok, kind:"picture", derived, of, sha256, content_type, width, height, file_says, file_says_held, left_out, original}`; `safeview?picture=1` serves the PNG (`x-file-safety` a short description). Serials and owner are in `file_says`; image id, artist, copyright holder are answered apart in `file_says_held` (BOB's low-level choice, for screens-intake). Tests: `picture.test.mjs` (pixels against Pillow's reference, byte search for markers/strings/coordinates, closed lists, hostile corpus, profile cases, visibility, lifecycle, no value in log/note/count/forward/scanner request).
- T53-111 (DEC-454): the partial-scan reason is in words beside its code (`reason_key`, `reason_words` on the `unscannable` reason), a key per limit, one for an unopenable kind, one general.
- T53-112 (R68): bytes `format-registry` calls `unlisted`/`refused` are graded `format_unchecked` (never read as an archive), answer `registry:{format,named}`; scanned, noted, held as any file.
- T53-113 (R69, R70): "Open the original" saves under the recorded name (provenance document's file name, stated name, archive path, else the archive listing), else digest + extension. A text file is drawn as `text`; as cells only when its recorded type or name is CSV.
- R71 (BOB's addition at the merge): `safeViewOfBytes({bytes, sha256, viewer, sheet, fromRow})`, a service for modules: digest check (`BYTES_CHANGED`, a new row C-140.46 with a stand-in sentence until the design's `refusal.BYTES_CHANGED`), same format check and route; a page view plants the bytes as a derived-area object for the render only and removes it after; no row, note, count written (`bytes-view.test.mjs`). A text file is a table there when its bytes are one (no record exists to ask).
- T53-114: already in place (`modules.json` 55/56, doorbell uses file-safety, nothing here imports doorbell). Nothing changed. Note: doorbell R31 wants a knock's bytes run "through file-safety's scan" and drawn as a document's safe view; this module has no service that takes bytes that are not yet a capture. Send a CHANGE if you want one.
- T53-115: the five English sites converted (absent, rows, view tests); the census now reads 0 for the module. **BOB deletes** the three lines of `build/tests-english-baseline.json` for `bio-plane/test/m/file-safety/{absent,rows,view}.test.mjs` (the ownership check refuses a job editing it).
- T53-510: tests read GRADE_READ_MAX / ODS bound from the table (`boundOf`), sized from it; opt-in `r57-standard-measure.test.mjs` (FILE_SAFETY_MEASURE_STANDARD=1) prints the measurements below.

**Not done**
- R66 (the container's other picture kinds): `test.todo`. The container client is not among this module's uses, and image-cover offers no redraw from decoded pixels. Needs BOB: an edge and a redraw-from-pixels entry.

**T53-510 measurement: a figure the module cannot hold.** `file_safety.grade_read` is 100 MiB active (standard). Whole reads at it, in a child process (test world; its store stub adds a copy, so production is lower but not by two thirds): a PDF of 100 MiB less a byte graded: 315 MiB above idle; a 96 MiB-pad DOCX graded: 290 MiB; platform headroom 206 MiB (isolate 256, idle 50). Do not hold. Drawn at their guards: a 1,000,000-row CSV view 184 MiB (holds, close), a 19 MiB-declared xlsx 58 MiB. I kept the behaviour; the fix is BOB's call: lower the row's standard (roughly 64 MiB or less), or a CHANGE to grade containers by directory ranges above a smaller figure (PDFs have no range reader).

**Found in other modules**
- screens-intake `open-file.test.mjs` (F-B15) pins a PNG photo as having no safe view; R60 changes that (job must update). screens-intake must read the `picture` kind and `picture=1`.
- `refusal.NO_SAFE_VIEW` words (design's table) should name photographs; my code detail says it but the table wins.
- record-core `purge` removes rows only; derived objects (safe views, copies, now pictures) stay in the store unreferenced.
- store-assembly's `safe_view` job is not registered for .png/.jpg names (R1's name rule); the scheduled `renderBatch` makes pictures regardless.
- mail-door's paths do not exist yet (the format check and my rows test, now tolerant).
- Tests of dependents red at this head (answer-envelope order/pins, store-assembly, op-declarations, affordances, scheduler, notice-producers) are not touched by this change except the screens-intake one above.

**Met** · R60, R61, R62, R63, R64, R65, R67, R68, R69, R70, R71

**CHANGE (BOB #330, T53-510) applied.** Above `file_safety.grade_read`, an office/ODF package was already graded by its directory read by ranges; a ZIP no unpack had opened was not: acquisition's `archiveList` profiles an unopened archive whole (313 MiB peak for a 104 MiB ZIP). Now such a ZIP is graded from its central directory (high, `archive_not_opened`, entry count, encrypted member seen), and acquisition is asked only for an archive its records say was opened (`openedAmong`). Measured peak above idle: DOCX 104 MiB 4.5 MiB (a 300 MiB DOCX 4.7 MiB), ZIP 104 MiB 3.7 MiB. PDFs and other whole-read kinds above the bound answer as before. At the bound (not above) a whole read still does not hold: PDF 315, DOCX 290 MiB against 206 headroom, so the standard figure needs lowering by runtime-limits as you said. Tests (`r57-over-bound.test.mjs`, the opt-in measure test) are sized from `boundOf`. Finding for acquisition: `archiveList` of an unopened archive loads it whole.

Tests: 162/164. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcef6MZXe2rVPpsmTu8D): test runs 2, module lines 3733
