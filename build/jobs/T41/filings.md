# filings (T41)

**Status** · session_01GjdoGzcDK1LZWPwK7SZa6n · depth 2 · COMPLETE · handled B1

## Completion (FILINGS #16, T41-48, tests only)

**Entry applied.** T41-48 (was T40-9a, N819; K2387): `outward.test.mjs`:136 (R25) was red because the fixture's `w.doc(DOC)` (publication's fixture) records a `direct` receipt since K2378, so DOC's capture, meant to be the ungraded exhibit, read B. `fixture.mjs`:98 now calls `w.doc(DOC, { fetched: false })` (publication's own option for a member document with no receipt), which restores what R25's test was written to show: DOC's grade null, not co-attested, its venue reading undetermined. Negative control (K874), added at the end of that test: once a `direct` receipt is recorded for the same capture, the next draft shows DOC at B (equal to `provenance.captureGrade`), still not co-attested. No product code changed. Inherited red rule 4 (9) cleared.

**Deferred.** Nothing.

**Found in other modules.** Nothing. `affordances`' `backing.test.mjs` imports this fixture (`:366`): 21 pass, 0 fail both before and after the change.

**Reading (mechanics §17, K2304).** The set is over 300 KB (src 147 KB, tests about 220 KB, plus used services). Read whole myself: `build/requirements/filings.md`; layer 9's row and contract in `build/layers.md`; `fixture.mjs` and the R25 tests of `outward.test.mjs` (the code my entry changes); publication's `fixture.mjs` `doc()` (`:200`–`:215`); provenance's `captureGrade` and `recordReceipt` requirements (R13, R59, R62, R63 lines). A worker read whole the other 15 files (`src/filings/` checks, dates, index, schema; the eleven other test files; 318,212 bytes) and wrote a summary of about 7 KB citing file and line. It found that grades are read only through `provenance.captureGrade` (`index.mjs`:967–972) and used only by `#venueReading` (`:1000`–`:1019`); that no other test checks a grade or depends on a direct receipt; and that `packet.test.mjs`:113, :135–144 need DOC's bytes, registration and empty attestations kept, which this change keeps. Nothing it left out mattered.

**Uses.** Unchanged.

**Tests and checks.**
- `node --test test/m/filings/`: pass 70, fail 0 (before: 69 pass, 1 fail at `outward.test.mjs`:136).
- `node --test test/m/affordances/backing.test.mjs`: pass 21, fail 0.
- format: 145 modules, 144 requirements files; 0 failures. architecture: 17 product files, 75 relative imports; 0 failures. coverage: 32 of 32 live requirement ids named by a test; 0 failures. ownership: 0 failures.

Size (session_01GjdoGzcDK1LZWPwK7SZa6n): test runs 6, module lines 2184
