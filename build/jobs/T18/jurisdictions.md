# jurisdictions (T18)

**Status** · session_01BzHjKddHo9h3xqxppmp72U · depth 2 · WORKING · handled B2

## Completion

- **Entries applied:** N-A2 whole. R39 `action_kinds[].evidence` in `validate` (`standard` at most 200 characters; `accepts` a non-empty list of `{grade, coattested?}`; `contestable?` in the same form; `basis`), each `grade` a letter of record-grammar's `BASIS_GRADES`, imported (`uses` edge, K624 (6)), no copy held; R28's `GRADE_UNKNOWN` and `EVIDENCE_NO_STANDARD`; R29 `evidence` one value per kind in `combine`, kept with every giver's basis (`profile`, `bases`), withheld and reported in `conflicts` when profiles disagree; R36 the test profile's `commitment_claim` carries evidence with a `contestable` grade. The first profile holds no evidence: no measurement names a real venue's standard (the deltas' Data note; absent reads undetermined, R27). **Not yet met mark met:** R39's *(not yet met: new, K597 (3))*, for BOB to strike.
- **Improvement made:** a conflict on a kind's `venue` now reports each giver's venue basis (the fact's own), not the kind's.
- **Deferred:** none.
- **Found in another module (J1, J2):** the installer's generated bundle `newgroup/dist/newgroup.bundled.mjs` is stale from this change: `newgroup/src/ui.mjs` bundles `jurisdictions/index.mjs` with its profiles, and now record-grammar's `index.mjs` too. `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` (C) fails (3 passed, 1 failed); it passed 4 of 4 before this job's change. Regenerate at the layer close (`newgroup/`: `npm run build`).
- **Tests:** `node --test jurisdictions/test/`: tests 46, pass 46, fail 0. Modules that use jurisdictions (`validate` and `combine` gained a field), all 0 fail: id-spaces 26, docprofile 46, capture 96, extraction 94, entities 49, standards 18, actions 47, filings 35, escalation 29, monitoring 65, affordances 106, instance-setup 65, installer (`newgroup/test/`) 30; action-clocks and action-plans have no tests on this branch yet. Layer tests: none named (`build/manifest.md`).
- **Checks:** `format: 77 modules, 72 requirements files; 0 failures` · `architecture: 5 product files, 6 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 39 of 39 live requirement ids named by a test; 0 failures` · `ownership: 5 files changed by jurisdictions between tranche/T18 and HEAD; 0 failures`.
- Size (session_01BzHjKddHo9h3xqxppmp72U): test runs 3, module lines 2,566

## J1 · REPORT

Everything in N-A2 that does not need record-grammar is built and tested (R39 evidence in validate and combine, R28's GRADE_UNKNOWN and EVIDENCE_NO_STANDARD, R29, R36's test profile; 46 tests pass; format, architecture, coverage 39/39 and ownership clean). BASIS_GRADES is a marked stand-in until your CHANGE says record-grammar has merged; then I import it and complete. Generated artifact staled: newgroup/dist/newgroup.bundled.mjs (installer's), because newgroup/src/ui.mjs bundles jurisdictions/index.mjs and its profiles; bio-plane/test/system/newgroup-bundle-fresh.test.mjs (C) fails after this change, passes before. The record-grammar import will add that module to the bundle's inputs too.
