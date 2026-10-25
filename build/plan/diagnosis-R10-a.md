# Diagnosis R10-A: G1 reading statements (R1-R5) and G7 statements on screens (R35-R39)

**Status** · IN PROGRESS. DIAG-R10-A #1 for BOB #287 (T51, fix round 10, K5047). Branch `prep/diag-r10-a`, from `tranche/T51` at `748b778923`. Source code is identical to the walked commit `11be23b44c` (`git diff 11be23b44c HEAD -- bio-plane/src` is empty), so what is read and run here is what the walkers saw. No product code and no test is changed; the repro scripts are kept outside the repository and their core is printed in the Appendix.

**How the evidence was made.** The real plane (`src/plane/index.mjs`) and, where a picture is read, the real OCR member (from `ocr-worker/dist`), both booted in Miniflare, as `fr6-seam.test.mjs` and `r9-refusal.test.mjs` boot them. Every file was made by the walkers' own generator recipes (`bio-plane/test/corpus.mjs`, `imggen.mjs`, `sheetgen.mjs`, `make-zip.mjs`) and sent through the real `captureupload` op and the screen's own `promoteDocument`; the page is the real `document` screen booted by `interface-shell/harness.mjs` over the real door. The only place anything is shaped by hand is named where it happens (R5, R36). "Red" means the page drew the walker's wrong sentence in this run.

## Summary

| cause | root (file:line) | shared root | owner | red in-process |
|---|---|---|---|---|
| R1 a final reading with no size reason draws the size sentence | `screens-inquiry/document.mjs:444-448` (`statedSaid`) | with R2a, R4 | **screens-inquiry** (words for new codes: UX-DESIGN) | yes, 8 shapes |
| R2a size refusal draws the stored size, no limit, "MB" for MiB | `document.mjs:447`, `:263` | R1 | **screens-inquiry** (wording of units: BOB/UX-DESIGN) | yes, 4 shapes |
| R2b a rows or count bound is worded "bytes", and the count is not carried | `reading-pipeline/index.mjs:2493-2494`, `:2507-2508` | none | **reading-pipeline** | yes |
| R3 `.doc` text is not named "legacy Word" | `reading-pipeline/index.mjs:2517-2531`, `:2920`, `:3271` | feeds R1 | **reading-pipeline** (BOB: what is true of a text file called `.doc`) | yes |
| R4 an archive's own page offers "Read it" and names no members | `document.mjs:292-308`, `:623-626`; `extraction/index.mjs:1945` | feeds R1 | **screens-inquiry** (sentence: UX-DESIGN; requirement silent) | yes |
| R5 Add screen says "Unread... check again soon" after a final statement | `screens-intake/capture.mjs:254-257`, `:831-843`, `:1251` | none | **screens-intake** | yes (deferred shape made by one-field edit) |
| R35a grade heading "Why Undetermined, because ?" | `document.mjs:373` | none | **screens-inquiry** (sentence: UX-DESIGN) | yes |
| R35b no note of an unread image type | `file-safety/index.mjs:1790-1799` (answer exists), no screen draws it | none | **screens-intake** `open-file` (requirement silent: BOB) | absence shown |
| R36 stray type word on a GIF/TIFF line | `screens-intake/capture.mjs:1239-1240` | none | **screens-intake** (row: UX-DESIGN) | yes |
| R37 the assumed encoding is not drawn | no code in `screens-inquiry`; `reading-pipeline` R49 says the page shows it | none | **screens-inquiry** (requirement + words: BOB, UX-DESIGN) | yes |
| R38 first-load and "N pictures kept, not read" not drawn | `document.mjs:342-366` reads neither | none | **screens-inquiry** (requirement + words: BOB, UX-DESIGN) | by code read |
| R39 no read-only answer carries the scanner's bounds or the migrations' counts | `file-safety/index.mjs:1433-1436`; `extraction/index.mjs:2408-2411` | none | **file-safety** (bounds), **extraction** (counts); BOB decides if they must be readable | by code read |

Reading across the whole group: **R1, R2a and R4 are one function.** `document.mjs` decides what a stored statement says in one `?:` chain (`statedSaid`, lines 444-448). The chain reads four things of the reading (`too_large`, `ocr_refused` codes that have a held word, the `repairable` flag, the stored byte size) and none of the reading's own `reason`, `size`, `bound`, `part`. Whatever it cannot match falls to line 447, "This document is {stored size}, which is more than your team's Civicsmith can read", for any final reading at all. One owner fixes it once: **screens-inquiry**.

---

## R1. A final reading with no size reason draws "This document is N KB, which is more than your team's Civicsmith can read"

**Walker:** A N3, A5b, A7, A8 (PNG `turn:90`/`turn:180`/blank, rotated PDF scan), C4 `.doc`, C6, C7 (encrypted DOCX, `%PDF-` DOCM), D7a and E5 (a 439-byte and a 592-byte ZIP). A 5 KB picture is told it is "more than your team's Civicsmith can read".

### 1. Root cause with evidence

`bio-plane/src/screens-inquiry/document.mjs`:

- `:240-243` `textState`: a reading with `completeness.state === "stated"` (and not `repairable`), or with no words and `failure === "final"`, is `"stated"`.
- `:442-448`, read in full:
  ```
  const refusedCodes = [...new Set(ocr_refused[].reason ... .filter(c => /^[A-Z][A-Z0-9_]*$/.test(c) && heldWord("refusal." + c)))];
  const statedSaid = textState === "stated" && tooLarge ? screen.document.reading.too_large {size,key}      // extraction's row-too-big statement only
    : textState === "stated" && refusedSaid ? refusedSaid                                                    // only OCR codes that HAVE a held word
    : textState === "repairable" && heldWord(...repairable) ? screen.document.reading.repairable
    : textState === "stated" && heldWord("screen.document.reading.stated") && Number.isInteger(rv0.bytes)   // :447  <-- any other stated reading
        ? cs.w("screen.document.reading.stated", { size: sizeWord(rv0.bytes) })
    : comp.why ... basisWords ... undetermined("");
  ```
- `rv0.bytes` is not a measured figure of anything that was refused. It is the stored size of the original, set at `extraction/index.mjs:1912` (R77: "`bytes` is the stored size of the capture's original as the register holds it"). So line 447 turns *any* final reading of a file whose size the register knows into "this is {stored size}, which is more than ... can read".
- The key drawn is `screen.document.reading.stated` (DEC-418, B481 screens-inquiry G6: "a reading stated final with its size (a bound that must stay is stated)"). It is a size sentence. It is the right key for a size refusal and the wrong key for every other reason.

What the real plane stores for each of the walker's files (run here, plane and page real), all drawing the same size sentence:

| file (walker's recipe) | what `op=reading` carries | page drew |
|---|---|---|
| PNG `{kind:png, seed:"rw9-A-7", lines:3}` (A7) | `ocr_refused:[{page:0, reason:"NOTHING_TRANSCRIBED"}]`, `completeness.stated` | "This document is 6 KB, which is more than ..." |
| PNG `degrade:{turn:90}` (A8) | `ocr_refused:[{reason:"PICTURE_NOT_LEGIBLE"}]` | "This document is 5 KB, which is more than ..." |
| PDF `encryption:{method:"aes", user:"walkpw"}` (A2) | `reason:"ENCRYPTED"` (live: `PASSWORD_REQUIRED`) | "This document is 11 KB, which is more than ..." |
| text bytes named `y.doc`, type `""`, after "Read it" has been tried once (C4) | `failure:"final"`, no `reason`, basis "the document was not read as text (non-textual or too large)" | "This document is less than 1 KB, which is more than ..." |
| ZIP of 2 text members, after "Read it" (D7a, E5) | same as the `.doc` | "This document is less than 1 KB, which is more than ..." |
| DOCX, 300,000 one-letter paragraphs (C6) | `reason:"STRUCTURE_OVER_BOUND"`, `bound:250000`, `name:"TOO_MANY_OBJECTS"` | "This document is 30 KB, which is more than ..." |
| PDF `truncate:0.7` (A5b) | `failure:"final"`, basis "...(840 undecodable region(s): no_tounicode)" | "This document is 43 KB, which is more than ..." |

Note the encrypted PDF: its reading carries `reason: ENCRYPTED`, and the word table holds `refusal.ENCRYPTED` ("The document is encrypted."), yet the page draws the size sentence. The page never looks at the reading's `reason`. The only reasons it uses are `UNSUPPORTED_FORMAT` (line 307) and the OCR page codes that have a held word (line 442). Held words exist for `refusal.IMAGE_TOO_LARGE`, `refusal.ENCRYPTED`; none exists for `NOTHING_TRANSCRIBED`, `PICTURE_NOT_LEGIBLE`, `PAGE_NOT_LEGIBLE`, `PASSWORD_REQUIRED`, `PAGE_KILLED_READER`, `STRUCTURE_OVER_BOUND` (searched `setup-words/rows.mjs`). So for those the chain falls through to line 447.

For the `.doc` and ZIP rows the cause is upstream as well (R3, R4): the reading itself says nothing but "not read as text (non-textual or too large)", which `reading-pipeline` R54 forbids ("never ... as 'non-textual or too large'"). But the page turns even that bare statement into a false number.

### 2. Why the tests missed it

- `fr6-document.test.mjs:21-31` builds the stated reading by hand: `stated()` = `{reading:{failure:"final", basis: BASIS}, bytes: 41942040, ...}` (a basis sentence typed in the test, no `reason`, no `size`, no `bound`) and asserts the page includes `word("screen.document.reading.stated", {size: sizeWord()})`. It pins the wrong sentence as the right one for a reading whose only cause is size.
- `fr6-seam.test.mjs:76-90` is the same assertion over the real plane, for the one input where size is the reason (the 40 MB upload). It asserts `stored.bytes` as the figure.
- `g41-document.test.mjs` scripts `too_large {bytes,key}`. `r9-refusal.test.mjs` runs the real OCR member but only for `IMAGE_TOO_LARGE`, the one code that has a held word.
- No test opens a Document page for a final reading with no size reason through the real plane (NOTHING_TRANSCRIBED, PICTURE_NOT_LEGIBLE, ENCRYPTED, a text `.doc`, a ZIP, STRUCTURE_OVER_BOUND), and no test asserts what the page must *not* say.

### 3. Failing-first test

Module **screens-inquiry**, new file `bio-plane/test/m/screens-inquiry/r10-stated.test.mjs`, built like `r9-refusal.test.mjs` (real plane + real OCR member in Miniflare, the member's own `captureupload`, `CAPTURE_SCREEN.parts.promoteDocument`, the page booted over the real door). One test per shape, each waits until `op=reading` is final and the page has `[data-text-state="stated"]`:

1. PNG `generate({kind:"png", seed:"rw9-A-7", size:{lines:3}})`; 2. PNG `degrade:{turn:90}`; 3. PDF `encryption:{method:"aes",user:"walkpw"}`; 4. the bytes of a text file uploaded as `y.doc` with type `""`, then `op=readheld`; 5. `makeZip` of two text members, then `op=readheld`; 6. a DOCX hand-zipped with 300,000 `<w:p>` (the generator's `tiny-paragraphs` ladder makes an 80 MB part and is refused by size; the file is the walker's C6 hand-made one); 7. `pdfgen` `truncate:0.7`.

Asserts, for every shape: the page does **not** contain `word("screen.document.reading.stated", {size})` for the stored size (the stem "which is more than your team's Civicsmith can read" is absent); it contains the word held for the reading's own reason when the table holds one (`refusal.ENCRYPTED`, `refusal.IMAGE_TOO_LARGE`), otherwise the reading's `completeness.why`/`basis`, and never a bare `undetermined("")`. Control (must stay green): a 25,165,825-byte PDF still draws the size/limit sentence (R2a's test).

**Seen red:** yes. Shapes 1-5, 6 and 7 each drew the size sentence in this run (table above). Shape 7 here has no pdf-worker, so its basis text differs from the live reading's ("264 undecodable region(s): no_tounicode"); the sentence drawn is the same.

### 4. Platform check

The OCR member is real (Miniflare, committed bytes) for shapes 1-2. The live copy's own readings are the walkers' rows (A N3, A7, A8, C4, C6, C7, D7a, E5). After the fix, the same ZIP, `.doc`, picture and DOCX are re-opened on biosmoke8 and the page must show each reading's own cause. What the live copy adds that Miniflare cannot: the live pdf-worker's `PASSWORD_REQUIRED` (A2) and `no_tounicode` (A5b) wording, which have no held word either (a design gap below).

### 5. Owner and words

**Owner: screens-inquiry** (one job; `document.mjs` `statedSaid`). The rule the job writes: the sentence for a stated reading is chosen from the reading's own `reason`, `size`, `bound`, `part`, `n`, `kind`; the size sentence is drawn only when `reason` is `TOO_LARGE`; a stated reading with no held word for its reason draws the plane's `completeness.why`/`basis` (never a number the register holds).

**Words (setup-words):** the key drawn is `screen.document.reading.stated`. For `NOTHING_TRANSCRIBED`, `PICTURE_NOT_LEGIBLE`, `PAGE_NOT_LEGIBLE`, `PASSWORD_REQUIRED`, `PAGE_KILLED_READER`, `STRUCTURE_OVER_BOUND` the defect is **both**: the key chosen is the module's (the size key is used as a catch-all), and the sentence is the design's gap (no `refusal.<code>` row exists for those six, so there is nothing right to choose). UX-DESIGN supplies the six rows; the machine sentence the plane stores today ("the OCR member declined to transcribe this document (NOTHING_TRANSCRIBED) (the text of this document is undetermined (1 undecodable region(s): no_text_layer); a reading over text nobody decoded would be an invented one)") must not be what a member reads in the meantime.

**For BOB (requirement wrong):** `screens-inquiry` R96 says: "a stored statement (`failure: final`, or `completeness.state` `stated`) is drawn as that statement **with the file's size**, never 'Nothing here' ...". "With the file's size" is the instruction the code obeys for every statement. It should read: drawn as the statement the reading states, with the figures *that reading* states (size and limit only for a size refusal).

---

## R2. A size refusal names the stored size, not the measured one, no limit, and writes MiB as "MB"

**Walker:** A4a (41.5 MB shows 39.6 MB, limit not named), A4c (24 MiB + 1 byte reads "24.0 MB" against "24.0 MB"), A11 (84.2 MB shows 80.3 MB, no type named), B2d (an ODS stored 2.0 MB whose `content.xml` is 31.7 MB), B3d (1,048,577 rows shown as "19.0 MB"; the reading's basis calls rows "bytes"), B9b, B11, B12a.

R2 has two roots, in two modules, so it is two causes.

### R2a. The Document page ignores the reading's own `size` and `bound`

#### 1. Root cause with evidence

Same chain as R1: `document.mjs:447` draws `sizeWord(rv0.bytes)`. `rv0.bytes` is the stored size (`extraction/index.mjs:1912`), while the reading itself states the measured figure and the limit. Run here:

| walker's case | reading carries | page drew |
|---|---|---|
| ODS `{kind:ods, rows:45000, cols:6}`, stored 2,143,831 B (B2d) | `reason TOO_LARGE`, `size 31713116`, `bound 20971520`, `name MEASURED_OOXML_TEXT_BOUND_BYTES` | "This document is **2.0 MB**, which is more than ..." |
| CSV, 1,048,577 rows (B3d) | `reason TOO_LARGE`, `size 1048577`, `bound 1048576`, `name MEASURED_CSV_ROWS_BOUND` | "This document is **19.0 MB**, which is more than ..." |
| PDF 25,165,825 B (A4c) | `reason TOO_LARGE`, `size 25165825`, `bound 25165824`, "in 4 parts" | "This document is **24.0 MB**, which is more than ..." (the limit is also 24.0 MB) |

So: (a) the figure is the stored size where the refusal's measure is the unpacked part (B2d) or a row count (B3d); (b) the sentence has one slot, `{size}`, and no slot for the limit; (c) `sizeWord` (`document.mjs:263-264`) renders `bytes / 1048576` with the word `size.mb` = "{n} MB" (rows.mjs:5766, DEC-309), so a MiB is written "MB", and with one decimal the size and limit of A4c print identically.

The Add screen already has the right shape: `screens-intake/capture.mjs:1228-1236` `readRefusalHtml` draws `TOO_LARGE {size, bound}`, but through a key that does not exist (`screen.capture.read.refused.TOO_LARGE` has no row; searched), falling back to the same `reading.stated` sentence followed by a bare `<span class="mk-data" data-limit>{bound}</span>`. That is the stand-in `screens-intake` R64 lists as owed: "the sentences are keyed rows owed to `later-ux.md`".

#### 2. Why the tests missed it

The same hand-built `stated()` of `fr6-document.test.mjs` (stored `bytes: 41942040`, no `size`/`bound`), and `fr6-seam.test.mjs:86`, which asserts `stored.bytes`. `screens-intake/r9-states.test.mjs:86-95` ("R64 a size refusal draws the file's size and the limit, each in MB") scripts the upload answer with `reading:{reason:"TOO_LARGE", size, bound}` and checks `mb(size)` and `mb(bound)` are included, so it passes for the Add screen's stand-in; no test does the same for the Document page, and none uses a bound whose figure equals the size after rounding.

#### 3. Failing-first test

**screens-inquiry**, in `r10-stated.test.mjs` (R1's file, same harness). Shapes (all through the real plane): the ODS above, the 1,048,577-row CSV `{kind:csv, seed:"rw9-B-3d", size:{rows:1048576, cols:1}}` (the generator's `rows` counts data rows; the file has 1,048,577 lines with the header), the PDF `size:{bytes: 25165825}`. Asserts: the page names the **reading's** `size` (31,713,116 B for the ODS; 1,048,577 rows for the CSV) and its `bound`; for the ODS the stored size 2.0 MB is not what is drawn as the refused figure; for A4c the size and the bound are told apart (one byte over reads as one byte over). The sentence is asserted by its key's words with the reading's figures, never typed English (R44).

**Seen red:** yes, three shapes (table above).

#### 4. Platform check

None beyond Miniflare: the sentence is decided in the page from the reading. After the fix, biosmoke8: re-open A4a (41.5 MB), A4c, B2d, B3d, B9b, A11 and read the Document page.

#### 5. Owner and words

**Owner: screens-inquiry.** Words: the key drawn, `screen.document.reading.stated`, is **the module's choice for a case it does not fit** (it has no limit slot) **and the design's gap**: UX-DESIGN supplies a size-refusal row with `{size}` `{bound}` and the unit of the refusal (bytes, rows, objects).

**For BOB (requirement, policy-level wording):** `screens-intake` R64 fixes "A byte figure is drawn in KB, MB or GB (a MB is 2^20 bytes)", and `screens-inquiry` R96 has no figure rule at all. Options: (1) keep MB = 2^20 and add the exact byte count to a refusal (e.g. "25,165,825 bytes; the limit is 25,165,824"); (2) write the unit MiB; (3) use decimal MB. **Recommendation: (1) for refusals, because only an exact count tells one byte over from the limit, and (2) is the honest unit name for the rest.** This is wording and so BOB's, with UX-DESIGN.

### R2b. A bound on rows or objects is worded "bytes", and the measured count is not carried

#### 1. Root cause with evidence

- `reading-pipeline/index.mjs:2493-2494` (`guardRefusalOf`): the entry's guard is `{why:"over_size_bound", size, bound, boundName, metric}` (`csv-reader/index.mjs:747-748`: the CSV row bound is `sizeMarker("rows", rows, CSV_ROWS_MAX, "MEASURED_CSV_ROWS_BOUND", ...)`). The refusal built from it keeps `size`, `bound`, `name` and **drops `metric`**.
- `:2507-2508` `refusalSentence`: `TOO_LARGE` is always "This file is {size} bytes, over the {bound} bytes allowed for this kind of file". For the CSV the reading's own `basis` therefore reads "This file is 1048577 bytes, over the 1048576 bytes allowed" (run here), a row count called bytes. R54 says the sentence holds "the file's size and the limit".
- For a count over its bound (`STRUCTURE_OVER_BOUND`): `guardRefusalOf` keeps `n` only `if (Number.isFinite(g.n))`; the ooxml guard does not carry its own count, so the reading for the 300,000-paragraph DOCX is `{reason:"STRUCTURE_OVER_BOUND", bound:250000, name:"TOO_MANY_OBJECTS"}` with no `n` (run here). C6's "names the bound, not its own count" and G3's R11 are the same missing field.

#### 2. Why the tests missed it

`reading-pipeline/r10-refusals.test.mjs:82-104` ("a size marker an entry leaves in its text is `TOO_LARGE {size, bound}`...") checks `reason`, `size` and `bound` and `NOT_THIS = /non-textual|too large|multipart/i` on the sentence; it never asks what the figure measures. Its markers are hand-made guards.

#### 3. Failing-first test

**reading-pipeline**, `test/m/reading-pipeline/r10-bound-unit.test.mjs` with the module's `read(doc, {evidence: evidenceStore(...)})` and `fixture.mjs` (like `r10-refusals.test.mjs`): the CSV of 1,048,577 rows, and a DOCX of 300,000 `<w:p>`. Asserts: the CSV reading carries a unit/metric (`rows`) beside `size`/`bound`, and its `basis` does not contain "bytes"; the DOCX reading carries `n: 300000` with `bound: 250000`. **Seen red:** yes, by the probe (basis "...1048577 bytes, over the 1048576 bytes..."; no `n`).

#### 4. Platform check

None (pure reading). The 1,048,577-row CSV and the 300,000-paragraph DOCX on biosmoke8 after the fix.

#### 5. Owner

**reading-pipeline** (it decides the reading's figures; `csv-reader`/`ooxml` are `uses`, their guard already carries `metric`). Words: sentence stand-ins `reading-pipeline.index.too_large` (a code-origin row, "bytes" fixed in the English) and `.structure_over_bound` are the module's rows; the design's sentence for each unit is UX-DESIGN's (shared with R2a).
