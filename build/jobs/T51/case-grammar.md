# case-grammar (T51)

**Status** · session_01VBNM18B4vfkzoJAakCSzJF · depth 2 · WORKING · handled B3

## Completion (T51-227, R8)

**Entries applied.** T51-227, all 265+ findings by B3's ruling (K4024):
- (b) `casefile.mjs`: every reason of `caseFileManifestCheck` (and `shown`'s fallback) is `localize('case-grammar.casefile.<slug>', en, vars)`, en identical to the old text (45 ids, listed below). Placeholders `{key, fingerprint}`, `{index, sha256, bytes}`, `{path, sha256, bytes, part, kind}` are not names, so `localize` leaves them.
- (a) The case document's rendered and signed sentences stay code, unkeyed (see REPORT): `account.mjs`, `blocks.mjs`, `complete.mjs`, `edition.mjs`, `index.mjs`, `outcomes.mjs`, `standing.mjs`, `tensions.mjs`, `words.mjs`. The sentences the tests named were hoisted, byte-identical, into the new `sentences.mjs` (`SENTENCES`, exported from `index.mjs`) and the renderers read them from there; a render change is still a new format.
- (c) Tests: no test copies a sentence now (words check: testcopy 0). Tests compare with `SENTENCES`, the module's own exports (`COMPLETE_EDITION_HEADINGS`, `ACCOUNT_HEADING`, `WORDS.team`) or the SHA-256 of an exported pinned sentence (R27 blocks, citations, tension words, outcomes heading, lens closing, withheld reason). The `/7` golden is untouched.

**New ids the checker program must carry (B3 (b)).** `case-grammar.casefile.` + `not-a-manifest, unknown-field, format, group, case, edition, sha256, keys, key-shape, key-unknown-field, key-line, fingerprint, key-twice, parts, part-shape, part-unknown-field, part-index, part-sha256, part-bytes, files, file-shape, file-unknown-field, file-kind, kind-format, path, path-kind, path-twice, file-sha256, input-sha, archive-sha, file-bytes, file-part, file-order, single-kind, optional-single-kind, chain-without-document, obscured-unnamed, original-carried, obscured-copy-missing, case-document-sha, part-empty, part-sha256-differs, part-bytes-differs, unreadable, unreadable-value`. `casefile.mjs` now imports `../setup-words/index.mjs`; case-grammar's code reaches the program through `case-checker` (which imports `case-grammar/index.mjs` and so `casefile.mjs`) via `bundler`.

**Deferred.** None.

**Found / for BOB.** (1) `build/modules.json`: case-grammar's `uses` lacks `setup-words` (architecture: 1 failure, `casefile.mjs`); and its requirements' Uses. (2) `program.mjs` and the plane bundle are stale (generated). (3) `setup-words` `rows.mjs` is stale until regenerated. (4) Requirements Provides could name `SENTENCES` (BOB's wording edit).

**REPORT for the design's `unkeyed` list** (all "signed case-document text, pinned per format (K1333)"; the words check still lists them): `account.mjs` 48, 121; `blocks.mjs` 39–44, 78, 88, 94; `complete.mjs` 61 sites (section headings 90–92, 101–107, lane/recompute/strength/grade words 108–130, grade meanings, obscured words 150–154, the page notices, chain, materials, searched, calculations, account, outcomes, review-comment, approval, signing sentences, up to 542; plus `SENTENCES` values); `edition.mjs` 137–141, 183–188; `index.mjs` 104–112, 154, 175; `outcomes.mjs` 73; `standing.mjs` 41–57; `tensions.mjs` 28–44, 70; `words.mjs` 39–102 (the frozen `WORDS.group` and `WORDS.team`, R33). None is the exact text of a `words.json` row that I could find.

**Tests and checks.** `node --test bio-plane/test/m/case-grammar/`: 164 pass, 0 fail. `checks/run.mjs`: format 0; architecture 1 failure (the `uses` above); coverage 25 failures, other modules (case-grammar names all ids); words: case-grammar testcopy 0, 134 inline/plain, all pinned. `setup-words/build.mjs --check`: stale-rows note only. `checks/ownership.mjs`: 0 failures.

Size (session_01MkGZXQstbPYfaeA14Kf7cM): test runs 7, module lines 2975

## Completion (T51-136, R33)

**Entries applied.** T51-136: `CASE_DOCUMENT_FORMAT` is `bio-case-document/8`; `/7` (new export `CASE_DOCUMENT_FORMAT_V7`) and earlier stay accepted; every predicate holds for `/8` as for `/7`. New `words.mjs` holds the two frozen word sets (`WORDS.group` = today's words, `WORDS.team`) and `caseWordsOf(fm)` (group for `/7` and earlier, team for `/8`+ and for no readable format). Spelled by the document's own format: `attributionBodyLines(rows, format)`, `sourceStatement(entry, format)`, `sourceRowsStanding(rows, publishable, format)`, `lensSectionLines({..., format})` (format in force when none given); `lensClosingSentencesOf(fm)`; R14 renders in the document's words (notice, title, original line, workbook status, checker line, another team's finding, account intro, approval rule, attestation lines with level `group` printed "team", vouched line, lens kinds and closing). `editionProductOf` now names CivicOS for `/6` and earlier only. Exported `LENS_KIND_WORDS`, `LENS_CLOSING_SENTENCES`, `NOT_RECORDED_STATED`, `RECOMPUTE_WORDS`, `OBSCURED_WORDS` stay the frozen group words.

**Deferred.** None.

**Tests.** New `words.test.mjs` (R33: by-format choice, frozen sets, `/8` = `/7` with team for group by substitution, attribution, lens, sources R27/R28, no-format) and `complete-v7-golden.json` (a rich `/7` case file rendered by the pre-change code, SHA-256 `1a890aaf…b2d3`, never regenerate). Existing tests that pin `/7` words now pin the `/7` format explicitly (fixture default `/7`); format-in-force assertions moved to `/8`.
Module: 164 of 164 pass. `checks/format`: 0 failures. `checks/architecture` case-grammar: 0 failures. `checks/coverage` case-grammar: 33 of 33 ids named. `checks/ownership` vs tranche/T51: 18 files, 0 failures. `checks/run.mjs`: architecture 0 failures; 22 coverage failures, all other modules (inherited).

**Found in other modules (users of case-grammar; their tests run).** Caused by this change, theirs to bring in line:
- `publication`: K651 re-export identity test fails; `index.mjs`/`checks.mjs` do not re-export the new names `CASE_DOCUMENT_FORMAT_V7`, `WORDS`, `caseWordsOf`, `lensClosingSentencesOf`.
- `public-read`: 3 R3 tests fail (they build a document in the format in force and expect `/7` words/closing sentences); R3's `closing` must read through `lensClosingSentencesOf(fm)` (T51-75).
- `case-catalogue`: R1/R4 "a /7 document is read as /6" test fails (uses the format in force as `/7`).
- `case-authoring`: 5 tests fail (document expected `bio-case-document/7`; `op=publish` now authors `/8`; its attribution and lens spelling should pass the document's format).
- `case-checker`: R13/R25 fail, `program.mjs` stale (generated; BOB regenerates at L8's close).
- The plane bundle is stale likewise.
Not caused by this change: `case-import` R14 R4 R19 R21 (word list) fails identically on `tranche/T51`. Passing: case-carriage, case-tensions, docket, ratification, case-disclosures, case-account, case-inputs, review.

Size (session_013LcngzaheG8aWTghSuVsPg): test runs 14, module lines 2936

## J1 · COMPLETE

R33 met: format /8 (team words), /7 and earlier byte-identical (new pinned /7 golden). Module 164/164, format/architecture/coverage/ownership 0 failures. Other modules need follow-up (publication re-exports, public-read R3 closing via lensClosingSentencesOf, case-catalogue, case-authoring tests/format; case-checker program.mjs and plane bundle stale): details in my record.

## J2 · QUESTION

T51-227, the module's whole findings set (265 on `main`'s check, 272 now with the chained-literal rule). Nearly all of it is pinned text, so I need one ruling before I touch it.

What the findings are: (a) `complete.mjs`, `edition.mjs`, `standing.mjs`, `tensions.mjs`, `blocks.mjs`, `account.mjs`, `outcomes.mjs`, `index.mjs`, `words.mjs` (about 190): the sentences the case document renders and signs, frozen per format (R33: `/8` team words, `/7` and earlier byte-identical, a pinned golden). (b) `casefile.mjs` (about 45): the case-file manifest checker's reasons, which the standalone checker bundles and prints offline. (c) about 70 test copies of (a)/(b).

My best reading, same as B3 on strength: (a) is signed, versioned text (K1333, B1's exception to K3366 for byte-pinned text). A `localize` id would let a row edit change a signed edition without a new format, and the offline checker has no table. So I leave (a) as code, unkeyed, and list it in a REPORT for the design's `unkeyed` list. For (b) the same applies if the checker prints them offline in the bundled program; I read them as checker output pinned by `program.mjs`'s SHA-256, so also unkeyed. Tests: I replace each test's sentence literal with the module's own exports (`WORDS.team`/`WORDS.group`, section constants) or the pinned golden's SHA, so no test copies a sentence and the byte-pinning stays. Nothing in the module is converted to `localize`.

Alternative: key (b) with `localize` (en identical) if you want the checker's reasons in the table. Tell me if so. I carry on with the tests on my best reading.

## J3 · COMPLETE

T51-227 done on B3's ruling; details in my record (Completion T51-227, R8). casefile.mjs reasons: 45 localize ids case-grammar.casefile.* (list in the record; the program must carry them; case-grammar reaches it via case-checker -> casefile.mjs). Pinned case-document sentences stay code, REPORT in the record for the unkeyed list. Tests copy no sentence (words: testcopy 0); module 164/164. Needs BOB: modules.json case-grammar uses lacks setup-words (architecture 1 failure); program.mjs, plane bundle and rows.mjs stale.
