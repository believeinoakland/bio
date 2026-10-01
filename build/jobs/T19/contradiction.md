# contradiction (T19)

**Status** · session_01QMBecKS8tAqi8UR6HBja3o · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Rule 1 done and pushed (`job/T19/contradiction` @ HEAD): `src/contradiction/index.mjs` imports `sha256HexSync`, `canonicalJson`, `isMachineIdentity`, `parseFrontmatter` from record-grammar's `sha256.mjs`, `json.mjs`, `actors.mjs`, `frontmatter.mjs`; `fixture.mjs` and `propose.test.mjs` likewise; `index.mjs`:4's comment re-worded. No contradiction file imports `bio-checks.mjs`. Module tests: 108 tests, 101 pass, 0 fail, 7 todo.

N136's rest is drafted and held, not committed: K2's join, K2's `subject` rung and R28's subject fact read `inquiry_bundle_facts.inquiry_subject_entity` (inquiry R40), and the fixture seeds the subject there instead of adding the column to `bundles`. Tried locally with the column added to inquiry's table: the remaining failures are inquiry's own projection (`index.mjs`:530 still writes `bundles.inquiry_subject_entity`, "no such column"), so it lands only after inquiry's move. I need inquiry merged early into `tranche/T19`; send a `CHANGE` when it is, and I merge, apply, test and complete.

## J2 · COMPLETE

**Entries applied.**
- Rule 1 (B1): `src/contradiction/index.mjs` imports `sha256HexSync`, `canonicalJson`, `isMachineIdentity`, `parseFrontmatter` from record-grammar's `sha256.mjs`, `json.mjs`, `actors.mjs`, `frontmatter.mjs`; `test/m/contradiction/fixture.mjs` (`parseFrontmatter`) and `propose.test.mjs` (`canonicalJson`) likewise; `index.mjs`:4's comment re-worded. No contradiction file imports `bio-checks.mjs` (commit 1e07f436cb).
- N136's rest (B3, after the tranche merge with INQUIRY #8 stage one): K2's join, K2's `subject` rung (R11) and R28's subject fact read `inquiry_bundle_facts.inquiry_subject_entity` (inquiry R40), a bundle with no row reading as no subject; the header comment names the new home. The fixture seeds the subject in inquiry's table and no longer adds inquiry's columns to `bundles`. Nothing in contradiction reads `bundles.inquiry_subject_entity`.

**Deferred.** None. The open marks (R34, R41, the K5 arms: N345, K488) are not this tranche's.

**Found in other modules (for BOB).** `build/modules.json` and contradiction's Private Uses still name `legacy-checks`; contradiction no longer imports it, so the edge and the Uses line can go (BOB's files). Inquiry R40's "*(not yet met: T19 layer 6)*" mark is met on contradiction's side now.

**Tests and checks** (on `job/T19/contradiction` after merging `tranche/T19`):
- `node --test test/m/contradiction/`: tests 108, pass 101, fail 0, todo 7.
- `node --test test/m/inquiry/ test/m/strength/` (the read contract's owner and its other early reader): tests 224, pass 223, fail 0 (1 todo/skip as held on the tranche).
- `format`: 87 modules, 82 requirements files; 0 failures.
- `architecture contradiction`: 22 product files, 56 relative imports; 0 failures.
- `coverage contradiction`: 57 of 57 live requirement ids named by a test; 0 failures.
- `ownership contradiction tranche/T19`: 4 files changed; legacy-store and legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01QMBecKS8tAqi8UR6HBja3o): test runs 6, module lines 3240
