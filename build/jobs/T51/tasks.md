# tasks (T51)

**Status** · session_01GozQuvJKa9gKZzheDC1C7d · depth 2 · WORKING · handled B5

## J1 · COMPLETE

**T51-247 · tasks (words, K3949): done.**

Entries applied:
- The one finding in `build/plan/words-pass/tasks.md` (testcopy, `bio-plane/test/m/tasks/sign.test.mjs:99`, "is prepared and ready to sign") is fixed: the test imports `word` from `src/setup-words/index.mjs` and asserts `word("tasks.edition_prepared_ready", { ed: "2", case_id: CASE })`, the same row the module reads (`src/tasks/index.mjs:1085`). No sentence text remains in the test. No requirement, no module code, no tests removed or weakened.

Deferred: nothing.

Found in another module: nothing from my module's checks. The whole-product run (`checks/run.mjs`) shows reds outside tasks (architecture 1 failure, coverage 25, words 1096 in other modules, including testcopy in `wizard-scripts`). Not mine; left for their jobs and BOB.

Checks and tests:
- `node --test test/m/tasks/` (in bio-plane): 115 tests, 115 pass, 0 fail.
- `node checks/words.mjs /home/user/bio tasks`: 0 failures (was 1).
- `node checks/words.mjs` over all 35 L11 modules together: no finding names `tasks`.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio tasks`: 0 failures.
- `node checks/coverage.mjs /home/user/bio tasks`: 19 of 19 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio tasks tranche/T51 job/T51/tasks`: 1 file changed by tasks; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, channels 0; architecture 1 failure, coverage 25 failures, words 1096 failures, all outside `tasks`.
- `node bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match words.json and the source.

Size (session_01NmzT4iSWU1VzAxyV5Wj8dm): test runs 1, module lines 1614

## J2 · QUESTION

Two things need your answer; the work is otherwise written and pushed (commit on `job/T51/tasks`).

**Q1 (decides whether I can finish): `provenance.declareAuthority` is not on `tranche/T51`.** FR-10 `provenance` is still WORKING (B3), so R65 and R66 are not merged and my merge-order position (after `provenance`) has not been reached. I built `taskDecide` against the draft's R65 shape (`declareAuthority({bundle, capture, outcome, authority?, basis, by, viewer})` answering `{ok}` or a refusal with `code`, `check`, `translation`) and tested it with a fake of that shape kept in the same storage as the tasks (so "both or neither" is shown by a rollback). Options: (A) I post COMPLETE on the fake now and you send a CHANGE once `provenance` is merged, to swap the fake for the real module and re-run; (B) I wait. Recommend A: nothing in my code changes if provenance keeps the draft's signature; if it renames the method or the fields, the CHANGE covers it.

**Q2 (architecture check, 1 failure; the file is yours): `build/modules.json` `tasks.uses` lacks `test-support`.** `declared-ops.test.mjs` imports `bio-plane/test/declared-ops.mjs` (test-support R15), as the other declaring modules' tests do (`lines` uses it). Please add `"test-support"` to the `tasks` row's `uses`. Nothing else in the check fails.

**Requirement lines for you to fold into `build/requirements/tasks.md`** (the ownership check forbids my writing that file; the tests already name R20, R21, R22, R23; ids as the next free ones on the tranche today; the draft's doubt (a) is settled: the task row holds `capture_sha`, written by R1's drain, so R1 does not change). Also add to Uses: `provenance`: `declareAuthority` (its R65; R20).

**Deciding an authority task** (K4169, UC-046; `provenance` R65, R66) (`op=taskdecide`)

- **R20** *(not yet met: T51)* (T51; K4169; UC-046; `AUTHORITY-AND-TRUST.md` "the assignee may forward it to another member they judge best able to attest") `taskDecide({id, outcome, authority?, basis, actor, now})` (`op=taskdecide`) is the one act that answers an `authority-undetermined` task: it records the member's decision on the captured document through `provenance.declareAuthority` (its R65: `bundle` the task's `refers_to`, `capture` the digest the task holds, `by` the actor) and resolves the task, in one transaction, so either both happen or neither. Refusals in order, each writing nothing: `NO_ACTOR`; `MACHINE_CANNOT_DECIDE` (a machine stamp, by shape, before the task is read; C-138.18); `NO_SUCH_TASK`; `TASK_NOT_AN_AUTHORITY_TASK` (the task is not of kind `authority-undetermined`, or holds no capture digest; C-138.19); an already resolved task answers `already: true` and writes nothing (as `taskResolve`); `TASK_NOT_YOURS` / `NO_SUCH_TASK` exactly as R3 (the assignee, anyone when `unassigned`, or an administrator who sees the subject, so a forwarded task is decided by the member it was forwarded to and not by the previous assignee); then `declareAuthority`'s own refusals (`provenance` R65), carried unchanged with their `check` and `translation`, the task staying `open` or `forwarded` as it was. A decision appends `decided` (with the actor and the `outcome`) and then `resolved` (with the actor) to the history, sets status `resolved` and `resolved_at`, and answers `{ok, id, status, resolved_at, outcome}`. The task holds the capture digest the drain's event named (`capture_sha`, R1), so no change to R1 is needed. The clock is the instance's: a `now` in the door's body is not read. Test: the assignee decides and the document's standing authority (`provenance` R66) changes and the task is `resolved`; control: a forwarded task is decided by the member it was forwarded to and the previous assignee is `TASK_NOT_YOURS`; a refused decision (no basis; determined with no issuer) leaves the task `open` and the standing authority unchanged, and the same call with its basis then succeeds; atomic: a failure after the decision was recorded leaves the decision unrecorded and the task open; each refusal in order with its row.
- **R21** *(not yet met: T51)* (T51; Interaction Constructs T "a task is never silently dropped"; `queue` R12) **The door.** `taskResolve` stays the way to put an authority task aside: it leaves the document's authority undetermined and, so that the history says the question was closed without an answer, appends `resolved_undecided` (with the actor) in place of `resolved` for a task of kind `authority-undetermined` (the status, `resolved_at` and every other rule of R3 unchanged); a task decided by R20 carries `decided` and `resolved`, never `resolved_undecided`. The task grammar (R4) admits `decided` and `resolved_undecided` as history events beside `created`, `forwarded`, `resolved` and `folded`. For the kind, the item offers `taskdecide` first, then `taskforward`, then `taskresolve` (`queue` R12 holds the list). Test: a resolve leaves `provenance` R66's standing authority unchanged and the history marked `resolved_undecided`; control: a decision leaves `decided` and `resolved`, not `resolved_undecided`; the grammar accepts both events and still refuses an event outside the list.

**Declared ops** (K4168, K4202; `op-declarations` R80, `op-grades` R49)

- **R22** *(not yet met: T51)* (T51; K4168) The module exports `DECLARED_OPS`, beside its ops map, the whole declaration of `taskdecide` (a new op: `classes` `admin` and `member` sessions, `machineClasses: []`, mutating, weight `reasoned` with the refusal `AUTHORITY_NO_BASIS` (the basis is the reason), `needs: null`, no URL stamp: the control plane stamps `actor` into the body as it does for `taskforward`) and of `taskforward` (the authority form passes a task on with it), each with its class, mutating, weight, description read by key and `fields: {accepts, requires}` read from the op's arm: `taskdecide` accepts `id`, `outcome`, `authority`, `basis` and requires `id`, `outcome`, `basis`; `taskforward` accepts `id`, `to`, `items` and requires `id` or `items`, and `to`. A declaration agrees with the hand row of `op-declarations` and `op-grades` where one exists. Test: `declared-ops.test.mjs` calls each op as the door does with `declaredOpHolds` (only its requires; without each required field, refused naming it; with a field outside `accepts`), and compares the row with the hand rows.
- **R23** *(not yet met: T51)* (T51; K4202) The module also declares in `DECLARED_OPS` each op of its own the screens send: `checkrequest` (accepts `target`, `label`, `member`, `note`; requires `target` and `label` or `member`), `signrequest` (accepts and requires `case`, `edition`) and `taskresolve` (accepts `id`, `items`; requires `id` or `items`), with the class, mutating, weight and description of the op's existing rows in `op-declarations` and `op-grades`, copied and not chosen. `taskforward`, `taskresolve`, `checkrequest` and `signrequest` have hand rows in `op-declarations` and `op-grades` that agree and can now go. Test: as R22, one `declaredOpHolds` call for each op.

**Findings in other modules (not mine to change):**
1. `queue` reads who resolved a task as the last `resolved` history event (`queue/index.mjs` :1617, :1735). A decided task carries `decided` then `resolved` (so it still reads); a task put aside by `taskresolve` now carries `resolved_undecided`, so `resolved_by` there reads null. `queue` should read `resolved_undecided` as the resolving event too.
2. `queue` R12 (the item's doors for `authority-undetermined`: `taskdecide`, `taskforward`, `taskresolve`) and `control-plane` (`index.mjs` :3206 stamps `actor` into the body for `taskforward`, `taskresolve`, `taskdrain`, `biasdebtresolve`; `taskdecide` needs the same stamp and a route) are the draft's and are theirs.
3. `op-declarations` and `op-grades`: hand rows for `taskforward`, `taskresolve`, `checkrequest`, `signrequest` agree with my `DECLARED_OPS` (checked with both modules' `registerDeclaredOps`: `registered: [taskdecide]`, `agreed` the four) and can now go.
4. `docs/development/INBOX-GRAMMAR.md` lists the history events; it gains `decided` and `resolved_undecided` (the grammar, `checks.mjs`, now admits them).
5. The words rows (`rows.mjs`, `words-unreviewed.json`) are stale for my new `localize` ids (`tasks.checks.*`, `tasks.decide.*`, `tasks.declared.*`): yours to regenerate at the layer close.

**Flaw fixed in my module (P8):** the door passed a body's `now` to the task acts, so a caller could date a history entry; `taskforward`, `taskresolve` and `taskdecide` no longer read it (the instance's clock stamps them). Existing assertions that R21 and the new op change were updated in `inbox.test.mjs` (`resolved_undecided` for an authority task put aside; `taskdecide` in the op list) and `grammar.test.mjs` (the event list).

Tests: `node --test test/m/tasks/` 129 pass, 0 fail. Checks: format 0, words 0 (tasks), coverage 23 of 23 with the file as I wrote it (19 of 19 on the file as it stands), ownership 0 once the requirements file is left alone, architecture 1 (Q2).

## J3 · COMPLETE

**T51 tasks, restart (TASKS #16): COMPLETE.** Answers B3, B4, B5 applied.

Entries applied:
- **C62 / K4169 (R20, R21):** `taskDecide` and the `resolved_undecided` rule were already written; the fake provenance is replaced by the real `provenance` (`declareAuthority` R65, `authorityOf` R66), with the real `promotion` and a promoted information bundle holding one register document (`bio-plane/test/m/tasks/authority.mjs`). Its signature matched the draft; no source change was needed. The tests now read the standing authority from `provenance` and its refusals from `PROVENANCE_ACT_CHECKS`.
- **K4168, K4202 (R22, R23):** `DECLARED_OPS` for `taskdecide`, `taskforward`, `taskresolve`, `checkrequest`, `signrequest` (unchanged this restart; `declared-ops.test.mjs` passes).
- **B3 (R24, new):** a task of kind `authority-undetermined` carries `door: ["taskdecide","taskforward","taskresolve"]` in `taskList`, `recentTasks` and `resolvedTasks`; other kinds carry none. Test in `decide.test.mjs` (R24, with the control); `inbox.test.mjs` R2's exact-row expectation gains `door`.
- **B5 (R1):** the claimed founder is an active member and leads `activeAdmins`, but the route still skips her (as R1 means it); the requirement line says so. Test with the founder claimed (alone, and with an administrator) and unclaimed as control.
- **Requirement lines:** written by me in `build/requirements/tasks.md` (R20–R24, the `provenance` and `test-support` Uses lines, R1's note, the Status line); the ownership check lists that one file, accepted per B3/B4.

Deferred: nothing.

Found in other modules (already routed by B4): `queue` reading `resolved_undecided` as a resolving event; `control-plane` stamping `actor` and routing `taskdecide`; the four hand rows in `op-declarations`/`op-grades`; `INBOX-GRAMMAR.md` gains `decided`, `resolved_undecided`; the words rows are stale for my new `localize` ids (yours to regenerate). New: `queue` reads `door` (R24) when it builds the item's options.

Tests and checks:
- `node --test test/m/tasks/` (bio-plane): 131 tests, 131 pass, 0 fail. `node --test test/m/queue/`: 180 pass, 0 fail (a user of `recentTasks`).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs tasks`: 0 failures. `checks/coverage.mjs tasks`: 24 of 24 live ids named, 0 failures. `checks/words.mjs tasks`: 0 failures. `checks/ownership.mjs tasks tranche/T51 job/T51/tasks`: 1 failure, `build/requirements/tasks.md`, accepted per B3/B4.
- `checks/run.mjs`: format 0, architecture 0, channels 0; coverage 5 failures and words 16 failures, none in `tasks` (op-grades test copies and other modules). `setup-words/build.mjs --check`: rows stale as expected (a note on `ai-accounts`).

Size (session_017V6QvFfWXPXUuFw5C8Nu4s): test runs 6, module lines 1698
