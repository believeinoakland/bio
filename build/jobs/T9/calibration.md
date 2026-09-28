# calibration (T9)

**Status** · session_014rdgsa7CsV4uZBTdm9Rh2U · depth 2 · WAITING ON BOB (J1) · handled B2

## J1 · QUESTION

N202 needs calibration to use membership, which neither `build/modules.json` (calibration's `uses`: legacy-checks, record-core) nor `build/requirements/calibration.md` (Uses; R12) states. Built on this reading meanwhile (89622d04bd): `onCalibration` refuses through `listenerRefusal`, and listeners default to `MODULE_ORDER` (production passed no order, so they ran in registration order; same flaw provenance fixed). `checks/architecture.mjs calibration` fails only on that import (src/calibration/index.mjs and test/m/calibration/store.test.mjs import src/membership/index.mjs); every other check is clean.

Proposed, for your files:
1. `modules.json`: calibration's `uses` gains `membership`. (Or, if you prefer, `promotion`, whose R49 re-exports `listenerRefusal`; but `MODULE_ORDER` is membership's, so `membership` is the one addition that covers both.)
2. calibration.md Uses: "- `membership`: `listenerRefusal` (R81) and `MODULE_ORDER` (R83)."
3. R12, replacing "(a second registration by the same module is refused `LISTENER_DECLARED`)" with: "(a malformed registration, or a second by the same module, is refused through `membership`'s `listenerRefusal`, its R81: `LISTENER_MALFORMED`, `LISTENER_DECLARED`)", and "in the modules' total order" with "in the modules' total order (`membership`'s `MODULE_ORDER`, R83)".

One consequence of R81 governing: a whitespace-only module name ("  ") was refused `LISTENER_MALFORMED` here before and is now accepted, as R81 accepts any non-empty string. I kept R81's definition.
