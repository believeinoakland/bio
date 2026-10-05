# tasks — requirements

**Status** · DRAFT by a worker for BOB, 2026-09-30, on `tranche/T16`, from `queue.md` under N363: Bob's approval of the queue split (K507), its seams ruled by BOB as drafted (K531, `build/plan/draft-N363-queue-split.md`). R1–R5 and R7–R11 are `queue`'s requirements moved with their meaning unchanged (`queue` R23, R24, R25, R41, the `tasks` half of R42; the inbox's share of R33, R35, R36, R37, R38); only cross-references are re-pointed. Layer 11, after `affordances`, before `queue-producers` and `queue`. `from`: `legacy-store` (K531: §12.2's exception is for legacy modules only, so this module writes its code in its own paths and `queue`'s job removes the moved code). R6 met by TASKS #1 (K562). T33's fold, by a requirements worker for BOB #114 on `tranche/T33`, 2026-10-05, from plan entry T33-86 (S0-11, B0.11; K1470's one id grammar): R12 (the task id read from `record-grammar`'s one id table) added; Uses gain `idPattern`; not yet met (T33-86).

**Size (P6).** About 780 lines of today's queue code move here (`queue/index.mjs` :67–76, :196–210, :3645–4171 in part; `checks.mjs` :53–73, :106–117, :124–276; `schema.mjs` :11–45), with about 410 lines of tests (`inbox.test.mjs`, part of `ledger.test.mjs`). Well under one reading.

## Public

### Purpose

The obligation inbox: tasks routed from captures whose authority is undetermined, drained from capture's queue under the task grammar (C-19.1), listed to the members who may see their subjects, and forwarded or resolved by their assignee, anyone when unassigned, or an administrator.

### Provides

**The obligation inbox: taskDrain, taskList, taskForward, taskResolve** (`op=taskdrain`, `op=tasks`, `op=taskforward`, `op=taskresolve`)
- **R1** `taskDrain({limit, actor, now})` takes up to `limit` (1–500, default 50) queued capture events in order. An event whose capture is filed in no bundle is kept with its attempts counted (`waiting`). One with a live task (open or forwarded) of its kind on that bundle adds a `folded` entry to the task's history. Otherwise a task is created, routed to an active owner of the bundle when it is a project, else to an active owner of the first project (by id) with a live `cites` edge to it, else to the earliest active administrator (the first member of `membership`'s `activeAdmins` after the founder, its R86; `group-admin`), else `unassigned`; an ungrammatical task (C-19.1) is dropped and reported under `refused`; an exhausted id space keeps the event, its `waiting` entry carrying `record-core.mintExhausted("TASK")`'s `code`, `check` and `detail` (its R62; N322). Answers `drained`, `created` (with each route's basis), `folded`, `waiting`, `refused`, `remaining`, `limit`. A consumer registered with `scheduler` runs it while events wait.
- **R2** `taskList({assignee, status, refersTo, limit, viewer})`: tasks on subjects the viewer may see, newest first, filtered as asked, at most `limit` (1–1,000, default 200), `truncated` measured one past the cap, and per-status counts over the visible set plus the queued-event count.
- **R3** `taskForward({id, to, actor, now})`: `NO_ACTOR`; `MACHINE_CANNOT_FORWARD` (C-32.10); `NO_SUCH_TASK`; `ALREADY_RESOLVED`; `TASK_NOT_YOURS` (C-76.1; its own code, apart from intent's C-111.15, N382) unless the actor is the assignee, the task is `unassigned`, or the actor is an administrator; `NO_SUCH_MEMBER` (an active member); `ALREADY_THEIRS`. Reassigns with role `member`, status `forwarded`, and appends `forwarded` with the actor to the history. `taskResolve({id, actor, now})`: `NO_ACTOR`; `MACHINE_CANNOT_RESOLVE` (C-32.11); `NO_SUCH_TASK`; an already resolved task answers `already: true` and writes nothing; `TASK_NOT_YOURS` as above; then status `resolved`, `resolved_at`, and `resolved` with the actor appended. With `items`, both run per item through `record-core.perItem` (its R50–R52).

**The task grammar** (a check registered with `promotion`, its R39, and with `record-core`, its R59)
- **R4** A non-replay promotion carrying `data/inbox.json` whose C-19.1 grammar finds an error is refused `INBOX_REFUSED` with `findings: [{check, detail}]`; a replay is exempt; a bundle without the file is not asked. The audit (record-core R59) runs the same grammar over each bundle's `data/inbox.json` and reports each error as C-19.1, as `checkBundle` did. R1's drain runs the same function over each candidate task. It is one function at all three, never a copy (promotion R38).

**Its share of the store's counts and the id ledger** (N342, K435; `record-core` R63, R40)
- **R5** At start this module registers with `record-core` (its R63) the figure of its table: `tasks` (a task naming a bundle in `hid` is left out, by `refers_to`). These are the keys and the subtraction `op=stats` and purge's proof answer today. It seeds `record-core`'s id ledger (its R40) with `["TASK", "tasks", "id"]` at start and again before its first mint; on a store whose ledger table is not yet created it learns nothing and never throws.

**Queue's reads** (N363; for `queue` R8, R19, R39)
- **R6** Three reads, each answering what `queue`'s feed reads today, so the feed does not change: `recentTasks({viewer, limit, statuses, assignees})` answers the tasks on subjects the viewer may see, of any status or, when `statuses` is given, only of those (N373, K566), and of any assignee or, when `assignees` is given (an array of member ids, `"unassigned"` among them as a value), only of those (N410; an empty `assignees` answers none), newest first (`created` descending, then `id`), at most `limit` (the cap taken over the tasks so filtered), each as `taskList` gives a task (R2); `resolvedTasks({viewer, since, limit})` answers the resolved tasks with `resolved_at` at or after `since` on subjects the viewer may see, `resolved_at` descending, then `id`, at most `limit`; `taskExists({id, viewer})` answers whether a task has that id on a subject the viewer may see (R2's gate; R9), so a task the viewer may not see answers as no task (N374, K565). Each never throws; a store without the table answers empty or false.

## Private

### Uses

- `record-grammar`: `isMachineStamp`, `isPublicHttpsLocator`, `ISO_TS_RE`, `BUNDLE_ID_RE` (R1, R3, R4); `idPattern` (R12; T33-86).
- `record-core`: `stampInstant`, `mintOpaqueId`, `mintExhausted` (its R62; R1), `bundleInfo`, `seedMintLedger` (its R40), `registerCounts` (its R63) (R5), `registerAuditCheck` (its R59; R4), `declarePurge` (R8), `perItem` (its R50–R52; R3).
- `membership`: `viewerPredicate` and `GATE_MARK` (the `taskList` gate, R2, R6), `projectOwners` (its R65), `memberFacts` (its R68), `activeAdmins` (its R86), `isAdministrator` (its R64) (R1, R3).
- `promotion`: `registerStep`, its R39, which registers R4's grammar as a promotion check (K462).
- `provenance`: `homeOf` (capture to bundle; R1).
- `capture`: the event queue its R15 writes (`taskEvents`, `taskEventAttempt`, `taskEventRemove`, `taskEventCount`, its R45) and `on("task")` (R1).
- `connections`: `edgeSevered` (R1's route by live `cites` edge).
- `scheduler`: `register` and `arm` (the `task-drain` consumer, R1).
- `affordances`: `PER_ITEM_ACTS`, `PER_ITEM_MAX` (`perItem` for `taskforward` and `taskresolve`, R3).

### Invariants

- **R7** Each check moves here as an invariant with its test (K6): C-19.1, C-32.10, C-32.11, C-76.1.
- **R8** `tasks` is declared to the whole-store purge (K23, D-113).
- **R9** No answer names a bundle the viewer may not see, and no count reveals one (REC-30, DEC-36).
- **R10** `actor` and `viewer` are taken only from the control plane's stamps, never from a body.
- **R11** No place is named in this module's behaviour or outward text.
- **R12** (S0-11, B0.11) The task id C-19.1 tests (`TASK_ID_RE`, `checks.mjs`:80) is tested by the pattern `record-grammar`'s one id table answers for its prefix (`idPattern`, its R46, R47), never by a pattern of its own: a counter of four or more digits is accepted, and every id valid before stays valid, so every finding on an inbox file written before T33 is byte-identical. *(not yet met: T33-86)*

### Satisfies

- `docs/architecture/BIO_Interaction_Constructs_v0_1.md`: §T (a task ages, is never dropped, is addressed to someone or `unassigned`).
- `docs/development/INBOX-GRAMMAR.md` (the task grammar, C-19.1); `docs/development/SCHEDULER.md` (the `task-drain` consumer).
- DEC-36, DEC-49, D-98.
- DEC-16's "any member who can see the case and holds `contribute` may resolve" is read as governing events reached through the case (findings, whose disposition any joined member makes, `queue` R27); an obligation is resolved by its assignee, anyone when it is `unassigned`, or an administrator (R3), as the code does and NOTIFICATIONS says (K102).

### Suggestions

- **Code it takes** (N363 draft, lines of `bio-plane/src/queue/index.mjs` on `tranche/T16`): :196–210 (the drain's cadence); :3645–3764 (`#routeTask`, `#taskOf`, `#refuseUngrammatical`, `inboxCheck`, `audit`); :3765–3800 (the `tasks` half of `counts`, `seedLedger`); :3801–4140 (`taskDrain` … `taskResolve`, `#refuseNotYours`); :4147–4171 (the `task-drain` half); helpers :67–76 (`ISO_INSTANT`, `taskSlug`). `checks.mjs` :53–73, :106–117, :124–276; `schema.mjs` :11–45.
- **Factory and exports.** `tasksOf(ctx, deps)`; `tasks/index.mjs` exports `tasksOf`, `Tasks`, `tasksOps` (`taskdrain`, `tasks`, `taskforward`, `taskresolve`, moved out of `queueOps`), `TASKS_SCHEMA`, `TASKS_TABLES`, `tasksOwns`, and re-exports its checks.
- **Registrations** at `tasksOf`: `declarePurge("tasks", [tasks])`; `registerCounts("tasks", ["tasks"], …)` and the TASK seed (R5); `registerAuditCheck("tasks", …)` and `promotion.registerStep("tasks", {check})` (C-19.1, R4); `scheduler.register("tasks", drainConsumer)` (`task-drain`, R1); `capture.on("task", "tasks", armDrain)`. The names were `"queue"`; the gate's composition changes by the step's name, which is promotion's to stamp (T17, K531).
- **Row families** move unchanged, family names kept (the DEC-49 guard and `ROW_CENSUS` read them by name): `checkInboxGrammar` (C-19.1), `QUEUE_INBOX_CHECKS` (C-19.2), `QUEUE_MACHINE_CHECKS` (C-32.10, C-32.11), `TASK_ACTOR_CHECKS` (C-76.1), with their translations, to `bio-plane/src/tasks/checks.mjs`; only each row's `where` path changes.
- **The store** (by this module's job, `from` legacy-store): `store.mjs`:312 import, :510 `.filter(!tasksOwns)`, :592 `tasksOf(ctx, {env})` beside `queueOf`, :2937 `...tasksOps(tasksOf(this.ctx), url, body)`; `schema.mjs`:7, :21 `TASKS_SCHEMA`.
- R6 is the SQL `queue` runs today (`queue/index.mjs` :2454–2468, :3089–3092, :3213). `queue` keeps its own member/unassigned filter and DEC-16's single event-state test (`#queueEventLive`, the REC-20 negative control).
- **Callers' obligations** (convention 2): the control plane stamps `actor` and `viewer`; `capture` enqueues and never drains.
- Tests: `inbox.test.mjs` (R1–R4, and its R35, R36, R37 cases as R7, R8, R10); `ledger.test.mjs`'s `tasks` figure and TASK seed (R5). N367: a direct test of `checkInboxGrammar` against the 31 bounds (R4).
