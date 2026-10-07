# run-rules (T35)

**Status** · session_015HzCVxrJMyWr1JRGzKPFBw · depth 2 · WORKING · handled B2

## Completion

**Entry applied: T35-43** (N686; K1837, K1841, K1941; req: R16, R18 amended, R21 new). In `deployment.mjs`: `DRAFT_MODE`, frozen, describing the mode `draft` (interactive, `writes_run_row: false`, keeps nothing, read-only within `answers`' `ASK_SCOPE` with no write op, a `firsthand` field reading nothing, bounded by `ASK_BOUNDS`, `deploys_apart: true`, `deployed: false` until the change that serves `agent-worker`'s `POST /draft`); `deployedModesFor(flags)`, the one computation `DEPLOYED_MODES` is (`DEPLOYED_MODES = deployedModesFor()`), so each apart mode (`plan`, `ask`, `draft`) is deployed exactly when its own flag is a literal `true` and no other flag moves it (J1, answered B2, K1982); `deployable("draft")` answers as the other apart modes (no part of R19's chain). `RUN_MODES` and `DEPLOYMENT_SEQUENCE.order` are unchanged, so a run opened in mode `draft` stays refused by `ai-runs` R40 (C-109.1). In `rules.mjs`: `startAllowed` with mode `draft` and no member's act is `AI_RUN_NOT_A_MEMBER_ACT` whatever `standing` holds, with its own detail (the standing exception is `ask`'s alone); a member's act starts a draft as before. C-22.19's translation already reads true of a draft; unchanged.

**Tests.** `ask.test.mjs`: "R16 (T35)" (every combination of the chain's verification and the `plan`, `ask`, `draft` flags; `draft` alone, `ask` alone as the control; only a literal `true` deploys; inherited keys are no flags), "R18 (T35)" (a draft with a member's act, with none, and with a `standing` author, refused) and "R21" (`DRAFT_MODE`'s description whole, its flag false, not in the order, `deploys_apart` or `RUN_MODES`, no part of R19's chain, bounded by `ASK_BOUNDS` through `checkAskBounds` and `askBoundReached`). `table.test.mjs` R12 reads `DRAFT_MODE` and the draft refusal's detail; `verification.test.mjs` R19 holds `draft` beside `plan` and `ask`.

**Found in other modules (REPORT J2):**
- Generated artifact made stale (mechanics §14): `agent-worker/dist/agent-worker.bundled.mjs` (and its `.bundle.json`) embeds run-rules; `agent-worker/test/requirements.test.mjs` R45's two arms ("the static check finds nothing", "a fresh build is byte-identical") fail with this change (291/2; 293/0 on the tranche). BOB regenerates it at the layer's close, as B1 says.
- `build/requirements/run-rules.md`: R16, R18 and R21 still carry `*(not yet met: T35)*`; they are met by this job (BOB's file).

**Deferred:** nothing.

**Tests and checks run** (after merging `tranche/T35` @ B2's commit):
- `node --test bio-plane/test/m/run-rules/`: tests 27, pass 27, fail 0.
- Users' tests: ai-runs 71/0, run-productions 39/0, capture-requests 86/0, skills 67/0, answers 34/0, agent-harness 31/0; control-plane 179 pass, 3 fail, the same three on the tranche without this change (accepted reds 19, 26, 29); agent-worker `requirements.test.mjs` 291/2, R45's stale-bundle arms above (its other suites 8 pass).
- `format`: 130 modules, 129 requirements files; 0 failures.
- `architecture run-rules`: 12 product files, 21 relative imports; 0 failures.
- `coverage run-rules`: 21 of 21 live requirement ids named by a test; 0 failures.
- `ownership run-rules tranche/T35`: 7 files changed; 0 failures.

Size (session_015HzCVxrJMyWr1JRGzKPFBw): test runs 8, module lines 2022

## J1 · QUESTION

R16 as amended asks that `DEPLOYED_MODES` hold `ask` and `draft` "each exactly when its own flag is true", and the requirements' test note asks for a flip of each flag alone. `DEPLOYED_MODES` is a frozen constant computed from frozen flags, so a test at the interface cannot flip one. My best reading, which I have built: `deployment.mjs` exports one pure function, `deployedModesFor(flags)` (`flags` may name `verification_recorded`, `plan`, `ask`, `draft`; a name left out takes today's value), and `DEPLOYED_MODES` is `deployedModesFor()`, so the constant and the judged function are one computation. Nothing else changes for any user. Question: may it stay exported, with R16's Provides line (`DEPLOYMENT_SEQUENCE, GATE_ADDRESS, DEPLOYED_MODES, DEFAULT_MODE`) gaining `deployedModesFor` and `DRAFT_MODE` in your wording? I carry on on this reading.
