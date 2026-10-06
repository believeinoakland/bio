# action-plans (T33)

**Status** · session_01HZzMgFGmXynYpFRSjTXJZH · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Two points on T33-77 (R38), both needed before COMPLETE; I carry on with the readings below.

(1) `build/modules.json`: action-plans' `uses` does not list `duties`, though the requirements' Uses gained it at T33's fold (`duties`: `occurrencesOf`, `transitionsOf`). R38 needs the import, so `checks/architecture.mjs` will refuse it until `duties` is added to action-plans' `uses`. modules.json is BOB's: please add `"duties"` to action-plans' `uses` on `tranche/T33` and tell me; I merge it before running the checks.

(2) R38's "occurrence absent: the next occurrence triggered after the phase's predecessor started". The form `{when_duty: {duty, occurrence?}, state}` names no predecessor phase, so "predecessor" is ambiguous. My reading, which I am building: a `when_duty` phase's predecessor is any phase whose `branches` lead to it; its anchor is the instant that judgement led there (not yet judged that way: the phase has not started and no occurrence is picked); with no such phase, the anchor is when the scenario's current version was set (as `plan_start`). A branch that leads to a `when_duty` phase sets its anchor rather than starting it; the duty state starts it. The next occurrence is the first `duties.occurrencesOf` derives with a trigger on or after the anchor's day. The alternative would be an optional `after: phase` inside the form, which changes R14's shape; I am not building that unless you rule it.

## J2 · COMPLETE

**Entries applied.** T33-77 (K1466): R14's `starts` gains R38's form, and R38 is met. A phase may start on `{when_duty: {duty, occurrence?}, state}`, with `state` one of met, met_late, overdue, undetermined. `scenarioSet` checks the form (`PHASE_MALFORMED`, at its one site). It asks `duties.occurrencesOf` for the author's sight and relays duties' own `NO_SUCH_DUTY`, so an absent duty and an unseen one get the same answer. A named occurrence must be one of the duty's own keys (derived up to two years ahead, or recorded), else `PHASE_MALFORMED`. Whether the start holds is derived on every read and never stored. The source is the occurrence's latest transition recorded by the read's instant (`duties.transitionsOf`), else its state derived as of the read (`occurrencesOf`). `planRead` answers each such phase's `duty_start`: the occurrence, its trigger and due date, its state, whether it was read from a recorded or a derived state, why, the derivation, duties' question when it is overdue (never "violation") and `holds`. The phase starts when its state began to hold: a recorded transition's `as_of`; for a derived overdue, the day after the due date (after its latest candidate); for met or met late, the matched event's day. It never starts before its anchor or after the read. A duty-started phase's checkpoint comes due from that start, including in `checkpointsDue`, which reads duties as duties' INTERNAL reader. R23 is unchanged: judging a group checkpoint writes nothing in duties. R35 is extended: a `when_duty` the viewer may not see is withheld whole, with its `duty_start`, from scenarios and history, and the plan says `out_of_view`. R36: the new sentences say "obligation" and "phase", never "subject". When duties is absent, a duty phase answers `PLAN_PROVIDER_UNAVAILABLE`, as for every other provider.

**Readings (J1, open).** (1) `modules.json`: action-plans' `uses` needs `duties`. It is the only architecture failure (2 files: the import, and the test importing duties' own test world). With `"duties"` added to a scratch copy (not committed), architecture gives 0 failures. (2) The "predecessor" for an absent occurrence is any phase whose `branches` lead to the `when_duty` phase, anchored at that judgement. With no such phase, the anchor is when the scenario version was set. Such a branch sets the anchor; it does not start the phase. The occurrence is the first one triggered on or after the anchor's day. If you rule otherwise, send a CHANGE.

**Deferred.** PHASE_MALFORMED's translation (C-124.32) lists the ways a phase can start and does not yet name an obligation's state. I left it unchanged because control-plane pins its digest (`test/m/control-plane/rows-before-r43.json`), so changing it would turn another module's test red. It still reads true ("The phase named was not so"). A wording update belongs with the catalogue's re-stamp; it is BOB's to place.

**Found in other modules.** (1) duties does not export `noSuchDuty`. action-plans gets `NO_SUCH_DUTY` by relaying `occurrencesOf`'s refusal, which is duties' one site. An exported `noSuchDuty` (the `noSuchEntity` pattern) would let a caller answer without a read. (2) `modules.json`, as in J1 (1). No generated artifact is staled by this module's change beyond the plane bundle, which BOB regenerates at the layer close.

**Tests and checks.** The tests use the real duties module, built by its own test world (`test/m/duties/fixture.mjs`) and injected as `deps.duties`. They call duties' `declare`, `recordTransition`, `occurrencesOf` and `transitionsOf` at its interface. New file `duty-starts.test.mjs` (8 tests) covers R14/R38's form and refusals, overdue activating the next step, recorded versus derived as known at the read, the predecessor and branch anchor, R17 due from the start, R23, R35 and the absent provider.
- `node --test bio-plane/test/m/action-plans/`: tests 61, pass 61, fail 0.
- No layer tests (manifest). No module uses a service of mine that changed shape: `planRead` gains a `duty_start` key on duty phases only.
- `format: 126 modules, 125 requirements files; 0 failures`.
- `architecture: 17 product files, 54 relative imports; 2 failures` as committed (duties not in `uses`, J1 (1)). With duties in a scratch `uses`: `0 failures`.
- `coverage: 1 modules, 38 of 38 live requirement ids named by a test; 0 failures`.
- `ownership: 5 files changed by action-plans between tranche/T33 and HEAD; 0 failures`.

Size (session_01HZzMgFGmXynYpFRSjTXJZH): test runs 7, module lines 2789

## J3 · COMPLETE

**B4 applied.** I merged `tranche/T33` (06a8819cca), with conformance, consequences, actions, action-clocks, filings and escalation merged into it. T33-77 is met as in J2, under R38's wording folded at K1649. No code change was needed after the merge.

**Re-pointing (K1563 (1)).** No stand-in in my tests was taken for an upstream that had not merged. `duties` is the only upstream new in this job, and the tests already drive the real module through its own test world.
- The real `actions` and `action-clocks` already run in my fixture, so R18, R29 and R37 create real actions and set real reminders against the merged code.
- The other stand-ins predate T33: inquiry, strength, conformance, standards, escalation, filings and ai-runs. They exist so the tests control those modules' facts. I checked their shapes against the merged modules' requirements: `determinationRead`/`determinationsFor`, `escalationsFor`/`escalationRead`, `availableActions`, `standardRead`, `projectBar` and ai-runs' `runFor`/`boundOf`/`consumeBound`/`registerOpenCheck`/`onRunOpened` are unchanged in what action-plans reads.

**Found (for BOB).** action-plans reads `projectsDrawingOn` through inquiry's instance (`inquiryOf(host)`). Since T33-45 that is a delegate to `leg-earning` R7, which inquiry keeps "for importers not yet re-pointed" (plan Rules (9) item 4). Re-pointing action-plans to `leg-earning` needs `leg-earning` in its `uses` and in its requirements' Uses. That is BOB's to rule; the change in code is one line. Until then it works unchanged through the delegate. The earlier findings stand as N601.

**Tests.**
- `node --test bio-plane/test/m/action-plans/`: tests 61, pass 61, fail 0.
- My users' tests, on my branch and on a clean `tranche/T33` worktree, with identical results (no new red): affordances pass 164, fail 3; queue-producers pass 80, fail 0; control-plane pass 155, fail 4; plane pass 82, fail 3.
- Every one of those fails is a named red in B1: affordances' N364 ops, its 62 ops and `catalogue.test.mjs` R19; control-plane's R26 sources ops, the R43/R22 fence pin and `families.test.mjs` ×2; plane's docket/store/notices registrations.
- No layer tests (manifest).

**Checks** (committed state, after the merge):
- `format: 126 modules, 125 requirements files; 0 failures`
- `architecture: 17 product files, 54 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 38 of 38 live requirement ids named by a test; 0 failures`
- `ownership: 5 files changed by action-plans between tranche/T33 and HEAD; 0 failures`

Size (session_01HZzMgFGmXynYpFRSjTXJZH): test runs 14, module lines 2789

## J4 · COMPLETE

**B5 applied (K1661).** I merged `tranche/T33`. modules.json and my Uses now list `leg-earning`. action-plans now reads `projectsDrawingOn` from `leg-earning` (its R7) through `legEarningOf(host)`, its `legEarning` dep, in place of inquiry's delegate (`#inquiryOfProject`, R1's `SUBJECT_NOT_OF_PROJECT`). The inquiry import is gone; an inquiry's state is still read from record-core as before. Commit edfd8e929c.

**Tests re-pointed.** The inquiry stand-in is replaced by the real `leg-earning`. A project draws on an inquiry through a `cites` row in `refs` (`w.cite`), as connections' projection writes it.
- Of leg-earning's own deps, R7 reads only `connections.edgeSevered`, so the fixture gives it `edgeSevered: () => false` and an unused `content`. Severing is leg-earning's and connections' to test.
- Building real content and connections here would declare their tables, and would put connections in action-plans' uses, which my module does not read.
- The R1 tests, including a second project drawing on the inquiry (`open.test.mjs`), now run through the real R7.

**Tests.**
- `node --test bio-plane/test/m/action-plans/`: tests 61, pass 61, fail 0.
- My users, unchanged from the tranche baseline in J3 (only B1's named reds): affordances pass 164, fail 3; queue-producers pass 80, fail 0; control-plane pass 155, fail 4; plane pass 82, fail 3.

**Checks:**
- `format: 126 modules, 125 requirements files; 0 failures`
- `architecture: 17 product files, 55 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 38 of 38 live requirement ids named by a test; 0 failures`
- `ownership: 6 files changed by action-plans between tranche/T33 and HEAD; 0 failures`

Size (session_01HZzMgFGmXynYpFRSjTXJZH): test runs 20, module lines 2789
