# ai-runs (R085)

**Status** · session_01RDWpf3BhWXAiW97xm3Ppkk · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two points on R84, one needs a change outside ai-runs.

1. `failed` has no home. R84 says a segment that ended in an error ends the run with bound `failed` and the error's code as condition. But `run-rules` R1/R2 (`RUN_ENDINGS`, `checkBound`, `runStatusFor`) know no ending `failed`, so `#aiRunTerminate` refuses it (AI_RUN_BOUND_UNNAMED, C-22.5); and the condition goes through observation-log's `CONDITION_KINDS` (C-22.4), which has no kind for a segment's error code, so any code would be refused. Neither is mine. My best reading: `run-rules` adds the ending `failed` (status `failed` or `stopped`, your call; "the run's segment ended in an error") and `observation-log` adds a condition kind `segment-failed`, with the error's code carried in the terminal entry's detail and not in the condition. Until you answer I build the continue arm and the log entry, and the error arm calls the one exit with `failed`/`segment-failed`; its test will pass once those two modules carry the words. If you prefer ai-runs to carry the code as the condition, say which kind.

2. The `segment_end` shape I read, for agent-worker R91 (`airuntick` body field): `segment_end: {by: string|null, done: boolean, refusals: string[], error?: string}`. `by` is R28's `ended.by` (null when the segment stopped on its own segment bound); `done` true means the run's work is finished (no re-dispatch); `error` is a code string when the segment died in an error (absent otherwise); `refusals` the R28 codes. ai-runs logs it at level `meaning`, subject `segment -> end`, and, when `done` is false, no `error`, and the run is still running with bounds remaining, dispatches the next segment from inside that tick's handling (member runs by `dispatchMemberRun`'s path, organisation-credential runs by the wake's). Tell agent-worker if its shape differs.
