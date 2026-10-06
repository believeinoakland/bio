# case-checker (T33)

**Status** · session_01CsZJR2mTFDLhc2Xn3PTdMQ · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Best readings for T33-66 (R20, R1, R11, R13), built on now; case-grammar T33-60 is unmerged, so its R18/R13 parts are taken as injected deps coded to its requirements (K1563 (1)), tests re-pointed after its merge.
(1) Inputs. A `calculation` file is found by its SHA-256 = the input hash the row names ("travelling as the file its input hash names"), whatever its path; its bytes are the canonical JSON calc-grammar evaluates (a table or a figure). A missing file, or one whose bytes do not hash to the row's hash, is a `missing` entry. Row `inputs` read as `{name: sha}` or `[{name, sha256}]`.
(2) Stated result. `results` is the stored results by key; the stated value is `results[result_key]`. `result_key` is recomputed by `calc-grammar.resultKey(recipe, inputs, {methodVersion})`; a different key or value is a `differs` entry naming result/stated/recomputed.
(3) Versions. `method_version` (and the recipe's `method`) `bio-calc/<n>` not held → `missing`. A row that is not a bio-calc recipe (a workbook, or another engine's value: recipe `method` or `method_version` not `bio-calc/…`) → `not_recomputed` with K1448's sentence, no entry.
(4) Disclosure. A row with `recompute` `differs` or `unbound` and a non-null `disclosed` is answered with `disclosed` carried; a mismatch or unbound input on it adds no `differs`/`missing` entry. Undisclosed, it is checked like any row.
(5) Chain. A finding rests on a calculation through a grading leg `kind: "calculation"` whose `target` is the row's `calc` (strength R36), followed through inquiry legs; it takes the calculation's entries (R11). Answer `checker.calc_versions` = calc-grammar's `METHOD` list (`["bio-calc/1"]`).
(6) modules.json: case-checker's `uses` lacks `calc-grammar` (and still names `promotion`); that edit is BOB's.

## J2 · REPORT

T33-66 built on B2's readings (pushed, job/T33/case-checker): R20 recomputes each calculations: row by calc-grammar.evaluate/resultKey, inputs found by SHA-256 among calculation files; R1 answers calculations and checker.calc_versions; R11 counts a calculation a finding's chain rests on; R14 spec gains the calculation kind, the calculations: block and rule 11; R5 test pins the version the case file states (K1608 red cleared). 30/34 on the tranche: the 4 R20 tests need case-grammar's calculation kind (T33-60); all 34 pass against a local stub of it. Checks: format 0, coverage 20/20, ownership 0; architecture 3 failures, all the missing calc-grammar uses edge (yours at merge). Final uses: + calc-grammar; promotion stays (gate.mjs CATALOG_VERSION). Next: after case-grammar merges, a CHANGE from you; I merge tranche/T33, re-point the fixture to its real calculation path and calculationsLines/calculationsOf, regenerate program.mjs, rerun, COMPLETE.

## J3 · COMPLETE

T33-66 complete (job/T33/case-checker @ 2279d002a8, tranche/T33 merged after B3, K1636).
Entries applied: T33-66 (C:A-13, K1448). R20: each `calculations:` row (case-grammar `calculationsOf`) recomputed by calc-grammar `evaluate`/`resultKey` over the inputs carried at `calculations/<calc>/inputs/<sha256>`, each checked against its hash; agrees | differs | not_recomputed with differs/missing entries as R20 states; a disclosed differing/unbound row carries `disclosed` and adds no entry; a workbook or another engine's value is not_recomputed with NOT_RECOMPUTED_STATEMENT. Also checked (only the document is signed): `calculation.json` must be `calculationFileText` of the signed row, and `prov.jsonld` must be `provOf` of the signed rows. R1: answer gains `calculations` and `checker.calc_versions`. R11: a finding takes the entries of every calculation its chain rests on (calculation legs, through inquiry legs); a leg to an unlisted calculation differs. R13: calc-grammar's evaluator bundled into program.mjs (regenerated on the merged tranche: 584,154 bytes, sha256 753770d4…f324); the offline program test now recomputes a calculation. R14: spec states the calculation kind's three paths, the input_sha rule, R17's `undetermined` and capture-only legs, the `calculations:` and `timeline:` blocks, and rule 11. Own reds cleared: R5 (K1608, pins the stated version), R13 program SHA, R14 spec.
Deferred: none. timelineOf is not read by the checker (the timeline reaches it only through completeEditionOf's render, R10).
Found elsewhere: program.mjs changed, so the plane bundle (bio-plane/dist, it bundles program.mjs) is stale: regenerate at the close (K1540 order). modules.json: case-checker uses + calc-grammar; promotion stays (gate.mjs CATALOG_VERSION).
Tests: case-checker 34 pass, 0 fail; users: case-import 75/75; plane + migrate-released 86/86. Checks: format 0 failures; architecture 3 failures, all the calc-grammar uses edge (BOB's at merge, B2); coverage 20/20, 0 failures; ownership 8 files, 0 failures.
Size (session_01CsZJR2mTFDLhc2Xn3PTdMQ): test runs 9, module lines 1111

## J4 · COMPLETE

B4 applied (job/T33/case-checker @ 03844132e6; tranche/T33 merged, K1642). A workbook row as case-grammar R18 now states it (calc its capture's SHA-256, recipe null, inputs {}, result_key null, recompute not_recomputed) answers not_recomputed with NOT_RECOMPUTED_STATEMENT and no entry; tested (R20) and stated in the spec. program.mjs regenerated (584,510 bytes, sha256 c6f6f1e1…81c4): the plane bundle stays stale until the close.
Tests: case-checker + case-import 109/109. plane + migrate-released 85/86: the one red is not this module's: plane `notices.test.mjs:118` (R5) expects corpus-export's ops [export, exportlog] and now gets exportpage and exportrender too, from corpus-export's merge.
Checks: format 0; architecture 3, all the calc-grammar uses edge (yours at merge); coverage 20/20, 0; ownership 9 files, 0. Final uses: + calc-grammar; promotion stays.
Everything else as J3.
Size (session_01CsZJR2mTFDLhc2Xn3PTdMQ): test runs 13, module lines 1111
