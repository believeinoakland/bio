# T1 · ooxml — job record

**Status** · COMPLETE, 2026-09-26. Job session for module `ooxml`, tranche T1, branch `job/T1/ooxml`. No open question.

**For BOB — a conflict between two steps of `roles/JOB.md`, not blocking:** step 7's `metrics/record.mjs` writes `build/metrics/T1.csv`, and step 6's ownership check then fails on that file: `FAIL  build/metrics/T1.csv: outside ooxml's paths, tests and job record` (`ownership: 5 files changed by ooxml between tranche/T1 and HEAD; 1 failure`). The row is committed as step 7 says. Ownership passes on everything else (`3 files …; 0 failures` before the metrics commit). Either the check allows a job to append its own metrics row, or the row is carried by BOB.

## Entries applied

- **T1-1** · Requirement-named tests for every live id. `bio-plane/test/m/ooxml/ooxml.test.mjs` (35 tests) names R1–R26, each in a test title, and checks each at the module's interface on archives built byte by byte by `bio-plane/test/m/ooxml/zip.mjs` (compression and CRC from `node:zlib`, independent of the module; every central-directory, local-header and EOCD field can be overridden). No other entry.

## Flaws fixed in the module while testing (step 4)

- **readPart inflated a compression bomb to completion** before the length check refused it: a member declaring 10 bytes that inflates to gigabytes was fully inflated in memory first. Inflation now stops once output exceeds the declared size and returns `size_mismatch` (`got` is then the bytes produced when it stopped, always > `expected`). The size guard's rationale ("a lying declared size surfaces as `size_mismatch`") now holds without the cost. Tested under R5.
- **sizeGuard waved a non-number through** (`!(x > bound)` is true for `NaN`/`undefined`), against R8's "ok iff `declaredBytes <= bound`". Now `ok` only when the comparison holds; anything else is the stated refusal.
- **"Never throws" did not hold on odd arguments** (`null` bytes to `hasZipMagic`/`crc32`, a missing container to `readPart`/`walkRels`/`declaredTextBytes`, a non-array `flavours` or a Symbol `contentType` to `discriminate`). Every service now accepts a Uint8Array, ArrayBuffer, any typed view or byte array, reads anything else as no bytes, and an unusable container as holding no member. Tested under each id and fuzzed under R25.

## Deferred

None.

## Found in other modules

- **legacy-tests:** `bio-plane/test/ooxml.test.mjs` (167 assertions) still tests this module from the old battery. It passes against the changed module; it now duplicates this module's own suite and can be retired with the battery.
- **Requirements (for BOB, no change needed to pass):** R15 does not say whether `relsPartFor` normalizes a leading `/` (the code does: `/word/document.xml` → `word/_rels/document.xml.rels`). Not tested either way.

## Tests and checks run

- `node --test bio-plane/test/m/ooxml/` — `tests 35, pass 35, fail 0` (2 runs; the first found 3 failures: one arithmetic slip in the test, two never-throw gaps in the module, both fixed).
- Tests of callers of this module (the service behaviour changed only for refusals), each run once: `formats-odf: 142 pass, 0 fail`; `formats-xlsx: 88 pass, 0 fail`; `fw19-extent-arms 36 pass, 0 fail`; `multifinding: 84 pass, 0 fail`; `ooxml: 167 passed, 0 failed`; `publishedcase: 129 pass, 0 fail`.
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs` — `format: 61 modules, 14 requirements files; 0 failures`
- `node checks/architecture.mjs … ooxml` — `architecture: 3 product files, 2 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … ooxml` — `coverage: 1 modules, 26 of 26 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … ooxml tranche/T1` — `ownership: 3 files changed by ooxml between tranche/T1 and HEAD; 0 failures`
