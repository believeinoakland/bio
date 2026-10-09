# provenance-routes (T41)

**Status** · session_01Mu9HJJYkkMVmYJQmr99iuS · depth 2 · COMPLETE · handled B1

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

## J1 · COMPLETE

T41-7b applied (tests only): marked.test.mjs:126 (R5) and table.test.mjs:40 (R10) re-stated for D54, each with a discoverable-project negative control; new R4 D54 case; fixture gains project(); a stale comment in index.mjs corrected. No requirement text assumes the old sight. 38/38; format, architecture, coverage 13/13, ownership: 0 failures. Record: build/jobs/T41/provenance-routes.md.

## Completion (B2 · CHANGE, K2457)

Merged `tranche/T41` (provenance R63 merged). Read whole: B2, K2457, provenance R63 and R58, capture R86 and R65, provenance's `register-checks.mjs` upload shape.

Applied: `chainFromEvidence` (R1) gains an upload arm, beside the doorbell's: a document whose `origin.kind` is `upload` (provenance's exported `UPLOAD_ORIGIN`) is never a fetched route, whatever its `locator` (`upload:<sha256>`); its one hop is read from the upload's receipt it states (`source.receipt.sha256`, `received`): "these bytes were received for upload:<sha256> at <received>", `via: "upload"`, `bound: false`, `who` the instance and the member who brought it in (`capture.actor`), `reconstructed.from` naming those fields. Her `origin_statement` is never read into a hop. Without the receipt it is undetermined, `missing` naming the receipt. R2's rebuild and R4's assessment take it through the same function.

Tests: `chain.test.mjs` R1 (K2457) (the hop, the statement absent from it, no actor, four receipt-less shapes undetermined; negative controls: the same fields under a fetched origin are `direct`, under a doorbell origin the doorbell arm's own missing); `rebuild.test.mjs` R1, R2, R4 (K2457) (rebuild reconstructs and applies, the mark reads `derivable`/`PRESENT`, the statement carried untouched; without the receipt `EVIDENCE_INSUFFICIENT` and `LOOKED_INDETERMINATE`). Both fail with the arm removed (2 fail, 38 pass), pass with it.

For BOB (REPORT J3): R1's text names the doorbell arm only; it should gain the upload arm as built (and the Uses line for `provenance` gain `UPLOAD_ORIGIN`, its R58/R63). Proposed R1 sentence: "a document brought in by an upload (`origin.kind` `upload`, provenance R63) is never a fetched route either; its one hop, when its chain is missing, is read from the upload's receipt it states (`source.receipt`: "these bytes were received for upload:<sha256> at <received>", `via: "upload"`), else it is `undetermined` with `source.receipt` missing; the member's `origin_statement` is never read into a hop."

Deferred: none. Found in other modules: none.

Tests and checks:
- `node --test bio-plane/test/m/provenance-routes/`: tests 40, pass 40, fail 0.
- users' suites (retrieval, affordances, answer-envelope, store-door, control-plane, plane, `test/system/migrate-released`): tests 808, pass 764, fail 44, the identical 44 with this change stashed: none this job's.
- `checks/format.mjs`: 0 failures; `checks/architecture.mjs provenance-routes`: 0 failures; `checks/coverage.mjs provenance-routes`: 13 of 13; 0 failures; `checks/ownership.mjs provenance-routes tranche/T41`: 0 failures (run after commit).

Size (session_01Mu9HJJYkkMVmYJQmr99iuS): test runs 10, module lines 1240

## J2 · REPORT

R1's text names only the doorbell arm; B2's upload arm is built (index.mjs, ARM U). Please amend R1 and the Uses line (provenance: UPLOAD_ORIGIN, its R58/R63). Proposed sentence in my record, B2 Completion.
