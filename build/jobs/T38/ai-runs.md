# ai-runs (T38)

**Status** · session_01A8UNAiBU2W2MMZQtcUvj1x · depth 2 · WORKING · handled B1

## J1 · QUESTION

A `src/` change proves needed for T38-28; I ask before making it, as the START says.

**What I found.** With the test written as B1 asks (ann connected through `credentials.subscriptionConnected`, R43, no reference), the run never opens: `open` refuses it `AI_NO_ACCOUNT`. Cause: `#accountFor` (`bio-plane/src/ai-runs/index.mjs`:2760–2770) accepts only an answer with `typeof a.key === "string"`; credentials R35's sign-in answer `{ok, kind: "signin", level: "member", member}` has no `key`, so it falls through to `#noAccount`. The same helper serves the dispatch (`:1716`), whose body (`:1731–1733`) always writes `secret: ref.key`.

**My best reading (proposed change, ~8 lines, `index.mjs` only).**
1. `#accountFor`: also accept `a.ok === true && a.kind === "signin" && a.level === "member"`, returning `{level: "member", kind: "signin", key: null}`. Every other shape still refused as today.
2. `#aiRunDispatch`: build `account` as `{kind, level, member, suggestions}` and add `secret: ref.key` only when `kind !== "signin"`, so a sign-in carries no `secret` key (agent-worker R6; K2290). `suggestions` stays as computed (credentials' sign-in serves with the switch off; `accountReferenceState` with no reference answers no `suggestions: true`, so it is `false`).
3. Comments at `:961`, `:1012`, `:1709` name the sign-in arm.

This meets R52 as written ("the account `credentials.accountFor` answers for the act of the member who started it"); no requirement wording changes. The test is already written to the B1 shape; it goes green with this change. Until you answer I hold the job here (the answer decides what I build next).
