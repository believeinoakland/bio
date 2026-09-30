# ratification (T18)

**Status** · session_014e4Qm4LmSVt6paxgY9qkJD · depth 2 · WORKING · handled B0

## Progress (RATIFICATION #9)

Entries (plan layer 8, ratification; B1):
- [x] N400: `Store.release` and `RELEASE_ACK_MAX` extracted to `src/ratification/release.mjs` (with its own copies of `#appendStateHistory` and `#setScalar`, which `retire` keeps in the store); the store's op-map entry deleted and `release` added to `ratificationOps` (the store already spreads them; nothing new in `dispatch.mjs`). R20–R27 tested in `test/m/ratification/release.test.mjs` (converted from `release.test.mjs`, left in place, K619). Rows C-32.1, C-33.10–.12 and C-102.10 copied into `checks.mjs` (`RELEASE_CHECKS`, `RATIFY_REGISTRATION_CHECKS`), each `awaiting stamp`; the catalogue's copies stay for T19 (rule (3)).
- [x] K674 (4): `refuse-gate`'s release arm converted (R21, R27 test: a query selection swapped at a constant count is SET_MOVED and moves nothing; a fresh one releases).
