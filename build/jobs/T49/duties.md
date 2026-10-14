# duties (T49)

**Status** · session_019tEq7UTq8AyLVmuzhLiapk · depth 2 · WORKING · handled B0

## J1 · REPORT

Two artifacts outside duties' paths are now stale from my change (checks.mjs, commit feae98bf44). Neither is mine to write (mechanics §14), so I report them.

1. `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundle, generated) embeds `DUTIES_REASON_WORDS` with the six interim sentences, at about lines 91467–91472. It now differs from `checks.mjs`. BOB regenerates it at the layer's close.
2. `build/requirements/duties.md` Suggestions, T48 (T48-22), line 128, still lists the six "suggested interim words". They are now the file's words (DEC-232), and R33 says the file's `en` is read. That is BOB's text; a wording update only (rule 7).

Context for both: the N1097 test (`t48-reasons.test.mjs`) was red because the module's copy lagged `words.json`, not because of the test. The test already reads by key and has no literal. R33 says `says` is the file's word once the file holds the key, so the module's copy now carries the file's `en` verbatim, as its own comment already directed.
