# pdf-reader (T21)

**Status** · session_01FhgUeJoRWG4CGHy3n9dbCQ · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** · N469 (B1, K931). `bio-plane/src/pdfstructure.mjs`:
- :709, `PRODUCER_DETERMINATIONS`: the note named the deleted `producer-provenance.test.mjs` as the guard. R28's test in `bio-plane/test/m/pdf-reader/pdfdoc.test.mjs` already asserts the array is exactly `["ocr", "undetermined"]` and frozen, so the note now points to that test.
- :2356, `pdfImageRef`: the note said the `ref`/`describeExtent` parity was "pinned in" the deleted `cpdf18-pdf-images.test.mjs`. Two modules state the parity, each on its own side: R16 here (`ref: "an image on page "+(page+1)`, tested by R16's tests) and text-chain's R98 (`an image on page <n+1>`). No requirement states the parity as one rule. pdf-reader does not use text-chain, so no test of mine can check it. The note now states the parity without naming a guard, and the gap is reported to BOB (P9, J1).
- Re-scan of my paths: the only other note that names a test file is :9 (`pdfstructure.test.mjs` "still asserts the parity" with `linkWrapper`). That suite is kept (`bio-plane/test/pdfstructure.test.mjs`, LEGACY-TESTS #18's kept list) and still asserts it (its R3/R4/R5 wrapper checks), so the note is live and stays. Unnamed notes such as "a suite arm pins the asymmetry" (:1531) and "the suite's FORM ARM" (:1962) refer to that same kept suite, which still holds both arms (its D-517 asymmetry block and the form arm).

**Deferred** · none.

**Other modules** (in J1) · The generated bundles that take `pdfstructure.mjs` are stale because a comment in the source changed (no behaviour change): `ocr-worker/dist/ocr-worker.bundled.mjs` (through plane `pdfstructure`) and `pdf-worker/dist/pdf-worker.bundled.mjs` (through `pdf-reader` files). I regenerated neither. Requirement gap (P9): no requirement or test owns the IC-1 parity between pdf-reader's R16 `ref` and text-chain's R98 `describeExtent` image arm.

**Tests and checks**
- `node --test test/m/pdf-reader/` (in `bio-plane/`): tests 58, pass 58, fail 0. `build/manifest.md` names no layer tests.
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `node checks/architecture.mjs … pdf-reader`: 8 product files, 15 relative imports; 0 failures.
- `node checks/coverage.mjs … pdf-reader`: 35 of 35 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … pdf-reader tranche/T21`: 1 file changed; 0 failures.

Size (session_01FhgUeJoRWG4CGHy3n9dbCQ): test runs 1, module lines 2941

## J1 · REPORT

Generated artifacts made stale by a comment-only change to bio-plane/src/pdfstructure.mjs (N469): ocr-worker/dist/ocr-worker.bundled.mjs and pdf-worker/dist/pdf-worker.bundled.mjs. I regenerated neither. Requirement gap (P9): the IC-1 parity between pdf-reader R16's ref ('an image on page '+(page+1)) and text-chain R98's describeExtent image arm is stated separately in each module. No requirement holds it as one rule and no test checks it now that cpdf18-pdf-images.test.mjs is deleted. pdf-reader does not use text-chain, so its tests cannot check it; the note at pdfstructure.mjs:2354 now states the parity without naming a guard.
