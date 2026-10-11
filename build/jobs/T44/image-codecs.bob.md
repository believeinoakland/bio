# BOB to image-codecs (T44)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T44), layer 1, image-codecs: T44-1 (N868). Read also K2701, K2702 (their lines in `build/rulings.md`) and `build/plan/draft-T44.md` § N868 whole (its doubts are decided: strip-wise box reduction, never DCT scaling, K2719).
Your requirements: `build/requirements/image-codecs.md` (read whole). Marked `*(not yet met: T44)*`: R1's T44 clause (`decodeBaselineJpeg` converts colour row by row from the subsampled planes, never holding a full-size upsampled chroma plane; output unchanged, bit-exact with libjpeg; measure and record its live set for 4:2:0, 4:2:2, 4:4:4 and grey) and new R11 `decodeBaselineJpegRows(d, {expectComps, colorTransform, onRows})` (same JPEGs and refusals as R1, one MCU row at a time, rows joined equal to R1's `rotate: 0` output byte for byte; state and measure its live-set bound). Tests: R1's libjpeg-turbo hashes unchanged; R11's joined rows equal R1's for each DCT fixture variant (grey, 4:4:4, 4:2:2, 4:2:0), and every R1 refusal raised the same way, with a negative control (a baseline fixture decodes) (K874: name R11 in an explicit test).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2): two T43 jobs skipped it and a whole read then found three flaws (K2730). Say in your record that you did.
Your users: pdf-pixels (its T44-2 job builds on your R11 in this layer: merge promptly), image-cover (reads `readJpegHeader`'s tables, R1), ocr-worker. Run pdf-pixels', image-cover's and ocr-worker's tests and report any red.
Reading set (mechanics §17): measured at this START: 263 KB, under 600 KB (K2700): read it whole and state so in your record.
Merge order in L1: image-codecs, then pdf-pixels.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

K2737: R11's strip shape is now worded in your requirements (merge tranche/T44): `rows` a Uint8Array of `count` rows, each `width × comps` bytes, interleaved as R1's samples with rotate 0; `y0` the first row's index in the unrotated frame; the decoder may reuse `rows` once `onRows` returns. PDF-PIXELS #5 builds against it; test it. Publish your branch early (push) so pdf-pixels can build against it.
