# case-authoring (T29)

**Status** · session_01GeKDKfZzHTVtMfNysZDXp7 · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

B2 applied and pushed (`job/T29/case-authoring` @ HEAD): the moved code, `materials.mjs`, `accepted.mjs`, the moved renderers and the C-120 rows are deleted; `publishCase` asks case-disclosures in R55's order; my tests 122/122 (R55 new: `disclosures.test.mjs`). Module 2,937 lines.

**Question (needs your file, `build/modules.json`):** my architecture check fails only because case-authoring's `uses` lacks `case-disclosures` (6 failures, all that edge). Please add `"case-disclosures"` to case-authoring's `uses`.

**My final uses (best reading of "record your final uses"):** the module's own code now imports only record-grammar, record-core, membership, inquiry, basis-versions, strength, bias, observation-log, reevaluation, publication, ratification, case-grammar, network-notices and case-disclosures, and reads provenance's, content's and extraction's tables under their stated read contracts (keep provenance, content, extraction). Its tests still import `contradiction`, `attestation`, `capture`, `sources`, `case-import` (and case-import's test fixture), `inquiry-grammar`, `promotion` and `credentials`, to build the real world `publishCase` runs over and to compare against their answers. The architecture check applies `uses` to tests too, so those stay unless you rule otherwise: if you want them gone, say so and I will rework the fixture (a sizeable change). Until you answer I keep them, and I change nothing else in `modules.json`'s entry.

Users unchanged (re-exports kept; `caseAuthoringOf(host, {contradiction, attestation, …})` still passes those to case-disclosures on first creation; `get attestation()` passes through). Tests of every importer: 1,397 pass, 3 fail, all control-plane: families.test.mjs ×2 (pre-existing on tranche/T29, as you named) and catalogue-end.test.mjs "R43, R22: every code decorated…" (`CO_ATTESTATION_UNACKNOWLEDGED lost its row`), same cause: `CHECK_FAMILY_FILES` lacks case-disclosures' `checks.mjs`, and now that my copy is gone (K529) the C-120 codes are undecorated until control-plane's L11 entry.
