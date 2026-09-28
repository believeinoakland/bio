# connections (T10)

**Status** · session_01AVYPLgv86VRTDdHGQmuQVk · depth 2 · WORKING · handled B1

## J1 · REPORT

These are things this job found in other modules and artifacts. I changed none of them.

1. **Generated artifact made stale** (mechanics §14). `fleetbundles.test.mjs` names `src/connections/index.mjs` and `src/connections/themes.mjs` as changed sources for `agent-worker/dist/agent-worker.bundled.mjs` and its `.bundle.json` (owner `agent-worker`). `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) carries the same sources. Regenerate both at the layer's close.
2. **legacy-tests: the DEC-49 guard's THEME floor.** `civicos-ui/check-refusal-codes.mjs` notes that `THEME_CHECKS`' floor of 4 shared rows "falls by 4 in that landing" once connections re-exports C-81.11–C-81.14. This is that landing. The guard now reads `THEME_WITHDRAW_CHECKS` as "4 row(s) of THEME_CHECKS by reference", a view it does not count. The floor and its comment belong to legacy-tests. `civicos-ui/test/themes.test.mjs` still imports `THEME_WITHDRAW_CHECKS` from `connections/themes.mjs`. The name is kept as that view, and the test passes (1/0).
