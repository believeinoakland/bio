# BOB to plane (T39)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 11, plane: T39-20. Read also K2346, K2377, K2381, K2383 (their lines in `build/rulings.md`) and `build/plan/draft-T39-L11-shares.md` §1–§3 (plane), which cites every source by file and line.
Your requirements: `build/requirements/plane.md` (read whole). R7 and R18 each gain a T39 clause marked `*(not yet met: T39)*`.
1. `test/m/plane/docket.test.mjs`:14, :54: case-carriage's purge-cleared tables are `[...CASE_CARRIAGE_MARK_TABLES, ...CASE_CARRIAGE_DOCUMENT_TABLES]` (the accepted red, K2377).
2. R7 (N810): `pdfjs-dist` 4.10.38, exact, in `bio-plane/package.json`'s `devDependencies`, the lock regenerated; `worker.test.mjs`'s R7 test asserts an exact version; confirm `test/m/doc-clean/oracles.test.mjs`'s pdf.js test now runs rather than skipping.
3. R18 (T39 clause): no code change is expected (the wiring stands, draft §3 item 3); add two tests in `disclosures.test.mjs` (or a new `t39.test.mjs`): (a) after construction a non-fetch receipt queues its capture in `document_copy_queue` and a `direct` receipt queues nothing; (b) with `CAPTURES` bound and a member PDF queued, one `onAlarm` answers `doccopy` with `copied: 1` and the copy lies under `<namespace>/obscured/<sha>`.
You merge last in L11: when BOB tells you (CHANGE) that the other L11 jobs have merged, merge the tranche and re-run your whole suite.
Reading set (mechanics §17): measure it first; over 300 KB, apply §17 step (3) (K2304).
Merge order in L11: queue, setup-words, instance-setup, answer-envelope, plane last.
Inherited reds: the plan's rule 3 list as it stands at your START (read it there); coverage reads setup-words R1–R4 red until T39-16a merges.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
