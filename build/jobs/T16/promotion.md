# promotion (T16)

**Status** · session_01SV3MUwaJQVfxezqBTByPmU · depth 2 · WAITING ON BOB (J1) · handled B2

## Progress (working notes; the Completion section supersedes)

- (1) N361's share, done: `gate.mjs` and `promotion/index.mjs` no longer import `checkCaseDocument`; `runCaseGate`'s catalogue has no default, and with none it answers C-102.9 as R29's verdict. Tests re-anchored on a recorded catalogue and on that refusal.
- (2) N242's share, per B2 (K534): the answer keeps R29's shape; the guard's codeless arm at `caseCatalogueFailed` is legacy-tests'.
- (3) The stamp: census diffed against 1.45.0 (875 rows before membership: 50 arrived, 3 `where`s changed, each named by a T15 record). **Next step:** when MEMBERSHIP #9 merges, merge `tranche/T16`, re-read the census (C-96.15, and C-96.16 per K535), move `CATALOG_VERSION` to 1.46.0, re-pin `ROW_CENSUS`, then steps 5–7.

## J1 · QUESTION

Entry (2), N242's share: "C-102.9's region carries no code". The DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`) fails `src/gate.mjs` `caseCatalogueFailed` as a CODELESS REFUSAL: `{gateVersion, ok: false, findings, warnings}` has no `code` and no `reason`. My best reading, which I am building: the case gate's C-102.9 answer keeps R29's four keys and gains the module's usual refusal keys beside them, `reason` and `code` `CASE_CATALOGUE_FAILED`, with `check` C-102.9 and its `translation` from `REGISTRATION_CHECKS`; its one finding is unchanged. Ratification's `op=caseratify` is unaffected (it tests `gate.reason && !Array.isArray(gate.findings)`, and `findings` stays an array, so it still answers GATE_REFUSED). This moves `registry.test.mjs`'s "R29's shape, whole (N275)" assertion (`Object.keys(r)` exactly the four), which I re-anchor to "R29's four keys, plus the refusal's code and row". If you read R33 as forbidding keys beyond R29's four, say so and I will instead leave the answer's shape and report the guard's arm as the guard's to read the finding's `check`.
