# publication (T37)

**Status** · session_01KcUELzqiEGNBwSvB87rKcf · depth 2 · WORKING · handled B2

## Record

**Entries applied (T37-18).** R72: each criteria row frozen at the commit carries `captures`, the SHA-256 of each capture holding one of its passages (`content`'s R45 read contract, one bound JSON list through `json_each`, never one variable per id) that the edition's `materials:` block lists `included: true`, each once in the order first met; a row `stated: "not held"` carries `null`; rows frozen before T37 are answered as frozen (`publication/index.mjs` `#withCaptures`). `criteriaFor` (R75) is unchanged and states no captures; the commit's rows are its rows plus `captures` (J1, answered B2, K2222). R57/R33: after R51 and before R59 the commit asks `case-carriage.marksLapsed(fm)`; any row is `PHOTO_MARKS_CHANGED_SINCE` (C-122.6, new in `checks.mjs`, BOB's draft translation, awaiting its stamp) naming `photos: [{ref, sha, why}]` (at most 200), nothing committed; an answer that is not a list is read as unreadable marks and refuses (fail closed). R57's `held: "derived"` copy needs nothing here: `holdMaterials`' items are registered as they come and ratification R39 copies them.

**Tests** (`bio-plane/test/m/publication/t37.test.mjs`, new, 8 tests): R72 a non-free standard's capture the edition does not carry is never stated, nor any withheld digest; order and once; frozen; none carried; not held → null; commit rows = R75's rows + captures; pre-T37 rows answered as frozen and never filled; unreadable `content` states none; 150 passages under workerd's ~100-variable limit. R33 C-122.6's row. R57 the refusal (shape, front matter asked, nothing committed, at most 200, none lapsed commits), the order R51 → R57 → R59, fail closed on a non-list answer. Amended to the new shape: `invariants.test.mjs` (R33's table holds C-122.1–.6), `t35.test.mjs` (R72 rows carry `captures`; R75 compares the commit's rows with `captures` set aside).

**First runs (superseded below).** `case-carriage.marksLapsed` (T37-34) is not on `tranche/T37` yet, so the module's tests ran with a local preload adding `marksLapsed = () => []` when absent (scratchpad only, never committed): `test/m/publication/` 130 tests, 129 pass, 0 fail, 1 todo (R30, D-246). Users, before and after my change, same preload: public-read 146/0, ratification 213/0, case-authoring 158/0, case-checker 52/0 fail, unchanged. Re-run without the preload once T37-34 is merged into the tranche and this branch. Checks: format 0 failures (136 modules); architecture 0 failures; coverage 51 of 51 live ids; ownership 0 failures.

**Reading (mechanics §17).** Set over 300 KB. Read whole myself: `build/requirements/publication.md`; layer 8's row of `build/layers.md`; `checks.mjs`; `index.mjs` 1–140 and 860–1140 (`commitCaseEdition`, `#criteriaOf`, `#criterion`, `criteriaFor`); `t35.test.mjs`; `fixture.mjs` 100–342; `case-carriage` R1, R11, R13 and its `holdMaterials` (100–125) and factory; `content`'s Purpose and R45; `case-authoring/index.mjs` 1115–1145; DEC-180; K2129, K2140, K2206; the plan's rules. A worker read the rest of the code (`deliverer.mjs`, `door.mjs`, `schedule.mjs`, `schema.mjs`, the rest of `index.mjs`) and every other test whole (about 560 KB) and wrote a 15 KB summary citing file and line: the criteria's readers (`caseEditionState`, public-read's pass-through and `casefile.mjs`:129, case-checker `standards.mjs`:67–102 already reading `captures`), the tests the change breaks, the stubbing pattern. It found the one flaw that mattered: my first draft bound up to 500 variables (workerd refuses about 100; D-390), which would have frozen `captures: []` silently; fixed with `json_each` and tested. Nothing it left out mattered.

**B3 (CHANGE, K2226).** Merged `tranche/T37` @ 50f65ce6ac (case-carriage T37-34 in); the local preload dropped. The factory's `caseCarriage` getter forwards `bucket` and `store` from this module's deps when given, as it forwards `sources` (case-carriage R11's obscured copy; the plane passes them, T37-48); the fixture's `world({carriage})` passes them and a test (`t37.test.mjs`, R57 K2226) shows case-carriage receives both, and none without.

**Final runs, no preload.** `test/m/publication/` 131 tests, 130 pass, 0 fail, 1 todo (R30, D-246). Users: case-carriage 48/0 fail, public-read 146/0, ratification 213/0, review 38/0; case-authoring 157 pass 1 fail (R55 `materials:`), case-checker 47/5 (R13 `program.mjs`, red 18; R14/R20 specifications; R22 `/2`), case-disclosures 58/1 (R6, R7 `materialsJudged`): each the same failing set on `tranche/T37` @ 50f65ce6ac without my change (compared by test name), so inherited from the L8 merges before mine and owned by those jobs' entries later in the order; none from this change. Checks: format 0 failures; architecture 0 failures (27 files); coverage 51 of 51; ownership 0 failures (7 files).

**Deferred.** None. Noted in my own module, not changed: a stored `criteria` that is not JSON reads as null without `criteria_detail` (never written so; the commit writes `JSON.stringify`).

**Other modules.** None found. `captures` reaches the published case file through public-read `casefile.mjs`:129 as intended (public-read R31, R33).

**Size.** publication 3,791 lines (`deliverer.mjs` and `publication/` without `worker.mjs`), up 60 from 3,731; under about 4,000.

Size (session_01KcUELzqiEGNBwSvB87rKcf): test runs 6, module lines 3791

## J1 · QUESTION

R72's `captures` and R75 `criteriaFor`. R75 says its rows are "exactly as R72 composes it" and that the commit records the rows it answers; R72's new `captures` depends on the edition's `materials:` block, which `criteriaFor({members, signer, at})` does not receive (case-authoring R61 computes its own unfiltered captures from `content`).
My reading, which I am building on: `criteriaFor` answers its rows unchanged (no `captures` key); the commit's rows are exactly `criteriaFor`'s plus `captures` (filtered by the edition's `included: true` materials; `null` on a "not held" row). R75's existing test compares the commit's rows with `captures` set aside. No change to R75's text needed unless you want it stated.
Also: the refusal names the lapsed rows as `photos: [{ref, sha, why}]` (at most 200), beside `reason`, `code`, `check`, `translation`, `caseId`, `edition`, `detail`, as R51/R59 name theirs.

## J2 · REPORT

T37-18's change is written and pushed (record above): R72 captures, R57's PHOTO_MARKS_CHANGED_SINCE (C-122.6), tests named, 4 checks clean, size 3,786. One thing holds COMPLETE: case-carriage's marksLapsed (T37-34) is not on tranche/T37, so every commit on this branch alone calls a missing method; my green run (publication 129/0, users unchanged) used a local preload standing in for it. When T37-34 is merged into tranche/T37, tell me (CHANGE: merge the tranche) and I merge, re-run without the preload, and post COMPLETE.
