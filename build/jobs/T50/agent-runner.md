# agent-runner (T50)

**Status** · session_015C9SKzHdvKkAX6rzVop4aT · depth 2 · COMPLETE · handled B1

## J1 · BLOCKED

BLOCKED · cause: needs Bob · R38 step 0 (how the credential reaches the copy and is held) fails before any request can be made.

**Step.** R38 step 0. **Request.** None could be sent: no code path exists by which this module's code, on biosmoke8, obtains a credential that can create a Claude Code cloud session. **Answer.** The documents' own words, read whole at START:
- `build/terms/anthropic.md` AT-22 (the token R27 mints, the only sign-in a copy holds): "It can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors." So the sign-in biosmoke8 holds cannot do step 1.
- `fold-T50-remote.md` Settled 1 (SRS R7-R10): the only documented session creation is the CLI (`claude --cloud`, `claude -p --cloud`), which needs a claude.ai login with scope `user:sessions:claude_code` made by the binary's own `claude auth login` in a process. That process is the container R35 disables (K3611). The sessions service the study lane used (`/v1/code/sessions`, K3537) is undocumented for third parties; no token API, SDK or third-party scope exists.
- The one path left for this module's own code would be to run Claude Code's OAuth login itself (Claude Code's client, outside the binary) to mint a sessions-scoped login, then call the undocumented service. I have not built or tried it: it is not "Claude Code run as published" (AT-14, R22), AT-21 limits OAuth to "ordinary use of Claude Code and other native Anthropic applications", and plan rule 9 forbids running a remote cell from a session's own tools. Whether to go there is Bob's (terms, P17), not a job's.

**Also, for BOB (structure, not Bob's):** R38 says the steps "run through agent-worker R111's `check`", but R111 is CONDITIONAL on R38 (note 5: built only on your CHANGE that the proof passed), so as written the proof has no caller until it has passed. And the proof needs this module's code deployed to biosmoke8 (a deploy no START names).

**Options for Bob (from fold-T50-remote Unknown 1, 3):** (a) routine fire, the documented fallback: a routine and token each member makes by hand on the web, start only, the answer by write-back at the door, text at most 65,536 characters, 30 fires an hour (DRR §2, §7); (b) keep a container for the login only (`claude auth login`, 30-day, renewed by the member), which reverses part of K3611; (c) the member's API key only, no subscription path; (d) wait for a documented sessions API. My reading: (a) is the only one that is documented and keeps R35; it needs Bob's decision on per-member hand setup.

**What I do now (note 2):** R35 (410 `LOCAL_RUNNER_DISABLED`, the class's fetch tests marked suspended) and R39 (the copy's own log, built as the step recorder the proof and R36 would use, tested on a stub interface), then COMPLETE with R36, R37, R38, R40 recorded not met. Nothing past step 0 is built.

## J2 · COMPLETE

COMPLETE · T50-64 · R35 and R39 met; R36, R37, R38, R40 not met (R38 blocked at step 0, J1, needs Bob). Merge at once (N1197, K3611).

**Entries applied.**
- **R35** `AgentRunner.fetch` (`src/worker.mjs`) answers every request 410 `application/json` `{"ok":false,"code":"LOCAL_RUNNER_DISABLED"}` and writes one `runner.local.disabled` line `{event, method, path_template, status: 410}`, before any `containerFetch`, start or storage access; the WebSocket upgrade gets a plain 410. The former pass-through is kept, unreached, as `passThrough` (with the hold, R26's answer and R30's lines it made), so lifting R35 is one line. Bundle regenerated (`npm run build`, sha256 d440482993…).
- Suspended, not deleted (`{ skip: 'suspended while R35 holds…' }`): the 10 tests that drive the class's `fetch`: worker.test R12 ×3, hold.test R25 ×3, R26, R30 ×2, R34; and container.test's R13 R10 egress test (it observed the container's start, which never happens now). A new live R13 R10 test reads the egress from the class's own declared fields and the library proxy given them, so R10/R13 stay tested.
- **R39** `src/remote-log.mjs`: `remoteLog({trace, memberRef, conv, log}).step(name, run)` writes exactly one `remote.runner` line per step (also when the step throws), from a closed field list (`trace, member_ref, conv, step, outcome, code?, status, ms, bytes_in, bytes_out, session_ref?`); `session_ref` is the first 12 hex of the session id's SHA-256; `step` limited to R39's seven. Web Crypto only, so the remote class (R36) can use it in the Worker. Nothing imports it yet: it is the recorder the proof and R36 would write through.
- **R38** blocked at step 0 (J1): nothing past it is built. R36, R37, R40 (CONDITIONAL) not built. The result table R38 asks for: step 0 · no request possible · the held `setup-token` "can only make model requests" (AT-22), and no documented way for a copy's own code to get a sessions-scoped login; steps 1-5 · not run.

**Deferred, with why.**
- Plan rule 6 (words by key, "team" not "group"): the member-facing sentences left in this module (`signin.mjs` `WORDS`, `worker.mjs` `STARTED_WORDS`) are all now reached by no one (R35 answers first); moving the image's ones to `word(key)` means copying setup-words into the image and rebuilding it (a new digest, a release act) for dead paths. Do it when R35 is lifted or the image is next rebuilt. R35's own answer has no English. `setup-words` stays in `uses`, unused for now.
- R12's header comment still describes the pass-through; R35's paragraph beneath it says it is suspended.

**Found in other modules (REPORT-worthy, against their requirements):**
- agent-worker R111 (`check`) is CONDITIONAL on agent-runner R38, while R38 says its steps run through R111's `check`: circular as written (J1).
- agent-worker still binds `RUNNER` to `AgentRunner` (its wrangler, read by worker.test R12): every call it makes now gets 410 `LOCAL_RUNNER_DISABLED` until its R109/R110 land; its callers should treat that code, not a container error. Nothing stale of another module's generated artifacts: only agent-runner's own bundle changed (fleetbundles: agent-runner PASS, fresh build byte-identical).

**Tests and checks.**
- `agent-runner`: `node --test test/` · tests 66 · pass 55 · fail 0 · skipped 11 (the suspended ones). Baseline before the job: 59 pass. The new R35 test fails on the old bundle (checked).
- Other tests naming agent-runner (instance-setup ×4, journey-check runner, bundler ×2, resolveversion): tests 86 · pass 86 · fail 0. `fleetbundles.test.mjs`: agent-runner rows all PASS.
- `checks/format.mjs`: 0 failures. `architecture.mjs … agent-runner`: 0 failures. `coverage.mjs … agent-runner`: 36 of 40, R36 R37 R38 R40 not named (accepted red, rule 5 (1); not met). `ownership.mjs … tranche/T50`: 10 files, 0 failures. `checks/run.mjs`: architecture 0 failures; coverage's agent-runner line as above.

Size (session_015C9SKzHdvKkAX6rzVop4aT): test runs 9, module lines 1041
