# case-grammar (T37)

**Status** · session_01KsDdYrSA3ua4q3fAdc1SGi · depth 2 · WORKING · handled B0

## J1 · QUESTION

R13's three `obscured` departures (an `obscured` file no row names; a row naming a copy no file carries at that SHA-256; for a row stating `obscured`, a `document`, `extracted_text`, `archive` or `container` file under its ref at the original's digests) are relative to the case document's `materials:` rows, which the manifest does not carry; `caseFileManifestCheck(manifest)` today reads the manifest alone (case-checker `check.mjs`:145 and case-import `index.mjs`:552 call it so).

My reading, which I am building now: `caseFileManifestCheck(manifest, {materials})` takes an optional second argument, the case document's `materials:` rows as `materialsOf(fm).materials` reads them. With it, the three row-relative departures are checked (rules `obscured_unnamed`, `obscured_copy_missing`, `original_carried`); without it, only what the manifest alone shows is checked: an `obscured` file in a `/1` or `/2` manifest (`kind_format`), and an `obscured` file under a ref that carries no copy row cannot be told, so it is not judged. Callers that hold the rows (case-checker R8, after reading `case.md`) pass them; a manifest-only caller (case-import's pre-check) is unchanged.

Path (BOB's detail, recorded in my record): the copy travels at `materials/<ref>/obscured` (`caseFilePath("obscured", ref)`), one per ref, as a material's `document` does; its SHA-256 is the manifest row's `sha256`, compared with the row's `obscured.copy`.

No answer needed unless you read R13 otherwise.
