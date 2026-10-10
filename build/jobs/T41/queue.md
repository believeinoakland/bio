# queue (T41)

**Status** · session_01K4gx81sfhF2PvktYCx31f6 · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Three readings, built on now; each is a one-line change if you rule otherwise.

1. **Investigation's reader (B1, K2523) and a question's set-aside (R27).** R27 names no form for `finding` when a project sets a QUESTION aside (inquiry R39 sends the member to this arm). My reading: `finding` is the question's own bundle id (`{project, finding: <question id>, to: deferred|dismissed, reason}`), and the reader I register with `investigation.registerProjectDisposition("queue", fn)` answers the state of the row `(project, question)`, null when none. Registered in `queueOf` beside the scheduler consumer (skipped with `start: false` unless `deps.investigation` is given). My `uses` gain `investigation` (layer 7, earlier).
2. **`step-reminder` and `milestone-reminder` (R1 OBLIGATIONs, `notice-producers` R17).** R52 gives them no door, and R12's "`taskresolve` otherwise" names a task door neither has (no task row). My reading, as `action-reminder`'s `reminderanswer`: `instead: stepreminder` and `instead: milestonereminder` (op-declarations R43's ops: answer with another reminder, or none), the detail saying it leaves at the end of its day (steps R12, investigation R3: told once, on that day).
3. **`project-quiet`'s acts (R52: `projectwatch, projectclose, setcondition`).** Only `projectwatch` is an op; op-declarations R43 and intent name the others `projectclosewithgaps` (investigation R18) and `objectivecondition` (intent R2). My reading: publish the ops a member can send, `[projectwatch, projectclosewithgaps, objectivecondition]`, so no item names a door that does not exist (R18's rule for acts); R52's words read as descriptions.

## J2 · COMPLETE

**T41-55 applied: `queue` R1, R12, R27, R52**, each tested at the interface with a negative control (K874); B2 (K2574) applied as answered.

**Entries applied.**
- **R1**: `classOfKind` answers FINDING for the T40 kinds `explore-ask`, `ai-limit-reached` and `project-account-suspended`. It also covers `notice-producers` R17's ten kinds in the classes R17 and K2484 give them:
  - FINDING: `question-find`, `step-later-found`, `milestone-overdue`, `project-quiet`, `step-cost-shared`, `step-cost-message`, `review-comment-left-out`.
  - OBLIGATION: `step-date-due`, `step-reminder`, `milestone-reminder`.
  - Each kind has one sentence, in K2484's words where it gives them (`queuestate.mjs`).
- **R12, T40 clause**: `explore-ask` answers `available: false, instead: exploreapprove`. `ai-limit-reached` and `project-account-suspended` answer `instead: queuemute` (`Queue.ACCOUNT_DOORS`).
- **R52**:
  - `question-find` is project-scoped with acts `[findaccept, hypothesishold, stepcreate]`. With no project home it answers `instead: queuemute`.
  - `step-later-found` has acts `[stepend]`.
  - `project-quiet` has acts `[projectwatch, projectclosewithgaps, objectivecondition]` (B2 (3)).
  - `step-date-due` answers `instead: stepend`. The two reminders answer `stepreminder` and `milestonereminder` (B2 (2)), and the bridge (R28) names the same doors.
  - The cost items, `milestone-overdue` and `review-comment-left-out` take R12's project scope.
- **R27**:
  - The project arm's refusal order, the per-item path and one decision per (project, finding) were already built. They are now also tested for a question's set-aside, which goes through this arm with the question's bundle id as `finding` (B2 (1)). The question's own state never moves.
  - The answers are identical whether one or three projects (one of them hidden) draw on the question, and none of them names another project.
  - New `projectDisposition({project, question})` is registered at `queueOf` with `investigation.registerProjectDisposition("queue", …)` (K2523). It is registered together with the scheduler consumer, or whenever `deps.investigation` is given. It is tested through the real investigation module: a milestone waiting on a question that this project deferred or dismissed reads stuck, and another project's decision does not make it stuck. The negative control was run: with the registration removed, that test fails.

**Final `uses`, for BOB to apply:** the current list plus `investigation` (layer 7, earlier). Architecture reads 2 failures without the edge: the source import, and the test's import of investigation's fixture. With the edge applied locally (not committed) it reads 0.

**Reading set (K2304).** Measured: code 205 KB, tests 290 KB, requirements 38 KB, over 300 KB. I read these whole myself:
- `requirements/queue.md` and the T41 L11 line of `layers.md` in the plan.
- `queuestate.mjs` and `queue/index.mjs`, the code my entry changes.
- `catalogue.test.mjs` and `dispose.test.mjs`.
- The used services: `notice-producers` R1, R16, R17; investigation's `registerProjectDisposition` and R2's item state (its record J1/J2); inquiry R39; progressions' `notADisposition`; steps R12, R14, R15, R23; investigation R3, R18; question-explorer R5; review R33; op-declarations R43; intent R2.
- K2371, K2400, K2451, K2484.

A worker read the other 18 test files and `conclude-project.test.mjs`/`docdates.mjs` whole. Its summary (about 9 KB) cites file:line for every hard-coded kind list, the R48 word sweep, the project-arm call sites and the shapes of dispositions. It left out nothing that mattered: it named the two hard-coded lists I had to update (`docket.test.mjs`'s `FINDING_ACTS` keys, `words.test.mjs`'s count of kind sentences using "condition"). `catalogue.test.mjs` I read myself.

**Test changes, my own:**
- `catalogue.test.mjs` lists the new kinds.
- `docket.test.mjs`'s `FINDING_ACTS` list gains R52's three.
- `words.test.mjs` sets aside the phrase "its objective, its condition and", which comes from `project-quiet`'s R1 sentence and does not call a status item a condition. A negative control was added: "its condition is unknown" is still caught.
- New `investigation.test.mjs`.

**Deferred:** none.

**Found in other modules (for BOB):**
1. `notice-producers` (T41-54): the classes it mints must match these, or the mint refuses the feed (R11). `step-date-due`, `step-reminder` and `milestone-reminder` are OBLIGATIONs, so their ids should be `OBLIGATION::<kind>::…`, which the bridge reads (R26/R28).
2. `plane` (T41-63): `queueOf(ctx, …)` now also builds `investigationOf(ctx)` at boot, unless the plane hands its own `investigation` in deps. The plane may want to pass the one it composes.
3. Generated artifact: the plane bundle is staled by this source (rule 4, as for every L11 job).

**Tests and checks.**
- `node --test bio-plane/test/m/queue/ bio-plane/test/conclude-project.test.mjs`: tests 137, pass 137, fail 0 (baseline 129/129).
- No layer tests (manifest).
- Users' suites, `plane/watch`, `store-door/`, `answer-envelope/` and `investigation/`: pass 91, fail 9. The same 9 fail before my change (inherited, rule 4).
- From the process repository:
  - `format`: 145 modules, 0 failures.
  - `architecture … queue`: 2 failures, both the missing `investigation` edge above. 0 with the edge.
  - `coverage … queue`: 42 of 42 live ids named, 0 failures.
  - `ownership … tranche/T41`: 7 files, 0 failures.

Size (session_01K4gx81sfhF2PvktYCx31f6): test runs 11, module lines 3022

## J3 · COMPLETE

B3 (K2582) applied: `world.mjs` hands a `publishSchedule` fake (`scheduledEditions` answering no edition), and `Queue.PRODUCER_DEPS` gains `publishSchedule` so a caller's provider reaches queue-producers (R37), queue calling none of its reads; templates.test.mjs's R8 test asserts it. Re-run: `node --test bio-plane/test/m/queue/ bio-plane/test/conclude-project.test.mjs`: tests 137, pass 137, fail 0. Checks: format 0; architecture 2 (the `investigation` uses edge, as J2; 0 with it); coverage 42/42, 0; ownership 7 files, 0. Everything else as J2. Size (session_01K4gx81sfhF2PvktYCx31f6): test runs 12, module lines 3025
