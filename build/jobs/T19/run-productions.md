# run-productions (T19)

**Status** · session_01M6NtmEV4tfiZ4TcHB6Fo5Z · depth 2 · WAITING ON BOB (J2) · handled B4

## J1 · REPORT

Rule 1, first stage done and pushed (`job/T19/run-productions`): C-27.1–.14, .16–.19 are now `SUGGEST_ROWS` in `run-productions/checks.mjs` (byte-identical to the catalogue's, checked), `SUGGEST_KINDS` read from basis-versions (its index already re-exports it), `index.mjs`:30's record-grammar names re-pointed (the unused `SUFFICIENCY_UNCLAIMED` import dropped), `module.test.mjs` re-pointed to my own table (its catalogue C-104 "no copy" arm goes with the import). Tests: run-productions 36/36, skills 39/39, agent-worker 139/139. All four checks 0 failures.

Left, waiting on basis-versions' early merge (its job has only just started): `isBoilerplate` (index.mjs) and `SUFFICIENCY_UNCLAIMED` (suggest.test.mjs:5) to basis-versions; then deleting the catalogue's `SUGGEST_CHECKS` once nothing imports it. Importers today besides mine: the catalogue's own `basisVersionFindings` (:3020, C-27.15), `basis-versions/index.mjs`:30/:192 and `test/m/basis-versions/grammar.test.mjs`:7, plus old suites `test/d470-catalog-census.test.mjs` and `test/system/refusal-wire.control.mjs` (K619: I will not touch them). The deletion therefore needs the catalogue's `basisVersionFindings` gone or no longer reading `SUGGEST_CHECKS` (basis-versions / inquiry-grammar). Please send a CHANGE when basis-versions has merged.

Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (its inputs include `run-productions/checks.mjs` and `index.mjs`); yours to regenerate at the close.

## J2 · REPORT

B3 applied: merged tranche/T19; `isBoilerplate` (index.mjs) and `SUFFICIENCY_UNCLAIMED` (suggest.test.mjs) now read from basis-versions. No run-productions file imports `bio-checks.mjs` any more. Tests: run-productions 36/36, skills 39/39, agent-worker 139/139; all four checks 0 failures. Pushed.

The catalogue's `SUGGEST_CHECKS` is NOT deleted yet. My re-scan finds no product or module-test importer, but the catalogue's own `basisVersionFindings` still reads it (bio-checks.mjs:3020, the C-27.15 push), and `checkInquiryBasis` still calls that. Deleting the table now would make that path throw. As B2 says, inquiry-grammar's move drops the call (its R4). I will delete the table on your CHANGE once inquiry-grammar has merged. The old suites (`d470-catalog-census`, `refusal-wire.control`) are accepted red (K619).
