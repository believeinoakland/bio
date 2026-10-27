# pdf-pixels (T52)

**Status** · session_018Bhcee86hcxpTAeDLQWjph · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# pdf-pixels · T52 report

**T52-4 applied (C-K13).** Settled the cause first: in `preparePicture` it is not `textLines` but `levelLight`. A faint receipt's ink sits at 80 to 90 percent of its paper (ink 190 to 205 on paper 240 to 245), above `INK_RATIO` 200, so fewer than `INK_MIN` pixels count as ink, `lo` stays 0, the contrast is never stretched, the levelled darkest grey is 217 to 239, no pixel is under 96, and `textLines` finds 0 lines (`lines` 0, `median` 0) so `text_found:false`.

Fix (`pdf-worker/src/picturepixels.mjs`): when the first levelling finds no text lines, `preparePicture` levels once more with ink taken as pixels under 228/255 of the paper (`INK_RATIO_FAINT`), needing at least 0.1 percent of all pixels (`INK_FAINT_SHARE`; a blank photograph has 0.011 percent, a three-line receipt 0.5 to 1.6), and keeps that only if it finds text lines. Pictures that were found as text before are unchanged (the retry never runs for them). The requirements file is BOB's, so I did not edit it; the wording I propose to append to R44, after its last sentence: `"`(T52-4; C-K13; amends R44 (a), (d)) A faint print is levelled as any print is: a page whose ink is 80 to 90 percent of its paper (a thermal receipt, ink 200 on paper 240) is found to hold text, with its ink at most 30 and the paper at least 243, and `ocr-worker` reads its words, as it reads the same pixels inside a PDF. When the first levelling finds no text lines, the picture is levelled once more with ink taken as the pixels under 228/255 of the paper (`INK_RATIO_FAINT`), at least a thousandth of all the pixels (`INK_FAINT_SHARE`), and that is kept only if it finds text lines; a blank photograph and noise stay `text_found` false. Test: ink 200 and ink 205 on paper 240 are `text_found` true with the lines 15 to 30 px and the paper light, the engine reads their words; control: a blank page of that paper is `text_found` false.`"`

Tests (`pdf-worker/test/pagepixels.test.mjs`): ink 200 and 205 on paper 240 are `text_found` true, lines 15 to 30 px, paper light, and the engine reads their words; control: a blank page of that paper is false. Red before the fix (ink 200 on 240), green after; all of pagepixels, imagecrop, jbig2, jpx pass.

**Not done / other modules.** The walker's real `c087-faint-receipt.png` is not in the repository; the test builds a faint print from the sparse-page recipe, so the walker's exact file is not run here. `ocr-worker` needs no change for this entry (its `member.mjs:108-114` stays; it now receives `text_found:true`). Generated artifacts stale from this change: `ocr-worker/dist` and `bio-plane/dist` / `release/*.bundled.mjs` bundle `picturepixels.mjs`; `proc merge` regenerates them.

**Met** · R44

Tests: 4/4. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018Bhcee86hcxpTAeDLQWjph): test runs 1, module lines 1761
