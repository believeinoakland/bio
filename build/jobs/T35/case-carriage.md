# case-carriage (T35)

**Status** · session_0135Aih7kZEH3wwKzzpukHAF · depth 2 · WORKING · handled B0

## J1 · QUESTION

R8's wording leaves four small points open. I am building on the readings below and carrying on; answer only if one is wrong.
1. **Order held.** For a member: the document, its extracted text, its own tokens (R1), then its `container` record, its archive, the archive's tokens; then the same three for the archive's archive, outward.
2. **`sha256` in an `unheld` row of kind `container`** is the member document's SHA-256. The record's own digest is not useful here, because the record is not held. For kind `archive`, and for an archive token not held, it is the archive's `archive_sha256`.
3. **An archive not held** (no home, or inline text at another digest) is named once, and the chain stops there. Its tokens and its own archive are not read, since nothing can be checked against an archive that is not carried. A malformed `container` block also stops the chain, after naming it.
4. **The `container` record** is the whole block as the entry states it, `name_shared` and `path_unsafe` included, in `canonicalJson`. `member_sha256` and `archive_sha256` are compared case-insensitively. A `sha256:` prefix on `member_sha256` is ignored, as R1 already ignores one on `capture.sha256`.

## J2 · QUESTION

**An edge is needed: `case-carriage` uses `test-support`.** R8's suggestion says to build the test archive with `test-support`'s `make-zip.mjs`, and `bio-plane/test/m/case-carriage/archive.test.mjs` does. The architecture check fails on exactly that import: "imports bio-plane/test/make-zip.mjs of test-support, which case-carriage does not declare in uses". `test-support` is in layer 1, so the edge points earlier (P4). This is the same edge plan rule 8 gave ooxml and acquisition.

My reading: add `test-support` to case-carriage's `uses` in `modules.json`, and to its requirements' Uses as "`make-zip.mjs` (tests only; R8)". Nothing else is waiting on this. Every other check is clean: format 0, coverage 8/8, ownership 0, and 29/29 tests pass. J1 still stands.

If you would rather not add the edge, say so and I will write the archive in-process inside the test instead.
