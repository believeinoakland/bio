# control-plane (T22)

**Status** · session_016ux7EiaYD1rDwE1Vhdqh9y · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Q1 (entry (1), the `pulled` resolve's reason; my best reading, carrying on with (2)–(7) meanwhile).

Keeping R36's one act needs a capture change: capture's `inboxResolve` `pulled` arm calls `this.#pull({knockId, by}, reason)` (`bio-plane/src/capture/index.mjs`:707) with no `within` and no `at`, and the public `pullKnock` (:728) passes `reason` null. The door therefore has no call that both records the reason on the knock's row (capture's table, which only capture writes) and runs its promotion inside the pull's transaction.

Proposed capture change (one line, capture's job): `inboxResolve({knockId, status, by, reason, at, within})` passes `at` and `within` to `#pull` on the `pulled` arm: `this.#pull({ knockId, by, at, within }, reason)`. Nothing else in capture moves; the direct `pullKnock` still takes no reason.

The door's side, built on that reading: `op=inboxresolve` with `status: "pulled"` still routes as the pull (every gate and stamp the pull's), and now carries the body's `reason` to the store route `inboxpullfile` with a resolve mark; `pullAndFile` then calls `capture.inboxResolve({knockId, status: "pulled", by, reason, at, within})`, so capture's own order (`BAD_STATUS`, `NO_SUCH_KNOCK`, `RESOLVE_NO_REASON`, C-118.7, 400) refuses a reasonless one before anything is written and records an admitted reason on the row with the pull, in the one transaction with the promotion. `op=inboxpull` keeps calling `pullKnock` with no reason. Until capture's change lands, my door-side test of the reasoned resolve (reason on the row, promoted at `collected`) is red by name; the refusal tests (no, blank, 2,001-character reason: nothing written) pass either way.

Asks: (a) will capture make that change in this layer (or is it accepted for me to depend on it), and (b) is relying on capture's own refusal (rather than the door re-checking the reason itself) what you meant by "the door refuses … (capture's row, read, never copied)"? If (b) is no, I add a door pre-check reading `CAPTURE_CHECKS.RESOLVE_NO_REASON` and capture's exported `REASON_MAX`, after `NO_SUCH_KNOCK` (asked through `inboxGet`) so capture's order holds.

## J2 · REPORT

REPORT (status, a stale generated artifact, one row beyond those named).

1. The plane bundle is stale: my change under `bio-plane/src/control-plane/` (`index.mjs`, `dispatch.mjs`, `pull.mjs`) stales `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`'s, manifest "Generated artifacts"). I regenerated nothing.
2. `catalogue-end.test.mjs`: re-running it on `tranche/T22` found seven re-worded rows, not six: capture's C-118.3 and C-85.1–.5 as named, and standards' C-112.17 `STANDARD_FIELD_UNKNOWN`, re-worded by standards' T22 merge (`158651d631`, DEC-88). I re-pinned all seven under `changed.note`; no other row moved, and the test's negative control (one changed word is seen) still holds.
3. Done on `job/T22/control-plane` @ HEAD: entries (1) on B2's reading (the door refuses a reasonless `pulled` resolve itself, `NO_SUCH_KNOCK` first through `inboxGet`, by capture's row and `REASON_MAX`; the pull stays one act through `pullKnock`'s `within`; the re-routed resolve is marked by the door's own `resolve=pulled` stamp, which a caller's `op=inboxpull` cannot set), (2) (stated status answered for `inbox`, `inboxpull`, `inboxresolve`, `heldsetaside`, `heldrestore`; `inbox` added because capture's bad-sort refusal states 400), (3), (4), (5) (`reason` from the query, else a POST body's string, nothing else of the caller's), (7). `test/m/control-plane/` 116/117, the one red K1105's (`inbox-door.test.mjs`: the reason on the knock's row). The whole `bio-plane/test/m`: 4964 tests, 4944 pass, 8 fail, every one accepted by name: queue-producers `proposals.test.mjs` (4), accepted red 4 (`module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, `registry.test.mjs`:58), and K1105's. Checks: format, architecture, coverage (28/28), ownership: 0 failures each. Module 3,484 lines.
4. Left: (6), which waits on op-declarations declaring the new ops (none of `declinetoescalate`, `escalationstatus`, `heldsetaside`, `heldrestore`, `heldcaptures`, `doorbelltally`, `gradenote`, `addressfrequencyset` is in `OPS` on `tranche/T22` yet). I wait for your CHANGE announcing affordances' and op-declarations' merges, then merge `tranche/T22`, add the stamps tests and run totality.

## Completion (CONTROL-PLANE #13)

**Entries applied** (B1 START; B2 ANSWER; B3, B4 CHANGEs):
- (1) R36, the `pulled` resolve's reason, on B2's reading (K1105): `op=inboxresolve` at `pulled` still routes as the pull and is marked by the door's own `resolve=pulled` stamp (a caller's `resolve` is deleted, so a direct `op=inboxpull` never carries a reason). The store route passes the body's `reason`; `pullAndFile` refuses, before anything is written and in capture's order, `NO_SUCH_KNOCK` (through `inboxGet`) and then `RESOLVE_NO_REASON` (C-118.7, 400, capture's own row and `REASON_MAX`, read, never copied), then pulls through `pullKnock`'s `within`, one act with the promotion. Recording the reason on the knock's row waits on capture's N499 (T23 L3).
- (2) A refusal's stated status is answered for `inbox`, `inboxpull`, `inboxresolve`, `heldsetaside`, `heldrestore` (`STATED_STATUS_OPS`); a refusal stating none in 400–599 answers the forward's own.
- (3) `op=inbox`'s `sort`, `dir`, `limit`, `after` reach `inboxList`, tested, with capture's own refusal of an unknown one.
- (4) `doorbell.test.mjs`'s discard sends a reason; `rows-before-r43.json` re-pins eight re-worded rows under `changed.note`: capture's C-118.3 and C-85.1–.5, standards' C-112.17 (DEC-88; its T22 merge, `158651d631`) and queue's C-33.44 (B3, B4). No other row moved.
- (5) `statementack` carries the caller's `reason` (the query's, else a POST body's string) on both doors, nothing else of the caller's; the dead answer stays byte-identical.
- (6) The eight new ops route through the general path; the viewer stamp gains `CAPTURE_VIEWER_ACTIONS` and `CAPTURE_READS` (B3 (a)); every other stamp rides lists already read. `doorbelltally` is a session's alone; `doorbellrefused` answers `unknown op`.
- (7) Notes naming deleted files as live re-worded: `store.mjs` (`index.mjs`, three), `legacy-index`'s and `legacy-store`'s arms (`harness.mjs`, `affordances-pack.test.mjs`, `stats.test.mjs`). Provenance notes kept.

**Deferred:** none of mine. The reason on the knock's row is red by name (K1105) until capture's N499; once it lands, the door may route through `inboxResolve` (J1's proposal), as T23 will say.

**Found in other modules:** capture's `inboxResolve` `pulled` arm does not take `within` (J1; N499). Generated artifact staled: `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json` (`src/control-plane/` changed, J2); regenerated nothing.

**Tests and checks** (on `job/T22/control-plane` with `tranche/T22` @ K1109 merged):
- `node --test bio-plane/test/m/control-plane/`: tests 116, pass 115, fail 1 (`inbox-door.test.mjs`: the reason on the knock's row, accepted red K1105). `totality.test.mjs` green.
- `node --test bio-plane/test/m/` (the plane's and capture's included): tests 5008, pass 4992, fail 4, todo 12 (other modules' not-yet-met marks), skipped 0. The reds: accepted red 4 (`membership/module-order.test.mjs`:12, `membership/t9-notice-sight-bounds.test.mjs`:185, `promotion/registry.test.mjs`:58) and K1105's. No new red.
- `checks/format.mjs`: 0 failures · `architecture.mjs control-plane`: 0 failures · `coverage.mjs control-plane`: 28 of 28, 0 failures · `ownership.mjs control-plane tranche/T22`: 0 failures.

Size (session_016ux7EiaYD1rDwE1Vhdqh9y): test runs 15, module lines 3504

## J3 · COMPLETE

COMPLETE. Every entry applied (B1; B2's reading; B3, B4), recorded under "Completion (CONTROL-PLANE #13)" in my record on `job/T22/control-plane`, `tranche/T22` @ K1109 merged.

(6): the eight new ops route through the general path with their act lists' stamps; the viewer stamp names `CAPTURE_VIEWER_ACTIONS` and `CAPTURE_READS` (B3 (a)); `doorbelltally` is a session's alone; `doorbellrefused` answers `unknown op`. C-33.44 is re-pinned with the seven (eight rows in all), and no other row moved.

The one red of mine is accepted by name (K1105): `bio-plane/test/m/control-plane/inbox-door.test.mjs`, "an admitted `pulled` resolve's reason is recorded on the knock's row with the pull", until capture's N499 (T23 L3).

`test/m/control-plane/`: 116 tests, 115 pass, totality green. My J2 count of "116/117" was wrong: the suite then had 112 tests, 111 passing. The whole `bio-plane/test/m`: 5008 tests, 4992 pass, 4 fail (accepted red 4 ×3, K1105's), no new red. Checks: format, architecture, coverage 28/28, ownership 0 failures each. Module 3,504 lines.

The plane bundle is stale (J2): I regenerated nothing.
