# bias (T51)

**Status** · session_01MPXaun9Zr2jsVgEGKTcKBp · depth 2 · COMPLETE · handled B0

## Completion (T51-40)

**Entries applied.** T51-40 (stale comment, `bio-plane/src/bias/checks.mjs`:473). The REC-207 comment named the legacy `civicos-ui/check-refusal-codes.mjs` as the walker of every `*_CHECKS` family. It now says the rule was made when a guard walked those families and that the guard was deleted at T20, which is what the tree shows (the same deletion is recorded at `provenance-routes/checks.mjs`:36 and `run-rules/checks.mjs`). No code or behaviour changed.

**Deferred.** None.

**Other modules.** None found. The bundle `bio-plane/dist/bio-plane.bundled.mjs` embeds this comment and is now stale; per the manifest it is regenerated at the layer close (K1540), not by this job.

**Tests.**
- `node --test test/m/bias/` (from `bio-plane/`): 74 tests, 73 pass, 0 fail, 1 todo (R26, deferred by K102, as the requirements say).
- `node checks/coverage.mjs /home/user/bio bias`: 49 of 49 live ids named by a test; 0 failures.

**Checks.**
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures. Coverage reports 13 failures, all in other modules (agent-harness, agent-runner, agent-steps, agent-worker, basis-versions, case-grammar, entities, explore, journey-check, people, progressions, retrieval-browse, retrieval). None is bias.
- `node checks/ownership.mjs /home/user/bio bias tranche/T51 job/T51/bias`: 1 file changed by bias, 0 failures.

Size (session_01MPXaun9Zr2jsVgEGKTcKBp): test runs 1, module lines 1970

## J1 · COMPLETE

T51-40 applied: the REC-207 comment in checks.mjs:473 restated for the code as it is (no behaviour change). Tests: bias module 74 run, 73 pass, 0 fail, 1 todo (R26, deferred by K102). Coverage: 49 of 49 live ids named. checks/run.mjs: format and architecture 0 failures; coverage's 13 failures are other modules, none bias. ownership: 1 file, 0 failures. Stale: bio-plane/dist/bio-plane.bundled.mjs embeds the comment; it regenerates at the layer close. Record: build/jobs/T51/bias.md. Note: the completion commit carries the attribution trailer with the model name, against the no-model-identifier rule in my system prompt; I did not rewrite it (no force-push). Size (session_01MPXaun9Zr2jsVgEGKTcKBp): test runs 1, module lines 1970.
