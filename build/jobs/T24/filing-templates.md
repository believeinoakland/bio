# filing-templates (T24)

**Status** · session_018PerAe8XJSY1fNj1PqaQho · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (`build/plan/current.md` T24 L9; B1, wording only, no change of meaning, no requirement change):
- N502, `bio-plane/src/filing-templates/checks.mjs`:9: "Every row here is `awaiting stamp` (T22's promotion job)" re-worded to the stamp that took them: 1.52.0 (PROMOTION #23, T22 layer 2; K991), whose history in `gate.mjs` names C-125.1–.32 arriving, C-115.31 and .36 re-keyed and C-115.32, .33, .35, .37, .38 moved. 1.53.0 and 1.54.0 changed none of this module's rows.
- The re-scan (N469's rule) found two more notes of the kind, re-worded: `schema.mjs`:10 called `filing_templates` "`filings`' own table today (its R26 library)" and `index.mjs`:29 "its R26 table"; `filings` R26 is retired and the table is written by nothing since T21 (K986), so each now says so. `index.mjs`:29 also said the migration reads it "once"; it runs at every start (`migrateFromFilings`, idempotent), so "once" is dropped. No note names the retired legacy store, its op map, its dispatcher or legacy-index as live. The tests hold no stale note.

**Rows:** none added or changed (red 5: nothing to list).

**Deferred:** nothing.

**Found in another module:**
- Generated artifact staled (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`) is now stale in its three inputs `src/filing-templates/checks.mjs`, `index.mjs`, `schema.mjs` (comments only). `fleetbundles.test.mjs` passes without this change and fails with it on exactly those three files. Regenerated nothing (B1).
- Requirements, not code: `build/requirements/filing-templates.md` R20 still reads "*(not yet met: T22: `project` is not answered)*"; the code answers `project` and the two R20 tests check it (N476). Requirements are BOB's to edit.

**Tests and checks** (on `job/T24/filing-templates` @ the commit before this record):
- `node --test bio-plane/test/m/filing-templates/`: tests 47, pass 47, fail 0.
- `node --test bio-plane/test/m/` (from `bio-plane/`): tests 5244, pass 5231, fail 2 (accepted reds 8 `scheduler/consumers.test.mjs`:161 and 9 `plane/notices.test.mjs`; both red without this change too).
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: fail 1, the bio-plane bundle stale as above (pass 1, fail 0 without this change).
- `checks/format.mjs`: 88 modules, 87 requirements files; 2 failures (accepted red 4: `link-sweep`'s directories absent).
- `checks/architecture.mjs … filing-templates`: 10 product files, 32 relative imports; 0 failures.
- `checks/coverage.mjs … filing-templates`: 25 of 25 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … filing-templates tranche/T24`: 4 files changed; 0 failures.

Size (session_018PerAe8XJSY1fNj1PqaQho): test runs 6, module lines 1719

## J1 · COMPLETE

N502 applied, wording only: checks.mjs:9 now names 1.52.0 (PROMOTION #23, T22 L2; K991) as the stamp that took every row; the re-scan re-worded schema.mjs:10 and index.mjs:29, which called filings' filing_templates its live R26 library (retired; written by nothing since T21, K986). No row added or changed (red 5: none). Module 47/47; bio-plane/test/m 5231 pass, 2 fail = accepted reds 8 and 9; architecture, coverage (25/25), ownership 0 failures; format 2 = red 4. REPORT inside: the plane's bundle dist/bio-plane.bundled.mjs is stale in these three files (comments only); regenerated nothing. Also R20's requirements text still says 'not yet met: T22' though the code and tests meet it (N476). Details in my record's Completion.
