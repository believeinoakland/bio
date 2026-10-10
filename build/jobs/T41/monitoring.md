# monitoring (T41)

**Status** · session_01Pfzyx4hzBorgjW5kbqPVcK · depth 2 · RUNNING until 2026-10-10T20:19:53Z (migrate-released system test, mine against tranche/T41) · handled B2

## J1 · QUESTION

R70's reading, building on it now; the answer changes the build only if (1) is read otherwise.

(1) "watches the sources intent R7 names for it at their own cadence": R36 is unchanged. A watched project's source is checked by the cadence tick at its own frequency (R14–R19) only when its document asks to be monitored; one that does not is not fetched, and stays R33's proposal to the project's owners (the daemon never enables it). `projectWatch` is not read as ratifying monitoring of the project's unmonitored sources.
(2) "a look records something new on such a source (a change tick)": a tick whose look is written with outcome `changed` (R11), including a rendered capture's frame change (the look says changed, the content undetermined) and a change `assess` settles as routine or restyled (deciding nothing about meaning). `removed`, `unreachable`, `unmonitorable`, `governed` and unbaselined ticks report nothing. Any `op=monitor` (the cadence tick's or a caller's) counts.
(3) "such a source": the tick's document holds a capture the project's `watchSet` names (in its register), or a capture filed at the tick's normalised address names one (`captured_locators`); `watchSet` followed by its cursor to the end.
(4) `watchArrival({project, source, at})`: `source` the normalised address (the look's subject), `at` the tick's instant; once per watched project per look. `watchedProjects()` is read afresh on each change tick, so a project no longer watched is not reported. A refusal or throw does not fail the tick; the answer of `op=monitor` gains `arrivals: {reported, failed, unread?}` (null when the look recorded no change).

## Completion

**Entry applied:** T41-49a (K2524; readings K2568): R70. `Monitoring.monitor()` (`index.mjs`), after a tick's look is written with outcome `changed`, reads `investigation.watchedProjects()` afresh and, for each project whose `intent.watchSet` (followed by its cursor to the end) names a capture the ticked document registers or one filed at its normalised address, calls `investigation.watchArrival({project, source: <the normalised address>, at: <the tick's instant>})` once (`#reportArrivals`, `#watchesAny`). A refusal or throw (of investigation or intent) fails no tick. The `op=monitor` answer gains `arrivals: {reported: [{project, source, at}], failed: [{project, reason}], unread?}`, null when the look recorded no change, naming only projects the caller may see (a member's session reaches `op=monitor`; a hidden project is reported to all the same). R36 unchanged: watching fetches nothing a document does not ask to be monitored for (R33's proposal stands). `investigation` reached through `deps.investigation` or `investigationOf(host)`.

**Tests:** `watch.test.mjs` (new; R70, R36), through the real `investigation` (`investigationOf` on the same host, as production reaches it; intent R7 and investigation's steps and questions stand in at their interfaces), with negative controls: a look recording no change (unchanged, removed, unreachable, governed) and an unwatched project's source report nothing; a capture neither registered by the document nor filed at its address is no source; a project closed (no longer watched) is no longer reported; an unmonitored watched source is never fetched; a watch set that cannot be read, and investigation's refusal and throw, fail no tick; a caller without sight of the project is not told of it.

**Reading set (K2304):** 969 KB measured (`reading-sets.py`), over 300. Read whole myself: `build/requirements/monitoring.md`; layer 10's row of `build/layers.md`; `bio-plane/src/monitoring/index.mjs` (the code the entry changes); investigation's Purpose and R18 and its `watchedProjects`/`watchArrival` code; intent R7 and its `watchSet` code; K2523, K2524. A worker read the rest whole (`checks.mjs`, `schema.mjs`, every other monitoring test and the fixture, the public parts of the 26 used modules, layer 10's sections, rule 4): about 1,060 KB read, a summary of about 2,400 words citing file and line. It found one thing I then built (the answer's sight, above) and nothing else in conflict.

**Deferred:** none.

**Found in other modules (REPORT):**
- `investigation`: its requirements' Provides (R18) name `projectWatch` and `watchArrival` but not `watchedProjects()`, which monitoring R70 calls and its code provides (`index.mjs`:1121); its `watch` field is only intent R7's first page (no cursor; monitoring follows it itself). `watchArrival` writes its arrival and then computes its reads (`quietState`, `projectStanding`, `milestonesOf`) outside the write, so a read that throws makes the caller see a throw for an arrival already recorded (found when the stand-in intent lacked `progress`).
- Generated artifacts: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is staled by this change (rule 4 (14)).

**Final `uses`:** as `modules.json` lists them (investigation already added).
