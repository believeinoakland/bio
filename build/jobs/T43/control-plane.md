# control-plane (T43)

**Status** · session_01DfugQdQ5JweBPDomQkf9rS · depth 2 · WORKING · handled B1

## Work

- **T43-23** applied (tests only): `envelope.test.mjs`'s R22 (N347) test reads `NO_SUCH_KNOCK` from doorbell's `DOORBELL_CHECKS` (`src/doorbell/checks.mjs`) and `EVIDENCE_NOT_HELD` from capture's `CAPTURE_CHECKS`. The expected values are unchanged: C-118.1, C-118.2, the same translations, the forwarded decoration, the unchanged carried answer, `NOT_FOUND` undecorated. It also asserts that `CHECK_FAMILY_FILES` reads doorbell's file (answer-envelope R12).
- **Before T43-14:** that test is the one red: control-plane 223 tests, 222 pass, 1 fail (`envelope.test.mjs`:391, "doorbell's checks.mjs is read"). Waiting for T43-14, then I merge `tranche/T43` and run the tests again.
- **The user's tests** (plane: `test/m/plane/`, `test/system/migrate-released.test.mjs`): 185 tests, 185 pass, 0 fail.
- **Checks:** format 0 failures; architecture 0; coverage 47 of 47 ids, 0; ownership 1 file, 0.
- **Reading set:** I read my requirements (`build/requirements/control-plane.md`) and `envelope.test.mjs` whole. The entry changes one test, so I did not read the module's other code (4,084 lines) or its other 45 test files. That falls short of B1's "code and tests whole", and I name it in J1. A helper in this session read the used modules' public parts in full (doorbell, capture, answer-envelope, store-door; plane, the module that uses this one) and wrote a digest, each statement citing its section.
- **Found elsewhere (in J1):** (1) `store-door` R7 still says C-118.7 is "defined in `capture`'s table until T43", but the row is now doorbell's alone (`doorbell` R21), so the wording is stale. (2) `plane` R6's N866 clause allows `token:` (D-311) for an `ai` author, but control-plane R17 allows the `token:` form only for a binding class. An `ai` credential's author is `class:ai/<tokenId>`. T43-15's alignment should take R17's form, or R17 has to change first.
