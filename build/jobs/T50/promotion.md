# promotion (T50)

**Status** · session_01EYfi6HexhiJUBBmLxaSMur · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

QUESTION J1. Plan rule 6 (N1116) applies to me though my entry says "Text: none". My best reading: promotion's member-facing English is its refusal rows' `translation` (and the `detail`s that say "your group's Civicsmith"), which `words-reads.json` lists as 38 `refusal.<CODE>` keys plus `promotion.says.document_request_stated` and `..._revision`. I will read each by `word(key)` from setup-words (rows in checks.mjs, the two `says` in index.mjs), drop the tests that compare the old English (wording.test.mjs and similar), and leave the 165 `unkeyed` builder-facing strings as they are. These rows move the census; I stamp them in my one stamp.
What I need from you: `build/modules.json` promotion `uses` has no `setup-words`, so the architecture check will refuse the import. Please add it (modules.json is yours). Also: promotion's own tests that compare English, and other modules' tests that quote promotion's old English ("your group's Civicsmith"), will go red; I will fix mine and list the others in my record for their jobs.
If you read the rule differently (rows keep their stub English, no change), say so and I revert. Meanwhile I carry on; the stamp waits for your CHANGE.

## J2 · REPORT

REPORT J2. Done on my best reading of J1 (pushed): the 38 refusal rows read `word("refusal.<CODE>")` (checks.mjs), the two carried-forward `says` read `promotion.says.*` (index.mjs), the gate's PLANE_HELD_IN_PARTS finding says "team's"; wording.test.mjs reads the keys instead of comparing English (+ a test for the two `says`). Promotion suite 140 tests, 139 pass; the 1 red is R39/R45/R46, which fails only on membership's hand-listed `MODULE_ORDER` (the test already reads build/modules.json, so it goes green when T50-2 merges). Architecture shows 3 failures, all "imports setup-words, which promotion does not declare in uses": please add `setup-words` to promotion's `uses` in modules.json. The stamp (1.76.0 -> next) waits for your CHANGE once membership, project-roster, ai-accounts and credentials have merged. I am idle until then.

## Completion record (T50-6; the mailed COMPLETE is below)

**Entries applied.**
- **N1116 / plan rule 6 (K3624).** The 38 refusal rows in `src/promotion/checks.mjs` read `word("refusal.<CODE>")`; the two carried-forward sentences in `index.mjs` read `promotion.says.document_request_stated` and `..._revision`; the gate's `PLANE_HELD_IN_PARTS` finding says "team's". `wording.test.mjs` reads the keys instead of comparing English (new tests for the 38 rows and the two `says`). The 165 `unkeyed` builder-facing strings stay. "labelled": none in the module. D29: the module draws no screen.
- **R39, R45, R46 (N1171).** The registry test already builds its expected order from `build/modules.json`; it was red only on membership's hand-listed `MODULE_ORDER` and is green with membership's generated order (merged). No hand list remains in this module's tests.
- **The stamp, 1.76.0 -> 1.77.0 (MINOR).** `ROW_CENSUS` = 1909 rows, sha256 962db2b0fc620f04b8edfe7ebf5e489543d0721b4b6638764dd2c7e7e024d766, over `tranche/T50` @ 2afc5d2b5a after ai-accounts, membership, credentials and project-roster. Against 1.76.0's own lines: 2 arrived (project-roster C-147.9 `MACHINE_CANNOT_SET_STAKE`, C-147.10 `STAKE_MALFORMED`), 68 changed (all translation; C-29 15, C-32 2, C-38 11, C-55 1, C-56 1, C-64 2, C-70 1, C-78 3, C-86 2, C-96 21, C-97 1, C-102 7, C-147.8 1), none retired. `gate.mjs`' note lists them by module. No family arrived and no composition change is named. Several changed rows (C-29.6-.10, .30, C-32.17, C-38, C-64.4, C-78) are R085's/T49's L3+ rows the census showed "changed with no record" before the stamp; the figures come from the tree.
- Snapshot `fixtures/row-census-1.77.0.jsonl` (1.76.0's renamed); the census suite's header and anchors re-anchored; `row-census.test.mjs`: 10 pass.

**Read.** Whole: requirements, my entry and plan rules, layer contract, `checks.mjs`, `wording.test.mjs`; `index.mjs` and `gate.mjs` the parts I changed; census suite parts changed. Other promotion tests run, not read.

**Other modules' tests quoting my old English:** none (searched `bio-plane/test` for every old row sentence; only promotion's own tests and the census fixture). `newgroup/src/release.mjs` and `newgroup/dist/` (the installer's generated release bundle) and the plane bundle and `program.mjs` carry the old code: stale, regenerated at the layer close.

**Deferred:** none. **Found in other modules:** none.

**For you (BOB's file):** `build/modules.json` promotion `tests` must name `bio-plane/test/fixtures/row-census-1.77.0.jsonl` in place of 1.76.0 (format and architecture each show that one failure until then; ownership shows 0). Requirements Status line is BOB's (R50's census is 1909 rows at 1.77.0; R39, R45, R46 met).

**Tests and checks.** promotion's 16 files plus d526: 140 tests, 140 pass. row-census 10 pass. L2 users: membership 266/266, project-roster 78/78, ai-accounts 114/114, credentials 160/160, record-core 181/181. run.mjs: format 1 failure and architecture 1 failure (the fixture, above); coverage 25 failures, none promotion's; ownership 0 failures.

Size (session_01EYfi6HexhiJUBBmLxaSMur): test runs 14, module lines 3957

## J3 · COMPLETE

COMPLETE J3: T50-6 done on job/T50/promotion: stamp 1.77.0, ROW_CENSUS 1909 rows 962db2b0... (2 arrived, 68 changed, 0 retired; ai-accounts' moves and L2's rows included); N1116 (38 refusal rows and the two says by key); R39/R45/R46 green from modules.json. Promotion + d526 140/140, census 10/10, L2 users green. For you: modules.json promotion tests -> row-census-1.77.0.jsonl. Stale: plane bundle, program.mjs, newgroup release (layer close). Details in build/jobs/T50/promotion.md.
