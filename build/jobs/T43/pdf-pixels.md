# pdf-pixels (T43)

**Status** · session_019UE5f9dE91LZQFBmRUVev4 · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three readings of R42/R43 I am building on; I carry on with them unless you answer otherwise.
1. R42's bound, "width × height × components from the header": for a PNG, components are the channels its IHDR colour type declares (grey 1, grey+alpha 2, RGB 3, palette 3 as expanded, RGBA 4); for a JPEG, the SOF's component count. Conservative for alpha PNGs; it never under-counts what R10 allocates.
2. A `maxEdge` that is not a positive integer is a caller's error and throws a TypeError, not an `ok:false` answer (so R39's set is not widened by a programming mistake). `grey` defaults to false.
3. R43 "unreadable tag counts as 1": read as Pillow's `exif_transpose` reads it — the first APP1 "Exif" segment, IFD0, tag 0x0112 of an integer type (BYTE, SHORT, LONG, SSHORT, SLONG), its first value; a value outside 1–8, a non-integer type or a cut block is 1. Pillow also falls back to an XMP `tiff:Orientation` when EXIF has none; R43 says EXIF only, so that is not read (a known, stated divergence from Pillow on that one input).
Status: the JPEG path is built and pixel-exact against Pillow 12.3.0 on 58 cases (every orientation, every reduction path, the 4032×3024 Orientation-6 photo: 1008×1344 grey, 156 KB). PICTURE_FRAME_MAX measured and set at 4096×3072×3 (record will say why). The PNG path waits on image-codecs R10's `pngdecode.mjs` being published on job/T43/image-codecs (not there yet).
