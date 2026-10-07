# reevaluation (T35)

**Status** · session_01RAsDWSMPhnFASHguUe4CCA · depth 2 · COMPLETE · handled B0

## J1 · REPORT

REPORT — T35-52 makes two things outside reevaluation stale; nothing changed outside my paths.

1. Generated artifact (§14): `bio-plane/dist/bio-plane.bundled.mjs` carries C-110.1's old translation ("the plane's own credentials"); regenerated at L7's close.
2. control-plane `test/m/control-plane/rows-before-r43.json`:363 pins C-110.1's translation digest (`229f685fa674fc61`), so `catalogue-end.test.mjs`:21 (R43, R22) also mismatches on C-110.1 once this merges. The test is already red under accepted red 19 (it stops first at C-29.3 today); C-110.1 joins the rows T35-72 re-pins.

## J2 · COMPLETE

COMPLETE — T35-52 reevaluation, on `job/T35/reevaluation` @ 46a737f62a (cut from `tranche/T35`; nothing to merge in).

Entries applied:
- DEC-149 sweep, 1 M row: `checks.mjs`:120, C-110.1 (`MACHINE_CANNOT_ADOPT_VERSION`): "the plane's own credentials" → "the record's own machine credentials", the sweep's text. Code, number and region unchanged. Named by a new test in `test/m/reevaluation/checks.test.mjs` (title R15 R24 (DEC-149, T35-52)): it pins the whole sentence, checks that no translation of this module's two families says "the plane" or "the instance", and checks that a machine's adoption answers it. Negative control: the new test fails 1/6 against the old wording and passes 6/6 with the new.
- The row awaits stamp (accepted red 2, until T36's promotion job).
- Requirements unchanged (req: none); every live id still met.

Deferred: none.

Found (for BOB; also my REPORT J1):
1. Stale generated artifact (§14): `bio-plane/dist/bio-plane.bundled.mjs` carries the old sentence; regenerated at L7's close.
2. control-plane `rows-before-r43.json`:363 pins C-110.1's digest: `catalogue-end.test.mjs` (already red, accepted red 19) mismatches on it too until T35-72 re-pins.

Reading: the requirements, layer 7's contract, the module's code (3 files) and tests (17 files) whole, the plan's T35 sections the START names, and the sweep's row. The Uses' public parts were not read whole: the entry changes no use of any provider.

Tests and checks:
- `node --test bio-plane/test/m/reevaluation/`: 141 pass, 0 fail (with the new test).
- No layer tests named in `build/manifest.md`; no provided service changed, so no user's tests are owed.
- `checks/format.mjs`: 130 modules, 129 requirements files; 0 failures. `architecture.mjs`: 21 product files, 84 relative imports; 0 failures. `coverage.mjs`: 36 of 36 live requirement ids named by a test; 0 failures. `ownership.mjs … tranche/T35`: 3 files changed; 0 failures.

Size (session_01RAsDWSMPhnFASHguUe4CCA): test runs 4, module lines 3440
