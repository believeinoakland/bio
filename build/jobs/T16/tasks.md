# tasks (T16)

**Status** · session_01GmhJiVaLDr9SrNLwSpEZMa · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (N363, K507, seams K531; N367):
- **The module** `bio-plane/src/tasks/` (937 lines), written from queue's inbox code, which is left untouched in `src/queue/` (K531): `schema.mjs` (`TASKS_SCHEMA`, `TASKS_TABLES`, `tasksOwns`; queue `schema.mjs` :11–45), `checks.mjs` (`QUEUE_MACHINE_CHECKS`, `TASK_ACTOR_CHECKS`, `QUEUE_INBOX_CHECKS`, `checkInboxGrammar`, family names and words kept, each `where` now `src/tasks/index.mjs …`; queue `checks.mjs` :53–73, :106–117, :124–276), `index.mjs` (`Tasks`, `tasksOf`, `tasksOps` with `taskdrain`, `tasks`, `taskforward`, `taskresolve`; the drain's cadence, `#routeTask`, `#taskOf`, `#refuseUngrammatical`, `inboxCheck`, `audit`, the `tasks` figure, `seedLedger`, `taskDrain` … `taskResolve`, `#refuseNotYours`, `drainConsumer`, `armDrain`; queue `index.mjs` :67–76, :196–210, :3645–4169 in part). Meaning unchanged; cross-references re-pointed (queue R23–R25, R41, R42 to tasks R1–R5).
- **R1–R5, R7–R11** as moved, each tested at the interface (below).
- **R6** (new): `recentTasks({viewer, limit})`, `resolvedTasks({viewer, since, limit})`, `taskExists(id)`, each the statement queue's feed runs today (`queue/index.mjs` :2454–2456, :3089–3092, :3213), each task in `taskList`'s shape, never throwing (no table: `[]` or `false`). **Reading, not worded:** `limit` is clamped 1–1,000, default 200, as `taskList`'s (queue's feed asks at most `cap × 2` = 1,000 and 65). If you rule a different bound I follow it.
- **Registrations** under the name `tasks` (W3): `declarePurge("tasks", [{name: "tasks", keys: []}])`, `registerCounts("tasks", ["tasks"])` and the TASK seed, `registerAuditCheck("tasks")`, `promotion.registerStep("tasks", {check})`, `scheduler.register("tasks", task-drain)`, `capture.on("task", "tasks")`.
- **N367**: `test/m/tasks/grammar.test.mjs` tests `checkInboxGrammar` directly both ways. A conformant task passes, and so does each bound at its edge; 36 fixtures each break one bound and must answer exactly that bound's one C-19.1 error, by its message. They carry the retired suite's 28 per-bound arms, add 8 more, and cover the three whole-input findings and the repair list. With the grammar switched off, 44 of the 66 tests fail (restored, `cmp`-checked).

**One live registration while queue keeps its copy (how):** `tasksOf` always seeds the TASK ledger (idempotent) and declares its table to purge. It registers its figure, audit check, promotion step, drain consumer and capture listener only when that declaration holds. In the store, `tasksOf` runs right after `queueOf` (`store.mjs`:591). So queue, which already declares `tasks`, keeps every live registration; record-core refuses tasks' declaration (`TABLE_DECLARED`), and tasks registers nothing. Once QUEUE drops `tasks` from its declaration, tasks' registrations become live with no further change. The four `tasksOps` routes, spread after `queueOps` (`store.mjs`:2937), answer `op=taskdrain`, `op=tasks`, `op=taskforward` and `op=taskresolve` over the same table. Tested: `inbox.test.mjs` "R8: while another module holds the table …" (no second step, figure, audit check, consumer or listener). `test/m/` is exactly as green as I found it (below).

**legacy-store rewiring** (§12.2; `from` legacy-store; ownership: 4 added, 5 removed):
- `store.mjs`:313 `import { tasksOf, tasksOps } from "./tasks/index.mjs"`.
- `store.mjs`:495 `{ name: "tasks", keys: [] }` dropped from legacy-store's purge list, where `queueOwns` already filtered it out. Without the drop, the list would declare `tasks` once queue stops owning it, and tasks' declaration would then be refused. Chosen in place of the draft's `.filter(!tasksOwns)` line.
- `store.mjs`:583: the capture-listener comment named a task drain the store no longer registers (queue has since T12) and a runtime measurement it no longer registers. Now one line.
- `store.mjs`:591 `queueOf(ctx, { env }); tasksOf(ctx, { env }).migrate();`: the order above, and tasks' table created at construction as standards' is (N267). This replaces the draft's `schema.mjs` `TASKS_SCHEMA` lines: `schema.mjs` is untouched. QUEUE_SCHEMA still creates the table too until QUEUE removes it (idempotent).
- `store.mjs`:2937 `...tasksOps(tasksOf(this.ctx), url, body),` on its own line (legacy-tests' re-inliner reads one spread per line).
- The store's import of `tasks` joins N13's standing architecture failures beside its import of `queue` (legacy-store is layer 10): expected.

**`not yet met` marks my work meets** (for BOB to strike, K460): R6 "*(not yet met: N363)*", and the Status line's "Not yet met: R6 (N363)".

**Check rows** (promotion's to stamp, N318; `awaiting stamp` T17): C-19.2, C-32.10, C-32.11, C-76.1 are now defined again in `src/tasks/checks.mjs`, with the same ids and words and a new `where`. C-19.1 is the function `checkInboxGrammar`. Their copies in `src/queue/checks.mjs` retire when QUEUE removes them. No new row.

**Found in other modules (REPORT J2):**
1. **queue (QUEUE #5):** after this merges, remove the moved code and rewire to R6 (`recentTasks` at :2454, `resolvedTasks` in `#resolvedLately` at :3089, `taskExists` at :3213), and drop `tasks` from `declarePurge("queue", …)`, `COUNT_KEYS`/`counts`, `registerAuditCheck`, `registerStep`, the `task-drain` consumer and `capture.on("task")`. Tasks' registrations then take over by themselves. Also drop the four moved rows and `checkInboxGrammar` from queue's `checks.mjs`, the task ops from `queueOps`, and `tasks` from `QUEUE_TABLES` and `QUEUE_SCHEMA`. R6 answers tasks in `taskList`'s shape (`subject.text`, not `subject_text`).
2. **control-plane:** `MODULE_CHECK_FILES` needs `../tasks/checks.mjs` once queue's copies go (draft §3.4), and `uses` gains `tasks`.
3. **legacy-tests** (new reds from this change, each red on its own reading of source text, none a change of behaviour). Every other failing verdict of the 42 legacy suites that name the inbox is the same on `tranche/T16` without this change.
   - `test/hygiene.test.mjs`: "195 of 202 tables covered by purge" now lists `tasks`. It reads the store's purge literal and does not see `tasksOf`'s declaration (queue declares `tasks` at run time). Re-anchor: read `src/tasks/`.
   - `test/machinefences-dec49.test.mjs` ARM A3: `MACHINE_CANNOT_FORWARD` and `MACHINE_CANNOT_RESOLVE` are translated in two places. That is the coexistence, and it clears when QUEUE removes its rows.
   - `test/d484-refusal-translation.test.mjs` corpus floor: `src/store.mjs` is now 209,972 characters, under the 210,035 floor. Re-pin (−63, this job).
   - `civicos-ui/check-refusal-codes.mjs`: 8 new failures, all from the coexistence. Four rows are defined twice (INBOX_REFUSED, MACHINE_CANNOT_FORWARD, MACHINE_CANNOT_RESOLVE, NOT_YOURS). Queue's four DEC-49 region markers are claimed by no row. Arm G has three codes at two sites (ceiling 54, now 58). All clear when QUEUE removes its copies.
   - Not mine: `test/gate-reads.test.mjs`' `contradictioncandidates` arm (K523). On the base it crashes earlier (workerd internal error in `reevaluationraise`, :896) and never reaches that arm.
4. **civicos-ui / affordances grep:** no reference to `src/tasks/`, `tasksOf`, `tasksOps` or `TASKS_SCHEMA`. `affordances.mjs`:840, :936–937, :2296–2297, :2508–2510 name the op ids `taskdrain`, `taskforward`, `taskresolve`, which are unchanged.
5. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (plane source changed); not rebuilt (§14).

**Deferred:** none. O1 and O2 of the draft (N373, N374) are not T16's.

**Tests and checks:**
- `node --test test/m/tasks/`: 66 tests, 66 pass, 0 fail, 0 todo (inbox 15, grammar 42, ledger 5, reads 4). Every live id R1–R11 named: R1 ×6, R2, R3 ×2, R4 ×42 (N367's included), R5 ×5, R6 ×4, R7, R8 ×2, R9, R10, R11.
- `test/m/` whole: baseline on `tranche/T16` 3,089 tests, 3,068 pass, 0 fail, 21 todo. After: 3,155 tests, 3,134 pass, 0 fail, 21 todo.
- Legacy suites naming the inbox (42 files), run on this tree and on the tranche base: differences only as listed in (3).
- `format`: 72 modules, 67 requirements files, 0 failures. `architecture tasks`: 8 files, 29 imports, 0 failures. `coverage tasks`: 11 of 11 live ids, 0 failures. `ownership tasks tranche/T16`: 10 files, legacy-store 4 added, 5 removed, 0 failures.

Size (session_01GmhJiVaLDr9SrNLwSpEZMa): test runs 19, module lines 937
