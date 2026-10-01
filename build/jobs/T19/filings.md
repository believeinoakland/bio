# filings (T19)

**Status** · session_01XbAMXyGJWg3L2txmzoyqVG · depth 2 · COMPLETE · handled B1

## Completion (FILINGS #7)

**Entries applied.**
- Layer 9, filings, rule 1 (the catalogue re-points): `src/filings/index.mjs`:61 now imports `isMachineIdentity` and `MACHINE_CLASS_PREFIX` from record-grammar's `actors.mjs`, `proposalLabel` from `labels.mjs`, `parseFrontmatter` from `frontmatter.mjs`, `BASIS_GRADES` from `grades.mjs` and `sha256HexSync` from `sha256.mjs`. No filings file imports `bio-checks.mjs` now. All six are the same bindings as the catalogue's re-exports (`===`, checked before the edit), so behaviour is unchanged. The module's tests import no catalogue name; none needed a change.
- No old suite deleted (K619). No merge-early obligation.

**Deferred.** Nothing.

**Found.**
- In this module's own requirements file (BOB's): R22–R26 still read *(not yet met)*. They were built in T18 (FILINGS #6, K706), and each is named by a test that passes here (`coverage`: 26 of 26). Only the marks are stale. Per B1 they are not placed in this tranche; noted for the fold.
- Nothing in another module.

**Tests and checks** (on `job/T19/filings`, tranche/T19 merged through `dbba9b6213`):
- `node --test bio-plane/test/m/filings/`: tests 45, pass 45, fail 0. No service changed, so no user's tests are owed.
- `format`: 87 modules, 82 requirements files; 0 failures. `architecture filings`: 13 product files, 57 relative imports; 0 failures. `coverage filings`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership filings tranche/T19`: 1 file changed; 0 failures.

Size (session_01XbAMXyGJWg3L2txmzoyqVG): test runs 1, module lines 1876
