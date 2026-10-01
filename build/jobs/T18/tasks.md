# tasks (T18)

**Status** · session_013tpV1iv7xCPsWFptn9Hfed · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

N410 changes a service I provide (R6's `recentTasks`), so R6 needs your wording first. My best reading, which I am building now:

> R6 … `recentTasks({viewer, limit, statuses, assignees})` answers the tasks on subjects the viewer may see, of any status or, when `statuses` is given, only of those (N373, K566), and of any assignee or, when `assignees` is given (an array of member ids, `"unassigned"` among them as a value), only of those (N410), newest first …, at most `limit` (the cap taken over the tasks so filtered, so others never crowd them out); an empty `assignees` answers none.

queue's feed would then pass `assignees: [member, "unassigned"]` (its own share of N410, after I merge). Also (rule 5): R6's mark `*(not yet met: N374, N373's statuses; T17)*` is met on the tranche today (`taskExists` gated, `statuses` built, both tested in `reads.test.mjs`); please strike it.

## J2 · COMPLETE

**Entries applied** (plan layer 11, tasks):
- **N410** · `recentTasks` takes `assignees` (an array of member ids; `"unassigned"` a value like any other): only tasks so held, the cap taken over them alone, an empty array answers none, absent means any; gated as before. Built on J1's reading of R6 (awaiting your wording). queue's share (pass `assignees: [member, "unassigned"]` in `queueFeed`'s OBLIGATION read, `queue/index.mjs` ~765) is queue's to make after this merges.
- **N412** · `TASK_NOT_YOURS`' `reason` and `code` literals on one line in `#refuseNotYours`, its one mint. Measured with `civicos-ui/check-refusal-codes.mjs`: arm G's `TASK_ACTOR_CHECKS.TASK_NOT_YOURS … 2 literal sites` failure is gone, `multiSiteCodes` 68 → 67 (the other 13 over the ceiling are other modules').
- **Convert `d280-strengthbar`** (§5, row in T17 legacy-tests): new inbox test drives R1's routing with connections' real `edgeSevered` over real citing `bundle.md`s: the withdrawn first citer passed over, the next live citer's owner routed, the basis naming it; both withdrawn → the administrator fallback. Also corrected a misleading comment in the existing R1 test.
- **Convert `queue`** (no row): its tasks share (unassigned when no manager and no admin; any member resolves it once, attributed; a body's extra field writes nothing) as one inbox test.
- **R6's `not yet met` mark** (N374, N373's `statuses`): met; please strike (rule 5).

**Deferred:** none. **Rows moved or changed:** none (no catalogue, store or `src/index.mjs` edit; nothing `awaiting stamp`). **Other modules:** queue, N410's share above. **Generated artifacts:** none staled (tasks is not a bundle input).

**Tests and checks:** `node --test bio-plane/test/m/tasks/` 71 pass, 0 fail; queue's (a user of R6) `bio-plane/test/m/queue/` 49 pass, 0 fail. format: 0 failures; architecture tasks: 0 failures; coverage tasks: 11 of 11 live ids named, 0 failures; ownership tasks tranche/T18: 4 files, legacy-store 0 added/0 removed, 0 failures.

Size (session_013tpV1iv7xCPsWFptn9Hfed): test runs 5, module lines 955
