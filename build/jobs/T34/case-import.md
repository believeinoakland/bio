# case-import (T34)

**Status** · session_01Gt9dFgm1CoVHKEB1yihSb6 · depth 2 · WORKING · handled B2

## Completion (CASE-IMPORT #5)

**Entries applied.** T34-87 (DEC-149's share; K1784, K1811), the six M rows of `plan/draft-T34-dec149.md`, each now saying "your group's Civicsmith":
- `checks.mjs` C-130.3 `IMPORT_NOT_A_CASE_FILE`: "What was given is not a case file your group's Civicsmith can read: …"
- `checks.mjs` C-130.5 `IMPORT_EDITION_DIFFERS`: "Your group's Civicsmith already holds this edition of the case, …"
- `checks.mjs` C-130.7 `IMPORT_NO_SUCH_EDITION`: "Your group's Civicsmith holds no imported edition by that name. Nothing was written."
- `index.mjs` R19's `NO_MOVE_SEEN`: "… it says only what your group's Civicsmith has seen in its reads, as of the last read."
- `index.mjs` R21's method-version reason: "your group's Civicsmith does not hold the method version … the value was computed by the publishing group's engine …" (the other group's "publishing copy" is named as its group too, the same voice).
- `index.mjs` R21's input-bound reason: "… more than your group's Civicsmith reads".
The two X rows (`index.mjs:457`, `:553`) are operator-facing and stay, as BOB's START says. C-130.15's "the publishing group's copy" / "their copy" (another group's Civicsmith, R14's verbatim text) is outside DEC-149's letter and stays.

**Tests.** New `voice.test.mjs`: R14 (the three rows' exact translations, as a member receives each, with negative controls; no row says "this/the copy, plane, instance"), R19 (`NO_MOVE_SEEN` exact, as read), R21 (both reasons exact, the input one byte over `CALC_INPUT_MAX` with the control at the bound). Improvement: `real.test.mjs`'s last test no longer pins case-checker's present answer after a completion (`not_recomputed`); it checks R21's own contract, that the checker's answer is recorded beside with `agrees_with_this_copy` true exactly when it is `agrees`, so case-checker's T34-47 (R9 fills a calculation's inputs) does not turn it red.

**Deferred.** None.

**Found in other modules / stale artifacts (REPORT J1).**
- promotion: `CATALOG_VERSION` (`gate.mjs`) and the row census are promotion's; C-130.3, C-130.5 and C-130.7 now read "changed with no record" in `bio-plane/test/system/row-census.test.mjs` (already red on `tranche/T34` from other modules' DEC-149 rewordings; these three join it) until T35's promotion stamp moves the version and re-pins (plan Rules (5) item 4, as K1802's C-28 rows).
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale from this change, for BOB's regeneration at L8's close.

**Tests and checks run.**
- `node --test bio-plane/test/m/case-import/`: tests 87, pass 87, fail 0.
- `node --test bio-plane/test/system/row-census.test.mjs`: fail 1 before and after this change (the accepted red above).
- `format`: 127 modules, 126 requirements files; 0 failures.
- `architecture case-import`: 11 product files, 56 relative imports; 0 failures.
- `coverage case-import`: 21 of 21 live requirement ids named by a test; 0 failures.
- `ownership case-import tranche/T34`: 5 files changed; 0 failures.

Size (session_01Gt9dFgm1CoVHKEB1yihSb6): test runs 4, module lines 1852

## J1 · REPORT

Two things outside case-import that T34-87 touches (detail in my record's Completion). (1) promotion: C-130.3, C-130.5, C-130.7's translations changed, so row-census.test.mjs names them 'changed with no record'; that test was already red on tranche/T34 from other modules' DEC-149 rewordings, and these three join it until T35's promotion stamp moves CATALOG_VERSION (gate.mjs) and re-pins (plan Rules (5) item 4, as K1802's C-28 rows). (2) bio-plane/dist/bio-plane.bundled.mjs is stale from this change, for your regeneration at L8's close. Also, for case-checker's T34-47: my real.test.mjs no longer pins its present not_recomputed answer after a completion, so its R9 change will not turn case-import red.

## J2 · COMPLETE

T34-87 applied: the six DEC-149 member-facing strings (C-130.3, C-130.5, C-130.7; R19's NO_MOVE_SEEN; R21's method-version and input-bound reasons) say "your group's Civicsmith"; the two operator-facing rows stay. voice.test.mjs names each changed string. case-import tests 87/0; format, architecture, coverage (21/21), ownership: 0 failures. Nothing deferred. Branch job/T34/case-import; record has the summary lines and Size.

## B2 · CHANGE (T34-94, K1828): R5's missing calculation input

**Applied.** `tranche/T34` merged. `index.mjs` `completeImportedDocument`: every calculation input R21 records as missing (named by its stated SHA-256) is a missing material, whether the case file lacks it or carries it with other bytes; the `!m.carried` exclusion is gone. Test `calculations.test.mjs` "R5 R21 an input carried with bytes that differ from its stated hash is missing…": the carried (tampered) bytes are refused `IMPORT_DOCUMENT_NOT_MISSING` writing nothing; bytes matching the stated hash complete it and the calculation recreates (1500.50); the same bytes again are no longer missing.

**Finding (for BOB).** At the interface this case already completed before the change: `case-checker.readCaseFile` (its R19) answers `content: null` for a file whose bytes differ from its row, so `carried` was always null and the old gate let it through. The `!m.carried` exclusion could only bite for a caller passing differing bytes as content to `recreateCalculations` directly. The change removes that dependence on the reader, so R5 holds as worded whatever the reader answers; the new test passes before and after (no red-to-green shown, honestly stated). R5's `*(not yet met: T34)*` marker is BOB's to clear.

**Tests and checks.** case-import tests 88/88, 0 fail; format 0 failures; architecture 0 failures; coverage 21 of 21; ownership 6 files, 0 failures.

Size (session_01Gt9dFgm1CoVHKEB1yihSb6): test runs 9, module lines 1853
