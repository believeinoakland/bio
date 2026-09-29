# case-authoring (T13)

**Status** · session_01UycqMHEcrUKuRXZ9RLdPm5 · depth 2 · COMPLETE · handled B1

## Completion

**Applied** (on `tranche/T13` at a53c010cb8):
- **N322 (R7).** When `mintOpaqueId` finds no free case id, `#publishCase` now returns `mintExhausted("CASE")` from record-core (its R62, row C-59.6). It no longer writes its own row-less `{reason: "MINT_EXHAUSTED", detail}`. The answer is record-core's whole: `code`, `check` C-59.6, `translation`, `prefix: "CASE"` and its fixed case-id `detail`. The act runs in one transaction, so nothing is written and no id is spent. The import is on the existing `record-core` edge in `modules.json`.
- **N251 (my share).** `test/m/case-authoring/invariants.test.mjs` no longer imports the catalogue's emptied `CASE_DERIVATION_CHECKS`. R29's test now walks every row family the catalogue exports, found by shape (rows carrying `check`). It asserts that no row holds a moved code (C-44.1, C-44.3–C-44.5, C-82.2–C-82.7) by key or by check id. So the test still holds when legacy-checks removes the empty export in T14. It also asserts that the walk reaches more than ten families. A negative control confirmed the walk finds a row the catalogue does hold (`MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH`).

**Tests** (`bio-plane/test/m/case-authoring/identity.test.mjs`): R7's MINT_EXHAUSTED test now asserts that the answer deep-equals `mintExhausted("CASE")`, carries C-59.6 and prefix `CASE`, and names a case id. It also asserts that nothing is written (no case document, no id spent) and that `newCase` answers the same.

**Please strike** (my work meets it): R7's `*(not yet met: N322)*`, and in the Status line "R7 (N322, `mintExhausted`, folded for BOB #64, 2026-09-29, K408)" among the not-yet-met marks. The requirements file is outside my paths. R12 and R21's named-draft marks are not my entries and stay.

**Check rows:** none added, moved or retired. This module now answers with record-core's C-59.6 row and holds no row of its own for it. There is nothing for promotion to stamp (N318).

**Grep for the code** (`MINT_EXHAUSTED`): no hit in affordances. One hit in `civicos-ui/`: `check-refusal-codes.mjs`:3781, the DEC-49 guard's multi-site note. It says that case-authoring's `#publishCase` mints the code "row-less". That is now stale, because the site answers through record-core's one helper. It is legacy-tests' to re-anchor (its N322 share, last in T13). `bio-plane/src/gate.mjs`:304 only names C-59.6 in a comment and is unaffected.

**Deferred:** nothing.

**Found in other modules:** none beyond the guard note above. Queue's task mint (`queue/index.mjs`:3771) still words the code in a detail string, and that is already queue's N322 entry in layer 11. No generated artifact goes stale: case-authoring is in no bundle's inputs (manifest §Generated artifacts).

**Tests and checks run:**
- case-authoring: tests 39, pass 39, fail 0, todo 0.
- Modules that use case-authoring: review 30 of 30 pass; control-plane 40 pass, 0 fail, 3 todo (its existing R25–R27 store-half todos).
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture`: 12 product files, 58 relative imports; 0 failures.
- `coverage`: 30 of 30 live requirement ids named by a test; 0 failures.
- `ownership` (vs tranche/T13): legacy-store and legacy-checks 0 lines added; 0 failures.

Size (session_01UycqMHEcrUKuRXZ9RLdPm5): test runs 5, module lines 6
