# ocr-worker (T19)

**Status** · session_01QM4dYxqMfWzRifHkXnvCj7 · depth 2 · WORKING · handled B0

## J1 · QUESTION

`ocr-worker`'s `uses` in `build/modules.json` lacks `record-grammar`, so the entry's re-point (`test/ocr-worker.test.mjs`:36, `BASIS_GRADES` from `bio-plane/src/record-grammar/index.mjs`) fails the architecture check: "imports bio-plane/src/record-grammar/index.mjs of record-grammar, which ocr-worker does not declare in uses". Best reading: you add `record-grammar` to ocr-worker's `uses` (layer 1, first in the order, so P4 holds). After the re-point ocr-worker imports nothing of `legacy-checks` (its only catalogue import was this line), so `legacy-checks` can leave its `uses` in the same act. I carry on with the comment rewordings meanwhile; the re-point is made on my branch and its architecture check stays red until `tranche/T19` carries the edge.
