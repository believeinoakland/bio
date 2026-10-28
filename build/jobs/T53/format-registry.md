# format-registry (T53)

**Status** · session_018BhcegEQXWdwyKyz85ehDj · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# FORMAT-REGISTRY #1 · T53 report

**Entries applied**
- T53-42 (N1266): the roster by content in `bio-plane/src/formats.mjs`: `gif`, `tiff`, `webp`, `bmp`, `jp2`, `heic`, `heif`, `avif` (asked with `jpeg`, `png` before `html` and `pdf`), `rtf`, `doc`, `xls`, `ppt` (by the stream names of the compound file), `tar`, `gz`, `7z`, and `text` (a fallback entry, asked after the content-type and name passes). Content over name (R34: a disagreeing name adds one signal), macro and template variants (R36), encrypted (R37), the held-and-named `unlisted` classifier (R38) and the `refused` set (R39). `kindTable()` and `formatNameFor()` exported.
- T53-43 (DEC-467): `kindTable()` answers `{key, state, kind_key, limit}` for every roster key, named unlisted type and refused type; `limit` is `{class, figures:[{what, row, bound, key}]}` read through `read-bounds`, never a literal.
- T53-44 (DEC-473): `formatNameFor(answer)` → `{name, kind_key, text, reason_key?}` by R43's map (the 48 `file.kind.*` keys all reached); a refusal also gives `reason_key`.

**Not done, and why (waits: a CHANGE when each arrives)**
- R33/R35: the entries of `structured-text-reader` (json, ndjson, xml, svg, kml, kmz, geojson, ics, vcf, srt, vtt) and `mail-reader` (eml, msg, mbox) are not registered: neither module exists on the tranche yet (modules.json `paths` empty). `test.todo`s name them. Their rows in `kindTable` already exist.
- R42 limits: runtime-limits' per-kind rows (its R37) do not exist yet; `LIMIT_CLASSES` names the rows I expect (document.bytes/pages, spreadsheet.bytes/rows/xls_rows, text.bytes/nesting/events, image.bytes, mail.*, kept.bytes_50/100); a figure whose row is absent answers `bound: null`. When runtime-limits lists its row names, edit that one table. `test.todo` names it.

**Requirement defects found (BOB's to settle; each choice is one line to flip)**
1. R12/R27 say a no-hit is `undetermined`; R38 says a file of no determinable type is `unlisted` with `named: null`; R35's test says a random 1 MB file is `undetermined`. Built: bytes with no hit are `unlisted`/`named: null` with R12's two reasons when the registry holds its `text` fallback (the roster's closure), else R12's `undetermined` (an emptied registry, no bytes). R12's own tests stand.
2. R33's list holds `tsv` and `xlsm` but `listFormats()` cannot equal it: csv-reader answers a tab table as `csv` (with its dialect) and R36 answers an `.xlsm` as `xlsx` + `macros: true`. Neither is a registry key here.
3. R33 asks `confidence: "certain"` for every type; R28 keeps `zip` and the OPC entries (`docx`, `xlsx`, `pptx`, from `office-readers`) `likely` (the content-type map is deflated). Left as R28 says.
4. R37 "an Office file in an encrypted container, answered with its type": the container does not say docx/xlsx/pptx; the type is taken from the name or declared type, else `unlisted` + `encrypted: true`. An encrypted 7z is not detected as encrypted.

**Found in other modules** (my answers changed what they receive)
- `acquisition` (index.mjs:1813, 2148; 4 tests: R101 controls, R17 R10) and `reading-pipeline` (index.mjs:1664, 2153, 2833, 2975, 3018; 14 tests: R49 UTF-16, R50 big text/json/xml) test `format !== "undetermined"` as "a known format". They now also receive `text` (valid text), `unlisted` and `refused`. Each needs a CHANGE to read them (text is a text reading; unlisted is held, R38/RF10; refused is not filed, RF11). Before my change these tests passed.
- Stale generated artifact: `bio-plane/src/setup-words/rows.mjs` (new `format-registry.formats.*` localize ids); `proc merge` regenerates it.
- My tests amended by name: R23 roster pins (builtins, pictures, registry, zip tests), R9/R12/R13/R25/R27/R31/R32 pins of `undetermined` for text or binary bytes, R28's fixtures for template flavours.

**Met** · R34, R36, R37, R38, R39, R40, R41, R43

Tests: 73/77. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegEQXWdwyKyz85ehDj): test runs 1, module lines 954

## Completion (2026-10-27)

# FORMAT-REGISTRY #1 · T53 report

**Entries applied**
- T53-42 (N1266): the roster by content in `bio-plane/src/formats.mjs`: `gif`, `tiff`, `webp`, `bmp`, `jp2`, `heic`, `heif`, `avif` (asked with `jpeg`, `png` before `html` and `pdf`), `rtf`, `doc`, `xls`, `ppt` (by the stream names of the compound file), `tar`, `gz`, `7z`, and `text` (a fallback entry, asked after the content-type and name passes). Content over name (R34: a disagreeing name adds one signal), macro and template variants (R36), encrypted (R37), the held-and-named `unlisted` classifier (R38) and the `refused` set (R39). `kindTable()` and `formatNameFor()` exported.
- T53-43 (DEC-467): `kindTable()` answers `{key, state, kind_key, limit}` for every roster key, named unlisted type and refused type; `limit` is `{class, figures:[{what, row, bound, key}]}` read through `read-bounds`, never a literal.
- T53-44 (DEC-473): `formatNameFor(answer)` → `{name, kind_key, text, reason_key?}` by R43's map (the 48 `file.kind.*` keys all reached); a refusal also gives `reason_key`.

**Not done, and why (waits: a CHANGE when each arrives)**
- R33/R35: the entries of `structured-text-reader` (json, ndjson, xml, svg, kml, kmz, geojson, ics, vcf, srt, vtt) and `mail-reader` (eml, msg, mbox) are not registered: neither module exists on the tranche yet (modules.json `paths` empty). `test.todo`s name them. Their rows in `kindTable` already exist.
- R42 limits: runtime-limits' per-kind rows (its R37) do not exist yet; `LIMIT_CLASSES` names the rows I expect (document.bytes/pages, spreadsheet.bytes/rows/xls_rows, text.bytes/nesting/events, image.bytes, mail.*, kept.bytes_50/100); a figure whose row is absent answers `bound: null`. When runtime-limits lists its row names, edit that one table. `test.todo` names it.

**Requirement defects found (BOB's to settle; each choice is one line to flip)**
1. R12/R27 say a no-hit is `undetermined`; R38 says a file of no determinable type is `unlisted` with `named: null`; R35's test says a random 1 MB file is `undetermined`. Built: bytes with no hit are `unlisted`/`named: null` with R12's two reasons when the registry holds its `text` fallback (the roster's closure), else R12's `undetermined` (an emptied registry, no bytes). R12's own tests stand.
2. R33's list holds `tsv` and `xlsm` but `listFormats()` cannot equal it: csv-reader answers a tab table as `csv` (with its dialect) and R36 answers an `.xlsm` as `xlsx` + `macros: true`. Neither is a registry key here.
3. R33 asks `confidence: "certain"` for every type; R28 keeps `zip` and the OPC entries (`docx`, `xlsx`, `pptx`, from `office-readers`) `likely` (the content-type map is deflated). Left as R28 says.
4. R37 "an Office file in an encrypted container, answered with its type": the container does not say docx/xlsx/pptx; the type is taken from the name or declared type, else `unlisted` + `encrypted: true`. An encrypted 7z is not detected as encrypted.

**Found in other modules** (my answers changed what they receive)
- `acquisition` (index.mjs:1813, 2148; 4 tests: R101 controls, R17 R10) and `reading-pipeline` (index.mjs:1664, 2153, 2833, 2975, 3018; 14 tests: R49 UTF-16, R50 big text/json/xml) test `format !== "undetermined"` as "a known format". They now also receive `text` (valid text), `unlisted` and `refused`. Each needs a CHANGE to read them (text is a text reading; unlisted is held, R38/RF10; refused is not filed, RF11). Before my change these tests passed.
- Stale generated artifact: `bio-plane/src/setup-words/rows.mjs` (new `format-registry.formats.*` localize ids); `proc merge` regenerates it.
- My tests amended by name: R23 roster pins (builtins, pictures, registry, zip tests), R9/R12/R13/R25/R27/R31/R32 pins of `undetermined` for text or binary bytes, R28's fixtures for template flavours.

**Met** · R34, R36, R37, R38, R39, R40, R41, R43

Tests: 73/77. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegEQXWdwyKyz85ehDj): test runs 2, module lines 954

## Completion (2026-10-28)

# FORMAT-REGISTRY #1 · T53 report

**Entries applied**
- T53-42 (N1266): the roster by content in `bio-plane/src/formats.mjs`: `gif`, `tiff`, `webp`, `bmp`, `jp2`, `heic`, `heif`, `avif` (asked with `jpeg`, `png` before `html` and `pdf`), `rtf`, `doc`, `xls`, `ppt` (by the stream names of the compound file), `tar`, `gz`, `7z`, and `text` (a fallback entry, asked after the content-type and name passes). Content over name (R34: a disagreeing name adds one signal), macro and template variants (R36), encrypted (R37), the held-and-named `unlisted` classifier (R38) and the `refused` set (R39). `kindTable()` and `formatNameFor()` exported.
- T53-43 (DEC-467): `kindTable()` answers `{key, state, kind_key, limit}` for every roster key, named unlisted type and refused type; `limit` is `{class, figures:[{what, row, bound, key}]}` read through `read-bounds`, never a literal.
- T53-44 (DEC-473): `formatNameFor(answer)` → `{name, kind_key, text, reason_key?}` by R43's map (the 48 `file.kind.*` keys all reached); a refusal also gives `reason_key`.

**Not done, and why (waits: a CHANGE when each arrives)**
- R33/R35: the entries of `structured-text-reader` (json, ndjson, xml, svg, kml, kmz, geojson, ics, vcf, srt, vtt) and `mail-reader` (eml, msg, mbox) are not registered: neither module exists on the tranche yet (modules.json `paths` empty). `test.todo`s name them. Their rows in `kindTable` already exist.
- (R42 limits now done: CHANGE after runtime-limits merged, K5602.)

**Requirement defects found (BOB's to settle; each choice is one line to flip)**
1. R12/R27 say a no-hit is `undetermined`; R38 says a file of no determinable type is `unlisted` with `named: null`; R35's test says a random 1 MB file is `undetermined`. Built: bytes with no hit are `unlisted`/`named: null` with R12's two reasons when the registry holds its `text` fallback (the roster's closure), else R12's `undetermined` (an emptied registry, no bytes). R12's own tests stand.
2. R33's list holds `tsv` and `xlsm` but `listFormats()` cannot equal it: csv-reader answers a tab table as `csv` (with its dialect) and R36 answers an `.xlsm` as `xlsx` + `macros: true`. Neither is a registry key here.
3. R33 asks `confidence: "certain"` for every type; R28 keeps `zip` and the OPC entries (`docx`, `xlsx`, `pptx`, from `office-readers`) `likely` (the content-type map is deflated). Left as R28 says.
4. R37 "an Office file in an encrypted container, answered with its type": the container does not say docx/xlsx/pptx; the type is taken from the name or declared type, else `unlisted` + `encrypted: true`. An encrypted 7z is not detected as encrypted.

**Found in other modules** (my answers changed what they receive)
- `acquisition` (index.mjs:1813, 2148; 4 tests: R101 controls, R17 R10) and `reading-pipeline` (index.mjs:1664, 2153, 2833, 2975, 3018; 14 tests: R49 UTF-16, R50 big text/json/xml) test `format !== "undetermined"` as "a known format". They now also receive `text` (valid text), `unlisted` and `refused`. Each needs a CHANGE to read them (text is a text reading; unlisted is held, R38/RF10; refused is not filed, RF11). Before my change these tests passed.
- Stale generated artifact: `bio-plane/src/setup-words/rows.mjs` (new `format-registry.formats.*` localize ids); `proc merge` regenerates it.
- My tests amended by name: R23 roster pins (builtins, pictures, registry, zip tests), R9/R12/R13/R25/R27/R31/R32 pins of `undetermined` for text or binary bytes, R28's fixtures for template flavours.

**CHANGE (K5602):** tranche merged; `kindTable()` limits read the real rows (`boundOf` of document, spreadsheet incl. `xls_sheet_rows`, text incl. `nesting`/`calendar_events`, image, archive incl. `mailbox_messages`, message, mail `message_bytes`). R42 gives the kept kinds no row of their own: kept data kinds (mdb, accdb, sqlite, parquet, xlsb, shapefile, gpkg) take `spreadsheet.bytes` (50 MiB), the other kept kinds incl. audio and video `document.bytes` (100 MiB); BOB may name rows instead (one table, `LIMIT_CLASSES`). Found in runtime-limits: `boundOf("archive","unpacked_bytes")` answers 256 MiB (the alpha column), not R37's 2 GiB.

**Met** · R34, R36, R37, R38, R39, R40, R41, R42, R43

Tests: 74/77. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegEQXWdwyKyz85ehDj): test runs 3, module lines 955

## Completion (2026-10-28)

# FORMAT-REGISTRY #1 · T53 report

**Entries applied**
- T53-42 (N1266): the roster by content in `bio-plane/src/formats.mjs`: `gif`, `tiff`, `webp`, `bmp`, `jp2`, `heic`, `heif`, `avif` (asked with `jpeg`, `png` before `html` and `pdf`), `rtf`, `doc`, `xls`, `ppt` (by the stream names of the compound file), `tar`, `gz`, `7z`, and `text` (a fallback entry, asked after the content-type and name passes). Content over name (R34: a disagreeing name adds one signal), macro and template variants (R36), encrypted (R37), the held-and-named `unlisted` classifier (R38) and the `refused` set (R39). `kindTable()` and `formatNameFor()` exported.
- T53-43 (DEC-467): `kindTable()` answers `{key, state, kind_key, limit}` for every roster key, named unlisted type and refused type; `limit` is `{class, figures:[{what, row, bound, key}]}` read through `read-bounds`, never a literal.
- T53-44 (DEC-473): `formatNameFor(answer)` → `{name, kind_key, text, reason_key?}` by R43's map (the 48 `file.kind.*` keys all reached); a refusal also gives `reason_key`.

**Not done, and why (waits: a CHANGE when each arrives)**
- R33/R35: the entries of `structured-text-reader` (json, ndjson, xml, svg, kml, kmz, geojson, ics, vcf, srt, vtt) and `mail-reader` (eml, msg, mbox) are not registered: neither module exists on the tranche yet (modules.json `paths` empty). `test.todo`s name them. Their rows in `kindTable` already exist.
- (R42 limits now done: CHANGE after runtime-limits merged, K5602.)

**Requirement defects found (BOB's to settle; each choice is one line to flip)**
1. R12/R27 say a no-hit is `undetermined`; R38 says a file of no determinable type is `unlisted` with `named: null`; R35's test says a random 1 MB file is `undetermined`. Built: bytes with no hit are `unlisted`/`named: null` with R12's two reasons when the registry holds its `text` fallback (the roster's closure), else R12's `undetermined` (an emptied registry, no bytes). R12's own tests stand.
2. R33's list holds `tsv` and `xlsm` but `listFormats()` cannot equal it: csv-reader answers a tab table as `csv` (with its dialect) and R36 answers an `.xlsm` as `xlsx` + `macros: true`. Neither is a registry key here.
3. R33 asks `confidence: "certain"` for every type; R28 keeps `zip` and the OPC entries (`docx`, `xlsx`, `pptx`, from `office-readers`) `likely` (the content-type map is deflated). Left as R28 says.
4. R37 "an Office file in an encrypted container, answered with its type": the container does not say docx/xlsx/pptx; the type is taken from the name or declared type, else `unlisted` + `encrypted: true`. An encrypted 7z is not detected as encrypted.

**Found in other modules** (my answers changed what they receive)
- `acquisition` (index.mjs:1813, 2148; 4 tests: R101 controls, R17 R10) and `reading-pipeline` (index.mjs:1664, 2153, 2833, 2975, 3018; 14 tests: R49 UTF-16, R50 big text/json/xml) test `format !== "undetermined"` as "a known format". They now also receive `text` (valid text), `unlisted` and `refused`. Each needs a CHANGE to read them (text is a text reading; unlisted is held, R38/RF10; refused is not filed, RF11). Before my change these tests passed.
- Stale generated artifact: `bio-plane/src/setup-words/rows.mjs` (new `format-registry.formats.*` localize ids); `proc merge` regenerates it.
- My tests amended by name: R23 roster pins (builtins, pictures, registry, zip tests), R9/R12/R13/R25/R27/R31/R32 pins of `undetermined` for text or binary bytes, R28's fixtures for template flavours.

**CHANGE (K5602):** tranche merged; `kindTable()` limits read the real rows (`boundOf` of document, spreadsheet incl. `xls_sheet_rows`, text incl. `nesting`/`calendar_events`, image, archive incl. `mailbox_messages`, message, mail `message_bytes`). R42 gives the kept kinds no row of their own: kept data kinds (mdb, accdb, sqlite, parquet, xlsb, shapefile, gpkg) take `spreadsheet.bytes` (50 MiB), the other kept kinds incl. audio and video `document.bytes` (100 MiB); BOB may name rows instead (one table, `LIMIT_CLASSES`). Found in runtime-limits: `boundOf("archive","unpacked_bytes")` answers 256 MiB (the alpha column), not R37's 2 GiB.

**CHANGE (K5604, K5605):** structured-text-reader's `STRUCTURED_TEXT_ENTRIES` and mail-reader's `MAIL_ENTRIES` registered unmodified, after `ppt` and before the archives (so `kmz` precedes `zip`). Roster pins and the R17 note test amended (a note laid out as a mail message is `eml`). Open: R33's `tsv`/`xlsm` conflict (one `test.todo`); the roster is otherwise the list.

**Met** · R33, R34, R35, R36, R37, R38, R39, R40, R41, R42, R43

Tests: 76/77. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegEQXWdwyKyz85ehDj): test runs 4, module lines 961
