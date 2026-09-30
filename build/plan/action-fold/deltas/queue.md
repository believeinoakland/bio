# queue — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §4, against `build/requirements/queue.md` on `tranche/T17` after K607 (R12 and R28 re-worded today by QUEUE #6 J1). No new id: the three kinds join R1's catalogue and two OBLIGATION doors join R12; R28's bridge names "the same per-kind door R12 names" (K607), so it changes with R12 and its text does not. The producers are `queue-producers`' (R15–R17). No `uses` edge: `queue` reads none of their providers.

## Replacements

**R1** — in the current line, three insertions:

1. after `signer-self-registered (a member registered their own signing key; you may revoke it; `queue-producers` R14, N375, K566)` insert
   `, plan-checkpoint-due (a checkpoint your group set in an action plan has come; a member judges whether its condition was met; `queue-producers` R16), escalation-stage-proposed (an escalation's next stage is proposed because its trigger was met; a member advances it or declines with a reason; `queue-producers` R17)`
2. after `tension-after-publication (a published case's finding rests on a conflict found since) (N345)` insert
   `, action-clock-overdue (a deadline on one of the group's actions passed while the counterparty had not met it; `queue-producers` R15)`
3. the closing mark `*(not yet met for signer-self-registered: N375, T17)*` becomes `*(not yet met for plan-checkpoint-due, escalation-stage-proposed and action-clock-overdue: T18, K608)*` (N375's share lands in T17; if it has not, both are named).

**R12** — in the current line, the clause

> an OBLIGATION `available: false`, `instead` `biasdebtresolve` for bias-debt, `signerset` for `signer-self-registered` (its door is the key's status, membership R26), and `taskresolve` otherwise (K607);

becomes

> an OBLIGATION `available: false`, `instead` `biasdebtresolve` for bias-debt, `signerset` for `signer-self-registered` (its door is the key's status, membership R26), `checkpointrecord` for `plan-checkpoint-due` (`action-plans` R16), `escalationadvance` for `escalation-stage-proposed` (`escalation` R13; `escalationdecline`, the same requirement, is the other answer a member may give), and `taskresolve` otherwise (K607);

`action-clock-overdue` takes R12's "any other FINDING" disposition (project-scoped) unchanged.

## Satisfies (add)

> - `BIO_Action_v0_1.md` §4 rule 5.
