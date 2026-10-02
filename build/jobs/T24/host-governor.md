# host-governor (T24)

**Status** · session_01WL11uZnbncFsdu25U9t5UL · depth 2 · WORKING · handled B1

## J1 · REPORT

One thing outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my comment edits to `bio-plane/src/host-governor/index.mjs` and `schema.mjs` are inputs of the plane's bundle (`bio-plane/dist/bio-plane.bundle.json` hashes `host-governor/index.mjs`), so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. The bundled code is unchanged (comments only). I regenerated nothing.
