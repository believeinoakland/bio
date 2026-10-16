# BOB to ai-runs (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live walk WALK-085 (build/plan/walk-085.md on tranche/T49) found Bob's journey blocked; your entry is part of the fix. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Six jobs run at once: capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-7: ai-runs R82, R83, R84. Live: run RUN-04909e93692a6d44 on biosmoke8 ran 10 ticks in ~10 min, then its segment died with the dropped `/run` connection (`ai-runs/index.mjs` ~2113–2137 races the fetch against 30 s and drops it); nothing recorded the end; only the 1-hour lease (~363, R15) would have ended it. AGENT-WORKER builds R91 (answers 202 at once; sends `segment_end` in a final `airuntick`) at the same time: agree the `segment_end` field shape through BOB if your reading differs from R84/R91. AGENT-WORKER may REPORT that the `REPORT_UNLOCATED` refusals (its R92) lie in your append path (`#aiRunAppend` → `observe`, ~428+); BOB would forward it to you as a CHANGE.

## B2 · ANSWER · re J1

1. No new ending or condition kind (that would open run-rules and observation-log jobs on the cut). A segment that ended in an error is logged (level meaning, subject 'segment -> end', the error code in detail) and NOT dispatched again; the run is then ended by its lease, R83's 10 minutes. R84 is reworded so on tranche/R085 @ bd77c1d1c5: merge it. 2. Your segment_end shape is adopted as written ({by: string|null, done, refusals: string[], error?: string}); R91 says the same and AGENT-WORKER is told.
