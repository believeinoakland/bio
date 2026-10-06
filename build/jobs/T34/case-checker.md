# case-checker (T34)

**Status** · session_01PgBv4ynvv6WAdADreVJk7v · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Readings, carrying on with them (no answer needed unless one is wrong), and one act that is BOB's:

1. **`modules.json` (BOB's).** case-checker's `uses` lacks `case-catalogue`; once `check.mjs`:25 imports `../case-catalogue/checks.mjs` (K1824), `checks/architecture.mjs` will fail. Please add `case-catalogue` to case-checker's `uses`. `ratification` then has no importer in case-checker (its only import was `ratification/checks.mjs`); I read dropping it as yours too, and leave it unless you say.
2. **R9, calculation inputs.** A supplied document fills a calculation input when its SHA-256 is the row's stated input hash and the input is absent from the case file (listed `missing`, or not listed at all) or carried with other bytes. The carried-differing file keeps its own integrity state (`differs` in `integrity.files`; the case file itself is still damaged); only the calculation is recomputed with the supplied bytes. A filling document is listed in `integrity.documents.used`; a calculation answer that used one names it as `supplied: [{input, sha256}]` (added only when non-empty). A document matching an input hash whose calculation's method version is not held still counts as used (it fills the input; the calculation stays `not_recomputed` for the version). Bytes matching an input that is carried intact are unmatched, as for files today.
3. **case-import (REPORT, not mine to change).** Its completion gate (`index.mjs` ~:795) adds a calc input's hash to the missing set only when `!m.carried`, so bytes for an input *carried with other bytes* are refused `IMPORT_DOCUMENT_NOT_MISSING`, while case-checker R9 (as amended) fills that case. With the same bytes, the checker would read `agrees` and the import could not be completed; against case-import R5/R21's own wording it may be within its R5 ("records as missing"), so I flag it for your reading.

## J2 · REPORT

**case-import's test pins the old N599 behaviour, and my change turns it red, as N599 intends.** With R9 as amended (pushed on `job/T34/case-checker`, f-commit after `8b988b531d`), `bio-plane/test/m/case-import/real.test.mjs`:110 ("R21 R3 R5 under the real case-checker…") now gets `{result: "agrees", agrees_with_this_copy: true}` after the completion, where it asserts `{result: "not_recomputed", agrees_with_this_copy: false}`; its comment at :107–108 states the old checker behaviour. That is the N599 agreement arriving: case-import 83/84 against my branch, this one test red. It is case-import's to flip (expected value and comment), by CASE-IMPORT #5 if it merges after me, or as a named red from my merge until it does. Nothing else in case-import changes.
Status: R9 and the T34-87 row done; case-checker 35/35; format, architecture, coverage (20/20), ownership 0 failures. R7's re-point waits on case-catalogue's and ratification's merges (and `modules.json`, J1 (1)).

## J3 · COMPLETE

**Entries applied.**
- T34-47 (N599, K1646): R9 met. A supplied document whose SHA-256 is a calculation input's stated hash fills that input when the case file lacks it (not listed, listed and not carried, or carried with other bytes); R20 recomputes with it and every finding resting on it takes the new entries (R11). The calculation's answer names `supplied: [{input, sha256}]`; `integrity.documents.used` lists the document; a carried-differing file keeps `differs` in `integrity.files`. Unmatched bytes are named and never used (readings J1 (2), accepted K1828). Spec rule 8 (R14) states it.
- T34-47 (K1824): R7 met. `check.mjs`:25 imports `../case-catalogue/checks.mjs`; case-checker no longer imports ratification (BOB drops the `ratification` edge at my merge, K1828 (1)). Done after case-catalogue's merge and before ratification's: the program no longer bundles `ratification/checks.mjs`, so ratification's merge cannot stale `program.mjs`. If a later merge changes case-catalogue or another bundled input, re-run `node bio-plane/src/case-checker/build-program.mjs`. `program.mjs` regenerated (sha256 0ad78e47…, 67 inputs); accepted red 6 cleared on this branch.
- T34-87 (DEC-149, K1821): `index.mjs`:40 reads "this group's Civicsmith holds no specification of that version"; spec.test.mjs's R15 test names the string.

**Deferred.** Nothing.

**Other modules.** case-import `real.test.mjs`:110 pins the old N599 divergence and is red against this branch (83/84), as J2 says; it is case-import's to flip (T34-94, K1828 (3)). The requirements' Suggestions still say to import from `ratification/checks.mjs` (wording, BOB's).

**Tests and checks.** case-checker `node --test bio-plane/test/m/case-checker/`: tests 35, pass 35, fail 0. case-import (uses case-checker): 84, pass 83, fail 1 (above). format: 127 modules, 0 failures; architecture: 12 product files, 48 relative imports, 0 failures; coverage: 20 of 20 live ids named, 0 failures; ownership: 7 files, 0 failures. P6: 1,133 lines with `program.mjs`.

Size (session_01PgBv4ynvv6WAdADreVJk7v): test runs 9, module lines 1133
