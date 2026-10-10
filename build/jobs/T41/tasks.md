# tasks (T41)

**Status** · session_01CGQvEK47xJQsjUXGG7z93f · depth 2 · WORKING · handled B1

## Completion

**Entry applied.** T41-61a (tests only; N822, K2442, D54 per K2408): `check.test.mjs`:38, the one rule 4 (11) red (the `refused` helper, reached from the R13 refusal test's `ada` line, then :57). Re-stated for D54: an administrator who owns nothing and is neither invited nor joined to the hidden `PRJ` no longer sees `FIND`, so `checkRequest` answers `NO_SUCH_CHECK_TARGET`, identical to an id that names nothing (R13's "one answer for both"), before ownership is asked. A new R13 (D54) test covers both administrators, `ada` and the claimed founder `admin`, on the item and on the project itself, and before the address. Its negative controls: (1) the project set `discoverable` gives both administrators `FULL`, and each is refused `CHECK_NOT_AN_OWNER`; set `hidden` again, absent again; (2) still hidden, with `ada` invited and the founder joined, each sees it and is refused `CHECK_NOT_AN_OWNER`. No refusal writes anything (a snapshot of every table this module owns).
Improvement in my own module: a new R9 (D54) test in `inbox.test.mjs`. An administrator neither invited nor joined to a hidden project gets `taskList`, `recentTasks`, `taskExists` and `refersTo` exactly as any outsider does, even for a task assigned to them: not listed, not counted, never named. The controls are the same two: discoverable, and invited, each seeing the tasks whole.

**Product code.** Unchanged. The re-stated test shows no product read that assumes the founder's or an administrator's `FULL` sight: every sight question this module asks goes through the caller's own viewer (`#bundleGate` over `viewerPredicate`; `inSight` with `member:<by>` or the stamped `viewer`). It never reads as `"admin"` for a see-all. Final `uses`: unchanged (record-grammar, record-core, membership, promotion, provenance, capture, connections, scheduler, affordances, credentials).

**Reading set (mechanics §17).** Measured as mechanics §3 asks: requirements 19 KB; layer 11's row and its two sections; my code 89 KB and tests 128 KB; each used module's Purpose and the services my Uses names, 22 KB. About 260 KB, at most 300 KB, so I read it whole myself, as above.

**Deferred.** None.

**Found in other modules / for BOB (against requirements; no change made, the requirements as written are met):**
1. R1's administrator fallback against D54. With no active owner of the subject's project and no live citing owner, a task goes to the earliest active administrator (membership R86). If the subject is a hidden project, or belongs to one that administrator is not invited to or joined, R9's gate withholds the task from its own assignee's `taskList` and `recentTasks`. The task is then stuck: it shows to nobody who can act, except as `unassigned`. BOB may want R1's fallback to pick only an administrator R80 admits to the subject, and else `unassigned`. That is a requirement change for tasks (R1), not made here.
2. R3's administrator override against D54 and membership R60. `#refuseNotYours` lets any administrator forward or resolve a task by id, whatever their sight of its subject. So an uninvited administrator can act on a hidden project's obligation, and the `TASK_NOT_YOURS` refusal names the assignee to any caller who holds the id. R60 says the only project acts an administrator holds at `EXISTENCE` are the rescue and the hold acts. BOB may want R3's fence to also require that the actor sees the subject (R80), answering `NO_SUCH_TASK` otherwise. That is a requirement change for tasks (R3), not made here.

**Tests and checks.**
- `node --test bio-plane/test/m/tasks/`: tests 104, pass 104, fail 0 (before this job: 102, 1 fail, `check.test.mjs`:38). No layer tests are named in `build/manifest.md`.
- `format`: 145 modules, 144 requirements files; 0 failures. `architecture tasks`: 9 product files, 37 relative imports; 0 failures. `coverage tasks`: 18 of 18 live requirement ids named by a test; 0 failures. `ownership tasks tranche/T41`: 0 failures.


## Completion (B2 · CHANGE, K2575)

**Applied.** I merged `tranche/T41` (R1 and R3 now carry the K2575 marks) and changed the product code (`src/tasks/index.mjs`):
- **R1**: `#routeTask`'s administrator fallback takes the earliest active administrator after the founder whom `membership.inSight(subject, "member:<id>")` (R80) admits; with none it is `unassigned`, its basis now "no project manager and no active administrator who can see it".
- **R3**: in `#refuseNotYours`, the administrator arm holds only where `inSight(row.refers_to, "member:<actor>")`; otherwise it answers `{ok: false, reason: "NO_SUCH_TASK"}`, the same as `NO_SUCH_TASK` for an id that names nothing, never `TASK_NOT_YOURS` naming the assignee. The assignee and `unassigned` arms are unchanged, and so is a non-administrator's `TASK_NOT_YOURS`; the requirement gates the override only.

**Tests.**
- New `R1 (K2575, D54)`: a hidden project with no active owner goes `unassigned`; with one administrator invited, it goes to that one, passing over an earlier administrator who cannot see it. Controls: the project discoverable, and both administrators admitted, each route to the earliest; a subject in no project routes to the earliest.
- New `R3 (K2575, D54; membership R60, R80)`: an uninvited `ada` and the claimed founder, on a hidden project and on an item belonging to it, are answered `NO_SUCH_TASK` by forward, resolve and the set form, with nothing written and no assignee named. A member who is not the assignee still gets `TASK_NOT_YOURS`. Controls: a subject in no project, the project discoverable, `ada` invited and the founder joined, where the override holds.
- Re-stated for the change: `check.test.mjs`'s two R3 lines where the uninvited `ada` resolved a check's To do now expect `NO_SUCH_TASK`, then, with `ada` invited, the old answer (`ok`; `CHECK_CLOSES_BY_RECORD`).
- With the product change reverted, the four tests fail, and all pass with it.

**Tests and checks.** `node --test bio-plane/test/m/tasks/`: 106 pass, 0 fail. `format` 0 failures; `architecture tasks` 0 failures; `coverage tasks` 18 of 18; `ownership tasks tranche/T41` 0 failures (4 files). Uses unchanged.
Size (session_01CGQvEK47xJQsjUXGG7z93f): test runs 11, module lines 1451

## J1 · COMPLETE

T41-61a done. I re-stated check.test.mjs:38 for D54, adding negative controls (the project discoverable; the administrator invited, the founder joined), and added an R9 D54 test. No product code changed: the module has no see-all read as the founder. Tests 104/104; checks 0 failures; coverage 18/18. Uses unchanged. Two requirement-level findings, R1's admin fallback and R3's admin override against D54/R60, are in my record under Completion.
