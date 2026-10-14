# screens-inquiry (T49)

**Status** · session_015AVppQzR1P2zG8LjVeLCKr · depth 2 · WORKING · handled B1

## J1 · QUESTION

**R33's bounds: what the plane states for a `check` run.** I read `run-rules` (`rules.mjs` `checkConsume`, `checks.mjs` C-22.16, C-109.6) and `ai-runs` open. The plane states no allowance table per mode: it refuses a declared bound with an absent or zero allowance (`AI_RUN_BOUND_NO_ALLOWANCE`), and refuses a `plan` run that declares a positive `fetches` or `subsessions` (`AI_RUN_PLAN_NO_SEARCH`); an undeclared bound has no ceiling. No op answers a mode's bounds.

My best reading, which I am building: the dock's bounds per mode are a frozen table in `assistant.mjs` derived from those rules. `check`: `wallclock` 1,800,000 ms and `fetches` 20 (the plane's own figure for a reading run, `question-explorer` `EXPLORE_BOUNDS`), no `subsessions` (a check spawns none; undeclared rather than zero). `plan`: `wallclock` 1,800,000 ms only (no search allowance, per C-109.6). No zero allowance is ever sent. The test runs the real `run-rules` `checkConsume` and `ai-runs`' plan rule over what the dock sends.

If the plane should state these (an op or an export the dock reads), that is another module's change; tell me and I will read it instead.

## J2 · QUESTION

**R42: which reasons are drawn, and when.** The design (`mock-screens.js` `SCR.question` state f) draws "Other reasons the assistant can't work here" (`question.ai.other`) as a folded list of example sentences; R42's control says a reachable assistant draws none, and the dock is drawn only while the assistant is reachable.

My best reading, which I am building: the list is drawn only where the assistant cannot work: the question's state f (a limit answered), the question page while the assistant is not reachable, and the dock once a refusal or withholding has been drawn there or no pack is answered. It lists, each by key, the reasons that apply as the screen's reads and the refusal answer them: `ai.refused.off` (when a refusal named the switched-off use, filled from it), `ai.refused.keptaway` (the group's `aikeepawaystate` on), `ai.refused.projectkeptaway` (the project's `projectaikeepawaystate` on), `ai.refused.noaccount` (no own reference, no connected sign-in, no group key held and on), `dock.withheld.AGENT_WORKER_UNBOUND` for not installed (`agentpack` names no pack, or a dispatch withheld `AGENT_WORKER_UNBOUND`), and then `question.ai.whose` with the serving account's `ai.account.*`. The dock always says which account serves the member (R4's line, unchanged). A reachable assistant with nothing refused draws no list.

This replaces no earlier question (J1, R33's bounds, still stands).
