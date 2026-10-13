# agent-model (T47)

**Status** · session_01BU1bQnhpmnD4TghBiv62gD · depth 2 · COMPLETE · handled B0

## J1 · QUESTION

R16 "Headers" says the upgrade request carries `x-civicsmith-trace` and `x-civicsmith-member-ref` "when the caller gave them", but names no parameter by which the caller gives them. My reading, which I am building on: two optional arguments, `trace` and `memberRef`, on both calls: `converse({..., trace, memberRef})` and `modelCall(reference, request, {runner, trace, memberRef})`. Each is sent as its header only when it is a non-empty string (at most 200 characters, else dropped) and does not contain the reference's `secret`; neither is sent on the `GET /version` probe or to the Messages API. agent-worker (T47-80, R83) would pass them this way. Also my reading of order: an unusable reference (`ACCOUNT_REFERENCE_UNUSABLE`) first, then a missing `secret` (`SIGNIN_NOT_HELD`), then a missing runner (`RUNNER_NOT_CONFIGURED`). I carry on with this; nothing waits on the answer unless you name other names.

## Completion (AGENT-MODEL #8)

**Read, whole:** `build/requirements/agent-model.md` (public and private); `build/layers.md`'s layer 6 contract; my entry in `build/plan/current.md` (T47-78) and BOB's START notes; the draft `build/plan/draft-T47-L6-connect.md` §0–§2 (§1.2 is my entry's text; §1.1, §1.3–§1.5 for agent-runner R28's wire and agent-worker R82–R83's callers); my code whole (`model.mjs`, `signin.mjs`, `apikey.mjs`, `outcome.mjs`) and my one test file, `agent-model.test.mjs`, whole (P20). My Uses are empty (`modules.json`), so no public part was owed.

**Applied (T47-78, R16):**
- A `signin` reference is `{kind: "signin", member, secret}`. `secret` goes only into the conversation request's credential, `{kind: "signin", member, secret}`, the first frame of each connection to the member's own instance. It is never in a relayed result, the upgrade request, the `GET /version` ask, the transcript, an outcome, `usage` or `detail`.
- Every sign-in outcome passes through `scrubDeep` (new in `outcome.mjs`). It replaces any copy of the secret a runner, binding or binary echoes with `[secret]`, and returns the value unchanged when it holds none. A model's closing text echoed into the transcript is scrubbed too.
- A `signin` reference with no non-empty string `secret` is refused `SIGNIN_NOT_HELD`, with no call of any kind. The order is: `ACCOUNT_REFERENCE_UNUSABLE`, then `SIGNIN_NOT_HELD`, then `RUNNER_NOT_CONFIGURED` (J1's reading).
- The runner's `SIGNIN_NOT_HELD` and `SIGNIN_TOKEN_REFUSED` pass through with that type and message, never reworded. The existing `ending()` path already did this; tests now pin it.
- **Trace headers.** `converse({…, trace, memberRef})` and `modelCall(reference, request, {runner, trace, memberRef})` send `x-civicsmith-trace` and `x-civicsmith-member-ref` on the upgrade request. Each is sent only when it is a non-empty string of at most `TRACE_HEADER_MAX` (200) characters that does not hold the secret. Neither goes to `/version` or to the Messages API. `TRACE_HEADER`, `MEMBER_REF_HEADER` and `TRACE_HEADER_MAX` are exported. This is J1's reading; BOB had not answered when I completed.
- The apikey path is unchanged; the control test confirms its headers, body and outcome are identical with or without the trace arguments.
- R2's test title now names the credential `{kind: signin, member, secret} (R16)`, and the shared `SUB` fixture carries a sentinel token. That strengthens R8's existing "SENTINEL nowhere" check to cover the token as well.

**Deferred:** nothing. I found no other flaw in my module.

**Other modules (REPORT to BOB):**
- `agent-worker`: 4 of its 16 test files go red against this change: `ask`, `t41`, `t46` and `requirements`. Each red is one of two kinds:
  - **The missing token.** Its sign-in tests send `{kind: "signin", member}` with no secret. They now get `SIGNIN_NOT_HELD`, and several assert "no secret" in the credential. This is exactly agent-worker's own T47-80 (R82: a `signin` account carries `secret`, handed to agent-model as `{kind: "signin", member, secret}`), which is ordered after T47-78.
  - **The stale bundle.** R45's bundle checks fail because `agent-worker/dist/agent-worker.bundled.mjs` bundles agent-model's source. That is agent-worker's generated artifact (manifest §14), regenerated at the layer close. I wrote none.
  - Before my change, the same suite had 0 failures.
- For agent-worker's R83: the trace and member reference reach agent-model as `trace` and `memberRef` (above).

**Tests and checks:**
- `node --test agent-model/test/`: 24 tests, 24 pass, 0 fail. The three new tests each name R16: the secret's one route, with echoes scrubbed; `SIGNIN_NOT_HELD` and the runner's two codes; the headers, with the apikey control.
  - Negative control: with `src/` reverted, the R16 tests fail.
- `node --test agent-worker/test/` (the one module that uses agent-model): 16 files, 12 pass, 4 fail, as reported above. Before this change: 0 fail.
- No layer tests are named in the manifest.
- `checks/format.mjs`: 166 modules, 164 requirements files, 0 failures.
- `checks/architecture.mjs … agent-model`: 0 failures.
- `checks/coverage.mjs … agent-model`: 16 of 16 live ids named, 0 failures.
- `checks/ownership.mjs … agent-model tranche/T47`: 5 files, 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (3071 files), channels 0. Coverage has 43 failures, all in other modules (rule 5's inherited reds) and none in agent-model.

Size (session_01BU1bQnhpmnD4TghBiv62gD): test runs 7, module lines 2374

## J2 · REPORT

agent-worker (T47-80, ordered after mine): with R16 in, 4 of its 16 test files go red (ask, t41, t46, requirements). The cause is its sign-in fixtures sending {kind: signin, member} with no secret: they now get SIGNIN_NOT_HELD, and several assert 'no secret'. This is its own R82. Its R45 bundle checks also fail because its committed bundle includes agent-model's source; that is its generated artifact, regenerated at layer close, and I wrote none. Same suite before my change: 0 fail. For its R83, the trace and member reference go to agent-model as converse({..., trace, memberRef}) and modelCall(ref, req, {runner, trace, memberRef}) (J1).

## J3 · COMPLETE

T47-78 applied: R16 met, 24/24 agent-model tests green, format/architecture/coverage/ownership 0 failures. Record: build/jobs/T47/agent-model.md on job/T47/agent-model. J1 (trace parameter names) still unanswered; built on my reading.
