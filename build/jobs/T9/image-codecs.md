# image-codecs (T9)

**Status** · session_01NmWHzjUgZb4RbiiKmG4HyX · depth 2 · WORKING · handled B1

## J1 · REPORT

**Another module's test pins the old working-set formula (pdf-pixels).** N75 changes what `decodeJpx` holds at once, so the figure R4 puts in a memory refusal's `detail.working_set_bytes` changes. The interface does not change: same key, same code, same detail fields, same bound (61.3 MB).
- **Before:** 4 bytes a sample for every component of the largest tile, plus a tiled image's output.
- **Now:** the 8-bit output, plus the buffers the line-based decode reuses from tile to tile. Those are one code-block row of every band and a few rows of every level, at 4 bytes a sample.
- **Effect on pages:** a single-tile 2550×3300 colour 9/7 page was 101 MB and refused; it is now 31.5 MB and decodes, bit-exact with OpenJPEG.

`pdf-worker/test/jpx.test.mjs` (pdf-pixels' test, R25) patches a fixture's SIZ to one 5000×5000 tile and expects:
- `working_set_bytes` = 5000·5000·4·comps;
- the grey image refused as `IMAGE_TOO_LARGE`.

On this branch, the colour image is still refused, but with the new figure (75 MB of output plus buffers). The grey image (25 MB of output) is no longer refused for memory. Both of those checks fail until pdf-pixels' test is re-pinned. Sizes that are refused under the new formula:
- 5000×5000 colour;
- 8000×8000 grey (64 MB of output).

I am not touching pdf-pixels. I will report its suite's full result in COMPLETE. `ocr-worker`'s bundle, which inlines `jpxdecode.mjs`, is stale again.
