# ocr-worker (T19)

**Status** · session_01QM4dYxqMfWzRifHkXnvCj7 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

`ocr-worker`'s `uses` in `build/modules.json` lacks `record-grammar`, so the entry's re-point (`test/ocr-worker.test.mjs`:36, `BASIS_GRADES` from `bio-plane/src/record-grammar/index.mjs`) fails the architecture check: "imports bio-plane/src/record-grammar/index.mjs of record-grammar, which ocr-worker does not declare in uses". Best reading: you add `record-grammar` to ocr-worker's `uses` (layer 1, first in the order, so P4 holds). After the re-point ocr-worker imports nothing of `legacy-checks` (its only catalogue import was this line), so `legacy-checks` can leave its `uses` in the same act. I carry on with the comment rewordings meanwhile; the re-point is made on my branch and its architecture check stays red until `tranche/T19` carries the edge.

## J2 · REPORT

1. **`ocr-worker/dist/` staled (expected, as B1 said).** My comment edits to `src/index.mjs`, `contract.mjs`, `member.mjs` and `tessengine.mjs` change their input hashes, so `dist/ocr-worker.bundle.json` is stale; `dist/ocr-worker.bundled.mjs` is not (comments are stripped: a trial `npm run build` changed only the manifest, then I restored both). Until you regenerate at the layer close, the suite's R19 arm "the committed manifest's input and asset hashes match the tree" fails (198 pass, 1 fail); with the trial rebuild it is 199 pass, 0 fail.
2. **bundler** (not mine): `verifyStatic`'s STALE BUNDLE finding (`bio-plane/scripts/fleet-bundle.mjs`) tells the reader to "Run `node tools/bundles.mjs`", a retired path (`tools/` is going this tranche); the regenerate recipe is now `build/manifest.md`'s table (`npm run build` in the member's directory). For bundler's T19 job or N437.
3. **Deferred in my own module:** `scripts/embed-tesslib.mjs`'s generated `HEADER` (and so `src/tesslib.mjs`'s first lines) names `bio-plane/test/fleetbundles.test.mjs`, now `bio-plane/test/system/`. Changing it re-renders a generated file and restales the bundle's input for a path-only comment; left for a vendor bump, recorded in my record.

## Completion (OCR-WORKER #3)

**Entries applied.** (1) `test/ocr-worker.test.mjs`:36: `BASIS_GRADES` imported from `bio-plane/src/record-grammar/index.mjs`, not the catalogue (rule 1); the `uses` edge it needed was added by BOB (K747, B2), and ocr-worker now imports nothing of `legacy-checks`. (2) N437, this module's share: `src/index.mjs`:53 (the `SURFACE` note no longer names `scripts/coverage.mjs` as the instrument reading it; it is retired, K739), `src/contract.mjs`:10 (the measurement kept as history, the instrument named as retired), `fleet-member.json`'s `note` (its live readers named: `battery.mjs` and `fleet-bundle.mjs`), plus `wrangler.jsonc`:9 (`coverage.mjs --strict` no longer claimed) and `scripts/embed-tesslib.mjs`:90 (the deleted CPDF-15 probe no longer named as the instrument).

**Own-module fixes.** Stale paths corrected: `ocrTextFromMember` is in `bio-plane/src/extraction/pipeline.mjs` (`member.mjs`, `tessengine.mjs`, `contract.mjs`); `fleetbundles.test.mjs` and `resolveversion.test.mjs` are under `bio-plane/test/system/` (`build.mjs`, `wrangler.jsonc`, `index.mjs`). `index.mjs`'s "per-word regions" corrected to line grain (R8, `REGION_GRAIN`).

**Deferred.** `scripts/embed-tesslib.mjs`'s generated `HEADER` (and so `src/tesslib.mjs`'s header) still names `bio-plane/test/fleetbundles.test.mjs` without `system/`: fixing it re-renders a generated file for a path-only comment; left for the next vendor bump.

**Found in other modules (REPORT J2).** `ocr-worker/dist/ocr-worker.bundle.json` is stale from my comment edits (input hashes only; a trial `npm run build` left `dist/ocr-worker.bundled.mjs` byte-identical and was restored). bundler: `verifyStatic`'s STALE BUNDLE finding names the retired `node tools/bundles.mjs`.

**Tests and checks.** `node test/ocr-worker.test.mjs`: `198 passed, 1 failed`, the one being R19's "the committed manifest's input and asset hashes match the tree" (the stale manifest above; with the trial rebuild, `199 passed, 0 failed`). No layer tests (`build/manifest.md`). `format: 83 modules, 78 requirements files; 0 failures` · `architecture: 20 product files, 20 relative imports …; 0 failures` · `coverage: 1 modules, 22 of 22 live requirement ids named by a test; 0 failures` · `ownership: 10 files changed by ocr-worker between tranche/T19 and HEAD; 0 failures`.

Size (session_01QM4dYxqMfWzRifHkXnvCj7): test runs 3, module lines 959

## J3 · COMPLETE

Both entries applied (BASIS_GRADES from record-grammar; N437's comments) plus stale paths fixed; record has the details. Checks 0 failures each after merging tranche/T19 (K747). Suite 198/1: the one is R19's stale dist manifest, which your layer-close regeneration clears (trial rebuild: 199/0). See J2.
