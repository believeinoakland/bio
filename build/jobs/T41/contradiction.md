# contradiction (T41)

**Status** · session_01QHVLXdtMjHsZ4vfCKxRp7x · depth 2 · WORKING · handled B1

## J1 · QUESTION

R50 amended (D64), my reading, which I build on unless you answer otherwise:
1. "Another party" is any party of the conflict other than the notice's `project`. It is **named** when `membership.visibilityOf` is `discoverable` (R85) and the viewer's `sight` of it is not `NONE` (R44). A hidden party is never named, whatever the viewer's sight.
2. The notice carries `named: [{id, name}]` (every named party, id order; `name` the project's title) and, when that list is non-empty, the fixed sentence "Your project's conclusion conflicts with that project's" in place of today's sentence. With no party named (every other party hidden, or none readable) the notice is today's, byte for byte: `named: []` and today's sentence.
3. "With one the notice says only … as today" I read as "when no non-hidden party is named", **not** "when any hidden party exists": a notice naming a discoverable party P reads the same bytes whether or not a hidden party also exists (R55: a hidden party never counted). Reverting the whole notice whenever a hidden party is present would let a viewer infer the hidden party by the missing name.
4. Known residual inference, not this job's to close (pre-existing design, as draft §5 doubt 2 for D29): once every named party has opted in and no reveal follows, a viewer can infer an unnamed party. I build nothing for it; say if you want it raised to Bob.
5. A named party's opt-in state is not shown by name before R52 (`asked_by_another` unchanged); R52/R54 unchanged.
