# answers (T45)

**Status** · session_01CrAcgf8n8zLRp3FbAHLxbA · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**T45-14 applied on `job/T45/answers` (a847060c16, 8ee1fba8c4).** R34 met.

**How the reading set was read (mechanics §17; START's 794 KB):** I read in full my requirements (`build/requirements/answers.md`), every file of my code (`src/answers/`, 10 files), `fixture.mjs` and `standing.test.mjs`, plan T45-14, rule 4, reconciliation R9–R12, rulings K2780, K2781 and K2787, `BIO_Action_v0_2.md` rule 17, and `draft-T45-upper.md`'s following R22–R26 and Uses (:45–82). One helper agent in this session read the rest whole and wrote me a digest that cites each section. It covered the eight other test files; `following.md`'s Purpose and Provides (R22–R26); every requirements mention of `standingendset`, `STANDING_ENDED` and `standingQuestionEndSet` (op-declarations R49, op-grades R32, scheduler R23); and the files and tests outside my module that enumerate answers' ops or rows. Nothing in the digest disagrees with what I built.

**Entries applied**
- **R34** `standingQuestionEndSet({id, ends, author})`, `op=standingendset` (`ops.mjs`; the author is the query's `viewer` stamp, `ends` comes from the body). Refusals in this order, each writing nothing:
  1. `MACHINE_CANNOT_AUTHOR`.
  2. `NO_SUCH_STANDING_QUESTION`, given alike for an absent question, another member's, and an administrator's.
  3. `STANDING_ENDED`, new row C-135.16 (`standing.mjs standingQuestionEndSet > is-standing-open`), for a question ended by its author or past its end date. The date case is detected without writing the self-ending.
  4. `STANDING_NEEDS_END` (R15's rule, through the same local day).

  An equal end answers `unchanged: true` and writes nothing. A change answers `{ok, id, ends, was}`. Each earlier end is kept in a new column, `standing_questions.ends_changes_json` (`[{ends, was, at, by}]`, migrated like `find_json`). It is read as `ends_changes` on `standingQuestionRead` and `standingQuestionsOf`, so only the author sees it. R16's end-by-date and R17's due and wake read the column `ends`, so they follow the change. R27 is told `{question, due}`: due is the held next day, or today when the question has not run, or null when that day falls after the new end. No model, account or grant is involved.
- **Tests:** a new file, `test/m/answers/endset.test.mjs`, holds 5 tests, each named R34. They cover the refusal order with a control for each, both ended cases, writes-nothing snapshots, unchanged, the change history and its sight, no credentials touched for a member no account serves, moved-later and moved-earlier ends against the tick and the wake, R27 inside an outer committed or rolled-back transaction (standing for following R25's act), and the op route. `words.test.mjs` (R29) now sweeps R34's four refusals.

**Also fixed (my module, P8)**
- R27 said "after the act's transaction", but `tellStanding` told listeners at once. Inside another module's act (following R25's `stop` through `standingQuestionEnd`) it would tell before the commit, and also when the act rolled back. It now goes through `record.afterCommit` (record-core R66), and falls back to at once when there is no `afterCommit`. `standingQuestionEnd`'s write now runs in `transact`.

**Deferred:** nothing.

**Found in other modules (the new op `standingendset`)**
- **op-declarations (R49, T45-45):** `standingendset: "own"` is owed in answers' family (`index.mjs`:258, actor `QUERY("viewer")`). `test/m/op-declarations/t33.test.mjs` "R19, R6" is already red on `tranche/T45` (`duties: dutyfromresponse has no spec`, rule 4 (12)). Once duties is declared it will stop on `answers: standingendset has no spec` until T45-45.
- **affordances (T45-39):** `test/m/affordances/t33.test.mjs` "R12" pins answers' map (:84–86). That test is already red on the base; it needs `standingendset: "caller-owned"` in `writes`, and act help (`act-help.mjs`).
- **op-grades (R32, T45-38):** `standingendset` belongs in `RUNG_ABSENT`, with ground `caller-owned`.
- **promotion row census:** the new row C-135.16 is red under rule 4 (2) until T46's stamp.
- Plane routes `standingendset` through its spread of `answersOps` (`store.mjs`:676): plane `t33.test.mjs` passes 16 of 16.
- **following (T45-36):** R25's `keep` calls `standingQuestionEndSet({id, ends: until, author})` and gets answers' refusal unchanged. A committed outer act tells scheduler after its commit; a rolled-back one tells no one.

**Tests**
- answers: 63 pass, 0 fail.
- Users: scheduler 129 pass, 0 fail; plane `t33` 16 pass, 0 fail; answer-envelope `families` 16 pass, 0 fail. affordances `t33` and op-declarations `t33` each have 1 fail, and both are red on `tranche/T45` too (above).

**Checks** (from civicos-process)
- format: 153 modules, 152 requirements files; 0 failures.
- architecture . answers: 21 product files, 68 relative imports; 0 failures.
- coverage . answers: 34 of 34 live requirement ids named by a test; 0 failures.
- ownership . answers tranche/T45: 8 files changed; 0 failures.

Size (session_01CrAcgf8n8zLRp3FbAHLxbA): test runs 7, module lines 1894
