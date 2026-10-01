# run-productions (T19)

**Status** · session_01M6NtmEV4tfiZ4TcHB6Fo5Z · depth 2 · COMPLETE · handled B4

## J1 · REPORT

Rule 1, first stage done and pushed (`job/T19/run-productions`): C-27.1–.14, .16–.19 are now `SUGGEST_ROWS` in `run-productions/checks.mjs` (byte-identical to the catalogue's, checked), `SUGGEST_KINDS` read from basis-versions (its index already re-exports it), `index.mjs`:30's record-grammar names re-pointed (the unused `SUFFICIENCY_UNCLAIMED` import dropped), `module.test.mjs` re-pointed to my own table (its catalogue C-104 "no copy" arm goes with the import). Tests: run-productions 36/36, skills 39/39, agent-worker 139/139. All four checks 0 failures.

Left, waiting on basis-versions' early merge (its job has only just started): `isBoilerplate` (index.mjs) and `SUFFICIENCY_UNCLAIMED` (suggest.test.mjs:5) to basis-versions; then deleting the catalogue's `SUGGEST_CHECKS` once nothing imports it. Importers today besides mine: the catalogue's own `basisVersionFindings` (:3020, C-27.15), `basis-versions/index.mjs`:30/:192 and `test/m/basis-versions/grammar.test.mjs`:7, plus old suites `test/d470-catalog-census.test.mjs` and `test/system/refusal-wire.control.mjs` (K619: I will not touch them). The deletion therefore needs the catalogue's `basisVersionFindings` gone or no longer reading `SUGGEST_CHECKS` (basis-versions / inquiry-grammar). Please send a CHANGE when basis-versions has merged.

Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (its inputs include `run-productions/checks.mjs` and `index.mjs`); yours to regenerate at the close.

## J2 · REPORT

B3 applied: merged tranche/T19; `isBoilerplate` (index.mjs) and `SUFFICIENCY_UNCLAIMED` (suggest.test.mjs) now read from basis-versions. No run-productions file imports `bio-checks.mjs` any more. Tests: run-productions 36/36, skills 39/39, agent-worker 139/139; all four checks 0 failures. Pushed.

The catalogue's `SUGGEST_CHECKS` is NOT deleted yet. My re-scan finds no product or module-test importer, but the catalogue's own `basisVersionFindings` still reads it (bio-checks.mjs:3020, the C-27.15 push), and `checkInquiryBasis` still calls that. Deleting the table now would make that path throw. As B2 says, inquiry-grammar's move drops the call (its R4). I will delete the table on your CHANGE once inquiry-grammar has merged. The old suites (`d470-catalog-census`, `refusal-wire.control`) are accepted red (K619).

## J3 · COMPLETE

**Entries applied** (layer 6, B1; B3):
- `SUGGEST_CHECKS` less C-27.15 made this module's own: the 18 rows (C-27.1–.14, .16–.19) are `SUGGEST_ROWS` in `src/run-productions/checks.mjs`, byte-identical to the catalogue's (checked by script); `SUGGEST_CHECK_KEYS` and `SUGGEST_CHECKS` built from them.
- `SUGGEST_KINDS` read from basis-versions and re-exported (`checks.mjs`, kept: `index.mjs`, skills and agent-worker read it from here).
- `index.mjs` re-pointed: `parseFrontmatter`, `normalizeType`, `OBJECT_TYPES`, `canonicalJson`, `isMachineIdentity`, `MACHINE_CLASS_PREFIX` to record-grammar; `isBoilerplate` to basis-versions; the unused `SUFFICIENCY_UNCLAIMED` import dropped.
- Tests re-pointed: `module.test.mjs` R16 now checks the module's own table (every code, check and `where` region; C-27.15 absent), no catalogue import; `suggest.test.mjs`:5 `SUFFICIENCY_UNCLAIMED` from basis-versions. No run-productions file imports `bio-checks.mjs`.
- Legacy-store's share (counts): already in place (`counts(hid)`, read by `store.mjs`:892); nothing to move.

**Held (K814, B4):** the catalogue's `SUGGEST_CHECKS` is not deleted. Its one remaining reader is the catalogue's own `basisVersionFindings` (bio-checks.mjs:3020, the C-27.15 push), called from the held `checkInquiryBasis` (K812 (5)). It goes with whichever L6 job deletes `basisVersionFindings`, or with the catalogue at control-plane's last act (rule 1, K786). Old-suite readers (`test/d470-catalog-census.test.mjs`, `test/system/refusal-wire.control.mjs`) untouched (K619).

**Deferred:** none. R9, R13, R14 marks are unchanged by this job (no requirement of mine was marked for T19).

**Found in other modules:** `bio-plane/dist/bio-plane.bundled.mjs` (generated, BOB's at the close) is stale: its inputs include `run-productions/checks.mjs` and `index.mjs`.

**Tests and checks:**
- `node --test bio-plane/test/m/run-productions/`: pass 36, fail 0
- `node --test bio-plane/test/m/skills/` (uses run-productions): pass 39, fail 0
- `agent-worker: npm test` (uses run-productions): 139 passed, 0 failed
- `format`: 87 modules, 82 requirements files; 0 failures
- `architecture run-productions`: 7 product files, 37 relative imports; 0 failures
- `coverage run-productions`: 19 of 19 live requirement ids named by a test; 0 failures
- `ownership run-productions tranche/T19`: legacy-store 0 added/0 removed, legacy-checks 0 added/0 removed; 0 failures

Size (session_01M6NtmEV4tfiZ4TcHB6Fo5Z): test runs 5, module lines 1342
