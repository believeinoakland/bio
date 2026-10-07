# case-checker (T35)

**Status** · session_014x9ruBn6FrdPiY5Dafkq2k · depth 2 · WORKING · handled B2

## J1 · QUESTION

R21 (`checkStandardsUse`): four points the requirement leaves open. I am building on the readings below and will not stop for the answer unless you change one.

1. **Which criteria rows are a finding's.** `publication` R72's rows carry no finding (one row per distinct `(standard, portion)`). My reading: a member finding's rows are those whose `standard` is the `target` of one of that finding's own legs of kind `standard` in the document's signed `grading_facts:` block (`case-grammar` R17), read from `text`. Only direct legs of a member (`case_findings`), as R72 counts them. A member with no judged row is not judged under `BENCHMARK_CALLED_NONCONFORMING` (an empty "all binds: false" is not a benchmark).
2. **"Conclusion or claim, as the document states it" and "the case's statement".** My reading: per member, its `case_conclusions:` row's `claim` and `claim_detail` (the writer is `ratification`'s `caseConclusionRowLines`); the case's statement is the document's `case_scope` and its `completeness:` `statement` (the authored sentences `case-authoring` names `statement`). The body is not read: it prints quoted passages, and a standard's own text may say "violation".
3. **`COPYRIGHTED_PASSAGE_UNRELIED`.** My reading: for each judged row whose `access` is not `free` (null or `undetermined` included), the passages quoted of it are its R72 `passages` (each `content`) and every `passages` argument row whose `capture_sha` is one of the row's `captures`. Each is relied on only when some `passages` row with that `content_id` names a `finding`. One refusal per (standard, content).
4. **The answer's shape.** `{ok: true}` or `{ok: false, refusals}`, and `unjudged: [{standard, portion}]` added only when a row has `stated: "not held"`. Refusals in a fixed order (malformed fields first, then each arm in the order R21 lists them, each in input order), deduplicated. The word list is matched exactly as R21 lists it (so "violations" and "violate" are not matched; the list is yours to grow, K1723).

Code: `bio-plane/src/case-checker/standards.mjs`, exported from the module's index. It is not part of the standalone program (R13 names R1–R11 and R20), so it does not by itself stale `program.mjs`; I will report what the program test says.

## Completion

**Entries applied.** T35-58 (N648; K1723, K1739, K1740): R21 `checkStandardsUse({text, criteria, materials, passages})` in `bio-plane/src/case-checker/standards.mjs`, exported from the module's index with `STANDARDS_USE_CODES` and `NONCONFORMING_WORDS`. It refuses by name `COPYRIGHTED_TEXT_CARRIED`, `COPYRIGHTED_PASSAGE_UNRELIED` and `BENCHMARK_CALLED_NONCONFORMING`, every departure in the order the arms are listed, each once; a row `stated: "not held"` is not judged and is named in `unjudged` (`{standard, portion, body}`); malformed arguments answer `MALFORMED` naming each field; pure, never throws. Built on J1's four readings as B2 (K2002) answered them, with R72's body key: a member's rows are those of its own `standard` legs' standards (signed `grading_facts:`) whose `body` is the member's `subject_entity` as the document states it, all rows of the standard when it states none.

**Deferred.** None in this module. R21's caller with the record (`case-authoring`'s pre-flight) is N717, not this tranche; `checkCaseFile` does not run R21 (no criteria kind in the case file, `case-grammar` R13), as the requirement's Suggestions say.

**Generated artifact.** `program.mjs` is not stale: R21 is not part of the standalone program (R13 names R1–R11 and R20), and the R13 test ("the committed program.mjs is that build") passes on this branch after merging `tranche/T35`. Nothing for BOB to regenerate for this job.

**Found in another module.** No writer of the case document states a member finding's `subject_entity` (`case-authoring`'s document, `case-grammar`'s blocks), so K2002's body key cannot narrow a member's criteria rows in any document written today: R21 then reads every row of the standard (a member is judged a benchmark's only when every body's row is `binds: false`). R21 reads it from the member's `case_roles:` or `case_conclusions:` row when present. Reported as J2.

**Tests and checks.**
- `node --test bio-plane/test/m/case-checker/`: tests 44, pass 44, fail 0 (R21: 9 tests in `standards.test.mjs`).
- Layer tests: none named in `build/manifest.md`. No service another module uses changed.
- `node checks/format.mjs`: 130 modules, 129 requirements files; 0 failures.
- `node checks/architecture.mjs … case-checker`: 14 product files, 55 relative imports; 0 failures.
- `node checks/coverage.mjs … case-checker`: 21 of 21 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … case-checker tranche/T35`: 4 files changed; 0 failures.

Size (session_014x9ruBn6FrdPiY5Dafkq2k): test runs 7, module lines 1265

## J2 · REPORT

Found in another module (case-authoring's case document; case-grammar's blocks): no writer of the case document states a member finding's subject_entity, so K2002's body key cannot narrow a member's criteria rows in any document written today. R21 then reads every row of the standard: a member is judged a benchmark's only when every body's row is binds: false, so a benchmark row beside a binding row for another body lets 'violated' pass. R21 reads subject_entity from the member's case_roles: or case_conclusions: row when present; stating it there (the member's subject_entity at its pinned bytes) is case-authoring's and case-grammar's, a format addition for N717 or later. Also: program.mjs is not stale (R21 is not in the standalone program; the R13 test passes after merging tranche/T35), so nothing to regenerate for this job.
