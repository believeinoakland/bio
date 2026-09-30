# record-grammar (T18)

**Status** · session_01HTBPsBTM23s6x7zFpscC9X · depth 2 · WORKING · handled B0

## J1 · QUESTION

R26 (parity until the re-export goes) is a fact about `legacy-checks`' re-exports, and `architecture.mjs` refuses my test importing `bio-plane/checks/bio-checks.mjs` (legacy-checks is later in the order, P4). My best reading, built: R26's test under `bio-plane/test/m/record-grammar/` checks this module's side (each provided name is one binding, held by one part and answered by the entry, `invariants.test.mjs`), and the cross-module identity (`CATALOGUE[n] === RG[n]` for each of the 29 re-exported names, and `b64ToBytes` not re-exported) goes in `legacy-checks`' tests this tranche, which may import this module. I verified that identity once by hand on this branch: 29 names, 0 mismatches, `b64ToBytes` not in the catalogue. If you want it otherwise (R26 moved to legacy-checks' requirements, or re-worded as this module's side only), a CHANGE; nothing I build next depends on it, so COMPLETE follows.
