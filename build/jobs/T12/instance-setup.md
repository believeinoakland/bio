# instance-setup (T12)

**Status** · session_01Qk57v2crns3EGpjW9ysjS3 · depth 2 · WORKING · handled B1

## J1 · REPORT

N234 pushed (`job/T12/instance-setup` @ HEAD): `bio-plane/src/setup.mjs` now exports `GROUP_SLUG_RE` and `FLEET_BINDINGS` (with `memberVersions`, which moved with them from legacy-index, the map's §1 row). legacy-store imports `GROUP_SLUG_RE` from `./setup.mjs` (its `static GROUP_SLUG_RE` removed); legacy-index imports `memberVersions` (the block removed). Ownership: 0 failures (legacy-store +3/−6, legacy-index +1/−44). Module tests 4/0 (`test/m/instance-setup/`); `bootstrap.test.mjs` 18/0.

Made red by the move, anchored on moved source (not mine to edit):
- installer: `newgroup/test/wizard.test.mjs` reads `const FLEET_BINDINGS = […];` from the plane's `index.mjs` source (line 1286) — 206/0 on the tranche base, 7 fail here (the two PINs and the five INSTALL/UPDATE arms fed by `PLANE_FLEET`). INSTALLER's N234 import (`import { FLEET_BINDINGS, GROUP_SLUG_RE } from "../../bio-plane/src/setup.mjs"`) fixes it.
- legacy-tests: `bio-plane/test/instance-group.test.mjs` S4 reads `static GROUP_SLUG_RE` from `store.mjs` by source (46/1 here); retired by N234's import (map §4).

The rest of the extraction continues; the next push will move more of the same legacy files.
