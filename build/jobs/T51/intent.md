# intent (T51)

**Status** · session_014ohJQ9SaciKc4N4cLVwEjU · depth 2 · RUNNING until 2026-10-25T18:00:02Z (users' tests (11 modules)) · handled B3

## J1 · COMPLETE

**T51-222 · intent (words, K3949).** Done. Commit `81924580ba` on `job/T51/intent`; no other module touched.

**Entries applied**
- The 8 findings of the conversion (`build/plan/words-pass/intent.md`):
  - `index.mjs` CONDITION_UNREADABLE detail (the two shape sentences): `localize("intent.index.condition_shape_unreadable", …, {shape, amount_shape})`. The literal braces are passed as vars, so the rendered text is unchanged.
  - `grammar.test.mjs` rows for INTENT_NO_SUCH_PROGRESSION and INTENT_NO_REASON: `word("refusal.…")` in place of the copied sentences.
  - `pursuits.test.mjs` REMEDY: `word("intent.ask_active_administrator")`. The copied "is an administrator's act" fragment is removed; the exact detail is already held by the `notAnAdmin` deepEqual.
- The 3 plain findings (K3957):
  - `index.mjs:62` GROUP_ASPIRATION_ACT: `localize("intent.index.declaring_revising_retiring_group_aspiration", …)`. The test imports the export rather than copying it.
  - `index.mjs` undetermined grade `why`: `word("intent.why.instance_grade_undetermined")`, which has a row.
  - `index.mjs` money "never taken as zero": `word("intent.record_holds_money")`, which has a row.
- The 1 test copy (K3962): `pursuits.test.mjs` line 24, handled above.
- Found on the re-run of the words check, after the first pass (5 more `intent` findings, all member-facing sentences):
  - `checks.mjs` NOT_YOURS translation: `word("refusal.NOT_YOURS")`, which has a row with the same text.
  - `index.mjs` aspiration scope refusal (lines 298 and 929, the same sentence): one constant, `ASPIRATION_SCOPE_NAMED = localize("intent.index.aspiration_scope_named", …)`.
  - `index.mjs` MACHINE_CANNOT_SET_OBJECTIVE: `localize("intent.index.objective_measure_member_act", …)`.
  - `index.mjs` project departs only from a group aspiration: `localize("intent.index.project_departs_group_only", …)`.
- New ids are `intent.index.*`, as the job names them. None has a row yet, so each answers its `en` until BOB's regeneration.

**Deferred:** nothing.

**Found in other modules (not changed):** the whole-product words check still reports 2,300 failures, in other modules (case-grammar, case-import, case-disclosures, wizard-scripts and others). That is for BOB to route to their owners (P9).

**Checks and tests**
- `node --test bio-plane/test/m/intent/*.test.mjs`: `tests 82, pass 82, fail 0`.
- `checks/run.mjs /home/user/bio`: format `0 failures`; architecture `0 failures`; channels `0 failures`; coverage across the product `25 failures`, none in intent; words `2300 failures`, none in intent.
- `checks/format.mjs`: `0 failures`. `checks/architecture.mjs intent`: `0 failures`. `checks/coverage.mjs intent`: `33 of 33 live requirement ids named by a test; 0 failures`.
- `checks/ownership.mjs /home/user/bio intent tranche/T51 job/T51/intent`: `5 files changed by intent; 0 failures`.
- `setup-words/build.mjs --check`: stale-rows note only, expected: `rows.mjs` lacks the new `intent.index.*` ids. No refusal naming intent.

Size (session_01Xq24r8vyf2nW2HRS4PznTs): test runs 2, module lines 2235

## J2 · COMPLETE · re B2

CHANGE B2 (K4259) done. Commit on `job/T51/intent`; only intent's files touched.

**Entry applied (1).** The reason a condition was set is stored with it and `progress` answers it.
- `doc.mjs`: `conditionLines` writes `set_reason` beside `set_by` and `set_at`; `conditionOf` reads it back (null when absent). Front-matter-safe: a quote, backslash or any white-space run (a line break too) becomes one space (`oneLine`); the Session Log keeps the words whole. Not cut, however long.
- `index.mjs`: `setCondition` passes the trimmed reason in; `progress` answers `set_reason` beside `set_by` and `set_at`. A removal drops the whole block, so a removed condition answers none and leaves nothing behind. A condition set before this change answers `set_reason: null`.
- Tests (`reasons.test.mjs`, written first and seen failing): a set, a replacement and a removal (and a re-set after it); a reason holding quotes, backslash, line breaks, `#` and 5,000 characters; the control, a condition planted without a reason, answers `set_reason: null` with its `set_by` and `set_at`. `invariants.test.mjs`: the stored key list gains `set_reason` (R19's check that no progress figure is stored is unchanged).

**Requirement lines for BOB (not edited, they are not mine).**
- R2: "Success ... carrying the condition (or its removal), its reason, author and time" already says this; add: "the reason is stored with the condition as `set_reason`, on one line (a quote, backslash or line break becomes a space; the Session Log keeps the words whole)."
- R3/R4: `progress` answers `set_reason` beside `set_by` and `set_at`; `null` for a condition set before it was stored; no `set_reason` key when there is no condition.
- Or as a NEW R, next free id R36, in R30's neighbourhood: "R36 (K4259) The reason a condition was set is stored with it (`set_reason`) and `progress` answers it beside `set_by` and `set_at`; null for a condition set before this."
No new member-facing sentence, so no new word id.

**Tests and checks**
- `node --test bio-plane/test/m/intent/*.test.mjs`: tests 94, pass 94, fail 0.
- Users of intent (investigation, actions, monitoring, queue-producers, store-door): all pass except store-door R17 (1 fail, same on the untouched tip). scheduler 7, affordances 33, answer-envelope 16, control-plane 13, plane 39 fail, each the same count with my change stashed, so not caused by it (they look environmental or other modules'; for BOB).
- `checks/run.mjs`: format 0; architecture 0; channels 0; coverage 6 failures in other modules (agent-harness R17; agent-runner R37 R38 R40; installer-steps R26 R31; journey-check R19; screens-inquiry R110 R119; screens-intake R53), intent `35 of 35 ... 0 failures`; words 1 failure, `testcopy op-grades t37.test.mjs:32`, none in intent.
- `checks/ownership.mjs /home/user/bio intent tranche/T51 job/T51/intent`: 0 failures.

**Deferred:** nothing. **Found in other modules:** only the failures above (not changed).

Size (session_01XcNgiqYHy6Zizx3gVoR4W1): test runs 5, module lines 2265

## J3 · COMPLETE

Fix round 10, Wave A batch 4 (B3) done. Only intent's `tests` files changed (`bio-plane/test/m/intent/`); no source change.

**Fixtures published** (`bio-plane/test/m/intent/fixtures.mjs`, new; checked by `fixtures.test.mjs`, which calls each and compares the real answer):
- `intentWorld` (users: monitoring): the real `intentOf(...)` over a project whose condition reads ENT-1's `proc` instances (ENT-2 has `need` placed, `award` missing, so one gap). Answers `intent`, `project`, `viewer`, the real `gaps` and `watchSet` answers, and `captures`; `registerSource` is the real one. It replaces `stubIntent()`.
- `notYoursRefusal` (user: control-plane): the real NOT_YOURS (C-111.15) of `declareAspiration` when a member declares a member-scope aspiration for another member; `refusal` is the answer, nothing written.

**Own fixture lines, 6 of 6 done** (`node checks/fixtures.mjs . intent --list`: answer 0, stub 0, code 0, contract 0, accepted 0; 0 failures):
- discovery.test.mjs:220: HELD_ELSEWHERE replaced by inquiry's real dispose refusal, `disposeAct({ to: "no-such-state" }).done` (BAD_TARGET_STATE), asserted `ok: false`.
- fixture.mjs:113: `provenance` is now `registeredHomes({ host, record, membership, promotion }).provenance`, the real provenance with nothing registered, which progressions, content, events and inquiry share.
- reasons.test.mjs:139: provenance's fixture `homeOfEmpty()` (the real provenance over an empty store), not `registeredHomes`: that test's ai-runs world creates a partial `register` table without `path`, so a real provenance cannot migrate over it (`no such column: path`). `homeOf` answers null as the hand-built one did.
- fixture.mjs:125,132 and :151 (judgment): intent's world now builds the real retrieval (`retrievalOf`, `observation: {}` as basis-versions' world does, since observation-log is not among intent's uses) and the real inquiry (`inquiryOf`, its connections reached through the instance and migrated), and records each call by delegating (`selectionCreate`, `dispose`). The hand-built NO_OWNER / NO_SUCH_SELECTION / NOT_YOURS refusals and the hand-written dispose are gone; the selection handle is retrieval's own, so discovery.test.mjs R17 asserts the dispose handle equals the handle `selectionCreate` answered (`calls.handles`) instead of `"sel-1"`. The world registers promotion's `caseMember` (false) and `publishedRegistry` (null) facts as inquiry's own world does, which dispose asks.
- `personFacts` stays a stand-in (not listed; no published inquiry fixture for it).

**Markers added:** none (`fixtures-own` 0, `fixtures-generic` 0, `fixtures-contract` 0).
**Left:** nothing of mine. Wave B / `stay` lines: none in intent.

**Tests and checks**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/intent/*.test.mjs`: tests 96, pass 96, fail 0 (94 + 2 new).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs intent`: 0 failures. `checks/coverage.mjs intent`: 36 of 36 live requirement ids named by a test; 0 failures. `checks/ownership.mjs . intent origin/tranche/T51`: 1 files changed by intent... 0 failures.
- `checks/words.mjs`: 1 failure, `testcopy progressions bio-plane/test/m/progressions/overdue.test.mjs:93`, none in intent (not mine, unchanged).
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 0 of 178; affected test files 0 of 2777 (test-only change), so no user's tests to run.

**Found in other modules:** only the words failure above (progressions). The stored `register` table of ai-runs' test world lacks `path` (it is a partial stand-in of provenance's), which is why reasons.test.mjs uses `homeOfEmpty()`.

Size (session_01BBT6yik8ZYE33ZBXj5u7xP): test runs 6, module lines 2265

## J4 · COMPLETE · re B4

Follow-up 27 (B4, MONITORING #26 J7) done. Test files only (`bio-plane/test/m/intent/fixtures.mjs`, `fixtures.test.mjs`); no product code changed, so no `impact.mjs` run.

**Fixture published:** `watchSetOf(held, { throwsFor = [], page = null } = {})`, async, in `bio-plane/test/m/intent/fixtures.mjs`.
- `held` is `{ [name]: [digest, ...] }`. Each name becomes a project made by real acts: promoted, a one-stage `watched` progression defined, one entity per project, each digest resolved to it and threaded into an instance, the condition set by `setCondition`. `watchSet` therefore answers exactly those digests, once each, in order. An empty list is a project with an objective and no condition (`watchSet` none, `progress` a null condition, `gaps` none).
- `throwsFor`: names whose `watchSet` throws `Error("intent unreadable")` when asked. `page`: when set, a `watchSet` naming no `limit` is asked for `page` captures, so the real cursor is followed (monitoring's stub paged by two; `page: 2` gives that).
- Answers `{ world, intent, projects, viewer, calls, sources }`. `projects[name]` is the project's real id: the record chooses it (a project cannot be given an id, C-59.1), so monitoring's tests take the id from here. `intent` has `watchSet`, `gaps`, `progress` (the real answers) and `registerSource` (the real registration; accepted ones also kept in `sources` as `{ kind, reader }`); `calls` is each `watchSet` asked, `{ project, after }`, as the stub's `calls` was. `viewer` is a participant of every project.
- Note for monitoring: one stage leaves an instance's grade undetermined (intent's rule), so `progress` of a project with digests answers `satisfied: null`; its `gaps` are none. Where a test needs a met or short condition, `intentWorld` is the published fixture for it.

**Tests** (`fixtures.test.mjs`, 2 new): digests held once each in order, real paging by the cursor, `calls`, a caller's `limit`, empty project, `throwsFor` (the real module still reads it), real `progress`/`gaps`, one source registers once; one digest held by two projects.

**Markers added:** none (`fixtures-own` 0, `fixtures-generic` 0, `fixtures-contract` 0). My lines in `checks/fixtures.mjs /home/user/bio intent --list`: 0 (answer 0, stub 0, code 0, contract 0, accepted 0; 0 failures).

**Tests and checks:** `bio-plane/test/m/intent/*.test.mjs`: tests 98, pass 98, fail 0. format 0; architecture (intent) 0; coverage `36 of 36 live requirement ids named by a test; 0 failures`; ownership `1 files changed by intent ...; 0 failures`. Whole-product `fixtures` lines still fail in other modules' files (connections, control-plane, instance-setup, filings, monitoring and others), none in intent's.

**Deferred:** nothing. **Found in other modules:** nothing beyond those lines.

Size (session_01GUj8GfroqrbB9njoTNg55o): test runs 4, module lines 0

## J5 · COMPLETE

COMPLETE follow-up 27 (B4): see record J4. Fixture: watchSetOf(held, { throwsFor, page }) in bio-plane/test/m/intent/fixtures.mjs; answers { world, intent, projects, viewer, calls, sources }; projects[name] is the real project id. Tests 98/98; format, architecture, coverage, ownership 0.
