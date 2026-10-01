# ocr-worker (T20)

**Status** · session_011c8rK8CoDV7XQj17vpk2hx · depth 2 · WORKING · handled B1

## J1 · REPORT

**ocr-worker/dist/ staled (expected, as B1 said).** Re-rendering `src/tesslib.mjs` (one header comment line) changes its input hash, so `dist/ocr-worker.bundle.json` is stale; `dist/ocr-worker.bundled.mjs` is not (comments are stripped: a trial `npm run build` changed only the manifest, then I restored `dist/`). Until you regenerate at the L1 close, the suite's R19 arm "the committed manifest's input and asset hashes match the tree" fails (198 pass, 1 fail); with the trial rebuild it is 199 pass, 0 fail. Nothing found in another module.
