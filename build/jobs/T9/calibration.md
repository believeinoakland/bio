# calibration (T9)

**Status** · session_014rdgsa7CsV4uZBTdm9Rh2U · depth 2 · WORKING · handled B2

## Completion (CALIBRATION #2)

**Entries applied** (plan layer 4):
- **N202** (its share): `onCalibration` refuses a malformed or repeated registration through membership's `listenerRefusal` (R81); this module mints neither `LISTENER_MALFORMED` nor `LISTENER_DECLARED` any more. R12's listeners run in membership's `MODULE_ORDER` (R83) unless a test passes its own order. Uses, R12 and `modules.json` updated by BOB (J1, B2, K291). Tested against `listenerRefusal`'s own answer for each condition, and the default order against `MODULE_ORDER`.

**Flaws fixed in this module:** R12's listeners ran in registration order in production: `calibrationOf` is reached with no `order` (store.mjs 590, 7706; extraction; scheduler), and the default was `[]`. The default is now `MODULE_ORDER`; tested.

**Deferred:** none.

**Found in other modules / for BOB:**
- `build/requirements/calibration.md` (BOB's file): the Status line's "Not yet met" list (R4, R12 N41; R5 D-587, D-668; R8 D-668; R10, R11 N41; R16 K23) and the `*(not yet met: …)*` marks on R4, R5, R8, R10, R11, R12 and R16 are stale: each is built and tested at the interface (store.test.mjs names every one; coverage 17/17), so the marks can be struck.
- Generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `agent-worker/dist/agent-worker.bundled.mjs` (their manifests list `src/calibration/index.mjs`); not rebuilt (§14).

**Tests and checks:**
- `node --test bio-plane/test/m/calibration/`: tests 43, pass 43, fail 0, todo 0 (after merging `tranche/T9` @ K291).
- Users of calibration: extraction 65/65, content 50/50, scheduler 46 pass 0 fail 6 todo.
- `format`: 0 failures. `architecture calibration`: 0 failures (2 before K291, the membership import). `coverage calibration`: 17 of 17 live ids named; 0 failures. `ownership calibration tranche/T9`: 0 failures.

Size (session_014rdgsa7CsV4uZBTdm9Rh2U): test runs 5, module lines 1777

## J1 · QUESTION

N202 needs calibration to use membership, which neither `build/modules.json` (calibration's `uses`: legacy-checks, record-core) nor `build/requirements/calibration.md` (Uses; R12) states. Built on this reading meanwhile (89622d04bd): `onCalibration` refuses through `listenerRefusal`, and listeners default to `MODULE_ORDER` (production passed no order, so they ran in registration order; same flaw provenance fixed). `checks/architecture.mjs calibration` fails only on that import (src/calibration/index.mjs and test/m/calibration/store.test.mjs import src/membership/index.mjs); every other check is clean.

Proposed, for your files:
1. `modules.json`: calibration's `uses` gains `membership`. (Or, if you prefer, `promotion`, whose R49 re-exports `listenerRefusal`; but `MODULE_ORDER` is membership's, so `membership` is the one addition that covers both.)
2. calibration.md Uses: "- `membership`: `listenerRefusal` (R81) and `MODULE_ORDER` (R83)."
3. R12, replacing "(a second registration by the same module is refused `LISTENER_DECLARED`)" with: "(a malformed registration, or a second by the same module, is refused through `membership`'s `listenerRefusal`, its R81: `LISTENER_MALFORMED`, `LISTENER_DECLARED`)", and "in the modules' total order" with "in the modules' total order (`membership`'s `MODULE_ORDER`, R83)".

One consequence of R81 governing: a whitespace-only module name ("  ") was refused `LISTENER_MALFORMED` here before and is now accepted, as R81 accepts any non-empty string. I kept R81's definition.
