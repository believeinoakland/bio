# CORPUS #1 · T51 · the corpus R set's runner and the cases of K4426's "Still MISSING" rows 1, 2 and 6

**Status** · written by CORPUS #1 (started by BOB #284, K5009), branch `prep/corpus-1`, cut from `origin/tranche/T51` at `ebb82762a1`. Test files only; nothing under `bio-plane/src/**` was changed. Every number and line below is pasted from a run in this session; the logs were in `/tmp` and are not committed. **Result:** the corpus R runner exists and passes (65 of 65). Row 2 (G124f) is built, red then green for its fix cases. Row 1 (G123f) is built on Miniflare, red then green. Row 6 (G128i) is built as five cases: **four red then green; L26 green on the tip with its red NOT obtained** (§5). **One product finding is open (F1)**, with one observation (O1) and two limits of the harness (O2, O3). One command was refused; it was not worked around (§6).

How the "red" trees were made: a separate `git worktree` (outside `/home/user/bio`, never pushed) at the tip, with the module's `src` checked out as of the fix's parent commit (`git checkout <parent> -- bio-plane/src/<module>`). Where the whole parent tree would not load against the tip's other modules, the exception is named in the case. Each case's commit parent is named in its section.

| step | what | commit |
|---|---|---|
| 1 | corpus R runner and cases | `7788479a1a` |
| 2 | G124f ladder (Row 2) | `f1f7884b50` |
| 4 (Row 1) | G123f on workerd | `b658beab87` |
| 3 (Row 6) | G128i L26 / L8 + over-24 MiB / C30 + 504 | `81a66f656c`, `6cbe568a8c`, `879025dc52` |

## 1. The corpus R set (step 1)

- **Files:** `bio-plane/test/m/plane/corpus-r.test.mjs` (the runner) and `corpus-r-cases.mjs` (the cases: recipes, seeds, the judge). Run: `node --import ./test/platform-sqlite.mjs --test test/m/plane/corpus-r.test.mjs` from `bio-plane/`; `CORPUS_R_ONLY=pdf,sheet@3` narrows it; `BIO_TRANCHE_COMMIT=<sha>` fixes the derived seeds; `BIO_FIXTURE_CACHE=<dir>` keeps the generated files.
- **What it is:** `pdfgen`, `imggen`, `sheetgen`, `docgen` (test-support) through `shape/harness.mjs` (`shapeRun`), 16 seeded variations: 8 fixed seeds (`corpus-r-1` to `corpus-r-8`) and 8 derived from the tranche commit (`d<i>-` plus ten hex digits of `sha256("<commit>:<i>")`; the commit is `BIO_TRANCHE_COMMIT`, else the merge base of HEAD with `origin/tranche/T51`, here `ebb82762a1`). 4 generators x 16 = 64 cases, one child process each, one at a time. A recipe's shape (sizes, fonts, structure, kind, rows) is a pure function of the seed.
- **Each case asserts** (`judge`): the child lived, and the reading is READ WHOLE (completeness `whole`, `read_through` equal to `total`, nothing owed) or REFUSED with its numeric size over its numeric limit. A picture alone may instead pass as STATED with a reason and no unit (O2).
- **Run:** `ℹ tests 65 / ℹ pass 65 / ℹ fail 0` (the 64 cases and a test that there are 16 variations, 8 and 8). Outcomes: 48 whole (pdf 16, sheet 16, doc 16), 16 stated (every image case).
  ```
  ✔ CORPUS R: 16 seeded variations, 8 fixed and 8 derived from the tranche commit
  ✔ CORPUS R pdf@15 (derived seed d7-52b8b510c0, commit ebb82762a1): pdf pdf is read whole within its bound or refused with its size and limit
  ```
- **Built-in limits that the first runs found** (kept in the file's comments): a BMP is written in RGB alone and a GIF in P (imggen); a 300 dpi RGB page is 25 MB, over the whole-read ceiling, so pictures are drawn at 100 or 150 dpi; tier 1 decodes a PDF text only through a ToUnicode map, so the corpus PDFs use `type0` (O2).

## 2. Row 2 · G124f · SHEET C03-C08 and X05 (step 2)

- **File:** `bio-plane/test/m/plane/g124f-bounds.test.mjs`, with `shape/exact-gen.mjs` (an XLSX or ODS whose declared uncompressed text part is exactly N bytes, or whose file is exactly N bytes; verified against `readContainer` + `declaredTextBytes`: the totals equal N to the byte) and `shape/reading-judge.mjs` (`whole`, `refused`, shared with G128i). Figures are read from `READ_BOUNDS` with `boundOf`: `xlsx.declared_text` 33,554,432, `ods.content_xml` 20,971,520, `pdf.bytes` 25,165,824.
- **Mapping, stated once:** C03 = bound minus 2, C04 = the bound, C05 = bound plus 1 (refused, with size equal to the file's figure, limit equal to the table's, a sentence holding both figures, and not "undecodable"), each for the three heavy bounds (an XLSX's declared text, an ODS's declared content.xml, the entry's whole-read ceiling in file bytes); C06 = a 30,000,000 B XLSX of 1,048,576 rows; C07 and C08 = 1,048,576 and 1,048,577 rows in one narrow column (no row or cell references: the only way such a sheet stays under the declared-text bound); C07r and C08r = the same rows with references (refused for their declared bytes); X05 = a 33 MiB declared XLSX. The light kinds' ladder at the standard is G131i's and is not here.
- **The fix it proves:** reading-pipeline R54, commit `766b12a281` (G135d: a size refusal holds its figures). Red tree: `reading-pipeline` as of `1c6e964f6f`.
- **Red on `reading-pipeline` @ `1c6e964f6f`** (`/tmp/g124f-red2.log`, 16 tests, 8 pass, 8 fail; the fix cases):
  ```
  ✖ G124f SHEET C05 xlsx declared text: 33554432 + 1 is refused with its size and its limit
    AssertionError: C05 xlsx declared text: not refused; it said: the text of this document was not read: it is 32.00 MiB of text against the 32.00 MiB that is read | ... (state stated, read_through 0/0)
  ✖ G124f SHEET C05 ods declared content.xml: 20971520 + 1 is refused with its size and its limit
    AssertionError: C05 ods declared content.xml: not refused; it said: the text of this document was not read: it is 20.00 MiB of text against the 20.00 MiB that is read | ...
  ✖ G124f SHEET X05: a 33 MiB declared XLSX is refused with its size and limit, never worded 'undecodable' (S-8)
    AssertionError: X05: not refused; it said: the text of this document was not read: it is 33.00 MiB of text against the 32.00 MiB that is read | ...
  ✖ G124f SHEET C07r ... AssertionError: C07r: not refused; it said: ... it is 53.82 MiB of text against the 32.00 MiB that is read
  ```
  (C08r the same; C03, C04 and the entry-file-bytes ladder are green on both trees: the whole reads and the file-bytes refusal were right before the fix.)
- **Green on the tip** (`/tmp/g124f-tip.log`, the 13 tests of that run; the C07r/C08r/F1 tests were added after, `/tmp/g124f-tip2.log`: C07r, C08r green):
  ```
  ✔ G124f SHEET C03 xlsx declared text: 33554432 - 2 is read whole
  ✔ G124f SHEET C04 xlsx declared text: the bound 33554432 itself is read whole
  ✔ G124f SHEET C05 xlsx declared text: 33554432 + 1 is refused with its size and its limit
  ✔ G124f SHEET C03/C04/C05 ods declared content.xml: 20971518 / 20971520 / 20971521
  ✔ G124f SHEET C03/C04/C05 entry file bytes: 25165822 / 25165824 / 25165825
  ✔ G124f SHEET C06: a 30,000,000 B XLSX of 1,048,576 narrow rows is refused with its size and the entry's limit
  ✔ G124f SHEET C07r / C08r: ... refused with its declared size and the xlsx limit
  ✔ G124f SHEET X05: a 33 MiB declared XLSX is refused with its size and limit, never worded 'undecodable' (S-8)
  ```
- **Red on the tip: C07, C08 and the F1 repro: PRODUCT FINDING F1** (§4).
- A last full run of the file on the tip was started after the judge was shared with G128i (a refactor of the test file); its summary is in §7.

## 3. Row 1 · G123f · a cited cell range read across a block edge, and an over-bound range, on workerd (step 4)

- **File:** `bio-plane/test/m/plane/g123f-workerd.test.mjs`. Miniflare (workerd) with the real Durable Object SQLite and the real R2 binding; the isolate's object `Probe extends Store` (the plane's real class, every module real), with one added route that feeds a 3 MiB CSV held in R2 as the shape harness's held feed does, drives the ledger's alarm tick by tick, then reads, equal to the generator's cells cell for cell: `extraction.cellsOf` of the last row; a block-edge range CITED (`content.contentMint`, `content.cellsAt`) whole; an over-bound range (`CELLS_RANGE_MAX` 20,000 cells) cited: `cells_truncated` with a `next_row` that is the first row not delivered, then read on with `{fromRow}` to the range's end; then `tabledeclare` of the document and of the over-bound cited range. The existing node-child test `g123f-cells.test.mjs` (commit `7ec0003572`) is unchanged and green (3 tests, 30 s); this is the workerd run K4426 row 1 asks for.
- **The fix it proves:** content R52 `cellsAt(id, {fromRow})`, commit `33389d4792`, and calculations R1 (reads on by `next_row`, no fault), commit `b437e53119`. Red tree: `content` as of `33389d4792^` and `calculations` as of `b437e53119^`.
- **Red** (`/tmp/g123f-wd-red.log`):
  ```
  ✖ G123f on workerd: a CSV's last row, a cited block-edge range and a cited over-bound range read on by next_row equal the generator's, and the table is declared from the over-bound range (38543 ms)
    AssertionError: over-bound range: {"from":1,"to":10010,"calls":[{"from":null,"cells":20000,"lastRow":5000,"truncated":true,"next_row":5001,"wrong":null},{"from":5001,"cells":20000,"lastRow":5000,"truncated":true,"next_row":5001,"wrong":null}],"wrong":{"advance":"next_row 5001 did not advance past 5001"}}
  ```
- **Green on the tip** (`/tmp/g123f-wd-tip.log`, 43 s): `ticks 2`, state `whole` (23 blocks, edge at row 28,782, last row 53,174); last row `wrong: null`; edge range 28,780-28,785 `wrong: null, truncated: false`; over-bound range 1-10,010 in three calls (`5000 truncated next_row 5001`, `5001-10000 truncated next_row 10001`, `10001-10010 not truncated`), `wrong: null`; `declare_document` ok, 53,173 rows; `declare_bound_range` ok, 10,009 rows.
  ```
  ✔ G123f on workerd: a CSV's last row, a cited block-edge range and a cited over-bound range read on by next_row equal the generator's, and the table is declared from the over-bound range (43322.588385ms)
  ```
- **Not judged here:** workerd under Miniflare enforces no 128 MB, so the isolate's memory is the shape harness's to judge, as before.

## 4. Row 6 · G128i · the five audit rows

Where the case lives: `bio-plane/test/m/plane/g128i-*.test.mjs`, built from the real parts wherever the row is a statement the member reads (a real service answer drawn by the real screen), so nothing the screen draws is scripted.

### L26 · photo OCR read 59 of 234 words with no note · `g128i-l26-photo.test.mjs`
- **Truth the case names (ocr-worker R24, R25):** a photograph is read through the member's real path (the committed engine, the real picture renderer, the member's handler); what the member states is true and never silent: `legibility.share` within a tenth of the share truly read and never over it (the walk's five photographs, the member's own pins), a note whenever the share truly read is under 0.8 (also on three `imggen` photographs: 110 dpi, 18 lines, a tilt, shade and noise), a refusal `PICTURE_NOT_LEGIBLE` with its figures and no text under 0.2.
- **Green on the tip, 8 of 8:**
  ```
  page-hard: 231 words, truly read 56 %, answer ok true, stated share 0.51, notes 2
  page-hard-blur: 231 words, truly read 0 %, answer ok false, NO legibility stated, notes 2, PICTURE_NOT_LEGIBLE
  generated l26a: 72 words, truly read 42 %, answer ok true, stated share 0.63, notes 1
  generated l26b: 72 words, truly read 25 %, answer ok true, stated share 0.48, notes 1
  generated l26c: 72 words, truly read 31 %, answer ok true, stated share 0.28, notes 1
  ```
- **The fix it proves:** ocr-worker/pdf-worker C18 (R25 legibility), commit `8b2c01760e`; the preparation that lifted `page-hard` is pdf-pixels R44, `87962561f7`.
- **RED NOT OBTAINED.** The first red tree (`ocr-worker/src` and `pdf-worker/src` checked out as of `8b2c01760e^` over the tip) did not load: `SyntaxError: The requested module './contract.mjs' does not provide an export named 'QUARTER_TURNS'`, because the tip's files that did not exist then (`frame.mjs`) stayed beside the old `contract.mjs`. The command that cleared the two directories and checked them out again was refused (§6). The test, as committed, imports `frame.mjs` and `tesslib.mjs` statically, so it also cannot load on a clean old tree: it needs the older engine adapter (the vendor package, which the old ocr-worker test used). **What closes it:** a clean worktree at `8b2c01760e^` and the old-engine adapter in the test; BOB's decision (§6).

### L8 · the frontier says "looked everywhere" with 34 of 59 documents unread · `g128i-l8-frontier.test.mjs`
- **Built from:** 59 documents filed in retrieval's real fixture world (the real record, promotion, extraction and observation-log over SQLite), 25 whose extraction was whole and 34 partial; the real `frontier` answer for the content level; drawn by the real Finder screen (screens-daily).
- **The fix it proves:** screens-daily fix round 6 (G16, S4), commit `883464cfb2`. Red tree: `screens-daily` as of `883464cfb2^`.
- **Red:**
  ```
  G128i L8 real frontier tally: {"PRESENT":25,"partial":34} looked 59 never_looked_count 0
  ✖ G128i L8: 59 documents, 34 read in part: the real frontier tallies the partial looks and the Finder does not say somebody has looked everywhere
    AssertionError: the partial look is told
  ✔ G128i L8 control: 59 documents every one read whole: the Finder draws 'somebody has looked everywhere'
  ```
- **Green on the tip:** `ℹ tests 2 / pass 2 / fail 0`; the partial look is told with its count (34), "somebody has looked everywhere" is not drawn; the control draws it.

### C30 · cite on an already-cited document does nothing visible · `g128i-c30-cite.test.mjs`
- **Built from:** the real `citation` service cites a document to a question, then again; the second real answer (`ok`, `cited: []`, `alreadyCited: [the document]`, nothing written; asserted) is what the plane gives the real Document screen (screens-inquiry on interface-shell's served page).
- **The fix it proves:** screens-inquiry fix round 2, commit `bd12af276a` (the page draws what a cite did). Red tree: `screens-inquiry` as of `bd12af276a^`.
- **Red** (`/tmp/g128i-c30-red.log`, 0 of 2):
  ```
  ✖ G128i C30: the real second cite of the same document answers ok, cited nothing, alreadyCited it; the page says the question already cited it, at which passage, and links the question
    AssertionError: the page draws what the cite did: nothing was left unsaid
  ✖ G128i C30 control: the real first cite answers cited; the page says it is cited, not 'left as it was'
  ```
- **Green on the tip:** `ℹ tests 2 / pass 2 / fail 0`.

### The over-25,165,824-byte statement · `g128i-over-24mib.test.mjs`
- **Truth:** the alpha's whole-read ceiling is `boundOf("pdf","bytes")` = 25,165,824 for the heavy kinds; the light kinds take the standard (K4834), `boundOf("text","bytes")` and `boundOf("csv","bytes")` = 52,428,800. Through the shape runner: a text and a CSV of 25,165,825 B are READ WHOLE and their last line / last row found (round 7's A.md:12 "24 bytes over ... so it was not read"); a PDF of 25,165,825 B is refused with size 25,165,825 and limit 25,165,824, nothing owed; a text of the text tier plus one is refused with its size and limit.
- **The fix it proves:** reading-pipeline R50, commit `4c8e0ad375` (G131i); the PDF sentence is R54. Red tree: `reading-pipeline` as of `1c6e964f6f` (before both).
- **Red** (`/tmp/g128i-over-red.log`): two of four fail, as they must:
  ```
  ✖ ... a text one byte over the whole-read ceiling is under the text tier, so it is read whole ...
    AssertionError: text over 24 MiB: refused {"reason":"TOO_LARGE","size":25165825,"bound":25165824}: the capture is 25165825 bytes in 4 parts, over the 25165824 B a format entry is handed here, so it was not read
  ✖ ... a text one byte over the text tier is stated with its size and its limit
    AssertionError: text over its tier: the refusal's limit 25165824, the table's 52428800
  ```
  (the CSV and PDF cases are green on that tree: the CSV range read (K4868) and the PDF's figures predate it.)
- **Green on the tip:** `ℹ tests 4 / pass 4 / fail 0` (the text case 41 s).

### The 504 · "kept nothing" when it kept it · `g128i-504-kept.test.mjs`
- **Built from:** the member's own press through the real acquisition (a 9 MiB source declaring its length: parked and owed), the real `openCaptures` for `member:m1` (the door's form), and the real Add screen (screens-intake) polled as the walk polled it (4 s five times, 20 s).
- **The fix it proves:** acquisition fix round 8, R110 (G103, G104), commit `b2336f3544`. **Red tree, an exception:** the whole parent tree does not load against the tip (`SyntaxError: ... '../acquisition/index.mjs' does not provide an export named 'readRange'`, a later module's import), so the red tree is the tip with the one line of R110 that matches the member reversed to the old comparison (`st.opened_by !== by`); a reverse patch of the whole commit conflicted.
- **Red:**
  ```
  G128i 504 real listing for member:m1: []
  ✖ G128i 504: a kept, owed capture is listed for the member who pressed it, and the Add screen still says it is being fetched after the walk's 18 seconds, never 'nothing was kept'
    AssertionError: the kept capture is listed for the member, in the door's form
  ✔ G128i 504 control: a session that truly left the list with no copy three asks in a row is the failure the screen may state
  ```
- **Green on the tip:** `G128i 504 real listing for member:m1: [{"session":"fp_...","outstanding":1,"fetch_pending":"LARGE_DECLARED"}]`; `ℹ tests 2 / pass 2 / fail 0`.

## 5. Product findings and observations

### F1 (PRODUCT FINDING) · a workbook whose rows and cells carry no `r` is read as an empty reading
- **Where red:** `g124f-bounds.test.mjs`: C07, C08 and the minimal repro "G124f finding F1" (1,000 narrow rows); red on the tip and on the old tree alike. C07 `AssertionError: C07: {"state":"none","counts":{"offered":0,"written":0,...}}`.
- **K4426's four fields.**
  1. **Root cause:** `bio-plane/src/formats-xlsx.mjs:764` advances `usedRows` only for a row with an integer `r` (`if (Number.isInteger(row.r) && row.r > usedRows) usedRows = row.r;`), and `usedCols` (`:765-768`) is read from `a1Col(c.cell)`, which is null for a cell with no `r`; so the sheet's `range: usedSheetRange(sheet.name, walked.usedRows, walked.usedCols)` (`:1325`) is NULL (FW-19: "the sheet as a `sheet-range` unit, or NULL"), no `sheet-range` unit is made, and the reading-pipeline's sheet blocks (`reading-pipeline/index.mjs:973-978` reads `sheets[].range`) are none: 0 units, completeness `none`, "recorded as an empty reading". The entry itself reads such a file (`xlsxEntry.text()` on test-support's `no-r` workbook: 19,053 characters, 2,000 cells); the numbering exists at `:1262` and `:1439` (`lastRow + 1`) and is not used for the used range. The format allows both attributes to be absent (they are optional); test-support's `sheetgen` writes such a workbook as its hostile case `no-r`.
  2. **Why the tests missed it:** the reader's tests of `no-r` are at the entry (`text()`), not through the reading; and a file of one narrow column of 1,048,576 rows can stay under the 32 MiB declared-text bound only without references (with them it is 53.82 MiB), so the case is built only by a generator that omits them.
  3. **Failing-first test:** `G124f finding F1` (red on the tip: `completeness none`, 0 units), C07 and C08. No green exists; the fix is not made.
  4. **Platform check:** the shape harness (node child under the platform's value limit and the one cap convention); not run on workerd. A 1,000-row file is 11.5 KB, so the cap is not in question.
- **Effect for the member:** a valid, small workbook is stated nowhere: the Document screen shows an empty reading and no refusal, a silent total loss (S2's kind). Not a bound.

### O1 (observation, not red) · the OCR member's stated legibility is the engine's rating, above the share truly read on generated photographs
- On `imggen` photographs `legibility.share` was 0.63 where 0.42 was truly read, and 0.48 where 0.25: over what was read by 0.21 and 0.23 (the member's pins on its five real photographs hold within a tenth). R25 defines the share as the engine's own rating (confident words over words), the sentence says "the engine rated", and a note is stated under 0.8 in every case, so the requirement holds and L26 (no note) is not repeated. Whether the engine's rating is calibrated on a page set in a built-in bitmap font is a measurement for BOB, not a defect shown here; the case judges the statement and prints the distance.

### O2 (a limit of the harness) · what the shape harness cannot read whole
- It stands up no pdf-worker member and no OCR member: a PDF whose fonts have no ToUnicode map (`winansi`, `macroman`, `differences`, `type0-nounicode`, `type3`) reads "stated: tier 1 read essentially nothing ... no pdf-worker member is set up" (checked with `extractPdfStructure` on all six fonts: only `type0` gives text); a PNG reads "stated: no OCR engine is installed"; TIFF, GIF and BMP read "stated: ... is not read yet" (`UNSUPPORTED_FORMAT`, size and bound null). So the corpus R PDFs use `type0` and the 16 image cases pass as stated. A corpus over the other fonts and the scans needs the members stood up in the harness (the OCR path runs in the member's own tests and in the `g128i-l26` case above, which uses the real engine).

### O3 (a limit of the red runs)
- The red tree of a case is the module's `src` as of the fix's parent over the tip; where that tree does not load (the L26 and 504 cases) the case says so. Two commits were checked for order: reading-pipeline R54 (`766b12a281`) precedes R50 (`4c8e0ad375`), so `1c6e964f6f` is red for both.

## 6. Refused command, rule slips, and what BOB decides

- **A command was refused and not worked around.** The compound command that rewrote `g128i-l26-photo.test.mjs` (to load on an old tree), copied it into the red worktree `/home/user/red-l26`, then removed `ocr-worker/src` and `pdf-worker/src` there and checked them out again at `8b2c01760e^` was denied by the permission check. I did not retry it in any form, and I did not build the old tree some other way (a fresh worktree at `8b2c01760e^`, or a hunk reversal as for the 504). **L26's red is therefore not obtained** (§4). BOB decides: allow the clean old-tree worktree and the old-engine adapter, or accept L26 green-only.
- **Slips against the run rules, none with effect on a result:** one foreground `sleep 1` (at the start, to see a run begin) and a `sleep 0` in an output read; two long runs started with a shell `&` instead of as tracked background tasks (the first G123f node test, killed at once and restarted tracked; the last full run of `g124f-bounds.test.mjs` on the tip, §7); at most two test processes ran at once throughout, except that last untracked run.
- **Commit trailers:** the task text names `Co-Authored-By: Claude Opus 5.5` and `Claude-Session: .../session_01RLobC6fNNmfG9HpTbZ9dyT`. This session's own attribution instruction (from the harness that runs it) names `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01AVRuFjkuHhtqE4gvcwoNW3`, and the two disagree; I followed the harness's, so every commit here carries those two lines. BOB can have the messages rewritten if the other pair is wanted (the branch is mine alone and unmerged, but I will not rewrite it myself: never force-push).
- **Worktrees left outside the repository** (`/home/user/red-g124f`, `-g123f`, `-l26`, `-l8`, `-c30`, `-504`): scratch, never pushed, removable with `git worktree remove --force`.

## 7. Last runs on the tip (`prep/corpus-1` after the last test commit, `879025dc52`)

| file | tests | pass | fail |
|---|---|---|---|
| `corpus-r.test.mjs` (run before the later commits; the tests it imports did not change) | 65 | 65 | 0 |
| `g124f-bounds.test.mjs` (final full run, after the judge was shared) | 16 | 13 | 3: C07, C08, F1 (all F1) |
| `g123f-workerd.test.mjs` | 1 | 1 | 0 |
| `g128i-l26-photo.test.mjs` | 8 | 8 | 0 |
| `g128i-l8-frontier.test.mjs` | 2 | 2 | 0 |
| `g128i-over-24mib.test.mjs` | 4 | 4 | 0 |
| `g128i-c30-cite.test.mjs` | 2 | 2 | 0 |
| `g128i-504-kept.test.mjs` | 2 | 2 | 0 |
| `g123f-cells.test.mjs` (existing, node child) | 3 | 3 | 0 |

Red-then-green is shown for G124f (C05 xlsx, C05 ods, C07r, C08r, X05), G123f on workerd, L8, C30, the over-24 MiB text cases and the 504; not for L26 (§4, §6). The 64 corpus R cases need no red: they are the set a round end runs, and a red there becomes a cause of the round (P10).
