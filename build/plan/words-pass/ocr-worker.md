# ocr-worker: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

12 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('ocr-worker.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `ocr-worker/src/contract.mjs:87` "store must be named: this member reads a capture from one namespace and guesses none"
- plain `ocr-worker/src/contract.mjs:93` "says the namespace exists and holds no such capture"
- plain `ocr-worker/src/contract.mjs:94` "pages must be a non-empty array of 0-based page numbers"
- plain `ocr-worker/src/contract.mjs:95` "no capture with that sha in that store"
- plain `ocr-worker/src/contract.mjs:97` "the page could not be turned into pixels, and the renderer says why"
- plain `ocr-worker/src/contract.mjs:98` "this page's frame is larger than the largest frame measured to complete"
- plain `ocr-worker/src/contract.mjs:99` "the rendered container could not be read back to samples"
- plain `ocr-worker/src/contract.mjs:100` "the engine refused or failed on this frame"
- plain `ocr-worker/src/contract.mjs:101` "the engine returned no anchorable word for this page"
- plain `ocr-worker/src/contract.mjs:104` "a picture is a one-page document (page 0); the page asked for does not exist"
- plain `ocr-worker/src/pngsamples.mjs:44` "a scanline uses a filter type this reader does not implement"
- plain `ocr-worker/src/pngsamples.mjs:45` "the inflated raster is shorter than the header's dimensions require"

## Test copies of code sentences (K3962)

8 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `ocr-worker/test/ocr-worker.test.mjs:480` "\"MEASUREMENTS.md 2026-09-10 (CPDF-15) — tesseract-wasm@0.11.0 SIMD +...\""
- testcopy `ocr-worker/test/ocr-worker.test.mjs:481` "\"deployed Workers runtime: 99.89% characters and 89/90 digits with Z...\""
- testcopy `ocr-worker/test/ocr-worker.test.mjs:482` "\"human-ground-truthed page (Oakland Legistar attachment 15721260 p2,...\""
- testcopy `ocr-worker/test/ocr-worker.test.mjs:483` "\"over identical bytes (9 images x 3 runs, no image gave more than on...\""
- testcopy `ocr-worker/test/ocr-worker.test.mjs:484` "\"invention band EMPTY at every rung of CPDF-11's ladder. REACH, STAT...\""
- testcopy `ocr-worker/test/ocr-worker.test.mjs:485` "\"page, ONE engine version, ONE model. Every other corpus figure in t...\""
- testcopy `ocr-worker/test/ocr-worker.test.mjs:486` "\"agreement-with-the-local-floor and NOT accuracy — and D-314/CPDF-16...\""
- testcopy `ocr-worker/test/ocr-worker.test.mjs:487` "\"local model passes the noise control, so no agreement figure may be...\""
