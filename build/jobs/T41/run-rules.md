# run-rules (T41)

**Status** · session_0187g19zrVQbrTr8ZXnFsYpZ · depth 2 · WORKING · handled B4

## J1 · QUESTION

Four readings of R19/R20 I am building on now (best reading each; tell me if any is wrong):

1. **The set's path.** R19 says Civicsmith's test set's path is "at the job's START"; B1 names none. I hold it at `bio-plane/src/run-rules/test-set.mjs`, exported `CIVICSMITH_TEST_SET` `{id: "civicsmith", version: 1, matters: []}`, frozen, with `matterShape` describing a matter (`{id, title, body, documents, answers, answered_by}`). **The matters themselves are not mine to write**: they are real public matters with answers written by people (D11, D14 C). I ship version 1 empty; until matters are added (a new version, re-asking the bar), no record can pass on an empty set: `testBarHeld` refuses a record whose set has no matters. Who supplies the matters is BOB's/Bob's; I list it as deferred in my record.
2. **Where the gate reads the bar.** `deployable(mode, verifications)` keeps its signature and meaning (the chain only), so ai-runs' open (index.mjs:891) stays green until its own job. New: `TEST_BAR_PARTS` (frozen: `check`, `investigate`, `extract`, `plan`, `ask`, `enquire`, `explore` (the explorer's use), `draft:own_words`, `draft:translation`, `draft:case_account`, `draft:account_check`, `draft:bearing_note` (each draft kind, not the mode `draft` as one part), `transcribe`, `read` — named as credentials R55's use kinds), `checkTestBarRecord(r)` (R75's shape; C-22.22 `AI_TEST_BAR_UNFIT`, naming the field), `testBarHeld(part, records)` (a well-formed record with `passed: true` on Civicsmith's set at its current version) and `partDeployable(part, {verifications, testBars})` = the chain (for a chain mode) AND the bar. ai-runs T41-23 re-points its gate to `partDeployable`; check is then not deployable until its bar is held (that is the amendment's meaning).
3. **R20's retirements.** I remove `AI_USE_CEILING_REACHED` (C-109.8), `AI_USE_COPY_CEILING_REACHED` (C-109.9) and `AI_CEILING_INVALID` (C-109.12; K2400 retires it too though B1 names only two) from the table, and hold their numbers in a frozen `RETIRED_CHECKS` `{code: {check, retired_for}}` so they are never reused (tested). `NOT_YOUR_CEILING` (C-109.11) and `AI_NO_ACCOUNT` (C-109.10) stay. `AI_NO_ACCOUNT`'s translation adds "or the account that would serve has this use switched off" (where `AI_USE_SWITCHED_OFF` is not answered: the caller's choice; the row says both).
4. **R26's "no AI" refusal.** "refused inside the run whatever the bound" — the refusing site is the run's read (ai-runs/run-productions). I hold the pure judgement `checkPagesRead({material_limit, pages})` here minting C-22.23 `AI_RUN_READ_NO_AI` (row in my table, minted here), refusing whatever `pages` allows; `pages` joins `PLANE_COUNTED_BOUNDS`.

## J2 · COMPLETE

**Completion of T41-21 (run-rules).**

**Reading set.** My requirements, code (`bio-plane/src/run-rules/`, 5 files) and tests (7 files), layer 6's row of `build/layers.md`, the plan entry and K2373, K2394, K2400, K2405, K2418, K2448, `draft-T41-investigation.md` §3.6's run-rules and ai-runs R73–R76 lines, credentials R55–R57 and ai-use R10–R11: about 240 KB, under 300 KB, all read whole by me; no workers.

**Applied** (with B2's confirmation of J1, K2479; B3, B4's CHANGEs, K2482, K2485):
- R19 (test bar): `test-set.mjs` `CIVICSMITH_TEST_SET` v1 `{id: "civicsmith", version: 1, matters: []}` and `TEST_MATTER_SHAPE`; `test-bar.mjs` `TEST_BAR_PARTS` (14 parts), `TEST_BAR_RECORD`, `checkTestBarRecord` (C-22.22 `AI_TEST_BAR_UNFIT`), `testBarHeld`/`testBarHeldOn`, `partDeployable`/`partDeployableOn`. `deployable` stays the chain alone.
- R20: C-109.8, .9, .12 retired into frozen `RETIRED_CHECKS` (numbers never reused, tested); `AI_NO_ACCOUNT`'s translation adds the switched-off use; no row names a cost (D12).
- R23: `RUN_ORIGINS`, `originAllowed` minting C-22.25 `AI_RUN_ORIGIN_UNKNOWN` and C-22.27 `AI_RUN_EXPLORE_NOT_DEPLOYABLE` (B4's codes; one minting site here, ai-runs R73's open relays them). My first C-22.24 `AI_RUN_ORIGIN_NOT_ADMITTED` was never merged and is gone, so C-22.24 is B3's.
- R24: `ENQUIRE_MODE`, the `enquire` flag in `deployedModesFor` (false), `deployable("enquire")` apart, `startAllowed` member-only with its own detail.
- R25: `DRAFT_KINDS` +3; `DRAFT_REACH` (each kind's reach; `DRAFT_MODE.kind_reach`); `draftMayRead` unchanged (false for the three: their reading is their narrowed reach, not a member's grant, R22).
- R26: `pages` in `RUN_BOUNDS` after `proposals`, in `PLANE_COUNTED_BOUNDS`; `checkPagesRead` (C-22.23 `AI_RUN_READ_NO_AI`) refuses a read under a material limit covering `read`, whatever the bound. C-22.14's translation now names pages read.
- B3, B4: rows C-22.24 `AI_GROUP_TEST_INVALID`, C-22.26 `AI_RUN_EXPLORE_NEEDS_STEP`, C-22.28 `AI_RUN_STEP_UNKNOWN` (minted by ai-runs, read here by key), each tested.

**Deferred:** the set's matters (N829, B2): v1 is empty, so `testBarHeld`/`partDeployable` answer false for every part until a later version adds matters.

**Found in other modules (for BOB):**
- ai-runs (T41-23): re-point its gate (index.mjs:891, :2968) from `deployable` to `partDeployable(part, {verifications, testBars})`; relay `originAllowed`; `checkPagesRead` for the read inside documents.
- Generated artifact made stale: `agent-worker/dist/agent-worker.bundled.mjs` (its R45 static and fresh-build checks: `agent-worker/test/requirements.test.mjs` 2 FAIL, from `run-rules/checks.mjs`, `deployment.mjs`, `index.mjs`, `rules.mjs`). Not mine to write (§14); regenerate at L6's close. The plane bundle too (rule 4 (14)).

**Reds my merge adds (rule 4 (10); measured against the same suites with my change removed):**
- ai-runs `test/m/ai-runs/rows.test.mjs`:23 (R35), :33 (R39); `test/m/ai-runs/usage.test.mjs`:148, :189, :235, :303, :336, :352, :443 (R50/R52: the retired ceiling codes' rows are gone). Until T41-23.
- agent-worker `test/requirements.test.mjs` R45 (2 checks, the stale bundle above). Until L6's regeneration.
- None in answers, notice-producers, store-door, control-plane (their tests stub the codes), run-productions, capture-requests, skills, action-plans, answer-envelope, op-declarations, wizard-scripts, instance-setup, plane, affordances, queue or explore: their counts are unchanged (pre-existing reds only).

**Tests and checks:** `node --test bio-plane/test/m/run-rules/`: 41 pass, 0 fail. No layer tests in the manifest. `format`: 0 failures; `architecture`: 0 failures; `coverage`: 26 of 26 live ids, 0 failures; `ownership`: 0 failures.

Size (session_01MJD7M5yyv8XhLzeyFoE89c): test runs 9, module lines 2329
