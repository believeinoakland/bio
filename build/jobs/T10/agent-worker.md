# agent-worker (T10)

**Status** · session_019AMVanykGp758UHakTRzV2 · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

**Applied.** N153, my share (R11): a resumed run continues at the state `op=airun` publishes (ai-runs R19), and starts from the `resume` row when there is none.
- Every tick after the gate publishes the table's own scratch as `state`: the step it moves to, the pass, and what that step works from (`targets`, `reports`, `reportsRefused`, `rereads`, `holdings`, `candidates`, `queue`, `submission`, `refusal`, `refusedSubmission`, `adjusted`; `harness.mjs` `RESUMABLE`). The mode, target, pass limit and budget stay the record's and are never read from the state. There is no transcript in it (DEC-61), and the spawn contracts are not in it either, because each `fanout` composes them afresh. The gate's tick publishes nothing.
- On a segment's start, `resumeFrom(session.state)` gives the step to continue at. The gate still runs first (R14). `resume` then goes to that step, and the `resume` row's `to` now lists every row after the gate. A state that names no step (null, or the `{}` a run opens with), names a step that is no row after `resume`, or has a pass that is not a whole number ≥ 0 starts at `plan`, and the resume row's `why` says which case it was.
- The row-to-row move is now the pure `advance(state, decision)`. It is the move the tick publishes and the driver applies, so the two cannot disagree.
- Commit d0ba76fb1a; `tranche/T10` merged in first.

**Fixed in my own suites (all four red or blind on the tranche before this change, from layer 5):** `harness.test` A5, A8 and `fanout.test`'s D-129 pin scanned `airun.mjs` for `OBSERVATION_LEVELS`/`OBSERVATION_STATES` blocks that now come from observation-log. They import the vocabulary instead. `harness.test`'s REC-100 real-plane fixture was refused `NO_OBJECTIVE` (intent R1), so its project now states `objective:` in its front matter. `requirements.test` R24's verbatim-resubmit arm used a second segment re-forming the same candidate, which N153 removes by design. It now forms it again in a second pass of one run. `harness.control` H6 was re-anchored to the tick call's new text and run: AS DECLARED.

**Deferred.** None.

**For you (BOB):**
1. R45 is red on my branch until the bundle is rebuilt: `dist/agent-worker.bundled.mjs` is stale after my change to `src/harness.mjs` and `src/index.mjs`. You said you rebuild it at the close, so I left it alone.
2. R11's `(not yet met: T10, N153)` mark can be struck. The requirement is met and tested.
3. ai-runs (not mine): `tick`'s `state` is stored as given, with no bound on its size (R12; the `state` TEXT column). A run's principal can write any amount into it on every tick. Mine writes at most the table's fields: reports are bounded by R20, and there are at most 20 citations. ai-runs may want a byte ceiling with a refusal, like its other figures (REC-169).

**Tests** (after the change, on the merged branch):
- agent-worker: 139 passed, 0 failed
- cascade: 29 pass, 0 fail
- fanout: 185 passed, 0 failed
- harness: 260 passed, 0 failed
- requirements: 243 passed, 2 failed (both R45's stale bundle, item 1)
- versions: 22 pass, 0 fail
- wire-vocabulary: 83 passed, 0 failed
- harness.control H6: AS DECLARED
- Legacy suites that drive this member (legacy-tests'): d260-resume 25 pass, 0 fail; fence-e2e 55 pass, 0 fail.

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 29 product files, 69 relative imports; 0 failures
- coverage: 48 of 48 live requirement ids named by a test; 0 failures
- ownership: 7 files changed by agent-worker between tranche/T10 and HEAD; 0 failures

Size (session_019AMVanykGp758UHakTRzV2): test runs 32, module lines 3253

## J2 · REPORT · re B2

B2 was already applied in J1 (commit d0ba76fb1a), so there is nothing new to push. harness.test's A5 and A8 and fanout.test's D-129 pin now read `OBSERVATION_LEVELS` and `OBSERVATION_STATES` through the plane's export (P7), not by scanning source text. harness: 260 passed, 0 failed; fanout: 185 passed, 0 failed. R45's freshness arms (2) read red until your rebuild at the close; I did not rebuild. My state stays COMPLETE.
