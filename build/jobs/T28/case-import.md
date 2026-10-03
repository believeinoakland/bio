# case-import (T28)

**Status** · session_01Mr16UuJqdWD9MAumx7iRos · depth 2 · WORKING · handled B4

## J1 · QUESTION

Paths for case-import (B1): `paths` = ["bio-plane/src/case-import/"], `tests` = ["bio-plane/test/m/case-import/"], as the requirements Status names them. Files I expect: `bio-plane/src/case-import/index.mjs` (the module: acts, reads, the accepted-work registration), `tables.mjs` (schema and purge declaration), `checks.mjs` (its catalogue family, R14). My best reading: these, and I carry on writing there; answer only if you want them otherwise.

## J2 · QUESTION

Reading a case file's parts (R1, R5). R1 hands me `parts` as bytes (public-read R6: a stored ZIP per part, the manifest at each part's root). To check the manifest with `case-grammar.caseFileManifestCheck` and to store every file by SHA-256, case-import must open the parts. Neither `caseFileManifestCheck` (CASE-GRAMMAR #5, not merged) nor `checkCaseFile` (CASE-CHECKER #1, just started) exists on the tranche yet, and my Uses name no ZIP reader.

My best reading, which I am building on now:
1. case-checker opens the parts for its own R2 anyway, so it exports that reader beside `checkCaseFile`, e.g. `readCaseFile(parts) -> {manifest, files: [{path, kind, sha, bytes}], departures}`, pure and never throwing, and case-import calls it (one reading of the format, as R13 says). Until it lands, I keep a stand-in in my own `bio-plane/src/case-import/parts.mjs` (stored ZIP only, about 60 lines) and delete it once case-checker's is merged, before my merge.
2. The manifest's path inside a part, and its field names (group slug, case, edition, case document sha, keys, parts, files), are case-grammar R13's as CASE-GRAMMAR #5 writes them. I read them only through `caseFileManifestCheck` and the manifest object, so a name change there is a small change here.
3. The lens is the case document's `bias_manifest.statements_sha` (null when no lens was in force), read from the `case_document` file's front matter.

Please confirm 1 (or name where the reader lives), and tell CASE-CHECKER #1 if it should export it. Answer only if you want it otherwise.
