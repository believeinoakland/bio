# case-checker (T35)

**Status** · session_014x9ruBn6FrdPiY5Dafkq2k · depth 2 · WORKING · handled B2

## J1 · QUESTION

R21 (`checkStandardsUse`): four points the requirement leaves open. I am building on the readings below and will not stop for the answer unless you change one.

1. **Which criteria rows are a finding's.** `publication` R72's rows carry no finding (one row per distinct `(standard, portion)`). My reading: a member finding's rows are those whose `standard` is the `target` of one of that finding's own legs of kind `standard` in the document's signed `grading_facts:` block (`case-grammar` R17), read from `text`. Only direct legs of a member (`case_findings`), as R72 counts them. A member with no judged row is not judged under `BENCHMARK_CALLED_NONCONFORMING` (an empty "all binds: false" is not a benchmark).
2. **"Conclusion or claim, as the document states it" and "the case's statement".** My reading: per member, its `case_conclusions:` row's `claim` and `claim_detail` (the writer is `ratification`'s `caseConclusionRowLines`); the case's statement is the document's `case_scope` and its `completeness:` `statement` (the authored sentences `case-authoring` names `statement`). The body is not read: it prints quoted passages, and a standard's own text may say "violation".
3. **`COPYRIGHTED_PASSAGE_UNRELIED`.** My reading: for each judged row whose `access` is not `free` (null or `undetermined` included), the passages quoted of it are its R72 `passages` (each `content`) and every `passages` argument row whose `capture_sha` is one of the row's `captures`. Each is relied on only when some `passages` row with that `content_id` names a `finding`. One refusal per (standard, content).
4. **The answer's shape.** `{ok: true}` or `{ok: false, refusals}`, and `unjudged: [{standard, portion}]` added only when a row has `stated: "not held"`. Refusals in a fixed order (malformed fields first, then each arm in the order R21 lists them, each in input order), deduplicated. The word list is matched exactly as R21 lists it (so "violations" and "violate" are not matched; the list is yours to grow, K1723).

Code: `bio-plane/src/case-checker/standards.mjs`, exported from the module's index. It is not part of the standalone program (R13 names R1–R11 and R20), so it does not by itself stale `program.mjs`; I will report what the program test says.
