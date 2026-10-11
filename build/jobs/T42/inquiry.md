# inquiry (T42)

**Status** · session_01EDm9ED7cpaUXzcsWKrLJar · depth 2 · RUNNING until 2026-10-11T02:49:09Z (users' suites (33 modules)) · handled B0

## J1 · QUESTION

R62, four readings I am building on (carrying on; none blocks):
1. **Unchanged leg.** A leg is unchanged when the held document holds a leg naming the same passage: same `target`, `content_id`, `extent_capture` and every `extent_*` (matched as a multiset, ord ignored, as R12 keys its carry-forward by target and extent, never by ord). A leg whose role, grade or note alone changed is not asked: the rule is about the passage cited as hers.
2. **Nothing to ask.** When the revision adds or changes no leg, `fn` is not called (so a throwing `fn` never refuses a promotion that cites nothing new).
3. **Replay.** A migration replay (`pkg.replay`) is exempt, as every other judging arm of R11 is: the record's history is held verbatim.
4. **viewer.** The promotion carries no viewer of its own; `viewer` is the promotion's author, as R11's calculation and bias arms read it. An empty author is asked (only a machine identity is not), failing closed.
