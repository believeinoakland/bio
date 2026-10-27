# pdf-pixels: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

27 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('pdf-pixels.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `pdf-worker/src/imagecrop.mjs:36` "the extent names a page and no rectangle, so it names no one image to crop"
- plain `pdf-worker/src/imagecrop.mjs:38` "the document is encrypted; streams are ciphertext to this reader"
- plain `pdf-worker/src/imagecrop.mjs:39` "the page index is outside the document"
- plain `pdf-worker/src/imagecrop.mjs:40` "the page's content could not be interpreted, so what it paints is undetermined"
- plain `pdf-worker/src/imagecrop.mjs:41` "the page paints no image at exactly that rectangle"
- plain `pdf-worker/src/imagecrop.mjs:42` "the page paints more than one image at exactly that rectangle"
- plain `pdf-worker/src/imagecrop.mjs:43` "the image at that rectangle is inline in the content stream; extracting inline images i..."
- plain `pdf-worker/src/imagecrop.mjs:44` "the image was found and its samples could not be decoded here"
- plain `pdf-worker/src/pagepixels.mjs:96` "the document is encrypted; streams are ciphertext to this reader"
- plain `pdf-worker/src/pagepixels.mjs:97` "the page index is outside the document"
- plain `pdf-worker/src/pagepixels.mjs:98` "the page object could not be read"
- plain `pdf-worker/src/pagepixels.mjs:99` "the page carries a text layer; it does not need pixels"
- plain `pdf-worker/src/pagepixels.mjs:100` "the page carries marks that are not an embedded image"
- plain `pdf-worker/src/pagepixels.mjs:101` "the page paints no image"
- plain `pdf-worker/src/pagepixels.mjs:102` "the page composes several images; compositing is not built"
- plain `pdf-worker/src/pagepixels.mjs:103` "the image XObject's stream could not be read"
- plain `pdf-worker/src/pagepixels.mjs:104` "the image's filter chain has no decoder here"
- plain `pdf-worker/src/pagepixels.mjs:105` "the image's sample layout has no decoder here"
- plain `pdf-worker/src/pagepixels.mjs:106` "the decoded image is short of its declared height"
- plain `pdf-worker/src/pagepixels.mjs:107` "the decoder could not read the image data"
- plain `pdf-worker/src/pagepixels.mjs:109` "decoding the image would need more memory than a decode may use here"
- plain `pdf-worker/src/pagepixels.mjs:119` "an image past the memory bound"
- plain `pdf-worker/src/pagepixels.mjs:381` "an inline image; reading inline images is not built"
- plain `pdf-worker/src/pagepixels.mjs:532` "the /JBIG2Globals stream could not be read"
- plain `pdf-worker/src/pagepixels.mjs:534` "a JBIG2 image is 1 bit per sample"
- plain `pdf-worker/src/pagepixels.mjs:575` "a colour space other than DeviceGray, DeviceRGB or a 1- or 3-component ICCBased"
- plain `pdf-worker/src/picturepixels.mjs:60` "an image past the memory bound"
