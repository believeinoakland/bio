# queue (T20)

**Status** · session_014ABrgP9q5aYLLQp7fqWZ5n · depth 2 · WORKING · handled B2

## Completion

**Entries applied** (B1 START; `plan/current.md` T20 L11, queue: K902, K899 (7), DEC-61; K907):
- R1: `litigation-hold` catalogued as an OBLIGATION in `src/queuestate.mjs` (after `action-reminder`), with its sentence: a reply the group marked as legal pressure; consider whether to place a litigation hold, and record it in place or released with a reason (op=actionhold, DEC-61) — LIVE: queue-producers R19.
- R12, R28: `OBLIGATION_DOORS` gains `"litigation-hold": "actionhold"`; `OBLIGATION_DOOR_DETAIL` gains its sentence (keyed by the action and the entry rather than by a task; it leaves when a member records the hold in place or released, with a reason, op=actionhold). R28's bridge reads the same table, so it answers `CLASS_NOT_DISPOSED` with `instead: actionhold` for the published id and for the class-stripped key.
- K907 (INTENT #8 J1 (3)): `src/queuestate.mjs`'s bias-debt comment no longer names the retired `workproduct_state` half; it reads "the old state-transition gate … since retired, K899 (3)". Two comments' "three" for the Action layer's doors corrected to four.
- Tests (`test/m/queue/`): `action.test.mjs` carries the litigation-hold item through the mint (class OBLIGATION, `available: false`, `instead: actionhold`, its detail sentence), the mute refusals by kind and by id and the suppression fence (R19, R26, R31), and a new test of R12's door and R28's bridge (`CLASS_NOT_DISPOSED`, `instead` equal to the item's, C-33.44, nothing written); `catalogue.test.mjs`'s exact OBLIGATION set and sentence (R1). No suite deleted (K619).

**Deferred:** none.

**Found in other modules / generated artifacts:**
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`; owner `not_product`) is staled by this change: fleetbundles' three bio-plane arms (D-298 staleness, byte identity, manifest sha256) fail until it is rebuilt at the layer close. Its other reds are K917's three accepted (agent-worker's 153 inputs, the two (j) arms).
- `civicos-ui` (legacy-ui): `check-refusal-codes.mjs` and `test/queue.test.mjs` fail identically on the base (`bio-plane/scripts/walkfloor.mjs`, `bio-plane/checks/bio-checks.mjs` deleted in T19); not this change, noted only.

**Tests and checks run:**
- `node --test bio-plane/test/m/queue/`: tests 75, pass 75, fail 0.
- Users of the changed service (R1, R12): `test/m/control-plane/` 85/85, `test/m/plane/` 28/28; readers of the catalogue `test/m/queue-producers/` 46/46, `test/m/affordances/` 131/131, `test/m/tasks/` 71/71. No layer tests named in the manifest.
- `checks/format.mjs`: 0 failures; `checks/architecture.mjs bio queue`: 0 failures; `checks/coverage.mjs bio queue`: 37 of 37 live ids named, 0 failures; `checks/ownership.mjs bio queue tranche/T20`: 5 files changed, 0 failures.

Size (session_014ABrgP9q5aYLLQp7fqWZ5n): test runs 12, module lines 2602

## J1 · COMPLETE

QUEUE #9 complete on job/T20/queue. Applied B1: R1 catalogues litigation-hold (OBLIGATION, its sentence, LIVE: queue-producers R19); R12/R28 OBLIGATION_DOORS litigation-hold -> actionhold with its OBLIGATION_DOOR_DETAIL sentence, so the bridge answers CLASS_NOT_DISPOSED with instead actionhold; K907's comment re-worded (no workproduct_state). Tests: test/m/queue 75/75 (litigation-hold through the mint, door, bridge, mute fences); users control-plane 85/85, plane 28/28; readers queue-producers 46/46, affordances 131/131, tasks 71/71. Checks: format 0, architecture 0, coverage 37/37, ownership 0. Mark met: queue R1/R12's litigation-hold share (K902). REPORT: the plane bundle (bio-plane/dist, not_product) is staled by this change (fleetbundles' three bio-plane arms red until rebuilt at layer close; the other three reds are K917's accepted). civicos-ui's check-refusal-codes and test/queue.test.mjs are red identically on the base (deleted walkfloor.mjs, bio-checks.mjs), not this change. Deferred: none. Record: build/jobs/T20/queue.md.

## Re-opened by B2 (CHANGE; QUEUE-PRODUCERS #4 J1)

**Applied:** `Queue.PRODUCER_DEPS` gains `"actions"` beside the Action layer's providers, so a caller's `actions` is handed to `queue-producers` (its R8), which reads `actions.holdsDue` for R19's `litigation-hold` OBLIGATION. The test world's `defaultFakes` gains an `actions` answering no mark, so no queue test reaches a real `actions`. New test in `action.test.mjs` (R8, R12): a fake `actions` given to queue reaches R19's mint (the item is OBLIGATION `litigation-hold`, `instead: actionhold`; the fake asked once with the viewer), and as negative control the same feed over a fake answering no mark mints no such item.

**Tests:** on this branch `test/m/queue/` is 75/76: the new test is red until `queue-producers`' R19 merges (its producer is on `job/T20/queue-producers` only; START: queue merges after queue-producers). On a scratch merge of `origin/job/T20/queue-producers` into this branch: `test/m/queue/` 76/76, `test/m/queue-producers/` 47/47; with `"actions"` removed from `PRODUCER_DEPS` there, the new test fails (the defect's control). Users: `test/m/control-plane/` 85/85, `test/m/plane/` 28/28. Checks: format 0, architecture 0, coverage 37 of 37, ownership 6 files, 0 failures.

Size (session_014ABrgP9q5aYLLQp7fqWZ5n): test runs 18, module lines 2603
