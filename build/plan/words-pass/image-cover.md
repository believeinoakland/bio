# image-cover: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

24 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('image-cover.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/image-cover/index.mjs:34` "an area lies wholly outside the picture"
- plain `bio-plane/src/image-cover/index.mjs:35` "the photo is larger, in bytes or in pixels, than the most this module covers"
- plain `bio-plane/src/image-cover/index.mjs:36` "the image data ends before the image does"
- plain `bio-plane/src/image-cover/index.mjs:48` "the photo's bytes are not a byte array"
- plain `bio-plane/src/image-cover/index.mjs:66` "the image is larger, in bytes, than the most this module reads"
- plain `bio-plane/src/image-cover/index.mjs:67` "the image data ends before the image does"
- plain `bio-plane/src/image-cover/index.mjs:68` "the image's segments, chunks or boxes cannot be walked"
- plain `bio-plane/src/image-cover/index.mjs:77` "the image's bytes are not a byte array"
- plain `bio-plane/src/image-cover/strip.mjs:67` "the file ends inside a marker"
- plain `bio-plane/src/image-cover/strip.mjs:84` "a scan before the frame header"
- plain `bio-plane/src/image-cover/strip.mjs:185` "the file ends inside the screen descriptor"
- plain `bio-plane/src/image-cover/strip.mjs:188` "the file ends inside the global colour table"
- plain `bio-plane/src/image-cover/strip.mjs:192` "the file ends before the trailer"
- plain `bio-plane/src/image-cover/strip.mjs:196` "the file ends inside an extension"
- plain `bio-plane/src/image-cover/strip.mjs:204` "the file ends inside the image descriptor"
- plain `bio-plane/src/image-cover/strip.mjs:207` "the file ends before the image data"
- plain `bio-plane/src/image-cover/strip.mjs:219` "the trailer before any image"
- plain `bio-plane/src/image-cover/strip.mjs:245` "a VP8X chunk out of place or short"
- plain `bio-plane/src/image-cover/strip.mjs:283` "a marker runs past the end of the codestream"
- plain `bio-plane/src/image-cover/strip.mjs:310` "a tile-part runs past the end of the codestream"
- plain `bio-plane/src/image-cover/strip.mjs:316` "a tile-part header runs past its tile-part"
- plain `bio-plane/src/image-cover/strip.mjs:319` "a tile-part header marker runs past its tile-part"
- plain `bio-plane/src/image-cover/strip.mjs:366` "a box header runs past its container"
- plain `bio-plane/src/image-cover/strip.mjs:396` "the box after the signature is not ftyp"
