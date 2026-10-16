# ai-runs (R085)

**Status** · session_01RDWpf3BhWXAiW97xm3Ppkk · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two points on R84, one needs a change outside ai-runs.

1. `failed` has no home. R84 says a segment that ended in an error ends the run with bound `failed` and the error's code as condition. But `run-rules` R1/R2 (`RUN_ENDINGS`, `checkBound`, `runStatusFor`) know no ending `failed`, so `#aiRunTerminate` refuses it (AI_RUN_BOUND_UNNAMED, C-22.5); and the condition goes through observation-log's `CONDITION_KINDS` (C-22.4), which has no kind for a segment's error code, so any code would be refused. Neither is mine. My best reading: `run-rules` adds the ending `failed` (status `failed` or `stopped`, your call; "the run's segment ended in an error") and `observation-log` adds a condition kind `segment-failed`, with the error's code carried in the terminal entry's detail and not in the condition. Until you answer I build the continue arm and the log entry, and the error arm calls the one exit with `failed`/`segment-failed`; its test will pass once those two modules carry the words. If you prefer ai-runs to carry the code as the condition, say which kind.

2. The `segment_end` shape I read, for agent-worker R91 (`airuntick` body field): `segment_end: {by: string|null, done: boolean, refusals: string[], error?: string}`. `by` is R28's `ended.by` (null when the segment stopped on its own segment bound); `done` true means the run's work is finished (no re-dispatch); `error` is a code string when the segment died in an error (absent otherwise); `refusals` the R28 codes. ai-runs logs it at level `meaning`, subject `segment -> end`, and, when `done` is false, no `error`, and the run is still running with bounds remaining, dispatches the next segment from inside that tick's handling (member runs by `dispatchMemberRun`'s path, organisation-credential runs by the wake's). Tell agent-worker if its shape differs.

## J2 · COMPLETE

COMPLETE. R82, R83, R84 applied as reworded by B2 (merged tranche/R085 @ bd77c1d1c5).

**Entries applied** (`bio-plane/src/ai-runs/index.mjs`)
- R82: the dispatch waits 10 s (env `AI_RUN_DISPATCH_WAIT_MS` overrides) for agent-worker to accept. `202 {accepted: true}` is `RUNNING` and counts as dispatched; an older `200 {ok: true}` stays `DISPATCHED`. No acceptance within the bound is now `SILENT` with the "did not complete ... still resumable" entry (the old 30 s "still running, no entry" reading is retired). An accepted dispatch also extends the lease.
- R83: `AI_RUN_LEASE_MS` is 10 minutes (env `AI_RUN_LEASE_MS` overrides) and is used by open, tick, the wake's hold and the wake tick cadence. An accepted dispatch counts as a heartbeat.
- R84: `tick` takes `segment_end`, normalised to `{by, done, refusals, error}`, and appends level `meaning`, subject `segment -> end`, with the refusal codes and the error code in `detail`. The answer carries `segment_end: {logged, next}` with `next` one of continue, done, error, ended. The new `tickAndContinue` (what `op=airuntick` now calls) dispatches the next segment when `next` is continue: a member's run through `dispatchMemberRun` (fresh segment credential), an organisation-credential run through the wake's resumer and decision. Anything not dispatched appends one `meaning` entry saying why. An error is logged and not dispatched again; the run ends on its lease, with no new ending or condition kind.

**Tests**: new `bio-plane/test/m/ai-runs/r085.test.mjs` (R82 x2, R83, R84 x2, each with its control). Four older tests, which pinned R15's hour and B6's "slow worker is RUNNING", were updated to R83/R82 (open, reads, scheduler, t46, tick-close). A dispatch's lease uses the real clock, so t46's reaper arm reaps at now+1 h.
- `node --test bio-plane/test/m/ai-runs/`: 114 pass, 0 fail.
- Users of the module: run-productions 59, capture-requests 123, skills 125, question-explorer 34, intent 82, investigation 32, agent-worker 20, all 0 fail. case-account: 40 pass, 1 fail (t46 R16 ADVOCACY_NOT_OWN_PROJECT / words.json), which fails identically without my changes (not mine, not in my path).
- Checks: format 0 failures; architecture 0 failures; coverage 53 of 53 live ids named, 0 failures; ownership 0 failures (8 files).

**Deferred**: none. **Other modules**: only case-account's pre-existing failure above, against its R16. No generated artifact staled (nothing in agent-worker's bundle inputs changed; the plane bundle reads ai-runs only through the op map, which keeps its keys).
**Note for agent-worker (R91)**: the plane's dispatch takes `accepted: true` as the acceptance; `ok: true` alone still counts but reads as a finished segment.

Size (session_01RDWpf3BhWXAiW97xm3Ppkk): test runs 9, module lines 3760
