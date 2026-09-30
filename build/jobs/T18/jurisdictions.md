# jurisdictions (T18)

**Status** · session_01BzHjKddHo9h3xqxppmp72U · depth 2 · WORKING · handled B0

## Progress

- **B1 START** (depth 2): entry N-A2 (`build/plan/current.md` layer 1; `build/plan/action-fold/deltas/jurisdictions.md`).
- **Done, before record-grammar merges:** R39 `action_kinds[].evidence` validated (`standard` ≤ 200 characters, `accepts` non-empty `{grade, coattested?}`, `contestable?` in the same form, `basis`); R28's `GRADE_UNKNOWN` and `EVIDENCE_NO_STANDARD`; R29 evidence one value per kind in `combine`, kept with every giver's basis, withheld and reported when profiles disagree; R36 the test profile's `commitment_claim` carries evidence with a `contestable` grade. The first profile holds no evidence (no measurement names a venue's standard; the deltas' Data note). Tests R39, R28, "R29 R39", R36; 46 pass.
- **Pending:** the grade list is a module-private stand-in (`jurisdictions/index.mjs`, `BASIS_GRADES`, marked PENDING) and the tests' `GRADES` likewise. On BOB's `CHANGE` that record-grammar has merged: merge `tranche/T18`, import `BASIS_GRADES` from `bio-plane/src/record-grammar/` in both, re-run steps 5–7.
- **Found (reported, J1):** the installer's bundle `newgroup/dist/newgroup.bundled.mjs` is stale from this change (`bio-plane/test/system/newgroup-bundle-fresh.test.mjs` (C) fails; 4 of 4 pass before it), since `newgroup/src/ui.mjs` bundles `jurisdictions/index.mjs` with its profiles. The import of record-grammar will also add that module to the bundle's inputs.
- Improvement made: a conflict on a kind's `venue` now reports each giver's venue basis (the fact's own), not the kind's.
