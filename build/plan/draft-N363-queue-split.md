# N363 · the queue split: seams (draft)

**Status** · DRAFT by a worker for BOB, 2026-09-30, on `tranche/T16` (read-only reading; this file only). Entry N363 (`next.md`:71), Bob's approval K507 (`rulings.md`:510), P6. For BOB's review: every point below is a wording or placement decision (BOB's, P17) unless §5 flags it. Line numbers are `bio-plane/src/queue/index.mjs` (4,250 lines) unless another file is named.

**Measured** (`wc -l`): `queue/index.mjs` 4,250 · `queue/checks.mjs` 276 · `queue/schema.mjs` 154 · `queue/proposals.mjs` 141 · `queuestate.mjs` 324 · total 5,145. Tests `bio-plane/test/m/queue/`: 1,602 (9 files).

| cut | ranges | ≈ lines |
| --- | --- | --- |
| obligation inbox → `tasks` | index :196–210 (drain cadence), :3645–3764 (`#routeTask`, `#taskOf`, `#refuseUngrammatical`, `inboxCheck`, `audit`), :3765–3800 (the `tasks` half of `counts`, `seedLedger`), :3801–4140 (`taskDrain` … `taskResolve`, `#refuseNotYours`), :4147–4171 (the `task-drain` half), helpers :67–76 (`ISO_INSTANT`, `taskSlug`); checks.mjs :53–73, :106–117, :124–276; schema.mjs :11–45 | ~780 |
| feed producers → `queue-producers` | index :586–2100 (`#conditionHomes` … `#conditionsRecheckDue`), :2328–2431 (`#queueConditions`, `#conditionsRenderDeferred`), :3590–3643 (`#obligationsBiasDebt`); `proposals.mjs` whole | ~1,800 |
| stays in `queue` | the gate :139–190, homes :387–499 (R7), options :526–585 (R12), dispositions :2101–2327, `queueFeed` :2432–3047 (mint, project ageing, mutes, answer), mute/snooze :3048–3416, dispose :3417–3589, the renotify consumer, factory, `queueOps`, `queueAnswer`; `queuestate.mjs`; the rest of checks.mjs and schema.mjs | ~2,560 |

## 1. The two modules

**`tasks`** · *Purpose:* The obligation inbox: tasks routed from captures whose authority is undetermined, drained from capture's queue under the task grammar (C-19.1), listed to the members who may see their subjects, and forwarded or resolved by their assignee, anyone when unassigned, or an administrator.
- `paths` `["bio-plane/src/tasks/"]` · `tests` `["bio-plane/test/m/tasks/"]` · `from` `["queue", "legacy-store"]` (legacy-store: `store.mjs`:312, :510, :592, :2937 and `schema.mjs`:7, :21 are rewired to it, §3.4).
- Named `tasks` (its table, `op=tasks`, R36's "own table"), not `inbox`: N364 brings capture's knock inbox (`op=inboxpull`), and the grammar's file is `data/inbox.json` in a bundle, not this module.

**`queue-producers`** · *Purpose:* The feed's producers: each derives, on read and writing nothing, the items one provider's facts earn for a viewer (bias debts, the record's findings, our machinery's conditions, the contradictions), naming each item's subjects and home subjects, for `queue` to home, offer, mint and publish.
- `paths` `["bio-plane/src/queue-producers/"]` · `tests` `["bio-plane/test/m/queue-producers/"]` · `from` `["queue"]`.

**Order.** `… scheduler, legacy-store, affordances, tasks, queue-producers, queue, instance-setup …` (`modules.json`:77–78). Both after `affordances`: `tasks` needs `PER_ITEM_ACTS`/`PER_ITEM_MAX` (:4141–4145, `perItem` for `taskforward`/`taskresolve`). Neither imports the other (checked: no producer reads `tasks`; the bias-debt producer reads `bias`, :3605). `tasks` first because it is the write path and the lower layer of meaning (a producer may one day read a task; a task never reads a feed item).

**`uses`, verified against the imports (:31–58) and each range's calls:**

| provider | today's queue edge | `tasks` | `queue-producers` | `queue` after |
| --- | --- | --- | --- | --- |
| legacy-checks | ✓ | `isMachineIdentity`, `isMachineStamp`, `isPublicHttpsLocator` | `normalizeType`, `STATES`, `vocabFor`, `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX` | ✓ (R7's `terminal`, :534) |
| record-core | ✓ | `stampInstant`, `mintOpaqueId`, `mintExhausted`, `bundleInfo`, `seedMintLedger`, `registerCounts`, `registerAuditCheck`, `declarePurge`, `perItem` | `bundleInfo`, `head`, `manifestByAuthor`, `stampInstant` | ✓ (`declarePurge`, `registerCounts`, `perItem`, `stampInstant`) |
| membership | ✓ | `viewerPredicate`/`GATE_MARK` (taskList gate), `projectOwners`, `memberFacts`, `activeAdmins`, `isAdministrator` | `viewerPredicate`, `inSight`, `isAdministrator`, `activeAdmins`, `participation`, `hiddenBundles` (R88, N352), `projectOwners` (N345) | ✓ (`positionalMember`, `existenceAct`, `projectAuthority`, `noSuchProject`) |
| promotion | ✓ (K462) | `registerStep` (R41) | — | drop |
| host-governor | ✓ | — | `governorHolding` | drop |
| provenance | ✓ | `homeOf` (:3818) | `homeOf` (:725, :974), register / `captured_locators` reads | drop |
| capture | ✓ | `taskEvents`, `taskEventAttempt`, `taskEventRemove`, `taskEventCount`, `on("task")` | `liveCaptureSessions` | drop |
| connections | ✓ | `edgeSevered` (`#routeTask`) | `weakerGrade` (proposals.mjs:16), `edgeSevered` | ✓ (R7's walk, :182) |
| progressions | ✓ | — | `proposalsFeed`, instance rows | ✓ (`disposeProposal`, `notADisposition`) |
| bias | ✓ | — | `uncleared` | ✓ (`settled`, R39) |
| observation-log | ✓ | — | — | ✓ (`queuestate.mjs`'s condition kinds) |
| inquiry | ✓ | — | basis-leg reads | ✓ (R7's walk) |
| basis-versions | ✓ | — | `projectsDrawingOn`, `conclusionOf`, `conclusionRecordOf` | drop |
| contradiction | ✓ (N345) | — | `candidatesFor`, `conflictNotices` | drop |
| ai-runs, capture-requests, intent, reevaluation, publication, monitoring | ✓ | — | each, as today | drop |
| actions, legacy-store | ✓ (declared; no import in queue's code) | — | — | ✓ as declared |
| scheduler | ✓ | `register`, `arm` (task-drain) | — | ✓ (queue-renotify) |
| affordances | ✓ | `PER_ITEM_ACTS`, `PER_ITEM_MAX` | — | ✓ (`affordanceFacts`, `deriveActs`, `decorate`, `vocabulariesFor`, `PER_ITEM_ACTS`) |
| tasks, queue-producers | — | — | — | new |

`tasks.uses`: legacy-checks, record-core, membership, promotion, provenance, capture, connections, scheduler, affordances.
`queue-producers.uses`: legacy-checks, record-core, membership, host-governor, provenance, capture, connections, progressions, bias, inquiry, basis-versions, contradiction, ai-runs, capture-requests, intent, reevaluation, publication, monitoring.
`queue.uses`: legacy-checks, record-core, membership, connections, progressions, bias, observation-log, inquiry, actions, scheduler, legacy-store, affordances, tasks, queue-producers.

## 2. Which ids move

README convention 6 says ids are permanent and a retired id is never reused; it says nothing of moves. Proposed: the moved id stays in `queue.md` as `- **Rn** *(retired: moved to `<module>` Rm, N363)*` (the coverage check reads `*(retired` as retired, `civicos-process/checks/lib.mjs`:47–53); the new files number from R1; each moved line keeps its text, only its cross-references re-pointed (`R7` → `queue R7`); a split id keeps its text in the part that stays and the moved part is its new id's text verbatim.

| queue | goes to | note |
| --- | --- | --- |
| R1–R7 | stays | R6 gains R9's and R43's publication clause (the bounds the producers return, §3.2) |
| R8 | split | tasks half stays (reads `tasks` R6); bias-debt sentence → **queue-producers R1** |
| R9 | **queue-producers R2** | "the bound published as …" reads "returned as … for queue R6 to publish" |
| R10 | **queue-producers R3** | |
| R11–R15, R39, R40 | stays | |
| R16 | stays, and copied | its basis half copied as **queue-producers R10** (every FINDING it makes names its source and derivation) |
| R17 | stays | |
| R18 | stays, and split | take-up (`LEAD_TAKE_UP`, :1120, set by the producer) → **queue-producers R9**; the set-aside at the mint (:2672) stays |
| R19–R22, R26 | stays | R19's "a task has that id" reads `tasks` R6's `taskExists` |
| R23 | **tasks R1** | |
| R24 | **tasks R2** | |
| R25 | **tasks R3** | |
| R27–R29 | stays | |
| R41 | **tasks R4** | |
| R42 | split | three figures stay (`findingDispositions`, `queueState`, `queueItemMutes`); `tasks` figure and the TASK seed → **tasks R5** |
| R43 | **queue-producers R4** | *(not yet met: N345)* kept |
| R44 | **queue-producers R5** | idem |
| R45 | **queue-producers R6** | idem |
| R46 | stays | dispositions are minted in queue (:2670) |
| R47 | **queue-producers R7** | idem |
| — | **tasks R6** (new seam) | §3.1 |
| — | **queue-producers R8** (new seam) | §3.2 |

**Invariants.**

| queue | goes to |
| --- | --- |
| R30, R31, R32 | stay |
| R33 | stays; copied as **tasks R9**, **queue-producers R11** (each module's answers name no hidden bundle, no count reveals one) |
| R34 | stays; its "a CONDITION earns an item only where a member's act can change it" copied as **queue-producers R12** |
| R35 | split: C-31.1–.3, C-33.27, C-33.44 stay; C-19.1, C-32.10, C-32.11, C-76.1 → **tasks R7** |
| R36 | split: `queue_state`, `queue_item_mutes`, `finding_dispositions` stay; `tasks` → **tasks R8** |
| R37 | stays; copied as **tasks R10** (the actor and viewer only from the control plane's stamps) |
| R38 | stays; copied as **tasks R11**, **queue-producers R13** |

**Row families** (check ids are catalogue-wide and do not renumber): `checkInboxGrammar` (C-19.1), `QUEUE_INBOX_CHECKS` (C-19.2), `QUEUE_MACHINE_CHECKS` (C-32.10, C-32.11), `TASK_ACTOR_CHECKS` (C-76.1) → `bio-plane/src/tasks/checks.mjs`, family names kept (the DEC-49 guard and `ROW_CENSUS` read families by name; a rename is churn with no reader's gain); only each row's `where` path changes (`checks.mjs`:20 `at()`). `QUEUE_MINT_CHECKS` (C-31), `QUEUE_ACT_CHECKS` (C-33.27, .44, .50) and `queueRefusal` stay. `queue-producers` holds no row (it refuses nothing).

**Satisfies / Suggestions.** `INBOX-GRAMMAR.md`, `SCHEDULER.md`'s task-drain, Constructs §T and D-98 → tasks. Queue's Suggestion "The split, if a job cannot read the module whole" (`queue.md`:141) is struck (done). N345's test list (`queue.md`:143) divides: "cannot be muted", mint, homes → queue; one item per candidate, owners only, hidden side yields nothing → queue-producers.

## 3. The seams

**3.1 Queue's read of tasks (`tasks` R6, new).** Three reads, each the SQL queue runs today, so the feed does not change:
- `recentTasks({viewer, limit})` → the tasks on subjects the viewer may see, any status, newest first (`created` DESC, `id`), at most `limit`, each as `taskList` gives a task (R2). Queue keeps its own member/unassigned filter and DEC-16's single event-state test (`#queueEventLive`, :507, the REC-20 negative control) as today (:2454–2468).
- `resolvedTasks({viewer, since, limit})` → resolved tasks with `resolved_at ≥ since` on visible subjects, `resolved_at` DESC, `id`, at most `limit` (R39, :3089–3092).
- `taskExists(id)` → boolean, ungated as today (:3213; R19).
Never throw; a store without the table answers empty/false.

**3.2 Queue's read of the producers (`queue-producers` R8, new).** `feedItems({member, viewer, now, identity, homesOf, optionsOf})` → `{items, facts}`. `homesOf(subjectIds)` and `optionsOf(subjectIds)` are queue's R7 walk and R12 options, passed in, as `proposalFindingItems` already takes them (`proposals.mjs`:80; :2517–2522): R7 and R12 stay in queue, one walk, one derivation. Each item is queue's item without `disposition` (the mint's, :2670) and without `catalogue_id` (queue stamps it from R2 at the mint; today only export-performed carries one, :1784, and queue's catalogue cannot be imported by an earlier module). `facts` carries what the answer publishes beside items: `objective_gap` `{bound, truncated}` (:2975–2976), `unattributed` (:2982–2984), `contradiction` `{bound, truncated}` (R43), and the proposals feed's `dispositions` (R15 reads them, :2877; one `proposalsFeed` read, so R9 and R15 cannot disagree). `#conditionHomes` (subject_bound) and `#homesAt` (a case at depth 0) move with the producers, built over `homesOf`.

**3.3 Registrations.** `tasks` registers, at `tasksOf(ctx, deps)`: `declarePurge("tasks", [tasks])`, `registerCounts("tasks", ["tasks"], …)` and the TASK seed (R5), `registerAuditCheck("tasks", …)` and `promotion.registerStep("tasks", {check})` (C-19.1, R4), `scheduler.register("tasks", drainConsumer)` (`task-drain`, R1), `capture.on("task", "tasks", armDrain)`. `queue` keeps `declarePurge("queue", three tables)`, `registerCounts("queue", three keys)` and `scheduler.register("queue", renotifyConsumer)` (:4188–4218). `queue-producers` registers nothing.

**3.4 Exports and who re-points.**
- `tasks/index.mjs`: `tasksOf`, `Tasks`, `tasksOps` (`taskdrain`, `tasks`, `taskforward`, `taskresolve`, moved out of `queueOps`, :4229–4233), `TASKS_SCHEMA`, `TASKS_TABLES`, `tasksOwns`, and re-exports of its checks. `queue-producers/index.mjs`: `queueProducersOf`, `proposalFindingItems`, `CARDINALITY_EXCEEDED`. `queue/index.mjs` stops re-exporting the moved families (:61–62).
- `legacy-store` (by `tasks`' job, §12.2): `store.mjs`:312 import, :510 `.filter(!tasksOwns)`, :592 `tasksOf(ctx, {env})` beside `queueOf`, :2937 `...tasksOps(tasksOf(this.ctx), url, body)`; `schema.mjs`:7, :21 `TASKS_SCHEMA`.
- `control-plane` (its own job): `control-plane/index.mjs`:52 gains `import * as M_TASKS from "../tasks/checks.mjs"` and `MODULE_CHECK_FILES` (:780–783) lists it, or C-19.2, C-32.10, C-32.11, C-76.1 lose their DEC-49 row at the envelope. `uses` gains `tasks`. It is the only other module whose `uses` names queue (`modules.json`:80); none needs `queue-producers`.
- `legacy-index`: `index.mjs`:35 `queueAnswer` stays in queue; nothing.
- `membership`: `MODULE_ORDER` (`membership/index.mjs`:153–167, R83) must list both new ids (and `sources`, already missing: `test/m/membership/module-order.test.mjs` is red on `tranche/T16` today). Promotion, record-core and scheduler rank registrations by it; unknown modules run last.
- `legacy-tests` (last layer): ~35 files name `src/queue/index.mjs`, `checks.mjs` or `proposals.mjs` by path (e.g. `test/queue-conditions.test.mjs`, `project-sight.control.mjs`, `derivation-bounds.test.mjs`, `leadslug.test.mjs`, `peritem.test.mjs`, `machinefences-dec49.test.mjs`:546, `fence-e2e.test.mjs`:94, `d470-catalog-census.*`; `civicos-ui/check-refusal-codes.mjs` 8 sites, `civicos-ui/test/notifications.test.mjs`:131 imports `Queue`). Re-anchored there, never by these jobs.

**3.5 Tests.** Each file maps by the ids it names:

| file | ids named | goes to |
| --- | --- | --- |
| `inbox.test.mjs` (311) | R23 ×5, R24, R25, R41 ×4; R35, R36, R37 | tasks (R1–R4); :185 R35, :202 R36, :217 R37 split between tasks R7/R8/R10 and queue |
| `ledger.test.mjs` (100) | R42 ×4 | :25, :39 split (three figures queue, `tasks` tasks R5); :60, :84 (TASK seed) → tasks R5 |
| `producers.test.mjs` (206) | R9 ×7, R10 ×4 | queue-producers R2, R3 |
| `proposals.test.mjs` (208) | R9, R12, R16, R32, R33 | queue-producers (drives `proposalFindingItems` directly): R2, R10, R11 |
| `feed.test.mjs` (336) | R6–R8, R11–R18, R31–R34, R38–R40 | stays; :65 R8's bias half and :234 R18's take-up gain a queue-producers R1/R9 test |
| `mute.test.mjs`, `dispose.test.mjs`, `catalogue.test.mjs` | R1–R5, R19–R22, R26–R30 | stay |
| `world.mjs` | fixture | each new test directory gets its own |

## 4. Where the carried shares land

- **N345**: R1 amended (the new kinds) → `queue` (`queuestate.mjs`); R43, R44, R45, R47 → `queue-producers` R4–R7; R46 → `queue` (minted at :2670). The "cannot be muted" parts are queue's R19/R31 unchanged.
- **N352**: `#hiddenBundles` is at :173–178 now (N363 says :167), and its only caller is `#queueSharedInquiryCandidates` (:1215–1217), an R9 producer. So it lands in `queue-producers`, which reads `membership.hiddenBundles` (R88), and queue keeps no copy.
- **N367**: → `tasks`, a direct test of `checkInboxGrammar` against the 31 bounds (`tasks` R4), in `bio-plane/test/m/tasks/`.

## 5. Meaning (for Bob) vs wording (BOB's)

**No change of meaning found.** Every item and answer stays byte-equal if §3.1–§3.2 are followed. These are BOB's:
- W1: the Purpose of queue loses "and the obligation inbox the feed's obligations come from", which now reads "the obligations `tasks` holds and the items `queue-producers` derive". That is the split Bob approved.
- W2: invariants copied, not moved (R33, R34, R37, R38), so each module holds them at its own interface. That adds tests, not meaning.
- W3: registration names `"queue"` become `"tasks"` in promotion's steps, record-core's audit and counts, scheduler's registry and capture's listener. The gate's composition changes by the step's name, which is promotion's to stamp, `awaiting stamp` (K464's precedent). DEC-49 `where` paths change. Both are the stamp's business.
- W4: §12.2 names a *legacy* `from`. `ownership.mjs`:135 accepts any `from`, so the check passes. But reading the extraction exception as covering a product module (`queue`) is a ruling on the mechanics. It is BOB's to record, and it goes to Bob only if BOB judges it a mechanics change. K507 presumes it.

**Found in reading (not introduced, not in scope; for entries):**
- O1: the feed reads tasks of any status, capped at `cap × 2` (:2455), before it drops resolved and other members' tasks. A store with many recent resolved tasks can hide open ones, which is short of R8's "each open or forwarded task". §3.1 preserves this on purpose.
- O2: R19's `taskExists` is ungated (:3213). So a task id the member may not see answers `KIND_NOT_PERSONAL` rather than `UNKNOWN_KIND`, which is in tension with R33.

## 6. Jobs and their order

**Proposed: three jobs, concurrent in T16's layer 11 (P10), each writing only its own module's paths.**
1. **TASKS #1** (`from` queue, legacy-store). It extracts the inbox under §12.2, and in queue's files it removes the moved code and rewires the three reads (§3.1), `queueOps` and the factory's registrations. It rewires the store (§3.4) and brings N367. **It merges early** (K425).
2. **QUEUE-PRODUCERS #1** (`from` queue). It extracts the producers, and in queue it replaces the producer calls (:2505–2573, :2330, :2517–2522) with `feedItems` and publishes its `facts`. It brings N352 and N345's R43–R45, R47. It merges early, after TASKS, and re-anchors on it: both edit queue's import block (:31–58) and its getters (:100–121).
3. **QUEUE #n**: R1 (N345's kinds), R46, R6's publication clause, R42's three figures, its Uses, and its tests re-mapped (§3.5). It starts with the others and takes both splits by early merge. **Its R1 merges before QUEUE-PRODUCERS' N345 arms.** Otherwise the mint refuses the whole feed `NO_SUCH_KIND` (R11) as soon as a contradiction candidate exists. `queuestate.mjs` is untouched by either extraction, so R1 can merge alone and first.

Beside them: **control-plane** (already in T16) re-points `M_QUEUE`/adds `M_TASKS` and gains the `tasks` edge, taking TASKS' early merge. **membership**'s `MODULE_ORDER` line is layer 2's, and needs a re-open or the next tranche (it is already red for `sources`). **legacy-tests** re-anchors last. **promotion** stamps next.

**Why not one job:** one job would write three modules' paths, which breaks ownership (P5, check 3). It would also read ~5,100 lines, the reading K507 exists to end (P6). **Why not the split first and queue in a later layer or tranche:** P10 and K527 (a job needing a provider's new service takes it by the early merge, never by starting later). The only true ordering is the R1-before-N345-producers merge above, and BOB holds that at the close.
