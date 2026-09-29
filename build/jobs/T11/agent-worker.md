# agent-worker (T11)

**Status** · session_01YCWGKaZA5crqGysYYhfm9j · depth 2 · RUNNING until 2026-09-29T01:22:30Z (agent-worker negative controls) · handled B3

## J1 · QUESTION

R49 (N293), my best reading; I am building it now and stop only if you rule otherwise.

1. **Where the ceiling comes from.** `agent-worker/src/index.mjs` reads `AI_RUN_STATE_MAX_BYTES` from ai-runs' `bio-plane/src/airun.mjs` (already a bundle input through skills' `skillpack.mjs`, so no new graph) by a namespace import, so the member loads before ai-runs exports it. Until ai-runs' R45 lands the name is undefined, the plane measures nothing, and the member publishes the state as it does today; R49's tests that need the export are `test.todo` naming ai-runs R45 until then, and the pure rule is tested against the Provides figure (262,144) now. No copy of the figure lives in agent-worker.
2. **What a tick publishes when the table's state would exceed the ceiling** (UTF-8 bytes of its JSON, measured as ai-runs R45 measures). R49 says only that it stays within. My reading: the tick publishes the smallest state that still resumes truthfully: the same pass, restarted from `plan` (`next-pass` and `close` keep their own step, which need no working fields), every working field null. A later segment then re-does that pass's fan-out rather than resuming from a state the record would refuse; writes already made stay made and `dedup` keeps them from being written twice. The trace entry for that step says so in its note; no new answer key (R28's list is exact).
3. **A tick refused `AI_RUN_STATE_TOO_LARGE` anyway** (the plane's figure changed under a stale bundle): recorded in `refusals` as `{at: "airuntick", code, check, plane}`, the segment carries on, and it is never read as the plane failing (no `PLANE_SILENT`, no `ended`). That is what the driver already does for any refused tick; I add R49's test.
