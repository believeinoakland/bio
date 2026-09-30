# extraction (T18)

**Status** · session_01Y891RVtgQpU2ma9akMbBvy · depth 2 · COMPLETE · handled B1

## Completion (EXTRACTION #8)

**Entries applied** (`build/plan/current.md` layer 4, extraction):
- **The legacy-index map's §4.4 plain move (K649 (7)):** `op=pdfstructure`'s dispatch left `src/index.mjs` for `extraction/ops.mjs`: `EXTRACTION_OPS` (the routed op list, host-governor's `GOVERNOR_OPS` precedent) and `extractionOp(op, url, env, getStore, stamps)`, null for any other op. The stamps (class, session, capabilities, viewer, author) are handed as today and stay the control plane's. `src/index.mjs`: 2 lines added (the import, the dispatch line), 3 removed; ownership lists them. Tested under R31.
- **`DRIVE_CAPTURE_CHECKS` re-pointed to acquisition's copy:** extraction never imported it (no code or test import, measured by `git log -S` too); the one reference, C-51's comment naming it as DEC-49's precedent, now names `acquisition/checks.mjs`. No catalogue row moved or changed by this job, so none is `awaiting stamp`.
- **Converts, all 16 suites (extraction's shares; the old suites kept, K619 (3)), in six new files under `bio-plane/test/m/extraction/`:**
  - `convert-tiers` (10 tests): `tier2-wire`, `tier3-layer-parts` — R4, R6, R7, R10–R12, R31 (real pdf entry, the real pdf-worker over the CPDF-20 fixtures).
  - `convert-ocr` (12): `d606-perpage-ocr`, `textchain` — R5–R7, R10–R12; the committed OCR member itself (Miniflare) over D-460's fixtures.
  - `convert-chain` (10): `drive-convert`, `producer-provenance`, `reading-wire` — R11, R12, R18, R19, R27, R29.
  - `convert-extent` (8): `capture-container-extent`, `fw19-extent-arms` — R13, R19, R20, R27, R30, R45, R60 (the real office entries over real bytes).
  - `convert-names` (5): `calibration`, `readingname`, `extractrun` — R37–R44, R59.
  - `convert-record` (5): `reading-position-occurrences`, `reading-position`, `observation-content`, `testify` — R19–R24, R28, R36, R58, R61, R62.
  - Not carried, no requirement states them: `textchain`'s "op=image carries the chain"; `capture-container-extent`'s two whole-output digest pins; `calibration`'s two regexes over source (R6's behaviour is in `read.test.mjs`); `reading-position-occurrences`' M-155 migration is carried under R58. Every other share of each row is another module's (content, capture, text-chain, pdf-reader, docprofile, entities, connections, retrieval, observation-log, provenance, inquiry, ratification, ai-runs, run-productions, ocr-worker).

**A flaw found and fixed in this module (R18, "never a default"):** with no `jurisdiction_profiles` set, `Extraction#view()` answered undefined and the pipeline handed docprofile no view, so its readers fell back (K39) to every held non-test profile: an instance naming no profile still recognised Oakland file numbers (`reading-wire`'s odd note, measured: 41 references with the setting unset, as with it set). `view()` now answers the empty view (`combine([])`) when no profile is named or the named ones do not combine. Tested in `convert-chain` (unset, unknown and empty all read no reference). Every module test (`bio-plane/test/m/`) passes as before; old suites that read a jurisdiction's documents with no profile named may now read nothing (unrun, K653).

**Deferred:** none.

**Found in other modules (REPORT):**
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product, §14) is stale: `src/index.mjs` and `extraction/` changed. BOB regenerates at the layer close.
- `bio-plane/test/m/control-plane/doorbell.test.mjs` "R36 (N380, K559; capture R65): the pull and its promotion are one act…" fails on `tranche/T18` @ d8be75c2d5 without this job's changes (12 pass, 1 fail): capture's or control-plane's.
- Improvement: `extraction/index.mjs` and `extractrun.mjs` read `sha256HexSync` and `BASIS_GRADES` from the catalogue's re-export; record-grammar owns them since layer 1. Re-pointing needs a `uses` edge extraction → record-grammar (BOB's, `modules.json`); then the next extraction job re-points.

**Tests and checks run:**
- `node --test bio-plane/test/m/extraction/`: tests 145, pass 145, fail 0.
- `node --test bio-plane/test/m/` (every module test; no layer tests, `build/manifest.md`): pass 3475, fail 1 (the doorbell test above, red on the tranche branch too).
- `node checks/format.mjs`: 82 modules, 77 requirements files; 0 failures.
- `node checks/architecture.mjs … extraction`: 27 product files, 87 relative imports; 0 failures.
- `node checks/coverage.mjs … extraction`: 59 of 59 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … extraction tranche/T18`: legacy-index 2 line(s) added, 3 removed (listed above); 0 failures.

Size (session_01Y891RVtgQpU2ma9akMbBvy): test runs 30, module lines 3548

## J1 · COMPLETE

All entries applied (record: Completion). pdfstructure dispatch moved (EXTRACTION_OPS/extractionOp; index.mjs +2 -3); DRIVE_CAPTURE_CHECKS: no import existed, the precedent comment re-pointed; all 16 converts in six new test files (145/145). A flaw fixed in my module: R18 view() fell back to every profile when none was named; now the empty view. REPORTs: plane bundle stale (§14); control-plane doorbell R36 red on tranche/T18 without me; extraction could re-point sha256HexSync/BASIS_GRADES to record-grammar given a uses edge. No row moved or changed. Checks: format, architecture, coverage, ownership 0 failures.
