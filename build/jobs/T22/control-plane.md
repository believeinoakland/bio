# control-plane (T22)

**Status** · session_016ux7EiaYD1rDwE1Vhdqh9y · depth 2 · WORKING · handled B2

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
