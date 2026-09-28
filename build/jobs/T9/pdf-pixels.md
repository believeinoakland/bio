# pdf-pixels (T9)

**Status** · session_01XVGk5mMCA4CFxRzihSLoPk · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**N255 applied** (commit 2bc32864cf). `pdf-worker/test/jpx.test.mjs` (R25) re-pins the JPX memory-bound tests on image-codecs' N75.
- The expected `working_set_bytes` and `bound_bytes` are now the figures in the codec's own `JpxRefusal` for the same patched bytes (`decodeJpx`, image-codecs R4). No formula is restated. The test also checks that the codec's working set is past its bound, so what R25 maps is a real memory refusal.
- Sizes, from IMAGE-CODECS #2 J1: 5000x5000 colour and 8000x8000 grey are refused `IMAGE_TOO_LARGE`, with the codec's feature and figures, the width, height, components and no bytes. 5000x5000 grey is not refused for memory.
- The check that every `JPX_REFUSES` key was driven still passes: the memory key is reached through both refused sizes.
- No change to the module's code. R25's mapping (`JPX_FEATURE_REASONS`) already carries the codec's detail as it stands.

**Deferred:** nothing.

**Found in other modules:** nothing new. ocr-worker's and pdf-worker's bundles are stale, as B1 says (image-codecs' change, not mine; this job changed no source file).

**A note on my own module, no change made:** on the JPX route, `rotate8` builds a second full-size frame when the page's /Rotate is not 0. N75 now admits pages up to about 61 MB of 8-bit output. So a rotated large colour page holds two copies of the output at once while it is turned (about 50 MB for a 2550x3300 colour page), plus the PNG being encoded. That is within the 128 MB isolate on the measured sizes. A 90/270 turn cannot be done in place for a non-square frame, so I leave it as is. It is worth measuring if tier 3 sees a large rotated JPX page.

**Tests** (by file, from `pdf-worker/`):
- jpx: 205 passed, 0 failed (was 199/2)
- jbig2: 179 passed, 0 failed
- pagepixels: 178 passed, 0 failed
- imagecrop: 54 passed, 0 failed
- Layer tests: none named in `build/manifest.md`.

**Checks** (civicos-process):
- `format`: 69 modules, 64 requirements files; 0 failures
- `architecture pdf-pixels`: 13 product files, 29 relative imports; 0 failures
- `coverage pdf-pixels`: 25 of 25 live requirement ids named by a test; 0 failures
- `ownership pdf-pixels tranche/T9`: 1 file changed; 0 failures

Size (session_01XVGk5mMCA4CFxRzihSLoPk): test runs 6, module lines 1074
