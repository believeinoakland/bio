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

---

## R7 · turned and rotated pages are not read upright, and not stated as sideways (A8)

### 1. Root cause with evidence

**Decided in `ocr-worker/src/member.mjs:249`-`:275` (`transcribeOnePage`, R26): the member believes one orientation claim from the engine, tries that one turn, and keeps the as-it-lies reading when the turned one is no better; and on a sparse page the engine's claim is noise.**

- `ocr-worker/src/frame.mjs:67`-`:69` asks `engine.getOrientation()` and passes on only `rotation`. `member.mjs:249` takes it as `claim`; `:254`-`:258` turn by `turnToUpright(claim.rotation)` = `(360 - rotation) % 360` only when the page "as it lies" is unclear; `:264` keeps the turned reading only if `scoreOf(again) >= scoreOf(first)`; `:271` refuses what is still under `LEGIBLE_REFUSE_BELOW` (`PICTURE_NOT_LEGIBLE` / `PAGE_NOT_LEGIBLE`).
- I read the engine's claim on the **four turnings of one page** (the walker's A8 recipe family, real engine, preparation on; `R0..R270` = the renderer's `turn`; "rated" = words the engine rated 0.6 or over):

  | page turned clockwise | 6 lines: claim at R0 | 6 lines: best renderer turn | 3 lines: claim at R0 | 3 lines: claim at R90 / R180 / R270 | 3 lines: best renderer turn |
  |---|---|---|---|---|---|
  | 0 | 0 | R0 (9/17 rated) | **270** | 270 / 270 / 270 | R0 (5/6) |
  | 90 | 90 | R270 (9/17) | **270** | 270 / 270 / 270 | R270 (5/6) |
  | 180 | 180 | R180 (9/17) | **270** | 270 / 270 / 270 | R180 (5/6) |
  | 270 | 270 | R90 (9/17) | **270** | 270 / 270 / 270 | R90 (5/6) |

  On 6 lines the engine's claim is right (its `rotation` is the degrees the frame lies turned clockwise, as `turnToUpright` assumes) and the member reads the page upright. On **3 lines the engine answers 270 for every frame, upright included**: it has too little text to tell. The member turns a 3-line page "by 90" (`360 - 270`), which for a page turned 90 clockwise makes it 180 (I measured the ink box: text at the bottom right, upside down), the engine reads garbage ("FIPNE ST-T4-e8-Y-6r"), rated 0 words, and the page is refused. The upright reading exists at the other turn (R270 for a page turned 90: 5 of 6 rated), but **no code ever tries a turn the claim did not name**.
- Red, through the real member and engine, the walker's cases at 3 lines: `degrade:{turn:90}` → `PICTURE_NOT_LEGIBLE`; `degrade:{turn:180}` → `PICTURE_NOT_LEGIBLE`; the PDF scan `{pages:2, lines:3, kinds:["scan"], rotate:{every:1, angle:90}}` → page 0 `PAGE_NOT_LEGIBLE` (the A8 "pages 1-4 `PAGE_NOT_LEGIBLE`", all four refused). Controls (all read, turned upright, partly legible notes): the same at 6 and 18 lines, a PDF scan rotated 90 at 6 and 20 lines (`turned_deg` 270 on the second read). So the A8 failures are the **sparse** pages; dense pages are fine.
- The second half of the walker's row, "not stated as sideways": the member **does** state it: `PAGE_NOT_LEGIBLE` carries "this page is sideways or too faint to read" (`ocr-worker/src/contract.mjs:107`, key `ocr-worker.contract.this_page_is_sideways_or_too_faint_to_read`), and `PICTURE_NOT_LEGIBLE` "the picture is too unclear to read" (`:105`). The Document page does not draw either: it draws the size sentence for any final reading with no size reason (A N3). That is **R1 (G1), DIAG-R10-A's**; merged here by reference, not re-diagnosed. (The word chosen is `PICTURE_NOT_LEGIBLE`'s "too unclear", which does not say "turned": for a refused turned *picture* the member's word is the module's key; whether a picture also deserves the "sideways" sentence is the design's if BOB wants it said.)

### 2. Why the tests missed it

`ocr-worker/test/ocr-worker.test.mjs:895`-`:960` (R26): `turnEngine({claim, side, up})` is a **stub engine whose orientation claim is typed in and always right** (`orientation: w === 4 ? claim : {rotation: 0}`), and the renderer is a stub `turner`. The tests prove the member turns where the claim says; none lets the engine be wrong. `g128i-l26-photo.test.mjs` uses the real engine on dense photographs only. The requirement itself says the claim "is unreliable below a full-resolution page" (R26) and then relies on it for the only retry.

### 3. Failing-first test

- **Module and file:** `ocr-worker`, new `ocr-worker/test/r10-sparse-pages.test.mjs` (real engine, real `renderPictureToPixels`/`renderPageToPixels`, as `g128i-l26-photo.test.mjs`).
- **Builds:** `imggen` `{kind:"png", seed, size:{pages:1, lines:3}, degrade:{turn: 90|180|270}}`; `pdfgen` `{kind:"pdf", seed, size:{pages:4, lines:3}, kinds:["scan"], rotate:{every:1, angle:90}}`, each through `/transcribe` with `pages:[0]` (and `[0..3]` one at a time for the PDF).
- **Asserts:** `ok: true`, `image.turned_deg` equal to the turn that makes the page upright (270, 180, 90 for the PNGs; the PDF's page turned 270 or 90 as the reading shows), `legibility.share >= 0.5`, and the page's words (its vocabulary word per line) present; control: an upright 3-line page is not turned (`turned_deg` 0).
- **Seen red:** yes (above).

### 4. Platform check

None for the cause (engine, deterministic). After the fix, the same two files on the live copy: the reading must be `whole` with `turned_deg` stated, and the time of the extra passes read on the `ocr` row's `own_ms` (each extra pass is a full engine run; the design below bounds it to pages the first pass refused).

### 5. Owner

**`ocr-worker`.** Requirement for BOB: R26 says "a turn it asks for is tried ... and is kept only when the turned page rates at least as many words ... **no page is read four ways**". That sentence forbids the repair. A repair that stays inside R26's reasoning: only a page that is **refused** (under R25's 0.2 after the claimed turn) and whose claim was one the frame itself did not confirm (the claimed frame's own claim is again a turn) may try the quarter turns not yet tried (up to two more, 90/270 then 180), keeping the best-rated one; a legible page is still never read four ways. R26 needs that exception written.
