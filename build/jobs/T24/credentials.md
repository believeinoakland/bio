# credentials (T24)

**Status** · session_012kvJP8Do5Px8VoiLziW6ao · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R21 for a key registered before `status_at` existed: the requirement says neither "its registration's instant" nor "null". My reading, which I am building on: the column is additive and nullable and never back-filled (D-85, as `status_by`, `origin` and `registered_by` are), and `signerList` answers `status_at: null` for such a key, meaning "not recorded". Not `added`, because a pre-existing key may have been revoked or re-activated after it was registered, and `added` would then state a false instant for its status; null is the only value true of every such row. network-notices R21 then falls back to its own date for a null. If you want `added` instead (or `added` only for a pre-existing key still `active` with no recorded change), say so and I will switch; it is a one-line change in the read. Also: I keep `status_by`'s present behaviour (R7 setting the status a key has still writes `status_by`); only `status_at` follows real changes, per R21.

## J2 · REPORT

Two things outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my edits to `bio-plane/src/credentials/index.mjs` and `schema.mjs` are inputs of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. I regenerated nothing.
2. **Three reds in the whole `bio-plane/test/m`, not credentials', not among the accepted reds 1–7 by name, red on `tranche/T24` without my change** (I ran them with my work stashed: same 3 fail): `membership/module-order.test.mjs`:12 (R83 `MODULE_ORDER` is `build/modules.json`'s ids), `membership/t9-notice-sight-bounds.test.mjs`:185 (R79 listener order) and `promotion/registry.test.mjs`:58 (R39, R45, R46 order). `modules.json` has 88 modules with `link-sweep` (N506, T24's opening) and membership's frozen `MODULE_ORDER` (its R83) does not name it yet: membership's (and so its R83 test's) work, or an accepted red until link-sweep's L10 merge, BOB's call.

## J3 · COMPLETE

**Entries applied** (START B1, ANSWER B2; commit `ff8cb2d18f`)
- (1) **N505, R21 and R8.** `signers` gains `status_at TEXT` (`schema.mjs`, in the table and as an additive column, nullable, never back-filled, D-85). Set to the registration's instant (equal to `added`) by R6 and R9 on a new key; moved by an act that changes the status: R6's re-activation of a revoked key, R7 (either way), R10, and R16's cascade, which records the revocation notice's own `at` (membership R79) and leaves a key already revoked as it was. Unchanged by R6 on an active key (also a rebind while active), R7 setting the status the key has, R9's `existed: true`, R10 twice, and every refusal. `signerList` answers `status_at` per key, null for a key registered before the column (B2, K1184's sentence). `status_by` keeps its present behaviour (J1, B2).
- (2) **N508.** `index.mjs`:669 (now :689) re-worded: the ops are entries of the plane's one route map (plane R5, `routes` spreads them after membership's; control-plane's `dispatch` answers over it), not the legacy store's op map. Re-scan of the whole module (every source and test file, read whole) for the N502/N508 kind: no other hit; the two test headers naming `build/jobs/T17/legacy-tests.md` are history, not stale. No `awaiting stamp` note in the module.
- Header's requirement range updated (R1–R21).
- **Rows:** none added or changed (`checks.mjs` untouched), so nothing `awaiting stamp` for promotion from this job.

**Deferred:** none.

**Found in other modules / artifacts** (REPORT J3): the plane bundle is stale from `credentials/index.mjs` and `schema.mjs` (regenerated nothing); three reds red on `tranche/T24` without my change (membership's `MODULE_ORDER` lacks `link-sweep`: membership R83, R79's order test, promotion R39/R45/R46's order test).

**Tests and checks**
- New `bio-plane/test/m/credentials/status-at.test.mjs` (7 tests, R21 and R8 named): first registration by R6 and R9; R6's known-key arms; R7 each way and same-status; R9's `existed` and refusals; R10 and twice; R16 at the notice's instant, an already-revoked key and another member's untouched; a pre-existing key over an older `signers` table, migrated: null, never back-filled, unchanged by non-changes, set by a real change. `keys.test.mjs`' R8 key-set assertion gains `status_at` (the requirement's new field).
- `node --test bio-plane/test/m/credentials/`: pass 40, fail 0.
- Users of `signerList` (grep of `bio-plane/test/m/`): `instance-setup/`: pass 88, fail 0.
- Whole `bio-plane/test/m`: tests 5225, pass 5211, fail 3, skipped 0 (the remaining 11 todo). The 3 are J3's item 2, red without my change; accepted reds 1–7 did not show.
- `format.mjs`: 88 modules, 87 requirements files; 2 failures, both accepted red 4 (link-sweep's `paths` and `tests` absent). `architecture.mjs … credentials`: 11 product files, 27 relative imports; 0 failures. `coverage.mjs … credentials`: 21 of 21 live ids named by a test; 0 failures. `ownership.mjs … credentials tranche/T24`: 5 files changed; 0 failures.

Size (session_012kvJP8Do5Px8VoiLziW6ao): test runs 9, module lines 944
