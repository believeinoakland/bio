# agent-runner (T37)

**Status** · session_013WGtsDHseGqHijvVK5BW55 · depth 2 · WORKING · handled B3

## Completion

**Reading set.** Measured at START: 107 KB (under 300 KB), so read whole by this session: `build/requirements/agent-runner.md` (whole, and again after B3's merge), layer 6's row of `build/layers.md`, bundler's Purpose and `writeMember` (R5), every file under `agent-runner/` but the lockfile's body and the generated bundle (`src/*.mjs`, `fleet-member.json`, `wrangler.jsonc`, `Dockerfile`, `package.json`, `scripts/build.mjs`, every test and stub), the plan's T37-16 and T37-17 entries and "Rules at the opening" (rule 3, rule 6), DEC-156, `build/terms/anthropic.md` whole, and K1547, K1755, K1804, K1819, K2074, K2134, K2135, K2147, K2200 in `build/rulings.md`. No worker summaries.

**Entries applied (T37-16; N708's share, DEC-156; N750).**
- R17–R21: `src/signin.mjs` (new). The binary's own `claude auth login`, with no option, through util-linux `script -q -f -e -c … /dev/null` (a pseudo-terminal; the base's `bsdutils`, nothing installed, R16); the address read from its `visit:` line with terminal escapes stripped, answered as stated only when `https:` on `claude.ai`/`claude.com`/`anthropic.com` or a subdomain (no user, no port), else 502 `SIGNIN_ADDRESS_UNEXPECTED`; 30 s for the address, else 502 `SIGNIN_UNAVAILABLE`; the code typed once with one line end; outcome from `Login successful.` / `Login failed` / `Invalid code` / exit, 60 s at most (K2213), the echo of the code removed and the detail scrubbed; 10 min wait for a code; state from `claude auth status --json` (`loggedIn` and `authMethod: "claude.ai"`), never the file; sign-out by `claude auth logout`, 502 `SIGNOUT_FAILED` keeping the record when the binary fails (K2213); the record `member` (a member id, mode 0600) beside the binary's config directory under the user's home. Routes in `src/entry.mjs` (`POST` only; body over 16 KB or not a JSON object 400 `BAD_REQUEST`; `BAD_MEMBER`; then each route's order as R17–R21 now state, K2213).
- R2: `credential: {kind: "signin", member}` (`src/runner.mjs`): `NOT_SIGNED_IN` / `NOT_THIS_MEMBER` before anything starts; the query runs with neither credential variable and `CLAUDE_CONFIG_DIR` the stored sign-in's directory, `HOME`/`TMPDIR`/`cwd` in the conversation's temporary directory; afterwards every path the query added under the sign-in's directory is removed (names listed, contents never read), so only the binary's renewal of what it held survives (R9).
- R7, R10, R13: `fleet-member.json` `egress` exactly `["api.anthropic.com", "platform.claude.com"]` (J1, K2211), applied by the class unchanged (`allowedHosts`); surface lists the four routes. R22: no step after `npm ci`, no login option, no method-picking variable. R23: `terms` `{condition, source, who_agrees: null}`, the two conditions quoted from AT-14 as the register quotes them. No text says the terms allow the sign-in (U-7 (a)–(d) open).
- R11 (N750): the test derives the published form from `wrangler.jsonc` as it stands. Passes on the tranche's `@sha256:UNPUBLISHED` form and on a published form: a release cut simulated locally (wrangler and marker set to `ghcr.io/believeinoakland/agent-runner@sha256:a187d554…3019`, K2074's digest) passes; T36's test fails on that same form (red 6 reproduced, then cleared). The simulation was reverted.
- Shared: `src/env.mjs` (new) holds the environment and `scrub` both processes use; `Dockerfile` copies `env.mjs` and `signin.mjs`.

**Generated artifact.** `src/worker.mjs` (a comment) and its input `fleet-member.json` changed, so the bundle was rebuilt with its own command (`npm run build` in `agent-runner/`): `dist/agent-runner.bundled.mjs` sha256 `3e51da31e64ae6885a52d2e249bfe9c71e1538e2bda6a6f04a50fec97707d07a`; bundler's `verifyStatic` and `verifyFresh` report no findings.

**Deferred.** None. The image was not built here: a Docker daemon started in this container, but Docker Hub refused the pinned base's pull (`HEAD …/library/node/manifests/sha256:efd0ab57…` 429 Too Many Requests), so the image is proven at the release's build (K1985). `script`'s presence in the pinned base rests on Debian bookworm's Essential `bsdutils`; the release's build proves it.

**Found in other modules.** agent-worker's suite: 4 of 11 files red (`agent-worker.test.mjs`, `harness.test.mjs`, `requirements.test.mjs`, `versions.test.mjs`: real-plane refusals, R45 bundle static and fresh), the identical failing set on a clean `tranche/T37` @ `1a7867dd5e` without this job's change, so not this job's. No other module's artifact made stale. (agent-worker R66–R67's relay is T37-17's.)

**Tests and checks.**
- `agent-runner`: `node --test test/` 34 tests, 34 pass, 0 fail (three consecutive runs). Every live id named: R1–R23.
- `agent-worker` (it uses this module): 11 files, 7 pass, 4 fail, identical on tranche without this change (above).
- `node checks/format.mjs`: 136 modules, 135 requirements files; 0 failures. `architecture.mjs … agent-runner`: 0 failures. `coverage.mjs … agent-runner`: 23 of 23 live requirement ids named by a test; 0 failures. `ownership.mjs … agent-runner tranche/T37`: 16 files; 0 failures.
- Final `uses`: `bundler` (unchanged).

Size (session_013WGtsDHseGqHijvVK5BW55): test runs 16, module lines 649

## J1 · QUESTION

R10's sign-in hosts (K2200), read from the pinned SDK: `@anthropic-ai/claude-agent-sdk` 0.3.289 (lockfile), whose linux-x64 binary is Claude Code 2.1.289 (`manifest.json` `version`, commit 736d26ee). Its production OAuth table (`BASE_API_URL`, `TOKEN_URL`, …) and the `claude auth login` / `auth logout` code read from the binary:

- **from the container** (what `egress` must allow):
  - `platform.claude.com` — `TOKEN_URL` `https://platform.claude.com/v1/oauth/token`: the code's exchange at sign-in (`grant_type: authorization_code`, `redirect_uri` the manual `https://platform.claude.com/oauth/code/callback`), the renewal (`grant_type: refresh_token`, the same URL, also during a `signin` conversation), and the logout's revoke (`…/v1/oauth/token/revoke`).
  - `api.anthropic.com` — already listed: after the exchange the binary reads `/api/oauth/profile` and `/api/oauth/claude_cli/roles` (`BASE_API_URL`, `ROLES_URL`); the model's calls as now.
- **opened by the member's browser only, never by the container:** the address the binary states, `https://claude.com/cai/oauth/authorize?…` (`CLAUDE_AI_AUTHORIZE_URL`, subscription login), and the page that shows the code (`platform.claude.com/oauth/code/callback`). R17's host check admits `claude.com`.
- Not reached for a subscription login: `API_KEY_URL` (Console login only), `claude.ai` (`CLAUDE_AI_ORIGIN`: connectors, routines, web links; none in login, renewal or logout), `mcp-proxy.anthropic.com` (claude.ai connectors; `strictMcpConfig` keeps them off). Telemetry hosts stay off by R10's quiet variables, which the login's environment also carries.

My reading: `egress` becomes exactly `["api.anthropic.com", "platform.claude.com"]` (no wildcard), applied by the class as now. I carry on with that; I write it into `fleet-member.json` only on your answer.

Also, for your record (no answer needed unless you disagree): `claude auth login` reads its code from stdin as a line `code#state` (readline), prints `If the browser didn't open, visit: <address>` (possibly wrapped in a terminal hyperlink escape, which I strip, never rewriting the address) then `Paste code here if prompted > `, and on success `Login successful.`; `claude auth status --json` reports `{loggedIn, authMethod: "claude.ai", …}`; `claude auth logout` removes `.credentials.json` itself. I drive login through util-linux `script` (already in the pinned bookworm base: `bsdutils`, Essential), so no package and no install script is added (R16).

## J2 · QUESTION

Three readings, one a conflict in the text; I build on my reading now and change only on your answer.

1. **R19 vs R21 (conflict).** R21: "every R17–R20 step … naming another member is refused 409 `NOT_THIS_MEMBER` before anything runs". R19: `connected` is "`false` when none is held … or it is another member's", refusals "as R17's first two" (only `BAD_REQUEST`, `BAD_MEMBER`). **My reading:** R19's specific text wins: `/signin/state` naming another member answers 200 `{ok: true, connected: false, member}` (it reveals nothing of the other member and runs nothing); R17, R18, R20 and the `signin` conversation refuse 409 `NOT_THIS_MEMBER`. If you rule the other way, R19 or R21's wording needs your amendment.
2. **R18's member check.** R18 lists no `BAD_REQUEST`/`BAD_MEMBER`. **My reading:** all four routes refuse a body not a JSON object 400 `BAD_REQUEST` and a malformed `member` 400 `BAD_MEMBER` first (R17's first two), then R18's own order: `NOT_THIS_MEMBER` (R21), `NO_SIGNIN_WAITING`, `BAD_CODE`.
3. **Two waits and one failure the text leaves open.** (a) After the code is typed, the binary's own token exchange has a 30 s timeout; I wait at most 60 s for its outcome, then end the sign-in and answer 409 `SIGNIN_REFUSED` with detail "no outcome within 60 seconds". (b) R20: if the binary's own logout fails (exits non-zero, e.g. it cannot run), I answer 502 `SIGNOUT_FAILED` with scrubbed detail and keep the record, rather than 200 `connected: false` while the stored sign-in may remain. R20's text says 200 "also when none was held"; this is only the case where the binary itself fails. Your call whether a new code is acceptable or R20 should answer otherwise.
