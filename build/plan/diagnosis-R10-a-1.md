> Part 1 of 2 (R1-R5); part 2 (G7, R35-R39) is `diagnosis-R10-a-2.md`.
# Diagnosis R10-A: G1 reading statements (R1-R5) and G7 statements on screens (R35-R39)

**Status** · COMPLETE. DIAG-R10-A #1 for BOB #287 (T51, fix round 10, K5047). Branch `prep/diag-r10-a`, from `tranche/T51` at `748b778923`. Source code is identical to the walked commit `11be23b44c` (`git diff 11be23b44c HEAD -- bio-plane/src` is empty), so what is read and run here is what the walkers saw. No product code and no test is changed; the repro scripts are kept outside the repository and their core is printed in the Appendix.

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

---

## R3. A `.doc` (text in a file called `.doc`) is not stated "legacy Word is not read yet"

**Walker:** C4. `x.doc` holding plain text: the page said "This document is less than 1 KB, which is more than your team's Civicsmith can read" and the reading's reason was "the document was not read as text (non-textual or too large), so no reading was attempted". RTF and email (`x.rtf`, `x.eml`) were right.

### 1. Root cause with evidence

Three places, one chain:

1. **The kind is decided by the bytes' signature alone.** `reading-pipeline/index.mjs:2517` `unreadKindOf(b, types)`: legacy Word is returned only inside `if (sig(b, 0, [0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]))` (`:2528-2529`), where the declared type and the name only choose *which* legacy kind. Bytes without the OLE signature never reach it. And the caller (`:2920`) hands it `types = [ct, profile.source_content_type, headers["content-type"]]`: the file's *name* is not among them, so `x.doc` with an empty type, or with `application/msword`, is not named at all.
2. **The fall-through is the sentence the requirement forbids.** `:3270-3272`: a non-wireable, non-text-read document becomes `failed(..., localize("reading-pipeline.index.document_not_read_text", "the document was not read as text ({why}), so no reading was attempted", {why: ... "non-textual or too large"}), {failure: FAILURE_FINAL})`, with no `reason`. `reading-pipeline` R54: "never ... as 'non-textual or too large'".
3. **"Read it" then removes the one place that names it.** `extraction/index.mjs:1945` marks a reading `repairable: true` while `notReadAsText(reading) && !#repairTried(sha)`. While it is `repairable`, the page falls back to the record's kind (`document.mjs:298-308`, `recordKind` from the profile, the declared type or the file's extension) and says "Legacy Word is not read yet" (run here with type `application/msword`: yes, first view). The ledger (R89 `migrateRepairs`, `extraction/index.mjs:2526`) reads it once more, gets the same bare statement, and `#repairTried` becomes true: `repairable` goes, `noReader` is empty (`document.mjs:308`: the record's kind is used only when `textState` is `unread` or `repairable`), and the page draws R1's size sentence (run here, both with type `""` and with `application/msword`). The walker saw this second state because the copy had been repaired.

Run here: the same bytes uploaded as `x.doc` with type `application/msword`: first view "Legacy Word is not read yet."; after the repair attempt the size sentence. With type `""`: first view "An earlier attempt did not read this document... Press Read it", then the size sentence.

### 2. Why the tests missed it

`reading-pipeline/r10-refusals.test.mjs:20` tests legacy Word with the **OLE signature bytes** (`pad(u8([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1]))`, declared `application/msword`), a file that is a legacy Word file. The walker's file is not one: it is text with a name. The same test (`:49`) asserts "a plain text that merely mentions RTF or From: is read as text", which holds the opposite policy for content. `screens-inquiry` tests the legacy sentence only for a reading that states `UNSUPPORTED_FORMAT` (R130), and for `repairable` it scripts the flag.

### 3. Failing-first test

**reading-pipeline**, `test/m/reading-pipeline/r10-declared-kind.test.mjs`, in the module's fixtures (`evidenceStore`, `doc`, `read`): bytes `"legacy word text walk ".repeat(7)` with the document declared `application/msword` (case a) and with an empty type and `capture.file_name: "x.doc"` (case b). Asserts: `reading.reason === "UNSUPPORTED_FORMAT"` with `kind: "legacy_word"` (or the statement BOB rules, below), `failure: "final"`, the basis does not match `/non-textual|too large/`, and `reading` is not `repairable` (`notReadAsText` false). Through the real plane (screens-inquiry's `r10-stated.test.mjs` case 4): after `op=readheld` the page says the word held for `reading-pipeline.index.unsupported_legacy_word`, not the size sentence. **Seen red:** yes (both cases, probe).

### 4. Platform check

None (decided by bytes and names). On biosmoke8: C4's `x.doc` after the fix, both before and after the ledger's repair attempt.

### 5. Owner and words

**Owner: reading-pipeline** (the reading must say it; the page already draws `unsupported_<kind>` when the reading says `UNSUPPORTED_FORMAT`, `document.mjs:307`). Words: key `reading-pipeline.index.unsupported_legacy_word` ("Legacy Word is not read yet.") is held (code-origin) and right; no change to the sentence.

**For BOB (requirement silent, and the policy is yours):** R54 says "A kind with no reader is named ("RTF is not read yet", email, legacy Word ...)" and says the kind is "named, by its bytes and the types it is declared as" (code comment `:2514`). It does not say what is true of **a text file whose name or type says Word**. Options: (1) name it by its declaration ("legacy Word is not read yet"), the walker's and the brief's expectation; (2) read it as text because its bytes are text (the policy `:49` already holds for RTF and email *content* that is text); (3) name it by its declaration but say the file did not look like one. **Recommendation: (3)**, because (1) tells a member a text file is a Word file and (2) reads a file the member called Word as prose without saying so. If BOB chooses (1) the test is as written; for (3) the words are UX-DESIGN's.

---

## R4. An archive's own page offers "Read it" and says nothing of its members

**Walker:** C1. The Document page of `c1-3.zip` says "An earlier attempt did not read this document, but your team's Civicsmith can read it now. Press Read it to try again." with a "Read it" button that cannot succeed, and no "archive of 3 members, read separately". D7a and E5: after the ledger tries once, the ZIP page says the size sentence.

### 1. Root cause with evidence

- `extraction/index.mjs:1945`: `repairable: true` when `notReadAsText(reading) && !#repairTried(sha)`. A ZIP's reading is the bare "not read as text" (nothing in `reading-pipeline` names an archive; `unreadKindOf` has no ZIP), so every uploaded archive is `repairable` until the ledger's single attempt.
- `document.mjs:292-308`: `UNREAD_KINDS` and `KIND_OF_TYPE`/`KIND_OF_EXT` list no `zip`/archive, so `recordKind` is `""`; `:623-626` offers `readheld` ("Read it") for `repairable`. Run here: ZIP of 2 text members uploaded as `application/zip`: page "An earlier attempt did not read this document ... Press Read it" with a Read it button; pressed (`op=readheld`), the page then says R1's size sentence for a 233-byte file.
- The page already holds what it would need to say what the archive is, without a new read: `heldcaptures` (read at `document.mjs:196`) answers the archive's own row with `archive: {sha256, entries, filed, already_held, not_filed, waiting}` (run here for a ZIP of 2: `{"entries":2,"filed":0,"already_held":0,"not_filed":0,"waiting":2}`, in the `held` and the `held_and_vouched` list). `screens-intake` `held.mjs` (R37) already draws a row whose answer carries `archive` as "{parts}" and the door "Open its files". `document.mjs` has no archive branch.
- There is no word for it: no row says "archive of N members, read separately" (searched `rows.mjs`); the sentence is the walk brief's. `capture` R110 says "each member ... filed at the archive's grade, read separately, and the archive's list shows each member's state"; no `screens-inquiry` requirement says what the archive's *own* Document page states.

### 2. Why the tests missed it

`screens-inquiry` R130's tests (`SCAN A2-A9 and DOCS R1-R3`) cover kinds a *reader* names. Nothing covers an archive: the page tests script `repairable` by a flag, never from a ZIP. `screens-intake/archive.test.mjs` and `held.test.mjs` test the archive screen and the Held row, not the Document page of the archive's own record.

### 3. Failing-first test

**screens-inquiry**, `r10-stated.test.mjs`: `makeZip` of three text members uploaded through the real `captureupload` (the walker's C1 recipe `m1.txt` to `m3.txt`), promoted with the screen's `promoteDocument`, the page booted over the real door. Asserts: no `readheld` act is drawn (`actsIn(main)` has no `readheld`), no `screen.document.reading.repairable` sentence; the page names the archive and its member count from `heldcaptures`' `archive.entries` (by a new key, `hasWord`-guarded until the row lands), and offers the archive screen (`archive` reference with the archive's sha, as `held.mjs` does). Second step: after the ledger's attempt (`op=readheld`), the page still says the same and not the size sentence (R1's assertion). **Seen red:** yes (the page offers "Read it", then the size sentence).

### 4. Platform check

None: the row's `archive` is the plane's. On biosmoke8: the walker's `c1-3.zip` and `c1-30.zip` Document pages, before and after the ledger's attempt.

### 5. Owner and words

**Owner: screens-inquiry** (it already reads the held row; the page must not offer a read that cannot succeed and must say what the file is). `extraction`'s `repairable` for an archive is a symptom the page need not wait for: with `row.archive` present, the page ignores it. **Words:** no key exists; the defect is the design's (UX-DESIGN supplies the archive sentence with `{n}`); the module's part is to stop choosing `reading.repairable` and `reading.stated` for an archive. **For BOB (requirement silent):** add to `screens-inquiry` a requirement that an archive's own Document page states that it is an archive with its member count, points to its members, and offers no read.

---

## R5. The Add screen says "Unread ... Check again soon" after a final statement

**Walker:** A6b (a 70,000-px PNG), A7 (PNG, BMP), C9 (the 110 MB text, parted). The Add screen, after the reading had ended `final` (once, or at once), kept saying "Until a copy is read, its words can't be found or cited. Check again soon; if it stays unread, ask a team administrator." and, for the 110 MB file, "Captured" and "Unread: this copy has not been read yet" together.

### 1. Root cause with evidence

`screens-intake/capture.mjs`:

- `:254-258` `pendingLine`: `(asked && jobLine(asked)) || <the pending sentence>`. `asked` is `U["job:" + sha]`, the answer to `op=reading` that `watchReading` keeps.
- `:263-266` `jobLine` -> `jobStateOf` (`:1251`) returns null unless the answer's `state` is one of `queued`, `fetching`, `reading`, `partial`, `refused`, `finished`, `final`. The real `op=reading` for a reading that has ended `final` carries **no `state`** (the job row is gone; `owedwork` no longer lists it): run here, `op=reading` answered `{found:true, reading.failure:"final", completeness.state:"stated"}`, `state` undefined. `jobLine` returns `""`, and `pendingLine` falls back to the pending sentence.
- `:831-843` `watchReading` asks again only while `state` is queued/fetching/reading, or `state === ""` and `n < 3`: four asks (about 60 s), then it stops. The answers are kept, never drawn.
- The comment on `watchReading` says "an answer that states no state ... the line stays the stored reading's". The code does not do that: the line stays the **pending** sentence, not the stored reading's.
- For C9 (the parted upload) the same function is reached by another door: `captureuploadcomplete` (`capture/index.mjs:1282`, completes the parts) answers the provenance document with no `reading` and no `reading_pending`; `doneUpload` (`:1174-1182`) then sets `follows` false (`reading_pending` absent), `readingOf` gives `{present:false}`, and `readLine` (`:307-312`) draws `screen.document.text.unread` + `.unread.next` ("Unread ... Check again soon") with no `watchReading` at all, though the plane has already stated the reading (`final TOO_LARGE`). I did not reproduce this one in-process (the harness's `File` of 70 MB did not start the parted upload); it is read from the code and matches the walker's C9 record.

Reproduced here (the deferred shape): the real plane, the Add screen booted, an A7 PNG pressed through `captureupload`. The plane answered the small PNG with its reading inline in this run, whereas the live copy deferred it (`reading_pending`, the OCR member "not asked inside this request"). So the answer was reshaped by **one hand edit**: the `reading`, `text_units` fields removed and `reading_pending: true` set on the real `captureupload` answer (the plane's own deferred shape, `extraction/ops.mjs:125`). The page's own asks were real: `op=reading` answered `found:true`, `failure:"final"`, `completeness.state:"stated"` four times, and the line stayed "Until a copy is read, its words can't be found or cited. Check again soon..." at 6, 12, 18, 24, 30, 36, 42 and 48 seconds of the page clock.

### 2. Why the tests missed it

`screens-intake/r9-states.test.mjs:192-203` is a control test that **asserts the wrong line**: "R65 control: a digest with no row ... draws no state, and the stored reading's line is as before". It scripts the answer `row({state: null})` = `{ok:true, found:true, capture_sha}` with **no reading in it**, and asserts `screen.document.text.unread.next`. The real plane's answer for a digest with no row carries the stored reading. The states 143-180 script a `state` in every answer. `t51-pending.test.mjs` scripts the upload answer the same way. No test follows an upload from `captureupload` to a reading that ends `final` through the real plane.

### 3. Failing-first test

**screens-intake**, `test/m/screens-intake/r10-pending.test.mjs`, the real plane in Miniflare (as `screens-inquiry/fr6-seam.test.mjs`), the Add file tab booted over the real door (`boot` with the intake screens), the file `generate({kind:"png", seed:"rw9-A-7", size:{lines:3}})` picked in `ci-file` and `captureupload` pressed (the walker's A7 case); the OCR member real. Steps: edit the real answer to the plane's deferred shape (as above, named in the test), tick the page clock (`p.clock.tick(21000)`) until `op=reading` has been asked and answered final. Asserts: the line is the reading's stated sentence (`data-reading="refused"`/`"failed"`, from `readDrawn`) and `screen.document.text.unread.next` is not drawn. Second test (C9): a file over the parts threshold; asserts the same once the plane has stated it. **Seen red:** yes for the first (the line stayed pending at all 8 observations); the second is not run.

### 4. Platform check

Why live defers a small PNG and Miniflare does not is **not established** here: it is the plane's `deferReading`/OCR-budget decision at workerd (`extraction/ops.mjs:125`, `capture/ops.mjs:243-310`). The check at the real shape: one PNG upload on biosmoke8 through the Add screen with the answer's `reading_pending` read from the response; after the fix the line must change to the stated reading within one poll, and C9's 110 MB text must show the statement with "Captured" and never "Unread".

### 5. Owner and words

**Owner: screens-intake** (`capture.mjs`: `pendingLine`/`jobStateOf`/`watchReading`/`readLine`; the plane's answer is right). The rule: an answer to `op=reading` that holds a stored reading and states no job state draws the stored reading's line (`readDrawn(readingOf(ans))`); `readLine` for a parted upload asks `op=reading` once the promotion answers. Words: the key drawn, `screen.document.text.unread.next`, is the **module's choice** (a stand-in for a not-yet-held row, K4269); its sentence ("Check again soon") is right while a reading follows and wrong after it ended, so the fix is the key chosen, not the sentence. **For BOB:** `screens-intake` R65 says "a reading with no row draws the state of its stored reading as before"; "as before" is what the code and its control test took to mean the *pending* line. Rewrite it: "draws the stored reading's own line".

---

