# case-import (T28)

**Status** · session_01Mr16UuJqdWD9MAumx7iRos · depth 2 · COMPLETE · handled B8

## J1 · QUESTION

Paths for case-import (B1): `paths` = ["bio-plane/src/case-import/"], `tests` = ["bio-plane/test/m/case-import/"], as the requirements Status names them. Files I expect: `bio-plane/src/case-import/index.mjs` (the module: acts, reads, the accepted-work registration), `tables.mjs` (schema and purge declaration), `checks.mjs` (its catalogue family, R14). My best reading: these, and I carry on writing there; answer only if you want them otherwise.

## J2 · QUESTION

Reading a case file's parts (R1, R5). R1 hands me `parts` as bytes (public-read R6: a stored ZIP per part, the manifest at each part's root). To check the manifest with `case-grammar.caseFileManifestCheck` and to store every file by SHA-256, case-import must open the parts. Neither `caseFileManifestCheck` (CASE-GRAMMAR #5, not merged) nor `checkCaseFile` (CASE-CHECKER #1, just started) exists on the tranche yet, and my Uses name no ZIP reader.

My best reading, which I am building on now:
1. case-checker opens the parts for its own R2 anyway, so it exports that reader beside `checkCaseFile`, e.g. `readCaseFile(parts) -> {manifest, files: [{path, kind, sha, bytes}], departures}`, pure and never throwing, and case-import calls it (one reading of the format, as R13 says). Until it lands, I keep a stand-in in my own `bio-plane/src/case-import/parts.mjs` (stored ZIP only, about 60 lines) and delete it once case-checker's is merged, before my merge.
2. The manifest's path inside a part, and its field names (group slug, case, edition, case document sha, keys, parts, files), are case-grammar R13's as CASE-GRAMMAR #5 writes them. I read them only through `caseFileManifestCheck` and the manifest object, so a name change there is a small change here.
3. The lens is the case document's `bias_manifest.statements_sha` (null when no lens was in force), read from the `case_document` file's front matter.

Please confirm 1 (or name where the reader lives), and tell CASE-CHECKER #1 if it should export it. Answer only if you want it otherwise.

## J3 · REPORT

case-import R1–R16 built on job/T28/case-import (merged tranche/T28 through B4, K1318). 49 tests pass, 0 fail, naming all 16 ids. format and architecture pass with 0 failures, and so do coverage and ownership with my paths filled in temporarily (not committed). **Waiting for two merges**, then I finish:
1. case-checker: import `checkCaseFile` and `readCaseFile` (its R19) as the defaults, delete my stand-in `src/case-import/parts.mjs`, and add an integration test with the real checker.
2. case-grammar: `caseFileManifestCheck` is already read through a namespace import. The fixture then builds case files with `caseFilePath` and `casePartDigest`, and I re-run against the real check.

Please ring me when both are on tranche/T28.

**Decisions I made (P17, wording level; for rulings.md if you want them):**
- **Bytes (R13).** Parts and completion documents are held in this module's own table `case_import_blobs`, chunked at 1 MiB, not in an object store. R13 needs the bytes purged with the import; record-core's purge cannot reach an object store, and a DO SQL value is bounded. Files are indexed by SHA-256 and read back from their part through the one reader, so nothing is stored twice. **For plane's L11 job:** case-import needs no object store (plane R17's "the object store for its case-file bytes" can be dropped).
- **Readers.** A viewer never sent is the plane reading for itself (membership's convention) and is answered. Any viewer that is sent must be an active member (the founder and administrators count), else null or absent (R4, R16). So strength's `acceptedFinding(…, viewer: null)` reads. **reevaluation** passes `class:admin` as its viewer in `acceptanceWithdrawn`'s detail read. That viewer is not a member, so it reads null there and the detail shows none. Its dependents and telling are unaffected (REPORT for REEVALUATION, not a defect here).
- **Manifest SHA-256** (R1's `IMPORT_EDITION_DIFFERS`, R16's `manifest_sha`) is the SHA-256 of the manifest's canonical JSON, independent of how a part serialises it.
- **Lens** is the case document's `bias_manifest.statements_sha` (null when none was in force), as J2 said.
- **Refusals.** `importedCase` answers an unknown import, an unknown edition and a non-member alike with `IMPORT_NO_SUCH_EDITION`, carrying only the arguments. `completeImportedDocument` on an edition not held answers `IMPORT_DOCUMENT_NOT_MISSING` (R5 literally).
- **Gaps (R6)** are `{<finding>: [words for missing[0], words for missing[1], …]}`, one statement per missing entry, in order. `IMPORT_ACCEPT_GAPS_UNSTATED` names each `{finding, entry, missing}`.
- **Withdrawal (R7)** withdraws every acceptance of that edition in force, in one record. Its `refs` are every finding they named.
- **Ids:** `IMA-<n>` (acceptance), `IMW-<n>` (withdrawal, also R16's cursor), `IMF-<n>` (flag).
- **Ops for L11:** `caseimport` takes `body.parts`, a list of base64. `caseimportdocument` takes `body.bytes` in base64. `by` and `viewer` come from the query stamps only.

**Rows (R14):** a new family, **C-130.1–C-130.14**, all `awaiting stamp` (T29, S5). The translations are my plain drafts for you to redraft.

**Found elsewhere:** none beyond the reevaluation note above.

## J4 · REPORT

B6 applied: tranche/T28 @ 9ce0fedbcd merged. case-import 49/0, accepted-work 19/0 and case-grammar 60/0 on the real code. Since J3 I build on case-grammar's exports (B5): the real `caseFileManifestCheck`, case files at `caseFilePath` paths with `casePartDigest`, and `standingOf` for R4's own bar. My stand-in manifest check is gone. Import and completion are now async: case-checker's `checkCaseFile` answers a promise (WebCrypto), so `caseimport` and `caseimportdocument` answer promises for L11. **I cannot post COMPLETE yet**: case-checker is not on tranche/T28 (no `src/case-checker/`, empty paths). B3 said to delete my stand-in reader `parts.mjs` before my merge and to use case-checker's `readCaseFile` and `checkCaseFile`. That swap is two import lines and a deleted file, plus one test against the real checker, about 15 minutes once it lands. Please ring me when case-checker is merged, or answer if you want COMPLETE now with the swap deferred.

## J5 · COMPLETE

**Entries applied:** L8 (N520, N522): R1–R16, every id, on `job/T28/case-import`, merged with tranche/T28 through B8 (@ caf6b7b2ca, K1326).

- **Files:** `bio-plane/src/case-import/index.mjs` (the module, its ops map `caseImportOps`, the factory `caseImportOf`), `schema.mjs` (12 tables, all append-only) and `checks.mjs` (the rows).
- **Tests:** `bio-plane/test/m/case-import/` (fixture plus six test files). Please write the paths into `modules.json` at the merge (B2).
- **R1, R3.** `importCaseFile` reads the parts with `case-checker.readCaseFile` (its R19). It checks the manifest with `case-grammar.caseFileManifestCheck` and recreates with `case-checker.checkCaseFile`, the module's own defaults. The stand-in reader `parts.mjs` is deleted (B3).
  - The import id is SHA-256 of canonical `{group, case, lens}`, where `lens` is the case document's `bias_manifest.statements_sha`.
  - A re-import with the same bytes answers `existed: true`. Different bytes are refused `IMPORT_EDITION_DIFFERS`, naming both manifest SHA-256s (each over the manifest's canonical JSON).
  - Every finding's result, missing, differs, recomputed pair and the checker's versions are recorded per run. Only completion (R5) runs the check again.
- **R4.** `importedCases` and `importedCase` (latest edition by default) answer:
  - the source's bar, labelled as the source's;
  - each finding against this group's default bar, through `case-grammar.standingOf`;
  - the origin facts: another group's, with the edition and whether the signature verified; the acceptance in force; the open flags;
  - the checker's statement.
  A non-member, an unknown import and an unknown edition all answer the same bytes.
- **R5.** A completion stores the document, re-runs the check over the parts plus every document stored, and appends a new run.
- **R6–R8.** Acceptance, withdrawal (calls `reevaluation.acceptanceWithdrawn` after commit and carries its answer, or names the failure), flags and clears. Each is reasoned and append-only.
- **R9.** `acceptanceOf` and `openFlagsOn`.
- **R16.** `start()` registers `finding`, `openFlags` and `withdrawals` with accepted-work. All are synchronous.

**Decisions (P17, as J3):**
- Bytes are kept in this module's own chunked table, so the purge reaches them (R13), and plane needs no object store for it.
- A viewer never sent is the plane reading for itself. Any viewer sent must be an active member.
- Gaps are `{finding: [words per missing entry, in order]}`.
- A withdrawal withdraws every acceptance of the edition then in force.
- Ids are `IMA-`, `IMW-` and `IMF-<n>`.
- **For L11:** `caseimport` and `caseimportdocument` answer promises, because the checker verifies signatures with WebCrypto. `caseimport` takes `body.parts` (base64 list); `caseimportdocument` takes `body.bytes` (base64). `by` and `viewer` come from the stamps only.

**Catalogue rows added, all `awaiting stamp` (T29, S5):** a new family, C-130.1–C-130.14:
- `MACHINE_CANNOT_IMPORT`, `IMPORT_NOT_A_MEMBER`, `IMPORT_NOT_A_CASE_FILE`, `IMPORT_PART_TOO_LARGE`, `IMPORT_EDITION_DIFFERS`;
- `IMPORT_DOCUMENT_NOT_MISSING`, `IMPORT_NO_SUCH_EDITION`, `IMPORT_ACCEPT_NO_REASON`, `IMPORT_NO_SUCH_FINDING`;
- `IMPORT_ACCEPT_NOT_RECREATED`, `IMPORT_ACCEPT_GAPS_UNSTATED`, `IMPORT_NOTHING_ACCEPTED`, `IMPORT_FLAG_NO_ISSUE`, `IMPORT_FLAG_NOT_OPEN`.

The translations are my plain drafts, for you to redraft (R14). control-plane's `CHECK_FAMILIES` gains the family at L11 (red 6).

**Deferred:** none.

**Found in other modules:** reevaluation's `acceptanceWithdrawn` reads `acceptedFinding` with viewer `class:admin` for its detail. That viewer is not a member, so the detail reads none; its dependents and the telling itself are unaffected. For REEVALUATION to judge.

**Generated artifacts:** none staled.

**Tests and checks** (after merging tranche/T28 @ caf6b7b2ca):
- case-import 52 pass, 0 fail, three of them over the real case-checker (a clean file in 1 and 3 parts; a document left out, then completed and accepted; a tampered file refused for acceptance).
- Neighbours' suites: accepted-work 19/0, case-checker 26/0, case-grammar 60/0, reevaluation 111/0.
- `format`: 0 failures. `architecture case-import`: 0 failures. `coverage case-import`: 16 of 16, 0 failures. `ownership case-import tranche/T28`: 0 failures for my files. The last three ran with my paths written into `modules.json` temporarily, not committed; ownership's one failure was that temporary edit.
- No layer tests are named in the manifest.
- Stale-note re-scan: none left (the stand-in's notes went with it).
- Module measures 1,154 lines (P6).

Size (session_01Mr16UuJqdWD9MAumx7iRos): test runs 32, module lines 1154
