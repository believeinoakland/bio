# doc-clean (T51)

**Status** · session_01BeVLdPhs7muyDKyKa7EQFX · depth 2 · WORKING · handled B0

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
