# promotion (T13)

**Status** · session_01JwRGiAAQuCSCteSnVJeMBi · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R50's census, my reading (legacy-tests' suite must compute the same digest, so I state it exactly; I carry on under it):
1. Files: every .mjs/.js under any module's `paths` in build/modules.json, except test files (a `test/` directory, `*.test.mjs`, `*.control.mjs`) and scripts that run when imported (`bio-plane/scripts/`, `bio-plane/migrate/`, `civicos-ui/check-*.mjs`). store.mjs, index.mjs and control-plane/index.mjs cannot be imported under node, and export no row table.
2. A table is an exported plain object. A row is one of its values carrying a string `check` matching /^C-\d+/. Its code is its key. A missing `where` or `translation` is null in the line.
3. Duplicates: one table object reached by two exports (a re-export) counts once, and one row object in two tables (connections' view of THEME_CHECKS) counts once. Two distinct row objects with one check id count twice: C-41.1–.15, held by ratification and the catalogue, and C-96.1 while membership and the catalogue both hold it.
4. Sort by check, then code, in plain JS string order (code units, not numeric). The lines are JSON.stringify([check, code, where, translation]), joined with "\n" and no trailing newline, then SHA-256 over UTF-8.
On tranche/T13 today (before record-core and membership) this gives 818 rows, digest daa4554642a8bd6a9b28b2d53903b3133191e62a03f756e85da3061b51c49af2. I pin it after both merge.

## Completion

**Entries applied.**
- N322: R19's no-free-id refusal answers through record-core's `mintExhausted("PROJ")` (its R62, row C-59.6), so it carries its code, check, translation and prefix. The transaction rolls back and nothing is written. `forkProject` reaches the same answer through `promote`. R19's mark struck. Commit 3b8594cbc1.
- N318: `CATALOG_VERSION` 1.42.0 -> 1.43.0 (`gate.mjs`). I diffed every exported row table between f955769afc and `tranche/T13` after record-core (K430) and membership merged, and checked the stamp list row by row. Every row the list names is in the stamp. The note above the constant names each arrival, departure, rename and move.
- N319: `ROW_CENSUS` = `{version: "1.43.0", rows: 820, digest: "f01ed42a484a4aa3d36f9f89a36d832603dd46cb36a10333303907421176371d"}`, frozen, beside the version. It is computed as R50 now words it (K431; my J1). The same figure comes out whether every product file is imported or only files that literally hold a `check: 'C-…'` row. R34's and R50's marks struck; tests pin R50's shape and `version === CATALOG_VERSION`.

**Check rows this stamp takes (N318), beyond or unlike the list.**
- C-100.20 NOT_A_DISPOSITION is not new: it has been in progressions' table since T5. T12 changed its `where` (to `notADisposition`) and its translation. Stamped as wording.
- C-33.44 CLASS_NOT_DISPOSED's translation was reworded when it moved to queue ("a FINDING" -> "something the record NOTICED"). The list names it only as moved. Stamped.
- C-96.1: membership's copy has the same code and translation as the catalogue's; only the `where` differs. It counts twice in the census.
- No row this job added, moved or retired: promotion's own tables are unchanged.

**Awaiting stamp (for T14's promotion):** review's C-87.12 retiring (layer 8) and control-plane's C-69.4 STORE_INTERNAL_ERROR (layer 11), as the list says. Any other row change after this commit moves the census and must be named by its job.

**Found in other modules (REPORT J2).**
- legacy-tests: `test/d470-catalog-census.test.mjs` needs its 1.43.0 row: `"1.43.0": { count: 359, digest: "b28a8a91387ef629dab08baa025b766015f33d6a0a71eda9f392d0d6de2d2605", source: "3a8dae6c959d33b5f83e18dc592c0ccb5b77ecddf1adcd5f8b71c2047dca2a40" }`. It is red on A3 and A5 until then. Its census suite (R50) pins 820 / f01ed42a… at 1.43.0.
- legacy-ui / legacy-tests: `civicos-ui/check-refusal-codes.mjs`:3781 declares MINT_EXHAUSTED multi-site from review's C-87.12. Promotion's site now answers through record-core's C-59.6 with a translation, so the guard's untranslated and multi-site counts may move. That guard is legacy-tests'.
- Generated artifacts made stale by `gate.mjs` and `promotion/index.mjs`: `agent-worker/dist/agent-worker.bundled.mjs` and `bio-plane/dist/bio-plane.bundled.mjs`. Reported, not rebuilt.

**Deferred.** Nothing.

**Tests and checks.**
- `node --test bio-plane/test/m/promotion/`: tests 69, pass 69, fail 0, todo 0.
- Legacy suites reading the stamp: `test/ratify.test.mjs` pass, `test/conformance.test.mjs` pass; `test/d470-catalog-census.test.mjs` 12 pass, 2 fail (A3, A5: the re-pin above).
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture promotion`: 16 product files, 59 relative imports; 0 failures. `coverage promotion`: 50 of 50 live requirement ids named by a test; 0 failures. `ownership promotion tranche/T13`: 4 files; legacy-checks and legacy-store 0 lines; 1 failure, `build/requirements/promotion.md`: the three `not yet met` marks struck as START asked (K395's precedent).

Size (session_01JwRGiAAQuCSCteSnVJeMBi): test runs 7, module lines 37

## J2 · REPORT

For other modules (details in my record's Completion):
1. legacy-tests: d470-catalog-census needs its 1.43.0 row: count 359, digest b28a8a91387ef629dab08baa025b766015f33d6a0a71eda9f392d0d6de2d2605, source 3a8dae6c959d33b5f83e18dc592c0ccb5b77ecddf1adcd5f8b71c2047dca2a40. It fails A3 and A5 until then. Its R50 census suite pins 820 rows, digest f01ed42a484a4aa3d36f9f89a36d832603dd46cb36a10333303907421176371d, at 1.43.0.
2. legacy-tests: civicos-ui/check-refusal-codes.mjs:3781 declares MINT_EXHAUSTED multi-site from review's C-87.12. Promotion's site now answers through record-core's C-59.6, with a translation, so that guard's counts may move.
3. Stale generated artifacts: agent-worker/dist/agent-worker.bundled.mjs and bio-plane/dist/bio-plane.bundled.mjs (gate.mjs, promotion/index.mjs). Reported, not rebuilt.
4. The stamp list, against the diff: C-100.20 is not new. It dates from T5; T12 changed its where and translation. C-33.44's translation was reworded on its move to queue, which the list does not name. Both are stamped.

## J3 · COMPLETE

N322, N318 and N319 applied on job/T13/promotion (54abd9a659 and after). R19 answers MINT_EXHAUSTED through record-core's mintExhausted. CATALOG_VERSION is 1.43.0, stamping every row change since 1.42.0 (the list, plus C-59.6, C-96.1 held twice, C-100.20 and C-33.44 wording). ROW_CENSUS is {1.43.0, 820, f01ed42a…}. Promotion tests 69/0. format, architecture and coverage (50/50): 0 failures. ownership: 1, the three requirement marks struck as START asked. Re-pins and stale bundles are in J3.
