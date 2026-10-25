# action-holds (T51)

**Status** · session_01E2eTwBJGNb3qbSi7xQa82K · depth 2 · COMPLETE · handled B3

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
