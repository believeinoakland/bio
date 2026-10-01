# queue (T20)

**Status** · session_014ABrgP9q5aYLLQp7fqWZ5n · depth 2 · COMPLETE · handled B1

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
