# publication (T45)

**Status** · session_01TsVxkir8obAQa6bT3By5Yw · depth 2 · COMPLETE · handled B2

## Record

**Entries applied** (T45-17; N893):
- **R78**: `commitCaseEdition` refuses `COUNSEL_MATTER_NOT_PUBLISHED` (C-122.8, a new row of this module's C-122 family, in `CASE_SOURCES_CHECKS` under that key, per B2/K2830; translation BOB's draft, verbatim) when `project-roster.projectScope` (its R23) answers `counsel_matter` for the case's owning project (the `cases` row, else the signed `project`) or for the project a member finding was committed with. It answers `project` (the owning project when it is the counsel matter, else null) and `findings` (each such member, at most 200). It never names another project, since the signer may not see it. Placement: after `MALFORMED`, the absent-document answer, the already-signed retry/`CASE_EDITION_ALREADY_RATIFIED` and `CASE_PRODUCTION_DIVERGED` (R22's own), and before R58, R51, R57 and R59. So an edition already signed answers its retry `existed: true` whatever its project's scope is now (R24; project-roster R21). Each project is asked once per commit. The `roster` dep is reached lazily as `projectRosterOf(host)` unless given.
  - Reading (mine, no question raised): "the project a member finding was committed with" is the top-level `project:` of the member's **pinned bytes** (promotion R53's field). When those bytes cannot be read, it is record-core's `bundleInfo().project`. A scope read that throws is read as R23's `none`, as promotion R57 reads it; project-roster's R23 never throws.
  - Export: the row is in `CASE_SOURCES_CHECKS` (re-exported from `index.mjs`, as before), and `rowOf` is also re-exported from `index.mjs` as `publicationRowOf`. `case-authoring` R72 and `docket` R28 read it by code from either, holding no copy.
- **R40**: wording only (case-check joins the readers). A T45 test drives case-check's reads: a replaced preparation moves `case_documents.doc_sha`, and `published_cases.ratified_at` (with `cases.project_id` and the pins) is set once every member is published.

**Read whole:** `build/requirements/publication.md`; `src/publication/index.mjs`, `checks.mjs`, `schema.mjs`, `door.mjs`, `src/deliverer.mjs`; `test/m/publication/fixture.mjs`, `invariants.test.mjs` (the R33 test), `t39.test.mjs`; the plan entry, the reconciliation's R4 and R8, `draft-T45-l8.md` §1, `draft-T45-lower.md` §1.3, K2780/K2781/K2787; `project-roster` R21–R23 and its `projectScope`/`projectScopeSet` code; `promotion`'s R57 site (the pattern); `case-check` R1–R3 (its Provides); `case-authoring` R72; `docket` R28.
**Reading set** (1,286 KB, over the 600 KB limit). One helper in this session read the remaining test files and `worker.mjs` whole: `casedoc`, `cases`, the six `convert-*`, `door`, `invariants`, `published`, `relation`, `seams`, `services`, `sources`, `t28`, `t33`–`t41` and `worker.mjs` (833). It reported flaws and every test the new refusal could change. The used modules' public parts beyond those named above were not re-read: this job uses no new service of theirs but `project-roster` R23, which I read.

**Flaws fixed in this module (P8):**
- `door.test.mjs` and `convert-mk6-bundle-names-no-author.test.mjs` named the retired R6 and R17 as live in titles and headers. They now name `case-tensions` R3/R5 (was R6/R17).
- `t41.test.mjs`'s header said R77 has "two doors"; it has three (K2529).
- R40's contract test omitted `signed_at`, `published_at` and `criteria` from `published_cases`. It now checks them, and a later module's SQL reading them.
- `worker.mjs`: no dead code (helper's reading); it is `public-read`'s by its header (K697, K702).

**Deferred:** none.

**Another module / generated artifacts:** the plane bundle and `program.mjs` are staled by this merge (rule 4 item 5, regenerated at the layer's close). Nothing found against another module's requirements.

**Tests and checks run:**
- `node --test bio-plane/test/m/publication/`: pass 141, fail 0 (1 todo, R30/D-246).
- Users and neighbours: answer-envelope 31/0, promotion 137/0, ratification 233/0, case-authoring 185/0, publish-schedule 22/0, docket 59/0, public-read 158/0, conformance 89/0, review 46/0, network-notices 73/0, case-disclosures 95/0, case-tensions 23/0, case-carriage 70/0, project-roster 38/0.
- Accepted reds only (rule 4): affordances 2 (items 11, 12; same failures with my change stashed), op-declarations 1 (item 12; same with my change stashed), plane 2 (items 9, 11).
- `format`: 0 failures. `architecture`: 0 failures. `coverage`: 48 of 48 live ids named, 0 failures. `ownership`: 0 failures (re-run after this commit below).

Size (session_01TsVxkir8obAQa6bT3By5Yw): test runs 6, module lines 4465

## J1 · COMPLETE

T45-17 done; record build/jobs/T45/publication.md. R78: commitCaseEdition refuses COUNSEL_MATTER_NOT_PUBLISHED (C-122.8, in CASE_SOURCES_CHECKS under that key as B2/K2830 asks; rowOf also exported from index.mjs as publicationRowOf) for the owning project or any member's committed project (its pinned bytes' project:) at counsel_matter. The check runs after R22's own MALFORMED/retry/CASE_PRODUCTION_DIVERGED and before R58, R51, R57, R59. A signed edition's retry still answers existed. R40 tested for case-check's reads. Stale R6/R17 test titles and R40's missing columns fixed. Publication tests 141/0. Users' tests show only rule-4 accepted reds. format, architecture, coverage and ownership: 0 failures. Plane bundle staled (rule 4 item 5). No new files outside paths.
