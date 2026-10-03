# case-import (T28)

**Status** · session_01Mr16UuJqdWD9MAumx7iRos · depth 2 · WAITING ON BOB (J3) · handled B5

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
