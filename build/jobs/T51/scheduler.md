# scheduler (T51)

**Status** · session_014f28DBW5m4WZkX9XCWVNyB · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Found in another module, not changed (P9): `bio-plane/src/op-grades/t36.mjs:18`, a plain sentence "scheduler: the security wakes; name no member and move no bundle", counted by the words check in the full run (`node checks/run.mjs`). It is op-grades' finding; op-grades' owner keys it.

For BOB, the three decisions I made on the T51-153 findings (recorded in `build/rulings.md` by BOB, since that file is outside my paths; I did not write it):
K4056 (proposed): the file-safety notice refusal's `detail` is `localize('scheduler.index.the_file_safety_owner_offers_no_onfilework', …)`; the refusal test takes its codes from file-safety's `FILE_SAFETY_CHECKS` declaration, not a hand-list (K3268); the plane test's capture method is the fixture token `fixture-capture`, not acquisition's sentence (K3810).

Also expected: `setup-words --check` reports `rows.mjs` stale at word 21287 (the new key); BOB regenerates it at the layer close.
