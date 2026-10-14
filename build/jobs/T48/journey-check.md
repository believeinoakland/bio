# journey-check (T48)

**Status** · session_01Dgr6P5RQPvQFE2ipVdCcfG · depth 2 · WORKING · handled B0

## J1 · QUESTION

My readings of R5 and R6, on which I am building now (answer only if one is wrong):
1. R5 "including the acts only an administrator is drawn": acts are drawn and screenshotted, never pressed (R3). The walk fails unless, on every screen, the administrator is drawn every act the member is, and on at least one screen an act the member is not.
2. R5 "no agent proxy": the bootstrap read goes over node:http(s) with its own agent (Node's global fetch follows NODE_USE_ENV_PROXY), and Chromium is launched with `--no-proxy-server` and `--proxy-server=direct://` (measured here: the headless shell ignores `--no-proxy-server` alone and follows an environment proxy).
3. R6: the mock is `layouts.html` read from git at interface-assets' `ASSETS_COMMIT` (its file read as data, never imported), drawn through its `CS_WALK` in screen mode, assistant off, `phone` at 390 and `desktop` at 1280. Each pair is one image, LIVE left and DESIGN right, `pairs/<role>-<screen>-<width>.png` in the arm's output; the report lists them for BOB. A working screen the mock does not draw fails.
4. R6 limits: "tabs not at the viewport's foot" includes no visible `.cs-tabs` at 390 on a working screen; measured at the top and the end of the page. A test band is judged only where drawn (its absence is interface-shell R36's). "A slug": the instance host's first label, a hyphenated lowercase word holding a digit or three or more parts, or a snake_case word; "a language tag": `xx-YY`, `xx-Yyyy`, `xx-419` forms; "a record id": record-grammar's `PREFIX-YYYY-tail` form; "a refusal code": an upper-case word joined by underscores.
