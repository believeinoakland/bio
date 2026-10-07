# review (T35)

**Status** · session_01LBB1xKp6Vz5r4FXccCoPod · depth 2 · WORKING · handled B1

## J1 · REPORT

Generated artifact my change made stale (mechanics §14; not mine to write): `bio-plane/dist/bio-plane.bundled.mjs` (and through it the installer bundle and `release/bio-plane.bundled.mjs`) embeds `src/review/index.mjs`, which now imports `case-tensions` and reads `attributionInForce` there; regenerate at L8's close. No other module's file changed. Found in another module: none.

## J2 · COMPLETE

Entries applied: T35-60 (N597, its share). `bio-plane/src/review/index.mjs`: R16's attribution in force is `caseTensions.attributionInForce` (case-tensions R6), reached through `caseTensionsOf(host, {storage, record, membership, basisVersions?})` (a lazy getter, a test may pass its own `caseTensions`), never through `publication`, which now serves only `registerReviewProvider` here (R23). Header Uses re-worded to match the requirements. Merge before publication (T35-54), which may then drop its delegate.
Tests: `fixture.mjs` gives a controlled `caseTensions` provider; publication's old delegate stays in the fake, recording each call, so a read through it is seen. `copy.test.mjs` R16 asserts no call goes through publication, and a new test "R16 (T35-60)" checks both doors read case-tensions directly, follow its answer when it changes, and include a negative control.
Deferred: none. Other modules: J1 (the stale plane bundle).
Tests run: `node --test test/m/review/` 38 pass, 0 fail. Users of the review copy, unchanged against the base: control-plane statementack 3/0, envelope 16/0; case-authoring converts 9/0; publication door 5/0; plane wizards 4/0. No layer tests (manifest).
Checks: format 0 failures (130 modules); architecture review 0 failures; coverage review 28 of 28 live ids, 0 failures; ownership review vs tranche/T35 4 files, 0 failures.
Size (session_01LBB1xKp6Vz5r4FXccCoPod): test runs 3, module lines 1025
