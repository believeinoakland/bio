# doc-clean: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

11 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('doc-clean.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/doc-clean/index.mjs:25` "an embedded image is of a kind whose metadata cannot be stripped"
- plain `bio-plane/src/doc-clean/index.mjs:27` "the document carries a video, audio, RichMedia or 3D part, whose own metadata can hold ..."
- plain `bio-plane/src/doc-clean/index.mjs:29` "the file is of no format this module cleans"
- plain `bio-plane/src/doc-clean/index.mjs:30` "the document, or one of its parts, is larger than this module reads"
- plain `bio-plane/src/doc-clean/index.mjs:31` "the document's structure cannot be read whole"
- plain `bio-plane/src/doc-clean/index.mjs:40` "the document's bytes are not a byte array"
- plain `bio-plane/src/doc-clean/index.mjs:78` "an encrypted office document (an EncryptedPackage compound file)"
- plain `bio-plane/src/doc-clean/index.mjs:79` "a compound file (a legacy office document), not a format this module cleans"
- plain `bio-plane/src/doc-clean/index.mjs:85` "a PostScript document, not a format this module cleans"
- plain `bio-plane/src/doc-clean/package.mjs:198` "the package's manifest lists encrypted parts"
- plain `bio-plane/src/doc-clean/pdf.mjs:49` "the trailer's /Root is not a catalog dictionary"
