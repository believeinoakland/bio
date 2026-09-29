# standards (T11)

**Status** · session_01SXyQJAxnzwptrywGGyqWH7 · depth 2 · WORKING · handled B1

## Completion

**Entries applied.**
- N220, N267 (R16): the `Standards` constructor creates the module's four tables (`migrateStandards`), so every service and record-core's purge succeed after `standardsOf(host)` with no `migrate()` call. `migrate()` stays, idempotent (`IF NOT EXISTS`), so legacy-store's `standardsOf(ctx).migrate()` (`store.mjs` 623) keeps working until it drops the call. Tested at the interface (R16): a world whose fixture never migrates, tables absent before construction and present after, the whole-store and single-bundle purge and every service succeeding; negative control run (removing the construction-time migrate fails R1–R6 and R11–R16).
- N269: a read naming no standard refuses through a coded row, C-112.11 `STANDARD_NO_ID` (code, check, translation), in its own region `refuseNoId > is-standard-named`, from `standardRead` and `inForce` (the latter answered `STANDARD_DATE_INVALID` or `NO_SUCH_STANDARD` for a missing id before). The code's name is my reading, J1 (K275; arm G): R5's text still says `NO_ID`.
- N296: every live id R1–R16 confirmed against its test (each named in a test title and checked whole). Added where a test did not cover the whole requirement: R3's matched entry stating no level (`level: undetermined` with `level_why`, through an injected combine since `jurisdictions` validates `level` as required), R10's adoption row. Test SQL at the plane's shape (K313, K316): the fixture's `sql.exec` answers a workerd-like cursor (never an array) and refuses a LIKE/GLOB pattern over 50 bytes; the module uses none.

**Not yet met marks** (in `build/requirements/standards.md`, outside my paths: for BOB to strike). All 16 hold: R1–R15 `*(not yet met: new module)*`, and R16 `*(not yet met: N220, N267; …)*`; the header's "Every requirement is *(not yet met: new module)*" sentence goes with them. If J1 is agreed, R5's `NO_ID` reads `STANDARD_NO_ID`.

**Deferred.** None.

**Found in other modules.**
- legacy-store: `store.mjs` 623 `standardsOf(ctx).migrate()` can now go (N267).
- conformance: mints `NO_SUCH_STANDARD` itself (`conformance/index.mjs` 323, its own row C-113 `NO_SUCH_STANDARD`); `check-refusal-codes` arm G flags the code at two sites (pre-existing). Under K275 standards would hold the one helper and row (`noSuchStandard`, as membership's `noSuchProject`) and conformance call it: a new standards Provides entry, so a requirement for BOB to word first.
- legacy-tests: `check-refusal-codes` floors move by this job's row and region (`rows` 780, `reach` 806, `governedSites` 487, `regions` 441, `regionLines` 5397, `codesChecked` 877, `refusalsJudged` 856 on this branch; all already failing as slack before this job, plus the census floor now met at 1063); promotion R34 stamps the new row C-112.11 (per B1). Pre-existing, unchanged by this job: `refusal-wire` (2 fail: `driveshells` reads `b.source_locator`, `monitoring` reads `monitor_frequency`) and `gate-reads` (2 fail, `op=monitoring`), identical on `tranche/T11`.

**Generated artifacts.** `bio-plane/dist/bio-plane.bundled.mjs` (and `release/`) include `src/standards/`: stale, for BOB's layer-close rebuild; not rebuilt.

**Tests and checks.**
- `node --test test/m/standards/` (in `bio-plane/`): tests 17, pass 17, fail 0, todo 0. No layer tests (manifest). No provided service changed in shape beyond the refusal code.
- Users' suites, all green: filings 33, conformance 29, consequences 22, escalation 28, actions 30, affordances `catalogue` 26, `project-sight` 1, `rec116-route-marked` 1.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `checks/architecture.mjs standards`: 8 product files, 27 relative imports; 0 failures.
- `checks/coverage.mjs standards`: 16 of 16 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs standards tranche/T11`: 8 files changed; 0 failures.

Size (session_01SXyQJAxnzwptrywGGyqWH7): test runs 22, module lines 794

## J1 · QUESTION

N269 reading (applied; carrying on): R5's `NO_ID` is refused as **`STANDARD_NO_ID`**, its own row C-112.11 (the slot left unused), from `standardRead` and also `inForce` (a missing id there answered `NO_SUCH_STANDARD`/`STANDARD_DATE_INVALID` before). Why not keep the code `NO_ID` with a row: `check-refusal-codes` arm G then reads `STANDARDS_CHECKS.NO_ID` as one DEC-49 code minted at 12 sites (content, inquiry ×4, publication ×3, strength ×2, standards) and raises the multi-site count past its ceiling; K275 gives a code naming a different subject per site to each module as its own, renamed. With `STANDARD_NO_ID` the guard shows no new failure (one fewer: the census floor is met). No consumer keys on `NO_ID` from standards (civicos-ui, filings, conformance, store). If you agree, R5's text needs `NO_ID` → `STANDARD_NO_ID` (yours to edit). If you want the literal code `NO_ID` kept, say so and I switch it back (arm G then fails by one, legacy-tests' to re-anchor).
