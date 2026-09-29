# extraction (T12)

**Status** · session_01TmNfrLBPpDG6E4MJmw3jdD · depth 2 · COMPLETE · handled B3

## Completion

**Applied.** N285 (extraction's share, B1; row placement K385, B2):
- R63 `noSha(detail?)` in `src/extraction/checks.mjs`, re-exported from `src/extraction/index.mjs` with `EXTRACTION_CHECKS` and `NO_SHA_DETAIL`: the one site of "a request names no capture digest". It answers `{ok: false, reason: "NO_SHA", code: "NO_SHA", check: "C-51.6", translation, detail}`, `detail` the caller's sentence, else the fixed `NO_SHA_DETAIL` (for an absent, non-string, empty or blank one); a fresh object each call, nothing written, never throws. Its row is `EXTRACTION_CHECKS.NO_SHA` (frozen), **C-51.6**, C-100.19's translation verbatim, `where` `src/extraction/checks.mjs noSha > is-capture-named`, the region marked there. `REEXTRACT_CHECKS` (C-51.1–5) unchanged.
- R27: `readingFor` answers through `noSha("a reading is read by its capture sha256")`; the sentence is unchanged, the answer now carries `code`, `check`, `translation`.
- R31: an absent object is `capture.evidenceAbsent(sha, storeName, {tokenClass: cls})` (its R63): 404, `NOT_FOUND`, C-118.1, byte-identical to op=capture's own body. Legacy `bio-plane/test/pdfstructure-op.test.mjs`: 29 passed, 0 failed.
- Not-yet-met marks this work meets (BOB strikes): R63's *(not yet met: N285)*; R31's *(not yet met: N285)*. The two `test.todo`s that named them (`testimony.test.mjs`) are replaced by real tests.

**Deferred.** None.

**Found in other modules / generated artifacts.**
1. Stale generated artifacts (not rebuilt, mechanics §14): `agent-worker/dist/agent-worker.bundled.mjs` (fleetbundles: `src/extraction/checks.mjs` and `src/extraction/index.mjs` are its inputs, STALE); the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` likewise has both as inputs. fleetbundles' pinned agent-worker input list gap (`src/capture/checks.mjs`) is CAPTURE #6's, already in the plan; my change adds no input (`src/capture/ops.mjs` already was one).
2. DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`), diffed against `origin/tranche/T12`'s tree (29 failures there, 30 here): one new failure, expected between layers (B2): `PROGRESSION_CHECKS.NO_SHA and EXTRACTION_CHECKS.NO_SHA carry the IDENTICAL translation` (the arm-A duplicate; gone when progressions retires C-100.19 in layer 5). Arm G: `NO_SHA` stays at 6 literal sites (extraction's moved from `index.mjs` into `noSha`); `NOT_FOUND` falls 5 → 4 (extraction's own literal gone). Floors moved by this job's one family, row and region: families 100→101, rows 785→786, governedSites 496→497, regions 457→458, regionLines 5473→5478, codesChecked 885→887, outcomeReturns 259→260, refusalsJudged 859→860 (legacy-tests' re-pin, layer 11).
3. Unchanged by me and red on the tranche branch too: `machinefences-dec49` ARM A4 (the doctrine pack); `d470-catalog-census` A3/A5 (the 1.42.0 row, already in the plan).

**Tests and checks.**
- `node --test bio-plane/test/m/extraction/`: tests 86, pass 86, fail 0, todo 0 (new: `nosha.test.mjs` R63 ×4 with R27; `pdfstructure.test.mjs` R31 through evidenceAbsent; `store.test.mjs` R27 asserts the whole R63 answer).
- `node bio-plane/test/pdfstructure-op.test.mjs`: 29 passed, 0 failed.
- `node --test` refusal-wire, d484-refusal-translation, homecensus, shadowed-refusals, d278-codeless-refusals: each pass 1, fail 0.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … extraction`: 16 product files, 63 relative imports; 0 failures.
- `node checks/coverage.mjs … extraction`: 58 of 58 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … extraction tranche/T12`: legacy-checks, legacy-store, legacy-index 0 added / 0 removed; 0 failures.

Size (session_01TmNfrLBPpDG6E4MJmw3jdD): test runs 7, module lines 3501

## J1 · QUESTION

R63's row number. My reading, which I am building on: `NO_SHA`'s one row is a new row of this module's own C-51 family, **C-51.6**, in a new export `EXTRACTION_CHECKS` beside `REEXTRACT_CHECKS` in `src/extraction/checks.mjs` (C-51.1–5 stay the re-read's family, which my R47 test pins). It carries C-100.19's translation verbatim; `where` is `src/extraction/checks.mjs noSha > is-capture-named`. C-100.19 is not reused as a number because it is progressions' family (K107 (3): the job names a new code's row). Consequence I will REPORT: until progressions (layer 5) drops its own `NO_SHA` row, the code is held in two places, which the DEC-49 guard's arm A refuses. Answer only if you want a different number or place.

## J2 · COMPLETE

N285 applied (K385): R63 noSha(detail?) in src/extraction/checks.mjs (re-exported from src/extraction/index.mjs), {ok:false, reason/code NO_SHA, check C-51.6, translation (C-100.19's verbatim), detail}, row EXTRACTION_CHECKS.NO_SHA; R27 answers through it; R31's absent object is capture.evidenceAbsent(sha, store, {tokenClass}) and legacy pdfstructure-op is 29/0. content can build R44 against it now. Strike R63's and R31's 'not yet met: N285'. Module tests 86/86 (0 todo); format, architecture, coverage (58/58), ownership: 0 failures. Reported in the record: agent-worker and plane bundles stale (extraction/checks.mjs, index.mjs are inputs); DEC-49 guard floors +1 family/row/region and the expected cross-layer duplicate translation. Record: build/jobs/T12/extraction.md on job/T12/extraction @ 6ac7bd8144+.
