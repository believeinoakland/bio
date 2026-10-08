# scheduler (T37)

**Status** · session_01LYDPVU33jWW5KRDoigq6gZ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

**R24 applied; one red decides my next test change.** `scheduler/plane.test.mjs`'s R12 test (:177) now fails a new way after its credential fix: "the request expired within 1000 alarms" (null).

Cause, measured (each firing's answer logged): the run's `op=acquire` makes a capture, so `file-safety` queues its safe view; this Miniflare plane binds no `FILE_SCANNER`, so every `renderBatch` answers `RENDERER_ABSENT`, and `renderWake` (file-safety R39: "the later of `now` and the last `renderBatch` plus `FILE_SAFETY_POLL_MS`" while a view is queued) wants a wake forever. Two consequences:
1. **In production**, an instance holding one queued file with no renderer bound polls `renderBatch` every 5 minutes forever, each refused; it never idles (R15's spirit), unlike `scanWake`, which R39 makes null "with no scanner bound". Not a spin in production, a perpetual poll.
2. **In this test**, file-safety stamps its last `renderBatch` on its own (wall) clock while the test drives `onAlarm` on a virtual clock up to 24 h ahead, so R39 answers about wall + 5 min, i.e. ~100 ms after each virtual firing: the alarm crawls and never reaches the request's 24 h expiry.

The scheduler here does exactly R24 (due and wake are R39's answer; no interval held, R7), so per the START I hold nothing here and report it.

**My best reading / recommendation (QUESTION):** (a) a `file-safety` share: R39's render (and the safe-copy part of it) is null while no renderer is bound, as scan's is with no scanner; my R12 test then passes unchanged. Until it lands, R12's test (:177) is red by this cause alone. Alternatives: (b) I give `plane.test.mjs` a scripted `FILE_SCANNER` service binding that renders, so the queue drains (hides the flaw; adds a stand-in for another module's worker in my test); (c) accept :177 red by name until (a). I recommend (a) with (c) meanwhile. Everything else is done or under way: the other 5 plane tests green (rows 54–58's cause fixed); my suites 104/104 apart from :177; checks next.

## Completion (T37-24)

**Entries applied** (N762, its share; K2129, K2153, K2175, K2188, K2189, K2191, K2212):
- R2: the five keys `filescan`, `filerender`, `filedeeper`, `fileforward`, `filereputation`.
- R7: `FILE_SCAN_EVERY_MS` and `FILE_SAFETY_POLL_MS` removed; no instant, period or interval kept for any file-safety consumer. `sched_files` is no longer read or written; a value T36 left in storage is **ignored** (never read, written or deleted: a migration line kept forever was not worth its code, and the value names nothing).
- R24: five consumers after `dated-waits`; each `due` and `wake` is file-safety R39's answer at `now` (`scanWake`, `renderWake`, `deeperWake`, `forwardWake`, `reputationWake`), asked afresh at every firing, `arm` and start; an answer that is not an instant in ms is none. Ticks: `scanBatch({at})`, `renderBatch({})`, `deeperBatch({})`, `forwardSecurityCounts({})` (no period), `refreshReputationLists({at})`. `hand` registers once with `onFileWork` when it takes `fileSafety`; each call runs `arm` (outright, as `told()`), except while `onAlarm` runs, whose authoritative reconcile stands; a refused registration (or an owner without `onFileWork`, or one that throws) is a start-up fault in `faults()`, shaped as R23's.
- K2189 (red census rows 54–58): `plane.test.mjs`'s `GET`/`POST` send the token in `Authorization`, never the address; the four `mem-sch` uses are an enrolled member's session (`enrolled("mia")`); `MEMBER_TOKEN` dropped from the bindings. Admission not loosened.
- Tests: `files.test.mjs` rewritten against R39's wakes, each new clause its own test naming its id (five keys, no interval exported, wakes asked afresh and after a restart, `sched_files` ignored, the arm on `onFileWork`, the refused registration in `faults()`), with two tests against the real `file-safety` (onFileWork arms on a receipt; no spin). `fixture.mjs`'s stub gains the five wakes, `refreshReputationLists` and `onFileWork`; `registry.test.mjs` names the fifth consumer.

**Deferred:** none of my own. `plane.test.mjs`:177 (R12) is red, accepted by name as rule 6 item 23 until N789 (K2235; B2): file-safety's render wake wants a wake forever with no renderer bound (J1).

**Found in other modules (J1, answered):** file-safety R39's render wake is never null while a view is queued with no renderer bound (a 5-minute poll forever in production; under a virtual test clock the alarm crawls), → N789. Plane's `t36.test.mjs`:176 (R26) is red: its :187 asserts `filedeeper` ticks at every firing, T36's rule; under R39 the deeper batch wants no wake while no check is queued or running. Plane's re-pin, T37-48 (L11). Nothing new is needed from the plane's composition (it already hands `file-safety` before `start()`).

**Reading set:** measured over 300 KB (own requirements 22 KB, code 51 KB, tests 170 KB, plus the used services' parts), so I read whole: my requirements, layer 10's row of `build/layers.md`, my code, `files.test.mjs`, `fixture.mjs`, `plane.test.mjs`, file-safety's R4, R12, R21, R35, R36, R39–R41 (and its Purpose and Terms), file-safety's test fixture (used by my real-owner tests), the plan's rules 1 and 6 and my entry, and K2129, K2130, K2153, K2175, K2188, K2189, K2191, K2212. A worker read the other eight test files whole and wrote a 4 KB summary (each statement citing file:line: the order and count assertions in `registry.test.mjs`:10–18, :130, :155; the R18 storage rules in `invariants.test.mjs`:32–37 and `new-work.test.mjs`:165–186; `faults()` in `t34.test.mjs`:167–175); nothing it left out mattered (all eight green). I glanced at `bio-plane/test/members.test.mjs`:45–70 only, for K2182's header pattern.

**Tests run:** scheduler's ten files: 109 pass, 1 fail (`plane.test.mjs`:177, item 23). Users: `instance-setup/identity` 12/0, `tasks/inbox` 24/0, `file-safety/intake` 5/0, `file-safety/wakes` 4/0, `plane/unpack` 4/0, `plane/store` 11/0, `plane/sweep` 5/0, `plane/notices` 6/0, `plane/t36` 12/1 (:176, T37-48), `plane/t33` 16/0, `bundler/release` 45/0.
**Checks:** format: 136 modules, 135 requirements files; 0 failures. architecture: 12 product files, 59 relative imports; 0 failures. coverage: 24 of 24 live requirement ids named by a test; 0 failures. ownership: 6 files changed by scheduler; 0 failures.

Size (session_01LYDPVU33jWW5KRDoigq6gZ): test runs 46, module lines 724

## J2 · COMPLETE

T37-24 complete (record: Completion). R2, R7, R24 applied: five file-safety consumers on R39's wakes, file-reputation added, onFileWork registered at hand (fault on refusal), the two intervals and sched_files gone (a T36 value ignored). Census rows 54–58 cleared (Authorization header; an enrolled member's session). Scheduler 109/1: the one red is plane.test.mjs:177, rule 6 item 23 until N789. Users: all green but plane t36.test.mjs:176 (:187 pins T36's every-firing filedeeper; plane's re-pin T37-48). Checks: format, architecture, coverage 24/24, ownership: 0 failures each. Nothing new from the plane's composition. 724 lines.
