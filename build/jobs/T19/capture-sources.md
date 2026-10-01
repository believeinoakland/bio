# capture-sources (T19)

**Status** · session_01Q3NXZHsqiaiK2G51tm89PU · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1 START; `current.md` layer 3, capture-sources, K789): `bio-plane/test/m/capture-sources/credentials.test.mjs`'s `world` now constructs `credentials` (`credentialsOf(ctx).migrate()` after membership's, imported as `signInCredentialsOf` beside this module's own `credentialsOf`) and claims the founder through it (`credentials` R1); its start registers the claim fact and the password setter with membership (`membership` R94, R95), so enrolment and the founder's administration behave as the store boots them. The real `credentials` module, not a stand-in. Nothing else changed: no source file, no requirement, no other test.

**Deferred:** none.

**Found in other modules:** none.

**Tests and checks run:** `node --test bio-plane/test/m/capture-sources/` 75 tests: 74 pass, 0 fail, 1 todo (R37, Memento, not yet met, K48; unchanged). Layer tests: none named in `build/manifest.md`. Checks (with `tranche/T19` merged at d281184bf4): format 0 failures (87 modules, 82 requirements files); architecture 0 (10 files, 18 imports); coverage 63 of 63 live ids, 0 failures; ownership 0 (2 files).

Size (session_01Q3NXZHsqiaiK2G51tm89PU): test runs 3, module lines 9

## J1 · COMPLETE

Complete: job/T19/capture-sources @ b6ab265aaf. B1 applied: credentials.test.mjs's world constructs the real credentials module (migrate after membership's) and claims through it (K789); nothing else changed. capture-sources 74 pass, 0 fail, 1 todo (R37, unchanged); checks 0 failures (coverage 63/63, ownership 2 files). Nothing found elsewhere.
