# sources (T19)

**Status** · session_011v92rStaFe1QmyF26UqmkU · depth 2 · COMPLETE · handled B1

## Completion (SOURCES #6, 2026-10-01)

**Entries applied** (B1; `build/plan/current.md` layer 3, sources, kept; rule 1): `bio-plane/src/sources/index.mjs`:31 imports `isMachineIdentity` from `../record-grammar/index.mjs` instead of the catalogue (`../../checks/bio-checks.mjs`). The two are the same binding (`===`, record-grammar R26), so behaviour is unchanged. The module now imports nothing from `legacy-checks`. No suite deleted (K619).

**Flaws or improvements in my own module:** none found on a whole read of the code and tests. **Deferred:** none.

**Found elsewhere** (sent as a REPORT): `build/requirements/sources.md` Uses still names `legacy-checks` for "the shared argument checks (`requiredArgument`, `isMachineIdentity`)". The module calls no `requiredArgument`, and `isMachineIdentity` now comes from `record-grammar`, so that line should name `record-grammar` (R15, `isMachineIdentity`) and drop `legacy-checks`. `modules.json` can drop `legacy-checks` from sources' `uses` too. Both are BOB's files. No generated artifact is staled by this job beyond the plane bundle's ordinary input change (BOB regenerates it at layer close).

**Tests and checks:**
- `node --test test/m/sources/` (from `bio-plane/`): tests 24, pass 24, fail 0.
- `format: 87 modules, 82 requirements files; 0 failures`
- `architecture: 11 product files, 27 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 15 of 15 live requirement ids named by a test; 0 failures`
- `ownership: 1 files changed by sources between tranche/T19 and HEAD; 0 failures`

Size (session_011v92rStaFe1QmyF26UqmkU): test runs 1, module lines 837

## J1 · REPORT

build/requirements/sources.md Uses still names legacy-checks for requiredArgument and isMachineIdentity. The module calls no requiredArgument, and isMachineIdentity now comes from record-grammar (its R15). The line should name record-grammar and drop legacy-checks; modules.json can drop legacy-checks from sources' uses. Both files are yours.
