# promotion (T32)

**Status** · session_01UDnkacoJ2wBBSc6UQbGpGi · depth 2 · COMPLETE · handled B1

## Completion

Stamp commit `81b3d9a7e4` on `job/T32/promotion` (from `tranche/T32` @ f48bb998f6).

**Entries applied.** S7, from BOB's B1 START:
- The stamp: `CATALOG_VERSION` 1.59.0 → 1.60.0 (`bio-plane/src/gate.mjs`), MINOR, its note in 1.59.0's form. `GATE_VERSION`'s form is kept (R34). `ROW_CENSUS` is re-pinned at **1162 rows**, `2bc34e4652d0f43f89149fecafe493300e9b3806a1a8a4ca3f7e8d040732bc2b` (R50).
- Census against the records: the tree moved from the 1.59.0 pin by exactly the 34 rows B1 lists, and nothing else: 34 lines arrived, none departed, none changed (1128 → 1162).
  - **C-131.1–C-131.32**, wizard-scripts' `WIZARD_SCRIPTS_CHECKS` (K1393, K1401). C-131.8 NOT_A_DRAFT, C-131.14 NOT_AN_APPROVER and C-131.15 APPROVER_IS_AUTHOR are each the family's own row object, stamped as its own beside filing-templates' C-125 rows, whose lines are unmoved (control-plane's composed catalogue keeps the first source's, WIZARD-SCRIPTS #1's record).
  - **C-130.15** IMPORT_WATCH_BAD_ADDRESS and **C-130.16** IMPORT_NOT_WATCHED (case-import, N534).
  - Docket's T31 job added and changed no row.
- A composition change the census cannot see, recorded in the note: the case gate's registered catalogue (ratification's) accepts `bio-case-document/7` and names the declared format in C-41.1 and C-41.13–C-41.15's findings (N538, K1367); publication's C-122.2 admits `/7` through case-grammar's predicate. No row line moved with it. wizard-scripts and case-import register no step, grammar, fact or case catalogue.
- Census fixture (R50): I added `bio-plane/test/fixtures/row-census-1.60.0.jsonl` (1162 lines, written by `row-census.mjs`'s own `censusOf`) and deleted 1.59.0's. `AWAITING_STAMP` and `COMPOSITIONS_AWAITING` are re-anchored at 1.60.0, both empty. The suite header gains the 1.60.0 re-pin note. **BOB swaps my `tests` entry** from `row-census-1.59.0.jsonl` to `row-census-1.60.0.jsonl` (K1027's form).
- Negative control: its arms in the suite pass on the stamp commit.

**Deferred.** None.

**Found in other modules.**
- Generated artifacts made stale by `gate.mjs` (I regenerated neither):
  - `bio-plane/src/case-checker/program.mjs` (case-checker's; it embeds `CATALOG_VERSION`). `case-checker/program.test.mjs` R13 and R13/R16 fail on my branch. Regenerate with `node bio-plane/src/case-checker/build-program.mjs`.
  - `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`).

**Tests and checks** (on `81b3d9a7e4`):
- `node bio-plane/test/system/row-census.test.mjs`: `row-census: 8 pass, 0 fail` (CENSUS 1162 rows `2bc34e46…`, PIN 1.60.0). This clears T32's red 2.
- `node --test bio-plane/test/m/promotion/`: 102 tests, 101 pass, 1 fail: registry.test.mjs R39/R45/R46 (the modules' total order), red 5 (membership's `MODULE_ORDER` lacks wizard-scripts, N544); it fails identically with my change stashed.
- `node bio-plane/test/d526-refusal-order.test.mjs`: 31 passed, 0 failed.
- `node --test --test-timeout=120000 bio-plane/test/m/`: 5968 tests, 5952 pass, 5 fail, 0 cancelled, 11 todo. Three are red 5 (membership's module-order R83, t9-notice-sight-bounds R79, promotion's registry R39); two are case-checker's stale program (above).
- `checks/format.mjs`: 98 modules; 0 failures.
- `architecture.mjs`: 26 product files, 87 imports; 0 failures.
- `coverage.mjs`: 56 of 56; 0 failures (run with an empty placeholder at the 1.59.0 fixture's path, which my `tests` entry still names until BOB's swap; without it the check stops on ENOENT).
- `ownership.mjs … tranche/T32`: 5 files, 1 failure, the 1.60.0 fixture, outside my `tests` until the swap.
- Module size: 3325 lines (`gate.mjs` and `promotion/`).

Size (session_01UDnkacoJ2wBBSc6UQbGpGi): test runs 7, module lines 3325
