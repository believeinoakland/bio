# scheduler — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §4, against `build/requirements/scheduler.md` on `tranche/T17` (highest id R20). No new id: the consumer joins R5's list, its answer R2's keys, its arming R9's producers. The Status line gains: "Action layer folded 2026-09-30 (K608): R2, R5, R9 name `deadline-recheck`; not yet met."

## Replacements

**R2** — in the current line, the key list

> `monitor`, `connderive`, `overduescan`, `queuerenotify`, `monitorcadence`, `airunreap`, `capturerequests`, `airunwake`, `calibration`, `groupdomain`, `biasdebt`, and a registered consumer's own.

becomes

> `monitor`, `connderive`, `overduescan`, `queuerenotify`, `monitorcadence`, `airunreap`, `capturerequests`, `airunwake`, `calibration`, `groupdomain`, `biasdebt`, `deadlinerecheck`, and a registered consumer's own.

**R5** — the current line ends

> `notice-sweep` (`reevaluation`'s `noticeSweep(now)`, its R25: one batch of its R14 sweep, `raiseNotices`, per tick, the pass held by `reevaluation` and pending after a newer capture is received; with `noticeSweepDue` and `noticeSweepWake`). `capture-request-drain` ticks before `ai-run-wake`, so a request that completes on an alarm wakes its run on the same alarm.

and becomes

> `notice-sweep` (`reevaluation`'s `noticeSweep(now)`, its R25: one batch of its R14 sweep, `raiseNotices`, per tick, the pass held by `reevaluation` and pending after a newer capture is received; with `noticeSweepDue` and `noticeSweepWake`), `deadline-recheck` (`monitoring`'s `deadlineRecheck(now)`, its R34 and R35, with `deadlineRecheckDue` and `deadlineRecheckWake`, its R50). `capture-request-drain` ticks before `ai-run-wake`, so a request that completes on an alarm wakes its run on the same alarm. *(not yet met for `deadline-recheck`: T18, K608)*

**R9** — in the current line, the clause

> a promotion that leaves a bundle monitored (`promotion` R45),

becomes

> a promotion that leaves a bundle monitored or an action holding a `pending` clock entry (`promotion` R45),

## Uses (replace)

> - `monitoring`: `cadenceTick(now, rank)`, `archiveTick(now, rank)` (its R19, R20; N224), R10's rank passed in.

becomes

> - `monitoring`: `cadenceTick(now, rank)`, `archiveTick(now, rank)` (its R19, R20; N224), R10's rank passed in; `deadlineRecheck`, `deadlineRecheckDue`, `deadlineRecheckWake` (its R34, R50).

No new `uses` edge (`scheduler` already uses `monitoring`).
