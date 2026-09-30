# legacy-checks (T17)

**Status** · session_01TaobwHYryXf8vfbvWkYqUz · depth 2 · WORKING · handled B1

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
