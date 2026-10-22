# office-readers (T51)

**Status** · session_01HwGAqD9Jozhj6cBJ9WXEo8 · depth 2 · WORKING · handled B6

## Completion

- **Entry applied:** T51-6, R34. `coreMetadata`/`withMetadata` (`docx.mjs`) take a `withTitle` flag; docx and pptx `text()` pass it, so `metadata.title` is the core part's `dc:title` as written, and no key when absent, empty or whitespace-only; no readable core part still gives `metadata: null`. xlsx and csv unchanged (R34 names docx and pptx only).
- **Tests:** `typed-cells.test.mjs`: new R34 test (titled, absent, empty, blank, no core part, xlsx and csv controls); the two R31 tests updated for the docx/pptx `title` key. No test weakened.
- **Deferred:** none. **Found in other modules:** none. The requirements file still marks R34 "not yet met: T51"; that line is BOB's to change.
- **Ran:** `node --test bio-plane/test/m/office-readers/` 108 pass, 0 fail; format 0 failures; architecture 0 failures; coverage 34 of 34 ids named, 0 failures; ownership 0 failures.
- Size (session_01QsLuHE3aQNFW5i1HvNqNBC): test runs 2, module lines 3819

- **T51-249 (words, K3957, B2/B3/B5):** all 7 `plain` findings judged as sentences a member can read (evidence signals of the encoding signature and the csv content-type claim, and two docx structure notes), the same kind this module already keys: each now read through `localize('office-readers.csv.<slug>' | 'office-readers.docx.<slug>', en)`, `en` unchanged. No test held a copy of any of them. Nothing listed as unkeyed. `node bio-plane/src/setup-words/build.mjs --check` names no office-readers finding; `rows.mjs` is stale for the 7 new ids until R1's close (BOB regenerates).
- **Ran (T51-249):** `node --test bio-plane/test/m/office-readers/` 108 pass, 0 fail; `checks/run.mjs`: format 0, architecture 0, no words finding in office-readers; coverage 34 of 34, 0 failures; ownership 0 failures.
- Size (session_011sN5z3ToMiv7YyPQWo8tT7): test runs 2, module lines 3819

## J1 · COMPLETE

T51-6 applied: R34 met (docx and pptx metadata.title; no key when absent/empty/blank). 108 tests pass; format, architecture, coverage, ownership 0 failures. See record.

## J2 · COMPLETE

T51-249 applied: all 7 plain findings keyed with localize (csv 5, docx 2), en unchanged; none unkeyed. 108 tests pass; format, architecture, coverage (34/34), ownership 0 failures; no office-readers words finding. rows.mjs stale for the 7 new ids until R1's close. Size (session_011sN5z3ToMiv7YyPQWo8tT7): test runs 2, module lines 3819.
