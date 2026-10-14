# run-rules (T48)

**Status** · session_01VyeBhHhjeYG5M8LRhqnqL7 · depth 2 · COMPLETE · handled B0

## Completion (RUN-RULES #16)

**Read, whole (P20).** My requirements (R1–R33, public and private); the public parts of `record-grammar` and `observation-log`; layer 6's contract in `build/layers.md`; my entry T48-28 in `build/plan/current.md`; all my code (`index.mjs`, `rules.mjs`, `deployment.mjs`, `checks.mjs`, `test-bar.mjs`, `test-set.mjs`, `skill-version.mjs`) and all my tests (`helpers.mjs`, `words.mjs`, `rules`, `deployment`, `state`, `verification`, `ask`, `t41`, `t45`, `t46`, `table`).

**Applied** (commit on `job/T48/run-rules`):
- **R33** (T48-28; N670; DEC-127 (3)): `DRAFT_KINDS` gains `reading`, after `statusreport`. `DRAFT_REACH.reading` is `{scope: "none"}`: only the passage the door hands in. So `draftMayRead` is `false` for it whatever the rest. `draftKindDeployed` answers for it exactly as `draft`'s flag does, and `action_drafts` plays no part (the existing rule for every kind outside `ACTION_DRAFT_KINDS`). `TEST_BAR_PARTS` gains `draft:reading` because it follows `DRAFT_KINDS`. `startAllowed` answers for it as for any draft. Headers in `deployment.mjs` and `index.mjs` now say so.
- Tests: new `t48.test.mjs`, seven tests naming R33: the kinds and their order; R21's mode in every other respect; the flag over every combination of `draft` and `action_drafts`; the test-bar part; the reach, with the control the requirement names (`draftMayRead({kind: "reading", suggestions: true})` is false where `own_words` is true); the start, with its refusal and control; and that it never throws. `t45.test.mjs` (`LATER` gains `reading`) and `t46.test.mjs` (`statusreport` now sits directly after the action drafts rather than last) follow the new last kind. No assertion was weakened.

**Flaw in my module, fixed (P8).** Four comments still cited `credentials` R56 and R57, which N996 re-pointed in my requirements to `ai-accounts` R11 and R22. They are fixed in `rules.mjs` (R26's `pages` bound and `checkPagesRead`) and `checks.mjs` (C-22.23 and C-109.10). These were comments only, so behaviour is unchanged.

**Deferred.** None.

**Found in other modules.**
1. **`agent-worker`'s generated bundle, staled by this change** (mechanics §14; I did not write it). `agent-worker/test/requirements.test.mjs` R45 reports "STALE BUNDLE": `run-rules/checks.mjs`, `deployment.mjs`, `index.mjs` and `rules.mjs` are inputs to `dist/agent-worker.bundled.mjs`. It is regenerated at L6's close (`node bio-plane/scripts/bundles.mjs`) or by AGENT-WORKER's job. The plane bundle is staled the same way, which rule 5 (5) covers.
2. Users of `DRAFT_KINDS` (I ran each, a provided service having changed). These are green: ai-use 68/0, ai-runs 102/0, run-productions 58/0, skills 118/0, question-explorer 32/0, case-disclosures 99/0, agent-harness 33/0. capture-requests fails 116/6 and agent-worker 13/4 (files), each exactly as on the unchanged head (stashed baseline). The fixture's member cannot sign in ("the fixture's member could not sign in"), so these are inherited reds and none is caused here.

**Tests and checks** (on `job/T48/run-rules`):
- `run-rules`: 67 pass, 0 fail.
- `format`: 168 modules, 0 failures. `architecture run-rules`: 18 product files, 0 failures. `coverage run-rules`: 33 of 33 live ids named, 0 failures. `ownership run-rules tranche/T48`: 8 files, 0 failures.
- `checks/run.mjs` over the product: format 0 and architecture 0 failures (3287 files). Coverage has 36 failures, none of them run-rules'; they are other modules' ids not yet met. Channels 0.

Size (session_01VyeBhHhjeYG5M8LRhqnqL7): test runs 15, module lines 2544
