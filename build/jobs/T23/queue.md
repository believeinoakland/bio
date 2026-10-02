# queue (T23)

**Status** · session_017MoDouHv8ALjeYQN3gFsNb · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Progress, and what I wait on. (1) is done at 3a2b177054: no code change was needed (`QUEUE_CONDITION_KINDS` spreads observation-log's `CONDITION_KINDS`, so `classOfKind` already answered `CONDITION` for the eight with observation-log's sentences); `catalogue.test.mjs`'s R1 and R5 tests now pin the twenty plus `action-clock-overdue`, each new kind's sentence equal to observation-log's and saying what R1 states, with near-miss kinds classed null as negative controls. Red 13 is cleared on my branch: `test/m/queue/` 93 pass, 0 fail. A comment in `src/queuestate.mjs` (:61, "observation-log's twelve") is corrected, which stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`); I regenerate nothing. The world's `monitoring` stand-in gains `sweepConditions` (empty), ready for queue-producers R26. `node --test bio-plane/test/conclude-project.test.mjs` is red only by red 6 (`#findingsExportPerformed`: `this.#publication.exportLog is not a function`), as at my start.

(2) and (3) wait on queue-producers' merge (your CHANGE). One note for it: queue hands queue-producers only the deps named in `Queue.PRODUCER_DEPS` (`bio-plane/src/queue/index.mjs`:103), so the dep it adds for corpus-export's `exportLog` and the one for `network-notices.noticesOf` (R27) must be added there by me for queue's stand-ins to reach them; I will take their names from its COMPLETE. Checks: format, architecture, coverage (39 of 39), ownership all 0 failures.

## J2 · COMPLETE

Complete at 4e5f05e6c9 (`tranche/T23` @ queue-producers' merge merged in at 46ef034f28).

**Entries applied.**
- (1) Fold 8, R1 and R5: no code change was needed; `QUEUE_CONDITION_KINDS` spreads observation-log's `CONDITION_KINDS`, so `classOfKind` answers `CONDITION` for the eight with observation-log's sentences. `catalogue.test.mjs`'s R1 and R5 tests pin the twenty plus `action-clock-overdue` (21), each of the eight equal to observation-log's sentence and matching what R1 states, with near-miss kinds (`sweep-unknown`, `notice-posted`, padded or upper-cased spellings, `CONDITION::sweep-silent`) classed null, and nothing in `QUEUE_CONDITION_KINDS` outside observation-log's but `action-clock-overdue`. Red 13 cleared. The R1 and R5 "not yet met" marks in `build/requirements/queue.md` (:18, :22) are yours to strike.
- (2) N483 re-point (B3): `Queue.PRODUCER_DEPS` (`src/queue/index.mjs`:103) gains `corpusExport` and `networkNotices`; the world's stand-ins move `exportLog` to `corpusExport` and gain `networkNotices.noticesOf` (empty) and `monitoring.sweepConditions` (empty); `feed.test.mjs`:206 injects `corpusExport: { exportLog }`. Red 15 and red 6's conclude-project share cleared.
- (3) R26 and R27 through the feed: new `test/m/queue/signals.test.mjs` runs the real queue-producers over monitoring and network-notices fakes: all five `sweep-*` and three `notice-*` items pass the mint as CONDITIONs with observation-log's sentences, homed under their project, disposition `available: false, instead: queuemute` (R1, R5, R11, R12); a member of no project and a machine reader get none; negative controls: a producer stubbed to mint `sweep-unknown`, `notice-posted` or `sweep-held` is refused `NO_SUCH_KIND` (C-31.2), `sweep-silent` or `notice-lapse-near` as a FINDING `KIND_MISCLASSED`; a case mute of two kinds and an item mute quiet them for alice only, bob (an owner too) still sees all eight, and an unknown kind's mute is `UNKNOWN_KIND` (R14, R19, R30).
- A comment in `src/queuestate.mjs` (:61) corrected ("observation-log's twelve"); with the `PRODUCER_DEPS` change, the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from my merge; I regenerated nothing.

**Deferred:** nothing. **Found in other modules:** nothing.

**Tests.** `node --test bio-plane/test/m/queue/`: 96 pass, 0 fail. `node --test bio-plane/test/conclude-project.test.mjs`: 1 pass, 0 fail. `node --test bio-plane/test/m/` (users `control-plane/` and `plane/` included): 5181 pass, 3 fail, each accepted: `control-plane/families.test.mjs`:47 and `control-plane/totality.test.mjs`:13 (red 5: stale `activitymethod`, `escalationreasondraft`, `groupkeyspublic`, `noticepost`, `noticeprepare`, `notices`, `noticespublic`, `sweeps`, `whatchangeddrafts`, `whatchangedpropose`, until affordances', op-declarations' and control-plane's merges), `control-plane/inbox-door.test.mjs`:81 (red 9). `test/m/plane/` green.

**Checks.** format: 87 modules, 86 requirements files; 0 failures. architecture: 23 product files, 62 relative imports; 0 failures. coverage: 39 of 39 live requirement ids named by a test; 0 failures. ownership: 4 files changed by queue between tranche/T23 and HEAD; 0 failures.

Size (session_017MoDouHv8ALjeYQN3gFsNb): test runs 14, module lines 2711
