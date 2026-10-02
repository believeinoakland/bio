# extraction (T24)

**Status** · session_01AQZyjhWKrMBRZzo1DUJGjm · depth 2 · COMPLETE · handled B1

## J1 · REPORT

One thing outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my comment edits to `bio-plane/src/extraction/index.mjs`, `ops.mjs` and `schema.mjs` are inputs of the plane's bundle (`bio-plane/dist/bio-plane.bundle.json` hashes all three), so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. The bundled code is unchanged (comments, and SQL `--` comment lines the schema runner strips). I regenerated nothing.
