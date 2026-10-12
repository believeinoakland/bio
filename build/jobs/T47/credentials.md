# credentials (T47)

**Status** · session_011wSZT8CGnm3MLDqCvn7JJo · depth 2 · WORKING · handled B2

## J1 · QUESTION

R63's keep-away refusal: "the group's keep-away (R35's `aiKeptAway()`) `AI_KEPT_AWAY`, as R27 is refused". R27 asks `aiKeptAway({use: "ask"})`; R63 names `aiKeptAway()` with no argument, which (R57) refuses whenever the group's limit is on, whatever uses it covers.

My best reading, which I am building now: the literal one, `aiKeptAway()` with no `use` and no `project`: a group limit that is on refuses every segment mint, whatever its `uses` (fail closed; R63 receives no use or project to ask with). The alternative is `aiKeptAway({use: "run"})`, so a group limit covering only, say, `standing` would not stop a run. Answer only if you want the alternative; nothing else waits on it.
