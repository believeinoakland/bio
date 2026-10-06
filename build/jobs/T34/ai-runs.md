# ai-runs (T34)

**Status** · session_01PQEXVhhFSaLrarf57c1pZj · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two readings, both carried on now (step 3); say if either is wrong.

(1) R48's `countAskUsage({member, mode, usage, calls, at})`, "`calls` read as in a tick's entry". My reading: a `calls` that is given is judged exactly as a tick entry's (a positive safe integer or `null`; anything else `AI_RUN_CONSUME_INVALID`), but an omitted `calls` argument reads as `null` (one call), not as a refusal. Why: control-plane's `askusage` route (`dispatch.mjs:294`) passes only `b.usage` today, and its test `r53-routes.test.mjs:229` posts no `calls`; the strict reading would refuse every ask's use (nothing counted) until control-plane's L11 job routes `calls`. A tick entry with `calls` absent is refused, as R48 says. (Finding for control-plane, in a REPORT to follow: the route should pass `calls: b.calls`, since agent-worker's ask already sends it; until then an ask conversation of N calls counts as one.)

(2) R52 / agent-worker R6: the dispatch body's `account` is `{kind, level, secret, member, suggestions}`: `secret` is `credentials.accountFor`'s `key` (credentials R35 names it `key`, agent-worker R6 `secret`; I send agent-worker's name, which is the receiver's contract). `suggestions` for a `level: "group"` account is the group key's own switch (credentials R37), but credentials offers no in-plane read of it for a non-administrator member's act (`groupKeyState` answers a member only `{on}`), so I send `false` (fail closed, as off by default) and REPORT it for credentials.

## J2 · REPORT

Findings in other modules (step 4), none changed by me.

1. **control-plane** (`src/control-plane/dispatch.mjs:294`, `askusage`): passes only `b.usage` to `countAskUsage`, dropping `b.calls`, which agent-worker's ask already sends (`agent-worker/src/ask.mjs:198`). Against ai-runs R48 (N588): until it passes `calls: b.calls ?? null`, an ask conversation of N model calls counts as one, so a calls ceiling (R50) is reached later than the calls made. Its test `r53-routes.test.mjs:229` posts no `calls` and stays green under my J1 (1) reading. op-declarations' reason text for `askusage` (`index.mjs:2913`, "POST {mode:"ask", model, usage} per call") is stale the same way.
2. **credentials** (R37 against R35/R34): no in-plane read of the group key's own `suggestions` switch for a member's act. `groupKeyState` answers a non-administrator only `{on}`, and `accountFor` answers no switches, so a run (and an ask) the group key serves cannot honour an administrator's `suggestions: on`. ai-runs sends `suggestions: false` for a `group`-level account (fail closed, off as by default). A fix: `accountFor` answers the serving account's `suggestions` and `standing` beside `{kind, level, key}`, or an in-plane `servingSwitches({member})`.
3. **agent-worker R6 vs credentials R35**: R35 names the unsealed secret `key`, agent-worker R6 (and R10) read `secret`. The dispatch body sends `secret` (agent-worker's, the receiver's contract) plus `level`. One of the two texts should name the other's field, so the next reader does not have to map it.
4. **affordances** `test/m/affordances/t33-backing.test.mjs:122` ("R19: duties' dutyrevise, … graded `reasoned`") is red on `tranche/T34` without my change (it now gets `DUTY_NO_REASON`, duties' re-key, N608/K1792). It is not on START's list of named reds; I note it, not mine.

No generated artifact made stale by my change (agent-worker's bundle takes no ai-runs input since T18; the plane bundle is regenerated at layer close).
