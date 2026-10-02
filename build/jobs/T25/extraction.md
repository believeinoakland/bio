# extraction (T25)

**Status** · session_018Jaiitbn2X3Px2hE9n3hc8 · depth 2 · RUNNING until 2026-10-02T19:07:37Z (node --test bio-plane/test/m) · handled B1

## J1 · QUESTION

Re-point target (B1 (1), (2)). reading-pipeline has not merged and its branch holds no code yet, so the file names its moved code will export from are not fixed. My best reading, which I am building on: everything `extraction` imports (`read`, `tier2Escalate`, `tier3Extend`, `tier3SeedFrom`, `needsTier3`, `textUnitsFor`, `layerChainFor`, `readingFromWire`, `decodeView`, `textCountsOf`, `pageBoxesFrom`, `bytesOf`, `CAPTURE_TEXT_UNIT_CAP`, `readingProvenance`, `compareProvenance`, `PROVENANCE_SCHEME`) is exported from one entry, `bio-plane/src/reading-pipeline/index.mjs`, and the tests that stay import the same entry. If reading-pipeline names other files (say `reading-pipeline/pipeline.mjs` and `reading-pipeline/readingprov.mjs`, or keeps `src/readingprov.mjs` where modules.json still lists it), tell me which and I re-point when I merge tranche/T25 after its merge. No answer needed before that merge; I carry on with the test cuts and the stale-note re-scan meanwhile.
