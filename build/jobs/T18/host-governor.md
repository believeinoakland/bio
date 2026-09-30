# host-governor (T18)

**Status** · session_01MwgW222syZfXr1tpQiVafD · depth 2 · COMPLETE · handled B1

## Completion (HOST-GOVERNOR #4)

**Entries applied** (`build/plan/current.md` layer 3, host-governor; BOB's B1):
- **The legacy-index map's §4.4 plain move (K649 (7)).** The `governorOp` block (`src/index.mjs` 616–619) is now `governorOpResponse(op, url, store, {json, doAnswer, storeRefusal, storeSilent})` in `src/host-governor/index.mjs` (R18, R19, R27), with `GOVERNOR_OPS`, the one list of this module's two ops. `index.mjs` rewired (§12.2): the import (line 39) and one dispatch line (616); ownership reports legacy-index +2 / −5 lines, both added lines listed by the check. `governorOp` also reads `GOVERNOR_OPS` now. The stale comment on `answerOf` (it cited `index.mjs`:671, a caller handing no relay) is corrected: the Worker's arm always hands the relay.
- **Convert `queue-conditions`** (host-governor's share: the cool-off facts the CONDITION items read). This suite was not verified at T17 (`legacy-tests.md` b21–b30), so I read it whole. It needs from this module the facts `queue-producers`' `#conditionsGovernorHolding` reads through `governorOf(ctx)` with no options: the host, `cooloff_until`, `refusals`, `last_refusal_status`, `last_refusal_at`, `appetite_per_min`, `granted`, `refused_total`. It also needs the hold at the reader's as-of instant, resolved by lapsing for every reader with nothing written, 503 and 403 holding as 429 does, and a refusal after a lapse holding again, escalated. These are now `test/m/host-governor/holding.test.mjs` (4 tests: R14, R9, R8, R26). The whole plane's route to them is covered by a new `ops.test.mjs` test: a report to the Durable Object's `governorreport` route is the hold that `op=governorstate` answers, and `governoradmit` refuses it `cooling_off` (R18, R14). The rest of the suite is other modules' share (queue, queue-producers, capture, promotion, membership): the feed, the mute, the case walk, the other two kinds, the subject bound, and the source pins. Per K619, the old suite is not deleted.
- **Catalogue and store:** no row moved or changed. No `awaiting stamp` row. No legacy-store line touched.

**Deferred:** none.

**Found in other modules:** none new. `test/system/refusal-wire.test.mjs` fails with `HALTED: the catalogue corpus is below its floor`. It fails the same way on untouched `origin/tranche/T18`, so it is not this job's (the DEC-49 floors are re-pinned at the release, K619).

**Tests and checks run:**
- `node --test test/m/host-governor/`: tests 39, pass 39, fail 0.
- `node --test test/system/plane-envelope.test.mjs test/system/refusal-wire.test.mjs`: plane-envelope passes; refusal-wire fails as above, red on base too.
- `checks/format.mjs`: 79 modules, 74 requirements files; 0 failures.
- `checks/architecture.mjs … host-governor`: 5 product files, 9 relative imports; 0 failures.
- `checks/coverage.mjs … host-governor`: 27 of 27 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … host-governor tranche/T18`: legacy-store 0/0, legacy-index 2 added / 5 removed; 0 failures.
- No generated artifact is made stale by this job's own paths. `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) bundles `index.mjs`, so BOB's layer-close regeneration picks it up.

Size (session_01MwgW222syZfXr1tpQiVafD): test runs 4, module lines 433
