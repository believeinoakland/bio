# case-checker (T33)

**Status** · session_01CsZJR2mTFDLhc2Xn3PTdMQ · depth 2 · WORKING · handled B0

## J1 · QUESTION

Best readings for T33-66 (R20, R1, R11, R13), built on now; case-grammar T33-60 is unmerged, so its R18/R13 parts are taken as injected deps coded to its requirements (K1563 (1)), tests re-pointed after its merge.
(1) Inputs. A `calculation` file is found by its SHA-256 = the input hash the row names ("travelling as the file its input hash names"), whatever its path; its bytes are the canonical JSON calc-grammar evaluates (a table or a figure). A missing file, or one whose bytes do not hash to the row's hash, is a `missing` entry. Row `inputs` read as `{name: sha}` or `[{name, sha256}]`.
(2) Stated result. `results` is the stored results by key; the stated value is `results[result_key]`. `result_key` is recomputed by `calc-grammar.resultKey(recipe, inputs, {methodVersion})`; a different key or value is a `differs` entry naming result/stated/recomputed.
(3) Versions. `method_version` (and the recipe's `method`) `bio-calc/<n>` not held → `missing`. A row that is not a bio-calc recipe (a workbook, or another engine's value: recipe `method` or `method_version` not `bio-calc/…`) → `not_recomputed` with K1448's sentence, no entry.
(4) Disclosure. A row with `recompute` `differs` or `unbound` and a non-null `disclosed` is answered with `disclosed` carried; a mismatch or unbound input on it adds no `differs`/`missing` entry. Undisclosed, it is checked like any row.
(5) Chain. A finding rests on a calculation through a grading leg `kind: "calculation"` whose `target` is the row's `calc` (strength R36), followed through inquiry legs; it takes the calculation's entries (R11). Answer `checker.calc_versions` = calc-grammar's `METHOD` list (`["bio-calc/1"]`).
(6) modules.json: case-checker's `uses` lacks `calc-grammar` (and still names `promotion`); that edit is BOB's.
