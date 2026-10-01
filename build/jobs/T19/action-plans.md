# action-plans (T19)

**Status** · session_01GeDnFhMQe67MnTepUEKx3b · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · REPORT

Done on job/T19/action-plans (pushed, a33348e1da): rule 1's re-points (doc.mjs:7 parseFrontmatter, index.mjs:59 isMachineIdentity, proposalLabel, normalizeType, fixture.mjs:19 parseFrontmatter) to record-grammar; no action-plans file imports bio-checks.mjs. N432: optionPropose reads two stamps, `proposer` for the label (R11) and `principal` for the run gate (R31, runPrincipalGate against the run's principal_plane); actionPlansOps passes the query's `principal`, never the body's. Tests: the R11 R31 test now uses control-plane's two stamps (proposer class:ai/tok-1, principal member:bob/tok-1), with an absent principal, a mismatched one, and a run whose principal equals the label all refused AI_RUN_NOT_PRINCIPAL; the ops test shows both stamps read from the query. The new tests fail on the old one-stamp code (4 fail) and pass now: 38/38.

Remaining: N427 (R18, R29). It needs actions' `contactNotAMember` and `contactId` (R45) and action-clocks' `reminderRefused` (R4) on tranche/T19. action-clocks has its export on its job branch (not merged); actions has not started. I wait for a CHANGE or RESUME saying both are on tranche/T19, then merge it, drop the two roll-back probes, re-run steps 5-7 and post COMPLETE.

For BOB at the merge (not mine to edit): action-plans no longer imports legacy-checks, so `build/modules.json`'s uses entry `legacy-checks` and the requirements' Private Uses line naming `legacy-checks` for `isMachineIdentity`, `proposalLabel` and the `PLN-` registration are stale; both now come from record-grammar (its R1, R3, R15, R35, R38).
