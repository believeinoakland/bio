# doc-clean (T51)

**Status** · session_01QUXFAzg41W7YNtvFQwBTkB · depth 2 · WORKING · handled B6

## J1 · REPORT

Judgment on the 11 plain findings (words-pass/doc-clean.md, K3957). Each was a member-facing refusal sentence: a refusal's detail reaches members through case-carriage's refusal result (case-carriage/index.mjs:824, :146) and the CLEAN_REFUSALS table is the meaning of each code. None is developer text, so none goes to the unkeyed list. All 11 now read through localize with ids doc-clean.index.* (9), doc-clean.package.* (1), doc-clean.pdf.* (1), named in the test "K3957 the refusal sentences are read by id ...".

For BOB to settle (not changed by this job): the same kind of sentence is left as a plain constant where the check's plain arm does not count it, because it has punctuation or fewer than five words: CLEAN_REFUSALS ENCRYPTED ("the document is encrypted"), HTML_EMBEDS_IMAGE ("the HTML document embeds an image as a data: URI"), EMBEDDED_FILE and ARCHIVE; also pdf.mjs "the PDF has no readable trailer" and "the PDF's trailer names an /Encrypt dictionary". The words check counts one unkeyed item in doc-clean. Say whether these should be localized too (four or five more ids and tests), or stay as they are.

## J2 · COMPLETE

T51-259 (words, K3957) done. Commit 9bda0199a6 on job/T51/doc-clean.

Applied: the 11 plain findings in build/plan/words-pass/doc-clean.md, each read through localize under its id (index 9, package 1, pdf 1), judged member-facing (REPORT J1). A test names all 11 ids and checks each refusal answers its code and a text. Nothing deferred. The module's requirements are unchanged; no word is a test copy.

Tests: node --test bio-plane/test/m/doc-clean/*.test.mjs: 41 tests, 40 pass, 0 fail, 1 skipped (oracles' LibreOffice and pdftotext check, skipped by name when the tool is missing, as before).
Checks, from civicos-process: format 0 failures; architecture (doc-clean) 0 failures; coverage (doc-clean) 0 failures; ownership doc-clean tranche/T51 job/T51/doc-clean: 0 failures; words doc-clean: 0 failures (inline 0, plain 0, testcopy 0, marker 0).
checks/run.mjs /home/user/bio: format and architecture 0 failures, but its words arm reports 4,833 failures across the other 172 modules (none in doc-clean) and coverage 33 failures, none named doc-clean. These are the inherited reds of the words pass, not this module's.

Size (session_01BeVLdPhs7muyDKyKa7EQFX): test runs 4, module lines 1056

## J3 · COMPLETE

T51-259 (words), answering B2 (CHANGE, K3964). Commit 7dff2f517e on job/T51/doc-clean; tranche/T51 merged in first (no conflict).

Applied (B2): every member-readable refusal sentence in doc-clean is read through localize with an id doc-clean.<file>.<slug>, not only the 11 the check counts. That covers the table's ENCRYPTED, EMBEDDED_FILE, HTML_EMBEDS_IMAGE and ARCHIVE; index's other refusal details (ARCHIVE, the not-neither, RTF, MIME and XML/SVG refusals); images' segment-walk refusals, the fallback detail, the SVG-element and media-compressed refusals, and the format names in NAMES (name_tiff to name_svm); package's part-cannot-be-read and part-media refusals; pdf's cannot-open, encrypted, trailer, and writer/reader refusals. Relayed detail from image-cover is passed through as before. No refusal text, code or control changed.

Test: clean.test.mjs names all the new ids in "K3964 every member-readable refusal sentence is read by id ...", and triggers the reachable refusals (RTF, MIME, XML, control-byte text, ARCHIVE, HTML_EMBEDS_IMAGE). The unreachable ones are named and their table values checked, not triggered.

Tests: node --test bio-plane/test/m/doc-clean/*.test.mjs: 42 tests, 41 pass, 0 fail, 1 skipped (the LibreOffice and pdftotext oracle, skipped by name when the tool is missing).
Checks: words doc-clean 0 failures (unkeyed 0); format 0; architecture 0; coverage (doc-clean) 0; ownership doc-clean tranche/T51 job/T51/doc-clean 0 failures. checks/run.mjs: no finding names doc-clean; the repo-wide reds are the other modules' (words 4,231, coverage 32).
setup-words build.mjs --check: exits 1 on one item in jurisdictions (index.amount_is_amount_and_units, a formatted argument R18); nothing in doc-clean. Not mine to change; reported for BOB.

Judgment for BOB: NAMES in images.mjs were fragments used inside sentences; I localized each one separately, so a translator sees whole words, not a fragment.

Size (session_01BeVLdPhs7muyDKyKa7EQFX): test runs 4, module lines 1063

## J4 · REPORT

T51 fix round 9 (doc-clean #4), two items for BOB; nothing here blocks the job.

1. A ceiling I keep that has no READ_BOUNDS row (ruling K4842 (1)): `CLEAN_MAX_PART_BYTES`, the most uncompressed bytes one part of a package may declare. Kind `document`, name `part_bytes`; figures standard 104,857,600 (K4628: documents 100 MB), alpha 33,554,432 (32 MiB, today's), protective 33,554,432. Key `limit.document.part_bytes` (the sentence is mine: `doc-clean.package.part_n_declares_uncompressedsize_bytes`). Until runtime-limits carries the row, the constant is `2 * boundOf("document", "clean_bytes")`, which is 33,554,432 today, so the module holds no literal for it; when the row exists it becomes `boundOf("document", "part_bytes")`.

2. G136c's cleaner-crash half is case-carriage's (ruling K4842 (4); I do not ask for a CHANGE). For case-carriage's job, the exact change: at `case-carriage/index.mjs:1270-1282` stamp `tried` before `cleanDocument` is called, not after it returns. doc-clean's side is done and tested: `cleanDocument` keeps nothing between calls, so a call after a crash (a thrown `yieldNow`, an isolate kill) answers exactly what a first call would.

## J5 · COMPLETE

Fix round 9, START B3 (G136c, G133d, G124 quotes, G125c). Commit on job/T51/doc-clean; tranche/T51 merged in (no conflict). Red: three tests wait on image-cover (below).

**Applied**
- G136c (R3, R5, R6): the package writer states the count it wrote; at 65,535 entries or more it writes ZIP64's end record and locator and the 16-bit sentinel (`package.mjs` `zip`). A package of more entries than `boundOf("office","entries")` is refused `TOO_MANY_ENTRIES` with its count, nothing written (new code, also in `CLEAN_REFUSALS`); up to that many are copied whole, in order, less the parts R6 removes. Info-ZIP's `unzip -Z1` and Python's `zipfile` list the same names as `ooxml.readContainer` for 65,544 / 65,545 / 70,010 / 100,000-entry DOCX copies. A part whose directory entry declares a ratio over `boundOf("archive","ratio")` is `DOCUMENT_UNREADABLE`, judged before inflation.
- G133d (R11): `xml.mjs` is a linear, counted scan: every search runs forward from where the last ended or is bounded by the tag limit; the bytes scanned (`scan.scanned`) are at most 4n for all the hostile shapes (200,000 `<!x>`, 40,000 `<a b="`, 20,000 unclosed `<w:comment `, 100,000 stray end tags, 50,000 attributes in one tag). The pass awaits `yieldNow` every 65,536 tokens (`cleanDocument(bytes, {yieldNow, scan})`, both optional; nothing kept between calls). A tag over `boundOf("xml","tag")` is `DOCUMENT_UNREADABLE` naming the part (also for an SVG image). The quadratic was `<!x>`: two unbounded `indexOf` per declaration.
- G124 (R12): `CLEAN_MAX_BYTES`, the entry bound, the tag bound and the ratio are read from `boundOf`; a test reads the module's source and finds no literal of any ceiling's figure. `CLEAN_MAX_PART_BYTES` has no row: see REPORT J4.
- G125c (R3): the module relays `stripMetadata`'s refusal under its own code with the part's name; no change was needed in doc-clean. The three tests that put the hostile PNG/JPEG of SCAN D7/D8 in a DOCX are written and stay red by name until image-cover's job (R10) merges (R-SEAM): `R3 SCAN D7 ... 30,000,000 x 1`, `R3 SCAN D7 ... 1,000,000 empty IDAT chunks`, `R3 SCAN D8 ... 2,000,000 two-byte markers`. A PNG within the bounds is copied (control, green).
- G136c crash half: case-carriage's (REPORT J4); the doc-clean side is tested (`R11 a cleaner that crashes ...`).

**Deferred** none.
**New files outside my paths** none (`bio-plane/src/doc-clean/refusal.mjs` is inside; `bio-plane/test/m/doc-clean/round9.test.mjs` is the new test file).
**Found in another module** ooxml: `readContainer` has no entry cap (G125h is its job); when it returns a named refusal for too many entries, doc-clean maps it to `TOO_MANY_ENTRIES` at the same place (`package.mjs`, the `c.entries.length` check), which I can only know once ooxml's name is merged. `setup-words` rows: new ids not yet in `rows.mjs` (the words check reads them as keyed): `doc-clean.xml.where_has_a_tag_of_more`, `doc-clean.package.the_package_holds_count_entries`, `doc-clean.package.part_n_declares_uncompressedsize_bytes_in`, `doc-clean.index.the_package_holds_more_entries`. Words owed to `later-ux.md`: the `TOO_MANY_ENTRIES` refusal ("the package holds more entries than this module copies") and the tag/ratio sentences.
**Stale generated artifacts** `bio-plane/dist/bio-plane.bundled.mjs` (doc-clean is bundled); `setup-words/rows.mjs` (the four ids above).

**Tests** `node --test --test-force-exit bio-plane/test/m/doc-clean/`: 66 tests, 62 pass, 3 fail (the three image-cover seam tests above), 1 skipped by name (tool missing). Users of doc-clean: `bio-plane/test/m/case-carriage/ case-disclosures/ scheduler/copies.test.mjs`: 225 tests, 225 pass.
**Checks** (civicos-process): format 0 failures; architecture doc-clean 0; coverage doc-clean 12 of 12 ids named, 0; ownership doc-clean tranche/T51: 0 failures; words doc-clean: 0 failures (unkeyed 0, missingkey 0).

Size (session_01WbxrGGnsckmJi79PwS3pyv): test runs 9, module lines 1189

## J6 · COMPLETE

Answering B4 (CHANGE, K4860); tranche/T51 merged in (no conflict). No source change: R4 is measured.

R4's own test (`measure.test.mjs`, workerd, run alone): 5 runs plus 1 more, and once on one core (`taskset -c 0`); all 7 pass (1 test each, 0 fail). Figures (time ms / peak growth MB; isolate 128 MB):
- 16 MiB PDF (copy 16.1 MB): 180-390 ms; peak growth 17.6-31.9 MB (one core: 390 ms, 17.8 MB).
- 16 MiB PDF of small objects (15.4 MB, copy 12.6 MB): 2565-2985 ms; peak growth 92.9-118.4 MB (one core: 2985 ms, 94.1 MB). This is the one near the isolate's 128 MB; the worst of 7 runs was 118.4 MB.
- 16 MiB .docx (copy 16 MB): 1406-1808 ms; peak growth 15.6-80.5 MB (one core: 1808 ms, 65.1 MB).
All answers whole copies. R4 is met, with the small-object PDF's margin (about 10 MB at worst) stated.

`document.part_bytes` is not yet in `READ_BOUNDS` (RUNTIME-LIMITS #8 not merged); I re-point `CLEAN_MAX_PART_BYTES` to `boundOf("document", "part_bytes")` at that CHANGE.

Size (session_01WbxrGGnsckmJi79PwS3pyv): test runs 16, module lines 1139

## J7 · COMPLETE

Answering B5 (CHANGE, K4862); tranche/T51 merged (no conflict). `CLEAN_MAX_PART_BYTES` is now `boundOf("document", "part_bytes")` (the 2 x clean_bytes stand-in is gone); no local read-bounds copy, no fallback. R12's test now asserts the row.

With image-cover merged, the three SCAN D7/D8 tests (hostile PNG/JPEG in a DOCX) pass: IMAGE_TOO_LARGE naming the part.

Tests: node --test --test-force-exit bio-plane/test/m/doc-clean/: 66 tests, 65 pass, 0 fail, 1 skipped (oracle tool missing, by name).
Checks: format 0; architecture doc-clean 0; coverage doc-clean 12 of 12, 0; ownership doc-clean tranche/T51 0; words doc-clean 0 (unkeyed 0, missingkey 0).
R4 figures are in J6. Entry-cap mapping from ooxml's refusal name (J5) still waits on ooxml's merge; I use no rows 20-22.

Size (session_01WbxrGGnsckmJi79PwS3pyv): test runs 2, module lines 1139

## Completion notes · START B6

DOC-CLEAN #5, START B6 (batch C): the entry cap now refused by ooxml (K4866).

**Cause.** Since OOXML #4 `ooxml.readContainer` (and `discriminate`, which `index.mjs` calls first) answers `{ok:false, why:"OFFICE_ENTRIES_MAX", limit, final:true}` for a package whose end record declares more than `boundOf("office","entries")` entries; it carries the limit, not the count. doc-clean's own `c.entries.length` check was therefore unreachable and the refusal came out as `DOCUMENT_UNREADABLE`.

**Applied.** `package.mjs`: `tooManyEntries(d)` (exported) builds R3's `TOO_MANY_ENTRIES` with the count read from the end record (`declaredEntries`, ZIP64 record when the 16-bit field is the sentinel); `cleanPackage` throws it on ooxml's `OFFICE_ENTRIES_MAX`; the dead length check is removed. `index.mjs` `packageFormat` maps the same `why` through it, since discriminate meets the cap first. Nothing is written; a package of exactly the bound is still copied (id `doc-clean.package.the_package_holds_count_entries` unchanged).

**Test.** `round9.test.mjs` "R3 R12 TOO_MANY_ENTRIES…" was the red (`AssertionError: OFFICE_ENTRIES_MAX`, actual false; then `DOCUMENT_UNREADABLE` where `TOO_MANY_ENTRIES` was expected). The test itself counted the over-bound fixture with `readContainer`, which now refuses it (ooxml R3/R31); it now counts it with the test's own `endCounts`. Green after: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/doc-clean/`: tests 66, pass 65, fail 0, skipped 1 (the oracle absent by name).

**Deferred / found in other modules.** None. Words: no new sentence.

Size (session_01GLQmY1ex7pDodDcbS94kDg): test runs 4, module lines 1157

## J8 · COMPLETE

COMPLETE (START B6). ooxml's OFFICE_ENTRIES_MAX refusal (readContainer and discriminate) now maps to TOO_MANY_ENTRIES with the declared count, nothing written; the package of exactly the bound is still copied (package.mjs tooManyEntries, index.mjs packageFormat). Red: round9 'R3 R12 TOO_MANY_ENTRIES' (AssertionError OFFICE_ENTRIES_MAX, then DOCUMENT_UNREADABLE); green after. The test's own count of the over-bound fixture used readContainer, which ooxml now refuses; it uses endCounts. doc-clean tests 66 (65 pass, 1 skipped oracle absent), case-carriage 98/98, case-disclosures 115/115. Checks: format 0, architecture 0, coverage 0, ownership 0 failures; words: no finding in doc-clean (the 19 failures are pdfgen.mjs inline x2 and installer-steps missingkey x5 etc., not mine). Details in build/jobs/T51/doc-clean.md 'Completion notes'.
