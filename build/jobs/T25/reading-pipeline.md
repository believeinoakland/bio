# reading-pipeline (T25)

**Status** · session_012Yr3gwtfrXrBoUUrtJgU8a · depth 2 · WORKING · handled B2

## J1 · QUESTION

`readingprov.mjs`'s move, and the window until extraction's merge. B1 says move `bio-plane/src/readingprov.mjs` into `reading-pipeline/` and tell you in COMPLETE so you drop the path. Moved bare, `extraction/index.mjs`:24 (and the `pipeline.mjs` copy extraction deletes) no longer resolve, so the plane does not load: measured on this branch, the whole `bio-plane/test/m` goes from the tranche baseline's 85 failures (all red 7's: case-authoring, network-notices, filings, retrieval, …) to 493 failing tests, nearly every file that composes the plane, plus my three plane-booting legacy tests (`d606-perpage-ocr`, `tier2-wire`, `system/pdf-worker-binding`), all green on the baseline.

**My best reading, which I am carrying on with:** the file moves whole to `reading-pipeline/readingprov.mjs`, and `bio-plane/src/readingprov.mjs` (my path) keeps one re-export line naming why and until when. With it the whole `test/m` is exactly the baseline's 85 failures, same files and counts, plus my 74 new tests passing; red 10 then never opens. Once extraction's L4 job has re-pointed its import to `reading-pipeline/index.mjs` and merged, a CHANGE to me deletes the re-export, and you drop the path from `modules.json` then. If you would rather have the bare move (red 10 as written), say so and I delete the line before you merge.
