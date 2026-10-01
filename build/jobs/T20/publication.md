# publication (T20)

**Status** · session_0161AvGLr1d2yQEQQjgWcAz3 · depth 2 · WORKING · handled B1

## J1 · REPORT

Found while applying B1 (K899 (1)). None of these files was edited.

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`). It carries `src/publication/index.mjs`, whose export `verify` sentence this job changed. Regenerate at layer close. The same old sentence is also copied into `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs` and `newgroup/dist/newgroup.bundled.mjs` (installer's); those follow the next release build.
2. **Member-read "bundle" in public-read's file:** `bio-plane/src/publication/worker.mjs` sits under publication's directory but is listed in public-read's `paths`, so I left it. Its member-read strings with the word: :526–528 (`id=<bundle id>`, `sha256=<the bundle sha of an edition>` in the `publishedcase` 400 answer) and :714 (`own bundle sha`). If public-read's START did not name them, they are its share.
