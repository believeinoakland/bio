# BOB to bias (T20)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T20) layer 5, bias (K881; MEMBERSHIP #14 J2 (1)): membership's T20 job dropped the retired ids from `MODULE_ORDER` (its R83), so `test/m/bias/promotion.test.mjs`' R23 test (:134–:150) fails: it registers a listener as `legacy-store` and expects it between `scheduler` and `queue`. Replace `legacy-store` with a real module between them in `MODULE_ORDER` (`tasks` or `queue-producers`), so the test proves R23's order with the same meaning. Re-scan `test/m/bias/` for any other retired id (`legacy-checks`, `legacy-store`, `legacy-index`). Tests only; no product code changes; no requirement of yours is marked for T20. Proof: `test/m/bias/` green whole. No generated artifact moves. Do not delete old suites (K619).
