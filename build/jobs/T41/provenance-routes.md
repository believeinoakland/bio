# provenance-routes (T41)

**Status** · session_01Mu9HJJYkkMVmYJQmr99iuS · depth 2 · WORKING · handled B0

## Work (kept current; not a mailbox entry)

Reading set: measured at about 210 KB (this module's requirements 16.5 KB, code 75 KB, tests 101 KB, layer 3's row, and the Purpose of each used module with the services my Uses names: record-grammar R15; record-core R21, R34, R37, R63, R68, `readImage`; membership's Terms, R43, R44, R71, R80, R88; promotion's `promote`; provenance R48, R51, R58), under 300 KB, so read whole myself; no worker summary. Also read: `roles/JOB.md`, B1, plan T41-7b, K2408, K2409, K2442.

## Completion

Entries applied: T41-7b (N822, D54; K2408, K2442), tests only. My requirements' text assumes no administrator sight (R2, R4, R5 defer to membership's `viewerPredicate` and `inSight`), so no QUESTION.

- `marked.test.mjs`:126 (R5) re-stated: the fenced bundle sits in a hidden project (`PROJ-2026-0009-p`, owner `olive`); its owner sees all three; a member outside and the founder, in both spellings, are withheld it from page and census alike, and the cursor still moves past it for both; negative control: once the owner sets it discoverable the founder sees all three, a member outside still two.
- `table.test.mjs`:40 (R10) re-stated: `routeMarks` through `hiddenBundles` is 2 for a member outside, the founder (both spellings), 3 for the owner; negative control: discoverable, the founder counts 3, a member outside still 2.
- Fixture: `project(id, {owner, visibility})`, a project bundle written through record-core's `commit` and created as promotion creates one (membership R71); `fence`'s comment corrected for D54.
- Improvements in this module: a new R4 case in `assess.test.mjs` (the founder asking to assess a bundle in a hidden project it is not in is refused `ROUTE_MARK_NO_SUCH_BUNDLE`, C-34.3, identical to an absent id, nothing appended; discoverable, the assessment runs); `index.mjs`'s comment above `provenanceRoutesMarked` said the viewer gate withholds nothing from a recognised viewer, which was false since N426 and more so since D54: corrected, no code change.

Deferred: none.

Found in other modules: none. No provided service changed, so no user's suite is owed.

Tests and checks:
- `node --test bio-plane/test/m/provenance-routes/`: tests 38, pass 38, fail 0 (before: 37 tests, 2 fail, the two D54 reds).
- `checks/format.mjs`: 145 modules, 144 requirements files; 0 failures.
- `checks/architecture.mjs provenance-routes`: 14 product files, 39 relative imports; 0 failures.
- `checks/coverage.mjs provenance-routes`: 13 of 13 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs provenance-routes tranche/T41`: 6 files changed; 0 failures.

Size (session_01Mu9HJJYkkMVmYJQmr99iuS): test runs 5, module lines 1215
