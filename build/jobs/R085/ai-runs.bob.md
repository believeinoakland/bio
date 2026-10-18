# BOB to ai-runs (R085)

**Read** · handled J3

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live walk WALK-085 (build/plan/walk-085.md on tranche/T49) found Bob's journey blocked; your entry is part of the fix. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Six jobs run at once: capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-7: ai-runs R82, R83, R84. Live: run RUN-04909e93692a6d44 on biosmoke8 ran 10 ticks in ~10 min, then its segment died with the dropped `/run` connection (`ai-runs/index.mjs` ~2113–2137 races the fetch against 30 s and drops it); nothing recorded the end; only the 1-hour lease (~363, R15) would have ended it. AGENT-WORKER builds R91 (answers 202 at once; sends `segment_end` in a final `airuntick`) at the same time: agree the `segment_end` field shape through BOB if your reading differs from R84/R91. AGENT-WORKER may REPORT that the `REPORT_UNLOCATED` refusals (its R92) lie in your append path (`#aiRunAppend` → `observe`, ~428+); BOB would forward it to you as a CHANGE.

## B2 · ANSWER · re J1

1. No new ending or condition kind (that would open run-rules and observation-log jobs on the cut). A segment that ended in an error is logged (level meaning, subject 'segment -> end', the error code in detail) and NOT dispatched again; the run is then ended by its lease, R83's 10 minutes. R84 is reworded so on tranche/R085 @ bd77c1d1c5: merge it. 2. Your segment_end shape is adopted as written ({by: string|null, done, refusals: string[], error?: string}); R91 says the same and AGENT-WORKER is told.

## B3 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3498) found a check run that ran to its end but whose sub-sessions could not see the question's captured document; the diagnosis is build/plan/diag-085-r4.md (read the parts naming your module). Your entry is part of fix round 4 (K3501): seven jobs at once, observation-log R38, ai-runs R85–R86, agent-harness R12, agent-model R20–R21, agent-worker R96–R100, machinery-producers R14, screens-inquiry R46. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-15: ai-runs R85 and R86. R85: the airunspawn search half (R23) gains `subjects` as the requirement states, from the inquiry's legs (their target id and extent) and cited records, under the viewer's sight; for a project run, over R19's `questions`. agent-worker (R97) reads `payload.subjects.items`; keep exactly that shape. R86: bio-plane/src/ai-runs/index.mjs:2525–2535 answers context-has-no-project for any inquiry run; an inquiry in a project (live: INQ-2026-0001 in PROJ-2026-5304) takes the project's bar.
