# ocr-worker (T19)

**Status** · session_01QM4dYxqMfWzRifHkXnvCj7 · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

`ocr-worker`'s `uses` in `build/modules.json` lacks `record-grammar`, so the entry's re-point (`test/ocr-worker.test.mjs`:36, `BASIS_GRADES` from `bio-plane/src/record-grammar/index.mjs`) fails the architecture check: "imports bio-plane/src/record-grammar/index.mjs of record-grammar, which ocr-worker does not declare in uses". Best reading: you add `record-grammar` to ocr-worker's `uses` (layer 1, first in the order, so P4 holds). After the re-point ocr-worker imports nothing of `legacy-checks` (its only catalogue import was this line), so `legacy-checks` can leave its `uses` in the same act. I carry on with the comment rewordings meanwhile; the re-point is made on my branch and its architecture check stays red until `tranche/T19` carries the edge.

## J2 · REPORT

1. **`ocr-worker/dist/` staled (expected, as B1 said).** My comment edits to `src/index.mjs`, `contract.mjs`, `member.mjs` and `tessengine.mjs` change their input hashes, so `dist/ocr-worker.bundle.json` is stale; `dist/ocr-worker.bundled.mjs` is not (comments are stripped: a trial `npm run build` changed only the manifest, then I restored both). Until you regenerate at the layer close, the suite's R19 arm "the committed manifest's input and asset hashes match the tree" fails (198 pass, 1 fail); with the trial rebuild it is 199 pass, 0 fail.
2. **bundler** (not mine): `verifyStatic`'s STALE BUNDLE finding (`bio-plane/scripts/fleet-bundle.mjs`) tells the reader to "Run `node tools/bundles.mjs`", a retired path (`tools/` is going this tranche); the regenerate recipe is now `build/manifest.md`'s table (`npm run build` in the member's directory). For bundler's T19 job or N437.
3. **Deferred in my own module:** `scripts/embed-tesslib.mjs`'s generated `HEADER` (and so `src/tesslib.mjs`'s first lines) names `bio-plane/test/fleetbundles.test.mjs`, now `bio-plane/test/system/`. Changing it re-renders a generated file and restales the bundle's input for a path-only comment; left for a vendor bump, recorded in my record.
