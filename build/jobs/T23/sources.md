# sources (T23)

**Status** · session_01U2EDRt7UjAm5Dgn5EKqRuZ · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** N494 (K1040): `bio-plane/test/m/sources/secret.test.mjs`'s two R11 rate tests now state the edge they reach without pinning any capture constant. A helper, `guessUntilRefused`, sends wrong guesses from one source in one window until an attempt is refused (each admitted guess must answer `SECRET_NOT_RECOGNISED`; a ceiling of 100, far above any bound, fails the test if the rate never refuses) and answers the refusal with how many guesses were admitted first. The R11 rate-bound test asserts the first refusal from one source is `RATE_IP`, then that the right secret from that source is still `RATE_IP` and records nothing (the loop of 12 is gone). The R11 one-clock test asserts, at each offset about the window's edge, the first refusal is `RATE_IP`, the right secret then is `RATE_IP`, and that the source is refused exactly two guesses sooner than a source with nothing counted at the same clock in a fresh store (the two attempts the test counted earlier stand in the window: "the earlier bucket kept", without "12" or "the thirteenth"). Each assertion keeps its meaning. Also in my paths: `source.test.mjs`'s comment on R1's 50 knocks no longer states capture's instance limit ("10 in any 10 minutes"), only that one knock per window is admitted whatever the bounds.

**Re-scan** (N469, N471, N480, N497's kind): no note in `bio-plane/src/sources/` or `bio-plane/test/m/sources/` names a T20-deleted file, `tools/`, `legacy-tests` or `legacy-store` as live. Nothing changed.

**Negative control.** With the fixture's `knockAttempt` wrapper temporarily answering null in place of `RATE_IP` (restored after; not committed), both re-worded tests fail ("100 attempts from one source in one window, and the knock's rate never refused one"); the other two `secret.test.mjs` tests pass.

**Deferred.** None. **Found in another module.** None. **Merge of `tranche/T23`:** no BOB entry says capture has merged (inbox empty through B1; no capture merge on `origin/tranche/T23` at completion), so none made; on a `CHANGE` saying so I merge and run my suite again.

**Tests and checks.**
- `node --test bio-plane/test/m/sources/`: tests 24, pass 24, fail 0.
- `node --test "test/m/**/*.test.mjs"` (in `bio-plane/`): tests 5021, pass 5008, fail 1, todo 12, skipped 0. The one red is accepted red 9, control-plane `inbox-door.test.mjs`:81 (until capture's merge). test-support R2 passed here.
- `checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `checks/architecture.mjs … sources`: 11 product files, 27 relative imports; 0 failures.
- `checks/coverage.mjs … sources`: 15 of 15 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … sources tranche/T23`: 3 files changed; 0 failures.

Size (session_01U2EDRt7UjAm5Dgn5EKqRuZ): test runs 3, module lines 837
