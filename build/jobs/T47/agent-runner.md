# agent-runner (T47)

**Status** · session_01MEx7Bd3uQjWNySLSHu6rxF · depth 2 · WORKING · handled B1

## J1 · REPORT

START measurement (K3068), pinned binary 2.1.289 (`@anthropic-ai/claude-agent-sdk-linux-x64@0.3.289`) under util-linux `script` (2.39.3), environment replaced whole as R2's, `TERM=dumb`, `stty cols 4000 rows 200` inside the `-c` command, nothing typed but a test code:
1. `claude setup-token` CAN be driven headless. Address at ~0.2 s, unwrapped, after "Browser didn't open? Use the url below to sign in (c to copy)" (no `visit:`); host `claude.com`, `scope=user:inference`, redirect `platform.claude.com/oauth/code/callback`; then "Paste code here if prompted >". No onboarding or "press Enter" screen before it. No network needed to reach the prompt.
2. It is an Ink UI that writes only the screen cells that change (cursor moves `ESC[nG`, `ESC[nA/B/C`, `ESC[K`): stripping escapes is not enough (words run together, and a character already on screen at the same cell is not re-sent, e.g. "c de" for "code"). The runner therefore renders the output onto a small virtual screen and reads text from it; R27's "terminal escapes removed, lines joined" is met that way. Same parse used for the address and prompt.
3. The code must end with CR (`\r`): with LF the input is held and never submitted (`auth login`'s readline took LF). R18's "one line end" is CR for `setup-token`.
4. A bad code: "OAuth error: <message>" then "Press Enter to retry." — the binary does not exit; the runner ends it (SIGNIN_REFUSED).
5. Success words (from the binary's own component): "✓ Long-lived authentication token created successfully!", "Your OAuth token (valid for <1 year | N days | less than a day>):", the token on its own line, "Store this token securely…", "Use this token by setting: export CLAUDE_CODE_OAUTH_TOKEN=<token>".
6. SIGNIN_TOKEN_REFUSED (doubt 9): fixed from the SDK's own typed signal, not strings: an `assistant` message or `system`/`api_retry` message with `error: "authentication_failed"` (sdk.d.ts `SDKAssistantMessageError`), followed by a result that is not success. Any other failure stays SDK_ERROR.
So R25–R31 are all built in this job; nothing goes to T48. Not typed to Anthropic: no real code was ever sent (the test code had no `#`, refused by the binary locally).
