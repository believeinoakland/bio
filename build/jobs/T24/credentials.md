# credentials (T24)

**Status** · session_012kvJP8Do5Px8VoiLziW6ao · depth 2 · WORKING · handled B2

## J1 · QUESTION

R21 for a key registered before `status_at` existed: the requirement says neither "its registration's instant" nor "null". My reading, which I am building on: the column is additive and nullable and never back-filled (D-85, as `status_by`, `origin` and `registered_by` are), and `signerList` answers `status_at: null` for such a key, meaning "not recorded". Not `added`, because a pre-existing key may have been revoked or re-activated after it was registered, and `added` would then state a false instant for its status; null is the only value true of every such row. network-notices R21 then falls back to its own date for a null. If you want `added` instead (or `added` only for a pre-existing key still `active` with no recorded change), say so and I will switch; it is a one-line change in the read. Also: I keep `status_by`'s present behaviour (R7 setting the status a key has still writes `status_by`); only `status_at` follows real changes, per R21.
