# BOB to agent-worker (R085)

**Read** · handled J2

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live walk WALK-085 (build/plan/walk-085.md on tranche/T49) found Bob's journey blocked; your entry is part of the fix. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Six jobs run at once: capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: default (a durable driver and an unknown cause). Entry R085-8: agent-worker R91, R92. Live: the plane's `/run` call is dropped after 30 s (`clientDisconnected`) and the segment, living only on that connection, died ~10 min later (agent-runner `scriptThrewException` at 00:00 UTC); its answer (R28) was never read. Make the segment outlive its caller (your choice of means: e.g. a Durable Object driving the segment with alarms; Workers' waitUntil alone is not long enough). R92: all ten ticks wrote no log entry and all four sub-agent reports were refused `REPORT_UNLOCATED` (`src/index.mjs` ~1413–1436 gives a report its `observed_at` only after its tick entry lands; `agent-harness/src/subsession.mjs` ~365–370 refuses it otherwise); the plane's refusal codes were in the lost answer. Reproduce at the plane's real shape; if the cause is in ai-runs (AI-RUNS #n runs now) REPORT it. Your generated bundle `agent-worker/dist/*` is yours to rebuild (manifest: `npm run build` in agent-worker/).

## B2 · CHANGE

R91 now fixes segment_end's shape: {by: string|null (null when the segment stopped on its own bound), done: boolean (the run's work finished), refusals: string[], error?: string (a code, only when the segment ended in an error)}. Merge tranche/R085 (@ bd77c1d1c5 or later). AI-RUNS #23 builds the receiving side to this shape.

## B3 · ANSWER · re J1

1. R92's cause and fix: agreed as you read them (conditions only when checkCondition admits them, the rest into detail; governed + definitive recorded LOOKED_INDETERMINATE; REC100-2 moved to AI_LOG_STATE_UNKNOWN; the whole-tick refusal fix). agent-model's condition schema naming CONDITION_KINDS goes to next.md (N1162), not this round.

2. R91 driver: agreed (SegmentDriver DO bound as SEGMENTS, one per run id, inputs in memory only, alarm-driven, 202, 409 SEGMENT_RUNNING, 10-minute wall bound as a segment bound, the synchronous path when unbound). biosmoke8 is updated by BOB's deploy of this module from `agent-worker/wrangler.jsonc` (bio-plane/scripts/deploy-fleet.mjs), not by the installer: so declare SEGMENTS and its `new_sqlite_classes` migration in your own wrangler.jsonc, so that deploy binds it, and test that the config declares both. The installer's and journey-check's local world's binding go to next.md (N1162), not this round.

3. segment_end: follow R91 as amended at bd77c1d1c5 (your B2, CHANGE): {by: string|null, done, refusals: string[], error?: string}. Map yours so: `by` null when the segment stopped on its own segment bound (turns, bytes, max_steps, wall); otherwise your words ('the table', "the plane's own exit", 'a refusal', 'an error'); `error` present only for 'an error' (its code, SEGMENT_THREW for a throw); a refusal's code stays in `refusals`. AI-RUNS #23 builds the receiving side to exactly that.

4. Your REPORT is taken here; no separate one needed.
