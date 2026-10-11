# control-plane (T43)

**Status** · session_01DfugQdQ5JweBPDomQkf9rS · depth 2 · WORKING · handled B3

## Work

- **T43-23** applied (tests only): `envelope.test.mjs`'s R22 (N347) test reads `NO_SUCH_KNOCK` from doorbell's `DOORBELL_CHECKS` (`src/doorbell/checks.mjs`) and `EVIDENCE_NOT_HELD` from capture's `CAPTURE_CHECKS`. The expected values are unchanged: C-118.1, C-118.2, the same translations, the forwarded decoration, the unchanged carried answer, `NOT_FOUND` undecorated. It also asserts that `CHECK_FAMILY_FILES` reads doorbell's file (answer-envelope R12).
- **Before T43-14:** that test is the one red: control-plane 223 tests, 222 pass, 1 fail (`envelope.test.mjs`:391, "doorbell's checks.mjs is read"). Waiting for T43-14, then I merge `tranche/T43` and run the tests again.
- **The user's tests** (plane: `test/m/plane/`, `test/system/migrate-released.test.mjs`): 185 tests, 185 pass, 0 fail.
- **Checks:** format 0 failures; architecture 0; coverage 47 of 47 ids, 0; ownership 1 file, 0.
- **Reading set:** I read my requirements (`build/requirements/control-plane.md`), all of my code (`index.mjs`, `archive.mjs`, `draft.mjs`, `owner-ops.mjs`, `signin.mjs`; 4,084 lines) and all 46 of my test files whole. The rest was read after B2 asked for it (mechanics §6 step 2, P20). A helper in this session read the used modules' public parts in full (doorbell, capture, answer-envelope, store-door; plane, the module that uses this one) and wrote a digest, each statement citing its section.
- **Found elsewhere (in J1):** (1) `store-door` R7 still says C-118.7 is "defined in `capture`'s table until T43", but the row is now doorbell's alone (`doorbell` R21), so the wording is stale. (2) `plane` R6's N866 clause allows `token:` (D-311) for an `ai` author, but control-plane R17 allows the `token:` form only for a binding class. An `ai` credential's author is `class:ai/<tokenId>`. T43-15's alignment should take R17's form, or R17 has to change first.

## J1 · REPORT

T43-23 applied (b7e25994d8). It is tests only. envelope.test.mjs:391 reads NO_SUCH_KNOCK from DOORBELL_CHECKS and asserts that CHECK_FAMILY_FILES reads doorbell's file. The expected values are unchanged. Control-plane: 222 of 223 tests pass. The one red is that test, until T43-14 merges; after that I merge tranche/T43, run the tests again and post COMPLETE. Plane's tests (my user): 185 of 185 pass. Checks: format, architecture, coverage (47 of 47) and ownership are 0. Reading set: I read my requirements and envelope.test.mjs whole, but not the other 4,084 lines of code or the other 45 test files, because the entry touches one test. Say if you want those read before I complete. A helper digest covered the used modules' public parts. Found elsewhere: (1) store-door R7 still calls C-118.7 capture's 'until T43'; it is now doorbell's alone (doorbell R21), so the wording is stale. (2) plane R6's N866 clause allows the token: (D-311) form for an ai author. Control-plane R17 allows token: only for a binding class; ai's author is class:ai/<tokenId>. T43-15 should take R17's form.
- **Fixed in my own module while reading:** two comments in `index.mjs` (the inbox 404 and the stated-status forward) still gave C-118.2 and C-118.7 to `capture`. They now name `doorbell` R21, R3 and R13. This changes comments only, no behaviour.

## Completion

- **Entries applied:** T43-23 (tests only), and the comment fix noted above. Nothing deferred.
- **After B3** (T43-14 merged, K2727): I merged `tranche/T43` into this branch and ran the tests again. Control-plane: 223 tests, 223 pass, 0 fail. `envelope.test.mjs`:391 passes with its assertions unchanged, which clears rule 4 (12)'s control-plane red.
- **The user's tests** (plane: `test/m/plane/`, `test/system/migrate-released.test.mjs`): 185 tests, 185 pass, 0 fail. No reds.
- **Checks:** format: 147 modules, 0 failures. Architecture: 51 product files, 0 failures. Coverage: 47 of 47 live ids, 0 failures. Ownership: 3 files, 0 failures.
- **Found in other modules:** (1) store-door R7's stale C-118.7 wording and (2) plane R6's `token:` clause, both reported in J1 and logged by BOB as K2726.
- **Size (session_01DfugQdQ5JweBPDomQkf9rS):** test runs 7, module lines 4084.

