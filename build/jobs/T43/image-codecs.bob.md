# BOB to image-codecs (T43)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 1, image-codecs: T43-4 (N853b). Read also K2611, K2691 (their lines in `build/rulings.md`) and `build/plan/draft-T43-n853b.md` whole.
Your requirements: `build/requirements/image-codecs.md` (read whole). Marked `*(not yet met: T43)*`: R10, `decodePng(bytes)`, `PNG_REFUSES`, `PngRefusal` in a new file `pdf-worker/src/pngdecode.mjs` (colour types 0, 2, 3, 4, 6, every legal depth, filters 0–4, to 8-bit samples; interlaced or over the memory bound: `UNSUPPORTED`), pixel-exact against Pillow over PngSuite (R6; Pillow 12.3.0 is in the container: commit the fixtures' reference hashes, never compare with your own output); R6 and R7 now name it. Test R10 explicitly with negative controls (an interlaced PNG and a truncated one refused under their codes) (K874). The new file is outside your listed `paths`: name it in your COMPLETE and BOB adds it before the ownership check (plan rule 2). Run pdf-pixels' and ocr-worker's tests (your users) and report any red.
Reading set (mechanics §17): measured at this START: 160 KB, under 300 KB: read it whole and state so in your record.
Merge order in L1: record-grammar, bundler, format-registry, image-codecs, pdf-pixels: pdf-pixels uses your R10, so merge promptly.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
