# promotion (T51)

**Status** · session_01QXX7F37mcmzDGf3WCEqdPU · depth 2 · WAITING ON BOB (J1) · handled B3

## J1 · QUESTION

Item 2 (K3807, remove the `deploy-ui.mjs` and `check-*.mjs` patterns from `row-census.mjs`) cannot be met yet. I made the edit and ran `system/row-census`: with the patterns gone the census imports `civicos-ui/check-mock-envelope.mjs` (legacy-ui's `paths` still hold `civicos-ui/`, tracked until L11), which runs its check when imported and exits with "check-mock-envelope: 2 failures"; the census suite dies before it reads a row, so the stamp could never go green. Best reading: the patterns stay until T51-126 deletes `civicos-ui/`; then the patterns and the stale comment `gate.mjs`:342 go in that same act (BOB's, after legacy-ui merges, or my CHANGE then). I reverted my edit; nothing of item 2 is in my branch. If you want it done another way (for example the census skipping the whole `civicos-ui/` prefix until L11), say which and I will apply it. R58 (`bundleHistory`, `op=bundlehistory`, R54's fourth arm) is done with its tests; the stamp waits for your CHANGE.

## Completion (PROMOTION #49)

**Entries applied.** T51-15: (1) R58 `bundleHistory` and `op=bundlehistory`, R54's fourth arm (`promotionOps` holds four ops), with `bundlehistory.test.mjs` (7 tests naming R58) and the R54 test amended. (2) The stamp, `CATALOG_VERSION` 1.77.0 -> 1.78.0, `ROW_CENSUS` re-pinned: 1918 rows, `31b4a129bc1b2c99b586c27c455d014fe1570c4287e4cc77c501e071f0d5864f` (9 arrived, 327 changed, none retired; none of the 336 is a row this module moved); fixture `row-census-1.77.0.jsonl` renamed to `1.78.0` with the new lines; the census suite's header and anchors re-pinned. (3) K3807 item 2 (the `civicos-ui/` patterns, `gate.mjs`:342): not applied, by B2 (K3838): goes to T52's stamp (N1246).

**Deferred.** The `civicos-ui/` patterns and the `gate.mjs`:342 comment (B2, T52).

**Found in other modules (REPORT to BOB).** (a) `build/modules.json` promotion `tests` still names `bio-plane/test/fixtures/row-census-1.77.0.jsonl`, which the stamp renamed to `row-census-1.78.0.jsonl`: `checks/run.mjs` format and architecture each show 1 failure until BOB moves that entry (BOB's file). (b) case-checker's generated `bio-plane/src/case-checker/program.mjs` embeds `CATALOG_VERSION` and is stale after the stamp: 3 tests in `test/m/case-checker/program.test.mjs` (R13 build bytes, R13 R16 R20 R22, R25) fail until the case-checker job regenerates it with `node bio-plane/src/case-checker/build-program.mjs` (manifest §14; not mine to write). (c) Already red before this job, not mine: 2 R61 failures in `test/m/case-authoring`; 10 coverage failures in other modules (agent-harness, agent-runner, capture, entities, explore, journey-check, people, progressions, retrieval-browse, retrieval).

**Tests and checks.** `test/m/promotion/` + `d526-refusal-order`: 148 pass, 0 fail. `system/row-census`: pass (10 arms, 1918 rows, digest as pinned). Other suites run: plane, op-declarations, legacy-store (same 6 failures with and without my change, op-declarations' registry pins); ratification, case-disclosures, case-tensions: 0 fail. `checks/coverage promotion`: 58 of 58 ids named. `checks/ownership promotion tranche/T51 job/T51/promotion`: 0 failures. `checks/run`: format and architecture 1 failure each, both (a); coverage's 10 failures are other modules'.

Size (session_01QXX7F37mcmzDGf3WCEqdPU): test runs 14, module lines 3948

## J2 · REPORT

Two things the stamp 1.78.0 makes stale in files that are not mine. (a) build/modules.json: promotion's tests entry names bio-plane/test/fixtures/row-census-1.77.0.jsonl, now row-census-1.78.0.jsonl; checks/run format and architecture each fail on it until you move the entry (as for 1.77.0). (b) case-checker's generated bio-plane/src/case-checker/program.mjs embeds CATALOG_VERSION and is stale: 3 tests in test/m/case-checker/program.test.mjs (R13 build bytes, R13 R16 R20 R22, R25) fail until the case-checker job runs node bio-plane/src/case-checker/build-program.mjs. Details in my record.
