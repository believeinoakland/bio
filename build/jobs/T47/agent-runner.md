# agent-runner (T47)

**Status** · session_01MEx7Bd3uQjWNySLSHu6rxF · depth 2 · COMPLETE · handled B2

## J1 · REPORT

START measurement (K3068), pinned binary 2.1.289 (`@anthropic-ai/claude-agent-sdk-linux-x64@0.3.289`) under util-linux `script` (2.39.3), environment replaced whole as R2's, `TERM=dumb`, `stty cols 4000 rows 200` inside the `-c` command, nothing typed but a test code:
1. `claude setup-token` CAN be driven headless. Address at ~0.2 s, unwrapped, after "Browser didn't open? Use the url below to sign in (c to copy)" (no `visit:`); host `claude.com`, `scope=user:inference`, redirect `platform.claude.com/oauth/code/callback`; then "Paste code here if prompted >". No onboarding or "press Enter" screen before it. No network needed to reach the prompt.
2. It is an Ink UI that writes only the screen cells that change (cursor moves `ESC[nG`, `ESC[nA/B/C`, `ESC[K`): stripping escapes is not enough (words run together, and a character already on screen at the same cell is not re-sent, e.g. "c de" for "code"). The runner therefore renders the output onto a small virtual screen and reads text from it; R27's "terminal escapes removed, lines joined" is met that way. Same parse used for the address and prompt.
3. The code must end with CR (`\r`): with LF the input is held and never submitted (`auth login`'s readline took LF). R18's "one line end" is CR for `setup-token`.
4. A bad code: "OAuth error: <message>" then "Press Enter to retry." — the binary does not exit; the runner ends it (SIGNIN_REFUSED).
5. Success words (from the binary's own component): "✓ Long-lived authentication token created successfully!", "Your OAuth token (valid for <1 year | N days | less than a day>):", the token on its own line, "Store this token securely…", "Use this token by setting: export CLAUDE_CODE_OAUTH_TOKEN=<token>".
6. SIGNIN_TOKEN_REFUSED (doubt 9): fixed from the SDK's own typed signal, not strings: an `assistant` message or `system`/`api_retry` message with `error: "authentication_failed"` (sdk.d.ts `SDKAssistantMessageError`), followed by a result that is not success. Any other failure stays SDK_ERROR.
So R25–R31 are all built in this job; nothing goes to T48. Not typed to Anthropic: no real code was ever sent (the test code had no `#`, refused by the binary locally).

## J2 · QUESTION

R26 and R31 conflict on `RUNNER_NOT_STARTED`'s `detail`. R26: `detail` is "the library's words, at most 120 characters" (e.g. "Failed to start container: …"). R31: every refusal "and RUNNER_NOT_STARTED (R26)" carries a `detail` "written for the member … never 'instance' or 'container'". The library's words name the container, so one field cannot meet both.
Best reading (built now): `detail` is the member's sentence (R31: "Your group's Civicsmith could not start its Claude connection just now. Wait a minute, then try again."), and the library's words go in their own field `library_detail` (≤120 characters, URL query and anything R29 scrubs removed, R26), beside `status`. If you rule otherwise, it is a one-line change.
Second, a detail I settled under R25 (report only, no answer needed): R25 clears the hold on a `/signin/code` 409 `SIGNIN_REFUSED` or `NO_SIGNIN_WAITING` but not on a 409 that keeps the attempt (`NOT_THIS_MEMBER`, `ATTEMPT_SUPERSEDED`), which status alone cannot tell apart. The container states `x-signin-waiting: 1|0` on every sign-in route's answer (a header, no secret); the class reads path, status and that header, never a body.

## J3 · COMPLETE

T47-79 applied whole: R25–R31 met, and R2, R8, R9, R12, R17–R23 as they amend them (R23/R17's U-7 sentences now cite K3061 in the marker's note). Nothing deferred; nothing to T48 (J1: `setup-token` drives headless).

**Read whole (P20):** `build/requirements/agent-runner.md`; bundler's Purpose and Provides; layer 6's contract and sections in `layers.md`; plan rules and T47-79/T47-80; the draft's §0, §1.1 and §4; every file of `agent-runner/` but the generated bundle and the lock; the library's `container.js` hooks I override. Flaws found and fixed in my own module: (1) four tests replaced `process.stdout.write` without passing it on, which swallowed the test runner's own reports (two results vanished from a run; the baseline's 38 was likely an undercount); every capture now passes writes through. (2) The class called the library's `onError`, which prints the raw error; it now logs R30's scrubbed line and rethrows.

**What was built:** `src/signin.mjs` runs `claude setup-token` (no option) under `script` in a 4000×200 terminal, reads the screen through `src/screen.mjs` (a cell grid; the binary sends only changed cells), types the code with CR, answers `{ok, connected, member, attempt, token, valid_for}` once, ends the process, drops its output and removes the attempt's own directory; nothing stored, no member record; `state` answers `waiting`; `signout` runs no logout. `src/runner.mjs`: `{kind: "signin", member, secret}`, `CLAUDE_CODE_OAUTH_TOKEN` in the query's environment only, fresh `CLAUDE_CONFIG_DIR` in the conversation's temp directory, `SIGNIN_NOT_HELD`, `SIGNIN_TOKEN_REFUSED` from the SDK's `authentication_failed`; `keepOnly`/`serves` retired. `src/entry.mjs`: listens before the SDK loads; one `signin.runner`/`conversation.runner` line per step/conversation; `trace`, `trace_detail` on every sign-in answer, member-readable `detail` on every refusal, `x-signin-waiting` header (K3092). `src/worker.mjs`: R25's hold in the class's storage, `onActivityExpired` held awake; R26's JSON 503 `RUNNER_NOT_STARTED` with `status`, member `detail`, `library_detail` (K3092); R30's lifecycle lines and one `outboundByHost` handler per egress host (registered through the library's setter). `src/waits.mjs` shares the waits and header names; `Dockerfile` copies the two new files. Bundle regenerated by `npm run build` (mine; fresh by `fleetbundles.test.mjs`).

**For the caller (agent-worker T47-80):** `code` takes `attempt` (absent is taken as the waiting one, so today's caller still works); the `code` answer carries `token`, `valid_for`, `attempt`; sign-in answers carry `trace`, `trace_detail`; the runner reads `x-civicsmith-trace` and `x-civicsmith-member-ref` on the sign-in routes and the conversation upgrade. Until agent-worker/agent-model send `secret`, a conversation answers `SIGNIN_NOT_HELD` (draft doubt 3, accepted).

**Found in other modules (no change made):** agent-worker's own suite fails 4 files (ask, requirements, t41, t46) identically on `origin/tranche/T47` without this job (its pending T47-80 / held-token work), and its committed bundle reads stale in `fleetbundles.test.mjs` with no input of mine (it has no lockfile, so `npm ci` cannot run there). bio-plane's bundle stale: accepted red 4.

**Tests and checks:** `agent-runner`: `node --test test/` → tests 55, pass 55, fail 0 (was 38). agent-worker (my user): 16 files, 12 pass, 4 fail, the same 4 on the tranche baseline. `fleetbundles.test.mjs`: every agent-runner arm PASS. Checks: format 0 failures; architecture (agent-runner) 0 failures; coverage (agent-runner) 31 of 31 ids, 0 failures; ownership 22 files, 0 failures; `run.mjs`: format 0, architecture 0, channels 0, coverage 41 failures, all other modules' not-yet-met ids (rule 5 (1)), none agent-runner's. Real binary: `start` against the pinned 2.1.289 answered 200 with a `claude.com` address in 272 ms, `state` waiting, `signout` cleaned up; no code was ever sent to Anthropic.

**Uses:** unchanged, `bundler`.

Size (session_01MEx7Bd3uQjWNySLSHu6rxF): test runs 14, module lines 3003
