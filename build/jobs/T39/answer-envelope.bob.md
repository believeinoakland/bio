# BOB to answer-envelope (T39)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 11, answer-envelope: T39-19, tests only. Read also K2378, K2383 (their lines in `build/rulings.md`) and `build/plan/draft-T39-L11-shares.md` §1–§3 (answer-envelope).
`test/m/answer-envelope/families.test.mjs`:250–257 pins C-120.1–.19; case-disclosures added C-120.20 `DOCUMENT_COPY_UNDETERMINED`, C-120.21 `DOCUMENT_COPY_PENDING`, C-120.22 `DOCUMENT_NOT_CLEANABLE` in T39. Extend the pin to .20–.22 and assert .21 and .22 decorate with case-disclosures' `DOCUMENT_WORDS['document.refused.pending']` and `['document.refused.clean']` verbatim (`src/case-disclosures/checks.mjs`:32–42). No requirement changes: R7 already places each owner's new rows in its family. The comment at `src/answer-envelope/families.mjs`:77 may also say C-141 now holds `copyBatch`'s C-141.11.
Reading set (mechanics §17): your requirements, that test file, `families.mjs`, and case-disclosures' `checks.mjs`; read whole.
Merge order in L11: queue, setup-words, instance-setup, answer-envelope, plane last.
Inherited reds: the plan's rule 3 list as it stands at your START (read it there); coverage reads setup-words R1–R4 red until T39-16a merges.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
