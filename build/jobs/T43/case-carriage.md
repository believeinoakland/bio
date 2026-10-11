# case-carriage (T43)

**Status** · session_01PxDxPr7SJLCkDhtDDmxDB8 · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T43-16 done on `job/T43/case-carriage`: one commit over `tranche/T43` (5451a89dd3), tests only. No source file was changed, so no generated artifact went stale.

Entry applied:
- `test/m/case-carriage/fixture.mjs`:33 now hands `sources` `doorbell: {pulledKnocksOf}` instead of `capture: {…}`.
- Since T42-8, `sourcesOf` reads only `deps.doorbell`. The old key was ignored, so the real doorbell answered with no knocks, and every `w.knock` was refused `NO_SUCH_SOURCE`.
- The fixture's three comments now cite the doorbell, not capture: `pulledKnocksOf` is doorbell R18 and the pull is doorbell R13.
- Citation note: the START cites "doorbell R12" for `pulledKnocksOf`. R12 is the fingerprint key; the read is R18 (doorbell.md:63).

The five reds are cleared: `invariants`:66 and `rereads`:149, 167, 195, 212 now pass.
- No assertion was lost. Only the fixture changed, and the diff touches only the dependency key and comments.
- All five tests still drive the real `sources` through `w.knock`, with their negative controls intact.

Nothing is deferred from the entry. One improvement in my own module is deferred: `src/case-carriage/index.mjs` imports `membership/index.mjs` twice (lines 55 and 61).
- It is cosmetic. Merging the two imports would change a source file in a tests-only entry and stale the plane bundle, so I left it for the module's next job that changes source.

Found in other modules (requirement wording only, BOB's):
- `provenance` R15 still names `capture.pullKnock` (its R65) as a receipt writer.
- `acquisition` R16 still names "capture R65's arm" for `source`/`knocker_note`.
- Both are now doorbell R13 (K2624's re-pointing did not reach them).

Reading set (mechanics §17, K2032):
- I read whole: my requirements, `src/case-carriage/` (index, schema, checks) and all nine files under `test/m/case-carriage/`.
- A helper agent in this session read in full the public parts of every used module, plus doorbell and capture. It wrote a digest citing each statement's section, which agreed with my reading of `src/sources/index.mjs`:103–196. The sources stay binding.
- I also read: the plan's T43-16 and T43-12 entries, rule 4 (9), (10) and (12), and K2704.

Tests:
- `node --test bio-plane/test/m/case-carriage/*.test.mjs`: 70 tests, 70 pass, 0 fail. Before the fix: 65 pass, 5 fail, the five above.
- No layer tests are named in the manifest.

Users' tests (on this branch). Every red is one rule 4 already accepts; none is case-carriage's:
- publication: 135 tests, 134 pass, 0 fail, 1 todo (R30, D-246).
- public-read: 158/0.
- scheduler: 129/0.
- plane (with `migrate-released`): 185/0.
- case-disclosures: 91 pass, 4 fail. Rule 4 (12), its `fixture.mjs`:260 until T43-22:
  - three fail with "no such table: inbox";
  - `carries`:139 fails "no new table" (159 against 153: doorbell's six tables created mid-test).
- case-authoring: 180 pass, 4 fail. Rule 4 (12), its fixture (`fixture.mjs`:444, "no such table: inbox"; the same "no new table" arm) until T43-12.
- affordances: 231 pass, 1 fail. `t36`:55, rule 4 (10) until T43-17.
- op-declarations: 125 pass, 8 fail. `t34`:68, 145, 307; `t37`:105, 177, 218; `t38`:76, 87. Rule 4 (10) until T43-18.
- answer-envelope: 25 pass, 5 fail. `catalogue-end`:17, `envelope`:63, `families`:49, 377, 424. Each misses doorbell's `DOORBELL_CHECKS` and `KNOCK_CHECKS`; rule 4 (9) until T43-14.
  - `families`:424 is the test named for case-carriage's C-141 place, but its red is the doorbell family, not C-141.
- control-plane: 222 pass, 1 fail. `envelope`:391, rule 4 (12) until T43-23.

Checks (process repository):
- format: 147 modules, 146 requirements files; 0 failures.
- architecture: 12 product files, 59 relative imports; 0 failures.
- coverage: 18 of 18 live requirement ids named by a test; 0 failures.
- ownership: 2 files changed by case-carriage between tranche/T43 and HEAD (the fixture and this record); 0 failures.

Size (session_01PxDxPr7SJLCkDhtDDmxDB8): test runs 6, module lines 3931
