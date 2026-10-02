# publication (T27)

**Status** · session_01PBj2Sb1NuqAgKWDSQUEqiZ · depth 2 · WORKING · handled B1

## Completion

- **Applied:** N520 (R40, DEC-116): R40's reader list already names `docket` (R1, R4, R9, R12, R14) in the folded requirements. The one R40 test (`casedoc.test.mjs`, "R40 the seven tables and their named columns …") now names `docket` among the later modules whose reads under the contract it checks. Its queries already read every table and column `docket` uses (`cases`, `published_cases`, `published_case_members`, `case_documents`; docket's Uses), so nothing else changed. No code changed. R40's mark `(not yet met: T27: docket's reads)` is BOB's to strike at the merge.
- **N502/N508 re-scan:** nothing stale. The `op map` hits name the plane's live op map (`plane/store.mjs`), and the legacy-index and legacy-store mentions are past-tense history (`door.mjs`:2, `index.mjs`:217).
- **Catalogue rows added:** none, so no `awaiting stamp` row.
- **Deferred:** none. **Found in other modules:** none.
- **Tests:** `node --test test/m/publication/` (in `bio-plane/`): tests 99, pass 98, fail 0, todo 1 (R30, not yet met, D-246; unchanged).
- **Checks:** format: 92 modules, 91 requirements files; 0 failures · architecture: 23 product files, 78 relative imports; 0 failures · coverage: 39 of 39 live requirement ids named by a test; 0 failures · ownership: 1 file changed by publication between tranche/T27 and HEAD; 0 failures.

Size (session_01PBj2Sb1NuqAgKWDSQUEqiZ): test runs 1, module lines 1
