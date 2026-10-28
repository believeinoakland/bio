# runtime-limits (T53)

**Status** · session_018BhcegsnZTq6ndhV2RKA4f · depth 2 · WORKING
**Sessions** · 1

## Completion (2026-10-27)

# runtime-limits · T53 · report

**Entries applied**
- T53-22 (N1267; R37, R38-R40 rows; PL20, PL21, PL45): the beta's per-kind bounds are the active figure (`standard`) of the whole-read row of each kind: `pdf.bytes`, new `document.bytes` (100 MB) and `document.pages` (5,000), `text.bytes`/`json.bytes`/`xml.bytes` 100 MB (K5427; csv/tsv stay 50 MB), new `spreadsheet.bytes`/`rows`/`xls_sheet_rows` (50 MB, 1,048,576, 65,536), new `image.bytes` (50 MB), `archive.uploaded_bytes` (500 MB), new `message.bytes` (100 MB). The alpha stays in each row's `alpha` column. `BETA_STANDARD_ROWS` lists the rows whose active figure is the standard. New protective rows: `archive.mailbox_messages` 100,000, `json.nesting` and `xml.nesting` 1,000, `text.calendar_events` 100,000. `wholeReadRow` gains `document`, `spreadsheet`, `image`, `message`, `archive` (every earlier answer unchanged). Row names are listed above.
- T53-25 (R38-R40): kind `level` rows `team`, `institution`, `enterprise`; `levelOf(copy)` reads `{design_stage, cf_plan}` (`one_room`/`split_record`/`split_cached`; `workers_paid`/`business`/`enterprise`); `levelFigures(level)` throws a TypeError naming an unmeasured level; `levelFiguresOf(row)` is the same test on a given row (the fixture seam). The interpretation ceiling is two fields of each level row (`interpretation_rows`, `interpretation_bytes`), null until recorded. `measured` is null for all three.
- T53-23 (R41, R42): kind `time`, the thirteen classes; `budgetOf(class | {class, ceiling_ms})`; an override above the class is refused naming it.
- T53-24 (R43-R45): `STORE_JURISDICTIONS`, `storeJurisdiction`; `storeId`/`storeStub` take the room from `STORE.jurisdiction(j)`; hint plus jurisdiction throws `STORE_PLACE_CONFLICT`; the generation suffix applies. No bucket or install in this module.
- T53-26 (R46): `mail` rows (message_bytes 25 MiB, per_member_hour 20, per_team_day 200, waiting_days 14, nest_max 3, nest_read_max 4) and `doorbell.discard_days` 7. R47's `REGISTER_STREAM_MAX` / `REGISTER_SEGMENT_MAX` rows are NOT added: they wait on measure M-R7, which is not recorded (R47: "until it is recorded the rows do not exist"); `test.todo` names R47.
- T53-27 (K5565): the module's English-in-test sites removed (negative regexes on retired sentences, now implied by the word-key equality already asserted; the cpu note's prose regexes reduced to a non-empty-string check; R3/R24 still assert `measured_ms: null`). The words check now finds none in the module's tests; the baseline line `bio-plane/test/m/runtime-limits/runtime-limits.test.mjs: 2` in `build/tests-english-baseline.json` is for BOB to delete (the ownership check refuses a module job editing that shared file).

**Not done / decisions for BOB**
1. R37 asks that each whole-read ceiling's active figure be the beta's. I flipped only the whole-read row of each kind (`wholeReadRow`'s rows). I did not flip the readers' own rows (`pdf.worker_bytes`, `document.clean_bytes`, `file_safety.grade_read`, `office.text_bytes`, `office.streamed_text_bytes`, `xlsx.declared_text`, `ods.content_xml`, `sheet_worker.bytes`, `image.cover_bytes`, `archive.unpacked_bytes`, `archive.member_bytes`, `scan.max_bytes`): flipping them made the ooxml, office-readers, odf-reader, doc-clean and file-safety suites red (they pin the 20 MiB / 256 MiB figures and tie `ARCHIVE_TOTAL_MAX` and `MEMBER_MAX` to `unpacked_bytes`). Their standards are already the beta's figures; each reader's job moves its rows. `archive.unpacked_bytes` stays at 256 MiB active, so the 2 GB unpacked beta figure is in the table but not yet active.
2. Level figures: `members_at_once` is null for all levels and the record/upload figures are the draft's estimates (Level 1: database 10 GiB, R2 50 GiB, upload 100 MB; Level 2 upload 200 MiB; Level 3 upload 5 GiB; unbuilt record figures null). None reach a caller while `measured` is null.
3. The design-stage and plan identifiers above are my choice; the installer's job should declare the copy in that shape.

**Found in other modules**
- `acquisition`: `CAPTURE_MAX = boundOf("archive", "uploaded_bytes")` is now 500 MB, so its tests "R10: CAPTURE_MAX … is 256 MiB" and "R10: hashed as it arrives …" are red against this change (they pin 256 MiB). Acquisition's job updates them to the beta figure (or decides the capture stays at the alpha until its streaming is proven).
- Readers quoting `pdf.bytes` (control-plane's inline gate, capture) now see 100 MB; their jobs confirm their memory at that size.

**Met** · R37, R38, R39, R40, R41, R42, R43, R44, R45, R46

Tests: 76/77. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegsnZTq6ndhV2RKA4f): test runs 1, module lines 708

## Completion (2026-10-27)

# runtime-limits · T53 · report

**Entries applied**
- T53-22 (N1267; R37, R38-R40 rows; PL20, PL21, PL45): the beta's per-kind bounds are the active figure (`standard`) of the whole-read row of each kind: `pdf.bytes`, new `document.bytes` (100 MB) and `document.pages` (5,000), `text.bytes`/`json.bytes`/`xml.bytes` 100 MB (K5427; csv/tsv stay 50 MB), new `spreadsheet.bytes`/`rows`/`xls_sheet_rows` (50 MB, 1,048,576, 65,536), new `image.bytes` (50 MB), `archive.uploaded_bytes` (500 MB), new `message.bytes` (100 MB). The alpha stays in each row's `alpha` column. `BETA_STANDARD_ROWS` lists the rows whose active figure is the standard. New protective rows: `archive.mailbox_messages` 100,000, `json.nesting` and `xml.nesting` 1,000, `text.calendar_events` 100,000. `wholeReadRow` gains `document`, `spreadsheet`, `image`, `message`, `archive` (every earlier answer unchanged). Row names are listed above.
- T53-25 (R38-R40): kind `level` rows `team`, `institution`, `enterprise`; `levelOf(copy)` reads `{design_stage, cf_plan}` (`one_room`/`split_record`/`split_cached`; `workers_paid`/`business`/`enterprise`); `levelFigures(level)` throws a TypeError naming an unmeasured level; `levelFiguresOf(row)` is the same test on a given row (the fixture seam). The interpretation ceiling is two fields of each level row (`interpretation_rows`, `interpretation_bytes`), null until recorded. `measured` is null for all three.
- T53-23 (R41, R42): kind `time`, the thirteen classes; `budgetOf(class | {class, ceiling_ms})`; an override above the class is refused naming it.
- T53-24 (R43-R45): `STORE_JURISDICTIONS`, `storeJurisdiction`; `storeId`/`storeStub` take the room from `STORE.jurisdiction(j)`; hint plus jurisdiction throws `STORE_PLACE_CONFLICT`; the generation suffix applies. No bucket or install in this module.
- T53-26 (R46): `mail` rows (message_bytes 25 MiB, per_member_hour 20, per_team_day 200, waiting_days 14, nest_max 3, nest_read_max 4) and `doorbell.discard_days` 7. R47's `REGISTER_STREAM_MAX` / `REGISTER_SEGMENT_MAX` rows are NOT added: they wait on measure M-R7, which is not recorded (R47: "until it is recorded the rows do not exist"); `test.todo` names R47.
- T53-27 (K5565): the module's English-in-test sites removed (negative regexes on retired sentences, now implied by the word-key equality already asserted; the cpu note's prose regexes reduced to a non-empty-string check; R3/R24 still assert `measured_ms: null`). The words check now finds none in the module's tests; the baseline line `bio-plane/test/m/runtime-limits/runtime-limits.test.mjs: 2` in `build/tests-english-baseline.json` is for BOB to delete (the ownership check refuses a module job editing that shared file).

**Not done / decisions for BOB**
1. R37 asks that each whole-read ceiling's active figure be the beta's. I flipped only the whole-read row of each kind (`wholeReadRow`'s rows). I did not flip the readers' own rows (`pdf.worker_bytes`, `document.clean_bytes`, `file_safety.grade_read`, `office.text_bytes`, `office.streamed_text_bytes`, `xlsx.declared_text`, `ods.content_xml`, `sheet_worker.bytes`, `image.cover_bytes`, `archive.unpacked_bytes`, `archive.member_bytes`, `scan.max_bytes`): flipping them made the ooxml, office-readers, odf-reader, doc-clean and file-safety suites red (they pin the 20 MiB / 256 MiB figures and tie `ARCHIVE_TOTAL_MAX` and `MEMBER_MAX` to `unpacked_bytes`). Their standards are already the beta's figures; each reader's job moves its rows. `archive.unpacked_bytes` stays at 256 MiB active, so the 2 GB unpacked beta figure is in the table but not yet active.
2. Level figures: `members_at_once` is null for all levels and the record/upload figures are the draft's estimates (Level 1: database 10 GiB, R2 50 GiB, upload 100 MB; Level 2 upload 200 MiB; Level 3 upload 5 GiB; unbuilt record figures null). None reach a caller while `measured` is null.
3. The design-stage and plan identifiers above are my choice; the installer's job should declare the copy in that shape.

**Found in other modules**
- `acquisition`: `CAPTURE_MAX = boundOf("archive", "uploaded_bytes")` is now 500 MB, so its tests "R10: CAPTURE_MAX … is 256 MiB" and "R10: hashed as it arrives …" are red against this change (they pin 256 MiB). Acquisition's job updates them to the beta figure (or decides the capture stays at the alpha until its streaming is proven).
- Readers quoting `pdf.bytes` (control-plane's inline gate, capture) now see 100 MB; their jobs confirm their memory at that size.

**Met** · R37, R38, R39, R40, R41, R42, R43, R44, R45, R46

**CHANGE (BOB #326, K5578 (2))** · row names set: `text.nesting` 1,000 (replaces my `json.nesting`/`xml.nesting`, never merged), `message.upload_bytes` 100 MiB (renamed from `message.bytes`; `wholeReadRow("message")` follows). All other K5578 names already existed under those names: text.bytes, text.calendar_events, document.bytes/pages, spreadsheet.bytes/rows, image.bytes, archive.uploaded_bytes/unpacked_bytes/members/ratio/mailbox_messages. No aliases. One open point: `archive.unpacked_bytes` is 2 GiB in `standard` but its active figure is still 256 MiB (flipping it turns the ooxml/office suites red).

Tests: 76/77. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegsnZTq6ndhV2RKA4f): test runs 2, module lines 709

## Completion (2026-10-28)

# runtime-limits · T53 · report

**Entries applied**
- T53-22 (N1267; R37, R38-R40 rows; PL20, PL21, PL45): the beta's per-kind bounds are the active figure (`standard`) of the whole-read row of each kind: `pdf.bytes`, new `document.bytes` (100 MB) and `document.pages` (5,000), `text.bytes`/`json.bytes`/`xml.bytes` 100 MB (K5427; csv/tsv stay 50 MB), new `spreadsheet.bytes`/`rows`/`xls_sheet_rows` (50 MB, 1,048,576, 65,536), new `image.bytes` (50 MB), `archive.uploaded_bytes` (500 MB), new `message.bytes` (100 MB). The alpha stays in each row's `alpha` column. `BETA_STANDARD_ROWS` lists the rows whose active figure is the standard. New protective rows: `archive.mailbox_messages` 100,000, `json.nesting` and `xml.nesting` 1,000, `text.calendar_events` 100,000. `wholeReadRow` gains `document`, `spreadsheet`, `image`, `message`, `archive` (every earlier answer unchanged). Row names are listed above.
- T53-25 (R38-R40): kind `level` rows `team`, `institution`, `enterprise`; `levelOf(copy)` reads `{design_stage, cf_plan}` (`one_room`/`split_record`/`split_cached`; `workers_paid`/`business`/`enterprise`); `levelFigures(level)` throws a TypeError naming an unmeasured level; `levelFiguresOf(row)` is the same test on a given row (the fixture seam). The interpretation ceiling is two fields of each level row (`interpretation_rows`, `interpretation_bytes`), null until recorded. `measured` is null for all three.
- T53-23 (R41, R42): kind `time`, the thirteen classes; `budgetOf(class | {class, ceiling_ms})`; an override above the class is refused naming it.
- T53-24 (R43-R45): `STORE_JURISDICTIONS`, `storeJurisdiction`; `storeId`/`storeStub` take the room from `STORE.jurisdiction(j)`; hint plus jurisdiction throws `STORE_PLACE_CONFLICT`; the generation suffix applies. No bucket or install in this module.
- T53-26 (R46): `mail` rows (message_bytes 25 MiB, per_member_hour 20, per_team_day 200, waiting_days 14, nest_max 3, nest_read_max 4) and `doorbell.discard_days` 7. R47's `REGISTER_STREAM_MAX` / `REGISTER_SEGMENT_MAX` rows are NOT added: they wait on measure M-R7, which is not recorded (R47: "until it is recorded the rows do not exist"); `test.todo` names R47.
- T53-27 (K5565): the module's English-in-test sites removed (negative regexes on retired sentences, now implied by the word-key equality already asserted; the cpu note's prose regexes reduced to a non-empty-string check; R3/R24 still assert `measured_ms: null`). The words check now finds none in the module's tests; the baseline line `bio-plane/test/m/runtime-limits/runtime-limits.test.mjs: 2` in `build/tests-english-baseline.json` is for BOB to delete (the ownership check refuses a module job editing that shared file).

**Not done / decisions for BOB**
1. R37 asks that each whole-read ceiling's active figure be the beta's. I flipped only the whole-read row of each kind (`wholeReadRow`'s rows). I did not flip the readers' own rows (`pdf.worker_bytes`, `document.clean_bytes`, `file_safety.grade_read`, `office.text_bytes`, `office.streamed_text_bytes`, `xlsx.declared_text`, `ods.content_xml`, `sheet_worker.bytes`, `image.cover_bytes`, `archive.unpacked_bytes`, `archive.member_bytes`, `scan.max_bytes`): flipping them made the ooxml, office-readers, odf-reader, doc-clean and file-safety suites red (they pin the 20 MiB / 256 MiB figures and tie `ARCHIVE_TOTAL_MAX` and `MEMBER_MAX` to `unpacked_bytes`). Their standards are already the beta's figures; each reader's job moves its rows. `archive.unpacked_bytes` stays at 256 MiB active, so the 2 GB unpacked beta figure is in the table but not yet active.
2. Level figures: `members_at_once` is null for all levels and the record/upload figures are the draft's estimates (Level 1: database 10 GiB, R2 50 GiB, upload 100 MB; Level 2 upload 200 MiB; Level 3 upload 5 GiB; unbuilt record figures null). None reach a caller while `measured` is null.
3. The design-stage and plan identifiers above are my choice; the installer's job should declare the copy in that shape.

**Found in other modules**
- `acquisition`: `CAPTURE_MAX = boundOf("archive", "uploaded_bytes")` is now 500 MB, so its tests "R10: CAPTURE_MAX … is 256 MiB" and "R10: hashed as it arrives …" are red against this change (they pin 256 MiB). Acquisition's job updates them to the beta figure (or decides the capture stays at the alpha until its streaming is proven).
- Readers quoting `pdf.bytes` (control-plane's inline gate, capture) now see 100 MB; their jobs confirm their memory at that size.

**Met** · R37, R38, R39, R40, R41, R42, R43, R44, R45, R46

**CHANGE (BOB #326, K5578 (2))** · row names set: `text.nesting` 1,000 (replaces my `json.nesting`/`xml.nesting`, never merged), `message.upload_bytes` 100 MiB (renamed from `message.bytes`; `wholeReadRow("message")` follows). All other K5578 names already existed under those names: text.bytes, text.calendar_events, document.bytes/pages, spreadsheet.bytes/rows, image.bytes, archive.uploaded_bytes/unpacked_bytes/members/ratio/mailbox_messages. No aliases. One open point: `archive.unpacked_bytes` is 2 GiB in `standard` but its active figure is still 256 MiB (flipping it turns the ooxml/office suites red).

**CHANGE (BOB #326)** · image-cover's ten rows added to the `image` block, each one figure in all three columns: redraw_bytes, photo_profile_max, photo_profile_tags, photo_exif_bytes, photo_directory_entries, photo_field_chars, photo_text_chars, photo_list_items, photo_xmp_bytes, photo_inflated_bytes. `archive.unpacked_bytes` stays active at 256 MiB, per BOB.

Tests: 77/78. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegsnZTq6ndhV2RKA4f): test runs 3, module lines 720
