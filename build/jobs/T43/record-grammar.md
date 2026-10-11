# record-grammar (T43)

**Status** · session_012hin3suQbyht8NAUmKGuMq · depth 2 · COMPLETE · handled B1

## Completion (RECORD-GRAMMAR #14)

**Reading set** (mechanics §17): measured at START at 190 KB, under 300 KB; read whole myself: `build/requirements/record-grammar.md`; layer 1's row and contract in `build/layers.md`; the plan's entry T43-1 and its rules at the opening (rule 4 as at my START); K2643, K2625, K2689 (and K231) in `build/rulings.md`; `plan/draft-T43-cleanup.md` §N854 and §N857; every file of `bio-plane/src/record-grammar/`, and of `bio-plane/test/m/record-grammar/` the tests I changed with the fixtures' builder (`fixtures/bundles.mjs`; `expected.json`'s data excepted, K2053). Read for the entries: every raiser of `NO_BASIS` in `bio-plane/src` (the five sites confirmed in code: inquiry `actNoBasis`, progressions `checks.mjs refusal`, entities `actShapeRefusal`, money `refusal` in `setFundType`, lines `noBasis` in `recordLine`'s `#basis`). No Uses (first in the order).

**Entries applied** (commit 0a1de9dee3).
- T43-1, R29 (N857, K2643; `acts.mjs`): C-33.40's `where` names all five sites: inquiry's `actNoBasis` (basis-versions through it), progressions' `refusal`, entities' `actShapeRefusal`, money's `refusal` (`setFundType`), lines' `noBasis` (`recordLine`). Number and translation unchanged. **Row change: C-33.40's `where`, for T43-6's stamp** (it pins in `bio-plane/test/fixtures/row-census-1.69.0.jsonl`, promotion's; rule 4 (2)).
- T43-1, R56 (N854, K2625; `bundle.mjs`, exported from `index.mjs`): `idDisagrees(fm, folderName)`: true exactly when `fm?.id` is a string not equal byte for byte to `folderName` (no trim, no case fold); a non-string or absent id, or absent front matter, is false (C-1.2's). `checkIdentity`'s C-1.1 arm now calls it, so its findings are unchanged (the R40 parity fixtures still match). Promotion's door (T43-6) imports it from the module's entry.

**Tests.** `bundle.test.mjs` "R56 …": exact id not refused (negative control); padded ids (space, tab, newline, CR, NBSP, either side, folder padded too) refused; case, another id, empty, lookalike refused; non-string ids (number, boolean, array, object with `toString`, boxed `String`), absent id and absent front matter not refused; over `checkBundle`, C-1.1 is raised exactly when `idDisagrees` is true, for quoted padded ids through the parser, with its message; a numeric id draws C-1.2 and no C-1.1. `labels.test.mjs` "R29 C-33.40's where names all five NO_BASIS sites …": each site `file helper` named once, in order, no other site, each with its acts, each file existing; negative controls: T42's three-site `where` fails it, and so does the current one with money's or lines' helper removed. `invariants.test.mjs`: `idDisagrees` in the one-binding list and the purity battery. The test reads the other modules' sites by name and file only (P4).

**Ran.**
- `node --test bio-plane/test/m/record-grammar/`: tests 87, pass 87, fail 0. No layer tests named in the manifest.
- Users' suites (`bio-plane` `test/m/**/*.test.mjs`, every module) on my branch: tests 10044, pass 10009, fail 23, skipped 1, todo 11. The 23 failing files re-run on `origin/tranche/T43` @ fefe3a24d1 without me: 22 of the 23 red there identically.
  - **Mine:** none in another module's test.
  - **Generated artifact staled (rule 4 (6); not mine to write, §14):** `case-checker` `program.test.mjs:19` (`program.mjs` inlines `bundle.mjs`); fresh on the tranche, stale on mine. The plane bundle likewise. `ids.mjs` and `document.mjs` are unchanged, so agent-worker's and newgroup's bundles are not staled by me.
  - **Red on the tranche without me (inherited):** action-clocks `overdue.test.mjs:126`, action-plans `invariants.test.mjs:11` (rule 4 (8)); and, not named in rule 4: affordances `t36.test.mjs:55`; ai-use `counting.test.mjs:167`, `limits.test.mjs:198`, `reads.test.mjs:144`; case-carriage `invariants.test.mjs:66`, `rereads.test.mjs:149`, `:167`, `:195`, `:212`; notice-producers `accounts.test.mjs:36`, `:47`, `:88`; op-declarations `t34.test.mjs:68`, `:145`, `:307`, `t37.test.mjs:105`, `:177`, `:218`, `t38.test.mjs:76`, `:87`. (Lines are each test's declaration.)
- Checks: `format` 0 failures (147 modules); `architecture record-grammar` 0 failures; `coverage record-grammar` 54 of 54, 0 failures; `ownership record-grammar tranche/T43` 7 files, 0 failures.

**Deferred.** None.

**Found in other modules.**
- `promotion`: C-33.40's `where` row change for its T43-6 stamp (row census 1.69.0 pins the T42 text); `idDisagrees` is ready for its R38 door.
- The 20 inherited reds above not named in rule 4 (affordances, ai-use, case-carriage, notice-producers, op-declarations), red on `tranche/T43` before any T43 job.
- Generated artifacts staled: `case-checker/program.mjs`, the plane bundle (regenerated at layer close).

Size (session_012hin3suQbyht8NAUmKGuMq): test runs 5, module lines 2532

## J1 · COMPLETE

T43-1 complete (0a1de9dee3). R29: C-33.40's where names all five NO_BASIS sites (inquiry actNoBasis, progressions refusal, entities actShapeRefusal, money refusal/setFundType, lines noBasis/recordLine); row change for T43-6's stamp (row-census-1.69.0 pins T42's text). R56: idDisagrees(fm, folderName) exported from the entry, byte-for-byte, non-string id false; checkIdentity's C-1.1 runs it (R40 parity unchanged). record-grammar 87/87; checks format, architecture, coverage (54/54), ownership (7 files) 0 failures. Users' suites: 10044 tests, 23 fail; none mine. Stale generated artifact: case-checker program.test.mjs:19 (program.mjs; rule 4 (6)) and the plane bundle. 22 red identically on tranche/T43 without me: rule 4 (8)'s two, plus 20 not named in rule 4 (affordances t36:55; ai-use counting:167, limits:198, reads:144; case-carriage invariants:66, rereads:149/167/195/212; notice-producers accounts:36/47/88; op-declarations t34:68/145/307, t37:105/177/218, t38:76/87). Record: build/jobs/T43/record-grammar.md, Completion section.
