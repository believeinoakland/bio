# text-chain (T18)

**Status** · session_01N7QX5khED3EnvE1RYee7kL · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Read and planned; writing nothing in the catalogue until your CHANGE. Four points, my best reading on each; I carry on on these readings.

1. **`modules.json` needs `text-chain` `from: ["legacy-checks"]`.** Without it `checks/ownership.mjs` refuses the deletion in `bio-plane/checks/bio-checks.mjs` (text-chain has no `from` today; record-grammar has `["legacy-checks"]`). Best reading: you add it on the tranche branch with the CHANGE; I merge.
2. **Where `BASIS_GRADES`, `EARNED_CAPTURE_CEILING`, `isMachineIdentity` come from after record-grammar merges.** record-grammar moves the grade vocabulary and actor identity with re-exports left in the catalogue. Best reading: I keep importing them from the catalogue's re-exports (my only `uses` is `legacy-checks`) and re-point to record-grammar only if you add the `uses` edge and reword the Uses section, as jurisdictions' entry does. Tell me if you want the re-point this job.
3. **Wording:** requirements lines 18-20, 337-339 and the Uses section still say `check`/`translation` are read from `legacy-checks`' `TEXT_CHAIN_CHECKS`; the plan says you reword them. I will export `TEXT_CHAIN_CHECKS` from `textchain.mjs` unchanged (same 14 keys, `check`, `where`, `translation`), and test it under R86 (and the Errors summary).
4. **Found in other modules (REPORT to follow after the move, stated now so you can plan):** (a) control-plane's `dec49Row` reads families from the catalogue namespace plus `MODULE_CHECK_FILES`; once C-35 leaves the catalogue, a C-35 refusal forwarded without its row reaches the wire without `check`/`translation` until control-plane adds `import * as M_TEXT_CHAIN from "../textchain.mjs"` to that list (its own comment: "a module that opens a NEW file of families is not [found]"). (b) Legacy suites `test/textchain.test.mjs` and `test/transcribe.test.mjs` import `TEXT_CHAIN_CHECKS` from the catalogue and will fail at import after the deletion; not run per tranche (K619) and the catalogue cannot import text-chain (§12.2), so I leave them. (c) Promotion's census (`ROW_CENSUS` rows 879) and `CATALOG_VERSION` change with 14 rows departing: the row `awaiting stamp`. (d) the plane and agent-worker bundles and `release/` embed the catalogue: stale until regenerated at the layer close.

## J2 · REPORT

Found in other modules while doing this job (none changed by me):

1. **control-plane** (accepted as N414, K634): `dec49Row` reads families from the catalogue namespace plus `MODULE_CHECK_FILES`; C-35 now lives in `bio-plane/src/textchain.mjs`, which that list does not name, so a C-35 refusal forwarded without its own row reaches the wire without `check`/`translation` until `import * as M_TEXT_CHAIN from "../textchain.mjs"` joins the list. (Every C-35 refusal this module makes spreads its row itself.)
2. **legacy-tests**: `test/textchain.test.mjs` and `test/transcribe.test.mjs` import `TEXT_CHAIN_CHECKS` from the catalogue and now fail at import; left per K619/K635. The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`, release only) harvests `*_CHECKS` from the catalogue: C-35's fourteen codes will read as unregistered there unless it harvests module files.
3. **promotion (the stamp)**: fourteen rows departed the catalogue (C-35.1–C-35.14; the rows themselves unchanged, byte-identical in `textchain.mjs`); `ROW_CENSUS` (879) and `CATALOG_VERSION` move with them. The row is **awaiting stamp** (layer 2, rule (4)).
4. **Generated artifacts stale** (manifest §14): the plane's bundle (`bio-plane/dist/`) and agent-worker's (the catalogue is an input) are stale until regenerated at the layer close; `release/` likewise. Not written by me.
5. **Red on `tranche/T18` before and after this job, not caused by it** (same failures on a clean `origin/tranche/T18` worktree): membership `module-order.test.mjs` R83, `t9-notice-sight-bounds.test.mjs` R79 and promotion `registry.test.mjs` R39/R45/R46 (`MODULE_ORDER` is not `modules.json`'s order since the T18 modules were added); ocr-worker R16 (2 fails, its own N402 entry this tranche); agent-worker R45 (2 fails, bundle static check and freshness).
6. **text-chain's own exports with no requirement** (for BOB, P17): `weaker`, `stepCovers`, `perPageTierWinner`, `TIER_RULE`, `CONFIDENCE_BASES`, `EXTENT_KINDS`, `READING_POSITION_KINDS`, `READING_POSITION_UNPRODUCED` are exported and used (the legacy suites and callers read them) but named by no R; tested only indirectly. Propose Rs at the next requirements pass, or rule them internal.

## J3 · COMPLETE

**Entries applied** (layer 1, K629, K630, K634; B1, B3):
- ✱ C-35 `TEXT_CHAIN_CHECKS` moved whole from `bio-plane/checks/bio-checks.mjs` into `bio-plane/src/textchain.mjs` (exported, fourteen rows byte-identical: compared as JSON against the catalogue's at the merge, `identical: true`; header comment carried with it). The catalogue's copy deleted in this job (§12.2, K586 BOB-1): 154 lines removed, 0 added.
- Re-pointed: `refusal()` reads the module's own family; `BASIS_GRADES`, `EARNED_CAPTURE_CEILING`, `isMachineIdentity` now read from `record-grammar` (`./record-grammar/index.mjs`), K634 (2). The module no longer imports the catalogue.
- The row is **awaiting stamp** (promotion, layer 2).
- Converts (K619; old suites not deleted): `textchain` → `test/m/text-chain/family.test.mjs` (R86 and the Errors summary: exactly fourteen rows C-35.1–C-35.14, each `where` naming the region of the service that refuses it, a translation per row, every row driven through its own condition and read off the refusal). `drive-convert` → `grade.test.mjs` "R59: a host's conversion ahead of a text layer…" (with R29, R39: `[convert, layer]` bounds the capture axis to null for every byte grade and every layer letter, the layer alone as control, the sentence in order). R84's test now also reads every row's check, where and translation.
- No `not yet met` mark in this module's requirements.

**Deferred:** none.

**Found in other modules:** J2 REPORT (control-plane N414; legacy suites; the stamp; stale bundles; pre-existing reds on the tranche branch; exports with no R).

**Tests and checks** (on `job/T18/text-chain` after merging `tranche/T18` @ record-grammar's merge):
- `node --test bio-plane/test/m/text-chain/`: tests 98, pass 98, fail 0.
- `node --test bio-plane/test/m/` (every module test, as the catalogue lost rows and my uses' users read it): tests 3319, pass 3294, fail 3, todo 22; the 3 are membership R83, R79 and promotion R39/R45/R46 (`MODULE_ORDER`), the same 3 on a clean `origin/tranche/T18`.
- `ocr-worker/test/` (uses text-chain): 193 passed, 2 failed (R16), the same on `origin/tranche/T18`. `agent-worker/test/requirements.test.mjs` (reads the catalogue): 253 passed, 2 failed (R45), the same on `origin/tranche/T18`.
- No layer tests named in the manifest.
- `format`: 77 modules, 72 requirements files; 0 failures. `architecture text-chain`: 8 product files, 11 relative imports; 0 failures. `coverage text-chain`: 91 of 91 live requirement ids named by a test; 0 failures. `ownership text-chain tranche/T18`: 8 files; legacy-checks: 0 line(s) added, 154 removed; 0 failures.

Size (session_01N7QX5khED3EnvE1RYee7kL): test runs 9, module lines 1845
