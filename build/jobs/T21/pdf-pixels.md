# pdf-pixels (T21)

**Status** · session_01Se6xS58Nis2ohaMchdpduN · depth 2 · COMPLETE · handled B1


### Completion

- **Applied:** N455 and N469, comments only. `pagepixels-corpus.probe.mjs`:4–7 and `agenda-scan-census.probe.mjs`:4–6 no longer name `battery.mjs` or `coverage.mjs` as runners: a `.probe.mjs` is run by hand, and neither `pdf-worker`'s `npm test` nor any `node --test` glob reaches it. `pagepixels-corpus.probe.mjs`:6 "battery-resident half" now reads "hermetic half". `agenda-scan-census.probe.mjs`:8 names no file (D-321's aim, an end-to-end OCR test). Its :32 claim (`ocr-member-e2e.test.mjs` section 4 asserts that the resolution page mints no reference) is dropped: no test now makes that claim, and it is not one of this module's requirements (`reading_refs` is ocr-worker's). Re-scan of my paths: `pagepixels-corpus.probe.mjs`:405 (`pdf-worker.test.mjs`'s idiom, copied) is provenance and stays, now in the past tense. Own-module fix: `pagepixels-worker.mjs`:11–12 said the suite's workerd arm imports it, but no suite does (each bundles its own entry). It now names only the probe's `--workerd` arm. `pagepixels.mjs` is untouched.
- **Deferred:** none.
- **Found in other modules:** no test now drives `scan-ccitt-g4-page.pdf` through the OCR engine to show it mints no `reading_refs` reference. `ocr-worker/test/ocr-worker.test.mjs` uses the fixture, but not for that claim. This is for ocr-worker's requirements, if they hold the claim.
- **Generated artifacts:** none staled. The changed files are not bundle inputs; only `pagepixels.mjs` feeds the bio-plane and ocr-worker bundles.
- **Tests:** pagepixels 178 passed, 0 failed; imagecrop 54/0; jbig2 179/0; jpx 205/0; both probes pass `node --check`.
- **Checks:** format: 86 modules, 0 failures; architecture: 13 product files, 0 failures; coverage: 25 of 25 live ids, 0 failures; ownership: 0 failures.
- Size (session_01Se6xS58Nis2ohaMchdpduN): test runs 4, module lines 3111

## J1 · COMPLETE

Complete. N455 and N469 applied, comments only. Both probes no longer name battery.mjs or coverage.mjs as runners. agenda-scan-census's ocr-member-e2e notes: :8 names no file now, and the :32 claim is dropped (no test makes it; it is ocr-worker's, not a pdf-pixels requirement). Own fix: pagepixels-worker.mjs's note that the suite imports it (false). No generated artifact staled (pagepixels.mjs is untouched). Tests: pagepixels 178/0, imagecrop 54/0, jbig2 179/0, jpx 205/0. Checks: format, architecture, coverage (25/25) and ownership all 0 failures. For ocr-worker: no test now drives scan-ccitt-g4-page.pdf through the engine to show it mints no reading_refs reference. Details are in the record's Completion section.
