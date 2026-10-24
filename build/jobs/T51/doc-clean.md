# doc-clean (T51)

**Status** · session_01WbxrGGnsckmJi79PwS3pyv · depth 2 · WORKING · handled B2

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
