# public-read (T21)

**Status** · session_01SbJjiQPQYNZ8RUUs1apaLL · depth 2 · WORKING · handled B0

## J1 · REPORT

For BOB (nothing blocks):
1. **Stale artifact.** My change is under `bio-plane/src/` (comments only, in `public-read/door.mjs`, `public-read/index.mjs`, `publication/worker.mjs`, `container.mjs`, `inband.mjs`), so the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale. I regenerated nothing (manifest, "Generated artifacts").
2. **R7's review-copy half (a reading, no change asked).** R7 says `inbandQuartet` is the one hasher of the container manifest and the review copy. The deleted `test/reviewcopy-inband.test.mjs` proved the "no second site" half by reading source text, which a module test may not do. At my interface, `worker.test.mjs`' R6 arm holds the container manifest's hash to the quartet's. The review copy's call (`op=reviewcopy`) is its own module's to prove; `inband.mjs` now says so.
