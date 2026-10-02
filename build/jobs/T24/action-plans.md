# action-plans (T24)

**Status** · session_015L9BbqSsxb2Tm6Q2ZEY2di · depth 2 · WORKING · handled B1

## Completion (ACTION-PLANS #5, T24 L9)

**Entries applied** (B1 START; `build/plan/current.md` T24 L9):
- **N489, R36** (DEC-114): every member-facing sentence says "matter". The C-124 translations already did; the two refusal details the Suggestions named are re-worded (`values.mjs`:124 "when_subject names a matter of the plan", :163 "that matter is not one the plan is about"), and the plan document's Session Log blurbs for R4's acts now read "Matter added" / "Matter removed". No other sentence said "subject". Internal names unchanged (keys, codes, `subject_removed`, the ops).
- **N490, R37** (DEC-115): `optionStartPreview` (`op=optionstartpreview`, exported in `actionPlansOps`). It runs `optionStart`'s own path (a module-private mode of it, so the DEC-49 regions and C-124.40–.42's `where`s are unmoved) and, where the start would land, rolls the whole act back inside `record-core`'s `transact` (R32: no row kept, no id spent; `afterCommit` dropped), the same dry-run pattern control-plane R36 uses (K559). It answers `{ok, plan, option, preview, action: {kind, addressee, clock, legs: [{target, kind: rests_on, subjects: [{subject, support, why}]}], plan, option, contact, breach, premise_override}, reminders, would_start, refusal?, says}`; a plan or option the viewer may not see is answered exactly as R18 answers it (R18's order, so a machine author is `MACHINE_CANNOT_START` first); a matter the viewer may not see is withheld whole from `legs` with `out_of_view: true` (R35's rule, applied here).
- **N502**: `checks.mjs`:4 re-worded: the C-124 rows were taken by promotion's stamp 1.49.0 (PROMOTION #20, T19 L2; K711). Re-scan of the module for the N502/N508 kind: nothing else stale (`index.mjs`:1738 names `plane`'s store spreading the op map, which it does: `src/plane/store.mjs`:316).

**Rows**: none added or changed (no translation, check or `where` moved), so no `awaiting stamp` row from this job (red 5 lists none).

**Deferred**: none.

**Found in other modules** (also in my REPORT):
1. `affordances` and `op-declarations`: `optionstartpreview` to be graded and declared (a read stamped `author` and `viewer`; the requirements' Suggestions); `control-plane` routes it. Red 6 until their L11 merges: `test/m/affordances/catalogue.test.mjs`:524 fails on the new op, as accepted.
2. Generated artifact: the change under `bio-plane/src/action-plans/` stales `bio-plane/dist/bio-plane.bundled.mjs` (bundler, `not_product`); regenerated nothing (manifest §14).

**Tests and checks**:
- `node --test bio-plane/test/m/action-plans/`: 53 pass, 0 fail (43 before; new `preview.test.mjs` R37 ×7, `words.test.mjs` R36 ×3, the op-map list in `invariants.test.mjs`). Negative control for R36: with the old `values.mjs` the words test fails.
- `node --test bio-plane/test/m/`: 5254 tests, 5240 pass, 3 fail, 11 todo. The three are accepted reds: red 6 (`affordances/catalogue.test.mjs`:524, `optionstartpreview`), red 8 (`scheduler/consumers.test.mjs`:161), red 9 (`plane/notices.test.mjs`:33).
- `checks/format.mjs`: 88 modules, 2 failures, both red 4 (link-sweep's `paths` and `tests` absent).
- `checks/architecture.mjs action-plans`: 14 product files, 46 relative imports; 0 failures.
- `checks/coverage.mjs action-plans`: 37 of 37 live ids named by a test; 0 failures.
- `checks/ownership.mjs action-plans tranche/T24`: 0 failures.

Size (session_015L9BbqSsxb2Tm6Q2ZEY2di): test runs 7, module lines 2655
