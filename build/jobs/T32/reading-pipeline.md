# reading-pipeline (T32)

**Status** · session_01JD6kskytnjr8DdFry3Y75L · depth 2 · WORKING · handled B0

## Completion

**Entries applied**
- N542 (L4): `bio-plane/test/tier-pagewise.probe.mjs` now composes its `--census` user agent with `acquisition.civicsmithUserAgent("0.58.0", "biosmoke7", "acquire")` (imported from `../src/acquisition/index.mjs`) instead of the written string. The composed string is byte-identical to the old one (`Civicsmith/0.58.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)`), so the census arm sends exactly what it sent before. The Uses line's `*(not yet met: T32)*` marker on `acquisition` is now met; the marker is in the requirements file, which is BOB's to clear.

**Deferred** · none.

**Found in other modules** · none.

**Read whole** · `build/requirements/reading-pipeline.md`; acquisition's R24/R33/R34 (`civicsmithUserAgent`); `src/reading-pipeline/index.mjs` (1,074) and `readingprov.mjs` (253); `test/tier-pagewise.probe.mjs`. No flaw found in the module's source this job.

**Tests and checks**
- `node --test test/m/reading-pipeline/*.test.mjs test/d606-perpage-ocr.test.mjs test/tier2-wire.test.mjs test/system/pdf-worker-binding.test.mjs` (from `bio-plane/`): tests 77, pass 77, fail 0, skipped 0.
- `node test/tier-pagewise.probe.mjs` (hermetic arm; the census arm reaches the network and was not run): 4 documents, 15 pages; BASELINE 0 pages awarded, as required.
- `checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `checks/architecture.mjs … reading-pipeline`: 20 product files, 47 relative imports; 0 failures.
- `checks/coverage.mjs … reading-pipeline`: 24 of 24 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … reading-pipeline tranche/T32`: 1 file changed; 0 failures.

Size (session_01JD6kskytnjr8DdFry3Y75L): test runs 2, module lines 0
