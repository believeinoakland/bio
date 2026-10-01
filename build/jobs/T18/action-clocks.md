# action-clocks (T18)

**Status** · session_01UKdcungjhYbWwBjvB2YNNz · depth 2 · WORKING · handled B1

## J1 · QUESTION

R3 and R5 answer "the action's project". Nothing in my uses states one: record-core's `bundleInfo` (its R34) answers `bundles.project`, but promotion commits every bundle with `project: null` (`promotion/index.mjs`:800), so for an action it is always null today; `actions` states no project on an action (its R46 `plan` link is action-plans', later in the order). queue-producers R15 routes "else its project's owners" on it.

My best reading, which I am building: `project` is record-core's `bundleInfo(action).project`, null where the record holds none (so null today), stated as such; the member who created the action (R3) is the author of its first manifest entry in write order (record-core R15/R16). If the project should come from elsewhere (the determination it rests on, via conformance; or the plan, via a field `actions` exposes in `actionRead`), that is a uses or requirements change for BOB; I will bring R3/R5 in line on your answer. Not blocking: nothing else I build depends on it.
