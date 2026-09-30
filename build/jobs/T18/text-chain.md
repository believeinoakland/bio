# text-chain (T18)

**Status** · session_01N7QX5khED3EnvE1RYee7kL · depth 2 · WORKING · handled B1

## J1 · QUESTION

Read and planned; writing nothing in the catalogue until your CHANGE. Four points, my best reading on each; I carry on on these readings.

1. **`modules.json` needs `text-chain` `from: ["legacy-checks"]`.** Without it `checks/ownership.mjs` refuses the deletion in `bio-plane/checks/bio-checks.mjs` (text-chain has no `from` today; record-grammar has `["legacy-checks"]`). Best reading: you add it on the tranche branch with the CHANGE; I merge.
2. **Where `BASIS_GRADES`, `EARNED_CAPTURE_CEILING`, `isMachineIdentity` come from after record-grammar merges.** record-grammar moves the grade vocabulary and actor identity with re-exports left in the catalogue. Best reading: I keep importing them from the catalogue's re-exports (my only `uses` is `legacy-checks`) and re-point to record-grammar only if you add the `uses` edge and reword the Uses section, as jurisdictions' entry does. Tell me if you want the re-point this job.
3. **Wording:** requirements lines 18-20, 337-339 and the Uses section still say `check`/`translation` are read from `legacy-checks`' `TEXT_CHAIN_CHECKS`; the plan says you reword them. I will export `TEXT_CHAIN_CHECKS` from `textchain.mjs` unchanged (same 14 keys, `check`, `where`, `translation`), and test it under R86 (and the Errors summary).
4. **Found in other modules (REPORT to follow after the move, stated now so you can plan):** (a) control-plane's `dec49Row` reads families from the catalogue namespace plus `MODULE_CHECK_FILES`; once C-35 leaves the catalogue, a C-35 refusal forwarded without its row reaches the wire without `check`/`translation` until control-plane adds `import * as M_TEXT_CHAIN from "../textchain.mjs"` to that list (its own comment: "a module that opens a NEW file of families is not [found]"). (b) Legacy suites `test/textchain.test.mjs` and `test/transcribe.test.mjs` import `TEXT_CHAIN_CHECKS` from the catalogue and will fail at import after the deletion; not run per tranche (K619) and the catalogue cannot import text-chain (§12.2), so I leave them. (c) Promotion's census (`ROW_CENSUS` rows 879) and `CATALOG_VERSION` change with 14 rows departing: the row `awaiting stamp`. (d) the plane and agent-worker bundles and `release/` embed the catalogue: stale until regenerated at the layer close.
