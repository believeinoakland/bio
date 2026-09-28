# content (T7)

**Status** · session_014cVKFvJhGvHewaQ6myVSLX · depth 2 · WORKING · handled B1

## J1 · QUESTION

N119 changes what `cropOf` answers, so R32's text needs your fold (step 5: BOB updates the requirements first). My proposed R32, which I am building to now:

- **R32** The crop of an image cited by page and rectangle, through `pdf-pixels`, served as a derived rendition that says so; its bytes travel as `bytes_base64` (standard base64 of the rendition's file, whose `file_sha256` the answer states), never as raw octets; an absent or invisible row is `NO_SUCH_CONTENT`.

The module encodes it (so every route, not only the plane's, gets one wire form); the answer no longer carries `bytes`. Effect elsewhere: `bio-plane/test/d419-content-crop.test.mjs` (legacy-tests) reads `g.bytes` / `j.bytes`; its `octets` helper already decodes base64, so it needs only `bytes` → `bytes_base64` at its three reads. I will REPORT that at completion.

Also, for your record (not a question): N117's bound on `markStale` is stated in my record at completion; in short, one read (at most 200 rows graded, total counted in the same statement) and one UPDATE per re-read, and ONE notice per listener per re-read carrying the graded rows, never a notice per row.
