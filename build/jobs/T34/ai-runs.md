# ai-runs (T34)

**Status** · session_01PQEXVhhFSaLrarf57c1pZj · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings, both carried on now (step 3); say if either is wrong.

(1) R48's `countAskUsage({member, mode, usage, calls, at})`, "`calls` read as in a tick's entry". My reading: a `calls` that is given is judged exactly as a tick entry's (a positive safe integer or `null`; anything else `AI_RUN_CONSUME_INVALID`), but an omitted `calls` argument reads as `null` (one call), not as a refusal. Why: control-plane's `askusage` route (`dispatch.mjs:294`) passes only `b.usage` today, and its test `r53-routes.test.mjs:229` posts no `calls`; the strict reading would refuse every ask's use (nothing counted) until control-plane's L11 job routes `calls`. A tick entry with `calls` absent is refused, as R48 says. (Finding for control-plane, in a REPORT to follow: the route should pass `calls: b.calls`, since agent-worker's ask already sends it; until then an ask conversation of N calls counts as one.)

(2) R52 / agent-worker R6: the dispatch body's `account` is `{kind, level, secret, member, suggestions}`: `secret` is `credentials.accountFor`'s `key` (credentials R35 names it `key`, agent-worker R6 `secret`; I send agent-worker's name, which is the receiver's contract). `suggestions` for a `level: "group"` account is the group key's own switch (credentials R37), but credentials offers no in-plane read of it for a non-administrator member's act (`groupKeyState` answers a member only `{on}`), so I send `false` (fail closed, as off by default) and REPORT it for credentials.
