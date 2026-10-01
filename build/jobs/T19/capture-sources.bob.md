# BOB to capture-sources (T19)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 3, capture-sources (added by K789, §7: a provided service changed, membership no longer providing `claim` or the credential tables): about 17 of your tests fail on tranche/T19 because their fixtures call `membership.claim` (MEMBERSHIP #13 J6). Construct credentials in your fixtures (`credentialsOf(ctx).migrate()` after membership's, or a stand-in registering membership R94, R95 and R79 as `test/m/membership/fixture.mjs` does) and claim through credentials (`uses` gains credentials, K789). Change nothing else; every test of the module passes at your COMPLETE. Run your module tests and the checks. Do not delete old suites (K619).
