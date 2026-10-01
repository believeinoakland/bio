# pdf-worker (T20)

**Status** · session_01517coXM6VXW6mGeq6J943P · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` T20 layer 1, pdf-worker; B1):
- N437's share: `src/index.mjs` `SURFACE` note re-worded on the ocr-worker T19 model: the fleet-coverage instrument (`scripts/coverage.mjs`, D-117) is named as retired (K739), the `--strict` gate claim is gone, and the suite (R12, R35) is named as what holds the surface. `fleet-member.json`'s top-level `note` re-worded the same way (battery and fleet-bundle as the live discoverers). Comments only; 9 lines → 8.
- `scripts/build.mjs`:15 and `fleet-member.json` `bundle.note` now name `bio-plane/test/system/fleetbundles.test.mjs`.
- Net module change: −1 line; no growth (N34, ⚑BOB-5).

**Fixed in my own module:** `test/structure.test.mjs` R4 ("the namespaces equal the plane's own set") failed on `tranche/T20` before my change: it read `const NAMESPACES` from `bio-plane/src/index.mjs`, which the control-plane split (804c1d026d, K624) moved to `bio-plane/src/admission/index.mjs` as `export const`. The test now reads that file and accepts the `export` prefix; it still checks the full set, equal to `["bio","scratch"]`. Same line count.

**Deferred:** none.

**Found in other modules / artifacts:**
- `pdf-worker/dist/` is stale (its `src/index.mjs` input changed); BOB regenerates at the L1 close. Not regenerated here.
- `pdf-pixels` owns `test/pagepixels-corpus.probe.mjs`:5 and `test/agenda-scan-census.probe.mjs`:5, which say the probes are not run by `coverage.mjs`, a retired instrument (N437's kind).
- `build/requirements/pdf-worker.md` (BOB's): R35's lead-in says `SURFACE` is read by `bio-plane/scripts/coverage.mjs`, which is retired; Suggestions name `bio-plane/test/fleetbundles.test.mjs`, now `test/system/`.

**Tests and checks run:**
- `npm test` (pdf-worker): structure 83 passed, 0 failed; pagepixels 178/0; imagecrop 54/0; jbig2 179/0; jpx 205/0. (Before the R4 fix: structure 82 passed, 1 failed, also on the clean tree.) The suites drive the committed bundle, so they exercised the unchanged behaviour.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … pdf-worker`: 13 product files, 8 relative imports; 0 failures.
- `node checks/coverage.mjs … pdf-worker`: 17 of 17 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … pdf-worker tranche/T20`: 5 files changed; 0 failures.
- No layer tests are named in `build/manifest.md`.

Size (session_01517coXM6VXW6mGeq6J943P): test runs 4, module lines 4,074

## J1 · REPORT

1. `pdf-worker/dist/` is stale: `src/index.mjs` (a bundle input) changed, comments only. Not regenerated; for the L1 close.
2. `pdf-pixels` (not mine): `pdf-worker/test/pagepixels-corpus.probe.mjs`:5 and `test/agenda-scan-census.probe.mjs`:5 name the retired `coverage.mjs` as a runner the probes avoid (N437's kind).
3. `build/requirements/pdf-worker.md` (yours): R35's lead-in names `bio-plane/scripts/coverage.mjs` as the reader of `SURFACE`/`fleet-member.json` (retired, K739); Suggestions name `bio-plane/test/fleetbundles.test.mjs`, now `bio-plane/test/system/`.
4. Pre-existing red on `tranche/T20`, fixed in my own test: structure R4 read `NAMESPACES` from `bio-plane/src/index.mjs`; the control-plane split (804c1d026d) moved it to `bio-plane/src/admission/index.mjs` as `export const`. The test now reads that file; full-set check unchanged.
