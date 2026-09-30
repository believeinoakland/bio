# legacy-checks (T16)

**Status** · session_014rKpxqH7kUf2B2Gnkpa86U · depth 2 · WAITING ON BOB (J1) · handled B2

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

## J2 · REPORT

Read whole: `bio-checks.mjs` (11,485 lines), `gate.mjs`, `test/m/ratification/checks.test.mjs`, the plan, `layers.md`. No code changed yet: this branch is still mergeable as a no-op, and I keep it that way until J1 is answered.

1. **promotion: the lines that must change before the copy can go** (N361's REPORT; not edited):
   - `bio-plane/src/gate.mjs`:39 `import { checkBundle, checkCaseDocument }`: drop `checkCaseDocument`.
   - `gate.mjs`:494–498 `runCaseGate(..., catalogue = checkCaseDocument)`: the default becomes a catalogue that throws "no case-document catalogue is registered", so the gate answers C-102.9 through `caseCatalogueFailed` (fail closed, R33/R47). The comment at :494–496 changes to match.
   - `bio-plane/src/promotion/index.mjs`:22 (import) and :288 (`this.#caseCatalogue ? this.#caseCatalogue.fn : checkCaseDocument`): the same fail-closed fallback.
   - promotion's tests `test/m/promotion/gate.test.mjs`:6, :105 and `registry.test.mjs`:296–322 import the catalogue's copy and re-anchor.
2. **The removal itself, measured by a dry run** (in scratch, not committed; the module loads after it with 170 exports instead of 182):
   - delete `checkPublishedExtension` (private, :2428–2653; its only caller is `checkCaseDocument`);
   - delete :8061–8669: the C-41 header, `CASE_DOCUMENT_FORMAT`, `_V3`, `_V2`, `_LEGACY`, `CASE_DOCUMENT_FORMATS_ACCEPTED`, `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures`, `caseDocumentRequiresV4Disclosures`, `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY`, `CASE_CITATION_VERSIONS`, the private `CITATION_NAMES_CAPTURE` and `C41`, and `checkCaseDocument`;
   - keep `SUBJECT_POSITIONS`, `STRENGTH_STATES`, `CASE_MEMBER_ROLES`, `isCaseMemberBytes` and `caseEditionClaimed`: other modules and suites read them (ratification's `checks.mjs` imports `STRENGTH_STATES`; `civicos-ui/check-semantics.mjs` too);
   - comments that name the removed code are re-pointed to ratification (:240, :251, :257, :2516–2537, :2694–2709, :4652–4657).
3. **Rows, for promotion's stamp (N318)**, when the removal lands: C-41.1–C-41.15's catalogue copies depart (ratification's `CASE_DOCUMENT_FAMILY` still holds them, so ROW_CENSUS loses the second copy), and the catalogue loses the C-2.8, C-3.1 and C-21.1 case-document arms it ran only as the fallback. What the gate runs changes only in the no-registration path (fallback gone, fail closed). This job has moved no row yet.
4. **The parity test** `test/m/ratification/checks.test.mjs`:133 stays red while the copy stands. Its only failure is C-41.1's message: the catalogue names `/4`, ratification `/5`. Once the copy is removed it cannot pass and should be retired (nothing is left to compare). Its :140–142 also compare `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY` (both go) and `SUBJECT_POSITIONS` (stays).
5. **legacy-tests**, for when the removal lands: `d150-statement-acknowledgement`:146, `publish`:78, `casesearched`:116, `caseproduction`:108 import `checkCaseDocument` (and `casesearched` `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY`); `d470-catalog-census` reads `CASE_DOCUMENT_FAMILY`, `CASE_DOCUMENT_FORMAT`, `CASE_DOCUMENT_FORMATS_ACCEPTED` and `caseDocumentRequiresDisclosures`, and its census of the catalogue file drops the C-41 ids.
6. **civicos-ui / affordances:** no code hit for anything retired. `civicos-ui/check-refusal-codes.mjs`:3667 mentions C-41 in a comment about ratification's vocabulary, which stays true. Affordances imports none of it.
7. **agent-worker's bundle (§14):** `agent-worker/src/index.mjs`:160 imports the whole catalogue (`renderPack(pub.result, CATALOGUE)`), so the removal will stale `agent-worker/dist/agent-worker.bundled.mjs`. Not rebuilt. Unchanged by this job so far.
8. **BOB's file:** `node checks/format.mjs` fails on `build/layers.md`: layer 3 does not list `sources`, which `modules.json` has since K527.
9. **`not yet met` marks:** none met. legacy-checks has no requirements file and no live ids.

Checks on this branch (no code change): format 1 failure (item 8); architecture 0 failures; coverage 0 of 0; ownership 0 failures (1 file, my record).

Next step, on your answer to J1: with option (A), I wait for a CHANGE after promotion merges and then apply item 2 as pure removals. With the alternative, I apply item 2 now, keeping a throwing `checkCaseDocument` export.
