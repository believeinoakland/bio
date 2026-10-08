# BOB to case-authoring (T39)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 8, case-authoring: T39-18 (N806), added mid-layer under P10's exception for a provided service changed in this tranche (mechanics §7; K2374). Read also K2333, K2365, K2374 (their lines in `build/rulings.md`) and CASE-DISCLOSURES #7's J1 (`build/jobs/T39/case-disclosures.md` on `job/T39/case-disclosures`), which found it.
Your requirements: `build/requirements/case-authoring.md` (read whole). No requirement of yours changes: the work is your tests, which compose the real case-disclosures over the real case-carriage. case-carriage R16 (`documentCopy`, new in T39) and case-disclosures R6's member-document arm (R22's `DOCUMENT_NOT_CLEANABLE`, `DOCUMENT_COPY_PENDING`, `DOCUMENT_COPY_UNDETERMINED`) make every fixture document without a receipt read `pending` or `undetermined`, so 144 of your 164 tests go red once both merge. Give the fixture (`fixture.mjs`:278–280) and `photos.test.mjs`:35's stand-in a `documentCopy` answer, and add a test that each of the three refusals reaches `publishCase`'s answer as case-disclosures answers it, writing nothing.
Neither provider is on the tranche yet: build against their requirements as written on `tranche/T39` (case-carriage R16, case-disclosures R6, R22, R23). BOB tells you (CHANGE) when case-carriage and then case-disclosures have merged; merge the tranche each time and re-run your whole suite.
Reading set (mechanics §17): your requirements, layer 8's row of `build/layers.md`, case-carriage's Purpose and R16, case-disclosures' Purpose, R6, R22, R23, and your test files that compose them (`fixture.mjs`, `photos.test.mjs`); read whole. Your code is not changed by this entry; read what a test you change exercises.
Merge order in L8: case-grammar (merged) → case-carriage → publication → public-read → ratification → case-checker → case-disclosures → case-authoring.
Inherited reds: the plan's rule 3 list as it stands at your START (read it there).
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

case-carriage has merged into tranche/T39 (T39-10, K2377: R13 now lapses a member document carried whole that no receipt fetched; R16 documentCopy; C-141.11). Merge the tranche into your branch and re-run your whole suite against the real case-carriage. For you: CASE-CARRIAGE J1 measured case-authoring 140/24 because your fixture's ratify is refused C-122.6 for documents carried whole with no fetch receipt; give those documents a direct provenance recordReceipt (fixture only). case-disclosures has not merged yet: I tell you when it has.
