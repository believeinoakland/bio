# tasks (T17)

**Status** · session_01BCChBKLgkZzLgjYXWvQhQh · depth 2 · WORKING · handled B1

## J1 · QUESTION

N382, my best reading (carrying on with it; N374 and N373's share first, for the early merge):

1. The code: `TASK_NOT_YOURS`, as both `reason` and `code` of the task-actor fence's refusal (C-76.1), and the row's key in `TASK_ACTOR_CHECKS` renamed to match (the door, `control-plane/index.mjs` `dec49Row`, keys rows by that key and reads `reason` first, so both must change for the door to find tasks' row and not intent's C-111.15). Check id C-76.1, family name, `where` and translation unchanged. This changes R3's text (`NOT_YOURS (C-76.1)` becomes `TASK_NOT_YOURS (C-76.1)`), a provided service's error code: please word R3 on the tranche branch. No other product code reads the task refusal's code (grep: only comments in `affordances.mjs`:2402 and `control-plane/ops.mjs`:920, :1840, and the legacy suite `test/task-fence.test.mjs`:151, :157, :198, which legacy-tests owns).
2. "Tested at the control plane's door": my tests cannot import `control-plane` (later in the order; the architecture check refuses it), so my test proves at my interface that the refusal carries `TASK_NOT_YOURS`, C-76.1 and its own translation, and that the row is keyed by its code. The door's own test (a forwarded `taskresolve` refusal decorated with C-76.1, not C-111.15) is control-plane's, for its next job, unless you rule otherwise.
3. Row change: `awaiting stamp` for T18 (recorded).

## Completion for the early merge (N374, N373's share)

**Applied.**
- N374 (K565): R6's `taskExists({id, viewer})` asks R2's gate (`#bundleGate` over `refers_to`, R9), so a task on a subject the viewer may not see answers false, as an absent one does; an absent or unrecognised viewer is denied. A bare id (the old `taskExists(id)`) carries no viewer and answers false.
- N373's share (K566): R6's `recentTasks({viewer, limit, statuses})`: given an array, only tasks of those statuses, the cap taken over them alone (so resolved tasks never crowd live ones out); an empty array answers none; absent, any status.
- Found in my module and fixed: R6's "never throws" did not hold for an argument that is no object (`recentTasks(null)` threw on destructuring) nor for a `limit` whose coercion throws; each read now takes any argument and answers empty or false.

**Pending:** N382, on J1's answer; it follows on this branch after the merge.

**Other modules.** `queue` R19's test (`test/m/queue/`, "R19: then per kind or item…") fails with this change, as expected: `queue/index.mjs`:1447 still calls `taskExists(itemId)`, which its T17 entry moves to `taskExists({id, viewer})`; `queue/index.mjs`:754 still reads `recentTasks({viewer, limit: cap * 2})`, which its entry moves to `statuses`. `control-plane`'s R36/R35 (N364) test fails on `tranche/T17` without my change too (not mine).

**Tests and checks.** `test/m/tasks/`: 67 tests, 67 pass, 0 fail. `test/m/queue/`: 45, 44 pass, 1 fail (R19, above). `test/m/control-plane/`: 70, 68 pass, 1 fail (pre-existing), 1 todo. format (72 modules; 0 failures), architecture (8 files, 29 imports; 0 failures), coverage (11 of 11; 0 failures), ownership (0 failures, legacy 0/0).

Size (session_01BCChBKLgkZzLgjYXWvQhQh): test runs 5, module lines 1820

## J2 · COMPLETE

Early merge (K425): N374 and N373's share pass, pushed on job/T17/tasks (record: 'Completion for the early merge'). N382 is not yet applied: it waits on J1's answer and follows on this branch after you merge, with a second COMPLETE. On merge, queue's R19 test fails until queue moves to taskExists({id, viewer}) (its own entry); control-plane's R36/R35 (N364) test already fails on tranche/T17 without me.

## Completion after B3 (CHANGE: N382, answered B2, K606)

`tranche/T17` merged (R3 names `TASK_NOT_YOURS`).

**Applied.** N382: the task-actor fence (C-76.1) answers `TASK_NOT_YOURS` as `reason` and `code`, and its row in `TASK_ACTOR_CHECKS` is keyed `TASK_NOT_YOURS`; check id, family, `where`, region and translation unchanged. New test (`inbox.test.mjs`, "R3, R7 (N382)"): forward and resolve, assigned and forwarded, singly and as a set, answer `TASK_NOT_YOURS` with C-76.1 and its own translation, never `NOT_YOURS`; every refusal of this module carries `reason` equal to `code`, and that code keys its own row. **Row change, `awaiting stamp` for T18:** C-76.1's key `NOT_YOURS` → `TASK_NOT_YOURS` in `src/tasks/checks.mjs`.

**Other modules (REPORT with this COMPLETE).**
- `control-plane`: `test/m/control-plane/envelope.test.mjs` R22 (N363, K562) fails once this merges: at :511 it lists tasks' rows by key with `["NOT_YOURS", "C-76.1"]`, and :512–517 assert that `NOT_YOURS` reads intent's row as the known double. Now tasks' key is `TASK_NOT_YOURS`, and `dec49Row("TASK_NOT_YOURS")` is C-76.1; `NOT_YOURS` is intent's alone. This is the door's test B2 gives CONTROL-PLANE #8.
- `queue`: R19's test still fails until queue moves to `taskExists({id, viewer})` (its entry). Unchanged from J2.
- `legacy-tests`: `test/task-fence.test.mjs`:151, :157, :198 assert `reason` `NOT_YOURS`; now `TASK_NOT_YOURS`. The DEC-49 guard's arm A double for `NOT_YOURS` is gone (legacy-tests' entry already names "arm A's `NOT_YOURS` once N382 lands").
- Comments naming the task refusal `NOT_YOURS`: `affordances.mjs`:2402, `control-plane/ops.mjs`:920, :1840 (their owners, when next touched).

**Tests and checks.** `test/m/tasks/`: 68 tests, 68 pass, 0 fail. `test/m/queue/`: 45, 44 pass, 1 fail (R19, above). `test/m/control-plane/`: 70, 67 pass, 2 fail (R22, above; R36/R35, pre-existing), 1 todo. format (72 modules; 0 failures), architecture (8 files, 29 imports; 0 failures), coverage (11 of 11; 0 failures), ownership (4 files, legacy 0/0; 0 failures).

Size (session_01BCChBKLgkZzLgjYXWvQhQh): test runs 9, module lines 1852
