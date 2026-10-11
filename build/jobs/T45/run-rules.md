# run-rules (T45)

**Status** · session_01DETMLAxY6u5dz56gNM7dy6 · depth 2 · COMPLETE · handled B3

## J1 · REPORT

**The action drafts' read reach and `credentials`' grant list (B1 asked me to say whether I found otherwise).** I found otherwise. `credentials`' `AI_GRANT_OPS` (`bio-plane/src/credentials/index.mjs`:74) holds no read op of an action, a plan, a determination or correspondence: none of `action`, `actions`, `plan`, `plans`, `planproposals`, `determination`, `determinations`, `actionquotes` (all declared non-mutating in `op-declarations`) is on it. Its record reads are `standard`, `standards`, `standardinforce`, `search`, `frontier`, `meaningrows`, `entity`, `timeline` and the like. So under R27 as worded ("through the record reads the grant already admits, no op added"), an `infractiondraft` can read the matter's standards and search results but not its plan, actions, correspondence or findings by op, and a `bearingdraft` can read neither the action nor the reply. Either `credentials` adds those read ops to `AI_GRANT_OPS` (a change to its R28 list, BOB's), or `agent-worker` R76 hands the draft the records it is asked about in the request, as the translation draft is handed its words. run-rules is right either way: R27's `DRAFT_REACH` and `draftMayRead` say what the drafts may read, not which op serves it. I changed nothing outside my module.

**Generated artifacts staled by my change.** `agent-worker/dist/agent-worker.bundled.mjs` (run-rules is one of its inputs): `agent-worker/test/requirements.test.mjs` R45 "the static check finds nothing" and "a fresh build is byte-identical to the committed bundle" fail with my change and pass without it. The plane bundle too, as every merge stales it (rule 4 (5)). Both are regenerated at the layer's close.

**`skills` reads the explorer's origin by position.** `bio-plane/src/skilldoctrine.mjs`:1825 takes `RUN_ORIGINS[RUN_ORIGINS.length - 1]` as the explorer's origin. An origin appended to R23's list would silently become the explorer's label. I left `RUN_ORIGINS` alone for that reason (R28 put it to my wording). Reading it by key, `"explore"`, as `question-explorer` does (`index.mjs`:61), would remove the trap: a small change for `skills`' next job.

## J2 · COMPLETE

**Entries applied.** T45-10 (R27), with B2 and B3 (R28, K2820, K2822); `tranche/T45` merged for R28's text.
- R27 (`deployment.mjs`): `DRAFT_KINDS` gains `textcheck`, `infractiondraft` and `bearingdraft` after R25's three. `ACTION_DRAFT_KINDS` names the three. `DRAFT_REACH` gains their reach: `textcheck` scope `none`; `infractiondraft` scope `matter_record` (its plan, actions, correspondence and findings, through the asking member's grant); `bearingdraft` scope `action_reply`. `draftMayRead` answers true for `infractiondraft` and `bearingdraft` whatever `suggestions` while `firsthand` is absent, null or false, and false for `textcheck`. Its answers for the other five kinds are unchanged. `ACTION_DRAFTS` is the one flag, `action_drafts`, false today, and `DRAFT_MODE.action_drafts` names it. `deployedModesFor` accepts the flag and moves no mode for it. `draftKindDeployed({kind, flags})` is new. The test bar's parts gain `draft:<kind>` for each, by construction.
- R28 (`checks.mjs`, `rules.mjs`): `AI_RUN_PLAN_CHECKS` gains C-109.13 `AI_RUN_REEXAM_NEEDS_RESPONSE` and C-109.14 `AI_RUN_REEXAM_OPEN`, each with the `where` you gave and a DEC-83 translation (the sentence, then the remedy). `originAllowed({origin, mode, investigateDeployable})`: in mode `plan`, `member` and `reexamination` only, anything else `AI_RUN_ORIGIN_UNKNOWN`. Outside `plan`, or with no mode, it is unchanged, and `reexamination` is refused there.
- **My wording call on R28's open point:** `RUN_ORIGINS` stays `["member", "explore"]`. A planning run's origins are a new frozen `PLAN_ORIGINS`, `["member", "reexamination"]`. Reason: `skills`' `skilldoctrine.mjs`:1825 reads the explorer's origin as `RUN_ORIGINS`' last member, so appending would silently mislabel it. That fragile read is reported below.

**Flaw fixed in my own module (P8).** For every draft kind, `startAllowed`'s refusal detail said "a draft of a member's own words". It now says "a draft, of whatever kind, starts only at the act of the member who asked for the help…". R18's two tests follow it.

**Read whole (P20):** my requirements; my code (`index.mjs`, `rules.mjs`, `deployment.mjs`, `checks.mjs`, `skill-version.mjs`, `test-bar.mjs`, `test-set.mjs`); every test under `bio-plane/test/m/run-rules/`; `BIO_Action_v0_2.md`; K2780, K2781, K2787 (later K2820, K2822); draft-T45-lower §10 and doubt 12; the public parts of `record-grammar` and `observation-log`; layer 6's contract.

**Tests changed for the amended requirements (none weakened):** `ask.test.mjs` R22: the "every kind but own_words is false" arm now names R27's two that read. `t41.test.mjs` R25: pins the first five kinds; `t45.test.mjs` pins all eight. `table.test.mjs` R11/R15: the two new rows; R12 covers the new texts.

**Deferred.** None.

**Found in other modules.** See J1 (REPORT): the grant list does not admit the action drafts' reads; `skills` reads the explorer's origin by position; `agent-worker`'s bundle is stale.

**Tests and checks.**
- run-rules: tests 49, pass 49, fail 0. New `t45.test.mjs` names R27 (6 tests: the whole `draftMayRead` and `draftKindDeployed` tables) and R28 (2 tests).
- Users: ai-use 68/0, ai-runs 81/0, run-productions 58/0, capture-requests 108/0, question-explorer 28/0, case-disclosures 95/0, action-plans 63/0, answer-envelope 31/0.
- skills 103/2: R28 and R30 "the Action document is canon", inherited (rule 4 (10)).
- plane 194/2: rule 4 (9) and (11).
- agent-worker `requirements.test.mjs` 303/2: R45, the bundle is stale from my change (305/0 without it); generated artifact, regenerated at the layer's close.
- `bio-plane/test/system/migrate-released.test.mjs` was still running at this post: 190 PASS lines, no FAIL so far. I will post again only if it fails.
- format: 0 failures. architecture: 0 failures. coverage: 28 of 28, 0 failures. ownership: 9 files, 0 failures.

Size (session_01DETMLAxY6u5dz56gNM7dy6): test runs 14, module lines 2412
