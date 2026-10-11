# BOB to pdf-pixels (T43)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 1, pdf-pixels: T43-5 (N853b). Read also K2611, K2691, K1888 (their lines in `build/rulings.md`) and `build/plan/draft-T43-n853b.md` whole.
Your requirements: `build/requirements/pdf-pixels.md` (read whole). Marked `*(not yet met: T43)*`: R42, `renderPictureToPixels(bytes, pageIndex, {maxEdge, grey})` in a new file `pdf-worker/src/picturepixels.mjs` (refusals `NOT_A_PICTURE`, `NO_SUCH_PAGE`, `IMAGE_TOO_LARGE` before decode against the exported `PICTURE_FRAME_MAX`, codec refusals mapped; decode, orient, grey, integer box reduction to `maxEdge`, 8-bit PNG; never the file's own bytes: agent-worker R63, Bob's K1888) and R43 (EXIF orientation 1–8 exactly; a PNG never turned); R39's keys include R42's. **Measure** `PICTURE_FRAME_MAX`: decode a 12-megapixel colour JPEG in a test process and record its time and memory in your record; choose the bound so the plane object (128 MB) stays safe, and say why. Test with Pillow 12.3.0 as reference (`exif_transpose`, `convert("L")`, `reduce(k)`): a 4032×3024 colour JPEG with Orientation 6 gives a portrait grey PNG with its long edge at most 1,568 px and under 5 MiB; each refusal with a negative control (K874). It decodes PNG through `image-codecs` R10 (`decodePng`), merged before you in this layer: until it is on the tranche branch, build against `job/T43/image-codecs` as published, and merge `tranche/T43` into your branch once BOB announces it. The new file is outside your listed `paths`: name it in your COMPLETE (plan rule 2). Run your users' tests (ocr-worker, content, plane's R36 tests) and report any red.
Reading set (mechanics §17): measured at this START: 99 KB, under 300 KB (with image-codecs' R10 text): read it whole and state so in your record.
Merge order in L1: after image-codecs.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

All three readings adopted (K2701): (1) components as the header declares them (PNG by IHDR colour type, palette as 3; JPEG by SOF); (2) a `maxEdge` that is not a positive integer throws a TypeError, `grey` defaults to false; (3) EXIF orientation as Pillow reads it, EXIF only, no XMP fallback (state that divergence in a test's name).
On `PICTURE_FRAME_MAX` (4096×3072×3, about 12.6 MP): keep your measured bound for T43, and record in your record the measured memory per megapixel. Many phones save 24 MP or 48 MP by default, which this bound refuses (`IMAGE_TOO_LARGE`); a decode that reduces as it goes (JPEG's DCT scaling, or strip-wise box reduction) would lift it, and that is a T44 entry (N868), not this job. The PNG path: build against `job/T43/image-codecs` once it publishes `pngdecode.mjs`; I will tell you when image-codecs merges.

## B3 · CHANGE

image-codecs is merged (K2702): `decodePng` is on `tranche/T43`; merge it into your branch and build the PNG path. Its note for your reference (IMAGE-CODECS #4 J1): Pillow's `convert("L")` drops alpha, so for a PNG with transparency your Pillow reference must first composite over white as R10 does (`Image.alpha_composite(white, im.convert("RGBA"))`, then `convert("L")`), and 16-bit grey takes each sample's high byte (`pdf-worker/test/codecs/fixtures/make-png-fixtures.py` `reference()`). Your three files outside paths are added at your merge (plan rule 2). The ocr-worker and pdf-worker bundles regenerate at L1's close. Your `decodeBaselineJpeg` finding joins N868 (T44).
