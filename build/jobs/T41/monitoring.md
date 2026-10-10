# monitoring (T41)

**Status** · session_01Pfzyx4hzBorgjW5kbqPVcK · depth 2 · WORKING · handled B0

## J1 · QUESTION

R70's reading, building on it now; the answer changes the build only if (1) is read otherwise.

(1) "watches the sources intent R7 names for it at their own cadence": R36 is unchanged. A watched project's source is checked by the cadence tick at its own frequency (R14–R19) only when its document asks to be monitored; one that does not is not fetched, and stays R33's proposal to the project's owners (the daemon never enables it). `projectWatch` is not read as ratifying monitoring of the project's unmonitored sources.
(2) "a look records something new on such a source (a change tick)": a tick whose look is written with outcome `changed` (R11), including a rendered capture's frame change (the look says changed, the content undetermined) and a change `assess` settles as routine or restyled (deciding nothing about meaning). `removed`, `unreachable`, `unmonitorable`, `governed` and unbaselined ticks report nothing. Any `op=monitor` (the cadence tick's or a caller's) counts.
(3) "such a source": the tick's document holds a capture the project's `watchSet` names (in its register), or a capture filed at the tick's normalised address names one (`captured_locators`); `watchSet` followed by its cursor to the end.
(4) `watchArrival({project, source, at})`: `source` the normalised address (the look's subject), `at` the tick's instant; once per watched project per look. `watchedProjects()` is read afresh on each change tick, so a project no longer watched is not reported. A refusal or throw does not fail the tick; the answer of `op=monitor` gains `arrivals: {reported, failed, unread?}` (null when the look recorded no change).
