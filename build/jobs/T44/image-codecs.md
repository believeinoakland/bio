# image-codecs (T44)

**Status** · session_0192ECShmFQefWJ5mQLg6Ptw · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** · T44-1 (N868; K2701, K2702, K2719), on commit `76b370eae1`.
- **R1 (T44 clause)** · `decodeBaselineJpeg` and the new R11 share one strip-wise decode (`decodeStrips` in `pdf-worker/src/dctdecode.mjs`). The entropy data is read MCU row by MCU row (a block row for a single, non-interleaved component); each component holds only that MCU row plus slot 0, the last sample row of the MCU row above, which is all `jdsample.c`'s fancy filters read as libjpeg's context rows give them (edges replicated at the component's own height). An output row that reads the next MCU row's first chroma row waits for it, so each strip after the first begins with the row the one before held back. Colour is converted row by row from the subsampled planes; no full-size upsampled chroma plane, and no full-size component plane of any kind, is held. R1 writes each strip into its (rotated) output as it comes. Output unchanged: all 12 libjpeg-turbo digests of `dct-variants.json` pass untouched, and 39 new ones (below). A rotation that is not a quarter turn is still refused only after the data is read (a damaged stream answers as damaged, as before; now tested).
- **R11** · `decodeBaselineJpegRows(d, {expectComps, colorTransform, onRows})` → `{width, height, comps, source}` (R1's answer without its samples). Hands `onRows(rows, y0, count)` each strip in order, top to bottom, at most one MCU row's output rows (8 × vmax; 8 for a single component), `rows` interleaved `width × comps` bytes a row. Header refusals come before any row; a refusal in the scan's data (TRUNCATED, CORRUPT_DATA) comes where the data breaks, after the rows above it, and **no row decoded from zero-filled bits is ever handed over** (the decode reads on without emitting, so the refusal's detail is R1's exactly). `onRows` missing is a `TypeError`.
- **For pdf-pixels (T44-2), stated in the code:** `rows` is ONE buffer reused for every strip, valid until `onRows` returns; a caller that keeps rows copies them. (Allocating a strip per call left ~36 MB of uncollected garbage at 12 MP; reusing it is what makes the bound real.)

**The live-set bound (R1, R11), stated** · Per component c: `(8·v_c + 1) × stride_c` bytes of samples (stride_c = ⌈W/(8·hmax)⌉·8·h_c; for a single component 9 rows × ⌈W/8⌉·8), plus one upsampled row `dw_c × hx_c` for each upsampled component, one 64-entry block of coefficients, and the strip `8·vmax × W × comps` bytes. At 4:2:0 that is about 76 bytes per image column, ~0.6 MB at 8064 wide, independent of height. R11's live set is the input plus that; R1's is the input, its output (W·H·comps) and that.

**Measured** (`pdf-worker/test/codecs/dct-memory.probe.mjs`, new: Pillow-written JPEGs, quality 90; each decode in a worker thread, its V8 heap + external sampled every 2 ms from outside, peak above the isolate's level once the input is loaded, garbage included; node 26.10.0):

| frame | sampling | R1 before (tranche tip) | R1 now | R1 now, rotate 90 | R11 now | R11 strips (most rows) |
|---|---|---|---|---|---|---|
| 4032×3024 (12.2 MP) | 4:2:0 | 81.2 MB, 6.66 B/px, 550 ms | 38.5 MB, **3.16 B/px**, 365 ms | 38.4 MB, 3.15 | 1.3 MB, 396 ms | 190 (16) |
| | 4:2:2 | 84.6 MB, 6.94 B/px | 37.7 MB, **3.09** | 38.4 MB, 3.15 | 1.8 MB | 378 (8) |
| | 4:4:4 | 74.4 MB, 6.11 B/px | 38.4 MB, **3.15** | 38.4 MB, 3.15 | 2.3 MB | 378 (8) |
| | grey | 24.5 MB, 2.01 B/px | 13.1 MB, **1.08** | 13.2 MB, 1.08 | 1.0 MB | 378 (8) |
| 8064×6048 (48.8 MP) | 4:2:0 | — | 148.6 MB, **3.05 B/px**, 1231 ms | 148.0 MB, 2104 ms | 3.0 MB, 1129 ms | 379 (16) |
| | 4:2:2 | — | 147.6 MB, **3.03** | 148.1 MB | 1.9 MB, 1513 ms | 756 (8) |
| | 4:4:4 | — | 148.6 MB, **3.05** | 147.7 MB | 2.0 MB, 1659 ms | 756 (8) |
| | grey | — | 49.8 MB, **1.02** | 49.9 MB | 1.8 MB, 375 ms | 756 (8) |

R1 at 4:2:0 is under R1's "at most about 4.5 bytes per pixel" (PDF-PIXELS #4 J2): its output (3 B/px) and under 0.2 B/px beside it. R11 holds 1–3 MB whatever the frame's height, so a 48 MP colour photo can be reduced in well under the plane's 128 MB; its CPU time is about R1's (1.1–1.7 s at 48 MP in node). The tranche tip's R1 was measured the same way from `git show HEAD:pdf-worker/src/dctdecode.mjs` (not committed).

**Tests** (each names its id; K874 negative controls)
- `pdf-worker/test/codecs/fixtures/make-dct-edges.py` + `dct-edges.json` (new): 39 JPEGs Pillow 12.3.0 writes and decodes (libjpeg-turbo 3.1.4), synthetic and said so, at the strip-wise decode's edges the 63×47 crops never reach: 1×1, 2×3, 3×17, 4×16, 5×33, 17×1, 33×15, 40×49, 24×32 in 4:4:4, 4:2:2, 4:2:0 and grey (chroma one or two samples wide: libjpeg's plain replication; one row tall; heights ending inside and on an MCU row), and restart intervals of one block and one MCU row. Every digest is Pillow's.
- `dct.test.mjs`: **R1 R6** the edge fixtures to libjpeg-turbo's bit; R1's refusal table made data (`OTHER_REFUSALS`) so R1 and R11 drive the same cases, with two R1 paths no test had driven (a restart interval cut short, TRUNCATED; a restart marker out of order, CORRUPT_DATA) and the rotation-after-data order. **R11**: joined rows equal R1's rotate-0 samples byte for byte for all 12 DCT variants and 39 edges (grey, 4:4:4, 4:2:2, 4:2:0, h1v2, restarts; rotated fixtures decoded unrotated), `onRows` in order with no gap, R11's answer is R1's without samples, and libjpeg-turbo's digest directly for the rotate-0 fixtures; no strip over 8 × vmax rows; **every R1 refusal raised the same way** (class, code, message, detail deep-equal; 4 fixture refusals + 14 constructed; every R1 code but the rotation R11 never takes), header refusals before any row, **control: grey-baseline decodes**; data cut at four points: only the picture's own rows handed over, then TRUNCATED; `onRows` required.
- `invariants.test.mjs`: **R8 R11** pure: the same answers in reverse order, with clock, randomness, network and crypto taken away, input unchanged.
- Runs: image-codecs `pdf-worker/test/codecs/`: **tests 64, pass 64, fail 0**. Layer tests: none named in `manifest.md`. Users: pdf-pixels (`pagepixels`, `imagecrop`, `jbig2`, `jpx` tests) 4/4 pass; image-cover `bio-plane/test/m/image-cover/` 15/15 pass; ocr-worker `ocr-worker/test/`: 198 passed, **1 failed**: R19 "the committed manifest's input and asset hashes match the tree": `STALE BUNDLE — the source ../pdf-worker/src/dctdecode.mjs has changed since dist/ocr-worker.bundled.mjs was built`. That is my change staling ocr-worker's bundle (§14; reported, J1), regenerated at L1's close as the plan says; not regenerated by me. `fleetbundles` likewise names the ocr-worker and plane bundles stale, nothing else.

**Checks** (process repository, on commit `76b370eae1`)
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture image-codecs`: 204 product files, 23 relative imports; 0 failures.
- `coverage image-codecs`: 11 of 11 live requirement ids named by a test; 0 failures.
- `ownership image-codecs tranche/T44`: 7 files changed by image-codecs between tranche/T44 and HEAD; 0 failures. No file outside my `paths`/`tests` (the three new files are under `pdf-worker/test/codecs/`).

**Read whole (P20, plan rule 2)** · I read my own code and tests whole, not only what I changed: all six source files (`mq`, `dctdecode`, `jbig2decode`, `jpxdecode`, `ccittdecode`, `pngdecode`), all eight test files and the probe under `test/codecs/`, the five fixture scripts (`make-dct-fixtures.py`, `make-jbig2-fixtures.py`, `make-jpx-fixtures.py`, and under `codecs/fixtures/` `make-ccitt-fixtures.py`, `make-jpx-pages.py`, `make-png-fixtures.py`). **Reading set (mechanics §17):** BOB measured 263 KB at START, under 600 KB (K2700); I read it whole: `requirements/image-codecs.md`, K2701, K2702, K2719 (and K874), `plan/draft-T44.md` § N868 whole, the plan's opening rules and T44-1/T44-2, layer 1's contract and the helper-modules note in `layers.md`, test-support's public part, and the code and tests above. The JSON fixtures and PngSuite are data (K2053).

**Flaws found in my module and fixed** · R1's doc comment named return fields (`colour, sampling, restart`) it never had; it now says `source`. Two R1 refusal paths (restart interval cut, restart marker out of order) were driven by no test; both are now. No other flaw found in the whole read.

**Deferred** · none.

**Found for another module (REPORT J1)** · generated artifacts my change stales (§14): `ocr-worker/dist/ocr-worker.bundled.mjs` (+ `.bundle.json`, owner ocr-worker) and `bio-plane/dist/bio-plane.bundled.mjs` (owner not_product; plan rule 4 (5)), both from `pdf-worker/src/dctdecode.mjs`. pdf-worker's bundle does not include it. No requirement of another module changed; R1's header tables (image-cover's R1) are unchanged.

Size (session_0192ECShmFQefWJ5mQLg6Ptw): test runs 10, module lines 3417

## J1 · REPORT

Generated artifacts my change stales (mechanics §14), not regenerated by me: ocr-worker/dist/ocr-worker.bundled.mjs and .bundle.json (owner ocr-worker; its test R19 is the one red in ocr-worker/test/, 198 pass, 1 fail: STALE BUNDLE from pdf-worker/src/dctdecode.mjs) and bio-plane/dist/bio-plane.bundled.mjs (not_product; plan rule 4 (5)). pdf-worker's bundle does not include dctdecode.mjs. Both regenerate at L1's close as the plan says. No other module's requirement changed; readJpegHeader's tables (image-cover R1) are unchanged, image-cover 15/15.

## J2 · COMPLETE

T44-1 applied (commit 76b370eae1, record b9da37f4d1). R1: decodeBaselineJpeg and the new R11 decodeBaselineJpegRows share one strip-wise decode: one MCU row per component plus its context row, colour converted row by row from the subsampled planes, no full-size plane held; output unchanged (all 12 libjpeg-turbo digests pass, plus 39 new Pillow 12.3.0 edge fixtures: narrow, short, ragged heights, restarts). Live set measured (probe dct-memory.probe.mjs, table in my record): R1 at 4:2:0 3.16 B/px at 12 MP (was 6.66), 3.05 at 48 MP; 4:2:2 3.09, 4:4:4 3.15, grey 1.08. R11 holds 1-3 MB at 12 and 48 MP in every sampling; bound stated in the record (~76 bytes per image column at 4:2:0). R11 tests: joined rows equal R1 rotate-0 byte for byte for every fixture and sampling; every R1 refusal raised the same way (class, code, message, detail), control grey-baseline decodes; no zero-filled row handed over. For pdf-pixels T44-2: onRows' rows is ONE reused buffer, valid until onRows returns (copy to keep); strips are at most 8 x vmax rows. image-codecs 64/64; format, architecture, coverage (11/11), ownership: 0 failures. Users: pdf-pixels 4/4, image-cover 15/15, ocr-worker 198/199 (its stale bundle, REPORT J1). Read my code and tests whole; reading set 263 KB read whole. No file outside my paths.
