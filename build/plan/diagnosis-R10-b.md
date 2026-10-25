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

---

## R8 · a truncated PDF stores nothing of its readable pages (A5b)

### 1. Root cause with evidence

**Decided in `pdf-worker/src/index.mjs:131` and `:215`-`:239` (tier 2): pdf.js (`unpdf`) throws `InvalidPDFException: Invalid PDF structure` on a file cut off before its trailer, `handleStructure` catches it as `tier2_extraction_error` and answers tier 1 with no text; and tier 1 cannot decode the walker's pages itself, so nothing is stored.**

- The walker's A5b file is `{kind:"pdf", seed:"rw9-A-5b", size:{pages:30, lines:6}, truncate:0.7}`: I rebuild it at exactly **16,746 B** (the walker's size), and tier 1 states **264 undetermined** (the walker's "264 undecodable region(s): no_tounicode"), 22 pages found, notes `xref_reconstructed`, `structure_reconstructed`, `pages_missing:8/30`.
- The pages use pdfgen's default font: Type1 Helvetica with `/Encoding /WinAnsiEncoding` and **no `/ToUnicode`** (object 3 at byte 334, present in the cut file). Tier 1 (`bio-plane/src/pdfstructure.mjs`, `loadFont` `:2277`, `show` `:2770`-`:2780`) decodes only through `/ToUnicode` and marks every such run `no_tounicode` ("no character is guessed", pdf-reader). That is true of the **intact** file too: its tier-1 text has `chars: 0, undetermined: 360`. The design is that tier 2 (pdf.js) takes every no-ToUnicode file (`needsTier2`, `reading-pipeline/index.mjs:130`; `pdf-worker` header "Tier 2 handles ... no-/ToUnicode fonts").
- On the **truncated** file tier 2 fails to open it. In-process with the unpdf the worker bundles: intact file, 30 pages, 117-136 characters a page; truncated file: **`InvalidPDFException: Invalid PDF structure`** (warning "Indexing all PDF objects" then throw). So `tier2Text` (`:131`) throws before any page, the `catch` at `:217` answers `tier2_extraction_error`, `structure.tier = 1`, and the plane keeps tier 1's undecodable text: `readingFromWire` states "the text of this document is undetermined (264 undecodable region(s): no_tounicode); a reading over text nobody decoded would be an invented one", `failure: final`, 0 units.
- The readable pages are readable by pdf.js: with a trailer line appended and the unfinished last object cut away (`...endobj\ntrailer\n<< /Root 1 0 R /Size 49 >>\n%%EOF`) the same unpdf opens the file (`numPages` 23, "checkLastPage - invalid /Pages tree /Count: 30") and returns **pages 1-22 with 117-136 characters each** and one page error ("Page dictionary kid reference") at 23. The truth (`pdfgen`) says pages 22-30 are `TRUNCATED` and 1-21 readable. So pages 1-21/22 can be stored; the defect is that tier 2 gives up on the whole file where pdf.js would serve the pages before the cut once it is given a trailer.
- Red, through the real `read` with the real `pdf-worker` bound (`bio-plane/test/m/reading-pipeline/fixture.mjs`, as `convert-tiers.test.mjs` does): `found: false`, `failure: "final"`, **0 text units**, basis the walker's sentence word for word. The same harness on the intact file (control) reads 30 pages.
- The sentence the member then sees ("This document is 16 KB, which is more than your team's Civicsmith can read") is G1/R1 (DIAG-R10-A's). The "N of 30 pages could not be read" the brief expected is drawn from **units written and `unread_pages`**: once the 22 pages are stored the reading is `partial` with pages 23-30 unread and the Document page draws its existing "Pages ... couldn't be read" line (A10 shows the page draws it for a partial scan). The structure notes' own `pages_missing:8/30` does not reach the reading (R9 below).

### 2. Why the tests missed it

- `bio-plane/test/m/test-support/generators.test.mjs:107`-`:115` (R20): "a truncated PDF is cut where the recipe says ... **pdf.js reads the pages before the cut**" then `const o = await pdfjsText(b); if (o.skip || o.error) return;`: when pdf.js **throws** (as it does on this recipe's own `T1` file, which I ran: `InvalidPDFException`) the test **returns green**. The claim in its title is never asserted.
- `pdf-worker/test/structure.test.mjs:263`-`:285`: R10 tests `tier2_extraction_error` with a hand-built `BROKEN` catalog-only file (`:43`), proving the error answer, not that a truncated real document gets read. No test of `pdf-worker` or `reading-pipeline` builds a `truncate` file (`grep truncate:` finds only `pdfgen.mjs` and the generator's own test).
- `pdf-reader` tests the tier-1 half only (`pages_missing:8/30` is asserted there, satisfying its R8 (d)), where tier 1 needs no fonts.

### 3. Failing-first test

- **Module and file:** `pdf-worker`, `pdf-worker/test/structure.test.mjs` (a new `R8 truncated` block, Miniflare like its `mfWalker`), and `reading-pipeline`, `bio-plane/test/m/reading-pipeline/convert-tiers.test.mjs`-style test with `realMember(w)`.
- **Builds:** `generate({kind:"pdf", seed:"rw9-A-5b", size:{pages:30, lines:6}, truncate:0.7})` (16,746 B), put under `bio/captures/<sha>`.
- **Asserts:** (a) `POST /structure`: 200, `tier: 2`, `text.pages` holds pages 0-21 with the generator's line text (`truth.page(n).text` normalised) and none of 22-29; (b) through `read(...)`: `failure` absent, units = 22 (or 21 where the page cut mid-object, the truth's `unread` decides), each unit's text equal to the truth, `completeness` `partial`; (c) fix `generators.test.mjs:112` to `assert.ok(!o.error)` for the truncated recipe (the test the title promises).
- **Seen red:** yes, in-process (tier 2 throw; `read` → final, 0 units). Not yet seen under workerd: see 4.

### 4. Platform check

Whether pdf.js in workerd throws at the same point as in Node is the question the Miniflare run answers: the test (a) runs under Miniflare (`pdf-worker/test/structure.test.mjs` builds one, `newMf()`), and it must show `tier: 2` with 22 pages there too. On the live copy, after the fix: upload the same file; `reading` must be `partial`, 22 units, the Document page "Read N of ..." with the cut pages named.

### 5. Owner

**`pdf-worker`** (tier 2: retry a failed open on a repaired view of the bytes, e.g. the bytes up to the last complete `endobj` plus a synthesized `trailer << /Root n 0 R >>` whose root is the catalog tier 1 already found, stating the repair in `notes`; or open page by page). Requirement for BOB: `pdf-worker` **R10** says a throw makes the answer "`tier2_extraction_error` ... `.tier` is 1" for every throw. That is right for corruption of the *document* but wrong for a *truncated* one, which has a readable front; R10 is silent on it. Alternative the requirement could choose instead (BOB's call, not mine): tier 1 decodes the PDF standard simple encodings (WinAnsi, MacRoman) without a `/ToUnicode`; `pdf-reader` currently forbids it ("no character is guessed"), and it would change every no-ToUnicode file, not only truncated ones.

---

## R9 · `xref_reconstructed` is never shown (A9)

### 1. Root cause with evidence

**The reading never takes the PDF reader's recovery notes: `reading-pipeline/index.mjs:3022`-`:3105` keeps only `st.text`, `st.metadata`, `st.pages`, `st.pageBoxes`, `st.images` from tier 1's answer (`:3050`-`:3057`) and `t2.text` from tier 2's (`:161`, `memberNotes` collected and unused); `st.notes` (`xref_reconstructed`, `structure_reconstructed`, `pages_missing`, `encrypted`, ...) is read by no one.**

- `pdfstructure.mjs:848` adds `xref_reconstructed` when the cross-reference chain does not validate; `:1256`-`:1259` add `structure_reconstructed` and `pages_missing:<n>/<declared>`. `grep -rn "xref_reconstructed\|pages_missing\|structure_reconstructed" bio-plane/src pdf-worker/src` (outside `pdfstructure.mjs` and the word rows) finds **no consumer**.
- `formats.mjs:344` (`structure: (bytes) => extractPdfStructure(bytes)`) hands the whole answer on; the pipeline reads the text of it only.
- Red, through the real `read` with the real pdf-worker: A9's `structure:"damaged-xref"` and `"no-xref"` files (3 pages) read whole (3 units, tier 2 re-read the 3 pages), and a search of the whole stored `reading` object for `xref|reconstruct|pages_missing` finds **nothing**; the truncated A5b file's reading likewise carries no `pages_missing:8/30`. The walker's "searched the whole `reading` answer for 'xref'" is exactly this.
- No word row exists for it: `words.json` has no key for a repaired file (`grep -i reconstruct` finds none). So a sentence is owed by the **design** (UX-DESIGN) as well as the carrying by the module.

### 2. Why the tests missed it

`pdf-reader`'s tests assert the note on the **structure answer** (`structure.notes.includes("xref_reconstructed")`, its R8 (a)), which is where it is made; `reading-pipeline` has no test that a recovery note reaches `reading`, and no requirement says it must (`build/requirements/reading-pipeline.md` has no line naming `notes`; the pdf-reader requirement R8's "notes ... informational only" stops at the structure answer). A9's brief ("read with `xref_reconstructed` stated") is a walk expectation that no module requirement owns: K4426's row G132 lists it under `pdf-reader` only.

### 3. Failing-first test

- **Module and file:** `reading-pipeline`, `bio-plane/test/m/reading-pipeline/` new `r10-recovery-notes.test.mjs` (the `fresh()` + `realMember` harness above).
- **Builds:** `generate({kind:"pdf", seed:"rw9-A-9b", size:{pages:3, lines:6}, structure:"damaged-xref"})`, the same `"no-xref"`, and the A5b truncated file.
- **Asserts:** `reading.recovery` (the name is the module's to choose) lists `xref_reconstructed` for the first two and `structure_reconstructed` + `pages_missing` (8 of 30) for the third; a control PDF with a good xref lists nothing; and (in the screens module's test, below) the Document page draws a sentence from a new word key.
- **Seen red:** yes (nothing about the repair in the stored reading).

### 4. Platform check

None (data flow). After the fix, on the live copy the Document page of the two A9 files must draw the sentence; the stored reading's size grows by a few bytes.

### 5. Owner

**`reading-pipeline`** (carry the notes onto the reading, as `container_extent`/`text_source` are), then the Document page draws it: **`screens-inquiry`** (`document.mjs`) with a word row from the design, which is one job after this one (K4427: the carrying is this cause's job; the sentence is a second cause for UX-DESIGN's word table and `screens-inquiry`'s draw). Requirement for BOB: `pdf-reader` R8 (a)/(d) promise the notes; no requirement says where a member sees them. Silent: whether "this file was repaired before it was read" is a statement the member must see, or only an audit fact.

---

## R10 · `pages_left` wrong (A10 N5)

### 1. Root cause with evidence

**`reading-pipeline/index.mjs:755` (`stateOcr`: `target.ocr_left = { cursor, pages: left.pages.length }`) counts the OCR pages owed *in the piece just read*, and `extraction/index.mjs:760`-`:766` (`#ocrEntry`) and `:3251` (`owedAnswer`) publish that count as `registration.pages_left` beside the document's `total`.**

- A PDF is read in ranges of 100 pages (`rangePages`). The first piece of a 300-page scan is pages 0-99; `tier3Extend` is asked about those pages only, so `ocr_left` is `{cursor: 0, pages: 100}`. I read it in-process (`read(..., {cursor: null, ocrInvocations: 0})` with the real pdf-worker, a 300-page scan `{pages:300, lines:3, kinds:["scan"]}`, 1,015,391 B): `more: true, read_through: 100, total: 300, ocr_left: {cursor: 0, pages: 100}, counters.owed: 100`. That is the walker's `readheld` answer exactly: `detail {read_through: 100, total: 300}` and `registration {kind:"ocr", pages_left: 100}`.
- So `pages_left: 100` is true of the piece (100 pages owed OCR out of the 100 read) and false of the document (300 owed, 200 not yet read), under a name and next to a total that say "left". The ledger's later rows show OCR "continuing through all 300", because each later piece registers its own count (extraction R102: "from each continuation piece").
- This is the same number the Document page and a `owedwork` row would show as "pages left" if either draws `pages_left`; I found one consumer that draws it as the document's: `extraction`'s `#pressOwes` (`:2919`), which counts the whole document (`#pagesLeft`), so the two registrations of one document disagree (100 from `readheld`, 300 from the press).

### 2. Why the tests missed it

`extraction` and `reading-pipeline` tests assert `pages_left` for documents of **one range** (under 100 pages: 30-page scans, `SCAN A1`/`C1`), where the piece and the document are the same pages; no test reads the first piece of a document longer than `rangePages` and asserts what `pages_left` means.

### 3. Failing-first test

- **Module and file:** `extraction`, a new case beside its `readHeld` tests (`bio-plane/test/m/extraction/`), using the real store fixture `bio-plane/test/m/plane/fixture.mjs` for the registrar.
- **Builds:** the 300-page scan above held in the evidence store, `readHeld({sha, defer:false})` with no `kind` (the door's own read).
- **Asserts:** the answer's `registration.pages_left` equals the **document's** unread count (300, or `total - read_through + owed`, whichever the requirement fixes) or the key is renamed for what it is (`pages_in_piece`); and the `ocr` job row registered holds the same figure the press registers for the same document.
- **Seen red:** the figure (100 against total 300) seen in-process through `read`; not through the `readHeld` entry (needs the plane fixture; the number is the same one `owedAnswer` copies from `ocr_left`).

### 4. Platform check

None (arithmetic). Live copy after the fix: `readheld` on a 300-page scan must answer a `pages_left` the walker can add up.

### 5. Owner

**`extraction`** (what it publishes: `owedAnswer`/`#ocrEntry`). Requirement for BOB: `extraction` R102 says the row is `{kind:"ocr", sha, cursor, pages_left}` "from each continuation piece" without saying whether `pages_left` is the piece's or the document's; `reading-pipeline` R37 says `ocr_left` is "the first page owed and how many". Silent: the word. MINOR (A10): no member sees the key unless a screen draws it.
