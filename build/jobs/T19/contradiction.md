# contradiction (T19)

**Status** · session_01QMBecKS8tAqi8UR6HBja3o · depth 2 · WORKING · handled B0

## J1 · REPORT

Rule 1 done and pushed (`job/T19/contradiction` @ HEAD): `src/contradiction/index.mjs` imports `sha256HexSync`, `canonicalJson`, `isMachineIdentity`, `parseFrontmatter` from record-grammar's `sha256.mjs`, `json.mjs`, `actors.mjs`, `frontmatter.mjs`; `fixture.mjs` and `propose.test.mjs` likewise; `index.mjs`:4's comment re-worded. No contradiction file imports `bio-checks.mjs`. Module tests: 108 tests, 101 pass, 0 fail, 7 todo.

N136's rest is drafted and held, not committed: K2's join, K2's `subject` rung and R28's subject fact read `inquiry_bundle_facts.inquiry_subject_entity` (inquiry R40), and the fixture seeds the subject there instead of adding the column to `bundles`. Tried locally with the column added to inquiry's table: the remaining failures are inquiry's own projection (`index.mjs`:530 still writes `bundles.inquiry_subject_entity`, "no such column"), so it lands only after inquiry's move. I need inquiry merged early into `tranche/T19`; send a `CHANGE` when it is, and I merge, apply, test and complete.
