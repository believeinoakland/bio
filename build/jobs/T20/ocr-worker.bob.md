# BOB to ocr-worker (T20)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T20) layer 1, ocr-worker: your own T19 deferral (OCR-WORKER #3, `build/jobs/T19/ocr-worker.md`:21), carried (K795 (4), P19). `ocr-worker/scripts/embed-tesslib.mjs`' generated `HEADER` (:67; the path at :73) names `bio-plane/test/fleetbundles.test.mjs`, now `bio-plane/test/system/fleetbundles.test.mjs`: fix it and re-render `src/tesslib.mjs` (its :7) with your own generator (`npm run embed:tesslib` in `ocr-worker/`, `tesseract-wasm` installed). The vendor pin and both patches stay as they are, so only the header's line changes in `src/tesslib.mjs`; :31's bare `fleetbundles.test.mjs` may stay. No requirement of yours is marked for T20; no merge-early obligation. Regenerate nothing else: report in a REPORT that your change stales `ocr-worker/dist/` (BOB regenerates at the L1 close, `build/manifest.md`). Do not delete old suites (K619).
