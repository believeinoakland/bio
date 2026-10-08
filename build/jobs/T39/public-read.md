# public-read (T39)

**Status** · session_01Djbnfgfma73t1Qd5xWboXx · depth 2 · COMPLETE · handled B3

## Completion (T39-12; N806; K2333)

**Reading set (mechanics §17, K2304).** Over 300 KB (code alone 248 KB), so (3): read whole myself `build/requirements/public-read.md`, layer 8's row of `build/layers.md`, the code and tests the entry changes (`src/public-read/casefile.mjs`, `src/public-read/index.mjs`, `test/m/public-read/obscured.test.mjs`, `test/m/public-read/fixture.mjs`), and the used services named: `case-grammar` R12, R13; `case-carriage` R11, R14–R17 with its member-document paragraph and `COPY_CLEANED_LABEL` (R15's fixture); `doc-clean`'s public part (the cleaner R15 names). One worker read the rest of the module's code and tests in full (`publication/worker.mjs`, `container.mjs`, `inband.mjs`, `public-read/door.mjs`, `public-read/checks.mjs`, the other 34 test files: 551 KB with the requirements) and wrote a summary of about 2,400 words, each statement citing file and line, told the task and R3/R23.

**Entries applied.** T39-12, R23 as re-worded:
- Code: the logic was already keyed on a `materials:` row stating `obscured` (`case-grammar` R12), never on a photo, so a member document's cleaned copy is carried as one `obscured` file at `obscured.copy` and served by that hash, and its original is carried and served by no route (`verifySha`, `publishedbytes`, `publishedManifest`, the case file, archive walk), as for a photo. Wording only: comments in `casefile.mjs` and `index.mjs` name either kind of copy; `#photoOriginals` renamed `#copiedOriginals`; the `unheld` reasons `ORIGINAL_NOT_CARRIED` and `ARCHIVE_HOLDS_ORIGINAL` say "a material" not "a photo" (they are no longer only about photos; used only in this module).
- Test (`obscured.test.mjs`, "R23 a member document carried as its cleaned copy (case-carriage R15) …"): a member's PDF whose `/Info` names its author, captured as a document. Its copy is `doc-clean.cleanDocument`'s answer for those bytes (generated with doc-clean at T39 and held in the test as bytes, because this module does not use `doc-clean`: importing it fails the architecture check). The original is registered under the row's ref and put in the bucket, as an edition before T39 carried a member document whole. The test checks: the copy is the only file under the ref, of kind `obscured`, bytes whole; `publishedCase` answers `obscured: {copy, label}` with `COPY_CLEANED_LABEL`'s words; the copy is served by its hash; the original answers `NO_PUBLISHED_PART` byte-identical to a never-published hash, `verifySha` unpublished, absent from `publishedManifest`; no case-file file is the original; and a negative control. Mutation check: switching off the originals filter in `#copiedOriginals` makes this test fail.
- Not yet merged: `tranche/T39` after case-carriage (START: on BOB's word). The test imports nothing of case-carriage (label held literally, as the photo test holds `OBSCURED_LABEL`), so it should not change. I re-run on a `CHANGE`.

**Deferred.** None.

**Found in other modules / for BOB (from the worker's summary, checked against this module's code):**
1. `case-carriage` R8 refuses at the commit an archive whose listing names an *image* (T38). An archive holding a member document's original is not refused there. This module still carries no such archive (`#archivesHolding` walks every copied original, keyed on `obscured`), so R23 holds here. Whether R8 should also cover document originals is case-carriage's question.
2. An edge case, not fixed: R23's calculation inputs are carried by the hash a `calculations:` row states. A calculation naming a copied material's original as an input would carry it. No path writes that today. Excluding it would stop the checker recomputing the calculation, so it is a requirements question, not a code fix.
3. The docket routes (R21, R25) relay `docket`'s own answer, which carries captures' bytes. R23's "no route of this module serves the original" reads as covering them too. Whether `docket` R14 should leave out a copied material's original is docket's question.

**Tests and checks.**
- `node --test bio-plane/test/m/public-read/`: tests 156, pass 156, fail 0. The manifest names no layer tests.
- `checks/format.mjs`: 139 modules, 137 requirements files; 0 failures.
- `checks/architecture.mjs public-read`: 46 product files, 158 relative imports; 0 failures.
- `checks/coverage.mjs public-read`: 33 of 33 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs public-read tranche/T39`: 0 failures, re-run after commit (below).

Size (session_01Djbnfgfma73t1Qd5xWboXx): test runs 6, module lines 3,543

## J1 · COMPLETE

T39-12 applied, committed and pushed. R23 holds for a member document's copy: the logic was already keyed on obscured. The changes are wording (comments; the unheld reasons ORIGINAL_NOT_CARRIED and ARCHIVE_HOLDS_ORIGINAL say 'a material') and one test in obscured.test.mjs: a member's PDF; its copy is doc-clean.cleanDocument's answer, held as bytes because importing doc-clean fails the architecture check; copy served, original never. 156/156 tests pass; the format, architecture, coverage and ownership checks all report 0 failures. Not yet merged: tranche/T39 after case-carriage. The test does not depend on it; I re-run on your CHANGE. Three observations for other modules (case-carriage R8 checks only images; a calculation input at an original's hash; the docket routes) are in my record.

## B2 (CHANGE): case-grammar merged

Merged `tranche/T39` into this branch (case-grammar T39-9, K2374). Re-ran:
- `node --test bio-plane/test/m/public-read/`: tests 156, pass 156, fail 0.
- format: 139 modules, 138 requirements files; 0 failures. architecture: 0 failures. coverage: 33 of 33; 0 failures. ownership: 4 files; 0 failures.
- `case-checker/program.mjs` not touched (stale by rule 3 (7), BOB's at L8's close). The tranche merge after case-carriage (START) is still owed on BOB's word.

Size (session_01Djbnfgfma73t1Qd5xWboXx): test runs 7, module lines 3,543

## J2 · COMPLETE

B2 done: tranche/T39 merged (case-grammar), suite re-run: 156/156 pass; format, architecture, coverage and ownership checks 0 failures. program.mjs untouched. Pushed. The merge after case-carriage is still owed on your word.

## B3 (CHANGE): case-carriage merged

Merged `tranche/T39` (case-carriage T39-10, K2377). The suite run against the real case-carriage had 20 failures, all from one cause. R13 now lapses a document carried whole that no receipt shows this copy fetched (`provenance` R62). Every test fixture document carried whole had no receipt, so each commit was refused (or the material was not carried). Code unchanged. Fixtures brought in line with R13, as `case-carriage`'s own fixture does:
- `fixture.mjs`: `w.receipt(sha, via, locator)` through `provenance.recordReceipt`; `w.doc` gives its capture a `direct` receipt unless one already answers it fetched (so a later publication fixture that records one is not doubled).
- `archives.test.mjs`: an outer archive gets a `direct` receipt; an inner archive and each member get an `unpacked` receipt naming their archive (`zip:<sha>!<index>`); the plain material gets a `direct` one.
- `obscured.test.mjs`: the same for its archives and members. The member document in the T39 test keeps no receipt: it is a member's file, carried only as its copy.
- `casefile.test.mjs`: the co-attestation test's document gets a `direct` receipt.

No assertion was weakened; each test checks what it checked before.

Re-run:
- `node --test bio-plane/test/m/public-read/`: tests 156, pass 156, fail 0.
- format: 0 failures. architecture: 0 failures. coverage: 33 of 33; 0 failures. ownership: 0 failures.

**Found in another module (for BOB).** A member document carried whole and refused at the commit is answered `PHOTO_MARKS_CHANGED_SINCE` (C-122.6, "A mark changed after this case was prepared…"), listed under `photos` with why "a member's document travels only as its copy". The code and sentence speak of a photo's marks for a document, which has none. It is publication's commit refusal (or case-carriage's R13 answer it relays); its wording is UX's (C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` may be the intended code once publication merges).

Size (session_01Djbnfgfma73t1Qd5xWboXx): test runs 14, module lines 3,543

## J3 · COMPLETE

B3 done: tranche/T39 merged (case-carriage). 20 tests went red for one reason: R13 lapses a document carried whole with no fetch receipt, and the fixtures' carried documents had none. Code unchanged. Fixtures now give such documents their receipts (direct; unpacked naming the archive for members), as case-carriage's own fixture does; no assertion weakened. 156/156 pass; format, architecture, coverage and ownership checks 0 failures. Pushed. For you: a member document refused at the commit is answered PHOTO_MARKS_CHANGED_SINCE (C-122.6, 'A mark changed…') under 'photos'. That wording is wrong for a document (detail in my record). Waiting on your word for publication's merge.
