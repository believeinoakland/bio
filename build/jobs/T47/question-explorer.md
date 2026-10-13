# question-explorer (T47)

**Status** · session_01U1i7DL5k9H2qhkGKyhkRkY · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied.** T47-85 (K3084): `choosing.test.mjs`'s R3 sign-in test re-pointed to a held sign-in. The member's sign-in is now held by `credentials.subscriptionTokenHold` (credentials R70) instead of the fact alone (`subscriptionConnected`), which R70 answers as not connected. Nothing else about the test changed: off by default is refused, the owner's own act turns it on, and her own account is refused before `ai-use` is asked. Test only; no source change.

**Deferred.** None.

**Read whole.** My requirements; credentials R35, R55, R70 and R71; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every test and the fixture; my plan entry. No flaw in my module needed a change.

**Found in other modules.** None.

**Tests and checks.**
- `node --test bio-plane/test/m/question-explorer/`: tests 32, pass 32, fail 0. Before the change it was 31 pass, 1 fail: the R3 sign-in test.
- Layer tests: none named in `build/manifest.md`. No provided service changed, so no user module's tests needed a run.
- `format`: 166 modules, 164 requirements files; 0 failures.
- `architecture question-explorer`: 9 product files, 45 relative imports; 0 failures.
- `coverage question-explorer`: 16 of 16 live requirement ids named by a test; 0 failures.
- `ownership question-explorer tranche/T47`: 2 files changed; 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0 (3071 files), channels 0. Coverage has 44 failures, all in other modules (screens-*, public-read, queue, ratification, setup-words, wizard-scripts and others). None is in question-explorer.

Size (session_01U1i7DL5k9H2qhkGKyhkRkY): test runs 2, module lines 1 changed (test file +2/−1 net; module about 1,450 lines)

## J1 · COMPLETE

T47-85 applied: choosing.test.mjs R3 now holds alice's sign-in token (credentials R70 subscriptionTokenHold) instead of the bare fact; what it proves is unchanged. Test only. question-explorer 32/32 pass. format, architecture, coverage and ownership: 0 failures for this module. run.mjs: format, architecture and channels at 0; its 44 coverage failures are all in other modules. Nothing deferred, nothing found elsewhere. Record on job/T47/question-explorer.
