# question-explorer (T46)

**Status** · session_01GeT9fP1FRcQtkxE7QkN58C · depth 2 · WORKING · handled B0

## J1 · QUESTION

R16's edge, when only one of the two parts is admitted on the exception. My best reading, which I am building on:
- The gauge is the explorer's work, so the bar R16 means by "whenever the bar is held" is `explore`'s (ai-runs R75's record for part `explore`).
- `explore` admitted with a label (its bar not held) and `investigate` admitted either way: the gate is open on the exception; R4 answers `false_alarm_rate` null, `gold_set` null, `untested` = `explore`'s label; each find carries that label (recorded at the find, so a later bar never removes it, as extraction R71 does for a reading).
- `explore`'s bar held (R7's rate at most 20% recorded) and `investigate` admitted on the exception: R7 as now, `untested` null on the gauge (the run itself carries `investigate`'s label through ai-runs R78).
- Either part not admitted: shut, as now.
Also: until ai-runs R78 merges, the gate reads `aiRuns.partAdmitted` when present and otherwise `run-rules.partDeployableOn` over `aiRuns.verifications()`/`testBarRecords()` (no exception). My fixture's ai-runs stand-in answers R78 through `run-rules.partAdmittedOn` when present, else a bridge of R29's rule; I drop the bridge at your CHANGE announcing run-rules' and ai-runs' merges. Found and fixed: the default `held` read `aiRuns.testBars()`, which ai-runs does not have (it is `testBarRecords()`), so on a live instance the gate could never open.
