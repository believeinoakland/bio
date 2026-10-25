# case-grammar (T51)

**Status** · session_01HFdVc2sq2GVhUrdUT8EUik · depth 2 · WORKING · handled B6

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

## J6 · REPORT

Two more pinned assertions in `test/m/case-grammar/casefile.test.mjs` change with G50, besides the one you named (:243, now the four-format list):
1. :310, the "departs at `format`" case used `bio-case-file/4` as the unknown format. `/4` is accepted now, so it becomes `bio-case-file/5` (still `format:format`). Note for case-checker: a test that uses `/4` as its unknown format needs the same change (`check.test.mjs:54` pins unknown formats).
2. :279, the null list for `caseFilePath` had `["obscured", [R, sha("c")]]`. That key is now the discriminated spelling `materials/<ref>/<sha>/obscured`, so it is no longer null. I changed it to `["obscured", [R, "c"]]` (a short sha, still null). The discriminated spelling's own cases are in `g50-path.test.mjs`.
No other pinned test changes so far. The R-OLD goldens are committed first (5bfb623f94): g1 departs `original_carried` twice (its document and its extracted text), g2 has no departure.

## Completion (G50, fix round 6; CASE-GRAMMAR #21, B6)

**Entries applied.** G50, case-grammar's share (105), all of START's note 2:
- `casefile.mjs`: `CASE_FILE_FORMAT_V4 = "bio-case-file/4"`; `CASE_FILE_FORMATS_ACCEPTED` is `[V4, V3, V2, V1]`; `CASE_FILE_FORMAT` stays `bio-case-file/3` (the format written when no path states a capture). `KINDS_LACKED[V4] = []`. `caseFilePath(kind, [ref, sha])` for `document`, `extracted_text`, `observation`, `obscured`: `materials/<ref>/<sha>/<leaf>`, the sha lower-cased, null for a bad ref or a sha that is not 64 hex after lower-casing; a ref alone is spelled as before. `caseFileEntryOf` answers `{kind, ref, capture}` for such a path (a 4-segment `materials/<ref>/<seg>/<leaf>`: `archives`/`containers` is a chain, 64 lower-case hex with a material leaf is a capture, anything else null); a plain path answers no `capture` key. New: `caseFileFormatFor(paths)`, `refsOnSeveralRows(rows)` (a `Set`), `materialFileKey(row, several, format)` (`[ref, lower(sha)]` under `/4` for a ref in `several`, else `ref`). All exported through `index.mjs`.
- `caseFileManifestCheck`: five new departures (`path_format`, `format_unused`, and under `/4` with the rows `capture_missing`, `capture_needless`, `capture_unnamed`); the three copy rules by `(ref, capture)` where a path states a capture; every other format judged exactly as before.
- `complete.mjs`: the copy is read at `materialFileKey(x, several, cf.format)`, so a `/4` file renders each row's copy line from its own file.
- Words: the `format` departure names the accepted list (see ruling 1). Census ops: none declared, none changed (G50 changes none).

**Rulings of detail (BOB may overrule; none changes a requirement's meaning).**
1. **The reworded `format` sentence has a new id, `case-grammar.casefile.format-accepted`** (vars `{accepted, value}`), and the old call is gone. Why: `localize` reads the generated list first and `en` only when it holds no row, so rewording the existing id `case-grammar.casefile.format` would have kept showing the old English (and needed its old vars) until `rows.mjs` is regenerated, and `rows.mjs` is not mine to edit. A new id works at once; regeneration drops the old row. Owed to UX-DESIGN as a stand-in change: BOB's §5 line is the sentence "the format is one of {accepted}, each read as written, and this manifest states {value}" (`{accepted}` = "bio-case-file/4, bio-case-file/3, bio-case-file/2, bio-case-file/1").
2. `path_format` is judged against the effective format, as `kind_format` is: a manifest of an unaccepted format (say `/5`) departs at `format` and its capture paths are `path_format` too (read as `/3`).
3. On a ref with one row, a path under a capture that no row names answers both `capture_needless` and `capture_unnamed` (each is true); with no row of the ref at all, `capture_unnamed` only.
4. Under `/4`, a path that states no capture (`archive`, `container`, and a plain `document` or `extracted_text`) is `original_carried` only when the ref has rows and every row is a copy; a path under a capture is judged by its own row. A `/3`, `/2` or `/1` manifest keeps `copies.has(ref)` (g1 still departs, twice).
5. `obscured_copy_missing` under `/4` for a ref on several rows is judged per row, by its capture; a plain copy file for such a ref (itself `capture_missing`) carries no row's copy.
6. `materialFileKey` takes `several` as the `Set` `refsOnSeveralRows` answers, or `true`; a row whose `sha` is not a string gives `[ref, null]`, which `caseFilePath` spells as null (public-read's `unheld`). Unaccepted or absent `format` spells the plain ref.
7. Left as it was: `complete.mjs`'s join of `sources:` rows to a material by `r.capture === x.sha` (not a path or copy join; changing its case would alter byte-pinned renders of an upper-case row).

**R-FOUR.** (1) Cause: `caseFilePath` took one segment, the ref (`casefile.mjs:108-123` before), so two rows of one ref gave one path, and the copy rules and the edition's lookup (`complete.mjs:309`) were keyed by ref. (2) Missed: no test had two `materials:` rows of one ref carrying files (every fixture had one copy per ref; `path_twice` was only tested on a hand-duplicated entry). Gap fixed: `g50-path.test.mjs` (12 tests) builds `/3` and `/4` manifests from the document's real rows and the real `materialsOf`. (3) Failing-first: with `casefile.mjs`, `complete.mjs` and `index.mjs` put back to the base, 11 of the 12 fail (the 12th is the golden test, green at both ends by design); with the change, all 12 pass. (4) Platform check: N (pure module, no store or clock).

**Pinned tests I changed** (casefile.test.mjs): `:243` the accepted list (named in START); `:310` the "unknown format" case used `bio-case-file/4`, now `bio-case-file/5` (reported at once, J6); `:279` `["obscured", [R, sha("c")]]` was in the list that must answer null and is now a valid discriminated key, so it is `["obscured", [R, "c"]]` (reported at once, J6). No assertion of the `format` departure's words existed. The `/6`, `/7` and `/7-pre-T37` goldens and every other existing test pass unchanged.

**Goldens (R-OLD).** `make-g50-goldens.mjs` and `g50-old-goldens.json` were committed first (5bfb623f94), recorded by the base code at `124e62bfa8`: g1 `original_carried` ×2 with the rows (document and extracted text), `[]` without; g2 `[]` both ways. After the change the test rebuilds both files from the same facts and the manifest, both checks and the complete edition are equal to the recorded ones.

**Readers of case-file paths and of the version string.** The entry's list is complete; I found no other (grep over `bio-plane/src`, `site`, `docs`, `requirements`): case-grammar `casefile.mjs`, `complete.mjs`; public-read `casefile.mjs`, `index.mjs` (`withholdChains`, `publishedcase`, `#editionItems`); case-checker `check.mjs`, `spec.mjs`, `program.mjs` (generated); case-import `index.mjs`; publication `index.mjs`, `worker.mjs`. `docs/development/ux-substrate/screens/words-reads*.json` mention the path in prose only.

**Requirements (BOB's to write).** R13 is built as: the format written is `bio-case-file/4` for a case file with at least one path under a capture and `/3` otherwise; `/1`–`/4` are read as written, each by its own spelling; the five departures; the copy rules by (ref, capture). R14: the copy is read at its row's path under `/4`. New exports for Provides: `CASE_FILE_FORMAT_V4`, `caseFileFormatFor`, `refsOnSeveralRows`, `materialFileKey`, `caseFileEntryOf`'s `capture`.

**New ids for the checker program (B3 (b)).** `case-grammar.casefile.` + `format-accepted, path-format, format-unused, capture-missing, capture-needless, capture-unnamed`. Retired: `case-grammar.casefile.format` (no longer called; its row drops at regeneration). `rows.mjs` and `words-unreviewed.json` need regenerating for these six.

**Stale by this change (generated, never edited by me).** `bio-plane/src/case-checker/program.mjs` (it embeds `casefile.mjs`), `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs`, `setup-words/rows.mjs` and `words-unreviewed.json`. `build.mjs --check` is stale from before this job (first difference `calculations.index.a_reason_is_at_most`, another job's words); my six ids and the dropped one add to it.

**Deferred.** None. **Found in other modules.** Nothing new; as the entry says, nothing of public-read (B) is to be built into `dist/` or deployed before case-checker has merged.

**Tests and checks.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit` from `bio-plane`: case-grammar 185 of 185 (before this job 173; +12 in `g50-path.test.mjs`). Users run once each, all pass: public-read casefile, obscured, archives, photos, calculations (31); case-checker check, spec, account, standards-offline, words (69); case-import real (5); publication t33 (8). `checks/run.mjs`: format 0, architecture 0, coverage 6686 of 6686, words: one finding, the inherited `inline` at `case-checker/spec.mjs:11`, none in case-grammar. `checks/ownership.mjs` (case-grammar, vs `tranche/T51`): 0 failures.

Size (session_01AWTXz3dDga9C9mXYok9S8p): test runs 33, module lines 3126

## J7 · COMPLETE

G50 (105) done: `bio-case-file/4` with the capture in the path for a ref on several rows, the five departures, the copy rules by (ref, capture), the complete edition's copy read at its row's path. Details, rulings and the new ids are in my record (Completion G50, fix round 6).

- Failing-first: with the base code 11 of the 12 new tests in `g50-path.test.mjs` are red; the 12th is the R-OLD golden test, byte-equal before and after (g1 departs `original_carried` twice as at the base, g2 none).
- case-grammar 185 of 185. Users run and pass: public-read (casefile, obscured, archives, photos, calculations), case-checker (check, spec, account, standards-offline, words), case-import real, publication t33.
- `checks/run.mjs`: format 0, architecture 0, coverage complete; words shows only the inherited `inline` at `case-checker/spec.mjs:11`. ownership 0 failures.
- For your decision: the reworded `format` sentence has a NEW id, `case-grammar.casefile.format-accepted`. The list wins over the code's English for an existing id, so rewording `case-grammar.casefile.format` would have shown the old words until `rows.mjs` is regenerated. §5 line for UX-DESIGN: "the format is one of {accepted}, each read as written, and this manifest states {value}". Overrule and I will re-key it.
- New ids for the checker program: `case-grammar.casefile.` + format-accepted, path-format, format-unused, capture-missing, capture-needless, capture-unnamed. The old `.format` row drops at regeneration.
- Stale (generated, not touched): `case-checker/program.mjs`, `dist/`, `release/`, `setup-words` rows and `words-unreviewed.json`.
- Pinned tests changed: `casefile.test.mjs` :243 (named), :310 (`/4` was the unknown-format case, now `/5`) and :279 (an obscured `[ref, sha]` key is now valid, not null).
- Census ops: none changed.

Size (session_01AWTXz3dDga9C9mXYok9S8p): test runs 33, module lines 3126

## Completion (T51 fix round 10, B7, R34)

**What changed.** New `bio-plane/src/case-grammar/basisversion.mjs`, exported from `index.mjs:64`. R34's two flat optional fields on each member's `case_roles:` row, as R22's `subject_entity` is (no new format version): `basis_version` (the version's name, 1-64 characters, folded to one line by `fmSafe`) and `basis_version_identity` (the SHA-256 of its composition, 64 lowercase hex). `memberBasisVersionLines(version)` writes the two lines for `{name, identity}`; anything else (`null` for a project that stated none, a half pair, a bad identity, a name over 64) writes both `null`, so nothing is filled. `memberBasisVersionOf(fm, finding)` answers `{recorded, name, identity}`: `recorded: true` with name and identity; `recorded: true` with both null when the row states none; `recorded: false` (undetermined, R6, never filled) when the document predates R34, the row names no such member, or the pair is malformed or half stated. Pure; never throws.

**Tests (failing first).** `bio-plane/test/m/case-grammar/basisversion.test.mjs`, four tests naming R34. Run before the module existed: 4 fail (`memberBasisVersionOf is not a function`); after: 4 pass. They cover a round trip for formats `/8`, `/7`, `/6`, `/5`, a project stating none, a silent older document, the writer refusing half pairs and folding a name, and the reader's controls (malformed pairs, odd input, throwing getters, the front matter untouched).

**Suite and checks.** `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/case-grammar/`: 189 tests, 189 pass, 0 fail. `impact.mjs origin/tranche/T51 HEAD` before my commit: 0 affected (the new exports are used by no module yet). `checks/run.mjs`: format 0 failures; architecture 0; coverage for case-grammar 34 of 34 (R34 now named); `words.mjs`: no finding in `basisversion.mjs`, this job adds no sentence a person reads. `fixtures.mjs case-grammar --list`: 0, no `fixtures-own` or `fixtures-generic` marker added. `ownership.mjs`: 0 failures.

**Met ids.** R34 (BOB strikes the mark).

**For BOB.** (1) R34 names no field: BOB's wording edit should state `basis_version` and `basis_version_identity` on the `case_roles:` row, `memberBasisVersionLines` and `memberBasisVersionOf` in Provides, and that the identity is the SHA-256 of the version's composition (`basis-version-grammar` R5), which `case-authoring` R87 computes. (2) No reader rejects the new fields: `case-catalogue/checks.mjs` C-41 and `case-checker/check.mjs:355` read `case_roles:` rows by field and flag no unknown field; `case-checker` and `ratification` need no change to accept it. (3) `case-checker`'s standalone `program.mjs` is generated and unchanged by this job; it does not read the new fields.

Size (session_01HFdVc2sq2GVhUrdUT8EUik): test runs 6, module lines 3185
