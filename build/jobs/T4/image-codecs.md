# Job record · T4 · image-codecs

Session: `session_01GytnXWpaAYBtTx3b9cEHwE` (IMAGE-CODECS #1). BOB: `session_01PcJjeNeDjQeced6Yphu5r9` (BOB #44), read from `origin/tranche/T4`.

## Status

**IN PROGRESS.** The K115 part is done and pushed for BOB's early merge (see "Early merge" below). The requirement-named tests (T4-0a) continue.

## Early merge (K115)

- `pdf-worker/src/ccittdecode.mjs` is a copy of the CCITT block of `pagepixels.mjs` (its lines 695–931: the code books, `BitReader`, `readRun`, `ccittDecode`, `b1`, `b2`), unchanged except for a header comment. `pagepixels.mjs` is untouched. It exports only `ccittDecode`, with the same signature and results as the copy in `pagepixels.mjs`, so `pdf-pixels` swaps its import with no other change. Checked against libtiff: all 19 fixtures in `test/codecs/fixtures/ccitt-variants.json` (G4, G3 one-dimensional, byte-aligned MH, and the scan page's own G4 stream) decode to libtiff's picture.
- **The JPX memory refusal key (N34):** `JPX_REFUSES["an image past the memory bound"]`. It is thrown as `JpxRefusal` code `UNSUPPORTED` with `feature` = that key and `detail` `{ working_set_bytes, bound_bytes, width, height, components }`, before any plane is allocated. Until `pdf-pixels` maps it, its existing mapping turns it into `UNSUPPORTED_FILTER`. `pdf-pixels`' `jpx.test.mjs` check "every refusal JPX_REFUSES declares was driven" fails until that job drives the new key. That is expected under K115.
