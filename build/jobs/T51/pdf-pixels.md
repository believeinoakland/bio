# pdf-pixels (T51)

**Status** · session_01CDmjLZR4AnXcUoKjGVUyEk · depth 2 · WORKING · handled B0

## J1 · REPORT

Two of the 27 plain findings are not sentences a member reads; they stay unconverted and BOB decides them (the design's `unkeyed` list, K3944):

- `pdf-worker/src/pagepixels.mjs:119` and `pdf-worker/src/picturepixels.mjs:60`: "an image past the memory bound". It is the mapping key of the JPX and PNG codecs' feature refusals (`featureReasons(…, { "an image past the memory bound": "IMAGE_TOO_LARGE" })`), matched by exact equality with the codec's declared feature names (image-codecs R25, R42). A key is a wire string, not a sentence: a word row for it would change the key the mapping matches, so it must not be read through `localize`. Not shown to a member; the member sees `IMAGE_TOO_LARGE` and its `why`.
