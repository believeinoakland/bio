# credentials (T24)

**Status** · session_012kvJP8Do5Px8VoiLziW6ao · depth 2 · WORKING · handled B2

## J1 · QUESTION

R21 for a key registered before `status_at` existed: the requirement says neither "its registration's instant" nor "null". My reading, which I am building on: the column is additive and nullable and never back-filled (D-85, as `status_by`, `origin` and `registered_by` are), and `signerList` answers `status_at: null` for such a key, meaning "not recorded". Not `added`, because a pre-existing key may have been revoked or re-activated after it was registered, and `added` would then state a false instant for its status; null is the only value true of every such row. network-notices R21 then falls back to its own date for a null. If you want `added` instead (or `added` only for a pre-existing key still `active` with no recorded change), say so and I will switch; it is a one-line change in the read. Also: I keep `status_by`'s present behaviour (R7 setting the status a key has still writes `status_by`); only `status_at` follows real changes, per R21.

## J2 · REPORT

Two things outside my files, for BOB:
1. **Generated artifact staled** (manifest §14): my edits to `bio-plane/src/credentials/index.mjs` and `schema.mjs` are inputs of the plane's bundle, so `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` are stale until BOB regenerates them at the layer close. I regenerated nothing.
2. **Three reds in the whole `bio-plane/test/m`, not credentials', not among the accepted reds 1–7 by name, red on `tranche/T24` without my change** (I ran them with my work stashed: same 3 fail): `membership/module-order.test.mjs`:12 (R83 `MODULE_ORDER` is `build/modules.json`'s ids), `membership/t9-notice-sight-bounds.test.mjs`:185 (R79 listener order) and `promotion/registry.test.mjs`:58 (R39, R45, R46 order). `modules.json` has 88 modules with `link-sweep` (N506, T24's opening) and membership's frozen `MODULE_ORDER` (its R83) does not name it yet: membership's (and so its R83 test's) work, or an accepted red until link-sweep's L10 merge, BOB's call.
