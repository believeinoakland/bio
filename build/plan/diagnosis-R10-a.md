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

# G7. Statements on screens (MINOR)

## R35. The grade panel: "WHY UNDETERMINED, BECAUSE ?" and no note of an unread image type

**Walker:** A13 (PNG 1 MiB + 1 and 3 MB, BMP), N7. Two faults in one row; they have different owners, so they are R35a and R35b.

### R35a. The heading

#### 1. Root cause with evidence

`screens-inquiry/document.mjs:371-373`:
```
out.push(cs.sec("screen.document.gradenote.head", ...,
  { fills: { letter: letter || T("state.undetermined", { reason: "" }) } }));
```
`screen.document.gradenote.head` is "Why {letter}?" (rows.mjs:2278). `letter` is the grade `A`-`D` from `capturegrade`; for a copy whose grade is not determined it is `""` and the module fills `{letter}` with `state.undetermined` = "Undetermined, because {reason}" ("the reason always follows", rows.mjs:80) and an empty reason. The drawn heading is "Why Undetermined, because ?" (run here with the walker's recipe: the 1 MiB + 1 PNG `size:{bytes:1048577}`, the "Read the grade note" act pressed; the heading drew exactly that, then "No grade note: this copy was handed to the team rather than fetched from its source."). The real plane's `capturegrade` for every copy handed in by upload answers `grade:null, determined:false, basis:"CAPTURE_RECEIVED_NOT_FETCHED", ceiling:"B"`, so the heading is wrong for every uploaded copy not yet graded, not only images.

#### 2. Why the tests missed it

The one test of the panel, `screens-inquiry/document.test.mjs:158`, presses "Read the grade note" on a scripted `capturegrade` answer that carries the letter `B`; no test draws the panel for a copy whose grade is not determined (searched the module's tests for `gradenote`).

#### 3. Failing-first test

**screens-inquiry**, `r10-stated.test.mjs`: the PNG `size:{bytes:1048577}` through the real plane, "Read the grade note" pressed; asserts the heading contains none of "because" or a bare "?" and is the word held for an ungraded copy (`hasWord`-guarded). **Seen red:** yes.

#### 4. Platform check

None.

#### 5. Owner and words

**Owner: screens-inquiry.** Words: the key chosen is wrong (the module composes a clause key, `state.undetermined`, into a noun slot); the sentence itself is also the design's gap: "Why {letter}?" has no form for "not graded". UX-DESIGN supplies `screen.document.gradenote.head.ungraded` ("Why is this copy not graded?" or as the design words it).

### R35b. No note that an image type is not read

#### 1. Root cause with evidence

The product states it; no screen draws it, and the brief looked in the wrong answer.

- `file-safety` R56: "a TIFF, HEIC or BMP is stated as an unread image type ... the structure check of an image answers `not_examined` and never `clean`." The structure check (`file-safety/index.mjs:1790-1799`) returns `not_examined`/`UNREAD_IMAGE_TYPE:<kind>` but only **inside a deeper check** (`#startDeeper`, `:1822`), which needs an outside scan or sandbox tool switched on; with none the request is refused `NO_OUTSIDE_TOOL` (`:1775`). Its result sits in `fs_deeper.checks`, not in `verdictnotes` (only an `encrypted` structure result writes a note, `:1823-1826`).
- The member-facing answer that does state it is `threatof`: run here, a BMP's `threatof` answers `format:"image"`, `image:{type:"bmp", read:false}`, `threat:"high"` (reason `source_not_fetched`); a PNG's answers `image:{type:"png", read:true}`. `verdictnotes` is `notes: []` for both until a note is written.
- Neither the Document page nor `screens-intake/open-file.mjs` reads `threatof.image` (searched both for `.image`, `image.read`): the Open-file screen draws "HIGH RISK ... Added by you, not fetched" and "Built-in scanner: Clean" (ClamAV's verdict on the bytes), which is what the walker saw.

So A13's "there is NO structure note" is true of `verdictnotes`, which the brief named (`graded by source, TIFF/BMP 'unread image type', never clean for a structure it did not open`), but `verdictnotes` is not where R56 puts it. The requirement is met at the answer (`threatof.image`) and unmet at any screen.

#### 2. Why the tests missed it

`file-safety` tests the structure check and `threatOf` (R56, SCAN A16, D13, F1-F8) at the answer. No screen requirement asks the Document page or Open-file to say it, so no screen test does.

#### 3. Failing-first test

**screens-intake**, `r10-open-file.test.mjs`: a BMP `generate({kind:"bmp", seed:"rw9-A-13", size:{lines:3}})` through the real plane, `/app/open-file/<sha>` booted over the real door. Asserts: the screen names the type as one the product does not read (by a new key), and does not let "Built-in scanner: Clean" stand for the structure. **Seen red:** the absence is shown (`threatof.image.read === false`; no screen reads it). Not a drawn-wrong sentence, so there is no screenshot to compare.

#### 4. Platform check

The ClamAV scanner is a container (`file-scanner`): the "Clean" line on live is its verdict; Miniflare answers `SCANNER_ABSENT`. On biosmoke8: the BMP's Open-file screen after the fix.

#### 5. Owner and words

**Owner: screens-intake** (`open-file.mjs`). **For BOB (requirement silent):** neither `screens-intake` nor `screens-inquiry` has a requirement that a screen states `threatof.image.read === false`. Decide whether Open-file (where a member decides to open it) or the Document page, or both, say it; recommendation: Open-file (the decision to open), one sentence. Words: no key; UX-DESIGN supplies it.

---

## R36. A stray type word ("gif", "tiff") on the upload line

**Walker:** A7, N6. For a GIF or TIFF uploaded without a project the line reads "A photographed page, not read yet: its words can't be found or cited until the assistant reads it or a member types them. gif".

### 1. Root cause with evidence

`screens-intake/capture.mjs:1239-1240`:
```
if (reason === "UNSUPPORTED_FORMAT")
  return keyedW("screen.capture.read.refused.UNSUPPORTED_FORMAT", { kind }, () => `${cs.w("capture.picture.unread")}${f.kind ? ` <span class="mk-data">${cs.esc(String(f.kind))}</span>` : ""}`);
```
The key `screen.capture.read.refused.UNSUPPORTED_FORMAT` has no row (searched `rows.mjs`), so the stand-in is drawn: `capture.picture.unread` ("A photographed page, not read yet: its words can't be found or cited until the assistant reads it or a member types them.") plus the raw kind. That sentence is the line for a picture with **no reading yet**; for a GIF whose reading says `UNSUPPORTED_FORMAT` it promises a reading that is refused ("GIF is not read yet" on the Document page) and ends in a bare word. Run here: the reading object the real plane stores for a GIF (`{failure:"final", reason:"UNSUPPORTED_FORMAT", kind:"gif", basis:"GIF is not read yet."}`) as the upload answer's `reading`, the Add file tab pressed (the one hand-routed step: the object is the real plane's, put in the scripted upload answer because the in-process plane answers a GIF's first reading inline as "not read as text"): the line was exactly the walker's, for `gif` and for `tiff`.

Separately, in this in-process run the plane's **inline** first reading of a GIF/TIFF in the `captureupload` answer was "the document was not read as text (non-textual or too large), so no reading was attempted" while the **stored** reading (`op=reading`, after `readheld`) says `UNSUPPORTED_FORMAT gif`. The inline pass is the `acquireReadingOp`/`extractread` one; the live copy's inline answer carried the right reason (the walker's line has "gif"), so the two differ between Miniflare and the live copy and I did not establish why. It does not change the owner: the Add screen must not draw a stand-in that promises a reading.

### 2. Why the tests missed it

`screens-intake/r9-states.test.mjs:97-115` ("R64 each refusal is its own sentence") loops over five reasons and asserts `line.textContent.includes(c[k])` for `kind`, `part` and `name`: it asserts the raw kind **is** drawn, and that "five causes, five sentences" differ, which they do.

### 3. Failing-first test

**screens-intake**, `r10-refused-kind.test.mjs` in the module's `page.mjs` harness: the upload answer carries the reading the real plane stores for a GIF and for a TIFF (taken from the plane in the same test, `generate({kind:"gif"|"tiff", seed:"rw9-A-7", size:{lines:3}})`, so the object is not typed by the test). Asserts: the line is the sentence for "{kind} is not read yet" (`reading-pipeline.index.unsupported_gif`/`_tiff`, held) and does not include `capture.picture.unread`'s words nor a `.mk-data` span holding the bare kind. **Seen red:** yes.

### 4. Platform check

None for the sentence; the live/Miniflare difference in the inline reading is noted above and is for whoever fixes R5.

### 5. Owner and words

**Owner: screens-intake.** Words: the key chosen is the module's (`capture.picture.unread` is for "no reading yet"); the right words are already held for every unread type: `reading-pipeline.index.unsupported_gif`, `_tiff`, `_bmp`, `_webp`, `_heic`, `_avif`, `_jp2`, `_ico`, `_unsupported_kind` (which the Document page already draws). `screen.capture.read.refused.UNSUPPORTED_FORMAT` is owed to `later-ux.md` (K4269) and can stay owed.

---

## R37. The assumed encoding is not drawn

**Walker:** B4b (CSV as windows-1252), C8 (windows-1252 and UTF-16 text/HTML).

### 1. Root cause with evidence

The reading states it and no screen draws it, and no screen requirement asks it to.

- `reading-pipeline/index.mjs:2767` `encodingFacts` puts `encoding` and `encoding_assumed` on the reading; run here: a Latin-1 text uploaded as `cp.txt` reads `encoding: "windows-1252"`, `encoding_assumed: true`.
- `reading-pipeline` R49: "The reading states the encoding (`encoding` and whether it was `assumed`, **which the document's page shows**)". The only requirement that says the page shows it is in the **other** module's file.
- `screens-inquiry/document.mjs` contains no `encoding` (searched) and `screens-inquiry` has no requirement for it; the word table has no row for "read as windows-1252 because the file did not say" (searched `rows.mjs`). Run here: the page for that text mentions no encoding, "assumed" or "windows" (checked by regex over the whole page).

### 2. Why the tests missed it

`reading-pipeline` tests assert `encoding`/`assumed` on the reading (R49). `screens-inquiry`'s tests cannot test a requirement it does not hold.

### 3. Failing-first test

**screens-inquiry**, `r10-stated.test.mjs`: `Buffer.from("Z\xfcrich caf\xe9 ...".repeat(30), "latin1")` uploaded as `cp.txt`/`text/plain` (the walker's recipe is the corpus text with `encoding:"windows-1252"`); asserts the page draws the sentence for an assumed encoding with the encoding's name (key `hasWord`-guarded until the row lands), and that a UTF-8 file with a BOM or a declared charset draws none. **Seen red:** yes (the page draws nothing).

### 4. Platform check

None.

### 5. Owner and words

**Owner: screens-inquiry.** **For BOB (requirement placed in the wrong module):** move the half of `reading-pipeline` R49 that says "which the document's page shows" into a `screens-inquiry` requirement ("a reading that assumed its encoding says so on the Document page, with the encoding's name"). Words: no key; the defect is the design's (UX-DESIGN supplies the sentence); the module's part is to draw it.

---

## R38. The first-load sentence and "N pictures kept, not read" are not drawn

**Walker:** C10 (acadia's visitor view), C11 (253 supporting files).

### 1. Root cause with evidence

Two facts the plane keeps and the Document page never reads; neither has a screen requirement or a word.

- **First load.** `render.mjs:436` defines `RENDER_COPY_STATEMENT` ("this is a copy of the page's first load: it was not scrolled, banners and dialogs were not dismissed, and frames and shadow content are not in it, so what a visitor sees beyond the first load is not claimed"), and `render.mjs:578` pushes it into the rendered document's `undetermined` list, which lands in the provenance (the walker found it there). `capture-sources` states only that it is exported (`capture-sources.md:178`). `document.mjs` reads no `undetermined` list of the document's capture facts.
- **Pictures kept, not read.** `acquisition/index.mjs:2192` puts `pictures_unread: {count, bytes}` into `supporting`. `acquisition` R119: "so the document says 'N pictures kept, not read'". `document.mjs:342-366` reads `kept`, `skipped`, `total`, `reasons`, `not_walked` of `supporting` and draws "N of M supporting files kept" and the reasons; it never reads `pictures_unread` (searched `screens-inquiry` and `screens-intake`: 0 hits). No row holds the sentence (searched `rows.mjs`).

Both are by code read plus the walker's record (C10, C11): a rendered capture and a 253-file page need the renderer and the live proxy, which are not run in-process. A related observation is not part of R38: 164 of the 253 supporting files "couldn't be fetched" (65 %); that is `capture-sources`' budget (G5/G6 side), not a sentence.

### 2. Why the tests missed it

The acquisition tests assert `pictures_unread` on the answer (R119's test); `screens-inquiry`'s `r9-supporting.test.mjs` asserts the "N of M kept" lines on a scripted `supporting`. Nothing connects the two, because no `screens-inquiry` requirement says the page draws them.

### 3. Failing-first test

**screens-inquiry**, `r10-supporting.test.mjs` in the pattern of `r9-supporting.test.mjs` (the document's `data/provenance.json` carrying a `supporting` made by acquisition's own builder (`acquisition/index.mjs:2160-2192`, called with 40 pictures) and, for the first-load case, a document whose provenance `undetermined` holds `RENDER_COPY_STATEMENT` imported from `render.mjs`): the page includes the sentence for N pictures with the size; includes the first-load statement; a page with no pictures and a plain capture draw neither. **Seen red:** not run (it needs a supporting file builder); the absence is read from code and from C10/C11.

### 4. Platform check

The live copy: C10's acadia capture (renderer, 12 s) and C11's page. After the fix, one capture of the walker's page on biosmoke8 with the Document page of both documents.

### 5. Owner and words

**Owner: screens-inquiry.** **For BOB (requirement silent):** `acquisition` R119 says "the document says"; `capture-sources` says the statement exists; no `screens-inquiry` requirement says the page draws either. Add both to `screens-inquiry`. Words: no row for either sentence; the defect is the design's (UX-DESIGN supplies "{n} pictures kept, not read ({size})" and the first-load sentence in a member's words). The code-origin row `capture-sources.render.copy_first_load_not_scrolled` is the plane's English and is not a design row.

---

## R39. `/version` carries no bounds; the migrations' counts are on no read-only answer

**Walker:** D5, D6. Both are checks the brief wrote against the wrong answers; each leaves a real question for BOB.

### 1. Root cause with evidence

**Bounds (D5).**
- The plane's `GET /version` is a plain text version string by design (`control-plane/index.mjs:968-970`: "Which version is this? A plain GET, no token ... "). No requirement says the plane's `/version` carries bounds.
- The requirement is the scanner's: `file-scanner` R8 `GET /version` answers `{... renderer_version, bounds}` and R16 lists the limits `bounds` carries. It is met in the scanner (`file-scanner/src/handler.mjs:28`, `bounds: BOUNDS`; `limits.mjs`; asserted in `file-scanner/test/worker.test.mjs`). The scanner is reachable only through the service binding.
- The only plane op that relays that answer is `scanstatus` (`file-safety/index.mjs:1421-1445`, admin): it passes `version`, `clamav_version`, `signatures`, `renderer_version`, and **not `bounds`**. So the scanner's and the renderer's limits are published and cannot be read by anyone outside the binding, including a walker.
- `cpu_ms` (D5's other half) is FIXED (`plane` R99).

**Counts (D6).**
- `extraction` `migrateRepairs`/`migrateReadings` (R105) return counts (`examined`, `registered`, `existed`, `shapes: {first_range, cut_units, pages_unread, stated_bare}`); the provenance repair (`provenance` R79, `repairParts`) answers "the rows moved and the rows left".
- The wake runs them and **discards the answers**: `extraction/index.mjs:2408-2411` `await drain(() => this.migrateRepairs()).catch(() => null)` keeps only `done`/`examined` to decide when to stop. No op answers them (searched: `migrateRepairs`/`migrateReadings`/`repairParts` are called nowhere but these wake paths). `op=selftest` and `owedwork` carry the register and text counts, as the walker found. `extraction` R105 says the migration is "counted", and "BOB schedules the live run"; neither says where a count is read.

### 2. Why the tests missed it

`file-scanner/test/worker.test.mjs` asserts `/version` carries `bounds` at the scanner. The extraction and provenance tests assert the counts on the function's own answer. No test asks the question the walker asked ("can I read it from outside").

### 3. Failing-first test

Only if BOB rules the figures must be readable from outside:
- **file-safety**, `test/m/file-safety/r10-scanstatus-bounds.test.mjs`: the module's scanner stub answers `/version` with `bounds` (the real `BOUNDS` imported from `file-scanner/src/limits.mjs`); `scanStatus({viewer: admin})` answers `scanner.bounds` and `renderer.bounds` equal to it. **Seen red:** by code read (the answer is built without `bounds` at `:1433-1436`); not run.
- **extraction**, `test/m/extraction/r10-migration-counts.test.mjs`: after the wake's migration run, a read-only answer (`selftest`'s block) holds the counts per migration; the run's answers are kept in the `reading_migrations` row (R66), not discarded. **Seen red:** by code read.

### 4. Platform check

The scanner is a container worker with a service binding: the check is `GET /version` on the bound scanner on biosmoke8 (read with an administrator's `scanstatus` once relayed). Miniflare cannot run the container image.

### 5. Owner and words

**Owners: file-safety** (relay `bounds` in `scanstatus`) and **extraction** (keep the counts); two owners because two modules hold two figures. Words: none; these are administrator figures. **For BOB (decision, small):** must a walker or an administrator be able to read the scanner's limits and the migrations' counts without the Cloudflare console? Recommendation: yes, because both walks (D5, D6) were written to check them and could not; the cheapest shape is `scanstatus.bounds` and a `migrations` block in `selftest`. If no, the brief's D5/D6 rows are corrected to say these are read in the code and the scanner's own tests.

---

# Appendix: the repro helper

Kept outside the repository (scratchpad `diag/`), printed here so a job can rebuild it. Run from `bio-plane/`: `node --import ./test/platform-sqlite.mjs <script>`. Each case is `probe(label, bytes, name, type)`: upload by the real `captureupload`, promote by the screen's `promoteDocument`, wait for `op=reading` to settle, print the reading's fields and the Document page's text.

```js
// the plane + the real OCR member, as screens-inquiry/r9-refusal.test.mjs boots them
const mf = new Miniflare({ workers: [{ name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }], compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"], serviceBindings: { OCR_WORKER: "ocr-worker" },
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "...", PROBE_TOKEN: "...", VERSION: "4.6.0", INSTANCE_NAME: "diag-town",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" } }, ocrWorkerDef()] });
// claim + login as the founder, then:
const u = await upload(bytes, name, type);                       // /api/?op=captureupload&statement=diag&name=..&type=..
const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: u.document, title: name, locator: u.document.locator, project: "" });
const page = await boot({ screens: SCREENS, plane: forwarded, path: "/app/document/" + filed.bundleId });   // forwarded = every OPS op to the real door
// wait for [data-text-state], read main(page).textContent; ops: reading, readheld, heldcaptures, capturegrade, threatof
```

The generator recipes used (all from `bio-plane/test/`): `imggen` `{kind:"png"|"gif"|"tiff"|"bmp", seed, size:{lines:3}}`, `degrade:{turn:90}`, `size:{bytes:1048577}`; `pdfgen` `{kind:"pdf", seed, size:{pages:5}, encryption:{method:"aes", user:"walkpw"}}`, `truncate:0.7`, `size:{bytes:25165825}`; `sheetgen` `{kind:"ods", size:{rows:45000, cols:6}}`, `{kind:"csv", size:{rows:1048576, cols:1}}`; `makeZip([{name:"m1.txt", data}, ...])`; a hand-zipped DOCX (`[Content_Types].xml`, `_rels/.rels`, `word/document.xml` with 300,000 `<w:p><w:r><w:t>a</w:t></w:r></w:p>`); text bytes as `y.doc`.

One shape the helper does not cover: the Add screen (R5, R36) was driven with `fill(p, {"ci-file": new File([bytes], name, {type})})` and `press(p, "captureupload")`, then `p.clock.tick(21000)` between real waits so `watchReading` runs on the page's fake clock.
