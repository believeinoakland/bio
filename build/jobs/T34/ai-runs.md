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

## J3 · COMPLETE

T34-33 applied on `job/T34/ai-runs` (code `ef22ba6bd8`), merged with `tranche/T34` after its L6 upstream merges; BOB's B2 (K1798) applied as built.

**Entries applied**
- R48 (N588, K1621): `tick`'s `usage` is one entry per conversation, `{mode, model, usage, calls}`. `calls` must be present and a positive safe integer or `null`; anything else (absent included) refuses the whole tick `AI_RUN_CONSUME_INVALID`, writing nothing. Each entry adds its figures to the sums and its `calls` to the count, a `null` counting as one. `countAskUsage` takes `calls`, judged the same, an omitted one read as `null` (J1 (1), K1798); it answers `calls` beside `counted`.
- R52 (K1755): the account a run carries is `credentials.accountFor`'s for the act of the member who started it, their own reference or the group's API key. `open` asks it before the id's existence (no await between that check and the insert) and applies it in R52's place: `NO_ACCOUNT` → `AI_NO_ACCOUNT`; other refusals of that service (`GROUP_KEY_NOTICE_DUE`, `ACCOUNT_MEMBER_NOT_ACTIVE`, the seal) relayed with their rows; nothing written on any. The key is dropped at once. A group-key run is still the member's act: `principal_claude` is `member:<id>`, its use counted to that member's day, held by their ceiling and the copy's. `aiUseCheck` and the wake's decision ask which account serves the member without unsealing (`accountReferenceState`, then `groupKeyState` as that member). The dispatch calls `accountFor` (the retired `accountReferenceFor` call is gone, START's finding) and sends `account: {kind, level, secret, member, suggestions}`, `secret` from `key`, `suggestions` false for a group-level account (J1 (2), K1798; N674).

**Deferred:** nothing of this module.

**Found in other modules:** J2 (control-plane's `askusage` drops `calls`: T34-60; credentials' group switch read: N674; the `key`/`secret` naming; affordances `t33-backing.test.mjs:122` red on the tranche, not on START's list).

**Tests and checks** (after merging `tranche/T34` @ the B2 point)
- ai-runs: 71/71 (`usage.test.mjs` gains the calls-ceiling arm and the group-key arm; `scheduler.test.mjs` the group-key dispatch).
- Users of ai-runs: run-productions 39/0, skills 67/0, intent 73/0, action-plans 61/0, queue-producers 85/0, plane 110/0 (+ `migrate-released` 1/0); named reds only: capture-requests 76/4, scheduler 81/1 (R12), control-plane 167/1 (R43), op-declarations 68/1 (t33 R19/R6, K1764), agent-worker `harness` 256/5 (REC100), `ask` 48/1 (R55, K1764); affordances 191/1, the same red without my change (J2 (4)).
- `format`: 126 modules, 0 failures. `architecture ai-runs`: 0 failures. `coverage ai-runs`: 44 of 44, 0 failures. `ownership ai-runs tranche/T34`: 5 files, 0 failures.
- The marks "not yet met: T34" on R48 and R52 can be struck at the merge.

Size (session_01PQEXVhhFSaLrarf57c1pZj): test runs 9, module lines 3275
