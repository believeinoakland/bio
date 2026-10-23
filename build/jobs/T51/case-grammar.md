# case-grammar (T51)

**Status** · session_01Fki6itUmQ4gkEDi9Uhphep · depth 2 · COMPLETE · handled B5

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

## J4 · COMPLETE

C47 done (fix round 4, B4): R12's `materials:` row gains `title`.

(1) Root cause: the signed row carried no title, so a reader could only name the entry by `origin`. Fixed at the source: `materials.mjs` adds `MATERIAL_TITLE_FIELD` ("title", exported by index.mjs). `materialsLines` writes `title` flat after `rests_under` (before the obscured fields) when the row is handed a `title`: a sentence, else null (the capture has none, an observation, or any non-string); a row handed no `title` is written byte for byte as before. `materialsOf` reads it back on every row: the sentence, or null when absent (an older case).
(2) Missed before: no test read a title from a chain. `title.test.mjs` (new, 4 tests, all name R12): round trip beside the obscured fields with quotes/line breaks folded; null for no title, an observation and non-strings, unhanded not written; control, a row without it parses, reads null and nothing else changes (hand-written front matter too, hostile getters never throw); `caseFileManifestCheck` given the rows accepts titled, null and absent. Red first: tests 1-3 failed on the missing field/constant before the change (`actual: undefined`, `actual: []`); test 4 is a control and passed before and after. Green after: 4/4.
(3) R12 amended as BOB wrote it (K4438): met, with R12's "not yet met" marker still BOB's to lift. Five existing tests of mine (casefile.test, obscured.test) deep-equal a read row; they now state `title: null`. Module: 168/168.
(4) Merge early: pushed now. case-disclosures and public-read build on this: `materialsOf(fm).materials[i].title`; the writer hands `title` on each row it passes `materialsLines` (case-authoring/case-disclosures: NOT mine).

Found in other modules (their tests deep-equal a read row, which now has `title: null`; case-disclosures' and case-authoring's jobs update them when they carry `title`):
- case-disclosures: R6/R7 materialsJudged test, and the R7 photo and member-document tests (3 tests).
- case-authoring: R55 materials test (1).
Generated, stale by this change (BOB regenerates at L8's close): `bio-plane/src/case-checker/program.mjs` (case-checker R13/R25 fail on it; they failed before for the same cause) and the plane bundle.
Users run: case-account, case-carriage, case-catalogue, case-import, case-inputs, case-tensions, docket, public-read, publication, ratification, review pass; case-checker as above. `impact.mjs origin/tranche/T51 HEAD`: 60 modules affected (transitively through the plane); direct users all run.

Checks (process repo): format 175/0 failures; architecture 0 failures; coverage case-grammar 33 of 33 ids named, 0 failures (the repo-wide coverage run shows 15 other modules' ids, none mine); ownership 6 files, 0 failures; words: 3 inline findings in op-grades (not mine), none in case-grammar; setup-words --check: stale rows note only.
No localize key added, so the checker program gains no word.

Size (session_01VBNM18B4vfkzoJAakCSzJF): test runs 22, module lines 2986

## Completion (G47, fix round 6; CASE-GRAMMAR #20, B5)

**Providers' state.** I am the first of G47's owners; none other had merged when I started. Seam tests of the others stay red by name until they merge (below).

**What changed.**
- `formats.mjs`: `CASE_DOCUMENT_FORMAT_V9 = "bio-case-document/9"`, first in `CASE_DOCUMENT_FORMATS_ACCEPTED` and in all five predicates (identical to `/8`); `attestationShaOf(row)` (non-empty sentence, else null; never throws) and `caseDocumentFormatFor(attestationRows)` (`/9` when any row has a sha, else `CASE_DOCUMENT_FORMAT` = `/8`). `CASE_DOCUMENT_FORMAT` stays `/8`. `/9` speaks the `team` words and prints "Civicsmith" (words.mjs, complete.mjs unchanged by construction).
- `materials.mjs`: `MATERIAL_ATTESTATION_SHA_FIELD`; `attestationRow` carries `sha` only when non-null; `materialAttestationLines` writes it after `recorded_in` only on such rows (a row without one is byte for byte as before; `MATERIAL_ATTESTATION_FIELDS` unchanged); `materialsOf` reads `sha` (null when absent).
- `complete.mjs` `attestOf`: joins by `sha` (case-insensitive) when the row has one, else by `ref`.
- `index.mjs`: exports `CASE_DOCUMENT_FORMAT_V9`, `caseDocumentFormatFor`, `MATERIAL_ATTESTATION_SHA_FIELD`.
- Tests: new `g47-attest.test.mjs` (5 tests); existing deepEqual tests gain `sha: null` (casefile.test), and tests that used `/9` as "unknown future format" now use `/10` (blocks, reference, formats), with `/9` added to the accepted/predicate lists.

**Failing first.** All 5 new tests red on the unchanged source (missing field/constant/helper; the page test red at `/8` entry 0: capture 0's entry shows capture 1's co-archive, i.e. every capture shows all lines); green after. Controls: no-sha rows byte for byte as before and read `sha: null`; a no-sha page joins by ref; mixed document; three sources render alike by sha or ref; a stray sha joins nothing.

**Measures.** Module 173/173 (`--import test/platform-sqlite.mjs`). Checks (process repo): format 0, architecture 0, coverage 33 of 33 ids, ownership 10 files 0 failures, `checks/run.mjs` all 0 (words: inline 0, testcopy 0, missingkey 0; I added no sentence). No protective bound set. No census op (module is pure): no accepted keys change. Rows owed to UX-DESIGN: none.

**Impact (60 modules, `impact.mjs origin/tranche/T51 HEAD`), compared to a clean `tranche/T51` worktree.**
Reds caused by my change, all in other modules' tests (I do not touch them):
- case-catalogue `checks.test.mjs` (2: R1,R3,R4 family; R1,R4 N538) at :54 and :306-310 and ratification `converted-c.test.mjs:269` (R8): they use `bio-case-document/9` as the unaccepted format for C-41.1; `/9` is accepted now. Use `/10`.
- public-read R23 (`co-attestation row ...`): the answered attestation rows gain `sha: null`; deepEqual needs the key (public-read's G47 job).
- case-authoring R55 x3 (case-disclosures R7; R4 R8 R9 R10; R11): deepEqual of read attestation rows gain `sha: null` (case-authoring/case-disclosures jobs).
Same reds as the clean tranche (not mine): case-checker R13, R25 (stale program); case-authoring R17; affordances 4; screens-publish 5; journey-check 7; screens-action 1; plane R24 1. screens-intake: one red in each run, different tests (mine R49 "existed: true", base R31 E8): looks order/clock dependent, not read.
All other affected modules green.

**Readers that gate on the format string.** Every reader gates through case-grammar's predicates or `CASE_DOCUMENT_FORMATS_ACCEPTED` (case-catalogue C-41.1, publication, public-read, ratification via case-catalogue): all accept `/9` with no change. None names a literal `/8`. NOT as the entry says: `case-checker/index.mjs:67-69` is `caseFileSpec(version)`, keyed by the case FILE format (`bio-case-file/N`), which `/9` does not change. An old pinned checker given a `/9` document answers C-41.1 error ("a case document declares format ... (got '/9')") from its bundled case-catalogue and skips the attestation checks: a loud failure, never a wrong pass, but not "no specification". BOB decides whether that is enough or the case-file format should move too. The checker's generated `program.mjs` is stale until BOB regenerates it.

**Readers of `material_attestations` (via `materialsOf(fm).attestations`) found.** The entry's list is complete: case-checker `check.mjs:338-340, 446-451, 685-686, 706-707`; public-read `index.mjs:1502-1512` (and `keyedMaterialsOf` :88, which passes the rows through whole, now with `sha`); case-tensions `index.mjs:672-696`; case-disclosures `document.mjs:122-130`; `complete.mjs`. No other.

**Proposed requirement lines (BOB writes).**
- R12, after the attestation row's field list: "A `material_attestations:` row may also state `sha`, the SHA-256 of the capture it attests, flat, after `recorded_in`; written only when handed a non-empty sentence, so a row without it, and every row signed before it, is written byte for byte as before; `materialsOf` reads it back as `sha`, null when absent. A reader joins an attestation to a material by `sha` when the row has one, else by `ref` (R14's page does)."
- R1: "`bio-case-document/9` is accepted and states what `/8` states plus R12's attestation `sha`; every predicate holds for it as for `/8`; its words and product name are `/8`'s. `caseDocumentFormatFor(attestationRows)` answers `/9` when any row carries a sha, else `CASE_DOCUMENT_FORMAT` (`/8`), which stays the format in force; the author writes the format through it."
- R14: "The materials section lists under a material the attestations joined to it by R12's rule."

Size (session_01Fki6itUmQ4gkEDi9Uhphep): test runs 14, module lines 3070

## J5 · COMPLETE

G47 provider done, pushed. See record 'Completion (G47, fix round 6)'. Optional attestation sha (materials.mjs), bio-case-document/9 + caseDocumentFormatFor (formats.mjs), page joins by sha else ref (complete.mjs). 5 new tests red-then-green; module 173/173; format/architecture/coverage/words/ownership clean. Caused reds in OTHER modules' tests (yours to place): case-catalogue checks.test.mjs:54,306 + ratification converted-c.test.mjs:269 use /9 as the unaccepted format (use /10); public-read R23 and case-authoring R55 x3 deepEqual attestation rows need sha:null. Entry correction: case-checker/index.mjs:67-69 is keyed by the case-FILE format, so an old checker on a /9 document answers a C-41.1 error (loud failure, not 'no specification'); your call whether the case-file format should move too. Proposed R1/R12/R14 lines are in the record. Other impact reds equal the clean tranche's.
