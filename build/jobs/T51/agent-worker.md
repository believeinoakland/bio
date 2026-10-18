# agent-worker (T51)

**Status** · session_01RTunPjz5nMUCRagijvxJzE · depth 2 · WORKING · handled B1

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
