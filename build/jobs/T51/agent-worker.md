# agent-worker (T51)

**Status** · session_01Q1D6kBgnDn6yvv4dNUHmVW · depth 2 · COMPLETE · handled B7

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

### Completion (B3 START, B4 CHANGE: the words pass, T51-209)

**Entries applied.** All 44 conversion findings, the 35 `plain` findings and the 5 test copies of `build/plan/words-pass/agent-worker.md`, and B4's fold of `+` chains (civicos-process d424c32). Model prompts (`system` of `/draft`, action drafts, translation, reading, `/transcribe`), tool descriptions, tool results to the model and refusal details are `localize('agent-worker.<stem>.<slug>', en, vars)`, text unchanged character for character; wire shapes with braces (`{op: …}`, `{page, media_type, data}`) are passed as variables. Tests compare with `localize` by equality (`t35` R64 rows cut at the variable part; `t42`, `t48`, `harness.test` R59 firsthand sentence). `harness.test` FT0's codes are read from the plane fixture's `WIRE_CHECKS` and `NOT_PRINCIPAL`. `PLANE_OPS` keys in `ops.mjs` are now quoted: the check read only string literals, so the member's own declaration of its ops looked foreign to the hand-list arm (owners.mjs, plan.test, requirements 1428). `requirements.test` R37's list of byte-serving ops (not this module's, not importable below layer 8) is replaced by: no answer the suite received carries a data URL or long base64 run.

**Judged no member reads, for the design's unkeyed list** (still failing the check until BOB lists them): `ops.mjs`:26, :27, :50, :53 (`PLANE_OPS` `why` fields, developer documentation of why an op is called). The codemod had already keyed :29 and :31 of the same table; those two rows would also be unkeyed text. `MODEL_TURNS` (`index.mjs`, the `/version` answer's `model_turns`) is a diagnostic statement, left as a literal; the check no longer flags it after the `+` fold.

**Control drivers** re-run against the new text: `t42` 17/0 (arm 14 re-anchored), `t47` 12/0 (arm 9 re-anchored; it needs an id absent from the list, because the list wins), `t41` 9/0, `t46` 13/0, `cascade` 4/4, `agent-worker` 15/15 as declared, `wire-vocabulary` 3/3, `versions` baseline. `harness.control` 12 of 13: F4 never armed, because its anchor `cancelled: "a member stopped it"` in the plane's `ai-runs` source is gone; not mine (another module's source).

**Tests.** `npm test` in `agent-worker/`: 21 of 22 suites; the red is `requirements.test.mjs` R45, the bundle stale (both R45 lines), nothing else. **Checks.** format 0; architecture 0; coverage: agent-worker not among failures; ownership 0 (16 files); words: only the 4 lines above; `setup-words build --check`: stale-rows note only. `checks/run.mjs`'s other failures are other modules'.

**For BOB.** (1) the bundle `agent-worker/dist/*` is stale (R45); regenerate at the layer close. (2) `agent-steps` still needs listing in `uses` (B2). (3) The words check reads only string-literal ops, not identifier keys: consider that for the hand-list arm. (4) `harness.control` F4's anchor in `bio-plane/src/ai-runs` (the `cancelled` sentence) is stale. (5) Rows added to the design's review list: about 70 new `agent-worker.*` ids.

Size (session_01WuXNA6bcbYEWzWXRuvLaq3): test runs 14, module lines 2598

## J3 · COMPLETE

Words pass applied (T51-209, B3, B4): all 84 findings keyed or compared by localize, text unchanged; 4 ops.mjs why strings left for the design's unkeyed list. npm test: only R45 (stale bundle). Controls re-pointed and green but harness F4 (anchor in ai-runs, not mine). Checks: format 0, architecture 0, ownership 0. Details and 5 items for you in my record.

### Completion again (B6 CHANGE, K4018)

Merged `tranche/T51`. The 7 test copies of sentences other modules now localize are compared with the product's own call (same id, en): `agent-harness.harness.the_one_question_the_runs` and `.the_runs_context_question` (`agent-worker.test`, `harness.test`, `requirements.test`), `agent-steps.work.the_cited_record_names_no_source` (`requirements.test`), and the label `the AI's reading`, which `transcribe.mjs` now writes by `localize("agent-worker.transcribe.the_ais_reading", …)` and `t42.test`, `t46.test` compare by the same call. `t42.control` arm 16 mutates the route sentence under an unlisted id (the list wins over `en` since R6's rows). Words check over agent-worker, agent-harness, agent-steps: no agent-worker finding but the four accepted `ops.mjs` strings. `npm test`: 21 of 22, the red R45 (stale bundle); `t42.control` 17/0, `t46.control` 13/0.

Size (session_01WuXNA6bcbYEWzWXRuvLaq3): test runs 17, module lines 2598

## J4 · COMPLETE

B6 done: the 7 test copies compare by the product's own localize call (same id, en); transcribe.mjs's label now a localize; t42.control arm 16 re-anchored. Words check clean for agent-worker but the 4 accepted ops.mjs strings. npm test: only R45 (stale bundle). Ownership 0.

## J5 · COMPLETE

B7 START (K4033, K4018) applied. Entry: F4 control arm re-anchored on the call `cancelled:  word("run-rules.member_stopped"),` in bio-plane/src/run-rules/rules.mjs; replacement is another key of the same table, `word("run-rules.run_finished_work")`; mustFail prose no longer quotes the sentence. Copied sentences dropped at harness.control.mjs:481 and harness.test.mjs ~1223 (comment) and ~1229 (title). Test-only; no code or provided service changed.

Verified: F4 armed alone -> AS DECLARED (run-rules R1 file 9/1 FAIL, harness 263/0, restore verified sha256 + cmp). npm test in agent-worker: 22 suites, 21 pass, 1 fail: requirements.test R45 (committed bundle stale vs src, expected; regenerate at L6 close). checks: format 0; architecture 0; coverage 68/68; ownership 0; words check (agent-worker) 0 findings; setup-words --check stale-rows note only; run.mjs failures are all in other modules (none in agent-worker).

K4018 item: agent-harness/src/harness.mjs:5 already names MEANING_ARM as agent-steps' (no change needed here; it is agent-harness's file).

Not changed, noted: two comments still quote 'a member stopped it' (agent-worker/test/harness.control.mjs ~442; agent-worker/test/harness.test.mjs ~419). The words check does not flag them.

Deferred: none.

Size (session_01VygDm8poigwmA9K5dkYQrM): test runs 4, module lines 2598
