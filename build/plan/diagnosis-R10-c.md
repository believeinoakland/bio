# Diagnosis of re-walk 9's causes, groups G4 and G6 (fix round 10 of T51; K5047)

**Status** · COMPLETE. DIAG-R10-C #1 (study session, depth 2, for BOB #287), on `prep/diag-r10-c`. Written for `build/plan/fix-round-10-T51.md` §1, causes R19-R23 (G4) and R29-R34 (G6), by `build/plan/diag-R10-BRIEF.md`. No product code and no test was changed; every red below was seen on a scratch test or script run in-process and then removed (their text is in each cause). Records read whole: `walk-T51-rewalk9/B.md` (G4) and `E.md` (R30-R34); `A.md` rows A11 and N4 (R29).

**Summary for BOB** (the owner column is K4427's one job per cause):

| Cause | Root | Seen red in-process | Owner | BOB's? |
|---|---|---|---|---|
| R19 ODS table cut at commas | `calculations/index.mjs:693` (`declareTable`): a tied delimiter decision (comma and tab both "consistent") falls back to comma | yes | calculations | no |
| R20 CSV with ragged rows one column | `csv-reader/index.mjs:393-402`: a delimiter is "consistent" only when one exact count holds on over half the lines | yes | csv-reader | requirement R7 wording |
| R21 bounds not refused at their figure | three different things: (a) 50,000,001 B is right to read (the bound is 50 MiB), (b) xlsx has no columns refusal (a gap), (c) the walker's recipe cannot reach the cells bound | (b) read; (a), (c) shown by the tables | office-readers for (b); brief for (a), (c) | requirement for (b) |
| R22 cited range read back with the header | `content/notice.mjs:heldTextAt` unit arm returns a block's text with its repeated head | yes (real extraction) | content | no |
| R23 CSV citation carries `undefined` range | `basis-versions/shared.mjs:11-20` `EXTENT_FIELDS` has no `extent_range` (nor `extent_table`, `extent_part`, `extent_cited_as`) | yes, the walker's sentence | basis-versions | no |
| R29 founder's parted upload `CLASS_FORBIDDEN` | `capture/index.mjs:3908-3919` the four parted ops declare `classes: ["member"]`; the one-request upload declares `["admin","member"]` | read (the door's own check, no run) | capture | no |
| R30 own reading on two parts refused, no tick | two roots: `screens-inquiry/question.mjs:1490-1507` labels every "No, my answer falls" passage as its own independently sufficient ground; the conclude form draws no ticks | yes (the mapping) | screens-inquiry | **yes: R23 of screens-inquiry is wrong against DEC-32** |
| R31 severed citation leaves its ground | `case-catalogue/checks.mjs:~395-405` reads `fm.basis` labels with severed legs; `strength` drops them | yes | case-catalogue | no (two follow-on defects named, not placed) |
| R32 sign dialog below 900 px | the design's `.mk-scrim` rule: no scroll, no height bound (`page.src.html:299`, carried to `shell.css`) | yes (Chromium, 1280x900) | UX-DESIGN (then interface-assets regenerates) | the design's |
| R33 Held cut at 50 | `screens-intake/held.mjs:9-17` reads `limit: 50`, never `after`; `v.truncated` only draws the sentence | read; its test pins the cut | screens-intake | requirement R4 silent on paging and on who is listed |
| R34 member's session ended in the browser | not a defect of code: the shared-device idle end, 15 minutes (`credentials/index.mjs:104, 541-542`; page clock `browser.mjs:1700-1717`) | read | none (walker's method) | the plain sign-in on first load says nothing of it (minor, screens-entry) |

Words: where a sentence a member reads is named below, the key drawn and whether the defect is the key chosen (a module's) or the sentence itself (the design's) is said in that cause.

---

## R19 (G4): an ODS declared as a table is cut at its commas (B2e, NEW-1)

**Root cause.** `bio-plane/src/calculations/index.mjs`, `declareTable`, the text branch (the lines after `const src = await this.#sourceRows(row, names)`):

```
const sig = delimiterSignature(delimiterWindow(src.text));
const delimiter = sig.delimiter || ",";
const sc = scanCsv(src.text, ..., delimiter);
```

For a `document` extent of an ODS (not a CSV container, so `#sourceRows` returns `passageText`, whose lines are the sheet's cells joined with a TAB, `index.mjs:599-611`), the delimiter is *decided by guess* from the text's head. `csv-reader/index.mjs:393-418` (`decideDelimiter`, from `:376`) calls a candidate "consistent" when one exact count of it holds on over half the lines. The walker's recipe (`sheetgen` ods, 28,500 rows x 6, `types` default, the `currency` column writing `$69,268.31`) puts exactly one comma on every line and exactly five tabs on every line, so both are consistent: `consistent.length > 1` returns `delimiter: null, undetermined: "delimiter_undetermined_tied"` (`:411-415`), and `declareTable` turns that into `","`. The header line (no comma) then becomes one cell, and each row splits at the thousands comma: exactly row 0 `["garcon_1\tZurich_2\t...","","","","",""]` and row 1 `["rw9-B-2a-R2-C1\t78592\t7850.33\tcafe-r1c4\t2018-01-28\t$69","268.31","","","",""]` as seen. The CSV and TSV twins (B1) pass because their container is `csv` and R44 reads the stored bytes with the file's own dialect (`#isCsv`), never this branch. R45's comment ("the delimiter is the document's own reader's") is true only of a text that is a CSV; here the text is the reader's *own* tab join and its delimiter is *known*, not to be guessed.

I ran the decision on that text (scratch script, not committed): `{"delimiter":null,"confidence":"none","undetermined":"delimiter_undetermined_tied","tied":["comma","tab"]}`. The same text with a comma in only half the rows decides `tab` (certain), which is why a small hand sample does not show it.

**Why the tests missed it.** `test/m/calculations/r9-cells.test.mjs:62-87` (`lined(w, rows, sep)`, R45) builds the "document whose text is lines" by hand with `BODY` cells that hold no comma (`P100`, `P002`, ...); the comma twin and the tab twin both decide their own delimiter correctly. No test has a tab-joined line with a comma inside a cell, which is what every currency or thousands figure of a real sheet is. The ODS itself is never declared as a table in a module test (R45's test list names the CSV, the range and the lined text).

**Failing-first test** (module `calculations`, new file beside `r9-cells.test.mjs`, uses its `seeded`, `V` and the `lined` helper copied from there; it goes through `declareTable` and `readTable`, the real entry path of `op=tabledeclare` and `op=table`): 

```js
const F = [{name:"payer",type:"string"},{name:"payee",type:"string"},{name:"amount",type:"string"}];
const body = [["P1","Q1","$69,268.31"],["P2","Q2","$1,204.00"],["P3","Q3","$7,850.33"]];
const t = await w.c.declareTable({ source: lined(w, [HEADER, ...body], "\t"), schema:{fields:F}, header: HEADER, by: V("bob") });
assert.deepEqual((await w.c.readTable({sha:t.sha, viewer:V("bob"), limit:1000})).page.rows, body);
```

**Seen red** (node, `node --test` on that file): row 0 is `['payer\tpayee\tamount','','']`, row 1 `['P1\tQ1\t$69','268.31','']`, as the walker's. A second assertion belongs with it: the same data as an xlsx range or a CSV makes the same table sha (R45's last test) and an ODS document's table sha equals the CSV twin's.

**Platform check.** None needed for the cause (pure code, same in workerd). Re-walk shape: declare the 28,500-row ODS of B2a on the copy and read `op=table` page 0 / 114,035 `undetermined` must fall to the real count of empty cells (0 for this recipe).

**Owner.** `calculations` (one job): when the text is a reading's own tab-joined lines (any non-CSV `document` extent), declare the delimiter known (TAB), do not guess; where it cannot be known, a tied decision is a stated refusal, not a silent comma (the existing "one cell per line" refusal is the model, `index.mjs` right after the scan). Requirement: R45 says the delimiter of a text of lines is "the delimiter signature of R1" (so a guess); that wording is silent on a tie. For BOB: nothing to decide; the module's detail.

---

## R20 (G4): a CSV with a title block and ragged rows is read as one column (B5c)

**Root cause.** `bio-plane/src/csv-reader/index.mjs:393-402`, `decideDelimiter`: a candidate counts only if `bestN * 2 > lines`, where `best` is the single most common *exact* count of that delimiter per line. The walker's file (`header:"title"`, `ragged:true`, `sheetgen.mjs:117-118`: every non-mark row has `cols - (hash % 3)` fields, so 3 widths, none on half the lines; the title (1 field), the blank line and the header add 3 more) has comma counts spread over 2, 3, 4 and so no count holds over 50%: `delimiter_undetermined_none_consistent`, `delimiter:null`, and `walkRecords(text, null)` yields one field per record. I generated the file with the walker's own recipe and read it through the module's entry:

```
generate({kind:"csv", seed:"rw9-B-5c", size:{rows:3000, cols:5}, header:"title", ragged:true})  -> csvEntry.text(bytes)
  -> {"delimiter":null,"undetermined":["delimiter_undetermined_none_consistent"],"usedCols":1,"usedRows":3003}
```

Controls on the same generator: ragged without the title block also gives `usedCols 1`, and the title block without ragged rows gives `delimiter "comma"`, `usedCols 5`. So the title block is not the cause; the ragged rows are. B5b (CR-only, not ragged) and B5d read, as seen.

**Why the tests missed it.** `csv-reader/text.test.mjs:281-287` and `windows.test.mjs:168-178` (R24 "a ragged file with a 5-line title preamble ... still finds its delimiter") use hand-built files in which one row in 17 (`i % 17 === 0`) or one in 50 is ragged, so the exact count `3` holds on 94-98% of lines; the requirement (R7) says "a ragged row, a title block ... do not fail it" and the tests make "a ragged row" literal. `text.test.mjs:285` pins `"a,b\n1,2,3\n"` as undetermined by design ("half the records is not a majority"), the same rule the walker's data meets. The generator's `ragged` option (every row varies, the way government exports do) is used in no csv-reader test.

**Failing-first test** (module `csv-reader`, a new test beside `windows.test.mjs`, entry `csvEntry.text`, no stub): the recipe above through `test/sheetgen.mjs` (`generate`), asserting `dialect.delimiter === "comma"`, `sheets[0].usedCols === 5` and that the last mark `rw9-B-5c-R3003-C1` sits in a cell of column A of a five-field row. Seen red (output above). Also through the plane: `op=reading` on the uploaded file (`dialect`, `usedCols`) and `findin` returns the row with its extent `A3003:E3003` rather than `A3003:A3003`.

**Platform check.** None; pure, and the reader's decision is the same under workerd. On the copy: upload the recipe's file and read `dialect` (must say comma, and `disagree` must not be raised by the title window).

**Owner.** `csv-reader` (one job). Requirement R7 (quoted in the root) defines "consistent" as one exact count on the majority; the requirement as written does not exclude a presence rule, but it also says "by majority of the lines", which the code reads as the same count. A tied or none result then reads as one column, silently. Recommendation to BOB (a detail, BOB's own, K4427): a candidate is consistent when it occurs (count >= 1) on the majority of lines, ties broken by the stronger regularity (the exact modal count), which keeps R7's tied/none sentences for true ties. This also removes R19's cause for a text whose delimiter is known only by guess. The sentence a member reads is not a word-table sentence here (a reading's `dialect` is not drawn; the Document page says nothing of a delimiter), so no key is involved.

---

## R21 (G4): bounds not refused at their figure (B3b, B9a, B9c)

Three symptoms with three different roots; none is a hand-answer, so I give each its own evidence.

**(a) 50,000,001 B CSV read whole (B3b): no defect; the brief's figure is wrong.** `bio-plane/src/read-bounds.mjs:11-13` and `:36-37`: the light kinds' (`csv`) standard is `MB50 = 52428800` bytes (MB counts 2^20, runtime-limits R30, K4840 (1)), and `boundOf("csv","bytes")` returns the standard (`:96-98`, K4834). 50,000,001 B is 2,428,799 B under it. The walker's own B3a/B3b outcomes agree (read whole to 3,977,280 words). Walker's "(If the standard's bound is 50 MiB, not 50 MB, this is the brief's figure)" is the answer: 52,428,801 B is the edge. I did not run the real upload at 52,428,801 B (a platform shape, below); `csv-reader/standard-size.test.mjs` builds the exact 50 MiB bound.

**(b) 16,385 columns xlsx read `partial`, not refused (B9a): a real gap, a requirement silent for xlsx.** `csv-reader` R22 refuses a record of more than 16,384 columns with the count (`csv-reader/index.mjs:205, 797`), and the sheet column ceiling is a table row (`read-bounds.mjs:147`, `sheet.columns`). The xlsx reader has only its grid constant: `formats-xlsx.mjs:440` `XLSX_GRID_COLS = 16384` and `:1446-1447` pushes one `undetermined` entry `reason:"outside_grid"` and goes on (usedCols 16,385, range `A1:XFE1`, the units `truncated`). No requirement in `office-readers.md` or `ooxml.md` says a sheet over 16,384 columns is refused (the only 16,384 mentions are the *address* arm at `office-readers.md:153`); the ODS reader has no columns rule either. Why the tests missed it: no test builds an xlsx wider than the grid; the CSV one (R22) is the only. The walker's "refuse with the count" is the standard's wording (N1267 asks "every type ... read whole, searchable, citable", and a stated limit), not a line of any module's requirement. 

**(c) 250,001 cells refused on bytes (B9c): the module is right; the walker's file cannot reach the cells bound.** `workbooks/index.mjs:253-290`, `addWorkbook` refusals in order: `stored.size > WORKBOOK_FILE_MAX_BYTES` (20 MiB, `read-bounds.mjs:157`) is asked *before* the cell count, by design ("The cheap refusals pay no read"). The walker's 250,001-cell xlsx is 26,931,645 B (`sheetgen` writes its zip stored, not deflated; about 107 B a cell), so its stored size is over 20 MiB before any cell is counted. The module's own test reaches the count with a compressible file: `test/m/workbooks/g137e.test.mjs:53-75` (`S.exact(250001)`; `r.add.cells === 250001`, `bound_cells === 250000`, `limit` equal to `statement("workbook","cells",250001)`). A cell-count refusal cannot be walked with `sheetgen` unless the file is made under 20 MiB (cells of 1-2 characters, or a deflated archive). Not a defect.

**Failing-first test for (b)** (module `office-readers`, a new file beside `test/m/office-readers/` xlsx tests, entry `xlsxEntry.text` and the plane's `op=reading` on the stored file): an xlsx with 16,384 columns reads (control), one with 16,385 is refused whole with `{metric:"columns", size:16385, bound:16384}` in the form of csv-reader R6's marker (the walker's generator: `generate({kind:"xlsx", seed, size:{rows:20, cols:16385}})`). **Not run red**; the read of the code (`:1446-1447`) states it, and B9a's observation is the same shape. The cell-count and 50 MiB+1 edges (a) and (c) need no new module test; they need the *walk* to use 52,428,801 B (a) and a deflated file (c).

**Platform check.** (a) `Miniflare` or the copy: upload 52,428,800 B (read) and 52,428,801 B CSV through the Add screen and read `reading.failure` (`TOO_LARGE`, `size`, `bound`); the first is the standard and the second the first byte over. (b) pure. (c) a deflated 250,001-cell xlsx under 20 MiB through `op=workbookadd` on the copy.

**Owner.** (b) `office-readers` (one job; the xlsx column bound as a `READ_BOUNDS` quote, the same row as csv-reader's; ODS likewise if BOB wants it, a requirement to add). (a) and (c): the brief (already named at fix-round-10 §1, "brief gaps"); nothing to build. Words: the refusal sentence is G1's (R2).

**For BOB.** The requirement for an xlsx/ODS column limit is silent; recommendation: add one line to `office-readers` (and `odf-reader`) mirroring csv-reader R22.

---

## R22 (G4): a cited range read back with the header line prefixed (B10a)

**Root cause.** `bio-plane/src/content/notice.mjs:216-243`, `heldTextAt`, the last arm (`unitAt(extent, held)` then `return { text: u.text, extent: at }`, `:240`). A CSV over the unit cap is held as blocks that each *repeat the header* at their head (extraction/reading-pipeline, content R61). `documentText` (`notice.mjs:187-205`) drops that repeated first line from a *document* extent by `lineRows[0]`; the unit arm used for a `sheet-range` extent that names one block returns the block's `u.text` whole, header included. A `find` hit's extent is the block's own range (B10a: `A16972:E18099`), so `passageText` of the content row minted from it starts with `ordinance_1 etude_2 ...` (the header) and then the cited rows, though the range starts at row 16,972. `content` R61 says "the text of a CSV, an xlsx or an ods sheet is the file's lines once each" for the document extent only.

**Seen red, through the real extraction** (module `content`; the harness of `test/m/content/r9-sheet-real.test.mjs`, which reads the file with `readHeld`, no stub; a scratch copy, run with `node --import ./test/platform-sqlite.mjs --test`): a 3-block CSV (`rowsToSize(3 * CAP)`), mint the second unit's extent (`ext = unitsOf(d).units[1].extent`, a `sheet-range` on `csv`), `content.passageText(content_id)`: its first line is `id\tname\tamount\tnote`, the header, while the extent's range starts at the block's first data row. (Assertion `text.split("\n")[0] !== "id\tname\tamount\tnote"` failed: actual `'id\tname\tamount\tnote'`.) I saved the scratch test at `/tmp/claude-0/-home-user-bio/72097f24-7579-5e4a-a00f-46ff6fb8a6ca/scratchpad/r22-scratch.test.mjs` (not in the repository; it is `r9-sheet-real.test.mjs`'s head plus one test).

**Why the tests missed it.** `r9-sheet-real.test.mjs:53-75` and `r9-units.test.mjs` assert the *document* extent's text (header once); no test reads the text of a *block's own* range extent through `passageText`. Its neighbours (`notice.test.mjs`) use hand-shaped unit lists whose blocks do not repeat the head.

**Failing-first test.** The scratch test above made permanent: module `content`, file `r9-sheet-real.test.mjs` (extra case), asserting (1) the cited range's text begins at its first row and its line count equals the range's row count (`end row - start row + 1`), (2) block 1 (whose range starts at row 1) keeps its header (control), (3) the grade across versions (`gradeAcross`) of such a passage is computed on the same text on both sides (it reads `heldTextAt` too).

**Platform check.** None for the cause. On the copy: B10a again (cite the last-row mark of INFO-2026-0006 and read the passage on the question page: it must begin at `r16971c1`).

**Owner.** `content` (one job): in `heldTextAt`'s unit arm drop a leading line when the unit's `lineRows[0]` is the sheet's first row and the extent does not start there (the same rule as `documentText`). The sentence the member reads is the cited words themselves (the passage), no key.

---

## R23 (G4): a CSV passage's citation carries a sheet-range extent `undefined`, so no conclusion (E1b)

**Root cause.** `bio-plane/src/basis-versions/shared.mjs:11-20`: `EXTENT_FIELDS` (and so `LEG_COPY_KEYS`, which `conclude.mjs:322` and the version-copy arms read) lists `extent_kind, extent_ref, extent_page, extent_rect, extent_sheet, extent_cell, extent_slide, extent_shape, extent_para, extent_run, content_id` and *not* `extent_range`, `extent_table`, `extent_part` or `extent_cited_as`, which the citation (`citation/index.mjs:89-98`, `EXTENT_PARAMS`) and the grammar (`content/extent-core.mjs:128, 170-172`) both carry. A cited CSV passage is a `sheet-range` leg: `extent_kind:"sheet-range"`, `extent_sheet:"csv"`, `extent_range:"A2:E2"`. `concludeOwnReading` copies the question's live legs into the new version through `LEG_COPY_KEYS` (`conclude.mjs:320-323`), so the copy keeps `extent_kind` and loses `extent_range`; the write's check (`content/extent-core.mjs:457`) then reads the extent with `range: undefined` and refuses `CONTENT_EXTENT_UNREADABLE` — the walker's `This one names 'undefined'`. The same field list rejects `narrow` for these fields (`basis-versions/index.mjs:1407`, "this call names ..., which this act does not take") and `extentLegFields` (`:98-103`, `FIELD_OF`) cannot turn a `sheet-range`, `doc-table` or `doc-part` extent back into leg fields. A docx passage (`doc-para`, fields in the list) concluded at once (E1's docx), which is why only the CSV failed. Every machine-composed version has the same loss for a range, a table or a part cited.

**Seen red** (module `basis-versions`, a scratch test beside `own-reading.test.mjs`, entry `w.bv.conclude`, the real record): a question whose one basis leg is `{role:"supports", extent_kind:"sheet-range", extent_sheet:"csv", extent_range:"A2:E2", content_id}` concluded on a member's own reading answers `BASIS_VERSION_REFUSED`, check `C-25.10`, code `CONTENT_EXTENT_UNREADABLE`, detail `basis_version_legs[0] (version 'reading-1') names an extent this record cannot evaluate: a sheet-range extent names which cells in A1:A1 notation (A1:C10, $A$1:$C$10). This one names 'undefined'`, the walker's sentence byte for byte. Scratch test saved at `.../scratchpad/r23-scratch.test.mjs` (outside the repository).

**Why the tests missed it.** `basis-versions/own-reading.test.mjs` and every other test in that directory build legs with a target, a role and sometimes a ground; none has a leg with an extent beyond `extent_kind:"doc-para"`/page fields, so the field list was never exercised. `legkinds-compare.test.mjs` compares only kinds.

**Failing-first test.** The scratch test above made permanent in `test/m/basis-versions/own-reading.test.mjs`: for each of `sheet-range` (range), `doc-table` (table), `doc-part` (part) and a `cited_as` leg, concluding on a member's own reading keeps the leg's extent field for field in `basis_version_legs` and in `basisVersions`' leg answer; and the same legs through a machine version (`compose`) and through `narrow`.

**Platform check.** None.

**Owner.** `basis-versions` (one job): derive `EXTENT_FIELDS` from `citation`'s `EXTENT_PARAMS` (K: one list, not two), including the `int` coercion of `extent_table`.

**Words.** The refusal is drawn by `screens-inquiry`'s `versionRefusal` (`question.mjs:1127-1139`): the key `refusal.CONTENT_EXTENT_UNREADABLE` (the walker read "This record cannot tell what part of the document this citation means ...", that key's sentence) and then each of the finding's `repairs` as the plane wrote them (`data-repair`): "name one of the landed extent kinds — doc-para, doc-part, ..." That repair line is machine words. The defect is the key chosen (screens-inquiry's, in drawing `f.repairs` raw), not the design's sentence; once the cause is fixed this refusal cannot occur for a CSV passage, but the raw repair line stays for any other refusal. For BOB: raw `repairs` should be drawn by a key or not at all (a screens-inquiry detail).

---

## R29 (G6): the founder's parted upload is refused `CLASS_FORBIDDEN` (A N4)

**Root cause.** `bio-plane/src/capture/index.mjs:3908-3919`: the four parted-upload ops (`captureuploadbegin`, `captureuploadpart`, `captureuploadcomplete`, `captureuploadabort`) declare `classes: ["member"]`. The one-request `captureupload` is declared by the door in `control-plane/owner-ops.mjs:18` with `classes: ["admin", "member"]`. `admission/index.mjs:722-724` judges a session caller by its role (`cls = kind`, `:708`): the founder's session is class `admin`, and `["member"].includes("admin")` is false, so `captureuploadbegin` answers 403 `CLASS_FORBIDDEN` ("each credential here is issued for one purpose", A N4: 65-80 ms) while the same founder's under-64 MiB upload (`captureupload`) is accepted. The member's parted upload passes (A11). The screen (`screens-intake/capture.mjs:1078-1112`) sends the parted path for every viewer above the page's 64 MiB line.

I did not run the door; the two tables above are the whole decision (admission has no other input to it), and the walker's two observations (admin 403 with that reason at the begin, member accepted) are what the classes give. Requirement: `capture` R113 says "each is a member's own act in her own name and needs `contribute` as `captureupload` does"; `captureupload` is the founder's too (`owner-ops.mjs:18`), so the parted four are meant to be the same.

**Why the tests missed it.** `capture/R113` tests (`test/m/capture/` parted-upload tests, G173/G176) call the module's methods or drive the door as a member; the declaration test (`declared-ops.test.mjs`) checks that each op is declared, not that its classes equal the one-request op's. The screen's parted test (`screens-intake`) uses a scripted plane that answers every op.

**Failing-first test** (module `capture`, `declared-ops.test.mjs` or a new door-level test; entry the door's `admission` over the declared table): the four parted ops' `classes` equal `captureupload`'s (`admin` and `member`); and a door test with the founder's session (`admin`) beginning, sending two parts and completing a parted upload through the real `Store` of `bio-plane/test/m/plane/fixture.mjs`. **Not run red** (no founder session built); the table read states it.

**Platform check.** Yes: the parted flow rides R2's multipart upload (workerd): the existing Miniflare test of the member's parted upload must be repeated with the founder's session class, and the live copy walked once as the founder with an 84 MB file (A11's TIFF). The founder's session credential differs from a member's only in the class.

**Owner.** `capture` (one job): `classes: ["admin","member"]` for the four, with the test.

**Words.** The refusal drawn (`This doesn't accept the credential you sent: each credential here is issued for one purpose. Use the credential meant for this work. Nothing was changed.`) is the key `refusal.CLASS_FORBIDDEN` drawn as written; the cause is not the sentence, though a founder reading it has no way forward. When the declaration is fixed the sentence is not reached.

---

## R30 (G6): an own reading resting on two cited parts is refused `VERSION_AFFIRMATION_INCOMPLETE` with no tick drawn (E1a)

Two roots, which together give what the walker saw; the first is in a requirement.

**Root 1: the plane's rule is right as written and the screen sends none.** `basis-versions/conclude.mjs:326-333` (`#concludeOwnReading`): `parts` are the distinct ground labels of the live legs; `this.k.affirmation(parts, affirmed)` (`index.mjs:1093-1104`) refuses when more than one part is declared and `affirmed` does not name every one; the version's `relationship` is `"or"` for several parts (`conclude.mjs:336`). The screen's conclude form (`screens-inquiry/question.mjs:1053-1066` draws the reading chooser, the own-reading field, the falsifier, the reason, the commentary and the button) draws **no tick**, and the act's `send` (`question.mjs:1267-1297`) never sets `affirmed`; the ticks (`reading.affirm.*`, `question.mjs:301-303`) exist only for `versionaccept` of an assistant's reading. So a question with two grounds can never be concluded on an own reading from the screen: the walker's refusal (`refusal.VERSION_AFFIRMATION_INCOMPLETE`: "Tick each part first: ... part 1 is not ticked") is drawn by its key, correctly, and names a control the form does not have. The requirement (screens-inquiry R50, `build/requirements/screens-inquiry.md:191`) says the form draws "where several separately sufficient parts are asked, the affirmation (R25)"; the code does not. Why the tests missed it: `screens-inquiry/question.test.mjs:234-255` conclude tests use `grouped()` (one ground, `part 1`) and a scripted `conclude: ok(...)`; the multi-part tick tests (R59) cover `versionaccept` only; `basis-versions/own-reading.test.mjs:165-177` passes `affirmed` by hand into `conclude`.

**Root 2 (why there are two parts at all): the screen's partition is the inverse of the plane's meaning of a ground.** The walker answered "No, my answer falls" for both cited passages (the `ask` step) and saved. The save maps every such passage to **its own ground**: `question.mjs:1490-1507` (`parent` per ordinal; only a "yes" with chosen others joins grounds), `grounds = [...groups.values()].map(... "part " + (i+1))`. `inquiry` R8/DEC-32 say a ground is an **independently sufficient** set (the finding's strength is the strongest ground; `strength/arithmetic.mjs:86-101`: "THE IMPLICIT PART, every leg with no ground label, one AND-group (a leg nobody said could be done without is necessary); and THE OR PART, the labelled grounds, each independently sufficient, composed by MAXIMUM"). So two passages each "my answer falls without it" saved as `part 1` and `part 2` become two alternatives, either of which carries the answer, which is the opposite of what the member said, and the plane then rightly asks for the affirmation "each part would carry the finding alone" (`reading.affirm.says`, DEC-248). The member's two words (`question.ask.no`, "No, my answer falls"; `question.rests.any`, "Your answer fails if any one of these fails") agree with each other and with the implicit AND part; the saved bytes do not. The screens-inquiry requirement writes the inverse mapping: R23, `build/requirements/screens-inquiry.md:76`: "each passage answered 'No, my answer falls' is a part of its own. The passages the member names as holding each other up are one part together." The test pins it (`question.test.mjs:96-99`: `[{ground:"part 1",legs:[0]},{ground:"part 2",legs:[1,2]}]` from "first no; second and third hold each other up").

The tool cannot even express DEC-235's mix (some passages necessary, some holding each other up) as it stands: `inquiry-grammar` R1/R68 make a basis "grouped whole or not at all" (every supporting leg labelled or none), while `strength/arithmetic.mjs:90-96` already computes the minimum of the implicit part and the OR part.

**Seen red.** (Mapping.) A scratch copy of the R23 test with only two passages, both `ask-*-no` ticked, then Save: `inquiryground` is sent with `grounds: [{ground:"part 1",legs:[0]},{ground:"part 2",legs:[1]}]` (expected for a member who said both are needed: an empty list, "take the grouping off", which `citation/index.mjs`'s own repair uses for exactly this: `{act:"inquiryground", fields:{target, grounds: []}}`). (Refusal.) `basis-versions/own-reading.test.mjs:165-173` already shows the two-ground refusal. The scratch test is not kept.

**Failing-first tests.** (1) `screens-inquiry`, `question.test.mjs`: two cited passages, both "No", Save sends no ground (`grounds: []`), and a control for the all-"yes" pair; this replaces the R23 expectation at `:96-99`. (2) The end-to-end in the same module with the real plane (its harness is scripted; the real chain is `basis-versions`' `world()` fixture): the partition the screen sends for the walker's answers, applied by `inquiry.ground`, then `conclude` with `reading` and no `affirmed` is `ok` (no tick owed, because there is one part). (3) If BOB keeps ≥2 grounds reachable from the screen (any "yes" answer), the conclude form draws one tick per part (`basisVersions`' `parts`, R53) and `send` passes `affirmed` (and a test per R50).

**Platform check.** None.

**Owner.** `screens-inquiry` (one job; the plane is right). **For BOB (doctrine; his, with a recommendation).** The requirement R23 of screens-inquiry and DEC-235 say "No, my answer falls" is "a part of its own", which DEC-32 reads as "a separately sufficient part". Options: (A) all-"No" answers send no ground (the implicit AND part), which is what the member said; a "yes, because of others" group is one ground made of its own passage and those others, and the one mixed shape (some necessary, some redundant) needs `inquiry-grammar` R1/R68 to admit an unlabelled-plus-labelled basis, which `strength` already computes; (B) keep one ground per "No" and say plainly on the form that parts are alternatives (a words change, DEC-235's sentences would then contradict their own reading); (C) leave the screen and ask the affirmation on conclude. **Recommendation A**: it is the one that makes the saved bytes say what the member said, and it leaves the tick for the case it is for (genuinely alternative parts), which then needs the form to draw it (test 3).

**Words.** `refusal.VERSION_AFFIRMATION_INCOMPLETE` (drawn by its key with `{part}`; the key is right for `versionaccept`) and the contradicting pair `question.rests.any` / `reading.affirm.says`: the defect is in the data the screen saves and the form, not in a sentence.

---

## R31 (G6): a severed citation leaves its ground; the ceremony refuses in machine words; nothing repairs it (E1e)

**Root cause.** Two readers disagree about whether a severed leg is part of the basis, and the writer leaves the disagreement in the bytes. `citation/index.mjs:373-376` (`sever` = `#edgeTransition` to `severed`, log line "basis legs on ... moved to 'severed', each leg kept as it was") changes only the `references[]` edge; the leg stays in `basis[]` with its `ground` label, and `grounds[]` still declares the label. Readers that drop it: `strength/index.mjs:#liveLegs` (`:411-424`, "Evidence narrows only"), `basis-versions/conclude.mjs:296-301` (`live`), the screen's `inquiryground` send (`gone(l)`). Readers that do not: `case-catalogue/checks.mjs:~395-405` (`checkPublishedExtension`, C-2.8) iterates `fm.basis`' ground labels — severed legs included — and demands a `published_strength_grounds` row for each; the rows are built by `case-authoring/index.mjs:1034-1037` from `strengthOf(member).grounds`, which has none for the label whose only leg is severed. So publishing a member whose second ground's only passage was severed fails the gate: `published_strength_grounds names no row for ground 'part 2'` (the walker's, C-2.8, `GATE_REFUSED` at the ceremony).

**Seen red** (pure, `case-catalogue`): `caseMemberFindings({ references:[{rel:"cites",target:"INFO-A",status:"confirmed"},{rel:"cites",target:"INFO-B",status:"severed"}], basis:[{target:"INFO-A",role:"supports",ground:"part 1"},{target:"INFO-B",role:"supports",ground:"part 2"}], grounds:[{ground:"part 1"},{ground:"part 2"}], published_strength:[capture B, connection B], published_strength_grounds:[the two rows of part 1] })` returns the finding `published_strength_grounds names no row for ground 'part 2' ...` (script at `.../scratchpad/r31.mjs`, outside the repository).

**Why the tests missed it.** `case-authoring/document.test.mjs` and `ratification` tests build whole cases with unsevered legs; nothing severs a grounded leg and then prepares a case. The conclude path of that situation is covered by `basis-versions` tests (one citation concluded at once: E1a's workaround).

**Failing-first test** (module `case-catalogue`, `checks` test, entry `caseMemberFindings`/`checkCaseDocument`): the call above must return no C-2.8 finding for a ground whose legs are all severed; control: the same with the leg unsevered is still the finding. And a module-level chain test in `case-authoring` (the fixtures `world` of `basis-versions`/`case-authoring`): two grounded legs, sever one, conclude, `publish` (prepare), the case's gate answers clean.

**Platform check.** None (pure).

**Owner.** `case-catalogue` (one job): count only live legs in the totality/grounds arm of C-2.8, as `strength` does (the reference edge is in the same bytes). Two further defects are the same walker's chain, **named but not placed here (BOB: separate causes if he wants them)**: (R31b) `inquiry/index.mjs:2553-2556` answers `PUBLISHED_CANNOT_RESTRUCTURE` ("a published case's composed strength ... are inside signed, ratified bytes") for a member of a *prepared, unsigned* edition (`case-tensions/index.mjs:267-276`, `caseRelation` counts a prepared claim "as a refusal input only"): the sentence is wrong for the state, and the repair the walker needed (re-cutting the structure of a question already in a prepared draft) is closed to them; (R31c) no way to take a finding out of a draft after its conclusion was withdrawn (`case-authoring/index.mjs:1417-1432`, `publish` answers `NOT_CONCLUDED`). I read the code for both; I did not reproduce them in-process.

**Words.** The ceremony draws `refusal.GATE_REFUSED` ("This cannot be signed yet because it did not pass Civicsmith's checks ...") and under it each finding's own `detail` (`screens-publish/ceremony.mjs:13-23`), here the check's English from `case-catalogue.checks.published_strength_grounds_names_no`. The key chosen is right; the defect is the check's sentence in machine words ("published_strength_grounds", "frozen on every axis"), a module's text (`case-catalogue`), which a design sentence per check would replace (UX-DESIGN's, if BOB wants every C-2.8 finding in words; after the root fix this one finding is unreachable for a severed leg).

---

## R32 (G6): the sign dialog's buttons below a 900 px window (E1f)

**Root cause.** The design's stylesheet rule, carried unchanged: `docs/development/ux-substrate/screens/page.src.html:299`

```
.mk-scrim { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: var(--s-4); background: ...; }
.mk-scrim > .cs-dialog { max-width: 440px; width: 100%; display: grid; gap: var(--s-3); }
```

and so `interface-assets/index.mjs`' generated `shell.css` (interface-assets R7: "never copied or edited by hand"). The scrim is a fixed, centred grid with `overflow: visible`: a dialog taller than the window is centred and clipped at the top and the bottom, the page behind has no scroll to reach it, and the scrim does not scroll. The shell's signer dialog draws one `<li>` for every statement (`interface-shell/browser.mjs:1417-1420`: `<ol>` then the two buttons), so its height grows with every finding of the case. 

**Seen red** (headless Chromium, the real `shell.css`/`civicsmith.css` from `ASSET_FILES`, viewport 1280x900; a page of `.mk-scrim > .cs-dialog` with the heading, N three-row statements and the two `cs-btn`; script at `.../scratchpad/r32.mjs`): with 8 statements the dialog is 645 px tall and the buttons end at y 747; with 12, 861 px, buttons at 855; with 16, 1077 px, **buttons at y 1028-1068 in a 900 px window**, `overflow-y: visible` on the scrim (scrollHeight 1093, clientHeight 900). The walker's two-finding case (5 statements of 3 wrapped rows, 985 px) is the same shape. A one-finding case (3 statements) fits (E2).

**Why the tests missed it.** `interface-shell/t49.test.mjs:30-60` and `design.test.mjs:100` check that the `mk-scrim` and `cs-dialog` classes exist and that the rule is carried (`interface-assets/assets.test.mjs`); a jsdom-style test has no layout. No test measures a dialog against a window.

**Failing-first test.** Module `interface-assets` (it owns the CSS's content) — a Chromium test (Playwright is in the environment, `chromium.launch()`) at 1280x900 and 390x844 with the recipe above for 16 statements: the scrim (or the dialog) scrolls (`overflow-y: auto` and a bounded height) so that the last button's bottom is reachable (`scrollIntoView` brings it inside the window) and its height never exceeds the window; control: 3 statements, nothing changes. The shell test for the dialog's own markup stays `interface-shell/t49`.

**Platform check.** Yes, and it is the check: Chromium layout. The live copy re-walk is a two-finding case at 1280x900 and at 390 px (E2b says the 390 px width of the sign dialog was not exercised).

**Owner.** UX-DESIGN's (the rule is the design's): `.mk-scrim { overflow-y: auto }` and `.cs-dialog { max-height: calc(100dvh - 2 * var(--s-4)); overflow-y: auto }` (or the statements list scrolling and the buttons pinned), then `interface-assets` regenerates `shell.css` (mechanical, same round). One job: if BOB wants it in the module's lane, `interface-assets` owns the file but not the rule; the fix is the design's.

**Words.** None changed. The statements' sentences are the dialog's own; this is layout.

---

## R33 (G6): the Held screen cut at 50, no paging or project filter, its release ticks every project's rows (E1c, E1d)

**Root cause.** `bio-plane/src/screens-intake/held.mjs:9-17`, `heldReads`: `heldcaptures` with `limit: 50` and `fields: "picker"`, and the "See held captures" act (`sendRefresh`, `held.mjs:254`) with the same limit; neither reads `after`. The plane pages: `capture/index.mjs:2149` and `:2176` answer `truncated` and `next` (a cursor) and accept `after`, `sort`, `dir`, `member` and `project` (`:2055`). The screen draws only `v.truncated` as `screen.held.more` ("More captures are waiting than are shown here: {count} shown.", `held.mjs` render, the line after the list) and no door to the rest. The bare route lists every member's held captures (the plane's `heldcaptures` without `member`), each row with a tick (`pick: true`); a project filter exists only as a link in a row's project name (`projectOf`, `:111-118`, to `/app/held/<PROJ>`), and a project-less upload (the Add screen's file form has no project field, B's record; E5) has no link at all, so a member has no view of "mine". E1c's release over every ticked row was the screen's own offering (one `release` over the picked rows, `sendRelease` `:243-262`); the walker's mistake is real but invited.

**Why the tests missed it.** The requirement's test pins the cut: `screens-intake.md:23` (R4): "Test: with 60 documents held, one picker read, one full read naming the first 50 in order, one set-aside read and no other `heldcaptures`" — a test that holds 60 and asserts 50 are read and nothing else. The requirement is silent on paging and on whose captures the list holds.

**Failing-first test** (module `screens-intake`, the screen test harness over the scripted plane, then once over the real `capture` for the cursor): with 60 held, the screen draws a door to the next page that sends `after` = the answer's `next`, the page after shows rows 51-60 and no "more" sentence, and a "mine" filter sends `member`. Plus the plane-side control: `capture` `heldCaptures` over 60 rows with `limit 50` answers `truncated: true` and a `next` that returns exactly the rest in the same order (`capture` module, real store from `plane/fixture.mjs`). **Not run red** (the screen test would need the paging control, which does not exist; the cut is the test already in the file).

**Platform check.** None (a plane read over the DO's table). On the copy: with more than 50 held, the screen offers the rest.

**Owner.** `screens-intake` (one job). **For BOB (a UX/policy decision, his; recommendation given).** Who the bare Held list holds is not in any requirement: `heldcaptures` lists the team's captures and `release` vouches for any picked, so any member can vouch for another's upload (E1c vouched seven). Options: (A) default to the viewer's own captures with the team's behind a "Everyone's" filter and project filter chips, paged; (B) keep the team list, add the project/own filters and paging; (C) leave. Recommendation A: the screen then cannot hand a member a tick on a stranger's file by default, the policy question of whether a member may vouch for another's capture stays with `ratification` (R20-R26) untouched.

**Words.** `screen.held.more` is the design's sentence and is drawn by the right key; its defect is that it ends in a dead end (nothing in the design pages). UX-DESIGN's: a paging word.

---

## R34 (G6): the member's session ended in the browser, `whoami` 401 on first load (E1)

**Root cause (no defect of code; evidence).** A shared-device session ends after 15 minutes without activity, in two places that agree: the plane (`credentials/index.mjs:104` `SESSION_LIMITS.sharedIdle = 15 * 60e3`; `:541-542` `#stateOf`: `idle >= sharedIdle ? "ended"`; `:556-560`, `session(token)` ends it and answers null; `last_active` is updated only by a request not marked `background`, `:562`) and the page (`interface-shell/browser.mjs:1700-1717`, `idleCheck`, the browser's own 15-minute clock, `D.idleEnd`, sends `signout` and draws the `session.ended` word: "You were signed out after a while away, so nobody else at this device can use your sign-in ..."). The walker kept two browser contexts (admin and member) and drove them alternately for about 45 minutes; the member's context sat unused between its acts (E2b writes) and the screen sweeps, long enough more than once. The sweeps' first call on a context whose plane session had ended is `whoami` (`browser.mjs:1635-1658`): the plane answers 401, the shell clears the record (`S = null; clearRecord`, `:1656-1658`) and draws the sign-in screen "where the question was" — as seen. Two sweeps, two 401s, the second after the walker had signed in again and left that context idle again. I did not reproduce this in-process; the timestamps in `E.md` give no member-activity times, so "idle past 15 minutes between acts" rests on the limits and the walker's two-context method, which fit every observation (a 401 on the first call only, then a working session after sign-in). A reproduction is a one-line change of a test clock on the session: `credentials/t47-signin.test.mjs` (`sharedIdle`) already ends a shared session at that figure.

**Why the tests missed it.** There is nothing to miss: the rule is tested (`credentials` R65 tests; `interface-shell` R33 tests of the page's clock). What no test holds is the *first load* after the plane ended a session while the page was closed: that path (`whoami` -> `none`) draws the plain sign-in without `session.ended` ("You were signed out after a while away ..."); only the page's clock draws that word.

**Failing-first test** (only for the minor finding): `interface-shell` / `screens-entry`: a page loaded with a stored record whose `whoami` answers 401 draws the signed-out screen with `session.ended`'s sentence (and a control for an unknown token, which draws none).

**Platform check.** None.

**Owner.** None for the cause. The minor finding is `interface-shell` (the `none` outcome of `whoami` with a record present). **For BOB.** The 15-minute shared-device limit is his rule (credentials R65; K3061 D3). For a test round with several contexts the walkers' brief should say a context idle for 15 minutes is signed out, which is the rule and not a fault.

---

## What the tests were not (the pattern across these ten)

Eight of the ten causes (R19, R20, R22, R23, R30, R31, R32, R33) hide behind a hand-built answer that is the author's own mapping: a `lined()` text with no comma in a cell, a ragged file with one ragged row, a unit list whose blocks do not repeat the head, a leg with no range, a partition expectation copied from the requirement's sentence, a case with no severed leg, a jsdom page with no layout, 60 rows read as 50. For K4428, each failing-first test above is stated at the walker's own recipe (`sheetgen` or the exact file) through the module's real entry; three of them (R19, R22, R23) were seen red in-process, R20 and R31 and R32 were reproduced at the cause by script, R30's mapping was seen red on a copy of the module's own test, R21 (b), R29 and R33 are read and not run, R34 is not reproduced.

*Written by DIAG-R10-C #1 for BOB #287. Nothing for Bob to do.*
