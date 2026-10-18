# image-codecs: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

45 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('image-codecs.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `pdf-worker/src/dctdecode.mjs:390` "libjpeg's default for three components"
- plain `pdf-worker/src/jbig2decode.mjs:57` "a region's colour-extension flag (T.88 Amendment 3) is set"
- plain `pdf-worker/src/jbig2decode.mjs:59` "a symbol dictionary reuses a previous dictionary's arithmetic contexts"
- plain `pdf-worker/src/jbig2decode.mjs:60` "a Huffman-coded symbol dictionary or text region refines its symbols"
- plain `pdf-worker/src/jbig2decode.mjs:61` "an extension segment the decoder must understand and does not"
- plain `pdf-worker/src/jbig2decode.mjs:62` "a segment type T.88 does not define"
- plain `pdf-worker/src/jbig2decode.mjs:63` "the stream holds more than one page"
- plain `pdf-worker/src/jbig2decode.mjs:64` "the stream holds no page information segment"
- plain `pdf-worker/src/jbig2decode.mjs:233` "a Huffman code no table line holds"
- plain `pdf-worker/src/jbig2decode.mjs:250` "a custom Huffman table with no end"
- plain `pdf-worker/src/jbig2decode.mjs:488` "refinement adaptive pixel is not yet decoded"
- plain `pdf-worker/src/jbig2decode.mjs:569` "a refined symbol of negative size"
- plain `pdf-worker/src/jbig2decode.mjs:588` "a text region with no end"
- plain `pdf-worker/src/jbig2decode.mjs:603` "a symbol-id length code outside the run table"
- plain `pdf-worker/src/jbig2decode.mjs:608` "a repeated symbol-id length with nothing before it"
- plain `pdf-worker/src/jbig2decode.mjs:612` "more symbol-id lengths than symbols"
- plain `pdf-worker/src/jbig2decode.mjs:674` "a generic region of unknown length never ends"
- plain `pdf-worker/src/jbig2decode.mjs:715` "a page of unknown height that is not striped"
- plain `pdf-worker/src/jbig2decode.mjs:858` "a custom Huffman table the segment does not refer to"
- plain `pdf-worker/src/jbig2decode.mjs:901` "a refinement/aggregate symbol of no instances"
- plain `pdf-worker/src/jbig2decode.mjs:946` "an export run past the symbols"
- plain `pdf-worker/src/jbig2decode.mjs:977` "a custom Huffman table the segment does not refer to"
- plain `pdf-worker/src/jbig2decode.mjs:1007` "a pattern of no size"
- plain `pdf-worker/src/jbig2decode.mjs:1016` "the pattern dictionary's arithmetic data ran out"
- plain `pdf-worker/src/jbig2decode.mjs:1034` "a halftone region with no pattern dictionary"
- plain `pdf-worker/src/jbig2decode.mjs:1061` "the halftone region's arithmetic data ran out"
- plain `pdf-worker/src/jpxdecode.mjs:59` "the codestream uses Part 15 (HTJ2K) block coding"
- plain `pdf-worker/src/jpxdecode.mjs:60` "the image's samples index a palette (pclr box)"
- plain `pdf-worker/src/jpxdecode.mjs:61` "the JP2 colour specification is sYCC, whose conversion is not bit-defined"
- plain `pdf-worker/src/jpxdecode.mjs:64` "an image past the memory bound"
- plain `pdf-worker/src/jpxdecode.mjs:64` "the decode would hold more at once than the memory bound: the 8-bit output, and beside ..."
- plain `pdf-worker/src/jpxdecode.mjs:140` "the JP2 file holds no codestream (jp2c box)"
- plain `pdf-worker/src/jpxdecode.mjs:168` "an image and tile geometry the standard does not allow"
- plain `pdf-worker/src/jpxdecode.mjs:179` "a code-block larger than 4096 samples"
- plain `pdf-worker/src/jpxdecode.mjs:242` "the codestream ends before any tile"
- plain `pdf-worker/src/jpxdecode.mjs:245` "a marker segment length under 2"
- plain `pdf-worker/src/jpxdecode.mjs:804` "a code-block of 31 or more bit-planes"
- plain `pdf-worker/src/jpxdecode.mjs:945` "an image past the memory bound"
- plain `pdf-worker/src/jpxdecode.mjs:964` "a colour transform over mixed wavelets"
- plain `pdf-worker/src/pngdecode.mjs:61` "a chunk the decoder must understand to draw the image (its type's first letter upper-ca..."
- plain `pdf-worker/src/pngdecode.mjs:62` "an image past the memory bound"
- plain `pdf-worker/src/pngdecode.mjs:62` "the decode would hold more at once than the memory bound: the 8-bit output, and beside ..."
- plain `pdf-worker/src/pngdecode.mjs:196` "an image past the memory bound"
- plain `pdf-worker/src/pngdecode.mjs:305` "the image data's zlib trailer is damaged or missing"
- plain `pdf-worker/src/pngdecode.mjs:310` "the image data inflates past the frame"

## Test copies of code sentences (K3962)

1 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `pdf-worker/test/codecs/jbig2.test.mjs:67` "\"generic refinement region\""
