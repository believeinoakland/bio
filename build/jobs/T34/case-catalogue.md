# case-catalogue (T34)

**Status** · session_01FkFUNyZGDuS4mAjGFCbFbM · depth 2 · COMPLETE · handled B1

## Completion (T34-93)

**Entries applied.** T34-93: `bio-plane/src/case-catalogue/checks.mjs` holds `ratification/checks.mjs` lines 14–962 and 1246–1281 (the imports, `f()`, the case relation and C-2.8's case-member arm, the C-41 catalogue, the three runners), every name, id, message and translation unchanged; a new header; the section headings and the comments naming ratification's ids or test path re-pointed to this module's (R1–R4, `test/m/case-catalogue/`). Imports only `record-grammar/index.mjs`, `strength/arithmetic.mjs` (K1317) and `case-grammar/index.mjs`, as ratification's copy does. No `index.mjs` (optional; the one pure file is the interface). `bio-plane/test/m/case-catalogue/checks.test.mjs` holds ratification's pure arms (its lines 14–262 and 345–383 with their helpers; no `fixture.mjs`), re-labelled R8→R1, R38→R3, R9→R2, R14→R4, plus two arms: R4 (the family is gate findings: no `*_CHECKS` export, no row with `where` or code) and R5 (no place named in the vocabularies or findings, R15's vocabulary part). `modules.json`: my entry's `paths` and `tests` set (K1043's form). R1–R5 met; the "not yet met" marks are BOB's to strike.

**Deferred.** None.

**Found elsewhere.** None new. Known and named: accepted red 6 (the row census counts C-41.1–C-41.17 twice until ratification's merge). The ownership check names `build/modules.json` as outside my paths: that is my own entry's `paths`/`tests` edit BOB's START directs (K1043's form), nothing else in the file changed.

**Tests and checks** (on `job/T34/case-catalogue`, tranche/T34 merged in):
- `node --test bio-plane/test/m/case-catalogue/`: tests 16, pass 16, fail 0.
- `format`: 127 modules, 126 requirements files; 0 failures.
- `architecture case-catalogue`: 2 product files, 6 relative imports; 0 failures.
- `coverage case-catalogue`: 5 of 5 live requirement ids named by a test; 0 failures.
- `ownership case-catalogue tranche/T34`: 4 files; 1 failure, `build/modules.json` (my entry only, as directed; above).

Size (session_01FkFUNyZGDuS4mAjGFCbFbM): test runs 2, module lines 1322 (src 999, tests 323)
