# agent-worker (T50)

**Status** · session_01ExtfTo6iBGUSsaBuUqEFKD · depth 2 · WORKING · handled B1

## J1 · QUESTION

QUESTION (J1) on R110/R111, my best reading, for BOB to confirm or change. I carry on with R109, R112–R117 meanwhile.

1. **Where the "passed check" is recorded.** R111 says a pass "is recorded in the member's REMOTE instance with the version (R110 reads it)", but agent-runner R36–R40 define no route that records or returns it. My reading: the REMOTE class (agent-runner, your CHANGE to that job) answers two routes on the member's instance: `POST /remote/check` body `{version}` (records a pass) and `GET /remote/check` → `{ok: true, checked: true|false, version}`. R110's gate reads the second; R111's `check` step makes the first call. Until agent-runner has them, a gated call is refused 503 `ASSISTANT_REMOTE_NOT_READY`, which is what K3610 wants. If you would rather agent-worker kept the record in its own SEGMENTS storage (inside my module, no change to agent-runner), say so and I build that instead.
2. **"From another version"** I read as: the recorded version differs from the `version` that `GET /remote/version` answers now (the REMOTE class's own version).
3. **Who the gate covers.** Only a `signin` account (it is the only kind that reaches REMOTE). An `apikey` account is unchanged (R109's control). If R110 should also stop API-key conversations, that is a requirement change.
4. **`GET /version` has no member**, so "REMOTE answers `GET /remote/version`" is asked of a fixed instance named `version`.
5. **Not yet merged here:** agent-harness R19's `disagreementsToSettle`, agent-model R23's `judgeTools(levels, conditions)` and R24. I build R116/R117 against their requirements, reading those names defensively until your CHANGE says they are merged.
