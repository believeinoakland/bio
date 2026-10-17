# monitoring — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §4 and HANDOFF.md "Found on the way", against `build/requirements/monitoring.md` on `tranche/T17` (highest id R49; R24 retired). Ids final: **R50** (the cadence `scheduler`'s consumer asks; the draft named the consumer but no due or wake, and `scheduler` R7 says every cadence is its owner's). The Status line's "Not yet met: … R28–R35 …" reads "R28–R34 (R29 and R33 K102)" once R35's mark goes.

Confirmed 2026-09-30 (K591 confirmed it first): `deadlineRecheck` (`src/monitoring/index.mjs`:2040) has no caller outside `test/m/monitoring/understanding.test.mjs`; `scheduler`'s registry (`src/scheduler/index.mjs`) holds no `deadline-recheck` consumer; no queue kind names an overdue clock or a proposed stage (`src/queuestate.mjs`). `actionCommitted` is registered with promotion (`index.mjs`:2159), so R35's "a response is recorded" half runs today.

## Addition

- **R50** `deadlineRecheckWake(now)` answers the start of the UTC day after the earliest date among `pending` clock entries of visible-to-this-module actions (`actions.pendingClocks`, read as this module's machine viewer), or null when none is pending; `deadlineRecheckDue(now)` answers that instant when it is at or before `now`, else null. So `scheduler`'s `deadline-recheck` consumer (its R5) runs R34 on the first alarm of the day an entry passes, and an instance with no pending entry holds no wake for it (scheduler R15). *(not yet met: new)*

## Marks

- **R34** — current mark `*(not yet met: new)*` becomes `*(not yet met: the members being told: no caller outside tests until `scheduler`'s `deadline-recheck` consumer (its R5) and `queue-producers` R15, T18)*`. The mark half is built and tested (`understanding.test.mjs` "R34 …"; its `test.todo` "R34 the action's members are told" stays until then).
- **R35** — current mark `*(not yet met: new)*` struck: built and tested (`understanding.test.mjs` "R35 …"): `deadlineRecheck` and `actionCommitted` ask `escalation.escalationsDue`; proposals are escalation's derivation (its R2). Reaching a member is `queue-producers` R15's, not this requirement's.

## Uses (add)

> `actions`: … `pendingClocks` (its R31) and the bound of its R33 (R34, R44, R50).
