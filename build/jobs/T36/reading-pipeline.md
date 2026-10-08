# reading-pipeline (T36)

**Status** · session_01Bqmqo5KoGA92ZdFBC6tLLW · depth 2 · COMPLETE · handled B1

## Completion (READING-PIPELINE #7, T36-13a)

**Entry applied.** T36-13a (N724, K1972, K2092): R28's `.docx` arm. `emittedFieldsOf` (`bio-plane/src/reading-pipeline/index.mjs`) gives a text whose container is `docx` a `cells` map keyed by each table's `ref` (`table <n+1>`, office-readers R16), each value that table's `cells` list as the entry emitted it (the entry's own list, unaltered), nested tables under their own keys as the entry lists them; `{}` for `tables: []`, `cells: null` for `tables` null; a workbook's arm unchanged; any other document no `cells`.
Detail readings (mine, within R28): a docx table entry with no string `ref` is no key (as an unnamed sheet); one with no `cells` list is null under its key; a docx text with no `tables` array at all (the real entry always emits one) reads `cells: null`, as "the body not read".

**Tests (R28 named, K874).** `emitted.test.mjs`: three new tests — the real docx entry over a package built with test-support's `makeZip` (a table of dates and amounts, a nested table under its own key, cells equal to the entry's, survives the wire); `{}` for a body with no tables (real entry) vs `null` for an unread body vs `{}` from a synthetic entry, kept distinct; `emittedFieldsOf` over docx texts (unaltered lists, no-ref, `tables` null, a pptx with `tables` no cells). The older "no workbook" test now uses an `odt` text with tables (no cells), as R28's "absent for any other document". `pieces.test.mjs`:226 updated: its table-free docx now reads `cells: {}` (the digest pin, which excludes `cells` and `metadata`, unchanged).

**Own flaw fixed.** R18: `readingProvenance` gave empty text `text_sha256: null` with no `why` (only absent text had one); empty text now says why; new test in `rules.test.mjs` names R18.

**Deferred (own module).** `hooks.mjs`:19, if `structuredClone` of a reading throws, a hook is handed the caller's reading; readings are JSON-shaped, so it cannot throw in practice; left as is. R26's text says an uncommitted call answers `{ran: []}` and also that the answer is `{ran, failed}`: the code follows the first clause (`hooks.mjs`:44); a wording point for BOB, no change made. Stale comments: `staffdirectory.test.mjs`:114 says "R2's" for tier 2 (R3); `d606-perpage-ocr.test.mjs`:153, 172, 185 cite "extraction R5" (now R4); `convert-ocr.test.mjs` duplicates d606's arms. Comment only, left.

**Other modules.** The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from this change (reported, J2). Nothing else.

**Reading set (mechanics §17, N739).** Measured: requirements 22 KB + code 89 KB + tests ~282 KB, over 300 KB; option (3). Read whole myself: `build/requirements/reading-pipeline.md`, layer 4's row of `build/layers.md`, `index.mjs` (all), `emitted.test.mjs`, `fixture.mjs`, `pieces.test.mjs`:200–235, office-readers R11, R16, R30, R31, the docx entry's `text()` (`docx.mjs`:885–925), test-support's `makeZip` signature. One worker read the rest whole (19 files, 287,621 B: `hooks.mjs`, `readingprov.mjs`, 16 test files) and wrote a ~6 KB summary citing file:line; it found the one assertion this change broke (`pieces.test.mjs`:229, fixed) and the flaws above. Nothing it left out mattered.

**Tests and checks run.**
- reading-pipeline (all `tests` paths): `tests 95, pass 95, fail 0, skipped 0`.
- Users of this module: extraction `tests 127, pass 127, fail 0` (same as before the change); content + events `tests 185, pass 185, fail 0`.
- `checks/format.mjs`: 0 failures. `architecture.mjs reading-pipeline`: 0 failures. `coverage.mjs reading-pipeline`: 28 of 28 live ids named, 0 failures. `ownership.mjs reading-pipeline tranche/T36`: 0 failures.
- P6: module 1,452 lines, well under 4,000.

Size (session_01Bqmqo5KoGA92ZdFBC6tLLW): test runs 9, module lines 1452

## J1 · REPORT

Generated artifact: bio-plane/dist/bio-plane.bundled.mjs (not_product) is stale from T36-13a (reading-pipeline index.mjs and readingprov.mjs changed); for regeneration at L4's close. Also a wording point in my own requirements: R26 says an uncommitted afterRead answers {ran: []} and also that it answers {ran, failed}; the code follows the first clause (hooks.mjs:44). No change made; yours to word.

## J2 · COMPLETE

T36-13a applied: R28's .docx cells keyed by table ref ({} no tables, null body not read), real-entry and synthetic tests naming R28; own flaw fixed (R18: empty text's why). Module tests 95/0; extraction 127/0, content+events 185/0; format, architecture, coverage (28/28), ownership: 0 failures. Record has the detail. Ready to merge before extraction.
