# basis-versions (T20)

**Status** · session_01Toek8Uvzob3AX7e5gE9fct · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Job done on `job/T20/basis-versions` (pushed).

**Entries applied** (`build/plan/current.md` T20 L6, basis-versions; B1; K842, K861):
- R47 (K861, plane R10): `BasisVersions.COUNT_KEYS` (`basisVersions`, `basisVersionLegs`, frozen) and `counts(hid)` on the module's instance (`bio-plane/src/basis-versions/index.mjs`), plane's held statement as it is (`held.mjs`:134–:135, :66–:70): `inquiry_basis_versions` less rows whose `COALESCE(bundle_id, '')` is in `hid`; `inquiry_basis_version_legs` less rows whose `COALESCE(bundle_id, '')` or `COALESCE(target_id, '')` is in `hid`; whole for a null `hid`. Synchronous, writes nothing. basis-versions registers nothing itself; plane registers it as `registerCounts("basis-versions", [...BasisVersions.COUNT_KEYS], (hid) => bv.counts(hid))` (the instance is `basisVersionsOf(host)`). No file of plane's edited. R47 is met once plane registers it and deletes its copy (L11).
- **R47's test:** `bio-plane/test/m/basis-versions/t20-figures.test.mjs`, 3 tests, each named R47, on the module's own fixture (rows written by its own projection, R7): (1) the source alone against plane's copy's statement for 7 viewers (never sent, founder, machine, active administrator, project participant, member outside the project, refused), with each arm alone (a leg whose bundle is a hidden project member, one whose target is) and sight following an invitation; (2) a NULL key never dropped by `hid`, and nothing written; (3) registered through the real record-core R63 under `basis-versions`, read by `op=stats` through each viewer's sight and by purge's proof whole; `op=purge` of the question inside the project takes exactly its 1 version and 1 leg (3→2, 4→3); a second registration refused `COUNTS_DECLARED` naming `basis-versions`.

**Deferred:** none.

**Found in other modules (REPORT):**
1. Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` / `.bundle.json` (owner `not_product`) bundle `src/basis-versions/index.mjs`, which this change edits. Regenerate at layer close (manifest §Generated artifacts).

**Tests and checks run:**
- `node --test bio-plane/test/m/basis-versions/`: tests 118, pass 118, fail 0.
- `node --test bio-plane/test/m/plane/` (plane holds the copy and will register this export): tests 28, pass 28, fail 0. No provided service changed (an export added), so no user's suite is owed.
- Layer tests: none named in the manifest.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … basis-versions`: 22 product files, 74 relative imports; 0 failures.
- `node checks/coverage.mjs … basis-versions`: 44 of 44 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … basis-versions tranche/T20`: 3 files changed by basis-versions; 0 failures.

Size (session_01Toek8Uvzob3AX7e5gE9fct): test runs 5, module lines 3513
