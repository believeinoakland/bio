# extraction (T11)

**Status** · session_01C1JzBJzAyWM9NPi1FuZxsZ · depth 2 · WORKING · handled B1

## J1 · REPORT

Provided part pushed early (§4): R61 `indexTestimony({bundleId, captureSha, words, author}) → indexed` and R62 `onIndexed(module, fn)` are on `job/T11/extraction` @ f688b385fb, methods of `extractionOf(ctx)`, as worded. observation-log (layer 5) can register R62 and legacy-store (layer 10) call R61 against it. One detail beyond the wording, decided on my reading: a call naming no bundle or capture digest writes nothing, calls no listener, and answers `written: 0` with a `why` (R61: it throws only when a listener throws). Tests and the rest of the job follow.
