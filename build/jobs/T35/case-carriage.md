# case-carriage (T35)

**Status** · session_0135Aih7kZEH3wwKzzpukHAF · depth 2 · WORKING · handled B0

## J1 · QUESTION

R8's wording leaves four small points open. I am building on the readings below and carrying on; answer only if one is wrong.
1. **Order held.** For a member: the document, its extracted text, its own tokens (R1), then its `container` record, its archive, the archive's tokens; then the same three for the archive's archive, outward.
2. **`sha256` in an `unheld` row of kind `container`** is the member document's SHA-256. The record's own digest is not useful here, because the record is not held. For kind `archive`, and for an archive token not held, it is the archive's `archive_sha256`.
3. **An archive not held** (no home, or inline text at another digest) is named once, and the chain stops there. Its tokens and its own archive are not read, since nothing can be checked against an archive that is not carried. A malformed `container` block also stops the chain, after naming it.
4. **The `container` record** is the whole block as the entry states it, `name_shared` and `path_unsafe` included, in `canonicalJson`. `member_sha256` and `archive_sha256` are compared case-insensitively. A `sha256:` prefix on `member_sha256` is ignored, as R1 already ignores one on `capture.sha256`.
