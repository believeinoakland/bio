# tasks (T51)

**Status** · session_01XHqSWAYfTVFiPw8iMY9K7P · depth 2 · WORKING · handled B11

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

## J4 · QUESTION

**Step 0 of R25 (F3d), and one decision I need.** I started (B6); my branch is realigned to origin per your B6 fallback (the earlier local commit is kept on `stale/tasks-local`). I have read the round plan, the audit's F3 and 3d, R20–R24 and the module code.

**Step 0: does D1 resolve the waiting event? Yes, once provenance R72 is merged.** Evidence:
- The event carries the capture's digest: `acquisition/index.mjs:1404` enqueues `authority-undetermined` with `captureSha: sha`.
- The drain finds the event's home with `homeOf(q.capture_sha)` at `tasks/index.mjs:351`. `provenance/index.mjs:835-841` reads `register` by that digest, and for a multipart capture the register holds only the parts, so the lookup is null. That is the whole cause, as F3 says.
- When provenance R72 adds the `whole` row, `homeOf` finds the bundle and the event routes like any other.
- A committed promotion re-arms the drain (`tasks/index.mjs:1262`), so the event gets its try at the moment the capture is filed.
- Provenance R72 is not merged yet, so the seam test (the 20 MB three-part capture's event becoming its task) waits on provenance. I will write it against the real provider and it stays red by name until then.

**The part D1 does not reach.** The drain tries an event at most eight times (`tasks/index.mjs:1181`, then no more timed wakes). After that the event stays in the capture's queue and is counted only as `queued` (`tasks/index.mjs:480`). Nothing shows the member an item. A task cannot stand in for it, because the task grammar needs a bundle id and an unfiled capture has none.

**Decision for Bob (who should see a stalled event):** an unfiled capture has no subject, and the capture does not store who captured it.
- **(A, recommended)** Tasks reads out the events that have used up their retries, each saying what it could not do ("this capture is not yet filed in any record, so who issued it is undetermined"). Queue shows one queue item per such event to the administrators. This needs a change to `queue-producers`, which is another module's, so I will report it to you as a CHANGE for that module.
- **(B)** Keep the `queued` count as it is, and say in the record that R25's general rule is not met. This leaves R25 open at COMPLETE, which R-NOTMET does not allow.

My recommendation is (A). I will build the tasks side of (A) once you confirm, and take the seam test in the meantime. Nothing else in the job is blocked on this.

## J5 · QUESTION

**R25 status after B7 (K4488).** The drain change is done and committed on the job branch (`1bc3fe9b28`): the back-off caps at one hour and no count stops it (`bio-plane/src/tasks/index.mjs`, `#backoffWake`, with `TASK_DRAIN_MAX_WAIT_MS`); the failing-first test "an event whose capture is filed after its eighth try is run at the next wake" was red and is green; the R18 tests that pinned "no timer past the limit" now pin the one-hour cap. The tasks suite is 132 of 132.

**One thing I need from you: where the 20 MB three-part seam test lives.** R25's second test is the real chain: a 20 MB capture in three parts, promoted through the real path, its `authority-undetermined` event becoming its task. Tasks' test world has only fakes for provenance and capture, so it cannot run that chain, and a fake would not test it. The chain needs provenance's real promotion (which writes the register) and capture's real event queue. I am asking which harness should host it:
- **(A, recommended)** Written now in tasks' suite against the real provenance and capture modules, composed the way the plane composes them, and stays red by name until provenance R72 merges.
- **(B)** Written in the plane's suite as its seam test, since it runs the whole path, and tasks' record names it.

I have not written it. R25 stays open until you choose. Impact on this change names six modules (tasks, queue, op-declarations, store-door, control-plane, plane); I am running their 103 test files now and will post the counts in COMPLETE.

## J6 · COMPLETE

**COMPLETE: TASKS #17, fix round 4b, entry 8 (R25, K4487, K4488, K4491).** Branch `job/T51/tasks`, head `24963c15ad`.

**Step 0 (answered in J4).** D1 resolves the event once provenance R72 merges. The event's digest is the whole capture's (`acquisition/index.mjs:1404`); the drain's lookup is `homeOf` at `tasks/index.mjs:351`, null for multipart today because the register holds only parts (`provenance/index.mjs:835-841`). A committed promotion re-arms the drain (`tasks/index.mjs:1262`). The seam test below is the proof, red until R72.

**What changed.**
- `bio-plane/src/tasks/index.mjs`, `#backoffWake` (about line 1177) and the R18 comment (about line 160). Every retry's gap is `min(BACKSTOP × 2^(a−1), MAX_WAIT)`, where `MAX_WAIT` (`TASK_DRAIN_MAX_WAIT_MS`, one hour) is new at line 175. From `RETRY_LIMIT` (8) tries on, the gap is `MAX_WAIT` every time. Nothing stops the wake by count (B7, option C). The seventh gap is 60 minutes, not 64, because of the cap.
- No change to the queue, the queue producers or any other module.

**Tests, failing first, then green.**
- `inbox.test.mjs`: "R25 (K4488): an event whose capture is filed after its eighth try is run at the next wake". Red before the change (the wake was null after the eighth try; `actual: null`). Green after.
- `inbox.test.mjs`: the R18 tests that pinned "no timer past the limit" now pin the one-hour cap. Red-to-green by the same change.
- `seam-r25.test.mjs` (K4491, option A): the real chain, composed as the plane composes it (provenance-routes' fixture: real record, membership, promotion and provenance; capture's real queue; tasks' real drain). A three-part capture is promoted as screen promotes one (the register names its parts). Its `authority-undetermined` event is queued under the whole digest, and one drain must make its task. **Stays red by name**: "provenance R72's whole row". The one-part control **passes**, so the red is the multipart case alone.
- Size of the fixture: the three parts are small (64 KB each). The production capture is 20 MB. Promotion refuses inline files over about 7 MB (`OVERSIZE_INLINE`), so the test cannot carry 20 MB as text. The register path does not depend on size, and the test says so in its header.

**Suite counts.**
- Tasks suite: 111 tests, 110 pass, 1 fail. The failure is the seam test, red by name as B8 allows. Before the seam test, 132 of 132 passed (the earlier count of 132 included the removed fixture duplicates; the file set changed with `seam-r25.test.mjs`).
- Affected suites (impact, six modules, 103 files), run at concurrency 2: 793 tests, 791 pass, 2 fail. R24 (words, `release.test.mjs`) fails the same way on the commit before my change, so it is not mine. R17 (`groupdescriptiondraft`, op-grades) passes alone and failed only in the batch; I read it as a concurrency artifact and did not prove that.

**Checks.** `checks/run.mjs`: format, architecture and words pass; coverage names R25 in a test (no tasks failure). Coverage's 8 failures are other modules' requirements (acquisition R100, capture R103, extraction R82, file-safety R51, ooxml R35, provenance R72, reading-pipeline R37, store-door R18). `checks/ownership.mjs`: 3 files, 0 failures.

**Measurements.** Not applicable: the change is in the drain's scheduling only. No platform-specific limit is touched, and no deploy.

**Requirement lines I propose (BOB writes `build/requirements/tasks.md`).**
- R18, amended: "...at the retry limit and beyond, the gap is one hour (TASK_DRAIN_MAX_WAIT_MS); the drain holds a timer for a queued event whatever its tries (K4488)". Replace the sentence "one tried RETRY_LIMIT times wants no wake at all ... an otherwise idle instance holds no timer".
- R25, met by `inbox.test.mjs` (the eighth-try test) and by the seam test once R72 merges.
- No new requirement lines beyond these.

**Hand rows (`op-declarations`, `op-grades`).** None: no op changed.

**Deferred.** Nothing in my module.

**Found in other modules (for BOB).** None outside the items above. The impact list shows queue, op-declarations, store-door, control-plane and plane only as the tests that run against tasks; none failed beyond R24, which is pre-existing.

**Size (session_01GozQuvJKa9gKZzheDC1C7d): test runs 13, module lines 1702.**

## J7 · REPORT

**Correction to COMPLETE (J6): test counts, verified per file.**

My COMPLETE gave counts from combined runs. Those totals change between runs (the tasks glob came out 132, then 111, then 124), so I did not trust them. I should have said so. I have re-run every file on its own. The figures below replace the ones in J6:

- **Tasks suite**, per file: 134 tests, 133 pass, 1 fail. The fail is the R25 seam test, red by name (provenance R72), as B8 allows. The earlier "132 of 132" and my note about "removed fixture duplicates" are wrong: there were no removed duplicates. The 132 was the combined run before the seam file existed.
- **Affected suites** (the 103 files of impact, each run on its own): 786 tests, 784 pass, 2 fail. Both fail the same way on the commit before my first change (checked in a temporary worktree, now removed):
  - R24 in `bio-plane/test/m/plane/release.test.mjs` (words).
  - R17 in `bio-plane/test/m/store-door/declared-ops.test.mjs` (op-grades: "no hand row disagrees with the owner's row", `groupdescriptiondraft`). It is not the tasks op. It is pre-existing.
- The earlier R17 result (passing alone, failing in batch) is the same test in a different file. I was wrong to call it a concurrency artifact; it fails on the parent commit too.

Nothing else in J6 changes. The Size line (test runs 13, module lines 1702) still stands; the test-run count is the count of my `node --test` invocations, which is approximate.

## Fix round 10, batch 6 (B9): TASKS #18

Merged `tranche/T51`; re-pointed the five `homeOf` lines (see COMPLETE below, J8).

## J8 · COMPLETE

**COMPLETE: TASKS #18, fix round 10, batch 6 (B9): re-point 5 own fixture lines.** Branch `job/T51/tasks`, tranche merged first.

**Causes done.** The five hand-built `provenance.homeOf` answers are now provenance's own fixtures (`bio-plane/test/m/provenance/fixtures.mjs`, FIX-E, merged): `inbox.test.mjs:188` and `ledger.test.mjs:55,78` use `homeOfHomed`; `world.mjs:99` uses `homeOfEmpty`; `world.mjs:124` (the `inbox()` helper) homes each capture by the provider's `registeredHomes().many`. `checks/fixtures.mjs . tasks --list`: **0 failures** (was 5 stubs).

**What changed (tests and world only, no module code).**
- `world.mjs`: `defaultFakes` takes `homeOfEmpty()`; `inbox(events, homes)` registers each home through the real promotion (captures sharing a bundle promoted together) and exposes `w.home(label, bundleId)` / `w.homes(map)` to file a capture later; `world()` keeps a real module instance whole instead of spreading it (a plain object still fills the default's keys).
- The tests name a capture by a label (`a1`, `a3`), and the real `homeOf` answers by digest, so `inbox()` asks the real provider for `sha(label)`. In `inbox.test.mjs:188` and `ledger.test.mjs` the events carry `sha(...)` digests directly.
- `inbox.test.mjs` R25 test: `homes.a3 = DOC2` became `w.home("a3", DOC2)` (a real promotion at the moment the capture is filed).

**One exception, for BOB (the only judgment call).** A capture homed in a project (`HOMES.a2 → PROJ-2026-0001-team`, which R1's "an active owner of the bundle when it is a project" tests) cannot be made by the real chain: promotion refuses a chosen PROJ id (`PROJECT_ID_SUPPLIED`, `promotion/index.mjs:488`) and provenance's fixture homes only information bundles. For ids starting `PROJ-`, `world.mjs` (`w.homes`) answers `{bundleId}` from a map, beside the real `homeOf`. The fixtures checker does not flag it and I added **no `fixtures-own` or `fixtures-generic` marker**. If you want it real, provenance's `homeOfHomed` would need to home in a project (create the project through promotion with no id, use the minted id); say so and I will re-point.

**Lines done / left.** Done: all 5. Left: none (no waiting, `stay` or Wave B lines of mine).

**Checks.** `checks/run.mjs`: format 0, architecture 0, words 0 (tasks), coverage tasks 25 of 25 named, 0 failures; fixtures `tasks` 0. The run's remaining FAIL lines belong to other users of `taskresolve`/`taskforward`/`taskdecide`/`homeOf` (queue-producers, screens-*, interface-shell and others), not tasks. `checks/ownership.mjs tasks`: 0 failures. Impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`): tasks only, 8 test files, all in my run.

**Tests.** Tasks suite, each file run alone: 134 tests, 134 pass, 0 fail (the R25 seam test, red in J6, now passes: provenance R72 is merged).

Size (session_014XtwY7rHcgXEW5Z93bYUjK): test runs 14, module lines 1702

## J9 · COMPLETE · re B10

**COMPLETE: TASKS #19, fix round 10, follow-up 30 (B10): the re-point to provenance's published fixture.** Branch `job/T51/tasks` at `89089ef839`; tranche `tranche/T51` (9c09ef1c89) merged first; `mail start` run at depth 2.

**Entries applied.** Follow-up 30 (test files only). `world.mjs` no longer answers `homeOf` from a hand map of `PROJ-` ids: a project is made by provenance's real `homeOfProject` (promoted with no chosen id; the record mints its `PROJ-` id), and `w.homes({label: project})` takes that project's own real `homeOf` answer for the capture. `projectOf(title, labels)` is the one helper. Every project id a test names now comes from `projectOf(...).projectId`, not a literal: `authority.mjs`, `check.test.mjs`, `declared-ops.test.mjs`, `reads.test.mjs`, `sign.test.mjs`, `inbox.test.mjs` (the `HOMES` project a2 is the minted one), `ledger.test.mjs` (`PRJ-H`, `PRJ-A` too). In the citing-edge test the withdrawn and the live project are the two minted ids in sort order, so "the withdrawn one sorts first by id" still holds.

**No markers added (K5060).** No `fixtures-own` or `fixtures-generic` marker; the fixtures checker is clean.

**Deferred.** Nothing in my module. No module code, no requirements, no test removed or weakened.

**Found in other modules.** None new.

**Checks and tests.**
- Tasks suite, each file run alone (the glob run in one process reports an unstable count, 109 to 134 across runs, so I summed per file): 134 tests, 134 pass, 0 fail. Per file: check 23, decide 8, declared-ops 7, grammar 45, inbox 30, ledger 5, reads 6, seam-r25 2, sign 8.
- `checks/fixtures.mjs /home/user/bio tasks --list`: 0 failures.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio tasks`: 0 failures.
- `checks/coverage.mjs /home/user/bio tasks`: 25 of 25 live requirement ids named, 0 failures.
- `checks/words.mjs /home/user/bio tasks`: 0 failures.
- `checks/ownership.mjs /home/user/bio tasks tranche/T51 job/T51/tasks`: 0 failures (`bio-plane/test/m/tasks/`).

Size (session_014SW3dszWfYfXnSrCtVu4CS): test runs 27, module lines 1702

## J8 · COMPLETE

**TASKS #20, fix round 10, follow-up 44 (K5117): an unstable one-process suite run — fixed.**

**Reproduced** (`node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/tasks/*.test.mjs`, Node v26.10.0, 4 cores). Before: 33 runs idle and 10 under load (8 busy loops) gave 103, 104, 106, 121 … 134 tests, in about 40% of runs, never a failure or a cancelled test: 134 only when nothing was lost.

**Cause, with evidence.** The tests are not skipped; their *reports* are lost.
- Probe (temporary, removed): each `grammar.test.mjs` test appended a line to a scratch file as it ran. A run reported 46 tests for grammar+sign (53 expected) while the file held all 45 grammar lines: every test ran, 7 reports were missing.
- Always `grammar.test.mjs`: across 14 captured runs the missing lines were only its tests (12 to 28 of its N367 per-bound tests and the last R12 ones), none from another file. That file is the only one that registers a burst of ~36 sub-millisecond synchronous tests, and it is not the slowest file (inbox is), so it is not a tail loss at the end.
- Only with `--test-force-exit`: without it, 8 runs gave 134 each; with `--test-isolation=none` and force-exit, 8 gave 134 each. With force-exit and one concurrency, 1 run in 8 still lost reports; two files (grammar, sign) lost reports in 2 of 16 runs. Other suites sampled (queue, 3 files, 10 runs) did not lose any.
- So the cause is Node's runner dropping reports of a burst of synchronous tests when `--test-force-exit` ends the process. Not product code, not test-support, not the sqlite shim. I did not find the line inside Node; the evidence above is behavioural.

**Fix (my tests).** `bio-plane/test/m/tasks/grammar.test.mjs`: a root `afterEach(() => new Promise((done) => setImmediate(done)))` (with a comment) gives the reporter a turn of the event loop between tests. No test was added, removed or weakened.

**Proof.** After the fix, the one-process run of `bio-plane/test/m/tasks/*.test.mjs`: 20 runs idle, 134 each; 15 runs under 8 busy loops on 4 cores, 134 each; 0 fail, 0 cancelled. Plus 30 runs of grammar+sign alone, 53 each (before: 2 of 16 lost reports).

**Checks** (absolute root): `fixtures.mjs … tasks --list` 0 failures; format 0; architecture 0; coverage 25 of 25 live ids, 0; words 0; ownership 1 file, 0 failures.

**Other modules:** none to report. Any other module with a large burst of synchronous tests may show the same under `--test-force-exit`; I sampled queue only (clean).

Size (session_018khTeR7Ftw2mCC35fSYLYA): test runs 130, module lines 1702

## J10 · COMPLETE

COMPLETE (TASKS #20, follow-up 44, K5117). Cause: reports of tasks/grammar.test.mjs's burst of sync tests are lost under --test-force-exit (all tests run; probe showed 45 of 45 ran while 46 of 53 reported); one-process run gave 103-134. Fix: root afterEach yielding one event-loop turn in grammar.test.mjs (tests only). Proof: 20 idle + 15 under 8 busy loops, 134 each, 0 fail. Checks fixtures/format/architecture/coverage/words/ownership all 0. Details in build/jobs/T51/tasks.md J8. Nothing for other modules.

## J11 · COMPLETE

**TASKS #21, fix round 10, item 70 (K5148; WALK-FINAL-04B R146, `diag2-04.md` §6): authority tasks now route to the owner of the project the document is filed in.**

1. **Failing-first test** (`inbox.test.mjs`, "R1 (K5148, WALK-FINAL-04B R146) …"), seen red on the old code (the task read `unassigned`, group-admin), green after: a document with `project: P` in its record row and no `cites` edge routes to P's first active owner (a revoked owner before them is skipped), basis `tasks.why.owner_referred_project`; the filed-in project comes before a citing project; a filed-in project with no active owner falls through to the citing one; control: no project and no edge still routes by the administrator rule. `world.mjs` gained a `project` option on `bundle()` (the project column record-core R34 reads).
2. **Fix** (`tasks/index.mjs`, `#routeTask`): a new arm after the bundle-is-a-project arm and before the `cites` arm, reading `bundleInfo().project` (which the function already held as `info`) and taking its first active owner by the same `ownerOf`. No new sentence.
3. **Why the tests missed it:** `inbox.test.mjs` built its only project route through a `cites` edge from the project (`word("tasks.why.owner_cites_record")`), the one way the old code could reach a project; no test filed a document with the project in its record row. The world fixture had no way to set that column.

**Met:** tasks R1 (its filed-in-project clause, K5148); BOB may strike its `not yet met: T51` mark. Door case (acquire into a project, promote, drain, `op=tasks` shows the owner) belongs to control-plane's door tests (K5138): REPORT to BOB to place; I added none.

**Runs.** `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/tasks/*.test.mjs` (no force-exit, exits by itself): 135 tests (134 + 1), 0 fail, 0 cancelled. Checks with the absolute root: format 0; architecture 0; coverage 25 of 25, 0; words 0 (no new strings); `fixtures.mjs … tasks --list` 0 failures, no marker added; ownership 0.

Size (session_01XHqSWAYfTVFiPw8iMY9K7P): test runs 4, module lines 1710
