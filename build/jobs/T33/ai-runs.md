# ai-runs (T33)

**Status** · session_01GWgcYQuUzZUEFB4pASDvTC · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

T33-50 readings; I build on each and carry on unless you answer otherwise.

1. **R52, whose account a run carries.** At `open`, the account member is: the session member (`actor`) when the caller is a member's session; else the member in `principal_plane` (`member:<id>/<tok>`, a member-kind ai key); else (an organisation `class:ai/…` credential or a deploy token) the member the body's `principalClaude` names (`member:<id>`), as K1503 reads "the member whose act started it". `principal_claude` stores that member as `member:<id>` (agent-worker R10 reads `session.principal.claude` as the member). A body `principalClaude` that names another member than a member caller's own is ignored for the account (the stamp wins); absent stays C-33.29 (R9). No account held (`credentials.accountReferenceState` with the member as viewer, no unseal) → `AI_NO_ACCOUNT`, nothing written. Placed after R9's re-run refusals and before R47's check (R47 stays last); the ceiling (R50) right after it.
2. **K1514 / R18's dispatch.** The body stops sending `claude_accounts`; it sends `account`, the run's account member's reference from `credentials.accountReferenceFor({member, act:{kind:"run", member}})`, as R24 answers it `{kind, secret}` (agent-worker R6; a subscription token keeps `kind: "subscription"`, never re-labelled an API key, K1553). A run whose member holds none is withheld and named `NO_ACCOUNT` (with the other R18 grounds; the binding is not called); an unopenable seal is withheld `ACCOUNT_SEAL_UNAVAILABLE`. The R18 test is changed to that body.
3. **R50's measure.** "Tokens" = input + output + cache_creation + cache_read tokens (null = 0); "calls" = calls counted. Provisional default `AI_CEILING_DEFAULT = {tokens: 2,000,000, calls: 200}` per member per local day, until M-Q6. The copy ceiling is a per-member daily cap the administrator sets for every member; in force per figure = min(member's own or default, copy's). Own reached → `AI_USE_CEILING_REACHED`; else copy's → `AI_USE_COPY_CEILING_REACHED`. A figure set to `null` clears it (back to the default / no copy cap).
4. **R50 at a tick.** The tick's `usage` is validated first (R48, C-22.13, nothing written). If the member's use *before* this tick has reached the ceiling, the tick's usage entries are still counted (the calls were made; metering stays truthful) and the rest of the tick is refused with the ceiling code (no log entry, figure, lease or tick), answering `counted`.
5. **Rows not yet in any table.** R50 names `NOT_YOUR_CEILING`, and a malformed ceiling figure needs a code; neither has a row (run-rules R20 lists only `AI_USE_CEILING_REACHED`, `AI_USE_COPY_CEILING_REACHED`, `AI_NO_ACCOUNT`, `AI_RUN_NOT_A_MEMBER_ACT`). Reading: run-rules R20 gains `NOT_YOUR_CEILING` and `AI_CEILING_INVALID` (by CHANGE to RUN-RULES #6); until run-rules merges I take all six rows as an injected dep (K1563 (1)) and re-point at the real table before COMPLETE.
6. **Ops and zone.** `op=aiusage` answers `aiUsage` with `month` given (admin), else `aiUsageMine` (op-declarations R20's one spec); ceiling sets are `op=aiceilingset` and `op=aicopyceilingset` (`by` stamped) — op-declarations/control-plane need their specs (T33-88/89). The local day is `civil-time.localDay(at, retrieval.zone() ?? "UTC")` (retrieval R69, already a use).

## J2 · REPORT

T33-50 is built on `job/T33/ai-runs` (K1601 applied: the dispatch's `account` is `{kind, secret, member}`). My 66 tests pass (R48–R53 new in `usage.test.mjs`; K1514's R18 red fixed). One step is left before COMPLETE: re-pointing my tests from the injected rows to run-rules' real table once RUN-RULES #6 merges (K1563 (1)). My stand-in rows already copy its C-109.8–C-109.12 word for word.

**Reds in other modules caused by R52 (an open now needs the run member's own account).** Each opens a run with no member account (`principalClaude: "project"` from a session or deploy token, and no `accountReferenceSet`), so it is now refused `AI_NO_ACCOUNT`. Each is fixed in that module's own test by connecting the opener's account and naming the member, not by a change here:
- capture-requests `test/m/capture-requests/plane.test.mjs` ×4: R30; R16 R31 R14; R19 R42 R38; R14 (N295). They open at line 74 as RUTH.
- scheduler `test/m/scheduler/plane.test.mjs` "R12: a run waiting on a request that reaches expired…" (open at line 167).
- agent-worker `test/harness.test.mjs` REC100-0, -1b, -2, -2b, -2c (opens at 1670–1695 with a deploy token).
Every other user of ai-runs matches the tranche: run-productions 39/0, skills 53/1 (K1516's red), intent 64/1 (K1568's), action-plans 53/0, queue-producers 80/0, control-plane 156/3 (K1572 and K1581's named reds), plane 85/0, credentials 54/0, basis-versions 127/0, run-rules 16/0, affordances 165/2 (K1550 and K1571's).

**Code differences to know about.**
1. R50 says `aiCopyCeilingSet` refuses any other `by` with `NOT_AN_ADMIN` (membership's `notAnAdmin`), and I built that. RUN-RULES #6's `NOT_YOUR_CEILING` row, in its `where` and translation, says it is also minted by `aiCopyCeilingSet`. This module mints it only in `aiCeilingSet` and `aiUsageMine` (for a machine viewer). One of the two texts needs aligning (BOB's).
2. Services for other modules, beyond the requirement's names: `aiUseCheck({member, at})` returns null or the plain refusal (`AI_NO_ACCOUNT`, then the ceiling), and is what answers calls before an ask's first model call or a standing question's AI half (R50, R52). `providerLimit(said)` turns a relayed `enforced_spend_limit_reached` into the plain `AI_USE_CEILING_REACHED` (R50), for answers and agent-worker to use. The wake's own dispatch records it as `LIMIT`, in plain words. The exports are `AI_CEILING_DEFAULT` = {tokens: 2,000,000, calls: 200} (provisional, M-Q6), `USAGE_FIGURES` and `USAGE_TOKEN_FIGURES`.
3. Ops in `aiRunsOps`: `aiusage` (`month` → admin read, else the viewer's own; `viewer` stamped), `aiceilingset` and `aicopyceilingset` (`by` stamped). op-declarations and control-plane need their specs (L11).
4. An account reference that cannot be unsealed is found only at the dispatch, because the decision is synchronous. Its wake entry says "handed over", and the following entry records `REFUSED: ACCOUNT_SEAL_UNAVAILABLE` as a dispatch that did not complete. A member with no reference is withheld `NO_ACCOUNT` before the binding is called.

**For BOB's acts at my merge.** `uses` gains `civil-time`; architecture fails on that one edge until it is set (K1563 (3)). The marks "not yet met: T33-50" on R48–R53 can be struck; coverage is 44/44.

## J3 · COMPLETE

T33-50, K1514, K1601 and K1606 are applied on `job/T33/ai-runs` @ f35d151aad, merged with `tranche/T33` after run-rules.

**Entries applied**
- T33-50: R48–R53. Each model call's use is counted per member, local day and mode (`ai_usage`). Each member sets their own daily ceiling (provisional default `AI_CEILING_DEFAULT` = 2,000,000 tokens / 200 calls, until M-Q6), and an administrator can set a lower one for the copy. Both are checked at the open, the tick and through `aiUseCheck` for an ask. `op=aiusage`. The run's account is its member's (`principal_claude` = `member:<id>`). The tables are declared through `declareTable`.
- K1514: the dispatch no longer sends `claude_accounts`. It sends `account: {kind, secret, member}`, the run member's reference from `credentials.accountReferenceFor` (K1601). A subscription stays a subscription. A member holding none is withheld `NO_ACCOUNT`.
- K1606:
  - The open's mode must be one of `RUN_MODES`, deployed by its flag and `deployable` on the verifications the record holds. `ask` is refused C-109.1.
  - `startAllowed` is relayed: a machine credential naming no member gets C-22.19 before the account check.
  - `verificationRecord` (`op=airunverify`, `by` stamped) writes `verification_recorded` into `ai_mode_verifications`. It is append-only and judged by `checkVerification`; a run not held in that mode is refused C-22.20 with `field: "run"`. `verifications()` reads the records back.
- The tests now read run-rules' real rows. No injected rows are left.

**Deferred:** none.

**Found elsewhere (also in J2):**
- R52 turns these red in their own tests: capture-requests `plane.test.mjs` ×4, scheduler `plane.test.mjs` R12, agent-worker `harness.test.mjs` REC100-0/1b/2/2b/2c. Each opens a run whose member holds no account. Each module's test fixes it by connecting the opener's account and naming the member.
- run-rules' `NOT_YOUR_CEILING` row names `aiCopyCeilingSet` as a minting site. My R50 refuses a non-admin there with `NOT_AN_ADMIN`, and that is what I built.
- New ops need specs from op-declarations and control-plane: `aiusage`, `aiceilingset`, `aicopyceilingset`, `airunverify`.
- Services for answers and agent-worker: `aiUseCheck`, `countAskUsage` and `providerLimit`.

**Final uses:** the current ones plus `civil-time`. Architecture fails on that one undeclared edge until it is set (K1563 (3)).

**Tests and checks**
- ai-runs: 69 tests, 69 pass, 0 fail.
- Dependents:

| module | pass | fail | the fails |
|---|---|---|---|
| run-productions | 39 | 0 | |
| capture-requests | 76 | 4 | R52's, listed above |
| skills | 66 | 1 | K1516 |
| intent | 64 | 1 | K1568 |
| action-plans | 53 | 0 | |
| scheduler | 65 | 1 | R52's |
| queue-producers | 80 | 0 | |
| control-plane | 156 | 3 | named reds |
| plane | 85 | 0 | |
| credentials | 54 | 0 | |
| basis-versions | 127 | 0 | |
| run-rules | 23 | 0 | |
| affordances | 165 | 2 | named reds |
| agent-worker | 6 | 2 | harness: R52's; requirements R45: K1606's stale bundles |

- Checks:
  - format: 0 failures.
  - architecture: 1 failure, the `civil-time` uses edge.
  - coverage: 44 of 44.
  - ownership: 13 files, 0 failures.
- The marks "not yet met: T33-50" on R48–R53 can be struck.

Size (session_01GWgcYQuUzZUEFB4pASDvTC): test runs 18, module lines 3198
