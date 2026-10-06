# connections (T34)

**Status** · session_01Fzxs2QUs6TvBBKMHKyWdvW · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Generated artifact made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `bio-plane.bundle.json` bundle connections' source, and `src/connections/mentioned.mjs` and `index.mjs` changed (the new export `MENTIONED_DECLARES`). To be regenerated at the layer close; I did not write it. No flaw found in another module.

## J2 · COMPLETE

T34-20 applied (N560, K1563 (2)); no question was needed.

Entries applied:
- `src/connections/mentioned.mjs` exports `MENTIONED_DECLARES = {undated: true}` (frozen), the owner's declaration to connection-grammar R9's battery: co-mention states no dates (R63), so R6's `at` rule is inapplicable. Not `group_wide`: a co-mention with a document the viewer may not see is fenced (R33), so the sight check runs whole. Re-exported from `index.mjs`.
- `test/m/connections/owner.test.mjs`, R62's battery test: the fixture names no in/out/undetermined; the battery runs with the declaration and the test asserts `ok: true`, `failures: []`, `inapplicable` exactly `["at"]`. A negative control without the declaration shows only `at` failing and no `inapplicable` key (K1733). R6 is tested directly (every item `valid` unstated and marked undetermined; the same set at 1900, 2026, 2999 and no date) and so is R7 (the fenced co-mention reaches the machine viewer, nothing of it reaches bob; a missing viewer is refused `VIEWER_MISSING`).

The named red from T34-5 (plan Rules (5) item 3) is cleared for connections.

Deferred: none. Other modules: J1 (the plane bundle is stale; layer close).

Tests and checks:
- `node --test test/m/connections/`: tests 117, pass 117, fail 0.
- format: 126 modules, 125 requirements files; 0 failures.
- architecture: 22 product files, 80 relative imports; 0 failures.
- coverage: 67 of 67 live requirement ids named by a test; 0 failures.
- ownership: 4 files changed by connections between tranche/T34 and HEAD; 0 failures.
- No layer tests are named in `build/manifest.md`. No service another module uses changed meaning (one export added), so no user's tests were owed.

Size (session_01Fzxs2QUs6TvBBKMHKyWdvW): test runs 2, module lines 2910
