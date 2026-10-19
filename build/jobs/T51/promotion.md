# promotion (T51)

**Status** · session_01NQ73uXH2mGnUfNvX2qwAyZ · depth 2 · WORKING · handled B4

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

## J3 · COMPLETE

T51-15 done: R58 bundleHistory/op=bundlehistory (R54 four arms) with tests; stamp 1.78.0, 1918 rows, digest 31b4a129...; system/row-census green; promotion tests 148 pass; coverage 58/58; ownership 0 failures. K3807 item 2 deferred to T52 (B2). Reports: modules.json fixture name, case-checker program.mjs stale. Record has the detail.

## J4 · COMPLETE

T51-262 done (words pass, B4). Commit df52436b63 on job/T51/promotion.

**Entries applied.** The four `plain` findings in `build/plan/words-pass/promotion.md`, each judged a member-readable sentence and read through `localize`, en unchanged: `gate.mjs` `promotion.gate.capture_absent_from_bucket` and `promotion.gate.capture_bytes_differ` (the two `PLANE_*` details); `promotion/index.mjs` `promotion.index.project_needs_name` (the `NO_TITLE` detail); `promotion/names.mjs` `promotion.names.give_project_title_unique` (the C-77.2 repair). The one `testcopy`, `converts.test.mjs:170`: the list now comes from the module's own `MECHANICAL_APPEND_FILES` (history.mjs) plus `snapshots/page.html`, so the test no longer copies a path that also sits in subresources' localized sentence. Two tests that would copy the converted sentences, `wording.test.mjs` (R19 and R38), now compare with `localize(id, en)` by equality; the unused `OURS` constant is removed. Nothing judged unread by any member, so no REPORT for those.

**Deferred.** None.

**Found in other modules (REPORT).** `system/row-census` (R50 pin, my suite) reports 1921 rows against the pin's 1918: arrived with no record C-25.37, C-25.38, C-25.39 (VERSION_COMPARE_*), changed with no record C-33.25 (NO_ALIAS). None of these rows is in promotion's files and this job touches no table row, so they belong to the rows other modules have added and that await CR-5's stamp. Not changed here (B4: no stamp in this job).

**Tests and checks.** `test/m/promotion/` + `d526-refusal-order`: 148 pass, 0 fail. `wording` + `converts`: 23 pass, 0 fail. `system/row-census`: 8 pass, 2 fail (the R50 pin above, other modules' rows). `checks/format promotion` path: 0 failures (175 modules). `checks/architecture` over the tree: 0 failures (3592 files). `checks/coverage promotion`: 58 of 58 ids named. `checks/run.mjs /home/user/bio`: format and architecture 0 failures; coverage 33 failures, none in promotion (other modules). `setup-words/build.mjs --check`: the stale-rows note for `rows.mjs` only (expected; BOB regenerates at layer close), no refusal naming promotion. `checks/words.mjs`: no finding in promotion's files (the remaining failures are other modules'). `checks/ownership promotion tranche/T51 job/T51/promotion`: 0 failures.

Size (session_01R5Q8GiUFkdmFTFrNbWpmSr): test runs 7, module lines 3935
