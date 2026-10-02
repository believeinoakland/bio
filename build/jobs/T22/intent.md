# intent (T22)

**Status** · session_016UvGqHeQmeB5Sdj9mw2LCb · depth 2 · WORKING · handled B0

## J1 · QUESTION

R18's "the reason is recorded on the run's opening and shown with its budget and scope": ai-runs' `open` (R9, R10) offers two places that its `read` (R19) shows beside `budget` and `context`: `label` (stored at open, never changed by a tick; `bio-plane/src/ai-runs/index.mjs`:985–990, read at :1727) and `state` (shown, but replaced by any tick that sends one, R12, so it is not a durable record of the opening). Neither needs an ai-runs change.

My best reading, which I am building now: `workObjective` passes the member's reason (trimmed) as the run's `label`, which wins over any `label` the caller put in `run`, so `read` and `listInContext` answer it as `session.label` with `budget` and `context` for the run's life; it also carries `reason` inside `state.instructions` beside the objective, condition, gaps and authority, so the assistant reads it, and in its own answer. If you want it elsewhere (e.g. state only, or a field ai-runs adds), answer and I will bring it in line.
