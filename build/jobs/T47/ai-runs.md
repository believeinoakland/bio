# ai-runs (T47)

**Status** · session_01WhvPxECaVfyVKTtYstmezH · depth 2 · WORKING · handled B2

## Completion

**How the reading set was read (mechanics §17).** Whole: `build/requirements/ai-runs.md`; `bio-plane/src/ai-runs/index.mjs` (all 3,462 lines at START) and the tests I changed (`world.mjs`, `t46.test.mjs`, `scheduler.test.mjs`) plus `open.test.mjs`'s R40 test. Of the used modules, only the services my Uses names for this entry: `credentials` R63 (`aiRunCredentialMint`, `aiRunCredentialsEnd`, `AI_RUN_WRITES`), R70 (`subscriptionTokenHold`, `accountFor`'s held sign-in) and their code; `agent-worker` R5, R6, R80 for the wire shape. The other test files were not read whole (over the limit), and no helper digest was needed: none of them depends on the dispatch or the sign-in path, and all pass unchanged.

**Entries applied (T47-20).**
- **R79** (K3060 D10, K3068): the dispatch carries a held sign-in's token, `accountFor`'s `key`, as `account.secret`, as it carries an API key's. The T38 "no secret" sentence and its code are retired (`#accountFor`, `#aiRunDispatch`). The token is never logged, stored or answered.
- **R18, T47 clause** (N955): `dispatchMemberRun({run, by, at})` takes no credential; one given is never read. A run is hers when its `principal_plane` is `member:<id>` or `member:<id>/<tokenId>`. After the principal, status, mode, `AGENT_WORKER_UNBOUND`, `NAMESPACE_UNDETERMINED` and account refusals, it mints through `credentials.aiRunCredentialMint({member, run, writes})` with `AI_RUN_MODE_WRITES[mode]` (exported, frozen: check's four, plan's `airuntick`, `optionpropose`, `airunclose`). A mint refusal is answered unchanged with `dispatched: false`; a mint that throws or answers nothing is withheld `CREDENTIAL_RECORD_SILENT`. The body is `{run_id, store, credential: <minted token>, account}`, no `token_id` (B2, K3087). The T46 page-held credential path is gone, along with the withheld `MEMBER_PRINCIPAL_RUN` for a run her session opened.
- **R14** (N955): after the one exit commits an ending, `credentials.aiRunCredentialsEnd({run})` is called. Its answer and any throw are ignored, so the exit and its answer are unchanged. This covers close, a bound-exhausting tick and the reaper alike.
- **R40** (N949): wording only. Its test title now says "a mode whose own flag in DEPLOYED_MODES is set, check and plan today". No behaviour moved.
- **K3084**: `scheduler.test.mjs` and `t46.test.mjs` now connect a sign-in with its token held (`world.signin`, credentials R70's `subscriptionTokenHold`), clearing their 6 reds.

**A decision of mine (P8), stated.** When the group's keep-away is on, `accountFor` refuses before the mint is reached. `dispatchMemberRun` now relays that `AI_KEPT_AWAY` refusal unchanged (nothing sent), instead of reading it as "another account" (`MEMBER_PRINCIPAL_RUN`). This is the same answer R18 gives a mint refused `AI_KEPT_AWAY`. Every other non-sign-in answer is still withheld `MEMBER_PRINCIPAL_RUN`, as T46 had it. The tests cover both paths: keep-away on through the real modules, and the mint itself refusing.

**Own code read whole (P20).** The only flaw I found was the stale T38 sign-in comments, which are now corrected. Nothing is deferred.

**Found in other modules (reported to BOB).**
- `plane`: `bio-plane/test/m/plane/t46.test.mjs` "R33 (T46; trial finding 4 …)" fails, and fails identically without this job's change. It connects a sign-in by the fact alone (credentials R70), as my tests did before K3084, so it is plane's own inherited red.
- `control-plane` (`index.mjs`:2084) still passes `credential: presented` to `dispatchMemberRun`. This is harmless, because the argument is ignored now, and its retirement is T47-65/T47-66's.
- Generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` contains ai-runs and is now stale; BOB regenerates it at the layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/ai-runs/*.test.mjs`: tests 102, pass 102, fail 0.
- Users of the changed service (P11): `plane/t46.test.mjs` + `control-plane/t46-door.test.mjs`: 23 tests, 22 pass, 1 fail (the inherited plane red above).
- `format`: 0 failures. `architecture ai-runs`: 0 failures. `coverage ai-runs`: 49 of 49 live ids named, 0 failures. `ownership ai-runs tranche/T47`: 6 files, 0 failures.
- `checks/run.mjs`: architecture 0 failures; coverage 43 failures, none in ai-runs (inherited); format 0; channels 0.

Size (session_01WhvPxECaVfyVKTtYstmezH): test runs 9, module lines 3660

## J1 · QUESTION

R18 (T47 clause): 'The segment then carries the minted token and its tokenId to agent-worker's /run (its R6 wire shape, as above)'. agent-worker R6's wire shape has `credential` (the token) and no tokenId field. My best reading, which I am building: the body is `{run_id, store, credential: <minted token>, account}` exactly as today; the tokenId is not sent, because R6 takes no such field and agent-worker looks the credential up by its hash (admission R10). If you want a `token_id` field added to the body, say so and I will add it (agent-worker would need to accept it). Nothing else waits on this.
