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

## J4 · COMPLETE

Fix round 5/6, B3 and B4 together (one COMPLETE; supersedes J3's, whose R4/R11 work stands). Tranche/T51 merged (B4's files read: rulings K4565, K4566, K4570, `diagnosis-R6-watchdog.md`).

**What changed** (`bio-plane/src/scheduler/index.mjs`)
- R4/R11 (J3): spent alarm (past > 60 s, outside a firing) re-armed afresh to `max(want, now)` by `start()` and `arm()`: `SPENT_ALARM_MS`, in `#reconcile`.
- `heal(now)` (B3 a): the request paths' door. One `getAlarm()`; none or spent, it arms as `arm`; otherwise it asks no consumer anything. At most one look per 5 s per instance; inside a firing it does nothing. Answers the alarm or null.
- Heartbeat (B3 b, B4 a): one storage value `sched_beat` = `{last_run, running_since, watchdog_seen}`. `onAlarm` sets `running_since` at its start, and at its end (in `finally`, however it ends) clears it and records `last_run` after the reconcile.
- `health(now)` (B3 b): `{last_run, running_since, watchdog_seen, alarm_at, oldest_overdue, stale}`; `oldest_overdue` is the earliest wake already come (each owner answers its own wake: no row body read), `stale` = work owed for two cycles (5 min each) with no firing in them. Reads only.
- `watch(at)` (B4 b): records `watchdog_seen` (never backwards, one put), reads alarm and heartbeat, re-arms outright (`max(want, now)`, R27 holds cleared) only when: (a) no alarm and no fresh `running_since` (within 5 min: `getAlarm()` is null during a run), (b) alarm spent, (c) work owed, no fresh run, `last_run` older than 2 cycles, and the alarm still ahead (one already due is about to run). With a live alarm and fresh `last_run` it asks no consumer anything. Runs no tick, reads no row. Answers `{alarm_at, last_run, running_since, rearmed, why}` (`why`: null, `no_alarm`, `spent`, `stale`).
- R14 (B4 c): header comment `index.mjs:5-9` reworded (the one cron is the watchdog calling `watch`). `invariants.test.mjs:12-21` rewritten: the configuration declares at most one cron, and any is `*/5 * * * *`. **PLANE:** when you add the cron, tighten that test to exactly one (`crons.length === 1`). **Not mine:** `monitoring/index.mjs:94` ("NOT a cron") needs its comment reworded by monitoring's owner.

**Tests** (`test/m/scheduler/spent.test.mjs`, 12 tests; fixture `pinNow`, and the heartbeat kept out of `kv`/`log` so R17/R18's "writes nothing else" tests stand unchanged). Failing-first, red then green: the three J3 cases (spent alarm at start; at arm; the more-than-7-kills shape) seen red on tranche/T51's code, green now; heal and health and watch are new methods, so every test of them is red (TypeError) before. Cases: dead alarm healed by the next request (null and spent), live alarm untouched with no consumer asked; stale true after two cycles with work owed and false when owed one cycle, nothing owed, or fresh `last_run`; watch on spent, null, future+fresh (nothing set, nothing asked), future+owed+stale, fresh vs stale `running_since`, a double and a late call (one effective set, `watchdog_seen` never back), `onAlarm` and ticks never called, a firing's `running_since` set before the first tick and cleared even when the firing throws.

**Results**
- scheduler suite: ℹ tests 148, ℹ pass 148, ℹ fail 0 (was 135).
- users of `impact.mjs origin/tranche/T51 HEAD` (192 files; plane, control-plane, queue, tasks, instance-setup among them): ℹ tests 1364, ℹ pass 1363, ℹ fail 1: `plane/release.test.mjs` R24 (design words; red on tranche/T51 without my change). `r117-held` passed this run (it failed on the base too: flaky in this container).
- format 0 failures; architecture (scheduler) 16 product files, 74 relative imports, 0 failures; coverage (scheduler) 27 of 27, 0 failures; ownership 10 files changed by scheduler, 0 failures; checks/run.mjs: format, architecture, coverage, channels, words all 0 failures.
- No plane test needed amending.

**Proposed requirement lines** (BOB writes `build/requirements/scheduler.md`; R-ids R28, R29 are free)
- R4, append: "An alarm already past by more than a minute, when no firing is running, is spent, not armed (the platform stops running an alarm it killed too often and goes on reporting its time): `arm` sets it afresh to the later of the earliest wake and now. A live alarm is never pushed later."
- R11, append: "At start the same rule holds, so every deploy and restart of the object restarts the owed work."
- **R28** (K4563, K4565) "`heal(now)` is the request paths' door: with no alarm set or a spent one it arms as `arm` (R4); otherwise it asks no consumer anything; at most one look in five seconds per instance, none inside a firing. Every firing records its heartbeat, the storage value `sched_beat` `{last_run, running_since, watchdog_seen}`: `running_since` at its start, cleared when it ends however it ends, and `last_run` when it completes. `health(now)` reads and answers `{last_run, running_since, watchdog_seen, alarm_at, oldest_overdue, stale}`: `oldest_overdue` the earliest wake already come (null if none), `stale` true when work has been owed for two cycles (five minutes each, the constant the plane shares) with no completed firing in them. It re-arms nothing."
- **R29** (K4566, K4570) "`watch(at)` is the watchdog's one call, made by the plane's Worker cron once a cycle. It records `watchdog_seen` (never backwards) and re-arms outright, to the later of the earliest wake and now, only when no alarm is set and no firing is in progress (`running_since` within a cycle), or the alarm is spent, or work is owed, no firing is in progress, `last_run` is older than two cycles and the alarm is still ahead. It runs no tick, reads no consumer's rows or any document, and is idempotent: a late or repeated call with a live alarm and fresh `last_run` sets nothing and asks no consumer anything. It answers `{alarm_at, last_run, running_since, rearmed, why}`." Interface for the plane's `watchdog(at)` RPC: `schedulerOf(ctx, env).watch(controller.scheduledTime)`; `owedwork` reads `.health()`.

Nothing needed from BOB. Generated artifacts: the plane bundle and `agent-worker` carry scheduler source; BOB regenerates at the layer close (I changed none).

Size (session_01WuSBArtKWiDTrSYjdTtS8z): test runs 17, module lines 859
