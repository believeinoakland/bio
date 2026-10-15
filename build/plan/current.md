# Plan R085

**Status** · OPEN · BOB #185 · session_01KwhJeKYFP6fqgxPgvz2Wtp · depth 1

**Jobs** · 

**Adopted** · K3441 (Bob's "A" to K3440): a one-job release fix on the 0.85.0 cut, outside the tranche order (K1548: an out-of-layer job, Bob's approval this once, no precedent). Branch `tranche/R085` from `dist/cut-0.85.0` @ 1053faa726; its job merges into `tranche/R085`, which is then merged into `dist/cut-0.85.0` (the cut reaches `main` through T50, K2273). Legacy census: none touched (no legacy module has an entry; each stays as `next.md` and T50's draft say).

## L11

- **R085-1 · installer** · (N1149, K3440) R33 as amended: the read-back hashes the script's part as downloaded bytes and the install and update keep within a Worker's 128 MB at the release's real size · req: R33 amended · claude-sonnet-5-5.
