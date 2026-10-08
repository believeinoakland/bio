# ai-runs (T38)

**Status** · session_01A8UNAiBU2W2MMZQtcUvj1x · depth 2 · WORKING · handled B2

## J1 · QUESTION

A `src/` change proves needed for T38-28; I ask before making it, as the START says.

**What I found.** With the test written as B1 asks (ann connected through `credentials.subscriptionConnected`, R43, no reference), the run never opens: `open` refuses it `AI_NO_ACCOUNT`. Cause: `#accountFor` (`bio-plane/src/ai-runs/index.mjs`:2760–2770) accepts only an answer with `typeof a.key === "string"`; credentials R35's sign-in answer `{ok, kind: "signin", level: "member", member}` has no `key`, so it falls through to `#noAccount`. The same helper serves the dispatch (`:1716`), whose body (`:1731–1733`) always writes `secret: ref.key`.

**My best reading (proposed change, ~8 lines, `index.mjs` only).**
1. `#accountFor`: also accept `a.ok === true && a.kind === "signin" && a.level === "member"`, returning `{level: "member", kind: "signin", key: null}`. Every other shape still refused as today.
2. `#aiRunDispatch`: build `account` as `{kind, level, member, suggestions}` and add `secret: ref.key` only when `kind !== "signin"`, so a sign-in carries no `secret` key (agent-worker R6; K2290). `suggestions` stays as computed (credentials' sign-in serves with the switch off; `accountReferenceState` with no reference answers no `suggestions: true`, so it is `false`).
3. Comments at `:961`, `:1012`, `:1709` name the sign-in arm.

This meets R52 as written ("the account `credentials.accountFor` answers for the act of the member who started it"); no requirement wording changes. The test is already written to the B1 shape; it goes green with this change. Until you answer I hold the job here (the answer decides what I build next).

## J2 · REPORT

For `answers` (not mine, nothing for it to change unless you judge so): applying K2299 needed a third site in `index.mjs` besides the two J1 named. `#accountServing` (the synchronous read behind the wake's decision, `:1684`, and `aiUseCheck`, `:2842`) answered only a held reference or the group key, so a sign-in member's woken run was withheld `NO_ACCOUNT`. It now also answers `member` when `accountReferenceState` shows `subscription.connected` (credentials R43, R35's order). Effect outside ai-runs: `aiUseCheck` (the ceiling check `answers` calls before an ask or draft) no longer refuses a sign-in-only member `AI_NO_ACCOUNT`; whether `answers` then carries the `signin` account to agent-worker is `answers`' own, under its requirements. The tests of every module listed as using ai-runs give identical results before and after (1252 pass, 35 fail, the same 35, all on the base already); `answers` is not listed as using ai-runs in `modules.json`, though it calls `aiUseCheck` and `countAskUsage` (R48, R50, R52); you may want that edge recorded.
