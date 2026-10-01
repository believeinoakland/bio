# consequences (T19)

**Status** · session_018tTPNKhSfvJEkAeSj4HgSp · depth 2 · WORKING · handled B1

## Completion (CONSEQUENCES #5)

**Entry applied** (`build/plan/current.md` layer 9, consequences: catalogue re-points; BOB's B1 START, rule 1), so no consequences file imports `bio-checks.mjs`:
- `src/consequences/index.mjs`:44–46: `isMachineIdentity`, `MACHINE_CLASS_PREFIX` from `record-grammar/actors.mjs`; `normalizeType` from `record-grammar/types.mjs`; `BASIS_GRADES` from `record-grammar/grades.mjs`. The same values the catalogue re-exported, so no change of behaviour.
- The module tests import no catalogue name (checked: none did before this job either).
- **K819** (INQUIRY #8 J3): `test/m/consequences/fixture.mjs` `inquiryMd` now gives a `concluded` inquiry a frontmatter `conclusion` beside its falsifier and basis leg (inquiry-grammar R1, enforced at every inquiry write by inquiry R11). Before the fix 4 tests were red on C-2.8 ("concluded state requires a non-empty conclusion"); after it, all pass.

**Deferred:** none. Old suites untouched (K619). No requirement changed; no service changed, so no user's tests to run.

**Found in another module:** none. For BOB (requirements and `modules.json`, BOB's): `build/requirements/consequences.md` Uses still says `legacy-checks: isMachineIdentity; the CONS- type registration`. After this job consequences imports nothing from `legacy-checks`: `isMachineIdentity` is record-grammar's, and the `CONS: 'consequence'` registration is in `record-grammar/types.mjs`:21. So the Uses line and the `legacy-checks` edge in `modules.json` are stale; `record-grammar` is declared in `uses` but not named in Uses.

**Tests and checks** (on `job/T19/consequences`):
- `node --test bio-plane/test/m/consequences/*.test.mjs`: tests 24, pass 24, fail 0.
- `format.mjs`: 87 modules, 82 requirements files; 0 failures.
- `architecture.mjs … consequences`: 10 product files, 38 relative imports; 0 failures.
- `coverage.mjs … consequences`: 14 of 14 live requirement ids named by a test; 0 failures.
- `ownership.mjs … consequences tranche/T19`: 3 files changed; 0 failures.

Size (session_018tTPNKhSfvJEkAeSj4HgSp): test runs 4, module lines 2074
