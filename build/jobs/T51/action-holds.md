# action-holds (T51)

**Status** · session_01T1F4v1RYnwRpGQBM5cYrRi · depth 2 · WORKING · handled B7

## Completion

**Entries applied (T51-90).**
- Reds `hidden.test.mjs` (R2) and `readers.test.mjs` (R4): both asserted `actions.actionRead`'s old `NO_SUCH_BUNDLE`; they now assert `NO_SUCH_ACTION` (actions R106). The module relays no `actionRead` refusal (a refused read is skipped in `#marks`); its own acts keep `NO_SUCH_BUNDLE` / `NOT_AN_ACTION` as R2, R5, R6 say.
- R18: `pressureFor` rows carry `hold` on every row (the latest statement at a mark's entry or placed `from` it; at a record, the latest placed `from` it; null while none; `by` was already there). Called with `action` it adds `facts` (the governing view's `threat_letter` legal facts whose `applies_to` names the action's kind or is absent, once each by key, as `{key, statement, citation, status, basis, profile}`) and `label` (`guide.procedure.legalinfo`), only when the action holds a `legal` mark; `facts: []` otherwise; `facts: null` with `facts_why {reason, detail}` when the marks or the view cannot be read. New dep `localFacts` (`governingView`).
- R19: `op=holdsdue` added to `actionHoldsOps` (exactly `holdsDue`); `holdsOf` takes `{docket_entry}`, the place being the entry's case's project, read through `docket.docketPressureOf` (an unseen or absent entry answers the docket's `NO_SUCH_DOCKET_ENTRY`; an entry without a visible `legal` mark is `HOLD_PLACE_REFUSED`; with another place it is two places, refused).
- Words (K3949, K3962): the `inline` finding and every refusal `detail` this module mints now read through `localize('action-holds.index.<slug>', …)`; the handlist at `places.test.mjs` is assembled from membership's `noSuchProject` and action-records' `correspondEntryRefusal`; the t46 copies are `localize` reads. `node checks/words.mjs … action-holds` shows 0 findings; the joint run over the 13 L9 modules names no line of this module.
- Tests: `t51.test.mjs` (R18 x3, R19 x2); `holds.test.mjs` R2 now expects `hold: null` (not absent) on a mark of another kind (R18).

**My readings (BOB may overrule).** (1) "the action holds at least one legal mark (R1) or record": a pressure record belongs to a project, not an action, so only the action's own `legal` marks open `facts`. (2) A record's `hold` is the latest statement placed `from` it, since a project place is every record's.

**Deferred.** None.

**Found in other modules.** (a) `op-declarations`: `holdsdue` is a new op of this module's map with no spec yet (T51-121/T51-122's owners); there is no op serving `holdsOf`, so the `hold` screen cannot read a place's statements by `{docket_entry}` until one is declared. (b) `rows.mjs` is stale for this module's new ids (BOB regenerates at the layer close).

**Strings no member reads (not converted; for BOB with the design stream, K3944).** The developer errors `action-holds: the actions cannot be read`, `action-holds: record-core refused the purge declaration…`, `action-holds: doorbell refused the litigation-hold reader…`, and the identifiers/codes in refusals.

**Ran.** `node --test bio-plane/test/m/action-holds/`: 44 pass, 0 fail. Dependents (filings, plan-work, action-producers, op-declarations, affordances, screens-action): same failures as at the START (filings 2, action-producers 1, op-declarations 9, affordances 4, screens-action 2; none touches this module), plan-work 50 pass. Checks: format 0 failures; architecture 0; coverage for action-holds 19 of 19 ids named; ownership 0; words 0 findings; `setup-words/build.mjs --check`: stale-rows note only.

Size (session_01PfgbWdpc9FTqQ5aXw1t7zj): test runs 14, module lines 1251

## J1 · COMPLETE

T51-90 applied: R18 (hold on every pressureFor row; facts/label/facts_why with an action), R19 (op=holdsdue; holdsOf {docket_entry}), the R106 reds green, words 0 findings. Two readings and two cross-module findings (op-declarations: no spec for holdsdue, no op serving holdsOf) are in my record. Tests 44 pass; checks clean.

## Completion (FR-60, K4206; B2 START, B3 CHANGE)

**Entries applied (K4206, one entry).**
- `DECLARED_OPS` (`bio-plane/src/action-holds/index.mjs`) gains `actionpressure` and `pressurerecord`, beside the three the declaration pass declared (`actionhold`, `actionholdrelease`, `holdnoticesent`), which stand unchanged. The pass left these two to judgment because a mark is `pressure` or the pair `pressure_kind`/`pressure_note`; the judgment is in the fields below.
- Rows copied, not chosen: `actionpressure` classes and mutating from `op-declarations` (admin, member, probe; mutating); `pressurerecord` classes and machine classes from `holdnoticesent`'s row, the family's actor for both being the member (`op-declarations/t45.mjs`); weight `undetermined` for both, their `op-grades` ground; descriptions the registry keys `act.actionpressure.does` and `act.pressurerecord.does` (held by `setup-words`).
- Fields, read from the arms whole. `actionpressure` accepts `target, ord, pressure, pressure_kind, pressure_note` and requires `target, ord` and one of `pressure | pressure_kind`. `pressurerecord` accepts `project, pressure, pressure_kind, pressure_note, artifact_sha, account, at` and requires `project, at`, one of `account | artifact_sha`, and one of `pressure | pressure_kind`.
- The mark: a missing or malformed mark is refused `PRESSURE_REFUSED`, R1's shape refusal, which both ops share on purpose; it names the mark by its code, so `requires` lists the alternatives and nothing finer. The capture-or-account refusal is `action-records` R16's (`CAPTURE_AND_TESTIMONY` / `NEITHER_CAPTURE_NOR_TESTIMONY`) for both alternatives, as R20 states.
- P8 fix in the arm: `actionpressure` with no `ord` was refused `PRESSURE_NO_ENTRY` without naming `ord`. It now carries `field: "ord"` when `ord` is absent (R21). The code, the detail and every other refusal are unchanged; with `ord` the same call marks the entry.
- Requirements (`build/requirements/action-holds.md`): R20 amended to the five ops and the alternatives; R21 new. Both are named by tests, so their not-yet-met marks are removed.

**Tests (declared-ops.test.mjs).** Written first and seen failing: `actionpressure` and `pressurerecord` had no `DECLARED_OPS` row (the helper refused "no fields.accepts and fields.requires arrays"); the R21 test failed on `field`. Now: R20 for `actionpressure` and `pressurerecord` (requires alone, each missing one named, a field outside accepts), and R21 with its control (no `ord` names `ord`; `ord: 0` marks the entry). 6 of 6 pass.

**Ran.**
- `node --test test/m/action-holds/`: 50 pass, 0 fail (44 before, plus the 6).
- Dependents (`node --test` on each module's test directory): filings 154 pass, 0 fail; action-producers 53 pass, 0 fail; plan-work 51 pass, 0 fail; op-declarations 237 pass, 5 fail; affordances 279 pass, 1 fail; screens-action 133 pass, 1 fail. None of the failures names an action-holds op: they are case-import's and wizard-scripts' rows (op-declarations R14, R16, R19, R51, R73; affordances and screens-action on `case-import`'s ops and `writinghelp` missing from the plan screen's acts). Those are other modules' and are reported to BOB in `REPORT`.
- Checks from the process repository: `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage has 5 failures, none in action-holds (agent-harness, agent-runner, installer-steps, journey-check, link-sweep); words: 16 failures, none in action-holds; `checks/coverage.mjs … action-holds`: 21 of 21 live ids named; `checks/ownership.mjs … action-holds tranche/T51 job/T51/action-holds`: 1 failure, `build/requirements/action-holds.md`, outside the module's paths; B3 accepts that one file's listing at this merge (the requirement lines are written there, as B3 asks). The module's code and tests are inside its paths.

**Deferred.** None.

**Found in other modules.** (a) `wizard-scripts`: `writinghelp` is missing from the plan screen's acts list (screens-action, interface-shell R21); a declaration owner question for BOB. (b) `case-import`'s op map: its ops' spec and table checks fail in op-declarations and affordances (R14, R16, R19, R51, R73 in op-declarations). Not this module's.

**Words.** No new sentence: the descriptions are keys, the refusal adds a field, no detail changed.

**Size.** Module lines: `bio-plane/src/action-holds/*.mjs`, 1267 lines (wc -l).

Size (session_01GPpK8aEgiACMQLKJc5vFkV): test runs 16, module lines 1267

## J2 · REPORT

Found in other modules while running FR-60 (action-holds), none changed by this job:
(a) wizard-scripts: `writinghelp` is missing from the plan screen's acts list (screens-action test "R1–R6 (interface-shell R21, R38)"). A declaration owner question for BOB.
(b) case-import: its op map's spec and table checks fail in op-declarations (R14, R16, R19, R51, R73) and affordances (R1 R4 R12 R19 R24).
(c) Repository-wide checks (checks/run.mjs): coverage has 5 failures (agent-harness R17, agent-runner R37 R38 R40, installer-steps R26 R31, journey-check R19, link-sweep R13 R14 R15); words has 16 failures (inline in strength/method.mjs:349; testcopy in op-grades). None names action-holds.

## J3 · COMPLETE

FR-60 (K4206) applied and pushed as 9f1e6b9897 on job/T51/action-holds.
- DECLARED_OPS gains actionpressure and pressurerecord (the two the pass left to judgment); the three the pass declared stand.
- The arm's PRESSURE_NO_ENTRY refusal names ord (field "ord") when ord is absent (R21, P8). Behaviour otherwise unchanged.
- Requirements: R20 amended to five ops and the alternatives; R21 new. Both named by tests and marks removed.
- Tests: declared-ops.test.mjs, 6 of 6 pass; written first and seen failing. Module suite 50 pass, 0 fail.
- Dependents: filings, action-producers, plan-work pass; op-declarations, affordances, screens-action have failures in case-import / wizard-scripts ids only (see REPORT).
- Checks: format, architecture, ownership, coverage and words show 0 findings for action-holds.
- Readings: the mark is R1's shape refusal (PRESSURE_REFUSED) for both ops, deliberately uniform, so requires lists the alternatives. The capture-or-account refusal is action-records R16's for both alternatives.
- Commit attribution: the Claude-Session line only; no model identifier, per the system rule on commit messages.
Size line and full record are in build/jobs/T51/action-holds.md.

---
_Generated by [Claude Code](https://claude.ai/code)_

## Completion (fix round 10, B4 START)

**Causes done.** The two `docket/docketEntryRead` answer lines, both FIX-E (docket is earlier in `modules.json`): `due.test.mjs` (the stand-in `docketPressureOf` refusal) and `places.test.mjs` (the `DKT-*` refusal in the stand-in) now take `docketEntryRead().absent` from docket's published `fixtures.mjs`, its real `NO_SUCH_DOCKET_ENTRY` answer, instead of a hand-built one. Test files only; no source change.

**Markers added.** No `fixtures-own` or `fixtures-generic` marker. **Lines left.** None; `checks/fixtures.mjs . action-holds --list`: 0 failures (was 2).

**Ran.** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/action-holds/*.test.mjs`: 50 pass, 0 fail. Checks: format 0 failures; words (action-holds) 0 failures; architecture 0; ownership 0; fixtures 0. `impact.mjs origin/tranche/T51 HEAD`: 0 affected modules, 0 test files (test-only change), so no dependents' tests to run.

Size (session_01E2eTwBJGNb3qbSi7xQa82K): test runs 3, module lines 1267

## J4 · COMPLETE

Fix round 10 batch 6 done. The 2 docket/docketEntryRead lines (due.test.mjs:29, places.test.mjs:92) now take docket's published fixture (docketEntryRead().absent). No fixtures-own or fixtures-generic marker added. fixtures check 0 failures; module tests 50 pass 0 fail; format, words, architecture, ownership 0 failures; impact: 0 affected. Record: build/jobs/T51/action-holds.md.

## Fix round 10 (K5207; START B5, ACTION-HOLDS #8)

**Done (B5, K5175).** Published `holdsdue`, the answer of `op=holdsdue` over the real `holdsDue`, in `bio-plane/test/m/action-holds/fixtures.mjs` (`holdsDueAnswer()`), made fresh on each call over a world this module builds: one project the viewer sees, one action in it with a legal mark (ord 0) and no hold, the door's answer through `actionHoldsOps(...).holdsdue()`, and the same module's `holdsDue` for comparison. No product change: the state (a due legal mark with its arrival) is made by the module's own acts.

**Test added.** `bio-plane/test/m/action-holds/fixtures.test.mjs` (R19 holdsdue fixture; control):
- the published answer is the door's answer over the real `holdsDue`; the item carries `arrived {action, ord 0}` and `marked_by` the viewer; a second call builds its own world (project ids differ per world, so the second world is compared on action, ord and arrived);
- control: a viewer who sees no project of the mark reads no item.
- Failing-first: `ord` expectation set to 1 → red (1 fail); restored to 0 → green (2 pass).

**Suites and checks.**
- `bio-plane/test/m/action-holds/*.test.mjs`: 52 tests, 52 pass, 0 fail (no `--test-force-exit`, exited by itself).
- `checks/fixtures.mjs /home/user/bio action-holds --list`: answer 0, 0 failures.
- `checks/words.mjs /home/user/bio action-holds`: 0 failures for this module.
- `checks/ownership.mjs /home/user/bio action-holds <merge-base> HEAD`: 0 failures.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 0 of 178 modules affected by the new files.
- `checks/run.mjs /home/user/bio`: no finding in action-holds files. Findings are elsewhere, not mine: `screens-publish` `t51.test.mjs:76` (`[op-table holdsdue]`, the consumer that takes this answer in its own job, recorded as "action-holds (earlier)"), and `store-assembly` `wiring.mjs:78`, `wizards.mjs:51` (words). The words total is 15 failures, none in action-holds.

**Markers added.** None: no `fixtures-own` or `fixtures-generic` marker; every value is the module's real answer.

**Merge.** `origin/tranche/T51` (a4ce8a8de1) was merged into `job/T51/action-holds` (a merge, not a rebase) before the work.

**Size (session_01JjBfGMNmBpVHmFVF6fEVJK): test runs 5, module lines 0.** (Test runs: the new file's runs, four; the module suite, one. Module lines: no `src` line changed; the two new test-side files are the whole change.)

## J5 · COMPLETE

Fix round 10 (START B5, K5175): holdsdue fixture published. bio-plane/test/m/action-holds/fixtures.mjs holdsDueAnswer() makes the door's op=holdsdue answer over the real holdsDue, fresh per call (no product change). Test bio-plane/test/m/action-holds/fixtures.test.mjs: 2 tests green; failing-first: ord 1 red, restored green. Module suite 52/52 green. Checks: fixtures 0, words 0 for action-holds, ownership 0 failures, impact 0 of 178 modules. Markers added: none. Not mine, for BOB: screens-publish t51.test.mjs:76 is the consumer to point at this answer; store-assembly wiring.mjs:78 and wizards.mjs:51 words findings. Record: build/jobs/T51/action-holds.md (Fix round 10 section). Commit b640284a1a pushed to job/T51/action-holds.

## Fix round 10, after CHANGE (B6, K5209)

Merged `origin/tranche/T51` (OP-GRADES #30 merged) into the job branch (merge `d9ad534024`, not a rebase). The stores start again. Re-run on the merged head:
- `bio-plane/test/m/action-holds/*.test.mjs`: 52 pass, 0 fail (exited by itself).
- `checks/fixtures.mjs /home/user/bio action-holds --list`: 0 failures.
- `checks/words.mjs /home/user/bio action-holds`: 0 failures.
- `checks/format.mjs /home/user/bio action-holds`: 0 failures.
- `checks/ownership.mjs /home/user/bio action-holds <merge-base> HEAD`: 3 files changed by action-holds (`fixtures.mjs`, `fixtures.test.mjs`, this record), 0 failures.

No new markers. The two stays named in the CHANGE (`control-plane/r10-caseratify-chain.test.mjs`, `store-assembly/declarations.test.mjs` R83) are not mine and were not run here.

Size (session_01JjBfGMNmBpVHmFVF6fEVJK): test runs 6, module lines 0 (the rerun on the merged head adds one suite run and the checks; no `src` line changed).

## J6 · COMPLETE

CHANGE B6 (K5209) handled: merged origin/tranche/T51 into job/T51/action-holds (merge d9ad534024; no rebase). Re-run on the merged head: action-holds suite 52/52 green; fixtures --list 0 failures; words 0 failures; format 0 failures; ownership 0 failures (3 files: fixtures.mjs, fixtures.test.mjs, record). No new markers. The two named reds (control-plane r10-caseratify-chain, store-assembly declarations R83) are not mine and were not run. Record: build/jobs/T51/action-holds.md, section 'Fix round 10, after CHANGE'. Pushed to origin/job/T51/action-holds.

## Fix round 10, START B7 (K5222; plan item 105)

**Done (B7, K5175).** Published `holdsDueDocketAnswer()` in `bio-plane/test/m/action-holds/fixtures.mjs` (line 29, beside `holdsDueAnswer` at line 14). It takes docket's published world `docketEntryRead()` (its real legal mark, made by docket's real act on an entry of project P, which alice manages) and builds this module on that world's host. It answers: `answer`, the door's `op=holdsdue` answer before any hold, with the mark listed as `{arrived: {docket_entry, case}}`; `direct`, the module's own `holdsDue` read at the same moment (the control the test compares against); `placed`, the same world after `actionHold({project: P, from: {docket_entry}, hold: "in_place"})`, its items empty. No product change: the state is made by the real acts of docket and action-holds.

**Test added.** `bio-plane/test/m/action-holds/fixtures.test.mjs` (lines 27 and 39): the published answer is the module's read and lists the mark with its arrival; after the hold the items are empty; each call builds its own world. Control: a viewer who sees no project of the mark (dave) reads no item.
- Failing-first: the expected case id set to a wrong value → red (1 fail); restored → green.
- One fault of my own on the way: the first draft compared the pre-hold answer with a read taken after the hold. Fixed by returning `direct` from the fixture, read before the hold.

**Suites and checks** (absolute product root `/home/user/bio`):
- `bio-plane/test/m/action-holds/*.test.mjs`: 54 pass, 0 fail (no `--test-force-exit`; it exited by itself).
- `checks/fixtures.mjs … action-holds --list`: 0 failures (3532 test files read, 178 modules).
- `checks/format.mjs`: 0 failures. `checks/words.mjs … action-holds`: 0 failures.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 0 of 178 modules affected, 0 of 2985 test files.
- `checks/run.mjs /home/user/bio`: no finding in this module's files. The words total is 15 failures, the same count as at B5 (none new). The findings that name this module's answer are not mine (see Found in other modules).
- `checks/ownership.mjs … action-holds`: run again after the commit (see the Size line's session).

**Markers added.** None. Every value is the module's real answer.

**Found in other modules (not changed here).**
- `screens-publish` `bio-plane/test/m/screens-publish/t51.test.mjs:76`: `DUE` hand-builds the `holdsdue` answer (`[op-table holdsdue]`, run.mjs). It is the consumer that should take `holdsDueDocketAnswer()`'s `answer` (the mark) and `placed` (after the hold) instead of its own stub. That is screens-publish's to change, in its own job.
- `store-assembly` `bio-plane/src/store-assembly/wiring.mjs:78` and `wizards.mjs:51`: words findings, already present at B5. Not this module's.

**Size (session_01T1F4v1RYnwRpGQBM5cYrRi): test runs 3, module lines 0.** (Test runs: the fixtures file alone once with the first draft of the test, once with the deliberate break, and the module suite once. Module lines: no `src` line changed; the two test-side files are the whole change.)

## J7 · COMPLETE

START B7 (K5222): `holdsDueDocketAnswer()` published in `bio-plane/test/m/action-holds/fixtures.mjs` (line 29). It takes docket's published `docketEntryRead()` world, so the mark is docket's real act. It answers the door's `op=holdsdue` answer for the legal mark (`arrived: {docket_entry, case}`), the module's direct read, and the same world after the hold is placed (items empty). Test: `fixtures.test.mjs` lines 27 and 39; failing-first with a deliberate wrong case id (red), restored (green). Suite 54/54 pass; fixtures 0 failures; format and words 0 for this module; impact 0 modules. Markers added: none. Not mine, for BOB: `screens-publish` `t51.test.mjs:76` is the consumer to point at this answer; `store-assembly` words findings `wiring.mjs:78` and `wizards.mjs:51`. Record: build/jobs/T51/action-holds.md, section "Fix round 10, START B7".
