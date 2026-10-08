# capture (T36)

**Status** · session_01J8qhjNNKU3fBhYXuRdt3ne · depth 2 · WORKING · handled B0

## Completion

**Entry applied: T36-41 (N740; K2038, K2087).** R45's `taskEvents({limit, kind, after})` (`bio-plane/src/capture/index.mjs`:2400) now gives each event a `cursor`, and with `after` it answers only the events past that cursor's place in the queue's order:
- The cursor is opaque: base64url of `["task-event", enqueued, digest, kind]`, written with the module's existing `cursorOf` and read back with `keyOf` (`:130–137`). The tag keeps another read's `next` from being taken for one.
- The place is a position in the order, not a row. So a cursor still works after its event is removed, and a drainer that leaves `limit` or more unfiled events at the head reaches every event behind them by passing on the last `cursor`.
- The order stays "by `enqueued`, then digest". `kind` is added as a third key, so two events with the same instant and digest (two kinds, read with no `kind`) each get their own place and none is skipped or read twice.
- An `after` that is not such a cursor (absent, malformed, of another shape or tag, not a string) is read as absent, and the read starts at the head as R45 says. Unlike the module's N90 reads, it does not refuse with `BAD_CURSOR`, because R45 says "read as absent" and none of the four answers throws.
- `taskEventCount`, `taskEventAttempt` and `taskEventRemove` are unchanged.

**Tests:**
- New `test/m/capture/t36.test.mjs`, four tests titled R45. They check:
  - draining the whole queue past cursors at limits 1, 2, 3, 6, 7 and 50, with nothing removed, answers every event exactly once, in order;
  - a cursor keeps its place when its event (and the next) is removed, and through an attempt and a deduped re-enqueue;
  - with and without `kind`, including the tie of one instant and digest across kinds;
  - 16 kinds of non-cursor `after` each read from the head;
  - none of the four answers throws, on a sound store or on a store whose table is gone.
- `services.test.mjs`'s R45 test now pins the event's keys with `cursor` included.

**Found in other modules** (REPORT J1):
- Neither drainer passes `after` yet, so the head-of-line case N740 names is fixed at capture's interface but not yet at its users.
  - `tasks` `taskDrain` (`bio-plane/src/tasks/index.mjs`:324–368) re-reads and retries unfiled events at the head, and `#backoffWake` (:977–995) reads only the first `TASK_DRAIN_ALARM_BATCH` events.
  - plane `unpack.mjs`:43 reads the first 1000 `archive-unpack` events, and events at the retry limit stay queued.
- Each can page with `after` (pass the last event's `cursor` while a page comes back full). That is their modules' change.
- No generated artifact reads capture's `taskEvents` in a way this change stales beyond the plane bundle's copy of `index.mjs`. That bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`'s) is stale and is regenerated at layer close (§14).

**Deferred:** nothing.

**Reading set (§17 (3); START measured 671 KB, over 300 KB):**
- Read whole myself:
  - `build/requirements/capture.md`;
  - layer 3's row of `build/layers.md`;
  - plan T36's opening rules and entry T36-41, and K2038 and K2087;
  - `bio-plane/src/capture/index.mjs` (2,658 lines), the code my entry changes;
  - the R45 tests in `services.test.mjs` and `t35.test.mjs`.
- No used service is named by R45, so no used module's public part bore on the change. `record-core`'s `transact` is untouched.
- A worker read whole every other file under `src/capture/` and `test/m/capture/`, plus `cap13-reuse-pages.test.mjs`, `d57selflink.test.mjs`, `plane/unpack.mjs` and the `tasks` drain. Its summary (7.2 KB) cites file and line for:
  - every queue touch (the `taskenqueue` route only; no route exposes `taskEvents`);
  - each caller's use of the event fields (neither caller reads `cursor` or passes `after`);
  - the two drainers' head-of-line behaviour;
  - the fixture.
- Nothing it left out mattered: no other file pins the event's keys or the method's signature.

**Tests run:**
- capture's tests (`test/m/capture/*.test.mjs`, `cap13-reuse-pages`, `d57selflink`): `tests 155, pass 155, fail 0, skipped 0`.
- R45's users (`test/m/tasks/*`, `test/m/plane/unpack.test.mjs`, `test/m/queue/*`): `tests 229, pass 229, fail 0, skipped 0`.
- No layer tests are named in the manifest.

**Checks** (process repository):
- `format: 135 modules, 134 requirements files; 0 failures`
- `architecture: 26 product files, 113 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 58 of 58 live requirement ids named by a test; 0 failures`
- `ownership: 4 files changed by capture between tranche/T36 and HEAD; 0 failures`

**P6:** `src/capture/` 3,800 lines (+16), under about 4,000.

Size (session_01J8qhjNNKU3fBhYXuRdt3ne): test runs 6, module lines 3,800

## J1 · REPORT

T36-41 (N740): capture's R45 now pages past a cursor, but **neither drainer passes `after` yet**, so the head-of-line case N740 names is fixed at capture's interface, not yet at its users. Both changes are theirs (P7):
- `tasks` `taskDrain` (`bio-plane/src/tasks/index.mjs`:324–368) reads `taskEvents({limit: cap, kind})` and retries unfiled or mint-exhausted events, which stay at the head (an attempt does not move an event). With `cap` or more of them at the head, filed events behind them are never drained. `#backoffWake` (:977–995) reads only the first `TASK_DRAIN_ALARM_BATCH`. Fix: page with `after` = the last event's `cursor` while a page comes back full.
- plane `unpack.mjs`:43 reads the first 1000 `archive-unpack` events, and events at its retry limit stay queued, so past 1000 such events, newer ones are never seen. Same fix.
- The tasks test stand-ins (`test/m/tasks/world.mjs`:115, `ledger.test.mjs`:53, 76) ignore `after` and need it once tasks passes it.
- The plane bundle (`not_product`'s) carries the old `taskEvents`; it is stale until the layer close regenerates it (§14).
