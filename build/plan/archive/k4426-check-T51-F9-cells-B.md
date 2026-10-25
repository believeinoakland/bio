# K4426 F9 — MISSING cells closed, worker B (jobs 7, 20, 23, 24, 25, 26, 27; plus the "open: job N" rows of jobs 28, 33, 40, 42, 56-59)

Method: merge commit from `git log --merges origin/tranche/T51`, pre-merge code by `<merge>^1`, tests of the job copied in from `<merge>` onto a scratch worktree at `<merge>^1` (`/home/user/k4426-b/...`, removed at the end), plane tests run one file at a time with `node --import ./test/platform-sqlite.mjs --test --test-force-exit <file>` from `bio-plane/`. Line numbers are of the pre-merge file unless marked "new". Cells not named under a row are "(unchanged)". Cells that belong to another job (j3, j4, j5, j6, j8 ...) are not touched here.

---

## Job 7 pdf-reader — merge `6e395fddb5` (Merge job/T51/pdf-reader, fix round 9 batch B; K4866), pre-merge `c0880172c0`

Red runs of the job's new test files on `c0880172c0` (all of `bio-plane/test/m/pdf-reader/`: revisions, cmap, bounds, rangebound, embedded, pagesource copied from `6e395fddb5`): revisions pass 2 fail 9; cmap pass 1 fail 3; bounds 3 fail then the process was killed (see G125a); rangebound pass 0 fail 3; embedded pass 2 fail 1; pagesource fails to load (no `pageSource` export). On `6e395fddb5`: revisions 11/11, cmap 4/4, bounds 8/8, rangebound 3/3, embedded 3/3, pagesource 9/9.

### G124d
(1) (unchanged)
(2) The old tests read pages that fit: `memory.test.mjs` and `range.test.mjs:83` use the real BUDGET volumes and `dense.mjs` pages, none whose content stream inflates past a page bound; `range.test.mjs:105` tested `maxBytes` only with uniform pages (the document's average), so a heavy page among light ones was never a case. Closed by `bounds.test.mjs:15` (200 KB stream inflating to 200 MB as page 3 of 10) and `rangebound.test.mjs:60` (heavy page among light ones).
(3) (unchanged); also seen red on `c0880172c0`: `rangebound.test.mjs:60` "R43: maxBytes is judged against each page's own decoded size ... light pages together, the heavy one alone (66000 decoded bytes against 200)" (a `+ actual - expected` diff of the range sizes: the old code splits by the document's average, `pdfstructure.mjs:4517`); `bounds.test.mjs:15` first line `✖ R41, R22: a page whose decoded content passes the page bound is stated with its figures ... (14460ms)`: `0 !== 1` (`actual: 0, expected: 1`, no page_over_bound marker). Green: bounds 8/8, rangebound 3/3 on `6e395fddb5`.
(4) (unchanged)

### G125a (j7's cell (3))
(3) RED, j7 raw/Flate image route: on `c0880172c0`, `bounds.test.mjs` runs its first three tests red (R41/R22 page bound `0 !== 1`; stream under 128 KiB `0 !== 1`; object stream/CMap/embedded `AssertionError []`) and the process is then KILLED at the 4th test, "R22: an image stream's declared size is judged before anything is allocated for it" (exit status 137, out of memory: the old code allocates from the declared width x height; not rerun, it takes the box's memory). On `6e395fddb5` the same test passes (`--test-name-pattern="image stream's declared size"`: pass 1, fail 0; whole file 8/8).

### G125e
(2) No old test inflated a Flate stream past a cap: the old suite's streams were the real volumes' own and small synthetic ones; the 128 KiB compressed threshold (`pdfstructure.mjs:498` `LARGE_RAW_BYTES`, inflate at `:819` with `INNER_DECODE_MAX` 128 MiB at `:495`) had no test above it or below it. Closed by `bounds.test.mjs:15`, `:37` (a stream under 128 KiB compressed is held to the same cap), `:50` (object stream, CMap, embedded file each held to the cap of its kind).

### G125f
(2) Every CMap in the old tests (pdf-reader dir, `pdfstructure.test.mjs`, `pdfgen.mjs`) has one codespace range, `<00> <FF>` (8 times) or `<0000> <FFFF>` (4 times), and a `bfrange` of a few dozen codes (`ascii-filters.test.mjs:97`: `<20> <7E>`); none a range of millions of codes, so the expansion loop (`parseBfrange`, `pdfstructure.mjs:1724`) was never loaded. Closed by `cmap.test.mjs:54`.
(3) (unchanged); the committed test's first failing line on `c0880172c0`: `✖ R12: a bfrange of more codes than the bound is looked up arithmetically, and the text is exactly what expansion gives (15314ms)` `AssertionError: a 16.7 million code range is not expanded` (`actual: false, expected: true`). Green 4/4 (cmap) on `6e395fddb5`.

### G128c (j7's cells)
(1) `pdfstructure.mjs:4520-4523` (old `readRange`): the `out(...)` answer of a range was only `{ok, container, pages, from, count, text}`; the document's metadata (`/Info`), page boxes, the images of the range's pages (`pdfPageImages`, `:2978`) and glyph/word counts were computed only by `extractPdfStructure`, so a reading assembled from ranges lacked them.
(2) Old `range.test.mjs:48` and `opened-range.test.mjs:113` compared a range's text pages with the whole reading's and ranges with each other (`deepEqual(range, extractPdfRange)`), never a document-level field of the range against the whole's. Closed by `rangebound.test.mjs:20` and `:35` (union of ranges equals the whole's metadata, page boxes, images, counts for any partition).
(3) RED on `c0880172c0`: `✖ R46: every range answer carries the document's metadata and page boxes, the images placed on its pages, and its glyph and word counts, beside text` `AssertionError: Expected values to be strictly deep-equal: + undefined - { source: '/Info', title: 'Range Title' }` (`rangebound.test.mjs:24`); same for `:35`. Green 3/3 on `6e395fddb5`.

### G132a
(2) All old encrypted fixtures name the encryption dictionary by reference (`/Encrypt 90 0 R` in `active.test.mjs:164`, `metadata.test.mjs:60`, `text.test.mjs:18`, `title.test.mjs:168/172`, `dense.mjs:63`, `pdfstructure.test.mjs:530`, `pdfdoc.test.mjs:300`) and `pdfdoc.test.mjs:105` pinned the old rule ("a /Filter /Standard dict carries a numeric /R"), so a direct `/Encrypt << >>` or a trailer-only test was never run. Closed by `revisions.test.mjs` "R9, R23" and "R9, R43".
(1 detail) `pdfstructure.mjs:1021-1034` `isEncrypted()` looked only for a Standard-handler dict with numeric `/R` among the top-level objects, never the newest trailer's `/Encrypt`.
(3) (unchanged); committed test, first failing lines on `c0880172c0`: `✖ R9, R23: a /Encrypt entry in the newest trailer, direct or by reference, is an encrypted document ... actual: [], expected: [ { page: null, reason: 'encrypted', font: null, codes: '', count: 0 } ]`; `✖ R9, R43: a range over an encrypted document answers the marker with final true and count 0 ... actual: undefined, expected: true`. Green 11/11 (revisions) on `6e395fddb5`.

### G132c
(1 detail) `pdfstructure.mjs:970` `this._objs.nums(1, "Catalog")[0]`: the catalog was the first `/Type /Catalog` in object-number order, not the trailer's `/Root`.
(2) Every old fixture has exactly one catalog (`1: << /Type /Catalog /Pages 2 0 R >>`); no test appended a revision with a second catalog. Closed by `revisions.test.mjs` "R8: the page tree is walked from the catalog the newest trailer's /Root names".
(3) (unchanged); the committed test on `c0880172c0`: `✖ R8: the page tree is walked from the catalog the newest trailer's /Root names ... actual: [ 'FIRST' ], expected: [ 'SECOND-A', 'SECOND-B' ]`.

### G132e
(1 detail) `pdfstructure.mjs:977-987` (`walkRef`): a `/Kids` entry registered as a page only when `/Type /Page` was stated (`:979`), a leaf without it fell through and was dropped.
(2) Old fixtures state `/Type /Page` on every leaf; none omitted it. Closed by `revisions.test.mjs` "R8: a /Kids entry with no /Kids of its own is a page".
(3) (unchanged); committed test on `c0880172c0`: `actual: [ 'ALPHA', 'CHARLIE' ], expected: [ 'ALPHA', 'BRAVO', 'CHARLIE' ]`.

### G132f
(1 detail) `pdfstructure.mjs:996, 1006` set `pageCount` from the pages the walk found and never compared it with the root's `/Count`; `notes` stayed empty.
(2) No old test built a file whose tree declares more pages than are readable (a cut file); closed by `revisions.test.mjs` "R8: a file cut at 70 percent reads the pages it can find and states the rest".
(3) (unchanged); the committed test fails on `c0880172c0` (listed `✖ R8: a file cut at 70 percent reads the pages it can find and states the rest (structure_reconstructed, pages_missing 10 of 30) (8.15ms)`). Green 11/11 on `6e395fddb5`.

### G132g
(1 detail) `pdfstructure.mjs:1671-1674` `parseToUnicodeCMap` took the width from the FIRST codespace range only; `:1899` `bytesToCodes` read `code = (code << 8) | byte`, which is signed for a 4-byte code (the `-7fffffff` of the red).
(2) Every old CMap has one codespace range (counts under G125f) so no CMap mixed widths and no 4-byte code at or above 0x80000000 occurred. Closed by `cmap.test.mjs:27` and `:46`.
(3) (unchanged); the committed tests on `c0880172c0`: `✖ R12: codes of different widths in one CMap are each read at the width their codespace range gives` `'XX' !== 'XYX'`; `✖ R12: a code is unsigned whatever its width` `'' !== 'XY'`. Green 4/4 on `6e395fddb5`.

### G132l (j7's cells)
(1) j7 (a), the TIFF predictor: `pdfstructure.mjs:238` `if (predictor < 10) return data;` returned a TIFF-predicted (Predictor 2) stream's bytes as if un-predicted, answered as decoded (callers at `:838-841`, `:4076-4078`).
(3) RED on `c0880172c0`: `bounds.test.mjs:91` run alone (`--test-name-pattern="TIFF predictor"`): `✖ R22: a stream with a TIFF predictor is not passed through as if un-predicted: streamDecoded answers null; PNG predictors still decode (12ms)` `actual: Uint8Array(100) [ ... ], expected: null`. Green on `6e395fddb5` (bounds 8/8).

### Table 2 `pdf-reader` (quotes)
(1) (unchanged)
(2) The old module kept its ceilings as literals (`INNER_DECODE_MAX = 128 * 1024 * 1024` at `:495`, `STREAM_MAX = 8 * 1024 * 1024` at `:3757`, `OBJ_WINDOW_MAX`, `READ_LIMIT_MB`) and no test compared them with the table or read the source for numbers. Closed by `bounds.test.mjs:110` (R48).
(3) RED on `c0880172c0` (`--test-name-pattern="R48"`): `✖ R48: every ceiling this module keeps is read from READ_BOUNDS by name, and none is a number of its own (1.56ms)` `AssertionError [ERR_ASSERTION]: pdf.page_content` (`actual: false, expected: true`). Green on `6e395fddb5` (bounds 8/8).
(4) (unchanged)

---

## Job 20 plane-1 (PLANE #56, test-only plus `bio-plane/package.json`) — merge `d1325da819` (K4855), pre-merge `a107dc9499`

Method: scratch worktree at `a107dc9499`; the job's `*.test.mjs` files and the new test-only helpers `shape/bars.mjs`, `shape/cap.mjs` (where named) copied in from `d1325da819`, the OLD `shape/harness.mjs`, `g41.probe.mjs`, `g44.probe.mjs`, `g26.probe.mjs` and `package.json` kept (the defects are in those). Product code is unchanged by this job, so a failing-first test here is red against the old harness/script.

### G123a (j20's cells)
(1) Two cap conventions in the harness: `shape/harness.mjs:41-44` `OBJECT_MB = 128`, `capFor = (heldMiB) => Math.floor(OBJECT_MB - heldMiB)` (the PDF runs, g26/g15/g13) against `shape/g41.probe.mjs:13, 34` `D_MB = 39`, `g41Cap = floor(128 + D_MB - bytes/1048576)` and `shape/g44.probe.mjs:16-18` `g44Cap = capFor(N) + D_MB` (the sheet runs). The re-pointed files are the six named in the record.
(2) Each probe's test passed under its own cap and no test compared the two functions, and none used the plane's own `capFor` (`byte-ledger.mjs:48`, runtime-limits R33). Closed by `g41-shape.test.mjs:24` ("R84 G123a: the cap is the one convention, `capFor`").
(3) RED on `a107dc9499` (`g41-shape.test.mjs` with `shape/bars.mjs` and `shape/cap.mjs` added, `--test-name-pattern=G123a`): `✖ R84 G123a: the cap is the one convention, `capFor`: the sheet runs' and the PDF runs' are the same function of the held MiB ... (1.66ms)` `AssertionError [ERR_ASSERTION]: 4 MiB` `actual: 163, expected: 124`; pass 0 fail 1. On `d1325da819` the same: pass 1 fail 0.
(4) (unchanged)

### G123b (j20)
(1) `shape/harness.mjs:254-255` (old): `const timer = setInterval(sample, 2); clearInterval(timer);` — the 2 ms sampler is cleared on the very next line (and again at `:295`), so the peak was read only at `sample()` calls between ticks (`:285`, `:292`); a buffer allocated and freed inside one tick left no trace. The pass/fail bars were wall-time (`TICK_MS_MAX`, `loadFactor`, `referenceMs` in `g41.probe.mjs`).
(2) No test exercised the harness itself: nothing planted a leak inside one tick to see whether `peakMB` showed it (the old `shape/` has probes only, no `*.test.mjs` of the harness). Closed by `shape-harness.test.mjs:22` ("R84 G123b: a buffer held inside one tick shows in that tick's peakMB; the clean tick beside it and the control do not") and the count bars in `shape/bars.mjs`.
(3) RED on `a107dc9499` (`shape-harness.test.mjs` against the old `shape/harness.mjs`): `SyntaxError: The requested module './shape/harness.mjs' does not provide an export named 'shimApplied'` (pass 0 fail 1: the file does not load; the old harness has no in-tick injector `leakAt` to plant the leak). So the leak-inside-one-tick test itself is NOT shown red on its own by this run; the record's "seen red with the sampler off" is the job's own and was not reproduced here.
GREEN on `d1325da819`: shape-harness pass 6 fail 1, run twice: the failing test is exactly this one, `✖ R84 G123b: ... the control do not (2939ms)` `AssertionError: control` (`shape-harness.test.mjs:28`, `actual: false, expected: true`): the control's bimodal peak. On the tranche tip `b9a4c9acb0` (after doctypes-2, K4899): pass 7 fail 0. So the table's "7/7" holds at the tip and not at the job's merge; K4899's re-attribution is confirmed by this run.
(4) (unchanged)

### G123c (j20's cells)
(1) `shape/harness.mjs` (old): the only fault the harness could make was `spec.fault {remote:true}` (a broken stub, `fault.probe.mjs:5`); the alarm was driven by `await x.s.onAlarm(at); at += 3_600_000` (`:283`) over storage that is never killed, restarted or made to refuse a write: no kill/restart/store-failure/entry-throw/evidence-gone injection.
(2) The old probes ran clean reads only (g41, g44, g26, g13, g15, keep40) and the one fault probe; nothing could put the object through a mid-tick kill or a restart, so a consumer that fails at tick 2 or an alarm lost at restart (G91/G93) could not appear. Closed by the six G123c tests of `shape-harness.test.mjs` (`storeFailAt`, `entryThrowsAt`, `objectGoneAt`, `killAt`, `restartAt`, shim).
(3) RED: same run as G123b on `a107dc9499`: the whole file fails to load, `SyntaxError: ... does not provide an export named 'shimApplied'` (pass 0 fail 1); the injectors `faults.*` do not exist in the old harness. GREEN on `d1325da819`: the six G123c tests pass (6 of 7, the seventh is the G123b control above).
(4) (unchanged)

### G123f
(1) `shape/harness.mjs:308-327` (old): after the ticks the harness asked `ex.cellsOf(sha, sheet, { fromRow: gen.lastRow, toRow: gen.lastRow })` — the last row only; no range crossing a block edge, no over-bound range read by `next_row`, no cited range (`contentMint`, `cellsAt`), no `tabledeclare` / `workbookadd`.
(2) The proof ran the last-row read alone, and no test existed for the range, citation or workbook paths at the platform's shape. Closed by `g123f-cells.test.mjs` (3 tests).
(3) RED on `a107dc9499` (test file from the merge, old harness): `✖ R84 G123f: a 3 MiB CSV: the last row, a block edge and an over-bound range, read and cited, equal the generator's ... (2959ms)` `AssertionError [ERR_ASSERTION]: the ranges were asked` (`g123f-cells.test.mjs:21`, `actual: undefined, expected: true`); the 16,000-row xlsx test the same; pass 0 fail 3. GREEN on `d1325da819`: pass 3 fail 0.
(4) (unchanged; the record's "walk row is BOB's" stands)

### G123h
(1) `bio-plane/package.json:6` (old): `"test": "node --test \"test/m/**/*.test.mjs\""` — no `--import ./test/platform-sqlite.mjs`, so `npm test` ran without the platform's 2,098,176 B value limit that the module runner applies.
(2) The suite pinned the defect: `worker.test.mjs` R7/R64 asserted `pkg.scripts.test === 'node --test "test/m/**/*.test.mjs"'` (changed in the merge to the preload form); nothing compared `npm test`'s command with the runner's preload. Closed by `g123h-preload.test.mjs` (2 tests) and the re-pointed pin.
(3) RED on `a107dc9499` (old `package.json`): `✖ G123h: `npm test` applies the preload the module runner applies (1.74ms)` `AssertionError ... actual: [], expected: [ '.../bio-plane/test/platform-sqlite.mjs' ]`; `✖ G123h: the 2,098,176 B value shim fires on a 2,100,000 B row under both runs ...` `AssertionError: npm test`; pass 0 fail 2. GREEN on `d1325da819`: pass 2 fail 0.
(4) (unchanged)

---

## Job 23 acquisition (ACQUISITION #32) — merge `d821b61a02` (K4887), pre-merge `879a7ce60f`

Method: scratch worktree at `879a7ce60f`, the job's eleven new `r9-*.test.mjs` copied in from `d821b61a02`, each run alone. Old/new counts (pass/fail): r9-ceilings 1/2 -> 3/0; r9-decode 0/7 -> 7/0; r9-failed-ends 1/2 -> 3/0; r9-format-range 2/3 -> 5/0; **r9-multipart-memory 3/0 -> 3/0 (NOT RED)**; r9-pending-render 2/2 -> 4/0; r9-pictures-unread 1/1 -> 2/0; r9-read-range file does not load -> 4/0; r9-registrar 0/5 -> 5/0; r9-render-charge file does not load (0/1) -> 6/0; r9-unpack-transient file does not load (0/1) -> 3/0.

### G124b (j23's cells)
(1) Two defects, both in `bio-plane/src/acquisition/index.mjs` (old). R114 (the ceilings): `:364` `export const CAPTURE_MAX = 256 * 1024 * 1024;`, `:373` `MULTIPART_KEEP_MAX = 32 * 1024 * 1024;`, `:135` `PROFILE_TEXT_MAX = 8 * 1024 * 1024;` were literals, and the over-ceiling answer (`:816`) carried `bytes`/`maxBytes` without the table's key. R115 (held twice): `:1343, :1355` the parts of a multipart capture are kept as separate buffers (`keptParts`), and `:1576` joins them into a second buffer of the whole's size (`whole0`) beside them, so a 20 MiB capture was held about twice.
(2) Nothing compared the module's ceilings with the table, and the old multipart tests (`fix*-t51`, `t50`) asserted what was filed, never what was held: the old module had no byte ledger, so memory held was never counted. Closed by `r9-ceilings.test.mjs` (R114) and `r9-multipart-memory.test.mjs` (R115).
(3) R114 RED on `879a7ce60f`: `✖ R114: a capture declared one byte over the limit is refused TOO_LARGE (413) with size, bound and key, nothing filed; at the limit it is not refused (control) (11.28ms)` `actual: [ undefined, undefined, undefined ], expected: [ 268435457, 268435456, 'limit.archive.uploaded_bytes' ]`; `✖ R114: this module's source keeps no numeric literal for a ceiling it quotes (0.93ms)` `AssertionError: CAPTURE_MAX` (`actual: 'export const CAPTURE_MAX = 256 * 1024 * 1024;'`). GREEN `d821b61a02`: 3/3.
**R115 NOT RED on `879a7ce60f^`: `r9-multipart-memory.test.mjs` passes 3/3** — and it is vacuous there: a scratch copy printing `ledger.peak()` shows `PEAK 0` on the old module (it ignores `opts.ledger`, so the assertion `peak <= kept + part` holds trivially) and `PEAK 29360128` (= kept + one part, exactly the bound) on `d821b61a02`. The R115 change is real (`:1576` second copy removed) but the committed test cannot see the defect; BOB reopens it as an entry (the test should assert the ledger was fed, `peak > 0`, or count the old module's `whole0` copy another way).
(4) (unchanged)

### G124g (j23's and j24's cells; j24's red is under Job 24)
(1) j23: `index.mjs:364` `CAPTURE_MAX = 256 * 1024 * 1024` stood for the archive's uploaded-bytes ceiling as a local literal, in no table row; the TOO_LARGE answer at `:816` carried no size/bound/key. (The table's alpha 256 MiB is `boundOf("archive","uploaded_bytes")`, K4882.)
(2) No test compared the module's ceiling with the table (same as G124b).
(3) RED: the two `r9-ceilings.test.mjs` failures quoted under G124b (`actual: [ undefined, undefined, undefined ], expected: [ 268435457, 268435456, 'limit.archive.uploaded_bytes' ]`; `AssertionError: CAPTURE_MAX`). Green 3/3.

### G126f (j23's cells)
(1) No registrar call exists anywhere in the pre-merge module (`index.mjs`, `unpack.mjs` contain no `registerJob`); an `acquire` whose profile named `zip` stopped at the profile and the render/keep/subresources debts were left to the plane's ledger alone, so no `unpack`, `fetch`, `keep` or `subresources` job row was ever written.
(2) No acquisition test had a registrar (`job-registrar-stub.mjs` existed, with no use in `test/m/acquisition`; count 0), so "a row is written" could not be asserted. Closed by `r9-registrar.test.mjs` (5 tests on `jobRegistrarStub`).
(3) RED on `879a7ce60f`: `✖ R116 (fetch): a large web page parked by a member's press leaves one `fetch` row keyed by its session, and a second press leaves the same one (350ms)` `TypeError [Error]: Cannot read properties of undefined (reading 'session')`; the keep, subresources, unpack and refusing-registrar tests also fail; pass 0 fail 5. GREEN `d821b61a02`: 5/5.

### G126g
(1) (unchanged: `acquisition/index.mjs:571` `const PENDING_RENDERS = new Map()`, set `:1670`, read `:2182`, deleted `:2217, :2221, :2245`)
(2) Old restart tests only restarted BEFORE the render returned and pinned the lost run as "renders afresh" (`fix2-t51.test.mjs:123-129`, `fix3-t51.test.mjs:412` "R99 R12 R5 (C13b): the object restarted (the render table is gone): finishing the capture renders afresh"); no test restarted the object between the render's return and its delivery, where the answer lived only in the isolate's map. Closed by `r9-pending-render.test.mjs` (4 tests).
(3) (unchanged: "RED before") plus the assertion lines from `879a7ce60f`: `✖ R117, R99, R100: the object restarts after the render returned and before its delivery: the row finds the kept page in the record, delivers the document once and renders nothing again (112ms)` `AssertionError: what the run answered is written beside the row` (`actual: undefined, expected: true`); `✖ R117: a failed render's answer is written beside the row too ...` `TypeError: Cannot read properties of undefined (reading 'ok')`; pass 2 fail 2 (the two controls pass). GREEN: 4/4.

### G127d (j23's cells)
(1) New service (the record's own words); the missing capability is the defect: `bio-plane/src/acquisition/index.mjs` (old) exports no `readRange`, so a consumer of a multipart capture could read only a whole part or the whole (callers reached for `ev.get(sha, {range})` on one part, e.g. the profile at `:1932`, or `partsSource` in `unpack.mjs`).
(2) Nothing could be tested for a range across a part seam because no such function existed; a ranged read of a whole stored in parts, past the end, and the failing store were untested. Closed by `r9-read-range.test.mjs` (4 tests).
(3) RED on `879a7ce60f`: `SyntaxError: The requested module '../../../src/acquisition/index.mjs' does not provide an export named 'readRange'` (`r9-read-range.test.mjs`, pass 0 fail 1: the file does not load). GREEN `d821b61a02`: 4/4.

### G128i (j23's cells) — NOT CLOSED
(1)-(3) Cannot be closed from j23's evidence: the record has no G128i item, the j23 diff (`d821b61a02^1..d821b61a02`, grep G128/X29/audit/silent) names none, and no j23 test carries the id. The plan's mapping gives j23 "X20/X29 parts": X20 is the G129e item (unpack's store-failure `not_filed`, R121; its cells are below) and X29 is covered, if at all, by G138's `pictures_unread` count (R119); neither is a separate cause piece of G128i. The audit rows of G128i itself (photo OCR, frontier, cite, files over 25,165,824 B, the 504) are job 41's and reading-pipeline's. Left MISSING; BOB decides whether the row is closed by the G129e and G138 evidence or reopened.

### G129e (j23's cells)
(1) `bio-plane/src/acquisition/unpack.mjs:702` (old): `try { stored = await storeChunks(ev, chunks); } catch { stored = null; }` followed by the `!stored` branch that files the entry `not_filed`: any exception from the store (a `put`/`head` hiccup) became a permanent verdict for the member.
(2) The old tests gave `not_filed` only to deterministic causes (`archive-entries.test.mjs:71`, `archivelist.test.mjs:68-114`: locked, link, ambiguous names, corrupt) and never made the bucket fail for one member, nor had a member over one part held whole. Closed by `r9-unpack-transient.test.mjs` (DOCS A11, A10, control).
(3) RED on `879a7ce60f` (the test file with its `readRange` import shimmed out, since the file imports the new export and would otherwise fail to load): `✖ R121 (DOCS A11): a put that fails for entry 3 leaves it with no outcome, counted in waiting; the next call files it, and the others are untouched (88ms)` `AssertionError: the failed entry is counted in waiting` (`actual: 0, expected: 1`); `✖ R121 (DOCS A10): a member over one part is kept whole ...` `AssertionError: and held whole under its own digest` (`actual: false, expected: true`); the corrupt-member control passes; pass 1 fail 2. Unshimmed, the committed file fails to load on the old module (`does not provide an export named 'readRange'`). GREEN `d821b61a02`: 3/3.

### G130c (j23's part; the row's MISSING cells are j27's (1) and j8's (3))
RED lines for `r9-format-range.test.mjs` on `879a7ce60f` (the record gave none): `✖ R101 (G130c): an office file past 8 MiB, in several parts, is docx; an OpenDocument file is odt, certain; neither is zip nor undetermined` `actual: 'undetermined', expected: 'docx'`; two more fail (whole past 8 MiB; the unread control); pass 2 fail 3. GREEN: 5/5.

### G131g (j23's cell (3))
(1 detail) UTF-8-only decodes in the old module: `index.mjs:158` (`new TextDecoder("utf-8", { fatal: true })`: a non-UTF-8 text is not text), `:245`, `:1932`, `:2095-2096`; `title.mjs:73-74` read only a meta charset.
(3) RED on `879a7ce60f` (`r9-decode.test.mjs`): `✖ R120 (T7, 102400 bytes): UTF-16LE with a BOM, and UTF-8 with a BOM, are decoded (17ms)` `TypeError [Error]: Cannot read properties of undefined (reading 'encoding')` (no `profile.text_encoding`); the 3 MiB variants, the Windows-1252 title (`✖ R120 (H5)`), `ENCODING_UNSUPPORTED` (`✖ R120 (T7)`) and `textTypeOf` fail the same way; pass 0 fail 7. GREEN `d821b61a02`: 7/7.

### G137c (j23's cells)
(1) `bio-plane/src/acquisition/index.mjs:1497-1503` (old): one `renderer.render(...)` call, no retry and no class; `cap.renderSpend({ ms: a && a.elapsed_ms, releaseMs: renderReserved, ...})` — a failed render answered `{ok:false, error}` with no `elapsed_ms`, so the whole reservation was charged (j22's side); a page that answered 4xx, a `chrome-error://` location, an empty shell or an oversized DOM was accepted and filed as the visitor copy (no judgement of what came back).
(2) The old render-failure tests scripted only `{ ok: false, error: "crashed" }` (`acquire.test.mjs:244`, `checks.test.mjs:66`, `fix2-t51.test.mjs:133`): no elapsed time, no class, no retry sequence, no 403/404/error-page/empty-shell/oversize answer. Closed by `r9-render-charge.test.mjs` (6 tests).
(3) RED on `879a7ce60f` (test file with its `RENDER_TRIES` import shimmed to 3; unshimmed it fails to load: `does not provide an export named 'RENDER_TRIES'`): 5 of 6 fail, e.g. `✖ R118 (V5): a page that answered 403, a chrome-error:// location and an empty shell are not filed as the document: RENDER_FAILED, permanent, stated` `actual: undefined, expected: 'permanent'`; `✖ R118: a transient failure that never passes is tried RENDER_TRIES times ...` `actual: undefined, expected: 'transient'`; only the success control passes; pass 1 fail 5. GREEN `d821b61a02`: 6/6 (including the DOM-bound test, green after B38).

### G138 (j23's cell (3))
(3) RED on `879a7ce60f`: `✖ R119 (S15): a rendered page that loaded 40 pictures of 1.5 MiB states their count and summed size as kept and not read (1050ms)` `AssertionError: ... + actual - expected` `actual: undefined, expected: { count: 40, bytes: 62914560 }` (`supportingOf`, `index.mjs:2015`, has no `pictures_unread`); pass 1 fail 1. GREEN `d821b61a02`: 2/2.

---

## Job 24 capture (CAPTURE #52) — merge `b2f2f02502` (K4891), pre-merge `b2dad8337f`

Method: scratch worktree at `b2dad8337f`; the job's `r9-t51.test.mjs` and the changed test helper `fixture.mjs` copied in from `b2f2f02502`; `r9-t51.test.mjs` alone: old pass 5 fail 13, new (at the merge) pass 18 fail 0.

### G124g (j24's cells)
(1) `bio-plane/src/capture/index.mjs:742-744` (old `uploadCapture`): the stream was read until its running total passed `CAPTURE_MAX` (`if (total > CAPTURE_MAX)` -> `TOO_LARGE` with `bytes`/`maxBytes`); `CAPTURE_MAX` was already the archive row of the table (acquisition's R114 had merged, `acquisition/index.mjs:370`), but it was the only ceiling: the platform's request-body ceiling (104,857,600 B) was absent, the request's declared length was never judged before reading, the answer carried no key, and no byte ledger counted what was held; `bio-plane/src/capture/ops.mjs:83` (old `captureObjectOp` put): `new Uint8Array(await req.arrayBuffer())` with no ceiling at all (the request's buffer and a copy).
(2) No upload or put test named a ceiling on either side or counted bytes held (the record's own words; the old tests asserted receipts/profiles). Closed by `r9-t51.test.mjs` R111 tests (6 of the 18).
(3) RED on `b2dad8337f`: `✖ R111 (G124b, G124g; K4838 (6)): a body one byte past the platform's request ceiling is refused 413 naming its size and the ceiling, the stream cancelled and no receipt, actor or row written; a body at the ceiling is accepted ...` `actual: [ true, undefined, undefined, undefined, undefined ], expected: [ false, 'TOO_LARGE', 413, 104857601, 104857600 ]`; `✖ R111 (the table's ceiling): CAPTURE_MAX is the archive row of READ_BOUNDS ...` `actual: [ true, undefined, ... ], expected: [ false, 'TOO_LARGE', 413, 3145729, 3145728 ]`; the ledger tests `R111 (G124b)` (24 MiB upload) and `R111 (G124b; R21)` (24 MiB put) also fail. GREEN `b2f2f02502`: 18/18.

### G127b — NOT RED
(2) The record says there is no cause in capture: the digest was already the whole's at capture's interface (hashed as the body arrives; receipt, actor, document and reading under it), so the "gap" is that no test at that interface compared the document's digest, the receipt's address, the actor and the parts' own digests for a multipart TIFF/JPEG, nor two members uploading the same bytes. Closed by the two R108 tests of `r9-t51.test.mjs`. The register builder's first-part digest symptom is screens-intake's and provenance's (rec REPORT 1, 3).
(3) **NOT RED on `b2dad8337f`: `r9-t51.test.mjs` R108 tests pass 2/2** (`✔ R108 (G127b; SHEET C02, SCAN E7): a multipart TIFF and a multipart JPEG over 8 MiB are one capture under the whole's digest ...`, `✔ R108 (control and the second member) ...`; the file as a whole is 5 pass / 13 fail on the old code, the 13 being R109-R111). BOB reopens it as an entry or accepts it as a characterization test. (R112 / G137c likewise: the two R112 tests pass on the old code.)

---

## Job 26 file-safety (FILE-SAFETY #20) — merge `7176cd7d57` (K4899), pre-merge `86a7a3b9aa`

Method: scratch worktree at `86a7a3b9aa` (the record's own "254bc3365c" is an older base), the job's eight new `r*.test.mjs`, `r9-kit.mjs` and the changed `fixture.mjs` copied in from `7176cd7d57`, each file alone. Old / new (pass/fail): r1-registrar 0/2 -> 2/0; r11-paging file does not load -> 2/0; r12-render-classes does not load -> 3/0; r53-reading does not load -> 2/0; r54-encrypted 0/4 -> 4/0; r55-bounded does not load -> 6/0; r56-structure 0/7 -> 6/1 (the one red is X19, K4899's red, cleared by job 56); r57-bounds 0/2 -> 2/0.

### G92
(1) `bio-plane/src/file-safety/index.mjs:430-441` (old `#scanner`): `await s.fetch(...)` with no time bound, and every caller waits for it as long as it takes: `#clamav` `:445`, the batch scan `:1090` (`await this.#scanner("/scan", { targets: batch... })`), the safe-view render `:973` (inside `renderBatch` `:1009`, up to `limit` 20 views one after the other) and the routine tools' calls (`/provider/scan` `:1504`, `/provider/sandbox` `:1591`).  One slow scan or render holds the whole alarm batch.
(2) The only hanging scanner in the old suite is the fixture's `"hang"` (`fixture.mjs:47, 94`), used by `open.test.mjs:47, :74` for the on-demand open (`scanWaitMs` race); no test made `scanBatch`, `renderBatch` or the copy maker wait, so a bound on them could not be asserted. Closed by `r55-bounded.test.mjs` (6 tests).
(3) (unchanged: `SyntaxError ... does not provide an export named 'SCANNER_CALL_BOUND_MS'`; pass 0 fail 1 on `86a7a3b9aa`; green 6/6 on `7176cd7d57`)
(4) (unchanged)

### G126 (j26's cells)
(2) No registrar in the module or its tests: grep of the old `src/file-safety/*.mjs` for `registerJob`/`registrar` is empty (the module kept its own queues, `index.mjs:240` `INSERT OR IGNORE INTO fs_files ... 'queued'`, `:891`), and no old file-safety test used `registerJob` or `jobRegistrarStub` (count 0). Closed by `r1-registrar.test.mjs`.
(3) RED line (the record pasted none): on `86a7a3b9aa`, `✖ R1: a receipt registers scan, grade and safe_view by the whole digest in the same act ...` `actual: [], expected: [ [ 'scan', 'accbbc3ea24b…', 'queued' ], [ 'grade', 'accbbc3ea24b…', 'queued' ], [ 'safe_view', 'accbbc3ea24b…' …` and `✖ R1: a registration that answers {ok:false} (or throws) is stated in this module's answer ...`; pass 0 fail 2. GREEN `7176cd7d57`: 2/2.

### G130d
(1) `bio-plane/src/file-safety/formats.mjs:65` (old `formatOf`): `if (/%PDF-\d+\.\d+/.test(LATIN1.decode(bytes.subarray(0, 1024)))) return "pdf";` runs BEFORE the ZIP-magic test (`:66`), so a macro-enabled package (or a ZIP end joined to a PDF) with `%PDF-` in its first KiB is kind `pdf` and its macros are not seen; and the kind and structure came from the bytes alone, read whole only to `GRADE_READ_MAX = 20 * 1024 * 1024` (`index.mjs:72, :375, :412-420`), a larger office file being graded from its head (`not_scanned TOO_LARGE` / `zip`, high).
(2) The old tests pinned the bound instead of the decision: `fail-closed.test.mjs:168` ("R51 (F10): ... a 36 MiB PDF is graded by its start, high") and `g44-large.test.mjs:155-156` (a file over `GRADE_READ_MAX` is `TOO_LARGE`) assert the head-only grade; no old test had a polyglot, a macro package with a PDF header, or an office file over 20 MiB graded from its directory. Closed by `r56-structure.test.mjs` (7 tests).
(3) (unchanged: `r56-structure` "1048577 B", "20971521"); the first failing lines on `86a7a3b9aa`: `✖ R56: a PDF header in the first KiB of a macro-enabled office package does not make it a PDF ...` `AssertionError: the kind is the package's, never a PDF` `actual: 'pdf', expected: 'docx'`; `✖ R56 R6: a PDF with a ZIP end joined to it is a polyglot, high ...` `actual: 'pdf', expected: 'polyglot'`; `✖ R56 R51 G130c: a DOCX of 20 MiB + 1 ...` `AssertionError: 20971521` `actual: [ 'zip', 'high', [ 'archive_not_opened', 'unread' ] ], expected: [ 'docx', 'low', [] ]`. pass 0 fail 7; GREEN `7176cd7d57`: 6/7 (X19 red, K4899).

### G136a (j26's cell (1))
(1) `bio-plane/src/file-safety/index.mjs:1100` (old `scanBatch`): `this.#writeNote(d.sha, { kind: "scan", ...v })` wrote whatever result and detail the scanner sent: a scanner verdict `encrypted` got a note with no reason, a limit/unopenable `unknown` stayed `unknown`; nothing in the module treated `encrypted` or `unscannable` as a grade reason (the only `encrypted` in the old source is the structure flag of an office file, `index.mjs:732`, `formats.mjs:200`); and `#structureCheck` (`:1548-1572`) judged an encrypted ZIP by its listing flags only, so it graded as `archive_entry_not_filed, archive_not_opened, archive_waiting`, not as encrypted. The due rule (`scanBatch` `:1064-1090`) sent a `not_scanned` file again at every batch.
(3) (unchanged); RED on `86a7a3b9aa`: `✖ R54 R3: a scanner verdict `encrypted` writes a note with result encrypted ...` `actual: [ [ 'scan', 'encrypted', undefined ] ], expected: [ [ 'scan', 'encrypted', 'ENCRYPTED' ] ]`; `AssertionError: zip: archive_entry_not_filed,archive_not_opened,archive_waiting`; pass 0 fail 4. GREEN: 4/4.

### G136b (j26's cell (1))
(1) `bio-plane/src/file-safety/index.mjs:972-981` (old render): any render that did not return a derived bytes-and-digest, whatever the cause (`SCANNER_UNREACHABLE`, a timeout, a corrupt file), set `render_state = 'failed'` for good (`UPDATE fs_files SET render_state = 'failed', render_route = ?, render_reason = ?, render_detail = ?`, `:978`) with no class and no retry; only `NOT_FOUND` waited (`:188-189`, `:964`).
(3) (unchanged: `r12-render-classes.test.mjs` red, no `RENDER_RETRY_MS`): the exact line on `86a7a3b9aa` is `SyntaxError: The requested module '../../../src/file-safety/index.mjs' does not provide an export named 'RENDER_RETRY_MS'` (pass 0 fail 1, the file does not load). GREEN: 3/3.

### G136d
(1) Two wrong decisions in the old kind/grade: `bio-plane/src/file-safety/formats.mjs:59-` `formatOf` has no RTF or e-mail kind, so an RTF with an embedded object or an e-mail with an attachment is `text`, graded low with no flags; and `index.mjs:1568` (`if (format === "image" || format === "text") return entry("clean", format);`) plus the head-only look (`HEAD_MAX` 1 MiB, `formats.mjs:18`; `index.mjs:366-420`) graded an image over 1 MiB as `unread`/high whatever its source, and called an image's structure `clean` by name without having examined it.
(2) No old test graded an RTF/e-mail with active content or an image by its source and size (`grade.test.mjs:41` has only a small PNG, `low` as `image`). Closed by `r56-structure.test.mjs` tests at `:34` (RTF/e-mail) and `:59` (images by source).
(3) RED on `86a7a3b9aa`: `✖ R56: an RTF with an embedded object and an e-mail with an attachment are high, not low as plain text ...` `actual: [ 'text', 'low', [] ], expected: [ 'rtf', 'high', [ 'active:ole-object' ] ]`; the image grade: `✖ R56 R6: an image is graded by its source and not its size: JPEGs of 1 MiB + 1, 3 MB and 25 MB that this copy fetched are low ...` `AssertionError: 1048577 B` `actual: [ 'image', 'high', [ 'unread' ] ], expected: [ 'image', 'low', [] ]`. GREEN `7176cd7d57`: these two pass (6/7).

### G136e
(1) The old `threatOf` (`index.mjs:755`) and `originalState` (`index.mjs:874`) answers carry no `reading` member and the module holds no statement that reading does not wait for the scan (grep of the old `index.mjs` for `reading` finds only unrelated labels at `:1184, :1325, :1341, :1487`): a member could not be told that a queued, held, encrypted or unscannable file is still read.
(2) Nothing in the old suite looked for such a statement; `threatOf`/`originalState` tests (`grade.test.mjs`, `open.test.mjs`) asserted the grade and the opening only. Closed by `r53-reading.test.mjs` (2 tests).
(3) (unchanged; the exact line on `86a7a3b9aa`: `SyntaxError: The requested module '../../../src/file-safety/index.mjs' does not provide an export named 'READING_KEY'`, the file does not load; GREEN 2/2)

### G137a
(1) `bio-plane/src/file-safety/index.mjs:949-952` (old `safeView`): the answer's description was `{ kind, derived, of, sha256, pages, source_pages, truncated, original }` — the figures were there but no statement, so a member was not told that the page set is the first N of M source pages nor that a safe view is a view and not a reading; the cap was not an exported figure of this module (`SAFE_VIEW_PAGES_MAX` not exported).
(2) Old view tests (`view.test.mjs`, `g44-large.test.mjs`) asserted the bytes, pages and the `truncated` flag, never a sentence or a key for the cut. Closed by `r11-paging.test.mjs:15`.
(3) (unchanged; exact line: `SyntaxError: ... does not provide an export named 'SAFE_VIEW_PAGES_MAX'`; pass 0 fail 1 on `86a7a3b9aa`; GREEN 2/2)

### G137b
(1) `bio-plane/src/file-safety/formats.mjs:151` (old): `entry.cellsIn(parts, { sheet: s.sheet, fromRow: 1, ...toRow..., maxCells: max })` — every safe-view read of a sheet started at row 1; `firstRows` (`:126-137`) computed `next_row` but the op accepted no `fromRow` or `sheet`, so a member could not page a sheet.
(2) `g44-large.test.mjs:54` asserted `next_row` of the first window only; nothing followed it. Closed by `r11-paging.test.mjs:41` (follows `next_row` call by call over a 12,000-row sheet).
(3) (unchanged: same file, same load failure; GREEN 2/2). (4) (unchanged; waits on the screen)

### Table 2 `file-safety` (quotes)
(1) `bio-plane/src/file-safety/index.mjs:72` `export const GRADE_READ_MAX = 20 * 1024 * 1024;` and `formats.mjs:116` `export const SAFE_VIEW_ODS_DECLARED_MAX = 8 * 1024 * 1024;` (and the scan batch figure) were literals of the module's own, not rows of the table (`file_safety.ods_declared` came from runtime-limits #10, K4895; `grade_read` was already a row).
(2) No test compared the module's ceilings with `READ_BOUNDS` or looked at its source for numbers; the old tests imported the constants and asserted against them (`fail-closed.test.mjs:8`, `g44-large.test.mjs:24`), which is the same literal on both sides. Closed by `r57-bounds.test.mjs`.
(3) RED on `86a7a3b9aa`: `✖ R57 R21: GRADE_READ_MAX and SAFE_VIEW_ODS_DECLARED_MAX are the table's figures (20 MiB and 8 MiB in the alpha column), and the table names both rows (1.29ms)` `AssertionError ... actual: undefined, expected: 8000`; `✖ R57: this module's source holds no numeric literal that is a read ceiling ...` `AssertionError: The expression evaluated to a falsy value: assert.ok(files.length >= 8)`; pass 0 fail 2. GREEN `7176cd7d57`: 2/2. (The second old failure is that the old module has fewer than the 8 source files the scan expects, so it fails on the file count before it can scan for literals; the first shows the old module lacks the `SCANNER_CALL_BOUND_MS` figure, 8000.)

---

## Job 27 reading-pipeline-1 (READING-PIPELINE #31, #32) — merge `f5cd836403` (K4896), pre-merge `c3ab7f3471`

Method: scratch worktree at `c3ab7f3471`; the job's `r9-reader.test.mjs`, `r8-inline-ocr.test.mjs`, `r8-liveness.test.mjs`, `csv-range*`, `scans.mjs`, `g48-cases.mjs` copied in from `f5cd836403`; each alone; the heavy files (`memory`, `pdf-pieces`, `r7-contention`) not run ("heavy: not run here"). Old / new (pass/fail): r9-reader 1/23 -> 24/0 (the 1 old pass and 5 `# TODO` are controls and todos); r8-inline-ocr 0/3 -> 3/0; r8-liveness 1/3 -> 4/0. (A test in a file prints as passed when it is a `# TODO`; the 23 reds are real.)

### G124a (j27's cell (3))
(3) RED on `c3ab7f3471` (`r9-reader.test.mjs:32`): `✖ R37 (G124): WHOLE_READ_MAX and MULTIPART_READ_MAX are READ_BOUNDS' rows (pdf bytes, office text bytes), and the module's source writes no numeric literal for a byte ceiling (2.9ms)` `AssertionError: WHOLE_READ_MAX is quoted from the table: 24 * 1024 * 1024` (`actual: '24 * 1024 * 1024', expected: /^boundOf\(/`; the literals are `index.mjs:47` `MULTIPART_READ_MAX = 20 * 1024 * 1024` and `:51` `WHOLE_READ_MAX = 24 * 1024 * 1024`); and `r9-reader.test.mjs:43` `✖ R37 R54 (G124a, PDF A3): a PDF of the bound plus one is stated at once, final, with its size and the limit ...` `actual: undefined, expected: 'TOO_LARGE'`. GREEN `f5cd836403`: r9-reader 24/24.

### G126b / G126j (RED lines; G126j's cell (3))
(3) RED on `c3ab7f3471` (`r8-inline-ocr.test.mjs`): `✖ R55 (G126b): read with ocrInvocations 0 makes no OCR call: a 3-page scan states every page ocr_left and counts them owed, whole read and first piece alike (25.55ms)` `AssertionError: no OCR call inside the request` `3 !== 0`; `✖ R55 R37 (G126j): the owe hook is retired: a hook handed in is never called, and the module's source calls no owe (41.5ms)` `TypeError: Cannot read properties of undefined (reading 'owed')` (no `counters`); pass 0 fail 3. GREEN `f5cd836403`: 3/3.

### G128b
(2) No old test had a text page carrying a large unread picture: the old reader routed nothing for it (`index.mjs:212-215` per the record), and `completenessOf` did not exist; the older picture tests (`pieces.test.mjs`) pinned the real agenda PDF's answer without the picture count. Closed by `r9-reader.test.mjs:205` (SCAN C11 shape) and the pin in `pieces.test.mjs`.
(3) RED on `c3ab7f3471`: `✖ R48 (G128b, SCAN C11 shape): a text page with one large unread picture counts the picture owed, so the reading is never whole; control: a fully read text page is whole (3.07ms)` `TypeError [Error]: Cannot read properties of undefined (reading 'owed')` (`r9-reader.test.mjs:205`: the answer has no `counters`); `✖ R48: completenessOf is whole exactly when ...` `TypeError: rp.completenessOf is not a function`. GREEN: 24/24.

### G128d (j27's cell (3))
(3) RED on `c3ab7f3471`: `✖ R47 R15 (G128d, red.mjs N15's shape): a page over CAPTURE_TEXT_UNIT_CAP is carried as consecutive chunks of its page, run 0, 1, ..., none truncated, their text the page's, read whole and in pieces` `AssertionError: 1 chunks` (`actual: false, expected: true`); `✖ R47 (G128d, DOCS T14): chunkUnits breaks at a space ...` `TypeError: rp.chunkUnits is not a function`. (2 detail: the old `text-units.test.mjs` itself pinned the defect: "R32 R15: ... a paragraph over the per-unit cap is carried as its capped prefix marked truncated", restated in the merge.) GREEN: 24/24.

### G128e (j27's cells)
(1) `bio-plane/src/reading-pipeline/index.mjs:2162-2185` (old `emittedFieldsOf`): a `.docx`'s tables were put into the reading whole (`:2180` `cells[t.ref] = Array.isArray(t.cells) ? t.cells : null`), whatever their weight, and `INLINE_CELLS_MAX_BYTES` (`:61`) was handed to the entry only for sheets (`:2573`, `inlineCellsMax`), so a docx with heavy cells made a reading over 1 MiB, stored `final` by the writer with no units.
(2) No old test had a docx whose cells weigh over `INLINE_CELLS_MAX_BYTES` (the cap was tested for sheets only); closed by `r9-reader.test.mjs:408` (DOCS O3 shape).
(3) (unchanged: `AssertionError: the cells are omitted`) — exact line on `c3ab7f3471`: `✖ R47 R28 (G128e, DOCS O3 shape): a .docx whose table cells weigh over INLINE_CELLS_MAX_BYTES keeps every text unit (the ENDMARKER found) and omits the cells with a statement of their size and the bound` `AssertionError: the cells are omitted` (`actual: false, expected: true`). GREEN: 24/24. (j5's side of the row, the docx cells in office-readers, is not touched here.)

### G128g, G128h
(1) `bio-plane/src/reading-pipeline/index.mjs:1383-1395` (old `sheetBlocks`): a sheet unit over the cap was cut into blocks of whole lines with the sheet's first line repeated at the head of each later block as ordinary text (`const head = lines[0]`); the row of each line (`lineRows`) was used only when the reader supplied it, "without it the extent is the sheet's whole range" (the comment above the function), and nothing stated which line of a block is the repeated header, so a join of blocks counted the header at every seam and a search hit was a block (a range of the whole sheet), not a row. The CSV window ticks (`:1855-1856`) likewise.
(2) The old text-unit tests used sheets under the cap or without `lineRows`; none joined blocks and counted each row once, nor asked which row a hit is in (`text-units.test.mjs`, `read.test.mjs` have no header/lineRows assertion). Closed by `r9-reader.test.mjs:158`.
(3) RED on `c3ab7f3471`: `✖ R47 R41 (G128g, G128h): a sheet's units carry lineRows, every block naming its rows, the repeated header line naming row 1, so a join that drops a repeated first line gives each row once (21.36ms)` `AssertionError: block 0 states lineRows` (`actual: false, expected: true`). GREEN `f5cd836403`: 24/24. (G128h's search half is jobs 30/41's, open.)

### G129c (j27's cells)
(2) The old OCR tests pinned the defect: a member 5xx was "the OCR member answered 500, so this document stays unread" (`convert-ocr.test.mjs:254`, `convert-tiers.test.mjs:252`); no test had a header refusal (`IMAGE_TOO_LARGE`), a page the plane stamped as having killed its reader, or a kill counted against a page (none of `ocr_refused`, `ocr_killed`, `PAGE_KILLED_READER` exists in the old source). Closed by the three R54 tests of `r9-reader.test.mjs`.
(3) RED on `c3ab7f3471`: `✖ R54 (G129c): a page the caller states killed its reader three times is not asked again and is stated PAGE_KILLED_READER; the rest is read (4.1ms)` `AssertionError: page 2 never asked` (`actual: false, expected: true`); `✖ R54 (G125a): a page whose OCR call answered 5xx is named killed on the reading ...` `actual: undefined, expected: [ 1 ]`; `✖ R54 (G125a): a page the OCR member refuses from its header (IMAGE_TOO_LARGE) is stated with that reason, final, never owed or retried` `actual: undefined, expected: [ { page: 1, reason: 'IMAGE_TOO_LARGE' } ]`. GREEN: 24/24.

### G129a (j27's RED line, unchanged cell) — for the record
`r8-liveness.test.mjs` on `c3ab7f3471`: `✖ R46 (G129a, PDF C14): an AES-128 file under a user password ends in one tick, final, PASSWORD_REQUIRED, never being read after` `AssertionError: tick 2 answered a cursor already asked`; the other two (no tier-2 member; RC4 C11) the same; pass 1 fail 3. GREEN: 4/4.

### G130c (j27's cell (1))
(1) `bio-plane/src/reading-pipeline/index.mjs:2385-2386` (old): `fmt = detectFormat(bytes, profile.source_content_type || ct || null).format` ran on the bytes already loaded, and a capture over `WHOLE_READ_MAX` (`:51`, 24 MiB) or a multipart one over `MULTIPART_READ_MAX` (`:47`, 20 MiB) was stated too large at `:2295-2306` before any detection, so an office file past those sizes could be neither detected from its head and directory nor read; there was no range source (`rangeSource`/`plan` do not exist).
(3) (for the j27 part) RED on `c3ab7f3471`: `✖ R45 (G130): rangeSource reads only the ranges asked; plan of a 40 MB file reads its head and its tail, detects the kind, and judges the size against the kind's bound (111ms)` `TypeError: rp.rangeSource is not a function`. GREEN: 24/24.

### G131g (j27's cell (2))
(2) The old tests used UTF-8 files only and one pinned the defect: `text-units.test.mjs` asserted `["caf� au lait", "second"]` for a Latin-1 file (changed in the merge to `["café au lait", "second"]` with `reading.encoding === "windows-1252"`); decoding was `TextDecoder("utf-8", {fatal:false})` (`index.mjs:2323, 2388`). Closed by `r9-reader.test.mjs:266, :280`.
(3) (unchanged: `+ 'Caf� r�sum�' - 'Café résumé'`; `r9-reader.test.mjs:266`, `actual: 'Caf� r�sum�', expected: 'Café résumé'`)

### G134d (j27's cells)
(2) No old fixture's entry emitted `parts`: `allUnitsOf` read only pages, paragraphs, slides and sheets, and the tests built entries with those alone. Closed by `r9-reader.test.mjs:138` (DOCS O4 at the interface).
(3) RED on `c3ab7f3471`: `✖ R47 (G134d, DOCS O4 at the interface): every part an entry emits is a unit with its kind; the body's units are body; a footnote's figure is found in a footnote unit; allUnitsOf accepts every kind ...` `AssertionError: Expected values to be strictly deep-equal: actual: [], expected: [ 'Body para one', 'Body para two' ]`. GREEN: 24/24.

### G137d (j27's cells)
(2) The old reader stored whatever text the OCR member returned for a page: the word `legibility` does not occur in the old reading-pipeline source or tests (grep), so a page of unreadable words was stored as its text and no test fed per-word confidence. Closed by `r9-reader.test.mjs:332` (R56).
(3) RED on `c3ab7f3471`: `✖ R56 (G137d): legibility is stored beside a page's text; a page under four fifths is kept and marked partly legible; a page the member refused under one fifth stores no text and is stated ...` `AssertionError: Expected values to be strictly deep-equal: actual: undefined, expected: [ { confident_words: 10, page: 0, partly: false, share: 1, words: 10 }, ...`. GREEN: 24/24.

### G128c / others in this module
(not touched: G128c's cells are j7's, closed under Job 7)

---

# Rows that read "open: job N" for jobs merged after the table was drafted

Each of these jobs is now merged. Its four cells are filled from its record and from a red run on its merge's first parent (scratch worktree, the job's own tests copied in, each file alone). A row stays OPEN where another job's part is still unmerged; that is said in each.

## Job 33 scheduler (SCHEDULER #43) — merge `8fe42e752d` (K4905), pre-merge `5af833cc07`

Red runs on `5af833cc07` with `r8-budget.test.mjs` and `r8-stale.test.mjs` from the merge, `--test-timeout=3000` (the old firing awaits a gated consumer for ever, as the record says): r8-budget old: `tests 11, pass 1, fail 5, cancelled 5` (the timed-out gates cancel the tests behind them; all ten non-passing print `✖`) -> new 11/11; r8-stale old 1/5 -> new 6/6.

### G91 (job 33's cells; owner)
(1) `bio-plane/src/scheduler/index.mjs:586-600` (old `onAlarm`): `for (const c of reg) { ... r = await c.tick(now, ...) }` — every due consumer is awaited in turn with no bound, so one slow consumer holds the firing and every consumer behind it (and the alarm re-arm after them) for as long as it takes.
(2) The old storage double answered `getAlarm()` at every moment and the test consumers answered at once, so no firing ever had a consumer that outlasted anything; closed by test-support's `alarmDouble` (job 1) and the gated consumers of `r8-budget.test.mjs`.
(3) RED on `5af833cc07`: `✖ R30: a firing whose first consumer outlasts the budget starts no further consumer; the next firing begins at the consumer after it, so the later consumer ticks before the gate opens (3003ms)` `'test timed out after 3000ms'`; `✖ R30: rotation: no consumer is always last, and one consumer is not run twice in a firing (3003ms)` `'test timed out after 3000ms'`; `✖ R30: every consumer a firing runs is one structured line ... (3001ms)`; `✖ R30: control: a firing whose consumers all end inside the budget runs them all, in registry order, and leaves no rotation` `actual: undefined, expected: null` (no `rotate_from`); R31 x3 and R32, R33 x2 also fail. GREEN `8fe42e752d`: r8-budget 11/11.
(4) L at the unit level (the record: "L at the unit level only"). P owed, redeploy: the `alarm` events and the per-consumer line (any consumer over 10 s) and a 12 MB text with a second file queued. The real-alarm Miniflare run (40 s scanner) is plane-1's `r8-headofline`, red by name until plane-2 (job 37) merges. The row stays OPEN for job 37.

### G95 (owner)
(1) `bio-plane/src/scheduler/index.mjs:709-716` (old `health`): `const since = owed === null ? null : Math.max(owed, last_run ?? -Infinity); ... stale: since !== null && now - since > 2 * HEALTH_CYCLE_MS` (`HEALTH_CYCLE_MS` = 5 min, `:148`) — a completed firing moved `last_run` forward and reset the clock, so a stall of firings that each completed (owing the work all the while) never read stale, and the limit was 10 minutes, not five (K4811 (5)).
(2) `spent.test.mjs` asserted the definition on a double with one cycle's numbers; nothing confronted it with the walker's numbers (oldest wake owed 691 s, last firing completed over 300 s ago). Closed by `r8-stale.test.mjs` (6 tests) and the amended `spent.test.mjs`.
(3) RED on `5af833cc07`: `✖ R28: stale is true for the walker's numbers: the oldest wake owed 691 s, no firing completed in the last 300 s, no firing in progress` `actual: [ 1792496909000, null, false ], expected: [ 1792496909000, null, true ]`; `✖ R28: stale is true when one firing has run 400 s with a row owed 400 s` `actual: [ 1792497200000, false ], expected: [ 1792497200000, true ]`; `✖ R28: a real firing leaves an end instant that health reads, and a stall of completed firings turns stale true once none completes in 300 s` `AssertionError: owed for minutes, and the last firing ended over 300 s ago` (`false !== true`). GREEN `8fe42e752d`: r8-stale 6/6.
(4) N (arithmetic on instants); the seam section G95 is control-plane's (job 38, open). Row stays OPEN for job 38's seam.

### G94 (scheduler's share) and G92 (scheduler's share) and G123g (scheduler's share)
G94: (1) `watch` (old, `index.mjs`, near `:720`) recorded `watchdog_seen` only (the cron's slot) and answered no instant the cron actually ran. (3) RED on `5af833cc07`: `✖ R29: watch records the cron's slot as watchdog_seen and the instant it ran as watchdog_ran; a call delivered 26 minutes late shows both` `actual: undefined, expected: 1792497600000`. GREEN. The route (`WATCHDOG_FIELDS`, `running_since` withheld) is plane-2's (job 37), open.
G92 (scheduler's share, the in-flight set): RED `✖ R31: a consumer whose call outlasts the budget is in flight at the next firing, which neither asks it nor starts it again ...` `'test timed out after 3000ms'` (old: the call is awaited for ever, there is no in-flight set); GREEN. File-safety's bound is job 26's (above); the row's remaining open item is none from the scheduler.
G123g (scheduler's share, the ledger clock): (1) old `onAlarm` passed `c.tick(now, rank)` only (`:595`): a consumer was told the firing's instant, not the instant its own work began, so the ledger's `last_ms` could not be a consumer's own clock. (3) RED `✖ R32: a consumer is told the instant its own work began: one that starts 6 s into a firing is told that, not the firing's ...` `actual: [ 'first', 1792497600000, undefined ], expected: [ 'first', 1792497600000, 1792497600000 ]`; R33 re-entry: `✖ R33: a run cut after its second consumer and restarted ... a start clears the cut run's running_since` `actual: 1792497600000, expected: null`. GREEN. `last_mem` null under workerd and the instruments are plane-2's (job 37), open.

## Job 28 extraction-1 (EXTRACTION #41) — merge `2a0583bccd` (K4909), pre-merge `094ba969f5`

Red runs on `094ba969f5` with `r104`, `r8-owe`, `r101`, `r103` and the changed `fixture.mjs` from the merge. `r101` and `r103` import new exports (`HALF_OCR_INVOCATIONS`, `REQUEST_READ_MAX`) and do not load on the old code; they were run with those two imports replaced by their values (12 and 2,097,152), as a scratch copy. Old / new (pass/fail): r104 1/3 -> 4/0; r8-owe 2/5 -> 7/0; r101 0/7 (scratch copy) -> 7/0; r103 0/9 (scratch copy) -> 9/0.

### G126a (owner; row stays OPEN only for job 37 and job 35)
(1) `bio-plane/src/extraction/index.mjs` (old) `Extraction.read` (`:683-692`) passed no `owe` and registered nothing; `readHeld` answered `more`/`owed` with no row written; `migrateRepairs` (`:1890`, `:1970`; the repair at about `:1982`) re-registered only "not read as text" readings and texts mid-way, never a reading holding `tier3_candidate`/`ocr_left`: an abandoned promote left no row.
(2) `t51-round5-seam` E6's OCR stub answered 24 pages in one call (nothing was ever left owed), and `r37.test.mjs` tested `owe` with a hand-written hook; no test ran a registrar. Closed by `r8-owe.test.mjs` (7 tests, `jobRegistrarStub` both ways).
(3) RED on `094ba969f5`: `✖ R102 R103 (G126a, G126b): read of a 30-page scan for a member's request makes no OCR call and registers one `ocr` job ...` `AssertionError: no OCR call inside the request` `24 !== 0`; `✖ R102 (G126a): the ledger's readHeld hands registerJob in its call ...` `AssertionError: the pages past the call budget are owed from the first of them` (`actual: []`); `✖ R102 (G126c's rule for this module): a registrar answering {ok: false} is reported in the answer ...` `actual: undefined, expected: { kind: 'ocr', pages_left: 3, reason: 'NO_REGISTRAR' ...`; `✖ R105 (a), (c) ...: the start-up repair registers each stored reading that holds ocr_left ...` `AssertionError: a refusal stops it` (`true !== false`). GREEN `2a0583bccd`: 7/7.
(4) L: `r9-l.probe.mjs` case `press` (workerd, real DO SQLite and R2): the press on a 3 MiB, 30-page scan registers one raised `ocr` job through the hook; case `pass` reads it after a restart. P owed, redeploy (BOB): a scan uploaded and its promote abandoned lists the row in `owedwork&sha=`; old records re-registered by the migration `r105-owed-work`.

### G126e (owner with job 37; row stays OPEN for job 37's wiring)
(1) `extraction/index.mjs` (old) `pdfStructure` (`:2194-2197`) and `pageTranscribe` (`:2402-2404`) `ev.get` the whole object and parsed it in the request; the rewrite read its basis (`:2186`) and wrote (`:2313-2333`) with no compare; `says` (`:2512`) named the pages asked, not those filled.
(2) No test of the press at size: every press fixture held a reading with no units and let an entry stub supply the pages. Closed by `r103.test.mjs` (counts evidence reads on a 3 MiB file, the over-bound plain read, two compare-and-set races) and the restated press fixtures.
(3) RED on `094ba969f5` (scratch copy of `r103`): `✖ R103 (G126b, G126e; SCAN E4, PDF E11): the press on a 3 MiB, 30-page scan loads no byte of it and calls no engine in the request ...` `Expected values to be strictly deep-equal: actual: [ false, false, undefined, undefined ]`; `✖ R103 (G126e; K4901 (2); R-SILENT): the plain op=pdfstructure of a PDF over the request bound reads nothing ...` `TypeError: Cannot read properties of undefined (reading 'owed')`; `✖ R103 (G126e; SCAN E4, PDF E11): op=pagetranscribe on a 3 MiB scan reads its first KiB alone ...` `Error: the file is never parsed in this request`; `✖ R103 (G126e): the ledger's pass does not write over a stored reading that changed ...` `actual: [ false, undefined, 'NO_PAGES_LEFT' ]`. GREEN: 9/9.
(4) L: `r9-l.probe.mjs` case `transcribe` (written, one ranged 1,024 B get, OCR calls 0) and `press` (0 B read). The through-the-door counting walk is control-plane's seam (job 38). Row `pdf.request_bytes` came from job 59 (merged).

### G129d (owner with job 37)
(1) `extraction/index.mjs:903-917` (old `#continueOcr`): called `pdfStructure(ocr=1)`, which loaded the whole object, parsed it with tier 1 and answered a JPEG `422 NOT_A_PDF`, so `readHeld(kind: "ocr")` answered `UNREADABLE` (`:912`) and the ledger ended a photograph's row.
(2) No test continued the OCR of a standalone picture or failed its member transiently. Closed by `r103.test.mjs` SCAN E3 (R106).
(3) RED on `094ba969f5` (scratch copy): `✖ R106 (G129d; SCAN E3): a photograph's OCR continues without the PDF structure read: with the member down for three ticks the job stays owed, never UNREADABLE nor finished; the fourth tick reads it` `AssertionError: tick 1: {"ok":true,"read":false,"why":"UNREADABLE"}`; control `✖ R106 (control): ... ends stated with its reason` `actual: [ false, undefined, 'UNREADABLE' ], expected: [ ..., 'OCR_NO_PROGRESS' ]`. GREEN: 9/9.
(4) L: `r9-l.probe.mjs` case `pass` (two ticks, 24 then 5 pages, R2 gets 0, written by `member:m1`). Row stays OPEN for job 37 (`plane/unpack.mjs:83`, `pending.mjs:261`).

### Job 28's shares of other rows (cells for the extraction half; the other halves are in their own sections)
- G127a: (1) `#wholeOfPart` (`:976`), `#homeOfParts` (`:991`), their uses at `:781`, `:1448` (`readingFor`) and `migratePartReadings` (`:2035`): the module redirected a part's digest to a whole read from provenance's document. (2) every fixture held one document per digest, none a part shared by two wholes. (3) RED `✖ R104 (G127a): the same document filed in two projects and two versions sharing part 1 each read their own: no NO_HOME, no first-wins answer` `actual: [ false, undefined, false, undefined ]`. Green 4/4.
- G127d: (1) `index.mjs:822` `if (!whole) return left("NO_WHOLE_OBJECT")` (`ev.head(digest)` at `:821`): a capture held only in parts waited for a whole never composed past 32 MiB. (3) RED `✖ R104 (G127d): a capture held only in parts is read by its whole digest through readRange, with no whole object kept ...` `AssertionError: {"ok":true,"read":false,"why":"NO_WHOLE_OBJECT"}`.
- G129b: (1) `#continueText` `index.mjs:881-885`: a piece answering no boolean `more` (a transient failure at a later tick) set `more=0, cursor=NULL` and `return left("READING_HELD")`, ending the read with no reason. (3) RED (scratch copy of r101) `✖ R101 (G129b; PDF E7, SCAN E2, DOCS F1): the store failing at tick 2 of a text read in pieces is transient ...` `AssertionError: {"ok":true,"read":true,"bundle_id":"INFO-1","found":true,"more":true,...}` (expected `read: false, why: 'TRANSIENT'`); `✖ R101 (G129b): a read in pieces whose next piece is refused ends stated, with its reason ...` `actual: 'undefined', expected: 'string'`.
- G129c: (1) `plane/pending.mjs:63, :193-202` ended a row after three interruptions and this module could not hand the reader the killed units. (3) RED `✖ R101 (G129c; PDF E10, SCAN D12): a page the ledger states killed its reader three times is not asked ...` `AssertionError: {"ok":true,"read":false,"why":"OCR_NO_PROGRESS"}` (`false !== true`); `✖ R101 (G129c): the one retry after three kills runs at half the budget` `0 !== 12`; `✖ R101 (G129c; K4904 (1); DOCS killAt): the window at the cursor ... is stepped past with skipKilled` `actual: [ true, undefined ]`.
- G126b (extraction half): (3) `r8-owe` first line above (`24 !== 0`).
- G132k (pass half): (1) `#continueOcr` (`:903-917`) above. (3) RED: the R103 `says`/pass tests above and `✖ R103 R35 (K4904 (2); plan 2c item 9): a page the reading lists in folio_pages keeps its folio and is OCRed by the pass` `AssertionError: {"ok":true,"read":false,"why":"NO_PAGES_LEFT"}`. The OCR member half is job 18's (merged).
Rows G126b, G127a, G127d, G129b, G129c, G132k keep their other open jobs (38, 37, 29, 41).

## Job 40 reading-pipeline-2 (READING-PIPELINE #33) — merge `094ba969f5` (K4909), pre-merge `4e9a39f381`

Red runs on `4e9a39f381` with the job's `r10-*.test.mjs`, `html-oracle.mjs` copied in. Old / new (pass/fail): r10-refusals 0/16 -> 16/0; r10-classify 1/3 -> 4/0; r10-skip 0/4 -> 4/0; r10-text 1/9 -> 10/0; r10-html does not load (no `html.mjs`; two of its tests run with that import stubbed, below) -> 6/0. The three heavy files (memory, pdf-pieces, r7-contention): heavy: not run here.

### G135a, G135e (job 40's part; job 36's part open)
(1) `bio-plane/src/reading-pipeline/index.mjs:3135-3136` (old): every kind with no reader got the one sentence "non-textual or too large" (`reading-pipeline.index.non_textual_large`), and RTF and e-mail were read as text; legacy Word/Excel/PowerPoint, TIFF, GIF, WebP, HEIC, AVIF, BMP, JP2 and ICO were not named, so "Read it" was offered where reading again cannot succeed.
(2) Refusals were asserted by code, never by the truth of the sentence; no TIFF, GIF or RTF fixture. Closed by `r10-refusals.test.mjs` (16 tests).
(3) RED on `4e9a39f381`: `✖ R54 (G135a, G135e): rtf (text/rtf) is named, final, UNSUPPORTED_FORMAT, and is no "non-textual or too large" (11.4ms)` `AssertionError: the document's own kind: reading it again cannot succeed` `actual: undefined, expected: 'final'` (email, tiff, gif, webp, heic, avif, bmp, legacy_word/excel/powerpoint the same); `✖ R54 (G135e): the same kind in ranges and pieces is the same statement; a plain text that merely mentions RTF or From: is read as text`. pass 0 fail 16. GREEN `094ba969f5`: 16/16.
(4) L. Row stays OPEN for job 36 (screens-inquiry: the Document page's words).

### G135b (job 40's part)
(1) `index.mjs:369` `refusalReasonOf` and `ocrTextFromMember` (`:506`): the OCR member's `refusal.render.reason` was dropped from the sentence a lone picture's answer produced (the sentence read "declined to transcribe this document (PAGE_NOT_RENDERABLE)" with the member's reason lost).
(2) No test checked what the member's refusal reason did to the sentence. Closed by `r10-refusals.test.mjs:105`.
(3) RED: `✖ R54 (G135b): the reason a member refused a picture (refusal.render.reason) reaches the reading's sentence and its ocr_refused list` `AssertionError: IMAGE_TOO_LARGE in: the OCR member declined to transcribe this document (PAGE_NOT_RENDERABLE) (the text of this document is undetermined (1 undecodable region(s): no_...` (`actual: false, expected: true`). GREEN: 16/16.
(4) L. Row stays OPEN for job 36.

### G135d (job 40's part)
(1) `index.mjs:2624` (old `bytesOf`) and the guard handling: an entry's size marker (`undetermined[].guard`: ooxml `textPlan`, csv-reader `sizeMarker`) reached the member as "undecodable regions", and `bytesOf`'s sentence ("the capture is 25165825 bytes in 1 parts, over the 25165824 B ... so it was not read") named "parts" and "read" and carried no usable size/bound pair.
(2) The refusal tests asserted codes. Closed by `r10-refusals.test.mjs:65, :82`.
(3) RED: `✖ R54 R37 (G124a, G135d): a capture over the whole-read bound is stated at once with its size and the limit, in a sentence that says neither read nor multipart` `AssertionError: The input was expected to not match the regular expression /\bread\b|multipart|parts|non-textual/i. Input: 'the capture is 25165825 bytes in 1 parts, over the 25165824 B a format entry is handed here, so it was not read'`; `✖ R54 (G135d): a size marker an entry leaves in its text is TOO_LARGE {size, bound}; a count past its bound is STRUCTURE_OVER_BOUND {part, bound}; neither is 'undecodable regions'` `actual: undefined, expected: 'TOO_LARGE'`. GREEN: 16/16.
(4) L. The `setup-words/rows.mjs` row is BOB's after this merge (K4846); docprofile's side is j11's (merged).

### G131f, G131h (job 40; row DONE for job 40)
(1) `index.mjs:1325` (old `visibleTextOfHtml`) with `endOfElement` (`:1161`) and `probeBlock` (`:1228`): regex-and-rescan, each rescanning an element to its end (cost size x depth); an only-links list was furniture (4,000 `<li><a>` gave 1 character); every table cell was a paragraph (a 500 x 20 table gave 10,001 paragraphs); and each later tick re-pulled and re-parsed the page.
(2) No deep markup, no multi-tick HTML and no table fixture in the old tests. Closed by `r10-html.test.mjs` (6 tests, with `html-oracle.mjs`, the old pass kept as the oracle).
(3) RED on `4e9a39f381` (the file does not load there: `html.mjs` does not exist; run with that import stubbed, the two tests below): `✖ R51 R35 R15 (G131f, SHEET D02): a 500 x 20 table keeps its rows and columns ...` `AssertionError: Before., 500 rows, After.` `actual: 10001, expected: 502`; `✖ R51 R40 (G131h, DOCS H2): the pieces of a 6 MB page of 90,000 paragraphs read the store about once (bytes served at most twice the file) ...` `AssertionError: 117129579 bytes served for a 4038951 B page` (10,746 ms). The timing reds (nested div 4,000: 5,403 ms; 20,000 unbalanced `<div title="`: 224,697 ms) are the record's, measured with the oracle; not rerun here (225 s). GREEN `094ba969f5`: 6/6.
(4) L (R-CLOCK: counts, not times).

### G131i (job 40's half: text, JSON, XML)
(1) `index.mjs:2624` (old `bytesOf`) refused every kind over 24 MiB (`WHOLE_READ_MAX`, the PDF whole-load ceiling) as `final` and stated a 50 MB + 1 text against that row; `textWindowTick` (`:1907`) took a run only whole (a 50 MB single line was loaded whole) and a window was the cursor's 1 MiB whatever a piece could use.
(2) Old fixtures never exceeded 24 MiB, and no run without a separator was longer than a window. Closed by `r10-text.test.mjs` (10 tests).
(3) RED on `4e9a39f381`: `✖ R50 (G131i, text): a text of 30 MiB is read in windows from its first piece, never whole, ...` `AssertionError: a read not in pieces says it is read in pieces and reads nothing` `actual: 'final', expected: 'transient'` (json and xml alike); `✖ R50 R54 (G131i): a text of 50 MB plus 1 is stated with the size and the bound (TOO_LARGE) ...`; `✖ R50 R47 (G131i): a JSON of one 30 MiB line is read in the chunks the whole run gives ...`; B44's `✖ R49 R50 (B44 (1), windows-1252 / UTF-16LE / UTF-16BE ...)`: pass 1 fail 9. GREEN `094ba969f5`: 10/10.
(4) L (in-process, ranges counted). The CSV half is job 4's/27's (merged). HTML stays whole to 24 MiB, stated above (K4906).

### G133f (job 40's R52 share, additional)
`r10-classify.test.mjs` RED on `4e9a39f381`: `✖ R52 (G133f, DOCS T1/T4/Q1): a 12 MB plain text is classified from a bounded view ...` `AssertionError: the reading states it was classified over a view` `actual: true, expected: false` (HTML alike); 1 pass 3 fail; GREEN 4/4.

### K4904 items 8 and 9 (skipKilled, folio_pages; B43, B45)
`r10-skip.test.mjs` RED on `4e9a39f381`: `✖ R45 R46 R54 (K4904, item 8): a text window that killed its reader is stepped past ...` `AssertionError ... actual: [ { extent: [Object], seq: 881, text: 'line 000881 council-minutes ...` `expected: []`; pass 0 fail 4. GREEN: 4/4.

## Jobs 56-59 (table rows "job 52-55", K4903 renumbering)

### Job 56 (table: "job 52") format-registry-2 — merge `93941622e2` (K4902), pre-merge `bb6d6fcd73`
(1) `bio-plane/src/formats.mjs:325` (old pdf `detect`): `if (LATIN1.decode(bytes.subarray(0, 1024)).includes("%PDF-"))` answered `pdf` for any head holding `%PDF-` in its first 1024 bytes, and R23 asks `pdf` before `zip`, so a ZIP whose first member is a PDF stored with method 0 (its bytes sit in the first KiB) was a `pdf`, `unpack` refused it `NOT_AN_ARCHIVE`.
(2) No fixture put a stored PDF first in a ZIP; G130a's polyglot set was pictures and HTML.
(3) RED on `bb6d6fcd73` (`zip-pdf.test.mjs` from the merge): `✖ R20: a ZIP whose first member is a PDF stored uncompressed is a zip, whole and from a range source` `actual: 'pdf', expected: 'zip'` (`zip-pdf.test.mjs:22`); `✖ R20: an office file whose first stored entry holds %PDF- stays docx, and an OpenDocument one odt` `actual: 'pdf', expected: 'docx'` (`:36`); `✖ R20: a real PDF is a pdf ...` `AssertionError: the ZIP magic first is never a PDF`; pass 0 fail 3. GREEN `93941622e2`: 3/3. Through the door: file-safety `r56-structure.test.mjs` X19 (`R6 R56 G136b (X19)`): on `bb6d6fcd73` pass 6 fail 1 (X19), on `93941622e2` pass 7 fail 0.
(4) N. Verdict: DONE.

### Job 57 (table: "job 53") affordances — merge `f5e7c67ddb` (K4902), pre-merge `da32b8b92a`
(1) `bio-plane/src/affordances/act-help.mjs:144-145` (old): `T51_STANDIN_HELP = Object.freeze({})` / `T51_STANDIN_OPS = Object.freeze([])` — the table held no sentence for capture's four parted-upload ops (`captureuploadbegin`, `captureuploadpart`, `captureuploadcomplete`, `captureuploadabort`, declared by job 42) and none was named under an `ACT_HELP_ABSENT` ground, so R48 (every member op explained or named) failed.
(2) The two op-declarations tests that enforce R48 were red the moment job 42 merged (K4899) and no affordances test named the four ops. Closed by the new `affordances/t36.test.mjs` test (R48 R62; capture R113).
(3) RED on `da32b8b92a`: `op-declarations/t36.test.mjs:306` `✖ R34 (affordances R48): every op in SESSION_OPS.member has an explanation in affordances' ACT_HELP under its own name or is named in ACT_HELP_ABSENT ...` `AssertionError: member ops with no text and no ground: captureuploadbegin,captureuploadpart,captureuploadcomplete,captureuploadabort`; `op-declarations/t42.test.mjs:129` `✖ R47, R34 (N862; ...)` `AssertionError: captureuploadbegin: neither explained nor named` (`1 !== 0`); `affordances/t36.test.mjs:223` `✖ R48 R62 (T51, K4900; capture R113): the four steps of a file sent in parts are member ops this table explains under their own names ...` `actual: [], expected: [ 'captureuploadabort', 'captureuploadbegin', 'captureuploadcomplete', 'captureuploadpart' ]`. GREEN `f5e7c67ddb`: op-declarations t36 14/14 (old 13/1), t42 5/5 (old 4/1), affordances t36 15/15 (old 14/1).
(4) N. Verdict: DONE (rows owed to the design stream: `act.captureupload{begin,part,complete,abort}.does`).

### Job 58 (table: "job 54") file-safety-2 — merge `da32b8b92a` (K4902), pre-merge `93941622e2`
(1) `bio-plane/src/file-safety/index.mjs:2156-2168` (old `renderWake`): `const poll = ... Math.max(n, kept.last + FILE_SAFETY_POLL_MS)` (`:2160`, `FILE_SAFETY_POLL_MS` = 300,000 at `:66`) was returned for a queue with views left (`:2166-2168`), so after one render per tick the next render waited five minutes: about 12 renders an hour.
(2) R39's test (`wakes.test.mjs`) asserted `last renderBatch + FILE_SAFETY_POLL_MS` with a queue left behind, which fixed the pace; with one render a tick (job 26, R12) that became the cadence.
(3) RED on `93941622e2` (`r39-render-wake.test.mjs` from the merge): `✖ R39: three files queued, each renderBatch renders one and renderWake answers now until the last view is drawn, then null` `AssertionError: after render 1: now, not now + 300000` `actual: 1791461103000, expected: 1791460803000`; `✖ R39: a render marked in flight holds the wake as before: queued views behind it are not now` `actual: 1791461100000, expected: 1791460800000`; pass 1 fail 2. GREEN `da32b8b92a`: 3/3.
(4) N. Verdict: DONE (the scheduler's `files.test.mjs:279` follow-up was handled in job 33's J9, K4905).

### Job 59 (table: "job 55") runtime-limits-5, row `pdf.request_bytes` — merge `bb6d6fcd73` (K4902), pre-merge `bfaf9b575d`
(1) `bio-plane/src/read-bounds.mjs` (old) had no `pdf` / `request_bytes` row; the figure existed only as control-plane's literal `const READING_DEFER_PDF_BYTES = 2 * 1024 * 1024;` (`bio-plane/src/control-plane/index.mjs:225`, used `:756`), and extraction's request bound (2 MiB) had nowhere to quote.
(2) No test named the row; the table's invariant test (R29) could not cover a row that did not exist.
(3) RED on `bfaf9b575d` (`read-bounds.test.mjs` from the merge): `✖ R30: the row extraction and control-plane quote (pdf request_bytes, 2 MiB) holds one figure in all three columns, and boundOf and statement answer it (R31) (3.0ms)` `AssertionError: The expression evaluated to a falsy value: assert.ok(row)` (`actual: undefined, expected: true`); pass 14 fail 1. GREEN `bb6d6fcd73`: 15/15.
(4) N. Verdict: DONE (control-plane's quote of the row is job 38's, open).

### G124 table row (the "Open: job 55" note)
The `pdf.request_bytes` row is now in the table (job 59, above); G124's remaining open items are job 38's.

---

# Summary

## Cells I could not close
- **G128i (1), (2), (3)** (j23): the record and the diff of job 23 carry no G128i item; the plan's "X20/X29 parts" are the G129e item (X20; closed above) and, if anything, G138's `pictures_unread` (X29; closed above). No separate cause, test or red exists to quote. BOB decides whether to close the row by those two or reopen it.
- **G123e (3)** (committed tests' RED): not run; its tests are test-support's (`generators.test.mjs:200, :213`, job 1, K4852), not in my jobs.
- Not touched, outside my jobs: every cell of j1-j6, j8-j19, j21, j22, j44-j51 and the cells of j3, j4, j5, j6, j8, j12, j13, j14, j16 inside rows shared with my jobs (G124c, G125d, G125h, G126d, G128e j5, G130b, G130c j8, G131a-e, G131i j4, G133c-e, G134a/c, G141 and the Table 2 rows other than pdf-reader and file-safety).
- Not run (partial): G131f's timing reds (nested div 4,000: 5,403 ms; 20,000 unbalanced `<div title="`: 224,697 ms) are the record's, not reproduced (225 s each); G123b's "leak inside one tick, seen red with the sampler off" is the record's and could not be isolated (the old harness has no injector; the file fails to load there).
- Jobs 25 (doorbell) and 42 (capture-upload): no MISSING cell in any row they own (G126's j25 cell has its red; G127f's four cells are filled), so nothing was written for them.

## NOT RED (reopen as entries)
1. **G124b / R115 (j23)**: NOT RED on `879a7ce60f`: `r9-multipart-memory.test.mjs` passes 3/3, vacuously: the old module ignores `opts.ledger`, so `ledger.peak()` is 0 (`PEAK 0` against `PEAK 29360128` = kept + one part on `d821b61a02`). The R115 change (second whole-sized copy at `index.mjs:1576`) is real but the committed test cannot see it. (R114 of the same row, `r9-ceilings.test.mjs`, is red: 1/3 on the old code.)
2. **G127b / R108 (j24)**: NOT RED on `b2dad8337f`: `r9-t51.test.mjs` R108 tests pass 2/2 (characterization of an already-correct digest; the record says there is no cause in capture). Same file's R112 (G137c) tests also pass on the old code (2/2).
3. **G123b (j20)**, partly: the leak-inside-one-tick test is not shown red by itself (old harness lacks the injector; the file fails to load, `does not provide an export named 'shimApplied'`). The root cause itself is evidenced (`harness.mjs:254-255`, the sampler cleared on the next line).
4. Observed, not a red: at the job-20 merge `d1325da819`, `shape-harness.test.mjs` is 6/7 (twice) with the G123b control red (`AssertionError: control`); at the tranche tip `b9a4c9acb0` it is 7/7. K4899's re-attribution to doctypes-2 is confirmed; the record's "7/7" holds at the tip only.
5. Observed: at the job-26 merge `7176cd7d57`, `r56-structure.test.mjs` is 6/7 (X19), 7/7 on `93941622e2` (job 56) — consistent with K4899/K4902.

## Reds that are weak (still red, say so)
- G124a (j7): the image-route red is a process killed by out-of-memory (exit 137) at the 4th test of `bounds.test.mjs` on the old code, not an assertion line; not rerun.
- G129e/G137c/G126b-e (j23, j28): `r9-unpack-transient`, `r9-render-charge`, `r101`, `r103` import new exports and do not load on the old code; the assertion lines quoted come from scratch copies with those one-line imports replaced by their values (12, 3, 2,097,152). The committed files fail on the old code at load (`does not provide an export named ...`).
- G123c, G123f (j20), `r57-bounds` second test (j26): red because the old helper/module lacks what the test needs (file count, exports), not on a behaviour assertion.

## Refused commands
- `rm -rf /home/user/k4426-b` (final cleanup, run after `git worktree remove --force` of every scratch worktree): refused by the permission check, not retried. All scratch worktrees are removed and pruned; `/home/user/k4426-b/` still holds only my two helper scripts `mk.sh` and `rt.sh`. Nothing was edited, committed or pushed in `/home/user/bio`.

## Counts
- MISSING cells closed (rows of jobs 7, 20, 23, 24, 26, 27): 94 (j7 16, j20 14, j23 20, j24 5, j26 18, j27 21).
- Cells of the "open: job N" rows filled from the now-merged jobs 33, 28, 40, 56-59: 16 rows x 4 = 64 (G91, G95; G126a, G126e, G129d; G131f, G131h, G131i, G135a, G135b, G135d, G135e; the four Table 3 rows), plus the merged jobs' shares in G92, G94, G123g, G126b, G127a, G127d, G129b, G129c, G132k, G133f.
- Not closed: 3 cells (G128i) + G123e (3) outside my jobs.
- NOT RED: 2 causes (G124b R115, G127b R108), plus G123b partly.
- Refused: 1 command (`rm -rf` cleanup).
