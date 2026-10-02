# local-facts (T24)

**Status** · session_01ATMXx59tM5rnPagFzWPRyT · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (B1; `build/plan/current.md` T24 L9, local-facts). Wording only; no change of meaning, no requirement change.
1. **N502.** `bio-plane/src/local-facts/checks.mjs`:3 said every C-126 row was "awaiting T22's stamp". `gate.mjs`'s stamp history shows 1.52.0 (PROMOTION #23, T22 layer 2; K989) took C-126.1–C-126.5, so the note now says "every row stamped by 1.52.0 (T22's L2, K989)".
2. **Re-scan.** I read the whole module (`index.mjs`, `paths.mjs`, `schema.mjs`, `checks.mjs`) and its tests (`confirm`, `due`, `fixture`, `paths`, `rows`, `status`) for the N502/N508 kind (`awaiting stamp`, a past stamp, the retired legacy store, dispatcher, legacy-index or op map named as live). Nothing else was found.

No catalogue row was added or changed, so there are no red 5 rows.

**Deferred.** None.

**Found in other modules** (also in COMPLETE):
- `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`, BOB regenerates) is stale from `src/local-facts/checks.mjs`. `fleetbundles.test.mjs`'s bio-plane arm reports `STALE BUNDLE` for that one source. Nothing was regenerated.

**Tests and checks run** (on `job/T24/local-facts`, based on `tranche/T24` @ f8bdbb9e17):
- `node --test bio-plane/test/m/local-facts/`: tests 22, pass 22, fail 0.
- `node --test bio-plane/test/m/`: tests 5244, pass 5231, fail 2, todo 11, skipped 0. Both fails are accepted reds: red 8 (`scheduler/consumers.test.mjs`:161) and red 9 (`plane/notices.test.mjs`:39). No red beyond those named.
- `node checks/format.mjs`: 88 modules, 87 requirements files; 2 failures. Both are red 4: `link-sweep`'s `paths` and `tests` directories are absent.
- `node checks/architecture.mjs … local-facts`: 10 product files, 25 relative imports; 0 failures.
- `node checks/coverage.mjs … local-facts`: 8 of 8 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … local-facts tranche/T24`: 1 file changed; 0 failures.

Size (session_01ATMXx59tM5rnPagFzWPRyT): test runs 3, module lines 2
