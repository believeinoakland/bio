# legistar-reader (T33)

**Status** · session_01Mr47bi897kmqem6V1yfAdg · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings I am carrying on with; answer only if either is wrong.

1. R1 says a capture is "a JSON array of objects", but R16's 50 gold-event fixtures are `events/{id}` captures, which the API returns as ONE object. My reading: at an address ending `<endpoint>/<id>` a single object carrying that endpoint's id field is read as a one-row capture of that endpoint (`page: null`, no paging); a single object anywhere else does not match, with a reason.
2. R11's `nextPage(locator)` cannot tell 1,000 rows from fewer from the address alone. My reading: `nextPage(locator, page)` with `page` the parse's own `page` (absent: the address is advanced, as R11's first case); `parse` also gives `page.next`, the same answer. The rest of the query (`$filter`, `$top`) is kept byte for byte, `$skip` replaced or appended.

## J2 · QUESTION

Replaces J1 (points 1 and 2 unchanged; point 3 added).


1. R1 says a capture is "a JSON array of objects", but R16's 50 gold-event fixtures are `events/{id}` captures, which the API returns as ONE object. My reading: at an address ending `<endpoint>/<id>` a single object carrying that endpoint's id field is read as a one-row capture of that endpoint (`page: null`, no paging); a single object anywhere else does not match, with a reason.
2. R11's `nextPage(locator)` cannot tell 1,000 rows from fewer from the address alone. My reading: `nextPage(locator, page)` with `page` the parse's own `page` (absent: the address is advanced, as R11's first case); `parse` also gives `page.next`, the same answer. The rest of the query (`$filter`, `$top`) is kept byte for byte, `$skip` replaced or appended.
3. My Uses say the R4 vocabulary is "keyed under this content type's key", but jurisdictions R6 (T33-2) defines `meeting_markers` and `body_variants` as top-level vocabulary keys. My reading: I read `view.vocabulary.meeting_markers` (`{marker, pattern}`) and `view.vocabulary.body_variants` (`{pattern, organisation}`) as R6 defines them; no `legistar_api` sub-key. A marker is matched against a body's or an event's body name; the base name is that name with the matched words, and the separators left beside them, removed.

## Completion

**Entries applied.** T33-14 whole: `legistar-reader/index.mjs` (526 lines) reads captured Legistar Web API JSON as the content type `legistar_api` (MEMBERSHIP), registered by `registerLegistar(register)` through `docprofile`'s registry seam; `detect` (R1), `parse` (R2–R10), `nextPage` and `readPages` (R11), `assess` (R12). Every endpoint is read from a closed list of fields; contact fields are refused twice (closed lists, then a scrub by field name; R3, K1485 row 9). Markers and the body-variant map come from the view only (R4, R14). Pure (R13); nothing inferred (R15).

**Paths for `modules.json`.** `paths: ["legistar-reader/"]`, `tests: ["legistar-reader/test/"]`, `uses: ["docprofile"]` (final: every import is `docprofile/registry.mjs`, which re-exports `site-profiles`' catalogue and the reader view; `jurisdictions` only through the view).

**Fixtures (R16).** Captured 2026-10-05 by `legistar-reader/test/fixtures/capture.mjs` (keyless GETs, contact fields dropped before writing): `bodies` (151), `persons` (591), `officerecords` both pages (1,000 + 262), `events` 2023-10-01 to 2026-10-05 (572, as measured), the 50 gold `events/{id}`, one meeting's `eventitems` (9451), three items' `votes`, and June 2025's `matters` (89). `gold.json` is legistar-events §5's table. All 50 gold dates and times agree; the 14 cancelled ones read `cancelled`.

**Readings applied (J1, answered by B2, K1513; J2 repeats them and adds point 3, unanswered at completion).** (1) a one-record address (`events/9016`) reads its one object as a one-row capture, `page: null`; (2) `nextPage(locator, page)`, `parse` also gives `page.next`; the rest of the query is kept byte for byte. (3) the R4 words are read from `view.vocabulary.meeting_markers` and `view.vocabulary.body_variants` as jurisdictions R6 (T33-2) defines them. If BOB answers point 3 otherwise, it is a two-line change in `markers`/`variants`.

**Deferred.** None.

**Found in other modules (REPORT).** None that this job needs. Note for `jurisdictions` (T33-2): the first profile's `meeting_markers` need the measured cancellation words ("CANCELLED", "CANCELLATION", legistar-events §2) and `special`/`concurrent`; the base name keeps Legistar's leading `*`, so a `body_variants` pattern must allow it.

**Tests and checks.**
- `node --test legistar-reader/test/*.test.mjs`: tests 18, pass 18, fail 0.
- `node checks/format.mjs <bio>`: 126 modules, 124 requirements files; 0 failures.
- With `legistar-reader`'s `paths`/`tests` set in a scratch copy of `modules.json` (they are empty until BOB writes them at the merge): `architecture.mjs`: 64 product files, 3 relative imports; 0 failures. `coverage.mjs`: 16 of 16 live ids named by a test; 0 failures. `ownership.mjs … tranche/T33`: 65 files; 0 failures. With the registered empty paths, architecture and coverage see no files (coverage: 0 of 16, the accepted red until the merge).

Size (session_01Mr47bi897kmqem6V1yfAdg): test runs 2, module lines 526

## J3 · COMPLETE

T33-14 applied; 18 tests pass; format, architecture, coverage (16/16) and ownership 0 failures (the last three with my paths set in a scratch modules.json). For modules.json: paths ["legistar-reader/"], tests ["legistar-reader/test/"], uses ["docprofile"]. J1's readings applied (K1513). J2 point 3 (vocabulary keys `meeting_markers`/`body_variants` read top-level as jurisdictions R6 defines them) is unanswered: answer only if wrong; it is a two-line change. Record's Completion section has the rest.
