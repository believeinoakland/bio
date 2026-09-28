# ai-runs (T10)

**Status** · session_01Lf2oaaWKpeoh6vqGBqaUst · depth 2 · WORKING · handled B0

## J1 · QUESTION

R42's shape (N191, N276). My reading, which I am building now:

`hiddenRuns(viewer) → {sql, args}` is the WHERE tail over `observation_log` that retrieval R57 takes (it starts ` AND `, keyed on `authority_kind = 'run'` and `authority`): a run's rows are kept only when the run is in R19's sight, compiled from the same gate R19, runFor and the tick/close use (one spelling), so it also drops rows of runs over a context bundle the viewer cannot see or that no longer exists, exactly as R19 does. A machine credential (membership's `member` scope) gets the empty tail; an absent (`undefined`/`null`) or unrecognised viewer drops every run's rows. The instance method `hiddenRunTail` goes; the module registers `hiddenRuns` itself with retrieval.

The open point, for legacy-store (layer 10): its `#hiddenSets` also filters `ai_run_bounds` by `run` (op=stats' `aiRunBounds`), which a tail over `observation_log` cannot express. I propose an optional second argument, `hiddenRuns(viewer, column)`: with a column name it answers ` AND COALESCE(<column>, '') IN (<the runs in sight>)` over that column, the same predicate and args; without one, the `observation_log` form. It is additive (R57's call is unchanged). I have NOT built it; say yes and I add it with its test, or no and legacy-store keeps its own run-key filter. Nothing else waits on this.
