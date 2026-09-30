# legacy-checks (T17)

**Status** · session_01TaobwHYryXf8vfbvWkYqUz · depth 2 · COMPLETE · handled B1

## J1 · REPORT

N372 is applied (J2 COMPLETE follows). What it means for other modules:

1. **agent-worker's bundle is stale (§14).** `agent-worker/src/index.mjs` imports the whole catalogue, so `agent-worker/dist/agent-worker.bundled.mjs` no longer matches its input. agent-worker's R45 test fails 2 arms on this branch (the static check and the fresh-build check, "STALE BUNDLE … bio-checks.mjs has changed"); both pass on `tranche/T17`. I did not regenerate it; that is BOB's at the close.
2. **N221 and N249: the catalogue-copy clauses are done.** N221 (C-41.1–.15 defined twice; the file's copy and `checkCaseDocument`'s per-member arm retire) and N249's clause "two live `checkCaseDocument` copies and the catalogue's `checkPublishedExtension` copy" are met. Ratification's `checkCaseDocument` and `checkPublishedExtension` are now the only copies. N249's other clauses (C-33.40's `where`, conformance's `opened`, case-authoring R7) are not legacy-checks' and are unchanged.
3. **The census change, `awaiting stamp` (promotion's stamp in layer 2).** 16 C-ids leave the catalogue file: C-41.1–C-41.15 (the catalogue's copy of `CASE_DOCUMENT_FAMILY`; ratification's copy keeps the rows) and C-21.1 (its only site in this file was `checkCaseDocument`'s case-altitude arm; ratification's arm stays). C-2.8 and C-3.1 stay in the file but lose their case-document arms. d470's print on this branch: CENSUS 340 checks, sha256 c56ccc26…; 43 tables, 299 distinct C-numbers; 41 literal sites; SOURCE sha256 15465533…. On `tranche/T17` it was 356 checks, 44 tables, 42 literal sites. d470 fails A1, A3 and A9 on this branch, as expected. Moving those floors and pins is legacy-tests' work (its plan entry names it), and I have not touched d470.
4. **Red before my change, and still red after (not mine; for their owners):** with the old catalogue restored, the same failures appear on `tranche/T17`. Each one reads plane source text that extraction has moved:
   - agent-worker: `agent-worker.test.mjs` 5, `fanout.test.mjs` 3, `harness.test.mjs` 4, `versions.test.mjs` 2 (B0, B0b). These tests parse the plane's OPS table and `namespaceGate` set from source, and the parse comes back empty.
   - ocr-worker: `ocr-worker.test.mjs` R16, 2 arms (the plane's namespace set is not read).
   agent-worker also has no `node_modules` in this checkout.
5. **Importers checked before deleting.** Nothing in the repository imports any of the 12 removed exports from the catalogue. I checked static named imports, `import *` namespaces and dynamic `import()` in 449 files, excluding `dist/`. Every remaining use of those names is ratification's or publication's own copy. One exception is d470, which reads the file's census on purpose (item 3).

## J2 · COMPLETE

**Entries applied: N372 (K529), whole.** First I confirmed no importer remains (J1 item 5). Then, in `bio-plane/checks/bio-checks.mjs`:
- deleted the private `checkPublishedExtension` (:2428–2653, with its trailing blank line);
- deleted :8061–8669: the C-41 header, `CASE_DOCUMENT_FORMAT`, `_V3`, `_V2`, `_LEGACY`, `CASE_DOCUMENT_FORMATS_ACCEPTED`, `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures`, `caseDocumentRequiresV4Disclosures`, `SEARCHED_SUBJECT_SOURCES`, `CASE_DOCUMENT_FAMILY`, `CASE_CITATION_VERSIONS`, the private `CITATION_NAMES_CAPTURE` and `C41`, and `checkCaseDocument`. The module loads with 170 exports (182 before);
- kept `SUBJECT_POSITIONS`, `STRENGTH_STATES`, `CASE_MEMBER_ROLES`, `isCaseMemberBytes` and `caseEditionClaimed`;
- pointed the comments that named the removed code at ratification (:240, :251, :257, the `checkCompletenessFreshness` note's two references, and `checkBundle`'s note); the comments that were at :2516–2537 were inside the deleted function and went with it. I left a short note at each removal site saying where the code now lives (ratification R8, R9; publication R20; promotion R33, R47), as the file does for its earlier removals.

**Census, `awaiting stamp` for promotion's stamp (layer 2):** C-41.1–C-41.15's catalogue copies and C-21.1 leave the catalogue file; C-2.8 and C-3.1 lose their case-document arms (J1 item 3 has the d470 print).

**Deferred:** none. **Found in other modules:** J1 items 1, 2 and 4 (agent-worker's stale bundle; N221 and N249's clauses met; the worker tests that were already red on the tranche, each reading moved plane source). No `not yet met` mark: legacy-checks has no requirements file and no live ids.

**Tests** (all in the foreground, each chunk under ten minutes):
- `bio-plane/test/m/`, all 59 modules in three runs: 485 pass, 0 fail (the catalogue's readers); 1729 pass, 0 fail, 17 todo (first 30 modules); 1436 pass, 0 fail, 6 todo (last 29 modules).
- agent-worker `test/`: fails R45 ×2 (the stale bundle, expected) plus 14 arms that fail identically on `tranche/T17`. ocr-worker `test/`: 193 pass, 2 fail, identical on `tranche/T17`.
- d470 (read for the census only): 11 pass, 3 fail (A1, A3, A9, legacy-tests').

**Checks:** format 0 failures (72 modules, 67 requirements files); architecture 0 failures; coverage 0 of 0 ids, 0 failures; ownership 0 failures (2 files: the module and this record).

Size (session_01TaobwHYryXf8vfbvWkYqUz): test runs 8, module lines 856 (15 added, 841 removed)
