# agent-runner (T37)

**Status** · session_013WGtsDHseGqHijvVK5BW55 · depth 2 · WORKING · handled B2

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
