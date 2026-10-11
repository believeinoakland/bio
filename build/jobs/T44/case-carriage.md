# case-carriage (T44)

**Status** · session_01RHnxNfEc1i2Xkd7pgZikrv · depth 2 · WORKING · handled B1

## Completion (T44-8)

**Entry applied** (N872, K2722): `index.mjs`'s two imports of `membership/index.mjs` (lines 55 and 61) are merged into one, `import { membershipOf, listenerRefusal } from "../membership/index.mjs";`. Behaviour is unchanged. No requirement changes. Work commit 6584e0c441, module files only.

**My own code and tests read whole** (P20, K2730): `index.mjs`, `schema.mjs`, `checks.mjs`, and every file under `test/m/case-carriage/` (`fixture.mjs`, `archive`, `documents`, `hold`, `invariants`, `marks`, `obscured`, `rereads`, `withdraw`). I found two flaws, both stale comments, and fixed them:
1. `heldMaterialsOf`'s doc comment (R2) gave `held` as `inline` or `evidence` only. It now also names `derived` (T37), which R1 writes and R2 answers.
2. The schema comment on `published_case_materials` described `derived` as a photo's copy only. It now also names a member document's cleaned copy (T39; R15), which R1 holds there as well.

I found no flaw in behaviour. Nothing is deferred.

**Reading set** (mechanics §17; 635 KB at the START, over 600 KB, K2700):
- **Read whole, myself:** my requirements, code and tests; my plan entry; K2722; rule 4 of "Rules at the opening".
- **Through a helper:** one helper agent in this session read the public parts (Purpose and Provides) of all thirteen modules in my Uses in full, 318,558 bytes. It wrote me a digest, each statement citing its section (K2032). The digest found nothing in them that bears on merging the imports. `listenerRefusal` is membership R81's module-level function, and promotion R49 re-exports the same function. No public part sets a rule about import paths.
- **Not part of the set:** layer 8's contract in `build/layers.md` (the entry changes no interface).

**Found in another module:** `case-grammar`. My Uses cite `caseDocumentBlocks` and `sourceRowsStanding` as "case-grammar R1", and my R5 relies on both. Both are exported by `case-grammar` (`src/case-grammar/blocks.mjs`:125, 163). Neither name appears anywhere in `build/requirements/case-grammar.md`, public or private. So a service I use is provided without a requirement that states it (against case-grammar's Provides). Reported to BOB (J1). Generated artifacts: only the plane bundle includes this module; this change stales it as every merge does (rule 4 (5)).

**Tests and checks:**
- case-carriage `node --test bio-plane/test/m/case-carriage/`: 70 pass, 0 fail.
- Users: `plane` (imports me) `node --test bio-plane/test/m/plane/`: 190 pass, 0 fail. `case-import` does not import case-carriage, so its tests were not run.
- `format`: 147 modules, 146 requirements files; 0 failures.
- `architecture case-carriage`: 12 product files, 58 relative imports; 0 failures.
- `coverage case-carriage`: 18 of 18 live requirement ids named by a test; 0 failures.
- `ownership case-carriage tranche/T44`: 3 files changed; 0 failures.

Size (session_01RHnxNfEc1i2Xkd7pgZikrv): test runs 2, module lines 1382

## J1 · REPORT

Found in another module (case-grammar). My Uses cite caseDocumentBlocks and sourceRowsStanding as "case-grammar R1", and my R5 relies on both. case-grammar exports both (src/case-grammar/blocks.mjs:125, 163), but neither name appears anywhere in build/requirements/case-grammar.md, public or private. So a service I use has no requirement that states it. Nothing in T44-8 depends on this. Detail in my record's Completion section.
