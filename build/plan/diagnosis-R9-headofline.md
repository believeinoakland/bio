# Diagnosis, round 9: the past alarm the founder sees during a long firing (G91, K4912)

Job 62, SCHEDULER #44 (session_0113Q34uGoEBKcg4P8s4Pabg). Reproduced on workerd (Miniflare, the real alarm) with `bio-plane/test/m/plane/r8-headofline.test.mjs`, test "R80 G91 L", alone, twice (red both times), with each `setAlarm` of the scheduler logged with its caller (a temporary line, removed; no code in this diagnosis's commit differs from `tranche/T51`).

## Root cause

**The past alarm is set while a firing is running, by a producer's `arm()`; it stays visible for the whole of the firing, and the firing is long.** It is not the end-of-firing reconcile.

1. A firing is running (`running_since` set). In workerd `getAlarm()` is null while the handler runs, until `setAlarm` is called in it.
2. A request path in the same object (the upload's filing: `promotion.onCommitted` at `scheduler/index.mjs:939`, the tasks' `armDrain` at `tasks/index.mjs:1174`, the ledger's `arm` at `plane/pending.mjs:203`) calls `Scheduler.arm()` during the firing. `arm` reaches `#reconcile(now, reg, false)` (`index.mjs:726-743`): `getAlarm()` is null, so `at === null` and the line `if (at === null || at === undefined || at > want) return await set(want)` (:740) **sets the alarm to the earliest `wake` of any consumer**. That wake is `pending-work`'s: the due instant of the row just filed, which is already at or before now. The alarm is therefore set to an instant in the past, mid-firing.
3. The firing lasts as long as its slowest consumer. Here `file-scan` ran 8.0 s (file-safety's own bound on the scanner call) and `file-render`, `document-copy` and `pending-work` followed, so the firing lasted 8.7 s. For all of it `getAlarm()` answers the instant set in step 2, which gets older with every poll.

## Evidence (one run; instants in ms)

| What | Value |
|---|---|
| alarm armed by the upload, firing about to start | t = 1792843698704 |
| firing started (`scheduled_for` 698704) | 698722 |
| `file-scan` call | started 698724, ended 706744 (8.0 s) |
| mid-firing `arm` (promotion notice; tasks `armDrain`), `firing: true`, `getAlarm()` null | **setAlarm(698716)** at wall 698772, 50 ms after the firing began, 6 ms *before* its start instant: a due row's own wake |
| `pending-work` | started 706887, ended 707398 |
| end-of-firing reconcile (`exact`) | setAlarm(698723) at wall 707399 |
| next firing started | 707406, 7 ms later (`scheduled_for` 698723, `gap_ms` 6): it ran at once |
| the founder's polls, 2.1 s to 9 s into the firing | `alarm_at` = 698716 every time (13 polls more than 2 s past) |

First run (the numbers BOB's START quotes): alarm 1792843620611 (set 34 ms after the firing's start, `file-scan` 8.9 s in the firing), polls 1792843622721 to 1792843628978 all answering 1792843620611.

## What it is not (the hypotheses of the START, each read against the evidence)

- **The reconcile at the budget's end setting a past wake**: it does (698723 above, set 8.7 s after the wake's own time) but the next firing starts 7 ms later, so the founder cannot see it for seconds. In this run no consumer reached the budget (the longest call, `file-scan`, ended at the scanner's 8 s bound, before the 10 s budget), so `#inflight` was empty throughout.
- **A following firing finding consumers in flight and resetting the same past wake**: no consumer was in flight; the following firings (about 14 in 4 s) each ran `pending-work`, one row each, and set the next alarm outright.
- **The platform not starting a new alarm while the previous one's work is pending**: after the long firing the next one began at once (`gap_ms` 6 to 44); the 12 s scan's call went on as a separate request to the scanner binding.
- **`file-render`'s wake `now` while its scan is in flight (file-safety R39)**: it plays no part here; the wake that is set in step 2 is `pending-work`'s own row.

## Why the tests missed it

`alarmDouble` and the scheduler's suite make firings that last milliseconds, and no test calls `arm` during a firing that outlasts the poll's slack and reads `getAlarm()` meanwhile; the through-the-door test is the first to ask the administrator's question during a firing of seconds.

## Where the fix belongs, and the rule

The scheduler (`index.mjs`), not file-safety's wake and not plane's ledger: the wake `pending-work` answers is true (its row is due); what is wrong is what the scheduler writes to the platform *during* a firing.

Rule (K4565, R1, R29): while a firing is running the alarm is (a) never absent, and (b) never in the past by more than the firing's own slack, and (c) the scheduler never spins. Fix: the firing sets, before it reads anything, an alarm at `its start + the budget + the grace` (the instant it can no longer run past, also the recovery for a run the platform cuts, R33); an `arm` made inside a firing sets and reads nothing (the firing's own authoritative reconcile at its end weighs every consumer's wake, including the work the request just made, R1, R17); the end reconcile sets the next alarm outright as before.
