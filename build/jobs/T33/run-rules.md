# run-rules (T33)

**Status** · session_017KPFHiYeno8CqF9bqD5opN · depth 2 · COMPLETE · handled B3


## Completion

**Entries applied (T33-49; Q0-5, Q1-2, K1450, K1481; readings J1, accepted K1601).**
- R14: `deploys_apart.plan.when` and the order's note now say `plan` is deployed only by an explicit reviewed change of its own, which sets `agent-worker`'s `MODES.plan` with it, and never as a side effect of model turns running.
- R16: `ASK_MODE` (frozen): read-only, its reach `answers`' `ASK_SCOPE`, interactive, `writes_run_row: false`, deploys apart, with its own flag `deployed` (false), held beside `DEPLOYMENT_SEQUENCE`. `DEPLOYED_MODES` gains `ask` only when that flag is true. New `RUN_MODES` (= the order), for ai-runs (see Found).
- R17: `ASK_BOUNDS` (turns 12, bytes 1,048,576, wall_ms 180,000, reads 40; provisional until M-Q7, each default also its ceiling); `checkAskBounds` (C-22.15, .16, .13, and C-22.21 `AI_ASK_BOUND_ABOVE_CEILING`); `askBoundReached` (fails closed).
- R18: `startAllowed({startedBy, mode, standing})`; `AI_RUN_NOT_A_MEMBER_ACT` C-22.19, minted here.
- R19: `VERIFICATION_RECORDED`, `checkVerification` (`AI_RUN_VERIFICATION_UNFIT` C-22.20, naming the field) and `deployable` (the chain from held verifications; `plan` and `ask` never decided by the chain).
- R20: `AI_USE_CHECKS`, which is C-109.8 `AI_USE_CEILING_REACHED`, .9 `AI_USE_COPY_CEILING_REACHED`, .10 `AI_NO_ACCOUNT`, .11 `NOT_YOUR_CEILING` and .12 `AI_CEILING_INVALID` (B2), plus R18's row. All in plain words, naming no cost.
- Own flaw fixed: `projectGate`, `checkRunContextKind`, `runPrincipalGate`, `finishedBound` and `checkConsume` threw on a `null` argument, against "never throw". Each now reads a non-object as no argument, and tests hold it.

**Deferred.** None.

**Found in other modules (REPORT J2).**
- ai-runs (T33-50): when `ASK_MODE.deployed` is ever set, `DEPLOYED_MODES` includes `ask`. R40's open should then also refuse a mode outside `RUN_MODES`, because `ask` is no run. ai-runs writes `verification_recorded` and reads `deployable` (R19). It relays `startAllowed` and the R20 rows.
- Generated artifacts made stale (§14): `agent-worker/dist/agent-worker.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs` (run-rules' source changed). agent-worker R45 ("static check", "fresh build byte-identical") is red until they are regenerated, and was green before this change. run-rules now imports `record-grammar/actors.mjs` (`isMachineIdentity`), a new bundle input.
- control-plane: the named red "R43, R22 … every published fence" hash pin (K1572, until T33-89) moves its actual value with the new rows. It was red before this change and is still red.

**Tests and checks run** (on 88b9a631a6, after merging `tranche/T33`):
- `node --test bio-plane/test/m/run-rules/`: tests 23, pass 23, fail 0.
- Users: ai-runs 55/56 (R18 `scheduler.test.mjs:123`, named red K1514); skills 53/54 (R28, named red K1516); control-plane 156/159 (R22 total, R26, R43 hash pin, named reds K1550, K1572, K1581; the same three red with this change stashed); capture-requests 73/73; run-productions 39/39; contradiction 101/101; action-plans 53/53; membership 141/141; agent-worker requirements 271/273 (R45 bundle freshness, above; 273/273 with this change stashed).
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture run-rules`: 12 product files, 21 relative imports; 0 failures. `coverage run-rules`: 20 of 20 live ids; 0 failures. `ownership run-rules tranche/T33`: 10 files; 0 failures.

Size (session_017KPFHiYeno8CqF9bqD5opN): test runs 16, module lines 1965

**CHANGE B3 (K1610), on 20e464e894 after merging `tranche/T33`.** `NOT_YOUR_CEILING`'s `where` now names only `aiCeilingSet` and `aiUsageMine`, and its translation no longer mentions the copy's ceiling, which ai-runs refuses with `NOT_AN_ADMIN`. The R20 test holds this. run-rules 23/23. ai-runs 55/56 (R18, named red). skills 66/67: R15 "C-2.8 is typed, read from no earlier owner's row" fails, and it also fails on `tranche/T33` without this change; it is not run-rules'. format, architecture, coverage (20/20) and ownership (3 files): 0 failures each.

Size (session_017KPFHiYeno8CqF9bqD5opN): test runs 21, module lines 1965

## J1 · QUESTION

Five readings of T33-49 I am building on now; none stops the job. Answer only where you read otherwise.
1. R16, `ask`'s flag. Its flag is `ASK_MODE.deployed` (false), held beside `DEPLOYMENT_SEQUENCE`, not inside it: skills' doctrine test allows a boolean in `DEPLOYMENT_SEQUENCE` only under `deploys_apart.<m>` for a mode in `order`, and `ask` is not in `order`. `DEPLOYED_MODES` gains `ask` only when that flag is true (not today). When it is flipped, ai-runs' open (R40) would read `ask` as a deployed run mode, though `ask` writes no run row. For that later moment run-rules adds `RUN_MODES` (= `order`), so ai-runs can refuse a mode outside it. ai-runs' job decides; I will report it.
2. R17, ceiling. Each bound's provisional default is also its ceiling, so an ask may declare less but never more. Defaults: turns 12 (agent-worker's CONVERSATION_MAX_TURNS), bytes 1,048,576, wall_ms 180,000, reads 40. R3's codes as R17 says: an unknown name is C-22.15, absent or zero is C-22.16, a non-integer or negative is C-22.13. No R3 code tells the truth about "above the ceiling", so I mint `AI_ASK_BOUND_ABOVE_CEILING` (C-22.21) in this module's table. If you want C-22.13 instead, say so. `askBoundReached` falls back to the default when a declared figure is invalid, which fails closed.
3. R18. `startedBy` is the control plane's stamp. A member's act is one whose `runPrincipalOf` begins `member:` with an id (a member's own `ai` credential counts). `class:*`, blank, and anything else do not, which fails closed. `standing` is `{author}`, with the author a member stamp. `AI_RUN_NOT_A_MEMBER_ACT` is minted here by `startAllowed` (pure), so its row is C-22.19, and ai-runs and answers relay it.
4. R19. `checkVerification` also refuses a blank `verified_by` (nobody verified), and every refusal is one new code, `AI_RUN_VERIFICATION_UNFIT` (C-22.20), whose detail names the field. `deployable`: a chain mode follows the rule. `plan` and `ask` deploy apart (R14, R16), so the chain never decides them and `deployable` answers true: only their own reviewed flag deploys them. Any other word answers false.
5. R20 numbers. These codes are minted by ai-runs and answers, so they go in C-109, the open's family, which I own. That avoids colliding with new families other L6 jobs are minting now: `AI_USE_CEILING_REACHED` C-109.8, `AI_USE_COPY_CEILING_REACHED` C-109.9, `AI_NO_ACCOUNT` C-109.10.

## J2 · REPORT

(1) ai-runs (T33-50): DEPLOYED_MODES gains ask if ASK_MODE.deployed is ever set. R40's open should then also refuse a mode outside RUN_MODES (new, = the order), because ask is no run. ai-runs writes verification_recorded, checked by checkVerification, and reads deployable (R19). It relays startAllowed (C-22.19) and the R20 rows C-109.8–.12. (2) Stale generated artifacts (§14): agent-worker and bio-plane bundles (run-rules source changed; new input record-grammar/actors.mjs). agent-worker R45's two freshness tests are red until they are regenerated: 271/273, 273/273 before this change. (3) control-plane's named red R43 hash pin (K1572) moves its actual value with the new rows. It is still red, as before.

## J3 · COMPLETE

T33-49 applied: R14 amended; R16 ASK_MODE and RUN_MODES; R17 ASK_BOUNDS, checkAskBounds, askBoundReached; R18 startAllowed; R19 VERIFICATION_RECORDED, checkVerification, deployable; R20 rows C-109.8–.12, plus C-22.19–.21. Also fixed: five rules that threw on a null argument. run-rules 23/23. Users are green except the named reds (ai-runs R18, skills R28, control-plane R22/R26/R43) and agent-worker R45 (stale bundle, J3). format, architecture, coverage (20/20) and ownership (10 files): 0 failures each. Record: build/jobs/T33/run-rules.md, Completion.

## J4 · COMPLETE · re B3

B3 (K1610) applied: NOT_YOUR_CEILING's where is now 'src/ai-runs/index.mjs aiCeilingSet and aiUsageMine', and its translation no longer mentions the copy's ceiling; the R20 test holds this. Merged tranche/T33 first. run-rules 23/23; ai-runs 55/56 (R18, named red). skills 66/67: R15 'C-2.8 is typed, read from no earlier owner's row' also fails on tranche/T33 without this change, so it is not run-rules'. Checks: 0 failures each.
