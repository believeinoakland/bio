# tasks (T20)

**Status** · session_01CAA1BBC2Xet1Puxq6SDRCp · depth 2 · WORKING · handled B1


### Completion

- **Applied:** K899 (1) "record" for "bundle" in member-read text, at the four lines named: `src/tasks/checks.mjs`:149 (C-19.1's message, "is not a canonical record ID"), :152 (its repair, "re-point the task at the successor record"); `src/tasks/index.mjs`:178 (the route's basis, "owner of …, which cites this record"), :304 (the drain's `waiting` detail, "the capture is not yet filed in any record; …"). Identifiers, codes, field names, SQL and comments unchanged.
- **Re-scan of my paths** (`src/tasks/`: `index.mjs`, `checks.mjs`, `schema.mjs`): no other member-read string holds the word. The other hits are identifiers (`bundleId`, `bundle_id`, `bundleInfo`, `BUNDLE_ID_RE`, `#bundleGate`), SQL (`bundles`), comments and the schema's comments. One thrown `Error` in `#bundleGate` (index.mjs:103, "the D-15 bundle gate needs a QUALIFIED column … binds to `bundles`") is a programming guard: every caller passes a qualified column, so it never reaches a member, and it names the table; it stays.
- **Tests re-keyed:** `grammar.test.mjs` (R4: the drain's refusal, two N367 bounds, the repair) and `inbox.test.mjs` (R1: the citing-owner basis, twice). Added: `inbox.test.mjs` (R1) pins the `waiting` detail, so all four new sentences are held. No suite deleted (K619).
- **Deferred:** none.
- **Found in other modules / stale generated artifacts (for BOB, mechanics §14):** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`) carries the old sentences; so do `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` (and through it `newgroup/dist/newgroup.bundled.mjs`), which embed it. None written by this job. No other module's source or tests pin the old words (searched the repository). `docs/development/INBOX-GRAMMAR.md`:76 still says "a canonical bundle ID" (a design document, not member-read output; BOB's to judge).
- **Reading (step 2):** read whole: `build/requirements/tasks.md`, B1 and its plan entry (`build/plan/current.md` L11, K899 (1), K902), `src/tasks/` (all three files) and `test/m/tasks/` (all five files). The Uses' public parts were not read: the entry changes four human sentences and touches no service of any module used.
- **Tests:** `node --test bio-plane/test/m/tasks/`: tests 71, pass 71, fail 0. No layer tests named in `build/manifest.md`. No provided service's contract changed (only the wording of R1's `basis` and `waiting.detail`); as a safeguard the users' suites were run: queue 74/74, control-plane 85/85, plane 28/28, 0 fail each.
- **Checks:** format: 84 modules, 82 requirements files; 0 failures. architecture: 8 product files, 31 relative imports; 0 failures. coverage: 11 of 11 live requirement ids named by a test; 0 failures. ownership: 5 files changed by tasks between tranche/T20 and HEAD; 0 failures.
- Size (session_01CAA1BBC2Xet1Puxq6SDRCp): test runs 4, module lines 955
