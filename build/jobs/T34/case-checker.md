# case-checker (T34)

**Status** · session_01PgBv4ynvv6WAdADreVJk7v · depth 2 · WORKING · handled B1

## J1 · QUESTION

Readings, carrying on with them (no answer needed unless one is wrong), and one act that is BOB's:

1. **`modules.json` (BOB's).** case-checker's `uses` lacks `case-catalogue`; once `check.mjs`:25 imports `../case-catalogue/checks.mjs` (K1824), `checks/architecture.mjs` will fail. Please add `case-catalogue` to case-checker's `uses`. `ratification` then has no importer in case-checker (its only import was `ratification/checks.mjs`); I read dropping it as yours too, and leave it unless you say.
2. **R9, calculation inputs.** A supplied document fills a calculation input when its SHA-256 is the row's stated input hash and the input is absent from the case file (listed `missing`, or not listed at all) or carried with other bytes. The carried-differing file keeps its own integrity state (`differs` in `integrity.files`; the case file itself is still damaged); only the calculation is recomputed with the supplied bytes. A filling document is listed in `integrity.documents.used`; a calculation answer that used one names it as `supplied: [{input, sha256}]` (added only when non-empty). A document matching an input hash whose calculation's method version is not held still counts as used (it fills the input; the calculation stays `not_recomputed` for the version). Bytes matching an input that is carried intact are unmatched, as for files today.
3. **case-import (REPORT, not mine to change).** Its completion gate (`index.mjs` ~:795) adds a calc input's hash to the missing set only when `!m.carried`, so bytes for an input *carried with other bytes* are refused `IMPORT_DOCUMENT_NOT_MISSING`, while case-checker R9 (as amended) fills that case. With the same bytes, the checker would read `agrees` and the import could not be completed; against case-import R5/R21's own wording it may be within its R5 ("records as missing"), so I flag it for your reading.

## J2 · REPORT

**case-import's test pins the old N599 behaviour, and my change turns it red, as N599 intends.** With R9 as amended (pushed on `job/T34/case-checker`, f-commit after `8b988b531d`), `bio-plane/test/m/case-import/real.test.mjs`:110 ("R21 R3 R5 under the real case-checker…") now gets `{result: "agrees", agrees_with_this_copy: true}` after the completion, where it asserts `{result: "not_recomputed", agrees_with_this_copy: false}`; its comment at :107–108 states the old checker behaviour. That is the N599 agreement arriving: case-import 83/84 against my branch, this one test red. It is case-import's to flip (expected value and comment), by CASE-IMPORT #5 if it merges after me, or as a named red from my merge until it does. Nothing else in case-import changes.
Status: R9 and the T34-87 row done; case-checker 35/35; format, architecture, coverage (20/20), ownership 0 failures. R7's re-point waits on case-catalogue's and ratification's merges (and `modules.json`, J1 (1)).
