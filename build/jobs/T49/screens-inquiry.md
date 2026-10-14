# screens-inquiry (T49)

**Status** · session_015AVppQzR1P2zG8LjVeLCKr · depth 2 · WORKING · handled B0

## J1 · QUESTION

**R33's bounds: what the plane states for a `check` run.** I read `run-rules` (`rules.mjs` `checkConsume`, `checks.mjs` C-22.16, C-109.6) and `ai-runs` open. The plane states no allowance table per mode: it refuses a declared bound with an absent or zero allowance (`AI_RUN_BOUND_NO_ALLOWANCE`), and refuses a `plan` run that declares a positive `fetches` or `subsessions` (`AI_RUN_PLAN_NO_SEARCH`); an undeclared bound has no ceiling. No op answers a mode's bounds.

My best reading, which I am building: the dock's bounds per mode are a frozen table in `assistant.mjs` derived from those rules. `check`: `wallclock` 1,800,000 ms and `fetches` 20 (the plane's own figure for a reading run, `question-explorer` `EXPLORE_BOUNDS`), no `subsessions` (a check spawns none; undeclared rather than zero). `plan`: `wallclock` 1,800,000 ms only (no search allowance, per C-109.6). No zero allowance is ever sent. The test runs the real `run-rules` `checkConsume` and `ai-runs`' plan rule over what the dock sends.

If the plane should state these (an op or an export the dock reads), that is another module's change; tell me and I will read it instead.
