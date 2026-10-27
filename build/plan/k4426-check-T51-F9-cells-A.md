# K4426 F9 — MISSING cells closed from evidence, jobs j1 j2 j3 j4 j5 j6 j8 j9 j10 j11 j12 j13 j14 j15 j16 j17 j18 j19 j21 j22 j39 j44 j45 j46 j47 (worker A)

Method. Merge commits (parent 1 = the code before the job): ooxml 7ef1a0a1c3; csv-reader adf3cf0a2b; office-readers 3868441e0b; odf-reader 4381970441; format-registry (j8) 8ff7cbe1bb; text-chain 9a21b5dcd9; site-profiles af83ccca31; image-codecs 16c59da658; pdf-pixels e191d0f0a3; image-cover 16ba961bf5; doc-clean aec59370ef; file-scanner b3bb5c4931; sheet-worker e852ba2315; test-support c5e79ae03f; provenance c2ab687614; doctypes 4db5284230. Scratch worktrees /home/user/k4426-a/* at `<merge>^1` with ONLY the job's test files (and test-only helpers) copied from `<merge>`, one file at a time, all removed. "old" = `<merge>^1` + the job's tests; "new" = `<merge>`. (4) is "(unchanged)" on every row below. Rows or cells of other owners (labelled j7, j20, j23, j24, j26, j27 in the table) were not touched.

Two scratch-only adjustments, stated where they matter: (a) where the job's file fails whole at import on the old code (a new export is missing), I also ran a copy with namespace imports (missing exports shimmed as empty values, test bodies unchanged) so the individual assertions show; the first failing line is then the import error and the shimmed run is marked "shim". (b) `pagepixels.test.mjs` crashes on old at lines 921/927 in its R46 helper, so there `x.declared.y` was changed to `x.declared?.y` in the scratch copy.

---

### G123e
(3) Committed tests `R21 G123e: the marks ...` and `R21 G123e (J-1): ...` (generators.test.mjs:200, :213). On `c5e79ae03f^1` (file copied in): `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/home/user/k4426-a/ts-old/bio-plane/test/corpus.mjs' imported from .../generators.test.mjs` (tests 1, pass 0, fail 1; the generators do not exist before the job, so the committed tests are red by construction). At `c5e79ae03f` the two R21 G123e tests: `-test-name-pattern "R21 G123e"` tests 2, pass 2, fail 0. The assertion-level red over today's harness sheet is the record's scratch run, as the table has it. (1), (2), (4) (unchanged).

### G124c
(1) j3 (ooxml `bio-plane/src/ooxml.mjs`): the office text bound judged declared bytes only: `:114` `MEASURED_OOXML_TEXT_BOUND_BYTES = 20 * 1024 * 1024`, `:121-141` `declaredTextBytes`/`sizeGuard`, `:191` `STREAMED_TEXT_BOUND_BYTES = 32 * 1024 * 1024`, `:195-196` `TEXT_PIECE_CHARS`/`TEXT_PIECE_MAX_CHARS` literals, the rest of the ceilings literals at `:265-275`; none read from `READ_BOUNDS`. j3's part is the table read (R30, R6, R35). j5's part (retained objects) is below.
(2) j3: no ooxml test compared a module constant with its READ_BOUNDS row; gap closed by `bio-plane/test/m/ooxml/round9.test.mjs` (R30, R6, R35). j5 (office-readers): `docx.mjs` text() walk (`:313-322`, `:643-646`, `:741-743`) retained paragraph, cell and link objects with no count; every fixture was small, no body past 250,000 objects; gap closed by `bio-plane/test/m/office-readers/scan-bounds.test.mjs` R44.
(3) j5, `scan-bounds.test.mjs` on `3868441e0b^1` (with fixtures.mjs): `✖ R44 docx: a body that would retain more than 250,000 paragraphs, cells and links is refused before the walk, by name and with its figure; at the bound it is read` — `AssertionError: empty paragraphs  actual: '', expected: null`; `✖ R44 pptx and xlsx: a deck past the figure is refused by name ...` — `actual: '', expected: null`. File: tests 8 run, pass 2, fail 6 (then the process was killed at the R45 test, see G128e). New (`3868441e0b`): 11/11.
j3 side: NOT RED on `7ef1a0a1c3^1`: `round9.test.mjs` "R6 and R35 the 20 MiB text bound and the 32 MiB ceiling are the office rows' alpha figures, taken through boundOf" passes 1/1 within 2/26 passing (the literals equal the rows' figures); the red for ooxml's table read is R30 below.
(4) (unchanged)

### G124e
(2) j4: `bio-plane/test/m/csv-reader/text.test.mjs` before the job had no record of more than 16,384 columns (its fixtures were a handful of columns); closed by `text.test.mjs` "R22 a record of more than 16,384 columns refuses the body whole ... 16,384 columns are read" (:198). j9 (text-chain record, point (2)): "No wide fixture."; the test `round9.test.mjs` "R93 R95 (G124e)" pins XFD (16,384) and the 4-letter form staying null.
(3) (table) j9: NOT RED on `9a21b5dcd9^1`: `round9.test.mjs` "R93 R95 (G124e): the A1 shape holds to the last column a sheet can have (XFD, 16,384) and past it stays kept at three letters" passes (file: pass 2 fail 7 on old; new 9/9). By design, nothing changed. j4's RED is the table's (old `usedCols:16385`); the committed text.test.mjs on old fails at import (see G129f).
(1), (4) (unchanged)

### G124g
(1) j3: `bio-plane/src/ooxml.mjs:265-275` (pre-merge): `ARCHIVE_ENTRIES_MAX = 10000`, `ARCHIVE_TOTAL_MAX = 268435456`, `MEMBER_MAX = 268435456`, `ARCHIVE_RATIO_MAX = 1100`, `ARCHIVE_DEPTH_MAX = 3`, `ARCHIVE_TREE_TOTAL_MAX = 268435456`, `ARCHIVE_TREE_ENTRIES_MAX = 10000` as literals in no table (used at `:563-566`, `:1533`, `:1666-1667`).
(2) j3: no test compared the archive limits with a table row; the existing archive tests used the exported constants themselves. Closed by `round9.test.mjs` R30.
(3) j3, `round9.test.mjs` on `7ef1a0a1c3^1`: `✖ R30 the limits are the READ_BOUNDS rows' active figures, taken through boundOf, and a refusal on one is final` — `AssertionError: OFFICE_ENTRIES_MAX  actual: undefined, expected: 100000`. File 26 tests, pass 2, fail 24; new 26/26. (j23's and j24's R114/R115 files were not run: other owners.)

### G125a
(1) j13: `pdf-worker/src/ccittdecode.mjs:117-119, :208, :223` `rowBytes = Math.ceil(columns / 8)` and `new Uint8Array(rowBytes)` per row, `columns` taken from the parameters unjudged (`:122` `maxRows = rows > 0 ? rows : 1 << 20`); `dctdecode.mjs` SOF parse (`SOF_PROCESS` `:66`) sized planes from the declared frame before any bound (old answer `CORRUPT_DATA`, not `IMAGE_TOO_LARGE`); `jbig2decode.mjs:71` `if (w * h > 1 << 28)` (a 268 M-pixel literal, not the table's) in `bitmap`, with `:716-718` page information sizing the page from the declared w and h.
(2) j13: `pdf-worker/test/codecs` before the job had no test that declared an oversize frame for CCITT, DCT or JBIG2 (`git grep 60000|IMAGE_TOO_LARGE` in the parent's tests finds only `jpx.test.mjs:134` for JPX); closed by `pdf-worker/test/codecs/bounds.test.mjs`.
(3) (table's RED is j13's; checked) `bounds.test.mjs` on `16c59da658^1` fails whole at import: `SyntaxError: The requested module '../../src/ccittdecode.mjs' does not provide an export named 'CcittRefusal'`; shim run: tests 11, pass 0, fail 11, e.g. `R12 CCITT ... a CcittRefusal, not undefined  actual: false, expected: true`; `R12 DCT ... decodeBaselineJpeg 60000x60000  actual: 'CORRUPT_DATA', expected: 'IMAGE_TOO_LARGE'`; `R12 JBIG2 ... a Jbig2Refusal, not undefined: undefined  actual: false, expected: true`. New 11/11.

### G125b
(1) j13: `pdf-worker/src/jpxdecode.mjs:641-672`: `addPrecincts(x)` builds a precinct object (code-blocks plus two tag trees) for every precinct of every band (`:671` `for (const x of tc) addPrecincts(x)`) with no count first; only a byte working-set bound existed (`:85` `MEMORY_BOUND = 61_300_000`), so a SIZ with many tiny precincts costs objects, not bytes.
(2) j13: `jpx.test.mjs:134` declared 60000 x 60000 over one whole-tile precinct (caught by the byte bound); no test declared small precincts (2 x 2) whose object count, not bytes, is the cost; closed by `bounds.test.mjs` "R12 R4 JPX".
(3) (the table's RED line stands) shim run on old: `R12 R4 JPX: SIZ 500, 1000, 2000 with 2 x 2 precincts ... 500/1  actual: 'TRUNCATED', expected: 'IMAGE_TOO_LARGE'`; `R12 R4 JPX: the retained-objects bound counts precincts and code-blocks ... TRUNCATED  actual: false, expected: true`.

### G125c
(1) j15: `bio-plane/src/image-cover/png.mjs:158-174` `const bpp = CHANNELS[ct], stride = W * bpp;` then five `new Uint8Array(stride)` row buffers sized by the IHDR width alone; the only bound was the pixel product `COVER_MAX_PIXELS = 120_000_000` (`index.mjs:26`), which a 30,000,000 x 1 RGBA PNG (120 MB stride, 70 bytes) passes; the chunk walk (`png.mjs:39-53`) and the JPEG marker walk counted nothing.
(2) j15: tests used well-formed pictures judged by W x H; none was wide and one row high, none carried millions of chunks or markers; closed by `bio-plane/test/m/image-cover/limits.test.mjs` + `hostile.mjs` (R10, six tests).
(3) (table's RED confirmed) old: tests 7, pass 0, fail 7 (new 7/7), e.g. `R10 a 70-byte PNG declaring 30,000,000 x 1 RGBA ... cover: TRUNCATED_IMAGE_DATA the PNG data ends before the image does: the image data ends at row 0 of 1  actual: 'TRUNCATED_IMAGE_DATA', expected: 'IMAGE_TOO_LARGE'`.

### G125d
(1) j3: `ooxml.mjs:593-612` `readPart` inflated whatever the directory declared (limit `MEMBER_MAX` only), no ratio check before `inflateRaw`; and the structural parts the module decodes itself (`:1029` `[Content_Types].xml`, `:1243` rels, `:1288` core.xml) had no size bound (`parseContentTypes(UTF8.decode(ctBytes.bytes))`). j5: `docx.mjs:855-864` `readPart(...)` then `sha256Hex(read.bytes)` (xlsx `formats-xlsx.mjs:904-906`) inflated an embedding whole.
(2) j3: fixtures were honest packages; none declared an uncompressed size over compressed x 1100 or an oversized XML part. j5: embeddings in fixtures were a few bytes. Closed by `round9.test.mjs` R31 (two tests) and `scan-bounds.test.mjs` R43 (two tests).
(3) j5, `scan-bounds.test.mjs` on `3868441e0b^1`: `✖ R43 an embedded part's identity is taken as it streams; a member over MEMBER_MAX or ARCHIVE_RATIO_MAX is refused by that name before inflation` — `AssertionError ... actual: undefined, expected: 1100`; the 100 MiB case (`R43 a 100 MiB embedding in a small file ...`) has no assertion line on old: the process dies (see G128e). j3 (`round9.test.mjs` on `7ef1a0a1c3^1`): `✖ R31 a member declared over its compressed size times ARCHIVE_RATIO_MAX is refused before any inflation ...` — `actual: { ok: false, why: 'size_mismatch', name: 'a.xml', expected: 3301, got: 1 }, expected: { ok: false, why: 'ARCHIVE_RATIO_MAX', name: 'a.xml', declared: 3301, limit: 1100, final: true }`; `✖ R31 the XML parts the module decodes itself are refused above STRUCTURAL_PART_MAX ...` — `actual: 'content_types_unparseable', expected: 'content_types_unreadable:STRUCTURAL_PART_MAX'`.

### G125h
(1) j3: `ooxml.mjs:451-515` `readContainer` walked `for (i < totalEntries)` (`:489`) with no cap on entry count, directory size or name length (the only cap, `ARCHIVE_ENTRIES_MAX`, was in `listArchive` `:1533`); `readPart` (`:593-612`) had no ratio check (see G125d). `discriminate` (`:967-982`) therefore passed such a container on.
(2) j3: container tests used archives of tens of entries and short names; none exceeded 100,000 entries, a directory limit or a name limit; closed by `round9.test.mjs` R3 (two tests) and R38 (directory/name).
(3) `7ef1a0a1c3^1` + round9.test.mjs: `✖ R3 readContainer refuses a count, a directory and a name over their limits, by name, final, before the directory is walked` — `actual: undefined, expected: 100000`; `✖ R3 the refusals on a limit reach discriminate as the container's own ...` — `actual: { ok: true, format: 'zip' }, expected: { ok: false, why: 'ARCHIVE_NAME_MAX', limit: undefined, final: true }`; `✖ R38 the listing refuses a directory over ARCHIVE_DIRECTORY_MAX and a name over ARCHIVE_NAME_MAX ...` — `actual: { ok: false, why: 'central_directory_truncated', entries: null }`. New 26/26.

### G126d
(1) j3: no defect in ooxml for this cause. `declaredTextBytes(container, isTextPart)` (`ooxml.mjs:121`) already summed declared uncompressed sizes of the parts a caller names; j3's audit test holds on the old code. NOT RED on `7ef1a0a1c3^1`: `round9.test.mjs` "R7 the declared unpacked size of a container small on disk is large for every container kind, and a lying directory counts as large (G126d audit)" passes (file: pass 2 fail 24).
(2) j6: before the job odf-reader had no ODF text-part predicate (`odf.mjs` exported no `isOdfTextPart`) and no test asked what an ODF container's unpacked text total is for the inline gate; closed by `bio-plane/test/m/odf-reader/r9-decode.test.mjs` R55 (two tests) and the export list in `entries.test.mjs`.
(3) j6: R55 is new code. `r9-decode.test.mjs` on `4381970441^1`: `SyntaxError: The requested module '../../../src/odf.mjs' does not provide an export named 'isOdfTextPart'` (tests 1, pass 0, fail 1); new 7/7.

### G127e
(2) j21 (record, point (2) shared by G127a/c/d/e): "every fixture held one document per digest; none shared a part"; for the migration specifically, no fixture had a register row keyed by a part digest from before the change, so nothing could be moved. Closed by `bio-plane/test/m/provenance/parts-key.test.mjs` R79 (two tests at :205 and :246: part-keyed rows already in a live record moved to `register_parts`, counted, a second run moves nothing; the repair back-fills an old bundle at the wake).

### G128e
(1) j5: `docx.mjs` always listed every cell of every table (no `inlineCellsMax` option anywhere in `docx.mjs`'s `text()`), so a docx whose tables held over 1 MiB of cells was a 1 MiB+ reading stored with no units.
(3) j5, `scan-bounds.test.mjs` `--test-name-pattern=R45` on `3868441e0b^1` (old space capped at 1 GB): `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`, exit 134 (no assertion line: the process dies; a full-file run on old is killed by the OS, exit 137, at this test). New: file 11/11 including `R45 past opts.inlineCellsMax the cells of a docx table are omitted with a statement ...`.

### G129f
(2) j4: before the job `text.test.mjs` never produced more than a few unreadable fields; `undetermined.push` (`csv-reader/index.mjs:835`) was unbounded and untested (old module: `listed:1000` of 1000 per the record). Closed by `text.test.mjs` "R9 the sheet lists at most 200 unreadable cells; counts.undetermined is the whole count and cellsIn gives any address" (:124). On old that file fails at import: `SyntaxError: The requested module '../../../src/csv-reader/index.mjs' does not provide an export named 'CSV_STREAMED_UNDETERMINED_MAX'`; new 19/19.

### G130a
(3) j8, `bio-plane/test/m/format-registry/detect-round9.test.mjs` on `8ff7cbe1bb^1`: `✖ R23: SCAN A12 — a JPEG with %PDF-1.4 in a COM segment, <html in its EXIF, and a PNG with %PDF- in tEXt are read as pictures, pictures are asked first` — `actual: [ 'html', 'pdf', 'docx', 'xlsx' ], expected: [ 'jpeg', 'png', 'html', 'pdf' ]`. File: tests 12, pass 1, fail 11; new 12/12.

### G130b
(3) j8, same file/old: `✖ R9: the name is the third argument ...` — `actual: 'undetermined', expected: 'csv'`; `✖ R31: SHEET C32 C33 C23 C24 ...` — `actual: 'undetermined', expected: 'csv'`; `✖ R13: with the name pass the only answers are ...` — `actual: 'undetermined', expected: 'csv'`. Cause on old: `formats.mjs:115` `detectFormat(bytes, contentType)` has no name argument and no delimited pass.

### G130c
(3) j8, same file/old: `✖ R32: DOCS O9 — a file above the head is recognised from its end record and central directory ...` — `AssertionError: a range source answers a Promise  actual: false, expected: true`; `✖ R32: the head decides the signatures and the name pass ...` — `actual: 'undetermined', expected: 'jpeg'`; `✖ R25: a detection from a range source reads only through readRange ...` — `actual: 'undetermined', expected: 'docx'`; `✖ R32: a source with no size, no bytes or a failing read ...` — `TypeError [ERR_INVALID_ARG_TYPE]: The "promiseFn" argument must be of type function or an instance of Promise. Received an instance of Object`. Cause on old: `detectFormat` (`formats.mjs:115-125`) is synchronous and sees only the byte prefix.

### G130e
(1) j3: three pre-merge defects in `ooxml.mjs`: the flavour table `CONTAINER_FLAVOURS` (`:919-930`) lists only the plain and macro-enabled rows (no dotx, potx, ppsx), so a template or show is `undetermined`/`opc_main_part_unrecognized`; `discriminate(bytes, ...)` (`:967-982`) calls `readContainer(b)` on whole bytes, so a file above the sniff head cannot be judged from its end record; `readPart` (`:593-612`) answers `inflate_failed` for an encrypted member (no `MEMBER_ENCRYPTED`).
(2) j3: fixtures were plain/macro variants and whole small files; no test gave a template, a range source or an encrypted member; closed by `round9.test.mjs` R10, R11 (three tests), R5.
(3) `7ef1a0a1c3^1`: `✖ R10 and R11 a template or a show (dotx, potx, ppsx) is read as its twin ...` — `AssertionError: dotx  actual: { ok: true, format: 'undetermined', why: 'opc_main_part_unrecognized' }, expected: { ok: true, format: 'docx', variant: 'dotx', mainPart: 'word/document.xml', confidence: 'high' }`; `✖ R11 a file of any size is judged from its end record ...` — `actual: { ok: false, why: 'not_a_zip' }, expected: { ok: true, format: 'docx', ... }`; `✖ R5 an encrypted member (ZipCrypto bit 0, 6 or 13, or AES method 99) is stated MEMBER_ENCRYPTED ...` — `AssertionError: flags 1  expected: { ok: false, why: 'MEMBER_ENCRYPTED', name: 'secret.xml' }`.

### G131a
(2) j4: `text.test.mjs` before the job used ASCII and single-byte fixtures only (the one UTF-8 case at :65 had a single high-byte field); no UTF-8 file of many rows with multi-byte characters, so the latin1 transport (`csv-reader/index.mjs:508` `BYTE_TRANSPORT = new TextDecoder("latin1")`, used at `:624`) never failed. Closed by `windows.test.mjs` G131a tests and `text.test.mjs` R5. Old `windows.test.mjs`: `✖ G131a a UTF-8 file with ’ in 300,000 rows reads every cell: no cell is null (C27)` — `actual: 600000, expected: 0`; tests 17, pass 1, fail 16; new 17/17.

### G131b
(2) j4: no old test had a stray `"` inside an unquoted field (the walk opened quote mode at any quote, `csv-reader/index.mjs:478`). Closed by `windows.test.mjs` R23. Old: `✖ R23 one stray quote does not swallow the rest of the file: a stray 12" pipe at row 100 of 500,000 rows reads all 500,000 (C14)` — `actual: 100, expected: 500000`.

### G131c
(2) j4: dialect and encoding were decided once from the first 50 lines/first window (`index.mjs:103`, `:520-531`) and the old tests only used files whose head was clean; no title preamble, CR-only endings, or a window that differs. Closed by `windows.test.mjs` R24. Old: `✖ R24 a ragged file with a 5-line title preamble, CR-only endings and a quoted newline still finds its delimiter (C18, C19)` — `actual: null, expected: 'comma'`.

### G131d
(2) j4: old text tests had no empty field in a first, middle or last column (`index.mjs:842` `if (field === "") return;` dropped the slot from `vals`, then `vals.join("\t")`); the only empty-field assertion (`text.test.mjs:31`) was a case where the grid survived. Closed by `windows.test.mjs` "G131d empty cells keep their column ..." (old: `row 4  actual: [ 'b4', 'c4' ]`) and `text.test.mjs` :47.

### G131e
(1) j4 (CSV half): `csv-reader/index.mjs:889-935` `csvCellsIn` calls `forEachRecord(parts, ...)` from byte 0 and counts `row++` until `fromRow`, with no access point, so a range late in the file costs the whole walk each call. (j5's xlsx half: `formats-xlsx.mjs:1272` `cellsIn` parses the whole sheet part per call.)
(2) j4: `g41-held.test.mjs` tested cellsIn for equality on 1 MB files (`:64`, `:77`) and never the bytes pulled; j5: `g41-held.test.mjs` R37 tests (:110-:173) equality only. Closed by `windows.test.mjs` "R18 the bytes cellsIn pulls are bounded by the window, not the offset" (CSV) and `dates-typed.test.mjs` R37 (xlsx).
(3) j5, `dates-typed.test.mjs` on `3868441e0b^1`: `✖ R37 a point read parses the blocks that hold the rows asked for, not the sheet: the bytes served are bounded by the rows and a block ...` — `TypeError [Error]: Cannot read properties of undefined (reading 'get')` (no access points exist on old). File: tests 5, pass 1, fail 4; new 5/5. (j4's CSV half, old `windows.test.mjs`: `✖ R18 the bytes cellsIn pulls are bounded by the window, not the offset: rows 699,998 to 700,000 of an 8.9 MiB file ...` red; `✖ R18 cellsIn from an access point equals the whole read ...` red.)

### G131g
(1) j3: `ooxml.mjs:67` `const UTF8 = new TextDecoder("utf-8", { fatal: false })` is the only decoder for every part the module decodes (`:1029` content types, `:1153`, `:1243` rels, `:1288` core); no encoding detection, no BOM/UTF-16, no declared charset; `decodeText` did not exist. Old tests: `round9.test.mjs` R36 (six tests) `TypeError [Error]: decodeText is not a function`; `✖ R36 every part the module decodes to text goes through decodeText: a UTF-16 part is read, not found empty` — `actual: 'undetermined', expected: 'docx'`.

### G131i
(2) j4: old tests had no body between the old 17 MiB bound and 50 MB, and none in windows with a carry (`MEASURED_CSV_TEXT_BOUND_BYTES = 17 * 1024 * 1024`, `index.mjs:270`; the old `large-text.test.mjs` ran at 17 MiB); closed by `standard-size.test.mjs`, `large-text.test.mjs` (rewritten) and `windows.test.mjs` R9. Old `bounds.test.mjs`: `✖ R6 the bytes ceiling is the csv bytes row of READ_BOUNDS at its active figure ...` — `actual: 17825792, expected: 52428800`.

### G132i
(2) j14: pdf-pixels already took `allowTextPage` before the job (`R16` tests at `pagepixels.test.mjs:118-123` used synthetic `Tj` operators); the defect "never passed" is the caller's (ocr-worker, j18). The missing case was a real scan with a text line through the real render; added at `:124-130` (pdfgen `mixed`, with and without `allowTextPage`).
(3) NOT RED on `e191d0f0a3^1`: both tests, `R16 a scan with a text line is refused PAGE_HAS_TEXT_LAYER without the option` and `R16 a scan with a text line is rendered with allowTextPage: its scan, its text noted`, print PASS on the old `pagepixels.mjs` (scratch-patched file: 452 PASS, 95 FAIL, none in R16; new: 537 PASS, 7 FAIL, none in R16).

### G132l
(1) j13 (piece d, `mq.mjs`): `MqDecoder.byteIn` (`mq.mjs:46-60`) fed marker bytes past the end of the data silently, so a JBIG2 stream shorter than its region decoded white to the end and was never reported short (`onShort` did not exist).
(2) j13: `mq.test.mjs` before the job round-tripped complete streams only (`:97`); no test truncated one or ended it in a marker. Closed by `mq.test.mjs` R5 (two tests) and `jbig2.test.mjs`.
(3) (j13's piece; j7's is not mine) `mq.test.mjs` on `16c59da658^1`: tests 8, pass 6, fail 2: `✖ R5 (fix round 9, G132l (d)) data running out is detected as the bytes are consumed: onShort is called at the first byte the decode lacks, not after the region` (`actual: undefined`) and `✖ R5 ... a stream that ends in its 0xFFAC marker is short once the decode feeds on the marker past the coder's look-ahead` (`actual: undefined`); new 8/8.

### G132m
(1) j14: `pdf-worker/src/pagepixels.mjs` `renderPageToPixels` (`:345`) and `decodeImage` (`:435-513`) handled `/Rotate` only (`opts.rotate`, `:450-460`, `:509`) and no `turn` option exists in `pagepixels.mjs` or `picturepixels.mjs`; a page photographed sideways or upside-down was answered `ok:true` with its pixels as stored and no `turned_deg`.
(3) `pagepixels.test.mjs` on `e191d0f0a3^1` (scratch-patched): `FAIL  R48 an 8-bit page, turn 90: the samples turned exactly, turned_deg 90, upright / want [2,3,"650ea45b48cac2f3...",90,0,true] / got [3,2,"801da61dbcec49...",null,0,true]`, and about 50 further R48 FAIL lines (turns 180/270, 1-bit mask, DCT, CCITT, EXIF orientations 1-8 of the pictures). Old totals 452 PASS, 95 FAIL; new 537 PASS, 7 FAIL (the 7: R42 mapping total and the three R47 bytes-read tests among them; their providers merged later).

### G133c
(2) j12: before the job the doctypes tests ran each type on fixtures and golden texts of ordinary size (`doctypes.test.mjs`, `bounded.test.mjs`, `policy.test.mjs`, `regulation-sections.test.mjs`); none gave a type a date list of 150,000 (`Math.min(...dates)` in `meeting-calendar.mjs` throws RangeError) or a hostile shape; closed by `doctypes/test/g140.test.mjs` (18 tests; record: on the tip 12 of 18 fail, 150,000 dates RangeError).
(3) j5, `chars-decode.test.mjs` on `3868441e0b^1`: tests 6, pass 0, fail 6, e.g. `✖ R40 docx: every kind of invalid reference in the body states the body unreadable ...` — `AssertionError: &#x110000;  actual: 'before &#x110000; after', expected: null`; `✖ R40 pptx and xlsx: a slide or a sheet holding a bad reference is unreadable and stated ...` — `actual: [ 'fine slide', 'oops &#x110000;' ], expected: [ 'fine slide' ]`; `✖ R41 a UTF-16 document.xml ...` — `bom true  actual: '', expected: 'Wide café text'`. New 6/6. (Also ooxml R37 red: `RangeError [Error]: Invalid code point 1114112`.)

### G133d
(2) j16: doc-clean's tests used small well-formed XML and counted no work (R-CLOCK forbids timing), so the unbounded searches at `bio-plane/src/doc-clean/xml.mjs:130` (`<!x>`: `d.indexOf(0x5b, lt)` and `d.indexOf(GT, lt)` per declaration) and `:122`, `:132`, `:175-176` were never given a hostile shape; closed by `round9.test.mjs` R11 (scan counts `scanned_bytes` <= 4n over the shapes; yields every 65,536 tokens). Same class elsewhere: odf `odf.mjs` old `:359`/`:388`; office-readers `docx.mjs:196` and `pptx.mjs:197` `TOKEN_RE`; ooxml `:738`.
(3) Per module on the old code: doc-clean `round9.test.mjs` (shim) `R11 the scan yields ...` — `AssertionError ... actual: undefined, expected: 0` (21.6 s); `R11 a tag longer than boundOf(xml, tag) ...` — `expected DOCUMENT_UNREADABLE, got an answer  actual: true, expected: false`. odf `r9-linear.test.mjs`: tests 9, pass 0, fail 9, `✖ R52 an unterminated <a  (96 KB): scanned_bytes is at most 4 times the part and the read answers` — `scanned_bytes is stated  actual: 'undefined', expected: 'number'` (x6); `✖ R52 a tag longer than 64 KiB ...` — `TypeError [Error]: Cannot read properties of undefined (reading 'part')`; `✖ R52 yieldNow is awaited ...` — `0 yields for 240000 tokens`. office-readers `scan-bounds.test.mjs` R42: `✖ R42 docx ...` — `an unterminated tag: undefined vs 801124  actual: false, expected: true`; `✖ R42 text(parts, {yieldNow}) ...` — `yieldNow called 0 times`. ooxml `round9.test.mjs` `✖ R37 a part of unterminated tags is read in one pass, not once per tag (9373 ms)`. New: doc-clean 24/24, odf 9/9, office-readers 11/11, ooxml 26/26.

### G133e
(1) j3: `ooxml.mjs:1614-1625` `crossCheck(src, r, row, cdOffset)` reads each row's local header at the row's own offset (`src.read(lo, 30)`) in directory order, called once per directory row from the listing loop, so a shuffled directory costs a seek-and-read per row (record: 1972 part reads against 69 in physical order; the listing's count check `:1533` caps entries but the cost is the order).
(2) j3: every archive built by the test helpers had its central directory in physical order, so directory order equalled file order; no shuffled-directory fixture and no 10,000-entry case; closed by `round9.test.mjs` R38 (three tests).
(3) `7ef1a0a1c3^1`: `✖ R38 a shuffled central directory is listed with at most twice the part reads of the same archive in physical order, and the same rows` — `AssertionError: 1972 against 69  actual: false, expected: true`; `✖ R38 10,000 entries are listed whatever the directory's order, and 10,001 are refused whole by ARCHIVE_ENTRIES_MAX` — `actual: false, expected: true`. New 26/26.

### G134a
(1) j5: `docx.mjs:540-555` `text()` read only `word/document.xml` (`documentXml = UTF8.decode(main.bytes)`) and `word/comments.xml`; footnotes, endnotes, headers, footers, text boxes and tracked deletions were never read; pptx read speaker notes only (`NOTES_PART_RE` `pptx.mjs:153`); xlsx read no cell comments; so the text in the file was not in the index while `completeness` said whole. (j6's ODF half: `odf.mjs` `walkTextBody` old `:1106` fused a footnote onto its paragraph, nothing read headers/footers/masters.)
(2) j5: every fixture carried its text in the body only; closed by `parts-kinds.test.mjs` (five tests: R38 docx x2, pptx, xlsx; R39).
(3) `parts-kinds.test.mjs` on `3868441e0b^1`: tests 5, pass 0, fail 5: `✖ R38 docx: footnotes, endnotes, headers, footers, comments, tracked deletions and text boxes are units ...` — `TypeError [Error]: t.parts is not iterable`; `✖ R38 xlsx: a cell comment is a cell_note unit ...` — `TypeError [Error]: Cannot read properties of undefined (reading 'length')`; `✖ R39 a docx paragraph or a pptx slide whose only content is a picture ...` — `actual: undefined, expected: true`. New 5/5.

### G134c
(2) j5: `formats-xlsx.mjs` read no `xl/styles.xml` (no reference to styles anywhere in the module), so a date-formatted number could only be a number; no fixture had a styled date cell. Closed by `dates-typed.test.mjs` R30 (three tests).
(3) `dates-typed.test.mjs` on `3868441e0b^1`: `✖ R30 a number whose format is a date or date-time is typed date ...` — `AssertionError ... actual: [ 'number', '45413', undefined, null ], expected: [ 'date', '2024-05-01', '45413', null ]`; `✖ R30 the workbook's own date system: 1904 serials ...` — `actual: '0', expected: '1904-01-01'`; `✖ R30 a styles part that cannot be read leaves numbers numbers and is stated ...` — `actual: false, expected: true`. File: tests 5, pass 1, fail 4; new 5/5.

### G136c
(1) j16: `bio-plane/src/doc-clean/package.mjs:123-124` the writer's end record `...le16(parts.length), ...le16(parts.length)` is a 16-bit entry count with no ZIP64 end record or locator, so a package of 65,536 or more entries wrote a wrapped count; `:125` `[...local, ...central, end]` also spreads one array per entry. (Cleaner-crash half is case-carriage's per K4842 (4).)
(2) j16: fixtures had a handful of entries; none reached 65,535, so the 16-bit count never wrapped; closed by `round9.test.mjs` R5 R6 DOCS C1 (65,544 / 65,545 / 70,010 / 100,000 entries, names checked against Info-ZIP, Python zipfile and `ooxml.readContainer`).
(3) `aec59370ef^1`: the file fails whole at import: `SyntaxError: The requested module '../../../src/doc-clean/index.mjs' does not provide an export named 'CLEAN_MAX_ENTRIES'`. Shim run: first G136c test prints `✖ R5 R6 DOCS C1 a DOCX of 65544 entries is copied whole: written count == read count less the parts R6 removes, in order, the end record agreeing (Info-ZIP and Python list the same names) (4571.8ms)` and then `FATAL ERROR: Scavenger: semi-space copy Allocation failed - JavaScript heap out of memory` (exit 134); the assertion line itself is lost with the process (not captured). New: `round9.test.mjs` 24/24.

### G140
(2) j12: same gap as G133c (2): before the job doctypes had no hostile-shape or work-count test (`doctypes/test/` before: `bounded.test.mjs`, `doctypes.test.mjs`, `policy.test.mjs`, `regulation-sections.test.mjs`, `g23-recommendation.test.mjs`, readings and golden fixtures); closed by `doctypes/test/g140.test.mjs` (`a-a-a-` 101 s, one line of 16,000 addresses, 80,000 definitions, the `ctx.work` count absent) and, for the view garbage, `r37-view.test.mjs` (K4892). The g140 file was not run here (record: `a-a-a-` 101 s; two cases die at base + 16 MB, i.e. an out-of-memory risk next to another worker).
(3) j10 (site-profiles), `site-profiles/test/r9-bounded.test.mjs` on `af83ccca31^1`: NOT RED by assertion — `✔ R20 each stack detect adds at most 4 times its window to ctx.work.chars, whatever the shape of the text (130600.67ms)` PASSES on the old code (file: tests 8, pass 3, fail 5, total 130,783 ms); on `af83ccca31` the same test passes in 398 ms (8/8). The failures on old are R2 (`actual: undefined, expected: true`), R20 "the bounded detects give the signals and confidence the patterns gave on ordinary pages" and three R22 tests. Cause on old: `site-profiles/handlers/client-rendered.mjs:50` `/<div[^>]+\bid="(?:root|app|__next|ember-basic-dropdown-wormhole)"[^>]*>\s*<\/div>/i.test(text)` (also `aspnet-webforms.mjs:42-43`, `wordpress.mjs:39, 67-69`).

### G141
(3) j8, `detect-round9.test.mjs` on `8ff7cbe1bb^1`: `✖ R17: DOCS T13 — a note that mentions <html> or <!DOCTYPE html> in its first KiB is read as text, by whole bytes and by a source` — `AssertionError: Remember: the page template starts with <!DOCTYPE html> and then the <html> element.  actual: 'html', expected: 'html'` (the message is the fixture's note; the old detect (`formats.mjs:156-159` `head.includes("<!doctype html") || head.includes("<html")` over the latin1 first KiB, `:145`) takes the note for html). New 12/12.

### quotes/ooxml
(1) `bio-plane/src/ooxml.mjs` literals: `:114` 20 MiB, `:191` 32 MiB, `:195-196` piece sizes, `:265-275` the seven archive limits; none through `boundOf` (the module imported nothing from `read-bounds.mjs`).
(2) No ooxml test compared a constant with its READ_BOUNDS row; closed by `round9.test.mjs` R30, R6, R35.
(3) R30: `✖ ... actual: undefined, expected: 100000` (the OFFICE_ENTRIES_MAX limit, new). NOT RED for the literals themselves: `R6 and R35 the 20 MiB text bound and the 32 MiB ceiling are the office rows' alpha figures, taken through boundOf` passes on `7ef1a0a1c3^1` (figures equal, so a value test cannot see a literal); file pass 2, fail 24; new 26/26.

### quotes/csv-reader
(1) `csv-reader/index.mjs:270` `MEASURED_CSV_TEXT_BOUND_BYTES = 17 * 1024 * 1024` (17,825,792) and record cap/columns literals; replaced by `boundOf("csv","bytes")` etc.
(2) No test compared the module's ceilings with the table; closed by `bounds.test.mjs` (R6, R22).
(3) `bounds.test.mjs` on `adf3cf0a2b^1`: tests 2, pass 0, fail 2: `✖ R6 the bytes ceiling is the csv bytes row of READ_BOUNDS at its active figure ...` — `actual: 17825792, expected: 52428800`; `✖ R6 R22 the module declares its ceilings through boundOf and holds no numeric literal for one` — `MEASURED_CSV_TEXT_BOUND_BYTES resolves to the csv.bytes row  expected: /const MEASURED_CSV_TEXT_BOUND_BYTES = boundOf\("csv", "bytes"\)/`. New 2/2.

### quotes/office-readers
(2) `docx.mjs`, `pptx.mjs`, `formats-xlsx.mjs` took the table nowhere (only ooxml's constants); no test read `boundOf("office","retained_objects")`; closed by `scan-bounds.test.mjs` R44 (two table tests).
(3) NOT RED: `✔ R44 the bound is the table's row (250,000 paragraphs, cells and links together)` and `✔ R44 decoded characters: the figure is the table's row, taken through boundOf` both pass on `3868441e0b^1` (the rows exist in `READ_BOUNDS`; the tests read the row, not the module). The module-side red is G124c (3) above.

### quotes/odf-reader
(2) No odf test compared the module's ceilings with the table, and a numeric literal `262144` remained; closed by `r9-quotes.test.mjs`.
(3) `r9-quotes.test.mjs` on `4381970441^1`: tests 2, pass 1, fail 1: `✖ R45 the repeat bound is the READ_BOUNDS row ods.repeat_units, and the module keeps no literal for a ceiling` — `AssertionError: /\b262144\b/  actual: true, expected: false`. New 2/2.

### quotes/image-codecs
(1) Literals in the six sources, found by the new R13 test: `ccittdecode: 1 << 20` (`ccittdecode.mjs:122`), `jbig2decode: 1 << 28` (`jbig2decode.mjs:71`), `jpxdecode: 61_300_000` (`jpxdecode.mjs:85`), `pngdecode: 61_300_000` (`pngdecode.mjs:73`).
(2) No codec test compared a ceiling with the table or grepped for literals; closed by `bounds.test.mjs` R13 (a source grep).
(3) Shim run on `16c59da658^1`: `✖ R13 the module's source holds no numeric literal for a ceiling it keeps: each is read from READ_BOUNDS` — `ceilings written as literals  actual: [ 'ccittdecode: 1 << 20', 'jbig2decode: 1 << 28', 'jpxdecode: 61_300_000', 'pngdecode: 61_300_000' ], expected: []`. (Real file: import error as in G125a.) New 11/11.

### quotes/pdf-pixels
(2) pdf-pixels' ceilings (`PICTURE_FRAME_MAX`, `PICTURE_SOURCE_MAX`, the `/Parent` walk depth) were literals and no test compared them with the table; closed by `pagepixels.test.mjs` R49 (:1029-1050).
(3) `pagepixels.test.mjs` on `e191d0f0a3^1` (scratch-patched): `FAIL  R49 no product of literals spells a frame bound (4096 * 3072 * 3, 16384 * 12288 * 3)` and `FAIL  R49 the /Parent walk's depth is the table's too: no literal bound on the loop`; three other R49 tests PASS on old (`R49 no figure READ_BOUNDS holds for these rows is written as a literal`, `R49 the exported frame bounds are the table's`, `R49 the quoted rows are the figures the requirements name`). New 537 PASS / 7 FAIL (unrelated reds, see G132m).

### quotes/image-cover
(2) `index.mjs:21` `COVER_MAX_BYTES = 32 * 1024 * 1024` and `:26` `COVER_MAX_PIXELS = 120_000_000` were literals; no test compared them with the table; closed by `limits.test.mjs` R11.
(3) R11 (the 7/7 RED belongs to R10): `limits.test.mjs` on `16ba961bf5^1`: `✖ R11 no numeric literal in the module's code is a ceiling it keeps: each ceiling is the table's figure and no file holds one of its own` — `AssertionError: index.mjs holds the figure 120_000_000  actual: false, expected: true`. New 7/7.

### quotes/doc-clean
(2) `index.mjs:18` `CLEAN_MAX_BYTES = 16 * 1024 * 1024` and `package.mjs:14` `CLEAN_MAX_PART_BYTES = 32 * 1024 * 1024` were literals; the entry, tag and ratio bounds were not read from the table; no test compared them; closed by `round9.test.mjs` R12.
(3) Individually on `aec59370ef^1` (shim): `✖ R12 every ceiling is read from READ_BOUNDS: CLEAN_MAX_BYTES, the entry bound, the tag bound, the ratio; and no source line of the module holds a literal of one` — `AssertionError ... actual: undefined, expected: 100000`. New 24/24.

### quotes/file-scanner
(1) `file-scanner/src/limits.mjs` (pre-merge): `:13` `SCAN_MAX_BYTES = 268_435_456`, `:17` `SAFE_VIEW_PAGES_MAX = 500`, `:30` `SCAN_TIME_MS = 900_000`, `:31` `RENDER_TIME_MS = 600_000` as literals; ClamAV's own limits were not passed at all (record: `--alert-encrypted=no`, ClamAV defaults).
(2), (3) (unchanged; the record states (3) was not seen red: K4861, permission-check refusal in the job).

### quotes/sheet-worker
(2) `sheet-worker/test/sheet-worker.test.mjs` :146 and :476 (R14) only pinned that the three bounds are positive constants and that a workbook above one is refused (`contract.mjs` pre-merge `:33` `MAX_UNZIPPED_BYTES = 9_000_000`, `:35` `MAX_CELLS = 250_000`, `:39` `TIME_BUDGET_MS = 120_000`); nothing compared them with the READ_BOUNDS rows or looked for the literals; closed by the new R14 test (record RED: `contract.mjs types a literal matching /\b9[_,]?000[_,]?000\b/`).

### job 46
(2) The tests did not miss it: `newgroup/test/steps/observability.test.mjs` R36 ("every sentence is read by key") and R40 ("settings that cannot be read do not stop the act") were red at the tip (record J24: UNKNOWN_WORD `installer.fleet.logsunconfirmed`, 2 failing; 119 tests, 117 pass). The defect is a missing design row in `words.json`, not a code defect, so there is no test gap to fix; the code (`newgroup/src/steps/uploads.mjs:40-41`) was written correctly, and a `localize` there is refused by the words check (marker 1).

### job 47
(2) Every journey-check browser test relied on the environment having the pinned Chromium build; no test chose the browser, and `browser()` in `run.mjs` launched only the pinned path, so a missing build failed every launch (`walker.test.mjs` on this container: `browserType.launch: Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1194/...`). Closed by `chromium-path.test.mjs` (2 tests on `chromiumPath` with injected `exists`, plus a launch with `CHROMIUM` unset). The record notes that no requirement names the Chromium choice.

---

## Cells I could not close, and why
- Nothing was left without text, but these are closed only partly:
  - G136c (3), j16: no assertion line on the old code. The first DOCS C1 test is shown red (`✖ ... (4571.8ms)`) but the process then aborts out of memory (exit 134) before the failure detail prints; the file as a whole fails at import without a shim.
  - G128e (3) and G125d (3, 100 MiB case), j5: on the old code the R45 test and the 100 MiB R43 test have no assertion line; they exhaust memory (`FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory`, exit 134 at 1 GB; exit 137 killed by the OS in an uncapped full-file run).
  - G140 (2), j12: the old-code red of `g140.test.mjs` was not re-run here (record: 12 of 18 red on the tip; its cases take 101 s or die at base + 16 MB). The gap is stated from the old test directory listing and the record.
  - quotes/file-scanner (2), (3): unchanged; the record says the permission check refused the job's own run and K4861 rules the job's record states, per cause, that the test was written after the change.
- Skipped as not mine (labelled for other owners in the table): G92, G123a/b/c/f/h, G124a (3), G124b, G124d, G124f, G125a (3), G125e/f, G126 (registrar), G126f/g/j, G127b/d, G128b/c/d/g/h/i, G129c/e, G130c (1), G130d, G131g (2)(3), G132a/c/e/f/g, G132l (j7 parts), G134d, G136a/b/d/e, G137a-d, G138 (3, j23).

## NOT RED (BOB reopens these as entries)
1. G124e (3), j9: NOT RED on `9a21b5dcd9^1`: `bio-plane/test/m/text-chain/round9.test.mjs` "R93 R95 (G124e)" passes (file 2/9 pass on old; new 9/9). By design: nothing changed, pinned.
2. G126d (1), j3: NOT RED on `7ef1a0a1c3^1`: `round9.test.mjs` "R7 ... (G126d audit)" passes (file 2/26 pass on old; new 26/26): ooxml had no defect for this cause.
3. quotes/ooxml and G124c j3 side: NOT RED on `7ef1a0a1c3^1`: `round9.test.mjs` "R6 and R35 the 20 MiB text bound and the 32 MiB ceiling are the office rows' alpha figures, taken through boundOf" passes (2/26 pass on old).
4. quotes/office-readers (3), j5: NOT RED on `3868441e0b^1`: `scan-bounds.test.mjs` "R44 the bound is the table's row ..." and "R44 decoded characters: the figure is the table's row ..." pass (2/8 pass on old).
5. G132i (3), j14: NOT RED on `e191d0f0a3^1`: `pagepixels.test.mjs` "R16 a scan with a text line is refused PAGE_HAS_TEXT_LAYER without the option" and "... is rendered with allowTextPage" pass on the old code (pdf-pixels already took `allowTextPage`; the defect is the caller's).
6. G140 (3), j10: NOT RED by assertion on `af83ccca31^1`: `site-profiles/test/r9-bounded.test.mjs` "R20 each stack detect adds at most 4 times its window ..." passes 1/1 on old in 130,600 ms (new 398 ms); red only by time, which the test does not assert (R-CLOCK).

## Refused commands
None. No command was refused by a safety or permission check.

## Counts
(see the final message)
