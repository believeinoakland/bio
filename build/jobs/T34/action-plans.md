# action-plans (T34)

**Status** · session_01Ay4UvVLW9vqrFSsfpoPWaY · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied.**
- **T34-61 (N601, user side; K1650, K1750, K1753).**
  - R38: `NO_SUCH_DUTY` is now answered through `duties.noSuchDuty` (its R25). `scenarioSet` asks `duties.readDuty` with the author's sight. An absent or unseen obligation gets `noSuchDuty(duty, {index})`, with duties' row (C-133.23) and fields.
  - The code is never minted here, and C-124 has no such row. Absent and unseen get one answer, with or without a named occurrence. `occurrencesOf` now runs only when an occurrence is named, to check that it belongs to the obligation.
  - R14: C-124.32 `PHASE_MALFORMED`'s translation now matches B1's wording exactly. It names an obligation's occurrence state among the ways a phase starts. The row stays awaiting stamp until T35 (Rule 5 (4)).
- **T34-87 (DEC-149).** C-124.57 `PLAN_PROVIDER_UNAVAILABLE`'s translation now says "is not in your group's Civicsmith yet" instead of "is not on this instance yet". The detail in `refuseProviderUnavailable` is operator-facing and stays, as B1 rules. No other row in this module says "this instance", "this copy" or "this plane", and a test checks every row.

**Deferred.** Nothing.

**Found in other modules.**
- The two re-worded rows move other modules' pins. Both tests were already red before this job, as named reds:
  - promotion's `test/system/row-census.test.mjs` (Rule 5 (4)) now also lists C-124.32 and C-124.57 as "changed with no record".
  - control-plane's `catalogue-end.test.mjs` with `rows-before-r43.json` (K1708, K1789). T34-60 moves its pinned digest (K1750). C-124.57 now joins C-124.32 in that move.
- `CATALOG_VERSION` (promotion's `gate.mjs`) is already 1.61.0 for T34. It is not my path, so I left it; per K1750 it moves once, with promotion's stamp.
- The plane bundle (`bio-plane/dist`) is stale until BOB regenerates it at the layer close (manifest). No other generated artifact reads action-plans.

**Tests and checks.**
- `duty-starts.test.mjs`:
  - New test "R14 R38: PHASE_MALFORMED's row, C-124.32 … exactly the words". It checks the row's text exactly, and the refusal at the interface for a malformed start of each form, R38's included, with landing controls.
  - The R14/R38 test now asserts that each `NO_SUCH_DUTY` deep-equals `noSuchDuty(…, {index})` with duties' row: absent, unseen, and with an occurrence named. A landing control is added.
- `invariants.test.mjs`: new test "R6 R30 (DEC-149)". It checks C-124.57's text at the interface and scans every row for "this", "the" or "your" followed by "instance", "copy" or "plane", with a control.
- `node --test bio-plane/test/m/action-plans/`: tests 63, pass 63, fail 0 (61/61 before the change).
- Layer tests: none (manifest). No service I provide changed shape.
- `format: 127 modules, 126 requirements files; 0 failures`
- `architecture: 17 product files, 57 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 38 of 38 live requirement ids named by a test; 0 failures`
- `ownership: 5 files changed by action-plans between tranche/T34 and HEAD; 0 failures`

Size (session_01Ay4UvVLW9vqrFSsfpoPWaY): test runs 6, module lines 2794
