# publication (T24)

**Status** · session_011EAWfk12CZpKfp2bDZSvBW · depth 2 · RUNNING until 2026-10-02T14:51:46Z (node --test bio-plane/test/m/) · handled B1

## J1 · REPORT

Three things outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my edits to `bio-plane/src/publication/index.mjs` (the re-export removed, a comment) and `schema.mjs` (a SQL comment, stripped before execution) are inputs of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. I regenerated nothing.
2. **`build/requirements/publication.md`, stale after N483/N501** (wording; BOB's file): the Purpose's "reached here through the ops `export` and `exportlog`" and the Uses line for `corpus-export` ("to which the ops `export` and `exportlog` delegate until the plane's op map spreads its ops") no longer hold: publication has no such ops, and the plane's op map spreads `corpusExportOps` (`plane/store.mjs`:292, N483, K1122). Suggest: "the ops `export` and `exportlog` are corpus-export's, spread by the plane (N483)" and Uses "`corpusExportOf`, created by this module's factory so `export_log` exists at every boot (its R4); nothing else".
3. **Same file, R23**: "Today `legacy-store` fills it; `review` does when extracted." `review` fills it now (`review/index.mjs`:747, `registerReviewProvider("review", …)`). Suggest "`review` fills it (its R…)". Also `corpus-export.md`'s Suggestions line 56 ("until the plane's op map spreads `corpusExportOps` (T23 L11), those ops route nowhere") is past now.
