# cause-assistant-t51 (T51)

**Status** · session_011AxVfrLbuAWxWCRogwpj27 · depth 2 · WORKING · handled B0

## Record

**C92 (agent-runner R42, R5, R40; instance-setup R17, R81, R82).** `RemoteSession` (`agent-runner/src/worker.mjs`) now answers `GET /remote/version` 200 `{ok: true, name: "agent-runner", version, capabilities: []}` (R5's shape, `version` the package's), and every other method and path, upgrade included, 503 `REMOTE_UNAVAILABLE` as before; no body read, no storage, no container. The chain was: `agent-worker` states `runner` in its `/version` from `remoteVersion(env).answered`, which was false on the 503; `instance-setup`'s `runnerReport` reads that `runner`, so `part_signin` read false. With the version answered, `runner` is true, `part_signin` true; `agent-worker` R110 still answers `ASSISTANT_REMOTE_NOT_READY`, because `remoteReady` also needs a passed check record at that version. Bundle `agent-runner/dist/` rebuilt with `npm run build` (never edited). Test first, seen failing (503 !== 200): `agent-runner/test/remote-session.test.mjs` (R42 C92, with a control that the default export is not the runner).

**C93 (instance-setup R17, R81).** Confirmed against K4178: the same cause as C92, not `deploy-fleet`'s binding derivation. The plane holds no `AGENT_RUNNER` binding by design (R17 reads the runner through agent-worker's `runner`); the members bootstrap read UNBOUND because agent-worker said `runner: false` on the 503. No instance-setup code changed: `bio-plane/test/m/instance-setup/t46.test.mjs` gains one test (R17 R81 R82 C92 C93) proving a not-ready runner reads `part_signin` true and SERVING through agent-worker's binding alone, with controls (runner refusing its version: false and UNBOUND; no binding: UNBOUND). It passed on first run because instance-setup was already correct; there is no failing run for that half, by design.

**Requirement lines owed (QUESTION to BOB):** `agent-runner` R42 and R36/R40 say `GET /remote/version` answers 503; they must read 200 in R5's shape (not ready), `agent-worker` R110 keeping the gate. Best reading is the change as built.

**Words:** no new member-facing sentence from this job; the 503 `REMOTE_UNAVAILABLE` refusal's word row (W22, later-ux) is the design stream's.

**Deferred:** none. **Found in another module:** none.

**Runs:**
- `node --test --test-force-exit agent-runner/test/`: 76 tests, 65 pass, 0 fail (11 suspended or skipped as before).
- `node --test --test-force-exit bio-plane/test/m/instance-setup/`: 217 tests, 217 pass, 0 fail.
- `checks/run.mjs`: architecture 0 failures; words 0 failures; coverage: agent-runner R37, R38, R40 named by no test (conditional on R38's proof, accepted red, not mine to change) and other modules' reds as listed by the check; format: 1 failure in `build/rulings.md:4298` (K4301, BOB's file), none in my files.
- `checks/ownership.mjs` per held module (see COMPLETE).

Size (session_011AxVfrLbuAWxWCRogwpj27): test runs 6, module lines 10
