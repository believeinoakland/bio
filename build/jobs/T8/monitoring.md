# monitoring (T8)

**Status** · session_01Lj27owwtEDMzBp4RqU8K7N · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three questions; I carry on with the job on my best reading of each.

**Q1 (R23, R45, R30: ticks in process).** The plan's entry reads "R23 reads runtime-limits R26 (N63)", and my Uses say `unattendedCredential(env)` serves R24 "until R23". Best reading: this tranche does not build R23. `op=monitor` becomes a Durable Object service (map §1, K72 (11)) and the Worker's op forwards to it, but the two ticks still fire over `env.SELF` (the Worker, then this DO) with the credential `runtime-limits.unattendedCredential(env)` chooses (R24: `bound` for configured, `token()` for the spend, `MONITOR_NO_LIVE_CREDENTIAL` when none is live). R23, R45 and R30 get `test.todo` naming the cause. If you want R23 now, say so: the cadence fire would call the new in-process `monitor` and the archive fire `capture.acquire` (daemon class), and R45 would make `configured()` true on every instance, which changes the scheduler's arming and the old battery's "inert unless configured" suites (d334, daemon-token, archive-monitoring, monitor-cadence).

**Q2 (uses: `subresources`, `jurisdictions`).** The moved `op=monitor` calls `normalizeAddress` (`subresources`, layer 1) for the look's subject and the D-524 baseline match; neither `capture` nor `provenance` re-exports it. N116 has me pass the combined view of the instance's active profiles to `identify`/`doctypeFor`/`assess` where `op=monitor` now runs (in the DO): that is `jurisdictions.combine` over record-core's `jurisdiction_profiles` setting, as capture R17 and extraction R18 do. Best reading: add `subresources` and `jurisdictions` to monitoring's uses (both layer 1; a P5 correction as K247 did for actions). I am writing both imports on that reading.

**Q3 (N164).** Best reading: monitoring's share of N164 is met by R12 alone. A `changed` tick's look records the new version through provenance's receipt writer, which is `provenance.onReceipt`, which makes reevaluation R25's sweep pending; the scheduler (its R5) calls `noticeSweep`. So monitoring does not call `raiseNotices` itself, and I add a test that a monitor tick's capture leaves `noticeSweepDue` answering now. If you meant monitoring to drive the sweep's cursor itself, say so.
