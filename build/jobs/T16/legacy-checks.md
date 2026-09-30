# legacy-checks (T16)

**Status** · session_014rKpxqH7kUf2B2Gnkpa86U · depth 2 · WORKING · handled B1

## J1 · QUESTION

N361 cannot be retired inside layer 1 alone: removing `checkCaseDocument` from `bio-checks.mjs` breaks a later module at load, not just a test.

Who imports the catalogue's copy (read, static imports):
- promotion: `src/gate.mjs`:39 (import) and :498 (`runCaseGate`'s default `catalogue = checkCaseDocument`); `src/promotion/index.mjs`:22 (import) and :288 (fallback when nothing registered). Deleting the export makes the plane fail to load.
- promotion's tests: `test/m/promotion/gate.test.mjs`:6, :105; `registry.test.mjs`:296–322 (R33's "before any registration" arm compares against it).
- ratification's parity test `test/m/ratification/checks.test.mjs`:133–143 (also asserts `CASE_DOCUMENT_FAMILY`, `SEARCHED_SUBJECT_SOURCES`, `SUBJECT_POSITIONS` equal to the catalogue's).
- legacy-tests: `d150-statement-acknowledgement`:146, `publish`:78, `casesearched`:116, `caseproduction`:108 (`checkCaseDocument`), `d470-catalog-census` (`CASE_DOCUMENT_FAMILY`, `CASE_DOCUMENT_FORMAT`).

Current state: the parity test's only failure is C-41.1's message (catalogue names /4, ratification /5); nothing else differs.

My best reading, which I am proceeding on: the retirement is sequenced across the tranche, not done in one layer-1 merge.
1. This job (layer 1) prepares the removal but merges nothing that breaks promotion: it deletes `checkCaseDocument` and every constant, helper and C-41 row (`CASE_DOCUMENT_FAMILY`, C-41.1–C-41.15, 15 rows) used only by it, but ONLY once promotion no longer imports it. Until then I merge a no-op on this entry and report.
2. Promotion's layer-2 job (already last in layer 2, stamping) drops the import: `gate.mjs`:39 and :498, `promotion/index.mjs`:22 and :288. With no registered catalogue, the gate fails closed: `runCaseGate` answers C-102.9 CASE_CATALOGUE_FAILED ("no case-document catalogue is registered"), R33's own fail-closed answer, so nothing passes unjudged. Its tests `gate.test.mjs`:105 and `registry.test.mjs`:296–322 re-anchor on ratification's `checkCaseDocument` or on that refusal.
3. Then a CHANGE re-opens this job to delete the copy (pure removals), and promotion's stamp names it: C-41.1–C-41.15's catalogue copies depart (census of the catalogue file -15; ROW_CENSUS loses the second copy), and the gate's composition changes (no fallback).
4. Ratification's parity test :133 then retires (nothing left to compare); legacy-tests re-anchor the four suites and d470 on ratification's exports.

Alternative, if you prefer it inside layer 1: I keep the export name but make it fail closed (throw "retired: register ratification's catalogue"), so `runCaseGate` already answers C-102.9 with no promotion edit. That keeps the plane loading but turns red promotion's `registry.test.mjs` R33 arm and the four legacy suites, so I do not recommend it.

Which do you want? Meanwhile I read the module whole and prepare the removal diff on my branch without pushing it to the tranche.
