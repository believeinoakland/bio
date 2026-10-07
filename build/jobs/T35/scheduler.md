# scheduler (T35)

**Status** · session_013E5dGLgQtrrBK6U5UXXWAA · depth 2 · COMPLETE · handled B1

## Completion (T35-83)

**Entries applied.**
- (K1993; capture-requests R49) **T35-83**: `bio-plane/test/m/scheduler/plane.test.mjs`, the R12 test ("a run waiting on a request that reaches expired is woken on the alarm that expires it, exactly once"), now makes the address it requests held first. Ruth captures an index page (`op=acquire`, `subresources: true`) whose one outbound link is `https://www.held.example.org/doc.pdf` (the fixture's outbound service answers that host's page). She then files the capture in an information bundle, its register row and provenance document the acquisition's own answer (`fileCapture`). The request is accepted as before. The test's claim (R12) and every assertion are unchanged. Red 31's scheduler arm is cleared.
- Filing the capture is needed, not decoration. A capture filed in no bundle leaves its task event `waiting` (tasks R1), and `task-drain` then wants a wake at the 60 s backstop forever. With that, 1,000 alarms reach only about 16 h, never the request's 24 h expiry. It also breaks the next test's precondition (R9 sweep: "nothing due within a minute"). Filed, the event drains and the alarms run hourly, as before R49.
- No source change. `bio-plane/src/scheduler/index.mjs` is untouched, and no requirement changes.

**Deferred.** None.

**Found in other modules (REPORT J1).**
- `plane` (T35-73, red 31's other arm, `sweep.test.mjs`:29, :41): K1993's remedy, "a member's `op=acquire` of a page linking to it", is not enough by itself in a scene that then follows or reads the alarm. The acquired page must also be filed in a bundle (a register row), or its task event keeps a 60 s wake. Worth carrying into T35-73's START.
- `tasks` (R1; layer 11): a capture that is acquired and never filed keeps its event `waiting` indefinitely. `task-drain`'s wake is then `now + TASK_DRAIN_BACKSTOP_MS` (60 s) at every reconcile, with no end, so an otherwise idle instance's alarm fires every minute for as long as an unfiled capture exists. That works against scheduler's Purpose and R15 ("an idle instance holds no timer"), and costs a Durable Object wake a minute. A bound (back off by attempts, or stop waking once an event has waited past some limit, until a promotion files it) is tasks' to state. This is a finding against tasks' efficiency, not a red.
- Generated artifacts: none made stale (tests only).

**Tests and checks.**
- `node --test bio-plane/test/m/scheduler/plane.test.mjs`: red at start (R12: `CAPTURE_REQUEST_ADDRESS_NOT_HELD`, C-28.24); now 6 pass, 0 fail.
- Module: `node --test bio-plane/test/m/scheduler/`: 95 pass, 0 fail, 0 skipped.
- capture-requests (K1993): `node --test bio-plane/test/m/capture-requests/`: 103 pass, 0 fail, 0 skipped.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 130 modules, 0 failures. `architecture.mjs scheduler`: 11 files, 56 imports, 0 failures. `coverage.mjs scheduler`: 23 of 23, 0 failures. `ownership.mjs scheduler tranche/T35`: 1 file, 0 failures.

Size (session_013E5dGLgQtrrBK6U5UXXWAA): test runs 13, module lines 657

## J1 · REPORT

Two findings outside scheduler (record, Completion). (1) plane T35-73 (red 31's other arm, sweep.test.mjs:29, :41): K1993's remedy, op=acquire of a page linking to the address, is not enough alone in a scene that follows or reads the alarm. The acquired page must also be filed in a bundle (a register row), or its task event stays waiting and task-drain wants a wake every 60 s (TASK_DRAIN_BACKSTOP_MS), forever. In scheduler's R12 scene that kept 1,000 alarms from reaching the 24 h expiry and broke the next test's 'nothing due within a minute'. Worth carrying into T35-73's START. (2) tasks R1 (efficiency): a capture acquired and never filed keeps an otherwise idle instance's alarm firing every minute indefinitely, against scheduler's Purpose and R15 (an idle instance holds no timer). A bound (back-off by attempts, or no wake past a limit until a promotion files it) is tasks' to state. Not a red.

## J2 · COMPLETE

T35-83 applied: plane.test.mjs's R12 scene captures an index page linking to its requested address and files it, then requests as before; claim and assertions unchanged; no source or requirement change. Red 31's scheduler arm cleared. scheduler 95/0, capture-requests 103/0; format, architecture, coverage (23/23), ownership (1 file): 0 failures. Record: Completion (T35-83).
