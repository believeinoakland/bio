# agent-worker (T51)

**Status** · session_01RTunPjz5nMUCRagijvxJzE · depth 2 · COMPLETE · handled B1

## Record

**Entry** · T51-65 · agent-worker (N1205, N1218). Model claude-sonnet-5-5, medium effort.

### Before agent-steps merges (B1 notes 1)

- Read whole: `build/requirements/agent-worker.md`, `build/extraction/agent-steps.md`, `agent-worker/src/index.mjs` (2,362 lines before my edit).
- **Done:** the stale comment at `index.mjs`:287 (`civicos-ui/check-refusal-codes.mjs`, deleted in T20) now reads "DEC-49's guard has never walked the fleet", the rest of the paragraph unchanged. A comment only; `node --check` passes.
- **Baseline of the module's tests with that edit:** `npm test` in `agent-worker/`: 25 of 26 suites pass; `requirements.test.mjs` 303 pass, 1 fail, and the one is R45 "the static check finds nothing": the committed bundle is stale against the edited `src/index.mjs`. Expected: any source change stales the bundle, which BOB regenerates at L6's close (manifest §14); I do not build it. Nothing else is red.
- **Plan for the deletion, on BOB's CHANGE (agent-steps merged):**
  1. Merge `tranche/T51`; re-take the line ranges of the map's §2 in `index.mjs` (they shifted by -1 after line 287).
  2. Delete from `index.mjs`: `MAX_STEPS`..`modelHalf` (map §2, 1,493 lines), keeping `DEFAULT_MAX_TURNS_PER_SEGMENT`, `BOUND_SOURCE`, `AI_TOKEN_SHAPE`; delete `reads.mjs`, `holdings.mjs` and the three declarations (`MEANING_ARM`, `RESPONSE_ID`, `SEGMENT_END_BY`) from `ops.mjs`.
  3. Import from `agent-steps`: `driveHarness, MAX_STEPS, planeAnswer, publishedPack, loadableLayers, loadLayer, modelHalf, SEGMENT_END_BY` (and `toolContent` in `ask.mjs`, `draft.mjs`, `action-drafts.mjs`); drop the imports of `agent-harness`, `subsession.mjs`, `run-rules`, `record-grammar/ids.mjs`, `query.mjs`, and the `agent-model` names only the moved code used.
  4. Build `STEPS_HOST = { askPlane, refusal, planeSilent, planeRefused, modelSilent, modelRefused }` (R43 of agent-steps) after the four fixed refusals; `segmentAnswer` calls `driveHarness(STEPS_HOST, env, {...})`; update the header comment by a sentence naming `agent-steps`.
  5. Re-point the tests' imports (`MEANING_ARM`, `SEGMENT_END_BY`, `RESPONSE_ID`, the plane-stub fixtures); delete the suites and fixtures the map's §7 lists as moved, only those `agent-steps` actually carries; re-point the `*.control.mjs` string pins that name moved text.
  6. Run every remaining suite unchanged but for imports (R119), then the checks.
- **Not mine, to report:** the bundle `agent-worker/dist/*` is stale from now on (this comment edit, then the split); `agent-harness/src/harness.mjs` line 5 names `MEANING_ARM` as agent-worker's (map §10).

## J1 · REPORT

Pre-merge part done. The stale comment at index.mjs:287 is fixed (comment only). I read the requirements, the split map and index.mjs whole, and recorded the deletion plan in my record. Module tests with that edit: 25 of 26 suites pass; the one red is requirements.test.mjs R45, the committed bundle being stale against the edited source (expected; you regenerate it at L6's close, I do not). Waiting for your CHANGE once agent-steps has merged.

### Completion (B2 CHANGE: delegate to agent-steps)

**Entries applied (T51-65).** Merged `tranche/T51` (agent-steps in). `agent-worker/src/index.mjs` no longer holds the segment driver, steps, sub-sessions or shared readers: it imports `driveHarness, MAX_STEPS, planeAnswer, publishedPack, loadableLayers, loadLayer, modelHalf, SEGMENT_END_BY` from `agent-steps` and hands `driveHarness` the host `STEPS_HOST = { askPlane, refusal, planeSilent, planeRefused, modelSilent, modelRefused }` (agent-steps R43). Deleted `reads.mjs`, `holdings.mjs` and `MEANING_ARM`, `RESPONSE_ID`, `SEGMENT_END_BY` from `ops.mjs`. `ask.mjs`, `draft.mjs`, `action-drafts.mjs` import `toolContent` from `agent-steps`. The stale comment at `index.mjs`:287 is fixed. `src` is **2,724 lines** (R119: under 4,000).

**Tests.** Deleted what the map moved and `agent-steps` carries identically: `r096`, `r101`, `r103`, `t49r90` suites, and the four `plane-*.mjs` fixtures (remaining suites import them from `agent-steps/test/`, as the map says). Kept, per B2: `versions.test`, `versions.control`, `fanout.test` Part A (Part B deleted, moved), the `r107` NO_ACCOUNT control (rewritten as a small suite on the shell's wire, naming R6 and R57), `plan.test`'s R53 section (the PLANE_OPS arm and the two request-field arms with the rest of R53). Imports re-pointed (`MEANING_ARM`, `SEGMENT_END_BY` from `agent-steps`). R45's input list now names the `agent-steps` files (R119 control) and no longer `reads.mjs`.

**Control drivers re-pointed** (they edit real source by exact string; each arm that quotes moved text now patches the `agent-steps` file, and the fan-out measured is `agent-steps`' suite): `harness.control` (H6, H8, T1, T2, D2, S2), `agent-worker.control` (D1–D5), `cascade.control` (3), `versions.control` (1), `t41.control` (5, 8, 9), `t46.control` (2–5 and the sign-in payer arm), `wire-vocabulary.control`. Three anchors were already stale before the split and are re-anchored (H6's tick, A9's `ids`, t46 arms 2 and 3). Results: harness T1/T2/H6/H8/D2/S2 armed; agent-worker D1–D5 AS DECLARED; cascade 4/4; versions baseline 20/0 with arm 1 red as declared; t41 9 pass 0 fail; t42 17/0; t46 13/0; t47 12/0; wire-vocabulary 4/4. Every restore verified by sha256 and cmp; `git status` clean of `agent-steps` after.

**Tests run.** `npm test` in `agent-worker/`: 21 of 22 suites pass (fewer files after deletions); the one red is `requirements.test.mjs` R45, **the bundle stale** (below), nothing else.

**Checks.** format: 0 failures. ownership: 0 failures. coverage: agent-worker not among the failures (the 22 failures listed are other modules'). architecture: **5 failures, all mine and all one cause**: `requirements.test`, `versions.test` and `wire-vocabulary.test` import the fixtures `agent-steps/test/plane-*.mjs` and `agent-steps` is not yet in my `uses` in `modules.json`. They clear when BOB adds it.

**For BOB.** (1) `modules.json`: add `agent-steps` to agent-worker's `uses`. (2) The bundle `agent-worker/dist/*` is stale (source changed twice); regenerate at L6's close (`agent-worker/`: `npm run build`); the manifest row then names agent-steps. (3) `agent-harness/src/harness.mjs` line 5 still says `MEANING_ARM` is agent-worker's `ops.mjs` (it is `agent-steps`' `names.mjs`): the next agent-harness job. (4) A flaw in agent-steps' tests, not mine: none found.

Deferred: none.

Size (session_01RTunPjz5nMUCRagijvxJzE): test runs 12, module lines 2724

## J2 · COMPLETE

agent-worker delegates to agent-steps (R119). src is 2,724 lines. Moved code, reads.mjs, holdings.mjs and the three ops.mjs names deleted; STEPS_HOST built; stale comment fixed. Moved suites and fixtures deleted; the kept arms stay as you listed; the control drivers are re-pointed to agent-steps' files and re-run (all as declared). npm test: only requirements R45 red, the stale bundle. Checks: format 0, ownership 0, coverage clean for agent-worker. Architecture: 5 failures of mine, one cause: tests import agent-steps fixtures and agent-steps is not yet in my uses. For you: (1) add agent-steps to agent-worker's uses in modules.json; (2) regenerate the stale agent-worker bundle at L6's close; (3) agent-harness/src/harness.mjs line 5 names MEANING_ARM as agent-worker's (now agent-steps' names.mjs). Details in my record.
