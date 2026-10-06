# action-plans (T33)

**Status** · session_01HZzMgFGmXynYpFRSjTXJZH · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Two points on T33-77 (R38), both needed before COMPLETE; I carry on with the readings below.

(1) `build/modules.json`: action-plans' `uses` does not list `duties`, though the requirements' Uses gained it at T33's fold (`duties`: `occurrencesOf`, `transitionsOf`). R38 needs the import, so `checks/architecture.mjs` will refuse it until `duties` is added to action-plans' `uses`. modules.json is BOB's: please add `"duties"` to action-plans' `uses` on `tranche/T33` and tell me; I merge it before running the checks.

(2) R38's "occurrence absent: the next occurrence triggered after the phase's predecessor started". The form `{when_duty: {duty, occurrence?}, state}` names no predecessor phase, so "predecessor" is ambiguous. My reading, which I am building: a `when_duty` phase's predecessor is any phase whose `branches` lead to it; its anchor is the instant that judgement led there (not yet judged that way: the phase has not started and no occurrence is picked); with no such phase, the anchor is when the scenario's current version was set (as `plan_start`). A branch that leads to a `when_duty` phase sets its anchor rather than starting it; the duty state starts it. The next occurrence is the first `duties.occurrencesOf` derives with a trigger on or after the anchor's day. The alternative would be an optional `after: phase` inside the form, which changes R14's shape; I am not building that unless you rule it.
