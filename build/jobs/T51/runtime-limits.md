# runtime-limits (T51)

**Status** · session_019ez6rv297h5VQHkQeN93zR · depth 2 · COMPLETE · handled B11

## Completion (RUNTIME-LIMITS #6, fix round 7, G83)

**Entries applied.** R27 and R28 in the new file `bio-plane/src/store-place.mjs` (exports `STORE_HINTS`, `storeHint`, `storeGeneration`, `storeId`, `storeStub`); pure over `env`, nothing at load but the frozen list. Three new provided ids at most (K3294 respected: five exports, two requirement ids). Tests: `bio-plane/test/m/runtime-limits/store-place.test.mjs`, seen red first (file absent), then green.

**Rules stated.** Generation grammar `/^[1-9][0-9]*$/` with value 2 or more; `"02"`, `"2.0"`, `" 2"`, `"0"`, `"-2"`, `"1"`, a number type, and a digit string beyond a safe integer all give 1 (leading zeros: not a second room, K4754). An invalid hint is passed as none (no second argument). The suffix `~g<n>` is on the object's name only.
**Tests (K4426).** (1) allow-list table, `storeGeneration` table, exact `idFromName`/`get` arguments through a recording namespace (no second argument without a hint; `{locationHint}` with one; `bio~g2`, `scratch~g2`), `storeId` equal to what `storeStub` used. (2) Why missed: no test recorded `get()`'s arguments; the recording-namespace tests are the gap's fix at this level (plane's T1 census and T2 cover the sites). (3) **L**: one Miniflare run, `storeStub` with `wnam` on the real binding returns a working stub; local workerd places nothing, so that is all it proves. (4) **N**: placement is read by BOB at P after the redeploy.

**Census ops owned (K4208).** None: the census (T1) is plane's.

**For BOB.**
- `modules.json`: add `bio-plane/src/store-place.mjs` to runtime-limits' `paths` (the ownership run lists it; it is new and untracked by the module until then). Regenerate `order.mjs` if `modules.json` changes.
- Generated artifacts made stale by my change: none now (no existing file changed); every bundle that includes the plane will contain `store-place.mjs` once the users import it.
- `node bio-plane/src/setup-words/build.mjs --check` reports `rows.mjs` stale at word 19790 (`calculations.index.the_source_reads_as_one`): another job's new `t()` call (calculations G64), not mine; `store-place.mjs` has no words. The `setup-words` module's own tests show 3 failures for the same reason (18 pass); not touched.
- Proposed wording: none. R27/R28's "(not yet met: T51)" tags can drop.

**Deferred.** None. **Found in another module.** None.

**Run.** `node --test bio-plane/test/m/runtime-limits/`: 32 tests, 32 pass, 0 fail, 0 skipped. `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 0 of 176 (no existing file changed). Checks from the process repository: format `176 modules, 176 requirements files; 0 failures`; architecture `4 product files, 6 relative imports (1 naming no tracked file, not judged); 0 failures`; coverage `26 of 26 live requirement ids named by a test; 0 failures`; ownership `1 files changed by runtime-limits between tranche/T51 and HEAD; 0 failures`.

Size (session_01Ha6MYafmZ1NtDAwR8FeQEx): test runs 4, module lines 36

## J1 · COMPLETE

R27 and R28 met in bio-plane/src/store-place.mjs (new; add to runtime-limits paths in modules.json). 32 module tests pass, format/architecture/coverage/ownership 0 failures, impact 0 of 176. Notes in my record: setup-words build --check is stale from calculations' new word (not mine).

## J2 · QUESTION

QUESTION (best reading given; I carry on with it, none of it blocks the files). Three things the R30/R33/R34 text leaves to a figure I must not guess (R-GATE):
1. capFor(N): I read R33 as capFor(N) = max(0, floor(isolate_memory_bytes/2^20 - idle_bytes/2^20 - N)), i.e. 256 - 50 - N = 206 - N with today's entries, one formula for PDF and sheet runs (it replaces plane's 128-N and the sheet 128+39-N; those are test-support's and plane's to repoint, I only report). Tell me if a share per object of a class (the isolate is shared by up to five) must enter the formula.
2. standard column of the heavy-kind rows R30 gives no standard for (pdf bytes, xlsx declared, ods content, worker bytes, need_mb, cover_bytes, clean_bytes, grade_read, ocr frame...): I set standard = max(alpha, 50 MB = 52,428,800) for byte rows, standard = alpha for count/protective rows with no separate figure (so alpha never above standard holds), and protective = the figure R30 names, else = standard. Wrong figures are one-line edits of one file; say which.
3. PLATFORM_FIGURES `source` strings: R34 says `K4838 (<n>)` but gives no n; I write `K4838` for the four Stage-0 figures and `K4616` for idle_bytes, and the test pins the shape /^(K[0-9]+( \([0-9]+\))?|PLATFORM\.md P-M[0-9]+)$/.
Also: the render DOM row is "the figure the capture-sources job proposes"; I add no row for it (that job adds it, R30).

## Round 9 (RUNTIME-LIMITS #7, causes G124, G123a)

**Built.** `bio-plane/src/read-bounds.mjs` (`READ_BOUNDS`, `boundOf`, `statement`: R29-R31) and `bio-plane/src/byte-ledger.mjs` (`byteLedger`, `capFor`, `PLATFORM_FIGURES`: R32-R34). Both are new files outside `paths`: BOB adds them (the ownership run lists exactly these two). Tests: `test/m/runtime-limits/read-bounds.test.mjs` (R29, R30, R31) and `byte-ledger.test.mjs` (R32, R33, R34, R22), each id named by a test of its own.

**R-FOUR.** (1) New code, no earlier root cause. (2) Missed because nine ceilings were stated each in one requirement and no test compared them, and two cap formulas (128-N, 128+39-N) never met in one test; the new tests pin the table's shape and every row's invariants (three figures, alpha never above standard, a key) so a row added later changes none of them, and one test asserts one `capFor` answers a PDF and a sheet run. (3) Red seen first: both new test files failed with `ERR_MODULE_NOT_FOUND` for the two files; green after: 50 of 50 in the module. The G123a leak test runs a child capped at `capFor(100)` (106 MB): the read releases and `held()` is 0, the leak leaves `held()` at 100 MiB. (4) **L** only (a capped child); no live probe.

**Rules I applied (for BOB to confirm, J2).** (a) `capFor(N) = max(0, floor((isolate_memory_bytes - idle_bytes)/2^20 - N))` = 206 - N today. (b) Rows R30 gives no standard for: K4628 per kind as BOB ruled (B3, K4845): documents 100 MB, spreadsheets and images 50 MB, the alpha where above; protective = the R30 figure else the standard. (c) `source` strings `K4838` and `K4616`. (d) Row `render/dom` not added (the capture-sources job proposes the figure, R30). (e) `release` also throws a `TypeError` for a bad count (R32 only says it of `hold`). (f) Light kinds' alpha columns hold today's figures (csv 17 MiB, the others 24 MiB) though `boundOf` answers their standard.

**Rows (kind/name):** the 19 quoted pairs, the pdf names quoted in prose (`object_stream`, `cmap`, `embedded_file`), and `text|csv|tsv|json|xml` bytes+rows, `xml/tag`, `archive` uploaded_bytes/unpacked_bytes/depth/ratio/members/directory/name, `pdf` bytes/worker_bytes/need_mb/page_content/objects/direct_object/operands/tree_depth, `image` picture_frame/cover_bytes, `office` retained_objects, `sheet` columns/cell_chars/cell_kept_chars/sheets, `xlsx/declared_text`, `ods` content_xml/repeat_units, `workbook/cells`, `sheet_worker` cells/bytes/ms. Keys are `limit.<kind>.<name>`; the quoting module owns the sentence.

**Census ops owned (K4208).** None. **Words.** None (no sentence). **Generated artifacts made stale.** None now; bundles that include the plane change once a user imports these files.

**Found in another module.** plane `shape/harness.mjs:42-44` (`OBJECT_MB`, `capFor`) and `shape/g*.probe.mjs`, `m/workbooks/g44-large.test.mjs:28`, `m/file-safety/g44-large.test.mjs:28` still hold their own `capFor` formulas: to repoint to `capFor` of `byte-ledger.mjs` (test-support and plane jobs; R33 says no other formula exists).

**Checks (civicos-process, product path /home/user/bio).** format: 0 failures. architecture: 0 failures. coverage: 32 of 32 ids named, 0 failures. ownership: 2 failures, the two new files (BOB's `paths` edit). `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/runtime-limits/`: 50 tests, 50 pass, 0 fail. impact: affected modules 1 of 176 (runtime-limits itself), 2 test files.

**BOB's answer B3 applied.** capFor, source strings and the render DOM row as I had them; the standard column changed to K4845's per kind (a test of its own pins it). 51 module tests, all pass. Open questions: none. Re-points owed (above): plane and test-support `capFor` formulas.

Ownership (civicos-process): the only failures are bio-plane/src/read-bounds.mjs and byte-ledger.mjs, new files BOB adds to paths.
Size (session_01Bbx2ng6oqCwJyEKMZdPRg2): test runs 3, module lines 205

## J3 · COMPLETE

R29-R34 met in bio-plane/src/read-bounds.mjs and byte-ledger.mjs (new: add both to runtime-limits paths). 51 module tests pass; format, architecture, coverage 0 failures; ownership lists only those two files. B3 applied. Re-points owed: plane shape/harness.mjs capFor and the two g44-large tests' capFor to byte-ledger capFor. No open question. Record: build/jobs/T51/runtime-limits.md

## Round 9, batch B (RUNTIME-LIMITS #8): the READ_BOUNDS rows the quoting jobs reported

**Entries applied (B4: K4857, K4858, K4859, K4860).** The 19 rows added to `bio-plane/src/read-bounds.mjs` exactly as BOB gave them, keys `limit.<kind>.<name>`: `office` text_bytes, streamed_text_bytes, decoded_chars, structural_part_bytes, piece_chars; `archive` member_bytes; `image` working_set, retained_objects, picture_source; `ocr` picture_edge; `document` part_bytes; and the new kind `scan` (max_bytes, time_ms, embedded_pe, html_normalize, script_normalize, zip_type_rcg, partitions, icons_pe). No figure chosen by me; no new file, no `paths` change. Test: `read-bounds.test.mjs`, one test (R30, with R31's `boundOf` and `statement`) pins each row's three figures, key, the alpha answered by `boundOf` and `statement`'s `{size, bound, key}`; the shape test (R29) covers the new rows by invariants and stays green. Seen: rows absent before the edit (the new test is a lookup of the 19).

**Deferred.** None. **Found in another module.** None. **Words.** None. **Generated artifacts made stale.** None.

**Run.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/runtime-limits/`: 52 tests, 52 pass, 0 fail. Importers of `read-bounds.mjs` (image-cover, doc-clean, sheet-worker; rows were only added, no existing answer changed): 116 tests, 115 pass, 0 fail, 1 not run as pass (skipped by its own file). `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 62 of 176 (the users of runtime-limits; the full set not run, as no existing figure changed). Checks (civicos-process, product /home/user/bio): format `176 modules, 176 requirements files; 0 failures`; architecture `9 product files, 10 relative imports; 0 failures`; coverage `32 of 32 live requirement ids named by a test; 0 failures`; ownership `3 files changed by runtime-limits between origin/tranche/T51 and HEAD; 0 failures`; words `17 failures`, all in other modules (missingkey installer-steps `installer.fleet.logsunconfirmed` and the carried reds), none in runtime-limits (no sentence added).

Size (session_01XfNoWiwyETDV2uHxVRHPQy): test runs 3, module lines 241

## J4 · COMPLETE

19 READ_BOUNDS rows of B4 (K4857-K4860) added to read-bounds.mjs exactly as given (office, archive member_bytes, image, ocr picture_edge, document part_bytes, new kind scan); test names each by its figures, boundOf and statement. Module 52/52, importers 115/116 (0 fail); format, architecture, coverage, ownership 0 failures; words failures are other modules'. No new file, no paths change, nothing deferred or open. Record: build/jobs/T51/runtime-limits.md

## Round 9, batch B, CHANGE B5 (RUNTIME-LIMITS #8): rows 20-22 (K4862)

**Entries applied.** `image`/`rows_pixels` 201,326,592 for all three (new); `pdf`/`object_stream` changed to 33,554,432 for all three (was 16 MiB; standard was below, so 32 MiB); `pdf`/`xmp` 2,097,152 for all three (new); keys `limit.<kind>.<name>`. Tranche merged first. Tests: the added-rows test now holds 22 rows (R30, R31); the protective-figures test's `pdf/object_stream` expectation changed from 16 MiB to 32 MiB (the figure BOB changed). No other file read `pdf/object_stream` through `boundOf` yet (grep). **Deferred.** None. **Found in another module.** None. **Words.** None. **Generated artifacts made stale.** None.

**Run.** Module tests: 52 tests, 52 pass, 0 fail. Checks below.
Checks (civicos-process): format 0 failures; architecture 0 failures; coverage 32 of 32 ids named, 0 failures; ownership 0 failures; words 17 failures, all in other modules as before, none mine.

Size (session_01XfNoWiwyETDV2uHxVRHPQy): test runs 4, module lines 244

## J5 · COMPLETE

B5 applied (K4862): image/rows_pixels, pdf/xmp added; pdf/object_stream now 32 MiB for all three (its protective-figure test updated). Module 52/52; format, architecture, coverage, ownership 0 failures; words failures are other modules'. Nothing deferred or open.

## Round 9, batch C, START B6 (RUNTIME-LIMITS #9): three rows for acquisition (K4882)

**Entries applied.** Tranche merged first. `capture`/`keep_bytes` 33,554,432 (32 MiB), `capture`/`profile_text_bytes` 8,388,608 (8 MiB), `render`/`dom_bytes` 26,214,400 (25 MiB), each one figure in standard, alpha and protective, keys `limit.<kind>.<name>`; `capture` is a new kind, `render` gains a row. No sentence added. One test (R30, with R31's `boundOf` and `statement`) pins the three rows beside the table's existing ones.

**Run.** Module tests: 53 tests, 53 pass, 0 fail. Importers: the 18 test files that import `read-bounds` (impact lists 138 modules, 2140 files; the table gained rows only, no figure moved): 188 of 190 pass; the 2 failures are stale generated bundles, below.
Checks (civicos-process): format 0 failures; architecture 0 failures; coverage 32 of 32 ids named, 0 failures; ownership 0 failures; words 19 failures, all in case-checker, installer-steps, pdf-reader and test-support, none in this module.

Size (session_01Hw98qUCFYLUAekavfPLPJZ): test runs 3, module lines 261

**Found in another module (generated artifacts, §14; not regenerated).** `ocr-worker/dist/ocr-worker.bundled.mjs` is now stale against `bio-plane/src/read-bounds.mjs` (this change; its test `ocr-worker/test/ocr-worker.test.mjs` passed on `tranche/T51` and fails on this branch for that reason alone). `agent-worker/dist/agent-worker.bundled.mjs` was already stale on `tranche/T51` (browserrender, formats, provenance, read-bounds, render, doctypes registry), so `bio-plane/test/system/fleetbundles.test.mjs` fails before and after. Both are regenerated at the layer close (manifest, Generated artifacts); `pdf-worker` takes `runtime-limits` files too and should be checked then.

## J6 · COMPLETE

B6 applied (K4882): capture/keep_bytes 33,554,432, capture/profile_text_bytes 8,388,608, render/dom_bytes 26,214,400, each one figure in all three columns, keys limit.<kind>.<name>; test names R30/R31. Module 53/53; format, architecture, coverage, ownership 0 failures; words 19 failures are other modules'. Importers (18 files): 188/190. REPORT: ocr-worker's bundle is now stale against read-bounds.mjs (its test fails for that alone); agent-worker's bundle was already stale on tranche/T51; both for regeneration at layer close, pdf-worker's to be checked then. Nothing deferred.

## RUNTIME-LIMITS #10 · fix round 9, batch C: one row for file-safety (B7, K4893)

- **Entry applied.** `file_safety`, `ods_declared`: 8,388,608 (8 MiB) in standard, alpha and protective (`same(8 * MiB, k("file_safety", "ods_declared"))`), key `limit.file_safety.ods_declared`, beside `grade_read` in `bio-plane/src/read-bounds.mjs`. No member-facing bound moves; no sentence added.
- **Test.** `read-bounds.test.mjs`: new test naming R30 and R31: the three figures, the key, `boundOf` answers the figure, `statement` answers `{size, bound, key}`; the invariants test (R29) covers the new row.
- **Deferred / found in another module.** None.
- **Ran.** runtime-limits suite: 54 tests, 54 pass, 0 fail. Importers (doc-clean, csv-reader, image-cover): 184 tests, 183 pass, 0 fail (1 not counted pass, none failing). `impact.mjs origin/tranche/T51 HEAD` lists 138 modules through the table's import tree; the change only adds a row, so I ran the importers listed in `src`. Checks: format 0 failures; architecture 0 failures; coverage 32 of 32 ids, 0 failures; ownership 3 files, 0 failures; words 19 failures, the same 19 on `origin/tranche/T51` without my diff (installer-steps `missingkey` and others, none in this module).
- Generated artifacts made stale: every bundle whose inputs include `bio-plane/src/read-bounds.mjs` (the bundles built from it, e.g. ocr-worker and pdf-worker; their `.bundle.json` input hashes no longer match). Not regenerated; BOB regenerates at the round end.

Size (session_01GcfAY6gBYxDeKZVA2QwFeC): test runs 4, module lines 164

## J7 · COMPLETE

COMPLETE B7: READ_BOUNDS row file_safety/ods_declared (8 MiB x3, key limit.file_safety.ods_declared) added and tested (R30, R31). Suite 54/54; importers 183/184 pass, 0 fail; format, architecture, coverage, ownership 0 failures; words 19 failures identical to tranche/T51 without my diff. Details in my record.

## J8 · REPORT

Stale generated artifacts: bundles whose inputs include bio-plane/src/read-bounds.mjs (grep of dist manifests above in my record) are stale against this row; not regenerated, BOB regenerates at round end.

## RUNTIME-LIMITS #11 · fix round 9, batch D: one row for extraction and control-plane (B8, K4901)

- **Entry applied.** `pdf`, `request_bytes`: 2,097,152 (2 MiB) in standard, alpha and protective (`same(2 * MiB, k("pdf", "request_bytes"))`), key `limit.pdf.request_bytes`, beside the other `pdf` rows in `bio-plane/src/read-bounds.mjs`. No member-facing bound moves; no sentence added.
- **Test.** `read-bounds.test.mjs`: new test naming R30 and R31: the three figures, the key, `boundOf` and `statement`; the invariants test (R29) covers the new row.
- **Deferred / found in another module.** None. Generated bundles whose inputs include `read-bounds.mjs` are stale against this row (as after B6, B7); BOB regenerates at the round end.
- **Ran.** Tranche merged first. runtime-limits suite: 55 tests, 55 pass, 0 fail. Importers (pdf-reader bounds and cmap, reading-pipeline r9-reader, file-safety r57-bounds, acquisition r9-ceilings, byte-ledger): 54 tests, 49 pass, 0 fail (5 not counted pass, none failing). `impact.mjs` reported 0 affected modules on the staged diff. Checks: format 0 failures; architecture 0 failures; coverage 32 of 32 ids, 0 failures; ownership 3 files, 0 failures. words not run (it fails on other modules' files, same as the earlier rounds).

Size (session_01YC2QN7Jxms3WaivDnVr4Bf): test runs 5, module lines 12

## J9 · COMPLETE

COMPLETE B8: READ_BOUNDS row pdf/request_bytes (2 MiB x3, key limit.pdf.request_bytes) added and tested (R30, R31). Suite 55/55; importers 49 pass, 0 fail; format, architecture, coverage, ownership 0 failures. Bundles with read-bounds.mjs as input are stale; BOB regenerates at round end. Details in my record.

## RUNTIME-LIMITS #12 · fix round 9, batch D: three rows for control-plane and content (B9, K4916)

- **Entries applied.** In `bio-plane/src/read-bounds.mjs`: `text`, `request_bytes`: 3,145,728 (3 MiB) in all three columns, key `limit.text.request_bytes`, written in the `text` entry as `{ ...light("text", 24 * MiB), request_bytes: same(3 * MiB, k("text", "request_bytes")) }`; `content`, `held_text_chars`: 33,554,432 (32 Mi characters) x3, key `limit.content.held_text_chars`; `content`, `kind_scan_pages`: 16 x3, key `limit.content.kind_scan_pages` (a new `content` kind). `boundOf("text", "request_bytes")` answers 3 MiB although `text` is a light kind (R31: it takes the standard, equal to the alpha here); `text.bytes` is unmoved (standard 50 MB, alpha 24 MiB). No member-facing bound moves; no sentence added.
- **Test.** `read-bounds.test.mjs`: one new test naming R30 and R31 checks the three rows' figures in each column, their keys, `boundOf` and `statement`, and that `text.bytes` is unmoved. Seen red before the rows (rows absent), then green.
- **Deferred / found in another module.** None of mine. Generated bundles whose inputs include `read-bounds.mjs` are stale against these rows (as after B6-B8); BOB regenerates at the round end. On `tranche/T51` without my diff, `bio-plane/test/system/fleetbundles.test.mjs` already fails (agent-worker stale against acquisition, extraction and other sources) and `bio-plane/test/m/plane/g41-shape.test.mjs` "R84 G41 K4855: a 200,000-row xlsx" fails; both are not runtime-limits'.
- **Ran.** Tranche merged first. runtime-limits suite: 56 tests, 56 pass, 0 fail. Test files importing `read-bounds`/`READ_BOUNDS` (23 files): 249 tests, 246 pass, 2 fail (the two above, identical on `origin/tranche/T51`). `impact.mjs origin/tranche/T51 HEAD` lists 138 modules / 2181 test files (the table is global); I ran the direct importers, not that whole set. Checks: format 0 failures; architecture 0 failures; coverage 32 of 32 ids named, 0 failures; ownership 3 files changed, 0 failures; words 19 failures, none in runtime-limits (installer-steps etc., as before my diff).

Size (session_01HB2uM2PSYhuqXKXfVqYh67): test runs 5, module lines 11

## J10 · COMPLETE · re B9

COMPLETE B9: READ_BOUNDS rows text/request_bytes (3 MiB x3), content/held_text_chars (32 Mi x3), content/kind_scan_pages (16 x3) added and tested (R30, R31); boundOf(text, request_bytes) answers 3 MiB. Suite 56/56; importers 246/249, the 2 failures (fleetbundles stale bundles, g41-shape xlsx) identical on tranche/T51 without my diff; format, architecture, coverage, ownership 0 failures; words 19 failures none in my module. Bundles with read-bounds.mjs as input are stale; BOB regenerates at round end. Details in my record.

## Completion (RUNTIME-LIMITS #13, fix round 9, batch D, B10, K4922)

**Entries applied.** Two rows in a new `table` entry of `READ_BOUNDS` (`bio-plane/src/read-bounds.mjs`), today's figure in all three columns, each `same(n, k(...))`: `table`/`bytes` 20,971,520 (20 MiB of canonical CSV), key `limit.table.bytes`; `table`/`cells` 1,000,000, key `limit.table.cells`. No sentence added. Test: `read-bounds.test.mjs`, "R30: the rows calculations quotes ...", through `boundOf` and `statement` (R31), and the entry's keys are exactly those two.

**Deferred.** None.

**Found in another module.** `bio-plane/test/m/plane/g41-shape.test.mjs` ("R84 G41 K4855: a 200,000-row xlsx ... at cap 201 MB") fails identically on `origin/tranche/T51` without my change (checked), so it is not caused by this job; it belongs to plane.

**Tests.** runtime-limits suite: 57 tests, 57 pass. Importers run (g41-shape, r9-memory, acquisition r9-ceilings, reading-pipeline r9-reader, file-safety r57-bounds, pdf-reader bounds, csv-reader bounds, ooxml round9, capture r9-t51): 98 tests, 97 pass, 1 fail (the plane one above, pre-existing). The full `impact.mjs` set (2185 files) was not run: the change adds a key to a frozen table and moves no existing figure.
**Checks.** format: 176 modules, 176 requirements files; 0 failures. architecture: 0 failures. coverage: 32 of 32 live requirement ids named by a test; 0 failures. ownership: 3 files changed by runtime-limits; 0 failures. (words not run: not in the process repository's checks.)

Size (session_01Ra4BjLK2eQyeYJ4TDpTTos): test runs 4, module lines 169

## J11 · COMPLETE

COMPLETE · RUNTIME-LIMITS #13 · B10 (K4922): `table`/`bytes` 20 MiB and `table`/`cells` 1,000,000 added to READ_BOUNDS, all three columns equal, keys limit.table.bytes / limit.table.cells; tested through boundOf and statement (R30, R31). Suite 57/57; checks format, architecture, coverage, ownership 0 failures. Found in plane (not mine): g41-shape 'R84 G41 K4855 ... 200,000-row xlsx' fails identically on origin/tranche/T51 without my change. Details in my record.

## Completion (RUNTIME-LIMITS #14, fix round 9, batch D, B11, K4936)

**Entries applied.** The `workbook` entry of `READ_BOUNDS` (`bio-plane/src/read-bounds.mjs`): `cells` is now `same(250000, ...)` (alpha 250,000 in all three columns, K4831 (10); the comment rewritten to the ruling); NEW `bytes`: `bytes(20 * MiB, ..., MB50)` (alpha 20 MiB, standard and protective 50 MB, K4845), key `limit.workbook.bytes`; NEW `cells_json_bytes`: `same(64 * MiB, ...)`, key `limit.workbook.cells_json_bytes` (K4831 (8)). No sentence added. Tests (`read-bounds.test.mjs`): a new "R30: the workbook rows ..." test checks each row's three columns, its key, `boundOf` and `statement` (R31) and that the entry's keys are exactly the three; the existing heavy-kinds test now expects `boundOf("workbook", "cells")` = 250,000.

**Note for BOB.** `build/requirements/runtime-limits.md` R30 still says the workbook's cells are "50,000 (250,000 once the workbook-add job merges)"; the table now holds 250,000 per K4831 (10). The requirements are BOB's; I did not edit them.

**Deferred.** None.

**Found in another module.** (1) plane: `g41-shape.test.mjs` "R84 G41 K4855 ... 200,000-row xlsx" fails the same on `origin/tranche/T51` without my diff. (2) workbooks: 7 of 37 tests under `bio-plane/test/m/workbooks/` fail (the real-shape cap cases in add/lifecycle: "R1 R2 a workbook of the bound's cells adds ...", the 23,103-cell control, formula-heavy, 26.2 MB, 221,376 cells, one-character cells, stored-over-the-bound); the same 7 fail with `read-bounds.mjs` restored from `origin/tranche/T51`, so my change did not cause them. No workbooks code calls `boundOf("workbook", ...)` yet. Generated artifacts with `read-bounds.mjs` as input are stale; BOB regenerates them.

**Tests.** runtime-limits suite: 58 tests, 58 pass. `build/plan/impact.mjs origin/tranche/T51 HEAD`: 138 of 176 modules and 2192 of 2658 test files affected and run; the failures I inspected (g41-shape; workbooks above; control-plane, plane and journey-check in the impact listing, the last with `node_modules` missing in five directories) are not in this module; I confirmed the first two against the baseline.
**Checks.** format 0 failures; architecture 0 failures; coverage 32 of 32 live ids named; 0 failures; ownership 3 files changed by runtime-limits; 0 failures; words 0 failures.

Size (session_019ez6rv297h5VQHkQeN93zR): test runs 7, module lines 187

## J12 · COMPLETE · re B11

COMPLETE · RUNTIME-LIMITS #14 · B11 (K4936): READ_BOUNDS workbook rows: cells 250,000 in all columns (comment rewritten), NEW bytes 20 MiB alpha / 50 MB standard and protective, NEW cells_json_bytes 64 MiB x3; tested through boundOf and statement (R30, R31). Suite 58/58; format, architecture, coverage, words, ownership 0 failures. R30's text in the requirements still says 50,000 for the workbook's cells (yours to update). Not mine: g41-shape and 7 workbooks real-shape-cap tests fail identically on tranche/T51 without my diff. Bundles with read-bounds.mjs as input are stale. Details in my record.
