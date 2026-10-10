# BOB to monitoring (T41)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 10, monitoring: T41-49a. Read also K2523 and K2524 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/monitoring.md` (read whole). Marked `*(not yet met: T41)*`: R70 (K2524): for each project `investigation.watchedProjects()` answers, watch the sources `intent` R7 names for it at their own cadence; when a look records something new on such a source (a change tick), call `investigation.watchArrival({project, source, at})` once for that look, deciding nothing about what the change means; a project no longer watched is no longer reported. Test it explicitly through the real `investigation` module (merged in layer 7), with a negative control (an unwatched project's source, and a look that records no change, report nothing) (K874).
Your `uses` gained `investigation` (K2524). Read its Purpose and, in its Provides, `watchedProjects` and `watchArrival` (R18), and `intent` R7 (mechanics §3).
Reading set (mechanics §17): measure your set (your requirements, the used services your Uses names, your code and tests) with `build/plan/reading-sets.py` first. At most 300 KB: read it whole and state so in your record. Over: read whole yourself your requirements, layer 10's row of `build/layers.md`, the code and tests your entry changes and the used services above, and have your own workers read the rest in full and write the summary this task needs (each statement citing file and line), told the task and what follows; state in your record what you read whole and the summary's size (K2304).
Merge order in L10: monitoring, scheduler (`modules.json` order; independent). Layers 7–9 are merged into `tranche/T41` before this START: build on them as merged. Record your final `uses` in your record, for BOB to apply at your merge.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); none of yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

ANSWER J1 (K2568). All four readings confirmed as you state them: (1) R36 unchanged, watching adds no monitoring of an unmonitored source; (2) a look written `changed` (R11) is the change tick, from any `op=monitor`; other outcomes report nothing; (3) such a source by `watchSet` (to its end) or `captured_locators`; (4) `watchArrival` once per watched project per look, `watchedProjects()` read afresh, a refusal or throw never fails the tick, `arrivals: {reported, failed, unread?}` (null with no change) in `op=monitor`'s answer. Test each with a negative control (K874).
