# action-plans (T19)

**Status** · session_01GeDnFhMQe67MnTepUEKx3b · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Done on job/T19/action-plans (pushed, a33348e1da): rule 1's re-points (doc.mjs:7 parseFrontmatter, index.mjs:59 isMachineIdentity, proposalLabel, normalizeType, fixture.mjs:19 parseFrontmatter) to record-grammar; no action-plans file imports bio-checks.mjs. N432: optionPropose reads two stamps, `proposer` for the label (R11) and `principal` for the run gate (R31, runPrincipalGate against the run's principal_plane); actionPlansOps passes the query's `principal`, never the body's. Tests: the R11 R31 test now uses control-plane's two stamps (proposer class:ai/tok-1, principal member:bob/tok-1), with an absent principal, a mismatched one, and a run whose principal equals the label all refused AI_RUN_NOT_PRINCIPAL; the ops test shows both stamps read from the query. The new tests fail on the old one-stamp code (4 fail) and pass now: 38/38.

Remaining: N427 (R18, R29). It needs actions' `contactNotAMember` and `contactId` (R45) and action-clocks' `reminderRefused` (R4) on tranche/T19. action-clocks has its export on its job branch (not merged); actions has not started. I wait for a CHANGE or RESUME saying both are on tranche/T19, then merge it, drop the two roll-back probes, re-run steps 5-7 and post COMPLETE.

For BOB at the merge (not mine to edit): action-plans no longer imports legacy-checks, so `build/modules.json`'s uses entry `legacy-checks` and the requirements' Private Uses line naming `legacy-checks` for `isMachineIdentity`, `proposalLabel` and the `PLN-` registration are stale; both now come from record-grammar (its R1, R3, R15, R35, R38).

## J2 · COMPLETE

COMPLETE on job/T19/action-plans @ 7001c615a8 (tranche/T19 merged in at a25dd20bc8, after B2).

Entries applied:
- Rule 1, the record-grammar re-points: doc.mjs:7 `parseFrontmatter`; index.mjs:59 `isMachineIdentity`, `proposalLabel`, `normalizeType`; fixture.mjs:19 `parseFrontmatter`. No action-plans file imports bio-checks.mjs.
- N432 (R11, R31): `optionPropose` reads two stamps. `proposer` sets the label and decides machine work (R11); `principal` is what `runPrincipalGate` compares with the run's `principal_plane` (R31). `actionPlansOps` reads both from the query, never from the body.
- N427 (R18, R29): `optionStart` asks the contact question before any write, as actions' write asks it (`contactId`, then `membership.memberFacts`), and answers through `contactNotAMember()`. `optionDispose` judges reminders before any action exists and answers through `reminderRefused(arm, detail, extra)` (arm `entry` or `on`). Both roll-back probes (`#contactRefusal`, `#reminderRefusal`) are deleted.

Rs met, each with its test (BOB strikes the marks, K775 (6)):
- R11: runs.test.mjs "R11 R31: a machine's proposal names a running planning run of this plan whose principal is the principal stamp…" (labelled by its proposer `class:ai/tok-1`, never the principal); invariants.test.mjs "R1 … R11 … R31 R34: actionPlansOps reaches each service with the stamped author, viewer, proposer and principal…".
- R31: the same two tests. A missing principal stamp, a wrong one, a proposer naming the run's principal, and a run whose principal equals the label are each refused AI_RUN_NOT_PRINCIPAL; a principal in the body never stands in for the stamp.
- R18: start.test.mjs "R18: a chosen option starts an action carrying…". The refusal equals `contactNotAMember()` for `nobody`, `member:nobody` and a stated blank contact; a spy shows no actionCreate or reminderSet call is made.
- R29: start.test.mjs "R29: choosing a dated option holds the member's reminders…". Each refusal carries action-clocks' row (check, translation) and its arm (`entry` for no such date, a non-list or a non-chosen disposition; `on` for a missing or bad day); the spy shows no action write is made.
- The new R18 and R29 assertions fail on the probe code (2 fail); the new R11 and R31 assertions failed on the one-stamp code (4 fail).

Deferred: none.

Found in other modules:
- Uses: action-plans no longer imports legacy-checks, so `build/modules.json`'s `uses` entry `legacy-checks` and the requirements' Private Uses line naming `legacy-checks` (for `isMachineIdentity`, `proposalLabel` and `PLN-`) are stale. They now come from record-grammar (R1, R3, R15, R35, R38).
- Red on tranche/T19 @ a25dd20bc8 itself, the same counts with and without this job's change:
  - queue-producers: 14 pass, 32 fail. All 32 fail with "no such table: signers", a fixture-schema gap: its world no longer gets credentials' `signers` table since the split.
  - affordances: 119 pass, 4 fail. Three R19 reasoned-act tests (consequencerevise/addressedrecord, intent's defer giving INTENT_NO_REASON, triage) and one R8 R18 contradictionresolve test (its fixture inquiry is refused BASIS_REFUSED C-2.8, concluded with no leg).
  - control-plane: 84 pass, 1 fail, R22 "CHECK_FAMILIES is total" (a module's DEC-49 rows not reached by the list).
- Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (not_product) holds the old action-plans source; it is regenerated at the layer close.

Tests and checks run:
- action-plans: 38 pass, 0 fail.
- The modules that use action-plans: skills 39/39, op-declarations 16/16, run-rules 16/16, legacy-store 4/4, ai-runs 56/56, escalation 32/32; affordances, queue-producers and control-plane as above, unchanged from the base.
- format: 87 modules, 82 requirements files; 0 failures.
- architecture: 13 product files, 44 relative imports; 0 failures.
- coverage: 34 of 34 live requirement ids named by a test; 0 failures.
- ownership: 6 files changed by action-plans between tranche/T19 and HEAD; 0 failures.

Size (session_01GeDnFhMQe67MnTepUEKx3b): test runs 14, module lines 2516
