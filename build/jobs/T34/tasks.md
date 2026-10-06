# tasks (T34)

**Status** · session_011DdbtwJUhTwJan4dKnywad · depth 2 · RUNNING until 2026-10-06T22:39:20Z (queue, control-plane, plane tests at HEAD and at tranche/T34 (users of tasks)) · handled B2

## J1 · QUESTION

Readings of R3, R13–R17 I am building on; each is BOB's to change. None stops the job.

1. **Check family id.** R17's rows need a family. Free ids on `tranche/T34` after C-137 (following): I take **C-138** (`bio-plane/src/tasks/checks.mjs`, already in control-plane's `CHECK_FAMILY_FILES`), rows `awaiting stamp` (accepted red 4). If another L11 job has claimed C-138, name the id and I re-key.
2. **The taker's own To do and `taskResolve` (R3).** "The taker's To do closes only by R15's record": `taskResolve` on it by anyone is refused with a new code, `CHECK_CLOSES_BY_RECORD` (its C-138 row), writing nothing. An addressee's untaken To do resolves through R3 as any task (assignee, or an administrator), closing that To do only.
3. **A taker or checker who is not an `active` member** (R14 "any active member"): answered `NO_SUCH_CHECK_REQUEST`, the one answer R14 gives for a request the caller may not act on. Sight for `checkRequest`, `checkTake`, `checkRecord` is `membership.inSight(target, "member:<by>")`.
4. **The requester among the addressees** (R13): addressed if `checkAddressees` answers them, as R13 states; not filtered out.
5. **`label` and `member` presence** (R13 `CHECK_ADDRESS_ONE`): a key counts as given unless null or absent, so `label: ""` with no member is `EXPERTISE_NO_LABEL` (membership's answer, passed through as it gives it); `member: ""` is `CHECK_MEMBER_REFUSED`.
6. **`expertise` (R15):** latest `expertiseList` event `confirmed` → `confirmed`; `declared` → `self-declared`; `withdrawn` (a confirmation withdrawn) or none → null, as `checkAddressees` reads `withdrawn` as not declared.
7. **The task grammar C-19.1 is unchanged** (`TASK_KIND_ENUM` stays `authority-undetermined`; R12 and grammar.test pin its words). `check-requested` To dos are written by the check acts, never by the drain, and never pass through C-19.1. The store's unique index "one live task per (refers_to, kind)" is narrowed to exclude `check-requested` (one To do per addressee per request on the same target): the old index is dropped and recreated with the narrower `WHERE`, idempotent at migrate.
8. **Ids:** a request is `chkreq-<16 random [a-z0-9]>`, a check `chk-<16>`; the To dos are TASK ids from record-core's opaque mint, as the drain mints them.
9. **History of a closed To do (R14):** `{at, event: "taken", actor: <taker id>, handle: <taker handle>}` appended, status `resolved`, `resolved_at` the take's instant.

## Completion (T34-53)

**Entries applied.**
- T34-53 (N557; DEC-135, Bob's; K1745; readings J1, all accepted by B2, K1861 (2)): "Ask for a check". `checkRequest` (R13): refusals in R13's order; addressing at the instant through membership R106's `checkAddressees` (its `EXPERTISE_NO_LABEL` passed through as given) or to one named active member who can see the target; answers `{ok, request, at, addressed}`, never names. Each addressee holds a To do (R14): a `tasks` row of kind `check-requested` on the target, role `member`, open, a TASK id from record-core's opaque mint, gated by R2/R6/R9 like any task. `checkTake` (R14): one conditional write under the request's key (`check_takes` primary key, `INSERT OR IGNORE` then re-read, inside the storage's transaction), so exactly one take succeeds; any active member who can see the target may take; the taker keeps (or is given) an open To do; every other open To do is resolved in the same act with `{at, event: "taken", actor, handle}`; a repeat by the taker answers `already: true`; another's answers `CHECK_ALREADY_TAKEN` with `{handle, at}`. `checkRecord` (R15): refusals in order; record `{check, request, target, checker, handle, label, expertise, verdict, reason, at}`, handle by value, expertise from membership R24 at the instant (`confirmed`, `self-declared`, else null; null for a named-member request); closes the taker's To do; one per request (`CHECK_ALREADY_RECORDED` with the first). `checkRequests` and `checksOf` (R16) as worded. R3: `taskForward` refuses a check's To do `CHECK_NOT_FORWARDED` (after `NO_SUCH_TASK`); `taskResolve` on the taker's To do refuses `CHECK_CLOSES_BY_RECORD` (after the C-76.1 fence); an untaken addressee's To do closes alone, outside C-19.1 (whose grammar and words are unchanged). R17: four append-only tables (`check_requests`, `check_todos`, `check_takes`, `check_records`), declared with `tasks` to the whole-store purge; only inserts reach them (tested over the statements issued). Ops `checkrequest`, `checktake`, `checkrecord`, `checkrequests`, `checksof` in `tasksOps`, `by` and `viewer` from the URL's stamps, never the body.
- Store: the unique index "one live task per (refers_to, kind)" is now `tasks_live_unique_drained`, excluding `check-requested`; `migrate` drops the old `tasks_live_unique` (idempotent).
- **Awaiting stamp** (plan Rules (5) 4): new family C-138, `CHECK_REQUEST_CHECKS` in `bio-plane/src/tasks/checks.mjs`: C-138.1 MACHINE_CANNOT_CHECK, .2 NO_SUCH_CHECK_TARGET, .3 CHECK_NOT_AN_OWNER, .4 CHECK_ADDRESS_ONE, .5 CHECK_MEMBER_REFUSED, .6 CHECK_NOTE_TOO_LONG, .7 NO_SUCH_CHECK_REQUEST, .8 CHECK_ALREADY_TAKEN, .9 CHECK_NOT_YOURS, .10 CHECK_VERDICT_UNKNOWN, .11 CHECK_NO_REASON, .12 CHECK_REASON_TOO_LONG, .13 CHECK_ALREADY_RECORDED, .14 CHECK_NOT_FORWARDED, .15 CHECK_CLOSES_BY_RECORD. No code is held by another family (checked over `bio-plane/src`). No translation names a place or the group's Civicsmith (DEC-149: none needs it).

**Deferred.** Nothing.

**Found in other modules** (each expected from this entry; for their own L11 jobs):
- control-plane `families.test.mjs`:515 "the door reads tasks' table" `deepEqual`s tasks' rows to the four before T34; it now also reads C-138's 15. New red from this merge; control-plane's T34-60 re-pins it (its CHECK_FAMILY_FILES already lists `tasks/checks.mjs`, so every C-138 row is reached and decorated; the totality test's red is inherited, unchanged).
- control-plane R53 test (every op a map serves has a spec and `OP_STAMPS` entry): red before this job; the five new ops add to it until op-declarations R23 (T34-58) declares them and control-plane R55 routes them.
- queue R1: classes `check-requested` as an OBLIGATION (its job, plan's Suggestions); until then `recentTasks` hands it the new kind.
- No generated artifact is made stale beyond the plane bundle (tasks is in it; regenerated at L11's close).

**Tests and checks.**
- `node --test bio-plane/test/m/tasks/`: 95 tests, 95 pass, 0 fail (12 consecutive runs clean after fixing my own R16 test's sub-second tie). New `check.test.mjs` (21 tests, R3, R13–R17); `inbox.test.mjs` R8 (now with R17's tables) and R10 (the five ops' stamps) extended. Five deliberate mutations of the code (expertise mapping, others' To dos not closed, taker's To do resolvable, owner check dropped, sight filter dropped) each turned the suite red.
- Users of tasks (queue, control-plane, plane: `test/m/queue/`, `test/conclude-project.test.mjs`, `test/m/control-plane/`, `test/m/plane/`, `test/system/migrate-released.test.mjs`), at HEAD and with tasks at `tranche/T34`: the same four reds at both (control-plane R2/R10 step rank, R22 totality, R43/R22 catalogue end, R53 op specs; accepted reds 8 and 9, K1789), plus at HEAD the one new red named above.
- No layer tests (`build/manifest.md`).
- `checks/format.mjs`: 129 modules, 128 requirements files; 0 failures. `checks/architecture.mjs … tasks`: 9 product files, 35 relative imports; 0 failures. `checks/coverage.mjs … tasks`: 17 of 17 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … tasks tranche/T34`: 6 files changed; 0 failures.

Size (session_011DdbtwJUhTwJan4dKnywad): test runs 38, module lines 1379
