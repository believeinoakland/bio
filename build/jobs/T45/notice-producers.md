# notice-producers (T45)

**Status** · session_01SxeNT2u2jzZVk4x8bDxKJA · depth 2 · COMPLETE · handled B0

## Completion (T45-42)

**Read.** Whole: `build/requirements/notice-producers.md`; START B1 and the plan's T45-42 entry and reconciliation R5; K2780, K2781, K2787 (their `rulings.md` lines), K2874, K2878; `following` R25 and its `dutyWatchEnd` code; `steps` R12, R29 and `stepsDue`/`registerDueHolder` code; `duties` R7, R20; this module's own code (`index.mjs`, `words.mjs`) and every test file under `test/m/notice-producers/`, every line (P20). The used modules' public parts over the 600 KB set (mechanics §17 (3)): one helper read in full the Public parts of following, steps, duties, action-producers, action-clocks and queue and wrote a digest citing each section (following R22, R24, R25; steps R12, R23, R29; duties R10, R28; action-clocks R16, R17; action-producers R1, R4; queue R1, R11, R16, R51, R52).

**Entries applied.**
- R5 (T45): an occurrence whose due day (when undetermined, its latest candidate's) falls after `following.dutyWatchEnd(duty)` is no item; on or before it, raised as before; null, R5 as before. The end is read once per duty adopted by this member. A `dutyWatchEnd` that throws fails R5's read and is named `following` in `facts.failed` (R1). An answer that is not a day is read as no end, so the duty is still told. An occurrence with no due day read stays told. The duty and its occurrences are read as before (duties R10).
- R17 (T45): no code change. `stepsDue` leaves out a held step (steps R29), and this module reads it as before, with no read of `action-clocks`. The new test proves it over the real `steps`.

**Found in my own module.** None. I checked R5's direct SQL read of `duties.obligor`: it is allowed by `duties` R20's stated read contract.

**Deferred.** None.

**Found outside my module (REPORT to BOB).**
1. `action-clocks` R17 / `action-producers` R1. A clock entry with `noticed_by` raises no `action-clock-overdue`, because R5's "Noticed" item replaces it. R17 sets `noticed_by` from the adopted duty's occurrence alone and does not check `dutyWatchEnd`. Once a watch on that duty ends, R5 draws no item and the clock item is still held back, so that fact reaches nobody. Neither requirement says this is intended.
2. R5's text, as I read it, edge case. A possibly-overdue occurrence (between its candidates) can already be told before its latest candidate. If a plan stops its watch with an end day before that latest candidate, the item leaves, because the latest candidate falls after the end. R5 says to compare the latest candidate, and "unchanged" covers earlier occurrences, so I built it as written. queue R16 says a FINDING leaves the team's list only by a disposition (D-79). Whether such an item should stay is BOB's.
3. Reds that are not this module's: `test/conclude-project.test.mjs` and 8 of `test/m/plane/` fail from `queue-producers` (`this[#actions].holdsDue is not a function`) and from the route maps of `local-facts`/`filing-templates`/`project-roster`. `conclude-project` fails the same way with my change removed.

**Tests and checks.**
- `node --test test/m/notice-producers/` (from `bio-plane/`): 102 tests, 102 pass, 0 fail (97 before, plus 5 new). New tests: four R5 (T45) tests in `duties.test.mjs` (stopped with a no-link control; kept until a day; latest candidate; following failure and malformed end) and one R17 (T45) test in `investigation.test.mjs` (a held step, with a no-holder control). Against the old source the four R5 tests fail.
- Users: queue (`test/m/queue/`, `test/conclude-project.test.mjs`): 137 tests, 136 pass, 1 fail (conclude-project, not mine, above). plane (`test/m/plane/`): 196 tests, 188 pass, 8 fail (not mine, above). `migrate-released` also fails; it ran 513 s and was not traced further.
- Checks: `format: 153 modules, 152 requirements files; 0 failures`. `architecture: 15 product files, 71 relative imports (0 naming no tracked file, not judged); 0 failures`. `coverage: 1 modules, 17 of 17 live requirement ids named by a test; 0 failures`. Ownership is in J1, run after the commit.
- No generated artifact was touched. The plane bundle includes this module's source, so it is stale until L11's close regenerates it.

Size (session_01SxeNT2u2jzZVk4x8bDxKJA): test runs 9, module lines 1435

## J1 · REPORT

Two findings outside my module, from T45-42 (full text in my record, Completion). (1) action-clocks R17 / action-producers R1: a clock entry with noticed_by raises no action-clock-overdue because R5's Noticed item replaces it. But R17 sets noticed_by without reading following.dutyWatchEnd. Once a plan's watch on the duty ends, R5 draws no item and the clock item is still held back, so the overdue fact reaches nobody. (2) R5 as written: a possibly-overdue occurrence already told between its candidates leaves when a stop's end day falls before its latest candidate. I built it as written. queue R16 (a FINDING leaves only by disposition) may want it kept: yours to rule. Also, not mine: conclude-project and 8 plane tests are red from queue-producers (holdsDue is not a function) and other modules' route maps. Same red without my change.
