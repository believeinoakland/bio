# promotion (T16)

**Status** · session_01SV3MUwaJQVfxezqBTByPmU · depth 2 · WORKING · handled B1

## J1 · QUESTION

Entry (2), N242's share: "C-102.9's region carries no code". The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) fails `src/gate.mjs` `caseCatalogueFailed` as a CODELESS REFUSAL: `{gateVersion, ok: false, findings, warnings}` has no `code` and no `reason`. My best reading, which I am building: the case gate's C-102.9 answer keeps R29's four keys and gains the module's usual refusal keys beside them, `reason` and `code` `CASE_CATALOGUE_FAILED`, with `check` C-102.9 and its `translation` from `REGISTRATION_CHECKS`; its one finding is unchanged. Ratification's `op=caseratify` is unaffected (it tests `gate.reason && !Array.isArray(gate.findings)`, and `findings` stays an array, so it still answers GATE_REFUSED). This moves `registry.test.mjs`'s "R29's shape, whole (N275)" assertion (`Object.keys(r)` exactly the four), which I re-anchor to "R29's four keys, plus the refusal's code and row". If you read R33 as forbidding keys beyond R29's four, say so and I will instead leave the answer's shape and report the guard's arm as the guard's to read the finding's `check`.
