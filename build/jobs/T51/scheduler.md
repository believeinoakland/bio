# scheduler (T51)

**Status** · session_01WuSBArtKWiDTrSYjdTtS8z · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found in another module, not changed (P9): `bio-plane/src/op-grades/t36.mjs:18`, a plain sentence "scheduler: the security wakes; name no member and move no bundle", counted by the words check in the full run (`node checks/run.mjs`). It is op-grades' finding; op-grades' owner keys it.

For BOB, the three decisions I made on the T51-153 findings (recorded in `build/rulings.md` by BOB, since that file is outside my paths; I did not write it):
K4056 (proposed): the file-safety notice refusal's `detail` is `localize('scheduler.index.the_file_safety_owner_offers_no_onfilework', …)`; the refusal test takes its codes from file-safety's `FILE_SAFETY_CHECKS` declaration, not a hand-list (K3268); the plane test's capture method is the fixture token `fixture-capture`, not acquisition's sentence (K3810).

Also expected: `setup-words --check` reports `rows.mjs` stale at word 21287 (the new key); BOB regenerates it at the layer close.

## J2 · COMPLETE

T51-153 done. Entries applied: the (W) words finding and the plain finding (index.mjs:636, keyed); the hand-list (files.test.mjs:162, codes now from file-safety's declaration); one test copy (plane.test.mjs:107, a fixture token). Tranche/T51 merged first (68ba37c273); the suite ran green there before any edit.

Deferred: none. Other-module finding: REPORT posted (op-grades t36.mjs:18). Ruling K4056 proposed in the REPORT for BOB to record.

Tests and checks:
- scheduler suite (`node --test test/m/scheduler/*.test.mjs`): ℹ tests 135, ℹ pass 135, ℹ fail 0 (after merge, after edits).
- format: 176 modules, 175 requirements files; 0 failures.
- architecture (scheduler): 15 product files, 73 relative imports; 0 failures.
- coverage (scheduler): 1 modules, 27 of 27 live requirement ids named by a test; 0 failures.
- words (scheduler): 1 modules, 3002 string literals; 0 failures.
- words (monitoring following link-sweep scheduler): no line naming scheduler.
- ownership (scheduler, tranche/T51, job/T51/scheduler): 4 files changed by scheduler; 0 failures.
- setup-words --check: rows.mjs stale at word 21287 (expected; BOB regenerates).
- checks/run.mjs: scheduler's own lines clear; the remaining findings belong to other modules (op-grades, and the wider words backlog).

Size (session_014f28DBW5m4WZkX9XCWVNyB): test runs 5, module lines 796

## J3 · COMPLETE

Fix round 5, F5 (the spent alarm, K4561) done. Tranche/T51 merged first.

**Root cause** (the diagnosis): `#reconcile` (`bio-plane/src/scheduler/index.mjs`) only pulled a non-exact alarm earlier; an alarm the platform had stopped running (8 killed runs, then no more) kept being reported by `getAlarm()` at the oldest row's due instant, so `start()` and `arm()` found `at <= want` and set nothing. Why the tests missed it: the fixture alarm starts null and nothing started from a spent alarm or the platform's exhausted retries.

**What changed**
- `index.mjs:81` `SPENT_ALARM_MS = 60_000`; `index.mjs:593` (in `#reconcile`, non-exact): outside a firing, an alarm past by more than 60 s is spent and set afresh to `max(want, now)`. Both `start()` (R11) and `arm()` (R4) take it: decided yes for `arm`, so a wedge heals without a restart and a spent alarm is never a reason to hold work. Inside a firing it does not apply (the firing's own alarm; the firing's reconcile sets the next).
- New `bio-plane/test/m/scheduler/spent.test.mjs` (5 tests). Failing-first, seen red on tranche/T51's `index.mjs` (3 fail: start with a spent alarm, arm with a spent alarm, the platform's 8-kills shape), green with the change; the two controls (alarm future / within a minute / at the wake kept; arm inside a firing does not re-arm) pass both ways. Also, your evidence test `build/plan/fix-round-5-evidence/stale-alarm.test.mjs` run against the plane: red per the diagnosis, green now (`setAlarm` called, the fresh row read).
- Tests amended to the rule they meant (eight, all arms made by a notice that reads the real clock while the test seeds wakes at the fixed `NOW`): `pinNow(t)` added to `fixture.mjs` pins `Date.now()` to `NOW`; applied to `consumers.test.mjs:125` (R17 notices), `files.test.mjs:184` (R24, R9, R17), `new-work.test.mjs:219` (R9 follow), `producers.test.mjs:113` (R9 sweep promotion) and `:132` (R9 entity resolution), `t34.test.mjs:109` (R22, R9), `:156` (R23, R17), `:220` (R22 real publish-schedule). No assertion weakened.

**Tests and checks**
- scheduler suite: ℹ tests 140, ℹ pass 140, ℹ fail 0 (was 135; +5).
- users from `impact.mjs origin/tranche/T51 HEAD` (192 files, 11 modules, incl. the plane's, control-plane, queue, tasks, instance-setup): ℹ tests 1369, pass 1367, fail 2. Both fail identically on tranche/T51 without my change (not mine): `control-plane/r117-held.test.mjs:50` (R117 acquire `readHeld`, actual 0 expected 1) and `plane/release.test.mjs:74` (R24: `screen.objective.purpose` not held by the words list, the design words backlog; setup-words `rows.mjs` stale).
- No test in the plane's suite failed on the new rule, so there is no plane test for BOB to amend (the diagnosis's "one such test" did not fail here).
- format: 176 modules, 176 requirements files; 0 failures. architecture (scheduler): 16 product files, 74 relative imports; 0 failures. coverage (scheduler): 27 of 27 live requirement ids named by a test; 0 failures. ownership (scheduler, tranche/T51, job/T51/scheduler): 9 files changed by scheduler; 0 failures. checks/run.mjs: format, architecture, coverage, channels, words all 0 failures.

**Proposed requirement lines** (BOB writes `build/requirements/scheduler.md`)
- R4, append: "An alarm already past by more than a minute (60 s), when no firing is running, is spent, not armed: the platform stops running an alarm whose runs it killed too often and goes on reporting its time. `arm` then sets the alarm afresh to the later of the earliest wake and now. A live alarm is still never pushed later; inside a firing the rule does not apply."
- R11, append: "At start the same rule holds: an alarm lost or spent (past by more than a minute) is set afresh to the later of the earliest wake and now, so every deploy and every restart of the object restarts the owed work."

**Needs from BOB:** nothing. Live repair per the diagnosis: the deploy replaces the object, `start()` re-arms, the existing rows run oldest first, one heavy row per tick; no SQL repair. Generated artifacts: `agent-worker` and `bio-plane/dist/bio-plane.bundled.mjs` bundle scheduler source through the plane; BOB regenerates them at the layer close (I changed no generated file).

Size (session_01WuSBArtKWiDTrSYjdTtS8z): test runs 9, module lines 801
