# scheduler (T51)

**Status** · session_0113Q34uGoEBKcg4P8s4Pabg · depth 2 · COMPLETE · handled B10

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

## J5 · COMPLETE

Fix round 6, G35: a same-instant stall in the scheduler. `tranche/T51` merged first.

**(1) Root cause** (`bio-plane/src/scheduler/index.mjs`, `#holding`, before: 477-505). R27 holds a registered consumer whose `wake`, read after its tick, equals the one read before and is at or before `now`. The plane's `pending-work` consumer wakes at the oldest live row's own `due_at` and runs one heavy row for each tick. Rows registered in one millisecond share a `due_at`, so after the first ends, the wake it answers is the same past instant (the next row's): read as "did not advance", the consumer was held, and the other rows waited for an `arm` outside a firing. `watch()` does not release it (`last_run` is fresh). Reproduced over the real Store (below).

**(2) Why the tests missed it, and the gap fixed.** R27's tests had a consumer whose tick throws or answers a flat `{done: 1}` with a constant wake (a spin), and one that moves its wake: none with a wake shared by several rows, and no test registers rows in one millisecond. Fixed in `held-ledger.test.mjs`: three heavy rows with one `due_at`, and the control that a tick ending no row is still held.

**What changed.** `index.mjs` `#holding` (`endedWork`, then `note(endedWork(r, c.key))`): a tick whose answer states rows ended (`finished` or `final` above zero, under the consumer's key or at the top of the answer) does not set the hold, so the consumer is asked again at the next firing. The hold's header comment says so. A tick that throws, ends no row, or answers `finished 0 / final 0` with the wake unchanged and past is held as before (R27 unchanged for those; the existing `held.test.mjs` passes whole). No interval added (R7). The hold of the other cause (a row retried: its `due_at` moves) needed no change.

**(3) Failing-first tests** (`test/m/scheduler/held-ledger.test.mjs`, 3 tests, through `register` and `onAlarm`; the consumer has the ledger's rules and answer shape):
- Red on `origin/tranche/T51`'s scheduler: "three heavy rows with one due_at all end" fails (rows 2 and 3 never run), and the "answers that rows ended" test fails (`nextAt` null, expected the past wake); the control passes. Green with the change: 3 of 3.
- Also run over the **real Store, the real ledger and the door's `pendingadd`** (three `reading` rows registered under a frozen clock, one `due_at`, `readHeld` stubbed to read): red `finished` per firing `[1, 0, 0]`, green `[1, 1, 1]`, ledger empty. That file cannot live in my tests (the architecture check refuses `scheduler` importing `plane` and `extraction`, 3 findings); it is kept at `/tmp/claude-0/-home-user-bio/c82bcf59-43e3-57bd-b370-3eb2e32cda0c/scratchpad/realstore-g35.test.mjs` (ephemeral) and could be added as a plane test by plane's next job if BOB wants it; nothing is owed for G35.

**(4) Platform check:** N.

**Results**
- scheduler suite: ℹ tests 151, ℹ pass 151, ℹ fail 0 (was 148).
- users (`impact.mjs origin/tranche/T51 HEAD`: scheduler, tasks, queue, instance-setup, control-plane, plane and others, 11 modules): tasks + instance-setup + queue: ℹ tests 562, ℹ pass 562, ℹ fail 0; plane: ℹ tests 348, ℹ pass 345, ℹ fail 3: `release.test.mjs` R24 (design words; red on the base too), `l77-size.test.mjs` R77 L gate "ledger holds nothing" (child-capped memory run: fails identically with the base scheduler restored, so not this change), and `l79.test.mjs` R79 L (failed under load next to another suite; 5 of 5 pass alone with my change, and on the base).
- `checks/run.mjs`: format 0, architecture 0 (4229 files), coverage 6656 of 6656, channels 0, words 0 failures, the words count not risen (18421 words); `ownership.mjs scheduler`: 0 failures.
- R-OLD: no stored data involved. R-NOTMET: none. No census op, no new member sentence (no stand-in row owed). No generated artifact edited; the plane bundle and `agent-worker` carry scheduler source, BOB regenerates at the layer close.

**Proposed requirement line** (BOB writes it), append to R27: "A tick whose answer states rows ended (`finished` or `final` above zero, under the consumer's key or at the top of the answer) does not set the hold, so a ledger whose rows share one instant runs one row for each firing. Test: three rows with one `due_at`, one ended for each firing; control: a tick that ends none, with the wake unchanged and in the past, is held."

Size (session_01XZXdT5nUD7u924MLb4BPh1): test runs 14, module lines 905

## J6 · COMPLETE

Fix round 6, G55 tier 2: the consumer `ingest` (START B6). `tranche/T51` merged first (origin/tranche/T51 @ 9e487bb01d).

**What changed** (`bio-plane/src/scheduler/index.mjs`)
- `ingest` closes the registry after `question-explore` (`SCHEDULER_ORDER`), answers under the key `ingest` (`SCHEDULER_KEYS`); not ranked, not daily, not always due. Its `due(now)` is `calculations.ingestDue(now)` (`true` = now, or an instant), its `wake(now)` is `ingestWake(now)` (ms or null), its `tick(now)` is `ingestTick(now)`, each asked afresh every time (R11), nothing kept here and no slice size, attempt count or interval of this module's (R7, R18). An owner that does not offer the services wants nothing (no `{error}` on every firing while calculations is unmerged).
- `schedulerOf`'s default owners gain `calculations: () => calculationsOf(ctx)`; `listenTo` takes `calculations` and registers once with `calculations.onIngestWork("scheduler", fn)`; the call arms the alarm at once (R9) except inside a firing (the firing's reconcile stands, R1), as `onCopyWork`'s. A refusal is a start-up fault (`faults()`).
- Failure never spins (R3): a throwing tick is answered `{error}` under `ingest` and every other consumer still ticks; the stop after three failed attempts is calculations' (its record leaves `ingestDue`/`ingestWake` null), so the alarm is deleted (R15). The consumer is an own consumer, so R27's hold does not wrap it.

**Tests** (`test/m/scheduler/g55-ingest.test.mjs`, 10 tests; `fixture.mjs` gains the `calculations` stand-in and `world(..., {ingest})`). Failing-first: on tranche/T51's `index.mjs` all 10 fail; with the change 8 pass. The 2 seam tests drive the REAL calculations and are RED BY NAME until calculations' G55 tier 2 merges: "R24, R7, R9 (seam: calculations R14 not merged)" (asserts `ingestDue`, `ingestWake`, `ingestTick`, `onIngestWork` are offered and the registration takes) and "R24, R9, R11, R15 (seam: ...)" (asserts `INGEST_INLINE_ROWS` is exported, an ingest of that many rows + 1 arms the alarm at once, a fresh scheduler over the store re-arms at start, the firings run the slices to the end and the alarm is then deleted). The second is written against calculations' START and cannot run until the provider exists; its field names beyond the four services and `INGEST_INLINE_ROWS`/`state: "ingesting"` are not assumed. Amended to the rule they meant (no assertion weakened): the registry's list now ends with `ingest` in `registry.test.mjs` (R5 list and the two counts), `files.test.mjs:31` and `explore.test.mjs:15`.

**Results**
- scheduler suite: ℹ tests 161, ℹ pass 159, ℹ fail 2 (the two seam reds above; was 151).
- users of `impact.mjs origin/tranche/T51 HEAD` (201 files, 10 other modules: tasks, queue, instance-setup, op-declarations, answer-envelope, store-door, signin-door, screens-action, control-plane, plane; one process at a time): pass 1429, fail 1: `plane/release.test.mjs` R24 (accepted inherited red).
- format: 176 modules, 176 requirements files; 0 failures. coverage (scheduler): 29 of 29 live requirement ids named by a test; 0 failures. ownership (scheduler, tranche/T51, job/T51/scheduler): 7 files changed by scheduler; 0 failures. words: no finding in scheduler (1 failure, `case-checker/spec.mjs:11`, accepted).
- **architecture (scheduler): 3 failures, all one cause, BOB's edge not yet in `build/modules.json`**: `scheduler.uses` must gain `calculations` (index.mjs imports `calculationsOf`; the seam test imports calculations' index and its test fixture). I may not edit `modules.json`. They clear when BOB records the edge.

**Needs from BOB / for the merge**
- The edge `scheduler.uses` += `calculations` (above), and `member-roster`'s `order.mjs` regenerates from `modules.json` (manifest §14) once it is in.
- ASSUMPTION to confirm: `onIngestWork(module, fn)` as every other notice here (`onCopyWork`, `onFileWork`). Calculations' START words it `onIngestWork(fn)`. I call it `onIngestWork("scheduler", fn)`; if calculations offers `(fn)` alone the seam test goes red by name and one line changes.
- Proposed requirement lines (BOB writes `build/requirements/scheduler.md`):
  - R24, append: "(G55; K4562) The consumer `ingest` closes the registry after `question-explore`, calling `calculations` (its R14), its answer under the key `ingest` (R2): `due(now)` is `ingestDue(now)`, `wake(now)` is `ingestWake(now)`, `tick(now)` is `ingestTick(now)`, asked afresh at every firing, `arm` and start, so a restarted instance re-derives them from calculations' tables (R11). Due only while a record is `ingesting`; the slice size, the failed attempts and the stop after the third are calculations' (R7), the stopped record leaving neither due nor wake, so a failing tick never spins (R3) and the alarm is deleted (R15). At start it registers once with `calculations.onIngestWork`, as R9's notice: each call runs `arm` (R4) at once, except inside a firing; a refused registration is a start-up fault, as R23's. No call names a member or a table."
  - R5/R7: the registry text ends "…`document-copy` (R25), `question-explore` (R26) and `ingest` (R24)".
- Generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker`'s bundle carry scheduler source; stale after this; BOB regenerates at the layer close (I changed none).
- Census ops: none declared or changed by scheduler.

Size (session_018N7Bmi8XF4uXxoG5G6hHKL): test runs 12, module lines 928

## Fix round 7 · G70 (SCHEDULER #42, session_01Avk4ZxytfuErZjqjRYMN2B, depth 2)

**What changed.** `bio-plane/src/scheduler/index.mjs`: `onAlarm` (about :578-:600) and `#reconcile` (about :644-:660). Every firing now writes, in the one heartbeat put it already made (`sched_beat`), `scheduled_for` (what the alarm was set for: this instance's last `setAlarm`, else the heartbeat's `next_set_for` after a restart), `started` (the firing's `now`), `ended` (`max(Date.now(), now)` after the reconcile), `next_set_for` (the reconcile's `nextAt`, null when deleted) and `gap_ms` (`started` minus the previous firing's `ended`, null for the first), and prints one line `{"scheduler_alarm": {...}}` with the same five fields. `#alarmFor` records each `setAlarm`/`deleteAlarm` the reconcile makes. No pace, no reconcile rule, no consumer changed (R1/R4/R16 untouched), as the entry says. No new storage key, no table (R18).

**(1) Cause:** unknown, as `diagnosis-R7-reading.md` records; this logging names it on the one redeploy (K4428). Best reading, unproven: the platform's re-arm latency after a long alarm or a held wake.
**(2) Gap fixed:** no test read alarm-to-alarm times; `r7-pace.test.mjs` now reads them through `onAlarm`, the heartbeat and the log line.
**(3) Failing-first:** `test/m/scheduler/r7-pace.test.mjs` (2 tests, names R28). RED before the change (`AssertionError: the first firing has no earlier end to be a gap from`; `no alarm after the last tick`, 0 of 2 pass), GREEN after (2 of 2). Two existing assertions in `spent.test.mjs` (R28/R29) deep-equaled the heartbeat's three keys; they now compare those three exactly and read `started` beside them (nothing weakened).
**(4) Platform check:** P, BOB's: after the redeploy read `sched_beat` (and the `scheduler_alarm` lines) for the 12 MB text on the copy; the gap is `gap_ms` and `started - scheduled_for` (platform delay before the handler ran) versus `ended - started` (the firing). L (Miniflare) shows only shape and tick count.

**Tests and checks.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/scheduler/`: tests 163, pass 163, fail 0. User `plane`: `test/m/plane/watchdog.test.mjs` tests 10, pass 10. `impact.mjs origin/tranche/T51 HEAD` (run before commit): affected modules 0 of 176. format 0 failures; architecture 0 failures; coverage 29 of 29 live ids named, 0 failures; ownership: 1 files changed by scheduler (before my record), 0 failures. `checks/run.mjs`: 11 failures, none in my files (case-checker spec.mjs inline words, installer `installer.fleet.logsunconfirmed` missingkey in newgroup, record-core R89 R90 uncovered); words count not raised by me (no new string literal in a held-word surface; the log line is a key, not a sentence).

**Requirement line proposed (BOB writes it).** R28, append: "(G70; K4428) Every firing also records in the heartbeat `{scheduled_for, started, ended, next_set_for, gap_ms}` (what the alarm was set for, the firing's start and end, what the firing set next or null, and the time since the previous firing ended or null) and prints them as one structured line; it changes no pace."
**Deferred:** none. **Other modules:** none found. **Generated artifacts:** `bio-plane/dist/bio-plane.bundled.mjs` carries scheduler source; stale after this; BOB regenerates (I changed none). **Census ops:** none. **Rows owed to UX-DESIGN:** none (no sentence).

Size (session_01Avk4ZxytfuErZjqjRYMN2B): test runs 7, module lines 941

## J7 · COMPLETE

G70 applied: per-alarm logging (scheduled_for, started, ended, next_set_for, gap_ms) in the sched_beat heartbeat and one structured line; no pace or rule changed. r7-pace.test.mjs red then green; scheduler suite 163/163; plane watchdog 10/10; format, architecture, coverage, ownership 0 failures. Platform read (P) is yours after the redeploy. Proposed R28 line, stale bundle note and size are in my record (de70118258).

## Fix round 9 · G91, G95, G94, G92, G123g (SCHEDULER #43, session_01YK5oJDSuoRHrdsfRWfQ9cd, depth 2)

Tranche/T51 merged first; the suite was green there (163) before any edit. Providers read: test-support's `alarmDouble` (`bio-plane/test/alarm-double.mjs`, merged).

**What changed** (`bio-plane/src/scheduler/index.mjs`):
- R30 (G91) `onAlarm` (about :590-:665): the consumers share a budget (`FIRING_BUDGET_MS` 10 s, private; the constructor takes `budgetMs`, tests inject 50 ms). Each tick is raced against what is left of the budget; when it is spent no further consumer starts, the firing reconciles and ends, and the heartbeat's `rotate_from` names the consumer the next firing begins at (wrapping; null when a firing reached every consumer). `pending-work` takes its turn like any other. Each consumer's call is one line `{"scheduler_consumer": {name, started, ended, outcome}}` (`#call`): written at the slow threshold (`slowMs`, default 1 s, outcome `running`, `ended` null) while the call is still going, and when it ends. The heartbeat carries `slowest: {name, ms}` of the firing.
- R31 (G92, scheduler's share) a call that outlasts the budget goes into `#inflight` (not abandoned): later firings neither ask its `due` nor start it; `#reconcile` and `#oldestOverdue` skip it (no spin, not "owed"); on settling it arms the alarm; its result (or `{error}`) is taken at the next firing. The in-flight names are in the heartbeat (`inflight`).
- R32 (G123g) `tick(now, rank, started)`: the third argument is the instant the consumer's own work began (`max(Date.now(), now)`), forwarded through the R27 holding wrapper; plane-2 reads it for `last_ms`. `last_mem` is not the scheduler's (NULL unmeasured is plane's instrument).
- R33 re-entry: the heartbeat is read from storage at the start of every run (`#beat = null`); `inflight` is rewritten from the live set (a cut run's calls died with it); `start()` clears a `running_since` a cut run left.
- R28 (G95) `health()`: `stale` per K4807 (2)/K4811 (5); it reads the firing's END, `ended` (a new instant already stored by G70), falling back to `last_run` when absent. Returns `watchdog_ran` too. R29 (G94) `watch` records `watchdog_ran` (its own clock, the `now` argument defaulting to `Date.now()`) and answers it.

**Per cause, the four fields.**
- G91 (1) cause as the plan: the unbounded sequential await (`onAlarm` :589-600 before); the part not yet known (which consumer is slow) is named by the per-consumer line, platform check P is BOB's. (2) gap: the old storage double answered `getAlarm()` at all times and its consumers answered at once; fixed by `alarmDouble` and gated consumers. (3) failing-first `r8-budget.test.mjs`, RED on tranche/T51's `index.mjs` (run with a 2 s test timeout, since the old firing awaits the gate for ever): `✖ R30: a firing whose first consumer outlasts the budget starts no further consumer ... (2003ms)`, `✖ R30: rotation ... (2002ms)`, `✖ R30: every consumer a firing runs is one structured line ... (2001ms)`, `✖ R31: a consumer whose call outlasts the budget is in flight ... (2002ms)`, `✖ R31: a call that is rejected after its firing ... (2002ms)`, `✖ R32 ... AssertionError`, `✖ R33 (a start clears the cut run's running_since)`; GREEN: 11 of 11. (4) L at the unit level only; the real-alarm Miniflare run with the 40 s scanner is plane-1's `r8-headofline` and the seam file's section G91.
- G95 (1) cause as the plan (`health` :709-716 before: a completed firing reset the clock). (2) gap: `spent.test.mjs` asserted the definition on a double; `r8-stale.test.mjs` confronts it with the walker's numbers. (3) RED on the old code: `✖ stale is true for the walker's numbers` (691 s), `✖ ... one firing has run 400 s`, `✖ ... reads the firing's end`, `✖ a real firing ... a stall of completed firings`; GREEN 6 of 6; the five controls pass both ways. (4) N, arithmetic on instants; the seam section G95 is control-plane's. **Reads `ended`** (the end), as the requirement says; `last_run` stays the start instant.
- G94 (scheduler's share) `watch` records `watchdog_ran`; RED `✖ R29: watch records the cron's slot as watchdog_seen and the instant it ran as watchdog_ran` (no field), GREEN. The route (`WATCHDOG_FIELDS`) is plane's.
- G123g (scheduler's share) R32: consumer told its own start; `R32` test red then green as above.
- G92: the in-flight set is this job's share; file-safety's bound is its own.

**Tests amended to the new rule** (`spent.test.mjs`, not weakened): the R28 health test now means five minutes, not two cycles (K4811 (5)): "owed for one cycle (300 s) is not stale" became "owed 299 s" and "a firing a cycle ago" became "a firing two and a half minutes ago"; its two heartbeat deep-equals read the new keys (`rotate_from`, `inflight`, `slowest`) beside the G70 ones.

**Tests and checks.**
- scheduler suite (`node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/scheduler/`): ℹ tests 180, ℹ pass 180, ℹ fail 0 (was 163; +17: r8-budget 11, r8-stale 6).
- users (impact.mjs reports 0 modules: no committed diff before this commit; run by hand): plane `watchdog.test.mjs` + `watch.test.mjs` 13 of 13; `fix6-pending` 10, `store` 12, `fix5-r77` 7, `fix4-r75` 7, `sweep` 5, `t33` 16 and tasks `inbox` 30, all green.
- format 0 failures; architecture (scheduler) 21 product files, 85 imports, 0 failures; coverage (scheduler) 33 of 33 live ids named, 0 failures; words (scheduler) 0 failures (0 inline, 0 plain); ownership (scheduler) 0 failures. `checks/run.mjs`: 26 words failures, none in scheduler (case-checker, pdf-reader, test-support, installer-steps).
- The new ids are each named by a test of their own: R30 (4 tests), R31 (3), R32 (1), R33 (3).

**Interface for plane-2 (job 37).** `tick(now, rank, started)`; `health()` also answers `watchdog_ran`; `watch()` answers `watchdog_ran`; the heartbeat (`sched_beat`) now also holds `rotate_from`, `inflight` (`{name: started}`) and `slowest` (`{name, ms}`); the scheduler constructor takes `budgetMs` and `slowMs` (defaults 10 s, 1 s).

**Proposed requirement wording (BOB writes).** R28: add "`ended` is the instant the firing ended, stored with the heartbeat"; R30: "the heartbeat holds `rotate_from` (the consumer the next firing begins at, null when the last reached every consumer), `inflight` and `slowest`"; R32: "the instant is the third argument of `tick`".

**Deferred:** none. **Other modules:** none. **Generated artifacts made stale:** `bio-plane/dist/bio-plane.bundled.mjs` carries scheduler source; BOB regenerates. **Census ops:** none. **Rows owed to UX-DESIGN:** none (no sentence). **New files outside my paths:** none.

Size (session_01YK5oJDSuoRHrdsfRWfQ9cd): test runs 14, module lines 1027

## J8 · COMPLETE

Fix round 9 done (G91, G95, G94, G92, G123g; R28-R33). Scheduler suite 180/180 (+17: r8-budget, r8-stale), each failing-first red then green; format, architecture, coverage (33 of 33), words, ownership 0 failures; plane watchdog/watch and other users green. Interface for plane-2, proposed wording, stale bundle note and Size line are in my record. Size (session_01YK5oJDSuoRHrdsfRWfQ9cd): test runs 14, module lines 1027

## J9 · COMPLETE (CHANGE B9, K4902)

Tranche/T51 merged (file-safety #21). No scheduler code change was needed: a consumer due `now` is already re-armed by the firing's reconcile for the next firing and never looped inside one (each onAlarm ticks a consumer once). Test only: `files.test.mjs` "R24, R9 ... against the real file-safety" now asserts R39 as amended: while views are queued the wake is the firing instant (`nextAt === at`, the alarm set for the next firing), each onAlarm renders one, the run is bounded (at most four firings for three views) and ends with a wake of null or later; the later "a week on" step reads the last firing's wake. Scheduler suite: ℹ tests 180, pass 180, fail 0.

Size (session_01YK5oJDSuoRHrdsfRWfQ9cd): test runs 17, module lines 1027

## J10 · COMPLETE

CHANGE B9 done: no scheduler code change; files.test.mjs now asserts file-safety R39 (queued-view wake is the firing instant, one render a tick, bounded, ends null). Scheduler suite 180/180; ownership 0 failures. Size (session_01YK5oJDSuoRHrdsfRWfQ9cd): test runs 17, module lines 1027

## J11 · REPORT

Job 62 diagnosis (build/plan/diagnosis-R9-headofline.md, reproduced twice on workerd, red). CAUSE: the past alarm is not the end-of-firing reconcile. While a firing runs, getAlarm() is null (workerd); a request path in the same object (promotion.onCommitted notice, tasks armDrain, plane/pending.mjs:203 arm) calls Scheduler.arm(); #reconcile (index.mjs:740) finds at===null and sets the alarm to the earliest consumer wake, pending-work's own due row, which is already past (setAlarm(698716) at wall 698772, firing started 698722). The firing lasts 8.7 s (file-scan 8 s at file-safety's own bound, then file-render, document-copy, pending-work), so that past instant is all getAlarm() answers for 8.7 s (13 polls more than 2 s past). The end reconcile (setAlarm 698723) is set 8.7 s late but the next firing starts 7 ms after, so it is never visible. Ruled out: a following firing finding consumers in flight (none was in flight: the scan ended at its 8 s bound, before the 10 s budget), the platform withholding the next alarm (gap_ms 6 to 44), file-render's wake. The fix belongs to the scheduler, not file-safety or plane. FIX I WILL BUILD: the firing sets an alarm at start + budget + grace before it reads anything (never absent, never past mid-firing; also the recovery for a cut run); an arm made inside a firing sets nothing (the end reconcile, exact, weighs every wake). Proposed R1 / R4 wording follows in COMPLETE. No QUESTION: I carry on.

## Fix round 9 · job 62 · G91's past alarm (SCHEDULER #44, session_0113Q34uGoEBKcg4P8s4Pabg, depth 2)

Tranche/T51 as of `b143f59c86`; my branch was behind origin, so I recovered it as the START says (renamed, checked out origin's), then `mail start`.

**Cause** (`build/plan/diagnosis-R9-headofline.md`, reproduced twice on workerd): not the end-of-firing reconcile. While a firing runs `getAlarm()` answers none; a request path in the same object (promotion's notice, tasks' `armDrain`, the ledger's `arm`) calls `arm()`, whose `#reconcile` found `at === null` and set the alarm to the earliest consumer wake, `pending-work`'s own due row, already past. The firing lasts as long as `file-scan` (8 s, file-safety's bound) plus the rest, so that past instant was all the administrator read for 8.7 s. The next firing begins within ms of the end reconcile, so that one is never visible. Ruled out: consumers in flight (none was), the platform withholding the next alarm, file-render's wake. The fix is the scheduler's.

**What changed** (`bio-plane/src/scheduler/index.mjs`): `onAlarm` marks itself firing first (`#firing`, `#firingEnds` = start + budget + grace; the pre-loop reads moved inside the existing try so the flag always clears); `#reconcile`, for a non-exact, non-forced call inside a firing, weighs nothing: it returns the alarm as it stands, or, when there is none, sets `max(#firingEnds, now + grace)` (readable and ahead). The end reconcile still sets the next alarm outright, weighing every wake including the work the arm announced. Outside a firing nothing changed (R4, R11, R29). A firing in which no arm is made writes the alarm once, as before.

**Tests**: new `test/m/scheduler/r9-visible.test.mjs` (4, names R30 and R1). Red on `tranche/T51`'s `index.mjs`: the arm-inside-a-firing readings (2 of 4: alarm read none; past alarm set); the end-reconcile and outside-firing controls pass both ways. Green with the change. Through the door: `r8-headofline` red before (R80 test), 3 of 3 after.

**Results**
- `r8-headofline` alone, five runs: 3 of 3 each; on one core (`taskset -c 0`): 3 of 3.
- scheduler suite: ℹ tests 184, ℹ pass 184, ℹ fail 0 (was 180; +4).
- plane `r8-wave` 3 of 3, `r8-heal-door` 4 of 4, alone.
- format 176 modules, 176 requirements files, 0 failures; architecture (scheduler) 22 product files, 87 imports, 0 failures; coverage (scheduler) 33 of 33 live ids named, 0 failures; ownership: 1 failure, `build/plan/diagnosis-R9-headofline.md` outside my paths (the file BOB's START told me to write; BOB adds it to my paths, ruling (2)).

**New file outside my paths**: `build/plan/diagnosis-R9-headofline.md`. **Deferred**: none. **Other modules**: none. **Generated artifacts made stale**: `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker`'s bundle carry scheduler source; BOB regenerates. **Census ops / rows owed to UX-DESIGN**: none.

**Proposed requirement wording (BOB writes).** R30, append: "(job 62, G91; K4912) While a firing runs, the alarm is never read in the past: an `arm` made inside a firing weighs no wake and sets nothing past; it leaves the alarm as it stands or, when the platform answers none, sets the instant the firing can no longer outlast (its start, the budget and the grace). The reconcile at the firing's end weighs every wake, the work such an arm announced included, and sets the next alarm outright. Test: `r9-visible.test.mjs`; through the door `plane/r8-headofline.test.mjs` (R80)." **Not covered, stated:** a firing in which no arm is made leaves `getAlarm()` none, as the platform does; only an arm makes the alarm readable.

Size (session_0113Q34uGoEBKcg4P8s4Pabg): test runs 14, module lines 1045

## J12 · COMPLETE

Job 62 done (G91, K4912). Cause: an arm made inside a firing (getAlarm() none) set a due row's past wake, readable for the firing's 8.7 s (diagnosis-R9-headofline.md). Fix in scheduler index.mjs: an arm inside a firing weighs nothing, leaves the alarm or sets start+budget+grace; the end reconcile sets the next outright. r8-headofline 3/3 alone x5 and on one core; scheduler suite 184/184 (+4, r9-visible); r8-wave 3/3, r8-heal-door 4/4; format, architecture, coverage 0 failures; ownership 1 failure: the new file build/plan/diagnosis-R9-headofline.md (outside my paths, as your START told me: please add it to my paths). Stale: plane bundle and agent-worker. Proposed R30 wording and Size line are in my record. Size (session_0113Q34uGoEBKcg4P8s4Pabg): test runs 14, module lines 1045

Ring failed (J12): BOB's session session_017yBV9xWBLct2WNZvFNpVhc is archived, so no doorbell could be bound; the pushed COMPLETE (J12) is the message, for BOB's backstop (mechanics §13).
