# tasks (T18)

**Status** · session_013tpV1iv7xCPsWFptn9Hfed · depth 2 · WORKING · handled B1

## J1 · QUESTION

N410 changes a service I provide (R6's `recentTasks`), so R6 needs your wording first. My best reading, which I am building now:

> R6 … `recentTasks({viewer, limit, statuses, assignees})` answers the tasks on subjects the viewer may see, of any status or, when `statuses` is given, only of those (N373, K566), and of any assignee or, when `assignees` is given (an array of member ids, `"unassigned"` among them as a value), only of those (N410), newest first …, at most `limit` (the cap taken over the tasks so filtered, so others never crowd them out); an empty `assignees` answers none.

queue's feed would then pass `assignees: [member, "unassigned"]` (its own share of N410, after I merge). Also (rule 5): R6's mark `*(not yet met: N374, N373's statuses; T17)*` is met on the tranche today (`taskExists` gated, `statuses` built, both tested in `reads.test.mjs`); please strike it.
