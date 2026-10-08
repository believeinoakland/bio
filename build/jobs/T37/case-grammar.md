# case-grammar (T37)

**Status** · session_01KsDdYrSA3ua4q3fAdc1SGi · depth 2 · COMPLETE · handled B2

## Reading set (mechanics §17, N739)

Measured with my tests: about 31 KB requirements + 153 KB code + 187 KB tests (+ the used services), over 300 KB, so read as B1's (3) says. **Read whole myself:** `build/requirements/case-grammar.md`; layer 8's row of `build/layers.md`; the plan's rules 5 and 6 and entry T37-40; DEC-180; K2108, K2129, K2144, K2171, K2206 (their lines); `image-cover.md`'s Purpose and R2; the code my entry changes, `formats.mjs`, `materials.mjs`, `casefile.mjs`, `complete.mjs` (the renderer), and `index.mjs`'s export lines; the tests it changes, `casefile.test.mjs`, the R14 part of `complete.test.mjs` and `casefile-fixture.mjs`; the used services my Uses names (record-grammar R6–R11 `parseFrontmatter`, R46–R47 `idPattern`; strength R31 `gradingMethodText`; calc-grammar R15 `resultKey`), none of whose use changed. **A worker read whole** the other ten source files and twelve test files and wrote a 6 KB summary, every statement citing file:line (what each provides or tests; which pin a format string, kinds, golden bytes or the `materials` shape). Nothing it left out mattered: it flagged the fixture's `/1` manifest, the R3 `attestations` locator (my new fields stay inside the `materials:` run), and R7's place-name scan over every export (my words name no place).

## Entries applied (T37-40; N757, DEC-180 (4), K2206, K2222)

- **R12** (`materials.mjs`): a `document` row handed `obscured: {copy, label}` is written with `obscured_copy`, `obscured_label` after `rests_under`, `included: false` whatever it is handed, the original's `sha`, `text_sha`, `origin`, `archived_copy` kept; `MATERIAL_OBSCURED_FIELDS` exported. A copy that is not 64 hex or a blank label is written null; `materialsOf` reads `obscured: {copy, label}` when either field is present (even null: a copy written null reads as a copy not carried, never as a row carried whole), `obscured: null` otherwise and for every non-`document` row. A row without it writes the same eight lines as before T37. The case document stays `/7` (read for `/6` too, as every R12 field is).
- **R13** (`casefile.mjs`): `CASE_FILE_FORMAT` `bio-case-file/3`; `CASE_FILE_FORMAT_V2` exported; accepted `[/3, /2, /1]`; kind `obscured` (`CASE_FILE_V3_KINDS`), at `materials/<ref>/obscured` (K2222); a later kind in an earlier manifest is `kind_format`, naming the format the kind belongs to. `caseFileManifestCheck(manifest, {materials})` (K2222): with the case document's rows, `obscured_unnamed`, `obscured_copy_missing`, `original_carried` (any `document`, `extracted_text`, `archive` or `container` file under the ref of a row stating `obscured`: under that ref only the original's files could sit, so I judged every one, not only those I could match to the row's digests); without rows those three are not judged. `CASE_FILE_ORIGINAL_KINDS` exported.
- **R14** (`complete.mjs`): a row stating `obscured` lists "Fingerprint of the original (SHA-256) …", the extracted text fingerprint, origin, archived copy, the copy's fingerprint, then the label word for word, in place of the included line (`OBSCURED_WORDS`, the UX stream's until it gives words). Every other row is rendered as before: `/7` editions rendered before the change are pinned in `complete-v7-pre-t37-golden.json` (with and without the T33 blocks, made from this module's fixture before any change) and re-render byte for byte; the `/6` golden still passes.
- **Tests** (`obscured.test.mjs`, K874): R12 round-trip and its negative controls; R13 a `/3` case file passing, one negative control per departure (`obscured_unnamed`, `obscured_copy_missing`, `original_carried` for each of the four kinds), `obscured` in `/2` and `/1` manifests, a `/2` file read as written; R14 the copy and label, and the byte-identical negative control. `casefile.test.mjs` updated to R12's `obscured: null` and R13's `/3`; the `/2` tests now run on `/2` explicitly (and `/3`). Fixture: `photo` and `fileFormat` options.
- Nothing deferred.

## Found in other modules (REPORT J3)

My merge turns these red, each from R12/R13's new text, none a flaw of mine; each owner's T37 job has the entry that clears it (all were green before my change, measured on this branch):
- `case-checker` (T37-20): `program.test.mjs`:19 R13 (`program.mjs` stale, red 18, accepted; never rebuilt by hand); `spec.test.mjs`:13 and :25 (two arms) pin `/2` as the current format and no kind beyond it (its R14 `/3`); `standards-offline.test.mjs`:57 expects the case file `public-read` writes to state `CASE_FILE_FORMAT`, now `/3`, while public-read still writes `/2` (clears at T37-42, then the checker's spec). The checker should pass `{materials}` to `caseFileManifestCheck` (its R8).
- `case-disclosures` (T37-41) `carries.test.mjs`:56 and `case-authoring` `carries.test.mjs`:40: deep-equal `materialsOf` rows without R12's `obscured: null`.
- `public-read` (T37-42): writes `bio-case-file/2`; its R23 moves it to `/3`.
- Generated artifact stale: `bio-plane/src/case-checker/program.mjs` (bundles this module).

## Tests and checks

- `node --test test/m/case-grammar/` (from `bio-plane/`): tests 97, pass 97, fail 0. No layer tests named for layer 8.
- Users (services changed): case-carriage 29/0, case-tensions 23/0, publication 121/0, docket 59/0, public-read 146/0, case-catalogue 16/0, ratification 213/0, case-import 88/0; case-checker 47/5, case-disclosures 58/1, case-authoring 157/1 (above; before my change 52/0, 59/0, 158/0).
- `format`: 136 modules, 135 requirements files; 0 failures. `architecture`: 33 product files, 102 relative imports; 0 failures. `coverage`: 22 of 22 live requirement ids named by a test; 0 failures. `ownership … tranche/T37`: 9 files changed by case-grammar; 0 failures.

Size (session_01KsDdYrSA3ua4q3fAdc1SGi): test runs 22, module lines 2319

## J1 · QUESTION

R13's three `obscured` departures (an `obscured` file no row names; a row naming a copy no file carries at that SHA-256; for a row stating `obscured`, a `document`, `extracted_text`, `archive` or `container` file under its ref at the original's digests) are relative to the case document's `materials:` rows, which the manifest does not carry; `caseFileManifestCheck(manifest)` today reads the manifest alone (case-checker `check.mjs`:145 and case-import `index.mjs`:552 call it so).

My reading, which I am building now: `caseFileManifestCheck(manifest, {materials})` takes an optional second argument, the case document's `materials:` rows as `materialsOf(fm).materials` reads them. With it, the three row-relative departures are checked (rules `obscured_unnamed`, `obscured_copy_missing`, `original_carried`); without it, only what the manifest alone shows is checked: an `obscured` file in a `/1` or `/2` manifest (`kind_format`), and an `obscured` file under a ref that carries no copy row cannot be told, so it is not judged. Callers that hold the rows (case-checker R8, after reading `case.md`) pass them; a manifest-only caller (case-import's pre-check) is unchanged.

Path (BOB's detail, recorded in my record): the copy travels at `materials/<ref>/obscured` (`caseFilePath("obscured", ref)`), one per ref, as a material's `document` does; its SHA-256 is the manifest row's `sha256`, compared with the row's `obscured.copy`.

No answer needed unless you read R13 otherwise.

## J2 · REPORT

Reds my merge opens in other modules, each from R12/R13's new text (all green before my change on this branch); each owner's T37 entry clears it:
1. case-checker (T37-20): `program.test.mjs`:19 R13 (`program.mjs` stale; red 18, accepted; not rebuilt). `spec.test.mjs`:13 and :25 (two arms) pin `/2` as current with no later kind (its R14 `/3`). `standards-offline.test.mjs`:57 expects public-read's case file to state `CASE_FILE_FORMAT` (`/3`); public-read still writes `/2` until T37-42. Its R8 should pass `{materials}` (the case document's rows) to `caseFileManifestCheck`, which then judges the three `obscured` departures (K2222).
2. case-disclosures (T37-41) `carries.test.mjs`:56 and case-authoring `carries.test.mjs`:40: deep-equal `materialsOf` rows without R12's `obscured: null`.
3. public-read (T37-42) writes `bio-case-file/2`; the case file it writes should take `CASE_FILE_FORMAT` (`/3`), the copy at `caseFilePath("obscured", ref)`.
Interface for my users: `MATERIAL_OBSCURED_FIELDS`, `CASE_FILE_FORMAT_V2`, `CASE_FILE_V3_KINDS`, `CASE_FILE_ORIGINAL_KINDS`, `OBSCURED_WORDS`; `materialsLines` takes `obscured: {copy, label}` on a document row; `caseFileManifestCheck(manifest, {materials})`.
