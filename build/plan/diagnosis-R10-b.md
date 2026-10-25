# Diagnosis of re-walk 9's causes, groups G2 (R6-R10) and G3 (R11-R18): DIAG-R10-B #1 for BOB #287 (fix round 10 of T51; K5047)

**Status** · IN PROGRESS (each cause is committed and pushed as it is finished; the line becomes `COMPLETE` when R6-R18 are all in). Written by DIAG-R10-B #1, a study session: no product code and no test is changed. Method: the walk records read whole (`walk-T51-rewalk9/A.md`, `C.md`, the rows of `D.md` and `E.md` that name my causes), the code at each cause read in full around it, and each case rebuilt in Node from the walker's recipe (`bio-plane/test/imggen.mjs`, `pdfgen.mjs`, `docgen.mjs`; the member's real engine, tesseract-wasm 0.11.0, through `ocr-worker/test/memberworker.mjs` as `ocr-worker/test/g128i-l26-photo.test.mjs` does). Scratch scripts are in the session's scratchpad, not in the repository. "Red" below means I ran it and saw the walker's wrong answer.

**Recipe note (applies to R6, R7, R10).** The walk's A7 says "each 3 lines" and A8 gives no line count; `imggen`'s default is 6 lines. The walker's file sizes (A7 PNG 6,237 B; A8 rotated PDF scan 15 KB for 4 pages) match a **3-line page** (I build 6,192 B for `{kind:"png",seed:"rw9-A-7",size:{pages:1,lines:3}}`). Every R6/R7 case below was run at 3 lines (the walker's) and at 6 and 18 lines as controls: the failure is a property of a **sparse page** (a few short lines on a letter page), which is what a one-page photograph of a note or a form is.

---

## R6 · legible pictures end `NOTHING_TRANSCRIBED` for good; "Read it now" starts nothing (A7, A10, A14)

### 1. Root cause with evidence

**The wrong behaviour is decided in `pdf-worker/src/picturepixels.mjs`, `levelLight` (the ink level, `:349`-`:352`) and then `preparePicture` (`:437`).**

- `levelLight` stretches the picture so that "the paper reads 255 and the ink's own 0.5th-percentile level 0" (module header, step 1): `const target = Math.max(1, Math.round(w * h * 0.005))` (`:349`), `lo` = the grey value below which 0.5 % of **all pixels** lie, `hi = 235`, `span = Math.max(32, hi - lo)` (`:351`-`:352`), then every pixel is `(ratio - lo) * 255 / span`.
- This assumes at least 0.5 % of the picture is ink. A page of three short lines is **not**: the walker's A7 PNG is 1275 x 1650 = 2,103,750 px with **5,283 ink px = 0.251 %** (target 10,519 px). The 0.5th percentile then falls among the paper's own grey levels, so `lo` sits next to the paper level (ratio 255), `span` is clamped to its floor of 32, and the paper maps to a small value instead of 255: the whole picture is dark. I measured it: after `levelLight`, **2,103,750 of 2,103,750 px are under 96** (the ink threshold of `textLines`).
- `preparePicture` (`:430`-`:437`) then reads that picture: `textLines` finds one run of "ink rows" the height of the whole picture (`{lines: 1, median: 1650}`), and `if (lines < 2 || median > cur.height / 4)` (`:437`) answers `prepared: {text_found: false}`, the picture "handed on as it is".
- `ocr-worker/src/member.mjs:112`-`:115` takes `text_found === false` as "a blank wall, noise" and answers `NOTHING_TRANSCRIBED` **without calling the engine** ("no line of text was found in this picture, so it was not given to the engine to read"). The reading is `final` (reading-pipeline R54/R82: a refused picture is not retried), so the plane stores nothing and states it.

Evidence (red, in-process, the walker's recipes through the real `renderPictureToPixels(..., {maxEdge: 4096, grey: true, prepare: true})` and then through the real member with the real engine):

| recipe | ink share | `prepared` | member answer |
|---|---|---|---|
| A7 `{kind:"png",seed:"rw9-A-7",size:{pages:1,lines:3}}` (6,192 B) | 0.251 % | `text_found: false` | `NOTHING_TRANSCRIBED`, `boxes: 0`, engine not run |
| A7 polyglot `seed:"rw9-A-7z", polyglot:"zip"` (the walker's one that read) | 0.285 % | `text_found: true, line_px: 23` | read (the 3x7 more ink px, spread by the blur, put the 0.5th percentile on ink: a **knife edge**, not a different recipe) |
| A14 `{...,lines:3, frame:[4096,3000]}` | below 0.5 % | `text_found: false` | `NOTHING_TRANSCRIBED` |
| A14 `frame:[4097,3000]` (reduced to 2049 x 1500 by `maxEdge`) | below 0.5 % | `text_found: false` | `NOTHING_TRANSCRIBED` |
| 6 lines and 18 lines (control) | above 0.5 % | `text_found: true` | read |

So A7's "the polyglot PNG of the same recipe read fine" and A14's "both bounds end the same way (so the bound cannot be told)" are one cause: **the 0.5 % rule of the contrast stretch, applied to a sparse page.** It is the same on the 4096 and 4097 frame: neither is a size bound, as the walker suspected (A14).

**"Read it now" starts nothing** is not a second defect: it is `extraction/index.mjs:939`-`:940` (`if (held && !ocr && ... ) return left("READING_HELD")`) answering for a held reading that is `final`; the reading is right to be left alone once it is final (R82/G172). The defect is that the reading was made final on a false premise (`text_found:false`). Fix the premise, and the existing path reads the picture. (Also noted in A10: the Document page does not draw the "Read it now" button for these copies; the act behind it was pressed by API. Nothing to repair there.)

**The sentence the member then sees** ("This document is 6 KB, which is more than your team's Civicsmith can read") is R1 (G1), DIAG-R10-A's: the reading has no `reason`, and the page falls back to the size sentence.

### 2. Why the tests missed it

- `pdf-worker/test/pagepixels.test.mjs` R44 (`:800`-`:843`): the "no text" arm uses `page-blank` (truly blank) and the control `page-clean` ("a page with text says text_found", `:827`); every photograph fixture in `fixtures/picture-variants.json` is a **dense page** (231 words, 18 lines) whose ink is far above 0.5 %. The `png-rgb` test (`:840`) *asserts* `text_found: false` for a small PNG variant ("no text lines in this one"), i.e. it pins the false answer for a picture that **has** some lines. Nothing builds a few-line page.
- `ocr-worker/test/ocr-worker.test.mjs:720`-`:742` (R24): `found = (text_found) => stubRender(pngPage(GREY4x3, ..., prepared: {text_found, ...}))`. The `prepared` answer is **hand-built** (`text_found: true/false` typed in), so the test proves the member obeys the flag, never that the renderer sets it right on a real sparse page.
- `ocr-worker/test/g128i-l26-photo.test.mjs` runs the real renderer + real engine, but only on the walk's dense photographs and on 18-line `imggen` pages.
- The requirement's own floor ("at least 90 percent of the words of each fixture photograph") is measured on those same dense photographs.

### 3. Failing-first test

- **Module and file:** `pdf-pixels`, `pdf-worker/test/pagepixels.test.mjs` (a new `R44 sparse page` block beside the "no text" block), and `ocr-worker`, `ocr-worker/test/g128i-l26-photo.test.mjs`'s harness (a new test file `ocr-worker/test/r10-sparse-pages.test.mjs`, same real-engine `transcribe`, which also serves R7).
- **Builds:** `generate({kind:"png", seed:"rw9-A-7", size:{pages:1, lines:3}})`, and the same at `frame:[4096,3000]` and `frame:[4097,3000]` (A14), through `renderPictureToPixels(bytes, 0, {maxEdge: 4096, grey: true, prepare: true})`.
- **Asserts:** (a) `prepared.text_found === true` and `prepared.line_px` between 15 and 30 for all three; (b) through the member's real handler (`/transcribe`, `pages: [0]`), `ok: true`, the page's text contains the words of the truth's lines (`truth.pages[0].lines`: "permit", "levy", "budget", matched case-insensitively and loosely, since the 5 x 7 font reads with OCR misreads on the digits), not the marks string (A N1: the generator's digits are misread, a fixture matter, not this cause); (c) controls: `page-blank` still `text_found: false`, a pure-noise picture still false, a 6-line page still true.
- **Seen red:** yes, in-process (table above): `text_found: false`, member answer `NOTHING_TRANSCRIBED` with `boxes: 0`.

### 4. Platform check

None needed for the cause: it is a pure function of the bytes (R40) and runs the same in workerd and in Node. The check after the fix, at the real shape: upload the walker's three recipes to the live copy through the Add screen and read the `reading`: A7 PNG `whole` with words found, A14 4096 and 4097 the same (A14's real question, the 4096 bound, is then answerable: 4097 must read as a reduced frame, not be refused).

### 5. Owner

**`pdf-pixels`** (`picturepixels.mjs` is in its paths in `build/modules.json`). Requirement for BOB: `pdf-pixels` R44 (a) states "the darkest half percent of the pixels reads at most 30" and (d) states "(fewer than two lines, or lines over a quarter of the picture's height) ... `text_found` false". (a) is **wrong for a sparse page**: where ink is under half a percent of the picture it cannot hold without turning paper dark; the ink level must come from the picture's ink (for instance the lower tail of the brighter-half-corrected ratio, relative to the paper level), with a floor so a page of pure paper is still not stretched. (d) then does its job unchanged. Silent today: what a page with under 0.5 % ink should read as.

Wording: the sentence the member reads is the generic final-reading sentence (G1/R1); no word-table key is involved in this cause.
