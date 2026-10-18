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
